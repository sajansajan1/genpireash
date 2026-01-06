"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Mock tech packs data
const mockTechPacks = [
  {
    id: "tp-001",
    name: "Eco-friendly Cotton T-shirt",
    description: "Sustainable cotton t-shirt with minimalist design",
    thumbnail: "/placeholder.svg?height=60&width=60",
    materials: ["Organic Cotton", "Recycled Polyester Blend"],
    created_at: "2025-03-15T10:30:00Z",
  },
  {
    id: "tp-002",
    name: "Handcrafted Leather Wallet",
    description: "Premium leather wallet with multiple card slots",
    thumbnail: "/placeholder.svg?height=60&width=60",
    materials: ["Full-grain Leather", "Metal Snaps"],
    created_at: "2025-03-20T14:15:00Z",
  },
  {
    id: "tp-003",
    name: "Recycled Canvas Tote Bag",
    description: "Durable tote bag made from recycled canvas",
    thumbnail: "/placeholder.svg?height=60&width=60",
    materials: ["Recycled Canvas", "Cotton Webbing"],
    created_at: "2025-03-25T11:20:00Z",
  },
];

// Mock suppliers data
const mockSuppliers = [
  {
    id: "sup-001",
    name: "EcoTextiles Manufacturing",
    location: "Portugal",
    specialties: ["Organic Cotton", "Sustainable Fabrics", "Eco-friendly Production"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "sup-002",
    name: "Sustainable Fabrics Co.",
    location: "Vietnam",
    specialties: ["Recycled Materials", "Low-impact Dyes", "Ethical Production"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "sup-003",
    name: "Premium Materials Ltd.",
    location: "Italy",
    specialties: ["Leather Goods", "High-end Fabrics", "Luxury Accessories"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "sup-004",
    name: "Global Textile Solutions",
    location: "India",
    specialties: ["Mass Production", "Mixed Materials", "Cost-effective Manufacturing"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "sup-005",
    name: "Artisan Crafts Collective",
    location: "Mexico",
    specialties: ["Handcrafted Items", "Traditional Techniques", "Small Batch Production"],
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

// Form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  productIdea: z.string().min(10, "Product idea must be at least 10 characters"),
  techPackId: z.string().min(1, "Please select a tech pack"),
  timeline: z.string().min(1, "Please specify a timeline"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  budget: z.coerce.number().optional(),
  sendOption: z.enum(["specific", "all"]),
  saveAsDraft: z.boolean().optional(),
});

export function CreateRFQDialog({
  open,
  onOpenChange,
  onSubmit,
  initialTechPack = null,
  preselectedSuppliers = [],
  supplier = null,
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState(preselectedSuppliers);

  useEffect(() => {
    if (supplier && !selectedSuppliers.some((s) => s.id === supplier.id)) {
      setSelectedSuppliers([supplier]);
    }
  }, [supplier]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialTechPack ? `Quote for ${initialTechPack.name}` : "",
      productIdea: "",
      techPackId: initialTechPack ? initialTechPack.id : "",
      timeline: "",
      quantity: 50,
      budget: undefined,
      sendOption: supplier ? "specific" : preselectedSuppliers.length > 0 ? "specific" : "all",
      saveAsDraft: false,
    },
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newRFQ = {
        ...values,
        selectedSuppliers: values.sendOption === "specific" ? selectedSuppliers : mockSuppliers,
        status: values.saveAsDraft ? "draft" : "open",
      };

      onSubmit(newRFQ);
      handleReset();
    } catch (error) {
      console.error("Error submitting RFQ:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setStep(1);
    setSelectedSuppliers([]);
    onOpenChange(false);
  };

  const handleNext = async () => {
    const isValid = await form.trigger(["title", "productIdea", "techPackId", "timeline", "quantity"]);
    if (isValid) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const toggleSupplier = (supplier) => {
    setSelectedSuppliers((prev) => {
      const exists = prev.some((s) => s.id === supplier.id);
      return exists ? prev.filter((s) => s.id !== supplier.id) : [...prev, supplier];
    });
  };

  const selectedTechPack = form.watch("techPackId")
    ? mockTechPacks.find((tp) => tp.id === form.watch("techPackId"))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New RFQ</DialogTitle>
          <DialogDescription>Send a request for quote to suppliers for your product.</DialogDescription>
        </DialogHeader>

        {supplier && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50 mb-4">
            <div className="flex-shrink-0">
              <img
                src={supplier.avatar || "/placeholder.svg?height=48&width=48"}
                alt={supplier.name}
                className="w-12 h-12 rounded-md object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{supplier.name}</p>
              <p className="text-sm text-[#1C1917]">This RFQ will be sent directly to this supplier</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 flex-1 overflow-hidden flex flex-col">
            {step === 1 ? (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFQ Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Eco-friendly Cotton T-shirt" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productIdea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Idea</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your product idea in detail..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="techPackId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Tech Pack</FormLabel>
                        <div className="space-y-3">
                          {mockTechPacks.map((techPack) => (
                            <div
                              key={techPack.id}
                              className={`flex flex-col sm:flex-row items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                field.value === techPack.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                              }`}
                              onClick={() => form.setValue("techPackId", techPack.id)}
                            >
                              <div className="flex-shrink-0 w-full sm:w-auto mb-2 sm:mb-0">
                                <img
                                  src={techPack.thumbnail || "/placeholder.svg"}
                                  alt={techPack.name}
                                  className="w-full sm:w-[60px] h-[60px] rounded-md object-cover"
                                />
                              </div>
                              <div className="flex-1 w-full">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{techPack.name}</p>
                                    <p className="text-xs text-[#1C1917]">{techPack.description}</p>
                                  </div>
                                  <RadioGroupItem
                                    value={techPack.id}
                                    id={techPack.id}
                                    checked={field.value === techPack.id}
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {techPack.materials.map((material, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {material}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeline</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2-3 weeks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Price per Unit (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="e.g., 15.00"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value === "" ? undefined : Number.parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Leave blank if you don't have a specific target price.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {selectedTechPack && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <img
                          src={selectedTechPack.thumbnail || "/placeholder.svg"}
                          alt={selectedTechPack.name}
                          className="w-[60px] h-[60px] rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium">{selectedTechPack.name}</p>
                          <p className="text-xs text-[#1C1917]">{selectedTechPack.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedTechPack.materials.map((material, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!supplier && (
                    <FormField
                      control={form.control}
                      name="sendOption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Send RFQ to</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific" id="specific" />
                                <Label htmlFor="specific">Specific suppliers</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="all" />
                                <Label htmlFor="all">All relevant suppliers</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("sendOption") === "specific" && !supplier && (
                    <div className="space-y-3">
                      <Label>Select Suppliers</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mockSuppliers.map((supplier) => {
                          const isSelected = selectedSuppliers.some((s) => s.id === supplier.id);

                          return (
                            <div
                              key={supplier.id}
                              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                              }`}
                              onClick={() => toggleSupplier(supplier)}
                            >
                              <Checkbox checked={isSelected} onCheckedChange={() => toggleSupplier(supplier)} />
                              <div className="flex-shrink-0">
                                <img
                                  src={supplier.avatar || "/placeholder.svg"}
                                  alt={supplier.name}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{supplier.name}</p>
                                <p className="text-xs text-[#1C1917]">{supplier.location}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {supplier.specialties.slice(0, 1).map((specialty, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                  {supplier.specialties.length > 1 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{supplier.specialties.length - 1} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="saveAsDraft"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Save as draft</FormLabel>
                          <FormDescription>Save this RFQ as a draft to review and send later.</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>
            )}

            <DialogFooter className="pt-2">
              {step === 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <div className="flex w-full justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {form.watch("saveAsDraft") ? "Save Draft" : "Send RFQ"}
                  </Button>
                </div>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
