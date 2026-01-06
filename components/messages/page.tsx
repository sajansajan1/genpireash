"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Send, Paperclip, MoreHorizontal, Phone, Video, ArrowLeft, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { useUser } from "./session";
import { supabase } from "@/lib/supabase/client";
import {
  fetchCreatorProfile,
  fetchChatId,
  fetchChats,
  fetchSupplierProfile,
  fetchMessage,
  getConversationId,
  insertMessage,
} from "@/lib/supabase/messages";
import { FormEvent, ChangeEvent, KeyboardEvent } from "react";
import { TypingIndicator } from "./typingIndicator";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Message, Participant, Conversation } from "@/lib/types/tech-packs";
import { uploadFileToSupabase } from "@/lib/supabase/file_upload";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { formatDate } from "@/lib/utils/formatdate";
import { sendNotification } from "@/lib/supabase/notifications";
import Loading from "./loading";
import { useUserStore } from "@/lib/zustand/useStore";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participantsData, setParticipantsData] = useState<{
    [key: string]: Participant;
  }>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [receiverId, setReceiverId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: string }>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChatParticipant, setCurrentChatParticipant] = useState<Participant | null>(null);
  const [mobileChat, setMobileChat] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const isMobile = useMobile();
  const channelRef = useRef<any>(null);
  const participantsDataRef = useRef(participantsData);
  const textareaRef = useRef<HTMLInputElement | null>(null);
  const isTypingRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = useUser();
  const searchParams = useSearchParams();
  const chatWith = searchParams.get("chatWith");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const senderID = user?.id || "";
  const receiverIdRef = useRef(receiverId);
  const [loading, setLoading] = useState<boolean>(true);
  const { creatorProfile, supplierProfile } = useUserStore();
  const [sendMessageLoader, setSendMessageLoader] = useState(false);

  useEffect(() => {
    participantsDataRef.current = participantsData;
    console.log(participantsData, "get the participant data");
  }, [participantsData]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setLoading(true);
    const init = async () => {
      try {
        const meta = user.user_metadata || {};
        const currentUser: Participant = {
          id: user.id,
          name: meta.full_name || "Me",
          avatar_url: meta.avatar_url || "",
        };
        if (isMounted) {
          setParticipantsData((prev) => ({ ...prev, [user.id]: currentUser }));
        }

        const grouped = await groupConversations(user.id);

        if (isMounted) {
          setConversations(grouped);
          if (grouped.length > 0 && !chatWith) {
            const firstUserId = grouped[0].participant.id;
            setReceiverId(firstUserId);
            await fetchMessages(user.id, firstUserId);
          }
        }
        const channel = await realTimeSubscription();
        if (isMounted) {
          channelRef.current = channel;
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false); // End loader
      }
    };

    init();

    return () => {
      isMounted = false;
      channelRef.current?.unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    const loadSenders = async () => {
      for (const msg of messages) {
        const senderId = msg.sender_id;
        if (!participantsData[senderId]) {
          const userProfile = await fetchUserProfile(senderId);
          if (userProfile) {
            setParticipantsData((prev) => ({
              ...prev,
              [senderId]: userProfile,
            }));
          }
        }
      }
    };

    if (messages.length) {
      loadSenders();
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (chatWith && typeof chatWith === "string") {
      startNewChat(chatWith);
    }
  }, [chatWith]);

  useEffect(() => {
    receiverIdRef.current = receiverId;
  }, [receiverId]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use your Supabase upload function
    const fileUrl = await uploadFileToSupabase(file);
    if (fileUrl) {
      setUploadedFileUrl(fileUrl);
    }
  };

  const fetchUserProfile = async (userId: string): Promise<Participant | null> => {
    try {
      const supplier = await fetchSupplierProfile(userId);
      if (supplier) {
        return {
          id: userId,
          name: supplier.company_name || "Supplier",
          avatar_url: supplier.company_logo || "",
        };
      }
      const creator = await fetchCreatorProfile(userId);

      if (creator) {
        return {
          id: userId,
          name: creator.full_name || "Creator",
          avatar_url: creator.avatar_url || "",
        };
      }

      return null;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return null;
    }
  };

  const groupConversations = async (userId: string): Promise<Conversation[]> => {
    const chats = await fetchChats();
    const conversations = await Promise.all(
      chats.map(async (chat) => {
        const otherParticipantId = chat.participant_1 === userId ? chat.participant_2 : chat.participant_1;
        console.log("otherParticipantId ==> ", otherParticipantId);

        const participant = await fetchUserProfile(otherParticipantId);
        if (!participant) {
          console.error(`Participant ${otherParticipantId} not found`);
          return null;
        }
        const lastMessage = await fetchChatId(chat.id);
        return {
          id: chat.id,
          chatId: chat.id,
          participant_1: chat.participant_1,
          participant_2: chat.participant_2,
          participant,
          lastMessage,
          createdAt: chat.created_at,
          updatedAt: lastMessage?.created_at || chat.created_at,
        };
      })
    );

    return conversations
      .filter((c): c is Conversation => c !== null)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  const fetchMessages = async (sender: string, receiver: string) => {
    try {
      const conversationId = await getConversationId(sender, receiver);
      const rawMessages = await fetchMessage(conversationId);
      if (!rawMessages) return;

      const participants: Record<string, Participant> = {};
      const enrichedMessages: Message[] = [];

      const otherParticipantId = sender === user?.id ? receiver : sender;

      const [senderProfile, otherParticipantProfile] = await Promise.all([
        fetchUserProfile(sender),
        fetchUserProfile(otherParticipantId),
      ]);

      if (senderProfile) participants[sender] = senderProfile;
      if (otherParticipantProfile) {
        participants[otherParticipantId] = otherParticipantProfile;
        setCurrentChatParticipant(otherParticipantProfile);
      }

      for (const msg of rawMessages) {
        const senderId = msg.sender_id;
        if (!participants[senderId]) {
          const profile = await fetchUserProfile(senderId);
          if (profile) participants[senderId] = profile;
        }
        enrichedMessages.push({
          ...msg,
          user: participants[senderId],
        });
      }

      setParticipantsData((prev) => ({ ...prev, ...participants }));
      setMessages(enrichedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleStartConverstaion = async (participant: any) => {
    console.log("fetching on click new converstaion ==> ", participant);
    console.log("fetching on click new converstaion ReceiverId from participant details==>", participant.id);
    console.log(
      "fetching on click new converstaion currenctchatparticipant from participant details==>",
      participant.id
    );
    console.log("fetching message with user id and participant id====>", user.id, participant.id);
    setReceiverId(participant.id);
    setCurrentChatParticipant(participant); // ADD THIS
    setMobileChat(true); // ADD THIS for mobile
    if (user) fetchMessages(user.id, participant.id);
  };
  const handleRealtimeInsert = async (payload: any) => {
    const newMessage = payload.new;
    const currentReceiverId = receiverIdRef.current;
    const currentConversationId = await getConversationId(senderID, currentReceiverId);
    const incomingConversationId = newMessage.chats;

    if (incomingConversationId === currentConversationId) {
      const senderProfile = await fetchUserProfile(newMessage.sender_id);
      setMessages((prev) => [...prev, { ...newMessage, user: senderProfile! }]);
    }
    const updatedConversations = await groupConversations(senderID);
    setConversations(updatedConversations);
    try {
      const data = await sendNotification(senderID, currentReceiverId, "New Message", newMessage.message, "message");
    } catch (error) {
      console.error("Notification failed:", error);
      toast({
        title: "RFQ sent, but notification failed",
        description: "The RFQ was sent, but the supplier was not notified.",
      });
      return;
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    const updated = payload.new;
    setMessages((prev) => prev.map((msg) => (msg.id === updated.id ? { ...msg, message: updated.message } : msg)));
  };

  const handleRealtimeDelete = (payload: any) => {
    const id = payload.old.id;
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const realTimeSubscription = async () => {
    if (!user?.id) return null;

    const channel = supabase.channel("messages", {
      config: { presence: { key: user.id } },
    });
    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload: any) => {
        switch (payload.eventType) {
          case "INSERT":
            handleRealtimeInsert(payload);
            break;
          case "UPDATE":
            handleRealtimeUpdate(payload);
            break;
          case "DELETE":
            handleRealtimeDelete(payload);
            break;
        }
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const typingStatus: Record<string, boolean> = {};
        const online: { [key: string]: string } = {};
        Object.entries(state).forEach(([key, presences]) => {
          if (key === user.id) return;
          presences.forEach((presence: any) => {
            if (presence?.name) {
              online[key] = presence.name;
            }
            // Only track typing status for the current chat participant
            if (presence.typingTo === user.id && key === receiverIdRef.current) {
              typingStatus[key] = presence.isTyping;
            }
          });
        });
        setOnlineUsers(online);
        setTypingUsers(typingStatus);
      });

    try {
      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            isTyping: false,
            name: user.user_metadata?.full_name || "Unknown",
          });
        }
      });
    } catch (err) {
      console.error("Subscription error:", err);
    }
    return channel;
  };

  const trackTyping = async (status: boolean) => {
    if (!user) return;

    const profile = await fetchUserProfile(user.id);
    const nameFromProfile = profile?.name || "Unknown";

    await channelRef.current?.track({
      isTyping: status,
      name: nameFromProfile,
      typingTo: receiverId,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSendMessageLoader(true);
    const text = message.trim();
    if (!text && !uploadedFileUrl) return; // Don't send empty messages

    const conversationId = await getConversationId(senderID, receiverId);

    if (text) {
      await insertMessage(text, senderID, conversationId);
    }

    if (uploadedFileUrl) {
      await insertMessage(uploadedFileUrl, senderID, conversationId);
    }
    setMessage("");
    setUploadedFileUrl(null);
    setSendMessageLoader(false);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMessage(value);

    if (!isTypingRef.current) {
      await trackTyping(true);
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      if (!isTypingRef.current) return;
      await trackTyping(false);
      isTypingRef.current = false;
    }, 2000);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startNewChat = async (newUserId: string) => {
    setReceiverId(newUserId);
    setMessages([]);
    setTypingUsers({});
    const profile = await fetchUserProfile(newUserId);
    if (profile) {
      setCurrentChatParticipant(profile);
      setParticipantsData((prev) => ({ ...prev, [newUserId]: profile }));
    }

    await fetchMessages(senderID, newUserId);
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <div className="min-h-screen animate-fade-in px-4 md:px-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-[#1C1917] mt-1">Communicate with your suppliers in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* LEFT COLUMN – SUPPLIER LIST */}
        {!chatWith && (
          <div className={`md:col-span-1 ${mobileChat ? "hidden" : "block"} md:block`}>
            <Card className="h-[80vh] flex flex-col">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Conversations</CardTitle>
                </div>

                {/* TABS */}
                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* SEARCH */}
                <div className="relative mt-3">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#1C1917]" />
                  <Input
                    placeholder="Search suppliers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>

              {/* CONVERSATIONS LIST */}
              <div className="overflow-y-auto flex-1 px-2">
                {conversations?.length > 0 ? (
                  conversations?.map((convo) => {
                    const participant = convo?.participant;
                    return (
                      <div
                        key={convo.chatId}
                        className="p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors rounded-md"
                        onClick={() => handleStartConverstaion(participant)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={participant?.avatar_url} />
                              <AvatarFallback>{participant?.name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                                onlineUsers[participant.id] && user?.id !== participant.id
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            />
                          </div>

                          {/* Name + last message */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium truncate">{participant?.name}</h3>
                              <span className="text-xs text-[#1C1917] ml-2 whitespace-nowrap">
                                {convo?.lastMessage ? formatDate(convo?.lastMessage?.created_at) : "N/A"}
                              </span>
                            </div>

                            <p className="text-sm text-[#1C1917] truncate">
                              {convo.lastMessage
                                ? (() => {
                                    const message = convo?.lastMessage?.message;
                                    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|avif)$/i;
                                    const isFile = /\.(pdf|docx|txt|zip|rar)$/i;

                                    if (isImage.test(message)) return "Image";
                                    if (isFile.test(message)) return "File";
                                    return message;
                                  })()
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-[#1C1917]">No conversations found</div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* RIGHT COLUMN – CHAT WINDOW */}
        <div className="md:col-span-2">
          {(!isMobile || mobileChat) && (
            <Card className="h-[80vh] flex flex-col">
              {currentChatParticipant ? (
                <>
                  {/* HEADER */}
                  <CardHeader className="p-4 border-b flex items-center justify-between flex-row">
                    {/* LEFT SECTION */}
                    {/* BACK BUTTON */}
                    <div className="block sm:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2"
                        onClick={() => {
                          setCurrentChatParticipant(null);
                          setMobileChat(false);
                        }}
                      >
                        <ArrowLeft className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="flex  gap-3 flex-1">
                      <Avatar>
                        <AvatarImage src={currentChatParticipant?.avatar_url} />
                        <AvatarFallback>{currentChatParticipant?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-medium">{currentChatParticipant?.name}</h3>
                        <div className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              onlineUsers[currentChatParticipant.id] && user?.id !== currentChatParticipant.id
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs text-[#1C1917]">
                            {onlineUsers[currentChatParticipant?.id] && user?.id !== currentChatParticipant.id
                              ? "Online"
                              : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SECTION (Justified End) */}
                    <Button variant="ghost" size="icon" className="ml-auto">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </CardHeader>

                  {/* MESSAGES LIST */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isCurrentUser = message?.sender_id === user?.id;
                      const sender = participantsData[message?.sender_id];

                      return (
                        <div
                          key={message.id}
                          className={`flex items-start gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          {!isCurrentUser && (
                            <Avatar>
                              <AvatarImage src={sender?.avatar_url} />
                              <AvatarFallback>{sender?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          )}

                          <div>
                            <div
                              className={`rounded-lg p-3 max-w-[80vw] md:max-w-md ${
                                isCurrentUser ? "bg-primary text-white" : "bg-muted text-[#1C1917]"
                              }`}
                            >
                              {/\.(jpeg|jpg|gif|png|avif)$/i.test(message?.message) ? (
                                <img src={message?.message} className="max-w-full max-h-60 rounded" />
                              ) : /\.(pdf|docx|pptx|xlsx)$/i.test(message?.message) ? (
                                <a
                                  href={message?.message}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                >
                                  View File
                                </a>
                              ) : (
                                <p className="text-sm">{message?.message}</p>
                              )}
                            </div>

                            <p className="text-xs text-[#1C1917] mt-1">
                              {new Date(message?.created_at).toLocaleTimeString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {typingUsers[receiverId] && (
                      <TypingIndicator
                        typingUsers={typingUsers}
                        participantsData={participantsData}
                        currentReceiverId={receiverId}
                      />
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* MESSAGE INPUT */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hidden sm:flex"
                        disabled={sendMessageLoader}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={sendMessageLoader}
                      />

                      <Input
                        ref={textareaRef}
                        onKeyDown={handleKeyDown}
                        value={message}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={sendMessageLoader}
                      />

                      <Button type="submit" size="icon" disabled={sendMessageLoader}>
                        {sendMessageLoader ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p className="text-[#1C1917]">Choose a supplier to start chatting</p>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
