import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  const { data: announcements, error: announcementsError } = await supabase.from("genp-announcements").select("*");

  if (announcementsError) {
    console.error("Announcements fetch error:", announcementsError);
    return NextResponse.json({ error: announcementsError.message }, { status: 500 });
  }

  if (!announcements) {
    return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json(announcements);
}
