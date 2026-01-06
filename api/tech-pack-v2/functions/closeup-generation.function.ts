/**
 * Close-Up Generation Function
 * Generates close-up detail shots with AI analysis
 */

"use server";

import { getOpenAIClient } from "@/lib/ai";
import { getGeminiService } from "@/lib/ai/gemini";
import { uploadImage } from "@/lib/services/image-service";
import { createClient } from "@/lib/supabase/server";
import { CLOSEUP_GENERATION_PLAN_PROMPT } from "../prompts/close-ups/generate-closeup-plan.prompt";
import { CLOSEUP_ANALYSIS_PROMPT } from "../prompts/close-ups/analyze-closeup.prompt";
import { CLOSEUP_SUMMARY_GENERATION_PROMPT } from "../prompts/close-ups/generate-closeup-summary.prompt";
import { AI_MODELS_CONFIG } from "../config/models.config";
import type { CloseUpPlan, CloseUpAnalysis } from "../types/tech-pack.types";
import { aiLogger } from "@/lib/logging/ai-logger";
import { calculateBase64Hash } from "../utils/image-hash";
import { createTechFile } from "../tech-files-service";

/**
 * Generate close-up plan based on base view analyses
 * @param productCategory Product category
 * @param baseViewAnalyses Combined base view analysis data
 * @param userId User ID
 * @returns Close-up generation plan
 */
async function generateCloseUpPlan(
  productCategory: string,
  baseViewAnalyses: any[],
  userId: string
): Promise<CloseUpPlan> {
  const openai = getOpenAIClient();

  // Combine all base view analyses into a summary
  const analysisSummary = JSON.stringify(baseViewAnalyses, null, 2);

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: CLOSEUP_GENERATION_PLAN_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: CLOSEUP_GENERATION_PLAN_PROMPT.userPromptTemplate(productCategory, analysisSummary),
      },
    ],
    max_tokens: AI_MODELS_CONFIG.VISION_MODEL.maxTokens,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No close-up plan generated");
  }

  return JSON.parse(content) as CloseUpPlan;
}

/**
 * Generate comprehensive close-up summary
 * @param shotName Shot name
 * @param productCategory Product category
 * @param analysisData Close-up analysis data
 * @param approvedDimensions Optional approved dimensions to enforce
 * @returns Close-up summary guide
 */
async function generateCloseUpSummary(
  shotName: string,
  productCategory: string,
  analysisData: CloseUpAnalysis,
  approvedDimensions?: any
): Promise<any> {
  const openai = getOpenAIClient();

  // Build mandatory dimensions instruction if approved dimensions exist
  let dimensionsInstruction = "";
  if (approvedDimensions) {
    const dims = approvedDimensions.user || approvedDimensions.recommended;
    if (dims) {
      const dimList: string[] = [];
      if (dims.width) dimList.push(`Product Width: ${dims.width.value} ${dims.width.unit}`);
      if (dims.height) dimList.push(`Product Height: ${dims.height.value} ${dims.height.unit}`);
      if (dims.length) dimList.push(`Product Depth: ${dims.length.value} ${dims.length.unit}`);

      if (dims.additionalDimensions && Array.isArray(dims.additionalDimensions)) {
        dims.additionalDimensions.forEach((dim: any) => {
          if (dim.name && dim.value && dim.unit) {
            dimList.push(`${dim.name}: ${dim.value} ${dim.unit}`);
          }
        });
      }

      if (dimList.length > 0) {
        dimensionsInstruction = `\n\n⚠️ APPROVED PRODUCT DIMENSIONS (use for scale reference):\n${dimList.join('\n')}`;
      }
    }
  }

  const basePrompt = CLOSEUP_SUMMARY_GENERATION_PROMPT.userPromptTemplate(
    shotName,
    productCategory,
    analysisData
  );

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: CLOSEUP_SUMMARY_GENERATION_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: basePrompt + dimensionsInstruction,
      },
    ],
    max_tokens: 3072,
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No close-up summary generated");
  }

  return JSON.parse(content);
}

