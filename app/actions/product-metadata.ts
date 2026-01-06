"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProductStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "in_production"
  | "completed"
  | "archived";

export interface ProductMetadata {
  productName?: string;
  description?: string;
  sku?: string | null;
  referenceNumber?: string | null;
  targetConsumerPriceUsd?: number | null;
  status?: ProductStatus;
}

export interface UpdateProductMetadataParams {
  productId: string;
  metadata: ProductMetadata;
}

export interface UpdateProductMetadataResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Update product metadata fields in product_ideas table
 * Also updates the tech_pack JSON with productName and description
 */
export async function updateProductMetadata(
  params: UpdateProductMetadataParams
): Promise<UpdateProductMetadataResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { productId, metadata } = params;

    if (!productId) {
      return { success: false, error: "Product ID is required" };
    }

    // First, fetch the current product to get existing tech_pack
    // Note: RLS policies in Supabase should handle authorization
    const { data: currentProduct, error: fetchError } = await supabase
      .from("product_ideas")
      .select("tech_pack")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error("Error fetching product:", fetchError);
      return { success: false, error: "Failed to fetch product" };
    }

    // Authorization is handled by Supabase RLS policies
    // If the user can fetch the product, they have access to it

    // Build the update object for direct columns
    const updateData: Record<string, any> = {};

    // Update direct columns if provided
    if (metadata.sku !== undefined) {
      updateData.sku = metadata.sku;
    }
    if (metadata.referenceNumber !== undefined) {
      updateData.reference_number = metadata.referenceNumber;
    }
    if (metadata.targetConsumerPriceUsd !== undefined) {
      updateData.target_consumer_price_usd = metadata.targetConsumerPriceUsd;
    }
    if (metadata.status !== undefined) {
      updateData.status = metadata.status;
    }

    // If productName or description is being updated, also update tech_pack
    if (metadata.productName !== undefined || metadata.description !== undefined) {
      const currentTechPack = currentProduct.tech_pack || {};
      const updatedTechPack = {
        ...currentTechPack,
        ...(metadata.productName !== undefined && { productName: metadata.productName }),
        ...(metadata.description !== undefined && { description: metadata.description }),
      };
      updateData.tech_pack = updatedTechPack;
    }

    // Perform the update - we've already verified ownership above
    // Don't filter by creator_id in case it's null for legacy products
    const { data, error } = await supabase
      .from("product_ideas")
      .update(updateData)
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Error updating product metadata:", error);
      return { success: false, error: "Failed to update product metadata" };
    }

    // Revalidate the product page
    revalidatePath(`/product`);

    return { success: true, data };
  } catch (error) {
    console.error("Error in updateProductMetadata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get product metadata for a specific product
 */
export async function getProductMetadataById(
  productId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("product_ideas")
      .select(`
        id,
        sku,
        reference_number,
        target_consumer_price_usd,
        status,
        tech_pack,
        category,
        category_subcategory,
        created_at,
        updated_at
      `)
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product metadata:", error);
      return { success: false, error: "Failed to fetch product metadata" };
    }

    return {
      success: true,
      data: {
        id: data.id,
        productName: data.tech_pack?.productName || "Untitled Product",
        description: data.tech_pack?.description || "",
        sku: data.sku,
        referenceNumber: data.reference_number,
        targetConsumerPriceUsd: data.target_consumer_price_usd,
        status: data.status || "draft",
        category: data.category,
        categorySubcategory: data.category_subcategory,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (error) {
    console.error("Error in getProductMetadataById:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
