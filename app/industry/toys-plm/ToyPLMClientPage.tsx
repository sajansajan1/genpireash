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
  Baby,
  Layers,
  Globe,
  BarChart3,
  Shield,
  Rocket,
  TrendingUp,
  Award,
  DollarSign,
  Palette,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";

export default function ToysPLMPage() {
  const handleSignUpModal = () => {
    const event = new CustomEvent("openAuthModal", { detail: { mode: "signup" } });
    window.dispatchEvent(event);
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Toy Innovation",
      description:
        "Leverage cutting-edge AI technology to explore unlimited toy design possibilities while maintaining safety standards and educational value.",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Safety-First Specifications",
      description:
        "Transform your toy concepts into professional specifications with detailed safety compliance, material requirements, and age-appropriate guidelines.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Toys PLM Management",
      description:
        "Streamlined PLM workflows that keep your entire design and production team synchronized, from concept creation to safety approval.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Toy Designer Network",
      description:
        "Connect with our curated network of toy designers, child development experts, and safety specialists who understand children's product requirements.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Compliance",
      description:
        "Seamlessly navigate international toy safety standards and regulations across different markets and manufacturing locations.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Safety & Testing Standards",
      description:
        "Expert guidance on toy safety regulations, material testing requirements, and quality control processes for children's product compliance.",
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: "Concept & Safety Planning",
      description:
        "Deep dive into your toy concept, target age group, educational goals, and safety requirements to define your product scope and compliance needs.",
    },
    {
      number: "02",
      title: "Compliant Specifications",
      description:
        "Generate professional specifications with detailed safety compliance, material requirements, and testing protocols using our advanced PLM system.",
    },
    {
      number: "03",
      title: "Prototype & Testing",
      description:
        "Coordinate prototype creation, safety testing, and refinements through our comprehensive toys PLM platform that ensures compliance.",
    },
    {
      number: "04",
      title: "Production & Certification",
      description:
        "Finalize all specifications, complete safety certifications, and prepare production-ready documentation through our compliant manufacturing interface.",
    },
  ];

  const benefits = [
    "Reduce Development Time: Streamline toy development cycles by up to 45% with built-in compliance",
    "Ensure Safety Compliance: Automated safety checks and regulatory guidance",
    "Control Material Costs: Better visibility into safe materials and testing expenses",
    "Quality Assurance: Consistent quality control through age-appropriate standards",
    "Market Responsiveness: Faster adaptation to educational trends and seasonal demands",
    "Supplier Management: Enhanced collaboration with certified toy manufacturers",
    "Risk Mitigation: Comprehensive safety documentation and testing protocols",
  ];

  const categories = [
    "Analytics & Insights",
    "Integration Capabilities",
    "Collaborative Development Tools",
    "Multi-Product Portfolio Management",
  ];

  const successStories = [
    {
      title: "Multi-Product Portfolio Management",
      description:
        "Manage entire toy lines through centralized dashboards, track development progress, and coordinate launches across multiple product categories.",
      icon: <Rocket className="h-6 w-6" />,
    },
    {
      title: "Collaborative Development Tools",
      description:
        "Enable seamless communication between design teams, manufacturers, and quality assurance through integrated review and approval workflows.",
      icon: <Globe className="h-6 w-6" />,
    },
    {
      title: "Integration Capabilities",
      description:
        "Connect with existing CAD software, inventory management systems, and manufacturing platforms for complete toy PLM ecosystem integration",
    },
    {
      title: "Analytics & Insights",
      description:
        "Access detailed reports on development timelines, cost optimization opportunities, and manufacturing efficiency metrics.",
      icon: <Zap className="h-6 w-6" />,
    },
  ];
  const advancedFeatures = [
    {
      title: "AI-Powered Toy Design Tools",
      description: "Dynamic Specification Generation",
      features: [
        "Detailed dimensional drawings and tolerances",
        "Component breakdowns with part numbers",
        "Assembly sequences and manufacturing notes",
        "Quality control checkpoints and testing requirements",
        "Packaging specifications and labeling guidelines",
      ],
    },
    {
      title: "Intelligent Material Recognition",
      description:
        "Our AI analyzes your product concept and automatically suggests optimal materials, considering safety standards, durability requirements, and cost optimization.",
    },
    {
      title: "Automated Compliance Checking",
      description:
        "Built-in knowledge of global toy safety regulations ensures your toy PLM documentation meets CPSIA, EN71, and other international standards from day one.",
    },
    {
      title: "Smart Revision Management",
      description:
        "Track changes automatically, maintain version control, and update all related documentation instantly when modifications occur.",
    },
  ];
  const pricingPackages = [
    {
      name: "Startup PLM",
      description: "Essential fashion PLM system for new brands",
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      name: "Growth PLM",
      description: "Comprehensive apparel PLM for expanding companies",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "Enterprise PLM",
      description: "Full-featured PLM fashion software for established brands",
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
            <Badge className="bg-taupe/20 text-cream border-taupe/30 mb-6">Toys PLM Revolution</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Create Joy, Ensure Safety</h1>
            <p className="text-xl text-taupe/90 max-w-3xl mx-auto mb-8 text-pretty">
              Accelerate Your Toy Empire: Professional Toy PLM Solutions That Scale With Your Business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="shadow-lg"
                onClick={() => {
                  setIsAuthModalOpen(true);
                  // setIsMobileMenuOpen(false);
                }}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Create with Genpire Today
              </Button>
              {/* <Button size="lg" variant="outline" className="border-cream text-cream hover:bg-cream/10 bg-transparent">
                <BarChart3 className="mr-2 h-5 w-5" />
                Get PLM Demo
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Complete Toys PLM Solutions</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              End-to-end toys PLM software covering every stage from initial concepts to safety-compliant specifications
              and market launch.
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Our Toys PLM Process</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Structured approach ensuring your toy designs meet safety standards, educational goals, and manufacturing
              requirements.
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

      {/* expertise */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Toy PLM Expertise</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-6 text-center">
                <div className="bg-black/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Industry-Leading Technology</h3>
                <p className="text-zinc-900/70">
                  Our Toy PLM software incorporates the latest innovations in Toy design, from automated tech pack
                  creation for ornaments to AI-powered toy design generator capabilities.
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
                  <Target className="h-8 w-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Advanced PLM Tools</h3>
                <p className="text-zinc-900/70">
                  State-of-the-art toy PLM system featuring collaborative design tools, real-time communication, and
                  integrated supply chain management.
                </p>
                {/* <div className="mt-4">
                  <Button className="bg-black text-white hover:bg-gray-800" onClick={handleSignUpModal}>
                    <Rocket className="mr-2 h-4 w-4" />
                    Revolutionize your design process today! Get your PLM demo
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Benefits Section */}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Toy Empire Awaits - Time to Inspire Play</h2>
          <p className="text-xl text-cream/90 mb-8 max-w-3xl mx-auto">
            The toy industry demands innovation and safety. While competitors struggle with complex compliance, you
            could be launching toy collections faster and safer than ever with Genpire.
          </p>
          <div className="relative bg-cream/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="aspect-video bg-black/20 rounded-xl overflow-hidden border-2 border-cream/20">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/kfJM9zD6P5A?si=J5yUE8IVF9EZJ7Ab"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Button size="lg" className="bg-cream text-zinc-900 hover:bg-cream/90">
              <Zap className="mr-2 h-5 w-5" />
              Transform Your Design Process
            </Button>
            <Button size="lg" variant="outline" className="border-cream text-cream hover:bg-cream/10 bg-transparent">
              <Clock className="mr-2 h-5 w-5" />
              Book a Demo Now
            </Button> */}
          </div>
          {/* <p className="text-cream/70 text-sm mt-6">Your Toy Revolution Starts in 5 Minutes</p> */}
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Choose Our Toy PLM Solution?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Lightning-Fast Turnaround</h3>
                <p className="text-zinc-900/70">
                  Generate complete toy tech packs in under 10 minutes – faster than traditional methods by 99%.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Unmatched Accuracy</h3>
                <p className="text-zinc-900/70">
                  AI-powered precision ensures technical specifications meet manufacturing requirements and safety
                  standards every time.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Cost-Effective Scaling</h3>
                <p className="text-zinc-900/70">
                  Eliminate expensive consultants and reduce internal resource allocation while maintaining
                  professional-grade documentation quality
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Global Compliance Ready</h3>
                <p className="text-zinc-900/70">
                  Built-in knowledge of international toy safety regulations ensures your products meet market
                  requirements worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Breakthrough Plush Collection</h3>
                <p className="text-zinc-900/70">
                  A startup toy company used our plush toys tech pack system to launch a sustainable stuffed animal line
                  that became the fastest-selling eco-friendly toy collection of the year, reducing development time by
                  75%
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Award-Winning Educational Games</h3>
                <p className="text-zinc-900/70">
                  An innovative games tech pack helped transform a simple learning concept into a multiple award-winning
                  educational board game series now sold in over 30 countries.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">Toys PLM System Benefits</h2>
              <p className="text-xl text-zinc-900/70 mb-8">
                Optimize your toy business operations with measurable improvements:
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
                <div className="text-6xl mb-4">🧸</div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Measurable Impact</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">75%</div>
                    <div className="text-sm text-zinc-900/70">Reduce Development Time</div>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">100%</div>
                    <div className="text-sm text-zinc-900/70">Award Winning Success</div>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-zinc-900">120%</div>
                    <div className="text-sm text-zinc-900/70">Revenue Growth in One Year</div>
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

      {/* <section className="py-16 bg-white">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">Jewelry PLM System Benefits</h2>
                  <p className="text-xl text-zinc-900/70 mb-8">
                    Optimize your jewelry business operations with measurable improvements:
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
                    <div className="text-6xl mb-4">📈</div>
                    <h3 className="text-2xl font-bold text-zinc-900 mb-4">Measurable Impact</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-zinc-900">50%</div>
                        <div className="text-sm text-zinc-900/70">Faster Development</div>
                      </div>
                      <div className="bg-white/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-zinc-900">40%</div>
                        <div className="text-sm text-zinc-900/70">Reduced Time-to-Market</div>
                      </div>
                      <div className="bg-white/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-zinc-900">60%</div>
                        <div className="text-sm text-zinc-900/70">Better Communication</div>
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
                     */}

      <section className="py-16 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Toy PLM Success Stories</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Proven track record helping fashion brands streamline operations and accelerate growth through effective
              PLM implementation.
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

      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Advanced Toy PLM System Features</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Our comprehensive PLM toy software delivers everything your team needs to create, manage, and launch
              successful toy collections.
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

          {/* <div className="text-center mt-12">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800" onClick={handleSignUpModal}>
                  <Zap className="mr-2 h-5 w-5" />
                  Transform your design process - book a demo now!
                </Button>
              </div> */}
        </div>
      </section>

      {/* investment and timeline */}

      <section className="py-16 bg-cream">
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
                  Choose from our range of toy PLM software options designed for different company sizes and collection
                  complexities:
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
                  Most clients see their toy PLM solution operational within 2-4 weeks, with full team training and
                  custom workflow setup included.
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
                  Dedicated toy developer support ensures your PLM software toy investment continues delivering results
                  season after season.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your Toy Empire Awaits: Where Creative Genius Meets Commercial Success
          </h2>
          <p className="text-xl text-cream/90 mb-6 max-w-3xl mx-auto">
            The toy industry moves fast, and manual tech pack creation holds you back. While competitors struggle with
            weeks-long documentation processes, smart manufacturers use Genpire's AI-powered toy PLM platform to
            generate professional tech packs in minutes.{" "}
          </p>
          <p className="text-lg text-cream/80 mb-8 max-w-3xl mx-auto">
            Your breakthrough toy products deserve manufacturing-ready specifications that ensure quality, compliance,
            and market success.{" "}
          </p>
          {/* <p className="text-lg text-cream/80 mb-8 max-w-3xl mx-auto"> */}
          {/* Don't let outdated processes delay your next launch or compromise your vision. Join industry leaders who've discovered the competitive advantage of instant, professional toy tech pack generation.                  </p> */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-cream mb-4">Your Toy Revolution Starts in 5 Minutes</h3>
            <p className="text-cream/80">Ready to Transform Your Toy Business Today?</p>
            <p>
              Don't let outdated processes delay your next launch or compromise your vision. Join industry leaders
              who've discovered the competitive advantage of instant, professional toy tech pack generation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="shadow-lg"
              onClick={() => {
                setIsAuthModalOpen(true);
              }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create with Genpire Today
            </Button>
            {/* <Button size="lg" className="bg-cream text-zinc-900 hover:bg-cream/90" onClick={handleSignUpModal}>
                      <Zap className="mr-2 h-5 w-5" />
                      Transform Your Design Process
                    </Button> */}
            {/* <Button
                      size="lg"
                      className="bg-cream text-zinc-900 hover:bg-cream/90"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        // setIsMobileMenuOpen(false);
                      }}
                    >
                      <Zap className="mr-2 h-5 w-5" />
                      Transform Your Design Process
                    </Button> */}
            {/* <Button
                      size="lg"
                      variant="outline"
                      className="border-cream text-cream hover:bg-cream/10 bg-transparent"
                      onClick={handleSignUpModal}
                    >
                      <Clock className="mr-2 h-5 w-5" />
                      Book a Demo Now
                    </Button> */}
          </div>
        </div>
      </section>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Get Started with Genpire"
        description="Sign in or create an account to generate your tech pack"
        defaultTab="signup"
      />
      <LandingFooter />
    </div>
  );
}
