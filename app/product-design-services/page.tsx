import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Palette, Users, Target, ArrowRight, Lightbulb, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Design Services | Professional Design & Development",
  description:
    "Expert product design services from concept to production. User-centered design, industrial design, and comprehensive product development solutions.",
  keywords:
    "product design services, industrial design, product development, design consulting, user experience design, product design company",
  openGraph: {
    title: "Product Design Services | Professional Design & Development",
    description:
      "Expert product design services from concept to production. User-centered design and comprehensive development solutions.",
    url: "https://genpire.ai/product-design-services",
  },
};

export default function ProductDesignServices() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Palette className="h-4 w-4 mr-2" />
              Creative Excellence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Product Design Services</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Transform Ideas into Market-Ready Products with Expert Design
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Professional product design services that combine creativity, functionality, and market insight. From
                initial concept to production-ready designs, we create products that users love and businesses succeed
                with.
              </p>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Comprehensive Design Solutions</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                End-to-end product design services that bring your vision to life
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Concept Development</h3>
                  <p className="text-zinc-900/70">
                    Transform your ideas into viable product concepts through ideation, sketching, and concept
                    refinement. We help you explore possibilities and define your product vision.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">User-Centered Design</h3>
                  <p className="text-zinc-900/70">
                    Design products that truly serve your users. Through research, personas, and usability testing, we
                    ensure your product meets real user needs and delivers exceptional experiences.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Market-Ready Solutions</h3>
                  <p className="text-zinc-900/70">
                    Create products designed for manufacturing and market success. We consider production constraints,
                    cost targets, and market positioning throughout the design process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Design Process */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Our Design Process</h2>
              <p className="text-lg text-zinc-900/70">Structured approach to creating successful products</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  phase: "Discover",
                  title: "Research & Strategy",
                  description:
                    "Deep dive into user needs, market opportunities, and technical requirements. Define project goals, constraints, and success metrics to guide the design process.",
                },
                {
                  phase: "Define",
                  title: "Concept & Direction",
                  description:
                    "Develop design concepts through sketching, ideation, and exploration. Create design briefs and establish the visual and functional direction for your product.",
                },
                {
                  phase: "Design",
                  title: "Detailed Development",
                  description:
                    "Create detailed designs, 3D models, and technical specifications. Develop user interfaces, industrial design, and all visual elements of your product.",
                },
                {
                  phase: "Deliver",
                  title: "Production Ready",
                  description:
                    "Finalize designs for manufacturing with comprehensive tech packs, specifications, and production guidelines. Ensure smooth transition to manufacturing partners.",
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

        {/* Specializations */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Design Specializations</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Expert design services across diverse product categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Consumer Electronics",
                  description: "Sleek, functional designs for tech products, wearables, and smart devices",
                },
                {
                  title: "Home & Lifestyle",
                  description: "Beautiful, practical designs for furniture, appliances, and home accessories",
                },
                {
                  title: "Fashion & Accessories",
                  description: "Trendy, wearable designs for apparel, jewelry, bags, and fashion items",
                },
                {
                  title: "Medical & Healthcare",
                  description: "User-friendly, compliant designs for medical devices and healthcare products",
                },
                {
                  title: "Sports & Recreation",
                  description: "Performance-focused designs for sporting goods and recreational equipment",
                },
                {
                  title: "Packaging Design",
                  description: "Compelling, sustainable packaging that protects products and attracts customers",
                },
              ].map((specialization, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Heart className="h-6 w-6 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{specialization.title}</h3>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Design Your Product?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start your product design journey with a comprehensive tech pack that captures your vision and
              requirements with professional precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Generate Design Brief
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/industrial-design">Explore Industrial Design</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
