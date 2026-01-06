/**
 * AI Intent definitions and configurations
 */

export const INTENT_TYPES = {
  DESIGN_EDIT: 'design_edit',
  QUESTION: 'question',
  TECHNICAL_INFO: 'technical_info',
  FEEDBACK: 'feedback',
  GENERAL_CHAT: 'general_chat',
  GREETING: 'greeting',
} as const;

export type IntentType = typeof INTENT_TYPES[keyof typeof INTENT_TYPES];

// System prompts for different intents
export const INTENT_PROMPTS = {
  [INTENT_TYPES.QUESTION]: (productName: string, productDescription: string, hasScreenshot: boolean) =>
    `You are a helpful AI assistant for a product design tool.
    The user is asking a question about the product "${productName}".
    ${hasScreenshot ? "They have provided a screenshot of the current design. Analyze the visual elements and provide specific feedback based on what you see in the image." : ""}
    Provide a clear, informative answer. Be conversational and helpful.
    Current product description: ${productDescription || "A product being designed"}`,

  [INTENT_TYPES.TECHNICAL_INFO]: (productName: string, hasScreenshot: boolean) =>
    `You are a technical advisor for product design and manufacturing.
    The user is asking about technical details for the product "${productName}".
    ${hasScreenshot ? "They have provided a screenshot of the current design. Analyze the technical aspects visible in the image and provide specific technical feedback." : ""}
    Provide detailed technical information, specifications, or requirements as needed.
    Be precise and professional in your response.`,

  [INTENT_TYPES.FEEDBACK]: (productName: string, hasScreenshot: boolean) =>
    `You are a supportive design assistant.
    The user is providing feedback about the product "${productName}".
    ${hasScreenshot ? "They have provided a screenshot of the current design. Review the visual elements and provide constructive feedback on the design, colors, proportions, and overall aesthetic." : ""}
    Acknowledge their feedback appropriately and offer helpful suggestions if needed.
    Be encouraging and constructive.`,

  [INTENT_TYPES.GREETING]: (productName: string) =>
    `You are a friendly AI assistant for a product design tool.
    The user has greeted you. Respond warmly and offer to help with their product design "${productName}".
    Mention that you can help them modify the design or answer questions about it.
    Keep it brief and friendly.`,

  [INTENT_TYPES.GENERAL_CHAT]: (productName: string, productDescription: string, hasScreenshot: boolean) =>
    `You are a knowledgeable AI assistant for product design.
    The user wants to discuss the product "${productName}".
    ${hasScreenshot ? "They have provided a screenshot of the current design. Review all three views (front, back, side) and provide comprehensive feedback on the overall design, suggesting improvements where appropriate." : ""}
    Be conversational, friendly, and helpful. If they seem interested in making changes,
    suggest that they can ask you to modify specific aspects of the design.
    Current product description: ${productDescription || "A product being designed"}`,
};

// Keywords that trigger screenshot capture
export const SCREENSHOT_TRIGGER_KEYWORDS = [
  "opinion",
  "think",
  "feedback",
  "review",
  "look",
  "what do",
  "how is",
  "how does",
  "rate",
  "evaluate",
  "suggest",
  "improve",
  "honest",
  "design",
  "current",
  "this",
  "it",
];
