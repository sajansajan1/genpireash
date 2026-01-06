import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data-Driven Product Ideation – Find Winning Ideas with AI",
  description:
    "Stop guessing what to make. AI tools analyze trends and consumer data to suggest product ideas with real market potential. See how Genpire guides you to concepts likely to succeed.",
  keywords: "data-driven ideation, product ideas, market research, AI ideation, Genpire ideas",
};

export default function DataDrivenProductIdeationPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Ideation</span>
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
              Data-Driven Ideation: Find Winning Product Ideas with AI
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
              Coming up with the "next big thing" can feel like looking for a needle in a haystack. Many founders brainstorm in the dark, hoping an idea sticks, only to find out later that customers weren't interested. What if your ideation could be guided by real data from the start? That's the promise of data-driven ideation with AI. Genpire's AI doesn't just generate product ideas randomly – it bases suggestions on market research, trends, and gaps.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">AI-Powered Market Intelligence</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              When you use Genpire to spark product ideas, the AI has already done its homework. It scans through consumer trend data, hot keywords, and even feedback on existing products in your niche. For example, it might notice a surge in demand for eco-friendly kitchen gadgets, or identify that customers love a certain feature that's missing in most affordable options. Armed with these insights, the AI proposes product concepts that align with proven interest.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This means the ideas you get aren't just creative – they have a rationale behind them. You can see why a suggested product could fill a market need or tap into a growing trend. It's like having a research team and a creative team wrapped into one super-fast AI engine.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Reduce Risk, Increase Potential</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For a resource-strapped startup, this approach is invaluable. You focus your energy on ideas with real potential, instead of gambling on guesswork. It reduces the risk of pouring time and money into a product no one wants.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Let data guide your creativity. Ready to find your next winning product idea? Try Genpire's AI ideation tool and brainstorm smarter, not harder. With Genpire, you might just discover the product idea that hits the sweet spot between innovation and demand.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Find Winning Ideas</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
