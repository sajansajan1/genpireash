"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ImageIcon, Mic } from "lucide-react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

const formSchema = z.object({
  productType: z.string().min(2, {
    message: "Product type must be at least 2 characters.",
  }),
  ideaPrompt: z.string().min(10, {
    message: "Please describe your idea in more detail.",
  }),
});

interface ProductIdeaFormProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function ProductIdeaForm({ formData, updateFormData }: ProductIdeaFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productType: formData.productType || "",
      ideaPrompt: formData.ideaPrompt || "",
    },
  });

  // Update parent form data when this form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Only update if values have actually changed and are defined
      if (Object.values(value).some((val) => val !== undefined && val !== "")) {
        // Use a timeout to break the potential update cycle
        const timer = setTimeout(() => {
          updateFormData(value);
        }, 0);
        return () => clearTimeout(timer);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]); // Remove updateFormData from dependencies

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateFormData(values);
  }

  // Example prompts to help users
  const examplePrompts = [
    "A minimalist sneaker with recycled materials and a unique sole pattern",
    "An eco-friendly water bottle with temperature display and customizable lid",
    "A modular backpack with detachable compartments for different activities",
    "A sustainable yoga mat with alignment guides and carrying strap",
    "A smart fitness tracker disguised as stylish jewelry",
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-2xl font-semibold mb-2 ${volkhov.className}`}>Describe Your Product Idea</h2>
        <p className="text-[#1C1917]">
          Tell us about your product concept. The more details you provide, the better our AI can understand your
          vision.
        </p>
      </div>

      <Form {...form}>
        <Tabs defaultValue="text" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <span>Text Description</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Reference Image
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" /> Voice Description
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sneakers, Water Bottle, Backpack" {...field} />
                    </FormControl>
                    <FormDescription>What kind of product are you looking to create?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ideaPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe Your Idea</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product idea in detail. Include any specific features, design elements, materials, or inspiration."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Be as specific as possible about what makes your product unique.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>

            <div className="mt-8">
              <h3 className={`text-sm font-medium mb-3 ${volkhov.className}`}>Example Prompts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {examplePrompts.map((prompt, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      form.setValue("ideaPrompt", prompt);
                      updateFormData({ ideaPrompt: prompt });
                    }}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm">{prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image">
            <div className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-12 w-12 text-[#1C1917]" />
                  <h3 className="text-lg font-medium">Upload Reference Image</h3>
                  <p className="text-sm text-[#1C1917] max-w-md mx-auto">
                    Drag & drop an image of a similar product or sketch of your idea. Our AI will analyze it to
                    understand your vision.
                  </p>
                  <p className="text-xs text-[#1C1917]">Supports JPG, PNG, GIF up to 10MB</p>
                  <Button type="button" className="mt-2">
                    Select File
                  </Button>
                </div>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="ideaPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Add Additional Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional details about your reference image that might help our AI understand your vision."
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice">
            <div className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center gap-3">
                  <Mic className="h-12 w-12 text-[#1C1917]" />
                  <h3 className="text-lg font-medium">Record Voice Description</h3>
                  <p className="text-sm text-[#1C1917] max-w-md mx-auto">
                    Describe your product idea using your voice. Our AI will transcribe and analyze your description.
                  </p>
                  <Button type="button" className="mt-2">
                    Start Recording
                  </Button>
                </div>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sneakers, Water Bottle, Backpack" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Form>
    </div>
  );
}
