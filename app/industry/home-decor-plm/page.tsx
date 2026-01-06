"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Target,
  Users,
  Clock,
  CheckCircle,
  Palette,
  Globe,
  Shield,
  Rocket,
  TrendingUp,
  Award,
  DollarSign,
  Home,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";

export default function HomeDecorPLMPage() {
  const handleSignUpModal = () => {
    const event = new CustomEvent("openAuthModal", { detail: { mode: "signup" } });
    window.dispatchEvent(event);
  };

  const features = [
    {
      icon: <Home className="h-6 w-6" />,
      title: "Home Decor Tech Pack Development",
      description:
        "Transform your home decor concepts into professional tech packs with detailed specifications, material requirements, and manufacturing guidelines that suppliers can immediately implement.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "PLM for Interior Design",
      description:
        "Specialized interior design PLM solutions that balance aesthetic innovation with commercial viability and market trends in home decoration.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Textile & Fabric Documentation",
      description:
        "Comprehensive textile tech pack development covering fabric specifications, color matching, pattern design, and quality standards with advanced material testing.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Lighting Design PLM Solutions",
      description:
        "Complete lighting design tech pack services covering electrical specifications, fixture design, installation requirements, and safety compliance.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Manufacturing Integration",
      description:
        "Seamless integration with leading home decor manufacturers worldwide, ensuring your designs translate perfectly from concept to finished products.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Advanced PLM Technologies",
      description:
        "Latest PLM for home decor software, 3D visualization capabilities, and virtual staging technologies that reduce development costs and accelerate market entry.",
    },
  ];

  const processSteps = [
    {
      number: "1",
      title: "Discovery and Assessment",
      description:
        "Comprehensive analysis of your current processes, identifying opportunities for improvement and customization requirements for your home decor business.",
    },
    {
      number: "2",
      title: "System Customization",
      description:
        "Tailor the PLM platform to match your specific home decor categories, whether you focus on textiles, lighting, accessories, or complete room solutions.",
    },
    {
      number: "3",
      title: "Team Training and Integration",
      description:
        "Comprehensive training programs ensure your team maximizes the potential of your new home decor PLM system from day one.",
    },
    {
      number: "4",
      title: "Ongoing Optimization",
      description:
        "Continuous support and system refinement to ensure your PLM solution evolves with your business needs and design trends.",
    },
  ];

  const benefits = [
    "Reduced Time-to-Market: 35% faster product development cycles",
    "Quality Improvements: Up to 55% reduction in product defects",
    "Cost Optimization: 18-28% savings on development and manufacturing",
    "Enhanced Communication: Streamlined collaboration with manufacturers",
    "Scalable Solutions: Grow from boutique to enterprise seamlessly",
    "Trend Integration: Built-in trend analysis and forecasting",
    "Sustainable Designs: Eco-friendly material recommendations",
  ];

  const categories = [
    "Textiles & Fabrics - Curtains, upholstery, rugs, decorative fabrics",
    "Lighting solutions - Table lamps, ceiling fixtures, decorative lighting",
    "Wall decor - Art prints, mirrors, wall sculptures, decorative panels",
    "Decorative accessories - Vases, candles, ornaments, seasonal decor",
    "Window treatments - Blinds, shades, shutters, decorative hardware",
  ];

  const successStories = [
    {
      title: "Boutique Brand Success",
      description:
        "Helped a boutique home decor brand streamline their textile production, reducing development time by 50% while maintaining artisanal quality standards.",
      icon: <Rocket className="h-6 w-6" />,
    },
    {
      title: "Retail Chain Transformation",
      description:
        "Implemented comprehensive PLM solution for a major home decor retailer, resulting in 35% faster time-to-market and improved seasonal collections.",
      icon: <Globe className="h-6 w-6" />,
    },
    {
      title: "Sustainable Decor Innovation",
      description:
        "Created specialized PLM system for eco-friendly home decor manufacturer, enabling complete material traceability and sustainability reporting.",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: "Global Design Collaboration",
      description:
        "Deployed cloud-based home decor PLM platform enabling real-time collaboration between design teams and international manufacturing partners.",
      icon: <Zap className="h-6 w-6" />,
    },
  ];

  const advancedFeatures = [
    {
      title: "Material Specifications & Sourcing",
      description:
        "Detailed material requirements, sourcing recommendations, and sustainability considerations integrated into every home decor tech pack.",
      features: [
        "Comprehensive material databases and color matching systems",
        "Sustainable material alternatives and eco-friendly options",
        "Cost analysis and supplier management integration",
        "Quality control checkpoints and testing protocols",
      ],
    },
    {
      title: "3D Visualization & Virtual Staging",
      description:
        "Advanced 3D modeling and virtual staging capabilities for realistic product visualization before physical prototyping.",
    },
    {
      title: "Manufacturing Optimization",
      description:
        "Production-ready documentation with assembly sequences, quality checkpoints, and manufacturing process optimization.",
    },
  ];

  const pricingPackages = [
    {
      name: "Boutique PLM",
      description: "Essential home decor PLM for small design studios",
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      name: "Growth PLM",
      description: "Comprehensive PLM for expanding home decor companies",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "Enterprise PLM",
      description: "Full-featured PLM for major home decor retailers",
      icon: <Award className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-zinc-900 to-zinc-600 py-16 md:py-24 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge className="bg-taupe/20 text-cream border-taupe/30 mb-6">Professional Home Decor PLM Solutions</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">From Design to Living Space</h1>
            <p className="text-xl text-taupe/90 max-w-3xl mx-auto mb-8 text-pretty">
              Transform your home decor ideas into market-ready products with our expert home decor PLM specialists.
              From initial design concepts to production-ready home decor tech packs and manufacturing specifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="shadow-lg" onClick={handleSignUpModal}>
                <Rocket className="mr-2 h-5 w-5" />
                Create with Genpire Today
              </Button>
              {/* <Button size="lg" className="bg-cream text-zinc-900 hover:bg-cream/90 shadow-lg" onClick={handleSignUpModal}>
                <Clock className="mr-2 h-5 w-5" />
                Get Custom Quote in 24 Hours
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Complete PLM for Home Decor Solutions</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              End-to-end PLM for home decor covering every stage from initial design concepts to production-ready
              specifications and market launch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card border-none h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-black/10 p-3 rounded-lg mr-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-zinc-900">{feature.title}</h3>
                  </div>
                  <p className="text-zinc-900/70">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Implementation Process That Works</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Structured approach ensures your home decor PLM meets market needs, manufacturing requirements, and
              business goals across all home decor categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <Card key={index} className="glass-card border-none h-full">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-taupe mb-4">{step.number}</div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-3">{step.title}</h3>
                  <p className="text-zinc-900/70 text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Home Decor PLM Expertise</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-6 text-center">
                <div className="bg-black/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Award-Winning Designers</h3>
                <p className="text-zinc-900/70">
                  Our team includes interior designers with industry recognition and experience at top home decor brands
                  and design consultancies worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6 text-center">
                <div className="bg-black/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Palette className="h-8 w-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Cross-Category Experience</h3>
                <p className="text-zinc-900/70 mb-4">Expertise across:</p>
                <div className="space-y-2 text-sm">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-taupe mr-2" />
                      <span className="text-zinc-900/80">{category}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6 text-center">
                <div className="bg-black/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Latest PLM Technologies</h3>
                <p className="text-zinc-900/70">
                  Advanced PLM for home decor software, 3D visualization capabilities, and virtual staging technologies
                  deliver optimal results while reducing development costs and timelines.
                </p>
                <div className="mt-4">
                  <Button className="bg-zinc-900 text-white hover:bg-gray-800" onClick={handleSignUpModal}>
                    <Rocket className="mr-2 h-4 w-4" />
                    Schedule Your Consultation Today
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Success Stories and Results</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Real results for real home decor businesses using our PLM solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="glass-card border-none">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-black/10 p-3 rounded-lg mr-4">{story.icon}</div>
                    <h3 className="text-lg font-semibold text-zinc-900">{story.title}</h3>
                  </div>
                  <p className="text-zinc-900/70">{story.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">See Our Home Decor PLM in Action</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Watch how our comprehensive PLM solutions transform home decor development from concept to production.
            </p>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/kfJM9zD6P5A?si=J5yUE8IVF9EZJ7Ab"
              title="Home Decor PLM Solutions Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-zinc-900 text-white hover:bg-gray-800" onClick={handleSignUpModal}>
              <Rocket className="mr-2 h-5 w-5" />
              Start Your Home Decor PLM Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
                Why Home Decor Brands Choose Our PLM Solutions
              </h2>
              <p className="text-xl text-zinc-900/70 mb-8">
                Industry expertise that matters with measurable improvements:
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-taupe mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-900/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-navy/5 to-taupe/5 p-8 rounded-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Proven Results</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">35%</div>
                    <div className="text-sm text-zinc-900/70">Faster Time-to-Market</div>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">55%</div>
                    <div className="text-sm text-zinc-900/70">Defect Reduction</div>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">28%</div>
                    <div className="text-sm text-zinc-900/70">Cost Savings</div>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">100%</div>
                    <div className="text-sm text-zinc-900/70">Quality Control</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Advanced Home Decor PLM System Features
            </h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Our comprehensive PLM for home decor software delivers everything your team needs to create, manage, and
              launch successful home decor collections.
            </p>
          </div>

          <div className="space-y-12">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="glass-card border-none">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-zinc-900 mb-4">{feature.title}</h3>
                  <p className="text-zinc-900/70 mb-6">{feature.description}</p>
                  {feature.features && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {feature.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-taupe mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-zinc-900/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-zinc-900 text-white hover:bg-gray-800" onClick={handleSignUpModal}>
              <Zap className="mr-2 h-5 w-5" />
              Experience the Future of Home Decor PLM
            </Button>
          </div>
        </div>
      </section>

      {/* Investment & Timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Investment & Timeline</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-6 w-6 text-taupe mr-3" />
                  <h3 className="text-xl font-bold text-zinc-900">Flexible PLM Packages</h3>
                </div>
                <p className="text-zinc-900/70 mb-6">
                  Choose from our range of home decor PLM software options designed for different company sizes and
                  collection complexities:
                </p>
                <div className="space-y-3">
                  {pricingPackages.map((pkg, index) => (
                    <div key={index} className="flex items-center">
                      <div className="bg-black/10 p-2 rounded mr-3">{pkg.icon}</div>
                      <div>
                        <div className="font-semibold text-zinc-900">{pkg.name}</div>
                        <div className="text-sm text-zinc-900/70">{pkg.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-taupe mr-3" />
                  <h3 className="text-xl font-bold text-zinc-900">Rapid Implementation</h3>
                </div>
                <p className="text-zinc-900/70">
                  Standard home decor PLM projects typically complete within 3-6 weeks, depending on complexity and
                  scope. Rush projects available for urgent seasonal launches.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-taupe mr-3" />
                  <h3 className="text-xl font-bold text-zinc-900">Ongoing Support</h3>
                </div>
                <p className="text-zinc-900/70">
                  Dedicated home decor PLM support ensures your investment continues delivering results with continuous
                  optimization and trend integration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Future in Home Decor PLM Starts Here</h2>
          <p className="text-xl text-cream/90 mb-6 max-w-3xl mx-auto">
            The home decor industry's future belongs to those who embrace intelligent PLM solutions today. Whether
            you're developing textiles, lighting, accessories, or complete room solutions, Genpire's solutions provide
            the foundation for sustainable growth and market leadership.
          </p>
          <p className="text-lg text-cream/80 mb-8 max-w-3xl mx-auto">
            Don't let your competition gain the PLM advantage while you struggle with outdated processes. At Genpire,
            we've helped countless home decor manufacturers achieve remarkable results.
          </p>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-cream mb-4">Transform Your Home Decor Business Today</h3>
            <p className="text-cream/80">
              Discover how Genpire's PLM for home decor solutions can revolutionize your product development process and
              accelerate time-to-market.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Button size="lg" className="bg-cream text-zinc-900 hover:bg-cream/90" onClick={handleSignUpModal}>
              <Sparkles className="mr-2 h-5 w-5" />
              Create with Genpire Today
            </Button>
            <Button size="lg" className="bg-cream text-zinc-900 hover:bg-cream/90" onClick={handleSignUpModal}>
              <Zap className="mr-2 h-5 w-5" />
              Schedule Free Consultation
            </Button> */}
            <Button
              size="lg"
              variant="outline"
              className="border-cream text-cream hover:bg-cream/10 bg-transparent"
              onClick={handleSignUpModal}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create with Genpire Today
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
