/**
 * AssemblyViewDisplay Component
 *
 * Displays the assembly/exploded view with:
 * - Single image showing component relationships
 * - Regenerate functionality
 * - Loading states
 * - Zoom and fullscreen functionality
 * - View Guide for assembly instructions
 */

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Layers,
  RefreshCw,
  Maximize2,
  Loader2,
  AlertCircle,
  FileText,
  Package,
  Link2,
  Wrench,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import Image from "next/image";
import type { AssemblyViewData } from "../../store/techPackV2Store";
import { useImageViewerStore } from "../../store/imageViewerStore";

interface AssemblyViewDisplayProps {
  assemblyView: AssemblyViewData | null;
  onRegenerate: () => void;
  isGenerating: boolean;
  productId?: string;
}

export function AssemblyViewDisplay({
  assemblyView,
  onRegenerate,
  isGenerating,
  productId,
}: AssemblyViewDisplayProps) {
  const { openViewer } = useImageViewerStore();
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);

  const handleViewImage = () => {
    if (assemblyView?.imageUrl) {
      openViewer({
        url: assemblyView.imageUrl,
        title: "Assembly View - Exploded/Build View",
        description:
          "Exploded view showing component relationships, assembly order, and connection points",
        allowTextEditing: false, // View only
      });
    }
  };

  // Don't show section if no assembly view and not generating
  if (!assemblyView && !isGenerating) {
    return null;
  }

  // Loading state - waiting or generating
  if (!assemblyView || assemblyView.loadingState === "loading") {
    return (
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#1C1917]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Assembly View
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 text-gray-600"
            >
              Exploded
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Exploded view showing how the product is assembled, with components
          separated to reveal construction logic and relationships.
        </p>

        {/* Loading Card */}
        <Card className="overflow-hidden">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-10 w-10 text-[#1C1917] animate-spin mx-auto mb-3" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Generating assembly view...
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
      </div>
    );
  }

  // Error state
  if (assemblyView.loadingState === "error") {
    return (
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#1C1917]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Assembly View
            </h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <span className="text-[10px]">Retry (2 credits)</span>
          </Button>
        </div>

        {/* Error Card */}
        <Card className="overflow-hidden border-2 border-red-300">
          <div className="relative aspect-[4/3] bg-red-50 dark:bg-red-950/20 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-3">
                  Generation Failed
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRegenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span className="text-xs">Retry</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
              Assembly View
            </h4>
            <p className="text-[10px] text-red-600 dark:text-red-400">
              Click retry to regenerate the assembly view
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Loaded state
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#1C1917]" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Assembly View
          </h3>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 text-gray-600"
          >
            Exploded
          </Badge>
        </div>

        {/* Regenerate Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isGenerating}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          <span className="text-[10px]">Regenerate (2 credits)</span>
        </Button>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Exploded view showing how the product is assembled, with components
        separated to reveal construction logic, production steps, and
        relationships.
      </p>

      {/* Assembly View Card */}
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image - Clickable to open viewer */}
        <div
          className="relative aspect-[4/3] bg-white dark:bg-gray-100 overflow-hidden cursor-pointer group"
          onClick={handleViewImage}
        >
          <Image
            src={assemblyView.imageUrl}
            alt="Assembly View - Exploded/Build View"
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
              Exploded View
            </Badge>
          </div>
        </div>

        {/* Metadata and View Guide Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (assemblyView.summary) {
              setGuideDialogOpen(true);
            }
          }}
          disabled={!assemblyView.summary}
          className={`p-4 bg-gray-50 dark:bg-gray-800 border-t flex items-center justify-between w-full transition-colors ${
            assemblyView.summary ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" : "cursor-default"
          }`}
        >
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1 text-left">
              Product Assembly View
            </h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 text-left">
              {assemblyView.description ||
                "Shows component relationships, assembly order, and connection points for manufacturing guidance"}
            </p>
          </div>
          {assemblyView.summary && (
            <div className="flex items-center gap-1 text-[10px] text-[#D4A5AA] dark:text-[#E8B4B8]">
              <FileText className="h-3 w-3" />
              <span>View Guide</span>
            </div>
          )}
        </button>
      </Card>

      {/* Assembly Guide Dialog */}
      <Dialog open={guideDialogOpen} onOpenChange={setGuideDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1C1917] dark:text-white">
              <Layers className="h-5 w-5 text-[#D4A5AA]" />
              Assembly Guide - Exploded View
            </DialogTitle>
          </DialogHeader>

          {assemblyView?.summary && (
            <div className="space-y-6 mt-4">
              {/* Overview Section */}
              {assemblyView.summary.overview && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-[#1C1917] dark:text-white">
                    <Layers className="h-4 w-4 text-[#D4A5AA]" />
                    Overview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {assemblyView.summary.overview}
                  </p>
                </div>
              )}

              {/* Components Section */}
              {assemblyView.summary.components && assemblyView.summary.components.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-[#1C1917] dark:text-white">
                    <Package className="h-4 w-4 text-[#D4A5AA]" />
                    Components
                  </h3>
                  <div className="grid gap-2">
                    {assemblyView.summary.components.map((component: any, idx: number) => (
                      <div key={idx} className="bg-[#FDF8F8] dark:bg-gray-800 rounded-lg p-3 border border-[#E8B4B8]/20">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#1C1917] dark:bg-white text-white dark:text-[#1C1917] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-medium">
                              {component.number || idx + 1}
                            </span>
                            <span className="text-xs font-medium text-[#1C1917] dark:text-white">
                              {component.name}
                            </span>
                            {component.material && (
                              <span className="text-[10px] text-[#D4A5AA]">
                                ({component.material})
                              </span>
                            )}
                          </div>
                          {component.quantity && (
                            <Badge variant="outline" className="text-[10px] border-[#D4A5AA] text-[#D4A5AA]">
                              ×{component.quantity}
                            </Badge>
                          )}
                        </div>
                        {component.role && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 ml-7">
                            {component.role}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assembly Sequence Section */}
              {assemblyView.summary.assemblySequence && assemblyView.summary.assemblySequence.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-[#1C1917] dark:text-white">
                    <Clock className="h-4 w-4 text-[#D4A5AA]" />
                    Assembly Sequence
                  </h3>
                  <div className="space-y-2">
                    {assemblyView.summary.assemblySequence.map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-3 bg-[#FDF8F8] dark:bg-gray-800 rounded-lg p-3 border border-[#E8B4B8]/20">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1C1917] flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {step.step || idx + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[#1C1917] dark:text-white font-medium">
                            {step.action}
                          </p>
                          {step.technique && (
                            <p className="text-[10px] text-[#D4A5AA] mt-1">
                              Technique: {step.technique}
                            </p>
                          )}
                          {step.notes && (
                            <p className="text-[10px] text-gray-500 mt-0.5 italic">
                              {step.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connection Points Section */}
              {assemblyView.summary.connectionPoints && assemblyView.summary.connectionPoints.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-[#1C1917] dark:text-white">
                    <Link2 className="h-4 w-4 text-[#D4A5AA]" />
                    Connection Points
                  </h3>
                  <div className="grid gap-2">
                    {assemblyView.summary.connectionPoints.map((point: any, idx: number) => (
                      <div key={idx} className="bg-[#FDF8F8] dark:bg-gray-800 rounded-lg p-3 border border-[#E8B4B8]/20">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#1C1917] dark:text-white">
                            {point.location}
                          </span>
                          {point.type && (
                            <Badge variant="outline" className="text-[10px] border-[#D4A5AA] text-[#D4A5AA]">
                              {point.type}
                            </Badge>
                          )}
                        </div>
                        {point.componentsJoined && point.componentsJoined.length > 0 && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                            Joins: {point.componentsJoined.join(" + ")}
                          </p>
                        )}
                        {point.description && (
                          <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                            {point.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools Required Section */}
              {assemblyView.summary.toolsRequired && assemblyView.summary.toolsRequired.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-[#1C1917] dark:text-white">
                    <Wrench className="h-4 w-4 text-[#D4A5AA]" />
                    Tools Required
                  </h3>
                  <div className="grid gap-2">
                    {assemblyView.summary.toolsRequired.map((tool: any, idx: number) => (
                      <div key={idx} className="bg-[#FDF8F8] dark:bg-gray-800 rounded-lg p-3 border border-[#E8B4B8]/20">
                        <p className="text-xs font-medium text-[#1C1917] dark:text-white">
                          {typeof tool === "string" ? tool : tool.tool || tool.name}
                        </p>
                        {typeof tool !== "string" && tool.purpose && (
                          <p className="text-[10px] text-gray-500 mt-1">{tool.purpose}</p>
                        )}
                        {typeof tool !== "string" && tool.specification && (
                          <Badge variant="outline" className="text-[10px] mt-2 border-[#D4A5AA] text-[#D4A5AA]">{tool.specification}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Checkpoints Section */}
              {assemblyView.summary.qualityCheckpoints && assemblyView.summary.qualityCheckpoints.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-[#1C1917] dark:text-white">
                    <ClipboardCheck className="h-4 w-4 text-[#D4A5AA]" />
                    Quality Checkpoints
                  </h3>
                  <div className="bg-[#FDF8F8] dark:bg-gray-800 rounded-lg p-4 border border-[#E8B4B8]/20">
                    <ul className="space-y-3">
                      {assemblyView.summary.qualityCheckpoints.map((checkpoint: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <ClipboardCheck className="h-3.5 w-3.5 text-[#D4A5AA] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[#1C1917] dark:text-white font-medium">
                              {typeof checkpoint === "string" ? checkpoint : checkpoint.checkpoint || checkpoint.name}
                            </p>
                            {typeof checkpoint !== "string" && checkpoint.criteria && (
                              <p className="text-[10px] text-gray-500 mt-0.5">{checkpoint.criteria}</p>
                            )}
                            {typeof checkpoint !== "string" && checkpoint.timing && (
                              <Badge variant="outline" className="text-[10px] mt-1 border-[#D4A5AA] text-[#D4A5AA]">{checkpoint.timing}</Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
