/**
 * ProgressiveViewsGeneration Component
 *
 * Displays progressive generation of remaining views after front view approval.
 * Shows views as they complete with smooth animations and clear status indicators.
 *
 * Features:
 * - Front view displayed (locked/approved)
 * - Remaining views show progressive states: pending → generating → completed
 * - Overall progress bar with percentage
 * - Estimated time remaining
 * - Framer Motion animations for smooth transitions
 * - Mobile responsive design
 * - TypeScript strict mode compliance
 */

import React, { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewType, ViewImages, LoadingStates } from "../../types";

// Types for view generation progress states
type ViewStatus = "pending" | "generating" | "completed";

interface ViewProgress {
  status: ViewStatus;
  imageUrl: string | null;
}

interface ViewGenerationProgress {
  front: ViewProgress;
  back: ViewProgress;
  side: ViewProgress;
  top: ViewProgress;
  bottom: ViewProgress;
}

interface ProgressiveViewsGenerationProps {
  frontViewUrl: string; // Already approved front view
  currentViews: ViewImages; // Current view images
  loadingViews: LoadingStates; // Loading states per view
  className?: string;
}

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const progressBarVariants = {
  initial: { scaleX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

export function ProgressiveViewsGeneration({
  frontViewUrl,
  currentViews,
  loadingViews,
  className,
}: ProgressiveViewsGenerationProps) {
  // Track elapsed time for better time estimates
  const [startTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate view progress based on current views and loading states
  const viewProgress = useMemo<ViewGenerationProgress>(() => {
    const getViewStatus = (view: ViewType): ViewProgress => {
      // Front view is always completed (already approved)
      if (view === "front") {
        return {
          status: "completed",
          imageUrl: frontViewUrl,
        };
      }

      // Check if view has completed
      if (currentViews[view] && currentViews[view] !== "") {
        return {
          status: "completed",
          imageUrl: currentViews[view],
        };
      }

      // Check if view is currently generating
      if (loadingViews[view]) {
        return {
          status: "generating",
          imageUrl: null,
        };
      }

      // Otherwise it's pending
      return {
        status: "pending",
        imageUrl: null,
      };
    };

    return {
      front: getViewStatus("front"),
      back: getViewStatus("back"),
      side: getViewStatus("side"),
      top: getViewStatus("top"),
      bottom: getViewStatus("bottom"),
    };
  }, [frontViewUrl, currentViews, loadingViews]);

  // Calculate overall progress
  const { totalViews, completedViews, progressPercentage } = useMemo(() => {
    const views = Object.entries(viewProgress);
    const total = views.length;
    const completed = views.filter(
      ([_, progress]) => progress.status === "completed"
    ).length;
    const percentage = Math.round((completed / total) * 100);

    return {
      totalViews: total,
      completedViews: completed,
      progressPercentage: percentage,
    };
  }, [viewProgress]);

  // Calculate estimated time remaining
  const estimatedTimeRemaining = useMemo(() => {
    if (completedViews === totalViews) return 0;

    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    const viewsRemaining = totalViews - completedViews;

    // Estimate ~30-40 seconds per view
    const avgSecondsPerView = 15;
    const estimatedSeconds = viewsRemaining * avgSecondsPerView;

    // If we have some completed views (other than front), use actual timing
    if (completedViews > 1 && elapsedSeconds > 0) {
      const actualAvgPerView = elapsedSeconds / (completedViews - 1); // Exclude front view
      return Math.ceil(viewsRemaining * actualAvgPerView);
    }

    return estimatedSeconds;
  }, [completedViews, totalViews, currentTime, startTime]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds === 0) return "Complete!";
    if (seconds < 60) return `~${seconds}s left`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `~${minutes} min left`;
    return `~${minutes}m ${remainingSeconds}s left`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("w-full max-w-4xl mx-auto px-4 sm:px-6 py-8", className)}
    >
      {/* Show front view with generation message */}
      <div className="text-center space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Generating Product Views
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Creating 4 additional views (back, side, top, bottom) to complete your product.
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-medium">
              {formatTimeRemaining(estimatedTimeRemaining)}
            </span>
          </div>
        </div>

        {/* Front view only */}
        <div className="max-w-md mx-auto">
          <div className="text-[10px] font-medium mb-2 text-muted-foreground uppercase tracking-wider">
            Your Approved Front View
          </div>
          <div className="relative w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-md sm:shadow-xl ring-1 ring-border/10">
            {/* Front view image */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={frontViewUrl}
                alt="Front view"
                className="max-w-full max-h-full object-contain blur-sm"
                draggable={false}
              />
            </div>

            {/* Loading overlay - same style as canvas views */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center z-10">
              <div className="text-center">
                <div className="relative mb-4">
                  {/* Animated rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full border-2 border-black animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-t-2 border-black animate-spin"></div>
                  </div>
                  {/* Spacer to maintain size */}
                  <div className="relative h-20 w-20"></div>
                </div>
                <div className="text-base font-semibold text-black mb-1">
                  Generating Views
                </div>
                <div className="text-xs text-black mb-3">
                  Creating back, side, top, bottom views
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-black mb-3">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeRemaining(estimatedTimeRemaining)}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-taupe animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-taupe animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-taupe animate-bounce"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generation status message */}
        <div className="max-w-xl mx-auto p-2 sm:p-3 rounded-lg sm:rounded-xl bg-cream/50 border border-taupe/30">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Layers className="h-3.5 w-3.5 text-navy" />
              </motion.div>
            </div>
            <div className="text-left">
              <h3 className="text-xs font-semibold text-navy mb-0.5">
                Generating Product Views
              </h3>
              <p className="text-[10px] text-navy/70">
                We're creating back, side, top, and bottom views to complete your product. You can continue to create the full product after this step.
              </p>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

export default ProgressiveViewsGeneration;
