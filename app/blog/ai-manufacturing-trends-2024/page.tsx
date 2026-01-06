import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Future of AI in Manufacturing: 2024 Trends | Genpire Blog",
  description:
    "Exploring how artificial intelligence is revolutionizing product development and manufacturing processes across industries in 2024.",
  keywords:
    "AI manufacturing, artificial intelligence trends, product development, manufacturing technology, AI automation",
};

export default function AIManufacturingTrendsPage() {
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
                Industry Trends
              </span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 10, 2024</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>6 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              The Future of AI in Manufacturing: 2024 Trends
            </h1>

            <p className="text-xl text-zinc-900/70 text-pretty">
              Artificial intelligence is transforming manufacturing at unprecedented speed. From predictive maintenance
              to automated quality control, AI technologies are reshaping how products move from concept to consumer.
              This revolution extends beyond automation—it's creating intelligent systems that learn, adapt, and
              optimize production processes in real-time.
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
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">The AI Manufacturing Revolution</h2>
              <p className="text-zinc-900/80 mb-4">
                The manufacturing landscape is experiencing a seismic shift as artificial intelligence technologies
                mature and become more accessible. In 2024, we're witnessing the convergence of machine learning,
                computer vision, and IoT sensors creating smart factories that can predict failures before they occur,
                optimize energy consumption in real-time, and maintain consistent quality standards across global
                production lines.
              </p>

              <p className="text-zinc-900/80 mb-4">
                One of the most significant trends is the rise of AI-powered predictive maintenance systems. These
                intelligent platforms analyze vibration patterns, temperature fluctuations, and acoustic signatures to
                identify potential equipment failures weeks before they would traditionally be detected. This proactive
                approach is reducing unplanned downtime by up to 50% and extending machinery lifespan significantly.
              </p>

              <p className="text-zinc-900/80 mb-4">
                Quality control has also been revolutionized through computer vision systems that can detect microscopic
                defects invisible to human inspectors. These AI systems process thousands of images per minute, ensuring
                consistent product quality while reducing waste and rework costs. The technology is particularly
                transformative in industries like electronics, automotive, and pharmaceuticals where precision is
                paramount.
              </p>

              <p className="text-zinc-900/80">
                Looking ahead, the integration of generative AI in product design and development processes promises to
                accelerate innovation cycles. Companies are already using AI to generate multiple design variations,
                optimize material usage, and simulate performance under various conditions—all before physical
                prototyping begins. This shift toward AI-native manufacturing processes is not just improving
                efficiency; it's fundamentally changing how we conceptualize and create products.
              </p>
            </div>
          </div>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
