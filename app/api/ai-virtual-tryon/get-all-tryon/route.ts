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

  const { data: tryOn, error: tryOnError } = await supabase
    .from("try_on_studio")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (tryOnError) {
    return NextResponse.json({ error: tryOnError.message }, { status: 500 });
  }

  return NextResponse.json(tryOn);
}
