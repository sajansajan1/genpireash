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
  ShoppingBag,
  Headphones,
  Package,
  Workflow,
  Cpu,
  ClipboardCheck,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";

export default function AccessoriesPLMClientPage() {
  const handleSignUpModal = () => {
    const event = new CustomEvent("openAuthModal", { detail: { mode: "signup" } });
    window.dispatchEvent(event);
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning-Fast Tech Pack Generation",
      description:
        "Generate professional accessories tech packs in minutes instead of weeks, eliminating delays from traditional back-and-forth with technical designers.",
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Manufacturing-Ready Documentation",
      description:
        "Each tech pack includes detailed specifications, construction notes, and measurements that manufacturers can execute without costly clarifications.",
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "AI-Powered Accuracy",
      description:
        "Advanced AI understands accessory structures, materials, and constraints, ensuring every generated document is technically sound and production-ready.",
    },
    {
      icon: <Workflow className="h-6 w-6" />,
      title: "Streamlined PLM Workflow",
      description:
        "Upload your design, let AI generate complete specs, review & customize, and export professional PDFs—all in a single seamless process.",
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Complete Documentation Package",
      description:
        "Includes technical drawings, bill of materials, grading charts, and quality control checkpoints, giving manufacturers everything they need to deliver.",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Scalable for Every Brand",
      description:
        "Whether you're launching your first collection or managing multiple seasonal lines, the platform scales with your business without added complexity.",
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
        "Generate professional accessories tech packs with detailed specifications, construction methods, and material requirements using our advanced bags and accessories PLM solution.",
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
        "Finalize all specifications, approve samples, and prepare production-ready documentation through our streamlined PLM software accessories interface.",
    },
  ];

  const benefits = [
    "Detailed construction drawings and assembly sequences",
    "Hardware specifications with exact measurements",
    "Material callouts with grade and finish requirements",
    "Size grading charts for multiple product variations",
    "Stitching patterns and thread specifications",
    "Card slot configurations and spacing details",
    "Material callouts with grade and finish requirements",
  ];

  const categories = [
    "3D visualization integrationfor complex geometric designs",
    "Wallets, briefcases, and leather accessories with grain-specific cutting instructions",
    "Phone cases, laptop bags, and electronic accessory specifications with functional requirements",
    "Quality control checkpointsat every production stage",
    "Preciousmetal jewelry, fashion jewelry, and timepiece components with precise manufacturing details.",
  ];

  const successStories = [
    {
      title: "Startup Fashion Success",
      description:
        "60% faster sample development, 90% fewer supplier clarifications, 40% higher first-sample accuracy, 75% reduction in tech pack creation time",
      icon: <Rocket className="h-6 w-6" />,
    },
    {
      title: "Professional Portfolio Management",
      description:
        "Maintain comprehensive design portfolios that showcase your evolution as a Bagdesigner. Track project histories, client preferences, and design performance metrics that inform future creative decisions",
      icon: <Globe className="h-6 w-6" />,
    },
    {
      title: "Advanced Analytics for Strategic Growth",
      description:
        "Understanding which designs resonate with customers and which materials offer optimal profit margins drives sustainable business growth. Our analytics dashboard reveals insights that traditional design processes miss",
    },
    {
      title: "Market Performance Tracking",
      description:
        "Monitor how your Bagdesigns perform across different market segments, identifying trends that inform future collection development and inventory planning strategies",
      icon: <Zap className="h-6 w-6" />,
    },
  ];

  const advancedFeatures = [
    {
      title: "AI-Powered Jewellery Design Tools",
      description:
        "Revolutionary AI jewellery generator technology that transforms creative concepts into detailed designs, reducing manual sketching and accelerating collection development.",
      features: [
        "Instant trend analysis and gemstone/metal recommendations",
        "Automated design variations and motif generation",
        "Smart material and finish suggestions based on style requirements",
        "Intelligent sizing and customization recommendations for perfect fit",
      ],
    },
    {
      title: "Tech Pack BagManagement",
      description:
        "Streamlined Bagtech pack designer tools that ensure every detail is captured and communicated clearly to your manufacturing partners.",
    },
    {
      title: "Professional Support Network",
      description:
        "Access expert guidance from Bagindustry veterans who understand both traditional craftsmanship and modern production technologies, providing support whencomplex challenges arise.",
    },
    {
      title: "Continuous Innovation Pipeline",
      description:
        "Stay ahead of industry trends with features developed in consultation with leading Bagprofessionals, ensuring your design process remains competitive and efficient.",
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
            <Badge className="bg-taupe/20 text-cream border-taupe/30 mb-6">Accessories PLM Revolution</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              From Accessories Designs to Production Ready
            </h1>
            <p className="text-xl text-taupe/90 max-w-3xl mx-auto mb-8 text-pretty">
              Generate professional accessories PLM documentation in minutes with AI-powered precision. From initial
              sketches to manufacturing-ready specifications,{" "}
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Complete Accessories PLM Solutions for Every Design Challenge
            </h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              End-to-end accessories PLMservices covering everyspecification from initial sketches to production-ready
              documentation that manufacturers love{" "}
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Our Accessories PLM Process</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Structured approach ensuring your accessories designs meet market demands, manufacturing requirements, and
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Accessories PLM Expertise</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-6 text-center">
                <div className="bg-black/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Fashion Accessories</h3>
                <p className="text-zinc-900/70">
                  Handbags, belts, scarves, and seasonal accessories with trend-aware specifications.
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
                  <Headphones className="h-8 w-8 text-zinc-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Tech Accessories</h3>
                <p className="text-zinc-900/70">
                  Phone cases, laptop bags, and electronic accessory specifications with functional requirements
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
              See Our Alternative to Traditional Accessories PLM Software
            </h2>
            <p className="text-xl text-cream/90 max-w-3xl mx-auto">
              Discover how Genpire revolutionizes Accessories product lifecycle management with AI-powered innovation
              and streamlined workflows.
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Why Choose Our Accessories PLM Solution?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Lightning-Fast Generation</h3>
                <p className="text-zinc-900/70">
                  What traditionally takes weeks of back-and-forth with technical designers now happens instantly.
                  Upload your concept, and receive comprehensive accessories tech pack documentation in minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Manufacturing-Ready Output</h3>
                <p className="text-zinc-900/70">
                  Every generated tech pack includes detailed specifications that manufacturers can immediately
                  understand and execute, reducing sample iterations and production delays
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">Cost-Effective Solution </h3>
                <p className="text-zinc-900/70">
                  Eliminate expensive freelance technical designers and lengthy development cycles. Generate unlimited
                  accessories tech packs at a fraction of traditional costs
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-3">AI-Powered Accuracy </h3>
                <p className="text-zinc-900/70">
                  Our advanced AI understands accessory construction methods, material properties, and manufacturing
                  constraints to produce technically sound documentation every time.
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
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">Accessories PLM System Benefits</h2>
              <p className="text-xl text-zinc-900/70 mb-8">
                Optimize your Accessories business operations with measurable improvements:
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Accessories PLM Success Stories</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Proven track record helping Accessories brands streamline operations and accelerate growth through
              effective PLM implementation.
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Advanced Accessories PLM System Features
            </h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Our comprehensive PLM Accessories software delivers everything your team needs to create, manage, and
              launch successful Accessories collections.
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your BagEmpire Awaits: Where Creative Genius Meets Commercial Success
          </h2>
          <p className="text-xl text-cream/90 mb-6 max-w-3xl mx-auto">
            The Bagindustry demands faster trend response and personalized products. Traditional PLMmethods can't keep
            pace.
          </p>
          <p className="text-lg text-cream/80 mb-8 max-w-3xl mx-auto">
            Genpire represents next-generation Bagproduct lifecycle management, where AI handles technical complexity
            while you focus on creative excellence.
          </p>
          <p className="text-lg text-cream/80 mb-8 max-w-3xl mx-auto">
            Our BagPLM solution transforms product development, manufacturing relationships, and market responsiveness.
            Join industry leaders who've embraced AI-driven product lifecycle management for competitive advantage.
          </p>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-cream mb-4">Your BagRevolution Starts in 5 Minutes</h3>
            <p className="text-cream/80">Ready to Transform Your BagBusiness Today?</p>
            <p>
              Don't let outdated PLM processes limit your potential. Experience AI-driven Bagtech pack generation and
              discover why leaders choose Genpire. Start your free trial today and create professional Bagline sheets in
              minutes, not weeks.
            </p>
          </div>
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
