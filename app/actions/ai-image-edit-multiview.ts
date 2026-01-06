"use server";

import { GeminiImageService } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";
import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
import { aiLogger } from "@/lib/logging/ai-logger";
import { analyzeProductViews } from "@/lib/services/image-analysis-service";
import { ReserveCredits, RefundCredits } from "@/lib/supabase/payments";
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
    top?: string;
    bottom?: string;
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
    top?: string;
    bottom?: string;
  };
  revisionId?: string;
  error?: string;
}

/**
 * Apply AI edits to all product views at once
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

  let reservationId: string | undefined;

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

    // Reserve 5 credits for this edit request (3 credits for front view + 2 credits for remaining 4 views)
    const creditReservation = await ReserveCredits({ credit: 5 });
    if (!creditReservation.success) {
      throw new Error(
        creditReservation.message || "Insufficient credits for edit request. Need 5 credits."
      );
    }
    reservationId = creditReservation.reservationId;

    const timestamp = Date.now();

    // Log input
    logger.setInput({
      prompt: editPrompt,
      metadata: {
        productId,
        productName,
      },
    });

    logger.setContext({
      user_id: user.id,
      feature: "ai_multiview_editor",
    });

    console.log("Applying multi-view edit:", editPrompt);

    // Step 1: Check for cached analysis or analyze images
    console.log("Getting product image analysis...");

    // Get current revision number for the new revision we're creating
    const { data: existingRevisions } = await supabase
      .from("product_multiview_revisions")
      .select("revision_number")
      .eq("product_idea_id", productId)
      .order("revision_number", { ascending: false })
      .limit(1);

    const nextRevisionNumber =
      existingRevisions && existingRevisions.length > 0
        ? existingRevisions[0].revision_number + 1
        : 1;

    // Use the cached analysis service with revision info
    const analysisResults = await analyzeProductViews(
      currentViews,
      productName,
      productId,
      undefined, // We don't have the revision ID yet since we're creating it
      nextRevisionNumber
    );

    // Combine analyses into a single string for prompt enhancement
    let productAnalysis = "";

    if (analysisResults.combinedAnalysis) {
      productAnalysis = analysisResults.combinedAnalysis;
    } else {
      // Fallback: combine individual analyses
      if (analysisResults.front?.fullAnalysis) {
        productAnalysis += `Front View: ${analysisResults.front.fullAnalysis}\n\n`;
      }
      if (analysisResults.back?.fullAnalysis) {
        productAnalysis += `Back View: ${analysisResults.back.fullAnalysis}\n\n`;
      }
      if (analysisResults.side?.fullAnalysis) {
        productAnalysis += `Side View: ${analysisResults.side.fullAnalysis}\n\n`;
      }
    }

    // If still no analysis (shouldn't happen), fall back to direct API call
    if (!productAnalysis) {
      console.log("No cached analysis found, performing new analysis...");

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
                text: `Analyze this ${productName} product shown in three views for the edit: "${editPrompt}"`,
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
        max_tokens: 1000,
        temperature: 0.3,
      });

      productAnalysis = analysisResponse.choices[0]?.message?.content || "";
    }

    console.log("Product analysis ready (from cache or new)");

    // Step 2: Enhance the user's edit prompt based on the analysis
    console.log("Enhancing edit prompt with GPT-4...");

    const enhancementResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a prompt engineering expert specializing in product design and image generation.
          Create precise, detailed prompts that will generate consistent product views with the requested changes.
          Focus on maintaining product identity while applying edits accurately.`,
        },
        {
          role: "user",
          content: `Based on this product analysis:
          "${productAnalysis}"
          
          The user wants to: "${editPrompt}"
          
          Create an enhanced, specific prompt for image generation that will:
          1. Apply the requested changes accurately across all views
          2. Maintain product identity and proportions
          3. Ensure consistency between front, back, and side views
          4. Preserve important product features unless specifically changed
          5. Use specific color names, materials, and descriptive details
          
          The enhanced prompt should be clear, specific, and focused on the edit while maintaining all unchanged aspects.
          
          Enhanced prompt:`,
        },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    const finalPrompt =
      enhancementResponse.choices[0]?.message?.content || editPrompt;
    console.log("Enhanced prompt:", finalPrompt);

    // Step 3: Generate all five views with the enhanced prompt
    const viewPrompts = {
      front: `${productName} - FRONT VIEW: ${finalPrompt}. Show the complete front view of the product with all details clearly visible. Professional product photography style, white background, high quality, detailed.`,
      back: `${productName} - BACK VIEW: ${finalPrompt}. Show the complete back view of the product matching the front view design. Professional product photography style, white background, high quality, detailed.`,
      side: `${productName} - SIDE VIEW: ${finalPrompt}. Show the complete side/profile view of the product matching the front and back views. Professional product photography style, white background, high quality, detailed.`,
      top: `${productName} - TOP/OVERHEAD VIEW: ${finalPrompt}. Show the product from directly above, displaying the top surface. Professional product photography style, white background, high quality, detailed.`,
      bottom: `${productName} - BOTTOM/UNDERSIDE VIEW: ${finalPrompt}. Show the underside/bottom of the product, displaying the base or bottom features. Professional product photography style, white background, high quality, detailed.`,
    };

    // Generate all views in parallel
    const [frontResult, backResult, sideResult, topResult, bottomResult] =
      await Promise.all([
        geminiService.generateImage({
          prompt: viewPrompts.front,
          referenceImage: currentViews.front,
          options: {
            enhancePrompt: false,
            fallbackEnabled: true,
            retry: 3,
          },
        }),
        geminiService.generateImage({
          prompt: viewPrompts.back,
          referenceImage: currentViews.back,
          options: {
            enhancePrompt: false,
            fallbackEnabled: true,
            retry: 3,
          },
        }),
        geminiService.generateImage({
          prompt: viewPrompts.side,
          referenceImage: currentViews.side,
          options: {
            enhancePrompt: false,
            fallbackEnabled: true,
            retry: 3,
          },
        }),
        geminiService.generateImage({
          prompt: viewPrompts.top,
          referenceImage: currentViews.top || currentViews.front, // Use front as fallback for top
          options: {
            enhancePrompt: false,
            fallbackEnabled: true,
            retry: 3,
          },
        }),
        geminiService.generateImage({
          prompt: viewPrompts.bottom,
          referenceImage: currentViews.bottom || currentViews.front, // Use front as fallback for bottom
          options: {
            enhancePrompt: false,
            fallbackEnabled: true,
            retry: 3,
          },
        }),
      ]);

    if (
      !frontResult.url ||
      !backResult.url ||
      !sideResult.url ||
      !topResult.url ||
      !bottomResult.url
    ) {
      throw new Error("Failed to generate all views");
    }

    // Convert data URLs to buffers for upload
    const dataUrlToBuffer = (dataUrl: string): Buffer => {
      const base64 = dataUrl.split(",")[1];
      return Buffer.from(base64, "base64");
    };

    // Step 4: Upload all generated images
    const uploadPromises = [
      { view: "front", buffer: dataUrlToBuffer(frontResult.url) },
      { view: "back", buffer: dataUrlToBuffer(backResult.url) },
      { view: "side", buffer: dataUrlToBuffer(sideResult.url) },
      { view: "top", buffer: dataUrlToBuffer(topResult.url) },
      { view: "bottom", buffer: dataUrlToBuffer(bottomResult.url) },
    ].map(async ({ view, buffer }) => {
      const fileName = `${productId}/${view}_edit_${timestamp}.png`;
      const thumbFileName = `${productId}/${view}_edit_${timestamp}_thumb.png`;

      const [imageUrl, thumbnailUrl] = await Promise.all([
        uploadBufferToSupabase(buffer, fileName),
        uploadBufferToSupabase(buffer, thumbFileName),
      ]);

      return { view, imageUrl, thumbnailUrl };
    });

    const uploadedViews = await Promise.all(uploadPromises);

    // Create views object for database
    const viewsData: any = {};
    const resultViews: any = {};

    uploadedViews.forEach(({ view, imageUrl, thumbnailUrl }) => {
      viewsData[view] = {
        imageUrl,
        thumbnailUrl,
      };
      resultViews[view] = imageUrl;
    });

    // Step 5: Save revision to database
    console.log("Saving multi-view revision for product:", productId);

    // Check if product exists
    const { data: productExists } = await supabase
      .from("product_ideas")
      .select("id")
      .eq("id", productId)
      .single();

    if (!productExists) {
      console.warn("Product not found, continuing without saving revision");
      return {
        success: true,
        views: resultViews,
      };
    }

    // Use the revision number we calculated earlier
    const revisionNumber = nextRevisionNumber;

    // Deactivate previous active revisions
    await supabase
      .from("product_multiview_revisions")
      .update({ is_active: false })
      .eq("product_idea_id", productId)
      .eq("is_active", true);

    // Save new revision
    const { data: revision, error: dbError } = await supabase
      .from("product_multiview_revisions")
      .insert({
        product_idea_id: productId,
        user_id: user.id,
        revision_number: revisionNumber,
        views: viewsData,
        edit_prompt: editPrompt,
        analysis_prompt: productAnalysis,
        enhanced_prompt: finalPrompt,
        edit_type: "ai_edit",
        ai_model: "gemini-2.5-flash-image-preview",
        ai_parameters: {
          temperature: 0.7,
          originalPrompt: editPrompt,
          viewPrompts,
        },
        generation_time_ms: Date.now() - timestamp,
        is_active: true,
        metadata: {
          productName,
          productDescription,
          originalViews: currentViews,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error saving revision:", dbError);
      // Continue without failing - images were generated successfully
    } else if (revision?.id) {
      // Update the analysis cache entries with the new revision ID
      const supabaseUpdate = await createClient();
      const viewUrls = Object.values(resultViews);

      for (const url of viewUrls) {
        await supabaseUpdate
          .from("image_analysis_cache")
          .update({
            revision_id: revision.id,
            revision_number: revisionNumber,
          })
          .eq("image_url", url)
          .eq("product_idea_id", productId);
      }
    }

    // Log success
    logger.setOutput({
      content: `Successfully edited all views with revision #${revisionNumber}`,
      raw_response: {
        revisionId: revision?.id,
        views: resultViews,
        revisionNumber,
      },
    });

    await logger.complete();

    return {
      success: true,
      views: resultViews,
      revisionId: revision?.id,
    };
  } catch (error: any) {
    console.error("Multi-view edit error:", error);
    logger.setError(error);
    await logger.complete();

    // Refund credits if generation failed
    if (reservationId) {
      try {
        await RefundCredits({ credit: 5, reservationId });
        console.log("5 credits refunded due to edit generation failure");
      } catch (refundError) {
        console.error("Failed to refund credits:", refundError);
      }
    }

    return {
      success: false,
      error: error.message || "Failed to apply multi-view edit",
    };
  }
}

/**
 * Get all multi-view revisions for a product
 */
