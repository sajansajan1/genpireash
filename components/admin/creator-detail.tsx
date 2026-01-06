"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Activity, FileText, Clock, StickyNote } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Creator {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_seen_at: string | null;
  techpack_count?: number;
  persona?: string;
  categories?: string;
  goal?: string;
  experience?: string;
  brand_description?: string;
  brand_size?: string;
  target_market?: string;
  order_size?: string;
  designation?: string;
  team_size?: string;
  website_url?: string;
  contact?: string;
  address?: string;
  country?: string;
  bio?: string;
}

interface TechPack {
  id: string;
  creator_id: string;
  title: string;
  created_at: string;
  status: string;
}

interface CreatorDetailProps {
  creator: Creator;
  techPacks: TechPack[];
}

export function CreatorDetail({ creator, techPacks }: CreatorDetailProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Never";

    try {
      const date = new Date(lastSeen);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "in_progress":
        return <Badge variant="outline">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActivityBadge = (lastSeen: string | null) => {
    if (!lastSeen) return <Badge variant="secondary">Inactive</Badge>;

    const daysSince = (Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince <= 1) return <Badge variant="default">Very Active</Badge>;
    if (daysSince <= 7) return <Badge variant="secondary">Active</Badge>;
    if (daysSince <= 30) return <Badge variant="outline">Moderate</Badge>;
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const lastTechPack = techPacks[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{creator.name}</h1>
          <p className="text-[#1C1917]">{creator.email}</p>
        </div>
      </div>

      {/* Creator Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Join Date</CardTitle>
            <Calendar className="h-4 w-4 text-[#1C1917]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(new Date(creator.created_at), "MMM dd, yyyy")}</div>
            <p className="text-xs text-[#1C1917]">
              {formatDistanceToNow(new Date(creator.created_at), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Seen</CardTitle>
            <Activity className="h-4 w-4 text-[#1C1917]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLastSeen(creator.last_seen_at)}</div>
            <div className="mt-2">{getActivityBadge(creator.last_seen_at)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tech Packs</CardTitle>
            <FileText className="h-4 w-4 text-[#1C1917]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creator.techpack_count || 0}</div>
            <p className="text-xs text-[#1C1917]">Lifetime generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Generated</CardTitle>
            <Clock className="h-4 w-4 text-[#1C1917]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastTechPack ? formatDistanceToNow(new Date(lastTechPack.created_at), { addSuffix: true }) : "Never"}
            </div>
            <p className="text-xs text-[#1C1917]">{lastTechPack ? lastTechPack.title : "No tech packs yet"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile & Onboarding Details */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile & Onboarding Details</CardTitle>
              <CardDescription>Information provided during signup and onboarding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Persona</h4>
                  <p className="font-medium">{creator.persona || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Goal</h4>
                  <p className="font-medium">{creator.goal || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Experience Level</h4>
                  <p className="font-medium capitalize">{creator.experience || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Categories</h4>
                  <p className="font-medium">{creator.categories || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
                  <p className="font-medium">{creator.contact || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                  <p className="font-medium">
                    {[creator.address, creator.country].filter(Boolean).join(", ") || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Website</h4>
                  {creator.website_url ? (
                    <a
                      href={creator.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {creator.website_url}
                    </a>
                  ) : (
                    <p className="font-medium">N/A</p>
                  )}
                </div>
                <div className="space-y-1 md:col-span-2 lg:col-span-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Bio</h4>
                  <p className="font-medium">{creator.bio || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Tech Packs List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tech Packs</CardTitle>
              <CardDescription>All tech packs created by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {techPacks.length === 0 ? (
                <div className="text-center py-8 text-[#1C1917]">No tech packs created yet</div>
              ) : (
                <div className="space-y-4">
                  {techPacks.map((techPack) => (
                    <div
                      key={techPack.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium">{techPack.title}</h4>
                        <p className="text-sm text-[#1C1917]">
                          Created {format(new Date(techPack.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(techPack.status)}
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <StickyNote className="h-4 w-4" />
                <span>Notes</span>
              </CardTitle>
              <CardDescription>Private notes about this creator (stored locally)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add your notes about this creator..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="mt-4 flex justify-end">
                <Button size="sm">Save Notes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
