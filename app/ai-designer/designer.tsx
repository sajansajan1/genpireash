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
  setActiveRevision,
} from "@/app/actions/ai-image-edit-new-table";
import { getOrCreateChatSession } from "@/app/actions/chat-session";
import { generateTechPackForProduct } from "@/app/actions/create-product-entry";
import { BackgroundRefreshModal } from "@/components/background-refresh-modal";
import GenpireEditorGuideModal from "@/components/genpire-editor-guide";
import GenpireTourTutorialModal from "@/components/genpire-editor-tutorial";
import GenpirePaymentModal from "@/components/genpire-payment-modal";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
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
  const [productLinkedRevisionId, setProductLinkedRevisionId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
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
    } = supabase.auth.onAuthStateChange((event, session) => {
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

  // Clear state when projectId changes to prevent showing old product data
  useEffect(() => {
    if (projectId) {
      console.log("🔄 ProductId changed, clearing parent state");
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
    }
  }, [projectId]);

  // Load project and initialize generation
  const loadProjectAndInitialize = async (id: string) => {
    try {
      const { data: project, error } = await supabase.from("product_ideas").select("*").eq("id", id).single();

      if (error) throw error;

      if (project) {
        // Extract all data from tech_pack metadata
        const metadata = project.tech_pack?.metadata || {};
        const hasLogo = metadata.logo && metadata.logo !== "";
        const hasDesignFile = metadata.designFile && metadata.designFile !== "";
        const prompt = project.prompt || "";

        // Debug: Log what's in metadata
        console.log("📦 Project loaded - Metadata check:", {
          projectId: id,
          hasLogo,
          logoUrl: metadata.logo?.substring(0, 100) || "No logo in metadata",
          hasDesignFile,
          designFileUrl: metadata.designFile?.substring(0, 100) || "No design file",
          hasTechPack: !!project.tech_pack,
          metadataKeys: Object.keys(metadata),
        });

        // Set product info
        setProductName(project.tech_pack?.productName || "Product");
        setProductDescription(project.tech_pack?.productDescription || prompt);
        setTechPack(project.tech_pack);

        // Set the linked revision ID (which revision was used to create the product)
        setProductLinkedRevisionId(project.selected_revision_id || null);
        setIsDemo(project.is_demo || false);
        // Check if images already exist
        const hasExistingImages =
          project.image_data && project.image_data.front?.url && project.image_data.front.url !== "";

        // Load or create chat session
        if (user) {
          const sessionResult = await getOrCreateChatSession(id, user.id, project);
          if (sessionResult.success && sessionResult.sessionId) {
            setChatSessionId(sessionResult.sessionId);
            console.log("Chat session loaded/created:", sessionResult.sessionId);
          }
        }

        // Show loading state while checking
        setIsCheckingState(true);

        // Check if revisions already exist (even if images don't exist in project.image_data)
        const revisionsResult = await getGroupedMultiViewRevisions(id);
        const hasExistingRevisions =
          revisionsResult.success && revisionsResult.revisions && revisionsResult.revisions.length > 0;

        // Check for pending front view approvals
        let hasPendingApproval = false;
        let pendingApprovalData = null;
        try {
          const { getPendingFrontViewApproval } = await import("@/app/actions/progressive-generation-workflow");
          const pendingResult = await getPendingFrontViewApproval(id);
          hasPendingApproval = pendingResult.success && !!pendingResult.approval;
          pendingApprovalData = pendingResult.approval;

          if (hasPendingApproval) {
            console.log("✅ Found pending front view approval, will show approval UI");
          }
        } catch (error) {
          console.error("Error checking for pending approval:", error);
        }

        setIsCheckingState(false);

        if (hasExistingImages || hasExistingRevisions || hasPendingApproval) {
          // If we have revisions, load images from the active revision
          // This ensures we always show the latest revision's views
          if (hasExistingRevisions && revisionsResult.revisions) {
            const activeRevision = revisionsResult.revisions.find((r: any) => r.isActive);
            if (activeRevision?.views) {
              console.log("✅ Loading images from active revision:", activeRevision.revisionNumber);
              setProductImages({
                front: activeRevision.views.front?.imageUrl || "",
                back: activeRevision.views.back?.imageUrl || "",
                side: activeRevision.views.side?.imageUrl || "",
                top: activeRevision.views.top?.imageUrl || "",
                bottom: activeRevision.views.bottom?.imageUrl || "",
              });
            } else {
              // Fallback to project.image_data if revision has no views
              setProductImages({
                front: project.image_data?.front?.url || "",
                back: project.image_data?.back?.url || "",
                side: project.image_data?.side?.url || "",
                top: project.image_data?.top?.url || "",
                bottom: project.image_data?.bottom?.url || "",
              });
            }
            setMultiViewRevisions(revisionsResult.revisions);
          } else if (hasPendingApproval) {
            // If there's a pending approval but no revisions yet, load from approval
            console.log("✅ Loading front view from pending approval");
            setProductImages({
              front: pendingApprovalData?.front_view_url || "",
              back: "",
              side: "",
              top: "",
              bottom: "",
            });
          } else {
            // Otherwise load from project.image_data
            console.log("✅ Loading images from project.image_data");
            setProductImages({
              front: project.image_data?.front?.url || "",
              back: project.image_data?.back?.url || "",
              side: project.image_data?.side?.url || "",
              top: project.image_data?.top?.url || "",
              bottom: project.image_data?.bottom?.url || "",
            });
          }

          // Open editor - MultiViewEditor will handle showing the right view
          setEditorOpen(true);
          console.log("✅ Loaded existing product, opening editor");
        } else {
          // No images yet - prepare for generation
          setEditorOpen(true);
          setIsInitialGeneration(true);

          // Store initial prompt for the editor
          setInitialPrompt(prompt);

          // The MultiViewEditor will detect isInitialGeneration=true
          // and automatically trigger generation when user starts chatting
          console.log("No images found, ready for initial generation");
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    }
  };

  // Handle initial generation with progress callback
  const handleInitialGenerationWithProgress = async (
    prompt: string,
    onProgress?: (view: "front" | "back" | "side" | "top" | "bottom", imageUrl: string) => void
  ): Promise<{
    success: boolean;
    views?: {
      front: string;
      back: string;
      side: string;
      top: string;
      bottom: string;
    };
    error?: string;
  }> => {
    if (!projectId || !user?.id) {
      return { success: false, error: "Missing project or user ID" };
    }

    setIsGeneratingImages(true);

    try {
      // Extract metadata if needed
      const { data: project } = await supabase.from("product_ideas").select("tech_pack").eq("id", projectId).single();

      const metadata = project?.tech_pack?.metadata || {};

      // Debug logging for logo
      console.log("🎨 Initial Generation - Logo Debug:", {
        hasMetadata: !!metadata,
        hasLogo: !!metadata.logo,
        logoUrl: metadata.logo?.substring(0, 100) || "No logo",
        hasDesignFile: !!metadata.designFile,
        projectId,
        prompt: prompt.substring(0, 100),
      });

      // Generate images with uploaded design file and logo
      const result = await generateIdea({
        user_prompt: prompt,
        existing_project_id: projectId,
        regenerate_image_only: true,
        image: metadata.logo || undefined,
        designFile: metadata.designFile || undefined,
      });

      console.log("✅ generateIdea result:", {
        success: result.success,
        hasImage: !!result.image,
        error: result.error,
      });

      if (result.success && result.image) {
        // Progressive updates if callback provided
        if (onProgress) {
          if (result.image.front?.url) {
            onProgress("front", result.image.front.url);
          }
          if (result.image.back?.url) {
            onProgress("back", result.image.back.url);
          }
          if (result.image.side?.url) {
            onProgress("side", result.image.side.url);
          }
          if (result.image.top?.url) {
            onProgress("top", result.image.top.url);
          }
          if (result.image.bottom?.url) {
            onProgress("bottom", result.image.bottom.url);
          }
        }

        // Update local state
        console.log("Initial generation result from generateIdea:", {
          hasFront: !!result.image.front?.url,
          hasBack: !!result.image.back?.url,
          hasSide: !!result.image.side?.url,
          hasTop: !!result.image.top?.url,
          hasBottom: !!result.image.bottom?.url,
          topUrl: result.image.top?.url?.substring(0, 50),
        });

        const images = {
          front: result.image.front?.url || "",
          back: result.image.back?.url || "",
          side: result.image.side?.url || "",
          top: result.image.top?.url || "",
          bottom: result.image.bottom?.url || "",
        };
        setProductImages(images);

        // Update tech pack if returned
        if (result.techpack) {
          setTechPack(result.techpack);
          setProductName(result.techpack.productName || "Product");
          setProductDescription(result.techpack.productDescription || "");
        }

        // Save initial revision (all 5 views)
        console.log("Images to save as initial revision:", {
          hasFront: !!images.front,
          hasBack: !!images.back,
          hasSide: !!images.side,
          hasTop: !!images.top,
          hasBottom: !!images.bottom,
          topUrl: images.top?.substring(0, 50),
        });

        if (images.front || images.back || images.side || images.top || images.bottom) {
          // NOTE: Revision creation is now handled SERVER-SIDE in idea-generation.ts
          // This ensures revisions are created even if the mobile tab is backgrounded
          // Client-side revision creation removed to prevent duplicate attempts

          // const imageUrls: Record<string, { url: string }> = {};
          // if (images.front) imageUrls.front = { url: images.front };
          // if (images.back) imageUrls.back = { url: images.back };
          // if (images.side) imageUrls.side = { url: images.side };
          // if (images.top) imageUrls.top = { url: images.top };
          // if (images.bottom) imageUrls.bottom = { url: images.bottom };
          // await saveInitialRevisions(projectId, imageUrls);

          // Load the saved revisions (created server-side)
          console.log("🔄 Loading revisions for product:", projectId);
          const revisionsResult = await getGroupedMultiViewRevisions(projectId);
          console.log("📦 Revisions result:", {
            success: revisionsResult.success,
            revisionCount: revisionsResult.revisions?.length || 0,
            revisions: revisionsResult.revisions,
            error: (revisionsResult as any).error,
          });

          if (revisionsResult.success && revisionsResult.revisions && revisionsResult.revisions.length > 0) {
            console.log("✅ Setting revisions in state:", revisionsResult.revisions.length);
            setMultiViewRevisions(revisionsResult.revisions);
          } else {
            console.warn("⚠️ No revisions found, attempting client-side fallback creation");

            // FALLBACK: If server-side revision creation failed, create them client-side
            const imageUrls: Record<string, { url: string }> = {};
            if (images.front) imageUrls.front = { url: images.front };
            if (images.back) imageUrls.back = { url: images.back };
            if (images.side) imageUrls.side = { url: images.side };
            if (images.top) imageUrls.top = { url: images.top };
            if (images.bottom) imageUrls.bottom = { url: images.bottom };

            if (Object.keys(imageUrls).length > 0) {
              console.log("📝 Creating revisions via fallback with:", Object.keys(imageUrls));
              await saveInitialRevisions(projectId, imageUrls);

              // Retry loading revisions
              const retryResult = await getGroupedMultiViewRevisions(projectId);
              if (retryResult.success && retryResult.revisions) {
                console.log("✅ Fallback revisions loaded:", retryResult.revisions.length);
                setMultiViewRevisions(retryResult.revisions);
              } else {
                console.error("❌ Fallback revision creation also failed");
              }
            }
          }
        }

        // Mark initial generation as complete
        setIsInitialGeneration(false);

        return {
          success: true,
          views: images,
        };
      } else {
        throw new Error(result.error || "Failed to generate images");
      }
    } catch (error) {
      console.error("Error generating initial images:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate product images",
        variant: "destructive",
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate images",
      };
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // Handle edit from MultiViewEditor
  const handleEditMultiView = async (prompt: string, onViewComplete?: (view: string, imageUrl: string) => void) => {
    if (!projectId || !user?.id) return { success: false, error: "Missing project ID or user" };

    try {
      // Extract metadata for design file and logo
      const { data: project } = await supabase.from("product_ideas").select("tech_pack").eq("id", projectId).single();
      const metadata = project?.tech_pack?.metadata || {};

      // Add timeout to prevent hanging (3 minutes - 180 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timed out after 3 minutes. The generation is taking longer than expected.")),
          180000
        )
      );

      // Use chat uploaded image if available, otherwise fall back to logo
      const imageToUse = metadata.chatUploadedImage || metadata.logo || undefined;

      const generatePromise = generateIdea({
        user_prompt: prompt,
        existing_project_id: projectId,
        regenerate_image_only: true,
        generateMoreImages: true,
        image: imageToUse,
        designFile: metadata.designFile || undefined,
        // Credits automatically reserved by stepped workflow (2 credits for edits)
      });

      console.log("Starting generateIdea with prompt:", prompt);
      console.log("Project ID:", projectId);
      console.log("User ID:", user.id);
      console.log("Image to use:", imageToUse);
      console.log("Using chat uploaded image:", !!metadata.chatUploadedImage);
      console.log("Credits will be automatically reserved by stepped workflow (2 credits for edit)");

      const result = (await Promise.race([generatePromise, timeoutPromise])) as any;

      console.log("Generate idea completed, result:", result);

      if (result.success && result.image) {
        console.log("Edit result from generateIdea:", {
          hasFront: !!result.image.front?.url,
          hasBack: !!result.image.back?.url,
          hasSide: !!result.image.side?.url,
          hasTop: !!result.image.top?.url,
          hasBottom: !!result.image.bottom?.url,
        });

        // Progressive updates if callback provided
        if (onViewComplete) {
          if (result.image.front?.url) {
            onViewComplete("front", result.image.front.url);
          }
          if (result.image.back?.url) {
            onViewComplete("back", result.image.back.url);
          }
          if (result.image.side?.url) {
            onViewComplete("side", result.image.side.url);
          }
          if (result.image.top?.url) {
            onViewComplete("top", result.image.top.url);
          }
          if (result.image.bottom?.url) {
            onViewComplete("bottom", result.image.bottom.url);
          }
        }

        // Update local state
        setProductImages({
          front: result.image.front?.url || productImages.front,
          back: result.image.back?.url || productImages.back,
          side: result.image.side?.url || productImages.side,
          top: result.image.top?.url || productImages.top || "",
          bottom: result.image.bottom?.url || productImages.bottom || "",
        });

        // Save revision to database (both initial and subsequent edits)
        // Only save if we have valid URLs (full Supabase URLs)
        const frontUrl = result.image.front?.url || productImages.front;
        const backUrl = result.image.back?.url || productImages.back;
        const sideUrl = result.image.side?.url || productImages.side;
        const topUrl = result.image.top?.url || productImages.top || "";
        const bottomUrl = result.image.bottom?.url || productImages.bottom || "";

        // Check if URLs are valid (should start with http/https)

        const hasValidUrls =
          frontUrl?.startsWith("http") ||
          backUrl?.startsWith("http") ||
          sideUrl?.startsWith("http") ||
          topUrl?.startsWith("http") ||
          bottomUrl?.startsWith("http");

        if (hasValidUrls) {
          const imageUrls: Record<string, { url: string }> = {};

          // Only add views that have actual URLs
          if (frontUrl) imageUrls.front = { url: frontUrl };
          if (backUrl) imageUrls.back = { url: backUrl };
          if (sideUrl) imageUrls.side = { url: sideUrl };
          if (topUrl) imageUrls.top = { url: topUrl };
          if (bottomUrl) imageUrls.bottom = { url: bottomUrl };

          // NOTE: Initial revision creation is now handled SERVER-SIDE in idea-generation.ts
          // This ensures revisions are created even if the mobile tab is backgrounded
          // Only edit revisions need client-side handling via handleSaveEditedImages

          // Save revision
          if (isInitialGeneration && (!multiViewRevisions || multiViewRevisions.length === 0)) {
            // Initial revision is now created server-side, skip client-side creation
            console.log("Initial revision created server-side, loading revisions...");
            // await saveInitialRevisions(projectId, imageUrls); // REMOVED: Now server-side
          } else {
            // Save subsequent edit as new revision
            console.log("Saving edit revision with URLs:", imageUrls);
            console.log("Full URLs being passed to handleSaveEditedImages:", {
              front: frontUrl?.substring(0, 50) || "none",
              back: backUrl?.substring(0, 50) || "none",
              side: sideUrl?.substring(0, 50) || "none",
              top: topUrl?.substring(0, 50) || "none",
              bottom: bottomUrl?.substring(0, 50) || "none",
            });
            await handleSaveEditedImages(
              {
                front: frontUrl,
                back: backUrl,
                side: sideUrl,
                top: topUrl,
                bottom: bottomUrl,
              },
              prompt || "AI Edit"
            );
          }

          // Load the saved revisions to update the UI
          const revisionsResult = await getGroupedMultiViewRevisions(projectId);
          if (revisionsResult.success && revisionsResult.revisions) {
            setMultiViewRevisions(revisionsResult.revisions);
            console.log("✅ Revisions refreshed after edit, count:", revisionsResult.revisions.length);
          }
        } else {
          console.log("Skipping revision save - no valid URLs yet:", {
            front: frontUrl,
            back: backUrl,
            side: sideUrl,
          });
        }

        // Clear chat uploaded image after successful generation
        if (metadata.chatUploadedImage && project) {
          console.log("Clearing chat uploaded image from metadata");
          const clearedMetadata = { ...metadata };
          delete clearedMetadata.chatUploadedImage;

          await supabase
            .from("product_ideas")
            .update({
              tech_pack: {
                ...project.tech_pack,
                metadata: clearedMetadata,
              },
            })
            .eq("id", projectId);
        }

        return {
          success: true,
          views: {
            front: result.image.front?.url || productImages.front,
            back: result.image.back?.url || productImages.back,
            side: result.image.side?.url || productImages.side,
            top: result.image.top?.url || productImages.top || "",
            bottom: result.image.bottom?.url || productImages.bottom || "",
          },
        };
      }

      return {
        success: false,
        error: "No images generated. Please try again.",
      };
    } catch (error) {
      console.error("Error editing views:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      // Credits are automatically refunded by stepped workflow on failure

      // Show toast for timeout or other errors
      if (errorMessage.includes("timeout")) {
        toast({
          title: "Request Timed Out",
          description: "The request took too long. Please try a simpler edit or try again later.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("credits") || errorMessage.includes("Insufficient")) {
        toast({
          title: "Insufficient Credits",
          description: "You need more credits to generate new designs. Please purchase credits to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: errorMessage || "Failed to generate new design. Please try again.",
          variant: "destructive",
        });
      }

      return { success: false, error: errorMessage };
    }
  };

  // Handle progressive edit
  const handleProgressiveEditMultiView = async (
    prompt: string,
    onViewComplete: (view: string, imageUrl: string) => void
  ) => {
    return handleEditMultiView(prompt, onViewComplete);
  };

  // Handle save
  const handleSaveEditedImages = async (images: any, editPrompt?: string) => {
    if (!projectId) {
      console.error("No project ID provided");
      toast({
        title: "Save Failed",
        description: "No project ID available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      console.error("User not authenticated");
      toast({
        title: "Save Failed",
        description: "You must be logged in to save.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Import saveImageUpload function
      const { saveImageUpload } = await import("@/app/actions/image-uploads");

      // Save directly to the database
      const batchId = `batch-${Date.now()}`;

      console.log("Saving edited images with batch ID:", batchId);
      console.log("Images to save:", {
        front: images.front?.substring(0, 50) || "none",
        back: images.back?.substring(0, 50) || "none",
        side: images.side?.substring(0, 50) || "none",
        top: images.top?.substring(0, 50) || "none",
        bottom: images.bottom?.substring(0, 50) || "none",
      });

      for (const [viewType, imageUrl] of Object.entries(images)) {
        if (!imageUrl) {
          console.log(`Skipping ${viewType} - no URL provided`);
          continue;
        }

        // Get the highest revision number for this view
        const { data: existingRevisions } = await supabase
          .from("product_multiview_revisions")
          .select("revision_number")
          .eq("product_idea_id", projectId)
          .eq("view_type", viewType)
          .order("revision_number", { ascending: false })
          .limit(1);

        const nextRevisionNumber =
          existingRevisions && existingRevisions.length > 0 ? existingRevisions[0].revision_number + 1 : 1;

        // Deactivate previous active revision for this view
        await supabase
          .from("product_multiview_revisions")
          .update({ is_active: false })
          .eq("product_idea_id", projectId)
          .eq("view_type", viewType)
          .eq("is_active", true);

        // Save to images_uploads table
        try {
          // Extract file name from URL
          const urlParts = (imageUrl as string).split("/");
          const fileName = urlParts[urlParts.length - 1] || `${viewType}-r${nextRevisionNumber}-${Date.now()}.png`;

          await saveImageUpload({
            productIdeaId: projectId,
            imageUrl: imageUrl as string,
            thumbnailUrl: imageUrl as string, // Use same URL if no thumbnail
            uploadType: "edited",
            viewType: viewType as "front" | "back" | "side" | "top" | "bottom",
            fileName: fileName,
            metadata: {
              batchId,
              revisionNumber: nextRevisionNumber,
              editPrompt: editPrompt || "Manual save",
              source: "ai-designer-manual",
            },
          });
          console.log(`Saved ${viewType} image to images_uploads`);
        } catch (uploadError) {
          console.error(`Failed to save ${viewType} to images_uploads:`, uploadError);
          // Continue even if images_uploads fails
        }

        // Save new revision
        const revisionData = {
          product_idea_id: projectId,
          user_id: user.id,
          revision_number: nextRevisionNumber,
          batch_id: batchId,
          view_type: viewType,
          image_url: imageUrl as string,
          edit_prompt: editPrompt || "Manual save",
          edit_type: "manual_upload", // Changed from "manual_save" to valid value
          is_active: true,
          metadata: {
            savedAt: new Date().toISOString(),
            source: "ai-designer",
          },
        };

        console.log(`Saving ${viewType} revision:`, {
          viewType,
          imageUrlPreview: (imageUrl as string).substring(0, 50),
          batchId,
          revisionNumber: nextRevisionNumber,
        });

        const { error } = await supabase.from("product_multiview_revisions").insert(revisionData);

        if (error) {
          console.error(`Error saving ${viewType} revision:`, error);
          throw error;
        } else {
          console.log(`Successfully saved ${viewType} revision`);
        }
      }

      // Reload revisions
      const revisionsResult = await getGroupedMultiViewRevisions(projectId);
      if (revisionsResult.success && revisionsResult.revisions) {
        setMultiViewRevisions(revisionsResult.revisions);
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save your design",
        variant: "destructive",
      });
    }
  };

  // Handle revision rollback/selection
  const handleRevisionRollback = async (revision: any) => {
    console.log("[handleRevisionRollback] Revision selected:", revision.id, "batch:", revision.batchId);

    if (!projectId) {
      console.error("[handleRevisionRollback] No project ID available");
      return;
    }

    // Update the active state of revisions in LOCAL state first (optimistic update)
    if (multiViewRevisions && multiViewRevisions.length > 0) {
      const updatedRevisions = multiViewRevisions.map((r) => ({
        ...r,
        isActive: r.id === revision.id,
      }));
      setMultiViewRevisions(updatedRevisions);
    }

    // Update product images with the selected revision's views
    if (revision.views) {
      const newImages = {
        front:
          typeof revision.views.front === "string"
            ? revision.views.front
            : revision.views.front?.imageUrl || productImages.front,
        back:
          typeof revision.views.back === "string"
            ? revision.views.back
            : revision.views.back?.imageUrl || productImages.back,
        side:
          typeof revision.views.side === "string"
            ? revision.views.side
            : revision.views.side?.imageUrl || productImages.side,
        top: typeof revision.views.top === "string" ? revision.views.top : revision.views.top?.imageUrl || "",
        bottom:
          typeof revision.views.bottom === "string" ? revision.views.bottom : revision.views.bottom?.imageUrl || "",
      };

      console.log("[handleRevisionRollback] Setting productImages to:", newImages);
      setProductImages(newImages);
    }

    // CRITICAL: Persist the active revision to the database
    // This ensures the active revision is saved and visible across sessions
    if (revision.batchId) {
      try {
        console.log(`[handleRevisionRollback] Persisting active revision to database: ${revision.batchId}`);
        const result = await setActiveRevision(projectId, revision.batchId);

        if (!result.success) {
          console.error("[handleRevisionRollback] Failed to set active revision in database:", result.error);
          toast({
            title: "Warning",
            description: "Failed to save active revision. Changes may not persist.",
            variant: "destructive",
          });
        } else {
          console.log("[handleRevisionRollback] Successfully persisted active revision to database");
        }
      } catch (error) {
        console.error("[handleRevisionRollback] Error setting active revision:", error);
      }
    } else {
      console.warn("[handleRevisionRollback] No batch_id found on revision, cannot persist active state");
    }
  };

  // Handle delete revision
  const handleDeleteRevision = async (revisionId: string): Promise<boolean> => {
    if (!projectId) return false;

    try {
      // Use the server action which handles both batchId and UUID
      const result = await deleteRevision(revisionId);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete revision");
      }

      // Reload revisions
      const revisionsResult = await getGroupedMultiViewRevisions(projectId);
      if (revisionsResult.success && revisionsResult.revisions) {
        setMultiViewRevisions(revisionsResult.revisions);
      }

      return true;
    } catch (error) {
      console.error("Error deleting revision:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete revision",
        variant: "destructive",
      });
      return false;
    }
  };

  // Handle tech pack generation
  const handleGenerateTechPack = async (selectedRevision?: any) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "No project ID available",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTechPack(true);

    try {
      // Log the revision being used
      console.log("🎯 handleGenerateTechPack called with:", {
        projectId,
        hasRevision: !!selectedRevision,
        revisionId: selectedRevision?.id,
        revisionNumber: selectedRevision?.revisionNumber,
        isActive: selectedRevision?.isActive,
      });

      // Pass the selected revision data to the generation function
      const result = await generateTechPackForProduct(projectId, selectedRevision);

      if (result.success) {
        console.log("✅ Tech pack generated successfully:", {
          revisionUsed: result.revisionUsed,
          projectId,
        });
        await refetch();
        // Note: Redirect is now handled by the caller (RevisionHistory)
      } else {
        throw new Error(result.error || "Failed to generate tech pack");
      }
    } catch (error) {
      console.error("Error generating tech pack:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate tech pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTechPack(false);
    }
  };

  // Create new project
  const handleNewProject = async () => {
    if (!user?.id) return;

    const prompt = window.prompt("Enter your design idea:");
    if (!prompt) return;

    try {
      // Create minimal product entry
      const result = await createMinimalProductEntry({
        user_prompt: prompt,
        userId: user.id,
      });

      if (result.success && result.projectId) {
        // Navigate to the new project
        router.push(
          `/ai-designer?projectId=${result.projectId}&version=modular&prompt=${encodeURIComponent(
            prompt
          )}&autoGenerate=true`
        );
      }
    } catch (error) {
      console.error("Error creating project:", error);
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
              <Button onClick={() => router.push("/")} className="cursor-pointer">
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

  // Render the editor
  return (
    <>
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
        isInitialGeneration={isInitialGeneration && (!multiViewRevisions || multiViewRevisions.length === 0)}
        initialPrompt={initialPrompt}
        chatSessionId={chatSessionId}
        onRevisionsChange={setMultiViewRevisions}
        onGenerateTechPack={handleGenerateTechPack}
        onEditViews={(_currentViews, editPrompt) => handleEditMultiView(editPrompt)}
        onProgressiveEdit={(_currentViews, editPrompt, onProgress) =>
          handleProgressiveEditMultiView(editPrompt, onProgress as (view: string, imageUrl: string) => void)
        }
        onGenerateInitialImages={handleInitialGenerationWithProgress}
        onSave={handleSaveEditedImages}
        onRollback={handleRevisionRollback}
        onDeleteRevision={handleDeleteRevision}
        setShowIndicatorModal={setShowCompleteModal}
        setShowTutorialModal={setShowTutorialModal}
        setShowPaymentModal={setShowPaymentModal}
        productLinkedRevisionId={productLinkedRevisionId}
        isDemo={isDemo || false}
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
    </>
  );
}
