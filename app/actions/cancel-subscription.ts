"use server";

import { getCurrentUser } from "@/lib/auth-service";
import { createClient } from "@/lib/supabase/server";
import { Polar } from "@polar-sh/sdk";
import { POLAR_SERVER } from "@/lib/polar/config";

/**
 * Unified Cancel Subscription Action
 *
 * This action handles subscription cancellation for both Polar and PayPal.
 * It automatically detects the payment provider and routes to the correct API.
 */

interface CancelSubscriptionParams {
  subscriptionId: string;
  reason?: string;
}

interface CancelSubscriptionResult {
  success: boolean;
  error?: string;
  expiresAt?: string;
  provider?: "polar" | "paypal";
}

/**
 * Cancel a PayPal subscription
 */
async function cancelPayPalSubscription(subscriptionId: string, reason: string): Promise<CancelSubscriptionResult> {
  const client_id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;
  const paypal_base_url = process.env.NEXT_PUBLIC_PAYPAL_API_BASE_URL;

  if (!client_id || !client_secret || !paypal_base_url) {
    console.error("Missing PayPal credentials or base URL");
    return { success: false, error: "Server configuration error" };
  }

  try {
    // Get access token
    const authRes = await fetch(`${paypal_base_url}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authRes.json();

    if (!authRes.ok || !authData.access_token) {
      console.error("Failed to get PayPal access token", authData);
      return { success: false, error: "Failed to authenticate with PayPal" };
    }

    const accessToken = authData.access_token;

    // Cancel subscription
    const subscriptionRes = await fetch(
      `${paypal_base_url}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          reason: reason || "User requested cancellation",
        }),
      }
    );

    if (!subscriptionRes.ok && subscriptionRes.status !== 204) {
      const errorData = await subscriptionRes.text();
      console.error("Failed to cancel PayPal subscription", errorData);
      return { success: false, error: "Failed to cancel PayPal subscription" };
    }

    return { success: true, provider: "paypal" };
  } catch (error) {
    console.error("Error canceling PayPal subscription:", error);
    return { success: false, error: "Server error cancelling subscription" };
  }
}

/**
 * Cancel a Polar subscription
 * Uses the 'update' method with cancel_at_period_end to allow user to keep access until period ends
 */
async function cancelPolarSubscription(subscriptionId: string): Promise<CancelSubscriptionResult> {
  try {
    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN!,
      server: POLAR_SERVER,
    });

    // Use 'update' to cancel at period end (user keeps access until subscription expires)
    // This triggers subscription.canceled webhook instead of subscription.revoked
    const result = await polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: true,
      },
    });

    return {
      success: true,
      provider: "polar",
      expiresAt: result.currentPeriodEnd?.toISOString(),
    };
  } catch (error) {
    console.error("Error canceling Polar subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel Polar subscription"
    };
  }
}

/**
 * Main unified cancel subscription function
 *
 * Detects the payment provider from user_credits and routes to the correct API
 */
export async function cancelSubscription({
  subscriptionId,
  reason = "User requested cancellation",
}: CancelSubscriptionParams): Promise<CancelSubscriptionResult> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  if (!subscriptionId) {
    return { success: false, error: "Subscription ID is required" };
  }

  try {
    // Get the user_credits record to determine the payment provider
    const { data: creditRecord, error: fetchError } = await supabase
      .from("user_credits")
      .select("id, subscription_id, payment_provider, created_at, plan_type")
      .eq("subscription_id", subscriptionId)
      .single();

    if (fetchError || !creditRecord) {
      console.error("Failed to fetch user credits", fetchError);
      return { success: false, error: "Subscription not found" };
    }

    // Determine payment provider
    // If payment_provider is set, use it. Otherwise, assume PayPal (legacy subscriptions)
    const provider = creditRecord.payment_provider || "paypal";

    console.log(`Cancelling subscription ${subscriptionId} via ${provider}`);

    // Route to the correct provider
    let cancelResult: CancelSubscriptionResult;

    if (provider === "polar") {
      cancelResult = await cancelPolarSubscription(subscriptionId);
    } else {
      cancelResult = await cancelPayPalSubscription(subscriptionId, reason);
    }

    if (!cancelResult.success) {
      return cancelResult;
    }

    // Calculate expiration date (end of current billing period)
    const createdAt = new Date(creditRecord.created_at);
    const now = new Date();
    let expiresAt: Date;

    if (creditRecord.plan_type === "yearly") {
      // For yearly plans, expire at the next year anniversary
      expiresAt = new Date(createdAt);
      while (expiresAt <= now) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
    } else {
      // For monthly plans, expire at the next month
      expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      expiresAt.setDate(1); // First of next month
      expiresAt.setHours(createdAt.getHours(), createdAt.getMinutes(), createdAt.getSeconds());
    }

    // Update user_credits to mark as canceled
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        subscription_status_canceled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subscriptionId);

    if (updateError) {
      console.error("Failed to update user credits", updateError);
      return {
        success: true,
        error: "Subscription cancelled but failed to update local record",
        provider: cancelResult.provider,
        expiresAt: expiresAt.toISOString(),
      };
    }

    return {
      success: true,
      provider: cancelResult.provider,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("Unexpected error in cancelSubscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
}
