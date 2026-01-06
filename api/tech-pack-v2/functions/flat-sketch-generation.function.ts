/**
 * Flat Sketch Generation Function
 * Generates clean black and white vector-style flat sketches
 * showing trimming, lining, stitches, and pattern details
 */

"use server";

import { getGeminiService } from "@/lib/ai/gemini";
import { uploadImage } from "@/lib/services/image-service";
import { createClient } from "@/lib/supabase/server";
import { FLAT_SKETCH_GENERATION_PROMPT } from "../prompts/flat-sketches/generate-flat-sketch.prompt";
import { AI_MODELS_CONFIG } from "../config/models.config";
import { calculateBase64Hash } from "../utils/image-hash";
import { createTechFile } from "../tech-files-service";

/**
 * Generate flat sketches for all views
 * @param productId Product ID
 * @param productCategory Product category
 * @param productAnalysis Full product analysis data
 * @param userId User ID
 * @param views Views to generate (default: front, back, side)
 * @returns Array of generated flat sketches
 */
export async function generateFlatSketches(
  productId: string,
  productCategory: string,
  productAnalysis: any,
  userId: string,
  views: Array<"front" | "back" | "side"> = ["front", "back", "side"]
): Promise<
  Array<{
    id: string;
    viewType: "front" | "back" | "side";
    imageUrl: string;
    thumbnailUrl?: string;
  }>
