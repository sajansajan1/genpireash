import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genpire vs Illustrator: Which Works Better for Tech Packs?",
  description:
    "Illustrator is precise but manual. Genpire automates visuals and tech packs. See which tool is best for factory handoff and speed.",
  keywords: "Genpire vs Illustrator, tech packs, AI design, Illustrator for tech packs, Genpire AI, fashion tech packs",
};

export default function GenpireVsIllustratorPage() {
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
              Genpire vs Illustrator: Which Works Better for Tech Packs?
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                Illustrator is great for artwork; <strong>Genpire</strong> is better for complete tech packs and
                production speed. Use both if you need advanced graphics.
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
              For tech packs, <strong>Genpire</strong> is faster because it auto-generates measurements, callouts, and
              construction details. Illustrator requires manual setup or templates and is best kept for vector graphics
              and logos.
            </p>
          </section>

          {/* Side-by-Side Comparison */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Side-by-Side Comparison</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Setup time:</strong> Genpire minutes; Illustrator hours per pack.
              </li>
              <li>
                <strong>Outputs:</strong> Genpire pack + visuals; Illustrator artwork + manual spec sheets.
              </li>
              <li>
                <strong>Factory readiness:</strong> Genpire includes annotations and POMs by default.
              </li>
            </ul>
          </section>

          {/* Practical Hybrid Workflow */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Practical Hybrid Workflow</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                Create the design and tech pack in <strong>Genpire</strong>.
              </li>
              <li>Import Illustrator vectors for labels/prints if needed.</li>
              <li>Export a single, clean pack to suppliers.</li>
            </ol>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Generate your next tech pack in minutes with Genpire
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: Can I embed Illustrator art in Genpire?</p>
                <p className="text-zinc-900/80">Yes — attach or reference vector assets in the pack.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: Which saves more time?</p>
                <p className="text-zinc-900/80">Genpire — especially across multiple SKUs.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Do suppliers prefer one format?</p>
                <p className="text-zinc-900/80">They prefer clarity — complete specs, not a specific app.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
