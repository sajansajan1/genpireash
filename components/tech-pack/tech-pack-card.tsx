"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Trash2,
  Eye,
  Pencil,
  FileText,
  Download,
  Loader2,
  ScanSearch,
  MoreVertical,
  Zap,
  Copy,
  Facebook,
  ChevronRight,
  FolderOpen,
  Lock,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generatePdffromTechpack } from "@/components/pdf-generator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useProductIdeasStore } from "@/lib/zustand/techpacks/getAllTechPacks";
import { getProductImages } from "@/app/actions/get-product-images";
import { useEffect } from "react";
import { createMinimalCollectionProductEntry } from "@/app/actions/collection-product-entry";
import { useUserStore } from "@/lib/zustand/useStore";
import { shareToX, shareToFacebook } from "@/lib/shareProduct";
import { useProductCollectionStore } from "@/lib/zustand/collections/createProductCollection/creatorProductCollection";
import { Input } from "../ui/input";
import { updateProductStatus } from "@/lib/supabase/productIdea";
import debounce from "lodash.debounce";
import { Label } from "../ui/label";

interface TechPackCardProps {
  techPack: any;
  onDelete: () => void;
  className?: string;
  viewMode: any;
}

export function TechPackCard({
  techPack,
  onDelete,
  viewMode = "grid",
  className = "",
}: TechPackCardProps) {
  const isList = viewMode === "list";
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [pdfLoader, setPdfLoader] = useState<boolean>(false);
  const { refreshProductIdeas } = useProductIdeasStore();
  const [productImages, setProductImages] = useState<any>(null);
  const [hasPendingApproval, setHasPendingApproval] = useState(false);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const {
    addToCollection,
    createCollectionAndAdd,
    ProductCollection,
    loadingProductCollection,
  } = useProductCollectionStore();

  const { user } = useUserStore();
  // Fetch images from all sources
  useEffect(() => {
    async function fetchImages() {
      const images = await getProductImages(techPack.id);
      setProductImages(images);
      setHasPendingApproval(images.hasPendingApproval || false);
    }
    fetchImages();
  }, [techPack.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setIsDeleteDialogOpen(false);
  };

  const handlePdfDownload = async () => {
    if (techPack?.tech_pack?.metadata) {
      toast({
        variant: "destructive",
        title: "No Tech Pack Available!",
        description: "Generate Tech Pack First to download pdf",
      });
      return;
    }

    try {
      setPdfLoader(true);
      await generatePdffromTechpack({ tech_pack: techPack });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setPdfLoader(false);
    }
  };

  const handleLensClick = () => {
    const imageUrl = techPack?.image_data?.front?.url;

    if (!imageUrl) {
      console.error("No image URL found");
      return;
    }

    // Create the Google Lens URL
    const lensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`;

    // Open in a new tab
    window.open(lensUrl, "_blank");
  };

  const duplicateProduct = async (originalProductId: string) => {
    if (!techPack || !user || !productImages) return null;
    console.log("techPack ==> ", techPack);
    console.log("productImages ==> ", productImages);
    const { id, created_at, updated_at, ...productData } = techPack;
    const productEntry = await createMinimalCollectionProductEntry({
      user_prompt: productData.prompt,
      category: "",
      intended_use: "",
      style_keywords: [],
      image: undefined,
      selected_colors: [],
      product_goal: "",
      designFile: productImages?.front || undefined,
      userId: user?.id,
      product_description: productData?.product_description,
      product_name: productData?.product_name,
      image_data: {
        front: {
          url: productImages?.front,
          prompt_used: productData?.image_data?.front?.prompt_used || null,
        },
        back: {
          url: productImages?.back,
          prompt_used: productData?.image_data?.back?.prompt_used || null,
        },
        side: {
          url: productImages?.side,
          prompt_used: productData.image_data?.side?.prompt_used || null,
        },
        illustration: {
          url: productImages?.illustration || productImages?.side,
          prompt_used:
            productData.image_data?.illustration?.prompt_used || null,
        },
        bottom: {
          url: productImages?.bottom || productImages?.side,
          prompt_used: productData?.image_data?.bottom?.prompt_used || null,
        },
        top: {
          url: productImages?.top || productImages?.side,
          prompt_used: productData?.image_data?.top?.prompt_used || null,
        },
      },
      tech_pack: productData.tech_pack || {},
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
      userId: user?.id,
      initialMessage: productData?.prompt,
      productData: productEntry?.data,
    });
    toast({
      variant: "default",
      title: "Congratulation",
      description: "Product Created Successfully",
    });
    await refreshProductIdeas();
    console.log("Product duplicated successfully:");
    return;
  };

  const handleCreate = async (newTitle: string, productId: string) => {
    if (!newTitle.trim()) return;

    const result = await createCollectionAndAdd(newTitle, productId);

    setNewTitle("");

    if (!result?.success) {
      toast({
        title: "Unable to create",
        description: result?.error || "Unable to create this collection.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Added Successfully",
      description: "Product has been added to the new collection.",
    });
  };

  const handleAddExisting = async (collectionId: string, productId: string) => {
    const result = await addToCollection(collectionId, productId);

    if (!result?.success) {
      toast({
        title: "Already added",
        description:
          result?.error || "Unable to add this product to the collection.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Added Successfully",
      description: "Product has been added to the collection.",
    });
  };

  const UpdateProductStatus = debounce(async () => {
    if (!techPack || !user || !productImages) return;

    const { id } = techPack;

    try {
      const data = await updateProductStatus(id);

      toast({
        variant: "default",
        title: "Status Updated",
        description: `Visibility changed successfully.`,
      });
      await refreshProductIdeas();
      return data;
    } catch (error) {
      console.error("Error status", error);

      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update status. Please try again.",
      });
    }
  }, 3000); // 3000ms debounce

  return (
    <TooltipProvider>
      <Card
        className={`overflow-hidden ${isList ? " flex flex-col sm:flex-row items-start gap-4 p-4" : "flex flex-col h-full"
          }${className}`}
      >
        {isList ? (
          <>
            <div className="flex w-full sm:w-1/3 gap-2 justify-center sm:justify-start relative">
              {productImages &&
                [
                  { url: productImages.front, view: "Front" },
                  { url: productImages.back, view: "Back" },
                  { url: productImages.side, view: "Side" },
                ]
                  .filter((img) => img.url)
                  .map((image, idx) => (
                    <div
                      key={idx}
                      className="bg-muted rounded overflow-hidden cursor-pointer w-24 h-24 sm:w-28 sm:h-28"
                    >
                      <img
                        src={
                          image.url ??
                          `/placeholder.svg?height=240&width=160&query=${encodeURIComponent(
                            techPack.tech_pack?.productName || "Product preview"
                          )}`
                        }
                        alt={`${techPack.tech_pack?.productName || "Product"} ${image.view}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `/placeholder.svg?height=240&width=160&query=${encodeURIComponent(
                            "tech pack preview"
                          )}`;
                        }}
                      />
                    </div>
                  ))}
              <div className="flex gap-2 items-center absolute top-2 right-2">
                {hasPendingApproval && (
                  <div>
                    <Badge className="bg-stone-200 text-xs">
                      {/* <Zap className="h-3 w-3 mr-1" /> */}
                      Draft
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col flex-1 justify-between">
              {/* Title + Description */}
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold truncate text-[#1C1917]">
                  {techPack.tech_pack?.productName ||
                    techPack?.product_name ||
                    "Untitled Product"}
                </CardTitle>

                <CardDescription
                  className={`text-sm text-[#1C1917] mt-1 ${isList ? "line-clamp-2 sm:line-clamp-3" : "line-clamp-2"}`}
                >
                  {techPack.tech_pack?.productOverview ||
                    techPack?.product_description ||
                    "No description available"}
                </CardDescription>

                {/* Created/Updated info */}
                <div className="text-xs sm:text-sm text-[#1C1917] mt-2 space-y-0.5">
                  <div>
                    Created:{" "}
                    {new Date(techPack.created_at).toLocaleDateString()}
                  </div>
                  {techPack.updated_at && (
                    <div>
                      Updated:{" "}
                      {new Date(techPack.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-2">
                {/* Left side buttons (wrap only on mobile) */}
                {hasPendingApproval ? (
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 sm:flex-none min-w-[180px]"
                      onClick={() => router.push(`/ai-designer?projectId=${techPack.id}&version=modular`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Continue Editing
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                    {techPack.selected_revision_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none min-w-[130px]"
                      onClick={() =>
                        router.push(`/product/${techPack.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Product
                    </Button>
                  )}
                  </div>
                )}

                {/* Right side icon buttons */}
                <div className="flex gap-2 justify-end w-full sm:w-auto pr-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label
                        htmlFor="privacy-list"
                        className="text-sm inline-flex items-center cursor-pointer gap-1"
                      >
                        {techPack?.is_public ? (
                          <Globe className="h-4 w-4 text-zinc-900" />
                        ) : (
                          <Lock className="h-4 w-4 text-zinc-900" />
                        )}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p className="max-w-xs text-xs">
                        {techPack.is_public
                          ? "Your product will be featured in our showcase and you can track views and upvotes"
                          : "Your product will be Private. Only you can see your product"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLensClick()}
                  >
                    <ScanSearch className="h-4 w-4 text-zinc-900" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePdfDownload()}
                  >
                    {pdfLoader ? (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                    ) : (
                      <Download className="h-4 w-4 text-zinc-900" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      router.push(
                        `/ai-designer?projectId=${techPack.id}&version=modular`
                      )
                    }
                  >
                    <Pencil className="h-4 w-4 text-zinc-900" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-zinc-900" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <CardHeader className="pb-2 relative">
              <div className="flex absolute top-1 right-2 z-10 gap-2 items-center">
                {hasPendingApproval && (
                  <div>
                    <Badge className="bg-stone-200 text-xs">
                      {/* <Zap className="h-3 w-3 mr-1" /> */}
                      Draft
                    </Badge>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {productImages &&
                  [
                    { url: productImages.front, view: "Front" },
                    { url: productImages.back, view: "Back" },
                    { url: productImages.side, view: "Side" },
                  ]
                    .filter((img) => img.url)
                    .map((image, idx) => (
                      <div
                        key={idx}
                        className=" bg-muted rounded overflow-hidden cursor-pointer"
                        role="button"
                        aria-label={`${techPack.tech_pack?.productName || "Product"} ${image.view}`}
                      >
                        <img
                          src={
                            image.url ??
                            `/placeholder.svg?height=240&width=160&query=${encodeURIComponent(
                              techPack.tech_pack?.productName ||
                                "Product preview"
                            )}`
                          }
                          alt={`${techPack.tech_pack?.productName || "Product"} ${image.view}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `/placeholder.svg?height=240&width=160&query=${encodeURIComponent(
                              "tech pack preview"
                            )}`;
                          }}
                        />
                      </div>
                    ))}
              </div>

              <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">
                    {techPack.tech_pack?.productName ||
                      techPack?.product_name ||
                      "Untitled Product"}
                  </CardTitle>
                </div>
                {/* Status Badge - Commented out as requested */}
                {techPack?.collection_edit_id && (
                  <Badge className={getStatusColor("Completed")}>
                    From Collection
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2 text-[#1C1917] text-sm">
                {techPack.tech_pack?.productOverview ||
                  techPack?.product_description ||
                  "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 space-y-2 flex-grow">
              <div className="text-xs sm:text-sm text-[#1C1917]">
                Created: {new Date(techPack.created_at).toLocaleDateString()}
              </div>
              {techPack.updated_at && (
                <div className="text-xs sm:text-sm text-[#1C1917]">
                  Updated: {new Date(techPack.updated_at).toLocaleDateString()}
                </div>
              )}

              {/* Add the estimated price section */}
              {/* {techPack.tech_pack?.price !== undefined && (
            <div className="mt-3 space-y-2 border-t pt-2">
              <div className="flex items-center">
                <p className="text-xs sm:text-sm font-medium">AI Estimation</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help inline-flex items-center justify-center rounded-full border h-4 w-4 text-xs font-semibold hover:bg-muted ml-1">
                      i
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">
                    <p className="text-xs">
                      This is an AI-generated estimate. Some products may require additional production costs and
                      extended lead time such as molding or tooling depending on complexity. Ask our vetted suppliers
                      for final estimation through RFQ.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {techPack.tech_pack?.price && (
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="mr-1">🧪</span>
                  <span className="text-[#1C1917]">Sample Cost:</span>
                  <span className="ml-1 font-medium">
                    {techPack.tech_pack?.costIncomeEstimation?.sampleCreationCost
                      ? techPack.tech_pack?.costIncomeEstimation?.sampleCreationCost?.range
                      : techPack.tech_pack?.price}
                  </span>
                </div>
              )}
              {techPack.tech_pack?.estimatedLeadTime && (
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="mr-1">🚛</span>
                  <span className="text-[#1C1917]">Lead Time:</span>
                  <span className="ml-1 font-medium">{techPack.tech_pack?.estimatedLeadTime}</span>
                </div>
              )}
            </div>
          )} */}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pt-2 flex-shrink-0 mt-auto">
              <div className="flex flex-col gap-2 w-full">
                {hasPendingApproval ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.push(`/ai-designer?projectId=${techPack.id}&version=modular`)}
                    className="w-full"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Continue Editing
                  </Button>
                ) : (
                  <>
                     {techPack.selected_revision_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/product/${techPack.id}`)
                    }
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Product
                  </Button>
                )}
                  </>
                )}
              </div>

              <div className="flex justify-between items-center w-full">
                {/* LEFT — Public / Private Icon */}
                <div className="flex items-center justify-center w-8 h-8 border rounded-md bg-zinc-50">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label
                        htmlFor="privacy-list"
                        className="text-sm inline-flex items-center cursor-pointer gap-1"
                      >
                        {techPack?.is_public ? (
                          <Globe className="h-4 w-4 text-zinc-900" />
                        ) : (
                          <Lock className="h-4 w-4 text-zinc-900" />
                        )}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p className="max-w-xs text-xs">
                        {techPack.is_public
                          ? "Your product will be featured in our showcase and you can track views and upvotes"
                          : "Your product will be Private. Only you can see your product"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* RIGHT — Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLensClick()}
                  >
                    <ScanSearch className="h-4 w-4 text-zinc-900" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePdfDownload()}
                    className="flex-shrink-0"
                  >
                    {pdfLoader ? (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                    ) : (
                      <Download className="h-4 w-4 text-zinc-900" />
                    )}
                    <span className="sr-only">Download Pdf</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      router.push(
                        `/ai-designer?projectId=${techPack.id}&version=modular`
                      )
                    }
                    className="flex-shrink-0"
                  >
                    <Pencil className="h-4 w-4 text-zinc-900" />
                    <span className="sr-only">Edit</span>
                  </Button>

                  {/* More Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateProduct(techPack.id);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCollectionDialogOpen(true);
                        }}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Add to collection
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          UpdateProductStatus();
                        }}
                      >
                        {techPack?.is_public ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 mr-2" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardFooter>
          </>
        )}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the tech pack "
                {techPack.tech_pack?.productName || "this product"}". This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/*  */}

        <AlertDialog
          open={isCollectionDialogOpen}
          onOpenChange={setIsCollectionDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">Add to Collection</h2>
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setShowCreateInput(!showCreateInput)}
                >
                  {showCreateInput ? "Close" : "Create New"}
                </Button>
              </div>
              {ProductCollection?.length <= 0 && (
                <AlertDialogDescription>
                  No collections available
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>

            {/* INPUT BOX FOR NEW COLLECTION */}
            {showCreateInput && (
              <div className="space-y-2 mt-2">
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Enter collection name"
                  value={newTitle}
                  onChange={(e: any) => setNewTitle(e.target.value)}
                />

                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleCreate(newTitle, techPack.id)}
                // className="w-full p-2 rounded bg-black text-white"
                >
                  {loadingProductCollection ? "Creating..." : "Save Collection"}
                </Button>
              </div>
            )}

            {/* EXISTING COLLECTIONS */}
            {ProductCollection && ProductCollection?.length > 0 && (
              <div className="mt-6">
                <p className="text-md mb-2">Add to existing collection:</p>

                <div className="grid gap-2">
                  {ProductCollection.map((col: any) => (
                    <Button
                      variant="outline"
                      key={col.id}
                      onClick={() => handleAddExisting(col.id, techPack.id)}
                      disabled={loadingProductCollection}
                      className="w-full p-3 rounded-xl border border-gray-300 text-black font-medium text-bold
             hover:bg-gray-50 active:scale-[0.98] transition-all duration-150
             flex items-center justify-between shadow-sm"
                    >
                      <span>{col.title}</span>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </TooltipProvider>
  );
}
