import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Product Design for Footwear, Home Goods, and More: One Workflow, Many Categories | Genpire Blog",
  description:
    "Learn how one AI product design workflow can support footwear, home goods, toys, and more inside platforms like Genpire.",
  keywords: "AI product design, footwear, home goods, toys, multi-category, Genpire",
}

export default function AIProductDesignManyCategoriesPage() {
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
                <span>8 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              AI Product Design for Footwear, Home Goods, and More: One Workflow, Many Categories
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
              One of the most exciting parts of AI product design is that the same workflow can power many categories:
              footwear, apparel, furniture, toys, home goods, sports gear, and more.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Core Steps Stay Similar</h2>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Describe the Use Case</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Running sneakers vs. lounge slippers. Kids' room lamp vs. hotel lighting. The prompts change, but the
              structure is the same.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Generate and Refine Visuals</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You explore shapes, materials, and colorways that fit each category's constraints—flexibility for
              footwear, safety for home goods, etc.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Build Multi-View Sets</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Front, side, back, top, bottom views plus close-ups for hardware, textures, and functional parts.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Structure Tech Packs</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Regardless of category, factories need components, materials, and measurements clearly laid out.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Because AI handles a lot of the heavy lifting, your team can focus on category-specific insight:
              ergonomics for footwear, durability for home goods, compliance for kids' products.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire is intentionally multi-category. Whether you're designing sneakers, candles, chairs, or toys, the
              same AI-native flow takes you from idea to tech pack.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">
                Bring Your Next Product Line into Genpire
              </Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
