import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Share2, Edit, ArrowRight } from "lucide-react";
import { ProductSpecification } from "@/components/product/product-specification";
import { SupplierMatchingSection } from "@/components/product/supplier-matching-section";
import { ProductTechPack } from "@/components/product/product-tech-pack";
import Link from "next/link";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function ProductPage({ params }: { params: { id: string } }) {
  // This would normally be fetched from an API
  const product = {
    id: params.id,
    name: "Custom Eco-Friendly Sneakers",
    status: "Spec Ready",
    description: "Minimalist sneakers made from recycled materials with custom sole design.",
    createdAt: "March 15, 2025",
    updatedAt: "March 28, 2025",
    image: "/placeholder.svg?height=400&width=600&text=Eco+Sneakers",
    materials: ["Recycled PET", "Natural Rubber", "Organic Cotton"],
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
    sizes: ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
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
  };

  return (
    <div className="max-w-7xl mx-auto py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-3xl font-bold ${volkhov.className}`}>{product.name}</h1>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{product.status}</Badge>
          </div>
          <p className="text-[#1C1917] mt-1">
            Created on {product.createdAt} • Last updated {product.updatedAt}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" /> Request Sample
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <Card>
            <div className="aspect-square overflow-hidden rounded-t-lg">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Product Overview</h2>
              <p className="text-[#1C1917] mb-4">{product.description}</p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-[#1C1917] mb-1">Materials</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((material, index) => (
                      <Badge key={index} variant="outline">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#1C1917] mb-1">Colors</h3>
                  <div className="flex gap-2">
                    {product.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: color }}
                        title={color}
                      ></div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#1C1917] mb-1">Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <Badge key={index} variant="outline">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link href={`/dashboard/products/${product.id}/tech-pack`}>
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" /> View Full Tech Pack
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="specification" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="specification">Specification</TabsTrigger>
              <TabsTrigger value="suppliers">Supplier Matching</TabsTrigger>
              <TabsTrigger value="tech-pack">Tech Pack</TabsTrigger>
            </TabsList>

            <TabsContent value="specification" className="mt-6">
              <ProductSpecification product={product} />
            </TabsContent>

            <TabsContent value="suppliers" className="mt-6">
              <SupplierMatchingSection productId={product.id} />
            </TabsContent>

            <TabsContent value="tech-pack" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${volkhov.className}`}>Tech Pack Summary</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/products/${product.id}/tech-pack`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Tech Pack
                        </Link>
                      </Button>
                      <Button size="sm">
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </div>
                  </div>

                  <ProductTechPack techPack={product.techPack} isPreview={true} />

                  <div className="mt-6 flex justify-center">
                    <Button asChild>
                      <Link href={`/dashboard/products/${product.id}/tech-pack`}>
                        View Complete Tech Pack <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
