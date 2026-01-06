"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Zap, Target, CheckCircle } from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";

export function IndustryClientPage() {
  console.log("[v0] Industry page component is rendering");

  const categories = [
    {
      emoji: "👕",
      name: "Apparel & Fashion",
      description: "Complete tech packs for clothing, garments, and fashion accessories",
      link: "/industry/fashion-plm",
      products: [
        "T-shirts & Tops",
        "Dresses & Skirts",
        "Pants & Jeans",
        "Jackets & Outerwear",
        "Activewear",
        "Lingerie & Underwear",
      ],
      personas: ["Fashion Designers", "Clothing Brands", "Fashion Students", "Apparel Startups"],
      howItWorks:
        "Upload your fashion sketches or describe your garment. Our AI generates detailed tech packs with fabric specifications, construction details, sizing charts, and manufacturing instructions.",
      benefits: [
        "Fabric & trim specifications",
        "Grading & sizing charts",
        "Construction details",
        "Quality control points",
      ],
      cta: "Create Fashion Tech Pack",
    },
    {
      emoji: "👜",
      name: "Accessories & Jewelry",
      description: "Professional specifications for bags, jewelry, and personal accessories",
      link: "/industry/jewelry-plm",
      products: [
        "Handbags & Purses",
        "Jewelry & Watches",
        "Belts & Wallets",
        "Sunglasses",
        "Scarves & Ties",
        "Phone Cases",
      ],
      personas: ["Jewelry Designers", "Accessory Brands", "Craft Makers", "Luxury Goods Companies"],
      howItWorks:
        "Describe your accessory design or upload reference images. Get detailed material lists, hardware specifications, assembly instructions, and quality standards.",
      benefits: [
        "Material & hardware specs",
        "Assembly instructions",
        "Finishing requirements",
        "Packaging guidelines",
      ],
      cta: "Generate Accessory Tech Pack",
    },
    {
      emoji: "🏠",
      name: "Home Goods & Decor",
      description: "Technical specifications for furniture, decor, and household items",
      link: "/industry/home-goods-plm",
      products: [
        "Furniture Pieces",
        "Lighting Fixtures",
        "Textiles & Rugs",
        "Kitchenware",
        "Storage Solutions",
        "Decorative Objects",
      ],
      personas: ["Interior Designers", "Home Goods Brands", "Furniture Makers", "Decor Startups"],
      howItWorks:
        "Input your home goods concept with dimensions and materials. Receive comprehensive manufacturing specs including assembly instructions and safety requirements.",
      benefits: ["Dimensional drawings", "Material specifications", "Assembly instructions", "Safety compliance"],
      cta: "Create Home Goods Tech Pack",
    },
    {
      emoji: "🧸",
      name: "Toys & Gadgets",
      description: "Safe and compliant specifications for toys, games, and children's products",
      link: "/industry/toys-plm",
      products: ["Plush Toys", "Educational Toys", "Board Games", "Action Figures", "Building Sets", "Electronic Toys"],
      personas: ["Toy Designers", "Game Developers", "Educational Product Creators", "Children's Brands"],
      howItWorks:
        "Describe your toy concept and target age group. Get safety-compliant tech packs with material safety data, testing requirements, and age-appropriate specifications.",
      benefits: ["Safety compliance specs", "Age-appropriate materials", "Testing requirements", "Packaging safety"],
      cta: "Generate Toy Tech Pack",
    },
    {
      emoji: "👟",
      name: "Footwear & Athletic",
      description: "Detailed tech packs for shoes, boots, and athletic footwear",
      link: "/industry/footwear-plm",
      products: [
        "Sneakers & Athletic Shoes",
        "Boots & Work Shoes",
        "Sandals & Casual",
        "High Heels & Dress",
        "Children's Footwear",
        "Specialty Footwear",
      ],
      personas: ["Footwear Designers", "Athletic Brands", "Shoe Startups", "Custom Shoemakers"],
      howItWorks:
        "Upload shoe designs or describe your footwear concept. Receive detailed last specifications, material breakdowns, construction methods, and sizing standards.",
      benefits: ["Last & sizing specs", "Material breakdowns", "Construction methods", "Comfort features"],
      cta: "Create Footwear Tech Pack",
    },
    {
      emoji: "🪑",
      name: "Furniture & Fixtures",
      description: "Comprehensive specifications for furniture and architectural fixtures",
      link: "/industry/furniture-plm",
      products: [
        "Seating & Chairs",
        "Tables & Desks",
        "Storage Furniture",
        "Lighting Fixtures",
        "Architectural Elements",
        "Custom Fixtures",
      ],
      personas: ["Furniture Designers", "Architects", "Interior Designers", "Custom Furniture Makers"],
      howItWorks:
        "Input furniture dimensions, materials, and style preferences. Receive detailed construction drawings, joinery specifications, and finishing instructions.",
      benefits: ["Construction drawings", "Joinery specifications", "Finishing instructions", "Hardware requirements"],
      cta: "Create Furniture Tech Pack",
    },
    {
      emoji: "🧴",
      name: "Beauty & Packaging",
      description: "Specialized tech packs for beauty products and innovative packaging solutions",
      link: "/industry/beauty-plm",
      products: [
        "Cosmetic Packaging",
        "Skincare Containers",
        "Fragrance Bottles",
        "Beauty Tools",
        "Sustainable Packaging",
        "Custom Dispensers",
      ],
      personas: ["Beauty Brand Owners", "Packaging Designers", "Cosmetic Startups", "Sustainable Brands"],
      howItWorks:
        "Describe your beauty product packaging needs and brand aesthetic. Get detailed specifications for materials, printing, assembly, and regulatory compliance.",
      benefits: ["Material specifications", "Printing requirements", "Assembly instructions", "Regulatory compliance"],
      cta: "Generate Beauty Tech Pack",
    },
  ];

  const globalPersonas = [
    {
      icon: "✏️",
      title: "Product Designers",
      description: "Transform creative concepts into manufacturable products across any industry",
      industries: ["Fashion", "Industrial Design", "Consumer Products", "Furniture"],
      painPoints: [
        "Time-consuming tech pack creation",
        "Technical specification complexity",
        "Manufacturer communication",
      ],
      solution: "AI-powered tech pack generation that translates design vision into precise manufacturing instructions",
    },
    {
      icon: "🏪",
      title: "Brand Owners & Retailers",
      description: "Develop private label products and bring new concepts to market faster",
      industries: ["E-commerce", "Retail", "Private Label", "Brand Development"],
      painPoints: ["High development costs", "Long time-to-market", "Quality control issues"],
      solution: "Streamlined product development with professional tech packs that ensure quality and reduce costs",
    },
    {
      icon: "🎓",
      title: "Students & Educators",
      description: "Learn industry-standard product development and create portfolio-worthy projects",
      industries: ["Fashion Schools", "Design Programs", "Engineering", "Business Schools"],
      painPoints: ["Limited industry exposure", "Expensive software", "Portfolio development"],
      solution: "Access to professional-grade tools and real-world tech pack creation experience",
    },
    {
      icon: "🛠️",
      title: "Makers & Craftspeople",
      description: "Scale handmade products into commercial production with professional specifications",
      industries: ["Artisan Crafts", "Handmade Products", "Small Batch Production", "Custom Manufacturing"],
      painPoints: ["Scaling production", "Professional documentation", "Manufacturer requirements"],
      solution: "Professional tech packs that help transition from handmade to manufactured products",
    },
    {
      icon: "🏢",
      title: "Established Brands",
      description: "Streamline product development processes and maintain consistency across product lines",
      industries: ["Consumer Goods", "Fashion Brands", "Home Goods", "International Brands"],
      painPoints: ["Process inefficiencies", "Consistency across products", "Global manufacturing coordination"],
      solution: "Standardized tech pack creation that ensures consistency and improves manufacturing communication",
    },
  ];

  console.log("[v0] Categories loaded:", categories.length);
  console.log("[v0] Global personas loaded:", globalPersonas.length);

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-stone-50 to-white py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-4 py-1 text-sm text-stone-700 mb-6">
              <Target className="mr-1 h-3.5 w-3.5" />
              <span>8+ Industries Supported</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-stone-900">
              AI Tech Packs for Every Industry
            </h1>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto mb-8 text-pretty leading-relaxed">
              From fashion and accessories to furniture and beauty products, our AI generates professional tech packs
              for any product category. Discover how Genpire serves your industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  const event = new CustomEvent("openAuthModal", { detail: { mode: "signup" } });
                  window.dispatchEvent(event);
                }}
                className="rounded-xl"
              >
                Join Genpire <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-stone-900">Product Categories We Serve</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Professional tech pack generation across 8+ major product categories
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-0">
                  {/* Category Header */}
                  <div className="bg-gradient-to-br from-stone-800 to-stone-600 p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">{category.emoji}</div>
                      <div>
                        <h3 className="text-2xl font-bold">{category.name}</h3>
                        <p className="text-white/80">{category.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Products */}
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-3 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-stone-600" />
                        Product Types
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {category.products.map((product, idx) => (
                          <div key={idx} className="text-sm text-stone-700 bg-stone-100 rounded px-2 py-1">
                            {product}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personas */}
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-stone-600" />
                        Who Uses This
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {category.personas.map((persona, idx) => (
                          <span key={idx} className="text-sm bg-stone-200 text-stone-900 rounded-full px-3 py-1">
                            {persona}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* How It Works */}
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-3">How Genpire Works for {category.name}</h4>
                      <p className="text-sm text-stone-600 mb-3 leading-relaxed">{category.howItWorks}</p>

                      <div className="grid grid-cols-2 gap-2">
                        {category.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center text-sm text-stone-600">
                            <CheckCircle className="h-3 w-3 mr-2 text-stone-700 flex-shrink-0" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <Button asChild variant="default" className="w-full rounded-xl">
                      <a href={category.link}>
                        {category.cta} <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Personas Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-stone-50 to-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-stone-900">Who Benefits from Genpire</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Our AI tech pack generator serves diverse professionals across all industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {globalPersonas.map((persona, index) => (
              <Card
                key={index}
                className="border border-stone-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 h-full"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">{persona.icon}</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">{persona.title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{persona.description}</p>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm mb-2">Industries:</h4>
                      <div className="flex flex-wrap gap-1">
                        {persona.industries.map((industry, idx) => (
                          <span key={idx} className="text-xs bg-stone-100 text-stone-700 rounded px-2 py-1">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm mb-2">Pain Points:</h4>
                      <ul className="text-xs text-stone-600 space-y-1">
                        {persona.painPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-stone-700 mr-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm mb-2">Genpire Solution:</h4>
                      <p className="text-xs text-stone-600 leading-relaxed">{persona.solution}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-stone-800 to-stone-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Generate Your Tech Pack?</h2>
          <p className="text-xl text-stone-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join 1000+ creators who trust Genpire to transform their product ideas into professional manufacturing
            specifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-white text-white hover:bg-white/10 bg-transparent"
              onClick={() => {
                const event = new CustomEvent("openAuthModal", { detail: { mode: "signup" } });
                window.dispatchEvent(event);
              }}
            >
              Start Free Generation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
