"use server";

/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH - Front View Generation Service
 * ============================================================================
 *
 * This is the ONLY place where front view images are actually generated.
 * All workflows (Progressive, Stepped, Centralized, etc.) MUST call this service.
 *
 * Purpose:
 * - Centralized generation logic (no duplication)
 * - Automatic Vision API caching for all flows
 * - Consistent prompt building across workflows
 * - Single point for monitoring, logging, and optimization
 *
 * Used By:
 * - Progressive workflow (progressive-generation-workflow.ts)
 * - Stepped workflow (stepped-image-generation.ts)
 * - Centralized service (centralized-generation-service.ts)
 * - Any future workflows
 *
 * DO NOT duplicate this logic anywhere else!
 * ============================================================================
 */

import { GeminiImageService } from "@/lib/ai/gemini";
import { ImageService } from "@/lib/services/image-service";
import { buildFrontViewPrompt } from "@/lib/utils/front-view-prompts";
import { analyzeFrontViewInBackground, type ViewType } from "@/lib/services/vision-analysis-service";
import { aiLogger } from "@/lib/logging/ai-logger";

// Initialize services
const geminiService = new GeminiImageService();
const imageService = ImageService.getInstance();

// ============================================================================
// TYPES
// ============================================================================

/**
 * Parameters for front view generation
 * Generic enough to work with any workflow
 */
export interface FrontViewGenerationParams {
  // Required
  userPrompt: string;

  // Optional context
  referenceImageUrl?: string;
  logoImage?: string;
  modifications?: string;

  // Optional settings
  style?: "photorealistic" | "technical" | "vector" | "detail";
  isEdit?: boolean;

  // Optional metadata (for Vision caching and logging)
  productIdeaId?: string;
  userId?: string;
  sessionId?: string;
  revisionId?: string;
  viewApprovalId?: string;
  projectId?: string; // For image upload path
}

/**
 * Result of front view generation
 */
export interface FrontViewGenerationResult {
  success: boolean;
  imageUrl?: string;
  promptUsed?: string;
  error?: string;
  metadata?: {
    generationTimeMs: number;
    uploadTimeMs: number;
    visionCachingStarted: boolean;
  };
}

// ============================================================================
// MAIN FUNCTION - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Generate front view image
 *
 * This is the ONLY function that should generate front view images.
 * All workflows call this function with their specific parameters.
 *
 * Features:
 * - Generates front view using Gemini API
 * - Uses shared prompt builder for consistency
 * - Uploads to storage with proper paths
 * - Triggers Vision API caching in background (non-blocking)
 * - Comprehensive logging and error handling
 *
 * @param params - Generation parameters
 * @returns Generation result with image URL
 *
 * @example
 * ```typescript
 * // From Progressive workflow
 * const result = await generateFrontViewImage({
 *   userPrompt: "Blue cotton t-shirt",
 *   productIdeaId: productId,
 *   userId: user.id,
 *   logoImage: logoData
 * });
 *
 * // From Stepped workflow
 * const result = await generateFrontViewImage({
 *   userPrompt: "Red leather bag",
 *   sessionId: sessionId,
 *   referenceImageUrl: existingImage
 * });
 * ```
 */
