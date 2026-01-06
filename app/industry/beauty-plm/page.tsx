import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Sparkles, Heart, Zap, Shield, Users, Clock, Star, ChevronRight } from "lucide-react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingNavbar } from "@/components/landing-navbar";

export const metadata = {
  title: "Beauty & Packaging PLM Solutions | AI-Powered Cosmetics Tech Pack Software",
  description:
    "Transform your beauty business with Genpire's Beauty PLM software. Streamline cosmetics design, packaging tech packs, and production with AI-powered PLM solutions.",
};

export default function BeautyPLMPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-zinc-900 to-zinc-600 py-16 md:py-24 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center rounded-full border border-taupe/30 bg-taupe/20 px-4 py-1 text-sm text-cream">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                <span>Beauty Innovation Powered by AI</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Beauty & Packaging PLM Solutions</h1>
              <p className="text-xl text-taupe/90 leading-relaxed">
                Revolutionize your beauty product development with AI-powered PLM technology. From concept to shelf,
                streamline cosmetics formulation, packaging design, and regulatory compliance with precision-engineered
                solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="outline">
                  Start Your Beauty PLM Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-taupe text-taupe hover:bg-taupe hover:text-zinc-900 bg-transparent"
                >
                  View Beauty Examples
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-taupe/50 to-cream/50 opacity-30 blur"></div>
                <Card className="relative glass-card-dark border-none">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-taupe/20 flex items-center justify-center">
                          <Heart className="h-6 w-6 text-taupe" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-cream">Luxury Lipstick Collection</h3>
                          <p className="text-sm text-cream/70">Premium Beauty Product</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-cream/70">Formula:</span>
                          <p className="text-cream font-medium">Matte Long-Wear</p>
                        </div>
                        <div>
                          <span className="text-cream/70">Packaging:</span>
                          <p className="text-cream font-medium">Magnetic Closure</p>
                        </div>
                        <div>
                          <span className="text-cream/70">Shades:</span>
                          <p className="text-cream font-medium">12 Colors</p>
                        </div>
                        <div>
                          <span className="text-cream/70">Volume:</span>
                          <p className="text-cream font-medium">3.5g</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-xs text-cream/70">Regulatory Status</span>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-xs text-green-400">FDA Compliant</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beauty Product Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Comprehensive Beauty Product PLM</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              From skincare to color cosmetics, our PLM solutions cover every aspect of beauty product development and
              packaging innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💄",
                title: "Color Cosmetics",
                description: "Lipsticks, foundations, eyeshadows with precise formulation specs",
                features: ["Color matching systems", "Texture specifications", "Wear-test protocols"],
              },
              {
                icon: "🧴",
                title: "Skincare Products",
                description: "Serums, moisturizers, cleansers with active ingredient tracking",
                features: ["pH specifications", "Stability testing", "Ingredient compatibility"],
              },
              {
                icon: "🎨",
                title: "Packaging Design",
                description: "Bottles, tubes, compacts with sustainable material options",
                features: ["Material specifications", "Printing guidelines", "Assembly instructions"],
              },
              {
                icon: "🌿",
                title: "Natural & Organic",
                description: "Clean beauty products with organic certification requirements",
                features: ["Organic compliance", "Natural sourcing", "Certification tracking"],
              },
              {
                icon: "✨",
                title: "Luxury Collections",
                description: "Premium beauty lines with high-end packaging and formulations",
                features: ["Premium materials", "Luxury finishes", "Brand consistency"],
              },
              {
                icon: "🧪",
                title: "Regulatory Compliance",
                description: "Global compliance management for beauty product regulations",
                features: ["FDA requirements", "EU regulations", "Safety assessments"],
              },
            ].map((category, index) => (
              <Card key={index} className="glass-card border-none hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-zinc-900">{category.title}</h3>
                  <p className="text-zinc-900/70 mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-zinc-900/80">
                        <CheckCircle className="h-4 w-4 text-taupe" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PLM Process for Beauty Products */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Beauty Product Development Process</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Our AI-powered PLM system guides you through every stage of beauty product development, from concept to
              consumer delight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Concept & Formulation",
                description:
                  "Define product vision, target demographics, and initial formulation requirements with market research integration.",
                icon: <Sparkles className="h-8 w-8 text-taupe" />,
              },
              {
                step: "02",
                title: "Design & Development",
                description:
                  "Create detailed formulation specs, packaging designs, and brand alignment with AI-powered recommendations.",
                icon: <Heart className="h-8 w-8 text-taupe" />,
              },
              {
                step: "03",
                title: "Testing & Compliance",
                description:
                  "Comprehensive safety testing, regulatory compliance checks, and quality assurance protocols.",
                icon: <Shield className="h-8 w-8 text-taupe" />,
              },
              {
                step: "04",
                title: "Production & Launch",
                description:
                  "Manufacturing specifications, quality control measures, and go-to-market strategy execution.",
                icon: <Zap className="h-8 w-8 text-taupe" />,
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <Card className="glass-card border-none h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-taupe/30 mb-4">{step.step}</div>
                    <div className="mb-4 flex justify-center">{step.icon}</div>
                    <h3 className="text-lg font-semibold mb-3 text-zinc-900">{step.title}</h3>
                    <p className="text-zinc-900/70 text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="h-6 w-6 text-taupe" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Why Choose Our Beauty PLM Solution?</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Accelerate beauty innovation with AI-powered solutions designed specifically for cosmetics brands and
              manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="h-10 w-10 text-zinc-900" />,
                title: "Faster Product Launch",
                description:
                  "Reduce time-to-market by 50% with automated formulation tracking and regulatory compliance management.",
              },
              {
                icon: <Shield className="h-10 w-10 text-zinc-900" />,
                title: "Regulatory Excellence",
                description:
                  "Built-in compliance frameworks for FDA, EU, and global beauty regulations ensure market readiness.",
              },
              {
                icon: <Sparkles className="h-10 w-10 text-zinc-900" />,
                title: "Innovation Acceleration",
                description:
                  "AI-driven ingredient recommendations and trend analysis for breakthrough beauty innovations.",
              },
              {
                icon: <Users className="h-10 w-10 text-zinc-900" />,
                title: "Cross-Team Collaboration",
                description:
                  "Seamless collaboration between formulators, designers, and marketing teams in one platform.",
              },
              {
                icon: <Heart className="h-10 w-10 text-zinc-900" />,
                title: "Consumer-Centric Design",
                description:
                  "Market research integration and consumer feedback loops for products that truly resonate.",
              },
              {
                icon: <Zap className="h-10 w-10 text-zinc-900" />,
                title: "Quality Assurance",
                description:
                  "Comprehensive quality control measures ensuring consistent, premium beauty product standards.",
              },
            ].map((benefit, index) => (
              <Card key={index} className="glass-card border-none">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-zinc-900">{benefit.title}</h3>
                  <p className="text-zinc-900/70">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Beauty Brand Success Stories</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              See how beauty brands are achieving market success with our comprehensive PLM solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-taupe/20 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-taupe" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">LuxeBeauty Co.</h3>
                    <p className="text-zinc-900/70">Premium Skincare Brand</p>
                  </div>
                </div>
                <blockquote className="text-zinc-900/80 mb-6 italic">
                  "Genpire's Beauty PLM transformed our product development. We launched our anti-aging serum line 6
                  months ahead of schedule with full regulatory compliance across 15 markets."
                </blockquote>
                <div className="flex items-center gap-4 text-sm text-zinc-900/70">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>6 months faster launch</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>15 market compliance</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-taupe/20 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-taupe" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">GreenGlow Organics</h3>
                    <p className="text-zinc-900/70">Natural Beauty Products</p>
                  </div>
                </div>
                <blockquote className="text-zinc-900/80 mb-6 italic">
                  "The organic compliance tracking and natural ingredient database helped us achieve USDA Organic
                  certification for our entire product line without any regulatory delays."
                </blockquote>
                <div className="flex items-center gap-4 text-sm text-zinc-900/70">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>100% organic certified</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Zero regulatory delays</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Beauty Product Development?</h2>
          <p className="text-xl text-cream/90 mb-8 max-w-2xl mx-auto">
            Join leading beauty brands using AI-powered PLM to create innovative products that captivate consumers
            worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="shadow-lg">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-taupe text-white hover:bg-taupe bg-transparent">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
