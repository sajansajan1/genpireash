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

  const { data: suppliers, error: suppliersError } = await supabase.from("supplier_profile").select("*");

  if (suppliersError) {
    console.error("Brand DNA fetch error:", suppliersError);
    return NextResponse.json({ error: suppliersError.message }, { status: 500 });
  }

  if (!suppliers) {
    return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json(suppliers);
}
