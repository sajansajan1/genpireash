import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, verified_profile } = body;
    console.log("body ==> ", body);

    if (!id || !verified_profile) {
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
    const { data: updatedsupplier, error: suplierUpdateError } = await supabase
      .from("supplier_profile")
      .update({ verified_profile })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (suplierUpdateError) {
      console.error("Error updating friend status:", suplierUpdateError);
      return NextResponse.json({ error: "Error updating friend status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedsupplier });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
