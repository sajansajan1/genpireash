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
  Home,
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
  title: "Home Goods PLM Solutions | AI-Powered Home Decor & Household Design Software",
  description:
    "Transform your home goods business with Genpire's Home Goods PLM software. Streamline home decor design, household product specs, and production with AI-powered solutions.",
  keywords:
    "home goods PLM, home decor design software, household product manufacturing, home goods specifications, interior design tech pack, home products production management",
  openGraph: {
    title: "Home Goods PLM Solutions | AI-Powered Home Decor & Household Design Software",
    description:
      "Transform your home goods business with Genpire's Home Goods PLM software. Streamline home decor design, household product specs, and production with AI-powered solutions.",
    url: "https://www.genpire.com/industry/home-goods-plm/",
    type: "website",
  },
};

export default function HomeGoodsPLMPage() {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Home Design",
      description:
        "Leverage cutting-edge AI technology to explore unlimited home goods design possibilities while maintaining functionality and aesthetic appeal.",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Product Specifications",
      description:
        "Transform your home goods concepts into professional specifications with detailed material lists, dimensions, and manufacturing instructions.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Home Goods PLM Management",
      description:
        "Streamlined PLM workflows that keep your entire design and production team synchronized, from concept creation to final quality approval.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Designer Network",
      description:
        "Connect with our curated network of interior designers, home goods specialists, and craftspeople who understand your specific market needs.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Manufacturing",
      description:
        "Seamlessly integrate with home goods manufacturers worldwide, from artisan workshops to large-scale production facilities.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Safety & Compliance",
      description:
        "Expert guidance on home goods safety standards, material compliance, and quality control processes for international market requirements.",
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: "Design Conceptualization",
      description:
        "Deep dive into your home goods vision, target market, style preferences, and functional requirements to define your product scope and manufacturing approach.",
    },
    {
      number: "02",
      title: "Technical Documentation",
      description:
        "Generate professional specifications with detailed material lists, dimensional drawings, and assembly instructions using our advanced PLM system.",
    },
    {
      number: "03",
      title: "Prototype Development",
      description:
        "Coordinate prototype creation, testing, and refinements through our comprehensive home goods PLM platform that keeps all stakeholders aligned.",
    },
    {
      number: "04",
      title: "Production Launch",
      description:
        "Finalize all specifications, approve prototypes, and prepare production-ready documentation through our streamlined manufacturing interface.",
    },
  ];

  const benefits = [
    "Reduce Development Time: Streamline home goods development cycles by up to 50%",
    "Improve Manufacturing Communication: Clear specifications eliminate production confusion",
    "Control Material Costs: Better visibility into fabric, wood, metal, and hardware costs",
    "Quality Assurance: Consistent quality control through standardized processes",
    "Market Responsiveness: Faster adaptation to interior design trends and seasonal demands",
    "Supplier Management: Enhanced collaboration with specialized home goods manufacturers",
    "Sustainability Focus: Optimize material usage and support eco-friendly manufacturing",
  ];

  const categories = [
    "Living room furniture and decor accessories",
    "Kitchen and dining essentials",
    "Bedroom and bathroom accessories",
    "Lighting fixtures and electrical items",
    "Storage solutions and organizational products",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-zinc-900 to-zinc-600 py-16 md:py-24 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <Badge className="bg-taupe/20 text-cream border-taupe/30 mb-6">Home Goods PLM Revolution</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Design Homes, Create Comfort</h1>
            <p className="text-xl text-taupe/90 max-w-3xl mx-auto mb-8 text-pretty">
              Transform Your Home Goods Business with Intelligent Product Lifecycle Management. Revolutionary home goods
              PLM technology meets exceptional design innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cream text-zinc-900 hover:bg-cream/90 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Complete Home Goods PLM Solutions</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              End-to-end home goods PLM software covering every stage from initial concepts to production-ready
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
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Our Home Goods PLM Process</h2>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Structured approach ensuring your home goods designs meet market demands, manufacturing requirements, and
              quality standards.
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
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">Home Goods PLM System Benefits</h2>
              <p className="text-xl text-zinc-900/70 mb-8">
                Optimize your home goods business operations with measurable improvements:
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
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Cross-Category Experience</h3>
                <p className="text-zinc-900/70 mb-6">Expertise across:</p>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-center">
                      <Home className="h-4 w-4 text-taupe mr-2" />
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your Home Goods Empire Awaits - Time to Transform Spaces
          </h2>
          <p className="text-xl text-cream/90 mb-8 max-w-3xl mx-auto">
            The home goods market rewards innovation and functionality. While competitors struggle with outdated
            processes, you could be launching home goods collections faster and more profitably than ever with Genpire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-cream text-zinc-900 hover:bg-cream/90">
              <Zap className="mr-2 h-5 w-5" />
              Transform Your Design Process
            </Button>
            {/* <Button size="lg" variant="outline" className="border-cream text-cream hover:bg-cream/10 bg-transparent">
              <Clock className="mr-2 h-5 w-5" />
              Book a Demo Now
            </Button> */}
          </div>
          <p className="text-cream/70 text-sm mt-6">Your Home Goods Revolution Starts in 5 Minutes</p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
