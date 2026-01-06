import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Users, Zap, CheckCircle, Award, Target, Layers } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Product Design Services | Genpire",
  description:
    "Professional custom product design services. From concept to production-ready designs with expert industrial designers.",
};

export default function CustomProductDesignServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Palette className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              Custom Product <span className="text-taupe">Design Services</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Transform your product ideas into market-ready designs with our expert industrial designers. From initial
              concept sketches to production-ready CAD files and tech packs.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Palette className="w-5 h-5 mr-2" />
              Start Custom Design Project
            </Button>
          </div>
        </section>

        {/* Design Services */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Complete Design Solutions</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                End-to-end product design services covering every stage from initial concept to production-ready
                specifications.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Concept Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Transform your ideas into viable product concepts with market research, user needs analysis, and
                    creative ideation sessions.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">Starting at $2,500</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Industrial Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Professional product styling, form factor development, and aesthetic design that balances beauty
                    with functionality.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">Starting at $3,500</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">CAD & Engineering</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Detailed 3D CAD modeling, engineering drawings, and technical specifications ready for manufacturing
                    and prototyping.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">Starting at $4,000</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Design for Manufacturing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Optimize your design for efficient manufacturing, cost reduction, and quality control with DFM
                    analysis and recommendations.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">Starting at $2,000</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Brand Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Integrate your brand identity into product design with consistent styling, color schemes, and brand
                    expression elements.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">Starting at $1,500</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">User Experience Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Focus on user-centered design with ergonomics, usability testing, and interface design for optimal
                    user experience.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">Starting at $3,000</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Design Process */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Our Design Process</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Structured approach ensuring your product design meets market needs, manufacturing requirements, and
                business goals.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-zinc-900">1. Discovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Deep dive into your vision, target market, technical requirements, and business constraints to
                    define project scope.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-zinc-900">2. Concept Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Generate multiple design concepts, explore different approaches, and refine ideas based on
                    feasibility and market fit.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-zinc-900">3. Detailed Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Develop detailed 3D models, technical drawings, and specifications with materials, dimensions, and
                    manufacturing details.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-zinc-900">4. Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Prototype testing, design validation, and final optimization to ensure your product is ready for
                    manufacturing.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Expertise Areas */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Design Expertise</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Award className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Award-Winning Designers</h3>
                      <p className="text-zinc-900/70">
                        Our team includes designers with international design awards and experience at top design
                        consultancies.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Cross-Industry Experience</h3>
                      <p className="text-zinc-900/70">
                        Expertise across consumer electronics, fashion, home goods, medical devices, and industrial
                        products.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Latest Technologies</h3>
                      <p className="text-zinc-900/70">
                        Advanced CAD software, simulation tools, and rapid prototyping technologies for optimal results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Project Timelines</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Concept Development</span>
                      <span className="font-bold text-zinc-900">2-3 weeks</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Industrial Design</span>
                      <span className="font-bold text-zinc-900">3-4 weeks</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">CAD & Engineering</span>
                      <span className="font-bold text-zinc-900">4-6 weeks</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Complete Project</span>
                      <span className="font-bold text-zinc-900">8-12 weeks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Showcase */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Design Portfolio</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Successful product designs across various industries, from concept to market launch.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-blue-700 font-medium">Consumer Electronics</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-zinc-900 mb-2">Smart Home Device</h3>
                  <p className="text-zinc-900/70 text-sm">
                    Award-winning IoT device design with intuitive interface and sustainable materials.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-green-700 font-medium">Fashion Accessories</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-zinc-900 mb-2">Luxury Watch Collection</h3>
                  <p className="text-zinc-900/70 text-sm">
                    Premium timepiece design balancing traditional craftsmanship with modern aesthetics.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-purple-700 font-medium">Home & Living</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-zinc-900 mb-2">Modular Furniture System</h3>
                  <p className="text-zinc-900/70 text-sm">
                    Innovative furniture design with modular components for flexible living spaces.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Design Your Next Product?</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Work with expert designers to transform your ideas into market-ready products that customers love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/hire-tech-pack-designer">
                  <Palette className="w-5 h-5 mr-2" />
                  Start Design Project
                </Link>
              </Button>
              {/* <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                View Portfolio
              </Button> */}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
