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
  Footprints,
  Layers,
  Globe,
  BarChart3,
  Shield,
  Rocket,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Footwear PLM Solutions | AI-Powered Shoe Design & Manufacturing Software",
  description:
    "Transform your footwear business with Genpire's Footwear PLM software. Streamline shoe design, last specifications, and production with AI-powered solutions.",
  keywords:
    "footwear PLM, shoe design software, footwear manufacturing, shoe specifications, athletic footwear development, footwear production management",
  openGraph: {
    title: "Footwear PLM Solutions | AI-Powered Shoe Design & Manufacturing Software",
    description:
      "Transform your footwear business with Genpire's Footwear PLM software. Streamline shoe design, last specifications, and production with AI-powered solutions.",
    url: "https://www.genpire.com/industry/footwear-plm/",
    type: "website",
  },
};

export default function FootwearPLMPage() {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Footwear Design",
      description:
        "Leverage cutting-edge AI technology to explore unlimited footwear design possibilities while maintaining comfort, performance, and manufacturing feasibility.",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Last & Pattern Specifications",
      description:
        "Transform your footwear concepts into professional specifications with detailed last measurements, pattern pieces, and construction methods.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Footwear PLM Management",
      description:
        "Streamlined PLM workflows that keep your entire design and production team synchronized, from concept creation to final quality approval.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Footwear Designer Network",
      description:
        "Connect with our curated network of footwear designers, pattern makers, and specialists who understand your specific footwear category needs.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Manufacturing",
      description:
        "Seamlessly integrate with footwear manufacturers worldwide, from artisan workshops to large-scale athletic shoe production facilities.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Performance & Comfort Standards",
      description:
        "Expert guidance on footwear performance standards, comfort requirements, and quality control processes for different footwear categories.",
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: "Design & Performance Planning",
      description:
        "Deep dive into your footwear vision, target market, performance requirements, and comfort specifications to define your product scope and manufacturing approach.",
    },
    {
      number: "02",
      title: "Technical Specifications",
      description:
        "Generate professional specifications with detailed last measurements, material breakdowns, and construction methods using our advanced PLM system.",
    },
    {
      number: "03",
      title: "Prototype & Testing",
      description:
        "Coordinate prototype creation, fit testing, and performance validation through our comprehensive footwear PLM platform that ensures quality.",
    },
    {
      number: "04",
      title: "Production Launch",
      description:
        "Finalize all specifications, approve fit and performance, and prepare production-ready documentation through our streamlined manufacturing interface.",
    },
  ];

  const benefits = [
    "Reduce Development Time: Streamline footwear development cycles by up to 55%",
    "Improve Fit Accuracy: Precise last specifications and sizing standards",
    "Control Material Costs: Better visibility into leather, textile, and component costs",
    "Quality Assurance: Consistent quality control through standardized construction methods",
    "Performance Optimization: Enhanced comfort and performance through systematic testing",
    "Supplier Management: Enhanced collaboration with specialized footwear manufacturers",
    "Size Range Management: Comprehensive grading and sizing across all categories",
  ];

  const categories = [
    "Athletic and performance footwear",
    "Casual and lifestyle shoes",
    "Formal and dress footwear",
    "Boots and outdoor footwear",
    "Children's and specialty footwear",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-zinc-900 to-zinc-600 py-16 md:py-24 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge className="bg-taupe/20 text-cream border-taupe/30 mb-6">Footwear PLM Revolution</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Step Forward, Design Better</h1>
            <p className="text-xl text-taupe/90 max-w-3xl mx-auto mb-8 text-pretty">
              Transform Your Footwear Business with Intelligent Product Lifecycle Management. Revolutionary footwear PLM
              technology meets exceptional comfort and performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="shadow-lg">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Now
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Complete Footwear PLM Solutions</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              End-to-end footwear PLM software covering every stage from initial sketches to production-ready
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Our Footwear PLM Process</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Structured approach ensuring your footwear designs meet comfort standards, performance requirements, and
              manufacturing specifications.
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

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">Footwear PLM System Benefits</h2>
              <p className="text-xl text-zinc-900/70 mb-8">
                Optimize your footwear business operations with measurable improvements:
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
                <div className="text-6xl mb-4">👟</div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Cross-Category Experience</h3>
                <p className="text-zinc-900/70 mb-6">Expertise across:</p>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-center">
                      <Footprints className="h-4 w-4 text-taupe mr-2" />
                      <span className="text-zinc-900/80 text-sm">{category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-zinc-900 to-zinc-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Footwear Empire Awaits - Time to Step Up</h2>
          <p className="text-xl text-cream/90 mb-8 max-w-3xl mx-auto">
            The footwear industry demands innovation and comfort. While competitors struggle with complex
            specifications, you could be launching footwear collections faster and more comfortably than ever with
            Genpire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="shadow-lg">
              <Zap className="mr-2 h-5 w-5" />
              Transform Your Design Process
            </Button>
            {/* <Button size="lg" variant="outline" className="border-cream text-cream hover:bg-cream/10 bg-transparent">
              <Clock className="mr-2 h-5 w-5" />
              Book a Demo Now
            </Button> */}
          </div>
          <p className="text-cream/70 text-sm mt-6">Your Footwear Revolution Starts in 5 Minutes</p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
