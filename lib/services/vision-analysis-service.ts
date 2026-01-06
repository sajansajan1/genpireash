"use server";

/**
 * Vision Analysis Service
 *
 * Handles Vision API analysis for front view images with intelligent caching
 * Runs in background using process.nextTick/setImmediate to avoid blocking image generation
 *
 * Features:
 * - Automatic cache lookup before API calls
 * - Background execution (non-blocking)
 * - Retry logic with exponential backoff
 * - Database persistence
 * - Type-safe analysis results
 *
 * Usage:
 * ```typescript
 * // After front view generation (non-blocking)
 * analyzeFrontViewInBackground({
 *   imageUrl: frontViewUrl,
 *   productIdeaId: productId,
 *   userId: user.id,
 *   frontViewApprovalId: approvalId
 * });
 * ```
 */

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { executeInBackground } from "@/lib/utils/background-execution";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Structured data extracted from Vision API analysis
 */
export interface VisionAnalysisData {
  colors: Array<{ hex: string; name: string; usage: string }>;
  estimatedDimensions: { width: string; height: string; depth?: string };
  materials: string[];
  keyElements: string[];
  description: string;
}

/**
 * View types supported by Vision analysis
 */
export type ViewType = "front" | "back" | "side" | "detail" | "other";

/**
 * Parameters for Vision analysis request
 */
export interface VisionAnalysisParams {
  imageUrl: string;
  productIdeaId?: string;
  userId?: string;
  revisionId?: string;
  viewType?: ViewType;
  viewApprovalId?: string; // Generic reference to any view approval record
  sessionId?: string;
  batchId?: string;
}

/**
 * Result of Vision analysis operation
 */
export interface VisionAnalysisResult {
  success: boolean;
  data?: VisionAnalysisData;
  cached?: boolean;
  analysisId?: string;
  error?: string;
}

// ============================================================================
// OPENAI CLIENT
// ============================================================================

/**
 * Get OpenAI client instance (server-side only)
 */
function getOpenAIClient(): OpenAI {
  if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server");
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_OPENAI_API_KEY environment variable is not set");
  }

  return new OpenAI({ apiKey });
}

// ============================================================================
// CACHE OPERATIONS
// ============================================================================

/**
 * Check if analysis exists in cache
 *
 * @param imageUrl - URL of the image to lookup
 * @returns Cached analysis result or null if not found
 */
async function getCachedAnalysis(
  imageUrl: string
): Promise<VisionAnalysisResult | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("revision_vision_analysis")
      .select("*")
      .eq("image_url", imageUrl)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if cache is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.log(`[Vision Cache] Cache expired for ${imageUrl.substring(0, 80)}...`);
      return null;
    }

    console.log(`[Vision Cache] ✓ Cache HIT for ${imageUrl.substring(0, 80)}...`);

    return {
      success: true,
      data: data.analysis_data as VisionAnalysisData,
      cached: true,
      analysisId: data.id,
    };
  } catch (error) {
    console.error("[Vision Cache] Error checking cache:", error);
    return null;
  }
}

/**
 * Save analysis to database cache
 *
 * @param params - Analysis parameters
 * @param analysisData - Vision API analysis results
 * @param metadata - Additional metadata (tokens, processing time, etc.)
 * @returns ID of created cache entry or null if failed
 */
async function saveAnalysisToCache(
  params: VisionAnalysisParams,
  analysisData: VisionAnalysisData,
  metadata: {
    tokensUsed?: number;
    processingTimeMs?: number;
    modelUsed?: string;
  }
): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const cacheEntry = {
      image_url: params.imageUrl,
      product_idea_id: params.productIdeaId,
      user_id: params.userId || user?.id,
      revision_id: params.revisionId,
      view_type: params.viewType || "front", // Default to front for backward compatibility
      view_approval_id: params.viewApprovalId,
      session_id: params.sessionId,
      batch_id: params.batchId,
      analysis_data: analysisData,
      model_used: metadata.modelUsed || "gpt-4o-mini",
      tokens_used: metadata.tokensUsed,
      processing_time_ms: metadata.processingTimeMs,
      status: "completed",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("revision_vision_analysis")
      .insert(cacheEntry)
      .select("id")
      .single();

    if (error) {
      console.error("[Vision Cache] Error saving to cache:", error);
      return null;
    }

    console.log(`[Vision Cache] ✓ Saved analysis (ID: ${data.id})`);
    return data.id;

  } catch (error) {
    console.error("[Vision Cache] Error in saveAnalysisToCache:", error);
    return null;
  }
}

// ============================================================================
// VISION API ANALYSIS
// ============================================================================

/**
 * Perform Vision API analysis on image
 *
 * @param imageUrl - URL of image to analyze
 * @returns Analysis data and token usage
 */
