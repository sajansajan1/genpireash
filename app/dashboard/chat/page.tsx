"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, MoreHorizontal, Phone, Video } from "lucide-react";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function ChatPage() {
  const [selectedSupplier, setSelectedSupplier] = useState("supplier1");
  const [messageText, setMessageText] = useState("");

  // Sample suppliers data
  const suppliers = [
    {
      id: "supplier1",
      name: "EcoFabric Manufacturing",
      location: "Vietnam",
      avatar: "/placeholder.svg?height=40&width=40&text=EF",
      status: "online",
      lastMessage: "We can adjust the materials as requested.",
      time: "10:32 AM",
      unread: 2,
    },
    {
      id: "supplier2",
      name: "GreenStep Productions",
      location: "Portugal",
      avatar: "/placeholder.svg?height=40&width=40&text=GP",
      status: "offline",
      lastMessage: "The samples will be shipped by Friday.",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: "supplier3",
      name: "Sustainable Soles Inc.",
      location: "Mexico",
      avatar: "/placeholder.svg?height=40&width=40&text=SS",
      status: "online",
      lastMessage: "Here's the updated quote for your review.",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: "supplier4",
      name: "EcoStep Manufacturers",
      location: "Indonesia",
      avatar: "/placeholder.svg?height=40&width=40&text=EM",
      status: "offline",
      lastMessage: "We need more details about the packaging.",
      time: "Mar 25",
      unread: 0,
    },
  ];

  // Sample messages for the selected supplier
  const messages = [
    {
      id: "1",
      sender: "me",
      text: "Hi, I'm interested in getting a quote for the eco-friendly sneakers we discussed.",
      time: "10:15 AM",
    },
    {
      id: "2",
      sender: "supplier",
      text: "Hello! I'd be happy to provide a quote. Could you share the specifications?",
      time: "10:18 AM",
    },
    {
      id: "3",
      sender: "me",
      text: "Sure, I've attached the spec sheet. I'm particularly interested in using recycled PET for the upper material.",
      time: "10:22 AM",
    },
    {
      id: "4",
      sender: "supplier",
      text: "Thanks for the specs. We can definitely use recycled PET. Would you like us to use our standard eco-friendly rubber for the sole?",
      time: "10:25 AM",
    },
    {
      id: "5",
      sender: "me",
      text: "Yes, that would be perfect. Also, can we use organic cotton for the lining?",
      time: "10:28 AM",
    },
    {
      id: "6",
      sender: "supplier",
      text: "We can adjust the materials as requested. I'll prepare a quote based on these specifications and send it over shortly.",
      time: "10:32 AM",
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      // In a real app, you would send this message to your backend
      setMessageText("");
    }
  };

  const selectedSupplierData = suppliers.find((s) => s.id === selectedSupplier);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight `}>Supplier Chat</h1>
          <p className="text-[#1C1917] mt-1">Communicate with your suppliers in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Suppliers List */}
        <div className="md:col-span-1">
          <Card className="h-[calc(80vh-120px)]">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className={volkhov.className}>Conversations</CardTitle>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#1C1917]" />
                <Input placeholder="Search suppliers..." className="pl-8" />
              </div>
            </CardHeader>
            <div className="overflow-y-auto h-[calc(80vh-230px)]">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedSupplier === supplier.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedSupplier(supplier.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={supplier.avatar} alt={supplier.name} />
                        <AvatarFallback>{supplier.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                          supplier.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">{supplier.name}</h3>
                        <span className="text-xs text-[#1C1917] whitespace-nowrap ml-2">{supplier.time}</span>
                      </div>
                      <p className="text-sm text-[#1C1917] truncate">{supplier.lastMessage}</p>
                    </div>
                    {supplier.unread > 0 && <Badge className="ml-2 bg-primary">{supplier.unread}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2">
          <Card className="h-[calc(80vh-120px)] flex flex-col">
            {selectedSupplierData ? (
              <>
                <CardHeader className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedSupplierData.avatar} alt={selectedSupplierData.name} />
                        <AvatarFallback>{selectedSupplierData.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedSupplierData.name}</h3>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              selectedSupplierData.status === "online" ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></div>
                          <span className="text-xs text-[#1C1917]">
                            {selectedSupplierData.status === "online" ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender !== "me" && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarImage src={selectedSupplierData.avatar} alt={selectedSupplierData.name} />
                          <AvatarFallback>{selectedSupplierData.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={`rounded-lg p-3 max-w-md ${
                            message.sender === "me" ? "bg-primary text-zinc-900-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <p className="text-xs text-[#1C1917] mt-1">{message.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  );
}
