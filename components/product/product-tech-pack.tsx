import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Volkhov } from "next/font/google";
import { Calculator, DollarSign, Truck, Package, Store, AlertTriangle, Info } from "lucide-react";
import { renderValue } from "@/app/product/shared/utils";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

interface TechPackProps {
  techPack: any;
  isPreview: boolean;
}
const techPack = {
  productName: "Leather Jacket",
  materials: [
    { name: "Genuine Leather", reason: "Durable,Premium feel,Sustainable" },
    { name: "Organic Cotton Lining", reason: "Eco-friendly,Breathable,Soft" },
    { name: "Brass Zippers", reason: "Rust-resistant,Sturdy" },
  ],
  dimensions: {
    chest: "Large",
    length: "Medium",
    sleeveLength: "Large",
    shoulder: "Medium",
    waist: "Medium",
    cuff: "Small",
  },
  colorStyle: {
    primaryColors: ["Black", "Brown"],
    accentColors: ["Gold", "Silver"],
    styleNotes:
      "The jacket should have a vintage, rugged look with a modern fit. Emphasize contrast stitching and metal detailing to enhance visual appeal.",
  },
  packaging: "Folded in a recyclable kraft paper bag with a printed logo sticker and hang tag.",
  aiNotes:
    "Consider sourcing sustainable leather alternatives to reduce environmental impact. Evaluate different zipper placements for functional and aesthetic balance.",
};

function calculateCostEstimation(techPack: any) {
  // Base costs by product category (estimated averages)
  const baseCosts = {
    apparel: { sample: 25, production: 8, packaging: 2 },
    accessories: { sample: 15, production: 5, packaging: 1.5 },
    footwear: { sample: 45, production: 18, packaging: 3 },
    bags: { sample: 35, production: 12, packaging: 2.5 },
    default: { sample: 20, production: 7, packaging: 2 },
  };

  // Determine product category from tech pack
  const productName = techPack.productName?.toLowerCase() || "";
  let category = "default";

  if (
    productName.includes("shirt") ||
    productName.includes("dress") ||
    productName.includes("jacket") ||
    productName.includes("hoodie")
  ) {
    category = "apparel";
  } else if (productName.includes("shoe") || productName.includes("boot") || productName.includes("sneaker")) {
    category = "footwear";
  } else if (productName.includes("bag") || productName.includes("backpack") || productName.includes("purse")) {
    category = "bags";
  } else if (productName.includes("watch") || productName.includes("jewelry") || productName.includes("accessory")) {
    category = "accessories";
  }

  const costs = baseCosts[category as keyof typeof baseCosts];

  // Material cost multiplier based on materials
  let materialMultiplier = 1;
  if (techPack.materials) {
    const premiumMaterials = ["leather", "silk", "cashmere", "organic", "sustainable"];
    const hasPremiumMaterials = techPack.materials.some((material: any) =>
      premiumMaterials.some((premium) => material.name?.toLowerCase().includes(premium))
    );
    if (hasPremiumMaterials) materialMultiplier = 1.4;
  }

  // Size-based shipping multiplier
  let shippingMultiplier = 1;
  if (techPack.dimensions) {
    // Estimate size based on dimensions
    const dimensionValues = Object.values(techPack.dimensions).join(" ").toLowerCase();
    if (dimensionValues.includes("large") || dimensionValues.includes("xl")) {
      shippingMultiplier = 1.5;
    } else if (dimensionValues.includes("small") || dimensionValues.includes("xs")) {
      shippingMultiplier = 0.7;
    }
  }

  const sampleCost = Math.round(costs.sample * materialMultiplier * 100) / 100;
  const productionCost = Math.round(costs.production * materialMultiplier * 100) / 100;
  const packagingCost = Math.round(costs.packaging * 100) / 100;

  const domesticShipping = Math.round(3.5 * shippingMultiplier * 100) / 100;
  const internationalShipping = Math.round(12 * shippingMultiplier * 100) / 100;

  const wholesalePrice = Math.round(productionCost * 2.2 * 100) / 100;
  const retailPrice = Math.round(wholesalePrice * 2.5 * 100) / 100;

  const grossMargin = Math.round(((wholesalePrice - productionCost) / wholesalePrice) * 100);
  const retailMargin = Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100);

  return {
    sampleCost,
    productionCost,
    packagingCost,
    domesticShipping,
    internationalShipping,
    wholesalePrice,
    retailPrice,
    grossMargin,
    retailMargin,
  };
}

