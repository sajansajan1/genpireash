import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Product Design Tools: The Essential Stack for Modern Product Teams | Genpire Blog",
  description:
    "Explore the core AI product design tools modern teams need, from image generation to tech pack automation, and how Genpire ties them together.",
  keywords: "AI product design tools, design stack, tech pack automation, image generation, Genpire",
}

export default function AIProductDesignToolsPage() {
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
              AI Product Design Tools: The Essential Stack for Modern Product Teams
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
              The modern product team isn't just sketchbooks and CAD anymore. To compete on speed and experimentation,
              you need an AI product design stack that supports both creativity and manufacturing.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Core Tool Layers</h2>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Concept Generation</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Text-to-image and sketch-to-image models that turn prompts into product visuals. Great for exploring
              shapes, colors, and early directions across categories.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Multi-View & Detail Renders</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Tools that generate complete view sets and zoomed-in details, so factories can see stitching, textures,
              and components clearly.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Specification & Tech Pack Automation</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              AI that takes visuals and structured inputs and produces measurement tables, BOMs, and labeled callouts in
              a consistent format.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Brand Context / Brand DNA</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              A system that learns from your existing products so new designs stay on-brand—silhouettes, palettes, and
              construction logic included.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Collaboration & Handoff</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              A place where designers, product managers, and factories can all align on a single product file instead of
              scattered PDFs and screenshots.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The real magic happens when these tools are not separate tabs, but one continuous flow.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire is built as that unified AI product design stack: concept, views, tech packs, and brand context in
              one platform. No stitching together five tools and losing data between them.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Upgrade Your Team's Stack with Genpire</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
