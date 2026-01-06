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

  const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single();

  if (profileError || !profile) {
    return NextResponse.json({ error: profileError ? profileError.message : "Unknown error" }, { status: 500 });
  }

  // Fetch current credits from user_credits table (most recent subscription)
  const { data: currentSub } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (currentSub) {
    profile.credits = currentSub.credits;
  }

  if (profile.referredBy) {
    const { data: referredByUser, error: referredByError } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", profile.referredBy)
      .single();

    if (!referredByError && referredByUser) {
      profile.referred_by_user = referredByUser;
    }
  }

  return NextResponse.json(profile);
}
