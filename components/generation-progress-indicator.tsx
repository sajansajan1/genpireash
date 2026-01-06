"use client";

import { useEffect, useState } from "react";
import { GENERATION_STATUS_MESSAGES, TOTAL_GENERATION_TIME, GenerationStatusMessage } from "@/lib/constants/generation-status-messages";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";

interface GenerationProgressIndicatorProps {
  isVisible: boolean;
  onComplete?: () => void;
  messages?: GenerationStatusMessage[];
  totalDuration?: number;
}

export function GenerationProgressIndicator({
  isVisible,
  onComplete,
  messages = GENERATION_STATUS_MESSAGES,
  totalDuration = TOTAL_GENERATION_TIME
}: GenerationProgressIndicatorProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleting, setIsCompleting] = useState(false);

  const currentMessage = messages[currentMessageIndex];

  // Format time as MM:SS
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Reset state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      // Reset all state when hidden
      setCurrentMessageIndex(0);
      setProgress(0);
      setElapsedTime(0);
      setIsCompleting(false);
      return;
    }

    // Reset start time when becoming visible
    setStartTime(Date.now());
  }, [isVisible]);

  // Main progress timer
  useEffect(() => {
    if (!isVisible || isCompleting) return;

    // Update elapsed time every 100ms for smooth countdown
    const timeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      // Calculate overall progress
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(progressPercent);

      // If we've reached 100%, start completing
      if (progressPercent >= 100) {
        setIsCompleting(true);
        clearInterval(timeInterval);

        // Show completion message briefly, then hide
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    }, 100);

    return () => clearInterval(timeInterval);
  }, [isVisible, startTime, totalDuration, onComplete, isCompleting]);

  useEffect(() => {
    if (!isVisible) return;

    // Calculate which message should be showing based on elapsed time
    let accumulatedTime = 0;
    let messageIndex = 0;

    for (let i = 0; i < messages.length; i++) {
      accumulatedTime += messages[i].duration;
      if (elapsedTime < accumulatedTime) {
        messageIndex = i;
        break;
      }
    }

    setCurrentMessageIndex(messageIndex);
  }, [elapsedTime, isVisible, messages]);

  const remainingTime = Math.max(0, totalDuration - elapsedTime);

  // Get the icon component dynamically
  const IconComponent = isCompleting
    ? LucideIcons.CheckCircle2
    : (LucideIcons as any)[currentMessage.icon] || LucideIcons.Sparkles;

  // Show completion message when done
  const displayMessage = isCompleting
    ? "Product generated successfully!"
    : currentMessage.message;

  const displayDescription = isCompleting
    ? "Your design is ready to view"
    : currentMessage.description;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-sm"
        >
      <div className="w-full py-3 sm:py-4">
        <div className="flex items-center justify-between mb-3 px-4 sm:px-6">
          {/* Message Section */}
          <div className="flex-1 min-w-0 mr-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                <div className="flex items-center gap-2">
                  {/* Icon with your color scheme */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${
                    isCompleting
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-stone-100 dark:bg-stone-800"
                  }`}>
                    <IconComponent className={`w-3.5 h-3.5 ${
                      isCompleting
                        ? "text-green-600 dark:text-green-400"
                        : "text-[#18181B] dark:text-stone-200"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-[#18181B] dark:text-white">
                      {displayMessage}
                    </span>
                  </div>
                  {!isCompleting && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="flex-shrink-0 w-3 h-3 border-2 border-[#18181B] dark:border-white border-t-transparent rounded-full"
                    />
                  )}
                </div>
                <p className="text-xs text-[#1C1917]/70 dark:text-stone-400 ml-8">
                  {displayDescription}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Timer Section */}
          <div className="flex flex-col items-end space-y-0.5">
            <div className="flex items-center gap-1.5">
              <LucideIcons.Clock className="w-3.5 h-3.5 text-[#18181B] dark:text-white" />
              <span className="text-xs font-medium text-[#18181B] dark:text-white tabular-nums">
                {formatTime(remainingTime)}
              </span>
            </div>
            <span className="text-[10px] text-[#1C1917]/60 dark:text-stone-500">
              remaining
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 sm:px-6">
          <div className="relative w-full h-1.5 bg-stone-200 dark:bg-stone-800 overflow-hidden rounded-full">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#18181B] to-[#403A35] dark:from-stone-700 dark:to-stone-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          </div>
        </div>

        {/* Progress Percentage and Step Counter */}
        <div className="flex items-center justify-between mt-3 px-4 sm:px-6">
          <span className="text-xs text-[#1C1917]/60 dark:text-stone-500">
            Step {currentMessageIndex + 1} of {messages.length}
          </span>
          <span className="text-xs font-medium text-[#18181B] dark:text-white tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
