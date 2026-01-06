import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { createClient } from "@/lib/supabase/server";
import { POLAR_SERVER, getPolarProductById } from "@/lib/polar/config";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: POLAR_SERVER,
});

/**
 * Change subscription plan (upgrade/downgrade)
 *
 * POST /api/polar/change-plan
 * Body: { subscriptionId: string, newProductId: string }
 *
 * Polar handles proration automatically:
 * - Upgrade: User is charged the prorated difference immediately
 * - Downgrade: Credit is applied to the next billing cycle
 */
export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, newProductId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    if (!newProductId) {
      return NextResponse.json(
        { error: "New product ID is required" },
        { status: 400 }
      );
    }

    // Verify the new product exists in our config
    const newProduct = getPolarProductById(newProductId);
    if (!newProduct) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    console.log("=== CHANGING SUBSCRIPTION PLAN ===");
    console.log("Subscription ID:", subscriptionId);
    console.log("New Product ID:", newProductId);
    console.log("New Product:", newProduct.name);

    // Update the subscription to the new product
    // Polar handles proration automatically
    const result = await polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        productId: newProductId,
      },
    });

    console.log("Polar plan change response:");
    console.log("- status:", result.status);
    console.log("- productId:", result.productId);
    console.log("- amount:", result.amount);
    console.log("- currentPeriodEnd:", result.currentPeriodEnd);
    console.log("=== END PLAN CHANGE ===");

    // Update our database with the new plan details
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        membership: newProduct.membership,
        credits: newProduct.credits,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subscriptionId);

    if (updateError) {
      console.error("Error updating user_credits after plan change:", updateError);
      // Don't fail the request - Polar change was successful
    }

    return NextResponse.json({
      success: true,
      message: `Successfully changed to ${newProduct.name}`,
      newPlan: {
        name: newProduct.name,
        membership: newProduct.membership,
        credits: newProduct.credits,
        price: newProduct.price,
      },
      subscription: {
        id: result.id,
        status: result.status,
        productId: result.productId,
        amount: result.amount,
        currentPeriodEnd: result.currentPeriodEnd?.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error changing subscription plan:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to change subscription plan";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
