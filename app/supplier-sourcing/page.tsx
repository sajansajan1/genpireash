import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Search, Globe, Target, ArrowRight, CheckCircle, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Supplier Sourcing Services | Find the Right Manufacturing Partners",
  description:
    "Expert supplier sourcing services to find reliable manufacturers and suppliers worldwide. Streamline your procurement process with professional sourcing solutions.",
  keywords:
    "supplier sourcing, manufacturing sourcing, supplier selection, procurement services, vendor sourcing, supplier identification, sourcing strategy",
  openGraph: {
    title: "Supplier Sourcing Services | Find the Right Manufacturing Partners",
    description: "Expert supplier sourcing services to find reliable manufacturers and suppliers worldwide.",
    url: "https://genpire.ai/supplier-sourcing",
  },
};

export default function SupplierSourcing() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Search className="h-4 w-4 mr-2" />
              Strategic Sourcing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Supplier Sourcing</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Find the Perfect Manufacturing Partners for Your Products
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Strategic supplier sourcing is crucial for product success. We help you identify, evaluate, and connect
                with the right manufacturing partners who can deliver quality products on time and within budget.
              </p>
            </div>
          </div>
        </section>

        {/* Sourcing Benefits */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Professional Sourcing Matters</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Expert sourcing reduces risks and ensures successful manufacturing partnerships
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Risk Mitigation</h3>
                  <p className="text-zinc-900/70">
                    Reduce supplier risks through thorough vetting, due diligence, and verification processes. Avoid
                    costly mistakes and production delays with reliable partners.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Cost Optimization</h3>
                  <p className="text-zinc-900/70">
                    Find suppliers that offer the best value proposition balancing cost, quality, and service. Negotiate
                    better terms and pricing through professional sourcing expertise.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Global Access</h3>
                  <p className="text-zinc-900/70">
                    Access suppliers worldwide and find the best manufacturing locations for your specific needs.
                    Leverage global capabilities and competitive advantages.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sourcing Process */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Our Sourcing Process</h2>
              <p className="text-lg text-zinc-900/70">
                Systematic approach to finding the right manufacturing partners
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Requirements Analysis",
                  description:
                    "Define your product specifications, quality requirements, volume needs, timeline, and budget constraints. Create detailed sourcing criteria and evaluation frameworks.",
                },
                {
                  step: "02",
                  title: "Market Research",
                  description:
                    "Identify potential suppliers through industry databases, trade shows, referrals, and market intelligence. Create a comprehensive list of candidate manufacturers.",
                },
                {
                  step: "03",
                  title: "Supplier Evaluation",
                  description:
                    "Assess suppliers based on capabilities, certifications, financial stability, and track record. Conduct facility audits and reference checks for qualified candidates.",
                },
                {
                  step: "04",
                  title: "Negotiation & Selection",
                  description:
                    "Negotiate terms, pricing, and contracts with top suppliers. Select the best partner based on comprehensive evaluation and establish long-term relationships.",
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

        {/* Sourcing Criteria */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Key Sourcing Criteria</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Essential factors we evaluate when selecting suppliers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Production Capacity",
                  description: "Ability to meet volume requirements and scale production as needed",
                },
                {
                  title: "Quality Systems",
                  description: "ISO certifications, quality control processes, and testing capabilities",
                },
                {
                  title: "Technical Expertise",
                  description: "Specialized knowledge and experience in your product category",
                },
                {
                  title: "Financial Stability",
                  description: "Strong financial position and business continuity assurance",
                },
                {
                  title: "Communication",
                  description: "Clear communication channels and responsive project management",
                },
                {
                  title: "Compliance",
                  description: "Adherence to industry regulations and ethical manufacturing practices",
                },
                {
                  title: "Location & Logistics",
                  description: "Strategic location for shipping and supply chain optimization",
                },
                {
                  title: "Innovation Capability",
                  description: "Ability to support product development and continuous improvement",
                },
                {
                  title: "Cost Competitiveness",
                  description: "Competitive pricing while maintaining quality and service standards",
                },
              ].map((criteria, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{criteria.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{criteria.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Focus */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Industry Specializations</h2>
              <p className="text-lg text-zinc-900/70">Sourcing expertise across diverse manufacturing sectors</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  industry: "Consumer Electronics",
                  description: "PCB assembly, injection molding, and electronic device manufacturing",
                },
                {
                  industry: "Fashion & Apparel",
                  description: "Garment manufacturing, textile production, and accessory suppliers",
                },
                {
                  industry: "Home & Garden",
                  description: "Furniture, home decor, kitchenware, and outdoor product manufacturers",
                },
                {
                  industry: "Health & Beauty",
                  description: "Cosmetics, personal care, and health product manufacturing",
                },
                {
                  industry: "Automotive",
                  description: "Auto parts, accessories, and automotive component suppliers",
                },
                {
                  industry: "Industrial Equipment",
                  description: "Machinery, tools, and industrial component manufacturing",
                },
              ].map((specialization, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{specialization.industry}</h3>
                        <p className="text-zinc-900/70 text-sm">{specialization.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Sourcing Journey</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Begin with a detailed tech pack that clearly communicates your product requirements to potential suppliers
              and ensures accurate sourcing decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Create Sourcing Brief
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/quality-control">Learn Quality Control</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
