/**
 * AI intent detection service
 */

import type { MessageIntent, ChatMessage } from '../types';
import type { WorkflowMode } from '../store/editorStore';
import {
  AFFIRMATIVE_PATTERNS,
  GREETING_PATTERNS,
  DESIGN_KEYWORDS
} from '../constants';

/**
 * Keywords that indicate a tech pack action request
 */
const TECH_PACK_ACTION_KEYWORDS = [
  'generate base',
  'generate views',
  'generate all',
  'generate close',
  'generate sketch',
  'generate component',
  'create base',
  'create close',
  'create sketch',
  'generate factory',
  'generate specs',
  'factory specs',
];

/**
 * Keywords that indicate a product-specific question (NOT an edit request)
 * These should be answered with information, NOT trigger image generation
 */
const PRODUCT_QUESTION_KEYWORDS = [
  'what material',
  'what fabric',
  'what are the',
  'what is the',
  'list the',
  'tell me about',
  'explain the',
  'describe the',
  'how is it made',
  'how is this made',
  'construction',
  'measurements',
  'dimensions',
  'trims',
  'hardware',
  'recommend factory',
  'recommend factories',
  'production timeline',
  'lead time',
  'cost estimate',
  // Dimension-related questions (should NOT trigger edit/revision)
  'change dimension',
  'change the dimension',
  'modify dimension',
  'modify the dimension',
  'update dimension',
  'update the dimension',
  'adjust dimension',
  'adjust the dimension',
  'dimension to',
  'dimensions to',
  'change size to',
  'change the size to',
  'change height',
  'change width',
  'change length',
  'change depth',
  'change weight',
  'modify height',
  'modify width',
  'height to',
  'width to',
  'length to',
  'depth to',
  'weight to',
  'what if i change',
  'what if the',
  'can i change the dimension',
  'can i modify the dimension',
  'can i update the dimension',
  'can the dimension',
  'could the dimension',
  'should the dimension',
  'want to change dimension',
  'want to modify dimension',
  'i want the height',
  'i want the width',
  'i want the length',
  'i want the depth',
  'i want it to be',
  'can it be',
  'could it be',
];

/**
 * Detect user message intent using AI
 * @param message - User message to analyze
 * @param chatHistory - Previous chat messages for context
 * @param productName - Name of the product being designed
 * @param workflowMode - Current workflow mode (multi-view, front-view, tech-pack)
 */
export async function detectMessageIntent(
  message: string,
  chatHistory: ChatMessage[],
  productName: string,
  workflowMode?: WorkflowMode
): Promise<MessageIntent> {
  try {
    const lowerMessage = message.toLowerCase().trim();

    // FAST PATH: Check for tech pack actions first when in tech-pack mode
    if (workflowMode === 'tech-pack') {
      if (TECH_PACK_ACTION_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
        return 'tech_pack_action';
      }
    }

    // FAST PATH: Check for product questions (dimension changes, measurements, etc.)
    // These should NOT trigger image generation - just conversational responses
    // This check applies to ALL workflow modes, not just tech-pack mode
    if (PRODUCT_QUESTION_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
      console.log('🔍 Detected product_question intent (dimension/measurement related):', lowerMessage.substring(0, 50));
      return 'product_question';
    }

    // Get conversation history for context
    const conversationHistory = chatHistory
      .slice(-5) // Get last 5 messages for better context
      .map((msg) => {
        const role = msg.message_type === 'user' ? 'User' : 'AI';
        const content =
          msg.content.length > 200
            ? msg.content.substring(0, 200) + '...'
            : msg.content;
        return `${role}: ${content}`;
      })
      .join('\n');

    // Find the last AI message with suggestions
    const lastAIMessage = chatHistory
      .slice()
      .reverse()
      .find(
        (msg) =>
          msg.message_type === 'ai' &&
          (msg.content.includes('Would you like') ||
            msg.content.includes('can') ||
            msg.content.includes('adjust') ||
            msg.content.includes('change') ||
            msg.content.includes('modify') ||
            msg.content.includes('design') ||
            msg.content.includes('proceed'))
      );

    const intentPrompt = buildIntentPrompt(
      message,
      productName,
      conversationHistory,
      lastAIMessage?.content
    );

    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: intentPrompt,
        productName: productName,
        temperature: 0.3, // Lower temperature for consistent classification
        max_tokens: 20,
      }),
    });

    if (!response.ok) {
      console.warn('AI intent detection failed, falling back to keyword detection');
      return fallbackIntentDetection(message, chatHistory);
    }

    const data = await response.json();
    const detectedIntent =
      data.suggestion?.toLowerCase().trim() ||
      data.message?.toLowerCase().trim();

    // Validate the detected intent
    const validIntents: MessageIntent[] = [
      'design_edit',
      'question',
      'technical_info',
      'feedback',
      'general_chat',
      'greeting',
      'product_question',
      'tech_pack_action',
    ];

    if (validIntents.includes(detectedIntent as MessageIntent)) {
      return detectedIntent as MessageIntent;
    }

    // Fallback if AI returns invalid intent
    console.warn('Invalid intent detected:', detectedIntent, '- using fallback');
    return fallbackIntentDetection(message, chatHistory);
  } catch (error) {
    console.error('Error in AI intent detection:', error);
    return fallbackIntentDetection(message, chatHistory);
  }
}

