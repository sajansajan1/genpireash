"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";
import { getDisplayImageUrl } from "@/lib/utils/image-urls";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sparkles,
  History,
  Loader2,
  Check,
  Clock,
  Save,
  ZoomIn,
  ZoomOut,
  Move,
  Trash2,
  X,
  ChevronLeft,
  MessageSquare,
  CheckCircle,
  Package,
  Pen,
  Type,
  ArrowUp,
  Circle,
  Square,
  Undo,
  Palette,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { AIChatPanel, ChatMessage, ChatMessageType } from "./ai-chat-panel";
import { saveChatMessage, getChatMessages } from "@/app/actions/ai-chat-messages";
import { getDynamicMessage, getProgressMessage, getFollowUpSuggestion } from "@/lib/chat/dynamic-messages";
import { generateRevisionSummaryData, generateBriefSuccess } from "@/lib/chat/revision-summary";
import { formatTextWithUrls } from "@/lib/utils/format-urls";
import { uploadAnnotationScreenshot } from "@/app/actions/upload-annotation-screenshot";
import { LoadingSkeleton, RevisionSkeleton } from "./loading-skeleton";
import "./multiview-editor.css";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";

export interface MultiViewRevision {
  id: string;
  revisionNumber: number;
  views: {
    front?: { imageUrl: string; thumbnailUrl?: string };
    back?: { imageUrl: string; thumbnailUrl?: string };
    side?: { imageUrl: string; thumbnailUrl?: string };
  };
  editPrompt?: string;
  analysisPrompt?: string;
  enhancedPrompt?: string;
  editType: "initial" | "ai_edit" | "manual_upload";
  createdAt: string;
  isActive: boolean;
  metadata?: any;
}

export interface MultiViewEditorProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName?: string;
  productDescription?: string;
  currentViews: {
    front: string;
    back: string;
    side: string;
    top?: string;
    bottom?: string;
  };
  revisions: MultiViewRevision[];
  isInitialGeneration?: boolean;
  initialPrompt?: string;
  chatSessionId?: string | null;
  onRevisionsChange?: (revisions: MultiViewRevision[]) => void;
  onGenerateTechPack?: () => Promise<void>;
  onGenerateInitialImages?: (
    prompt: string,
    onProgress?: (view: "front" | "back" | "side" | "top" | "bottom", imageUrl: string) => void
  ) => Promise<{
    success: boolean;
    views?: { front: string; back: string; side: string; top?: string; bottom?: string };
    error?: string;
  }>;
  onEditViews: (
    currentViews: { front: string; back: string; side: string; top?: string; bottom?: string },
    editPrompt: string
  ) => Promise<{
    success: boolean;
    views?: { front: string; back: string; side: string; top?: string; bottom?: string };
    error?: string;
  }>;
  onProgressiveEdit?: (
    currentViews: { front: string; back: string; side: string; top?: string; bottom?: string },
    editPrompt: string,
    onProgress: (view: "front" | "back" | "side" | "top" | "bottom", imageUrl: string) => void
  ) => Promise<{
    success: boolean;
    views?: { front: string; back: string; side: string; top?: string; bottom?: string };
    error?: string;
  }>;
  onSave?: (views: { front: string; back: string; side: string; top?: string; bottom?: string }) => void;
  onRollback?: (revision: MultiViewRevision) => void;
  onDeleteRevision?: (revisionId: string, batchId?: string) => Promise<boolean>;
}

