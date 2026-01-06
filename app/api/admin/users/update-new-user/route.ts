import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, credits, membership, plan_type, expires_at, subId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1️⃣ Check if user exists in the "users" table
    const { data: userData, error: userError } = await supabase.from("users").select("id").eq("email", email).single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User does not exist with this email" }, { status: 404 });
    }

    const userId = userData.id;

    // 2️⃣ Check if user already has credits row
    const { data: existingCredit, error: existingError } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    // 3️⃣ If no existing credits → INSERT
    if (!existingCredit) {
      const { error: insertError } = await supabase.from("user_credits").insert({
        user_id: userId,
        credits,
        membership,
        plan_type,
        expires_at,
        subscription_id: subId,
        status: "active",
      });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "New user credit record created",
      });
    }

    // 4️⃣ If exists → UPDATE
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        credits,
        membership,
        plan_type,
        expires_at,
        subscription_id: subId,
      })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "User credit record updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
