import { LandingNavbar } from "@/components/landing-navbar"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Wand2, ImageIcon, Layers, Sparkles, Monitor, Smartphone, Package } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Product Design & Mockup Tools | Genpire",
  description:
    "Create stunning product designs and mockups with AI. Generate professional visuals for your products in seconds.",
}

export default function AIProductDesignToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-taupe/20 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-taupe/20 rounded-2xl flex items-center justify-center">
                <Palette className="w-8 h-8 text-taupe" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              AI Product Design & <span className="text-taupe">Mockup Tools</span>
            </h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Create professional product designs and stunning mockups with AI. Generate photorealistic visuals,
              technical drawings, and marketing materials for your products in seconds.
            </p>
            <Button size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
              <Wand2 className="w-5 h-5 mr-2" />
              Start Designing Now
            </Button>
          </div>
        </section>

        {/* Tools Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Complete AI Design Suite</h2>
              <p className="text-zinc-900/70 max-w-2xl mx-auto">
                Everything you need to visualize, design, and present your products professionally.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Product Mockups</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Generate photorealistic mockups of your products in various settings and contexts for marketing and
                    presentations.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Technical Drawings</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Create detailed technical illustrations and exploded views perfect for tech packs and manufacturing
                    documentation.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Color Variations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Instantly generate your product in multiple colorways and material finishes to explore design
                    options.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Monitor className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Lifestyle Scenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Place your products in realistic lifestyle settings to show them in use and create compelling
                    marketing visuals.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Packaging Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Design professional packaging and labels that complement your product and enhance brand
                    presentation.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-taupe/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-6 h-6 text-taupe" />
                  </div>
                  <CardTitle className="text-zinc-900">Social Media Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-zinc-900/70 leading-relaxed">
                    Create optimized visuals for social media, e-commerce listings, and digital marketing campaigns.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Professional Results in Seconds</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">AI-Powered Generation</h3>
                      <p className="text-zinc-900/70">
                        Advanced AI creates photorealistic designs and mockups from simple descriptions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Layers className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Multiple Formats</h3>
                      <p className="text-zinc-900/70">
                        Export in various formats optimized for web, print, and manufacturing use.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-taupe/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Wand2 className="w-4 h-4 text-taupe" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Easy Customization</h3>
                      <p className="text-zinc-900/70">
                        Fine-tune colors, materials, lighting, and composition with simple controls.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-navy/10 to-taupe/20 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-zinc-900 mb-4">Popular Use Cases</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">E-commerce Listings</span>
                      <span className="font-bold text-zinc-900">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Social Media Marketing</span>
                      <span className="font-bold text-zinc-900">78%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Investor Presentations</span>
                      <span className="font-bold text-zinc-900">65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-900/70">Manufacturing Docs</span>
                      <span className="font-bold text-zinc-900">92%</span>
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
            <h2 className="text-3xl font-bold mb-6">Transform Your Product Ideas into Stunning Visuals</h2>
            <p className="text-xl text-cream/90 mb-8 leading-relaxed">
              Create professional product designs and mockups that sell. No design experience required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/">
                  <Wand2 className="w-5 h-5 mr-2" />
                  Start Creating Designs
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
