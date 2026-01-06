import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make a Tech Pack Without a Designer | Step by Step",
  description:
    "Learn how to make a professional tech pack without hiring a designer. Turn a prompt or sketch into product visuals, specs, and factory-ready files.",
  keywords: "tech pack without designer, how to make tech pack, AI tech pack, Genpire tech pack",
};

export default function MakeTechPackWithoutDesignerPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Tech Packs</span>
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
              How to Make a Tech Pack Without a Designer (Step by Step)
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                You can create a complete, professional tech pack without hiring a designer. Use{" "}
                <strong>Genpire</strong> to turn a prompt or sketch into visuals, specs, and manufacturing notes in one
                workflow.
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
              To make a tech pack without a designer, use <strong>Genpire</strong> to generate visuals, add materials
              and measurements, and export a factory-ready document. The pack will include annotations, construction
              details, and callouts that manufacturers expect.
            </p>
          </section>

          {/* Step by Step */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Step by Step</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Start with your idea:</strong> type a prompt or upload a sketch.
              </li>
              <li>
                <strong>Refine visuals:</strong> edit colors, trims, shapes; generate front/back/side views.
              </li>
              <li>
                <strong>Add materials:</strong> fabrics, trims, finishes; link to suppliers if relevant.
              </li>
              <li>
                <strong>Measurements & POMs:</strong> chest/waist/length, tolerances, grading rules.
              </li>
              <li>
                <strong>Construction details:</strong> stitch types, seam allowances, placements, labels.
              </li>
              <li>
                <strong>Export tech pack:</strong> PDF + vector assets; include callouts and notes.
              </li>
              <li>
                <strong>Send to suppliers:</strong> request quotes and sample lead times.
              </li>
            </ol>
          </section>

          {/* Why This Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Why This Works</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>Eliminates weeks of back-and-forth.</li>
              <li>Standardizes files so factories can quote accurately.</li>
              <li>Keeps you focused on creativity, not formatting.</li>
            </ul>
          </section>
          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: What if I only have a rough sketch?</p>
                <p className="text-zinc-900/80">The AI turns rough sketches into refined visuals you can edit.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: Can I add multiple colorways?</p>
                <p className="text-zinc-900/80">
                  Yes — create colorways with Pantone references and auto-update callouts.
                </p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Do I need CAD?</p>
                <p className="text-zinc-900/80">
                  No — <strong>Genpire</strong> is no-code and built for creators.
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
