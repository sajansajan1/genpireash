/**
 * Technical Sketch Generation Function
 * Generates technical sketches with call-outs
 */

"use server";

import { getOpenAIClient } from "@/lib/ai";
import { getGeminiService } from "@/lib/ai/gemini";
import { uploadImage } from "@/lib/services/image-service";
import { createClient } from "@/lib/supabase/server";
import { TECHNICAL_SKETCH_GENERATION_PROMPT } from "../prompts/sketches/generate-technical-sketch.prompt";
import { CALLOUT_GENERATION_PROMPT } from "../prompts/sketches/generate-callouts.prompt";
import { SKETCH_SUMMARY_GENERATION_PROMPT } from "../prompts/sketches/generate-sketch-summary.prompt";
import { AI_MODELS_CONFIG } from "../config/models.config";
import type { CallOutData } from "../types/tech-pack.types";
import { calculateBase64Hash } from "../utils/image-hash";
import { createTechFile } from "../tech-files-service";

/**
 * Generate technical sketch prompt for a specific view
 * @param productCategory Product category
 * @param productAnalysis Product analysis data
 * @param viewType View type (front, back, side)
 * @returns Sketch generation prompt
 */
async function generateSketchPrompt(
  productCategory: string,
  productAnalysis: string,
  viewType: "front" | "back" | "side"
): Promise<any> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: TECHNICAL_SKETCH_GENERATION_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: TECHNICAL_SKETCH_GENERATION_PROMPT.userPromptTemplate(
          productCategory,
          productAnalysis,
          viewType
        ),
      },
    ],
    max_tokens: 2048,
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No sketch prompt generated");
  }

  return JSON.parse(content);
}

/**
 * Generate call-outs for a technical sketch
 * @param productCategory Product category
 * @param viewType View type
 * @param sketchImageUrl URL of the generated sketch
 * @param detailedAnalysis Detailed product analysis
 * @returns Call-out data
 */
async function generateCallOuts(
  productCategory: string,
  viewType: string,
  sketchImageUrl: string,
  detailedAnalysis: string
): Promise<CallOutData> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: CALLOUT_GENERATION_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: CALLOUT_GENERATION_PROMPT.userPromptTemplate(
          productCategory,
          viewType,
          sketchImageUrl,
          detailedAnalysis
        ),
      },
    ],
    max_tokens: 3072,
    temperature: 0.6,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No call-outs generated");
  }

  return JSON.parse(content) as CallOutData;
}

/**
 * Generate comprehensive sketch summary
 * @param viewType View type
 * @param productCategory Product category
 * @param callouts Generated callouts
 * @param productAnalysis Full product analysis
 * @param approvedDimensions Optional approved dimensions to enforce
 * @returns Sketch summary guide
 */
async function generateSketchSummary(
  viewType: string,
  productCategory: string,
  callouts: CallOutData,
  productAnalysis: string,
  approvedDimensions?: any
): Promise<any> {
  const openai = getOpenAIClient();

  // Build mandatory dimensions instruction if approved dimensions exist
  let dimensionsInstruction = "";
  if (approvedDimensions) {
    const dims = approvedDimensions.user || approvedDimensions.recommended;
    if (dims) {
      const dimList: string[] = [];
      if (dims.width) dimList.push(`Overall Width: ${dims.width.value} ${dims.width.unit} ±1 ${dims.width.unit}`);
      if (dims.height) dimList.push(`Overall Height: ${dims.height.value} ${dims.height.unit} ±1 ${dims.height.unit}`);
      if (dims.length) dimList.push(`Depth: ${dims.length.value} ${dims.length.unit} ±1 ${dims.length.unit}`);
      if (dims.weight) dimList.push(`Weight: ${dims.weight.value} ${dims.weight.unit}`);

      if (dims.additionalDimensions && Array.isArray(dims.additionalDimensions)) {
        dims.additionalDimensions.forEach((dim: any) => {
          if (dim.name && dim.value && dim.unit) {
            dimList.push(`${dim.name}: ${dim.value} ${dim.unit} ±2 ${dim.unit}`);
          }
        });
      }

      if (dimList.length > 0) {
        dimensionsInstruction = `\n\n⚠️ MANDATORY APPROVED DIMENSIONS - You MUST use these EXACT values in the measurements section:\n${dimList.join('\n')}\n\nThese are the user-approved manufacturing dimensions. Do NOT change or estimate different values.`;
      }
    }
  }

  const basePrompt = SKETCH_SUMMARY_GENERATION_PROMPT.userPromptTemplate(
    viewType,
    productCategory,
    callouts,
    productAnalysis
  );

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: SKETCH_SUMMARY_GENERATION_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: basePrompt + dimensionsInstruction,
      },
    ],
    max_tokens: 4096,
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No sketch summary generated");
  }

  return JSON.parse(content);
}

