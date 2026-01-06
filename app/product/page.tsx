"use client";

import JSZip from "jszip";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Download,
  RefreshCw,
  FileText,
  Layers,
  Ruler,
  Palette,
  Package,
  Scissors,
  Tag,
  ShieldCheck,
  ClipboardList,
  Info,
  ImageIcon,
  Bot,
  X,
  Loader2,
  Menu,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Focus,
  PenTool,
  Component,
  Maximize2,
  CheckCircle,
  BookOpen,
  FileImage,
  Truck,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Volkhov } from "next/font/google";
import { UnifiedPromptInterface } from "@/components/tech-pack/unified-prompt-interface";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { TechPackSection } from "@/components/tech-pack/tech-pack-section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getUserProjectIdea,
  updateTechpack,
  updateProjectImages,
} from "@/lib/supabase/productIdea";
import { generateIdea } from "../actions/idea-generation";
import {
  generateTechPackForProduct,
  getProductMetadata,
} from "../actions/create-product-entry";
import {
  getTechFilesForProduct,
  TechFileData,
} from "../actions/get-tech-files";
import {
  industryBenchmarks,
  sectionKeyMap,
  sections,
} from "@/lib/utils/sections";
import { generatePdffromTechpack } from "@/components/pdf-generator";
import { generateProductFilesfromTechpack } from "@/components/productFilesGenerator";
import { generateExcelFromData } from "@/components/excel-generator";
import { DeductCredits, RefundCredits } from "@/lib/supabase/payments";
import { useUserStore } from "@/lib/zustand/useStore";
import { useUpdateTechPackStore } from "@/lib/zustand/techpacks/updateTechPack";
import { useGetTechPackStore } from "@/lib/zustand/techpacks/getTechPack";
import {
  getGroupedMultiViewRevisions,
  saveInitialRevisions,
} from "@/app/actions/ai-image-edit-new-table";
import { Edit2 } from "lucide-react";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { LoadingOverlay } from "@/modules/ai-designer/components/MultiViewEditor/LoadingOverlay";
import { useImageViewerStore } from "@/modules/ai-designer/store/imageViewerStore";
import { ImageViewerModal } from "@/modules/ai-designer/components/ImageViewerModal";
import {
  AgenticChatPanel,
  ChatToggleButton,
  MobileChatModal,
} from "./components/agentic-chat";
import type { TechPackSection as TechPackSectionType } from "./components/agentic-chat/types";
import { ProductHeader } from "./components/ProductHeader";
import { ProductSidebar, navItems } from "./components/ProductSidebar";
import { ProductMetadataEditor } from "./components/ProductMetadataEditor";
import { ProductImageGallery } from "./components/ProductImageGallery";
import {
  VisualSection,
  FactorySpecsSection,
  SpecificationsSection,
  ConstructionSection,
  ProductionSection,
} from "./components/sections";
import {
  useProductPageStore,
  useProductPageActions,
} from "@/lib/zustand/product/productPageStore";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

// Helper function to capitalize first letter of each word
const capitalizeTitle = (str: string | undefined | null): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper to safely render any value as string - handles deeply nested objects
const renderValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map(renderValue).filter(Boolean).join("\n");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const parts: string[] = [];
    for (const [, val] of Object.entries(obj)) {
      if (val === null || val === undefined) continue;
      if (typeof val === "string" && val.trim()) {
        parts.push(val);
      } else if (Array.isArray(val)) {
        const arrContent = val.map(renderValue).filter(Boolean).join("\n");
        if (arrContent) parts.push(arrContent);
      } else if (typeof val === "object") {
        const nested = renderValue(val);
        if (nested) parts.push(nested);
      }
    }
    return parts.join("\n\n");
  }
  return "";
};

interface TechPackMakerPageProps {
  projectId?: string;
}

