/**
 * WorkflowModeSwitcher Component
 * Toggle between "All Views", "Front Versions", and "Tech Pack" modes
 * Smart 3-state workflow selector
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Package, Layers, Image } from "lucide-react";
import type { WorkflowMode } from "../../../store/editorStore";
import {
  ProgressStepper,
  type StepData,
} from "@/components/ui/progress-stepper";

export interface WorkflowModeSwitcherProps {
  workflowMode: WorkflowMode;
  onModeChange: (mode: WorkflowMode) => void;
  hasTechPack?: boolean; // Whether tech pack is available
  className?: string;
  isDemo?: boolean; // Whether in demo mode (disables Factory Specs)
}

export function WorkflowModeSwitcher({
  workflowMode,
  onModeChange,
  hasTechPack = false,
  className,
  isDemo = false,
}: WorkflowModeSwitcherProps) {
  const modes = [
    {
      id: "front-view" as WorkflowMode,
      label: "Front Versions",
      mobileLabel: "Versions",
      icon: Image,
      description: "View front variations",
      step: 1,
    },
    {
      id: "multi-view" as WorkflowMode,
      label: "All Views",
      mobileLabel: "Views",
      icon: Layers,
      description: "View all product angles",
      step: 2,
    },
    {
      id: "tech-pack" as WorkflowMode,
      label: "Factory Specs",
      mobileLabel: "Specs",
      icon: Package,
      description: "Manufacturing specs",
      disabled: false, // Always allow access to Factory Specs for dimensions/materials input
      step: 3,
    },
  ];

  // Get current step index
  const currentStepIndex = modes.findIndex((mode) => mode.id === workflowMode);

  // Get completed steps (all steps before current, excluding disabled ones)
  const completedStepIndices = modes
    .map((mode, index) => {
      if (index < currentStepIndex && !mode.disabled) {
        return index;
      }
      return -1;
    })
    .filter((index) => index !== -1);

  // Custom render for interactive stepper
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-1",
        className
      )}
    >
      <div className="flex items-center">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          const isActive = workflowMode === mode.id;
          const isDisabled = mode.disabled;
          const isCompleted = completedStepIndices.includes(index);
          const isLast = index === modes.length - 1;

          return (
            <React.Fragment key={mode.id}>
              <div
                className="relative flex-1 flex items-center"
                style={{ marginRight: isLast ? 0 : "-5px" }}
              >
                {/* Arrow Step Button */}
                <button
                  onClick={() => !isDisabled && onModeChange(mode.id)}
                  disabled={isDisabled}
                  className={cn(
                    "relative flex items-center justify-center gap-2",
                    "w-full py-2.5 px-4 text-xs font-medium transition-all duration-300",
                    isCompleted && "text-black",
                    isActive && !isCompleted && "bg-[#1C1917] text-white",
                    !isActive &&
                    !isCompleted &&
                    !isDisabled &&
                    "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    isDisabled &&
                    "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60",
                    !isLast && "clip-arrow",
                    isLast && "rounded-r-lg",
                    index === 0 && "rounded-l-lg"
                  )}
                  style={{
                    backgroundColor: isCompleted ? "#d8d1ca" : undefined,
                    clipPath:
                      index === 0
                        ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)"
                        : !isLast
                          ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)"
                          : "polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)",
                  }}
                  title={
                    isDisabled
                      ? (isDemo && mode.id === "tech-pack"
                        ? "Demo Mode - Factory Specs disabled"
                        : "Generate tech pack first")
                      : mode.description
                  }
                >
                  <div className="flex items-center gap-2 relative z-10">
                    <Icon className="h-3.5 w-3.5" />

                    {/* Show full label on desktop, short label on mobile */}
                    <span className="hidden sm:inline whitespace-nowrap">
                      {mode.label}
                    </span>
                    <span className="inline sm:hidden whitespace-nowrap">
                      {mode.mobileLabel}
                    </span>

                    {/* Badge for unavailable tech pack */}
                    {mode.id === "tech-pack" && !hasTechPack && (
                      <span className="ml-1 h-1.5 w-1.5 bg-white rounded-full opacity-70" />
                    )}
                  </div>
                </button>

                {/* Gray border between steps - positioned at the arrow edge */}
                {!isLast && (
                  <div className="absolute right-[-11px] top-1/2 -translate-y-1/2 w-[1px] h-8  z-20" />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
