/**
 * TechPackV2Tab Component
 * New Tech Pack V2 tab with progressive generation and interactive UI
 * Supports section-by-section generation
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Info, Eye, Package, Focus, PenTool, Pencil, Layers, Check, Loader2, ChevronRight, Ruler } from "lucide-react";
import { ProductSpecsModal, type DimensionsData, type MaterialsData } from "../../ProductSpecsModal";
import { toast } from "sonner";
import { useTechPackGeneration } from "../../../hooks/useTechPackGeneration";
import { ProgressiveLoader } from "../../TechPack/ProgressiveLoader";
import { BaseViewsDisplay } from "../../TechPack/BaseViewsDisplay";
import { ComponentsGallery, type CustomComponentGenerationResult } from "../../TechPack/ComponentsGallery";
import { CloseUpsGallery } from "../../TechPack/CloseUpsGallery";
import { SketchesDisplay } from "../../TechPack/SketchesDisplay";
import { FlatSketchesDisplay } from "../../TechPack/FlatSketchesDisplay";
import { AssemblyViewDisplay } from "../../TechPack/AssemblyViewDisplay";
import { TechPackLoadingSkeleton } from "../../TechPack/TechPackLoadingSkeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import type { ProductDimensionsData, ProductMaterialsData } from "../../../types/techPack";
import { useTechPackV2Store } from "../../../store/techPackV2Store";

// Section Card Component for individual section generation
interface SectionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  credits: number;
  status: "available" | "completed" | "locked" | "generating";
  isPrerequisite?: boolean;
  prerequisiteNote?: string;
  lockedReason?: string;
  onGenerate: () => Promise<void>;
  disabled?: boolean;
}

function SectionCard({
  icon: Icon,
  title,
  description,
  credits,
  status,
  isPrerequisite,
  prerequisiteNote,
  lockedReason,
  onGenerate,
  disabled,
}: SectionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      await onGenerate();
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isGenerating = status === "generating" || isLoading;

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200",
        isLocked
          ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-60"
          : isCompleted
            ? "bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700"
            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            isLocked
              ? "bg-gray-100 dark:bg-gray-800"
              : isCompleted
                ? "bg-gray-200 dark:bg-gray-800"
                : "bg-gray-100 dark:bg-gray-800"
          )}
        >
          {isCompleted ? (
            <Check className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : isGenerating ? (
            <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
          ) : (
            <Icon
              className={cn(
                "h-5 w-5",
                isLocked ? "text-gray-400" : "text-[#1C1917] dark:text-gray-300"
              )}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4
              className={cn(
                "text-sm font-semibold",
                isLocked
                  ? "text-gray-500 dark:text-gray-500"
                  : "text-gray-900 dark:text-white"
              )}
            >
              {title}
            </h4>
            {isPrerequisite && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 text-gray-700 border-gray-300">
                Required
              </Badge>
            )}
            {isGenerating && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 text-gray-600 border-gray-300">
                <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                Generating...
              </Badge>
            )}
            {isCompleted && !isGenerating && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 text-gray-700 border-gray-300">
                Done
              </Badge>
            )}
          </div>
          <p
            className={cn(
              "text-xs mb-3",
              isLocked
                ? "text-gray-400 dark:text-gray-600"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            {isLocked && lockedReason ? lockedReason : description}
          </p>

          {/* Action Button */}
          {!isLocked && (
            <Button
              size="sm"
              variant={isCompleted ? "outline" : "default"}
              onClick={handleGenerate}
              disabled={disabled || isGenerating}
              className={cn(
                "h-7 text-xs",
                !isCompleted && "bg-[#1C1917] hover:bg-gray-800 text-white"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : isCompleted ? (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Regenerate ({credits > 0 ? `${credits} credits` : "Free"})
                </>
              ) : (
                <>
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Generate ({credits > 0 ? `${credits} credits` : "Free"})
                </>
              )}
            </Button>
          )}

          {/* Locked State */}
          {isLocked && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Info className="h-3 w-3" />
              <span>{lockedReason || "Complete prerequisites first"}</span>
            </div>
          )}

          {/* Prerequisite Note */}
          {isPrerequisite && prerequisiteNote && !isCompleted && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              {prerequisiteNote}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

interface TechPackV2TabProps {
  productId: string;
  revisionIds: string[];
  primaryImageUrl: string;
  isDemo?: boolean;
}

export function TechPackV2Tab({
  productId,
  revisionIds,
  primaryImageUrl,
  isDemo = false,
}: TechPackV2TabProps) {
  // State for product dimensions and materials
  const [productDimensions, setProductDimensions] = useState<ProductDimensionsData | null>(null);
  const [productMaterials, setProductMaterials] = useState<ProductMaterialsData | null>(null);

  // State for specs modal
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

  // Fetch product dimensions and materials when productId changes
  useEffect(() => {
    async function fetchProductSpecs() {
      if (!productId) return;

      try {
        const { data, error } = await supabase
          .from("product_ideas")
          .select("product_dimensions, product_materials")
          .eq("id", productId)
          .single();

        if (error) {
          console.error("[TechPackV2Tab] Error fetching product specs:", error);
          return;
        }

        if (data?.product_dimensions) {
          setProductDimensions(data.product_dimensions as ProductDimensionsData);
          console.log("[TechPackV2Tab] Loaded product dimensions:", data.product_dimensions);
        }

        if (data?.product_materials) {
          setProductMaterials(data.product_materials as ProductMaterialsData);
          console.log("[TechPackV2Tab] Loaded product materials:", data.product_materials);
        }
      } catch (err) {
        console.error("[TechPackV2Tab] Failed to fetch product specs:", err);
      }
    }

    fetchProductSpecs();
  }, [productId]);

  // Use the useTechPackGeneration hook
  const {
    // State
    status,
    category,
    baseViews,
    components,
    closeUps,
    sketches,
    flatSketches,
    assemblyView,
    credits,

    // Computed
    isGenerating,
    isLoadingExistingData,
    progress,
    hasData,
    currentStepInfo,
    stepProgress,
    canGenerate,
    estimatedTimeRemaining,

    // Actions
    generateTechPack,
    regenerateBaseView,
    regenerateAllComponents,
    regenerateAllCloseUps,
    regenerateSingleSketch,
    regenerateAllSketches,
    regenerateAllFlatSketches,
    regenerateAssemblyView,
    handleToggleBaseView,
    generateBaseViewsOnly,
    reset,
  } = useTechPackGeneration({
    productId,
    revisionIds,
    primaryImageUrl,
  });

  // Handle specs approval from modal
  const handleSpecsApproved = useCallback((dimensions: DimensionsData, materials?: MaterialsData) => {
    // Refetch specs from database to ensure consistency
    // The modal already saved to DB, so we just refresh local state
    supabase
      .from("product_ideas")
      .select("product_dimensions, product_materials")
      .eq("id", productId)
      .single()
      .then(({ data }) => {
        if (data?.product_dimensions) {
          setProductDimensions(data.product_dimensions as ProductDimensionsData);
        }
        if (data?.product_materials) {
          setProductMaterials(data.product_materials as ProductMaterialsData);
        }
      });
    setIsSpecsModalOpen(false);
    toast.success("Product specifications updated successfully");
  }, [productId]);

  // Get addComponent from store for custom component generation
  const addComponent = useTechPackV2Store((state) => state.addComponent);
  const updateSketch = useTechPackV2Store((state) => state.updateSketch);

  // Handle custom component generation
  const handleGenerateCustomComponent = useCallback(async (description: string): Promise<CustomComponentGenerationResult> => {
    try {
      const response = await fetch('/api/tech-pack-v2/generate-custom-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          componentDescription: description,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.component) {
        // Add the new component to the store
        addComponent({
          id: result.data.component.analysisId,
          componentName: result.data.component.componentName,
          componentType: result.data.component.componentType,
          imageUrl: result.data.component.imageUrl,
          thumbnailUrl: result.data.component.thumbnailUrl,
          guide: result.data.component.guide,
          loadingState: 'loaded',
          order: components.length + 1, // Add at the end
          timestamp: Date.now(),
        });

        toast.success(`Generated "${result.data.component.componentName}" successfully!`);

        return {
          success: true,
          data: result.data,
        };
      }

      // Handle component not found
      if (result.componentNotFound) {
        return {
          success: false,
          componentNotFound: true,
          reason: result.reason,
          suggestions: result.suggestions || [],
          error: result.error,
        };
      }

      // Handle other errors
      return {
        success: false,
        error: result.error || 'Failed to generate component',
      };
    } catch (error) {
      console.error('[TechPackV2Tab] Custom component generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }, [productId, addComponent, components.length]);

  // Check if dimensions were updated after last generation
  const dimensionsNeedRegeneration = React.useMemo(() => {
    console.log('[TechPackV2Tab] Checking dimensions regeneration:', {
      hasData,
      hasProductDimensions: !!productDimensions,
      baseViewsLength: baseViews.length,
      productDimensions
    });

    if (!hasData || !productDimensions || baseViews.length === 0) return false;

    // Get the approvedAt timestamp from dimensions
    const dimensionsApprovedAt = productDimensions.approvedAt;
    if (!dimensionsApprovedAt) {
      console.log('[TechPackV2Tab] No approvedAt timestamp found in dimensions');
      return false;
    }

    // Get timestamps from base views
    const baseViewTimestamps = baseViews.map(v => v.timestamp).filter((t): t is number => typeof t === 'number' && t > 0);

    // If no base views have timestamps, we can't compare - assume regeneration needed
    // since dimensions were explicitly approved after the fact
    if (baseViewTimestamps.length === 0) {
      console.log('[TechPackV2Tab] No base view timestamps found, showing alert');
      return true;
    }

    // Get the oldest base view's timestamp (which represents when factory specs were generated)
    const oldestBaseViewTime = Math.min(...baseViewTimestamps);

    // If dimensions were approved after the generation, show alert
    const dimensionsTime = new Date(dimensionsApprovedAt).getTime();

    console.log('[TechPackV2Tab] Dimensions regeneration check:', {
      dimensionsApprovedAt,
      dimensionsTime,
      oldestBaseViewTime,
      needsRegen: dimensionsTime > oldestBaseViewTime,
      baseViewTimestamps: baseViews.map(v => ({ viewType: v.viewType, timestamp: v.timestamp }))
    });

    return dimensionsTime > oldestBaseViewTime;
  }, [hasData, productDimensions, baseViews]);

  // Show loading skeleton when switching revisions
  if (isLoadingExistingData) {
    return <TechPackLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-5 w-5 text-[#1C1917]" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Factory Specs
          </h2>
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-700 text-xs"
          >
            AI-Powered
          </Badge>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Generate comprehensive technical documentation with AI-powered
          analysis and high-quality visuals
        </p>

        {/* Action Buttons - Below header */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {/* Set Specs Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSpecsModalOpen(true)}
            disabled={isDemo}
            className="border-gray-300 hover:bg-gray-50"
          >
            <Ruler className="h-3 w-3 mr-1" />
            <span className="text-[10px]">Set Specifications</span>
          </Button>

          {/* Regenerate Button - Only show when has data */}
          {hasData && (
            <>
              <Button
                size="sm"
                onClick={generateTechPack}
                disabled={!canGenerate || isGenerating || isDemo}
                className="bg-[#1C1917] hover:bg-gray-800 text-white"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                <span className="text-[10px]">Regenerate (15 credits)</span>
              </Button>

              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                {credits.total} credits used
              </Badge>
            </>
          )}
        </div>

        {/* Dimensions Updated Alert - Show when dimensions were changed after last generation */}
        {dimensionsNeedRegeneration && !isGenerating && (
          <Alert className="mt-4 bg-gray-100 border-gray-300 dark:bg-gray-900/50 dark:border-gray-700">
            <Info className="h-4 w-4 text-[#1C1917] dark:text-gray-300" />
            <AlertDescription className="text-xs text-gray-700 dark:text-gray-300">
              <strong>Dimensions updated!</strong> Your product dimensions have been changed since the last generation.
              Consider regenerating the factory specs to reflect the new dimensions.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Info Alert */}
      {!hasData && !isGenerating && (
        <Alert className="bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800">
          <Info className="h-4 w-4 text-[#1C1917]" />
          <AlertDescription className="text-xs text-gray-900 dark:text-gray-100">
            Tech Pack V2 includes: <strong>Category Detection</strong>,{" "}
            <strong>Base View Analysis</strong>,{" "}
            <strong>Component Images</strong>,{" "}
            <strong>Close-Up Generation</strong>,{" "}
            <strong>Technical Sketches</strong>,{" "}
            <strong>Flat Sketches</strong>, and{" "}
            <strong>Assembly View</strong>. Total cost:{" "}
            <strong>15 credits</strong>, estimated time:{" "}
            <strong>2-3 minutes</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Section-by-Section Generation Cards - Show when not generating and not all sections are complete */}
      {!isGenerating && !(baseViews.length > 0 && components.length > 0 && closeUps.length > 0 && sketches.length > 0 && flatSketches.length > 0 && assemblyView) && (
        <div className="space-y-4">
          {/* Generate All Button - Only show when no data exists */}
          {!hasData && (
            <>
              <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1C1917]">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Generate All Sections
                      </h3>
                      <p className="text-xs text-gray-500">
                        Complete factory specs in one click
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={generateTechPack}
                    disabled={!canGenerate || isDemo}
                    className="bg-[#1C1917] hover:bg-gray-800 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate All (15 credits)
                  </Button>
                </div>
              </Card>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Or generate sections individually
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            </>
          )}

          {/* Section Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Base Views Section */}
            <SectionCard
              icon={Eye}
              title="Base View Analysis"
              description="AI-powered analysis of front, back, and side views with material detection"
              credits={1}
              status={baseViews.length > 0 ? "completed" : "available"}
              isPrerequisite={true}
              prerequisiteNote="Required for other sections"
              onGenerate={generateBaseViewsOnly}
              disabled={!canGenerate || isGenerating || isDemo}
            />

            {/* Components Section */}
            <SectionCard
              icon={Package}
              title="Component Images"
              description="Isolated images of individual components and materials for factory sourcing"
              credits={2}
              status={
                components.length > 0 && components.every(c => c.loadingState === 'loaded')
                  ? "completed"
                  : components.length > 0 && components.some(c => c.loadingState === 'loading')
                    ? "generating"
                    : baseViews.length > 0
                      ? "available"
                      : "locked"
              }
              onGenerate={regenerateAllComponents}
              disabled={!canGenerate || isGenerating || baseViews.length === 0 || isDemo}
              lockedReason={baseViews.length === 0 ? "Requires Base View Analysis first" : undefined}
            />

            {/* Close-Ups Section */}
            <SectionCard
              icon={Focus}
              title="Close-Up Generation"
              description="Detailed close-up shots of materials, construction, and special features"
              credits={2}
              status={
                closeUps.length > 0 && closeUps.every(c => c.loadingState === 'loaded')
                  ? "completed"
                  : closeUps.length > 0 && closeUps.some(c => c.loadingState === 'loading')
                    ? "generating"
                    : baseViews.length > 0
                      ? "available"
                      : "locked"
              }
              onGenerate={regenerateAllCloseUps}
              disabled={!canGenerate || isGenerating || baseViews.length === 0 || isDemo}
              lockedReason={baseViews.length === 0 ? "Requires Base View Analysis first" : undefined}
            />

            {/* Sketches Section */}
            <SectionCard
              icon={PenTool}
              title="Technical Sketches"
              description="Production-ready technical specification sheets with all annotations"
              credits={6}
              status={
                sketches.length > 0 && sketches.every(s => s.loadingState === 'loaded')
                  ? "completed"
                  : sketches.length > 0 && sketches.some(s => s.loadingState === 'loading')
                    ? "generating"
                    : baseViews.length > 0
                      ? "available"
                      : "locked"
              }
              onGenerate={regenerateAllSketches}
              disabled={!canGenerate || isGenerating || baseViews.length === 0 || isDemo}
              lockedReason={baseViews.length === 0 ? "Requires Base View Analysis first" : undefined}
            />

            {/* Flat Sketches Section */}
            <SectionCard
              icon={Pencil}
              title="Flat Sketches"
              description="Clean black and white vector sketches showing trimming, lining, and stitch details"
              credits={2}
              status={
                flatSketches.length > 0 && flatSketches.every(s => s.loadingState === 'loaded')
                  ? "completed"
                  : flatSketches.length > 0 && flatSketches.some(s => s.loadingState === 'loading')
                    ? "generating"
                    : baseViews.length > 0
                      ? "available"
                      : "locked"
              }
              onGenerate={regenerateAllFlatSketches}
              disabled={!canGenerate || isGenerating || baseViews.length === 0 || isDemo}
              lockedReason={baseViews.length === 0 ? "Requires Base View Analysis first" : undefined}
            />

            {/* Assembly View Section */}
            <SectionCard
              icon={Layers}
              title="Assembly View"
              description="Exploded view showing component relationships, assembly order, and connection points"
              credits={2}
              status={
                assemblyView?.loadingState === 'loaded'
                  ? "completed"
                  : assemblyView?.loadingState === 'loading'
                    ? "generating"
                    : baseViews.length > 0
                      ? "available"
                      : "locked"
              }
              onGenerate={regenerateAssemblyView}
              disabled={!canGenerate || isGenerating || baseViews.length === 0 || isDemo}
              lockedReason={baseViews.length === 0 ? "Requires Base View Analysis first" : undefined}
            />
          </div>

          {/* Debug Info - Remove in production */}
          {!canGenerate && process.env.NODE_ENV === "development" && (
            <div className="text-xs text-red-600 mt-2 text-center">
              Missing:
              {!productId && " productId"}
              {revisionIds.length === 0 && " revisionIds"}
              {!primaryImageUrl && " primaryImageUrl"}
            </div>
          )}
        </div>
      )}

      {/* Progressive Loader - Show sections that have data OR are being generated */}
      {(isGenerating || hasData) && (
        <ProgressiveLoader
          isGenerating={isGenerating}
          progress={progress}
          currentStepInfo={currentStepInfo}
          stepProgress={stepProgress}
          estimatedTimeRemaining={estimatedTimeRemaining}
          credits={credits}
          visibleSections={
            // Show sections that have data OR are currently being generated
            [
              // Show category if it exists OR if we're generating category/base-views
              ...(category || status.currentStep === 'category' || status.currentStep === 'base-views' ? ["category" as const] : []),
              // Show baseViews if they exist OR if we're generating base-views
              ...(baseViews.length > 0 || status.currentStep === 'base-views' ? ["baseViews" as const] : []),
              // Show components if they exist OR if we're generating components
              ...(components.length > 0 || status.currentStep === 'components' ? ["components" as const] : []),
              // Show closeUps if they exist OR if we're generating close-ups/components (parallel generation)
              ...(closeUps.length > 0 || status.currentStep === 'close-ups' || status.currentStep === 'components' ? ["closeUps" as const] : []),
              // Show sketches if they exist OR if we're generating sketches/components (parallel generation)
              ...(sketches.length > 0 || status.currentStep === 'sketches' || status.currentStep === 'components' ? ["sketches" as const] : []),
              // Show flatSketches if they exist OR if we're generating flat-sketches/components (parallel generation)
              ...(flatSketches.length > 0 || status.currentStep === 'flat-sketches' || status.currentStep === 'components' ? ["flatSketches" as const] : []),
              // Show assemblyView if it exists OR if we're generating assembly-view/components (parallel generation)
              ...(assemblyView || status.currentStep === 'assembly-view' || status.currentStep === 'components' ? ["assemblyView" as const] : []),
            ]
          }
        />
      )}

      {/* Category Display */}
      {category && (
        <Card className="p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Detected Category
              </p>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {category.category}
                </h4>
                {category.subcategory && (
                  <>
                    <span className="text-gray-400">/</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {category.subcategory}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {Math.round(category.confidence * 100)}% confidence
            </Badge>
          </div>
        </Card>
      )}

      {/* Base Views Display */}
      {baseViews.length > 0 && (
        <BaseViewsDisplay
          baseViews={baseViews}
          onToggleExpanded={handleToggleBaseView}
          onRegenerateView={regenerateBaseView}
          isGenerating={isGenerating}
          productDimensions={productDimensions}
        />
      )}

      {/* Components Gallery - Only show if components exist */}
      {components.length > 0 && (
        <ComponentsGallery
          components={components}
          onRegenerateAll={regenerateAllComponents}
          onGenerateCustomComponent={handleGenerateCustomComponent}
          isGenerating={isGenerating}
          expectedCount={5}
        />
      )}

      {/* Close-Ups Gallery - Only show if close-ups exist */}
      {closeUps.length > 0 && (
        <CloseUpsGallery
          closeUps={closeUps}
          onRegenerateAll={regenerateAllCloseUps}
          isGenerating={isGenerating}
          expectedCount={3}
        />
      )}

      {/* Sketches Display - Only show if sketches exist */}
      {sketches.length > 0 && (
        <SketchesDisplay
          sketches={sketches}
          onRegenerateSingleSketch={regenerateSingleSketch}
          onRegenerateAll={regenerateAllSketches}
          isGenerating={isGenerating}
          productId={productId}
          onSketchUpdated={(sketchId, newImageUrl) => {
            updateSketch(sketchId, { imageUrl: newImageUrl });
          }}
        />
      )}

      {/* Flat Sketches Display - Only show if flat sketches exist */}
      {flatSketches.length > 0 && (
        <FlatSketchesDisplay
          flatSketches={flatSketches}
          onRegenerateAll={regenerateAllFlatSketches}
          isGenerating={isGenerating}
          productId={productId}
        />
      )}

      {/* Assembly View Display - Only show if assembly view exists or is generating */}
      {(assemblyView || isGenerating) && (
        <AssemblyViewDisplay
          assemblyView={assemblyView}
          onRegenerate={regenerateAssemblyView}
          isGenerating={isGenerating}
          productId={productId}
        />
      )}

      {/* Product Specs Modal */}
      <ProductSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        onApprove={handleSpecsApproved}
        productId={productId}
        existingDimensions={productDimensions as DimensionsData | null}
        existingMaterials={productMaterials as MaterialsData | null}
        frontImageUrl={primaryImageUrl}
      />

    </div>
  );
}
