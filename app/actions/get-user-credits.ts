"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server action to get user credits
 * This is the SINGLE SOURCE OF TRUTH for credits data
 * Used by both initial fetch and real-time updates
 */
export interface UserCreditsData {
  credits: number;
  membershipStatus: string;
  planType: string;
  canBuy: boolean;
  hasEverHadSubscription: boolean;
  message: string;
  subscription_id: string | null;
  membership: string | null;
  expires_at: string | null;
  subscription_status_canceled: boolean;
  payment_provider: string | null;
}

export async function getUserCredits(): Promise<{
  success: boolean;
  data?: UserCreditsData;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Query ALL user credit records, ordered OLDEST to newest
    let { data: allRecords, error: recordsError } = await supabase
      .from("user_credits")
      .select(
        "id, credits, status, plan_type, subscription_id, membership, created_at, expires_at, subscription_status_canceled, payment_provider"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (recordsError) {
      console.error("Supabase query error:", recordsError);
      return { success: false, error: "Failed to fetch user credit history" };
    }

    // No records found
    if (!allRecords || allRecords.length === 0) {
      return {
        success: true,
        data: {
          credits: 0,
          membershipStatus: "inactive",
          planType: "none",
          canBuy: true,
          hasEverHadSubscription: false,
          message: "You can purchase a new plan.",
          subscription_id: null,
          membership: null,
          expires_at: null,
          subscription_status_canceled: false,
          payment_provider: null,
        },
      };
    }

    // Auto-expire ONE-TIME plans with zero credits
    const oneTimePlansToExpire = allRecords.filter(
      (record) => record.status === "active" && record.credits === 0 && record.plan_type === "one_time"
    );

    if (oneTimePlansToExpire.length > 0) {
      const idsToExpire = oneTimePlansToExpire.map((sub) => sub.id);
      await supabase.from("user_credits").update({ status: "expired" }).in("id", idsToExpire);

      allRecords = allRecords.map((record) =>
        idsToExpire.includes(record.id) ? { ...record, status: "expired" } : record
      );
    }

    // Filter for active subscriptions
    const activeSubscriptions = allRecords.filter((record) => record.status === "active");

    // Calculate TOTAL credits from all active subscriptions
    const totalCredits = activeSubscriptions.reduce((sum, record) => sum + record.credits, 0);

    // Get subscription details from the MOST RECENT active subscription that is NOT cancelled
    // Priority: 1. Active & not cancelled, 2. Has subscription_id, 3. Most recent
    const activeNonCancelledSubs = activeSubscriptions
      .filter((sub) => !sub.subscription_status_canceled)
      .reverse(); // Reverse to get most recent first (since we ordered ascending)

    const subscriptionForDetails =
      // First try: non-cancelled with subscription_id
      activeNonCancelledSubs.find((sub) => sub.subscription_id) ||
      // Second try: any non-cancelled with credits
      activeNonCancelledSubs.find((sub) => sub.credits > 0) ||
      // Fallback: most recent active subscription (even if cancelled)
      activeSubscriptions[activeSubscriptions.length - 1] ||
      null;

    // Initialize response variables
    let membershipStatus = "expired";
    let planType = "none";
    let subscription_id = null;
    let membership = null;
    let message = "";
    let expires_at = null;
    let subscription_status_canceled = false;
    let payment_provider: string | null = null;

    // Populate details based on active subscriptions
    if (activeSubscriptions.length > 0) {
      const detailsSource = subscriptionForDetails || activeSubscriptions[0];
      membershipStatus = "active";
      planType = detailsSource.plan_type;
      subscription_id = detailsSource.subscription_id;
      membership = detailsSource.membership;
      expires_at = detailsSource.expires_at;
      subscription_status_canceled = detailsSource.subscription_status_canceled;
      payment_provider = detailsSource.payment_provider || null;

      if (totalCredits > 0) {
        message = `You have an active plan with a total of ${totalCredits} credits. You can add more at any time.`;
      } else {
        message = "You have an active plan but have run out of credits. You can purchase more.";
      }
    } else {
      // No active subscriptions
      const latestRecord = allRecords[allRecords.length - 1];
      membershipStatus = latestRecord.status;
      planType = latestRecord.plan_type;
      subscription_id = latestRecord.subscription_id;
      membership = latestRecord.membership;
      message = "You do not have an active plan. Please purchase a new one.";
      expires_at = latestRecord.expires_at;
      subscription_status_canceled = latestRecord.subscription_status_canceled;
      payment_provider = latestRecord.payment_provider || null;
    }

    // Check if user has ever had a pro subscription
    const { data: historyData, error: historyError } = await supabase
      .from("user_credits")
      .select("id")
      .eq("user_id", user.id)
      .in("membership", ["pro"])
      .limit(1);

    if (historyError) {
      console.error("Supabase query error (history):", historyError);
      return { success: false, error: "Failed to fetch user history" };
    }

    const hasEverHadSubscription = historyData && historyData.length > 0;
    const canBuy = true;

    return {
      success: true,
      data: {
        credits: totalCredits,
        membershipStatus,
        planType,
        canBuy,
        hasEverHadSubscription,
        message,
        subscription_id,
        membership,
        expires_at,
        subscription_status_canceled,
        payment_provider,
      },
    };
  } catch (err) {
    console.error("Unexpected error in getUserCredits:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Internal server error",
    };
  }
}
