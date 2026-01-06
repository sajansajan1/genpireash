"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown, Search } from "lucide-react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { Input } from "@/components/ui/input";

export interface Creator {
  id: string;
  full_name: string | null;
  email: string | null;
  user_id: string | null;
  role: string | null;
  country: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
  techpack_count: number;
  techpack_count_range: number;
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const router = useRouter();
  const limit = 50;

  // 👇 Set default search and dateRange internally
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(startOfDay(subDays(new Date(), 7))); // last 7 days
  const [toDate, setToDate] = useState(endOfDay(new Date()));

  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      });

      const response = await fetch(`/api/admin/creators?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCreators(data.creators);
        setTotal(data.total);
      } else {
        console.error("Failed to fetch creators:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [page, search, fromDate, toDate]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getActivityLevel = (techpackCount: number, techpackCountRange: number) => {
    if (techpackCount === 0) return { label: "Inactive", variant: "destructive" as const };
    if (techpackCountRange > 20) return { label: "Very Active", variant: "default" as const };
    if (techpackCountRange > 5) return { label: "Active", variant: "secondary" as const };
    if (techpackCountRange > 0) return { label: "Moderate", variant: "outline" as const };
    return { label: "Inactive", variant: "secondary" as const };
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Creators</CardTitle>
        <CardDescription>
          {total} total creators • Page {page} of {totalPages}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 🔍 Optional: inline search bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#1C1917]" />
            <Input
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchCreators}>
            Refresh
          </Button>
        </div>

        <div className="rounded-md border">
          <Table className="overflow-x-auto">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-semibold text-black"
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("email")}
                    className="h-auto p-0 font-semibold text-black"
                  >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("created_at")}
                    className="h-auto p-0 font-semibold text-black"
                  >
                    Sign-up Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("updated_at")}
                    className="h-auto p-0 font-semibold text-black"
                  >
                    Last Updated
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Tech Packs (Total)</TableHead>
                <TableHead className="text-right">Tech Packs (Range)</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
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
                      <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : creators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#1C1917]">
                    No creators found
                  </TableCell>
                </TableRow>
              ) : (
                creators.map((creator) => {
                  const activity = getActivityLevel(creator.techpack_count, creator.techpack_count_range);
                  return (
                    <TableRow
                      key={creator.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin/creators/${creator.id}`)}
                    >
                      <TableCell className="font-medium">{creator.full_name || "—"}</TableCell>
                      <TableCell>{creator.email || "—"}</TableCell>
                      <TableCell>{format(new Date(creator.created_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{format(new Date(creator.updated_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={activity.variant}>{activity.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{creator.techpack_count}</TableCell>
                      <TableCell className="text-right">{creator.techpack_count_range}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-[#1C1917]">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} creators
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
