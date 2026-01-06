"use server";

import { supabase } from "./client";
import { createClient } from "./server";
import { revalidatePath } from "next/cache";

// Fetch the feed using the RPC function
export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_products_with_details");

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}

// Like a product
export async function likeProduct(productId: string, creator_id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to like a product." };

  const { data, error } = await supabase
    .from("products_likes")
    .insert({ product_id: productId, user_id: user.id, creator_id: creator_id })
    .select();

  if (error) {
    console.error("Error liking product:", error);
    return { error: "Failed to like product." };
  }

  revalidatePath("/"); // Revalidate the feed page
  return { data };
}

// Unlike a product
export async function unlikeProduct(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to unlike a product." };

  const { error } = await supabase.from("products_likes").delete().eq("product_id", productId).eq("user_id", user.id);

  if (error) {
    console.error("Error unliking product:", error);
    return { error: "Failed to unlike product." };
  }

  revalidatePath("/");
  return { success: true };
}

// Add a comment (requires login)
export async function addComment(productId: string, content: string, parentId?: string, metadata?: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to comment." };

  const payload: any = { product_id: productId, user_id: user.id, content, parent_id: parentId };
  if (metadata) {
    payload.metadata = metadata;
  }

  const { data, error } = await supabase
    .from("products_comments")
    .insert(payload)
    .select();

  if (error) {
    console.error("Error adding comment:", error);
    return { error: "Failed to add comment." };
  }

  revalidatePath("/");
  return { data };
}

// Add anonymous comment (no login required, just needs a name)
export async function addAnonymousComment(productId: string, content: string, fullName: string, metadata?: any) {

  if (!fullName.trim()) {
    return { error: "Name is required to comment." };
  }

  const payload: any = { product_id: productId, user_id: null, content, full_name: fullName.trim() };
  if (metadata) {
    payload.metadata = metadata;
  }

  const { data, error } = await supabase
    .from("products_comments")
    .insert(payload)
    .select();

  if (error) {
    console.error("Error adding anonymous comment:", error);
    return { error: "Failed to add comment." };
  }

  revalidatePath("/");
  return { data };
}

// Fetch top creators
export async function getTopCreators() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_top_creators");

  if (error) {
    console.error("Error fetching top creators:", error);
    return [];
  }

  return data;
}

export async function getProductById(id: string) {
  const products = await getProducts();
  if (!products) return null;

  // Since getProducts returns an array, we find the one matching the ID
  // Note: This is not efficient for large datasets but works with the current RPC structure
  return products.find((p: any) => p.id === id) || null;
}
