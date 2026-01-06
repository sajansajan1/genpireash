"use server";

import { createClient } from "./server";

export const updateCollection = async (project_id: any, updatedCollectionData: any) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collections")
    .update(updatedCollectionData) // update entire row
    .eq("id", project_id)
    .select(); // fetch the updated row

  if (error) {
    console.error("Update error:", error);
    return null;
  }

  return data?.[0] || null;
};
