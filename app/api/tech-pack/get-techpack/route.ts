import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const { data: productIdea, error } = await supabase.from("product_ideas").select("*").eq("id", id).single();

    if (error || !productIdea) {
      console.error("Tech Pack fetch error:", error);
      return NextResponse.json({ error: "Tech Pack not found" }, { status: 404 });
    }

    return NextResponse.json({
      productIdea,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
