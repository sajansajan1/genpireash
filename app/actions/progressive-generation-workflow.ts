"use server";

import { createClient } from "@/lib/supabase/server";
import { GeminiImageService } from "@/lib/ai/gemini";
import { ImageService } from "@/lib/services/image-service";
import { aiLogger } from "@/lib/logging/ai-logger";
import { ReserveCredits, RefundCredits } from "@/lib/supabase/payments";
import { saveImageUploadsBatch } from "./image-uploads";
import { analyzeFrontViewInBackground } from "@/lib/services/vision-analysis-service";
import { buildProgressiveFrontViewPrompt } from "@/lib/utils/front-view-prompts";
import {
  resolveLogoWithFallback,
  type BrandDNA,
  type LogoSource,
} from "@/lib/services/brand-dna-context-service";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

// Initialize services
const geminiService = new GeminiImageService();

function getOpenAIClient() {
  if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server");
  }
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });
}

// Types
export interface GenerateFrontViewOnlyParams {
  productId: string;
  userPrompt: string;
  isEdit?: boolean;
  previousFrontViewUrl?: string;
  sessionId?: string;
}

export interface GenerateFrontViewOnlyResponse {
  success: boolean;
  frontViewUrl?: string;
  approvalId?: string;
  sessionId?: string;
  creditsReserved?: number;
  error?: string;
}

export interface HandleFrontViewDecisionParams {
  approvalId: string;
  action: "approve" | "edit";
  editFeedback?: string;
}

export interface HandleFrontViewDecisionResponse {
  success: boolean;
  action: "approved" | "regenerate";
  newFrontViewUrl?: string;
  newApprovalId?: string;
  extractedFeatures?: ExtractedFeatures;
  error?: string;
}

export interface GenerateRemainingViewsParams {
  approvalId: string;
  frontViewUrl: string;
  // Optional: specify a revision number to use as structural reference
  // If not provided, no previous revision will be used
  selectedRevisionNumber?: number;
}

export interface GenerateRemainingViewsResponse {
  success: boolean;
  views?: {
    back: string;
    side: string;
    top: string;
    bottom: string;
  };
  error?: string;
}

export interface CreateRevisionAfterApprovalParams {
  productId: string;
  approvalId: string;
  allViews: {
    front: string;
    back: string;
    side: string;
    top: string;
    bottom: string;
  };
  isInitial: boolean;
}

export interface CreateRevisionAfterApprovalResponse {
  success: boolean;
  revisionNumber?: number;
  batchId?: string;
  revisionIds?: string[];
  error?: string;
}

export interface ExtractedFeatures {
  colors: Array<{ hex: string; name: string; usage: string }>;
  estimatedDimensions: { width: string; height: string; depth?: string };
  materials: string[];
  keyElements: string[];
  description: string;
}

/**
 * STEP 1: Generate only the front view
 *
 * This is the first phase of the progressive workflow.
 * Generates only the front view (~30 seconds) and creates an approval record.
 *
 * Credit handling:
 * - Front view generation (initial or edit): Reserves 2 credits
 * - Remaining views (4 views): Reserves 3 credits when user approves (back, side, top, bottom)
 * - Total: 5 credits for complete product (2 + 3)
 *
 * @param params - Parameters for front view generation
 * @returns Front view URL and approval ID for user decision
 */
