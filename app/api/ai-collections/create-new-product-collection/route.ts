// app\api\ai-collections\create-new-product-collection\route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { mode, title, product_id, collection_id } = body;

    if (!mode) {
      return NextResponse.json({ error: "Mode is required" }, { status: 400 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const user_id = user.id;

    // =====================================================
    //  MODE: CREATE COLLECTION + OPTIONALLY ADD PRODUCT
    // =====================================================
    if (mode === "create") {
      if (!title) {
        return NextResponse.json({ error: "Collection title is required" }, { status: 400 });
      }

      // Create new collection
      const { data: collection, error: createErr } = await supabase
        .from("products_collection_detail")
        .insert([
          {
            title,
            user_id,
          },
        ])
        .select()
        .single();

      if (createErr) {
        console.error("Create collection error:", createErr);
        return NextResponse.json({ error: createErr.message }, { status: 500 });
      }
      // Add product to collection (optional)
      if (product_id) {
        // Check if product already exists in this collection
        const { data: existingProduct, error: checkErr } = await supabase
          .from("product_collections")
          .select("id")
          .eq("collection_id", collection.id)
          .eq("product_id", product_id)
          .single();

        if (existingProduct) {
          return NextResponse.json(
            { error: "Product already exists in this collection" },
            { status: 409 } // 409 Conflict
          );
        }

        if (checkErr && checkErr.code !== "PGRST116") {
          // PGRST116 = no rows returned
          console.error("Check product error:", checkErr);
          return NextResponse.json({ error: "Error checking product existence" }, { status: 500 });
        }

        const { error: addErr } = await supabase.from("product_collections").insert([
          {
            collection_id: collection.id,
            product_id,
            user_id,
          },
        ]);

        if (addErr) {
          console.error("Add product error:", addErr);
          console.warn("Collection created but product couldn't be added:", addErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Collection created successfully",
        collection_id: collection.id,
      });
    }

    // =====================================================
    //  MODE: ADD PRODUCT TO EXISTING COLLECTION
    // =====================================================
    if (mode === "add") {
      if (!collection_id || !product_id) {
        return NextResponse.json({ error: "Collection ID and Product ID are required" }, { status: 400 });
      }

      // Check if product already exists in this collection
      const { data: existingProduct, error: checkErr } = await supabase
        .from("product_collections")
        .select("id")
        .eq("collection_id", collection_id)
        .eq("product_id", product_id)
        .single();

      if (existingProduct) {
        return NextResponse.json(
          { error: "Product already exists in this collection" },
          { status: 409 } // 409 Conflict
        );
      }

      if (checkErr && checkErr.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Check product error:", checkErr);
        return NextResponse.json({ error: "Error checking product existence" }, { status: 500 });
      }

      const { error: addErr } = await supabase.from("product_collections").insert([
        {
          collection_id,
          product_id,
          user_id,
        },
      ]);

      if (addErr) {
        console.error("Add to collection error:", addErr);
        return NextResponse.json({ error: addErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Product added to collection successfully",
      });
    }

    // =====================================================
    // If MODE is invalid
    // =====================================================
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error: any) {
    console.error("Unexpected API error:", error);
    return NextResponse.json({ error: error?.message || "Unexpected API error" }, { status: 500 });
  }
}
