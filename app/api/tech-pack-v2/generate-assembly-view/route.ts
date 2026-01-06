/**
 * Tech Pack V2 - Assembly View (Exploded/Build View) Generation API Route
 * POST /api/tech-pack-v2/generate-assembly-view
 *
 * Generates an exploded/assembly view that visually explains how the product is built,
 * breaking it into components and showing their relationships, order of assembly,
 * and connection points.
 *
 * Cost: 2 credits
 */

import { NextRequest, NextResponse } from "next/server";
import { generateAssemblyView } from "@/api/tech-pack-v2/functions/assembly-view-generation.function";
import { createClient } from "@/lib/supabase/server";
import { creditsManager } from "@/api/tech-pack-v2/utils/credits-manager";

// Credit cost for assembly view generation
const ASSEMBLY_VIEW_CREDITS = 2;

export async function POST(request: NextRequest) {
  let reservationId: string | undefined;

  try {
    const body = await request.json();
    const { productId, productCategory, productAnalysis, components } = body;

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
      `[Assembly View API] Reserving ${ASSEMBLY_VIEW_CREDITS} credits for user ${userId}`
    );
    const reservation = await creditsManager.reserveCredits(ASSEMBLY_VIEW_CREDITS);

    if (!reservation.success) {
      console.error("[Assembly View API] Credit reservation failed:", reservation.message);
      return NextResponse.json(
        {
          success: false,
          error:
            reservation.message ||
            "Insufficient credits. You need 2 credits to generate assembly view.",
        },
        { status: 402 } // Payment Required
      );
    }

    reservationId = reservation.reservationId;
    console.log(
      `[Assembly View API] Credits reserved successfully. Reservation ID: ${reservationId}`
    );

    // Call the assembly view generation function
    const assemblyView = await generateAssemblyView(
      productId,
      productCategory,
      productAnalysis,
      userId,
      components
    );

    console.log(
      `[Assembly View API] Assembly view generated successfully. ${ASSEMBLY_VIEW_CREDITS} credits deducted.`
    );

    return NextResponse.json({
      success: true,
      data: { assemblyView },
    });
  } catch (error) {
    console.error("Assembly view generation API error:", error);

    // Refund reserved credits on failure
    if (reservationId) {
      console.log(
        `[Assembly View API] Refunding ${ASSEMBLY_VIEW_CREDITS} credits due to generation failure`
      );
      await creditsManager.refundReservedCredits(
        ASSEMBLY_VIEW_CREDITS,
        reservationId,
        `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Assembly view generation failed",
      },
      { status: 500 }
    );
  }
}
