import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Designers Use AI Tech Packs (2025)",
  description:
    "AI tech packs help designers move faster from concept to production. They standardize specifications, reduce revisions, and improve factory handoff.",
  keywords: "AI design tools, tech pack automation, product design, AI-powered design, design workflow optimization",
};

export default function DesignersNeedAITechPacksPage() {
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
              <span className="bg-black/10 text-zinc-900 text-sm font-medium px-3 py-1 rounded-full">
                Design Insights
              </span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Dec 28, 2023</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>5 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Why Every Designer Needs AI-Powered Tech Packs
            </h1>

            <p className="text-xl text-zinc-900/70 text-pretty">
              The design landscape is evolving rapidly, and AI-powered tech packs are becoming indispensable tools for
              modern creators. These intelligent systems eliminate tedious documentation tasks, reduce errors, and
              accelerate the path from concept to production. By automating technical specifications and ensuring
              manufacturing accuracy, AI tech packs free designers to focus on what they do best—creating innovative,
              beautiful products that resonate with users.
            </p>
          </div>

          {/* Share Button */}
          <div className="flex justify-end mb-8">
            <Button variant="outline" size="sm" className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-gray-50 p-8 rounded-lg mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">The AI Advantage in Design</h2>
              <p className="text-zinc-900/80 mb-4">
                Traditional tech pack creation has long been the bottleneck in product development, requiring
                specialized technical knowledge and consuming valuable creative time. Designers often find themselves
                bogged down in measurements, specifications, and manufacturing constraints instead of focusing on
                innovation and aesthetic excellence. AI-powered tech packs eliminate this friction by automating the
                technical documentation process while maintaining the precision manufacturers demand.
              </p>

              <p className="text-zinc-900/80 mb-4">
                The intelligence behind these systems goes beyond simple automation. AI analyzes design patterns,
                material properties, and manufacturing requirements to generate comprehensive technical specifications
                that would traditionally require hours of manual work. These systems learn from industry best practices,
                ensuring that generated tech packs meet professional standards while adapting to specific design
                requirements and manufacturing capabilities.
              </p>

              <p className="text-zinc-900/80 mb-4">
                Perhaps most importantly, AI tech packs reduce the communication gap between creative vision and
                manufacturing reality. By automatically generating detailed specifications, material recommendations,
                and construction guidelines, these tools ensure that manufacturers receive clear, actionable
                instructions. This clarity reduces costly revisions, minimizes production delays, and helps maintain
                design integrity throughout the manufacturing process.
              </p>

              <p className="text-zinc-900/80">
                For modern designers, AI-powered tech packs represent more than just efficiency gains—they're a
                competitive advantage. In an industry where speed to market and production accuracy determine success,
                these tools enable designers to iterate faster, communicate more effectively with manufacturers, and
                ultimately bring better products to market. The question isn't whether to adopt AI tech packs, but how
                quickly you can integrate them into your workflow.
              </p>
            </div>
          </div>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
