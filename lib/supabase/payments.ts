"use server";

import { createClient } from "@/lib/supabase/server";
import { Payments } from "../types/tech-packs";

export async function createPayment({
  user_id,
  quantity,
  price,
  payment_status,
  payer_id,
  payer_name,
  payer_address,
  payer_email,
  currency,
}: Payments) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id,
      quantity,
      price,
      payment_status,
      payer_id,
      payer_name,
      payer_address,
      payer_email,
      currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("Insert error:", error);
    return null;
  }

  return data;
}

// Check if user has enough credits without deducting
export async function checkUserCredits(
  requiredCredits: number
): Promise<{ hasCredits: boolean; currentCredits: number; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error in checkUserCredits:", userError);
    return {
      hasCredits: false,
      currentCredits: 0,
      message: "User not authenticated",
    };
  }

  console.log("Checking credits for user:", user.id);

  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id, credits")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching user:", fetchError);
    return {
      hasCredits: false,
      currentCredits: 0,
      message: "Error fetching user data",
    };
  }

  if (!existingUser) {
    console.error("User record not found in database");
    return {
      hasCredits: false,
      currentCredits: 0,
      message: "User record not found",
    };
  }

  // Handle various credit formats (string, number, or null/undefined)
  let currentCredits: number;

  if (existingUser.credits === null || existingUser.credits === undefined) {
    currentCredits = 0;
  } else if (typeof existingUser.credits === "number") {
    currentCredits = Math.floor(existingUser.credits);
  } else if (typeof existingUser.credits === "string") {
    // Remove any non-numeric characters except decimal point
    const cleanedCredits = existingUser.credits.replace(/[^\d.]/g, "");
    // Try to parse as number
    const parsed = parseFloat(cleanedCredits);
    currentCredits = isNaN(parsed) ? 0 : Math.floor(parsed);
  } else {
    console.warn("Unexpected credits type:", typeof existingUser.credits, existingUser.credits);
    currentCredits = 0;
  }

  // Debug logging
  console.log("Credit check:", {
    raw: existingUser.credits,
    parsed: currentCredits,
    required: requiredCredits,
    type: typeof existingUser.credits,
  });

  const hasCredits = currentCredits >= requiredCredits;

  if (!hasCredits) {
    return {
      hasCredits: false,
      currentCredits,
      message: `Insufficient credits. You have ${currentCredits} credits but need ${requiredCredits}.`,
    };
  }

  return { hasCredits: true, currentCredits };
}

export async function CreateCredits({ user_id, credits }: { user_id: string; credits: number }) {
  const supabase = await createClient();
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id, credits")
    .eq("id", user_id)
    .single();
  if (fetchError) {
    console.error("Error fetching user:", fetchError);
    return null;
  }

  // Handle various credit formats
  let currentCredits: number;
  if (typeof existingUser.credits === "number") {
    currentCredits = existingUser.credits;
  } else if (typeof existingUser.credits === "string") {
    currentCredits = parseInt(existingUser.credits, 10);
    if (isNaN(currentCredits)) {
      currentCredits = Math.floor(parseFloat(existingUser.credits) || 0);
    }
  } else {
    currentCredits = 0;
  }

  const newCredits = currentCredits + credits;

  const { data: updatedData, error: updateError } = await supabase
    .from("users")
    .update({
      credits: newCredits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user_id)
    .select("id")
    .single();

  if (updateError) {
    console.error("Error updating credits:", updateError);
    return null;
  }

  return updatedData;
}
export async function DeductOneCredit({ user_id: _user_id }: { user_id: string }) {
  // Simply use DeductCredits with credit amount of 1
  return await DeductCredits({ credit: 1 });
}

export async function DeductThreeCredit({ user_id: _user_id }: { user_id: string }) {
  // Simply use DeductCredits with credit amount of 3
  return await DeductCredits({ credit: 3 });
}

export async function getPayments(user_id: string) {
  const supabase = await createClient();
  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching payments:", error);
    return null;
  }
  return payments;
}

// export async function DeductCredits({ credit }: { credit: number }) {
//   const supabase = await createClient();

//   // First check if user has enough credits
//   const creditCheck = await checkUserCredits(credit);
//   if (!creditCheck.hasCredits) {
//     console.warn(creditCheck.message);
//     return null;
//   }

