/**
 * TechPackOverviewTab Component
 * Overview tab content with Product Overview and Colors sections
 */

"use client";

import React from "react";
import { FileText, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TechPackSection } from "@/components/tech-pack/tech-pack-section";
import type { TechPackData } from "../../../types/techPack";

interface TechPackOverviewTabProps {
  techPackData: TechPackData;
  selectedSection: string;
  onSectionSelect: (section: string) => void;
  onUpdateSection: (section: string, content: any) => void;
  industryBenchmarks: Record<string, string>;
}

export function TechPackOverviewTab({
  techPackData,
  selectedSection,
  onSectionSelect,
  onUpdateSection,
  industryBenchmarks,
}: TechPackOverviewTabProps) {
  const techPackContent = techPackData.tech_pack_data;

  return (
    <div className="space-y-4">
      <TechPackSection
        title="Product Overview"
        icon={<FileText className="h-4 w-4" />}
        content={techPackContent?.productOverview || ""}
        onUpdate={(content) => onUpdateSection("productOverview", content)}
        industryBenchmark={industryBenchmarks["Product Overview"]}
        isSelected={selectedSection === "Product Overview"}
        onSelect={() => onSectionSelect("Product Overview")}
        renderContent={(content) => (
          <p className="text-xs text-gray-700">{content}</p>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />

      <TechPackSection
        title="Colors"
        icon={<Palette className="h-4 w-4" />}
        content={{
          palette: [
            ...(techPackContent?.colors?.primaryColors?.map((c: any) => ({
              ...c,
              type: "primary",
            })) || []),
            ...(techPackContent?.colors?.accentColors?.map((c: any) => ({
              ...c,
              type: "accent",
            })) || []),
          ],
          notes: techPackContent?.colors?.styleNotes || "",
          trendAlignment: techPackContent?.colors?.trendAlignment || "",
        }}
        onUpdate={(updatedContent) => {
          const { palette, notes, trendAlignment } = updatedContent;

          const primaryColors =
            palette
              ?.filter((c: any) => c.type === "primary")
              ?.map((c: { type: string; [key: string]: any }) => {
                const { type, ...rest } = c;
                return rest;
              }) || [];
          const accentColors =
            palette
              ?.filter((c: any) => c.type === "accent")
              ?.map((c: { type: string; [key: string]: any }) => {
                const { type, ...rest } = c;
                return rest;
              }) || [];

          onUpdateSection("colors", {
            primaryColors,
            accentColors,
            styleNotes: notes,
            trendAlignment,
          });
        }}
        industryBenchmark={industryBenchmarks["Colors"]}
        isSelected={selectedSection === "Colors"}
        onSelect={() => onSectionSelect("Colors")}
        renderContent={(content) => (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {content.palette?.map((color: any, i: number) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="h-12 w-12 rounded-full border"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <p className="text-xs font-medium mt-1.5">
                    {color.name}
                  </p>
                  <p className="text-[10px] font-medium mt-0.5">{color.hex}</p>
                  <Badge variant="outline" className="mt-1 text-[9px] h-4 px-1.5">
                    {color.type === "primary" ? "Primary" : "Accent"}
                  </Badge>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-xs font-medium mb-1">Style Notes</h4>
              <p className="text-xs text-gray-700">{content?.notes}</p>
            </div>
          </div>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />
    </div>
  );
}
