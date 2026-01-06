import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI in Manufacturing Collaboration: Connecting Designers, Tech Packs, and Factories | Genpire Blog",
  description:
    "Learn how AI improves collaboration between designers and factories by creating clearer tech packs and workflows, powered by platforms like Genpire.",
  keywords: "AI manufacturing collaboration, designers, factories, tech packs, Genpire workflows",
}

export default function AIManufacturingCollaborationPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Manufacturing</span>
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
              AI in Manufacturing Collaboration: Connecting Designers, Tech Packs, and Factories
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
              A big source of friction in manufacturing isn't the idea—it's the handoff. Designers work one way,
              factories need something else, and product managers sit in the middle translating. AI can be the glue
              between these worlds.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How AI Improves Collaboration</h2>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Clearer Visuals</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              AI-generated multi-view images and zoom-ins give factories unambiguous references. Less guessing, fewer
              "Can you clarify this?" emails.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Standardized Tech Packs</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              AI can enforce consistent sections, tables, and labels across products, so factories instantly know where
              to find what they need.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Faster Iterations</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              When a factory requests changes (e.g., tolerance adjustments, alternate materials), you update the data
              once and regenerate updated tech packs automatically.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Shared Source of Truth</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of scattered PDFs, everyone looks at a single AI-generated product record: designers, product
              managers, and factory partners.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The result is fewer mistakes, fewer delays, and more trust in your product pipeline.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire is the place where designers and manufacturers meet around AI-generated product files. You create
              and refine products in Genpire, then share clear, consistent outputs with your factories.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Start Managing Your Product Roundtrips</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
