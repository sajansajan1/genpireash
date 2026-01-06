"use server";

import { createClient } from "@/lib/supabase/server";

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

export interface SaveUTMOptions {
  userId: string;
  utmData: UTMData;
  attributionType?: AttributionType;
  eventType?: EventType;
  eventValue?: number;
  eventCurrency?: string;
}

/**
 * Save UTM/campaign data for a user to the user_utm_tracking table
 * Supports multiple attribution types for comprehensive tracking
 */
export async function saveUTMData(options: SaveUTMOptions) {
  const {
    userId,
    utmData,
    attributionType = "signup",
    eventType = "signup",
    eventValue,
    eventCurrency,
  } = options;

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
    const supabase = await createClient();

    // Check if first_touch already exists for this user
    if (attributionType === "first_touch") {
      const { data: existing } = await supabase
        .from("user_utm_tracking")
        .select("id")
        .eq("user_id", userId)
        .eq("attribution_type", "first_touch")
        .single();

      // If first_touch exists, don't overwrite it
      if (existing) {
        console.log("[saveUTMData] First touch already exists, skipping");
        return { success: true, message: "First touch attribution already recorded" };
      }
    }

    const { error } = await supabase.from("user_utm_tracking").insert({
      user_id: userId,
      attribution_type: attributionType,
      event_type: eventType,
      event_value: eventValue,
      event_currency: eventCurrency,
      ...cleanData,
      captured_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[saveUTMData] Error saving UTM data:", error);
      return { success: false, error: error.message };
    }

    console.log("[saveUTMData] UTM data saved:", {
      userId,
      attributionType,
      eventType,
      campaign: cleanData.utm_campaign,
      source: cleanData.utm_source,
    });

    return { success: true };
  } catch (error) {
    console.error("[saveUTMData] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Helper function for signup UTM tracking
 * Saves both first_touch and signup attribution
 */
export async function saveSignupUTM(userId: string, utmData: UTMData) {
  // Save as first touch (won't overwrite if exists)
  await saveUTMData({
    userId,
    utmData,
    attributionType: "first_touch",
    eventType: "signup",
  });

  // Also save as signup event
  return saveUTMData({
    userId,
    utmData,
    attributionType: "signup",
    eventType: "signup",
  });
}

/**
 * Helper function for conversion/purchase UTM tracking
 */
export async function saveConversionUTM(
  userId: string,
  utmData: UTMData,
  value: number,
  currency: string = "USD"
) {
  return saveUTMData({
    userId,
    utmData,
    attributionType: "conversion",
    eventType: "purchase",
    eventValue: value,
    eventCurrency: currency,
  });
}

/**
 * Get all UTM data for a user
 */
export async function getUserUTMData(userId: string) {
  if (!userId) {
    return { success: false, error: "User ID required" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_utm_tracking")
      .select("*")
      .eq("user_id", userId)
      .order("captured_at", { ascending: false });

    if (error) {
      console.error("[getUserUTMData] Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[getUserUTMData] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get first touch attribution for a user
 */
export async function getFirstTouchUTM(userId: string) {
  if (!userId) {
    return { success: false, error: "User ID required" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_utm_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("attribution_type", "first_touch")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[getFirstTouchUTM] Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[getFirstTouchUTM] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get signup attribution for a user
 */
export async function getSignupUTM(userId: string) {
  if (!userId) {
    return { success: false, error: "User ID required" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_utm_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("attribution_type", "signup")
      .order("captured_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[getSignupUTM] Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[getSignupUTM] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
