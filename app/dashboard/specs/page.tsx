import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Share2, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SpecsPage() {
  // Sample specs data
  const specs = [
    {
      id: "1",
      name: "Eco-Friendly Sneakers",
      productType: "Footwear",
      createdAt: "March 15, 2025",
      status: "Complete",
      image: "/placeholder.svg?height=200&width=300&text=Eco+Sneakers",
    },
    {
      id: "2",
      name: "Minimalist Water Bottle",
      productType: "Drinkware",
      createdAt: "March 10, 2025",
      status: "Complete",
      image: "/placeholder.svg?height=200&width=300&text=Water+Bottle",
    },
    {
      id: "3",
      name: "Sustainable Backpack",
      productType: "Bags",
      createdAt: "March 5, 2025",
      status: "In Progress",
      image: "/placeholder.svg?height=200&width=300&text=Backpack",
    },
    {
      id: "4",
      name: "Smart Fitness Band",
      productType: "Wearables",
      createdAt: "February 28, 2025",
      status: "Complete",
      image: "/placeholder.svg?height=200&width=300&text=Fitness+Band",
    },
    {
      id: "5",
      name: "Bamboo Sunglasses",
      productType: "Eyewear",
      createdAt: "February 20, 2025",
      status: "In Progress",
      image: "/placeholder.svg?height=200&width=300&text=Sunglasses",
    },
    {
      id: "6",
      name: "Recycled Denim Jacket",
      productType: "Apparel",
      createdAt: "February 15, 2025",
      status: "Draft",
      image: "/placeholder.svg?height=200&width=300&text=Denim+Jacket",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Specifications</h1>
          <p className="text-[#1C1917] mt-1">View and manage your product specifications.</p>
        </div>
        <Button asChild className="mt-4 md:mt-0" size="lg">
          <Link href="/dashboard/new-product">
            <FileText className="mr-2 h-5 w-5" /> Create New Spec
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input type="search" placeholder="Search specifications..." className="w-full" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="newest">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Specs</TabsTrigger>
          <TabsTrigger value="complete">Complete</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specs.map((spec) => (
              <Card key={spec.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={spec.image || "/placeholder.svg"}
                    alt={spec.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{spec.name}</CardTitle>
                    <Badge className={getStatusColor(spec.status)}>{spec.status}</Badge>
                  </div>
                  <CardDescription>{spec.productType}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center text-sm text-[#1C1917]">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    <span>Created on {spec.createdAt}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/products/${spec.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="complete" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specs
              .filter((s) => s.status === "Complete")
              .map((spec) => (
                <Card key={spec.id} className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={spec.image || "/placeholder.svg"}
                      alt={spec.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{spec.name}</CardTitle>
                      <Badge className={getStatusColor(spec.status)}>{spec.status}</Badge>
                    </div>
                    <CardDescription>{spec.productType}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center text-sm text-[#1C1917]">
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      <span>Created on {spec.createdAt}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/products/${spec.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Share</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specs
              .filter((s) => s.status === "In Progress")
              .map((spec) => (
                <Card key={spec.id} className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={spec.image || "/placeholder.svg"}
                      alt={spec.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{spec.name}</CardTitle>
                      <Badge className={getStatusColor(spec.status)}>{spec.status}</Badge>
                    </div>
                    <CardDescription>{spec.productType}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center text-sm text-[#1C1917]">
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      <span>Created on {spec.createdAt}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/products/${spec.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Share</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specs
              .filter((s) => s.status === "Draft")
              .map((spec) => (
                <Card key={spec.id} className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={spec.image || "/placeholder.svg"}
                      alt={spec.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{spec.name}</CardTitle>
                      <Badge className={getStatusColor(spec.status)}>{spec.status}</Badge>
                    </div>
                    <CardDescription>{spec.productType}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center text-sm text-[#1C1917]">
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      <span>Created on {spec.createdAt}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/products/${spec.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Share</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
