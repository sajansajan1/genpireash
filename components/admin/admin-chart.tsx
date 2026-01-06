"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { startOfDay, endOfDay } from "date-fns";

interface ChartDataPoint {
  date: string;
  value: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface AdminChartProps {
  title: string;
  description: string;
  type: "signups" | "techpacks";
  dateRange: DateRange;
  granularity: "daily" | "weekly" | "monthly";
}

export function AdminChart({ title, description, type, dateRange, granularity }: AdminChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fromDate = startOfDay(dateRange.from).toISOString();
      console.log("fromDate ==> ", fromDate);
      const toDate = endOfDay(dateRange.to).toISOString();
      console.log("toDate ==> ", toDate);

      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        granularity,
      });

      const response = await fetch(`/api/admin/charts/${type}?${params}`);
      if (response.ok) {
        const chartData = await response.json();
        setData(chartData);
      }
    } catch (error) {
      console.error(`Error fetching ${type} chart:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, dateRange, granularity]);

  const formatXAxisLabel = (dateString: string) => {
    const date = new Date(dateString);
    return granularity === "daily" ? format(date, "MMM dd") : format(date, "MMM dd");
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-2xl font-bold">
          {isLoading ? <div className="h-8 w-16 bg-muted animate-pulse rounded" /> : total.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] w-full bg-muted animate-pulse rounded" />
        ) : data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-[#1C1917]">
            No data available for the selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisLabel}
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip
                labelFormatter={(value) => formatXAxisLabel(value as string)}
                formatter={(value: number) => [value.toLocaleString(), title]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
