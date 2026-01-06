import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // ⚠️ Adjust path as needed

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const techPackId = searchParams.get("project_id");

  if (!techPackId) {
    return NextResponse.json({ error: "Missing project_id" }, { status: 400 });
  }

  const supabase = await createClient();

  // Get authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    console.error("Auth error:", userError);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }

  // Fetch the product idea / tech pack
  const { data: productIdea, error: fetchError } = await supabase
    .from("brand_dna")
    .select("*")
    .eq("id", techPackId)
    .single();

  if (fetchError || !productIdea) {
    console.error("Error fetching product idea for deletion:", fetchError);
    return NextResponse.json({ error: "Could not find product idea" }, { status: 404 });
  }

  // Delete the product idea (ensure user owns it)
  const { error: deleteError } = await supabase.from("brand_dna").delete().eq("id", techPackId).eq("user_id", user.id);

  if (deleteError) {
    console.error("Delete error:", deleteError);
    return NextResponse.json({ error: "Failed to delete product idea" }, { status: 500 });
  }

  // NOTE: Images are preserved to maintain revision history

  return NextResponse.json({
    success: true,
    message: "Product idea deleted successfully",
  });
}
