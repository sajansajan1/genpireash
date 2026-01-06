import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package2, Users, Zap, Target, Factory, TrendingUp, CheckCircle, DollarSign } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Small Batch Manufacturing Guide | Genpire",
  description:
    "Complete guide to small batch manufacturing. Learn strategies, find partners, and optimize production for small quantities.",
}

export default function SmallBatchManufacturingGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Package2 className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              Small Batch <span className="text-taupe">Manufacturing Guide</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Master the art of small batch manufacturing. Learn how to produce high-quality products in smaller
              quantities, reduce risk, and scale efficiently as your business grows.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Package2 className="w-5 h-5 mr-2" />
              Start Small Batch Production
            </Button>
          </div>
        </section>

        {/* Strategy Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Small Batch Manufacturing Strategies</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Proven approaches to optimize small batch production for quality, cost-effectiveness, and scalability.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Market Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Test product-market fit with small batches before committing to large-scale production. Gather
                    feedback and iterate quickly.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Cost Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Balance per-unit costs with inventory risk. Small batches may cost more per unit but reduce overall
                    financial exposure.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Rapid Iteration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Make design improvements and product updates between batches based on customer feedback and market
                    response.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Flexible Partnerships</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Work with manufacturers who specialize in small batches and understand the unique needs of growing
                    businesses.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Scalable Processes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Design production processes that can efficiently scale from small batches to larger volumes as
                    demand grows.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Quality Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Maintain consistent quality standards across small batches with proper documentation and inspection
                    processes.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits vs Challenges */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Benefits of Small Batch Manufacturing</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Lower Financial Risk</h3>
                      <p className="text-zinc-900/70">
                        Reduce inventory investment and minimize losses from unsold products.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Faster Time to Market</h3>
                      <p className="text-zinc-900/70">
                        Launch products quickly and respond to market demands with agility.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Product Flexibility</h3>
                      <p className="text-zinc-900/70">Easy to make changes and improvements between production runs.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Key Considerations</h2>
                <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-zinc-900 mb-4">Batch Size Guidelines</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-900/70">Test Batch</span>
                        <span className="font-bold text-zinc-900">25-100 units</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-900/70">Launch Batch</span>
                        <span className="font-bold text-zinc-900">100-500 units</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-900/70">Growth Batch</span>
                        <span className="font-bold text-zinc-900">500-2000 units</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-900/70">Scale Batch</span>
                        <span className="font-bold text-zinc-900">2000+ units</span>
                      </div>
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
            <h2 className="text-3xl font-bold mb-6">Ready to Start Small Batch Production?</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Connect with manufacturers who specialize in small batch production and understand your growth journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/suppliers">
                  <Factory className="w-5 h-5 mr-2" />
                  Find Small Batch Partners
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/create-tech-pack-online">Create Tech Pack</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
