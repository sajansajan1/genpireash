"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Box,
  Loader2,
  Eye,
  RefreshCw,
  Grid3X3,
  List,
  ChevronDown,
  ChevronRight,
  History,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dynamic from "next/dynamic";

// Dynamic imports for 3D components
const Model3DViewer = dynamic(
  () =>
    import("@/components/3d-viewer/Model3DViewer").then((mod) => ({
      default: mod.Model3DViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);
const ExportOptions = dynamic(
  () =>
    import("@/components/3d-viewer/ExportOptions").then((mod) => ({
      default: mod.ExportOptions,
    })),
  {
    ssr: false,
  }
);
const Model3DVersionsDialog = dynamic(
  () =>
    import("@/components/3d-viewer/Model3DVersionsDialog").then((mod) => ({
      default: mod.Model3DVersionsDialog,
    })),
  {
    ssr: false,
  }
);

interface ImageDataEntry {
  view?: "front" | "back" | "side" | "top" | "bottom";
  type?: string;
  angle?: string;
  url: string;
  created_at?: string;
  prompt_used?: string;
  regenerated?: boolean;
}

interface Product {
  id: string;
  tech_pack: {
    productName: string;
    productOverview: string;
    image_data?: ImageDataEntry[];
    [key: string]: any;
  };
  image_data?: {
    front?: { url: string };
    back?: { url: string };
    side?: { url: string };
    top?: { url: string };
    bottom?: { url: string };
  };
  model_3d?: {
    url: string;
    taskId: string;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

interface Collection {
  id: string;
  collection_name: string;
  collection_description: string;
  collection_image: {
    front?: { url: string };
    back?: { url: string };
    side?: { url: string };
    top?: { url: string };
    bottom?: { url: string };
  };
  products?: Product[];
  model_3d?: {
    url: string;
    taskId: string;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ThreeDModelsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsPagination, setProductsPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsPagination, setCollectionsPagination] =
    useState<Pagination>({
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    });

  // 3D Model state
  const [generating3DId, setGenerating3DId] = useState<string | null>(null);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [current3DModel, setCurrent3DModel] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // 3D Model Versions Dialog state
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);
  const [versionsDialogData, setVersionsDialogData] = useState<{
    sourceType: "product" | "collection";
    sourceId: string;
    sourceName: string;
  } | null>(null);

  // Refs for infinite scroll observer
  const loadMoreProductsRef = useRef<HTMLDivElement>(null);
  const loadMoreCollectionsRef = useRef<HTMLDivElement>(null);

  // Track expanded collections
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set()
  );

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState<{
    item: Product | Collection;
    type: "product" | "collection";
  } | null>(null);

  // Helper: Enrich items with 3D model data from database
  const enrichWithModel3D = async (
    items: any[],
    sourceType: "product" | "collection"
  ) => {
    if (!items || items.length === 0) return items;

    try {
      // Fetch 3D models for all items
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          try {
            // First try to get the active successful model
            const response = await fetch(
              `/api/product-3d-models?sourceType=${sourceType}&sourceId=${item.id}`
            );
            const result = await response.json();

            if (result.success && result.model) {
              return {
                ...item,
                model_3d: {
                  url: result.model.model_urls?.glb,
                  taskId: result.model.task_id,
                  status: result.model.status,
                  thumbnail_url: result.model.thumbnail_url,
                  model_urls: result.model.model_urls,
                  texture_urls: result.model.texture_urls,
                  version: result.model.version,
                  id: result.model.id,
                  progress: result.model.progress,
                },
              };
            }

            // If no successful model, check for incomplete generation
            const allResponse = await fetch(
              `/api/product-3d-models?sourceType=${sourceType}&sourceId=${item.id}&includeAll=true`
            );
            const allResult = await allResponse.json();

            if (allResult.success && allResult.models && allResult.models.length > 0) {
              // Find the most recent active model (could be PENDING or IN_PROGRESS)
              const activeModel = allResult.models.find((m: any) => m.is_active);
              if (activeModel && ["PENDING", "IN_PROGRESS"].includes(activeModel.status)) {
                return {
                  ...item,
                  model_3d: {
                    url: null, // No URL yet
                    taskId: activeModel.task_id,
                    status: activeModel.status,
                    thumbnail_url: null,
                    model_urls: {},
                    texture_urls: [],
                    version: activeModel.version,
                    id: activeModel.id,
                    progress: activeModel.progress,
                  },
                };
              }
            }

            return item;
          } catch (error) {
            console.error(
              `Failed to fetch 3D model for ${sourceType} ${item.id}:`,
              error
            );
            return item;
          }
        })
      );

      return enrichedItems;
    } catch (error) {
      console.error("Error enriching items with 3D models:", error);
      return items;
    }
  };

  // Fetch products
  const fetchProducts = async (page: number = 1, append: boolean = false) => {
    setProductsLoading(true);
    try {
      const response = await fetch(
        `/api/tech-pack/get-all-techpacks?page=${page}&limit=12`
      );
      const result = await response.json();

      console.log("Products API response:", result);

      if (result.data) {
        // Enrich products with 3D model data
        const enrichedProducts = await enrichWithModel3D(
          result.data,
          "product"
        );
        setProducts((prev) =>
          append ? [...prev, ...enrichedProducts] : enrichedProducts
        );
        setProductsPagination(result.pagination);
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products",
      });
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch collections
  const fetchCollections = async (
    page: number = 1,
    append: boolean = false
  ) => {
    setCollectionsLoading(true);
    try {
      const response = await fetch(
        `/api/ai-collections/get-all-collections-paginated?page=${page}&limit=12`
      );
      const result = await response.json();

      console.log("Collections API response:", result);

      if (result.collections) {
        // Enrich collections and their products with 3D model data
        const enrichedCollections = await Promise.all(
          result.collections.map(async (collection: any) => {
            // Enrich collection itself
            const collectionWith3D = await enrichWithModel3D(
              [collection],
              "collection"
            );
            const enrichedCollection = collectionWith3D[0];

            // Enrich products within the collection
            if (
              enrichedCollection.products &&
              enrichedCollection.products.length > 0
            ) {
              enrichedCollection.products = await enrichWithModel3D(
                enrichedCollection.products,
                "product"
              );
            }

            return enrichedCollection;
          })
        );

        setCollections((prev) =>
          append ? [...prev, ...enrichedCollections] : enrichedCollections
        );
        setCollectionsPagination(result.pagination);
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load collections",
      });
    } finally {
      setCollectionsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts(1);
    } else {
      fetchCollections(1);
    }
  }, [activeTab]);

  // Infinite scroll with Intersection Observer for Products
  useEffect(() => {
    if (activeTab !== "products") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // When the load more element is visible and we have more data
        if (
          entries[0].isIntersecting &&
          productsPagination.page < productsPagination.totalPages &&
          !productsLoading
        ) {
          fetchProducts(productsPagination.page + 1, true);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    const currentRef = loadMoreProductsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [
    activeTab,
    productsPagination.page,
    productsPagination.totalPages,
    productsLoading,
  ]);

  // Infinite scroll with Intersection Observer for Collections
  useEffect(() => {
    if (activeTab !== "collections") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // When the load more element is visible and we have more data
        if (
          entries[0].isIntersecting &&
          collectionsPagination.page < collectionsPagination.totalPages &&
          !collectionsLoading
        ) {
          fetchCollections(collectionsPagination.page + 1, true);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    const currentRef = loadMoreCollectionsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [
    activeTab,
    collectionsPagination.page,
    collectionsPagination.totalPages,
    collectionsLoading,
  ]);

  // Show confirmation before generating 3D
  const showGenerate3DConfirmation = (
    item: Product | Collection,
    type: "product" | "collection"
  ) => {
    setPendingGeneration({ item, type });
    setShowConfirmDialog(true);
  };

  // Handle confirmed 3D generation
  const handleGenerate3D = async () => {
    if (!pendingGeneration) return;

    const { item, type } = pendingGeneration;
    setShowConfirmDialog(false);
    setGenerating3DId(item.id);

    // For products from collections, check tech_pack.image_data array
    let imageUrls: any = {};

    if (type === "product") {
      const product = item as Product;
      // Check if it's a collection product with image_data array in tech_pack
      if (
        product.tech_pack?.image_data &&
        Array.isArray(product.tech_pack.image_data)
      ) {
        const imageArray = product.tech_pack.image_data;
        imageArray.forEach((img: ImageDataEntry) => {
          // Check for 'view' field (primary), then 'type', then 'angle'
          const key = img.view || img.type || img.angle;
          if (key && img.url) {
            imageUrls[key] = img.url;
          }
        });
      } else if (product.image_data) {
        // Regular product with image_data object
        imageUrls = {
          front: product.image_data.front?.url,
          back: product.image_data.back?.url,
          side: product.image_data.side?.url,
          top: product.image_data.top?.url,
          bottom: product.image_data.bottom?.url,
        };
      }
    } else {
      // Collection
      const collection = item as Collection;
      imageUrls = {
        front: collection.collection_image?.front?.url,
        back: collection.collection_image?.back?.url,
        side: collection.collection_image?.side?.url,
        top: collection.collection_image?.top?.url,
        bottom: collection.collection_image?.bottom?.url,
      };
    }

    if (!imageUrls.front || !imageUrls.back) {
      toast({
        variant: "destructive",
        title: "Missing Images",
        description:
          "At least front and back images are required for 3D generation.",
      });
      setGenerating3DId(null);
      return;
    }

    try {
      const response = await fetch("/api/generate-3d-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrls,
          sourceType: type,
          sourceId: item.id,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Generation failed");
      }

      toast({
        title: "Generation Started",
        description:
          "Your 3D model is being generated. This may take 2-3 minutes. You can leave this page and return later - we'll notify you when it's ready.",
      });

      // Poll for completion every 15 seconds
      const taskId = result.taskId;
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/generate-3d-model?taskId=${taskId}`
          );
          const status = await statusRes.json();

          if (status.status === "SUCCEEDED") {
            clearInterval(pollInterval);

            // Update the item with 3D model data
            const model3D = {
              url: status.model_urls.glb,
              taskId,
              status: "complete",
            };

            if (type === "product") {
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === item.id ? { ...p, model_3d: model3D } : p
                )
              );
            } else {
              setCollections((prev) =>
                prev.map((c) =>
                  c.id === item.id ? { ...c, model_3d: model3D } : c
                )
              );
            }

            toast({
              title: "3D Model Generated!",
              description: "Your 3D model is ready to view and download.",
            });

            setGenerating3DId(null);
          } else if (status.status === "FAILED") {
            clearInterval(pollInterval);
            throw new Error("Generation failed");
          }
        } catch (pollError) {
          clearInterval(pollInterval);
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "Failed to check generation status.",
          });
          setGenerating3DId(null);
        }
      }, 20000); // Poll every 20 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generating3DId === item.id) {
          setGenerating3DId(null);
          toast({
            variant: "destructive",
            title: "Generation Timeout",
            description: "3D generation took too long. Please try again.",
          });
        }
      }, 300000);
    } catch (error) {
      console.error("3D generation error:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate 3D model. Please try again.",
      });
      setGenerating3DId(null);
    }
  };

  // View 3D model
  const handleView3D = (
    item: Product | Collection,
    type: "product" | "collection"
  ) => {
    if (!item.model_3d?.url) return;

    const name =
      type === "product"
        ? (item as Product).tech_pack?.productName
        : (item as Collection).collection_name;

    setCurrent3DModel({
      url: item.model_3d.url,
      name: name || "Product",
    });
    setShow3DViewer(true);
  };

  // View all 3D model versions
  const handleViewVersions = (
    item: Product | Collection,
    type: "product" | "collection"
  ) => {
    const name =
      type === "product"
        ? (item as Product).tech_pack?.productName
        : (item as Collection).collection_name;

    setVersionsDialogData({
      sourceType: type,
      sourceId: item.id,
      sourceName: name || "Unknown",
    });
    setShowVersionsDialog(true);
  };

  // When a version is selected from the versions dialog, view it
  const handleVersionSelected = (version: any) => {
    if (!version.model_urls?.glb) return;

    setCurrent3DModel({
      url: version.model_urls.glb,
      name: versionsDialogData?.sourceName || "Product",
    });
    setShowVersionsDialog(false);
    setShow3DViewer(true);
  };

  // Check generation status for stuck/incomplete models
  const handleCheckStatus = async (
    item: Product | Collection,
    type: "product" | "collection"
  ) => {
    if (!item.model_3d?.taskId) return;

    setGenerating3DId(item.id);

    try {
      const response = await fetch(
        `/api/generate-3d-model?taskId=${item.model_3d.taskId}`
      );
      const status = await response.json();

      if (status.status === "SUCCEEDED") {
        toast({
          title: "3D Model Ready!",
          description: "Your 3D model has been completed.",
        });
        // Refresh the data
        if (type === "product") {
          fetchProducts(productsPagination.page);
        } else {
          fetchCollections(collectionsPagination.page);
        }
      } else if (status.status === "FAILED") {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: "The 3D model generation has failed.",
        });
      } else {
        toast({
          title: "Still Processing",
          description: `Generation is ${status.progress || 0}% complete. Status: ${status.status}`,
        });
      }
    } catch (error) {
      console.error("Status check error:", error);
      toast({
        variant: "destructive",
        title: "Check Failed",
        description: "Failed to check generation status.",
      });
    } finally {
      setGenerating3DId(null);
    }
  };

  // Toggle collection expansion
  const toggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  // Render product/collection card
  const renderCard = (
    item: Product | Collection,
    type: "product" | "collection"
  ) => {
    const isProduct = type === "product";
    const name = isProduct
      ? (item as Product).tech_pack?.productName
      : (item as Collection).collection_name;
    const description = isProduct
      ? (item as Product).tech_pack?.productOverview
      : (item as Collection).collection_description;
    const images = isProduct
      ? (item as Product).image_data
      : (item as Collection).collection_image;
    const has3D = Boolean(item.model_3d?.url);
    const isGenerating = generating3DId === item.id;
    const hasIncompleteGeneration = item.model_3d &&
      item.model_3d.status &&
      item.model_3d.status !== "SUCCEEDED" &&
      ["PENDING", "IN_PROGRESS"].includes(item.model_3d.status);

    if (viewMode === "list") {
      return (
        <Card
          key={item.id}
          className="mb-4 overflow-hidden hover:shadow-md transition-all duration-300 group"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {images?.front?.url ? (
                  <img
                    src={images.front.url}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Box className="h-8 w-8" />
                  </div>
                )}
                {has3D && (
                  <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                    <Box className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy truncate">{name}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {hasIncompleteGeneration ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCheckStatus(item, type)}
                    disabled={isGenerating}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Check Generation Status
                      </>
                    )}
                  </Button>
                ) : has3D ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView3D(item, type)}
                      className="border-[rgb(24,24,27)] text-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)] hover:text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View 3D
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        (window.location.href = `/ai-designer?projectId=${item.id}&version=modular`)
                      }
                      className="border-[rgb(24,24,27)] text-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)] hover:text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Designer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewVersions(item, type)}
                      className="border-[rgb(24,24,27)] text-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)] hover:text-white"
                    >
                      <History className="h-4 w-4 mr-2" />
                      Versions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => showGenerate3DConfirmation(item, type)}
                      disabled={isGenerating}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}
                      />
                      Regenerate (10 credits)
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => showGenerate3DConfirmation(item, type)}
                    disabled={isGenerating}
                    className="bg-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)]/90 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Box className="h-4 w-4 mr-2" />
                        Generate 3D (10 credits)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Grid view
    return (
      <Card
        key={item.id}
        className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
      >
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {images?.front?.url ? (
            <img
              src={images.front.url}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Box className="h-16 w-16" />
            </div>
          )}

          {has3D && (
            <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Box className="h-3.5 w-3.5" />
              3D Ready
            </div>
          )}
        </div>

        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-lg font-semibold line-clamp-1 text-[rgb(24,24,27)]">
            {name}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm text-gray-600 mt-1">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col justify-between">
          <p className="text-xs text-gray-500 mb-4">
            Created {new Date(item.created_at).toLocaleDateString()}
          </p>

          <div className="mt-auto space-y-2">
            {hasIncompleteGeneration ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCheckStatus(item, type)}
                disabled={isGenerating}
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Generation Status
                  </>
                )}
              </Button>
            ) : has3D ? (
              <>
                <Button
                  size="sm"
                  onClick={() => handleView3D(item, type)}
                  className="w-full bg-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)]/90 text-white font-medium"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View 3D Model
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `/ai-designer?projectId=${item.id}&version=modular`)
                  }
                  className="w-full border-[rgb(24,24,27)] text-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)] hover:text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Open in AI Designer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewVersions(item, type)}
                  className="w-full border-[rgb(24,24,27)] text-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)] hover:text-white"
                >
                  <History className="h-4 w-4 mr-2" />
                  View Versions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => showGenerate3DConfirmation(item, type)}
                  disabled={isGenerating}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`}
                  />
                  Regenerate (10 credits)
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => showGenerate3DConfirmation(item, type)}
                disabled={isGenerating}
                className="w-full bg-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)]/90 text-white font-medium shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Box className="h-4 w-4 mr-2" />
                    Generate 3D (10 credits)
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render collection item (list view only for collections)
  const renderCollectionItem = (collection: Collection) => {
    const isExpanded = expandedCollections.has(collection.id);
    const products = collection.products || [];
    const productCount = products.length;

    return (
      <Card key={collection.id} className="overflow-hidden">
        {/* Collection Header */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-4"
          onClick={() => toggleCollection(collection.id)}
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[rgb(24,24,27)] text-lg">
              {collection.collection_name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">
              {collection.collection_description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(collection.created_at).toLocaleDateString()} •{" "}
              {productCount} {productCount === 1 ? "product" : "products"}
            </p>
          </div>

          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            )}
          </div>
        </div>

        {/* Expanded Products List */}
        {isExpanded && products.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.tech_pack?.image_data?.[0]?.url ? (
                          <img
                            src={product.tech_pack.image_data[0].url}
                            alt={product.tech_pack?.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Box className="h-8 w-8" />
                          </div>
                        )}
                        {product.model_3d?.url && (
                          <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                            <Box className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[rgb(24,24,27)]">
                          {product.tech_pack?.productName || "Unnamed Product"}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.tech_pack?.productOverview || ""}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created:{" "}
                          {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 md:flex-shrink-0">
                      {product.model_3d?.url ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleView3D(product, "product")}
                            className="bg-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)]/90 text-white"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View 3D
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleViewVersions(product, "product")
                            }
                            className="border-[rgb(24,24,27)] text-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)] hover:text-white"
                          >
                            <History className="h-4 w-4 mr-2" />
                            Versions
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => showGenerate3DConfirmation(product, "product")}
                            disabled={generating3DId === product.id}
                            className="border-gray-300"
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${generating3DId === product.id ? "animate-spin" : ""}`}
                            />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => showGenerate3DConfirmation(product, "product")}
                          disabled={generating3DId === product.id}
                          className="bg-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)]/90 text-white"
                        >
                          {generating3DId === product.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Box className="h-4 w-4 mr-2" />
                              Generate 3D (10 credits)
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no products */}
        {isExpanded && products.length === 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-8 text-center">
            <Box className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              No products in this collection
            </p>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(24,24,27)] flex items-center gap-2">
            <Box className="h-8 w-8" />
            3D Model Gallery
          </h1>
          <p className="text-gray-600 mt-1">
            Generate and manage 3D models for your products and collections
          </p>
        </div>

        {activeTab === "products" && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Beta Disclaimer */}
      <Alert className="mb-6 bg-cream border-taupe">
        <AlertTitle className="text-navy font-semibold">
          3D Viewer (Beta)
        </AlertTitle>
        <AlertDescription className="text-navy/80 text-sm">
          Our new 3D tool is live — explore your product in an interactive view. This beta release is for visual exploration only and isn't yet optimized for technical, high-definition, or factory-ready accuracy. Full production-level 3D is coming soon.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-0">
          {productsLoading && products.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-navy" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Box className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600">
                Create your first product to get started with 3D generation
              </p>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-0"
                }
              >
                {products.map((product) => renderCard(product, "product"))}
              </div>

              {/* Infinite scroll trigger element & Load More button */}
              {productsPagination.totalPages > 1 &&
                productsPagination.page < productsPagination.totalPages && (
                  <div
                    ref={loadMoreProductsRef}
                    className="flex flex-col items-center gap-4 py-8"
                  >
                    {productsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-[#1C1917]">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading more products...</span>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() =>
                            fetchProducts(productsPagination.page + 1, true)
                          }
                          variant="outline"
                          className="bg-white hover:bg-gray-50 px-6"
                          disabled={productsLoading}
                        >
                          Load More Products
                        </Button>
                        <p className="text-xs text-gray-400">
                          Showing {products.length} of{" "}
                          {productsPagination.total} products
                        </p>
                      </>
                    )}
                  </div>
                )}

              {/* No more products message */}
              {productsPagination.totalPages > 0 &&
                productsPagination.page >= productsPagination.totalPages &&
                products.length > 0 && (
                  <div className="text-center py-8 text-sm text-gray-500">
                    You've reached the end • {productsPagination.total} products
                    total
                  </div>
                )}
            </>
          )}
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="mt-0">
          {collectionsLoading && collections.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-navy" />
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-20">
              <Box className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Collections Found
              </h3>
              <p className="text-gray-600">
                Create your first collection to get started with 3D generation
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {collections.map((collection) =>
                  renderCollectionItem(collection)
                )}
              </div>

              {/* Infinite scroll trigger element & Load More button */}
              {collectionsPagination.totalPages > 1 &&
                collectionsPagination.page <
                  collectionsPagination.totalPages && (
                  <div
                    ref={loadMoreCollectionsRef}
                    className="flex flex-col items-center gap-4 py-8"
                  >
                    {collectionsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-[#1C1917]">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading more collections...</span>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() =>
                            fetchCollections(
                              collectionsPagination.page + 1,
                              true
                            )
                          }
                          variant="outline"
                          className="bg-white hover:bg-gray-50 px-6"
                          disabled={collectionsLoading}
                        >
                          Load More Collections
                        </Button>
                        <p className="text-xs text-gray-400">
                          Showing {collections.length} of{" "}
                          {collectionsPagination.total} collections
                        </p>
                      </>
                    )}
                  </div>
                )}

              {/* No more collections message */}
              {collectionsPagination.totalPages > 0 &&
                collectionsPagination.page >=
                  collectionsPagination.totalPages &&
                collections.length > 0 && (
                  <div className="text-center py-8 text-sm text-gray-500">
                    You've reached the end • {collectionsPagination.total}{" "}
                    collections total
                  </div>
                )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* 3D Viewer Dialog */}
      <Dialog open={show3DViewer} onOpenChange={setShow3DViewer}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 sm:w-auto sm:h-auto sm:max-w-5xl sm:max-h-[90vh] sm:m-auto sm:p-6 overflow-y-auto">
          <DialogHeader className="p-4 sm:p-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Box className="h-4 w-4 sm:h-5 sm:w-5" />
              {current3DModel?.name}
            </DialogTitle>
            <DialogDescription className="text-sm">
              View, rotate, and download your 3D model in multiple formats
            </DialogDescription>
          </DialogHeader>

          {/* Beta Disclaimer */}
          <Alert className="bg-cream border-taupe mx-4 sm:mx-0">
            <AlertTitle className="text-navy font-semibold text-sm">
              3D Viewer (Beta)
            </AlertTitle>
            <AlertDescription className="text-navy/80 text-xs">
              Our new 3D tool is live — explore your product in an interactive view. This beta release is for visual exploration only and isn't yet optimized for technical, high-definition, or factory-ready accuracy. Full production-level 3D is coming soon.
            </AlertDescription>
          </Alert>

          {current3DModel && (
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <Model3DViewer modelUrl={current3DModel.url} />
              </div>

              <div className="pt-4 border-t">
                <ExportOptions
                  modelUrl={current3DModel.url}
                  techPackName={current3DModel.name}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3D Model Versions Dialog */}
      {versionsDialogData && (
        <Model3DVersionsDialog
          open={showVersionsDialog}
          onClose={() => setShowVersionsDialog(false)}
          sourceType={versionsDialogData.sourceType}
          sourceId={versionsDialogData.sourceId}
          sourceName={versionsDialogData.sourceName}
          onVersionSelected={handleVersionSelected}
        />
      )}

      {/* 3D Generation Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate 3D Model</AlertDialogTitle>
            <AlertDialogDescription>
              This will cost <span className="font-semibold text-gray-900">10 credits</span>.
              The credits will be deducted once the 3D model is successfully generated and ready.
              <br /><br />
              Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerate3D}
              className="bg-[rgb(24,24,27)] hover:bg-[rgb(24,24,27)]/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
