"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CalendarIcon,
  Search,
  Users,
  Activity,
  FileText,
  UserPlus,
  Shield,
  Banknote,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { CreatorsTable } from "./creators-table";
import { AdminChart } from "./admin-chart";
import { useAdminDashboardCountsStore } from "@/lib/zustand/admin/dashboard";
import { useAdminMetricsStore } from "@/lib/zustand/admin/admin-executive/executive";

interface KPIData {
  totalCreators: number;
  activeCreators: number;
  techPacksGenerated: number;
  activeProCount: number;
  totalUsers: number;
  activeSaverCount: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

export function AdminDashboard() {
  const [kpis, setKpis] = useState<KPIData>({
    totalCreators: 0,
    activeCreators: 0,
    techPacksGenerated: 0,
    activeProCount: 0,
    totalUsers: 0,
    activeSaverCount: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [granularity, setGranularity] = useState<"daily" | "monthly" | "weekly">("daily");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { fetchAdminDashboardCounts, getAdminDashboardCounts, loadingAdminDashboardCounts } =
    useAdminDashboardCountsStore();
  const { metrics, fetchMetrics } = useAdminMetricsStore();

  useEffect(() => {
    if (!getAdminDashboardCounts && fetchAdminDashboardCounts) {
      fetchAdminDashboardCounts();
    }
    if (getAdminDashboardCounts && !isFormInitialized) {
      setKpis({
        totalCreators: getAdminDashboardCounts.totalCreators || 0,
        activeCreators: getAdminDashboardCounts.activeCreators || 0,
        techPacksGenerated: getAdminDashboardCounts.totalProducts || 0,
        activeProCount: getAdminDashboardCounts.activeProCount || 0,
        totalUsers: getAdminDashboardCounts.totalUsers || 0,
        activeSaverCount: getAdminDashboardCounts.activeSaverCount || 0,
        weeklyActiveUsers: getAdminDashboardCounts.weeklyActiveUsers || 0,
        monthlyActiveUsers: getAdminDashboardCounts.monthlyActiveUsers || 0,
      });
      setIsFormInitialized(true);
    }
    setIsLoading(false);
  }, [getAdminDashboardCounts, fetchAdminDashboardCounts]);

  const setDatePreset = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  useEffect(() => {
    fetchMetrics(dateRange.from, dateRange.to);
  }, [dateRange.from, dateRange.to, fetchMetrics]);

  const getRangeForGranularity = (g: "daily" | "weekly" | "monthly") => {
    const now = new Date();
    if (g === "daily") return { from: now, to: now };
    if (g === "weekly") return { from: subDays(now, 6), to: now };
    if (g === "monthly") return { from: subDays(now, 29), to: now };
    return { from: subDays(now, 29), to: now };
  };

  const handleGranularityChange = (value: "daily" | "weekly" | "monthly") => {
    setGranularity(value);
    setDateRange(getRangeForGranularity(value));
  };

  const kpiCards = [
    {
      title: "Total Creators",
      value: kpis.totalCreators,
      description: "All-time registered users",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Tech Packs Generated",
      value: kpis.techPacksGenerated,
      description: "Total Tech Packs",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Total Users",
      value: kpis.totalUsers,
      description: "Total Users",
      icon: UserPlus,
      color: "text-orange-600",
    },
    {
      title: "Pro Users",
      value: kpis.activeProCount,
      description: "Active Pro Users",
      icon: Shield,
      color: "text-black",
    },
    {
      title: "Saver Plan Users",
      value: kpis.activeSaverCount,
      description: "Active Saver Users",
      icon: Banknote,
      color: "text-orange-600",
    },
    {
      title: "WAU",
      value: kpis.weeklyActiveUsers,
      description: "Weekly active users",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "MAU",
      value: kpis.monthlyActiveUsers,
      description: "Monthly active users",
      icon: Users,
      color: "text-black-600",
    },
    {
      title: "AI Micro Edits Generated",
      value: 0,
      description: "In selected time range",
      icon: Sparkles,
      color: "text-orange-600",
    },
    {
      title: " Total $ booked",
      value: "$0",
      description: " In selected time range",
      icon: DollarSign,
      color: "text-black-600",
    },
  ];

  const executiveCards = [
    {
      title: "WAU",
      value: kpis.totalCreators,
      description: "Weekly active users",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "MAU",
      value: kpis.techPacksGenerated,
      description: "Monthly active users",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: " Tech Packs Generated",
      value: kpis.activeProCount,
      description: " In selected time range",
      icon: Shield,
      color: "text-black",
    },
    {
      title: " Technical Files Generated",
      value: kpis.activeSaverCount,
      description: " In selected time range",
      icon: UserPlus,
      color: "text-orange-600",
    },
    {
      title: "AI Micro Edits Generated",
      value: kpis.activeSaverCount,
      description: "In selected time range",
      icon: Sparkles,
      color: "text-orange-600",
    },
    {
      title: " Total $ booked",
      value: "$0",
      description: " In selected time range",
      icon: UserPlus,
      color: "text-orange-600",
    },
    {
      title: " Total Pro Plans purchased",
      value: kpis.activeSaverCount,
      description: " In selected time range",
      icon: UserPlus,
      color: "text-orange-600",
    },
    {
      title: " Total Saver Plans purchased",
      value: kpis.activeSaverCount,
      description: " In selected time range",
      icon: UserPlus,
      color: "text-orange-600",
    },
  ];

  const conversionMetrics = [
    {
      title: "New Plans Purchased / New Sign-Ups",
      description: "In selected time range",
      value: `${metrics?.percentage ?? 0}`,
    },

    {
      title: "Tech packs generated / Active Users",
      description: "In selected time range",
      value: `${
        metrics?.tech_packs
          ? (
              (metrics?.tech_packs /
                (granularity === "monthly"
                  ? metrics?.data?.monthly_active_users
                  : metrics?.data?.weekly_active_users)) *
              100
            ).toFixed(2)
          : 0
      }`,
    },
  ];
  console.log("metrics", metrics);

  const retentionMetrics = [
    {
      title: "% of Active Users that were also active last month",
      description: "Current month over last month",
      value: `${
        metrics?.data && metrics.totalUsers > 0
          ? ((metrics.data.weekly_active_users / metrics.totalSignups) * 100).toFixed(2)
          : 0
      }`,
    },
    {
      title: "% of new users out of total active users",
      description: "During the selected time period",
      value: `${
        metrics?.data && metrics.totalUsers > 0
          ? (
              (metrics.totalSignups /
                (granularity === "monthly" ? metrics.data.monthly_active_users : metrics.data.weekly_active_users)) *
              100
            ).toFixed(2)
          : 0
      }`,
    },
    // {
    //   title: "% return users (users who signup up any-time)",
    //   description: "In selected time range",
    //   value: `${
    //     metrics?.data && metrics.totalUsers > 0
    //       ? ((metrics.data.weekly_active_users / metrics.totalUsers) * 100).toFixed(2)
    //       : 0
    //   }`,
    // },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Customize your dashboard view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Date Presets */}
            <div className="flex gap-2">
              <Button
                variant={dateRange.from.getTime() === subDays(new Date(), 0).getTime() ? "default" : "outline"}
                size="sm"
                onClick={() => setDatePreset(0)}
              >
                Today
              </Button>
              <Button
                variant={dateRange.from.getTime() === subDays(new Date(), 7).getTime() ? "default" : "outline"}
                size="sm"
                onClick={() => setDatePreset(7)}
              >
                Last 7 days
              </Button>
              <Button
                variant={dateRange.from.getTime() === subDays(new Date(), 30).getTime() ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDatePreset(30);
                  setGranularity("monthly");
                }}
              >
                Last 30 days
              </Button>
            </div>

            {/* Custom Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[280px] justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Granularity */}
            <Select value={granularity} onValueChange={handleGranularityChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <div className="h-8 w-16 bg-muted animate-pulse rounded" /> : kpi.value.toLocaleString()}
              </div>
              <p className="text-xs text-[#1C1917]">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <AdminChart
          title="Tech Packs Generated"
          description="Track tech pack creation over time"
          type="techpacks"
          dateRange={dateRange}
          granularity={granularity}
        />
        <AdminChart
          title="New Signups"
          description="Monitor user registration trends"
          type="signups"
          dateRange={dateRange}
          granularity={granularity}
        />
      </div>

      {/* Creators Table */}
      {/* <CreatorsTable search={search} dateRange={dateRange} /> */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Conversion */}
        <div>
          <h2 className="text-lg font-semibold mb-2">User Conversion</h2>
          <div className="grid gap-3">
            {conversionMetrics.map((kpi) => (
              <Card key={kpi.title} className="border border-zinc-300 bg-[#F2F2F2]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-800">{kpi.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-900">
                    {isLoading ? <div className="h-7 w-14 bg-muted animate-pulse rounded" /> : `${kpi.value}%`}
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">{kpi.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Retention */}
        <div>
          <h2 className="text-lg font-semibold mb-2">User Retention</h2>
          <div className="grid gap-3">
            {retentionMetrics.map((kpi) => (
              <Card key={kpi.title} className="border border-zinc-300 bg-[#F2F2F2]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-800">{kpi.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-900">
                    {isLoading ? <div className="h-7 w-14 bg-muted animate-pulse rounded" /> : `${kpi.value}%`}
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">{kpi.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
