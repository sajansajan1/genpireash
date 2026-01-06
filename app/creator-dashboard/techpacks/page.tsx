"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TechPackCard } from "@/components/tech-pack/tech-pack-card";
import { Grid3X3, List, PlusCircle, Loader2, ArrowLeft, Eye, Badge } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { TechPack } from "@/lib/types/tech-packs";
import { TechPackFilters } from "@/components/tech-pack/tech-pack-filters";
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
import TechpacksLoading from "./loading";
import { useUserStore } from "@/lib/zustand/useStore";
import { useProductIdeasStore } from "@/lib/zustand/techpacks/getAllTechPacks";
import { useDeleteTechPackStore } from "@/lib/zustand/techpacks/deleteTechPack";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { useProductCollectionStore } from "@/lib/zustand/collections/createProductCollection/creatorProductCollection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TechpacksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [filteredTechPacks, setFilteredTechPacks] = useState<TechPack[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);

  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    search: "",
    status: [] as string[],
    sortBy: "created_desc",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [techPackToDelete, setTechPackToDelete] = useState<TechPack | null>(null);
  const {
    productIdeas,
    loadingProductIdeas,
    errorProductIdeas,
    refreshProductIdeas,
    fetchMoreProductIdeas,
    loadingMore,
    pagination,
  } = useProductIdeasStore();
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);

  const {
    addToCollection,
    createCollectionAndAdd,
    fetchProductCollection,
    ProductCollection,
    loadingProductCollection,
  } = useProductCollectionStore();

  const { setDeleteTechPack } = useDeleteTechPackStore();
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits } = useGetCreditsStore();
  const credits = getCreatorCredits;

  // Ref for infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const applyFilters = useCallback(() => {
    if (!productIdeas) return;

    // Filter: keep products that have either tech_pack OR image_data
    let result = productIdeas.filter((tp) => {
      if (!tp) return false;
      // Show product if it has a tech pack OR if it has any images
      const hasTechPack = tp.tech_pack && Object.keys(tp.tech_pack).length > 0;
      const hasImages =
        tp.image_data &&
        (tp.image_data.front?.url ||
          tp.image_data.back?.url ||
          tp.image_data.side?.url ||
          tp.image_data.top?.url ||
          tp.image_data.bottom?.url);
      return hasTechPack || hasImages;
    });

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((tp) => {
        // Check multiple fields for search, handling undefined/null values
        const productName = tp.tech_pack?.productName || tp?.product_name || "";
        const productOverview = tp.tech_pack?.productOverview || tp?.product_description || "";
        const searchText = `${productName} ${productOverview}`.toLowerCase();
        return searchText.includes(searchLower);
      });
    }

    if (filters.status.length > 0) {
      result = result.filter((tp) => filters.status.includes(tp.status));
    }

    switch (activeTab) {
      case "drafts":
        result = result.filter((tp) => tp.status === "draft");
        break;
      case "in_progress":
        result = result.filter((tp) => tp.status === "in_progress");
        break;
      case "completed":
        result = result.filter((tp) => tp.status === "Completed");
        break;
    }

    switch (filters.sortBy) {
      case "created_asc":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name_asc":
        result.sort((a, b) => {
          const nameA = a.tech_pack?.productName || "";
          const nameB = b.tech_pack?.productName || "";
          return nameA.localeCompare(nameB);
        });
        break;
      case "name_desc":
        result.sort((a, b) => {
          const nameA = a.tech_pack?.productName || "";
          const nameB = b.tech_pack?.productName || "";
          return nameB.localeCompare(nameA);
        });
        break;
      case "updated_desc":
        result.sort((a, b) => {
          const aTime = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at).getTime();
          const bTime = b.updated_at ? new Date(b.updated_at).getTime() : new Date(a.created_at).getTime();
          return bTime - aTime;
        });
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredTechPacks(result);
  }, [productIdeas, filters, activeTab]);

  useEffect(() => {
    if (!productIdeas) {
      refreshProductIdeas();
    }
  }, [productIdeas, refreshProductIdeas]);

  useEffect(() => {
    if (!ProductCollection) {
      fetchProductCollection();
    }
  }, [ProductCollection, fetchProductCollection]);

  useEffect(() => {
    if (productIdeas) {
      applyFilters();
    }
  }, [filters, activeTab, productIdeas, applyFilters]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // When the load more element is visible and we have more data
        if (entries[0].isIntersecting && pagination?.hasMore && !loadingMore) {
          fetchMoreProductIdeas();
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [pagination?.hasMore, loadingMore, fetchMoreProductIdeas]);

  if (loadingProductIdeas || !productIdeas || errorProductIdeas) {
    return <TechpacksLoading />;
  }

  // Update filters and apply them
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  const handleDeleteTechPack = async (id: string) => {
    const result = await setDeleteTechPack(id);

    if (!result.success) {
      console.error(result.message);
      return;
    }

    await refreshProductIdeas();

    const updatedTechPacks = productIdeas.filter((tp) => tp.id !== id);
    setFilteredTechPacks(
      updatedTechPacks.filter((tp) => {
        if (activeTab === "all") return true;
        if (activeTab === "completed") return tp.status === "completed";
        return true;
      })
    );
  };

  const handleDelete = async () => {
    if (!techPackToDelete) return;
    const result = await setDeleteTechPack(techPackToDelete.id);
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message || "Failed to delete product.",
      });
      return;
    }
    await refreshProductIdeas();
    const updatedTechPacks = productIdeas.filter((tp) => tp.id !== techPackToDelete.id);
    setFilteredTechPacks(
      updatedTechPacks.filter((tp) => {
        if (activeTab === "all") return true;
        if (activeTab === "completed") return tp.status === "completed";
        return true;
      })
    );

    setTechPackToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  if (selectedCollection) {
    return (
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab("collection");
              setSelectedCollection(null);
            }}
            className="cursor-pointer w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* View Mode Toggle */}
          <div className="flex w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-r-none 
      ${viewMode === "grid"
                  ? "bg-black hover:bg-gray-800 text-white border border-gray-300"
                  : "bg-[rgba(244,243,240,1)] hover:bg-stone-100 text-black border border-gray-300"
                }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>

            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-l-none 
      ${viewMode === "list"
                  ? "bg-black hover:bg-black text-white border border-gray-300"
                  : "bg-[rgba(244,243,240,1)] hover:bg-stone-100 text-black border border-gray-300"
                }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

        </div>

        <h2 className="text-2xl font-bold mb-4">{selectedCollection?.collection_name}</h2>

        {/* ✅ Only ONE grid — for the products */}
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"
          }
        >
          {selectedCollection?.products?.map((techPack: any) => (
            <div key={techPack.id} className={viewMode === "list" ? "w-full" : "relative group"}>
              <TechPackCard
                techPack={techPack}
                viewMode={viewMode} // pass view mode to card
                onDelete={() => handleDeleteTechPack(techPack.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Updated terminology from Tech Packs to Products */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-[#1C1917] mt-2 text-sm sm:text-base max-w-2xl">
            Turn any idea into a factory-ready product with our AI editor — complete visuals, technical drawings, and
            spec sheets in minutes.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => {
              if ((credits?.credits ?? 0) < 1) {
                toast({
                  variant: "destructive",
                  title: "No Credits left!",
                  description: "You don't have any credits left. Please purchase Credits to Generate Product",
                });
              } else {
                router.push("/creator-dashboard");
              }
            }}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Product
          </Button>
        </div>
      </div>

      <TechPackFilters onFilterChange={handleFilterChange} />

      <div className="flex justify-end mb-4  rounded-md w-full max-w-[200px] ml-auto overflow-hidden">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("grid")}
          className={`rounded-r-none ${viewMode === "grid"
            ? "bg-black hover:bg-gray-800 text-white border border-gray-300"
            : "bg-[rgba(244,243,240,1)] hover:bg-stone-100 text-black border border-gray-300"
            }`}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>

        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className={`rounded-l-none ${viewMode === "list"
            ? "bg-black hover:bg-black text-white border border-gray-300"
            : "bg-[rgba(244,243,240,1)] hover:bg-stone-100 text-black border border-gray-300"
            }`}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="collection">Collections</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {filteredTechPacks?.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"
                }
              >
                {filteredTechPacks?.map((techPack) => (
                  <div key={techPack.id} className={viewMode === "list" ? "w-full" : "relative group"}>
                    <TechPackCard
                      techPack={techPack}
                      viewMode={viewMode} // pass view mode to card
                      onDelete={() => handleDeleteTechPack(techPack.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Infinite scroll trigger element & Load More button */}
              {pagination?.hasMore && (
                <div ref={loadMoreRef} className="flex flex-col items-center gap-4 py-8">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-sm text-[#1C1917]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading more products...</span>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={fetchMoreProductIdeas}
                        variant="outline"
                        className="bg-white hover:bg-gray-50"
                        disabled={loadingMore}
                      >
                        Load More Products
                      </Button>
                      <p className="text-xs text-gray-400">
                        Showing {filteredTechPacks.length} of {pagination?.total || 0} products
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* No more products message */}
              {!pagination?.hasMore && filteredTechPacks.length > 0 && (
                <div className="text-center py-8 text-sm text-gray-500">
                  You've reached the end • {pagination?.total || filteredTechPacks.length} products total
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#1C1917]">No products found</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => {
                  if ((credits?.credits ?? 0) < 1) {
                    toast({
                      variant: "destructive",
                      title: "No Credits left!",
                      description: "You don't have any credits left. Please purchase Credits to Generate Product",
                    });
                  } else {
                    router.push("/creator-dashboard");
                  }
                }}
              >
                Create your first product
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="collection" className="mt-6">
          {loadingProductCollection ? (
            <div className="flex h-40 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-lg text-gray-700">Loading Collections...</span>
            </div>
          ) : ProductCollection?.length === 0 ? (
            // No collections found
            <div className="flex h-40 w-full items-center justify-center">
              <span className="text-gray-700 text-lg">No collections found</span>
            </div>
          ) : (
            viewMode === "grid" ?
              (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ProductCollection?.map((collection: any) => {
                    const previewImages = collection?.products
                      ?.map(
                        (product: any) =>
                          product?.image_data?.front?.url ||
                          product?.image_data?.top?.url ||
                          product?.image_data?.side?.url ||
                          product?.image_data?.model?.url ||
                          product?.image_data?.back?.url
                      )
                      .filter(Boolean)
                      .slice(0, 4);

                    const extraCount = (collection?.products?.length || 0) - 4;

                    return (
                      <Card key={collection?.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{collection?.title}</CardTitle>
                          </div>
                          <CardDescription>
                            {collection?.products?.length} items • Created{" "}
                            {new Date(collection?.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {previewImages?.map((image: any, index: number) => (
                              <div key={index} className="aspect-square bg-muted rounded overflow-hidden relative">
                                <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />

                                {index === 3 && collection?.products?.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-xl font-semibold">
                                    +{extraCount}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {collection?.products?.[0]?.name && (
                            <p className="text-sm mt-1 text-center text-[#1C1917]">{collection?.products[0]?.name}</p>
                          )}
                        </CardContent>

                        <CardContent className="pt-0">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={() => setSelectedCollection(collection)} // 👈 CHANGE
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>) : (
                <div className="space-y-4">
                  {ProductCollection?.map((collection: any) => {
                    const previewImages = collection?.products
                      ?.map(
                        (product: any) =>
                          product?.image_data?.front?.url ||
                          product?.image_data?.top?.url ||
                          product?.image_data?.side?.url ||
                          product?.image_data?.model?.url ||
                          product?.image_data?.back?.url
                      )
                      .filter(Boolean)
                      .slice(0, 2); // same as list UI

                    const extraCount = (collection?.products?.length || 0) - 2;

                    return (
                      <Card key={collection?.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          {/* MAIN ROW — Vertically centered text */}
                          <div className="flex gap-4 items-center">

                            {/* LEFT — IMAGES */}
                            <div className="flex gap-3">
                              {previewImages?.map((image: any, index: number) => (
                                <div
                                  key={index}
                                  className="w-24 h-24 bg-muted rounded-md overflow-hidden relative flex-shrink-0"
                                >
                                  <img
                                    src={image}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                  />

                                  {index === 1 && extraCount > 0 && (
                                    <div className="absolute inset-0 bg-black/60 text-white font-medium text-lg flex items-center justify-center rounded-md">
                                      +{extraCount}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* RIGHT — TEXT */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between w-full">

                                {/* COLLECTION NAME + SUBTEXT */}
                                <div>
                                  <h3 className="font-semibold text-lg leading-tight">
                                    {collection?.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {collection?.products?.length} items • Created{" "}
                                    {new Date(collection?.created_at).toLocaleDateString()}
                                  </p>

                                  {/* FIRST ITEM NAME */}
                                  {collection?.products?.[0]?.name && (
                                    <p className="text-sm text-[#1C1917] mt-2 line-clamp-2">
                                      {collection?.products?.[0]?.name}
                                    </p>
                                  )}
                                </div>

                                {/* RIGHT SIDE: BADGE + VIEW */}
                                <div className="flex flex-col items-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedCollection(collection)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
          )}
        </TabsContent>
      </Tabs>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{techPackToDelete?.tech_pack?.productName || "this product"}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTechPackToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
