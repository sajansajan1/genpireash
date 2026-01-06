"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MultiViewEditor } from "@/components/ai-image-editor/multiview-editor";
import { MultiViewEditor as ModularMultiViewEditor } from "@/modules/ai-designer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Package, Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { createMinimalProductEntry, getProductMetadata } from "@/app/actions/create-product-entry";
import { generateIdea } from "@/app/actions/idea-generation";
import { supabase } from "@/lib/supabase/client";
import {
  getGroupedMultiViewRevisions,
  saveInitialRevisions,
  deleteRevision,
} from "@/app/actions/ai-image-edit-new-table";
import { getOrCreateChatSession } from "@/app/actions/chat-session";
import { generateTechPackForProduct } from "@/app/actions/create-product-entry";
import { BackgroundRefreshModal } from "@/components/background-refresh-modal";
import { GenerationProgressIndicator } from "@/components/generation-progress-indicator";
import { TECH_PACK_STATUS_MESSAGES, TOTAL_TECH_PACK_TIME } from "@/lib/constants/tech-pack-status-messages";
import GenpireEditorGuideModal from "@/components/genpire-editor-guide";
import GenpireTourTutorialModal from "@/components/genpire-editor-tutorial";
import GenpirePaymentModal from "@/components/genpire-payment-modal";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { track, AnalyticsEvents } from "@/lib/analytics";

interface ProductImages {
  front: string;
  back: string;
  side: string;
  top?: string;
  bottom?: string;
}

