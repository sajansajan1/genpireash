import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Product Design for Small Brands: How Indie Creators Compete with Enterprise | Genpire Blog",
  description:
    "Discover how small brands and indie creators use AI product design to reach enterprise-level speed and quality with platforms like Genpire.",
  keywords: "AI product design, small brands, indie creators, enterprise competition, Genpire",
}

export default function AIProductDesignSmallBrandsPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Success Stories</span>
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
              AI Product Design for Small Brands: How Indie Creators Compete with Enterprise
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
              For small brands and indie creators, the biggest disadvantage has always been resources. Big companies can
              hire design teams, technical designers, and production managers. You…usually can't. AI product design
              levels that playing field.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">What AI Gives Smaller Players</h2>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Built-in Design Muscle</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You don't need a full design department to explore ideas. You describe your vision; AI generates product
              concepts across colors, categories, and styles.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Technical Expertise on Demand</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              AI-generated tech packs give you professional-looking documentation even if you've never built one before.
              You learn by editing, not starting from a blank template.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Faster Time to Market</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You can move from idea to factory-ready in days, not weeks. That means you can react to trends and test
              ideas more aggressively.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">More Experiments per Dollar</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Because each additional idea is cheaper to explore, you can test multiple directions and only produce what
              resonates.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              In other words, you get enterprise-grade workflows without enterprise headcount.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire was built with these creators in mind: small brands that think big. With Genpire, you create,
              refine, and tech-pack products without needing an entire in-house product team.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Start Building Your Next Hero Product</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
