"use server";

import { createClient } from "@/lib/supabase/server";
import { analyzeAndSaveProductImages } from "./analyze-product-images";

/**
 * Direct test to check if analysis is working and being saved to database
 */
export async function testAnalysisDirect(productId?: string) {
  try {
    const supabase = await createClient();
    
    // Step 1: Verify table exists
    const { data: tableCheck } = await supabase
      .from("image_analysis_cache")
      .select("id")
      .limit(1);
    
    console.log("Table exists check:", tableCheck !== null);
    
    // Step 2: If productId provided, get the product and test analysis
    if (productId) {
      const { data: product, error: productError } = await supabase
        .from("product_ideas")
        .select("*")
        .eq("id", productId)
        .single();
      
      if (productError || !product) {
        return {
          success: false,
          error: "Product not found",
          productId
        };
      }
      
      console.log("Product found:", {
        id: product.id,
        name: product.tech_pack?.productName,
        hasImageData: !!product.image_data,
        imageKeys: product.image_data ? Object.keys(product.image_data) : []
      });
      
      // Step 3: Test analysis with the product's images
      if (product.image_data) {
        console.log("Starting analysis for product images...");
        
        const result = await analyzeAndSaveProductImages(
          productId,
          product.image_data,
          product.tech_pack?.productName || "Test Product"
        );
        
        console.log("Analysis result:", result);
        
        // Step 4: Check if analysis was saved
        const { data: savedAnalysis, error: fetchError } = await supabase
          .from("image_analysis_cache")
          .select("*")
          .eq("product_idea_id", productId);
        
        if (fetchError) {
          console.error("Error fetching saved analysis:", fetchError);
        }
        
        return {
          success: true,
          message: "Analysis test completed",
          analysisResult: result,
          savedInDb: savedAnalysis ? savedAnalysis.length : 0,
          savedAnalyses: savedAnalysis
        };
      } else {
        return {
          success: false,
          error: "Product has no image data",
          product: {
            id: product.id,
            name: product.tech_pack?.productName
          }
        };
      }
    }
    
    // Step 5: Get a sample product to test with
    const { data: sampleProduct } = await supabase
      .from("product_ideas")
      .select("id, tech_pack")
      .not("image_data", "is", null)
      .limit(1)
      .single();
    
    if (sampleProduct) {
      return {
        success: true,
        message: "Table exists. Found sample product",
        sampleProductId: sampleProduct.id,
        sampleProductName: sampleProduct.tech_pack?.productName,
        suggestion: `Run this function again with productId: "${sampleProduct.id}" to test analysis`
      };
    }
    
    return {
      success: true,
      message: "Table exists but no products with images found",
      tableExists: true
    };
    
  } catch (error: any) {
    console.error("Test error:", error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Force create the table if it doesn't exist
 */
export async function forceCreateAnalysisTable() {
  try {
    const supabase = await createClient();
    
    // Run the safe migration SQL
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS image_analysis_cache (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          image_url TEXT NOT NULL,
          image_hash TEXT,
          analysis_data JSONB NOT NULL,
          analysis_prompt TEXT,
          model_used TEXT NOT NULL DEFAULT 'gpt-4o',
          product_idea_id UUID,
          revision_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          expires_at TIMESTAMP WITH TIME ZONE,
          tokens_used INTEGER,
          processing_time_ms INTEGER,
          confidence_score FLOAT,
          UNIQUE(image_url)
        );
        
        CREATE INDEX IF NOT EXISTS idx_iac_image_url ON image_analysis_cache(image_url);
        CREATE INDEX IF NOT EXISTS idx_iac_product_idea ON image_analysis_cache(product_idea_id);
        
        GRANT ALL ON image_analysis_cache TO authenticated;
        GRANT ALL ON image_analysis_cache TO service_role;
      `
    });
    
    if (error) {
      console.error("Error creating table:", error);
      return {
        success: false,
        error: error.message,
        suggestion: "Run the migration SQL directly in Supabase SQL Editor"
      };
    }
    
    return {
      success: true,
      message: "Table creation attempted",
      nextStep: "Check if table exists in Supabase dashboard"
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      suggestion: "Run the migration SQL directly in Supabase SQL Editor"
    };
  }
}
