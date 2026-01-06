import { NextRequest, NextResponse } from "next/server";
import {
  getActiveProduct3DModel,
  getAllProduct3DModels,
  setActiveProduct3DModel,
  deleteProduct3DModel,
} from "@/lib/supabase/product3DModel";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/product-3d-models
 * Fetch 3D models for a product or collection
 * Query params:
 * - sourceType: "product" | "collection"
 * - sourceId: UUID
 * - includeAll: boolean (default: false) - fetch all versions or just active
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceType = searchParams.get("sourceType");
    const sourceId = searchParams.get("sourceId");
    const includeAll = searchParams.get("includeAll") === "true";

    // Validate parameters
    if (!sourceType || !sourceId) {
      return NextResponse.json(
        { error: "Missing sourceType or sourceId parameter" },
        { status: 400 }
      );
    }

    if (sourceType !== "product" && sourceType !== "collection") {
      return NextResponse.json(
        { error: "Invalid sourceType. Must be 'product' or 'collection'" },
        { status: 400 }
      );
    }

    // Fetch models based on query
    if (includeAll) {
      // Get all versions
      const { data, error } = await getAllProduct3DModels(
        sourceType as "product" | "collection",
        sourceId
      );

      if (error) {
        console.error("Error fetching all 3D models:", error);
        return NextResponse.json(
          { error: "Failed to fetch 3D models" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        models: data || [],
        count: data?.length || 0,
      });
    } else {
      // Get only active version
      const { data, error } = await getActiveProduct3DModel(
        sourceType as "product" | "collection",
        sourceId
      );

      // No active model is not an error, just return null
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching active 3D model:", error);
        return NextResponse.json(
          { error: "Failed to fetch 3D model" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        model: data || null,
      });
    }
  } catch (error) {
    console.error("Error in GET /api/product-3d-models:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/product-3d-models
 * Update a 3D model (e.g., set as active version)
 * Body:
 * - modelId: UUID
 * - action: "set_active"
 */
export async function PATCH(req: NextRequest) {
  try {
    const { modelId, action } = await req.json();

    if (!modelId || !action) {
      return NextResponse.json(
        { error: "Missing modelId or action" },
        { status: 400 }
      );
    }

    if (action === "set_active") {
      // First, get the model to find its source_type and source_id
      const supabase = await createClient();
      const { data: modelData, error: fetchError } = await supabase
        .from("product_3d_models")
        .select("source_type, source_id")
        .eq("id", modelId)
        .single();

      if (fetchError || !modelData) {
        console.error("Error fetching model:", fetchError);
        return NextResponse.json(
          { error: "Model not found" },
          { status: 404 }
        );
      }

      // Deactivate all other active versions for this source BEFORE setting new active
      // This prevents the unique constraint violation
      const { error: deactivateError } = await supabase
        .from("product_3d_models")
        .update({ is_active: false })
        .eq("source_type", modelData.source_type)
        .eq("source_id", modelData.source_id)
        .eq("is_active", true)
        .neq("id", modelId); // Don't deactivate the model we're about to activate

      if (deactivateError) {
        console.error("Error deactivating other versions:", deactivateError);
        return NextResponse.json(
          { error: "Failed to deactivate other versions" },
          { status: 500 }
        );
      }

      // Now set the new model as active
      const { data, error } = await setActiveProduct3DModel(modelId);

      if (error) {
        console.error("Error setting active 3D model:", error);
        return NextResponse.json(
          { error: "Failed to set active model" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        model: data,
        message: "Model set as active successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: 'set_active'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/product-3d-models:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/product-3d-models
 * Delete a 3D model version
 * Query params:
 * - modelId: UUID
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get("modelId");

    if (!modelId) {
      return NextResponse.json(
        { error: "Missing modelId parameter" },
        { status: 400 }
      );
    }

    const { error } = await deleteProduct3DModel(modelId);

    if (error) {
      console.error("Error deleting 3D model:", error);
      return NextResponse.json(
        { error: "Failed to delete 3D model" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "3D model deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/product-3d-models:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
