import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  // Get ambassador details (referralCode only)
  const { data: ambassador, error: ambassadorError } = await supabase
    .from("users")
    .select("id, referralCode")
    .eq("id", user.id)
    .maybeSingle();

  if (ambassadorError || !ambassador) {
    return NextResponse.json({ error: "Ambassador not found" }, { status: 404 });
  }

  // Count total referrals
  const { count: totalReferrals, error: referralsError } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("referredBy", ambassador.id);

  if (referralsError) {
    return NextResponse.json({ error: referralsError.message }, { status: 500 });
  }

  //Fetch all referred users and sum their offer_price_buy values
  const { data: referredUsers, error: referredUsersError } = await supabase
    .from("users")
    .select("offer_price_buy, offer_plan_buy")
    .eq("referredBy", ambassador.id);

  if (referredUsersError) {
    return NextResponse.json({ error: referredUsersError.message }, { status: 500 });
  }

  // Sum up total purchases from referred users
  const totalPurchaseCount =
    referredUsers?.reduce((sum, user) => {
      const value = parseFloat(user.offer_price_buy) || 0;
      return sum + value;
    }, 0) ?? 0;

  const totalRefferralsFee = totalPurchaseCount * 0.15;

  //Count how many referred users actually purchased a plan
  const totalPaidReferrals =
    referredUsers?.filter((u) => u.offer_plan_buy && u.offer_plan_buy.trim() !== "").length ?? 0;

  // fetch ambassador payout details
  const { data: payoutDetails, error: payoutError } = await supabase
    .from("ambassador_details")
    .select("*")
    .eq("user_id", ambassador.id)
    .maybeSingle();

  if (payoutError) {
    return NextResponse.json({ error: payoutError.message }, { status: 500 });
  }

  // Return results
  return NextResponse.json({
    referralCode: ambassador.referralCode,
    totalReferrals: totalReferrals || 0,
    totalPurchaseCount,
    totalPaidReferrals,
    totalRefferralsFee,
    payoutDetails: payoutDetails || null,
  });
}
