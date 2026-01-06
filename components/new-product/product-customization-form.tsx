"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { HexColorPicker } from "react-colorful";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { X, Info, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

const formSchema = z.object({
  materials: z.array(z.string()).optional(), // Made materials optional instead of required
  features: z.array(z.string()).optional(),
  sizeRange: z.string(),
  packaging: z.string().optional(),
  sustainabilityLevel: z.number().min(1).max(5),
  priceRange: z.string(),
});

interface ProductCustomizationFormProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function ProductCustomizationForm({ formData, updateFormData }: ProductCustomizationFormProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>(formData.customizationOptions?.colors || []);
  const [currentColor, setCurrentColor] = useState("#6366f1");
  const [aiSuggestions, setAiSuggestions] = useState(true);

  // Dynamically generated based on the product type from step 1
  const materials = [
    { id: "cotton", label: "Organic Cotton", sustainability: "High" },
    { id: "recycled-polyester", label: "Recycled Polyester", sustainability: "High" },
    { id: "leather", label: "Premium Leather", sustainability: "Medium" },
    { id: "recycled-nylon", label: "Recycled Nylon", sustainability: "High" },
    { id: "bamboo", label: "Bamboo Fiber", sustainability: "Very High" },
    { id: "cork", label: "Natural Cork", sustainability: "Very High" },
    { id: "hemp", label: "Hemp", sustainability: "Very High" },
    { id: "tencel", label: "TENCEL™ Lyocell", sustainability: "High" },
  ];

  // Features would be dynamically generated based on product type
  const features = [
    { id: "water-resistant", label: "Water Resistant" },
    { id: "breathable", label: "Breathable Material" },
    { id: "anti-microbial", label: "Anti-Microbial Treatment" },
    { id: "reflective", label: "Reflective Elements" },
    { id: "reinforced", label: "Reinforced Stress Points" },
    { id: "quick-dry", label: "Quick-Dry Technology" },
    { id: "odor-resistant", label: "Odor Resistant" },
    { id: "uv-protection", label: "UV Protection" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materials: formData.customizationOptions?.materials || [],
      features: formData.customizationOptions?.features || [],
      sizeRange: formData.customizationOptions?.sizeRange || "standard",
      packaging: formData.customizationOptions?.packaging || "",
      sustainabilityLevel: formData.customizationOptions?.sustainabilityLevel || 3,
      priceRange: formData.customizationOptions?.priceRange || "medium",
    },
  });

  // Update parent form data when this form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.values(value).some((val) => val !== undefined)) {
        // Use a timeout to break the potential update cycle
        const timer = setTimeout(() => {
          updateFormData({
            customizationOptions: {
              ...value,
              colors: selectedColors,
            },
          });
        }, 0);
        return () => clearTimeout(timer);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, selectedColors]); // Remove updateFormData from dependencies

  // Update parent form data when colors change
  useEffect(() => {
    // Only update when colors actually change
    const timer = setTimeout(() => {
      updateFormData({
        customizationOptions: {
          ...form.getValues(),
          colors: selectedColors,
        },
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedColors, form]); // Remove updateFormData from dependencies

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateFormData({
      customizationOptions: {
        ...values,
        colors: selectedColors,
      },
    });
  }

  const addColor = () => {
    if (!selectedColors.includes(currentColor)) {
      setSelectedColors([...selectedColors, currentColor]);
    }
  };

  const removeColor = (color: string) => {
    setSelectedColors(selectedColors.filter((c) => c !== color));
  };

  const handleAiSuggestionsToggle = (checked: boolean) => {
    setAiSuggestions(checked);

    // If turning on AI suggestions, we would typically make an API call here
    // to get AI-recommended customizations based on the product idea
    if (checked) {
      // Simulate AI suggestions
      setTimeout(() => {
        form.setValue("materials", ["recycled-polyester", "bamboo"]);
        form.setValue("features", ["water-resistant", "breathable", "odor-resistant"]);
        form.setValue("sustainabilityLevel", 4);
        setSelectedColors(["#3B82F6", "#10B981", "#F59E0B"]);
      }, 500);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className={`text-2xl font-semibold mb-2 ${volkhov.className}`}>Customize Your Product</h2>
          <p className="text-[#1C1917]">
            Personalize your {formData.productType || "product"} with the following options.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="ai-suggestions" checked={aiSuggestions} onCheckedChange={handleAiSuggestionsToggle} />
          <Label htmlFor="ai-suggestions" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-zinc-900" />
            AI Suggestions
          </Label>
        </div>
      </div>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <TabsContent value="materials" className="space-y-6">
              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Materials (Optional)</FormLabel> {/* Added (Optional) to label */}
                      <FormDescription>Select materials for your {formData.productType || "product"}.</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {materials.map((material) => (
                        <FormItem key={material.id} className="flex flex-col space-y-2 rounded-md border p-4">
                          <div className="flex items-start space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(material.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value ?? []), material.id])
                                    : field.onChange(field.value?.filter((value) => value !== material.id));
                                }}
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal cursor-pointer">{material.label}</FormLabel>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {material.sustainability} Sustainability
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sizeRange"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Size Range</FormLabel>
                    <FormDescription>Select the size range for your product.</FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="standard" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Standard (S, M, L, XL)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="extended" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Extended (XS-3XL)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="custom" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Custom Sizing</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Product Features</FormLabel>
                      <FormDescription>
                        Select special features for your {formData.productType || "product"}.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {features.map((feature) => (
                        <FormItem key={feature.id} className="flex flex-col space-y-2 rounded-md border p-4">
                          <div className="flex items-start space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(feature.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValue, feature.id])
                                    : field.onChange(currentValue?.filter((value) => value !== feature.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">{feature.label}</FormLabel>
                          </div>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={volkhov.className}>AI Feature Recommendations</CardTitle>
                  <CardDescription>
                    Based on your product description, we recommend these additional features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "Moisture Wicking", description: "Keeps the wearer dry and comfortable" },
                      { name: "Eco-Friendly Dyes", description: "Low-impact dyes that reduce water pollution" },
                      { name: "Thermal Regulation", description: "Adapts to body temperature changes" },
                    ].map((feature, index) => (
                      <Card key={index} className="bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <h4 className="font-medium">{feature.name}</h4>
                          <p className="text-sm text-[#1C1917]">{feature.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-3">
                <div className="mb-2">
                  <label htmlFor="colorPicker" className="text-sm font-medium">
                    Color Palette
                  </label>
                  <p className="text-sm text-[#1C1917]">Select colors for your product. You can add multiple colors.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <HexColorPicker
                      id="colorPicker"
                      color={currentColor}
                      onChange={setCurrentColor}
                      className="w-full"
                    />
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: currentColor }}></div>
                      <div className="text-sm">{currentColor}</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-auto bg-transparent"
                        onClick={addColor}
                      >
                        Add Color
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Selected Colors:</div>
                    {selectedColors.length === 0 ? (
                      <div className="text-sm text-[#1C1917]">No colors selected yet</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedColors.map((color, index) => (
                          <Badge
                            key={index}
                            style={{ backgroundColor: color, color: isLightColor(color) ? "#000" : "#fff" }}
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {color}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeColor(color)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Design Complexity</label>
                    <p className="text-sm text-[#1C1917]">Adjust the complexity level of your product design</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-[#1C1917]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Higher complexity may increase production cost and time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-sm text-[#1C1917] text-left">Minimal</div>
                  <div className="text-sm text-[#1C1917] text-center">Moderate</div>
                  <div className="text-sm text-[#1C1917] text-right">Complex</div>
                </div>
                <Slider defaultValue={[2]} min={1} max={5} step={1} />
              </div>
            </TabsContent>

            <TabsContent value="production" className="space-y-6">
              <FormField
                control={form.control}
                name="sustainabilityLevel"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Sustainability Priority</FormLabel>
                        <FormDescription>How important is sustainability in your product?</FormDescription>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-[#1C1917]" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Higher sustainability may affect cost and material options</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="grid grid-cols-5 gap-4 mb-2">
                          <div className="text-sm text-[#1C1917] text-left">Standard</div>
                          <div className="text-sm text-[#1C1917] text-center col-span-3"></div>
                          <div className="text-sm text-[#1C1917] text-right">Eco-Focused</div>
                        </div>
                        <Slider
                          value={[field.value]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceRange"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Target Price Range</FormLabel>
                    <FormDescription>Select your desired price point for this product</FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="budget" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Budget-Friendly</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="medium" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Mid-Range</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="premium" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Premium</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="packaging"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packaging Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any specific packaging requirements or preferences."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include details about eco-friendly options, branding, or special packaging needs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}

// Helper function to determine if a color is light or dark
function isLightColor(color: string) {
  const hex = color.replace("#", "");
  const r = Number.parseInt(hex.substr(0, 2), 16);
  const g = Number.parseInt(hex.substr(2, 2), 16);
  const b = Number.parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

function Label({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  );
}
