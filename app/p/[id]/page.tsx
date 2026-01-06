"use client";

/**
 * Public Product View Page
 * Full product view matching the authenticated product page layout
 * Includes: Sidebar navigation, all consolidated sections, and chat panel
 * Read-only - no editing functionality
 * Uses shared components from app/product/shared for maximum code reuse
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Send,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Shared components and utilities
import {
  TechFileGuideModal,
  SharedSidebar,
  SharedInfoBar,
  SharedHeader,
  ImageViewerModal,
  MobileBottomNav,
  ImageGalleryCanvas,
  ProductNotFound,
  ProductSkeleton,
  PageLayout,
  type TechFilesData,
} from "@/app/product/shared";

// Section components (already support readOnly mode)
import { SpecificationsSection } from "@/app/product/components/sections/SpecificationsSection";
import { ConstructionSection } from "@/app/product/components/sections/ConstructionSection";
import { ProductionSection } from "@/app/product/components/sections/ProductionSection";
import { FactorySpecsSection } from "@/app/product/components/sections/FactorySpecsSection";
import { VisualSection } from "@/app/product/components/sections/VisualSection";
import { supabase } from "@/lib/supabase/client";
import { GenpireCommentModal } from "@/components/genpire-comments-modal";
import { useUserStore } from "@/lib/zustand/useStore";

// ============================================
// TYPES
// ============================================

interface PublicProductData {
  id: string;
  techPack: any;
  imageData: {
    front?: { url: string };
    back?: { url: string };
    side?: { url: string };
    top?: { url: string };
    bottom?: { url: string };
  };
  techFilesData: TechFilesData;
  prompt: string;
  createdAt: string;
  viewCount?: number;
  upvoteCount?: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PublicProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const [product, setProduct] = useState<PublicProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("visual");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useUserStore();
  // Image viewer state
  const [viewerImage, setViewerImage] = useState<{
    url: string;
    title?: string;
    description?: string;
  } | null>(null);

  // Tech file guide modal state
  const [selectedTechFileGuide, setSelectedTechFileGuide] = useState<any | null>(null);
  const [targetViewId, setTargetViewId] = useState<string | null>(null);

  const openImageViewer = useCallback((url: string, title?: string, description?: string) => {
    setViewerImage({ url, title, description });
  }, []);

  const closeImageViewer = useCallback(() => {
    setViewerImage(null);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        setError("Invalid product ID");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/public/product?productId=${productId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || "Product not found or is not public");
          return;
        }

        setProduct(data.data);
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("products_comments")
        .select("*, user:users(*)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (data) {
        setComments(data);
      }
    };
    fetchComments();
  }, [productId]);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return <ProductNotFound error={error} showSignIn={false} />;
  }

  const handleOpenCommentModal = async () => {

    // Fetch comments
    const { data } = await supabase
      .from("products_comments")
      .select("*, user:users(*)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (data) {
      setComments(data);
    }
    setCommentModalOpen(true);
  };

  const handlePostComment = async (fullName?: string) => {

    if (!newComment.trim()) return;

    // If user is logged in, use regular addComment
    if (user) {
      const { addComment } = await import("@/lib/supabase/made-with-genpire");
      const result = await addComment(productId, newComment);

      if (!result.error) {
        const optimisticComment = {
          id: Math.random(),
          created_at: new Date().toISOString(),
          content: newComment,
          user: {
            avatar_url: "",
            full_name: user.full_name || "",
          },
        };
        setComments([optimisticComment, ...comments]);
        setNewComment("");
      }
    } else if (fullName) {
      // Anonymous user with name from cookie
      const { addAnonymousComment } = await import("@/lib/supabase/made-with-genpire");
      const result = await addAnonymousComment(productId, newComment, fullName);

      if (!result.error) {
        const optimisticComment = {
          id: Math.random(),
          created_at: new Date().toISOString(),
          content: newComment,
          full_name: fullName,
        };
        setComments([optimisticComment, ...comments]);
        setNewComment("");
      }
    }
  };

  const handleAreaComment = async (text: string, metadata: { x: number; y: number; view: string }) => {
    if (!text.trim()) return;

    // We can assume if they are using the visual tool, they might be anon or logged in.
    // Ideally we reuse the logic. For anon, we need a name. 
    // If no name locally (cookie), we should prompt?
    // For now, let's try to get name from cookie or default to "Anonymous Visitor" if not found, 
    // OR just fail if no name? The ImageGalleryCanvas handles the UI for input, but not name.

    // Check for cookie manually or reuse logic
    let name = "";
    if (!user) {
      // Quick check for cookie
      const parts = `; ${document.cookie}`.split(`; genpire_commenter_name=`);
      if (parts.length === 2) name = decodeURIComponent(parts.pop()?.split(";").shift() || "");

      if (!name) name = "Anonymous Visitor"; // Fallback
    }

    if (user) {
      const { addComment } = await import("@/lib/supabase/made-with-genpire");
      const result = await addComment(productId, text, undefined, metadata);
      if (!result.error && result.data && result.data[0]) {
        // Add to local state
        setComments([result.data[0], ...comments]);
      }
    } else {
      const { addAnonymousComment } = await import("@/lib/supabase/made-with-genpire");
      const result = await addAnonymousComment(productId, text, name, metadata);
      if (!result.error && result.data && result.data[0]) {
        setComments([result.data[0], ...comments]);
      }
    }
  };

  const techPack = product.techPack;
  const productName = techPack?.productName || "Untitled Product";
  const productDescription = techPack?.productOverview || product.prompt;
  const productImages = {
    front: product.imageData?.front?.url || "",
    back: product.imageData?.back?.url || "",
    side: product.imageData?.side?.url || "",
    top: product.imageData?.top?.url || "",
    bottom: product.imageData?.bottom?.url || "",
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Public Header - Using shared component */}
      <SharedHeader readOnly productName={productName} handleOpenCommentModal={handleOpenCommentModal} />

      {/* Main layout with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Panel - Desktop (Left Side) */}
        <PublicChatPanel
          productId={productId}
          productName={productName}
          techPack={techPack}
          activeSection={activeTab}
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />

        {/* Sidebar - Using shared component */}
        <SharedSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          productName={productName}
          productThumbnail={productImages.front}
          readOnly
        />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pb-12 md:pb-4 flex flex-col">
          {/* Product Info Bar - Using shared component */}
          <SharedInfoBar
            productName={productName}
            description={productDescription?.slice(0, 100) || ""}
            category={techPack?.category_Subcategory || ""}
            createdAt={product.createdAt}
            viewCount={product.viewCount || 0}
            upvoteCount={product.upvoteCount || 0}
            showPublicStats
          />

          <div className="flex-1 w-full p-4 pb-24 md:pb-4">
            {/* Section Contents - All use readOnly mode */}
            {activeTab === "visual" && (
              <VisualSection
                techPack={techPack}
                readOnly
                customImageGallery={
                  <ImageGalleryCanvas
                    productImages={productImages}
                    onImageClick={openImageViewer}
                    comments={comments}
                    onAddComment={handleAreaComment}
                  />
                }
              />
            )}

            {activeTab === "factory-specs" && (
              <FactorySpecsSection
                techFilesData={product.techFilesData}
                techFilesLoading={false}
                readOnly
                onSelectTechFileGuide={(file) => setSelectedTechFileGuide(file)}
                onOpenImageViewer={(url, title, desc) => openImageViewer(url, title, desc)}
                comments={comments}
                onAddComment={handleAreaComment}
                targetViewId={targetViewId}
              />
            )}

            {activeTab === "specifications" && (
              <SpecificationsSection techPack={techPack} readOnly />
            )}

            {activeTab === "construction" && (
              <ConstructionSection techPack={techPack} readOnly />
            )}

            {activeTab === "production" && (
              <ProductionSection techPack={techPack} readOnly />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Using shared component */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Mobile Chat Toggle Button */}
      <ChatToggleButton
        onClick={() => setIsMobileChatOpen(true)}
        isOpen={isMobileChatOpen}
      />

      {/* Mobile Chat Modal */}
      <MobileChatModal
        productId={productId}
        productName={productName}
        techPack={techPack}
        activeSection={activeTab}
        isOpen={isMobileChatOpen}
        onClose={() => setIsMobileChatOpen(false)}
      />

      {/* Image Viewer Modal - Using shared component */}
      {viewerImage && (
        <ImageViewerModal
          image={viewerImage}
          onClose={closeImageViewer}
        />
      )}

      {/* Tech File Guide Modal - Using shared component */}
      <TechFileGuideModal
        selectedTechFile={selectedTechFileGuide}
        onClose={() => setSelectedTechFileGuide(null)}
        onViewImage={(url, title, desc) => openImageViewer(url, title, desc)}
        comments={comments}
        onAddComment={handleAreaComment}
      />

      <GenpireCommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        product={product}
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        onPostComment={handlePostComment}
        currentUser={user}
        onCommentClick={(comment) => {
          if (comment.metadata?.view) {
            setCommentModalOpen(false);
            const visualViews = ["front", "back", "side", "top", "bottom"];
            const isVisual = visualViews.includes(comment.metadata.view);

            if (isVisual) {
              setActiveTab("visual");
              setTargetViewId(null);
            } else {
              setActiveTab("factory-specs");
              setTargetViewId(comment.metadata.view);
            }

            // Wait for tab switch and render
            setTimeout(() => {
              const element = document.querySelector(`[data-view="${comment.metadata.view}"]`);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                // Optional: Flash effect
                if (element.classList) {
                  element.classList.add("ring-4", "ring-primary", "transition-all", "duration-500");
                  setTimeout(() => {
                    element.classList.remove("ring-4", "ring-primary", "transition-all", "duration-500");
                  }, 2000);
                }
              }
            }, 300); // Increased timeout to allow for Factory Specs sub-tab switching
          }
        }}
      />
    </div>
  );
}

