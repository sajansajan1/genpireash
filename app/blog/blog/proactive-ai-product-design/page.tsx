import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proactive AI in Product Design: Designing with Production in Mind",
  description:
    "How proactive AI helps product designers anticipate requirements, improve specs early, and align designs with manufacturing realities.",
  keywords: "proactive AI, product design, manufacturing alignment, tech packs, Genpire",
};

export default function ProactiveAIProductDesignPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Design</span>
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
              Proactive AI in Product Design: Designing with Production in Mind
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
              Product design problems rarely begin with bad ideas.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              They begin when good ideas move forward without enough context.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Designers are trained to focus on form, function, and user experience. Manufacturing constraints often
              arrive later, when designs are already emotionally and operationally committed. At that point, changes
              feel like setbacks instead of natural refinements.
            </p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Proactive AI helps shift this dynamic earlier in the process.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of waiting until a design is “done,” proactive AI continuously evaluates it as it develops. It
              asks quiet, practical questions in the background: What information is missing? What decisions will
              manufacturing need? What specs should already exist?
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Creativity Anchored by Context</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">This changes how designers work.</p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Rather than guessing what production might require later, designers receive feedback while they still have
              flexibility. Materials, construction details, and tolerances become part of the creative conversation —
              not an afterthought.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">This doesn’t limit creativity. It anchors it.</p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Designers make better decisions when they understand consequences early. Proactive AI doesn’t prescribe
              solutions, but it surfaces considerations that would otherwise appear too late.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              At Genpire, proactive AI supports product design by treating tech packs as a living artifact. As designs
              evolve, specs evolve with them. Nothing is postponed to a final documentation sprint.
            </p>
          </section>

          {/* Callout */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The result is fewer revisions downstream and stronger alignment across teams. Designers stay focused on
              creative quality while the platform ensures production readiness keeps pace.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Design becomes less about handoff and more about continuity — a process where ideas mature into
              factory-ready products without friction.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Design with Proactive AI</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
