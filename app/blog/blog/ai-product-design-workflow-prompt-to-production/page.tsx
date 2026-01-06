import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Product Design Workflow: From Prompt to Prototype to Production | Genpire Blog",
  description:
    "See a full AI product design workflow from prompt to prototype to production, and how Genpire manages each step for physical products.",
  keywords: "AI product design workflow, prompt to production, prototype, Genpire, manufacturing",
}

export default function AIProductDesignWorkflowPage() {
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
                <span>8 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              AI Product Design Workflow: From Prompt to Prototype to Production
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
              An effective AI product design workflow doesn't stop at nice images. It has to carry you all the way to
              prototype and production. Here's what a full pipeline looks like:
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Complete Pipeline</h2>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Prompt → First View</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You start with a clear prompt (and optionally reference images). AI generates a strong front view that
              captures the core idea—shape, material feel, style.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Complete Multi-View Set</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You extend that into side, back, top, and perspective views. AI helps ensure consistency across angles so
              factories know exactly what to build.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Close-Ups & Details</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Zoomed-in renders show stitching, textures, seams, hardware, and logos. Each close-up can be linked to
              specific notes or requirements.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Tech Pack Creation</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              AI structures all this into tables and sections: components, measurements, BOM, labeling, and callouts.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 mb-3">Prototype & Feedback Loop</h3>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Once the first sample arrives, you adjust specs and visuals directly in the same AI-powered environment,
              then regenerate updated product files.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of juggling four tools and a dozen PDFs, you stay in one workflow from idea to factory.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire was designed around exactly this journey. Prompt your idea, complete the views, build the tech
              pack, and ship files to your factory—all in one place.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">
                Start Your Prompt-to-Production Workflow
              </Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
