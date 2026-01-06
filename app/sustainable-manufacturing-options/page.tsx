import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Recycle, Heart, Globe, Factory, Award, CheckCircle, TreePine } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ethical & Sustainable Manufacturing Options | Genpire",
  description:
    "Find ethical and sustainable manufacturers committed to environmental responsibility and fair labor practices.",
}

export default function SustainableManufacturingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Leaf className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              Ethical & <span className="text-taupe">Sustainable Manufacturing</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Partner with manufacturers committed to environmental responsibility, fair labor practices, and
              sustainable production methods. Build products that make a positive impact on the world.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Leaf className="w-5 h-5 mr-2" />
              Find Sustainable Partners
            </Button>
          </div>
        </section>

        {/* Sustainability Pillars */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Pillars of Sustainable Manufacturing</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Our partner manufacturers are evaluated across these key sustainability criteria to ensure responsible
                production.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TreePine className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Environmental Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Renewable energy usage, waste reduction, water conservation, and carbon footprint minimization.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Fair Labor Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Fair wages, safe working conditions, reasonable hours, and respect for worker rights and dignity.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Recycle className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Circular Economy</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Recycled materials, waste-to-energy programs, and design for recyclability and longevity.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-zinc-900">Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    B-Corp, GOTS, OEKO-TEX, Fair Trade, and other recognized sustainability certifications.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sustainable Materials */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Sustainable Material Options</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Leaf className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Organic & Natural Fibers</h3>
                      <p className="text-zinc-900/70">
                        Organic cotton, hemp, linen, and other sustainably grown natural materials.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Recycle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Recycled Materials</h3>
                      <p className="text-zinc-900/70">
                        Post-consumer recycled plastics, metals, and fabrics giving new life to waste.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Bio-based Alternatives</h3>
                      <p className="text-zinc-900/70">
                        Innovative materials from agricultural waste, algae, and other renewable sources.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Sustainability Certifications</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">GOTS Certified</span>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Organic</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">B-Corp Certified</span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">Social</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Fair Trade</span>
                      <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">Ethical</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Carbon Neutral</span>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Climate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Why Choose Sustainable Manufacturing?</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Beyond doing good for the planet, sustainable manufacturing offers tangible business benefits.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Brand Differentiation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Stand out in the market with authentic sustainability credentials that resonate with conscious
                    consumers.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Consumer Demand</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Meet growing consumer expectations for environmentally and socially responsible products.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Future-Proof Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Prepare for increasing regulations and market shifts toward sustainable business practices.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Build Products That Make a Difference</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Partner with manufacturers who share your commitment to sustainability and ethical production.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/suppliers">
                  <Factory className="w-5 h-5 mr-2" />
                  Find Sustainable Partners
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/create-tech-pack-online">Create Sustainable Tech Pack</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
