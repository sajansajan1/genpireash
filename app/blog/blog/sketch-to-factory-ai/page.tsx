import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "From Sketch to Factory – Use AI to Turn Drawings into Products",
  description:
    "Got a napkin sketch or concept drawing? Learn how AI platforms like Genpire can transform rough sketches into detailed designs and manufacturer-ready specs, bringing your idea closer to reality.",
  keywords: "sketch to product, AI sketch, drawing to manufacturing, concept to product, Genpire sketch",
};

export default function SketchToFactoryAIPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Design Process</span>
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
              Sketch to Factory: How AI Turns Your Drawings into Products
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
              Do you have a product idea doodled in a notebook or sketched on a napkin? That sketch could be the seed of a great product, but traditionally, turning it into something a factory can use is a big leap. You'd need a professional designer to create technical drawings and specs. Now, AI bridges that gap. With Genpire, you can literally upload your sketch (or describe it), and let the AI help turn it into a production-ready design.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Transformation Process</h2>
            <ol className="list-decimal list-inside space-y-3 text-zinc-900/80 leading-relaxed mb-6">
              <li><strong>Upload or Describe:</strong> Provide Genpire with your rough sketch or even just a written concept. No elaborate CAD files required.</li>
              <li><strong>AI Interpretation:</strong> Genpire's AI analyzes the sketch and fills in the details – generating refined visuals of your product from different angles, with proper proportions and features.</li>
              <li><strong>Refine Together:</strong> You can then tweak the design by telling the AI what to adjust (e.g., "make it taller," "use metal instead of plastic for this part"). It's a collaborative process, almost like working with a human designer who speaks sketch.</li>
              <li><strong>Tech Pack Creation:</strong> Once the design looks right, Genpire produces the full tech pack and spec sheet. Your once-hand-drawn idea now has precise measurements, material lists, and assembly instructions ready for a manufacturer.</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">From Concept to Reality</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This seamless path from sketch to factory means you don't have to be an engineer to get your concept made. The AI handles the heavy lifting of technical drawing and detail work, while you focus on the creative vision. It drastically shortens the journey and saves costs on design outsourcing.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              That drawing in your notebook? It could be the next hit product. Ready to see it come alive? Upload your sketch to Genpire and watch AI turn your drawing into a factory-ready reality. Sign up with Genpire and bring your sketches to life today.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Transform Your Sketch</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
