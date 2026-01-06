"use client";

/**
 * TechFileGuideModal - Shared modal for displaying tech file analysis
 * Used by both public and private product pages
 */

import {
  BookOpen,
  CheckCircle,
  FileImage,
  Layers,
  Link2,
  Wrench,
  ClipboardCheck,
  Clock,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TechFileData } from "./utils";
import { FactorySpecsImage } from "../components/sections/FactorySpecsImage";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TechFileGuideModalProps {
  selectedTechFile: TechFileData | null;
  onClose: () => void;
  onViewImage?: (url: string, title: string, description: string) => void;
  comments?: any[];
  onAddComment?: (text: string, metadata: { x: number; y: number; view: string }) => void;
}

export function TechFileGuideModal({
  selectedTechFile,
  onClose,
  onViewImage,
  comments = [],
  onAddComment,
}: TechFileGuideModalProps) {
  const [isCommentMode, setIsCommentMode] = useState(false);

  if (!selectedTechFile) return null;

  const getModalTitle = () => {
    if (selectedTechFile.file_type === "component") {
      return `Component Guide - ${selectedTechFile.file_category || selectedTechFile.analysis_data?.component_name || "Component"}`;
    }
    if (selectedTechFile.file_type === "base_view") {
      return `Base View Guide - ${selectedTechFile.view_type?.replace("_", " ")} View`;
    }
    if (selectedTechFile.file_type === "closeup") {
      return `Close-Up Guide - ${selectedTechFile.file_category || "Detail"}`;
    }
    if (selectedTechFile.file_type === "sketch") {
      return `Technical Sketch Guide - ${selectedTechFile.view_type?.replace("_", " ")} View`;
    }
    if (selectedTechFile.file_type === "assembly_view") {
      return "Assembly View Guide";
    }
    return "Tech File Guide";
  };

  return (
    <Dialog open={!!selectedTechFile} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Image and Comment Toggle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">File Preview</h3>
              <Button
                variant={isCommentMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCommentMode(!isCommentMode)}
                className={cn("gap-2 text-xs h-8", isCommentMode && "ring-2 ring-primary ring-offset-2")}
              >
                <div className={cn("w-2 h-2 rounded-full", isCommentMode ? "bg-white animate-pulse" : "bg-muted-foreground")} />
                {isCommentMode ? "Pin Comment Enabled" : "Enable Pin Comment"}
              </Button>
            </div>
            <div className="relative rounded-lg overflow-hidden border bg-muted/30 min-h-[200px] max-h-[400px] flex items-center justify-center">
              <FactorySpecsImage
                src={selectedTechFile.file_url}
                alt={selectedTechFile.file_category || "Tech File"}
                viewId={selectedTechFile.id}
                comments={comments}
                onAddComment={onAddComment}
                isCommentMode={isCommentMode}
                onOpenViewer={() => {
                  if (onViewImage) {
                    onViewImage(
                      selectedTechFile.file_url,
                      selectedTechFile.file_category || selectedTechFile.view_type || "Tech File",
                      selectedTechFile.analysis_data?.summary?.overview || ""
                    );
                  }
                }}
                className="w-full h-full object-contain max-h-[400px]"
              />
            </div>
          </div>
          {/* Component Identification Section */}
          {(selectedTechFile.analysis_data?.component_identification ||
            selectedTechFile.analysis_data?.component_guide?.component_identification) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Component Identification
                </h3>
                <Card className="p-4">
                  {(() => {
                    const ci = selectedTechFile.analysis_data?.component_guide?.component_identification ||
                      selectedTechFile.analysis_data?.component_identification;
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        {ci?.component_name && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Component Name</p>
                            <p className="text-xs text-gray-900 dark:text-white font-medium">{ci.component_name}</p>
                          </div>
                        )}
                        {ci?.component_type && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Type</p>
                            <Badge className="text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                              {ci.component_type}
                            </Badge>
                          </div>
                        )}
                        {ci?.primary_function && (
                          <div className="col-span-2">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Primary Function</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{ci.primary_function}</p>
                          </div>
                        )}
                        {ci?.location_on_product && (
                          <div className="col-span-2">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Location on Product</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{ci.location_on_product}</p>
                          </div>
                        )}
                        {ci?.visual_description && (
                          <div className="col-span-2">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Visual Description</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{ci.visual_description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              </div>
            )}

          {/* Material Specifications Section */}
          {(selectedTechFile.analysis_data?.material_specifications ||
            selectedTechFile.analysis_data?.component_guide?.material_specifications) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Material Specifications
                </h3>
                <Card className="p-4">
                  {(() => {
                    const ms = selectedTechFile.analysis_data?.component_guide?.material_specifications ||
                      selectedTechFile.analysis_data?.material_specifications;
                    return (
                      <div className="space-y-3">
                        {ms?.material_type && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Material Type</p>
                            <p className="text-xs text-gray-900 dark:text-white font-medium">{ms.material_type}</p>
                          </div>
                        )}
                        {ms?.composition && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Composition</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{ms.composition}</p>
                          </div>
                        )}
                        {(ms?.quality_grade || ms?.material_grade) && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Material Grade</p>
                            <Badge variant="outline" className="text-[10px]">
                              {ms.material_grade || ms.quality_grade}
                            </Badge>
                          </div>
                        )}
                        {ms?.texture && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Texture</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{ms.texture}</p>
                          </div>
                        )}
                        {ms?.color && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Color</p>
                            <div className="flex items-center gap-2">
                              {ms.color.hex && (
                                <div
                                  className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600"
                                  style={{ backgroundColor: ms.color.hex }}
                                />
                              )}
                              <div>
                                <p className="text-xs text-gray-900 dark:text-white font-medium">{ms.color.name}</p>
                                {ms.color.hex && (
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{ms.color.hex}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {ms?.weight_gsm && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Weight (GSM)</p>
                            <p className="text-xs text-gray-900 dark:text-white font-medium">{ms.weight_gsm}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              </div>
            )}

          {/* Overview Section */}
          {(selectedTechFile.analysis_data?.summary?.overview ||
            selectedTechFile.analysis_data?.description ||
            (selectedTechFile.analysis_data?.primary_function &&
              !selectedTechFile.analysis_data?.component_identification)) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Overview</h3>
                <Card className="p-4">
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedTechFile.analysis_data?.summary?.overview ||
                      selectedTechFile.analysis_data?.description ||
                      selectedTechFile.analysis_data?.primary_function}
                  </p>
                </Card>
              </div>
            )}

          {/* Key Measurements Section */}
          {((selectedTechFile.analysis_data?.measurements &&
            Object.keys(selectedTechFile.analysis_data.measurements).length > 0) ||
            (selectedTechFile.analysis_data?.dimensions_estimated &&
              Object.keys(selectedTechFile.analysis_data.dimensions_estimated).length > 0) ||
            (selectedTechFile.analysis_data?.summary?.measurements &&
              selectedTechFile.analysis_data.summary.measurements.length > 0)) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedTechFile.analysis_data?.summary?.measurements?.map(
                    (measurement: any, idx: number) => (
                      <Card key={`summary-${idx}`} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-gray-900 dark:text-white font-medium">{measurement.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{measurement.location}</p>
                          </div>
                          <Badge variant="secondary" className="ml-2 text-[10px]">{measurement.value}</Badge>
                        </div>
                      </Card>
                    )
                  )}
                  {selectedTechFile.analysis_data?.measurements &&
                    Object.entries(selectedTechFile.analysis_data.measurements).map(
                      ([key, value]: [string, any]) => (
                        <Card key={`meas-${key}`} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs text-gray-900 dark:text-white font-medium capitalize">
                                {key.replace(/_/g, " ")}
                              </p>
                              {value?.measurement_point && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{value.measurement_point}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="ml-2 text-[10px]">
                              {typeof value === "object" ? value.value || JSON.stringify(value) : value}
                            </Badge>
                          </div>
                        </Card>
                      )
                    )}
                </div>
              </div>
            )}

          {/* Materials & Fabrics Section */}
          {((selectedTechFile.analysis_data?.materials_detected &&
            selectedTechFile.analysis_data.materials_detected.length > 0) ||
            selectedTechFile.analysis_data?.material ||
            (selectedTechFile.analysis_data?.summary?.materials &&
              selectedTechFile.analysis_data.summary.materials.length > 0)) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Materials & Fabrics</h3>
                <div className="space-y-3">
                  {selectedTechFile.analysis_data?.summary?.materials?.map(
                    (material: any, idx: number) => (
                      <Card key={`sum-mat-${idx}`} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs text-gray-900 dark:text-white font-medium">{material.type}</p>
                          {material.percentage && (
                            <Badge variant="outline" className="text-[10px]">{material.percentage}</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">{material.location}</p>
                        {material.properties && material.properties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {material.properties.map((prop: string, propIdx: number) => (
                              <Badge key={propIdx} variant="secondary" className="text-[10px]">{prop}</Badge>
                            ))}
                          </div>
                        )}
                      </Card>
                    )
                  )}
                  {selectedTechFile.analysis_data?.materials_detected?.map(
                    (mat: any, idx: number) => (
                      <Card key={`det-mat-${idx}`} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs text-gray-900 dark:text-white font-medium">
                            {mat.material_type || mat.component}
                          </p>
                          {mat.percentage && (
                            <Badge variant="outline" className="text-[10px]">{mat.percentage}</Badge>
                          )}
                        </div>
                        {mat.component && mat.component !== mat.material_type && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">{mat.component}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {mat.spec && mat.spec !== "Not specified" && (
                            <Badge variant="secondary" className="text-[10px]">{mat.spec}</Badge>
                          )}
                          {mat.finish && mat.finish !== "Not specified" && (
                            <Badge variant="secondary" className="text-[10px]">{mat.finish}</Badge>
                          )}
                        </div>
                      </Card>
                    )
                  )}
                  {selectedTechFile.analysis_data?.material &&
                    !selectedTechFile.analysis_data?.materials_detected && (
                      <Card className="p-4">
                        <p className="text-xs text-gray-900 dark:text-white font-medium">
                          {selectedTechFile.analysis_data.material}
                        </p>
                        {selectedTechFile.analysis_data?.composition && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                            {selectedTechFile.analysis_data.composition}
                          </p>
                        )}
                      </Card>
                    )}
                </div>
              </div>
            )}

          {/* Construction Details Section */}
          {((selectedTechFile.analysis_data?.construction_details &&
            (Array.isArray(selectedTechFile.analysis_data.construction_details)
              ? selectedTechFile.analysis_data.construction_details.length > 0
              : Object.keys(selectedTechFile.analysis_data.construction_details).length > 0)) ||
            (selectedTechFile.analysis_data?.summary?.construction &&
              selectedTechFile.analysis_data.summary.construction.length > 0)) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Construction Details</h3>
                <div className="space-y-3">
                  {selectedTechFile.analysis_data?.summary?.construction?.map(
                    (detail: any, idx: number) => (
                      <Card key={`sum-con-${idx}`} className="p-4">
                        <p className="text-xs text-gray-900 dark:text-white font-medium mb-1">{detail.feature}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">{detail.details}</p>
                        <Badge variant="outline" className="text-[10px]">{detail.technique}</Badge>
                      </Card>
                    )
                  )}
                  {Array.isArray(selectedTechFile.analysis_data?.construction_details) &&
                    selectedTechFile.analysis_data.construction_details.map(
                      (detail: any, idx: number) => (
                        <Card key={`arr-con-${idx}`} className="p-4">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {typeof detail === "string" ? detail : detail.feature || detail.description || detail.name}
                              </p>
                              {detail.location && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{detail.location}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    )}
                </div>
              </div>
            )}

          {/* Technical Callouts Section (for sketches) */}
          {selectedTechFile.analysis_data?.callouts?.callouts &&
            selectedTechFile.analysis_data.callouts.callouts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Technical Callouts</h3>
                <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                  <div className="space-y-3">
                    {selectedTechFile.analysis_data.callouts.callouts.map(
                      (callout: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-medium">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-xs text-gray-900 dark:text-white font-medium">
                              {callout.feature_name || callout.label}
                            </p>
                            {callout.specification && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                {callout.specification}
                              </p>
                            )}
                            {callout.material && (
                              <Badge variant="outline" className="mt-2 text-[10px]">{callout.material}</Badge>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              </div>
            )}

          {/* Assembly View Specific Sections */}
          {selectedTechFile.file_type === "assembly_view" && selectedTechFile.analysis_data?.summary && (
            <>
              {/* Assembly Overview */}
              {selectedTechFile.analysis_data.summary.overview && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Assembly Overview
                  </h3>
                  <Card className="p-4">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedTechFile.analysis_data.summary.overview}
                    </p>
                    {selectedTechFile.analysis_data.summary.totalComponents && (
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {selectedTechFile.analysis_data.summary.totalComponents} Components
                        </Badge>
                        {selectedTechFile.analysis_data.summary.difficultyLevel && (
                          <Badge variant="outline" className="text-[10px]">
                            {selectedTechFile.analysis_data.summary.difficultyLevel}
                          </Badge>
                        )}
                        {selectedTechFile.analysis_data.summary.estimatedAssemblyTime && (
                          <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {selectedTechFile.analysis_data.summary.estimatedAssemblyTime}
                          </Badge>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Components Breakdown */}
              {selectedTechFile.analysis_data.summary.components &&
                selectedTechFile.analysis_data.summary.components.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Component Breakdown
                    </h3>
                    <div className="space-y-2">
                      {selectedTechFile.analysis_data.summary.components.map((comp: any, idx: number) => (
                        <Card key={idx} className="p-3">
                          <div className="flex items-start gap-3">
                            <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-medium">
                              {comp.number || idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-xs text-gray-900 dark:text-white font-medium">{comp.name}</p>
                              {comp.role && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{comp.role}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {comp.material && (
                                  <Badge variant="outline" className="text-[10px]">{comp.material}</Badge>
                                )}
                                {comp.assemblyOrder && (
                                  <Badge variant="secondary" className="text-[10px]">{comp.assemblyOrder}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {/* Assembly Sequence */}
              {selectedTechFile.analysis_data.summary.assemblySequence &&
                selectedTechFile.analysis_data.summary.assemblySequence.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      Assembly Sequence
                    </h3>
                    <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <div className="space-y-4">
                        {selectedTechFile.analysis_data.summary.assemblySequence.map((step: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                              {step.step || idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-900 dark:text-white font-medium">{step.action}</p>
                              {step.technique && (
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                                  Technique: {step.technique}
                                </p>
                              )}
                              {step.components && step.components.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {step.components.map((comp: string, compIdx: number) => (
                                    <Badge key={compIdx} variant="outline" className="text-[10px]">{comp}</Badge>
                                  ))}
                                </div>
                              )}
                              {step.notes && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 italic">{step.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

              {/* Connection Points */}
              {selectedTechFile.analysis_data.summary.connectionPoints &&
                selectedTechFile.analysis_data.summary.connectionPoints.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Connection Points
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTechFile.analysis_data.summary.connectionPoints.map((cp: any, idx: number) => (
                        <Card key={idx} className="p-3">
                          <p className="text-xs text-gray-900 dark:text-white font-medium">{cp.location}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary" className="text-[10px]">{cp.type}</Badge>
                          </div>
                          {cp.componentsJoined && cp.componentsJoined.length > 0 && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                              Joins: {cp.componentsJoined.join(" + ")}
                            </p>
                          )}
                          {cp.specification && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{cp.specification}</p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {/* Tools Required */}
              {selectedTechFile.analysis_data.summary.toolsRequired &&
                selectedTechFile.analysis_data.summary.toolsRequired.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Tools & Equipment Required
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {selectedTechFile.analysis_data.summary.toolsRequired.map((tool: any, idx: number) => (
                        <Card key={idx} className="p-3">
                          <p className="text-xs text-gray-900 dark:text-white font-medium">{tool.tool}</p>
                          {tool.purpose && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{tool.purpose}</p>
                          )}
                          {tool.specification && (
                            <Badge variant="outline" className="text-[10px] mt-2">{tool.specification}</Badge>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {/* Quality Checkpoints */}
              {selectedTechFile.analysis_data.summary.qualityCheckpoints &&
                selectedTechFile.analysis_data.summary.qualityCheckpoints.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Quality Checkpoints
                    </h3>
                    <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <div className="space-y-3">
                        {selectedTechFile.analysis_data.summary.qualityCheckpoints.map((qc: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-900 dark:text-white font-medium">{qc.checkpoint}</p>
                              {qc.criteria && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{qc.criteria}</p>
                              )}
                              {qc.timing && (
                                <Badge variant="outline" className="text-[10px] mt-1">{qc.timing}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
            </>
          )}

          {/* Manufacturing Notes Section */}
          {((selectedTechFile.analysis_data?.manufacturing_notes &&
            selectedTechFile.analysis_data.manufacturing_notes.length > 0) ||
            (selectedTechFile.analysis_data?.summary?.manufacturingNotes &&
              selectedTechFile.analysis_data.summary.manufacturingNotes.length > 0) ||
            selectedTechFile.analysis_data?.analysis_notes) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Manufacturing Notes</h3>
                <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <ul className="space-y-2">
                    {selectedTechFile.analysis_data?.manufacturing_notes?.map(
                      (note: string, idx: number) => (
                        <li key={`mn-${idx}`} className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      )
                    )}
                    {selectedTechFile.analysis_data?.summary?.manufacturingNotes?.map(
                      (note: string, idx: number) => (
                        <li key={`smn-${idx}`} className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      )
                    )}
                    {selectedTechFile.analysis_data?.analysis_notes && (
                      <li className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                        <span>{selectedTechFile.analysis_data.analysis_notes}</span>
                      </li>
                    )}
                  </ul>
                </Card>
              </div>
            )}

          {/* Quality Control Section */}
          {(selectedTechFile.analysis_data?.quality_control ||
            selectedTechFile.analysis_data?.component_guide?.quality_control) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quality Control</h3>
                <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                  {(() => {
                    const qc = selectedTechFile.analysis_data?.component_guide?.quality_control ||
                      selectedTechFile.analysis_data?.quality_control;
                    return (
                      <div className="space-y-3">
                        {qc?.inspection_points && qc.inspection_points.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Inspection Points</p>
                            <ul className="space-y-2">
                              {qc.inspection_points.map((point: any, idx: number) => (
                                <li key={idx} className="text-xs text-gray-800 dark:text-gray-200">
                                  <div className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="font-medium">{point.checkpoint || point.method || "Inspection Point"}</p>
                                      {point.acceptance_criteria && (
                                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                                          {point.acceptance_criteria}
                                        </p>
                                      )}
                                      {point.critical && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] mt-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                        >
                                          Critical
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {qc?.common_defects && qc.common_defects.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Common Defects to Check</p>
                            <div className="flex flex-wrap gap-1">
                              {qc.common_defects.map((defect: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                                >
                                  {defect}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              </div>
            )}

          {/* Confidence Score */}
          {(selectedTechFile.confidence_score ||
            selectedTechFile.analysis_data?.confidence_scores) && (
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <CheckCircle className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  Analysis Confidence:{" "}
                  {Math.round(
                    (selectedTechFile.confidence_score ||
                      selectedTechFile.analysis_data?.confidence_scores?.overall ||
                      0.85) * 100
                  )}
                  %
                </span>
              </div>
            )}

          {/* View Image Button */}
          {onViewImage && (
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  onViewImage(
                    selectedTechFile.file_url,
                    selectedTechFile.file_category || selectedTechFile.view_type || "Tech File",
                    selectedTechFile.analysis_data?.summary?.overview || ""
                  );
                }}
              >
                <FileImage className="h-3.5 w-3.5 mr-2" />
                View Image
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TechFileGuideModal;
