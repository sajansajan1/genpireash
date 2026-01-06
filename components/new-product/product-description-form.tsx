"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  productType: z.string().min(2, {
    message: "Product type must be at least 2 characters.",
  }),
  intendedUse: z.string().min(5, {
    message: "Please provide more details about the intended use.",
  }),
  ideaPrompt: z.string().min(10, {
    message: "Please describe your idea in more detail.",
  }),
});

interface ProductDescriptionFormProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function ProductDescriptionForm({ formData, updateFormData }: ProductDescriptionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productType: formData.productType || "",
      intendedUse: formData.intendedUse || "",
      ideaPrompt: formData.ideaPrompt || "",
    },
  });

  // Update parent form data when this form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.values(value).some((val) => val !== undefined)) {
        updateFormData(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateFormData(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="productType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Flip-flops, Hoodie, Water bottle" {...field} />
              </FormControl>
              <FormDescription>What kind of product are you looking to create?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="intendedUse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intended Use</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Outdoor sports, Casual wear, Office use" {...field} />
              </FormControl>
              <FormDescription>How and where will this product be used?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Reference Image (Optional)</FormLabel>
          <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-[#1C1917]" />
              <p className="text-sm text-[#1C1917]">Drag & drop an image here, or click to browse</p>
              <p className="text-xs text-[#1C1917]">Supports JPG, PNG, GIF up to 5MB</p>
              <Button type="button" variant="outline" size="sm" className="mt-2">
                Upload Image
              </Button>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="ideaPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe Your Idea</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your product idea in detail. Include any specific features, design elements, or inspiration."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The more details you provide, the better our AI can understand your vision.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
