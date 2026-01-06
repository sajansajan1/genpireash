import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI vs Traditional Tech Packs: Speed, Accuracy, and Cost Compared | Genpire Blog",
  description:
    "Compare AI-generated tech packs with traditional methods on speed, accuracy, and cost, and see why brands are moving workflows into Genpire.",
  keywords: "AI tech packs, traditional tech packs, comparison, speed, accuracy, cost, Genpire",
}

export default function AIVsTraditionalTechPacksPage() {
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
                <span>7 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              AI vs Traditional Tech Packs: Speed, Accuracy, and Cost Compared
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
              Tech packs have been built the same way for years: manual tables, copy-pasted images, and lots of human
              formatting. AI-generated tech packs flip that model.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Comparison</h2>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Speed</h3>
              <p className="text-zinc-900/80 leading-relaxed mb-2">
                <strong>Traditional:</strong> Hours to days per tech pack, especially for detailed garments or complex
                products.
              </p>
              <p className="text-zinc-900/80 leading-relaxed">
                <strong>AI:</strong> Minutes to produce a structured first draft from product visuals and basic inputs.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Accuracy</h3>
              <p className="text-zinc-900/80 leading-relaxed mb-2">
                <strong>Traditional:</strong> Accuracy depends on how focused (and tired) your team is. Small mistakes
                creep in easily.
              </p>
              <p className="text-zinc-900/80 leading-relaxed">
                <strong>AI:</strong> Repeatable structure, fewer copy-paste errors, and easier final reviews instead of
                building from zero.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Cost</h3>
              <p className="text-zinc-900/80 leading-relaxed mb-2">
                <strong>Traditional:</strong> Significant design/technical time per SKU; it doesn't scale cheaply.
              </p>
              <p className="text-zinc-900/80 leading-relaxed">
                <strong>AI:</strong> Marginal cost per additional tech pack drops, letting you explore more SKUs without
                linearly increasing cost.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Consistency</h3>
              <p className="text-zinc-900/80 leading-relaxed mb-2">
                <strong>Traditional:</strong> Every tech pack can look slightly different depending on who created it.
              </p>
              <p className="text-zinc-900/80 leading-relaxed">
                <strong>AI:</strong> Standardized layouts, terminology, and formats across your catalog.
              </p>
            </div>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The best setup is hybrid: AI generates, humans review and adjust.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              With Genpire, you don't abandon your standards—you encode them. Genpire generates tech packs based on how
              your brand works, and your team does the final pass.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Switch Your Next Collection to Genpire</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
