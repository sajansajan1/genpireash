import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Product Design for Physical Products: A Complete Beginner's Guide | Genpire Blog",
  description:
    "Learn how AI product design works for physical products, from prompts to factory-ready files, and how Genpire helps you ship real products faster.",
  keywords: "AI product design, physical products, tech packs, factory-ready, Genpire, product development",
}

export default function AIProductDesignBeginnersGuidePage() {
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
              AI Product Design for Physical Products: A Complete Beginner's Guide
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
              "AI product design" can sound abstract, but at its core it's simple: using AI models to turn ideas into
              concrete, manufacturable products. Instead of starting from a blank page, you start from a prompt, a
              sketch, or your existing tech packs—then let AI generate visuals, multi-view renders, and structured
              technical data you can ship to a factory.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For physical products like apparel, footwear, furniture, toys, or home goods, the key is factory
              readiness. That means clear views (front, side, back, top), detailed close-ups, accurate dimensions, and
              properly formatted tech packs. AI doesn't replace your taste or creativity; it removes the manual,
              repetitive work between your concept and a sample-ready file.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">A Solid AI Product Design Flow</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">A solid AI product design flow usually includes:</p>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-3 mb-6">
              <li>Describing your idea in natural language</li>
              <li>Generating first visuals and refining them</li>
              <li>Completing all product views and close-ups</li>
              <li>Auto-structuring specs, materials, and BOM into a tech pack</li>
            </ol>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of dozens of back-and-forths with designers and factories, you move in a few focused loops.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              With Genpire, you get this end-to-end flow in one place: prompt or sketch in, factory-ready tech pack out.
              If you've ever had a product idea and didn't know how to make it real, Genpire is your shortcut.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Create Your First AI-Designed Product</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
