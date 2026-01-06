"use client";

import { GenpireLogo } from "./genpire-logo";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  showWarning?: boolean;
  estimatedTime?: string;
}

export function LoadingOverlay({
  isVisible,
  message = "Loading...",
  showWarning = false,
  estimatedTime = "a few seconds",
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center space-y-4 max-w-sm mx-4">
        {/* Logo with spinning animation */}
        <div className="relative">
          <GenpireLogo showText={false} className="h-16 w-16 animate-pulse" />
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        {/* Loading dots animation */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>

        {/* Loading message */}
        <p className="text-gray-700 font-medium text-center">{message}</p>

        <p className="text-sm text-gray-500 text-center">This may take {estimatedTime}</p>

        {showWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-yellow-800 text-center font-medium">
              ⚠️ Please do not reload or exit this page before the generation is completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
