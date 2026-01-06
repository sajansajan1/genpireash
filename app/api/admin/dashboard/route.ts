import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // Your server-side Supabase client helper

export async function GET(req: NextRequest) {
  try {
    // Initialize the Supabase client using your server-side helper
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = searchParams.get("to") || new Date().toISOString();

    const { count: totalCreators, error: creatorsError } = await supabase
      .from("creator_profile")
      .select("id", { count: "exact", head: true });

    if (creatorsError) {
      console.error("Error counting creators:", creatorsError);
      return NextResponse.json({ error: "Failed to fetch creator count" }, { status: 500 });
    }

    const { count: totalProducts, error: productsError } = await supabase
      .from("product_ideas")
      .select("id", { count: "exact", head: true });

    if (productsError) {
      console.error("Error counting products:", productsError);
      return NextResponse.json({ error: "Failed to fetch products count" }, { status: 500 });
    }

    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });

    if (usersError) {
      console.error("Error counting users:", usersError);
      return NextResponse.json({ error: "Failed to fetch user count" }, { status: 500 });
    }

    const { count: activeProCount, error: userProCountError } = await supabase
      .from("user_credits")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .eq("membership", "pro");

    if (userProCountError) {
      console.error("Error counting active pro memberships:", userProCountError);
      return NextResponse.json({ error: "Failed to fetch active pro count" }, { status: 500 });
    }

    const { count: activeSaverCount, error: userSaverCountError } = await supabase
      .from("user_credits")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .eq("membership", "saver");

    if (userSaverCountError) {
      console.error("Error counting active saver memberships:", userSaverCountError);
      return NextResponse.json({ error: "Failed to fetch active saver count" }, { status: 500 });
    }

    const { data, error } = await supabase.rpc("get_active_user_counts");
    console.log("data ==> ", data);

    if (error) {
      console.error("Error fetching active users:", error);
    } else {
      console.log("Active users counts:", data);
      // data = { weekly_active_users: 12, monthly_active_users: 34 }
    }
    // 3. Return the final counts
    return NextResponse.json({
      totalCreators: totalCreators ?? 0,
      totalUsers: totalUsers ?? 0,
      totalProducts: totalProducts ?? 0,
      activeProCount: activeProCount ?? 0,
      activeSaverCount: activeSaverCount ?? 0,
      weeklyActiveUsers: data.weekly_active_users ?? 0,
      monthlyActiveUsers: data.monthly_active_users ?? 0,
    });
  } catch (err) {
    console.error("Unexpected API error:", err);
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}
