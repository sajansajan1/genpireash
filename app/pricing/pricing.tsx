"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Lightbulb, Palette, Wrench, FolderOpen, LayoutGrid, Camera, Sparkles, CreditCard, User, Rocket, Puzzle, Pencil } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import Link from "next/link";
import { useUserStore } from "@/lib/zustand/useStore";
import { useRouter, useSearchParams } from "next/navigation";
import PaypalCustomCard from "@/components/paypal-card/page";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle, VisuallyHidden } from "@/components/ui/dialog";
import { LandingFooter } from "@/components/landing-footer";
import { LandingNavbar } from "@/components/landing-navbar";
const pricing = [
  {
    value: "Turn Credits into Creations",
    question: "Turn Credits into Creations",
    icon: Sparkles,
    answer:
      "Every credit moves your idea forward — from first view to detailed production-ready assets.",
  },
  {
    value: "Front View Generation — 2 Credits",
    question: "Front View Generation — 2 Credits",
    icon: Lightbulb,
    answer:
      "Start with confidence. Generate a high-quality front-view image of your product. Proceed with additional views only after approving the front view.",
  },
  {
    value: "Additional Views — 3 Credits",
    question: "Additional Views — 3 Credits",
    icon: LayoutGrid,
    answer:
      "Expand your design. Generate remaining product views after front-view approval for a complete visual set.",
  },
  {
    value: "Editor Revisions — 5 Credits per revision",
    question: "Editor Revisions — 5 Credits per revision",
    icon: Palette,
    answer:
      "Refine every detail. Make revisions to materials, colors, sections, or proportions directly in the editor.",
  },
  {
    value: "Construction Details — 2 Credits",
    question: "Construction Details — 2 Credits",
    icon: Wrench,
    answer:
      "Reveal how it’s built. Generate up to 3 construction detail images per credit pack.",
  },
  {
    value: "Component Details — 2 Credits",
    question: "Component Details — 2 Credits",
    icon: Puzzle,
    answer:
      "Zoom into the essentials. Generate up to 3 component detail images per credit pack.",
  },
  {
    value: "Sketches — 6 Credits",
    question: "Sketches — 6 Credits",
    icon: Pencil,
    answer:
      "Explore ideas fast. Generate a total of 3 design sketches to ideate and iterate quickly.",
  },
  {
    value: "Product Tech Pack — 1 Credit",
    question: "Product Tech Pack — 1 Credit",
    icon: FolderOpen,
    answer:
      "Get production-ready. Generate a complete product tech pack with specifications and essential details.",
  },
];

