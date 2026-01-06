"use client";

/**
 * FactorySpecsSection - Consolidated section for Base Views + Components + Close-Ups + Sketches
 * Merges all factory specification views into a single section with internal tabs
 * Supports both authenticated (with Zustand store) and public (with props) modes
 */

import React, { useState, useCallback } from "react";
import {
  Eye,
  Component,
  Focus,
  PenTool,
  Loader2,
  Maximize2,
  FileImage,
  BookOpen,
  CheckCircle,
  Download,
  Coins,
  AlertCircle,
  Ruler,
  Palette,
  Pencil,
  Layers,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useTechFilesData,
  useTechFilesLoading,
  useTechPack,
  useProductPageActions,
  useProductPageStore,
} from "@/lib/zustand/product/productPageStore";
import type { TechPackContent, Dimension, ColorItem } from "@/modules/ai-designer/types/techPack";
import { useImageViewerStore } from "@/modules/ai-designer/store/imageViewerStore";
import { capitalizeTitle, type TechFileData, type TechFilesData } from "@/app/product/shared/utils";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { ReserveCredits, RefundCredits } from "@/lib/supabase/payments";
import { SectionSummary } from "../SectionSummary";
import { updateSectionSummary, generateSectionSummary } from "@/app/actions/section-summaries";

type SubSection = "base-views" | "components" | "closeups" | "sketches" | "flat-sketches" | "assembly-view" | "grading";

interface FactorySpecsSectionProps {
  /** Optional tech files data for public/read-only mode */
  techFilesData?: TechFilesData;
  /** Loading state for tech files */
  techFilesLoading?: boolean;
  /** Read-only mode for public pages */
  readOnly?: boolean;
  /** Callback when a tech file is selected for viewing guide */
  onSelectTechFileGuide?: (file: TechFileData) => void;
  /** Callback to open image viewer */
  onOpenImageViewer?: (url: string, title: string, description: string) => void;
  /** Product ID for saving summaries */
  productId?: string;
}

