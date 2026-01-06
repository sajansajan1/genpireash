import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Genpire",
  description: "Frequently asked questions about Genpire - AI-powered product creation platform",
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zinc-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-zinc-900/70">
              Find answers to common questions about Genpire and our AI-powered product creation platform.
            </p>
          </div>

          <div className="space-y-8">
            {/* Getting Started */}
            <section>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-6">🚀 Getting Started</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="what-is-genpire" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">What is Genpire?</AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Genpire is an AI-powered platform that helps creators and teams turn ideas or sketches into
                    production-ready tech packs and manufacturing guidelines.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="Who can use Genpire" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">Who can use Genpire?</AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    From solo creators to design teams, anyone in categories like fashion, footwear, jewelry, furniture,
                    gadgets, toys, home goods, and accessories can use Genpire.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="Do I need design experience" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">Do I need design experience?</AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Not at all. You can start with a simple text prompt, image, or sketch — Genpire makes the process
                    intuitive and fast.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="What kind of files does Genpire generate"
                  className="border border-taupe/30 rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-medium">
                    What kind of files does Genpire generate?
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Genpire delivers detailed tech packs and manufacturing guidelines that factories can use to develop
                    samples and products.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="Can Genpire connect me with suppliers"
                  className="border border-taupe/30 rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-medium">
                    Can Genpire connect me with suppliers?
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Factory connections are launching soon. Today, Genpire equips you with everything you need to
                    approach manufacturers directly, and soon you’ll be able to connect with trusted suppliers inside
                    the platform.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="How does pricing work" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">How does pricing work?</AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Genpire runs on credits. You can start free to explore, and upgrade for premium features such as
                    brand DNA workflows, collection generation, and AI-powered try-on studio.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* AI Technology */}
            <section>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-6">🤖 AI Technology</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="ai-accuracy" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    How accurate are the AI-generated tech packs?
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Our AI is trained on thousands of professional tech packs and industry standards. While the
                    generated specifications provide an excellent starting point (typically 85-95% accurate), we always
                    recommend reviewing and refining the details with your chosen manufacturer to ensure perfect
                    alignment with your vision.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="product-types" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    What types of products can I create tech packs for?
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Our AI supports a wide range of physical products including apparel, accessories, home goods,
                    electronics housings, toys, jewelry, and more. If it's a physical product that can be manufactured,
                    our AI can likely help create specifications for it.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="customization" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    Can I customize and edit the AI-generated tech packs?
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Every tech pack is fully editable. You can modify specifications, add notes, upload additional
                    images, adjust measurements, and collaborate with team members or manufacturers to perfect your
                    product documentation.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Manufacturers */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-semibold text-zinc-900">🏭 Manufacturers & Production</h2>
                <Badge
                  variant="secondary"
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border bg-stone-200 text-black border-stone-300"
                >
                  Coming Soon
                </Badge>
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="find-manufacturers" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    <div className="flex items-center gap-2">
                      How do I find manufacturers for my product?
                      <Badge
                        variant="secondary"
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border bg-stone-200 text-black border-stone-300"
                      >
                        Coming Soon
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-amber-800 font-medium">🚀 Coming Soon Feature</p>
                    </div>
                    Genpire will connect you with our network of vetted manufacturers who specialize in your product
                    category. Our matching algorithm will consider your product type, budget, quantity requirements, and
                    location preferences to suggest the best manufacturing partners.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="manufacturer-vetting" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    <div className="flex items-center gap-2">
                      Are the manufacturers on your platform vetted?
                      <Badge
                        variant="secondary"
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border bg-stone-200 text-black border-stone-300"
                      >
                        Coming Soon
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-amber-800 font-medium">🚀 Coming Soon Feature</p>
                    </div>
                    Yes, all manufacturers in our network will go through a comprehensive vetting process including
                    capability assessment, quality certifications, production capacity evaluation, and reference checks.
                    We will continuously monitor performance to maintain high standards.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="minimum-orders" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    <div className="flex items-center gap-2">
                      What are typical minimum order quantities?
                      <Badge
                        variant="secondary"
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border bg-stone-200 text-black border-stone-300"
                      >
                        Coming Soon
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-amber-800 font-medium">🚀 Coming Soon Feature</p>
                    </div>
                    Minimum order quantities will vary by product type and manufacturer. We will work with manufacturers
                    who accommodate both small batch production (50-500 units) for startups and large-scale production
                    for established brands. This information will be clearly displayed in manufacturer profiles.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Pricing & Plans */}
            <section>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-6">💰 Pricing & Plans</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="pricing-plans" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">What are your pricing plans?</AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    We offer four credit-based plans: Starter ($9.99 for 15 credits), Creator ($29 for 50 credits),
                    Professional ($79 for 150 credits), and Enterprise (custom pricing with unlimited credits). All
                    plans include the same core features: 🛠️ Generating Products, 📋 Generating Production Guidelines,
                    🤖 AI-Powered Editing, ✍️ Unlimited Manual Editing, and 🧾 PDF Export. Credits never expire and
                    there are no monthly commitments.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payment-methods" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    What payment methods do you accept?
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers
                    for enterprise accounts. All payments are processed securely through encrypted payment gateways.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cancel-anytime" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    Can I cancel my subscription anytime?
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Yes, you can cancel your subscription at any time from your account settings. You'll continue to
                    have access to paid features until the end of your current billing period, and you can always
                    reactivate your subscription later.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Security & Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-6">🔒 Security & Privacy</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="data-security" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">How secure is my product data?</AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    We take data security seriously. All data is encrypted in transit and at rest, stored on secure
                    cloud infrastructure, and access is strictly controlled. We never share your product ideas without
                    your explicit permission, and you maintain full ownership of your intellectual property.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ip-protection" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    Who owns the intellectual property of my designs?
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    You retain full ownership of your product ideas, designs, and any intellectual property you create
                    using our platform. Genpire only has a limited license to process your data to provide our services.
                    We recommend consulting with an IP attorney for valuable innovations.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-export" className="border border-taupe/30 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium">
                    Can I export my data if I leave the platform?
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-900/70 leading-relaxed">
                    Yes, you can export all your tech packs, project data, and files at any time in standard formats
                    (PDF, JSON, images). We believe in data portability and will never lock you into our platform.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </div>

          {/* Contact Support */}
          <div className="mt-16 bg-cream/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-semibold text-zinc-900 mb-4">Still have questions?</h3>
            <p className="text-zinc-900/70 mb-6">
              Our support team is here to help you succeed with your product creation journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-zinc-900 hover:bg-gray-800 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Chat Support
              </Button>
              <Button variant="outline" className="border-navy text-zinc-900 hover:bg-black/5 bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
