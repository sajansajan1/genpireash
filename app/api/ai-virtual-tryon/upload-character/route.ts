import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    console.log(`Uploading character image: ${file.name}, size: ${file.size} bytes`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename to remove special characters
    const sanitizeFilename = (name: string): string => {
      return name
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9.]/gi, '_') // Replace non-alphanumeric (except dots) with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .toLowerCase();
    };

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = sanitizeFilename(file.name);
    const fileName = `character_${user.id}_${timestamp}_${sanitizedName}`;

    // Upload to Supabase
    const uploadedUrl = await uploadBufferToSupabase(buffer, fileName);

    if (!uploadedUrl) {
      throw new Error("Failed to upload character image to Supabase");
    }

    console.log("Successfully uploaded character image:", uploadedUrl);

    return NextResponse.json({ url: uploadedUrl }, { status: 200 });
  } catch (error) {
    console.error("Character image upload error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to upload character image", details: errorMessage },
      { status: 500 }
    );
  }
}
