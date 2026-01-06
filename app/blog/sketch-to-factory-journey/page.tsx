import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "From Sketch to Factory: The Complete Tech Pack Journey | Genpire Blog",
  description:
    "A comprehensive guide to transforming your product ideas into manufacturing-ready technical specifications with AI-powered tech packs.",
  keywords:
    "tech pack guide, product development, manufacturing specifications, design to production, technical documentation",
};

export default function SketchToFactoryJourneyPage() {
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
              <span className="bg-black/10 text-zinc-900 text-sm font-medium px-3 py-1 rounded-full">How-To Guide</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 5, 2024</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>12 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              From Sketch to Factory: The Complete Tech Pack Journey
            </h1>

            <p className="text-xl text-zinc-900/70 text-pretty">
              Transforming a creative concept into a manufacturable product requires precise technical documentation.
              Tech packs serve as the bridge between design vision and factory production, containing every detail
              manufacturers need to bring your ideas to life. This comprehensive guide walks you through each stage of
              the tech pack development process, from initial sketches to production-ready specifications.
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
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">The Tech Pack Development Process</h2>
              <p className="text-zinc-900/80 mb-4">
                The journey from initial sketch to factory-ready product begins with understanding that tech packs are
                the universal language between designers and manufacturers. These comprehensive documents contain every
                specification, measurement, and detail needed to produce your product consistently and accurately.
                Without proper tech packs, even the most brilliant designs can be lost in translation during
                manufacturing.
              </p>

              <p className="text-zinc-900/80 mb-4">
                The first stage involves translating your creative vision into technical drawings and specifications.
                This includes detailed flat sketches, construction details, material specifications, color standards,
                and precise measurements. Every seam, every button placement, and every fabric choice must be documented
                with manufacturing precision. Traditional tech pack creation often takes weeks of back-and-forth
                communication between designers and technical specialists.
              </p>

              <p className="text-zinc-900/80 mb-4">
                Modern AI-powered platforms are revolutionizing this process by automatically generating technical
                specifications from design inputs. These intelligent systems can analyze sketches, suggest appropriate
                materials based on design intent, calculate optimal measurements, and even predict potential
                manufacturing challenges before they occur. This automation reduces development time from weeks to days
                while maintaining the accuracy manufacturers require.
              </p>

              <p className="text-zinc-900/80">
                The final stage involves validation and iteration, where tech packs are refined based on manufacturer
                feedback and prototype results. AI systems excel here by learning from each iteration, building
                knowledge bases that improve future tech pack accuracy. This continuous improvement cycle ensures that
                each project benefits from the collective intelligence of previous developments, creating a smarter,
                more efficient design-to-production pipeline.
              </p>
            </div>
          </div>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
