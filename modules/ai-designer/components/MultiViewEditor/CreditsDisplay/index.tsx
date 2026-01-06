/**
 * CreditsDisplay Component
 * Shows creator credits with icon in a styled badge
 */

import React from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CreditsDisplayProps {
  credits: number;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CreditsDisplay({
  credits,
  compact = false,
  className,
  onClick
}: CreditsDisplayProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 bg-gradient-to-r from-emerald-50 to-teal-50 px-2 py-1 rounded-full border border-emerald-200",
        onClick && "cursor-pointer hover:from-emerald-100 hover:to-teal-100 transition-colors",
        className
      )}
    >
      <Coins className={cn("text-emerald-600", compact ? "h-3 w-3" : "h-3 w-3")} />
      <span className={cn(
        "font-bold text-emerald-900 tabular-nums",
        compact ? "text-[10px]" : "text-[10px] sm:text-xs"
      )}>
        {credits || 0}
      </span>
    </div>
  );
}
