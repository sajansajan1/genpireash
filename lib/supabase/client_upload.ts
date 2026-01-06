import { supabase } from "./client";


/**
 * Uploads a PDF file directly to Supabase storage from the client side.
 * This bypasses Next.js server payload limits.
 * 
 * @param file The PDF file to upload
 * @returns The public URL of the uploaded file, or null if upload fails
 */
export const uploadPdfClient = async (file: File): Promise<string | null> => {
    try {

        // Get current user for folder structure
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Auth error:", userError);
            return null;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        // Use user ID for folder organization, or 'anon' if not authenticated (though likely required)
        const filePath = `${user.id}/${fileName}`;

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
