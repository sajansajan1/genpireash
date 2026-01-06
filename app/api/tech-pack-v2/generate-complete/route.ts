/**
 * Tech Pack V2 - Complete Generation API Route
 * POST /api/tech-pack-v2/generate-complete
 * Uses the orchestrator to generate complete tech pack with collections
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCompleteTechPack } from '@/api/tech-pack-v2/orchestrator/tech-pack-orchestrator';
import { createClient } from '@/lib/supabase/server';
import { creditsManager } from '@/api/tech-pack-v2/utils/credits-manager';

// Complete tech pack generation cost breakdown:
// - Base views analysis: 0 credits (free)
// - Components: 2 credits
// - Close-ups: 2 credits
// - Technical Sketches: 6 credits
// Total: 10 credits for complete tech pack generation
const COMPLETE_TECH_PACK_CREDITS = 10;

export async function POST(request: NextRequest) {
  let reservationId: string | undefined;

  try {
    const body = await request.json();
    const { productId, revisionIds, category, primaryImageUrl, collectionName } = body;

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

    if (!primaryImageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: primaryImageUrl',
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
    const userId = user.id;

    // Reserve credits upfront for complete tech pack generation
    console.log(`[Complete Tech Pack API] Reserving ${COMPLETE_TECH_PACK_CREDITS} credits for user ${userId}`);
    const reservation = await creditsManager.reserveCredits(COMPLETE_TECH_PACK_CREDITS);

    if (!reservation.success) {
      console.error('[Complete Tech Pack API] Credit reservation failed:', reservation.message);
      return NextResponse.json(
        {
          success: false,
          error: reservation.message || 'Insufficient credits. You need 10 credits to generate a complete tech pack.',
        },
        { status: 402 } // Payment Required
      );
    }

    reservationId = reservation.reservationId;
    console.log(`[Complete Tech Pack API] Credits reserved successfully. Reservation ID: ${reservationId}`);

    // Call the orchestrator to generate complete tech pack
    const result = await generateCompleteTechPack({
      productId,
      userId,
      revisionIds,
      category: category || 'general',
      primaryImageUrl,
      options: {
        collectionName: collectionName || `Tech Pack - ${new Date().toLocaleDateString()}`,
      },
    });

    console.log(`[Complete Tech Pack API] Tech pack generated successfully. ${COMPLETE_TECH_PACK_CREDITS} credits deducted.`);

    return NextResponse.json({
      success: true,
      data: {
        collectionId: result.collectionId,
        baseViews: result.baseViews,
        closeUps: result.closeUps,
        sketches: result.sketches,
        totalCreditsUsed: result.totalCreditsUsed,
        generationTimeMs: result.generationTimeMs,
      },
    });
  } catch (error) {
    console.error('Complete tech pack generation API error:', error);

    // Refund reserved credits on failure
    if (reservationId) {
      console.log(`[Complete Tech Pack API] Refunding ${COMPLETE_TECH_PACK_CREDITS} credits due to generation failure`);
      await creditsManager.refundReservedCredits(
        COMPLETE_TECH_PACK_CREDITS,
        reservationId,
        `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Complete tech pack generation failed',
      },
      { status: 500 }
    );
  }
}
