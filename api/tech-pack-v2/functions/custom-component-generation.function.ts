/**
 * Custom Component Image Generation Function
 * Allows users to request generation of a specific component by description
 * Validates that the component exists in the product before generating
 * Costs 2 credits per image
 */

"use server";

import { getOpenAIClient } from "@/lib/ai";
import { getGeminiService } from "@/lib/ai/gemini";
import { uploadImage } from "@/lib/services/image-service";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { VALIDATE_CUSTOM_COMPONENT_PROMPT } from "../prompts/components/validate-custom-component.prompt";
import { COMPONENT_SUMMARY_GENERATION_PROMPT } from "../prompts/components/generate-component-summary.prompt";
import { AI_MODELS_CONFIG } from "../config/models.config";
import { calculateBase64Hash } from "../utils/image-hash";
import { createTechFile } from "../tech-files-service";
import { creditsManager } from "../utils/credits-manager";
import {
  CUSTOM_COMPONENT_CREDITS,
  type ComponentValidationResult,
  type CustomComponentResult,
} from "../types/custom-component.types";

/**
 * Validate if a component exists in the product
 */
async function validateComponent(
  userComponentDescription: string,
  productCategory: string,
  productAnalysis: string,
  productContext: string
): Promise<ComponentValidationResult> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: VALIDATE_CUSTOM_COMPONENT_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: VALIDATE_CUSTOM_COMPONENT_PROMPT.userPromptTemplate(
          userComponentDescription,
          productCategory,
          productAnalysis,
          productContext
        ),
      },
    ],
    max_tokens: 2048,
    temperature: 0.3, // Lower temperature for more consistent validation
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No validation response generated");
  }

  const result = JSON.parse(content);

  return {
    exists: result.exists,
    confidence: result.confidence,
    matchedComponent: result.matched_component
      ? {
          name: result.matched_component.name,
          type: result.matched_component.type,
          location: result.matched_component.location,
          description: result.matched_component.description,
        }
      : null,
    imageGenerationPrompt: result.image_generation_prompt,
    negativePrompt: result.negative_prompt,
    reason: result.reason,
    suggestions: result.suggestions || [],
  };
}

/**
 * Analyze a generated component image to create detailed guide
 */
async function analyzeComponentImage(
  productCategory: string,
  componentName: string,
  componentImageUrl: string,
  productAnalysis: any,
  approvedDimensions?: any
): Promise<any> {
  const openai = getOpenAIClient();

  // Build dimensions instruction if approved dimensions exist
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

  const basePrompt = COMPONENT_SUMMARY_GENERATION_PROMPT.userPromptTemplate(
    productCategory,
    componentName,
    componentImageUrl,
    productAnalysis
  );

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: COMPONENT_SUMMARY_GENERATION_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: basePrompt + dimensionsInstruction,
          },
          {
            type: "image_url",
            image_url: {
              url: componentImageUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 3072,
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No component analysis generated");
  }

  return JSON.parse(content);
}

/**
 * Generate a custom component image based on user description
 * @param productId Product ID
 * @param userComponentDescription User's description of the component they want
 * @param userId User ID
 * @returns Generation result with validation info and generated image
 */
