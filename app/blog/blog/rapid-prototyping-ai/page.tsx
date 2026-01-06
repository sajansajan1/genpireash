import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rapid Prototyping with AI – Go from Idea to Design in Days",
  description:
    "Why wait months for a prototype? See how AI-powered tools let you generate product designs and virtual prototypes in days, accelerating your path to a real sample. Try Genpire.",
  keywords: "rapid prototyping, AI prototype, fast design, virtual prototype, Genpire prototyping",
};

export default function RapidPrototypingAIPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Prototyping</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 21, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>5 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Rapid Prototyping: From Idea to Prototype in Days with AI
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
              In the traditional product world, getting a prototype made could take months. You'd sketch an idea, hire a designer for CAD drawings, then wait for a factory or workshop to create a sample. For a fast-moving startup, that timeline is a non-starter. AI speeds things up dramatically. With Genpire's help, you can move from a rough idea to a polished product design – and even a virtual prototype – in a matter of days.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">How AI Accelerates Prototyping</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              First, AI accelerates the design phase. Describe your concept or upload a rough sketch, and Genpire's AI quickly generates detailed design renderings and 3D models. This means within 24-48 hours, you could be looking at a realistic image of your product, not just imagining it.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Next, because you have a complete design and tech pack so quickly, you can seek out a rapid prototyping method immediately. Some founders take the 3D model from Genpire and use a 3D printer or local maker space to create a physical prototype for initial feedback. Others send Genpire's spec to a quick-turn sample maker. Either way, you've shaved weeks off the calendar.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Why Speed Matters</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Apart from beating competitors to market, a fast prototype lets you start showing customers, investors, or stakeholders your idea in tangible form. You can gather feedback and make improvements while others are still stuck in the sketch phase. It's the essence of agile development, applied to hardware.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              By going from idea to prototype in days, you maintain momentum and enthusiasm – for both you and your potential customers.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Ready to accelerate your development? Give Genpire's AI prototyping approach a try, and see how quickly you can bring your idea to life. Start prototyping smarter and faster with Genpire today.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Start Rapid Prototyping</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
