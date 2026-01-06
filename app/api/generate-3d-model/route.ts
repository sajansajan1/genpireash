import { NextRequest, NextResponse } from "next/server";
import {
  createProduct3DModel,
  updateProduct3DModelByTaskId,
} from "@/lib/supabase/product3DModel";
import { createClient } from "@/lib/supabase/server";

/**
 * Generate 3D Model from Tech Pack Views
 *
 * Uses AI to convert 5 orthographic views into a 3D model
 * Compatible with AutoCAD export formats
 */

export async function POST(req: NextRequest) {
  try {
    const { imageUrls, sourceType, sourceId } = await req.json();

    // Validate input
    if (!imageUrls || !imageUrls.front || !imageUrls.back) {
      return NextResponse.json(
        { error: "Missing required views (front, back minimum)" },
        { status: 400 }
      );
    }

    // Validate source information
    if (!sourceType || !sourceId) {
      return NextResponse.json(
        { error: "Missing sourceType or sourceId" },
        { status: 400 }
      );
    }

    if (sourceType !== "product" && sourceType !== "collection") {
      return NextResponse.json(
        { error: "Invalid sourceType. Must be 'product' or 'collection'" },
        { status: 400 }
      );
    }

    // Using Meshy.ai for 3D generation (multi-image-to-3d endpoint)
    const meshyResponse = await fetch(
      "https://api.meshy.ai/openapi/v1/multi-image-to-3d",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MESHY_API_KEY || "msy_zxwj3ZPxAysi7V2b22djdyhqEtZO91YZ1BsH"}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_urls: [
            imageUrls.front,
            imageUrls.back,
            imageUrls.side,
            imageUrls.top,
          ].filter(Boolean), // Remove undefined views
          should_remesh: true, // Optimize mesh topology
          should_texture: true, // Generate textures
          enable_pbr: true, // Physical-based rendering materials
        }),
      }
    );

    if (!meshyResponse.ok) {
      const errorData = await meshyResponse.json().catch(() => ({}));
      console.error("Meshy API error:", {
        status: meshyResponse.status,
        statusText: meshyResponse.statusText,
        errorData,
      });
      throw new Error(
        `3D generation failed: ${meshyResponse.status} ${meshyResponse.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const result = await meshyResponse.json();

    // Log the response to understand the format
    console.log("Meshy API POST response:", result);

    // Meshy API returns: { result: "task_id_here" }
    const taskId = result.result;

    if (!taskId) {
      console.error("No task ID in response:", result);
      throw new Error("No task ID returned from Meshy API");
    }

    console.log("Task created successfully with ID:", taskId);

    // Deactivate existing active models BEFORE inserting new one
    // The unique constraint is checked before INSERT, but the trigger runs AFTER INSERT
    // So we need to manually deactivate first to avoid constraint violation
    const supabase = await createClient();
    const { error: deactivateError } = await supabase
      .from("product_3d_models")
      .update({ is_active: false })
      .eq("source_type", sourceType)
      .eq("source_id", sourceId)
      .eq("is_active", true);

    if (deactivateError) {
      console.warn("Failed to deactivate existing models:", deactivateError);
      // Continue anyway - might be first version
    } else {
      console.log("Deactivated existing active models for new version");
    }

    // Save initial 3D model record to database
    // Database trigger will automatically increment version number (trigger_set_model_version)
    const { data: modelRecord, error: dbError } = await createProduct3DModel({
      source_type: sourceType,
      source_id: sourceId,
      task_id: taskId,
      input_images: imageUrls,
      status: "PENDING",
      progress: 0,
      is_active: true,
    });

    if (dbError) {
      console.error("Failed to save 3D model record:", dbError);
      // Continue anyway - generation is already started
    } else {
      console.log("3D model record created:", modelRecord?.id);
    }

    return NextResponse.json({
      success: true,
      taskId: taskId,
      modelId: modelRecord?.id,
      message: "3D model generation started. This may take 2-3 minutes. You can safely navigate away and return later - we'll notify you when it's ready.",
    });
  } catch (error) {
    console.error("3D generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate 3D model",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Check 3D generation status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Missing taskId parameter" },
        { status: 400 }
      );
    }

    // Check status with AI service
    const statusResponse = await fetch(
      `https://api.meshy.ai/openapi/v1/multi-image-to-3d/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MESHY_API_KEY || "msy_zxwj3ZPxAysi7V2b22djdyhqEtZO91YZ1BsH"}`,
        },
      }
    );

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json().catch(() => ({}));
      console.error('Status check API error:', {
        status: statusResponse.status,
        statusText: statusResponse.statusText,
        errorData,
      });
      return NextResponse.json(
        { error: 'Failed to check status', details: errorData },
        { status: statusResponse.status }
      );
    }

    const statusData = await statusResponse.json();
    console.log('Status check response:', statusData);

    // Update database record with latest status
    const updateData: any = {
      status: statusData.status,
      progress: statusData.progress || 0,
    };

    // If generation is complete, save the model URLs
    if (statusData.status === "SUCCEEDED") {
      updateData.model_urls = statusData.model_urls || {};
      updateData.thumbnail_url = statusData.thumbnail_url;
      updateData.texture_urls = statusData.texture_urls || [];
      updateData.finished_at = statusData.finished_at
        ? new Date(statusData.finished_at).toISOString()
        : new Date().toISOString();
    }

    // If generation failed, save the error
    if (statusData.status === "FAILED") {
      updateData.task_error = statusData.task_error || "Generation failed";
      updateData.finished_at = statusData.finished_at
        ? new Date(statusData.finished_at).toISOString()
        : new Date().toISOString();
    }

    // Update the database record
    const { error: updateError } = await updateProduct3DModelByTaskId(
      taskId,
      updateData
    );

    if (updateError) {
      console.error("Failed to update 3D model record:", updateError);
      // Continue anyway - don't fail the status check
    }

    // Return current status with proper field mapping
    // Meshy API response includes: id, status, progress, model_urls, thumbnail_url, texture_urls, etc.
    return NextResponse.json({
      status: statusData.status, // 'PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED'
      progress: statusData.progress || 0,
      model_urls: statusData.model_urls || null, // Contains glb, fbx, obj, usdz
      thumbnail_url: statusData.thumbnail_url || null,
      texture_urls: statusData.texture_urls || null,
      task_error: statusData.task_error || null,
      finished_at: statusData.finished_at || null,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
