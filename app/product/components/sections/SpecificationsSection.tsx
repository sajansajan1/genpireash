"use client";

/**
 * SpecificationsSection - Consolidated section for Overview + Materials + Measurements + Sizes
 * All sections displayed in a single scrollable view
 * Supports both authenticated (with Zustand store) and public (with techPack prop) modes
 */

import { useState, useCallback } from "react";
import { FileText, Layers, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTechPack, useProductPageStore } from "@/lib/zustand/product/productPageStore";
import { SectionSummary } from "../SectionSummary";
import { updateSectionSummary, generateSectionSummary } from "@/app/actions/section-summaries";
import { toast } from "@/components/ui/use-toast";

interface SpecificationsSectionProps {
  onUpdateSection?: (key: string, value: any) => void;
  selectedSection?: string | null;
  onSectionSelect?: (section: string) => void;
  /** Optional techPack data for public/read-only mode */
  techPack?: any;
  /** Read-only mode for public pages */
  readOnly?: boolean;
  /** Product ID for saving summaries */
  productId?: string;
}

export function SpecificationsSection({
  onUpdateSection,
  selectedSection,
  onSectionSelect,
  techPack: techPackProp,
  readOnly = false,
  productId: productIdProp,
}: SpecificationsSectionProps) {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Use prop if provided, otherwise use Zustand store
  const storeTechPack = useTechPack();
  const storeProjectId = useProductPageStore((state) => state.projectId);
  const updateTechPack = useProductPageStore((state) => state.updateTechPack);
  const techPack = techPackProp ?? storeTechPack;
  const productId = productIdProp ?? storeProjectId;

  // Handle saving section summary
  const handleSaveSummary = useCallback(async (summary: string) => {
    if (!productId) return;
    const result = await updateSectionSummary({
      productId,
      sectionKey: "specifications",
      summary,
    });
    if (result.success) {
      updateTechPack({
        sectionSummaries: {
          ...techPack?.sectionSummaries,
          specifications: summary,
        },
      });
      toast({ title: "Summary saved", description: "Specifications section summary has been updated." });
    } else {
      toast({ title: "Error", description: result.error || "Failed to save summary", variant: "destructive" });
    }
  }, [productId, techPack?.sectionSummaries, updateTechPack]);

  // Handle AI generation of summary
  const handleGenerateAI = useCallback(async () => {
    if (!productId) return "";
    setIsGeneratingSummary(true);
    try {
      const result = await generateSectionSummary(productId, "specifications");
      return result.summary || "";
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [productId]);
  const materials = Array.isArray(techPack?.materials) ? techPack.materials : [];
  const dimensions = techPack?.dimensions || {};
  const dimensionEntries = Object.entries(dimensions);
  const sizeRange = techPack?.sizeRange;
  const sizes = sizeRange?.sizes || [];

  return (
    <div className="space-y-6 p-4">
      {/* Section Summary */}
      {!readOnly && productId && (
        <SectionSummary
          sectionKey="specifications"
          summary={techPack?.sectionSummaries?.specifications}
          onSave={handleSaveSummary}
          onGenerateAI={handleGenerateAI}
          isGenerating={isGeneratingSummary}
          placeholder="Add a summary explaining the product specifications..."
        />
      )}

      {/* Product Overview */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Product Overview</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {techPack?.productOverview || "No product overview available."}
        </p>
      </section>

      <hr className="border-border" />

      {/* Materials */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Materials</h3>
          {materials.length > 0 && (
            <Badge variant="secondary">{materials.length} materials</Badge>
          )}
        </div>

        {materials.length > 0 ? (
          <div className="space-y-2">
            {materials.map((material: any, index: number) => (
              <div key={index} className="border rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{material.component}</p>
                  {material.unitCost && (
                    <Badge variant="outline" className="text-xs">
                      {material.unitCost}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-primary font-medium">
                  {material.material}
                </p>
                {material.specification && (
                  <p className="text-xs text-muted-foreground">
                    {material.specification}
                  </p>
                )}
                {material.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    {material.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No materials defined yet</p>
        )}
      </section>

      <hr className="border-border" />

      {/* Measurements */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Ruler className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Measurements & Dimensions</h3>
          {dimensionEntries.length > 0 && (
            <Badge variant="secondary">{dimensionEntries.length} measurements</Badge>
          )}
        </div>

        {/* Category-based dimension explainer - Detailed for stitchers */}
        {dimensionEntries.length > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📏 Measurement Guide for Production:
            </p>
            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              {(techPack?.category_Subcategory?.toLowerCase().includes("shirt") ||
                techPack?.category_Subcategory?.toLowerCase().includes("apparel") ||
                techPack?.category_Subcategory?.toLowerCase().includes("clothing") ||
                techPack?.category_Subcategory?.toLowerCase().includes("top")) ? (
                <>
                  <p><strong>Length:</strong> Measure from collar seam (HPS - High Point Shoulder) to bottom hem</p>
                  <p><strong>Width/Chest:</strong> Measure across chest, 2.5cm below armhole seam, pit to pit</p>
                  <p><strong>Sleeve Length:</strong> Measure from shoulder seam to cuff edge</p>
                  <p><strong>Shoulder:</strong> Measure from shoulder point to shoulder point across back</p>
                </>
              ) : techPack?.category_Subcategory?.toLowerCase().includes("pant") ||
                techPack?.category_Subcategory?.toLowerCase().includes("trouser") ? (
                <>
                  <p><strong>Length:</strong> Measure from top of waistband to bottom hem (inseam or outseam)</p>
                  <p><strong>Waist:</strong> Measure across waistband, edge to edge, relaxed</p>
                  <p><strong>Hip:</strong> Measure across hip area, typically 20cm below waist</p>
                  <p><strong>Inseam:</strong> Measure from crotch seam to bottom hem along inside leg</p>
                </>
              ) : techPack?.category_Subcategory?.toLowerCase().includes("dress") ? (
                <>
                  <p><strong>Length:</strong> Measure from HPS (shoulder) to bottom hem</p>
                  <p><strong>Bust:</strong> Measure across chest at fullest point, arm to arm</p>
                  <p><strong>Waist:</strong> Measure at natural waist, narrowest point</p>
                  <p><strong>Hip:</strong> Measure at fullest point of hip</p>
                </>
              ) : techPack?.category_Subcategory?.toLowerCase().includes("shoe") ||
                techPack?.category_Subcategory?.toLowerCase().includes("footwear") ? (
                <>
                  <p><strong>Length:</strong> Measure from heel to toe tip (insole length)</p>
                  <p><strong>Width:</strong> Measure at widest point of ball area</p>
                  <p><strong>Height:</strong> Measure from insole to top of upper (for boots)</p>
                </>
              ) : (
                <>
                  <p><strong>Length:</strong> Longest horizontal dimension of the product</p>
                  <p><strong>Width/Breadth:</strong> Perpendicular to length, side to side</p>
                  <p><strong>Height:</strong> Vertical dimension from base to top</p>
                </>
              )}
            </div>
          </div>
        )}

        {dimensionEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border rounded-lg">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Dimension</th>
                  <th className="text-left p-3 font-semibold">Base Size Value</th>
                  <th className="text-left p-3 font-semibold">Tolerance</th>
                  <th className="text-left p-3 font-semibold">How to Measure</th>
                </tr>
              </thead>
              <tbody>
                {(
                  dimensionEntries as [
                    string,
                    { value: string; tolerance?: string; description?: string }
                  ][]
                ).map(([key, data]) => {
                  // Generate detailed measurement instructions based on dimension key
                  const getMeasurementInstruction = (dimKey: string) => {
                    const category = techPack?.category_Subcategory?.toLowerCase() || "";

                    if (category.includes("shirt") || category.includes("top") || category.includes("apparel") || category.includes("clothing")) {
                      switch (dimKey.toLowerCase()) {
                        case "length":
                          return "From HPS (collar seam) straight down to bottom hem";
                        case "width":
                        case "chest":
                          return "Across chest, pit to pit, 2.5cm below armhole";
                        case "sleeve":
                          return "From shoulder seam to cuff edge along outer arm";
                        case "shoulder":
                          return "From shoulder point to point across back yoke";
                        default:
                          return data?.description || "Measure as per standard specification";
                      }
                    } else if (category.includes("pant") || category.includes("trouser")) {
                      switch (dimKey.toLowerCase()) {
                        case "length":
                          return "From top of waistband to bottom hem (inseam or outseam)";
                        case "waist":
                          return "Across waistband, edge to edge, relaxed";
                        case "hip":
                          return "Across hip area, typically 20cm below waist";
                        case "inseam":
                          return "From crotch seam to bottom hem along inside leg";
                        default:
                          return data?.description || "Measure as per standard specification";
                      }
                    } else if (category.includes("dress")) {
                      switch (dimKey.toLowerCase()) {
                        case "length":
                          return "From HPS (shoulder) to bottom hem";
                        case "bust":
                          return "Across chest at fullest point, arm to arm";
                        case "waist":
                          return "At natural waist, narrowest point";
                        case "hip":
                          return "At fullest point of hip";
                        default:
                          return data?.description || "Measure as per standard specification";
                      }
                    } else if (category.includes("shoe") || category.includes("footwear")) {
                      switch (dimKey.toLowerCase()) {
                        case "length":
                          return "From heel to toe tip (insole length)";
                        case "width":
                          return "At widest point of ball area";
                        case "height":
                          return "From insole to top of upper (for boots)";
                        default:
                          return data?.description || "Measure as per standard specification";
                      }
                    } else {
                      switch (dimKey.toLowerCase()) {
                        case "length":
                          return "Longest horizontal dimension of the product";
                        case "width":
                        case "breadth":
                          return "Perpendicular to length, side to side";
                        case "height":
                          return "Vertical dimension from base to top";
                        default:
                          return data?.description || "Measure as per standard specification";
                      }
                    }
                  };

                  return (
                    <tr key={key} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium capitalize">
                        {key === "width" ? "Breadth (Width)" : key.replace(/_/g, " ")}
                      </td>
                      <td className="p-3 font-mono font-semibold">
                        {data?.value || "N/A"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {data?.tolerance || "±0.5 cm"}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {getMeasurementInstruction(key)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No measurements defined yet</p>
        )}
      </section>

      <hr className="border-border" />

      {/* Size Range with Grading Table */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Ruler className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Size Range & Grading</h3>
          {sizes.length > 0 && (
            <Badge variant="secondary">{sizes.length} sizes</Badge>
          )}
        </div>

        {sizes.length > 0 || sizeRange?.gradingLogic ? (
          <div className="space-y-4">
            {/* Grading Rules Explainer */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-2">
                📐 Size Grading Rules:
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {sizeRange?.gradingLogic || "Standard grading: Each size increases by 2 cm (chest) and 1.5 cm (length). Base size measurements are provided above. Adjust per size as follows:"}
              </p>
            </div>

            {/* Size Grading Table */}
            {sizes.length > 0 && dimensionEntries.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border rounded-lg">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-semibold">Measurement</th>
                      {sizes.filter((s: string) => s && s.length < 20).map((size: string, i: number) => (
                        <th key={i} className="text-center p-2 font-semibold min-w-[60px]">
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dimensionEntries
                      .filter(([key]) => key !== "weight") // Exclude weight from grading
                      .map(([key, data]: [string, any]) => {
                        // Parse base value and generate graded values
                        const baseValueStr = data?.value || "0";
                        const numericMatch = baseValueStr.match(/[\d.]+/);
                        const baseValue = numericMatch ? parseFloat(numericMatch[0]) : 0;
                        const unit = baseValueStr.replace(/[\d.-]/g, "").trim() || "cm";

                        // Grading increment (typically 2cm for chest, 1.5cm for length)
                        const gradeIncrement = key.includes("length") ? 1.5 :
                          key.includes("sleeve") ? 1 : 2;

                        // Find base size index (usually middle or "M")
                        const validSizes = sizes.filter((s: string) => s && s.length < 20);
                        const baseSizeIndex = validSizes.findIndex((s: string) =>
                          s.toUpperCase().includes("M") || s.includes("32") || s.includes("8")
                        );
                        const baseIdx = baseSizeIndex >= 0 ? baseSizeIndex : Math.floor(validSizes.length / 2);

                        return (
                          <tr key={key} className="border-b hover:bg-muted/30">
                            <td className="p-2 font-medium capitalize">
                              {key === "width" ? "Breadth" : key.replace(/_/g, " ")}
                            </td>
                            {validSizes.map((size: string, idx: number) => {
                              const difference = idx - baseIdx;
                              const gradedValue = baseValue > 0
                                ? (baseValue + (difference * gradeIncrement)).toFixed(1)
                                : baseValueStr;

                              return (
                                <td key={size} className="text-center p-2 font-mono">
                                  {baseValue > 0 ? `${gradedValue} ${unit}` : "—"}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Available Sizes */}
            <div>
              <h4 className="text-xs font-medium mb-2">Available Sizes:</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.filter((s: string) => s && s.length < 20).map((size: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-sm px-3 py-1">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No sizes defined yet</p>
        )}
      </section>
    </div>
  );
}

export default SpecificationsSection;
