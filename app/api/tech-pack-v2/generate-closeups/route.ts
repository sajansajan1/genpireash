/**
 * Tech Pack V2 - Close-Ups Generation API Route
 * POST /api/tech-pack-v2/generate-closeups
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCloseUps } from '@/api/tech-pack-v2/functions/closeup-generation.function';
import { createClient } from '@/lib/supabase/server';
import { creditsManager } from '@/api/tech-pack-v2/utils/credits-manager';

// Credit cost for close-up detail shots
const CLOSEUP_CREDITS = 2;

export async function POST(request: NextRequest) {
  let reservationId: string | undefined;

  try {
    const body = await request.json();
    const { productId, productCategory, baseViewAnalyses } = body;

    // Validate required fields
    if (!productId || !productCategory || !baseViewAnalyses) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: productId, productCategory, and baseViewAnalyses',
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
    console.log(`[Close-ups API] Reserving ${CLOSEUP_CREDITS} credits for user ${userId}`);
    const reservation = await creditsManager.reserveCredits(CLOSEUP_CREDITS);

    if (!reservation.success) {
      console.error('[Close-ups API] Credit reservation failed:', reservation.message);
      return NextResponse.json(
        {
          success: false,
          error: reservation.message || 'Insufficient credits. You need 2 credits to generate close-ups.',
        },
        { status: 402 } // Payment Required
      );
    }

    reservationId = reservation.reservationId;
    console.log(`[Close-ups API] Credits reserved successfully. Reservation ID: ${reservationId}`);

    // Call the close-up generation function
    const closeUps = await generateCloseUps(
      productId,
      productCategory,
      baseViewAnalyses,
      userId
    );

    console.log(`[Close-ups API] Close-ups generated successfully. ${CLOSEUP_CREDITS} credits deducted.`);

    return NextResponse.json({
      success: true,
      data: { closeUps },
    });
  } catch (error) {
    console.error('Close-up generation API error:', error);

    // Refund reserved credits on failure
    if (reservationId) {
      console.log(`[Close-ups API] Refunding ${CLOSEUP_CREDITS} credits due to generation failure`);
      await creditsManager.refundReservedCredits(
        CLOSEUP_CREDITS,
        reservationId,
        `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Close-up generation failed',
      },
      { status: 500 }
    );
  }
}
