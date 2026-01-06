import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSignupsChart } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = searchParams.get("to") || new Date().toISOString();
    const granularity = (searchParams.get("granularity") as "daily" | "monthly" | "weekly") || "daily";

    const data = await getSignupsChart(from, to, granularity);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching signu  ps chart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
