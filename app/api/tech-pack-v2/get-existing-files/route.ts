/**
 * Tech Pack V2 - Get Existing Files API Route
 * POST /api/tech-pack-v2/get-existing-files
 * Retrieves existing tech files for a specific product and revision
 */

import { NextRequest, NextResponse } from "next/server";
import { getLatestTechFiles } from "@/api/tech-pack-v2/tech-files-service";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, revisionId } = body;

    // Validate required fields
    if (!productId || !revisionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: productId and revisionId",
        },
        { status: 400 }
      );
    }

    // Get Supabase client for auth
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Debug: Check if this revision exists in product_multiview_revisions
    const { data: revisionCheck } = await supabase
      .from("product_multiview_revisions")
      .select("id, view_type, image_url")
      .eq("id", revisionId)
      .maybeSingle();

    console.log("[Get Existing Files] Revision check:", {
      revisionId,
      existsInMultiview: !!revisionCheck,
      revisionData: revisionCheck,
    });

    // Debug: Check ALL base_view files for this product (without revision filter)
    const { data: allBaseViews } = await supabase
      .from("tech_files")
      .select("*")
      .eq("product_idea_id", productId)
      .eq("file_type", "base_view")
      .order("created_at", { ascending: false })
      .limit(1);

    console.log("[Get Existing Files] ALL base_view files for product:", {
      count: allBaseViews?.length || 0,
      baseViews: allBaseViews?.map((f) => ({
        id: f.id.substring(0, 8),
        revisionId: f.revision_id?.substring(0, 8),
        viewType: f.view_type,
        isLatest: f.is_latest,
        status: f.status,
        createdAt: f.created_at,
      })),
    });

    // Debug: Check ALL closeup files without revision filter
    const { data: allCloseups } = await supabase
      .from("tech_files")
      .select(
        "id, revision_id, file_type, is_latest, status, created_at, file_category"
      )
      .eq("revision_id", revisionId)
      .eq("file_type", "closeup")
      .order("created_at", { ascending: false })
      .limit(6);

    console.log("[Get Existing Files] ALL closeup files for product:", {
      count: allCloseups?.length || 0,
      closeups: allCloseups?.map((f) => ({
        id: f.id.substring(0, 8),
        revisionId: f.revision_id?.substring(0, 8),
        revisionMatch: f.revision_id === revisionId,
        isLatest: f.is_latest,
        status: f.status,
        category: f.file_category,
        createdAt: f.created_at,
      })),
    });

    // Query tech_files for each file type with this product and revision
    console.log("[Get Existing Files] Query params:", {
      productId,
      revisionId,
      revisionIdShort: revisionId.substring(0, 8),
    });

    const [baseViewFiles, componentFiles, closeUpFiles, sketchFiles, flatSketchFiles, assemblyViewFiles] = await Promise.all([
      getLatestTechFiles(productId, {
        fileType: "base_view",
        revisionId: revisionId,
        limit: 10, // Get multiple base views (front, back, side, etc.)
      }),
      getLatestTechFiles(productId, {
        fileType: "component",
        revisionId: revisionId,
        limit: 10, // Get component/ingredient images
      }),
      getLatestTechFiles(productId, {
        fileType: "closeup",
        revisionId: revisionId,
        limit: 6,
      }),
      getLatestTechFiles(productId, {
        fileType: "sketch",
        revisionId: revisionId,
        limit: 3,
      }),
      getLatestTechFiles(productId, {
        fileType: "flat_sketch",
        revisionId: revisionId,
        limit: 3, // Get flat sketches (front, back, side)
      }),
      getLatestTechFiles(productId, {
        fileType: "assembly_view",
        revisionId: revisionId,
        limit: 1, // Get assembly/exploded view
      }),
    ]);

    // Debug: Log raw base view files BEFORE filtering
    console.log("[Get Existing Files] RAW base view files BEFORE filtering:", {
      count: baseViewFiles.length,
      files: baseViewFiles.map((f) => ({
        id: f.id.substring(0, 8),
        revisionId: f.revision_id?.substring(0, 8),
        viewType: f.view_type,
        hasFileUrl: !!f.file_url,
        fileUrl: f.file_url?.substring(0, 50),
        status: f.status,
        hasAnalysisData: !!f.analysis_data,
      })),
    });

    // Filter valid base views FIRST before any logging or mapping
    const validBaseViewFiles = baseViewFiles.filter(
      (file) => file.view_type && file.file_url && file.status === "completed"
    );

    console.log("[Get Existing Files] Query results:", {
      baseViewCount: baseViewFiles.length,
      validBaseViewCount: validBaseViewFiles.length,
      componentCount: componentFiles.length,
      closeUpCount: closeUpFiles.length,
      sketchCount: sketchFiles.length,
      flatSketchCount: flatSketchFiles.length,
      assemblyViewCount: assemblyViewFiles.length,
      baseViewRevisions: validBaseViewFiles.map((f) => ({
        id: f.id.substring(0, 8),
        revisionId: f.revision_id?.substring(0, 8),
        viewType: f.view_type,
        status: f.status,
      })),
      componentRevisions: componentFiles.map((f) => ({
        id: f.id.substring(0, 8),
        revisionId: f.revision_id?.substring(0, 8),
        category: f.file_category,
        status: f.status,
      })),
      closeUpRevisions: closeUpFiles.map((f) => ({
        id: f.id.substring(0, 8),
        revisionId: f.revision_id?.substring(0, 8),
        category: f.file_category,
        status: f.status,
      })),
      sketchRevisions: sketchFiles.map((f) => ({
        id: f.id.substring(0, 8),
        revisionId: f.revision_id?.substring(0, 8),
        viewType: f.view_type,
        status: f.status,
      })),
      flatSketchRevisions: flatSketchFiles.map((f) => ({
        id: f.id.substring(0, 8),
        revisionId: f.revision_id?.substring(0, 8),
        viewType: f.view_type,
        status: f.status,
      })),
      assemblyViewRevisions: assemblyViewFiles.map((f) => ({
        id: f.id.substring(0, 8),
        revisionId: f.revision_id?.substring(0, 8),
        status: f.status,
      })),
    });

    // Transform to UI format - use already filtered valid base views
    const baseViews = validBaseViewFiles.map((file, index) => ({
      revisionId: file.revision_id,
      viewType: file.view_type,
      imageUrl: file.file_url,
      thumbnailUrl: file.thumbnail_url || file.file_url,
      analysisData: file.analysis_data,
      confidenceScore: file.confidence_score || 0.85,
      cached: true,
      isExpanded: index === 0, // First base view is expanded by default
      version: file.version,
      timestamp: new Date(file.created_at).getTime(),
    }));

    const components = componentFiles
      .filter((file) => file.file_url) // Ensure components have URLs
      .map((file, index) => ({
        id: file.id,
        componentName: file.metadata?.component_name || file.analysis_data?.component_shot?.component_name || 'Component',
        componentType: file.file_category || file.analysis_data?.component_shot?.component_type || 'material',
        imageUrl: file.file_url,
        thumbnailUrl: file.thumbnail_url,
        guide: file.analysis_data?.component_guide,
        shotData: file.analysis_data?.component_shot,
        order: index + 1,
        loadingState: file.status === 'failed' ? ('error' as const) : ('loaded' as const),
        timestamp: new Date(file.created_at).getTime(),
      }));

    const closeUps = closeUpFiles
      .filter((file) => file.file_url) // Ensure closeups have URLs
      .map((file, index) => ({
        id: file.id,
        imageUrl: file.file_url,
        thumbnailUrl: file.thumbnail_url,
        shotMetadata: {
          focus_area: file.file_category || "Detail",
          description:
            file.status === "failed"
              ? file.analysis_data?.error || "Generation failed"
              : file.analysis_data?.detailed_observations?.material_details
                  ?.surface_quality || "Detailed close-up shot",
        },
        analysisData: file.analysis_data,
        summary: file.analysis_data?.summary, // Include comprehensive close-up summary
        order: index + 1,
        loadingState:
          file.status === "failed" ? ("error" as const) : ("loaded" as const),
        timestamp: new Date(file.created_at).getTime(),
      }));

    const sketches = sketchFiles
      .filter((file) => file.view_type && file.file_url) // Ensure sketches have view_type and URL
      .map((file) => ({
        id: file.id,
        viewType: file.view_type,
        imageUrl: file.file_url,
        thumbnailUrl: file.thumbnail_url,
        callouts:
          file.analysis_data?.callouts?.map((callout: any, index: number) => ({
            id: `callout-${index + 1}`,
            text: callout.feature_name || callout.specification,
            position: { x: 50 + index * 10, y: 20 + index * 15 },
            type: callout.category || "note",
          })) || [],
        measurements: file.analysis_data?.measurements || {},
        summary: file.analysis_data?.summary, // Include comprehensive sketch summary
        loadingState: "loaded" as const,
        timestamp: new Date(file.created_at).getTime(),
      }));

    // Transform flat sketches
    const flatSketches = flatSketchFiles
      .filter((file) => file.view_type && file.file_url) // Ensure flat sketches have view_type and URL
      .map((file) => ({
        id: file.id,
        viewType: file.view_type as "front" | "back" | "side",
        imageUrl: file.file_url,
        thumbnailUrl: file.thumbnail_url,
        loadingState: "loaded" as const,
        timestamp: new Date(file.created_at).getTime(),
      }));

    // Transform assembly view (only one)
    const assemblyViewFile = assemblyViewFiles.find(
      (file) => file.file_url && file.status === "completed"
    );
    const assemblyView = assemblyViewFile
      ? {
          id: assemblyViewFile.id,
          imageUrl: assemblyViewFile.file_url,
          thumbnailUrl: assemblyViewFile.thumbnail_url,
          description: assemblyViewFile.analysis_data?.description,
          summary: assemblyViewFile.analysis_data?.summary, // Assembly guide data
          loadingState: "loaded" as const,
          timestamp: new Date(assemblyViewFile.created_at).getTime(),
        }
      : null;

    // First, try to get category from product_ideas table (primary source of truth)
    let category = null;
    const { data: productIdea } = await supabase
      .from('product_ideas')
      .select('category, category_subcategory')
      .eq('id', productId)
      .single();

    if (productIdea?.category) {
      category = {
        category: productIdea.category,
        subcategory: productIdea.category_subcategory || 'general',
        confidence: 1.0, // High confidence since it's from product_ideas
        timestamp: Date.now(),
      };
      console.log('[Get Existing Files] Using category from product_ideas:', category);
    }

    // Fallback: Try to get category from base views analysis if not in product_ideas
    if (!category && baseViews.length > 0 && baseViews[0].analysisData) {
      const analysisData = baseViews[0].analysisData;

      // Check if product_category is a string (new format) or object (old format)
      if (typeof analysisData.product_category === "string") {
        // New format: product_category is directly a string
        category = {
          category: analysisData.product_category,
          subcategory: analysisData.product_subcategory || null,
          confidence:
            analysisData.confidence_scores?.category_detection || 0.85,
        };
      } else if (
        analysisData.product_category &&
        typeof analysisData.product_category === "object"
      ) {
        // Old format: product_category is an object
        const categoryData = analysisData.product_category;
        category = {
          category: categoryData.category || categoryData.primary_category,
          subcategory:
            categoryData.subcategory || categoryData.secondary_category,
          confidence: categoryData.confidence || 0.85,
        };
      }
      console.log('[Get Existing Files] Using category from base view analysis:', category);
    }

    return NextResponse.json({
      success: true,
      data: {
        baseViews,
        components,
        closeUps,
        sketches,
        flatSketches,
        assemblyView,
        category,
      },
    });
  } catch (error) {
    console.error("Get existing files API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load existing files",
      },
      { status: 500 }
    );
  }
}
