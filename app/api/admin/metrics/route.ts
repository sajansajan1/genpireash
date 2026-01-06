import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(req.url);

    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam || !endParam) {
      return NextResponse.json(
        {
          error: "Missing date range. Please provide ?start=YYYY-MM-DD&end=YYYY-MM-DD",
        },
        { status: 400 }
      );
    }

    // Convert to Date objects
    let startDate = new Date(startParam);
    let endDate = new Date(endParam);

    // const now = new Date();
    // const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // const endOfThisMonth = new Date(
    //   now.getFullYear(),
    //   now.getMonth() + 1,
    //   0,
    //   23,
    //   59,
    //   59
    // );

    // const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // const endOfLastMonth = new Date(
    //   now.getFullYear(),
    //   now.getMonth(),
    //   0,
    //   23,
    //   59,
    //   59
    // );

    // // If both dates are the same day, set startDate to 24 hours before endDate
    // if (startDate.toDateString() === endDate.toDateString()) {
    //   startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    // }

    // // Ensure valid range
    // if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    //   return NextResponse.json(
    //     { error: "Invalid date format. Use ISO string or YYYY-MM-DD format." },
    //     { status: 400 }
    //   );
    // }

    // //////////////////////////////////////////////////
    // // 1️⃣ Active users this month
    // const { data: activeThisMonth, error: activeErr } = await supabase.rpc(
    //   "get_active_user_count",
    //   {
    //     start_date: startOfThisMonth.toISOString(),
    //     end_date: endOfThisMonth.toISOString(),
    //   }
    // );
    // if (activeErr) throw activeErr;

    // // 2️⃣ Active users last month
    // const { data: activeLastMonth, error: prevErr } = await supabase.rpc(
    //   "get_active_user_count",
    //   {
    //     start_date: startOfLastMonth.toISOString(),
    //     end_date: endOfLastMonth.toISOString(),
    //   }
    // );
    // if (prevErr) throw prevErr;

    // // 3️⃣ Retained users (active in both)
    // const { data: retained, error: retainErr } = await supabase.rpc(
    //   "get_retained_user_count",
    //   {
    //     prev_start: startOfLastMonth.toISOString(),
    //     prev_end: endOfLastMonth.toISOString(),
    //     curr_start: startOfThisMonth.toISOString(),
    //     curr_end: endOfThisMonth.toISOString(),
    //   }
    // );
    // if (retainErr) throw retainErr;

    // // 4️⃣ New users this month (created_at)

    // // 📊 Calculations
    // const retentionRate =
    //   activeLastMonth && activeLastMonth > 0
    //     ? ((retained / activeLastMonth) * 100).toFixed(2)
    //     : "0.00";

    ///////////////////////////////////

    // Adjust endDate to include the entire day
    // endDate.setHours(23, 59, 59, 999);

    // 1️⃣ Count new signups in the given date range
    const { count: signups, error: signupErr } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (signupErr) throw signupErr;

    const { count: lastActive, error: lastActiveErr } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
    if (lastActiveErr) throw lastActiveErr;

    const { count: totalUsers, error: totalUsersErr } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (totalUsersErr) throw totalUsersErr;

    const { count: newUsers, error: newUsersErr } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString()) // from startDate
      .lte("created_at", endDate.toISOString()); // to endDate

    if (newUsersErr) throw newUsersErr;

    // 2️⃣ Count new plans purchased in the same range (ignore one_time)
    const { count: plans, error: plansErr } = await supabase
      .from("user_credits")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .neq("plan_type", "one_time");

    if (plansErr) throw plansErr;

    const { count: tech_packs, error: tech_packsErr } = await supabase
      .from("product_ideas")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
    // .neq("plan_type", "one_time");

    if (tech_packsErr) throw plansErr;

    const { data, error } = await supabase.rpc("get_active_user_counts");
    console.log("data ==> ", data);

    //////retention data
    // const { data: retentionData, error: retentionError } = await supabase.rpc("get_active_user_retention");

    // if (retentionError) throw retentionError;
    // console.log("Retention data:", retentionData);

    // 📊 Calculate ratio (%)
    const percentage = signups && signups > 0 ? ((plans || 0) / signups) * 100 : 0;

    // const newUserShare =
    //   activeThisMonth && activeThisMonth > 0
    //     ? ((newUsers / activeThisMonth) * 100).toFixed(2)
    //     : "0.00";
    return NextResponse.json({
      range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      totalSignups: signups || 0,
      totalPlansPurchased: plans || 0,
      percentage: signups && signups > 0 && plans != null ? ((plans / signups) * 100).toFixed(2) : 0,

      message: `${percentage.toFixed(
        2
      )}% of users who signed up between ${startDate.toDateString()} and ${endDate.toDateString()} purchased a subscription plan.`,
      data,
      tech_packs,
      totalUsers,
      newUsers,
      lastActive,
      // retentionData,
      // activeThisMonth,
      // activeLastMonth,
      // retained,
      // // newUsers,
      // retentionRate: `${retentionRate}%`,
      // newUserShare: `${newUserShare}%`,
    });
  } catch (error) {
    console.error("Error calculating plan purchase rate:", error);
    return NextResponse.json({ error: "Failed to calculate plan purchase rate" }, { status: 500 });
  }
}
