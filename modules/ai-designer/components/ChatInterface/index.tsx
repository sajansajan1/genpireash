/**
 * ChatInterface component for AI chat interactions
 * Premium enterprise-grade design - Redesigned
 */

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  MessageCircle,
  ArrowUp,
  FileText,
  Bot,
  Sparkles,
  User,
  Lightbulb,
  Palette,
  Ruler,
  Zap,
  ImagePlus,
  X,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore, type WorkflowMode } from "../../store/editorStore";
import { useChatMessages, type TechPackStateInfo } from "../../hooks/useChatMessages";
export type { TechPackStateInfo };
import { SystemMessage } from "../SystemMessage";
import { MarkdownMessage } from "./MarkdownMessage";
import type { ChatMessage } from "../../types";
import { getSuggestionsForMode, getPlaceholderForMode } from "../../config/tabSuggestions";
import { uploadChatImage } from "@/app/actions/chat-image-upload";
import { saveChatUploadedImageToMetadata } from "@/app/actions/save-chat-uploaded-image";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/lib/zustand/useStore";
import { ImageToolDialog, type ImageToolSelection, enhancePromptWithTool } from "./ImageToolDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useImageViewerStore } from "../../store/imageViewerStore";
import { ViewSelector, type ViewSelection } from "./ViewSelector";
import { useSingleViewRegeneration } from "../../hooks/useSingleViewRegeneration";
import type { ViewType } from "../../types/editor.types";

