import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manufacturing Made Simple – AI Guides First-Time Founders",
  description:
    "New to manufacturing? AI can guide you through the complex steps—from material selection to finding the right supplier. See how Genpire acts as your knowledgeable partner, simplifying production for beginners.",
  keywords: "first-time manufacturing, AI guidance, production help, manufacturing basics, Genpire guide",
};

export default function AIGuidanceFirstTimeManufacturingPage() {
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
                <span>Jan 21, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>7 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Manufacturing Made Simple: AI Guidance for First-Time Founders
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
              If you've never taken a product into production before, the manufacturing stage can feel like venturing into a maze. There are new terms to learn (MOQ, lead times, tooling, anyone?), suppliers to vet, and processes to choose from. It's easy to feel out of your depth. That's where AI guidance comes in. Genpire acts like an experienced mentor walking you through the manufacturing journey step by step.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How AI Simplifies Manufacturing</h2>
            <ul className="list-disc list-inside space-y-3 text-zinc-900/80 leading-relaxed mb-6">
              <li><strong>Material & Process Recommendations:</strong> Not sure if your gadget should be made by injection molding or 3D printing? Wondering what fabric would balance cost and quality for your bag? Genpire's AI analyzes your design and suggests suitable manufacturing processes and materials, so you don't have to guess.</li>
              <li><strong>Supplier Matching Tips:</strong> Based on your product category and desired quantity, the AI can point you towards the type of manufacturers that fit (for example, a small-batch friendly workshop vs. a large factory). It also prepares you with the info suppliers will ask for, like your tech pack and order forecasts.</li>
              <li><strong>Timeline & Checklist:</strong> The AI won't let you forget key steps. It can outline a typical production timeline, reminding you about things like prototype testing, quality checks, and even packaging considerations. It's like having a project manager who knows the manufacturing world intimately.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Approach with Confidence</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              With these insights at your fingertips, you can approach factories with confidence rather than trepidation. You'll speak their language (or at least have the right data on hand) and make informed decisions instead of crossing fingers and hoping for the best.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Manufacturing doesn't have to be the scary unknown. Ready to navigate production like a pro? Let Genpire's AI guide you from first quote to final product. Sign up for Genpire and take the mystery out of manufacturing your big idea.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Get Manufacturing Guidance</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
