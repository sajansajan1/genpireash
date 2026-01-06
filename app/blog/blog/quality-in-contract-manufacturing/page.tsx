import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react"
import Link from "next/link"
import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quality in Contract Manufacturing: Tips for Startups",
  description:
    "Quality issues can derail a launch. Learn how to maintain high standards when outsourcing manufacturing – from clear specs and sample approval to inspections.",
}

export default function QualityInContractManufacturingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      {/* Article Header */}
      <article className="flex-1">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-600 py-16 text-white">
          <div className="container mx-auto max-w-4xl px-4">
            <Link
              href="/blog"
              className="inline-flex items-center text-cream/80 hover:text-cream mb-8 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>

            <div className="mb-6">
              <span className="bg-taupe/20 text-cream border border-taupe/30 text-sm font-medium px-3 py-1 rounded-full">
                Manufacturing
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Quality in Contract Manufacturing: Tips for Startups
            </h1>

            <div className="flex items-center gap-6 text-cream/80 text-sm">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>January 15, 2025</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>9 min read</span>
              </div>
              <button className="flex items-center hover:text-cream transition-colors ml-auto">
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-zinc-700 leading-relaxed mb-8">
                When you entrust your product to a contract manufacturer, ensuring the quality of the output is
                paramount. As a startup, you might not have a dedicated quality control team, but that doesn't mean you
                can't implement robust quality assurance practices. Here are some tips to help maintain high quality
                when outsourcing production:
              </p>

              <h2 className="text-3xl font-bold text-zinc-900 mt-12 mb-6">
                Set Clear Quality Standards from the Start
              </h2>
              <p className="text-zinc-700 leading-relaxed mb-6">
                Quality assurance begins with your documentation. In your tech pack or product specifications,
                explicitly state the quality standards and tolerances. For example, if you're making a textile product,
                specify acceptable dimensional tolerances, color matching standards, and any material certifications
                (like "all components must be lead-free" for electronics, or "fabric must pass XYZ flame retardant test"
                for furniture). Define what constitutes a defect versus what's acceptable (e.g., cosmetic blemishes,
                alignment offsets, etc., and how many are allowed if any). When you give a manufacturer a clear
                definition of "good product," you set the baseline for quality.
              </p>

              <h2 className="text-3xl font-bold text-zinc-900 mt-12 mb-6">
                Require and Approve Pre-production Samples
              </h2>
              <p className="text-zinc-700 leading-relaxed mb-6">
                Never go straight into full production without seeing a sample (often called a pre-production sample or
                PPS). This sample should be made with the final materials and processes. When you receive it:
              </p>
              <ul className="list-disc pl-6 mb-6 text-zinc-700 space-y-2">
                <li>
                  Inspect it thoroughly. Does it meet all your specs? Test it under conditions your customers might
                  (wear the garment, assemble the furniture, use the gadget, etc.).
                </li>
                <li>
                  Provide feedback or approval in writing. If changes are needed, update your documentation and have the
                  manufacturer produce another sample if the change is significant.
                </li>
                <li>Use the approved sample as the "gold standard" that future units are compared against.</li>
              </ul>

              <h2 className="text-3xl font-bold text-zinc-900 mt-12 mb-6">Implement In-Process Quality Checks</h2>
              <p className="text-zinc-700 leading-relaxed mb-6">
                Work with your manufacturer to establish checkpoints during production. For instance:
              </p>
              <ul className="list-disc pl-6 mb-6 text-zinc-700 space-y-2">
                <li>
                  If your product has multiple steps (e.g., injection molding, then painting, then assembly), have
                  quality checks after each major step rather than only at the end. This way, issues can be caught
                  early.
                </li>
                <li>
                  Ask the manufacturer about their own quality processes. Many have internal QC at certain intervals
                  (like they might inspect every 50th unit or have a testing station). Ensure their process aligns with
                  your expectations.
                </li>
                <li>
                  If possible, request photographs or data from these in-process checks, especially for the first big
                  production run.
                </li>
              </ul>

              <h2 className="text-3xl font-bold text-zinc-900 mt-12 mb-6">Conduct Final Random Inspections</h2>
              <p className="text-zinc-700 leading-relaxed mb-6">
                When the production run is complete (or nearly complete), you or a third-party should inspect a sample
                of the goods. A common approach is AQL (Acceptable Quality Limit) sampling, which gives you a
                statistical way to decide if a batch meets your standards. You might hire a third-party inspection
                service that will go to the factory and randomly inspect, say, 5% of the order. They'll use your tech
                pack and quality criteria to check items and report any issues. If major problems are found, you can ask
                the factory to rework or sort out defective units before shipping.
              </p>

              <h2 className="text-3xl font-bold text-zinc-900 mt-12 mb-6">Foster Open Communication</h2>
              <p className="text-zinc-700 leading-relaxed mb-6">
                Quality issues sometimes go unmentioned by manufacturers if they fear an angry client or blame. Set a
                tone of partnership: you want them to alert you if something is off. It's better to hear "we're seeing a
                2mm deviation in this part, is that okay?" during production than to not hear about it and discover it
                in the finished goods. If a manufacturer brings up a quality challenge, work with them on a solution
                (which could be an adjustment in design, or a tweak in process, or accepting a minor deviation if it
                doesn't affect function). Showing that you're solution-oriented can encourage transparency.
              </p>

              <h2 className="text-3xl font-bold text-zinc-900 mt-12 mb-6">
                How Genpire Contributes to Quality Assurance
              </h2>
              <p className="text-zinc-700 leading-relaxed mb-6">
                Genpire can significantly aid your quality control efforts:
              </p>
              <ul className="list-disc pl-6 mb-6 text-zinc-700 space-y-2">
                <li>
                  <strong>Comprehensive Specs:</strong> By using Genpire to create your tech packs, you reduce
                  ambiguity. It's easier for both you and the manufacturer to be on the same page about what's expected.
                  Clear specs = fewer quality mishaps.
                </li>
                <li>
                  <strong>Revision Tracking:</strong> If you need to adjust a spec for quality reasons, Genpire allows
                  you to update the tech pack and keep track of those changes. Everyone always sees the latest
                  requirements.
                </li>
                <li>
                  <strong>Supplier Matching:</strong> Genpire's network and data can help steer you toward reputable
                  manufacturers that have good quality track records. It's not just about finding a factory; it's about
                  finding a reliable one.
                </li>
                <li>
                  <strong>Communication Hub:</strong> Any quality-related discussions (like a manufacturer asking a
                  question about tolerance) can be logged within the platform. This creates a paper trail and ensures
                  decisions are documented.
                </li>
              </ul>

              <p className="text-zinc-700 leading-relaxed mb-6">
                Quality assurance is not about perfection, but about establishing processes that catch issues before
                your customers do. As a startup, you want every unit that reaches a customer to meet or exceed their
                expectations. By being clear, proactive, and using available tools and services (like Genpire and
                inspection agencies), you can achieve high quality even when you're not physically present on the
                factory floor. Remember, quality builds trust, and trust builds your brand.
              </p>
            </div>

            {/* CTA Section */}
            <div className="mt-16 p-8 bg-gradient-to-br from-zinc-900 to-zinc-600 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-4">Ensure Quality from Day One</h3>
              <p className="text-cream/90 mb-6">
                Create detailed tech packs with Genpire to set clear quality standards and connect with reliable
                manufacturers.
              </p>
              <Link href="/dashboard">
                <Button size="lg" variant="secondary">
                  Start Building Quality Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>

      <LandingFooter />
    </div>
  )
}
