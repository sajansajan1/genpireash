import { Webhooks } from "@polar-sh/nextjs";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  getPolarProductById,
  calculateCreditsWithOffer,
  PolarMembership,
  PolarPlanType,
} from "@/lib/polar/config";
import {
  sendProSubscriptionConfirmationMail,
  sendSaverSubscriptionConfirmationMail,
  sendRfqPurchaseConfiramtionEmail,
  sendSuperSubscriptionConfirmationMail,
} from "@/app/actions/send-mail";
import { getFirstTouchUTMServer, saveConversionUTMServer } from "@/lib/utm/server";

/**
 * Polar Webhooks Handler
 *
 * This route handles all Polar webhook events for:
 * - Checkout completion
 * - Subscription lifecycle (created, active, canceled, renewed)
 * - Order completion (one-time purchases)
 * - Refunds
 *
 * All credit management is handled here automatically.
 */

interface WebhookMetadata {
  userId?: string;
  hasOffer?: string;
  membership?: string;
  planType?: string;
}

/**
 * Calculate expiry date based on plan type
 * Uses Polar's currentPeriodEnd if available (most accurate)
 * Falls back to manual calculation based on plan type
 */
function calculateExpiryDate(
  planType: PolarPlanType,
  polarCurrentPeriodEnd?: string | null
): Date | undefined {
  // For one-time purchases, no expiry
  if (planType === "one_time") {
    return undefined;
  }

  // Prefer Polar's currentPeriodEnd as it's the authoritative source
  if (polarCurrentPeriodEnd) {
    const polarExpiry = new Date(polarCurrentPeriodEnd);
    console.log(`Using Polar currentPeriodEnd for expiry: ${polarExpiry.toISOString()}`);
    return polarExpiry;
  }

  // Fallback: Calculate manually based on plan type
  const expiresAt = new Date();
  if (planType === "monthly") {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else if (planType === "yearly") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }
  console.log(`Calculated expiry manually for ${planType} plan: ${expiresAt.toISOString()}`);
  return expiresAt;
}

/**
 * Helper to get user by external ID (our internal user_id)
 */
async function getUserByExternalId(externalId: string) {
  const supabase = await createServiceRoleClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, full_name, offers")
    .eq("id", externalId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  return user;
}

/**
 * Helper to create user credits record
 */
async function createUserCredits({
  userId,
  credits,
  planType,
  membership,
  polarSubscriptionId,
  polarCheckoutId,
  expiresAt,
}: {
  userId: string;
  credits: number;
  planType: PolarPlanType;
  membership: PolarMembership;
  polarSubscriptionId?: string;
  polarCustomerId?: string;
  polarCheckoutId?: string;
  expiresAt?: Date;
}) {
  const supabase = await createServiceRoleClient();

  // Build insert data - polar_checkout_id is optional (column may not exist yet)
  const insertData: Record<string, unknown> = {
    user_id: userId,
    credits,
    status: "active",
    plan_type: planType,
    membership,
    subscription_id: polarSubscriptionId || null,
    expires_at: expiresAt?.toISOString() || null,
    payment_provider: "polar",
    created_at: new Date().toISOString(),
  };

  // Add polar_checkout_id if provided (column may not exist in older schemas)
  if (polarCheckoutId) {
    insertData.polar_checkout_id = polarCheckoutId;
  }

  console.log("Inserting user credits:", JSON.stringify(insertData, null, 2));

  let { data, error } = await supabase.from("user_credits").insert([insertData]);

  // If polar_checkout_id column doesn't exist, retry without it
  // Error code 42703 = "column does not exist" in PostgreSQL
  if (error && (error.code === "42703" || error.message?.includes("polar_checkout_id"))) {
    console.log("polar_checkout_id column not found, retrying without it...");
    delete insertData.polar_checkout_id;
    const retryResult = await supabase.from("user_credits").insert([insertData]);
    data = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    console.error("Error creating user credits:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return null;
  }

  console.log("User credits created successfully:", data);
  return data;
}

/**
 * Check if a checkout has already been processed (idempotency check)
 * Checks both payments table and user_credits table for the checkout ID
 */
async function isCheckoutAlreadyProcessed(checkoutId: string, userId?: string): Promise<boolean> {
  const supabase = await createServiceRoleClient();

  // First, try to check payments table
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("id")
      .eq("polar_checkout_id", checkoutId)
      .maybeSingle();

    // If column doesn't exist (42703), we'll fall through to alternative checks
    if (error && (error as { code?: string }).code !== "42703") {
      console.error("Error checking payment idempotency:", error);
    }

    if (data) {
      console.log(`Checkout ${checkoutId} already found in payments table`);
      return true;
    }
  } catch (e) {
    console.log("payments.polar_checkout_id check failed, trying alternative");
  }

  // Second, check user_credits table for polar_checkout_id
  try {
    const { data, error } = await supabase
      .from("user_credits")
      .select("id")
      .eq("polar_checkout_id", checkoutId)
      .maybeSingle();

    if (error && (error as { code?: string }).code !== "42703") {
      console.error("Error checking user_credits idempotency:", error);
    }

    if (data) {
      console.log(`Checkout ${checkoutId} already found in user_credits table`);
      return true;
    }
  } catch (e) {
    console.log("user_credits.polar_checkout_id check failed");
  }

  // Third, if we have userId, check if there's a recent record created in last 5 minutes
  // This prevents duplicate processing even without the polar_checkout_id column
  if (userId) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentRecord } = await supabase
      .from("user_credits")
      .select("id, created_at, credits")
      .eq("user_id", userId)
      .eq("payment_provider", "polar")
      .gte("created_at", fiveMinutesAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentRecord) {
      console.log(`Found recent user_credits record for user ${userId} created at ${recentRecord.created_at} - possible duplicate`);
      return true;
    }
  }

  return false;
}

