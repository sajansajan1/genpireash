/**
 * Tech Pack V2 - Flat Sketches Generation API Route
 * POST /api/tech-pack-v2/generate-flat-sketches
 *
 * Generates 3 clean black and white vector-style flat sketches (front, back, side)
 * showing trimming, lining, stitches, and pattern details.
 *
 * Cost: 2 credits for all 3 views
 */

import { NextRequest, NextResponse } from "next/server";
import { generateFlatSketches } from "@/api/tech-pack-v2/functions/flat-sketch-generation.function";
import { createClient } from "@/lib/supabase/server";
import { creditsManager } from "@/api/tech-pack-v2/utils/credits-manager";

// Credit cost for flat sketch generation (3 sketches)
const FLAT_SKETCH_CREDITS = 2;

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
          error: "Missing required fields: productId, productCategory, and productAnalysis",
        },
        { status: 400 }
      );
    }

    // Get Supabase client for auth
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = user.id;

    // Reserve credits upfront
    console.log(
      `[Flat Sketches API] Reserving ${FLAT_SKETCH_CREDITS} credits for user ${userId}`
    );
    const reservation = await creditsManager.reserveCredits(FLAT_SKETCH_CREDITS);

    if (!reservation.success) {
      console.error("[Flat Sketches API] Credit reservation failed:", reservation.message);
      return NextResponse.json(
        {
          success: false,
          error:
            reservation.message ||
            "Insufficient credits. You need 2 credits to generate flat sketches.",
        },
        { status: 402 } // Payment Required
      );
    }

    reservationId = reservation.reservationId;
    console.log(
      `[Flat Sketches API] Credits reserved successfully. Reservation ID: ${reservationId}`
    );

    // Call the flat sketch generation function
    const flatSketches = await generateFlatSketches(
      productId,
      productCategory,
      productAnalysis,
      userId,
      ["front", "back", "side"]
    );

    console.log(
      `[Flat Sketches API] Flat sketches generated successfully. ${FLAT_SKETCH_CREDITS} credits deducted.`
    );

    return NextResponse.json({
      success: true,
      data: { flatSketches },
    });
  } catch (error) {
    console.error("Flat sketch generation API error:", error);

    // Refund reserved credits on failure
    if (reservationId) {
      console.log(
        `[Flat Sketches API] Refunding ${FLAT_SKETCH_CREDITS} credits due to generation failure`
      );
      await creditsManager.refundReservedCredits(
        FLAT_SKETCH_CREDITS,
        reservationId,
        `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Flat sketch generation failed",
      },
      { status: 500 }
    );
  }
}
