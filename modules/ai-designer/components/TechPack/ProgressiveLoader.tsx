/**
 * ProgressiveLoader Component
 *
 * Displays real-time Tech Pack V2 generation progress with:
 * - Overall progress bar (0-100%)
 * - Step-by-step status indicators
 * - Sub-progress for active steps
 * - Credit cost display
 * - Estimated time remaining
 * - Beautiful gradient design
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Eye,
  Package,
  Focus,
  PenTool,
  Pencil,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { UseTechPackGenerationReturn } from "../../hooks/useTechPackGeneration";

interface ProgressiveLoaderProps {
  // Props from useTechPackGeneration hook
  isGenerating: boolean;
  progress: number;
  currentStepInfo: {
    name: string;
    color: string;
  };
  stepProgress: {
    category: number;
    baseViews: number;
    components: number;
    closeUps: number;
    sketches: number;
    flatSketches: number;
    assemblyView: number;
  };
  estimatedTimeRemaining: string | null;
  credits: {
    total: number;
  };
  // Optional: Only show specific sections (for section-by-section generation)
  visibleSections?: Array<"category" | "baseViews" | "components" | "closeUps" | "sketches" | "flatSketches" | "assemblyView">;
}

interface StepConfig {
  id: "category" | "baseViews" | "components" | "closeUps" | "sketches" | "flatSketches" | "assemblyView";
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  creditCost: number;
  estimatedTime: string;
}

const STEPS: StepConfig[] = [
  {
    id: "category",
    name: "Category Detection",
    description: "AI analyzing product type and category",
    icon: Sparkles,
    creditCost: 0, // Free - included in base views
    estimatedTime: "5-10s",
  },
  {
    id: "baseViews",
    name: "Base View Analysis",
    description: "Detailed analysis of each product view",
    icon: Eye,
    creditCost: 1, // 1 credit for base view analysis
    estimatedTime: "30-45s",
  },
  {
    id: "components",
    name: "Component Images",
    description: "Generating isolated component/ingredient visuals",
    icon: Package,
    creditCost: 2, // 2 credits for component images
    estimatedTime: "60-90s",
  },
  {
    id: "closeUps",
    name: "Close-Up Generation",
    description: "Creating detailed close-up shots",
    icon: Focus,
    creditCost: 2, // 2 credits for close-ups
    estimatedTime: "45-60s",
  },
  {
    id: "sketches",
    name: "Technical Sketches",
    description: "Generating technical drawings with measurements",
    icon: PenTool,
    creditCost: 6, // 6 credits for 3 sketches
    estimatedTime: "30-45s",
  },
  {
    id: "flatSketches",
    name: "Flat Sketches",
    description: "Generating clean vector-style flat drawings",
    icon: Pencil,
    creditCost: 2, // 2 credits for 3 flat sketches
    estimatedTime: "20-30s",
  },
  {
    id: "assemblyView",
    name: "Assembly View",
    description: "Generating exploded view showing component relationships",
    icon: Layers,
    creditCost: 2, // 2 credits for assembly view
    estimatedTime: "15-25s",
  },
];

export function ProgressiveLoader({
  isGenerating,
  progress,
  currentStepInfo,
  stepProgress,
  estimatedTimeRemaining,
  credits,
  visibleSections,
}: ProgressiveLoaderProps) {
  // Filter steps to only show relevant ones
  const stepsToShow = visibleSections
    ? STEPS.filter(step => visibleSections.includes(step.id))
    : STEPS;
  /**
   * Determine step status based on progress
   */
  const getStepStatus = (
    stepId: string
  ): "pending" | "in-progress" | "completed" | "error" => {
    if (currentStepInfo.color === "red") {
      return "error";
    }

    const progressValue = stepProgress[stepId as keyof typeof stepProgress];

    if (progressValue === 100) {
      return "completed";
    }

    if (progressValue > 0) {
      return "in-progress";
    }

    return "pending";
  };

  /**
   * Status colors and icons
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-[#E8B4B8] bg-[#E8B4B8]/10";
      case "in-progress":
        return "text-[#1C1917] bg-[#1C1917]/10";
      case "error":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5" />;
      case "in-progress":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (!isGenerating && progress === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {isGenerating
              ? "Generating Factory Specs..."
              : "Generation Complete"}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {currentStepInfo.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {estimatedTimeRemaining && isGenerating && (
            <Badge variant="secondary" className="text-xs">
              {estimatedTimeRemaining}
            </Badge>
          )}

          <Badge variant="outline" className="text-xs">
            {credits.total} credits used
          </Badge>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            {Math.round(progress)}%
          </span>
        </div>

        <Progress
          value={progress}
          className="h-2 bg-gray-200 dark:bg-gray-700"
        />
      </div>

      {/* Step-by-Step Progress */}
      <div className="space-y-4">
        {stepsToShow.map((step, index) => {
          const status = getStepStatus(step.id);
          const stepProgressValue = stepProgress[step.id];
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-300
                ${
                  status === "in-progress"
                    ? "border-[#1C1917] bg-gray-50 dark:bg-gray-950/20"
                    : status === "completed"
                      ? "border-[#E8B4B8] bg-[#E8B4B8]/10 dark:bg-[#E8B4B8]/5"
                      : status === "error"
                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                        : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Step Icon */}
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    ${getStatusColor(status)}
                  `}
                >
                  {status === "in-progress" ||
                  status === "completed" ||
                  status === "error" ? (
                    getStatusIcon(status)
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                        {step.name}
                      </h4>

                      <Badge variant="outline" className="text-[10px]">
                        {step.creditCost} credit{step.creditCost > 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {status !== "pending" && (
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                        {Math.round(stepProgressValue)}%
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                    {step.description}
                  </p>

                  {/* Sub-progress bar for active/completed steps */}
                  {status !== "pending" && (
                    <Progress
                      value={stepProgressValue}
                      className="h-1.5 bg-gray-200 dark:bg-gray-700"
                    />
                  )}

                  {/* Estimated time for pending steps */}
                  {status === "pending" && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-500">
                      Est. {step.estimatedTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Connector line to next step */}
              {index < stepsToShow.length - 1 && (
                <div
                  className={`
                    absolute left-[29px] top-[60px] w-0.5 h-4
                    ${
                      status === "completed"
                        ? "bg-[#E8B4B8]"
                        : "bg-gray-300 dark:bg-gray-600"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error State */}
      {currentStepInfo.color === "red" && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-red-900 dark:text-red-100">
                Generation Failed
              </h4>
              <p className="text-[10px] text-red-700 dark:text-red-300 mt-1">
                An error occurred during generation. Your credits have been
                refunded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {!isGenerating &&
        progress === 100 &&
        currentStepInfo.color === "green" && (
          <div className="mt-4 p-3 bg-[#E8B4B8]/10 dark:bg-[#E8B4B8]/5 border-2 border-[#E8B4B8] rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-[#E8B4B8] mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  Tech Pack Complete
                </h4>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 mt-1">
                  All assets have been generated successfully. Scroll down to
                  view your tech pack.
                </p>
              </div>
            </div>
          </div>
        )}
    </Card>
  );
}
