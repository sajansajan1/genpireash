"use server";

import { createClient } from "@/lib/supabase/server";

export interface SaveUserUploadParams {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
}

/**
 * Save user upload record to database
 */
export async function saveUserUpload(params: SaveUserUploadParams) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: "User not authenticated" };
        }

        // Insert upload record
        const { data, error } = await supabase
            .from("creator_media_uploads")
            .insert({
                user_id: user.id,
                file_url: params.fileUrl,
                file_name: params.fileName,
                file_size: params.fileSize,
                mime_type: params.mimeType,
                width: params.width,
                height: params.height,
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving user upload:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("Error in saveUserUpload:", error);
        return { success: false, error: error.message || "Failed to save upload" };
    }
}

/**
 * Get user's uploaded images
 */
export async function getUserUploads() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: "User not authenticated" };
        }

        const { data, error } = await supabase
            .from("creator_media_uploads")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching user uploads:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("Error in getUserUploads:", error);
        return { success: false, error: error.message || "Failed to fetch uploads" };
    }
}
