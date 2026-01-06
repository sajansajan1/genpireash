"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Filter, MapPin, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

interface SupplierMatchingSectionProps {
  productId: string;
}

export function SupplierMatchingSection({ productId }: SupplierMatchingSectionProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [minOrderQuantity, setMinOrderQuantity] = useState<number[]>([500]);
  const [leadTime, setLeadTime] = useState<string>("all");

  // Sample supplier data
  const suppliers = [
    {
      id: "1",
      name: "EcoFabric Manufacturing",
      location: "Vietnam",
      region: "asia",
      rating: 4.8,
      minOrderQuantity: 300,
      samplePrice: "$120",
      leadTime: "2-3 weeks",
      specialties: ["Eco-friendly", "Footwear", "Recycled Materials"],
      certifications: ["GOTS", "Fair Trade"],
    },
    {
      id: "2",
      name: "GreenStep Productions",
      location: "Portugal",
      region: "europe",
      rating: 4.9,
      minOrderQuantity: 200,
      samplePrice: "$150",
      leadTime: "3-4 weeks",
      specialties: ["Sustainable", "Premium Quality", "Small Batches"],
      certifications: ["B Corp", "ISO 14001"],
    },
    {
      id: "3",
      name: "Sustainable Soles Inc.",
      location: "Mexico",
      region: "americas",
      rating: 4.6,
      minOrderQuantity: 500,
      samplePrice: "$95",
      leadTime: "2-3 weeks",
      specialties: ["Footwear", "Natural Materials", "Vegan"],
      certifications: ["PETA-Approved", "Carbon Neutral"],
    },
    {
      id: "4",
      name: "EcoStep Manufacturers",
      location: "Indonesia",
      region: "asia",
      rating: 4.5,
      minOrderQuantity: 1000,
      samplePrice: "$85",
      leadTime: "4-5 weeks",
      specialties: ["Mass Production", "Footwear", "Competitive Pricing"],
      certifications: ["ISO 9001", "BSCI"],
    },
    {
      id: "5",
      name: "Artisan Footwear Collective",
      location: "Italy",
      region: "europe",
      rating: 4.9,
      minOrderQuantity: 100,
      samplePrice: "$200",
      leadTime: "3-4 weeks",
      specialties: ["Handcrafted", "Premium", "Custom Details"],
      certifications: ["Made in Italy", "Artisan Guild"],
    },
  ];

  // Filter suppliers based on selected filters
  const filteredSuppliers = suppliers.filter((supplier) => {
    if (selectedRegion !== "all" && supplier.region !== selectedRegion) return false;
    if (supplier.minOrderQuantity > minOrderQuantity[0]) return false;
    if (leadTime !== "all") {
      const weeks = Number.parseInt(supplier.leadTime.split("-")[0]);
      if (leadTime === "1-2" && weeks > 2) return false;
      if (leadTime === "3-4" && (weeks < 3 || weeks > 4)) return false;
      if (leadTime === "5+" && weeks < 5) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold `}>Supplier Matching</h2>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" /> Filter Options
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Region</label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="americas">Americas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Min. Order Quantity (Max)</label>
          <div className="pt-4 px-1">
            <Slider defaultValue={[500]} max={1000} step={100} onValueChange={setMinOrderQuantity} />
            <div className="text-sm text-[#1C1917] mt-2">Up to {minOrderQuantity[0]} units</div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Lead Time</label>
          <Select value={leadTime} onValueChange={setLeadTime}>
            <SelectTrigger>
              <SelectValue placeholder="Any Lead Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Lead Time</SelectItem>
              <SelectItem value="1-2">1-2 Weeks</SelectItem>
              <SelectItem value="3-4">3-4 Weeks</SelectItem>
              <SelectItem value="5+">5+ Weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold `}>Matched Suppliers ({filteredSuppliers.length})</h3>
          <Select defaultValue="rating">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Sort by Rating</SelectItem>
              <SelectItem value="price">Sort by Sample Price</SelectItem>
              <SelectItem value="moq">Sort by Min. Order</SelectItem>
              <SelectItem value="leadTime">Sort by Lead Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-[#1C1917]">No suppliers match your current filters. Try adjusting your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-4">
                    <div className="p-6 md:border-r">
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
                        <span className="text-xs text-[#1C1917] ml-2">(48 reviews)</span>
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
                          <div className="text-sm text-[#1C1917] mb-1">Sample Price</div>
                          <div className="font-semibold">{supplier.samplePrice}</div>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col justify-between border-t md:border-t-0 md:border-r">
                        <div>
                          <div className="text-sm text-[#1C1917] mb-1">Lead Time</div>
                          <div className="font-semibold">{supplier.leadTime}</div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm text-[#1C1917] mb-1">Production Capacity</div>
                          <div className="font-semibold">5,000 units/month</div>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col justify-between border-t md:border-t-0">
                        <div className="text-sm text-[#1C1917] mb-4">
                          This supplier is a good match for your eco-friendly sneaker specifications.
                        </div>
                        <div className="mt-auto">
                          <Button className="w-full">
                            <Check className="mr-2 h-4 w-4" /> Request Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
