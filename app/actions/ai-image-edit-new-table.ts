"use server";

import { createClient } from "@/lib/supabase/server";
import { aiLogger } from "@/lib/logging/ai-logger";
import { GeminiImageService } from "@/lib/ai/gemini";
import OpenAI from "openai";
import { safeUpload } from "@/lib/services/image-service";
import { saveImageUpload } from "./image-uploads";
import {
  normalizeImageUrl,
  isDataUrl,
  convertDataUrlToBuffer,
} from "@/lib/utils/image-urls";

const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Helper function to convert URL to base64 with retry logic
async function urlToBase64DataUrl(
  url: string,
  maxRetries: number = 3,
  onStatus?: (message: string) => void
): Promise<string> {
  try {
    if (url.startsWith("data:")) {
      return url;
    }

    // Handle placeholder images
    if (url === "/placeholder.svg" || url.includes("placeholder")) {
      console.log("Skipping placeholder image");
      return "";
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Attempting to fetch image (attempt ${attempt}/${maxRetries}): ${url}`
        );
        onStatus?.(`Fetching image (attempt ${attempt}/${maxRetries})...`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "image/*",
          },
        });

        clearTimeout(timeout);

        if (!response.ok) {
          // More detailed error information
          const statusText = response.statusText || "Unknown error";
          console.error(
            `HTTP ${response.status} ${statusText} for URL: ${url}`
          );

          // 400 often means the URL is malformed or the resource doesn't exist
          if (response.status === 400) {
            throw new Error(
              `Bad request - the image URL may be invalid or the resource doesn't exist: ${url}`
            );
          } else if (response.status === 404) {
            throw new Error(`Image not found at URL: ${url}`);
          } else if (response.status === 403) {
            throw new Error(`Access denied to image: ${url}`);
          } else {
            throw new Error(
              `Failed to fetch image: HTTP ${response.status} ${statusText}`
            );
          }
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const contentType = response.headers.get("content-type") || "image/png";

        console.log(
          `Successfully converted image to base64 (${buffer.byteLength} bytes)`
        );
        onStatus?.(
          `Image loaded successfully (${Math.round(buffer.byteLength / 1024)}KB)`
        );

        return `data:${contentType};base64,${base64}`;
      } catch (error: any) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);

        // If it's a 400 error, don't retry - the URL is bad
        if (
          error.message.includes("Bad request") ||
          error.message.includes("invalid")
        ) {
          console.error("URL appears to be invalid, not retrying:", url);
          break;
        }

        if (attempt < maxRetries) {
          onStatus?.(`Retrying image fetch in ${attempt} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    throw lastError || new Error("Failed to fetch image after retries");
  } catch (error: any) {
    console.error("Error converting URL to base64:", error.message);
    // Return empty string instead of throwing to allow process to continue
    // This prevents the entire edit operation from failing if one image is problematic
    console.warn("Returning empty string for problematic image URL:", url);
    return "";
  }
}

export interface MultiViewEditParams {
  productId: string;
  currentViews: {
    front: string;
    back: string;
    side: string;
    top?: string;
    bottom?: string;
  };
  editPrompt: string;
  productName?: string;
  productDescription?: string;
  onProgress?: (
    view: "front" | "back" | "side" | "top" | "bottom",
    imageUrl: string
  ) => void;
}

export interface MultiViewEditResponse {
  success: boolean;
  views?: {
    front: string;
    back: string;
    side: string;
    top?: string;
    bottom?: string;
  };
  revisionIds?: string[];
  error?: string;
}

/**
 * Analyze product and enhance edit prompt
 */
export async function analyzeAndEnhancePrompt({
  currentViews,
  editPrompt,
  productName = "Product",
  productId,
  batchId,
}: {
  currentViews: {
    front: string;
    back: string;
    side: string;
  };
  editPrompt: string;
  productName?: string;
  productId?: string;
  batchId?: string;
}): Promise<{
  success: boolean;
  analysis?: string;
  enhancedPrompt?: string;
  error?: string;
}> {
  try {
    // Step 1: Convert images to base64 to avoid timeout issues
    console.log("Converting images to base64...");
    let frontBase64: string = "";
    let backBase64: string = "";
    let sideBase64: string = "";

    // Try to fetch each image independently, don't fail if one fails
    const imagePromises = [
      urlToBase64DataUrl(currentViews.front).catch((err) => {
        console.warn("Failed to fetch front image:", err.message);
        return "";
      }),
      urlToBase64DataUrl(currentViews.back).catch((err) => {
        console.warn("Failed to fetch back image:", err.message);
        return "";
      }),
      urlToBase64DataUrl(currentViews.side).catch((err) => {
        console.warn("Failed to fetch side image:", err.message);
        return "";
      }),
    ];

    [frontBase64, backBase64, sideBase64] = await Promise.all(imagePromises);

    // Check if we have at least one valid image
    if (!frontBase64 && !backBase64 && !sideBase64) {
      console.error("Failed to fetch any images");
      // Instead of failing completely, return a basic enhanced prompt without image analysis
      return {
        success: true,
        analysis:
          "Unable to analyze images due to loading issues. Proceeding with text-based enhancement.",
        enhancedPrompt: `Apply the following edit to all views of the ${productName}: ${editPrompt}. Ensure consistency across front, back, and side views.`,
      };
    }

    // Step 2: Analyze current images using OpenAI GPT-4 Vision
    console.log("Analyzing current product images with GPT-4 Vision...");

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional product designer analyzing a product to help apply edits consistently across all views.
          Provide a detailed analysis of the product's current state.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${productName} product shown in three views and describe:
              1. Product type and characteristics
              2. Current design elements (colors, materials, textures)
              3. Key features in each view
              4. Style and quality
              
              This will be used to apply: "${editPrompt}"`,
            },
            // Only include images that were successfully loaded
            ...(frontBase64
              ? [
                  {
                    type: "image_url" as const,
                    image_url: { url: frontBase64, detail: "high" as const },
                  },
                ]
              : []),
            ...(backBase64
              ? [
                  {
                    type: "image_url" as const,
                    image_url: { url: backBase64, detail: "high" as const },
                  },
                ]
              : []),
            ...(sideBase64
              ? [
                  {
                    type: "image_url" as const,
                    image_url: { url: sideBase64, detail: "high" as const },
                  },
                ]
              : []),
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const productAnalysis = analysisResponse.choices[0]?.message?.content || "";
    console.log("Product analysis complete");

    // Send analysis complete update if productId and batchId are provided
    if (productId && batchId) {
      const { saveChatMessage } = await import("./ai-chat-messages");
      const { generateDynamicMessage } = await import(
        "./ai-chat-dynamic-messages"
      );

      const message = await generateDynamicMessage({
        messageType: "processing",
        productName,
        editPrompt,
        progress: 50,
      });

      await saveChatMessage({
        productIdeaId: productId,
        messageType: "processing",
        content: message,
        metadata: { step: "prompt_enhancement", progress: 50 },
        batchId,
      }).catch(console.error);
    }

    // Step 2: Enhance the user's edit prompt
    console.log("Enhancing edit prompt with GPT-4...");

    const enhancementResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a prompt engineering expert. Create precise prompts for consistent product edits.`,
        },
        {
          role: "user",
          content: `Based on this analysis: "${productAnalysis}"
          
          User wants: "${editPrompt}"
          
          Create a specific prompt that:
          1. Applies changes accurately
          2. Maintains product identity
          3. Ensures view consistency
          
          Enhanced prompt:`,
        },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const enhancedPrompt =
      enhancementResponse.choices[0]?.message?.content || editPrompt;
    console.log("Enhanced prompt ready");

    return {
      success: true,
      analysis: productAnalysis,
      enhancedPrompt,
    };
  } catch (error: any) {
    console.error("Error analyzing product:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze product",
    };
  }
}

/**
 * Generate a single view with AI edits
 */
export async function generateSingleView({
  productId,
  viewType,
  currentImage,
  referenceImage,
  editPrompt,
  productName = "Product",
  productAnalysis,
  finalPrompt,
  batchId,
  saveRevision = true,
}: {
  productId: string;
  viewType: "front" | "back" | "side";
  currentImage: string;
  referenceImage?: string;
  editPrompt: string;
  productName?: string;
  productAnalysis?: string;
  finalPrompt?: string;
  batchId?: string;
  saveRevision?: boolean;
}): Promise<{
  success: boolean;
  imageUrl?: string;
  revisionId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const timestamp = Date.now();
    const geminiService = new GeminiImageService();

    // Generate the prompt based on view type
    let viewPrompt = "";
    if (viewType === "front") {
      viewPrompt = `${productName} - FRONT VIEW: ${
        finalPrompt || editPrompt
      }. Professional product photo, white background, high detail, studio lighting.`;
    } else if (viewType === "back") {
      viewPrompt = `${productName} - BACK VIEW: ${
        finalPrompt || editPrompt
      }. This is the back view of the product. Match the style, colors, and design of the front view exactly. Professional product photo, white background, high detail.`;
    } else {
      viewPrompt = `${productName} - SIDE/PROFILE VIEW: ${
        finalPrompt || editPrompt
      }. This is the side profile view of the product. Match the style, colors, and design of the front view exactly. Show the product from a 90-degree angle. Professional product photo, white background, high detail.`;
    }

    console.log(`Generating ${viewType} view...`);

    // Use reference image if provided, otherwise use current image
    const referenceForGeneration =
      referenceImage || (await urlToBase64DataUrl(currentImage));

    let result;
    try {
      result = await geminiService.generateImage({
        prompt: viewPrompt,
        referenceImage: referenceForGeneration,
        options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
      });
    } catch (geminiError: any) {
      console.error(`Gemini API error for ${viewType}:`, geminiError);
      throw new Error(
        `Gemini API failed for ${viewType}: ${geminiError.message || "Unknown error"}`
      );
    }

    if (!result.url) {
      console.error(`Gemini generation failed for ${viewType}:`, result);
      throw new Error(`Failed to generate ${viewType} view: No URL returned`);
    }

    // Optimize and upload using centralized service
    const fileName = `${productId}/${viewType}_edit_${timestamp}.png`;

    const uploadResult = await safeUpload(result.url, {
      fileName,
      preset: "standard",
      generateWebP: true,
      generateThumbnail: false,
      maxRetries: 3,
    });

    const imageUrl = uploadResult.success ? uploadResult.url : null;

    if (!imageUrl) {
      throw new Error(`Failed to upload ${viewType} image`);
    }

    console.log(`${viewType} view generated and uploaded successfully`);

    // Save image upload record to images_uploads table
    try {
      await saveImageUpload({
        productIdeaId: productId,
        imageUrl: imageUrl,
        thumbnailUrl: uploadResult.thumbnailUrl || null,
        uploadType: "edited",
        viewType: viewType as "front" | "back" | "side" | "top" | "bottom",
        fileName: fileName,
        fileSize: uploadResult.metadata?.size,
        mimeType: uploadResult.metadata?.format
          ? `image/${uploadResult.metadata.format}`
          : "image/png",
        width: uploadResult.metadata?.width,
        height: uploadResult.metadata?.height,
        metadata: {
          editPrompt,
          productName,
          batchId,
          generatedBy: "gemini-2.5-flash",
          webpUrl: uploadResult.webpUrl,
        },
      });
      console.log(`Image upload record saved for ${viewType}`);
    } catch (uploadDbError) {
      console.error(
        `Error saving image upload record for ${viewType}:`,
        uploadDbError
      );
      // Continue even if database save fails
    }

    // Save revision to database if requested
    let revisionId: string | undefined;
    if (saveRevision) {
      try {
        // Get existing revisions to determine next revision number
        const { data: existingRevisions, error: queryError } = await supabase
          .from("product_multiview_revisions")
          .select("revision_number")
          .eq("product_idea_id", productId)
          .eq("view_type", viewType)
          .order("revision_number", { ascending: false })
          .limit(1);

        if (queryError) {
          console.error(
            `Error querying revisions for ${viewType}:`,
            queryError
          );
        }

        const nextRevisionNumber =
          existingRevisions && existingRevisions.length > 0
            ? existingRevisions[0].revision_number + 1
            : 1;

        console.log(
          `Saving ${viewType} revision ${nextRevisionNumber} to database...`
        );

        // Deactivate previous active revision for this view
        await supabase
          .from("product_multiview_revisions")
          .update({ is_active: false })
          .eq("product_idea_id", productId)
          .eq("view_type", viewType)
          .eq("is_active", true);

        // Save new revision
        const revisionData = {
          product_idea_id: productId,
          user_id: user.id,
          revision_number: nextRevisionNumber,
          batch_id: batchId || `single-${timestamp}`,
          view_type: viewType,
          image_url: imageUrl || "",
          thumbnail_url: null,
          edit_prompt: editPrompt,
          edit_type: "ai_edit" as const,
          ai_model: "gemini-2.5-flash-image-preview",
          ai_parameters: {
            analysisPrompt: productAnalysis?.substring(0, 500),
            enhancedPrompt: finalPrompt?.substring(0, 500),
            originalPrompt: editPrompt,
            viewType,
          },
          generation_time_ms: Date.now() - timestamp,
          is_active: true,
          metadata: {
            productName,
            originalImage: currentImage,
            referenceImage,
          },
        };

        const { data: revision, error: dbError } = await supabase
          .from("product_multiview_revisions")
          .insert(revisionData)
          .select()
          .single();

        if (dbError) {
          console.error(`Error saving ${viewType} revision:`, dbError);
        } else if (revision) {
          console.log(`✓ Saved ${viewType} revision: ${revision.id}`);
          revisionId = revision.id;
        }
      } catch (error) {
        console.error(`Error saving revision for ${viewType}:`, error);
        // Don't fail the whole operation if revision saving fails
      }
    }

    return {
      success: true,
      imageUrl: imageUrl || "",
      revisionId,
    };
  } catch (error: any) {
    console.error(`Error generating ${viewType} view:`, error);
    return {
      success: false,
      error: error.message || `Failed to generate ${viewType} view`,
    };
  }
}

/**
 * Apply AI edits to all product views using the new table
 */
export async function applyMultiViewEdit({
  productId,
  currentViews,
  editPrompt,
  productName = "Product",
  productDescription = "",
}: MultiViewEditParams): Promise<MultiViewEditResponse> {
  const logger = aiLogger.startOperation(
    "applyMultiViewEdit",
    "gemini-2.5-flash-image-preview",
    "gemini",
    "image_generation"
  );

  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const timestamp = Date.now();
    const batchId = `batch-${timestamp}`;

    // Log input
    logger.setInput({
      prompt: editPrompt,
      metadata: {
        productId,
        productName,
        batchId,
      },
    });

    logger.setContext({
      user_id: user.id,
      feature: "ai_multiview_editor",
    });

    console.log("Applying multi-view edit:", editPrompt);
    console.log("Product ID:", productId);
    console.log("Batch ID:", batchId);

    // Step 1: Analyze current images using OpenAI GPT-4 Vision
    console.log("Analyzing current product images with GPT-4 Vision...");

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional product designer analyzing a product to help apply edits consistently across all views.
          Provide a detailed analysis of the product's current state.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${productName} product shown in three views and describe:
              1. Product type and characteristics
              2. Current design elements (colors, materials, textures)
              3. Key features in each view
              4. Style and quality
              
              This will be used to apply: "${editPrompt}"`,
            },
            {
              type: "image_url",
              image_url: { url: currentViews.front, detail: "high" },
            },
            {
              type: "image_url",
              image_url: { url: currentViews.back, detail: "high" },
            },
            {
              type: "image_url",
              image_url: { url: currentViews.side, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const productAnalysis = analysisResponse.choices[0]?.message?.content || "";
    console.log("Product analysis complete");

    // Send analysis complete update if productId and batchId are provided
    if (productId && batchId) {
      const { saveChatMessage } = await import("./ai-chat-messages");
      const { generateDynamicMessage } = await import(
        "./ai-chat-dynamic-messages"
      );

      const message = await generateDynamicMessage({
        messageType: "processing",
        productName,
        editPrompt,
        progress: 50,
      });

      await saveChatMessage({
        productIdeaId: productId,
        messageType: "processing",
        content: message,
        metadata: { step: "prompt_enhancement", progress: 50 },
        batchId,
      }).catch(console.error);
    }

    // Step 2: Enhance the user's edit prompt
    console.log("Enhancing edit prompt with GPT-4...");

    const enhancementResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a prompt engineering expert. Create precise prompts for consistent product edits.`,
        },
        {
          role: "user",
          content: `Based on this analysis: "${productAnalysis}"
          
          User wants: "${editPrompt}"
          
          Create a specific prompt that:
          1. Applies changes accurately
          2. Maintains product identity
          3. Ensures view consistency
          
          Enhanced prompt:`,
        },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const finalPrompt =
      enhancementResponse.choices[0]?.message?.content || editPrompt;
    console.log("Enhanced prompt ready");

    // Step 3: Generate views using Gemini with proper URL handling
    console.log("Generating new views with AI...");

    // Initialize Gemini service
    const geminiService = new GeminiImageService();

    // Convert current view URLs to base64 if needed
    const frontBase64 = await urlToBase64DataUrl(currentViews.front);

    // Generate FRONT view first
    const frontPrompt = `${productName} - FRONT VIEW: ${finalPrompt}. Professional product photo, white background, high detail, studio lighting.`;
    console.log("Generating front view...");
    const frontResult = await geminiService.generateImage({
      prompt: frontPrompt,
      referenceImage: frontBase64,
      options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
    });

    if (!frontResult.url) {
      throw new Error("Failed to generate front view");
    }

    // Generate BACK view based on the new FRONT
    const backPrompt = `${productName} - BACK VIEW: ${finalPrompt}. This is the back view of the product. Match the style, colors, and design of the front view exactly. Professional product photo, white background, high detail.`;
    console.log("Generating back view based on front...");
    const backResult = await geminiService.generateImage({
      prompt: backPrompt,
      referenceImage: frontResult.url, // Use the newly generated front as reference
      options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
    });

    if (!backResult.url) {
      throw new Error("Failed to generate back view");
    }

    // Generate SIDE view based on the new FRONT
    const sidePrompt = `${productName} - SIDE/PROFILE VIEW: ${finalPrompt}. This is the side profile view of the product. Match the style, colors, and design of the front view exactly. Show the product from a 90-degree angle. Professional product photo, white background, high detail.`;
    console.log("Generating side view based on front...");
    const sideResult = await geminiService.generateImage({
      prompt: sidePrompt,
      referenceImage: frontResult.url, // Use the newly generated front as reference
      options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
    });

    if (!sideResult.url) {
      throw new Error("Failed to generate side view");
    }

    // Generate TOP view based on the new FRONT
    const topPrompt = `${productName} - Generate the TOP/OVERHEAD VIEW of this exact product shown in the reference image.

CRITICAL REQUIREMENTS:
- Generate ONLY the TOP VIEW of the product
- This must be a SINGLE IMAGE showing ONLY the overhead perspective
- This MUST be the exact SAME product as in the reference image
- Maintain IDENTICAL colors, materials, and proportions from the reference
- Pure white background (#FFFFFF)
- Professional studio lighting

CONSISTENCY RULES:
- Colors must match EXACTLY the reference image
- All design elements must be identical
- Materials and textures must be consistent

Modified as requested: ${finalPrompt}

PROHIBITED:
- Do NOT change any colors from the reference
- Do NOT add elements not in the reference
- Do NOT alter proportions`;

    console.log("Generating top view based on front...");
    const topResult = await geminiService.generateImage({
      prompt: topPrompt,
      referenceImage: frontResult.url, // Use the newly generated front as reference
      view: "top",
      style: "photorealistic",
      options: { enhancePrompt: false, fallbackEnabled: true, retry: 5 }, // More retries for consistency
    });

    if (!topResult.url) {
      console.error("Failed to generate top view");
      // Don't throw error, allow other views to continue
    }

    // Generate BOTTOM view based on the new FRONT
    const bottomPrompt = `${productName} - Generate the BOTTOM/UNDERSIDE VIEW of this exact product shown in the reference image.

CRITICAL REQUIREMENTS:
- Generate ONLY the BOTTOM VIEW of the product
- This must be a SINGLE IMAGE showing ONLY the underside perspective
- This MUST be the exact SAME product as in the reference image
- Maintain IDENTICAL colors, materials, and proportions from the reference
- Pure white background (#FFFFFF)
- Professional studio lighting

CONSISTENCY RULES:
- Colors must match EXACTLY the reference image
- All design elements must be identical
- Materials and textures must be consistent

Modified as requested: ${finalPrompt}

PROHIBITED:
- Do NOT change any colors from the reference
- Do NOT add elements not in the reference
- Do NOT alter proportions`;

    console.log("Generating bottom view based on front...");
    const bottomResult = await geminiService.generateImage({
      prompt: bottomPrompt,
      referenceImage: frontResult.url, // Use the newly generated front as reference
      view: "bottom",
      style: "photorealistic",
      options: { enhancePrompt: false, fallbackEnabled: true, retry: 5 }, // More retries for consistency
    });

    if (!bottomResult.url) {
      console.error("Failed to generate bottom view");
      // Don't throw error, allow other views to continue
    }

    console.log("All views generated successfully");

    // Using centralized image service for optimization

    // Step 4: Upload and save each view
    const views = [
      { type: "front", result: frontResult, prompt: frontPrompt },
      { type: "back", result: backResult, prompt: backPrompt },
      { type: "side", result: sideResult, prompt: sidePrompt },
      ...(topResult?.url
        ? [{ type: "top", result: topResult, prompt: topPrompt }]
        : []),
      ...(bottomResult?.url
        ? [{ type: "bottom", result: bottomResult, prompt: bottomPrompt }]
        : []),
    ];

    const revisionIds: string[] = [];
    const resultViews: any = {};

    for (const view of views) {
      console.log(`Processing ${view.type} view...`);

      // Optimize and upload images using centralized service
      console.log(`Uploading optimized ${view.type} images...`);
      const uploadResult = await safeUpload(view.result.url, {
        projectId: productId,
        preset: "standard",
        generateWebP: true,
        generateThumbnail: true,
        maxRetries: 3,
      });

      const imageUrl = uploadResult.success ? uploadResult.url : null;
      const thumbnailUrl = uploadResult.thumbnailUrl;

      if (!imageUrl) {
        console.error(`Failed to upload ${view.type} image`);
        continue;
      }

      resultViews[view.type] = imageUrl;

      // Save image upload record to images_uploads table
      try {
        await saveImageUpload({
          productIdeaId: productId,
          imageUrl: imageUrl,
          thumbnailUrl: thumbnailUrl || null,
          uploadType: "edited",
          viewType: view.type as "front" | "back" | "side" | "top" | "bottom",
          fileName: imageUrl.split("/").pop() || "image.png",
          fileSize: uploadResult.metadata?.size,
          mimeType: uploadResult.metadata?.format
            ? `image/${uploadResult.metadata.format}`
            : "image/png",
          width: uploadResult.metadata?.width,
          height: uploadResult.metadata?.height,
          metadata: {
            editPrompt,
            productName,
            batchId,
            generatedBy: "gemini-2.5-flash",
            webpUrl: uploadResult.webpUrl,
          },
        });
        console.log(`Image upload record saved for ${view.type}`);
      } catch (uploadDbError) {
        console.error(
          `Error saving image upload record for ${view.type}:`,
          uploadDbError
        );
        // Continue even if database save fails
      }

      // Get the highest revision number for this view
      const { data: existingRevisions, error: queryError } = await supabase
        .from("product_multiview_revisions")
        .select("revision_number")
        .eq("product_idea_id", productId)
        .eq("view_type", view.type)
        .order("revision_number", { ascending: false })
        .limit(1);

      if (queryError) {
        console.error(`Error querying revisions for ${view.type}:`, queryError);
      }

      const nextRevisionNumber =
        existingRevisions && existingRevisions.length > 0
          ? existingRevisions[0].revision_number + 1
          : 1;

      console.log(
        `Next revision number for ${view.type}: ${nextRevisionNumber}`
      );

      // Deactivate previous active revision for this view
      const { error: deactivateError } = await supabase
        .from("product_multiview_revisions")
        .update({ is_active: false })
        .eq("product_idea_id", productId)
        .eq("view_type", view.type)
        .eq("is_active", true);

      if (deactivateError) {
        console.warn(
          `Error deactivating previous ${view.type} revision:`,
          deactivateError
        );
      }

      // Save new revision
      const revisionData = {
        product_idea_id: productId,
        user_id: user.id,
        revision_number: nextRevisionNumber,
        batch_id: batchId,
        view_type: view.type,
        image_url: imageUrl || "",
        thumbnail_url: thumbnailUrl || null,
        edit_prompt: editPrompt,
        edit_type: "ai_edit" as const,
        ai_model: "gemini-2.5-flash-image-preview",
        ai_parameters: {
          batchId,
          analysisPrompt: productAnalysis.substring(0, 500),
          enhancedPrompt: finalPrompt.substring(0, 500),
          originalPrompt: editPrompt,
          viewPrompt: view.prompt,
          generationOrder:
            view.type === "front" ? 1 : view.type === "back" ? 2 : 3,
        },
        generation_time_ms: Date.now() - timestamp,
        is_active: true,
        metadata: {
          productName,
          productDescription,
          batchEdit: true,
          originalImage: (currentViews as any)[view.type],
        },
      };

      console.log(`Saving ${view.type} revision to database...`);
      const { data: revision, error: dbError } = await supabase
        .from("product_multiview_revisions")
        .insert(revisionData)
        .select()
        .single();

      if (dbError) {
        console.error(`Error saving ${view.type} revision:`, dbError);
        console.error(`Full error details:`, {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
        });
      } else if (revision) {
        console.log(`✓ Saved ${view.type} revision: ${revision.id}`);
        revisionIds.push(revision.id);
      }
    }

    console.log(`Edit complete! Created ${revisionIds.length} revisions`);

    // Log success
    logger.setOutput({
      content: `Successfully edited all views with batch ${batchId}`,
      raw_response: {
        revisionIds,
        views: resultViews,
        batchId,
      },
    });

    await logger.complete();

    return {
      success: true,
      views: resultViews,
      revisionIds,
    };
  } catch (error: any) {
    console.error("Multi-view edit error:", error);
    logger.setError(error);
    await logger.complete();

    return {
      success: false,
      error: error.message || "Failed to apply multi-view edit",
    };
  }
}

/**
 * Soft delete a revision or revision batch
 */
export async function deleteRevision(
  revisionId: string,
  batchId?: string,
  productId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const updateData = {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
      is_active: false, // Deactivate if it was active
    };

    // Check if revisionId is actually a batchId
    // Batch IDs can have various formats:
    // - "batch-xxx" or "single-xxx" (legacy)
    // - "revision_N_timestamp" (from progressive workflow)
    // - "initial_productId_timestamp" (initial generation)
    const isBatchId =
      revisionId.startsWith("batch-") ||
      revisionId.startsWith("single-") ||
      revisionId.startsWith("revision_") ||
      revisionId.startsWith("initial_");

    if (isBatchId || batchId) {
      // Delete all revisions in the batch
      const batchIdToUse = batchId || revisionId;
      const { error } = await supabase
        .from("product_multiview_revisions")
        .update(updateData)
        .eq("batch_id", batchIdToUse);

      if (error) throw error;
      console.log(`Soft deleted batch: ${batchIdToUse}`);
    } else {
      // Delete single revision (only if revisionId is a valid UUID)
      const { error } = await supabase
        .from("product_multiview_revisions")
        .update(updateData)
        .eq("id", revisionId);

      if (error) throw error;
      console.log(`Soft deleted revision: ${revisionId}`);
    }

    // Invalidate cache for this product
    if (productId && typeof window !== "undefined") {
      const { revisionsCache } = await import("@/lib/cache/revisions-cache");
      revisionsCache.invalidate(productId);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting revision:", error);
    return {
      success: false,
      error: error.message || "Failed to delete revision",
    };
  }
}

/**
 * Get grouped multi-view revisions from the new table
 * Cached for 30 seconds to improve performance
 */
export async function getGroupedMultiViewRevisions(
  productId: string,
  skipCache: boolean = false
) {
  try {
    // Check cache first (only on client side)
    if (!skipCache && typeof window !== "undefined") {
      const { revisionsCache } = await import("@/lib/cache/revisions-cache");
      const cached = revisionsCache.get(productId);
      if (cached) {
        if (process.env.NODE_ENV === "development") {
          console.log("📦 Using cached revisions for product", productId);
        }
        return cached;
      }
    }

    const supabase = await createClient();

    // Get all non-deleted revisions for this product
    // Only select fields we actually need to reduce data transfer
    const { data, error } = await supabase
      .from("product_multiview_revisions")
      .select(
        "id, batch_id, product_idea_id, view_type, thumbnail_url, image_url, revision_number, is_active, edit_prompt, edit_type, created_at, metadata, ai_parameters"
      )
      .eq("product_idea_id", productId)
      .or("is_deleted.is.null,is_deleted.eq.false") // Only get non-deleted revisions
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching revisions:", error);
      throw error;
    }

    // Reduce console logging in production
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔍 Fetched ${data?.length || 0} revisions from database for product ${productId}`
      );
    }

    // Group by batchId or create individual entries
    const grouped: any[] = [];
    const batches = new Map();

    data?.forEach((rev) => {
      const batchId = rev.batch_id || `single-${rev.id}`;

      if (!batches.has(batchId)) {
        batches.set(batchId, {
          id: batchId,
          revisionNumber: rev.revision_number,
          views: {},
          editPrompt: rev.edit_prompt,
          editType: rev.edit_type,
          createdAt: rev.created_at,
          isActive: false,
          metadata: rev.metadata,
          aiParameters: rev.ai_parameters,
        });
      }

      const batch = batches.get(batchId);
      batch.views[rev.view_type] = {
        imageUrl: rev.image_url,
        thumbnailUrl: rev.thumbnail_url,
        revisionId: rev.id,
      };

      // Update revision number to highest in batch
      if (rev.revision_number > batch.revisionNumber) {
        batch.revisionNumber = rev.revision_number;
      }

      if (rev.is_active) {
        batch.isActive = true;
      }
    });

    // Convert to array and sort
    batches.forEach((batch) => {
      grouped.push(batch);
    });

    grouped.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Ensure only the latest revision is marked as active
    grouped.forEach((revision, index) => {
      revision.isActive = index === 0; // Only the first (most recent) revision should be active
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Grouped into ${grouped.length} revision sets`);
    }

    const result = {
      success: true,
      revisions: grouped,
    };

    // Cache the result (only on client side)
    if (typeof window !== "undefined") {
      const { revisionsCache } = await import("@/lib/cache/revisions-cache");
      revisionsCache.set(productId, result);
    }

    return result;
  } catch (error: any) {
    console.error("Error fetching grouped revisions:", error);
    return {
      success: false,
      error: error.message,
      revisions: [],
    };
  }
}

/**
 * Save initial generated images as revision 0
 */
export async function saveInitialRevisions(
  productId: string,
  images: Record<string, { url: string }>
) {
  console.log("saveInitialRevisions called with:", {
    productId,
    imageKeys: Object.keys(images),
    images: Object.entries(images).map(([k, v]) => ({
      view: k,
      hasUrl: !!v.url,
    })),
  });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if initial revisions already exist
    const { data: existingRevisions } = await supabase
      .from("product_multiview_revisions")
      .select("view_type")
      .eq("product_idea_id", productId)
      .eq("revision_number", 0)
      .eq("edit_type", "generated");

    const existingViewTypes = new Set(
      existingRevisions?.map((r) => r.view_type) || []
    );

    const batchId = `initial-${Date.now()}`;
    const revisions = [];

    for (const [viewType, image] of Object.entries(images)) {
      // Skip if this view type already has an initial revision
      if (existingViewTypes.has(viewType)) {
        console.log(
          `Initial revision for ${viewType} already exists, skipping`
        );
        continue;
      }

      console.log(
        `Processing ${viewType} view: URL length = ${image?.url?.length || 0}, URL preview = ${image?.url?.substring(
          0,
          100
        )}`
      );

      if (image?.url) {
        // First, deactivate any existing active revisions for this view
        await supabase
          .from("product_multiview_revisions")
          .update({ is_active: false })
          .eq("product_idea_id", productId)
          .eq("view_type", viewType)
          .eq("is_active", true);

        // Save to images_uploads table
        try {
          // Extract file name from URL
          const urlParts = image.url.split("/");
          const fileName =
            urlParts[urlParts.length - 1] ||
            `${viewType}-initial-${Date.now()}.png`;

          await saveImageUpload({
            productIdeaId: productId,
            imageUrl: image.url,
            thumbnailUrl: image.url, // Use same URL for initial
            uploadType: "original", // Changed from 'generated' to 'original'
            viewType: viewType as "front" | "back" | "side" | "top" | "bottom",
            fileName: fileName,
            metadata: {
              batchId,
              revisionNumber: 0,
              isOriginal: true,
              generated: true,
              source: "ai-designer-initial",
            },
          });
          console.log(`Saved ${viewType} initial image to images_uploads`);
        } catch (uploadError) {
          console.error(
            `Failed to save ${viewType} to images_uploads:`,
            uploadError
          );
          // Continue even if images_uploads fails
        }

        revisions.push({
          product_idea_id: productId,
          user_id: user.id,
          revision_number: 0,
          batch_id: batchId,
          view_type: viewType,
          image_url: image.url,
          thumbnail_url: image.url, // Use same URL for initial
          edit_type: "generated",
          edit_prompt: "Original AI-generated image",
          is_active: true,
          ai_model: "gemini-2.5-flash-image-preview",
          metadata: {
            isOriginal: true,
            generated: true,
          },
        });
      }
    }

    if (revisions.length > 0) {
      const { error } = await supabase
        .from("product_multiview_revisions")
        .insert(revisions);

      if (error) {
        console.error("Error saving initial revisions:", error);
        // Don't throw if it's a duplicate key error, just log it
        if (error.code !== "23505") {
          throw error;
        }
      } else {
        console.log(
          `Saved ${revisions.length} initial revisions:`,
          revisions.map((r) => ({ view: r.view_type, hasUrl: !!r.image_url }))
        );
      }
    } else {
      console.log(
        "No new revisions to save - all views already have initial revisions"
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error saving initial revisions:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Set active revision for a product
 * Deactivates all other revisions and activates the specified batch
 */
export async function setActiveRevision(productId: string, batchId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    console.log(`[SetActiveRevision] Setting active revision for product ${productId}, batch: ${batchId}`);

    // Step 1: Deactivate all revisions for this product
    const { error: deactivateError } = await supabase
      .from("product_multiview_revisions")
      .update({ is_active: false })
      .eq("product_idea_id", productId)
      .eq("user_id", user.id);

    if (deactivateError) {
      console.error("[SetActiveRevision] Error deactivating revisions:", deactivateError);
      return { success: false, error: deactivateError.message };
    }

    // Step 2: Activate all views in the specified batch
    const { error: activateError } = await supabase
      .from("product_multiview_revisions")
      .update({ is_active: true })
      .eq("product_idea_id", productId)
      .eq("batch_id", batchId)
      .eq("user_id", user.id);

    if (activateError) {
      console.error("[SetActiveRevision] Error activating revision:", activateError);
      return { success: false, error: activateError.message };
    }

    console.log(`[SetActiveRevision] Successfully set active revision to batch: ${batchId}`);

    return { success: true };
  } catch (error: any) {
    console.error("[SetActiveRevision] Unexpected error:", error);
    return { success: false, error: error.message };
  }
}
