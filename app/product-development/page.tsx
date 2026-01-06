import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Lightbulb, Target, Zap, ArrowRight, CheckCircle, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Development Services | Innovation & Design Excellence",
  description:
    "Expert product development services from ideation to launch. Transform concepts into market-ready products with professional design, engineering, and development expertise.",
  keywords:
    "product development, innovation services, product design, new product development, product engineering, concept development, product strategy",
  openGraph: {
    title: "Product Development Services | Innovation & Design Excellence",
    description:
      "Expert product development services from ideation to launch. Transform concepts into market-ready products.",
    url: "https://genpire.ai/product-development",
  },
};

export default function ProductDevelopment() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Lightbulb className="h-4 w-4 mr-2" />
              Innovation Excellence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Product Development</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">Transform Ideas into Market-Leading Products</p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Professional product development services that turn innovative ideas into successful market products. We
                combine strategic thinking, creative design, and technical expertise to deliver products that customers
                love and businesses profit from.
              </p>
            </div>
          </div>
        </section>

        {/* Development Approach */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Our Development Approach</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Systematic methodology that ensures successful product outcomes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">User-Centered Design</h3>
                  <p className="text-zinc-900/70">
                    Start with deep user research and insights to create products that truly solve customer problems.
                    Design with empathy and validate concepts through user testing.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Agile Development</h3>
                  <p className="text-zinc-900/70">
                    Implement agile methodologies for rapid iteration and continuous improvement. Adapt quickly to
                    feedback and market changes throughout the development process.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Market-Driven Strategy</h3>
                  <p className="text-zinc-900/70">
                    Align product development with market opportunities and business objectives. Ensure commercial
                    viability and competitive positioning from concept to launch.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Development Stages */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Product Development Stages</h2>
              <p className="text-lg text-zinc-900/70">Structured process from initial concept to market launch</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  stage: "Discovery",
                  title: "Research & Opportunity Identification",
                  description:
                    "Conduct market research, user interviews, and competitive analysis to identify opportunities. Define target markets, user personas, and product requirements through comprehensive discovery.",
                },
                {
                  stage: "Ideation",
                  title: "Concept Generation & Validation",
                  description:
                    "Generate multiple product concepts through creative ideation sessions. Evaluate concepts against market needs, technical feasibility, and business objectives to select the best direction.",
                },
                {
                  stage: "Design",
                  title: "Product Design & Engineering",
                  description:
                    "Develop detailed product designs, create prototypes, and conduct user testing. Refine designs based on feedback and optimize for manufacturing and user experience.",
                },
                {
                  stage: "Development",
                  title: "Technical Development & Testing",
                  description:
                    "Build functional prototypes, conduct performance testing, and validate technical specifications. Ensure products meet quality standards and regulatory requirements.",
                },
                {
                  stage: "Launch",
                  title: "Market Launch & Optimization",
                  description:
                    "Execute go-to-market strategy, launch products, and monitor performance. Gather market feedback and implement improvements for continued success.",
                },
              ].map((stage, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-zinc-900">{stage.stage}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-4">{stage.title}</h3>
                        <p className="text-zinc-900/70 leading-relaxed">{stage.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Core Services */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Core Development Services</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Comprehensive services covering all aspects of product development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Market Research",
                  description: "Consumer insights, trend analysis, and competitive intelligence for informed decisions",
                },
                {
                  title: "Product Strategy",
                  description: "Strategic planning, positioning, and roadmap development for market success",
                },
                {
                  title: "User Experience Design",
                  description: "User research, journey mapping, and interface design for optimal user experiences",
                },
                {
                  title: "Industrial Design",
                  description: "Aesthetic design, ergonomics, and form factor optimization for appealing products",
                },
                {
                  title: "Engineering Design",
                  description: "Technical design, CAD modeling, and engineering optimization for functionality",
                },
                {
                  title: "Prototyping",
                  description: "Rapid prototyping, testing, and iteration for design validation and refinement",
                },
                {
                  title: "Testing & Validation",
                  description:
                    "Performance testing, user validation, and compliance verification for quality assurance",
                },
                {
                  title: "Manufacturing Support",
                  description: "Design for manufacturing, supplier selection, and production planning support",
                },
                {
                  title: "Launch Planning",
                  description: "Go-to-market strategy, launch execution, and post-launch optimization support",
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

        {/* Success Metrics */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Development Success Factors</h2>
              <p className="text-lg text-zinc-900/70">
                Key elements that drive successful product development outcomes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  factor: "Clear Vision & Strategy",
                  description:
                    "Well-defined product vision, clear objectives, and strategic alignment with business goals",
                },
                {
                  factor: "User-Centric Approach",
                  description: "Deep understanding of user needs, behaviors, and preferences throughout development",
                },
                {
                  factor: "Cross-Functional Collaboration",
                  description: "Effective teamwork between design, engineering, marketing, and business stakeholders",
                },
                {
                  factor: "Iterative Development",
                  description: "Continuous testing, feedback incorporation, and design refinement for optimization",
                },
                {
                  factor: "Technical Excellence",
                  description: "High-quality engineering, robust testing, and adherence to industry standards",
                },
                {
                  factor: "Market Timing",
                  description: "Strategic timing of product launch to capitalize on market opportunities",
                },
              ].map((factor, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <TrendingUp className="h-6 w-6 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{factor.factor}</h3>
                        <p className="text-zinc-900/70 text-sm">{factor.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Develop Your Next Product?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Begin your product development journey with a comprehensive tech pack that captures your vision and
              requirements with professional precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Start Development
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/manufacturing-consultation">Get Consultation</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
