/**
 * Category Detection Endpoint
 * POST /api/tech-pack-v2/detect-category
 */

"use server";

import { NextRequest, NextResponse } from "next/server";
import { detectProductCategory } from "../functions/category-detection.function";
import { validateRequest, CategoryDetectionSchema } from "../utils/validation";
import type { CategoryDetectionResponse } from "../types/responses.types";

export async function POST(req: NextRequest): Promise<NextResponse<CategoryDetectionResponse>> {
  try {
    const body = await req.json();

    // Validate request
    const validation = validateRequest(CategoryDetectionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { productId, imageUrl } = validation.data;

    // TODO: Get userId from session/auth
    const userId = "user-id-from-auth";

    // Detect category
    const startTime = Date.now();
    const result = await detectProductCategory(imageUrl, userId);
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
      },
    });
  } catch (error) {
    console.error("Category detection endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
