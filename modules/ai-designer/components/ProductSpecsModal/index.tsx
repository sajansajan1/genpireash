/**
 * ProductSpecsModal Component
 * Shows AI-recommended dimensions and materials, allows user to approve or customize
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Check, Ruler, Package, Info, Layers, Plus, Trash2 } from "lucide-react";
import {
  generateProductDimensions,
  saveProductDimensions,
  type DimensionsData,
  type ProductDimensions,
} from "@/app/actions/product-dimensions";
import {
  generateProductMaterials,
  saveProductMaterials,
  type MaterialsData,
  type ProductMaterial,
} from "@/app/actions/product-materials";

// Re-export types for external use
export type { DimensionsData, ProductDimensions, MaterialsData, ProductMaterial };

interface ProductSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (dimensions: DimensionsData, materials?: MaterialsData) => void;
  productId: string;
  productType?: string;
  productDescription?: string;
  existingDimensions?: DimensionsData | null;
  existingMaterials?: MaterialsData | null;
  frontImageUrl?: string;
}

const UNIT_OPTIONS = {
  length: ["cm", "mm", "in", "m", "ft"],
  weight: ["g", "kg", "oz", "lb"],
  volume: ["ml", "L", "fl oz", "gal"],
};

export function ProductSpecsModal({
  isOpen,
  onClose,
  onApprove,
  productId,
  productType,
  productDescription,
  existingDimensions,
  existingMaterials,
  frontImageUrl,
}: ProductSpecsModalProps) {
  const [activeTab, setActiveTab] = useState<"dimensions" | "materials">("dimensions");

  // Dimensions state
  const [isDimensionsLoading, setIsDimensionsLoading] = useState(false);
  const [dimensions, setDimensions] = useState<DimensionsData | null>(null);
  const [editedDimensions, setEditedDimensions] = useState<ProductDimensions | null>(null);
  const [dimensionsError, setDimensionsError] = useState<string | null>(null);

  // Materials state
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialsData | null>(null);
  const [editedMaterials, setEditedMaterials] = useState<ProductMaterial[] | null>(null);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  // Default dimensions structure with all required fields
  const getDefaultDimensionsStatic = (): ProductDimensions => ({
    height: { value: "", unit: "cm" },
    width: { value: "", unit: "cm" },
    length: { value: "", unit: "cm" },
    weight: { value: "", unit: "g" },
  });

  // Initialize dimensions when modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingDimensions) {
        setDimensions(existingDimensions);
        const startingDimensions = existingDimensions.user || existingDimensions.recommended;
        // Merge with defaults to ensure all required fields exist
        const mergedDimensions = {
          ...getDefaultDimensionsStatic(),
          ...startingDimensions,
        };
        setEditedDimensions(mergedDimensions);
      } else {
        fetchRecommendedDimensions();
      }

      if (existingMaterials) {
        setMaterials(existingMaterials);
        const startingMaterials = existingMaterials.user || existingMaterials.recommended;
        if (startingMaterials) {
          setEditedMaterials([...startingMaterials]);
        }
      } else {
        fetchRecommendedMaterials();
      }
    }
  }, [isOpen, existingDimensions, existingMaterials]);

  // Update edited dimensions when dimensions state changes
  useEffect(() => {
    if (dimensions && !editedDimensions) {
      const startingDimensions = dimensions.user || dimensions.recommended;
      // Merge with defaults to ensure all required fields exist
      const mergedDimensions = {
        ...getDefaultDimensionsStatic(),
        ...startingDimensions,
      };
      setEditedDimensions(mergedDimensions);
    }
  }, [dimensions, editedDimensions]);

  // Update edited materials when materials state changes
  useEffect(() => {
    if (materials && !editedMaterials) {
      const startingMaterials = materials.user || materials.recommended;
      if (startingMaterials) {
        setEditedMaterials([...startingMaterials]);
      }
    }
  }, [materials, editedMaterials]);

  const fetchRecommendedDimensions = async () => {
    setIsDimensionsLoading(true);
    setDimensionsError(null);

    try {
      const result = await generateProductDimensions({
        productId,
        productType,
        productDescription,
        frontImageUrl,
      });

      if (result.success && result.data) {
        setDimensions(result.data);
      } else {
        setDimensionsError(result.error || "Failed to generate dimensions");
      }
    } catch (err) {
      setDimensionsError("Failed to fetch recommended dimensions");
      console.error("Error fetching dimensions:", err);
    } finally {
      setIsDimensionsLoading(false);
    }
  };

  const fetchRecommendedMaterials = async () => {
    setIsMaterialsLoading(true);
    setMaterialsError(null);

    try {
      const result = await generateProductMaterials({
        productId,
        productType,
        productDescription,
        frontImageUrl,
      });

      if (result.success && result.data) {
        setMaterials(result.data);
      } else {
        setMaterialsError(result.error || "Failed to generate materials");
      }
    } catch (err) {
      setMaterialsError("Failed to fetch recommended materials");
      console.error("Error fetching materials:", err);
    } finally {
      setIsMaterialsLoading(false);
    }
  };

  const handleApprove = async () => {
    // Save dimensions
    let finalDimensions: DimensionsData | undefined;
    if (dimensions) {
      finalDimensions = {
        ...dimensions,
        user: editedDimensions,
        source: "user_defined",
        approvedAt: new Date().toISOString(),
      };

      try {
        const saveResult = await saveProductDimensions(productId, finalDimensions);
        if (!saveResult.success) {
          console.error("Failed to save dimensions:", saveResult.error);
        }
      } catch (err) {
        console.error("Error saving dimensions:", err);
      }
    }

    // Save materials
    let finalMaterials: MaterialsData | undefined;
    if (materials) {
      finalMaterials = {
        ...materials,
        user: editedMaterials,
        source: "user_defined",
        approvedAt: new Date().toISOString(),
      };

      try {
        const saveResult = await saveProductMaterials(productId, finalMaterials);
        if (!saveResult.success) {
          console.error("Failed to save materials:", saveResult.error);
        }
      } catch (err) {
        console.error("Error saving materials:", err);
      }
    }

    onApprove(finalDimensions!, finalMaterials);
  };

  const handleDimensionChange = (
    field: keyof ProductDimensions,
    subField: "value" | "unit",
    value: string
  ) => {
    // Initialize editedDimensions if not set
    const currentDimensions = editedDimensions || getDefaultDimensionsStatic();
    const defaultUnit = field === "weight" ? "g" : field === "volume" ? "ml" : "cm";

    setEditedDimensions({
      ...currentDimensions,
      [field]: {
        value: subField === "value" ? value : ((currentDimensions[field] as any)?.value || ""),
        unit: subField === "unit" ? value : ((currentDimensions[field] as any)?.unit || defaultUnit),
      },
    });
  };

  const handleMaterialChange = (
    index: number,
    field: keyof ProductMaterial,
    value: string
  ) => {
    if (!editedMaterials) return;

    const updated = [...editedMaterials];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setEditedMaterials(updated);
  };

  const handleAddMaterial = () => {
    if (!editedMaterials) {
      setEditedMaterials([{
        component: "",
        material: "",
        specification: "",
      }]);
    } else {
      setEditedMaterials([
        ...editedMaterials,
        {
          component: "",
          material: "",
          specification: "",
        },
      ]);
    }
  };

  const handleRemoveMaterial = (index: number) => {
    if (!editedMaterials) return;
    const updated = editedMaterials.filter((_, i) => i !== index);
    setEditedMaterials(updated);
  };

  const renderDimensionRow = (
    label: string,
    field: keyof ProductDimensions,
    icon: React.ReactNode,
    unitType: "length" | "weight" | "volume",
    required: boolean = false
  ) => {
    const dimValue = editedDimensions?.[field] as any;
    const defaultUnit = unitType === "weight" ? "g" : "cm";
    const currentValue = dimValue?.value || "";
    const currentUnit = dimValue?.unit || defaultUnit;

    // Skip optional fields if they don't have a value
    if (!required && !currentValue) return null;

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-md shadow-sm">
          {icon}
        </div>
        <div className="flex-1">
          <Label className="text-xs text-gray-500 uppercase tracking-wide">
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="text"
              value={currentValue}
              onChange={(e) => handleDimensionChange(field, "value", e.target.value)}
              className="h-8 text-sm"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            <Select
              value={currentUnit}
              onValueChange={(v) => handleDimensionChange(field, "unit", v)}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS[unitType].map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  const renderMaterialRow = (material: ProductMaterial, index: number) => {
    return (
      <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 bg-white rounded-md shadow-sm">
              <Layers className="h-3 w-3 text-gray-400" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Material {index + 1}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            onClick={() => handleRemoveMaterial(index)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-gray-400">Component</Label>
            <Input
              type="text"
              value={material.component}
              onChange={(e) => handleMaterialChange(index, "component", e.target.value)}
              placeholder="e.g., Body, Lining"
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-gray-400">Material</Label>
            <Input
              type="text"
              value={material.material}
              onChange={(e) => handleMaterialChange(index, "material", e.target.value)}
              placeholder="e.g., Leather, Cotton"
              className="h-7 text-xs"
            />
          </div>
        </div>

        <div>
          <Label className="text-[10px] text-gray-400">Specification</Label>
          <Input
            type="text"
            value={material.specification}
            onChange={(e) => handleMaterialChange(index, "specification", e.target.value)}
            placeholder="e.g., Full-grain, 1.2mm thickness"
            className="h-7 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-gray-400">Color (optional)</Label>
            <Input
              type="text"
              value={material.color || ""}
              onChange={(e) => handleMaterialChange(index, "color", e.target.value)}
              placeholder="e.g., Black"
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-gray-400">Finish (optional)</Label>
            <Input
              type="text"
              value={material.finish || ""}
              onChange={(e) => handleMaterialChange(index, "finish", e.target.value)}
              placeholder="e.g., Matte"
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>
    );
  };

  const isLoading = isDimensionsLoading || isMaterialsLoading;
  const hasData = dimensions || materials;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#1C1917]" />
            Product Specifications
          </DialogTitle>
          <DialogDescription>
            Review and customize the AI-recommended specifications for your product.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "dimensions" | "materials")} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="dimensions" className="flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5" />
              Dimensions
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Materials
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0 py-4">
            <TabsContent value="dimensions" className="mt-0 h-full">
              {isDimensionsLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1C1917]" />
                  <p className="text-sm text-gray-500">Analyzing product dimensions...</p>
                  <p className="text-xs text-gray-400">Using AI to determine market-standard sizes</p>
                </div>
              ) : dimensionsError ? (
                <div className="text-center py-6">
                  <p className="text-red-500 mb-4">{dimensionsError}</p>
                  <Button variant="outline" onClick={fetchRecommendedDimensions}>
                    Try Again
                  </Button>
                </div>
              ) : dimensions ? (
                <div className="space-y-4">
                  {/* Market Standard Info */}
                  <div className="flex items-start gap-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <Info className="h-4 w-4 text-[#1C1917] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {dimensions.productType || "Product"} - Market Standard
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {dimensions.marketStandard || "Based on industry standard dimensions"}
                      </p>
                    </div>
                  </div>

                  {/* Dimensions Grid - Core dimensions are always shown */}
                  <div className="space-y-2">
                    {renderDimensionRow("Height", "height", <Ruler className="h-4 w-4 text-gray-400" />, "length", true)}
                    {renderDimensionRow("Width", "width", <Ruler className="h-4 w-4 text-gray-400 rotate-90" />, "length", true)}
                    {renderDimensionRow("Length/Depth", "length", <Package className="h-4 w-4 text-gray-400" />, "length", true)}
                    {renderDimensionRow("Weight", "weight", <Package className="h-4 w-4 text-gray-400" />, "weight", true)}
                    {/* Volume is optional */}
                    {renderDimensionRow("Volume", "volume", <Package className="h-4 w-4 text-gray-400" />, "volume", false)}

                    {/* Additional Dimensions */}
                    {(editedDimensions?.additionalDimensions || dimensions.recommended?.additionalDimensions)?.map((dim, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-md shadow-sm">
                          <Ruler className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">
                            {dim.name}
                          </Label>
                          <p className="text-sm font-medium text-gray-900">
                            {dim.value} {dim.unit}
                          </p>
                          {dim.description && (
                            <p className="text-xs text-gray-500">{dim.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Source Badge */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    {dimensions.user && Object.keys(dimensions.user).length > 0 ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">User-defined dimensions</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>AI-generated based on product analysis</span>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="materials" className="mt-0 h-full">
              {isMaterialsLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1C1917]" />
                  <p className="text-sm text-gray-500">Analyzing product materials...</p>
                  <p className="text-xs text-gray-400">Using AI to identify materials and specifications</p>
                </div>
              ) : materialsError ? (
                <div className="text-center py-6">
                  <p className="text-red-500 mb-4">{materialsError}</p>
                  <Button variant="outline" onClick={fetchRecommendedMaterials}>
                    Try Again
                  </Button>
                </div>
              ) : editedMaterials && editedMaterials.length > 0 ? (
                <div className="space-y-3">
                  {/* Materials List */}
                  {editedMaterials.map((material, index) => renderMaterialRow(material, index))}

                  {/* Add Material Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={handleAddMaterial}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Material
                  </Button>

                  {/* Source Badge */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                    {materials?.user && materials.user.length > 0 ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">User-defined materials</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>AI-generated based on product analysis</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No materials detected</p>
                  <Button variant="outline" onClick={handleAddMaterial}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Material Manually
                  </Button>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex gap-2 sm:gap-2 flex-shrink-0">
          {hasData && !isLoading && (
            <Button onClick={handleApprove} className="flex items-center gap-2 bg-[#1C1917] hover:bg-gray-800">
              <Package className="h-4 w-4" />
              Save Specs
            </Button>
          )}
          {!hasData && !isLoading && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProductSpecsModal;
