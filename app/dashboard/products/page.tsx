import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/dashboard/product-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function ProductsPage() {
  // Sample product data
  const products = [
    {
      id: "1",
      name: "Custom Eco-Friendly Sneakers",
      status: "In Production",
      lastUpdated: "2 days ago",
      image: "/placeholder.svg?height=200&width=300&text=Eco+Sneakers",
    },
    {
      id: "2",
      name: "Eco-Friendly Water Bottle",
      status: "Spec Ready",
      lastUpdated: "1 week ago",
      image: "/placeholder.svg?height=200&width=300&text=Water+Bottle",
    },
    {
      id: "3",
      name: "Minimalist Backpack",
      status: "Quoted",
      lastUpdated: "3 days ago",
      image: "/placeholder.svg?height=200&width=300&text=Backpack",
    },
    {
      id: "4",
      name: "Smart Fitness Tracker",
      status: "In Production",
      lastUpdated: "5 days ago",
      image: "/placeholder.svg?height=200&width=300&text=Fitness+Tracker",
    },
    {
      id: "5",
      name: "Bamboo Sunglasses",
      status: "Ideating",
      lastUpdated: "Just now",
      image: "/placeholder.svg?height=200&width=300&text=Sunglasses",
    },
    {
      id: "6",
      name: "Recycled Denim Jacket",
      status: "Spec Ready",
      lastUpdated: "4 days ago",
      image: "/placeholder.svg?height=200&width=300&text=Denim+Jacket",
    },
    {
      id: "7",
      name: "Sustainable Yoga Mat",
      status: "Quoted",
      lastUpdated: "1 week ago",
      image: "/placeholder.svg?height=200&width=300&text=Yoga+Mat",
    },
    {
      id: "8",
      name: "Modular Desk Organizer",
      status: "Ideating",
      lastUpdated: "3 days ago",
      image: "/placeholder.svg?height=200&width=300&text=Desk+Organizer",
    },
    {
      id: "9",
      name: "Biodegradable Phone Case",
      status: "In Production",
      lastUpdated: "1 day ago",
      image: "/placeholder.svg?height=200&width=300&text=Phone+Case",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${volkhov.className}`}>My Products</h1>
          <p className="text-[#1C1917] mt-1">Manage and track all your product development projects.</p>
        </div>
        <Button asChild className="mt-4 md:mt-0" size="lg">
          <Link href="/dashboard/new-product">
            <PlusCircle className="mr-2 h-5 w-5" /> New Product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#1C1917]" />
          <Input type="search" placeholder="Search products..." className="w-full pl-8" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ideating">Ideating</SelectItem>
              <SelectItem value="spec-ready">Spec Ready</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="in-production">In Production</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="recent">Recently Updated</TabsTrigger>
          <TabsTrigger value="production">In Production</TabsTrigger>
          <TabsTrigger value="development">In Development</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products
              .slice(0, 6)
              .sort((a, b) => {
                if (a.lastUpdated === "Just now") return -1;
                if (b.lastUpdated === "Just now") return 1;
                return 0;
              })
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="production" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products
              .filter((p) => p.status === "In Production")
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="development" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products
              .filter((p) => p.status === "Ideating" || p.status === "Spec Ready" || p.status === "Quoted")
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