/**
 * Helper to record payment in payments table
 */
async function recordPayment({
  userId,
  quantity,
  price,
  paymentStatus,
  payerId,
  payerName,
  payerEmail,
  currency,
  polarCheckoutId,
}: {
  userId: string;
  quantity: number;
  price: number;
  paymentStatus: string;
  payerId: string;
  payerName: string;
  payerEmail: string;
  currency: string;
  polarCheckoutId: string;
}) {
  const supabase = await createServiceRoleClient();

  const { data, error } = await supabase.from("payments").insert({
    user_id: userId,
    quantity,
    price,
    payment_status: paymentStatus,
    payer_id: payerId,
    payer_name: payerName,
    payer_address: "",
    payer_email: payerEmail,
    currency,
    polar_checkout_id: polarCheckoutId,
    payment_provider: "polar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error recording payment:", error);
    return null;
  }

  return data;
}

/**
 * Helper to clear user offer after purchase
 */
async function clearUserOffer(userId: string, membership: string, price: number) {
  const supabase = await createServiceRoleClient();

  const { error } = await supabase
    .from("users")
    .update({
      offers: false,
      offer_plan_buy: membership,
      offer_price_buy: price,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error clearing user offer:", error);
  }
}

/**
 * Send confirmation email based on membership type
 */
async function sendConfirmationEmail(
  email: string,
  name: string,
  credits: number,
  membership: PolarMembership,
  isSubscription: boolean
) {
  try {
    if (isSubscription) {
      switch (membership) {
        case "pro":
          await sendProSubscriptionConfirmationMail({
            email,
            creatorName: name,
            credits,
          });
          break;

        case "super":
          await sendSuperSubscriptionConfirmationMail({
            email,
            creatorName: name,
            credits,
          });
          break;

        case "saver":
        default:
          await sendSaverSubscriptionConfirmationMail({
            email,
            creatorName: name,
            credits,
          });
          break;
      }
    } else {
      await sendRfqPurchaseConfiramtionEmail({
        email,
        creatorName: name,
        credits,
      });
    }

  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  /**
   * Handle successful checkout completion
   * This fires when a checkout session is successfully completed
   */
  onCheckoutUpdated: async (payload) => {
    console.log("=== Polar webhook: checkout.updated ===");
    console.log("FULL PAYLOAD:", JSON.stringify(payload, null, 2));
    console.log("FULL CHECKOUT DATA:", JSON.stringify(payload.data, null, 2));
    console.log("Checkout ID:", payload.data.id);
    console.log("Checkout status:", payload.data.status);

    // Only process completed checkouts
    if (payload.data.status !== "succeeded") {
      console.log("Checkout not succeeded, skipping:", payload.data.status);
      return;
    }

    const checkout = payload.data;
    const checkoutId = checkout.id;

    // Log all checkout fields for debugging
    console.log("=== CHECKOUT FIELDS ===");
    console.log("checkout.id:", checkout.id);
    console.log("checkout.status:", checkout.status);
    console.log("checkout.productId:", checkout.productId);
    console.log("checkout.subscriptionId:", checkout.subscriptionId);
    console.log("checkout.customerId:", checkout.customerId);
    console.log("checkout.externalCustomerId:", checkout.externalCustomerId);
    console.log("checkout.customerExternalId:", checkout.customerExternalId);
    console.log("checkout.customerEmail:", checkout.customerEmail);
    console.log("checkout.customerName:", checkout.customerName);
    console.log("checkout.metadata:", checkout.metadata);
    console.log("=== END CHECKOUT FIELDS ===");

    const metadata = (checkout.metadata || {}) as WebhookMetadata;
    console.log("Metadata:", JSON.stringify(metadata, null, 2));

    // Use camelCase property names as per Polar SDK types
    const customerId = checkout.customerId;
    // Use externalCustomerId (new) or fallback to deprecated customerExternalId
    const externalId = checkout.externalCustomerId || checkout.customerExternalId;
    console.log("Customer ID:", customerId);
    console.log("External ID:", externalId);

    // Get user ID from metadata or external ID
    const userId = metadata.userId || externalId;
    console.log("Resolved User ID:", userId);

    if (!userId) {
      console.error("No user ID found in checkout metadata or external ID");
      return;
    }

    // Idempotency check - prevent duplicate credit additions
    // Pass userId to check for recent records if column-based checks fail
    const alreadyProcessed = await isCheckoutAlreadyProcessed(checkoutId, userId);
    if (alreadyProcessed) {
      console.log(`Checkout ${checkoutId} already processed, skipping duplicate webhook`);
      return;
    }

    // Get user details
    const user = await getUserByExternalId(userId);
    console.log("User found:", user ? "yes" : "no", user);

    if (!user) {
      console.error("User not found:", userId);
      return;
    }

    const hasOffer = metadata.hasOffer === "true" || user.offers === true;
    const productId = checkout.productId;
    console.log("Product ID:", productId);
    console.log("Has offer:", hasOffer);

    if (!productId) {
      console.error("No product ID found in checkout");
      return;
    }

    const product = getPolarProductById(productId);
    console.log("Product found:", product ? product.name : "NOT FOUND");

    if (!product) {
      console.error("Product not found in config:", productId);
      return;
    }

    // Calculate credits with potential offer bonus
    const baseCredits = product.credits;
    const finalCredits = calculateCreditsWithOffer(baseCredits, hasOffer);

    // Calculate expiry date
    let expiresAt: Date | undefined;
    if (product.planType === "monthly") {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (product.planType === "yearly") {
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    // one_time has no expiry

    // For subscriptions, prefer to let onSubscriptionActive handle linking
    // Only set subscriptionId here if it's definitely available and valid
    const subscriptionIdFromCheckout = checkout.subscriptionId;
    console.log("checkout.subscriptionId:", subscriptionIdFromCheckout);
    console.log("Will create user_credits with subscription_id:", subscriptionIdFromCheckout || "NULL (will be linked later by onSubscriptionActive)");

    // Create user credits (store checkout ID for later subscription linking)
    // For subscription products, we intentionally leave subscription_id as NULL
    // so that onSubscriptionActive can properly link it later
    await createUserCredits({
      userId,
      credits: finalCredits,
      planType: product.planType,
      membership: product.membership,
      // For subscription products, don't set subscription_id here - let onSubscriptionActive handle it
      // This prevents timing issues where checkout fires before subscription is fully created
      // Only set subscription_id if it's a one-time purchase (which won't have onSubscriptionActive)
      polarSubscriptionId: product.type === "subscription" ? undefined : (subscriptionIdFromCheckout || undefined),
      polarCustomerId: customerId || undefined,
      polarCheckoutId: checkoutId,
      expiresAt,
    });

    // Record payment (with checkout ID for idempotency)
    await recordPayment({
      userId,
      quantity: finalCredits,
      price: product.price,
      paymentStatus: "COMPLETED",
      payerId: customerId || "",
      payerName: checkout.customerName || user.full_name || "",
      payerEmail: checkout.customerEmail || user.email || "",
      currency: "USD",
      polarCheckoutId: checkoutId,
    });

    // Clear offer if applicable
    if (hasOffer) {
      await clearUserOffer(userId, product.membership, product.price);
    }

    // Send confirmation email
    const isSubscription = product.type === "subscription";
    await sendConfirmationEmail(
      user.email,
      user.full_name || "Creator",
      finalCredits,
      product.membership,
      isSubscription
    );

    // Track conversion UTM - get user's first touch attribution and save as conversion
    try {
      const firstTouchResult = await getFirstTouchUTMServer(userId);
      if (firstTouchResult.success && firstTouchResult.data) {
        const firstTouch = firstTouchResult.data;
        await saveConversionUTMServer(
          userId,
          {
            utm_source: firstTouch.utm_source,
            utm_medium: firstTouch.utm_medium,
            utm_campaign: firstTouch.utm_campaign,
            utm_term: firstTouch.utm_term,
            utm_content: firstTouch.utm_content,
            utm_id: firstTouch.utm_id,
            gclid: firstTouch.gclid,
            fbclid: firstTouch.fbclid,
            referral_code: firstTouch.referral_code,
            landing_page: firstTouch.landing_page,
            referrer_url: firstTouch.referrer_url,
          },
          product.price,
          "USD"
        );
        console.log(`Polar: Conversion UTM tracked for user ${userId}`);
      }
    } catch (utmError) {
      console.error("Error tracking conversion UTM:", utmError);
    }

    console.log(
      `Polar: Credits added for user ${userId}: ${finalCredits} credits (${product.membership} ${product.planType})`
    );
  },

  /**
   * Handle subscription becoming active
   * This fires on initial activation and renewals
   */
  onSubscriptionActive: async (payload) => {
    console.log("=== Polar webhook: subscription.active ===");
    console.log("FULL SUBSCRIPTION PAYLOAD:", JSON.stringify(payload, null, 2));
    console.log("FULL SUBSCRIPTION DATA:", JSON.stringify(payload.data, null, 2));

    const subscription = payload.data;

    // Log all subscription fields for debugging
    console.log("=== SUBSCRIPTION FIELDS ===");
    console.log("subscription.id:", subscription.id);
    console.log("subscription.status:", subscription.status);
    console.log("subscription.productId:", subscription.productId);
    console.log("subscription.customerId:", subscription.customerId);
    console.log("subscription.checkoutId:", (subscription as any).checkoutId);
    console.log("subscription.userId:", (subscription as any).userId);
    console.log("subscription.user:", (subscription as any).user);
    console.log("subscription.customer:", (subscription as any).customer);
    console.log("subscription.metadata:", (subscription as any).metadata);
    console.log("subscription.cancelAtPeriodEnd:", (subscription as any).cancelAtPeriodEnd);
    console.log("subscription.currentPeriodEnd:", (subscription as any).currentPeriodEnd);
    console.log("subscription.currentPeriodStart:", (subscription as any).currentPeriodStart);
    console.log("subscription.recurringInterval:", (subscription as any).recurringInterval);
    console.log("=== END SUBSCRIPTION FIELDS ===");

    const supabase = await createServiceRoleClient();

    // First, try to find existing user_credits with this subscription
    const { data: existingCredits } = await supabase
      .from("user_credits")
      .select("user_id, subscription_status_canceled")
      .eq("subscription_id", subscription.id)
      .single();

    if (existingCredits) {
      // Check if this is just an update (like cancellation) not a renewal
      // If cancelAtPeriodEnd is true, this is a cancellation update, not a renewal
      const cancelAtPeriodEnd = (subscription as any).cancelAtPeriodEnd;
      if (cancelAtPeriodEnd) {
        console.log(`Polar: Subscription ${subscription.id} is marked for cancellation at period end, skipping renewal`);
        return;
      }

      // This is a renewal - add credits to existing user
      const product = getPolarProductById(subscription.productId);
      if (!product) return;

      const user = await getUserByExternalId(existingCredits.user_id);
      const hasOffer = user?.offers === true;
      const finalCredits = calculateCreditsWithOffer(product.credits, hasOffer);

      // Calculate new expiry - use Polar's currentPeriodEnd if available
      const polarCurrentPeriodEnd = (subscription as any).currentPeriodEnd || (subscription as any).current_period_end;
      const expiresAt = calculateExpiryDate(product.planType, polarCurrentPeriodEnd);

      // Update existing record with new credits and expiry
      await supabase
        .from("user_credits")
        .update({
          credits: finalCredits,
          expires_at: expiresAt?.toISOString() || null,
          status: "active",
          subscription_status_canceled: false,
          updated_at: new Date().toISOString(),
        })
        .eq("subscription_id", subscription.id);

      console.log(`Polar: Subscription renewed for user ${existingCredits.user_id}: ${finalCredits} credits, expires: ${expiresAt?.toISOString()}`);
    } else {
      // New subscription - find user_credits and link with subscription_id
      const product = getPolarProductById(subscription.productId);
      const checkoutId = (subscription as any).checkoutId;
      const metadata = (subscription as any).metadata || {};
      const customer = (subscription as any).customer || {};

      // Get user ID from metadata or customer.externalId
      const userId = metadata.userId || customer.externalId;
      console.log("=== LINKING SUBSCRIPTION ===");
      console.log("subscription.id:", subscription.id);
      console.log("checkoutId:", checkoutId);
      console.log("userId from metadata/customer:", userId);
      console.log("product:", product ? `${product.membership}/${product.planType}` : "NOT FOUND");

      if (!product) {
        console.error("Product not found for subscription:", subscription.productId);
        return;
      }

      let userCredits: { id: string; user_id: string } | null = null;

      // FIRST: Try to find user_credits by user_id with NULL subscription_id
      if (userId) {
        console.log("Trying to find user_credits by user_id with NULL subscription_id:", userId);
        const { data: byUser, error: byUserError } = await supabase
          .from("user_credits")
          .select("id, user_id, membership, plan_type, payment_provider, subscription_id")
          .eq("user_id", userId)
          .eq("payment_provider", "polar")
          .is("subscription_id", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        console.log("Query by user_id (NULL subscription) result:", byUser, "error:", byUserError);

        if (byUser) {
          userCredits = byUser;
          console.log("Found user_credits by user_id with NULL subscription:", userCredits.id);
        }
      }

      // SECOND: If not found, try to find ANY recent Polar record for this user
      // This handles the case where checkout created a record but subscription_id might have been set incorrectly
      if (!userCredits && userId) {
        console.log("Trying to find recent Polar user_credits for user (regardless of subscription_id):", userId);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: recentByUser, error: recentError } = await supabase
          .from("user_credits")
          .select("id, user_id, membership, plan_type, payment_provider, subscription_id, created_at")
          .eq("user_id", userId)
          .eq("payment_provider", "polar")
          .gte("created_at", fiveMinutesAgo)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        console.log("Query by user_id (recent, any subscription_id) result:", recentByUser, "error:", recentError);

        if (recentByUser) {
          // Only use if subscription_id is null or different from current
          if (!recentByUser.subscription_id || recentByUser.subscription_id !== subscription.id) {
            userCredits = recentByUser;
            console.log("Found recent user_credits for user:", userCredits.id, "current subscription_id:", recentByUser.subscription_id);
          }
        }
      }

      // Second, try to find by checkout ID if available
      // Note: polar_checkout_id column may not exist in older schemas
      if (!userCredits && checkoutId) {
        console.log("Trying to find user_credits by checkout ID:", checkoutId);
        try {
          const { data: byCheckout, error: byCheckoutError } = await supabase
            .from("user_credits")
            .select("id, user_id")
            .eq("polar_checkout_id", checkoutId)
            .is("subscription_id", null)
            .single();

          console.log("Query by checkoutId result:", byCheckout, "error:", byCheckoutError);

          // Skip if column doesn't exist error (42703)
          if (byCheckoutError && (byCheckoutError as { code?: string }).code === "42703") {
            console.log("polar_checkout_id column doesn't exist, skipping");
          } else if (byCheckout) {
            userCredits = byCheckout;
            console.log("Found user_credits by checkout ID:", userCredits.id);
          }
        } catch (e) {
          console.log("polar_checkout_id column may not exist, skipping checkout ID lookup");
        }
      }

      // Fallback: find ANY recent Polar user_credits without a subscription_id
      if (!userCredits) {
        console.log("Trying to find ANY recent Polar user_credits without subscription_id...");
        const { data: byAny, error: byAnyError } = await supabase
          .from("user_credits")
          .select("id, user_id, membership, plan_type")
          .eq("payment_provider", "polar")
          .is("subscription_id", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        console.log("Query by ANY result:", byAny, "error:", byAnyError);

        if (byAny) {
          userCredits = byAny;
          console.log("Found user_credits by fallback:", userCredits.id);
        }
      }

      if (!userCredits) {
        console.log("No unlinked user_credits found for new subscription");

        // Check if user already has ANY Polar subscription record (even with different subscription_id)
        // This handles the case where user purchases a new plan while having an existing one
        if (userId) {
          console.log("Checking if user has any existing Polar subscription...");
          const { data: existingUserSub, error: existingError } = await supabase
            .from("user_credits")
            .select("id, user_id, subscription_id, membership, plan_type")
            .eq("user_id", userId)
            .eq("payment_provider", "polar")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          console.log("Existing user subscription check:", existingUserSub, "error:", existingError);

          if (existingUserSub) {
            // User already has an active Polar subscription - update it with new subscription details
            console.log(`User ${userId} already has subscription, updating to new subscription ${subscription.id}`);

            const user = await getUserByExternalId(userId);
            const hasOffer = user?.offers === true;
            const finalCredits = calculateCreditsWithOffer(product.credits, hasOffer);

            // Calculate expiry date - use Polar's currentPeriodEnd if available
            const polarCurrentPeriodEnd = (subscription as any).currentPeriodEnd || (subscription as any).current_period_end;
            const expiresAt = calculateExpiryDate(product.planType, polarCurrentPeriodEnd);

            // Update the existing record with new subscription details
            const { error: updateError } = await supabase
              .from("user_credits")
              .update({
                subscription_id: subscription.id,
                membership: product.membership,
                plan_type: product.planType,
                credits: finalCredits,
                expires_at: expiresAt?.toISOString() || null,
                status: "active",
                subscription_status_canceled: false,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingUserSub.id);

            if (updateError) {
              console.error("Error updating existing subscription:", updateError);
            } else {
              console.log(`Polar: Updated user ${userId} subscription from ${existingUserSub.subscription_id} to ${subscription.id}, expires: ${expiresAt?.toISOString()}`);
            }
            return;
          }
        }

        // No existing subscription found - create a new record
        console.log("Creating new user_credits record");

        if (!userId) {
          console.error("Cannot create user_credits: no userId available");
          return;
        }

        const user = await getUserByExternalId(userId);
        if (!user) {
          console.error("Cannot create user_credits: user not found:", userId);
          return;
        }

        const hasOffer = user.offers === true;
        const finalCredits = calculateCreditsWithOffer(product.credits, hasOffer);

        // Calculate expiry date - use Polar's currentPeriodEnd if available
        const polarCurrentPeriodEnd = (subscription as any).currentPeriodEnd || (subscription as any).current_period_end;
        const expiresAt = calculateExpiryDate(product.planType, polarCurrentPeriodEnd);

        // Create the user_credits record with subscription_id already linked
        await createUserCredits({
          userId,
          credits: finalCredits,
          planType: product.planType,
          membership: product.membership,
          polarSubscriptionId: subscription.id,
          expiresAt,
        });
        console.log(`Polar: Created new subscription record, expires: ${expiresAt?.toISOString()}`);

        // Also record the payment since checkout.updated didn't create it
        await recordPayment({
          userId,
          quantity: finalCredits,
          price: product.price,
          paymentStatus: "COMPLETED",
          payerId: subscription.customerId || "",
          payerName: customer.name || user.full_name || "",
          payerEmail: customer.email || user.email || "",
          currency: "USD",
          polarCheckoutId: checkoutId || subscription.id, // Use subscription ID as fallback
        });

        // Clear offer if applicable
        if (hasOffer) {
          await clearUserOffer(userId, product.membership, product.price);
        }

        // Send confirmation email
        await sendConfirmationEmail(
          user.email,
          user.full_name || "Creator",
          finalCredits,
          product.membership,
          true // isSubscription
        );

        console.log(`Polar: Created user_credits for user ${userId} with subscription ${subscription.id}: ${finalCredits} credits`);
        return;
      }

      // Update the user_credits with the subscription_id
      console.log(`Updating user_credits ${userCredits.id} with subscription_id ${subscription.id}`);
      const { error: updateError, data: updateData } = await supabase
        .from("user_credits")
        .update({
          subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userCredits.id)
        .select();

      if (updateError) {
        console.error("Error linking subscription to user_credits:", updateError);
      } else {
        console.log(`Polar: Linked subscription ${subscription.id} to user_credits ${userCredits.id}`, updateData);
      }
      console.log("=== END LINKING SUBSCRIPTION ===");
    }
  },

  /**
   * Handle subscription cancellation
   */
  onSubscriptionCanceled: async (payload) => {
    console.log("Polar webhook: subscription.canceled", payload.data.id);
    console.log("FULL CANCELLATION PAYLOAD:", JSON.stringify(payload, null, 2));

    const subscription = payload.data;
    const supabase = await createServiceRoleClient();

    // Get our product config to determine the correct plan type
    const product = getPolarProductById(subscription.productId);
    console.log("Product from config:", product ? `${product.name} (${product.planType})` : "NOT FOUND");

    // Get the end date from Polar - this is when the subscription actually expires
    // Polar provides currentPeriodEnd or endsAt which is the actual subscription end date
    const currentPeriodEnd = (subscription as any).currentPeriodEnd || (subscription as any).current_period_end;
    const endsAt = (subscription as any).endsAt || (subscription as any).ends_at;
    const cancelAt = (subscription as any).cancelAt || (subscription as any).cancel_at;
    const startedAt = (subscription as any).startedAt || (subscription as any).started_at || (subscription as any).createdAt || (subscription as any).created_at;

    // Use the best available date from Polar - priority: currentPeriodEnd > endsAt > cancelAt
    let expirationDate = currentPeriodEnd || endsAt || cancelAt;

    console.log("Cancellation dates from Polar:");
    console.log("- currentPeriodEnd:", currentPeriodEnd);
    console.log("- endsAt:", endsAt);
    console.log("- cancelAt:", cancelAt);
    console.log("- startedAt:", startedAt);
    console.log("- Initial expiration date from Polar:", expirationDate);

    // WORKAROUND: If our product config says yearly but Polar returns a date less than 6 months away,
    // Polar's product might be misconfigured. Calculate the correct yearly expiry based on start date.
    if (product && product.planType === "yearly" && expirationDate && startedAt) {
      const polarExpiry = new Date(expirationDate);
      const startDate = new Date(startedAt);
      const monthsDiff = (polarExpiry.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

      console.log(`Months between start and Polar expiry: ${monthsDiff.toFixed(1)}`);

      // If Polar says expiry is less than 6 months from start, it's probably wrong for a yearly plan
      if (monthsDiff < 6) {
        console.log("WARNING: Polar returned monthly expiry for yearly plan. Calculating correct yearly expiry.");
        const correctExpiry = new Date(startDate);
        correctExpiry.setFullYear(correctExpiry.getFullYear() + 1);
        expirationDate = correctExpiry.toISOString();
        console.log(`Corrected expiration date: ${expirationDate}`);
      }
    }

    // Also check existing user_credits to get the original expiry if it was set correctly
    const { data: existingCredits } = await supabase
      .from("user_credits")
      .select("expires_at, plan_type, created_at")
      .eq("subscription_id", subscription.id)
      .single();

    // If we have existing credits with yearly plan_type and a valid expires_at that's more than 6 months away, keep it
    if (existingCredits && existingCredits.plan_type === "yearly" && existingCredits.expires_at) {
      const existingExpiry = new Date(existingCredits.expires_at);
      const now = new Date();
      const monthsUntilExpiry = (existingExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

      console.log(`Existing expires_at: ${existingCredits.expires_at}, months until expiry: ${monthsUntilExpiry.toFixed(1)}`);

      // If existing expiry is more than 6 months away, it's probably correct - don't overwrite
      if (monthsUntilExpiry > 6) {
        console.log("Keeping existing expires_at as it appears correct for yearly plan");
        expirationDate = existingCredits.expires_at;
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      subscription_status_canceled: true,
      updated_at: new Date().toISOString(),
    };

    // Set the expiration date
    if (expirationDate) {
      updateData.expires_at = new Date(expirationDate).toISOString();
      console.log(`Setting expires_at to: ${updateData.expires_at}`);
    }

    // Mark subscription as canceled but don't remove credits yet
    // Credits remain valid until expires_at
    const { error } = await supabase
      .from("user_credits")
      .update(updateData)
      .eq("subscription_id", subscription.id);

    if (error) {
      console.error("Error marking subscription as canceled:", error);
    } else {
      console.log(`Polar: Subscription ${subscription.id} marked as canceled, expires at: ${expirationDate || 'unchanged'}`);
    }
  },

  /**
   * Handle subscription revocation (immediate termination)
   */
  onSubscriptionRevoked: async (payload) => {
    console.log("Polar webhook: subscription.revoked", payload.data.id);

    const subscription = payload.data;
    const supabase = await createServiceRoleClient();

    // Immediately expire the subscription
    const { error } = await supabase
      .from("user_credits")
      .update({
        status: "expired",
        subscription_status_canceled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subscription.id);

    if (error) {
      console.error("Error revoking subscription:", error);
    } else {
      console.log(`Polar: Subscription ${subscription.id} revoked`);
    }
  },

  /**
   * Handle subscription uncancellation
   */
  onSubscriptionUncanceled: async (payload) => {
    console.log("Polar webhook: subscription.uncanceled", payload.data.id);

    const subscription = payload.data;
    const supabase = await createServiceRoleClient();

    // Remove canceled flag
    const { error } = await supabase
      .from("user_credits")
      .update({
        subscription_status_canceled: false,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subscription.id);

    if (error) {
      console.error("Error uncanceling subscription:", error);
    } else {
      console.log(`Polar: Subscription ${subscription.id} uncanceled`);
    }
  },

  /**
   * Handle subscription updates (plan changes - upgrades/downgrades)
   */
  onSubscriptionUpdated: async (payload) => {
    console.log("=== Polar webhook: subscription.updated ===");
    console.log("FULL PAYLOAD:", JSON.stringify(payload, null, 2));

    const subscription = payload.data;
    const supabase = await createServiceRoleClient();

    console.log("=== SUBSCRIPTION UPDATE FIELDS ===");
    console.log("subscription.id:", subscription.id);
    console.log("subscription.status:", subscription.status);
    console.log("subscription.productId:", subscription.productId);
    console.log("subscription.amount:", (subscription as any).amount);
    console.log("=== END SUBSCRIPTION UPDATE FIELDS ===");

    // Get the new product details
    const newProduct = getPolarProductById(subscription.productId);
    if (!newProduct) {
      console.error("Product not found for updated subscription:", subscription.productId);
      return;
    }

    // Find existing user_credits for this subscription
    const { data: existingCredits, error: fetchError } = await supabase
      .from("user_credits")
      .select("id, user_id, membership, plan_type, credits")
      .eq("subscription_id", subscription.id)
      .single();

    if (fetchError || !existingCredits) {
      console.log("No existing user_credits found for subscription update:", subscription.id);
      return;
    }

    const previousMembership = existingCredits.membership;
    const previousCredits = existingCredits.credits;
    const isUpgrade = newProduct.credits > previousCredits;

    console.log(`Plan change detected: ${previousMembership} -> ${newProduct.membership}`);
    console.log(`Credits change: ${previousCredits} -> ${newProduct.credits} (${isUpgrade ? 'UPGRADE' : 'DOWNGRADE'})`);

    // Calculate expiry date - use Polar's currentPeriodEnd if available
    const polarCurrentPeriodEnd = (subscription as any).currentPeriodEnd || (subscription as any).current_period_end;
    const expiresAt = calculateExpiryDate(newProduct.planType, polarCurrentPeriodEnd);

    // Update user_credits with new plan details
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        membership: newProduct.membership,
        plan_type: newProduct.planType,
        credits: newProduct.credits,
        expires_at: expiresAt?.toISOString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subscription.id);

    if (updateError) {
      console.error("Error updating user_credits for plan change:", updateError);
    } else {
      console.log(`Polar: Updated subscription ${subscription.id} to ${newProduct.membership} plan, expires: ${expiresAt?.toISOString()}`);
    }

    // Record the plan change payment
    // For upgrades, Polar charges prorated difference immediately
    // For downgrades, credit is applied to next billing cycle
    const user = await getUserByExternalId(existingCredits.user_id);
    if (user) {
      await recordPayment({
        userId: existingCredits.user_id,
        quantity: newProduct.credits,
        price: newProduct.price,
        paymentStatus: isUpgrade ? "UPGRADE" : "DOWNGRADE",
        payerId: subscription.customerId || "",
        payerName: user.full_name || "",
        payerEmail: user.email || "",
        currency: "USD",
        polarCheckoutId: `plan_change_${subscription.id}_${Date.now()}`, // Unique ID for plan changes
      });
      console.log(`Polar: Recorded ${isUpgrade ? 'upgrade' : 'downgrade'} payment for user ${existingCredits.user_id}`);
    }
  },

  /**
   * Handle completed orders (one-time purchases and subscription payments)
   */
  onOrderPaid: async (payload) => {
    console.log("=== Polar webhook: order.paid ===");
    console.log("FULL ORDER PAYLOAD:", JSON.stringify(payload, null, 2));

    const order = payload.data;

    // Log ALL order fields for debugging
    console.log("=== ORDER FIELDS ===");
    console.log("order.id:", order.id);
    console.log("order.productId:", order.productId);
    console.log("order.amount:", (order as any).amount);
    console.log("order.billingReason:", (order as any).billingReason);
    console.log("order.billing_reason:", (order as any).billing_reason);
    console.log("order.subscriptionId:", (order as any).subscriptionId);
    console.log("order.subscription_id:", (order as any).subscription_id);
    console.log("order.customerId:", (order as any).customerId);
    console.log("order.customer_id:", (order as any).customer_id);
    console.log("order.customer:", (order as any).customer);
    console.log("=== END ORDER FIELDS ===");

    // Check if this is a subscription-related order (upgrade/renewal)
    // Polar may use camelCase or snake_case depending on SDK version
    const billingReason = (order as any).billingReason || (order as any).billing_reason;
    const subscriptionId = (order as any).subscriptionId || (order as any).subscription_id;

    // For any subscription-related order, check if it's an upgrade
    if (subscriptionId) {
      console.log(`Order paid for subscription: ${subscriptionId}, billing_reason: ${billingReason}`);

      const supabase = await createServiceRoleClient();

      // Find the user for this subscription
      const { data: creditRecord } = await supabase
        .from("user_credits")
        .select("user_id, membership")
        .eq("subscription_id", subscriptionId)
        .single();

      if (creditRecord) {
        const user = await getUserByExternalId(creditRecord.user_id);
        const product = order.productId ? getPolarProductById(order.productId) : null;

        if (user && product) {
          // Determine payment status based on billing reason
          let paymentStatus = "SUBSCRIPTION_PAYMENT";
          if (billingReason === "subscription_update" || billingReason === "purchase") {
            paymentStatus = "UPGRADE_PAYMENT";
          } else if (billingReason === "subscription_cycle") {
            paymentStatus = "RENEWAL";
          }

          // Record the payment
          await recordPayment({
            userId: creditRecord.user_id,
            quantity: product.credits,
            price: product.price,
            paymentStatus,
            payerId: (order as any).customerId || (order as any).customer_id || "",
            payerName: user.full_name || "",
            payerEmail: user.email || "",
            currency: "USD",
            polarCheckoutId: order.id, // Use order ID as unique identifier
          });

          console.log(`Polar: Recorded ${paymentStatus} payment for order ${order.id}`);
        }
      }
    }
    // For regular checkouts without subscription, handling is done in onCheckoutUpdated
  },

  /**
   * Handle refunds
   */
  onRefundCreated: async (payload) => {
    console.log("Polar webhook: refund.created", payload.data.id);

    const refund = payload.data;

    // Log the refund but don't automatically remove credits
    // This should be handled manually to avoid issues
    console.log(`Polar: Refund created for order ${refund.orderId}, amount: ${refund.amount}`);

    // Optionally: You could implement automatic credit removal here
    // But it's safer to handle refunds manually through admin dashboard
  },

  /**
   * Catch-all for any unhandled events
   */
  onPayload: async (payload) => {
    console.log("Polar webhook received:", payload.type);
  },
});
