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

  const { data: creator, error: creatorError } = await supabase
    .from("creator_profile")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (creatorError || !creator) {
    return NextResponse.json({ error: creatorError ? creatorError.message : "Unknown error" }, { status: 500 });
  }

  return NextResponse.json(creator);
}
