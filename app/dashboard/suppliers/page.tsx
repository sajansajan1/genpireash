import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Search, Filter, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function SuppliersPage() {
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
    {
      id: "4",
      name: "EcoStep Manufacturers",
      location: "Indonesia",
      region: "Asia",
      rating: 4.5,
      reviewCount: 41,
      minOrderQuantity: 1000,
      leadTime: "4-5 weeks",
      specialties: ["Mass Production", "Footwear", "Competitive Pricing"],
      certifications: ["ISO 9001", "BSCI"],
      image: "/placeholder.svg?height=100&width=100&text=ESM",
    },
    {
      id: "5",
      name: "Artisan Footwear Collective",
      location: "Italy",
      region: "Europe",
      rating: 4.9,
      reviewCount: 29,
      minOrderQuantity: 100,
      leadTime: "3-4 weeks",
      specialties: ["Handcrafted", "Premium", "Custom Details"],
      certifications: ["Made in Italy", "Artisan Guild"],
      image: "/placeholder.svg?height=100&width=100&text=AFC",
    },
    {
      id: "6",
      name: "Textile Innovations Ltd",
      location: "India",
      region: "Asia",
      rating: 4.7,
      reviewCount: 63,
      minOrderQuantity: 400,
      leadTime: "3-4 weeks",
      specialties: ["Technical Fabrics", "Apparel", "Innovative Materials"],
      certifications: ["Oeko-Tex", "ISO 9001"],
      image: "/placeholder.svg?height=100&width=100&text=TIL",
    },
  ];

  return (
    <div className="animate-fade-in p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${volkhov.className}`}>Supplier Network</h1>
          <p className="text-[#1C1917] mt-1">Find and connect with verified suppliers for your products.</p>
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

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Suppliers</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="eco">Eco-Friendly</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
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
        </TabsContent>

        <TabsContent value="verified" className="mt-0">
          <div className="space-y-4">
            {suppliers
              .filter((s) => s.certifications.some((c) => c === "ISO 9001" || c === "ISO 14001"))
              .map((supplier) => (
                <Card key={supplier.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Same card content as above */}
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
        </TabsContent>

        <TabsContent value="eco" className="mt-0">
          <div className="space-y-4">
            {suppliers
              .filter(
                (s) =>
                  s.specialties.some((spec) => spec === "Eco-friendly" || spec === "Sustainable") ||
                  s.certifications.some((cert) => cert === "GOTS" || cert === "Carbon Neutral")
              )
              .map((supplier) => (
                <Card key={supplier.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Same card content as above */}
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
        </TabsContent>

        <TabsContent value="premium" className="mt-0">
          <div className="space-y-4">
            {suppliers
              .filter(
                (s) =>
                  s.specialties.some(
                    (spec) => spec === "Premium" || spec === "Premium Quality" || spec === "Handcrafted"
                  ) || s.certifications.some((cert) => cert === "Made in Italy" || cert === "Artisan Guild")
              )
              .map((supplier) => (
                <Card key={supplier.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Same card content as above */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
