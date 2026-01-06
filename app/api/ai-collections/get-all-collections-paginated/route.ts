import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = (page - 1) * limit;

  // Get total count
  const { count, error: countError } = await supabase
    .from("collections")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  // Get paginated collections
  const { data: collections, error: collectionsError } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (collectionsError) {
    return NextResponse.json({ error: collectionsError.message }, { status: 500 });
  }

  // Transform collections to include products from tech_packs field
  const collectionsWithProducts = (collections || []).map((collection) => {
    // The tech_packs field contains the product data
    const products = Array.isArray(collection.tech_packs) ? collection.tech_packs : [];

    return {
      ...collection,
      products: products.map((product: any, index: number) => {
        return {
          id: `${collection.id}-product-${index}`,
          tech_pack: {
            productName: product.name || product.productName,
            productOverview: product.productType || product.productOverview || '',
            image_data: product.image_data || [], // Keep the original array
            ...product
          },
          model_3d: product.model_3d,
          created_at: collection.created_at,
          updated_at: collection.updated_at,
        };
      }),
    };
  });

  return NextResponse.json({
    collections: collectionsWithProducts,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
