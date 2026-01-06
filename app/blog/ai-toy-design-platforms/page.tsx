import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How AI Is Changing Toy Design in 2025 | Genpire Blog",
  description:
    "From plushies to action figures, AI is reshaping toy design. Here’s how Genpire helps create factory-ready toys faster.",
  keywords: "AI toy design, toy prototyping AI, Genpire toys, factory-ready toys, toy design 2025",
};

export default function ToyDesignAIPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Toy Design</span>
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
              How AI Is Changing Toy Design in 2025
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                AI toy design works when you go beyond visuals into specs. <strong>Genpire</strong> auto-generates
                factory-ready packs for plush, plastic, and wooden toys.
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
              Use <strong>Genpire</strong> to design toys by prompting visuals, adding safety requirements, material
              specs, and construction notes, then exporting a full tech pack.
            </p>
          </section>

          {/* Example Toy Workflow */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Example Toy Workflow</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Concept generation:</strong> plush bear, RC car, building set.
              </li>
              <li>
                <strong>Edit details:</strong> size, colors, material safety standards.
              </li>
              <li>
                <strong>Measurements:</strong> child-safe tolerances, age-appropriate specs.
              </li>
              <li>
                <strong>Labels:</strong> CE/ASTM compliance notes.
              </li>
              <li>
                <strong>Export pack:</strong> factories can produce samples directly.
              </li>
            </ol>
          </section>

          {/* Why Genpire Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Why Genpire Matters</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>Supports multi-category toys.</li>
              <li>Embeds safety + compliance annotations.</li>
              <li>Simplifies complex prototyping loops.</li>
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Turn toy concepts into safe, production-ready designs with Genpire
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: Does Genpire add compliance labels?</p>
                <p className="text-zinc-900/80">Yes, you can specify.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: Can I design soft toys?</p>
                <p className="text-zinc-900/80">Yes—add fabric and stuffing specs.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Does it cover child safety standards?</p>
                <p className="text-zinc-900/80">Yes—include in annotations.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
