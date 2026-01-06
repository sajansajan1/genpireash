import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, status } = body;
    console.log("body ==> ", body);

    if (!email || !status) {
      return NextResponse.json({ error: "Email and status are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Always update friend status
    const { data: updatedFriend, error: friendUpdateError } = await supabase
      .from("friends")
      .update({ status })
      .eq("email", email)
      .select("*")
      .maybeSingle();

    if (friendUpdateError) {
      console.error("Error updating friend status:", friendUpdateError);
      return NextResponse.json({ error: "Error updating friend status" }, { status: 500 });
    }

    // Check if user exists in users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userCheckError) {
      console.error("Error checking users table:", userCheckError);
      return NextResponse.json({ error: "Error checking users table" }, { status: 500 });
    }

    // If user exists and status is approved, update user ambassador info
    if (existingUser && status === "approved") {
      console.log("status ==> ", status);
      console.log("existingUser ==> ", existingUser);
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          isAmbassador: true,
          referralCode: uuidv4().slice(0, 8),
        })
        .eq("id", existingUser.id)
        .select("id")
        .single();

      if (updateError) {
        console.error("Error updating user ambassador info:", updateError);
        return NextResponse.json({ error: "Error updating user ambassador info" }, { status: 500 });
      }
      const expires_at = new Date();
      expires_at.setFullYear(expires_at.getFullYear() + 1);
      const data = await supabase.from("user_credits").upsert([
        {
          user_id: existingUser.id,
          credits: 150,
          status: "active",
          plan_type: "yearly",
          membership: "pro",
          expires_at: expires_at.toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);
      console.log(data, "dadsa");
    }

    return NextResponse.json({ success: true, updatedFriend });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
