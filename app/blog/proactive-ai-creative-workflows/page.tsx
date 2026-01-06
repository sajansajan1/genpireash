import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proactive AI in Creative Workflows: Keeping Momentum Without Friction",
  description:
    "How proactive AI supports creative workflows by maintaining context, anticipating next steps, and reducing friction between design, product, and manufacturing teams.",
  keywords: "proactive AI, creative workflows, design continuity, product development, Genpire",
};

export default function ProactiveAICreativeWorkflowsPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Creative</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 21, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>8 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Proactive AI in Creative Workflows: Keeping Momentum Without Friction
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
              Creative work rarely breaks down because of lack of talent.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              It breaks down because of fragmentation. Ideas start strong, designs evolve thoughtfully, and then
              momentum fades somewhere between tools, files, and teams. Design lives in one system. Specifications live
              in another. Manufacturing feedback arrives later, disconnected from the original intent.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Each handoff introduces friction. Traditional creative tools are not built to manage continuity. They
              excel at individual tasks but struggle to maintain context across a workflow. As a result, teams spend an
              increasing amount of time coordinating rather than creating.
            </p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Proactive AI addresses this problem by shifting how workflows are supported.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of treating design, specification, and production as isolated phases, proactive AI treats them as
              a continuous process. It understands where a product is, what decisions have already been made, and what
              needs to happen next.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Supporting Momentum</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Rather than waiting for instructions, proactive AI actively supports momentum. It surfaces missing
              information, suggests next steps, and prepares downstream outputs as work progresses.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              In practice, this means fewer stalls. Designers don’t need to pause to ask what documentation should exist
              at a given stage. Product teams don’t have to manually check whether specs are complete enough to move
              forward. Manufacturing teams don’t receive work that still needs interpretation.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">The system carries context forward.</p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              At Genpire, proactive AI is embedded directly into creative workflows. As designs evolve, specifications
              evolve alongside them. Tech packs are not treated as a final task — they are continuously shaped as part
              of the creative process.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This reduces the cognitive load on teams. Instead of tracking dependencies and requirements manually,
              people focus on decisions that require human judgment.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">Momentum becomes the default state.</p>
          </section>

          {/* Callout */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Creative workflows benefit not because work moves faster, but because it moves more smoothly. Fewer
              interruptions mean fewer mistakes. Fewer mistakes mean less rework. Less rework means more time for actual
              creative and strategic thinking.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Proactive AI does not replace collaboration. It improves it by ensuring everyone works from the same
              evolving context.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              In modern product creation, maintaining momentum is not about speed. It’s about continuity. Proactive AI
              helps creative workflows preserve that continuity from concept to factory-ready product.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Enable Proactive Creative Workflows</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
