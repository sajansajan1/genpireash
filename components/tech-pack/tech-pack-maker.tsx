"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, MessageSquare, Download, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TechPackSection } from "./tech-pack-section";
import { mockTechPackData } from "./mock-tech-pack-data";

export function TechPackMaker() {
  const [productIdea, setProductIdea] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [techPackData, setTechPackData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerateTechPack = () => {
    setIsGenerating(true);
    // Simulate API call with timeout
    setTimeout(() => {
      setTechPackData(mockTechPackData);
      setIsGenerating(false);
    }, 2000);
  };

  const handleUpdateSection = (sectionId: string, newContent: any) => {
    if (!techPackData) return;

    setTechPackData({
      ...techPackData,
      [sectionId]: {
        ...techPackData[sectionId],
        ...newContent,
      },
    });
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">Tech Pack Maker</h1>

      {/* Prompt Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="product-idea" className="block text-sm font-medium mb-1">
                Describe your product idea
              </label>
              <Textarea
                id="product-idea"
                placeholder="e.g., A canvas tote bag with leather straps and an inner pocket for a laptop"
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label htmlFor="reference-image" className="block text-sm font-medium mb-1">
                Upload reference image (optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors",
                      filePreview ? "border-primary" : "border-border"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {filePreview ? (
                      <div className="relative">
                        <img
                          src={filePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-h-[200px] mx-auto rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-[#1C1917]" />
                        <p className="text-sm text-[#1C1917]">
                          Click to upload or drag and drop
                          <br />
                          JPG, PNG, or PDF (max 10MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      id="reference-image"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Button
                onClick={handleGenerateTechPack}
                disabled={!productIdea.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Tech Pack...
                  </>
                ) : (
                  "Generate Tech Pack"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Pack Components */}
      {isGenerating && (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded-md w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded-md w-full"></div>
                  <div className="h-4 bg-muted rounded-md w-5/6"></div>
                  <div className="h-4 bg-muted rounded-md w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {techPackData && !isGenerating && (
        <div className="space-y-6">
          {/* Product Image */}
          <TechPackSection
            title="Product Image"
            content={techPackData.productImage}
            onUpdate={(content) => handleUpdateSection("productImage", content)}
            renderContent={(content, isUpdating) => (
              <div className="flex flex-col items-center">
                <div className={cn("relative rounded-md overflow-hidden", isUpdating && "opacity-50")}>
                  <img
                    src={content.url || "/placeholder.svg?height=300&width=400&text=Product+Image"}
                    alt="Product"
                    className="max-h-[300px] object-contain"
                  />
                </div>
                <p className="text-sm text-[#1C1917] mt-2">{content.description}</p>
              </div>
            )}
          />

          {/* Category */}
          <TechPackSection
            title="Category"
            content={techPackData.category}
            onUpdate={(content) => handleUpdateSection("category", content)}
            renderContent={(content, isUpdating) => (
              <div className={cn("space-y-2", isUpdating && "opacity-50")}>
                <div className="flex flex-wrap gap-2">
                  {content.primary && (
                    <Badge variant="default" className="text-sm">
                      {content.primary}
                    </Badge>
                  )}
                  {content.subcategories?.map((subcategory: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {subcategory}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-[#1C1917]">{content.description}</p>
              </div>
            )}
          />

          {/* Materials */}
          <TechPackSection
            title="Materials"
            content={techPackData.materials}
            onUpdate={(content) => handleUpdateSection("materials", content)}
            renderContent={(content, isUpdating) => (
              <div className={cn("space-y-4", isUpdating && "opacity-50")}>
                <ul className="space-y-3">
                  {content.items?.map((material: any, i: number) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-1">
                        <p className="font-medium">{material.name}</p>
                        <p className="text-sm text-[#1C1917]">{material.description}</p>
                      </div>
                      <Badge variant="outline" className="ml-2 whitespace-nowrap">
                        {material.percentage}%
                      </Badge>
                    </li>
                  ))}
                </ul>
                <div>
                  <h4 className="text-sm font-medium mb-1">Sustainability</h4>
                  <p className="text-sm text-[#1C1917]">{content.sustainability}</p>
                </div>
              </div>
            )}
          />

          {/* Dimensions */}
          <TechPackSection
            title="Dimensions"
            content={techPackData.dimensions}
            onUpdate={(content) => handleUpdateSection("dimensions", content)}
            renderContent={(content, isUpdating) => (
              <div className={cn("space-y-4", isUpdating && "opacity-50")}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {content.measurements?.map((measurement: any, i: number) => (
                    <div key={i} className="border rounded-md p-3">
                      <p className="text-sm font-medium">{measurement.name}</p>
                      <p className="text-lg font-semibold">{measurement.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#1C1917]">{content.notes}</p>
              </div>
            )}
          />

          {/* Packaging */}
          <TechPackSection
            title="Packaging"
            content={techPackData.packaging}
            onUpdate={(content) => handleUpdateSection("packaging", content)}
            renderContent={(content, isUpdating) => (
              <div className={cn("space-y-3", isUpdating && "opacity-50")}>
                <p className="text-sm">{content.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Materials</h4>
                    <ul className="text-sm space-y-1">
                      {content.materials?.map((material: string, i: number) => (
                        <li key={i}>{material}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Dimensions</h4>
                    <p className="text-sm">{content.dimensions}</p>
                  </div>
                </div>
              </div>
            )}
          />

          {/* Colors */}
          <TechPackSection
            title="Colors"
            content={techPackData.colors}
            onUpdate={(content) => handleUpdateSection("colors", content)}
            renderContent={(content, isUpdating) => (
              <div className={cn("space-y-4", isUpdating && "opacity-50")}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {content.palette?.map((color: any, i: number) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full border" style={{ backgroundColor: color.hex }}></div>
                      <p className="text-sm font-medium mt-2">{color.name}</p>
                      <p className="text-xs text-[#1C1917]">{color.hex}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Color Notes</h4>
                  <p className="text-sm text-[#1C1917]">{content.notes}</p>
                </div>
              </div>
            )}
          />

          {/* Size Range */}
          <TechPackSection
            title="Size Range"
            content={techPackData.sizeRange}
            onUpdate={(content) => handleUpdateSection("sizeRange", content)}
            renderContent={(content, isUpdating) => (
              <div className={cn("space-y-4", isUpdating && "opacity-50")}>
                <div className="flex flex-wrap gap-2">
                  {content.sizes?.map((size: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {size}
                    </Badge>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Sizing Notes</h4>
                  <p className="text-sm text-[#1C1917]">{content.notes}</p>
                </div>
              </div>
            )}
          />

          {/* Style Notes */}
          <TechPackSection
            title="Style Notes"
            content={techPackData.styleNotes}
            onUpdate={(content) => handleUpdateSection("styleNotes", content)}
            renderContent={(content, isUpdating) => (
              <div className={cn("space-y-3", isUpdating && "opacity-50")}>
                <p className="text-sm">{content.description}</p>
                <ul className="space-y-2">
                  {content.points?.map((point: string, i: number) => (
                    <li key={i} className="text-sm flex items-start">
                      <span className="mr-2">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          />

          {/* Alternate Designs */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">More Sample Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {techPackData.alternateDesigns?.images.map((image: any, i: number) => (
                  <div key={i} className="border rounded-md overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg?height=200&width=200&text=Sample+Image"}
                      alt={`Sample ${i + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-sm font-medium">{image.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Suggest Another Sample Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save/Export */}
          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Tech Pack
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