//   // Get current user for the update
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     console.error("Auth error:", userError);
//     return null;
//   }

//   const newCredits = creditCheck.currentCredits - credit;
//   const { data: updatedData, error: updateError } = await supabase
//     .from("users")
//     .update({
//       credits: newCredits,
//       updated_at: new Date().toISOString(),
//     })
//     .eq("id", user.id)
//     .select("id")
//     .single();

//   if (updateError) {
//     console.error("Error deducting credit:", updateError);
//     return null;
//   }

//   return updatedData;
// }

// // Reserve credits for a transaction - deduct immediately but can refund if operation fails
// export async function ReserveCredits({ credit }: { credit: number }): Promise<{
//   success: boolean;
//   reservationId?: string;
//   currentCredits?: number;
//   message?: string;
// }> {
//   const supabase = await createClient();

//   // First check if user has enough credits
//   const creditCheck = await checkUserCredits(credit);
//   if (!creditCheck.hasCredits) {
//     return {
//       success: false,
//       currentCredits: creditCheck.currentCredits,
//       message: creditCheck.message,
//     };
//   }

//   // Get current user for the update
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     return {
//       success: false,
//       message: "User not authenticated",
//     };
//   }

//   // Deduct credits immediately (reservation)
//   const newCredits = creditCheck.currentCredits - credit;
//   const { data: updatedData, error: updateError } = await supabase
//     .from("users")
//     .update({
//       credits: newCredits,
//       updated_at: new Date().toISOString(),
//     })
//     .eq("id", user.id)
//     .select("id")
//     .single();

//   if (updateError) {
//     console.error("Error reserving credits:", updateError);
//     return {
//       success: false,
//       message: "Failed to reserve credits",
//     };
//   }

//   // Create a reservation ID for potential refund
//   const reservationId = `res_${Date.now()}_${user.id}`;

//   return {
//     success: true,
//     reservationId,
//     currentCredits: newCredits,
//   };
// }

// // Refund reserved credits if operation fails
// export async function RefundCredits({
//   credit,
//   reservationId
// }: {
//   credit: number;
//   reservationId: string;
// }): Promise<boolean> {
//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     console.error("Auth error during refund:", userError);
//     return false;
//   }

//   // Get current credits
//   const { data: existingUser, error: fetchError } = await supabase
//     .from("users")
//     .select("id, credits")
//     .eq("id", user.id)
//     .single();

//   if (fetchError) {
//     console.error("Error fetching user for refund:", fetchError);
//     return false;
//   }

//   // Handle various credit formats
//   let currentCredits: number;
//   if (typeof existingUser.credits === 'number') {
//     currentCredits = existingUser.credits;
//   } else if (typeof existingUser.credits === 'string') {
//     currentCredits = parseInt(existingUser.credits, 10);
//     if (isNaN(currentCredits)) {
//       currentCredits = Math.floor(parseFloat(existingUser.credits) || 0);
//     }
//   } else {
//     currentCredits = 0;
//   }

//   const refundedCredits = currentCredits + credit;

//   // Refund the credits
//   const { error: updateError } = await supabase
//     .from("users")
//     .update({
//       credits: refundedCredits,
//       updated_at: new Date().toISOString(),
//     })
//     .eq("id", user.id);

//   if (updateError) {
//     console.error("Error refunding credits:", updateError);
//     return false;
//   }

//   console.log(`Refunded ${credit} credits for reservation ${reservationId}`);
//   return true;
// }

// export async function DeductCredits({ credit }: { credit: number }) {
//   const supabase = await createClient();

//   // 🔐 Get current authenticated user
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     console.error("Auth error:", userError);
//     return null;
//   }

//   // 🧾 Fetch the most recent subscription with credits
//   const { data: currentSub, error: currentSubError } = await supabase
//     .from("user_credits")
//     .select("id, credits")
//     .eq("user_id", user.id)
//     .order("created_at", { ascending: false })
//     .limit(1)
//     .single();

//   if (currentSubError || !currentSub) {
//     console.error("Error fetching current credits:", currentSubError);
//     return null;
//   }

//   // ❌ Check if enough credits
//   if (currentSub.credits < credit) {
//     console.warn("Not enough credits to deduct.");
//     return null;
//   }

//   const newCredits = currentSub.credits - credit;

//   // ✏️ Update the credits in the latest record
//   const { data: updatedRecord, error: updateError } = await supabase
//     .from("user_credits")
//     .update({
//       credits: newCredits,
//       updated_at: new Date().toISOString(),
//     })
//     .eq("id", currentSub.id)
//     .select("id, credits")
//     .single();

//   if (updateError) {
//     console.error("Failed to deduct credits:", updateError);
//     return null;
//   }

//   return updatedRecord;
// }

// Reserve credits for a transaction - deduct immediately but can refund if operation fails
// export async function ReserveCredits({ credit }: { credit: number }): Promise<{
//   success: boolean;
//   reservationId?: string;
//   currentCredits?: number;
//   message?: string;
// }> {
//   const supabase = await createClient();

//   // Get current user
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     return {
//       success: false,
//       message: "User not authenticated",
//     };
//   }

//   // Fetch latest user_credits record
//   const { data: currentSub, error: currentSubError } = await supabase
//     .from("user_credits")
//     .select("id, credits")
//     .eq("user_id", user.id)
//     .order("created_at", { ascending: false })
//     .limit(1)
//     .single();

//   if (currentSubError || !currentSub) {
//     return {
//       success: false,
//       message: "Could not retrieve user credits.",
//     };
//   }

//   // Check if user has enough credits
//   if (currentSub.credits < credit) {
//     return {
//       success: false,
//       currentCredits: currentSub.credits,
//       message: "Not enough credits.",
//     };
//   }

//   const newCredits = currentSub.credits - credit;

//   // Update credits immediately
//   const { data: updatedData, error: updateError } = await supabase
//     .from("user_credits")
//     .update({
//       credits: newCredits,
//       updated_at: new Date().toISOString(),
//     })
//     .eq("id", currentSub.id)
//     .select("id, credits")
//     .single();

//   if (updateError) {
//     console.error("Error reserving credits:", updateError);
//     return {
//       success: false,
//       message: "Failed to reserve credits",
//     };
//   }

//   // Generate a reservation ID for tracking
//   const reservationId = `res_${Date.now()}_${user.id}`;

//   return {
//     success: true,
//     reservationId,
//     currentCredits: newCredits,
//   };
// }

// export async function RefundCredits({
//   credit,
//   reservationId,
// }: {
//   credit: number;
//   reservationId: string;
// }): Promise<boolean> {
//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) {
//     console.error("Auth error during refund:", userError);
//     return false;
//   }

//   // Get most recent credits entry
//   const { data: currentSub, error: fetchError } = await supabase
//     .from("user_credits")
//     .select("id, credits")
//     .eq("user_id", user.id)
//     .order("created_at", { ascending: false })
//     .limit(1)
//     .single();

//   if (fetchError || !currentSub) {
//     console.error("Error fetching user credits for refund:", fetchError);
//     return false;
//   }

//   const refundedCredits = currentSub.credits + credit;

//   // Apply the refund
//   const { error: updateError } = await supabase
//     .from("user_credits")
//     .update({
//       credits: refundedCredits,
//       updated_at: new Date().toISOString(),
//     })
//     .eq("id", currentSub.id);

//   if (updateError) {
//     console.error("Error refunding credits:", updateError);
//     return false;
//   }

//   console.log(`Refunded ${credit} credits for reservation ${reservationId}`);
//   return true;
// }

export async function DeductCredits({ credit }: { credit: number }) {
  const supabase = await createClient();

  // 🔐 Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return { success: false, message: "User not authenticated" };
  }

  // 🧾 Fetch all active credit sources (subscription + top-ups)
  const { data: creditRecords, error: fetchError } = await supabase
    .from("user_credits")
    .select("id, credits, plan_type, status, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("plan_type", { ascending: true }) // subscription before top-up
    .order("created_at", { ascending: true });

  if (fetchError) {
    console.error("Error fetching credits:", fetchError);
    return { success: false, message: "Failed to fetch credits" };
  }

  if (!creditRecords || creditRecords.length === 0) {
    return { success: false, message: "No active credits found" };
  }

  // Calculate total available credits
  const totalAvailable = creditRecords.reduce((sum, r) => sum + r.credits, 0);

  if (totalAvailable < credit) {
    console.warn("Not enough credits to deduct.");
    return { success: false, message: "Insufficient credits" };
  }

  // 📦 Deduction logic: prioritize subscription → top-up
  let remainingToDeduct = credit;
  const updatedRecords: { id: string; newCredits: number }[] = [];

  for (const record of creditRecords) {
    if (remainingToDeduct <= 0) break;

    // deduct from this record
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
      console.error(`Failed to update credits for record ${id}:`, updateError);
      return { success: false, message: "Error updating credit balances" };
    }

    // Optional: auto-expire one-time plans that hit 0
    if (newCredits === 0) {
      await supabase.from("user_credits").update({ status: "expired" }).eq("id", id).eq("plan_type", "one_time");
    }
  }

  return { success: true, message: "Credits deducted successfully" };
}

export async function ReserveCredits({ credit }: { credit: number }): Promise<{
  success: boolean;
  reservationId?: string;
  reservedFrom?: { id: string; deducted: number }[];
  currentCredits?: number;
  message?: string;
}> {
  const supabase = await createClient();

  // 🔐 Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: "User not authenticated" };
  }

  // 🧾 Fetch all active credit sources (subscription + top-ups)
  const { data: creditRecords, error: fetchError } = await supabase
    .from("user_credits")
    .select("id, credits, plan_type, status, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("plan_type", { ascending: true }) // subscription before one_time
    .order("created_at", { ascending: true }); // oldest first

  if (fetchError || !creditRecords || creditRecords.length === 0) {
    return { success: false, message: "No active credits found" };
  }

  // Total available
  const totalAvailable = creditRecords.reduce((sum, r) => sum + r.credits, 0);
  if (totalAvailable < credit) {
    return { success: false, message: "Not enough credits.", currentCredits: totalAvailable };
  }

  // Deduct credits from prioritized sources
  let remainingToReserve = credit;
  const updatedRecords: { id: string; newCredits: number; deducted: number }[] = [];

  for (const record of creditRecords) {
    if (remainingToReserve <= 0) break;

    const deductAmount = Math.min(record.credits, remainingToReserve);
    const newCredits = record.credits - deductAmount;
    updatedRecords.push({ id: record.id, newCredits, deducted: deductAmount });
    remainingToReserve -= deductAmount;
  }

  // Apply updates
  for (const { id, newCredits } of updatedRecords) {
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      console.error(`Error updating credits for record ${id}:`, updateError);
      return { success: false, message: "Failed to reserve credits" };
    }
  }

  const reservationId = `res_${Date.now()}_${user.id}`;

  return {
    success: true,
    reservationId,
    reservedFrom: updatedRecords.map((r) => ({ id: r.id, deducted: r.deducted })),
    currentCredits: totalAvailable - credit,
  };
}

