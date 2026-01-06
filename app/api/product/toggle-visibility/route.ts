import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get current status
    const { data: currentData, error: fetchError } = await supabase
      .from("product_ideas")
      .select("is_public, user_id")
      .eq("id", productId)
      .single();

    if (fetchError || !currentData) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Verify user owns this product
    if (currentData.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to modify this product" },
        { status: 403 }
      );
    }

    // Toggle the visibility
    const newStatus = !currentData.is_public;

    const { data, error } = await supabase
      .from("product_ideas")
      .update({ is_public: newStatus })
      .eq("id", productId)
      .select("is_public");

    if (error) {
      console.error("Update visibility error:", error);
      return NextResponse.json(
        { error: "Failed to update visibility" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error("Error toggling visibility:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
