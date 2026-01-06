import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tech Pack Automation | How AI Eliminates Manual Work",
    description:
        "Tech pack automation helps brands create accurate specifications faster. Reduce back and forth, errors, and spreadsheet-heavy workflows using AI.",
    keywords: "tech pack automation, AI tech pack, product prep, automated tech packs, Genpire automation",
};

export default function TechPackAutomationPage() {
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
                            <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Automation</span>
                            <div className="flex items-center text-sm text-zinc-900/60">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Dec 22, 2025</span>
                            </div>
                            <div className="flex items-center text-sm text-zinc-900/60">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>6 min read</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
                            Tech Pack Automation: How AI Eliminates Manual Product Prep
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
                            For decades, tech packs have been one of the biggest bottlenecks in product creation. Designers and product teams spend countless hours assembling measurements, materials, construction notes, and revisions across disconnected files, emails, and tools. Every update introduces friction, errors, and delays that slow products down before they ever reach the factory.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Tech Pack Automation Changes Everything</h2>
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            Tech pack automation changes this entirely. Instead of manually creating static PDFs, automation turns product preparation into a dynamic, living workflow. Measurements, BOMs, construction details, visuals, and revisions are generated and updated automatically as the product evolves. There’s no need for copy-pasting, version control spreadsheets, or endless clarification emails with manufacturers.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">AI-Powered Context Awareness</h2>
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            AI-powered automation goes further by understanding product context. It applies category rules, sizing logic, and construction standards consistently, reducing human error and increasing production readiness. What once took days or weeks can now be completed in minutes, with far greater clarity for factories.
                        </p>
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            Automation is no longer about speed alone—it’s about accuracy, scalability, and confidence in production outcomes.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-xl mb-12">
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            Create automated, factory-ready products with Genpire and remove manual tech packs from your workflow entirely.
                        </p>
                        <div className="text-center mt-6">
                            <Button className="bg-black text-white hover:bg-black/90">Automate Your Tech Packs</Button>
                        </div>
                    </section>
                </div>
            </article>

            <LandingFooter />
        </div>
    );
}
