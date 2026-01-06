import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lean Product Launch – Use Small Batches & AI Iteration",
  description:
    "Embrace lean startup principles in product manufacturing. Learn how AI enables quick iteration and small batch production, so you can test, learn, and scale wisely with Genpire's help.",
  keywords: "lean launch, small batch, AI iteration, lean startup, Genpire lean",
};

export default function LeanProductLaunchAIPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Lean</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 21, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>6 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Lean Product Launch: Small Batches and AI Iteration
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
              Lean startup methodology taught us to build, measure, and learn quickly – but applying that to physical products used to be difficult. How can you iterate fast when manufacturing takes months and demands huge orders? The answer: combine small batch production with AI-driven design. Genpire makes it possible to launch a lean product: you start small, gather feedback, and improve rapidly for the next round.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Lean Product Cycle</h2>
            <ul className="list-disc list-inside space-y-3 text-zinc-900/80 leading-relaxed mb-6">
              <li><strong>Build (Small):</strong> Use Genpire to design your product and produce a small batch (maybe 50-100 units) instead of thousands. AI helps you create a factory-ready design quickly, and by focusing on low Minimum Order Quantities, you keep your initial investment low.</li>
              <li><strong>Measure:</strong> Release your small batch to real customers or beta testers. With an actual product in hand, you can measure their reactions, collect reviews, and gather data on what could be better.</li>
              <li><strong>Learn & Iterate:</strong> Now take that feedback and go back into Genpire's AI studio. Maybe users wanted a stronger material, or a different size. You can adjust the design in minutes and have a revised tech pack ready. Since you're not sitting on heaps of unsold inventory, you're free to pivot or tweak the product for a second improved version.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Minimize Risk, Maximize Learning</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This cycle lets you hone in on product-market fit with minimal waste – of time, money, and materials. You're essentially de-risking your venture by not betting everything on a single massive production run.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For modern hardware startups, lean isn't just for software anymore. Ready to build smarter? Use Genpire to launch small, learn fast, and scale your product with confidence.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Launch Lean</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
