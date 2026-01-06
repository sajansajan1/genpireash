"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronDown, Mail, CheckCheck } from "lucide-react";
import Link from "next/link";
import { Volkhov } from "next/font/google";
import { addToWaitlist } from "../actions/waitlist";
import { TestimonialsSection } from "@/components/testimonials-section";
import { LandingNavbar } from "@/components/landing-navbar";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function WaitlistClientPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);

      const result = await addToWaitlist(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSubmitted(true);
        setPosition(result.position);
        setEmail("");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this function inside the WaitlistPage component, before the return statement
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80, // Offset for the header
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      <main className="flex-1 w-full">
        {/* Hero Section with Social Proof */}
        <section className="relative w-full py-20 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream via-white to-white dark:from-navy dark:via-gray-900 dark:to-gray-900"></div>
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 text-center lg:text-left">
                <Badge className="mb-4 bg-primary/10 text-zinc-900 hover:bg-primary/20 transition-colors">
                  Coming Soon
                </Badge>
                <h1 className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in `}>
                  From Idea <span className="text-zinc-600">to Empire.</span>
                </h1>
                <p
                  className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
                >
                  Generate your custom products, create AI-powered spec sheets and tech packs, and get quotes from
                  vetted, ready-to-manufacture suppliers — all in minutes, not months.
                </p>
                <div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  {!submitted ? (
                    <>
                      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="flex-1 bg-white/20 border-taupe border-2 text-zinc-900 placeholder:text-zinc-900/70"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="submit"
                          className="bg-taupe text-zinc-900 hover:bg-taupe/90"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Joining..." : "Join Waitlist"}{" "}
                          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                      </form>
                      {error && <p className="text-sm text-red-500 mt-2 animate-fade-in">{error}</p>}
                    </>
                  ) : (
                    <div className="text-left animate-fade-in w-full max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCheck className="h-5 w-5 text-green-500" />
                        <h3 className="text-xl font-semibold">You're on the list!</h3>
                      </div>
                      <p className="text-[#1C1917] mt-2">We will update you once Genpire is live</p>
                    </div>
                  )}
                </div>
                {error && <p className="text-sm text-red-500 mt-2 animate-fade-in">{error}</p>}
                <p className="text-sm text-[#1C1917] mt-3 mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  Join 1,500+ product creators on the waitlist
                </p>

                {/* Social Proof Stats */}
                <div
                  className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6 animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="text-center bg-white/50 dark:bg-black/30 rounded-lg p-3 shadow-sm">
                    <div className="text-xl font-bold text-zinc-600">1,500+</div>
                    <div className="text-xs text-[#1C1917]">Waitlist Signups</div>
                  </div>
                  <div className="text-center bg-white/50 dark:bg-black/30 rounded-lg p-3 shadow-sm">
                    <div className="text-xl font-bold text-zinc-600">94%</div>
                    <div className="text-xs text-[#1C1917]">Time Saved</div>
                  </div>
                  <div className="text-center bg-white/50 dark:bg-black/30 rounded-lg p-3 shadow-sm">
                    <div className="text-xl font-bold text-zinc-600">$12M+</div>
                    <div className="text-xs text-[#1C1917]">Costs Saved</div>
                  </div>
                  <div className="text-center bg-white/50 dark:bg-black/30 rounded-lg p-3 shadow-sm">
                    <div className="text-xl font-bold text-zinc-600">4.9/5</div>
                    <div className="text-xs text-[#1C1917]">User Rating</div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 animate-fade-in relative" style={{ animationDelay: "0.3s" }}>
                <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full hidden sm:block">
                  {/* Hero Animation Sequence */}
                  <HeroAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-6xl">{/* Features content here */}</div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 `}>How It Works</h2>
              <p className="text-lg text-[#1C1917] max-w-2xl mx-auto">
                From concept to physical sample in just a few simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  title: "Describe Your Idea",
                  description:
                    "Share your product vision through text, images, voice description, or upload your own designs.",
                },
                {
                  step: "2",
                  title: "Review AI Designs",
                  description: "Our AI generates multiple design options based on your requirements.",
                },
                {
                  step: "3",
                  title: "Customize Specs",
                  description: "Fine-tune materials, colors, dimensions, and other specifications.",
                },
                {
                  step: "4",
                  title: "Get Samples",
                  description: "Receive quotes from manufacturers and order physical samples.",
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="glass-card dark:glass-card-dark rounded-xl p-6 h-full">
                    <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 mt-2">{step.title}</h3>
                    <p className="text-[#1C1917]">{step.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-zinc-900" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className="w-full py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 `}>Endless Possibilities</h2>
              <p className="text-lg text-[#1C1917] max-w-2xl mx-auto">
                Create any product across multiple categories with our AI-powered platform
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  emoji: "🧵",
                  title: "Fashion & Apparel",
                  description: "T-shirts, hoodies, dresses, outerwear",
                },
                {
                  emoji: "👜",
                  title: "Bags & Accessories",
                  description: "Tote bags, wallets, belts, jewelry",
                },
                {
                  emoji: "👟",
                  title: "Footwear",
                  description: "Sneakers, sandals, flip-flops, boots",
                },
                {
                  emoji: "📱",
                  title: "Gadgets & Tech Gear",
                  description: "Phone stands, cases, wearables, chargers",
                },
                {
                  emoji: "🪑",
                  title: "Home & Living",
                  description: "Organizers, cushions, small furniture, decor",
                },
                {
                  emoji: "🧴",
                  title: "Beauty & Wellness",
                  description: "Skincare tools, makeup kits, massage products",
                },
                {
                  emoji: "🍼",
                  title: "Kids & Baby Products",
                  description: "Toys, bibs, blankets, toddler gear",
                },
                {
                  emoji: "🎒",
                  title: "Travel & Outdoor Gear",
                  description: "Packing cubes, backpacks, portable items",
                },
                {
                  emoji: "🎁",
                  title: "Packaging & Merch",
                  description: "Custom boxes, branded kits, promo goods",
                },
              ].map((category, index) => (
                <div
                  key={index}
                  className="glass-card dark:glass-card-dark rounded-xl p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4">{category.emoji}</div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-[#1C1917]">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <TestimonialsSection />
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 `}>Frequently Asked Questions</h2>
              <p className="text-lg text-[#1C1917] max-w-2xl mx-auto">Everything you need to know about Genpire</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "When will Genpire launch?",
                  answer:
                    "We're planning to launch in Q2 2025. Join the waitlist to get early access and updates on our progress.",
                },
                {
                  question: "What types of products can I create with Genpire?",
                  answer:
                    "Genpire supports a wide range of product categories including apparel, accessories, footwear, home goods, and more. Our AI is trained on thousands of product specifications across multiple industries.",
                },
                {
                  question: "How accurate are the AI-generated specifications?",
                  answer:
                    "Our AI generates specifications with over 95% accuracy compared to professionally created specs. All specifications are fully editable, so you can make adjustments as needed.",
                },
                {
                  question: "How does supplier matching work?",
                  answer:
                    "We've pre-vetted manufacturers across the globe who can produce various product types. Based on your specifications, we match you with suppliers who have the capabilities and experience to produce your product.",
                },
                {
                  question: "What does Genpire cost?",
                  answer:
                    "We offer credit-based pricing with features including: 🛠️ Generating Products, 📋 Generating Production Guidelines, 🤖 AI-Powered Editing, ✍️ Unlimited Manual Editing, and 🧾 PDF Export. Early waitlist members will receive special founding member pricing.",
                },
              ].map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-[#1C1917]">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="join" className="w-full py-20 px-4 bg-zinc-900 text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 `}>Join the Waitlist Today</h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Be among the first to experience Genpire and transform how you create products. Early access members
              receive exclusive benefits and founding member pricing.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/20 border-taupe border-2 text-cream placeholder:text-cream/70"
                  disabled={isSubmitting}
                />
                <Button type="submit" className="bg-taupe text-zinc-900 hover:bg-taupe/90" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Join Waitlist"}{" "}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <div className="text-center animate-fade-in max-w-md mx-auto">
                <CheckCheck className="h-12 w-12 text-taupe mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
                <p className="text-[#1C1917]">We will update you once Genpire is live</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="w-full bg-background border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className={`text-2xl font-bold text-zinc-600 mb-2 `}>Genpire</div>
              <p className="text-sm text-[#1C1917]">From Idea to Sample. Powered by AI.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-semibold mb-3">Contact</h3>
                <div className="flex items-center text-sm text-[#1C1917]">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>support@genpire.com</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Follow Us</h3>
                <div className="flex gap-4">
                  <Link href="#" className="text-[#1C1917] hover:text-foreground transition-colors">
                    Twitter
                  </Link>
                  <Link href="#" className="text-[#1C1917] hover:text-foreground transition-colors">
                    LinkedIn
                  </Link>
                  <Link href="#" className="text-[#1C1917] hover:text-foreground transition-colors">
                    Instagram
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center w-full">
            <p className="text-sm text-[#1C1917] mb-4 md:mb-0">
              © {new Date().getFullYear()} Genpire. All rights reserved.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
              <div className="flex gap-6 text-sm">
                <Link href="#" className="text-[#1C1917] hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-[#1C1917] hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 w-full sm:w-auto">
                <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white shadow-md w-full sm:w-auto">
                  <Link href="/">Create Your Techpack ✨</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-taupe hover:bg-taupe/90 text-zinc-900 shadow-md w-full sm:w-auto"
                >
                  <Link href="/onboarding/manufacturer">Become a Supplier 🏭</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Scroll to top"
      >
        <ChevronDown className="h-5 w-5 transform rotate-180" />
      </button>
    </div>
  );
}

