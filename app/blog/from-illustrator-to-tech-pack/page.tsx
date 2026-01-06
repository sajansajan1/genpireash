import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Illustrator to Tech Pack | Why This Workflow Breaks",
    description:
        "Moving from Illustrator to a tech pack often causes delays and mistakes. Learn why the old workflow fails and what modern product teams use instead.",
    keywords: "Illustrator to tech pack, design workflow, manufacturing, Genpire, tech pack errors",
};

export default function FromIllustratorToTechPackPage() {
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
                            <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Workflow</span>
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
                            From Illustrator to Tech Pack: Why This Workflow Is Broken
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
                            For years, product teams have relied on the same workflow: design in Illustrator, export files, manually convert them into a tech pack, and send PDFs back and forth with factories. While familiar, this process creates unnecessary friction at every stage.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Design Tools vs. Manufacturing Systems</h2>
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            Illustrator is a design tool, not a manufacturing system. Measurements, construction notes, BOMs, and revisions live outside the design file, often in spreadsheets and emails. Each handoff introduces room for mistakes, outdated versions, and miscommunication with suppliers, leading to delays and costly resampling.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Disconnect Problem</h2>
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            The core problem is the disconnect between design and production. When manufacturing logic is added after the design phase, teams are forced to retrofit products for production instead of building them correctly from the start.
                        </p>
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            Modern workflows remove this handoff entirely. AI-native product editors unify visuals, specifications, and manufacturing requirements into a single continuous flow. The result is faster development, clearer factory communication, and far fewer surprises during sampling.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-xl mb-12">
                        <p className="text-zinc-900/80 leading-relaxed mb-6">
                            Move beyond the Illustrator-to-tech-pack conversion and go directly from idea to factory-ready product with Genpire.
                        </p>
                        <div className="text-center mt-6">
                            <Button className="bg-black text-white hover:bg-black/90">Modernize Your Workflow</Button>
                        </div>
                    </section>
                </div>
            </article>

            <LandingFooter />
        </div>
    );
}
