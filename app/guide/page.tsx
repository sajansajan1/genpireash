"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Zap,
  Users,
  Download,
  Edit3,
  Clock,
  HelpCircle,
  Sparkles,
  Factory,
  Package,
  Truck,
  Search,
  FileText,
  MessageSquare,
  ShoppingCart,
  ShieldCheck,
  Link,
  Shirt,
  Footprints,
  ShoppingBag,
  Armchair,
  Heart,
  Gem,
  PawPrint,
  Home,
  Target,
  Droplets,
} from "lucide-react";

export default function AITechPackGuide() {
  const router = useRouter();

  const mustHaveTechPackCategories = [
    { icon: Shirt, text: "Apparel (shirts, pants, dresses, etc.)" },
    { icon: Footprints, text: "Footwear (sandals, sneakers)" },
    { icon: ShoppingBag, text: "Bags & Accessories (bags, belts, hats)" },
    { icon: Armchair, text: "Furniture/Upholstery" },
    { icon: Heart, text: "Toys & Plushies" },
    { icon: Gem, text: "Jewelry (custom)" },
  ];

  const recommendedTechPackCategories = [
    { icon: PawPrint, text: "Pet Products (harnesses, beds)" },
    { icon: Home, text: "Home Textiles" },
    { icon: Package, text: "High-end Packaging" },
    { icon: Target, text: "Custom Accessories" },
  ];

  const visualGuidelinesSufficient = [
    { icon: Droplets, text: "Wellness & Beauty (bottles, packaging)" },
    { icon: Home, text: "Simple Home Goods (pillows, organizers)" },
    { icon: Shirt, text: "Custom Merch (basic items)" },
  ];

  const examplePrompts = [
    {
      input: "A silicone bib with crumb catcher for toddlers",
      output: "Full product spec with material recommendation, size options, and 2D sketch",
    },
    {
      input: "A fitness resistance band set with logo bag",
      output: "Breakdown of SKUs, materials, dimensions, and packaging",
    },
    {
      input: "A plush elephant for newborns",
      output: "Safety instructions, pattern references, embroidery notes",
    },
    {
      input: "A transparent tote bag for beach essentials",
      output: "BOM list, zipper placement, size grading options",
    },
    {
      input: "An organic cotton bathrobe with hoodie",
      output: "Fabric specs, size chart, label & care tag placements",
    },
  ];

  const faqs = [
    {
      question: "How does Genpire’s AI Editor work?",
      answer:
        "The AI Editor lets you instantly modify your generated products with natural prompts — no design or CAD experience needed. You can request material changes, new colors, different patterns, or even move your logo to another spot, all in seconds.",
    },
    {
      question: "Can I upload my own logo or brand assets?",
      answer:
        "Yes. You can upload your logo, pattern, or color palette, and the AI will apply them seamlessly across your product visuals.",
    },
    {
      question: "Can I change specific details like zippers, straps, or buttons?",
      answer:
        "Absolutely. Just describe the change — for example, “change zipper to gold” or “make the straps wider” — and the AI will update the product accordingly.",
    },
    {
      question: "Do I need any design or technical background?",
      answer:
        "Not at all. Genpire is built for creators of all levels. You simply describe what you want, and the AI takes care of generating and refining realistic, factory-ready visuals.",
    },
    {
      question: "Can I edit materials or colors after generating?",
      answer:
        "Yes. You can adjust materials (e.g., “make it leather instead of canvas”) and choose from suggested color palettes or input your own color hex codes.",
    },
    {
      question: "Can I preview my changes before downloading?",
      answer:
        "Yes. Every change you make appears instantly in the editor preview (every edit takes approx. 60–90 seconds), so you can refine until it looks perfect.",
    },
    {
      question: "How can I export my edited design?",
      answer:
        "Once satisfied, you can export the product visuals and tech documentation directly as a PDF or Excel-ready file, or edit as an SVG (for pro users) ready to share with your manufacturer.",
    },
  ];

  const premium = [
    {
      title: "Product Generation",
      description:
        "Turn your ideas into visuals in seconds. Simply describe your concept, upload a sketch, or provide inspiration — Genpire instantly generates multiple product options for you to explore",
      link: "https://youtu.be/HptJb8Bo7G4?si=uQjaJy4gRHRslMoF",
    },
    {
      title: "Product Editor",
      description:
        "Fine-tune every detail of your concept. Use the interactive editor to adjust shapes, materials, colors, and sizes until the design perfectly matches your vision.",
      link: "https://youtu.be/uhcBFWXhoso?si=dZZtEYNpohBFgHtA",
    },
    {
      title: "Collection",
      description:
        "Build full product lines with ease. Generate multiple related designs at once and organize them into a cohesive collection ready for presentation or production.",
      link: "https://youtu.be/5IOxslxTXU8?si=ctaB50aSsiDHDPId",
    },
    {
      title: "Brand DNA",
      description:
        "Personalize your workflow with your brand identity. From preferred color palettes to signature styles, Genpire integrates your unique DNA to keep every product consistent with your brand.",
      link: "https://youtu.be/Xhg2SRgUnEM?si=3NwOUqvVidsMYmrq",
    },
    {
      title: "Try-On Studio",
      description:
        "Visualize your creations in real life. Place your products in lifestyle scenes or 3D try-on environments to see how they look and feel before moving to production.",
      link: "https://youtu.be/UT9h36TyX-A?si=Te8Ztj0YeEQM1Hio",
    },
  ];
  const steps = [
    {
      number: 1,
      title: "Start With Your Idea",
      description: "Describe your product (e.g., a tote bag, a unisex hoodie, or a collection of plush toys).",
      icon: Lightbulb,
    },
    {
      number: 2,
      title: "Add Key Info",
      description: "Share materials, sizing, inspiration or competitor links (optional but helpful).",
      icon: Edit3,
    },
    {
      number: 3,
      title: "AI Does the Work",
      description:
        "Genpire turns your idea into a detailed tech pack with visuals, measurements, components, and production notes.",
      icon: Zap,
    },
    {
      number: 4,
      title: "Download or Edit",
      description: "Review and tweak your tech pack, then download or request manufacturing help.",
      icon: Download,
    },
  ];

  const productionJourneySteps = [
    {
      number: 1,
      title: "Generate Your Product",
      description: "Use Genpire AI to create detailed product specifications and tech packs from your idea",
      icon: Lightbulb,
      duration: "1-2 minutes",
      details: [
        "Describe your product idea in detail",
        "AI generates comprehensive specs, materials, and measurements",
        "Review and refine your tech pack",
        "Download production-ready documentation",
      ],
    },
    {
      number: 2,
      title: "Research & Find Manufacturers",
      description: "Identify and contact potential manufacturers that specialize in your product category",
      icon: Search,
      duration: "1-2 weeks",
      details: [
        "Use Genpire's manufacturer directory",
        "Research suppliers on Alibaba, ThomasNet, or industry directories",
        "Check certifications, minimum order quantities (MOQs)",
        "Read reviews and verify credentials",
      ],
    },
    {
      number: 3,
      title: "Request Quotes & Samples",
      description: "Send your tech pack to manufacturers and request detailed quotations",
      icon: FileText,
      duration: "1-2 weeks",
      details: [
        "Send tech pack to 5-10 potential manufacturers",
        "Request detailed quotes including unit costs, MOQs, and lead times",
        "Ask for material samples and previous work examples",
        "Clarify payment terms and production capabilities",
      ],
    },
    {
      number: 4,
      title: "Negotiate & Select Manufacturer",
      description: "Compare quotes, negotiate terms, and choose your manufacturing partner",
      icon: MessageSquare,
      duration: "1 week",
      details: [
        "Compare quotes on price, quality, and lead times",
        "Negotiate MOQs, payment terms, and delivery schedules",
        "Request references from other clients",
        "Finalize manufacturing agreement and terms",
      ],
    },
    {
      number: 5,
      title: "Create Prototype",
      description: "Work with your chosen manufacturer to create and refine product prototypes",
      icon: Package,
      duration: "2-4 weeks",
      details: [
        "Manufacturer creates initial prototype based on tech pack",
        "Review prototype for quality, fit, and specifications",
        "Request revisions and improvements as needed",
        "Approve final prototype before mass production",
      ],
    },
    {
      number: 6,
      title: "Place Production Order",
      description: "Finalize order details and initiate mass production of your product",
      icon: Factory,
      duration: "4-12 weeks",
      details: [
        "Confirm final quantities, colors, and specifications",
        "Make initial payment (typically 30-50% deposit)",
        "Manufacturer begins mass production",
        "Regular progress updates and quality checks",
      ],
    },
    {
      number: 7,
      title: "Quality Control & Shipping",
      description: "Inspect finished products and arrange shipping to your location",
      icon: Truck,
      duration: "1-3 weeks",
      details: [
        "Conduct pre-shipment inspection (PSI)",
        "Approve final product quality and packaging",
        "Arrange shipping method (air, sea, or land)",
        "Track shipment and prepare for customs clearance",
      ],
    },
    {
      number: 8,
      title: "Receive Your First Order",
      description: "Take delivery of your manufactured products and prepare for market launch",
      icon: ShoppingCart,
      duration: "1 week",
      details: [
        "Receive and inspect delivered products",
        "Check quantities and quality against order",
        "Store inventory in appropriate facilities",
        "Begin marketing and sales activities",
      ],
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Genpire Product Generation Guide</h1>
            <p className="text-[#1C1917]">Your complete guide to creating products and tech packs with AI</p>
          </div>
        </div>
      </div>

      {/* Section 1: Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-black" />
            <span>Product Generation vs. Tech Pack Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">
            Genpire offers a two-step approach to product development. First, generate comprehensive product guidelines
            and manufacturing specifications. Then, for products that require detailed technical documentation, create a
            professional tech pack with sketches, measurements, and factory-ready specifications.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "#f5f4f0", borderColor: "#d3c7b9" }}>
              <h3 className="font-semibold text-lg mb-2" style={{ color: "black" }}>
                Product Generation
              </h3>
              <p className="text-sm mb-2">Complete product guidelines, manufacturing specs, and cost estimations</p>
              <div className="text-2xl font-bold" style={{ color: "black" }}>
                3 Credits
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: "#f5f4f0", borderColor: "#d3c7b9" }}>
              <h3 className="font-semibold text-lg mb-2" style={{ color: "black" }}>
                Technical Specifications
              </h3>
              <p className="text-sm mb-2">Detailed technical sketches, measurements, and factory documentation</p>
              <div className="text-2xl font-bold" style={{ color: "black" }}>
                12 Credits
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "#f5f4f0", borderColor: "#d3c7b9" }}>
            <p className="text-sm font-medium" style={{ color: "black" }}>
              💡 <strong>Editing & Revisions:</strong> Each edit or revision in the Genpire editor costs 2 credits
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-black" />
            <span>Step-by-Step Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-black" />
                  </div>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs text-black">
                      Step {step.number}
                    </Badge>
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-[#1C1917] leading-relaxed">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full">
                    <ArrowRight className="h-4 w-4 text-[#1C1917] mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-black" />
            <span>Pro Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {premium.map((text, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-md">{text.title}</h3>
                <p className="text-sm text-black leading-relaxed">{text.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                  onClick={() => window.open(text.link, "_blank", "noopener,noreferrer")}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Link
                </Button>
                {index < premium.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Section 3: Supported Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-black" />
            <span>When Do You Need a Tech Pack?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-3" style={{ color: "black" }}>
                Must-Have Tech Packs
              </h3>
              <p className="text-sm text-[#1C1917] mb-3">
                These product categories require detailed tech packs for manufacturing:
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {mustHaveTechPackCategories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg"
                      style={{ backgroundColor: "#f5f4f0" }}
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-zinc-900/10 flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-zinc-900" />
                      </div>
                      <span className="text-sm">{category.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3" style={{ color: "black" }}>
                Recommended Tech Packs
              </h3>
              <p className="text-sm text-[#1C1917] mb-3">
                These categories benefit from tech packs but can work with visual guidelines:
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {recommendedTechPackCategories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg"
                      style={{ backgroundColor: "#f5f4f0" }}
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-zinc-900/10 flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-zinc-900" />
                      </div>
                      <span className="text-sm">{category.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3" style={{ color: "black" }}>
                Visual Guidelines Sufficient
              </h3>
              <p className="text-sm text-[#1C1917] mb-3">These products typically don't require detailed tech packs:</p>
              <div className="grid gap-2 md:grid-cols-2">
                {visualGuidelinesSufficient.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg"
                      style={{ backgroundColor: "#f5f4f0" }}
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-zinc-900/10 flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-zinc-900" />
                      </div>
                      <span className="text-sm">{category.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-black" />
            <span>Real User Ideas → Real Products</span>
          </CardTitle>
          <p className="text-sm text-[#1C1917]">Common prompts from makers and what Genpire generates</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {examplePrompts.map((example, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      User Input
                    </Badge>
                    <p className="text-sm font-medium">"{example.input}"</p>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs text-black">
                      Genpire Output
                    </Badge>
                    <p className="text-sm text-[#1C1917]">{example.output}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-black" />
            <span>Frequently Asked Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-sm">{faq.question}</h3>
                <p className="text-sm text-[#1C1917] leading-relaxed">{faq.answer}</p>
                {index < faqs.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Production Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Factory className="h-5 w-5 text-black" />
            <span>Complete Production Journey: Idea to First Order</span>
          </CardTitle>
          <p className="text-sm text-[#1C1917]">
            Follow this step-by-step roadmap to take your product from concept to receiving your first manufactured
            order
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-8">
            {productionJourneySteps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex gap-6">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <step.icon className="h-6 w-6 text-black" />
                    </div>
                    {index < productionJourneySteps.length - 1 && <div className="w-px h-16 bg-border mt-2"></div>}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="text-xs text-black">
                        Step {step.number}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {step.duration}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-2" style={{ color: "black" }}>
                      {step.title}
                    </h3>

                    <p className="text-sm text-[#1C1917] mb-4 leading-relaxed">{step.description}</p>

                    <div className="bg-[#f5f4f0] rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-3" style={{ color: "black" }}>
                        Key Actions:
                      </h4>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-black mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline summary */}
          <div className="border-t pt-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-lg" style={{ color: "black" }}>
                Total Timeline: 8-20 weeks from idea to first order
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#f5f4f0" }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: "black" }}>
                    1-2 min
                  </div>
                  <p className="text-sm text-[#1C1917]">Product generation with Genpire AI</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#f5f4f0" }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: "black" }}>
                    4-8 weeks
                  </div>
                  <p className="text-sm text-[#1C1917]">Finding manufacturers & prototyping</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#f5f4f0" }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: "black" }}>
                    4-12 weeks
                  </div>
                  <p className="text-sm text-[#1C1917]">Mass production & delivery</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card
        className="border"
        style={{ background: "linear-gradient(to right, #f5f4f0, #f5f4f0)", borderColor: "#d3c7b9" }}
      >
        <CardContent className="p-8 text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold" style={{ color: "black" }}>
              Ready to Create Your Product?
            </h2>
            <p className="text-[#1C1917]">
              Turn your product idea into professional guidelines and tech packs in under 60 seconds
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/creator-dashboard")}
              className="px-8"
              style={{ background: "black" }}
            >
              <Zap className="mr-2 h-5 w-5" />
              Create a Product Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/creator-dashboard")}>
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs text-[#1C1917] pt-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Under 60 seconds</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Production ready</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>No experience needed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
