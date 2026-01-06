import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proactive AI for Consumer Goods: Managing Complexity at Scale",
  description:
    "How proactive AI helps consumer goods teams manage complexity, scale product lines, and prepare factory-ready outputs with consistency.",
  keywords: "proactive AI, consumer goods, product scale, manufacturing readiness, Genpire",
};

export default function ProactiveAIConsumerGoodsPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Consumer Goods</span>
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
              Proactive AI for Consumer Goods: Managing Complexity at Scale
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
              Consumer goods teams operate in an environment defined by complexity.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Multiple SKUs, seasonal launches, supplier coordination, and tight timelines create pressure across
              design, product, and manufacturing teams. As product lines grow, small inefficiencies compound into
              significant delays.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Traditional tools struggle in this environment because they rely on linear processes. Designs are created
              first, documentation follows later, and manufacturing preparation happens at the end. This sequence leaves
              little room for error.
            </p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Proactive AI helps consumer goods teams work differently.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Instead of waiting for designs to be finalized before preparing specifications, proactive AI builds
              readiness continuously. As products evolve, specs are improved, gaps are flagged, and production
              considerations are addressed early.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Managing Scale and Consistency</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              When multiple SKUs move through the pipeline simultaneously, proactive AI ensures consistency across
              products. Specifications follow shared standards, documentation stays aligned, and deviations are
              identified before they become costly.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For consumer goods brands, this consistency is critical. It reduces variation between products, simplifies
              supplier communication, and improves predictability across collections.
            </p>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              At Genpire, proactive AI supports consumer goods teams by maintaining structure as complexity increases.
              As collections grow, clarity does not degrade. Instead of adding more process overhead, the platform
              absorbs complexity on behalf of the team.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This leads to faster launches without sacrificing quality.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Importantly, proactive AI does not remove human oversight. It augments it. Teams still make decisions, but
              they make them earlier and with better information.
            </p>
          </section>

          {/* Callout */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Manufacturing readiness becomes part of product development rather than a separate phase. Suppliers
              receive clearer documentation. Sampling cycles shorten. Production timelines become more reliable.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For consumer goods teams, proactive AI is not about innovation for its own sake. It’s about maintaining
              control as scale increases. By addressing complexity upstream, proactive AI allows brands to grow without
              introducing chaos into their workflows.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Scale Consumer Goods with AI</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
