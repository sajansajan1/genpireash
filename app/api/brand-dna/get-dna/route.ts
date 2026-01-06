import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { data: dnas, error: dnaError } = await supabase
    .from("brand_dna")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // If there's a database error, return 500
  if (dnaError) {
    console.error("Brand DNA fetch error:", dnaError);
    return NextResponse.json({ error: dnaError.message }, { status: 500 });
  }

  // If no DNA found (user hasn't created one yet), return empty array with 200
  if (!dnas || dnas.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(dnas);
}