export async function generateFrontViewOnly(
  params: GenerateFrontViewOnlyParams
): Promise<GenerateFrontViewOnlyResponse> {
  const logger = aiLogger.startOperation(
    "generateFrontViewOnly",
    "gemini-3-pro-image-preview", // Front view uses Pro model (falls back to Flash on error)
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
    if (!params.productId || !params.userPrompt) {
      throw new Error("Product ID and user prompt are required");
    }

    // Fetch product metadata first to check if Brand DNA was applied and get generation mode
    const { data: product } = await supabase
      .from("product_ideas")
      .select("tech_pack, creator_id, brand_dna_applied, brand_dna_id, generation_mode")
      .eq("id", params.productId)
      .single();

    // Only fetch Brand DNA if it was applied to this product
    let brandDna: BrandDNA | null = null;
    if (product?.brand_dna_applied && product?.brand_dna_id) {
      const { data: dna } = await supabase
        .from("brand_dna")
        .select("*")
        .eq("id", product.brand_dna_id)
        .single();
      brandDna = dna;
    }

    const metadata = product?.tech_pack?.metadata || {};
    // Original product logo and design file
    const productLogo = metadata.logo || undefined;
    const designFile = metadata.designFile || undefined;

    // Chat uploaded image info (from ImageToolDialog or AI parsing)
    const chatUploadedImage = metadata.chatUploadedImage || undefined;
    const chatImageToolType = metadata.chatImageToolType || undefined; // 'logo' | 'sketch' | 'reference' | 'texture' | 'pattern'
    const chatImageLogoPosition = metadata.chatImageLogoPosition || undefined; // Position for logo placement
    const chatImageNote = metadata.chatImageNote || undefined; // User's additional notes
    // New AI-parsed fields
    const chatImageColorModification = metadata.chatImageColorModification || undefined; // { changeColor, targetColor, colorHex }
    const chatImageSizeModification = metadata.chatImageSizeModification || undefined; // { size, customSize }
    const chatImageSpecialInstructions = metadata.chatImageSpecialInstructions || undefined;
    const chatImageParsedByAI = metadata.chatImageParsedByAI || false;

    // Resolve logo using fallback hierarchy:
    // Priority: Chat uploaded logo > Product metadata logo > Brand DNA logo
    let logoResolution: LogoSource | null = null;
    let effectiveLogoImage: string | undefined = undefined;
    const effectiveLogoPosition = chatImageLogoPosition;
    const effectiveImageNote = chatImageNote;

    // Only use fallback for logo tool type or when no specific tool type
    if (chatImageToolType === 'logo' || !chatImageToolType) {
      logoResolution = resolveLogoWithFallback({
        chatUploadedLogo: chatImageToolType === 'logo' ? chatUploadedImage : undefined,
        productLogo,
        brandDna,
      });
      effectiveLogoImage = logoResolution?.logo;
    } else if (chatImageToolType === 'logo' && chatUploadedImage) {
      // Explicit logo upload via chat takes highest priority
      effectiveLogoImage = chatUploadedImage;
      logoResolution = { logo: chatUploadedImage, source: "chat_upload" };
    }

    console.log(`[Progressive Workflow] Logo resolution:`, {
      resolvedLogo: !!effectiveLogoImage,
      logoSource: logoResolution?.source || 'none',
      hasProductLogo: !!productLogo,
      brandDnaApplied: product?.brand_dna_applied || false,
      hasBrandDnaLogo: !!brandDna?.logo_url,
      hasChatUploadedImage: !!chatUploadedImage,
      chatImageToolType,
      chatImageLogoPosition,
    });

    console.log(`[Progressive Workflow] Metadata loaded:`, {
      hasLogo: !!effectiveLogoImage,
      logoLength: effectiveLogoImage?.length || 0,
      hasDesignFile: !!designFile,
      designFileLength: designFile?.length || 0,
      hasChatUploadedImage: !!chatUploadedImage,
      chatImageToolType,
      chatImageLogoPosition,
      hasChatImageNote: !!chatImageNote,
      chatImageColorModification,
      chatImageSizeModification,
      chatImageParsedByAI,
    });

    // If user uploaded a sketch, reference, or model image, treat it differently
    const isSketchUpload = chatImageToolType === 'sketch' && chatUploadedImage;
    const isReferenceUpload = chatImageToolType === 'reference' && chatUploadedImage;
    const isModelUpload = chatImageToolType === 'model' && chatUploadedImage; // Virtual try-on

    // Determine credit amount based on operation type
    // - Front view generation (initial or edit): 2 credits
    // - Remaining views generation (after approval): 3 credits
    const isEdit = params.isEdit || false;
    const creditsToReserve = 2; // Reserve 2 credits for front view generation

    console.log(`[Progressive Workflow] Starting front view generation for product ${params.productId}`);
    console.log(`[Progressive Workflow] Operation type: ${isEdit ? 'edit' : 'initial'}, reserving ${creditsToReserve} credit for front view`);

    // Reserve credits upfront
    const creditReservation = await ReserveCredits({ credit: creditsToReserve });
    if (!creditReservation.success) {
      throw new Error(
        creditReservation.message || `Insufficient credits. Need ${creditsToReserve} credits for ${isEdit ? 'edit' : 'generation'}.`
      );
    }
    reservationId = creditReservation.reservationId;
    console.log(`[Progressive Workflow] Reserved ${creditsToReserve} credits (reservation ID: ${reservationId})`);

    // Create or use existing session ID
    const sessionId = params.sessionId || uuidv4();

    // Get generation mode from product data (defaults to 'regular')
    const generationMode = product?.generation_mode || 'regular';
    console.log(`[Progressive Workflow] Generation mode: ${generationMode}`);

    // Build the front view prompt with logo position, notes, tool type, and AI-parsed modifications
    const frontViewPrompt = buildFrontViewPrompt(
      params.userPrompt,
      params.previousFrontViewUrl,
      effectiveLogoImage,
      {
        logoPosition: effectiveLogoPosition,
        note: effectiveImageNote,
        toolType: chatImageToolType,
        isSketch: isSketchUpload,
        isReference: isReferenceUpload,
        isModel: isModelUpload,
        sketchImageUrl: isSketchUpload ? chatUploadedImage : undefined,
        referenceImageUrl: isReferenceUpload ? chatUploadedImage : undefined,
        modelImageUrl: isModelUpload ? chatUploadedImage : undefined, // Pass the model/person image URL
        // New AI-parsed fields for color and size
        colorModification: chatImageColorModification,
        sizeModification: chatImageSizeModification,
        specialInstructions: chatImageSpecialInstructions,
        // Generation mode for B&W sketch, minimalist, etc.
        generationMode,
      }
    );

    // Log the operation
    logger.setInput({
      prompt: frontViewPrompt,
      parameters: {
        style: "photorealistic",
        temperature: 0.1,
      },
      metadata: {
        productId: params.productId,
        sessionId,
        creditsReserved: creditsToReserve,
        isEdit,
        hasLogo: !!effectiveLogoImage,
        logoSource: logoResolution?.source || 'none',
        hasDesignFile: !!designFile,
        chatImageToolType,
        chatImageLogoPosition: effectiveLogoPosition,
        hasChatImageNote: !!effectiveImageNote,
      },
    });

    logger.setContext({
      user_id: user.id,
      feature: "progressive_front_view_generation",
      session_id: sessionId,
    });

    // Determine reference image: use sketch or design file or previous front view
    // For model/virtual try-on: the reference should be the EXISTING PRODUCT (not the model image)
    const referenceImageToUse = isSketchUpload
      ? chatUploadedImage  // Use sketch as reference
      : isReferenceUpload
        ? chatUploadedImage  // Use reference image
        : isModelUpload
          ? params.previousFrontViewUrl || designFile  // For virtual try-on: use existing product as reference (NOT the model)
          : params.previousFrontViewUrl || designFile;

    // Generate the front view image using Pro model for higher quality
    console.log(`[Progressive Workflow] Generating front view with Gemini Pro model...`);
    console.log(`[Progressive Workflow] Logo will be ${effectiveLogoImage ? 'INCLUDED' : 'NOT included'} in generation`);
    console.log(`[Progressive Workflow] Tool type: ${chatImageToolType || 'none'}, Position: ${effectiveLogoPosition || 'default'}`);
    console.log(`[Progressive Workflow] Is model/virtual try-on: ${isModelUpload}`);
    const result = await geminiService.generateImage({
      prompt: frontViewPrompt,
      referenceImage: referenceImageToUse,
      // For virtual try-on: pass the model/person image as additional reference
      // The model image will be used to composite the product onto the person
      additionalReferenceImage: isModelUpload ? chatUploadedImage : undefined,
      logoImage: effectiveLogoImage, // Pass effective logo (chat uploaded or original)
      view: "front",
      style: "photorealistic",
      options: {
        enhancePrompt: false,
        fallbackEnabled: true,
        retry: 5,
        model: "gemini-3-pro-image-preview", // Pro model with Flash fallback on 503/429/500 errors
      },
    });

    if (!result.url) {
      throw new Error("Failed to generate front view: No image URL returned");
    }

    // Upload using ImageService
    console.log(`[Progressive Workflow] Uploading front view to storage...`);
    const imageService = ImageService.getInstance();
    const uploadResult = await imageService.upload(result.url, {
      projectId: params.productId,
      preset: "original",
      preserveOriginal: true,
    });

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(
        `Failed to upload front view: ${uploadResult.error || "Unknown error"}`
      );
    }

    const uploadedUrl = uploadResult.url;
    console.log(`[Progressive Workflow] Front view uploaded successfully: ${uploadedUrl.substring(0, 100)}...`);
    console.log(`[Progressive Workflow] Credit already deducted via ReserveCredits: ${creditsToReserve} credit`);

    // Check if an approval was created very recently (within last 5 seconds) to prevent duplicates
    // This handles race conditions from duplicate client calls (React StrictMode, etc.)
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    const { data: recentApprovals } = await supabase
      .from("front_view_approvals")
      .select("*")
      .eq("product_idea_id", params.productId)
      .eq("user_id", user.id)
      .eq("is_initial_generation", !isEdit)
      .gte("created_at", fiveSecondsAgo)
      .order("created_at", { ascending: false })
      .limit(1);

    // If we found a recent approval (created within last 5 seconds), return it instead of creating duplicate
    if (recentApprovals && recentApprovals.length > 0 && !isEdit) {
      const recentApproval = recentApprovals[0];
      console.log(
        `[Progressive Workflow] Found recent approval created at ${recentApproval.created_at}, returning existing record to prevent duplicate`
      );
      return {
        success: true,
        frontViewUrl: recentApproval.front_view_url,
        approvalId: recentApproval.id,
        sessionId: recentApproval.session_id,
      };
    }

    // Get the next iteration number by checking existing approvals
    const { data: existingApprovals } = await supabase
      .from("front_view_approvals")
      .select("iteration_number")
      .eq("product_idea_id", params.productId)
      .eq("user_id", user.id)
      .order("iteration_number", { ascending: false })
      .limit(1);

    const nextIterationNumber = (existingApprovals && existingApprovals.length > 0)
      ? (existingApprovals[0]?.iteration_number ?? 0) + 1
      : 1;

    console.log(`[Progressive Workflow] Creating approval with iteration number: ${nextIterationNumber}`);

    // Create approval record in database with retry logic
    let approval = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries && !approval) {
      try {
        const approvalData = {
          user_id: user.id,
          product_idea_id: params.productId,
          session_id: sessionId,
          front_view_url: uploadedUrl,
          front_view_prompt: frontViewPrompt,
          status: "pending",
          iteration_number: nextIterationNumber,
          credits_reserved: creditsToReserve,
          credits_consumed: creditsToReserve, // 2 credits already deducted for front view
          is_initial_generation: !isEdit,
          user_feedback: null,
          created_at: new Date().toISOString(),
        };

        const insertResult = await supabase
          .from("front_view_approvals")
          .insert(approvalData)
          .select()
          .single();

        if (insertResult.error) {
          console.error(`[Progressive Workflow] Error creating approval record (attempt ${retryCount + 1}/${maxRetries}):`, insertResult.error);

          // Check for specific errors
          if (insertResult.error.code === "42P01") {
            // Table doesn't exist
            throw new Error(
              "Database migration required: front_view_approvals table not found. Please run the migration."
            );
          }

          // Check for server errors that might be temporary
          if (
            insertResult.error.message?.includes("520") ||
            insertResult.error.message?.includes("502") ||
            insertResult.error.message?.includes("503")
          ) {
            retryCount++;
            if (retryCount < maxRetries) {
              console.warn(`[Progressive Workflow] Server error, retrying in 2 seconds...`);
              await new Promise((resolve) => setTimeout(resolve, 2000));
              continue;
            }
          }

          throw new Error(
            `Failed to create approval record: ${insertResult.error.message}`
          );
        }

        approval = insertResult.data;
        console.log(`[Progressive Workflow] Approval record created: ${approval.id}`);
        break;
      } catch (error) {
        if (retryCount === maxRetries - 1) {
          throw error;
        }
        retryCount++;
        console.warn(`[Progressive Workflow] Database operation failed (attempt ${retryCount}/${maxRetries}). Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    if (!approval) {
      throw new Error("Failed to create approval record after retries");
    }

    // ============================================================================
    // PHASE 2: VISION API CACHING (Non-Blocking Background Execution)
    // ============================================================================
    // Trigger Vision API analysis in background to cache features for future edits
    // This runs after user receives their front view (non-blocking)
    // Expected: 20-30 seconds to complete, user doesn't wait
    // Benefit: 30 seconds saved on every subsequent edit to this front view
    console.log(`[Progressive Workflow] ✓ Front view ready, starting background Vision analysis...`);

    analyzeFrontViewInBackground(
      {
        imageUrl: uploadedUrl,
        productIdeaId: params.productId,
        userId: user.id,
        viewType: "front", // Specify this is a front view analysis
        viewApprovalId: approval.id,
        sessionId: sessionId,
      },
      {
        onSuccess: (result) => {
          console.log(
            `[Progressive Workflow] ✓ Vision analysis complete:`,
            result.cached ? "used existing cache" : `new analysis (ID: ${result.analysisId})`
          );
        },
        onError: (error) => {
          // Non-critical error - log but don't fail the workflow
          console.error(
            `[Progressive Workflow] ⚠ Vision analysis failed (non-critical):`,
            error.message
          );
        },
      }
    );

    console.log(`[Progressive Workflow] Vision analysis scheduled in background (non-blocking)`);
    // ============================================================================

    // Log success
    logger.setOutput({
      images: [uploadedUrl],
      usage: {
        estimated_cost: 0.002,
      },
    });

    await logger.complete();

    console.log(`[Progressive Workflow] Front view generation completed successfully`);

    return {
      success: true,
      approvalId: approval.id,
      sessionId,
      frontViewUrl: uploadedUrl,
      creditsReserved: creditsToReserve,
    };
  } catch (error) {
    console.error("[Progressive Workflow] Front view generation error:", error);
    logger.setError(error instanceof Error ? error : new Error(String(error)));
    await logger.complete();

    // Refund credits if generation failed
    if (reservationId) {
      const creditsToRefund = 2; // Refund 2 credits (front view cost)
      try {
        await RefundCredits({ credit: creditsToRefund, reservationId });
        console.log(`[Progressive Workflow] Refunded ${creditsToRefund} credits due to failure`);
      } catch (refundError) {
        console.error("[Progressive Workflow] Failed to refund credits:", refundError);
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate front view",
    };
  }
}

/**
 * STEP 2: Handle user's front view approval or edit decision
 *
 * This function processes the user's decision after seeing the front view.
 *
 * If approved:
 * - Updates status to 'approved'
 * - Extracts features from the front view using OpenAI vision
 * - Prepares for generating remaining views
 *
 * If edit requested:
 * - Creates a new front_view_approvals record with iteration_number + 1
 * - Regenerates front view with the edit feedback
 * - Returns new approval ID for another review cycle
 *
 * @param params - Approval ID and user decision
 * @returns Status and next steps based on decision
 */
export async function handleFrontViewDecision(
  params: HandleFrontViewDecisionParams
): Promise<HandleFrontViewDecisionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Input validation
    if (!params.approvalId || !params.action) {
      throw new Error("Approval ID and action are required");
    }

    if (params.action !== "approve" && params.action !== "edit") {
      throw new Error("Action must be 'approve' or 'edit'");
    }

    console.log(`[Progressive Workflow] Handling front view decision: ${params.action} for approval ${params.approvalId}`);

    // Get the approval record
    const { data: approval, error: fetchError } = await supabase
      .from("front_view_approvals")
      .select("*")
      .eq("id", params.approvalId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !approval) {
      throw new Error("Approval record not found or access denied");
    }

    // Fetch generation_mode from product for edit iterations
    const { data: product } = await supabase
      .from("product_ideas")
      .select("generation_mode")
      .eq("id", approval.product_idea_id)
      .single();

    const generationMode = product?.generation_mode || 'regular';
    console.log(`[Progressive Workflow] Generation mode for iteration: ${generationMode}`);

    if (params.action === "approve") {
      console.log(`[Progressive Workflow] User approved front view, extracting features...`);

      // Extract features from the approved front view
      const extractedFeatures = await extractFeaturesFromImage(
        approval.front_view_url
      );

      // Update approval record
      const { error: updateError } = await supabase
        .from("front_view_approvals")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          user_feedback: params.editFeedback || null,
          extracted_features: extractedFeatures,
        })
        .eq("id", params.approvalId);

      if (updateError) {
        throw new Error(`Failed to update approval: ${updateError.message}`);
      }

      console.log(`[Progressive Workflow] Front view approved, features extracted`);

      return {
        success: true,
        action: "approved",
        extractedFeatures,
      };
    } else {
      // User requested edit
      console.log(`[Progressive Workflow] User requested edit with feedback: ${params.editFeedback || 'none'}`);

      // Reserve 2 credits for the iteration
      const iterationCreditReservation = await ReserveCredits({ credit: 2 });
      if (!iterationCreditReservation.success) {
        throw new Error(
          iterationCreditReservation.message || "Insufficient credits for iteration. Need 2 credits."
        );
      }

      console.log(`[Progressive Workflow] Reserved 2 credits for iteration`);

      // Mark current approval as rejected
      await supabase
        .from("front_view_approvals")
        .update({
          status: "rejected",
          user_feedback: params.editFeedback || "User requested changes",
        })
        .eq("id", params.approvalId);

      // Build new prompt incorporating feedback
      const editPrompt = params.editFeedback
        ? `${approval.front_view_prompt}\n\nUser feedback: ${params.editFeedback}`
        : approval.front_view_prompt;

      // Generate new front view with generation mode for B&W sketch, etc.
      const frontViewPrompt = buildFrontViewPrompt(editPrompt, approval.front_view_url, undefined, {
        generationMode,
      });

      console.log(`[Progressive Workflow] Regenerating front view with edits using Pro model...`);

      const result = await geminiService.generateImage({
        prompt: frontViewPrompt,
        referenceImage: approval.front_view_url,
        view: "front",
        style: "photorealistic",
        options: {
          enhancePrompt: false,
          fallbackEnabled: true,
          retry: 5,
          model: "gemini-3-pro-image-preview", // Pro model with Flash fallback on 503/429/500 errors
        },
      });

      if (!result.url) {
        // Refund the iteration credits if generation failed
        await RefundCredits({
          credit: 3,
          reservationId: iterationCreditReservation.reservationId!,
        });
        throw new Error("Failed to regenerate front view: No image URL returned");
      }

      // Upload the new front view
      const imageService = ImageService.getInstance();
      const uploadResult = await imageService.upload(result.url, {
        projectId: approval.product_idea_id,
        preset: "original",
        preserveOriginal: true,
      });

      if (!uploadResult.success || !uploadResult.url) {
        // Refund the iteration credits if upload failed
        await RefundCredits({
          credit: 3,
          reservationId: iterationCreditReservation.reservationId!,
        });
        throw new Error(
          `Failed to upload edited front view: ${uploadResult.error || "Unknown error"}`
        );
      }

      const newFrontViewUrl = uploadResult.url;
      console.log(`[Progressive Workflow] New front view uploaded: ${newFrontViewUrl.substring(0, 100)}...`);
      console.log(`[Progressive Workflow] Credits already deducted via ReserveCredits: 2 credits`);

      // Create new approval record with incremented iteration number
      const newApprovalData = {
        user_id: user.id,
        product_idea_id: approval.product_idea_id,
        session_id: approval.session_id,
        front_view_url: newFrontViewUrl,
        front_view_prompt: frontViewPrompt,
        status: "pending",
        iteration_number: approval.iteration_number + 1,
        credits_reserved: 2, // 2 credits for regenerating front view
        credits_consumed: 2, // 2 credits already deducted for regenerated front view
        is_initial_generation: approval.is_initial_generation,
        user_feedback: params.editFeedback,
        created_at: new Date().toISOString(),
      };

      const { data: newApproval, error: insertError } = await supabase
        .from("front_view_approvals")
        .insert(newApprovalData)
        .select()
        .single();

      if (insertError || !newApproval) {
        // Refund the iteration credits if approval creation failed
        await RefundCredits({
          credit: 3,
          reservationId: iterationCreditReservation.reservationId!,
        });
        throw new Error(
          `Failed to create new approval record: ${insertError?.message || "Unknown error"}`
        );
      }

      console.log(`[Progressive Workflow] New approval record created (iteration ${newApproval.iteration_number}): ${newApproval.id}`);

      return {
        success: true,
        action: "regenerate",
        newFrontViewUrl,
        newApprovalId: newApproval.id,
      };
    }
  } catch (error) {
    console.error("[Progressive Workflow] Front view decision handling error:", error);
    return {
      success: false,
      action: "approved", // Default to avoid breaking calling code
      error:
        error instanceof Error ? error.message : "Failed to handle approval",
    };
  }
}

/**
 * STEP 3: Generate remaining views after front view approval
 *
 * This function generates the back, side, top, and bottom views based on the
 * approved front view. Uses the extracted features to ensure consistency.
 *
 * @param params - Approval ID and front view URL
 * @returns URLs for all remaining views
 */
export async function generateRemainingViews(
  params: GenerateRemainingViewsParams
): Promise<GenerateRemainingViewsResponse> {
  const logger = aiLogger.startOperation(
    "generateRemainingViews",
    "gemini-3-pro-image-preview",
    "gemini",
    "image_generation"
  );

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Input validation
    if (!params.approvalId || !params.frontViewUrl) {
      throw new Error("Approval ID and front view URL are required");
    }

    console.log(`[Progressive Workflow] Generating remaining views for approval ${params.approvalId}`);

    // Reserve 3 credits for generating the remaining 4 views (back, side, top, bottom)
    const creditsForRemainingViews = 3;
    const creditReservation = await ReserveCredits({ credit: creditsForRemainingViews });
    if (!creditReservation.success) {
      throw new Error(
        creditReservation.message || `Insufficient credits. Need ${creditsForRemainingViews} credits to generate remaining views.`
      );
    }
    console.log(`[Progressive Workflow] Reserved ${creditsForRemainingViews} credits for remaining views`);

    // Get the approval record with extracted features
    const { data: approval, error: fetchError } = await supabase
      .from("front_view_approvals")
      .select("*")
      .eq("id", params.approvalId)
      .eq("user_id", user.id)
      .eq("status", "approved")
      .single();

    if (fetchError || !approval) {
      throw new Error("Approved front view not found or access denied");
    }

    const extractedFeatures = approval.extracted_features as ExtractedFeatures;

    // Fetch product metadata to get logo and generation_mode for remaining views
    const { data: product } = await supabase
      .from("product_ideas")
      .select("tech_pack, generation_mode")
      .eq("id", approval.product_id)
      .single();

    const metadata = product?.tech_pack?.metadata || {};
    const logoImage = metadata.logo || undefined;
    const generationMode = product?.generation_mode || 'regular';
    console.log(`[Progressive Workflow] Generation mode for remaining views: ${generationMode}`);

    console.log(`[Progressive Workflow] Logo for remaining views:`, {
      hasLogo: !!logoImage,
      logoLength: logoImage?.length || 0,
    });

    // Ensure features have the correct structure
    const safeFeatures: ExtractedFeatures = {
      colors: Array.isArray(extractedFeatures?.colors)
        ? extractedFeatures.colors
        : [],
      estimatedDimensions: extractedFeatures?.estimatedDimensions || {
        width: "unknown",
        height: "unknown",
      },
      materials: Array.isArray(extractedFeatures?.materials)
        ? extractedFeatures.materials
        : [],
      keyElements: Array.isArray(extractedFeatures?.keyElements)
        ? extractedFeatures.keyElements
        : [],
      description: extractedFeatures?.description || "",
    };

    logger.setContext({
      user_id: user.id,
      feature: "progressive_remaining_views_generation",
      session_id: approval.session_id,
    });

    console.log(`[Progressive Workflow] Using front view: ${params.frontViewUrl.substring(0, 100)}...`);
    console.log(`[Progressive Workflow] Extracted features:`, safeFeatures);
    console.log(`[Progressive Workflow] Received selectedRevisionNumber:`, params.selectedRevisionNumber, "type:", typeof params.selectedRevisionNumber);

    // Fetch previous revision images from database for structural consistency
    // Only fetch if a specific revision number was provided by the client
    let prevRevisions: { back?: string; side?: string; top?: string; bottom?: string } = {};

    if (params.selectedRevisionNumber !== undefined && params.selectedRevisionNumber !== null) {
      try {
        // Get views from the SELECTED revision number (not necessarily the latest/active one)
        const { data: previousRevisionViews, error: prevRevError } = await supabase
          .from("product_multiview_revisions")
          .select("view_type, image_url")
          .eq("product_idea_id", approval.product_idea_id)
          .eq("user_id", user.id)
          .eq("revision_number", params.selectedRevisionNumber)
          .in("view_type", ["back", "side", "top", "bottom"]);

        if (!prevRevError && previousRevisionViews && previousRevisionViews.length > 0) {
          // Map the views to our object
          for (const view of previousRevisionViews) {
            if (view.view_type === "back" && view.image_url) {
              prevRevisions.back = view.image_url;
            } else if (view.view_type === "side" && view.image_url) {
              prevRevisions.side = view.image_url;
            } else if (view.view_type === "top" && view.image_url) {
              prevRevisions.top = view.image_url;
            } else if (view.view_type === "bottom" && view.image_url) {
              prevRevisions.bottom = view.image_url;
            }
          }

          console.log(`[Progressive Workflow] Using selected revision ${params.selectedRevisionNumber} for structural reference:`, {
            hasBack: !!prevRevisions.back,
            hasSide: !!prevRevisions.side,
            hasTop: !!prevRevisions.top,
            hasBottom: !!prevRevisions.bottom,
          });
        } else {
          console.log(`[Progressive Workflow] Selected revision ${params.selectedRevisionNumber} not found, generating fresh views`);
        }
      } catch (prevRevFetchError) {
        console.warn(`[Progressive Workflow] Could not fetch selected revision images:`, prevRevFetchError);
        // Continue without previous revision images - this is non-critical
      }
    } else {
      console.log(`[Progressive Workflow] No revision selected, generating fresh views without structural reference`);
    }

    // STEP 1: Generate BACK VIEW first using Pro model (same as front for better consistency)
    console.log(`[Progressive Workflow] Step 1: Generating BACK view with Pro model (same as front)...`);
    console.log(`[Progressive Workflow] Logo will be ${logoImage ? 'INCLUDED' : 'NOT included'} in remaining views`);

    let backView: { url: string; prompt: string };
    try {
      backView = await generateBackView(
        params.frontViewUrl,
        safeFeatures,
        approval.product_idea_id,
        logoImage,
        generationMode,
        prevRevisions.back // Pass previous back view for consistency
      );
      console.log(`[Progressive Workflow] Back view generated successfully with Pro model`);
    } catch (backError) {
      console.error(`[Progressive Workflow] Failed to generate back view:`, backError);
      backView = { url: "", prompt: "Failed to generate back view" };
    }

    // STEP 2: Generate side, top, bottom views in parallel using BOTH front AND back as references
    console.log(`[Progressive Workflow] Step 2: Generating side, top, bottom views using front + back as references...`);

    const [sideViewResult, topViewResult, bottomViewResult] =
      await Promise.allSettled([
        generateSideView(params.frontViewUrl, safeFeatures, approval.product_idea_id, logoImage, backView.url, generationMode, prevRevisions.side),
        generateTopView(params.frontViewUrl, safeFeatures, approval.product_idea_id, logoImage, backView.url, generationMode, prevRevisions.top),
        generateBottomView(params.frontViewUrl, safeFeatures, approval.product_idea_id, logoImage, backView.url, generationMode, prevRevisions.bottom),
      ]);

    // Process results and handle failures
    const processResult = (result: PromiseSettledResult<{ url: string; prompt: string }>, viewName: string) => {
      if (result.status === "fulfilled") {
        console.log(`[Progressive Workflow] ${viewName} view generated successfully`);
        return result.value;
      } else {
        console.error(`[Progressive Workflow] Failed to generate ${viewName} view:`, result.reason);
        return {
          url: "",
          prompt: `Failed to generate ${viewName} view`,
        };
      }
    };

    const sideView = processResult(sideViewResult, "side");
    const topView = processResult(topViewResult, "top");
    const bottomView = processResult(bottomViewResult, "bottom");

    console.log(`[Progressive Workflow] Credits already deducted via ReserveCredits: ${creditsForRemainingViews} credits`);

    // Update approval record with additional views and update reserved/consumed credits
    const { error: updateError } = await supabase
      .from("front_view_approvals")
      .update({
        back_view_url: backView.url,
        back_view_prompt: backView.prompt,
        side_view_url: sideView.url,
        side_view_prompt: sideView.prompt,
        top_view_url: topView.url,
        top_view_prompt: topView.prompt,
        bottom_view_url: bottomView.url,
        bottom_view_prompt: bottomView.prompt,
        credits_reserved: approval.credits_reserved + creditsForRemainingViews, // Add remaining views credits
        credits_consumed: approval.credits_consumed + creditsForRemainingViews, // Track consumed credits
      })
      .eq("id", params.approvalId);

    if (updateError) {
      console.warn(`[Progressive Workflow] Failed to update approval with additional views:`, updateError);
      // Don't fail the whole operation
    }

    logger.setOutput({
      images: [backView.url, sideView.url, topView.url, bottomView.url].filter(Boolean),
      usage: {
        estimated_cost: 0.008, // 4 images
      },
    });

    await logger.complete();

    return {
      success: true,
      views: {
        back: backView.url,
        side: sideView.url,
        top: topView.url,
        bottom: bottomView.url,
      },
    };
  } catch (error) {
    console.error("[Progressive Workflow] Remaining views generation error:", error);
    logger.setError(error instanceof Error ? error : new Error(String(error)));
    await logger.complete();

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate remaining views",
    };
  }
}

/**
 * STEP 4: Create revision after all views are approved and generated
 *
 * This function creates the final revision record with all 5 views.
 * It also consumes the reserved credits and saves image upload records.
 *
 * For initial generation: Creates revision 0
 * For edits: Creates revision N+1
 *
 * @param params - Product ID, approval ID, all view URLs, and whether it's initial
 * @returns Revision number and batch ID
 */
export async function createRevisionAfterApproval(
  params: CreateRevisionAfterApprovalParams
): Promise<CreateRevisionAfterApprovalResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Input validation
    if (!params.productId || !params.approvalId || !params.allViews) {
      throw new Error("Product ID, approval ID, and all views are required");
    }

    if (
      !params.allViews.front ||
      !params.allViews.back ||
      !params.allViews.side ||
      !params.allViews.top ||
      !params.allViews.bottom
    ) {
      throw new Error("All 5 views (front, back, side, top, bottom) are required");
    }

    console.log(`[Progressive Workflow] Creating revision for product ${params.productId} after approval ${params.approvalId}`);

    // Get the approval record
    const { data: approval, error: fetchError } = await supabase
      .from("front_view_approvals")
      .select("*")
      .eq("id", params.approvalId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !approval) {
      throw new Error("Approval record not found or access denied");
    }

    // Credits have already been deducted incrementally:
    // - 2 credits when front view was generated
    // - 3 credits when remaining views were generated (back, side, top, bottom)
    // Total: 5 credits already deducted
    console.log(`[Progressive Workflow] Credits already deducted: ${approval.credits_consumed} out of ${approval.credits_reserved} reserved`);

    // Update approval record and mark as completed
    await supabase
      .from("front_view_approvals")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", params.approvalId);

    // Determine revision number
    let revisionNumber = 0;
    if (!params.isInitial) {
      // Get the highest revision number for this product
      const { data: existingRevisions } = await supabase
        .from("product_multiview_revisions")
        .select("revision_number")
        .eq("product_idea_id", params.productId)
        .order("revision_number", { ascending: false })
        .limit(1);

      if (existingRevisions && existingRevisions.length > 0) {
        revisionNumber = existingRevisions[0].revision_number + 1;
      } else {
        revisionNumber = 1;
      }
    }

    console.log(`[Progressive Workflow] Creating revision ${revisionNumber}`);

    // Generate batch ID
    const batchId = params.isInitial
      ? `initial_${params.productId}_${Date.now()}`
      : `revision_${revisionNumber}_${Date.now()}`;

    // Prepare revision records for each view
    const revisionRecords = [];

    const viewTypes: Array<"front" | "back" | "side" | "top" | "bottom"> = [
      "front",
      "back",
      "side",
      "top",
      "bottom",
    ];

    for (const viewType of viewTypes) {
      const imageUrl = params.allViews[viewType];

      if (!imageUrl) {
        console.warn(`[Progressive Workflow] Missing ${viewType} view URL, skipping`);
        continue;
      }

      revisionRecords.push({
        product_idea_id: params.productId,
        user_id: user.id,
        revision_number: revisionNumber,
        batch_id: batchId,
        view_type: viewType,
        image_url: imageUrl,
        thumbnail_url: imageUrl, // Use same URL for now
        edit_prompt: approval.front_view_prompt,
        edit_type: params.isInitial ? "initial" : "ai_edit",
        ai_model: "gemini-3-pro-image-preview",
        ai_parameters: {
          approval_id: params.approvalId,
          session_id: approval.session_id,
          iteration_number: approval.iteration_number,
          progressive_workflow: true,
        },
        is_active: true,
        front_view_approval_id: params.approvalId, // Link to approval record
        metadata: {
          progressive_workflow: true,
          approval_id: params.approvalId,
          iteration_count: approval.iteration_number,
          credits_used: approval.credits_consumed,
        },
      });
    }

    if (revisionRecords.length === 0) {
      throw new Error("No valid revision records to create");
    }

    console.log(`[Progressive Workflow] Inserting ${revisionRecords.length} revision records...`);

    // Deactivate previous active revisions
    await supabase
      .from("product_multiview_revisions")
      .update({ is_active: false })
      .eq("product_idea_id", params.productId)
      .eq("is_active", true);

    // Insert all revision records
    const { data: revisions, error: revisionError } = await supabase
      .from("product_multiview_revisions")
      .insert(revisionRecords)
      .select();

    if (revisionError) {
      console.error("[Progressive Workflow] Database insert error:", revisionError);
      throw new Error(`Failed to create revisions: ${revisionError.message}`);
    }

    if (!revisions || revisions.length === 0) {
      throw new Error("Database insert succeeded but no revisions returned");
    }

    console.log(`[Progressive Workflow] Created ${revisions.length} revision records`);

    // Also save to images_uploads table for compatibility
    try {
      const imageUploads = revisionRecords.map((record) => ({
        productIdeaId: record.product_idea_id,
        imageUrl: record.image_url,
        thumbnailUrl: record.thumbnail_url,
        uploadType: params.isInitial ? ("original" as const) : ("edited" as const),
        viewType: record.view_type as "front" | "back" | "side" | "top" | "bottom",
        fileName: `${record.view_type}_${params.isInitial ? 'initial' : `revision_${revisionNumber}`}_${Date.now()}.png`,
        metadata: {
          batchId: record.batch_id,
          revisionNumber,
          isInitial: params.isInitial,
          progressiveWorkflow: true,
          approvalId: params.approvalId,
        },
      }));

      const uploadResult = await saveImageUploadsBatch(imageUploads);
      if (!uploadResult.success) {
        console.warn("[Progressive Workflow] Failed to save to images_uploads table:", uploadResult.error);
        // Don't fail the whole operation
      } else {
        console.log(`[Progressive Workflow] Saved ${imageUploads.length} images to images_uploads table`);
      }
    } catch (error) {
      console.warn("[Progressive Workflow] Error saving to images_uploads table:", error);
      // Continue anyway - the main revision was created successfully
    }

    console.log(`[Progressive Workflow] Revision creation completed successfully`);

    return {
      success: true,
      revisionNumber,
      batchId,
      revisionIds: revisions.map((r: { id: string }) => r.id),
    };
  } catch (error) {
    console.error("[Progressive Workflow] Revision creation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create revision",
    };
  }
}

// ========== Helper Functions ==========

interface BuildFrontViewPromptOptions {
  logoPosition?: string;
  note?: string;
  toolType?: string;
  isSketch?: boolean;
  isReference?: boolean;
  isModel?: boolean; // Virtual try-on: show product on a person/model
  sketchImageUrl?: string;
  referenceImageUrl?: string;
  modelImageUrl?: string; // URL of the person/model image for virtual try-on
  // New AI-parsed fields
  colorModification?: {
    changeColor: boolean;
    targetColor?: string;
    colorHex?: string;
  };
  sizeModification?: {
    size: string;
    customSize?: string;
  };
  specialInstructions?: string;
  // Generation mode for different AI styles
  generationMode?: string; // 'regular' | 'black_and_white' | 'minimalist' | 'detailed'
}

/**
 * Build front view prompt with full support for logo position, notes, and image tool types
 */
function buildFrontViewPrompt(
  userPrompt: string,
  referenceImage?: string,
  logoImage?: string,
  options?: BuildFrontViewPromptOptions
): string {
  const basePrompt = buildProgressiveFrontViewPrompt(userPrompt, referenceImage, logoImage);

  // If no additional options, return base prompt
  if (!options) {
    return basePrompt;
  }

  const additionalInstructions: string[] = [];

  // Handle logo position with detailed placement instructions
  if (logoImage && options.logoPosition) {
    const positionInstructions = getLogoPositionInstructions(options.logoPosition);
    additionalInstructions.push(`\n📍 LOGO PLACEMENT REQUIREMENT:\n${positionInstructions}`);
  }

  // Handle user notes
  if (options.note) {
    additionalInstructions.push(`\n⚠️ SPECIAL USER INSTRUCTIONS:\n${options.note}`);
  }

  // Handle sketch upload
  if (options.isSketch && options.sketchImageUrl) {
    additionalInstructions.push(`
✏️ SKETCH-TO-DESIGN MODE:
- The attached reference image is a hand-drawn sketch/concept art
- Recreate this sketch as a polished, professional, production-ready design
- Maintain the core concept, composition, and artistic intent from the sketch
- Enhance the design quality while preserving the original creative vision
- Apply the finalized design professionally onto the product
`);
  }

  // Handle reference image upload
  if (options.isReference && options.referenceImageUrl) {
    additionalInstructions.push(`
🖼️ REFERENCE-INSPIRED DESIGN:
- The attached reference image is for INSPIRATION only - DO NOT copy directly
- Extract the style, aesthetic, color palette, mood, and design approach
- Create an ORIGINAL design inspired by the reference
- Ensure the final design has the same 'feel' while being unique
`);
  }

  // Handle model/virtual try-on upload
  if (options.isModel && options.modelImageUrl) {
    additionalInstructions.push(`
👤 VIRTUAL TRY-ON MODE:
- A person/model image has been uploaded by the user
- Your task is to show the EXISTING PRODUCT being WORN by this person
- DO NOT create a new product design - use the EXACT product from the reference image
- The product (from the reference) should be realistically placed ON the model/person
- Maintain the exact product design, colors, materials, and details
- Make the virtual try-on look natural and realistic
- Adjust the product's perspective to match the model's pose and body position
- Ensure proper lighting and shadows for a realistic composite
- The person should be clearly visible wearing the product
- This is about showing the SAME product on a different person, NOT designing a new product
`);
  }

  // Handle color modification (from AI parsing)
  if (options.colorModification?.changeColor && options.colorModification.targetColor) {
    const colorName = options.colorModification.targetColor.toUpperCase();
    const colorHex = options.colorModification.colorHex || '#FFFFFF';
    additionalInstructions.push(`
🎨 CRITICAL COLOR REQUIREMENT:
- The uploaded logo/image MUST be rendered in ${colorName} color (${colorHex})
- DO NOT use the original colors of the uploaded image
- Convert/transform the logo to ${colorName} while maintaining its shape and design
- The logo should appear as a ${colorName} version of itself on the product
- This is a MANDATORY color change - the logo must be ${colorName}, not its original color
`);
  }

  // Handle size modification (from AI parsing)
  if (options.sizeModification?.size) {
    const sizeInstructions: Record<string, string> = {
      'small': 'The logo should be SMALL and SUBTLE - approximately 5-10% of the product surface. Understated and minimalist.',
      'medium': 'The logo should be MEDIUM sized - approximately 15-25% of the product surface. Standard visibility.',
      'large': 'The logo should be LARGE and PROMINENT - approximately 30-40% of the product surface. Eye-catching and bold.',
      'extra-large': 'The logo should be EXTRA LARGE - approximately 50-70% of the product surface. Dominant design feature.',
    };
    const sizeInstruction = sizeInstructions[options.sizeModification.size] || sizeInstructions['medium'];
    additionalInstructions.push(`
📏 LOGO SIZE REQUIREMENT:
${sizeInstruction}
${options.sizeModification.customSize ? `Custom specification: ${options.sizeModification.customSize}` : ''}
`);
  }

  // Handle special instructions (from AI parsing)
  if (options.specialInstructions) {
    additionalInstructions.push(`
📝 ADDITIONAL AI-PARSED INSTRUCTIONS:
${options.specialInstructions}
`);
  }

  // Handle generation mode (B&W sketch, minimalist, etc.)
  if (options.generationMode && options.generationMode !== 'regular') {
    const modeInstructions: Record<string, string> = {
      'black_and_white': `
🎨 GENERATION STYLE: BLACK & WHITE SKETCH
- Generate this product as a BLACK AND WHITE technical sketch/illustration
- Use only grayscale tones - no colors whatsoever
- Apply a clean, professional hand-drawn sketch aesthetic
- Include subtle pencil-like shading and line work
- The result should look like a high-quality fashion illustration or technical drawing
- Maintain clear product details and form definition
- White or light gray background preferred
- This should resemble a professional designer's sketch`,
      'minimalist': `
🎨 GENERATION STYLE: MINIMALIST
- Generate with a minimalist, clean aesthetic
- Use limited color palette (2-3 colors maximum)
- Simple, uncluttered composition
- Focus on essential design elements only
- Clean lines and shapes`,
      'detailed': `
🎨 GENERATION STYLE: HIGHLY DETAILED
- Generate with maximum detail and realism
- Include intricate textures, stitching, and material details
- Show subtle variations in fabric/material
- Include realistic shadows and highlights
- Professional product photography quality`,
    };

    const modeInstruction = modeInstructions[options.generationMode];
    if (modeInstruction) {
      additionalInstructions.push(modeInstruction);
    }
  }

  // Combine base prompt with additional instructions
  if (additionalInstructions.length > 0) {
    return basePrompt + '\n' + additionalInstructions.join('\n');
  }

  return basePrompt;
}

