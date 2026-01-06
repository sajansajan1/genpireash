import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { BarChart, LineChart, PieChart } from "@/components/dashboard/charts";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function AnalyticsPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${volkhov.className}`}>Analytics</h1>
          <p className="text-[#1C1917] mt-1">Track your product development metrics and performance.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Last 30 Days
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { title: "Total Products", value: "24", change: "+3", changeType: "increase" },
          { title: "Active Projects", value: "12", change: "+2", changeType: "increase" },
          { title: "Completed Projects", value: "8", change: "+1", changeType: "increase" },
          { title: "Avg. Time to Sample", value: "18 days", change: "-2", changeType: "decrease" },
        ].map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium text-[#1C1917] ${volkhov.className}`}>{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs mt-1 flex items-center ${
                  stat.changeType === "increase"
                    ? "text-green-500"
                    : stat.changeType === "decrease"
                    ? "text-red-500"
                    : "text-[#1C1917]"
                }`}
              >
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={volkhov.className}>Product Development Status</CardTitle>
                  <Select defaultValue="30days">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>Distribution of products by development stage</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={volkhov.className}>Product Creation Trend</CardTitle>
                  <Select defaultValue="30days">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>Number of new products created over time</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={volkhov.className}>Product Categories</CardTitle>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="apparel">Apparel</SelectItem>
                    <SelectItem value="footwear">Footwear</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="home">Home Goods</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>Distribution of products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-0 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className={volkhov.className}>Product Performance</CardTitle>
              <CardDescription>Metrics for your top performing products</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-0 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className={volkhov.className}>Supplier Response Times</CardTitle>
              <CardDescription>Average response times from suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="mt-0 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className={volkhov.className}>Cost Analysis</CardTitle>
              <CardDescription>Breakdown of costs by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
