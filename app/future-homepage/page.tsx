"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LandingFooter } from "@/components/landing-footer";
import { LandingNavbar } from "@/components/landing-navbar";
import { Brain, FileText, Factory, Zap, Package, Users, ArrowRight, Check, Play } from "lucide-react";

export default function FutureHomepage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentTyping, setCurrentTyping] = useState(0);
  const [isAnnual, setIsAnnual] = useState(false);

  const typingItems = ["cropped hoodie", "minimal tote bag", "custom slides", "ceramic homeware"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTyping((prev) => (prev + 1) % typingItems.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-zinc-900 text-white py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            From Prompt to <span className="text-[#f5f4f0]">(Real)</span> Product
          </h1>
          <p className="text-xl md:text-2xl text-[#f5f4f0] mb-8 leading-relaxed">
            Design, spec, and produce your next product — powered by AI and connected to real, vetted manufacturers
            around the world.
          </p>

          {/* Typing Animation */}
          <div className="mb-12 h-8">
            <span className="text-lg text-[#d3c7b9] font-mono">"{typingItems[currentTyping]}"</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#f5f4f0] text-zinc-900 hover:bg-[#d3c7b9] px-8 py-4 text-lg font-semibold">
              Generate Your Product
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#f5f4f0] text-[#f5f4f0] hover:bg-[#f5f4f0] hover:text-zinc-900 px-8 py-4 text-lg bg-transparent"
            >
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-16">How Genpire Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#f5f4f0] border-[#d3c7b9] hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-[#f5f4f0]" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Generate Your Product Idea</h3>
                <p className="text-zinc-900/80">
                  Start with a simple prompt or sketch. Our AI returns a fully visualized product concept and specs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f5f4f0] border-[#d3c7b9] hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-[#f5f4f0]" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Get a Factory-Grade Tech Pack</h3>
                <p className="text-zinc-900/80">
                  Genpire builds a complete tech pack with vector sketches, BOM, dimensions, packaging, and callouts.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#f5f4f0] border-[#d3c7b9] hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Factory className="h-8 w-8 text-[#f5f4f0]" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Match with Vetted Suppliers</h3>
                <p className="text-zinc-900/80">
                  Access a network of verified manufacturers. Send your tech pack, get quotes, and start real
                  production.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-16">
            What You Can Do With Genpire
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-[#d3c7b9] hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-zinc-900 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-zinc-900 mb-4">AI Product Generator</h3>
                <p className="text-zinc-900/80">
                  Prompt-based product creation with smart visuals and category-specific specs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#d3c7b9] hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-zinc-900 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Tech Pack Builder</h3>
                <p className="text-zinc-900/80">Generate detailed, production-ready PDFs, SVGs, and AI files.</p>
              </CardContent>
            </Card>

            <Card className="border-[#d3c7b9] hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-zinc-900 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Supplier Matching</h3>
                <p className="text-zinc-900/80">
                  Match with vetted factories, send RFQs, and manage production directly from your Genpire dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-4 bg-[#f5f4f0]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-8">
            Pricing That Works For Every Stage
          </h2>

          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-1 border border-[#d3c7b9]">
              <Button
                variant={!isAnnual ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsAnnual(false)}
                className={!isAnnual ? "bg-zinc-900 text-white" : "text-zinc-900"}
              >
                Monthly
              </Button>
              <Button
                variant={isAnnual ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsAnnual(true)}
                className={isAnnual ? "bg-zinc-900 text-white" : "text-zinc-900"}
              >
                Annual
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Curious Plan */}
            <Card className="border-[#d3c7b9] bg-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Curious</h3>
                <div className="text-3xl font-bold text-zinc-900 mb-6">Free</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">1 product generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">Preview-only tech pack</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">No supplier access</span>
                  </li>
                </ul>
                <Button className="w-full bg-zinc-900 text-white hover:bg-gray-800">Get Started</Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-[#0e2a47] bg-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-zinc-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Pro</h3>
                <div className="text-3xl font-bold text-zinc-900 mb-2">${isAnnual ? "39.90" : "49.90"}</div>
                <div className="text-zinc-900/60 mb-6">per month</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">100 credits</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">Full PDF/SVG/AI exports</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">3 RFQs/week</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">Access to vetted manufacturers</span>
                  </li>
                </ul>
                <Button className="w-full bg-zinc-900 text-white hover:bg-gray-800">Start Pro Trial</Button>
              </CardContent>
            </Card>

            {/* Custom Plan */}
            <Card className="border-[#d3c7b9] bg-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Custom</h3>
                <div className="text-2xl font-bold text-zinc-900 mb-6">For Teams & Studios</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">Custom pricing</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">API access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">Bulk generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-zinc-900">Factory concierge</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full border-[#0e2a47] text-zinc-900 hover:bg-zinc-900 hover:text-white bg-transparent"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-8">See Genpire in Action</h2>

          <div className="bg-[#f5f4f0] rounded-lg p-8 border border-[#d3c7b9]">
            <Input
              placeholder="Type your product idea..."
              className="mb-6 text-lg p-4 border-[#d3c7b9] focus:border-[#0e2a47]"
            />

            <div className="bg-white rounded-lg p-6 mb-6 border border-[#d3c7b9] relative">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-zinc-900 font-semibold">Product sketch + tech pack preview</p>
                </div>
              </div>
              <div className="h-48 bg-gray-100 rounded opacity-30"></div>
            </div>

            <Button className="bg-zinc-900 text-[#f5f4f0] hover:bg-gray-800 px-8 py-3">
              Unlock Full Tech Pack <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[#f5f4f0]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-12">Trusted by Modern Product Creators</h2>

          <Card className="bg-white border-[#d3c7b9] max-w-2xl mx-auto">
            <CardContent className="p-8">
              <p className="text-lg text-zinc-900 italic mb-6">
                "Genpire got me from sketch to sample in 5 days — with a real supplier quote."
              </p>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-[#d3c7b9] rounded-full mr-4"></div>
                <div className="text-left">
                  <div className="font-semibold text-zinc-900">Sarah Chen</div>
                  <div className="text-zinc-900/60">Product Designer</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-zinc-900 text-white py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Empire Starts Here</h2>
          <p className="text-xl text-[#f5f4f0] mb-8">
            Create your next product. From prompt to spec to factory — all in one place.
          </p>
          <Button size="lg" className="bg-[#f5f4f0] text-zinc-900 hover:bg-[#d3c7b9] px-12 py-4 text-xl font-semibold">
            Start Building <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
