import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Truck, Globe, Target, ArrowRight, CheckCircle, TrendingUp, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Supply Chain Management | Optimize Logistics & Distribution Networks",
  description:
    "Expert supply chain management services for efficient logistics, inventory optimization, and distribution networks. Streamline your supply chain for better performance.",
  keywords:
    "supply chain management, logistics optimization, distribution networks, inventory management, supply chain strategy, procurement management",
  openGraph: {
    title: "Supply Chain Management | Optimize Logistics & Distribution Networks",
    description: "Expert supply chain management services for efficient logistics and distribution networks.",
    url: "https://genpire.ai/supply-chain-management",
  },
};

export default function SupplyChainManagement() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Truck className="h-4 w-4 mr-2" />
              Global Networks
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Supply Chain Management</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Optimize Your Global Supply Chain for Maximum Efficiency
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Effective supply chain management is critical for business success in today's global marketplace. Our
                comprehensive SCM services help you optimize logistics, reduce costs, and improve customer satisfaction
                through strategic supply chain design.
              </p>
            </div>
          </div>
        </section>

        {/* SCM Benefits */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Supply Chain Optimization Benefits</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Strategic supply chain management drives competitive advantage and business growth
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Cost Reduction</h3>
                  <p className="text-zinc-900/70">
                    Reduce total supply chain costs by 15-25% through optimization of inventory, transportation, and
                    warehousing. Improve profitability with efficient operations.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Improved Service</h3>
                  <p className="text-zinc-900/70">
                    Enhance customer satisfaction with faster delivery times, better product availability, and improved
                    order fulfillment accuracy through optimized supply chains.
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
                    Build resilient supply chains that can adapt to disruptions. Diversify suppliers, create contingency
                    plans, and maintain business continuity.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* SCM Components */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Supply Chain Components</h2>
              <p className="text-lg text-zinc-900/70">Key elements of comprehensive supply chain management</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  component: "Procurement",
                  title: "Strategic Sourcing & Procurement",
                  description:
                    "Optimize supplier selection, contract negotiation, and procurement processes. Develop strategic partnerships with key suppliers and implement cost-effective sourcing strategies.",
                },
                {
                  component: "Logistics",
                  title: "Transportation & Distribution",
                  description:
                    "Design efficient transportation networks, optimize delivery routes, and manage distribution centers. Reduce shipping costs while improving delivery performance.",
                },
                {
                  component: "Inventory",
                  title: "Inventory Optimization",
                  description:
                    "Balance inventory levels to minimize carrying costs while ensuring product availability. Implement demand forecasting and inventory management best practices.",
                },
                {
                  component: "Technology",
                  title: "Supply Chain Technology",
                  description:
                    "Leverage technology solutions for visibility, tracking, and automation. Implement ERP systems, IoT sensors, and analytics for data-driven decision making.",
                },
              ].map((component, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-8 w-8 text-zinc-900" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {component.component}
                        </Badge>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-4">{component.title}</h3>
                        <p className="text-zinc-900/70 leading-relaxed">{component.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SCM Strategies */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Supply Chain Strategies</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Proven strategies for supply chain optimization and performance improvement
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Lean Supply Chain",
                  description: "Eliminate waste and improve efficiency throughout the supply chain",
                },
                {
                  title: "Agile Supply Chain",
                  description: "Build flexibility and responsiveness to market changes and demand fluctuations",
                },
                {
                  title: "Sustainable Practices",
                  description: "Implement environmentally responsible and socially conscious supply chain practices",
                },
                {
                  title: "Digital Transformation",
                  description: "Leverage digital technologies for automation, visibility, and optimization",
                },
                {
                  title: "Supplier Collaboration",
                  description: "Develop strategic partnerships and collaborative relationships with key suppliers",
                },
                {
                  title: "Risk Management",
                  description: "Identify, assess, and mitigate supply chain risks and vulnerabilities",
                },
                {
                  title: "Performance Metrics",
                  description: "Implement KPIs and metrics to measure and improve supply chain performance",
                },
                {
                  title: "Continuous Improvement",
                  description: "Establish processes for ongoing optimization and performance enhancement",
                },
                {
                  title: "Global Integration",
                  description: "Coordinate and integrate global supply chain operations and processes",
                },
              ].map((strategy, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{strategy.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{strategy.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Applications */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Industry Applications</h2>
              <p className="text-lg text-zinc-900/70">Supply chain solutions tailored to specific industry needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  industry: "Manufacturing",
                  description: "Raw material sourcing, production planning, and finished goods distribution",
                },
                {
                  industry: "Retail & E-commerce",
                  description: "Inventory management, fulfillment centers, and last-mile delivery optimization",
                },
                {
                  industry: "Healthcare",
                  description: "Medical device distribution, pharmaceutical supply chains, and regulatory compliance",
                },
                {
                  industry: "Automotive",
                  description: "Just-in-time delivery, supplier integration, and global parts distribution",
                },
                {
                  industry: "Food & Beverage",
                  description: "Cold chain management, perishable goods handling, and food safety compliance",
                },
                {
                  industry: "Technology",
                  description: "Component sourcing, product lifecycle management, and global distribution networks",
                },
              ].map((application, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Truck className="h-6 w-6 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{application.industry}</h3>
                        <p className="text-zinc-900/70 text-sm">{application.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Optimize Your Supply Chain</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start with detailed product specifications that enable effective supply chain planning and optimization
              from the earliest stages of product development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Plan Supply Chain
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/vendor-management">Learn Vendor Management</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
