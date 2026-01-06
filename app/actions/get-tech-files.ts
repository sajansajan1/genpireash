"use server";

import { createClient } from "@/lib/supabase/server";

export interface TechFileData {
  id: string;
  file_type: string;
  view_type: string | null;
  file_category: string | null;
  file_url: string;
  thumbnail_url: string | null;
  analysis_data: any;
  confidence_score: number | null;
  created_at: string;
  revision_id: string | null;
}

export interface TechFilesResult {
  success: boolean;
  error?: string;
  data?: {
    baseViews: TechFileData[];
    components: TechFileData[];
    closeups: TechFileData[];
    sketches: TechFileData[];
    flatSketches: TechFileData[];
    assemblyView: TechFileData | null;
    selectedRevisionId: string | null;
  };
}

/**
 * Fetch tech files for a product from the tech_files table
 * If selectedRevisionId is provided, filters by that revision
 * Otherwise, fetches from the selected_revision_id stored in product_ideas
 */
export async function getTechFilesForProduct(
  productId: string,
  revisionId?: string
): Promise<TechFilesResult> {
  try {
    const supabase = await createClient();

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // If no revision ID provided, get it from the product_ideas table
    let selectedRevisionId = revisionId || null;

    if (!selectedRevisionId) {
      const { data: product, error: productError } = await supabase
        .from("product_ideas")
        .select("selected_revision_id")
        .eq("id", productId)
        .single();

      if (productError) {
        console.error("Error fetching product:", productError);
        // Continue without revision filter - will fetch all tech files for the product
      } else {
        selectedRevisionId = product?.selected_revision_id || null;
      }
    }

    console.log("📂 Fetching tech files:", {
      productId,
      selectedRevisionId,
    });

    // Build the query
    let query = supabase
      .from("tech_files")
      .select("*")
      .eq("product_idea_id", productId)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    // Filter by revision ID if available
    if (selectedRevisionId) {
      query = query.eq("revision_id", selectedRevisionId);
    }

    const { data: techFiles, error: techFilesError } = await query;

    if (techFilesError) {
      console.error("Error fetching tech files:", techFilesError);
      return { success: false, error: techFilesError.message };
    }

    if (!techFiles || techFiles.length === 0) {
      console.log("📂 No tech files found for product:", productId);
      return {
        success: true,
        data: {
          baseViews: [],
          components: [],
          closeups: [],
          sketches: [],
          flatSketches: [],
          assemblyView: null,
          selectedRevisionId,
        },
      };
    }

    // Organize tech files by type
    const baseViews = techFiles
      .filter((f: any) => f.file_type === "base_view")
      .map((f: any) => ({
        id: f.id,
        file_type: f.file_type,
        view_type: f.view_type,
        file_category: f.file_category,
        file_url: f.file_url,
        thumbnail_url: f.thumbnail_url,
        analysis_data: f.analysis_data,
        confidence_score: f.confidence_score,
        created_at: f.created_at,
        revision_id: f.revision_id,
      }));

    const components = techFiles
      .filter((f: any) => f.file_type === "component")
      .map((f: any) => ({
        id: f.id,
        file_type: f.file_type,
        view_type: f.view_type,
        file_category: f.file_category,
        file_url: f.file_url,
        thumbnail_url: f.thumbnail_url,
        analysis_data: f.analysis_data,
        confidence_score: f.confidence_score,
        created_at: f.created_at,
        revision_id: f.revision_id,
      }));

    const closeups = techFiles
      .filter((f: any) => f.file_type === "closeup")
      .map((f: any) => ({
        id: f.id,
        file_type: f.file_type,
        view_type: f.view_type,
        file_category: f.file_category,
        file_url: f.file_url,
        thumbnail_url: f.thumbnail_url,
        analysis_data: f.analysis_data,
        confidence_score: f.confidence_score,
        created_at: f.created_at,
        revision_id: f.revision_id,
      }));

    const sketches = techFiles
      .filter((f: any) => f.file_type === "sketch")
      .map((f: any) => ({
        id: f.id,
        file_type: f.file_type,
        view_type: f.view_type,
        file_category: f.file_category,
        file_url: f.file_url,
        thumbnail_url: f.thumbnail_url,
        analysis_data: f.analysis_data,
        confidence_score: f.confidence_score,
        created_at: f.created_at,
        revision_id: f.revision_id,
      }));

    const flatSketches = techFiles
      .filter((f: any) => f.file_type === "flat_sketch")
      .map((f: any) => ({
        id: f.id,
        file_type: f.file_type,
        view_type: f.view_type,
        file_category: f.file_category,
        file_url: f.file_url,
        thumbnail_url: f.thumbnail_url,
        analysis_data: f.analysis_data,
        confidence_score: f.confidence_score,
        created_at: f.created_at,
        revision_id: f.revision_id,
      }));

    const assemblyViewFiles = techFiles
      .filter((f: any) => f.file_type === "assembly_view")
      .map((f: any) => ({
        id: f.id,
        file_type: f.file_type,
        view_type: f.view_type,
        file_category: f.file_category,
        file_url: f.file_url,
        thumbnail_url: f.thumbnail_url,
        analysis_data: f.analysis_data,
        confidence_score: f.confidence_score,
        created_at: f.created_at,
        revision_id: f.revision_id,
      }));

    // Get the most recent assembly view (only one)
    const assemblyView = assemblyViewFiles.length > 0 ? assemblyViewFiles[0] : null;

    console.log("📂 Tech files fetched:", {
      baseViewsCount: baseViews.length,
      componentsCount: components.length,
      closeupsCount: closeups.length,
      sketchesCount: sketches.length,
      flatSketchesCount: flatSketches.length,
      hasAssemblyView: !!assemblyView,
      selectedRevisionId,
    });

    return {
      success: true,
      data: {
        baseViews,
        components,
        closeups,
        sketches,
        flatSketches,
        assemblyView,
        selectedRevisionId,
      },
    };
  } catch (error) {
    console.error("Error in getTechFilesForProduct:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
