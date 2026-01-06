/**
 * SketchesDisplay Component
 *
 * Displays production-ready technical specification sheets with:
 * - Front, Back, Side views
 * - All annotations, callouts, dimensions, and labels baked into the AI-generated images
 * - Individual sketch regeneration
 * - Progressive loading states
 * - Zoom and fullscreen functionality
 * - Clean display of complete technical documentation
 */

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PenTool,
  RefreshCw,
  Maximize2,
  Loader2,
  AlertCircle,
  Ruler,
  FileText,
  X,
} from "lucide-react";
import Image from "next/image";
import type { SketchData } from "../../store/techPackV2Store";
import { useImageViewerStore } from "../../store/imageViewerStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SketchesDisplayProps {
  sketches: SketchData[];
  onRegenerateSingleSketch: (
    viewType: "front" | "back" | "side",
    regeneratePrompt?: string
  ) => void;
  onRegenerateAll: () => void;
  isGenerating: boolean;
  /** Product ID for saving edited sketches */
  productId?: string;
  /** Callback when a sketch image is updated */
  onSketchUpdated?: (sketchId: string, newImageUrl: string) => void;
}

const VIEW_TYPES: Array<"front" | "back" | "side"> = ["front", "back", "side"];

const VIEW_LABELS = {
  front: "Front View",
  back: "Back View",
  side: "Side View",
};

