"use server";

import { imageService, IMAGE_PRESETS } from "@/lib/services/image-service";

/**
 * Server action to upload and optimize chat images
 * Handles logos, sketches, and reference images uploaded by users
 *
 * For logos (especially with transparent backgrounds), we use PNG format
 * to preserve transparency. Otherwise, standard JPEG optimization is used.
 */
export async function uploadChatImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;
    const toolType = formData.get("toolType") as string | null;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Only PNG and JPG images are allowed",
      };
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Image size must be less than 5MB",
      };
    }

    // Use logo preset for logos (preserves PNG transparency) or if file is PNG
    // This is important for logos with transparent backgrounds
    const isLogo = toolType === "logo";
    const isPng = file.type === "image/png";
    const preset = (isLogo || isPng) ? IMAGE_PRESETS.logo : IMAGE_PRESETS.standard;

    // Upload with optimization
    const result = await imageService.upload(file, {
      preset,
      projectId: productId || undefined,
      bucket: "fileuploads",
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Upload failed",
      };
    }

    return {
      success: true,
      url: result.url,
      metadata: result.metadata,
    };
  } catch (error) {
    console.error("Chat image upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
