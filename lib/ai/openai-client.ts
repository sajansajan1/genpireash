/**
 * OpenAI Client Utility
 * Provides a centralized OpenAI client for all AI operations
 * Server-side only
 */

import OpenAI from "openai";

/**
 * Get OpenAI client instance (server-side only)
 *
 * @returns OpenAI client configured with API key from environment
 * @throws Error if called on client-side or if API key is missing
 *
 * @example
 * const openai = getOpenAIClient();
 * const response = await openai.chat.completions.create({
 *   model: "gpt-4o",
 *   messages: [...],
 * });
 */
export function getOpenAIClient(): OpenAI {
  // Ensure server-side only
  if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server");
  }

  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_OPENAI_API_KEY environment variable is not set");
  }

  return new OpenAI({ apiKey });
}

/**
 * Singleton instance for reuse across requests
 * Lazily initialized on first call
 */
let openaiInstance: OpenAI | null = null;

/**
 * Get or create singleton OpenAI client instance
 * Reuses the same client across multiple calls for better performance
 *
 * @returns Singleton OpenAI client instance
 */
export function getOpenAIClientSingleton(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = getOpenAIClient();
  }
  return openaiInstance;
}
