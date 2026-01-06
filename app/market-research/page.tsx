import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Search, Users, TrendingUp, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Market Research Services | Genpire - Data-Driven Product Insights",
  description:
    "Professional market research services to validate your product ideas and understand market opportunities. Get comprehensive market analysis and consumer insights for informed product decisions.",
  keywords:
    "market research, market analysis, consumer insights, product validation, market opportunity, competitive analysis, market research services, product market fit",
};

export default function MarketResearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              Market Research <span className="text-taupe">Services</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Make informed product decisions with comprehensive market research and consumer insights. Validate your
              ideas, understand market opportunities, and reduce risk with data-driven intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                Get Market Insights
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
              >
                View Research Methods
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Comprehensive Market Research Solutions</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Understanding your market is the foundation of successful product development. Our market research
                services provide the critical insights you need to validate product concepts and make strategic
                decisions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-0 shadow-lg bg-white p-6">
                <Search className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-zinc-900">Market Analysis</h3>
                <p className="text-zinc-900/70">
                  Comprehensive market size analysis, growth trends, and opportunity identification to understand your
                  market landscape and potential.
                </p>
              </Card>

              <Card className="border-0 shadow-lg bg-white p-6">
                <Users className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-zinc-900">Consumer Insights</h3>
                <p className="text-zinc-900/70">
                  Deep consumer behavior analysis, preferences, pain points, and purchasing patterns to inform product
                  development and positioning.
                </p>
              </Card>

              <Card className="border-0 shadow-lg bg-white p-6">
                <Target className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-zinc-900">Competitive Intelligence</h3>
                <p className="text-zinc-900/70">
                  Detailed competitive landscape analysis, positioning strategies, and market gap identification for
                  strategic advantage.
                </p>
              </Card>

              <Card className="border-0 shadow-lg bg-white p-6">
                <TrendingUp className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-zinc-900">Product Validation</h3>
                <p className="text-zinc-900/70">
                  Product concept testing, market fit validation, and demand forecasting to reduce development risk and
                  optimize product-market fit.
                </p>
              </Card>
            </div>

            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">The Power of Market Intelligence</h3>
              <p className="text-zinc-900/70 mb-6">
                Market research is not just about gathering data—it's about transforming information into actionable
                insights that drive successful product decisions. Companies that invest in thorough market research are
                70% more likely to achieve product-market fit and 50% more likely to exceed revenue targets.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Turn Market Insights into Product Success</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Ready to validate your product ideas with solid market research? Genpire's AI-powered tech pack generation
              helps you translate market insights into precise manufacturing specifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/">
                  Create Your Tech Pack
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/about">Get Research Consultation</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
