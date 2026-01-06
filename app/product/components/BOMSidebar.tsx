"use client";

/**
 * BOMSidebar - Bill of Materials Manufacturing Sidebar
 * Displays estimated costs, production workflows, and order options
 * Integrates with AI cost estimation API for realistic market pricing
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Factory,
  Package,
  Truck,
  ClipboardCheck,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Layers,
  Scissors,
  Wrench,
  Box,
  ShieldCheck,
  Ship,
  FileText,
  Info,
  Globe,
  MapPin,
  Loader2,
  Send,
  X,
  Copy,
  Check,
  Link2,
  ExternalLink,
} from "lucide-react";
import { createRFQWithNotificationAction, checkExistingRFQAction } from "@/app/actions/create-rfq";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { TechPackContent, Material } from "@/modules/ai-designer/types/techPack";
import { useProjectId, useSelectedRevisionId, useIsPublic, useProductPageActions } from "@/lib/zustand/product/productPageStore";
import { useUserStore } from "@/lib/zustand/useStore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

// AI Cost Estimation Response Type
interface AIEstimationData {
  // AI-estimated material costs (when original costs not provided)
  estimatedMaterialCosts?: {
    perMaterial: Array<{
      component: string;
      material: string;
      estimatedCost: number;
    }>;
    totalPerUnit: number;
  };
  sampleCost: {
    min: number;
    max: number;
    currency: string;
    breakdown: {
      materials: number;
      labor: number;
      setup: number;
      shipping: number;
    };
  };
  productionCost: {
    quantity: number;
    totalMin: number;
    totalMax: number;
    perUnitMin: number;
    perUnitMax: number;
    currency: string;
  };
  leadTimes: {
    sample: string;
    production: string;
  };
  manufacturingRegions: Array<{
    region: string;
    priceMultiplier: number;
    notes: string;
  }>;
  marketInsights: string;
  dataSources: string[];
  confidence: "high" | "medium" | "low";
  generatedAt: string;
}

interface BOMSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  techPack: TechPackContent | null;
  productName: string;
}

// Helper to safely parse a number (handles "$150", "150", 150, etc.)
function safeNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[$,]/g, '').trim();
    return parseFloat(cleaned) || 0;
  }
  return 0;
}

// Helper to extract cost from AI-generated cost estimation data
function extractCostFromAI(techPack: TechPackContent | null) {
  // Try to get AI-generated cost estimates
  const costEstimation = techPack?.costIncomeEstimation;
  const costStructure = techPack?.costStructure;

  let sampleCost: string | null = null;
  let sampleTimeline: string | null = null;
  let productionCost: string | null = null;
  let perUnitCost: string | null = null;
  let productionTimeline: string | null = null;

  // Extract from costIncomeEstimation (AI-generated)
  if (costEstimation?.sampleCreation) {
    const sample = costEstimation.sampleCreation as any;
    sampleCost = sample.cost || sample.totalCost || sample.estimatedCost || null;
    sampleTimeline = sample.timeline || sample.leadTime || null;
  }

  if (costEstimation?.bulkProduction1000) {
    const bulk = costEstimation.bulkProduction1000 as any;
    productionCost = bulk.totalCost || bulk.cost || bulk.estimatedCost || null;
    perUnitCost = bulk.perUnit || bulk.unitCost || bulk.perUnitCost || null;
    productionTimeline = bulk.timeline || bulk.leadTime || null;
  }

  // Fallback to costStructure if available
  if (!sampleCost && costStructure?.sampleCost) {
    const sc = costStructure.sampleCost as any;
    sampleCost = sc.total || sc.totalCost || sc.cost || null;
  }

  if (!productionCost && costStructure?.productionCost) {
    const pc = costStructure.productionCost as any;
    productionCost = pc.total || pc.totalCost || pc.cost || null;
  }

  return {
    sampleCost,
    sampleTimeline,
    productionCost,
    perUnitCost,
    productionTimeline,
    hasAIEstimates: !!(sampleCost || productionCost),
  };
}

// Fallback calculation when no AI estimates available
function calculateFallbackCosts(materials: Material[] | undefined) {
  if (!materials || materials.length === 0) {
    return {
      sampleMin: 45,
      sampleMax: 120,
      productionMin: 8500,
      productionMax: 15000,
      perUnitMin: 8.5,
      perUnitMax: 15,
    };
  }

  // Calculate base material cost per unit
  const materialCostPerUnit = materials.reduce((total, mat) => {
    return total + safeNumber(mat.unitCost) * safeNumber(mat.quantityPerUnit || 1);
  }, 0);

  // Sample costs (higher due to setup + single unit)
  const sampleMin = Math.round(35 + (materialCostPerUnit * 1.5) + 25 + 15);
  const sampleMax = Math.round(sampleMin * 1.4);

  // Production costs (1000 units) - 35% bulk discount
  const productionMin = Math.round((materialCostPerUnit * 0.65 * 1000) + 4000 + 750);
  const productionMax = Math.round(productionMin * 1.3);

  return {
    sampleMin,
    sampleMax,
    productionMin,
    productionMax,
    perUnitMin: Math.round((productionMin / 1000) * 100) / 100,
    perUnitMax: Math.round((productionMax / 1000) * 100) / 100,
  };
}

export function BOMSidebar({ isOpen, onClose, techPack, productName }: BOMSidebarProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "sample" | "production">("overview");
  const [selectedOrderType, setSelectedOrderType] = useState<"sample" | "production" | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1000);

  // AI Estimation State
  const [aiEstimation, setAiEstimation] = useState<AIEstimationData | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Get IDs for database caching
  const projectId = useProjectId();
  const selectedRevisionId = useSelectedRevisionId();
  const isPublic = useIsPublic();
  const { setIsPublic } = useProductPageActions();
  const { user, creatorProfile } = useUserStore();
  const router = useRouter();

  // RFQ submission state
  const [isSubmittingRFQ, setIsSubmittingRFQ] = useState(false);
  const [existingRFQ, setExistingRFQ] = useState<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  } | null>(null);
  const [isCheckingRFQ, setIsCheckingRFQ] = useState(false);

  // Share link state
  const [copied, setCopied] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

  // Public share URL - uses /p/[id] for public viewing
  const publicShareUrl = typeof window !== "undefined" && projectId
    ? `${window.location.origin}/p/${projectId}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicShareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: isPublic
          ? "Public link has been copied to clipboard."
          : "Link copied. Note: Product is private - enable public access for others to view it.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async () => {
    if (!projectId) return;
    setIsTogglingVisibility(true);
    try {
      const response = await fetch("/api/product/toggle-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: projectId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const newStatus = result.data.is_public;
        setIsPublic(newStatus);
        toast({
          title: newStatus ? "Product is now public" : "Product is now private",
          description: newStatus
            ? "Anyone with the link can view this product."
            : "Only you can view this product.",
        });
      } else {
        toast({
          title: "Failed to update visibility",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to update visibility",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const materials = techPack?.materials || [];
  const hardware = techPack?.hardwareComponents?.hardware || [];

  // Deduplicate materials by component name, keeping the one with valid cost
  const uniqueMaterials = useMemo(() => {
    const seen = new Map<string, typeof materials[0]>();
    materials.forEach((mat) => {
      const key = mat.component?.toLowerCase().trim() || '';
      const existing = seen.get(key);
      const matHasCost = mat.unitCost && safeNumber(mat.unitCost) > 0;
      const existingHasCost = existing?.unitCost && safeNumber(existing.unitCost) > 0;
      // Keep this material if: no existing, or this one has cost and existing doesn't
      if (!existing || (matHasCost && !existingHasCost)) {
        seen.set(key, mat);
      }
    });
    return Array.from(seen.values());
  }, [materials]);

  // Calculate total material cost for API (use unique materials to avoid double-counting)
  const calculatedMaterialCost = uniqueMaterials.reduce((total, mat) => {
    return total + safeNumber(mat.unitCost) * safeNumber(mat.quantityPerUnit || 1);
  }, 0);

  // Fetch AI cost estimates from the API (with database caching)
  const fetchAIEstimates = useCallback(async (forceRefresh = false) => {
    if (!techPack) return;

    setIsLoadingAI(true);
    setAiError(null);

    try {
      const response = await fetch("/api/bom/estimate-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          category: techPack.category_Subcategory || "Consumer Product",
          // Caching parameters
          productIdeaId: projectId || undefined,
          revisionId: selectedRevisionId || undefined,
          userId: user?.id || undefined,
          forceRefresh,
          // Product data (use deduplicated materials for consistency)
          materials: uniqueMaterials.map(m => ({
            component: m.component,
            material: m.material,
            specification: m.specification,
            quantityPerUnit: m.quantityPerUnit,
            unitCost: safeNumber(m.unitCost),
          })),
          hardware: hardware,
          dimensions: techPack.dimensions,
          productDescription: techPack.productOverview,
          totalMaterialCost: calculatedMaterialCost,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAiEstimation(result.data);
        // Log if from cache for debugging
        if (result.data.fromCache) {
          console.log("[BOM] Using cached estimate");
        }
      } else {
        throw new Error(result.error || "Failed to get estimates");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch AI estimates";
      setAiError(message);
      toast({
        title: "Estimation Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  }, [techPack, productName, uniqueMaterials, hardware, calculatedMaterialCost, projectId, selectedRevisionId, user?.id]);

  // Auto-fetch AI estimates when sidebar opens
  useEffect(() => {
    if (isOpen && techPack && !aiEstimation && !isLoadingAI) {
      fetchAIEstimates();
    }
  }, [isOpen, techPack, aiEstimation, isLoadingAI, fetchAIEstimates]);

  // Check for existing RFQ when sidebar opens
  useEffect(() => {
    const checkExistingRFQ = async () => {
      if (!isOpen || !projectId) return;

      setIsCheckingRFQ(true);
      try {
        const result = await checkExistingRFQAction(projectId);
        if (result.success && result.exists && result.rfq) {
          setExistingRFQ(result.rfq);
        } else {
          setExistingRFQ(null);
        }
      } catch (error) {
        console.error("Error checking existing RFQ:", error);
      } finally {
        setIsCheckingRFQ(false);
      }
    };

    checkExistingRFQ();
  }, [isOpen, projectId]);

  // Try to get AI-generated estimates first, fallback to calculation
  const techPackEstimates = extractCostFromAI(techPack);
  const fallbackCosts = calculateFallbackCosts(materials);

  // Use the already calculated material cost
  const totalMaterialCost = calculatedMaterialCost;

  // Priority: API AI estimation > Tech pack AI estimates > Fallback calculations
  const hasAPIEstimates = !!aiEstimation;

  const sampleCostDisplay = aiEstimation
    ? `$${aiEstimation.sampleCost.min.toLocaleString()} – $${aiEstimation.sampleCost.max.toLocaleString()}`
    : techPackEstimates.sampleCost
      ? techPackEstimates.sampleCost
      : `$${fallbackCosts.sampleMin} – $${fallbackCosts.sampleMax}`;

  const sampleTimeline = aiEstimation?.leadTimes.sample
    || techPackEstimates.sampleTimeline
    || "7–21 days";

  const productionCostDisplay = aiEstimation
    ? `$${aiEstimation.productionCost.totalMin.toLocaleString()} – $${aiEstimation.productionCost.totalMax.toLocaleString()}`
    : techPackEstimates.productionCost
      ? techPackEstimates.productionCost
      : `$${fallbackCosts.productionMin.toLocaleString()} – $${fallbackCosts.productionMax.toLocaleString()}`;

  const perUnitDisplay = aiEstimation
    ? `$${aiEstimation.productionCost.perUnitMin.toFixed(2)} – $${aiEstimation.productionCost.perUnitMax.toFixed(2)}`
    : techPackEstimates.perUnitCost
      ? techPackEstimates.perUnitCost
      : `$${fallbackCosts.perUnitMin} – $${fallbackCosts.perUnitMax}`;

  const productionTimeline = aiEstimation?.leadTimes.production
    || techPackEstimates.productionTimeline
    || "25–60 days";

  // Handle RFQ submission
  const handleRequestQuote = async (orderType: "sample" | "production") => {
    if (!creatorProfile?.id || !projectId || !user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request a quote.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingRFQ(true);

    try {
      const quantity = orderType === "sample" ? "1" : String(selectedQuantity);
      const timeline = orderType === "sample" ? sampleTimeline : productionTimeline;
      const targetPrice = orderType === "sample"
        ? undefined
        : aiEstimation?.productionCost.perUnitMin.toFixed(2);

      const result = await createRFQWithNotificationAction({
        title: `${productName} - ${orderType === "sample" ? "Sample Request" : "Production Quote"}`,
        productIdea: techPack?.productOverview || productName,
        techpackId: projectId,
        creatorId: creatorProfile.id,
        timeline: timeline,
        quantity: quantity,
        targetPrice: targetPrice,
        status: "open",
        creatorName: creatorProfile.full_name || user.email || "Creator",
        creatorUserId: user.id,
      });

      if (result.success) {
        toast({
          title: "Quote Request Sent!",
          description: `Your ${orderType} quote request has been sent to ${result.supplierCount || 0} suppliers.`,
        });
        onClose();
        router.push("/creator-dashboard/rfqs");
      } else {
        throw new Error(result.error || "Failed to create RFQ");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send quote request";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingRFQ(false);
    }
  };

  const confidenceBadge = aiEstimation?.confidence
    ? {
        high: { label: "High Confidence" },
        medium: { label: "Medium Confidence" },
        low: { label: "Low Confidence" },
      }[aiEstimation.confidence]
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-0"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 border-b">
          <SheetHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Factory className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-base">Bill of Materials</SheetTitle>
                  <SheetDescription className="text-xs">
                    {productName}
                  </SheetDescription>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </SheetHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="px-4 pb-2">
            <TabsList className="grid w-full grid-cols-3 h-9">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="sample" className="text-xs">Sample</TabsTrigger>
              <TabsTrigger value="production" className="text-xs">Production</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Estimated Costs Summary */}
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Estimated Costs</h3>
                  {isLoadingAI && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 animate-pulse">
                      Analyzing...
                    </Badge>
                  )}
                  {confidenceBadge && !isLoadingAI && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                      {confidenceBadge.label}
                    </Badge>
                  )}
                </div>

                {/* Loading Skeleton State */}
                {isLoadingAI && !hasAPIEstimates ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Sample Skeleton */}
                      <div className="p-3 rounded-lg bg-background border">
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-6 w-28 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      {/* Production Skeleton */}
                      <div className="p-3 rounded-lg bg-background border">
                        <Skeleton className="h-3 w-24 mb-2" />
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    {/* Market Insights Skeleton */}
                    <div className="mt-3 p-2.5 rounded-lg bg-muted/30 border">
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                    {/* Regional Pricing Skeleton */}
                    <div className="mt-3 p-2.5 rounded-lg bg-background border">
                      <Skeleton className="h-3 w-24 mb-2" />
                      <div className="grid grid-cols-2 gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/50">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Sample Card */}
                      <button
                        onClick={() => {
                          setActiveTab("sample");
                          setSelectedOrderType("sample");
                        }}
                        className="text-left p-3 rounded-lg bg-background border hover:border-primary/50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Sample (1 unit)</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="font-bold text-base">{sampleCostDisplay}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{sampleTimeline}</span>
                        </div>
                      </button>

                      {/* Production Card */}
                      <button
                        onClick={() => {
                          setActiveTab("production");
                          setSelectedOrderType("production");
                        }}
                        className="text-left p-3 rounded-lg bg-background border hover:border-primary/50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Production (1,000)</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="font-bold text-base">{productionCostDisplay}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{productionTimeline}</span>
                        </div>
                      </button>
                    </div>

                    {/* AI Market Insights - Show when API estimates are available */}
                    {aiEstimation?.marketInsights && (
                      <div className="mt-3 p-2.5 rounded-lg bg-secondary/50 border">
                        <div className="flex items-start gap-2">
                          <Globe className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-medium text-foreground mb-1">
                              Market Insights
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              {aiEstimation.marketInsights}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manufacturing Regions - Show when API estimates are available */}
                    {aiEstimation?.manufacturingRegions && aiEstimation.manufacturingRegions.length > 0 && (
                      <div className="mt-3 p-2.5 rounded-lg bg-background border">
                        <div className="flex items-center gap-1.5 mb-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-medium">Regional Pricing</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {aiEstimation.manufacturingRegions.slice(0, 4).map((region, idx) => (
                            <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-muted/50">
                              <span className="text-[10px]">{region.region}</span>
                              <span className={cn(
                                "text-[10px] font-medium",
                                region.priceMultiplier <= 1 ? "text-primary" : "text-muted-foreground"
                              )}>
                                {region.priceMultiplier === 1 ? "Base" : `${region.priceMultiplier > 1 ? '+' : ''}${((region.priceMultiplier - 1) * 100).toFixed(0)}%`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show generated timestamp */}
                    {aiEstimation?.generatedAt && (
                      <p className="mt-2 text-[9px] text-muted-foreground text-right">
                        Updated: {new Date(aiEstimation.generatedAt).toLocaleString()}
                      </p>
                    )}
                  </>
                )}
              </Card>

              {/* Materials BOM */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Materials</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {uniqueMaterials.length} items
                  </Badge>
                </div>

                {uniqueMaterials.length > 0 ? (
                  <div className="space-y-2">
                    {uniqueMaterials.map((mat, idx) => {
                      // Use safeNumber to handle string costs like "$15.00" or "15.00 USD/m²"
                      const unitCost = safeNumber(mat.unitCost);
                      const unitCostStr = String(mat.unitCost || '');
                      const hasValidCost = unitCost > 0 || (unitCostStr.trim() !== '' && !unitCostStr.includes('TBD'));

                      // Look for AI-estimated cost for this specific material
                      let estimatedUnitCost: number | null = null;
                      if (!hasValidCost && aiEstimation?.estimatedMaterialCosts?.perMaterial) {
                        // Find matching material from AI estimates
                        const aiMaterial = aiEstimation.estimatedMaterialCosts.perMaterial.find(
                          (m) => m.component?.toLowerCase() === mat.component?.toLowerCase() ||
                                 m.material?.toLowerCase() === mat.material?.toLowerCase()
                        );
                        if (aiMaterial?.estimatedCost) {
                          estimatedUnitCost = aiMaterial.estimatedCost;
                        }
                      }
                      // Fallback: distribute total across unique materials
                      if (!hasValidCost && estimatedUnitCost === null && aiEstimation?.estimatedMaterialCosts?.totalPerUnit && uniqueMaterials.length > 0) {
                        estimatedUnitCost = aiEstimation.estimatedMaterialCosts.totalPerUnit / uniqueMaterials.length;
                      }

                      // Keep original string for display if it has currency/unit info
                      const unitCostDisplay = hasValidCost
                        ? (unitCostStr.includes('/') ? unitCostStr : `$${unitCost.toFixed(2)}`)
                        : estimatedUnitCost !== null
                          ? `~$${estimatedUnitCost.toFixed(2)}`
                          : 'TBD';

                      return (
                        <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{mat.component}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{mat.material}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className={cn("text-xs font-medium", !hasValidCost && "text-muted-foreground italic")}>{unitCostDisplay}</p>
                            <p className="text-[10px] text-muted-foreground">×{mat.quantityPerUnit || 1}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No materials specified yet
                  </p>
                )}

                {uniqueMaterials.length > 0 && (
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Est. Material Cost/Unit</span>
                    <span className={cn("text-sm font-bold", totalMaterialCost === 0 && aiEstimation?.estimatedMaterialCosts?.totalPerUnit && "text-muted-foreground")}>
                      {totalMaterialCost > 0
                        ? `$${totalMaterialCost.toFixed(2)}`
                        : aiEstimation?.estimatedMaterialCosts?.totalPerUnit
                          ? `~$${aiEstimation.estimatedMaterialCosts.totalPerUnit.toFixed(2)}`
                          : '$0.00'}
                    </span>
                  </div>
                )}
              </Card>

              {/* Hardware */}
              {hardware.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Hardware & Components</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {hardware.map((hw, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px]">
                        {hw}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Share with Manufacturer */}
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Share with Manufacturer</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Share your product page with your manufacturer or supplier to receive a quote.
                </p>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border mb-3">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-orange-500" />
                    )}
                    <div>
                      <Label htmlFor="public-toggle-overview" className="text-xs font-medium">
                        {isPublic ? "Public" : "Private"}
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        {isPublic ? "Anyone with link can view" : "Only you can view"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="public-toggle-overview"
                    checked={isPublic}
                    onCheckedChange={handleToggleVisibility}
                    disabled={isTogglingVisibility}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-background rounded-md border text-xs truncate text-muted-foreground">
                    {publicShareUrl || "Loading..."}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCopyLink}
                    disabled={!publicShareUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => window.open(publicShareUrl, "_blank")}
                  disabled={!publicShareUrl}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  Preview Product Page
                </Button>
              </Card>
            </>
          )}

          {/* Sample Tab */}
          {activeTab === "sample" && (
            <>
              {/* Sample Cost Breakdown */}
              <Card className="p-4 bg-gradient-to-br from-secondary/30 to-secondary/50 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-base">Order a Sample</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Get a physical prototype before committing to production
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Sample production</span>
                    <span className="font-medium">{sampleCostDisplay}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sample shipping</span>
                    <span className="font-medium">$15 – $45</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lead time</span>
                    <span className="font-medium">{sampleTimeline}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Estimated Total</span>
                    <span>{sampleCostDisplay} + shipping</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-secondary text-[10px] text-foreground">
                  Final quote and lead time confirmed by manufacturer.
                </div>
              </Card>

              {/* How a Sample Is Made */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">How a Sample Is Made</h3>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: Layers,
                      title: "Materials & Components Prepared",
                      desc: "Fabrics, plastics, metals, foams, electronics, or other parts required for your product.",
                    },
                    {
                      icon: Scissors,
                      title: "Prototype Setup",
                      desc: "Patterns, molds, cutting files, or assembly steps prepared for one prototype.",
                    },
                    {
                      icon: Wrench,
                      title: "Sample Manufacturing",
                      desc: "Your sample is built, assembled, finished, or molded based on your specs.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "QC & Shipping",
                      desc: "Product is checked, packed, and shipped to your address.",
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{idx + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-0.5">{step.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Share with Manufacturer CTA */}
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Share with Manufacturer</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Share your product page with your manufacturer or supplier to receive a quote.
                </p>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border mb-3">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-orange-500" />
                    )}
                    <div>
                      <Label htmlFor="public-toggle-sample" className="text-xs font-medium">
                        {isPublic ? "Public" : "Private"}
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        {isPublic ? "Anyone with link can view" : "Only you can view"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="public-toggle-sample"
                    checked={isPublic}
                    onCheckedChange={handleToggleVisibility}
                    disabled={isTogglingVisibility}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-background rounded-md border text-xs truncate text-muted-foreground">
                    {publicShareUrl || "Loading..."}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCopyLink}
                    disabled={!publicShareUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => window.open(publicShareUrl, "_blank")}
                  disabled={!publicShareUrl}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  Preview Product Page
                </Button>
              </Card>
            </>
          )}

          {/* Production Tab */}
          {activeTab === "production" && (
            <>
              {/* Production Cost Breakdown */}
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Factory className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-base">Order 1,000 Units</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Full production run with bulk pricing
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Production (1,000 units)</span>
                    <span className="font-medium">{productionCostDisplay}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Per unit cost</span>
                    <span className="font-medium">{perUnitDisplay}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping (sea freight)</span>
                    <span className="font-medium">$800 – $2,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lead time</span>
                    <span className="font-medium">{productionTimeline}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Estimated Total</span>
                    <span>{productionCostDisplay} + shipping</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-secondary text-[10px] text-foreground">
                  Pricing and timing vary by factory, materials, complexity, and shipping method.
                </div>
              </Card>

              {/* How Production Works */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">How a Full Production Run Works</h3>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: ClipboardCheck,
                      title: "Confirm Order Details",
                      desc: "Quantities, variations (sizes, colors, SKUs), and final specs.",
                    },
                    {
                      icon: Box,
                      title: "Bulk Material Booking",
                      desc: "All required fabrics, components, materials, packaging, etc.",
                    },
                    {
                      icon: Factory,
                      title: "Mass Production",
                      desc: "Cutting, molding, assembly, finishing, or fabrication at scale.",
                    },
                    {
                      icon: Ship,
                      title: "Final QC & Freight",
                      desc: "Packed, labeled, and shipped via air or sea freight.",
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{idx + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-0.5">{step.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-2 rounded bg-muted text-[10px] text-muted-foreground">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Production lead times depend on product complexity, materials, tooling, and factory workflow.
                </div>
              </Card>

              {/* Volume Options */}
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3">Volume Options</h3>
                <div className="space-y-2">
                  {[
                    { qty: 500, perUnit: fallbackCosts.perUnitMax * 1.2, lead: "20–45 days" },
                    { qty: 1000, perUnit: (fallbackCosts.perUnitMin + fallbackCosts.perUnitMax) / 2, lead: productionTimeline },
                    { qty: 2500, perUnit: fallbackCosts.perUnitMin * 0.9, lead: "35–75 days" },
                    { qty: 5000, perUnit: fallbackCosts.perUnitMin * 0.8, lead: "45–90 days" },
                  ].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedQuantity(opt.qty)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer",
                        selectedQuantity === opt.qty
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium">{opt.qty.toLocaleString()} units</p>
                        <p className="text-[10px] text-muted-foreground">{opt.lead}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${opt.perUnit.toFixed(2)}/unit</p>
                        <p className="text-[10px] text-muted-foreground">
                          ~${Math.round(opt.qty * opt.perUnit).toLocaleString()} total
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Share with Manufacturer CTA */}
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Share with Manufacturer</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Share your product page with your manufacturer or supplier to receive a quote.
                </p>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border mb-3">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-orange-500" />
                    )}
                    <div>
                      <Label htmlFor="public-toggle-production" className="text-xs font-medium">
                        {isPublic ? "Public" : "Private"}
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        {isPublic ? "Anyone with link can view" : "Only you can view"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="public-toggle-production"
                    checked={isPublic}
                    onCheckedChange={handleToggleVisibility}
                    disabled={isTogglingVisibility}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-background rounded-md border text-xs truncate text-muted-foreground">
                    {publicShareUrl || "Loading..."}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCopyLink}
                    disabled={!publicShareUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => window.open(publicShareUrl, "_blank")}
                  disabled={!publicShareUrl}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  Preview Product Page
                </Button>
              </Card>
            </>
          )}

          {/* Footer Disclaimer */}
          <div className="pt-4 border-t">
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              Estimates are AI-generated based on your product specifications.
              Actual costs depend on factory location, materials availability,
              and current market conditions.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
