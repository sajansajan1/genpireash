import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proactive AI in Manufacturing: Solving Problems Before Production",
  description:
    "How proactive AI prepares clearer, factory-ready outputs earlier and reduces delays caused by incomplete specifications.",
  keywords: "proactive AI, manufacturing, factory readiness, production specs, Genpire",
};

export default function ProactiveAIManufacturingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      <article className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center text-zinc-900 hover:text-zinc-900/80 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Manufacturing</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 21, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>6 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Proactive AI in Manufacturing: Solving Problems Before Production
            </h1>
          </div>

          {/* Share */}
          <div className="flex justify-end mb-12">
            <Button variant="outline" size="sm" className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>

          {/* Article Content */}
          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Manufacturing issues rarely originate on the factory floor.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              They originate upstream, in incomplete or unclear information.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Missing measurements, vague construction notes, inconsistent materials — these gaps force manufacturers to
              pause, clarify, and wait. Each interruption adds cost and erodes trust.
            </p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Proactive AI addresses this problem by changing when readiness is achieved.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of assembling factory-ready documentation at the end of the process, proactive AI builds it
              gradually. As products evolve, specifications improve continuously. Gaps are identified early, when
              they’re easier to fix.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Factory Readiness as a Process</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This creates a different experience for manufacturers.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of receiving documents that require interpretation, manufacturers receive structured, aligned
              information that reflects real production needs. Conversations shift from “what’s missing?” to “how do we
              optimize?”
            </p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              At Genpire, proactive AI supports manufacturing by treating readiness as a process, not a milestone.
              Factory-ready outputs aren’t rushed together — they’re shaped alongside the product itself.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This reduces back-and-forth, speeds up sampling, and leads to more predictable timelines.
            </p>
          </section>

          {/* Callout */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Manufacturing expertise remains essential. Proactive AI doesn’t replace it — it ensures that expertise is
              applied earlier, where it has the greatest impact.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Prepare Factory-Ready Outputs</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