export default function TechPackMakerPage({
  projectId,
}: TechPackMakerPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ============================================
  // ZUSTAND STORE - Centralized State Management
  // ============================================
  const {
    // Core Data
    techPackData,
    techPack,
    productImages,
    techFilesData,
    multiViewRevisions,
    selectedRevisionId,
    productMetadata,
    // UI State
    activeTab,
    selectedSection,
    selectedTechFileGuide,
    recentlyUpdatedSections,
    // Panel Visibility
    isChatOpen,
    isMobileChatOpen,
    isSidebarCollapsed,
    isMobileMenuOpen,
    isAIPromptOpen,
    showImageEditor,
    // Loading States
    isLoading,
    isGeneratingImages,
    isGeneratingTechPack,
    techFilesLoading,
    pdfLoader,
    printFileLoader,
    productFilesLoader,
    excelLoader,
    // Generation Flags
    autoGenerateTriggered,
    techPackGenerated,
    initialGenerationPrompt,
  } = useProductPageStore();

  const {
    // Core Data Actions
    setProjectId: setStoreProjectId,
    setTechPackData,
    setTechPack,
    updateTechPack,
    setProductImages,
    setTechFilesData,
    setMultiViewRevisions,
    setSelectedRevisionId,
    setIsPublic,
    setProductMetadata,
    // UI State Actions
    setActiveTab,
    setSelectedSection,
    setSelectedTechFileGuide,
    addRecentlyUpdatedSection,
    removeRecentlyUpdatedSection,
    clearRecentlyUpdatedSections,
    // Panel Visibility Actions
    setIsChatOpen,
    setIsMobileChatOpen,
    setIsSidebarCollapsed,
    setIsMobileMenuOpen,
    setIsAIPromptOpen,
    setShowImageEditor,
    // Loading State Actions
    setIsLoading,
    setIsGeneratingImages,
    setIsGeneratingTechPack,
    setTechFilesLoading,
    setPdfLoader,
    setPrintFileLoader,
    setProductFilesLoader,
    setExcelLoader,
    setSvgLoader,
    // Generation Flag Actions
    setAutoGenerateTriggered,
    setTechPackGenerated,
    setInitialGenerationPrompt,
    // Utility Actions
    initializeFromProductData,
  } = useProductPageActions();

  // Use global image viewer store
  const { openViewer } = useImageViewerStore();

  // Flat list of nav items for mobile bottom bar (using navItems from ProductSidebar)
  const mobileMainItems = navItems.slice(0, 4); // First 4 items for bottom bar
  const mobileMoreItems = navItems.slice(4); // Rest in "More" menu (production)
  const { user } = useUserStore();
  const { refresCreatorCredits } = useGetCreditsStore();
  const {
    fetchGetTechPack,
    getTechPack,
    loadingGetTechPack,
    errorGetTechPack,
  } = useGetTechPackStore();

  // Initialize projectId in the store when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      setStoreProjectId(projectId);
    }
  }, [projectId, setStoreProjectId]);

  useEffect(() => {
    const dat = fetchGetTechPack({ id: projectId });
  }, [projectId]);

  useEffect(() => {
    async function fetchProductIdea() {
      if (!projectId) {
        console.error("No project ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const productData = await getUserProjectIdea(projectId);
        if (productData) {
          setTechPackData(productData);
          const { image_data, tech_pack, selected_revision_id, is_public, product_dimensions, product_materials, sku, reference_number, target_consumer_price_usd, status } = productData;

          // Set the public visibility status
          setIsPublic(is_public || false);

          // Set product metadata fields
          setProductMetadata({
            sku: sku || null,
            referenceNumber: reference_number || null,
            targetConsumerPriceUsd: target_consumer_price_usd || null,
            status: status || "draft",
          });

          // Store the selected revision ID
          if (selected_revision_id) {
            setSelectedRevisionId(selected_revision_id);
          }

          // Fetch tech files directly from the tech_files table
          setTechFilesLoading(true);
          try {
            const techFilesResult = await getTechFilesForProduct(projectId);
            if (techFilesResult.success && techFilesResult.data) {
              setTechFilesData({
                sketches: techFilesResult.data.sketches,
                closeups: techFilesResult.data.closeups,
                components: techFilesResult.data.components,
                baseViews: techFilesResult.data.baseViews,
                flatSketches: techFilesResult.data.flatSketches,
                assemblyView: techFilesResult.data.assemblyView,
              });
              if (techFilesResult.data.selectedRevisionId) {
                setSelectedRevisionId(techFilesResult.data.selectedRevisionId);
              }
            }
          } catch (techFilesError) {
            console.error("Error fetching tech files:", techFilesError);
          } finally {
            setTechFilesLoading(false);
          }

          if (image_data) {
            setProductImages({
              front:
                image_data.front?.url ||
                "/placeholder.svg?height=400&width=300&text=Front+View",
              back: image_data.back?.url || null,
              side: image_data.side?.url || null,
              bottom: image_data.bottom?.url || null,
              top: image_data.top?.url || null,
            });
          }

          if (
            tech_pack &&
            Object.keys(tech_pack).length > 0 &&
            tech_pack.productName
          ) {
            // Helper to safely parse arrays
            const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);
            const safeObject = (obj: any) =>
              obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};

            // Get dimensions from product_dimensions if available (user-approved dimensions)
            // Otherwise fall back to tech_pack dimensions
            const getUserDimensions = () => {
              if (product_dimensions) {
                // Use user dimensions if set, otherwise use recommended
                const dims = product_dimensions.user || product_dimensions.recommended;
                if (dims) {
                  return {
                    length: dims.length ? { value: dims.length.value, unit: dims.length.unit, tolerance: "±0.5 cm" } : safeObject(tech_pack.dimensions?.length),
                    height: dims.height ? { value: dims.height.value, unit: dims.height.unit, tolerance: "±0.5 cm" } : safeObject(tech_pack.dimensions?.height),
                    width: dims.width ? { value: dims.width.value, unit: dims.width.unit, tolerance: "±0.5 cm" } : safeObject(tech_pack.dimensions?.width),
                    weight: dims.weight ? { value: dims.weight.value, unit: dims.weight.unit, tolerance: "±0.1 kg" } : safeObject(tech_pack.dimensions?.weight),
                    // Include additional dimensions like diameter, volume, etc.
                    ...(dims.volume && { volume: { value: dims.volume.value, unit: dims.volume.unit } }),
                    ...(dims.diameter && { diameter: { value: dims.diameter.value, unit: dims.diameter.unit } }),
                    // Include any additional custom dimensions
                    ...(dims.additionalDimensions && dims.additionalDimensions.reduce((acc: any, d: any) => {
                      acc[d.name.toLowerCase().replace(/\s+/g, '_')] = { value: d.value, unit: d.unit, description: d.description };
                      return acc;
                    }, {})),
                    fromProductDimensions: true,
                  };
                }
              }
              // Fallback to tech_pack dimensions
              return {
                length: safeObject(tech_pack.dimensions?.length),
                height: safeObject(tech_pack.dimensions?.height),
                width: safeObject(tech_pack.dimensions?.width),
                weight: safeObject(tech_pack.dimensions?.weight),
              };
            };

            // Get materials from product_materials if available (user-approved/AI-recommended materials)
            // Otherwise fall back to tech_pack materials
            const getUserMaterials = () => {
              if (product_materials) {
                // Use user materials if set, otherwise use recommended
                const mats = product_materials.user || product_materials.recommended;
                if (mats && Array.isArray(mats) && mats.length > 0) {
                  return mats.map((m: any) => ({
                    component: m?.component || "",
                    material: m?.material || "",
                    notes: m?.notes || "",
                    quantityPerUnit: m?.quantityPerUnit || "",
                    specification: m?.specification || "",
                    unitCost: m?.unitCost || "",
                    color: m?.color || "",
                    finish: m?.finish || "",
                    fromProductMaterials: true,
                  }));
                }
              }
              // Fallback to tech_pack materials
              return safeArray(tech_pack.materials).map((m: any) => ({
                component: m?.component || "",
                material: m?.material || "",
                notes: m?.notes || "",
                quantityPerUnit: m?.quantityPerUnit || "",
                specification: m?.specification || "",
                unitCost: m?.unitCost || "",
              }));
            };

            setTechPack({
              productName: tech_pack.productName || "",
              productOverview: tech_pack.productOverview || "",
              price: tech_pack.price || "",
              materials: getUserMaterials(),
              dimensions: getUserDimensions(),
              constructionDetails: {
                description: tech_pack.constructionDetails?.description || "",
                constructionFeatures: safeArray(
                  tech_pack.constructionDetails?.constructionFeatures
                ),
              },
              hardwareComponents: {
                description: tech_pack.hardwareComponents?.description || "",
                hardware: safeArray(tech_pack.hardwareComponents?.hardware),
              },
              colors: {
                styleNotes: tech_pack.colors?.styleNotes || "",
                trendAlignment: tech_pack.colors?.trendAlignment || "",
                primaryColors: safeArray(tech_pack.colors?.primaryColors),
                accentColors: safeArray(tech_pack.colors?.accentColors),
              },
              costStructure: {
                costRange: tech_pack.costStructure?.costRange || "",
                sampleCost: safeObject(tech_pack.costStructure?.sampleCost),
                logisticsCost: safeObject(
                  tech_pack.costStructure?.logisticsCost
                ),
                complianceCost: safeObject(
                  tech_pack.costStructure?.complianceCost
                ),
                productionCost: safeObject(
                  tech_pack.costStructure?.productionCost
                ),
                pricingStrategy: safeObject(
                  tech_pack.costStructure?.pricingStrategy
                ),
                incomeEstimation: safeObject(
                  tech_pack.costStructure?.incomeEstimation
                ),
                totalEstimatedCost: safeObject(
                  tech_pack.costStructure?.totalEstimatedCost
                ),
              },
              costIncomeEstimation: {
                sampleCreation: safeObject(
                  tech_pack.costIncomeEstimation?.sampleCreation
                ),
                bulkProduction1000: safeObject(
                  tech_pack.costIncomeEstimation?.bulkProduction1000
                ),
                unitVsSampleNote: safeObject(
                  tech_pack.costIncomeEstimation?.unitVsSampleNote
                ),
              },
              sizeRange: {
                sizes: safeArray(tech_pack.sizeRange?.sizes),
                gradingLogic: tech_pack.sizeRange?.gradingLogic || "",
              },
              packaging: {
                notes: tech_pack.packaging?.notes || "",
                packagingDetails: safeObject(
                  tech_pack.packaging?.packagingDetails
                ),
                description: tech_pack.packaging?.description || "",
              },
              labels: tech_pack.labels || {},
              careInstructions: tech_pack.careInstructions || "",
              qualityStandards: tech_pack.qualityStandards || "",
              productionNotes: tech_pack.productionNotes || "",
              estimatedLeadTime: tech_pack.estimatedLeadTime || "",
              productionLogistics: {
                MOQ: tech_pack.productionLogistics?.MOQ || "",
                leadTime: tech_pack.productionLogistics?.leadTime || "",
                sampleRequirements:
                  tech_pack.productionLogistics?.sampleRequirements || "",
              },
              category_Subcategory: tech_pack.category_Subcategory || "",
              intendedMarket_AgeRange: tech_pack.intendedMarket_AgeRange || "",
              sectionSummaries: tech_pack.sectionSummaries || {},
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch product idea:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductIdea();
  }, [projectId]);

  // ============================================
  // Extract dimensions from tech files (sketches) and merge into techPack
  // This ensures dimensions from Factory Specs are used when available
  // ============================================
  useEffect(() => {
    if (!techFilesData?.sketches?.length || !techPack) return;

    // Standard dimension mapping - maps sketch measurement names to tech pack dimension keys
    const dimensionMapping: Record<string, string> = {
      "overall height": "height",
      height: "height",
      "total height": "height",
      "overall width": "width",
      width: "width",
      "total width": "width",
      breadth: "width",
      depth: "length",
      length: "length",
      "overall depth": "length",
      "overall length": "length",
      weight: "weight",
      "total weight": "weight",
    };

    const extractedDimensions: Record<
      string,
      { value: string; tolerance?: string; description?: string }
    > = {};

    techFilesData.sketches.forEach((sketch) => {
      const analysis = sketch.analysis_data;
      if (!analysis) return;

      // From summary.measurements (primary source for sketch guides)
      const summaryMeasurements = analysis.summary?.measurements || [];
      summaryMeasurements.forEach((meas: any) => {
        if (meas.name && meas.value) {
          const normalizedName = meas.name.toLowerCase().trim();
          const mappedKey = dimensionMapping[normalizedName];

          if (mappedKey && !extractedDimensions[mappedKey]) {
            const valueStr = meas.value.toString();
            let mainValue = valueStr;
            let tolerance = "";

            const toleranceMatch = valueStr.match(/([±+\-]\s*[\d.]+\s*\w*)/);
            if (toleranceMatch) {
              tolerance = toleranceMatch[1].trim();
              mainValue = valueStr.replace(toleranceMatch[0], "").trim();
            }

            extractedDimensions[mappedKey] = {
              value: mainValue,
              tolerance: tolerance,
              description:
                meas.location || `From ${sketch.view_type || "sketch"} view`,
            };
          }
        }
      });

      // From annotations_included.dimensions
      const dimensions = analysis.annotations_included?.dimensions || [];
      dimensions.forEach((dim: any) => {
        const key = dim.dimension_type || dim.location || "";
        const value = dim.measurement || dim.value || "";
        if (key && value) {
          const normalizedName = key.toLowerCase().trim();
          const mappedKey = dimensionMapping[normalizedName];

          if (mappedKey && !extractedDimensions[mappedKey]) {
            const valueStr = value.toString();
            let mainValue = valueStr;
            let tolerance = "";

            const toleranceMatch = valueStr.match(/([±+\-]\s*[\d.]+\s*\w*)/);
            if (toleranceMatch) {
              tolerance = toleranceMatch[1].trim();
              mainValue = valueStr.replace(toleranceMatch[0], "").trim();
            }

            extractedDimensions[mappedKey] = {
              value: mainValue,
              tolerance: tolerance,
              description:
                dim.location || `From ${sketch.view_type || "sketch"} view`,
            };
          }
        }
      });
    });

    // Only update if we found dimensions and they differ from current
    if (Object.keys(extractedDimensions).length > 0) {
      const currentDims = techPack.dimensions || {};
      const hasEmptyDims =
        !currentDims.height?.value &&
        !currentDims.width?.value &&
        !currentDims.length?.value;
      const hasFactorySpecs =
        extractedDimensions.height ||
        extractedDimensions.width ||
        extractedDimensions.length;

      if (hasEmptyDims && hasFactorySpecs) {
        console.log(
          "📐 Updating dimensions from Factory Specs:",
          extractedDimensions
        );
        updateTechPack({
          dimensions: {
            ...techPack?.dimensions,
            ...extractedDimensions,
            fromFactorySpecs: true,
          },
        });
      }
    }
  }, [techFilesData?.sketches, techPack?.dimensions]);

  // Handle URL parameters for automatic generation
  useEffect(() => {
    if (!searchParams || !projectId || autoGenerateTriggered || !user) return;

    const autoGenerate = searchParams.get("autoGenerate") === "true";
    const showEditor = searchParams.get("showEditor") === "true";

    if (autoGenerate && !isLoading && techPackData) {
      setAutoGenerateTriggered(true);

      // If showEditor flag is set, go directly to editor
      if (showEditor) {
        setActiveTab("edit");
        setShowImageEditor(true);
      }

      // Fetch metadata from database instead of URL params
      const fetchAndGenerate = async () => {
        try {
          // Get the stored metadata from database
          const metadataResult = await getProductMetadata(projectId);

          if (!metadataResult.success) {
            console.error("Failed to fetch metadata:", metadataResult.error);
            return;
          }

          const metadata = metadataResult.metadata || ({} as any);

          // Extract parameters from database
          const type = searchParams.get("type");
          const generateExtraViews =
            searchParams.get("generateExtraViews") === "true";

          // Get all data from database metadata
          const designFile = metadata.designFile || "";
          const logo = metadata.logo || "";
          const category = metadata.category || "";
          const intendedUse = metadata.intended_use || "";
          const keywords = metadata.style_keywords || [];
          const selectedColors = metadata.selected_colors || [];
          const productGoal = metadata.product_goal || "";

          // Build the generation prompt
          let generationPrompt = "";

          // If we have a design file, use it as the prompt
          if (type === "design" && designFile) {
            generationPrompt = designFile; // This is the base64 image
          } else if (techPackData?.user_prompt) {
            generationPrompt = techPackData.user_prompt;
          } else if (techPackData?.prompt) {
            generationPrompt = techPackData.prompt;
          } else {
            generationPrompt = "Generate product images";
          }

          // Note: We're NOT adding category, intended use, etc to the chat message
          // These are just parameters for generation, not part of the user's message

          // Switch to edit tab and show image editor
          setActiveTab("edit");
          setShowImageEditor(true);

          // Set the initial generation prompt for the editor (this is what the user actually said)
          const userOriginalPrompt =
            type === "design" && intendedUse
              ? intendedUse
              : generationPrompt?.trim() ||
              "Generate product images based on my design";
          setInitialGenerationPrompt(userOriginalPrompt);

          // Trigger image generation after a short delay to ensure UI is ready
          setTimeout(async () => {
            setIsGeneratingImages(true);

            toast({
              title: "Generating new images",
              description: "Creating new product visualizations...",
            });

            try {
              // Build the full prompt with all context for generation
              let fullPromptForGeneration = "";

              // If we have a design file (base64), use it as the prompt
              if (type === "design" && designFile) {
                fullPromptForGeneration = designFile;
              } else {
                fullPromptForGeneration = userOriginalPrompt;
              }

              // For text prompts, add context parameters
              if (type !== "design") {
                if (category) {
                  fullPromptForGeneration += `. Category: ${category}`;
                }
                if (intendedUse) {
                  fullPromptForGeneration += `. Intended use: ${intendedUse}`;
                }
                if (keywords.length > 0) {
                  fullPromptForGeneration += `. Style: ${keywords.join(", ")}`;
                }
              }

              // Include logo if provided (for both design and text)
              if (logo && logo.trim() !== "") {
                // Note: logo is already base64, so we'll handle it separately in generation
                console.log("Logo will be included in generation");
              }

              const data: any = {
                user_prompt: fullPromptForGeneration,
                existing_project_id: projectId,
                regenerate_image_only: true,
              };

              // Only add logo if it's not empty
              if (logo && logo.trim() !== "") {
                data.image = logo;
              }

              const result = await generateIdea(data);

              if (result.success && result.image) {
                const deduct = await DeductCredits({ credit: 1 });
                if (!deduct) {
                  toast({
                    variant: "destructive",
                    title: "Insufficient Credits",
                    description:
                      "You need at least 1 credit to generate images.",
                  });
                  return;
                }
                const newImages = {
                  front: result.image.front.url,
                  back: result.image.back.url,
                  side: result.image.side?.url,
                  bottom: result.image.bottom?.url,
                  illustration: result.image.illustration?.url,
                };

                setProductImages(newImages);

                // Save initial images as revision 0 in the new table
                if (projectId) {
                  const saveResult = await saveInitialRevisions(projectId, {
                    front: { url: newImages.front },
                    back: { url: newImages.back },
                    ...(newImages.side && { side: { url: newImages.side } }),
                  });

                  if (saveResult.success) {
                    console.log("Initial revisions saved as revision 0");
                    // Refresh revisions list
                    const updatedRevisions =
                      await getGroupedMultiViewRevisions(projectId);
                    if (
                      updatedRevisions.success &&
                      updatedRevisions.revisions
                    ) {
                      const originalRevision = multiViewRevisions.find(
                        (r: any) => r.revisionNumber === 0
                      );
                      const hasOriginalInUpdate =
                        updatedRevisions.revisions.some(
                          (r: any) => r.revisionNumber === 0
                        );

                      if (originalRevision && !hasOriginalInUpdate) {
                        // Add back the original revision if it's not in the update
                        setMultiViewRevisions([
                          originalRevision,
                          ...updatedRevisions.revisions,
                        ]);
                      } else {
                        setMultiViewRevisions(updatedRevisions.revisions);
                      }
                    }
                  }
                }

                toast({
                  title: "Images Updated",
                  description:
                    "New product images have been generated and saved.",
                  variant: "default",
                });
                await refresCreatorCredits();
                addRecentlyUpdatedSection("Product Visualization");
                setTimeout(() => {
                  removeRecentlyUpdatedSection("Product Visualization");
                }, 3000);
              } else {
                throw new Error("Failed to regenerate images");
              }
            } catch (error) {
              console.error("Image regeneration failed:", error);
              toast({
                title: "Image Generation Failed",
                description:
                  "There was an error while generating new product visuals.",
                variant: "destructive",
              });
            } finally {
              setIsGeneratingImages(false);
            }
          }, 500);
        } catch (error) {
          console.error("Failed to fetch metadata or generate images:", error);
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "Failed to load product data. Please try again.",
          });
        }
      };

      fetchAndGenerate();
    }
  }, [
    searchParams,
    projectId,
    techPackData,
    isLoading,
    autoGenerateTriggered,
    user,
  ]);

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section === selectedSection ? null : section);
  };

  const handlePromptSubmit = async (section: string, promptText: string) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project ID available",
        variant: "destructive",
      });
      return;
    }

    const sectionKey = sectionKeyMap[section];

    try {
      // if (sectionKey === "productVisualization") {
      //   await handleRegenerateImages(promptText);
      //   return;
      // }

      const newPrompt = `Please improve or expand the following ${sectionKey} content:\n\n${JSON.stringify(
        promptText,
        null,
        2
      )}`;

      const data = {
        user_prompt: newPrompt,
        existing_project_id: projectId,
        regenerate_techpack_only: true,
        sectionToUpdate: sectionKey,
      };
      console.log(data, "dataa");
      const aiUpdatedContent = await generateIdea(data);
      console.log(aiUpdatedContent, "aiupdated");
      if (
        aiUpdatedContent.success &&
        aiUpdatedContent.techpack &&
        aiUpdatedContent.techpack[sectionKey]
      ) {
        const updatedSectionContent = aiUpdatedContent.techpack[sectionKey];

        updateTechPack({ [sectionKey]: updatedSectionContent });

        addRecentlyUpdatedSection(sectionKey);

        setTimeout(() => {
          removeRecentlyUpdatedSection(sectionKey);
        }, 3000);

        toast({
          title: "AI Enhanced",
          description: `${sectionKey} has been updated using AI.`,
          variant: "default",
        });
      } else {
        throw new Error("Invalid AI response for section update");
      }
    } catch (error) {
      console.error("Failed to update section with AI:", error);
      toast({
        title: "Update Failed",
        description: `There was a problem updating ${sectionKey} using AI.`,
        variant: "default",
      });
    }
  };

  const handleUpdateSection = async (sectionKey: string, newContent: any) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project ID available",
        variant: "destructive",
      });
      return;
    }

    try {
      const techpackUpdated = await updateTechpack(projectId, {
        ...techPack,
        [sectionKey]: newContent,
      });

      if (techpackUpdated) {
        router.refresh();
        setTechPack(techpackUpdated.tech_pack);
      }

      toast({
        title: "Saved",
        description: `${sectionKey} updated successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to update section:", error);
      toast({
        title: "Update Failed",
        description: `There was a problem updating ${sectionKey}.`,
        variant: "default",
      });
    }
  };

  /**
   * Handler for AI-initiated edits from the agentic chat
   * This applies changes directly to the tech pack and saves to database
   */
  const handleAgenticEdit = async (
    section: TechPackSectionType,
    value: any,
    field?: string
  ): Promise<boolean> => {
    if (!projectId) {
      console.error("No project ID for agentic edit");
      return false;
    }

    try {
      let updatedSection: any;

      // Handle nested field updates (e.g., dimensions.height)
      if (field && techPack[section] && typeof techPack[section] === "object") {
        updatedSection = {
          ...techPack[section],
          [field]: value,
        };
      } else {
        // Direct section update
        updatedSection = value;
      }

      // Update the tech pack in the database
      const techpackUpdated = await updateTechpack(projectId, {
        ...techPack,
        [section]: updatedSection,
      });

      if (techpackUpdated) {
        // Update local state
        setTechPack(techpackUpdated.tech_pack);

        // Visual feedback
        addRecentlyUpdatedSection(section);
        setTimeout(() => {
          removeRecentlyUpdatedSection(section);
        }, 3000);

        toast({
          title: "Updated by AI",
          description: `${section} has been updated successfully.`,
          variant: "default",
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to apply agentic edit:", error);
      toast({
        title: "Update Failed",
        description: `Could not update ${section}. Please try manually.`,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleGenerateTechPack = async () => {
    if (!projectId || !user?.id) return;

    let reservationId: string | undefined;
    setIsGeneratingTechPack(true);

    try {
      // Reserve credits for tech pack generation
      // const reservation = await ReserveCredits({ credit: 10 });

      // if (!reservation.success) {
      //   toast({
      //     variant: "destructive",
      //     title: "Insufficient Credits",
      //     description: "You need at least 10 credits to generate the tech pack.",
      //   });
      //   setIsGeneratingTechPack(false);
      //   return;
      // }

      // reservationId = reservation.reservationId;

      // Generate the tech pack
      const result = await generateTechPackForProduct(projectId);

      if (result.success) {
        // Deduct the reserved credits now that generation succeeded
        // const deducted = await DeductCredits({ credit: 3 });
        // if (!deducted) {
        //   console.error("Failed to deduct credits after successful generation");
        // }
        // Reload the page data to show the tech pack
        const productData = await getUserProjectIdea(projectId);
        if (
          productData &&
          productData.tech_pack &&
          Object.keys(productData.tech_pack).length > 0
        ) {
          // Update the main tech pack data state
          setTechPackData(productData);

          const { tech_pack } = productData;
          setTechPack({
            productName: tech_pack.productName || "",
            productOverview: tech_pack.productOverview || "",
            price: tech_pack.price || "",
            materials:
              tech_pack.materials?.map((m: any) => ({
                component: m.component || "",
                material: m.material || "",
                notes: m.notes || "",
                quantityPerUnit: m.quantityPerUnit || "",
                specification: m.specification || "",
                unitCost: m.unitCost || "",
              })) || [],
            dimensions: {
              details: tech_pack.dimensions?.details || [],
            },
            constructionDetails: {
              description: tech_pack.constructionDetails?.description || "",
              constructionFeatures:
                tech_pack.constructionDetails?.constructionFeatures || [],
            },
            hardwareComponents: {
              description: tech_pack.hardwareComponents?.description || "",
              hardware: tech_pack.hardwareComponents?.hardware || [],
            },
            colors: {
              styleNotes: tech_pack.colors?.styleNotes || "",
              trendAlignment: tech_pack.colors?.trendAlignment || "",
              primaryColors: tech_pack.colors?.primaryColors || [],
              accentColors: tech_pack.colors?.accentColors || [],
            },
            costStructure: {
              costRange: tech_pack.costStructure?.costRange || "",
              sampleCost: tech_pack.costStructure?.sampleCost || {},
              logisticsCost: tech_pack.costStructure?.logisticsCost || {},
              complianceCost: tech_pack.costStructure?.complianceCost || {},
              productionCost: tech_pack.costStructure?.productionCost || {},
              pricingStrategy: tech_pack.costStructure?.pricingStrategy || {},
              incomeEstimation: tech_pack.costStructure?.incomeEstimation || {},
              totalEstimatedCost:
                tech_pack.costStructure?.totalEstimatedCost || {},
            },
            costIncomeEstimation: {
              sampleCreation:
                tech_pack.costIncomeEstimation?.sampleCreation || {},
              bulkProduction1000:
                tech_pack.costIncomeEstimation?.bulkProduction1000 || {},
              unitVsSampleNote:
                tech_pack.costIncomeEstimation?.unitVsSampleNote || {},
            },
            sizeRange: {
              sizes: tech_pack.sizeRange?.sizes || [],
              gradingLogic: tech_pack.sizeRange?.gradingLogic || "",
            },
            packaging: {
              notes: tech_pack.packaging?.notes || "",
              packagingDetails: tech_pack.packaging?.packagingDetails || {},
              description: tech_pack.packaging?.description || "",
            },
            careInstructions: tech_pack.careInstructions || "",
            qualityStandards: tech_pack.qualityStandards || [],
            productionNotes: tech_pack.productionNotes || "",
            estimatedLeadTime: tech_pack.estimatedLeadTime || "",
            productionLogistics: {
              MOQ: tech_pack.productionLogistics?.MOQ || "",
              leadTime: tech_pack.productionLogistics?.leadTime || "",
              sampleRequirements:
                tech_pack.productionLogistics?.sampleRequirements || "",
            },
            category_Subcategory: tech_pack.category_Subcategory || "",
            intendedMarket_AgeRange: tech_pack.intendedMarket_AgeRange || "",
          });
          setTechPackGenerated(true);

          toast({
            variant: "default",
            title: "Tech Pack Generated!",
            description:
              "Your technical specifications have been created successfully.",
          });
          await refresCreatorCredits();
          // Switch to the tech pack tab after a brief delay to ensure state updates
          setTimeout(() => {
            setActiveTab("techpack");
          }, 100);
        } else {
          // If tech pack generation succeeded but we couldn't load the data, still show success
          toast({
            variant: "default",
            title: "Tech Pack Generated!",
            description:
              "Your technical specifications have been created. Refreshing...",
          });

          // Force a page refresh to load the new data
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description:
            result.error || "Failed to generate tech pack. Please try again.",
        });

        // Refund the reserved credits on failure
        if (reservationId) {
          const refunded = await RefundCredits({ credit: 10, reservationId });
          if (refunded) {
            console.log("Credits refunded due to generation failure");
          }
        }
      }
    } catch (error) {
      console.error("Error generating tech pack:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });

      // Refund credits on error
      // if (reservationId) {
      //   const refunded = await RefundCredits({ credit: 10, reservationId });
      //   if (refunded) {
      //     console.log("Credits refunded due to error");
      //   }
      // }
    } finally {
      setIsGeneratingTechPack(false);
    }
  };

  const handleFinalize = async () => {
    toast({
      variant: "default",
      title: "Tech Pack Finalized",
      description: "Your tech pack has been successfully created!",
    });

    router.push(`/product/${projectId}`);
  };

  const handlePdfDownload = async () => {
    // Check if we have the required data for PDF generation
    if (!techPackData?.tech_pack?.productName && !techPack?.productName) {
      toast({
        variant: "destructive",
        title: "No Tech Pack Available!",
        description: "Generate Tech Pack First to download PDF",
      });
      return;
    }

    try {
      setPdfLoader(true);

      // Build the complete tech pack data structure needed by the PDF generator
      // Include ALL available data: images, sketches, closeups, components, baseViews with their analysis guides
      const pdfData = {
        tech_pack: techPack || techPackData?.tech_pack || {},
        image_data: techPackData?.image_data || {
          front: productImages.front ? { url: productImages.front } : null,
          back: productImages.back ? { url: productImages.back } : null,
          side: productImages.side ? { url: productImages.side } : null,
        },
        technical_images: techPackData?.technical_images || {},
        // Include all tech files with their analysis_data (guides)
        tech_files_data: {
          sketches: techFilesData?.sketches || [],
          closeups: techFilesData?.closeups || [],
          components: techFilesData?.components || [],
          baseViews: techFilesData?.baseViews || [],
        },
        // Also include flat array for backward compatibility
        all_tech_files: [
          ...(techFilesData?.sketches || []),
          ...(techFilesData?.closeups || []),
          ...(techFilesData?.components || []),
          ...(techFilesData?.baseViews || []),
        ],
        product_name:
          techPack?.productName ||
          techPackData?.tech_pack?.productName ||
          "Product",
      };

      console.log("📄 Generating PDF with data:", {
        hasProductName: !!pdfData.tech_pack?.productName,
        hasImageData: !!pdfData.image_data,
        hasTechnicalImages: !!pdfData.technical_images,
        sketchesCount: pdfData.tech_files_data.sketches.length,
        closeupsCount: pdfData.tech_files_data.closeups.length,
        componentsCount: pdfData.tech_files_data.components.length,
        baseViewsCount: pdfData.tech_files_data.baseViews.length,
      });

      await generatePdffromTechpack({ tech_pack: pdfData });

      toast({
        title: "PDF Downloaded",
        description: "Your tech pack PDF has been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: "Could not generate PDF. Please try again.",
      });
    } finally {
      setPdfLoader(false);
    }
  };

  const handlePrintFileDownload = async () => {
    if (!techPackData?.image_data?.front?.url) {
      toast({
        variant: "destructive",
        title: "No Product Image Available",
        description: "Generate product images first to download print files",
      });
      return;
    }

    try {
      setPrintFileLoader(true);

      // Prepare the techPack data for the print files API
      // Include ALL available data: images, sketches, closeups, components, baseViews with their analysis guides
      const techPackPayload = {
        image_data: {
          front: { url: techPackData.image_data.front.url },
          ...(techPackData.image_data.back?.url && {
            back: { url: techPackData.image_data.back.url },
          }),
          ...(techPackData.image_data.side?.url && {
            side: { url: techPackData.image_data.side.url },
          }),
        },
        tech_pack: {
          productName:
            techPack?.productName ||
            techPackData?.tech_pack?.productName ||
            "Product",
          ...techPack,
          ...techPackData?.tech_pack,
        },
        technical_images: techPackData?.technical_images || {},
        // Include all tech files with their analysis_data (guides)
        tech_files_data: {
          sketches: techFilesData?.sketches || [],
          closeups: techFilesData?.closeups || [],
          components: techFilesData?.components || [],
          baseViews: techFilesData?.baseViews || [],
        },
        // Also include flat array for backward compatibility
        all_tech_files: [
          ...(techFilesData?.sketches || []),
          ...(techFilesData?.closeups || []),
          ...(techFilesData?.components || []),
          ...(techFilesData?.baseViews || []),
        ],
      };

      const response = await fetch("/api/print-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techPack: techPackPayload }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate print files");
      }

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(techPack?.productName || "product").replace(/\s+/g, "_")}_print_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Print Files Downloaded",
        description:
          "Your print files have been generated and downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating print files:", error);
      toast({
        variant: "destructive",
        title: "Print File Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate print files",
      });
    } finally {
      setPrintFileLoader(false);
    }
  };

  const handleProductFilesDownload = async () => {
    if (!techPackData?.tech_pack?.productName && !techPack?.productName) {
      toast({
        variant: "destructive",
        title: "No Tech Pack Available!",
        description: "Generate Tech Pack first to download the files.",
      });
      return;
    }

    try {
      setProductFilesLoader(true);

      // Build complete data structure for product files
      // Include ALL available data: images, sketches, closeups, components, baseViews with their analysis guides
      const filesData = {
        tech_pack: techPack || techPackData?.tech_pack || {},
        image_data: techPackData?.image_data || {
          front: productImages.front ? { url: productImages.front } : null,
          back: productImages.back ? { url: productImages.back } : null,
          side: productImages.side ? { url: productImages.side } : null,
        },
        technical_images: techPackData?.technical_images || {},
        // Include all tech files with their analysis_data (guides)
        tech_files_data: {
          sketches: techFilesData?.sketches || [],
          closeups: techFilesData?.closeups || [],
          components: techFilesData?.components || [],
          baseViews: techFilesData?.baseViews || [],
        },
        // Also include flat array for backward compatibility
        all_tech_files: [
          ...(techFilesData?.sketches || []),
          ...(techFilesData?.closeups || []),
          ...(techFilesData?.components || []),
          ...(techFilesData?.baseViews || []),
        ],
        product_name:
          techPack?.productName ||
          techPackData?.tech_pack?.productName ||
          "Product",
      };

      const result = await generateProductFilesfromTechpack({
        tech_pack: filesData,
      });

      if (!result?.success) {
        toast({
          variant: "destructive",
          title: "Download Failed!",
          description: "Could not generate ZIP file",
        });
        return;
      }

      const { zipBlob, filename } = result;

      if (!zipBlob) {
        toast({
          variant: "destructive",
          title: "Download Failed!",
          description: "ZIP file could not be created.",
        });
        return;
      }

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "product-files.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Download Ready",
        description: "Your product files ZIP has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating ZIP:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong during ZIP generation.",
      });
    } finally {
      setProductFilesLoader(false);
    }
  };

  const handleExcelDownload = async () => {
    if (!techPackData?.tech_pack?.productName && !techPack?.productName) {
      toast({
        variant: "destructive",
        title: "No Tech Pack Available!",
        description: "Generate Tech Pack first to download Excel sheet",
      });
      return;
    }

    try {
      setExcelLoader(true);

      // Build complete data structure for Excel
      // Include ALL available data: images, sketches, closeups, components, baseViews with their analysis guides
      const excelData = {
        tech_pack: techPack || techPackData?.tech_pack || {},
        image_data: techPackData?.image_data || {
          front: productImages.front ? { url: productImages.front } : null,
          back: productImages.back ? { url: productImages.back } : null,
          side: productImages.side ? { url: productImages.side } : null,
        },
        technical_images: techPackData?.technical_images || {},
        // Include all tech files with their analysis_data (guides)
        tech_files_data: {
          sketches: techFilesData?.sketches || [],
          closeups: techFilesData?.closeups || [],
          components: techFilesData?.components || [],
          baseViews: techFilesData?.baseViews || [],
        },
        // Also include flat array for backward compatibility
        all_tech_files: [
          ...(techFilesData?.sketches || []),
          ...(techFilesData?.closeups || []),
          ...(techFilesData?.components || []),
          ...(techFilesData?.baseViews || []),
        ],
        product_name:
          techPack?.productName ||
          techPackData?.tech_pack?.productName ||
          "Product",
      };

      const workbook = await generateExcelFromData({ tech_pack: excelData });

      // Convert workbook → buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Buffer → Blob
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${techPack?.productName || "techpack"}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Excel Downloaded",
        description: "Your Excel file has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Excel download failed:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate Excel file.",
      });
    } finally {
      setExcelLoader(false);
    }
  };

  const handleSvgDownload = async () => {
    // Collect first 3 images of each type (sketches, closeups, components)
    const MAX_PER_TYPE = 3;
    const sketchUrls = (techFilesData?.sketches || []).slice(0, MAX_PER_TYPE).map((s) => s.file_url).filter(Boolean);
    const closeupUrls = (techFilesData?.closeups || []).slice(0, MAX_PER_TYPE).map((c) => c.file_url).filter(Boolean);
    const componentUrls = (techFilesData?.components || []).slice(0, MAX_PER_TYPE).map((c) => c.file_url).filter(Boolean);

    const imagesToProcess = [...sketchUrls, ...closeupUrls, ...componentUrls];

    if (!imagesToProcess.length) {
      toast({
        variant: "destructive",
        title: "No Images Available",
        description: "No sketches, closeups, or component images found to convert to SVG.",
      });
      return;
    }

    try {
      setSvgLoader(true);

      // Call the SVG converter API with limited batch
      const res = await fetch("/api/svg-converter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagesToProcess.length > 1 ? { imageUrls: imagesToProcess } : { imageUrl: imagesToProcess[0] }),
      });

      const data = await res.json();
      console.log("SVG API Response:", JSON.stringify(data, null, 2));

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Conversion Failed",
          description: data.error || "Server error while converting images.",
        });
        return;
      }

      const responses = Array.isArray(data) ? data : [data];
      console.log("Processing responses:", responses.length);
      const zip = new JSZip();

      // Track file counts for naming
      let sketchCount = 0;
      let closeupCount = 0;
      let componentCount = 0;
      let filesAdded = 0;

      for (let i = 0; i < responses.length; i++) {
        const item = responses[i];
        if (item.error) {
          console.error(`Error converting ${item.originalImageUrl}: ${item.error}`);
          continue;
        }

        let svgContent = item.svgText || item.svgBase64;
        if (!svgContent) {
          console.warn(`No SVG content for item ${i}`);
          continue;
        }

        // Check if it's base64 encoded or raw SVG
        let svgDecoded: string;
        if (svgContent.startsWith("data:image/svg+xml;base64,")) {
          // Base64 with data URI prefix
          const base64 = svgContent.replace("data:image/svg+xml;base64,", "");
          svgDecoded = atob(base64);
        } else if (svgContent.startsWith("<svg") || svgContent.startsWith("<?xml")) {
          // Raw SVG content
          svgDecoded = svgContent;
        } else {
          // Assume it's base64 without prefix
          try {
            svgDecoded = atob(svgContent);
          } catch {
            // If atob fails, use as-is (might be raw SVG without standard prefix)
            svgDecoded = svgContent;
          }
        }

        // Name files based on their type
        let fileName: string;
        if (i < sketchUrls.length) {
          sketchCount++;
          fileName = `sketch-${sketchCount}.svg`;
        } else if (i < sketchUrls.length + closeupUrls.length) {
          closeupCount++;
          fileName = `closeup-${closeupCount}.svg`;
        } else {
          componentCount++;
          fileName = `component-${componentCount}.svg`;
        }

        zip.file(fileName, svgDecoded);
        filesAdded++;
      }

      if (filesAdded === 0) {
        // Check if we have specific error types to show better messages
        const hasInsufficientCredits = responses.some((r) =>
          r.error?.includes("Insufficient credits") || r.error?.includes("creditsRequired")
        );
        const hasRateLimit = responses.some((r) =>
          r.error?.includes("Rate limit") || r.error?.includes("limit")
        );

        if (hasInsufficientCredits) {
          toast({
            variant: "destructive",
            title: "SVG Service Unavailable",
            description: "The SVG conversion service has run out of credits. Please contact support.",
          });
        } else if (hasRateLimit) {
          toast({
            variant: "destructive",
            title: "Rate Limit Exceeded",
            description: "Too many conversion requests. Please try again in a minute.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "No SVG Files Generated",
            description: "The conversion did not produce any valid SVG files.",
          });
        }
        return;
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${techPack?.productName || "product-svg"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "SVG Downloaded",
        description: `Successfully converted ${filesAdded} images to SVG.`,
      });
    } catch (error: any) {
      console.error("SVG download failed:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error?.message || "Could not generate SVG files.",
      });
    } finally {
      setSvgLoader(false);
    }
  };

  console.log(productImages, "ajsdf");
  console.log(getTechPack, "asjfasjkasakjdslkjlkjlkjlkjlkjlkjlkjlkjlkjlkjlkj");
  if (isLoading) {
    return (
      <LoadingOverlay
        show={true}
        title="Opening Your Product"
        subtitle="Loading your product details..."
      />
    );
  }

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Project Found</h1>
          <p className="text-[#1C1917] mb-4">Please create a project first.</p>
          <Button asChild>
            <Link href="/">Create New Project</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show tech pack generation option if images are ready but tech pack not generated
  // Skip this screen if we're showing the image editor or if generation is triggered
  const skipGenerationPrompt =
    showImageEditor || searchParams?.get("showEditor") === "true";
  if (
    !techPack &&
    productImages.front &&
    !isGeneratingTechPack &&
    !skipGenerationPrompt
  ) {
    return (
      <div className="py-2 min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-2xl w-full mx-4">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Product Images Ready!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {productImages.front && (
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={productImages.front}
                    alt="Front view"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {productImages.back && (
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={productImages.back}
                    alt="Back view"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {productImages.side && (
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={productImages.side}
                    alt="Side view"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="text-center space-y-4">
              <p className="text-[#1C1917]">
                Your product images have been generated successfully. Continue to the AI Designer
                to review your images and create your product with full specifications.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={() => {
                    router.push(
                      `/ai-designer?projectId=${projectId}&version=modular`
                    );
                  }}
                  size="lg"
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Continue to AI Designer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading if generating tech pack
  if (!techPack && isGeneratingTechPack) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            Generating your tech pack...
          </p>
          <p className="text-sm text-[#1C1917]">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Default loading state
  if (!techPack && !showImageEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header with back buttons, CTA buttons, and export menu */}
      <ProductHeader
        onPdfDownload={handlePdfDownload}
        onExcelDownload={handleExcelDownload}
        onFilesDownload={handleProductFilesDownload}
        onPrintFileDownload={handlePrintFileDownload}
      />

      {/* Main layout with sidebar and chat panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Agentic Chat Panel - Desktop only, integrated in layout - Uses Zustand store */}
        <AgenticChatPanel onApplyEdit={handleAgenticEdit} />

        {/* Desktop Sidebar with product selector and collapsible sections - Uses Zustand store */}
        <ProductSidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pb-12 md:pb-4 flex flex-col">
          {/* Product Metadata Editor - Editable product info fields */}
          <ProductMetadataEditor
            productId={techPackData?.id || ""}
            productName={
              techPack?.productName ||
              techPackData?.tech_pack?.productName ||
              "Product"
            }
            description={techPack?.productOverview?.slice(0, 100) || ""}
            category={techPack?.category_Subcategory || ""}
            createdAt={techPackData?.created_at}
            sku={productMetadata?.sku}
            referenceNumber={productMetadata?.referenceNumber}
            targetConsumerPriceUsd={productMetadata?.targetConsumerPriceUsd}
            status={productMetadata?.status}
            onMetadataUpdate={(metadata) => {
              // Update local state
              setProductMetadata(metadata);
              // Also update techPack if name/description changed
              if (metadata.productName || metadata.description) {
                updateTechPack({
                  ...(metadata.productName && { productName: metadata.productName }),
                  ...(metadata.description && { productOverview: metadata.description }),
                });
              }
            }}
          />

          <div className="flex-1 w-full p-4 pb-24 md:pb-4">
            {/* Section Contents - New Consolidated Sections */}

            {/* Visual Section - Images + Colors */}
            {activeTab === "visual" && <VisualSection />}

            {/* Factory Specs Section - Base Views + Components + Close-Ups + Sketches */}
            {activeTab === "factory-specs" && <FactorySpecsSection />}

            {/* Specifications Section - Overview + Materials + Measurements + Sizes */}
            {activeTab === "specifications" && (
              <SpecificationsSection
                onUpdateSection={handleUpdateSection}
                selectedSection={selectedSection}
                onSectionSelect={handleSectionSelect}
              />
            )}

            {/* Construction Section - Construction + Hardware */}
            {activeTab === "construction" && (
              <ConstructionSection
                onUpdateSection={handleUpdateSection}
                selectedSection={selectedSection}
                onSectionSelect={handleSectionSelect}
              />
            )}

            {/* Production Section - Packaging + Care + Quality + Production */}
            {activeTab === "production" && (
              <ProductionSection
                onUpdateSection={handleUpdateSection}
                selectedSection={selectedSection}
                onSectionSelect={handleSectionSelect}
              />
            )}

            {/* Legacy sections for backwards compatibility - hidden but kept for reference */}
            {/* Base Views Section - NOW IN FACTORY SPECS */}
            {activeTab === "base-views-legacy" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      Base View Analysis
                    </h3>
                  </div>
                  {techFilesData?.baseViews &&
                    techFilesData.baseViews.length > 0 && (
                      <Badge variant="secondary">
                        {techFilesData.baseViews.length} views
                      </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered analysis of front, back, and side views with
                  material detection and construction details.
                </p>

                {techFilesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : techFilesData?.baseViews &&
                  techFilesData.baseViews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {techFilesData.baseViews.map((view) => (
                      <Card key={view.id} className="overflow-hidden">
                        <div
                          className="relative aspect-square md:aspect-video bg-muted cursor-pointer group"
                          onClick={() =>
                            openViewer({
                              url: view.file_url,
                              title: capitalizeTitle(
                                `${view.view_type?.replace("_", " ")} View`
                              ),
                              description:
                                view.analysis_data?.product_category ||
                                view.analysis_data?.summary?.overview ||
                                "",
                            })
                          }
                        >
                          <img
                            src={view.thumbnail_url || view.file_url}
                            alt={view.view_type || "Base View"}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="h-8 w-8 text-white" />
                          </div>
                          <Badge className="absolute top-2 left-2 capitalize">
                            {view.view_type?.replace("_", " ")} View
                          </Badge>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          {view.analysis_data && (
                            <>
                              {view.analysis_data.product_category && (
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Category
                                  </p>
                                  <p className="text-sm font-medium capitalize">
                                    {view.analysis_data.product_category}
                                  </p>
                                </div>
                              )}
                              {view.analysis_data.materials_detected &&
                                view.analysis_data.materials_detected.length >
                                0 && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Materials Detected
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {view.analysis_data.materials_detected
                                        .slice(0, 4)
                                        .map((material: any, idx: number) => (
                                          <Badge
                                            key={idx}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {material.material_type ||
                                              material.component ||
                                              (typeof material === "string"
                                                ? material
                                                : JSON.stringify(material))}
                                          </Badge>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              {view.analysis_data.construction_details &&
                                view.analysis_data.construction_details.length >
                                0 && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Construction
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {view.analysis_data.construction_details
                                        .slice(0, 3)
                                        .map((detail: any, idx: number) => (
                                          <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {typeof detail === "string"
                                              ? detail
                                              : detail.feature ||
                                              detail.description ||
                                              detail.name}
                                          </Badge>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              {view.analysis_data.summary && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Summary
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {typeof view.analysis_data.summary ===
                                      "string"
                                      ? view.analysis_data.summary
                                      : view.analysis_data.summary.overview ||
                                      view.analysis_data.summary.description}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                          {/* Action buttons */}
                          <div className="flex items-center justify-between pt-3 border-t mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openViewer({
                                  url: view.file_url,
                                  title: capitalizeTitle(
                                    `${view.view_type?.replace("_", " ")} View`
                                  ),
                                  description:
                                    view.analysis_data?.summary?.overview || "",
                                });
                              }}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <FileImage className="h-3.5 w-3.5" />
                              Factory specs
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTechFileGuide(view);
                              }}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              View Guide
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">
                      No Base Views Generated
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Base view analysis will appear here once generated through
                      Factory Specs.
                    </p>
                  </Card>
                )}
              </div>
            )}

            {/* Components Section */}
            {activeTab === "components" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Component className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Component Images</h3>
                  </div>
                  {techFilesData?.components &&
                    techFilesData.components.length > 0 && (
                      <Badge variant="secondary">
                        {techFilesData.components.length} components
                      </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Isolated images of individual components and materials for
                  factory sourcing.
                </p>

                {techFilesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : techFilesData?.components &&
                  techFilesData.components.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {techFilesData.components.map((component) => (
                      <Card key={component.id} className="overflow-hidden">
                        <div
                          className="relative aspect-square bg-muted cursor-pointer group"
                          onClick={() =>
                            openViewer({
                              url: component.file_url,
                              title: capitalizeTitle(
                                component.file_category ||
                                component.analysis_data?.component_name ||
                                "Component"
                              ),
                              description:
                                component.analysis_data?.description ||
                                component.analysis_data?.material ||
                                "",
                            })
                          }
                        >
                          <img
                            src={component.thumbnail_url || component.file_url}
                            alt={component.file_category || "Component"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          <h4 className="text-sm font-semibold truncate">
                            {component.file_category ||
                              component.analysis_data?.component_name ||
                              "Component"}
                          </h4>
                          {component.analysis_data?.material && (
                            <p className="text-xs text-muted-foreground truncate">
                              {component.analysis_data.material}
                            </p>
                          )}

                          {/* Action buttons */}
                          <div className="flex items-center justify-between pt-2 border-t mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openViewer({
                                  url: component.file_url,
                                  title: capitalizeTitle(
                                    component.file_category ||
                                    component.analysis_data?.component_name ||
                                    "Component"
                                  ),
                                  description:
                                    component.analysis_data?.description || "",
                                });
                              }}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <FileImage className="h-3 w-3" />
                              Factory specs
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTechFileGuide(component);
                              }}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <BookOpen className="h-3 w-3" />
                              View Guide
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Component className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">
                      No Components Generated
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Component images will appear here once generated through
                      Factory Specs.
                    </p>
                  </Card>
                )}
              </div>
            )}

            {/* Close-Ups Section */}
            {activeTab === "closeups" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Focus className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Close-Up Shots</h3>
                  </div>
                  {techFilesData?.closeups &&
                    techFilesData.closeups.length > 0 && (
                      <Badge variant="secondary">
                        {techFilesData.closeups.length} shots
                      </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Detailed close-up shots of materials, construction, and
                  special features.
                </p>

                {techFilesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : techFilesData?.closeups &&
                  techFilesData.closeups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {techFilesData.closeups.map((closeup) => (
                      <Card key={closeup.id} className="overflow-hidden">
                        <div
                          className="relative aspect-square bg-muted cursor-pointer group"
                          onClick={() =>
                            openViewer({
                              url: closeup.file_url,
                              title: capitalizeTitle(
                                closeup.file_category || "Close-Up"
                              ),
                              description:
                                closeup.analysis_data?.summary?.overview ||
                                closeup.analysis_data?.description ||
                                "",
                            })
                          }
                        >
                          <img
                            src={closeup.thumbnail_url || closeup.file_url}
                            alt={closeup.file_category || "Close-Up"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="h-6 w-6 text-white" />
                          </div>
                          <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          <h4 className="text-sm font-semibold">
                            {closeup.file_category || "Detail Shot"}
                          </h4>
                          {closeup.analysis_data?.summary?.overview && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {closeup.analysis_data.summary.overview}
                            </p>
                          )}

                          {/* Action buttons */}
                          <div className="flex items-center justify-between pt-2 border-t mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openViewer({
                                  url: closeup.file_url,
                                  title: capitalizeTitle(
                                    closeup.file_category || "Close-Up"
                                  ),
                                  description:
                                    closeup.analysis_data?.summary?.overview ||
                                    "",
                                });
                              }}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <FileImage className="h-3 w-3" />
                              Factory specs
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTechFileGuide(closeup);
                              }}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <BookOpen className="h-3 w-3" />
                              View Guide
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Focus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">No Close-Ups Generated</h4>
                    <p className="text-sm text-muted-foreground">
                      Close-up shots will appear here once generated through
                      Factory Specs.
                    </p>
                  </Card>
                )}
              </div>
            )}

            {/* Sketches Section */}
            {activeTab === "sketches" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      Technical Sketches
                    </h3>
                  </div>
                  {techFilesData?.sketches &&
                    techFilesData.sketches.length > 0 && (
                      <Badge variant="secondary">
                        {techFilesData.sketches.length} sketches
                      </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Production-ready technical specification sheets with
                  annotations and callouts.
                </p>

                {techFilesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : techFilesData?.sketches &&
                  techFilesData.sketches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {techFilesData.sketches.map((sketch) => (
                      <Card key={sketch.id} className="overflow-hidden">
                        <div
                          className="relative aspect-[4/3] bg-white cursor-pointer group"
                          onClick={() =>
                            openViewer({
                              url: sketch.file_url,
                              title: capitalizeTitle(
                                `${sketch.view_type?.replace("_", " ")} Sketch`
                              ),
                              description:
                                sketch.analysis_data?.summary?.overview || "",
                            })
                          }
                        >
                          <img
                            src={sketch.thumbnail_url || sketch.file_url}
                            alt={sketch.view_type || "Sketch"}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="h-8 w-8 text-white" />
                          </div>
                          <Badge className="absolute top-2 left-2 capitalize">
                            {sketch.view_type?.replace("_", " ")} View
                          </Badge>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          {sketch.analysis_data?.summary && (
                            <>
                              {sketch.analysis_data.summary.overview && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {sketch.analysis_data.summary.overview}
                                </p>
                              )}
                            </>
                          )}
                          {sketch.analysis_data?.callouts?.callouts &&
                            sketch.analysis_data.callouts.callouts.length >
                            0 && (
                              <div>
                                <p className="text-xs font-medium mb-2">
                                  Callouts
                                </p>
                                <div className="space-y-1">
                                  {sketch.analysis_data.callouts.callouts
                                    .slice(0, 3)
                                    .map((callout: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2 text-xs"
                                      >
                                        <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 text-[10px]">
                                          {idx + 1}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {callout.feature_name ||
                                            callout.specification ||
                                            callout.label ||
                                            callout.text}
                                        </span>
                                      </div>
                                    ))}
                                  {sketch.analysis_data.callouts.callouts
                                    .length > 3 && (
                                      <p className="text-xs text-muted-foreground">
                                        +
                                        {sketch.analysis_data.callouts.callouts
                                          .length - 3}{" "}
                                        more
                                      </p>
                                    )}
                                </div>
                              </div>
                            )}
                          {sketch.analysis_data?.measurements &&
                            Object.keys(sketch.analysis_data.measurements)
                              .length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-2">
                                  Measurements
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(
                                    sketch.analysis_data.measurements
                                  )
                                    .slice(0, 4)
                                    .map(([key, value]: [string, any]) => (
                                      <Badge
                                        key={key}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {key}:{" "}
                                        {typeof value === "object"
                                          ? value.value
                                          : value}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            )}
                          {/* Action buttons */}
                          <div className="flex items-center justify-between pt-3 border-t mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openViewer({
                                  url: sketch.file_url,
                                  title: capitalizeTitle(
                                    `${sketch.view_type?.replace("_", " ")} Sketch`
                                  ),
                                  description:
                                    sketch.analysis_data?.summary?.overview ||
                                    "",
                                });
                              }}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <FileImage className="h-3.5 w-3.5" />
                              Factory specs
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTechFileGuide(sketch);
                              }}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              View Guide
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <PenTool className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">No Sketches Generated</h4>
                    <p className="text-sm text-muted-foreground">
                      Technical sketches will appear here once generated through
                      Factory Specs.
                    </p>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "overview" && (
              <TechPackSection
                title="Product Overview"
                icon={<FileText className="h-5 w-5" />}
                hideTitle
                content={techPack?.productOverview || ""}
                onUpdate={(content) =>
                  handleUpdateSection("productOverview", content)
                }
                industryBenchmark={industryBenchmarks["Product Overview"]}
                isSelected={selectedSection === "Product Overview"}
                onSelect={() => handleSectionSelect("Product Overview")}
                renderContent={(content, isUpdating) => (
                  <p className="text-xs">{content}</p>
                )}
                isAiPromptOpen={isAIPromptOpen} // Boolean value
                setAiPromptOpen={setIsAIPromptOpen}
              />
            )}

            {activeTab === "materials" && (
              <TechPackSection
                title="Materials"
                icon={<Layers className="h-5 w-5" />}
                hideTitle
                readOnly
                content={{
                  materials: Array.isArray(techPack?.materials)
                    ? techPack.materials.map((m: any) => ({
                      component: m.component,
                      material: m.material,
                      notes: m.notes,
                      quantityPerUnit: m.quantityPerUnit,
                      specification: m.specification,
                      unitCost: m.unitCost,
                    }))
                    : [],
                }}
                onUpdate={(updatedContent) => {
                  const updatedMaterials = updatedContent.materials;
                  const fullUpdatedMaterials = Array.isArray(
                    techPack?.materials
                  )
                    ? techPack.materials.map(
                      (original: any, index: number) => ({
                        ...original,
                        ...(updatedMaterials?.[index] || {}),
                      })
                    )
                    : updatedMaterials || [];

                  handleUpdateSection("materials", fullUpdatedMaterials);
                }}
                industryBenchmark={industryBenchmarks["Materials"]}
                isSelected={selectedSection === "Materials"}
                onSelect={() => handleSectionSelect("Materials")}
                isAiPromptOpen={isAIPromptOpen} // Boolean value
                setAiPromptOpen={setIsAIPromptOpen}
                renderContent={(content, isUpdating) => (
                  <div className="space-y-2">
                    {content.materials?.map((material: any, index: number) => (
                      <div key={index} className="border rounded-md p-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium">
                            {material.component}
                          </p>
                          <p className="text-xs font-medium">
                            {material.material}
                          </p>
                          <p className="text-xs font-medium">
                            {material.unitCost}
                          </p>
                          <p className="text-xs text-[#1C1917]">
                            {material.notes}
                          </p>
                          <p className="text-xs text-[#1C1917]">
                            {material.specification}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              />
            )}

            {activeTab === "measurements" && techPack?.dimensions && (
              <TechPackSection
                title="Measurements & Tolerance"
                icon={<Ruler className="h-5 w-5" />}
                hideTitle
                readOnly
                content={{ measurements: techPack.dimensions || {} }}
                onUpdate={(content) => {
                  const { measurements } = content;
                  handleUpdateSection("dimensions", measurements);
                }}
                isAiPromptOpen={isAIPromptOpen}
                setAiPromptOpen={setIsAIPromptOpen}
                industryBenchmark={
                  industryBenchmarks["Measurements & Tolerance"]
                }
                isSelected={selectedSection === "Measurements & Tolerance"}
                onSelect={() => handleSectionSelect("Measurements & Tolerance")}
                renderContent={(content, isUpdating) => {
                  const measurements = content.measurements || {};
                  const entries = Object.entries(measurements);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(
                        Object.entries(measurements) as [
                          string,
                          {
                            value: string;
                            tolerance?: string;
                            description?: string;
                          },
                        ][]
                      ).map(([key, { value, tolerance, description }]) => (
                        <div
                          key={key}
                          className="border rounded-md p-3 space-y-1"
                        >
                          <p className="text-xs font-semibold text-gray-900 capitalize">
                            {key === "width" ? "Breadth" : key}
                          </p>
                          <p className="text-xs text-gray-700">
                            {value || "N/A"} {tolerance && `(${tolerance})`}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            )}

            {activeTab === "construction" && (
              <TechPackSection
                title="Construction Details"
                icon={<Scissors className="h-5 w-5" />}
                hideTitle
                content={{
                  description: techPack?.constructionDetails?.description,
                  constructionFeatures:
                    techPack?.constructionDetails?.constructionFeatures,
                }}
                onUpdate={(content) =>
                  handleUpdateSection("constructionDetails", {
                    ...(techPack?.constructionDetails || {}),
                    description: content.description,
                  })
                }
                isAiPromptOpen={isAIPromptOpen} // Boolean value
                setAiPromptOpen={setIsAIPromptOpen}
                industryBenchmark={industryBenchmarks["Construction Details"]}
                isSelected={selectedSection === "Construction Details"}
                onSelect={() => handleSectionSelect("Construction Details")}
                renderContent={(content, isUpdating) => (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs">{content.description}</p>
                    </div>

                    {!isUpdating && (
                      <div className="flex flex-wrap gap-2">
                        {content.constructionFeatures?.map(
                          (construction: any, i: number) => (
                            <div
                              className="border rounded-md p-3 space-y-1"
                              key={i}
                            >
                              <p className="text-xs font-semibold text-gray-900">
                                {construction.featureName}
                              </p>
                              <p className="text-xs text-gray-700">
                                {construction.details}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              />
            )}

            {activeTab === "hardware" && (
              <TechPackSection
                title="Hardware Components"
                icon={<Tag className="h-5 w-5" />}
                hideTitle
                content={{
                  description: techPack?.hardwareComponents?.description,
                  hardware: techPack?.hardwareComponents?.hardware,
                }}
                onUpdate={(content) =>
                  handleUpdateSection("hardwareComponents", {
                    ...(techPack?.hardwareComponents || {}),
                    description: content.description,
                  })
                }
                isAiPromptOpen={isAIPromptOpen} // Boolean value
                setAiPromptOpen={setIsAIPromptOpen}
                industryBenchmark={industryBenchmarks["Hardware Components"]}
                isSelected={selectedSection === "Hardware Components"}
                onSelect={() => handleSectionSelect("Hardware Components")}
                renderContent={(content, isUpdating) => (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs">{content.description}</p>
                    </div>

                    {!isUpdating && (
                      <div className="flex flex-wrap gap-2">
                        {content?.hardware?.map(
                          (hardware: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {hardware}
                            </Badge>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              />
            )}

            {activeTab === "colors" && (
              <TechPackSection
                title="Colors"
                icon={<Palette className="h-5 w-5" />}
                hideTitle
                content={{
                  palette: [
                    ...(techPack?.colors?.primaryColors?.map((c: any) => ({
                      ...c,
                      type: "primary",
                    })) || []),
                    ...(techPack?.colors?.accentColors?.map((c: any) => ({
                      ...c,
                      type: "accent",
                    })) || []),
                  ],
                  notes: techPack?.colors?.styleNotes || "",
                  trendAlignment: techPack?.colors?.trendAlignment || "",
                }}
                isAiPromptOpen={isAIPromptOpen}
                setAiPromptOpen={setIsAIPromptOpen}
                onUpdate={(updatedContent) => {
                  const { palette, notes, trendAlignment } = updatedContent;

                  const primaryColors =
                    palette
                      ?.filter((c: any) => c.type === "primary")
                      ?.map((c: { type: string;[key: string]: any }) => {
                        const { type, ...rest } = c;
                        return rest;
                      }) || [];
                  const accentColors =
                    palette
                      ?.filter((c: any) => c.type === "accent")
                      ?.map((c: { type: string;[key: string]: any }) => {
                        const { type, ...rest } = c;
                        return rest;
                      }) || [];

                  handleUpdateSection("colors", {
                    primaryColors,
                    accentColors,
                    styleNotes: notes,
                    trendAlignment,
                  });
                }}
                industryBenchmark={industryBenchmarks["Colors"]}
                isSelected={selectedSection === "Colors"}
                onSelect={() => handleSectionSelect("Colors")}
                renderContent={(content, isUpdating) => (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                      {content.palette?.map((color: any, i: number) => (
                        <div
                          key={i}
                          className="flex flex-col items-center group"
                        >
                          <div
                            className="w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-md ring-1 ring-black/5 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: color.hex }}
                          />
                          <p className="text-xs font-semibold mt-2">
                            {color.name}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            {color.hex}
                          </p>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {color.type === "primary" ? "Primary" : "Accent"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {content?.notes && (
                      <div className="pt-3 border-t">
                        <h4 className="text-xs font-medium mb-1">
                          Style Notes
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {content.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              />
            )}

            {activeTab === "sizes" && (
              <TechPackSection
                title="Size Range"
                icon={<Ruler className="h-5 w-5" />}
                hideTitle
                content={{
                  description: techPack?.sizeRange?.gradingLogic,
                  sizes: techPack?.sizeRange?.sizes,
                }}
                onUpdate={(content) =>
                  handleUpdateSection("sizeRange", {
                    sizes: content.sizes,
                    gradingLogic: content.description, // Uncomment this line
                  })
                }
                isAiPromptOpen={isAIPromptOpen} // Boolean value
                setAiPromptOpen={setIsAIPromptOpen}
                industryBenchmark={industryBenchmarks["Size Range"]}
                isSelected={selectedSection === "Size Range"}
                onSelect={() => handleSectionSelect("Size Range")}
                renderContent={(content, isUpdating) => (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium mb-1">Sizing Notes</h4>
                      <p className="text-xs">{content.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {content.sizes?.map((size: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              />
            )}

            {activeTab === "packaging" && (
              <TechPackSection
                title="Packaging"
                icon={<Package className="h-5 w-5" />}
                hideTitle
                content={{
                  description: techPack?.packaging?.description,
                  packagingDetails: techPack?.packaging?.packagingDetails,
                  notes: techPack?.packaging?.notes,
                }}
                onUpdate={(content) =>
                  handleUpdateSection("packaging", content)
                }
                industryBenchmark={industryBenchmarks["Packaging"]}
                isSelected={selectedSection === "Packaging"}
                onSelect={() => handleSectionSelect("Packaging")}
                isAiPromptOpen={isAIPromptOpen}
                setAiPromptOpen={setIsAIPromptOpen}
                renderContent={(content, isUpdating) => (
                  <div className="space-y-3">
                    {content.description && (
                      <div>
                        <h4 className="text-xs font-medium mb-1">
                          Description
                        </h4>
                        <p className="text-xs text-gray-700">
                          {content.description}
                        </p>
                      </div>
                    )}

                    {content.packagingDetails && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(content.packagingDetails).map(
                          ([key, value]: [string, unknown]) => (
                            <div key={key} className="space-y-1">
                              <h4 className="text-xs font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1")}
                              </h4>
                              <p className="text-xs text-gray-700">
                                {renderValue(value)}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {content.notes && (
                      <div>
                        <h4 className="text-xs font-medium mb-1">Notes</h4>
                        <p className="text-xs text-gray-700">{content.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              />
            )}

            {activeTab === "care" && (
              <TechPackSection
                title="Care Instructions"
                icon={<ClipboardList className="h-5 w-5" />}
                hideTitle
                content={techPack?.careInstructions}
                onUpdate={(content) =>
                  handleUpdateSection("careInstructions", content)
                }
                industryBenchmark={industryBenchmarks["Care Instructions"]}
                isSelected={selectedSection === "Care Instructions"}
                onSelect={() => handleSectionSelect("Care Instructions")}
                renderContent={(content, isUpdating) => (
                  <p className="text-xs">{content}</p>
                )}
                isAiPromptOpen={isAIPromptOpen}
                setAiPromptOpen={setIsAIPromptOpen}
              />
            )}
            {/* 
            {activeTab === "quality" && (
              <TechPackSection
                title="Quality Standards"
                icon={<ShieldCheck className="h-5 w-5" />}
                hideTitle
                content={techPack?.qualityStandards}
                onUpdate={(content) =>
                  handleUpdateSection("qualityStandards", content)
                }
                industryBenchmark={industryBenchmarks["Quality Standards"]}
                isSelected={selectedSection === "Quality Standards"}
                onSelect={() => handleSectionSelect("Quality Standards")}
                renderContent={(content, isUpdating) => (
                  <p className="text-xs">{content}</p>
                )}
                isAiPromptOpen={isAIPromptOpen}
                setAiPromptOpen={setIsAIPromptOpen}
              />
            )} */}

            {/* Legacy TechPackSection for production removed - now using consolidated ProductionSection */}

            {/* Mobile bottom spacing to prevent content from being hidden behind fixed nav */}
            <div className="h-2 md:hidden" aria-hidden="true" />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40">
        <div className="flex items-center justify-around h-16">
          {mobileMainItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          {/* More menu button */}
          <div className="relative flex-1 h-full">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors",
                isMobileMenuOpen ||
                  mobileMoreItems.some((item) => item.id === activeTab)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>

            {/* More menu popup */}
            {isMobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-background border rounded-lg shadow-lg z-40 overflow-hidden">
                  {mobileMoreItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* OLD AI Assistant - Hidden in favor of new AgenticChatPanel */}
      {/*
      <div className="fixed bottom-20 md:bottom-6 right-4 md:left-6 z-50">
        <Button
          onClick={() => setIsAIPromptOpen(true)}
          className="rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-black text-white"
          size="lg"
        >
          <Bot className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>

      {isAIPromptOpen && (
        <div className="fixed bottom-36 md:bottom-24 left-4 right-4 md:left-6 md:right-auto md:w-96 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-zinc-900" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAIPromptOpen(false)}
                className="h-8 w-8 p-0 text-black"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <UnifiedPromptInterface
              sections={sections}
              selectedSection={selectedSection}
              onSectionSelect={handleSectionSelect}
              onPromptSubmit={handlePromptSubmit}
            />
          </div>
        </div>
      )}
      */}

      {/* Global Image Viewer Modal with zoom controls */}
      <ImageViewerModal />

      {/* Tech File Guide Dialog - Comprehensive analysis view */}
      <Dialog
        open={!!selectedTechFileGuide}
        onOpenChange={(open) => !open && setSelectedTechFileGuide(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedTechFileGuide?.file_type === "component"
                ? `Component Guide - ${selectedTechFileGuide?.file_category || selectedTechFileGuide?.analysis_data?.component_name || "Component"}`
                : selectedTechFileGuide?.file_type === "base_view"
                  ? `Base View Guide - ${selectedTechFileGuide?.view_type?.replace("_", " ")} View`
                  : selectedTechFileGuide?.file_type === "closeup"
                    ? `Close-Up Guide - ${selectedTechFileGuide?.file_category || "Detail"}`
                    : selectedTechFileGuide?.file_type === "sketch"
                      ? `Technical Sketch Guide - ${selectedTechFileGuide?.view_type?.replace("_", " ")} View`
                      : "Tech File Guide"}
            </DialogTitle>
          </DialogHeader>

          {selectedTechFileGuide && (
            <div className="space-y-6 mt-4">
              {/* Component Identification Section (supports both direct and nested component_guide) */}
              {(selectedTechFileGuide.analysis_data?.component_identification ||
                selectedTechFileGuide.analysis_data?.component_guide
                  ?.component_identification) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Component Identification
                    </h3>
                    <Card className="p-4">
                      {(() => {
                        const ci =
                          selectedTechFileGuide.analysis_data?.component_guide
                            ?.component_identification ||
                          selectedTechFileGuide.analysis_data
                            ?.component_identification;
                        return (
                          <div className="grid grid-cols-2 gap-4">
                            {ci?.component_name && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Component Name
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white font-medium">
                                  {ci.component_name}
                                </p>
                              </div>
                            )}
                            {ci?.component_type && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Type
                                </p>
                                <Badge className="text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                  {ci.component_type}
                                </Badge>
                              </div>
                            )}
                            {ci?.primary_function && (
                              <div className="col-span-2">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Primary Function
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {ci.primary_function}
                                </p>
                              </div>
                            )}
                            {ci?.location_on_product && (
                              <div className="col-span-2">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Location on Product
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {ci.location_on_product}
                                </p>
                              </div>
                            )}
                            {ci?.visual_description && (
                              <div className="col-span-2">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Visual Description
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {ci.visual_description}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}

              {/* Material Specifications Section (supports both direct and nested component_guide) */}
              {(selectedTechFileGuide.analysis_data?.material_specifications ||
                selectedTechFileGuide.analysis_data?.component_guide
                  ?.material_specifications) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Material Specifications
                    </h3>
                    <Card className="p-4">
                      {(() => {
                        const ms =
                          selectedTechFileGuide.analysis_data?.component_guide
                            ?.material_specifications ||
                          selectedTechFileGuide.analysis_data
                            ?.material_specifications;
                        return (
                          <div className="space-y-3">
                            {ms?.material_type && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Material Type
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white font-medium">
                                  {ms.material_type}
                                </p>
                              </div>
                            )}
                            {ms?.composition && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Composition
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {ms.composition}
                                </p>
                              </div>
                            )}
                            {(ms?.quality_grade || ms?.material_grade) && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Material Grade
                                </p>
                                <Badge variant="outline" className="text-[10px]">
                                  {ms.material_grade || ms.quality_grade}
                                </Badge>
                              </div>
                            )}
                            {ms?.texture && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Texture
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {ms.texture}
                                </p>
                              </div>
                            )}
                            {/* Color with swatch */}
                            {ms?.color && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Color
                                </p>
                                <div className="flex items-center gap-2">
                                  {ms.color.hex && (
                                    <div
                                      className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600"
                                      style={{ backgroundColor: ms.color.hex }}
                                    />
                                  )}
                                  <div>
                                    <p className="text-xs text-gray-900 dark:text-white font-medium">
                                      {ms.color.name}
                                    </p>
                                    {ms.color.hex && (
                                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                        {ms.color.hex}
                                      </p>
                                    )}
                                    {ms.color.pantone && (
                                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {ms.color.pantone}
                                      </p>
                                    )}
                                  </div>
                                  {ms.color.finish && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] ml-auto"
                                    >
                                      {ms.color.finish}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {ms?.dimensions && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Dimensions
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {ms.dimensions.width && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px]"
                                    >
                                      Width: {ms.dimensions.width}
                                    </Badge>
                                  )}
                                  {ms.dimensions.length && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px]"
                                    >
                                      Length: {ms.dimensions.length}
                                    </Badge>
                                  )}
                                  {ms.dimensions.height && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px]"
                                    >
                                      Height: {ms.dimensions.height}
                                    </Badge>
                                  )}
                                  {ms.dimensions.thickness && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px]"
                                    >
                                      Thickness: {ms.dimensions.thickness}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {ms?.weight_thickness && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Weight/Thickness
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {ms.weight_thickness}
                                </p>
                              </div>
                            )}
                            {(ms?.finish || ms?.color_details) &&
                              !ms?.color?.finish && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                    Finish
                                  </p>
                                  <p className="text-xs text-gray-700 dark:text-gray-300">
                                    {ms.finish || ms.color_details}
                                  </p>
                                </div>
                              )}
                            {ms?.weight_gsm && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Weight (GSM)
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white font-medium">
                                  {ms.weight_gsm}
                                </p>
                              </div>
                            )}
                            {/* Physical Properties */}
                            {ms?.physical_properties && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                  Physical Properties
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {ms.physical_properties.durability && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                        Durability:
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        {ms.physical_properties.durability}
                                      </Badge>
                                    </div>
                                  )}
                                  {ms.physical_properties.flexibility && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                        Flexibility:
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        {ms.physical_properties.flexibility}
                                      </Badge>
                                    </div>
                                  )}
                                  {ms.physical_properties.water_resistance !==
                                    undefined && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                          Water Resistant:
                                        </span>
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          {ms.physical_properties.water_resistance
                                            ? "Yes"
                                            : "No"}
                                        </Badge>
                                      </div>
                                    )}
                                  {ms.physical_properties.stretch && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                        Stretch:
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        {ms.physical_properties.stretch}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {ms?.properties && ms.properties.length > 0 && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                  Properties
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {ms.properties.map(
                                    (prop: string, idx: number) => (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        {prop}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}

              {/* Sourcing Information Section (supports both direct and nested component_guide) */}
              {(selectedTechFileGuide.analysis_data?.sourcing_information ||
                selectedTechFileGuide.analysis_data?.component_guide
                  ?.sourcing_information) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Sourcing Information
                    </h3>
                    <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                      {(() => {
                        const si =
                          selectedTechFileGuide.analysis_data?.component_guide
                            ?.sourcing_information ||
                          selectedTechFileGuide.analysis_data
                            ?.sourcing_information;
                        return (
                          <div className="space-y-3">
                            {si?.supplier_type && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Supplier Type
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white">
                                  {si.supplier_type}
                                </p>
                              </div>
                            )}
                            {si?.sourcing_difficulty && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Sourcing Difficulty
                                </p>
                                <Badge variant="outline" className="text-[10px]">
                                  {si.sourcing_difficulty}
                                </Badge>
                              </div>
                            )}
                            {si?.market_availability && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Market Availability
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {si.market_availability}
                                </p>
                              </div>
                            )}
                            {(si?.estimated_cost || si?.estimated_unit_cost) && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Estimated Unit Cost
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white font-medium">
                                  {si.estimated_unit_cost || si.estimated_cost}
                                </p>
                              </div>
                            )}
                            {si?.minimum_order_quantity && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Minimum Order Quantity
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {si.minimum_order_quantity}
                                </p>
                              </div>
                            )}
                            {si?.lead_time && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Lead Time
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {si.lead_time}
                                </p>
                              </div>
                            )}
                            {si?.supplier_specifications && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Supplier Specifications
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {si.supplier_specifications}
                                </p>
                              </div>
                            )}
                            {si?.alternative_suppliers &&
                              si.alternative_suppliers.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                    Alternative Suppliers
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {si.alternative_suppliers.map(
                                      (supplier: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          {supplier}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {si?.certifications_required &&
                              si.certifications_required.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                    Required Certifications
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {si.certifications_required.map(
                                      (cert: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-[10px]"
                                        >
                                          {cert}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {si?.alternatives && si.alternatives.length > 0 && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                  Alternatives
                                </p>
                                <ul className="space-y-1">
                                  {si.alternatives.map(
                                    (alt: string, idx: number) => (
                                      <li
                                        key={idx}
                                        className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"
                                      >
                                        <span className="text-gray-600 dark:text-gray-400 mt-0.5">
                                          •
                                        </span>
                                        <span>{alt}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}

              {/* Quality Control Section (supports both direct and nested component_guide) */}
              {(selectedTechFileGuide.analysis_data?.quality_control ||
                selectedTechFileGuide.analysis_data?.component_guide
                  ?.quality_control) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Quality Control
                    </h3>
                    <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                      {(() => {
                        const qc =
                          selectedTechFileGuide.analysis_data?.component_guide
                            ?.quality_control ||
                          selectedTechFileGuide.analysis_data?.quality_control;
                        return (
                          <div className="space-y-3">
                            {qc?.inspection_points &&
                              qc.inspection_points.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                    Inspection Points
                                  </p>
                                  <ul className="space-y-2">
                                    {qc.inspection_points.map(
                                      (point: any, idx: number) => (
                                        <li
                                          key={idx}
                                          className="text-xs text-gray-800 dark:text-gray-200"
                                        >
                                          <div className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                              <p className="font-medium">
                                                {point.checkpoint ||
                                                  point.method ||
                                                  "Inspection Point"}
                                              </p>
                                              {point.method &&
                                                point.checkpoint && (
                                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Method: {point.method}
                                                  </p>
                                                )}
                                              {point.acceptance_criteria && (
                                                <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                                                  {point.acceptance_criteria}
                                                </p>
                                              )}
                                              {point.critical && (
                                                <Badge
                                                  variant="outline"
                                                  className="text-[10px] mt-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                                >
                                                  Critical
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            {qc?.common_defects &&
                              qc.common_defects.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                    Common Defects to Check
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {qc.common_defects.map(
                                      (defect: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                                        >
                                          {defect}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {qc?.acceptance_criteria && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Acceptance Criteria
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {qc.acceptance_criteria}
                                </p>
                              </div>
                            )}
                            {qc?.testing_requirements &&
                              qc.testing_requirements.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                    Testing Requirements
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {qc.testing_requirements.map(
                                      (test: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-[10px]"
                                        >
                                          {test}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}

              {/* Manufacturing Notes (from guide structure) */}
              {selectedTechFileGuide.analysis_data?.manufacturing_notes &&
                Array.isArray(
                  selectedTechFileGuide.analysis_data.manufacturing_notes
                ) &&
                selectedTechFileGuide.analysis_data.manufacturing_notes.length >
                0 &&
                !selectedTechFileGuide.analysis_data?.summary
                  ?.manufacturingNotes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Manufacturing Notes
                    </h3>
                    <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                      <ul className="space-y-2">
                        {selectedTechFileGuide.analysis_data.manufacturing_notes.map(
                          (note: string, idx: number) => (
                            <li
                              key={idx}
                              className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2"
                            >
                              <span className="text-gray-600 dark:text-gray-400 mt-0.5">
                                •
                              </span>
                              <span>{note}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </Card>
                  </div>
                )}

              {/* Technical Details Section (from component_guide) */}
              {selectedTechFileGuide.analysis_data?.component_guide
                ?.technical_details && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Technical Details
                    </h3>
                    <Card className="p-4">
                      {(() => {
                        const td =
                          selectedTechFileGuide.analysis_data.component_guide
                            .technical_details;
                        return (
                          <div className="space-y-3">
                            {td.construction_method && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Construction Method
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white font-medium">
                                  {td.construction_method}
                                </p>
                              </div>
                            )}
                            {td.finishing && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Finishing
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {td.finishing}
                                </p>
                              </div>
                            )}
                            {td.measurements && td.measurements.length > 0 && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                  Measurements
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {td.measurements.map((m: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                                    >
                                      <span className="text-xs text-gray-700 dark:text-gray-300">
                                        {m.dimension}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          {m.value}
                                        </Badge>
                                        {m.tolerance && (
                                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                            {m.tolerance}
                                          </span>
                                        )}
                                        {m.critical && (
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                          >
                                            Critical
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {td.special_features &&
                              td.special_features.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                    Special Features
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {td.special_features.map(
                                      (feature: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          {feature}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}

              {/* Cost Analysis Section (from component_guide) */}
              {selectedTechFileGuide.analysis_data?.component_guide
                ?.cost_analysis && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Cost Analysis
                    </h3>
                    <Card className="p-4">
                      {(() => {
                        const ca =
                          selectedTechFileGuide.analysis_data.component_guide
                            .cost_analysis;
                        return (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              {ca.material_cost && (
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Material Cost
                                  </p>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {ca.material_cost}
                                  </p>
                                </div>
                              )}
                              {ca.processing_cost && (
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Processing Cost
                                  </p>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {ca.processing_cost}
                                  </p>
                                </div>
                              )}
                              {ca.total_estimated_cost && (
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400">
                                    Total Estimated
                                  </p>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {ca.total_estimated_cost}
                                  </p>
                                </div>
                              )}
                            </div>
                            {ca.cost_optimization_notes && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Cost Optimization Notes
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {ca.cost_optimization_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}

              {/* Material Alternatives Section (from component_guide) */}
              {selectedTechFileGuide.analysis_data?.component_guide
                ?.alternatives &&
                selectedTechFileGuide.analysis_data.component_guide.alternatives
                  .length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Material Alternatives
                    </h3>
                    <div className="space-y-2">
                      {selectedTechFileGuide.analysis_data.component_guide.alternatives.map(
                        (alt: any, idx: number) => (
                          <Card key={idx} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {alt.alternative_material}
                              </p>
                              {alt.cost_impact && (
                                <Badge
                                  variant={
                                    alt.cost_impact.startsWith("-")
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="text-[10px]"
                                >
                                  {alt.cost_impact}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              {alt.availability && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Availability:{" "}
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {alt.availability}
                                  </span>
                                </div>
                              )}
                              {alt.quality_impact && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Quality:{" "}
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {alt.quality_impact}
                                  </span>
                                </div>
                              )}
                            </div>
                            {alt.recommendation && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 italic">
                                {alt.recommendation}
                              </p>
                            )}
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Manufacturing Instructions Section (from component_guide) */}
              {selectedTechFileGuide.analysis_data?.component_guide
                ?.manufacturing_instructions && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Manufacturing Instructions
                    </h3>
                    <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                      {(() => {
                        const mi =
                          selectedTechFileGuide.analysis_data.component_guide
                            .manufacturing_instructions;
                        return (
                          <div className="space-y-3">
                            {mi.preparation_steps &&
                              mi.preparation_steps.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                                    Preparation Steps
                                  </p>
                                  <ol className="space-y-1">
                                    {mi.preparation_steps.map(
                                      (step: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2"
                                        >
                                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                                            {idx + 1}.
                                          </span>
                                          <span>{step}</span>
                                        </li>
                                      )
                                    )}
                                  </ol>
                                </div>
                              )}
                            {mi.assembly_notes &&
                              mi.assembly_notes.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                                    Assembly Notes
                                  </p>
                                  <ul className="space-y-1">
                                    {mi.assembly_notes.map(
                                      (note: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2"
                                        >
                                          <span className="text-amber-600 dark:text-amber-400">
                                            •
                                          </span>
                                          <span>{note}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            {mi.tools_required &&
                              mi.tools_required.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                                    Tools Required
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {mi.tools_required.map(
                                      (tool: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          {tool}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {mi.handling_precautions &&
                              mi.handling_precautions.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                                    Handling Precautions
                                  </p>
                                  <ul className="space-y-1">
                                    {mi.handling_precautions.map(
                                      (precaution: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2"
                                        >
                                          <span className="text-amber-600 dark:text-amber-400">
                                            ⚠
                                          </span>
                                          <span>{precaution}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            {mi.storage_requirements &&
                              mi.storage_requirements.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                                    Storage Requirements
                                  </p>
                                  <ul className="space-y-1">
                                    {mi.storage_requirements.map(
                                      (req: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2"
                                        >
                                          <span className="text-amber-600 dark:text-amber-400">
                                            •
                                          </span>
                                          <span>{req}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}

              {/* Sustainability Notes Section (from component_guide) */}
              {selectedTechFileGuide.analysis_data?.component_guide
                ?.sustainability_notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Sustainability
                    </h3>
                    <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                      {(() => {
                        const sn =
                          selectedTechFileGuide.analysis_data.component_guide
                            .sustainability_notes;
                        return (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {sn.eco_friendly && (
                                <Badge className="text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                                  Eco-Friendly
                                </Badge>
                              )}
                              {sn.recyclable && (
                                <Badge className="text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                                  Recyclable
                                </Badge>
                              )}
                            </div>
                            {sn.environmental_impact && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Environmental Impact
                                </p>
                                <Badge variant="outline" className="text-[10px]">
                                  {sn.environmental_impact}
                                </Badge>
                              </div>
                            )}
                            {sn.certifications &&
                              sn.certifications.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                    Certifications
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {sn.certifications.map(
                                      (cert: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          {cert}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}

              {/* Visual Reference Notes Section (from component_guide) */}
              {selectedTechFileGuide.analysis_data?.component_guide
                ?.visual_reference_notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Visual Reference Notes
                    </h3>
                    <Card className="p-4">
                      {(() => {
                        const vr =
                          selectedTechFileGuide.analysis_data.component_guide
                            .visual_reference_notes;
                        return (
                          <div className="space-y-3">
                            {vr.angle_perspective && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Angle/Perspective
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {vr.angle_perspective}
                                </p>
                              </div>
                            )}
                            {vr.scale_reference && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Scale Reference
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {vr.scale_reference}
                                </p>
                              </div>
                            )}
                            {vr.color_accuracy && (
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                  Color Accuracy
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {vr.color_accuracy}
                                </p>
                              </div>
                            )}
                            {vr.key_visual_indicators &&
                              vr.key_visual_indicators.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                    Key Visual Indicators
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {vr.key_visual_indicators.map(
                                      (indicator: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          {indicator}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })()}
                    </Card>
                  </div>
                )}

              {/* Overview Section */}
              {(selectedTechFileGuide.analysis_data?.summary?.overview ||
                selectedTechFileGuide.analysis_data?.description ||
                (selectedTechFileGuide.analysis_data?.primary_function &&
                  !selectedTechFileGuide.analysis_data
                    ?.component_identification)) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Overview
                    </h3>
                    <Card className="p-4">
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedTechFileGuide.analysis_data?.summary?.overview ||
                          selectedTechFileGuide.analysis_data?.description ||
                          selectedTechFileGuide.analysis_data?.primary_function}
                      </p>
                    </Card>
                  </div>
                )}

              {/* Material Details (from close-up summary structure) */}
              {selectedTechFileGuide.analysis_data?.summary?.materialDetails &&
                selectedTechFileGuide.analysis_data.summary.materialDetails
                  .length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Material Details
                    </h3>
                    <div className="space-y-3">
                      {selectedTechFileGuide.analysis_data.summary.materialDetails.map(
                        (material: any, idx: number) => (
                          <Card key={idx} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {material.material}
                              </p>
                              {material.finish && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {material.finish}
                                </Badge>
                              )}
                            </div>
                            {material.quality && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                {material.quality}
                              </p>
                            )}
                            {material.properties &&
                              material.properties.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {material.properties.map(
                                    (prop: string, propIdx: number) => (
                                      <Badge
                                        key={propIdx}
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        {prop}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              )}
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Construction Techniques (from close-up summary structure) */}
              {selectedTechFileGuide.analysis_data?.summary
                ?.constructionTechniques &&
                selectedTechFileGuide.analysis_data.summary
                  .constructionTechniques.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Construction Techniques
                    </h3>
                    <div className="space-y-3">
                      {selectedTechFileGuide.analysis_data.summary.constructionTechniques.map(
                        (technique: any, idx: number) => (
                          <Card key={idx} className="p-4">
                            <p className="text-xs text-gray-900 dark:text-white font-medium mb-1">
                              {technique.technique}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                              {technique.description}
                            </p>
                            {technique.specifications && (
                              <Badge variant="outline" className="text-[10px]">
                                {technique.specifications}
                              </Badge>
                            )}
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Design Elements (from close-up summary structure) */}
              {selectedTechFileGuide.analysis_data?.summary?.designElements &&
                selectedTechFileGuide.analysis_data.summary.designElements
                  .length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Design Elements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTechFileGuide.analysis_data.summary.designElements.map(
                        (element: any, idx: number) => (
                          <Card key={idx} className="p-3">
                            <p className="text-xs text-gray-900 dark:text-white font-medium mb-1">
                              {element.element}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                              {element.description}
                            </p>
                            {element.purpose && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {element.purpose}
                              </p>
                            )}
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Color & Finish (from close-up summary structure) */}
              {selectedTechFileGuide.analysis_data?.summary?.colorAndFinish && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Color & Finish
                  </h3>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {selectedTechFileGuide.analysis_data.summary
                        .colorAndFinish.hex && (
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-700"
                            style={{
                              backgroundColor:
                                selectedTechFileGuide.analysis_data.summary
                                  .colorAndFinish.hex,
                            }}
                          />
                        )}
                      <div className="flex-1">
                        <p className="text-xs text-gray-900 dark:text-white font-medium">
                          {
                            selectedTechFileGuide.analysis_data.summary
                              .colorAndFinish.primaryColor
                          }
                        </p>
                        {selectedTechFileGuide.analysis_data.summary
                          .colorAndFinish.hex && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                              {
                                selectedTechFileGuide.analysis_data.summary
                                  .colorAndFinish.hex
                              }
                            </p>
                          )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedTechFileGuide.analysis_data.summary
                        .colorAndFinish.texture && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                              Texture
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {
                                selectedTechFileGuide.analysis_data.summary
                                  .colorAndFinish.texture
                              }
                            </p>
                          </div>
                        )}
                      {selectedTechFileGuide.analysis_data.summary
                        .colorAndFinish.sheen && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                              Sheen
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {
                                selectedTechFileGuide.analysis_data.summary
                                  .colorAndFinish.sheen
                              }
                            </p>
                          </div>
                        )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Quality Indicators (from close-up summary structure) */}
              {selectedTechFileGuide.analysis_data?.summary
                ?.qualityIndicators &&
                selectedTechFileGuide.analysis_data.summary.qualityIndicators
                  .length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Quality Indicators
                    </h3>
                    <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                      <ul className="space-y-2">
                        {selectedTechFileGuide.analysis_data.summary.qualityIndicators.map(
                          (indicator: string, idx: number) => (
                            <li
                              key={idx}
                              className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                              <span>{indicator}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </Card>
                  </div>
                )}

              {/* Key Measurements Section */}
              {((selectedTechFileGuide.analysis_data?.measurements &&
                Object.keys(selectedTechFileGuide.analysis_data.measurements)
                  .length > 0) ||
                (selectedTechFileGuide.analysis_data?.dimensions_estimated &&
                  Object.keys(
                    selectedTechFileGuide.analysis_data.dimensions_estimated
                  ).length > 0) ||
                (selectedTechFileGuide.analysis_data?.summary?.measurements &&
                  selectedTechFileGuide.analysis_data.summary.measurements
                    .length > 0)) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Key Measurements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* From summary.measurements (sketch format) */}
                      {selectedTechFileGuide.analysis_data?.summary?.measurements?.map(
                        (measurement: any, idx: number) => (
                          <Card key={`summary-${idx}`} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs text-gray-900 dark:text-white font-medium">
                                  {measurement.name}
                                </p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                  {measurement.location}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-[10px]"
                              >
                                {measurement.value}
                              </Badge>
                            </div>
                          </Card>
                        )
                      )}
                      {/* From measurements object */}
                      {selectedTechFileGuide.analysis_data?.measurements &&
                        Object.entries(
                          selectedTechFileGuide.analysis_data.measurements
                        ).map(([key, value]: [string, any]) => (
                          <Card key={`meas-${key}`} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs text-gray-900 dark:text-white font-medium capitalize">
                                  {key.replace(/_/g, " ")}
                                </p>
                                {value?.measurement_point && (
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                    {value.measurement_point}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-[10px]"
                              >
                                {typeof value === "object"
                                  ? value.value || JSON.stringify(value)
                                  : value}
                                {value?.tolerance && (
                                  <span className="ml-1">{value.tolerance}</span>
                                )}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      {/* From dimensions_estimated */}
                      {selectedTechFileGuide.analysis_data
                        ?.dimensions_estimated &&
                        Object.entries(
                          selectedTechFileGuide.analysis_data.dimensions_estimated
                        ).map(([key, dimension]: [string, any]) => (
                          <Card key={`dim-${key}`} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs text-gray-900 dark:text-white font-medium capitalize">
                                  {key.replace(/_/g, " ")}
                                </p>
                                {dimension?.measurement_point && (
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                    {dimension.measurement_point}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-[10px]"
                              >
                                {dimension.value}
                                {dimension?.tolerance && (
                                  <span className="ml-1">
                                    {dimension.tolerance}
                                  </span>
                                )}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}

              {/* Materials & Fabrics Section */}
              {((selectedTechFileGuide.analysis_data?.materials_detected &&
                selectedTechFileGuide.analysis_data.materials_detected.length >
                0) ||
                selectedTechFileGuide.analysis_data?.material ||
                (selectedTechFileGuide.analysis_data?.summary?.materials &&
                  selectedTechFileGuide.analysis_data.summary.materials.length >
                  0)) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Materials & Fabrics
                    </h3>
                    <div className="space-y-3">
                      {/* From summary.materials (sketch format) */}
                      {selectedTechFileGuide.analysis_data?.summary?.materials?.map(
                        (material: any, idx: number) => (
                          <Card key={`sum-mat-${idx}`} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {material.type}
                              </p>
                              {material.percentage && (
                                <Badge variant="outline" className="text-[10px]">
                                  {material.percentage}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                              {material.location}
                            </p>
                            {material.properties &&
                              material.properties.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {material.properties.map(
                                    (prop: string, propIdx: number) => (
                                      <Badge
                                        key={propIdx}
                                        variant="secondary"
                                        className="text-[10px]"
                                      >
                                        {prop}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              )}
                          </Card>
                        )
                      )}
                      {/* From materials_detected */}
                      {selectedTechFileGuide.analysis_data?.materials_detected?.map(
                        (mat: any, idx: number) => (
                          <Card key={`det-mat-${idx}`} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {mat.material_type || mat.component}
                              </p>
                              {mat.percentage && (
                                <Badge variant="outline" className="text-[10px]">
                                  {mat.percentage}
                                </Badge>
                              )}
                            </div>
                            {mat.component &&
                              mat.component !== mat.material_type && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                  {mat.component}
                                </p>
                              )}
                            <div className="flex flex-wrap gap-1">
                              {mat.spec && mat.spec !== "Not specified" && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {mat.spec}
                                </Badge>
                              )}
                              {mat.finish && mat.finish !== "Not specified" && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {mat.finish}
                                </Badge>
                              )}
                              {mat.estimated_weight && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {mat.estimated_weight}
                                </Badge>
                              )}
                            </div>
                          </Card>
                        )
                      )}
                      {/* Simple material field */}
                      {selectedTechFileGuide.analysis_data?.material &&
                        !selectedTechFileGuide.analysis_data
                          ?.materials_detected && (
                          <Card className="p-4">
                            <p className="text-xs text-gray-900 dark:text-white font-medium">
                              {selectedTechFileGuide.analysis_data.material}
                            </p>
                            {selectedTechFileGuide.analysis_data?.composition && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                {selectedTechFileGuide.analysis_data.composition}
                              </p>
                            )}
                          </Card>
                        )}
                    </div>
                  </div>
                )}

              {/* Construction Details Section */}
              {((selectedTechFileGuide.analysis_data?.construction_details &&
                (Array.isArray(
                  selectedTechFileGuide.analysis_data.construction_details
                )
                  ? selectedTechFileGuide.analysis_data.construction_details
                    .length > 0
                  : Object.keys(
                    selectedTechFileGuide.analysis_data.construction_details
                  ).length > 0)) ||
                (selectedTechFileGuide.analysis_data?.summary?.construction &&
                  selectedTechFileGuide.analysis_data.summary.construction
                    .length > 0)) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Construction Details
                    </h3>
                    <div className="space-y-3">
                      {/* From summary.construction (sketch format) */}
                      {selectedTechFileGuide.analysis_data?.summary?.construction?.map(
                        (detail: any, idx: number) => (
                          <Card key={`sum-con-${idx}`} className="p-4">
                            <p className="text-xs text-gray-900 dark:text-white font-medium mb-1">
                              {detail.feature}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                              {detail.details}
                            </p>
                            <Badge variant="outline" className="text-[10px]">
                              {detail.technique}
                            </Badge>
                          </Card>
                        )
                      )}
                      {/* From construction_details (array format) */}
                      {Array.isArray(
                        selectedTechFileGuide.analysis_data?.construction_details
                      ) &&
                        selectedTechFileGuide.analysis_data.construction_details.map(
                          (detail: any, idx: number) => (
                            <Card key={`arr-con-${idx}`} className="p-4">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {typeof detail === "string"
                                      ? detail
                                      : detail.feature ||
                                      detail.description ||
                                      detail.name}
                                  </p>
                                  {detail.location && (
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                      {detail.location}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          )
                        )}
                      {/* From construction_details (object format) */}
                      {selectedTechFileGuide.analysis_data
                        ?.construction_details &&
                        !Array.isArray(
                          selectedTechFileGuide.analysis_data.construction_details
                        ) && (
                          <Card className="p-4 space-y-3">
                            {selectedTechFileGuide.analysis_data
                              .construction_details.construction_method &&
                              selectedTechFileGuide.analysis_data
                                .construction_details.construction_method !==
                              "Unknown" && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Construction Method
                                  </p>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {
                                      selectedTechFileGuide.analysis_data
                                        .construction_details.construction_method
                                    }
                                  </p>
                                </div>
                              )}
                            {selectedTechFileGuide.analysis_data
                              .construction_details.seam_type &&
                              selectedTechFileGuide.analysis_data
                                .construction_details.seam_type !==
                              "Not visible" && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Seam Type
                                  </p>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {
                                      selectedTechFileGuide.analysis_data
                                        .construction_details.seam_type
                                    }
                                  </p>
                                </div>
                              )}
                            {selectedTechFileGuide.analysis_data
                              .construction_details.stitching_details &&
                              selectedTechFileGuide.analysis_data
                                .construction_details.stitching_details !==
                              "Not visible" && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Stitching Details
                                  </p>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {
                                      selectedTechFileGuide.analysis_data
                                        .construction_details.stitching_details
                                    }
                                  </p>
                                </div>
                              )}
                            {selectedTechFileGuide.analysis_data
                              .construction_details.edge_finishing &&
                              selectedTechFileGuide.analysis_data
                                .construction_details.edge_finishing !==
                              "Not visible" && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Edge Finishing
                                  </p>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {
                                      selectedTechFileGuide.analysis_data
                                        .construction_details.edge_finishing
                                    }
                                  </p>
                                </div>
                              )}
                            {selectedTechFileGuide.analysis_data
                              .construction_details.reinforcement &&
                              selectedTechFileGuide.analysis_data
                                .construction_details.reinforcement !==
                              "Not visible" && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Reinforcement
                                  </p>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {
                                      selectedTechFileGuide.analysis_data
                                        .construction_details.reinforcement
                                    }
                                  </p>
                                </div>
                              )}
                            {selectedTechFileGuide.analysis_data
                              .construction_details.special_features &&
                              selectedTechFileGuide.analysis_data
                                .construction_details.special_features.length >
                              0 && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                    Special Features
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedTechFileGuide.analysis_data.construction_details.special_features.map(
                                      (feature: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[10px]"
                                        >
                                          {feature}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </Card>
                        )}
                    </div>
                  </div>
                )}

              {/* Design Features Section */}
              {((selectedTechFileGuide.analysis_data?.design_elements &&
                Object.keys(selectedTechFileGuide.analysis_data.design_elements)
                  .length > 0) ||
                (selectedTechFileGuide.analysis_data?.summary?.designFeatures &&
                  selectedTechFileGuide.analysis_data.summary.designFeatures
                    .length > 0) ||
                (selectedTechFileGuide.analysis_data?.key_features &&
                  selectedTechFileGuide.analysis_data.key_features.length >
                  0)) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Design Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* From summary.designFeatures */}
                      {selectedTechFileGuide.analysis_data?.summary?.designFeatures?.map(
                        (feature: any, idx: number) => (
                          <Card key={`des-${idx}`} className="p-3">
                            <p className="text-xs text-gray-900 dark:text-white font-medium mb-1">
                              {feature.name}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                              {feature.description}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {feature.location}
                            </p>
                          </Card>
                        )
                      )}
                      {/* From design_elements */}
                      {selectedTechFileGuide.analysis_data?.design_elements &&
                        Object.entries(
                          selectedTechFileGuide.analysis_data.design_elements
                        ).map(([key, value]: [string, any]) => (
                          <Card key={`elem-${key}`} className="p-3">
                            <p className="text-xs text-gray-900 dark:text-white font-medium mb-1 capitalize">
                              {key.replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {typeof value === "string"
                                ? value
                                : JSON.stringify(value)}
                            </p>
                          </Card>
                        ))}
                      {/* From key_features */}
                      {selectedTechFileGuide.analysis_data?.key_features?.map(
                        (feature: string, idx: number) => (
                          <Card key={`key-${idx}`} className="p-3">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {feature}
                            </p>
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Colors & Patterns Section */}
              {((selectedTechFileGuide.analysis_data?.colors_and_patterns &&
                (selectedTechFileGuide.analysis_data.colors_and_patterns
                  .primary_color ||
                  (selectedTechFileGuide.analysis_data.colors_and_patterns
                    .secondary_colors &&
                    selectedTechFileGuide.analysis_data.colors_and_patterns
                      .secondary_colors.length > 0))) ||
                (selectedTechFileGuide.analysis_data?.colors_identified &&
                  selectedTechFileGuide.analysis_data.colors_identified.length >
                  0) ||
                (selectedTechFileGuide.analysis_data?.summary?.colors &&
                  selectedTechFileGuide.analysis_data.summary.colors.length >
                  0)) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Color Specifications
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* From summary.colors */}
                      {selectedTechFileGuide.analysis_data?.summary?.colors?.map(
                        (color: any, idx: number) => (
                          <Card key={`sum-col-${idx}`} className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {color.hex && (
                                <div
                                  className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-700"
                                  style={{ backgroundColor: color.hex }}
                                />
                              )}
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {color.name}
                              </p>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {color.location}
                            </p>
                            {color.coverage && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                {color.coverage}
                              </p>
                            )}
                          </Card>
                        )
                      )}
                      {/* From colors_and_patterns */}
                      {selectedTechFileGuide.analysis_data?.colors_and_patterns
                        ?.primary_color && (
                          <Card className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-700"
                                style={{
                                  backgroundColor:
                                    selectedTechFileGuide.analysis_data
                                      .colors_and_patterns.primary_color.hex,
                                }}
                              />
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .colors_and_patterns.primary_color.name
                                }
                              </p>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              Primary Color
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-1">
                              {
                                selectedTechFileGuide.analysis_data
                                  .colors_and_patterns.primary_color.hex
                              }
                            </p>
                          </Card>
                        )}
                      {selectedTechFileGuide.analysis_data?.colors_and_patterns?.secondary_colors?.map(
                        (color: any, idx: number) => (
                          <Card key={`sec-col-${idx}`} className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-700"
                                style={{ backgroundColor: color.hex }}
                              />
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {color.name}
                              </p>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              Secondary Color
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-1">
                              {color.hex}
                            </p>
                          </Card>
                        )
                      )}
                      {/* From colors_identified */}
                      {selectedTechFileGuide.analysis_data?.colors_identified?.map(
                        (color: any, idx: number) => (
                          <Card key={`id-col-${idx}`} className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {color.hex && (
                                <div
                                  className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-700"
                                  style={{ backgroundColor: color.hex }}
                                />
                              )}
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {color.name}
                              </p>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {color.location}
                            </p>
                          </Card>
                        )
                      )}
                    </div>
                    {/* Pattern info */}
                    {selectedTechFileGuide.analysis_data?.colors_and_patterns
                      ?.pattern_type && (
                        <div className="flex gap-2 mt-3">
                          <Badge variant="secondary" className="text-[10px]">
                            Pattern:{" "}
                            {
                              selectedTechFileGuide.analysis_data
                                .colors_and_patterns.pattern_type
                            }
                          </Badge>
                          {selectedTechFileGuide.analysis_data.colors_and_patterns
                            .finish && (
                              <Badge variant="secondary" className="text-[10px]">
                                Finish:{" "}
                                {
                                  selectedTechFileGuide.analysis_data
                                    .colors_and_patterns.finish
                                }
                              </Badge>
                            )}
                        </div>
                      )}
                  </div>
                )}

              {/* Hardware & Trims Section */}
              {selectedTechFileGuide.analysis_data?.hardware_and_trims &&
                selectedTechFileGuide.analysis_data.hardware_and_trims.length >
                0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Hardware & Trims
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTechFileGuide.analysis_data.hardware_and_trims.map(
                        (hardware: any, idx: number) => (
                          <Card key={idx} className="p-4">
                            <div className="space-y-2">
                              {hardware.type && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Type
                                  </p>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {hardware.type}
                                  </p>
                                </div>
                              )}
                              {hardware.material && (
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Material
                                  </p>
                                  <p className="text-xs text-gray-700 dark:text-gray-300">
                                    {hardware.material}
                                  </p>
                                </div>
                              )}
                              <div className="flex gap-2">
                                {hardware.finish && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {hardware.finish}
                                  </Badge>
                                )}
                                {hardware.placement && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {hardware.placement}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Quality Indicators Section */}
              {selectedTechFileGuide.analysis_data?.quality_indicators &&
                (selectedTechFileGuide.analysis_data.quality_indicators
                  .overall_quality ||
                  selectedTechFileGuide.analysis_data.quality_indicators
                    .craftsmanship ||
                  selectedTechFileGuide.analysis_data.quality_indicators
                    .finish_quality ||
                  selectedTechFileGuide.analysis_data.quality_indicators
                    .attention_to_detail) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Quality Indicators
                    </h3>
                    <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedTechFileGuide.analysis_data.quality_indicators
                          .overall_quality && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                Overall Quality
                              </p>
                              <Badge className="capitalize text-[10px]">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .quality_indicators.overall_quality
                                }
                              </Badge>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data.quality_indicators
                          .craftsmanship && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                Craftsmanship
                              </p>
                              <Badge className="capitalize text-[10px]">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .quality_indicators.craftsmanship
                                }
                              </Badge>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data.quality_indicators
                          .finish_quality && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                Finish Quality
                              </p>
                              <Badge className="capitalize text-[10px]">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .quality_indicators.finish_quality
                                }
                              </Badge>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data.quality_indicators
                          .attention_to_detail && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                Attention to Detail
                              </p>
                              <Badge className="capitalize text-[10px]">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .quality_indicators.attention_to_detail
                                }
                              </Badge>
                            </div>
                          )}
                      </div>
                      {selectedTechFileGuide.analysis_data.quality_indicators
                        .visible_defects &&
                        selectedTechFileGuide.analysis_data.quality_indicators
                          .visible_defects.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                              Visible Defects
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedTechFileGuide.analysis_data.quality_indicators.visible_defects.map(
                                (defect: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="destructive"
                                    className="text-[10px]"
                                  >
                                    {defect}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </Card>
                  </div>
                )}

              {/* Cost Estimation Section */}
              {selectedTechFileGuide.analysis_data?.cost_estimation &&
                ((selectedTechFileGuide.analysis_data.cost_estimation
                  .material_cost_range &&
                  selectedTechFileGuide.analysis_data.cost_estimation
                    .material_cost_range !== "Not estimated") ||
                  selectedTechFileGuide.analysis_data.cost_estimation
                    .complexity ||
                  selectedTechFileGuide.analysis_data.cost_estimation
                    .production_difficulty ||
                  (selectedTechFileGuide.analysis_data.cost_estimation
                    .estimated_production_time &&
                    selectedTechFileGuide.analysis_data.cost_estimation
                      .estimated_production_time !== "Not estimated")) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Cost Estimation
                    </h3>
                    <Card className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTechFileGuide.analysis_data.cost_estimation
                          .material_cost_range &&
                          selectedTechFileGuide.analysis_data.cost_estimation
                            .material_cost_range !== "Not estimated" && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                Material Cost Range
                              </p>
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .cost_estimation.material_cost_range
                                }
                              </p>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data.cost_estimation
                          .complexity && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                Complexity
                              </p>
                              <Badge
                                variant="secondary"
                                className="capitalize text-[10px]"
                              >
                                {
                                  selectedTechFileGuide.analysis_data
                                    .cost_estimation.complexity
                                }
                              </Badge>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data.cost_estimation
                          .production_difficulty && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                Production Difficulty
                              </p>
                              <Badge
                                variant="secondary"
                                className="capitalize text-[10px]"
                              >
                                {
                                  selectedTechFileGuide.analysis_data
                                    .cost_estimation.production_difficulty
                                }
                              </Badge>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data.cost_estimation
                          .estimated_production_time &&
                          selectedTechFileGuide.analysis_data.cost_estimation
                            .estimated_production_time !== "Not estimated" && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                                Estimated Production Time
                              </p>
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .cost_estimation.estimated_production_time
                                }
                              </p>
                            </div>
                          )}
                      </div>
                    </Card>
                  </div>
                )}

              {/* Sourcing Information Section */}
              {(selectedTechFileGuide.analysis_data?.sourcing ||
                selectedTechFileGuide.analysis_data?.moq ||
                selectedTechFileGuide.analysis_data?.lead_time) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Sourcing Information
                    </h3>
                    <Card className="p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                      {selectedTechFileGuide.analysis_data?.moq && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Minimum Order Quantity
                          </p>
                          <p className="text-xs text-gray-900 dark:text-white font-medium">
                            {selectedTechFileGuide.analysis_data.moq}
                          </p>
                        </div>
                      )}
                      {selectedTechFileGuide.analysis_data?.lead_time && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Lead Time
                          </p>
                          <p className="text-xs text-gray-900 dark:text-white font-medium">
                            {selectedTechFileGuide.analysis_data.lead_time}
                          </p>
                        </div>
                      )}
                      {selectedTechFileGuide.analysis_data?.sourcing &&
                        typeof selectedTechFileGuide.analysis_data.sourcing ===
                        "object" && (
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(
                              selectedTechFileGuide.analysis_data.sourcing
                            ).map(([key, value]: [string, any]) => (
                              <div key={key}>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                                  {key.replace(/_/g, " ")}
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {typeof value === "string"
                                    ? value
                                    : JSON.stringify(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                    </Card>
                  </div>
                )}

              {/* Quality Control Section */}
              {(selectedTechFileGuide.analysis_data?.quality_control ||
                selectedTechFileGuide.analysis_data?.inspection_points ||
                selectedTechFileGuide.analysis_data?.testing_requirements) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Quality Control
                    </h3>
                    <Card className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                      {selectedTechFileGuide.analysis_data?.inspection_points && (
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                            Inspection Points
                          </p>
                          <div className="space-y-2">
                            {(Array.isArray(
                              selectedTechFileGuide.analysis_data
                                .inspection_points
                            )
                              ? selectedTechFileGuide.analysis_data
                                .inspection_points
                              : [
                                selectedTechFileGuide.analysis_data
                                  .inspection_points,
                              ]
                            ).map((point: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                              >
                                <ClipboardCheck className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-900 dark:text-white font-medium">
                                    {typeof point === "string"
                                      ? point
                                      : point.name || point.check}
                                  </p>
                                  {point.description && (
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                      {point.description}
                                    </p>
                                  )}
                                  {point.critical && (
                                    <Badge
                                      variant="destructive"
                                      className="mt-1 text-[10px]"
                                    >
                                      Critical
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTechFileGuide.analysis_data
                        ?.testing_requirements && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                              Testing Requirements
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(
                                selectedTechFileGuide.analysis_data
                                  .testing_requirements
                              )
                                ? selectedTechFileGuide.analysis_data
                                  .testing_requirements
                                : [
                                  selectedTechFileGuide.analysis_data
                                    .testing_requirements,
                                ]
                              ).map((test: any, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {typeof test === "string"
                                    ? test
                                    : test.name || test.test}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </Card>
                  </div>
                )}

              {/* Technical Callouts Section (for sketches) */}
              {selectedTechFileGuide.analysis_data?.callouts?.callouts &&
                selectedTechFileGuide.analysis_data.callouts.callouts.length >
                0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Technical Callouts
                    </h3>
                    <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                      <div className="space-y-3">
                        {selectedTechFileGuide.analysis_data.callouts.callouts.map(
                          (callout: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                            >
                              <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-medium">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-xs text-gray-900 dark:text-white font-medium">
                                  {callout.feature_name || callout.label}
                                </p>
                                {callout.specification && (
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                    {callout.specification}
                                  </p>
                                )}
                                {callout.material && (
                                  <Badge
                                    variant="outline"
                                    className="mt-2 text-[10px]"
                                  >
                                    {callout.material}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </Card>
                  </div>
                )}

              {/* Manufacturing Notes Section */}
              {((selectedTechFileGuide.analysis_data?.manufacturing_notes &&
                selectedTechFileGuide.analysis_data.manufacturing_notes.length >
                0) ||
                (selectedTechFileGuide.analysis_data?.summary
                  ?.manufacturingNotes &&
                  selectedTechFileGuide.analysis_data.summary.manufacturingNotes
                    .length > 0) ||
                selectedTechFileGuide.analysis_data?.analysis_notes) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Manufacturing Notes
                    </h3>
                    <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                      <ul className="space-y-2">
                        {selectedTechFileGuide.analysis_data?.manufacturing_notes?.map(
                          (note: string, idx: number) => (
                            <li
                              key={`mn-${idx}`}
                              className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2"
                            >
                              <span className="text-amber-600 dark:text-amber-400 mt-0.5">
                                •
                              </span>
                              <span>{note}</span>
                            </li>
                          )
                        )}
                        {selectedTechFileGuide.analysis_data?.summary?.manufacturingNotes?.map(
                          (note: string, idx: number) => (
                            <li
                              key={`smn-${idx}`}
                              className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2"
                            >
                              <span className="text-amber-600 dark:text-amber-400 mt-0.5">
                                •
                              </span>
                              <span>{note}</span>
                            </li>
                          )
                        )}
                        {selectedTechFileGuide.analysis_data?.analysis_notes && (
                          <li className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400 mt-0.5">
                              •
                            </span>
                            <span>
                              {selectedTechFileGuide.analysis_data.analysis_notes}
                            </span>
                          </li>
                        )}
                      </ul>
                    </Card>
                  </div>
                )}

              {/* Product Information Section */}
              {(selectedTechFileGuide.analysis_data?.product_category ||
                selectedTechFileGuide.analysis_data?.product_subcategory ||
                selectedTechFileGuide.analysis_data?.product_type ||
                selectedTechFileGuide.analysis_data?.product_details) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Product Information
                    </h3>
                    <Card className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTechFileGuide.analysis_data
                          ?.product_category && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Category
                              </p>
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .product_category
                                }
                              </p>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data
                          ?.product_subcategory && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Subcategory
                              </p>
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .product_subcategory
                                }
                              </p>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data?.product_type && (
                          <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              Product Type
                            </p>
                            <p className="text-xs text-gray-900 dark:text-white font-medium">
                              {selectedTechFileGuide.analysis_data.product_type}
                            </p>
                          </div>
                        )}
                        {selectedTechFileGuide.analysis_data?.product_details
                          ?.style && (
                            <div className="md:col-span-2">
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Style Description
                              </p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .product_details.style
                                }
                              </p>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data?.product_details
                          ?.intended_use && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Intended Use
                              </p>
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .product_details.intended_use
                                }
                              </p>
                            </div>
                          )}
                        {selectedTechFileGuide.analysis_data?.product_details
                          ?.target_market && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Target Market
                              </p>
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {
                                  selectedTechFileGuide.analysis_data
                                    .product_details.target_market
                                }
                              </p>
                            </div>
                          )}
                      </div>
                    </Card>
                  </div>
                )}

              {/* Summary Section */}
              {selectedTechFileGuide.analysis_data?.summary?.summary && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Summary
                  </h3>
                  <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {selectedTechFileGuide.analysis_data.summary.summary}
                    </p>
                  </Card>
                </div>
              )}

              {/* Confidence Score */}
              {(selectedTechFileGuide.confidence_score ||
                selectedTechFileGuide.analysis_data?.confidence_scores) && (
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <CheckCircle className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      Analysis Confidence:{" "}
                      {Math.round(
                        (selectedTechFileGuide.confidence_score ||
                          selectedTechFileGuide.analysis_data?.confidence_scores
                            ?.overall ||
                          0.85) * 100
                      )}
                      %
                    </span>
                  </div>
                )}

              {/* View Image Button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => {
                    openViewer({
                      url: selectedTechFileGuide.file_url,
                      title: capitalizeTitle(
                        selectedTechFileGuide.file_category ||
                        selectedTechFileGuide.view_type ||
                        "Tech File"
                      ),
                      description:
                        selectedTechFileGuide.analysis_data?.summary
                          ?.overview || "",
                    });
                  }}
                >
                  <FileImage className="h-3.5 w-3.5 mr-2" />
                  View Image
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />

      {/* Mobile Chat Components */}
      <ChatToggleButton
        onClick={() => setIsMobileChatOpen(true)}
        isOpen={isMobileChatOpen}
      />
      <MobileChatModal
        productId={searchParams.get("projectId") || ""}
        productName={
          techPackData?.productName || techPack?.product?.name || "Product"
        }
        techPackData={techPack}
        techFilesData={techFilesData}
        productImages={productImages}
        currentTechPack={techPack}
        activeSection={activeTab}
        isOpen={isMobileChatOpen}
        onClose={() => setIsMobileChatOpen(false)}
        onApplyEdit={handleAgenticEdit}
        onNavigateToSection={setActiveTab}
      />
    </div>
  );
}
