/**
 * Technical Sketches Generation Endpoint
 * POST /api/tech-pack-v2/sketches/generate
 */

"use server";

import { NextRequest, NextResponse } from "next/server";
import { generateTechnicalSketches } from "../functions/sketch-generation.function";
import { validateRequest, TechnicalSketchSchema } from "../utils/validation";
import { creditsManager } from "../utils/credits-manager";
import { TECH_PACK_CREDITS } from "../config/credits.config";
import { createClient } from "@/lib/supabase/server";
import type { TechnicalSketchesResponse } from "../types/responses.types";

export async function POST(req: NextRequest): Promise<NextResponse<TechnicalSketchesResponse>> {
  let reservationId: string | undefined;
  const creditsToReserve = TECH_PACK_CREDITS.TECHNICAL_SKETCHES;

  try {
    const body = await req.json();

    // Validate request
    const validation = validateRequest(TechnicalSketchSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { productId, productAnalysis, category, views } = validation.data;

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not authenticated",
        },
        { status: 401 }
      );
    }

    // Reserve credits upfront
    console.log(`[Sketches] Reserving ${creditsToReserve} credits for technical sketches generation`);
    const creditReservation = await creditsManager.reserveCredits(creditsToReserve);

    if (!creditReservation.success) {
      return NextResponse.json(
        {
          success: false,
          error: creditReservation.message || `Insufficient credits. Need ${creditsToReserve} credits for sketches generation.`,
        },
        { status: 402 }
      );
    }

    reservationId = creditReservation.reservationId;
    console.log(`[Sketches] Reserved ${creditsToReserve} credits (reservation ID: ${reservationId})`);

    // Generate sketches
    const startTime = Date.now();
    const results = await generateTechnicalSketches(productId, category, productAnalysis, user.id, views);
    const processingTime = Date.now() - startTime;

    console.log(`[Sketches] Successfully generated ${results.length} technical sketches`);

    // Credits already deducted via reservation - no need to deduct again

    return NextResponse.json({
      success: true,
      data: {
        sketches: results.map((r) => ({
          ...r,
          analysisData: r.callouts,
        })),
        creditsUsed: creditsToReserve,
        batchId: `sketches-${Date.now()}`,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
        creditsUsed: creditsToReserve,
      },
    });
  } catch (error) {
    console.error("[Sketches] Generation error:", error);

    // Refund reserved credits if operation failed
    if (reservationId) {
      console.log(`[Sketches] Refunding ${creditsToReserve} credits due to error`);
      await creditsManager.refundReservedCredits(
        creditsToReserve,
        reservationId,
        `Sketches generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
