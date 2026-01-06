import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Shield, CheckCircle, Factory, Globe, Users, Award } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How to Find a Manufacturer for Your Product | Genpire",
  description:
    "Complete guide to finding the right manufacturer for your product. Learn sourcing strategies, vetting processes, and negotiation tips.",
}

export default function HowToFindManufacturerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Factory className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              How to Find a <span className="text-taupe">Manufacturer</span> for Your Product
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Complete step-by-step guide to finding, vetting, and partnering with the right manufacturer for your
              product. From sourcing to production, we'll help you navigate the entire process.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Search className="w-5 h-5 mr-2" />
              Find Manufacturers Now
            </Button>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">5-Step Manufacturing Partner Process</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Our proven methodology for finding and partnering with reliable manufacturers worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">1. Research & Sourcing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Identify potential manufacturers using online platforms, trade shows, and industry networks. Focus
                    on companies with relevant experience.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">2. Vetting & Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Verify certifications, check references, and assess production capabilities. Ensure they meet
                    quality and compliance standards.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">3. Communication & Samples</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Establish clear communication channels, request samples, and evaluate their responsiveness and
                    product quality.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">4. Negotiation & Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Negotiate pricing, minimum order quantities, lead times, and payment terms. Establish clear quality
                    standards and delivery schedules.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">5. Partnership & Production</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Finalize contracts, begin production, and establish ongoing quality control and communication
                    processes.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Considerations */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Key Factors to Consider</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Location & Logistics</h3>
                      <p className="text-zinc-900/70">
                        Consider shipping costs, lead times, and time zone differences when choosing manufacturer
                        location.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Quality Standards</h3>
                      <p className="text-zinc-900/70">
                        Verify certifications, quality control processes, and compliance with industry standards.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Globe className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Production Capacity</h3>
                      <p className="text-zinc-900/70">
                        Ensure they can handle your volume requirements and have capacity for growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Manufacturing Regions</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">China</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Low Cost</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Vietnam</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Growing</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Mexico</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Near-shore</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">USA</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Premium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Find Your Manufacturing Partner?</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Get connected with pre-vetted manufacturers that match your product requirements and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/suppliers">
                  <Factory className="w-5 h-5 mr-2" />
                  Browse Manufacturers
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/create-tech-pack-online">Create Tech Pack First</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
