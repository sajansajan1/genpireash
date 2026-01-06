/**
 * AI Edit Endpoint
 * POST /api/tech-pack-v2/edit
 */

"use server";

import { NextRequest, NextResponse } from "next/server";
import { performAIEdit } from "../functions/ai-edit.function";
import { validateRequest, AIEditSchema } from "../utils/validation";
import { creditsManager } from "../utils/credits-manager";
import { TECH_PACK_CREDITS } from "../config/credits.config";
import { createClient } from "@/lib/supabase/server";
import type { AIEditResponse } from "../types/responses.types";

export async function POST(req: NextRequest): Promise<NextResponse<AIEditResponse>> {
  let reservationId: string | undefined;
  const creditsToReserve = TECH_PACK_CREDITS.AI_EDIT_SINGLE_FIELD;

  try {
    const body = await req.json();

    // Validate request
    const validation = validateRequest(AIEditSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { revisionId, fieldPath, editPrompt, referenceImageUrl } = validation.data;

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
    console.log(`[AI Edit] Reserving ${creditsToReserve} credit for field edit`);
    const creditReservation = await creditsManager.reserveCredits(creditsToReserve);

    if (!creditReservation.success) {
      return NextResponse.json(
        {
          success: false,
          error: creditReservation.message || `Insufficient credits. Need ${creditsToReserve} credit for AI edit.`,
        },
        { status: 402 }
      );
    }

    reservationId = creditReservation.reservationId;
    console.log(`[AI Edit] Reserved ${creditsToReserve} credit (reservation ID: ${reservationId})`);

    // Perform edit
    const startTime = Date.now();
    const result = await performAIEdit(revisionId, fieldPath, editPrompt, referenceImageUrl, user.id);
    const processingTime = Date.now() - startTime;

    console.log(`[AI Edit] Successfully edited field: ${fieldPath}`);

    // Credits already deducted via reservation - no need to deduct again

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        creditsUsed: creditsToReserve,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
        creditsUsed: creditsToReserve,
      },
    });
  } catch (error) {
    console.error("[AI Edit] Error:", error);

    // Refund reserved credits if operation failed
    if (reservationId) {
      console.log(`[AI Edit] Refunding ${creditsToReserve} credit due to error`);
      await creditsManager.refundReservedCredits(
        creditsToReserve,
        reservationId,
        `AI edit failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
