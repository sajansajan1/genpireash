import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Zap, Layers, Target, ArrowRight, Clock, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Rapid Prototyping Services | Fast Product Development & Testing",
  description:
    "Professional rapid prototyping services for quick product development, design validation, and iterative testing. Accelerate your innovation with fast turnaround times.",
  keywords:
    "rapid prototyping, fast prototyping, product development, prototype testing, design validation, iterative design, prototype services",
  openGraph: {
    title: "Rapid Prototyping Services | Fast Product Development & Testing",
    description:
      "Professional rapid prototyping services for quick product development, design validation, and iterative testing.",
    url: "https://genpire.ai/rapid-prototyping",
  },
};

export default function RapidPrototyping() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Zap className="h-4 w-4 mr-2" />
              Speed & Innovation
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Rapid Prototyping</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Accelerate Innovation with Fast, Iterative Product Development
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Rapid prototyping transforms your product development cycle by enabling quick iterations, early design
                validation, and faster time-to-market. Test, refine, and perfect your ideas before committing to full
                production.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Rapid Prototyping Matters</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Speed up your product development and reduce risks with iterative prototyping
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Faster Time-to-Market</h3>
                  <p className="text-zinc-900/70">
                    Reduce development cycles from months to weeks. Quick iterations allow you to test and refine
                    designs rapidly, getting your product to market ahead of competitors.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Risk Reduction</h3>
                  <p className="text-zinc-900/70">
                    Identify and solve design issues early in the development process. Avoid costly mistakes and
                    production delays by validating concepts before mass manufacturing.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Design Innovation</h3>
                  <p className="text-zinc-900/70">
                    Experiment with multiple design variations quickly and cost-effectively. Rapid prototyping enables
                    creative exploration and breakthrough innovations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">The Rapid Prototyping Process</h2>
              <p className="text-lg text-zinc-900/70">From concept to physical prototype in record time</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Concept Development",
                  description:
                    "Start with your product idea and create detailed specifications. Our AI tech pack generator can help document your concept with professional precision in minutes.",
                },
                {
                  step: "02",
                  title: "Design & CAD Modeling",
                  description:
                    "Transform concepts into 3D models using advanced CAD software. Create detailed digital representations that capture every aspect of your product design.",
                },
                {
                  step: "03",
                  title: "Prototype Manufacturing",
                  description:
                    "Use 3D printing, CNC machining, or other rapid manufacturing techniques to create physical prototypes quickly and cost-effectively.",
                },
                {
                  step: "04",
                  title: "Testing & Iteration",
                  description:
                    "Test prototypes for functionality, fit, and user experience. Gather feedback and iterate designs rapidly to achieve optimal results.",
                },
              ].map((step, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-zinc-900">{step.step}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-4">{step.title}</h3>
                        <p className="text-zinc-900/70 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Prototyping Technologies</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Advanced manufacturing techniques for diverse prototyping needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "3D Printing (FDM/SLA)",
                  description: "Layer-by-layer additive manufacturing for complex geometries and rapid iterations",
                },
                {
                  title: "CNC Machining",
                  description:
                    "Precision subtractive manufacturing for metal and plastic prototypes with tight tolerances",
                },
                {
                  title: "Injection Molding",
                  description: "Low-volume molding for production-like prototypes using actual manufacturing processes",
                },
                {
                  title: "Laser Cutting",
                  description: "Precise cutting and engraving for flat materials and sheet-based prototypes",
                },
                {
                  title: "Vacuum Casting",
                  description: "Silicone mold casting for small batches of high-quality plastic prototypes",
                },
                {
                  title: "Sheet Metal Fabrication",
                  description: "Forming, bending, and welding for metal enclosures and structural prototypes",
                },
              ].map((tech, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Layers className="h-6 w-6 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{tech.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{tech.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Rapid Prototyping Journey</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Begin with a comprehensive tech pack to ensure your prototyping project has clear specifications and
              requirements from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Create Tech Pack Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/3d-printing-services">Explore 3D Printing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
