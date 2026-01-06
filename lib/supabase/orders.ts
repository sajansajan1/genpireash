"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateOrder, Payments } from "../types/tech-packs";

export async function createOrder({
  user_id,
  tech_pack_id,
  order_number,
  customer_name,
  delivery_date,
  payment_terms,
  minimum_order_quantity,
  special_instructions,
}: CreateOrder) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }
  const { data, error } = await supabase
    .from("order_details")
    .insert({
      user_id: user.id,
      tech_pack_id,
      order_number,
      customer_name,
      delivery_date,
      payment_terms,
      minimum_order_quantity,
      special_instructions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("Insert error:", error);
    return null;
  }

  return data;
}
