"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Package, RotateCw, Palette, Ruler, Layers } from "lucide-react";
import Image from "next/image";

interface ExtractedFeatures {
  colors: Array<{ hex: string; name: string; usage: string }>;
  estimatedDimensions: { width: string; height: string; depth?: string };
  materials: string[];
  keyElements: string[];
  description: string;
}

interface ViewsDisplayProps {
  frontView: string;
  backView: string;
  sideView: string;
  extractedFeatures?: ExtractedFeatures;
}

export function ViewsDisplay({ frontView, backView, sideView, extractedFeatures }: ViewsDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Product Views */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="front" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="front" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Front
              </TabsTrigger>
              <TabsTrigger value="back" className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                Back
              </TabsTrigger>
              <TabsTrigger value="side" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Side
              </TabsTrigger>
            </TabsList>

            <TabsContent value="front" className="mt-4">
              <div className="relative aspect-square w-full max-w-lg mx-auto rounded-lg overflow-hidden bg-gray-50 border">
                <Image src={frontView} alt="Product Front View" fill className="object-contain" priority />
              </div>
            </TabsContent>

            <TabsContent value="back" className="mt-4">
              <div className="relative aspect-square w-full max-w-lg mx-auto rounded-lg overflow-hidden bg-gray-50 border">
                <Image src={backView} alt="Product Back View" fill className="object-contain" />
              </div>
            </TabsContent>

            <TabsContent value="side" className="mt-4">
              <div className="relative aspect-square w-full max-w-lg mx-auto rounded-lg overflow-hidden bg-gray-50 border">
                <Image src={sideView} alt="Product Side View" fill className="object-contain" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Extracted Features */}
      {extractedFeatures && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Colors */}
            {extractedFeatures.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4" />
                  Colors
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedFeatures.colors.map((color, index) => {
                    // Handle both string and object colors
                    const isColorObject = typeof color === "object" && color !== null;
                    const colorHex = isColorObject && color.hex ? color.hex : "#888888";
                    const colorName =
                      isColorObject && color.name ? color.name : typeof color === "string" ? color : "Unknown";
                    const colorUsage = isColorObject ? color.usage : undefined;

                    return (
                      <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: colorHex }} />
                        <span className="text-sm">
                          {colorName}
                          {colorUsage && <span className="text-[#1C1917] ml-1">({colorUsage})</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Materials */}
            {extractedFeatures.materials.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Layers className="h-4 w-4" />
                  Materials
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedFeatures.materials.map((material, index) => {
                    // Handle both string and object materials
                    const materialText =
                      typeof material === "string"
                        ? material
                        : material.material
                        ? `${material.material}${material.texture ? ` - ${material.texture}` : ""}`
                        : JSON.stringify(material);

                    return (
                      <Badge key={index} variant="secondary">
                        {materialText}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dimensions */}
            {extractedFeatures.estimatedDimensions && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Ruler className="h-4 w-4" />
                  Estimated Dimensions
                </div>
                <div className="text-sm text-[#1C1917]">
                  <span className="font-medium">Width:</span> {extractedFeatures.estimatedDimensions.width} |
                  <span className="font-medium ml-2">Height:</span> {extractedFeatures.estimatedDimensions.height}
                  {extractedFeatures.estimatedDimensions.depth && (
                    <>
                      <span className="font-medium ml-2">| Depth:</span> {extractedFeatures.estimatedDimensions.depth}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Key Elements */}
            {extractedFeatures.keyElements.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Key Elements</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-[#1C1917]">
                  {extractedFeatures.keyElements.map((element, index) => {
                    // Ensure element is a string
                    const elementText = typeof element === "string" ? element : JSON.stringify(element);
                    return <li key={index}>{elementText}</li>;
                  })}
                </ul>
              </div>
            )}

            {/* Description */}
            {extractedFeatures.description && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Description</div>
                <p className="text-sm text-[#1C1917]">{extractedFeatures.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Views Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Views</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Front</p>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border">
                <Image src={frontView} alt="Front" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Back</p>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border">
                <Image src={backView} alt="Back" fill className="object-contain" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Side</p>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border">
                <Image src={sideView} alt="Side" fill className="object-contain" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
