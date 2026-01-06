"use server";

import { createClient } from "@/lib/supabase/server";

export interface UserProduct {
  id: string;
  product_name: string;
  created_at: string;
  image_data?: {
    front?: {
      url?: string;
    };
  };
}

export async function getUserProducts(): Promise<{
  success: boolean;
  products?: UserProduct[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("❌ User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    console.log("✅ Fetching products for user:", user.id);

    const { data: products, error } = await supabase
      .from("product_ideas")
      .select("id, product_name, created_at, image_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50); // Limit to 50 most recent products

    if (error) {
      console.error("❌ Error fetching user products:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Fetched products:", products?.length || 0);
    if (products && products.length > 0) {
      console.log("Sample product:", products[0]);
    }

    return {
      success: true,
      products: products || [],
    };
  } catch (error) {
    console.error("❌ Unexpected error fetching user products:", error);
    return {
      success: false,
      error: "Failed to fetch products",
    };
  }
}
