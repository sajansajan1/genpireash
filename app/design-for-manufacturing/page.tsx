import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Cog, Target, DollarSign, ArrowRight, CheckCircle, Settings, TrendingDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Design for Manufacturing (DFM) | Optimize Products for Production",
  description:
    "Expert Design for Manufacturing services to optimize your products for efficient, cost-effective production. Reduce manufacturing costs and improve quality.",
  keywords:
    "design for manufacturing, DFM, manufacturing optimization, production design, cost reduction, manufacturing efficiency, DFM services",
  openGraph: {
    title: "Design for Manufacturing (DFM) | Optimize Products for Production",
    description:
      "Expert Design for Manufacturing services to optimize your products for efficient, cost-effective production.",
    url: "https://genpire.ai/design-for-manufacturing",
  },
};

export default function DesignForManufacturing() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Cog className="h-4 w-4 mr-2" />
              Production Optimization
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Design for Manufacturing</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Optimize Your Products for Efficient, Cost-Effective Production
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Design for Manufacturing (DFM) is the practice of designing products with manufacturing processes in
                mind. By considering production requirements early in the design phase, we help you reduce costs,
                improve quality, and accelerate time-to-market.
              </p>
            </div>
          </div>
        </section>

        {/* Core Benefits */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why DFM Matters</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Strategic design decisions that impact your entire production process
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Cost Reduction</h3>
                  <p className="text-zinc-900/70">
                    Reduce manufacturing costs by 20-40% through optimized design decisions. Minimize material waste,
                    simplify tooling, and reduce assembly time with smart design choices.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Quality Improvement</h3>
                  <p className="text-zinc-900/70">
                    Design products that are easier to manufacture consistently. Reduce defects, improve tolerances, and
                    ensure reliable quality across all production runs.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingDown className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Faster Time-to-Market</h3>
                  <p className="text-zinc-900/70">
                    Eliminate production bottlenecks and reduce manufacturing lead times. Get your products to market
                    faster with designs optimized for efficient production.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* DFM Principles */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Key DFM Principles</h2>
              <p className="text-lg text-zinc-900/70">
                Essential guidelines for manufacturing-optimized product design
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  principle: "Simplification",
                  title: "Minimize Complexity",
                  description:
                    "Reduce the number of parts, eliminate unnecessary features, and simplify assembly processes. Every additional component increases cost, complexity, and potential failure points.",
                },
                {
                  principle: "Standardization",
                  title: "Use Standard Components",
                  description:
                    "Leverage standard fasteners, materials, and components whenever possible. Standard parts are cheaper, more readily available, and reduce inventory complexity.",
                },
                {
                  principle: "Material Selection",
                  title: "Optimize Material Choices",
                  description:
                    "Choose materials that balance performance requirements with manufacturing constraints. Consider material properties, availability, cost, and processing requirements.",
                },
                {
                  principle: "Tolerances",
                  title: "Specify Appropriate Tolerances",
                  description:
                    "Use the loosest tolerances that still meet functional requirements. Tighter tolerances increase manufacturing costs and complexity without always adding value.",
                },
                {
                  principle: "Assembly",
                  title: "Design for Easy Assembly",
                  description:
                    "Create self-aligning parts, minimize assembly steps, and design for automated assembly when possible. Reduce labor costs and assembly errors.",
                },
                {
                  principle: "Testing",
                  title: "Enable Quality Control",
                  description:
                    "Design features that facilitate inspection and testing during production. Make it easy to verify quality and catch defects early in the process.",
                },
              ].map((principle, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <Settings className="h-8 w-8 text-zinc-900" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {principle.principle}
                        </Badge>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-4">{principle.title}</h3>
                        <p className="text-zinc-900/70 leading-relaxed">{principle.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Manufacturing Processes */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Process-Specific Design</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Optimize designs for specific manufacturing processes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Injection Molding",
                  description: "Wall thickness uniformity, draft angles, and gate placement for optimal flow",
                },
                {
                  title: "CNC Machining",
                  description: "Tool access, material removal strategies, and fixture-friendly designs",
                },
                {
                  title: "Sheet Metal",
                  description: "Bend radii, hole spacing, and forming considerations for efficient fabrication",
                },
                {
                  title: "3D Printing",
                  description: "Support structures, layer orientation, and post-processing requirements",
                },
                {
                  title: "Die Casting",
                  description: "Draft angles, fillet radii, and parting line placement for quality castings",
                },
                {
                  title: "Assembly",
                  description: "Part orientation, fastener access, and assembly sequence optimization",
                },
              ].map((process, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{process.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{process.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Optimize Your Product for Manufacturing</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start with a detailed tech pack that incorporates DFM principles from the beginning. Save costs and
              improve quality with manufacturing-optimized designs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Generate DFM Tech Pack
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/industrial-design">Learn Industrial Design</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
