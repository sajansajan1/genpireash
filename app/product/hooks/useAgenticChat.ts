"use client";

/**
 * Hook for managing the Agentic Tech Pack Chat state and interactions
 * This is completely separate from the ai-designer chat system
 *
 * Features:
 * - Message management
 * - AI response handling
 * - Edit action detection and application
 * - Section navigation
 */

import { useState, useCallback, useRef } from "react";
import type {
  AgenticMessage,
  TechFilesData,
  ProductImages,
  UseAgenticChatReturn,
  EditAction,
  TechPackSection,
} from "../components/agentic-chat/types";
import { SECTION_TO_TAB } from "../components/agentic-chat/types";
import { buildProductContext } from "../utils/buildProductContext";
import { getAgenticChatResponse } from "../actions/agentic-chat-response";

interface UseAgenticChatParams {
  productId: string;
  productName: string;
  techPackData: any | null;
  techFilesData: TechFilesData | null;
  productImages: ProductImages;
  activeSection: string;
  /** Current tech pack state for edit context */
  currentTechPack?: any;
  /** Callback when an edit should be applied */
  onApplyEdit?: (section: TechPackSection, value: any, field?: string) => Promise<boolean>;
  /** Callback to navigate to a section */
  onNavigateToSection?: (tabId: string) => void;
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook for managing agentic chat state and interactions
 */
export function useAgenticChat(params: UseAgenticChatParams): UseAgenticChatReturn {
  const {
    productName,
    techPackData,
    techFilesData,
    productImages,
    activeSection,
    currentTechPack,
    onApplyEdit,
    onNavigateToSection,
  } = params;

  const [messages, setMessages] = useState<AgenticMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if this is the first message (to show welcome)
  const hasInitialized = useRef(false);

  /**
   * Add a welcome message if this is the first interaction
   */
  const initializeChat = useCallback(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const welcomeMessage: AgenticMessage = {
      id: generateMessageId(),
      role: "assistant",
      content: `Hi! I'm **Genpire Agent** for **${productName}**. I can help you view and edit your product using natural language.

**Try saying:**
- "Change the product name to..."
- "Update the materials to use..."
- "What are the dimensions?"
- "Suggest improvements for the construction"

Just tell me what you want to change or ask!`,
      timestamp: new Date(),
      metadata: {
        section: activeSection,
      },
    };

    setMessages([welcomeMessage]);
  }, [productName, activeSection]);

  /**
   * Send a user message and get AI response
   */
  const sendMessage = useCallback(
    async (content: string, quickActionId?: string) => {
      if (!content.trim()) return;

      // Initialize chat if needed
      if (!hasInitialized.current) {
        hasInitialized.current = true;
      }

      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: AgenticMessage = {
        id: generateMessageId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        metadata: {
          section: activeSection,
          quickAction: quickActionId,
        },
      };

      setMessages((prev) => [...prev, userMessage]);

      // Add loading placeholder for AI response
      const loadingMessageId = generateMessageId();
      const loadingMessage: AgenticMessage = {
        id: loadingMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        metadata: {
          isLoading: true,
        },
      };

      setMessages((prev) => [...prev, loadingMessage]);

      try {
        // Build product context for the AI
        const productContext = buildProductContext({
          productName,
          techPackData,
          techFilesData,
          productImages,
          activeSection,
        });

        // Get AI response with current tech pack for edit context
        const response = await getAgenticChatResponse({
          message: content,
          productContext,
          conversationHistory: messages,
          activeSection,
          currentTechPack,
        });

        if (response.success && response.response) {
          let editApplied = false;
          const editAction = response.editAction;

          // If there's an edit action, try to apply it
          if (editAction && onApplyEdit) {
            try {
              // Navigate to the relevant section first
              if (onNavigateToSection) {
                const targetTab = SECTION_TO_TAB[editAction.section];
                if (targetTab) {
                  onNavigateToSection(targetTab);
                }
              }

              // Apply the edit
              editApplied = await onApplyEdit(
                editAction.section,
                editAction.value,
                editAction.field
              );
            } catch (editError) {
              console.error("Failed to apply edit:", editError);
              editApplied = false;
            }
          }

          // Build the response content
          let responseContent = response.response;

          // Add edit status to response if an edit was attempted
          if (editAction) {
            if (editApplied) {
              responseContent += "\n\n✅ **Change applied successfully!**";
            } else if (onApplyEdit) {
              responseContent += "\n\n⚠️ **Could not apply the change automatically. Please make the change manually.**";
            }
          }

          // Replace loading message with actual response
          const aiMessage: AgenticMessage = {
            id: loadingMessageId,
            role: "assistant",
            content: responseContent,
            timestamp: new Date(),
            metadata: {
              section: activeSection,
              suggestedEdit: response.suggestedEdit,
              intent: response.intent,
              editAction: editAction,
              editApplied,
            },
          };

          setMessages((prev) =>
            prev.map((msg) => (msg.id === loadingMessageId ? aiMessage : msg))
          );
        } else {
          // Show error message
          const errorMessage: AgenticMessage = {
            id: loadingMessageId,
            role: "assistant",
            content: "I'm sorry, I encountered an error processing your request. Please try again.",
            timestamp: new Date(),
            metadata: {
              error: response.error || "Unknown error",
            },
          };

          setMessages((prev) =>
            prev.map((msg) => (msg.id === loadingMessageId ? errorMessage : msg))
          );
          setError(response.error || "Failed to get response");
        }
      } catch (err) {
        console.error("Error in sendMessage:", err);

        // Replace loading message with error
        const errorMessage: AgenticMessage = {
          id: loadingMessageId,
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
          metadata: {
            error: err instanceof Error ? err.message : "Unknown error",
          },
        };

        setMessages((prev) =>
          prev.map((msg) => (msg.id === loadingMessageId ? errorMessage : msg))
        );
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsLoading(false);
      }
    },
    [
      productName,
      techPackData,
      techFilesData,
      productImages,
      activeSection,
      currentTechPack,
      onApplyEdit,
      onNavigateToSection,
      messages,
    ]
  );

  /**
   * Clear all messages and reset chat
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    hasInitialized.current = false;
  }, []);

  /**
   * Add a system message (e.g., notifications about context changes)
   */
  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: AgenticMessage = {
      id: generateMessageId(),
      role: "system",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, systemMessage]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    initializeChat,
    addSystemMessage,
  } as UseAgenticChatReturn & {
    initializeChat: () => void;
    addSystemMessage: (content: string) => void;
  };
}
