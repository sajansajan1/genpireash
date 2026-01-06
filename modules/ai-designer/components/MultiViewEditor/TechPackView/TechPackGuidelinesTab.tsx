/**
 * TechPackGuidelinesTab Component
 * Guidelines tab content with Materials, Construction Details, Hardware, and Care Instructions
 */

"use client";

import React from "react";
import { Layers, Scissors, Tag, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TechPackSection } from "@/components/tech-pack/tech-pack-section";
import type { TechPackData } from "../../../types/techPack";

interface TechPackGuidelinesTabProps {
  techPackData: TechPackData;
  selectedSection: string;
  onSectionSelect: (section: string) => void;
  onUpdateSection: (section: string, content: any) => void;
  industryBenchmarks: Record<string, string>;
}

export function TechPackGuidelinesTab({
  techPackData,
  selectedSection,
  onSectionSelect,
  onUpdateSection,
  industryBenchmarks,
}: TechPackGuidelinesTabProps) {
  const techPackContent = techPackData.tech_pack_data;

  return (
    <div className="space-y-4">
      <TechPackSection
        title="Materials"
        icon={<Layers className="h-4 w-4" />}
        content={{
          materials: techPackContent?.materials?.map((m: any) => ({
            component: m.component || "",
            material: m.material || "",
            notes: m.notes || "",
            quantityPerUnit: m.quantityPerUnit || "",
            specification: m.specification || "",
            unitCost: m.unitCost || "",
          })) || [],
        }}
        onUpdate={(updatedContent) => {
          const updatedMaterials = updatedContent.materials;
          onUpdateSection("materials", updatedMaterials);
        }}
        industryBenchmark={industryBenchmarks["Materials"]}
        isSelected={selectedSection === "Materials"}
        onSelect={() => onSectionSelect("Materials")}
        renderContent={(content) => (
          <div className="space-y-2">
            {content.materials?.map((material: any, index: number) => (
              <div key={index} className="border rounded-md p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium">{material.component}</p>
                    <p className="text-xs font-medium">{material.material}</p>
                    <p className="text-[10px] text-gray-700">
                      {material.notes}
                    </p>
                    <p className="text-[10px] text-gray-700">
                      {material.specification}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2 whitespace-nowrap text-[9px] h-4 px-1.5">
                    {material.quantityPerUnit}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />

      <TechPackSection
        title="Construction Details"
        icon={<Scissors className="h-4 w-4" />}
        content={{
          description: techPackContent?.constructionDetails?.description || "",
          constructionFeatures:
            techPackContent?.constructionDetails?.constructionFeatures || [],
        }}
        onUpdate={(content) =>
          onUpdateSection("constructionDetails", {
            ...(techPackContent?.constructionDetails || {}),
            description: content.description,
          })
        }
        industryBenchmark={industryBenchmarks["Construction Details"]}
        isSelected={selectedSection === "Construction Details"}
        onSelect={() => onSectionSelect("Construction Details")}
        renderContent={(content) => (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-700">{content.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {content.constructionFeatures?.map(
                (construction: any, i: number) => (
                  <div
                    className="border rounded-md p-2.5 space-y-1"
                    key={i}
                  >
                    <p className="text-xs font-semibold text-gray-900">
                      {construction.featureName}
                    </p>
                    <p className="text-[10px] text-gray-700">
                      {construction.details}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />

      <TechPackSection
        title="Hardware Components"
        icon={<Tag className="h-4 w-4" />}
        content={{
          description: techPackContent?.hardwareComponents?.description || "",
          hardware: techPackContent?.hardwareComponents?.hardware || [],
        }}
        onUpdate={(content) =>
          onUpdateSection("hardwareComponents", {
            ...(techPackContent?.hardwareComponents || {}),
            description: content.description,
          })
        }
        industryBenchmark={industryBenchmarks["Hardware Components"]}
        isSelected={selectedSection === "Hardware Components"}
        onSelect={() => onSectionSelect("Hardware Components")}
        renderContent={(content) => (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-700">{content.description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {content?.hardware?.map((hardware: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] h-5 px-2">
                  {hardware}
                </Badge>
              ))}
            </div>
          </div>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />

      <TechPackSection
        title="Care Instructions"
        icon={<ClipboardList className="h-4 w-4" />}
        content={techPackContent?.careInstructions || ""}
        onUpdate={(content) =>
          onUpdateSection("careInstructions", content)
        }
        industryBenchmark={industryBenchmarks["Care Instructions"]}
        isSelected={selectedSection === "Care Instructions"}
        onSelect={() => onSectionSelect("Care Instructions")}
        renderContent={(content) => (
          <p className="text-xs text-gray-700">{content}</p>
        )}
        isAiPromptOpen={false}
        setAiPromptOpen={() => {}}
      />
    </div>
  );
}
