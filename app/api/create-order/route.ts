// app/api/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tech_pack_id,
      order_number,
      customer_name,
      delivery_date,
      payment_terms,
      minimum_order_quantity,
      special_instructions,
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
      .from("order_details")
      .insert({
        user_id: user.id,
        tech_pack_id,
        order_number,
        customer_name,
        delivery_date,
        payment_terms,
        minimum_order_quantity,
        special_instructions,
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
