import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Target, TrendingUp, Users, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product Launch Support Services | Genpire - Launch Your Product Successfully",
  description:
    "Expert product launch support services to ensure your product reaches market successfully. From launch strategy to market entry, get comprehensive support for your product launch.",
  keywords:
    "product launch support, product launch strategy, market entry, product marketing, launch planning, go-to-market strategy, product launch services",
};

export default function ProductLaunchSupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Rocket className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              Product Launch <span className="text-taupe">Support Services</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Turn your product vision into market success with comprehensive launch support services. From strategy
              development to market entry execution, we guide you through every step of your product launch journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                Get Launch Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
              >
                View Launch Strategies
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Comprehensive Product Launch Support</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Everything you need to introduce your product to market with confidence and achieve sustainable success.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-0 shadow-lg bg-white p-6">
                <Target className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-zinc-900">Launch Strategy Development</h3>
                <p className="text-zinc-900/70">
                  Develop comprehensive go-to-market strategies tailored to your product, target audience, and market
                  conditions for maximum impact.
                </p>
              </Card>

              <Card className="border-0 shadow-lg bg-white p-6">
                <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-zinc-900">Market Entry Planning</h3>
                <p className="text-zinc-900/70">
                  Strategic market entry planning including timing, positioning, pricing strategies, and competitive
                  analysis for successful market penetration.
                </p>
              </Card>

              <Card className="border-0 shadow-lg bg-white p-6">
                <Users className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-zinc-900">Marketing & Promotion</h3>
                <p className="text-zinc-900/70">
                  Comprehensive marketing campaigns, promotional strategies, and brand positioning to create buzz and
                  drive initial sales.
                </p>
              </Card>

              <Card className="border-0 shadow-lg bg-white p-6">
                <CheckCircle className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-zinc-900">Launch Execution</h3>
                <p className="text-zinc-900/70">
                  End-to-end launch execution support including logistics coordination, quality assurance, and
                  performance monitoring.
                </p>
              </Card>
            </div>

            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">Why Product Launch Support Matters</h3>
              <p className="text-zinc-900/70 mb-6">
                The product launch phase is critical to long-term success. Studies show that products with well-planned
                launches are 60% more likely to achieve their first-year sales targets. Our launch support services help
                you navigate common pitfalls and create momentum that sustains growth.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Launch Your Product with Confidence</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Ready to bring your product to market successfully? Genpire's AI-powered tech pack generation provides the
              foundation for successful product launches with precise, production-ready specifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/">
                  Start Your Tech Pack
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/about">Get Launch Consultation</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
