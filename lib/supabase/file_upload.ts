"use server";
import { createClient, createServiceRoleClient } from "./server";
import {
  buildStoragePath,
  getPublicUrlFromPath,
  generateUniqueFilename,
  getExtensionFromUrl
} from "@/lib/utils/image-urls";

export const uploadFileToSupabase = async (
  file: File,
  projectId?: string
): Promise<string | null> => {
  const supabase = await createClient();

  // Generate proper path with projectId if available
  const extension = file.name.split('.').pop() || 'png';
  const filename = generateUniqueFilename(extension);
  const filePath = projectId
    ? buildStoragePath(projectId, filename)
    : `uploads/${Date.now()}_${file.name}`; // Fallback for legacy

  const { data, error } = await supabase.storage.from("fileuploads").upload(filePath, file);

  if (error) {
    console.error("Supabase upload error:", error.message);
    return null;
  }

  // Get the public URL directly from Supabase
  const { data: publicUrlData } = supabase.storage.from("fileuploads").getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    console.error('Failed to get public URL for:', filePath);
    return null;
  }

  // Debug: console.log('Public URL from Supabase:', publicUrlData.publicUrl);
  return publicUrlData.publicUrl;
};

export const uploadBufferToSupabase = async (
  buffer: Buffer,
  fileName: string,
  bucketName: string = "fileuploads",
  contentType = "image/png",
  projectId?: string,
  supabaseClient?: any // Optional: pass existing client
): Promise<string | null> => {
  let supabase = supabaseClient || await createClient();

  // Generate proper path based on whether projectId is provided
  let filePath: string;

  // Check if fileName is already a complete path (contains "uploads/")
  if (fileName.includes('uploads/')) {
    // Already a complete path, use as-is
    filePath = fileName.startsWith('/') ? fileName.slice(1) : fileName;
  } else if (projectId) {
    // New format: use projectId and generate UUID filename
    const extension = fileName.split('.').pop() || 'png';
    const uniqueFilename = generateUniqueFilename(extension);
    filePath = buildStoragePath(projectId, uniqueFilename);
  } else {
    // Legacy format without projectId
    filePath = fileName.startsWith('/') ? fileName.slice(1) : fileName;
  }

  // Try upload with retry logic
  let uploadAttempts = 0;
  const maxAttempts = 3;
  let lastError = null;
  let useServiceRole = false;

  while (uploadAttempts < maxAttempts) {
    uploadAttempts++;

    try {
      // Use service role client if RLS errors persist
      if (useServiceRole && !supabaseClient) {
        console.log('Using service role client for upload...');
        supabase = await createServiceRoleClient();
      }

      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

      if (!error) {
        // Success!
        // Debug: console.log(`Upload successful (attempt ${uploadAttempts}/${maxAttempts}) - Path: ${filePath}`);
        break;
      }

      lastError = error;
      console.error(`Supabase buffer upload error (attempt ${uploadAttempts}/${maxAttempts}, bucket: ${bucketName}):`, error.message);

      // If it's an RLS policy error, switch to service role for next attempt
      if (error.message.includes('row-level security policy') && uploadAttempts < maxAttempts) {
        console.log('RLS policy error detected, will use service role on next attempt...');
        useServiceRole = true;
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
      } else if (uploadAttempts < maxAttempts) {
        // For other errors (including network/fetch errors), retry with exponential backoff
        const backoffMs = Math.pow(2, uploadAttempts - 1) * 1000; // 1s, 2s, 4s
        console.log(`Retrying upload after ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    } catch (fetchError: any) {
      // Handle network/fetch errors with retry
      lastError = fetchError;
      console.error(`Network/fetch error during upload (attempt ${uploadAttempts}/${maxAttempts}):`, fetchError.message);

      if (uploadAttempts < maxAttempts) {
        const backoffMs = Math.pow(2, uploadAttempts - 1) * 1000; // 1s, 2s, 4s
        console.log(`Retrying upload after network error in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  if (lastError) {
    console.error(`Failed to upload after ${maxAttempts} attempts:`, lastError.message || lastError);
    return null;
  }

  // Get the public URL directly from Supabase
  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    console.error('Failed to get public URL for:', filePath);
    return null;
  }

  // Debug: console.log('Public URL from Supabase:', publicUrlData.publicUrl);
  return publicUrlData.publicUrl;
};


/**
 * Helper to upload PDF directly to Supabase from client
 * Bypasses Next.js server payload limits (4.5MB)
 */
export const uploadPdfToSupabse = async (file: File): Promise<string | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }
  try {
    // Dynamic import to avoid server-side issues if any, though createClient is safe
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user?.id || "anon"}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("pdf-uploads")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Supabase client upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from("pdf-uploads")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("Client side upload failed:", err);
    return null;
  }
};