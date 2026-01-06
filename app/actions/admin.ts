"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveManufacturer(id: string) {
  try {
    const supabase = createClient()

    // Get the current user's email
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw new Error(`Failed to get current user: ${userError.message}`)
    }

    // Update the manufacturer status
    const { error } = await supabase
      .from("manufacturer_applications")
      .update({
        status: "approved",
        reviewed_by: user?.email || "admin",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      throw new Error(`Failed to approve manufacturer: ${error.message}`)
    }

    revalidatePath("/admin/manufacturers")

    return { success: true }
  } catch (error) {
    console.error("Error approving manufacturer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function rejectManufacturer(id: string, reason: string) {
  try {
    const supabase = createClient()

    // Get the current user's email
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      throw new Error(`Failed to get current user: ${userError.message}`)
    }

    // Update the manufacturer status
    const { error } = await supabase
      .from("manufacturer_applications")
      .update({
        status: "rejected",
        reviewed_by: user?.email || "admin",
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq("id", id)

    if (error) {
      throw new Error(`Failed to reject manufacturer: ${error.message}`)
    }

    revalidatePath("/admin/manufacturers")

    return { success: true }
  } catch (error) {
    console.error("Error rejecting manufacturer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
