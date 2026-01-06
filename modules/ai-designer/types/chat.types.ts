/**
 * Chat-related type definitions
 */

export type ChatMessageType =
  | "user"
  | "ai"
  | "system"
  | "image-ready"
  | "analysis"
  | "processing"
  | "error"
  | "success";

export type MessageIntent =
  | "design_edit"
  | "question"
  | "technical_info"
  | "feedback"
  | "general_chat"
  | "greeting"
  | "product_question"   // Questions about the product using tech pack data
  | "tech_pack_action";  // Actions related to tech pack generation (base views, close-ups, sketches)

/**
 * Database schema for ai_chat_messages table
 */
export interface AIChatMessageDB {
  id: string; // uuid
  product_idea_id: string; // uuid
  user_id: string; // uuid
  revision_id: string | null; // uuid, nullable
  batch_id: string | null; // text, nullable - Groups messages from the same editing session
  message_type: ChatMessageType; // text
  content: string; // text
  metadata?: any; // jsonb - Flexible JSON storage
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

/**
 * Frontend representation of a chat message
 * This is what we use in the UI components
 */
export interface ChatMessage {
  id: string;
  product_idea_id?: string;
  user_id?: string;
  revision_id?: string | null;
  batch_id?: string | null;
  message_type: ChatMessageType;
  content: string;
  metadata?: {
    // Visual properties
    view?: "front" | "back" | "side";
    imageUrl?: string;

    // Progress tracking
    progress?: number;
    duration?: number;

    // Intent and context
    intent?: MessageIntent;
    isIntentDetection?: boolean;
    isContextSummary?: boolean;
    context?: string;
    summary?: string;

    // State flags
    isScreenshot?: boolean;
    capturedViews?: string[];
    isInitialRequest?: boolean;
    hasDesignFile?: boolean;
    hasLogo?: boolean;
    hasUploadedDesign?: boolean;
    processingComplete?: boolean;

    // Additional info
    contextualInfo?: any;
    helpfulTip?: boolean;
    localRevisionId?: string; // For non-UUID revision IDs
    [key: string]: any; // Allow additional properties
  };
  created_at: Date | string;
  updated_at?: Date | string;
}

/**
 * Parameters for saving a chat message
 */
export interface SaveChatMessageParams {
  productIdeaId: string;
  messageType: ChatMessageType;
  content: string;
  metadata?: any;
  revisionId?: string;
  batchId?: string;
}