// 50 Real facts about tech packs, manufacturing, and product design
const aiThinkingContent = [
  // Tech Pack Fundamentals
  {
    icon: FileText,
    text: "Tech packs reduce manufacturing errors by up to 70% through detailed specifications",
    color: "text-blue-600",
  },
  {
    icon: Lightbulb,
    text: "A complete tech pack typically includes 15-25 pages of specifications and drawings",
    color: "text-amber-600",
  },
  {
    icon: Ruler,
    text: "Precise measurements in tech packs prevent costly sample revisions",
    color: "text-indigo-600",
  },
  {
    icon: Zap,
    text: "Tech packs can reduce production timeline by 30-40% with clear documentation",
    color: "text-emerald-600",
  },
  {
    icon: FileText,
    text: "Professional tech packs include BOM, grading rules, and construction details",
    color: "text-purple-600",
  },

  // Manufacturing Insights
  {
    icon: Sparkles,
    text: "Chinese factories typically require 30-45 days lead time for first samples",
    color: "text-rose-600",
  },
  {
    icon: Lightbulb,
    text: "MOQ (Minimum Order Quantity) usually ranges from 500-1000 units for apparel",
    color: "text-teal-600",
  },
  {
    icon: Ruler,
    text: "Sample costs typically range from $50-$500 depending on product complexity",
    color: "text-blue-600",
  },
  {
    icon: Zap,
    text: "Production costs decrease by 20-30% when ordering 1000+ units vs 500 units",
    color: "text-amber-600",
  },
  {
    icon: FileText,
    text: "Pre-production samples prevent 85% of quality issues in bulk orders",
    color: "text-indigo-600",
  },

  // Materials & Fabrics
  {
    icon: Palette,
    text: "Organic cotton costs 30-40% more than conventional cotton but appeals to eco-conscious buyers",
    color: "text-emerald-600",
  },
  {
    icon: Sparkles,
    text: "Polyester blends reduce shrinkage by 50% compared to 100% cotton fabrics",
    color: "text-purple-600",
  },
  {
    icon: Lightbulb,
    text: "GSM (grams per square meter) determines fabric weight and quality - higher is usually better",
    color: "text-rose-600",
  },
  {
    icon: Palette,
    text: "Pantone color matching reduces color variation to less than 5% across production runs",
    color: "text-teal-600",
  },
  {
    icon: Ruler,
    text: "Fabric shrinkage testing is crucial - most fabrics shrink 3-5% after first wash",
    color: "text-blue-600",
  },

  // Design Best Practices
  {
    icon: Lightbulb,
    text: "Simpler designs with fewer seams reduce manufacturing costs by 15-25%",
    color: "text-amber-600",
  },
  {
    icon: Sparkles,
    text: "Contrast stitching increases production time by 20% but enhances visual appeal",
    color: "text-indigo-600",
  },
  {
    icon: Palette,
    text: "Limiting color variations to 3-4 per design optimizes inventory management",
    color: "text-emerald-600",
  },
  {
    icon: Zap,
    text: "Standard sizing reduces pattern-making costs by 40% compared to custom sizing",
    color: "text-purple-600",
  },
  {
    icon: Ruler,
    text: "Adding pockets increases production cost by approximately $1-3 per unit",
    color: "text-rose-600",
  },

  // Quality Control
  {
    icon: FileText,
    text: "AQL (Acceptable Quality Limit) 2.5 is industry standard for apparel inspection",
    color: "text-teal-600",
  },
  {
    icon: Lightbulb,
    text: "Third-party inspections cost $200-400 but prevent 90% of quality issues",
    color: "text-blue-600",
  },
  {
    icon: Zap,
    text: "Testing garments for colorfastness prevents 60% of customer returns",
    color: "text-amber-600",
  },
  {
    icon: Sparkles,
    text: "Seam strength testing ensures products withstand 2-3 years of regular use",
    color: "text-indigo-600",
  },
  {
    icon: FileText,
    text: "Lab testing for safety compliance (CPSIA, REACH) costs $500-2000 per product",
    color: "text-emerald-600",
  },

  // Cost Optimization
  {
    icon: Ruler,
    text: "Digital printing is cost-effective for orders under 100 units",
    color: "text-purple-600",
  },
  {
    icon: Lightbulb,
    text: "Screen printing becomes cheaper than digital at 200+ units per design",
    color: "text-rose-600",
  },
  {
    icon: Zap,
    text: "Sourcing materials locally can reduce lead time by 50% but may cost 20% more",
    color: "text-teal-600",
  },
  {
    icon: Palette,
    text: "Using standard hardware (zippers, buttons) saves 30-50% vs custom components",
    color: "text-blue-600",
  },
  {
    icon: Sparkles,
    text: "Consolidating multiple styles with one factory reduces setup costs by 25%",
    color: "text-amber-600",
  },

  // Sustainability
  {
    icon: FileText,
    text: "Recycled polyester uses 59% less energy than virgin polyester production",
    color: "text-indigo-600",
  },
  {
    icon: Lightbulb,
    text: "Water-based inks reduce VOC emissions by 95% compared to plastisol inks",
    color: "text-emerald-600",
  },
  {
    icon: Ruler,
    text: "Sustainable certifications (GOTS, OEKO-TEX) add 10-15% to material costs",
    color: "text-purple-600",
  },
  {
    icon: Zap,
    text: "Deadstock fabrics cost 40-60% less and eliminate textile waste",
    color: "text-rose-600",
  },
  {
    icon: Palette,
    text: "Natural dyes fade 30% faster than synthetic but are biodegradable",
    color: "text-teal-600",
  },

  // Production Timelines
  {
    icon: Sparkles,
    text: "Pattern making and grading typically takes 5-10 business days",
    color: "text-blue-600",
  },
  {
    icon: FileText,
    text: "Bulk production for 1000 units usually requires 45-60 days",
    color: "text-amber-600",
  },
  {
    icon: Lightbulb,
    text: "Air shipping takes 3-7 days but costs 5x more than sea freight",
    color: "text-indigo-600",
  },
  {
    icon: Zap,
    text: "Sea freight from Asia takes 30-45 days but reduces shipping costs by 80%",
    color: "text-emerald-600",
  },
  {
    icon: Ruler,
    text: "Rush orders cost 20-40% premium but can reduce timeline by 50%",
    color: "text-purple-600",
  },

  // Industry Statistics
  {
    icon: Palette,
    text: "70% of fashion brands use tech packs to communicate with manufacturers",
    color: "text-rose-600",
  },
  {
    icon: Sparkles,
    text: "Products with detailed tech packs have 85% fewer sample revisions",
    color: "text-teal-600",
  },
  {
    icon: FileText,
    text: "Clear grading specs reduce sizing complaints by 60%",
    color: "text-blue-600",
  },
  {
    icon: Lightbulb,
    text: "Brands that provide detailed tech packs negotiate 15-25% better unit prices",
    color: "text-amber-600",
  },
  {
    icon: Zap,
    text: "90% of successful product launches include at least 2 pre-production samples",
    color: "text-indigo-600",
  },

  // Advanced Tips
  {
    icon: Ruler,
    text: "Including trim cards with physical samples ensures 95% color accuracy",
    color: "text-emerald-600",
  },
  {
    icon: Palette,
    text: "CAD technical drawings are understood by 100% of professional manufacturers",
    color: "text-purple-600",
  },
  {
    icon: Sparkles,
    text: "Specifying stitch types (301, 401, 504) prevents construction errors",
    color: "text-rose-600",
  },
  {
    icon: FileText,
    text: "Detailed packaging specs reduce shipping damage by 40%",
    color: "text-teal-600",
  },
  {
    icon: Lightbulb,
    text: "Including care labels and hangtag specs in tech packs ensures brand compliance",
    color: "text-blue-600",
  },
];

