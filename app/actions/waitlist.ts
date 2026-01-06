"use server"

import { createClient } from "@/lib/supabase/server"

export async function addToWaitlist(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const supabase = createClient()

    // Insert the email into the waitlist_emails table
    // Note: We're not using 'joined_at' column since it doesn't exist
    const { error } = await supabase.from("waitlist_emails").insert({
      email,
      // Let Supabase handle the timestamp with its built-in created_at column
    })

    if (error) throw error

    // Generate a random position between 100-500
    const position = Math.floor(Math.random() * 400) + 100

    return { success: true, position }
  } catch (error) {
    console.error("Error adding to waitlist:", error)
    return { error: "Failed to join waitlist. Please try again." }
  }
}
