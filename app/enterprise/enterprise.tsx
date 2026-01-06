"use client"
import React, { useState } from "react";
import {
    ArrowRight,
    CheckCircle,
    Zap,
    Users,
    FileText,
    Globe,
    Layers,
    Clock,
    ShieldCheck,
    Layout,
    Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { AuthModal } from "@/components/auth/auth-modal";
import { LandingFooter } from "@/components/landing-footer";
import { LandingNavbar } from "@/components/landing-navbar";

const Section = ({ id, eyebrow, title, subtitle, children, className = "" }: any) => {
    return (
        <section id={id} className={`relative w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16 ${className}`}>
            <div className="mx-auto max-w-7xl">
                {eyebrow && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-6 text-center"
                    >
                        <span
                            className="inline-flex px-4 py-2 gap-2 text-sm font-medium text-black border border-stone-300 rounded-full backdrop-blur-sm"
                            style={{ backgroundColor: "#D2C8BC", borderColor: "#1C1917" }}
                        >
                            {eyebrow}
                        </span>
                    </motion.div>
                )}
                {title && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl tracking-tight text-stone-900 sm:text-4xl lg:text-5xl mb-6 font-semibold">
                            {title}
                        </h2>
                        {subtitle && <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
                    </motion.div>
                )}
                {children}
            </div>
        </section>
    );
};

export default function EnterprisePage() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* SEO Metadata would be handled by Next.js layout or dedicated Head component, but for this file structure we assume layout wrapper */}
            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden hero-gradient ">
                <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-8"
                        >
                            <span className="inline-flex px-4 py-2 text-sm font-medium text-stone-800 bg-stone-100 border border-stone-200 rounded-full">
                                Genpire for Enterprise
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold text-stone-900 mb-6 tracking-tight leading-tight"
                        >
                            AI-Native Product Creation for Modern Brands
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-stone-600 leading-relaxed mb-10 max-w-3xl mx-auto"
                        >
                            Genpire gives enterprise design and product teams an AI-powered workspace to create, develop, and prepare products for manufacturing—across apparel, footwear, accessories, home goods, and more.
                            <br className="hidden md:block" /> Upload your brand DNA, generate on-brand concepts, refine them in our AI editor, and export factory-ready files in minutes.
                        </motion.p>
                        <Button
                            size="lg"
                            variant={"default"}
                            className="rounded-xl h-12 px-8 text-lg"
                            onClick={() => window.location.href = "https://calendly.com/adam-genpire/30min?month=2025-12"}
                        >
                            Book a Demo
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Separator */}
            <div className="w-full h-px bg-stone-200" />

            {/* Before vs After Section */}
            <Section
                className="bg-stone-50/50"
                eyebrow={
                    <>
                        <Layers className="ml-2 h-4 w-4" />
                        Workflow Transformation
                    </>
                }
                title="From Fragmented to Unified"
            >
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Before Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-stone-300" />
                        <div className="mb-6">
                            <div className="h-12 w-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
                                <Clock className="h-6 w-6 text-stone-500" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900">Before Genpire</h3>
                        </div>
                        <p className="text-stone-600 text-lg leading-relaxed">
                            Designers, tech-pack creators, and product developers work across scattered tools, long cycles, and manual handoffs. The process is slow, prone to errors, and disconnected.
                        </p>
                        <div className="mt-8 flex gap-2">
                            <span className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-md">Scattered Tools</span>
                            <span className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-md">Manual Entry</span>
                            <span className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-md">Long Cycles</span>
                        </div>
                    </motion.div>

                    {/* After Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-stone-900 rounded-2xl p-8 border border-stone-800 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-stone-500" />

                        <div className="mb-6 relative z-10">
                            <div className="h-12 w-12 rounded-xl bg-stone-800 flex items-center justify-center mb-4">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">After Genpire</h3>
                        </div>
                        <p className="text-stone-300 text-lg leading-relaxed relative z-10">
                            One AI-native system that creates concepts, develops the product, and produces factory-ready outputs—cutting weeks of work into hours. An integrated workflow from DNA to delivery.
                        </p>
                        <div className="mt-8 flex gap-2 relative z-10">
                            <span className="px-3 py-1 bg-stone-500/40 border border-stone-800 text-stone-200 text-sm rounded-md">Unified System</span>
                            <span className="px-3 py-1 bg-stone-500/40 border border-stone-800 text-stone-200 text-sm rounded-md">Automated AI</span>
                            <span className="px-3 py-1 bg-stone-500/40 border border-stone-800 text-stone-200 text-sm rounded-md">Instant Results</span>
                        </div>
                    </motion.div>
                </div>
            </Section>

            {/* Separator */}
            <div className="w-full h-px bg-stone-200" />

            {/* Benefits Section */}
            <Section
                eyebrow={
                    <>
                        <ShieldCheck className="ml-2 h-4 w-4" />
                        Enterprise Grade
                    </>
                }
                title="Trusted by teams building faster, smarter, and at scale"
            >
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: <Clock className="h-6 w-6" />,
                            title: "Accelerate timelines",
                            description: "Speed up design-to-sample processes by 10x with automated generation."
                        },
                        {
                            icon: <Users className="h-6 w-6" />,
                            title: "Reduce dependency",
                            description: "Minimize reliance on external experts and costly agencies."
                        },
                        {
                            icon: <Layout className="h-6 w-6" />,
                            title: "Centralize files",
                            description: "A single source of truth for creation, development & production assets."
                        },
                        {
                            icon: <CheckCircle className="h-6 w-6" />,
                            title: "Maintain consistency",
                            description: "Ensure brand identity is perfect with trained AI Brand DNA models."
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="h-12 w-12 rounded-lg bg-stone-50 group-hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors mb-4">
                                {item.icon}
                            </div>
                            <h3 className="font-semibold text-lg text-stone-900 mb-2">{item.title}</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* CTA Footer Section */}
            <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
                <div className="relative mx-auto max-w-4xl px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Book an Enterprise Demo</h2>
                    <p className="text-stone-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        See how Genpire transforms your product creation workflow end to end.
                    </p>
                    <Button
                        size="lg"
                        className="rounded-xl h-14 px-8 text-lg bg-white text-black hover:bg-stone-100 transition-colors shadow-xl"
                        onClick={() => window.location.href = "https://calendly.com/adam-genpire/30min?month=2025-12"}
                    >
                        Book a Demo
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>

            <LandingFooter />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                defaultTab="signup"
            />
        </div>
    );
}
