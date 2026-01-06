/**
 * AI Models Configuration
 * Defines settings for OpenAI Vision and Gemini Image Generation models
 *
 * Model Usage:
 * - Front View Generation: IMAGE_GENERATION_MODEL_PRO (gemini-3-pro) - Higher quality
 * - On 503/429/500 errors: Automatically falls back to gemini-2.5-flash
 * - Remaining Views (back, side, top, bottom): IMAGE_GENERATION_MODEL (gemini-2.5-flash) - Fast, consistent
 */

export const AI_MODELS_CONFIG = {
  // Primary model for vision analysis (OpenAI GPT-4o)
  VISION_MODEL: {
    name: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },

  // Model for text-only operations (cheaper, faster)
  TEXT_MODEL: {
    name: "gpt-4o-mini",
    maxTokens: 2048,
    temperature: 0.5,
    topP: 1,
  },

  // Standard image generation model (Gemini 2.5 Flash Image Preview)
  // Used for: Component images, Closeup images
  // Characteristics: Fast, cost-effective, good quality for general use
  IMAGE_GENERATION_MODEL: {
    name: "gemini-2.5-flash-image-preview",
    temperature: 0.1,
    retries: 3,
    enhancePrompt: true,
    fallbackEnabled: true,
  },

  // High-quality image generation model (Gemini 3 Pro Image Preview)
  // Used for: Front views, Technical sketches
  // Note: On 503/429/500 errors, retry logic automatically falls back to gemini-2.5-flash
  IMAGE_GENERATION_MODEL_PRO: {
    name: "gemini-3-pro-image-preview",
    temperature: 0.1,
    retries: 5, // Increased retries with fallback to Flash model
    enhancePrompt: false,
    fallbackEnabled: true,
  },
} as const;

/**
 * Model selection helper - use this to get the appropriate model for each generation type
 */
export const getModelForGenerationType = (
  type: 'component' | 'closeup' | 'sketch' | 'front_view' | 'remaining_view'
): string => {
  switch (type) {
    case 'front_view':
    case 'sketch':
      return AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL_PRO.name;
    case 'remaining_view':
    case 'component':
    case 'closeup':
      return AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL.name;
    default:
      return AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL.name;
  }
};

export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
  backoffMultiplier: 2,
} as const;
