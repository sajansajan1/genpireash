/**
 * Tech Pack V2 - Technical Sketches Generation API Route
 * POST /api/tech-pack-v2/generate-sketches
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateTechnicalSketches } from '@/api/tech-pack-v2/functions/sketch-generation.function';
import { createClient } from '@/lib/supabase/server';
import { creditsManager } from '@/api/tech-pack-v2/utils/credits-manager';

// Credit cost for sketch generation (3 sketches)
const SKETCH_CREDITS = 6;

export async function POST(request: NextRequest) {
  let reservationId: string | undefined;

  try {
    const body = await request.json();
    const { productId, productCategory, productAnalysis } = body;

    // Validate required fields
    if (!productId || !productCategory || !productAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: productId, productCategory, and productAnalysis',
        },
        { status: 400 }
      );
    }

    // Get Supabase client for auth
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

    // Reserve credits upfront
    console.log(`[Sketches API] Reserving ${SKETCH_CREDITS} credits for user ${userId}`);
    const reservation = await creditsManager.reserveCredits(SKETCH_CREDITS);

    if (!reservation.success) {
      console.error('[Sketches API] Credit reservation failed:', reservation.message);
      return NextResponse.json(
        {
          success: false,
          error: reservation.message || 'Insufficient credits. You need 6 credits to generate technical sketches.',
        },
        { status: 402 } // Payment Required
      );
    }

    reservationId = reservation.reservationId;
    console.log(`[Sketches API] Credits reserved successfully. Reservation ID: ${reservationId}`);

    // Call the sketch generation function
    const sketches = await generateTechnicalSketches(
      productId,
      productCategory,
      productAnalysis,
      userId,
      ['front', 'back', 'side'] // Generate sketches for these views
    );

    console.log(`[Sketches API] Sketches generated successfully. ${SKETCH_CREDITS} credits deducted.`);

    return NextResponse.json({
      success: true,
      data: { sketches },
    });
  } catch (error) {
    console.error('Sketch generation API error:', error);

    // Refund reserved credits on failure
    if (reservationId) {
      console.log(`[Sketches API] Refunding ${SKETCH_CREDITS} credits due to generation failure`);
      await creditsManager.refundReservedCredits(
        SKETCH_CREDITS,
        reservationId,
        `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sketch generation failed',
      },
      { status: 500 }
    );
  }
}
