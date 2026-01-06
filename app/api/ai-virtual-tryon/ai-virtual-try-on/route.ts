import { ImageEditor } from "@/app/actions/ai-virtual-tryon";
import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface EditRequestBody {
  originalProduct: string;
  editPrompt: string;
  generationType: any;
  characterImage?: string | null;
  aspectRatio?: any;
  imageCount?: 1 | 3 | 6;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  try {
    const body: EditRequestBody = await request.json();
    const { originalProduct, editPrompt, generationType, characterImage, aspectRatio, imageCount } = body;
    const numberOfImages = imageCount || 6;
    console.log("body ==> ", body, "generating", numberOfImages, "images");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Skip originalProduct requirement when generationType is "Logo"
    if (generationType !== "Logo" && generationType !== "Print" && !originalProduct) {
      return NextResponse.json(
        { error: "Missing required field: 'originalProduct' is required unless generationType is 'Logo'." },
        { status: 400 }
      );
    }

    // editPrompt is always required
    if (!editPrompt) {
      return NextResponse.json(
        { error: "Missing required field: 'editPrompt' is required." },
        { status: 400 }
      );
    }

    console.log(`Starting image edit generation for URL: "${originalProduct}"`);
    if (characterImage) {
      console.log(`Using custom character image: "${characterImage}"`);
    }

    const editor = new ImageEditor();

    const editedImageVariations = await editor.generateImageVariations(
      originalProduct,
      editPrompt,
      generationType,
      numberOfImages,
      characterImage,
      aspectRatio
    );

    // Helper function to save image from data URL (base64) to Supabase
    const saveImageToSupabase = async (dataUrl: string, fileName: string): Promise<string> => {
      const cleanedBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanedBase64, "base64");
      const uploadedUrl = await uploadBufferToSupabase(buffer, fileName);
      if (!uploadedUrl) {
        throw new Error(`Failed to upload image: ${fileName}`);
      }
      return uploadedUrl;
    };

    // Helper function to sanitize filename for Supabase
    const sanitizeFilename = (name: string): string => {
      return name
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .toLowerCase();
    };

    // Loop through each generated image and save it to Supabase
    const timestamp = Date.now();
    const savedImages = [];
    for (let i = 0; i < editedImageVariations.length; i++) {
      const image = editedImageVariations[i];
      const sanitizedName = sanitizeFilename(image.name);
      const fileName = `tryon_${sanitizedName}_${timestamp}_${i}.png`;

      const uploadedUrl = await saveImageToSupabase(image.url, fileName);
      // Save image metadata to database
      const { data, error } = await supabase
        .from("try_on_history")
        .insert({
          user_id: user.id,
          url: uploadedUrl,
          name: image.name,
          style: image.style,
          prompt: editPrompt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) {
        console.error(`Error saving image metadata for index ${fileName}:`, error);
        throw error;
      }

      savedImages.push(data);
    }

    console.log(`Successfully generated and saved ${savedImages.length} edited image previews.`);

    // Return the array of saved image metadata
    return NextResponse.json(savedImages, { status: 200 });
  } catch (error) {
    console.error("Image editing generation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to generate edited images", details: errorMessage }, { status: 500 });
  }
}
