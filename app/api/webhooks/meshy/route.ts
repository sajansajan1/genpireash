import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Meshy.ai Webhook Endpoint
 *
 * Receives real-time updates when 3D model generation tasks complete or change status.
 * This replaces the need for continuous polling and provides instant updates.
 *
 * Webhook Secret: VFmrjveeKwMFPt5uLHl-SvPIB3XoTAgG
 * Endpoint URL: https://your-domain.com/api/webhooks/meshy
 */

interface MeshyWebhookPayload {
  id: string; // Task ID
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED";
  progress: number;
  model_urls?: {
    glb?: string;
    fbx?: string;
    usdz?: string;
    obj?: string;
    mtl?: string;
  };
  thumbnail_url?: string;
  texture_urls?: Array<{
    base_color?: string;
    metallic?: string;
    roughness?: string;
    normal?: string;
  }>;
  task_error?: {
    message?: string;
    code?: string;
  };
  finished_at?: number; // Unix timestamp in milliseconds
  created_at?: number;
  updated_at?: number;
}

/**
 * POST /api/webhooks/meshy
 *
 * Receives webhook events from Meshy.ai when task status changes
 */
export async function POST(req: NextRequest) {
  try {
    console.log("Received Meshy webhook");
    // Get raw body and parse webhook payload
    const rawBody = await req.text();
    const payload: MeshyWebhookPayload = JSON.parse(rawBody);

    console.log("Received Meshy webhook:", {
      taskId: payload.id,
      status: payload.status,
      progress: payload.progress,
    });

    // Validate required fields
    if (!payload.id || !payload.status) {
      console.error("Missing required fields in webhook payload");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: payload.status,
      progress: payload.progress || 0,
    };

    // If task is completed successfully, fetch complete data from Meshy API
    if (payload.status === "SUCCEEDED") {
      console.log(
        "Task succeeded, fetching complete model data from Meshy API..."
      );

      try {
        // Fetch complete model data from Meshy API
        const meshyResponse = await fetch(
          `https://api.meshy.ai/openapi/v1/multi-image-to-3d/${payload.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.MESHY_API_KEY || "msy_zxwj3ZPxAysi7V2b22djdyhqEtZO91YZ1BsH"}`,
            },
          }
        );

        if (meshyResponse.ok) {
          const completeData = await meshyResponse.json();
          console.log("Fetched complete model data:", {
            status: completeData.status,
            hasModelUrls: !!completeData.model_urls,
            hasThumbnail: !!completeData.thumbnail_url,
          });

          // Use complete data from API
          updateData.model_urls = completeData.model_urls || {};
          updateData.thumbnail_url = completeData.thumbnail_url;
          updateData.texture_urls = completeData.texture_urls || [];
          updateData.finished_at = completeData.finished_at
            ? new Date(completeData.finished_at).toISOString()
            : new Date().toISOString();
        } else {
          console.error(
            "Failed to fetch complete model data from Meshy:",
            meshyResponse.status
          );
          // Fallback to webhook payload data
          updateData.model_urls = payload.model_urls || {};
          updateData.thumbnail_url = payload.thumbnail_url;
          updateData.texture_urls = payload.texture_urls || [];
          updateData.finished_at = payload.finished_at
            ? new Date(payload.finished_at).toISOString()
            : new Date().toISOString();
        }
      } catch (fetchError) {
        console.error("Error fetching complete model data:", fetchError);
        // Fallback to webhook payload data
        updateData.model_urls = payload.model_urls || {};
        updateData.thumbnail_url = payload.thumbnail_url;
        updateData.texture_urls = payload.texture_urls || [];
        updateData.finished_at = payload.finished_at
          ? new Date(payload.finished_at).toISOString()
          : new Date().toISOString();
      }
    }

    // If task failed, save error information
    if (payload.status === "FAILED") {
      updateData.task_error =
        payload.task_error?.message || "Generation failed";
      updateData.finished_at = payload.finished_at
        ? new Date(payload.finished_at).toISOString()
        : new Date().toISOString();
    }

    // If task expired
    if (payload.status === "EXPIRED") {
      updateData.task_error = "Task expired";
      updateData.finished_at = new Date().toISOString();
    }

    // Update database record using service role client (bypasses RLS)
    const supabase = await createServiceRoleClient();

    // First check if record exists
    const { data: existingRecord } = await supabase
      .from("product_3d_models")
      .select("id")
      .eq("task_id", payload.id)
      .maybeSingle();

    if (!existingRecord) {
      console.warn(
        `No record found for task_id: ${payload.id}. Webhook will be retried by Meshy.`
      );
      return NextResponse.json(
        {
          error: "Record not found",
          taskId: payload.id,
          message: "3D model record not yet created, will retry",
        },
        { status: 404 }
      );
    }

    // Update the record
    const { data: updatedModel, error: dbError } = await supabase
      .from("product_3d_models")
      .update(updateData)
      .eq("task_id", payload.id)
      .select("*, user_id")
      .single();

    if (dbError) {
      console.error("Failed to update 3D model record:", dbError);

      // For DB errors, return 200 to acknowledge receipt
      // We don't want Meshy to keep retrying if it's a permanent DB issue
      return NextResponse.json(
        {
          received: true,
          warning: "Database update failed",
          taskId: payload.id,
          error: dbError.message,
        },
        { status: 200 }
      );
    }

    console.log("Successfully updated 3D model record:", {
      taskId: payload.id,
      modelId: updatedModel?.id,
      status: payload.status,
    });

    // Send notification when 3D model generation succeeds
    if (payload.status === "SUCCEEDED" && updatedModel?.user_id) {
      console.log(`Creating notification for user: ${updatedModel.user_id}`);
      try {
        await supabase.from("notifications").insert({
          senderId: updatedModel.user_id, // System notification (self)
          receiverId: updatedModel.user_id,
          title: "3D Model Ready!",
          message:
            "Your 3D model has been generated successfully and is ready to view and download.",
          type: "3d_model_ready",
          read: false,
          created_at: new Date().toISOString(),
        });
        console.log("✅ Notification created successfully");
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Continue anyway - we don't want to fail the webhook because of notification
      }
    }

    // Deduct 10 credits when 3D model generation succeeds
    if (payload.status === "SUCCEEDED" && updatedModel?.user_id) {
      console.log(
        `Deducting 10 credits for successful 3D model generation for user: ${updatedModel.user_id}`
      );
      try {
        // Fetch all active credit sources for this user (subscription + top-ups)
        const { data: creditRecords, error: fetchError } = await supabase
          .from("user_credits")
          .select("id, credits, plan_type, status, created_at")
          .eq("user_id", updatedModel.user_id)
          .eq("status", "active")
          .order("plan_type", { ascending: true }) // subscription before top-up
          .order("created_at", { ascending: true });

        if (fetchError) {
          console.error("Error fetching credits:", fetchError);
        } else if (!creditRecords || creditRecords.length === 0) {
          console.warn("No active credits found for user");
        } else {
          // Calculate total available credits
          const totalAvailable = creditRecords.reduce(
            (sum, r) => sum + r.credits,
            0
          );

          if (totalAvailable < 10) {
            console.warn(
              `Not enough credits to deduct. User has ${totalAvailable} credits but needs 10.`
            );
          } else {
            // Deduct credits from prioritized sources
            let remainingToDeduct = 10;
            const updatedRecords: { id: string; newCredits: number }[] = [];

            for (const record of creditRecords) {
              if (remainingToDeduct <= 0) break;

              const deductAmount = Math.min(record.credits, remainingToDeduct);
              const newCredits = record.credits - deductAmount;
              updatedRecords.push({ id: record.id, newCredits });
              remainingToDeduct -= deductAmount;
            }

            // Update each modified record
            for (const { id, newCredits } of updatedRecords) {
              const { error: updateError } = await supabase
                .from("user_credits")
                .update({
                  credits: newCredits,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", id);

              if (updateError) {
                console.error(
                  `Failed to update credits for record ${id}:`,
                  updateError
                );
              } else {
                // Auto-expire one-time plans that hit 0
                if (newCredits === 0) {
                  await supabase
                    .from("user_credits")
                    .update({ status: "expired" })
                    .eq("id", id)
                    .eq("plan_type", "one_time");
                }
              }
            }

            console.log(
              "✅ Successfully deducted 10 credits for 3D model generation"
            );
          }
        }
      } catch (creditError) {
        console.error("Error deducting credits:", creditError);
        // Continue anyway - we don't want to fail the webhook because of credit deduction
      }
    }

    // Optional: Trigger real-time updates to connected clients
    // You could use Server-Sent Events, WebSockets, or Pusher here
    // await notifyClients(updatedModel);

    // Return success response (must be < 400 status code)
    return NextResponse.json(
      {
        received: true,
        taskId: payload.id,
        modelId: updatedModel?.id,
        status: payload.status,
        message: "Webhook processed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Meshy webhook:", error);

    // Return 200 even on error to prevent Meshy from retrying
    // Log the error for manual investigation
    return NextResponse.json(
      {
        received: true,
        error: "Internal processing error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}

/**
 * GET /api/webhooks/meshy
 *
 * Health check endpoint to verify webhook is accessible
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/meshy",
    description: "Meshy.ai webhook receiver for 3D model generation updates",
    timestamp: new Date().toISOString(),
  });
}
