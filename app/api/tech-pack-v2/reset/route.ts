/**
 * Tech Pack V2 - Reset API Route
 * DELETE /api/tech-pack-v2/reset
 * Deletes all tech files for a product/revision to allow regeneration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, revisionIds } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: productId',
        },
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

    console.log('[Reset Tech Files] Starting reset for:', {
      productId,
      revisionIds,
      userId: user.id,
    });

    // Delete tech files for this product
    // If revisionIds are provided, only delete files for those specific revisions
    let deleteQuery = supabase
      .from('tech_files')
      .delete()
      .eq('product_idea_id', productId)
      .eq('user_id', user.id);

    if (revisionIds && revisionIds.length > 0) {
      deleteQuery = deleteQuery.in('revision_id', revisionIds);
    }

    const { error: deleteError, count: deletedCount } = await deleteQuery;

    if (deleteError) {
      console.error('[Reset Tech Files] Failed to delete tech files:', deleteError);
      throw new Error('Failed to delete tech files');
    }

    console.log('[Reset Tech Files] Deleted files count:', deletedCount);

    // Also delete related collection items and collections
    if (revisionIds && revisionIds.length > 0) {
      // Delete collection items for collections matching these revisions
      const { data: collections } = await supabase
        .from('tech_file_collections')
        .select('id')
        .eq('product_idea_id', productId)
        .eq('user_id', user.id)
        .in('revision_id', revisionIds);

      if (collections && collections.length > 0) {
        const collectionIds = collections.map(c => c.id);

        // Delete collection items
        await supabase
          .from('tech_file_collection_items')
          .delete()
          .in('collection_id', collectionIds);

        // Delete the collections themselves
        await supabase
          .from('tech_file_collections')
          .delete()
          .in('id', collectionIds);

        console.log('[Reset Tech Files] Deleted collections:', collectionIds.length);
      }
    } else {
      // Delete all collections for this product
      const { data: collections } = await supabase
        .from('tech_file_collections')
        .select('id')
        .eq('product_idea_id', productId)
        .eq('user_id', user.id);

      if (collections && collections.length > 0) {
        const collectionIds = collections.map(c => c.id);

        await supabase
          .from('tech_file_collection_items')
          .delete()
          .in('collection_id', collectionIds);

        await supabase
          .from('tech_file_collections')
          .delete()
          .in('id', collectionIds);

        console.log('[Reset Tech Files] Deleted all collections for product');
      }
    }

    // Delete from revision_vision_analysis table as well for backwards compatibility
    if (revisionIds && revisionIds.length > 0) {
      const { error: visionError } = await supabase
        .from('revision_vision_analysis')
        .delete()
        .in('revision_id', revisionIds)
        .eq('user_id', user.id);

      if (visionError) {
        console.warn('[Reset Tech Files] Failed to delete revision_vision_analysis:', visionError);
        // Don't throw - legacy table deletion is optional
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Factory specs have been reset successfully',
      deletedCount,
    });
  } catch (error) {
    console.error('[Reset Tech Files] API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset factory specs',
      },
      { status: 500 }
    );
  }
}
