"use server";

import { createClient } from "@/lib/supabase/server";
import { GeminiImageService } from "@/lib/ai/gemini";
import { ImageService } from "@/lib/services/image-service";
import { aiLogger } from "@/lib/logging/ai-logger";
import { ReserveCredits, RefundCredits } from "@/lib/supabase/payments";
import {
  resolveLogoWithFallback,
  type BrandDNA,
} from "@/lib/services/brand-dna-context-service";
import type { ViewType } from "@/modules/ai-designer/types/editor.types";

// Initialize services
const geminiService = new GeminiImageService();

// Types
export interface RegenerateSingleViewParams {
  productId: string;
  viewType: ViewType;
  revisionId: string;
  editPrompt: string;
  referenceViews: {
    front?: string;
    back?: string;
    side?: string;
    top?: string;
    bottom?: string;
  };
}

export interface RegenerateSingleViewResponse {
  success: boolean;
  newViewUrl?: string;
  newRevisionId?: string;
  newRevisionNumber?: number;
  creditsUsed?: number;
  error?: string;
}

interface ExtractedFeatures {
  colors: Array<{ hex: string; name: string; usage: string }>;
  estimatedDimensions: { width: string; height: string; depth?: string };
  materials: string[];
  keyElements: string[];
  description: string;
}

/**
 * Build prompt for a specific view type with edit instructions
 * Simplified to focus only on the user's specific edit request
 */
function buildViewPrompt(
  viewType: ViewType,
  _referenceViews: Partial<Record<ViewType, string>>, // Unused but kept for API compatibility
  _features: ExtractedFeatures, // Unused but kept for API compatibility
  editInstructions: string,
  logo?: string,
  _generationMode: string = "regular" // Unused but kept for API compatibility
): string {
  // Only include logo context if user specifically mentions logo in their edit instructions
  const logoMentioned = /logo|brand|emblem|mark/i.test(editInstructions);
  const logoContext = (logo && logoMentioned)
    ? `\n\nLogo context: A logo is provided and should be included as requested.`
    : "";

  return `You are editing an existing product image. You have a reference image that shows the current state.

TASK: Modify the ${viewType} view by making ONLY the following change:
"${editInstructions}"

CRITICAL RULES - FOLLOW STRICTLY:
1. START with the reference image provided - this is your base
2. Make ONLY the specific modification requested in the edit instructions above
3. DO NOT add any new elements (logos, text, patterns, decorations) unless explicitly requested
4. DO NOT change colors, materials, shapes, or features that were not mentioned in the edit instructions
5. Keep the exact same product design, proportions, lighting, and composition as the reference
6. If asked to change one specific element (e.g., "change bottom color to gold"):
   - Change ONLY that element (the bottom color)
   - Keep everything else EXACTLY as shown in the reference image
   - Do not add, remove, or modify any other features

WHAT TO PRESERVE (keep identical to reference):
- Product shape and proportions
- All elements not mentioned in the edit instructions
- Lighting direction and intensity
- Camera angle and perspective
- Background (white, centered)
- Product positioning
- Level of detail and realism
- Any existing logos, text, or branding (unless user specifically asks to change them)

${logoContext}

Output: Generate a photorealistic product ${viewType} view that looks EXACTLY like the reference image except for the specific change requested.`;
}

/**
 * Get extracted features from the most recent front view approval
 */
