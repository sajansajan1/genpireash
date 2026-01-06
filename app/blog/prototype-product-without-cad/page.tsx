import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Prototype a Product Without CAD Software | Genpire Blog",
  description:
    "CAD is powerful but slow. Learn a faster way to prototype using Genpire—create visuals, specs, and factory-ready files without CAD.",
  keywords:
    "prototype without CAD, product design without CAD, Genpire prototyping, no-CAD prototyping, AI product design",
};

export default function PrototypeWithoutCADPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Prototyping</span>
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
              How to Prototype a Product Without CAD Software
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                You don’t need CAD to build a prototype. <strong>Genpire</strong> turns sketches into editable visuals
                and production specs you can share with factories.
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
              Prototype without CAD by generating visuals and specs in <strong>Genpire</strong>, then exporting a tech
              pack for sampling. This shortens your path from idea to first sample.
            </p>
          </section>

          {/* Rapid Prototype Workflow */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Rapid Prototype Workflow</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Sketch or prompt</strong> your idea.
              </li>
              <li>
                <strong>Generate variations</strong> and pick the top concept.
              </li>
              <li>
                <strong>Refine details:</strong> materials, trims, dimensions.
              </li>
              <li>
                <strong>Auto tech pack</strong> with POMs and annotations.
              </li>
              <li>
                <strong>Request a sample</strong> from suppliers directly.
              </li>
            </ol>
          </section>

          {/* Benefits vs CAD */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Benefits vs CAD</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Faster learning curve</strong>
              </li>
              <li>
                <strong>Fewer tools to manage</strong>
              </li>
              <li>
                <strong>Clearer handoff</strong> to manufacturers
              </li>
            </ul>
          </section>

          {/* CTA */}

          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Try Genpire to turn your design into a factory-ready pack in minutes
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: Will factories accept a non-CAD pack?</p>
                <p className="text-zinc-900/80">
                  Yes — what matters is clarity: measurements, materials, and construction notes.
                </p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: Can I do multiple prototypes?</p>
                <p className="text-zinc-900/80">Yes — duplicate versions and track changes.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: What categories are supported?</p>
                <p className="text-zinc-900/80">Fashion, jewelry, accessories, gadgets, furniture, toys, and more.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
