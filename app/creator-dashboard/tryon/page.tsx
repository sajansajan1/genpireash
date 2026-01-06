"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Download,
  Save,
  RefreshCw,
  Filter,
  ImageIcon,
  Sparkles,
  Loader2,
  FileArchiveIcon,
  Megaphone,
  Palette,
  ShoppingBag,
  ExternalLink,
  Image as ImageIconLucide,
  ArrowLeft,
  Star,
  Instagram,
  PawPrint,
  Sparkle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCreatorCollectionStore } from "@/lib/zustand/collections/getAllCollections";
import { toast } from "@/hooks/use-toast";
import { useProductIdeasStore } from "@/lib/zustand/techpacks/getAllTechPacks";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { DeductCredits } from "@/lib/supabase/payments";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { useGetTryOnHistoryStore } from "@/lib/zustand/try-on/getTryOnhistory";
import { useRouter } from "next/navigation";
import { useGetCreatorDnaStore } from "@/lib/zustand/brand-dna/getDna";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface ProductDetails {
  originalProduct: string;
  editPrompt: string;
  generationType: string;
  logoUrl?: string;
  characterImage?: string | null;
  aspectRatio?: string;
  imageCount?: 1 | 3 | 6;
}

export default function TryOnStudioPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [applyBrandDNA, setApplyBrandDNA] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProducts, setGeneratedProducts] = useState<any | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [collectionProduct, setCollectionProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"Creative" | "Ads" | "Ecommerce" | "Logo" | "Social" | "Print">("Creative");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [imageCount, setImageCount] = useState<1 | 3 | 6>(6);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  // Character upload states
  const [characterImageUrl, setCharacterImageUrl] = useState<string | null>(null);
  const [uploadingCharacter, setUploadingCharacter] = useState(false);

  // Logo upload states
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // View control state
  const [showResults, setShowResults] = useState(false);

  const { getCreatorCollection, refresCreatorCollection, loadingGetCreatorCollection } =
    useGetCreatorCollectionStore();
  const { productIdeas } = useProductIdeasStore();
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const { refreshTryOnHistory } = useGetTryOnHistoryStore();
  const { getActiveDna } = useGetCreatorDnaStore();
  const activeDna = getActiveDna();
  const filteredProducts = productIdeas?.filter((item: any) => {
    const name = item?.tech_pack?.productName?.toLowerCase() || item?.name?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    if (!getCreatorCollection && refresCreatorCollection) {
      refresCreatorCollection();
    }
  }, [getCreatorCollection, refresCreatorCollection]);

  useEffect(() => {
    if (activeDna && activeDna.status === true) {
      setApplyBrandDNA(true);
    }
  }, [activeDna]);

  const handleSave = async (product: any, index: number) => {
    setLoading(index);
    const response = await fetch("/api/ai-virtual-tryon/create-tryon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save");
    }
    await refreshTryOnHistory();
    toast({
      variant: "default",
      title: "Image saved",
      description: `Image has been saved to favorites.`,
    });
    setLoading(null);
  };

  const handlegenerateProducts = async (input: ProductDetails): Promise<any | null> => {
    const requiredCredits = input.imageCount || 6;
    if ((getCreatorCredits?.credits ?? 0) < requiredCredits) {
      return toast({
        variant: "destructive",
        title: "Insufficient Credits!",
        description: `You need at least ${requiredCredits} credits. Please purchase more credits.`,
      });
    }
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai-virtual-tryon/ai-virtual-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate");
      }
      const collectionData = await response.json();

      setGeneratedProducts(collectionData);
      setIsGenerating(false);
      setShowResults(true); // Show results view
      toast({
        title: "Images generated successfully",
        description: ` ${collectionData.length} images have been created.`,
      });
      const deduct = await DeductCredits({ credit: requiredCredits });
      if (!deduct) {
        toast({
          variant: "destructive",
          title: "Insufficient Credits",
          description: "You need at least 10 credits to generate images.",
        });
        return;
      }
      await refresCreatorCredits();
      return collectionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error(errorMessage);
      toast({
        title: "Error generating images",
        description: `Failed to generate images`,
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCharacterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
      });
      return;
    }

    setUploadingCharacter(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai-virtual-tryon/upload-character", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload character image");
      }

      const data = await response.json();
      setCharacterImageUrl(data.url);

      toast({
        title: "Character image uploaded",
        description: "Your character image is ready to use",
      });
    } catch (error) {
      console.error("Error uploading character image:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload character image. Please try again.",
      });
    } finally {
      setUploadingCharacter(false);
    }
  };

  const handleRemoveCharacterImage = () => {
    setCharacterImageUrl(null);
  };

  const handleLogoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
      });
      return;
    }

    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai-virtual-tryon/upload-character", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload logo image");
      }

      const data = await response.json();
      setLogoImageUrl(data.url);

      toast({
        title: "Logo uploaded",
        description: "Your logo is ready to use",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    setViewerImage(imageUrl);
    setShowImageViewer(true);
  };

  if (loadingGetCreatorCollection) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-700">Loading Studio</span>
      </div>
    );
  }

  // Results View
  if (showResults && generatedProducts) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
        {/* Results Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(35,20%,98%)] via-[hsl(30,15%,96%)] to-[hsl(28,12%,94%)] p-4 shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_150px_at_50%_-30%,hsl(28,12%,85%,0.2),transparent)]"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-[hsl(28,12%,45%)]" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(25,15%,15%)] to-[hsl(28,12%,35%)] bg-clip-text text-transparent">
                  Generated Results
                </h1>
              </div>
              <p className="text-sm text-[hsl(25,10%,45%)] ml-8">
                {generatedProducts.length} images generated successfully
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowResults(false)}
                variant="outline"
                className="rounded-xl border-2 border-[hsl(30,12%,85%)] hover:bg-[hsl(35,20%,96%)] h-9 text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Studio
              </Button>
              <Button
                variant="default"
                onClick={() => router.push("/creator-dashboard/tryon/gallery")}
                className="rounded-xl shadow-lg h-9 text-sm"
              >
                <ImageIconLucide className="mr-2 h-4 w-4" />
                View Gallery
              </Button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {generatedProducts?.map((product: any, index: number) => (
            <Card
              key={index}
              className={cn(
                "border-2 cursor-pointer transition-all duration-300 overflow-hidden group",
                selectedCard === index
                  ? "ring-4 ring-[hsl(28,12%,65%)] shadow-2xl scale-[1.02]"
                  : "shadow-lg hover:shadow-2xl hover:scale-[1.02]",
                "bg-white border-[hsl(30,12%,88%)]"
              )}
              onClick={() => setSelectedCard(index)}
            >
              <div
                className="aspect-square overflow-hidden cursor-zoom-in relative bg-gradient-to-br from-[hsl(35,20%,96%)] to-[hsl(30,15%,92%)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewImage(product.url);
                }}
              >
                <img
                  src={product.url}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt="Generated"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <p className="text-sm font-semibold">Click to view full size</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 bg-gradient-to-b from-white to-[hsl(35,20%,98%)] space-y-3">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center text-sm py-1 bg-gradient-to-r from-[hsl(28,12%,85%)] to-[hsl(30,12%,88%)] text-[hsl(25,15%,15%)] font-medium border border-[hsl(30,12%,80%)]">
                    {product.name}
                  </Badge>
                  <p className="text-xs text-center text-[hsl(25,10%,50%)] truncate">{product.style}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={"default"}
                    className="h-10 shadow-md hover:shadow-lg transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave({ url: product.url, name: product.name, style: product.style, prompt: prompt }, index);
                    }}
                  >
                    {loading === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        <span className="text-xs">Save</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 border-2 border-[hsl(30,12%,85%)] hover:bg-[hsl(35,20%,94%)] hover:border-[hsl(28,12%,70%)] transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = product.url;
                      link.download = `${product.name}.jpg`;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span className="text-xs">Download</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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

  // Prompt/Setup View
  return (
    <div className="flex-1 space-y-2 p-4 sm:p-6 md:p-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(35,20%,98%)] via-[hsl(30,15%,96%)] to-[hsl(28,12%,94%)] p-4 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_150px_at_50%_-30%,hsl(28,12%,85%,0.2),transparent)]"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          {/* Left Section */}
          <div className="space-y-2 md:space-y-1 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[hsl(28,12%,45%)]" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[hsl(25,15%,15%)] to-[hsl(28,12%,35%)] bg-clip-text text-transparent">
                Creative Studio
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[hsl(25,10%,45%)] md:ml-8">
              Transform products into stunning real-life visuals with AI
            </p>
          </div>

          {/* Right Section (Buttons) */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              variant={selectedType === "Print" ? "default" : "outline"}
              onClick={() => setSelectedType(selectedType === "Print" ? "Creative" : "Print")}
              className={cn(
                "rounded-xl h-9 text-sm transition-all duration-300 border-2 w-full sm:w-auto justify-center",
                selectedType === "Print"
                  ? "shadow-md"
                  : "border-[hsl(30,12%,85%)] hover:bg-[hsl(35,20%,96%)] bg-white"
              )}
            >
              {selectedType === "Print" ? (
                <>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </>
              ) : (
                <>
                  <PawPrint className="h-4 w-4 mr-1" />
                  Print
                </>
              )}
            </Button>

            <Button
              variant={selectedType === "Logo" ? "default" : "outline"}
              onClick={() => setSelectedType(selectedType === "Logo" ? "Creative" : "Logo")}
              className={cn(
                "rounded-xl h-9 text-sm transition-all duration-300 border-2 w-full sm:w-auto justify-center",
                selectedType === "Logo"
                  ? "shadow-md"
                  : "border-[hsl(30,12%,85%)] hover:bg-[hsl(35,20%,96%)] bg-white"
              )}
            >
              {selectedType === "Logo" ? (
                <>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-1" />
                  Logo
                </>
              )}
            </Button>
            <Button
              variant={"default"}
              onClick={() => router.push("/creator-dashboard/tryon/gallery")}
              className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-9 text-sm w-full sm:w-auto justify-center"
            >
              <ImageIconLucide className="mr-2 h-4 w-4" />
              View Gallery
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>

      {/* Conditional Layout */}
      {selectedType === "Logo" || selectedType === "Print" ? (
        /* Logo Mode: Only show Generation Settings */
        <div className="max-w-5xl mx-auto">
          <Card className="border-2 border-[hsl(30,12%,88%)] shadow-xl bg-gradient-to-br from-white to-[hsl(35,20%,98%)]">
            <CardHeader className="border-b border-[hsl(30,12%,90%)] bg-gradient-to-r from-[hsl(35,20%,97%)] to-[hsl(30,15%,96%)] p-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-[hsl(28,12%,45%)]" />
                {selectedType === "Logo" ? "Logo Generation" : "Print Generation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* Prompt */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[hsl(25,15%,20%)]">Describe Your {selectedType}</Label>
                <Textarea
                  placeholder="e.g., minimalist tech startup logo, vintage coffee shop emblem, modern fitness brand..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="placeholder:text-[hsl(25,10%,55%)] border-2 border-[hsl(30,12%,85%)] focus:border-[hsl(28,12%,65%)] rounded-xl resize-none text-sm"
                />
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[hsl(25,15%,20%)]">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="border-2 border-[hsl(30,12%,85%)] focus:border-[hsl(28,12%,65%)] rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="2:3">Portrait (2:3)</SelectItem>
                    <SelectItem value="3:2">Landscape (3:2)</SelectItem>
                    <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                    <SelectItem value="4:3">Landscape (4:3)</SelectItem>
                    <SelectItem value="9:16">Mobile (9:16)</SelectItem>
                    <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Count */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[hsl(25,15%,20%)]">Number of Images</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 3, 6] as const).map((count) => (
                    <Button
                      key={count}
                      variant={imageCount === count ? "default" : "outline"}
                      onClick={() => setImageCount(count)}
                      size="sm"
                      className={cn(
                        "flex flex-col items-center gap-1 h-auto py-3 rounded-xl transition-all duration-300 border-2",
                        imageCount === count
                          ? "shadow-md"
                          : "border-[hsl(30,12%,85%)] hover:bg-[hsl(35,20%,96%)]"
                      )}
                    >
                      <span className="text-sm font-semibold">{count}</span>
                      <span className="text-xs opacity-70">{count} Credit{count > 1 ? 's' : ''}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Brand DNA */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[hsl(35,20%,97%)] to-[hsl(30,15%,96%)] border border-[hsl(30,12%,90%)]">
                {getCreatorCredits?.hasEverHadSubscription && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="brand-dna"
                      checked={applyBrandDNA}
                      onCheckedChange={setApplyBrandDNA}
                      className="h-4 w-10 shadow"
                    />

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label htmlFor="brand-dna" className="text-sm cursor-pointer hidden md:inline">
                            Brand DNA
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            Your brand DNA will be integrated in your prompts for personalized generations
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label htmlFor="brand-dna" className="text-sm cursor-pointer md:hidden">
                            Brand DNA
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            Your brand DNA will be integrated in your prompts for personalized generations
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs hidden md:inline">
                        Recommended
                      </Badge>

                      {applyBrandDNA && activeDna && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}

                      {applyBrandDNA && !activeDna && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                            No DNA Found
                          </Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant="link"
                            className="text-xs h-auto p-0"
                            onClick={() => router.push("/creator-dashboard/dna")}
                          >
                            Create DNA
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                variant={"default"}
                className="w-full h-11 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                onClick={() =>
                  handlegenerateProducts({
                    originalProduct: "",
                    editPrompt: prompt,
                    generationType: selectedType,
                    characterImage: null,
                    logoUrl: undefined,
                    aspectRatio: aspectRatio,
                    imageCount: imageCount,
                  })
                }
                disabled={isGenerating || !prompt}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating {selectedType}...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {selectedType}
                  </>
                )}
              </Button>

              {/* Info box */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-900">
                  <strong>Tip:</strong> Be specific about style, colors, and industry (e.g., "modern gradient logo for tech company with blue and purple colors")
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Standard 3-Column Layout for other types */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Product Selector - 3 columns */}
          <Card className="lg:col-span-3 border-2 border-[hsl(30,12%,88%)] shadow-xl bg-gradient-to-br from-white to-[hsl(35,20%,98%)]">
            <CardHeader className="border-b border-[hsl(30,12%,90%)] bg-gradient-to-r from-[hsl(35,20%,97%)] to-[hsl(30,15%,96%)] p-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[hsl(28,12%,45%)]" />
                Select Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[hsl(25,10%,45%)]" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-[hsl(30,12%,85%)] focus:border-[hsl(28,12%,65%)] rounded-xl text-sm"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all duration-200 text-xs border-2 hover:scale-105",
                    type
                      ? "bg-[hsl(25,15%,15%)] text-white border-[hsl(25,15%,15%)]"
                      : "bg-white border-[hsl(30,12%,85%)] hover:bg-[hsl(35,20%,96%)]"
                  )}
                  onClick={() => {
                    setType(true);
                    setCollectionProduct(false);
                    setSelectedCollection(null);
                    setSelectedProduct(null);
                  }}
                >
                  Products
                </Badge>

                <Badge
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all duration-200 text-xs border-2 hover:scale-105",
                    !type
                      ? "bg-[hsl(25,15%,15%)] text-white border-[hsl(25,15%,15%)]"
                      : "bg-white border-[hsl(30,12%,85%)] hover:bg-[hsl(35,20%,96%)]"
                  )}
                  onClick={() => {
                    setType(false);
                    setCollectionProduct(false);
                    setSelectedCollection(null);
                    setSelectedProduct(null);
                  }}
                >
                  Collections
                </Badge>
              </div>

              {/* Product List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[hsl(28,12%,65%)] scrollbar-track-transparent">
                {type ? (
                  !filteredProducts || filteredProducts.length < 1 ? (
                    <div className="text-center py-8">
                      <FileArchiveIcon className="h-12 w-12 mx-auto text-[hsl(25,10%,45%)] mb-2 opacity-50" />
                      <p className="text-sm text-[hsl(25,10%,45%)]">No products</p>
                    </div>
                  ) : (
                    filteredProducts
                      .filter((item: any) => item?.image_data?.front?.url)
                      .map((item: any) => (
                        <div
                          key={item.id}
                          className={cn(
                            "p-2 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                            selectedProduct === item.id
                              ? "border-[hsl(25,15%,15%)] bg-gradient-to-r from-[hsl(35,20%,96%)] to-[hsl(30,15%,94%)] shadow-md"
                              : "border-[hsl(30,12%,88%)] hover:border-[hsl(28,12%,75%)] bg-white"
                          )}
                          onClick={() => {
                            setImageUrl(item.image_data.front.url);
                            setSelectedProduct(item.id);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(35,20%,96%)] to-[hsl(30,15%,92%)] rounded-lg flex items-center justify-center overflow-hidden shadow-inner">
                              <img src={item.image_data.front.url} className="w-full h-full object-cover" alt="Product" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-[hsl(25,15%,15%)] truncate">
                                {item?.tech_pack?.productName ?? item.name}
                              </p>
                              <p className="text-xs text-[hsl(25,10%,50%)]">{new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                  )
                ) : (
                  getCreatorCollection.map((collection: any) => (
                    <div key={collection.id} className="space-y-2">
                      <div
                        className={cn(
                          "p-2 border-2 rounded-xl cursor-pointer transition-all duration-200",
                          selectedCollection === collection.id
                            ? "border-[hsl(25,15%,15%)] bg-gradient-to-r from-[hsl(35,20%,96%)] to-[hsl(30,15%,94%)]"
                            : "border-[hsl(30,12%,88%)] hover:border-[hsl(28,12%,75%)] bg-white"
                        )}
                        onClick={() => {
                          const willOpen = selectedCollection !== collection.id;
                          setSelectedCollection(willOpen ? collection.id : null);
                          setCollectionProduct(willOpen);
                          const firstImage = collection?.tech_packs?.find((tp: any) => tp.image_data?.[0]?.url)?.image_data[0].url ?? null;
                          setImageUrl(firstImage);
                          setSelectedProduct(null);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-[hsl(35,20%,96%)] to-[hsl(30,15%,92%)] rounded-lg overflow-hidden shadow-inner">
                            {collection?.tech_packs?.find((tp: any) => tp.image_data?.[0]?.url)?.image_data?.[0]?.url && (
                              <img
                                src={collection.tech_packs.find((tp: any) => tp.image_data?.[0]?.url).image_data[0].url}
                                className="w-full h-full object-cover"
                                alt="Collection"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-[hsl(25,15%,15%)] truncate">{collection.collection_name}</p>
                            <p className="text-xs text-[hsl(25,10%,50%)] truncate">{collection.collection_description}</p>
                          </div>
                        </div>
                      </div>

                      {collectionProduct && selectedCollection === collection.id && (
                        <div className="pl-3 space-y-2">
                          {(collection?.tech_packs ?? [])
                            .filter((techPack: any) => techPack?.image_data?.[0]?.url)
                            .map((techPack: any, idx: number) => (
                              <div
                                key={techPack.id ?? idx}
                                className={cn(
                                  "p-2 border rounded-lg cursor-pointer transition-all text-xs",
                                  selectedProduct === `${collection.id}-${idx}`
                                    ? "border-[hsl(25,15%,15%)] bg-[hsl(35,20%,97%)]"
                                    : "border-[hsl(30,12%,90%)] hover:bg-[hsl(35,20%,98%)]"
                                )}
                                onClick={() => {
                                  setImageUrl(techPack.image_data[0].url);
                                  setSelectedProduct(`${collection.id}-${idx}`);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-[hsl(35,20%,96%)] to-[hsl(30,15%,92%)] rounded overflow-hidden">
                                    <img src={techPack.image_data[0].url} className="w-full h-full object-cover" alt={techPack.name} />
                                  </div>
                                  <p className="font-medium text-[hsl(25,15%,15%)] truncate flex-1">{techPack.name}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Column 2: Live Preview - 4 columns */}

          <Card className="lg:col-span-5 border-2 border-[hsl(30,12%,88%)] shadow-xl bg-gradient-to-br from-white to-[hsl(35,20%,98%)]">
            <CardHeader className="border-b border-[hsl(30,12%,90%)] bg-gradient-to-r from-[hsl(35,20%,97%)] to-[hsl(30,15%,96%)] p-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[hsl(28,12%,45%)]" />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {/* Type Selector - Hide Logo from here */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[hsl(25,15%,20%)]">
                  Image Type
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {[
                    { type: "Creative", icon: Palette },
                    { type: "Ads", icon: Megaphone },
                    { type: "Ecommerce", icon: ShoppingBag },
                    { type: "Social", icon: Instagram },
                  ].map(({ type, icon: Icon }: any) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      onClick={() => setSelectedType(type)}
                      size="sm"
                      className={cn(
                        "flex flex-col items-center gap-1 h-auto py-3 rounded-xl transition-all duration-300 border-2",
                        selectedType === type
                          ? "shadow-md"
                          : "border-[hsl(30,12%,85%)] hover:bg-[hsl(35,20%,96%)]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>


              {/* Prompt */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[hsl(25,15%,20%)]">Prompt</Label>
                <Textarea
                  placeholder="e.g., studio model on white background, lifestyle street shot..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="placeholder:text-[hsl(25,10%,55%)] border-2 border-[hsl(30,12%,85%)] focus:border-[hsl(28,12%,65%)] rounded-xl resize-none text-sm"
                />
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[hsl(25,15%,20%)]">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="border-2 border-[hsl(30,12%,85%)] focus:border-[hsl(28,12%,65%)] rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="2:3">Portrait (2:3)</SelectItem>
                    <SelectItem value="3:2">Landscape (3:2)</SelectItem>
                    <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                    <SelectItem value="4:3">Landscape (4:3)</SelectItem>
                    <SelectItem value="9:16">Mobile (9:16)</SelectItem>
                    <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Character Upload - Always shown in this view (Logo has separate layout) */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[hsl(25,15%,20%)]">Character Image (Optional)</Label>
                <p className="text-xs text-[hsl(25,10%,50%)]">
                  Upload a person/character image for try-on instead of AI-generated models
                </p>

                {!characterImageUrl ? (
                  <div className="border-2 border-dashed border-[hsl(30,12%,85%)] rounded-xl p-4 text-center hover:border-[hsl(28,12%,65%)] hover:bg-[hsl(35,20%,98%)] transition-all duration-300">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCharacterImageUpload}
                      disabled={uploadingCharacter}
                      className="hidden"
                      id="character-upload"
                    />
                    <label htmlFor="character-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      {uploadingCharacter ? (
                        <>
                          <Loader2 className="h-8 w-8 text-[hsl(28,12%,45%)] animate-spin" />
                          <p className="text-xs font-medium text-[hsl(25,10%,45%)]">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(35,20%,94%)] to-[hsl(30,15%,90%)] flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-[hsl(28,12%,45%)]" />
                          </div>
                          <p className="text-xs font-medium text-[hsl(25,15%,25%)]">Click to upload</p>
                          <p className="text-xs text-[hsl(25,10%,50%)]">JPG, PNG up to 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="relative border-2 border-[hsl(30,12%,85%)] rounded-xl overflow-hidden shadow-md">
                    <img src={characterImageUrl} alt="Character" className="w-full h-40 object-cover" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 shadow-lg"
                      onClick={handleRemoveCharacterImage}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Image Count */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[hsl(25,15%,20%)]">Number of Images</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 3, 6] as const).map((count) => (
                    <Button
                      key={count}
                      variant={imageCount === count ? "default" : "outline"}
                      onClick={() => setImageCount(count)}
                      size="sm"
                      className={cn(
                        "flex flex-col items-center gap-1 h-auto py-3 rounded-xl transition-all duration-300 border-2",
                        imageCount === count
                          ? "shadow-md"
                          : "border-[hsl(30,12%,85%)] hover:bg-[hsl(35,20%,96%)]"
                      )}
                    >
                      <span className="text-sm font-semibold">{count}</span>
                      <span className="text-xs opacity-70">{count} Credit{count > 1 ? 's' : ''}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Brand DNA */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[hsl(35,20%,97%)] to-[hsl(30,15%,96%)] border border-[hsl(30,12%,90%)]">
                {getCreatorCredits?.hasEverHadSubscription && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="brand-dna"
                      checked={applyBrandDNA}
                      onCheckedChange={setApplyBrandDNA}
                      className="h-4 w-10 shadow"
                    />

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label htmlFor="brand-dna" className="text-sm cursor-pointer hidden md:inline">
                            Brand DNA
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            Your brand DNA will be integrated in your prompts for personalized generations
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label htmlFor="brand-dna" className="text-sm cursor-pointer md:hidden">
                            Brand DNA
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">
                            Your brand DNA will be integrated in your prompts for personalized generations
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs hidden md:inline">
                        Recommended
                      </Badge>

                      {applyBrandDNA && activeDna && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}

                      {applyBrandDNA && !activeDna && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                            No DNA Found
                          </Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant="link"
                            className="text-xs h-auto p-0"
                            onClick={() => router.push("/creator-dashboard/dna")}
                          >
                            Create DNA
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                variant={"default"}
                className="w-full h-11 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                onClick={() =>
                  handlegenerateProducts({
                    originalProduct: imageUrl ?? "",
                    editPrompt: prompt,
                    generationType: selectedType,
                    characterImage: characterImageUrl,
                    logoUrl: logoImageUrl ?? undefined,
                    aspectRatio: aspectRatio,
                    imageCount: imageCount,
                  })
                }
                disabled={isGenerating || !prompt || !selectedProduct}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Images
                  </>
                )}
              </Button>
            </CardContent>
          </Card>


          {/* Column 3: Prompt Controls - 5 columns */}
          <Card className="lg:col-span-4 border-2 border-[hsl(30,12%,88%)] shadow-xl bg-gradient-to-br from-white to-[hsl(35,20%,98%)]">
            <CardHeader className="border-b border-[hsl(30,12%,90%)] bg-gradient-to-r from-[hsl(35,20%,97%)] to-[hsl(30,15%,96%)] p-4">
              <CardTitle className="text-base font-semibold">Product Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="aspect-square bg-gradient-to-br from-[hsl(35,20%,96%)] to-[hsl(30,15%,92%)] rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-[hsl(30,12%,88%)]">
                {imageUrl ? (
                  <img src={imageUrl} alt="Selected Product" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 mx-auto text-[hsl(28,12%,45%)] mb-2 opacity-50" />
                    <p className="text-sm text-[hsl(25,10%,45%)]">Select a product to preview</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

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