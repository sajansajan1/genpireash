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
  Cpu,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";

export default function ElectronicsPLMPage() {
  const handleSignUpModal = () => {
    const event = new CustomEvent("openAuthModal", { detail: { mode: "signup" } });
    window.dispatchEvent(event);
  };

  const features = [
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Electronics Tech Pack Development",
      description:
        "Transform your electronic concepts into professional tech packs with detailed circuit specifications, component lists, and manufacturing guidelines that suppliers can immediately implement.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "PLM for Consumer Electronics",
      description:
        "Specialized consumer electronics PLM solutions that balance cutting-edge innovation with market viability and regulatory compliance requirements.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "PCB Design & Documentation",
      description:
        "Comprehensive PCB tech pack development covering circuit design, component placement, testing protocols, and quality assurance with advanced CAD modeling.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "IoT Device PLM Solutions",
      description:
        "Complete IoT device tech pack services covering connectivity protocols, sensor integration, power management, and cloud service specifications.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Manufacturing Integration",
      description:
        "Seamless integration with leading electronics manufacturers worldwide, ensuring your designs translate perfectly from prototype to mass production.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Advanced PLM Technologies",
      description:
        "Latest PLM for electronics software, 3D modeling capabilities, and virtual testing technologies that reduce development costs and accelerate time-to-market.",
    },
  ];

  const processSteps = [
    {
      number: "1",
      title: "Discovery and Assessment",
      description:
        "Comprehensive analysis of your current processes, identifying opportunities for improvement and customization requirements for your electronics business.",
    },
    {
      number: "2",
      title: "System Customization",
      description:
        "Tailor the PLM platform to match your specific electronics categories, whether you focus on consumer devices, industrial equipment, or IoT solutions.",
    },
    {
      number: "3",
      title: "Team Training and Integration",
      description:
        "Comprehensive training programs ensure your team maximizes the potential of your new electronics PLM system from day one.",
    },
    {
      number: "4",
      title: "Ongoing Optimization",
      description:
        "Continuous support and system refinement to ensure your PLM solution evolves with your business needs and technology advances.",
    },
  ];

  const benefits = [
    "Reduced Time-to-Market: 45% faster product development cycles",
    "Quality Improvements: Up to 70% reduction in product defects",
    "Cost Optimization: 20-30% savings on development and manufacturing",
    "Enhanced Communication: Streamlined collaboration with manufacturers",
    "Scalable Solutions: Grow from startup to enterprise seamlessly",
    "Compliance Assurance: Built-in regulatory compliance protocols",
    "Future-Proof Designs: Scalable manufacturing recommendations",
  ];

  const categories = [
    "Consumer electronics - Smartphones, tablets, wearables, smart home devices",
    "Computing devices - Laptops, desktops, servers, networking equipment",
    "IoT solutions - Sensors, connected devices, industrial IoT systems",
    "Audio/Visual equipment - Headphones, speakers, displays, cameras",
    "Industrial electronics - Control systems, automation equipment, measurement devices",
  ];

  const successStories = [
    {
      title: "Startup Success Story",
      description:
        "Helped a tech startup launch their first IoT device, reducing development time by 60% while ensuring regulatory compliance across multiple markets.",
      icon: <Rocket className="h-6 w-6" />,
    },
    {
      title: "Enterprise Transformation",
      description:
        "Implemented comprehensive PLM solution for a major electronics manufacturer, resulting in 45% faster time-to-market and improved quality control.",
      icon: <Globe className="h-6 w-6" />,
    },
    {
      title: "Smart Device Innovation",
      description:
        "Created specialized PLM system for smart home device manufacturer, enabling seamless integration with cloud services and mobile apps.",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: "Global Manufacturing",
      description:
        "Deployed cloud-based electronics PLM platform enabling real-time collaboration between design teams and overseas manufacturing partners.",
      icon: <Zap className="h-6 w-6" />,
    },
  ];

  const advancedFeatures = [
    {
      title: "Component Specifications & Sourcing",
      description:
        "Detailed component requirements, sourcing recommendations, and supply chain considerations integrated into every electronics tech pack.",
      features: [
        "Comprehensive component databases and specifications",
        "Alternative component recommendations and cost analysis",
        "Supply chain risk assessment and supplier management",
        "Quality control checkpoints and testing protocols",
      ],
    },
    {
      title: "Circuit Design & Simulation",
      description:
        "Advanced circuit modeling and simulation capabilities for electrical performance validation before physical prototyping.",
    },
    {
      title: "Manufacturing Optimization",
      description:
        "Production-ready documentation with assembly sequences, quality checkpoints, and manufacturing process optimization.",
    },
  ];

  const pricingPackages = [
    {
      name: "Startup PLM",
      description: "Essential electronics PLM for emerging tech companies",
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      name: "Growth PLM",
      description: "Comprehensive PLM for expanding electronics companies",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "Enterprise PLM",
      description: "Full-featured PLM for major electronics manufacturers",
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
            <Badge className="bg-taupe/20 text-cream border-taupe/30 mb-6">
              Professional Electronics PLM Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">From Circuit to Market</h1>
            <p className="text-xl text-taupe/90 max-w-3xl mx-auto mb-8 text-pretty">
              Transform your electronics ideas into market-ready products with our expert electronics PLM specialists.
              From initial circuit designs to production-ready electronics tech packs and manufacturing specifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-cream text-zinc-900 hover:bg-cream/90 shadow-lg"
                onClick={handleSignUpModal}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Create with Genpire Today
              </Button>
              <Button
                size="lg"
                className="bg-cream text-zinc-900 hover:bg-cream/90 shadow-lg"
                onClick={handleSignUpModal}
              >
                <Clock className="mr-2 h-5 w-5" />
                Get Custom Quote in 24 Hours
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Complete PLM for Electronics Solutions
            </h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              End-to-end PLM for electronics covering every stage from initial circuit designs to production-ready
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
              Structured approach ensures your electronics PLM meets market needs, manufacturing requirements, and
              business goals across all electronics categories.
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Electronics PLM Expertise</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-6 text-center">
                <div className="bg-black/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Award-Winning Engineers</h3>
                <p className="text-zinc-900/70">
                  Our team includes electronics engineers with industry recognition and experience at top technology
                  companies and electronics design consultancies.
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
                  Advanced PLM for electronics software, circuit simulation capabilities, and virtual testing
                  technologies deliver optimal results while reducing development costs and timelines.
                </p>
                <div className="mt-4">
                  <Button className="bg-black text-white hover:bg-gray-800" onClick={handleSignUpModal}>
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
              Real results for real electronics businesses using our PLM solutions.
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">See Our Electronics PLM in Action</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Watch how our comprehensive PLM solutions transform electronics development from concept to production.
            </p>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/kfJM9zD6P5A?si=J5yUE8IVF9EZJ7Ab"
              title="Electronics PLM Solutions Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800" onClick={handleSignUpModal}>
              <Rocket className="mr-2 h-5 w-5" />
              Start Your Electronics PLM Journey
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
                Why Electronics Brands Choose Our PLM Solutions
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
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Proven Results</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">45%</div>
                    <div className="text-sm text-zinc-900/70">Faster Time-to-Market</div>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">70%</div>
                    <div className="text-sm text-zinc-900/70">Defect Reduction</div>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">30%</div>
                    <div className="text-sm text-zinc-900/70">Cost Savings</div>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">100%</div>
                    <div className="text-sm text-zinc-900/70">Compliance</div>
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
              Advanced Electronics PLM System Features
            </h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Our comprehensive PLM for electronics software delivers everything your team needs to create, manage, and
              launch successful electronics products.
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
              Experience the Future of Electronics PLM
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
                  Choose from our range of electronics PLM software options designed for different company sizes and
                  product complexities:
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
                  Standard electronics PLM projects typically complete within 6-10 weeks, depending on complexity and
                  scope. Rush projects available for urgent market opportunities.
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
                  Dedicated electronics PLM support ensures your investment continues delivering results with continuous
                  optimization and system refinement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Future in Electronics PLM Starts Here</h2>
          <p className="text-xl text-cream/90 mb-6 max-w-3xl mx-auto">
            The electronics industry's future belongs to those who embrace intelligent PLM solutions today. Whether
            you're developing consumer electronics, IoT devices, or industrial equipment, Genpire's solutions provide
            the foundation for sustainable growth and market leadership.
          </p>
          <p className="text-lg text-cream/80 mb-8 max-w-3xl mx-auto">
            Don't let your competition gain the PLM advantage while you struggle with outdated processes. At Genpire,
            we've helped countless electronics manufacturers achieve remarkable results.
          </p>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-cream mb-4">Transform Your Electronics Business Today</h3>
            <p className="text-cream/80">
              Discover how Genpire's PLM for electronics solutions can revolutionize your product development process
              and accelerate time-to-market.
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
              <Clock className="mr-2 h-5 w-5" />
              Create with Genpire today
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
