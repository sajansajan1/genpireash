/**
 * LoadingOverlay Component
 * Full-screen loading overlay with animated spinner
 */

import React from "react";

export interface LoadingOverlayProps {
  show: boolean;
  isCleaningSession?: boolean;
  hasExistingViews?: boolean;
  title?: string;
  subtitle?: string;
}

export function LoadingOverlay({
  show,
  isCleaningSession = false,
  hasExistingViews = false,
  title,
  subtitle,
}: LoadingOverlayProps) {
  // Don't show if we have existing views data
  if (!show || hasExistingViews) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-2 border-navy/20 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-t-2 border-navy animate-spin"></div>
            </div>
            {/* Center dot */}
            <div className="relative flex items-center justify-center h-16 w-16">
              <div className="h-2 w-2 rounded-full bg-navy animate-pulse"></div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {title || (isCleaningSession
              ? "Wrapping things up..."
              : "Preparing Your Design Studio")}
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            {subtitle || (isCleaningSession
              ? "Just a moment while we save your work"
              : "Get ready to bring your ideas to life")}
          </p>
        </div>
      </div>
    </div>
  );
}