export async function generateCustomComponentImage(
  productId: string,
  userComponentDescription: string,
  userId: string
): Promise<CustomComponentResult> {
  // Use service role client to bypass RLS for reading product data
  const supabase = await createServiceRoleClient();
  const gemini = getGeminiService();
  let reservationId: string | undefined;

  try {
    console.log(
      `[Custom Component] Starting for product ${productId}, component: "${userComponentDescription}"`
    );

    // Step 1: Fetch product data and base view analyses
    console.log("[Custom Component] Fetching product data...");
    const { data: productIdea, error: productError } = await supabase
      .from("product_ideas")
      .select("prompt, product_dimensions, product_materials, tech_pack")
      .eq("id", productId)
      .single();

    console.log("[Custom Component] Product fetch result:", {
      hasProductIdea: !!productIdea,
      productError: productError?.message,
      hasPrompt: !!productIdea?.prompt,
    });

    if (productError || !productIdea) {
      console.error("[Custom Component] Product not found:", productError);
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Fetch base view analyses for this product (latest revision)
    console.log("[Custom Component] Fetching tech files...");
    const { data: techFiles, error: techFilesError } = await supabase
      .from("tech_files")
      .select("*")
      .eq("product_idea_id", productId)
      .eq("file_type", "base_view")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(3); // Get latest front, back, side views

    console.log("[Custom Component] Tech files fetch result:", {
      count: techFiles?.length ?? 0,
      techFilesError: techFilesError?.message,
    });

    if (techFilesError || !techFiles || techFiles.length === 0) {
      console.error("[Custom Component] No tech files found:", techFilesError);
      return {
        success: false,
        error: "No product analysis found. Please generate base views first.",
      };
    }

    // Get the revision ID from the first tech file
    const revisionId = techFiles[0]?.revision_id || null;

    // Build product analysis string from tech files
    const productAnalysis = techFiles.map((file) => ({
      view_type: file.view_type,
      image_url: file.file_url,
      analysis: file.analysis_data,
    }));

    const productAnalysisString = JSON.stringify(productAnalysis, null, 2);

    // Build product context from prompt and tech_pack
    let productContext = "";
    if (productIdea.prompt) {
      productContext += `Original Request: ${productIdea.prompt}\n`;
    }

    // Try to get category from tech_pack if available
    let productCategory = "general";
    if (productIdea.tech_pack?.category) {
      productCategory = productIdea.tech_pack.category;
    }

    // Add product name from tech_pack if available
    if (productIdea.tech_pack?.product_name) {
      productContext += `Product Name: ${productIdea.tech_pack.product_name}\n`;
    }
    if (productIdea.tech_pack?.description) {
      productContext += `Product Description: ${productIdea.tech_pack.description}\n`;
    }

    // Add materials context
    if (productIdea.product_materials) {
      const mats = productIdea.product_materials;
      const materials = mats.user || mats.recommended;
      if (materials && Array.isArray(materials) && materials.length > 0) {
        productContext += `\nProduct Materials:\n`;
        materials.forEach((mat: any, idx: number) => {
          productContext += `${idx + 1}. ${mat.component}: ${mat.material}`;
          if (mat.specification) productContext += ` - ${mat.specification}`;
          if (mat.color) productContext += ` (${mat.color})`;
          productContext += `\n`;
        });
      }
    }

    // Step 2: Validate if the component exists in the product
    console.log("[Custom Component] Validating component existence...");
    console.log("[Custom Component] Product category:", productCategory);
    console.log("[Custom Component] Product context:", productContext);
    console.log("[Custom Component] Tech files count:", techFiles.length);
    console.log("[Custom Component] Product analysis string length:", productAnalysisString.length);

    const validation = await validateComponent(
      userComponentDescription,
      productCategory,
      productAnalysisString,
      productContext
    );

    console.log("[Custom Component] Validation result:", {
      exists: validation.exists,
      confidence: validation.confidence,
      component: validation.matchedComponent?.name,
      reason: validation.reason,
      suggestions: validation.suggestions,
    });

    // If component doesn't exist, return validation result without generating
    if (!validation.exists) {
      return {
        success: false,
        error: `Component not found: ${validation.reason}`,
        validation,
      };
    }

    // Step 3: Reserve credits (2 credits per custom component)
    console.log(`[Custom Component] Reserving ${CUSTOM_COMPONENT_CREDITS} credits...`);
    const reservation = await creditsManager.reserveCredits(CUSTOM_COMPONENT_CREDITS);

    if (!reservation.success) {
      return {
        success: false,
        error: reservation.message || `Insufficient credits. You need ${CUSTOM_COMPONENT_CREDITS} credits for this operation.`,
        validation,
      };
    }

    reservationId = reservation.reservationId;
    console.log(`[Custom Component] Credits reserved. Reservation ID: ${reservationId}`);

    // Step 4: Generate the component image
    console.log(`[Custom Component] Generating image for: ${validation.matchedComponent!.name}`);

    // Get primary reference image (front view)
    const primaryReferenceImage = techFiles.find(f => f.view_type === "front")?.file_url
      || techFiles[0]?.file_url;

    // Build dimensions instruction for image generation
    let explicitDimensionsInstruction = "";
    if (productIdea.product_dimensions) {
      const dims = productIdea.product_dimensions;
      const recommended = dims.user || dims.recommended;
      if (recommended) {
        const dimParts: string[] = [];
        if (recommended.width) dimParts.push(`Product Width: ${recommended.width.value} ${recommended.width.unit}`);
        if (recommended.height) dimParts.push(`Product Height: ${recommended.height.value} ${recommended.height.unit}`);
        if (recommended.length) dimParts.push(`Product Depth: ${recommended.length.value} ${recommended.length.unit}`);

        if (dimParts.length > 0) {
          explicitDimensionsInstruction = `\n\nPRODUCT DIMENSIONS (for scale reference):\n${dimParts.join('\n')}`;
        }
      }
    }

    // Generate component image using Gemini
    const enhancedPrompt = `${validation.imageGenerationPrompt}${explicitDimensionsInstruction}\n\nSTYLE: Professional product photography, isolated component view, clean white background, high detail, factory documentation quality. This component is from the product shown in the reference image.\n\nAVOID: ${validation.negativePrompt || "blurry, low quality, distorted, watermark, text, cluttered background"}`;

    const generatedImage = await gemini.generateImage({
      prompt: enhancedPrompt,
      referenceImage: primaryReferenceImage,
      options: {
        retry: 3,
        enhancePrompt: false,
        fallbackEnabled: true,
        model: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL.name,
      },
    });

    // Convert data URL to buffer
    const base64Data = generatedImage.url.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to storage
    const uploadResult = await uploadImage(buffer, {
      projectId: productId,
      preset: "highQuality",
      generateThumbnail: true,
    });

    if (!uploadResult.success || !uploadResult.url) {
      // Refund credits on upload failure
      if (reservationId) {
        await creditsManager.refundReservedCredits(
          CUSTOM_COMPONENT_CREDITS,
          reservationId,
          "Image upload failed"
        );
      }
      return {
        success: false,
        error: "Failed to upload component image",
        validation,
      };
    }

    console.log(`[Custom Component] Image uploaded: ${uploadResult.url}`);

    // Step 5: Analyze the generated component image
    console.log("[Custom Component] Analyzing generated component...");
    const componentGuide = await analyzeComponentImage(
      productCategory,
      validation.matchedComponent!.name,
      uploadResult.url,
      {
        base_views: productAnalysis,
        product_context: productContext,
      },
      productIdea.product_dimensions
    );

    // Step 6: Store in tech_files
    const imageHash = calculateBase64Hash(base64Data);
    const batchId = `custom-component-${Date.now()}`;

    const techFile = await createTechFile({
      product_idea_id: productId,
      user_id: userId,
      revision_id: revisionId,
      file_type: "component",
      file_category: validation.matchedComponent!.type,
      view_type: null,
      file_url: uploadResult.url,
      thumbnail_url: uploadResult.thumbnailUrl,
      file_format: "png",
      analysis_data: {
        category: "custom_component_image",
        user_request: userComponentDescription,
        validation_result: validation,
        component_guide: componentGuide,
        is_custom_request: true,
      },
      metadata: {
        image_hash: imageHash,
        component_name: validation.matchedComponent!.name,
        component_type: validation.matchedComponent!.type,
        user_description: userComponentDescription,
        custom_generated: true,
      },
      generation_batch_id: batchId,
      ai_model_used: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL.name,
      generation_prompt: validation.imageGenerationPrompt,
      confidence_score: validation.confidence,
      status: "completed",
      credits_used: CUSTOM_COMPONENT_CREDITS,
    });

    console.log(`[Custom Component] Successfully generated and stored. ID: ${techFile.id}`);

    return {
      success: true,
      validation,
      component: {
        analysisId: techFile.id,
        componentName: validation.matchedComponent!.name,
        componentType: validation.matchedComponent!.type,
        imageUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        guide: componentGuide,
      },
      creditsUsed: CUSTOM_COMPONENT_CREDITS,
    };
  } catch (error) {
    console.error("[Custom Component] Generation failed:", error);

    // Refund credits on failure
    if (reservationId) {
      console.log(`[Custom Component] Refunding ${CUSTOM_COMPONENT_CREDITS} credits due to failure`);
      await creditsManager.refundReservedCredits(
        CUSTOM_COMPONENT_CREDITS,
        reservationId,
        `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Component generation failed",
    };
  }
}
