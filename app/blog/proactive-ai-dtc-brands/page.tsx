import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proactive AI for DTC Brands: Speed Without Sacrificing Clarity",
  description:
    "How proactive AI helps DTC brands move fast while maintaining alignment across design, product, and manufacturing workflows.",
  keywords: "proactive AI, DTC brands, product alignment, manufacturing readiness, Genpire",
};

export default function ProactiveAIDTCBrandsPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">DTC Brands</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 21, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>7 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Proactive AI for DTC Brands: Speed Without Sacrificing Clarity
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
            <p className="text-zinc-900/80 leading-relaxed mb-6">DTC brands are built for speed.</p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              They test quickly, launch frequently, and adapt constantly. This agility is a strength — but it also
              creates risk. When timelines compress, documentation is rushed, production prep is fragmented, and teams
              rely on assumptions instead of clarity.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">The result is often avoidable rework.</p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Proactive AI helps DTC brands move fast without sacrificing structure.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of treating production readiness as a final hurdle, proactive AI builds it incrementally. As ideas
              become designs, and designs become products, specifications are prepared alongside them.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">This reduces last-minute pressure.</p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Designers don’t have to stop and assemble documentation under tight deadlines. Product managers don’t have
              to scramble to fill gaps before production. Manufacturers don’t receive incomplete information.
            </p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              At Genpire, proactive AI supports DTC brands by maintaining alignment across teams. Everyone works from
              the same evolving context. Decisions made early are reflected downstream automatically.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This alignment is especially important for DTC teams, where small teams often wear multiple hats.
              Proactive AI reduces the operational burden, allowing teams to focus on strategy and execution rather than
              coordination.
            </p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">Speed becomes sustainable.</p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of accelerating toward uncertainty, teams move quickly with confidence. Fewer surprises mean fewer
              delays. Fewer delays mean faster launches that actually hold up in production.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Proactive AI does not slow DTC brands down. It prevents them from having to slow down later.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              By embedding production awareness into the creative process, proactive AI ensures that speed does not come
              at the expense of clarity or quality.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For DTC brands, this balance is essential. Growth depends not just on moving fast, but on moving forward
              with control.
            </p>
          </section>

          {/* Callout */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Enable Proactive DTC Workflows</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
