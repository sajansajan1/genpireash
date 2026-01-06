"use client";

import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Info,
  Lightbulb,
  Sparkles,
  FileImage,
  AlertCircle,
  X,
  ArrowLeft,
  ShoppingBag,
  Activity,
  Flame,
  Backpack,
  Glasses,
  Droplet,
  Plus,
  Lock,
  Eye,
  ChevronDown,
  ChevronUp,
  Pen,
  Pencil,
  FileText,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateIdea } from "@/app/actions/idea-generation";
import { createMinimalProductEntry } from "@/app/actions/create-product-entry";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { uploadFileToSupabase, uploadPdfToSupabse } from "@/lib/supabase/file_upload";
import { toast } from "@/hooks/use-toast";
import { improvePrompt, improveDesignDescription } from "@/app/actions/prompt-improvement";
import { GenerationProgressModal } from "@/components/generation-progress-modal";
import { useGenerationProgress } from "@/hooks/use-generation-progress";
import { useUserStore } from "@/lib/zustand/useStore";
import { useProductIdeasStore } from "@/lib/zustand/techpacks/getAllTechPacks";
import { useCreateNotificationStore } from "@/lib/zustand/notifications/createNotification";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { useGetCreatorDnaStore } from "@/lib/zustand/brand-dna/getDna";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import LogoInstructionModal from "../logo-instruction-modal";
import ProductCard from "../product-example/page";
import ProductGuideModal from "../product-guide-modal";
import { BrandDnaCollapsible } from "./brand-dna-collapsible";
import { GenerationToolsMenu } from "./generation-tools-menu";
import type { GenerationMode } from "@/app/actions/create-product-entry";

import { Whiteboard } from "../white-board-moduler/Whiteboard/Whiteboard";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, VisuallyHidden } from "@/components/ui/dialog";
import { MediaUploadModal } from "@/components/dashboard/media-upload-modal";
import { PDFScanModal } from "./pdf-scan-modal";
import type { PDFExtractedData } from "@/lib/services/pdf-extraction-service";
import { uploadPdfClient } from "@/lib/supabase/client_upload";

