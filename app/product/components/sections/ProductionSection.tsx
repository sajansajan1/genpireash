"use client";

/**
 * ProductionSection - Consolidated section for Packaging + Care + Quality + Production
 * All sections displayed in a single scrollable view
 * Supports both authenticated (with Zustand store) and public (with techPack prop) modes
 */

import { useState, useCallback } from "react";
import { Package, ClipboardList, ShieldCheck, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTechPack, useProductPageStore } from "@/lib/zustand/product/productPageStore";
import { renderValue } from "@/app/product/shared/utils";
import { SectionSummary } from "../SectionSummary";
import { updateSectionSummary, generateSectionSummary } from "@/app/actions/section-summaries";
import { toast } from "@/components/ui/use-toast";

interface ProductionSectionProps {
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

export function ProductionSection({
  onUpdateSection,
  selectedSection,
  onSectionSelect,
  techPack: techPackProp,
  readOnly = false,
  productId: productIdProp,
}: ProductionSectionProps) {
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
      sectionKey: "production",
      summary,
    });
    if (result.success) {
      updateTechPack({
        sectionSummaries: {
          ...techPack?.sectionSummaries,
          production: summary,
        },
      });
      toast({ title: "Summary saved", description: "Production section summary has been updated." });
    } else {
      toast({ title: "Error", description: result.error || "Failed to save summary", variant: "destructive" });
    }
  }, [productId, techPack?.sectionSummaries, updateTechPack]);

  // Handle AI generation of summary
  const handleGenerateAI = useCallback(async () => {
    if (!productId) return "";
    setIsGeneratingSummary(true);
    try {
      const result = await generateSectionSummary(productId, "production");
      return result.summary || "";
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [productId]);

  const packaging = techPack?.packaging;
  const careInstructions = techPack?.careInstructions;
  const qualityStandards = techPack?.qualityStandards;
  const productionNotes = techPack?.productionNotes;
  const productionLogistics = techPack?.productionLogistics;
  const labels = techPack?.labels;

  // Handle both string and object format for productionNotes
  const isStringNotes = typeof productionNotes === "string";
  const notesObj = isStringNotes ? null : productionNotes;

  return (
    <div className="space-y-6 p-4">
      {/* Section Summary */}
      {!readOnly && productId && (
        <SectionSummary
          sectionKey="production"
          summary={techPack?.sectionSummaries?.production}
          onSave={handleSaveSummary}
          onGenerateAI={handleGenerateAI}
          isGenerating={isGeneratingSummary}
          placeholder="Add a summary explaining the production requirements..."
        />
      )}

      {/* Packaging */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Packaging</h3>
        </div>

        {packaging ? (
          <div className="space-y-4">
            {packaging.description && (
              <p className="text-sm text-muted-foreground">
                {packaging.description}
              </p>
            )}

            {packaging.packagingDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(packaging.packagingDetails).map(
                  ([key, value]: [string, unknown]) => (
                    <div key={key} className="border rounded-md p-3 space-y-1">
                      <h4 className="text-xs font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {renderValue(value)}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {packaging.materials && packaging.materials.length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2">Materials</h4>
                <div className="flex flex-wrap gap-2">
                  {packaging.materials.map((material: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {packaging.dimensions && (
              <div>
                <h4 className="text-xs font-medium mb-1">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  {packaging.dimensions}
                </p>
              </div>
            )}

            {packaging.notes && (
              <div>
                <h4 className="text-xs font-medium mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground italic">
                  {packaging.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No packaging details defined yet
          </p>
        )}
      </section>

      <hr className="border-border" />

      {/* Care Instructions */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Care Instructions</h3>
        </div>

        {careInstructions ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {typeof careInstructions === "string"
              ? careInstructions
              : renderValue(careInstructions)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No care instructions defined yet
          </p>
        )}
      </section>

      <hr className="border-border" />

      {/* Quality Standards */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Quality Standards</h3>
        </div>

        {qualityStandards ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {typeof qualityStandards === "string"
              ? qualityStandards
              : renderValue(qualityStandards)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No quality standards defined yet
          </p>
        )}
      </section>

      <hr className="border-border" />

      {/* Production Notes */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Production Notes</h3>
        </div>

        {productionNotes || productionLogistics ? (
          <div className="space-y-4">
            {/* String-based production notes */}
            {isStringNotes && productionNotes && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {productionNotes}
              </p>
            )}

            {/* Object-based production notes */}
            {notesObj && (
              <>
                {/* Handle summary field - could be string or object */}
                {notesObj.summary && typeof notesObj.summary === "string" && (
                  <div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {notesObj.summary}
                    </p>
                  </div>
                )}

                {/* Handle fromFactorySpecs field - at root or inside summary */}
                {(notesObj.fromFactorySpecs || (notesObj.summary && typeof notesObj.summary === "object" && (notesObj.summary as any).fromFactorySpecs)) && (
                  <div className="bg-muted/30 rounded-md p-3">
                    <h4 className="text-xs font-medium mb-2">From Factory Specs</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {renderValue(notesObj.fromFactorySpecs || (notesObj.summary as any)?.fromFactorySpecs)}
                    </p>
                  </div>
                )}

                {notesObj.manufacturingWarnings &&
                  Array.isArray(notesObj.manufacturingWarnings) &&
                  notesObj.manufacturingWarnings.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium mb-2">
                        Manufacturing Warnings
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {notesObj.manufacturingWarnings.map(
                          (warning: unknown, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground"
                            >
                              {renderValue(warning)}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {notesObj.specialInstructions &&
                  Array.isArray(notesObj.specialInstructions) &&
                  notesObj.specialInstructions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium mb-2">
                        Special Instructions
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {notesObj.specialInstructions.map(
                          (instruction: unknown, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground"
                            >
                              {renderValue(instruction)}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {notesObj.commonDefects &&
                  Array.isArray(notesObj.commonDefects) &&
                  notesObj.commonDefects.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium mb-2">
                        Common Defects to Watch
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {notesObj.commonDefects.map(
                          (defect: unknown, i: number) => (
                            <Badge
                              key={i}
                              variant="destructive"
                              className="text-xs"
                            >
                              {renderValue(defect)}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {notesObj.productionTips &&
                  Array.isArray(notesObj.productionTips) &&
                  notesObj.productionTips.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium mb-2">
                        Production Tips
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {notesObj.productionTips.map(
                          (tip: unknown, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground"
                            >
                              {renderValue(tip)}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {notesObj.materialHandling && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">
                      Material Handling
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {renderValue(notesObj.materialHandling)}
                    </p>
                  </div>
                )}

                {notesObj.wastageAllowance && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">
                      Wastage Allowance
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {renderValue(notesObj.wastageAllowance)}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Production Logistics */}
            {productionLogistics && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">
                  Production Logistics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productionLogistics.MOQ && (
                    <div className="border rounded-md p-3">
                      <p className="text-xs font-medium">MOQ</p>
                      <p className="text-sm text-muted-foreground">
                        {productionLogistics.MOQ}
                      </p>
                    </div>
                  )}
                  {productionLogistics.leadTime && (
                    <div className="border rounded-md p-3">
                      <p className="text-xs font-medium">Lead Time</p>
                      <p className="text-sm text-muted-foreground">
                        {productionLogistics.leadTime}
                      </p>
                    </div>
                  )}
                  {productionLogistics.sampleRequirements && (
                    <div className="border rounded-md p-3">
                      <p className="text-xs font-medium">Sample Requirements</p>
                      <p className="text-sm text-muted-foreground">
                        {productionLogistics.sampleRequirements}
                      </p>
                    </div>
                  )}
                  {productionLogistics.productionCapacity && (
                    <div className="border rounded-md p-3">
                      <p className="text-xs font-medium">Production Capacity</p>
                      <p className="text-sm text-muted-foreground">
                        {productionLogistics.productionCapacity}
                      </p>
                    </div>
                  )}
                </div>

                {productionLogistics.factoryRequirements && (
                  <div className="mt-3">
                    <h5 className="text-xs font-medium mb-2">
                      Factory Requirements
                    </h5>
                    <div className="space-y-2">
                      {productionLogistics.factoryRequirements.certifications
                        ?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {productionLogistics.factoryRequirements.certifications.map(
                              (cert: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {cert}
                                </Badge>
                              )
                            )}
                          </div>
                        )}
                      {productionLogistics.factoryRequirements.skillLevel && (
                        <p className="text-xs text-muted-foreground">
                          Skill Level:{" "}
                          {productionLogistics.factoryRequirements.skillLevel}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No production notes defined yet
          </p>
        )}
      </section>

      <hr className="border-border" />

      {/* Labels / Labelling */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Labelling</h3>
        </div>

        {labels ? (
          <div className="space-y-4">
            {/* Large Centered Logo */}
            {labels.logo &&
              labels.logo !== "Not available" &&
              labels.logo !== "N/A" &&
              labels.logo !== "Logo to be supplied." &&
              labels.logo !== "Logo to be supplied" && (
                <div className="flex justify-center mb-4">
                  <img
                    src={labels.logo}
                    alt="Label Logo"
                    className="h-40 w-auto object-contain rounded-md"
                  />
                </div>
              )}

            {/* Label Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Logo (small inline) */}
              <div className="border rounded-md p-3 space-y-1">
                <h4 className="text-xs font-medium">Logo</h4>
                {(() => {
                  const invalidLogos = [
                    "Not available",
                    "N/A",
                    "Logo to be supplied.",
                    "Logo to be supplied",
                    "",
                    null,
                    undefined,
                  ];
                  return !invalidLogos.includes(labels.logo) ? (
                    <img
                      src={labels.logo}
                      alt="Label Logo"
                      className="h-6 w-auto object-contain"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Not available</p>
                  );
                })()}
              </div>

              {/* Content */}
              {labels.content && (
                <div className="border rounded-md p-3 space-y-1">
                  <h4 className="text-xs font-medium">Content</h4>
                  <p className="text-sm text-muted-foreground">{labels.content}</p>
                </div>
              )}

              {/* Preview */}
              {labels.preview && (
                <div className="border rounded-md p-3 space-y-1">
                  <h4 className="text-xs font-medium">Preview</h4>
                  <p className="text-sm text-muted-foreground">{labels.preview}</p>
                </div>
              )}

              {/* Label Type */}
              {labels.labelType && (
                <div className="border rounded-md p-3 space-y-1">
                  <h4 className="text-xs font-medium">Label Type</h4>
                  <p className="text-sm text-muted-foreground">{labels.labelType}</p>
                </div>
              )}

              {/* Placement */}
              {labels.placement && (
                <div className="border rounded-md p-3 space-y-1">
                  <h4 className="text-xs font-medium">Placement</h4>
                  <p className="text-sm text-muted-foreground">{labels.placement}</p>
                </div>
              )}

              {/* Dimensions */}
              {labels.dimensions && (
                <div className="border rounded-md p-3 space-y-1">
                  <h4 className="text-xs font-medium">Dimensions</h4>
                  <p className="text-sm text-muted-foreground">{labels.dimensions}</p>
                </div>
              )}

              {/* Color Reference */}
              {labels.colorReference && (
                <div className="border rounded-md p-3 space-y-1">
                  <h4 className="text-xs font-medium">Color Reference</h4>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 rounded border"
                      style={{ backgroundColor: labels.colorReference }}
                    />
                    <p className="text-sm text-muted-foreground">
                      {labels.colorReference}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No labelling details defined yet
          </p>
        )}
      </section>
    </div>
  );
}

export default ProductionSection;
