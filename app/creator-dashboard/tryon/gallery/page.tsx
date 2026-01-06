"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Save,
    Delete,
    Loader2,
    ImageIcon,
    Heart,
    HeartIcon,
    EyeIcon,
    ArrowLeft,
    Sparkles,
    MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useGetTryOnHistoryStore } from "@/lib/zustand/try-on/getTryOnhistory";
import { useGetTryOnCollectionsStore } from "@/lib/zustand/try-on/getAllTryOnCollection";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function GalleryPage() {
    const [showAllImages, setShowAllImages] = useState(false);
    const [loading, setLoading] = useState<any>(null);
    const [deleteTryonLoading, setDeleteTryonLoading] = useState<any>(null);
    const [deleteHistoryLoading, setDeleteHistoryLoading] = useState<any>(null);
    const [viewerImage, setViewerImage] = useState<string | null>(null);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const router = useRouter();
    const { GetTryOnHistory, fetchTryOnHistory, loadingGetTryOnHistory, refreshTryOnHistory } =
        useGetTryOnHistoryStore();
    const { GetTryOnCollections, loadingGetTryOnCollections, refreshTryOnCollections } =
        useGetTryOnCollectionsStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Ads", "Creative", "Social", "Ecommerce", "Logo", "Print"];

    // Filter Logic
    const filterItems = (items: any[]) => {
        if (!items) return [];
        return items.filter((item) => {
            // Search Filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                (item.name && item.name.toLowerCase().includes(searchLower)) ||
                (item.prompt && item.prompt.toLowerCase().includes(searchLower)) ||
                (item.style && item.style.toLowerCase().includes(searchLower));

            // Category Filter
            const matchesCategory =
                selectedCategory === "All" ||
                (item.style && item.style.toLowerCase() === selectedCategory.toLowerCase());

            return matchesSearch && matchesCategory;
        });
    };

    const filteredHistory = filterItems(GetTryOnHistory);
    const filteredCollections = filterItems(GetTryOnCollections);

    useEffect(() => {
        refreshTryOnHistory();
    }, []);

    useEffect(() => {
        refreshTryOnCollections();
    }, []);

    // ... handleSave, handleDeletetryon, handleDeleteHistory ...
    const handleSave = async (product: any, index: number) => {
        setLoading(index);
        const response = await fetch("/api/ai-virtual-tryon/create-tryon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save image");
        }
        await refreshTryOnCollections();
        await refreshTryOnHistory();
        toast({
            variant: "default",
            title: "Image saved",
            description: `Image has been saved to favorites.`,
        });
        setLoading(null);
    };

    const handleDeletetryon = async (tryonId: any) => {
        setDeleteTryonLoading(tryonId);
        const response = await fetch(`/api/ai-virtual-tryon/delete-try-on?id=${tryonId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete");
        }
        await refreshTryOnCollections();
        toast({
            variant: "default",
            title: "Removed from favorites",
            description: `Image has been removed successfully.`,
        });
        setDeleteTryonLoading(null);
    };

    const handleDeleteHistory = async (historyId: any) => {
        setDeleteHistoryLoading(historyId);
        const response = await fetch(`/api/ai-virtual-tryon/delete-history-tryon?id=${historyId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete history");
        }
        await refreshTryOnHistory();
        toast({
            variant: "default",
            title: "Image deleted",
            description: `Image has been deleted successfully.`,
        });
        setDeleteHistoryLoading(null);
    };


    const handleViewImage = (imageUrl: string) => {
        setViewerImage(imageUrl);
        setShowImageViewer(true);
    };

    if (loadingGetTryOnHistory || loadingGetTryOnCollections) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <span className="ml-2 text-lg text-gray-700">Loading Gallery</span>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(35,20%,98%)] via-[hsl(30,15%,96%)] to-[hsl(28,12%,94%)] p-6 shadow-lg space-y-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_150px_at_50%_-30%,hsl(28,12%,85%,0.2),transparent)]"></div>

                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Header Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push("/creator-dashboard/tryon")}
                                className="rounded-xl hover:bg-[hsl(35,20%,94%)]"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Sparkles className="h-7 w-7 text-[hsl(28,12%,45%)]" />
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(25,15%,15%)] to-[hsl(28,12%,35%)] bg-clip-text text-transparent">
                                Studio Gallery
                            </h1>
                        </div>
                        <p className="text-base text-[hsl(25,10%,45%)] ml-14">
                            {showAllImages ? "Browse all your generated images" : "Your favorite collections"}
                        </p>
                    </div>

                    {/* Tab Buttons */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            onClick={() => setShowAllImages(false)}
                            variant={showAllImages ? "outline" : "default"}
                            className={cn(
                                "flex-1 sm:flex-none transition-all duration-300 rounded-xl border-2 shadow-sm",
                                !showAllImages
                                    ? "bg-gradient-to-r from-[hsl(25,15%,15%)] to-[hsl(28,12%,25%)] text-white border-[hsl(25,15%,15%)] shadow-lg hover:shadow-xl"
                                    : "bg-white border-[hsl(30,12%,85%)] text-[hsl(25,15%,20%)] hover:bg-[hsl(35,20%,96%)] hover:border-[hsl(28,12%,75%)]"
                            )}
                        >
                            <Heart className="mr-2 h-4 w-4" />
                            Favorites
                        </Button>
                        <Button
                            onClick={() => setShowAllImages(true)}
                            variant={showAllImages ? "default" : "outline"}
                            className={cn(
                                "flex-1 sm:flex-none transition-all duration-300 rounded-xl border-2 shadow-sm",
                                showAllImages
                                    ? "bg-gradient-to-r from-[hsl(25,15%,15%)] to-[hsl(28,12%,25%)] text-white border-[hsl(25,15%,15%)] shadow-lg hover:shadow-xl"
                                    : "bg-white border-[hsl(30,12%,85%)] text-[hsl(25,15%,20%)] hover:bg-[hsl(35,20%,96%)] hover:border-[hsl(28,12%,75%)]"
                            )}
                        >
                            <EyeIcon className="mr-2 h-4 w-4" />
                            All Images
                        </Button>
                    </div>
                </div>

            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "rounded-full px-4 border border-transparent transition-all",
                                selectedCategory === cat
                                    ? "bg-[hsl(25,15%,20%)] text-white shadow-md hover:bg-[hsl(25,15%,25%)]"
                                    : "bg-white border-[hsl(30,12%,85%)] text-[hsl(25,10%,50%)] hover:bg-[hsl(35,20%,96%)] hover:text-[hsl(25,15%,30%)] shadow-sm"
                            )}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 w-full rounded-xl border border-[hsl(30,12%,85%)] bg-white focus:bg-white text-sm focus:ring-2 focus:ring-[hsl(25,15%,20%)] focus:border-transparent outline-none transition-all placeholder:text-[hsl(25,10%,60%)] shadow-sm"
                    />
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* === History View === */}
                {showAllImages ? (
                    (filteredHistory?.length ?? 0) < 1 ? (
                        <div className="text-center py-16 col-span-full">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[hsl(35,20%,94%)] to-[hsl(30,15%,90%)] flex items-center justify-center mb-4">
                                <ImageIcon className="h-10 w-10 text-[hsl(28,12%,45%)]" />
                            </div>
                            <p className="text-[hsl(25,10%,45%)] font-medium">No results found</p>
                            <p className="text-sm text-[hsl(25,10%,55%)] mt-1">
                                {searchQuery || selectedCategory !== "All" ? "Try adjusting your filters" : "Generate your first try-on image to see it here"}
                            </p>
                        </div>
                    ) : (
                        filteredHistory.map((tryon: any) => (
                            <Card key={tryon.id} className="border-2 border-[hsl(30,12%,85%)] shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-[hsl(35,20%,98%)] overflow-hidden">
                                <CardHeader className="border-b border-[hsl(30,12%,90%)] bg-gradient-to-r from-[hsl(35,20%,97%)] to-[hsl(30,15%,96%)]">
                                    <div className="flex justify-between items-center w-full">
                                        <CardTitle className="text-lg font-semibold text-[hsl(25,15%,15%)] truncate pr-2">{tryon.name || "N/A"}</CardTitle>
                                        <Badge variant="secondary" className="bg-white/50 text-xs px-2 py-0.5 whitespace-nowrap">{tryon.style}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 p-4">
                                    {/* Image Preview */}
                                    <div
                                        className="aspect-square bg-gradient-to-br from-[hsl(35,20%,96%)] to-[hsl(30,15%,92%)] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-95 transition-opacity shadow-md border-2 border-[hsl(30,12%,88%)] group"
                                        onClick={() => handleViewImage(tryon.url)}
                                    >
                                        <img
                                            src={tryon.url}
                                            alt="Generated Image"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="border-[hsl(30,12%,80%)] text-[hsl(25,15%,25%)]">1:1</Badge>
                                        </div>

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
                                                        handleSave(
                                                            {
                                                                url: tryon.url,
                                                                name: tryon.name,
                                                                style: tryon.style,
                                                                prompt: tryon.prompt,
                                                            },
                                                            tryon.id
                                                        );
                                                    }}
                                                >

                                                    {loading === tryon.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Save to Favorites
                                                        </>
                                                    )}
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteHistory(tryon.id);
                                                    }}
                                                >
                                                    {deleteHistoryLoading === tryon.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Delete className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )
                ) : // === Try-On Collections View ===
                    (filteredCollections?.length ?? 0) < 1 ? (
                        <div className="text-center py-16 col-span-full">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[hsl(35,20%,94%)] to-[hsl(30,15%,90%)] flex items-center justify-center mb-4">
                                <Heart className="h-10 w-10 text-[hsl(28,12%,45%)]" />
                            </div>
                            <p className="text-[hsl(25,10%,45%)] font-medium">No favorites found</p>
                            <p className="text-sm text-[hsl(25,10%,55%)] mt-1">
                                {searchQuery || selectedCategory !== "All" ? "Try adjusting your filters" : "Save your favorite try-on images to see them here"}
                            </p>
                        </div>
                    ) : (
                        filteredCollections.map((tryon: any, index: number) => (
                            <Card key={index} className="border-2 border-[hsl(30,12%,85%)] shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-[hsl(35,20%,98%)] overflow-hidden">
                                <CardHeader className="flex-row justify-between items-center border-b border-[hsl(30,12%,90%)] bg-gradient-to-r from-[hsl(35,20%,97%)] to-[hsl(30,15%,96%)]">
                                    <div className="flex justify-between items-center w-full pr-8">
                                        <CardTitle className="text-lg font-semibold text-[hsl(25,15%,15%)] truncate">{tryon.name || tryon.style}</CardTitle>
                                        <Badge variant="secondary" className="bg-white/50 text-xs px-2 py-0.5 whitespace-nowrap">{tryon.style}</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 p-4">
                                    {/* Image Preview */}
                                    <div
                                        className="aspect-square bg-gradient-to-br from-[hsl(35,20%,96%)] to-[hsl(30,15%,92%)] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-95 transition-opacity shadow-md border-2 border-[hsl(30,12%,88%)] group"
                                        onClick={() => handleViewImage(tryon.url)}
                                    >
                                        <img
                                            src={tryon.url || "/placeholder.png"}
                                            alt="Favorite Image"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {/* Metadata */}
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="border-[hsl(30,12%,80%)] text-[hsl(25,15%,25%)]">1:1</Badge>
                                        </div>

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
                                                        handleDeletetryon(tryon.id);
                                                    }}
                                                >
                                                    {deleteTryonLoading === tryon.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Removing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Delete className="h-4 w-4 mr-2" />
                                                            Remove
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
            </div>

            {/* Image Viewer Modal */}
            <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
                <DialogContent className="max-w-7xl w-full p-0 bg-black/95 border-0">
                    <div className="relative w-full h-[90vh] flex items-center justify-center">
                        {viewerImage && (
                            <img src={viewerImage} alt="Full size preview" className="max-w-full max-h-full object-contain" />
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white hover:bg-white/10"
                            onClick={() => setShowImageViewer(false)}
                        >
                            ✕
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