/**
 * Get detailed position instructions for logo placement
 */
function getLogoPositionInstructions(position: string): string {
  const positionMap: Record<string, string> = {
    'front-left': `Place the logo on the FRONT of the product, on the LEFT side (left chest area for apparel).
This is typically the left chest pocket area. The logo should be clearly visible from a frontal view.`,

    'front-center': `Place the logo on the FRONT of the product, CENTERED horizontally in the middle of the chest area.
This is the most prominent position for maximum visibility.`,

    'front-right': `Place the logo on the FRONT of the product, on the RIGHT side (right chest area for apparel).
This is typically the right chest pocket area.`,

    'back-left': `Place the logo on the BACK of the product, positioned on the LEFT side (viewer's left when looking at the back).
Upper back left area, between the left shoulder and spine.`,

    'back-center': `Place the logo on the BACK of the product, CENTERED horizontally between the shoulder blades.
This is the most common back placement for larger logos.`,

    'back-right': `Place the logo on the BACK of the product, positioned on the RIGHT side (viewer's right when looking at the back).
Upper back right area, between the right shoulder and spine.`,

    'side-left': `Place the logo on the LEFT SIDE/SLEEVE of the product.
For apparel, this means the left sleeve. For other products, the left side panel.`,

    'side-right': `Place the logo on the RIGHT SIDE/SLEEVE of the product.
For apparel, this means the right sleeve. For other products, the right side panel.`,

    'top': `Place the logo at the TOP area of the product.
For apparel, near the neckline or collar. For other products, the top surface or edge.`,

    'bottom': `Place the logo at the BOTTOM area of the product.
For apparel, near the hem. For other products, the bottom surface or edge.`,

    'custom': `Follow the user's specific instructions for logo placement as provided in their notes.`,
  };

  const instruction = positionMap[position] || positionMap['front-center'];
  return `${instruction}
CRITICAL: The logo MUST appear at this exact position. Do NOT place it elsewhere unless specifically instructed.`;
}

