import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // ⚠️ Adjust path as needed
import { deleteOldImages, deleteSupabaseImages } from "@/lib/supabase/productIdea";

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tryonId = searchParams.get("id");
  console.log("tryonId ==> ", tryonId);

  if (!tryonId) {
    return NextResponse.json({ error: "Missing tryonId" }, { status: 400 });
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
  const { data: tryon, error: fetchError } = await supabase
    .from("try_on_studio")
    .select("url")
    .eq("id", tryonId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !tryon) {
    console.error("Error fetching tryon try on id for deletion:", fetchError);
    return NextResponse.json({ error: "Could not find tryon try on" }, { status: 404 });
  }

  // Delete product idea
  const { error: deleteError } = await supabase.from("try_on_studio").delete().eq("id", tryonId).eq("user_id", user.id);

  if (deleteError) {
    console.error("Delete error:", deleteError);
    return NextResponse.json({ error: "Failed to delete tryon try on" }, { status: 500 });
  }

  // Delete images if any
  try {
    await deleteSupabaseImages(tryon.url);
  } catch (err) {
    return NextResponse.json({
      success: true,
      message: "Images Not Deleted",
    });
  }

  return NextResponse.json({
    success: true,
    message: "Product idea and images deleted successfully",
  });
}
