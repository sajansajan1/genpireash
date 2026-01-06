/**
 * Category Detection Function
 * Detects product category from image using AI vision
 */

"use server";

import OpenAI from "openai";
import { getOpenAIClient } from "@/lib/ai";
import { CATEGORY_DETECTION_PROMPT } from "../prompts/category-detection/detect-category.prompt";
import { AI_MODELS_CONFIG, RETRY_CONFIG } from "../config/models.config";
import type { CategoryDetectionResult } from "../types/tech-pack.types";
import { aiLogger } from "@/lib/logging/ai-logger";

/**
 * Detect product category from image
 * @param imageUrl URL of the product image
 * @param userId User ID for logging
 * @returns Category detection result
 */
export async function detectProductCategory(
  imageUrl: string,
  userId?: string
): Promise<CategoryDetectionResult> {
  const startTime = Date.now();
  let attempt = 0;

  // Start AI operation logging
  const logger = aiLogger.startOperation(
    "detectProductCategory",
    AI_MODELS_CONFIG.VISION_MODEL.name,
    "openai",
    "vision_analysis"
  );

  logger.setInput({
    image_url: imageUrl,
    parameters: {
      temperature: AI_MODELS_CONFIG.VISION_MODEL.temperature,
      max_tokens: AI_MODELS_CONFIG.VISION_MODEL.maxTokens,
    },
  });

  logger.setContext({
    user_id: userId,
    feature: "category_detection",
  });

  while (attempt < RETRY_CONFIG.maxRetries) {
    try {
      const openai = getOpenAIClient();

      // Call OpenAI Vision API
      const response = await openai.chat.completions.create({
        model: AI_MODELS_CONFIG.VISION_MODEL.name,
        messages: [
          {
            role: "system",
            content: CATEGORY_DETECTION_PROMPT.systemPrompt + "\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown, no code blocks, just the raw JSON object.",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "low" },
              },
              {
                type: "text",
                text: CATEGORY_DETECTION_PROMPT.userPromptTemplate(imageUrl),
              },
            ],
          },
        ],
        max_tokens: AI_MODELS_CONFIG.VISION_MODEL.maxTokens,
        temperature: AI_MODELS_CONFIG.VISION_MODEL.temperature,
        response_format: { type: "json_object" },
      });

      // Parse response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      // With response_format: json_object, content should be valid JSON
      // But we'll still try to extract JSON in case of markdown wrapping
      let jsonContent = content.trim();

      // Remove markdown code blocks if present
      if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      // Try to extract JSON object if response has extra text
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("OpenAI response without JSON:", content);
        throw new Error(`No JSON found in response. Raw response: ${content.substring(0, 200)}`);
      }

      const result: CategoryDetectionResult = JSON.parse(jsonMatch[0]);

      // Validate result
      if (!result.category || !result.subcategory || typeof result.confidence !== "number") {
        throw new Error("Invalid response format");
      }

      // Log success
      logger.setOutput({
        content: JSON.stringify(result),
        usage: {
          prompt_tokens: response.usage?.prompt_tokens,
          completion_tokens: response.usage?.completion_tokens,
          total_tokens: response.usage?.total_tokens,
        },
      });

      await logger.complete();

      return result;
    } catch (error) {
      attempt++;
      console.error(`Category detection attempt ${attempt} failed:`, error);

      if (attempt >= RETRY_CONFIG.maxRetries) {
        // Log failure
        logger.setError(error instanceof Error ? error.message : "Unknown error");
        await logger.complete();

        throw new Error(`Failed to detect category after ${RETRY_CONFIG.maxRetries} attempts: ${error}`);
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1))
      );
    }
  }

  throw new Error("Failed to detect category");
}