// ============================================
// CHAT COMPONENTS
// ============================================

/**
 * Parse markdown-style bold text (**text**) into React elements
 */
function formatMessageContent(content: string): React.ReactNode {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function PublicChatPanel({
  productId,
  productName,
  techPack,
  activeSection,
  isOpen,
  onToggle,
}: {
  productId: string;
  productName: string;
  techPack: any;
  activeSection: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm the Genpire Agent. Ask me anything about **${productName}**! I can help you understand the materials, construction details, specifications, and more.`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/public-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          message: inputValue,
          techPack,
          activeSection,
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process that question. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Collapsed state
  if (!isOpen) {
    return (
      <div className="hidden lg:flex flex-col items-center py-4 px-2 border-r border-neutral-800 bg-neutral-950">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-10 w-10 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 focus:ring-0 focus-visible:ring-0"
          title="Open chat"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <span
            className="text-sm font-small text-neutral-400 writing-mode-vertical"
            style={{ writingMode: "vertical-rl" }}
          >
            Genpire Agent
          </span>
        </div>
      </div>
    );
  }

  // Expanded state
  return (
    <div
      className={cn(
        "hidden lg:flex flex-col",
        "w-[380px] min-w-[380px]",
        "bg-neutral-950",
        "border-r border-neutral-800",
        "h-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-white">Genpire Agent</h3>
          <p className="text-xs text-neutral-400">Ask about {productName}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 focus:ring-0 focus-visible:ring-0"
          title="Collapse chat"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-neutral-800 text-neutral-100"
              )}
            >
              <p className="whitespace-pre-wrap">{formatMessageContent(message.content)}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask about ${activeSection}...`}
            className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatToggleButton({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  if (isOpen) return null;

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "lg:hidden",
        "fixed bottom-20 right-4",
        "z-[60]",
        "h-12 w-12 rounded-full shadow-lg p-0 overflow-hidden",
        "bg-transparent",
        "hover:scale-105 transition-all duration-200"
      )}
    >
      <img
        src="/favicon.png"
        alt="Genpire"
        className="h-full w-full object-cover"
      />
    </Button>
  );
}

function MobileChatModal({
  productId,
  productName,
  techPack,
  activeSection,
  isOpen,
  onClose,
}: {
  productId: string;
  productName: string;
  techPack: any;
  activeSection: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm the Genpire Agent. Ask me anything about **${productName}**!`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/public-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          message: inputValue,
          techPack,
          activeSection,
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process that question. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[80] bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-white">Genpire Agent</h3>
          <p className="text-xs text-neutral-400">Ask about {productName}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 focus:ring-0 focus-visible:ring-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-neutral-800 text-neutral-100"
              )}
            >
              <p className="whitespace-pre-wrap">{formatMessageContent(message.content)}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-800 pb-20">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask about ${activeSection}...`}
            className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
