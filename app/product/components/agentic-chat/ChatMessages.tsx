"use client";

/**
 * ChatMessages component - displays the conversation history
 */

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { User, Loader2, AlertCircle, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/lib/zustand/useStore";
import type { AgenticMessage } from "./types";

interface ChatMessagesProps {
  messages: AgenticMessage[];
  isLoading?: boolean;
}

/**
 * Format timestamp to a readable string
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Simple markdown-like rendering for AI responses
 */
function renderContent(content: string): React.ReactNode {
  // Split by double newlines for paragraphs
  const paragraphs = content.split(/\n\n+/);

  return paragraphs.map((paragraph, pIndex) => {
    // Check if it's a bullet list
    if (paragraph.match(/^[-•*]\s/m)) {
      const items = paragraph.split(/\n/).filter((line) => line.trim());
      return (
        <ul key={pIndex} className="list-disc list-inside space-y-1 my-1.5">
          {items.map((item, iIndex) => (
            <li key={iIndex} className="text-[13px]">
              {renderInlineMarkdown(item.replace(/^[-•*]\s*/, ""))}
            </li>
          ))}
        </ul>
      );
    }

    // Check if it's a numbered list
    if (paragraph.match(/^\d+\.\s/m)) {
      const items = paragraph.split(/\n/).filter((line) => line.trim());
      return (
        <ol key={pIndex} className="list-decimal list-inside space-y-1 my-1.5">
          {items.map((item, iIndex) => (
            <li key={iIndex} className="text-[13px]">
              {renderInlineMarkdown(item.replace(/^\d+\.\s*/, ""))}
            </li>
          ))}
        </ol>
      );
    }

    // Check if it's a heading
    if (paragraph.startsWith("### ")) {
      return (
        <h4 key={pIndex} className="font-semibold text-[13px] mt-1.5 mb-0.5">
          {paragraph.replace("### ", "")}
        </h4>
      );
    }
    if (paragraph.startsWith("## ")) {
      return (
        <h3 key={pIndex} className="font-semibold text-[13px] mt-1.5 mb-0.5">
          {paragraph.replace("## ", "")}
        </h3>
      );
    }

    // Regular paragraph
    return (
      <p key={pIndex} className="text-[13px] my-0.5">
        {renderInlineMarkdown(paragraph)}
      </p>
    );
  });
}

/**
 * Render inline markdown (bold, italic, code)
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Handle bold (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Handle inline code (`code`)
    if (part.includes("`")) {
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((codePart, codeIndex) => {
        if (codePart.startsWith("`") && codePart.endsWith("`")) {
          return (
            <code
              key={`${index}-${codeIndex}`}
              className="bg-neutral-700 px-1.5 py-0.5 rounded text-[12px] font-mono"
            >
              {codePart.slice(1, -1)}
            </code>
          );
        }
        return codePart;
      });
    }
    return part;
  });
}

/**
 * AI Avatar component using Genpire logo
 */
function AIAvatar() {
  return (
    <Avatar className="h-7 w-7 border border-neutral-700">
      <AvatarImage src="/favicon.png" alt="Genpire" />
      <AvatarFallback className="bg-neutral-800 text-white">
        <Bot className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * User avatar component with fallback to initials
 */
function UserAvatarComponent() {
  const { user, creatorProfile, supplierProfile } = useUserStore();
  const avatarUrl = creatorProfile?.avatar_url || supplierProfile?.company_logo;

  return (
    <Avatar className="h-7 w-7 bg-white border border-neutral-700">
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={user?.full_name || user?.email || "User"}
        />
      )}
      <AvatarFallback className="bg-white text-neutral-900 text-xs font-medium">
        <User className="h-3.5 w-3.5" />
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * Single message bubble component
 */
function MessageBubble({ message }: { message: AgenticMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isLoading = message.metadata?.isLoading;
  const hasError = message.metadata?.error;

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-neutral-800 text-neutral-400 text-[13px] px-3 py-1.5 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-2 mb-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {isUser ? <UserAvatarComponent /> : <AIAvatar />}

      {/* Message content */}
      <div
        className={cn(
          "flex flex-col max-w-[85%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-xl px-3 py-2",
            isUser
              ? "bg-white text-neutral-900"
              : "bg-neutral-800 text-neutral-100",
            hasError && "border border-red-800"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 py-0.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[13px]">Thinking...</span>
            </div>
          ) : hasError ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[13px]">{message.content}</span>
            </div>
          ) : isUser ? (
            <p className="text-[13px] whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              {renderContent(message.content)}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-neutral-500 mt-0.5 px-1">
          {formatTime(new Date(message.timestamp))}
        </span>
      </div>
    </div>
  );
}

/**
 * Main ChatMessages component
 */
export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950">
        <div className="text-center text-neutral-500">
          <Avatar className="h-12 w-12 mx-auto mb-3 border border-neutral-700">
            <AvatarImage src="/favicon.png" alt="Genpire" />
            <AvatarFallback className="bg-neutral-800 text-white">
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <p className="text-[13px]">Start a conversation about your product</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 bg-neutral-950">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
