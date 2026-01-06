import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

interface ProductSpecificationProps {
  product: any;
}

export function ProductSpecification({ product }: ProductSpecificationProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold `}>Product Specification</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tech-drawing" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tech-drawing">Tech Drawing</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="size-chart">Size Chart</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="packaging">Packaging</TabsTrigger>
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
                  <h3 className={`text-lg font-semibold mb-4 `}>Technical Specifications</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Construction</h4>
                      <p className="text-sm text-[#1C1917]">
                        Vulcanized construction with stitched upper and glued sole. Reinforced toe cap and heel counter.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Upper</h4>
                      <p className="text-sm text-[#1C1917]">
                        Recycled PET fabric (equivalent to 6 plastic bottles per pair) with organic cotton lining.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Sole</h4>
                      <p className="text-sm text-[#1C1917]">
                        Natural rubber outsole with custom tread pattern for improved grip. 8mm heel drop.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Laces</h4>
                      <p className="text-sm text-[#1C1917]">Organic cotton laces with recycled plastic aglets.</p>
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
              <h3 className={`text-lg font-semibold mb-4 `}>Material List</h3>
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
                  <TableRow>
                    <TableCell className="font-medium">Upper</TableCell>
                    <TableCell>Recycled PET Fabric</TableCell>
                    <TableCell>EcoTextiles, Repreve</TableCell>
                    <TableCell>100% Recycled</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lining</TableCell>
                    <TableCell>Organic Cotton</TableCell>
                    <TableCell>OrganicSource, EcoFabric</TableCell>
                    <TableCell>GOTS Certified</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Outsole</TableCell>
                    <TableCell>Natural Rubber</TableCell>
                    <TableCell>EcoRubber, NatureSole</TableCell>
                    <TableCell>FSC Certified</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Insole</TableCell>
                    <TableCell>Cork + Recycled Foam</TableCell>
                    <TableCell>CorkSupply, EcoFoam</TableCell>
                    <TableCell>Biodegradable</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Laces</TableCell>
                    <TableCell>Organic Cotton</TableCell>
                    <TableCell>LaceWell, EcoLace</TableCell>
                    <TableCell>GOTS Certified</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Material Notes</h4>
                <p className="text-sm text-[#1C1917]">
                  All materials are selected for durability and environmental impact. The combination of recycled PET
                  and natural rubber provides excellent durability while minimizing virgin material use. The product is
                  designed for eventual recycling at end-of-life.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="size-chart" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className={`text-lg font-semibold mb-4 `}>Size Chart</h3>
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
                  <TableRow>
                    <TableCell className="font-medium">US 6</TableCell>
                    <TableCell>EU 39</TableCell>
                    <TableCell>UK 5.5</TableCell>
                    <TableCell>23.5</TableCell>
                    <TableCell>9.2</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">US 7</TableCell>
                    <TableCell>EU 40</TableCell>
                    <TableCell>UK 6.5</TableCell>
                    <TableCell>24.1</TableCell>
                    <TableCell>9.4</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">US 8</TableCell>
                    <TableCell>EU 41</TableCell>
                    <TableCell>UK 7.5</TableCell>
                    <TableCell>24.8</TableCell>
                    <TableCell>9.6</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">US 9</TableCell>
                    <TableCell>EU 42</TableCell>
                    <TableCell>UK 8.5</TableCell>
                    <TableCell>25.4</TableCell>
                    <TableCell>9.8</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">US 10</TableCell>
                    <TableCell>EU 43</TableCell>
                    <TableCell>UK 9.5</TableCell>
                    <TableCell>26.0</TableCell>
                    <TableCell>10.0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">US 11</TableCell>
                    <TableCell>EU 44</TableCell>
                    <TableCell>UK 10.5</TableCell>
                    <TableCell>26.7</TableCell>
                    <TableCell>10.2</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">US 12</TableCell>
                    <TableCell>EU 45</TableCell>
                    <TableCell>UK 11.5</TableCell>
                    <TableCell>27.3</TableCell>
                    <TableCell>10.4</TableCell>
                  </TableRow>
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
              <h3 className={`text-lg font-semibold mb-4 `}>Color Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Ocean Blue", hex: "#3B82F6", pantone: "2718 C", components: "Upper, Laces" },
                  { name: "Eco Green", hex: "#10B981", pantone: "3405 C", components: "Sole, Accents" },
                  { name: "Sunrise Yellow", hex: "#F59E0B", pantone: "1235 C", components: "Logo, Stitching" },
                ].map((color, index) => (
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
                  specified Pantone colors. The colors are designed to be fade-resistant with minimal color transfer.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packaging" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className={`text-lg font-semibold mb-4 `}>Packaging Specifications</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="bg-muted aspect-video rounded-lg flex items-center justify-center mb-4">
                    <img
                      src="/placeholder.svg?height=300&width=400&text=Packaging+Design"
                      alt="Packaging Design"
                      className="max-h-full"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Packaging Materials</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium w-32">Box:</span>
                      <span>100% recycled cardboard, FSC certified</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-32">Tissue Paper:</span>
                      <span>Acid-free recycled paper</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-32">Ink:</span>
                      <span>Soy-based, low VOC</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-32">Tape:</span>
                      <span>Paper-based, water-activated</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-32">Dimensions:</span>
                      <span>30cm × 20cm × 12cm</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-32">Weight:</span>
                      <span>350g (packaging only)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Packaging Notes</h4>
                <p className="text-sm text-[#1C1917] mb-4">
                  The packaging is designed to be minimal, plastic-free, and fully recyclable. The box uses a tab-lock
                  design that requires no glue or tape for assembly. The packaging includes instructions for proper
                  recycling.
                </p>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Branding Elements</h4>
                  <p className="text-sm text-[#1C1917]">
                    The box features the Genpire logo embossed on the top with minimal color printing. Inside, a thank
                    you card with product care instructions is included. All packaging materials are designed to align
                    with the eco-friendly brand values.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
