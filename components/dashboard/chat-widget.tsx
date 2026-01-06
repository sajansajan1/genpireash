"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const pathname = usePathname();

  // Don't show the widget on the chat page itself
  if (pathname === "/dashboard/chat") {
    return null;
  }

  // Sample suppliers with unread messages
  const suppliers = [
    {
      id: "supplier1",
      name: "EcoFabric Manufacturing",
      avatar: "/placeholder.svg?height=40&width=40&text=EF",
      lastMessage: "We can adjust the materials as requested.",
      time: "10:32 AM",
      unread: 2,
    },
    {
      id: "supplier3",
      name: "Sustainable Soles Inc.",
      avatar: "/placeholder.svg?height=40&width=40&text=SS",
      lastMessage: "Here's the updated quote for your review.",
      time: "Yesterday",
      unread: 1,
    },
  ];

  // Total unread messages
  const totalUnread = suppliers.reduce((sum, supplier) => sum + supplier.unread, 0);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const selectedSupplierData = selectedSupplier ? suppliers.find((s) => s.id === selectedSupplier) : null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 shadow-lg">
          <CardHeader className="p-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base">{selectedSupplier ? "Chat with Supplier" : "Recent Messages"}</CardTitle>
            <div className="flex gap-2">
              {selectedSupplier && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedSupplier(null)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedSupplier ? (
              <>
                <div className="max-h-80 overflow-y-auto">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedSupplier(supplier.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={supplier.avatar} alt={supplier.name} />
                          <AvatarFallback>{supplier.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
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
                <div className="p-3 border-t">
                  <Button asChild className="w-full">
                    <Link href="/dashboard/chat">View All Conversations</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto p-3 space-y-3">
                  <div className="flex justify-start">
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={selectedSupplierData?.avatar} alt={selectedSupplierData?.name} />
                      <AvatarFallback>{selectedSupplierData?.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="rounded-lg p-3 bg-muted">
                        <p className="text-sm">{selectedSupplierData?.lastMessage}</p>
                      </div>
                      <p className="text-xs text-[#1C1917] mt-1">{selectedSupplierData?.time}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" className="h-10 w-10">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
                <div className="p-3 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/dashboard/chat?supplier=${selectedSupplier}`}>Open Full Chat</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsOpen(true)} size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <MessageSquare className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full" variant="destructive">
              {totalUnread}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}
