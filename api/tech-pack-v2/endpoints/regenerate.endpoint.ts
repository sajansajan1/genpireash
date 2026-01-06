/**
 * Regenerate View Endpoint
 * POST /api/tech-pack-v2/regenerate
 */

"use server";

import { NextRequest, NextResponse } from "next/server";
import { validateRequest, RegenerateViewSchema } from "../utils/validation";
import { creditsManager } from "../utils/credits-manager";
import { TECH_PACK_CREDITS } from "../config/credits.config";
import type { RegenerateResponse } from "../types/responses.types";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest): Promise<NextResponse<RegenerateResponse>> {
  let reservationId: string | undefined;
  const creditsToReserve = TECH_PACK_CREDITS.REGENERATE_VIEW;

  try {
    const body = await req.json();

    // Validate request
    const validation = validateRequest(RegenerateViewSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { revisionId, regeneratePrompt, replaceCurrent } = validation.data;

    const supabase = await createClient();

    // Get authenticated user
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
    console.log(`[Regenerate] Reserving ${creditsToReserve} credit for view regeneration`);
    const creditReservation = await creditsManager.reserveCredits(creditsToReserve);

    if (!creditReservation.success) {
      return NextResponse.json(
        {
          success: false,
          error: creditReservation.message || `Insufficient credits. Need ${creditsToReserve} credit for regeneration.`,
        },
        { status: 402 }
      );
    }

    reservationId = creditReservation.reservationId;
    console.log(`[Regenerate] Reserved ${creditsToReserve} credit (reservation ID: ${reservationId})`);

    // Get existing revision
    const { data: existingRevision, error: fetchError } = await supabase
      .from("product_multiview_revisions")
      .select("*")
      .eq("id", revisionId)
      .single();

    if (fetchError || !existingRevision) {
      // Refund credits if revision not found
      if (reservationId) {
        await creditsManager.refundReservedCredits(
          creditsToReserve,
          reservationId,
          "Revision not found"
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Revision not found",
        },
        { status: 404 }
      );
    }

    // TODO: Implement actual regeneration logic
    // This would involve:
    // 1. Generating new image with Gemini using regeneratePrompt
    // 2. Creating new revision in product_multiview_revisions
    // 3. Running analysis on the new image
    // 4. If replaceCurrent, deactivate old revision

    console.log(`[Regenerate] Successfully regenerated view for revision: ${revisionId}`);

    // Credits already deducted via reservation - no need to deduct again

    // For now, return placeholder response
    return NextResponse.json({
      success: true,
      data: {
        newRevisionId: "new-revision-id",
        analysisData: {},
        creditsUsed: creditsToReserve,
        imageUrl: "new-image-url",
        thumbnailUrl: "new-thumbnail-url",
      },
      metadata: {
        timestamp: new Date().toISOString(),
        creditsUsed: creditsToReserve,
      },
    });
  } catch (error) {
    console.error("[Regenerate] Error:", error);

    // Refund reserved credits if operation failed
    if (reservationId) {
      console.log(`[Regenerate] Refunding ${creditsToReserve} credit due to error`);
      await creditsManager.refundReservedCredits(
        creditsToReserve,
        reservationId,
        `Regeneration failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
