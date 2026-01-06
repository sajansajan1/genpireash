/**
 * Tech Pack V2 - Base View Analysis API Route
 * POST /api/tech-pack-v2/analyze-base-views
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeBaseView } from '@/api/tech-pack-v2/functions/base-view-analysis.function';
import { createClient } from '@/lib/supabase/server';
import { creditsManager } from '@/api/tech-pack-v2/utils/credits-manager';
import { TECH_PACK_CREDITS } from '@/api/tech-pack-v2/config/credits.config';
import type { ViewType } from '@/api/tech-pack-v2/types/tech-pack.types';

export async function POST(request: NextRequest) {
  let reservationId: string | undefined;
  const creditsToReserve = TECH_PACK_CREDITS.BASE_VIEWS;

  try {
    const body = await request.json();
    const { productId, revisionIds, category } = body;

    // Validate required fields
    if (!productId || !revisionIds || !Array.isArray(revisionIds) || revisionIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: productId and revisionIds (array)',
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
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Reserve credits upfront
    console.log(`[Base Views] Reserving ${creditsToReserve} credits for base views analysis`);
    const creditReservation = await creditsManager.reserveCredits(creditsToReserve);

    if (!creditReservation.success) {
      return NextResponse.json(
        {
          success: false,
          error: creditReservation.message || `Insufficient credits. Need ${creditsToReserve} credits for base views analysis.`,
        },
        { status: 402 }
      );
    }

    reservationId = creditReservation.reservationId;
    console.log(`[Base Views] Reserved ${creditsToReserve} credits (reservation ID: ${reservationId})`);

    // Fetch all revisions first
    const { data: allRevisions, error: fetchError } = await supabase
      .from('product_multiview_revisions')
      .select('id, view_type, image_url, thumbnail_url')
      .in('id', revisionIds);

    if (fetchError || !allRevisions) {
      throw new Error('Failed to fetch revisions');
    }

    // Filter to only essential views: front, back, side (in priority order)
    // This saves credits by only analyzing the most important views
    const priorityOrder = ['front', 'back', 'side'];
    const selectedRevisions = priorityOrder
      .map(viewType => allRevisions.find(r => r.view_type === viewType))
      .filter(Boolean);

    console.log(`Analyzing ${selectedRevisions.length} essential views (front, back, side) out of ${allRevisions.length} total revisions`);

    // Analyze each selected revision
    const baseViews = [];
    let isFirstView = true;
    for (const revision of selectedRevisions) {
      if (!revision) continue;

      // Map view type to match revision_vision_analysis table constraints
      // product_multiview_revisions: 'front', 'back', 'side', 'bottom', 'illustration'
      // revision_vision_analysis: 'front', 'back', 'side', 'detail', 'other'
      const viewTypeMapping: Record<string, ViewType> = {
        'front': 'front',
        'back': 'back',
        'side': 'side',
        'bottom': 'other', // Map bottom to other
        'illustration': 'detail', // Map illustration to detail
      };
      const mappedViewType = viewTypeMapping[revision.view_type] || 'other';

      // Call analyzeBaseView with correct 6 parameters
      const result = await analyzeBaseView(
        mappedViewType,
        revision.image_url,
        category || 'general',
        productId,
        userId,
        revision.id
      );

      baseViews.push({
        revisionId: revision.id,
        viewType: revision.view_type,
        imageUrl: revision.image_url,
        thumbnailUrl: revision.thumbnail_url || revision.image_url,
        analysisData: result.analysisData,
        confidenceScore: result.analysisData.confidence_scores?.overall || 0.85,
        cached: result.cached,
        isExpanded: isFirstView, // First view is expanded by default
        version: 1,
        timestamp: Date.now(),
      });
      isFirstView = false;
    }

    console.log(`[Base Views] Successfully analyzed ${baseViews.length} views, ${creditsToReserve} credits used`);

    return NextResponse.json({
      success: true,
      data: {
        baseViews,
        creditsUsed: creditsToReserve,
      },
    });
  } catch (error) {
    console.error('Base view analysis API error:', error);

    // Refund reserved credits if operation failed
    if (reservationId) {
      console.log(`[Base Views] Refunding ${creditsToReserve} credits due to error`);
      await creditsManager.refundReservedCredits(
        creditsToReserve,
        reservationId,
        `Base views analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Base view analysis failed',
      },
      { status: 500 }
    );
  }
}