> {
  const supabase = await createClient();
  const gemini = getGeminiService();

  try {
    const batchId = `flat-sketches-${Date.now()}`;
    const results: Array<{
      id: string;
      viewType: "front" | "back" | "side";
      imageUrl: string;
      thumbnailUrl?: string;
    }> = [];

    // Extract reference image URLs from base views
    const referenceImages: string[] = [];
    let primaryRevisionId: string | null = null;

    if (productAnalysis.base_views && productAnalysis.base_views.length > 0) {
      const frontView = productAnalysis.base_views.find((v: any) => v.view_type === "front");
      const backView = productAnalysis.base_views.find((v: any) => v.view_type === "back");
      const sideView = productAnalysis.base_views.find((v: any) => v.view_type === "side");

      if (frontView?.image_url) referenceImages.push(frontView.image_url);
      if (backView?.image_url) referenceImages.push(backView.image_url);
      if (sideView?.image_url) referenceImages.push(sideView.image_url);

      const primaryView = frontView || backView || sideView;
      primaryRevisionId = primaryView?.revision_id || null;

      console.log(`[Flat Sketch] Found ${referenceImages.length} reference images`);
    }

    // Build product description from analysis
    const productDescription = buildProductDescription(productAnalysis);

    // Generate all flat sketches in parallel for efficiency
    const generatePromises = views.map(async (viewType) => {
      try {
        console.log(`[Flat Sketch] Generating ${viewType} flat sketch...`);

        // Build the image generation prompt
        const basePrompt = FLAT_SKETCH_GENERATION_PROMPT.imagePromptTemplate(
          productCategory,
          viewType,
          productDescription
        );

        // Get reference image for this specific view
        const viewReferenceImage = getReferenceImageForView(productAnalysis, viewType);

        // Add strong consistency reinforcement when reference image is available
        let imagePrompt = basePrompt;
        if (viewReferenceImage) {
          imagePrompt += `\n\n🎯 REFERENCE IMAGE MATCHING: The reference image shows the EXACT product that must be converted to a flat sketch. Study the reference carefully and replicate ALL design elements, proportions, and details precisely. The flat sketch must be an exact technical representation of this specific product - not a generic interpretation.`;
        }

        // Generate image using Gemini Flash (cost-effective for simpler output)
        const generatedImage = await gemini.generateImage({
          prompt: imagePrompt,
          referenceImage: viewReferenceImage,
          options: {
            retry: 3,
            enhancePrompt: false,
            fallbackEnabled: true,
            model: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL.name, // Use Flash model for cost efficiency
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
          throw new Error(`Failed to upload ${viewType} flat sketch image`);
        }

        console.log(`[Flat Sketch] ${viewType} image uploaded: ${uploadResult.url}`);

        // Calculate image hash
        const imageHash = calculateBase64Hash(base64Data);

        // Store in tech_files table
        const techFile = await createTechFile({
          product_idea_id: productId,
          user_id: userId,
          revision_id: primaryRevisionId,
          file_type: "flat_sketch",
          file_category: viewType,
          view_type: viewType,
          file_url: uploadResult.url,
          thumbnail_url: uploadResult.thumbnailUrl,
          file_format: "png",
          analysis_data: {
            category: "flat_sketch",
            sketch_type: `${viewType}_flat`,
          },
          metadata: {
            image_hash: imageHash,
          },
          generation_batch_id: batchId,
          ai_model_used: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL.name,
          generation_prompt: imagePrompt,
          confidence_score: 0.9,
          status: "completed",
          credits_used: 0, // Credits tracked at API route level
        });

        return {
          id: techFile.id,
          viewType,
          imageUrl: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
        };
      } catch (error) {
        console.error(`[Flat Sketch] Failed to generate ${viewType} flat sketch:`, error);
        throw error;
      }
    });

    // Wait for all generations to complete
    const generatedSketches = await Promise.all(generatePromises);
    results.push(...generatedSketches);

    console.log(`[Flat Sketch] Successfully generated ${results.length} flat sketches`);
    return results;
  } catch (error) {
    console.error("[Flat Sketch] Generation failed:", error);
    throw error;
  }
}

/**
 * Build a detailed description of the product from analysis data for flat sketch consistency
 */
function buildProductDescription(productAnalysis: any): string {
  const parts: string[] = [];

  // Add basic product info
  if (productAnalysis.product_name) {
    parts.push(`Product Name: ${productAnalysis.product_name}`);
  }

  // Add materials info with more detail
  if (productAnalysis.materials_detected && productAnalysis.materials_detected.length > 0) {
    const materials = productAnalysis.materials_detected
      .map((m: any) => {
        let materialStr = m.material_type || m.name;
        if (m.component) materialStr += ` (${m.component})`;
        return materialStr;
      })
      .filter(Boolean)
      .join(", ");
    if (materials) {
      parts.push(`Materials: ${materials}`);
    }
  }

  // Add construction details from ALL base views for comprehensive understanding
  if (productAnalysis.base_views && productAnalysis.base_views.length > 0) {
    const constructionDetails: string[] = [];
    const features: string[] = [];

    productAnalysis.base_views.forEach((view: any) => {
      const analysis = view.analysis_data || view.analysis;
      if (!analysis) return;

      // Collect key features
      if (analysis.key_features && Array.isArray(analysis.key_features)) {
        analysis.key_features.forEach((f: string) => {
          if (!features.includes(f)) features.push(f);
        });
      }

      // Collect construction details
      if (analysis.construction_details) {
        const cd = analysis.construction_details;
        if (cd.seam_types && Array.isArray(cd.seam_types)) {
          constructionDetails.push(`Seams: ${cd.seam_types.join(", ")}`);
        }
        if (cd.closure_types && Array.isArray(cd.closure_types)) {
          constructionDetails.push(`Closures: ${cd.closure_types.join(", ")}`);
        }
        if (cd.stitching_details) {
          constructionDetails.push(`Stitching: ${cd.stitching_details}`);
        }
      }

      // Add specific details
      if (analysis.collar_type) {
        constructionDetails.push(`Collar: ${analysis.collar_type}`);
      }
      if (analysis.sleeve_type) {
        constructionDetails.push(`Sleeves: ${analysis.sleeve_type}`);
      }
      if (analysis.neckline) {
        constructionDetails.push(`Neckline: ${analysis.neckline}`);
      }
      if (analysis.hem_type) {
        constructionDetails.push(`Hem: ${analysis.hem_type}`);
      }
    });

    if (features.length > 0) {
      parts.push(`Design Features: ${features.slice(0, 8).join(", ")}`);
    }

    if (constructionDetails.length > 0) {
      // Remove duplicates
      const uniqueDetails = [...new Set(constructionDetails)];
      parts.push(`Construction Details: ${uniqueDetails.join("; ")}`);
    }
  }

  // Add component info for detailed understanding
  if (productAnalysis.components && productAnalysis.components.length > 0) {
    const componentNames = productAnalysis.components
      .map((c: any) => c.componentName || c.name)
      .filter(Boolean)
      .slice(0, 10)
      .join(", ");
    if (componentNames) {
      parts.push(`Components: ${componentNames}`);
    }
  }

  // Add style/silhouette info
  if (productAnalysis.style || productAnalysis.silhouette) {
    parts.push(`Style/Silhouette: ${productAnalysis.style || productAnalysis.silhouette}`);
  }

  return parts.join("\n");
}

/**
 * Get the reference image URL for a specific view type
 */
function getReferenceImageForView(
  productAnalysis: any,
  viewType: "front" | "back" | "side"
): string | undefined {
  if (!productAnalysis.base_views || productAnalysis.base_views.length === 0) {
    return undefined;
  }

  // Try to find exact view match
  const exactMatch = productAnalysis.base_views.find(
    (v: any) => v.view_type === viewType && v.image_url
  );
  if (exactMatch) {
    return exactMatch.image_url;
  }

  // Fallback to front view
  const frontView = productAnalysis.base_views.find(
    (v: any) => v.view_type === "front" && v.image_url
  );
  if (frontView) {
    return frontView.image_url;
  }

  // Fallback to any available view
  const anyView = productAnalysis.base_views.find((v: any) => v.image_url);
  return anyView?.image_url;
}
