"use client";

/**
 * GenpireAgent - Main chat panel component for the product page
 * This is a completely standalone component, separate from ai-designer ChatInterface
 * Uses Zustand store for state management
 *
 * This is a RELATIVE positioned panel that sits in the page layout (not fixed/floating)
 */

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Trash2,
  MessageCircle,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { QuickActions } from "./QuickActions";
import { ContextIndicator } from "./ContextIndicator";
import { useAgenticChat } from "../../hooks/useAgenticChat";
import type { AgenticChatPanelProps, MobileChatModalProps } from "./types";
import {
  useProjectId,
  useTechPack,
  useTechFilesData,
  useProductImages,
  useActiveTab,
  useIsChatOpen,
  useProductPageActions,
} from "@/lib/zustand/product/productPageStore";

export function AgenticChatPanel({ onApplyEdit }: AgenticChatPanelProps) {
  // Get state from Zustand store
  const projectId = useProjectId();
  const techPack = useTechPack();
  const techFilesData = useTechFilesData();
  const productImages = useProductImages();
  const activeSection = useActiveTab();
  const isOpen = useIsChatOpen();
  const { toggleChat, setActiveTab } = useProductPageActions();

  // Derived values
  const productId = projectId || "";
  const productName = techPack?.productName || "Product";
  const onClose = toggleChat;
  const onNavigateToSection = setActiveTab;

  const { messages, isLoading, sendMessage, clearMessages, initializeChat } =
    useAgenticChat({
      productId,
      productName,
      techPackData: techPack,
      techFilesData,
      productImages,
      activeSection,
      currentTechPack: techPack,
      onApplyEdit,
      onNavigateToSection,
    }) as ReturnType<typeof useAgenticChat> & { initializeChat: () => void };

  // Initialize chat with welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      initializeChat();
    }
  }, [messages.length, initializeChat]);

  const handleQuickAction = (prompt: string, actionId: string) => {
    sendMessage(prompt, actionId);
  };

  // Collapsed state - show just a thin bar with expand button
  if (!isOpen) {
    return (
      <div className="hidden lg:flex flex-col items-center py-4 px-2 border-l border-neutral-800 bg-neutral-950">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 focus:ring-0 focus-visible:ring-0"
          title="Open chat"
        >
          <PanelRightClose className="h-5 w-5" />
        </Button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <span
            className="text-sm font-small text-neutral-400 writing-mode-vertical"
            style={{ writingMode: "vertical-rl" }}
          >
            Genpire Agent
          </span>
        </div>
      </div>
    );
  }

  // Expanded state - full chat panel
  return (
    <div
      className={cn(
        "hidden lg:flex flex-col",
        "w-[380px] min-w-[380px]",
        "bg-neutral-950",
        "border-l border-neutral-800",
        "h-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-white">Genpire Agent</h3>
          <p className="text-xs text-neutral-400">
            Edit & ask about {productName}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              className="h-8 w-8 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 focus:ring-0 focus-visible:ring-0"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 focus:ring-0 focus-visible:ring-0"
            title="Collapse chat"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context Indicator */}
      <ContextIndicator
        techPackData={techPack}
        techFilesData={techFilesData}
        productImages={productImages}
        activeSection={activeSection}
      />

      {/* Messages - takes remaining space */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Quick Actions */}
      <QuickActions
        activeSection={activeSection}
        onAction={handleQuickAction}
        disabled={isLoading}
      />

      {/* Input */}
      <ChatInput
        onSend={(content) => sendMessage(content)}
        isLoading={isLoading}
        placeholder={`Ask about ${activeSection}...`}
      />
    </div>
  );
}

// Mobile floating button - only shown on mobile
export function ChatToggleButton({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  // Don't show on desktop - chat is always visible in sidebar
  // Only show on mobile when chat is closed
  if (isOpen) return null;

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "lg:hidden", // Only show on mobile
        "fixed bottom-24 right-4",
        "z-[60]",
        "h-12 w-12 rounded-full shadow-lg p-0 overflow-hidden",
        "bg-transparent",
        "hover:scale-105 transition-all duration-200"
      )}
    >
      <img
        src="/favicon.png"
        alt="Genpire"
        className="h-full w-full object-cover"
      />
    </Button>
  );
}

// Mobile chat modal - full screen on mobile
export function MobileChatModal({
  productId,
  productName,
  techPackData,
  techFilesData,
  productImages,
  currentTechPack,
  activeSection,
  isOpen,
  onClose,
  onApplyEdit,
  onNavigateToSection,
}: MobileChatModalProps) {
  const { messages, isLoading, sendMessage, clearMessages, initializeChat } =
    useAgenticChat({
      productId,
      productName,
      techPackData,
      techFilesData,
      productImages,
      activeSection,
      currentTechPack,
      onApplyEdit,
      onNavigateToSection,
    }) as ReturnType<typeof useAgenticChat> & { initializeChat: () => void };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, messages.length, initializeChat]);

  const handleQuickAction = (prompt: string, actionId: string) => {
    sendMessage(prompt, actionId);
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[80] bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-white">Genpire Agent</h3>
          <p className="text-xs text-neutral-400">
            Edit & ask about {productName}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              className="h-8 w-8 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 focus:ring-0 focus-visible:ring-0"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 focus:ring-0 focus-visible:ring-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context Indicator */}
      <ContextIndicator
        techPackData={techPackData}
        techFilesData={techFilesData}
        productImages={productImages}
        activeSection={activeSection}
      />

      {/* Messages */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Quick Actions */}
      <QuickActions
        activeSection={activeSection}
        onAction={handleQuickAction}
        disabled={isLoading}
      />

      {/* Input */}
      <ChatInput
        onSend={(content) => sendMessage(content)}
        isLoading={isLoading}
        placeholder={`Ask about ${activeSection}...`}
      />
    </div>
  );
}
