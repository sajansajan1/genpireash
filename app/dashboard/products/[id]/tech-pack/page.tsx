"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProductTechPack } from "@/components/product/product-tech-pack";
import { ArrowLeft, Download, Save, Send, RefreshCw, Plus, Trash2, CheckCircle, HelpCircle, Info } from "lucide-react";
import Link from "next/link";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function TechPackPage({ params }: { params: { id: string } }) {
  // This would normally be fetched from an API
  const [product, setProduct] = useState({
    id: params.id,
    name: "Custom Eco-Friendly Sneakers",
    status: "Spec Ready",
    description: "Minimalist sneakers made from recycled materials with custom sole design.",
    createdAt: "March 15, 2025",
    updatedAt: "March 28, 2025",
    image: "/placeholder.svg?height=400&width=600&text=Eco+Sneakers",
    techPack: {
      category: "Footwear",
      materials: [
        {
          name: "Recycled PET",
          reason: "Sustainable, durable, and provides structure to the upper",
          alternatives: ["Organic Cotton", "Hemp Blend"],
        },
        {
          name: "Natural Rubber",
          reason: "Eco-friendly sole material with excellent grip and durability",
          alternatives: ["Recycled Rubber", "Cork-Infused Rubber"],
        },
        {
          name: "Organic Cotton",
          reason: "Breathable lining with minimal environmental impact",
          alternatives: ["Bamboo Fabric", "Recycled Polyester"],
        },
      ],
      dimensions: {
        width: "4 inches (per size)",
        height: "3 inches (per size)",
        depth: "10 inches (per size)",
        weight: "0.9 lbs (per shoe)",
        soleThickness: "1.2 inches",
      },
      colorStyle: {
        primaryColors: ["Ocean Blue", "Forest Green", "Amber Yellow"],
        accentColors: ["White", "Black"],
        styleNotes:
          "Minimalist design with clean lines and subtle branding. Focus on texture contrast between materials.",
      },
      packaging:
        "Shoebox made from 100% recycled cardboard with soy-based inks. No plastic components. Includes cotton dust bag for storage and travel.",
      aiNotes:
        "This tech pack prioritizes sustainability while maintaining performance requirements for everyday footwear. Materials were selected for durability, comfort, and minimal environmental impact.",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const handleMaterialEdit = (index: number, value: string) => {
    const updatedProduct = { ...product };
    updatedProduct.techPack.materials[index].name = value;
    setProduct(updatedProduct);
  };

  const handleMaterialDelete = (index: number) => {
    const updatedProduct = { ...product };
    updatedProduct.techPack.materials.splice(index, 1);
    setProduct(updatedProduct);
  };

  const handleMaterialAdd = () => {
    const updatedProduct = { ...product };
    updatedProduct.techPack.materials.push({
      name: "New Material",
      reason: "Custom added material",
      alternatives: [],
    });
    setProduct(updatedProduct);
  };

  const handleDimensionEdit = (key: string, value: string) => {
    const updatedProduct = { ...product };
    updatedProduct.techPack.dimensions[key] = value;
    setProduct(updatedProduct);
  };

  const handleColorEdit = (type: string, index: number, value: string) => {
    const updatedProduct = { ...product };
    updatedProduct.techPack.colorStyle[type][index] = value;
    setProduct(updatedProduct);
  };

  const handleColorAdd = (type: string) => {
    const updatedProduct = { ...product };
    updatedProduct.techPack.colorStyle[type].push("New Color");
    setProduct(updatedProduct);
  };

  const handleColorDelete = (type: string, index: number) => {
    const updatedProduct = { ...product };
    updatedProduct.techPack.colorStyle[type].splice(index, 1);
    setProduct(updatedProduct);
  };

  const handlePackagingEdit = (value: string) => {
    const updatedProduct = { ...product };
    updatedProduct.techPack.packaging = value;
    setProduct(updatedProduct);
  };

  const handleNotesEdit = (value: string) => {
    const updatedProduct = { ...product };
    updatedProduct.techPack.aiNotes = value;
    setProduct(updatedProduct);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // In a real implementation, this would save to the database
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the last updated date
      const updatedProduct = { ...product };
      updatedProduct.updatedAt = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setProduct(updatedProduct);

      alert("Tech pack saved successfully!");
    } catch (error) {
      console.error("Error saving tech pack:", error);
      alert("Error saving tech pack");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: string) => {
    // In a real implementation, this would generate and download the file
    alert(`Tech pack would be downloaded as ${format}`);
  };

  const handleSendToSuppliers = () => {
    // In a real implementation, this would send to suppliers
    console.log("Sending tech pack to suppliers:", product.techPack);
    alert("Tech pack would be sent to suppliers");
  };

  const handleRegenerateSuggestions = (section: string) => {
    // In a real implementation, this would call the OpenAI API for the specific section
    alert(`Would regenerate suggestions for ${section}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="p-0">
              <Link href={`/dashboard/products/${product.id}`}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Product
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <h1 className={`text-3xl font-bold ${volkhov.className}`}>{product.name}</h1>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{product.status}</Badge>
          </div>
          <p className="text-[#1C1917] mt-1">Tech Pack • Last updated {product.updatedAt}</p>
        </div>
        <div className="flex gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <h4 className="font-medium">Download As</h4>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => handleDownload("pdf")}>
                    PDF Document
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => handleDownload("csv")}>
                    CSV (Raw Data)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => handleDownload("md")}>
                    Markdown
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="edit" className="flex-1">
            Edit Tech Pack
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">
            Preview
          </TabsTrigger>
          <TabsTrigger value="tech-spec" className="flex-1 relative">
            <span className="relative text-xs sm:text-sm">
              <span className="hidden sm:inline">Technical Specification File</span>
              <span className="sm:hidden">Tech Spec</span>
              <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1 py-0.5 rounded-full">
                Soon
              </Badge>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
          {/* Materials Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🧵</span> Materials
              </CardTitle>
              <CardDescription>Define the materials used in your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.techPack.materials.map((material, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Input
                        value={material.name}
                        onChange={(e) => handleMaterialEdit(index, e.target.value)}
                        className="font-medium border-none p-0 h-auto text-base focus-visible:ring-0"
                      />
                      <div className="flex items-center mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {material.reason.split(",")[0]}
                        </Badge>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                                <HelpCircle className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">{material.reason}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Alternatives
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Alternative Materials</h4>
                            <div className="space-y-1">
                              {material.alternatives.map((alt, altIndex) => (
                                <div key={altIndex} className="text-sm flex items-center justify-between">
                                  <span>{alt}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleMaterialEdit(index, alt)}
                                  >
                                    <ArrowLeft className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleMaterialDelete(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="flex items-center" onClick={handleMaterialAdd}>
                  <Plus className="h-4 w-4 mr-1" /> Add Material
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                  onClick={() => handleRegenerateSuggestions("materials")}
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dimensions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">📏</span> Dimensions & Sizes
              </CardTitle>
              <CardDescription>Define the physical dimensions of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.techPack.dimensions).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`dimension-${key}`} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Input
                      id={`dimension-${key}`}
                      value={value}
                      onChange={(e) => handleDimensionEdit(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm">
                  See Standard Size Chart
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                  onClick={() => handleRegenerateSuggestions("dimensions")}
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Color & Style Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🎨</span> Color & Style Direction
              </CardTitle>
              <CardDescription>Define the color palette and style direction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="mb-2 block">Primary Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.techPack.colorStyle.primaryColors.map((color, index) => (
                      <div key={index} className="flex items-center">
                        <Input
                          value={color}
                          onChange={(e) => handleColorEdit("primaryColors", index, e.target.value)}
                          className="w-32 mr-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleColorDelete("primaryColors", index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="h-9" onClick={() => handleColorAdd("primaryColors")}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Accent Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.techPack.colorStyle.accentColors.map((color, index) => (
                      <div key={index} className="flex items-center">
                        <Input
                          value={color}
                          onChange={(e) => handleColorEdit("accentColors", index, e.target.value)}
                          className="w-32 mr-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleColorDelete("accentColors", index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="h-9" onClick={() => handleColorAdd("accentColors")}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="style-notes">Style Notes</Label>
                  <Textarea
                    id="style-notes"
                    value={product.techPack.colorStyle.styleNotes}
                    onChange={(e) => {
                      const updatedProduct = { ...product };
                      updatedProduct.techPack.colorStyle.styleNotes = e.target.value;
                      setProduct(updatedProduct);
                    }}
                    className="min-h-20"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm">
                  Upload Color Reference
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                  onClick={() => handleRegenerateSuggestions("colorStyle")}
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Packaging Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">📦</span> Packaging Notes
              </CardTitle>
              <CardDescription>Define the packaging specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={product.techPack.packaging}
                onChange={(e) => handlePackagingEdit(e.target.value)}
                className="min-h-24"
              />

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                  onClick={() => handleRegenerateSuggestions("packaging")}
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">📄</span> AI Notes
              </CardTitle>
              <CardDescription>AI-generated notes and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={product.techPack.aiNotes}
                onChange={(e) => handleNotesEdit(e.target.value)}
                className="min-h-24"
              />

              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Info className="h-4 w-4 mr-1" /> Why this tech pack?
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                  onClick={() => handleRegenerateSuggestions("aiNotes")}
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("preview")}>
              Preview Tech Pack
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Draft"}
              </Button>
              <Button onClick={handleSendToSuppliers}>
                <Send className="h-4 w-4 mr-2" /> Send to Suppliers
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className={volkhov.className}>Tech Pack Preview</CardTitle>
              <CardDescription>This is how your tech pack will appear to suppliers and team members</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTechPack techPack={product.techPack} isPreview={false} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("edit")}>
                Back to Edit
              </Button>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <div className="space-y-2">
                      <h4 className="font-medium">Download As</h4>
                      <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => handleDownload("pdf")}>
                          PDF Document
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => handleDownload("csv")}>
                          CSV (Raw Data)
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => handleDownload("md")}>
                          Markdown
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Technical Specification File tab content with coming soon message */}
        <TabsContent value="tech-spec" className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg min-h-96">
              <div className="text-center p-4 sm:p-8 max-w-md mx-auto">
                <div className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 inline-block">
                  Coming Soon
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Technical Specification Files</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                  Advanced technical specification files with detailed construction diagrams, measurement charts, and
                  manufacturing guidelines are coming soon.
                </p>
                <div className="text-xs sm:text-sm text-gray-500">
                  This feature will include:
                  <ul className="mt-2 space-y-1 text-left">
                    <li>• Detailed technical drawings</li>
                    <li>• Measurement specifications</li>
                    <li>• Manufacturing guidelines</li>
                    <li>• Quality control standards</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="opacity-30 pointer-events-none min-h-96">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">Technical Files</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Downloadable specification documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-8 sm:h-10 bg-gray-100 rounded"></div>
                      <div className="h-8 sm:h-10 bg-gray-100 rounded"></div>
                      <div className="h-8 sm:h-10 bg-gray-100 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">Manufacturing Guidelines</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Step-by-step production instructions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-8 sm:h-10 bg-gray-100 rounded"></div>
                      <div className="h-8 sm:h-10 bg-gray-100 rounded"></div>
                      <div className="h-8 sm:h-10 bg-gray-100 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
