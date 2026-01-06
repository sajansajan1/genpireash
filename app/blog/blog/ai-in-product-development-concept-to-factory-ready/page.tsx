import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI in Product Development: From Concept to Factory-Ready in Days | Genpire Blog",
  description:
    "Discover how AI reshapes product development timelines, taking you from concept to factory-ready tech packs in days with platforms like Genpire.",
  keywords: "AI product development, concept to factory, tech packs, product timeline, Genpire",
}

export default function AIInProductDevelopmentPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Industry Trends</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 24, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>8 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              AI in Product Development: From Concept to Factory-Ready in Days
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
              Traditional product development for physical goods can take weeks or months: moodboards, sketch rounds,
              CAD, sampling, revisions, and tech pack clean-up. AI compresses big chunks of that journey into days.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How AI Fits Into Modern Product Development</h2>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Concept Exploration</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You start with simple prompts (or reference images) and let AI generate multiple product directions.
              Instead of redrawing every idea, you quickly see variations in shape, color, and materials.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Design Refinement</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Once you lock onto a direction, AI models help you produce complete product views and high-detail
              close-ups. This drastically reduces back-and-forth with designers or external agencies.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Technical Packaging</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              AI can then structure your visuals, specs, and material choices into tech packs: measurements, BOM, and
              annotations your factories actually understand.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Iteration & Collections</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              When the pipeline is AI-native, creating a second or third SKU is just a variation of prompts and
              parameters—not a full restart.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire was built exactly for this: an AI-native product development flow that turns concepts into
              factory-ready products in days, not months. From first front view to detailed tech pack, everything
              happens inside one dashboard.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">
                Join Genpire and Build Your Next Collection
              </Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
