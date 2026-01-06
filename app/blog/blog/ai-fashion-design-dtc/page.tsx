import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-Powered Fashion Design – Launch Apparel Without a Big Team",
  description:
    "Dream of starting a fashion line? AI design tools level the playing field. See how Genpire helps new apparel brands create designs, tech packs, and connect with manufacturers—all without a large team.",
  keywords: "fashion design, AI apparel, clothing line, fashion tech pack, Genpire fashion",
};

export default function AIFashionDesignDTCPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Fashion</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 21, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>8 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              AI-Powered Fashion Design: Launching Apparel Without a Big Team
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
              Starting a fashion line used to require a small army: fashion designers for sketches, technical designers for patterns and tech packs, and seasoned production managers to liaise with factories. That's a high barrier for an indie creator or a small brand. AI is changing the couture game. With Genpire's AI-powered fashion design tools, launching an apparel line is more accessible than ever – even without a big team.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">From Vision to Collection</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Imagine you have a vision for a clothing collection – say, a line of sustainable streetwear. You can describe each piece (or provide inspiration images) to Genpire, and the AI will generate design concepts for jackets, shirts, dresses, whatever you dream up. These aren't just pretty sketches; the AI provides detailed flats (technical drawings) and suggests materials like organic cotton or recycled fabrics if sustainability is your angle.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Once you like a design, Genpire creates the tech pack: measurements for each size, points of measure diagrams, fabric and trim details, and more. It's the same kind of document a professional fashion house would hand to a factory. But here you got it with a few clicks, not weeks of back-and-forth with a patternmaker.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Connecting with Manufacturers</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Even finding a manufacturer gets simpler. If you have your Genpire-generated tech pack, you can approach clothing manufacturers (even those open to low volumes) and show them exactly what to make. They'll take you seriously because your specs are clear and complete.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The bottom line? You can focus on style and brand vision while AI handles the heavy lifting of design execution.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Got a fashion idea itching to become reality? Genpire can be your virtual design team. Design, refine, and produce your apparel line with Genpire – no big team required.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Start Your Fashion Line</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
