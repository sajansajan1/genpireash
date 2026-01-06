import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Create Production-Ready Samples Without Agencies | Genpire Blog",
  description:
    "Skip agency overhead. Use Genpire to prepare factory-ready packs, contact suppliers, and get your first sample made quickly.",
  keywords:
    "production samples without agency, Genpire samples, factory-ready tech pack, sample workflow, direct manufacturing",
};

export default function ProductionReadySamplesPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Sampling</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Oct 1, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>6 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              How to Create Production-Ready Samples Without Agencies
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                You don’t need an agency to get a professional sample. With <strong>Genpire</strong>, you create a
                complete pack and work directly with factories.
              </p>
            </div>
          </div>

          {/* Share Button */}
          <div className="flex justify-end mb-12">
            <Button variant="outline" size="sm" className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>

          {/* Direct Answer */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Direct Answer</h2>
            <p className="text-zinc-900/80">
              Prepare visuals, measurements, materials, and construction notes in <strong>Genpire</strong>, export the
              tech pack, and request a sample from suppliers. Iterate quickly until it’s ready for production.
            </p>
          </section>

          {/* Lean Sampling Playbook */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Lean Sampling Playbook</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Lock the design:</strong> finalize one or two variations.
              </li>
              <li>
                <strong>Create the pack:</strong> include POMs, tolerances, trims, labels.
              </li>
              <li>
                <strong>Shortlist suppliers:</strong> match category, MOQ, and quality tier.
              </li>
              <li>
                <strong>Send sample requests:</strong> include delivery address and deadlines.
              </li>
              <li>
                <strong>Evaluate sample:</strong> fit, finish, materials; document changes.
              </li>
              <li>
                <strong>Issue rev pack:</strong> update specs and confirm production.
              </li>
            </ol>
          </section>

          {/* Why This Beats Agencies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Why This Beats Agencies</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>Control your costs and timeline.</li>
              <li>Faster iteration loops.</li>
              <li>Direct relationships with manufacturers.</li>
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Create your sample-ready tech pack in Genpire and request your first prototype today
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: What if the first sample isn’t perfect?</p>
                <p className="text-zinc-900/80">Update the pack and request a revised sample—iteration is expected.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: How much should I budget for samples?</p>
                <p className="text-zinc-900/80">Varies by category; a clear pack reduces re-sample costs.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Can I scale to production after sampling?</p>
                <p className="text-zinc-900/80">Yes—use the approved pack to open a PO and start production.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
