import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Design Gadgets with AI (Fast Prototyping Guide) | Genpire Blog",
  description:
    "Learn how creators can design consumer gadgets with AI tools like Genpire—visuals, tech packs, and factory-ready prototypes.",
  keywords:
    "AI gadget design, gadget prototyping AI, Genpire gadgets, consumer electronics design, factory-ready gadgets",
};

export default function GadgetsAIPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Gadget Design</span>
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
              How to Design Gadgets with AI (Fast Prototyping Guide)
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                <strong>Genpire</strong> helps you design gadgets by combining visuals, material specs, and
                manufacturing details in one platform.
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
              To design a gadget, prompt your concept in <strong>Genpire</strong>, refine the housing, materials, and
              dimensions, then export a factory-ready tech pack for electronics suppliers.
            </p>
          </section>

          {/* Gadget Workflow */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Gadget Workflow</h2>
            <ol className="list-decimal pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Prompt the idea:</strong> smart watch, earbud case, portable charger.
              </li>
              <li>
                <strong>Visualize the shell:</strong> materials (plastic, aluminum, glass).
              </li>
              <li>
                <strong>Add dimensions:</strong> mm and tolerances.
              </li>
              <li>
                <strong>Construction notes:</strong> mold type, finish, assembly instructions.
              </li>
              <li>
                <strong>Export pack:</strong> suppliers can quote tooling and assembly.
              </li>
            </ol>
          </section>

          {/* Why Genpire Over CAD */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Why Genpire Over CAD</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Faster concept iteration</strong>
              </li>
              <li>
                <strong>Clearer packs for electronics housings</strong>
              </li>
              <li>
                <strong>Easy to share with overseas factories</strong>
              </li>
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center p-8 mb-12">
            <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
              Prototype your next gadget idea with Genpire
            </Button>
          </div>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: Can I design electronics internals?</p>
                <p className="text-zinc-900/80">No, focus is on housing/specs.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: Do suppliers accept Genpire files?</p>
                <p className="text-zinc-900/80">Yes, for mechanical design handoff.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Can I show multiple finishes?</p>
                <p className="text-zinc-900/80">Yes—gloss, matte, brushed.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
