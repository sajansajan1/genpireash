import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // ⚠️ Adjust path as needed
// import { deleteOldImages } from "@/lib/supabase/productIdea"; // No longer needed - preserving images

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const techPackId = searchParams.get("project_id");

  if (!techPackId) {
    return NextResponse.json({ error: "Missing tech_pack_id" }, { status: 400 });
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

  // Fetch product idea
  const { data: productIdea, error: fetchError } = await supabase
    .from("product_ideas")
    .select("image_data")
    .eq("id", techPackId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !productIdea) {
    console.error("Error fetching product idea for deletion:", fetchError);
    return NextResponse.json({ error: "Could not find product idea" }, { status: 404 });
  }

  // Delete product idea
  const { error: deleteError } = await supabase
    .from("product_ideas")
    .delete()
    .eq("id", techPackId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Delete error:", deleteError);
    return NextResponse.json({ error: "Failed to delete product idea" }, { status: 500 });
  }

  // NOTE: We don't delete images anymore to preserve revision history
  // Images are kept to maintain integrity of revisions and historical data
  // try {
  //   await deleteOldImages(productIdea.image_data);
  // } catch (err) {
  //   return NextResponse.json({
  //     success: true,
  //     message: "Images Not Deleted",
  //   });
  // }

  return NextResponse.json({
    success: true,
    message: "Product idea deleted successfully",
  });
}
