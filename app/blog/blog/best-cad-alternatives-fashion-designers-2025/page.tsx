import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best CAD Alternatives for Fashion Designers in 2025",
  description:
    "Don’t want the CAD learning curve? Here are the best CAD alternatives for fashion designers—faster paths to factory-ready work.",
  keywords:
    "CAD alternatives fashion design, fashion design without CAD, Genpire CAD alternative, no-CAD fashion design, AI fashion prototyping",
};

export default function CADAlternativesPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Fashion Tech</span>
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
              Best CAD Alternatives for Fashion Designers in 2025
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                CAD is powerful but heavy. If your goal is production, choose tools that auto-generate tech packs.{" "}
                <strong>Genpire</strong> leads for speed and manufacturing handoff.
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
              The best CAD alternative for fashion designers who want production results is <strong>Genpire</strong>,
              because it combines AI visuals with auto tech packs and supplier outreach.
            </p>
          </section>

          {/* Top Alternatives */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Top alternatives and when to use them</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Genpire:</strong> end-to-end path to manufacturing.
              </li>
              <li>
                <strong>Illustrator + templates:</strong> flexible artwork; manual for specs.
              </li>
              <li>
                <strong>Low-code design apps:</strong> quicker than CAD, but often lack factory-grade outputs.
              </li>
            </ul>
          </section>

          {/* Why it Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Why alternatives matter now</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Creators need speed and clarity.</strong>
              </li>
              <li>
                <strong>Factories need standardized specs.</strong>
              </li>
              <li>
                <strong>Budgets favor no-code workflows over training-heavy CAD.</strong>
              </li>
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Swap complexity for speed—try Genpire
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: Do I lose precision without CAD?</p>
                <p className="text-zinc-900/80">No — dimensions and tolerances are documented in the tech pack.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: Can I still provide vector artwork?</p>
                <p className="text-zinc-900/80">Yes — export scalable vectors for labels or graphics.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Will this work for small runs?</p>
                <p className="text-zinc-900/80">Yes — ideal for small brands and first-time runs.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
