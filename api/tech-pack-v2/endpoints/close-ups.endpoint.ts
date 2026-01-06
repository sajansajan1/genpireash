/**
 * Close-Ups Generation Endpoint
 * POST /api/tech-pack-v2/close-ups/generate
 */

"use server";

import { NextRequest, NextResponse } from "next/server";
import { generateCloseUps } from "../functions/closeup-generation.function";
import { validateRequest, CloseUpGenerationSchema } from "../utils/validation";
import { creditsManager } from "../utils/credits-manager";
import { TECH_PACK_CREDITS } from "../config/credits.config";
import { createClient } from "@/lib/supabase/server";
import type { CloseUpsGenerationResponse } from "../types/responses.types";

export async function POST(req: NextRequest): Promise<NextResponse<CloseUpsGenerationResponse>> {
  let reservationId: string | undefined;
  const creditsToReserve = TECH_PACK_CREDITS.CLOSE_UPS;

  try {
    const body = await req.json();

    // Validate request
    const validation = validateRequest(CloseUpGenerationSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { productId, baseViewAnalyses, category } = validation.data;

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

    // Reserve credits upfront (following the existing pattern from progressive-generation-workflow.ts)
    console.log(`[Close-Ups] Reserving ${creditsToReserve} credits for close-ups generation`);
    const creditReservation = await creditsManager.reserveCredits(creditsToReserve);

    if (!creditReservation.success) {
      return NextResponse.json(
        {
          success: false,
          error: creditReservation.message || `Insufficient credits. Need ${creditsToReserve} credits for close-ups generation.`,
        },
        { status: 402 }
      );
    }

    reservationId = creditReservation.reservationId;
    console.log(`[Close-Ups] Reserved ${creditsToReserve} credits (reservation ID: ${reservationId})`);

    // Generate close-ups
    const startTime = Date.now();
    const results = await generateCloseUps(productId, category, baseViewAnalyses, user.id);
    const processingTime = Date.now() - startTime;

    console.log(`[Close-Ups] Successfully generated ${results.length} close-ups`);

    // Credits are already deducted via reservation - no need to deduct again
    // The reservation pattern: reserve → work → (refund if fails OR keep deducted if success)

    return NextResponse.json({
      success: true,
      data: {
        closeupPlan: { total_shots_recommended: results.length },
        generatedImages: results.map((r, idx) => ({
          ...r,
          order: idx + 1,
        })),
        creditsUsed: creditsToReserve,
        batchId: `closeups-${Date.now()}`,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
        creditsUsed: creditsToReserve,
      },
    });
  } catch (error) {
    console.error("[Close-Ups] Generation error:", error);

    // Refund reserved credits if operation failed
    if (reservationId) {
      console.log(`[Close-Ups] Refunding ${creditsToReserve} credits due to error`);
      await creditsManager.refundReservedCredits(
        creditsToReserve,
        reservationId,
        `Close-ups generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