/**
 * Tech pack action handlers for triggering generation from chat
 */
export interface TechPackActionHandlers {
  generateBaseViews?: () => Promise<void>;
  generateCloseUps?: () => Promise<void>;
  generateSketches?: () => Promise<void>;
  generateComponents?: () => Promise<void>;
  generateAll?: () => Promise<void>;
}

/**
 * Generated tech files data for context-aware Q&A
 */
export interface TechFilesData {
  category?: {
    category: string;
    subcategory: string;
    confidence: number;
  };
  baseViews?: Array<{
    viewType: string;
    analysisData: any;
  }>;
  components?: Array<{
    componentName: string;
    componentType: string;
    guide: any;
  }>;
  closeUps?: Array<{
    shotMetadata: { focus_area: string; description: string };
    summary?: any;
  }>;
  sketches?: Array<{
    viewType: string;
    summary?: any;
    measurements?: Record<string, { value: string; unit: string }>;
  }>;
}

interface ChatInterfaceProps {
  productId?: string;
  onSendMessage?: (message: string) => void;
  onEditViews?: (
    currentViews: any,
    prompt: string,
    onProgress?: (view: string, imageUrl: string) => void
  ) => Promise<any>;
  selectedRevision?: any;
  onRevisionSuccess?: () => void;
  className?: string;
  disabled?: boolean;
  disabledMessage?: string;
  placeholderOverride?: string;
  /** Current workflow mode - determines which suggestions to show */
  workflowMode?: WorkflowMode;
  /** Tech pack data for intelligent Q&A responses */
  techPackData?: any;
  /** Generated tech files data (base views, components, close-ups, sketches) for context-aware Q&A */
  techFilesData?: TechFilesData;
  /** Tech pack action handlers for triggering generation from chat */
  techPackActions?: TechPackActionHandlers;
  /** Callback to switch to tech pack tab - called before executing tech pack actions */
  onSwitchToTechPack?: () => void;
  /** Tech pack state info for validation (e.g., whether base views exist) */
  techPackState?: TechPackStateInfo;
}

