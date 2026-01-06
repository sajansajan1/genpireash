"use server";

import { createClient } from "@/lib/supabase/server";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface ProductContext {
  productId: string;
  productType: string;
  originalPrompt: string;
  currentDescription: string;
  attributes: {
    colors?: string[];
    materials?: string[];
    features?: string[];
    style?: string;
    category?: string;
  };
  metadata: {
    hasLogo?: boolean;
    hasDesignFile?: boolean;
    logo?: string;
    designFile?: string;
  };
}

export interface ChatSession {
  id: string;
  user_id: string;
  product_id: string;
  messages: ChatMessage[];
  context: ProductContext;
  created_at: string;
  updated_at: string;
  metadata: any;
}

/**
 * Create a new chat session for a product
 */
export async function createChatSession({
  productId,
  userId,
  initialMessage,
  productData,
}: {
  productId: string;
  userId: string;
  initialMessage: string;
  productData: any;
}) {
  try {
    const supabase = await createClient();

    // Generate session ID
    const sessionId = `session-${productId}-${Date.now()}`;

    // Extract product info from tech_pack and metadata
    const metadata = productData.tech_pack?.metadata || {};
    const techPack = productData.tech_pack || {};

    // Create initial message
    const firstMessage: ChatMessage = {
      role: 'user',
      content: initialMessage,
      timestamp: new Date().toISOString(),
      metadata: {
        isInitialRequest: true,
        hasDesignFile: !!metadata.designFile,
        hasLogo: !!metadata.logo,
      }
    };

    // Create product context
    const context: ProductContext = {
      productId,
      productType: techPack.productName || 'Product',
      originalPrompt: productData.prompt || initialMessage,
      currentDescription: productData.prompt || initialMessage,
      attributes: {
        colors: metadata.selected_colors || [],
        materials: [],
        features: [],
        style: metadata.style_keywords?.join(', ') || '',
        category: metadata.category || '',
      },
      metadata: {
        hasLogo: !!metadata.logo,
        hasDesignFile: !!metadata.designFile,
        logo: metadata.logo,
        designFile: metadata.designFile,
      }
    };

    // Create chat session
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        product_id: productId,
        messages: [firstMessage],
        context: context,
        metadata: {
          source: 'idea-upload',
          initialPrompt: initialMessage,
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, sessionId: data.id, session: data };
  } catch (error) {
    console.error('Unexpected error creating chat session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create chat session'
    };
  }
}

/**
 * Get chat session for a product
 */
export async function getChatSession(productId: string, userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No session found
        return { success: true, session: null };
      }
      return { success: false, error: error.message };
    }

    return { success: true, session: data };
  } catch (error) {
    console.error('Error getting chat session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get chat session'
    };
  }
}

/**
 * Get chat session by product ID only (gets current user automatically)
 */
export async function getChatSessionByProductId(productId: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No session found
        return { success: true, session: null };
      }
      return { success: false, error: error.message };
    }

    return { success: true, session: data, userId: user.id };
  } catch (error) {
    console.error('Error getting chat session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get chat session'
    };
  }
}

/**
 * Update chat session with new message
 */
export async function updateChatSession(
  sessionId: string,
  message: ChatMessage,
  contextUpdates?: Partial<ProductContext>
) {
  try {
    const supabase = await createClient();

    // Get current session
    const { data: currentSession, error: fetchError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !currentSession) {
      return { success: false, error: 'Session not found' };
    }

    // Update messages
    const updatedMessages = [...(currentSession.messages || []), message];

    // Keep only last 100 messages for performance
    if (updatedMessages.length > 100) {
      updatedMessages.splice(0, updatedMessages.length - 100);
    }

    // Update context if provided
    const updatedContext = contextUpdates
      ? { ...currentSession.context, ...contextUpdates }
      : currentSession.context;

    // Update session
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        messages: updatedMessages,
        context: updatedContext,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating chat session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update chat session'
    };
  }
}

/**
 * Get or create chat session for a product
 */
export async function getOrCreateChatSession(
  productId: string,
  userId: string,
  productData?: any
) {
  try {
    // First try to get existing session
    const existingSession = await getChatSession(productId, userId);

    if (existingSession.success && existingSession.session) {
      return { success: true, sessionId: existingSession.session.id, session: existingSession.session };
    }

    // If no session exists and we have product data, create one
    if (productData) {
      const initialMessage = productData.prompt || "Generate product design";
      return await createChatSession({
        productId,
        userId,
        initialMessage,
        productData
      });
    }

    return { success: false, error: 'No session found and no product data provided' };
  } catch (error) {
    console.error('Error in getOrCreateChatSession:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get or create session'
    };
  }
}
