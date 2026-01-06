"use server";

import { createClient } from "@/lib/supabase/server";
import { aiLogger } from "@/lib/logging/ai-logger";
import {
  generateFrontViewOnly,
  handleFrontViewDecision,
} from "@/app/actions/progressive-generation-workflow";

export interface EditImageParams {
  productId: string;
  viewType: "front" | "back" | "side" | "bottom" | "illustration";
  currentImageUrl: string;
  editPrompt: string;
  userId?: string;
}

export interface EditImageResponse {
  success: boolean;
  url?: string;
  revisionId?: string;
  error?: string;
}

/**
 * Apply AI edits to a product image using the revision service
 */
export async function applyAIImageEdit({
  productId,
  viewType,
  currentImageUrl,
  editPrompt,
}: EditImageParams): Promise<EditImageResponse> {
  const logger = aiLogger.startOperation(
    "applyAIImageEdit",
    "gemini-2.5-flash-image-preview",
    "gemini",
    "image_generation" // Changed from "image_editing" to match available types
  );

  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Log input
    logger.setInput({
      prompt: editPrompt,
      image_url: currentImageUrl,
      metadata: {
        productId,
        viewType,
      }
    });

    logger.setContext({
      user_id: user.id,
      feature: "ai_image_editor",
    });

    console.log(`Applying AI edit to ${viewType} view:`, editPrompt);

    // IMPORTANT: Progressive workflow only supports editing front view + regenerating all views
    // For editing individual views (back, side, bottom, illustration), we need different logic
    //
    // Current approach for non-front views:
    // 1. If editing front view: Use Progressive workflow (edit front → regenerate all)
    // 2. If editing other views: This would require a different implementation
    //    (Progressive workflow doesn't support selective view regeneration)
    //
    // For now, only front view editing is fully supported

    const cleanEditPrompt = editPrompt.trim();
    let uploadedUrl: string;
    let revisionId: string | undefined;

    if (viewType === "front") {
      // Step 1: Generate edited front view using Progressive workflow
      const frontResult = await generateFrontViewOnly({
        productId: productId,
        userPrompt: cleanEditPrompt,
        previousFrontViewUrl: currentImageUrl,
        isEdit: true,
      });

      if (!frontResult.success || !frontResult.frontViewUrl || !frontResult.approvalId) {
        throw new Error(frontResult.error || "Failed to generate edited front view");
      }

      uploadedUrl = frontResult.frontViewUrl;

      // Step 2: Auto-approve the edit
      const approvalResult = await handleFrontViewDecision({
        approvalId: frontResult.approvalId,
        action: "approve",
      });

      if (!approvalResult.success) {
        throw new Error(approvalResult.error || "Failed to approve edited front view");
      }

      // Note: Remaining views can be regenerated separately if needed
      // For now, just return the edited front view
      revisionId = frontResult.approvalId; // Use approval ID as revision ID
    } else {
      // TODO: Implement editing for other views
      // Progressive workflow doesn't support selective view editing
      // Options:
      // 1. Use Gemini directly (bypassing workflow)
      // 2. Extend Progressive workflow to support individual view editing
      // 3. Always regenerate all views when editing any single view
      throw new Error(
        `Editing ${viewType} view is not yet supported. Progressive workflow only supports front view editing. ` +
        `To edit other views, please edit the front view and regenerate all views.`
      );
    }

    // Log success
    logger.setOutput({
      content: `Successfully edited ${viewType} view`,
      raw_response: {
        revisionId: revisionId,
        imageUrl: uploadedUrl,
        viewType: viewType,
        workflow: "progressive",
      }
    });

    await logger.complete();

    return {
      success: true,
      url: uploadedUrl,
      revisionId: revisionId,
    };
  } catch (error: any) {
    console.error("AI image edit error:", error);
    logger.setError(error);
    await logger.complete();

    return {
      success: false,
      error: error.message || "Failed to apply image edit",
    };
  }
}

/**
 * Get all revisions for a product's images
 */
export async function getProductImageRevisions(
  productId: string,
  viewType?: string
) {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from("product_multiview_revisions")
      .select("*")
      .eq("product_idea_id", productId)
      .order("created_at", { ascending: false });

    if (viewType) {
      query = query.eq("view_type", viewType);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    console.log(`Raw revisions data from DB:`, data);

    // Group by view type
    const groupedRevisions = data.reduce((acc: any, revision: any) => {
      if (!acc[revision.view_type]) {
        acc[revision.view_type] = [];
      }
      acc[revision.view_type].push({
        id: revision.id,
        revisionNumber: revision.revision_number,
        imageUrl: revision.image_url,
        thumbnailUrl: revision.thumbnail_url,
        editPrompt: revision.edit_prompt,
        editType: revision.edit_type,
        createdAt: revision.created_at,
        isActive: revision.is_active,
        metadata: revision.metadata,
      });
      return acc;
    }, {});
    
    console.log(`Grouped revisions by view type:`, groupedRevisions);

    return {
      success: true,
      revisions: groupedRevisions,
    };
  } catch (error: any) {
    console.error("Error fetching revisions:", error);
    return {
      success: false,
      error: error.message,
      revisions: {},
    };
  }
}

/**
 * Set a specific revision as active
 */
export async function setActiveRevision(
  revisionId: string,
  productId: string,
  viewType: string
) {
  try {
    const supabase = await createClient();
    
    // First, deactivate all revisions for this view
    await supabase
      .from("product_multiview_revisions")
      .update({ is_active: false })
      .eq("product_idea_id", productId)
      .eq("view_type", viewType);

    // Then activate the selected revision
    const { data, error } = await supabase
      .from("product_multiview_revisions")
      .update({ is_active: true })
      .eq("id", revisionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update the main product_ideas table with the new active image
    await supabase
      .from("product_ideas")
      .update({
        [`image_data.${viewType}.url`]: data.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    return {
      success: true,
      revision: data,
    };
  } catch (error: any) {
    console.error("Error setting active revision:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Save initial images as first revisions
 */
export async function saveInitialRevisions(
  productId: string,
  images: Record<string, { url: string }>
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Import saveImageUpload function
    const { saveImageUpload } = await import("./image-uploads");
    const batchId = `initial-${Date.now()}`;

    const revisions = [];
    for (const [viewType, image] of Object.entries(images)) {
      if (!image?.url) continue;

      // Save to images_uploads table
      try {
        // Extract file name from URL
        const urlParts = image.url.split('/');
        const fileName = urlParts[urlParts.length - 1] || `${viewType}-initial-${Date.now()}.png`;

        await saveImageUpload({
          productIdeaId: productId,
          imageUrl: image.url,
          thumbnailUrl: image.url, // Use same URL for initial
          uploadType: 'original', // Changed from 'generated' to 'original'
          viewType: viewType as 'front' | 'back' | 'side' | 'top' | 'bottom',
          fileName: fileName,
          metadata: {
            batchId,
            revisionNumber: 1,
            isOriginal: true,
            source: 'ai-image-edit-initial'
          }
        });
        console.log(`Saved ${viewType} initial image to images_uploads`);
      } catch (uploadError) {
        console.error(`Failed to save ${viewType} to images_uploads:`, uploadError);
        // Continue even if images_uploads fails
      }

      revisions.push({
        product_idea_id: productId,
        user_id: user.id,
        revision_number: 1,
        view_type: viewType,
        image_url: image.url,
        edit_type: "initial",
        is_active: true,
        ai_model: "gemini-2.5-flash-image-preview",
      });
    }

    const { error } = await supabase
      .from("product_multiview_revisions")
      .insert(revisions);

    if (error) {
      throw error;
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
