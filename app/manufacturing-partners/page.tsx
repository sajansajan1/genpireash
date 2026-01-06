import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Factory, Globe, ArrowRight, CheckCircle, Shield, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Manufacturing Partners | Trusted Production & Supplier Network",
  description:
    "Connect with vetted manufacturing partners worldwide. Access reliable suppliers, quality manufacturers, and production facilities for your product development needs.",
  keywords:
    "manufacturing partners, production partners, suppliers, manufacturers, factory network, production facilities, manufacturing sourcing",
  openGraph: {
    title: "Manufacturing Partners | Trusted Production & Supplier Network",
    description:
      "Connect with vetted manufacturing partners worldwide. Access reliable suppliers and production facilities.",
    url: "https://genpire.ai/manufacturing-partners",
  },
};

export default function ManufacturingPartners() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingNavbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-zinc-900 to-zinc-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Factory className="h-4 w-4 mr-2" />
              Global Network
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Manufacturing Partners</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Connect with Trusted Production Partners Worldwide
            </p>
            <div className="glass-card-dark rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-lg text-white/80">
                Access our network of vetted manufacturing partners across the globe. From small-batch production to
                large-scale manufacturing, find reliable suppliers who can bring your products to life with quality and
                precision.
              </p>
            </div>
          </div>
        </section>

        {/* Partner Benefits */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                Why Choose Our Manufacturing Partners
              </h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Vetted suppliers committed to quality, reliability, and your success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Vetted & Verified</h3>
                  <p className="text-zinc-900/70">
                    All manufacturing partners undergo rigorous vetting including capability assessments, quality
                    certifications, and reference checks to ensure reliable production.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Global Reach</h3>
                  <p className="text-zinc-900/70">
                    Access manufacturing capabilities across Asia, Europe, and the Americas. Find the right location for
                    your production needs, timeline, and budget requirements.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Specialized Expertise</h3>
                  <p className="text-zinc-900/70">
                    Partners specialize in specific industries and manufacturing processes, ensuring you work with
                    experts who understand your product category and requirements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Manufacturing Categories */}
        <section className="py-20 px-4 bg-cream">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Manufacturing Specializations</h2>
              <p className="text-lg text-zinc-900/70">Diverse manufacturing capabilities across multiple industries</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  category: "Apparel & Textiles",
                  title: "Fashion & Clothing Manufacturing",
                  description:
                    "Connect with garment manufacturers specializing in apparel, accessories, and textile products. From cut-and-sew operations to knitting facilities, find partners for fashion, activewear, and specialty clothing.",
                },
                {
                  category: "Electronics & Tech",
                  title: "Electronic Device Production",
                  description:
                    "Access manufacturers with expertise in consumer electronics, IoT devices, and tech accessories. Partners equipped with SMT lines, assembly capabilities, and quality testing for electronic products.",
                },
                {
                  category: "Home & Lifestyle",
                  title: "Consumer Goods Manufacturing",
                  description:
                    "Find manufacturers for home goods, kitchenware, furniture, and lifestyle products. Partners with injection molding, woodworking, and assembly capabilities for consumer products.",
                },
                {
                  category: "Beauty & Personal Care",
                  title: "Cosmetics & Packaging",
                  description:
                    "Connect with manufacturers specializing in beauty products, cosmetics, and personal care items. FDA-compliant facilities with filling, packaging, and private label capabilities.",
                },
              ].map((specialization, index) => (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="h-16 w-16 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                        <Factory className="h-8 w-8 text-zinc-900" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {specialization.category}
                        </Badge>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-4">{specialization.title}</h3>
                        <p className="text-zinc-900/70 leading-relaxed">{specialization.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Selection Process */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">How We Select Partners</h2>
              <p className="text-lg text-zinc-900/70 max-w-2xl mx-auto">
                Rigorous vetting process ensures quality and reliability
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Capability Assessment",
                  description: "Evaluate production capacity, equipment, and technical capabilities",
                },
                {
                  title: "Quality Certifications",
                  description: "Verify ISO certifications, industry standards, and quality management systems",
                },
                {
                  title: "Financial Stability",
                  description: "Assess financial health and business stability for long-term partnerships",
                },
                {
                  title: "Reference Checks",
                  description: "Contact existing clients and verify track record of successful projects",
                },
                {
                  title: "Facility Audits",
                  description: "Conduct on-site inspections of manufacturing facilities and processes",
                },
                {
                  title: "Communication Standards",
                  description: "Ensure clear communication channels and English-speaking project managers",
                },
              ].map((criteria, index) => (
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
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{criteria.title}</h3>
                        <p className="text-zinc-900/70 text-sm">{criteria.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Manufacturing Partner?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Start with a professional tech pack to communicate your requirements clearly to potential manufacturing
              partners and ensure successful production.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-zinc-900 hover:bg-cream shadow-xl transform transition-all duration-300 hover:scale-105 group px-8 py-4"
              >
                <Link href="/">
                  Create Tech Pack First
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-zinc-900 bg-transparent shadow-lg px-8 py-4"
              >
                <Link href="/supplier-sourcing">Learn About Sourcing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
