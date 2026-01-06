import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Pack 101 – How AI Makes Your Product Specs Foolproof",
  description:
    "New to tech packs? Learn what goes into a great product spec sheet and how AI-generated tech packs ensure every detail is covered. With Genpire, manufacturers get exactly what they need—no guesswork.",
  keywords: "tech pack basics, AI specs, product specifications, foolproof specs, Genpire tech pack",
};

export default function TechPack101AISpecsPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Tech Pack 101</span>
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
              Tech Pack 101: Why AI-Generated Specs Leave No Room for Guesswork
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
              If you're new to product development, you might be asking: what exactly is a tech pack, and why do you need one? Think of a tech pack as the instruction manual for manufacturing your product. It tells the factory everything they need to know to get your product right. When a tech pack is incomplete or unclear, the factory is left guessing – and that's a recipe for mistakes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">What's in a Tech Pack?</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              A solid tech pack typically includes:
            </p>
            <ul className="list-disc list-inside space-y-3 text-zinc-900/80 leading-relaxed mb-6">
              <li><strong>Product drawings or flats:</strong> Visuals showing front, back, side views.</li>
              <li><strong>Dimensions & sizing:</strong> Every measurement for each size or variant of the product.</li>
              <li><strong>Materials & components:</strong> Exactly what materials to use (fabric type, plastic grade, etc.), including any specific part codes if applicable.</li>
              <li><strong>Colorways & branding:</strong> The colors for each part of the product, and placement of logos or labels.</li>
              <li><strong>Construction details:</strong> How it's made – stitch types, seam allowances, finishes, or assembly instructions.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Common Mistakes</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              For a first-timer, it's easy to miss some of these details. For example, you might specify a material but forget to indicate the thickness or finish, leading a factory to make an assumption. These gaps force manufacturers to guess, and you might not like their guesses.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Why AI Makes It Foolproof</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This is where Genpire's AI makes your life so much easier. By generating the tech pack for you, it ensures no key detail is overlooked or left ambiguous. The AI has a checklist (so to speak) of all the info a factory will need. Measurements are precise, terminology is standardized, and nothing is left to interpretation.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The result? Your manufacturer can do their job without sending a dozen emails for clarification. You get faster, more accurate quotes and samples. In short, AI makes your specs foolproof.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              If you want to skip the rookie mistakes and present like a pro, let Genpire handle your tech pack. Create a complete, no-guesswork tech pack with Genpire and move forward with confidence.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Create Perfect Tech Packs</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
