/**
 * SystemMessage component for displaying system updates and progress messages
 * with expandable content and special visual treatment
 */

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Zap,
  Search,
  Settings,
  FileCode,
  Eye,
  Palette,
  Send,
  Brain,
  Image,
  Code2,
  Maximize2,
  FileText,
  Camera,
  Layers,
  Cpu,
  Activity,
  Cloud,
  Package,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../../types";

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}

interface SystemMessageProps {
  message: ChatMessage;
}

// Map of keywords to icons for automatic icon selection - all using gray colors
const iconMap: Record<string, React.ReactNode> = {
  analyzing: <Search className="h-3 w-3 text-gray-500" />,
  optimizing: <Sparkles className="h-3 w-3 text-gray-500" />,
  vision: <Eye className="h-3 w-3 text-gray-500" />,
  design: <Palette className="h-3 w-3 text-gray-500" />,
  sending: <Send className="h-3 w-3 text-gray-500" />,
  "ai prompt": <Brain className="h-3 w-3 text-gray-500" />,
  screenshot: <Camera className="h-3 w-3 text-gray-500" />,
  capturing: <Camera className="h-3 w-3 text-gray-500" />,
  context: <FileText className="h-3 w-3 text-gray-500" />,
  generating: <RefreshCw className="h-3 w-3 text-gray-500" />,
  processing: <Cpu className="h-3 w-3 text-gray-500" />,
  complete: <CheckCircle2 className="h-3 w-3 text-gray-600" />,
  success: <CheckCircle2 className="h-3 w-3 text-gray-600" />,
  error: <AlertCircle className="h-3 w-3 text-gray-500" />,
  full: <FileText className="h-3 w-3 text-gray-500" />,
  building: <Layers className="h-3 w-3 text-gray-500" />,
  preparing: <Activity className="h-3 w-3 text-gray-500" />,
  request: <Send className="h-3 w-3 text-gray-500" />,
  updated: <CheckCircle2 className="h-3 w-3 text-gray-600" />,
};

// Get icon based on message content - using consistent gray colors
const getMessageIcon = (content: string, metadata?: any) => {
  const lowerContent = content.toLowerCase();

  // Check metadata for specific flags - all using gray tones
  if (metadata?.isOptimizing)
    return <Sparkles className="h-3 w-3 text-gray-500" />;
  if (metadata?.usingVision) return <Eye className="h-3 w-3 text-gray-500" />;
  if (metadata?.visionOptimizationComplete)
    return <CheckCircle2 className="h-3 w-3 text-gray-600" />;
  if (metadata?.isRequestSummary)
    return <Send className="h-3 w-3 text-gray-500" />;
  if (metadata?.isFinalPrompt)
    return <Brain className="h-3 w-3 text-gray-500" />;
  if (metadata?.isContextSummary)
    return <FileCode className="h-3 w-3 text-gray-500" />;

  // Check content for keywords
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (lowerContent.includes(keyword)) {
      return icon;
    }
  }

  // Default icon
  return <Info className="h-3 w-3 text-gray-400" />;
};

// Determine if content should be expandable
const shouldBeExpandable = (content: string) => {
  // Expandable if longer than 150 chars or contains certain keywords
  return (
    content.length > 150 ||
    content.includes("Full AI Prompt") ||
    content.includes("Context Summary") ||
    content.includes("###") ||
    content.split("\n").length > 2
  );
};

// Format text to handle long words and URLs
const formatText = (text: string) => {
  // Handle URLs first (shorten them)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  text = text.replace(urlRegex, (url) => {
    if (url.length <= 20) return url;
    const firstPart = url.substring(0, 10);
    const lastPart = url.substring(url.length - 7);
    return `${firstPart}...${lastPart}`;
  });

  // Handle long words (break them if > 15 chars)
  const words = text.split(" ");
  const formattedWords = words.map((word) => {
    // Skip if it's already a shortened URL
    if (word.includes("...")) return word;

    // Break long words with soft hyphens or truncate
    if (word.length > 15) {
      // For very long words, truncate with ellipsis
      if (word.length > 30) {
        return word.substring(0, 27) + "...";
      }
      // For moderately long words, add word-break opportunity
      return word;
    }
    return word;
  });

  return formattedWords.join(" ");
};

