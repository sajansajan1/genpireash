import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Zap, Target, ArrowRight, Sparkles, Brain, Rocket } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Product Idea Generator | Genpire",
  description:
    "Generate innovative product ideas with AI. Transform market insights into profitable product concepts in seconds.",
}

export default function ProductIdeaGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              AI Product Idea <span className="text-taupe">Generator</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Transform market insights into profitable product concepts. Our AI analyzes trends, consumer behavior, and
              market gaps to generate innovative product ideas tailored to your niche.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Ideas Now
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">How Our AI Generates Winning Ideas</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Our advanced AI combines market research, trend analysis, and consumer insights to create product ideas
                with real market potential.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    AI analyzes current market trends, consumer behavior patterns, and emerging opportunities to
                    identify profitable niches.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Gap Identification</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Discovers unmet consumer needs and market gaps where new products could succeed and generate
                    revenue.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Concept Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Creates detailed product concepts with features, target audience, pricing strategy, and go-to-market
                    approach.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">From Idea to Tech Pack in Minutes</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Instant Generation</h3>
                      <p className="text-zinc-900/70">
                        Generate multiple product ideas in seconds, not weeks of brainstorming.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Target className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Market-Validated</h3>
                      <p className="text-zinc-900/70">Every idea is backed by real market data and consumer insights.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <ArrowRight className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Direct to Tech Pack</h3>
                      <p className="text-zinc-900/70">
                        Seamlessly convert your favorite ideas into production-ready tech packs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Popular Categories</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Fashion & Apparel</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Hot</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Home & Living</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Trending</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Tech Accessories</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Growing</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Sustainable Products</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Emerging</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Discover Your Next Big Product?</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Join thousands of creators using AI to generate profitable product ideas and turn them into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Generating Ideas
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/create-tech-pack-online">Create Tech Pack</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