/**
 * Generate and analyze close-up detail shots
 * @param productId Product ID
 * @param productCategory Product category
 * @param baseViewAnalyses Base view analysis data with image URLs
 * @param userId User ID
 * @returns Array of generated close-ups with analysis
 */
export async function generateCloseUps(
  productId: string,
  productCategory: string,
  baseViewAnalyses: Array<{ imageUrl: string; analysisData: any; revisionId?: string }>,
  userId: string
): Promise<
  Array<{
    revisionId: string;
    analysisId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    shotName: string;
    analysisData: CloseUpAnalysis;
    summary?: any;
  }>
> {
  const supabase = await createClient();
  const gemini = getGeminiService();
  const openai = getOpenAIClient();

  try {
    // Extract reference image URLs and revision IDs (prefer front view, then back, then side)
    const sortedBaseViews = baseViewAnalyses.sort((a, b) => {
      const priority: Record<string, number> = { front: 1, back: 2, side: 3 };
      const aType = a.analysisData?.view_type || 'other';
      const bType = b.analysisData?.view_type || 'other';
      return (priority[aType] || 99) - (priority[bType] || 99);
    });

    const referenceImages = sortedBaseViews
      .map(v => v.imageUrl)
      .filter(Boolean);

    // Use the primary (front) view's revision ID for closeups
    const primaryRevisionId = sortedBaseViews[0]?.revisionId || null;

    if (referenceImages.length === 0) {
      throw new Error("No reference images provided for closeup generation");
    }

    console.log(`Using ${referenceImages.length} reference images for closeup generation`);

    // Fetch product dimensions and materials for context
    const { data: productIdea } = await supabase
      .from("product_ideas")
      .select("product_dimensions, product_materials")
      .eq("id", productId)
      .single();

    // Build dimensions context string
    let dimensionsContext = "";
    if (productIdea?.product_dimensions) {
      const dims = productIdea.product_dimensions;
      dimensionsContext = `\n📐 PRODUCT DIMENSIONS (Market Standard - ${dims.productType || 'Standard'}):\n`;

      const recommended = dims.user || dims.recommended;
      if (recommended) {
        if (recommended.height) dimensionsContext += `- Height: ${recommended.height.value} ${recommended.height.unit}\n`;
        if (recommended.width) dimensionsContext += `- Width: ${recommended.width.value} ${recommended.width.unit}\n`;
        if (recommended.length) dimensionsContext += `- Length/Depth: ${recommended.length.value} ${recommended.length.unit}\n`;
        if (recommended.weight) dimensionsContext += `- Weight: ${recommended.weight.value} ${recommended.weight.unit}\n`;
        if (recommended.volume) dimensionsContext += `- Volume: ${recommended.volume.value} ${recommended.volume.unit}\n`;

        if (recommended.additionalDimensions && recommended.additionalDimensions.length > 0) {
          recommended.additionalDimensions.forEach((dim: any) => {
            dimensionsContext += `- ${dim.name}: ${dim.value} ${dim.unit}${dim.description ? ` (${dim.description})` : ''}\n`;
          });
        }
      }

      if (dims.marketStandard) {
        dimensionsContext += `Market Standard: ${dims.marketStandard}\n`;
      }
    }

    // Build materials context string
    let materialsContext = "";
    if (productIdea?.product_materials) {
      const mats = productIdea.product_materials;
      const materials = mats.user || mats.recommended;
      if (materials && Array.isArray(materials) && materials.length > 0) {
        materialsContext = `\n🧵 PRODUCT MATERIALS (Approved Specifications):\n`;
        materials.forEach((mat: any, idx: number) => {
          materialsContext += `${idx + 1}. ${mat.component}: ${mat.material}`;
          if (mat.specification) materialsContext += ` - ${mat.specification}`;
          if (mat.color) materialsContext += ` (${mat.color})`;
          if (mat.finish) materialsContext += ` [${mat.finish}]`;
          materialsContext += `\n`;
        });
        console.log(`[Close-up Generation] Using product materials context`);
      }
    }

    // Step 1: Generate close-up plan
    console.log("Generating close-up plan...");
    const analysisSummaryArray = baseViewAnalyses.map(v => ({
      ...v.analysisData,
      product_dimensions: dimensionsContext || undefined,
      product_materials: materialsContext || undefined,
    }));
    const plan = await generateCloseUpPlan(productCategory, analysisSummaryArray, userId);

    const results = [];

    // Step 2: Generate each close-up shot
    // Build explicit dimensions instruction for closeups
    let explicitDimensionsInstruction = "";
    if (productIdea?.product_dimensions) {
      const dims = productIdea.product_dimensions;
      const recommended = dims.user || dims.recommended;
      if (recommended) {
        const dimParts: string[] = [];
        if (recommended.width) dimParts.push(`Product Width: ${recommended.width.value} ${recommended.width.unit}`);
        if (recommended.height) dimParts.push(`Product Height: ${recommended.height.value} ${recommended.height.unit}`);
        if (recommended.length) dimParts.push(`Product Depth: ${recommended.length.value} ${recommended.length.unit}`);

        if (recommended.additionalDimensions && Array.isArray(recommended.additionalDimensions)) {
          recommended.additionalDimensions.forEach((dim: any) => {
            if (dim.name && dim.value && dim.unit) {
              dimParts.push(`${dim.name}: ${dim.value} ${dim.unit}`);
            }
          });
        }

        if (dimParts.length > 0) {
          explicitDimensionsInstruction = `\n\nPRODUCT DIMENSIONS (for scale reference):\n${dimParts.join('\n')}`;
        }
      }
    }

    // Limit to maximum 3 closeup shots - take the most important ones by priority
    const maxCloseups = 3;
    const limitedCloseupShots = plan.closeup_shots
      .sort((a: any, b: any) => (a.priority || 99) - (b.priority || 99))
      .slice(0, maxCloseups);

    console.log(`[Close-up Generation] Limiting to ${limitedCloseupShots.length} closeups (from ${plan.closeup_shots.length} planned)`);

    for (let i = 0; i < limitedCloseupShots.length; i++) {
      const shot = limitedCloseupShots[i];

      try {
        console.log(`Generating close-up ${i + 1}/${limitedCloseupShots.length}: ${shot.shot_name}`);

        // Generate close-up image using Gemini with reference images
        // Use the primary reference image (front view) for style consistency
        let enhancedPrompt = `${shot.image_generation_prompt}${explicitDimensionsInstruction}\n\nIMPORTANT: This closeup must match the exact style, colors, materials, and design of the reference product image. Maintain complete visual consistency with the reference.`;

        const generatedImage = await gemini.generateImage({
          prompt: enhancedPrompt,
          referenceImage: referenceImages[0], // Use front view as primary reference
          options: {
            retry: 3,
            enhancePrompt: false, // Don't enhance - our prompt is already detailed
            fallbackEnabled: true,
            model: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL.name, // Use flash model for closeup images
          },
        });

        // Convert data URL to buffer
        const base64Data = generatedImage.url.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to storage
        const uploadResult = await uploadImage(buffer, {
          projectId: productId,
          preset: "standard",
          generateThumbnail: true,
        });

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error("Failed to upload close-up image");
        }

        console.log(`Close-up image uploaded successfully: ${uploadResult.url}`);

        // Analyze the generated close-up using the generated image data
        console.log(`Analyzing close-up: ${shot.shot_name}`);
        const analysisResponse = await openai.chat.completions.create({
          model: AI_MODELS_CONFIG.VISION_MODEL.name,
          messages: [
            {
              role: "system",
              content: CLOSEUP_ANALYSIS_PROMPT.systemPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: generatedImage.url }, // Use base64 data URL from Gemini, not Supabase URL
                },
                {
                  type: "text",
                  text: CLOSEUP_ANALYSIS_PROMPT.userPromptTemplate(
                    shot.shot_name,
                    shot.analysis_focus,
                    uploadResult.url
                  ),
                },
              ],
            },
          ],
          max_tokens: AI_MODELS_CONFIG.VISION_MODEL.maxTokens,
          temperature: 0.7,
          response_format: { type: "json_object" },
        });

        const analysisContent = analysisResponse.choices[0]?.message?.content;
        if (!analysisContent) {
          throw new Error("No analysis generated");
        }

        const analysisData: CloseUpAnalysis = JSON.parse(analysisContent);

        // Step 3: Generate comprehensive close-up summary with approved dimensions
        console.log(`Generating summary guide for close-up: ${shot.shot_name}`);
        const closeUpSummary = await generateCloseUpSummary(
          shot.shot_name,
          productCategory,
          analysisData,
          productIdea?.product_dimensions // Pass approved dimensions to enforce in guide
        );

        // Calculate hash and store in tech_files
        const imageHash = calculateBase64Hash(base64Data);

        const techFile = await createTechFile({
          product_idea_id: productId,
          user_id: userId,
          revision_id: primaryRevisionId, // Link to primary (front) view revision
          file_type: 'closeup',
          file_category: shot.shot_name,
          file_url: uploadResult.url,
          thumbnail_url: uploadResult.thumbnailUrl,
          file_format: 'png',
          analysis_data: {
            ...analysisData,
            category: "close_up",
            shot_name: shot.shot_name,
            summary: closeUpSummary, // Add comprehensive close-up summary
          },
          metadata: {
            image_hash: imageHash,
            tokens_used: analysisResponse.usage?.total_tokens || 0,
            shot_info: shot,
          },
          ai_model_used: AI_MODELS_CONFIG.VISION_MODEL.name,
          confidence_score: analysisData.confidence_score,
          status: 'completed',
          credits_used: 1, // Each closeup costs 1 credit
        });

        // Also store in legacy table for backwards compatibility
        await supabase
          .from("revision_vision_analysis")
          .insert({
            product_idea_id: productId,
            user_id: userId,
            revision_id: primaryRevisionId,
            view_type: "detail",
            image_url: uploadResult.url,
            image_hash: imageHash,
            analysis_data: {
              ...analysisData,
              category: "close_up",
              shot_name: shot.shot_name,
              summary: closeUpSummary,
            },
            model_used: AI_MODELS_CONFIG.VISION_MODEL.name,
            tokens_used: analysisResponse.usage?.total_tokens || 0,
            confidence_score: analysisData.confidence_score,
            status: "completed",
          });

        results.push({
          revisionId: techFile.id, // Use tech file ID as the identifier
          analysisId: techFile.id,
          imageUrl: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          shotName: shot.shot_name,
          analysisData,
          summary: closeUpSummary, // Include summary in return data
        });
      } catch (error) {
        console.error(`Failed to generate close-up ${shot.shot_name}:`, error);

        // Save failed closeup to database with error status
        try {
          const techFile = await createTechFile({
            product_idea_id: productId,
            user_id: userId,
            revision_id: primaryRevisionId,
            file_type: 'closeup',
            file_category: shot.shot_name,
            file_url: '', // No URL since generation failed
            file_format: 'png',
            analysis_data: {
              category: "close_up",
              shot_name: shot.shot_name,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            metadata: {
              shot_info: shot,
              error_details: error instanceof Error ? error.stack : String(error),
            },
            ai_model_used: AI_MODELS_CONFIG.VISION_MODEL.name,
            status: 'failed',
            credits_used: 0, // Don't charge for failed generations
          });

          // Add error result to return array so UI can display it
          results.push({
            revisionId: techFile.id,
            analysisId: techFile.id,
            imageUrl: '', // Empty URL for failed generation
            thumbnailUrl: undefined,
            shotName: shot.shot_name,
            analysisData: {
              category: "close_up",
              shot_name: shot.shot_name,
              confidence_score: 0,
              error: error instanceof Error ? error.message : 'Generation failed',
            } as any,
          });
        } catch (dbError) {
          console.error('Failed to save error closeup to database:', dbError);
        }

        // Continue with other shots even if one fails
      }
    }

    return results;
  } catch (error) {
    console.error("Close-up generation failed:", error);
    throw error;
  }
}
