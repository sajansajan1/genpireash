import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI-Powered Product Collections: Designing and Testing Multiple SKUs from a Single Brief | Genpire Blog",
  description:
    "See how AI turns a single product brief into a full collection of SKUs and how Genpire helps you test and refine them before production.",
  keywords: "AI product collections, multiple SKUs, product brief, testing, Genpire",
}

export default function AIProductCollectionsPage() {
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
              AI-Powered Product Collections: Designing and Testing Multiple SKUs from a Single Brief
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
              Instead of designing one product at a time, imagine starting from a single brief and ending with a full
              collection of SKUs—colorways, variations, and extensions—ready to test. That's what AI-powered product
              collections enable.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How It Works</h2>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Write a Strong Master Brief</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Define your target customer, price point, use case, and aesthetic direction. Think "summer sandals
              collection for urban commuters" rather than "sandals."
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Generate Core Hero Product</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              AI helps you design the main SKU: the anchor of your collection.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Spin Out Variants</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You then generate variations: alternate colors, materials, trims, or small functional changes (e.g., strap
              variations, height changes).
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Evaluate and Cull</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You review the set, keep what feels strongest, and refine tech packs for the shortlist.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Test Before Producing</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You can visualize the whole line for stakeholders or even test concepts with your audience before
              committing to manufacturing.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This lets you behave like a big brand's design team—even if you're small.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire's collection tools are made for this. From one clear brief, you can generate and refine full lines
              of products, each with its own factory-ready tech pack.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Build Your Next Collection in One Shot</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
