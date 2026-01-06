import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Tech Pack Generator: What It Is and When Your Brand Should Use One | Genpire Blog",
  description:
    "Learn what an AI tech pack generator does, when brands should use it, and how Genpire automates production-ready product files.",
  keywords: "AI tech pack generator, production files, brand automation, Genpire, manufacturing specs",
}

export default function AITechPackGeneratorPage() {
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
                <span>6 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              AI Tech Pack Generator: What It Is and When Your Brand Should Use One
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
              A tech pack is the single source of truth for your product: measurements, materials, construction details,
              and visual references all in one file. An AI tech pack generator automates big parts of this process using
              your product visuals and inputs.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of manually copying measurements into tables and writing construction notes, you upload or create
              your product design and let AI:
            </p>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2 mb-6">
              <li>Extract product components</li>
              <li>Propose organized measurement tables</li>
              <li>Suggest BOM structures and materials</li>
              <li>Generate callouts and annotations for factories</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">
              When Should Your Brand Use an AI Tech Pack Generator?
            </h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-3 mb-6">
              <li>When you launch many SKUs and can't keep up with documentation</li>
              <li>When you work with multiple factories and need consistency</li>
              <li>When you want to test more ideas without drowning in manual tech work</li>
              <li>When you're a smaller brand that can't hire a full-time technical designer</li>
            </ul>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The goal isn't to replace experts; it's to give every team a baseline of solid, consistent tech
              documentation that scales with your roadmap.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              In Genpire, every product you design flows naturally into an AI-generated tech pack that you can review,
              edit, and export for your factory. You don't start from a blank Excel file—you refine an AI-built one.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Create Your Next Product on Genpire</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
