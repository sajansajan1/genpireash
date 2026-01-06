"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatMessageType, AIChatMessageDB } from "@/modules/ai-designer/types";

export interface SaveChatMessageParams {
  productIdeaId: string;
  messageType: ChatMessageType;
  content: string;
  metadata?: any;
  revisionId?: string;
  batchId?: string;
}

// Use the database type from our types module
export type ChatMessageDB = AIChatMessageDB;

/**
 * Save a chat message to the database
 */
export async function saveChatMessage({
  productIdeaId,
  messageType,
  content,
  metadata = {},
  revisionId,
  batchId,
}: SaveChatMessageParams): Promise<{ success: boolean; message?: ChatMessageDB; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Validate revision_id if provided (must be a valid UUID)
    let validRevisionId: string | null = null;
    if (revisionId) {
      // Check if it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(revisionId)) {
        validRevisionId = revisionId;
      } else {
        // If it's not a valid UUID (like "rev-123456"), store it in metadata instead
        metadata.localRevisionId = revisionId;
      }
    }

    // Insert message
    const { data, error } = await supabase
      .from("ai_chat_messages")
      .insert({
        product_idea_id: productIdeaId,
        user_id: user.id,
        message_type: messageType,
        content,
        metadata,
        revision_id: validRevisionId,
        batch_id: batchId || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving chat message:", error);
      return { success: false, error: error.message };
    }

    return { success: true, message: data };
  } catch (error: any) {
    console.error("Error in saveChatMessage:", error);
    return { success: false, error: error.message || "Failed to save message" };
  }
}

/**
 * Save multiple chat messages in a batch
 */
export async function saveChatMessagesBatch(
  messages: SaveChatMessageParams[]
): Promise<{ success: boolean; messages?: ChatMessageDB[]; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Prepare messages with user_id and validate revision_ids
    const messagesWithUser = messages.map(msg => {
      let validRevisionId: string | null = null;
      const metadata = { ...(msg.metadata || {}) };
      
      if (msg.revisionId) {
        // Check if it's a valid UUID format
        if (uuidRegex.test(msg.revisionId)) {
          validRevisionId = msg.revisionId;
        } else {
          // If it's not a valid UUID (like "rev-123456"), store it in metadata instead
          metadata.localRevisionId = msg.revisionId;
        }
      }
      
      return {
        product_idea_id: msg.productIdeaId,
        user_id: user.id,
        message_type: msg.messageType,
        content: msg.content,
        metadata,
        revision_id: validRevisionId,
        batch_id: msg.batchId || null,
      };
    });

    // Insert messages
    const { data, error } = await supabase
      .from("ai_chat_messages")
      .insert(messagesWithUser)
      .select();

    if (error) {
      console.error("Error saving chat messages batch:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messages: data };
  } catch (error: any) {
    console.error("Error in saveChatMessagesBatch:", error);
    return { success: false, error: error.message || "Failed to save messages" };
  }
}

/**
 * Get chat messages for a product
 */
export async function getChatMessages(
  productIdeaId: string,
  limit: number = 100
): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("product_idea_id", productIdeaId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching chat messages:", error);
      return { success: false, error: error.message };
    }

    // Convert to ChatMessage format
    const messages: ChatMessage[] = (data || []).map(msg => ({
      id: msg.id,
      product_idea_id: msg.product_idea_id,
      user_id: msg.user_id,
      revision_id: msg.revision_id,
      batch_id: msg.batch_id,
      message_type: msg.message_type as ChatMessageType,
      content: msg.content,
      created_at: new Date(msg.created_at),
      updated_at: msg.updated_at ? new Date(msg.updated_at) : undefined,
      metadata: msg.metadata,
    }));

    return { success: true, messages };
  } catch (error: any) {
    console.error("Error in getChatMessages:", error);
    return { success: false, error: error.message || "Failed to fetch messages" };
  }
}

/**
 * Get chat messages for a specific batch/session
 */
export async function getChatMessagesByBatch(
  batchId: string
): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching chat messages by batch:", error);
      return { success: false, error: error.message };
    }

    // Convert to ChatMessage format
    const messages: ChatMessage[] = (data || []).map(msg => ({
      id: msg.id,
      product_idea_id: msg.product_idea_id,
      user_id: msg.user_id,
      revision_id: msg.revision_id,
      batch_id: msg.batch_id,
      message_type: msg.message_type as ChatMessageType,
      content: msg.content,
      created_at: new Date(msg.created_at),
      updated_at: msg.updated_at ? new Date(msg.updated_at) : undefined,
      metadata: msg.metadata,
    }));

    return { success: true, messages };
  } catch (error: any) {
    console.error("Error in getChatMessagesByBatch:", error);
    return { success: false, error: error.message || "Failed to fetch messages" };
  }
}

/**
 * Delete chat messages for a product (optional cleanup)
 */
export async function deleteChatMessages(
  productIdeaId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("ai_chat_messages")
      .delete()
      .eq("product_idea_id", productIdeaId);

    if (error) {
      console.error("Error deleting chat messages:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteChatMessages:", error);
    return { success: false, error: error.message || "Failed to delete messages" };
  }
}
