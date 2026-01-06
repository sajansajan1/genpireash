"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Diamond, Eye, ToyBrick, Sofa, ShoppingBag, Shirt, Sparkle, Store, Tag, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProductsLoading from "./loading";
import { useadminproductIdeasStore } from "@/lib/zustand/admin/techpacks/getAllTechpacks";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const categories = [
  { name: "Apparel", icon: Shirt, key: "apparel" },
  { name: "Jewelry (custom)", icon: Diamond, key: "jewelry" },
  { name: "Toys/Plush", icon: ToyBrick, key: "toys" },
  { name: "Furniture/Upholstery", icon: Sofa, key: "furniture" },
  { name: "Beauty & Cosmetics", icon: Sparkle, key: "beauty" },
  { name: "Home Goods", icon: Store, key: "goods" },
  { name: "Accessories", icon: Tag, key: "accessories" },
  { name: "Footwear", icon: ShoppingBag, key: "footwear" },
];

export default function ProductCard() {
  const [selectedCat, setSelectedCat] = useState(categories[0].key);
  const [openModal, setOpenModal] = useState<any>(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { productIdeas, fetchProductIdeas, loadingProductIdeas, errorProductIdeas } = useadminproductIdeasStore();

  useEffect(() => {
    if (!productIdeas) {
      fetchProductIdeas();
    }
  }, [productIdeas, fetchProductIdeas]);

  // Transform products for UI display
  const mapProducts = (product: any) => {
    return {
      id: product.id,
      title: product.product_name || product.tech_pack?.productName,
      productOverview: product.product_description || product.tech_pack?.productOverview,
      images: product.image_data,
      materials: product.tech_pack?.materials || [],
      sizeRange: product.tech_pack?.sizeRange || {},
      productionNotes: product.tech_pack?.productionNotes,
      careInstructions: product.tech_pack?.careInstructions,
      qualityStandards: product.tech_pack?.qualityStandards,
      // Keep original product data for updates
      originalData: product,
    };
  };

  // Filtering products with transformation
  const filteredProducts = productIdeas?.filter((p) => p.category === selectedCat)?.map(mapProducts);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      ...product,
      // Ensure we have the original data for update
      originalData: product.originalData,
    });
    setOpenModal(true);
    setEdit(true);
  };

  const handleView = (product: any) => {
    setSelectedProduct(product);
    setFormData(product);
    setOpenModal(true);
    setEdit(false);
  };

  const handleSave = async () => {
    try {
      const originalData = formData.originalData;

      // Prepare payload
      const payload = {
        id: originalData.id,
        product_name: formData.title,
        product_description: formData.productOverview,
        image_data: originalData.image_data,
        tech_pack: {
          ...originalData.tech_pack,
          productName: formData.title,
          productOverview: formData.productOverview,
          materials: formData.materials,
          sizeRange: formData.sizeRange,
          productionNotes: formData.productionNotes,
          careInstructions: formData.careInstructions,
          qualityStandards: formData.qualityStandards,
        },
      };

      // ---- 🔍 EARLY EXIT IF NOTHING CHANGED ----
      const isSame =
        JSON.stringify(payload) ===
        JSON.stringify({
          id: originalData.id,
          product_name: originalData.product_name,
          product_description: originalData.product_description,
          image_data: originalData.image_data,
          tech_pack: originalData.tech_pack,
        });

      if (isSame) {
        toast({
          variant: "destructive",
          description: "No changes detected.",
        });

        return;
      }

      setLoading(true);

      const res = await fetch("/api/admin/tech-pack/update-tech-pack", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        toast({
          variant: "destructive",
          description: "Error updating product.",
        });
        return;
      }

      toast({
        variant: "default",
        description: "Product updated successfully.",
      });
      setEdit(false);
      setOpenModal(false);
      fetchProductIdeas(); // refresh store
    } catch (err) {
      console.error("Update failed", err);
      toast({
        variant: "destructive",
        description: "Failed to update product.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProductIdeas || errorProductIdeas) {
    return <ProductsLoading />;
  }

  return (
    <TooltipProvider>
      <>
        <div className="mb-6 flex flex-wrap gap-4 text-sm font-medium text-[#1C1917]">
          {categories.map((category, idx) => {
            const IconComponent = category.icon;
            const active = selectedCat === category.key;
            return (
              <Button
                key={idx}
                className={`flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer transition`}
                variant={active ? "default" : "ghost"}
                onClick={() => setSelectedCat(category.key)}
              >
                <span className="text-lg">
                  <IconComponent className="h-5 w-5" />
                </span>
                <span>{category.name}</span>
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts?.map((product, idx) => (
            <Card key={idx} className="flex flex-col h-full overflow-hidden p-4">
              <div className="flex gap-2 justify-center mb-4">
                {/* Front view */}
                <div className="bg-muted rounded overflow-hidden cursor-pointer w-24 h-24 sm:w-28 sm:h-28">
                  <img
                    src={product?.images?.front?.url}
                    alt={`${product?.title} front view`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = `/placeholder.png`)}
                  />
                </div>

                {/* Back view */}
                <div className="bg-muted rounded overflow-hidden cursor-pointer w-24 h-24 sm:w-28 sm:h-28">
                  <img
                    src={product.images?.back?.url}
                    alt={`${product.title} back view`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = `/placeholder.png`)}
                  />
                </div>

                {/* Side view */}
                <div className="bg-muted rounded overflow-hidden cursor-pointer w-24 h-24 sm:w-28 sm:h-28">
                  <img
                    src={product.images?.side?.url}
                    alt={`${product.title} side view`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = `/placeholder.png`)}
                  />
                </div>
              </div>

              <CardTitle className="text-sm sm:text-sm font-semibold truncate text-[#1C1917]">
                {product?.title}
              </CardTitle>

              <CardDescription className="text-xs text-[#1C1917] mt-1 line-clamp-3">
                {product.productOverview}
              </CardDescription>

              <div className="mt-3 flex justify-center gap-2">
                <Button variant="outline" onClick={() => handleView(product)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" onClick={() => handleEdit(product)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <AlertDialog open={openModal} onOpenChange={setOpenModal}>
          <AlertDialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-3xl scrollbar-hide">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">
                {edit ? "Edit Product" : selectedProduct?.title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {edit ? "Make changes to the product details below." : selectedProduct?.productOverview}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* IMAGES */}
            <div className="grid grid-cols-3 gap-3 my-4">
              {selectedProduct?.images &&
                Object.entries(selectedProduct.images).map(([view, data]: [string, any]) => (
                  <div key={view} className="w-full h-32 overflow-hidden rounded border">
                    <img
                      src={data.url}
                      alt={`${selectedProduct?.title} ${view} view`}
                      className="w-full h-full object-contain"
                      onError={(e) => (e.currentTarget.src = `/placeholder.png`)}
                    />
                  </div>
                ))}
            </div>

            {/* MATERIALS */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Materials</h3>
              {selectedProduct?.materials?.map((m: any, i: number) => (
                <div key={i} className="border p-3 rounded my-2 bg-muted/30">
                  {edit ? (
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium">Component</label>
                        <Input
                          value={m.component || ""}
                          onChange={(e) => {
                            const newMaterials = [...formData.materials];
                            newMaterials[i].component = e.target.value;
                            handleChange("materials", newMaterials);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Material</label>
                        <Input
                          value={m.material || ""}
                          onChange={(e) => {
                            const newMaterials = [...formData.materials];
                            newMaterials[i].material = e.target.value;
                            handleChange("materials", newMaterials);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                          value={m.notes || ""}
                          onChange={(e) => {
                            const newMaterials = [...formData.materials];
                            newMaterials[i].notes = e.target.value;
                            handleChange("materials", newMaterials);
                          }}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Specification</label>
                        <Input
                          value={m.specification || ""}
                          onChange={(e) => {
                            const newMaterials = [...formData.materials];
                            newMaterials[i].specification = e.target.value;
                            handleChange("materials", newMaterials);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>
                        <strong>Component:</strong> {m.component}
                      </p>
                      <p>
                        <strong>Material:</strong> {m.material}
                      </p>
                      <p>
                        <strong>Notes:</strong> {m.notes}
                      </p>
                      <p>
                        <strong>Specification:</strong> {m.specification}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
            {/* BASIC INFO */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Product Name</h3>
              {edit ? (
                <Input
                  value={formData?.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Product name"
                />
              ) : (
                <p>{selectedProduct?.title}</p>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Product Overview</h3>
              {edit ? (
                <Textarea
                  value={formData?.productOverview || ""}
                  onChange={(e) => handleChange("productOverview", e.target.value)}
                  placeholder="Product overview"
                  rows={3}
                />
              ) : (
                <p>{selectedProduct?.productOverview}</p>
              )}
            </div>

            {/* SIZE RANGE */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Size Range</h3>
              {edit ? (
                <Input
                  value={Array.isArray(formData?.sizeRange?.sizes) ? formData.sizeRange.sizes.join(", ") : ""}
                  onChange={(e) =>
                    handleChange("sizeRange", {
                      ...formData.sizeRange,
                      sizes: e.target.value.split(",").map((s: string) => s.trim()),
                    })
                  }
                  placeholder="Enter sizes separated by commas"
                />
              ) : (
                <p>
                  {Array.isArray(selectedProduct?.sizeRange?.sizes) ? selectedProduct.sizeRange.sizes.join(", ") : ""}
                </p>
              )}
            </div>

            {/* PRODUCTION NOTES */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Production Notes</h3>
              {edit ? (
                <Textarea
                  value={formData?.productionNotes || ""}
                  onChange={(e) => handleChange("productionNotes", e.target.value)}
                  placeholder="Production notes"
                  rows={3}
                />
              ) : (
                <p>{selectedProduct?.productionNotes}</p>
              )}
            </div>

            {/* CARE INSTRUCTIONS */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Care Instructions</h3>
              {edit ? (
                <Textarea
                  value={formData?.careInstructions || ""}
                  onChange={(e) => handleChange("careInstructions", e.target.value)}
                  placeholder="Care instructions"
                  rows={3}
                />
              ) : (
                <p>{selectedProduct?.careInstructions}</p>
              )}
            </div>

            {/* QUALITY STANDARDS */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Quality Standards</h3>
              {edit ? (
                <Textarea
                  value={formData?.qualityStandards || ""}
                  onChange={(e) => handleChange("qualityStandards", e.target.value)}
                  placeholder="Quality standards"
                  rows={3}
                />
              ) : (
                <p>{selectedProduct?.qualityStandards}</p>
              )}
            </div>

            <AlertDialogFooter className="mt-5">
              <AlertDialogCancel
                onClick={() => {
                  setEdit(false);
                  setOpenModal(false);
                }}
              >
                {edit ? "Cancel" : "Close"}
              </AlertDialogCancel>
              {edit && <Button onClick={handleSave}>{loading ? "Saving..." : "Save Changes"}</Button>}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </TooltipProvider>
  );
}
