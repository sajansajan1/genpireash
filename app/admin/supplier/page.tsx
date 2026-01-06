"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { sendAmbassadorWelcome, sendSupplierApplicationApproved } from "@/app/actions/send-mail";
import { useGetSuppliersStore } from "@/lib/zustand/supplier/getSupplier";
import { getSupplierProfile } from "@/lib/supabase/supplier";

type Friend = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  contact: string;
  location: string;
  role: string;
  audience_size: string;
  address: string;
  sharing_plan: string;
  social_links: string;
  verified_profile: boolean;
};

export default function Suppliers() {
  const router = useRouter();
  const { fetchGetSuppliers, GetSuppliers, refresGetSuppliers } = useGetSuppliersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Friend[]>([]);
  const [status, setStatus] = useState<boolean>(false);
  console.log("suppliers", GetSuppliers);

  useEffect(() => {
    const loadSuppliers = async () => {
      setIsLoading(true);
      try {
        if (!GetSuppliers || GetSuppliers.length === 0) {
          await fetchGetSuppliers();
        } else {
          setSuppliers(GetSuppliers);
        }
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuppliers();
  }, [GetSuppliers, fetchGetSuppliers]);

  useEffect(() => {
    if (GetSuppliers) setSuppliers(GetSuppliers);
  }, [GetSuppliers]);

  const handleStatusChange = async (newStatus: boolean, id: string, email: string, full_name: string) => {
    setStatus(newStatus); // update badge immediately

    try {
      const response = await fetch("/api/admin/suppliers/update-suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, email, verified_profile: newStatus }),
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
        description: `Supllier status updated to ${newStatus}`,
        variant: "default",
      });

      if (data && newStatus) {
        console.log(email, full_name, data, newStatus, "ASDDDDDds");
        const { success, message } = await sendSupplierApplicationApproved({
          email: email,
          supplierName: full_name,
        });
        console.log("Application email sent:", success);
      }
      await refresGetSuppliers();
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
        <CardTitle>Suppliers</CardTitle>
        <CardDescription>{suppliers?.length || 0} total suppliers</CardDescription>
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
                <TableHead>Address</TableHead>
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
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#1C1917]">
                    No ambassadors found
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((friend) => (
                  <TableRow key={friend.id} className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/supplier/${friend.id}`)}>
                    <TableCell>{friend.full_name || "N/A"}</TableCell>
                    <TableCell>{friend.email || "N/A"}</TableCell>
                    <TableCell>{friend.contact ? `+${friend.contact}` : "N/A"}</TableCell>
                    <TableCell>{friend.location || "N/A"}</TableCell>
                    <TableCell>{friend.address || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          friend.verified_profile === true
                            ? "default"
                            : friend.verified_profile === false
                              ? "secondary"
                              : "destructive"
                        }
                        className="ml-2"
                      >
                        {friend.verified_profile ? "Verified" : "Not Verified"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={friend.verified_profile ? "true" : "false"}
                        onValueChange={(value) =>
                          handleStatusChange(value === "true", friend.id, friend.email, friend.full_name)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Approved</SelectItem>
                          <SelectItem value="false">Pending</SelectItem>
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
