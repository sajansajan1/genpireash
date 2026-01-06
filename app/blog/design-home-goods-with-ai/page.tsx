import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Design Home Goods with AI (From Kitchen to Decor) | Genpire Blog",
  description:
    "Create household products with AI. Genpire lets you design home goods—from lamps to storage boxes—with specs factories accept.",
  keywords:
    "AI home goods design, kitchen product AI, decor AI design, Genpire home products, factory-ready home goods",
};

export default function HomeGoodsAIPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Home Goods</span>
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
              How to Design Home Goods with AI (From Kitchen to Decor)
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                Home goods design requires clarity. <strong>Genpire</strong> delivers visuals + measurements + specs, so
                factories can prototype fast.
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
              To design home goods with AI, prompt your product idea in <strong>Genpire</strong>, refine details, add
              materials and sizes, and export a factory-ready tech pack.
            </p>
          </section>

          {/* Home Goods Examples */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Home Goods Examples</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Kitchen:</strong> utensils, storage containers, organizers.
              </li>
              <li>
                <strong>Living:</strong> lamps, shelves, decor.
              </li>
              <li>
                <strong>Bath:</strong> towel racks, soap dispensers.
              </li>
            </ul>
          </section>

          {/* Process */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Process</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>Generate visuals from prompts.</li>
              <li>Adjust scale and finishes.</li>
              <li>Add annotations for materials and compliance.</li>
              <li>Export pack for manufacturers.</li>
            </ol>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Design and launch your own home goods collection with Genpire
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: Can Genpire design plastics and ceramics?</p>
                <p className="text-zinc-900/80">Yes, both are supported.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: What about packaging?</p>
                <p className="text-zinc-900/80">Yes—include packaging specs.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Can I design multiple SKUs at once?</p>
                <p className="text-zinc-900/80">Yes—batch workflow supported.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
