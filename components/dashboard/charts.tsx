"use client"
import { ChartContainer } from "@/components/ui/chart"
import {
  Bar,
  Line,
  Pie,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function BarChart() {
  const data = [
    { name: "Apparel", value: 12 },
    { name: "Footwear", value: 8 },
    { name: "Accessories", value: 5 },
    { name: "Home Goods", value: 7 },
    { name: "Electronics", value: 3 },
  ]

  return (
    <ChartContainer className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function LineChart() {
  const data = [
    { name: "Jan", value: 4 },
    { name: "Feb", value: 3 },
    { name: "Mar", value: 5 },
    { name: "Apr", value: 7 },
    { name: "May", value: 6 },
    { name: "Jun", value: 8 },
  ]

  return (
    <ChartContainer className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function PieChart() {
  const data = [
    { name: "Ideating", value: 5, fill: "#8884d8" },
    { name: "Spec Ready", value: 7, fill: "#83a6ed" },
    { name: "Quoted", value: 4, fill: "#8dd1e1" },
    { name: "In Production", value: 8, fill: "#82ca9d" },
  ]

  return (
    <ChartContainer className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          />
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
