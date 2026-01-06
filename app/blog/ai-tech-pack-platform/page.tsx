import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Tech Pack Platform | Faster Factory-Ready Workflows",
    description:
        "Learn how an AI tech pack platform replaces manual PDFs and spreadsheets with faster, clearer, factory-ready product specifications.",
    keywords: "AI tech pack platform, future of manufacturing, product workflows, Genpire platform, factory-ready specs",
};

export default function AITechPackPlatformPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <LandingNavbar />

            <article className="py-16 bg-white">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="mb-8">
                        <Link href="/blog" className="inline-flex items-center text-zinc-900 hover:text-zinc-900/80 mb-6">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Blog
                        </Link>

                        <div className="flex items-center gap-4 mb-4">
                            <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Platform</span>
                            <div className="flex items-center text-sm text-zinc-900/60">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Dec 22, 2025</span>
                            </div>
                            <div className="flex items-center text-sm text-zinc-900/60">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>7 min read</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
                            AI Tech Pack Platform: The Future of Product Manufacturing
                        </h1>
                    </div>

                    <div className="flex justify-end mb-12">
                        <Button variant="outline" size="sm" className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Article
                        </Button>
                    </div>

                    <section className="mb-12">
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            Traditional tech packs were never designed for modern product creation. Static PDFs can’t keep up with constant design changes, multiple stakeholders, and the need for fast iteration. An AI tech pack platform introduces a completely new way to manage product development.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Intelligent Systems, Not Documents</h2>
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            Instead of treating tech packs as documents, AI platforms treat them as intelligent systems. Visuals, measurements, materials, construction logic, and production notes are generated and maintained in one unified environment. Any update instantly reflects across the entire product, ensuring everyone works from a single source of truth.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Context Awareness and Validation</h2>
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            What truly sets AI tech pack platforms apart is context awareness. The platform understands product categories, manufacturing constraints, sizing rules, and material behavior. It doesn’t just store information—it actively helps create, validate, and optimize it for real-world production.
                        </p>
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            This results in faster sampling, fewer production mistakes, and the ability to scale product creation without scaling headcount. Factories receive clearer specs, and brands gain confidence that what’s designed can actually be manufactured.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-xl mb-12">
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            Build products on an AI tech pack platform with Genpire and experience a smarter path to the factory floor.
                        </p>
                        <div className="text-center mt-6">
                            <Button className="bg-black text-white hover:bg-black/90">Try Genpire Platform</Button>
                        </div>
                    </section>
                </div>
            </article>

            <LandingFooter />
        </div>
    );
}
