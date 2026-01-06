"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendNotification(
  senderID: string,
  receiverID: string,
  title: string,
  message: string,
  type: string
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError?.message);
    return null;
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        senderId: senderID,
        receiverId: receiverID,
        created_at: new Date().toISOString(),
        title,
        message,
        read: false,
        type: type,
      },
    ])
    .select()
    .single();
  if (error) {
    console.error("Insert error for notification:", error.message);
    return null;
  }

  return data;
}

export async function fetchNotification() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Auth error:", userError?.message);
    return null;
  }
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("receiverId", user.id)
    .order("created_at", { ascending: false });
  if (!data) {
    console.error("Error fetching notifications:", data);
  }
  if (error) {
    console.error("Insert error:", error.message);
    return null;
  }
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId);

  if (error) {
    console.error("Error updating notification:", error.message);
    return null;
  }

  return data;
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError?.message);
    return null;
  }
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("receiverId", user.id)
    .eq("read", false); // Only update unread ones

  if (error) {
    console.error("Error marking all notifications as read:", error.message);
    return null;
  }

  return data;
}
