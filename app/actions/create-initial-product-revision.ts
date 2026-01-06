"use server";

import { createClient } from "@/lib/supabase/server";
import { saveImageUploadsBatch } from "./image-uploads";

export interface InitialRevisionParams {
  productId: string;
  views: {
    front?: string | { url: string; [key: string]: any };
    back?: string | { url: string; [key: string]: any };
    side?: string | { url: string; [key: string]: any };
    bottom?: string | { url: string; [key: string]: any };
    illustration?: string | { url: string; [key: string]: any };
  };
  userPrompt: string;
  productName?: string;
}

/**
 * Create the initial revision (revision 0) when a new product is generated for the first time
 * Uses the product_multiview_revisions table
 */
export async function createInitialProductRevision({
  productId,
  views,
  userPrompt,
  productName = "Product"
}: InitialRevisionParams) {
  console.log("🎬 createInitialProductRevision CALLED with:", {
    productId,
    viewKeys: Object.keys(views),
    viewCount: Object.keys(views).length,
    userPrompt: userPrompt.substring(0, 100),
    productName
  });

  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated for initial revision:", authError);
      return { success: false, error: "User not authenticated" };
    }

    console.log(`✅ User authenticated: ${user.id}`);

    // Generate a batch ID for grouping all views of this initial revision
    const batchId = `initial_${productId}_${Date.now()}`;
    
    // Prepare revision records for each view
    const revisionRecords = [];

    console.log("📝 Processing views for revision records...");
    Object.entries(views).forEach(([viewType, imageData]) => {
      console.log(`  - Processing ${viewType}:`, {
        hasImageData: !!imageData,
        imageDataType: typeof imageData,
        imageDataKeys: imageData && typeof imageData === 'object' ? Object.keys(imageData) : 'N/A'
      });

      if (imageData) {
        // Extract URL from object if needed (handles both string and object with url property)
        let imageUrl: string;
        if (typeof imageData === 'string') {
          imageUrl = imageData;
          console.log(`    ✓ ${viewType}: URL is string (${imageUrl.substring(0, 50)}...)`);
        } else if (imageData && typeof imageData === 'object' && 'url' in imageData) {
          imageUrl = (imageData as any).url;
          console.log(`    ✓ ${viewType}: URL from object (${imageUrl.substring(0, 50)}...)`);
        } else {
          console.warn(`    ✗ ${viewType}: Invalid image data:`, imageData);
          return; // Skip this view
        }

        revisionRecords.push({
          product_idea_id: productId,
          user_id: user.id,
          revision_number: 0,
          batch_id: batchId,
          view_type: viewType,
          image_url: imageUrl,
          thumbnail_url: imageUrl, // For initial revision, use same URL as thumbnail
          edit_prompt: userPrompt,
          edit_type: "initial",
          ai_model: "gemini-2.5-flash-image-preview",
          ai_parameters: {
            initial_generation: true,
            prompt: userPrompt,
          },
          is_active: true, // Initial revision starts as active
          metadata: {
            productName,
            initial_generation: true,
            created_from: "product_creation",
          },
        });
        console.log(`    ✅ ${viewType}: Record prepared`);
      } else {
        console.log(`    ⏭️  ${viewType}: No image data, skipping`);
      }
    });

    console.log(`📦 Total revision records prepared: ${revisionRecords.length}`);

    // Check if we have records to insert
    if (revisionRecords.length === 0) {
      console.warn("⚠️ No revision records to insert - all views were empty or invalid");
      return {
        success: false,
        error: "No valid image data to create revisions"
      };
    }

    // Insert all revision records
    console.log(`💾 Attempting to insert ${revisionRecords.length} revision records into database...`);
    const { data: revisions, error: revisionError } = await supabase
      .from("product_multiview_revisions")
      .insert(revisionRecords)
      .select();

    if (revisionError) {
      console.error("❌ Database insert error:", {
        message: revisionError.message,
        code: revisionError.code,
        details: revisionError.details,
        hint: revisionError.hint,
      });
      return {
        success: false,
        error: revisionError.message
      };
    }

    if (!revisions || revisions.length === 0) {
      console.error("❌ No revisions returned from insert");
      return {
        success: false,
        error: "Database insert succeeded but no revisions returned"
      };
    }

    console.log("✅ Database insert successful, revisions created:", revisions.length);

    console.log("Initial revisions created successfully:", {
      revisionIds: revisions?.map(r => r.id),
      revisionNumber: 0,
      views: revisions?.map(r => r.view_type),
      batchId,
    });

    // Also save to images_uploads table for compatibility
    try {
      const imageUploads = revisionRecords.map(record => ({
        productIdeaId: record.product_idea_id,
        imageUrl: record.image_url,
        thumbnailUrl: record.thumbnail_url,
        uploadType: 'original' as const,
        viewType: record.view_type as 'front' | 'back' | 'side' | 'top' | 'bottom',
        fileName: `${record.view_type}_initial_${Date.now()}.png`,
        metadata: {
          batchId: record.batch_id,
          revisionNumber: 0,
          isInitial: true
        }
      }));

      const uploadResult = await saveImageUploadsBatch(imageUploads);
      if (!uploadResult.success) {
        console.warn("Failed to save to images_uploads table:", uploadResult.error);
        // Don't fail the whole operation if this secondary save fails
      } else {
        console.log("Images saved to images_uploads table");
      }
    } catch (error) {
      console.warn("Error saving to images_uploads table:", error);
      // Continue anyway - the main revision was created successfully
    }

    return {
      success: true,
      revisionId: revisions?.[0]?.id, // Return first revision ID for compatibility
      revisionNumber: 0,
      revisionIds: revisions?.map(r => r.id), // Return all IDs
      batchId,
    };
  } catch (error: any) {
    console.error("Error creating initial product revision:", error);
    return {
      success: false,
      error: error.message || "Failed to create initial revision",
    };
  }
}
