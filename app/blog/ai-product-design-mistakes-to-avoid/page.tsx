import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Product Design Mistakes to Avoid: Data, Prompts, and Factory Handoffs | Genpire Blog",
  description:
    "Avoid common AI product design mistakes around data, prompts, and factory handoffs and learn how Genpire keeps your workflow grounded and manufacturable.",
  keywords: "AI product design mistakes, prompts, factory handoffs, Genpire, manufacturing workflow",
}

export default function AIProductDesignMistakesPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">How-To Guide</span>
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
              AI Product Design Mistakes to Avoid: Data, Prompts, and Factory Handoffs
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
              AI product design is powerful—but it's not magic. There are common mistakes that can hurt your results or
              frustrate your factories. Here are a few to avoid:
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Common Mistakes to Avoid</h2>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Vague Prompts</h3>
              <p className="text-zinc-900/80 leading-relaxed">
                "Cool sneaker" or "nice chair" isn't enough. Be specific about audience, use case, materials, and style
                references. The better the brief, the better the output.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Ignoring Brand Context</h3>
              <p className="text-zinc-900/80 leading-relaxed">
                If you don't feed AI past products or guidelines, you'll get random styles. Use Brand DNA or similar
                context so outputs feel like your brand.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Stopping at Pretty Images</h3>
              <p className="text-zinc-900/80 leading-relaxed">
                Factories don't manufacture moodboards. If you don't follow through into multi-view renders, close-ups,
                and specs, you'll hit a wall at production.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Skipping Human Review</h3>
              <p className="text-zinc-900/80 leading-relaxed">
                AI tech packs still need a human eye. Measure twice, ship once: review measurements, materials, and
                construction details before sending to your factory.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">Messy Handoffs</h3>
              <p className="text-zinc-900/80 leading-relaxed">
                If you scatter files across email threads, AI's benefits get lost. Keep one structured product record
                and send clean packages.
              </p>
            </div>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire is built to reduce exactly these mistakes. Prompts become structured product flows, Brand DNA
              keeps you consistent, and tech packs keep your factories happy.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Design Your Next Product Inside Genpire</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
