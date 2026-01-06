import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI for Brand DNA: Keeping Collections Consistent Across Every Product Line | Genpire Blog",
  description:
    "Discover how AI learns your brand DNA to keep product collections consistent, and how Genpire turns your past products into future-ready context.",
  keywords: "AI brand DNA, consistent collections, brand consistency, Genpire, product lines",
}

export default function AIForBrandDNAPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Branding</span>
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
              AI for Brand DNA: Keeping Collections Consistent Across Every Product Line
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
              As brands scale, one of the hardest challenges is consistency. New designers join, new factories come on
              board, and suddenly your silhouettes, details, or materials feel off-brand. This is where AI-powered Brand
              DNA becomes a real advantage.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              By ingesting your existing tech packs, product images, and style guidelines, AI can learn:
            </p>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2 mb-6">
              <li>Preferred silhouettes, proportions, and construction logic</li>
              <li>Typical materials, finishes, and color palettes</li>
              <li>Labeling, logo placements, and signature details</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Power of Learned Brand DNA</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Once this Brand DNA is learned, every new AI-generated concept can be guided by it. Instead of random
              outputs, you get:
            </p>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2 mb-6">
              <li>On-brand shapes and details by default</li>
              <li>Collections that feel related, not disconnected</li>
              <li>Faster approvals because products "look like you" from day one</li>
            </ul>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Brand DNA also helps with technical consistency: measurement formats, BOM structures, and callouts can
              follow the same patterns across SKUs and seasons.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire's Brand DNA engine is built precisely for this. You upload your existing products and tech packs,
              and Genpire learns how your brand builds things—visually and technically. Then, every new AI-designed
              product is born with that context.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Connect Your Brand Data to Genpire</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
