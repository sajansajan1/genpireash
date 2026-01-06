"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchProductIdeas } from "@/app/actions/user";
import { getAllSuppliers } from "@/lib/supabase/supplier";
import { useUserStore } from "@/lib/zustand/useStore";
import useSWR from "swr";

export function SimpleRFQDialog({
  open,
  onOpenChange,
  onSubmit,
  initialTechPack = null,
  preselectedSuppliers = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rfq: any) => void;
  initialTechPack?: any;
  preselectedSuppliers?: any[];
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState(preselectedSuppliers);

  // Form state
  const [title, setTitle] = useState("");
  const [productIdea, setProductIdea] = useState("");
  const [techPackId, setTechPackId] = useState("");
  const [timeline, setTimeline] = useState("");
  const [quantity, setQuantity] = useState("");
  const [budget, setBudget] = useState("");
  const [sendOption, setSendOption] = useState(preselectedSuppliers.length > 0 ? "specific" : "all");
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, creatorProfile } = useUserStore();

  const fetchDashboardData = async () => {
    const [techPacks, suppliers] = await Promise.all([fetchProductIdeas(), getAllSuppliers()]);
    return { techPacks, suppliers };
  };
  const { data, error, isLoading } = useSWR("dashboard-data", fetchDashboardData);
  const techPacks = data?.techPacks ?? [];
  const suppliers = data?.suppliers ?? [];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!productIdea) {
      alert("Product idea is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const matched = suppliers.filter((supplier) =>
        supplier?.manufacturing?.product_categories?.includes(creatorProfile?.categories)
      );
      const suppliersToSend = sendOption === "all" ? suppliers : selectedSuppliers;

      const newRFQ = {
        title,
        product_idea: productIdea,
        techpack_id: techPackId,
        creator_id: creatorProfile?.id,
        timeline,
        quantity: quantity,
        target_price: budget,
        status: saveAsDraft ? "draft" : "open",
      };
      await onSubmit({
        rfqData: newRFQ,
        supplierIds: suppliersToSend.map((s) => s.id),
        supplierDetails: suppliersToSend.map((s) => s),
      });
      handleReset();
    } catch (error) {
      console.error("Error submitting RFQ:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setProductIdea("");
    setTechPackId("");
    setTimeline("");
    setQuantity("");
    setBudget("");
    setSendOption(preselectedSuppliers.length > 0 ? "specific" : "all");
    setSaveAsDraft(false);
    setStep(1);
    setSelectedSuppliers(preselectedSuppliers);
    onOpenChange(false);
  };

  const handleNext = () => {
    // Simple validation
    if (!title || !productIdea || !techPackId || !timeline || !quantity) {
      alert("Please fill in all required fields");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const toggleSupplier = (supplier: any) => {
    setSelectedSuppliers((prev) => {
      const exists = prev.some((s) => s.id === supplier.id);
      if (exists) {
        return prev.filter((s) => s.id !== supplier.id);
      } else {
        return [...prev, supplier];
      }
    });
  };
  const selectedTechPack = techPackId ? techPacks.find((tp) => tp.id === techPackId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New RFQ</DialogTitle>
          <DialogDescription>Send a request for quote to suppliers for your product.</DialogDescription>
        </DialogHeader>
        {isLoading || !data || !data.techPacks || !data.suppliers ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="text-center space-y-2">
              <div className="loader mx-auto" /> {/* your spinner if any */}
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <p className="text-red-500">Failed to load data</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-hidden flex flex-col">
            {step === 1 ? (
              <ScrollArea className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                <div className="space-y-6 p-5">
                  <div className="space-y-2">
                    <Label htmlFor="title">RFQ Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Eco-friendly Cotton T-shirt"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productIdea">Product Idea</Label>
                    <Textarea
                      id="productIdea"
                      placeholder="Describe your product idea in detail..."
                      className={`min-h-[100px]`}
                      value={productIdea}
                      onChange={(e) => setProductIdea(e.target.value)}
                      required
                    />
                  </div>

                  {/* Select Tech Pack */}
                  <div className="space-y-2">
                    <Label>Select Tech Pack</Label>
                    <div className="relative flex-1 py-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10" // <-- space for icon
                      />
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                      {(() => {
                        const filtered = techPacks.filter((tp) => {
                          // ⛔ 1. EXCLUDE products with metadata
                          if (tp.tech_pack?.metadata) return false;

                          // 🔎 2. Search filter
                          const name = tp.tech_pack.productName?.toLowerCase() || "";
                          const overview = tp.tech_pack.productOverview?.toLowerCase() || "";

                          const query = searchQuery.toLowerCase().replace(/\s+/g, " ").trim();
                          const normalizedName = name.replace(/\s+/g, " ").trim();
                          const normalizedOverview = overview.replace(/\s+/g, " ").trim();

                          return normalizedName.includes(query) || normalizedOverview.includes(query);
                        });
                        if (filtered.length === 0) {
                          return (
                            <p className="text-center text-sm text-muted-foreground py-4">No such products exist.</p>
                          );
                        }

                        return filtered.map((techPack) => (
                          <div
                            key={techPack.id}
                            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              techPackId === techPack.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                            }`}
                            onClick={() => {
                              setTechPackId(techPack.id);
                              setTitle(techPack.tech_pack.productName || "");
                              setProductIdea(techPack.tech_pack.productOverview || "");
                            }}
                          >
                            <div className="flex-shrink-0">
                              <img
                                src={techPack.image_data?.front?.url || "/placeholder.svg"}
                                alt={techPack.tech_pack.productName}
                                className="w-[60px] h-[60px] rounded-md object-cover"
                              />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{techPack.tech_pack.productName}</p>
                                  <p className="text-xs text-[#1C1917]">{techPack.tech_pack.productOverview}</p>
                                </div>
                                <input
                                  type="radio"
                                  name="techPack"
                                  checked={techPackId === techPack.id}
                                  onChange={() => setTechPackId(techPack.id)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* ////edition  */}

                  {/* Additional Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Timeline</Label>
                      <Input
                        id="timeline"
                        placeholder="e.g., 2-3 weeks"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Budget Input */}
                  <div className="space-y-2">
                    <Label htmlFor="budget">Target Price per Unit (Optional)</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 15.00"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                    <p className="text-sm text-[#1C1917]">Leave blank if you don't have a specific target price.</p>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="flex-1 overflow-y-auto pr-4">
                <div className="space-y-6 p-5">
                  {/* Selected Tech Pack */}
                  {selectedTechPack && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <img
                          src={selectedTechPack.image_data?.front?.url || "/placeholder.svg"}
                          alt={selectedTechPack.tech_pack.productName}
                          className="w-[60px] h-[60px] rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium">{selectedTechPack.tech_pack.productName}</p>
                          <p className="text-xs text-[#1C1917]">{selectedTechPack.tech_pack.productOverview}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedTechPack.tech_pack.materials?.map((material: any, i: any) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {material.material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Send RFQ Options */}
                  <div className="space-y-3">
                    <Label>Send RFQ to</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="specific"
                          name="sendOption"
                          value="specific"
                          checked={sendOption === "specific"}
                          onChange={() => setSendOption("specific")}
                        />
                        <Label htmlFor="specific">Specific suppliers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="all"
                          name="sendOption"
                          value="all"
                          checked={sendOption === "all"}
                          onChange={() => setSendOption("all")}
                        />
                        <Label htmlFor="all">All relevant suppliers</Label>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Selection */}
                  {sendOption === "specific" && (
                    <div className="space-y-3">
                      <Label>Select Suppliers</Label>
                      {suppliers.map((supplier) => {
                        const isSelected = selectedSuppliers.some((s) => s.id === supplier.id);
                        return (
                          <div
                            key={supplier.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                            }`}
                          >
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSupplier(supplier)} />
                            <div className="flex-shrink-0">
                              <img
                                src={supplier.company_logo || "/placeholder.svg"}
                                alt={supplier.company_name}
                                className="w-[40px] h-[40px] rounded-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{supplier.company_name}</p>
                              <p className="text-xs text-[#1C1917]">{supplier.location}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {supplier.manufacturing.material_specialist
                                  .slice(0, 2)
                                  .map((specialty: any, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                {supplier.manufacturing.material_specialist.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{supplier.manufacturing.material_specialist.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Save as draft option */}
                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox
                      id="saveAsDraft"
                      checked={saveAsDraft}
                      onCheckedChange={(checked) => setSaveAsDraft(checked === true)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="saveAsDraft">Save as draft</Label>
                      <p className="text-sm text-[#1C1917]">Save this RFQ as a draft to review and send later.</p>
                    </div>
                  </div>
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
                    {saveAsDraft ? "Save Draft" : "Send RFQ"}
                  </Button>
                </div>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
