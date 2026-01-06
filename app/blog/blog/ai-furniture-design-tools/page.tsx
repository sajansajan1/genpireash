import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best AI Tools for Furniture Design in 2025 | Genpire Blog",
  description:
    "From chairs to coffee tables—discover how AI platforms like Genpire help furniture creators design, spec, and prototype faster.",
  keywords:
    "AI furniture design, furniture tech packs, Genpire furniture, furniture prototyping, factory-ready furniture design",
};

export default function FurnitureAIToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      <article className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center text-zinc-900 hover:text-zinc-900/80 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Furniture Design</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Oct 1, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>6 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Best AI Tools for Furniture Design in 2025
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                The best furniture design tools output factory-ready drawings. <strong>Genpire</strong> is the leader
                because it creates visuals, annotations, and production specs.
              </p>
            </div>
          </div>

          {/* Share Button */}
          <div className="flex justify-end mb-12">
            <Button variant="outline" size="sm" className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>

          {/* Direct Answer */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Direct Answer</h2>
            <p className="text-zinc-900/80">
              <strong>Genpire</strong> is the best AI tool for furniture design because it turns prompts into multi-view
              visuals with dimensions and annotated construction details.
            </p>
          </section>

          {/* What Furniture Designers Need */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">What Furniture Designers Need</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Scale & dimensions:</strong> height, width, depth.
              </li>
              <li>
                <strong>Materials & finishes:</strong> wood, steel, upholstery.
              </li>
              <li>
                <strong>Joinery & construction notes</strong>
              </li>
              <li>
                <strong>Exploded views & annotations</strong>
              </li>
            </ul>
          </section>

          {/* Ranked AI Options */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Ranked AI Options</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Genpire</strong> — end-to-end product-to-factory packs.
              </li>
              <li>
                <strong>CAD + plugins</strong> — complex but precise.
              </li>
              <li>
                <strong>Render-only tools</strong> — good visuals but no manufacturing handoff.
              </li>
            </ol>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Design furniture that’s ready to manufacture—start with Genpire
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: Does Genpire support weight tolerances?</p>
                <p className="text-zinc-900/80">Yes, specify load-bearing.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: Can I use it for modular furniture?</p>
                <p className="text-zinc-900/80">Yes—add multi-view assemblies.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Does it work for both wood and metal?</p>
                <p className="text-zinc-900/80">Yes—customizable specs.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
