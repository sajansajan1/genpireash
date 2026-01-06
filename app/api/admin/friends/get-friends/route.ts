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

  const { data: friends, error: friendsError } = await supabase.from("friends").select("*");

  if (friendsError) {
    console.error("Brand DNA fetch error:", friendsError);
    return NextResponse.json({ error: friendsError.message }, { status: 500 });
  }

  if (!friends) {
    return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json(friends);
}
