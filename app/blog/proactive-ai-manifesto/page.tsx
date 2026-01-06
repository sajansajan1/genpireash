import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Proactive AI Manifesto: Beyond Reactive Tools",
  description:
    "A deep manifesto on proactive AI systems that anticipate next steps, reduce friction, and move products forward without waiting for prompts.",
  keywords: "proactive AI, AI manifesto, product development AI, Genpire AI",
};

export default function ProactiveAIManifestoPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Manifesto</span>
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
              The Proactive AI Manifesto: Beyond Reactive Tools
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
            <p className="text-zinc-900/80 leading-relaxed mb-6">Most AI tools today are built to react.</p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              They wait for an input, generate an output, and stop. If you want something else, you prompt again. This
              model works well for isolated tasks like writing a paragraph or generating an image. It falls apart when
              applied to real product workflows.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Product creation is not a sequence of prompts. It’s a continuous process that spans design, specification,
              validation, and manufacturing preparation. Each step depends on decisions made earlier, and small gaps
              compound quickly into delays.
            </p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Reactive AI leaves humans to manage that complexity.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Proactive AI starts from a different assumption: progress should not depend on remembering what comes
              next.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              A proactive system understands context — where a product is in its lifecycle, what information exists, and
              what’s missing. It anticipates the next step and prepares it before someone has to ask.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Responsibility, Not Just Intelligence</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This is not about intelligence in the abstract. It’s about responsibility.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              In a proactive system, responsibility for continuity shifts from people to the platform. Designers are no
              longer responsible for remembering every manufacturing detail. Product teams aren’t left chasing missing
              specs. Manufacturing teams don’t receive half-finished information.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">The system carries context forward.</p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              At Genpire, proactive AI means that as a product evolves, its specifications evolve alongside it. Designs
              don’t move forward alone — they pull tech packs, construction details, and factory requirements with them.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">This doesn’t remove human judgment. It protects it.</p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of spending time on preventable corrections and clarifications, teams spend time on decisions that
              actually matter. Creativity improves because friction is removed, not because people are pushed to move
              faster.
            </p>
          </section>

          {/* Callout */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Proactive AI is not automation for speed’s sake. It’s a structural change in how work progresses.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The manifesto is simple: tools should no longer wait passively for instructions. They should actively
              support momentum — from idea to factory-ready product.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Build With Proactive AI</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
