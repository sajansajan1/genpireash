"use server";

import { createClient } from "@/lib/supabase/server";
import { analyzeImage, analyzeCollectionViews } from "@/lib/services/image-analysis-service";

/**
 * Analyze and save analysis for newly generated product images
 */
export async function analyzeAndSaveCollectionImages(
  productId: string,
  collectionId: string,
  images: {
    front?: { url: string } | string;
    back?: { url: string } | string;
    side?: { url: string } | string;
    [key: string]: { url: string } | string | undefined;
  },
  productName?: string,
  revisionId?: string | null,
  revisionNumber?: number
) {
  try {
    console.log(`Analyzing images for collection ${productId}${revisionId ? ` (revision: ${revisionId})` : ""}`);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    // Helper function to extract URL from image data
    const extractUrl = (imageData: any): string | undefined => {
      if (!imageData) return undefined;
      if (typeof imageData === "string") return imageData;
      if (imageData.url) return imageData.url;
      return undefined;
    };

    // Extract the main views
    const mainViews = {
      front: extractUrl(images.front),
      back: extractUrl(images.back),
      side: extractUrl(images.side),
    };

    console.log("Extracted URLs for analysis:", {
      front: mainViews.front ? "✓" : "✗",
      back: mainViews.back ? "✓" : "✗",
      side: mainViews.side ? "✓" : "✗",
    });

    // Analyze main views with revision context
    const analysisResults = await analyzeCollectionViews(
      mainViews,
      productName || "Product",
      productId,
      collectionId,
      revisionId || undefined,
      revisionNumber
    );

    console.log("Analysis completed, results:", {
      viewsAnalyzed: Object.keys(analysisResults).filter((k) => k !== "combinedAnalysis"),
      hasCombinedAnalysis: !!analysisResults.combinedAnalysis,
    });

    // Analyze any additional views (bottom, illustration, etc.)
    const additionalViews: string[] = [];
    for (const [viewType, imageData] of Object.entries(images)) {
      if (imageData && !["front", "back", "side"].includes(viewType)) {
        const imageUrl = extractUrl(imageData);
        if (imageUrl) {
          additionalViews.push(viewType);

          // Analyze additional view with revision context
          const additionalContext = revisionId
            ? `This is the ${viewType} view of the product (revision ${revisionNumber || revisionId}).`
            : `This is the ${viewType} view of the product.`;

          await analyzeImage(imageUrl, `${productName || "Product"} - ${viewType} view`, additionalContext);
        }
      }
    }

    // Store summary in product_ideas table if needed
    // NOTE: Commented out as metadata column doesn't exist in product_ideas table
    // The analysis is already stored in the image_analysis_cache table
    /*
    if (analysisResults.combinedAnalysis) {
      const { error: updateError } = await supabase
        .from("product_ideas")
        .update({
          metadata: {
            imageAnalysisSummary: analysisResults.combinedAnalysis,
            analyzedViews: [...Object.keys(mainViews), ...additionalViews],
            analysisDate: new Date().toISOString()
          }
        })
        .eq("id", productId);

      if (updateError) {
        console.error("Error updating product with analysis:", updateError);
      }
    }
    */

    return {
      success: true,
      message: `Analyzed ${Object.keys(analysisResults).length} views`,
      analysisResults,
    };
  } catch (error: any) {
    console.error("Error analyzing product images:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze images",
    };
  }
}

/**
 * Get cached analysis for a product
 */
export async function getProductImageAnalysis(productId: string): Promise<{
  success: boolean;
  analyses?: any[];
  summary?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get all cached analyses for this product
    const { data, error } = await supabase
      .from("image_analysis_cache")
      .select("*")
      .eq("product_collection_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Get summary from the most recent combined analysis
    const combinedAnalysis = data?.find((a) => a.view_name === "combined");

    return {
      success: true,
      analyses: data || [],
      summary: combinedAnalysis?.analysis?.summary || combinedAnalysis?.analysis,
    };
  } catch (error: any) {
    console.error("Error fetching product analysis:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Refresh analysis for a specific image
 */
export async function refreshImageAnalysis(
  imageUrl: string,
  productId?: string,
  productName?: string
): Promise<{
  success: boolean;
  analysis?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Delete old cached analysis
    const { error: deleteError } = await supabase.from("image_analysis_cache").delete().eq("image_url", imageUrl);

    if (deleteError) {
      console.error("Error deleting old analysis:", deleteError);
    }

    // Perform new analysis
    const analysis = await analyzeImage(imageUrl, productName || "Product");

    if (!analysis) {
      throw new Error("Failed to analyze image");
    }

    // Link to product if provided
    if (productId) {
      await supabase
        .from("image_analysis_cache")
        .update({ product_collection_id: productId })
        .eq("image_url", imageUrl);
    }

    return {
      success: true,
      analysis,
    };
  } catch (error: any) {
    console.error("Error refreshing analysis:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
