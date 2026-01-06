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

  // Fetch collections first
  const { data: collections, error: colErr } = await supabase
    .from("products_collection_detail")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (colErr) {
    return NextResponse.json({ error: colErr.message }, { status: 500 });
  }

  const collectionIds = collections.map((c) => c.id);

  if (collectionIds.length === 0) {
    return NextResponse.json([]);
  }

  // Fetch product_collections for all collections
  const { data: productCollections, error: pcErr } = await supabase
    .from("product_collections")
    .select("*")
    .in("collection_id", collectionIds);

  if (pcErr) {
    return NextResponse.json({ error: pcErr.message }, { status: 500 });
  }

  // Extract all product IDs
  const productIds = [...new Set(productCollections.map((pc) => pc.product_id))];

  // Fetch product_ideas in ONE query
  const { data: products, error: pErr } = await supabase.from("product_ideas").select("*").in("id", productIds);

  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  // Create a quick lookup for products
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Attach product collections + products to each collection
  const finalCollections = collections.map((col) => {
    const pcs = productCollections.filter((pc) => pc.collection_id === col.id);

    return {
      ...col,
      product_collections: pcs,
      products: pcs.map((pc) => productMap.get(pc.product_id)).filter(Boolean),
    };
  });

  return NextResponse.json(finalCollections);
}