export function SketchesDisplay({
  sketches,
  onRegenerateSingleSketch,
  onRegenerateAll,
  isGenerating,
  productId,
  onSketchUpdated,
}: SketchesDisplayProps) {
  const [regeneratingView, setRegeneratingView] = useState<string | null>(null);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedSketch, setSelectedSketch] = useState<SketchData | null>(null);
  const { openViewer } = useImageViewerStore();

  // Organize sketches by view type
  const sketchesByView = VIEW_TYPES.reduce(
    (acc, viewType) => {
      acc[viewType] = sketches.find((s) => s.viewType === viewType) || null;
      return acc;
    },
    {} as Record<"front" | "back" | "side", SketchData | null>
  );

  const handleRegenerateSketch = async (
    viewType: "front" | "back" | "side"
  ) => {
    setRegeneratingView(viewType);
    try {
      await onRegenerateSingleSketch(viewType);
    } finally {
      setRegeneratingView(null);
    }
  };

  const handleViewSketch = (
    sketch: SketchData,
    viewType: "front" | "back" | "side"
  ) => {
    openViewer({
      url: sketch.imageUrl,
      title: `${VIEW_LABELS[viewType]} - Technical Specification Sheet`,
      description:
        "Production-ready technical specification with all annotations, dimensions, and callouts included",
      allowTextEditing: true,
      onSave: async (imageData: string) => {
        // Save the edited sketch image to the database
        try {
          const response = await fetch('/api/tech-pack-v2/update-sketch-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sketchId: sketch.id,
              imageData,
              productId,
            }),
          });
          return await response.json();
        } catch (error) {
          console.error('Save sketch error:', error);
          return { success: false, error: 'Failed to save image' };
        }
      },
      onImageEdited: (newImageUrl: string) => {
        // Update the sketch with the edited image URL
        console.log(`[SketchesDisplay] Sketch ${viewType} edited and saved, new URL:`, newImageUrl.substring(0, 50) + '...');
        // Notify parent component to update the store
        if (onSketchUpdated) {
          onSketchUpdated(sketch.id, newImageUrl);
        }
      },
    });
  };

  // Don't show section if no sketches and not generating
  if (sketches.length === 0 && !isGenerating) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="h-4 w-4 text-[#1C1917]" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Technical Sketches
          </h3>
        </div>

        {/* Regenerate All Button */}
        {sketches.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateAll}
            disabled={isGenerating}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <span className="text-[10px]">Regenerate All (6 credits)</span>
          </Button>
        )}
      </div>

      {/* Sketches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VIEW_TYPES.map((viewType) => {
          const sketch = sketchesByView[viewType];

          if (!sketch) {
            // Show skeleton loader - same structure as CloseUpsGallery
            return (
              <Card key={viewType} className="overflow-hidden">
                {/* Loading Skeleton with Animation */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 text-[#1C1917] animate-spin mx-auto mb-3" />
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Waiting...
                      </p>
                    </div>
                  </div>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
                {/* Metadata Skeleton */}
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6 mt-1" />
                </div>
              </Card>
            );
          }

          if (sketch.loadingState === "loading") {
            return (
              <Card key={viewType} className="overflow-hidden">
                {/* Loading Skeleton with Animation */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 text-[#1C1917] animate-spin mx-auto mb-3" />
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Generating...
                      </p>
                    </div>
                  </div>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
                {/* Metadata Skeleton */}
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6 mt-1" />
                </div>
              </Card>
            );
          }

          if (sketch.loadingState === "error") {
            return (
              <Card
                key={viewType}
                className="overflow-hidden border-2 border-red-300"
              >
                {/* Error State - same structure as CloseUpsGallery */}
                <div className="relative aspect-square bg-red-50 dark:bg-red-950/20 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-3">
                        Generation Failed
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateSketch(viewType)}
                        disabled={regeneratingView === viewType || isGenerating}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        <span className="text-xs">Retry (2 credits)</span>
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Metadata */}
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                    {VIEW_LABELS[viewType]}
                  </h4>
                  <p className="text-[10px] text-red-600 dark:text-red-400">
                    Click retry to regenerate this sketch
                  </p>
                </div>
              </Card>
            );
          }

          // Loaded sketch - using same structure as CloseUpsGallery
          return (
            <Card
              key={viewType}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Image - Clickable to open viewer */}
              <div
                className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer group flex-shrink-0"
                onClick={() => handleViewSketch(sketch, viewType)}
              >
                <Image
                  src={sketch.imageUrl}
                  alt={`${VIEW_LABELS[viewType]} - Production Technical Specification Sheet`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Maximize2 className="h-8 w-8 text-white" />
                </div>

                {/* Success Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black text-white text-[10px]">
                    Production Ready
                  </Badge>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-3 flex-1 flex flex-col justify-center">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                  {VIEW_LABELS[viewType]}
                </h4>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2">
                  Technical specification sheet with full production details
                </p>
              </div>

              {/* Footer with Action Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (sketch.summary) {
                    setSelectedSketch(sketch);
                    setSummaryDialogOpen(true);
                  }
                }}
                disabled={!sketch.summary}
                className={`p-3 bg-gray-50 dark:bg-gray-800 border-t flex items-center justify-between w-full transition-colors ${
                  sketch.summary ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                  <Ruler className="h-3 w-3" />
                  <span>Full specs included</span>
                </div>
                {sketch.summary && (
                  <div className="flex items-center gap-1 text-[10px] text-[#D4A5AA] dark:text-[#E8B4B8]">
                    <FileText className="h-3 w-3" />
                    <span>View Guide</span>
                  </div>
                )}
              </button>
            </Card>
          );
        })}
      </div>

      {/* Sketch Summary Dialog */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Technical Sketch Guide - {selectedSketch ? VIEW_LABELS[selectedSketch.viewType] : ''}
            </DialogTitle>
          </DialogHeader>

          {selectedSketch?.summary && (
            <div className="space-y-6 mt-4">
              {/* Overview */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Overview</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedSketch.summary.overview}</p>
              </div>

              {/* Measurements */}
              {selectedSketch.summary.measurements && selectedSketch.summary.measurements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Measurements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSketch.summary.measurements.map((measurement, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-900 dark:text-white">{measurement.name}</p>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">{measurement.location}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">{measurement.value}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {selectedSketch.summary.materials && selectedSketch.summary.materials.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Materials & Fabrics</h3>
                  <div className="space-y-2">
                    {selectedSketch.summary.materials.map((material, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{material.type}</p>
                          {material.percentage && (
                            <Badge variant="outline" className="text-[10px]">{material.percentage}</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">{material.location}</p>
                        {material.properties && material.properties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {material.properties.map((prop, propIdx) => (
                              <Badge key={propIdx} variant="secondary" className="text-[10px]">{prop}</Badge>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Construction Details */}
              {selectedSketch.summary.construction && selectedSketch.summary.construction.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Construction Details</h3>
                  <div className="space-y-2">
                    {selectedSketch.summary.construction.map((detail, idx) => (
                      <Card key={idx} className="p-3">
                        <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{detail.feature}</p>
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 mb-2">{detail.details}</p>
                        <Badge variant="outline" className="text-[10px]">{detail.technique}</Badge>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Features */}
              {selectedSketch.summary.designFeatures && selectedSketch.summary.designFeatures.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Design Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSketch.summary.designFeatures.map((feature, idx) => (
                      <Card key={idx} className="p-3">
                        <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{feature.name}</p>
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 mb-1">{feature.description}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{feature.location}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {selectedSketch.summary.colors && selectedSketch.summary.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Color Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedSketch.summary.colors.map((color, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {color.hex && (
                            <div
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                          )}
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{color.name}</p>
                        </div>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400">{color.location}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{color.coverage}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Manufacturing Notes */}
              {selectedSketch.summary.manufacturingNotes && selectedSketch.summary.manufacturingNotes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Manufacturing Notes</h3>
                  <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <ul className="space-y-2">
                      {selectedSketch.summary.manufacturingNotes.map((note, idx) => (
                        <li key={idx} className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Summary */}
              {selectedSketch.summary.summary && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
                  <Card className="p-4 bg-[#E8B4B8]/10 dark:bg-[#E8B4B8]/5 border-[#E8B4B8] dark:border-[#D4A5AA]">
                    <p className="text-xs text-gray-800 dark:text-gray-200">{selectedSketch.summary.summary}</p>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
