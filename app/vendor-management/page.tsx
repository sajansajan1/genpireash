import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Users, Target, Shield, ArrowRight, CheckCircle, TrendingUp, Handshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Vendor Management Services | Supplier Relationship & Performance Management",
  description:
    "Expert vendor management services for supplier relationships, performance monitoring, and strategic partnerships. Optimize vendor relationships for business success.",
  keywords:
    "vendor management, supplier relationship management, vendor performance, supplier partnerships, procurement management, vendor evaluation",
  openGraph: {
    title: "Vendor Management Services | Supplier Relationship & Performance Management",
    description: "Expert vendor management services for supplier relationships and performance monitoring.",
    url: "https://genpire.ai/vendor-management",
  },
};

export default function VendorManagement() {
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
              Strategic Partnerships
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Vendor Management</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Build Strong Supplier Relationships for Long-Term Success
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Effective vendor management is essential for sustainable business growth. Our comprehensive vendor
                management services help you build strategic partnerships, monitor performance, and optimize supplier
                relationships for mutual success.
              </p>
            </div>
          </div>
        </section>

        {/* Vendor Management Benefits */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Vendor Management Matters</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Strategic vendor relationships drive operational excellence and competitive advantage
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Performance Optimization</h3>
                  <p className="text-zinc-900/70">
                    Improve vendor performance through clear expectations, regular monitoring, and collaborative
                    improvement initiatives. Drive better results across all supplier relationships.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Risk Mitigation</h3>
                  <p className="text-zinc-900/70">
                    Reduce supply chain risks through proactive vendor monitoring, compliance management, and
                    contingency planning. Protect your business from supplier-related disruptions.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Handshake className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Strategic Partnerships</h3>
                  <p className="text-zinc-900/70">
                    Develop long-term strategic partnerships that create mutual value. Foster innovation, cost savings,
                    and competitive advantages through collaborative vendor relationships.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Management Process */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Vendor Management Process</h2>
              <p className="text-lg text-zinc-900/70">Comprehensive approach to managing supplier relationships</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  phase: "Selection",
                  title: "Vendor Selection & Onboarding",
                  description:
                    "Identify, evaluate, and select vendors based on capabilities, quality, cost, and strategic fit. Implement comprehensive onboarding processes to establish clear expectations and requirements.",
                },
                {
                  phase: "Contracting",
                  title: "Contract Management",
                  description:
                    "Negotiate favorable terms, establish service level agreements (SLAs), and create contracts that protect your interests while enabling vendor success. Manage contract renewals and modifications.",
                },
                {
                  phase: "Monitoring",
                  title: "Performance Monitoring",
                  description:
                    "Track vendor performance against established KPIs and SLAs. Implement regular reviews, scorecards, and feedback mechanisms to ensure continuous improvement and accountability.",
                },
                {
                  phase: "Development",
                  title: "Relationship Development",
                  description:
                    "Build strategic partnerships through regular communication, joint planning, and collaborative improvement initiatives. Foster innovation and mutual growth opportunities.",
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

        {/* Key Activities */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Key Management Activities</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Essential activities for effective vendor relationship management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Performance Scorecards",
                  description: "Regular assessment of vendor performance across quality, delivery, and service metrics",
                },
                {
                  title: "Risk Assessment",
                  description: "Ongoing evaluation of vendor financial stability, compliance, and operational risks",
                },
                {
                  title: "Cost Management",
                  description: "Monitor pricing, negotiate cost reductions, and optimize total cost of ownership",
                },
                {
                  title: "Quality Assurance",
                  description: "Ensure vendor compliance with quality standards and continuous improvement",
                },
                {
                  title: "Communication Management",
                  description: "Establish regular communication channels and escalation procedures",
                },
                {
                  title: "Innovation Collaboration",
                  description: "Work with vendors on innovation initiatives and process improvements",
                },
                {
                  title: "Compliance Monitoring",
                  description: "Ensure vendor adherence to regulatory requirements and company policies",
                },
                {
                  title: "Dispute Resolution",
                  description: "Manage conflicts and disputes through structured resolution processes",
                },
                {
                  title: "Strategic Planning",
                  description: "Align vendor capabilities with long-term business objectives and strategies",
                },
              ].map((activity, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{activity.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{activity.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Vendor Management Best Practices</h2>
              <p className="text-lg text-zinc-900/70">Proven strategies for successful vendor relationships</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  practice: "Clear Expectations",
                  description:
                    "Define clear performance expectations, deliverables, and success metrics from the start",
                },
                {
                  practice: "Regular Reviews",
                  description: "Conduct regular performance reviews and business relationship assessments",
                },
                {
                  practice: "Collaborative Approach",
                  description: "Foster collaboration and partnership rather than purely transactional relationships",
                },
                {
                  practice: "Technology Integration",
                  description: "Use vendor management systems and tools for efficiency and transparency",
                },
                {
                  practice: "Continuous Improvement",
                  description: "Implement continuous improvement processes and innovation initiatives",
                },
                {
                  practice: "Risk Management",
                  description: "Proactively identify and mitigate vendor-related risks and dependencies",
                },
              ].map((practice, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{practice.practice}</h3>
                        <p className="text-zinc-900/70 text-sm">{practice.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Build Strategic Vendor Relationships</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start with clear product specifications that enable effective vendor communication and relationship
              management from the beginning of your partnerships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Create Vendor Brief
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/manufacturing-partners">Find Partners</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
