import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // ⚠️ Adjust path as needed
import { deleteOldImages, deleteSupabaseImages } from "@/lib/supabase/productIdea";

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const historyId = searchParams.get("id");

  if (!historyId) {
    return NextResponse.json({ error: "Missing historyId" }, { status: 400 });
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
  const { data: history, error: fetchError } = await supabase
    .from("try_on_history")
    .select("url")
    .eq("id", historyId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !history) {
    console.error("Error fetching history try on id for deletion:", fetchError);
    return NextResponse.json({ error: "Could not find history try on" }, { status: 404 });
  }

  // Delete product idea
  const { error: deleteError } = await supabase
    .from("try_on_history")
    .delete()
    .eq("id", historyId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Delete error:", deleteError);
    return NextResponse.json({ error: "Failed to delete history try on" }, { status: 500 });
  }

  // Delete images if any
  try {
    await deleteSupabaseImages(history.url);
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
