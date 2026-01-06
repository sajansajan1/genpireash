"use client";

import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import {
  Plus,
  Upload,
  ImageIcon,
  Sparkles,
  Crown,
  Wand2,
  CheckCircle,
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
  Leaf,
  Briefcase,
  Palette,
  Activity,
  Moon,
  Backpack,
  ArrowLeft,
  AlertCircle,
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
import { Collection, CollectionInput } from "@/app/actions/ai-collections";
import { useCreateCollectionStore } from "@/lib/zustand/collections/createCollection";
import { useUserStore } from "@/lib/zustand/useStore";
import { useGetCreatorCollectionStore } from "@/lib/zustand/collections/getAllCollections";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { DeductCredits } from "@/lib/supabase/payments";
import { useUserProfileStore } from "@/lib/zustand/getUserProfile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetCreatorDnaStore } from "@/lib/zustand/brand-dna/getDna";
import { GenerationProgressModal } from "@/components/generation-progress-modal";
import { CollectionModalLoader } from "@/components/collection-loader";
import { enhancePromptAction } from "@/app/actions/extract-ai-prompt";
import { cp } from "fs";
import LogoInstructionModal from "@/components/logo-instruction-modal";
import { useGenerationProgress } from "@/hooks/use-generation-progress";

const suggestedPrompts = [
  {
    icon: Leaf,
    text: "A sustainable summer collection featuring organic cotton basics, linen dresses, and eco-friendly accessories in earth tones",
  },
  {
    icon: Briefcase,
    text: "A minimalist professional wardrobe with versatile blazers, tailored pants, and classic shirts in neutral colors",
  },
  {
    icon: Palette,
    text: "A bold artistic collection with statement prints, vibrant colors, and unique silhouettes inspired by contemporary art",
  },
  {
    icon: Activity,
    text: "A performance-focused activewear collection with moisture-wicking fabrics, ergonomic designs, and modern athletic aesthetics",
  },
  {
    icon: Moon,
    text: "A cozy nightwear collection with soft fabrics, relaxed fits, and calming colors for ultimate comfort",
  },
  {
    icon: Backpack,
    text: "A travel-ready collection with wrinkle-resistant fabrics, versatile pieces, and functional details",
  },
];

export default function CollectionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState("prompt");
  const [collectionPrompt, setCollectionPrompt] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [isImproved, setIsImproved] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [collectionSize, setCollectionSize] = useState(12);
  const [applyBrandDNA, setApplyBrandDNA] = useState(true);
  const [collectionType, setCollectionType] = useState("single-product"); // "single" or "multi"

  // File uploads
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [sketchFiles, setSketchFiles] = useState<File[]>([]);
  const [sketchPreviews, setSketchPreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [collectionViewMode, setCollectionViewMode] = useState<"grid" | "list">("grid");
  const [collection_name, setCollection_name] = useState("");
  const [collection_description, setCollection_description] = useState("");
  const {
    getCreatorCollection,
    fetchCreatorCollection,
    refresCreatorCollection,
    loadingGetCreatorCollection,
    errorGetCreatorCollection,
  } = useGetCreatorCollectionStore();
  const { fetchCreatorDna, getActiveDna } = useGetCreatorDnaStore();
  const { creatorProfile } = useUserStore();
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const credits = getCreatorCredits;
  const refetch = refresCreatorCredits;
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const activeDna = getActiveDna();

  useEffect(() => {
    if (!activeDna) {
      fetchCreatorDna();
    }
  }, [activeDna, fetchCreatorDna]);
  useEffect(() => {
    if (!getCreatorCollection && fetchCreatorCollection) {
      fetchCreatorCollection();
    }
  }, [getCreatorCollection, fetchCreatorCollection]);

  const applySuggestedPrompt = useCallback((promptText: string) => {
    setCollectionPrompt(promptText);
    setSelectedPrompt(promptText);
    setIsImproved(false);
    setOriginalPrompt("");
  }, []);

  const handleImprovePrompt = async () => {
    if (isImproving || !collectionPrompt.trim()) return;

    if (isImproved) {
      setCollectionPrompt(originalPrompt);
      setIsImproved(false);
      return;
    }

    try {
      setIsImproving(true);
      setOriginalPrompt(collectionPrompt);

      const enhancedPrompt = await enhancePromptAction(collectionPrompt);

      if (!enhancedPrompt) {
        toast({
          title: "Error",
          description: "AI could not enhance your prompt. Please try again.",
          variant: "destructive",
        });
        setIsImproving(false);
        return;
      }

      setCollectionPrompt(enhancedPrompt);
      setIsImproved(true);

      toast({
        title: "Prompt Enhanced!",
        description: "Your collection prompt has been improved with AI suggestions.",
      });
    } catch (err) {
      console.error("Error improving prompt:", err);
      toast({
        title: "Error",
        description: "Something went wrong while improving your prompt.",
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };

  // Call this when modal is closed
  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg"];
    const validExtensions = ["png", "jpg", "jpeg"];

    const fileTypeValid = validTypes.includes(file.type);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const extensionValid = validExtensions.includes(fileExtension);

    if (!fileTypeValid || !extensionValid) {
      setUploadError("Please upload a PNG, JPG, or JPEG file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 8);
      let header = "";
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, "0");
      }

      const isJPEG = header.startsWith("ffd8ff");
      const isPNG = header.startsWith("89504e470d0a1a0a");

      if ((fileExtension === "jpg" || fileExtension === "jpeg") && !isJPEG) {
        setUploadError("File extension is .jpg/.jpeg but file content is not a valid JPEG image.");
        return;
      }

      if (fileExtension === "png" && !isPNG) {
        setUploadError("File extension is .png but file content is not a valid PNG image.");
        return;
      }

      const previewReader = new FileReader();
      previewReader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      previewReader.readAsDataURL(file);

      setModalOpen(true);
    };

    reader.readAsArrayBuffer(file.slice(0, 8));
  };

  const handleSketchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = ["image/png", "image/jpeg"];
    const validExtensions = ["png", "jpg", "jpeg"];

    const validationPromises = files.map((file) => {
      return new Promise<{ file: File; startPreview: boolean } | null>((resolve) => {
        setUploadError(null);

        const fileTypeValid = validTypes.includes(file.type);
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
        const extensionValid = validExtensions.includes(fileExtension);

        if (!fileTypeValid || !extensionValid) {
          toast({
            variant: "destructive",
            description: `${file.name} must be PNG, JPG, or JPEG`,
          });
          resolve(null);
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          toast({
            variant: "destructive",
            description: `${file.name} is too large. Max size is 2MB.`,
          });
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 8);
          let header = "";
          for (let i = 0; i < arr.length; i++) {
            header += arr[i].toString(16).padStart(2, "0");
          }

          const isJPEG = header.startsWith("ffd8ff");
          const isPNG = header.startsWith("89504e470d0a1a0a");

          if ((fileExtension === "jpg" || fileExtension === "jpeg") && !isJPEG) {
            toast({
              variant: "destructive",
              description: `${file.name} extension is .jpg/.jpeg but content is not valid JPEG.`,
            });
            resolve(null);
            return;
          }

          if (fileExtension === "png" && !isPNG) {
            toast({
              variant: "destructive",
              description: `${file.name} extension is .png but content is not valid PNG.`,
            });
            resolve(null);
            return;
          }

          // Passed all checks
          resolve({ file, startPreview: true });
        };

        reader.readAsArrayBuffer(file.slice(0, 8));
      });
    });

    const results = await Promise.all(validationPromises);
    const validFiles = results
      .filter((res): res is { file: File; startPreview: boolean } => res !== null)
      .map((res) => res.file);

    if (validFiles.length > 0) {
      setSketchFiles((prev) => [...prev, ...validFiles]);

      validFiles.forEach((file) => {
        const previewReader = new FileReader();
        previewReader.onload = (e) => {
          setSketchPreviews((prev) => [...prev, e.target?.result as string]);
        };
        previewReader.readAsDataURL(file);
      });
    }
  };

  const removeSketch = (index: number) => {
    setSketchFiles((prev) => prev.filter((_, i) => i !== index));
    setSketchPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const generateCollection = async (input: CollectionInput): Promise<Collection | null> => {
    const requiredCredits = input.size;

    if ((credits?.credits ?? 0) < requiredCredits) {
      toast({
        variant: "destructive",
        title: "No Credits Left!",
        description: "You don't have enough credits. Please purchase credits to generate a tech pack.",
      });
      return null;
    }

    const hasSubscriptionHistory = credits?.hasEverHadSubscription;
    if (!hasSubscriptionHistory) {
      toast({
        title: "Subscription Required",
        description: "You need a plan to generate collections. Please subscribe to continue.",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai-collections/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          credits: {
            current: credits?.credits ?? 0,
            required: requiredCredits,
            hasSubscription: hasSubscriptionHistory,
          },
        }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to generate the collection.",
          variant: "destructive",
        });
        return null;
      }

      let collectionData;
      try {
        collectionData = await response.json();
      } catch {
        toast({ title: "Error", description: "Invalid server response.", variant: "destructive" });
        return null;
      }

      toast({
        title: "Collection Generated!",
        description: `${input.size} items have been created successfully.`,
      });

      await refresCreatorCollection();
      await refetch();

      router.push(`/creator-dashboard/collections/${collectionData.id}`);
      return collectionData;
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Unknown error occurred");
      toast({
        title: "Error",
        description: "Failed to generate collection. Please try another concept.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  if (!getCreatorCollection || loadingGetCreatorCollection || errorGetCreatorCollection) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-700">Loading Collections...</span>
      </div>
    );
  }

  if (showWizard) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-4 md:py-8 px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            {/* Left section */}
            <div>
              <h1 className="text-2xl font-bold">Collections Generator</h1>
              <p className="text-[#1C1917]">Generate capsule collections of 6, 12, 18, or 24 products in one flow.</p>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowWizard(false)} className="text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to collection
              </Button>
            </div>
          </div>

          <form className="max-w-4xl mx-auto">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-4 bg-gradient-to-r from-background/50 to-muted/20">
                <CardTitle className="text-xl">Collection Details</CardTitle>
                <CardDescription>Describe your collection idea and configure the generation settings</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collection-name">Collection Name</Label>
                    <Input
                      id="collection-name"
                      placeholder="e.g. Summer Essentials 2024"
                      value={collection_name}
                      onChange={(e) => setCollection_name(e.target.value)}
                      required
                      className="placeholder:text-gray-400 "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collection-desc">Collection Description</Label>
                    <Input
                      id="collection-desc"
                      placeholder="e.g. A versatile summer collection for everyday wear"
                      value={collection_description}
                      onChange={(e) => setCollection_description(e.target.value)}
                      required
                      className="placeholder:text-gray-400 "
                    />
                  </div>
                </div>

                {/* Suggested Prompts */}

                {/* Main Input Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="prompt">Describe Collection</TabsTrigger>
                    <TabsTrigger value="upload">Upload Sketches</TabsTrigger>
                  </TabsList>

                  <TabsContent value="prompt" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 my-6">
                        {credits?.hasEverHadSubscription && (
                          <div className="flex items-center space-x-2 justify-end w-full">
                            <Switch
                              id="brand-dna"
                              checked={applyBrandDNA}
                              onCheckedChange={setApplyBrandDNA}
                              className="h-4 w-10 shadow"
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Label htmlFor="brand-dna" className="text-sm hidden md:inline cursor-pointer">
                                    Brand DNA
                                  </Label>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">
                                  <p className="max-w-xs text-xs">
                                    Your brand DNA will be integrated in your prompts for personalized generations
                                  </p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Label htmlFor="brand-dna" className="text-sm md:hidden cursor-help">
                                    Brand DNA
                                  </Label>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">
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
                                <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                                  Active
                                </Badge>
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

                      <div className="flex items-center justify-between">
                        <Label htmlFor="collection-prompt">Describe Your Collection</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleImprovePrompt}
                          disabled={isImproving || !collectionPrompt.trim()}
                          className="h-8 px-2"
                        >
                          {isImproving ? (
                            <Sparkles className="h-4 w-4 animate-spin" />
                          ) : isImproved ? (
                            <>
                              <span className="hidden sm:inline">Revert</span>
                              <span className="sm:hidden">Revert</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">AI Improve</span>
                              <span className="sm:hidden">AI Improve</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <Textarea
                        id="collection-prompt"
                        placeholder="e.g. A sustainable summer collection featuring organic cotton basics, linen dresses, and eco-friendly accessories in earth tones"
                        value={collectionPrompt}
                        onChange={(e) => {
                          setCollectionPrompt(e.target.value);
                          if (isImproved) {
                            setIsImproved(false);
                            setOriginalPrompt("");
                          }
                        }}
                        className={`min-h-[120px] placeholder:text-gray-400  text-sm ${isImproved ? "border-green-200 bg-green-50/50" : ""
                          }`}
                        required
                      />
                      {isImproved && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>AI Enhanced</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload Sketches or Inspiration</Label>
                      <div
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-muted-foreground/25 hover:bg-muted/50"
                        onClick={() => sketchInputRef.current?.click()}
                      >
                        <Upload className="h-10 w-10 mx-auto mb-4 text-[#1C1917]" />
                        <p className="text-base mb-1">Drag and drop your sketches here, or click to browse</p>
                        <p className="text-sm text-[#1C1917]">Supports PNG, JPG or JPEG (max 2mb each)</p>
                        <input
                          ref={sketchInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          className="hidden"
                          multiple
                          onChange={handleSketchUpload}
                        />
                      </div>

                      {sketchPreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {sketchPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview || "/placeholder.svg"}
                                alt={`Sketch ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => removeSketch(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Collection Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Collection Size */}
                  <div className="space-y-3">
                    <Label>Collection Size</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {[6, 12, 18, 24].map((size) => (
                        <Card
                          key={size}
                          className={`cursor-pointer transition-colors ${collectionSize === size ? "ring-2 ring-primary" : ""
                            }`}
                          onClick={() => setCollectionSize(size)}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="text-lg font-bold">{size}</div>
                            <div className="text-xs text-[#1C1917]">pieces</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {size} credit{size > 1 ? "s" : ""}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Collection Type */}
                  <div className="space-y-3">
                    <Label>Collection Type</Label>
                    <RadioGroup value={collectionType} onValueChange={setCollectionType} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single-product" id="single-product" />
                        <Label htmlFor="single-product" className="text-sm">
                          Single-product collection (variations of one product type)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multi-product" id="multi-product" />
                        <Label htmlFor="multi-product" className="text-sm">
                          Multi-product collection (shirts, pants, bags, etc.)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Optional Settings */}
                <div className="space-y-4">
                  {/* Brand Logo Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Add your brand logo (Optional)
                    </Label>
                    <p className="text-xs text-[#1C1917] mb-3">
                      Upload your logo to see it placed on product samples and mockups
                    </p>
                    <div className="flex items-center gap-4">
                      <Label
                        // htmlFor="logo-upload"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer flex items-center gap-2 border rounded-md px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleLogoUpload}
                        ref={fileInputRef}
                      />
                      {logoPreview && (
                        <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                          <img
                            src={logoPreview || "/placeholder.svg"}
                            alt="Logo preview"
                            className="object-cover h-full w-full"
                          />
                        </div>
                      )}
                      {/* Error */}
                      {uploadError && (
                        <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {uploadError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center mt-6">
              <Button
                type="button"
                onClick={() =>
                  generateCollection({
                    name: collection_name,
                    description: collectionPrompt,
                    size: collectionSize || 6,
                    type: collectionType as "single-product" | "multi-product",
                    logo: logoPreview || undefined,
                    images: sketchPreviews.length > 0 ? sketchPreviews.map((url) => ({ url })) : undefined,
                    creatorId: creatorProfile?.id,
                    collection_description: collection_description,
                    applyBrandDna: applyBrandDNA,
                    brandDnaId: activeDna?.id,
                  })
                }
                disabled={
                  isGenerating ||
                  !collection_name ||
                  !collection_description ||
                  (!collectionPrompt.trim() && sketchFiles.length === 0)
                }
                className="gap-2 flex items-center px-8 py-3 text-base"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    <span>Generating Collection...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Collection</span>
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3 pt-4">
              <Label className="text-sm font-medium">Quick Start Ideas</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedPrompts.map((suggestion, index) => {
                  const IconComponent = suggestion.icon;
                  return (
                    <Card
                      key={index}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${selectedPrompt === suggestion.text ? "bg-muted" : ""
                        }`}
                      onClick={() => applySuggestedPrompt(suggestion.text)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-zinc-900/5 flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-zinc-900" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-[#1C1917] line-clamp-2">{suggestion.text}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Loading Skeleton Grid */}
          {/* {isGenerating && (
            <div className="max-w-6xl mx-auto mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: collectionSize }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )} */}
          <CollectionModalLoader isOpen={isGenerating} />
        </div>
        <LogoInstructionModal open={modalOpen} onClose={handleModalClose} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        {/* Left section */}
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-[#1C1917]">Generate capsule collections of 6, 12, 18, or 24 products in one flow.</p>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <Button
              variant={collectionViewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCollectionViewMode("grid")}
              className={`rounded-r-none ${collectionViewMode === "grid"
                ? "bg-black hover:bg-gray-800 text-white"
                : "bg-[rgba(244,243,240,1)] hover:bg-stone-100 text-black"
                }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>

            <Button
              variant={collectionViewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCollectionViewMode("list")}
              className={`rounded-l-none ${collectionViewMode === "list"
                ? "bg-black hover:bg-black text-white"
                : "bg-[rgba(244,243,240,1)] hover:bg-stone-100 text-black"
                }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowWizard(true)} className="text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create New Collection
          </Button>
        </div>
      </div>

      {/* Collections Grid */}
      {collectionViewMode === "grid" ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getCreatorCollection?.map((collection: any) => {
          const previewImages = collection?.tech_packs
            ?.map((item: any) => item?.image_data?.[0])
            .filter(Boolean)
            .slice(0, 4);

          const extraCount = collection?.tech_packs?.length - 4;

          return (
            <Card key={collection?.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{collection?.collection_name}</CardTitle>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
                <CardDescription>
                  {collection?.tech_packs?.length} items • Created{" "}
                  {new Date(collection?.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Image grid like Instagram */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {previewImages?.map((image: any, index: number) => (
                    <div key={index} className="aspect-square bg-muted rounded overflow-hidden relative">
                      <img src={image.url} alt={`Preview image ${index + 1}`} className="w-full h-full object-cover" />
                      {/* Overlay on last image if there are more tech packs */}
                      {index === 3 && collection?.tech_packs?.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-xl font-semibold">
                          +{extraCount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Optional: Show name of first tech pack */}
                {collection?.tech_packs?.[0]?.name && (
                  <p className="text-sm mt-1 text-center text-[#1C1917]">{collection?.tech_packs[0]?.name}</p>
                )}
              </CardContent>

              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => router.push(`/creator-dashboard/collections/${collection.id}`)}
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
          {getCreatorCollection?.map((collection: any) => {
            const previewImages = collection?.tech_packs
              ?.map((item: any) => item?.image_data?.[0])
              .filter(Boolean)
              .slice(0, 2);
            const extraCount = (collection?.tech_packs?.length || 0) - 2;
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
                            src={image?.url}
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

                    {/* RIGHT — TEXT (VERTICALLY CENTERED) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between w-full">

                        {/* COLLECTION NAME + SUBTEXT */}
                        <div>
                          <h3 className="font-semibold text-lg leading-tight">
                            {collection?.collection_name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {collection?.tech_packs?.length} items • Created{" "}
                            {new Date(collection?.created_at).toLocaleDateString()}
                          </p>

                          {/* FIRST ITEM NAME */}
                          {collection?.tech_packs?.[0]?.name && (
                            <p className="text-sm text-[#1C1917] mt-2 line-clamp-2">
                              {collection?.tech_packs?.[0]?.name}
                            </p>
                          )}
                        </div>

                        {/* RIGHT SIDE: BADGE + VIEW */}
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/creator-dashboard/collections/${collection.id}`)
                            }
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
      )}
    </div>
  );
}
