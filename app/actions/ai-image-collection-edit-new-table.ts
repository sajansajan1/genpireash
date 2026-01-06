"use server";

import { createClient } from "@/lib/supabase/server";
import { aiLogger } from "@/lib/logging/ai-logger";
import { GeminiImageService } from "@/lib/ai/gemini";
import OpenAI from "openai";
import {
  imageService,
  safeUpload,
  IMAGE_PRESETS,
} from "@/lib/services/image-service";
import { saveCollectionImageUpload } from "./collection-image-uploads";

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
          throw new Error(`Failed to fetch image: ${response.status}`);
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
        console.log(`Attempt ${attempt} failed to fetch image:`, error.message);

        if (attempt < maxRetries) {
          onStatus?.(`Retrying image fetch in ${attempt} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    throw lastError || new Error("Failed to fetch image after retries");
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    throw error;
  }
}

export interface MultiViewEditParams {
  productId: string;
  collectionId: string;
  currentViews: {
    front: string;
    back: string;
    side: string;
  };
  editPrompt: string;
  productName?: string;
  productDescription?: string;
  onProgress?: (view: "front" | "back" | "side", imageUrl: string) => void;
}

export interface MultiViewEditResponse {
  success: boolean;
  views?: {
    front: string;
    back: string;
    side: string;
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
  collectionId,
}: {
  currentViews: {
    front: string;
    back: string;
    side: string;
  };
  editPrompt: string;
  productName?: string;
  productId?: string;
  collectionId?: string;
  batchId?: string;
}): Promise<{
  success: boolean;
  analysis?: string;
  enhancedPrompt?: string;
  error?: string;
}> {
  console.log(
    "running analyzeAndEnhancePrompt >>>>>>>>>>>>>",
    productId,
    collectionId
  );
  try {
    // Step 1: Convert images to base64 to avoid timeout issues
    console.log("Converting images to base64...");
    let frontBase64: string, backBase64: string, sideBase64: string;

    try {
      [frontBase64, backBase64, sideBase64] = await Promise.all([
        urlToBase64DataUrl(currentViews.front),
        urlToBase64DataUrl(currentViews.back),
        urlToBase64DataUrl(currentViews.side),
      ]);
    } catch (fetchError: any) {
      console.error("Failed to fetch images:", fetchError);
      return {
        success: false,
        error: `Failed to download images: ${fetchError.message}. Please try again or check your internet connection.`,
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
            {
              type: "image_url",
              image_url: { url: frontBase64, detail: "high" },
            },
            {
              type: "image_url",
              image_url: { url: backBase64, detail: "high" },
            },
            {
              type: "image_url",
              image_url: { url: sideBase64, detail: "high" },
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
      const { saveChatMessage } = await import("./ai-collection-chat-messages");
      const { generateDynamicMessage } = await import(
        "./ai-chat-dynamic-messages"
      );

      const message = await generateDynamicMessage({
        messageType: "processing",
        productName,
        editPrompt,
        progress: 50,
      });
      if (!collectionId) {
        throw new Error("collectionId is required but undefined");
      }
      console.log("save caht message1", productId, collectionId);
      await saveChatMessage({
        productIdeaId: productId,
        collectionId,
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
  collectionId,
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
  collectionId: string;
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
  console.log("running generateSingleView >>>>>>>>>>>>>");
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
      await saveCollectionImageUpload({
        productIdeaId: productId,
        collectionId: collectionId,
        imageUrl: imageUrl,
        thumbnailUrl: uploadResult.thumbnailUrl || null,
        uploadType: "edited",
        viewType: viewType as "front" | "back" | "side",
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
          .from("collections_multiview_revisions")
          .select("revision_number")
          .eq("product_id", productId)
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
          .from("collections_multiview_revisions")
          .update({ is_active: false })
          .eq("product_id", productId)
          .eq("view_type", viewType)
          .eq("is_active", true);

        // Save new revision
        const revisionData = {
          product_id: productId,
          collection_id: collectionId,
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
        console.log(revisionData, "revieewsions");
        const { data: revision, error: dbError } = await supabase
          .from("collections_multiview_revisions")
          .insert(revisionData)
          .select()
          .single();

        if (dbError) {
          console.error(
            `Error saving collection1 ${viewType} revision:`,
            dbError
          );
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
  collectionId,
  currentViews,
  editPrompt,
  productName = "Product",
  productDescription = "",
}: MultiViewEditParams): Promise<MultiViewEditResponse> {
  console.log("running applyMultiViewEdit >>>>>>>>>>>>>");
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
      const { saveChatMessage } = await import("./ai-collection-chat-messages");
      const { generateDynamicMessage } = await import(
        "./ai-chat-dynamic-messages"
      );

      const message = await generateDynamicMessage({
        messageType: "processing",
        productName,
        editPrompt,
        progress: 50,
      });
      console.log("save caht message2", productId, collectionId);
      await saveChatMessage({
        productIdeaId: productId,
        messageType: "processing",
        content: message,
        metadata: { step: "prompt_enhancement", progress: 50 },
        batchId,
        collectionId,
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

    console.log("All views generated successfully");

    // Using centralized image service for optimization

    // Step 4: Upload and save each view
    const views = [
      { type: "front", result: frontResult, prompt: frontPrompt },
      { type: "back", result: backResult, prompt: backPrompt },
      { type: "side", result: sideResult, prompt: sidePrompt },
    ];

    const revisionIds: string[] = [];
    const resultViews: any = {};

    for (const view of views) {
      console.log(`Processing ${view.type} view...`);

      // Optimize and upload images using centralized service
      const fileName = `${productId}/${view.type}_edit_${timestamp}.png`;

      console.log(`Uploading optimized ${view.type} images...`);
      const uploadResult = await safeUpload(view.result.url, {
        fileName,
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
        await saveCollectionImageUpload({
          productIdeaId: productId,
          collectionId: collectionId,
          imageUrl: imageUrl,
          thumbnailUrl: thumbnailUrl || null,
          uploadType: "edited",
          viewType: view.type as "front" | "back" | "side",
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
        .from("collections_multiview_revisions")
        .select("revision_number")
        .eq("product_id", productId)
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
        .from("collections_multiview_revisions")
        .update({ is_active: false })
        .eq("product_id", productId)
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
        product_id: productId,
        collection_id: collectionId,
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
        .from("collections_multiview_revisions")
        .insert(revisionData)
        .select()
        .single();

      if (dbError) {
        console.error(
          `Error saving collection2 ${view.type} revision:`,
          dbError
        );
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
  batchId?: string
): Promise<{ success: boolean; error?: string }> {
  console.log("running deleteRevision >>>>>>>>>>>>>");
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
        .from("collections_multiview_revisions")
        .update(updateData)
        .eq("batch_id", batchIdToUse);

      if (error) throw error;
      console.log(`Soft deleted batch: ${batchIdToUse}`);
    } else {
      // Delete single revision (only if revisionId is a valid UUID)
      const { error } = await supabase
        .from("collections_multiview_revisions")
        .update(updateData)
        .eq("id", revisionId);

      if (error) throw error;
      console.log(`Soft deleted revision: ${revisionId}`);
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
 */
export async function getCollectionGroupedMultiViewRevisions(
  productId: string
) {
  console.log("running getGroupedMultiViewRevisions >>>>>>>>>>>>>");
  try {
    const supabase = await createClient();

    // Get all non-deleted revisions for this product
    const { data, error } = await supabase
      .from("collections_multiview_revisions")
      .select("*")
      .eq("product_id", productId)
      .or("is_deleted.is.null,is_deleted.eq.false") // Only get non-deleted revisions
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching revisions:", error);
      throw error;
    }

    console.log(
      `Found ${data?.length || 0} revisions for product ${productId}`
    );

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

    console.log(`Grouped into ${grouped.length} revision sets`);

    return {
      success: true,
      revisions: grouped,
    };
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
  console.log("running saveInitialRevisions >>>>>>>>>>>>>");
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const batchId = `initial-${Date.now()}`;
    const revisions = [];

    for (const [viewType, image] of Object.entries(images)) {
      if (image?.url) {
        revisions.push({
          collection_id: productId,
          // product_id: productId,
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
        .from("collections_multiview_revisions")
        .insert(revisions);

      if (error) {
        console.error("Error saving initial revisions:", error);
        throw error;
      }

      console.log(`Saved ${revisions.length} initial revisions`);
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
