import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Box, Layers, Target, ArrowRight, CheckCircle, Ruler, Monitor } from "lucide-react";

export const metadata: Metadata = {
  title: "CAD Design Services | Professional 3D Modeling & Engineering",
  description:
    "Expert CAD design services for product development, 3D modeling, technical drawings, and engineering documentation. Professional CAD solutions for manufacturing.",
  keywords:
    "CAD design services, 3D modeling, technical drawings, CAD engineering, product modeling, CAD design company, 3D CAD services",
  openGraph: {
    title: "CAD Design Services | Professional 3D Modeling & Engineering",
    description:
      "Expert CAD design services for product development, 3D modeling, and technical drawings for manufacturing.",
    url: "https://genpire.ai/cad-design-services",
  },
};

export default function CADDesignServices() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Box className="h-4 w-4 mr-2" />
              Precision Modeling
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">CAD Design Services</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Professional 3D Modeling & Technical Documentation
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Transform your product concepts into precise 3D models and technical drawings. Our CAD design services
                provide the detailed documentation needed for prototyping, manufacturing, and production success.
              </p>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Professional CAD Solutions</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Comprehensive 3D modeling and technical documentation services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Box className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">3D Modeling</h3>
                  <p className="text-zinc-900/70">
                    Create detailed 3D models from sketches, concepts, or existing products. Parametric modeling ensures
                    easy modifications and design iterations throughout development.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Ruler className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Technical Drawings</h3>
                  <p className="text-zinc-900/70">
                    Generate precise 2D technical drawings with dimensions, tolerances, and manufacturing notes.
                    Industry-standard documentation for production and quality control.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Monitor className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Visualization</h3>
                  <p className="text-zinc-900/70">
                    Photorealistic renderings and animations that showcase your product design. Perfect for marketing,
                    presentations, and stakeholder communication.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CAD Capabilities */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">CAD Design Capabilities</h2>
              <p className="text-lg text-zinc-900/70">Advanced modeling techniques for complex product development</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  category: "Parametric Modeling",
                  title: "Feature-Based Design",
                  description:
                    "Create intelligent 3D models with parametric relationships that allow easy design changes and variations. Modify dimensions and features while maintaining design intent and relationships.",
                },
                {
                  category: "Assembly Design",
                  title: "Multi-Part Systems",
                  description:
                    "Design complex assemblies with multiple components, constraints, and motion studies. Ensure proper fit and function between parts before manufacturing.",
                },
                {
                  category: "Surface Modeling",
                  title: "Complex Geometries",
                  description:
                    "Create smooth, organic surfaces and complex geometries that traditional solid modeling cannot achieve. Perfect for aesthetic products and ergonomic designs.",
                },
                {
                  category: "Simulation Ready",
                  title: "Analysis Preparation",
                  description:
                    "Prepare CAD models for finite element analysis (FEA), computational fluid dynamics (CFD), and other engineering simulations to validate design performance.",
                },
              ].map((capability, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <Layers className="h-8 w-8 text-zinc-900" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {capability.category}
                        </Badge>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-4">{capability.title}</h3>
                        <p className="text-zinc-900/70 leading-relaxed">{capability.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Software & Standards */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Industry-Standard Tools</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Professional CAD software and industry standards for reliable results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "SolidWorks",
                  description: "Parametric 3D modeling, assemblies, and technical drawings for mechanical design",
                },
                {
                  title: "AutoCAD",
                  description: "Precision 2D drafting and 3D modeling for technical documentation and drawings",
                },
                {
                  title: "Fusion 360",
                  description: "Cloud-based CAD/CAM with integrated simulation and manufacturing tools",
                },
                {
                  title: "Inventor",
                  description: "Professional-grade 3D mechanical design and product simulation software",
                },
                {
                  title: "Rhino 3D",
                  description: "Advanced surface modeling for complex geometries and industrial design",
                },
                {
                  title: "KeyShot",
                  description: "Photorealistic rendering and animation for product visualization",
                },
              ].map((software, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{software.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{software.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Professional CAD Design Matters</h2>
              <p className="text-lg text-zinc-900/70">
                The advantages of expert 3D modeling and technical documentation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Precision & Accuracy",
                  description: "Exact dimensions and tolerances ensure perfect fit and function in manufacturing",
                },
                {
                  title: "Design Validation",
                  description: "Identify and resolve issues before prototyping, saving time and money",
                },
                {
                  title: "Manufacturing Ready",
                  description: "CAD files optimized for CNC machining, 3D printing, and other manufacturing processes",
                },
                {
                  title: "Easy Modifications",
                  description: "Parametric models allow quick design changes and iterations throughout development",
                },
                {
                  title: "Professional Documentation",
                  description: "Industry-standard drawings and specifications for clear manufacturing communication",
                },
                {
                  title: "Visualization & Marketing",
                  description: "High-quality renderings for presentations, marketing, and investor communications",
                },
              ].map((benefit, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{benefit.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{benefit.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for Professional CAD Design?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start with a comprehensive tech pack that provides the foundation for accurate CAD modeling and technical
              documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Generate Product Specs
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/3d-printing-services">Explore 3D Printing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
