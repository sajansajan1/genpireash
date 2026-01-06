/**
 * Custom hook for chat session management
 */

import { useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import type { ChatMessage, ChatMessageType } from '../types';

export function useChatSession(productId: string | null) {
  const {
    messages,
    addMessage,
    setMessages,
    clearMessages,
    isProcessing,
    setIsProcessing,
  } = useChatStore();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !productId) return;

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        product_idea_id: productId!,
        message_type: 'user',
        content,
        created_at: new Date(),
      };

      addMessage(newMessage);
      setIsProcessing(true);

      try {
        // TODO: Implement actual message sending logic
        console.log('Sending message:', content);
      } finally {
        setIsProcessing(false);
      }
    },
    [productId, addMessage, setIsProcessing]
  );

  const addChatMessage = useCallback(
    (type: ChatMessageType, content: string, metadata?: any) => {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        message_type: type,
        content,
        created_at: new Date(),
        metadata,
      };

      addMessage(newMessage);
      return newMessage;
    },
    [addMessage]
  );

  return {
    messages,
    isProcessing,
    sendMessage,
    addChatMessage,
    clearMessages,
  };
}
