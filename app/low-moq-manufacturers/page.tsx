import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingDown, Zap, CheckCircle, Factory, Shirt, Home, Smartphone } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Low MOQ Manufacturers - Clothing, Footwear & Accessories | Genpire",
  description:
    "Find manufacturers with low minimum order quantities. Perfect for startups and small businesses launching new products.",
}

export default function LowMOQManufacturersPage() {
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
              Low MOQ <span className="text-taupe">Manufacturers</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Find manufacturers with low minimum order quantities for clothing, footwear, and accessories. Perfect for
              startups, small businesses, and product testing without huge upfront investments.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <TrendingDown className="w-5 h-5 mr-2" />
              Find Low MOQ Partners
            </Button>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Low MOQ Manufacturing Categories</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Specialized manufacturers offering flexible minimum order quantities across different product
                categories.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shirt className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Clothing & Apparel</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    T-shirts, hoodies, dresses, activewear, and fashion accessories with MOQs as low as 50-100 pieces.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 50-500 pieces</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Footwear</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Sneakers, boots, sandals, and specialty footwear with flexible order quantities for new brands.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 100-300 pairs</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Accessories</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Bags, jewelry, phone cases, watches, and tech accessories with startup-friendly minimums.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 25-200 pieces</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Home className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Home Goods</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Kitchenware, decor, textiles, and lifestyle products with low minimum orders for testing.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 50-300 pieces</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Why Choose Low MOQ Manufacturing?</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <TrendingDown className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Lower Financial Risk</h3>
                      <p className="text-zinc-900/70">
                        Test your product in the market without massive upfront inventory investments.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Faster Market Entry</h3>
                      <p className="text-zinc-900/70">
                        Launch products quickly with smaller initial orders and iterate based on feedback.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Product Validation</h3>
                      <p className="text-zinc-900/70">
                        Validate demand and refine your product before committing to larger production runs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Typical MOQ Ranges</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Custom T-Shirts</span>
                      <span className="font-bold text-zinc-900">50-100 pcs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Hoodies/Sweatshirts</span>
                      <span className="font-bold text-zinc-900">100-200 pcs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Accessories</span>
                      <span className="font-bold text-zinc-900">25-150 pcs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Footwear</span>
                      <span className="font-bold text-zinc-900">100-300 pairs</span>
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
            <h2 className="text-3xl font-bold mb-6">Start Small, Scale Smart</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Connect with manufacturers who understand startups and offer flexible minimum order quantities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/suppliers">
                  <Factory className="w-5 h-5 mr-2" />
                  Browse Low MOQ Partners
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
