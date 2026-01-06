"use server";

import { createClient } from "@/lib/supabase/server";

export interface SaveImageUploadParams {
  productIdeaId: string;
  collectionId: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  uploadType: "original" | "edited" | "revision" | "thumbnail";
  viewType?: "front" | "back" | "side" | null;
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
export async function saveCollectionImageUpload(params: SaveImageUploadParams) {
  console.log("running saveCollectionImageUpload >>>>>>>>>>>>>");
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Insert image upload record
    const { data, error } = await supabase
      .from("collection_images_uploads")
      .insert({
        product_id: params.productIdeaId,
        collection_id: params.collectionId,
        user_id: user.id,
        image_url: params.imageUrl,
        thumbnail_url: params.thumbnailUrl,
        upload_type: params.uploadType,
        view_type: params.viewType,
        file_name: params.fileName,
        file_size: params.fileSize || 0,
        mime_type: params.mimeType || "image/png",
        width: params.width,
        height: params.height,
        metadata: params.metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving image upload:", error);
      return { success: false, error: error.message };
    }

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
  console.log("running saveImageUploadsBatch >>>>>>>>>>>>>");
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Prepare uploads with user_id
    const uploadsWithUser = uploads.map((upload) => ({
      product_id: upload.productIdeaId,
      collection_id: upload.collectionId,
      user_id: user.id,
      image_url: upload.imageUrl,
      thumbnail_url: upload.thumbnailUrl,
      upload_type: upload.uploadType,
      view_type: upload.viewType,
      file_name: upload.fileName,
      file_size: upload.fileSize || 0,
      mime_type: upload.mimeType || "image/png",
      width: upload.width,
      height: upload.height,
      metadata: upload.metadata || {},
    }));

    // Insert all uploads
    const { data, error } = await supabase.from("collection_images_uploads").insert(uploadsWithUser).select();

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
  uploadType?: "original" | "edited" | "revision" | "thumbnail"
) {
  console.log("running getImageUploads >>>>>>>>>>>>>");
  try {
    const supabase = await createClient();

    let query = supabase
      .from("collection_images_uploads")
      .select("*")
      .eq("product_id", productIdeaId)
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
