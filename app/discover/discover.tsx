"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Clock, Award, Heart, MessageCircle, Share2 } from "lucide-react";
import { addComment, addAnonymousComment, getProducts, getTopCreators, likeProduct, unlikeProduct } from "@/lib/supabase/made-with-genpire";
import { supabase } from "@/lib/supabase/client";
import { GenpireCommentModal } from "@/components/genpire-comments-modal";
import debounce from "lodash.debounce";
import { AuthModal } from "@/components/auth/auth-modal";
import { useUserStore } from "@/lib/zustand/useStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LandingNavbar } from "@/components/landing-navbar";
import { fetchProductIdExist } from "../actions/collection-product-entry";

// 1. Define a Product type that matches the data from your RPC function
export type Product = {
  id: string;
  created_at: string;
  product_name: string;
  product_description: string;

  image_data: {
    top?: ProductImageView;
    back?: ProductImageView;
    side?: ProductImageView;
    front?: ProductImageView;
    bottom?: ProductImageView;
    illustration?: ProductImageView;
  };

  creator_id: string;
  creator_full_name: string;
  creator_avatar_url: string;

  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;

  // Optional legacy fields (for compatibility)
  creator_profile?: { name: string };
  likes?: any[];
  comments?: any[];
};

export type ProductImageView = {
  url: string;
  created_at: string;
  prompt_used: string;
  regenerated: boolean;
};

