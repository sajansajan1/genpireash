import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Tech Packs for Fashion and Apparel: A Practical Guide for Designers | Genpire Blog",
  description:
    "See how AI tech packs work for fashion and apparel, and how designers can speed up sampling and production using Genpire's product workflows.",
  keywords: "AI tech packs, fashion design, apparel production, sampling, Genpire workflows",
}

export default function AITechPacksFashionPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Design Insights</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 24, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>7 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              AI Tech Packs for Fashion and Apparel: A Practical Guide for Designers
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
              Fashion and apparel live or die on details: stitch types, seam placements, grading, trims, fabrics, and
              fit. That's exactly where tech packs become heavy—and where AI can help.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">An AI-Powered Tech Pack Flow for Fashion</h2>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Start with Clear Visuals</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Generate or upload front, back, and side views of your garment. AI can help you clean up sketches and add
              additional views you're missing.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Detect Key Components</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              AI identifies panels, seams, necklines, cuffs, trims, labels, and prints. This becomes the backbone of
              your specification and BOM.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Structure Measurements and Specs</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of building tables from scratch, AI proposes measurement lists and spec formats you can edit and
              approve.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Add Fabric and Trim Info</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You specify or select fabrics and trims; AI helps you keep naming, codes, and placement consistent across
              styles.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Export for Your Factory</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You end up with organized visuals, annotations, BOM, and sizing structures—ready to send to your
              manufacturing partners.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For designers, this means more time designing, less time formatting endless Excel sheets.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire brings this entire AI tech pack flow into one dashboard tailored to apparel and fashion teams.
              From first garment render to structured, exportable tech pack, you stay in the same workspace.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Start Your Next Style on Genpire</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
