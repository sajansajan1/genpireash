"use client";

import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2,
  Send,
  Sparkles,
  User,
  Bot,
  CheckCircle2,
  Image as ImageIcon,
  AlertCircle,
  ScanLine,
  Info,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { RevisionSummaryCard, type RevisionSummaryProps } from "./revision-summary-card";
import { extractImagesFromText } from "@/lib/utils/format-message-content";

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

export type ChatMessageType =
  | "user"
  | "ai"
  | "system"
  | "image-ready"
  | "analysis"
  | "processing"
  | "error"
  | "success";

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  timestamp: Date;
  metadata?: {
    view?: "front" | "back" | "side";
    imageUrl?: string;
    progress?: number;
    duration?: number;
    summary?: RevisionSummaryProps;
    intent?: string;
    isScreenshot?: boolean;
    capturedViews?: string[];
    isInitialRequest?: boolean;
    hasDesignFile?: boolean;
    hasLogo?: boolean;
    hasUploadedDesign?: boolean;
    contextualInfo?: any;
  };
}

interface AIChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  currentView?: "front" | "back" | "side" | null;
  className?: string;
  onImageClick?: (imageUrl: string, title: string) => void;
}

export function AIChatPanel({
  messages,
  onSendMessage,
  isProcessing,
  currentView,
  className,
  onImageClick,
}: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    view?: string;
  } | null>(null);
  const [imageZoom, setImageZoom] = useState(100);
  const [imageRotation, setImageRotation] = useState(0);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLimitReached = messages.length >= 250;

  const handleSend = () => {
    if (input.trim() && !isProcessing && !isLimitReached) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image viewer handlers
  const handleImageClick = (imageUrl: string, view?: string) => {
    if (onImageClick) {
      const title = view ? `${view.charAt(0).toUpperCase() + view.slice(1)} View` : "Product Image";
      onImageClick(imageUrl, title);
    } else {
      setSelectedImage({ url: imageUrl, view });
      setImageZoom(100);
      setImageRotation(0);
    }
  };

  const handleZoomIn = () => {
    setImageZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setImageZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const handleCloseViewer = () => {
    setSelectedImage(null);
    setImageZoom(100);
    setImageRotation(0);
  };

  const getMessageIcon = (type: ChatMessageType) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "ai":
        return <Bot className="h-4 w-4" />;
      case "system":
        return <Info className="h-4 w-4" />;
      case "image-ready":
        return <ImageIcon className="h-4 w-4" />;
      case "analysis":
        return <ScanLine className="h-4 w-4" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMessageStyle = (type: ChatMessageType) => {
    const baseStyle = "relative overflow-hidden transition-all duration-300";

    switch (type) {
      case "user":
        return cn(
          baseStyle,
          "bg-gradient-to-br from-primary to-primary/90",
          "text-zinc-900-foreground shadow-lg shadow-primary/20",
          "border border-primary/20"
        );
      case "ai":
        return cn(
          baseStyle,
          "bg-gradient-to-br from-slate-50 to-slate-100/50",
          "dark:from-slate-900/50 dark:to-slate-800/30",
          "backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50",
          "shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50"
        );
      case "system":
        return cn(
          baseStyle,
          "bg-gradient-to-br from-slate-100/90 to-slate-200/50",
          "dark:from-slate-800/30 dark:to-slate-700/20",
          "text-slate-700 dark:text-slate-300",
          "border border-slate-200/50 dark:border-slate-700/50",
          "backdrop-blur-xl shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30"
        );
      case "image-ready":
        return cn(
          baseStyle,
          "bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-emerald-100/50",
          "dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-900/20",
          "text-emerald-700 dark:text-emerald-300",
          "border border-emerald-200/50 dark:border-emerald-800/50",
          "backdrop-blur-xl shadow-xl shadow-emerald-200/30 dark:shadow-emerald-950/30"
        );
      case "analysis":
        return cn(
          baseStyle,
          "bg-gradient-to-br from-purple-50/90 to-purple-100/50",
          "dark:from-purple-950/30 dark:to-purple-900/20",
          "text-purple-700 dark:text-purple-300",
          "border border-purple-200/50 dark:border-purple-800/50",
          "backdrop-blur-xl shadow-lg shadow-purple-200/30 dark:shadow-purple-950/30"
        );
      case "processing":
        return cn(
          baseStyle,
          "bg-gradient-to-br from-slate-50/90 to-slate-100/50",
          "dark:from-slate-900/30 dark:to-slate-800/20",
          "text-slate-600 dark:text-slate-400",
          "border border-slate-200/50 dark:border-slate-700/50",
          "backdrop-blur-xl shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30"
        );
      case "success":
        return cn(
          baseStyle,
          "bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-emerald-100/50",
          "dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-900/20",
          "text-emerald-700 dark:text-emerald-300",
          "border border-emerald-200/50 dark:border-emerald-800/50",
          "backdrop-blur-xl shadow-xl shadow-emerald-200/30 dark:shadow-emerald-950/30"
        );
      case "error":
        return cn(
          baseStyle,
          "bg-gradient-to-br from-red-50/90 to-red-100/50",
          "dark:from-red-950/30 dark:to-red-900/20",
          "text-red-700 dark:text-red-300",
          "border border-red-200/50 dark:border-red-800/50",
          "backdrop-blur-xl shadow-lg shadow-red-200/30 dark:shadow-red-950/30"
        );
      default:
        return cn(
          baseStyle,
          "bg-gradient-to-br from-slate-50 to-slate-100/50",
          "dark:from-slate-900/50 dark:to-slate-800/30",
          "backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50"
        );
    }
  };

  const getAvatarStyle = (type: ChatMessageType) => {
    switch (type) {
      case "image-ready":
      case "success":
        return "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30";
      case "analysis":
        return "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30";
      case "processing":
        return "bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shadow-slate-400/30 animate-pulse";
      case "error":
        return "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30";
      case "system":
        return "bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg shadow-slate-500/30";
      case "ai":
        return "bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-500/30";
      default:
        return "bg-gradient-to-br from-slate-500 to-slate-600";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        "border-l border-border/50",
        "shadow-2xl shadow-black/5",
        "relative overflow-hidden bg-white",
        className
      )}
    >
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {/* Premium Header */}
      <div className="relative p-4 border-b bg-white backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg overflow-hidden bg-white flex items-center justify-center">
            <img src="/favicon.png" alt="Genpire Logo" className="w-5 h-5 object-contain" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-base bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Genpire Ai Assistant
            </h5>
            <div className="flex items-center gap-2 mt-0.5">
              {isProcessing ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Processing your request...</p>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Ready to edit</p>
                </>
              )}
            </div>
          </div>

          {/* Message Counter with Warning Indicators */}
          <div className="flex flex-col items-end gap-1">
            <div
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full transition-all",
                messages.length >= 250
                  ? "bg-destructive/20 text-destructive animate-pulse"
                  : messages.length >= 225
                  ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                  : messages.length >= 200
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-muted/50 text-[#1C1917]"
              )}
            >
              {messages.length}/250
            </div>
            {messages.length >= 225 && messages.length < 250 && (
              <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">Near limit</p>
            )}
            {messages.length >= 250 && (
              <p className="text-[10px] text-destructive font-medium animate-pulse">Limit reached</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area with Premium Background */}
      <ScrollArea className="flex-1 relative" ref={scrollAreaRef}>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20 pointer-events-none" />
        <div className="p-4 space-y-4 relative">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
                <MessageCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2">Start a Conversation</h4>
              <p className="text-xs text-gray-500 max-w-[250px]">
                Describe how you want to modify your product design. I'll help bring your vision to life.
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn("flex gap-3", message.type === "user" && "justify-end")}
              >
                {message.type !== "user" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background shadow-xl">
                      <AvatarFallback className={cn("text-white", getAvatarStyle(message.type))}>
                        {getMessageIcon(message.type)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                )}

                <div className={cn("flex flex-col gap-2 max-w-[75%]", message.type === "user" && "items-end")}>
                  <motion.div
                    className={cn(
                      "rounded-2xl px-4 py-3 relative group",
                      getMessageStyle(message.type),
                      message.type === "user" && "rounded-br-md",
                      message.type !== "user" && "rounded-bl-md"
                    )}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Gradient overlay for premium feel */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                    {/* Render RevisionSummaryCard for summary messages */}
                    {message.metadata?.summary ? (
                      <RevisionSummaryCard
                        {...message.metadata.summary}
                        className="bg-transparent border-0 shadow-none p-0"
                      />
                    ) : (
                      (() => {
                        const { cleanedText, images } = extractImagesFromText(message.content);

                        // If there are images in the markdown, update the message metadata
                        if (images.length > 0 && !message.metadata?.imageUrl) {
                          // Use the first image as the main image
                          message.metadata = {
                            ...message.metadata,
                            imageUrl: images[0].url,
                          };
                        }

                        // Format message for better readability with markdown support
                        const formatMessageContent = (content: string) => {
                          // Split content by lines for better formatting
                          const lines = content.split("\n");

                          return lines.map((line, lineIndex) => {
                            // Check for numbered lists (e.g., "1. ", "2. ")
                            const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
                            if (numberedMatch) {
                              const [, number, text] = numberedMatch;
                              return (
                                <div key={lineIndex} className="flex gap-2 mt-2">
                                  <span className="font-bold text-zinc-900/80 min-w-[20px]">{number}.</span>
                                  <div className="flex-1">{formatInlineMarkdown(text)}</div>
                                </div>
                              );
                            }

                            // Check for bullet points (-, *, •)
                            const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
                            if (bulletMatch) {
                              return (
                                <div key={lineIndex} className="flex gap-2 mt-1.5">
                                  <span className="text-zinc-900/60">•</span>
                                  <div className="flex-1">{formatInlineMarkdown(bulletMatch[1])}</div>
                                </div>
                              );
                            }

                            // Regular paragraph
                            if (line.trim()) {
                              return (
                                <div key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
                                  {formatInlineMarkdown(line)}
                                </div>
                              );
                            }

                            // Empty line (paragraph break)
                            return <div key={lineIndex} className="h-2" />;
                          });
                        };

                        // Helper function to format inline markdown (bold, italic, etc.)
                        const formatInlineMarkdown = (text: string) => {
                          // Replace **bold** with strong tags
                          const boldRegex = /\*\*([^*]+)\*\*/g;
                          const parts = [];
                          let lastIndex = 0;
                          let match;

                          while ((match = boldRegex.exec(text)) !== null) {
                            // Add text before the match
                            if (match.index > lastIndex) {
                              parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
                            }

                            // Add the bold text
                            parts.push(
                              <strong key={`bold-${match.index}`} className="font-bold text-sm text-zinc-900/90">
                                {match[1]}
                              </strong>
                            );

                            lastIndex = match.index + match[0].length;
                          }

                          // Add remaining text
                          if (lastIndex < text.length) {
                            parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
                          }

                          return parts.length > 0 ? parts : text;
                        };

                        return (
                          <div
                            className={cn(
                              "text-xs leading-relaxed font-medium relative z-10 space-y-1",
                              message.type === "user" && "text-white"
                            )}
                          >
                            {/* Special formatting for intent detection messages */}
                            {message.type === "system" && message.content.includes("Intent detected:") ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#1C1917]">AI understood this as:</span>
                                <Badge variant="secondary" className="text-xs">
                                  {message.content.replace("Intent detected: ", "")}
                                </Badge>
                              </div>
                            ) : (
                              formatMessageContent(cleanedText || message.content)
                            )}
                          </div>
                        );
                      })()
                    )}

                    {/* Premium image preview for messages with images */}
                    {message.metadata?.imageUrl && (
                      <motion.div
                        className="mt-3 relative z-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div
                          className="relative group cursor-pointer overflow-hidden rounded-xl"
                          onClick={() => handleImageClick(message.metadata?.imageUrl!, message.metadata?.view)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-10" />
                          <img
                            src={message.metadata?.imageUrl}
                            alt={message.metadata?.summary ? "Annotated screenshot" : `${message.metadata?.view} view`}
                            className={`rounded-xl w-full transition-all duration-500 group-hover:scale-105 ${
                              message.metadata?.summary
                                ? "max-h-64 object-contain bg-white"
                                : message.metadata?.isScreenshot
                                ? "max-h-80 object-contain bg-white"
                                : "max-h-40 object-cover"
                            }`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                            <motion.div
                              className="bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full p-3 shadow-2xl"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ZoomIn className="h-5 w-5 text-slate-700 dark:text-white" />
                            </motion.div>
                          </div>
                          <div className="absolute bottom-2 left-2 z-20">
                            <Badge className="bg-white/90 dark:bg-black/90 backdrop-blur-md text-slate-700 dark:text-white border-0 shadow-lg px-3 py-1 font-semibold">
                              {message.metadata?.summary
                                ? "Annotated Screenshot"
                                : message.metadata?.isScreenshot
                                ? "Design Screenshot"
                                : message.metadata?.view
                                ? `${message.metadata.view.charAt(0).toUpperCase()}${message.metadata.view.slice(
                                    1
                                  )} View`
                                : "View"}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Premium progress indicator for processing messages */}
                    {message.type === "processing" && message.metadata?.progress && (
                      <motion.div className="mt-3 relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="relative">
                          <div className="w-full bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 shadow-lg shadow-amber-500/50"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${message.metadata.progress}%`,
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                              }}
                              transition={{
                                width: { duration: 0.5 },
                                backgroundPosition: {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                },
                              }}
                              style={{ backgroundSize: "200% 100%" }}
                            />
                          </div>
                          <p className="text-xs mt-2 font-semibold flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            {message.metadata.progress}% Complete
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  <div className="flex items-center gap-2">
                    <motion.span
                      className={cn(
                        "text-xs font-medium px-2 opacity-60",
                        message.type === "user" ? "text-zinc-900" : "text-[#1C1917]"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ delay: 0.2 }}
                    >
                      {formatRelativeTime(new Date(message.timestamp))}
                    </motion.span>

                    {/* Retry button for user and error messages */}
                    {(message.type === "user" || message.type === "error") && (
                      <motion.button
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                          "p-1.5 rounded-lg hover:bg-muted/50",
                          "flex items-center gap-1",
                          message.type === "error"
                            ? "text-destructive/60 hover:text-destructive"
                            : "text-[#1C1917] hover:text-zinc-900",
                          retryingMessageId === message.id && "opacity-100"
                        )}
                        onClick={async () => {
                          if (retryingMessageId) return; // Prevent multiple retries

                          setRetryingMessageId(message.id);

                          // For user messages, resend the same content
                          if (message.type === "user") {
                            onSendMessage(message.content);
                          }
                          // For error messages, try to find the last user message and retry it
                          else if (message.type === "error") {
                            const lastUserMessage = messages
                              .slice(0, messages.indexOf(message))
                              .reverse()
                              .find((m) => m.type === "user");
                            if (lastUserMessage) {
                              onSendMessage(lastUserMessage.content);
                            }
                          }

                          // Reset retrying state after a short delay
                          setTimeout(() => {
                            setRetryingMessageId(null);
                          }, 1000);
                        }}
                        disabled={retryingMessageId === message.id || isProcessing}
                        title={message.type === "error" ? "Retry last message" : "Retry message"}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {retryingMessageId === message.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCw className="h-3.5 w-3.5" />
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>

                {message.type === "user" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background shadow-xl">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Premium Processing Status Bar */}
      <AnimatePresence>
        {currentView && (
          <motion.div
            className="border-t bg-gradient-to-r from-amber-50/50 via-amber-100/30 to-amber-50/50 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-amber-950/30 backdrop-blur-xl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
                  <div className="absolute inset-0 blur-xl bg-amber-500/50 animate-pulse" />
                </div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Generating {currentView} view
                </span>
                <div className="flex gap-1 ml-auto">
                  {["front", "back", "side"].map((view) => (
                    <div
                      key={view}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        view === currentView ? "bg-amber-500 animate-pulse" : "bg-amber-300/50 dark:bg-amber-700/50"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Input Area */}
      <div className="relative border-t bg-gradient-to-b from-muted/30 to-background backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="p-3 sm:p-4">
          <div className="flex items-end gap-2">
            {/* Textarea box */}
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isLimitReached ? "Message limit reached (250 messages)" : "Describe what you want to change..."
                }
                disabled={isProcessing || isLimitReached}
                className={cn(
                  "min-h-[32px] max-h-[40px] resize-none",
                  "text-sm leading-tight px-2.5 py-1.5 rounded-md",
                  "bg-background/60 backdrop-blur-sm border border-muted/30",
                  "placeholder:text-muted-foreground/60 focus:border-primary/40",
                  "focus:ring-0 focus:shadow-sm focus:shadow-primary/10 transition-all duration-200"
                )}
                rows={2}
              />
              {input.length > 0 && (
                <motion.div
                  className="absolute bottom-1 right-2 text-[10px] text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                >
                  {input.length} chars
                </motion.div>
              )}
            </div>

            {/* Send button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing || isLimitReached}
                size="icon"
                className={cn(
                  "h-[32px] w-[32px] rounded-md",
                  "bg-primary text-white",
                  "hover:bg-primary/90 transition-all duration-200",
                  "shadow-sm shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal - Only show if no external handler */}
      {!onImageClick && (
        <Dialog open={!!selectedImage} onOpenChange={() => handleCloseViewer()}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="flex items-center justify-between">
                <span>
                  {selectedImage?.view
                    ? `${selectedImage.view.charAt(0).toUpperCase() + selectedImage.view.slice(1)} View`
                    : "Image Viewer"}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={imageZoom <= 50}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#1C1917] min-w-[50px] text-center">{imageZoom}%</span>
                  <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={imageZoom >= 200}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCloseViewer}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="relative overflow-auto max-h-[calc(90vh-80px)] bg-muted/20">
              <div className="flex items-center justify-center min-h-[400px] p-4">
                {selectedImage && (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.view ? `${selectedImage.view} view` : "Product image"}
                    className="max-w-full h-auto object-contain transition-transform duration-200"
                    style={{
                      transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                    }}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
