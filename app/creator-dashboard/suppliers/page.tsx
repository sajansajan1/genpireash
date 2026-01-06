"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MapPin, MessageSquare, ExternalLink, Check, X } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getAllSuppliers } from "@/lib/supabase/supplier";
import SuppliersLoading from "./loading";
import useSWR from "swr";
import { useUserStore } from "@/lib/zustand/useStore";
import { materialOptions } from "@/lib/types/manufacturing_capability";

const allCategories = materialOptions;

export default function SuppliersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [requestSuppliers, setrequestSuppliers] = useState<any[]>([]);
  const [matchRequested, setMatchRequested] = useState(false);

  const { creatorProfile } = useUserStore();

  const {
    data: suppliers,
    error: suppliersError,
    isLoading: loadingSuppliers,
  } = useSWR("suppliers-list", () => getAllSuppliers(), {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  if (loadingSuppliers || !suppliers) {
    return <SuppliersLoading />;
  }

  if (suppliersError) {
    return <div>Error loading Suppliers</div>;
  }
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setrequestSuppliers([]);
    setMatchRequested(false);
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.manufacturing.material_specialist.some((specialty: any) =>
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategories =
      selectedCategories.length === 0 ||
      supplier.manufacturing.material_specialist.some((specialty: any) => selectedCategories.includes(specialty));

    return matchesSearch && matchesCategories;
  });
  const matchSuppliersToCreator = () => {
    if (!creatorProfile?.categories) return;

    const matched = suppliers.filter((supplier) =>
      supplier?.manufacturing?.product_categories?.includes(creatorProfile.categories)
    );

    setrequestSuppliers(matched);
    setMatchRequested(true);
  };
  const viewSupplierProfile = (supplierId: string) => {
    router.push(`/creator-dashboard/suppliers/${supplierId}`);
  };

  const handleStartChat = (userId: string) => {
    router.push(`/creator-dashboard/messages?chatWith=${userId}`);
  };
  const displaySuppliers = matchRequested ? requestSuppliers : filteredSuppliers;
  console.log("displaySuppliers ==> ", requestSuppliers, filteredSuppliers);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
        <Button
          variant={matchRequested ? "ghost" : "outline"}
          size={matchRequested ? "sm" : "default"}
          onClick={matchRequested ? clearFilters : matchSuppliersToCreator}
          className={matchRequested ? "text-xs h-7 px-3" : ""}
        >
          {matchRequested ? "Clear Filters" : "Request Supplier Match"}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#1C1917]" />
          <Input
            placeholder="Search suppliers by name, location, or specialty..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Desktop Filter Dropdown */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="sm:w-auto w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={clearFilters}
                  disabled={selectedCategories.length === 0}
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Filter Sheet */}
        <div className="sm:hidden">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filter Suppliers</SheetTitle>
                <SheetDescription>Select categories to filter suppliers</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 py-4">
                {allCategories.map((category: any) => (
                  <div
                    key={category}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer border ${
                      selectedCategories.includes(category) ? "border-primary bg-primary/10" : "border-border"
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    <span>{category}</span>
                    {selectedCategories.includes(category) && <Check className="h-4 w-4 text-zinc-900" />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={clearFilters} disabled={selectedCategories.length === 0}>
                  Clear All
                </Button>
                <Button onClick={() => setIsFilterSheetOpen(false)}>Apply Filters</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filters display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-[#1C1917]">Active filters:</span>
          {selectedCategories.map((category) => (
            <Badge key={category} variant="outline" className="flex items-center gap-1">
              {category}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(category)} />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7 px-2">
            Clear all
          </Button>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Suppliers</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {displaySuppliers.length > 0 ? (
            <div className="flex flex-col gap-4">
              {displaySuppliers.map((supplier: any) => (
                <Card key={supplier.id} className="overflow-hidden">
                  <div className="p-4 flex flex-col gap-6 lg:flex-row lg:items-start">
                    {/* LEFT: Logo + Company Info */}
                    <div className="flex gap-4 w-full lg:w-1/4">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border bg-muted flex items-center justify-center">
                        {supplier.company_logo ? (
                          <Image
                            src={supplier.company_logo}
                            alt={`${supplier.company_name} logo`}
                            width={64} // match container size
                            height={64} // match container size
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-base sm:text-lg font-semibold text-[#1C1917]">
                            {supplier.company_name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg flex items-center gap-2 flex-wrap">
                          {supplier.company_name}
                          {supplier.verified_profile && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          )}
                        </h3>

                        <div className="flex items-center mt-1 text-[#1C1917] text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {supplier.location}
                        </div>
                      </div>
                    </div>

                    {/* SPECIALTIES */}
                    <div className="w-full lg:w-1/3">
                      <div className="text-sm font-medium mb-1">Specialties:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.manufacturing.material_specialist.map((specialty: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* ORDER DETAILS */}
                    <div className="grid grid-cols-2 gap-4 text-sm w-full sm:w-2/3 lg:w-1/5">
                      <div>
                        <span className="text-[#1C1917]">Min. Order:</span>
                        <p className="font-medium">{supplier.manufacturing.moq} units</p>
                      </div>
                      <div>
                        <span className="text-[#1C1917]">Lead Time:</span>
                        <p className="font-medium">
                          {supplier.manufacturing.leadTimeMin}-{supplier.manufacturing.leadTimeMax} weeks
                        </p>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleStartChat(supplier.user_id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => viewSupplierProfile(supplier.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-2 0H3m2-16l3 3m6 0l3-3"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Building Our Supplier Network</h3>
                  <p className="text-[#1C1917] mb-8">
                    We're curating a pool of vetted suppliers who can bring your creative ideas to life. Our network of
                    trusted manufacturers will help transform your concepts into real, tangible products.
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-lg font-medium">How Working with Suppliers on Genpire Works</h4>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Submit Your Request</h5>
                        <p className="text-sm text-[#1C1917]">
                          Share your tech pack or product idea with detailed specifications and requirements.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Get Matched & Receive Quotes</h5>
                        <p className="text-sm text-[#1C1917]">
                          Our vetted suppliers review your project and provide competitive quotes with timelines.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Choose & Start Production</h5>
                        <p className="text-sm text-[#1C1917]">
                          Select your preferred supplier and begin the manufacturing process with full support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="verified" className="mt-6">
          <div className="flex flex-col gap-4">
            {filteredSuppliers
              .filter((supplier) => supplier.verified_profile)
              .map((supplier) => (
                <Card key={supplier.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start p-4 gap-4">
                    {/* Logo and company info section */}
                    <div className="flex items-start gap-4 sm:w-1/4">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border bg-muted flex items-center justify-center">
                        {supplier.company_logo ? (
                          <Image
                            src={supplier.company_logo}
                            alt={`${supplier.company_name} logo`}
                            width={64} // match container size
                            height={64} // match container size
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-base sm:text-lg font-semibold text-[#1C1917]">
                            {supplier.company_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg flex flex-wrap items-center gap-2">
                          {supplier.company_name}
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Verified
                          </Badge>
                        </h3>
                        <div className="flex items-center mt-1 text-[#1C1917] text-sm">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {supplier.location}
                        </div>
                        {/* <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{supplier.rating}</span>
                    </div>
                    <span className="text-xs text-[#1C1917] ml-1.5">({supplier.reviewCount} reviews)</span>
                  </div> */}
                      </div>
                    </div>

                    {/* Specialties section */}
                    <div className="sm:w-1/3 mt-3 sm:mt-0">
                      <div className="text-sm font-medium mb-1">Specialties:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.manufacturing.material_specialist.map((specialty: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Order details section */}
                    <div className="grid grid-cols-2 gap-4 text-sm sm:w-1/6 mt-3 sm:mt-0">
                      <div>
                        <span className="text-[#1C1917]">Min. Order:</span>
                        <p className="font-medium">{supplier.manufacturing.moq} units</p>
                      </div>
                      <div>
                        <span className="text-[#1C1917]">Lead Time:</span>
                        <p className="font-medium">
                          {supplier.manufacturing.leadTimeMin}-{supplier.manufacturing.leadTimeMax} weeks
                        </p>
                      </div>
                    </div>

                    {/* Action buttons section */}
                    <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-auto">
                      <Button variant="outline" size="sm" onClick={() => handleStartChat(supplier.user_id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => viewSupplierProfile(supplier.id)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
