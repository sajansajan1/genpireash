import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getCreators } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    // Verify admin session

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const from = searchParams.get("from") || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = searchParams.get("to") || new Date().toISOString();

    const result = await getCreators(page, limit, search, from, to);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching creators:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
