"use server";
import { createClient } from "@/lib/supabase/server";
import { saveInitialRevisions } from "./ai-image-edit-new-table";

interface CreateProductEntryData {
  user_prompt: string;
  category?: string;
  intended_use?: string;
  style_keywords?: string[];
  image?: string; // Logo
  selected_colors?: string[];
  product_goal?: string;
  designFile?: string; // Base64 design file
  userId: string;
  image_data?: {};
  project_id?: string;
  product_name: string;
  product_description: string;
  collection_edit_id?: string;
  tech_pack?: {};
}

export async function createMinimalCollectionProductEntry(data: CreateProductEntryData) {
  try {
    const supabase = await createClient();
    // Create a minimal product idea entry
    const productData: any = {
      user_id: data.userId,
      prompt: data.user_prompt,
      status: "generating",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tech_pack: data.tech_pack ? data.tech_pack : {},
      product_name: data.product_name,
      product_description: data.product_description,
      image_data: data.image_data,
      collection_edit_id: data.collection_edit_id,
    };

    console.log(productData, "product Data");
    // Store metadata and images in tech_pack for later use
    if (data.project_id) {
      productData.id = data.project_id;
    }
    const metadata: any = {};
    if (data.category) metadata.category = data.category;
    if (data.style_keywords) metadata.style_keywords = data.style_keywords;
    if (data.intended_use) metadata.intended_use = data.intended_use;
    if (data.selected_colors) metadata.selected_colors = data.selected_colors;
    if (data.product_goal) metadata.product_goal = data.product_goal;

    // Store design file and logo separately for retrieval
    if (data.designFile) metadata.designFile = data.designFile;
    if (data.image) metadata.logo = data.image;

    // Store metadata in tech_pack object
    if (data.tech_pack && Object.keys(data.tech_pack).length > 0) {
      productData.tech_pack = data.tech_pack;
    } else if (Object.keys(metadata).length > 0) {
      productData.tech_pack = { metadata };
    } else {
      productData.tech_pack = {};
    }

    const { data: insertedProduct, error } = await supabase
      .from("product_ideas")
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Error creating product entry:", error);
      return { success: false, error: error.message };
    }

    if (data.image_data && Object.keys(data.image_data).length > 0) {
      console.log("Saving initial revisions for:", insertedProduct.id);
      await saveInitialRevisions(insertedProduct.id, data.image_data);
    }

    return {
      success: true,
      projectId: insertedProduct.id,
      data: insertedProduct,
    };
  } catch (error) {
    console.error("Unexpected error creating product entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product entry",
    };
  }
}

export async function fetchProductIdExist(id: string) {
  const supabase = await createClient();

  // Check if the record with this id exists in product_ideas
  const { data, error } = await supabase.from("product_ideas").select("id").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      // Row not found
      return null;
    }

    console.error("Error checking product ID:", error);
    return null;
  }

  // Return the id if found
  return data?.id || null;
}
