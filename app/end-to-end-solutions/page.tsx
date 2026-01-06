import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Layers, Target, Zap, ArrowRight, CheckCircle, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "End-to-End Solutions | Complete Product Development & Manufacturing",
  description:
    "Comprehensive end-to-end product development solutions from concept to market. Full-service design, engineering, and manufacturing for successful product launches.",
  keywords:
    "end-to-end solutions, complete product development, full-service manufacturing, product lifecycle management, turnkey solutions, integrated services",
  openGraph: {
    title: "End-to-End Solutions | Complete Product Development & Manufacturing",
    description: "Comprehensive end-to-end product development solutions from concept to market launch.",
    url: "https://genpire.ai/end-to-end-solutions",
  },
};

export default function EndToEndSolutions() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Layers className="h-4 w-4 mr-2" />
              Complete Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">End-to-End Solutions</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              From Concept to Market - Complete Product Development Journey
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Transform your product ideas into market-ready solutions with our comprehensive end-to-end services. We
                handle every aspect of product development, from initial concept through manufacturing and market
                launch, ensuring seamless execution and successful outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* Solution Benefits */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Choose End-to-End Solutions</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Comprehensive services that eliminate complexity and accelerate your product journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Single Point of Contact</h3>
                  <p className="text-zinc-900/70">
                    Streamline your project with one dedicated team managing all aspects of development. Eliminate
                    coordination challenges and communication gaps between multiple vendors.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Faster Time-to-Market</h3>
                  <p className="text-zinc-900/70">
                    Accelerate your product launch with integrated processes and seamless handoffs between development
                    phases. Reduce delays and get to market ahead of competitors.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Cost Efficiency</h3>
                  <p className="text-zinc-900/70">
                    Reduce overall project costs through integrated services and optimized processes. Eliminate
                    redundancies and leverage economies of scale across the entire development cycle.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Service Phases */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Complete Development Phases</h2>
              <p className="text-lg text-zinc-900/70">
                Comprehensive services covering every stage of product development
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  phase: "Concept",
                  title: "Concept Development & Strategy",
                  description:
                    "Transform your ideas into viable product concepts through market research, feasibility analysis, and strategic planning. Define product requirements, target markets, and business objectives.",
                },
                {
                  phase: "Design",
                  title: "Design & Engineering",
                  description:
                    "Create detailed product designs, technical specifications, and engineering documentation. Develop prototypes, conduct testing, and refine designs for optimal performance and manufacturability.",
                },
                {
                  phase: "Production",
                  title: "Manufacturing & Production",
                  description:
                    "Manage the entire production process from supplier selection to quality control. Coordinate manufacturing, assembly, and packaging to deliver products that meet your specifications.",
                },
                {
                  phase: "Launch",
                  title: "Market Launch & Support",
                  description:
                    "Execute successful product launches with marketing support, distribution planning, and ongoing product management. Provide post-launch support and continuous improvement.",
                },
              ].map((phase, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-zinc-900">{phase.phase}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-4">{phase.title}</h3>
                        <p className="text-zinc-900/70 leading-relaxed">{phase.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Components */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Comprehensive Service Portfolio</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                All the services you need for successful product development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Market Research",
                  description: "Consumer insights, competitive analysis, and market opportunity assessment",
                },
                {
                  title: "Product Strategy",
                  description: "Strategic planning, positioning, and go-to-market strategy development",
                },
                {
                  title: "Industrial Design",
                  description: "User-centered design, aesthetics, and functional product development",
                },
                {
                  title: "Engineering",
                  description: "Technical design, CAD modeling, and engineering optimization",
                },
                {
                  title: "Prototyping",
                  description: "Rapid prototyping, testing, and iterative design refinement",
                },
                {
                  title: "Manufacturing",
                  description: "Production planning, supplier management, and quality assurance",
                },
                {
                  title: "Testing & Validation",
                  description: "Product testing, compliance verification, and performance validation",
                },
                {
                  title: "Supply Chain",
                  description: "Logistics planning, inventory management, and distribution strategy",
                },
                {
                  title: "Launch Support",
                  description: "Marketing support, sales enablement, and post-launch optimization",
                },
              ].map((service, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{service.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{service.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Success Across Industries</h2>
              <p className="text-lg text-zinc-900/70">End-to-end solutions delivering results across diverse markets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  industry: "Consumer Electronics",
                  description:
                    "Smart home devices from concept to retail shelves with integrated IoT functionality and user-friendly design",
                },
                {
                  industry: "Health & Wellness",
                  description:
                    "Medical devices and wellness products with FDA compliance and clinical validation support",
                },
                {
                  industry: "Fashion & Lifestyle",
                  description:
                    "Sustainable fashion accessories with eco-friendly materials and ethical manufacturing practices",
                },
                {
                  industry: "Sports & Recreation",
                  description: "Performance sports equipment with advanced materials and ergonomic design optimization",
                },
                {
                  industry: "Home & Garden",
                  description: "Innovative home products with smart features and sustainable manufacturing processes",
                },
                {
                  industry: "Automotive",
                  description:
                    "Automotive accessories and components with precision engineering and quality certification",
                },
              ].map((story, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Users className="h-6 w-6 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{story.industry}</h3>
                        <p className="text-zinc-900/70 text-sm">{story.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for Complete Product Success?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start your end-to-end product development journey with a comprehensive tech pack that establishes the
              foundation for every phase of your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/product-development">Learn Product Development</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
