import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Upload, CheckCircle, DollarSign, Users, Zap, Award } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order Product Prototype | Genpire",
  description:
    "Order professional product prototypes online. Fast turnaround, expert craftsmanship, and competitive pricing.",
}

export default function OrderProductPrototypePage() {
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
              Order Product <span className="text-taupe">Prototype</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Get professional prototypes made by expert manufacturers. Upload your designs, choose your materials, and
              receive high-quality prototypes in days, not weeks.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Upload className="w-5 h-5 mr-2" />
              Upload Design & Order Now
            </Button>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">How Prototype Ordering Works</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Simple 4-step process to get your product prototypes made by professional manufacturers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">1. Upload Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Upload your tech pack, 3D files, sketches, or detailed specifications. Our system supports all major
                    file formats.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">2. Get Instant Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Receive instant pricing based on materials, complexity, and quantity. Choose from multiple
                    manufacturing options and timelines.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">3. Expert Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Our manufacturing experts review your design for feasibility and suggest optimizations if needed
                    before production starts.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">4. Receive Prototype</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Your prototype is manufactured by vetted partners and shipped directly to you with quality assurance
                    documentation.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Prototype Types */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Prototype Categories</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Professional prototyping services across different product categories with specialized expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Electronics & Tech</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Consumer electronics, IoT devices, wearables, and tech accessories with functional electronics and
                    precise assembly.
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Timeline:</span>
                      <span className="text-zinc-900">7-14 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Starting at:</span>
                      <span className="text-zinc-900">$500-2,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Fashion & Apparel</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Clothing, footwear, bags, and fashion accessories with proper fit, materials, and construction
                    methods.
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Timeline:</span>
                      <span className="text-zinc-900">10-21 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Starting at:</span>
                      <span className="text-zinc-900">$200-800</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Home & Industrial</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Home goods, kitchen products, tools, and industrial components with functional testing and quality
                    validation.
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Timeline:</span>
                      <span className="text-zinc-900">5-14 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Starting at:</span>
                      <span className="text-zinc-900">$300-1,500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Manufacturing Methods */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Manufacturing Methods</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">3D Printing</h3>
                      <p className="text-zinc-900/70">
                        Rapid prototyping with FDM, SLA, and SLS technologies for complex geometries and fast
                        turnaround.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Award className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">CNC Machining</h3>
                      <p className="text-zinc-900/70">
                        Precision machining for metal and plastic parts with tight tolerances and production-like
                        finishes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Handcrafted Assembly</h3>
                      <p className="text-zinc-900/70">
                        Expert craftspeople for complex assemblies, soft goods, and products requiring manual
                        construction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Quality Guarantees</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-zinc-900/70">100% Quality Inspection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-zinc-900/70">Satisfaction Guarantee</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-zinc-900/70">On-Time Delivery</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-zinc-900/70">Expert Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Transparent Pricing</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Clear, upfront pricing with no hidden fees. Choose the service level that fits your needs and budget.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="text-2xl font-bold text-zinc-900 mb-2">Basic</div>
                  <div className="text-3xl font-bold text-taupe mb-4">$299+</div>
                  <CardDescription className="text-zinc-900/70">
                    Perfect for simple prototypes and concept validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">3D printed prototype</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Basic materials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">5-7 day turnaround</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Quality inspection</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-taupe shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="text-sm bg-taupe text-zinc-900 px-3 py-1 rounded-full mb-2">Most Popular</div>
                  <div className="text-2xl font-bold text-zinc-900 mb-2">Professional</div>
                  <div className="text-3xl font-bold text-taupe mb-4">$599+</div>
                  <CardDescription className="text-zinc-900/70">
                    High-quality prototypes for testing and validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Multiple manufacturing methods</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Production-grade materials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">7-10 day turnaround</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Expert consultation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="text-2xl font-bold text-zinc-900 mb-2">Premium</div>
                  <div className="text-3xl font-bold text-taupe mb-4">$1,299+</div>
                  <CardDescription className="text-zinc-900/70">
                    Production-ready prototypes for market launch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Production methods</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Final materials & finishes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">10-14 day turnaround</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Dedicated project manager</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Order Your Prototype?</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Upload your design files and get an instant quote. Professional prototypes delivered fast with quality
              guarantee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Design & Order
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
