import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Design a Fashion Collection With No Experience",
  description:
    "New to fashion? This guide shows how to design a full collection using Genpire—visuals, specs, and tech packs without the learning curve.",
  keywords:
    "fashion collection no experience, Genpire fashion design, fashion tech packs, beginner fashion design, AI fashion tools",
};

export default function FashionCollectionNoExperiencePage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Fashion Design</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Oct 1, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>7 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              How to Design a Fashion Collection With No Experience
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                You can design a collection without formal training. <strong>Genpire</strong> guides you from idea to
                factory-ready packs, so you can launch faster.
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
              Use <strong>Genpire</strong> to ideate looks, refine details, and export tech packs for each piece. Then
              submit to suppliers for quotes and samples.
            </p>
          </section>

          {/* Beginner-Friendly Plan */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">A Beginner-Friendly Plan</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Define your vibe:</strong> 6–8 looks, core colors, materials.
              </li>
              <li>
                <strong>Generate designs:</strong> prompt or sketch each piece; create variations.
              </li>
              <li>
                <strong>Edit for cohesion:</strong> align trims, palette, and silhouettes.
              </li>
              <li>
                <strong>Create tech packs:</strong> one per SKU with measurements and callouts.
              </li>
              <li>
                <strong>Source quotes:</strong> compare MOQs, costs, lead times.
              </li>
              <li>
                <strong>Sample and refine:</strong> iterate fast; lock the collection.
              </li>
            </ol>
          </section>

          {/* Tips for First Drop */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Tips for Your First Drop</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Start with heroes:</strong> hoodie, tee, one accessory.
              </li>
              <li>
                <strong>Limit colorways:</strong> optimize sizing.
              </li>
              <li>
                <strong>Share previews:</strong> collect demand.
              </li>
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Launch your first collection using Genpire’s beginner-friendly workflow
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: What if I can’t draw?</p>
                <p className="text-zinc-900/80">Prompts are enough — edit the AI results.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: How many styles should I start with?</p>
                <p className="text-zinc-900/80">3–6 pieces is a smart first drop.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Can I reuse a tech pack?</p>
                <p className="text-zinc-900/80">Yes — duplicate, tweak measurements, and re-export.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
