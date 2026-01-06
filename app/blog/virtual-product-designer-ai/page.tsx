import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI as Your Virtual Product Designer – No Design Team Needed",
  description:
    "Solo founder without a design team? Discover how Genpire's AI acts as your virtual product designer, helping you craft professional product designs and specs all by yourself.",
  keywords: "virtual designer, AI design, solo founder, product design, Genpire designer",
};

export default function VirtualProductDesignerAIPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Design</span>
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
              AI as Your Virtual Product Designer: No Design Team, No Problem
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
              Got a killer product idea but no designer on staff to bring it to life? It's a common challenge for solo founders and small startups. Hiring professional product designers or learning complex 3D software yourself can be time-consuming and expensive. Luckily, AI can fill the gap. Genpire's platform essentially gives you a virtual product designer at your fingertips.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Your Creative Partner</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              You can start by describing your idea in plain language or with a simple sketch. The AI will generate polished design concepts based on your input. It's like having a creative partner who never runs out of ideas or patience. Not happy with the first concept? You can tweak the details or ask for alternatives, and the AI will quickly come back with revised designs. This iterative loop mimics the back-and-forth you'd have with a human designer – but it happens in minutes, not days.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Beyond Pretty Pictures</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The best part is that the AI doesn't just give you pretty pictures. It produces the technical details too. Every design comes with the measurements, specs, and material suggestions a factory would need. So you're not only getting a rendered image of your product, but also the blueprint to actually make it.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For founders without a design team, this means you can go from idea to a fully fleshed-out product by yourself. You maintain creative control and can experiment freely, without worrying about hourly design fees. Your lack of an in-house team is no longer a bottleneck.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Ready to design your product solo? With Genpire's AI as your virtual designer, you have all the tools you need to create something amazing on your own. Sign up for Genpire and watch your idea take shape – no design team required.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Get Your Virtual Designer</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
