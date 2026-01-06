import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { ArrowRight, CheckCircle, Target, Zap, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Design to Production | Seamless Product Development Pipeline",
  description:
    "Streamlined design to production services for efficient product development. Bridge the gap between design and manufacturing with expert guidance and optimization.",
  keywords:
    "design to production, product development pipeline, design for manufacturing, production transition, manufacturing readiness, product launch",
  openGraph: {
    title: "Design to Production | Seamless Product Development Pipeline",
    description:
      "Streamlined design to production services for efficient product development and manufacturing transition.",
    url: "https://genpire.ai/design-to-production",
  },
};

export default function DesignToProduction() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <ArrowRight className="h-4 w-4 mr-2" />
              Seamless Transition
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Design to Production</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Bridge the Gap Between Creative Vision and Manufacturing Reality
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Transform your product designs into manufacturable realities with our comprehensive design-to-production
                services. We ensure seamless transitions from concept to manufacturing, optimizing designs for
                production efficiency while maintaining creative integrity.
              </p>
            </div>
          </div>
        </section>

        {/* Process Benefits */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Design-to-Production Matters</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Seamless integration between design and manufacturing drives successful product outcomes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Faster Time-to-Market</h3>
                  <p className="text-zinc-900/70">
                    Eliminate delays between design completion and production start. Streamlined processes reduce
                    handoff time and accelerate product launches significantly.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Design Integrity</h3>
                  <p className="text-zinc-900/70">
                    Maintain design vision while optimizing for manufacturing. Balance creative intent with production
                    requirements for products that exceed expectations.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Cost Optimization</h3>
                  <p className="text-zinc-900/70">
                    Reduce production costs through design optimization and manufacturing efficiency. Identify cost
                    savings without compromising quality or functionality.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Transition Process */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Design-to-Production Process</h2>
              <p className="text-lg text-zinc-900/70">
                Systematic approach to seamless design and manufacturing integration
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  phase: "Analysis",
                  title: "Design Manufacturability Assessment",
                  description:
                    "Comprehensive analysis of design specifications for manufacturing feasibility. Identify potential production challenges and optimization opportunities early in the process.",
                },
                {
                  phase: "Optimization",
                  title: "Design for Manufacturing (DFM)",
                  description:
                    "Optimize designs for efficient production while maintaining design intent. Adjust specifications, materials, and processes to reduce costs and improve quality.",
                },
                {
                  phase: "Validation",
                  title: "Prototyping & Testing",
                  description:
                    "Create production-representative prototypes to validate design and manufacturing processes. Test functionality, quality, and production feasibility before full-scale manufacturing.",
                },
                {
                  phase: "Transition",
                  title: "Production Preparation",
                  description:
                    "Prepare comprehensive manufacturing documentation, tooling specifications, and quality standards. Ensure smooth transition to production with minimal risk and maximum efficiency.",
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

        {/* Key Services */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Transition Services</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Comprehensive services to ensure successful design-to-production transitions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Manufacturability Review",
                  description: "Comprehensive assessment of design feasibility for manufacturing processes",
                },
                {
                  title: "Material Optimization",
                  description: "Selection and optimization of materials for performance and cost efficiency",
                },
                {
                  title: "Process Design",
                  description: "Development of optimal manufacturing processes and production workflows",
                },
                {
                  title: "Tooling Strategy",
                  description: "Planning and specification of tooling requirements for efficient production",
                },
                {
                  title: "Quality Planning",
                  description: "Development of quality control systems and testing protocols",
                },
                {
                  title: "Cost Analysis",
                  description: "Detailed cost analysis and optimization for competitive manufacturing",
                },
                {
                  title: "Supplier Integration",
                  description: "Coordination with suppliers and manufacturers for seamless production",
                },
                {
                  title: "Documentation",
                  description: "Complete technical documentation and manufacturing specifications",
                },
                {
                  title: "Launch Support",
                  description: "Production launch support and initial manufacturing optimization",
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

        {/* Success Factors */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Critical Success Factors</h2>
              <p className="text-lg text-zinc-900/70">
                Key elements that ensure successful design-to-production transitions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  factor: "Early Manufacturing Input",
                  description: "Involve manufacturing expertise early in the design process for optimal outcomes",
                },
                {
                  factor: "Cross-functional Collaboration",
                  description: "Foster collaboration between design, engineering, and manufacturing teams",
                },
                {
                  factor: "Iterative Optimization",
                  description: "Continuous refinement through prototyping and testing cycles",
                },
                {
                  factor: "Quality Integration",
                  description: "Build quality considerations into every stage of the transition process",
                },
              ].map((item, index) => (
                <Card key={index} className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-3">{item.factor}</h3>
                    <p className="text-zinc-900/70">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
