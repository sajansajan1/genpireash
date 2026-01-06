"use client";

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
import { X } from "lucide-react";

const formSchema = z.object({
  materials: z.array(z.string()).min(1, {
    message: "Please select at least one material.",
  }),
  sizeRange: z.string(),
  packaging: z.string().optional(),
});

interface MaterialsPreferencesFormProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function MaterialsPreferencesForm({ formData, updateFormData }: MaterialsPreferencesFormProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>(formData.colors || []);
  const [currentColor, setCurrentColor] = useState("#6366f1");

  const materials = [
    { id: "cotton", label: "Cotton" },
    { id: "polyester", label: "Polyester" },
    { id: "leather", label: "Leather" },
    { id: "nylon", label: "Nylon" },
    { id: "wool", label: "Wool" },
    { id: "recycled", label: "Recycled Materials" },
    { id: "bamboo", label: "Bamboo" },
    { id: "silicone", label: "Silicone" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materials: formData.materials || [],
      sizeRange: formData.sizeRange || "standard",
      packaging: formData.packaging || "",
    },
  });

  // Update parent form data when this form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.values(value).some((val) => val !== undefined)) {
        updateFormData({
          ...value,
          colors: selectedColors,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, updateFormData, selectedColors]);

  // Update parent form data when colors change
  useEffect(() => {
    updateFormData({
      ...form.getValues(),
      colors: selectedColors,
    });
  }, [selectedColors, form, updateFormData]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateFormData({
      ...values,
      colors: selectedColors,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="materials"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Preferred Materials</FormLabel>
                <FormDescription>Select all materials that you'd like to use in your product.</FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {materials.map((material) => (
                  <FormItem
                    key={material.id}
                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(material.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, material.id])
                            : field.onChange(field.value?.filter((value) => value !== material.id));
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">{material.label}</FormLabel>
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

        <div className="space-y-3">
          <FormLabel htmlFor="colorPicker">Color Palette</FormLabel>
          <FormDescription>Select colors for your product. You can add multiple colors.</FormDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <HexColorPicker id="colorPicker" color={currentColor} onChange={setCurrentColor} className="w-full" />
              <div className="mt-4 flex items-center gap-2">
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: currentColor }}></div>
                <div className="text-sm">{currentColor}</div>
                <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={addColor}>
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

        <FormField
          control={form.control}
          name="packaging"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Packaging Requirements (Optional)</FormLabel>
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
      </form>
    </Form>
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
