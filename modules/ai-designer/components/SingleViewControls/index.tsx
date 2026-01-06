"use client";

/**
 * SingleViewControls - Edit button overlay for individual views
 * Allows users to regenerate a specific view with custom instructions
 */

import React, { useState } from "react";
import { Edit3, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ViewType } from "../../types/editor.types";

interface SingleViewControlsProps {
  viewType: ViewType;
  viewUrl: string;
  isLoading?: boolean;
  onEdit: (editInstructions: string) => Promise<void>;
  className?: string;
}

export function SingleViewControls({
  viewType,
  viewUrl,
  isLoading = false,
  onEdit,
  className,
}: SingleViewControlsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editInstructions, setEditInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const viewLabels: Record<ViewType, string> = {
    front: "Front View",
    back: "Back View",
    side: "Side View",
    top: "Top View",
    bottom: "Bottom View",
  };

  const handleSubmit = async () => {
    if (!editInstructions.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onEdit(editInstructions);
      setIsDialogOpen(false);
      setEditInstructions(""); // Clear for next time
    } catch (error) {
      console.error("Failed to regenerate view:", error);
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholderExamples: Record<ViewType, string> = {
    front: "Example: Make the front more rounded, add a logo on the top left",
    back: "Example: Add a zipper in the center, change the back panel color to navy",
    side: "Example: Make the side profile thinner, add visible stitching",
    top: "Example: Change the top surface to have a textured pattern",
    bottom: "Example: Add rubber feet, show the bottom logo",
  };

  return (
    <>
      {/* Edit Button in Corner */}
      <div
        data-single-view-edit="true"
        className={cn(
          "absolute top-2 right-2 z-10",
          className
        )}
        onClick={(e) => {
          // Prevent click from propagating to parent (image viewer)
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseDown={(e) => {
          // Also prevent mousedown from propagating
          e.stopPropagation();
        }}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border">
            <Loader2 className="h-4 w-4 animate-spin text-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Regenerating...</span>
          </div>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsDialogOpen(true);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            variant="secondary"
            size="sm"
            className="gap-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-[600px]"
          onClick={(e) => {
            // Prevent clicks inside the dialog from propagating to parent (image viewer)
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            // Also prevent mousedown from propagating
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Edit3 className="h-4 w-4" />
              Edit {viewLabels[viewType]}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Describe the changes you want to make to this specific view. The other views will
              remain unchanged.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {/* Current View Preview */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Current View</label>
              <div className="relative aspect-square max-h-[200px] w-full rounded-lg border overflow-hidden bg-muted">
                {viewUrl && (
                  <img
                    src={viewUrl}
                    alt={`Current ${viewType} view`}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            {/* Edit Instructions */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-instructions" className="text-xs font-medium">
                Edit Instructions
              </label>
              <Textarea
                id="edit-instructions"
                placeholder={placeholderExamples[viewType]}
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="min-h-[120px] resize-none text-sm"
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground">
                Be specific about what you want to change. The AI will maintain consistency with
                other views.
              </p>
            </div>

            {/* Credit Cost Info */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted border border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Credit Cost
                </span>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                1 credit
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditInstructions("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!editInstructions.trim() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Regenerate View
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
