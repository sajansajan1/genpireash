"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Globe,
  Lock,
  ScanSearch,
  Download,
  MoreVertical,
  Copy,
  FolderOpen,
  Trash2,
  Eye,
  FileText,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserStore } from "@/lib/zustand/useStore";
import { likeProduct, unlikeProduct } from "@/lib/supabase/made-with-genpire";
import { GenpireCommentModal } from "@/components/genpire-comments-modal";
import { AuthModal } from "@/components/auth/auth-modal";
import { supabase } from "@/lib/supabase/client";
import debounce from "lodash.debounce";
import { Product } from "@/app/discover/discover"; // Importing type from the main discover page

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product: initialProduct }: ProductDetailViewProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [activeImage, setActiveImage] = useState<string>(
    initialProduct.image_data?.front?.url ||
    initialProduct.image_data?.side?.url ||
    initialProduct.image_data?.back?.url ||
    "/placeholder.svg"
  );

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  // Real-time updates for likes/comments
  useEffect(() => {
    const channel = supabase
      .channel(`product-${product.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products_comments", filter: `product_id=eq.${product.id}` },
        (payload: any) => {
          setProduct((prev) => ({ ...prev, comments_count: prev.comments_count + 1 }));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "products_comments", filter: `product_id=eq.${product.id}` },
        (payload: any) => {
          setProduct((prev) => ({ ...prev, comments_count: Math.max(0, prev.comments_count - 1) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product.id]);

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("products_comments")
        .select("*, user:users(*)")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false });

      if (data) {
        setComments(data);
      }
    };
    fetchComments();
  }, [product.id]);

  const sendLikeRequest = debounce(async (productId: string, newIsLiked: boolean, creator_id: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      if (newIsLiked) {
        await likeProduct(productId, creator_id);
      } else {
        await unlikeProduct(productId);
      }
    } catch (error) {
      console.error("Failed to update like/unlike:", error);
    }
  }, 300);

  const handleLikeClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const isLiked = product.user_has_liked;
    const newIsLiked = !isLiked;

    // Optimistic update
    setProduct((prev) => ({
      ...prev,
      user_has_liked: newIsLiked,
      likes_count: newIsLiked ? prev.likes_count + 1 : prev.likes_count - 1,
    }));

    sendLikeRequest(product.id, newIsLiked, product.creator_id);
  };

  const handleOpenCommentModal = async () => {
    // Fetch comments
    const { data } = await supabase
      .from("products_comments")
      .select("*, user:users(*)")
      .eq("product_id", product.id)
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
      const result = await addComment(product.id, newComment);

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
        setProduct((prev) => ({ ...prev, comments_count: prev.comments_count + 1 }));
      }
    } else if (fullName) {
      // Anonymous user with name from cookie
      const { addAnonymousComment } = await import("@/lib/supabase/made-with-genpire");
      const result = await addAnonymousComment(product.id, newComment, fullName);

      if (!result.error) {
        const optimisticComment = {
          id: Math.random(),
          created_at: new Date().toISOString(),
          content: newComment,
          full_name: fullName,
        };
        setComments([optimisticComment, ...comments]);
        setNewComment("");
        setProduct((prev) => ({ ...prev, comments_count: prev.comments_count + 1 }));
      }
    }
  };

  const images = [
    { url: product.image_data?.front?.url, view: "Front" },
    { url: product.image_data?.back?.url, view: "Back" },
    { url: product.image_data?.side?.url, view: "Side" },
    { url: product.image_data?.top?.url, view: "Top" },
    { url: product.image_data?.bottom?.url, view: "Bottom" },
    { url: product.image_data?.illustration?.url, view: "Illustration" },
  ].filter((img) => img.url);

  return (
    <div className="min-h-screen bg-[#f6f6f7] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-transparent hover:text-black p-0 flex items-center gap-2 text-[#6d7175]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Discover
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/5] w-full bg-white rounded-2xl overflow-hidden border border-[#e1e3e5] shadow-sm relative group">
              <img src={activeImage} alt={product.product_name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white"
                  onClick={() => window.open(activeImage, "_blank")}
                >
                  <ScanSearch className="h-4 w-4 text-gray-700" />
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img.url!)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img.url
                      ? "border-[#202223] ring-1 ring-[#202223]"
                      : "border-transparent hover:border-[#c9cccf]"
                      }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.product_name} ${img.view}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="flex flex-col">
            <div className="bg-white rounded-2xl border border-[#e1e3e5] p-6 md:p-8 shadow-sm h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#202223] mb-2">{product.product_name}</h1>
                  <div className="flex items-center gap-3">
                    {product.creator_avatar_url ? (
                      <img
                        src={product.creator_avatar_url}
                        alt={product.creator_full_name}
                        className="w-6 h-6 rounded-full object-cover border border-[#e1e3e5]"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {product.creator_full_name?.substring(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-[#6d7175] font-medium">
                      Created by <span className="text-[#202223]">{product.creator_full_name}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-2 rounded-full bg-[#f6f6f7] text-[#6d7175]">
                          {product.created_at && new Date(product.created_at).toLocaleDateString()}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Created Date</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-stone max-w-none mb-8">
                <h3 className="text-sm font-semibold text-[#202223] uppercase tracking-wide mb-3">Description</h3>
                <p className="text-[#6d7175] leading-relaxed">
                  {product.product_description || "No description available for this product."}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-8 border-t border-[#e1e3e5]">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Button
                      onClick={handleLikeClick}
                      variant="outline"
                      className={`h-12 px-6 rounded-lg border-[#c9cccf] hover:bg-[#f6f6f7] transition-all gap-2 ${product.user_has_liked ? "text-red-500 border-red-200 bg-red-50" : "text-[#202223]"
                        }`}
                    >
                      <Heart className={`h-5 w-5 ${product.user_has_liked ? "fill-current" : ""}`} />
                      <span className="font-semibold">{product.likes_count}</span>
                    </Button>

                    <Button
                      onClick={handleOpenCommentModal}
                      variant="outline"
                      className="h-12 px-6 rounded-lg border-[#c9cccf] text-[#202223] hover:bg-[#f6f6f7] transition-all gap-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="font-semibold">{product.comments_count}</span>
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-lg text-[#6d7175] hover:text-[#202223]"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments Section - Displayed directly on page */}
            {/* <div className="mt-8 bg-white rounded-2xl border border-[#e1e3e5] p-6 md:p-8 shadow-sm"> */}
            {/* <h3 className="text-lg font-bold text-[#202223] mb-6 flex items-center gap-2">
                                Comments <span className="text-sm font-normal text-[#6d7175] bg-[#f6f6f7] px-2 py-0.5 rounded-full">{comments.length}</span>
                            </h3> */}

            {/* {comments.length > 0 ? (
                                <div className="space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4 group">
                                            {comment.user?.avatar_url ? (
                                                <img
                                                    src={comment.user.avatar_url}
                                                    alt={comment.user.full_name}
                                                    className="w-10 h-10 rounded-full object-cover border border-[#e1e3e5]"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                                                    {comment.user?.full_name?.substring(0, 1).toUpperCase() || "?"}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-[#202223] text-sm">{comment.user?.full_name || "Anonymous"}</span>
                                                    <span className="text-xs text-[#6d7175]">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-[#4a4a4a] text-sm leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[#6d7175]">
                                    <p>No comments yet. Be the first to share your thoughts!</p>
                                </div>
                            )} */}

            {/* <div className="mt-6 pt-6 border-t border-[#e1e3e5]">
                                <Button
                                    onClick={handleOpenCommentModal}
                                    variant="outline"
                                    className="w-full border-[#c9cccf] text-[#202223] hover:bg-[#f6f6f7]"
                                >
                                    Write a comment...
                                </Button>
                            </div> */}
            {/* </div> */}
          </div>
        </div>
      </div>

      <GenpireCommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        product={product}
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        onPostComment={handlePostComment}
        currentUser={user}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Join the Community"
        description="Sign in to like, comment, and save products."
        defaultTab="signup"
      />
    </div>
  );
}