export default function IdeaUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("text");
  const [productIdea, setProductIdea] = useState("");
  const [productdetail, setProductDetail] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designFilePreview, setDesignFilePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [isImproved, setIsImproved] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [applyBrandDNA, setApplyBrandDNA] = useState(false);
  const [productGoal, setProductGoal] = useState("");
  const [generateMoreImages, setGenerateMoreImages] = useState(true);
  const { user, creatorProfile } = useUserStore();
  const { refreshProductIdeas } = useProductIdeasStore();
  const { setCreateNotification } = useCreateNotificationStore();
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits } = useGetCreditsStore();
  const credits = getCreatorCredits;
  const { fetchCreatorDna, getActiveDna, getCreatorDna, refresCreatorDna } = useGetCreatorDnaStore();
  const [showDnaSelector, setShowDnaSelector] = useState(false);
  const [isTogglingDna, setIsTogglingDna] = useState(false);
  const { fetchProductIdeas, productIdeas } = useProductIdeasStore();
  const [showAttachmentModal, setShowAttachmentModal] = useState<any>(false);
  const [publicProduct, setPublicProduct] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [hasShownOnboardingModal, setHasShownOnboardingModal] = useState(false);
  const [isEditWhiteboardOpen, setIsEditWhiteboardOpen] = useState(false);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("regular");
  const [isNewWhiteboardOpen, setIsNewWhiteboardOpen] = useState(false);
  const activeDna = getActiveDna();

  // PDF Scanner state
  const [isPdfScanModalOpen, setIsPdfScanModalOpen] = useState(false);
  const [isPdfScanning, setIsPdfScanning] = useState(false);
  const [pdfExtractedData, setPdfExtractedData] = useState<PDFExtractedData | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  // Use the generation progress hook
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

  useEffect(() => {
    if (!activeDna) {
      fetchCreatorDna();
    }
  }, [fetchCreatorDna, activeDna]);

  useEffect(() => {
    if (activeDna && activeDna.status === true) {
      setApplyBrandDNA(true);
    }
  }, [activeDna]);

  // Function to activate a different Brand DNA
  const activateDna = async (dnaId: string) => {
    const allDnas = getCreatorDna;
    if (!Array.isArray(allDnas)) return;

    setIsTogglingDna(true);
    try {
      // Find the DNA to activate
      const dnaToActivate = allDnas.find((dna: any) => dna.id === dnaId);
      if (!dnaToActivate) {
        throw new Error("DNA not found");
      }

      // If already active, do nothing
      if (dnaToActivate.status === true) {
        toast({
          title: "Already Active",
          description: "This Brand DNA is already active.",
        });
        setIsTogglingDna(false);
        setShowDnaSelector(false);
        return;
      }

      // Deactivate all other DNAs and activate this one
      const updatePromises = allDnas.map(async (dna: any) => {
        if (dna.id === dnaId) {
          // Activate this DNA
          const response = await fetch(`/api/brand-dna/update-dna`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: dna.id, status: true }),
          });
          if (!response.ok) throw new Error("Failed to activate DNA");
        } else if (dna.status === true) {
          // Deactivate other active DNAs
          const response = await fetch(`/api/brand-dna/update-dna`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: dna.id, status: false }),
          });
          if (!response.ok) throw new Error("Failed to deactivate DNA");
        }
      });

      await Promise.all(updatePromises);
      await refresCreatorDna();

      toast({
        title: "DNA Activated",
        description: `${dnaToActivate.brand_name} is now your active Brand DNA.`,
      });
      setShowDnaSelector(false);
    } catch (error) {
      console.error("Error activating DNA:", error);
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: "Unable to activate Brand DNA.",
      });
    } finally {
      setIsTogglingDna(false);
    }
  };

  useEffect(() => {
    if (!productIdea) {
      fetchProductIdeas();
    }
  }, []);
  // Renamed function to avoid lint error about hook naming
  const applySuggestedPrompt = useCallback((promptText: string) => {
    setProductIdea(promptText);
    setActiveTab("text");
    setSelectedPrompt(promptText);
  }, []);

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => (prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]));
  };

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };
  // Call this when modal is closed
  const handleModalClose = () => {
    setShowAttachmentModal(false);
  };

  // Handler for selecting logo from media library
  const handleLogoSelectFromMedia = (imageUrl: string) => {
    setPreviewUrl(imageUrl);
    setFilePreview(imageUrl);
    setSelectedFile(null); // Clear any local file since we're using a URL
  };

  // Handler for selecting design file from media library
  const handleDesignSelectFromMedia = (imageUrl: string) => {
    setDesignFilePreview(imageUrl);
    setDesignFile(null); // Clear any local file since we're using a URL
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg"];
    const validExtensions = ["png", "jpg", "jpeg"];

    const fileTypeValid = validTypes.includes(file.type);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const extensionValid = validExtensions.includes(fileExtension);

    if (!fileTypeValid || !extensionValid) {
      setUploadError("Please upload a PNG, JPG or JPEG file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size must be less than 2MB");
      return;
    }

    // Validate file signature (first 8 bytes)
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

      // All checks passed — process preview
      setSelectedFile(file);
      const previewReader = new FileReader();
      previewReader.onload = () => {
        const result = previewReader.result as string;
        setPreviewUrl(result);
        setFilePreview(result);
      };
      previewReader.readAsDataURL(file);

      setShowAttachmentModal(true);
    };

    reader.readAsArrayBuffer(file.slice(0, 8));
  };

  const handleDesignFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg"];
    const validExtensions = ["png", "jpg", "jpeg"];

    const fileTypeValid = validTypes.includes(file.type);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const extensionValid = validExtensions.includes(fileExtension);

    if (!fileTypeValid || !extensionValid) {
      setUploadError("Please upload a PNG, JPG or JPEG file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = function (e) {
      const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 8);
      let header = "";
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, "0");
      }

      // Signature checks
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

      // Passed all checks
      setDesignFile(file);

      if (file.type.startsWith("image/")) {
        const previewReader = new FileReader();
        previewReader.onload = (e) => {
          setDesignFilePreview(e.target?.result as string);
        };
        previewReader.readAsDataURL(file);
      } else {
        setDesignFilePreview("/placeholder.svg?height=200&width=200&text=Invalid+Image");
      }
    };

    reader.readAsArrayBuffer(file.slice(0, 8));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // This automatically adds the "data:image/*;base64," prefix
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Build comprehensive initial chat message with all form data
   * This message will be stored in chat_sessions and provides full context to the designer
   */
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

  const handleRemoveDesignFile = () => {
    setDesignFile(null);
    setDesignFilePreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImprovePrompt = async () => {
    if (isImproving) return;
    if (isImproved) {
      // Revert to original
      setProductIdea(originalPrompt);
      setIsImproved(false);
      return;
    }
    if (!productIdea.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a prompt first",
      });
      return;
    }
    setIsImproving(true);
    setOriginalPrompt(productIdea); // Store original before improving
    try {
      const result = await improvePrompt(productIdea);
      if (result.success && result.improvedPrompt) {
        setProductIdea(result.improvedPrompt);
        setIsImproved(true);
        toast({
          variant: "default",
          title: "Prompt Enhanced!",
          description: "Your prompt has been improved with AI suggestions.",
        });
      } else {
        toast({
          variant: "destructive",
          description: result.error || "Failed to improve prompt",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to improve prompt. Please try again.",
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleImproveDesignDescription = async () => {
    if (isImproving) return;

    // Check if design file is uploaded
    if (!designFile) {
      toast({
        variant: "destructive",
        description: "Please upload a design file first",
      });
      return;
    }

    setIsImproving(true);
    const originalDescription = productdetail;
    try {
      // Convert design file to base64 for analysis
      let designImageBase64 = designFilePreview; // This already contains the base64 data URL

      // If description is empty, we'll generate one based on the image
      const result = await improveDesignDescription(
        productdetail || "", // Pass empty string if no description
        designImageBase64 || undefined
      );

      if (result.success && result.improvedPrompt) {
        setProductDetail(result.improvedPrompt);
        toast({
          variant: "default",
          title: "Description Enhanced!",
          description: designFile
            ? "Your description has been improved based on the uploaded design."
            : "Your design description has been improved with AI.",
        });
      } else {
        toast({
          variant: "destructive",
          description: result.error || "Failed to improve description",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to improve description. Please try again.",
      });
      setProductDetail(originalDescription); // Revert on error
    } finally {
      setIsImproving(false);
    }
  };

  // ========================================
  // PDF SCANNER HANDLERS
  // ========================================

  /**
   * Handle PDF file selection and trigger scan
   */
  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate PDF
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file.",
      });
      return;
    }

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 20MB.",
      });
      return;
    }

    // Start scanning
    setIsPdfScanning(true);
    setIsPdfScanModalOpen(true);

    try {
      let fileUrl = "";

      // Upload to Supabase first (Client-Side)
      toast({
        title: "Uploading PDF...",
        description: "Please wait while we secure your file.",
      });

      const uploadedUrl = await uploadPdfClient(file);

      if (!uploadedUrl) {
        toast({
          title: "Failed to upload PDF file.",
          description: "Please try again.",
        });
        return
      }

      fileUrl = uploadedUrl;
      console.log("🔍 ~ IdeaUploadPage ~ components/idea-upload/page.tsx:646 ~ fileUrl:", fileUrl);

      toast({
        title: "Analyzing PDF...",
        description: "Our AI is extracting product details.",
      });

      // Send URL to API instead of file buffer
      const response = await fetch("/api/pdf-scanner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setPdfExtractedData(result.data);
        handleUseExtractedData(result.data);
        toast({
          title: "PDF Scanned Successfully",
          description: `Extracted data from ${result.data.pageCount} page(s)`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Scan Failed",
          description: result.error || "Failed to extract data from PDF",
        });
        setIsPdfScanModalOpen(false);
      }
    } catch (error) {
      console.error("PDF scan error:", error);
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: "An error occurred while scanning the PDF.",
      });
      setIsPdfScanModalOpen(false);
    } finally {
      setIsPdfScanning(false);
      // Reset file input
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }
  };

  /**
   * Handle "Use for Product" - pre-fill form with extracted data
   */
  const handleUseExtractedData = (data: PDFExtractedData) => {
    // Build a comprehensive product description from extracted data
    const descriptionParts: string[] = [];
    descriptionParts.push(`\nIMPORTANT: All design decisions should be consistent with this brand identity.\n`);
    if (data.productName) {
      descriptionParts.push(data.productName);
    }
    if (data.productType) {
      descriptionParts.push(`Type: ${data.productType}`);
    }
    if (data.description) {
      descriptionParts.push(data.description);
    }
    if (data.materials.length > 0) {
      const materialsList = data.materials
        .map((m) => `${m.name}${m.percentage ? ` (${m.percentage})` : ""}`)
        .join(", ");
      descriptionParts.push(`Materials: ${materialsList}`);
    }
    if (data.colorPalette.length > 0) {
      const colorsList = data.colorPalette.map((c) => c.name).join(", ");
      descriptionParts.push(`Colors: ${colorsList}`);
    }
    if (data.availableSizes.length > 0) {
      descriptionParts.push(`Sizes: ${data.availableSizes.join(", ")}`);
    }

    // Set form fields
    if (data.designImages.length > 0) {
      descriptionParts.push(`\n\n📎 Design file attached - analyze and generate product views based on this design`);
      descriptionParts.push(`\nDesign Images: ${data.designImages.length}`);
      setProductDetail(descriptionParts.join("\n"));
    } else {
      descriptionParts.push(`\n\n📎 No design file attached - generate product views based on this description`);
      setProductIdea(descriptionParts.join("\n"));
    }
    setCategory(data.category || "");

    // Set colors if available
    if (data.colorPalette.length > 0) {
      const colorNames = data.colorPalette.map((c) => c.name);
      setSelectedColors(colorNames);
    }

    // If there are design images, set the first one as design file
    if (data.designImages.length > 0) {
      setDesignFilePreview(data.designImages[0].imageData);
    }

    toast({
      title: "Data Applied",
      description: "Form has been pre-filled with extracted PDF data.",
    });

    // setActiveTab("text");
  };

  /**
   * Handle "Generate Product" - create product directly from extracted data
   */
  const handleGenerateFromPdf = async (data: PDFExtractedData) => {
    // First apply the data to form
    handleUseExtractedData(data);
    handleSubmitNew(null, generateMoreImages);
  };

  /**
   * NEW OPTIMIZED FLOW: Create minimal entry and redirect to designer immediately
   * This replaces the blocking generateIdea() call with a fast, progressive flow
   */
  const handleSubmitNew = async (e: React.FormEvent | null, overrideGenerateMoreImages?: boolean) => {
    // Credit check
    if (e) e.preventDefault();
    // Treat undefined credits as 0 to avoid "possibly undefined" compile error
    // User needs at least 1 credit to generate the front view
    if ((credits?.credits ?? 0) < 1) {
      return toast({
        variant: "destructive",
        title: "No Credits left!",
        description: "You don't have any credits left. Please purchase Credits to Generate Techpack",
      });
    }
    const guideCheck = productIdeas?.length === 0;

    const finalGenerateMoreImages = overrideGenerateMoreImages ?? generateMoreImages;

    if (!user?.id) {
      return toast({
        variant: "destructive",
        description: "Please log in to continue",
      });
    }

    // Validation
    if (activeTab === "text" && !productIdea.trim()) {
      return toast({
        variant: "destructive",
        description: "Please enter a product idea",
      });
    }

    if (activeTab === "image" && !designFile && !designFilePreview) {
      return toast({
        variant: "destructive",
        description: "Please upload a design file",
      });
    }

    // Start progress modal
    startProgress();

    try {
      // Step 1: Convert files to base64 if needed
      let logoBase64 = filePreview;
      let designFileBase64 = designFilePreview;

      // Debug: Log what we have before submission
      console.log("🚀 handleSubmitNew - Before submission:", {
        activeTab,
        hasSelectedFile: !!selectedFile,
        hasFilePreview: !!filePreview,
        logoBase64Length: logoBase64?.length || 0,
        hasDesignFile: !!designFile,
        hasDesignFilePreview: !!designFilePreview,
        designFileBase64Length: designFileBase64?.length || 0,
      });

      if (designFile && !designFileBase64) {
        designFileBase64 = await convertFileToBase64(designFile);
      }

      // Step 2: Build comprehensive initial message
      const initialMessage = buildInitialChatMessage({
        productIdea: activeTab === "text" ? productIdea : productdetail,
        productDetail: activeTab === "text" ? "" : productdetail,
        category,
        intendedUse,
        selectedKeywords,
        selectedColors,
        productGoal,
        hasDesignFile: !!designFileBase64,
        hasLogo: !!logoBase64,
        brandDNA: activeDna,
        applyBrandDNA: applyBrandDNA,
      });

      console.log("📋 Initial message with Brand DNA:", {
        applyBrandDNA,
        hasBrandDNA: !!activeDna,
        brandName: activeDna?.brand_name,
        messagePreview: initialMessage.substring(0, 200),
      });

      // Step 3: Create minimal product entry (< 1 second)
      if (applyBrandDNA && activeDna) {
        toast({
          title: "Creating project with Brand DNA...",
          description: `Applying ${activeDna.brand_name || "your brand"}'s identity to the design`,
        });
      } else {
        toast({
          title: "Creating project...",
          description: "Setting up your design workspace",
        });
      }

      const productEntry = await createMinimalProductEntry({
        user_prompt: initialMessage,
        category,
        intended_use: intendedUse,
        style_keywords: selectedKeywords,
        image: logoBase64 || undefined,
        selected_colors: selectedColors,
        product_goal: productGoal,
        designFile: designFileBase64 || undefined,
        userId: user.id,
        creator_id: creatorProfile?.id,
        is_public: publicProduct,
        applyBrandDna: applyBrandDNA,
        brandDna: applyBrandDNA ? activeDna : null,
        generationMode: generationMode,
      });

      if (!productEntry.success || !productEntry.projectId) {
        throw new Error(productEntry.error || "Failed to create project");
      }

      const projectId = productEntry.projectId;
      console.log("✅ Project created:", projectId);

      // Step 4: Create chat session with initial message
      const { createChatSession } = await import("@/app/actions/chat-session");

      const chatSession = await createChatSession({
        productId: projectId,
        userId: user.id,
        initialMessage,
        productData: productEntry.data,
      });

      if (chatSession.success) {
        console.log("✅ Chat session created:", chatSession.sessionId);
      } else {
        console.error("⚠️ Failed to create chat session:", chatSession.error);
        // Non-critical - continue anyway
      }

      // Step 5: Credits will be reserved when generation starts in AI Designer
      // This prevents double charging and allows refunds if generation fails

      // Step 6: Create notification
      await setCreateNotification({
        senderID: user.id,
        receiverID: user.id,
        title: "Product Design Started",
        message: `Your product "${(activeTab === "text" ? productIdea : productdetail).substring(
          0,
          50
        )}..." is being generated`,
        type: "product_created",
      });

      // Step 7: Redirect immediately to designer with auto-generation flags
      // Add query params to trigger auto-generation
      const params = new URLSearchParams({
        projectId,
        autoGenerate: "true",
        generateMoreViews: finalGenerateMoreImages ? "true" : "false",
      });

      if (guideCheck) {
        params.set("guide", "true");
      }
      // Small delay to show success toast
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

  /**
   * OLD FLOW: Keep for backward compatibility during migration
   * TODO: Remove after new flow is fully tested
   */
  const handleSubmit = async (e: React.FormEvent | null, overrideGenerateMoreImages?: boolean) => {
    // User needs at least 1 credit to generate the front view
    if ((credits?.credits ?? 0) < 1) {
      return toast({
        variant: "destructive",
        title: "No Credits left!",
        description: "You don't have any credits left. Please purchase Credits to Generate Techpack",
      });
    }
    if (e) e.preventDefault();
    const finalGenerateMoreImages = overrideGenerateMoreImages ?? generateMoreImages;
    console.log(finalGenerateMoreImages, "generateMoreImages final");
    if (!user?.id) return;
    startProgress(); // Use the hook's function
    let data;

    if (designFile) {
      const uploadedUrl = await uploadFileToSupabase(designFile);
      const base64Image = await convertFileToBase64(designFile);
      if (!uploadedUrl && !base64Image) {
        toast({
          variant: "destructive",
          description: "Failed to upload image. Please try again.",
        });
        stopProgress();
        return;
      }
      console.log(base64Image, "base");

      data = {
        user_prompt: base64Image,
        style_keywords: selectedKeywords,
        intended_use: productdetail,
        image: filePreview, // Include logo if uploaded
        generateMoreImages: finalGenerateMoreImages,
        // selected_colors: selectedColors,
        // product_goal: productGoal,
      };
    } else {
      data = {
        user_prompt: productIdea,
        category,
        intended_use: intendedUse,
        style_keywords: selectedKeywords,
        image: filePreview,
        selected_colors: selectedColors,
        product_goal: productGoal,
        generateMoreImages: finalGenerateMoreImages,
      };
    }
    console.log(data, "ddatatttttttttttttt");

    try {
      const response = await generateIdea(data);

      if (response.success) {
        // Update generated images if they exist in the response
        if (response.image) {
          const updatedImages: any = {};
          if (response.image.front?.url) {
            updatedImages.front = response.image.front.url;
          }
          if (response.image.back?.url) {
            updatedImages.back = response.image.back.url;
          }
          if (response.image.side?.url) {
            updatedImages.side = response.image.side.url;
          }

          // Update the state with actual generated images
          if (Object.keys(updatedImages).length > 0) {
            updateGeneratedImages(updatedImages);
          }
        }
        await setCreateNotification({
          senderID: user?.id,
          receiverID: user?.id,
          title: "Your product is ready 🎉",
          message: `Great work, ${user?.full_name}! Your product concept has been generated. Head to your product page to review and refine it. Once you're satisfied, you can move on to creating the technical files.`,
          type: "rfq_response",
        });
        // Credits already checked before generation starts (line 539)
        // No need to deduct again here in OLD flow
        // Wait a bit to show the completed images before navigating
        await new Promise((resolve) => setTimeout(resolve, 1500));

        await refreshProductIdeas();
        router.push(`/ai-designer?projectId=${response.project_id}&version=modular`);
      } else {
        toast({
          variant: "destructive",
          description: "Error generating data. Please try again.",
        });
      }
    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err);
      toast({
        variant: "destructive",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      stopProgress();
    }
  };

  const SuggestedPromptCard = ({
    item,
    index,
  }: {
    item: { icon: React.ComponentType<any>; text: string };
    index: number;
  }) => {
    const handlePromptClick = () => {
      applySuggestedPrompt(item.text);
    };

    const IconComponent = item.icon;

    return (
      <Card
        key={index}
        className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedPrompt === item.text ? "bg-gray-100" : ""
          }`}
        onClick={handlePromptClick}
      >
        <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-zinc-900/5 flex items-center justify-center">
            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-900" />
          </div>
          <div className="text-xs sm:text-sm leading-tight">{item.text}</div>
        </CardContent>
      </Card>
    );
  };

  console.log(pdfExtractedData, "pdfExtractedData")
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto pt-0 pb-4 sm:pb-6 md:pb-8 px-3 sm:px-4">

        <div className="max-w-4xl mx-auto">
          <form>
            <Card className="mb-4 sm:mb-6">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <div className="flex w-full items-center justify-between flex-wrap gap-3">

                  {/* TITLE */}
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl whitespace-nowrap">
                    <span className="hidden sm:inline">Let's Create Your Product</span>
                    <span className="sm:hidden">Create Your Product</span>
                  </CardTitle>

                  {/* SWITCH + BADGES */}
                  {credits?.hasEverHadSubscription && (
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

                      <div className="flex items-center gap-2 relative">
                        <Badge variant="secondary" className="text-xs hidden md:inline">
                          Recommended
                        </Badge>

                        {applyBrandDNA && activeDna && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowDnaSelector(!showDnaSelector)}
                              disabled={isTogglingDna}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                              {isTogglingDna ? (
                                <span className="animate-pulse">Switching...</span>
                              ) : (
                                <>
                                  <span className="max-w-[100px] truncate">{activeDna.brand_name || "Active DNA"}</span>
                                  {Array.isArray(getCreatorDna) && getCreatorDna.length > 1 && (
                                    showDnaSelector ? (
                                      <ChevronUp className="h-3 w-3" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3" />
                                    )
                                  )}
                                </>
                              )}
                            </button>

                            {/* DNA Selector Dropdown */}
                            {showDnaSelector && Array.isArray(getCreatorDna) && getCreatorDna.length > 1 && (
                              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                <div className="py-1">
                                  <p className="px-3 py-1.5 text-xs text-zinc-500 border-b border-zinc-100">
                                    Select Brand DNA
                                  </p>
                                  {getCreatorDna.map((dna: any) => (
                                    <button
                                      key={dna.id}
                                      type="button"
                                      onClick={() => activateDna(dna.id)}
                                      disabled={isTogglingDna}
                                      className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-zinc-50 transition-colors disabled:opacity-50 ${dna.status ? "bg-zinc-50" : ""
                                        }`}
                                    >
                                      <span className="truncate">{dna.brand_name || "Unnamed DNA"}</span>
                                      {dna.status && (
                                        <Badge variant="default" className="text-[10px] py-0 px-1.5">
                                          Active
                                        </Badge>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
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

                <p className="text-xs sm:text-sm text-[#1C1917]">
                  Describe your product in words or upload your sketch, refine every view of your product in our AI editor, and generate factory-ready outputs in minutes.
                </p>
              </CardHeader>

              {/* Brand DNA Collapsible Section */}
              <BrandDnaCollapsible
                onPromptSelect={(prompt) => {
                  setProductIdea(prompt);
                  setActiveTab("text");
                }}
              />

              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 pt-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto p-1">
                    <TabsTrigger value="text" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                      <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Text Description</span>
                      <span className="sm:hidden">Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                      <FileImage className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Upload Design</span>
                      <span className="sm:hidden">Upload</span>
                    </TabsTrigger>
                    <TabsTrigger value="sketch" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Draw a Sketch</span>
                      <span className="sm:hidden">Sketch</span>
                    </TabsTrigger>
                    {/* <TabsTrigger value="pdf" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Scan PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </TabsTrigger> */}
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-12 relative max-w-4xl sm:px-0"
                      >
                        {/* Background glow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D3C7B9]/20 via-stone-100/30 to-[#A89584]/20 blur-xl" />

                        {/* Card container */}
                        <div className="relative rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-4 sm:p-6 backdrop-blur-sm">
                          {/* Header bar */}
                          <div className="mb-4 flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                              <div className="flex gap-1.5">
                                <div className="h-3 w-3 rounded-full bg-stone-400/60" />
                                <div className="h-3 w-3 rounded-full bg-[#D3C7B9]/80" />
                                <div className="h-3 w-3 rounded-full bg-[#A89584]/80" />
                              </div>
                              {/* <div className="flex gap-2">
                                <span className="text-sm font-medium text-zinc-700">Describe Your Product</span>
                              </div> */}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 justify-end w-full">
                                <Switch
                                  id="privacy"
                                  checked={publicProduct}
                                  onCheckedChange={setPublicProduct}
                                  className="h-4 w-10 shadow"
                                />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Label
                                        htmlFor="privacy"
                                        className="text-sm hidden md:inline-flex items-center cursor-pointer gap-1"
                                      >
                                        {publicProduct ? (
                                          <Eye className="h-4 w-4 text-zinc-900" />
                                        ) : (
                                          <Lock className="h-4 w-4 text-zinc-900" />
                                        )}
                                        {publicProduct ? "Public" : "Private"}
                                      </Label>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="center">
                                      <p className="max-w-xs text-xs">
                                        {publicProduct
                                          ? "Your product will be featured in our showcase and you can track views and upvotes"
                                          : "Your product will be Private. Only you can see your product"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Label htmlFor="privacy" className="text-sm md:hidden cursor-help">
                                        {publicProduct ? "Public" : "Private"}
                                      </Label>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="center">
                                      <p className="max-w-xs text-xs">
                                        {publicProduct
                                          ? "Your product will be featured in our showcase and you can track views and upvotes"
                                          : "Your product will be Private. Only you can see your product"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>{" "}
                            {/* Spacer for balance */}
                          </div>

                          {/* Textarea with upload functionality */}
                          <div className="relative">
                            {/* Image Preview on Top */}
                            {previewUrl && (
                              <div className="mb-3 flex justify-start">
                                <img
                                  src={previewUrl}
                                  alt="Uploaded preview"
                                  className="max-h-[80px] p-4 sm:max-h-[100px] rounded-lg object-contain shadow-sm border border-stone-200"
                                />
                              </div>
                            )}

                            {/* Input area */}
                            <div className="flex items-start border border-stone-300 rounded-lg bg-white shadow-sm p-3 gap-3">
                              <div className="flex flex-col w-full">
                                {/* Textarea at top */}
                                <textarea
                                  id="prompt"
                                  placeholder="e.g. A recycled tote bag"
                                  value={productIdea}
                                  onChange={(e) => {
                                    setProductIdea(e.target.value);
                                    if (isImproved) {
                                      setIsImproved(false);
                                      setOriginalPrompt("");
                                    }
                                    const onboarding = searchParams.get("onboarding");
                                    if (
                                      onboarding === "true" &&
                                      e.target.value.length === 1 &&
                                      !isDemoModalOpen &&
                                      !hasShownOnboardingModal
                                    ) {
                                      setIsDemoModalOpen(true);
                                      setHasShownOnboardingModal(true);
                                    }
                                  }}
                                  className="w-full min-h-[60px] text-sm placeholder:text-gray-500 resize-none bg-transparent border-none outline-none focus:outline-none p-0 mb-2"
                                  required={activeTab === "text"}
                                />

                                {/* Buttons row - positioned at adjacent ends */}
                                <div className="flex flex-row justify-between items-center w-full">
                                  {/* Left side - Both + buttons grouped together */}
                                  <div className="flex items-center gap-2">
                                    {/* Upload Icon */}
                                    <Label
                                      // htmlFor="file-upload"
                                      className="cursor-pointer flex items-center justify-center h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
                                      onClick={handlePlusClick}
                                    >
                                      <Plus className="h-6 w-6 text-zinc-800" />
                                    </Label>

                                    <Input
                                      ref={fileInputRef}
                                      id="file-upload"
                                      type="file"
                                      className="hidden"
                                      accept="image/png, image/jpeg, image/jpg"
                                      onChange={handleFileChange}
                                    />

                                    {/* Choose from Media Library */}
                                    <MediaUploadModal
                                      selectionMode={true}
                                      onImageSelect={handleLogoSelectFromMedia}
                                      trigger={
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 px-2 text-xs text-zinc-700 hover:bg-stone-100"
                                        >
                                          <FileImage className="h-4 w-4 mr-1" />
                                          <span className="hidden sm:inline">Media</span>
                                        </Button>
                                      }
                                    />

                                    {/* Generation Tools Menu */}
                                    <GenerationToolsMenu
                                      selectedMode={generationMode}
                                      onModeChange={setGenerationMode}
                                    />
                                  </div>
                                  <div className="flex-shrink-0">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="flex text-zinc-900 hover:bg-primary/5 h-8 px-2 sm:px-3 py-1 text-xs bg-transparent whitespace-nowrap"
                                      onClick={handleImprovePrompt}
                                      disabled={isImproving}
                                    >
                                      {isImproving ? (
                                        <>
                                          <div className="w-3 h-3 border-primary rounded-full animate-spin mr-1" />
                                          <span className="hidden sm:inline">Improving...</span>
                                          <span className="sm:hidden">...</span>
                                        </>
                                      ) : isImproved ? (
                                        <>
                                          <ArrowLeft className="h-3 w-3 mr-1" />
                                          Revert
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="h-3 w-3 mr-1 flex-shrink-0" />
                                          <span className="hidden sm:inline">Improve with AI</span>
                                          <span className="sm:hidden">AI</span>
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  {uploadError && (
                                    <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" /> {uploadError}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <div className="w-full">
                        {/* Mobile view: collapsible accordion */}
                        <div className="sm:hidden">
                          <Accordion type="single" collapsible className="space-y-2">
                            <AccordionItem value="prompt-guide" className="border border-taupe/30 rounded-lg px-4">
                              <AccordionTrigger className="text-left font-medium text-sm text-zinc-900">
                                <div className="flex items-center gap-2">
                                  <Info className="h-4 w-4 text-zinc-900" />
                                  Prompt Guide
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-zinc-900/80 text-xs leading-relaxed">
                                Describe what you want to create as clearly as possible — what the product is, who it’s
                                for, and the style or function you have in mind. Include important details like target
                                audience, shape, size cues, materials, colors, or special features (e.g., eco-friendly,
                                waterproof zipper, ergonomic handle, adjustable strap). The more specific you are, the
                                closer Genpire gets to your vision.
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>

                        {/* Desktop view: always visible */}
                        <Alert className="hidden sm:flex bg-cream border-taupe mt-2">
                          <Info className="h-4 w-4 text-zinc-900" />
                          <AlertDescription className="text-zinc-900 text-xs sm:text-sm">
                            <strong>Prompt Guide:</strong> Describe what you want to create as clearly as possible —
                            what the product is, who it’s for, and the style or function you have in mind. Include
                            important details like target-audience, shape, size cues, materials, colors, or special
                            features (e.g., eco-friendly, waterproof zipper, ergonomic handle, adjustable strap). The
                            more specific you are, the closer Genpire gets to your vision.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>

                  </TabsContent>

                  <TabsContent value="image" className="space-y-4 sm:space-y-6">
                    <Alert className="bg-green-50 border-green-200">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700 text-xs sm:text-sm">
                        Upload your existing design file and our AI will analyze it to extract dimensions, materials,
                        colors, and other specifications to create your tech pack.
                      </AlertDescription>
                    </Alert>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="mt-12 relative mx-auto max-w-4xl px-4 sm:px-0"
                    >
                      {/* Background glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D3C7B9]/20 via-stone-100/30 to-[#A89584]/20 blur-xl" />

                      {/* Card container */}
                      <div className="relative rounded-2xl border border-stone-200/50 bg-gradient-to-br from-white/80 via-stone-50/60 to-[#D3C7B9]/10 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
                        {/* Header */}
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-[#D3C7B9]/80" />
                            <div className="h-3 w-3 rounded-full bg-[#A89584]/80" />
                            <div className="h-3 w-3 rounded-full bg-stone-400/60" />
                          </div>
                          <span className="text-sm font-medium text-zinc-700">Upload Your Design</span>
                        </div>

                        {/* Upload Area */}
                        <div
                          className={`relative rounded-xl border-2 border-dashed p-6 sm:p-8 transition-all duration-300 ease-in-out cursor-pointer
        ${uploadError ? "border-red-300 bg-red-50/60" : "border-stone-300/50 bg-white/40 hover:bg-stone-100/40"}`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {designFilePreview ? (
                            <div className="relative group">
                              <img
                                src={designFilePreview || "/placeholder.svg"}
                                alt="Design preview"
                                className="max-h-[220px] mx-auto rounded-lg object-contain shadow-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-3 right-3 h-7 w-7 sm:h-8 sm:w-8 opacity-90 group-hover:opacity-100 transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDesignFile();
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <p className="mt-3 text-sm font-medium text-zinc-600 text-center truncate">
                                {designFile?.name}
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-500">
                              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-stone-100 mb-4">
                                <Upload className="h-7 w-7 text-zinc-600" />
                              </div>
                              <p className="text-sm sm:text-base font-medium text-zinc-700">
                                Drag & drop your file or click to browse
                              </p>
                              <p className="text-xs sm:text-sm text-zinc-500 mt-1">Supports PNG, JPG, JPEG (max 5MB)</p>

                              <div className="mt-4 flex items-center gap-2">
                                <span className="text-xs text-zinc-400">or</span>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <MediaUploadModal
                                    selectionMode={true}
                                    onImageSelect={handleDesignSelectFromMedia}
                                    trigger={
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 text-xs"
                                        onClick={(e) => e.stopPropagation()} // This was already here, but only handles the open button
                                      >
                                        <FileImage className="h-4 w-4 mr-1" />
                                        Choose from Media
                                      </Button>
                                    }
                                  />
                                </div>

                              </div>
                            </div>
                          )}

                          <input
                            ref={fileInputRef}
                            id="design-file"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                            onChange={handleDesignFileUpload}
                          />
                        </div>

                        {/* Error */}
                        {uploadError && (
                          <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {uploadError}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="mt-12 relative mx-auto max-w-4xl px-4 sm:px-0"
                    >
                      {/* Background glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D3C7B9]/20 via-stone-100/30 to-[#A89584]/20 blur-xl" />

                      {/* Card container */}
                      <div className="relative rounded-2xl border border-stone-200/50 bg-gradient-to-br from-white/80 via-stone-50/60 to-[#D3C7B9]/10 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
                        {/* Header */}
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-[#D3C7B9]/80" />
                            <div className="h-3 w-3 rounded-full bg-[#A89584]/80" />
                            <div className="h-3 w-3 rounded-full bg-stone-400/60" />
                          </div>
                          <span className="text-sm font-medium text-zinc-700">Enhance Your Design</span>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <Label
                              htmlFor="design-description"
                              className="flex items-center gap-2 text-sm text-zinc-700"
                            >
                              <FileImage className="h-4 w-4 text-zinc-900" />
                              Add or Improve Design Description
                            </Label>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border border-primary text-zinc-900 hover:bg-primary/5 h-7 sm:h-8 px-2 py-1 text-xs w-full sm:w-auto bg-transparent"
                              onClick={handleImproveDesignDescription}
                              disabled={isImproving || !designFile}
                              title={
                                !productdetail.trim()
                                  ? "Generate description from image"
                                  : "Improve description based on image"
                              }
                            >
                              {isImproving ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-t-transparent border-primary rounded-full animate-spin mr-1" />
                                  <span className="hidden sm:inline">Improving...</span>
                                  <span className="sm:hidden">...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Improve with AI</span>
                                  <span className="sm:hidden">AI Improve</span>
                                </>
                              )}
                            </Button>
                          </div>

                          <Textarea
                            id="design-description"
                            placeholder={
                              designFile
                                ? "Optional: Describe modifications you want (e.g., 'change color to white', 'add pockets'). Leave empty and click 'Improve with AI' to auto-generate description."
                                : "Upload a design file first, then describe modifications or click 'Improve with AI' to analyze the image."
                            }
                            className="min-h-[100px] sm:min-h-[120px] text-sm border border-stone-200/50 bg-white/50 focus:border-[#A89584] focus:ring-2 focus:ring-[#A89584]/20 rounded-lg"
                            value={productdetail}
                            onChange={(e) => setProductDetail(e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Add brand logo section for Upload Design tab */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="mt-12 relative mx-auto max-w-4xl px-4 sm:px-0"
                    >
                      {/* Glow background */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D3C7B9]/20 via-stone-100/30 to-[#A89584]/20 blur-xl" />

                      {/* Card */}
                      <div className="relative rounded-2xl border border-stone-200/50 bg-gradient-to-br from-white/80 via-stone-50/60 to-[#D3C7B9]/10 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
                        {/* Header */}
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-[#D3C7B9]/80" />
                            <div className="h-3 w-3 rounded-full bg-[#A89584]/80" />
                            <div className="h-3 w-3 rounded-full bg-stone-400/60" />
                          </div>
                          <span className="text-sm font-medium text-zinc-700">Add Your Brand Logo (Optional)</span>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          <p className="text-xs text-stone-500">
                            Upload your logo to see it integrated into your product design.
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            {/* Upload Button */}
                            <Label
                              htmlFor="design-logo-upload"
                              className="cursor-pointer flex items-center gap-2 border border-stone-200 rounded-md px-3 sm:px-4 py-2 hover:bg-stone-50 text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start transition-colors"
                            >
                              <Upload className="h-4 w-4" />
                              Upload Logo
                            </Label>

                            <Input
                              id="design-logo-upload"
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={handleFileChange}
                            />

                            {/* Preview */}
                            {previewUrl && (
                              <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden border shadow-sm mx-auto sm:mx-0">
                                <img
                                  src={previewUrl || "/placeholder.svg"}
                                  alt="Logo preview"
                                  className="object-cover h-full w-full"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive hover:bg-destructive/90"
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                    setFilePreview(null);
                                  }}
                                >
                                  <X className="h-3 w-3 text-white" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="sketch" className="space-y-4 sm:space-y-6">
                    <Alert className="bg-stone-200 border-stone-300">
                      <Pen className="h-4 w-4 text-black" />
                      <AlertDescription className="text-black text-xs sm:text-sm">
                        Sketch your idea directly! Our AI will analyze your drawing to create your product.
                      </AlertDescription>
                    </Alert>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="mt-12 relative mx-auto max-w-4xl px-4 sm:px-0"
                    >
                      {/* Background glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D3C7B9]/20 via-stone-100/30 to-[#A89584]/20 blur-xl" />

                      {/* Card container */}
                      <div className="relative rounded-2xl border border-stone-200/50 bg-gradient-to-br from-white/80 via-stone-50/60 to-[#D3C7B9]/10 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
                        {/* Header */}
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-[#D3C7B9]/80" />
                            <div className="h-3 w-3 rounded-full bg-[#A89584]/80" />
                            <div className="h-3 w-3 rounded-full bg-stone-400/60" />
                          </div>
                          <span className="text-sm font-medium text-zinc-700">Draw a Sketch</span>
                        </div>

                        {/* Sketch Area / Button */}
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50/50 hover:bg-stone-50 transition-colors">
                          {designFilePreview ? (
                            <div className="relative group w-full max-w-md">
                              <div className="relative rounded-lg overflow-hidden shadow-lg border border-stone-200 bg-white">
                                <img
                                  src={designFilePreview}
                                  alt="Sketch preview"
                                  className="w-full h-auto object-contain max-h-[300px]"
                                />
                              </div>
                              <div className="flex gap-2 justify-center mt-4">
                                <Dialog open={isEditWhiteboardOpen} onOpenChange={setIsEditWhiteboardOpen}>
                                  <VisuallyHidden>
                                    <DialogTitle>
                                      Edit Sketch
                                    </DialogTitle>
                                  </VisuallyHidden>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                      <Pen className="h-4 w-4" />
                                      Edit Sketch
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent
                                    className="w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] 
             p-0 bg-white dark:bg-stone-900 border border-gray-200 
             dark:border-stone-700 rounded-xl shadow-xl overflow-hidden">
                                    <Whiteboard
                                      initialImage={designFilePreview}
                                      onSave={(dataUrl) => {
                                        fetch(dataUrl)
                                          .then(res => res.blob())
                                          .then(blob => {
                                            const file = new File([blob], "sketch.png", { type: "image/png" });
                                            setDesignFile(file);
                                            setDesignFilePreview(dataUrl);
                                            setIsEditWhiteboardOpen(false); // Close dialog
                                          });
                                      }}
                                      onClose={() => {
                                        setIsEditWhiteboardOpen(false);
                                      }}
                                    />
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveDesignFile();
                                  }}
                                  className="gap-2"
                                >
                                  <X className="h-4 w-4" />
                                  Discard
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center space-y-4">
                              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <Pen className="h-8 w-8 text-black" />
                              </div>
                              <div>
                                <h3 className="text-lg black-medium text-black">Start Sketching</h3>
                                <p className="text-black text-sm mt-1 max-w-xs mx-auto">
                                  Draw your product idea using our built-in whiteboard tool.
                                </p>
                              </div>

                              <Dialog open={isNewWhiteboardOpen} onOpenChange={setIsNewWhiteboardOpen}>
                                <VisuallyHidden>
                                  <DialogTitle>
                                    Edit Sketch
                                  </DialogTitle>
                                </VisuallyHidden>
                                <DialogTrigger asChild>
                                  <Button variant={"default"} size="lg" className="rounded-full px-8 ">
                                    <Pen className="h-4 w-4 mr-2" />
                                    Open Whiteboard
                                  </Button>
                                </DialogTrigger>
                                <DialogContent
                                  className="w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] 
             p-0 bg-white dark:bg-stone-900 border border-gray-200 
             dark:border-stone-700 rounded-xl shadow-xl overflow-hidden"
                                >
                                  <Whiteboard
                                    onSave={(dataUrl) => {
                                      fetch(dataUrl)
                                        .then(res => res.blob())
                                        .then(blob => {
                                          const file = new File([blob], "sketch.png", { type: "image/png" });
                                          setDesignFile(file);
                                          setDesignFilePreview(dataUrl);
                                          setIsNewWhiteboardOpen(false);
                                        });
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="mt-12 relative mx-auto max-w-4xl px-4 sm:px-0"
                    >
                      {/* Background glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D3C7B9]/20 via-stone-100/30 to-[#A89584]/20 blur-xl" />

                      {/* Card container */}
                      <div className="relative rounded-2xl border border-stone-200/50 bg-gradient-to-br from-white/80 via-stone-50/60 to-[#D3C7B9]/10 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
                        {/* Header */}
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-[#D3C7B9]/80" />
                            <div className="h-3 w-3 rounded-full bg-[#A89584]/80" />
                            <div className="h-3 w-3 rounded-full bg-stone-400/60" />
                          </div>
                          <span className="text-sm font-medium text-zinc-700">Enhance Your Design</span>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <Label
                              htmlFor="design-description"
                              className="flex items-center gap-2 text-sm text-zinc-700"
                            >
                              <FileImage className="h-4 w-4 text-zinc-900" />
                              Add or Improve Design Description
                            </Label>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border border-primary text-zinc-900 hover:bg-primary/5 h-7 sm:h-8 px-2 py-1 text-xs w-full sm:w-auto bg-transparent"
                              onClick={handleImproveDesignDescription}
                              disabled={isImproving || !designFile}
                              title={
                                !productdetail.trim()
                                  ? "Generate description from image"
                                  : "Improve description based on image"
                              }
                            >
                              {isImproving ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-t-transparent border-primary rounded-full animate-spin mr-1" />
                                  <span className="hidden sm:inline">Improving...</span>
                                  <span className="sm:hidden">...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Improve with AI</span>
                                  <span className="sm:hidden">AI Improve</span>
                                </>
                              )}
                            </Button>
                          </div>

                          <Textarea
                            id="design-description"
                            placeholder={
                              designFile
                                ? "Optional: Describe modifications you want (e.g., 'change color to white', 'add pockets'). Leave empty and click 'Improve with AI' to auto-generate description."
                                : "Upload a design file first, then describe modifications or click 'Improve with AI' to analyze the image."
                            }
                            className="min-h-[100px] sm:min-h-[120px] text-sm border border-stone-200/50 bg-white/50 focus:border-[#A89584] focus:ring-2 focus:ring-[#A89584]/20 rounded-lg"
                            value={productdetail}
                            onChange={(e) => setProductDetail(e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Add brand logo section for Upload Design tab */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="mt-12 relative mx-auto max-w-4xl px-4 sm:px-0"
                    >
                      {/* Glow background */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D3C7B9]/20 via-stone-100/30 to-[#A89584]/20 blur-xl" />

                      {/* Card */}
                      <div className="relative rounded-2xl border border-stone-200/50 bg-gradient-to-br from-white/80 via-stone-50/60 to-[#D3C7B9]/10 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
                        {/* Header */}
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-[#D3C7B9]/80" />
                            <div className="h-3 w-3 rounded-full bg-[#A89584]/80" />
                            <div className="h-3 w-3 rounded-full bg-stone-400/60" />
                          </div>
                          <span className="text-sm font-medium text-zinc-700">Add Your Brand Logo (Optional)</span>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          <p className="text-xs text-stone-500">
                            Upload your logo to see it integrated into your product design.
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            {/* Upload Button */}
                            <Label
                              htmlFor="design-logo-upload"
                              className="cursor-pointer flex items-center gap-2 border border-stone-200 rounded-md px-3 sm:px-4 py-2 hover:bg-stone-50 text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start transition-colors"
                            >
                              <Upload className="h-4 w-4" />
                              Upload Logo
                            </Label>

                            <Input
                              id="design-logo-upload"
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={handleFileChange}
                            />

                            {/* Preview */}
                            {previewUrl && (
                              <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden border shadow-sm mx-auto sm:mx-0">
                                <img
                                  src={previewUrl || "/placeholder.svg"}
                                  alt="Logo preview"
                                  className="object-cover h-full w-full"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive hover:bg-destructive/90"
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                    setFilePreview(null);
                                  }}
                                >
                                  <X className="h-3 w-3 text-white" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                  {/* PDF Scan Tab */}
                  {/* <TabsContent value="pdf" className="space-y-4 sm:space-y-6">
                    <Alert className="bg-stone-50 border-stone-200">
                      <FileText className="h-4 w-4 text-zinc-900" />
                      <AlertDescription className="text-zinc-900 text-xs sm:text-sm">
                        Upload a product spec sheet PDF and our AI will extract materials, colors, sizing, dimensions,
                        and design images to create your product.
                      </AlertDescription>
                    </Alert>

                    {pdfExtractedData && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <Alert className="bg-green-50 border-green-200 shadow-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                            <span className="text-xs sm:text-sm">
                              <strong>Success!</strong> Data extracted from PDF ({pdfExtractedData.pageCount || 1} pages analyzed).
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 bg-white text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-300 w-full sm:w-auto"
                              onClick={() => setIsPdfScanModalOpen(true)}
                            >
                              <Eye className="h-3 w-3 mr-1.5" />
                              View Extracted Data
                            </Button>
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="mt-12 relative mx-auto max-w-4xl px-4 sm:px-0"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-100/30 via-stone-100/30 to-[#A89584]/20 blur-xl" />

                      <div className="relative rounded-2xl border border-stone-200/50 bg-gradient-to-br from-white/80 via-stone-50/60 to-stone-50/20 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
                        <div className="mb-6 flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-[#D3C7B9]/80" />
                            <div className="h-3 w-3 rounded-full bg-[#A89584]/80" />
                            <div className="h-3 w-3 rounded-full bg-stone-400/60" />
                          </div>
                          <span className="text-sm font-medium text-zinc-700">Scan Product Specification PDF</span>
                        </div>

                        <div
                          className="relative rounded-xl border-2 border-dashed border-purple-200/50 hover:border-stone-400/50 bg-white/50 p-8 sm:p-12 transition-all duration-300 ease-in-out cursor-pointer text-center"
                          onClick={() => pdfInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center justify-center text-zinc-500">
                            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-stone-100 mb-6">
                              <FileText className="h-10 w-10 text-black" />
                            </div>
                            <p className="text-base sm:text-lg font-medium text-black">
                              Drop your PDF spec sheet here
                            </p>
                            <p className="text-sm text-zinc-500 mt-2">or click to browse files</p>
                            <p className="text-xs text-zinc-400 mt-1">Supports PDF files up to 20MB</p>

                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              className="mt-6 border-black-300 text-black hover:bg-black-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                pdfInputRef.current?.click();
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Select PDF File
                            </Button>
                          </div>

                          <input
                            ref={pdfInputRef}
                            id="pdf-upload"
                            type="file"
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={handlePdfFileSelect}
                          />
                        </div>

                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-white/60 rounded-lg">
                            <div className="text-xl mb-1">📦</div>
                            <div className="text-xs text-zinc-600">Materials</div>
                          </div>
                          <div className="text-center p-3 bg-white/60 rounded-lg">
                            <div className="text-xl mb-1">🎨</div>
                            <div className="text-xs text-zinc-600">Colors</div>
                          </div>
                          <div className="text-center p-3 bg-white/60 rounded-lg">
                            <div className="text-xl mb-1">📏</div>
                            <div className="text-xs text-zinc-600">Sizing</div>
                          </div>
                          <div className="text-center p-3 bg-white/60 rounded-lg">
                            <div className="text-xl mb-1">🖼️</div>
                            <div className="text-xs text-zinc-600">Images</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent> */}
                </Tabs>
              </CardContent>
            </Card>
            <div className="flex justify-end mb-4 sm:mb-6">
              <Button
                type="button"
                size="lg"
                disabled={
                  (activeTab === "text" && !productIdea.trim()) || (activeTab === "image" && !designFile && !designFilePreview) || isLoading
                }
                onClick={() => {
                  if (activeTab === "image" && (designFile || designFilePreview)) {
                    handleSubmitNew(null, false); // NEW FLOW: Create minimal entry and redirect
                  } else {
                    // setShowHelpModal(true);
                    // setPendingSubmit(true);
                    handleSubmitNew(null, false); // NEW FLOW: Create minimal entry and redirect
                  }
                }}
                className="gap-2 flex items-center w-full sm:w-auto"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mr-2"></div>
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Create Product</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </form>
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-zinc-900" />
                </div>
                <span className="hidden sm:inline">
                  Need inspiration? Explore a demo product in one of the following categories and see how Genpire built
                  it
                </span>
                <span className="sm:hidden">Need inspiration?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <ProductCard />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generation Progress Modal */}
      <GenerationProgressModal
        isLoading={isLoading}
        currentStep={currentStep}
        stepProgress={stepProgress}
        elapsedTime={elapsedTime}
        // currentFunFact={currentFunFact}
        generatedImages={generatedImages}
      />

      <LogoInstructionModal open={showAttachmentModal} onClose={handleModalClose} />
      {/* Onboarding Product Guide Modal */}
      {
        isDemoModalOpen && (
          <ProductGuideModal
            onClose={() => setIsDemoModalOpen(false)}
            isDemoModalOpen={isDemoModalOpen}
            setIsDemoModalOpen={setIsDemoModalOpen}
          />
        )
      }
      {/* PDF Scan Modal */}
      <PDFScanModal
        isOpen={isPdfScanModalOpen}
        onClose={() => {
          setIsPdfScanModalOpen(false);
          // setPdfExtractedData(null);
        }}
        extractedData={pdfExtractedData}
        isLoading={isPdfScanning}
        onUseForProduct={handleUseExtractedData}
        onGenerateProduct={handleGenerateFromPdf}
      />
    </div >
  );
}
