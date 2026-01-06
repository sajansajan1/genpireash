import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Design Jewelry with AI (From Idea to Factory) | Genpire Blog",
  description:
    "Learn how to design jewelry pieces using Genpire’s AI workflow—create visuals, add material specs, and generate tech packs for factories.",
  keywords: "AI jewelry design, jewelry tech pack, Genpire jewelry, jewelry prototyping, factory-ready jewelry design",
};

export default function JewelryAIPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Jewelry Design</span>
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
              How to Design Jewelry with AI (From Idea to Factory)
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                You can design jewelry without CAD or a jewelry technician. With <strong>Genpire</strong>, create
                visuals, specs, and a complete tech pack ready for suppliers.
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
              To design jewelry with AI, upload or prompt your idea in <strong>Genpire</strong>, refine shapes and
              finishes, add materials like gold, silver, or gemstones, and export a factory-ready tech pack.
            </p>
          </section>

          {/* Workflow for Jewelry */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Workflow for Jewelry</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Start with inspiration:</strong> sketches or text prompts.
              </li>
              <li>
                <strong>Generate variations:</strong> rings, bracelets, pendants, earrings.
              </li>
              <li>
                <strong>Edit details:</strong> stone settings, clasps, metals, finishes.
              </li>
              <li>
                <strong>Measurements:</strong> mm sizes, weights, tolerances.
              </li>
              <li>
                <strong>Annotations:</strong> plating, hallmarking, materials.
              </li>
              <li>
                <strong>Export pack:</strong> share with jewelry manufacturers.
              </li>
            </ol>
          </section>

          {/* Why Genpire is a Fit */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Why Genpire is a Fit</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>Supports precise dimensions in mm.</li>
              <li>Captures surface finishes (matte, polished, plated).</li>
              <li>Creates supplier-ready docs, not just visuals.</li>
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Turn your jewelry ideas into production samples with Genpire
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: Can Genpire design gemstone settings?</p>
                <p className="text-zinc-900/80">Yes—define cut/size and callouts.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: Do factories accept Genpire packs?</p>
                <p className="text-zinc-900/80">Yes, packs include industry specs.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Can I create multiple sizes?</p>
                <p className="text-zinc-900/80">Yes—add grading and tolerances.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