export function FactorySpecsSection({
  techFilesData: techFilesDataProp,
  techFilesLoading: techFilesLoadingProp,
  readOnly = false,
  onSelectTechFileGuide,
  onOpenImageViewer,
  productId: productIdProp,
}: FactorySpecsSectionProps = {}) {
  const [activeSubSection, setActiveSubSection] =
    useState<SubSection>("base-views");
  const [downloadingSketchId, setDownloadingSketchId] = useState<string | null>(null);
  const [downloadingComponentId, setDownloadingComponentId] = useState<string | null>(null);
  const [downloadingCloseupId, setDownloadingCloseupId] = useState<string | null>(null);
  const [downloadingFlatSketchId, setDownloadingFlatSketchId] = useState<string | null>(null);
  const [downloadingAssemblyView, setDownloadingAssemblyView] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // SVG download confirmation dialog state
  const [svgConfirmDialog, setSvgConfirmDialog] = useState<{
    open: boolean;
    file: TechFileData | null;
    type: "sketch" | "component" | "closeup" | "flat-sketch" | "assembly-view";
  }>({ open: false, file: null, type: "sketch" });

  // Use props if provided, otherwise use Zustand store
  const storeTechFilesData = useTechFilesData();
  const storeTechFilesLoading = useTechFilesLoading();
  const techPack = useTechPack();
  const storeProjectId = useProductPageStore((state) => state.projectId);
  const updateTechPack = useProductPageStore((state) => state.updateTechPack);
  const productId = productIdProp ?? storeProjectId;
  const { setSelectedTechFileGuide } = useProductPageActions();

  // Handle saving section summary
  const handleSaveSummary = useCallback(async (summary: string) => {
    if (!productId) return;
    const result = await updateSectionSummary({
      productId,
      sectionKey: "factorySpecs",
      summary,
    });
    if (result.success) {
      updateTechPack({
        sectionSummaries: {
          ...techPack?.sectionSummaries,
          factorySpecs: summary,
        },
      });
      toast({ title: "Summary saved", description: "Factory specs section summary has been updated." });
    } else {
      toast({ title: "Error", description: result.error || "Failed to save summary", variant: "destructive" });
    }
  }, [productId, techPack?.sectionSummaries, updateTechPack]);

  // Handle AI generation of summary
  const handleGenerateAI = useCallback(async () => {
    if (!productId) return "";
    setIsGeneratingSummary(true);
    try {
      const result = await generateSectionSummary(productId, "factorySpecs");
      return result.summary || "";
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [productId]);
  const { openViewer } = useImageViewerStore();

  // Get user credits
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();

  const techFilesData = techFilesDataProp ?? storeTechFilesData;
  const techFilesLoading = techFilesLoadingProp ?? storeTechFilesLoading;

  // Use callback props if provided, otherwise use store actions
  const handleSelectTechFileGuide = (file: TechFileData) => {
    if (onSelectTechFileGuide) {
      onSelectTechFileGuide(file);
    } else {
      setSelectedTechFileGuide(file as any);
    }
  };

  const handleOpenImageViewer = (url: string, title: string, description: string) => {
    if (onOpenImageViewer) {
      onOpenImageViewer(url, title, description);
    } else {
      openViewer({ url, title, description });
    }
  };

  // Open confirmation dialog for SVG download
  const openSvgConfirmDialog = (file: TechFileData, type: "sketch" | "component" | "closeup" | "flat-sketch" | "assembly-view") => {
    // Check credits first
    if ((getCreatorCredits?.credits ?? 0) < 1) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: "You need at least 1 credit to download SVG. Please purchase more credits.",
      });
      return;
    }
    setSvgConfirmDialog({ open: true, file, type });
  };

  // Handle confirmed SVG download with credit deduction
  const handleConfirmedSvgDownload = async () => {
    const { file, type } = svgConfirmDialog;
    if (!file?.file_url) return;

    setSvgConfirmDialog({ open: false, file: null, type: "sketch" });

    // Set loading state based on type
    if (type === "sketch") setDownloadingSketchId(file.id);
    else if (type === "component") setDownloadingComponentId(file.id);
    else if (type === "closeup") setDownloadingCloseupId(file.id);
    else if (type === "flat-sketch") setDownloadingFlatSketchId(file.id);
    else if (type === "assembly-view") setDownloadingAssemblyView(true);

    let reservationId: string | null = null;

    try {
      // Reserve 1 credit
      console.log("[SVG Download] Reserving 1 credit...");
      const reserveResult = await ReserveCredits({ credit: 1 });
      console.log("[SVG Download] Reserve result:", reserveResult);

      if (!reserveResult.success) {
        throw new Error(reserveResult.message || "Failed to reserve credits");
      }
      reservationId = reserveResult.reservationId || null;
      console.log("[SVG Download] Credit reserved successfully, reservationId:", reservationId);

      // Call SVG converter API
      const res = await fetch("/api/svg-converter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: file.file_url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "SVG conversion failed");
      }

      const svgContent = data.svgText || (data.svgBase64 ? atob(data.svgBase64) : null);

      if (!svgContent) {
        throw new Error("No SVG content returned from API");
      }

      // Create and download the SVG file
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Generate filename based on type
      let filename = "download.svg";
      if (type === "sketch") {
        filename = `${file.view_type?.replace("_", "-") || "sketch"}-technical.svg`;
      } else if (type === "component") {
        filename = `${file.file_category?.replace(/\s+/g, "-").toLowerCase() || file.analysis_data?.component_name?.replace(/\s+/g, "-").toLowerCase() || "component"}.svg`;
      } else if (type === "closeup") {
        filename = `${file.file_category?.replace(/\s+/g, "-").toLowerCase() || "closeup"}.svg`;
      } else if (type === "flat-sketch") {
        filename = `${file.view_type?.replace("_", "-") || "flat-sketch"}-flat.svg`;
      } else if (type === "assembly-view") {
        filename = "assembly-view.svg";
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Refresh credits after successful download
      refresCreatorCredits();

      const typeLabels: Record<string, string> = {
        "sketch": "Technical sketch",
        "component": "Component",
        "closeup": "Close-up",
        "flat-sketch": "Flat sketch",
        "assembly-view": "Assembly view",
      };
      toast({
        title: "SVG Downloaded",
        description: `${typeLabels[type] || "File"} has been downloaded. 1 credit used.`,
      });
    } catch (error) {
      console.error("SVG download error:", error);

      // Release reserved credit on failure
      if (reservationId) {
        try {
          await RefundCredits({ credit: 1, reservationId });
          refresCreatorCredits();
        } catch (releaseError) {
          console.error("Failed to release credits:", releaseError);
        }
      }

      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to convert image to SVG.",
      });
    } finally {
      // Clear loading state
      if (type === "sketch") setDownloadingSketchId(null);
      else if (type === "component") setDownloadingComponentId(null);
      else if (type === "closeup") setDownloadingCloseupId(null);
      else if (type === "flat-sketch") setDownloadingFlatSketchId(null);
      else if (type === "assembly-view") setDownloadingAssemblyView(false);
    }
  };

  // Get size and color data for grading tab
  const sizeRange = techPack?.sizeRange;
  const colors = techPack?.colors;
  const dimensions = techPack?.dimensions;

  // Filter out placeholder text from sizes (e.g., "Provide the list of realistic size range...")
  const validSizes = sizeRange?.sizes?.filter((size: string) =>
    size &&
    typeof size === 'string' &&
    size.length < 20 && // Real sizes are short like "S", "M", "L", "42", etc.
    !size.toLowerCase().includes('provide') &&
    !size.toLowerCase().includes('list')
  ) || [];

  const hasGradingData = validSizes.length > 0 ||
    (colors?.primaryColors && colors.primaryColors.length > 0);

  const subSections = [
    {
      id: "base-views" as SubSection,
      label: "Base Views",
      icon: Eye,
      count: techFilesData?.baseViews?.length || 0,
    },
    {
      id: "components" as SubSection,
      label: "Components",
      icon: Component,
      count: techFilesData?.components?.length || 0,
    },
    {
      id: "closeups" as SubSection,
      label: "Close-Ups",
      icon: Focus,
      count: techFilesData?.closeups?.length || 0,
    },
    {
      id: "sketches" as SubSection,
      label: "Sketches",
      icon: PenTool,
      count: techFilesData?.sketches?.length || 0,
    },
    {
      id: "flat-sketches" as SubSection,
      label: "Flat Sketches",
      icon: Pencil,
      count: techFilesData?.flatSketches?.length || 0,
    },
    {
      id: "assembly-view" as SubSection,
      label: "Assembly View",
      icon: Layers,
      count: techFilesData?.assemblyView ? 1 : 0,
    },
    {
      id: "grading" as SubSection,
      label: "Size & Colors",
      icon: Ruler,
      count: validSizes.length + (colors?.primaryColors?.length || 0) + (colors?.accentColors?.length || 0),
    },
  ];

  const renderLoading = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const renderEmptyState = (
    Icon: LucideIcon,
    title: string,
    description: string
  ): React.ReactNode => (
    <Card className="p-8 text-center">
      <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );

  const renderBaseViews = () => {
    if (techFilesLoading) return renderLoading();

    if (!techFilesData?.baseViews || techFilesData.baseViews.length === 0) {
      return renderEmptyState(
        Eye,
        "No Base Views Generated",
        "Base view analysis will appear here once generated through Factory Specs."
      );
    }

    return (
      <div className="space-y-6">
        {techFilesData.baseViews.map((view: TechFileData) => (
          <Card key={view.id} className="overflow-hidden">
            {/* Image at the top - clickable to expand */}
            <div
              className="relative w-full h-48 bg-muted cursor-pointer group"
              onClick={() =>
                handleOpenImageViewer(
                  view.file_url,
                  capitalizeTitle(`${view.view_type?.replace("_", " ")} View`),
                  view.analysis_data?.product_category ||
                  view.analysis_data?.summary?.overview ||
                  ""
                )
              }
            >
              <img
                src={view.thumbnail_url || view.file_url}
                alt={view.view_type || "Base View"}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white" />
              </div>
              <Badge className="absolute top-2 left-2 capitalize text-[10px]">
                {view.view_type?.replace("_", " ")} View
              </Badge>
            </div>

            {/* Full Guide content below the image */}
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">
                  {capitalizeTitle(`${view.view_type?.replace("_", " ")} View`)} Guide
                </h3>
              </div>

              {view.analysis_data && (
                <div className="space-y-4">
                  {/* Manufacturing Notes Section */}
                  {((view.analysis_data.manufacturing_notes &&
                    view.analysis_data.manufacturing_notes.length > 0) ||
                    (view.analysis_data.summary?.manufacturingNotes &&
                      view.analysis_data.summary.manufacturingNotes.length > 0) ||
                    view.analysis_data.analysis_notes) && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2">Manufacturing Notes</h4>
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                          <ul className="space-y-1.5">
                            {view.analysis_data.manufacturing_notes?.map(
                              (note: string, idx: number) => (
                                <li key={`mn-${idx}`} className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                  <span>{note}</span>
                                </li>
                              )
                            )}
                            {view.analysis_data.summary?.manufacturingNotes?.map(
                              (note: string, idx: number) => (
                                <li key={`smn-${idx}`} className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                  <span>{note}</span>
                                </li>
                              )
                            )}
                            {view.analysis_data.analysis_notes && (
                              <li className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                <span>{view.analysis_data.analysis_notes}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                  {/* Key Measurements Section */}
                  {((view.analysis_data.measurements &&
                    Object.keys(view.analysis_data.measurements).length > 0) ||
                    (view.analysis_data.dimensions_estimated &&
                      Object.keys(view.analysis_data.dimensions_estimated).length > 0) ||
                    (view.analysis_data.summary?.measurements &&
                      view.analysis_data.summary.measurements.length > 0)) && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2">Key Measurements</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {view.analysis_data.summary?.measurements?.map(
                            (measurement: any, idx: number) => (
                              <div key={`summary-${idx}`} className="p-2 rounded-lg border bg-muted/30">
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-medium truncate">{measurement.name}</p>
                                    {measurement.location && (
                                      <p className="text-[9px] text-muted-foreground truncate">{measurement.location}</p>
                                    )}
                                  </div>
                                  <Badge variant="secondary" className="text-[9px] shrink-0">{measurement.value}</Badge>
                                </div>
                              </div>
                            )
                          )}
                          {view.analysis_data.measurements &&
                            Object.entries(view.analysis_data.measurements).map(
                              ([key, value]: [string, any]) => (
                                <div key={`meas-${key}`} className="p-2 rounded-lg border bg-muted/30">
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-medium capitalize truncate">
                                        {key.replace(/_/g, " ")}
                                      </p>
                                      {value?.measurement_point && (
                                        <p className="text-[9px] text-muted-foreground truncate">{value.measurement_point}</p>
                                      )}
                                    </div>
                                    <Badge variant="secondary" className="text-[9px] shrink-0">
                                      {typeof value === "object" ? value.value || JSON.stringify(value) : value}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            )}
                          {view.analysis_data.dimensions_estimated &&
                            Object.entries(view.analysis_data.dimensions_estimated).map(
                              ([key, value]: [string, any]) => (
                                <div key={`dim-${key}`} className="p-2 rounded-lg border bg-muted/30">
                                  <div className="flex items-start justify-between gap-1">
                                    <p className="text-[10px] font-medium capitalize">{key.replace(/_/g, " ")}</p>
                                    <Badge variant="secondary" className="text-[9px]">
                                      {typeof value === "object" ? value.value || JSON.stringify(value) : value}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    )}

                  {/* Materials & Fabrics Section */}
                  {((view.analysis_data.materials_detected &&
                    view.analysis_data.materials_detected.length > 0) ||
                    view.analysis_data.material ||
                    (view.analysis_data.summary?.materials &&
                      view.analysis_data.summary.materials.length > 0)) && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2">Materials & Fabrics</h4>
                        <div className="space-y-2">
                          {view.analysis_data.summary?.materials?.map(
                            (material: any, idx: number) => (
                              <div key={`sum-mat-${idx}`} className="p-3 rounded-lg border bg-muted/30">
                                <div className="flex items-start justify-between mb-1">
                                  <p className="text-[11px] font-medium">{material.type}</p>
                                  {material.percentage && (
                                    <Badge variant="outline" className="text-[9px]">{material.percentage}</Badge>
                                  )}
                                </div>
                                {material.location && (
                                  <p className="text-[10px] text-muted-foreground mb-1.5">{material.location}</p>
                                )}
                                {material.properties && material.properties.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {material.properties.map((prop: string, propIdx: number) => (
                                      <Badge key={propIdx} variant="secondary" className="text-[9px]">{prop}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                          {view.analysis_data.materials_detected?.map(
                            (mat: any, idx: number) => (
                              <div key={`det-mat-${idx}`} className="p-3 rounded-lg border bg-muted/30">
                                <div className="flex items-start justify-between mb-1">
                                  <p className="text-[11px] font-medium">
                                    {mat.material_type || mat.component}
                                  </p>
                                  {mat.percentage && (
                                    <Badge variant="outline" className="text-[9px]">{mat.percentage}</Badge>
                                  )}
                                </div>
                                {mat.component && mat.component !== mat.material_type && (
                                  <p className="text-[10px] text-muted-foreground mb-1.5">{mat.component}</p>
                                )}
                                <div className="flex flex-wrap gap-1">
                                  {mat.spec && mat.spec !== "Not specified" && (
                                    <Badge variant="secondary" className="text-[9px]">{mat.spec}</Badge>
                                  )}
                                  {mat.finish && mat.finish !== "Not specified" && (
                                    <Badge variant="secondary" className="text-[9px]">{mat.finish}</Badge>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Construction Details Section */}
                  {((view.analysis_data.construction_details &&
                    (Array.isArray(view.analysis_data.construction_details)
                      ? view.analysis_data.construction_details.length > 0
                      : Object.keys(view.analysis_data.construction_details).length > 0)) ||
                    (view.analysis_data.summary?.construction &&
                      view.analysis_data.summary.construction.length > 0)) && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2">Construction Details</h4>
                        <div className="space-y-2">
                          {view.analysis_data.summary?.construction?.map(
                            (detail: any, idx: number) => (
                              <div key={`sum-con-${idx}`} className="p-3 rounded-lg border bg-muted/30">
                                <p className="text-[11px] font-medium mb-0.5">{detail.feature}</p>
                                <p className="text-[10px] text-muted-foreground mb-1.5">{detail.details}</p>
                                <Badge variant="outline" className="text-[9px]">{detail.technique}</Badge>
                              </div>
                            )
                          )}
                          {Array.isArray(view.analysis_data.construction_details) &&
                            view.analysis_data.construction_details.map(
                              (detail: any, idx: number) => (
                                <div key={`arr-con-${idx}`} className="p-3 rounded-lg border bg-muted/30">
                                  <div className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-[11px] font-medium">
                                        {typeof detail === "string" ? detail : detail.feature || detail.description || detail.name}
                                      </p>
                                      {detail.location && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{detail.location}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    )}

                  {/* Component Identification Section */}
                  {(view.analysis_data.component_identification ||
                    view.analysis_data.component_guide?.component_identification) && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2">Component Identification</h4>
                        <div className="p-3 rounded-lg border bg-muted/30">
                          {(() => {
                            const ci = view.analysis_data.component_guide?.component_identification ||
                              view.analysis_data.component_identification;
                            return (
                              <div className="grid grid-cols-2 gap-3">
                                {ci?.component_name && (
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-0.5">Component Name</p>
                                    <p className="text-[11px] font-medium">{ci.component_name}</p>
                                  </div>
                                )}
                                {ci?.component_type && (
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-0.5">Type</p>
                                    <Badge variant="outline" className="text-[9px]">{ci.component_type}</Badge>
                                  </div>
                                )}
                                {ci?.primary_function && (
                                  <div className="col-span-2">
                                    <p className="text-[9px] text-muted-foreground mb-0.5">Primary Function</p>
                                    <p className="text-[10px]">{ci.primary_function}</p>
                                  </div>
                                )}
                                {ci?.location_on_product && (
                                  <div className="col-span-2">
                                    <p className="text-[9px] text-muted-foreground mb-0.5">Location on Product</p>
                                    <p className="text-[10px]">{ci.location_on_product}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                  {/* Material Specifications Section */}
                  {(view.analysis_data.material_specifications ||
                    view.analysis_data.component_guide?.material_specifications) && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2">Material Specifications</h4>
                        <div className="p-3 rounded-lg border bg-muted/30">
                          {(() => {
                            const ms = view.analysis_data.component_guide?.material_specifications ||
                              view.analysis_data.material_specifications;
                            return (
                              <div className="space-y-2">
                                {ms?.material_type && (
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-0.5">Material Type</p>
                                    <p className="text-[11px] font-medium">{ms.material_type}</p>
                                  </div>
                                )}
                                {ms?.composition && (
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-0.5">Composition</p>
                                    <p className="text-[10px]">{ms.composition}</p>
                                  </div>
                                )}
                                {(ms?.quality_grade || ms?.material_grade) && (
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-0.5">Material Grade</p>
                                    <Badge variant="outline" className="text-[9px]">
                                      {ms.material_grade || ms.quality_grade}
                                    </Badge>
                                  </div>
                                )}
                                {ms?.color && (
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-0.5">Color</p>
                                    <div className="flex items-center gap-2">
                                      {ms.color.hex && (
                                        <div
                                          className="w-5 h-5 rounded border"
                                          style={{ backgroundColor: ms.color.hex }}
                                        />
                                      )}
                                      <div>
                                        <p className="text-[10px] font-medium">{ms.color.name}</p>
                                        {ms.color.hex && (
                                          <p className="text-[9px] text-muted-foreground font-mono">{ms.color.hex}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                  {/* Quality Control Section */}
                  {(view.analysis_data.quality_control ||
                    view.analysis_data.component_guide?.quality_control) && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2">Quality Control</h4>
                        <div className="p-3 rounded-lg bg-muted/50 border">
                          {(() => {
                            const qc = view.analysis_data.component_guide?.quality_control ||
                              view.analysis_data.quality_control;
                            return (
                              <div className="space-y-2">
                                {qc?.inspection_points && qc.inspection_points.length > 0 && (
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-1.5">Inspection Points</p>
                                    <ul className="space-y-1.5">
                                      {qc.inspection_points.map((point: any, idx: number) => (
                                        <li key={idx} className="text-[10px]">
                                          <div className="flex items-start gap-2">
                                            <CheckCircle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                              <p className="font-medium">{point.checkpoint || point.method || "Inspection Point"}</p>
                                              {point.acceptance_criteria && (
                                                <p className="text-[9px] text-muted-foreground mt-0.5">
                                                  {point.acceptance_criteria}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {qc?.common_defects && qc.common_defects.length > 0 && (
                                  <div>
                                    <p className="text-[9px] text-muted-foreground mb-1.5">Common Defects to Check</p>
                                    <div className="flex flex-wrap gap-1">
                                      {qc.common_defects.map((defect: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-[9px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                                        >
                                          {defect}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                  {/* Technical Callouts Section */}
                  {view.analysis_data.callouts?.callouts &&
                    view.analysis_data.callouts.callouts.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2">Technical Callouts</h4>
                        <div className="p-3 rounded-lg bg-muted/50 border">
                          <div className="space-y-2">
                            {view.analysis_data.callouts.callouts.map(
                              (callout: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 p-2 bg-background rounded border"
                                >
                                  <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 text-[9px] font-medium">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-[10px] font-medium">
                                      {callout.feature_name || callout.label}
                                    </p>
                                    {callout.specification && (
                                      <p className="text-[9px] text-muted-foreground mt-0.5">
                                        {callout.specification}
                                      </p>
                                    )}
                                    {callout.material && (
                                      <Badge variant="outline" className="mt-1 text-[9px]">{callout.material}</Badge>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Category & Summary at the bottom */}
                  {(view.analysis_data.product_category || view.analysis_data.summary) && (
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {view.analysis_data.product_category && (
                          <div>
                            <p className="text-[9px] text-muted-foreground mb-0.5">Category</p>
                            <p className="text-[11px] font-medium capitalize">
                              {view.analysis_data.product_category}
                            </p>
                          </div>
                        )}
                        {view.analysis_data.summary && (
                          <div className="md:col-span-2">
                            <p className="text-[9px] text-muted-foreground mb-0.5">Overview</p>
                            <p className="text-[10px] text-muted-foreground">
                              {typeof view.analysis_data.summary === "string"
                                ? view.analysis_data.summary
                                : view.analysis_data.summary.overview ||
                                view.analysis_data.summary.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View full guide button (modal) - kept for additional details */}
              <div className="pt-3 border-t">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTechFileGuide(view);
                  }}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  Open in Modal
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderComponents = () => {
    if (techFilesLoading) return renderLoading();

    if (!techFilesData?.components || techFilesData.components.length === 0) {
      return renderEmptyState(
        Component,
        "No Components Generated",
        "Component images will appear here once generated through Factory Specs."
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {techFilesData.components.map((component: TechFileData) => (
          <Card key={component.id} className="overflow-hidden">
            <div
              className="relative aspect-square bg-muted cursor-pointer group"
              onClick={() =>
                handleOpenImageViewer(
                  component.file_url,
                  capitalizeTitle(
                    component.file_category ||
                    component.analysis_data?.component_name ||
                    "Component"
                  ),
                  component.analysis_data?.description ||
                  component.analysis_data?.material ||
                  ""
                )
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
                    handleSelectTechFileGuide(component);
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  View Guide
                </button>
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSvgConfirmDialog(component, "component");
                    }}
                    disabled={downloadingComponentId === component.id}
                    className={cn(
                      "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
                      downloadingComponentId === component.id && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {downloadingComponentId === component.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    SVG
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCloseUps = () => {
    if (techFilesLoading) return renderLoading();

    if (!techFilesData?.closeups || techFilesData.closeups.length === 0) {
      return renderEmptyState(
        Focus,
        "No Close-Ups Generated",
        "Close-up shots will appear here once generated through Factory Specs."
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {techFilesData.closeups.map((closeup: TechFileData) => (
          <Card key={closeup.id} className="overflow-hidden">
            <div
              className="relative aspect-square bg-muted cursor-pointer group"
              onClick={() =>
                handleOpenImageViewer(
                  closeup.file_url,
                  capitalizeTitle(closeup.file_category || "Close-Up"),
                  closeup.analysis_data?.summary?.overview ||
                  closeup.analysis_data?.description ||
                  ""
                )
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
                    handleSelectTechFileGuide(closeup);
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  View Guide
                </button>
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSvgConfirmDialog(closeup, "closeup");
                    }}
                    disabled={downloadingCloseupId === closeup.id}
                    className={cn(
                      "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
                      downloadingCloseupId === closeup.id && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {downloadingCloseupId === closeup.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    SVG
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderSketches = () => {
    if (techFilesLoading) return renderLoading();

    if (!techFilesData?.sketches || techFilesData.sketches.length === 0) {
      return renderEmptyState(
        PenTool,
        "No Sketches Generated",
        "Technical sketches will appear here once generated through Factory Specs."
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {techFilesData.sketches.map((sketch: TechFileData) => (
          <Card key={sketch.id} className="overflow-hidden">
            <div
              className="relative aspect-[4/3] bg-white cursor-pointer group"
              onClick={() =>
                handleOpenImageViewer(
                  sketch.file_url,
                  capitalizeTitle(`${sketch.view_type?.replace("_", " ")} Sketch`),
                  sketch.analysis_data?.summary?.overview || ""
                )
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
                sketch.analysis_data.callouts.callouts.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2">Callouts</p>
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
                      {sketch.analysis_data.callouts.callouts.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{sketch.analysis_data.callouts.callouts.length - 3}{" "}
                          more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              {sketch.analysis_data?.measurements &&
                Object.keys(sketch.analysis_data.measurements).length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2">Measurements</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(sketch.analysis_data.measurements)
                        .slice(0, 4)
                        .map(([key, value]: [string, any]) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-xs"
                          >
                            {key}:{" "}
                            {typeof value === "object" ? value.value : value}
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
                    handleSelectTechFileGuide(sketch);
                  }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  View Guide
                </button>
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSvgConfirmDialog(sketch, "sketch");
                    }}
                    disabled={downloadingSketchId === sketch.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
                      downloadingSketchId === sketch.id && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {downloadingSketchId === sketch.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    SVG
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFlatSketches = () => {
    if (techFilesLoading) return renderLoading();

    if (!techFilesData?.flatSketches || techFilesData.flatSketches.length === 0) {
      return renderEmptyState(
        Pencil,
        "No Flat Sketches Generated",
        "Flat sketches will appear here once generated through Factory Specs."
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {techFilesData.flatSketches.map((sketch: TechFileData) => (
          <Card key={sketch.id} className="overflow-hidden">
            <div
              className="relative aspect-square bg-white cursor-pointer group"
              onClick={() =>
                handleOpenImageViewer(
                  sketch.file_url,
                  capitalizeTitle(`${sketch.view_type?.replace("_", " ")} Flat Sketch`),
                  "Clean vector-style technical drawing"
                )
              }
            >
              <img
                src={sketch.thumbnail_url || sketch.file_url}
                alt={sketch.view_type || "Flat Sketch"}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="h-8 w-8 text-white" />
              </div>
              <Badge className="absolute top-2 left-2 capitalize">
                {sketch.view_type?.replace("_", " ")} View
              </Badge>
              <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">
                Vector Style
              </Badge>
            </div>
            <CardContent className="p-3 space-y-2">
              <div>
                <h4 className="text-sm font-semibold capitalize">
                  {sketch.view_type?.replace("_", " ")} Flat Sketch
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Clean black and white vector drawing showing construction details
                </p>
              </div>
              {/* Action buttons */}
              <div className="flex items-center justify-end pt-2 border-t">
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSvgConfirmDialog(sketch, "flat-sketch");
                    }}
                    disabled={downloadingFlatSketchId === sketch.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
                      downloadingFlatSketchId === sketch.id && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {downloadingFlatSketchId === sketch.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    SVG
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderAssemblyView = () => {
    if (techFilesLoading) return renderLoading();

    if (!techFilesData?.assemblyView) {
      return renderEmptyState(
        Layers,
        "No Assembly View Generated",
        "Assembly/exploded view will appear here once generated through Factory Specs."
      );
    }

    const assemblyView = techFilesData.assemblyView;

    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div
            className="relative aspect-[4/3] bg-white cursor-pointer group"
            onClick={() =>
              handleOpenImageViewer(
                assemblyView.file_url,
                "Assembly View",
                assemblyView.analysis_data?.description || "Exploded view showing component assembly order"
              )
            }
          >
            <img
              src={assemblyView.thumbnail_url || assemblyView.file_url}
              alt="Assembly View"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="h-8 w-8 text-white" />
            </div>
            <Badge className="absolute top-2 left-2">
              Exploded View
            </Badge>
          </div>
          <CardContent className="p-4 space-y-3">
            <div>
              <h4 className="text-sm font-semibold">Assembly / Exploded View</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {assemblyView.analysis_data?.summary?.overview ||
                  assemblyView.analysis_data?.description ||
                  "Technical illustration showing how the product is constructed, with numbered components indicating assembly order."}
              </p>
            </div>

            {/* Summary metadata badges */}
            {assemblyView.analysis_data?.summary && (
              <div className="flex flex-wrap gap-2">
                {assemblyView.analysis_data.summary.totalComponents && (
                  <Badge variant="secondary" className="text-[10px]">
                    {assemblyView.analysis_data.summary.totalComponents} Components
                  </Badge>
                )}
                {assemblyView.analysis_data.summary.difficultyLevel && (
                  <Badge variant="outline" className="text-[10px]">
                    {assemblyView.analysis_data.summary.difficultyLevel}
                  </Badge>
                )}
                {assemblyView.analysis_data.summary.estimatedAssemblyTime && (
                  <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {assemblyView.analysis_data.summary.estimatedAssemblyTime}
                  </Badge>
                )}
              </div>
            )}

            {/* Component list from summary - show all */}
            {assemblyView.analysis_data?.summary?.components && assemblyView.analysis_data.summary.components.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">Components</p>
                <div className="grid grid-cols-2 gap-2">
                  {assemblyView.analysis_data.summary.components.map((comp: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg border bg-muted/30"
                    >
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-medium">
                        {comp.number || idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {comp.name || `Component ${comp.number || idx + 1}`}
                        </p>
                        {comp.role && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            {comp.role}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback to legacy components structure */}
            {!assemblyView.analysis_data?.summary?.components &&
              assemblyView.analysis_data?.components &&
              assemblyView.analysis_data.components.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2">Components</p>
                  <div className="grid grid-cols-2 gap-2">
                    {assemblyView.analysis_data.components.map((comp: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-lg border bg-muted/30"
                      >
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-medium">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {typeof comp === "string" ? comp : comp.name || comp.component_name || `Component ${idx + 1}`}
                          </p>
                          {comp.description && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {comp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Assembly Sequence - show all steps */}
            {assemblyView.analysis_data?.summary?.assemblySequence &&
              assemblyView.analysis_data.summary.assemblySequence.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2">Assembly Sequence</p>
                  <div className="space-y-2">
                    {assemblyView.analysis_data.summary.assemblySequence.map((step: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-lg border bg-muted/30"
                      >
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                          {step.step || idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">
                            {step.action}
                          </p>
                          {step.technique && (
                            <p className="text-[10px] text-muted-foreground">
                              Technique: {step.technique}
                            </p>
                          )}
                          {step.notes && (
                            <p className="text-[10px] text-muted-foreground italic">
                              {step.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Connection Points */}
            {assemblyView.analysis_data?.summary?.connectionPoints &&
              assemblyView.analysis_data.summary.connectionPoints.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2">Connection Points</p>
                  <div className="grid grid-cols-1 gap-2">
                    {assemblyView.analysis_data.summary.connectionPoints.map((cp: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium">{cp.location}</p>
                          {cp.type && (
                            <Badge variant="secondary" className="text-[10px]">
                              {cp.type}
                            </Badge>
                          )}
                        </div>
                        {cp.componentsJoined && cp.componentsJoined.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Joins: {cp.componentsJoined.join(" + ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Tools Required */}
            {assemblyView.analysis_data?.summary?.toolsRequired &&
              assemblyView.analysis_data.summary.toolsRequired.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2">Tools Required</p>
                  <div className="grid grid-cols-2 gap-2">
                    {assemblyView.analysis_data.summary.toolsRequired.map((tool: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg border bg-muted/30"
                      >
                        <p className="text-xs font-medium">
                          {typeof tool === "string" ? tool : tool.tool || tool.name}
                        </p>
                        {typeof tool !== "string" && tool.purpose && (
                          <p className="text-[10px] text-muted-foreground mt-1">{tool.purpose}</p>
                        )}
                        {typeof tool !== "string" && tool.specification && (
                          <Badge variant="outline" className="text-[10px] mt-1">{tool.specification}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Quality Checkpoints */}
            {assemblyView.analysis_data?.summary?.qualityCheckpoints &&
              assemblyView.analysis_data.summary.qualityCheckpoints.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2">Quality Checkpoints</p>
                  <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                    {assemblyView.analysis_data.summary.qualityCheckpoints.map((qc: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium">
                            {typeof qc === "string" ? qc : qc.checkpoint || qc.name}
                          </p>
                          {typeof qc !== "string" && qc.criteria && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">{qc.criteria}</p>
                          )}
                          {typeof qc !== "string" && qc.timing && (
                            <Badge variant="outline" className="text-[10px] mt-1">{qc.timing}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Assembly notes if available */}
            {assemblyView.analysis_data?.assembly_notes && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1">Assembly Notes</p>
                <p className="text-xs text-muted-foreground">
                  {assemblyView.analysis_data.assembly_notes}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end pt-3 border-t">
              {!readOnly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openSvgConfirmDialog(assemblyView, "assembly-view");
                  }}
                  disabled={downloadingAssemblyView}
                  className={cn(
                    "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
                    downloadingAssemblyView && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {downloadingAssemblyView ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  SVG
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGrading = () => {
    if (techFilesLoading) return renderLoading();

    if (!hasGradingData) {
      return renderEmptyState(
        Ruler,
        "No Grading Data Available",
        "Size grading and color variations will appear here once the tech pack is generated."
      );
    }

    // Generate size grading data based on dimensions and sizes
    const generateSizeGrading = () => {
      if (!dimensions || validSizes.length === 0) return null;

      // Get all dimension keys
      const dimensionKeys = Object.keys(dimensions);
      if (dimensionKeys.length === 0) return null;

      // Create a grading scale based on size index
      // Typical grading: S is base, each size increases proportionally
      const sizeScales: Record<string, number> = {
        "XXS": 0.88,
        "XS": 0.94,
        "S": 1.0,
        "M": 1.06,
        "L": 1.12,
        "XL": 1.18,
        "XXL": 1.24,
        "XXXL": 1.30,
        // Numeric sizes
        "0": 0.88,
        "2": 0.91,
        "4": 0.94,
        "6": 0.97,
        "8": 1.0,
        "10": 1.03,
        "12": 1.06,
        "14": 1.09,
        "16": 1.12,
      };

      return {
        dimensionKeys,
        sizeScales,
      };
    };

    const gradingData = generateSizeGrading();

    return (
      <div className="space-y-6">
        {/* Size Grading Table */}
        {validSizes.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Size Grading Chart</h3>
              </div>

              {/* Grading Logic Description */}
              {sizeRange?.gradingLogic && !sizeRange.gradingLogic.toLowerCase().includes('explain') && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <span className="font-medium">Grading Logic:</span> {sizeRange.gradingLogic}
                  </p>
                </div>
              )}

              {/* Size Grading Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-semibold">Measurement</th>
                      {validSizes.map((size: string) => (
                        <th key={size} className="text-center p-2 font-semibold min-w-[60px]">
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dimensions && (Object.entries(dimensions) as [string, Dimension][]).map(([key, dim]) => {
                      // Parse the base value (assuming S or first size is base)
                      const baseValue = parseFloat(dim?.value || '0') || 0;
                      const unit = (dim?.value || '').replace(/[\d.-]/g, '').trim() || '';

                      return (
                        <tr key={key} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                            {dim?.tolerance && (
                              <span className="block text-[10px] text-muted-foreground">
                                ±{dim.tolerance}
                              </span>
                            )}
                          </td>
                          {validSizes.map((size: string, idx: number) => {
                            // Calculate graded value
                            // Each size typically adds 1-2 inches/cm or 3-5% based on dimension type
                            const sizeIndex = idx;
                            const baseIndex = Math.floor(validSizes.length / 2); // Middle is often base
                            const gradeAmount = (sizeIndex - baseIndex) * (baseValue * 0.04); // 4% per size grade
                            const gradedValue = baseValue > 0 ? (baseValue + gradeAmount).toFixed(1) : (dim?.value || '-');

                            return (
                              <td key={size} className="text-center p-2">
                                <span className="font-mono">
                                  {typeof baseValue === 'number' && baseValue > 0
                                    ? `${gradedValue}${unit ? ` ${unit}` : ''}`
                                    : (dim?.value || '-')}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Available Sizes Summary */}
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Available Sizes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {validSizes.map((size: string) => (
                    <Badge key={size} variant="outline" className="text-xs">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Color Variations / Colorways */}
        {colors && (colors.primaryColors?.length > 0 || colors.accentColors?.length > 0) && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Color Variations</h3>
              </div>

              {/* Style Notes */}
              {colors.styleNotes && (
                <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-xs text-purple-800 dark:text-purple-200">
                    <span className="font-medium">Style Notes:</span> {colors.styleNotes}
                  </p>
                </div>
              )}

              {/* Trend Alignment */}
              {colors.trendAlignment && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Trend Alignment:</span> {colors.trendAlignment}
                  </p>
                </div>
              )}

              {/* Primary Colors */}
              {colors.primaryColors && colors.primaryColors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold mb-2">Primary Colors</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {colors.primaryColors.map((color: ColorItem, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg border bg-background"
                      >
                        <div
                          className="w-8 h-8 rounded-md border shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{color.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase">
                            {color.hex}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accent Colors */}
              {colors.accentColors && colors.accentColors.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-2">Accent Colors</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {colors.accentColors.map((color: ColorItem, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg border bg-background"
                      >
                        <div
                          className="w-8 h-8 rounded-md border shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{color.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase">
                            {color.hex}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Combination Preview */}
              {colors.primaryColors && colors.primaryColors.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <h4 className="text-xs font-semibold mb-2">Color Palette Preview</h4>
                  <div className="flex rounded-lg overflow-hidden h-8 border">
                    {colors.primaryColors.map((color: ColorItem, idx: number) => (
                      <div
                        key={`primary-${idx}`}
                        className="flex-1 h-full"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} (${color.hex})`}
                      />
                    ))}
                    {colors.accentColors?.map((color: ColorItem, idx: number) => (
                      <div
                        key={`accent-${idx}`}
                        className="flex-1 h-full"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} (${color.hex})`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Combined Size-Color Matrix (if both available) */}
        {validSizes.length > 0 &&
          colors?.primaryColors && colors.primaryColors.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Component className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">SKU Matrix (Size × Color)</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Available product variations combining sizes and colors.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-semibold">Color</th>
                        {validSizes.map((size: string) => (
                          <th key={size} className="text-center p-2 font-semibold min-w-[50px]">
                            {size}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {colors.primaryColors.map((color: ColorItem, colorIdx: number) => (
                        <tr key={colorIdx} className="border-b hover:bg-muted/30">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="font-medium">{color.name}</span>
                            </div>
                          </td>
                          {validSizes.map((size: string) => (
                            <td key={size} className="text-center p-2">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 mx-auto" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Total SKUs: {validSizes.length * (colors.primaryColors.length || 0)}
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Summary */}
      {!readOnly && productId && (
        <SectionSummary
          sectionKey="factorySpecs"
          summary={techPack?.sectionSummaries?.factorySpecs}
          onSave={handleSaveSummary}
          onGenerateAI={handleGenerateAI}
          isGenerating={isGeneratingSummary}
          placeholder="Add a summary explaining the factory specifications and technical files..."
        />
      )}

      {/* Sub-section tabs */}
      <div className="flex items-center gap-2 border-b pb-2 overflow-x-auto">
        {subSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSubSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSubSection(section.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{section.label}</span>
              {section.count > 0 && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="text-xs h-5 px-1.5"
                >
                  {section.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeSubSection === "base-views" && renderBaseViews()}
        {activeSubSection === "components" && renderComponents()}
        {activeSubSection === "closeups" && renderCloseUps()}
        {activeSubSection === "sketches" && renderSketches()}
        {activeSubSection === "flat-sketches" && renderFlatSketches()}
        {activeSubSection === "assembly-view" && renderAssemblyView()}
        {activeSubSection === "grading" && renderGrading()}
      </div>

      {/* SVG Download Confirmation Dialog */}
      <Dialog
        open={svgConfirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setSvgConfirmDialog({ open: false, file: null, type: "sketch" });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download SVG
            </DialogTitle>
            <DialogDescription>
              Convert and download this image as an SVG file.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
              <Coins className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Credit Cost</p>
              <p className="text-xs text-muted-foreground">
                This action will use <span className="font-semibold text-foreground">1 credit</span> from your account.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-xs">
              SVG files are scalable vector graphics, ideal for printing and manufacturing at any size.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSvgConfirmDialog({ open: false, file: null, type: "sketch" })}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmedSvgDownload}>
              <Coins className="h-4 w-4 mr-2" />
              Confirm (1 Credit)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FactorySpecsSection;
