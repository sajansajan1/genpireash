/**
 * Chat state management using Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChatMessage } from '../types';

interface ChatState {
  // Messages
  messages: ChatMessage[];
  sessionEdits: string[];
  currentBatchId: string;
  initialMessagesAdded: boolean;

  // UI state
  isProcessing: boolean;
  retryingMessageId: string | null;

  // Actions
  addMessage: (message: ChatMessage) => void;
  removeMessage: (messageId: string) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  addSessionEdit: (edit: string) => void;
  setIsProcessing: (processing: boolean) => void;
  setRetryingMessageId: (messageId: string | null) => void;
  setBatchId: (batchId: string) => void;
  setInitialMessagesAdded: (added: boolean) => void;
  reset: () => void;
}

const initialState = {
  messages: [],
  sessionEdits: [],
  currentBatchId: `batch-${Date.now()}`,
  initialMessagesAdded: false,
  isProcessing: false,
  retryingMessageId: null,
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      ...initialState,

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      removeMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        })),

      updateMessage: (messageId, updates) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
        })),

      setMessages: (messages) =>
        set({ messages }),

      clearMessages: () =>
        set({ messages: [] }),

      addSessionEdit: (edit) =>
        set((state) => ({
          sessionEdits: [...state.sessionEdits, edit],
        })),

      setIsProcessing: (processing) =>
        set({ isProcessing: processing }),

      setRetryingMessageId: (messageId) =>
        set({ retryingMessageId: messageId }),

      setBatchId: (batchId) =>
        set({ currentBatchId: batchId }),

      setInitialMessagesAdded: (added) =>
        set({ initialMessagesAdded: added }),

      reset: () => set(initialState),
    }),
    {
      name: 'ai-designer-chat',
    }
  )
);
