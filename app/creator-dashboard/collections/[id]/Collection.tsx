"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Eye,
  MoreVertical,
  Trash2,
  Copy,
  Download,
  Send,
  FileText,
  Package,
  X,
  Edit3,
  Check,
  Zap,
  Grid3X3,
  List,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetCollectionStore } from "@/lib/zustand/collections/getCollection";
import { toast } from "@/hooks/use-toast";
import { useUserStore } from "@/lib/zustand/useStore";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { useGenerationProgress } from "@/hooks/use-generation-progress";
import { createMinimalCollectionProductEntry, fetchProductIdExist } from "@/app/actions/collection-product-entry";
import { useGetCreatorDnaStore } from "@/lib/zustand/brand-dna/getDna";
import { useCreateNotificationStore } from "@/lib/zustand/notifications/createNotification";
import { GenerationProgressModal } from "@/components/generation-progress-modal";
import { Badge } from "@/components/ui/badge";

export default function CollectionPage({ id }: { id: string }) {
  const router = useRouter();
  const [modalImage, setModalImage] = useState<any>(null);
  const [generatedCollection, setGeneratedCollection] = useState<any>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingData, setEditingData] = useState<any>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useUserStore();
  const [productPrompt, setProductPrompt] = useState("");
  const { setCreateNotification } = useCreateNotificationStore();
  const {
    isLoading,
    currentStep,
    stepProgress,
    elapsedTime,
    currentFunFact,
    generatedImages,
    startProgress,
    stopProgress,
    updateGeneratedImages,
  } = useGenerationProgress();

  const { getCreatorCredits } = useGetCreditsStore();
  const { GetCollection, loadingGetCollection, errorGetCollection, refreshGetCollection } = useGetCollectionStore();
  const { getCreatorDna } = useGetCreatorDnaStore();

  useEffect(() => {
    const loadCollection = async () => {
      if (id) {
        await refreshGetCollection({ id });
      }
    };
    loadCollection();
  }, [id, refreshGetCollection]);

  const handleEditName = (item: any, index: number) => {
    setEditingItemId(index);
    setEditingName(item.name);
  };

  const handleSaveName = (itemId: string) => {
    if (generatedCollection) {
      const updatedItems = generatedCollection.items.map((item: any) =>
        item.id === itemId ? { ...item, title: editingName } : item
      );
      setGeneratedCollection({ ...generatedCollection, items: updatedItems });
    }
    setEditingItemId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingName("");
  };

  // Load revision history when opening the editor
  const mapImageDataToProductImages = (imageDataArray: any[]) => {
    return imageDataArray.reduce((acc, image) => {
      acc[image.view] = image.url;
      return acc;
    }, {} as Record<string, string>);
  };

  const buildInitialChatMessage = (formData: {
    productIdea: string;
    productDetail: string;
    category?: string;
    intendedUse?: string;
    selectedKeywords?: string[];
    selectedColors?: string[];
    productGoal?: string;
    hasDesignFile: boolean;
    hasLogo: boolean;
    brandDNA?: any;
    applyBrandDNA?: boolean;
  }): string => {
    const parts: string[] = [];

    // Brand DNA Section (if enabled and available)
    if (formData.applyBrandDNA && formData.brandDNA) {
      parts.push(`\n=== BRAND DNA ===`);
      parts.push(`This product should align with the following brand identity:\n`);

      if (formData.brandDNA.brand_name) {
        parts.push(`Brand Name: ${formData.brandDNA.brand_name}`);
      }

      if (formData.brandDNA.tagline) {
        parts.push(`Tagline: ${formData.brandDNA.tagline}`);
      }

      if (formData.brandDNA.category) {
        parts.push(`Brand Category: ${formData.brandDNA.category}`);
      }

      if (formData.brandDNA.audience || formData.brandDNA.target_audience) {
        parts.push(`Target Audience: ${formData.brandDNA.audience || formData.brandDNA.target_audience}`);
      }

      if (formData.brandDNA.brand_story) {
        parts.push(`Brand Story: ${formData.brandDNA.brand_story}`);
      }

      if (
        formData.brandDNA.style_keyword &&
        Array.isArray(formData.brandDNA.style_keyword) &&
        formData.brandDNA.style_keyword.length > 0
      ) {
        parts.push(`Brand Style Keywords: ${formData.brandDNA.style_keyword.join(", ")}`);
      }

      if (formData.brandDNA.colors && Array.isArray(formData.brandDNA.colors) && formData.brandDNA.colors.length > 0) {
        parts.push(`Brand Colors: ${formData.brandDNA.colors.join(", ")}`);
      }

      if (formData.brandDNA.tone_values) {
        parts.push(`Brand Tone & Values: ${formData.brandDNA.tone_values}`);
      }

      if (formData.brandDNA.restrictions) {
        parts.push(`Brand Restrictions (Dos & Don'ts): ${formData.brandDNA.restrictions}`);
      }

      if (
        formData.brandDNA.patterns &&
        Array.isArray(formData.brandDNA.patterns) &&
        formData.brandDNA.patterns.length > 0
      ) {
        parts.push(`Preferred Patterns: ${formData.brandDNA.patterns.join(", ")}`);
      }

      parts.push(`\nIMPORTANT: All design decisions should be consistent with this brand identity.\n`);
      parts.push(`=== END BRAND DNA ===\n`);
    }

    // Main idea/description
    if (formData.productIdea) {
      parts.push(`Product Idea: ${formData.productIdea}`);
    }
    if (formData.productDetail) {
      parts.push(`\nDetailed Description: ${formData.productDetail}`);
    }

    // Category and use
    if (formData.category) {
      parts.push(`\nCategory: ${formData.category}`);
    }
    if (formData.intendedUse) {
      parts.push(`\nIntended Use: ${formData.intendedUse}`);
    }

    // Style keywords
    if (formData.selectedKeywords && formData.selectedKeywords.length > 0) {
      parts.push(`\nStyle Keywords: ${formData.selectedKeywords.join(", ")}`);
    }

    // Colors
    if (formData.selectedColors && formData.selectedColors.length > 0) {
      parts.push(`\nColor Palette: ${formData.selectedColors.join(", ")}`);
    }

    // Product goals
    if (formData.productGoal) {
      parts.push(`\nProduct Goal: ${formData.productGoal}`);
    }

    // Assets attached
    if (formData.hasDesignFile) {
      parts.push(`\n\n📎 Design file attached - analyze and generate product views based on this design`);
    }
    if (formData.hasLogo) {
      parts.push(`\n🏷️ Brand logo attached - incorporate into product design`);
    }

    return parts.join("");
  };

  const handleSubmitNew = async (item: any) => {
    if (!item) return;
    console.log("item ==> ", item);

    // Credit and user check
    if (!user) {
      console.error("No user logged in");
      return;
    }

    if ((getCreatorCredits?.credits ?? 0) < 3) {
      return toast({
        variant: "destructive",
        title: "No Credits left!",
        description: "You don't have any credits left. Please purchase Credits to Generate Techpack",
      });
    }

    // Map images
    const productImages = mapImageDataToProductImages(item.image_data || []);
    const frontImage = item.image_data?.find((img: any) => img.view === "front");
    setProductPrompt(frontImage?.prompt_used || "");

    console.log("Checking if product already exists:", item.id);

    // Step 1: Check if the product already exists
    const existingProductId = await fetchProductIdExist(item.id);

    if (existingProductId) {
      console.log("Existing TechPack found:", existingProductId);
      const params = new URLSearchParams({
        projectId: existingProductId,
        autoGenerate: "false",
        generateMoreViews: "false",
      });
      setTimeout(() => {
        router.push(`/ai-designer?${params.toString()}&version=modular`);
      }, 500);

      return; // Exit early if product exists
    }

    // Step 2: If product doesn't exist, start creation
    startProgress();

    try {
      const initialMessage = buildInitialChatMessage({
        productIdea: GetCollection.collection_description,
        productDetail: "",
        category: "",
        intendedUse: "",
        selectedKeywords: [],
        selectedColors: [],
        productGoal: "",
        hasDesignFile: true,
        hasLogo: false,
        brandDNA: getCreatorDna,
        applyBrandDNA: false,
      });

      const productEntry = await createMinimalCollectionProductEntry({
        user_prompt: GetCollection.ai_description,
        category: "",
        intended_use: "",
        style_keywords: [],
        image: undefined,
        selected_colors: [],
        product_goal: "",
        designFile: productImages.front || undefined,
        userId: user.id,
        project_id: item.id,
        product_description: item.collection_description,
        product_name: item.name,
        image_data: {
          front: { url: productImages.front, prompt_used: productPrompt },
          back: { url: productImages.back, prompt_used: productPrompt },
          side: { url: productImages.side, prompt_used: productPrompt },
        },
        collection_edit_id: id,
      });

      if (!productEntry.success || !productEntry.projectId) {
        throw new Error(productEntry.error || "Failed to create project");
      }

      const projectId = productEntry.projectId;
      console.log("✅ Project created:", projectId);

      // Step 3: Create chat session
      const { createChatSession } = await import("@/app/actions/chat-session");
      const chatSession = await createChatSession({
        productId: projectId,
        userId: user.id,
        initialMessage,
        productData: productEntry.data,
      });

      if (!chatSession.success) {
        console.warn("⚠️ Chat session creation failed:", chatSession.error);
      } else {
        console.log("✅ Chat session created:", chatSession.sessionId);
      }

      // Step 4: Notify user
      await setCreateNotification({
        senderID: user.id,
        receiverID: user.id,
        title: "Product Design Started",
        message: `Your product "${GetCollection.collection_description.substring(0, 50)}..." is being generated`,
        type: "product_created",
      });

      // Step 5: Redirect to AI designer
      const params = new URLSearchParams({
        projectId,
        autoGenerate: "false",
        generateMoreViews: "false",
      });

      setTimeout(() => {
        router.push(`/ai-designer?${params.toString()}&version=modular`);
      }, 500);
    } catch (err) {
      console.error("Error in handleSubmitNew:", err);
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      stopProgress();
    }
  };

  if (!GetCollection || loadingGetCollection || errorGetCollection) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-700">Loading Collections...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        {/* Left section */}
        <div>
          <div className="flex items-center gap-2 text-sm text-[#1C1917] mb-2">
            <span>Collections</span>
            <span>→</span>
            <span>{GetCollection.collection_name}</span>
          </div>
          <h1 className="text-2xl font-bold">{GetCollection.collection_name}</h1>
          <p className="text-[#1C1917] mb-2">{GetCollection.collection_description}</p>
          {GetCollection?.ai_description && <p className="text-[#1C1917] mb-2">{GetCollection?.ai_description}</p>}
          <p className="text-sm text-[#1C1917]">{GetCollection.length} items generated</p>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-r-none ${viewMode === "grid"
                ? "bg-black hover:bg-gray-800 text-white"
                : "bg-[rgba(244,243,240,1)] hover:bg-stone-100 text-black"
                }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>

            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-l-none ${viewMode === "list"
                ? "bg-black hover:bg-black text-white"
                : "bg-[rgba(244,243,240,1)] hover:bg-stone-100 text-black"
                }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push(`/creator-dashboard/collections`)}
          // className="bg-zinc-900 hover:"
          >
            Back to Collections
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        /* Collection Grid */
        <div className="grid grid-cols-1 xl:grid-cols-3  gap-6">
          {GetCollection?.tech_packs?.map((item: any, index: number) => (
            <Card key={index} className="flex flex-col">
              <div
                className={`grid gap-2 mb-4 ${item.image_data?.length === 1 ? "grid-cols-1" : "grid-cols-3"
                  }`}
              >
                {item.image_data?.map((image: any, index: number) => (
                  <div
                    key={index}
                    className="h-56 w-full bg-white rounded flex items-center justify-center cursor-pointer"
                    onClick={() => setModalImage(image.url || "/placeholder.svg")}
                  >
                    <img
                      src={image.url}
                      alt={`${item.name} view ${image.view}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
              <CardContent className="flex flex-col flex-1 p-4">
                {/* Header: name + edit controls */}
                <div className="flex items-center justify-between mb-2">
                  {editingItemId === index ? (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex  gap-2">
                        <Input
                          value={editingData.name}
                          onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                          className="h-8 text-sm"
                        />
                        <Input
                          value={editingData.productType}
                          onChange={(e) => setEditingData({ ...editingData, productType: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                      // onClick={() => handleSaveData(item.id, index, editingData)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      {/* Show Draft Badge if only front image exists */}
                      {item.image_data?.length === 1 && item.image_data[0].view === "front" && (
                        <Badge className="bg-stone-200 text-xs text-black hover:bg-stone-300">Draft</Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-2">
                  {editingItemId === index ? (
                    <Input
                      type="number"
                      value={editingData.price}
                      onChange={(e) => setEditingData({ ...editingData, price: e.target.value })}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <div>
                      <span className="text-sm font-medium">${item.price}</span>
                      {item.material?.length > 0 && (
                        <span className="text-sm text-[#1C1917]"> • {item.material.join(", ")}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Materials */}
                <div className="mb-2">
                  {editingItemId === index ? (
                    <Input
                      value={editingData.material?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          material: e.target.value.split(",").map((m) => m.trim()),
                        })
                      }
                      className="h-8 text-sm"
                      placeholder="Materials (comma separated)"
                    />
                  ) : (
                    // item.material?.length > 0 && (
                    //   <span className="text-sm text-[#1C1917]">
                    //     • {item.material.join(", ")}
                    //   </span>
                    // )
                    ""
                  )}
                </div>

                {/* Buttons at bottom */}
                <div className="mt-auto flex items-center gap-2 justify-end">
                  {editingItemId !== index && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingItemId(index);
                        setEditingData({ ...item }); // load item for editing
                      }}
                      className="bg-transparent"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  )}

                  <Button
                    variant={item.image_data?.length === 1 && item.image_data[0].view === "front" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      handleSubmitNew(item);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    {item.image_data?.length === 1 && item.image_data[0].view === "front"
                      ? "Continue Editing"
                      : "Edit in Editor"}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Zap className="h-4 w-4 mr-2" />
                        Regenerate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Added List View */
        <div className="space-y-4">
          {GetCollection?.tech_packs?.map((item: any, index: number) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image_data?.map((image: any, index: number) => (
                    <div
                      key={index}
                      className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0"
                      onClick={() => setModalImage(image.url || "/placeholder.svg")}
                    >
                      <img
                        src={image.url}
                        alt={`${item.name} view ${image.view}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      {editingItemId === index ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={item.name}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveName(item.id);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" onClick={() => handleSaveName(item.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            {item.image_data?.length === 1 && item.image_data[0].view === "front" && (
                              <Badge className="bg-stone-200 text-xs text-black hover:bg-stone-300">
                                Draft
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditName(item, index)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {/* <Badge variant="secondary">{item.productType}</Badge> */}
                      <span className="text-sm font-medium">${item.price}</span>
                      {item.material?.length > 0 && (
                        <span className="text-sm text-[#1C1917]">• {item.material.join(", ")}</span>
                      )}
                    </div>
                    <p className="text-sm text-[#1C1917] mb-3 line-clamp-2">{item.collectionDescription}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Complete Collection Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Collection</DialogTitle>
            <DialogDescription>Choose how you'd like to finalize your collection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Generate Product Guidelines for all items
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Package className="h-4 w-4 mr-2" />
              Bundle into a Collection Tech Pack
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export (PDF/Excel)
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Send className="h-4 w-4 mr-2" />
              Send to Suppliers
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCompleteModal(false);
                setGeneratedCollection(null);
              }}
            >
              Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          {/* Close button on the left */}
          <button
            onClick={() => setModalImage(null)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-3 bg-gray-800 rounded-full hover:bg-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          {/* Fullscreen Image */}
          <img
            src={modalImage || "/placeholder.svg"}
            alt="Full screen"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
      <GenerationProgressModal
        isLoading={isLoading}
        currentStep={currentStep}
        stepProgress={stepProgress}
        elapsedTime={elapsedTime}
        // currentFunFact={currentFunFact}
        generatedImages={generatedImages}
      />
    </div>
  );
}