export async function RefundCredits({
  credit,
  reservationId,
}: {
  credit: number;
  reservationId: string;
}): Promise<boolean> {
  const supabase = await createClient();

  // 🔐 Authenticate user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error during refund:", userError);
    return false;
  }

  // 🧾 Fetch all active credit records
  const { data: creditRecords, error: fetchError } = await supabase
    .from("user_credits")
    .select("id, credits, plan_type, status, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("plan_type", { ascending: true }) // subscription before one_time
    .order("created_at", { ascending: true }); // oldest first

  if (fetchError || !creditRecords || creditRecords.length === 0) {
    console.error("Error fetching active credits for refund:", fetchError);
    return false;
  }

  // Determine how to refund (reverse priority: top-up => subscription)
  // We want to put credits back starting with the newest record
  const sortedRecords = [...creditRecords].reverse();

  let remainingToRefund = credit;

  for (const record of sortedRecords) {
    if (remainingToRefund <= 0) break;

    // Add as much as possible to this record
    const refundAmount = Math.min(remainingToRefund, credit);
    const newCredits = record.credits + refundAmount;

    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    if (updateError) {
      console.error(`Error refunding credits to record ${record.id}:`, updateError);
      return false;
    }

    remainingToRefund -= refundAmount;
  }
  console.log(`Refunded ${credit} credits for reservation ${reservationId}`);
  console.log(`✅ Refunded ${credit} credits successfully for user ${user.id}`);
  return true;
}