// Update the HeroAnimation component to follow the specified sequence
function HeroAnimation() {
  // Animation states
  const [promptVisible, setPromptVisible] = useState(true);
  const [imageVisible, setImageVisible] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [suppliersVisible, setSupplierVisible] = useState(false);
  const [supplier1Visible, setSupplier1Visible] = useState(false);
  const [supplier2Visible, setSupplier2Visible] = useState(false);
  const [supplier3Visible, setSupplier3Visible] = useState(false);
  const [finalCardVisible, setFinalCardVisible] = useState(false);

  // Set up the animation sequence
  useEffect(() => {
    // Step 1: Prompt Card (show for 2.5s, then fade out)
    const promptTimer = setTimeout(() => {
      setPromptVisible(false);

      // Step 2: After 300ms delay, show the image
      const imageTimer = setTimeout(() => {
        setImageVisible(true);

        // Step 3: After image appears, show loading state
        const loadingTimer = setTimeout(() => {
          setLoadingVisible(true);

          // Step 4: After loading, show supplier quotes
          const suppliersTimer = setTimeout(() => {
            setLoadingVisible(false);
            setSupplierVisible(true);

            // Staggered supplier card animations
            setSupplier1Visible(true);

            const supplier2Timer = setTimeout(() => {
              setSupplier2Visible(true);

              const supplier3Timer = setTimeout(() => {
                setSupplier3Visible(true);

                // Add final card after a delay
                const finalCardTimer = setTimeout(() => {
                  setFinalCardVisible(true);
                  setSupplierVisible(false); // Hide supplier cards when final card appears
                }, 1500); // 1.5s delay for final card

                return () => clearTimeout(finalCardTimer);
              }, 500); // 0.5s delay for supplier 3

              return () => clearTimeout(supplier3Timer);
            }, 500); // 0.5s delay for supplier 2

            return () => clearTimeout(supplier2Timer);
          }, 3000); // 3s for loading state

          return () => clearTimeout(suppliersTimer);
        }, 2000); // 2s after image appears

        return () => clearTimeout(loadingTimer);
      }, 300); // 300ms delay between prompt fade-out and image fade-in

      return () => clearTimeout(imageTimer);
    }, 3500); // 3.5s (1s fade in + 2.5s visible)

    return () => clearTimeout(promptTimer);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Step 1: Prompt Card */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 transition-opacity duration-1000 ${promptVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        style={{
          transitionDuration: "1000ms",
        }}
      >
        <div
          className="mx-auto max-w-[90%] sm:max-w-md rounded-xl p-3 sm:p-4 shadow-lg"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/10 flex-shrink-0">
              <span className="text-lg sm:text-xl">🌟</span>
            </div>
            <div>
              <span className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-900">
                "Design a sustainable bracelet with hand-carved wooden charms inspired by ocean waves"
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Product Image */}
      <div
        className={`absolute inset-0 z-20 transition-opacity duration-1500 ${imageVisible ? "opacity-100" : "opacity-0"
          }`}
        style={{
          transitionDuration: "1500ms",
        }}
      >
        <div className="glass-card dark:glass-card-dark rounded-xl overflow-hidden shadow-xl h-full hidden sm:block">
          <img
            src="/images/bracelet.png"
            alt="Sustainable wooden charm bracelet"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Step 3: Loading/Sending to Suppliers */}
      <div
        className={`absolute bottom-4 left-0 right-0 z-30 px-2 sm:px-4 transition-opacity duration-500 ${loadingVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="flex justify-center">
          <div
            className="rounded-lg p-3 sm:p-4 shadow-lg max-w-[95%] sm:max-w-md w-full"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="text-xl">📡</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-900">Finding Suppliers</h4>
                <p className="text-xs text-zinc-900/90 dark:text-zinc-900/90">
                  Sending specifications to relevant manufacturers...
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-black h-1.5 rounded-full animate-pulse" style={{ width: "70%" }}></div>
                </div>
              </div>
              <div className="flex">
                <span className="animate-bounce inline-block">.</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: "0.2s" }}>
                  .
                </span>
                <span className="animate-bounce inline-block" style={{ animationDelay: "0.4s" }}>
                  .
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Supplier Quote Cards */}
      <div
        className={`absolute bottom-8 left-4 right-4 z-30 transition-opacity duration-500 ${suppliersVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="flex flex-col gap-2 max-h-[calc(100%-32px)] overflow-y-auto">
          {/* Supplier 1 */}
          <div
            className={`rounded-lg p-2 sm:p-3 shadow-lg flex-1 transition-all duration-500 bg-white/95 backdrop-blur-sm border border-white/20 ${supplier1Visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="text-xl">🌊</div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-900">OceanCraft Factory</h4>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">98% match</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xs">
                        ★
                      </span>
                    ))}
                    {[...Array(1)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xs">
                        ☆
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-900/70 ml-1">(126)</span>
                </div>
                <span className="text-xs text-zinc-900/90 font-medium">Samples: 1,240+</span>
              </div>

              <div className="grid grid-cols-3 gap-1 mt-0.5">
                <div className="text-center">
                  <p className="text-xs text-zinc-900/70">MOQ</p>
                  <p className="text-xs font-medium">100 units</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-900/70">Sample</p>
                  <p className="text-xs font-medium">$45</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-900/70">Delivery</p>
                  <p className="text-xs font-medium">14 days</p>
                </div>
              </div>

              <div className="flex gap-1.5 mt-1.5">
                <button className="flex-1 text-xs bg-black text-white px-2 py-0.5 rounded hover:bg-black/80 transition-colors flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057
                      -5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Similar
                </button>
                <button className="flex-1 text-xs bg-taupe text-zinc-900 px-2 py-0.5 rounded hover:bg-taupe/80 transition-colors font-medium">
                  Contact Supplier
                </button>
              </div>
            </div>
          </div>

          {/* Supplier 2 */}
          <div
            className={`rounded-lg p-2 sm:p-3 shadow-lg flex-1 transition-all duration-500 bg-white/95 backdrop-blur-sm border border-white/20 ${supplier2Visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="text-xl">🪵</div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-900">EcoWood Creations</h4>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">95% match</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xs">
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-900/70 ml-1">(342)</span>
                </div>
                <span className="text-xs text-zinc-900/90 font-medium">Samples: 2,890+</span>
              </div>

              <div className="grid grid-cols-3 gap-1 mt-0.5">
                <div className="text-center">
                  <p className="text-xs text-zinc-900/70">MOQ</p>
                  <p className="text-xs font-medium">50 units</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-900/70">Sample</p>
                  <p className="text-xs font-medium">$60</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-900/70">Delivery</p>
                  <p className="text-xs font-medium">10 days</p>
                </div>
              </div>

              <div className="flex gap-1.5 mt-1.5">
                <button className="flex-1 text-xs bg-black text-white px-2 py-0.5 rounded hover:bg-black/80 transition-colors flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Similar
                </button>
                <button className="flex-1 text-xs bg-taupe text-zinc-900 px-2 py-0.5 rounded hover:bg-taupe/80 transition-colors font-medium">
                  Contact Supplier
                </button>
              </div>
            </div>
          </div>

          {/* Supplier 3 */}
          <div
            className={`rounded-lg p-2 sm:p-3 shadow-lg flex-1 transition-all duration-500 bg-white/95 backdrop-blur-sm border border-white/20 ${supplier3Visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="text-xl">🌿</div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-900">Sustainable Gems</h4>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">92% match</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xs">
                        ★
                      </span>
                    ))}
                    {[...Array(1)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xs">
                        ☆
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-900/70 ml-1">(89)</span>
                </div>
                <span className="text-xs text-zinc-900/90 font-medium">Samples: 540+</span>
              </div>

              <div className="grid grid-cols-3 gap-1 mt-0.5">
                <div className="text-center">
                  <p className="text-xs text-zinc-900/70">MOQ</p>
                  <p className="text-xs font-medium">200 units</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-900/70">Sample</p>
                  <p className="text-xs font-medium">$50</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-900/70">Delivery</p>
                  <p className="text-xs font-medium">12 days</p>
                </div>
              </div>

              <div className="flex gap-1.5 mt-1.5">
                <button className="flex-1 text-xs bg-black text-white px-2 py-0.5 rounded hover:bg-black/80 transition-colors flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Similar
                </button>
                <button className="flex-1 text-xs bg-taupe text-zinc-900 px-2 py-0.5 rounded hover:bg-taupe/80 transition-colors font-medium">
                  Contact Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 5: Final Card */}
      <div
        className={`absolute inset-0 z-40 transition-opacity duration-700 ${finalCardVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl h-full">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold">Order Summary</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-black/10 rounded-lg p-2">
                  <span className="text-2xl">🪵</span>
                </div>
                <div>
                  <h4 className="font-medium">Sustainable Wooden Bracelet</h4>
                  <p className="text-sm text-[#1C1917]">Hand-carved ocean wave design</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">$45.00</p>
                <p className="text-sm text-[#1C1917]">Sample price</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg">
              <div>
                <p className="text-sm text-[#1C1917]">Estimated Production</p>
                <p className="font-medium">10-14 days</p>
              </div>
              <div>
                <p className="text-sm text-[#1C1917]">Shipping Time</p>
                <p className="font-medium">3-5 business days</p>
              </div>
              <div>
                <p className="text-sm text-[#1C1917]">Minimum Order</p>
                <p className="font-medium">100 units</p>
              </div>
              <div>
                <p className="text-sm text-[#1C1917]">Supplier Rating</p>
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xs">
                        ★
                      </span>
                    ))}
                    {[...Array(1)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xs">
                        ☆
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-900/70 ml-1">(126)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-[#1C1917]">Sample Price</span>
                <span className="font-medium">$45.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-[#1C1917]">Shipping</span>
                <span className="font-medium">$15.00</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>$60.00</span>
              </div>
            </div>

            <button className="w-full bg-taupe text-zinc-900 py-3 rounded-lg font-medium hover:bg-taupe/90 transition-colors mt-4 shadow-sm">
              Proceed to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
