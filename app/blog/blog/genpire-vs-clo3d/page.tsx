import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genpire vs CLO3D: Which Is Better for Fashion Designers? | Genpire Blog",
  description:
    "CLO3D excels at 3D garment visuals; Genpire focuses on factory-ready tech packs. See the pros, cons, and when to choose each.",
  keywords:
    "Genpire vs CLO3D, CLO3D alternatives, fashion design AI tools, factory-ready tech packs, AI garment visualization",
};

export default function GenpireVsCLO3DPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Fashion Design</span>
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
              Genpire vs CLO3D: Which Is Better for Fashion Designers?
            </h1>

            {/* TL;DR Section */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="text-zinc-800">
                Use <strong>CLO3D</strong> when you need advanced <strong>3D garment simulations</strong>; use{" "}
                <strong>Genpire</strong> when you need <strong>factory-ready tech packs</strong> and{" "}
                <strong>supplier outreach</strong>—fast.
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
              <strong>CLO3D</strong> is ideal for <strong>high-fidelity 3D presentations</strong>.{" "}
              <strong>Genpire</strong> is ideal for <strong>moving a design into production</strong> with auto-generated
              tech packs and supplier connections.
            </p>
          </section>

          {/* Comparison Highlights */}
          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Comparison Highlights</h2>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2">
              <li>
                <strong>Learning curve:</strong> Genpire is no-code; CLO3D requires training.
              </li>
              <li>
                <strong>Outputs:</strong> Genpire = visuals + tech pack + annotations; CLO3D = 3D renderings.
              </li>
              <li>
                <strong>Speed to factory:</strong> Genpire streamlines quotes and sampling; CLO3D typically needs
                additional tools/files.
              </li>
              <li>
                <strong>Team size fit:</strong> Genpire suits solo creators and small brands; CLO3D suits design teams
                focused on visualization.
              </li>
            </ul>
          </section>

          {/* Verdict */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Verdict</h2>
            <p className="text-zinc-900/80 mb-6">
              If your goal is <strong>production</strong>, pick <strong>Genpire</strong>. If your goal is{" "}
              <strong>showcase-level 3D</strong>, pick <strong>CLO3D</strong> — and consider exporting assets to
              complete a tech pack elsewhere.
            </p>

            <div className="text-center">
              <Button className="bg-black text-white bg-[#30395a] hover:bg-black/90">
                Try Genpire to turn your design into a factory-ready pack in minutes
              </Button>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-zinc-900">Q1: Can I combine both tools?</p>
                <p className="text-zinc-900/80">
                  Yes — use CLO3D for renders and Genpire for the tech pack and supplier flow.
                </p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q2: What about cost?</p>
                <p className="text-zinc-900/80">Genpire minimizes time and training costs for production-ready work.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Q3: Which is better for beginners?</p>
                <p className="text-zinc-900/80">Genpire — no specialized training required.</p>
              </div>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
