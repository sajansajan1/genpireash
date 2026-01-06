import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ReviewConfirmFormProps {
  formData: any;
}

export function ReviewConfirmForm({ formData }: ReviewConfirmFormProps) {
  const materialLabels: Record<string, string> = {
    cotton: "Cotton",
    polyester: "Polyester",
    leather: "Leather",
    nylon: "Nylon",
    wool: "Wool",
    recycled: "Recycled Materials",
    bamboo: "Bamboo",
    silicone: "Silicone",
  };

  const sizeRangeLabels: Record<string, string> = {
    standard: "Standard (S, M, L, XL)",
    extended: "Extended (XS-3XL)",
    custom: "Custom Sizing",
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Review Your Product Details</h2>
        <p className="text-[#1C1917]">
          Please review all the information before generating your product specification.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Product Description</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-[#1C1917] mb-1">Product Type</div>
                <div>{formData.productType || "Not specified"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#1C1917] mb-1">Intended Use</div>
                <div>{formData.intendedUse || "Not specified"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#1C1917] mb-1">Idea Description</div>
                <div className="text-sm">{formData.ideaPrompt || "Not specified"}</div>
              </div>
              {formData.referenceImage && (
                <div>
                  <div className="text-sm font-medium text-[#1C1917] mb-1">Reference Image</div>
                  <div className="h-32 w-32 bg-muted rounded-md"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Materials & Preferences</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-[#1C1917] mb-1">Materials</div>
                <div className="flex flex-wrap gap-2">
                  {formData.materials && formData.materials.length > 0 ? (
                    formData.materials.map((material: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {materialLabels[material] || material}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[#1C1917] text-sm">No materials selected</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#1C1917] mb-1">Size Range</div>
                <div>{sizeRangeLabels[formData.sizeRange] || "Not specified"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#1C1917] mb-1">Color Palette</div>
                <div className="flex flex-wrap gap-2">
                  {formData.colors && formData.colors.length > 0 ? (
                    formData.colors.map((color: string, index: number) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: color }}
                        title={color}
                      ></div>
                    ))
                  ) : (
                    <span className="text-[#1C1917] text-sm">No colors selected</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-[#1C1917] mb-1">Packaging</div>
                <div className="text-sm">{formData.packaging || "No specific requirements"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">AI-Generated Preview</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-[#1C1917] mb-2">Material Breakdown</h4>
            <div className="bg-background rounded-md p-4 min-h-24 animate-pulse"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1C1917] mb-2">Size Chart</h4>
            <div className="bg-background rounded-md p-4 min-h-24 animate-pulse"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1C1917] mb-2">Colors</h4>
            <div className="bg-background rounded-md p-4 min-h-24 animate-pulse"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1C1917] mb-2">Packaging Summary</h4>
            <div className="bg-background rounded-md p-4 min-h-24 animate-pulse"></div>
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-[#1C1917]">
          Click "Generate Specification" to create your complete product specification
        </div>
      </div>
    </div>
  );
}