async function performVisionAnalysis(
  imageUrl: string
): Promise<{ data: VisionAnalysisData; tokensUsed?: number }> {
  const openai = getOpenAIClient();
  const startTime = Date.now();

  console.log(`[Vision API] Starting analysis for ${imageUrl.substring(0, 80)}...`);

  const systemPrompt = `You are an expert at analyzing product images and extracting key features for manufacturing consistency.

Analyze the product image and extract:
1. All visible colors with hex codes (be specific, e.g., "#FF5733 red")
2. Materials and textures (e.g., "cotton", "leather", "polyester")
3. Key design elements (e.g., "logo placement", "button style", "stitching")
4. Estimated dimensions/proportions (e.g., "standard t-shirt size", "compact handbag")
5. Detailed product description for future reference

Return the data in JSON format with these exact fields:
- colors: array of {hex, name, usage}
- dimensions: {width, height, depth (optional)}
- materials: array of strings
- keyElements: array of strings
- description: string`;

  // Convert URL to base64 to avoid OpenAI download timeout issues
  let imageDataUrl = imageUrl;
  if (!imageUrl.startsWith("data:")) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = response.headers.get("content-type") || "image/jpeg";
      imageDataUrl = `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.warn("[Vision API] Failed to convert to base64, using direct URL:", error);
      // Continue with direct URL as fallback
    }
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all features from this product image for consistent multi-view generation:",
          },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    throw new Error("No response from Vision API");
  }

  const features = JSON.parse(response);
  const processingTime = Date.now() - startTime;

  console.log(`[Vision API] ✓ Analysis completed in ${processingTime}ms`);

  // Ensure the structure matches our interface
  const analysisData: VisionAnalysisData = {
    colors: features.colors || [],
    estimatedDimensions: features.dimensions || {
      width: "unknown",
      height: "unknown",
    },
    materials: features.materials || [],
    keyElements: features.keyElements || [],
    description: features.description || "",
  };

  return {
    data: analysisData,
    tokensUsed: completion.usage?.total_tokens,
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Analyze front view image (blocking - returns result immediately)
 * Use this when you need the analysis synchronously
 *
 * @param params - Analysis parameters
 * @returns Promise resolving to analysis result
 */
export async function analyzeFrontView(
  params: VisionAnalysisParams
): Promise<VisionAnalysisResult> {
  try {
    // Check cache first
    const cached = await getCachedAnalysis(params.imageUrl);
    if (cached) {
      return cached;
    }

    console.log(`[Vision Analysis] Cache miss, performing analysis...`);

    // Perform analysis
    const { data, tokensUsed } = await performVisionAnalysis(params.imageUrl);

    // Save to cache (non-blocking)
    executeInBackground(async () => {
      await saveAnalysisToCache(params, data, {
        tokensUsed,
        modelUsed: "gpt-4o-mini",
      });
    });

    return {
      success: true,
      data,
      cached: false,
    };
  } catch (error) {
    console.error("[Vision Analysis] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Vision analysis failed",
    };
  }
}

/**
 * Analyze product view image in background (non-blocking)
 * Use this after ANY view generation (front, back, side, detail) to cache for future use
 * THIS IS THE PRIMARY FUNCTION TO USE AFTER IMAGE GENERATION
 *
 * @param params - Analysis parameters
 * @param callbacks - Optional success/error callbacks
 *
 * @example
 * ```typescript
 * // After generating front view
 * analyzeFrontViewInBackground(
 *   {
 *     imageUrl: uploadedViewUrl,
 *     productIdeaId: params.productId,
 *     userId: user.id,
 *     viewType: 'front', // or 'back', 'side', 'detail', 'other'
 *     viewApprovalId: approval.id,
 *     sessionId: sessionId
 *   },
 *   {
 *     onSuccess: (result) => {
 *       console.log('Vision analysis complete:', result.cached ? 'from cache' : 'new analysis');
 *     },
 *     onError: (error) => {
 *       console.error('Vision analysis failed (non-critical):', error);
 *     }
 *   }
 * );
 * // Function returns immediately, analysis runs in background
 * ```
 */
export async function analyzeFrontViewInBackground(
  params: VisionAnalysisParams,
  callbacks?: {
    onSuccess?: (result: VisionAnalysisResult) => void;
    onError?: (error: Error) => void;
  }
): Promise<void> {
  console.log(`[Vision Background] Scheduling analysis for ${params.imageUrl.substring(0, 80)}...`);

  executeInBackground(
    async () => {
      // Check cache first
      const cached = await getCachedAnalysis(params.imageUrl);
      if (cached) {
        return cached;
      }

      console.log(`[Vision Background] Cache miss, analyzing...`);

      // Perform analysis
      const startTime = Date.now();
      const { data, tokensUsed } = await performVisionAnalysis(params.imageUrl);
      const processingTime = Date.now() - startTime;

      // Save to cache
      const analysisId = await saveAnalysisToCache(params, data, {
        tokensUsed,
        processingTimeMs: processingTime,
        modelUsed: "gpt-4o-mini",
      });

      console.log(`[Vision Background] ✓ Complete and cached (ID: ${analysisId})`);

      return {
        success: true,
        data,
        cached: false,
        analysisId: analysisId || undefined,
      };
    },
    {
      onSuccess: callbacks?.onSuccess,
      onError: callbacks?.onError,
      timeout: 30000, // 30 second timeout
      retries: 2, // Retry twice on failure
    }
  );
}

/**
 * Get cached analysis by ID
 *
 * @param analysisId - UUID of the analysis record
 * @returns Analysis result or null if not found
 */
export async function getAnalysisById(
  analysisId: string
): Promise<VisionAnalysisResult | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("revision_vision_analysis")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      success: true,
      data: data.analysis_data as VisionAnalysisData,
      cached: true,
      analysisId: data.id,
    };
  } catch (error) {
    console.error("[Vision Analysis] Error getting analysis by ID:", error);
    return null;
  }
}

/**
 * Get cached analysis by image URL
 *
 * @param imageUrl - URL of the image
 * @returns Analysis result or null if not cached
 */
export async function getAnalysisByImageUrl(
  imageUrl: string
): Promise<VisionAnalysisResult | null> {
  return getCachedAnalysis(imageUrl);
}
