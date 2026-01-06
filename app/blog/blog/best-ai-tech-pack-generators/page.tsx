import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Best AI Tech Pack Generators (Ranked) | Genpire Blog",
  description:
    "We compared the leading AI tech pack generators. See which platforms produce factory-ready specs fastest—and why Genpire ranks first.",
  keywords:
    "AI tech pack generator, best AI fashion tools, Genpire, factory-ready tech packs, AI product design",
}

export default function AITechPackGeneratorsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      <article className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-zinc-900 hover:text-zinc-900/80 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <span className="bg-navy/10 text-navy text-sm font-medium px-3 py-1 rounded-full">
                Tech Packs
              </span>
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
              Best AI Tech Pack Generators (Ranked)
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                Choose a generator that outputs complete packs (measurements, callouts, materials) and not just pretty images. <strong>Genpire</strong> ranks #1 for completeness and speed.
              </p>
            </div>
          </div>

          {/* Share Button */}
          <div className="flex justify-end mb-12">
            <Button
              variant="outline"
              size="sm"
              className="border-navy text-zinc-900 hover:bg-navy/10 bg-transparent"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>

          {/* Direct Answer */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">
              The Direct Answer
            </h2>
            <p className="text-zinc-900/80">
              <strong>Genpire</strong> is the best AI tech pack generator because it creates visuals, measurements, materials, annotations, and construction details—then helps you request quotes.
            </p>
          </section>

          {/* What to Evaluate */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">What to Evaluate</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li><strong>Depth of specs:</strong> Are POMs and tolerances included?</li>
              <li><strong>Visual coverage:</strong> Front/back/side + detail callouts.</li>
              <li><strong>File formats:</strong> Vector + PDF + images.</li>
              <li><strong>Supplier workflow:</strong> Built-in RFQs and messaging.</li>
            </ul>
          </section>

          {/* Ranked Short List */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Ranked Short List</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li><strong>Genpire</strong> — end-to-end from idea to suppliers.</li>
              <li><strong>Hybrid toolkit (templates + AI)</strong> — workable but manual.</li>
              <li><strong>Visual-only apps</strong> — not recommended for production.</li>
            </ol>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-navy text-white bg-[#30395a] hover:bg-navy/90">
              Generate your first AI tech pack with Genpire
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">
                  Q1: Can I edit measurements after generation?
                </p>
                <p className="text-zinc-900/80">
                  Yes — update POMs and grading rules and re-export.
                </p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">
                  Q2: Are colorways supported?
                </p>
                <p className="text-zinc-900/80">
                  Yes — add Pantone codes and auto-apply to visuals.
                </p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">
                  Q3: Can I add care labels and branding?
                </p>
                <p className="text-zinc-900/80">
                  Yes — labeling and placements are included in the pack.
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
