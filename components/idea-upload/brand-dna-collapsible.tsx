"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Lock, Dna, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { useGetCreatorDnaStore } from "@/lib/zustand/brand-dna/getDna";
import { fetchAiCreativeDirectorPrompts } from "@/lib/supabase/creative-director-prompts";

interface BrandPrompt {
    title: string;
    prompt: string;
}

interface BrandDnaCollapsibleProps {
    onPromptSelect: (prompt: string) => void;
}

export function BrandDnaCollapsible({ onPromptSelect }: BrandDnaCollapsibleProps) {
    const router = useRouter();
    const [brandDnaExpanded, setBrandDnaExpanded] = useState(false);
    const [brandDnaState, setBrandDnaState] = useState<
        "idle" | "loading" | "analyzed" | "limit-reached"
    >("idle");
    const [brandUrl, setBrandUrl] = useState("");
    const [suggestedBrandPrompts, setSuggestedBrandPrompts] = useState<BrandPrompt[]>([]);
    const [remainingRegenerations, setRemainingRegenerations] = useState<number | "unlimited">(1);
    const isInitializing = useRef(false);
    const { getCreatorCredits } = useGetCreditsStore();
    const { fetchCreatorDna, getActiveDna } = useGetCreatorDnaStore();
    const activedna = getActiveDna();
    const [loadingCreativeDirectorPrompts, setLoadingCreativeDirectorPrompts] = useState(false);

    const isPro = getCreatorCredits?.membership === "pro";

    // Combined effect for initial data loading
    useEffect(() => {
        const initializeComponent = async () => {
            if (isInitializing.current) return;
            isInitializing.current = true;
            try {
                if (!activedna) {
                    await fetchCreatorDna();
                }

                // Check for existing prompts in DB
                setLoadingCreativeDirectorPrompts(true);
                const existingData = await fetchAiCreativeDirectorPrompts();

                if (existingData && existingData.prompts && Array.isArray(existingData.prompts)) {
                    setSuggestedBrandPrompts(existingData.prompts);
                    setBrandUrl(existingData.url || "");
                    setBrandDnaState("analyzed");

                    // If user is NOT Pro (free/saver), lock them out if they already have prompts
                    if (!isPro) {
                        setRemainingRegenerations(0);
                    } else {
                        // Pro users: unlimited regenerations
                        setRemainingRegenerations("unlimited");
                    }
                }
            } finally {
                isInitializing.current = false;
                setLoadingCreativeDirectorPrompts(false);
            }
        };

        initializeComponent();
    }, [fetchCreatorDna, getCreatorCredits?.membership]);

    // Separate effect for Pro Automation - only runs once
    useEffect(() => {
        const activeDna = getActiveDna();
        if (activeDna?.website_url && !brandUrl) {
            setBrandUrl(activeDna.website_url);
        }
    }, [activedna]);

    const handleAnalyzeBrand = async (urlToAnalyze?: string) => {
        let url = (urlToAnalyze || brandUrl).trim();

        if (!url) {
            toast({
                title: "Invalid URL",
                description: "Please enter a valid brand URL to analyze.",
                variant: "destructive",
            });
            return null;
        }

        if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }

        if (!url.startsWith("https://")) {
            toast({
                title: "Invalid URL",
                description: "Website URL must start with https://",
                variant: "destructive",
            });
            return null;
        }

        setBrandDnaState("loading");

        try {
            const response = await fetch("/api/generate-product-prompts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: url }),
            });

            if (!response.ok) {
                toast({
                    title: "Analysis Failed",
                    description: "Unable to analyze the website.",
                    variant: "destructive",
                });
                setBrandDnaState("idle");
                return null;
            }

            const data = await response.json();

            if (data.prompts && Array.isArray(data.prompts)) {
                setSuggestedBrandPrompts(data.prompts);
                setBrandDnaState("analyzed");

                // Lock for non-pro users immediately after first success
                if (!isPro) {
                    setRemainingRegenerations(0);
                } else {
                    setRemainingRegenerations("unlimited");
                }

                toast({
                    title: "Brand Analysis Complete!",
                    description: "Your AI Creative Director is ready with personalized suggestions.",
                });
            } else {
                throw new Error("Invalid format");
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Analysis Error",
                description: "Unable to generate product suggestions.",
                variant: "destructive",
            });
            setBrandDnaState("idle");
        }
    };

    const handleRegeneratePrompts = async () => {
        let url = brandUrl.trim();

        if (!url) {
            toast({
                title: "Invalid URL",
                description: "Please enter a valid brand URL to analyze.",
                variant: "destructive",
            });
            return null;
        }

        if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }

        if (!url.startsWith("https://")) {
            toast({
                title: "Invalid URL",
                description: "Website URL must start with https://",
                variant: "destructive",
            });
            return null;
        }

        // Only enforce limit for non-Pro
        if (
            !isPro &&
            typeof remainingRegenerations === "number" &&
            remainingRegenerations <= 0
        ) {
            setBrandDnaState("limit-reached");
            return;
        }

        setBrandDnaState("loading");

        try {
            const response = await fetch("/api/generate-product-prompts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: url }),
            });

            if (!response.ok) {
                toast({
                    title: "Regeneration Failed",
                    description: "Unable to generate new suggestions.",
                    variant: "destructive",
                });
                setBrandDnaState("analyzed");
                return;
            }

            const data = await response.json();

            if (data.prompts && Array.isArray(data.prompts)) {
                setSuggestedBrandPrompts(data.prompts);

                // Decrement only for non-Pro
                if (!isPro) {
                    setRemainingRegenerations((prev) =>
                        typeof prev === "number" ? prev - 1 : prev
                    );
                }

                setBrandDnaState("analyzed");

                if (isPro) {
                    toast({
                        title: "Regenerated!",
                        description: "Your brand-personalized prompt is ready to use."
                    });
                } else {
                    const next =
                        typeof remainingRegenerations === "number"
                            ? remainingRegenerations - 1
                            : 0;
                    toast({
                        title: "Regenerated!",
                        description: `Regenerated! ${next} regeneration${next === 1 ? "" : "s"
                            } left.`,
                    });
                }
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Regeneration Error",
                description: "Unable to regenerate suggestions.",
                variant: "destructive",
            });
            setBrandDnaState("analyzed");
        }
    };

    const handleUseBrandPrompt = (prompt: string) => {
        onPromptSelect(prompt);
        toast({
            title: "Prompt Applied!",
            description: "Your brand-personalized prompt is ready to use.",
        });
    };

    return (
        <div className="px-3 sm:px-4 md:px-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6"
            >
                {/* Collapsed State - Always visible bar */}
                <div
                    className={`cursor-pointer rounded-lg border border-[#D3C7B9]/40 bg-gradient-to-r from-[#D3C7B9]/10 to-[#A89584]/5 transition-all duration-300 ${brandDnaExpanded ? "shadow-md" : "hover:shadow-sm"
                        }`}
                    onClick={() => setBrandDnaExpanded(!brandDnaExpanded)}
                >
                    <div className="flex items-center justify-between p-3 sm:p-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-zinc-900">
                                <Dna className="h-4 w-4 text-[black]" />
                                Get Suggested Products for Your Brand
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                                A sneak peek of how Genpire designs using your brand’s style.
                            </p>
                        </div>
                        <div
                            className="flex items-center gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                setBrandDnaExpanded(true);
                            }}
                        >
                            {brandDnaExpanded ? (
                                <ChevronUp className="h-5 w-5 text-zinc-600" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-zinc-600" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {brandDnaExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 rounded-lg border border-[#D3C7B9]/30 bg-white p-4 sm:p-6 shadow-sm"
                    >
                        {/* Idle/Open State - URL Input */}
                        {brandDnaState === "idle" && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                                        <Link className="h-4 w-4 text-[Black]" /> Add Your Online
                                        Store URL
                                    </h3>
                                    <p className="text-xs text-zinc-600 mt-1">
                                        Genpire will learn your brand's style and product
                                        directions.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand-url" className="text-sm text-zinc-700">
                                        Brand URL
                                    </Label>
                                    <Input
                                        id="brand-url"
                                        type="url"
                                        placeholder="https://"
                                        value={brandUrl ?? activedna?.website_url ?? ""}
                                        onChange={(e) => setBrandUrl(e.target.value)}
                                        className="border-[#D3C7B9]/40 focus:border-[#A89584]"
                                    />
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => handleAnalyzeBrand()}
                                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
                                    disabled={!brandUrl.trim() || loadingCreativeDirectorPrompts}
                                >
                                    Suggest On-Brand Products
                                </Button>

                                <p className="text-xs text-zinc-500 text-center">
                                    We analyze only public product info. No private data accessed.
                                </p>
                            </div>
                        )}

                        {/* Loading State */}
                        {brandDnaState === "loading" && (
                            <div className="space-y-4 py-6">
                                <div className="text-center">
                                    <h3 className="text-sm font-medium text-zinc-900 mb-2">
                                        Analyzing your catalog…
                                    </h3>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2">
                                    {[
                                        "Extracting Materials…",
                                        "Learning Your Style…",
                                        "Identifying Color & Trends…",
                                        "Understanding Bestseller Patterns…",
                                    ].map((tag, idx) => (
                                        <motion.span
                                            key={tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
                                            transition={{
                                                duration: 1.5,
                                                delay: idx * 0.3,
                                                repeat: Infinity,
                                            }}
                                            className="px-3 py-1 text-xs rounded-full bg-[#D3C7B9]/20 text-zinc-700 border border-[#D3C7B9]/30"
                                        >
                                            {tag}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Post-Analysis State */}
                        {brandDnaState === "analyzed" && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                                        <Link className="h-4 w-4 text-[Black]" /> Your Brand is
                                        Synced
                                    </h3>
                                    <p className="text-xs text-zinc-600 mt-1">
                                        Genpire will suggest you three products to create
                                    </p>
                                </div>

                                {/* URL input visible in analyzed state so user can update it before regenerating */}
                                <div className="space-y-2">
                                    <Label htmlFor="brand-url-analyzed" className="text-xs text-zinc-700">
                                        Brand URL
                                    </Label>
                                    <Input
                                        id="brand-url-analyzed"
                                        type="url"
                                        placeholder="https://"
                                        value={brandUrl}
                                        onChange={(e) => setBrandUrl(e.target.value)}
                                        className="border-[#D3C7B9]/40 focus:border-[#A89584] text-xs"
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-zinc-700 mb-2">
                                        Suggested product ideas for your brand:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {suggestedBrandPrompts.map((promptObj, idx) => (
                                            <Card
                                                key={idx}
                                                className="cursor-pointer hover:shadow-md transition-shadow border-[#D3C7B9]/30"
                                                onClick={() => handleUseBrandPrompt(promptObj.prompt)}
                                            >
                                                <CardContent className="p-3 space-y-2">
                                                    <h4 className="text-xs font-semibold text-zinc-900">
                                                        {promptObj.title}
                                                    </h4>
                                                    <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                                                        {promptObj.prompt}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRegeneratePrompts()}
                                            disabled={
                                                !isPro &&
                                                typeof remainingRegenerations === "number" &&
                                                remainingRegenerations <= 0
                                            }
                                            className="text-xs"
                                        >
                                            {isPro
                                                ? "Regenerate"
                                                : `Regenerate (${remainingRegenerations} left)`}
                                        </Button>

                                        {!isPro &&
                                            typeof remainingRegenerations === "number" &&
                                            remainingRegenerations <= 0 && (
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => router.push("/pricing")}
                                                    className="text-xs"
                                                >
                                                    Upgrade to Pro
                                                </Button>
                                            )}
                                    </div>
                                    <p className="text-xs text-zinc-500 text-center sm:text-right max-w-xs">
                                        Pro Plan unlocks enhanced Brand DNA with contextual
                                        integrations that will function as your own AI creative
                                        director
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Regenerations Reached 0 / Limit State */}
                        {brandDnaState === "limit-reached" && (
                            <div className="space-y-4 py-6">
                                <div>
                                    <p className="text-xs font-medium text-zinc-700 mb-3">
                                        Suggested product ideas for your brand:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 opacity-50">
                                        {suggestedBrandPrompts.map((promptObj, idx) => (
                                            <Card key={idx} className="border-[#D3C7B9]/30">
                                                <CardContent className="p-3 space-y-2">
                                                    <h4 className="text-xs font-semibold text-zinc-900">
                                                        {promptObj.title}
                                                    </h4>
                                                    <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                                                        {promptObj.prompt}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {getCreatorCredits?.membership != "pro" && (
                                    <div className="text-center space-y-3 pt-4">
                                        <div className="flex items-center justify-center gap-2 text-zinc-900">
                                            <Lock className="h-5 w-5" />
                                            <p className="text-sm font-medium">
                                                Your Personal AI Creative Director Is Locked
                                            </p>
                                        </div>
                                        <p className="text-xs text-zinc-600">
                                            Upgrade to Pro to unlock unlimited brand-personalized
                                            suggestions and full Brand DNA creation.
                                        </p>
                                        <Button
                                            type="button"
                                            className="bg-zinc-900 hover:bg-zinc-800 text-white"
                                            onClick={() => router.push("/pricing")}
                                        >
                                            Upgrade to Pro
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}


