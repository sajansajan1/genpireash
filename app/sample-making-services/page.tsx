import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shirt, Footprints, Package, CheckCircle, Clock, Users, Zap, Award } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sample Making Services for Fashion & Footwear | Genpire",
  description:
    "Professional sample making services for fashion brands and footwear companies. Get high-quality samples before production.",
}

export default function SampleMakingServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              Sample Making Services for <span className="text-taupe">Fashion & Footwear</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Professional sample making services for fashion brands and footwear companies. Get high-quality samples to
              validate your designs, test fit and function, and secure buyer approval before mass production.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Package className="w-5 h-5 mr-2" />
              Order Samples Now
            </Button>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Sample Making Specialties</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Expert sample makers specializing in different product categories with industry-specific expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shirt className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Fashion & Apparel</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Complete garment sampling for fashion brands, including dresses, tops, bottoms, outerwear, and
                    activewear with precise fit and finish.
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Timeline:</span>
                      <span className="text-zinc-900">7-14 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Starting at:</span>
                      <span className="text-zinc-900">$150-500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Footprints className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Footwear</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Specialized footwear sampling including sneakers, boots, sandals, and dress shoes with proper last
                    development and construction methods.
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Timeline:</span>
                      <span className="text-zinc-900">14-21 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Starting at:</span>
                      <span className="text-zinc-900">$300-800</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Accessories</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Bags, belts, jewelry, hats, and fashion accessories with attention to hardware, materials, and
                    construction details.
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Timeline:</span>
                      <span className="text-zinc-900">5-10 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Starting at:</span>
                      <span className="text-zinc-900">$100-400</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sample Types */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Types of Samples</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Different sample types serve different purposes in your product development and sales process.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Proto Sample</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Initial sample to test design concept, fit, and basic construction. Used for early validation and
                    feedback.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Fit Sample</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Refined sample focusing on fit, sizing, and comfort. Used for fit testing and pattern adjustments.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Sales Sample</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    High-quality sample representing final product. Used for buyer meetings, trade shows, and sales
                    presentations.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Production Sample</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Final approval sample using production materials and methods. Used for quality standards and
                    production approval.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process & Benefits */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Sample Making Process</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Design Review</h3>
                      <p className="text-zinc-900/70">
                        Our experts review your tech pack and provide feedback on construction and materials.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Material Sourcing</h3>
                      <p className="text-zinc-900/70">
                        We source the exact materials specified or suggest suitable alternatives if needed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Expert Construction</h3>
                      <p className="text-zinc-900/70">
                        Skilled craftspeople create your sample with attention to every detail and specification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Sample Turnaround Times</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Basic Apparel</span>
                      <span className="font-bold text-zinc-900">7-10 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Complex Garments</span>
                      <span className="font-bold text-zinc-900">10-14 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Footwear</span>
                      <span className="font-bold text-zinc-900">14-21 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Accessories</span>
                      <span className="font-bold text-zinc-900">5-10 days</span>
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
            <h2 className="text-3xl font-bold mb-6">Ready to Create Your Samples?</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Get professional samples that accurately represent your vision and help you secure buyers and investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/order-product-prototype">
                  <Package className="w-5 h-5 mr-2" />
                  Order Samples Now
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
