"use server";
import { createClient } from "./server";

const fetchSupplierProfile = async (userId: string) => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }
  const { data: supplier, error: supplierError } = await supabase
    .from("supplier_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (supplierError || !supplier) {
    console.error("Error fetching supplier profile:", supplierError);
    return null;
  }

  let manufacturing = null;
  if (supplier.manufacturingID) {
    const { data: manufacturingData, error: manufacturingError } = await supabase
      .from("manufacturing_capabilities")
      .select("*")
      .eq("id", supplier.manufacturingID)
      .single();
    if (manufacturingError) {
      console.error("Error fetching manufacturing details:", manufacturingError);
    } else {
      manufacturing = manufacturingData;
    }
  }

  return {
    ...supplier,
    manufacturing,
  };
};

const fetchCreatorProfile = async (userId: string) => {
  const supabase = await createClient();
  const { data: creator } = await supabase.from("creator_profile").select("*").eq("user_id", userId).maybeSingle();
  return creator;
};

const fetchMessage = async (conversationId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, created_at, sender_id, message")
    .eq("chats", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error.message);
    return [];
  }

  return data;
};

const insertMessage = async (messageText: string, senderId: string, conversationId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const { data, error } = await supabase.from("messages").insert([
    {
      message: messageText,
      sender_id: senderId,
      chats: conversationId,
    },
  ]);

  if (error) {
    console.error("Error inserting message:", error.message);
    return null;
  }

  return data;
};

const insertConversation = async (senderId: string, receiverId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  try {
    if (!senderId || !receiverId || senderId === receiverId) {
      throw new Error("Invalid participant IDs");
    }
    const { data, error, status } = await supabase
      .from("chats")
      .insert([
        {
          participant_1: senderId,
          participant_2: receiverId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }

    if (data?.participant_1 !== senderId || data?.participant_2 !== receiverId) {
      console.error("Parameter mismatch in inserted data!", {
        expected: { senderId, receiverId },
        actual: data,
      });
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error in insertConversation:", err);
    return null;
  }
};

const getConversationId = async (senderId: string, receiverId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const [lockedSenderId, lockedReceiverId] = [String(senderId), String(receiverId)];
  if (lockedSenderId === lockedReceiverId) {
    console.error("Validation failed: Identical user IDs");
    return "";
  }

  if (!lockedSenderId || !lockedReceiverId) {
    console.error("Validation failed: Invalid user IDs");
    return "";
  }
  const { data: existingConvo, error: queryError } = await supabase
    .from("chats")
    .select("id, participant_1, participant_2")
    .or(
      `and(participant_1.eq.${lockedSenderId},participant_2.eq.${lockedReceiverId}),and(participant_1.eq.${lockedReceiverId},participant_2.eq.${lockedSenderId})`
    )
    .maybeSingle();

  if (queryError) {
    console.error("Query error:", {
      message: queryError.message,
      code: queryError.code,
      details: queryError.details,
    });
    return "";
  }

  if (existingConvo) {
    return existingConvo.id;
  }
  const newConvo = await insertConversation(lockedSenderId, lockedReceiverId);

  if (!newConvo) {
    console.error("Failed to create conversation - check server logs");
    return "";
  }

  return newConvo.id;
};

const fetchChats = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }
  const { data, error } = await supabase
    .from("chats")
    .select("id, created_at, participant_1, participant_2")
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error.message);
    return [];
  }

  return data;
};

const fetchChatId = async (chatID: string) => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chats", chatID)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching chats:", error.message);
    return [];
  }

  return data;
};
export {
  insertMessage,
  fetchMessage,
  getConversationId,
  fetchSupplierProfile,
  fetchCreatorProfile,
  fetchChats,
  fetchChatId,
};
