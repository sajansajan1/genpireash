import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Turnkey vs Traditional Manufacturing: Which to Choose?",
  description:
    "Explore the differences between turnkey and traditional manufacturing approaches, and discover which model best fits your startup's needs.",
  keywords:
    "turnkey manufacturing, traditional manufacturing, manufacturing comparison, startup manufacturing, production models",
}

export default function TurnkeyVsTraditionalPage() {
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
                <span>10 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Turnkey Manufacturing vs. Traditional Manufacturing: Which to Choose?
            </h1>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                When planning how to manufacture your product, you'll encounter two very different approaches: turnkey
                manufacturing and a more traditional, multi-vendor approach.
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
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">What is Turnkey Manufacturing?</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Turnkey manufacturing means you partner with a single provider who handles everything from design
              refinement and sourcing materials to actual production, assembly, and even packaging. It's like a
              "one-stop shop" for making your product. You essentially hand over your project requirements, and the
              turnkey manufacturer delivers a finished product ready to go. Traditional manufacturing, on the other
              hand, involves managing multiple suppliers or doing parts of the process yourself. For instance, you might
              hire a design firm for engineering, then a separate factory for production, and perhaps another company
              for assembly or packaging. You, as the product owner, coordinate all those pieces.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Comparing the Two Approaches</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Simplicity</h3>
                <p className="text-zinc-900/80 leading-relaxed">
                  Turnkey offers simplicity. With one point of contact running the entire production, there's less
                  juggling for you. You won't need to mediate between your parts supplier and your assembly contractor,
                  for example. The turnkey partner ensures all the steps flow seamlessly. In a traditional model, you'll
                  be project managing multiple entities, which can be complex and time-consuming.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Speed to Market</h3>
                <p className="text-zinc-900/80 leading-relaxed">
                  Turnkey manufacturing can often get your product made faster. Since one company is handling all
                  stages, they can overlap tasks (for example, starting on tooling while finalizing design tweaks) and
                  move swiftly from one phase to the next. In a multi-vendor setup, you might hit delays waiting for
                  hand-offs between different companies.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Cost Considerations</h3>
                <p className="text-zinc-900/80 leading-relaxed">
                  At first glance, a turnkey service might quote a higher price per unit because they bundle all
                  services. But consider hidden costs in the traditional approach: coordinating multiple vendors can
                  incur extra shipping fees (moving parts around), higher administrative overhead, and potential rework
                  if one vendor's output doesn't perfectly meet another's input requirements. Turnkey's integrated
                  process can actually save money by avoiding those inefficiencies. However, if you already have certain
                  capabilities in-house or very reliable specific vendors, the traditional route could be cost-effective
                  for that specific portion (like assembly).
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Control and Flexibility</h3>
                <p className="text-zinc-900/80 leading-relaxed">
                  With multiple vendors, you might pick and choose the best specialist for each task, giving you more
                  control over each step (for example, selecting a renowned packaging company for just the packaging
                  phase). Turnkey means trusting one provider with everything. Good turnkey manufacturers will have
                  expertise in all areas, but some founders feel more comfortable overseeing each piece with
                  specialists.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Communication</h3>
                <p className="text-zinc-900/80 leading-relaxed">
                  One vendor means a single communication channel, which usually reduces miscommunication. In
                  traditional manufacturing, you must ensure that the design you got from your engineer is correctly
                  understood by the factory, and that the factory's output meets the packager's needs, etc. There are
                  more chances for messages to get lost along the chain.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">What's Right for a Startup?</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For many startups, turnkey manufacturing is appealing because it offloads a huge amount of coordination.
              If your team is small and you lack manufacturing management experience, a turnkey partner can simplify
              your life. It's a "hand-holding" solution that lets you focus on big-picture decisions while they handle
              the nitty-gritty. Traditional manufacturing might make sense if you have some expertise or advisors
              in-house who can manage the process, or if you want to piece together specialized services (and have time
              to manage them). Some startups start turnkey to get off the ground, then as they grow and learn, they
              might split off certain functions to specialized vendors to optimize costs.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How Genpire Supports Your Choice</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Whether you opt for a turnkey manufacturer or a set of individual specialists, Genpire is an invaluable
              tool. If you go turnkey, Genpire can rapidly produce the complete documentation package (tech pack, CAD
              designs, etc.) that your one-stop partner will need—making the kickoff smooth and avoiding
              miscommunications. You can essentially hand the turnkey manufacturer a ready-made blueprint generated via
              Genpire. If you choose a traditional approach, Genpire helps here too: you can generate professional
              documents and specs to share with each of your specialized vendors. Everyone—from the component supplier
              to the assembly team—will be literally on the same page, thanks to a consistent set of plans. Genpire can
              also help connect you with suitable partners, turnkey or otherwise, through its platform.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Choose Your Manufacturing Path</Button>
            </div>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed">
              In conclusion, turnkey manufacturing offers convenience and speed by consolidating production with one
              partner, while a traditional multi-vendor approach offers more hands-on control and flexibility. There's
              no one-size-fits-all answer; it depends on your team's bandwidth and priorities. The good news is that
              with Genpire's help in creating clear documentation and facilitating connections, whichever path you
              choose will be easier to navigate and more likely to succeed.
            </p>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
