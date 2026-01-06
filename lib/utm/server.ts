/**
 * Server-side UTM tracking utilities
 * Used by webhooks and other server-side code that doesn't have access to cookies
 */

import { createServiceRoleClient } from "@/lib/supabase/server";

export interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_id?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
  referral_code?: string;
  landing_page?: string;
  referrer_url?: string;
  user_agent?: string;
}

export type AttributionType = "first_touch" | "last_touch" | "signup" | "conversion" | "visit";
export type EventType = "visit" | "signup" | "login" | "purchase" | "subscription" | "design_start" | "techpack_generate";

/**
 * Get first touch attribution for a user (server-side)
 */
export async function getFirstTouchUTMServer(userId: string) {
  if (!userId) {
    return { success: false, error: "User ID required", data: null };
  }

  try {
    const supabase = await createServiceRoleClient();

    const { data, error } = await supabase
      .from("user_utm_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("attribution_type", "first_touch")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[getFirstTouchUTMServer] Error:", error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[getFirstTouchUTMServer] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

/**
 * Save conversion UTM data (server-side)
 * Used by webhooks to track purchase conversions
 */
export async function saveConversionUTMServer(
  userId: string,
  utmData: UTMData,
  value: number,
  currency: string = "USD"
) {
  if (!userId) {
    return { success: false, error: "User ID required" };
  }

  // Filter out empty/undefined values
  const cleanData: Record<string, string | number | undefined> = {};
  Object.entries(utmData).forEach(([key, value]) => {
    if (value && typeof value === "string" && value.trim() !== "") {
      cleanData[key] = value.trim();
    }
  });

  // If no UTM data to save, return early
  if (Object.keys(cleanData).length === 0) {
    return { success: true, message: "No UTM data to save" };
  }

  try {
    const supabase = await createServiceRoleClient();

    const { error } = await supabase.from("user_utm_tracking").insert({
      user_id: userId,
      attribution_type: "conversion",
      event_type: "purchase",
      event_value: value,
      event_currency: currency,
      ...cleanData,
      captured_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[saveConversionUTMServer] Error saving UTM data:", error);
      return { success: false, error: error.message };
    }

    console.log("[saveConversionUTMServer] Conversion UTM data saved:", {
      userId,
      value,
      currency,
      campaign: cleanData.utm_campaign,
      source: cleanData.utm_source,
    });

    return { success: true };
  } catch (error) {
    console.error("[saveConversionUTMServer] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