/**
 * Fallback keyword-based intent detection
 */
export function fallbackIntentDetection(
  message: string,
  chatHistory?: ChatMessage[],
  workflowMode?: WorkflowMode
): MessageIntent {
  const lowerMessage = message.toLowerCase().trim();

  // Check for tech pack actions (especially important in tech-pack mode)
  if (TECH_PACK_ACTION_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    return 'tech_pack_action';
  }

  // Check for product-specific questions (important in tech-pack mode)
  if (PRODUCT_QUESTION_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    return 'product_question';
  }

  // Check for affirmative responses that likely refer to previous suggestions
  if (
    AFFIRMATIVE_PATTERNS.some(
      (pattern) =>
        lowerMessage === pattern ||
        lowerMessage === `${pattern}!` ||
        lowerMessage === `${pattern}.`
    )
  ) {
    // Check if the last AI message contained a suggestion
    if (chatHistory) {
      const lastAIMessage = chatHistory
        .slice()
        .reverse()
        .find((msg) => msg.message_type === 'ai');

      if (
        lastAIMessage &&
        (lastAIMessage.content.includes('Would you like') ||
          lastAIMessage.content.includes('can') ||
          lastAIMessage.content.includes('adjust') ||
          lastAIMessage.content.includes('change') ||
          lastAIMessage.content.includes('proceed'))
      ) {
        return 'design_edit';
      }
    }
  }

  // Check for greetings
  if (GREETING_PATTERNS.some((pattern) => lowerMessage.includes(pattern))) {
    return 'greeting';
  }

  // Check for questions
  if (
    lowerMessage.includes('?') ||
    lowerMessage.startsWith('what') ||
    lowerMessage.startsWith('how') ||
    lowerMessage.startsWith('why') ||
    lowerMessage.startsWith('when') ||
    lowerMessage.startsWith('where')
  ) {
    return 'question';
  }

  // Check for design edits
  if (DESIGN_KEYWORDS.some((keyword) => lowerMessage.includes(keyword))) {
    return 'design_edit';
  }

  // Default to general chat
  return 'general_chat';
}

/**
 * Build the intent detection prompt
 */
function buildIntentPrompt(
  message: string,
  productName: string,
  conversationHistory: string,
  lastAISuggestion?: string
): string {
  return `Analyze the following user message and classify its intent into ONE of these categories:

AVAILABLE INTENTS:
1. "design_edit" - User wants to modify, change, or edit the visual appearance of the product (colors, size, style, materials, textures, etc.) OR wants to implement/apply previously discussed suggestions
2. "question" - User is asking a general question and expects an informative answer
3. "technical_info" - User wants technical specifications, manufacturing details, dimensions, or production information
4. "feedback" - User is providing feedback, opinion, or evaluation about the current design
5. "general_chat" - User wants to have a general conversation or discussion about the product
6. "greeting" - User is greeting or making small talk
7. "product_question" - User is asking a specific question about THIS product's details (materials, construction, measurements, trims, hardware, costs, factories) - use when they want info from the product's tech pack data
8. "tech_pack_action" - User wants to generate factory files (base views, close-ups, technical sketches, component images) for the tech pack

USER MESSAGE: "${message}"

CONTEXT: This is a product design tool for "${productName}". The user is interacting with an AI assistant that can both edit product designs and answer questions.

FULL CONVERSATION HISTORY (last 5 messages):
${conversationHistory}

${lastAISuggestion ? `LAST AI SUGGESTION/QUESTION:\n${lastAISuggestion}` : ''}

CRITICAL RULES FOR CLASSIFICATION:
- If the user message is "ok", "go ahead", "yes", "do it", "proceed", "implement", "apply that", "let's do it", "sure", "sounds good", "implement that", "make those changes" or similar affirmative responses, AND the last AI message contained suggestions or asked about making changes, classify as "design_edit"
- Short affirmative responses like "ok go ahead" in response to AI suggestions MUST be classified as "design_edit"
- If the message contains action words like "make", "change", "add", "remove", "modify" related to VISUAL appearance (colors, textures, patterns, shapes), classify as "design_edit"
- If the user is clearly agreeing to implement suggestions from the conversation history, classify as "design_edit"
- If the message is phrased as a question (even if it mentions design elements), classify as "question" unless it explicitly asks to make changes
- If the user asks about materials, construction, measurements, trims, hardware, costs, or factories specifically for THIS product, classify as "product_question"
- If the user asks to generate factory files, base views, close-ups, sketches, or components, classify as "tech_pack_action"
- Context is crucial - always consider what the AI previously suggested

IMPORTANT - DIMENSION/MEASUREMENT QUESTIONS ARE NOT DESIGN EDITS:
- Questions about changing dimensions, measurements, height, width, length, depth, or weight should be classified as "product_question" NOT "design_edit"
- Examples that should be "product_question": "can I change the dimensions to 50cm?", "what if the height is 60cm?", "I want the width to be 30cm", "can we modify the dimensions?"
- These are INFORMATIONAL questions about specifications, NOT requests to generate new images
- Only classify as "design_edit" when the user wants to change VISUAL appearance (colors, textures, patterns, shapes) that require image regeneration

Respond with ONLY the intent category name, nothing else.`;
}
