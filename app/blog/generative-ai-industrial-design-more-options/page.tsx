import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Generative AI for Industrial Design: Exploring More Options with Less Effort | Genpire Blog",
  description:
    "Learn how generative AI changes industrial design, letting teams explore more product options with less effort using platforms like Genpire.",
  keywords: "generative AI, industrial design, product options, Genpire, design exploration",
}

export default function GenerativeAIIndustrialDesignPage() {
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
                <span>9 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Generative AI for Industrial Design: Exploring More Options with Less Effort
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
              Industrial design has always been about balancing aesthetics, ergonomics, and manufacturability. The
              bottleneck? Exploring enough options without burning all your time and budget. Generative AI changes that
              equation.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of modeling every variation by hand, you can:
            </p>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2 mb-6">
              <li>Describe constraints and goals in natural language</li>
              <li>Generate multiple product directions in minutes</li>
              <li>Quickly test alternate materials, forms, and details</li>
              <li>Filter down to the few concepts worth taking further</li>
            </ul>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This doesn't replace industrial designers. It gives them a bigger playground and a faster path to a
              focused short-list.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Beyond Concept Exploration</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Once you've selected promising directions, AI also helps with:
            </p>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2 mb-6">
              <li>Generating consistent orthographic views</li>
              <li>Producing annotated images for engineering and factories</li>
              <li>Structuring tech packs with components, materials, and specs</li>
            </ul>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You move from "one concept at a time" to "many concepts in parallel," while still ending with real-world
              manufacturable outcomes.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              With Genpire, industrial designers can prompt, refine, and tech-pack physical products—all in one
              AI-native environment. Whether you're designing consumer electronics, furniture, or sports gear, Genpire
              helps you explore options fast and land on factory-ready concepts.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">
                Try Building Your Next Industrial Design Concept
              </Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
