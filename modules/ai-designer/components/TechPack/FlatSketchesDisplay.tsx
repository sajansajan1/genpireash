/**
 * FlatSketchesDisplay Component
 *
 * Displays clean black and white vector-style flat sketches with:
 * - Front, Back, Side views
 * - Simple viewing (no annotations/callouts)
 * - Regenerate all functionality
 * - Progressive loading states
 * - Zoom and fullscreen functionality
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pencil,
  RefreshCw,
  Maximize2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import type { FlatSketchData } from "../../store/techPackV2Store";
import { useImageViewerStore } from "../../store/imageViewerStore";

interface FlatSketchesDisplayProps {
  flatSketches: FlatSketchData[];
  onRegenerateAll: () => void;
  isGenerating: boolean;
  productId?: string;
}

const VIEW_TYPES: Array<"front" | "back" | "side"> = ["front", "back", "side"];

const VIEW_LABELS = {
  front: "Front View",
  back: "Back View",
  side: "Side View",
};

export function FlatSketchesDisplay({
  flatSketches,
  onRegenerateAll,
  isGenerating,
  productId,
}: FlatSketchesDisplayProps) {
  const { openViewer } = useImageViewerStore();

  // Organize flat sketches by view type
  const sketchesByView = VIEW_TYPES.reduce(
    (acc, viewType) => {
      acc[viewType] = flatSketches.find((s) => s.viewType === viewType) || null;
      return acc;
    },
    {} as Record<"front" | "back" | "side", FlatSketchData | null>
  );

  const handleViewSketch = (
    sketch: FlatSketchData,
    viewType: "front" | "back" | "side"
  ) => {
    openViewer({
      url: sketch.imageUrl,
      title: `${VIEW_LABELS[viewType]} - Flat Technical Sketch`,
      description:
        "Clean black and white vector-style sketch showing trimming, lining, stitches, and pattern details",
      allowTextEditing: false, // View only as per requirements
    });
  };

  // Don't show section if no flat sketches and not generating
  if (flatSketches.length === 0 && !isGenerating) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-[#1C1917]" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Flat Sketches
          </h3>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 text-gray-600"
          >
            Vector Style
          </Badge>
        </div>

        {/* Regenerate All Button */}
        {flatSketches.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateAll}
            disabled={isGenerating}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <span className="text-[10px]">Regenerate All (2 credits)</span>
          </Button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Clean black and white vector sketches showing trimming, lining, stitch
        patterns, and construction details for pattern making.
      </p>

      {/* Flat Sketches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VIEW_TYPES.map((viewType) => {
          const sketch = sketchesByView[viewType];

          if (!sketch) {
            // Show skeleton loader
            return (
              <Card key={viewType} className="overflow-hidden">
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
                </div>
              </Card>
            );
          }

          if (sketch.loadingState === "loading") {
            return (
              <Card key={viewType} className="overflow-hidden">
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
                        onClick={onRegenerateAll}
                        disabled={isGenerating}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        <span className="text-xs">Retry All</span>
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
                    Click retry to regenerate all flat sketches
                  </p>
                </div>
              </Card>
            );
          }

          // Loaded sketch
          return (
            <Card
              key={viewType}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Image - Clickable to open viewer */}
              <div
                className="relative aspect-square bg-white dark:bg-gray-100 overflow-hidden cursor-pointer group flex-shrink-0"
                onClick={() => handleViewSketch(sketch, viewType)}
              >
                <Image
                  src={sketch.imageUrl}
                  alt={`${VIEW_LABELS[viewType]} - Flat Technical Sketch`}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Maximize2 className="h-8 w-8 text-white" />
                </div>

                {/* Badge */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-white text-gray-800 text-[10px]"
                  >
                    Vector Style
                  </Badge>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-3 flex-1 flex flex-col justify-center">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                  {VIEW_LABELS[viewType]}
                </h4>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2">
                  Clean line drawing showing seams, stitches, and construction
                  details
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
