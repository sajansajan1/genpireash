"use server";

import { GeminiImageService } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";
import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
import { aiLogger } from "@/lib/logging/ai-logger";
import OpenAI from "openai";

const geminiService = new GeminiImageService();
const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface MultiViewEditParams {
  productId: string;
  currentViews: {
    front: string;
    back: string;
    side: string;
  };
  editPrompt: string;
  productName?: string;
  productDescription?: string;
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
 * Apply AI edits to all product views at once - Compatible with existing DB structure
 */
export async function applyMultiViewEditCompat({
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
    const batchId = `batch-${timestamp}`; // Group revisions with batch ID

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
    console.log("User ID:", user.id);

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

    // Step 3: Generate all three views
    const viewPrompts = {
      front: `${productName} - FRONT VIEW: ${finalPrompt}. Professional product photo, white background, high detail.`,
      back: `${productName} - BACK VIEW: ${finalPrompt}. Matching front design, white background, high detail.`,
      side: `${productName} - SIDE VIEW: ${finalPrompt}. Profile view matching front/back, white background, high detail.`,
    };

    // Generate all views in parallel
    const [frontResult, backResult, sideResult] = await Promise.all([
      geminiService.generateImage({
        prompt: viewPrompts.front,
        referenceImage: currentViews.front,
        options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
      }),
      geminiService.generateImage({
        prompt: viewPrompts.back,
        referenceImage: currentViews.back,
        options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
      }),
      geminiService.generateImage({
        prompt: viewPrompts.side,
        referenceImage: currentViews.side,
        options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
      }),
    ]);

    if (!frontResult.url || !backResult.url || !sideResult.url) {
      throw new Error("Failed to generate all views");
    }

    // Convert data URLs to buffers
    const dataUrlToBuffer = (dataUrl: string): Buffer => {
      const base64 = dataUrl.split(",")[1];
      return Buffer.from(base64, "base64");
    };

    // Step 4: Upload and save each view as a separate revision
    const views = [
      { type: "front", result: frontResult },
      { type: "back", result: backResult },
      { type: "side", result: sideResult },
    ];

    const revisionIds: string[] = [];
    const resultViews: any = {};

    // Get the highest revision number for each view
    for (const view of views) {
      console.log(`Processing ${view.type} view for product ${productId}`);

      const { data: existingRevisions, error: queryError } = await supabase
        .from("product_multiview_revisions")
        .select("revision_number")
        .eq("product_idea_id", productId)
        .eq("view_type", view.type)
        .order("revision_number", { ascending: false })
        .limit(1);

      if (queryError) {
        console.error(`Error querying existing revisions:`, queryError);
        console.error(`Query error details:`, {
          code: queryError.code,
          message: queryError.message,
          details: queryError.details,
          hint: queryError.hint,
        });
      }

      const nextRevisionNumber =
        existingRevisions && existingRevisions.length > 0
          ? existingRevisions[0].revision_number + 1
          : 1;

      console.log(
        `Next revision number for ${view.type}: ${nextRevisionNumber}`
      );

      // Upload images
      const buffer = dataUrlToBuffer(view.result.url);
      const fileName = `${productId}/${view.type}_edit_${timestamp}.png`;
      const thumbFileName = `${productId}/${view.type}_edit_${timestamp}_thumb.png`;

      const [imageUrl, thumbnailUrl] = await Promise.all([
        uploadBufferToSupabase(buffer, fileName),
        uploadBufferToSupabase(buffer, thumbFileName),
      ]);

      resultViews[view.type] = imageUrl;

      // Deactivate previous active revision for this view
      await supabase
        .from("product_multiview_revisions")
        .update({ is_active: false })
        .eq("product_idea_id", productId)
        .eq("view_type", view.type)
        .eq("is_active", true);

      // Save new revision
      const { data: revision, error: dbError } = await supabase
        .from("product_multiview_revisions")
        .insert({
          product_idea_id: productId,
          user_id: user.id,
          revision_number: nextRevisionNumber,
          view_type: view.type,
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl,
          edit_prompt: editPrompt,
          edit_type: "ai_edit",
          ai_model: "gemini-2.5-flash-image-preview",
          ai_parameters: {
            batchId, // Group revisions together
            analysisPrompt: productAnalysis.substring(0, 500),
            enhancedPrompt: finalPrompt.substring(0, 500),
            originalPrompt: editPrompt,
          },
          generation_time_ms: Date.now() - timestamp,
          is_active: true,
          metadata: {
            productName,
            batchEdit: true,
            batchId,
            viewPrompt: viewPrompts[view.type as keyof typeof viewPrompts],
          },
        })
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
        console.error(`Data being inserted:`, {
          product_idea_id: productId,
          user_id: user.id,
          revision_number: nextRevisionNumber,
          view_type: view.type,
        });
        // Don't throw, continue with other views
      } else if (revision) {
        console.log(`Saved ${view.type} revision:`, revision.id);
        revisionIds.push(revision.id);
      } else {
        console.warn(
          `No revision returned for ${view.type}, but no error either`
        );
      }
    }

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
 * Get grouped multi-view revisions
 */
export async function getGroupedMultiViewRevisions(productId: string) {
  try {
    const supabase = await createClient();

    // Get all revisions
    const { data, error } = await supabase
      .from("product_multiview_revisions")
      .select("*")
      .eq("product_idea_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Group by batchId or revision_number
    const grouped: any[] = [];
    const batches = new Map();

    data?.forEach((rev) => {
      const batchId = rev.ai_parameters?.batchId || `single-${rev.id}`;

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
        });
      }

      const batch = batches.get(batchId);
      batch.views[rev.view_type] = {
        imageUrl: rev.image_url,
        thumbnailUrl: rev.thumbnail_url,
        revisionId: rev.id,
      };

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
