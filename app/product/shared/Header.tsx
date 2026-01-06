"use client";

/**
 * Shared Header Component
 * Base header shell for product pages - public mode shows logo/badge,
 * private mode renders children (action buttons)
 */

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SharedHeaderProps {
  /** Public/read-only mode - shows simple header with logo and badge */
  readOnly?: boolean;
  /** Product name (optional, for public mode) */
  productName?: string;
  /** Children to render on the left side (for private mode nav buttons) */
  leftContent?: React.ReactNode;
  /** Children to render on the right side (for private mode action buttons) */
  rightContent?: React.ReactNode;
  /** Function to open comment modal */
  handleOpenCommentModal?: () => any;
}

export function SharedHeader({
  readOnly = false,
  productName,
  leftContent,
  rightContent,
  handleOpenCommentModal,
}: SharedHeaderProps) {
  if (readOnly) {
    // Public mode - simple header with logo and badge
    return (
      <header className="flex-shrink-0 border-b bg-background z-10">
        <div className="flex justify-between items-center px-3 py-2 gap-2 min-h-[48px]">
          {/* Left side - Logo and badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/favicon.png"
                alt="Genpire"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="font-semibold text-base hidden sm:inline">Genpire</span>
            </Link>
            <Badge variant="secondary" className="gap-1 text-xs h-8 px-2.5">
              <Eye className="h-3 w-3" />
              Public View
            </Badge>
          </div>

          {/* Right side - optional actions for public mode */}

          <div className="flex items-center gap-1.5">
            <div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleOpenCommentModal?.()}
              >
                <MessageCircle className="h-4 w-4" />
                Comment
              </Button>
            </div>
          </div>

        </div>
      </header>
    );
  }

  // Private/authenticated mode - custom left and right content
  return (
    <header className="flex-shrink-0 border-b bg-background z-10">
      <div className="flex justify-between items-center px-3 py-2 gap-2 min-h-[48px]">
        {/* Left side - navigation buttons */}
        {leftContent && (
          <div className="flex items-center gap-1">
            {leftContent}
          </div>
        )}

        {/* Right side - action buttons */}
        {rightContent && (
          <div className="flex items-center gap-1.5">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}

export default SharedHeader;
