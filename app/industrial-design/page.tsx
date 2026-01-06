import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Settings, Target, Layers, ArrowRight, CheckCircle, Cog, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Industrial Design Services | Professional Product Engineering",
  description:
    "Expert industrial design services for manufacturing-ready products. Functional design, engineering integration, and production optimization for successful products.",
  keywords:
    "industrial design, product engineering, manufacturing design, functional design, design for manufacturing, industrial design services",
  openGraph: {
    title: "Industrial Design Services | Professional Product Engineering",
    description:
      "Expert industrial design services for manufacturing-ready products. Functional design and production optimization.",
    url: "https://genpire.ai/industrial-design",
  },
};

export default function IndustrialDesign() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Settings className="h-4 w-4 mr-2" />
              Engineering Excellence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Industrial Design</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Where Form Meets Function for Manufacturing Success
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Industrial design bridges the gap between creative vision and manufacturing reality. We create products
                that are not only beautiful and user-friendly but also optimized for efficient, cost-effective
                production at scale.
              </p>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Industrial Design Principles</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Balancing aesthetics, functionality, and manufacturability for optimal product success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Function-First Design</h3>
                  <p className="text-zinc-900/70">
                    Every design decision serves a purpose. We prioritize functionality and user needs while creating
                    products that perform reliably in real-world conditions and manufacturing environments.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Cog className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Manufacturing Integration</h3>
                  <p className="text-zinc-900/70">
                    Design with production in mind from day one. We consider tooling requirements, material properties,
                    and assembly processes to ensure efficient, cost-effective manufacturing.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Durability & Quality</h3>
                  <p className="text-zinc-900/70">
                    Engineer products for longevity and reliability. We design robust solutions that withstand use,
                    environmental conditions, and maintain quality throughout the product lifecycle.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Design Areas */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Industrial Design Applications</h2>
              <p className="text-lg text-zinc-900/70">
                Comprehensive design solutions across industries and product categories
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  category: "Consumer Products",
                  title: "Appliances & Electronics",
                  description:
                    "Design household appliances, consumer electronics, and smart devices that combine intuitive operation with reliable performance. Focus on user interface design, thermal management, and regulatory compliance.",
                },
                {
                  category: "Industrial Equipment",
                  title: "Machinery & Tools",
                  description:
                    "Create industrial machinery, tools, and equipment that prioritize safety, efficiency, and ease of maintenance. Design for harsh operating environments and professional use cases.",
                },
                {
                  category: "Medical Devices",
                  title: "Healthcare Solutions",
                  description:
                    "Develop medical devices and healthcare products with strict attention to safety, usability, and regulatory requirements. Design for sterility, precision, and user confidence.",
                },
                {
                  category: "Transportation",
                  title: "Automotive & Mobility",
                  description:
                    "Design components and systems for automotive, aerospace, and mobility applications. Focus on weight optimization, safety standards, and performance requirements.",
                },
              ].map((area, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <Layers className="h-8 w-8 text-zinc-900" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {area.category}
                        </Badge>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-4">{area.title}</h3>
                        <p className="text-zinc-900/70 leading-relaxed">{area.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Design for Manufacturing */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Design for Manufacturing (DFM)</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Optimizing designs for efficient, cost-effective production
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Material Selection",
                  description: "Choose optimal materials for performance, cost, and manufacturing compatibility",
                },
                {
                  title: "Tooling Optimization",
                  description: "Design parts to minimize tooling complexity and reduce manufacturing costs",
                },
                {
                  title: "Assembly Efficiency",
                  description: "Simplify assembly processes and reduce labor requirements through smart design",
                },
                {
                  title: "Quality Control",
                  description: "Design features that enable consistent quality and easy inspection during production",
                },
                {
                  title: "Scalability Planning",
                  description: "Ensure designs can scale from prototype to high-volume production efficiently",
                },
                {
                  title: "Cost Optimization",
                  description: "Balance performance requirements with cost targets for market competitiveness",
                },
              ].map((principle, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="h-6 w-6 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{principle.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{principle.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Engineer Your Product for Success</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start with detailed technical specifications that consider both design aesthetics and manufacturing
              requirements from the beginning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Create Technical Specs
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/design-for-manufacturing">Learn DFM</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