export async function getMultiViewRevisions(productId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("product_multiview_revisions")
      .select("*")
      .eq("product_idea_id", productId)
      .order("revision_number", { ascending: true });

    if (error) {
      throw error;
    }

    // Format revisions for UI
    const formattedRevisions = (data || []).map((rev: {
      id: string;
      revision_number: number;
      views: Record<string, unknown> | null;
      edit_prompt: string;
      analysis_prompt: string;
      enhanced_prompt: string;
      edit_type: string;
      created_at: string;
      is_active: boolean;
      metadata: Record<string, unknown> | null;
    }) => ({
      id: rev.id,
      revisionNumber: rev.revision_number,
      views: rev.views || {},
      editPrompt: rev.edit_prompt,
      analysisPrompt: rev.analysis_prompt,
      enhancedPrompt: rev.enhanced_prompt,
      editType: rev.edit_type,
      createdAt: rev.created_at,
      isActive: rev.is_active,
      metadata: rev.metadata,
    }));

    return {
      success: true,
      revisions: formattedRevisions,
    };
  } catch (error: any) {
    console.error("Error fetching multi-view revisions:", error);
    return {
      success: false,
      error: error.message,
      revisions: [],
    };
  }
}

/**
 * Set a specific multi-view revision as active
 */
export async function setActiveMultiViewRevision(
  revisionId: string,
  productId: string
) {
  try {
    const supabase = await createClient();

    // Deactivate all revisions
    await supabase
      .from("product_multiview_revisions")
      .update({ is_active: false })
      .eq("product_idea_id", productId);

    // Activate selected revision
    const { error } = await supabase
      .from("product_multiview_revisions")
      .update({ is_active: true })
      .eq("id", revisionId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error setting active revision:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
