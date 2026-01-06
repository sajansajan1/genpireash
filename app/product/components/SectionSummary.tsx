"use client";

/**
 * SectionSummary - Editable summary/explanation for each product section
 * Displays a brief description of the section's purpose and content
 * Users can click to edit the summary inline
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Check, X, Loader2, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionSummaryProps {
  sectionKey: string;
  summary: string | undefined;
  onSave: (summary: string) => Promise<void>;
  onGenerateAI?: () => Promise<string>;
  isGenerating?: boolean;
  placeholder?: string;
  className?: string;
}

export function SectionSummary({
  sectionKey,
  summary,
  onSave,
  onGenerateAI,
  isGenerating = false,
  placeholder = "Click to add a summary for this section...",
  className,
}: SectionSummaryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(summary || "");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(summary || "");
  }, [summary]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === summary) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save summary:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(summary || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
    // Allow Cmd/Ctrl + Enter to save
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  const handleGenerateAI = async () => {
    if (!onGenerateAI) return;
    try {
      const generated = await onGenerateAI();
      setEditValue(generated);
      setIsEditing(true);
    } catch (error) {
      console.error("Failed to generate summary:", error);
    }
  };

  if (isEditing) {
    return (
      <div className={cn("mb-4 p-3 bg-muted/30 rounded-lg border border-border/50", className)}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Section Summary</span>
        </div>
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[80px] text-sm resize-none"
          placeholder={placeholder}
          disabled={isSaving}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            Press Cmd/Ctrl + Enter to save, Esc to cancel
          </span>
          <div className="flex items-center gap-1">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleSave}
                >
                  <Check className="h-3.5 w-3.5 text-green-600 mr-1" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleCancel}
                >
                  <X className="h-3.5 w-3.5 text-red-600 mr-1" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Display mode - show summary or placeholder
  if (!summary && !isGenerating) {
    return (
      <div className={cn("mb-4", className)}>
        <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-dashed border-border/50 hover:bg-muted/30 transition-colors">
          <Info className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 text-left text-sm text-muted-foreground italic hover:text-foreground transition-colors"
          >
            {placeholder}
          </button>
          <div className="flex items-center gap-1">
            {onGenerateAI && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate summary with AI</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add summary manually</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className={cn("mb-4 p-3 bg-muted/30 rounded-lg border border-border/50", className)}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          <span className="text-sm text-muted-foreground">Generating summary...</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "mb-4 p-3 bg-muted/20 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors group",
              className
            )}
            onClick={() => setIsEditing(true)}
          >
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
                {summary}
              </p>
              <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0 mt-0.5" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to edit summary</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SectionSummary;
