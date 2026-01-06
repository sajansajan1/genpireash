import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const techPackId = searchParams.get("tech_pack_id");
  if (!techPackId) {
    return NextResponse.json({ error: "Missing tech_pack_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }
  const { data, error } = await supabase.from("order_details").select("*").eq("tech_pack_id", techPackId).single();

  if (error) {
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 401 });
  }

  return NextResponse.json(data);
}
