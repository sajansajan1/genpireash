import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "The Future of AI Product Design: Agentic Workflows, Live Tech Packs, and Autonomous RFQs | Genpire Blog",
  description:
    "Explore the future of AI product design: agentic workflows, live tech packs, and autonomous RFQs, and how Genpire is building toward it.",
  keywords: "future AI product design, agentic workflows, live tech packs, autonomous RFQs, Genpire",
}

export default function FutureAIProductDesignPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">
                Vision & Strategy
              </span>
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
              The Future of AI Product Design: Agentic Workflows, Live Tech Packs, and Autonomous RFQs
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
              The current wave of AI product design is already powerful, but we're just getting started. The future is
              agentic workflows—AI that doesn't just respond, but takes action on your behalf.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Imagine This</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-3 mb-6">
              <li>You describe a new product line once.</li>
              <li>An AI agent designs multiple options, completes views, and builds tech packs.</li>
              <li>Another agent checks costs, suggests material swaps, and improves margins.</li>
              <li>
                A third agent automatically sends structured RFQs (requests for quotation) to vetted factories and
                compares responses.
              </li>
            </ul>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              On top of that, live tech packs will replace static PDFs. Every update to specs, materials, or views syncs
              automatically across your internal team and factory partners. Everyone sees the same truth in real time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Where AI-Native Platforms Shine</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This is where AI-native platforms shine: threads of context, actions, and data all tied together, not
              scattered between tools.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire is being built with this future in mind—starting with AI-native design and tech packs, and
              expanding into agentic, factory-connected workflows. If you want your product organization to be ready for
              that future, start building products on Genpire today and grow with the platform as we add more agentic
              and manufacturing features.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Start Building on Genpire Today</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