export function ChatInterface({
  productId,
  onSendMessage,
  onEditViews,
  selectedRevision,
  onRevisionSuccess,
  className,
  disabled = false,
  disabledMessage,
  placeholderOverride,
  workflowMode,
  techPackData,
  techFilesData,
  techPackActions,
  onSwitchToTechPack,
  techPackState,
}: ChatInterfaceProps) {
  // Store hooks - use the chat messages hook for database-synced messages
  const { productName } = useEditorStore();
  const { messages, isProcessing, sendUserMessage } = useChatMessages(
    productId || null,
    productName || "Product",
    onRevisionSuccess,
    techPackData,
    techFilesData,
    workflowMode,
    techPackActions,
    onSwitchToTechPack,
    techPackState
  );
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits } = useGetCreditsStore();
  // Image viewer for opening images in fullscreen modal
  const { openViewer } = useImageViewerStore();
  const credits = getCreatorCredits;
  const { toast } = useToast();
  const { user, supplierProfile, creatorProfile } = useUserStore();

  // Local state - completely independent from store
  const [inputValue, setInputValue] = useState("");
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [selectedView, setSelectedView] = useState<ViewSelection>("all"); // View selection state
  const [uploadedImage, setUploadedImage] = useState<{
    file?: File;
    preview: string;
    url?: string;
    toolSelection?: ImageToolSelection;
    isFromLibrary?: boolean;
  } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);

  // Single view regeneration hook
  const { regenerateView, isRegenerating: isSingleViewRegenerating } = useSingleViewRegeneration({
    productId: productId || null,
    currentRevisionId: selectedRevision?.views?.front?.revisionId || null,
    currentViews: {
      front: selectedRevision?.views?.front?.imageUrl || selectedRevision?.views?.front || "",
      back: selectedRevision?.views?.back?.imageUrl || selectedRevision?.views?.back || "",
      side: selectedRevision?.views?.side?.imageUrl || selectedRevision?.views?.side || "",
      top: selectedRevision?.views?.top?.imageUrl || selectedRevision?.views?.top || "",
      bottom: selectedRevision?.views?.bottom?.imageUrl || selectedRevision?.views?.bottom || "",
    },
    onViewRegenerated: (viewType, newUrl, newRevisionId, newRevisionNumber) => {
      console.log(`[ChatInterface] View regenerated: ${viewType}`);
      // Trigger revision success callback to refresh the UI
      if (onRevisionSuccess) {
        onRevisionSuccess();
      }
    },
    onError: (error) => {
      console.error(`[ChatInterface] Single view regeneration error:`, error);
    },
  });

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cycle through tips while AI is thinking
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % aiThinkingContent.length);
      }, 3000); // Change tip every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  // Handle tool button click - Open dialog first
  const handleToolsClick = () => {
    setIsToolDialogOpen(true);
  };

  // Handle tool selection confirmation - Step 1: User selected tool type and file
  // This is called first by the dialog with the tool selection
  // Note: Selection is now passed directly to handleFileSelected, so this is just for any UI updates if needed
  const handleToolConfirm = (toolSelection: ImageToolSelection) => {
    // Tool selection is now passed directly to handleFileSelected to avoid race conditions
    console.log("[ChatInterface] Tool confirmed:", toolSelection.toolType);
  };

  // Handle file selection - Step 2: User selected file after choosing tool
  // This is called by the dialog with both file AND selection (to avoid race condition)
  const handleFileSelected = async (file: File, toolSelection: ImageToolSelection) => {
    setIsToolDialogOpen(false);

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PNG or JPG image.");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Image size must be less than 5MB.");
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);

    // Use the toolSelection passed directly from dialog (NOT from state - avoids race condition)
    console.log("[ChatInterface] File selected with tool selection:", toolSelection);

    // Combine file with tool selection
    setUploadedImage({
      file,
      preview,
      toolSelection: toolSelection,
    });

    // Upload and optimize using server action
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId || "");
      // Pass toolType so server can use appropriate preset (logo preset preserves PNG transparency)
      if (toolSelection?.toolType) {
        formData.append("toolType", toolSelection.toolType);
      }

      const result = await uploadChatImage(formData);

      if (result.success && result.url) {
        setUploadedImage((prev) => (prev ? { ...prev, url: result.url } : null));

        // Save to product metadata so generation API can access it
        // Use toolSelection passed directly from dialog (NOT pendingToolSelection from state)
        // This ensures the user's explicit selection is saved correctly
        if (productId) {
          console.log("[ChatInterface] Saving to metadata with tool type:", toolSelection.toolType);
          await saveChatUploadedImageToMetadata(productId, result.url, toolSelection);
        }
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image. Please try again.");
      setUploadedImage(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle library image selection - User selected from media library
  const handleLibraryImageSelected = async (imageUrl: string, toolSelection: ImageToolSelection) => {
    setIsToolDialogOpen(false);

    console.log("[ChatInterface] Library image selected with tool selection:", toolSelection);

    // Set uploaded image state - URL is already available, no upload needed
    setUploadedImage({
      preview: imageUrl,
      url: imageUrl,
      toolSelection: toolSelection,
      isFromLibrary: true,
    });

    // Save to product metadata so generation API can access it
    if (productId) {
      console.log("[ChatInterface] Saving library image to metadata with tool type:", toolSelection.toolType);
      await saveChatUploadedImageToMetadata(productId, imageUrl, toolSelection);
    }
  };

  // Handle removing uploaded image
  const handleRemoveImage = () => {
    // Only revoke if it's a blob URL (from file upload), not a library URL
    if (uploadedImage?.preview && !uploadedImage.isFromLibrary) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
  };

  // Handle send message
  const handleSend = async () => {
    const trimmedValue = inputValue.trim();

    // Check credits first
    const currentCredits = credits?.credits || 0;
    const SINGLE_VIEW_COST = 1; // Cost for single view regeneration
    const ALL_VIEWS_COST = 2; // Minimum cost for all views regeneration
    const requiredCredits = selectedView === "all" ? ALL_VIEWS_COST : SINGLE_VIEW_COST;

    if (currentCredits < requiredCredits) {
      // Show toast notification for insufficient credits
      toast({
        title: "Insufficient Credits",
        description: `You need at least ${requiredCredits} ${requiredCredits === 1 ? "credit" : "credits"} to ${selectedView === "all" ? "regenerate all views" : `edit the ${selectedView} view`}. You currently have ${currentCredits} credits. Please upgrade your plan or purchase more credits.`,
      });
      return;
    }

    // Check message limit
    if (messages.length >= 250) {
      // Show a warning message instead of sending
      alert(
        "You've reached the 250 message limit for this product. Please start a new session or product to continue."
      );
      return;
    }

    // Don't send if still uploading image
    if (isUploadingImage) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    if ((trimmedValue || uploadedImage) && !isProcessing && !isSingleViewRegenerating) {
      // Build message with optional image and tool enhancement
      let messageToSend = trimmedValue;
      if (uploadedImage?.url && uploadedImage.toolSelection) {
        // Enhance prompt based on tool type
        messageToSend = enhancePromptWithTool(trimmedValue, uploadedImage.toolSelection);
      } else if (uploadedImage?.url) {
        // Fallback if no tool selection
        messageToSend = trimmedValue || "Please analyze this image and apply it to the design.";
      }

      // ROUTING: Choose between single view regeneration or all views regeneration
      if (selectedView !== "all") {
        // SINGLE VIEW REGENERATION FLOW
        console.log(`[ChatInterface] Using single view regeneration for ${selectedView} view`);

        const result = await regenerateView(selectedView as ViewType, messageToSend);

        if (result.success) {
          // Clear input and image after successful regeneration
          setInputValue("");
          handleRemoveImage();
          textareaRef.current?.focus();
          // Reset to "all views" after successful single view regeneration
          setSelectedView("all");
        }
        // Error handling is done in the hook (toast notifications)
      } else {
        // ALL VIEWS REGENERATION FLOW (existing flow)
        console.log(`[ChatInterface] Using all views regeneration flow`);

        // Use the complete flow from useChatMessages hook
        if (productId && sendUserMessage) {
          // Pass image URL to sendUserMessage
          await sendUserMessage(messageToSend, onEditViews, selectedRevision, uploadedImage?.url);
        } else if (onSendMessage) {
          // Fallback to the original callback if no productId
          onSendMessage(messageToSend);
        }

        // Clear input and image after sending
        setInputValue("");
        handleRemoveImage();
        textareaRef.current?.focus();
      }
    }
  };

  // Handle tech pack generation (currently unused but kept for future use)
  // const handleGenerateTechPack = async () => {
  //   if (!onGenerateTechPack) return;
  //   setIsGeneratingTechPack(true);
  //   try {
  //     onGenerateTechPack();
  //   } finally {
  //     setIsGeneratingTechPack(false);
  //   }
  // };

  // Get message styling
  const getMessageStyle = (message: ChatMessage, isUser: boolean) => {
    if (isUser) {
      return "bg-white text-gray-900 shadow-sm border border-gray-100";
    }

    switch (message.message_type) {
      case "ai":
        return "bg-gray-50 text-gray-800 border border-gray-100";
      case "system":
        // Check for different system message types
        if (message.metadata?.isIntentDetection) {
          return "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs border border-emerald-100/50";
        }
        if (message.metadata?.isContextSummary) {
          return "bg-amber-50/50 text-amber-700 text-xs border border-amber-100/50";
        }
        return "bg-gray-100/50 text-gray-600 text-sm border border-gray-100";
      case "success":
        return "bg-green-50/50 text-green-700 border border-green-100/50";
      case "error":
        return "bg-red-50 text-red-700 border border-red-100";
      case "processing":
        return "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100/50";
      case "image-ready":
        return "bg-purple-50 text-purple-700 border border-purple-100";
      default:
        return "bg-gray-50 text-gray-800 border border-gray-100";
    }
  };

  // Format message content to shorten URLs
  const formatMessageContent = (content: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return content.replace(urlRegex, (url) => {
      // If URL is short enough, don't modify it
      if (url.length <= 20) {
        return url;
      }

      // Extract the first 10 chars and last 7 chars
      const firstPart = url.substring(0, 10);
      const lastPart = url.substring(url.length - 7);

      return `${firstPart}...${lastPart}`;
    });
  };

  // Format time helper - show relative time
  const formatTime = (date: Date | string | undefined | null) => {
    if (!date) {
      return "";
    }

    try {
      const messageDate = date instanceof Date ? date : new Date(date);

      // Check if date is valid
      if (isNaN(messageDate.getTime())) {
        console.warn("Invalid date:", date);
        return "";
      }

      // Calculate relative time
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return "just now";
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
      }

      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
      }

      const diffInYears = Math.floor(diffInMonths / 12);
      return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
    } catch (error) {
      console.error("Error formatting time:", error, date);
      return "just now";
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-gradient-to-b from-gray-50/80 to-white overflow-hidden", className)}>
        {/* Header */}
        <div className="px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Genpire Logo */}
            <div className="w-6 h-6 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              <img src="/favicon.png" alt="Genpire Logo" className="w-5 h-5 object-contain" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-900">Genpire AI Assistant</h3>
              <span className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200/50 px-1 py-0 rounded-full text-[10px] font-medium inline-flex items-center scale-50 origin-left">
                Powered by AI
              </span>
            </div>
          </div>
          <div className="mt-2 pl-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {productName && (
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-gray-700 font-medium truncate max-w-[200px]">{productName}</span>
                </div>
              )}
              {/* Message Counter */}
              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                <MessageCircle className="h-3 w-3 text-gray-400" />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    messages.length >= 250
                      ? "text-red-600"
                      : messages.length >= 200
                      ? "text-orange-600"
                      : "text-gray-600"
                  )}
                >
                  {messages.length}/250
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
          ref={scrollAreaRef as any}
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h4 className="text-base font-semibold text-gray-900 mb-2">Start a Conversation</h4>
              <p className="text-xs text-gray-500 max-w-[250px]">
                Describe how you want to modify your product design. I'll help bring your vision to life.
              </p>
            </div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isUser = message.message_type === "user";
              const isSystemMessage =
                message.message_type === "system" ||
                message.message_type === "processing" ||
                message.message_type === "success" ||
                message.message_type === "error" ||
                message.message_type === "image-ready";
              const showAvatar =
                !isUser && !isSystemMessage && (index === 0 || messages[index - 1]?.message_type === "user");

              // Use SystemMessage component for system messages
              if (isSystemMessage) {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mb-2"
                  >
                    <SystemMessage message={message} />
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn("mb-4 flex items-end gap-2", isUser ? "justify-end" : "justify-start")}
                >
                  {/* AI Avatar */}
                  {!isUser && showAvatar && (
                    <Avatar className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-white shadow-lg">
                      <AvatarImage src="/favicon.png" />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isUser && !isSystemMessage && !showAvatar && <div className="w-7" />}

                  {/* Message Content */}
                  <div className={cn("max-w-[75%] group", isUser && "items-end")}>
                    <div
                      className={cn(
                        "px-4 py-3 rounded-2xl relative",
                        isUser ? "rounded-tr-md" : "rounded-tl-md",
                        getMessageStyle(message, isUser)
                      )}
                    >
                      {/* Message Text */}
                      <MarkdownMessage
                        content={formatMessageContent(message.content)}
                        className="text-xs leading-relaxed"
                      />

                      {/* Image - Show for screenshots and generated views */}
                      {message.metadata?.imageUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          {message.metadata?.isViewGeneration ? (
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <div className="text-xs text-gray-500 mb-1 font-medium">
                                {message.metadata?.viewType
                                  ? `${
                                      message.metadata?.viewType.charAt(0).toUpperCase() +
                                      message.metadata?.viewType.slice(1)
                                    } View`
                                  : "Generated View"}
                              </div>
                              <img
                                src={message.metadata?.imageUrl}
                                alt={`${message.metadata?.viewType || "Generated"} view`}
                                className="w-full h-auto rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => openViewer({
                                  url: message.metadata?.imageUrl || "",
                                  title: message.metadata?.viewType
                                    ? `${message.metadata?.viewType.charAt(0).toUpperCase() + message.metadata?.viewType.slice(1)} View`
                                    : "Generated View",
                                  description: message.metadata?.isVirtualTryOn
                                    ? "Virtual Try-On Result"
                                    : "Click to view in fullscreen",
                                })}
                              />
                            </div>
                          ) : (
                            <img
                              src={message.metadata?.imageUrl}
                              alt={message.metadata?.isVirtualTryOn ? "Virtual Try-On" : "Design"}
                              className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity rounded"
                              onClick={() => openViewer({
                                url: message.metadata?.imageUrl || "",
                                title: message.metadata?.isVirtualTryOn
                                  ? "Virtual Try-On Result"
                                  : message.metadata?.isUserUpload
                                    ? "Uploaded Image"
                                    : "Design",
                                description: message.metadata?.isVirtualTryOn
                                  ? "Your product shown on the model"
                                  : "Click to view in fullscreen",
                              })}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div
                      className={cn("text-gray-300 mt-0.5 px-1", isUser ? "text-right" : "text-left")}
                      style={{ fontSize: "10px", lineHeight: "1" }}
                    >
                      {formatTime(message.created_at)}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <Avatar className="h-7 w-7 bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-white shadow-lg">
                      {(supplierProfile?.company_logo || creatorProfile?.avatar_url) && (
                        <AvatarImage
                          src={supplierProfile?.company_logo || creatorProfile?.avatar_url || undefined}
                          alt={user?.full_name || user?.email || "User"}
                        />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white text-xs font-medium">
                        {user?.full_name ? (
                          user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        ) : user?.email ? (
                          user.email.slice(0, 2).toUpperCase()
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Enhanced Typing Indicator with Tips - HIDDEN per user request */}
          {/* {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 mb-4"
          >
            <Avatar className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-white shadow-lg">
              <AvatarImage src="/favicon.png" />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 max-w-[75%]">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                  <span className="text-xs font-medium text-gray-700">
                    AI is analyzing your request...
                  </span>
                </div>
                <div className="flex gap-1">
                  <motion.span
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )} */}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          {/* Warning Message for Limit Reached */}
          {messages.length >= 250 && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 font-medium">
                Message limit reached (250 messages). Please start a new product session.
              </p>
            </div>
          )}

          {/* Image Preview */}
          {uploadedImage && (
            <div className="mb-3">
              <div className="relative inline-block">
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                  <img src={uploadedImage.preview} alt="Upload preview" className="h-20 w-20 object-contain" />
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                  disabled={isUploadingImage}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {isUploadingImage ? "Optimizing image..." : "Image ready to send"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {/* Quick-Suggested Cards - AI Editing Hints */}
            <div className="rounded-xl p-1">
              <div
                className="flex space-x-2 overflow-x-auto scrollbar-hide cursor-grab"
                onMouseDown={(e) => {
                  const el = e.currentTarget;
                  el.style.cursor = "grabbing";
                  const startX = e.pageX - el.offsetLeft;
                  const scrollLeft = el.scrollLeft;

                  const onMouseMove = (moveEvent: MouseEvent) => {
                    const x = moveEvent.pageX - el.offsetLeft;
                    const walk = x - startX;
                    el.scrollLeft = scrollLeft - walk;
                  };

                  const onMouseUp = () => {
                    el.style.cursor = "grab";
                    window.removeEventListener("mousemove", onMouseMove);
                    window.removeEventListener("mouseup", onMouseUp);
                  };

                  window.addEventListener("mousemove", onMouseMove);
                  window.addEventListener("mouseup", onMouseUp);
                }}
              >
                {getSuggestionsForMode(workflowMode || 'multi-view').map((suggestion) => (
                  <Tooltip key={suggestion.text} open={disabled && disabledMessage ? undefined : false}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => !disabled && setInputValue(suggestion.text)}
                        disabled={disabled || isProcessing || messages.length >= 250}
                        className="flex-shrink-0 px-3 py-1 rounded-xl border border-gray-300 bg-gray-100 hover:bg-gray-200 text-[10px] font-medium transition-colors shadow-sm sm:text-xs sm:px-4 sm:py-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                      >
                        {suggestion.text}
                      </button>
                    </TooltipTrigger>
                    {disabled && disabledMessage && (
                      <TooltipContent side="top" className="!bg-secondary !text-primary border-secondary text-xs">
                        <p>{disabledMessage}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* View Selector - Above input */}
            <div className="flex items-center justify-between px-1">
              <ViewSelector
                value={selectedView}
                onChange={setSelectedView}
                disabled={disabled || isProcessing || isSingleViewRegenerating || messages.length >= 250}
              />
              <div className="text-[10px] text-gray-500">
                {selectedView === "all" ? (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    All views will be updated
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Only {selectedView} view (1 credit)
                  </span>
                )}
              </div>
            </div>

            {/* Textarea with Image Upload and Send Button */}
            <div className="flex items-center justify-between gap-2">
              {/* Tools Button - Left */}
              <button
                onClick={handleToolsClick}
                disabled={disabled || isProcessing || isSingleViewRegenerating || messages.length >= 250 || isUploadingImage}
                className="flex-shrink-0 h-[60px] w-[50px] rounded-xl flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Tools: Upload logo, sketch, or reference image"
              >
                <Layers className="h-5 w-5 text-gray-600" />
              </button>

              {/* Textarea - Center */}
              <Tooltip open={disabled && disabledMessage ? undefined : false}>
                <TooltipTrigger asChild>
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    disabled={disabled || isProcessing || isSingleViewRegenerating || messages.length >= 250}
                    onChange={(e) => {
                      // Direct event handling to ensure spaces are captured
                      const value = e.currentTarget.value;
                      setInputValue(value);
                    }}
                    onInput={(e) => {
                      // Backup handler for input event
                      const value = e.currentTarget.value;
                      setInputValue(value);
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#111827";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 1px rgba(17, 24, 39, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                      // iOS keyboard fix: scroll input into view after keyboard appears
                      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                        setTimeout(() => {
                          e.currentTarget?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                      }
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder={
                      disabled && disabledMessage
                        ? disabledMessage
                        : placeholderOverride
                        ? placeholderOverride
                        : messages.length >= 250
                        ? "Message limit reached"
                        : getPlaceholderForMode(workflowMode || 'multi-view')
                    }
                    className="flex-1 h-[60px] max-h-[60px] px-4 py-3 resize-none rounded-xl border border-gray-300 transition-all text-xs whitespace-pre-wrap disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none leading-relaxed overflow-y-auto"
                    style={{
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      wordSpacing: "normal",
                      letterSpacing: "normal",
                      outline: "none",
                    }}
                    onKeyDown={(e) => {
                      // Prevent any default space handling
                      if (e.key === " ") {
                        e.stopPropagation();
                      }
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    spellCheck={true}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </TooltipTrigger>
                {disabled && disabledMessage && (
                  <TooltipContent side="top" className="!bg-secondary !text-primary border-secondary text-xs">
                    <p>{disabledMessage}</p>
                  </TooltipContent>
                )}
              </Tooltip>

              {/* Send Button - Right */}
              <Button
                onClick={handleSend}
                disabled={
                  disabled ||
                  isProcessing ||
                  isSingleViewRegenerating ||
                  isUploadingImage ||
                  (!inputValue.trim() && !uploadedImage) ||
                  messages.length >= 250
                }
                size="sm"
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "white",
                }}
                className="flex-shrink-0 h-[60px] w-[40px] rounded-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed p-0 transition-all flex items-center justify-center"
                onMouseEnter={(e) => {
                  if (!disabled && !isProcessing && !isSingleViewRegenerating && !isUploadingImage && (inputValue.trim() || uploadedImage)) {
                    e.currentTarget.style.backgroundColor = "#404040";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !isProcessing && !isSingleViewRegenerating && !isUploadingImage) {
                    e.currentTarget.style.backgroundColor = "#1a1a1a";
                  }
                }}
              >
                {isProcessing || isSingleViewRegenerating || isUploadingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <ArrowUp className="h-6 w-6 text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Image Tool Selection Dialog */}
        <ImageToolDialog
          isOpen={isToolDialogOpen}
          onClose={() => {
            setIsToolDialogOpen(false);
          }}
          onConfirm={handleToolConfirm}
          onFileSelect={handleFileSelected}
          onLibrarySelect={handleLibraryImageSelected}
        />
      </div>
    </TooltipProvider>
  );
}

export default ChatInterface;
