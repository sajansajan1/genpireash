/**
 * Tech Pack V2 - Custom Component Image Generation API Route
 * POST /api/tech-pack-v2/generate-custom-component
 *
 * Allows users to request generation of a specific component by description.
 * Validates that the component exists in the product before generating.
 * Costs 2 credits per image.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateCustomComponentImage } from "@/api/tech-pack-v2/functions/custom-component-generation.function";
import { CUSTOM_COMPONENT_CREDITS } from "@/api/tech-pack-v2/types/custom-component.types";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, componentDescription } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: productId",
        },
        { status: 400 }
      );
    }

    if (!componentDescription || typeof componentDescription !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid field: componentDescription must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Validate component description length
    const trimmedDescription = componentDescription.trim();
    if (trimmedDescription.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Component description is too short. Please provide more details.",
        },
        { status: 400 }
      );
    }

    if (trimmedDescription.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: "Component description is too long. Please keep it under 500 characters.",
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

    console.log(`[Custom Component API] User authenticated: ${userId}`);

    // Use service role client to bypass RLS for product verification
    const serviceSupabase = await createServiceRoleClient();

    // Verify user owns the product
    const { data: product, error: productError } = await serviceSupabase
      .from("product_ideas")
      .select("id, user_id")
      .eq("id", productId)
      .single();

    console.log(`[Custom Component API] Product query result:`, {
      productId,
      product,
      productError: productError?.message,
    });

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: "Product not found", debug: { productError: productError?.message } },
        { status: 404 }
      );
    }

    if (product.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: "You do not have access to this product" },
        { status: 403 }
      );
    }

    console.log(
      `[Custom Component API] User ${userId} requesting component "${trimmedDescription}" for product ${productId}`
    );

    // Generate custom component image
    const result = await generateCustomComponentImage(
      productId,
      trimmedDescription,
      userId
    );

    // Handle validation failure (component doesn't exist in product)
    if (!result.success && result.validation && !result.validation.exists) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          componentNotFound: true,
          reason: result.validation.reason,
          suggestions: result.validation.suggestions,
        },
        { status: 404 }
      );
    }

    // Handle other failures
    if (!result.success) {
      // Check if it's a credit issue
      if (result.error?.includes("credit") || result.error?.includes("Credit")) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            creditsRequired: CUSTOM_COMPONENT_CREDITS,
          },
          { status: 402 } // Payment Required
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    // Success response
    console.log(
      `[Custom Component API] Successfully generated component: ${result.component?.componentName}`
    );

    return NextResponse.json({
      success: true,
      data: {
        component: result.component,
        validation: {
          componentName: result.validation?.matchedComponent?.name,
          componentType: result.validation?.matchedComponent?.type,
          location: result.validation?.matchedComponent?.location,
          confidence: result.validation?.confidence,
        },
        creditsUsed: result.creditsUsed,
      },
    });
  } catch (error) {
    console.error("[Custom Component API] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Custom component generation failed",
      },
      { status: 500 }
    );
  }
}
