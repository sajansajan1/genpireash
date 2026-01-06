import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { createClient } from "@/lib/supabase/server";
import { POLAR_SERVER } from "@/lib/polar/config";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: POLAR_SERVER,
});

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    console.log("=== CANCELLING SUBSCRIPTION IN POLAR ===");
    console.log("Subscription ID:", subscriptionId);

    // Cancel the subscription in Polar at period end (user keeps access until subscription expires)
    // This triggers subscription.canceled webhook instead of subscription.revoked
    const result = await polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: true,
      },
    });

    // Log the Polar response to verify cancellation
    console.log("Polar cancellation response:");
    console.log("- status:", result.status);
    console.log("- cancelAtPeriodEnd:", result.cancelAtPeriodEnd);
    console.log("- canceledAt:", result.canceledAt);
    console.log("- currentPeriodEnd:", result.currentPeriodEnd);
    console.log("=== END CANCELLATION ===");

    // Update our database to mark it as canceled
    const supabase = await createClient();
    await supabase
      .from("user_credits")
      .update({
        subscription_status_canceled: true,
        expires_at: result.currentPeriodEnd?.toISOString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subscriptionId);

    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully. Access will continue until the end of the billing period.",
      expiresAt: result.currentPeriodEnd?.toISOString(),
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error canceling subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to cancel subscription";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
