"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Debug function to check if analysis is being saved
 */
export async function checkImageAnalysisCache() {
  try {
    const supabase = await createClient();
    
    // Check if table exists
    const { data: tables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "image_analysis_cache")
      .single();
    
    console.log("Table exists:", !!tables);
    
    // Get count of cached analyses
    const { count, error: countError } = await supabase
      .from("image_analysis_cache")
      .select("*", { count: "exact", head: true });
    
    if (countError) {
      console.error("Error counting cache entries:", countError);
      return {
        success: false,
        error: countError.message,
        tableExists: !!tables
      };
    }
    
    // Get recent entries
    const { data: recentEntries, error: fetchError } = await supabase
      .from("image_analysis_cache")
      .select("id, image_url, product_idea_id, created_at, model_used")
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.error("Error fetching recent entries:", fetchError);
    }
    
    return {
      success: true,
      tableExists: !!tables,
      totalEntries: count || 0,
      recentEntries: recentEntries || [],
      message: count ? `Found ${count} cached analyses` : "No cached analyses found"
    };
  } catch (error: any) {
    console.error("Debug check error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Manually trigger analysis for existing product images
 */
export async function triggerAnalysisForProduct(productId: string) {
  try {
    const supabase = await createClient();
    
    // Get product data
    const { data: product, error: productError } = await supabase
      .from("product_ideas")
      .select("*")
      .eq("id", productId)
      .single();
    
    if (productError || !product) {
      return {
        success: false,
        error: "Product not found"
      };
    }
    
    console.log("Found product:", product.product_name);
    
    // Check for images in product data
    const images: any = {};
    
    // Check different possible image fields
    if (product.front_image_url) images.front = product.front_image_url;
    if (product.back_image_url) images.back = product.back_image_url;
    if (product.side_image_url) images.side = product.side_image_url;
    
    // Check in metadata or tech_pack
    if (product.metadata?.images) {
      Object.assign(images, product.metadata.images);
    }
    if (product.tech_pack?.images) {
      Object.assign(images, product.tech_pack.images);
    }
    
    console.log("Found images:", Object.keys(images));
    
    if (Object.keys(images).length === 0) {
      // Try to get from revisions
      const { data: revisions } = await supabase
        .from("product_multiview_revisions")
        .select("view_type, image_url")
        .eq("product_idea_id", productId)
        .eq("revision_number", 0);
      
      if (revisions && revisions.length > 0) {
        revisions.forEach(rev => {
          images[rev.view_type] = rev.image_url;
        });
      }
    }
    
    if (Object.keys(images).length === 0) {
      return {
        success: false,
        error: "No images found for this product"
      };
    }
    
    // Import and call the analysis function
    const { analyzeAndSaveProductImages } = await import("./analyze-product-images");
    
    const result = await analyzeAndSaveProductImages(
      productId,
      images,
      product.product_name || "Product"
    );
    
    return result;
  } catch (error: any) {
    console.error("Trigger analysis error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
