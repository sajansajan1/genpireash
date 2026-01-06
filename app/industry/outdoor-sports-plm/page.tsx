import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Target, Trophy, Zap, Shield, Users, Clock, Star, ChevronRight } from "lucide-react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingNavbar } from "@/components/landing-navbar";

export const metadata = {
  title: "Sports Equipment PLM Solutions | AI-Powered Athletic Gear Tech Pack Software",
  description:
    "Transform your sports equipment business with Genpire's Sports PLM software. Streamline athletic gear design, tech packs, and production with AI-powered PLM solutions.",
};

export default function SportsEquipmentPLMPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-zinc-900 to-zinc-600 py-16 md:py-24 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center rounded-full border border-taupe/30 bg-taupe/20 px-4 py-1 text-sm text-cream">
                <Trophy className="mr-1 h-3.5 w-3.5" />
                <span>Performance-Driven PLM Solutions</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Sports Equipment PLM Solutions</h1>
              <p className="text-xl text-taupe/90 leading-relaxed">
                Revolutionize your sports equipment development with AI-powered PLM technology. From concept to
                championship, streamline athletic gear design, testing protocols, and manufacturing with
                precision-engineered solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="outline" className="shadow-lg">
                  Create with Genpire Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-taupe text-taupe hover:bg-taupe hover:text-zinc-900 bg-transparent"
                >
                  View Equipment Examples
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
                          <Trophy className="h-6 w-6 text-taupe" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-cream">Performance Tennis Racket</h3>
                          <p className="text-sm text-cream/70">Professional Grade Equipment</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-cream/70">Material:</span>
                          <p className="text-cream font-medium">Carbon Fiber Composite</p>
                        </div>
                        <div>
                          <span className="text-cream/70">Weight:</span>
                          <p className="text-cream font-medium">295g ± 5g</p>
                        </div>
                        <div>
                          <span className="text-cream/70">String Pattern:</span>
                          <p className="text-cream font-medium">16x19</p>
                        </div>
                        <div>
                          <span className="text-cream/70">Head Size:</span>
                          <p className="text-cream font-medium">100 sq in</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-xs text-cream/70">Tech Pack Status</span>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-xs text-green-400">Manufacturing Ready</span>
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

      {/* Sports Equipment Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Comprehensive Sports Equipment PLM</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              From recreational gear to professional equipment, our PLM solutions cover every aspect of sports equipment
              development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎾",
                title: "Racket Sports",
                description: "Tennis, badminton, squash rackets with precision engineering",
                features: ["String tension specs", "Grip customization", "Balance point optimization"],
              },
              {
                icon: "⚽",
                title: "Ball Sports",
                description: "Footballs, basketballs, soccer balls with performance standards",
                features: ["Pressure specifications", "Material composition", "Durability testing"],
              },
              {
                icon: "🏋️",
                title: "Fitness Equipment",
                description: "Weights, resistance bands, exercise machines",
                features: ["Load capacity specs", "Safety certifications", "Ergonomic design"],
              },
              {
                icon: "🏊",
                title: "Water Sports",
                description: "Swimming gear, diving equipment, water safety products",
                features: ["Waterproof ratings", "Buoyancy specifications", "Material resistance"],
              },
              {
                icon: "🚴",
                title: "Cycling Gear",
                description: "Bikes, helmets, protective gear, accessories",
                features: ["Safety standards", "Aerodynamic testing", "Component integration"],
              },
              {
                icon: "🏃",
                title: "Athletic Accessories",
                description: "Training aids, protective gear, performance monitors",
                features: ["Wearability testing", "Performance metrics", "Comfort analysis"],
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

      {/* PLM Process for Sports Equipment */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Sports Equipment Development Process</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Our AI-powered PLM system guides you through every stage of sports equipment development, from concept to
              championship performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Performance Analysis",
                description:
                  "Define performance requirements, target demographics, and competitive analysis for your sports equipment.",
                icon: <Target className="h-8 w-8 text-taupe" />,
              },
              {
                step: "02",
                title: "Design & Engineering",
                description:
                  "Create detailed technical drawings, material specifications, and performance parameters with AI assistance.",
                icon: <Zap className="h-8 w-8 text-taupe" />,
              },
              {
                step: "03",
                title: "Testing Protocols",
                description:
                  "Establish comprehensive testing procedures for safety, durability, and performance validation.",
                icon: <Shield className="h-8 w-8 text-taupe" />,
              },
              {
                step: "04",
                title: "Manufacturing",
                description:
                  "Generate production-ready specifications with quality control measures and supplier guidelines.",
                icon: <Trophy className="h-8 w-8 text-taupe" />,
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Why Choose Our Sports Equipment PLM?</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Gain competitive advantage with AI-powered solutions designed specifically for sports equipment
              manufacturers and brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="h-10 w-10 text-zinc-900" />,
                title: "Faster Time-to-Market",
                description:
                  "Reduce development cycles by 60% with automated tech pack generation and streamlined approval processes.",
              },
              {
                icon: <Shield className="h-10 w-10 text-zinc-900" />,
                title: "Safety Compliance",
                description:
                  "Built-in safety standards and testing protocols ensure your equipment meets all regulatory requirements.",
              },
              {
                icon: <Target className="h-10 w-10 text-zinc-900" />,
                title: "Performance Optimization",
                description: "AI-driven material selection and design optimization for superior athletic performance.",
              },
              {
                icon: <Users className="h-10 w-10 text-zinc-900" />,
                title: "Team Collaboration",
                description: "Seamless collaboration between designers, engineers, and manufacturers in one platform.",
              },
              {
                icon: <Zap className="h-10 w-10 text-zinc-900" />,
                title: "Innovation Acceleration",
                description:
                  "Rapid prototyping and testing capabilities to bring innovative sports equipment to market faster.",
              },
              {
                icon: <Trophy className="h-10 w-10 text-zinc-900" />,
                title: "Quality Assurance",
                description: "Comprehensive quality control measures ensure championship-level equipment performance.",
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Success Stories</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              See how sports equipment brands are achieving championship results with our PLM solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-taupe/20 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-taupe" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">ProTennis Equipment</h3>
                    <p className="text-zinc-900/70">Professional Tennis Gear</p>
                  </div>
                </div>
                <blockquote className="text-zinc-900/80 mb-6 italic">
                  "Genpire's PLM system helped us develop our championship tennis racket 40% faster. The AI-generated
                  tech packs were so detailed that our manufacturers could start production immediately."
                </blockquote>
                <div className="flex items-center gap-4 text-sm text-zinc-900/70">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>50% faster development</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Zero manufacturing errors</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-taupe/20 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-taupe" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">SafetyFirst Sports</h3>
                    <p className="text-zinc-900/70">Protective Sports Gear</p>
                  </div>
                </div>
                <blockquote className="text-zinc-900/80 mb-6 italic">
                  "The automated safety compliance checks and testing protocols saved us months of regulatory approval
                  time. Our protective gear now meets all international standards."
                </blockquote>
                <div className="flex items-center gap-4 text-sm text-zinc-900/70">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>3 months faster approval</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>100% compliance rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">See Sports Equipment PLM in Action</h2>
            <p className="text-xl text-zinc-900/70 max-w-2xl mx-auto">
              Watch how leading sports equipment brands are transforming their development process with our AI-powered
              PLM solutions.
            </p>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/kfJM9zD6P5A?si=J5yUE8IVF9EZJ7Ab"
              title="Sports Equipment PLM Solutions Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" variant="default">
              Create with Genpire Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Revolutionize Your Sports Equipment Development?
          </h2>
          <p className="text-xl text-cream/90 mb-8 max-w-2xl mx-auto">
            Join leading sports equipment brands using AI-powered PLM to create championship-level products faster and
            more efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="shadow-lg">
              Create with Genpire Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-taupe text-taupe hover:bg-taupe hover:text-zinc-900 bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
