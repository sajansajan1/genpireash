import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Printer, Layers, ArrowRight, CheckCircle, Clock, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "3D Printing Services | Professional Prototyping & Manufacturing",
  description:
    "Professional 3D printing services for rapid prototyping, product development, and small-batch manufacturing. Get high-quality prints with fast turnaround times.",
  keywords:
    "3d printing services, rapid prototyping, 3d printing, additive manufacturing, prototype development, product prototyping, 3d printing company",
  openGraph: {
    title: "3D Printing Services | Professional Prototyping & Manufacturing",
    description:
      "Professional 3D printing services for rapid prototyping, product development, and small-batch manufacturing.",
    url: "https://genpire.ai/3d-printing-services",
  },
};

export default function ThreeDPrintingServices() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Printer className="h-4 w-4 mr-2" />
              Professional Services
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">3D Printing Services</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Transform Your Ideas into Physical Prototypes with Precision 3D Printing
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Professional 3D printing services that bring your product concepts to life. From rapid prototyping to
                small-batch production, we deliver high-quality prints with exceptional detail and fast turnaround
                times.
              </p>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-600 mb-4">
                Why Choose Professional 3D Printing?
              </h2>
              <p className="text-lg text-zinc-600/70 max-w-2xl mx-auto">
                Advanced additive manufacturing technology for precise, reliable prototyping and production
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-600 mb-4">Rapid Turnaround</h3>
                  <p className="text-zinc-600/70">
                    Get your prototypes in days, not weeks. Our advanced 3D printing technology enables fast iteration
                    and quick design validation for accelerated product development.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-600 mb-4">Precision Quality</h3>
                  <p className="text-zinc-600/70">
                    Industrial-grade 3D printers deliver exceptional detail and accuracy. Perfect for functional
                    prototypes, design validation, and small-batch manufacturing with consistent quality.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Layers className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-600 mb-4">Material Variety</h3>
                  <p className="text-zinc-600/70">
                    Wide selection of materials including PLA, ABS, PETG, TPU, and engineering-grade plastics. Choose
                    the perfect material for your specific application and requirements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-600 mb-4">3D Printing Applications</h2>
              <p className="text-lg text-zinc-600/70">
                Versatile additive manufacturing solutions for diverse industries and applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Rapid Prototyping",
                  description: "Quick iteration and design validation for product development cycles",
                },
                {
                  title: "Functional Testing",
                  description: "Create working prototypes to test fit, form, and function before production",
                },
                {
                  title: "Custom Tooling",
                  description: "Manufacturing aids, jigs, fixtures, and custom tools for production processes",
                },
                {
                  title: "Small-Batch Production",
                  description: "Cost-effective manufacturing for limited runs and specialized components",
                },
                {
                  title: "Architectural Models",
                  description: "Detailed scale models for architectural visualization and presentation",
                },
                {
                  title: "Medical Devices",
                  description: "Biocompatible materials for medical prototypes and custom healthcare solutions",
                },
              ].map((application, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-zinc-900/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle className="h-6 w-6 text-zinc-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-600 mb-2">{application.title}</h3>
                        <p className="text-zinc-600/70 text-sm">{application.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Print Your Prototype?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start with a professional tech pack to ensure your 3D printing project succeeds from concept to
              completion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-600 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Generate Tech Pack First
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-600 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/rapid-prototyping">Learn About Prototyping</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
