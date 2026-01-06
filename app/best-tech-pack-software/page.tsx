import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Star, Zap, DollarSign, Users, Clock, CheckCircle, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Best Tech Pack Software (2025) | Top Tools Compared",
  description:
    "Compare the best tech pack software in 2025 by features, workflows, and use cases. Find the right tech pack maker for your brand.",
  keywords:
    "best tech pack software 2025, tech pack tools, tech pack creator, fashion design software, product development tools",
  openGraph: {
    title: "Best Tech Pack Software (2025) | Top Tools Compared",
    description:
      "Compare the best tech pack software in 2025 by features, workflows, and use cases. Find the right tech pack maker for your brand.",
    url: "https://www.genpire.com/best-tech-pack-software",
  },
};

export default function BestTechPackSoftware2025() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-600"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Sparkles className="h-4 w-4 mr-2" />
              2025 Comparison Guide
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Best Tech Pack Software of 2025</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Our Top Picks for Product Creators & Designers
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Looking for the best way to create your product's tech pack? Here's our 2025 list of platforms used by
                designers, brands, and startups worldwide.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Software Comparison</h2>
              <p className="text-lg text-[#1C1917] max-w-2xl mx-auto">
                Compare features, pricing, and capabilities to find the perfect solution for your needs
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="relative border-2 border-navy bg-gradient-to-br from-navy/5 to-navy/10 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-zinc-900 text-white px-6 py-2 text-sm font-bold shadow-lg">🏆 RECOMMENDED</Badge>
                </div>
                <CardHeader className="text-center pt-8 pb-6">
                  <CardTitle className="text-2xl font-bold text-zinc-900 mb-4">Genpire</CardTitle>
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-zinc-900 font-semibold">AI-powered, instant generation</p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center glass-card rounded-lg p-3">
                      <Zap className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-zinc-900 font-medium">3-minute generation</span>
                    </div>
                    <div className="flex items-center glass-card rounded-lg p-3">
                      <DollarSign className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-zinc-900 font-medium">
                        Starting from $14.90 a month for 10-20 tech packs and much more!
                      </span>
                    </div>
                    <div className="flex items-center glass-card rounded-lg p-3">
                      <Users className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-zinc-900 font-medium">No experience needed</span>
                    </div>
                    <div className="flex items-center glass-card rounded-lg p-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-zinc-900 font-medium">Factory-ready output</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-zinc-900">From $14.90</span>
                      <p className="text-[#1C1917]">monthly</p>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-zinc-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <Link href="/">
                        Try Free
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-zinc-900 mb-4">Adobe Illustrator + Excel</CardTitle>
                  <div className="flex justify-center mb-4">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    {[...Array(2)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-gray-300" />
                    ))}
                  </div>
                  <p className="text-[#1C1917]">Manual, full control</p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center p-3 rounded-lg border border-red-200 bg-red-50">
                      <Clock className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">2-5 days per pack</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-red-200 bg-red-50">
                      <DollarSign className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">$50+ monthly + time</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-red-200 bg-red-50">
                      <Users className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Design skills required</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-green-200 bg-green-50">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Complete customization</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-zinc-900">$50+</span>
                      <p className="text-[#1C1917]">monthly + hours</p>
                    </div>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-500 bg-transparent" disabled>
                      Complex Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-zinc-900 mb-4">Renowned Competitors</CardTitle>
                  <div className="flex justify-center mb-4">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <Star className="h-5 w-5 text-gray-300" />
                  </div>
                  <p className="text-[#1C1917]">Cloud-based, better for teams</p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                      <Clock className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">1-2 days per pack</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                      <DollarSign className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">$29-99 monthly</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                      <Users className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Learning curve</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-green-200 bg-green-50">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Team collaboration</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-zinc-900">$29-99</span>
                      <p className="text-[#1C1917]">monthly</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Genpire Leads in 2025</h2>
              <p className="text-lg text-[#1C1917]">The clear choice for modern product creators</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900">Speed & Efficiency</h3>
                  </div>
                  <p className="text-[#1C1917]">
                    While traditional methods take days, Genpire generates professional tech packs in 3 minutes. Perfect
                    for fast-moving product development cycles.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900">Beginner-Friendly</h3>
                  </div>
                  <p className="text-[#1C1917]">
                    No design skills or technical knowledge required. Simply describe your product and get a complete,
                    factory-ready tech pack.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900">Cost-Effective</h3>
                  </div>
                  <p className="text-[#1C1917]">
                    At $19.90 per tech pack, it's significantly cheaper than hiring designers or purchasing expensive
                    software subscriptions.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900">Industry Standard</h3>
                  </div>
                  <p className="text-[#1C1917]">
                    Generated tech packs are accepted by manufacturers worldwide and include all necessary
                    specifications for production.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-8">Our 2025 Recommendation</h2>
            <div className="glass-card rounded-2xl p-8 shadow-xl border border-taupe/20">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-black/5 border border-navy/10">
                  <p className="text-lg text-zinc-900 font-semibold mb-2">For solo creators and first-timers</p>
                  <p className="text-[#1C1917]">
                    Genpire is the fastest way to go from prompt to pack. The AI handles all the technical complexity
                    while you focus on your product vision.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-taupe/20 border border-taupe/30">
                  <p className="text-lg text-zinc-900 font-semibold mb-2">For established teams</p>
                  <p className="text-[#1C1917]">
                    Consider Genpire for rapid prototyping and initial drafts, then refine with traditional tools if
                    needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Try the #1 Tech Pack Software?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of creators who've chosen Genpire for their product development needs.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4 text-lg"
            >
              <Link href="/">
                Generate Your Tech Pack Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