// Dummy data for components that are not the main focus
const challenges = [
  {
    id: 1,
    name: "Design the Future of Workspaces",
    image: "/modern-workspace-furniture-design.jpg",
    status: "This Month's Challenge",
    isCurrent: true,
  },
  {
    id: 2,
    name: "Sustainable Fashion Forward",
    image: "/sustainable-fashion.png",
    status: "Past Challenge",
    isCurrent: false,
  },
  {
    id: 3,
    name: "Smart Home Essentials",
    image: "/smart-home-devices.jpg",
    status: "Past Challenge",
    isCurrent: false,
  },
];
export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("new");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [topCreators, setTopCreators] = useState<any[]>([]);
  const challengesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchTopCreators = async () => {
      const creators = await getTopCreators();
      setTopCreators(creators);
    };
    fetchTopCreators();
  }, []);

  // 2. Efficient Real-Time Updates Effect
  useEffect(() => {
    const fetchInitialData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const fetchedProducts = await getProducts();
      // Ensure fetchedProducts is not null or undefined
      if (fetchedProducts) {
        setProducts(fetchedProducts as Product[]);
        console.log("prodyctsdbufuircf==", fetchedProducts);
      }
    };

    fetchInitialData();

    const channel = supabase
      .channel("realtime-discover-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "products_comments" }, (payload: any) => {
        setProducts((currentProducts) =>
          currentProducts.map((p) =>
            p.id === payload.new.product_id ? { ...p, comments_count: p.comments_count + 1 } : p
          )
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "products_comments" }, (payload: any) => {
        setProducts((currentProducts) =>
          currentProducts.map((p) =>
            p.id === payload.old.product_id ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id]); // Rerun when user ID changes

  useEffect(() => {
    return () => {
      sendLikeRequest.cancel();
    };
  }, []);

  const sendLikeRequest = debounce(async (productId: string, newIsLiked: boolean, creator_id: string) => {
    try {
      if (newIsLiked) {
        console.log("newIsLiked ==> ", newIsLiked);
        await likeProduct(productId, creator_id);
      } else {
        console.log("sadffffffffffffff");
        await unlikeProduct(productId);
      }
    } catch (error) {
      console.error("Failed to update like/unlike:", error);
      // Optionally handle error here (rollback if necessary)
    }
  }, 300);

  const handleLikeClick = (productId: string, isLiked: boolean, creator_id: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // --- Optimistic UI update ---
    setProducts((currentProducts) =>
      currentProducts.map((p) =>
        p.id === productId
          ? {
            ...p,
            user_has_liked: !isLiked,
            likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
          }
          : p
      )
    );

    // --- Debounced network request ---
    const newIsLiked = !isLiked;
    sendLikeRequest(productId, newIsLiked, creator_id);
  };

  const handleOpenCommentModal = async (product: Product) => {
    console.log("product ==> ", product);
    setSelectedProduct(product);
    const { data } = await supabase
      .from("products_comments")
      .select("*, user:users(*)")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });

    console.log(data, "jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
    if (data) {
      setComments(data);
    }
    setCommentModalOpen(true);
  };

  const handlePostComment = async (fullName?: string) => {
    if (!selectedProduct || !newComment.trim()) return;

    // If user is logged in, use regular addComment
    if (user) {
      const result = await addComment(selectedProduct.id, newComment);

      if (result.error) {
        console.error("Failed to post comment:", result.error);
      } else {
        const optimisticComment = {
          id: Math.random(),
          created_at: new Date().toISOString(),
          content: newComment,
          user: {
            avatar_url: user.user_metadata?.avatar_url || "",
            full_name: user.user_metadata?.full_name || "",
          },
        };
        setComments([optimisticComment, ...comments]);
        setNewComment("");
      }
    } else if (fullName) {
      // Anonymous user with name from cookie
      const result = await addAnonymousComment(selectedProduct.id, newComment, fullName);

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

  // 3. Updated Memo for Filtering and Sorting
  const filteredAndSortedProducts = useMemo(() => {
    // Use a non-mutating copy for sorting
    let result = [...products];

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p?.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p?.creator_full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "new") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "upvoted" || sortBy === "trending") {
      result.sort((a, b) => b.likes_count - a.likes_count);
    }

    return result;
  }, [products, searchQuery, sortBy]);

  const categories = ["All", "Apparel", "Footwear", "Home", "Furniture", "Tech", "Accessories"];
  return (
    <div className="min-h-screen w-full bg-background">
      {!user && <LandingNavbar />}
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-black">
        {/* Animated black overlay (Framer Motion Blob) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 2,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-1/2 w-[800px] h-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-black via-gray-900 to-black blur-3xl"
          style={{ zIndex: -10 }}
        />
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white
             mb-6"
            >
              Discover What&apos;s Being Made Before It&apos;s Made.
            </h1>
            <p className="text-lg md:text-xl text-white max-w-3xl mx-auto mb-8 leading-relaxed">
              A showroom and marketplace of products created on Genpire. Explore designs, get inspired, try-on
              virtually, and show interest in bringing them to real life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                  } else {
                    challengesRef.current?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                size="lg"
                className="rounded-xl px-8 bg-gradient-to-r from-stone-800 to-stone-900"
              >
                Start Creating
              </Button>
            </div>
          </motion.div>
          {/* Dynamic grid animation */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-5xl mx-auto opacity-30"
          >
            {products.slice(0, 6).map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={product.image_data?.front?.url || "/placeholder.svg"}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div> */}
        </div>
      </section>
      {/* Discover Feed */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Filter Bar */}
          <div className="mb-12 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Search products or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-stone-300"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 w-22">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="upvoted">Most Upvoted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {/* Product Grid - Shopify Style */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredAndSortedProducts.map((product, index) => {
              const isLiked = product.user_has_liked;
              const frontImageUrl = product.image_data?.front?.url || "/placeholder.svg";

              return (
                <motion.div key={product.id} initial={false} viewport={{ once: true }} className="group flex flex-col">
                  {/* Product Image Container */}
                  <Link
                    href={`/discover/${product.id}`}
                    className="block relative overflow-hidden rounded-lg bg-[#f4f4f4] mb-4"
                  >
                    <div className="aspect-[4/5] w-full relative">
                      <img
                        src={frontImageUrl}
                        alt={product.product_name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                      />
                      {/* Overlay Actions - Responsive: Fixed Right (Mobile) / Hover Center (Desktop) */}
                      <div
                        className="absolute z-10 transition-all duration-300 
                        right-2 bottom-2 flex flex-col gap-2 opacity-100
                        md:inset-x-0 md:bottom-4 md:right-0 md:flex-row md:justify-center md:items-center md:opacity-0 md:group-hover:opacity-100"
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleLikeClick(product.id, isLiked, product.creator_id);
                          }}
                          className="bg-white/90 backdrop-blur-sm text-black p-2.5 md:p-3 rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all"
                        >
                          <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenCommentModal(product);
                          }}
                          className="bg-white/90 backdrop-blur-sm text-black p-2.5 md:p-3 rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/product/${product.id}`}
                      className="group-hover:underline decoration-1 underline-offset-4"
                    >
                      <h3 className="text-[15px] font-medium text-[#121212] leading-tight truncate">
                        {product.product_name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[#707070]">
                        {product.creator_avatar_url ? (
                          <img
                            src={product.creator_avatar_url}
                            alt={product.creator_full_name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                            {product.creator_full_name?.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate max-w-[120px]">{product.creator_full_name}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#707070]">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {product.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {product.comments_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Top Creators Section */}
      {/* <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Top Creators</h2>
            <p className="text-lg text-stone-600">Meet the designers shaping the future — powered by Genpire.</p>
          </motion.div>

          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
            {topCreators?.map((creator, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  {creator.creator_avatar_url ? (
                    <img
                      className="w-16 h-16 rounded-full object-cover flex items-center justify-center"
                      src={creator?.creator_avatar_url || "/placeholder.svg"}
                      alt="Creator Avatar"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-700 font-bold text-lg">
                      {creator.creator_full_name?.substring(0, 2).toUpperCase() || "??"}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-stone-900">{creator?.creator_full_name}</h3>
                    <p className="text-sm text-stone-600">{creator?.brand}</p>
                  </div>
                </div>
            <div className="mb-4">
                  {creator && (
                    <div className="relative inline-block">
                      {creator.total_products === Math.max(...topCreators.map((c) => c.total_products)) && (
                        <span className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          🔥 Trending Designer
                        </span>
                      )}
                      {creator.total_upvotes === Math.max(...topCreators.map((c) => c.total_upvotes)) && (
                        <span className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          🥇 Creator of the Month
                        </span>
                      )}
                    </div>
                  )}
                </div> 
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span>{creator?.total_upvotes} total upvotes</span>
                  <span>{creator?.total_products} products</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="rounded-xl border-stone-300 bg-transparent">
              View All Creators
            </Button>
          </div>
        </div>
      </section> */}

      {/* Monthly Challenges */}
      {/* <section ref={challengesRef} className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Monthly Challenges</h2>
            <p className="text-lg text-stone-600">
              Join themed design challenges, showcase your ideas, and get featured.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden border ${
                  challenge.isCurrent
                    ? "border-stone-900 shadow-xl md:col-span-3 lg:col-span-1"
                    : "border-stone-200 hover:shadow-lg"
                } transition-all`}
              >
                <div className="relative aspect-video">
                  <img
                    src={challenge.image || "/placeholder.svg"}
                    alt={challenge.name}
                    className="w-full h-full object-cover"
                  />
                  {challenge.isCurrent && (
                    <div className="absolute top-3 left-3 bg-stone-900 text-white px-3 py-1 rounded-full">
                      <span className="text-xs font-medium">{challenge.status}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-stone-900 mb-4">{challenge.name}</h3>
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    className={`w-full rounded-xl ${challenge.isCurrent ? "" : "variant-outline"}`}
                  >
                    {challenge.isCurrent ? "Submit to Challenge" : "View Challenge"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Publishing Flow Info */}
      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-stone-200 p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Want to Be Featured?</h2>
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              From your Made-In page, toggle "Make Public" or click "Share to Made with Genpire." Once public, your
              product appears on the Discover feed for the entire community to explore, vote, and comment on.
            </p>
            <Button onClick={() => setIsAuthModalOpen(true)} size="lg" className="rounded-xl px-8">
              Go to Made-In
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Tagline */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Made with Genpire — Where AI meets creativity.</h2>
            <p className="text-xl text-white/70 mb-8">Discover. Upvote. Create.</p>
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              size="lg"
              className="rounded-xl px-8 bg-white text-black hover:bg-gray-100"
            >
              Start Creating Now
            </Button>
          </motion.div>
        </div>
      </section>

      <GenpireCommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        product={selectedProduct}
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        onPostComment={handlePostComment}
        currentUser={user}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Get Started with Genpire"
        description="Sign in or create an account to generate your tech pack"
        defaultTab="signup"
      />
    </div>
  );
}
