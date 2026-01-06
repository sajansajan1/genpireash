/**
 * BottomControlsBar Component
 * Bottom controls overlay with Quick Edits (Colorize + AI Micro Edits), Zoom, and Next buttons
 */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ZoomIn, ZoomOut, ArrowRight, ChevronDown, Palette, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LoadingStates, ViewportState } from "../../../types";
import type { GenerationState, WorkflowMode } from "../../../store/editorStore";
import type { GenerationMode } from "@/app/actions/create-product-entry";

export interface BottomControlsBarProps {
  isVisualEditMode: boolean;
  isSystemBusy: boolean;
  generationState: GenerationState;
  workflowMode: WorkflowMode;
  loadingViews: LoadingStates;
  viewport: ViewportState;
  mobileActiveTab: string;
  onToggleVisualEdit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onNext: () => void;
  className?: string;
  // Colorize props
  generationMode?: GenerationMode;
  onConvertToRegular?: () => void;
  isConverting?: boolean;
  isDemo?: boolean;
}

export function BottomControlsBar({
  isVisualEditMode,
  isSystemBusy,
  generationState,
  workflowMode,
  loadingViews,
  viewport,
  mobileActiveTab,
  onToggleVisualEdit,
  onZoomIn,
  onZoomOut,
  onNext,
  className,
  generationMode,
  onConvertToRegular,
  isConverting = false,
  isDemo = false,
}: BottomControlsBarProps) {
  const [isQuickEditsOpen, setIsQuickEditsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if colorize should be shown (non-regular generation mode)
  const showColorize = generationMode && generationMode !== "regular" && onConvertToRegular;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickEditsOpen(false);
      }
    };

    if (isQuickEditsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isQuickEditsOpen]);

  return (
    <div
      className={cn(
        "fixed sm:absolute bottom-0 left-0 right-0 p-3 sm:p-4 pointer-events-none transition-all duration-300 flex z-50 justify-center",
        isVisualEditMode && "bottom-20",
        // Hide on mobile when not on views tab
        mobileActiveTab !== "views" && "hidden sm:flex",
        className
      )}
    >
      <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 w-full sm:w-auto">
        {/* Quick Edits Dropdown - Only show in multi-view mode */}
        {!isVisualEditMode &&
          (generationState === "completed" || generationState === "idle") &&
          workflowMode === "multi-view" && (
            <div className="pointer-events-auto order-1 sm:order-1 relative" ref={dropdownRef}>
              <Button
                disabled={isSystemBusy || isConverting}
                className={cn(
                  "h-9 px-4 sm:px-5 rounded-full shadow-md transition-all duration-200 flex items-center gap-1.5",
                  isSystemBusy || isConverting
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-[#1C1917] hover:bg-[#2a2825] text-white hover:shadow-lg cursor-pointer"
                )}
                onClick={() => {
                  if (isSystemBusy || isConverting) return;
                  setIsQuickEditsOpen(!isQuickEditsOpen);
                }}
              >
                <Wand2 className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {isSystemBusy ? (
                    "Processing..."
                  ) : isConverting ? (
                    "Converting..."
                  ) : (
                    "Quick Edits"
                  )}
                </span>
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform rotate-180",
                  isQuickEditsOpen && "rotate-0"
                )} />
              </Button>

              {/* Dropdown Menu */}
              {isQuickEditsOpen && (
                <div className="absolute bottom-full mb-2 left-0 bg-[#1C1917] rounded-lg shadow-lg border border-[#2a2825] overflow-hidden min-w-[180px]">
                  <div className="py-1">
                    {/* Colorize Option - Only show for non-regular modes */}
                    {showColorize && (
                      <button
                        onClick={() => {
                          if (!isDemo && onConvertToRegular) {
                            onConvertToRegular();
                          }
                          setIsQuickEditsOpen(false);
                        }}
                        disabled={isConverting || isDemo}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2825] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConverting ? (
                          <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Palette className="h-3.5 w-3.5 text-white" />
                        )}
                        <span className="text-xs font-medium text-white">
                          {isConverting ? "Converting..." : "Colorize"}
                        </span>
                      </button>
                    )}

                    {/* AI Micro Edits Option */}
                    <button
                      onClick={() => {
                        onToggleVisualEdit();
                        setIsQuickEditsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2825] transition-colors text-left"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                      <span className="text-xs font-medium text-white">AI Micro Edits</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Zoom Controls - Only show in multi-view mode */}
        {!isVisualEditMode &&
          (generationState === "completed" || generationState === "idle") &&
          workflowMode === "multi-view" && (
            <div className="pointer-events-auto order-1 sm:order-2 flex items-center gap-0.5 bg-white rounded-full shadow-md px-2 py-1 border border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-full cursor-pointer"
                onClick={onZoomOut}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-semibold text-gray-800 min-w-[42px] text-center">
                {viewport.zoomLevel}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-full cursor-pointer"
                onClick={onZoomIn}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

        {/* Next Button - Mobile only - Only show in multi-view mode */}
        {!isVisualEditMode &&
          (generationState === "completed" || generationState === "idle") &&
          workflowMode === "multi-view" &&
          !Object.values(loadingViews).some((isLoading) => isLoading) && (
            <div className="sm:hidden pointer-events-auto order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                className="h-9 px-3 rounded-full shadow-md bg-white hover:bg-gray-50 border border-gray-200 cursor-pointer flex items-center gap-1"
              >
                <span className="text-xs font-medium text-gray-700">Next</span>
                <ArrowRight className="h-4 w-4 text-gray-700" />
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
