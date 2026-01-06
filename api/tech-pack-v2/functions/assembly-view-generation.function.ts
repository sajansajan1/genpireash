/**
 * Assembly View (Exploded/Build View) Generation Function
 * Generates an exploded view showing how the product is built,
 * with components separated and assembly relationships visible
 */

"use server";

import { getOpenAIClient } from "@/lib/ai";
import { getGeminiService } from "@/lib/ai/gemini";
import { uploadImage } from "@/lib/services/image-service";
import { createClient } from "@/lib/supabase/server";
import { buildAssemblyViewPrompt } from "../prompts/assembly-view/generate-assembly-view.prompt";
import { ASSEMBLY_SUMMARY_GENERATION_PROMPT } from "../prompts/assembly-view/generate-assembly-summary.prompt";
import { AI_MODELS_CONFIG } from "../config/models.config";
import { calculateBase64Hash } from "../utils/image-hash";
import { createTechFile } from "../tech-files-service";

/**
 * Generate assembly summary/guide by analyzing the assembly view image using OpenAI Vision
 * @param assemblyViewImageUrl URL of the generated assembly view image
 * @param productCategory Product category
 * @param productDescription Product description
 * @param components Component names
 * @param productAnalysis Full product analysis
 * @returns Assembly summary guide based on image analysis
 */
async function generateAssemblySummary(
  assemblyViewImageUrl: string,
  productCategory: string,
  productDescription: string,
  components: string[],
  productAnalysis: string
): Promise<any> {
  const openai = getOpenAIClient();

  console.log(`[Assembly View] Analyzing assembly view image to generate guide...`);

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: ASSEMBLY_SUMMARY_GENERATION_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: assemblyViewImageUrl,
              detail: "high",
            },
          },
          {
            type: "text",
            text: ASSEMBLY_SUMMARY_GENERATION_PROMPT.userPromptTemplate(
              productCategory,
              productDescription,
              components,
              productAnalysis
            ),
          },
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No assembly summary generated");
  }

  return JSON.parse(content);
}

/**
 * Generate assembly/exploded view for a product
 * @param productId Product ID
 * @param productCategory Product category
 * @param productAnalysis Full product analysis data
 * @param userId User ID
 * @param components Optional list of component names
 * @returns Generated assembly view data
 */
