import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { CheckCircle, Users, Globe, Clock, ArrowRight, Sparkles, Target, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Hire a Tech Pack Designer | Expert Product Development Services",
  description:
    "Connect with professional tech pack designers for apparel, accessories, and lifestyle products. Get factory-ready documentation with expert precision or use our AI generator.",
  keywords:
    "hire tech pack designer, tech pack services, product development, fashion designer, apparel tech pack, manufacturing documentation",
  openGraph: {
    title: "Hire a Tech Pack Designer | Expert Product Development Services",
    description:
      "Connect with professional tech pack designers for apparel, accessories, and lifestyle products. Get factory-ready documentation with expert precision.",
    url: "https://genpire.ai/hire-tech-pack-designer",
  },
};

export default function HireTechPackDesigner() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Sparkles className="h-4 w-4 mr-2" />
              Expert Services
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Hire a Tech Pack Designer</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Bring Your Product Vision to Life with Expert Precision
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Whether you're creating apparel, accessories, or lifestyle products, a tech pack designer is your
                gateway to professional, factory-ready documentation. At Genpire, we simplify this by offering
                AI-generated tech packs — or helping you collaborate with vetted designers for custom needs.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Work with Tech Pack Experts?</h2>
              <p className="text-lg text-[#1C1917] max-w-2xl mx-auto">
                Professional designers bring specialized knowledge and industry experience to your project
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Specialist Expertise</h3>
                  <p className="text-[#1C1917]">
                    Work with specialists in apparel, footwear, beauty, and homeware who understand your industry's
                    unique requirements and manufacturing standards.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Manufacturing Ready</h3>
                  <p className="text-[#1C1917]">
                    Ensure accuracy for overseas manufacturing with documentation that meets international factory
                    standards and compliance requirements.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Avoid Costly Delays</h3>
                  <p className="text-[#1C1917]">
                    Prevent expensive back-and-forths with factories through precise, comprehensive technical
                    documentation that gets it right the first time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                What You Get with Professional Tech Pack Design
              </h2>
              <p className="text-lg text-[#1C1917]">
                Comprehensive documentation that covers every aspect of your product
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Target,
                  title: "Detailed technical drawings and specifications",
                  description: "Precise flat sketches with construction details",
                },
                {
                  icon: Sparkles,
                  title: "Material sourcing and fabric recommendations",
                  description: "Expert guidance on the best materials for your product",
                },
                {
                  icon: Users,
                  title: "Accurate measurement charts and grading",
                  description: "Professional size charts across all product dimensions",
                },
                {
                  icon: Globe,
                  title: "Color palettes and branding guidelines",
                  description: "Consistent brand identity throughout your product line",
                },
                {
                  icon: Shield,
                  title: "Manufacturing instructions and quality standards",
                  description: "Clear production guidelines and quality checkpoints",
                },
                {
                  icon: CheckCircle,
                  title: "Packaging and labeling specifications",
                  description: "Complete packaging requirements and brand presentation",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <feature.icon className="h-6 w-6 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                        <p className="text-[#1C1917] text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Choose Your Path</h2>
              <p className="text-lg text-[#1C1917]">
                Compare traditional designer services with our AI-powered solution
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Traditional Designer */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader className="text-center pb-6">
                  <Badge variant="outline" className="mb-4 w-fit mx-auto">
                    Traditional Route
                  </Badge>
                  <CardTitle className="text-2xl font-bold text-zinc-900">Hire a Designer</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                      <Clock className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">1-2 weeks timeline</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                      <Users className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">$500-2000 per pack</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-green-200 bg-green-50">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Custom expertise</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-green-200 bg-green-50">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Personal consultation</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                  >
                    Find Designers
                  </Button>
                </CardContent>
              </Card>

              {/* AI Solution */}
              <Card className="relative border-2 border-zinc-900 bg-gradient-to-br from-navy/5 to-navy/10 shadow-xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-zinc-900 text-white px-6 py-2 text-sm font-bold shadow-lg">🚀 RECOMMENDED</Badge>
                </div>
                <CardHeader className="text-center pb-6 pt-8">
                  <Badge className="mb-4 w-fit mx-auto bg-black/20 text-zinc-900 border-navy/30">AI-Powered</Badge>
                  <CardTitle className="text-2xl font-bold text-zinc-900">Genpire AI</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center glass-card rounded-lg p-3">
                      <Zap className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-zinc-900 font-medium">38 seconds generation</span>
                    </div>
                    <div className="flex items-center glass-card rounded-lg p-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-zinc-900 font-medium">From $0.70 per pack</span>
                    </div>
                    <div className="flex items-center glass-card rounded-lg p-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-zinc-900 font-medium">No experience needed</span>
                    </div>
                    <div className="flex items-center glass-card rounded-lg p-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-zinc-900 font-medium">Instant revisions</span>
                    </div>
                  </div>
                  <Button className="w-full bg-zinc-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                    Try AI Generator
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Choose the path that works best for your timeline and budget
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Generate with AI
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
