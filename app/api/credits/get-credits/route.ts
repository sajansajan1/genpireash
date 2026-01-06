import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // --- Query 1: Get ALL user records, ordered OLDEST to newest ---
    let { data: allRecords, error: recordsError } = await supabase
      .from("user_credits")
      .select("id, credits, status, plan_type, subscription_id, membership, created_at, expires_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (recordsError) {
      console.error("Supabase query error:", recordsError);
      return NextResponse.json({ error: "Failed to fetch user credit history" }, { status: 500 });
    }

    if (!allRecords || allRecords.length === 0) {
      return NextResponse.json({
        credits: 0,
        membershipStatus: "inactive",
        planType: "none",
        canBuy: true,
        hasEverHadSubscription: false,
        message: "You can purchase a new plan.",
        subscription_id: null,
        membership: null,
        expires_at: null,
      });
    }

    // --- NEW: Auto-expire ONE-TIME plans with zero credits ---
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

    // 1. Filter for all subscriptions that are still active
    const activeSubscriptions = allRecords.filter((record) => record.status === "active");

    // 2. Calculate the TOTAL credits from all remaining active subscriptions
    const totalCredits = activeSubscriptions.reduce((sum, record) => sum + record.credits, 0);

    // 3. The subscription for DETAILS is the earliest active one that still has credits
    const subscriptionForDetails = activeSubscriptions.find((sub) => sub.credits > 0) || null;

    // Initialize response variables
    let membershipStatus = "expired";
    let planType = "none";
    let subscription_id = null;
    let membership = null;
    let message = "";
    let expires_at = null;

    // 4. Populate details based on the state of active subscriptions
    if (activeSubscriptions.length > 0) {
      // There's at least one active subscription
      const detailsSource = subscriptionForDetails || activeSubscriptions[0]; // Fallback to the first active sub if all have 0 credits
      membershipStatus = "active";
      planType = detailsSource.plan_type;
      subscription_id = detailsSource.subscription_id;
      membership = detailsSource.membership;
      expires_at = detailsSource.expires_at;
      if (totalCredits > 0) {
        message = `You have an active plan with a total of ${totalCredits} credits. You can add more at any time.`;
      } else {
        message = "You have an active plan but have run out of credits. You can purchase more.";
      }
    } else {
      // No active subscriptions at all, fall back to the latest record for context
      const latestRecord = allRecords[allRecords.length - 1];
      membershipStatus = latestRecord.status; // will be 'expired'
      planType = latestRecord.plan_type;
      subscription_id = latestRecord.subscription_id;
      membership = latestRecord.membership;
      message = "You do not have an active plan. Please purchase a new one.";
      expires_at = latestRecord.expires_at;
    }

    const { data: historyData, error: historyError } = await supabase
      .from("user_credits")
      .select("id") // Select a minimal field to check for existence
      .eq("user_id", user.id)
      .in("membership", ["pro"])
      .limit(1);

    if (historyError) {
      console.error("Supabase query error (history):", historyError);
      return NextResponse.json({ error: "Failed to fetch user history" }, { status: 500 });
    }
    console.log("History Data:", historyData);
    const hasEverHadSubscription = historyData && historyData.length > 0;

    // User can always buy credits
    const canBuy = true;

    // Return the final, structured response
    return NextResponse.json({
      credits: totalCredits,
      membershipStatus,
      planType,
      canBuy,
      hasEverHadSubscription,
      message,
      subscription_id,
      membership,
      expires_at,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
