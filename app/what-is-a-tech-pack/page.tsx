import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import {
  FileText,
  Ruler,
  Palette,
  Package,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
} from "lucide-react";

export const metadata: Metadata = {
  title: "What Is a Tech Pack? Definition and Examples (2025)",
  description:
    "A tech pack, also called a technical package, is the document manufacturers use to produce your product. Learn what it includes, why it matters, and see examples.",
  keywords:
    "what is a tech pack, technical package, tech pack definition, manufacturing documentation, product development, fashion tech pack",
  openGraph: {
    title: "What Is a Tech Pack? Definition and Examples (2025)",
    description:
      "A tech pack, also called a technical package, is the document manufacturers use to produce your product. Learn what it includes, why it matters, and see examples.",
    url: "https://www.genpire.com/what-is-a-tech-pack",
  },
};

export default function WhatIsATechPack() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Sparkles className="h-4 w-4 mr-2" />
              Complete Guide
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">What Is a Tech Pack?</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">Your Product's Blueprint for Manufacturing</p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                A tech pack (technical package) is a document that communicates every detail of your product to a
                manufacturer. It's the bridge between your creative vision and the final product that customers will
                hold in their hands.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">What's Inside a Tech Pack?</h2>
              <p className="text-lg text-[#1C1917] max-w-2xl mx-auto">
                Every tech pack contains these essential components to ensure perfect manufacturing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Technical Drawings</h3>
                  <p className="text-[#1C1917]">
                    Detailed flat sketches showing front, back, and side views with construction details and design
                    elements for precise manufacturing.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Palette className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Materials & Fabric Specs</h3>
                  <p className="text-[#1C1917]">
                    Complete material specifications including fabric types, weights, colors, and supplier information
                    for consistent quality.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Ruler className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Measurement Tables</h3>
                  <p className="text-[#1C1917]">
                    Precise size charts and grading specifications for all product dimensions across different sizes and
                    variations.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Branding Guidelines</h3>
                  <p className="text-[#1C1917]">
                    Logo placement, label specifications, and brand identity elements for consistent product
                    presentation across all units.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Packaging Instructions</h3>
                  <p className="text-[#1C1917]">
                    Detailed packaging requirements, folding instructions, and shipping specifications for optimal
                    product presentation.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Quality Standards</h3>
                  <p className="text-[#1C1917]">
                    Manufacturing tolerances, quality control checkpoints, and acceptance criteria to ensure consistent
                    production quality.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Is a Tech Pack Essential?</h2>
              <p className="text-lg text-[#1C1917]">
                The critical benefits that make tech packs indispensable for manufacturing
              </p>
            </div>

            <div className="space-y-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900 mb-4">Prevents Costly Mistakes</h3>
                      <p className="text-[#1C1917] text-lg">
                        Clear specifications eliminate guesswork and reduce the risk of production errors that could
                        cost thousands in remakes. A single mistake can delay your entire product launch.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900 mb-4">Speeds Up Production</h3>
                      <p className="text-[#1C1917] text-lg">
                        Manufacturers can start production immediately without back-and-forth clarifications, reducing
                        lead times significantly and getting your product to market faster.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900 mb-4">Ensures Quality Consistency</h3>
                      <p className="text-[#1C1917] text-lg">
                        Detailed specifications ensure every unit produced meets your exact standards, regardless of
                        production location or batch size, maintaining brand integrity.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-8">Essential for Global Manufacturing</h2>
            <div className="glass-card rounded-2xl p-8 mb-12 shadow-xl">
              <p className="text-lg text-[#1C1917] mb-8">
                Whether you're producing in China, Turkey, India, or the USA — a solid tech pack is your best insurance
                policy for avoiding mistakes and delays. It serves as a universal language that transcends cultural and
                linguistic barriers.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { flag: "🇨🇳", country: "China", specialty: "Electronics & Apparel" },
                  { flag: "🇹🇷", country: "Turkey", specialty: "Textiles & Leather" },
                  { flag: "🇮🇳", country: "India", specialty: "Garments & Accessories" },
                  { flag: "🇺🇸", country: "USA", specialty: "Premium & Custom" },
                ].map((location, index) => (
                  <Card
                    key={index}
                    className="glass-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{location.flag}</div>
                      <h3 className="font-semibold text-zinc-900 mb-1">{location.country}</h3>
                      <p className="text-xs text-[#1C1917]">{location.specialty}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Tech Pack?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Don't let incomplete documentation delay your product launch. Create a professional tech pack in minutes.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4 text-lg"
            >
              <Link href="/">
                Try Our AI Tech Pack Generator
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
