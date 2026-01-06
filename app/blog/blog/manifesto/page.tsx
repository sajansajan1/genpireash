import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ArrowLeft, Share2, Target, Zap, Globe } from "lucide-react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Our Vision: Powering the Future of Product Development | Genpire Blog",
  description:
    "Read Genpire's manifesto on becoming the platform that drives the majority of idea-to-product journeys globally within 3 years. Our vision for AI-powered manufacturing.",
  keywords:
    "genpire manifesto, AI product development vision, manufacturing future, tech pack platform, product development revolution",
  openGraph: {
    title: "Our Vision: Powering the Future of Product Development",
    description:
      "How Genpire aims to become the platform that drives the majority of idea-to-product journeys globally within the next 3 years.",
    type: "article",
    publishedTime: "2024-01-15T00:00:00.000Z",
    authors: ["Genpire Team"],
  },
};

export default function ManifestoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      {/* Article Header */}
      <section className="bg-gradient-to-br from-zinc-900 to-zinc-600 py-16 text-white">
        <div className="container mx-auto max-w-4xl px-4">
          <Link href="/blog" className="inline-flex items-center text-taupe hover:text-cream mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          <div className="mb-6">
            <span className="bg-taupe/20 text-cream text-sm font-medium px-3 py-1 rounded-full">Vision & Strategy</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Our Vision: Powering the Future of Product Development
          </h1>

          <p className="text-xl text-taupe/90 mb-8 text-pretty">
            How Genpire aims to become the platform that drives the majority of idea-to-product journeys globally within
            the next 3 years.
          </p>

          <div className="flex items-center gap-6 text-sm text-cream/80">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>January 15, 2024</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>8 min read</span>
            </div>
            <Button variant="outline" size="sm" className="border-taupe text-taupe hover:bg-taupe/10 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-xl text-zinc-900/80 leading-relaxed mb-6">
                In a world where innovation moves at the speed of thought, the gap between having a brilliant product
                idea and bringing it to market has never been more critical. Today, we're sharing our vision for how
                Genpire will fundamentally transform the product development landscape over the next three years.
              </p>
            </div>

            {/* Vision Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 not-prose">
              <Card className="glass-card border-none">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-taupe mx-auto mb-4" />
                  <h3 className="font-bold text-zinc-900 mb-2">Our Mission</h3>
                  <p className="text-sm text-zinc-900/70">Democratize product development for creators worldwide</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-none">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-taupe mx-auto mb-4" />
                  <h3 className="font-bold text-zinc-900 mb-2">Our Goal</h3>
                  <p className="text-sm text-zinc-900/70">Power 50%+ of global idea-to-product journeys by 2027</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-none">
                <CardContent className="p-6 text-center">
                  <Globe className="h-8 w-8 text-taupe mx-auto mb-4" />
                  <h3 className="font-bold text-zinc-900 mb-2">Our Impact</h3>
                  <p className="text-sm text-zinc-900/70">Enable millions of creators to bring ideas to life</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <h2 className="text-3xl font-bold text-zinc-900 mb-6">The Problem We're Solving</h2>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Every day, millions of creative minds around the world have product ideas that could change industries,
              solve problems, or simply bring joy to people's lives. Yet, the vast majority of these ideas never see the
              light of day. Why? Because the journey from concept to physical product is riddled with technical
              barriers, expensive consultations, and time-consuming processes that favor only those with deep industry
              knowledge and substantial resources.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-8">
              Traditional product development requires navigating complex technical specifications, understanding
              manufacturing processes, and creating detailed documentation that manufacturers can actually use. This has
              created an invisible wall between creativity and creation—one that we're determined to tear down.
            </p>

            <h2 className="text-3xl font-bold text-zinc-900 mb-6">Our Vision for 2027</h2>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              We envision a world where anyone with a product idea can transform it into a manufacturable reality within
              hours, not months. By 2027, we aim to power the majority of idea-to-product journeys globally, making
              Genpire the default platform for product development across all industries.
            </p>

            <div className="bg-cream/50 rounded-lg p-8 mb-8 not-prose">
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">The Genpire 2027 Ecosystem</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-taupe/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-taupe font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 mb-1">Universal AI Tech Pack Generation</h4>
                    <p className="text-zinc-900/70 text-sm">
                      AI that understands and generates tech packs for any product category, from fashion to electronics
                      to furniture.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-taupe/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-taupe font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 mb-1">Global Manufacturing Network</h4>
                    <p className="text-zinc-900/70 text-sm">
                      Direct connections to verified manufacturers worldwide, with automated matching based on product
                      requirements.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-taupe/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-taupe font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 mb-1">End-to-End Production Management</h4>
                    <p className="text-zinc-900/70 text-sm">
                      From initial concept to final delivery, managing every aspect of the production process.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-zinc-900 mb-6">Why This Matters Now</h2>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              We're at an inflection point in human creativity and manufacturing capability. AI has reached a level of
              sophistication where it can understand complex design requirements and translate them into precise
              technical specifications. Simultaneously, global manufacturing has become more accessible and flexible
              than ever before.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The convergence of these trends creates an unprecedented opportunity to democratize product development.
              We believe that the next great wave of innovation won't come from traditional corporations with massive
              R&D budgets, but from individual creators, small teams, and emerging markets that have been historically
              excluded from the product development ecosystem.
            </p>

            <h2 className="text-3xl font-bold text-zinc-900 mb-6">The Impact We're Creating</h2>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Our vision extends far beyond just making tech pack generation easier. We're building the infrastructure
              for a new era of distributed innovation where:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-zinc-900/80 mb-8">
              <li>
                <strong>Creators become entrepreneurs:</strong> Anyone with a good idea can test it in the market
                without massive upfront investment.
              </li>
              <li>
                <strong>Innovation accelerates globally:</strong> Great ideas can emerge from anywhere and reach global
                markets quickly.
              </li>
              <li>
                <strong>Manufacturing becomes sustainable:</strong> Better planning and specification reduce waste and
                improve efficiency.
              </li>
              <li>
                <strong>Economic opportunities expand:</strong> New pathways to entrepreneurship open up in every corner
                of the world.
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-zinc-900 mb-6">Our Commitment</h2>

            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This vision isn't just aspirational—it's our roadmap. Every feature we build, every partnership we forge,
              and every decision we make is guided by this goal of powering the majority of global idea-to-product
              journeys by 2027.
            </p>

            <p className="text-zinc-900/80 leading-relaxed mb-8">
              We're committed to maintaining the highest standards of quality, accessibility, and innovation as we
              scale. Our success will be measured not just by the number of tech packs generated, but by the number of
              dreams realized, businesses launched, and lives changed through the products created on our platform.
            </p>

            <div className="bg-zinc-900 rounded-lg p-8 text-white mb-8 not-prose">
              <h3 className="text-2xl font-bold text-cream mb-4">Join Us on This Journey</h3>
              <p className="text-cream/90 mb-6">
                Whether you're a designer with a sketch, an entrepreneur with an idea, or a manufacturer looking to
                connect with creators, you're part of this vision. Together, we're not just building a platform—we're
                building the future of how products come to life.
              </p>
              <Button className="bg-taupe text-zinc-900 hover:bg-taupe/90">Start Your Journey Today</Button>
            </div>

            <p className="text-zinc-900/80 leading-relaxed text-lg font-medium">
              The future of product development is here, and it's more accessible, more democratic, and more exciting
              than ever before. Welcome to the Genpire era.
            </p>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <h3 className="text-2xl font-bold text-zinc-900 mb-8 text-center">Continue Reading</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-black/10 text-zinc-900 text-xs font-medium px-2 py-1 rounded">How-To Guide</span>
                  <span className="text-xs text-zinc-900/60">12 min read</span>
                </div>
                <h4 className="font-bold text-zinc-900 mb-2">From Sketch to Factory: The Complete Tech Pack Journey</h4>
                <p className="text-zinc-900/70 text-sm mb-4">
                  A comprehensive guide to transforming your product ideas into manufacturing-ready technical
                  specifications.
                </p>
                <Link href="/blog/sketch-to-factory-journey">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                  >
                    Read Article
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-black/10 text-zinc-900 text-xs font-medium px-2 py-1 rounded">
                    Industry Trends
                  </span>
                  <span className="text-xs text-zinc-900/60">6 min read</span>
                </div>
                <h4 className="font-bold text-zinc-900 mb-2">The Future of AI in Manufacturing: 2024 Trends</h4>
                <p className="text-zinc-900/70 text-sm mb-4">
                  Exploring how artificial intelligence is revolutionizing product development and manufacturing
                  processes.
                </p>
                <Link href="/blog/ai-manufacturing-trends-2024">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                  >
                    Read Article
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
