import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Find Factories for Your Product Idea in 2025",
  description:
    "Stop guessing. Learn a structured way to find factories and request quotes—using Genpire’s tech packs for accurate responses.",
  keywords:
    "find factories 2025, sourcing factories, Genpire tech pack, product manufacturing, request quotes, factory sourcing",
};

export default function FindFactoriesPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Sourcing</span>
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
              How to Find Factories for Your Product Idea in 2025
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                The fastest way to attract good factories is to share a clear tech pack. <strong>Genpire</strong>{" "}
                creates that pack and lets you send it to suppliers for quotes.
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
              Build a production-ready tech pack in <strong>Genpire</strong>, then distribute it to vetted suppliers.
              You’ll get clearer quotes, lower sampling risk, and faster timelines.
            </p>
          </section>

          {/* Sourcing Checklist */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Sourcing Checklist</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Define requirements:</strong> MOQ, budget, materials, target dates.
              </li>
              <li>
                <strong>Create the pack:</strong> visuals, POMs, callouts, colorways, labels.
              </li>
              <li>
                <strong>Shortlist suppliers:</strong> category fit (fashion, jewelry, gadgets, etc.).
              </li>
              <li>
                <strong>Send RFQs:</strong> attach the pack; ask for unit cost, sample fee, lead time.
              </li>
              <li>
                <strong>Compare apples to apples:</strong> use the same pack and questions for all.
              </li>
              <li>
                <strong>Sample and assess:</strong> quality, communication, and on-time delivery.
              </li>
            </ol>
          </section>

          {/* Common Mistakes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Common Mistakes</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>Vague briefs and incomplete files.</li>
              <li>Changing specs mid-quote.</li>
              <li>Ignoring MOQs and production windows.</li>
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Use Genpire to prepare your pack and request quotes today
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: How many factories should I contact?</p>
                <p className="text-zinc-900/80">3–5 per category is a strong start.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: What raises my chances?</p>
                <p className="text-zinc-900/80">Clear specs, realistic MOQs, and fast feedback.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Can Genpire help with multiple categories?</p>
                <p className="text-zinc-900/80">
                  Yes—fashion, jewelry, accessories, gadgets, home, furniture, and more.
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
