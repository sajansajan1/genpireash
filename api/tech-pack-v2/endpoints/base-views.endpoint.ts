/**
 * Base Views Analysis Endpoint
 * POST /api/tech-pack-v2/base-views/analyze
 */

"use server";

import { NextRequest, NextResponse } from "next/server";
import { analyzeBaseViewsBatch } from "../functions/base-view-analysis.function";
import { validateRequest, BaseViewAnalysisSchema } from "../utils/validation";
import { creditsManager } from "../utils/credits-manager";
import { TECH_PACK_CREDITS } from "../config/credits.config";
import type { BaseViewsAnalysisResponse } from "../types/responses.types";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest): Promise<NextResponse<BaseViewsAnalysisResponse>> {
  let reservationId: string | undefined;
  const creditsToReserve = TECH_PACK_CREDITS.BASE_VIEWS;

  try {
    const body = await req.json();

    // Validate request
    const validation = validateRequest(BaseViewAnalysisSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { productId, revisionIds, category } = validation.data;

    // Get authenticated user and revision details from database
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

    // Get revision details from database
    const { data: revisions, error: fetchError } = await supabase
      .from("product_multiview_revisions")
      .select("*")
      .in("id", revisionIds);

    if (fetchError || !revisions || revisions.length === 0) {
      // Refund credits if revisions not found
      if (reservationId) {
        await creditsManager.refundReservedCredits(
          creditsToReserve,
          reservationId,
          "Revisions not found"
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Revisions not found",
        },
        { status: 404 }
      );
    }

    // Prepare views for analysis
    const views = revisions.map((rev) => ({
      viewType: rev.view_type as any,
      imageUrl: rev.image_url,
      revisionId: rev.id,
    }));

    // Analyze views
    const startTime = Date.now();
    const results = await analyzeBaseViewsBatch(views, category || "APPAREL", productId, user.id);
    const processingTime = Date.now() - startTime;

    console.log(`[Base Views] Successfully analyzed ${results.length} views`);

    // Credits already deducted via reservation - no need to deduct again

    // Format response
    const analyses = results.map((result) => ({
      revisionId: result.revisionId,
      viewType: result.viewType,
      analysisData: result.analysisData,
      confidenceScore: result.analysisData.confidence_scores?.overall || 0,
      imageUrl: revisions.find((r) => r.id === result.revisionId)?.image_url || "",
      thumbnailUrl: revisions.find((r) => r.id === result.revisionId)?.thumbnail_url,
    }));

    return NextResponse.json({
      success: true,
      data: {
        analyses,
        creditsUsed: TECH_PACK_CREDITS.BASE_VIEWS,
        batchId: `base-views-${Date.now()}`,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
        creditsUsed: TECH_PACK_CREDITS.BASE_VIEWS,
      },
    });
  } catch (error) {
    console.error("[Base Views] Analysis error:", error);

    // Refund reserved credits if operation failed
    if (reservationId) {
      console.log(`[Base Views] Refunding ${creditsToReserve} credits due to error`);
      await creditsManager.refundReservedCredits(
        creditsToReserve,
        reservationId,
        `Base views analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
