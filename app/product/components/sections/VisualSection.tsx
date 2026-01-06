"use client";

/**
 * VisualSection - Consolidated section for Images + Colors
 * Merges ProductImageGallery and Colors into a single section with internal tabs
 * Supports both authenticated (with Zustand store) and public (with techPack prop) modes
 */

import { useState, useCallback } from "react";
import { ImageIcon, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductImageGallery } from "../ProductImageGallery";
import { useTechPack, useProductPageStore } from "@/lib/zustand/product/productPageStore";
import { SectionSummary } from "../SectionSummary";
import { updateSectionSummary, generateSectionSummary } from "@/app/actions/section-summaries";
import { toast } from "@/components/ui/use-toast";

type SubSection = "images" | "colors";

interface VisualSectionProps {
  /** Optional techPack data for public/read-only mode */
  techPack?: any;
  /** Read-only mode for public pages */
  readOnly?: boolean;
  /** Custom image gallery component (for public pages with different data source) */
  customImageGallery?: React.ReactNode;
  /** Product ID for saving summaries */
  productId?: string;
}

export function VisualSection({
  techPack: techPackProp,
  readOnly = false,
  customImageGallery,
  productId: productIdProp,
}: VisualSectionProps = {}) {
  const [activeSubSection, setActiveSubSection] = useState<SubSection>("images");
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
      sectionKey: "visual",
      summary,
    });
    if (result.success) {
      // Update local store to reflect the change
      updateTechPack({
        sectionSummaries: {
          ...techPack?.sectionSummaries,
          visual: summary,
        },
      });
      toast({ title: "Summary saved", description: "Visual section summary has been updated." });
    } else {
      toast({ title: "Error", description: result.error || "Failed to save summary", variant: "destructive" });
    }
  }, [productId, techPack?.sectionSummaries, updateTechPack]);

  // Handle AI generation of summary
  const handleGenerateAI = useCallback(async () => {
    if (!productId) return "";
    setIsGeneratingSummary(true);
    try {
      const result = await generateSectionSummary(productId, "visual");
      return result.summary || "";
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [productId]);

  const subSections = [
    { id: "images" as SubSection, label: "Images", icon: ImageIcon },
    { id: "colors" as SubSection, label: "Colors", icon: Palette },
  ];

  // Prepare color palette
  const colorPalette = [
    ...(techPack?.colors?.primaryColors?.map((c: any) => ({
      ...c,
      type: "primary",
    })) || []),
    ...(techPack?.colors?.accentColors?.map((c: any) => ({
      ...c,
      type: "accent",
    })) || []),
  ];

  return (
    <div className="space-y-4">
      {/* Section Summary */}
      {!readOnly && productId && (
        <SectionSummary
          sectionKey="visual"
          summary={techPack?.sectionSummaries?.visual}
          onSave={handleSaveSummary}
          onGenerateAI={handleGenerateAI}
          isGenerating={isGeneratingSummary}
          placeholder="Add a summary explaining the visual elements of this product..."
        />
      )}

      {/* Sub-section tabs */}
      <div className="flex items-center gap-2 border-b pb-2">
        {subSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSubSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSubSection(section.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-200px)] min-h-[500px]">
        {activeSubSection === "images" && (
          <div className="w-full h-full">
            {customImageGallery || <ProductImageGallery />}
          </div>
        )}

        {activeSubSection === "colors" && (
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {colorPalette.length > 0 ? (
                colorPalette.map((color: any, i: number) => (
                  <div key={i} className="flex flex-col items-center group">
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-md ring-1 ring-black/5 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="text-xs font-semibold mt-2">{color.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                      {color.hex}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {color.type === "primary" ? "Primary" : "Accent"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No colors defined yet</p>
                </div>
              )}
            </div>

            {techPack?.colors?.styleNotes && (
              <div className="pt-3 border-t">
                <h4 className="text-xs font-medium mb-1">Style Notes</h4>
                <p className="text-xs text-muted-foreground">
                  {techPack.colors.styleNotes}
                </p>
              </div>
            )}

            {techPack?.colors?.trendAlignment && (
              <div className="pt-2">
                <h4 className="text-xs font-medium mb-1">Trend Alignment</h4>
                <p className="text-xs text-muted-foreground">
                  {techPack.colors.trendAlignment}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualSection;
