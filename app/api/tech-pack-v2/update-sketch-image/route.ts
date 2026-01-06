/**
 * Tech Pack V2 - Update Sketch Image API Route
 * POST /api/tech-pack-v2/update-sketch-image
 * Uploads an edited sketch image and updates the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadImage } from '@/lib/services/image-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sketchId, imageData, productId } = body;

    // Validate required fields
    if (!sketchId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: sketchId' },
        { status: 400 }
      );
    }

    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: imageData' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the sketch belongs to the user
    const { data: techFile, error: fetchError } = await supabase
      .from('tech_files')
      .select('id, product_idea_id, file_url, file_type, view_type')
      .eq('id', sketchId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !techFile) {
      console.error('Failed to fetch tech file:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Sketch not found or access denied' },
        { status: 404 }
      );
    }

    // Upload the new image
    const projectIdForUpload = productId || techFile.product_idea_id;

    const uploadResult = await uploadImage(imageData, {
      projectId: projectIdForUpload,
      preset: 'highQuality',
      generateThumbnail: true,
    });

    if (!uploadResult.success || !uploadResult.url) {
      console.error('Failed to upload edited image:', uploadResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Update the tech_files table with the new image URL
    const { error: updateError } = await supabase
      .from('tech_files')
      .update({
        file_url: uploadResult.url,
        thumbnail_url: uploadResult.thumbnailUrl || null,
        updated_at: new Date().toISOString(),
        metadata: supabase.rpc ? undefined : {
          edited: true,
          edited_at: new Date().toISOString(),
          original_url: techFile.file_url,
        },
      })
      .eq('id', sketchId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update tech_files:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update database' },
        { status: 500 }
      );
    }

    // Also update metadata separately to merge with existing
    const { data: currentFile } = await supabase
      .from('tech_files')
      .select('metadata')
      .eq('id', sketchId)
      .single();

    const updatedMetadata = {
      ...(currentFile?.metadata || {}),
      edited: true,
      edited_at: new Date().toISOString(),
      original_url: techFile.file_url,
      edit_history: [
        ...((currentFile?.metadata as any)?.edit_history || []),
        {
          timestamp: new Date().toISOString(),
          previous_url: techFile.file_url,
        },
      ],
    };

    await supabase
      .from('tech_files')
      .update({ metadata: updatedMetadata })
      .eq('id', sketchId)
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      data: {
        sketchId,
        newImageUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error('Update sketch image API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update sketch image',
      },
      { status: 500 }
    );
  }
}
