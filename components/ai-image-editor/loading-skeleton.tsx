"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingSkeletonProps {
  view: "front" | "back" | "side";
  isLoading: boolean;
  message?: string;
}

export function LoadingSkeleton({ view, isLoading, message }: LoadingSkeletonProps) {
  if (!isLoading) return null;

  const viewLabel = view.charAt(0).toUpperCase() + view.slice(1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg sm:rounded-xl"
      >
        {/* Simple loading spinner */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="h-10 w-10 text-slate-400 dark:text-slate-500" />
        </motion.div>

        {/* View label */}
        <h3 className="mt-4 text-base font-medium text-slate-900 dark:text-slate-100">Generating {viewLabel} View</h3>

        {/* Simple message */}
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message || "Applying your edits..."}</p>
      </motion.div>
    </AnimatePresence>
  );
}

interface RevisionSkeletonProps {
  isCreating: boolean;
  revisionNumber?: number;
  message?: string;
  isInitialGeneration?: boolean;
}

export function RevisionSkeleton({
  isCreating,
  revisionNumber,
  message,
  isInitialGeneration = false,
}: RevisionSkeletonProps) {
  if (!isCreating) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        {/* Card Content - matches the revision card design */}
        <div className="p-3 space-y-2">
          {/* Three view placeholders with skeleton loading */}
          <div className="grid grid-cols-3 gap-1">
            {["Front", "Back", "Side"].map((view, index) => (
              <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative w-full h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded overflow-hidden"
              >
                {/* Animated shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                    delay: index * 0.2,
                  }}
                />
                {/* Loading spinner in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400 dark:text-slate-500" />
                </div>
                {/* View label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                  <span className="text-xs text-white font-medium">{view}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Revision Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {/* Revision badge with loading animation */}
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 dark:bg-primary/20 rounded-md">
                <span className="text-xs font-medium text-zinc-900">
                  {isInitialGeneration ? "Original" : `#${revisionNumber || "..."}`}
                </span>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="h-3 w-3 text-zinc-900" />
                </motion.div>
              </div>
              <span className="text-xs text-[#1C1917] animate-pulse">Generating...</span>
            </div>

            {/* Edit prompt or message */}
            <p className="text-xs text-[#1C1917] line-clamp-2">
              {message ||
                (isInitialGeneration
                  ? "Creating your initial product visualizations"
                  : "Applying your edits to all views")}
            </p>

            {/* Timestamp */}
            <p className="text-xs text-[#1C1917]">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface GenerationStatusProps {
  currentView?: "front" | "back" | "side" | null;
  completedViews: string[];
  totalViews: number;
}

export function GenerationStatus({ currentView, completedViews, totalViews }: GenerationStatusProps) {
  const progress = (completedViews.length / totalViews) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Generating Product Views</h4>
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {completedViews.length} of {totalViews} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
        />
      </div>

      {/* View status indicators */}
      <div className="grid grid-cols-3 gap-2">
        {["front", "back", "side"].map((view) => {
          const isCompleted = completedViews.includes(view);
          const isCurrentView = currentView === view;

          return (
            <div
              key={view}
              className={cn(
                "flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium transition-all",
                isCompleted
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : isCurrentView
                  ? "bg-primary/10 text-zinc-900 animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              )}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
              {isCurrentView && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
            </div>
          );
        })}
      </div>

      {currentView && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-slate-600 dark:text-slate-400 text-center"
        >
          Generating {currentView} view with AI...
        </motion.p>
      )}
    </motion.div>
  );
}
