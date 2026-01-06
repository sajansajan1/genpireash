import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Launching Your Product with Low MOQ Manufacturing",
  description:
    "Learn how low minimum order quantity (MOQ) production helps you launch a product in small batches—reducing risk and validating demand before scaling up.",
  keywords:
    "low MOQ manufacturing, small batch production, startup manufacturing, product launch, minimum order quantity",
}

export default function LowMOQManufacturingPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Manufacturing</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 15, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>9 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Launching Your Product with Low MOQ Manufacturing
            </h1>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                One of the biggest challenges for a new physical product brand is meeting high minimum order quantities
                (MOQs) that many factories require. Low MOQ manufacturing is a solution that enables startups to produce
                in small batches.
              </p>
            </div>
          </div>

          <div className="flex justify-end mb-12">
            <Button variant="outline" size="sm" className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Why Start Small?</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For a startup, starting with a small production run has key advantages:
            </p>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-3">
              <li>
                <strong>Risk Reduction:</strong> If you order 5,000 units only to discover that the product needs design
                improvements or the market isn't as excited as you hoped, you're stuck with a lot of inventory. By
                contrast, producing say 100 units allows you to test your product with early customers and gather
                feedback. If there's an issue, you can fix it in the next iteration, saving you from a costly mistake at
                scale.
              </li>
              <li>
                <strong>Improved Cash Flow:</strong> Lower quantities mean a smaller upfront investment. Yes, your cost
                per unit will be higher on a 100-unit run than on a 5,000-unit run, but the total cash you lay out is
                far less. This is crucial for small teams operating on tight budgets.
              </li>
              <li>
                <strong>Agility:</strong> Small batches let you stay agile and responsive. You can tweak your product,
                adjust features, or change suppliers between batches if needed. Essentially, you're not locked in—you
                can evolve your product based on real customer input before committing to a large-scale production.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Finding Manufacturers for Low Volume</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Not all manufacturers are willing to do low-volume production, but many are adapting as they see the
              growing maker and indie brand movement. Look for factories or workshops advertising "small batch" or "low
              MOQ." Industries like apparel, handmade goods, and electronics assembly often have specialist firms for
              low-volume runs or prototyping that will work with startups. When negotiating, be upfront about your
              planned volume and growth trajectory. Sometimes a manufacturer with a higher MOQ might still take on your
              project if they believe you will scale up later or if they have idle capacity. It also helps if you can
              simplify the manufacturing process—using standard materials or components—so it's easier for a factory to
              slot in a small run for you.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How Genpire Enables Small Batches</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire is a perfect ally for launching with low MOQs. First, it allows you to create production-ready
              documentation very quickly, which means you can approach multiple small-batch manufacturers with a clear
              blueprint. This helps you get accurate quotes even for small orders, since everything the factory needs to
              know is detailed. Moreover, Genpire's AI tools make it easy to adjust your design and tech pack after you
              get feedback from the initial batch. Did customers suggest a tweak or did you find a way to improve the
              product? Update your specs in Genpire and generate a revised tech pack in minutes. You're ready for the
              next batch without lengthy design revisions.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Start with Small Batches</Button>
            </div>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed">
              Ultimately, low MOQ manufacturing lets you "learn fast" with minimal risk. It's the lean startup approach
              applied to physical products: build a small batch, measure customer response, and learn for your next
              batch. With Genpire streamlining the creation of professional specs and simplifying manufacturer outreach,
              even low-volume production runs can be executed smoothly—paving the way for confident scaling when the
              time is right.
            </p>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
