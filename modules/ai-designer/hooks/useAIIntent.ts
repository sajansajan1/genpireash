/**
 * Custom hook for AI intent detection
 */

import { useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import type { MessageIntent } from '../types';
import { detectMessageIntent as detectIntent } from '../services/aiIntentDetection';

export function useAIIntent(productName: string) {
  const { messages } = useChatStore();

  const detectMessageIntent = useCallback(
    async (message: string): Promise<MessageIntent> => {
      try {
        return await detectIntent(message, messages, productName);
      } catch (error) {
        console.error('Intent detection failed:', error);
        return 'general_chat';
      }
    },
    [messages, productName]
  );

  return {
    detectMessageIntent,
  };
}
