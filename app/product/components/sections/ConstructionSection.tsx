"use client";

/**
 * ConstructionSection - Consolidated section for Construction + Hardware
 * All sections displayed in a single scrollable view
 * Supports both authenticated (with Zustand store) and public (with techPack prop) modes
 */

import { useState, useCallback } from "react";
import { Scissors, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTechPack, useProductPageStore } from "@/lib/zustand/product/productPageStore";
import { SectionSummary } from "../SectionSummary";
import { updateSectionSummary, generateSectionSummary } from "@/app/actions/section-summaries";
import { toast } from "@/components/ui/use-toast";

interface ConstructionSectionProps {
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

export function ConstructionSection({
  onUpdateSection,
  selectedSection,
  onSectionSelect,
  techPack: techPackProp,
  readOnly = false,
  productId: productIdProp,
}: ConstructionSectionProps) {
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
      sectionKey: "construction",
      summary,
    });
    if (result.success) {
      updateTechPack({
        sectionSummaries: {
          ...techPack?.sectionSummaries,
          construction: summary,
        },
      });
      toast({ title: "Summary saved", description: "Construction section summary has been updated." });
    } else {
      toast({ title: "Error", description: result.error || "Failed to save summary", variant: "destructive" });
    }
  }, [productId, techPack?.sectionSummaries, updateTechPack]);

  // Handle AI generation of summary
  const handleGenerateAI = useCallback(async () => {
    if (!productId) return "";
    setIsGeneratingSummary(true);
    try {
      const result = await generateSectionSummary(productId, "construction");
      return result.summary || "";
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [productId]);

  const constructionDetails = techPack?.constructionDetails;
  const features = constructionDetails?.constructionFeatures || [];
  const hardwareComponents = techPack?.hardwareComponents;
  const hardware = hardwareComponents?.hardware || [];

  return (
    <div className="space-y-6 p-4">
      {/* Section Summary */}
      {!readOnly && productId && (
        <SectionSummary
          sectionKey="construction"
          summary={techPack?.sectionSummaries?.construction}
          onSave={handleSaveSummary}
          onGenerateAI={handleGenerateAI}
          isGenerating={isGeneratingSummary}
          placeholder="Add a summary explaining the construction methods and hardware..."
        />
      )}

      {/* Construction Details */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Scissors className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Construction Details</h3>
          {features.length > 0 && (
            <Badge variant="secondary">{features.length} features</Badge>
          )}
        </div>

        {constructionDetails?.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {constructionDetails.description}
          </p>
        )}

        {features.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((construction: any, i: number) => (
              <div key={i} className="border rounded-md p-3 space-y-1">
                <p className="text-sm font-semibold text-gray-900">
                  {construction.featureName}
                </p>
                <p className="text-xs text-gray-700">{construction.details}</p>
                {construction.category && (
                  <Badge variant="outline" className="text-xs mt-2">
                    {construction.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : !constructionDetails?.description ? (
          <p className="text-sm text-muted-foreground">
            No construction details defined yet
          </p>
        ) : null}

        {/* Assembly Sequence */}
        {constructionDetails?.assemblySequence &&
          constructionDetails.assemblySequence.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Assembly Sequence</h4>
              <ol className="list-decimal list-inside space-y-1">
                {constructionDetails.assemblySequence.map(
                  (step: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      {step}
                    </li>
                  )
                )}
              </ol>
            </div>
          )}

        {/* Critical Tolerances */}
        {constructionDetails?.criticalTolerances &&
          constructionDetails.criticalTolerances.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Critical Tolerances</h4>
              <div className="space-y-2">
                {constructionDetails.criticalTolerances.map(
                  (tol: any, i: number) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium">{tol.feature}:</span>{" "}
                      <span className="text-muted-foreground">
                        {tol.tolerance}
                      </span>
                      {tol.inspectionMethod && (
                        <span className="text-muted-foreground">
                          {" "}
                          - {tol.inspectionMethod}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Special Equipment */}
        {constructionDetails?.specialEquipment &&
          constructionDetails.specialEquipment.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Special Equipment</h4>
              <div className="flex flex-wrap gap-2">
                {constructionDetails.specialEquipment.map(
                  (equip: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {equip}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
      </section>

      <hr className="border-border" />

      {/* Hardware Components */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Hardware Components</h3>
          {hardware.length > 0 && (
            <Badge variant="secondary">{hardware.length} items</Badge>
          )}
        </div>

        {hardwareComponents?.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {hardwareComponents.description}
          </p>
        )}

        {hardware.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {hardware.map((item: string, i: number) => (
              <Badge key={i} variant="outline" className="text-sm px-3 py-1">
                {item}
              </Badge>
            ))}
          </div>
        ) : !hardwareComponents?.description ? (
          <p className="text-sm text-muted-foreground">
            No hardware components defined yet
          </p>
        ) : null}
      </section>
    </div>
  );
}

export default ConstructionSection;
