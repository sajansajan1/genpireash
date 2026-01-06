import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shirt, Factory, Globe, Award, CheckCircle, Users, Zap, Target } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clothing Manufacturers | Genpire",
  description:
    "Find reliable clothing manufacturers for your fashion brand. Connect with vetted apparel production partners worldwide.",
}

export default function ClothingManufacturersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Shirt className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              Clothing <span className="text-taupe">Manufacturers</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Connect with vetted clothing manufacturers specializing in fashion, activewear, and apparel production.
              Find the perfect partner for your clothing brand with flexible MOQs and quality production.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Factory className="w-5 h-5 mr-2" />
              Browse Clothing Manufacturers
            </Button>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Clothing Manufacturing Specialties</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Our network includes manufacturers specializing in different types of clothing and production methods.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shirt className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Basic Apparel</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    T-shirts, hoodies, sweatshirts, and basic garments with competitive pricing and reliable quality.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 50-200 pieces</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Fashion & Designer</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    High-end fashion, designer pieces, and complex garments requiring specialized construction
                    techniques.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 100-500 pieces</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Activewear & Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Athletic wear, performance fabrics, and technical garments for sports and fitness brands.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 100-300 pieces</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Children's Clothing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Kids' apparel specialists with expertise in safety standards, sizing, and child-friendly designs.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 100-400 pieces</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Sustainable Fashion</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Eco-friendly manufacturers using organic materials, sustainable processes, and ethical practices.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 150-500 pieces</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Custom & Private Label</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed mb-4">
                    Full-service manufacturers offering design, pattern making, and private label production services.
                  </CardDescription>
                  <div className="text-sm text-taupe font-medium">MOQ: 200-1000 pieces</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Manufacturing Regions */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Global Manufacturing Network</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Globe className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Asia-Pacific</h3>
                      <p className="text-zinc-900/70">
                        China, Vietnam, Bangladesh, and India for cost-effective production with established supply
                        chains.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Factory className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Americas</h3>
                      <p className="text-zinc-900/70">
                        USA, Mexico, and Central America for faster turnaround and near-shore production.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Award className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Europe</h3>
                      <p className="text-zinc-900/70">
                        Portugal, Turkey, and Eastern Europe for premium quality and sustainable manufacturing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Production Capabilities</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Cut & Sew</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Standard</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Screen Printing</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Available</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Embroidery</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Premium</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Digital Printing</span>
                      <span className="text-sm bg-taupe/20 text-taupe px-2 py-1 rounded">Modern</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quality Standards */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Quality & Compliance Standards</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                All our clothing manufacturers meet strict quality and compliance requirements.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg bg-white text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-zinc-900">ISO Certified</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70">ISO 9001 quality management systems</CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-zinc-900">OEKO-TEX</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70">
                    Textile safety and sustainability standards
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-zinc-900">WRAP Certified</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70">
                    Worldwide Responsible Accredited Production
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-zinc-900">GOTS Certified</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70">Global Organic Textile Standard</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Launch Your Clothing Brand Today</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Connect with vetted clothing manufacturers who understand fashion brands and offer flexible production
              options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/suppliers">
                  <Factory className="w-5 h-5 mr-2" />
                  Browse Clothing Manufacturers
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/create-tech-pack-online">Create Fashion Tech Pack</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
