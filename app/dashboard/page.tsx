"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { Overview } from "@/components/dashboard/overview";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { ChatWidget } from "@/components/dashboard/chat-widget";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Star,
  Search,
  Filter,
  MessageSquare,
  ExternalLink,
  PlusCircle,
  CreditCard,
  Zap,
  Crown,
} from "lucide-react";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function DashboardPage() {
  const [userName] = useState("Development User");

  // Sample supplier data
  const suppliers = [
    {
      id: "1",
      name: "EcoFabric Manufacturing",
      location: "Vietnam",
      region: "Asia",
      rating: 4.8,
      reviewCount: 48,
      minOrderQuantity: 300,
      leadTime: "2-3 weeks",
      specialties: ["Eco-friendly", "Footwear", "Recycled Materials"],
      certifications: ["GOTS", "Fair Trade"],
      image: "/placeholder.svg?height=100&width=100&text=EFM",
    },
    {
      id: "2",
      name: "GreenStep Productions",
      location: "Portugal",
      region: "Europe",
      rating: 4.9,
      reviewCount: 36,
      minOrderQuantity: 200,
      leadTime: "3-4 weeks",
      specialties: ["Sustainable", "Premium Quality", "Small Batches"],
      certifications: ["B Corp", "ISO 14001"],
      image: "/placeholder.svg?height=100&width=100&text=GSP",
    },
    {
      id: "3",
      name: "Sustainable Soles Inc.",
      location: "Mexico",
      region: "Americas",
      rating: 4.6,
      reviewCount: 52,
      minOrderQuantity: 500,
      leadTime: "2-3 weeks",
      specialties: ["Footwear", "Natural Materials", "Vegan"],
      certifications: ["PETA-Approved", "Carbon Neutral"],
      image: "/placeholder.svg?height=100&width=100&text=SSI",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/creator-dashboard">
            <Button className="bg-gradient-to-r from-navy to-navy/80 hover:from-navy/90 hover:to-navy/70">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Tech Pack
            </Button>
          </Link>
          <CalendarDateRangePicker />
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-[#1C1917]"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-[#1C1917]">+2 since last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-[#1C1917]"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-[#1C1917]">+1 since last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-[#1C1917]"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-[#1C1917]">+1 since last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-[#1C1917]"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-[#1C1917]">+1 since last month</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>You made 3 product updates recently</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="suppliers" className="mt-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold tracking-tight `}>Featured Suppliers</h1>
              <p className="text-[#1C1917] mt-1">Connect with verified suppliers for your products.</p>
            </div>
            <Button className="mt-4 md:mt-0">Request Supplier Match</Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#1C1917]" />
              <Input
                type="search"
                placeholder="Search suppliers by name, location, or specialty..."
                className="w-full pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="americas">Americas</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="footwear">Footwear</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="eco-friendly">Eco-Friendly</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-4">
                    <div className="p-6 md:border-r">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                          <img
                            src={supplier.image || "/placeholder.svg"}
                            alt={supplier.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{supplier.name}</h3>
                          <div className="flex items-center text-sm text-[#1C1917] mb-3">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{supplier.location}</span>
                          </div>
                          <div className="flex items-center mb-4">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="font-medium">{supplier.rating}</span>
                            </div>
                            <span className="text-xs text-[#1C1917] ml-2">({supplier.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {supplier.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {supplier.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-3 grid grid-cols-1 md:grid-cols-3">
                      <div className="p-6 flex flex-col justify-between border-t md:border-t-0 md:border-r">
                        <div>
                          <div className="text-sm text-[#1C1917] mb-1">Min. Order Quantity</div>
                          <div className="font-semibold">{supplier.minOrderQuantity} units</div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm text-[#1C1917] mb-1">Lead Time</div>
                          <div className="font-semibold">{supplier.leadTime}</div>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col justify-between border-t md:border-t-0 md:border-r">
                        <div>
                          <div className="text-sm text-[#1C1917] mb-1">Production Capacity</div>
                          <div className="font-semibold">5,000 units/month</div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm text-[#1C1917] mb-1">Sample Price</div>
                          <div className="font-semibold">$100-150</div>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col justify-between border-t md:border-t-0">
                        <div className="text-sm text-[#1C1917] mb-4">
                          This supplier specializes in {supplier.specialties[0].toLowerCase()} manufacturing with a
                          focus on quality and sustainability.
                        </div>
                        <div className="mt-auto flex gap-2">
                          <Button className="flex-1">View Profile</Button>
                          <Button variant="outline" size="icon">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link href="#" target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard/suppliers">View All Suppliers</Link>
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>View your product performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Your best performing products</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and download reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium">Monthly Production Summary</h3>
                    <p className="text-sm text-[#1C1917]">Last updated: April 5, 2025</p>
                  </div>
                  <Button variant="outline">Download</Button>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium">Supplier Performance Analysis</h3>
                    <p className="text-sm text-[#1C1917]">Last updated: April 3, 2025</p>
                  </div>
                  <Button variant="outline">Download</Button>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium">Material Usage Report</h3>
                    <p className="text-sm text-[#1C1917]">Last updated: April 1, 2025</p>
                  </div>
                  <Button variant="outline">Download</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Credits Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Purchase Credits</h2>
            <p className="text-[#1C1917]">
              Get more credits to create additional tech packs and access premium features
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Starter Package */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Starter</CardTitle>
                <Badge variant="outline">Popular</Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-[#1C1917]">/package</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">50 Tech Pack Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">AI-Powered Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">PDF Export</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Basic Support</span>
                </div>
              </div>
              <Button className="w-full h-12 flex items-center justify-center gap-2 px-4 text-sm font-medium" size="lg">
                <CreditCard className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Buy Now</span>
              </Button>
              <p className="text-xs text-center text-[#1C1917]">$0.58 per tech pack</p>
            </CardContent>
          </Card>

          {/* Professional Package */}
          <Card className="relative overflow-hidden border-primary shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/80"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Professional</CardTitle>
                <Badge className="bg-primary text-zinc-900-foreground">Best Value</Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$79</span>
                <span className="text-[#1C1917]">/package</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">150 Tech Pack Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">AI-Powered Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">PDF Export</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Priority Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Supplier Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Advanced Templates</span>
                </div>
              </div>
              <Button className="w-full h-12 flex items-center justify-center gap-2 px-4 text-sm font-medium" size="lg">
                <Zap className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Buy Now</span>
              </Button>
              <p className="text-xs text-center text-[#1C1917]">$0.53 per tech pack • Save 9%</p>
            </CardContent>
          </Card>

          {/* Enterprise Package */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Enterprise</CardTitle>
                <Badge variant="secondary">Premium</Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$199</span>
                <span className="text-[#1C1917]">/package</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">500 Tech Pack Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">AI-Powered Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">PDF Export</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">24/7 Priority Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Supplier Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Advanced Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Custom Branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">API Access</span>
                </div>
              </div>
              <Button
                className="w-full h-12 flex items-center justify-center gap-2 px-4 text-sm font-medium bg-transparent"
                size="lg"
                variant="outline"
              >
                <Crown className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Buy Now</span>
              </Button>
              <p className="text-xs text-center text-[#1C1917]">$0.40 per tech pack • Save 31%</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#1C1917] mb-2">
            Need more credits?{" "}
            <Link href="/dashboard/billing" className="text-zinc-900 hover:underline">
              View all plans
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-[#1C1917]">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <span>Instant Activation</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <span>No Expiration</span>
            </div>
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
