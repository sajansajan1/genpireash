import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { POLAR_SERVER } from "@/lib/polar/config";

/**
 * Polar Customer Portal Route
 *
 * This route provides access to the Polar customer portal where users can:
 * - View their subscriptions
 * - Manage billing information
 * - Cancel subscriptions
 * - View order history
 *
 * The customer ID is resolved from the authenticated user's profile.
 */
export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: POLAR_SERVER,
  getCustomerId: async (req: NextRequest) => {
    // Get the authenticated user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Portal access error: User not authenticated");
      return "";
    }

    // Look up the user's Polar customer ID from user_credits table
    // The polar_customer_id is stored when a subscription is created via webhook
    const { data: userCredits, error: creditsError } = await supabase
      .from("user_credits")
      .select("polar_customer_id")
      .eq("user_id", user.id)
      .not("polar_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (creditsError || !userCredits?.polar_customer_id) {
      // Fall back to using user ID as external ID
      // Polar will look up the customer by external ID
      console.log("No Polar customer ID found, using user ID as external ID");
      return user.id;
    }

    return userCredits.polar_customer_id;
  },
});