export default function AIDesignerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Ref to track if project is being loaded to prevent duplicate calls
  const loadingProjectRef = React.useRef(false);
  const lastLoadedProjectId = React.useRef<string | null>(null);

  // Core state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [productName, setProductName] = useState("Product");
  const [productDescription, setProductDescription] = useState("");
  const [productImages, setProductImages] = useState<ProductImages>({
    front: "",
    back: "",
    side: "",
    top: "",
    bottom: "",
  });
  const [multiViewRevisions, setMultiViewRevisions] = useState<any[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingTechPack, setIsGeneratingTechPack] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [isInitialGeneration, setIsInitialGeneration] = useState(false);
  const [isCheckingState, setIsCheckingState] = useState(true); // Start with true to prevent flash
  const [techPack, setTechPack] = useState<any>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Toggle for testing modular version
  const [useModularVersion, setUseModularVersion] = useState(false);
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits, refresCreatorCredits, loadingGetCreatorCredits, hasFetchedCreatorCredits } =
    useGetCreditsStore();
  const credits = getCreatorCredits;
  const refetch = refresCreatorCredits;
  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setUserLoading(false);
      }
    };
    getUser();
  }, []);

  // Monitor authentication state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === "SIGNED_OUT" || !session) {
        // User is no longer authenticated, redirect to homepage with auth modal
        router.push("/?auth=required");
      } else if (event === "SIGNED_IN" && session) {
        // Update user state when signed in
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Get parameters from URL - Only projectId is needed now
  // Use useMemo to extract stable values from searchParams
  const urlParams = React.useMemo(
    () => ({
      id: searchParams?.get("projectId") || null,
      version: searchParams?.get("version") || null,
      guideModal: searchParams?.get("guide") === "true",
    }),
    [searchParams?.get("projectId"), searchParams?.get("version"), searchParams?.get("guide")]
  );

  useEffect(() => {
    if (urlParams.guideModal) {
      setShowCompleteModal(true);
    }
    // Check if we should use modular version
    if (urlParams.version === "modular") {
      setUseModularVersion(true);
    }

    if (urlParams.id) {
      // Prevent duplicate loads of the same project
      if (loadingProjectRef.current && lastLoadedProjectId.current === urlParams.id) {
        console.log("⏭️ Skipping duplicate project load for:", urlParams.id);
        return;
      }

      // Prevent concurrent loads
      if (loadingProjectRef.current) {
        console.log("⏸️ Project load already in progress, skipping");
        return;
      }

      setProjectId(urlParams.id);
      lastLoadedProjectId.current = urlParams.id;
      loadingProjectRef.current = true;

      // CRITICAL: Clear old product data immediately to prevent showing old views
      setProductImages({
        front: "",
        back: "",
        side: "",
        top: "",
        bottom: "",
      });
      setMultiViewRevisions([]);
      setProductName("Product");
      setProductDescription("");

      loadProjectAndInitialize(urlParams.id).finally(() => {
        loadingProjectRef.current = false;
      });
    } else {
      // No project ID - clear all state and stop showing loading
      setProjectId(null);
      setProductName("Product");
      setProductDescription("");
      setProductImages({
        front: "",
        back: "",
        side: "",
        top: "",
        bottom: "",
      });
      setMultiViewRevisions([]);
      setEditorOpen(false);
      setIsInitialGeneration(false);
      setInitialPrompt("");
      setTechPack(null);
      setChatSessionId(null);
      setIsCheckingState(false);
    }

    // Cleanup function - runs when component unmounts or when dependencies change
    return () => {
      console.log("🧹 Cleaning up designer state");
      // Cancel any pending loads
      loadingProjectRef.current = false;
    };
  }, [urlParams.id, urlParams.version, urlParams.guideModal]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting - clearing all state");
      setProjectId(null);
      setProductName("Product");
      setProductDescription("");
      setProductImages({
        front: "",
        back: "",
        side: "",
        top: "",
        bottom: "",
      });
      setMultiViewRevisions([]);
      setEditorOpen(false);
      setIsInitialGeneration(false);
      setInitialPrompt("");
      setTechPack(null);
      setChatSessionId(null);
    };
  }, []);

  // Load project and initialize generation
  useEffect(() => {
    if (projectId) {
      loadProjectAndInitialize(projectId);
    }
  }, [projectId]);

  // Load project and initialize generation
  const loadProjectAndInitialize = async (id: string) => {
    try {
      console.log("📥 Loading project:", id);

      const { data: project, error } = await supabase.from("products_sample").select("*").eq("id", id).single();

      if (error) throw error;

      if (!project) {
        console.error("❌ No project found");
        return;
      }

      // Extract metadata
      const metadata = project.tech_pack?.metadata || {};
      const prompt = project.prompt || "";

      console.log("📦 Project loaded:", {
        id,
        metadataKeys: Object.keys(metadata),
        hasTechPack: !!project.tech_pack,
        hasImageData: !!project.image_data,
      });

      // Set product basic info
      setProductName(project.tech_pack?.productName || "Product");
      setProductDescription(project.tech_pack?.productDescription || prompt);
      setTechPack(project.tech_pack);

      // -----------------------------
      // ✅ CHECK IF PROJECT HAS ANY IMAGES
      // -----------------------------
      const imageData = project.image_data || {};
      console.log("imageData ==> ", imageData);

      const hasExistingImages = Object.values(imageData).some((view: any) => view?.url && view.url !== "");

      console.log("🖼️ Existing images?", hasExistingImages, imageData);

      // -----------------------------
      // 📌 CASE 1: EXISTING IMAGES FOUND
      // -----------------------------
      if (hasExistingImages) {
        console.log("✅ Loading existing images");

        setProductImages({
          front: imageData?.front?.url || "",
          back: imageData?.back?.url || "",
          side: imageData?.side?.url || "",
          top: imageData?.top?.url || "",
          bottom: imageData?.bottom?.url || "",
        });

        setEditorOpen(true);
        setIsInitialGeneration(false);

        return;
      }

      // -----------------------------
      // 📌 CASE 2: NO IMAGES → INITIAL GENERATION MODE
      // -----------------------------
      console.log("🆕 No images found — enabling initial generation mode");

      setProductImages({
        front: "",
        back: "",
        side: "",
        top: "",
        bottom: "",
      });

      setEditorOpen(true);
      setIsInitialGeneration(true);
      setInitialPrompt(prompt);
    } catch (error) {
      console.error("❌ Error loading project:", error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    }
  };

  // Create new project
  const handleNewProject = async () => {
    if (!user?.id) return;

    const prompt = window.prompt("Enter your design idea:");
    if (!prompt) return;

    // Track new product idea creation
    track(AnalyticsEvents.AI_PROMPT_SUBMIT, {
      prompt_length: prompt.length,
      source: "ai_designer_landing",
    });

    try {
      // Create minimal product entry
      const result = await createMinimalProductEntry({
        user_prompt: prompt,
        userId: user.id,
      });

      if (result.success && result.projectId) {
        // Track successful product creation
        track(AnalyticsEvents.AI_GENERATION_START, {
          product_id: result.projectId,
          prompt_length: prompt.length,
        });

        // Navigate to the new project
        router.push(
          `/ai-designer?projectId=${result.projectId}&version=modular&prompt=${encodeURIComponent(
            prompt
          )}&autoGenerate=true`
        );
      }
    } catch (error) {
      console.error("Error creating project:", error);

      // Track error
      track(AnalyticsEvents.AI_GENERATION_ERROR, {
        error_message: error instanceof Error ? error.message : "Failed to create project",
        source: "ai_designer_landing",
      });

      toast({
        title: "Error",
        description: "Failed to create new project",
        variant: "destructive",
      });
    }
  };

  if (userLoading) {
    return null; // Hide loader, let MultiViewEditor handle loading states
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
              <p className="text-[#1C1917] mb-4">Please sign in to use the AI Designer</p>
              <Button onClick={() => router.push("/login")} className="cursor-pointer">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Landing page if no project
  if (!projectId && !editorOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4 cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Designer Studio
            </h1>
            <p className="text-xl text-[#1C1917] mb-8">
              Create stunning product designs with AI-powered multi-view generation
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleNewProject} className="gap-2 cursor-pointer">
                <Wand2 className="w-5 h-5" />
                Start New Design
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/creator-dashboard")}
                className="gap-2 cursor-pointer"
              >
                <Package className="w-5 h-5" />
                Browse Projects
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered Generation</h3>
                  <p className="text-sm text-[#1C1917]">
                    Generate professional product views from text or image uploads
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4 mx-auto">
                    <Wand2 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Multi-View Editing</h3>
                  <p className="text-sm text-[#1C1917]">Edit and refine front, back, and side views simultaneously</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4 mx-auto">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Revision History</h3>
                  <p className="text-sm text-[#1C1917]">Track all changes with comprehensive revision management</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log(productImages);
  // Render the editor
  return (
    <>
      {/* Generation Progress Indicator - Hidden for initial generation */}
      <GenerationProgressIndicator
        isVisible={false}
        onComplete={() => {
          console.log("Generation progress completed");
        }}
      />

      {/* Render appropriate version based on toggle */}
      {/* isCheckingState removed - let MultiViewEditor handle all loading states */}
      <ModularMultiViewEditor
        isOpen={editorOpen || !!projectId}
        onClose={() => {
          // Clear ALL state when closing to prevent pollution
          console.log("🧹 Closing AI Designer - clearing parent state");
          setProductImages({
            front: "",
            back: "",
            side: "",
            top: "",
            bottom: "",
          });
          setMultiViewRevisions([]);
          setProductName("");
          setProductDescription("");
          setIsInitialGeneration(false);
          setInitialPrompt("");
          setChatSessionId(null);
          setEditorOpen(false);

          router.push("/creator-dashboard/techpacks");
        }}
        productId={projectId || ""}
        productName={productName}
        productDescription={productDescription}
        currentViews={{
          front: productImages.front,
          back: productImages.back || productImages.front,
          side: productImages.side || productImages.front,
          top: productImages.top || "",
          bottom: productImages.bottom || "",
        }}
        revisions={multiViewRevisions}
        isInitialGeneration={isInitialGeneration && multiViewRevisions.length === 0}
        initialPrompt={initialPrompt}
        chatSessionId={chatSessionId}
        onRevisionsChange={setMultiViewRevisions}
        onEditViews={() => Promise.resolve({ success: false, error: "Not implemented in this version" })}
        onProgressiveEdit={() => Promise.resolve({ success: false, error: "Not implemented in this version" })}
        setShowIndicatorModal={setShowCompleteModal}
        setShowTutorialModal={setShowTutorialModal}
        setShowPaymentModal={setShowPaymentModal}
      />

      <Toaster />

      {/* Background Refresh Modal - Prompts user to refresh when returning from background */}
      <BackgroundRefreshModal threshold={30000} />

      <GenpireEditorGuideModal showGuideModal={showCompleteModal} setShowGuideModal={setShowCompleteModal} />
      {showTutorialModal && <GenpireTourTutorialModal onClose={() => setShowTutorialModal(false)} />}

      {/* Only show payment modal after credits are loaded, user is authenticated, and credits are low */}
      {user && !userLoading && hasFetchedCreatorCredits && !loadingGetCreatorCredits && (
        <GenpirePaymentModal showPaymentModal={showPaymentModal} setShowPaymentModal={setShowPaymentModal} />
      )}

      {/* Tech Pack Generation Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <GenerationProgressIndicator
          isVisible={isGeneratingTechPack}
          messages={TECH_PACK_STATUS_MESSAGES}
          totalDuration={TOTAL_TECH_PACK_TIME}
          onComplete={() => {
            console.log("Tech pack generation progress animation completed");
          }}
        />
      </div>
    </>
  );
}
