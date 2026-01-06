import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Shield, CheckCircle, Target, ArrowRight, AlertTriangle, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Quality Control Services | Manufacturing Quality Assurance & Testing",
  description:
    "Professional quality control services for manufacturing. Ensure product quality with comprehensive QC processes, testing protocols, and quality assurance systems.",
  keywords:
    "quality control, quality assurance, QC services, manufacturing quality, product testing, quality management, inspection services",
  openGraph: {
    title: "Quality Control Services | Manufacturing Quality Assurance & Testing",
    description:
      "Professional quality control services for manufacturing. Ensure product quality with comprehensive QC processes.",
    url: "https://genpire.ai/quality-control",
  },
};

export default function QualityControl() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Shield className="h-4 w-4 mr-2" />
              Quality Assurance
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Quality Control</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Ensure Excellence with Comprehensive Quality Management
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Quality control is the foundation of successful manufacturing. Our comprehensive QC services help you
                maintain consistent product quality, reduce defects, and build customer trust through rigorous testing
                and inspection processes.
              </p>
            </div>
          </div>
        </section>

        {/* QC Importance */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Quality Control Matters</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Protecting your brand reputation and customer satisfaction through systematic quality management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Risk Prevention</h3>
                  <p className="text-zinc-900/70">
                    Identify and prevent quality issues before products reach customers. Avoid costly recalls, returns,
                    and damage to brand reputation through proactive quality management.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Cost Reduction</h3>
                  <p className="text-zinc-900/70">
                    Reduce manufacturing costs by catching defects early in the production process. Prevention is always
                    more cost-effective than correction after production.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Customer Satisfaction</h3>
                  <p className="text-zinc-900/70">
                    Deliver consistent, high-quality products that meet customer expectations. Build brand loyalty and
                    positive reviews through reliable product quality.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* QC Process */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Quality Control Process</h2>
              <p className="text-lg text-zinc-900/70">Systematic approach to ensuring consistent product quality</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  phase: "Planning",
                  title: "Quality Planning & Standards",
                  description:
                    "Define quality standards, specifications, and acceptance criteria based on customer requirements and industry standards. Establish quality control checkpoints throughout the production process.",
                },
                {
                  phase: "Incoming",
                  title: "Incoming Material Inspection",
                  description:
                    "Inspect raw materials, components, and supplies before they enter production. Verify specifications, test material properties, and ensure supplier quality compliance.",
                },
                {
                  phase: "In-Process",
                  title: "Production Quality Monitoring",
                  description:
                    "Monitor quality during production with regular inspections, statistical process control, and real-time quality measurements. Identify and correct issues immediately.",
                },
                {
                  phase: "Final",
                  title: "Final Product Inspection",
                  description:
                    "Comprehensive final inspection and testing before shipment. Verify all specifications, conduct functional tests, and ensure products meet quality standards.",
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

        {/* Testing Methods */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Quality Testing Methods</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Comprehensive testing approaches for different product categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Dimensional Inspection",
                  description: "Precise measurement of dimensions, tolerances, and geometric specifications",
                },
                {
                  title: "Material Testing",
                  description: "Chemical composition, mechanical properties, and material performance testing",
                },
                {
                  title: "Functional Testing",
                  description: "Performance verification, operational testing, and functionality validation",
                },
                {
                  title: "Durability Testing",
                  description: "Stress testing, fatigue analysis, and long-term performance evaluation",
                },
                {
                  title: "Safety Testing",
                  description: "Compliance with safety standards, regulatory requirements, and certifications",
                },
                {
                  title: "Appearance Inspection",
                  description: "Visual quality assessment, color matching, and aesthetic evaluation",
                },
                {
                  title: "Packaging Quality",
                  description: "Packaging integrity, labeling accuracy, and shipping protection verification",
                },
                {
                  title: "Statistical Sampling",
                  description: "Statistical quality control methods and acceptance sampling procedures",
                },
                {
                  title: "Environmental Testing",
                  description: "Temperature, humidity, and environmental condition testing for reliability",
                },
              ].map((method, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Target className="h-6 w-6 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{method.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{method.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quality Standards */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Industry Quality Standards</h2>
              <p className="text-lg text-zinc-900/70">Compliance with international quality management systems</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  standard: "ISO 9001",
                  description: "International quality management system standard for consistent quality delivery",
                },
                {
                  standard: "Six Sigma",
                  description: "Data-driven methodology for eliminating defects and improving process quality",
                },
                {
                  standard: "FDA Compliance",
                  description: "Food and drug administration standards for health and safety products",
                },
                {
                  standard: "CE Marking",
                  description: "European conformity standards for product safety and regulatory compliance",
                },
                {
                  standard: "ASTM Standards",
                  description: "American Society for Testing and Materials standards for material and product testing",
                },
                {
                  standard: "GMP Guidelines",
                  description: "Good Manufacturing Practice guidelines for pharmaceutical and food products",
                },
              ].map((standard, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{standard.standard}</h3>
                        <p className="text-zinc-900/70 text-sm">{standard.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Implement Quality Control from Day One</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start with detailed quality specifications in your tech pack to establish clear quality standards and
              testing requirements for your manufacturing partners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Define Quality Standards
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/production-planning">Learn Production Planning</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
