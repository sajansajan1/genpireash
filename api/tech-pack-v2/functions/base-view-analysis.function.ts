/**
 * Base View Analysis Function
 * Analyzes base view images to extract technical specifications
 */

"use server";

import OpenAI from "openai";
import { getOpenAIClient } from "@/lib/ai";
import { UNIVERSAL_BASE_VIEW_PROMPT } from "../prompts/base-views/universal.prompt";
import { AI_MODELS_CONFIG } from "../config/models.config";
import type { BaseViewAnalysis, ViewType } from "../types/tech-pack.types";
import { aiLogger } from "@/lib/logging/ai-logger";
import { createClient } from "@/lib/supabase/server";
import { calculateImageHash } from "../utils/image-hash";
import { assessOverallConfidence } from "../utils/confidence-scorer";
import { normalizeBaseViewAnalysis } from "../utils/schema-normalizer";
import { createTechFile, getLatestTechFiles } from "../tech-files-service";

/**
 * Analyze a single base view image
 * @param viewType Type of view (front, back, side, etc.)
 * @param imageUrl URL of the image to analyze
 * @param category Product category (if known)
 * @param productId Product ID
 * @param userId User ID
 * @param revisionId Revision ID from product_multiview_revisions
 * @returns Base view analysis result
 */
export async function analyzeBaseView(
  viewType: ViewType,
  imageUrl: string,
  category: string,
  productId: string,
  userId: string,
  revisionId: string
): Promise<{
  analysisId: string;
  analysisData: BaseViewAnalysis;
  cached: boolean;
}> {
  // Start AI operation logging
  const logger = aiLogger.startOperation(
    "analyzeBaseView",
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
    metadata: {
      view_type: viewType,
      category,
    },
  });

  logger.setContext({
    user_id: userId,
    feature: "base_view_analysis",
  });

  try {
    const supabase = await createClient();

    // Fetch product idea context for enriched analysis (including dimensions and materials)
    const { data: productIdea } = await supabase
      .from("product_ideas")
      .select("product_name, product_description, prompt, product_dimensions, product_materials")
      .eq("id", productId)
      .single();

    // Fetch revision created_at to filter conversation history
    const { data: revision } = await supabase
      .from("product_multiview_revisions")
      .select("created_at")
      .eq("id", revisionId)
      .single();

    // Fetch conversation history from ai_chat_messages up to revision creation time
    let chatMessagesQuery = supabase
      .from("ai_chat_messages")
      .select("message_type, content, created_at")
      .eq("product_idea_id", productId)
      .order("created_at", { ascending: true });

    // Filter messages to only include those created before or at the revision time
    if (revision?.created_at) {
      chatMessagesQuery = chatMessagesQuery.lte(
        "created_at",
        revision.created_at
      );
    }

    const { data: chatMessages } = await chatMessagesQuery;

    // Build product context string
    let productContext = "";
    if (productIdea) {
      productContext =
        "\n\n📋 PRODUCT CONTEXT (use this to inform your analysis):\n";

      if (productIdea.product_name) {
        productContext += `Product Name: ${productIdea.product_name}\n`;
      }

      if (productIdea.product_description) {
        productContext += `Product Description: ${productIdea.product_description}\n`;
      }

      if (productIdea.prompt) {
        productContext += `Original User Request: ${productIdea.prompt}\n`;
      }

      // Add product dimensions if available
      if (productIdea.product_dimensions) {
        const dims = productIdea.product_dimensions;
        productContext += `\n📐 PRODUCT DIMENSIONS (Market Standard - ${dims.productType || 'Standard'}):\n`;

        const recommended = dims.user || dims.recommended;
        if (recommended) {
          if (recommended.height) productContext += `- Height: ${recommended.height.value} ${recommended.height.unit}\n`;
          if (recommended.width) productContext += `- Width: ${recommended.width.value} ${recommended.width.unit}\n`;
          if (recommended.length) productContext += `- Length/Depth: ${recommended.length.value} ${recommended.length.unit}\n`;
          if (recommended.weight) productContext += `- Weight: ${recommended.weight.value} ${recommended.weight.unit}\n`;
          if (recommended.volume) productContext += `- Volume: ${recommended.volume.value} ${recommended.volume.unit}\n`;

          // Include additional dimensions if any
          if (recommended.additionalDimensions && recommended.additionalDimensions.length > 0) {
            recommended.additionalDimensions.forEach((dim: any) => {
              productContext += `- ${dim.name}: ${dim.value} ${dim.unit}${dim.description ? ` (${dim.description})` : ''}\n`;
            });
          }
        }

        if (dims.marketStandard) {
          productContext += `Market Standard: ${dims.marketStandard}\n`;
        }
      }

      // Add product materials if available
      if (productIdea.product_materials) {
        const mats = productIdea.product_materials;
        const materials = mats.user || mats.recommended;
        if (materials && Array.isArray(materials) && materials.length > 0) {
          productContext += `\n🧵 PRODUCT MATERIALS (Approved Specifications):\n`;
          materials.forEach((mat: any, idx: number) => {
            productContext += `${idx + 1}. ${mat.component}: ${mat.material}`;
            if (mat.specification) productContext += ` - ${mat.specification}`;
            if (mat.color) productContext += ` (${mat.color})`;
            if (mat.finish) productContext += ` [${mat.finish}]`;
            productContext += `\n`;
          });
        }
      }

      // Add conversation history from ai_chat_messages (focus on user requests)
      if (chatMessages && chatMessages.length > 0) {
        productContext += `\nUser Conversation History (up to this revision):\n`;

        // Filter to get only user messages and take the last 5
        const userMessages = chatMessages
          .filter((msg) => msg.message_type === "user")
          .slice(-5);

        userMessages.forEach((msg, idx) => {
          if (msg.content) {
            // Truncate long messages
            const truncatedContent =
              msg.content.length > 200
                ? `${msg.content.substring(0, 200)}...`
                : msg.content;
            productContext += `${idx + 1}. User: ${truncatedContent}\n`;
          }
        });
      }

      productContext +=
        "\n⚠️ IMPORTANT: Use this context to better understand the product's intended purpose, target market, and key features. Your analysis should align with this context.\n";

      console.log("[Base View Analysis] Using product context enrichment:", {
        hasName: !!productIdea.product_name,
        hasDescription: !!productIdea.product_description,
        hasInitialPrompt: !!productIdea.prompt,
        hasDimensions: !!productIdea.product_dimensions,
        hasMaterials: !!productIdea.product_materials,
        revisionCreatedAt: revision?.created_at,
        totalChatMessages: chatMessages?.length || 0,
        userMessageCount:
          chatMessages?.filter((m) => m.message_type === "user").length || 0,
      });
    }

    // Calculate image hash for caching
    const imageHash = await calculateImageHash(imageUrl);

    // Check cache in tech_files table first
    const cachedFiles = await getLatestTechFiles(productId, {
      fileType: "base_view",
      viewType: viewType as "front" | "back" | "side",
      revisionId,
    });

    const cachedFile = cachedFiles.find(
      (file) => file.file_url === imageUrl && file.status === "completed"
    );

    if (cachedFile && cachedFile.analysis_data) {
      console.log("Using cached base view analysis from tech_files");

      // Normalize cached data to ensure consistent schema
      const normalizedData = normalizeBaseViewAnalysis(
        cachedFile.analysis_data,
        viewType
      );

      // Log cache hit
      logger.setOutput({
        content: "Cache hit - normalized schema",
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      });
      await logger.complete();

      return {
        analysisId: cachedFile.id,
        analysisData: normalizedData,
        cached: true,
      };
    }

    // Fallback: Check old revision_vision_analysis table for backwards compatibility
    const { data: cachedAnalysis } = await supabase
      .from("revision_vision_analysis")
      .select("*")
      .eq("image_url", imageUrl)
      .eq("status", "completed")
      .eq("revision_id", revisionId)
      .maybeSingle();

    if (cachedAnalysis && cachedAnalysis.analysis_data) {
      console.log(
        "Using cached base view analysis from revision_vision_analysis (legacy)"
      );

      // Normalize cached data to ensure consistent schema
      const normalizedData = normalizeBaseViewAnalysis(
        cachedAnalysis.analysis_data,
        viewType
      );

      // Log cache hit
      logger.setOutput({
        content: "Cache hit - normalized schema (legacy)",
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      });
      await logger.complete();

      return {
        analysisId: cachedAnalysis.id,
        analysisData: normalizedData,
        cached: true,
      };
    }

    // Get OpenAI client
    const openai = getOpenAIClient();

    // Call OpenAI Vision API with product context
    const basePrompt = UNIVERSAL_BASE_VIEW_PROMPT.userPromptTemplate(
      viewType,
      imageUrl
    );
    const enrichedPrompt = basePrompt + productContext;

    const response = await openai.chat.completions.create({
      model: AI_MODELS_CONFIG.VISION_MODEL.name,
      messages: [
        {
          role: "system",
          content: UNIVERSAL_BASE_VIEW_PROMPT.systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
            {
              type: "text",
              text: enrichedPrompt,
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

    const rawAnalysis = JSON.parse(content);

    // Normalize to ensure consistent schema structure
    const analysisData = normalizeBaseViewAnalysis(rawAnalysis, viewType);

    // Assess confidence (assume 1200x1200 for now, could fetch actual dimensions)
    const confidenceAssessment = assessOverallConfidence(
      analysisData,
      1200,
      1200,
      category
    );

    // Store in new tech_files table
    const techFile = await createTechFile({
      product_idea_id: productId,
      revision_id: revisionId,
      user_id: userId,
      file_type: "base_view",
      file_category: viewType, // Store view type as category
      view_type: viewType as "front" | "back" | "side",
      file_url: imageUrl,
      analysis_data: analysisData,
      metadata: {
        image_hash: imageHash,
        tokens_used: response.usage?.total_tokens || 0,
      },
      ai_model_used: AI_MODELS_CONFIG.VISION_MODEL.name,
      confidence_score: confidenceAssessment.score,
      status: "completed",
      credits_used: 1, // Base view analysis costs 1 credit
    });

    // Also store in legacy revision_vision_analysis for backwards compatibility
    await supabase.from("revision_vision_analysis").insert({
      product_idea_id: productId,
      user_id: userId,
      revision_id: revisionId,
      view_type: viewType,
      image_url: imageUrl,
      image_hash: imageHash,
      analysis_data: analysisData,
      model_used: AI_MODELS_CONFIG.VISION_MODEL.name,
      tokens_used: response.usage?.total_tokens || 0,
      processing_time_ms: 0,
      confidence_score: confidenceAssessment.score,
      status: "completed",
    });

    // Log success
    logger.setOutput({
      content: JSON.stringify({ analysisId: techFile.id }),
      usage: {
        prompt_tokens: response.usage?.prompt_tokens,
        completion_tokens: response.usage?.completion_tokens,
        total_tokens: response.usage?.total_tokens,
      },
    });

    await logger.complete();

    return {
      analysisId: techFile.id,
      analysisData,
      cached: false,
    };
  } catch (error) {
    console.error("Base view analysis failed:", error);

    // Log failure
    logger.setError(error instanceof Error ? error.message : "Unknown error");
    await logger.complete();

    throw error;
  }
}

/**
 * Analyze multiple base views in batch
 * @param views Array of view objects with viewType, imageUrl, revisionId
 * @param category Product category
 * @param productId Product ID
 * @param userId User ID
 * @returns Array of analysis results
 */
export async function analyzeBaseViewsBatch(
  views: Array<{ viewType: ViewType; imageUrl: string; revisionId: string }>,
  category: string,
  productId: string,
  userId: string
): Promise<
  Array<{
    viewType: ViewType;
    revisionId: string;
    analysisId: string;
    analysisData: BaseViewAnalysis;
    cached: boolean;
  }>
> {
  const results = [];

  for (const view of views) {
    try {
      const result = await analyzeBaseView(
        view.viewType,
        view.imageUrl,
        category,
        productId,
        userId,
        view.revisionId
      );

      results.push({
        viewType: view.viewType,
        revisionId: view.revisionId,
        ...result,
      });
    } catch (error) {
      console.error(`Failed to analyze ${view.viewType} view:`, error);
      // Continue with other views even if one fails
    }
  }

  return results;
}
