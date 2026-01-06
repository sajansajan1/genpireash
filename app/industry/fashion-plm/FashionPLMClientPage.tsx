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
  Layers,
  Globe,
  Shield,
  Rocket,
  TrendingUp,
  Award,
  DollarSign,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";

export default function FashionPLMClientPage() {
  const handleSignUpModal = () => {
    const event = new CustomEvent("openAuthModal", { detail: { mode: "signup" } });
    window.dispatchEvent(event);
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const features = [
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Fashion Tech Pack Development",
      description:
        "Transform your creative vision into professional fashion tech packs with detailed specifications, measurements, and construction details that manufacturers love to work with.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Apparel PLM Management",
      description:
        "Streamlined PLM fashion industry workflows that keep your entire design team synchronized, from concept creation to final production approval.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Fashion Product Developer Support",
      description:
        "Expert guidance through every phase of product development with our fashion product developer specialists who understand both creative vision and technical requirements.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "PLM Software Fashion Integration",
      description:
        "Seamlessly integrate our PLM fashion software with your existing design tools and manufacturing partners for maximum efficiency and collaboration.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Fashion Designer Freelancer Network",
      description:
        "Connect with our curated network of fashion designer freelancers and fashion tech pack designers who specialize in your specific product categories.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Design Innovation",
      description:
        "Leverage cutting-edge AI clothing generator technology and apparel design software to explore unlimited creative possibilities while maintaining technical precision.",
    },
  ];

  const processSteps = [
    {
      number: "1",
      title: "Creative Discovery",
      description:
        "Deep dive into your brand vision, target market, seasonal themes, and technical requirements to define your collection scope and PLM fashion system needs.",
    },
    {
      number: "2",
      title: "Tech Pack Creation",
      description:
        "Generate professional fashion tech packs with detailed specifications, construction methods, and material requirements using our advanced fashion PLM solution.",
    },
    {
      number: "3",
      title: "Development Management",
      description:
        "Coordinate sample development, fitting sessions, and revisions through our comprehensive apparel PLM platform that keeps everyone aligned.",
    },
    {
      number: "4",
      title: "Production Preparation",
      description:
        "Finalize all specifications, approve samples, and prepare production-ready documentation through our streamlined PLM software fashion interface.",
    },
  ];

  const benefits = [
    "Reduce Development Time: Streamline product development cycles by up to 50%",
    "Improve Communication: Eliminate miscommunication between design and production teams",
    "Control Costs: Better visibility into material costs and production expenses",
    "Quality Assurance: Consistent quality control through standardized processes",
    "Market Responsiveness: Faster reaction to trend changes and consumer demands",
    "Supplier Management: Enhanced collaboration with manufacturing partners globally",
    "Data-Driven Decisions: Analytics and reporting for informed business choices",
  ];

  const categories = [
    "Women's ready-to-wear and luxury fashion",
    "Men's casual and formal apparel lines",
    "Children's clothing and specialty items",
    "Accessories, footwear, and leather goods",
    "Sustainable and technical performance wear",
  ];

  const successStories = [
    {
      title: "Startup Fashion Success",
      description:
        "Implemented a comprehensive startup fashion tech pack system that reduced sample development time by 60% and improved supplier communication efficiency.",
      icon: <Rocket className="h-6 w-6" />,
    },
    {
      title: "Enterprise PLM Transformation",
      description:
        "Deployed enterprise-grade fashion PLM software that streamlined global operations across 12 production facilities and reduced time-to-market by 40%.",
      icon: <Globe className="h-6 w-6" />,
    },
    {
      title: "Eco-Friendly PLM Solution",
      description:
        "Created a specialized apparel PLM system focused on sustainable material tracking and ethical supplier management, supporting the brand's transparency goals.",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: "Digital-First PLM Approach",
      description:
        "Implemented a cloud-based PLM fashion system that enabled rapid product iteration and real-time collaboration with overseas manufacturing partners.",
      icon: <Zap className="h-6 w-6" />,
    },
  ];

  const advancedFeatures = [
    {
      title: "AI-Powered Design Tools",
      description:
        "Revolutionary AI clothing generator technology that transforms concepts into detailed designs, saving hours of manual sketching and ideation.",
      features: [
        "Instant trend analysis and market research integration",
        "Automated colorway generation and seasonal palette creation",
        "Smart fabric suggestions based on design requirements",
        "Intelligent sizing and fit recommendations",
      ],
    },
    {
      title: "Tech Pack Fashion Management",
      description:
        "Streamlined fashion tech pack designer tools that ensure every detail is captured and communicated clearly to your manufacturing partners.",
    },
    {
      title: "Collaborative Design Platform",
      description:
        "Enable your fashion designer freelancer network and in-house teams to collaborate seamlessly with real-time updates and version control.",
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
            <Badge className="bg-taupe/20 text-cream border-taupe/30 mb-6">Fashion PLM Revolution</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Design Faster, Launch Smarter</h1>
            <p className="text-xl text-taupe/90 max-w-3xl mx-auto mb-8 text-pretty">
              Transform Your Fashion Business with Intelligent Product Lifecycle Management. Revolutionary fashion PLM
              technology meets creative brilliance. Whether you are a startup fashion brand or an established apparel
              company, our comprehensive fashion PLM system transforms how you design, develop, and deliver stunning
              collections to market.
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
              {/* <Button
                size="lg"
                className="bg-cream text-zinc-900 hover:bg-cream/90 shadow-lg"
                onClick={() => {
                  setIsAuthModalOpen(true);
                  // setIsMobileMenuOpen(false);
                }}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Revolutionize your fashion game! Get started now
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Complete Fashion PLM Solutions</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              End-to-end fashion PLM software covering every stage from initial sketches to production-ready apparel
              tech packs and market launch.
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Our Fashion PLM Process</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Structured approach ensuring your apparel designs meet market demands, manufacturing requirements, and
              brand standards.
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

      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Fashion PLM Expertise</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-6 text-center">
                <div className="bg-black/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Industry-Leading Technology</h3>
                <p className="text-zinc-900/70">
                  Our fashion PLM software incorporates the latest innovations in apparel design software, from tech
                  pack fashion automation to AI clothing generator capabilities.
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
                  State-of-the-art fashion PLM system featuring collaborative design tools, real-time communication, and
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

      <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See Our Alternative to Traditional Fashion PLM Software
            </h2>
            <p className="text-xl text-cream/90 max-w-3xl mx-auto">
              Discover how Genpire revolutionizes fashion product lifecycle management with AI-powered innovation and
              streamlined workflows.
            </p>
          </div>

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
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Choose Our Fashion PLM Solution?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Industry-Specific Expertise</h3>
                <p className="text-zinc-900/70">
                  Deep understanding of fashion industry challenges and requirements. Our solutions address real-world
                  problems faced by apparel brands daily.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Scalable Technology Platform</h3>
                <p className="text-zinc-900/70">
                  Fashion PLM solutions that grow with your business, from startup to enterprise scale. Flexible pricing
                  and feature sets accommodate various business sizes.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Comprehensive Support Network</h3>
                <p className="text-zinc-900/70">
                  Dedicated support team including fashion product developers, tech pack designers, and PLM specialists
                  available throughout your journey.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Integration Capabilities</h3>
                <p className="text-zinc-900/70">
                  Seamless integration with existing business systems including ERP, inventory management, and
                  e-commerce platforms, for unified operations.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">AI-Powered Innovation</h3>
                <p className="text-zinc-900/70">
                  Leverage artificial intelligence for design automation, trend prediction, and supply chain
                  optimization to stay ahead of market demands.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Proven Results</h3>
                <p className="text-zinc-900/70">
                  Track record of helping fashion brands streamline operations and accelerate growth through effective
                  PLM implementation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">Fashion PLM System Benefits</h2>
              <p className="text-xl text-zinc-900/70 mb-8">
                Optimize your fashion business operations with measurable improvements:
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

      <section className="py-16 bg-cream">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Fashion PLM Success Stories</h2>
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Advanced Fashion PLM System Features</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Our comprehensive PLM fashion software delivers everything your team needs to create, manage, and launch
              successful fashion collections.
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
              Transform your design process - book a demo now!
            </Button>
          </div>
        </div>
      </section>

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
                  Choose from our range of fashion PLM software options designed for different company sizes and
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
                  Most clients see their fashion PLM solution operational within 2-4 weeks, with full team training and
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
                  Dedicated fashion product developer support ensures your PLM software fashion investment continues
                  delivering results season after season.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Fashion Empire Awaits - Time to Rule the Runway</h2>
          <p className="text-xl text-cream/90 mb-6 max-w-3xl mx-auto">
            The fashion world doesn't wait, and neither should you. While competitors struggle with outdated processes,
            you could be launching collections faster and more profitably than ever with Genpire.
          </p>
          <p className="text-lg text-cream/80 mb-8 max-w-3xl mx-auto">
            Our fashion PLM software isn't just another tool – it's your secret weapon for dominating the apparel
            industry. Hundreds of successful brands trust Genpire's cutting-edge PLM technology to fuel their
            unstoppable creativity.
          </p>
          <p className="text-lg text-cream/80 mb-8 max-w-3xl mx-auto">
            The question isn't whether you need a fashion PLM solution – it's whether you're ready to partner with
            Genpire to stop playing catch-up and start setting the pace.
          </p>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-cream mb-4">Your Fashion Revolution Starts in 5 Minutes</h3>
            <p className="text-cream/80">
              Ready to leave slow fashion behind forever? Your breakthrough collection with Genpire is just one click
              away.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-cream text-zinc-900 hover:bg-cream/90"
              onClick={() => {
                setIsAuthModalOpen(true);
                // setIsMobileMenuOpen(false);
              }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create with Genpire Today
            </Button>
            {/* <Button size="lg" className="bg-cream text-zinc-900 hover:bg-cream/90" onClick={handleSignUpModal}>
              <Zap className="mr-2 h-5 w-5" />
              Transform Your Design Process
            </Button> */}
            <Button
              size="lg"
              className="bg-cream text-zinc-900 hover:bg-cream/90"
              onClick={() => {
                setIsAuthModalOpen(true);
                // setIsMobileMenuOpen(false);
              }}
            >
              <Zap className="mr-2 h-5 w-5" />
              Transform Your Design Process
            </Button>
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