export async function generateAssemblyView(
  productId: string,
  productCategory: string,
  productAnalysis: any,
  userId: string,
  components?: string[]
): Promise<{
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  description?: string;
  summary?: any;
}> {
  const supabase = await createClient();
  const gemini = getGeminiService();

  try {
    const batchId = `assembly-view-${Date.now()}`;

    console.log(`[Assembly View] Starting generation for product ${productId}`);

    // Extract reference images and revision ID from base views
    let primaryReferenceImage: string | undefined;
    let primaryRevisionId: string | null = null;

    if (productAnalysis.base_views && productAnalysis.base_views.length > 0) {
      // Prefer front view as the primary reference
      const frontView = productAnalysis.base_views.find((v: any) => v.view_type === "front");
      const anyView = productAnalysis.base_views[0];

      const primaryView = frontView || anyView;
      primaryReferenceImage = primaryView?.image_url;
      primaryRevisionId = primaryView?.revision_id || null;

      console.log(`[Assembly View] Using reference image from ${primaryView?.view_type || "unknown"} view`);
    }

    // Extract base view analyses for more context
    const baseViewAnalysis = productAnalysis.base_views?.map((v: any) => ({
      view_type: v.view_type,
      analysis: v.analysis || v.analysis_data,
    }));

    // Build product description for the prompt
    const productDescription = buildProductDescription(productAnalysis);

    // Build the assembly view prompt
    const imagePrompt = buildAssemblyViewPrompt({
      productCategory,
      productDescription,
      components,
      baseViewAnalysis,
    });

    console.log(`[Assembly View] Generating exploded view image...`);

    // Generate the assembly view image using Gemini Pro for higher quality
    const generatedImage = await gemini.generateImage({
      prompt: imagePrompt,
      referenceImage: primaryReferenceImage,
      options: {
        retry: 5, // Increased retries for Pro model
        enhancePrompt: false,
        fallbackEnabled: true,
        model: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL_PRO.name,
      },
    });

    // Convert data URL to buffer
    const base64Data = generatedImage.url.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to storage
    const uploadResult = await uploadImage(buffer, {
      projectId: productId,
      preset: "highQuality",
      generateThumbnail: true,
    });

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error("Failed to upload assembly view image");
    }

    console.log(`[Assembly View] Image uploaded: ${uploadResult.url}`);

    // Calculate image hash
    const imageHash = calculateBase64Hash(base64Data);

    // Extract component names for summary generation
    const componentNames: string[] = [];
    if (components && components.length > 0) {
      componentNames.push(...components);
    } else if (productAnalysis.components && productAnalysis.components.length > 0) {
      productAnalysis.components.forEach((c: any) => {
        const name = c.componentName || c.name;
        if (name) componentNames.push(name);
      });
    }

    // Generate assembly summary/guide by analyzing the generated image
    console.log(`[Assembly View] Generating assembly summary guide by analyzing the image...`);
    let assemblySummary = null;
    try {
      assemblySummary = await generateAssemblySummary(
        uploadResult.url, // Pass the generated assembly view image URL
        productCategory,
        productDescription,
        componentNames,
        JSON.stringify(productAnalysis, null, 2)
      );
      console.log(`[Assembly View] Assembly summary generated successfully from image analysis`);
    } catch (summaryError) {
      console.error("[Assembly View] Summary generation failed, continuing without summary:", summaryError);
    }

    // Store in tech_files table
    const techFile = await createTechFile({
      product_idea_id: productId,
      user_id: userId,
      revision_id: primaryRevisionId,
      file_type: "assembly_view",
      file_category: "exploded",
      view_type: null, // Assembly view doesn't have a specific view type
      file_url: uploadResult.url,
      thumbnail_url: uploadResult.thumbnailUrl,
      file_format: "png",
      analysis_data: {
        category: "assembly_view",
        view_style: "exploded",
        components_shown: componentNames,
        summary: assemblySummary, // Add assembly summary/guide
      },
      metadata: {
        image_hash: imageHash,
        product_category: productCategory,
      },
      generation_batch_id: batchId,
      ai_model_used: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL_PRO.name,
      generation_prompt: imagePrompt,
      confidence_score: 0.9,
      status: "completed",
      credits_used: 0, // Credits tracked at API route level
    });

    console.log(`[Assembly View] Successfully generated assembly view`);

    return {
      id: techFile.id,
      imageUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      description: assemblySummary?.overview || "Exploded assembly view showing component relationships and build order",
      summary: assemblySummary,
    };
  } catch (error) {
    console.error("[Assembly View] Generation failed:", error);
    throw error;
  }
}

/**
 * Build a description of the product from analysis data
 */
function buildProductDescription(productAnalysis: any): string {
  const parts: string[] = [];

  // Add basic product info
  if (productAnalysis.product_name) {
    parts.push(`Product: ${productAnalysis.product_name}`);
  }

  // Add materials info
  if (productAnalysis.materials_detected && productAnalysis.materials_detected.length > 0) {
    const materials = productAnalysis.materials_detected
      .map((m: any) => m.material_type || m.name)
      .filter(Boolean)
      .join(", ");
    if (materials) {
      parts.push(`Materials: ${materials}`);
    }
  }

  // Add construction details from base views
  if (productAnalysis.base_views && productAnalysis.base_views.length > 0) {
    const frontView = productAnalysis.base_views.find((v: any) => v.view_type === "front");
    if (frontView?.analysis || frontView?.analysis_data) {
      const analysis = frontView.analysis || frontView.analysis_data;

      // Add key features
      if (analysis.key_features && Array.isArray(analysis.key_features)) {
        parts.push(`Features: ${analysis.key_features.slice(0, 5).join(", ")}`);
      }

      // Add construction notes
      if (analysis.construction_notes) {
        parts.push(`Construction: ${analysis.construction_notes}`);
      }
    }
  }

  // Add component info if available
  if (productAnalysis.components && productAnalysis.components.length > 0) {
    const componentNames = productAnalysis.components
      .map((c: any) => c.componentName || c.name)
      .filter(Boolean)
      .slice(0, 8)
      .join(", ");
    if (componentNames) {
      parts.push(`Components: ${componentNames}`);
    }
  }

  return parts.join("\n");
}