export default function PricingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const searchParams = useSearchParams();

  // Open modal if onboarding=true is present
  useEffect(() => {
    const onboarding = searchParams.get("onboarding");
    if (onboarding === "true") {
      setOpenModal(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      {/* Header */}
      {!user && (
        <LandingNavbar />
      )}
      <section className="py-16 ">
        {user && (
          <div className="sm:pl-9 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex justify-center sm:justify-start w-full">
              <Button variant="outline" onClick={() => router.push("/creator-dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        )}
        <div className="container mx-auto max-w-8xl px-4">
          <div className="text-center mb-16">
            {/* <div className="inline-flex items-center rounded-full border border-taupe/30 bg-taupe/20 px-4 py-1 text-sm text-zinc-900 mb-6">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              <span>Credits-Based Pricing • No Subscriptions</span>
            </div> */}
            <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 mb-6">Choose Your Plan</h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto mb-8">
              Turn your ideas into factory-ready products with Genpire’s AI-powered creation suite — generate consistent
              visuals, edit and refine in our cutting-edge product editor, and export complete production files ready
              for the factory, all in one seamless workflow.
            </p>
          </div>
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold text-zinc-900 mb-4">Simple, Flexible Plans</h3>
              <p className="text-xl font-medium text-zinc-900/70">
                Choose a subscription. No hidden fees, no expiration dates — cancel
                anytime.
              </p>
            </div>
            <PaypalCustomCard />
          </div>
          {/* Enterprise CTA */}
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4 px-6">How Genpire Credits Work ?</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {pricing.map((item) => {
              const Icon = item.icon;
              return (
                <AccordionItem key={item.value} value={item.value} className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-zinc-700 flex-shrink-0" />
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">{item.answer}</AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4 ">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-zinc-700" />
              See What You Can Create
            </h2>
            <p className="text-xl text-zinc-900/70">Compare how far your credits go with Genpire.</p>
          </div>
          <Table className="mt-8 border rounded-lg">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-zinc-900">Plan</TableHead>
                <TableHead className="font-semibold text-zinc-900">Saver Plan</TableHead>
                <TableHead className="font-semibold text-zinc-900">Pro Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { icon: CreditCard, label: "Total Credits", saver: "75 Credits", pro: "150 Credits" },
                { icon: User, label: "Ideal For", saver: "Independent creators & early-stage brands", pro: "Studios, agencies & full product teams" },
                { icon: Lightbulb, label: "Product Generation", saver: "~15 products (≈75 visuals)", pro: "~30 products (≈150 visuals)" },
                { icon: FolderOpen, label: "Tech Files", saver: "~24-36 technical packs", pro: "~48-72 technical packs" },
                { icon: LayoutGrid, label: "Collections", saver: "-", pro: "Up to 24 items" },
                { icon: Camera, label: "Try-On Renders", saver: "-", pro: "~8 visuals" },
                { icon: Rocket, label: "Outcome", saver: "Capsule collection ready for sampling", pro: "Full seasonal lines & client-ready collections" },
              ].map((row, index) => {
                const Icon = row.icon;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-zinc-900">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                        {row.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-800">{row.saver}</TableCell>
                    <TableCell className="text-zinc-800">{row.pro}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="text-center mt-12">
            <p className="text-xl text-zinc-900/70">
              Every plan includes full access to Genpire’s creative suite — credits can be used anywhere in your product
              journey.
            </p>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-zinc-900/70">Everything you need to know about our credits system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              {
                question: "What are Genpire credits?",
                answer:
                  "Credits are your creative units inside Genpire. Each action — from product generation to edits or renders — uses a set number of credits.",
              },
              {
                question: "Do credits ever expire?",
                answer: "No. Credits never expire. Use them anytime, whether you’re a Curious buyer or a subscriber.",
              },
              {
                question: "What’s the difference between Curious, Saver, and Pro?",
                answer: [
                  "Curious: One-time purchase of credits, no commitments.",
                  "Saver: Monthly subscription with bundled credits at a discounted rate.",
                  "Pro: Larger monthly bundles plus access to premium tools like Brand DNA, Collection Generator, and Try-On Studio.",
                ],
              },
              {
                question: "Can I switch plans or buy more credits anytime?",
                answer:
                  "Yes. You can upgrade, downgrade, or top up your credits whenever you like — all credits stay active in your account.",
              },
              {
                question: "How many credits do I need per project?",
                answer: [
                  "It depends on what you create:",
                  "Product Generation = 3 credits",
                  "Tech Files = 12 credits",
                  "Try-On Render = 6 credits",
                  "And you can always edit or expand collections as you go.",
                ],
              },
              {
                question: "Are there any hidden fees?",
                answer: "No. Everything is transparent — you only pay for what you create.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-cream/50 rounded-lg p-6">
                <h3 className="font-semibold text-zinc-900 mb-3">{faq.question}</h3>
                {Array.isArray(faq.answer) ? (
                  <ul className="text-zinc-900/70 list-disc pl-5 space-y-1">
                    {faq.answer.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-900/70 whitespace-pre-line">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Get Started with Genpire"
        description="Sign in or create an account to start generating tech packs"
        defaultTab="signup"
      />
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className=" w-[95vw] max-w-md sm:max-w-lg lg:max-w-6xl p-0 overflow-hidden bg-white max-h-[95vh] overflow-y-auto scrollbar-hide border rounded-lg">
          <VisuallyHidden>
            <DialogTitle>Purchase Credits</DialogTitle>
          </VisuallyHidden>
          <PaypalCustomCard />
        </DialogContent>
      </Dialog>
      {!user && <LandingFooter />}
    </div>
  );
}
