"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeCategory, extractCategoryFromSubcategory } from "@/lib/constants/product-categories";

/**
 * Save a tech pack for a specific revision
 *
 * Note: revisionId should be an actual UUID from product_multiview_revisions table,
 * NOT the batch_id. Use revisionNumber for lookups instead when working with grouped revisions.
 */
export async function saveTechPackForRevision(
  productId: string,
  revisionId: string | null,
  revisionNumber: number | null,
  techPackData: any
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    console.log('🚀🚀🚀 saveTechPackForRevision CALLED 🚀🚀🚀', {
      productId,
      revisionId,
      revisionNumber,
      userId: user.id,
      hasTechPackData: !!techPackData,
      techPackKeys: techPackData ? Object.keys(techPackData).slice(0, 10) : [],
      // Category debug
      category: techPackData?.category,
      category_Subcategory: techPackData?.category_Subcategory,
      allCategoryFields: techPackData ? Object.keys(techPackData).filter(k => k.toLowerCase().includes('category')) : [],
    });

    // Deactivate all existing tech packs for this product
    console.log('📝 Deactivating existing tech packs...');
    const { error: deactivateError } = await supabase
      .from("product_tech_packs")
      .update({ is_active: false })
      .eq("product_idea_id", productId);

    if (deactivateError) {
      console.error('⚠️ Warning: Failed to deactivate existing tech packs:', deactivateError);
      // Continue anyway - this might be the first tech pack
    }

    // Prepare the insert data
    const insertData = {
      product_idea_id: productId,
      revision_id: revisionId,
      user_id: user.id,
      revision_number: revisionNumber,
      tech_pack_data: techPackData,
      is_active: true,
      metadata: {
        generated_at: new Date().toISOString(),
        revision_context: revisionId ? 'revision' : 'original'
      }
    };

    console.log('📝 Inserting tech pack with data:', {
      ...insertData,
      tech_pack_data: '[REDACTED - see hasTechPackData above]'
    });

    // Insert the new tech pack
    const { data, error } = await supabase
      .from("product_tech_packs")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving tech pack to database:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error: error.message };
    }

    if (!data) {
      console.error('❌ No data returned after insert');
      return { success: false, error: 'No data returned after insert' };
    }

    // Also update the legacy tech_pack field in product_ideas for backward compatibility
    // Extract and normalize category from tech pack data
    // First try direct category field, then fallback to extracting from category_Subcategory
    const extractedCategorySubcategory = techPackData?.category_Subcategory || null;
    let extractedCategory = null;

    console.log('🏷️ Category extraction debug:', {
      hasCategory: !!techPackData?.category,
      categoryValue: techPackData?.category,
      hasSubcategory: !!extractedCategorySubcategory,
      subcategoryValue: extractedCategorySubcategory,
      techPackKeys: techPackData ? Object.keys(techPackData).filter(k => k.toLowerCase().includes('category')) : [],
    });

    if (techPackData?.category) {
      extractedCategory = normalizeCategory(techPackData.category);
      console.log('🏷️ Using direct category:', techPackData.category, '→', extractedCategory);
    } else if (extractedCategorySubcategory) {
      // Fallback: extract category from category_Subcategory (e.g., "Apparel → Shorts → Casual" -> "apparel")
      const categoryFromSubcategory = extractCategoryFromSubcategory(extractedCategorySubcategory);
      extractedCategory = normalizeCategory(categoryFromSubcategory);
      console.log('🏷️ Extracted from subcategory:', extractedCategorySubcategory, '→', categoryFromSubcategory, '→', extractedCategory);
    } else {
      console.log('🏷️ No category data found in tech pack');
    }

    const updateResult = await supabase
      .from("product_ideas")
      .update({
        tech_pack: techPackData,
        category: extractedCategory,
        category_subcategory: extractedCategorySubcategory,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId);

    if (updateResult.error) {
      console.error('🏷️ Error updating category:', updateResult.error);
    } else {
      console.log('🏷️ Category saved:', { productId, category: extractedCategory, category_subcategory: extractedCategorySubcategory });
    }

    console.log('✅ Tech pack saved successfully:', data.id);

    return {
      success: true,
      techPackId: data.id,
      data
    };
  } catch (error) {
    console.error('Unexpected error saving tech pack:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save tech pack'
    };
  }
}

/**
 * Get all tech packs for a product
 */
export async function getTechPacksForProduct(productId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("product_tech_packs")
      .select("*")
      .eq("product_idea_id", productId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching tech packs:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      techPacks: data || []
    };
  } catch (error) {
    console.error('Unexpected error fetching tech packs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tech packs'
    };
  }
}

/**
 * Get tech pack for a specific revision
 */
export async function getTechPackForRevision(revisionId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("product_tech_packs")
      .select("*")
      .eq("revision_id", revisionId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching tech pack for revision:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      techPack: data,
      hasTechPack: !!data
    };
  } catch (error) {
    console.error('Unexpected error fetching tech pack for revision:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tech pack'
    };
  }
}

/**
 * Get the active tech pack for a product
 */
export async function getActiveTechPack(productId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("product_tech_packs")
      .select("*")
      .eq("product_idea_id", productId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active tech pack:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      techPack: data
    };
  } catch (error) {
    console.error('Unexpected error fetching active tech pack:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch active tech pack'
    };
  }
}

/**
 * Delete a tech pack
 */
export async function deleteTechPack(techPackId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("product_tech_packs")
      .delete()
      .eq("id", techPackId)
      .eq("user_id", user.id);

    if (error) {
      console.error('Error deleting tech pack:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting tech pack:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete tech pack'
    };
  }
}

/**
 * Set a tech pack as active
 */
export async function setActiveTechPack(productId: string, techPackId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Deactivate all tech packs for this product
    await supabase
      .from("product_tech_packs")
      .update({ is_active: false })
      .eq("product_idea_id", productId);

    // Activate the selected tech pack
    const { error } = await supabase
      .from("product_tech_packs")
      .update({ is_active: true })
      .eq("id", techPackId)
      .eq("user_id", user.id);

    if (error) {
      console.error('Error setting active tech pack:', error);
      return { success: false, error: error.message };
    }

    // Update the legacy tech_pack field
    const { data: techPackData } = await supabase
      .from("product_tech_packs")
      .select("tech_pack_data")
      .eq("id", techPackId)
      .single();

    if (techPackData) {
      // Extract and normalize category from tech pack data
      // First try direct category field, then fallback to extracting from category_Subcategory
      const techPack = techPackData.tech_pack_data;
      const extractedCategorySubcategory = techPack?.category_Subcategory || null;
      let extractedCategory = null;

      if (techPack?.category) {
        extractedCategory = normalizeCategory(techPack.category);
      } else if (extractedCategorySubcategory) {
        // Fallback: extract category from category_Subcategory (e.g., "Apparel → Shorts → Casual" -> "apparel")
        const categoryFromSubcategory = extractCategoryFromSubcategory(extractedCategorySubcategory);
        extractedCategory = normalizeCategory(categoryFromSubcategory);
      }

      await supabase
        .from("product_ideas")
        .update({
          tech_pack: techPack,
          category: extractedCategory,
          category_subcategory: extractedCategorySubcategory,
          updated_at: new Date().toISOString()
        })
        .eq("id", productId);
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error setting active tech pack:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set active tech pack'
    };
  }
}
