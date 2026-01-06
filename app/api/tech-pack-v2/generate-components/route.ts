/**
 * Tech Pack V2 - Component Images Generation API Route
 * POST /api/tech-pack-v2/generate-components
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateComponentImages } from '@/api/tech-pack-v2/functions/component-generation.function';
import { createClient } from '@/lib/supabase/server';
import { creditsManager } from '@/api/tech-pack-v2/utils/credits-manager';

// Credit cost for component image generation
const COMPONENT_CREDITS = 2;

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
    console.log(`[Components API] Reserving ${COMPONENT_CREDITS} credits for user ${userId}`);
    const reservation = await creditsManager.reserveCredits(COMPONENT_CREDITS);

    if (!reservation.success) {
      console.error('[Components API] Credit reservation failed:', reservation.message);
      return NextResponse.json(
        {
          success: false,
          error: reservation.message || 'Insufficient credits. You need 2 credits to generate components.',
        },
        { status: 402 } // Payment Required
      );
    }

    reservationId = reservation.reservationId;
    console.log(`[Components API] Credits reserved successfully. Reservation ID: ${reservationId}`);

    // Transform baseViewAnalyses to match the function signature
    const baseViews = baseViewAnalyses.map((analysis: any) => ({
      revisionId: analysis.revisionId,
      viewType: analysis.viewType,
      imageUrl: analysis.imageUrl,
      analysisData: analysis.analysisData,
    }));

    // Call the component generation function
    const components = await generateComponentImages(
      productId,
      productCategory,
      baseViews,
      userId
    );

    console.log(`[Components API] Components generated successfully. ${components.length} components created.`);

    return NextResponse.json({
      success: true,
      data: { components },
    });
  } catch (error) {
    console.error('Component generation API error:', error);

    // Refund reserved credits on failure
    if (reservationId) {
      console.log(`[Components API] Refunding ${COMPONENT_CREDITS} credits due to generation failure`);
      await creditsManager.refundReservedCredits(
        COMPONENT_CREDITS,
        reservationId,
        `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Component generation failed',
      },
      { status: 500 }
    );
  }
}
