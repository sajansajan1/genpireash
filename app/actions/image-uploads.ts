"use server";

import { createClient } from "@/lib/supabase/server";

export interface SaveImageUploadParams {
  productIdeaId: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  uploadType: 'original' | 'edited' | 'revision' | 'thumbnail';
  viewType?: 'front' | 'back' | 'side' | 'top' | 'bottom' | null;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  metadata?: any;
}

/**
 * Save image upload record to database
 */
export async function saveImageUpload(params: SaveImageUploadParams) {
  console.log("saveImageUpload called with params:", {
    productIdeaId: params.productIdeaId,
    uploadType: params.uploadType,
    viewType: params.viewType,
    fileName: params.fileName,
    imageUrl: params.imageUrl?.substring(0, 100) + "..."
  });

  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User authentication failed:", userError);
      return { success: false, error: "User not authenticated" };
    }

    console.log("User authenticated:", user.id);

    // Insert image upload record
    const insertData = {
      product_idea_id: params.productIdeaId,
      user_id: user.id,
      image_url: params.imageUrl,
      thumbnail_url: params.thumbnailUrl,
      upload_type: params.uploadType,
      view_type: params.viewType,
      file_name: params.fileName,
      file_size: params.fileSize || 0,
      mime_type: params.mimeType || 'image/png',
      width: params.width,
      height: params.height,
      metadata: params.metadata || {},
    };

    console.log("Inserting into images_uploads table...");

    const { data, error } = await supabase
      .from("images_uploads")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error saving image upload:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    console.log("Successfully saved to images_uploads:", {
      id: data.id,
      viewType: data.view_type,
      uploadType: data.upload_type
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Error in saveImageUpload:", error);
    return { success: false, error: error.message || "Failed to save image upload" };
  }
}

/**
 * Save multiple image uploads in batch
 */
export async function saveImageUploadsBatch(uploads: SaveImageUploadParams[]) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Prepare uploads with user_id
    const uploadsWithUser = uploads.map(upload => ({
      product_idea_id: upload.productIdeaId,
      user_id: user.id,
      image_url: upload.imageUrl,
      thumbnail_url: upload.thumbnailUrl,
      upload_type: upload.uploadType,
      view_type: upload.viewType,
      file_name: upload.fileName,
      file_size: upload.fileSize || 0,
      mime_type: upload.mimeType || 'image/png',
      width: upload.width,
      height: upload.height,
      metadata: upload.metadata || {},
    }));

    // Insert all uploads
    const { data, error } = await supabase
      .from("images_uploads")
      .insert(uploadsWithUser)
      .select();

    if (error) {
      console.error("Error saving image uploads batch:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Error in saveImageUploadsBatch:", error);
    return { success: false, error: error.message || "Failed to save image uploads" };
  }
}

/**
 * Get image uploads for a product
 */
export async function getImageUploads(
  productIdeaId: string,
  uploadType?: 'original' | 'edited' | 'revision' | 'thumbnail'
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("images_uploads")
      .select("*")
      .eq("product_idea_id", productIdeaId)
      .order("created_at", { ascending: false });

    if (uploadType) {
      query = query.eq("upload_type", uploadType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching image uploads:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Error in getImageUploads:", error);
    return { success: false, error: error.message || "Failed to fetch image uploads" };
  }
}