export function MultiViewEditor({
  isOpen,
  onClose,
  productId,
  productName = "Product",
  productDescription = "",
  currentViews: initialViews,
  revisions: initialRevisions,
  isInitialGeneration = false,
  initialPrompt = "",
  chatSessionId,
  onEditViews,
  onProgressiveEdit,
  onGenerateInitialImages,
  onSave,
  onRollback,
  onDeleteRevision,
  onRevisionsChange,
  onGenerateTechPack,
}: MultiViewEditorProps) {
  // Generate batch ID for this editing session
  const [batchId] = useState(() => `batch-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`);
  const [currentViews, setCurrentViews] = useState(initialViews);
  const [revisions, setRevisions] = useState<MultiViewRevision[]>(initialRevisions);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [pendingRevision, setPendingRevision] = useState<MultiViewRevision | null>(null);
  const [revisionImagesLoaded, setRevisionImagesLoaded] = useState(0); // Track number of images loaded
  const [loadingViews, setLoadingViews] = useState<{
    front: boolean;
    back: boolean;
    side: boolean;
  }>({ front: false, back: false, side: false });
  // Default to true on desktop, false on mobile
  const [showHistory, setShowHistory] = useState(typeof window !== "undefined" ? window.innerWidth >= 640 : false);
  const [zoomLevel, setZoomLevel] = useState(95); // Default 95% zoom
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const [deletingRevisionId, setDeletingRevisionId] = useState<string | null>(null);
  const [isGeneratingTechPack, setIsGeneratingTechPack] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentProcessingView, setCurrentProcessingView] = useState<"front" | "back" | "side" | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [sessionEdits, setSessionEdits] = useState<string[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState<string>(`batch-${Date.now()}`);
  const [viewerImage, setViewerImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Visual editing states
  const [isVisualEditMode, setIsVisualEditMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState<"pointer" | "pen" | "text" | "arrow" | "circle" | "square">(
    "pointer"
  );
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [annotations, setAnnotations] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
      label: string;
      isEditing: boolean;
      viewType: "front" | "back" | "side";
      type?: "point" | "text" | "arrow" | "circle" | "square" | "drawing";
      color?: string;
      path?: Array<{ x: number; y: number }>;
      width?: number;
      height?: number;
      endX?: number;
      endY?: number;
    }>
  >([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);

  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<Array<{ x: number; y: number }>>([]);
  const [drawStartPoint, setDrawStartPoint] = useState<{
    x: number;
    y: number;
    viewType: "front" | "back" | "side";
  } | null>(null);
  const [initialMessagesAdded, setInitialMessagesAdded] = useState(false);

  // Dragging states for annotations
  const [isDraggingAnnotation, setIsDraggingAnnotation] = useState(false);
  const [draggedAnnotationId, setDraggedAnnotationId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const imagesGridRef = useRef<HTMLDivElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const sideCanvasRef = useRef<HTMLCanvasElement>(null);
  const annotationLayerRef = useRef<HTMLDivElement>(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const credits = getCreatorCredits;

  // Custom pen cursor as data URL - using a pen/pencil SVG
  const penCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"></path><path d="m17 7 3-3"></path><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"></path><path d="m9 11 4 4"></path><path d="m5 19-2 1"></path><path d="m14 4 6 6"></path></svg>') 2 18, crosshair`;

  // Track previous views to detect changes
  const prevViewsRef = useRef(currentViews);

  // Update state when props change
  useEffect(() => {
    const prevViews = prevViewsRef.current;
    setCurrentViews(initialViews);
    setRevisions(initialRevisions);

    // Check if we have valid images to clear loading states
    // BUT don't clear during initial generation - let the generation process handle that
    const hasValidImages =
      initialViews.front &&
      initialViews.front !== "" &&
      initialViews.back &&
      initialViews.back !== "" &&
      initialViews.side &&
      initialViews.side !== "";

    // Only clear loading states if we're not in initial generation
    // During initial generation, the loading states should be managed by the generation process
    if (hasValidImages && !isInitialGeneration) {
      // Clear all loading states when we have valid images (for non-initial updates)
      console.log("Valid images detected (not initial generation), clearing loading states");
      setLoadingViews({ front: false, back: false, side: false });
      setIsEditing(false); // Also clear editing state
    }

    // Check if this is the completion of initial generation (images changed from placeholder to actual)
    if (isInitialGeneration && productId) {
      const wasPlaceholder =
        !prevViews.front ||
        prevViews.front === "" ||
        !prevViews.back ||
        prevViews.back === "" ||
        !prevViews.side ||
        prevViews.side === "";

      const nowHasAllImages =
        initialViews.front &&
        initialViews.front !== "" &&
        initialViews.back &&
        initialViews.back !== "" &&
        initialViews.side &&
        initialViews.side !== "";

      if (wasPlaceholder && nowHasAllImages) {
        // Clear loading states when initial generation completes with all views
        console.log("Initial generation completed with all views - clearing loading states");
        setLoadingViews({ front: false, back: false, side: false });
        setCurrentProcessingView(null);

        // Only add success message if we haven't already
        if (initialMessagesAdded) {
          // Images have been generated successfully
          addChatMessage("success", "✨ Product images generated successfully! All three views are now ready.", {
            views: ["front", "back", "side"],
            generationType: "initial",
            timestamp: new Date().toISOString(),
          });

          // Add a follow-up AI message with helpful tips
          setTimeout(() => {
            addChatMessage(
              "ai",
              "Your product views look great! You can now:\n• Use AI Micro Edits to refine specific details\n• Apply Visual Annotations to mark changes\n• Save to generate the complete tech pack",
              { helpfulTip: true }
            );
          }, 1000);
        }
      }
    }

    // Update ref for next comparison
    prevViewsRef.current = initialViews;
  }, [initialViews, initialRevisions, isInitialGeneration, productId, initialMessagesAdded]);

  // Add keyboard shortcut for undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && isVisualEditMode) {
        e.preventDefault();
        handleUndo();
      }
    };

    if (isVisualEditMode) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisualEditMode, annotations]);

  // Handle annotation dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingAnnotation && draggedAnnotationId) {
        e.preventDefault();

        // Find the container element for the annotation's view
        const annotation = annotations.find((a) => a.id === draggedAnnotationId);
        if (!annotation) return;

        // Get the appropriate container based on viewType
        let container: HTMLElement | null = null;
        if (annotation.viewType === "front") {
          container = frontCanvasRef.current?.parentElement || null;
        } else if (annotation.viewType === "back") {
          container = backCanvasRef.current?.parentElement || null;
        } else if (annotation.viewType === "side") {
          container = sideCanvasRef.current?.parentElement || null;
        }

        if (container) {
          const rect = container.getBoundingClientRect();
          const percentX = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
          const percentY = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;

          // Constrain within bounds (0-100%)
          const newX = Math.max(0, Math.min(100, percentX));
          const newY = Math.max(0, Math.min(100, percentY));

          // Update annotation position
          setAnnotations((prev) => prev.map((a) => (a.id === draggedAnnotationId ? { ...a, x: newX, y: newY } : a)));
        }
      }
    };

    const handleMouseUp = () => {
      if (isDraggingAnnotation) {
        setIsDraggingAnnotation(false);
        setDraggedAnnotationId(null);
        setDragOffset({ x: 0, y: 0 });
      }
    };

    if (isDraggingAnnotation) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingAnnotation, draggedAnnotationId, dragOffset, annotations]);

  // Initialize canvas dimensions when component mounts or visual edit mode changes
  useEffect(() => {
    if (isVisualEditMode) {
      const initializeCanvas = (canvas: HTMLCanvasElement | null, container: HTMLElement | null) => {
        if (!canvas || !container) return;

        // Set canvas dimensions to match container
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Set up canvas context
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
        }
      };

      // Initialize all canvases
      setTimeout(() => {
        const frontContainer = frontCanvasRef.current?.parentElement;
        const backContainer = backCanvasRef.current?.parentElement;
        const sideContainer = sideCanvasRef.current?.parentElement;

        if (frontContainer) initializeCanvas(frontCanvasRef.current, frontContainer);
        if (backContainer) initializeCanvas(backCanvasRef.current, backContainer);
        if (sideContainer) initializeCanvas(sideCanvasRef.current, sideContainer);

        setCanvasInitialized(true);
      }, 100);
    }
  }, [isVisualEditMode]);

  // Set loading states immediately when modal opens for initial generation
  useEffect(() => {
    if (isOpen && isInitialGeneration) {
      console.log("Initial generation detected on modal open:", {
        front: initialViews.front,
        back: initialViews.back,
        side: initialViews.side,
        isInitialGeneration,
        isOpen,
      });

      // For initial generation, ALWAYS show loading regardless of view state
      // This ensures loading shows immediately when the modal opens
      console.log("Setting loading states for initial generation");
      setLoadingViews({ front: true, back: true, side: true });

      // Also set the current processing view to indicate generation is starting
      setCurrentProcessingView("front");
    }
  }, [isOpen, isInitialGeneration]); // Remove initialViews dependency to prevent clearing

  // Handle initial generation messages
  useEffect(() => {
    if (isOpen && isInitialGeneration && initialPrompt) {
      // Check if initial message already exists in loaded chat messages
      const hasInitialMessage = chatMessages.some(
        (msg) => msg.type === "user" && msg.metadata?.isInitialRequest === true
      );

      // Only add messages if they don't already exist in the chat history
      if (!initialMessagesAdded && !hasInitialMessage) {
        setInitialMessagesAdded(true);

        // Check if this is an uploaded image
        const isUploadedDesign =
          initialPrompt.startsWith("data:image") ||
          initialPrompt.match(/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i);

        let productType = "product";
        let hasColor = null;
        let hasMaterial = null;
        let hasStyle = null;

        if (!isUploadedDesign) {
          // Extract key information from text prompt for contextual messages
          productType = initialPrompt.toLowerCase().includes("shirt")
            ? "shirt"
            : initialPrompt.toLowerCase().includes("pants")
            ? "pants"
            : initialPrompt.toLowerCase().includes("dress")
            ? "dress"
            : initialPrompt.toLowerCase().includes("jacket")
            ? "jacket"
            : initialPrompt.toLowerCase().includes("shoe")
            ? "footwear"
            : initialPrompt.toLowerCase().includes("hoodie")
            ? "hoodie"
            : initialPrompt.toLowerCase().includes("sweater")
            ? "sweater"
            : initialPrompt.toLowerCase().includes("skirt")
            ? "skirt"
            : initialPrompt.toLowerCase().includes("coat")
            ? "coat"
            : "product";

          hasColor = initialPrompt.match(
            /\b(black|white|red|blue|green|yellow|purple|pink|orange|grey|gray|brown|navy|maroon|beige|cream|teal)\b/gi
          );
          hasMaterial = initialPrompt.match(
            /\b(cotton|silk|leather|denim|wool|polyester|linen|velvet|satin|nylon|canvas|suede)\b/gi
          );
          hasStyle = initialPrompt.match(
            /\b(casual|formal|sport|athletic|elegant|modern|vintage|classic|streetwear|minimalist|luxury)\b/gi
          );
        } else {
          // For uploaded designs, use generic product type
          productType = "design";
        }

        // Save all initial messages to database
        const saveInitialMessages = async () => {
          // Skip adding user message - it's already in DB from idea-upload
          // The user message was saved before redirect
          console.log("Skipping user message creation - already in DB");

          // 2. Add AI acknowledgment with context-aware message
          setTimeout(async () => {
            let acknowledgment;

            if (!isUploadedDesign) {
              acknowledgment = `I'll create a ${productType} design`;

              // Build contextual message based on what's in the prompt
              const contextParts = [];
              if (hasStyle) contextParts.push(`${hasStyle[0].toLowerCase()} style`);
              if (hasColor) contextParts.push(`${hasColor[0].toLowerCase()} color`);
              if (hasMaterial) contextParts.push(`${hasMaterial[0].toLowerCase()} material`);

              if (contextParts.length > 0) {
                acknowledgment += ` with ${contextParts.join(", ")}`;
              }

              acknowledgment += `. Generating the front, back, and side views for you now.`;
            } else {
              acknowledgment =
                "I'll analyze your uploaded design and create the front, back, and side views. Generating all product perspectives now.";
            }

            await addChatMessage("ai", acknowledgment, {
              intent: "design_edit",
              contextualInfo: {
                productType,
                hasColor,
                hasMaterial,
                hasStyle,
                isUploadedDesign,
              },
            });
          }, 500);

          // 3. Add contextual processing status with product details
          setTimeout(async () => {
            let analysisMessage;
            if (!isUploadedDesign) {
              analysisMessage = hasStyle
                ? `🎨 Analyzing your ${hasStyle[0].toLowerCase()} ${productType} concept...`
                : `🎨 Analyzing your ${productType} design requirements...`;
            } else {
              analysisMessage = "🎨 Analyzing your uploaded design to extract product features...";
            }

            await addChatMessage("processing", analysisMessage, {
              progress: 10,
              stage: "initialization",
            });
          }, 1000);

          // 4. Context-aware progress updates for each view
          setTimeout(async () => {
            let frontMessage;
            if (!isUploadedDesign) {
              frontMessage = hasColor
                ? `Creating the front view with ${hasColor[0].toLowerCase()} coloring...`
                : `Creating the front view of your ${productType}...`;
            } else {
              frontMessage = "Creating the front view based on your uploaded design...";
            }

            await addChatMessage("processing", frontMessage, {
              progress: 33,
              view: "front",
              stage: "generation",
            });
          }, 2000);

          setTimeout(async () => {
            let backMessage;
            if (!isUploadedDesign) {
              backMessage = hasMaterial
                ? `Generating the back view with ${hasMaterial[0].toLowerCase()} texture details...`
                : `Generating the back view...`;
            } else {
              backMessage = "Generating the back view to match your design...";
            }

            await addChatMessage("processing", backMessage, {
              progress: 66,
              view: "back",
              stage: "generation",
            });
          }, 3000);

          setTimeout(async () => {
            let sideMessage;
            if (!isUploadedDesign) {
              sideMessage = hasStyle
                ? `Finalizing the side view to showcase the ${hasStyle[0].toLowerCase()} aesthetic...`
                : `Finalizing the side perspective...`;
            } else {
              sideMessage = "Finalizing the side perspective of your design...";
            }

            await addChatMessage("processing", sideMessage, {
              progress: 90,
              view: "side",
              stage: "generation",
            });
          }, 4000);

          // Don't add a duplicate completion message here - it will be added when images are ready

          // IMPORTANT: Actually trigger the image generation after messages are set
          setTimeout(() => {
            console.log("Triggering initial generation for prompt:", initialPrompt);

            // Trigger generation through the proper flow
            // Don't auto-trigger generation here - let the user initiate it
            // or let the parent component handle it through onGenerateInitialImages
            console.log("Initial messages added. Ready for generation.");

            // The generation will be triggered when:
            // 1. User sends a message in chat
            // 2. Parent component calls onGenerateInitialImages
            // This prevents the edit function from being called on non-existent images
          }, 2500); // Wait for initial messages to be added
        };

        saveInitialMessages();
      }
    }
  }, [isOpen, isInitialGeneration, initialPrompt, productId, initialMessagesAdded]);

  // Load chat history when modal opens
  useEffect(() => {
    if (isOpen && productId) {
      console.log("Loading chat history for product:", productId, "Initial generation:", isInitialGeneration);

      getChatMessages(productId, 500)
        .then((result) => {
          console.log("Chat messages loaded:", result);
          if (result.success && result.messages) {
            console.log(`Loading ${result.messages.length} messages from database`);
            setChatMessages(result.messages);

            // Debug: Log the types of messages loaded
            const messageTypes = result.messages.map((m) => m.type);
            console.log("Message types loaded:", messageTypes);

            // If this is initial generation and we have the first user message, trigger generation
            if (isInitialGeneration && result.messages.length > 0) {
              const firstUserMessage = result.messages.find((m) => m.type === "user");
              if (firstUserMessage && !initialMessagesAdded) {
                setInitialMessagesAdded(true);
                console.log("Found initial user message, triggering generation:", firstUserMessage.content);

                // Trigger initial generation automatically
                setTimeout(() => {
                  if (onGenerateInitialImages) {
                    console.log("Triggering initial generation with prompt:", firstUserMessage.content);
                    handleInitialImageGeneration(firstUserMessage.content);
                  } else {
                    console.log("No onGenerateInitialImages handler, falling back to edit");
                    handleAIEditWithPrompt(firstUserMessage.content);
                  }
                }, 1000); // Small delay to let UI settle
              }
            }

            // Check for image messages
            const imageMessages = result.messages.filter((m) => m.type === "image-ready");
            console.log(
              `Found ${imageMessages.length} image messages with metadata:`,
              imageMessages.map((m) => m.metadata)
            );
          }
        })
        .catch((error) => {
          console.error("Failed to load chat history:", error);
        });
    }
  }, [isOpen, productId, isInitialGeneration, initialMessagesAdded]);

  // Clear messages when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log("Modal closed, clearing chat messages");
      setChatMessages([]);
      setSessionEdits([]);
      setCurrentBatchId(`batch-${Date.now()}`);
      setInitialMessagesAdded(false);
      // Clear loading states when modal closes
      setLoadingViews({ front: false, back: false, side: false });
    }
  }, [isOpen]);

  // Monitor when revision images are loaded and hide skeleton
  useEffect(() => {
    if (pendingRevision && revisionImagesLoaded >= 3) {
      // All 3 images are loaded, hide the skeleton
      console.log("All revision images loaded, hiding skeleton");
      setIsEditing(false);
      setPendingRevision(null);
      setRevisionImagesLoaded(0);
    }
  }, [pendingRevision, revisionImagesLoaded]);

  // Timeout fallback to ensure skeleton doesn't stay forever
  useEffect(() => {
    if (pendingRevision) {
      const timeout = setTimeout(() => {
        console.log("Timeout reached, hiding skeleton");
        setIsEditing(false);
        setPendingRevision(null);
        setRevisionImagesLoaded(0);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeout);
    }
  }, [pendingRevision]);

  // Set showHistory based on screen size on mount
  useEffect(() => {
    const isDesktop = window.innerWidth >= 640;
    setShowHistory(isDesktop);
  }, []);

  // Get active revision (kept for potential future use)
  // const activeRevision =
  //   revisions.find((r) => r.isActive) || revisions[revisions.length - 1];

  // Handle zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        setZoomLevel((prev) => Math.min(Math.max(prev + delta, 25), 200));
      }
    };

    const container = imagesContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  // Mouse drag handlers for panning
  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && zoomLevel > 100 && !isVisualEditMode) {
      // Only allow drag when zoomed in and not in visual edit mode
      setIsDragging(true);
      setDragStart({
        x: e.clientX - viewPosition.x,
        y: e.clientY - viewPosition.y,
      });
      e.preventDefault();
    }
  };

  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handlePanMouseUp = () => {
    setIsDragging(false);
  };

  // Reset zoom and position (kept for potential future use)
  // const handleResetZoom = () => {
  //   setZoomLevel(75);
  //   setViewPosition({ x: 0, y: 0 });
  // };

  // Add message to chat and save to database
  const addChatMessage = async (type: ChatMessageType, content: string, metadata?: any, revisionId?: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
      metadata,
    };

    // Add to local state immediately
    setChatMessages((prev) => [...prev, newMessage]);

    // Save to database asynchronously
    if (productId) {
      console.log("Saving chat message to database:", {
        productIdeaId: productId,
        messageType: type,
        content,
        batchId: currentBatchId,
      });

      saveChatMessage({
        productIdeaId: productId,
        messageType: type,
        content,
        metadata,
        revisionId,
        batchId: currentBatchId,
      })
        .then(async (result) => {
          if (!result.success) {
            console.error("Failed to save chat message - Error:", result.error);
          } else {
            console.log("Chat message saved successfully");

            // Also update chat_sessions if we have a sessionId
            if (chatSessionId) {
              const { updateChatSession, getChatSessionByProductId } = await import("@/app/actions/chat-session");

              // Get the current session to ensure we have the userId
              const sessionResult = await getChatSessionByProductId(productId);
              if (sessionResult.success && sessionResult.session) {
                const chatSessionMessage = {
                  id: newMessage.id,
                  type: type,
                  content,
                  timestamp: newMessage.timestamp,
                  metadata,
                };

                // Update context if this is an edit request with screenshot
                const contextUpdates =
                  metadata?.isScreenshot && type === "image-ready"
                    ? {
                        metadata: {
                          ...sessionResult.session.context?.metadata,
                          lastScreenshot: metadata.imageUrl,
                          lastScreenshotTime: new Date().toISOString(),
                          captureReason: metadata.captureReason,
                        },
                      }
                    : undefined;

                const updateResult = await updateChatSession(
                  sessionResult.session.id,
                  chatSessionMessage as any,
                  contextUpdates
                );

                if (!updateResult.success) {
                  console.error("Failed to update chat session:", updateResult.error);
                } else {
                  console.log("Chat session updated successfully with message and context");
                }
              }
            }
          }
        })
        .catch((error) => {
          console.error("Failed to save chat message - Exception:", error);
        });
    } else {
      console.warn("Cannot save chat message - productId is missing");
    }
  };

  // AI-powered intent detection function
  const detectMessageIntent = async (
    message: string
  ): Promise<"design_edit" | "question" | "technical_info" | "feedback" | "general_chat" | "greeting"> => {
    try {
      // Get more detailed conversation history for better context
      const conversationHistory = chatMessages
        .slice(-5) // Get last 5 messages for better context
        .map((msg) => {
          const role = msg.type === "user" ? "User" : "AI";
          // Include more content for better context understanding
          const content = msg.content.length > 200 ? msg.content.substring(0, 200) + "..." : msg.content;
          return `${role}: ${content}`;
        })
        .join("\n");

      // Find the last AI message with suggestions or editable content
      const lastAIMessage = chatMessages
        .slice()
        .reverse()
        .find(
          (msg) =>
            msg.type === "ai" &&
            (msg.content.includes("Would you like") ||
              msg.content.includes("can") ||
              msg.content.includes("adjust") ||
              msg.content.includes("change") ||
              msg.content.includes("modify") ||
              msg.content.includes("design") ||
              msg.content.includes("proceed"))
        );

      const intentPrompt = `Analyze the following user message and classify its intent into ONE of these categories:

AVAILABLE INTENTS:
1. "design_edit" - User wants to modify, change, or edit the visual appearance of the product (colors, size, style, materials, textures, etc.) OR wants to implement/apply previously discussed suggestions
2. "question" - User is asking a question and expects an informative answer
3. "technical_info" - User wants technical specifications, manufacturing details, dimensions, or production information
4. "feedback" - User is providing feedback, opinion, or evaluation about the current design
5. "general_chat" - User wants to have a general conversation or discussion about the product
6. "greeting" - User is greeting or making small talk

USER MESSAGE: "${message}"

CONTEXT: This is a product design tool for "${productName}". The user is interacting with an AI assistant that can both edit product designs and answer questions.

FULL CONVERSATION HISTORY (last 5 messages):
${conversationHistory}

${
  lastAIMessage
    ? `LAST AI SUGGESTION/QUESTION:
${lastAIMessage.content}`
    : ""
}

CRITICAL RULES FOR CLASSIFICATION:
- If the user message is "ok", "go ahead", "yes", "do it", "proceed", "implement", "apply that", "let's do it", "sure", "sounds good", "implement that", "make those changes" or similar affirmative responses, AND the last AI message contained suggestions or asked about making changes, classify as "design_edit"
- Short affirmative responses like "ok go ahead" in response to AI suggestions MUST be classified as "design_edit"
- If the message contains action words like "make", "change", "add", "remove", "modify" related to the product, classify as "design_edit"
- If the user is clearly agreeing to implement suggestions from the conversation history, classify as "design_edit"
- If the message is phrased as a question (even if it mentions design elements), classify as "question" unless it explicitly asks to make changes
- Context is crucial - always consider what the AI previously suggested

Respond with ONLY the intent category name, nothing else.`;

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: intentPrompt,
          productName: productName,
          temperature: 0.3, // Lower temperature for more consistent classification
          max_tokens: 20,
        }),
      });

      if (!response.ok) {
        console.warn("AI intent detection failed, falling back to keyword detection");
        return fallbackIntentDetection(message);
      }

      const data = await response.json();
      const detectedIntent = data.suggestion?.toLowerCase().trim() || data.message?.toLowerCase().trim();

      // Validate the detected intent
      const validIntents = ["design_edit", "question", "technical_info", "feedback", "general_chat", "greeting"];
      if (validIntents.includes(detectedIntent)) {
        return detectedIntent as any;
      }

      // Fallback if AI returns invalid intent
      console.warn("Invalid intent detected:", detectedIntent, "- using fallback");
      return fallbackIntentDetection(message);
    } catch (error) {
      console.error("Error in AI intent detection:", error);
      return fallbackIntentDetection(message);
    }
  };

  // Fallback keyword-based intent detection
  const fallbackIntentDetection = (
    message: string
  ): "design_edit" | "question" | "technical_info" | "feedback" | "general_chat" | "greeting" => {
    const lowerMessage = message.toLowerCase().trim();

    // Check for affirmative responses that likely refer to previous suggestions
    const affirmativePatterns = [
      "ok",
      "okay",
      "yes",
      "yeah",
      "yep",
      "sure",
      "go ahead",
      "do it",
      "proceed",
      "implement",
      "apply",
      "let's do it",
      "sounds good",
      "make those changes",
      "implement that",
      "apply that",
    ];

    // If it's a short affirmative response and there was a recent AI suggestion
    if (
      affirmativePatterns.some(
        (pattern) => lowerMessage === pattern || lowerMessage === `${pattern}!` || lowerMessage === `${pattern}.`
      )
    ) {
      // Check if the last AI message contained a suggestion
      const lastAIMessage = chatMessages
        .slice()
        .reverse()
        .find((msg) => msg.type === "ai");

      if (
        lastAIMessage &&
        (lastAIMessage.content.includes("Would you like") ||
          lastAIMessage.content.includes("can") ||
          lastAIMessage.content.includes("adjust") ||
          lastAIMessage.content.includes("change") ||
          lastAIMessage.content.includes("proceed"))
      ) {
        return "design_edit";
      }
    }

    // Check for greetings first
    const greetingPatterns = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy"];
    if (greetingPatterns.some((pattern) => lowerMessage.includes(pattern))) {
      return "greeting";
    }

    // Check for questions
    if (
      lowerMessage.includes("?") ||
      lowerMessage.startsWith("what") ||
      lowerMessage.startsWith("how") ||
      lowerMessage.startsWith("why") ||
      lowerMessage.startsWith("when") ||
      lowerMessage.startsWith("where")
    ) {
      return "question";
    }

    // Check for design edits
    const designKeywords = ["change", "make", "add", "remove", "modify", "update", "color", "size", "style"];
    if (designKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return "design_edit";
    }

    // Default to general chat
    return "general_chat";
  };

  // Handle conversational response (non-design edits)
  const handleConversationalResponse = async (message: string, intent: string) => {
    setIsEditing(true);

    // Add thinking message
    const thinkingMessage: ChatMessage = {
      id: `thinking-${Date.now()}`,
      type: "system",
      content: "Thinking...",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, thinkingMessage]);

    try {
      // Check if this is from AI micro edits (contains annotation screenshot)
      const isFromMicroEdits =
        message.includes("![Annotated Screenshot](") ||
        message.includes("I've marked specific areas on the product images with annotations");

      // Build conversation history for context (skip for micro edits)
      const conversationHistory = isFromMicroEdits
        ? ""
        : chatMessages
            .slice(-10) // Get last 10 messages for context
            .map((msg) => {
              const role = msg.type === "user" ? "User" : "Assistant";
              return `${role}: ${msg.content}`;
            })
            .join("\n");

      // Prepare context based on intent
      let systemPrompt = "";

      // Check if the message contains a screenshot
      const hasScreenshot = message.includes("[Current Design Screenshot:");
      let enhancedPrompt = "";

      if (hasScreenshot) {
        enhancedPrompt = `IMPORTANT: The user has provided a screenshot of the current design. Please analyze the visual elements you can see in the image and provide specific feedback based on what you observe.`;
      }

      switch (intent) {
        case "question":
          systemPrompt = `You are a helpful AI assistant for a product design tool.
          The user is asking a question about the product "${productName}".
          ${
            hasScreenshot
              ? "They have provided a screenshot of the current design. Analyze the visual elements and provide specific feedback based on what you see in the image."
              : ""
          }
          Provide a clear, informative answer. Be conversational and helpful.
          Current product description: ${productDescription || "A product being designed"}
          ${enhancedPrompt}

          ${
            !isFromMicroEdits && conversationHistory
              ? `IMPORTANT: Consider the conversation history below when formulating your response:\n${conversationHistory}`
              : ""
          }`;
          break;

        case "technical_info":
          systemPrompt = `You are a technical advisor for product design and manufacturing.
          The user is asking about technical details for the product "${productName}".
          ${
            hasScreenshot
              ? "They have provided a screenshot of the current design. Analyze the technical aspects visible in the image and provide specific technical feedback."
              : ""
          }
          Provide detailed technical information, specifications, or requirements as needed.
          Be precise and professional in your response.
          ${enhancedPrompt}

          ${
            !isFromMicroEdits && conversationHistory
              ? `IMPORTANT: Consider the conversation history below when formulating your response:\n${conversationHistory}`
              : ""
          }`;
          break;

        case "feedback":
          systemPrompt = `You are a supportive design assistant.
          The user is providing feedback about the product "${productName}".
          ${
            hasScreenshot
              ? "They have provided a screenshot of the current design. Review the visual elements and provide constructive feedback on the design, colors, proportions, and overall aesthetic."
              : ""
          }
          Acknowledge their feedback appropriately and offer helpful suggestions if needed.
          Be encouraging and constructive.
          ${enhancedPrompt}

          ${
            !isFromMicroEdits && conversationHistory
              ? `IMPORTANT: Consider the conversation history below when formulating your response:\n${conversationHistory}`
              : ""
          }`;
          break;

        case "greeting":
          systemPrompt = `You are a friendly AI assistant for a product design tool.
          The user has greeted you. Respond warmly and offer to help with their product design "${productName}".
          Mention that you can help them modify the design or answer questions about it.
          Keep it brief and friendly.
          ${!isFromMicroEdits && conversationHistory ? `\n\nRecent conversation:\n${conversationHistory}` : ""}`;
          break;

        case "general_chat":
        default:
          systemPrompt = `You are a knowledgeable AI assistant for product design.
          The user wants to discuss the product "${productName}".
          ${
            hasScreenshot
              ? "They have provided a screenshot of the current design. Review all three views (front, back, side) and provide comprehensive feedback on the overall design, suggesting improvements where appropriate."
              : ""
          }
          Be conversational, friendly, and helpful. If they seem interested in making changes,
          suggest that they can ask you to modify specific aspects of the design.
          Current product description: ${productDescription || "A product being designed"}
          ${enhancedPrompt}

          ${
            !isFromMicroEdits && conversationHistory
              ? `IMPORTANT: Consider the conversation history below when formulating your response:\n${conversationHistory}`
              : ""
          }`;
          break;
      }

      // Use the AI chat endpoint for conversational response
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
          productName: productName,
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const aiResponse =
        data.suggestion || data.message || "I understand. How else can I help you with your product design?";

      // Remove thinking message
      setChatMessages((prev) => prev.filter((msg) => msg.id !== thinkingMessage.id));

      // Add AI response and save to database
      await addChatMessage("ai", aiResponse);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Remove thinking message
      setChatMessages((prev) => prev.filter((msg) => msg.id !== thinkingMessage.id));

      // Add error message
      await addChatMessage(
        "ai",
        "I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your message."
      );
    } finally {
      setIsEditing(false);
    }
  };

  // Handle user message from chat
  const handleChatMessage = async (message: string) => {
    if (!message.trim()) return;

    // Check message limit (250 messages)
    if (chatMessages.length >= 250) {
      // Add error message about limit reached
      await addChatMessage(
        "system",
        "Chat limit reached (250 messages). Please save your work and start a new session to continue."
      );

      // Show toast notification
      toast({
        title: "Chat Limit Reached",
        description: "You've reached the maximum of 250 messages. Please save your work and start a new session.",
        variant: "destructive",
        duration: 5000,
      });

      return; // Don't process the message
    }

    // Add user message to chat first (without intent yet)
    await addChatMessage("user", message);

    // Show thinking indicator while detecting intent
    const thinkingMessage: ChatMessage = {
      id: `thinking-intent-${Date.now()}`,
      type: "system",
      content: "Analyzing your message...",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, thinkingMessage]);

    try {
      // Detect intent using AI
      const intent = await detectMessageIntent(message);

      // Remove thinking message
      setChatMessages((prev) => prev.filter((msg) => msg.id !== thinkingMessage.id));

      // Log intent for debugging
      console.log("AI Detected intent:", intent, "for message:", message);

      // Add a system message showing the detected intent
      const intentLabels = {
        design_edit: "Design Edit Request",
        question: "Question",
        technical_info: "Technical Info Request",
        feedback: "Feedback/Opinion Request",
        general_chat: "General Discussion",
        greeting: "Greeting",
      };

      await addChatMessage("system", `Intent detected: ${intentLabels[intent] || intent}`, { intent });

      // Check if message already contains a screenshot URL (from AI Micro Edits)
      const messageAlreadyHasScreenshot =
        message.includes("![Annotated Screenshot](") || message.includes("[Current Design Screenshot:");

      // ALWAYS capture screenshot for edit requests (full views grid)
      const lowerMessage = message.toLowerCase();
      const shouldCaptureScreenshot =
        !messageAlreadyHasScreenshot && // Don't capture if message already has screenshot
        (intent === "design_edit" || // ALWAYS capture full grid for edit requests
          ((intent === "question" || intent === "feedback" || intent === "general_chat") &&
            (lowerMessage.includes("opinion") ||
              lowerMessage.includes("think") ||
              lowerMessage.includes("feedback") ||
              lowerMessage.includes("review") ||
              lowerMessage.includes("look") ||
              lowerMessage.includes("what do") ||
              lowerMessage.includes("how is") ||
              lowerMessage.includes("how does") ||
              lowerMessage.includes("rate") ||
              lowerMessage.includes("evaluate") ||
              lowerMessage.includes("suggest") ||
              lowerMessage.includes("improve") ||
              lowerMessage.includes("honest") ||
              lowerMessage.includes("design") ||
              lowerMessage.includes("current") ||
              lowerMessage.includes("this") ||
              lowerMessage.includes("it") ||
              (lowerMessage.includes("what") && lowerMessage.includes("about")) ||
              (lowerMessage.includes("your") &&
                (lowerMessage.includes("opinion") || lowerMessage.includes("think"))))));

      let screenshotUrl: string | null = null;
      let messageWithScreenshot = message;

      // Check if message already has a screenshot URL (from AI Micro Edits)
      if (messageAlreadyHasScreenshot) {
        // Extract the existing screenshot URL from the message
        const annotatedScreenshotMatch = message.match(/!\[Annotated Screenshot\]\(([^)]+)\)/);
        const designScreenshotMatch = message.match(/\[Current Design Screenshot: (https?:\/\/[^\]]+)\]/);

        if (annotatedScreenshotMatch) {
          screenshotUrl = annotatedScreenshotMatch[1];
          // Convert markdown image format to the format expected by AI
          messageWithScreenshot = message.replace(
            /!\[Annotated Screenshot\]\([^)]+\)/,
            `[Current Design Screenshot: ${screenshotUrl}]`
          );

          // Add the screenshot as an image message in chat
          await addChatMessage(
            "image-ready",
            "Annotated design captured for AI processing (Front, Back, and Side views)",
            {
              imageUrl: screenshotUrl,
              isScreenshot: true,
              capturedViews: ["front", "back", "side"],
              hasAnnotations: true,
            }
          );
        } else if (designScreenshotMatch) {
          screenshotUrl = designScreenshotMatch[1];
          messageWithScreenshot = message; // Already in correct format
        }
      }
      // Capture screenshot if needed - ALWAYS capture full grid for edit requests
      else if (shouldCaptureScreenshot) {
        // For edit requests, ALWAYS capture the full views grid for perfect reference
        const captureFullGrid = true; // Always capture all three views

        // Show capturing indicator
        const capturingMessage: ChatMessage = {
          id: `capturing-${Date.now()}`,
          type: "system",
          content:
            intent === "design_edit"
              ? "Capturing views grid for edit reference..."
              : "Capturing current design for analysis...",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, capturingMessage]);

        try {
          // Always capture full design screenshot with all three views
          screenshotUrl = await captureDesignScreenshot();

          if (screenshotUrl) {
            // Append screenshot to message for AI context
            messageWithScreenshot = `${message}\n\n[Current Design Screenshot: ${screenshotUrl}]`;

            // Add the screenshot as an image message in chat
            await addChatMessage(
              "image-ready",
              intent === "design_edit"
                ? "Perfect screenshot of views grid captured for edit reference (Front, Back, and Side views)"
                : "Current design captured for analysis (Front, Back, and Side views)",
              {
                imageUrl: screenshotUrl,
                isScreenshot: true,
                capturedViews: ["front", "back", "side"],
                captureReason: intent === "design_edit" ? "edit_request" : "analysis",
                timestamp: new Date().toISOString(),
              }
            );
          }
        } catch (error) {
          console.error("Failed to capture screenshot for opinion:", error);
        } finally {
          // Remove capturing message
          setChatMessages((prev) => prev.filter((msg) => msg.id !== capturingMessage.id));
        }
      }

      // Handle based on intent
      if (intent === "design_edit") {
        // Check if this is from AI micro edits (contains annotations)
        const isFromMicroEdits =
          message.includes("I've marked specific areas on the product images with annotations") ||
          message.includes("![Annotated Screenshot](");

        // ALWAYS include screenshot context for edit requests
        let finalEditPrompt = messageWithScreenshot;

        // Build full context from chat session for better edits
        if (chatSessionId && !isFromMicroEdits) {
          try {
            const { getChatSessionByProductId } = await import("@/app/actions/chat-session");
            const sessionResult = await getChatSessionByProductId(productId);

            if (sessionResult.success && sessionResult.session) {
              // Get recent messages for context
              const recentMessages = sessionResult.session.messages?.slice(-5) || [];
              const contextString = recentMessages
                .map(
                  (m: any) =>
                    `${m.type === "user" ? "User" : m.type === "ai" ? "Assistant" : "System"}: ${m.content.substring(
                      0,
                      200
                    )}`
                )
                .join("\n");

              if (contextString) {
                finalEditPrompt = `${finalEditPrompt}\n\n[Full Session Context]:\n${contextString}`;
              }

              // Add product context if available
              const productContext = sessionResult.session.context;
              if (productContext) {
                finalEditPrompt = `${finalEditPrompt}\n\n[Product Details]:\n- Type: ${productContext.productType}\n- Original Request: ${productContext.originalPrompt}`;
              }
            }
          } catch (error) {
            console.error("Failed to load chat session context:", error);
          }
        }

        // If it's from micro edits, skip ALL context checking and use the message as-is
        if (isFromMicroEdits) {
          // Use the micro edit message directly without any modifications
          setEditPrompt(message);
          handleAIEditWithPrompt(message);
          return; // Exit early to prevent any further processing
        }

        // Check if user is referring to previous suggestions
        const lowerMessage = message.toLowerCase().trim();
        const affirmativeResponses = [
          "ok",
          "okay",
          "yes",
          "yeah",
          "yep",
          "sure",
          "go ahead",
          "do it",
          "proceed",
          "implement",
          "apply",
          "let's do it",
          "sounds good",
          "make those changes",
          "implement that",
          "apply that",
          "ok go ahead",
        ];

        const isAffirmativeResponse = affirmativeResponses.some(
          (pattern) =>
            lowerMessage === pattern ||
            lowerMessage === `${pattern}!` ||
            lowerMessage === `${pattern}.` ||
            lowerMessage.includes(pattern)
        );

        // If it's an affirmative response, extract the actual changes from previous AI message
        if (isAffirmativeResponse && chatMessages.length > 0) {
          // Find the last AI message that contains actionable suggestions
          const lastAISuggestion = chatMessages
            .slice()
            .reverse()
            .find(
              (msg) =>
                msg.type === "ai" &&
                (msg.content.toLowerCase().includes("making the car bigger") ||
                  msg.content.toLowerCase().includes("adjusting the size") ||
                  msg.content.toLowerCase().includes("native roof") ||
                  msg.content.toLowerCase().includes("fixed, integral") ||
                  msg.content.toLowerCase().includes("would you like") ||
                  msg.content.toLowerCase().includes("can") ||
                  msg.content.toLowerCase().includes("we can") ||
                  msg.content.toLowerCase().includes("design"))
            );

          if (lastAISuggestion) {
            // Extract the AI's suggestion content
            const content = lastAISuggestion.content;

            // Create a clear edit prompt from the AI's suggestions
            // The AI message likely contains the changes to be made
            finalEditPrompt = `The user has confirmed they want to proceed with the following changes that were previously discussed:\n\n${content}\n\nUser's confirmation: "${message}"\n\nPlease implement all the changes mentioned above.`;
          } else {
            // If we can't find a suitable AI message but user said to go ahead,
            // we should ask for clarification
            await addChatMessage(
              "ai",
              "I understand you want to proceed, but I need to clarify what specific changes you'd like me to make. Could you please describe what modifications you want for your product?"
            );
            return;
          }
        }

        // Proceed with design edit flow
        setEditPrompt(finalEditPrompt);
        setSessionEdits((prev) => [...prev, finalEditPrompt]);

        // Pass the prompt with screenshot to the AI
        handleAIEditWithPrompt(finalEditPrompt);
      } else {
        // Handle as conversational response
        // Pass screenshot URL if available for better context
        await handleConversationalResponse(screenshotUrl ? messageWithScreenshot : message, intent);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      // Remove thinking message
      setChatMessages((prev) => prev.filter((msg) => msg.id !== thinkingMessage.id));

      // Add error message
      await addChatMessage(
        "system",
        "I apologize, but I encountered an error processing your message. Please try again."
      );
    }
  };

  // Handle initial image generation
  const handleInitialImageGeneration = async (prompt: string) => {
    if (!onGenerateInitialImages) {
      console.error("onGenerateInitialImages handler not provided");
      return;
    }

    console.log("Starting initial image generation with prompt:", prompt);

    // Track processing start time
    const processingStartTime = Date.now();

    // Generate new batch ID for this generation session
    const newBatchId = `batch-${Date.now()}`;
    setCurrentBatchId(newBatchId);

    setIsEditing(true);
    // Set all views to loading state
    setLoadingViews({ front: true, back: true, side: true });

    // Add dynamic AI acknowledgement message for initial generation
    const acknowledgements = [
      `I'll create your ${productName || "product"} design based on: "${prompt}". Let's get started!`,
      `Great idea! Let me generate "${prompt}" for you.`,
      `Perfect! I'll bring "${prompt}" to life now.`,
      `Understood! Creating your product: "${prompt}"`,
      `Exciting! Let me design "${prompt}" for you.`,
    ];
    await addChatMessage("ai", acknowledgements[Math.floor(Math.random() * acknowledgements.length)]);

    // Add dynamic analysis message
    setTimeout(async () => {
      const analysisMessage = getDynamicMessage({
        type: "analysis",
        productName,
      });
      await addChatMessage("analysis", analysisMessage);
    }, 500);

    // Add processing message
    setTimeout(async () => {
      await addChatMessage("processing", "Generating your product design from scratch...", { progress: 30 });
    }, 1500);

    try {
      // Use the initial generation handler
      const result = await onGenerateInitialImages(prompt, async (view, imageUrl) => {
        // Update current views immediately for display
        setCurrentViews((prev) => ({ ...prev, [view]: imageUrl }));

        // Add a small delay before clearing loading state
        setTimeout(() => {
          setLoadingViews((prev) => ({ ...prev, [view]: false }));
        }, 500);

        // Update current processing view
        setCurrentProcessingView(view);

        // Add progress update
        const viewName = view.charAt(0).toUpperCase() + view.slice(1);
        const progressMessage = `✅ ${viewName} view generated successfully!`;
        await addChatMessage("image-ready", progressMessage, {
          view,
          imageUrl,
          timestamp: Date.now(),
        });
      });

      if (result.success && result.views) {
        // Update views with final results
        setCurrentViews(result.views);
        setLoadingViews({ front: false, back: false, side: false });

        // Calculate processing time
        const processingTime = Date.now() - processingStartTime;

        // Generate success message
        const successMessage = generateBriefSuccess(prompt, `${Math.round(processingTime / 1000)}s`);

        // Add success message
        await addChatMessage("success", successMessage, {
          batchId: newBatchId,
          processingTime,
          editType: "initial",
        });

        // Add follow-up suggestion
        const followUpMessages = [
          "Your product is ready! You can now refine specific details or add variations.",
          "Great start! Feel free to adjust colors, materials, or styling.",
          "Your design is generated! You can modify any aspect or add brand elements.",
          "Looking good! Try adding logos, changing materials, or adjusting the style.",
        ];
        await addChatMessage("ai", followUpMessages[Math.floor(Math.random() * followUpMessages.length)]);

        // Clear the prompt input
        setEditPrompt("");

        // Mark initial generation as complete
        // This is handled by the parent component
      } else {
        throw new Error(result.error || "Failed to generate images");
      }
    } catch (error) {
      console.error("Error generating initial images:", error);
      setLoadingViews({ front: false, back: false, side: false });
      await addChatMessage(
        "error",
        "I encountered an issue generating the initial images. Please try again or contact support if the problem persists."
      );
    } finally {
      setIsEditing(false);
      setCurrentProcessingView(null);
    }
  };

  // Handle AI edit from traditional input
  const handleAIEdit = async () => {
    if (!editPrompt.trim()) return;
    handleAIEditWithPrompt(editPrompt);
  };

  // Handle AI edit with explicit prompt
  const handleAIEditWithPrompt = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Check if this is initial generation
    const isGeneratingInitial =
      isInitialGeneration &&
      (!currentViews.front ||
        currentViews.front === "" ||
        !currentViews.back ||
        currentViews.back === "" ||
        !currentViews.side ||
        currentViews.side === "");

    // If initial generation and we have the handler, use it
    if (isGeneratingInitial && onGenerateInitialImages) {
      console.log("Using onGenerateInitialImages for initial generation");
      await handleInitialImageGeneration(prompt);
      return;
    }

    // Build conversation context from previous messages
    // Include both user messages and important context
    const recentMessages = chatMessages.slice(-10); // Get last 10 messages

    // Extract user messages for context
    const userMessages = recentMessages
      .filter((msg) => msg.type === "user")
      .map((msg) => {
        // Clean up messages that contain screenshots
        let cleanContent = msg.content
          .replace(/\[Current Design Screenshot: https?:\/\/[^\]]+\]/g, "")
          .replace(/!\[Annotated Screenshot\]\([^)]+\)/g, "")
          .trim();
        return cleanContent;
      })
      .filter((content) => content.length > 0);

    // Build context string
    let conversationContext = "";
    if (userMessages.length > 0) {
      conversationContext = `Context of previous edits in this session:\n${userMessages.join("\n- ")}\n\n`;
    }

    // Add product description if available
    if (productName) {
      conversationContext += `Product: ${productName}\n\n`;
    }

    // Create prompt with context - only add modification note if not initial generation
    const promptWithContext =
      !isGeneratingInitial && conversationContext
        ? `${conversationContext}Current modification request: ${prompt}\n\nIMPORTANT: Modify the existing product based on all previous requests and this current request. Do not create a new product.`
        : prompt;

    console.log("Edit request with context:", promptWithContext);

    // Track processing start time
    const processingStartTime = Date.now();

    // Generate new batch ID for this edit session
    const newBatchId = `batch-${Date.now()}`;
    setCurrentBatchId(newBatchId);

    setIsEditing(true);
    // Set all views to loading state
    setLoadingViews({ front: true, back: true, side: true });

    // Add dynamic AI acknowledgement message
    const acknowledgements = [
      `I'll transform your product with: "${prompt}". Starting now!`,
      `Great idea! Let me apply "${prompt}" to all views.`,
      `Understood! Working on: "${prompt}" for you.`,
      `Perfect! I'll implement "${prompt}" across all angles.`,
      `Got it! Processing your request: "${prompt}"`,
    ];
    await addChatMessage("ai", acknowledgements[Math.floor(Math.random() * acknowledgements.length)]);

    // Add dynamic analysis message
    setTimeout(async () => {
      const analysisMessage = getDynamicMessage({
        type: "analysis",
        productName,
      });
      await addChatMessage("analysis", analysisMessage);
    }, 500);

    // Add processing message
    setTimeout(async () => {
      await addChatMessage("processing", "Generating enhanced images based on your specifications...", {
        progress: 30,
      });
    }, 1500);

    try {
      // Use progressive edit if available
      if (onProgressiveEdit) {
        const result = await onProgressiveEdit(
          currentViews,
          promptWithContext, // Pass prompt with conversation context
          async (view, imageUrl) => {
            // Update current views immediately for display (FIRST)
            setCurrentViews((prev) => ({ ...prev, [view]: imageUrl }));

            // Add a small delay before clearing loading state to show the overlay briefly
            setTimeout(() => {
              setLoadingViews((prev) => ({ ...prev, [view]: false }));
            }, 500); // Show loading overlay for at least 500ms

            // Update current processing view
            setCurrentProcessingView(view);

            // Add progress update before image is ready
            const viewName = view.charAt(0).toUpperCase() + view.slice(1);
            await addChatMessage("processing", `Processing ${viewName} view...`, {
              progress: view === "front" ? 50 : view === "back" ? 70 : 90,
              view,
            });

            // Add image ready message
            setTimeout(async () => {
              await addChatMessage("image-ready", `${viewName} view has been generated successfully!`, {
                view,
                imageUrl,
              });
            }, 200);

            // Show toast for completed view
            toast({
              title: `${view.charAt(0).toUpperCase() + view.slice(1)} View Updated`,
              description: `The ${view} view has been generated successfully.`,
              duration: 2000,
            });
          }
        );

        if (result.success && result.views) {
          // All views completed, update final state
          setCurrentViews(result.views);
          // Ensure all loading states are false
          setLoadingViews({ front: false, back: false, side: false });

          // Create new revision
          const isFirstRevision = revisions.length === 0 && isInitialGeneration;
          const newRevision: MultiViewRevision = {
            id: isFirstRevision ? `original-${productId}` : `rev-${Date.now()}`,
            revisionNumber: revisions.length,
            views: {
              front: { imageUrl: result.views.front },
              back: { imageUrl: result.views.back },
              side: { imageUrl: result.views.side },
            },
            editPrompt: isFirstRevision ? "Original design" : prompt,
            editType: isFirstRevision ? "initial" : "ai_edit",
            createdAt: new Date().toISOString(),
            isActive: true,
            metadata: isFirstRevision ? { generated: true } : undefined,
          };

          // Store the new revision as pending and reset image load count
          setPendingRevision(newRevision);
          setRevisionImagesLoaded(0);

          // Update revisions
          const updatedRevisions = [...revisions.map((r) => ({ ...r, isActive: false })), newRevision];
          setRevisions(updatedRevisions);

          // Notify parent component about revision change
          if (onRevisionsChange) {
            onRevisionsChange(updatedRevisions);
          }

          setEditPrompt("");

          // Clear isEditing after a delay to show the summary message
          setTimeout(() => {
            setIsEditing(false);
            setPendingRevision(null);
            setRevisionImagesLoaded(0);
          }, 3000); // 3 second delay to show summary

          // Add dynamic success message with revision info
          try {
            const briefSuccess = isFirstRevision
              ? "Your initial product design is ready!"
              : generateBriefSuccess?.(prompt, productName) || `Successfully applied "${prompt}" to all views!`;
            await addChatMessage(
              "success",
              briefSuccess,
              { revisionNumber: newRevision.revisionNumber },
              newRevision.id
            );

            // Add detailed summary after a short delay
            setTimeout(async () => {
              try {
                const summaryData = generateRevisionSummaryData?.({
                  editPrompt: prompt,
                  productName,
                  viewsGenerated: ["front", "back", "side"],
                  revisionNumber: newRevision.revisionNumber,
                  processingTime: Date.now() - processingStartTime,
                  creditsUsed: 3,
                });

                if (summaryData) {
                  // Pass summary data as metadata
                  await addChatMessage("system", "Revision complete", {
                    summary: summaryData,
                    revisionNumber: newRevision.revisionNumber,
                  });
                } else {
                  // Fallback to simple message
                  await addChatMessage(
                    "system",
                    `Revision #${newRevision.revisionNumber} complete - Applied "${prompt}" to all views`,
                    { revisionNumber: newRevision.revisionNumber }
                  );
                }
              } catch (err) {
                console.error("Error generating summary:", err);
              }
            }, 1000);
          } catch (err) {
            console.error("Error generating success message:", err);
            // Fallback message
            await addChatMessage(
              "success",
              "All views have been successfully updated!",
              { revisionNumber: newRevision.revisionNumber },
              newRevision.id
            );
          }

          // Add dynamic AI completion message
          setTimeout(async () => {
            const completionMessage = getDynamicMessage({
              type: "completion",
              productName,
            });
            await addChatMessage("ai", completionMessage);

            // Add a contextual suggestion after a delay
            if (sessionEdits.length > 0) {
              setTimeout(async () => {
                const suggestion = getFollowUpSuggestion(sessionEdits);
                await addChatMessage("system", suggestion);
              }, 1500);
            }
          }, 500);

          // Clear processing view
          setCurrentProcessingView(null);

          toast({
            title: "Edit Applied",
            description: "All views have been updated successfully.",
          });
        } else {
          // Reset loading states on error
          setLoadingViews({ front: false, back: false, side: false });
          setCurrentProcessingView(null);
          // Clear editing state on error
          setIsEditing(false);
          setPendingRevision(null);

          // Add error message
          await addChatMessage("error", `Failed to apply changes: ${result.error || "Unknown error occurred"}`);

          throw new Error(result.error || "Failed to apply AI edit");
        }
      } else {
        // Fallback to regular edit
        const result = await onEditViews(currentViews, promptWithContext);

        if (result.success && result.views) {
          // Update current views
          setCurrentViews(result.views);
          // Reset all loading states since this is non-progressive
          setLoadingViews({ front: false, back: false, side: false });

          // Create new revision
          const isFirstRevision = revisions.length === 0 && isInitialGeneration;
          const newRevision: MultiViewRevision = {
            id: isFirstRevision ? `original-${productId}` : `rev-${Date.now()}`,
            revisionNumber: revisions.length,
            views: {
              front: { imageUrl: result.views.front },
              back: { imageUrl: result.views.back },
              side: { imageUrl: result.views.side },
            },
            editPrompt: isFirstRevision ? "Original design" : prompt,
            editType: isFirstRevision ? "initial" : "ai_edit",
            createdAt: new Date().toISOString(),
            isActive: true,
            metadata: isFirstRevision ? { generated: true } : undefined,
          };

          // Store the new revision as pending and reset image load count
          setPendingRevision(newRevision);
          setRevisionImagesLoaded(0);

          // Update revisions
          const updatedRevisions = [...revisions.map((r) => ({ ...r, isActive: false })), newRevision];
          setRevisions(updatedRevisions);

          // Notify parent component about revision change
          if (onRevisionsChange) {
            onRevisionsChange(updatedRevisions);
          }

          setEditPrompt("");

          // Clear isEditing after a delay to show the summary message
          setTimeout(() => {
            setIsEditing(false);
            setPendingRevision(null);
            setRevisionImagesLoaded(0);
          }, 3000); // 3 second delay to show summary

          // Add brief success and summary for non-progressive mode
          try {
            const briefSuccess =
              generateBriefSuccess?.(prompt, productName) || `Successfully applied "${prompt}" to all views!`;
            await addChatMessage("success", briefSuccess);

            setTimeout(async () => {
              try {
                const summaryData = generateRevisionSummaryData?.({
                  editPrompt: prompt,
                  productName,
                  viewsGenerated: ["front", "back", "side"],
                  revisionNumber: revisions.length,
                  creditsUsed: 3,
                });

                if (summaryData) {
                  // Pass summary data as metadata
                  await addChatMessage("system", "Revision complete", {
                    summary: summaryData,
                  });
                } else {
                  // Fallback to simple success message
                  await addChatMessage("system", `Revision complete - Applied "${prompt}" to all views`);
                }
              } catch (err) {
                console.error("Error generating summary:", err);
              }
            }, 1000);
          } catch (err) {
            console.error("Error generating success message:", err);
            await addChatMessage("success", "All views have been successfully updated!");
          }

          toast({
            title: "Edit Applied",
            description: "All views have been updated successfully.",
          });
        } else {
          // Reset all loading states on error
          setLoadingViews({ front: false, back: false, side: false });

          // Check if it's an insufficient credits error
          if (result.error === "Insufficient credits" || result.error?.toLowerCase().includes("insufficient")) {
            // Add error message to chat
            await addChatMessage(
              "error",
              "Insufficient credits to process this request. You need 5 credits for AI image revisions."
            );

            // Add system message with help
            setTimeout(async () => {
              await addChatMessage(
                "system",
                "Visit the pricing page to purchase more credits and continue editing your product images."
              );
            }, 500);

            // Show specific insufficient credits toast here
            toast({
              variant: "destructive",
              title: "Insufficient Credits",
              description:
                "You need 5 credits for AI image revisions. Visit the pricing page to purchase more credits.",
              duration: 7000,
            });
            setEditPrompt(""); // Clear the prompt
            return;
          }

          // Add error message to chat
          await addChatMessage("error", `Failed to apply changes: ${result.error || "Unknown error occurred"}`);

          // Show generic error toast
          toast({
            variant: "destructive",
            title: "Edit Failed",
            description: result.error || "Failed to apply AI edit",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Edit failed:", error);

      // Reset all loading states on error
      setLoadingViews({ front: false, back: false, side: false });
      setCurrentProcessingView(null);
      // Clear editing state on error
      setIsEditing(false);

      // Add error message to chat
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      await addChatMessage("error", `An error occurred: ${errorMessage}`);

      // Add AI help message
      setTimeout(async () => {
        await addChatMessage(
          "ai",
          "I encountered an issue while processing your request. Please try again or modify your instructions."
        );
      }, 500);

      // Show error toast for unexpected errors
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  // Handle revision rollback
  const handleRevisionRollback = (revision: MultiViewRevision) => {
    console.log("Revision clicked:", revision);
    console.log("Revision views:", revision.views);

    // Update active revision
    const updatedRevisions = revisions.map((r) => ({
      ...r,
      isActive: r.id === revision.id,
    }));
    setRevisions(updatedRevisions);

    // Notify parent component about revision change
    if (onRevisionsChange) {
      onRevisionsChange(updatedRevisions);
    }

    // Update current views with the selected revision's images
    if (revision.views) {
      const newViews = {
        front:
          typeof revision.views.front === "string"
            ? revision.views.front
            : revision.views.front?.imageUrl || currentViews.front,
        back:
          typeof revision.views.back === "string"
            ? revision.views.back
            : revision.views.back?.imageUrl || currentViews.back,
        side:
          typeof revision.views.side === "string"
            ? revision.views.side
            : revision.views.side?.imageUrl || currentViews.side,
      };
      console.log("Setting new views:", newViews);
      setCurrentViews(newViews);

      // Force a re-render by updating a different state
      setEditPrompt("");
    }

    if (onRollback) {
      onRollback(revision);
    }

    // Close revision history on mobile after selection
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setTimeout(() => {
        setShowHistory(false);
      }, 300);
    }
  };

  // Reset to original (kept for potential future use)
  // const handleResetToOriginal = () => {
  //   const originalRevision = revisions.find(
  //     (r) => r.revisionNumber === 0 || r.metadata?.generated === true
  //   );

  //   if (originalRevision) {
  //     handleRevisionRollback(originalRevision);
  //   } else if (revisions.length > 0) {
  //     handleRevisionRollback(revisions[0]);
  //   }
  // };

  // Get canvas for view type
  const getCanvasForView = (viewType: "front" | "back" | "side") => {
    switch (viewType) {
      case "front":
        return frontCanvasRef.current;
      case "back":
        return backCanvasRef.current;
      case "side":
        return sideCanvasRef.current;
      default:
        return null;
    }
  };

  // Draw on canvas
  const drawOnCanvas = (canvas: HTMLCanvasElement, x: number, y: number, isNewStroke: boolean = false) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use actual pixel coordinates instead of percentage
    const canvasX = x;
    const canvasY = y;

    if (selectedTool === "pen") {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (isNewStroke) {
        ctx.beginPath();
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
        ctx.stroke();
      }
    }
  };

  // Clear canvas
  const clearCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Clear all canvases
  const clearAllCanvases = () => {
    if (frontCanvasRef.current) clearCanvas(frontCanvasRef.current);
    if (backCanvasRef.current) clearCanvas(backCanvasRef.current);
    if (sideCanvasRef.current) clearCanvas(sideCanvasRef.current);
  };

  // Handle mouse down for drawing
  const handleAnnotationMouseDown = (
    e: React.MouseEvent<HTMLDivElement | HTMLCanvasElement>,
    viewType: "front" | "back" | "side"
  ) => {
    if (!isVisualEditMode) return;

    // Prevent image dragging
    e.preventDefault();
    e.stopPropagation();

    const canvas = getCanvasForView(viewType);
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // No longer handling eraser here since we replaced it with undo

    // For text and pointer tools, create immediately
    if (selectedTool === "text" || selectedTool === "pointer") {
      // Convert pixel coordinates to percentages for annotations
      const xPercent = (x / canvas.width) * 100;
      const yPercent = (y / canvas.height) * 100;

      const newAnnotation = {
        id: `annotation-${Date.now()}`,
        x: xPercent,
        y: yPercent,
        label: "", // Empty label so placeholder shows
        isEditing: true,
        viewType,
        type: selectedTool === "text" ? "text" : ("point" as any),
        color: drawColor,
      };
      setAnnotations([...annotations, newAnnotation]);
      setSelectedAnnotation(newAnnotation.id);
      return;
    }

    // For drawing tools, start drawing mode
    setIsDrawing(true);
    setDrawStartPoint({ x, y, viewType });

    if (selectedTool === "pen" && canvas) {
      drawOnCanvas(canvas, x, y, true);
      setCurrentDrawing([{ x, y }]);
    } else if ((selectedTool === "circle" || selectedTool === "square" || selectedTool === "arrow") && canvas) {
      // Store starting point for shapes
      setCurrentDrawing([{ x, y }]);
    }
  };

  // Handle mouse move for drawing
  const handleAnnotationMouseMove = (
    e: React.MouseEvent<HTMLDivElement | HTMLCanvasElement>,
    viewType: "front" | "back" | "side"
  ) => {
    if (!isVisualEditMode || !isDrawing || !drawStartPoint || drawStartPoint.viewType !== viewType) return;

    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    const canvas = getCanvasForView(viewType);
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (!canvas) return;

    if (selectedTool === "pen") {
      drawOnCanvas(canvas, x, y, false);
      setCurrentDrawing((prev) => [...prev, { x, y }]);
    } else if (selectedTool === "circle" || selectedTool === "square" || selectedTool === "arrow") {
      // For shapes, we'll draw preview on mouse up
      setCurrentDrawing([drawStartPoint, { x, y }]);
    }
  };

  // Draw shape on canvas
  const drawShapeOnCanvas = (canvas: HTMLCanvasElement, startX: number, startY: number, endX: number, endY: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use actual pixel coordinates
    const canvasStartX = startX;
    const canvasStartY = startY;
    const canvasEndX = endX;
    const canvasEndY = endY;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (selectedTool === "circle") {
      const radius = Math.sqrt(Math.pow(canvasEndX - canvasStartX, 2) + Math.pow(canvasEndY - canvasStartY, 2));
      ctx.beginPath();
      ctx.arc(canvasStartX, canvasStartY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (selectedTool === "square") {
      ctx.beginPath();
      ctx.rect(
        Math.min(canvasStartX, canvasEndX),
        Math.min(canvasStartY, canvasEndY),
        Math.abs(canvasEndX - canvasStartX),
        Math.abs(canvasEndY - canvasStartY)
      );
      ctx.stroke();
    } else if (selectedTool === "arrow") {
      const angle = Math.atan2(canvasEndY - canvasStartY, canvasEndX - canvasStartX);

      // Draw line
      ctx.beginPath();
      ctx.moveTo(canvasStartX, canvasStartY);
      ctx.lineTo(canvasEndX, canvasEndY);
      ctx.stroke();

      // Draw arrowhead
      const arrowLength = 15;
      ctx.beginPath();
      ctx.moveTo(canvasEndX, canvasEndY);
      ctx.lineTo(
        canvasEndX - arrowLength * Math.cos(angle - Math.PI / 6),
        canvasEndY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(canvasEndX, canvasEndY);
      ctx.lineTo(
        canvasEndX - arrowLength * Math.cos(angle + Math.PI / 6),
        canvasEndY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }
  };

  // Handle mouse up to finish drawing
  const handleAnnotationMouseUp = (
    e: React.MouseEvent<HTMLDivElement | HTMLCanvasElement>,
    viewType: "front" | "back" | "side"
  ) => {
    if (!isVisualEditMode || !isDrawing || !drawStartPoint) return;

    const canvas = getCanvasForView(viewType);
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    // Draw shapes on canvas
    if (canvas && (selectedTool === "circle" || selectedTool === "square" || selectedTool === "arrow")) {
      drawShapeOnCanvas(canvas, drawStartPoint.x, drawStartPoint.y, endX, endY);
    }

    // For pen tool, the drawing is already done during mouse move
    // We just save the path for later reference if needed
    if (selectedTool === "pen" && currentDrawing.length > 1) {
      // Optionally save the drawing path
      // const newAnnotation = {
      //   id: `annotation-${Date.now()}`,
      //   x: drawStartPoint.x,
      //   y: drawStartPoint.y,
      //   label: "",
      //   isEditing: false,
      //   viewType: drawStartPoint.viewType,
      //   type: "drawing",
      //   color: drawColor,
      //   path: currentDrawing,
      // };
      // Store for undo/redo or export purposes
      // setAnnotations([...annotations, newAnnotation]);
    }

    // Reset drawing state
    setIsDrawing(false);
    setCurrentDrawing([]);
    setDrawStartPoint(null);
  };

  // Handle annotation label update
  const handleAnnotationLabelUpdate = (id: string, label: string) => {
    setAnnotations(annotations.map((ann) => (ann.id === id ? { ...ann, label, isEditing: false } : ann)));
  };

  // Handle annotation delete
  const handleAnnotationDelete = (id: string) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id));
    if (selectedAnnotation === id) {
      setSelectedAnnotation(null);
    }
  };

  // Handle undo - removes the last annotation
  const handleUndo = () => {
    if (annotations.length > 0) {
      // Remove the last annotation
      const updatedAnnotations = annotations.slice(0, -1);
      setAnnotations(updatedAnnotations);

      // Clear selection if the deleted annotation was selected
      const lastAnnotation = annotations[annotations.length - 1];
      if (lastAnnotation && selectedAnnotation === lastAnnotation.id) {
        setSelectedAnnotation(null);
      }
    }
  };

  // Render annotation based on type
  const renderAnnotation = (annotation: any) => {
    if (annotation.type === "drawing" && annotation.path) {
      // Render pen drawing as SVG path with percentage units
      const pathData = annotation.path
        .map((point: any, index: number) => `${index === 0 ? "M" : "L"} ${point.x}% ${point.y}%`)
        .join(" ");

      return (
        <svg
          key={annotation.id}
          className="absolute inset-0 z-20 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <path
            d={pathData}
            stroke={annotation.color || "#FF0000"}
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    } else if (annotation.type === "circle") {
      const width = annotation.width || 64;
      const height = annotation.height || 64;
      return (
        <div
          key={annotation.id}
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
            width: `${width}px`,
            height: `${height}px`,
            transform: "translate(-50%, -50%)",
            border: `2px solid ${annotation.color || "#FF0000"}`,
            borderRadius: "50%",
          }}
        />
      );
    } else if (annotation.type === "square") {
      const width = annotation.width ? `${annotation.width}%` : "80px";
      const height = annotation.height ? `${annotation.height}%` : "80px";
      return (
        <div
          key={annotation.id}
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
            width,
            height,
            border: `2px solid ${annotation.color || "#FF0000"}`,
          }}
        />
      );
    } else if (annotation.type === "arrow") {
      if (annotation.endX !== undefined && annotation.endY !== undefined) {
        // Draw arrow line from start to end
        const dx = annotation.endX - annotation.x;
        const dy = annotation.endY - annotation.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const length = Math.sqrt(dx * dx + dy * dy);

        return (
          <div
            key={annotation.id}
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "0 50%",
            }}
          >
            <div
              style={{
                width: `${length}%`,
                height: "2px",
                backgroundColor: annotation.color || "#FF0000",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: `8px solid ${annotation.color || "#FF0000"}`,
                  borderTop: "4px solid transparent",
                  borderBottom: "4px solid transparent",
                }}
              />
            </div>
          </div>
        );
      } else {
        return (
          <div
            key={annotation.id}
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <ArrowUp className="w-8 h-8" style={{ color: annotation.color || "#FF0000" }} />
          </div>
        );
      }
    } else if (annotation.type === "text") {
      return (
        <div
          key={annotation.id}
          className="absolute z-20 group"
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
            transform: "translate(-50%, -50%)",
            cursor: isDraggingAnnotation && draggedAnnotationId === annotation.id ? "grabbing" : "grab",
          }}
          onMouseDown={(e) => {
            if (!annotation.isEditing && e.button === 0) {
              e.preventDefault();
              e.stopPropagation();
              const rect = (e.currentTarget.parentElement as HTMLElement)?.getBoundingClientRect();
              if (rect) {
                setIsDraggingAnnotation(true);
                setDraggedAnnotationId(annotation.id);
                const percentX = ((e.clientX - rect.left) / rect.width) * 100;
                const percentY = ((e.clientY - rect.top) / rect.height) * 100;
                setDragOffset({
                  x: percentX - annotation.x,
                  y: percentY - annotation.y,
                });
              }
            }
          }}
        >
          <div className="relative">
            <div
              className="bg-white/95 px-3 py-2 pr-8 rounded shadow-lg border-2"
              style={{
                borderColor: annotation.color || "#FF0000",
                minWidth: "150px",
                maxWidth: "220px",
              }}
            >
              {annotation.isEditing ? (
                <input
                  type="text"
                  className="text-sm font-medium text-gray-900 bg-transparent outline-none min-w-[150px]"
                  placeholder="Add text here..."
                  autoFocus
                  defaultValue={annotation.label}
                  onBlur={(e) => handleAnnotationLabelUpdate(annotation.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAnnotationLabelUpdate(annotation.id, e.currentTarget.value);
                    }
                    if (e.key === "Escape") {
                      handleAnnotationDelete(annotation.id);
                    }
                  }}
                />
              ) : (
                <span
                  className="text-sm font-medium cursor-pointer whitespace-nowrap"
                  style={{ color: annotation.color || "#FF0000" }}
                  onClick={() => {
                    setAnnotations(annotations.map((a) => (a.id === annotation.id ? { ...a, isEditing: true } : a)));
                  }}
                >
                  {(() => {
                    const text = annotation.label || "Click to edit";
                    const words = text.split(" ");
                    const lines = [];
                    for (let i = 0; i < words.length; i += 3) {
                      lines.push(words.slice(i, i + 3).join(" "));
                    }
                    return lines.map((line, index) => (
                      <span key={index} className="block">
                        {line}
                      </span>
                    ));
                  })()}
                </span>
              )}
            </div>
            {/* Delete button */}
            <button
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              onClick={() => handleAnnotationDelete(annotation.id)}
              title="Delete annotation"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    } else {
      // Default point annotation for "pointer" tool
      return (
        <div
          key={annotation.id}
          className="absolute z-20 group"
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
            transform: "translate(-50%, -50%)",
            cursor: isDraggingAnnotation && draggedAnnotationId === annotation.id ? "grabbing" : "grab",
          }}
          onMouseDown={(e) => {
            if (!annotation.isEditing && e.button === 0) {
              e.preventDefault();
              e.stopPropagation();
              const rect = (e.currentTarget.parentElement as HTMLElement)?.getBoundingClientRect();
              if (rect) {
                setIsDraggingAnnotation(true);
                setDraggedAnnotationId(annotation.id);
                const percentX = ((e.clientX - rect.left) / rect.width) * 100;
                const percentY = ((e.clientY - rect.top) / rect.height) * 100;
                setDragOffset({
                  x: percentX - annotation.x,
                  y: percentY - annotation.y,
                });
              }
            }
          }}
        >
          <div className="relative">
            <div
              className="w-3 h-3 rounded-full border-2 border-white shadow-lg animate-pulse"
              style={{ backgroundColor: annotation.color || "#FF0000" }}
            />
            {(annotation.isEditing || annotation.label) && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="flex items-center">
                  <div className="w-8 h-[1px]" style={{ backgroundColor: annotation.color || "#FF0000" }} />
                  <div
                    className="ml-1 bg-white/95 px-3 py-2 pr-7 rounded shadow-lg border"
                    style={{
                      borderColor: annotation.color || "#FF0000",
                      minWidth: "120px",
                      maxWidth: "200px",
                    }}
                  >
                    {annotation.isEditing ? (
                      <input
                        type="text"
                        className="text-xs font-medium text-gray-900 bg-transparent outline-none min-w-[120px]"
                        placeholder="Describe edit..."
                        autoFocus
                        defaultValue={annotation.label}
                        onBlur={(e) => handleAnnotationLabelUpdate(annotation.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAnnotationLabelUpdate(annotation.id, e.currentTarget.value);
                          }
                          if (e.key === "Escape") {
                            handleAnnotationDelete(annotation.id);
                          }
                        }}
                      />
                    ) : (
                      <span
                        className="text-xs font-medium cursor-pointer whitespace-nowrap"
                        style={{ color: annotation.color || "#FF0000" }}
                        onClick={() => {
                          setAnnotations(
                            annotations.map((a) => (a.id === annotation.id ? { ...a, isEditing: true } : a))
                          );
                        }}
                      >
                        {(() => {
                          const text = annotation.label;
                          const words = text.split(" ");
                          const lines = [];
                          for (let i = 0; i < words.length; i += 3) {
                            lines.push(words.slice(i, i + 3).join(" "));
                          }
                          return lines.map((line, index) => (
                            <span key={index} className="block text-left">
                              {line}
                            </span>
                          ));
                        })()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Delete button */}
            <button
              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              onClick={() => handleAnnotationDelete(annotation.id)}
              title="Delete pin"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      );
    }
  };

  // Capture front view only screenshot for regular edit requests
  const captureFrontViewScreenshot = async (): Promise<string | null> => {
    try {
      // Find the front view container element
      const frontViewContainer = document.querySelector('[data-view="front"]') as HTMLElement;
      if (!frontViewContainer) {
        console.error("Front view element not found");
        return null;
      }

      // Find the actual image container (the div with position relative that contains the image)
      const imageContainer = frontViewContainer.querySelector(".relative.group") as HTMLElement;
      if (!imageContainer) {
        console.error("Front view image container not found");
        return null;
      }

      // Wait for front image to be fully loaded
      const frontImage = imageContainer.querySelector("img");
      if (frontImage) {
        await new Promise((resolve) => {
          if (frontImage.complete) {
            resolve(true);
          } else {
            frontImage.onload = () => resolve(true);
            frontImage.onerror = () => resolve(false);
          }
        });
      }

      // Small delay to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force layout recalculation
      imageContainer.style.display = "block";
      const rect = imageContainer.getBoundingClientRect();

      // Capture only the front view image container
      const canvas = await html2canvas(imageContainer, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
        width: rect.width,
        height: rect.height,
        x: 0,
        y: 0,
      });

      // Convert to blob and then base64
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error("Failed to capture front view screenshot"));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Data = reader.result as string;

              // Upload screenshot to Supabase
              const uploadResult = await uploadAnnotationScreenshot(base64Data, productId);

              if (uploadResult.success && uploadResult.url) {
                resolve(uploadResult.url);
              } else {
                reject(new Error(uploadResult.error || "Failed to upload front view screenshot"));
              }
            } catch (uploadError) {
              reject(uploadError);
            }
          };
          reader.readAsDataURL(blob);
        }, "image/png");
      });
    } catch (error) {
      console.error("Failed to capture front view screenshot:", error);
      return null;
    }
  };

  // Capture current design screenshot for AI analysis (full grid)
  const captureDesignScreenshot = async (): Promise<string | null> => {
    try {
      if (!imagesGridRef.current) {
        console.error("Images grid ref not available");
        return null;
      }

      // Wait for images to be fully loaded
      const images = imagesGridRef.current.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            if (!img.src) {
              resolve(false);
            }
          });
        })
      );

      // Small delay to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture the grid
      const canvas = await html2canvas(imagesGridRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
      });

      // Convert to blob and then base64
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error("Failed to capture screenshot"));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Data = reader.result as string;

              // Upload screenshot to Supabase
              const uploadResult = await uploadAnnotationScreenshot(base64Data, productId);

              if (uploadResult.success && uploadResult.url) {
                resolve(uploadResult.url);
              } else {
                reject(new Error(uploadResult.error || "Failed to upload screenshot"));
              }
            } catch (error) {
              reject(error);
            }
          };
          reader.readAsDataURL(blob);
        }, "image/png");
      });
    } catch (error) {
      console.error("Failed to capture design screenshot:", error);
      return null;
    }
  };

  // Capture canvas screenshot and implement visual edits
  const handleImplementVisualEdits = async () => {
    if (annotations.length === 0) {
      toast({
        title: "No annotations",
        description: "Please add at least one annotation before implementing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading toast
      toast({
        title: "Capturing annotations",
        description: "Taking screenshot of your visual edits...",
      });

      // Capture screenshot of the grid with annotations
      if (imagesGridRef.current) {
        // Wait for images to be fully loaded
        const images = imagesGridRef.current.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
              // Force reload if needed
              if (!img.src) {
                resolve(false);
              }
            });
          })
        );

        // Small delay to ensure rendering is complete
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Force a unique timestamp to prevent any caching
        const timestamp = Date.now();

        const canvas = await html2canvas(imagesGridRef.current, {
          backgroundColor: "#ffffff",
          scale: 2, // Higher quality
          logging: false,
          useCORS: true,
          allowTaint: true,
          imageTimeout: 15000, // Wait up to 15 seconds for images
          // Force re-render by adding a cache buster
          onclone: (clonedDoc) => {
            // Find all canvas elements in the cloned document
            const canvases = clonedDoc.querySelectorAll("canvas");
            canvases.forEach((clonedCanvas, index) => {
              // Find corresponding original canvas
              const originalCanvases = imagesGridRef.current?.querySelectorAll("canvas");
              if (originalCanvases && originalCanvases[index]) {
                const originalCanvas = originalCanvases[index] as HTMLCanvasElement;
                const clonedCanvasElement = clonedCanvas as HTMLCanvasElement;
                const ctx = clonedCanvasElement.getContext("2d");
                if (ctx) {
                  // Copy the content from original canvas to cloned canvas
                  ctx.drawImage(originalCanvas, 0, 0);
                }
              }
            });
          },
        });

        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (!blob) {
            throw new Error("Failed to capture screenshot");
          }

          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Data = reader.result as string;

              // Upload screenshot to Supabase using server action with timestamp to ensure uniqueness
              const uploadResult = await uploadAnnotationScreenshot(base64Data, productId);

              if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || "Failed to upload screenshot");
              }

              // Add cache buster to ensure fresh image is always loaded
              const screenshotUrl = `${uploadResult.url}?t=${timestamp}`;

              // Create a summary of all annotations with view information
              const annotationsByView = {
                front: annotations.filter((a) => a.viewType === "front"),
                back: annotations.filter((a) => a.viewType === "back"),
                side: annotations.filter((a) => a.viewType === "side"),
              };

              let annotationSummary = "Visual edits requested:\n\n";

              if (annotationsByView.front.length > 0) {
                annotationSummary += "**Front View:**\n";
                annotationsByView.front.forEach((ann, i) => {
                  annotationSummary += `${i + 1}. ${ann.label || "Edit point"} at position (${Math.round(
                    ann.x
                  )}%, ${Math.round(ann.y)}%)\n`;
                });
                annotationSummary += "\n";
              }

              if (annotationsByView.back.length > 0) {
                annotationSummary += "**Back View:**\n";
                annotationsByView.back.forEach((ann, i) => {
                  annotationSummary += `${i + 1}. ${ann.label || "Edit point"} at position (${Math.round(
                    ann.x
                  )}%, ${Math.round(ann.y)}%)\n`;
                });
                annotationSummary += "\n";
              }

              if (annotationsByView.side.length > 0) {
                annotationSummary += "**Side View:**\n";
                annotationsByView.side.forEach((ann, i) => {
                  annotationSummary += `${i + 1}. ${ann.label || "Edit point"} at position (${Math.round(
                    ann.x
                  )}%, ${Math.round(ann.y)}%)\n`;
                });
              }

              const message = `I've marked specific areas on the product images with annotations. Please apply these visual edits:\n\n${annotationSummary}\n\nPlease analyze the screenshot to see the exact positions of the annotations and apply the requested changes consistently across all views.\n\n![Annotated Screenshot](${screenshotUrl})`;

              // Send to handle chat message for AI processing with image URL
              // This will add the message to chat and process it
              await handleChatMessage(message);

              // Clear annotations and exit visual edit mode AFTER processing
              // Small delay to ensure screenshot is visible in chat before clearing
              setTimeout(() => {
                clearAllCanvases();
                setAnnotations([]);
                setIsVisualEditMode(false);
                setSelectedAnnotation(null);
              }, 500);

              toast({
                title: "Visual edits submitted",
                description: `Screenshot with ${annotations.length} annotation(s) sent to AI for processing`,
              });
            } catch (uploadError) {
              console.error("Failed to upload screenshot:", uploadError);

              // Fallback to text-only submission
              const annotationSummary = annotations
                .map(
                  (ann, index) =>
                    `${index + 1}. ${ann.label || "Unlabeled point"} in ${ann.viewType} view at position (${Math.round(
                      ann.x
                    )}%, ${Math.round(ann.y)}%)`
                )
                .join("\n");

              const message = `Please apply these visual edits to the product:\n\n${annotationSummary}\n\nMake sure to apply changes consistently across all views.`;

              await handleChatMessage(message);

              // Clear after processing
              setTimeout(() => {
                clearAllCanvases();
                setAnnotations([]);
                setIsVisualEditMode(false);
                setSelectedAnnotation(null);
              }, 500);

              toast({
                title: "Visual edits submitted",
                description: `${annotations.length} annotation(s) sent to AI (text only)`,
              });
            }
          };

          reader.readAsDataURL(blob);
        }, "image/png");
      }
    } catch (error) {
      console.error("Failed to capture screenshot:", error);

      // Fallback to text-only submission
      const annotationSummary = annotations
        .map(
          (ann, index) =>
            `${index + 1}. ${ann.label || "Unlabeled point"} in ${ann.viewType} view at position (${Math.round(
              ann.x
            )}%, ${Math.round(ann.y)}%)`
        )
        .join("\n");

      const message = `Please apply these visual edits to the product:\n\n${annotationSummary}\n\nMake sure to apply changes consistently across all views.`;

      await handleChatMessage(message);

      // Clear after processing
      setTimeout(() => {
        clearAllCanvases();
        setAnnotations([]);
        setIsVisualEditMode(false);
        setSelectedAnnotation(null);
      }, 500);

      toast({
        title: "Visual edits submitted",
        description: `${annotations.length} annotation(s) sent to AI (text only)`,
      });
    }
  };

  // Handle save
  const handleSave = async () => {
    if ((getCreatorCredits?.credits ?? 0) <= 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: "You need at least 1 credit to generate the tech pack",
      });
      setIsGeneratingTechPack(false);
      return;
    }

    if (onGenerateTechPack) {
      setIsGeneratingTechPack(true);
      try {
        await onGenerateTechPack();
      } catch (error) {
        console.error("Error generating tech pack:", error);
      } finally {
        setIsGeneratingTechPack(false);
      }
    } else if (onSave) {
      onSave(currentViews);
      onClose();
    }
  };

  // Handle delete revision
  const handleDeleteRevision = async (revision: MultiViewRevision, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering rollback

    if (!onDeleteRevision || deletingRevisionId) return;

    // Don't allow deleting revision 0 (original)
    if (revision.revisionNumber === 0) {
      toast({
        title: "Cannot Delete",
        description: "The original generated images cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    // Don't allow deleting active revision
    if (revision.isActive) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the currently active revision. Switch to another revision first.",
        variant: "destructive",
      });
      return;
    }

    // Set loading state
    setDeletingRevisionId(revision.id);

    try {
      const success = await onDeleteRevision(revision.id, revision.metadata?.batchId);

      if (success) {
        // Remove from local state immediately
        setRevisions((prevRevisions) => {
          // Never remove the original revision (revision 0)
          const filtered = prevRevisions.filter((r) => {
            // Always keep the original
            if (r.revisionNumber === 0) return true;

            // If we're deleting by batchId, remove all revisions with that batchId
            if (revision.metadata?.batchId) {
              return r.metadata?.batchId !== revision.metadata?.batchId;
            }
            // Otherwise just remove the single revision
            return r.id !== revision.id;
          });

          // Notify parent component about revision change
          if (onRevisionsChange) {
            onRevisionsChange(filtered);
          }

          return filtered;
        });

        toast({
          title: "Revision Deleted",
          description: `Revision #${revision.revisionNumber} has been deleted.`,
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete the revision. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setDeletingRevisionId(null);
    }
  };

  // Edit suggestions
  const editSuggestions = [
    "Change color scheme to blue",
    "Make it more modern and sleek",
    "Add metallic finish",
    "Remove background",
    "Enhance details",
    "Make it minimalist",
    "Add premium look",
    "Improve lighting",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-0 overflow-hidden flex flex-col rounded-none m-0 max-w-full w-full h-[100dvh] fixed inset-0 top-0 left-0"
        aria-describedby="multiview-editor-description"
      >
        <div id="multiview-editor-description" className="sr-only">
          AI-powered multi-view product editor for creating and editing product images from front, back, and side views
        </div>
        <TooltipProvider>
          <div className="flex h-full overflow-hidden">
            {/* Left Chat Panel */}
            <div className="hidden lg:flex w-96 border-r">
              <AIChatPanel
                messages={chatMessages}
                onSendMessage={handleChatMessage}
                isProcessing={isEditing}
                currentView={currentProcessingView}
                className="w-full"
                onImageClick={(src, title) => setViewerImage({ src, title })}
              />
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center justify-between gap-4 sm:gap-6">
                    {/* Left Section - Product Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="hidden sm:flex h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-zinc-900" />
                      </div>
                      <div className="min-w-0 flex-1 max-w-md">
                        <DialogTitle className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                          {(() => {
                            // Split product name into words and group them (max 3 words per line)
                            const words = productName.split(" ");
                            const lines = [];
                            for (let i = 0; i < words.length; i += 3) {
                              lines.push(words.slice(i, i + 3).join(" "));
                            }
                            return lines.map((line, index) => (
                              <span key={index} className="block">
                                {line}
                              </span>
                            ));
                          })()}
                        </DialogTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-1.5">
                          AI-Powered Multi-View Editor
                        </p>
                      </div>
                    </div>

                    {/* Right Section - Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Mobile Chat Toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMobileChat(!showMobileChat)}
                        className="lg:hidden h-9 px-3"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">Chat</span>
                      </Button>

                      {/* History button */}
                      <Button
                        variant={showHistory ? "default" : "outline"}
                        size="sm"
                        className="h-9 px-3"
                        onClick={() => setShowHistory(!showHistory)}
                      >
                        <History className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">History</span>
                      </Button>

                      {/* Divider */}
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                      {/* Save & Close buttons */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>

                      <Button variant="ghost" size="sm" onClick={onClose} className="h-9 px-3">
                        <X className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">Close</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Views Display */}
              <div
                ref={imagesContainerRef}
                className="flex-1 overflow-auto bg-muted/20 relative pb-[200px] sm:pb-0"
                onMouseDown={handlePanMouseDown}
                onMouseMove={handlePanMouseMove}
                onMouseUp={handlePanMouseUp}
                onMouseLeave={handlePanMouseUp}
                style={{
                  cursor: isDragging ? "grabbing" : zoomLevel > 100 ? "grab" : "default",
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                  backgroundPosition: "center",
                }}
              >
                {/* Floating Action Buttons - Bottom Right */}
                <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-3">
                  {/* AI Micro Edits Button */}
                  {!isVisualEditMode ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => {
                              setIsVisualEditMode(true);
                              setZoomLevel(100);
                              setViewPosition({ x: 0, y: 0 });
                            }}
                            disabled={isEditing || loadingViews.front || loadingViews.back || loadingViews.side}
                            className="group relative bg-[#1C1917] hover:bg-[#2a2825] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 px-5 py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1C1917] cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {isEditing || loadingViews.front || loadingViews.back || loadingViews.side ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                              <span className="text-sm">AI Micro Edits</span>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        {(isEditing || loadingViews.front || loadingViews.back || loadingViews.side) && (
                          <TooltipContent>
                            <p>Please wait for AI processing to complete</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div className="flex flex-col items-end gap-3">
                      {/* Tools Toolbar */}
                      <div className="flex items-center gap-2 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full shadow-xl border border-slate-200 dark:border-slate-700">
                        {/* Tool Buttons */}
                        <div className="flex items-center gap-1 px-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={selectedTool === "pointer" ? "default" : "ghost"}
                                  size="icon"
                                  onClick={() => setSelectedTool("pointer")}
                                  className="h-8 w-8 rounded-full"
                                >
                                  <Sparkles className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Click to add AI edit points</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={selectedTool === "pen" ? "default" : "ghost"}
                                  size="icon"
                                  onClick={() => setSelectedTool("pen")}
                                  className="h-8 w-8 rounded-full"
                                >
                                  <Pen className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Draw annotations</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={selectedTool === "text" ? "default" : "ghost"}
                                  size="icon"
                                  onClick={() => setSelectedTool("text")}
                                  className="h-8 w-8 rounded-full"
                                >
                                  <Type className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Add text labels</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={selectedTool === "arrow" ? "default" : "ghost"}
                                  size="icon"
                                  onClick={() => setSelectedTool("arrow")}
                                  className="h-8 w-8 rounded-full"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Draw arrows</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={selectedTool === "circle" ? "default" : "ghost"}
                                  size="icon"
                                  onClick={() => setSelectedTool("circle")}
                                  className="h-8 w-8 rounded-full"
                                >
                                  <Circle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Draw circles</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={selectedTool === "square" ? "default" : "ghost"}
                                  size="icon"
                                  onClick={() => setSelectedTool("square")}
                                  className="h-8 w-8 rounded-full"
                                >
                                  <Square className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Draw rectangles</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Separator */}
                        <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

                        {/* Color Picker */}
                        <div className="flex items-center gap-2 px-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <Palette className="h-4 w-4" />
                                  </Button>
                                  <input
                                    type="color"
                                    value={drawColor}
                                    onChange={(e) => setDrawColor(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Pick color</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div
                            className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600"
                            style={{ backgroundColor: drawColor }}
                          />
                        </div>

                        {/* Separator */}
                        <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

                        {/* Undo */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUndo()}
                                className="h-8 w-8 rounded-full"
                                disabled={annotations.length === 0}
                              >
                                <Undo className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Undo last annotation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full shadow-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-sm text-slate-600 dark:text-slate-400 px-2">
                          {annotations.length} edit
                          {annotations.length !== 1 ? "s" : ""}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Clear all canvas drawings
                            clearAllCanvases();

                            // Clear all annotations and reset states
                            setIsVisualEditMode(false);
                            setAnnotations([]);
                            setSelectedAnnotation(null);
                            setSelectedTool("pointer");
                            setIsDrawing(false);
                            setCurrentDrawing([]);
                            setDrawStartPoint(null);
                          }}
                          className="rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                          <span className="ml-1">Cancel</span>
                        </Button>
                        <Button
                          onClick={handleImplementVisualEdits}
                          disabled={annotations.length === 0}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Apply Edits
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Zoom Controls */}
                  {!isVisualEditMode && (
                    <div className="flex items-center gap-1 px-3 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                        className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12 text-center">
                        {zoomLevel}%
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                        className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div
                  className="min-h-full flex items-center justify-center p-3 sm:p-8"
                  style={{
                    transform: `scale(${zoomLevel / 100}) translate(${viewPosition.x}px, ${viewPosition.y}px)`,
                    transformOrigin: "center",
                    transition: isDragging ? "none" : "transform 0.2s ease-out",
                  }}
                >
                  <div ref={imagesGridRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 w-full max-w-6xl">
                    <div className="text-center" data-view="front">
                      <h3 className="text-[11px] sm:text-sm font-medium mb-2 sm:mb-3 text-[#1C1917] uppercase tracking-wider">
                        Front View
                      </h3>
                      <div className="relative group">
                        <div
                          className={cn(
                            "relative w-full max-w-[320px] sm:max-w-md mx-auto aspect-square transition-transform select-none",
                            !isVisualEditMode && "cursor-pointer hover:scale-105"
                          )}
                          style={{
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            MozUserSelect: "none",
                            msUserSelect: "none",
                          }}
                          onClick={() => {
                            if (!isVisualEditMode) {
                              const view = currentViews.front;
                              let src = "";

                              if (typeof view === "string" && view && view !== "") {
                                src = view;
                              } else if (view && typeof view === "object" && (view as any).url) {
                                src = (view as any).url;
                              }

                              if (src && src !== "") {
                                setViewerImage({ src, title: "Front View" });
                              }
                            }
                          }}
                        >
                          <Image
                            src={getDisplayImageUrl(currentViews.front, productId)}
                            alt="Front view"
                            fill
                            className={cn(
                              "rounded-lg sm:rounded-xl shadow-md sm:shadow-2xl ring-1 ring-border/10 object-contain bg-white",
                              loadingViews.front &&
                                (!currentViews.front || currentViews.front === "") &&
                                "blur-sm opacity-60 transition-all duration-300"
                            )}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                            unoptimized
                            crossOrigin="anonymous"
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                          />
                          <LoadingSkeleton
                            view="front"
                            isLoading={loadingViews.front}
                            message={
                              isInitialGeneration
                                ? undefined // Use default message from component
                                : "Applying your edits..."
                            }
                          />

                          {/* Canvas overlay for drawing - front view */}
                          <canvas
                            ref={frontCanvasRef}
                            className={cn(
                              "absolute inset-0 z-20",
                              isVisualEditMode && selectedTool === "text" ? "cursor-text" : ""
                            )}
                            style={{
                              width: "100%",
                              height: "100%",
                              pointerEvents: isVisualEditMode ? "auto" : "none",
                              cursor:
                                isVisualEditMode && selectedTool === "pen"
                                  ? penCursor
                                  : isVisualEditMode &&
                                    (selectedTool === "circle" || selectedTool === "square" || selectedTool === "arrow")
                                  ? "crosshair"
                                  : isVisualEditMode && selectedTool === "pointer"
                                  ? "crosshair"
                                  : undefined,
                            }}
                            onMouseDown={(e) => {
                              if (isVisualEditMode) {
                                handleAnnotationMouseDown(e as any, "front");
                              }
                            }}
                            onMouseMove={(e) => {
                              if (isVisualEditMode) {
                                handleAnnotationMouseMove(e as any, "front");
                              }
                            }}
                            onMouseUp={(e) => {
                              if (isVisualEditMode) {
                                handleAnnotationMouseUp(e as any, "front");
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isVisualEditMode && isDrawing) {
                                handleAnnotationMouseUp(e as any, "front");
                              }
                            }}
                          />

                          {/* Annotation overlay for front view (text, points, etc) */}
                          {isVisualEditMode &&
                            annotations
                              .filter((a) => a.viewType === "front" && (a.type === "text" || a.type === "point"))
                              .map((annotation) => renderAnnotation(annotation))}
                        </div>
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                      </div>
                    </div>

                    <div className="text-center" data-view="back">
                      <h3 className="text-[11px] sm:text-sm font-medium mb-2 sm:mb-3 text-[#1C1917] uppercase tracking-wider">
                        Back View
                      </h3>
                      <div className="relative group">
                        <div
                          className={cn(
                            "relative w-full max-w-[320px] sm:max-w-md mx-auto aspect-square transition-transform select-none",
                            !isVisualEditMode && "cursor-pointer hover:scale-105"
                          )}
                          style={{
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            MozUserSelect: "none",
                            msUserSelect: "none",
                          }}
                          onClick={() => {
                            if (!isVisualEditMode) {
                              const view = currentViews.back;
                              let src = "";

                              if (typeof view === "string" && view && view !== "") {
                                src = view;
                              } else if (view && typeof view === "object" && (view as any).url) {
                                src = (view as any).url;
                              }

                              if (src && src !== "") {
                                setViewerImage({ src, title: "Back View" });
                              }
                            }
                          }}
                        >
                          <Image
                            src={getDisplayImageUrl(currentViews.back, productId)}
                            alt="Back view"
                            fill
                            className={cn(
                              "rounded-lg sm:rounded-xl shadow-md sm:shadow-2xl ring-1 ring-border/10 object-contain bg-white",
                              loadingViews.back &&
                                (!currentViews.back || currentViews.back === "") &&
                                "blur-sm opacity-60 transition-all duration-300"
                            )}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                            unoptimized
                            crossOrigin="anonymous"
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                          />
                          <LoadingSkeleton
                            view="back"
                            isLoading={loadingViews.back}
                            message={
                              isInitialGeneration
                                ? undefined // Use default message from component
                                : "Applying your edits..."
                            }
                          />

                          {/* Canvas overlay for drawing - back view */}
                          <canvas
                            ref={backCanvasRef}
                            className={cn(
                              "absolute inset-0 z-20",
                              isVisualEditMode && selectedTool === "text" ? "cursor-text" : ""
                            )}
                            style={{
                              width: "100%",
                              height: "100%",
                              pointerEvents: isVisualEditMode ? "auto" : "none",
                              cursor:
                                isVisualEditMode && selectedTool === "pen"
                                  ? penCursor
                                  : isVisualEditMode &&
                                    (selectedTool === "circle" || selectedTool === "square" || selectedTool === "arrow")
                                  ? "crosshair"
                                  : isVisualEditMode && selectedTool === "pointer"
                                  ? "crosshair"
                                  : undefined,
                            }}
                            onMouseDown={(e) => {
                              if (isVisualEditMode) {
                                handleAnnotationMouseDown(e as any, "back");
                              }
                            }}
                            onMouseMove={(e) => {
                              if (isVisualEditMode) {
                                handleAnnotationMouseMove(e as any, "back");
                              }
                            }}
                            onMouseUp={(e) => {
                              if (isVisualEditMode) {
                                handleAnnotationMouseUp(e as any, "back");
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isVisualEditMode && isDrawing) {
                                handleAnnotationMouseUp(e as any, "back");
                              }
                            }}
                          />

                          {/* Annotation overlay for back view (text, points, etc) */}
                          {isVisualEditMode &&
                            annotations
                              .filter((a) => a.viewType === "back" && (a.type === "text" || a.type === "point"))
                              .map((annotation) => renderAnnotation(annotation))}
                        </div>
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                      </div>
                    </div>

                    <div className="text-center" data-view="side">
                      <h3 className="text-[11px] sm:text-sm font-medium mb-2 sm:mb-3 text-[#1C1917] uppercase tracking-wider">
                        Side View
                      </h3>
                      <div className="relative group">
                        <div
                          className={cn(
                            "relative w-full max-w-[320px] sm:max-w-md mx-auto aspect-square transition-transform select-none",
                            !isVisualEditMode && "cursor-pointer hover:scale-105"
                          )}
                          style={{
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            MozUserSelect: "none",
                            msUserSelect: "none",
                          }}
                          onClick={() => {
                            if (!isVisualEditMode) {
                              const view = currentViews.side;
                              let src = "";

                              if (typeof view === "string" && view && view !== "") {
                                src = view;
                              } else if (view && typeof view === "object" && (view as any).url) {
                                src = (view as any).url;
                              }

                              if (src && src !== "") {
                                setViewerImage({ src, title: "Side View" });
                              }
                            }
                          }}
                        >
                          <Image
                            src={getDisplayImageUrl(currentViews.side, productId)}
                            alt="Side view"
                            fill
                            className={cn(
                              "rounded-lg sm:rounded-xl shadow-md sm:shadow-2xl ring-1 ring-border/10 object-contain bg-white",
                              loadingViews.side &&
                                (!currentViews.side || currentViews.side === "") &&
                                "blur-sm opacity-60 transition-all duration-300"
                            )}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                            unoptimized
                            crossOrigin="anonymous"
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                          />
                          <LoadingSkeleton
                            view="side"
                            isLoading={loadingViews.side}
                            message={
                              isInitialGeneration
                                ? undefined // Use default message from component
                                : "Applying your edits..."
                            }
                          />

                          {/* Canvas overlay for drawing - side view */}
                          <canvas
                            ref={sideCanvasRef}
                            className={cn(
                              "absolute inset-0 z-20",
                              isVisualEditMode && selectedTool === "text" ? "cursor-text" : ""
                            )}
                            style={{
                              width: "100%",
                              height: "100%",
                              pointerEvents: isVisualEditMode ? "auto" : "none",
                              cursor:
                                isVisualEditMode && selectedTool === "pen"
                                  ? penCursor
                                  : isVisualEditMode &&
                                    (selectedTool === "circle" || selectedTool === "square" || selectedTool === "arrow")
                                  ? "crosshair"
                                  : isVisualEditMode && selectedTool === "pointer"
                                  ? "crosshair"
                                  : undefined,
                            }}
                            onMouseDown={(e) => {
                              if (isVisualEditMode) {
                                handleAnnotationMouseDown(e as any, "side");
                              }
                            }}
                            onMouseMove={(e) => {
                              if (isVisualEditMode) {
                                handleAnnotationMouseMove(e as any, "side");
                              }
                            }}
                            onMouseUp={(e) => {
                              if (isVisualEditMode) {
                                handleAnnotationMouseUp(e as any, "side");
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isVisualEditMode && isDrawing) {
                                handleAnnotationMouseUp(e as any, "side");
                              }
                            }}
                          />

                          {/* Annotation overlay for side view (text, points, etc) */}
                          {isVisualEditMode &&
                            annotations
                              .filter((a) => a.viewType === "side" && (a.type === "text" || a.type === "point"))
                              .map((annotation) => renderAnnotation(annotation))}
                        </div>
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile zoom indicator */}
                <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/80 backdrop-blur rounded-full text-[10px] font-medium">
                  Zoom: {zoomLevel}%
                </div>

                {/* Desktop zoom indicator */}
                {zoomLevel !== 75 && (
                  <div className="hidden sm:block absolute bottom-4 left-4 px-3 py-1 bg-background/90 backdrop-blur rounded-full text-xs font-medium">
                    {zoomLevel > 100 && <Move className="h-3 w-3 inline mr-1" />}
                    Zoom: {zoomLevel}%
                  </div>
                )}
              </div>

              {/* Edit Controls */}
              <div className="hidden sm:block p-4 border-t bg-background">
                <div className="space-y-3">
                  {/* Quick Suggestions - Hidden on large desktop where chat panel is shown */}
                  <div className="hidden sm:flex lg:hidden flex-wrap gap-2">
                    {editSuggestions.slice(0, 4).map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-zinc-900-foreground"
                        onClick={() => setEditPrompt(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>

                  {/* Edit Input - Hidden on desktop where chat panel is shown */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 lg:hidden">
                    <Textarea
                      placeholder="Describe what you want to change..."
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="flex-1 min-h-[56px] sm:min-h-[60px] max-h-[80px] sm:max-h-[100px] text-sm sm:text-base resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          handleAIEdit();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAIEdit}
                      disabled={!editPrompt.trim() || isEditing}
                      className="w-full sm:w-auto h-12 sm:h-11 px-5 sm:px-6"
                      size="default"
                    >
                      {isEditing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-1.5 sm:mr-2" />
                          <span className="text-sm sm:text-base">Apply</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="hidden sm:block text-xs text-[#1C1917]">
                    AI will analyze your product and apply changes consistently across all views
                  </p>
                </div>
              </div>
            </div>

            {/* History Sidebar */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 320,
                    opacity: 1,
                  }}
                  exit={{ width: 0, opacity: 0 }}
                  className="absolute sm:relative top-0 right-0 h-full sm:border-l bg-background sm:bg-muted/10 z-50 sm:z-auto w-full sm:w-80"
                >
                  <div
                    className="w-full sm:w-80 h-full flex flex-col relative"
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Header - Fixed */}
                    <div
                      className="p-3 sm:p-4 border-b flex-shrink-0 bg-background sm:bg-transparent"
                      style={{ flexShrink: 0 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="sm:hidden h-8 w-8 -ml-1"
                          onClick={() => setShowHistory(false)}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2 flex-1">
                          <Clock className="h-4 w-4" />
                          <h3 className="font-semibold">Revision History</h3>
                        </div>
                      </div>
                      <p className="text-sm text-[#1C1917] ml-9 sm:ml-0">{revisions.length} revisions (all views)</p>
                    </div>

                    {/* Scrollable Content - Takes remaining space */}
                    <div className="flex-1 overflow-hidden" style={{ minHeight: 0, flex: "1 1 auto" }}>
                      <ScrollArea className="h-full w-full">
                        <div className="p-3 sm:p-4 space-y-3 pb-2">
                          {/* Removed duplicate revision skeleton - using only one below */}

                          {/* Show placeholder card during initial generation when not actively editing */}
                          {isInitialGeneration && revisions.length === 0 && !isEditing && (
                            <Card className="cursor-not-allowed transition-all animate-pulse border-primary/30 bg-primary/5">
                              <CardContent className="p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="animate-pulse">
                                    Generating...
                                  </Badge>
                                  <Sparkles className="h-3 w-3 text-zinc-900 animate-spin" />
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                  {["front", "back", "side"].map((view) => (
                                    <div
                                      key={view}
                                      className="relative w-full h-20 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden animate-pulse"
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                                        <span className="text-xs text-white font-medium capitalize">{view}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-[#1C1917]">
                                  Creating your initial product visualizations...
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Show revision skeleton when creating a new revision or initial generation */}
                          {isEditing && (
                            <RevisionSkeleton
                              isCreating={true}
                              revisionNumber={revisions.length > 0 ? revisions.length : 0}
                              message={
                                revisions.length === 0 && isInitialGeneration
                                  ? "Creating your initial product visualizations..."
                                  : "Applying your edits to all views..."
                              }
                              isInitialGeneration={revisions.length === 0 && isInitialGeneration}
                            />
                          )}

                          {revisions
                            .slice()
                            .sort((a, b) => {
                              // Always put Original (revision 0) at the bottom
                              if (a.revisionNumber === 0) return 1;
                              if (b.revisionNumber === 0) return -1;
                              // Sort others by createdAt descending (newest first)
                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            })
                            .map((revision) => (
                              <Card
                                key={revision.id}
                                className={cn(
                                  "cursor-pointer transition-all hover:shadow-md",
                                  revision.isActive && "ring-2 ring-primary"
                                )}
                                onClick={() => handleRevisionRollback(revision)}
                              >
                                <TooltipProvider>
                                  <CardContent className="p-3">
                                    {/* Thumbnail Grid */}
                                    <div className="grid grid-cols-3 gap-1 mb-3">
                                      {revision.views.front && (
                                        <div className="relative w-full h-20 bg-gray-100 rounded overflow-hidden">
                                          <Image
                                            src={
                                              revision.views.front.thumbnailUrl || revision.views.front.imageUrl || ""
                                            }
                                            alt="Front"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            unoptimized
                                            onLoad={() => {
                                              if (pendingRevision && pendingRevision.id === revision.id) {
                                                console.log("Front image loaded for pending revision");
                                                setRevisionImagesLoaded((prev) => prev + 1);
                                              }
                                            }}
                                            onError={() => {
                                              // Don't set a fallback image, let it remain broken
                                              console.error("Failed to load revision image");
                                              // Count as loaded even on error to prevent infinite waiting
                                              if (pendingRevision && pendingRevision.id === revision.id) {
                                                setRevisionImagesLoaded((prev) => prev + 1);
                                              }
                                            }}
                                          />
                                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                                            <span className="text-xs text-white font-medium">Front</span>
                                          </div>
                                        </div>
                                      )}
                                      {revision.views.back && (
                                        <div className="relative w-full h-20 bg-gray-100 rounded overflow-hidden">
                                          <Image
                                            src={revision.views.back.thumbnailUrl || revision.views.back.imageUrl || ""}
                                            alt="Back"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            unoptimized
                                            onLoad={() => {
                                              if (pendingRevision && pendingRevision.id === revision.id) {
                                                console.log("Back image loaded for pending revision");
                                                setRevisionImagesLoaded((prev) => prev + 1);
                                              }
                                            }}
                                            onError={() => {
                                              // Don't set a fallback image, let it remain broken
                                              console.error("Failed to load revision image");
                                              // Count as loaded even on error to prevent infinite waiting
                                              if (pendingRevision && pendingRevision.id === revision.id) {
                                                setRevisionImagesLoaded((prev) => prev + 1);
                                              }
                                            }}
                                          />
                                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                                            <span className="text-xs text-white font-medium">Back</span>
                                          </div>
                                        </div>
                                      )}
                                      {revision.views.side && (
                                        <div className="relative w-full h-20 bg-gray-100 rounded overflow-hidden">
                                          <Image
                                            src={revision.views.side.thumbnailUrl || revision.views.side.imageUrl || ""}
                                            alt="Side"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            unoptimized
                                            onLoad={() => {
                                              if (pendingRevision && pendingRevision.id === revision.id) {
                                                console.log("Side image loaded for pending revision");
                                                setRevisionImagesLoaded((prev) => prev + 1);
                                              }
                                            }}
                                            onError={() => {
                                              // Don't set a fallback image, let it remain broken
                                              console.error("Failed to load revision image");
                                              // Count as loaded even on error to prevent infinite waiting
                                              if (pendingRevision && pendingRevision.id === revision.id) {
                                                setRevisionImagesLoaded((prev) => prev + 1);
                                              }
                                            }}
                                          />
                                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                                            <span className="text-xs text-white font-medium">Side</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Revision Info */}
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Badge variant={revision.isActive ? "default" : "secondary"}>
                                          {revision.revisionNumber === 0 ? "Original" : `#${revision.revisionNumber}`}
                                        </Badge>
                                        {revision.revisionNumber === 0 && (
                                          <Badge variant="outline" className="text-xs">
                                            Generated
                                          </Badge>
                                        )}
                                        {revision.editType === "ai_edit" && (
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <Sparkles className="h-3 w-3 text-zinc-900" />
                                            </TooltipTrigger>
                                            <TooltipContent>AI-Generated Edit</TooltipContent>
                                          </Tooltip>
                                        )}
                                        <div className="ml-auto flex items-center gap-1">
                                          {revision.isActive && (
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <Check className="h-3 w-3 text-zinc-900" />
                                              </TooltipTrigger>
                                              <TooltipContent>Active Revision</TooltipContent>
                                            </Tooltip>
                                          )}
                                          {!revision.isActive && revision.revisionNumber !== 0 && onDeleteRevision && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                                                  onClick={(e) => handleDeleteRevision(revision, e)}
                                                  disabled={deletingRevisionId === revision.id}
                                                >
                                                  {deletingRevisionId === revision.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                  ) : (
                                                    <Trash2 className="h-3 w-3" />
                                                  )}
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Delete Revision</TooltipContent>
                                            </Tooltip>
                                          )}
                                        </div>
                                      </div>
                                      {revision.editPrompt && (
                                        <p className="text-xs text-[#1C1917] line-clamp-2">
                                          {formatTextWithUrls(revision.editPrompt)}
                                        </p>
                                      )}
                                      <p className="text-xs text-[#1C1917]">
                                        {new Date(revision.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </CardContent>
                                </TooltipProvider>
                              </Card>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Footer Actions - Fixed */}
                    <div
                      className="hidden sm:block p-3 sm:p-4 border-t flex-shrink-0 bg-background"
                      style={{ flexShrink: 0 }}
                    >
                      <Button onClick={handleSave} className="w-full" size="default" disabled={isGeneratingTechPack}>
                        {isGeneratingTechPack ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Tech Pack...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Tech Pack
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Fixed Footer with Save Button Only */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t-2 z-50 shadow-2xl">
            <div className="p-4">
              {/* Save Button */}
              <Button
                onClick={handleSave}
                className="w-full h-12 text-base font-medium"
                size="default"
                disabled={isGeneratingTechPack}
              >
                {isGeneratingTechPack ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Tech Pack...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Tech Pack
                  </>
                )}
              </Button>
              <div className="pb-safe min-h-[8px]" />
            </div>
          </div>
        </TooltipProvider>

        {/* Mobile Chat Panel - Slide-over */}
        <AnimatePresence>
          {showMobileChat && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-background border-r shadow-xl z-50"
            >
              <div className="h-full flex flex-col">
                {/* Mobile Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">AI Assistant</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowMobileChat(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Chat Panel */}
                <AIChatPanel
                  messages={chatMessages}
                  onSendMessage={handleChatMessage}
                  isProcessing={isEditing}
                  currentView={currentProcessingView}
                  className="flex-1"
                  onImageClick={(src, title) => setViewerImage({ src, title })}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Chat Overlay */}
        {showMobileChat && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowMobileChat(false)} />
        )}

        {/* Image Viewer Modal */}
        {viewerImage && (
          <div
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={() => setViewerImage(null)}
          >
            <div className="relative max-w-[90vw] max-h-[90vh]">
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewerImage(null);
                }}
                className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-8 w-8" />
              </button>

              {/* Title */}
              <h3 className="absolute -top-12 left-0 text-white text-lg font-medium">{viewerImage.title}</h3>

              {/* Image */}
              <img
                src={viewerImage.src}
                alt={viewerImage.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
