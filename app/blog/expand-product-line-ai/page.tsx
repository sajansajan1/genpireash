import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expand Your Product Line with AI – No Category Expertise Needed",
  description:
    "Want to create products outside your comfort zone? AI tools like Genpire let you design in new categories without prior expertise by guiding specifications and material choices for you.",
  keywords: "product line expansion, new categories, AI guidance, diversification, Genpire expansion",
};

export default function ExpandProductLineAIPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Expansion</span>
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
              New Category, No Problem: Expand Your Product Line with AI
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
              Many successful brands eventually branch out into new product categories – a fashion label adding accessories, a beauty brand launching wellness gadgets, etc. However, stepping into a category you know little about can be intimidating. Different products have different design rules and manufacturing quirks. Thankfully, AI can be your guide into the unknown. Genpire's platform comes pre-loaded with knowledge of various industries, so it can help you design products outside your expertise.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Bridge the Knowledge Gap</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Consider this scenario: You run a popular home decor brand mainly selling textiles, and you want to introduce small furniture pieces. You're not a furniture expert – but Genpire's AI can assist. You could describe a side table concept to the AI, and it will generate a design that follows furniture design principles (like stable dimensions, appropriate materials). It might recommend using solid wood or metal for durability and provide specs that ensure the table can hold weight safely. All of a sudden, you have a credible side table design ready to prototype, without having hired a furniture designer.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Cross-Category Success</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The same applies across categories. If a skincare brand wants to design a beauty tool, or a tech accessory company wants to create a backpack, AI bridges the knowledge gap. It suggests the right materials (heat-resistant silicone for that beauty tool, durable fabrics for the backpack) and creates the tech pack accordingly.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              By lowering the knowledge barrier, AI empowers you to expand your product line strategically. You can test new markets and diversify revenue streams without years of experience in each niche.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Your creativity doesn't have to stay in one lane. Ready to explore a new category? Let Genpire's AI lead the way and give you a head start in designing something outside your comfort zone. With Genpire, you can confidently expand your product empire.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Expand Your Line</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
