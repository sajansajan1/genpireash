/**
 * FloatingControls Component
 * Floating action buttons displayed over the canvas (desktop only)
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

export interface FloatingControlsProps {
  showHistory: boolean;
  onToggleHistory: () => void;
}

export function FloatingControls({
  showHistory,
  onToggleHistory,
}: FloatingControlsProps) {
  return (
    <>
      {/* Floating History Button - Show when history is hidden */}
      {!showHistory && (
        <div
          className="absolute right-4 hidden sm:block"
          style={{ top: "80px" }}
        >
          <Button
            onClick={onToggleHistory}
            className="bg-white hover:bg-gray-50 text-gray-700 shadow-lg rounded-lg px-3 py-2 border border-gray-200"
            size="sm"
          >
            <History className="h-4 w-4 mr-1.5" />
            <span className="text-xs font-medium">History</span>
          </Button>
        </div>
      )}
    </>
  );
}