/**
 * Extract features from approved front view using OpenAI Vision
 */
async function extractFeaturesFromImage(
  imageUrl: string
): Promise<ExtractedFeatures> {
  const openai = getOpenAIClient();

  const systemPrompt = `You are an expert at analyzing product images and extracting key features for manufacturing consistency.

Analyze the product image and extract:
1. All visible colors with hex codes
2. Materials and textures
3. Key design elements
4. Estimated dimensions/proportions
5. Detailed product description

Return the data in JSON format.`;

  try {
    console.log(`[Progressive Workflow] Extracting features from image...`);

    // Convert URL to base64 to avoid OpenAI download timeout issues
    let imageDataUrl = imageUrl;
    if (!imageUrl.startsWith("data:")) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = response.headers.get("content-type") || "image/jpeg";
      imageDataUrl = `data:${mimeType};base64,${base64}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all features from this product image for consistent view generation:",
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from feature extraction");
    }

    const features = JSON.parse(response);

    console.log(`[Progressive Workflow] Features extracted successfully`);

    // Ensure the structure matches our interface
    return {
      colors: features.colors || [],
      estimatedDimensions: features.dimensions || {
        width: "unknown",
        height: "unknown",
      },
      materials: features.materials || [],
      keyElements: features.keyElements || [],
      description: features.description || "",
    };
  } catch (error) {
    console.error("[Progressive Workflow] Feature extraction error:", error);
    // Return default features if extraction fails
    return {
      colors: [],
      estimatedDimensions: { width: "unknown", height: "unknown" },
      materials: [],
      keyElements: [],
      description: "Product features could not be extracted",
    };
  }
}

/**
 * Get generation mode instructions for B&W sketch, minimalist, etc.
 */
function getGenerationModeInstructions(generationMode?: string): string {
  if (!generationMode || generationMode === 'regular') {
    return '';
  }

  const modeInstructions: Record<string, string> = {
    'black_and_white': `
🎨 GENERATION STYLE: BLACK & WHITE SKETCH
- Generate this view as a BLACK AND WHITE technical sketch/illustration
- Use only grayscale tones - no colors whatsoever
- Apply a clean, professional hand-drawn sketch aesthetic
- Include subtle pencil-like shading and line work
- The result should look like a high-quality fashion illustration or technical drawing
- Maintain clear product details and form definition
- White or light gray background preferred
- This should resemble a professional designer's sketch
- IGNORE any color references in the prompt - render everything in grayscale`,
    'minimalist': `
🎨 GENERATION STYLE: MINIMALIST
- Generate with a minimalist, clean aesthetic
- Use limited color palette (2-3 colors maximum)
- Simple, uncluttered composition
- Flat or subtle shading`,
    'detailed': `
🎨 GENERATION STYLE: HIGHLY DETAILED
- Generate with maximum detail and realism
- Show subtle variations in fabric/material
- Include realistic shadows and highlights
- Professional product photography quality`,
  };

  return modeInstructions[generationMode] || '';
}

/**
 * Generate back view using Pro model for better consistency with front view
 */
async function generateBackView(
  frontViewUrl: string,
  features: ExtractedFeatures,
  productId?: string,
  logoImage?: string,
  generationMode?: string,
  previousRevisionImage?: string
): Promise<{ url: string; prompt: string }> {
  const hasColors = features.colors && features.colors.length > 0;
  const colorList = hasColors
    ? features.colors.map((c) => `${c.name} (${c.hex})`).join(", ")
    : "Extract and maintain the exact colors from the front view image";

  // Add logo instructions for back view if logo exists
  const logoInstructions = logoImage
    ? `
LOGO PLACEMENT (BACK VIEW):
- If the logo appears on the front of the product, it should also appear on the back view where appropriate
- Position the logo naturally for the back view of this product type
- Maintain the same logo style and size as the front view
- Ensure the logo is clearly visible and legible
`
    : '';

  // Get generation mode instructions (B&W sketch, minimalist, etc.)
  const generationModeInstructions = getGenerationModeInstructions(generationMode);

  // Add previous revision instructions - STRUCTURAL reference only, NOT design source
  const previousRevisionInstructions = previousRevisionImage
    ? `
📐 PREVIOUS REVISION - STRUCTURAL REFERENCE ONLY:
A previous version of this back view is provided for STRUCTURAL reference only.
- Use it ONLY for: camera angle, product positioning, composition
- DO NOT copy colors, materials, or design from the previous revision
- ALL design details (colors, patterns, materials) MUST come from the FRONT VIEW reference above
- If the front view shows a RED product, this back view MUST be RED - regardless of previous revision color
`
    : '';

  const backViewPrompt = `
⚠️⚠️⚠️ IMAGE TRANSFORMATION TASK - NOT GENERATION ⚠️⚠️⚠️

You have been given a FRONT VIEW image of a product. Your task is to TRANSFORM this exact image to show the BACK VIEW.

🔴 CRITICAL: This is an IMAGE EDITING task, NOT a creative generation task.
- The reference image IS the product - do not reimagine it
- Every pixel of color, texture, and material MUST come from the reference image
- You are performing a 3D rotation transform of 180° on the existing product

${generationModeInstructions}

📷 THE REFERENCE IMAGE SHOWS:
${colorList !== "Extract and maintain the exact colors from the front view image" ? `- Main colors: ${colorList}` : "- Analyze the exact colors from the reference image"}
- Materials: ${features.materials && features.materials.length > 0 ? features.materials.join(", ") : "visible in the reference"}
- Key features: ${features.keyElements && features.keyElements.length > 0 ? features.keyElements.join(", ") : "visible in the reference"}

${previousRevisionInstructions}

🎯 YOUR TASK:
Take the EXACT product shown in the reference image and rotate it 180° to show the back.

MANDATORY - COPY EXACTLY FROM REFERENCE:
✓ EXACT same product shape - do not modify
✓ EXACT same colors - sample directly from the reference image
✓ EXACT same materials and textures - match the reference
✓ EXACT same size and proportions - do not resize
✓ EXACT same style level (photorealistic, toy, etc.) - match the reference
✓ EXACT same lighting quality - match the reference
${logoInstructions}

OUTPUT SPECIFICATIONS:
- Pure white background (#FFFFFF)
- 720 × 720 pixels
- Same lighting as reference
- 180° rotation (showing back)

⛔ FORBIDDEN:
- Creating a "similar" product - ONLY the EXACT product from reference
- Changing ANY colors
- Changing proportions or style
- Adding or removing features
- Using different materials

Your output MUST look like the reference image was photographed from behind.
`;

  const result = await geminiService.generateImage({
    prompt: backViewPrompt,
    referenceImage: frontViewUrl,
    previousRevisionImage: previousRevisionImage, // Pass previous revision for consistency
    logoImage: logoImage,
    view: "back",
    style: "photorealistic",
    options: {
      enhancePrompt: false,
      fallbackEnabled: true,
      retry: 5,
      model: "gemini-3-pro-image-preview", // Pro model with Flash fallback on 503/429/500 errors
    },
  });

  if (!result.url) {
    throw new Error("Failed to generate back view");
  }

  // Upload the image
  const imageService = ImageService.getInstance();
  const uploadResult = await imageService.upload(result.url, {
    projectId: productId,
    preset: "original",
    preserveOriginal: true,
  });

  if (!uploadResult.success || !uploadResult.url) {
    throw new Error(`Failed to upload back view: ${uploadResult.error || "Unknown error"}`);
  }

  return {
    url: uploadResult.url,
    prompt: backViewPrompt,
  };
}

/**
 * Generate side view using both front and back views as reference for better consistency
 */
async function generateSideView(
  frontViewUrl: string,
  features: ExtractedFeatures,
  productId?: string,
  logoImage?: string,
  backViewUrl?: string,
  generationMode?: string,
  previousRevisionImage?: string
): Promise<{ url: string; prompt: string }> {
  const hasColors = features.colors && features.colors.length > 0;
  const colorList = hasColors
    ? features.colors.map((c) => `${c.name} (${c.hex})`).join(", ")
    : "Extract and maintain the exact colors from the front view image";

  // Add logo instructions for side view if logo exists
  const logoInstructions = logoImage
    ? `
LOGO PLACEMENT (SIDE VIEW):
- If the logo appears on the product, show it in the side view where it would naturally be visible
- Position the logo naturally for this product type's side view
- Maintain the same logo style and size as other views
- Ensure the logo is clearly visible and legible where appropriate
`
    : '';

  // Get generation mode instructions (B&W sketch, minimalist, etc.)
  const generationModeInstructions = getGenerationModeInstructions(generationMode);

  // Add previous revision instructions - STRUCTURAL reference only, NOT design source
  const previousRevisionInstructions = previousRevisionImage
    ? `
📐 PREVIOUS REVISION - STRUCTURAL REFERENCE ONLY:
A previous version of this side view is provided for STRUCTURAL reference only.
- Use it ONLY for: camera angle, product positioning, composition
- DO NOT copy colors, materials, or design from the previous revision
- ALL design details (colors, patterns, materials) MUST come from the FRONT VIEW and BACK VIEW references
- If the front/back views show a RED product, this side view MUST be RED - regardless of previous revision color
`
    : '';

  const sideViewPrompt = `
⚠️⚠️⚠️ IMAGE TRANSFORMATION TASK - NOT GENERATION ⚠️⚠️⚠️

You have reference images of a product (FRONT and BACK views). Your task is to TRANSFORM these images to show the SIDE VIEW of the EXACT SAME product.

🔴 CRITICAL: This is an IMAGE EDITING task, NOT a creative generation task.
- The reference images ARE the product - do not reimagine it
- Every pixel of color, texture, and material MUST come from the reference images
- You are performing a 3D rotation transform of 90° on the existing product

${generationModeInstructions}

📷 ANALYZE THE REFERENCE IMAGES FOR:
${colorList !== "Extract and maintain the exact colors from the front view image" ? `- Main colors: ${colorList}` : "- EXACT colors from the front/back reference images"}
- Body/main color: Sample DIRECTLY from reference images
- Trim/accent colors: Sample DIRECTLY from reference images
- Materials: ${features.materials && features.materials.length > 0 ? features.materials.join(", ") : "visible in the reference"}
- Key features: ${features.keyElements && features.keyElements.length > 0 ? features.keyElements.join(", ") : "visible in the reference"}

${previousRevisionInstructions}

🎯 YOUR TASK:
Take the EXACT product shown in the FRONT and BACK reference images and rotate it 90° to show the side profile.

MANDATORY - COPY EXACTLY FROM REFERENCES:
✓ EXACT same product shape - do not modify
✓ EXACT same colors - sample directly from the reference images (use color picker)
✓ EXACT same materials and textures - match the reference
✓ EXACT same size and proportions - do not resize
✓ EXACT same style level - match the reference
✓ EXACT same lighting quality - match the reference
✓ Wheels/feet/base IDENTICAL to front/back - same design, same color
✓ Handles/straps/accessories IDENTICAL to front/back
${logoInstructions}

OUTPUT SPECIFICATIONS:
- Pure white background (#FFFFFF)
- 720 × 720 pixels
- Same lighting as reference
- 90° side profile view

⛔ FORBIDDEN:
- Creating a "similar" product - ONLY the EXACT product from reference
- Changing ANY colors from what's shown in front/back
- Changing proportions or style
- Adding or removing features
- Using different materials
- Different hardware/accessories than shown in references

Your output MUST look like the exact same physical object from the reference images, just photographed from the side.
`;

  const result = await geminiService.generateImage({
    prompt: sideViewPrompt,
    referenceImage: frontViewUrl,
    additionalReferenceImage: backViewUrl, // Pass back view as second reference for better consistency
    previousRevisionImage: previousRevisionImage, // Pass previous revision for consistency
    logoImage: logoImage,
    view: "side",
    style: "photorealistic",
    options: {
      enhancePrompt: false,
      fallbackEnabled: true,
      retry: 5,
      model: "gemini-3-pro-image-preview", // Pro model for better consistency across all views
    },
  });

  if (!result.url) {
    throw new Error("Failed to generate side view");
  }

  // Upload the image
  const imageService = ImageService.getInstance();
  const uploadResult = await imageService.upload(result.url, {
    projectId: productId,
    preset: "original",
    preserveOriginal: true,
  });

  if (!uploadResult.success || !uploadResult.url) {
    throw new Error(`Failed to upload side view: ${uploadResult.error || "Unknown error"}`);
  }

  return {
    url: uploadResult.url,
    prompt: sideViewPrompt,
  };
}

/**
 * Generate top view using both front and back views as reference for better consistency
 */
async function generateTopView(
  frontViewUrl: string,
  features: ExtractedFeatures,
  productId?: string,
  logoImage?: string,
  backViewUrl?: string,
  generationMode?: string,
  previousRevisionImage?: string
): Promise<{ url: string; prompt: string }> {
  const hasColors = features.colors && features.colors.length > 0;
  const colorList = hasColors
    ? features.colors.map((c) => `${c.name} (${c.hex})`).join(", ")
    : "exact colors from the reference image";

  // Add logo instructions for top view if logo exists
  const logoInstructions = logoImage
    ? `
LOGO PLACEMENT (TOP VIEW):
- If the logo appears on the product, show it in the top view where it would naturally be visible
- Position the logo naturally for this product type's top view
- Maintain the same logo style and size as other views
- Ensure the logo is clearly visible and legible where appropriate
`
    : '';

  // Get generation mode instructions (B&W sketch, minimalist, etc.)
  const generationModeInstructions = getGenerationModeInstructions(generationMode);

  // Add previous revision instructions - STRUCTURAL reference only, NOT design source
  const previousRevisionInstructions = previousRevisionImage
    ? `
📐 PREVIOUS REVISION - STRUCTURAL REFERENCE ONLY:
A previous version of this top view is provided for STRUCTURAL reference only.
- Use it ONLY for: camera angle, product positioning, composition
- DO NOT copy colors, materials, or design from the previous revision
- ALL design details (colors, patterns, materials) MUST come from the FRONT VIEW and BACK VIEW references
- If the front/back views show a RED product, this top view MUST be RED - regardless of previous revision color
`
    : '';

  const topViewPrompt = `
⚠️⚠️⚠️ IMAGE TRANSFORMATION TASK - NOT GENERATION ⚠️⚠️⚠️

You have reference images of a product (FRONT and BACK views). Your task is to TRANSFORM these images to show the TOP VIEW (bird's eye) of the EXACT SAME product.

🔴 CRITICAL: This is an IMAGE EDITING task, NOT a creative generation task.
- The reference images ARE the product - do not reimagine it
- Every pixel of color, texture, and material MUST come from the reference images
- You are viewing the existing product from directly above

${generationModeInstructions}

📷 ANALYZE THE REFERENCE IMAGES FOR:
${colorList !== "exact colors from the reference image" ? `- Main colors: ${colorList}` : "- EXACT colors from the front/back reference images"}
- Top surface color: Sample DIRECTLY from reference images
- Trim/accent colors: Sample DIRECTLY from reference images
- Materials: ${features.materials && features.materials.length > 0 ? features.materials.join(", ") : "visible in the reference"}
- Key features: ${features.keyElements && features.keyElements.length > 0 ? features.keyElements.join(", ") : "visible in the reference"}

${previousRevisionInstructions}

🎯 YOUR TASK:
Take the EXACT product shown in the FRONT and BACK reference images and view it from directly above (bird's eye view).

MANDATORY - COPY EXACTLY FROM REFERENCES:
✓ EXACT same product shape - do not modify
✓ EXACT same colors - sample directly from the reference images (use color picker)
✓ EXACT same materials and textures - match the reference
✓ EXACT same size and proportions - do not resize
✓ EXACT same style level - match the reference
✓ EXACT same lighting quality - match the reference
✓ Top surface IDENTICAL color to body shown in front/back
✓ Any visible closures/zippers/straps - same style as front/back
✓ Handles/accessories position matches front/back
${logoInstructions}

OUTPUT SPECIFICATIONS:
- Pure white background (#FFFFFF)
- 720 × 720 pixels
- Same lighting as reference
- Directly overhead view (90° from above)

⛔ FORBIDDEN:
- Creating a "similar" product - ONLY the EXACT product from reference
- Changing ANY colors from what's shown in front/back
- Changing proportions or style
- Adding or removing features
- Using different materials
- Different hardware/accessories than shown in references

Your output MUST look like the exact same physical object from the reference images, just photographed from above.
`;

  const result = await geminiService.generateImage({
    prompt: topViewPrompt,
    referenceImage: frontViewUrl,
    additionalReferenceImage: backViewUrl, // Pass back view as second reference for better consistency
    previousRevisionImage: previousRevisionImage, // Pass previous revision for consistency
    logoImage: logoImage,
    view: "top",
    style: "photorealistic",
    options: {
      enhancePrompt: false,
      fallbackEnabled: true,
      retry: 5,
      model: "gemini-3-pro-image-preview", // Pro model for better consistency across all views
    },
  });

  if (!result.url) {
    throw new Error("Failed to generate top view");
  }

  // Upload the image
  const imageService = ImageService.getInstance();
  const uploadResult = await imageService.upload(result.url, {
    projectId: productId,
    preset: "original",
    preserveOriginal: true,
  });

  if (!uploadResult.success || !uploadResult.url) {
    throw new Error(`Failed to upload top view: ${uploadResult.error || "Unknown error"}`);
  }

  return {
    url: uploadResult.url,
    prompt: topViewPrompt,
  };
}

/**
 * Generate bottom view using both front and back views as reference for better consistency
 */
async function generateBottomView(
  frontViewUrl: string,
  features: ExtractedFeatures,
  productId?: string,
  logoImage?: string,
  backViewUrl?: string,
  generationMode?: string,
  previousRevisionImage?: string
): Promise<{ url: string; prompt: string }> {
  const hasColors = features.colors && features.colors.length > 0;
  const colorList = hasColors
    ? features.colors.map((c) => `${c.name} (${c.hex})`).join(", ")
    : "Extract and maintain the exact colors from the front view image";

  // Add logo instructions for bottom view if logo exists
  const logoInstructions = logoImage
    ? `
LOGO PLACEMENT (BOTTOM VIEW):
- If the logo appears on the product, show it in the bottom view where it would naturally be visible
- Position the logo naturally for this product type's bottom view
- Maintain the same logo style and size as other views
- Ensure the logo is clearly visible and legible where appropriate
`
    : '';

  // Get generation mode instructions (B&W sketch, minimalist, etc.)
  const generationModeInstructions = getGenerationModeInstructions(generationMode);

  // Add previous revision instructions - STRUCTURAL reference only, NOT design source
  const previousRevisionInstructions = previousRevisionImage
    ? `
📐 PREVIOUS REVISION - STRUCTURAL REFERENCE ONLY:
A previous version of this bottom view is provided for STRUCTURAL reference only.
- Use it ONLY for: camera angle, product positioning, composition
- DO NOT copy colors, materials, or design from the previous revision
- ALL design details (colors, patterns, materials) MUST come from the FRONT VIEW and BACK VIEW references
- If the front/back views show a RED product, this bottom view MUST be RED - regardless of previous revision color
`
    : '';

  const bottomViewPrompt = `
⚠️⚠️⚠️ IMAGE TRANSFORMATION TASK - NOT GENERATION ⚠️⚠️⚠️

You have reference images of a product (FRONT and BACK views). Your task is to TRANSFORM these images to show the BOTTOM VIEW (underside) of the EXACT SAME product.

🔴 CRITICAL: This is an IMAGE EDITING task, NOT a creative generation task.
- The reference images ARE the product - do not reimagine it
- Every pixel of color, texture, and material MUST come from the reference images
- You are viewing the existing product from directly below

${generationModeInstructions}

📷 ANALYZE THE REFERENCE IMAGES FOR:
${colorList !== "Extract and maintain the exact colors from the front view image" ? `- Main colors: ${colorList}` : "- EXACT colors from the front/back reference images"}
- Body color: Sample DIRECTLY from reference images
- Trim/accent colors: Sample DIRECTLY from reference images
- Materials: ${features.materials && features.materials.length > 0 ? features.materials.join(", ") : "visible in the reference"}
- Key features: ${features.keyElements && features.keyElements.length > 0 ? features.keyElements.join(", ") : "visible in the reference"}

${previousRevisionInstructions}

🎯 YOUR TASK:
Take the EXACT product shown in the FRONT and BACK reference images and view it from directly below (underside view).

MANDATORY - COPY EXACTLY FROM REFERENCES:
✓ EXACT same product shape - do not modify
✓ EXACT same colors - sample directly from the reference images (use color picker)
✓ EXACT same materials and textures - match the reference
✓ EXACT same size and proportions - do not resize
✓ EXACT same style level - match the reference
✓ EXACT same lighting quality - match the reference
✓ Bottom surface should match the body color from front/back
✓ If product has wheels/feet - IDENTICAL design to front/back
✓ Hardware visible from bottom matches front/back style
${logoInstructions}

OUTPUT SPECIFICATIONS:
- Pure white background (#FFFFFF)
- 720 × 720 pixels
- Same lighting as reference
- Directly underneath view (looking up at the product)

⛔ FORBIDDEN:
- Creating a "similar" product - ONLY the EXACT product from reference
- Changing ANY colors from what's shown in front/back
- Changing proportions or style
- Adding or removing features
- Using different materials
- Different hardware/accessories than shown in references

Your output MUST look like the exact same physical object from the reference images, just photographed from below.
`;

  const result = await geminiService.generateImage({
    prompt: bottomViewPrompt,
    referenceImage: frontViewUrl,
    additionalReferenceImage: backViewUrl, // Pass back view as second reference for better consistency
    previousRevisionImage: previousRevisionImage, // Pass previous revision for consistency
    logoImage: logoImage,
    view: "bottom",
    style: "photorealistic",
    options: {
      enhancePrompt: false,
      fallbackEnabled: true,
      retry: 5,
      model: "gemini-3-pro-image-preview", // Pro model for better consistency across all views
    },
  });

  if (!result.url) {
    throw new Error("Failed to generate bottom view");
  }

  // Upload the image
  const imageService = ImageService.getInstance();
  const uploadResult = await imageService.upload(result.url, {
    projectId: productId,
    preset: "original",
    preserveOriginal: true,
  });

  if (!uploadResult.success || !uploadResult.url) {
    throw new Error(`Failed to upload bottom view: ${uploadResult.error || "Unknown error"}`);
  }

  return {
    url: uploadResult.url,
    prompt: bottomViewPrompt,
  };
}

/**
 * Get pending front view approval for a product
 *
 * This function checks if there's a pending front view approval
 * for the given product. Used to restore state on page refresh.
 *
 * @param productId - Product ID to check
 * @returns Pending approval or null
 */
export async function getPendingFrontViewApproval(productId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    if (!productId) {
      return { success: false, error: "Product ID is required" };
    }

    const { data: pendingApproval, error } = await supabase
      .from("front_view_approvals")
      .select("*")
      .eq("product_idea_id", productId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No pending approval found is not an error
      if (error.code === "PGRST116") {
        return { success: true, approval: null };
      }
      console.error("[Progressive Workflow] Error fetching pending approval:", error);
      return { success: false, error: error.message };
    }

    return { success: true, approval: pendingApproval };
  } catch (error) {
    console.error("[Progressive Workflow] Error in getPendingFrontViewApproval:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all front view versions for a product
 *
 * Returns all front view approval records (approved, rejected, pending)
 * ordered by iteration number descending. Used for version history dropdown.
 *
 * @param productId - Product ID to fetch versions for
 * @returns Array of front view versions
 */
export async function getAllFrontViewVersions(productId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated", versions: [] };
    }

    if (!productId) {
      return { success: false, error: "Product ID is required", versions: [] };
    }

    const { data: versions, error } = await supabase
      .from("front_view_approvals")
      .select("id, front_view_url, iteration_number, created_at, status")
      .eq("product_idea_id", productId)
      .eq("user_id", user.id)
      .order("iteration_number", { ascending: false });

    if (error) {
      console.error("[Progressive Workflow] Error fetching front view versions:", error);
      return { success: false, error: error.message, versions: [] };
    }

    return {
      success: true,
      versions: versions || [],
    };
  } catch (error) {
    console.error("[Progressive Workflow] Error in getAllFrontViewVersions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      versions: [],
    };
  }
}

/**
 * VIRTUAL TRY-ON: Generate a single image showing the product on a model/person
 *
 * This function generates ONLY ONE image for virtual try-on purposes.
 * It does NOT create revisions or update product views - the result is only shown in chat.
 *
 * @param params - Parameters for virtual try-on generation
 * @returns Single try-on image URL
 */
export interface GenerateVirtualTryOnParams {
  productId: string;
  userPrompt: string;
  modelImageUrl: string; // The person/model image uploaded by user
  productImageUrl: string; // The current product front view
}

export interface GenerateVirtualTryOnResponse {
  success: boolean;
  tryOnImageUrl?: string;
  creditsUsed?: number;
  error?: string;
}

export async function generateVirtualTryOn(
  params: GenerateVirtualTryOnParams
): Promise<GenerateVirtualTryOnResponse> {
  const logger = aiLogger.startOperation(
    "generateVirtualTryOn",
    "gemini-3-pro-image-preview", // Pro model with Flash fallback on 503/429/500 errors
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
    if (!params.productId || !params.modelImageUrl || !params.productImageUrl) {
      throw new Error("Product ID, model image URL, and product image URL are required");
    }

    console.log(`[Virtual Try-On] Starting generation for product ${params.productId}`);
    console.log(`[Virtual Try-On] Model image: ${params.modelImageUrl.substring(0, 50)}...`);
    console.log(`[Virtual Try-On] Product image: ${params.productImageUrl.substring(0, 50)}...`);

    // Reserve 1 credit for virtual try-on (1 credit per image)
    const creditsToReserve = 1;
    const creditReservation = await ReserveCredits({ credit: creditsToReserve });
    if (!creditReservation.success) {
      throw new Error(
        creditReservation.message || `Insufficient credits. Need ${creditsToReserve} credits for virtual try-on.`
      );
    }
    reservationId = creditReservation.reservationId;
    console.log(`[Virtual Try-On] Reserved ${creditsToReserve} credits (reservation ID: ${reservationId})`);

    // Build the virtual try-on prompt
    const tryOnPrompt = `
👤 VIRTUAL TRY-ON - SHOW PRODUCT ON MODEL

CRITICAL INSTRUCTIONS:
You are provided with TWO images:
1. PRODUCT IMAGE (reference): The exact product design that needs to be shown
2. MODEL IMAGE (additional reference): The person who should be wearing the product

YOUR TASK:
- Show the EXACT product from the product image being WORN by the person in the model image
- DO NOT create a new product design - use the EXACT product as shown in the reference
- The product must maintain ALL its original details: colors, materials, patterns, logos, textures, etc.
- Make the virtual try-on look natural and realistic
- Adjust the product's perspective to match the model's pose and body position
- Ensure proper lighting and shadows for a realistic composite
- The person should be clearly visible wearing the product
- This is about showing the SAME product on a different person, NOT designing a new product

PRODUCT PRESERVATION REQUIREMENTS:
- Every color must match the product image exactly
- Every logo, pattern, or graphic must appear exactly as in the product image
- Every texture, material, and finish must be preserved
- The product's proportions and design elements must remain unchanged
- Only adjust perspective/angle to fit the model's pose naturally

USER REQUEST: ${params.userPrompt || "Show the product on this person"}

OUTPUT:
- A single realistic image showing the model/person wearing the exact product
- The background should be clean and professional
- Focus on showcasing both the product and how it looks on the person
`;

    logger.setInput({
      prompt: tryOnPrompt,
      parameters: {
        style: "photorealistic",
        temperature: 0.1,
      },
      metadata: {
        productId: params.productId,
        isVirtualTryOn: true,
      },
    });

    logger.setContext({
      user_id: user.id,
      feature: "virtual_try_on",
    });

    // Generate the virtual try-on image
    // Product image is the reference, model image is the additional reference
    console.log(`[Virtual Try-On] Generating try-on image with Gemini Pro model...`);
    const result = await geminiService.generateImage({
      prompt: tryOnPrompt,
      referenceImage: params.productImageUrl, // Product is the main reference
      additionalReferenceImage: params.modelImageUrl, // Model is the additional reference
      view: "front",
      style: "photorealistic",
      options: {
        enhancePrompt: false,
        fallbackEnabled: true,
        retry: 5,
        model: "gemini-3-pro-image-preview", // Pro model with Flash fallback on 503/429/500 errors
      },
    });

    if (!result.url) {
      throw new Error("Failed to generate virtual try-on: No image URL returned");
    }

    // Upload the image
    console.log(`[Virtual Try-On] Uploading try-on image to storage...`);
    const imageService = ImageService.getInstance();
    const uploadResult = await imageService.upload(result.url, {
      projectId: params.productId,
      preset: "original",
      preserveOriginal: true,
    });

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(
        `Failed to upload try-on image: ${uploadResult.error || "Unknown error"}`
      );
    }

    const uploadedUrl = uploadResult.url;
    console.log(`[Virtual Try-On] Try-on image uploaded successfully: ${uploadedUrl.substring(0, 100)}...`);

    // Log success
    logger.setOutput({
      images: [uploadedUrl],
      usage: {
        estimated_cost: 0.002,
      },
    });

    await logger.complete();

    console.log(`[Virtual Try-On] Generation completed successfully`);

    return {
      success: true,
      tryOnImageUrl: uploadedUrl,
      creditsUsed: creditsToReserve,
    };
  } catch (error) {
    console.error("[Virtual Try-On] Generation error:", error);
    logger.setError(error instanceof Error ? error : new Error(String(error)));
    await logger.complete();

    // Refund credits if generation failed
    if (reservationId) {
      try {
        await RefundCredits({ credit: 1, reservationId });
        console.log(`[Virtual Try-On] Refunded 1 credit due to failure`);
      } catch (refundError) {
        console.error("[Virtual Try-On] Failed to refund credits:", refundError);
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate virtual try-on",
    };
  }
}

// ============================================================================
// CONVERT TO REGULAR MODE (B&W Sketch to Full Color)
// ============================================================================

export interface ConvertToRegularModeParams {
  productId: string;
}

export interface ConvertToRegularModeResponse {
  success: boolean;
  error?: string;
}

/**
 * Convert a B&W sketch product to regular (full-color) mode
 * This updates the generation_mode and triggers a new front view generation
 */
export async function convertToRegularMode(
  params: ConvertToRegularModeParams
): Promise<ConvertToRegularModeResponse> {
  const supabase = await createClient();

  console.log(`[Convert to Regular] Starting conversion for product: ${params.productId}`);

  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Update the generation_mode to 'regular'
    const { error: updateError } = await supabase
      .from("product_ideas")
      .update({ generation_mode: "regular" })
      .eq("id", params.productId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[Convert to Regular] Update error:", updateError);
      return { success: false, error: "Failed to update generation mode" };
    }

    console.log(`[Convert to Regular] Successfully updated generation_mode to 'regular'`);

    return { success: true };
  } catch (error) {
    console.error("[Convert to Regular] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to convert to regular mode",
    };
  }
}
