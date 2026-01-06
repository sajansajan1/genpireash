/**
 * Main MultiViewEditor component (modular version)
 * Orchestrates all sub-components with Zustand store
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// Removed Dialog imports - not needed for full-screen layout
import { Button } from "@/components/ui/button";
import { devLog, devLogOnce } from "../../utils/devLogger";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewsDisplay } from "../ViewsDisplay";
import { ChatInterface } from "../ChatInterface";
import { RevisionHistory } from "../RevisionHistory";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { FrontViewApproval } from "../FrontViewApproval";
import { ProgressiveViewsGeneration } from "../ProgressiveViewsGeneration";
import { CreativeLoadingAnimation } from "../CreativeLoadingAnimation";
import { useEditorStore, type WorkflowMode } from "../../store/editorStore";
import { useChatStore } from "../../store/chatStore";
import { useChatMessages } from "../../hooks/useChatMessages";
// extractProductNameAction now used in useProductManagement hook
import {
  generateFrontViewOnly,
  handleFrontViewDecision,
  generateRemainingViews,
  createRevisionAfterApproval,
  convertToRegularMode,
} from "@/app/actions/progressive-generation-workflow";
import { useUserStore } from "@/lib/zustand/useStore";
import { Box, Sparkles, X } from "lucide-react";
import { History, MessageSquare, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GenpireLogo } from "@/components/ui/genpire-logo";
import type { MultiViewEditorProps, ViewType } from "../../types";
import { GenerationProgressModal } from "@/components/generation-progress-modal";
import { sendTechPackCreation } from "@/app/actions/send-mail";
import { GenerationProgressIndicator } from "@/components/generation-progress-indicator";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
// getUserProducts now used in useProductManagement hook
import type { UserProduct } from "@/app/actions/get-user-products";
import { track, AnalyticsEvents } from "@/lib/analytics";
import dynamic from "next/dynamic";

// Dynamically import 3D viewer component (client-side only)
const Model3DViewer = dynamic(
  () =>
    import("@/components/3d-viewer/Model3DViewer").then(
      (mod) => mod.Model3DViewer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        Loading 3D viewer...
      </div>
    ),
  }
);
import { useRouter } from "next/navigation";

// Extracted modular components
import { CreditsDisplay } from "./CreditsDisplay";
import { LoadingOverlay } from "./LoadingOverlay";
import { FloatingControls } from "./FloatingControls";
import { BottomControlsBar } from "./BottomControlsBar";
import { EditorHeader } from "./EditorHeader";

// Custom business logic hooks
import { useProductManagement } from "../../hooks/business-logic/useProductManagement";
import { useTechPackGeneration } from "../../hooks/business-logic/useTechPackGeneration";
import { use3DModelViewer } from "../../hooks/business-logic/use3DModelViewer";

// Tech Pack Integration
import { TechPackView } from "./TechPackView";
import { WorkflowModeSwitcher } from "./WorkflowModeSwitcher";
import { useTechPackData } from "../../hooks/tech-pack/useTechPackData";
import { useTechPackFiles } from "../../hooks/tech-pack/useTechPackFiles";
import { useTechPackGeneration as useTechPackV2Generation } from "../../hooks/useTechPackGeneration";
import type { TechPackActionHandlers, TechFilesData, TechPackStateInfo } from "../ChatInterface";

// Product Specs Modal
import { ProductSpecsModal, type DimensionsData } from "../ProductSpecsModal";
import { hasProductDimensions, getProductDimensions } from "@/app/actions/product-dimensions";
import type { GenerationMode } from "@/app/actions/create-product-entry";

export function MultiViewEditor(props: MultiViewEditorProps) {
  const {
    isOpen,
    onClose,
    productId,
    productName = "Product",
    productDescription = "",
    currentViews: initialViews,
    revisions: initialRevisions,
    isInitialGeneration = false,
    initialPrompt = "",
    onEditViews,
    onProgressiveEdit,
    onGenerateInitialImages,
    onRollback,
    onDeleteRevision,
    onRevisionsChange,
    onGenerateTechPack,
    setShowIndicatorModal,
    setShowTutorialModal,
    setShowPaymentModal,
    productLinkedRevisionId,
    isDemo = false,
  } = props;

  // Local state for selected revision and UI
  const [selectedRevision, setSelectedRevision] = useState<any>(null);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<string>("views");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [frontViewVersions, setFrontViewVersions] = useState<
    Array<{
      id: string;
      frontViewUrl: string;
      iterationNumber: number;
      createdAt: string;
    }>
  >([]);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false); // Only true when actually checking
  const [isCleaningSession, setIsCleaningSession] = useState(false); // True when cleaning on close
  // Product dimensions modal state
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [existingDimensions, setExistingDimensions] = useState<DimensionsData | null>(null);
  const [pendingWorkflowMode, setPendingWorkflowMode] = useState<WorkflowMode | null>(null);
  // Generation mode state (for B&W sketch conversion)
  const [generationMode, setGenerationMode] = useState<GenerationMode>("regular");
  const [isConvertingToRegular, setIsConvertingToRegular] = useState(false);
  // Store references
  const viewsDisplayRef = useRef<HTMLDivElement>(null);
  const initialGenerationTriggered = useRef(false);
  const isInitialGenerationSetRef = useRef(false);
  const generationInProgress = useRef(false); // Track if generation is currently running
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const credits = getCreatorCredits;
  const refetch = refresCreatorCredits;
  // Store state
  const {
    setProductInfo,
    setCurrentViews,
    setRevisions,
    currentViews,
    revisions,
    showHistory,
    toggleHistory,
    isVisualEditMode,
    setVisualEditMode,
    viewport,
    setViewport,
    loadingViews,
    setAllLoadingViews,
    setLoadingView,
    setIsInitialGeneration,
    // Progressive generation workflow state
    workflowMode,
    setWorkflowMode,
    generationState,
    setGenerationState,
    frontViewApproval,
    setFrontViewApproval,
    updateViewProgress,
    resetWorkflowState,
  } = useEditorStore();

  const {
    isProcessing,
    setIsProcessing,
    reset: resetChatStore,
  } = useChatStore();

  // Custom hooks for business logic (after store initialization)
  const {
    userProducts,
    extractedProductName,
    isProductDropdownOpen,
    setIsProductDropdownOpen,
  } = useProductManagement(productId, currentViews);

  const {
    isGeneratingTechPack,
    techPackGeneratedFor,
    revisionTechPacks,
    generateTechPack,
  } = useTechPackGeneration();

  const {
    has3DModel,
    model3DUrl,
    show3DViewer,
    setHas3DModel,
    setModel3DUrl,
    openViewer: open3DViewer,
    closeViewer: close3DViewer,
  } = use3DModelViewer();

  // Tech Pack integration
  const {
    techPack,
    loading: techPackLoading,
    refresh: refreshTechPack,
  } = useTechPackData(productId);
  const { downloadPDF, downloadExcel, generateTechnicalFiles } =
    useTechPackFiles(techPack);

  // Tech Pack V2 hook for chat integration - get generation methods
  const techPackV2 = useTechPackV2Generation({
    productId: productId || "",
    revisionIds: selectedRevision?.views
      ? [
        selectedRevision.views.front?.revisionId ||
        selectedRevision.views.back?.revisionId ||
        selectedRevision.views.side?.revisionId ||
        selectedRevision.views.top?.revisionId ||
        selectedRevision.views.bottom?.revisionId,
      ].filter(Boolean)
      : [],
    primaryImageUrl:
      currentViews.front ||
      currentViews.back ||
      currentViews.side ||
      currentViews.top ||
      currentViews.bottom ||
      "",
  });

  // Create tech pack action handlers for chat interface
  const techPackActions: TechPackActionHandlers = useMemo(() => ({
    generateBaseViews: techPackV2.generateBaseViewsOnly,
    generateCloseUps: techPackV2.regenerateAllCloseUps,
    generateSketches: techPackV2.regenerateAllSketches,
    generateComponents: techPackV2.regenerateAllComponents,
    generateAll: techPackV2.generateTechPack,
  }), [
    techPackV2.generateBaseViewsOnly,
    techPackV2.regenerateAllCloseUps,
    techPackV2.regenerateAllSketches,
    techPackV2.regenerateAllComponents,
    techPackV2.generateTechPack,
  ]);

  // Check if dimensions are approved before switching to tech-pack mode
  const checkDimensionsAndSwitchMode = useCallback(async (targetMode: WorkflowMode) => {
    // Only check dimensions when switching to tech-pack mode
    if (targetMode === "tech-pack" && productId) {
      try {
        const result = await hasProductDimensions(productId);
        console.log("[Dimensions Check] Result:", result);

        // Show modal if dimensions haven't been approved yet
        // Note: !result.hasDimensions means no approved dimensions exist
        if (!result.hasDimensions) {
          console.log("[Dimensions Check] No approved dimensions - showing modal");
          // Try to get existing dimensions (might be partially filled)
          const dimensionsResult = await getProductDimensions(productId);
          if (dimensionsResult.success) {
            setExistingDimensions(dimensionsResult.data || null);
          }
          setPendingWorkflowMode(targetMode);
          setShowDimensionsModal(true);
          return;
        }
        console.log("[Dimensions Check] Dimensions already approved - proceeding to tech-pack");
      } catch (error) {
        console.error("[Dimensions Check] Error checking dimensions:", error);
        // If there's an error (e.g., column doesn't exist), show the modal anyway
        console.log("[Dimensions Check] Showing modal due to error");
        setPendingWorkflowMode(targetMode);
        setShowDimensionsModal(true);
        return;
      }
    }

    // Switch to the target mode
    setWorkflowMode(targetMode);
  }, [productId, setWorkflowMode]);

  // Handler for dimensions approval
  const handleDimensionsApproved = useCallback((dimensions: DimensionsData) => {
    setShowDimensionsModal(false);
    setExistingDimensions(dimensions);

    // Switch to the pending mode after dimensions are approved
    if (pendingWorkflowMode) {
      setWorkflowMode(pendingWorkflowMode);
      setPendingWorkflowMode(null);
    }
  }, [pendingWorkflowMode, setWorkflowMode]);

  // Handler for dimensions modal close
  const handleDimensionsModalClose = useCallback(() => {
    setShowDimensionsModal(false);
    setPendingWorkflowMode(null);
  }, []);

  // Callback to switch to tech-pack mode from chat
  const handleSwitchToTechPack = useCallback(() => {
    checkDimensionsAndSwitchMode("tech-pack");
  }, [checkDimensionsAndSwitchMode]);

  // Create tech files data for chat context-aware Q&A
  const techFilesData: TechFilesData = useMemo(() => ({
    category: techPackV2.category || undefined,
    baseViews: techPackV2.baseViews.length > 0 ? techPackV2.baseViews.map(v => ({
      viewType: v.viewType,
      analysisData: v.analysisData,
    })) : undefined,
    components: techPackV2.components.length > 0 ? techPackV2.components
      .filter(c => c.loadingState === 'loaded')
      .map(c => ({
        componentName: c.componentName,
        componentType: c.componentType,
        guide: c.guide,
      })) : undefined,
    closeUps: techPackV2.closeUps.length > 0 ? techPackV2.closeUps
      .filter(c => c.loadingState === 'loaded')
      .map(c => ({
        shotMetadata: c.shotMetadata,
        summary: c.summary,
      })) : undefined,
    sketches: techPackV2.sketches.length > 0 ? techPackV2.sketches
      .filter(s => s.loadingState === 'loaded')
      .map(s => ({
        viewType: s.viewType,
        summary: s.summary,
        measurements: s.measurements,
      })) : undefined,
  }), [
    techPackV2.category,
    techPackV2.baseViews,
    techPackV2.components,
    techPackV2.closeUps,
    techPackV2.sketches,
  ]);

  // Create tech pack state info for chat validation
  const techPackState: TechPackStateInfo = useMemo(() => ({
    hasBaseViews: techPackV2.baseViews.length > 0 && techPackV2.baseViews.some(v => v.analysisData),
  }), [techPackV2.baseViews]);

  // Memoize computed values to prevent unnecessary re-renders
  const currentViewsEmpty = useMemo(
    () => Object.values(currentViews).every((v) => !v || v === ""),
    [currentViews]
  );

  const actualIsInitialGeneration = useMemo(
    () => currentViewsEmpty && (!initialRevisions || initialRevisions.length === 0),
    [currentViewsEmpty, initialRevisions]
  );

  // Log initial generation status (after store is initialized) - only once
  devLogOnce(
    "multiview-mount",
    `🎯 MultiViewEditor Component Mounted - productId: ${productId}`
  );

  // Get user data from store
  const { user, refreshUserCredits } = useUserStore();

  // Callback to refresh both credits and revisions after successful generation
  const handleRevisionSuccess = useCallback(async () => {
    // Refresh user credits from both stores
    if (refreshUserCredits) {
      await refreshUserCredits();
    }
    refetch(); // Also refresh credits store (source of truth)

    // Reload revisions to update the UI
    if (productId) {
      try {
        const { getGroupedMultiViewRevisions } = await import(
          "@/app/actions/ai-image-edit-new-table"
        );
        // Skip cache to get fresh data from database
        const revisionsResult = await getGroupedMultiViewRevisions(
          productId,
          true
        );

        if (revisionsResult.success && revisionsResult.revisions) {
          setRevisions(revisionsResult.revisions);

          if (onRevisionsChange) {
            onRevisionsChange(revisionsResult.revisions);
          }

          devLog(
            "revisions-refreshed",
            { count: revisionsResult.revisions.length },
            "Revisions reloaded after generation"
          );
        }
      } catch (error) {
        console.error("Failed to reload revisions:", error);
      }
    }
  }, [refreshUserCredits, productId, onRevisionsChange, setRevisions, refetch]);

  // Custom hooks
  const { sendUserMessage, sendMessage } = useChatMessages(
    productId,
    productName,
    handleRevisionSuccess
  );

  // Calculate if the system is busy (processing or loading)
  const isSystemBusy =
    isProcessing || Object.values(loadingViews).some((loading) => loading);

  useEffect(() => {
    if (!credits) {
      refetch();
    }
  }, [credits, refetch]);

  // Product fetching is now handled by useProductManagement hook

  // CRITICAL: Clear Zustand store state when productId changes
  // This prevents old product views from showing when starting a new product
  const previousProductIdRef = useRef<string | null>(null);
  useEffect(() => {
    // If productId changed (not just initial mount)
    if (
      previousProductIdRef.current !== null &&
      previousProductIdRef.current !== productId
    ) {
      // console.log("🔄 Product ID changed - clearing all Zustand store state");
      // console.log(`  Previous: ${previousProductIdRef.current}`);
      // console.log(`  New: ${productId}`);

      // Clear ALL views in store immediately
      setCurrentViews({
        front: "",
        back: "",
        side: "",
        top: "",
        bottom: "",
      });

      // Clear revisions
      setRevisions([]);

      // Reset workflow state
      resetWorkflowState();

      // Clear loading states
      setAllLoadingViews(false);

      // Clear local state
      setFrontViewVersions([]);
      initialGenerationTriggered.current = false;

      devLog(
        "product-change-cleanup",
        { oldId: previousProductIdRef.current, newId: productId },
        "Cleared all state for new product"
      );
    }

    // Update previous productId reference
    previousProductIdRef.current = productId;
  }, [
    productId,
    setCurrentViews,
    setRevisions,
    resetWorkflowState,
    setAllLoadingViews,
  ]);

  // Check if product has 3D model
  useEffect(() => {
    const check3DModel = async () => {
      if (!productId) return;

      try {
        const response = await fetch(
          `/api/product-3d-models?sourceType=product&sourceId=${productId}`
        );
        const result = await response.json();

        if (result.success && result.model && result.model.model_urls?.glb) {
          setHas3DModel(true);
          setModel3DUrl(result.model.model_urls.glb);
        } else {
          setHas3DModel(false);
          setModel3DUrl(null);
        }
      } catch (error) {
        console.error("Error checking 3D model:", error);
        setHas3DModel(false);
        setModel3DUrl(null);
      }
    };

    check3DModel();
  }, [productId]);

  // Update isInitialGeneration in the store only once on mount
  useEffect(() => {
    if (!isInitialGenerationSetRef.current) {
      setIsInitialGeneration(actualIsInitialGeneration);
      isInitialGenerationSetRef.current = true;
    }
  }, [actualIsInitialGeneration, setIsInitialGeneration]);

  // Track selected revision and update when active changes
  useEffect(() => {
    const activeRevision = revisions.find((r: any) => r.isActive);
    if (activeRevision) {
      setSelectedRevision(activeRevision);
    }
  }, [revisions]);

  // Load tech pack data for each revision
  useEffect(() => {
    const loadTechPacksForRevisions = async () => {
      if (!revisions || revisions.length === 0) return;

      devLog(
        "load-tech-packs",
        `Loading tech packs for ${revisions.length} revisions...`
      );

      const techPacksMap: Record<string, boolean> = {};

      // Import the getTechPacksForProduct function to check by revision_number
      const { getTechPacksForProduct } = await import(
        "@/app/actions/tech-pack-management"
      );

      try {
        // Get all tech packs for this product
        const result = await getTechPacksForProduct(productId);

        if (result.success && result.techPacks) {
          devLog(
            "load-tech-packs",
            `✅ Fetched ${result.techPacks.length} tech packs`
          );

          // Create a map of revision_number to tech pack existence
          const revisionNumberMap: Record<number, boolean> = {};
          result.techPacks.forEach((tp: any) => {
            if (tp.revision_number) {
              revisionNumberMap[tp.revision_number] = true;
            }
          });

          // Map tech packs to revision IDs (using batch_id as ID)
          revisions.forEach((revision) => {
            if (revision.revisionNumber) {
              techPacksMap[revision.id] =
                revisionNumberMap[revision.revisionNumber] || false;
            } else {
              techPacksMap[revision.id] = false;
            }
          });

          devLog("load-tech-packs", { techPacksMap }, "Tech packs mapped");
        }
      } catch (error) {
        console.error("Error loading tech packs for revisions:", error);
        // Set all to false on error
        revisions.forEach((revision) => {
          techPacksMap[revision.id] = false;
        });
      }

      // Note: Tech pack state is now managed by useTechPackGeneration hook
      // This loading logic may need to be moved into the hook if needed for UI
    };

    loadTechPacksForRevisions();
  }, [revisions, productId]);

  // Update current views when selected revision changes
  useEffect(() => {
    if (selectedRevision && selectedRevision.views) {
      devLog(
        "update-views",
        { revisionId: selectedRevision.id },
        "Updating views from revision"
      );
      const revisionViews = {
        front: selectedRevision.views.front?.imageUrl || "",
        back: selectedRevision.views.back?.imageUrl || "",
        side: selectedRevision.views.side?.imageUrl || "",
        top: selectedRevision.views.top?.imageUrl || "",
        bottom: selectedRevision.views.bottom?.imageUrl || "",
      };

      // Only update if views are actually different
      const viewsChanged = Object.keys(revisionViews).some(
        (key) =>
          revisionViews[key as keyof typeof revisionViews] !==
          currentViews[key as keyof typeof currentViews]
      );

      if (viewsChanged) {
        setCurrentViews(revisionViews);
      }
    }
  }, [selectedRevision?.id]);

  // Track when initial generation completes (backup check)
  useEffect(() => {
    if (
      initialGenerationTriggered.current &&
      currentViews &&
      currentViews.front &&
      currentViews.back &&
      currentViews.side &&
      currentViews.top &&
      currentViews.bottom &&
      // Check if all views have actual URLs (not placeholders)
      !currentViews.front.includes("placeholder") &&
      !currentViews.back.includes("placeholder") &&
      !currentViews.side.includes("placeholder") &&
      !currentViews.top.includes("placeholder") &&
      !currentViews.bottom.includes("placeholder")
    ) {
      // Clear processing state (backup in case the main handler didn't)
      if (isProcessing) {
        devLogOnce(
          "backup-completion",
          "🔄 Backup completion check - clearing states"
        );
        setIsProcessing(false);
        setAllLoadingViews(false);
        setRevisionsLoading(false);
      }

      // Mark initial generation as complete
      initialGenerationTriggered.current = false;
    }
  }, [currentViews, isProcessing, setIsProcessing, setAllLoadingViews]);

  // Product name extraction is now handled by useProductManagement hook

  // Sync revisions prop from parent with Zustand store
  useEffect(() => {
    if (initialRevisions && initialRevisions.length > 0) {
      // console.log("📥 Syncing revisions from parent:", initialRevisions.length);
      setRevisions(initialRevisions);

      // Also update current views to match the active revision
      const activeRevision = initialRevisions.find((r: any) => r.isActive);
      if (activeRevision && activeRevision.views) {
        // console.log(
        //   "🔄 Updating views to match active revision:",
        //   activeRevision.revisionNumber
        // );
        setCurrentViews({
          front:
            typeof activeRevision.views.front === "string"
              ? activeRevision.views.front
              : activeRevision.views.front?.imageUrl || "",
          back:
            typeof activeRevision.views.back === "string"
              ? activeRevision.views.back
              : activeRevision.views.back?.imageUrl || "",
          side:
            typeof activeRevision.views.side === "string"
              ? activeRevision.views.side
              : activeRevision.views.side?.imageUrl || "",
          top:
            typeof activeRevision.views.top === "string"
              ? activeRevision.views.top
              : activeRevision.views.top?.imageUrl || "",
          bottom:
            typeof activeRevision.views.bottom === "string"
              ? activeRevision.views.bottom
              : activeRevision.views.bottom?.imageUrl || "",
        });
      }
    }
  }, [initialRevisions, setRevisions, setCurrentViews]);

  // Initialize with DB as single source of truth
  useEffect(() => {
    if (isOpen && productId) {
      // console.log(
      //   "🚀 Initializing AI Designer - Fetching from DB (source of truth)"
      // );

      // Step 1: Set loading states - but don't clear views yet to prevent flash
      setIsCheckingApproval(true);
      setRevisionsLoading(true);

      // Step 2: Clear non-visual state when productId changes
      // console.log("🧹 Clearing state for new product:", productId);
      resetChatStore(); // Clear chat messages
      setFrontViewVersions([]); // Clear front view versions
      // Note: Don't clear currentViews here - let them be replaced when data loads
      setFrontViewApproval({
        status: "pending",
        imageUrl: null,
        approvalId: null,
        iterationCount: 0,
      }); // Reset front view approval to initial state
      setCurrentViews({
        front: "",
        back: "",
        side: "",
        top: "",
        bottom: "",
      });
      setRevisions([]);

      // Step 3: Set product info only (no views/revisions from props)
      setProductInfo(productId, productName, productDescription);

      // Step 4: Load complete state from database
      const loadProductState = async () => {
        try {
          // Import DB functions
          const { getGroupedMultiViewRevisions } = await import(
            "@/app/actions/ai-image-edit-new-table"
          );
          const { getPendingFrontViewApproval } = await import(
            "@/app/actions/progressive-generation-workflow"
          );
          const { supabase } = await import("@/lib/supabase/client");

          // Fetch generation_mode from product_ideas
          const { data: productData, error: productError } = await supabase
            .from("product_ideas")
            .select("generation_mode")
            .eq("id", productId)
            .single();

          if (productData?.generation_mode) {
            setGenerationMode(productData.generation_mode as GenerationMode);
          }

          // console.log("📊 Step 1: Checking for revisions...");
          // Try to load revisions first (completed products)
          const revisionsResult = await getGroupedMultiViewRevisions(productId);

          if (
            revisionsResult.success &&
            revisionsResult.revisions?.length > 0
          ) {
            // ✅ HAS REVISIONS → Product complete, show multi-view editor
            // console.log(
            //   `✅ Found ${revisionsResult.revisions.length} revision(s) - Product is complete`
            // );

            setRevisions(revisionsResult.revisions);
            if (onRevisionsChange) {
              onRevisionsChange(revisionsResult.revisions);
            }

            // Load views from active revision
            const activeRevision = revisionsResult.revisions.find(
              (r: any) => r.isActive
            );
            if (activeRevision?.views) {
              // console.log("📥 Loading views from active revision");
              setCurrentViews({
                front: activeRevision.views.front?.imageUrl || "",
                back: activeRevision.views.back?.imageUrl || "",
                side: activeRevision.views.side?.imageUrl || "",
                top: activeRevision.views.top?.imageUrl || "",
                bottom: activeRevision.views.bottom?.imageUrl || "",
              });
              // Immediately clear loading states when views are loaded from DB
              setAllLoadingViews(false);
            }

            // Set to completed multi-view state
            setWorkflowMode("multi-view");
            setGenerationState("completed");
            initialGenerationTriggered.current = false;

            // console.log("✅ State: Multi-view editor with completed product");
          } else {
            // ❌ NO REVISIONS → Check for pending front view approval
            // console.log(
            //   "📊 Step 2: No revisions found, checking for pending approval..."
            // );

            const approvalResult = await getPendingFrontViewApproval(productId);

            if (approvalResult.success && approvalResult.approval) {
              // ✅ HAS PENDING APPROVAL → Show front view approval UI
              // console.log(
              //   `✅ Found pending approval (iteration ${approvalResult.approval.iteration_number})`
              // );

              setWorkflowMode("front-view");
              setFrontViewApproval({
                status: "pending",
                imageUrl: approvalResult.approval.front_view_url,
                approvalId: approvalResult.approval.id,
                iterationCount: approvalResult.approval.iteration_number || 1,
              });
              setCurrentViews({
                front: approvalResult.approval.front_view_url,
              });
              setGenerationState("awaiting_front_approval");
              initialGenerationTriggered.current = false;

              // console.log("✅ State: Front view approval workflow");
            } else {
              // ❌ NO APPROVAL → Fresh product, ready for generation
              // console.log(
              //   "📊 Step 3: No approval found - Fresh product ready for generation"
              // );

              setWorkflowMode(null);
              setGenerationState("idle");
              setCurrentViews({
                front: "",
                back: "",
                side: "",
                top: "",
                bottom: "",
              });
              setRevisions([]);
              initialGenerationTriggered.current = false;

              // console.log("✅ State: Ready for new generation");
            }
          }
        } catch (error) {
          console.error("❌ Error loading product state from DB:", error);
          setGenerationState("error");
        } finally {
          setIsCheckingApproval(false);
          setRevisionsLoading(false);
          // console.log("✅ Initialization complete");
        }
      };

      loadProductState();
    }
  }, [
    isOpen,
    productId,
    productName,
    productDescription,
    setProductInfo,
    setCurrentViews,
    setRevisions,
    setFrontViewApproval,
    setGenerationState,
    setWorkflowMode,
    onRevisionsChange,
    resetChatStore,
  ]);

  // Load views from active revision when views are empty but revisions exist
  // This handles the case when app resumes from background
  useEffect(() => {
    const loadViewsFromRevision = () => {
      // Check if we're in completed state with revisions but empty views
      const hasRevisions = revisions.length > 0;
      const viewsEmpty = Object.values(currentViews).every(
        (v) => !v || v === ""
      );
      const isCompletedState =
        generationState === "completed" || generationState === "idle";

      // CRITICAL: Don't reload if we're in multi-view workflow mode
      // This prevents overwriting views right after generation completes
      if (workflowMode === "multi-view") {
        // console.log(
        //   "⚠️ Skipping reload - in multi-view workflow, views should already be set"
        // );
        return;
      }

      if (isCompletedState && hasRevisions && viewsEmpty && isOpen) {
        devLog(
          "reload-views-from-revision",
          { revisionsCount: revisions.length },
          "Views empty but revisions exist - reloading from active revision"
        );

        // Find the active revision
        const activeRevision = revisions.find((r: any) => r.isActive);
        if (activeRevision?.views) {
          // console.log("📥 Loading views from revision:", {
          //   front: !!activeRevision.views.front,
          //   back: !!activeRevision.views.back,
          //   side: !!activeRevision.views.side,
          //   top: !!activeRevision.views.top,
          //   bottom: !!activeRevision.views.bottom,
          // });

          setCurrentViews({
            front: activeRevision.views.front?.imageUrl || "",
            back: activeRevision.views.back?.imageUrl || "",
            side: activeRevision.views.side?.imageUrl || "",
            top: activeRevision.views.top?.imageUrl || "",
            bottom: activeRevision.views.bottom?.imageUrl || "",
          });
          devLog(
            "views-reloaded",
            {
              front: !!activeRevision.views.front,
              back: !!activeRevision.views.back,
              side: !!activeRevision.views.side,
              top: !!activeRevision.views.top,
              bottom: !!activeRevision.views.bottom,
            },
            "Views reloaded from active revision"
          );
        }
      }
    };

    loadViewsFromRevision();
  }, [
    isOpen,
    revisions,
    currentViews,
    generationState,
    workflowMode,
    setCurrentViews,
  ]);

  // Fetch front view versions when entering approval state or switching to front-view mode
  useEffect(() => {
    const fetchVersions = async () => {
      // Fetch when in approval state OR when viewing front versions mode
      const shouldFetch =
        productId &&
        (generationState === "awaiting_front_approval" ||
          workflowMode === "front-view");

      if (shouldFetch) {
        try {
          const { getAllFrontViewVersions } = await import(
            "@/app/actions/progressive-generation-workflow"
          );
          const result = await getAllFrontViewVersions(productId);

          if (result.success && result.versions) {
            const formattedVersions = result.versions.map((v: any) => ({
              id: v.id,
              frontViewUrl: v.front_view_url,
              iterationNumber: v.iteration_number,
              createdAt: v.created_at,
            }));
            // console.log("📦 Fetched front view versions:", formattedVersions);
            setFrontViewVersions(formattedVersions);

            // Auto-select the latest version (highest iteration number) if none is selected
            if (formattedVersions.length > 0 && !frontViewApproval.approvalId) {
              const latestVersion = formattedVersions.reduce(
                (latest: typeof formattedVersions[0], current: typeof formattedVersions[0]) =>
                  current.iterationNumber > latest.iterationNumber
                    ? current
                    : latest
              );

              setFrontViewApproval({
                status: "pending",
                imageUrl: latestVersion.frontViewUrl,
                approvalId: latestVersion.id,
                iterationCount: latestVersion.iterationNumber,
              });

              setCurrentViews({ front: latestVersion.frontViewUrl });
              // console.log("✅ Auto-selected latest version:", latestVersion.iterationNumber);
            }

            devLog(
              "versions-fetched",
              { count: formattedVersions.length },
              "Front view versions loaded"
            );
          } else {
            console.log("❌ No versions found or fetch failed:", result);
          }
        } catch (error) {
          console.error("Error fetching front view versions:", error);
        }
      }
    };

    fetchVersions();
  }, [productId, generationState, workflowMode]);

  // CRITICAL: Complete cleanup when modal closes
  // This prevents stale state from showing when reopening the editor
  useEffect(() => {
    if (!isOpen) {
      // console.log("🧹 Modal closed - performing complete cleanup");

      // Clear Zustand store state
      resetWorkflowState();
      resetChatStore(); // Clear all chat messages and state
      setCurrentViews({
        front: "",
        back: "",
        side: "",
        top: "",
        bottom: "",
      });
      setRevisions([]);
      setAllLoadingViews(false);

      // Clear local state
      setSelectedRevision(null);
      // Reset local state (hook-managed state resets automatically on unmount)
      setRevisionsLoading(false);
      setFrontViewVersions([]);
      setIsCheckingApproval(false); // Set to false, not true!
      setHas3DModel(false);
      setModel3DUrl(null);
      close3DViewer();

      // Reset refs
      initialGenerationTriggered.current = false;
      isInitialGenerationSetRef.current = false;

      // console.log("✅ Complete cleanup finished");
    }
  }, [
    isOpen,
    resetWorkflowState,
    resetChatStore,
    setCurrentViews,
    setRevisions,
    setAllLoadingViews,
  ]);

  // ========== Progressive Generation Workflow Handlers ==========

  /**
   * Handle switching to a different front view version
   */
  const handleVersionChange = useCallback(
    async (versionId: string) => {
      try {
        devLog(
          "version-change",
          { versionId },
          "Switching to different front view version"
        );

        // Find the selected version
        const selectedVersion = frontViewVersions.find(
          (v) => v.id === versionId
        );
        if (!selectedVersion) {
          console.error("Version not found:", versionId);
          return;
        }

        // Update the front view approval state with the selected version
        setFrontViewApproval({
          status: "pending",
          imageUrl: selectedVersion.frontViewUrl,
          approvalId: versionId,
          iterationCount: selectedVersion.iterationNumber,
        });

        // Update current views with the selected front view
        setCurrentViews({ front: selectedVersion.frontViewUrl });

        devLog(
          "version-changed",
          { iterationNumber: selectedVersion.iterationNumber },
          "Switched to front view version"
        );
      } catch (error) {
        console.error("Error changing version:", error);
      }
    },
    [frontViewVersions, setFrontViewApproval, setCurrentViews]
  );

  /**
   * Handle front view approval
   * When user approves the front view, proceed to generate remaining views
   */
  const handleApproveFrontView = useCallback(async () => {
    if (!frontViewApproval.approvalId) {
      console.error("No approval ID available");
      return;
    }

    try {
      devLog(
        "approve-front-view",
        { approvalId: frontViewApproval.approvalId },
        "Approving front view"
      );

      // Switch to multi-view workflow mode
      setWorkflowMode("multi-view");

      // IMMEDIATELY transition to generating additional views state
      // This ensures smooth UI transition without intermediate states
      setGenerationState("generating_additional_views");

      // IMPORTANT: Set the front view in currentViews first
      setCurrentViews({ front: frontViewApproval.imageUrl! });
      setLoadingView("front", false);

      // Set loading states for remaining views
      setLoadingView("back", true);
      setLoadingView("side", true);
      setLoadingView("top", true);
      setLoadingView("bottom", true);

      // Call server action to handle approval
      const result = await handleFrontViewDecision({
        approvalId: frontViewApproval.approvalId,
        action: "approve",
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to approve front view");
      }

      devLog(
        "front-view-approved",
        { extractedFeatures: result.extractedFeatures },
        "Front view approved"
      );

      // Save AI message about proceeding to generate remaining views
      await sendMessage(
        "Great! I'll now generate the back, side, top, and bottom views based on your approved front design. This will take about 2 minutes.",
        "ai"
      );

      // Transition to generating additional views state
      setGenerationState("generating_additional_views");

      // IMPORTANT: Set the front view in currentViews first
      setCurrentViews({ front: frontViewApproval.imageUrl! });
      setLoadingView("front", false);

      // Set loading states for remaining views
      setLoadingView("back", true);
      setLoadingView("side", true);
      setLoadingView("top", true);
      setLoadingView("bottom", true);
      // Update view progress
      updateViewProgress("front", "completed");
      updateViewProgress("back", "generating");
      updateViewProgress("side", "pending");
      updateViewProgress("top", "pending");
      updateViewProgress("bottom", "pending");

      // Generate remaining views
      // Pass selected revision number for structural reference (camera angle, positioning)
      // Design/colors will come from the new front view
      console.log("[MultiViewEditor] Generating remaining views with:", {
        approvalId: frontViewApproval.approvalId,
        frontViewUrl: frontViewApproval.imageUrl?.substring(0, 50),
        selectedRevisionNumber: selectedRevision?.revisionNumber,
        hasSelectedRevision: !!selectedRevision,
        selectedRevisionId: selectedRevision?.id,
      });
      const viewsResult = await generateRemainingViews({
        approvalId: frontViewApproval.approvalId,
        frontViewUrl: frontViewApproval.imageUrl!,
        selectedRevisionNumber: selectedRevision?.revisionNumber, // Use selected revision for structural reference
      });

      if (!viewsResult.success || !viewsResult.views) {
        throw new Error(
          viewsResult.error || "Failed to generate remaining views"
        );
      }

      devLog(
        "remaining-views-generated",
        { views: Object.keys(viewsResult.views) },
        "Remaining views generated"
      );

      // Update current views progressively as they complete
      const { back, side, top, bottom } = viewsResult.views;

      // Back view
      if (back) {
        setCurrentViews({ back });
        setLoadingView("back", false);
        updateViewProgress("back", "completed");
        updateViewProgress("side", "generating");
      }

      // Side view
      if (side) {
        setCurrentViews({ side });
        setLoadingView("side", false);
        updateViewProgress("side", "completed");
        updateViewProgress("top", "generating");
      }

      // Top view
      if (top) {
        setCurrentViews({ top });
        setLoadingView("top", false);
        updateViewProgress("top", "completed");
        updateViewProgress("bottom", "generating");
      }

      // Bottom view
      if (bottom) {
        setCurrentViews({ bottom });
        setLoadingView("bottom", false);
        updateViewProgress("bottom", "completed");
      }

      // Create revision after all views are generated
      setGenerationState("creating_revision");

      // Log all views before creating revision
      // console.log("📝 Creating revision with all 5 views:", {
      //   front: !!frontViewApproval.imageUrl,
      //   back: !!back,
      //   side: !!side,
      //   top: !!top,
      //   bottom: !!bottom,
      //   frontUrl: frontViewApproval.imageUrl?.substring(0, 50),
      //   backUrl: back?.substring(0, 50),
      //   sideUrl: side?.substring(0, 50),
      //   topUrl: top?.substring(0, 50),
      //   bottomUrl: bottom?.substring(0, 50),
      // });

      const revisionResult = await createRevisionAfterApproval({
        productId,
        approvalId: frontViewApproval.approvalId,
        allViews: {
          front: frontViewApproval.imageUrl!,
          back,
          side,
          top,
          bottom,
        },
        isInitial: actualIsInitialGeneration,
      });

      if (!revisionResult.success) {
        throw new Error(revisionResult.error || "Failed to create revision");
      }

      // console.log("✅ Revision created successfully:", {
      //   revisionNumber: revisionResult.revisionNumber,
      //   revisionIds: revisionResult.revisionIds,
      // });

      devLog(
        "revision-created",
        { revisionNumber: revisionResult.revisionNumber },
        "Revision created"
      );

      // Mark as completed and ensure all views are set
      setCurrentViews({
        front: frontViewApproval.imageUrl!,
        back,
        side,
        top,
        bottom,
      });

      // Clear all loading states
      setLoadingView("front", false);
      setLoadingView("back", false);
      setLoadingView("side", false);
      setLoadingView("top", false);
      setLoadingView("bottom", false);

      setGenerationState("completed");
      setIsProcessing(false);

      // Track design complete - all views generated
      track(AnalyticsEvents.DESIGN_COMPLETE, {
        product_id: productId,
        revision_number: revisionResult.revisionNumber,
        views_generated: 5,
      });

      // Refresh credits from both stores
      if (refreshUserCredits) {
        await refreshUserCredits();
      }
      refetch(); // Also refresh credits store (source of truth)

      // Save success message
      await sendMessage("All views generated successfully!", "success");

      // Load revisions
      setTimeout(async () => {
        setRevisionsLoading(true);
        try {
          const { getGroupedMultiViewRevisions } = await import(
            "@/app/actions/ai-image-edit-new-table"
          );
          const revisionsResult = await getGroupedMultiViewRevisions(productId);
          if (revisionsResult.success && revisionsResult.revisions) {
            setRevisions(revisionsResult.revisions);
            if (onRevisionsChange) {
              onRevisionsChange(revisionsResult.revisions);
            }
          }
        } catch (error) {
          console.error("Error loading revisions:", error);
        } finally {
          setRevisionsLoading(false);
        }
      }, 2000);
    } catch (error) {
      console.error("Error approving front view:", error);
      setGenerationState("error");
      setIsProcessing(false);
      setAllLoadingViews(false);

      // Track AI generation error for remaining views
      track(AnalyticsEvents.AI_GENERATION_ERROR, {
        product_id: productId,
        generation_type: "remaining_views",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });

      await sendMessage(
        `Failed to generate remaining views: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );

      // Refresh credits even on error (credits may have been deducted before failure)
      refetch();
    }
  }, [
    frontViewApproval.approvalId,
    frontViewApproval.imageUrl,
    productId,
    actualIsInitialGeneration,
    sendMessage,
    setGenerationState,
    setLoadingView,
    updateViewProgress,
    setCurrentViews,
    setIsProcessing,
    refreshUserCredits,
    setRevisions,
    onRevisionsChange,
    setAllLoadingViews,
    refetch,
  ]);

  /**
   * Handle front view edit request
   * When user requests changes to the front view, regenerate it with feedback
   */
  const handleRequestFrontViewEdit = useCallback(
    async (feedback: string) => {
      try {
        devLog(
          "request-front-edit",
          { feedback },
          "Requesting front view edit"
        );

        // Update state to show we're processing the edit
        setIsProcessing(true);

        // If no approval ID, this is a new edit request on completed product
        // Start a new progressive workflow
        if (!frontViewApproval.approvalId) {
          devLog(
            "start-new-progressive-workflow",
            { fromCompleted: true },
            "Starting new progressive workflow from completed state"
          );

          setGenerationState("generating_front_view");

          // Generate front view with edit prompt
          const frontResult = await generateFrontViewOnly({
            productId: productId!,
            userPrompt: feedback,
            isEdit: true,
            previousFrontViewUrl: currentViews.front || "",
          });

          if (
            !frontResult.success ||
            !frontResult.frontViewUrl ||
            !frontResult.approvalId
          ) {
            throw new Error(
              frontResult.error || "Failed to generate front view"
            );
          }

          // Update store with new approval data
          setFrontViewApproval({
            status: "pending",
            imageUrl: frontResult.frontViewUrl,
            approvalId: frontResult.approvalId,
            iterationCount: 1,
          });

          setCurrentViews({ front: frontResult.frontViewUrl });
          setGenerationState("awaiting_front_approval");
          setWorkflowMode("front-view");

          // Clear processing state
          setIsProcessing(false);

          return;
        }

        // Otherwise, continue with existing approval workflow
        // Call server action to handle edit decision
        const result = await handleFrontViewDecision({
          approvalId: frontViewApproval.approvalId,
          action: "edit",
          editFeedback: feedback,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to request edit");
        }

        if (
          result.action !== "regenerate" ||
          !result.newFrontViewUrl ||
          !result.newApprovalId
        ) {
          throw new Error("Invalid edit response from server");
        }

        devLog(
          "front-view-regenerated",
          { newApprovalId: result.newApprovalId },
          "Front view regenerated"
        );

        // Update front view approval with new data
        setFrontViewApproval({
          imageUrl: result.newFrontViewUrl,
          approvalId: result.newApprovalId,
          status: "pending",
          iterationCount: frontViewApproval.iterationCount + 1,
        });

        // Update current views with new front view
        setCurrentViews({ front: result.newFrontViewUrl });

        // Refetch versions to include the new version
        if (productId) {
          try {
            const { getAllFrontViewVersions } = await import(
              "@/app/actions/progressive-generation-workflow"
            );
            const versionsResult = await getAllFrontViewVersions(productId);
            if (versionsResult.success && versionsResult.versions) {
              const formattedVersions = versionsResult.versions.map(
                (v: any) => ({
                  id: v.id,
                  frontViewUrl: v.front_view_url,
                  iterationNumber: v.iteration_number,
                  createdAt: v.created_at,
                })
              );
              setFrontViewVersions(formattedVersions);
              devLog(
                "versions-refetched",
                { count: formattedVersions.length },
                "Versions updated after edit"
              );
            }
          } catch (versionError) {
            console.error("Error refetching versions:", versionError);
          }
        }

        // Save message about regeneration
        await sendMessage(
          `I've regenerated the front view based on your feedback: "${feedback}". Please review the updated design.`,
          "ai"
        );

        setIsProcessing(false);

        // Refresh credits after edit (credits were deducted server-side)
        refetch();
      } catch (error) {
        console.error("Error requesting front view edit:", error);
        setIsProcessing(false);
        await sendMessage(
          `Failed to regenerate front view: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error"
        );

        // Refresh credits even on error (credits may have been deducted before failure)
        refetch();
      }
    },
    [
      frontViewApproval.approvalId,
      frontViewApproval.iterationCount,
      sendMessage,
      setIsProcessing,
      setFrontViewApproval,
      setCurrentViews,
      refetch,
    ]
  );

  /**
   * Handle skip - return to normal editor state
   * Exits the approval workflow without generating remaining views
   */
  const handleSkipApproval = useCallback(() => {
    // Reset generation state to idle/completed
    setGenerationState("idle");
    setWorkflowMode("multi-view");

    // Keep the front view in currentViews but clear approval data
    setFrontViewApproval({
      status: "pending",
      imageUrl: null,
      approvalId: null,
      iterationCount: 0,
    });

    devLog("skip-approval", {}, "User skipped approval, returned to editor");
  }, [setGenerationState, setWorkflowMode, setFrontViewApproval]);

  /**
   * Handle initial product generation with progressive workflow
   * Generates only the front view first, then waits for user approval
   */
  const handleGenerateProduct = useCallback(
    async (userPrompt: string) => {
      try {
        // CRITICAL: Check if generation is already in progress using ref
        if (generationInProgress.current) {
          console.warn(
            "[handleGenerateProduct] ❌ Generation already in progress, ignoring duplicate call"
          );
          return;
        }

        // Set the flag IMMEDIATELY to block any other calls
        generationInProgress.current = true;
        // console.log("[handleGenerateProduct] 🔒 Generation locked");

        devLog(
          "generate-product-progressive",
          { productId },
          "Starting progressive generation"
        );

        // Track design start
        track(AnalyticsEvents.DESIGN_START, {
          product_id: productId,
          prompt_length: userPrompt.length,
        });

        // Reset workflow state
        resetWorkflowState();

        // Set workflow mode to front-view (progressive workflow)
        setWorkflowMode("front-view");

        // Set state to generating front view
        setGenerationState("generating_front_view");
        setIsProcessing(true);

        // Save user message
        await sendMessage(userPrompt, "user");

        // Add processing message
        await sendMessage(
          "Generating your product's front view first. This will take about 30 seconds...",
          "processing"
        );

        // Generate only the front view
        const result = await generateFrontViewOnly({
          productId,
          userPrompt,
          isEdit: false,
        });

        if (!result.success || !result.frontViewUrl || !result.approvalId) {
          throw new Error(result.error || "Failed to generate front view");
        }

        devLog(
          "front-view-generated",
          {
            approvalId: result.approvalId,
            frontViewUrl: result.frontViewUrl,
          },
          "Front view generated"
        );

        // Track AI generation complete (front view)
        track(AnalyticsEvents.AI_GENERATION_COMPLETE, {
          product_id: productId,
          generation_type: "front_view",
          success: true,
        });

        // console.log("🖼️ Setting front view approval state:", {
        //   imageUrl: result.frontViewUrl,
        //   approvalId: result.approvalId,
        //   status: "pending",
        //   iterationCount: 1,
        // });

        // Update state with front view approval data
        setFrontViewApproval({
          imageUrl: result.frontViewUrl,
          approvalId: result.approvalId,
          status: "pending",
          iterationCount: 1,
        });

        // Update current views with front view
        setCurrentViews({ front: result.frontViewUrl });

        // console.log("🎯 Transitioning to awaiting_front_approval state");

        // Transition to awaiting approval state
        setGenerationState("awaiting_front_approval");
        setIsProcessing(false);

        // Save message about front view ready
        await sendMessage(
          "I've generated the front view of your product. Take a look and let me know if you'd like any changes before I create the remaining views!",
          "ai"
        );
      } catch (error) {
        console.error("Error generating product:", error);
        setGenerationState("error");
        setIsProcessing(false);

        // Track AI generation error
        track(AnalyticsEvents.AI_GENERATION_ERROR, {
          product_id: productId,
          generation_type: "front_view",
          error_message: error instanceof Error ? error.message : "Unknown error",
        });

        await sendMessage(
          `Failed to generate front view: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error"
        );
      } finally {
        // CRITICAL: Always unlock the generation flag
        generationInProgress.current = false;
        // console.log("[handleGenerateProduct] 🔓 Generation unlocked");

        // Refresh credits after generation (credits were deducted server-side)
        refetch();
      }
    },
    [
      productId,
      sendMessage,
      resetWorkflowState,
      setGenerationState,
      setIsProcessing,
      setFrontViewApproval,
      setCurrentViews,
      refetch,
    ]
  );

  // Dedicated useEffect for initial generation - runs only once when conditions are met
  useEffect(() => {
    // Only trigger if:
    // 1. Modal is open
    // 2. This is initial generation
    // 3. We have a prompt
    // 4. Not already triggered
    // 5. Revisions finished loading
    if (
      !isOpen ||
      !actualIsInitialGeneration ||
      !initialPrompt ||
      initialGenerationTriggered.current ||
      revisionsLoading
    ) {
      return;
    }

    // Lock immediately to prevent any duplicate execution
    initialGenerationTriggered.current = true;

    // console.log("🚀 [Dedicated useEffect] Triggering initial generation", {
    //   productId,
    //   promptLength: initialPrompt.length,
    // });

    // Trigger generation directly without setTimeout
    handleGenerateProduct(initialPrompt);

    // No cleanup needed - we want this to run once and only once
  }, [
    isOpen,
    actualIsInitialGeneration,
    initialPrompt,
    productId,
    revisionsLoading,
  ]);
  // Note: handleGenerateProduct intentionally omitted - it's stable from useCallback

  /**
   * Handle conversion from B&W sketch to regular (full-color) mode
   * Updates the generation_mode and sends a design edit request
   */
  const handleConvertToRegular = useCallback(async () => {
    if (!productId || isConvertingToRegular) return;

    try {
      setIsConvertingToRegular(true);
      console.log("[Convert to Regular] Starting conversion...");

      // Update the generation mode in the database
      const result = await convertToRegularMode({ productId });

      if (!result.success) {
        console.error("[Convert to Regular] Failed:", result.error);
        await sendMessage(
          `Failed to convert to regular mode: ${result.error}`,
          "error"
        );
        return;
      }

      // Update local state
      setGenerationMode("regular");

      // Send a design edit request to colorize the product
      // This uses the existing edit workflow instead of generating a new front view
      const colorizePrompt = "Convert this black and white sketch to a full-color realistic product with vibrant colors, realistic materials and textures.";

      await sendUserMessage(
        colorizePrompt,
        onProgressiveEdit || (onEditViews as any),
        selectedRevision
      );

    } catch (error) {
      console.error("[Convert to Regular] Error:", error);
      await sendMessage(
        `Failed to convert: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    } finally {
      setIsConvertingToRegular(false);
    }
  }, [
    productId,
    isConvertingToRegular,
    sendMessage,
    sendUserMessage,
    selectedRevision,
    onProgressiveEdit,
    onEditViews,
  ]);

  // Handle tech pack generation
  const handleGenerateTechPack = async () => {
    // Track tech pack generation start
    track(AnalyticsEvents.TECHPACK_GENERATE, {
      product_id: productId,
      product_name: productName,
      revision_count: revisions.length,
    });

    // Tech pack generation is now handled by useTechPackGeneration hook
    await generateTechPack(
      revisions,
      onGenerateTechPack,
      user,
      productName,
      productId
    );

    // Refresh tech pack data after generation
    await refreshTechPack();
  };

  // Wrapper functions for tech pack file operations (convert Promise<boolean> to Promise<void>)
  const handleDownloadPDF = async () => {
    await downloadPDF();
  };

  const handleDownloadExcel = async () => {
    await downloadExcel();
  };

  const handleGenerateTechnicalFiles = async () => {
    await generateTechnicalFiles();
  };

  // Memoize callbacks to prevent RevisionHistory from re-rendering
  const handleRevisionRollback = useCallback(
    (revision: any) => {
      setSelectedRevision(revision);
      if (onRollback) onRollback(revision);
    },
    [onRollback]
  );

  const handleRevisionDelete = useCallback(
    async (id: string) => {
      return onDeleteRevision?.(id) || false;
    },
    [onDeleteRevision]
  );

  // Handle single view regeneration completion
  const handleSingleViewRegenerated = useCallback(
    async (
      viewType: ViewType,
      newUrl: string,
      newRevisionId: string,
      newRevisionNumber: number
    ) => {
      console.log(
        `[MultiViewEditor] Single view regenerated: ${viewType} -> revision ${newRevisionNumber}`
      );

      // Refetch credits since we used 1 credit
      refetch();

      // CRITICAL: Refetch revisions from database and update parent state
      // This ensures the new revision appears in the revision history
      if (onRevisionsChange && productId) {
        console.log(`[MultiViewEditor] Refetching revisions from database for product: ${productId}`);

        try {
          // Import and call the revision fetching function
          const { getGroupedMultiViewRevisions } = await import("@/app/actions/ai-image-edit-new-table");
          const revisionsResult = await getGroupedMultiViewRevisions(productId);

          if (revisionsResult.success && revisionsResult.revisions) {
            console.log(`[MultiViewEditor] Successfully refetched ${revisionsResult.revisions.length} revisions`);
            onRevisionsChange(revisionsResult.revisions);
          } else {
            console.error(`[MultiViewEditor] Failed to refetch revisions:`, revisionsResult.error);
          }
        } catch (error) {
          console.error(`[MultiViewEditor] Error refetching revisions:`, error);
        }
      } else {
        console.warn(`[MultiViewEditor] Cannot refetch revisions - missing onRevisionsChange or productId`);
      }
    },
    [refetch, onRevisionsChange, productId]
  );

  // For initial generation or when not open, return null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100">
      <ErrorBoundary>
        {/* Full-screen loading overlay - covers entire AI Designer */}
        <LoadingOverlay
          show={isCheckingApproval || revisionsLoading || isCleaningSession}
          isCleaningSession={isCleaningSession}
          hasExistingViews={
            !!(
              currentViews.front ||
              currentViews.back ||
              currentViews.side ||
              currentViews.top ||
              currentViews.bottom
            )
          }
        />

        <div className="h-full flex flex-col">
          {/* Header */}
          <EditorHeader
            productId={productId}
            productName={productName}
            extractedProductName={extractedProductName}
            userProducts={userProducts}
            isProductDropdownOpen={isProductDropdownOpen}
            setIsProductDropdownOpen={setIsProductDropdownOpen}
            has3DModel={has3DModel}
            model3DUrl={model3DUrl}
            onShow3DViewer={open3DViewer}
            workflowMode={workflowMode}
            setWorkflowMode={checkDimensionsAndSwitchMode}
            generationState={generationState}
            isInitialGeneration={isInitialGeneration}
            hasTechPack={!!techPack}
            credits={credits?.credits || 0}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            onShowTutorial={() => setShowTutorialModal(true)}
            onShowIdeas={() => setShowIndicatorModal(true)}
            onClose={onClose}
            setIsCleaningSession={setIsCleaningSession}
            onCreditsClick={() => setShowPaymentModal(true)}
            productLinkedRevisionId={productLinkedRevisionId}
            isDemo={isDemo}
          />

          {/* Demo Mode Banner */}
          {isDemo && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                Demo Mode: You are viewing a demo product. Generation and editing are disabled.
              </p>
            </div>
          )}

          {/* Generation Progress Indicator - Hidden for now */}
          <GenerationProgressIndicator
            isVisible={false}
            onComplete={() => {
              devLog(
                "progress-animation-complete",
                "Progress animation completed"
              );
            }}
          />

          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar - Chat (desktop) */}
            <div
              className={cn(
                "w-96 border-r bg-white transition-all duration-300",
                "hidden lg:block"
              )}
            >
              <ChatInterface
                productId={productId}
                onEditViews={onProgressiveEdit || (onEditViews as any)}
                selectedRevision={selectedRevision}
                onRevisionSuccess={handleRevisionSuccess}
                workflowMode={workflowMode}
                techPackData={techPack}
                techFilesData={techFilesData}
                techPackActions={techPackActions}
                onSwitchToTechPack={handleSwitchToTechPack}
                techPackState={techPackState}
                disabled={
                  isDemo ||
                  (workflowMode !== "multi-view" && workflowMode !== "tech-pack") ||
                  generationState === "awaiting_front_approval" ||
                  generationState === "generating_front_view" ||
                  generationState === "generating_additional_views"
                }
                disabledMessage={
                  isDemo
                    ? "This is a demo product. Generation is disabled."
                    : workflowMode === "front-view"
                      ? "Chat is only available in All Views and Factory Specs modes"
                      : "Please approve or edit the front view first"
                }
                placeholderOverride={
                  isDemo
                    ? "Demo Mode - Read Only"
                    : workflowMode === "front-view"
                      ? "Edits will be based on selected revision..."
                      : undefined
                }
              />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
              {/* Desktop Views display - State-based rendering for progressive workflow */}
              <div className="hidden sm:flex flex-1 overflow-hidden">
                {/* Loading State: Generating Front View */}
                {generationState === "generating_front_view" && (
                  <CreativeLoadingAnimation
                    title="Generating Front View"
                    subtitle="This will take about 30 seconds..."
                  />
                )}

                {/* Approval State: Front View Ready for Approval */}
                {generationState === "awaiting_front_approval" &&
                  frontViewApproval.imageUrl && (
                    <div className="flex-1 overflow-y-auto">
                      <FrontViewApproval
                        frontViewUrl={frontViewApproval.imageUrl}
                        approvalId={frontViewApproval.approvalId || ""}
                        iterationCount={frontViewApproval.iterationCount}
                        onApprove={handleApproveFrontView}
                        onRequestEdit={handleRequestFrontViewEdit}
                        productName={extractedProductName || productName}
                        isProcessing={isProcessing}
                        creditsForRemaining={3}
                        allVersions={frontViewVersions}
                        onVersionChange={handleVersionChange}
                        onSkip={handleSkipApproval}
                        hasExistingRevisions={revisions.length > 0}
                        setShowPaymentModal={setShowPaymentModal}
                        isDemo={isDemo}
                      />
                    </div>
                  )}

                {/* Generating State: Generating Additional Views */}
                {generationState === "generating_additional_views" && (
                  <div className="flex-1 overflow-y-auto p-6">
                    <ProgressiveViewsGeneration
                      frontViewUrl={frontViewApproval.imageUrl || ""}
                      currentViews={currentViews}
                      loadingViews={loadingViews}
                    />
                  </div>
                )}

                {/* Completed/Idle State: Show either All Views, Front Versions, or Tech Pack based on workflowMode */}
                {(generationState === "completed" ||
                  (generationState === "idle" && !actualIsInitialGeneration) ||
                  generationState === "creating_revision") && (
                    <>
                      {workflowMode === "multi-view" ? (
                        <ViewsDisplay
                          ref={viewsDisplayRef}
                          onViewClick={(view) =>
                            devLog("view-click", { view }, "View clicked")
                          }
                          sendUserMessage={sendUserMessage}
                          onEditViews={onProgressiveEdit || (onEditViews as any)}
                          productId={productId}
                          currentRevisionId={
                            selectedRevision?.views?.front?.revisionId ||
                            selectedRevision?.views?.back?.revisionId ||
                            selectedRevision?.views?.side?.revisionId ||
                            selectedRevision?.views?.top?.revisionId ||
                            selectedRevision?.views?.bottom?.revisionId ||
                            null
                          }
                          onSingleViewRegenerated={handleSingleViewRegenerated}
                          enableSingleViewEdit={true}
                        />
                      ) : workflowMode === "front-view" ? (
                        <div className="flex-1 overflow-y-auto">
                          <FrontViewApproval
                            frontViewUrl={
                              frontViewApproval.imageUrl ||
                              currentViews.front ||
                              ""
                            }
                            approvalId={frontViewApproval.approvalId || ""}
                            iterationCount={frontViewApproval.iterationCount}
                            onApprove={handleApproveFrontView}
                            onRequestEdit={handleRequestFrontViewEdit}
                            productName={extractedProductName || productName}
                            isProcessing={isProcessing}
                            creditsForRemaining={
                              frontViewApproval.approvalId ? 3 : 0
                            }
                            allVersions={frontViewVersions}
                            onVersionChange={handleVersionChange}
                            setShowPaymentModal={setShowPaymentModal}
                            isDemo={isDemo}
                          />
                        </div>
                      ) : workflowMode === "tech-pack" ? (
                        <TechPackView
                          productId={productId || ""}
                          techPackData={techPack}
                          isGenerating={isGeneratingTechPack}
                          onGenerate={handleGenerateTechPack}
                          onDownloadPDF={handleDownloadPDF}
                          onDownloadExcel={handleDownloadExcel}
                          onGenerateTechnicalFiles={handleGenerateTechnicalFiles}
                          revisionIds={
                            selectedRevision?.views
                              ? [
                                selectedRevision.views.front?.revisionId ||
                                selectedRevision.views.back?.revisionId ||
                                selectedRevision.views.side?.revisionId ||
                                selectedRevision.views.top?.revisionId ||
                                selectedRevision.views.bottom?.revisionId,
                              ].filter(Boolean)
                              : []
                          }
                          primaryImageUrl={
                            currentViews.front ||
                            currentViews.back ||
                            currentViews.side ||
                            currentViews.top ||
                            currentViews.bottom ||
                            ""
                          }
                          isDemo={isDemo}
                        />
                      ) : null}
                    </>
                  )}

                {/* Initial state: waiting for user to start generation */}
                {generationState === "idle" && actualIsInitialGeneration && (
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center space-y-6 px-4 max-w-md">
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          {/* Animated rings */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-16 w-16 rounded-full border-2 border-navy/20 animate-pulse"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-12 w-12 rounded-full border-t-2 border-navy animate-spin"></div>
                          </div>
                          {/* Center dot */}
                          <div className="relative flex items-center justify-center h-16 w-16">
                            <div className="h-2 w-2 rounded-full bg-navy animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Ready to Create Your Product
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Please wait a moment...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {generationState === "error" && (
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                    <div className="text-center space-y-4 px-4">
                      <div className="flex items-center justify-center">
                        <X className="h-12 w-12 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-900">
                          Generation Failed
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          An error occurred during generation. Please try again.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          resetWorkflowState();
                          setGenerationState("idle");
                        }}
                        variant="outline"
                        className="mt-4"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Tabs - Takes full height on mobile */}
              <div className="sm:hidden flex-1 flex flex-col overflow-hidden relative">
                <Tabs
                  value={mobileActiveTab}
                  onValueChange={setMobileActiveTab}
                  className="w-full flex flex-col h-full relative"
                >
                  <TabsList className="grid w-full grid-cols-3 flex-shrink-0 border-t rounded-none">
                    <TabsTrigger value="chat" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      AI Edits
                    </TabsTrigger>
                    <TabsTrigger value="views" className="gap-2">
                      <Wand2 className="h-4 w-4" />
                      Canvas
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                      <History className="h-4 w-4" />
                      Revisions
                    </TabsTrigger>
                  </TabsList>

                  {/* Mobile Workflow Mode Switcher - Show when completed - MOVED OUTSIDE TabsContent */}
                  {mobileActiveTab === "views" &&
                    (generationState === "completed" ||
                      (generationState === "idle" &&
                        !actualIsInitialGeneration)) && (
                      <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-white relative shadow-sm">
                        <WorkflowModeSwitcher
                          workflowMode={workflowMode}
                          onModeChange={checkDimensionsAndSwitchMode}
                          hasTechPack={!!techPack}
                          className="w-full"
                          isDemo={isDemo}
                        />
                        {/* Secondary tabs - Hidden on mobile screens */}
                      </div>
                    )}

                  <TabsContent
                    value="views"
                    className="mt-0 flex-1 min-h-0 overflow-y-auto relative"
                    style={{ zIndex: 1 }}
                  >
                    {/* Mobile: State-based rendering for progressive workflow */}
                    {generationState === "generating_front_view" && (
                      <CreativeLoadingAnimation
                        title="Generating Front View"
                        subtitle="~30 seconds..."
                      />
                    )}

                    {generationState === "awaiting_front_approval" &&
                      frontViewApproval.imageUrl && (
                        <div className="w-full">
                          <FrontViewApproval
                            frontViewUrl={frontViewApproval.imageUrl}
                            approvalId={frontViewApproval.approvalId || ""}
                            iterationCount={frontViewApproval.iterationCount}
                            onApprove={handleApproveFrontView}
                            onRequestEdit={handleRequestFrontViewEdit}
                            productName={extractedProductName || productName}
                            isProcessing={isProcessing}
                            creditsForRemaining={3}
                            allVersions={frontViewVersions}
                            onVersionChange={handleVersionChange}
                            onSkip={handleSkipApproval}
                            hasExistingRevisions={revisions.length > 0}
                            setShowPaymentModal={setShowPaymentModal}
                            isDemo={isDemo}
                          />
                        </div>
                      )}

                    {generationState === "generating_additional_views" && (
                      <div className="flex-1 overflow-y-auto p-4">
                        <ProgressiveViewsGeneration
                          frontViewUrl={frontViewApproval.imageUrl || ""}
                          currentViews={currentViews}
                          loadingViews={loadingViews}
                        />
                      </div>
                    )}

                    {(generationState === "completed" ||
                      (generationState === "idle" &&
                        !actualIsInitialGeneration) ||
                      generationState === "creating_revision") && (
                        <>
                          {workflowMode === "multi-view" ? (
                            <ViewsDisplay
                              ref={viewsDisplayRef}
                              onViewClick={(view) =>
                                devLog(
                                  "view-click-mobile",
                                  { view },
                                  "View clicked (mobile)"
                                )
                              }
                              sendUserMessage={sendUserMessage}
                              onEditViews={
                                onProgressiveEdit || (onEditViews as any)
                              }
                              productId={productId}
                              currentRevisionId={
                                selectedRevision?.views?.front?.revisionId ||
                                selectedRevision?.views?.back?.revisionId ||
                                selectedRevision?.views?.side?.revisionId ||
                                selectedRevision?.views?.top?.revisionId ||
                                selectedRevision?.views?.bottom?.revisionId ||
                                null
                              }
                              onSingleViewRegenerated={handleSingleViewRegenerated}
                              enableSingleViewEdit={true}
                            />
                          ) : workflowMode === "front-view" ? (
                            <div className="w-full">
                              <FrontViewApproval
                                frontViewUrl={
                                  frontViewApproval.imageUrl ||
                                  currentViews.front ||
                                  ""
                                }
                                approvalId={frontViewApproval.approvalId || ""}
                                iterationCount={frontViewApproval.iterationCount}
                                onApprove={handleApproveFrontView}
                                onRequestEdit={handleRequestFrontViewEdit}
                                productName={extractedProductName || productName}
                                isProcessing={isProcessing}
                                creditsForRemaining={
                                  frontViewApproval.approvalId ? 3 : 0
                                }
                                allVersions={frontViewVersions}
                                onVersionChange={handleVersionChange}
                                setShowPaymentModal={setShowPaymentModal}
                                isDemo={isDemo}
                              />
                            </div>
                          ) : workflowMode === "tech-pack" ? (
                            <TechPackView
                              productId={productId || ""}
                              techPackData={techPack}
                              isGenerating={isGeneratingTechPack}
                              onGenerate={handleGenerateTechPack}
                              onDownloadPDF={handleDownloadPDF}
                              onDownloadExcel={handleDownloadExcel}
                              onGenerateTechnicalFiles={
                                handleGenerateTechnicalFiles
                              }
                              revisionIds={
                                selectedRevision?.views
                                  ? [
                                    selectedRevision.views.front?.revisionId ||
                                    selectedRevision.views.back?.revisionId ||
                                    selectedRevision.views.side?.revisionId ||
                                    selectedRevision.views.top?.revisionId ||
                                    selectedRevision.views.bottom?.revisionId,
                                  ].filter(Boolean)
                                  : []
                              }
                              primaryImageUrl={
                                currentViews.front ||
                                currentViews.back ||
                                currentViews.side ||
                                currentViews.top ||
                                currentViews.bottom ||
                                ""
                              }
                              isDemo={isDemo}
                            />
                          ) : null}
                        </>
                      )}

                    {/* Initial state: waiting for user to start generation */}
                    {generationState === "idle" && actualIsInitialGeneration && (
                      <div className="flex-1 h-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                        <div className="text-center space-y-6 max-w-md">
                          <div className="flex items-center justify-center">
                            <div className="relative">
                              {/* Animated rings */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-16 w-16 rounded-full border-2 border-navy/20 animate-pulse"></div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-12 w-12 rounded-full border-t-2 border-navy animate-spin"></div>
                              </div>
                              {/* Center dot */}
                              <div className="relative flex items-center justify-center h-16 w-16">
                                <div className="h-2 w-2 rounded-full bg-navy animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">
                              Ready to Create Your Product
                            </h3>
                            <p className="text-xs text-gray-600 mt-2">
                              Please wait a moment...
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {generationState === "error" && (
                      <div className="flex-1 h-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
                        <div className="text-center space-y-4">
                          <X className="h-10 w-10 text-red-600 mx-auto" />
                          <div>
                            <h3 className="text-base font-semibold text-red-900">
                              Generation Failed
                            </h3>
                            <p className="text-xs text-red-700 mt-1">
                              Please try again
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              resetWorkflowState();
                              setGenerationState("idle");
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="chat"
                    className="mt-0 flex-1 min-h-0 bg-white relative z-10 overflow-hidden"
                  >
                    <ChatInterface
                      productId={productId}
                      onEditViews={onProgressiveEdit || (onEditViews as any)}
                      selectedRevision={selectedRevision}
                      onRevisionSuccess={handleRevisionSuccess}
                      workflowMode={workflowMode}
                      techPackData={techPack}
                      techFilesData={techFilesData}
                      techPackActions={techPackActions}
                      onSwitchToTechPack={handleSwitchToTechPack}
                      techPackState={techPackState}
                      disabled={
                        isDemo ||
                        (workflowMode !== "multi-view" && workflowMode !== "tech-pack") ||
                        generationState === "awaiting_front_approval" ||
                        generationState === "generating_front_view" ||
                        generationState === "generating_additional_views"
                      }
                      disabledMessage={
                        isDemo
                          ? "This is a demo product. Generation is disabled."
                          : workflowMode === "front-view"
                            ? "Chat is only available in All Views and Factory Specs modes"
                            : "Please approve or edit the front view first"
                      }
                      placeholderOverride={
                        isDemo
                          ? "Demo Mode - Read Only"
                          : workflowMode === "front-view"
                            ? "Edits will be based on selected revision..."
                            : undefined
                      }
                    />
                  </TabsContent>

                  <TabsContent
                    value="history"
                    className="mt-0 flex-1 min-h-0 overflow-hidden"
                  >
                    <RevisionHistory
                      revisions={revisions}
                      onRollback={handleRevisionRollback}
                      onDelete={handleRevisionDelete}
                      isLoading={revisionsLoading}
                      onGenerateTechPack={
                        onGenerateTechPack ? handleGenerateTechPack : undefined
                      }
                      isGeneratingTechPack={isGeneratingTechPack}
                      selectedRevision={selectedRevision}
                      techPackGeneratedFor={techPackGeneratedFor}
                      revisionTechPacks={revisionTechPacks}
                      productId={productId}
                      productLinkedRevisionId={productLinkedRevisionId}
                      isDemo={isDemo}
                      workflowMode={workflowMode}
                      setWorkflowMode={checkDimensionsAndSwitchMode}
                      onSwitchToCanvas={() => setMobileActiveTab("views")}
                      existingDimensions={existingDimensions}
                      frontImageUrl={currentViews.front}
                      onDimensionsUpdated={setExistingDimensions}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Bottom Controls Bar - Always visible on desktop, hidden on mobile when not on views tab */}
              <BottomControlsBar
                isVisualEditMode={isVisualEditMode}
                isSystemBusy={isSystemBusy || isDemo}
                generationState={generationState}
                workflowMode={workflowMode}
                loadingViews={loadingViews}
                viewport={viewport}
                mobileActiveTab={mobileActiveTab}
                onToggleVisualEdit={() => setVisualEditMode(!isVisualEditMode)}
                onZoomIn={() =>
                  setViewport({
                    zoomLevel: Math.min(200, viewport.zoomLevel + 10),
                  })
                }
                onZoomOut={() =>
                  setViewport({
                    zoomLevel: Math.max(50, viewport.zoomLevel - 10),
                  })
                }
                onNext={() => setMobileActiveTab("history")}
                generationMode={generationMode}
                onConvertToRegular={handleConvertToRegular}
                isConverting={isConvertingToRegular}
                isDemo={isDemo}
              />
            </div>

            {/* Right sidebar - History (desktop) with smooth animation */}
            <div
              className={cn(
                "border-l bg-gray-50 overflow-hidden flex",
                "hidden sm:block",
                "transition-all duration-300 ease-in-out",
                showHistory ? "w-80 opacity-100" : "w-0 opacity-0 border-l-0"
              )}
            >
              <div className="w-80 h-full flex flex-col overflow-hidden">
                <RevisionHistory
                  revisions={revisions}
                  onRollback={handleRevisionRollback}
                  onDelete={handleRevisionDelete}
                  onToggle={toggleHistory}
                  isLoading={revisionsLoading}
                  onGenerateTechPack={
                    onGenerateTechPack ? handleGenerateTechPack : undefined
                  }
                  isGeneratingTechPack={isGeneratingTechPack}
                  selectedRevision={selectedRevision}
                  techPackGeneratedFor={techPackGeneratedFor}
                  revisionTechPacks={revisionTechPacks}
                  productId={productId}
                  productLinkedRevisionId={productLinkedRevisionId}
                  isDemo={isDemo}
                  workflowMode={workflowMode}
                  setWorkflowMode={checkDimensionsAndSwitchMode}
                  existingDimensions={existingDimensions}
                  frontImageUrl={currentViews.front}
                  onDimensionsUpdated={setExistingDimensions}
                />
              </div>
            </div>

            {/* Floating Controls */}
            <FloatingControls
              showHistory={showHistory}
              onToggleHistory={toggleHistory}
            />
          </div>
        </div>

        {/* Product Creation Progress Modal */}
        <GenerationProgressModal
          isLoading={isGeneratingTechPack}
          title="Creating Product..."
          description="This takes less than a minute. Please don't refresh the page."
        />

        {/* 3D Model Viewer Dialog */}
        <AnimatePresence>
          {show3DViewer && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                onClick={close3DViewer}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-2xl h-[80vh] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Box className="h-4 w-4 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            3D Model Viewer
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {extractedProductName || productName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={close3DViewer}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto">
                    {model3DUrl && (
                      <div className="p-6">
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <Model3DViewer modelUrl={model3DUrl} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Specs Modal - Shows before entering Factory Specs */}
        <ProductSpecsModal
          isOpen={showDimensionsModal}
          onClose={handleDimensionsModalClose}
          onApprove={handleDimensionsApproved}
          productId={productId || ""}
          productType={techPack?.tech_pack_data?.category_Subcategory}
          productDescription={productDescription}
          existingDimensions={existingDimensions}
          frontImageUrl={currentViews.front}
        />
      </ErrorBoundary>
    </div>
  );
}

export default MultiViewEditor;
