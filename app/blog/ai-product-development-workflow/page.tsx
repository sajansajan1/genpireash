import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Streamlining Product Development with AI Workflows | Genpire Blog",
  description:
    "See how AI-driven workflows can speed up product development for DTC startups, integrating idea generation, design, and manufacturing into one smooth process.",
  keywords: "AI workflow, product development, DTC startups, streamlined design, manufacturing integration",
};

export default function AIProductDevelopmentWorkflowPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Industry Trends</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 20, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>7 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Streamlining Product Development with AI Workflows
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
              For a lean startup or indie brand, speed and agility are everything. Product development, however,
              involves many moving parts – concept brainstorming, design, prototyping, and finally manufacturing.
              Traditionally, each step was handled with separate tools and teams, causing delays and information gaps.
              AI workflows change the game. By integrating all stages into one smooth process, AI platforms like Genpire
              let you go from idea to product much faster and with fewer hiccups.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Connected Workflow</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Imagine brainstorming a product idea and immediately having AI help flesh it out into a design, then
              automatically generating the technical specs needed for production. In an AI-driven workflow, all these
              steps flow seamlessly:
            </p>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-3 mb-6">
              <li>
                <strong>Idea Generation:</strong> AI analyzes your concept and market data to suggest improvements or
                complementary features.
              </li>
              <li>
                <strong>Design & Prototyping:</strong> The same platform creates visual mockups or 3D renders of your
                product, iterating quickly on your feedback.
              </li>
              <li>
                <strong>Technical Specifications:</strong> Once you approve a design, AI produces a factory-ready tech
                pack with all measurements and materials detailed.
              </li>
              <li>
                <strong>Manufacturer Handoff:</strong> With one click, share the complete spec with potential factories,
                confident nothing gets lost in translation.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Because each phase is connected, you eliminate the usual friction of transferring data between different
              tools or experts. The result is a drastically shortened development cycle. DTC founders and brand teams
              can move from concept to manufacturing in weeks instead of months, staying ahead of the competition. In
              short, you spend more time innovating and less time babysitting processes.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Ready to streamline your product development? Give Genpire a try and experience an AI-driven workflow that
              takes you from idea to finished product, step by step, all in one place.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Try Genpire's Workflow</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
