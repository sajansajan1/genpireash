"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, Share2, MessageSquare, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

interface ProductTechPackProps {
  productType: string;
  sampleId: string;
  customizationOptions: any;
}

export function ProductTechPack({ productType, sampleId, customizationOptions }: ProductTechPackProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  // This would be fetched based on the selected sample
  const sampleData = {
    id: sampleId,
    name: "Eco Runner",
    description: "Minimalist design with recycled materials and breathable mesh panels",
    image: "/placeholder.svg?height=400&width=600&text=Eco+Runner",
    sustainability: "Very High",
    priceEstimate: "$80-100",
    features: ["Recycled PET upper", "Natural rubber sole", "Breathable mesh", "Water resistant"],
    materials: [
      { component: "Upper", material: "Recycled PET Fabric", supplier: "EcoTextiles, Repreve" },
      { component: "Lining", material: "Organic Cotton", supplier: "OrganicSource, EcoFabric" },
      { component: "Outsole", material: "Natural Rubber", supplier: "EcoRubber, NatureSole" },
      { component: "Insole", material: "Cork + Recycled Foam", supplier: "CorkSupply, EcoFoam" },
      { component: "Laces", material: "Organic Cotton", supplier: "LaceWell, EcoLace" },
    ],
    sizes: [
      { us: "US 6", eu: "EU 39", uk: "UK 5.5", length: "23.5 cm", width: "9.2 cm" },
      { us: "US 7", eu: "EU 40", uk: "UK 6.5", length: "24.1 cm", width: "9.4 cm" },
      { us: "US 8", eu: "EU 41", uk: "UK 7.5", length: "24.8 cm", width: "9.6 cm" },
      { us: "US 9", eu: "EU 42", uk: "UK 8.5", length: "25.4 cm", width: "9.8 cm" },
      { us: "US 10", eu: "EU 43", uk: "UK 9.5", length: "26.0 cm", width: "10.0 cm" },
      { us: "US 11", eu: "EU 44", uk: "UK 10.5", length: "26.7 cm", width: "10.2 cm" },
      { us: "US 12", eu: "EU 45", uk: "UK 11.5", length: "27.3 cm", width: "10.4 cm" },
    ],
    colors: [
      { name: "Ocean Blue", hex: "#3B82F6", pantone: "2718 C", components: "Upper, Laces" },
      { name: "Eco Green", hex: "#10B981", pantone: "3405 C", components: "Sole, Accents" },
      { name: "Sunrise Yellow", hex: "#F59E0B", pantone: "1235 C", components: "Logo, Stitching" },
    ],
    packaging: {
      box: "100% recycled cardboard, FSC certified",
      tissue: "Acid-free recycled paper",
      ink: "Soy-based, low VOC",
      tape: "Paper-based, water-activated",
      dimensions: "30cm × 20cm × 12cm",
      weight: "350g (packaging only)",
    },
    construction: {
      method: "Vulcanized construction with stitched upper and glued sole",
      details: "Reinforced toe cap and heel counter",
      stitching: "Double-stitched seams for durability",
      assembly: "Eco-friendly water-based adhesives",
    },
  };

  // Sample suppliers that could produce this product
  const suppliers = [
    {
      id: "supplier1",
      name: "EcoFabric Manufacturing",
      location: "Vietnam",
      rating: 4.8,
      minOrderQuantity: 300,
      samplePrice: "$120",
      leadTime: "2-3 weeks",
      specialties: ["Eco-friendly", "Footwear", "Recycled Materials"],
      certifications: ["GOTS", "Fair Trade"],
    },
    {
      id: "supplier2",
      name: "GreenStep Productions",
      location: "Portugal",
      rating: 4.9,
      minOrderQuantity: 200,
      samplePrice: "$150",
      leadTime: "3-4 weeks",
      specialties: ["Sustainable", "Premium Quality", "Small Batches"],
      certifications: ["B Corp", "ISO 14001"],
    },
    {
      id: "supplier3",
      name: "Sustainable Soles Inc.",
      location: "Mexico",
      rating: 4.6,
      minOrderQuantity: 500,
      samplePrice: "$95",
      leadTime: "2-3 weeks",
      specialties: ["Footwear", "Natural Materials", "Vegan"],
      certifications: ["PETA-Approved", "Carbon Neutral"],
    },
  ];

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId]
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-2xl font-semibold mb-2 ${volkhov.className}`}>Technical Specification</h2>
        <p className="text-[#1C1917]">
          Complete technical details for your {productType}. Review the specification and request quotes from suppliers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <Card>
            <div className="aspect-square overflow-hidden rounded-t-lg">
              <img
                src={sampleData.image || "/placeholder.svg"}
                alt={sampleData.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">{sampleData.name}</h2>
              <p className="text-[#1C1917] mb-4">{sampleData.description}</p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[#1C1917] mb-1">Sustainability</h3>
                  <Badge variant="outline">{sampleData.sustainability}</Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#1C1917] mb-1">Price Estimate</h3>
                  <div>{sampleData.priceEstimate} per unit</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#1C1917] mb-1">Key Features</h3>
                  <ul className="space-y-1">
                    {sampleData.features.map((feature, index) => (
                      <li key={index} className="text-sm">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="tech-drawing" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="tech-drawing">Tech Drawing</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="size-chart">Size Chart</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="construction">Construction</TabsTrigger>
            </TabsList>

            <TabsContent value="tech-drawing" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-muted w-full aspect-video rounded-lg flex items-center justify-center mb-6">
                      <img
                        src="/placeholder.svg?height=400&width=600&text=Technical+Drawing"
                        alt="Technical Drawing"
                        className="max-h-full"
                      />
                    </div>
                    <div className="w-full max-w-3xl">
                      <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium">Construction</h4>
                          <p className="text-sm text-[#1C1917]">
                            {sampleData.construction.method}. {sampleData.construction.details}.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Assembly</h4>
                          <p className="text-sm text-[#1C1917]">
                            {sampleData.construction.stitching}. {sampleData.construction.assembly}.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Dimensions</h4>
                          <p className="text-sm text-[#1C1917]">
                            Standard sizing with 8mm heel drop. See size chart for detailed measurements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Material List</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Supplier Options</TableHead>
                        <TableHead>Sustainability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleData.materials.map((material, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{material.component}</TableCell>
                          <TableCell>{material.material}</TableCell>
                          <TableCell>{material.supplier}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {index % 2 === 0 ? "High" : index % 3 === 0 ? "Very High" : "Medium"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Material Notes</h4>
                    <p className="text-sm text-[#1C1917]">
                      All materials are selected for durability and environmental impact. The combination of recycled
                      PET and natural rubber provides excellent durability while minimizing virgin material use. The
                      product is designed for eventual recycling at end-of-life.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="size-chart" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Size Chart</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>US Size</TableHead>
                        <TableHead>EU Size</TableHead>
                        <TableHead>UK Size</TableHead>
                        <TableHead>Foot Length (cm)</TableHead>
                        <TableHead>Foot Width (cm)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleData.sizes.map((size, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{size.us}</TableCell>
                          <TableCell>{size.eu}</TableCell>
                          <TableCell>{size.uk}</TableCell>
                          <TableCell>{size.length}</TableCell>
                          <TableCell>{size.width}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Sizing Notes</h4>
                    <p className="text-sm text-[#1C1917]">
                      The sneakers run true to size. For wider feet, we recommend going up half a size. The shoes will
                      stretch slightly with wear due to the natural materials used.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Color Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sampleData.colors.map((color, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="h-32 w-full" style={{ backgroundColor: color.hex }}></div>
                        <div className="p-4">
                          <h4 className="font-medium">{color.name}</h4>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#1C1917]">HEX:</span>
                              <span>{color.hex}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#1C1917]">Pantone:</span>
                              <span>{color.pantone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#1C1917]">Used in:</span>
                              <span>{color.components}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Color Notes</h4>
                    <p className="text-sm text-[#1C1917]">
                      All dyes used are low-impact and OEKO-TEX certified. Color matching should be within ΔE 1.0 of the
                      specified Pantone colors. The colors are designed to be fade-resistant with minimal color
                      transfer.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="construction" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Construction Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="bg-muted aspect-video rounded-lg flex items-center justify-center mb-4">
                        <img
                          src="/placeholder.svg?height=300&width=400&text=Construction+Details"
                          alt="Construction Details"
                          className="max-h-full"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Assembly Method</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="font-medium w-32">Construction:</span>
                          <span>{sampleData.construction.method}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium w-32">Reinforcement:</span>
                          <span>{sampleData.construction.details}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium w-32">Stitching:</span>
                          <span>{sampleData.construction.stitching}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium w-32">Adhesives:</span>
                          <span>{sampleData.construction.assembly}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h4 className="text-sm font-medium mb-2">Packaging Specifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="font-medium w-32">Box:</span>
                            <span>{sampleData.packaging.box}</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium w-32">Tissue Paper:</span>
                            <span>{sampleData.packaging.tissue}</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium w-32">Ink:</span>
                            <span>{sampleData.packaging.ink}</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="font-medium w-32">Tape:</span>
                            <span>{sampleData.packaging.tape}</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium w-32">Dimensions:</span>
                            <span>{sampleData.packaging.dimensions}</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium w-32">Weight:</span>
                            <span>{sampleData.packaging.weight}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="mb-6">
        <h3 className={`text-xl font-semibold mb-2 ${volkhov.className}`}>Request Quotes from Suppliers</h3>
        <p className="text-[#1C1917]">
          Select suppliers to request quotes for your {productType}. You can customize your request for each supplier.
        </p>
      </div>

      <div className="space-y-4">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-4">
                <div className="p-6 md:border-r">
                  <div className="flex items-center gap-2 mb-1">
                    <Checkbox
                      id={`supplier-${supplier.id}`}
                      checked={selectedSuppliers.includes(supplier.id)}
                      onCheckedChange={() => toggleSupplier(supplier.id)}
                    />
                    <h3 className="font-semibold text-lg">{supplier.name}</h3>
                  </div>
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
                      This supplier is a good match for your {productType} specifications.
                    </div>
                    <div className="mt-auto flex gap-2">
                      <Button
                        className="w-full"
                        variant={selectedSuppliers.includes(supplier.id) ? "default" : "outline"}
                        onClick={() => toggleSupplier(supplier.id)}
                      >
                        {selectedSuppliers.includes(supplier.id) ? "Selected" : "Select"}
                      </Button>
                      <Button variant="outline" size="icon">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" disabled={selectedSuppliers.length === 0}>
          Request Quotes from {selectedSuppliers.length} Supplier{selectedSuppliers.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}

function Checkbox({ id, checked, onCheckedChange }: { id: string; checked: boolean; onCheckedChange: () => void }) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onCheckedChange}
        className="h-4 w-4 rounded border-gray-300 text-zinc-900 focus:ring-primary"
      />
    </div>
  );
}

function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
