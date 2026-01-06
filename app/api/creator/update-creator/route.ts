// app/api/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      full_name,
      avatar_url,
      country,
      categories,
      address,
      contact,
      email,
      bio,
      website_url,
      brand_description,
      brand_size,
      target_market,
      order_size,
    } = body;

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("creator_profile")
      .update({
        full_name,
        avatar_url,
        country,
        categories,
        address,
        contact,
        email,
        bio,
        website_url,
        brand_description,
        brand_size,
        target_market,
        order_size,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select();
    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "Failed to update creator Profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
