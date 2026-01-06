"use server";

import { createClient } from "@/lib/supabase/server";
import { classifyProductWithAI } from "@/lib/services/ai-category-classifier";

export async function getUserProjectIdea(project_id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  // Explicitly select all columns including tech_files_data to ensure it's fetched
  const { data: productIdea, error } = await supabase
    .from("product_ideas")
    .select("*, tech_files_data")
    .eq("id", project_id)
    .single();

  if (error || !productIdea) {
    console.error("Fetch error:", error);
    return null;
  }

  return productIdea;
}

export const deleteOldImages = async (imageData: any) => {
  const supabase = await createClient();
  const filePathsToDelete: string[] = [];
  ["front", "side", "back"].forEach((key) => {
    const imageUrl = imageData?.[key]?.url;
    if (imageUrl) {
      const parts = imageUrl.split("/fileuploads/");
      if (parts.length === 2) {
        const path = decodeURIComponent(parts[1].split("?")[0]);
        filePathsToDelete.push(path);
      }
    }
  });
  if (filePathsToDelete.length > 0) {
    const { data, error } = await supabase.storage.from("fileuploads").remove(filePathsToDelete);
    console.log("data dessaddsfafdsaf ==> ", data);

    if (error) {
      console.error("Error deleting old images:", error.message);
    } else {
      console.log("Old images deleted:", filePathsToDelete);
    }
  }
};

export const deleteSupabaseImages = async (imageUrl: string) => {
  const supabase = await createClient();

  // Split the image URL to get the file path
  const parts = imageUrl.split("/fileuploads/");
  if (parts.length === 2) {
    const path = decodeURIComponent(parts[1].split("?")[0]);

    const { data, error } = await supabase.storage.from("fileuploads").remove([path]);

    if (error) {
      console.error("Error deleting image:", error.message);
      return { success: false, error: error.message };
    } else {
      console.log("Image deleted:", path);
      return { success: true, message: "Image deleted successfully" };
    }
  } else {
    console.error("Invalid image URL format.");
    return { success: false, error: "Invalid image URL format" };
  }
};

export const updateTechpack = async (project_id: any, updatedTechpack: any) => {
  const supabase = await createClient();

  // Use AI to classify the product category and subcategory
  let extractedCategory = null;
  let extractedSubcategory = null;

  // Get text to classify from tech pack data
  const textToClassify = updatedTechpack?.productName || updatedTechpack?.category_Subcategory || updatedTechpack?.category || '';

  console.log('🏷️ updateTechpack - Category extraction:', {
    projectId: project_id,
    textToClassify: textToClassify?.substring(0, 100),
  });

  if (textToClassify) {
    try {
      const classification = await classifyProductWithAI(textToClassify);
      extractedCategory = classification.category;
      extractedSubcategory = classification.subcategory;
      console.log('🤖 updateTechpack - AI Category Classification:', {
        input: textToClassify,
        category: extractedCategory,
        subcategory: extractedSubcategory,
        confidence: classification.confidence,
      });
    } catch (error) {
      console.error("Error classifying product with AI:", error);
      extractedCategory = 'other';
      extractedSubcategory = 'general';
    }
  }

  const { data, error } = await supabase
    .from("product_ideas")
    .update({
      tech_pack: updatedTechpack,
      category: extractedCategory,
      category_subcategory: extractedSubcategory,
    })
    .eq("id", project_id)
    .select(); // fetch the updated row

  if (error) {
    console.error("Update error:", error);
    return null;
  }

  console.log('🏷️ updateTechpack - Updated successfully:', {
    category: extractedCategory,
    category_subcategory: extractedSubcategory,
  });

  return data?.[0] || null;
};

// New function to update both image_data field in product_ideas table
export const updateProjectImages = async (project_id: string, imageData: any) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_ideas")
    .update({ image_data: imageData })
    .eq("id", project_id)
    .select();

  if (error) {
    console.error("Update image_data error:", error);
    return null;
  }

  return data?.[0] || null;
};

export const updateProductStatus = async (project_id: string) => {
  const supabase = await createClient();
  console.log("Profile status started working.....");
  const { data: currentData, error: fetchError } = await supabase
    .from("product_ideas")
    .select("is_public")
    .eq("id", project_id)
    .single();

  if (fetchError || !currentData) {
    console.error("Fetch current status error:", fetchError);
    return null;
  }

  const newStatus = !currentData.is_public;
  console.log("newStatus get the status ==> ", newStatus);

  // 2. Update with toggled value
  const { data, error } = await supabase
    .from("product_ideas")
    .update({ is_public: newStatus })
    .eq("id", project_id)
    .select();
  console.log("profile status update");
  if (error) {
    console.error("Update status error:", error);
    return null;
  }

  return data;
};
