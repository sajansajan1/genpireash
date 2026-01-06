"use server";

import { createClient } from "@/lib/supabase/server";
import { creatorProfile } from "../types/tech-packs";
import { supabase } from "./client";
import { v4 as uuidv4 } from "uuid";

export async function checkReferralApproval({ email, userId }: { email: string; userId: string }) {
  const supabase = await createClient();

  const { data: referredUser, error } = await supabase
    .from("friends")
    .select("*")
    .eq("email", email)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    console.error("Error checking referral approval:", error);
    return null;
  }

  if (referredUser) {
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        isAmbassador: true,
        referralCode: uuidv4().slice(0, 8),
      })
      .eq("id", userId)
      .select("id")
      .single();

    if (updateError || !updatedUser) {
      console.error("Error updating user ambassador info:", updateError);
      throw updateError;
    }
    const expires_at = new Date();
    expires_at.setFullYear(expires_at.getFullYear() + 1);
    const data = await supabase.from("user_credits").upsert([
      {
        user_id: userId,
        credits: 150,
        status: "active",
        plan_type: "yearly",
        membership: "pro",
        expires_at: expires_at.toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);
    console.log("User updated to ambassador:", updatedUser);
  }

  return referredUser;
}

export async function checkAndCreateReferralUser({
  offers,
  referredBy,
  userId,
}: {
  offers?: boolean;
  referredBy?: string;
  userId: string;
}) {
  const supabase = await createClient();

  try {
    // Checking referredBy code exists
    const { data: referredUser, error: referredUserError } = await supabase
      .from("users")
      .select("id, referralCode")
      .eq("referralCode", referredBy)
      .single();

    if (referredUserError && referredUserError.code !== "PGRST116") {
      console.error("Error checking referral code:", referredUserError);
      throw referredUserError;
    }

    if (!referredUser) {
      console.log("Referral code not found or invalid:", referredBy);
      return { success: false, message: "Invalid referral code" };
    }

    console.log("Referral match found:", referredUser);

    // Update the current user with the referral info
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        referredBy: referredUser.id,
        offers: offers ?? true,
      })
      .eq("id", userId)
      .select("id, referredBy")
      .single();

    if (updateError || !updatedUser) {
      console.error("Error updating user referral info:", updateError);
      throw updateError;
    }

    console.log("Referral info updated for user:", updatedUser.id);

    return {
      success: true,
      message: "Referral successfully applied",
      referredByUser: referredUser,
      updatedUser,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, message: "An error occurred", error: err };
  }
}

export async function createCreatorProfile({
  full_name,
  avatar_url,
  country,
  categories,
  address,
  contact,
  email,
  designation,
  team_size,
  offers,
  referredBy,
}: creatorProfile) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }
  if (!email) {
    console.error("Email is required to check referral approval");
    return null;
  }

  const approvedReferral = await checkReferralApproval({
    email,
    userId: user.id,
  });

  console.log(approvedReferral, "approval refferal");

  if (referredBy) {
    const referralUser = await checkAndCreateReferralUser({
      offers,
      referredBy,
      userId: user.id,
    });
    console.log("referralUser ==> ", referralUser);
  } else {
    console.log("No referral code provided, skipping referral check.");
  }

  const { data, error } = await supabase
    .from("creator_profile")
    .insert({
      user_id: user.id,
      full_name,
      avatar_url,
      country,
      categories,
      address,
      contact,
      email,
      role: "creator",
      designation,
      team_size,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Insert error:", error);
    return null;
  }

  await supabase.from("user_credits").upsert([
    {
      user_id: user.id,
      credits: 5,
      status: "active",
      plan_type: "one_time",
      membership: "add_on",
      created_at: new Date().toISOString(),
    },
  ]);
  return data;
}

export const checkCreatorProfileExists = async (userId: string): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("creator_profile").select("id").eq("user_id", userId).single();

    console.log("Checking creator profile for user:", userId, "Result:", data, error);

    // If data exists and has an id, profile exists
    if (data && data.id) {
      return true;
    }

    // If error is "PGRST116" (no rows), profile doesn't exist
    if (error && error.code === "PGRST116") {
      return false;
    }

    // For other errors, log and return false
    if (error) {
      console.error("Database error checking profile:", error);
      return false;
    }

    return false;
  } catch (error) {
    console.error("Error checking creator profile:", error);
    return false;
  }
};

export default async function createPersonalisedCreatorProfile({
  persona,
  goal,
  experience,
  categories,
  avatar_url,
}: {
  persona: string;
  goal: string;
  experience: string;
  categories: string;
  avatar_url: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return { success: false, error: "Authentication failed" };
  }

  // Update the creator_profile with onboarding data
  const { data, error } = await supabase
    .from("creator_profile")
    .update({
      categories,
      persona,
      goal,
      experience,
      avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    console.error("Insert error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
