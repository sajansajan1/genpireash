"use server";

/**
 * Server action for creating RFQ (Request for Quote)
 * Used from BOM sidebar and other places to request manufacturing quotes
 */

import { createClient } from "@/lib/supabase/server";

// Input types
export interface CreateRFQInput {
  title: string;
  productIdea: string;
  techpackId: string;
  creatorId: string;
  timeline: string;
  quantity: string;
  targetPrice?: string;
  status?: "open" | "draft";
  // Optional: specific suppliers to send to (if empty, sends to all matching)
  supplierIds?: string[];
}

export interface CreateRFQResult {
  success: boolean;
  rfqId?: string;
  supplierCount?: number;
  error?: string;
}

/**
 * Create an RFQ and optionally link it to suppliers
 */
export async function createRFQAction(input: CreateRFQInput): Promise<CreateRFQResult> {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // 1. Create the RFQ record
    const { data: rfq, error: rfqError } = await supabase
      .from("rfq")
      .insert({
        title: input.title,
        product_idea: input.productIdea,
        techpack_id: input.techpackId,
        creator_id: input.creatorId,
        timeline: input.timeline,
        quantity: input.quantity,
        target_price: input.targetPrice || "TBD",
        status: input.status || "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (rfqError || !rfq) {
      console.error("Error creating RFQ:", rfqError);
      return { success: false, error: rfqError?.message || "Failed to create RFQ" };
    }

    // 2. Get suppliers to link
    let supplierIds = input.supplierIds || [];

    // If no specific suppliers provided, get all active suppliers
    if (supplierIds.length === 0) {
      const { data: suppliers, error: suppliersError } = await supabase
        .from("supplier_profile")
        .select("id")
        .limit(50); // Limit to prevent sending to too many

      if (!suppliersError && suppliers) {
        supplierIds = suppliers.map((s: { id: string }) => s.id);
      }
    }

    // 3. Link RFQ to suppliers
    if (supplierIds.length > 0) {
      const now = new Date().toISOString();
      const supplierLinks = supplierIds.map((supplierId) => ({
        supplier_id: supplierId,
        rfqs_id: rfq.id,
        created_at: now,
        updated_at: now,
      }));

      const { error: linkError } = await supabase
        .from("supplier_rfqs")
        .insert(supplierLinks);

      if (linkError) {
        console.error("Error linking suppliers to RFQ:", linkError);
        // Don't fail the whole operation, RFQ was created
      }
    }

    return {
      success: true,
      rfqId: rfq.id,
      supplierCount: supplierIds.length,
    };
  } catch (error) {
    console.error("Unexpected error creating RFQ:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}

/**
 * Get all available suppliers for RFQ
 */
export async function getAvailableSuppliersAction(): Promise<{
  success: boolean;
  suppliers?: Array<{
    id: string;
    companyName: string;
    location: string | null;
    companyLogo: string | null;
    categories: string[];
  }>;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const { data: suppliers, error } = await supabase
      .from("supplier_profile")
      .select("id, company_name, location, company_logo, manufacturing")
      .limit(100);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      suppliers: (suppliers || []).map((s: any) => ({
        id: s.id,
        companyName: s.company_name || "Unknown",
        location: s.location,
        companyLogo: s.company_logo,
        categories: s.manufacturing?.product_categories || [],
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch suppliers",
    };
  }
}

/**
 * Check if an RFQ already exists for a techpack
 */
export async function checkExistingRFQAction(techpackId: string): Promise<{
  success: boolean;
  exists: boolean;
  rfq?: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
  };
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, exists: false, error: "Authentication required" };
  }

  try {
    const { data: rfq, error } = await supabase
      .from("rfq")
      .select("id, title, status, created_at")
      .eq("techpack_id", techpackId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error checking existing RFQ:", error);
      return { success: false, exists: false, error: error.message };
    }

    if (rfq) {
      return {
        success: true,
        exists: true,
        rfq: {
          id: rfq.id,
          title: rfq.title,
          status: rfq.status,
          createdAt: rfq.created_at,
        },
      };
    }

    return { success: true, exists: false };
  } catch (error) {
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : "Failed to check RFQ",
    };
  }
}

/**
 * Create RFQ with notification to suppliers
 */
export async function createRFQWithNotificationAction(
  input: CreateRFQInput & {
    creatorName?: string;
    creatorUserId?: string;
  }
): Promise<CreateRFQResult & { notificationsSent?: number }> {
  // First create the RFQ
  const result = await createRFQAction(input);

  if (!result.success || !result.rfqId) {
    return result;
  }

  // If we have supplier IDs and creator info, send notifications
  if (input.supplierIds && input.supplierIds.length > 0 && input.creatorUserId) {
    const supabase = await createClient();

    try {
      // Get supplier user IDs for notifications
      const { data: suppliers } = await supabase
        .from("supplier_profile")
        .select("user_id")
        .in("id", input.supplierIds);

      if (suppliers && suppliers.length > 0) {
        const now = new Date().toISOString();
        const notifications = suppliers
          .filter((s: any) => s.user_id)
          .map((s: any) => ({
            sender_id: input.creatorUserId,
            receiver_id: s.user_id,
            title: "New RFQ",
            message: `New RFQ from ${input.creatorName || "a creator"} for "${input.title}"`,
            type: "rfq_response",
            is_read: false,
            created_at: now,
          }));

        if (notifications.length > 0) {
          await supabase.from("notifications").insert(notifications);
        }

        return {
          ...result,
          notificationsSent: notifications.length,
        };
      }
    } catch (notifyError) {
      console.error("Error sending notifications:", notifyError);
      // Don't fail, RFQ was created successfully
    }
  }

  return result;
}
