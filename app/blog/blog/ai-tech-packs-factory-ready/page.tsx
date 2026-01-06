import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tech Packs Made Easy – Create Factory-Ready Specs in Minutes | Genpire Blog",
  description:
    "Learn how AI-generated tech packs take the hassle out of creating product specification sheets. Get factory-ready documentation quickly and accurately with Genpire.",
  keywords: "AI tech packs, factory specs, product documentation, manufacturing specs, Genpire tech pack",
};

export default function AITechPacksFactoryReadyPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">How-To Guide</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 20, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>5 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Tech Packs Made Easy: AI-Generated Factory-Ready Specs
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
              If you've never made a tech pack before, it can seem daunting. A tech pack is the detailed blueprint of
              your product that manufacturers use to bring it to life. It includes everything from measurements to
              materials, and creating one manually can take days or weeks of meticulous work. AI is changing that.
              Genpire's AI tech pack generator can turn your product design into a complete factory-ready spec in
              minutes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">What's Inside an AI Tech Pack?</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Think of how much easier that makes your life as a founder or designer. Instead of wrestling with complex
              design software or hiring a technical designer, you simply input your product details (or generate a
              design on Genpire), and let the AI do the heavy lifting. The output is a professional tech pack with all
              the essentials:
            </p>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2 mb-6">
              <li>
                <strong>Visuals:</strong> Clear sketches or renderings of your product from multiple angles.
              </li>
              <li>
                <strong>Measurements:</strong> Precise dimensions and sizing info for each component.
              </li>
              <li>
                <strong>Materials & Colors:</strong> A list of fabrics, materials, or components needed, including color
                options.
              </li>
              <li>
                <strong>Construction Details:</strong> Any notes on how the product is put together, like stitching or
                assembly instructions.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Because the tech pack is AI-generated, nothing gets forgotten. Every detail is consistent and accurate,
              reducing the risk of costly misunderstandings with your factory. Plus, if you decide to tweak the design,
              you can update the tech pack in a flash – no starting from scratch.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For small brands, AI tech packs are a game changer. They level the playing field by giving you the same
              quality of documentation that big companies have, but without the big budget. Ready to turn your idea into
              a factory-ready reality? Hop on Genpire and let AI create your tech pack – so you can move to
              manufacturing with confidence.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Create Your Tech Pack</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
