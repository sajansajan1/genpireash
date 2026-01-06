"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchSamples() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // if no auth → return empty list (prevent React crash)
  if (userError || !user) {
    console.error("Auth error:", userError?.message);
    return [];
  }

  const { data, error } = await supabase.from("product_ideas").select("*").eq("is_demo", true);

  if (error) {
    console.error("Fetch error:", error.message);
    return [];
  }

  return data || [];
}

export async function getsampleByID(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("product_ideas").select("*").eq("id", id).single();
  if (error) {
    console.error("Fetch by ID error:", error.message);
    return null;
  }
  return data;
}
