"use client";

/**
 * Shared InfoBar Component
 * Displays product information bar below header
 * Works in both authenticated and public modes
 * NOTE: Views/Likes stats temporarily hidden for future use
 */

import { Badge } from "@/components/ui/badge";
// TEMPORARILY HIDDEN - Imports commented out for future use
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Calendar, Eye, ThumbsUp } from "lucide-react";
import { Calendar } from "lucide-react";
import { formatDate } from "./utils";

interface SharedInfoBarProps {
  /** Product name */
  productName: string;
  /** Product description */
  description?: string;
  /** Product category */
  category?: string;
  /** Creation date string */
  createdAt?: string;
  /** View count (for public pages) - TEMPORARILY HIDDEN */
  viewCount?: number;
  /** Upvote count (for public pages) - TEMPORARILY HIDDEN */
  upvoteCount?: number;
  /** Whether to show public stats (views, upvotes) - TEMPORARILY HIDDEN */
  showPublicStats?: boolean;
  /** Additional actions to render on the right side */
  actions?: React.ReactNode;
}

export function SharedInfoBar({
  productName,
  description,
  category,
  createdAt,
  // TEMPORARILY HIDDEN - Props commented out for future use
  // viewCount,
  // upvoteCount,
  // showPublicStats = false,
  actions,
}: SharedInfoBarProps) {
  const displayDate = createdAt ? formatDate(createdAt) : "Recently";

  return (
    <div className="bg-muted/30 border-b px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold truncate">{productName}</h1>
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {displayDate}
            </span>
          </div>
        </div>

        {/* Right side - either public stats or custom actions */}
        {/* TEMPORARILY HIDDEN - Views/Likes stats commented out for future use */}
        {/* showPublicStats ? (
          <TooltipProvider>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 cursor-default">
                    <Eye className="h-3.5 w-3.5" />
                    {viewCount || 0}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{viewCount || 0} views</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 cursor-default">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {upvoteCount || 0}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{upvoteCount || 0} upvotes</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ) : */ actions ? (
          actions
        ) : null}
      </div>
    </div>
  );
}

export default SharedInfoBar;
