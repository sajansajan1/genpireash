"use server";

import { getCurrentUser } from "@/lib/auth-service";
import { createClient } from "@/lib/supabase/server";
import { Polar } from "@polar-sh/sdk";
import { POLAR_SERVER, getPolarProductById, POLAR_PRODUCTS } from "@/lib/polar/config";

interface ChangePlanParams {
  subscriptionId: string;
  newProductId: string;
}

interface ChangePlanResult {
  success: boolean;
  error?: string;
  newPlan?: {
    name: string;
    membership: string;
    credits: number;
    price: number;
  };
}

/**
 * Change subscription plan (upgrade/downgrade)
 *
 * Polar handles proration automatically:
 * - Upgrade: User is charged the prorated difference immediately
 * - Downgrade: Credit is applied to the next billing cycle
 */
export async function changeSubscriptionPlan({
  subscriptionId,
  newProductId,
}: ChangePlanParams): Promise<ChangePlanResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  if (!subscriptionId) {
    return { success: false, error: "Subscription ID is required" };
  }

  if (!newProductId) {
    return { success: false, error: "New product ID is required" };
  }

  // Verify the new product exists
  const newProduct = getPolarProductById(newProductId);
  if (!newProduct) {
    return { success: false, error: "Invalid product ID" };
  }

  // Verify user owns this subscription
  const supabase = await createClient();
  const { data: creditRecord, error: fetchError } = await supabase
    .from("user_credits")
    .select("id, user_id, subscription_id, payment_provider")
    .eq("subscription_id", subscriptionId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !creditRecord) {
    return { success: false, error: "Subscription not found or access denied" };
  }

  if (creditRecord.payment_provider !== "polar") {
    return { success: false, error: "Plan changes are only supported for Polar subscriptions" };
  }

  try {
    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN!,
      server: POLAR_SERVER,
    });

    console.log(`Changing subscription ${subscriptionId} to product ${newProductId} (${newProduct.name})`);

    // Update the subscription to the new product
    const result = await polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        productId: newProductId,
      },
    });

    console.log("Plan change result:", {
      status: result.status,
      productId: result.productId,
      amount: result.amount,
    });

    // Update our database with the new plan details
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
      // Don't fail - Polar change was successful
    }

    return {
      success: true,
      newPlan: {
        name: newProduct.name,
        membership: newProduct.membership,
        credits: newProduct.credits,
        price: newProduct.price,
      },
    };
  } catch (error) {
    console.error("Error changing subscription plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change subscription plan",
    };
  }
}

/**
 * Get available plans for upgrade/downgrade
 * Returns plans that are different from the current one
 */
export async function getAvailablePlans(currentMembership: string, currentPlanType: string) {
  const allProducts = Object.values(POLAR_PRODUCTS);

  // Filter to subscription products only (not one-time) with same billing period
  const subscriptionProducts = allProducts.filter(
    (p) => p.type === "subscription" && p.planType === currentPlanType
  );

  // Exclude current plan
  const availablePlans = subscriptionProducts.filter(
    (p) => p.membership !== currentMembership
  );

  return availablePlans.map((p) => ({
    productId: p.id,
    name: p.name,
    membership: p.membership,
    credits: p.credits,
    price: p.price,
    planType: p.planType,
  }));
}