/**
 * Generate technical sketches with call-outs
 * @param productId Product ID
 * @param productCategory Product category
 * @param productAnalysis Full product analysis data (should include base view data with image URLs)
 * @param userId User ID
 * @param views Views to generate (default: front, back, side)
 * @returns Array of generated sketches with call-outs
 */
export async function generateTechnicalSketches(
  productId: string,
  productCategory: string,
  productAnalysis: any,
  userId: string,
  views: Array<"front" | "back" | "side"> = ["front", "back", "side"]
): Promise<
  Array<{
    revisionId: string;
    analysisId: string;
    viewType: "front" | "back" | "side";
    imageUrl: string;
    thumbnailUrl?: string;
    callouts: CallOutData;
    summary: any;
  }>
> {
  const supabase = await createClient();
  const gemini = getGeminiService();

  try {
    const batchId = `sketches-${Date.now()}`;
    const results = [];

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

      console.log(`[Sketch Generation] Using product dimensions context`);
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
        console.log(`[Sketch Generation] Using product materials context`);
      }
    }

    // Add dimensions and materials to product analysis for context
    const enrichedAnalysis = {
      ...productAnalysis,
      product_dimensions: dimensionsContext || undefined,
      product_materials: materialsContext || undefined,
    };
    const analysisSummary = JSON.stringify(enrichedAnalysis, null, 2);

    // Extract ALL reference image URLs and primary revision ID from base views
    const referenceImages: string[] = [];
    let primaryRevisionId: string | null = null;

    // Collect all base view images as references (front, back, side)
    if (productAnalysis.base_views && productAnalysis.base_views.length > 0) {
      const frontView = productAnalysis.base_views.find((v: any) => v.view_type === 'front');
      const backView = productAnalysis.base_views.find((v: any) => v.view_type === 'back');
      const sideView = productAnalysis.base_views.find((v: any) => v.view_type === 'side');

      // Add all available views as references for better accuracy
      if (frontView?.image_url) referenceImages.push(frontView.image_url);
      if (backView?.image_url) referenceImages.push(backView.image_url);
      if (sideView?.image_url) referenceImages.push(sideView.image_url);

      // Use front view's revision ID as primary (or first available)
      const primaryView = frontView || backView || sideView;
      primaryRevisionId = primaryView?.revision_id || null;

      console.log(`Found ${referenceImages.length} reference images for sketch generation`);
      console.log(`Primary revision ID: ${primaryRevisionId}`);
    }

    if (referenceImages.length === 0) {
      console.warn("No reference images found in product analysis. Sketches may not match the product design.");
    }

    // Generate each sketch
    for (const viewType of views) {
      try {
        console.log(`Generating ${viewType} technical sketch...`);

        // Step 1: Generate sketch prompt
        const sketchPromptData = await generateSketchPrompt(productCategory, analysisSummary, viewType);

        // Step 2: Build explicit dimensions instruction for the image
        let explicitDimensionsInstruction = "";
        if (productIdea?.product_dimensions) {
          const dims = productIdea.product_dimensions;
          const recommended = dims.user || dims.recommended;
          if (recommended) {
            const dimParts: string[] = [];
            if (recommended.width) dimParts.push(`Width: EXACTLY ${recommended.width.value} ${recommended.width.unit}`);
            if (recommended.height) dimParts.push(`Height: EXACTLY ${recommended.height.value} ${recommended.height.unit}`);
            if (recommended.length) dimParts.push(`Depth/Length: EXACTLY ${recommended.length.value} ${recommended.length.unit}`);
            if (recommended.weight) dimParts.push(`Weight: ${recommended.weight.value} ${recommended.weight.unit}`);

            if (recommended.additionalDimensions && Array.isArray(recommended.additionalDimensions)) {
              recommended.additionalDimensions.forEach((dim: any) => {
                if (dim.name && dim.value && dim.unit) {
                  dimParts.push(`${dim.name}: EXACTLY ${dim.value} ${dim.unit}`);
                }
              });
            }

            if (dimParts.length > 0) {
              explicitDimensionsInstruction = `\n\n⚠️ MANDATORY EXACT DIMENSIONS - These measurements MUST appear in the technical sketch:\n${dimParts.join('\n')}\n\nDO NOT approximate or change these values. These are the APPROVED manufacturing dimensions and MUST be shown exactly as specified on the dimension lines in the sketch.`;
            }
          }
        }

        // Step 3: Generate sketch image using Gemini with ALL reference images
        // Enhanced prompt to ensure consistency with all reference views AND exact dimensions
        let enhancedPrompt = sketchPromptData.sketch_prompt;

        // Add explicit dimensions instruction to the prompt
        if (explicitDimensionsInstruction) {
          enhancedPrompt += explicitDimensionsInstruction;
        }

        if (referenceImages.length > 0) {
          enhancedPrompt += `\n\nCRITICAL: Create a technical sketch that EXACTLY matches the product shown in the reference images. The sketch MUST show the ${viewType} view of THIS SPECIFIC PRODUCT with accurate colors, materials, patterns, and all design details. DO NOT create a generic product - match the reference images precisely.`;
        }

        // Use the primary reference image (front view first, then others as fallback)
        const primaryReferenceImage = referenceImages[0] || undefined;

        const generatedImage = await gemini.generateImage({
          prompt: enhancedPrompt,
          referenceImage: primaryReferenceImage,
          options: {
            retry: 3,
            enhancePrompt: false, // Use our custom prompt as-is
            fallbackEnabled: true,
            model: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL_PRO.name, // Use Pro model for higher quality technical sketches
          },
        });

        // Convert data URL to buffer
        const base64Data = generatedImage.url.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to storage
        const uploadResult = await uploadImage(buffer, {
          projectId: productId,
          preset: "highQuality", // Use high quality for technical sketches
          generateThumbnail: true,
        });

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error("Failed to upload sketch image");
        }

        console.log(`Sketch image uploaded successfully: ${uploadResult.url}`);

        // Step 3: Generate call-outs
        console.log(`Generating call-outs for ${viewType} sketch...`);
        const callouts = await generateCallOuts(
          productCategory,
          viewType,
          uploadResult.url,
          analysisSummary
        );

        // Step 4: Generate comprehensive sketch summary with approved dimensions
        console.log(`Generating summary guide for ${viewType} sketch...`);
        const sketchSummary = await generateSketchSummary(
          viewType,
          productCategory,
          callouts,
          analysisSummary,
          productIdea?.product_dimensions // Pass approved dimensions to enforce in guide
        );

        // Store analysis with call-outs in tech_files
        const imageHash = calculateBase64Hash(base64Data);

        const techFile = await createTechFile({
          product_idea_id: productId,
          user_id: userId,
          revision_id: primaryRevisionId, // Link to primary (front) view revision
          file_type: 'sketch',
          file_category: viewType, // Store view type (front, back, side) as category
          view_type: viewType,
          file_url: uploadResult.url,
          thumbnail_url: uploadResult.thumbnailUrl,
          file_format: 'png',
          analysis_data: {
            category: "technical_sketch",
            sketch_type: `${viewType}_technical`,
            ...callouts,
            sketch_prompt: sketchPromptData,
            summary: sketchSummary, // Add comprehensive sketch summary
          },
          metadata: {
            image_hash: imageHash,
          },
          generation_batch_id: batchId,
          ai_model_used: AI_MODELS_CONFIG.VISION_MODEL.name,
          generation_prompt: sketchPromptData.sketch_prompt,
          confidence_score: 0.9, // Technical sketches are high confidence
          status: 'completed',
          credits_used: 1, // Each sketch costs 1 credit
        });

        // Also store in legacy table for backwards compatibility
        await supabase
          .from("revision_vision_analysis")
          .insert({
            product_idea_id: productId,
            user_id: userId,
            revision_id: primaryRevisionId,
            view_type: viewType,
            image_url: uploadResult.url,
            image_hash: imageHash,
            batch_id: batchId,
            analysis_data: {
              category: "technical_sketch",
              sketch_type: `${viewType}_technical`,
              ...callouts,
              sketch_prompt: sketchPromptData,
              summary: sketchSummary,
            },
            model_used: AI_MODELS_CONFIG.VISION_MODEL.name,
            confidence_score: 0.9,
            status: "completed",
          });

        results.push({
          revisionId: techFile.id, // Use tech file ID as the identifier
          analysisId: techFile.id,
          viewType,
          imageUrl: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          callouts,
          summary: sketchSummary, // Include summary in return data
        });
      } catch (error) {
        console.error(`Failed to generate ${viewType} sketch:`, error);
        // Continue with other views even if one fails
      }
    }

    return results;
  } catch (error) {
    console.error("Sketch generation failed:", error);
    throw error;
  }
}
