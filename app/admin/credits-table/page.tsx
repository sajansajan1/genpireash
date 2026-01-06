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
import { useGetUsersStore } from "@/lib/zustand/admin/user/getUser";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
type UserCredit = {
  expires_at: string | null;
  status: string;
  credits: number;
  plan_type: string;
  membership: string;
  users?: { email: string };
};

export default function CreditsUpdate() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [edit, handleEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [newId, setNewId] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    credits: "",
    membership: "",
    plan_type: "",
    expires_at: "",
    subId: "",
  });
  const [originalData, setOriginalData] = useState<Partial<UserCredit> | null>(null);

  const { GetUsers, refreshUsers, loadingGetUsers, loadMoreUsers, currentPage, fetchUsersCredits, searchUsers } =
    useGetUsersStore();

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (!GetUsers) {
      fetchUsersCredits();
    }
  }, []);

  // Effect for search
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      if (debouncedSearch) {
        searchUsers(debouncedSearch);
      } else {
        // If search is cleared, fetch without search
        fetchUsersCredits(1, "");
      }
    }
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const startEditing = (row: any) => {
    setEditingId(row.id);
    setEditData({ ...row });
    setOriginalData(row);
    setEditData({
      id: row?.id,
      credits: row?.credits,
      expires_at: row?.expires_at,
      status: row?.status,
      plan_type: row?.plan_type,
      membership: row?.membership,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };
  const hasChanges = () => {
    if (!originalData) return false;

    return (
      originalData?.credits !== editData.credits ||
      originalData?.expires_at !== editData.expires_at ||
      originalData?.status !== editData.status ||
      originalData?.plan_type !== editData.plan_type ||
      originalData?.membership !== editData.membership
    );
  };

  const saveChanges = async () => {
    if (!hasChanges()) {
      toast({
        title: "No changes deetected",
        description: `No changes detected`,
        variant: "destructive",
      });
      setEditingId(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/update-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update");
      }
      setEditData(result);

      toast({
        title: "Success",
        description: "User data updated successfully!",
      });

      setEditingId(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }

    refreshUsers();
  };

  // new user update
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users/update-new-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      console.log("result", result);

      if (!res.ok) {
        toast({
          title: "Error adding credits",
          description: result.error || "No user exists with this email id",
          variant: "destructive",
        });

        setLoading(false); // optional
        return; // 🔥 IMPORTANT — stop here
      }

      toast({
        title: "Credits Updated",
        description: `Credits updated for ${formData.email}`,
      });

      setFormData({
        email: "",
        credits: "",
        membership: "",
        plan_type: "",
        expires_at: "",
        subId: "",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }

    refreshUsers();
  };

  console.log("user-credits-table", GetUsers);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Add Credits</CardTitle>
          <CardDescription>Fill in the details and click Add</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-1">Email</Label>
              <Input
                type="email"
                value={formData?.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email id"
                required
              />
            </div>

            {/* Credits */}
            <div>
              <Label className="block text-sm font-medium mb-1">Credits</Label>
              <Input
                type="number"
                value={formData?.credits}
                onChange={(e) => handleChange("credits", e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter number of credits"
                required
              />
            </div>

            {/* Membership */}
            <div>
              <Label className="block text-sm font-medium mb-1">Membership</Label>
              <Select value={formData?.membership} onValueChange={(value) => handleChange("membership", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose membership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_on">Add On</SelectItem>
                  <SelectItem value="saver">Saver</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sub Id */}
            <div>
              <Label className="block text-sm font-medium mb-1">Sub Id</Label>
              <Input
                type="text"
                value={formData?.subId}
                onChange={(e) => handleChange("subId", e.target.value)}
                disabled={!(formData?.membership === "saver" || formData?.membership === "pro")}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter SubId"
                required={formData?.membership === "saver" || formData?.membership === "pro"}
              />
            </div>

            {/* Plan Type */}
            <div>
              <Label className="block text-sm font-medium mb-1">Plan Type</Label>
              <Select value={formData?.plan_type} onValueChange={(value) => handleChange("plan_type", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One Time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-1">expires_at</Label>
              <Input
                type="date"
                value={formData?.expires_at}
                onChange={(e) => handleChange("expires_at", e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Expire date"
                required
              />
            </div>

            <Button type="submit" variant="default" disabled={loading}>
              {loading ? "Adding..." : "Add Credits"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credits</CardTitle>
          <CardDescription>
            {GetUsers?.total || 0} total users
            {search && ` - searching for "${search}"`}
          </CardDescription>
        </CardHeader>
        <div className="relative flex-1 max-w-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by email"
              value={search}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Id</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Expires at</TableHead>
                  <TableHead>Subscription Id</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Created at</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingGetUsers ? (
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
                ) : GetUsers?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-[#1C1917]">
                      {search ? "No users found for your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  GetUsers?.data?.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>{user?.id}</TableCell>
                      <TableCell>{user?.users?.email}</TableCell>

                      {/* credits */}
                      <TableCell>
                        {editingId === user.id ? (
                          <Input
                            value={editData?.credits}
                            onChange={(e) => setEditData({ ...editData, credits: e.target.value })}
                            className="w-24"
                          />
                        ) : (
                          user?.credits
                        )}
                      </TableCell>

                      {/* expires_at */}
                      <TableCell>
                        {editingId === user.id ? (
                          <Input
                            type="date"
                            value={editData?.expires_at?.split("T")[0] ?? ""}
                            onChange={(e) => setEditData({ ...editData, expires_at: e.target.value })}
                          />
                        ) : (
                          user?.expires_at
                        )}
                      </TableCell>

                      <TableCell>{user?.subscription_id}</TableCell>

                      {/* status */}
                      <TableCell>
                        {editingId === user.id ? (
                          <Select
                            value={editData?.status}
                            onValueChange={(value) => setEditData({ ...editData, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={user?.status} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          user?.status
                        )}
                      </TableCell>

                      {/* plan_type */}
                      <TableCell>
                        {editingId === user?.id ? (
                          <Select
                            value={editData?.plan_type}
                            onValueChange={(value) => setEditData({ ...editData, plan_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={user?.plan_type} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="one_time">one_time</SelectItem>
                              <SelectItem value="monthly">monthly</SelectItem>
                              <SelectItem value="yearly">yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          user?.plan_type
                        )}
                      </TableCell>

                      {/* membership */}
                      <TableCell>
                        {editingId === user.id ? (
                          <Select
                            value={editData?.membership}
                            onValueChange={(value) => setEditData({ ...editData, membership: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={user?.membership} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add_on">add_on</SelectItem>
                              <SelectItem value="saver">saver</SelectItem>
                              <SelectItem value="pro">pro</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          user?.membership
                        )}
                      </TableCell>

                      <TableCell>{user?.created_at}</TableCell>

                      <TableCell>
                        {editingId === user.id ? (
                          <div className="flex gap-2">
                            <Button onClick={saveChanges} size="sm">
                              {loading ? "Saving..." : "Save"}
                            </Button>
                            <Button variant="outline" onClick={cancelEditing} size="sm">
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => startEditing(user)} size="sm">
                            Update
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Page {GetUsers?.page} of {GetUsers?.totalPages}
                {GetUsers?.total && ` (${GetUsers.total} total users)`}
              </p>

              {GetUsers && currentPage < GetUsers.totalPages && (
                <Button
                  onClick={loadMoreUsers}
                  disabled={loadingGetUsers}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900"
                >
                  {loadingGetUsers ? "Loading..." : "Next Page"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
