import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log("Received update payload:", JSON.stringify(body, null, 2));

    const { id, product_name, product_description, image_data, tech_pack } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const updateData: any = {
      product_name,
      product_description,
      image_data,
      tech_pack,
      updated_at: new Date().toISOString(),
    };

    console.log("Updating product with data:", updateData);

    const { data, error } = await supabase.from("products_sample").update(updateData).eq("id", id).select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Update failed:", err);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}
