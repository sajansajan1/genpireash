import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Smartphone, Zap, Layers, CheckCircle, Clock, Award, Package } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rapid Prototyping for Accessories & Home Goods | Genpire",
  description:
    "Fast prototyping services for accessories and home goods. 3D printing, CNC machining, and rapid manufacturing solutions.",
}

export default function RapidPrototypingAccessoriesHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              Rapid Prototyping for <span className="text-taupe">Accessories & Home Goods</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Fast, high-quality prototyping services for accessories and home goods. From concept to physical prototype
              in days, not weeks. 3D printing, CNC machining, and advanced manufacturing technologies.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Zap className="w-5 h-5 mr-2" />
              Start Rapid Prototyping
            </Button>
          </div>
        </section>

        {/* Technologies Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Advanced Prototyping Technologies</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                State-of-the-art manufacturing technologies to bring your product ideas to life quickly and accurately.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-zinc-900">3D Printing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    FDM, SLA, and SLS printing for rapid prototyping with various materials including plastics, resins,
                    and metals.
                  </CardDescription>
                  <div className="text-sm text-blue-600 font-medium">24-72 hours</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-zinc-900">CNC Machining</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Precision machining for metal and plastic parts with tight tolerances and smooth surface finishes.
                  </CardDescription>
                  <div className="text-sm text-green-600 font-medium">3-7 days</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Injection Molding</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Rapid tooling and low-volume injection molding for production-like prototypes and small batches.
                  </CardDescription>
                  <div className="text-sm text-purple-600 font-medium">7-14 days</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Assembly & Finishing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Complete assembly, painting, plating, and finishing services for production-ready prototypes.
                  </CardDescription>
                  <div className="text-sm text-orange-600 font-medium">2-5 days</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Product Categories</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Specialized rapid prototyping services for different product categories with industry expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Accessories & Tech</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-6">
                    Phone cases, wearables, jewelry, bags, wallets, and tech accessories with precise fit and finish
                    requirements.
                  </CardDescription>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Phone & tablet accessories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Wearable devices & jewelry</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Bags, wallets & leather goods</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Gaming & entertainment accessories</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Home className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Home & Living</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-6">
                    Kitchen gadgets, home decor, furniture components, and lifestyle products with functional and
                    aesthetic requirements.
                  </CardDescription>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Kitchen tools & gadgets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Home decor & lighting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Furniture & storage solutions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-900/70">Garden & outdoor products</span>
                    </div>
                  </div>
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
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Rapid Prototyping Process</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Instant Quote</h3>
                      <p className="text-zinc-900/70">
                        Upload your 3D files and get an instant quote with multiple manufacturing options and timelines.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Award className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Expert Review</h3>
                      <p className="text-zinc-900/70">
                        Our engineers review your design for manufacturability and suggest optimizations if needed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Fast Production</h3>
                      <p className="text-zinc-900/70">
                        Your prototype is manufactured using the optimal technology and shipped within days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Material Options</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">ABS Plastic</span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">Durable</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Aluminum</span>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Lightweight</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Stainless Steel</span>
                      <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">Premium</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Resin</span>
                      <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded">Detailed</span>
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
            <h2 className="text-3xl font-bold mb-6">From Idea to Prototype in Days</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Skip the wait and get your prototypes fast. Perfect for product validation, investor presentations, and
              market testing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/order-product-prototype">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Rapid Prototyping
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
