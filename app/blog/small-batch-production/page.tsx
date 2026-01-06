import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Small Batch Production: Low-Volume Manufacturing for Agility and Risk Reduction | Genpire Blog",
  description:
    "Delve into small batch production – producing in low volumes (tens or hundreds of units) – and see how it helps startups reduce risk, gather feedback, and stay agile before scaling up.",
  keywords:
    "small batch production, low volume manufacturing, lean manufacturing, startup production, agile manufacturing",
};

export default function SmallBatchProductionPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      <section className="bg-gradient-to-br from-zinc-900 to-zinc-600 py-16 text-white">
        <div className="container mx-auto max-w-4xl px-4">
          <Link href="/blog" className="inline-flex items-center text-taupe hover:text-cream mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          <div className="mb-6">
            <span className="bg-taupe/20 text-cream text-sm font-medium px-3 py-1 rounded-full">Manufacturing</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Small Batch Production: Low-Volume Manufacturing for Agility and Risk Reduction
          </h1>

          <p className="text-xl text-taupe/90 mb-8 text-pretty">
            Delve into small batch production – producing in low volumes (tens or hundreds of units) – and see how it
            helps startups reduce risk, gather feedback, and stay agile before scaling up.
          </p>

          <div className="flex items-center gap-6 text-sm text-cream/80">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>January 22, 2025</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>9 min read</span>
            </div>
            <Button variant="outline" size="sm" className="border-taupe text-taupe hover:bg-taupe/10 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </section>

      <article className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-zinc-900/80 leading-relaxed mb-6">
              Small batch production is the practice of manufacturing products in limited quantities, often on the order
              of just a few dozen to a few hundred units, rather than thousands. It's essentially the bridge between
              prototyping and mass production.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For example, instead of immediately ordering 5,000 units from a factory, a hardware startup might produce
              an initial run of 100 or 200 units. These smaller production runs enable companies to test the waters,
              validate product-market fit, and iron out any kinks in the design or production process before committing
              to large-scale manufacturing.
            </p>

            <h2 className="text-3xl font-bold text-zinc-900 mb-6">Why Go Small?</h2>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The primary reason is to reduce risk and gather feedback early. If you manufacture a huge volume right
              away and the product has a flaw or doesn't meet customer needs, you're stuck with costly inventory that
              might go unsold. By contrast, producing say 50 or 100 units allows you to get real-world feedback and
              observe actual demand.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Most failed products don't fail due to engineering; they fail from launching "too big, too soon" without
              validating demand. Small batch production prevents that scenario. You can release a limited batch to early
              adopters or Kickstarter backers, collect their reactions, and then improve your product for the next
              version.
            </p>

            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Lower Upfront Cost</h3>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Another benefit is lower upfront cost and preserved cash flow. High-volume manufacturing usually comes
              with high Minimum Order Quantities (MOQs) – traditional manufacturers might demand you order 1000+ units.
              That's tens or hundreds of thousands of dollars spent before you've sold a single item.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              With small batch production, you can often start with just 20, 50, or 100 units, depending on the
              manufacturer. This means a much smaller investment. Yes, the cost per unit may be higher in a small batch
              than it would be at mass scale, but the total cash outlay is far lower, which is crucial for startups and
              makers on a tight budget.
            </p>

            <h2 className="text-3xl font-bold text-zinc-900 mb-6">How Genpire Enables Small Batches</h2>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire's platform is a natural ally for small batch strategies. With Genpire, you can quickly generate
              the technical specifications and manufacturing files needed to produce a short run. This means you could
              go from idea to a prototype, and then use Genpire to create production-ready documentation for, say, a
              50-unit run, all in a very short time frame.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire can also help adjust and refine those designs rapidly after you get feedback from the first batch.
              Because everything is digital and AI-assisted, you can iterate on your tech pack or design parameters and
              have an updated version ready for the next batch in minutes.
            </p>

            <div className="bg-zinc-900 rounded-lg p-8 text-white mb-8 not-prose">
              <h3 className="text-2xl font-bold text-cream mb-4">Start Small, Learn Fast</h3>
              <p className="text-cream/90 mb-6">
                Small batch production offers a smart, flexible way to launch products with minimal risk. It embodies
                the "crawl before you walk, walk before you run" philosophy of manufacturing.
              </p>
              <Button className="bg-taupe text-zinc-900 hover:bg-taupe/90">Try Genpire Today</Button>
            </div>

            <p className="text-zinc-900/80 leading-relaxed text-lg">
              In summary, small batch production offers a smart, flexible way to launch products with minimal risk. With
              Genpire streamlining the creation of your production files and connecting you to the right fabrication
              partners, executing a small batch run becomes even more feasible.
            </p>
          </div>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
