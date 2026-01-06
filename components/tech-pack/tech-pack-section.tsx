"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Edit, Check, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface TechPackSectionProps {
  title: string;
  content: any;
  onUpdate: (content: any) => void;
  renderContent: (content: any, isUpdating: boolean) => React.ReactNode;
  icon?: React.ReactNode;
  industryBenchmark?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  isAiPromptOpen: boolean;
  setAiPromptOpen: (value: boolean) => void;
  hideTitle?: boolean;
  readOnly?: boolean;
}

export function TechPackSection({
  title,
  content,
  onUpdate,
  renderContent,
  icon,
  industryBenchmark,
  isSelected,
  onSelect,
  isAiPromptOpen,
  setAiPromptOpen,
  hideTitle = false,
  readOnly = false,
}: TechPackSectionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [wasRecentlyUpdated, setWasRecentlyUpdated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState<any>(content);

  useEffect(() => {
    setEditableContent(content);
  }, [content]);

  // Function to handle direct content editing
  const handleContentEdit = (value: string | string[] | Record<string, any>, key?: string) => {
    console.log("handleContentEdit called with:", { value, key });
    if (key) {
      const newContent = {
        ...editableContent,
        [key]: value,
      };
      console.log("Setting editableContent to:", newContent);
      setEditableContent(newContent);
    } else {
      console.log("Setting editableContent to:", value);
      setEditableContent(value);
    }
  };

  const handleSaveEdit = () => {
    console.log(editableContent, "editable");
    onUpdate(editableContent);
    setIsEditing(false);
    setWasRecentlyUpdated(true);
    setTimeout(() => {
      setWasRecentlyUpdated(false);
    }, 3000);
    ``;
  };

  const handleCancelEdit = () => {
    setEditableContent(content);
    setIsEditing(false);
  };

  const renderEditableContent = () => {
    if (typeof content === "string") {
      return (
        <Textarea
          value={editableContent}
          onChange={(e) => handleContentEdit(e.target.value)}
          className="min-h-[100px] w-full"
        />
      );
    }
    if (Array.isArray(content)) {
      return (
        <Textarea
          value={content.join("\n")}
          onChange={(e) => handleContentEdit(e.target.value.split("\n"))}
          className="min-h-[100px] w-full"
          placeholder="Enter one item per line"
        />
      );
    }

    // Handle object with description (e.g., constructionDetails, careInstructions)

    if (content && typeof content === "object" && "palette" in content) {
      return (
        <div className="space-y-4">
          {editableContent.palette.map((color: any, index: number) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                type="color"
                value={color.hex}
                onChange={(e) => {
                  const updatedPalette = [...editableContent.palette];
                  updatedPalette[index] = {
                    ...updatedPalette[index],
                    hex: e.target.value,
                  };
                  handleContentEdit({
                    ...editableContent,
                    palette: updatedPalette,
                  });
                }}
                className="w-16 h-10"
              />
              <Input
                value={color.name}
                onChange={(e) => {
                  const updatedPalette = [...editableContent.palette];
                  updatedPalette[index] = {
                    ...updatedPalette[index],
                    name: e.target.value,
                  };
                  handleContentEdit({
                    ...editableContent,
                    palette: updatedPalette,
                  });
                }}
                className="flex-1"
                placeholder="Color name"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const updatedPalette = [...editableContent.palette, { name: "", hex: "#000000", type: "primary" }];
              handleContentEdit({
                ...editableContent,
                palette: updatedPalette,
              });
            }}
          >
            Add Color
          </Button>

          {/* Notes field if it exists */}
          {editableContent.notes !== undefined && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Notes</h4>
              <Textarea
                value={editableContent.notes}
                onChange={(e) => handleContentEdit(e.target.value, "notes")}
                className="w-full"
                placeholder="Add notes here"
              />
            </div>
          )}

          {/* Style notes field if it exists */}
          {editableContent.styleNotes !== undefined && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Style Notes</h4>
              <Textarea
                value={editableContent.styleNotes}
                onChange={(e) => handleContentEdit(e.target.value, "styleNotes")}
                className="w-full"
                placeholder="Add style notes here"
              />
            </div>
          )}

          {editableContent.trendAlignment !== undefined && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Trend Alignment</h4>
              <Textarea
                value={editableContent.trendAlignment}
                onChange={(e) => handleContentEdit(e.target.value, "trendAlignment")}
                className="w-full"
                placeholder="Add trend alignment here"
              />
            </div>
          )}
        </div>
      );
    }

    // If content is an object with points (like style notes)
    if (content && typeof content === "object" && "points" in content) {
      return (
        <div className="space-y-4">
          <Textarea
            value={editableContent.description || ""}
            onChange={(e) => handleContentEdit(e.target.value, "description")}
            className="w-full"
            placeholder="Description"
          />

          <h4 className="text-sm font-medium">Points</h4>
          <Textarea
            value={editableContent.points.join("\n")}
            onChange={(e) => {
              const points = e.target.value.split("\n").filter((point) => point.trim() !== "");
              handleContentEdit({ ...editableContent, points });
            }}
            className="min-h-[100px] w-full"
            placeholder="Enter one point per line"
          />
        </div>
      );
    }

    // Handle sizeRange with sizes (array) and gradingLogic (string)
    // Handle content with description and sizes
    if (content && typeof content === "object" && "description" in content && "sizes" in content) {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Grading Logic</h4>
            <Textarea
              value={editableContent.description || ""}
              onChange={(e) =>
                handleContentEdit({
                  ...editableContent,
                  description: e.target.value,
                })
              }
              className="w-full min-h-[100px]"
              placeholder="Explain the grading logic"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Sizes</h4>
            <Textarea
              value={editableContent.sizes?.join("\n") || ""}
              onChange={(e) => {
                const sizes = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter((s) => s !== "");
                handleContentEdit({
                  ...editableContent,
                  sizes: sizes,
                });
              }}
              className="w-full min-h-[100px]"
              placeholder="Enter one size per line"
            />
          </div>
        </div>
      );
    }

    // Handle array of materials
    if (content && Array.isArray(content.materials)) {
      return (
        <div className="space-y-4">
          {editableContent.materials.map((material: any, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={material.component}
                onChange={(e) => {
                  const updatedMaterials = [...editableContent.materials];
                  updatedMaterials[index] = {
                    ...updatedMaterials[index],
                    component: e.target.value,
                  };
                  handleContentEdit({
                    ...editableContent,
                    materials: updatedMaterials,
                  });
                }}
                className="flex-1"
                placeholder="Material name"
              />
              <Input
                value={material.material}
                onChange={(e) => {
                  const updatedMaterials = [...editableContent.materials];
                  updatedMaterials[index] = {
                    ...updatedMaterials[index],
                    material: e.target.value,
                  };
                  handleContentEdit({
                    ...editableContent,
                    materials: updatedMaterials,
                  });
                }}
                className="flex-1"
                placeholder="Material name"
              />
              <Input
                value={material.notes}
                onChange={(e) => {
                  const updatedMaterials = [...editableContent.materials];
                  updatedMaterials[index] = {
                    ...updatedMaterials[index],
                    notes: e.target.value,
                  };
                  handleContentEdit({
                    ...editableContent,
                    materials: updatedMaterials,
                  });
                }}
                className="flex-1"
                placeholder="Reason for material"
              />
              <Input
                value={material.quantityPerUnit}
                onChange={(e) => {
                  const updatedMaterials = [...editableContent.materials];
                  updatedMaterials[index] = {
                    ...updatedMaterials[index],
                    quantityPerUnit: e.target.value,
                  };
                  handleContentEdit({
                    ...editableContent,
                    materials: updatedMaterials,
                  });
                }}
                className="w-20"
                placeholder="%"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const updatedMaterials = [
                ...editableContent.materials,
                { name: "", reason: "", sustainabilityScore: "" },
              ];
              handleContentEdit({
                ...editableContent,
                materials: updatedMaterials,
              });
            }}
          >
            Add Material
          </Button>
        </div>
      );
    }

    // Handle Dimensions (measurements)
    if (content && typeof content.measurements === "object" && !Array.isArray(content.measurements)) {
      return (
        <div className="space-y-4 border p-4 rounded-md">
          {Object.entries(editableContent.measurements).map(([key, data]: [string, any]) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Display the key name */}
              <div className="col-span-2 font-semibold">{key === "width" ? "Breadth" : key}</div>

              <Input
                value={data.value}
                onChange={(e) => {
                  const updatedMeasurements = {
                    ...editableContent.measurements,
                    [key]: {
                      ...editableContent.measurements[key],
                      value: e.target.value,
                    },
                  };
                  handleContentEdit({
                    ...editableContent,
                    measurements: updatedMeasurements,
                  });
                }}
                placeholder={`${key === "width" ? "Breadth" : key} value`}
              />
              <Input
                value={data.tolerance}
                onChange={(e) => {
                  const updatedMeasurements = {
                    ...editableContent.measurements,
                    [key]: {
                      ...editableContent.measurements[key],
                      tolerance: e.target.value,
                    },
                  };
                  handleContentEdit({
                    ...editableContent,
                    measurements: updatedMeasurements,
                  });
                }}
                placeholder={`${key === "width" ? "Breadth" : key} tolerance`}
              />
            </div>
          ))}
        </div>
      );
    }

    if (content && typeof content === "object" && "description" in content) {
      return (
        <Textarea
          value={editableContent.description}
          onChange={(e) => handleContentEdit(e.target.value, "description")}
          className="min-h-[100px] w-full"
        />
      );
    }
    // Default fallback for other content types
    return (
      <Textarea
        value={JSON.stringify(editableContent, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            handleContentEdit(parsed);
          } catch (error) {
            handleContentEdit(e.target.value);
          }
        }}
        className="min-h-[150px] w-full font-mono text-sm"
      />
    );
  };

  // Function to render industry benchmark without border
  const renderBenchmark = () => {
    if (!industryBenchmark) return null;

    return (
      <div className="mt-2">
        <div className="flex items-center gap-1 text-[#1C1917] mb-0.5">
          <Info className="h-2.5 w-2.5" />
          <span className="text-[10px] font-medium">Industry Benchmark</span>
        </div>
        <p className="text-[10px] text-[#1C1917]/70">{industryBenchmark}</p>
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all border-transparent rounded-none shadow-none bg-transparent",
        wasRecentlyUpdated && "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]",
        isSelected && "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
      )}
    >
      <CardContent className="p-4 px-0">
        <div className={cn("flex justify-between items-center", !hideTitle ? "mb-3" : "mb-4")}>
          {!hideTitle && (
            <div className="flex items-center gap-2">
              {icon && <span className="text-base">{icon}</span>}
              <h3 className="text-base font-semibold">{title}</h3>
              {wasRecentlyUpdated && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />
                  Updated
                </Badge>
              )}
            </div>
          )}
          {hideTitle && wasRecentlyUpdated && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5">
              <Sparkles className="h-2.5 w-2.5 mr-1" />
              Updated
            </Badge>
          )}

          {!readOnly && (
            <div className={cn("flex items-center flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-1.5", hideTitle && "ml-auto")}>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-transparent h-7 text-xs px-2.5"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-transparent h-7 text-xs px-2.5"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  <Button variant="default" size="sm" className="flex items-center gap-1 h-7 text-xs px-2.5" onClick={handleSaveEdit}>
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 text-xs">{renderEditableContent()}</div>
        ) : (
          <>
            {renderContent(content, isUpdating)}
            {renderBenchmark()}
          </>
        )}
      </CardContent>
    </Card>
  );
}
