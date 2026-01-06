"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetFriendsStore } from "@/lib/zustand/admin/friends/getFriends";
import { supabase } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { sendAmbassadorWelcome } from "@/app/actions/send-mail";

type Friend = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  audience_size: string;
  motivation: string;
  sharing_plan: string;
  social_links: string;
  status: string;
};

export default function Ambassador() {
  const router = useRouter();
  const { fetchGetFriends, GetFriends, refresGetFriends } = useGetFriendsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [status, setStatus] = useState<"approved" | "pending">("approved");
  useEffect(() => {
    const loadFriends = async () => {
      setIsLoading(true);
      try {
        if (!GetFriends || GetFriends.length === 0) {
          await fetchGetFriends();
        } else {
          setFriends(GetFriends);
        }
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriends();
  }, [GetFriends, fetchGetFriends]);

  useEffect(() => {
    if (GetFriends) setFriends(GetFriends);
  }, [GetFriends]);

  const handleStatusChange = async (
    newStatus: "approved" | "pending",
    id: string,
    email: string,
    full_name: string
  ) => {
    setStatus(newStatus); // update badge immediately

    try {
      const response = await fetch("/api/admin/friends/update-friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, status: newStatus }),
      });

      const data = await response.json();
      console.log("data ==> ", data);

      if (data.error) {
        console.error("Update error:", data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to update friend record.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status Updated",
        description: `Ambassador status updated to ${newStatus}`,
        variant: "default",
      });

      if (data && newStatus === "approved") {
        console.log(email, full_name, data, newStatus, "ASDDDDDds");
        const { success, message } = await sendAmbassadorWelcome({
          email,
          creatorName: full_name,
          activateLink: "https://www.genpire.com/",
          dashboardLink: "https://www.genpire.com/creator-dashboard/ambassador",
        });
        console.log("Ambassador email sent:", success);
      }
      await refresGetFriends();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong while updating status.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ambassadors</CardTitle>
        <CardDescription>{friends?.length || 0} total ambassadors</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Motivation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : friends.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#1C1917]">
                    No ambassadors found
                  </TableCell>
                </TableRow>
              ) : (
                friends.map((friend) => (
                  <TableRow key={friend.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{friend.full_name || "—"}</TableCell>
                    <TableCell>{friend.email || "—"}</TableCell>
                    <TableCell>{friend.phone || "—"}</TableCell>
                    <TableCell>{friend.location || "—"}</TableCell>
                    <TableCell>{friend.motivation || "—"}</TableCell>
                    <TableCell>
                      {" "}
                      <Badge
                        variant={
                          friend.status === "approved"
                            ? "default"
                            : friend.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        style={{ marginLeft: "8px" }}
                      >
                        {friend.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={friend.status}
                        onValueChange={(value) =>
                          handleStatusChange(value as "approved" | "pending", friend.id, friend.email, friend.full_name)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
