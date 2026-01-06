import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Search, CheckCircle, Clock, DollarSign, Users, Zap, Target } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Prototype Manufacturer Guide | Genpire",
  description:
    "Complete guide to finding and working with prototype manufacturers. Learn the process from concept to physical prototype.",
}

export default function PrototypeManufacturerGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Wrench className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              Prototype <span className="text-taupe">Manufacturer Guide</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Complete step-by-step guide to finding and working with prototype manufacturers. Transform your product
              ideas into physical prototypes that validate your concept and attract investors.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Wrench className="w-5 h-5 mr-2" />
              Find Prototype Manufacturers
            </Button>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Prototype Development Process</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Follow this proven process to successfully develop prototypes that validate your product concept.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">1. Define Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Clearly define your prototype goals, functionality requirements, materials, and success criteria
                    before starting.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">2. Find Specialists</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Research and identify prototype manufacturers with experience in your product category and
                    manufacturing methods.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">3. Collaborate & Build</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Work closely with your chosen manufacturer through design iterations, material selection, and
                    prototype development.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">4. Test & Iterate</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Test your prototype thoroughly, gather feedback, and iterate on the design before moving to
                    production.
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
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Types of Prototypes</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Different prototype types serve different purposes in your product development journey.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Proof of Concept</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Basic prototype to validate core functionality and feasibility. Often made with simple materials and
                    methods.
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Timeline:</span>
                      <span className="text-zinc-900">1-2 weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Cost:</span>
                      <span className="text-zinc-900">$500-2,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Functional Prototype</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Working prototype with core features and functionality. Used for testing and user feedback
                    collection.
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Timeline:</span>
                      <span className="text-zinc-900">3-6 weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Cost:</span>
                      <span className="text-zinc-900">$2,000-8,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Production-Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    High-fidelity prototype using production materials and methods. Ready for manufacturing and market
                    launch.
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Timeline:</span>
                      <span className="text-zinc-900">6-12 weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-900/60">Cost:</span>
                      <span className="text-zinc-900">$5,000-20,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Considerations */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Key Considerations</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Timeline Planning</h3>
                      <p className="text-zinc-900/70">
                        Factor in design iterations, material sourcing, and testing phases when planning your prototype
                        timeline.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <DollarSign className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Budget Management</h3>
                      <p className="text-zinc-900/70">
                        Balance prototype fidelity with budget constraints. Start simple and increase complexity as
                        needed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Communication</h3>
                      <p className="text-zinc-900/70">
                        Maintain clear communication with your prototype manufacturer throughout the development
                        process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Manufacturing Methods</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">3D Printing</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Fast</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">CNC Machining</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Precise</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Injection Molding</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Production</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Handcrafted</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Custom</span>
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
            <h2 className="text-3xl font-bold mb-6">Ready to Build Your Prototype?</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Connect with experienced prototype manufacturers who can bring your product ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/order-product-prototype">
                  <Wrench className="w-5 h-5 mr-2" />
                  Order Prototype Now
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