export async function generateFrontViewImage(
  params: FrontViewGenerationParams
): Promise<FrontViewGenerationResult> {
  const startTime = Date.now();

  const logger = aiLogger.startOperation(
    "generateFrontViewImage",
    "gemini-2.5-flash-image-preview",
    "gemini",
    "image_generation"
  );

  try {
    console.log(`[Front View Service] Starting generation...`);

    // ========================================================================
    // STEP 1: Build Prompt (using shared utility)
    // ========================================================================
    const prompt = buildFrontViewPrompt({
      userPrompt: params.userPrompt,
      referenceImageUrl: params.referenceImageUrl,
      logoImage: params.logoImage,
      isEdit: params.isEdit,
      modifications: params.modifications,
      style: params.style || "photorealistic",
    });

    console.log(`[Front View Service] Prompt built (${prompt.length} chars)`);

    // ========================================================================
    // STEP 2: Generate Image (Gemini API)
    // ========================================================================
    logger.setInput({
      prompt,
      parameters: {
        style: params.style || "photorealistic",
      },
    });

    if (params.userId) {
      logger.setContext({
        user_id: params.userId,
        feature: "front_view_generation_service",
        session_id: params.sessionId,
      });
    }

    const generationResult = await geminiService.generateImage({
      prompt,
      referenceImage: params.referenceImageUrl,
      logoImage: params.logoImage,
      view: "front",
      style: params.style || "photorealistic",
      options: {
        enhancePrompt: false,
        fallbackEnabled: true,
        retry: 5,
      },
    });

    const generationTimeMs = Date.now() - startTime;
    console.log(`[Front View Service] Image generated in ${generationTimeMs}ms`);

    // ========================================================================
    // STEP 3: Upload Image to Storage
    // ========================================================================
    const uploadStartTime = Date.now();

    const uploadResult = await imageService.upload(generationResult.url, {
      projectId: params.projectId,
      preset: "original",
      preserveOriginal: true,
    });

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(
        `Failed to upload front view: ${uploadResult.error || "Unknown error"}`
      );
    }

    const uploadTimeMs = Date.now() - uploadStartTime;
    const uploadedUrl = uploadResult.url;

    console.log(`[Front View Service] Image uploaded in ${uploadTimeMs}ms`);
    console.log(`[Front View Service] URL: ${uploadedUrl.substring(0, 100)}...`);

    // ========================================================================
    // STEP 4: Vision API Caching (Background, Non-Blocking)
    // ========================================================================
    // This runs in the background and does NOT block the response
    // Future edits will use cached analysis to save 30 seconds

    let visionCachingStarted = false;

    if (params.userId || params.sessionId) {
      try {
        analyzeFrontViewInBackground(
          {
            imageUrl: uploadedUrl,
            productIdeaId: params.productIdeaId,
            userId: params.userId,
            viewType: "front" as ViewType,
            viewApprovalId: params.viewApprovalId,
            sessionId: params.sessionId,
            revisionId: params.revisionId,
          },
          {
            onSuccess: (result) => {
              console.log(
                `[Front View Service] ✓ Vision analysis complete:`,
                result.cached ? "used cache" : `new (ID: ${result.analysisId})`
              );
            },
            onError: (error) => {
              console.error(
                `[Front View Service] ⚠ Vision analysis failed (non-critical):`,
                error.message
              );
            },
          }
        );
        visionCachingStarted = true;
        console.log(`[Front View Service] Vision caching started in background`);
      } catch (error) {
        console.error(
          `[Front View Service] Warning: Could not start Vision caching:`,
          error
        );
        // Non-critical - don't fail the request
      }
    }

    // ========================================================================
    // STEP 5: Log Success and Return
    // ========================================================================
    const totalTimeMs = Date.now() - startTime;

    logger.setOutput({
      images: [uploadedUrl],
      usage: {
        estimated_cost: 0.002,
      },
    });

    console.log(`[Front View Service] ✓ Complete in ${totalTimeMs}ms`);

    return {
      success: true,
      imageUrl: uploadedUrl,
      promptUsed: prompt,
      metadata: {
        generationTimeMs,
        uploadTimeMs,
        visionCachingStarted,
      },
    };

  } catch (error) {
    const totalTimeMs = Date.now() - startTime;

    console.error(`[Front View Service] ✗ Error after ${totalTimeMs}ms:`, error);

    logger.setOutput({
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Front view generation failed",
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate front view generation parameters
 * Called by workflows before generation
 */
export function validateFrontViewParams(params: FrontViewGenerationParams): {
  valid: boolean;
  error?: string;
} {
  if (!params.userPrompt || params.userPrompt.trim().length === 0) {
    return { valid: false, error: "User prompt is required" };
  }

  if (params.userPrompt.length > 5000) {
    return { valid: false, error: "User prompt is too long (max 5000 characters)" };
  }

  if (params.logoImage && !params.logoImage.startsWith("data:")) {
    // Logo must be base64 data URL
    return { valid: false, error: "Logo image must be a base64 data URL" };
  }

  return { valid: true };
}

/**
 * Get estimated generation time based on parameters
 * Used for UI progress indicators
 */
export function estimateFrontViewGenerationTime(params: FrontViewGenerationParams): number {
  let baseTime = 30000; // 30 seconds base

  if (params.referenceImageUrl) {
    baseTime += 10000; // +10s for reference image processing
  }

  if (params.logoImage) {
    baseTime += 5000; // +5s for logo integration
  }

  return baseTime;
}
