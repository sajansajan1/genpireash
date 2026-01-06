import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Users, Target, Shield, ArrowRight, CheckCircle, TrendingUp, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Manufacturing Consultation | Expert Production Strategy & Optimization",
  description:
    "Expert manufacturing consultation services for production optimization, cost reduction, and quality improvement. Strategic guidance for manufacturing success.",
  keywords:
    "manufacturing consultation, production consulting, manufacturing strategy, process optimization, manufacturing efficiency, production planning consultation",
  openGraph: {
    title: "Manufacturing Consultation | Expert Production Strategy & Optimization",
    description: "Expert manufacturing consultation services for production optimization and strategic guidance.",
    url: "https://genpire.ai/manufacturing-consultation",
  },
};

export default function ManufacturingConsultation() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Users className="h-4 w-4 mr-2" />
              Expert Guidance
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Manufacturing Consultation</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Strategic Manufacturing Expertise for Optimal Production Success
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Navigate complex manufacturing challenges with expert consultation services. Our experienced consultants
                provide strategic guidance, process optimization, and practical solutions to help you achieve
                manufacturing excellence and competitive advantage.
              </p>
            </div>
          </div>
        </section>

        {/* Consultation Benefits */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Choose Expert Consultation</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Leverage decades of manufacturing expertise to optimize your production operations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Expert Knowledge</h3>
                  <p className="text-zinc-900/70">
                    Access deep manufacturing expertise across industries and processes. Benefit from proven strategies
                    and best practices developed through years of hands-on experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Performance Improvement</h3>
                  <p className="text-zinc-900/70">
                    Identify opportunities for efficiency gains, cost reduction, and quality improvement. Implement
                    proven methodologies to enhance manufacturing performance.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Risk Mitigation</h3>
                  <p className="text-zinc-900/70">
                    Avoid costly mistakes and production issues through expert guidance. Identify potential risks early
                    and implement preventive measures for smooth operations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Consultation Areas */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Consultation Specializations</h2>
              <p className="text-lg text-zinc-900/70">Comprehensive expertise across key manufacturing domains</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  area: "Strategy",
                  title: "Manufacturing Strategy Development",
                  description:
                    "Develop comprehensive manufacturing strategies aligned with business objectives. Define production goals, capacity planning, and technology roadmaps for sustainable growth and competitive advantage.",
                },
                {
                  area: "Operations",
                  title: "Process Optimization & Efficiency",
                  description:
                    "Analyze current operations and identify improvement opportunities. Implement lean manufacturing principles, reduce waste, and optimize workflows for maximum efficiency and productivity.",
                },
                {
                  area: "Quality",
                  title: "Quality Management Systems",
                  description:
                    "Design and implement robust quality management systems. Establish quality standards, control processes, and continuous improvement programs to ensure consistent product quality.",
                },
                {
                  area: "Technology",
                  title: "Technology Integration & Automation",
                  description:
                    "Evaluate and implement manufacturing technologies and automation solutions. Guide digital transformation initiatives and Industry 4.0 adoption for enhanced capabilities.",
                },
              ].map((area, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-zinc-900">{area.area}</span>
                      </div>
                      <div>
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

        {/* Consultation Services */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Consultation Services</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Comprehensive consulting services to address your manufacturing challenges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Manufacturing Assessment",
                  description: "Comprehensive evaluation of current manufacturing capabilities and performance",
                },
                {
                  title: "Process Design",
                  description: "Design optimal manufacturing processes for new products and production lines",
                },
                {
                  title: "Capacity Planning",
                  description: "Strategic capacity planning and resource allocation for growth and efficiency",
                },
                {
                  title: "Cost Optimization",
                  description: "Identify cost reduction opportunities and implement cost-effective solutions",
                },
                {
                  title: "Supplier Development",
                  description: "Supplier selection, evaluation, and development for improved supply chain performance",
                },
                {
                  title: "Quality Systems",
                  description: "Design and implement quality management systems and continuous improvement programs",
                },
                {
                  title: "Lean Implementation",
                  description: "Implement lean manufacturing principles and waste reduction initiatives",
                },
                {
                  title: "Technology Selection",
                  description: "Evaluate and select manufacturing technologies and automation solutions",
                },
                {
                  title: "Change Management",
                  description: "Guide organizational change and transformation initiatives in manufacturing",
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

        {/* Industry Expertise */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Industry Expertise</h2>
              <p className="text-lg text-zinc-900/70">Deep knowledge across diverse manufacturing sectors</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  industry: "Automotive Manufacturing",
                  description: "Lean production, just-in-time delivery, and quality systems for automotive components",
                },
                {
                  industry: "Electronics & Technology",
                  description: "High-precision manufacturing, clean room operations, and advanced assembly processes",
                },
                {
                  industry: "Consumer Goods",
                  description: "High-volume production, packaging optimization, and supply chain efficiency",
                },
                {
                  industry: "Medical Devices",
                  description: "FDA compliance, quality systems, and precision manufacturing for medical products",
                },
                {
                  industry: "Aerospace & Defense",
                  description: "Precision manufacturing, quality standards, and regulatory compliance for aerospace",
                },
                {
                  industry: "Food & Beverage",
                  description: "Food safety, HACCP systems, and efficient processing for food manufacturing",
                },
              ].map((expertise, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{expertise.industry}</h3>
                        <p className="text-zinc-900/70 text-sm">{expertise.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Get Expert Manufacturing Guidance</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start your consultation with detailed product specifications that enable our experts to provide targeted,
              actionable recommendations for your manufacturing success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Start Consultation
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/design-to-production">Learn Design to Production</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
