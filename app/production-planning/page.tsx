import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Calendar, Target, TrendingUp, ArrowRight, CheckCircle, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Production Planning Services | Manufacturing Schedule & Resource Management",
  description:
    "Expert production planning services for efficient manufacturing. Optimize schedules, resources, and capacity planning for successful product launches.",
  keywords:
    "production planning, manufacturing planning, capacity planning, production scheduling, resource management, manufacturing optimization",
  openGraph: {
    title: "Production Planning Services | Manufacturing Schedule & Resource Management",
    description:
      "Expert production planning services for efficient manufacturing. Optimize schedules and resources for success.",
    url: "https://genpire.ai/production-planning",
  },
};

export default function ProductionPlanning() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Calendar className="h-4 w-4 mr-2" />
              Strategic Planning
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Production Planning</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Optimize Manufacturing Efficiency with Strategic Production Planning
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Effective production planning is the backbone of successful manufacturing. Our comprehensive planning
                services help you optimize resources, meet deadlines, and deliver products on time and within budget.
              </p>
            </div>
          </div>
        </section>

        {/* Planning Benefits */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Production Planning Matters</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Strategic planning drives manufacturing efficiency and business success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">On-Time Delivery</h3>
                  <p className="text-zinc-900/70">
                    Meet customer deadlines consistently with optimized production schedules. Reduce lead times and
                    improve customer satisfaction through efficient planning.
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
                    Minimize production costs through efficient resource allocation, inventory management, and capacity
                    utilization. Maximize profitability with smart planning.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Resource Efficiency</h3>
                  <p className="text-zinc-900/70">
                    Optimize workforce, equipment, and material utilization. Reduce waste, minimize downtime, and
                    maximize productivity through strategic resource planning.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Planning Components */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Key Planning Components</h2>
              <p className="text-lg text-zinc-900/70">Essential elements of comprehensive production planning</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  component: "Demand Forecasting",
                  title: "Market Demand Analysis",
                  description:
                    "Analyze market trends, customer demand patterns, and sales forecasts to determine production requirements. Use historical data and market intelligence to predict future demand accurately.",
                },
                {
                  component: "Capacity Planning",
                  title: "Resource Capacity Assessment",
                  description:
                    "Evaluate manufacturing capacity, equipment availability, and workforce capabilities. Identify bottlenecks and plan capacity expansions to meet production targets.",
                },
                {
                  component: "Material Planning",
                  title: "Supply Chain Coordination",
                  description:
                    "Plan material requirements, supplier coordination, and inventory management. Ensure materials are available when needed while minimizing carrying costs.",
                },
                {
                  component: "Schedule Optimization",
                  title: "Production Scheduling",
                  description:
                    "Create detailed production schedules that optimize resource utilization, minimize setup times, and meet delivery deadlines. Balance efficiency with flexibility.",
                },
              ].map((component, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <Target className="h-8 w-8 text-zinc-900" />
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

        {/* Planning Process */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Production Planning Process</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Systematic approach to creating effective production plans
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Requirements Analysis",
                  description: "Define production requirements, quality standards, and delivery targets",
                },
                {
                  title: "Resource Assessment",
                  description: "Evaluate available resources, capacity constraints, and capability gaps",
                },
                {
                  title: "Schedule Development",
                  description: "Create detailed production schedules with realistic timelines and milestones",
                },
                {
                  title: "Risk Assessment",
                  description: "Identify potential risks and develop contingency plans for disruptions",
                },
                {
                  title: "Performance Monitoring",
                  description: "Track progress against plans and adjust schedules as needed",
                },
                {
                  title: "Continuous Improvement",
                  description: "Analyze performance data and optimize planning processes over time",
                },
              ].map((step, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{step.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Planning Tools */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Planning Tools & Techniques</h2>
              <p className="text-lg text-zinc-900/70">
                Modern tools and methodologies for effective production planning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  tool: "ERP Systems",
                  description: "Enterprise resource planning software for integrated production management",
                },
                {
                  tool: "MRP/MRP II",
                  description: "Material requirements planning for inventory and production scheduling",
                },
                {
                  tool: "Lean Manufacturing",
                  description: "Waste reduction and efficiency improvement methodologies",
                },
                {
                  tool: "Just-in-Time (JIT)",
                  description: "Inventory reduction and demand-driven production strategies",
                },
                {
                  tool: "Gantt Charts",
                  description: "Visual project scheduling and timeline management tools",
                },
                {
                  tool: "Capacity Planning Tools",
                  description: "Software for resource capacity analysis and optimization",
                },
              ].map((tool, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Calendar className="h-6 w-6 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{tool.tool}</h3>
                        <p className="text-zinc-900/70 text-sm">{tool.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Plan Your Production Success</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start with detailed product specifications that enable accurate production planning and resource
              allocation from the beginning of your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Create Production Brief
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/supply-chain-management">Learn Supply Chain</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