// Get preview text for collapsed state
const getPreviewText = (content: string, maxLength: number = 100) => {
  // Format the content first
  const formatted = formatText(content);

  // If content has multiple lines, show first line
  const lines = formatted.split("\n");
  if (lines.length > 1) {
    const firstLine = lines[0];
    if (firstLine.length <= maxLength) {
      return firstLine;
    }
  }

  // Otherwise truncate at maxLength
  if (formatted.length <= maxLength) return formatted;
  return formatted.substring(0, maxLength).trim() + "...";
};

export function SystemMessage({ message }: SystemMessageProps) {
  const isExpandable = shouldBeExpandable(message.content);
  // For processing/loading messages, default to collapsed
  const isProcessingMessage = message.message_type === "processing" ||
                              message.metadata?.isTemporary ||
                              message.metadata?.isProcessingGroup;
  const [isExpanded, setIsExpanded] = useState(!isProcessingMessage && isExpandable); // Collapsed for processing, expanded for others
  const [height, setHeight] = useState<number | "auto">("auto");
  const contentRef = useRef<HTMLDivElement>(null);
  const icon = getMessageIcon(message.content, message.metadata);

  // Get message styling based on type and metadata - using consistent app colors
  const getMessageStyle = () => {
    const { metadata } = message;

    // Success/Complete states - use neutral gray with subtle difference
    if (
      metadata?.visionOptimizationComplete ||
      metadata?.optimizationComplete
    ) {
      return "bg-gray-50/70 border-gray-300 text-gray-700";
    }

    // Active/Processing states - slightly darker gray
    if (metadata?.usingVision || metadata?.isOptimizing) {
      return "bg-gray-50/50 border-gray-200 text-gray-600";
    }

    // Important/Final states - use slightly warmer gray
    if (
      metadata?.isFinalPrompt ||
      metadata?.isContextSummary ||
      metadata?.isRequestSummary
    ) {
      return "bg-stone-50/50 border-stone-200 text-stone-600";
    }

    // Default system message style
    return "bg-gray-50/40 border-gray-200 text-gray-600";
  };

  // Handle animated height for smooth expand/collapse
  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        const scrollHeight = contentRef.current.scrollHeight;
        setHeight(scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, [isExpanded]);

  // Check if this is a progress/loading message
  const isLoading =
    message.metadata?.isTemporary ||
    message.content.includes("Generating") ||
    message.content.includes("Processing") ||
    message.content.includes("Analyzing");

  // Check if this is a processing group message (should use static icon)
  const isProcessingGroup = message.metadata?.isProcessingGroup;

  return (
    <div className="relative mb-5 animate-in slide-in-from-bottom-1 duration-200">
      <div
        className={cn(
          "relative rounded-lg border backdrop-blur-sm shadow-sm transition-all duration-200",
          "hover:shadow-md max-w-full",
          getMessageStyle(),
          isExpandable && "cursor-pointer"
        )}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        {/* Main content area */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-2 w-full">
            {/* Icon - static for processing groups, animated for temporary loaders */}
            <div
              className={cn(
                "mt-0.5 flex-shrink-0",
                isLoading && !isProcessingGroup && "animate-spin"
              )}
            >
              {isLoading ? (
                isProcessingGroup ? (
                  <Settings className="h-3 w-3 text-gray-500" />
                ) : (
                  <Loader2 className="h-3 w-3 text-gray-500" />
                )
              ) : (
                icon
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {/* Show image inline for view generation messages or design grid captures */}
              {(message.metadata?.isViewGeneration ||
                message.metadata?.isDesignGrid) &&
              message.metadata?.imageUrl ? (
                <div className="space-y-2">
                  <span className="text-xs text-gray-600">
                    {formatText(message.content)}
                  </span>
                  <div className="bg-gray-50 p-1.5 rounded-lg">
                    <img
                      src={message.metadata.imageUrl}
                      alt={
                        message.metadata?.isDesignGrid
                          ? "Design grid with all views"
                          : `${message.metadata?.viewType || "Generated"} view`
                      }
                      className={cn(
                        "w-full h-auto rounded border border-gray-200",
                        message.metadata?.isDesignGrid
                          ? "max-w-[300px]"
                          : "max-w-[200px]"
                      )}
                    />
                  </div>
                </div>
              ) : /* Regular content display */
              isExpandable && !isExpanded ? (
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="text-xs break-words overflow-wrap-anywhere flex-1">
                    {getPreviewText(message.content)}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[10px] opacity-50">Show details</span>
                    <ChevronDown className="h-3 w-3 opacity-50 transform rotate-[-90deg]" />
                  </div>
                </div>
              ) : (
                <div
                  className="text-xs"
                  style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                >
                  {!isExpandable ? (
                    <span className="inline-block max-w-full">
                      {formatText(message.content)}
                    </span>
                  ) : (
                    <>
                      {/* Header when expanded */}
                      <div className="flex items-center justify-between gap-2 mb-3 w-full">
                        <span
                          className="flex-1"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {formatText(message.content.split("\n")[0])}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[10px] opacity-50">Hide details</span>
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </div>
                      </div>

                      {/* Expandable content */}
                      <div
                        ref={contentRef}
                        className="overflow-hidden transition-all duration-300"
                        style={{
                          height: isExpanded ? height : 0,
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        <div className="pt-3 pl-1 border-t border-current/5">
                          {/* Format the content */}
                          {message.content
                            .split("\n")
                            .slice(1)
                            .map((line, index) => {
                              const formattedLine = formatText(line);

                              // Check if it's a bullet point
                              if (
                                line.trim().startsWith("•") ||
                                line.trim().startsWith("-")
                              ) {
                                return (
                                  <div key={index} className="flex gap-2 py-1">
                                    <span className="text-current/40 text-xs flex-shrink-0">
                                      •
                                    </span>
                                    <span
                                      className="text-xs opacity-80 flex-1"
                                      style={{
                                        wordBreak: "break-word",
                                        overflowWrap: "anywhere",
                                      }}
                                    >
                                      {formatText(line.replace(/^[•-]\s*/, ""))}
                                    </span>
                                  </div>
                                );
                              }

                              // Check if it's a numbered list
                              if (/^\d+\./.test(line.trim())) {
                                return (
                                  <div key={index} className="py-1">
                                    <span
                                      className="text-xs opacity-80"
                                      style={{
                                        wordBreak: "break-word",
                                        overflowWrap: "anywhere",
                                      }}
                                    >
                                      {formattedLine}
                                    </span>
                                  </div>
                                );
                              }

                              // Check if it's code or technical content
                              if (line.includes("###") || line.includes("**")) {
                                return (
                                  <div
                                    key={index}
                                    className="font-mono text-xs bg-black/5 rounded-md px-3 py-2 my-2 overflow-x-auto"
                                    style={{
                                      wordBreak: "break-all",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {formatText(line.replace(/###|\*\*/g, ""))}
                                  </div>
                                );
                              }

                              // Regular line
                              if (line.trim()) {
                                return (
                                  <div
                                    key={index}
                                    className="text-xs opacity-80 py-1"
                                    style={{
                                      wordBreak: "break-word",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {formattedLine}
                                  </div>
                                );
                              }

                              return null;
                            })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timestamp row */}
          {message.created_at && (
            <div className="flex justify-end mt-0.5">
              <div
                className="opacity-20"
                style={{ fontSize: "10px", lineHeight: "1" }}
              >
                {formatRelativeTime(new Date(message.created_at))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemMessage;
