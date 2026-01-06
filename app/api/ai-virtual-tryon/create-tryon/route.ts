// app/api/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { optimizeAndUploadImage } from "@/app/actions/idea-generation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { url, style, prompt, name } = body;

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const timestamp = new Date().toISOString();
    const saveImageToSupabase = async (dataUrl: string, fileName: string) => {
      // Use optimized upload function with standard preset
      return optimizeAndUploadImage(dataUrl, fileName, {
        preset: "standard",
      });
    };
    const image = await saveImageToSupabase(url, `${style}_try_on_${timestamp}.png`);
    // Use the authenticated user's ID (not from request body)
    const { data, error } = await supabase
      .from("try_on_studio")
      .insert({
        user_id: user.id,
        url: image,
        style,
        prompt,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