export function ProductTechPack() {
  const isPreview = true;
  return (
    <div className="space-y-6">
      {/* Materials Section */}
      <div>
        <h3 className={`text-lg font-semibold mb-3 flex items-center ${volkhov.className}`}>
          <span className="mr-2">🧵</span> Materials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {techPack.materials.slice(0, isPreview ? 2 : undefined).map((material: any, index: number) => (
            <div key={index} className="border rounded-md p-3">
              <div className="font-medium">{material.name}</div>
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
          ))}
        </div>
        {isPreview && techPack.materials.length > 2 && (
          <div className="text-sm text-[#1C1917] mt-2">+ {techPack.materials.length - 2} more materials</div>
        )}
      </div>

      <Separator />

      {/* Dimensions Section */}
      <div>
        <h3 className={`text-lg font-semibold mb-3 flex items-center ${volkhov.className}`}>
          <span className="mr-2">📏</span> Dimensions & Sizes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(techPack.dimensions)
            .slice(0, isPreview ? 4 : undefined)
            .map(([key, value]: [string, any]) => (
              <div key={key} className="border rounded-md p-3">
                <div className="text-sm text-[#1C1917] capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                <div className="font-medium">{value}</div>
              </div>
            ))}
        </div>
        {isPreview && Object.keys(techPack.dimensions).length > 4 && (
          <div className="text-sm text-[#1C1917] mt-2">
            + {Object.keys(techPack.dimensions).length - 4} more dimensions
          </div>
        )}
      </div>

      <Separator />

      {/* Color & Style Section */}
      <div>
        <h3 className={`text-lg font-semibold mb-3 flex items-center ${volkhov.className}`}>
          <span className="mr-2">🎨</span> Color & Style Direction
        </h3>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-[#1C1917] mb-1">Primary Colors</div>
            <div className="flex flex-wrap gap-2">
              {techPack.colorStyle.primaryColors.map((color: string, index: number) => (
                <Badge key={index} variant="outline">
                  {color}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-[#1C1917] mb-1">Accent Colors</div>
            <div className="flex flex-wrap gap-2">
              {techPack.colorStyle.accentColors.map((color: string, index: number) => (
                <Badge key={index} variant="outline">
                  {color}
                </Badge>
              ))}
            </div>
          </div>

          {(!isPreview || (isPreview && techPack.colorStyle.styleNotes.length < 100)) && (
            <div>
              <div className="text-sm text-[#1C1917] mb-1">Style Notes</div>
              <div className="text-sm">{techPack.colorStyle.styleNotes}</div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Cost & Income Estimation Section */}
      <div>
        <h3 className={`text-lg font-semibold mb-3 flex items-center ${volkhov.className}`}>
          <span className="mr-2">💸</span> Cost & Income Estimation
          <Badge variant="secondary" className="ml-2 text-xs">
            Estimated
          </Badge>
        </h3>

        {(() => {
          const costData = calculateCostEstimation(techPack);

          return (
            <div className="space-y-4">
              {/* Sample & Production Costs */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  Sample & Production Costs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1C1917]">Estimated Sample Creation:</span>
                    <span className="font-medium">${costData.sampleCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1C1917]">Production Cost (per unit @ MOQ 100):</span>
                    <span className="font-medium">${costData.productionCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1C1917]">Packaging & Labeling:</span>
                    <span className="font-medium">${costData.packagingCost}</span>
                  </div>
                </div>
              </div>

              {/* Shipping & Logistics */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Shipping & Logistics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1C1917]">Estimated Domestic Shipping (per unit):</span>
                    <span className="font-medium">${costData.domesticShipping}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1C1917]">Estimated International Shipping (per unit):</span>
                    <span className="font-medium">${costData.internationalShipping}</span>
                  </div>
                </div>
              </div>

              {/* Wholesale Pricing */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Wholesale Pricing
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1C1917]">Suggested Wholesale Price (MOQ 100):</span>
                    <span className="font-medium">${costData.wholesalePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1C1917]">Gross Margin from Production:</span>
                    <span className="font-medium text-green-600">{costData.grossMargin}%</span>
                  </div>
                </div>
              </div>

              {/* Retail Pricing */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <Store className="h-4 w-4 mr-2" />
                  Retail Pricing
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1C1917]">Suggested Retail Price:</span>
                    <span className="font-medium">${costData.retailPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1C1917]">Estimated Retail Margin:</span>
                    <span className="font-medium text-green-600">{costData.retailMargin}%</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <strong>Note:</strong> All prices are estimates based on product type, materials, and common
                    industry benchmarks. Actual costs may vary significantly based on supplier, location, order
                    quantity, and market conditions. Use for guidance only.
                  </div>
                </div>
              </div>

              {!isPreview && (
                <div className="flex gap-2 pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Info className="h-4 w-4 mr-2" />
                          How is this calculated?
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Estimates are based on product category, materials complexity, size factors, and
                          industry-standard markup ratios. Sample costs include prototyping, production uses MOQ-based
                          pricing, and margins follow typical wholesale (2.2x) and retail (2.5x) multipliers.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button variant="outline" size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Download Pricing Sheet
                  </Button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {!isPreview && (
        <>
          <Separator />

          {/* Packaging Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 flex items-center ${volkhov.className}`}>
              <span className="mr-2">📦</span> Packaging Notes
            </h3>
            <Card>
              <CardContent className="p-4">
                <p>{typeof techPack.packaging === 'string' ? techPack.packaging : renderValue(techPack.packaging)}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* AI Notes Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 flex items-center ${volkhov.className}`}>
              <span className="mr-2">📄</span> AI Notes
            </h3>
            <Card>
              <CardContent className="p-4">
                <p>{typeof techPack.aiNotes === 'string' ? techPack.aiNotes : renderValue(techPack.aiNotes)}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
