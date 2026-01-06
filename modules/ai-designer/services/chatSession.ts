/**
 * Chat session management service
 */

import type { ChatMessage, ChatMessageType } from '../types';
import {
  saveChatMessage as saveMessage,
  getChatMessages as getMessages
} from '@/app/actions/ai-chat-messages';
import {
  getOrCreateChatSession as getSession,
  updateChatSession as updateSession,
  getChatSessionByProductId as getSessionById
} from '@/app/actions/chat-session';

/**
 * Save a chat message to the database
 */
export async function saveChatMessage(params: {
  productIdeaId: string;
  messageType: string;
  content: string;
  metadata?: any;
  revisionId?: string;
  batchId?: string;
}): Promise<{ success: boolean; message?: any; error?: string }> {
  try {
    const result = await saveMessage({
      productIdeaId: params.productIdeaId,
      messageType: params.messageType as ChatMessageType,
      content: params.content,
      metadata: params.metadata,
      revisionId: params.revisionId,
      batchId: params.batchId,
    });

    // Pass through the message from the database
    return {
      success: result.success,
      message: result.message,
      error: result.error
    };
  } catch (error) {
    console.error('Failed to save chat message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save message'
    };
  }
}

/**
 * Get chat messages for a product
 */
export async function getChatMessages(
  productId: string,
  limit: number = 500
): Promise<{
  success: boolean;
  messages?: ChatMessage[];
  error?: string;
}> {
  try {
    const result = await getMessages(productId, limit);

    if (result.success && result.messages) {
      // Convert from database format to ChatMessage format
      // The messages from getChatMessages action already have created_at set
      const messages: ChatMessage[] = result.messages.map((msg: any) => ({
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        product_idea_id: msg.product_idea_id || productId,
        user_id: msg.user_id,
        revision_id: msg.revision_id,
        batch_id: msg.batch_id,
        message_type: msg.message_type || msg.messageType as ChatMessageType,
        content: msg.content,
        created_at: msg.created_at || msg.timestamp || (msg.createdAt ? new Date(msg.createdAt) : new Date()),
        updated_at: msg.updated_at,
        metadata: msg.metadata,
      }));

      return { success: true, messages };
    }

    return result;
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get messages'
    };
  }
}

/**
 * Update chat session with new message
 */
export async function updateChatSession(
  sessionId: string,
  message: ChatMessage,
  contextUpdates?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await updateSession(
      sessionId,
      {
        role: message.message_type === 'user' ? 'user' : message.message_type === 'ai' ? 'assistant' : 'system',
        content: message.content,
        timestamp: message.created_at instanceof Date ? message.created_at.toISOString() : String(message.created_at),
        metadata: message.metadata
      } as any,
      contextUpdates
    );

    return result;
  } catch (error) {
    console.error('Failed to update chat session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update session'
    };
  }
}

/**
 * Get or create chat session for a product
 */
export async function getOrCreateChatSession(
  productId: string,
  userId: string,
  project?: any
): Promise<{
  success: boolean;
  sessionId?: string;
  session?: any;
  error?: string
}> {
  try {
    const result = await getSession(productId, userId, project);
    return result;
  } catch (error) {
    console.error('Failed to get/create chat session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get/create session'
    };
  }
}

/**
 * Get chat session by product ID
 */
export async function getChatSessionByProductId(
  productId: string
): Promise<{
  success: boolean;
  session?: any;
  error?: string
}> {
  try {
    const result = await getSessionById(productId);
    return result;
  } catch (error) {
    console.error('Failed to get chat session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session'
    };
  }
}
