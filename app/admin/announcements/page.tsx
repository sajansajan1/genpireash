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
import { sendAmbassadorWelcome } from "@/app/actions/send-mail";
import { useGetAnnouncementsStore } from "@/lib/zustand/admin/announcements/getAnnouncements";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Announcement = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  video_url: string;
};

export default function Ambassador() {
  const router = useRouter();
  const { fetchGetAnnouncements, GetAnnouncements, refresGetAnnouncements } = useGetAnnouncementsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [Announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [annuncementLoading, setAnnouncementLoading] = useState<"creating" | "delete" | null>(null);
  useEffect(() => {
    const loadAnnouncements = async () => {
      setIsLoading(true);
      try {
        if (!GetAnnouncements || GetAnnouncements.length === 0) {
          await fetchGetAnnouncements();
        } else {
          setAnnouncements(GetAnnouncements);
        }
      } catch (error) {
        console.error("Error loading Announcements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncements();
  }, [GetAnnouncements, fetchGetAnnouncements]);

  useEffect(() => {
    if (GetAnnouncements) setAnnouncements(GetAnnouncements);
  }, [GetAnnouncements]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Basic validation
    if (!title || !description) return alert("Title and description are required");

    try {
      setAnnouncementLoading("creating");
      const response = await fetch("/api/admin/announcements/create-announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          video_url: videoUrl,
        }),
      });

      const data = await response.json();
      toast({
        variant: "default",
        title: "Announcement Created",
        description: "Congrats! Announcement Successfully created",
      });
      await refresGetAnnouncements();
      if (!response.ok) {
        console.error("Error adding announcement:", data.error);
        return alert(`Error: ${data.error}`);
      }
      // Reset the form
      setTitle("");
      setDescription("");
      setVideoUrl("");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setAnnouncementLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setAnnouncementLoading("delete");

      const response = await fetch("/api/admin/announcements/delete-announcements", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error deleting announcement:", data.error);
        return alert(`Error: ${data.error}`);
      }

      toast({
        variant: "default",
        title: "Announcement Deleted",
        description: "The announcement was successfully deleted.",
      });

      // Refresh table
      await refresGetAnnouncements();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setAnnouncementLoading(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Add New Announcement</CardTitle>
          <CardDescription>Fill in the details and click Add</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-1">Title</Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter announcement description"
                required
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Video URL</Label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video URL"
              />
            </div>
            <Button type="submit" variant="default" disabled={annuncementLoading === "creating"}>
              {annuncementLoading === "creating" ? "Creating...." : "Add Announcement"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>{Announcements?.length || 0} total announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>VideoUrl</TableHead>
                  <TableHead>Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Skeleton loading state
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
                    </TableRow>
                  ))
                ) : Announcements?.length === 0 ? (
                  // No data state
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-[#1C1917]">
                      No announcements found
                    </TableCell>
                  </TableRow>
                ) : (
                  // Actual data
                  Announcements.map((announcement) => (
                    <TableRow key={announcement.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>{announcement.title || "—"}</TableCell>
                      <TableCell>{announcement.description || "—"}</TableCell>
                      <TableCell>{announcement.video_url || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="default"
                          onClick={() => handleDelete(announcement.id)}
                          disabled={annuncementLoading === "delete"}
                        >
                          {annuncementLoading === "delete" ? "Deleting...." : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
