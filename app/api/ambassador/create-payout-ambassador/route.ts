import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email,
      name,
      residence,
      currency,
      bank_name,
      bank_address,
      bank_account,
      swift_code,
      bank_routing_number,
      payer_id,
      status,
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

    // Use the authenticated user's ID (not from request body)
    const { data, error } = await supabase
      .from("ambassador_details")
      .insert({
        user_id: user.id,
        email,
        name,
        residence,
        currency,
        bank_name,
        bank_address,
        bank_account,
        swift_code,
        bank_routing_number,
        payer_id,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
