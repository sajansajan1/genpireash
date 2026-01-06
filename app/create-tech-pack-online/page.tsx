import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Brain, FileText, Factory, Zap, Clock, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Create Tech Pack Online | AI-Powered Tech Pack Generator",
  description:
    "Create professional tech packs online in minutes with AI. Generate factory-ready documentation for apparel, accessories, and products. No experience needed.",
  keywords:
    "create tech pack online, tech pack generator, online tech pack maker, AI tech pack, product development tool",
  openGraph: {
    title: "Create Tech Pack Online | AI-Powered Tech Pack Generator",
    description:
      "Create professional tech packs online in minutes with AI. Generate factory-ready documentation for any product.",
    url: "https://genpire.ai/create-tech-pack-online",
  },
}

export default function CreateTechPackOnline() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Create a Tech Pack Online</h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">From Idea to Production in Minutes</p>
            <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto">
              Traditional tech pack creation takes hours or even days. Genpire lets you generate a factory-ready tech
              pack in just 60 seconds. No prior experience needed.
            </p>
          </div>
        </section>

        {/* Speed Comparison */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Traditional vs. AI-Powered Creation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2 border-red-200">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-red-700 mb-4">Traditional Method</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-center">
                      <Clock className="h-5 w-5 text-red-500 mr-3" />
                      2-5 days of work
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-5 w-5 text-red-500 mr-3" />
                      Requires design experience
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-5 w-5 text-red-500 mr-3" />
                      Multiple software tools needed
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-5 w-5 text-red-500 mr-3" />
                      Costly revisions
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-green-700 mb-4">Genpire AI Method</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-center">
                      <Zap className="h-5 w-5 text-green-500 mr-3" />
                      60 seconds generation
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-5 w-5 text-green-500 mr-3" />
                      No experience required
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-5 w-5 text-green-500 mr-3" />
                      All-in-one platform
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-5 w-5 text-green-500 mr-3" />
                      Instant revisions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-slate-900 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">AI-Powered Prompts</h3>
                  <p className="text-slate-600">
                    Simply describe your product idea and our AI understands exactly what you need to create.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-900 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Complete Documentation</h3>
                  <p className="text-slate-600">
                    Get clear size specs, materials, costs, and visuals all in one comprehensive package.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Factory className="h-12 w-12 text-slate-900 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Factory Ready</h3>
                  <p className="text-slate-600">
                    Your tech pack is accepted by global manufacturers and ready for production.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">What's Included in Your Tech Pack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Technical drawings and flat sketches",
                "Detailed material specifications",
                "Size charts and measurement tables",
                "Color palettes and Pantone codes",
                "Manufacturing instructions",
                "Quality control guidelines",
                "Packaging specifications",
                "Cost estimation breakdown",
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-slate-600 text-lg">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Create Your Tech Pack?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of creators who've brought their products to life with Genpire
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg transform transition-transform hover:scale-105"
            >
              <Link href="/">Generate My Tech Pack</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