async function getExtractedFeatures(
  supabase: any,
  userId: string,
  productId: string
): Promise<ExtractedFeatures> {
  const { data: approval } = await supabase
    .from("front_view_approvals")
    .select("extracted_features")
    .eq("product_idea_id", productId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const features = (approval?.extracted_features || {}) as Partial<ExtractedFeatures>;

  return {
    colors: Array.isArray(features.colors) ? features.colors : [],
    estimatedDimensions: features.estimatedDimensions || {
      width: "unknown",
      height: "unknown",
    },
    materials: Array.isArray(features.materials) ? features.materials : [],
    keyElements: Array.isArray(features.keyElements)
      ? features.keyElements
      : [],
    description: features.description || "",
  };
}

/**
 * Regenerate a single view with user's edit instructions
 */
export async function regenerateSingleView(
  params: RegenerateSingleViewParams
): Promise<RegenerateSingleViewResponse> {
  const logger = aiLogger.startOperation(
    "regenerateSingleView",
    params.viewType === "front" || params.viewType === "back"
      ? "gemini-3-pro-image-preview"
      : "gemini-2.5-flash-image-preview",
    "gemini",
    "image_generation"
  );

  let reservationId: string | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Input validation
    if (!params.productId || !params.viewType || !params.editPrompt || !params.revisionId) {
      throw new Error("Product ID, view type, edit prompt, and revision ID are required");
    }

    console.log(`[RegenerateSingleView] Regenerating ${params.viewType} view for product ${params.productId}`);

    // Reserve 1 credit for single view regeneration
    const creditReservation = await ReserveCredits({ credit: 1 });
    if (!creditReservation.success) {
      throw new Error(
        creditReservation.message || "Insufficient credits. Need 1 credit for view regeneration."
      );
    }

    reservationId = creditReservation.reservationId;
    console.log(`[RegenerateSingleView] Reserved 1 credit (reservation ID: ${reservationId})`);

    // Fetch product metadata
    const { data: product } = await supabase
      .from("product_ideas")
      .select("tech_pack, creator_id, brand_dna_applied, brand_dna_id, generation_mode")
      .eq("id", params.productId)
      .single();

    if (!product) {
      throw new Error("Product not found");
    }

    // Fetch Brand DNA if applied
    let brandDna: BrandDNA | null = null;
    if (product.brand_dna_applied && product.brand_dna_id) {
      const { data: dna } = await supabase
        .from("brand_dna")
        .select("*")
        .eq("id", product.brand_dna_id)
        .single();
      brandDna = dna;
    }

    const metadata = product?.tech_pack?.metadata || {};
    const productLogo = metadata.logo || undefined;
    const chatUploadedImage = metadata.chatUploadedImage || undefined;
    const chatImageToolType = metadata.chatImageToolType || undefined;

    // Resolve logo using fallback hierarchy
    const logoResolution = resolveLogoWithFallback({
      chatUploadedLogo: chatImageToolType === "logo" ? chatUploadedImage : undefined,
      productLogo,
      brandDna,
    });

    const effectiveLogoImage = logoResolution?.logo;
    const generationMode = product?.generation_mode || "regular";

    console.log(`[RegenerateSingleView] Generation mode: ${generationMode}, Logo: ${effectiveLogoImage ? "Yes" : "No"}`);

    // Get extracted features
    const extractedFeatures = await getExtractedFeatures(supabase, user.id, params.productId);

    logger.setContext({
      user_id: user.id,
      feature: "single_view_regeneration",
    });

    logger.setInput({
      metadata: {
        view_type: params.viewType,
        product_id: params.productId,
        generation_mode: generationMode,
        has_logo: !!effectiveLogoImage,
      },
    });

    // Build prompt for this specific view
    const prompt = buildViewPrompt(
      params.viewType,
      params.referenceViews,
      extractedFeatures,
      params.editPrompt,
      effectiveLogoImage,
      generationMode
    );

    console.log(`[RegenerateSingleView] Generating ${params.viewType} view...`);

    // Determine model based on view type (Pro for front/back, Flash for others)
    const model =
      params.viewType === "front" || params.viewType === "back"
        ? "gemini-3-pro-image-preview"
        : "gemini-2.5-flash-image-preview";

    // Only include logo context if user specifically mentions logo in their edit instructions
    const logoMentioned = /logo|brand|emblem|mark/i.test(params.editPrompt);

    // Generate the view
    const result = await geminiService.generateImage({
      prompt,
      referenceImage: params.referenceViews[params.viewType], // Current view as reference
      logoImage: (logoMentioned && effectiveLogoImage) ? effectiveLogoImage : undefined, // Only pass logo if user mentions it
      view: params.viewType,
      style: "photorealistic",
      options: {
        enhancePrompt: false, // Prompt already detailed
        fallbackEnabled: true, // Enable Pro → Flash fallback on errors
        retry: 5,
        model,
      },
    });

    if (!result.url) {
      throw new Error(`Failed to generate ${params.viewType} view: No image URL returned`);
    }

    console.log(`[RegenerateSingleView] View generated, uploading...`);

    // Upload the new view
    const imageService = ImageService.getInstance();
    const uploadResult = await imageService.upload(result.url, {
      projectId: params.productId,
      preset: "original",
      preserveOriginal: true,
    });

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(
        `Failed to upload ${params.viewType} view: ${uploadResult.error || "Unknown error"}`
      );
    }

    const newViewUrl = uploadResult.url;
    console.log(`[RegenerateSingleView] View uploaded: ${newViewUrl.substring(0, 100)}...`);

    // Get the current revision details and batch_id
    console.log(`[RegenerateSingleView] Fetching current revision with ID: ${params.revisionId}`);
    const { data: currentRevisionData, error: currentRevisionError } = await supabase
      .from("product_multiview_revisions")
      .select("batch_id, revision_number")
      .eq("id", params.revisionId)
      .single();

    if (currentRevisionError) {
      console.error(`[RegenerateSingleView] Error fetching current revision:`, currentRevisionError);
      throw new Error(`Could not find current revision: ${currentRevisionError.message}`);
    }

    if (!currentRevisionData?.batch_id) {
      console.error(`[RegenerateSingleView] No batch_id found in current revision data:`, currentRevisionData);
      throw new Error("Could not find current revision");
    }

    console.log(`[RegenerateSingleView] Current revision: ${currentRevisionData.revision_number} (batch: ${currentRevisionData.batch_id})`);

    // Get all views from the current revision batch
    console.log(`[RegenerateSingleView] Fetching all views for batch_id: ${currentRevisionData.batch_id}`);
    const { data: currentRevisionViews, error: viewsError } = await supabase
      .from("product_multiview_revisions")
      .select("view_type, image_url, edit_prompt, ai_model, front_view_approval_id, metadata")
      .eq("batch_id", currentRevisionData.batch_id)
      .eq("user_id", user.id);

    if (viewsError) {
      console.error(`[RegenerateSingleView] Error fetching revision views:`, viewsError);
      throw new Error(`Could not fetch revision views: ${viewsError.message}`);
    }

    if (!currentRevisionViews || currentRevisionViews.length === 0) {
      console.error(`[RegenerateSingleView] No views found for batch_id: ${currentRevisionData.batch_id}`);
      throw new Error("Could not find current revision views");
    }

    console.log(`[RegenerateSingleView] Found ${currentRevisionViews.length} views in current revision:`,
      currentRevisionViews.map(v => v.view_type));

    // Get the highest revision number for this product
    console.log(`[RegenerateSingleView] Fetching max revision number for product: ${params.productId}`);
    const { data: maxRevisionData, error: maxRevisionError } = await supabase
      .from("product_multiview_revisions")
      .select("revision_number")
      .eq("product_idea_id", params.productId)
      .eq("user_id", user.id)
      .order("revision_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxRevisionError) {
      console.error(`[RegenerateSingleView] Error fetching max revision:`, maxRevisionError);
    }

    const newRevisionNumber = (maxRevisionData?.revision_number || 0) + 1;
    const newBatchId = `single_view_edit_${newRevisionNumber}_${Date.now()}`;

    console.log(`[RegenerateSingleView] Max revision found: ${maxRevisionData?.revision_number || 0}, Creating new revision ${newRevisionNumber} (batch: ${newBatchId})`);

    // Prepare revision records: copy all existing views + update the regenerated view
    const revisionRecords = currentRevisionViews.map((view: any) => ({
      product_idea_id: params.productId,
      user_id: user.id,
      revision_number: newRevisionNumber,
      batch_id: newBatchId,
      view_type: view.view_type,
      image_url: view.view_type === params.viewType ? newViewUrl : view.image_url, // Use new URL for regenerated view
      thumbnail_url: view.view_type === params.viewType ? newViewUrl : view.image_url,
      edit_prompt: view.view_type === params.viewType ? params.editPrompt : view.edit_prompt,
      edit_type: view.view_type === params.viewType ? "ai_edit" : view.edit_type || "ai_edit",
      ai_model: view.view_type === params.viewType ? model : view.ai_model,
      is_active: true,
      front_view_approval_id: view.front_view_approval_id,
      metadata: {
        ...(view.metadata || {}),
        single_view_regeneration: view.view_type === params.viewType,
        regenerated_view: view.view_type === params.viewType ? params.viewType : undefined,
        user_edit_instructions: view.view_type === params.viewType ? params.editPrompt : undefined,
        parent_revision_number: currentRevisionData.revision_number,
        parent_batch_id: currentRevisionData.batch_id,
      },
    }));

    console.log(`[RegenerateSingleView] Prepared ${revisionRecords.length} revision records:`,
      revisionRecords.map(r => ({ view_type: r.view_type, revision: r.revision_number, batch: r.batch_id })));

    // Deactivate previous active revisions for this product
    console.log(`[RegenerateSingleView] Deactivating previous active revisions for product: ${params.productId}`);
    const { error: deactivateError } = await supabase
      .from("product_multiview_revisions")
      .update({ is_active: false })
      .eq("product_idea_id", params.productId)
      .eq("is_active", true);

    if (deactivateError) {
      console.error(`[RegenerateSingleView] Error deactivating previous revisions:`, deactivateError);
      throw new Error(`Failed to deactivate previous revisions: ${deactivateError.message}`);
    }

    console.log(`[RegenerateSingleView] Deactivation successful, now inserting new revision records...`);

    // Insert all revision records for the new revision
    const { data: newRevisions, error: insertError } = await supabase
      .from("product_multiview_revisions")
      .insert(revisionRecords)
      .select();

    if (insertError) {
      console.error(`[RegenerateSingleView] Database insert error:`, {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      });
      throw new Error(`Failed to create new revision: ${insertError.message}`);
    }

    if (!newRevisions || newRevisions.length === 0) {
      console.error(`[RegenerateSingleView] Insert succeeded but no revisions returned`);
      throw new Error("Failed to create new revision: No revisions returned");
    }

    console.log(`[RegenerateSingleView] Successfully created ${newRevisions.length} revision records:`,
      newRevisions.map(r => ({ id: r.id, view_type: r.view_type, revision: r.revision_number })));

    // Find the revision ID for the regenerated view
    const regeneratedViewRevision = newRevisions.find(
      (r: any) => r.view_type === params.viewType
    );

    if (!regeneratedViewRevision) {
      throw new Error("Could not find regenerated view in new revisions");
    }

    console.log(`[RegenerateSingleView] Successfully created revision ${newRevisionNumber} with regenerated ${params.viewType} view`);

    return {
      success: true,
      newViewUrl,
      newRevisionId: regeneratedViewRevision.id,
      newRevisionNumber,
      creditsUsed: 1,
    };
  } catch (error) {
    console.error("[RegenerateSingleView] Error:", error);

    // Refund reserved credits if operation failed
    if (reservationId) {
      console.log(`[RegenerateSingleView] Refunding 1 credit due to error`);
      await RefundCredits({
        credit: 1,
        reservationId,
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to regenerate view",
    };
  }
}
