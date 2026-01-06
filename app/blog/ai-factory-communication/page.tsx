import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI for Factory Communication – Bridging the Gap with Manufacturers | Genpire Blog",
  description:
    "Miscommunications with suppliers can cost time and money. See how AI-generated clear specs help you speak the same language as factories, reducing errors and streamlining production.",
  keywords: "factory communication, manufacturer collaboration, AI specs, production clarity, Genpire platform",
};

export default function AIFactoryCommunicationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />

      <article className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center text-zinc-900 hover:text-zinc-900/80 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Manufacturing</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 20, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>6 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              AI for Factory Communication: Speak the Same Language as Manufacturers
            </h1>
          </div>

          <div className="flex justify-end mb-12">
            <Button variant="outline" size="sm" className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Bringing a product to life often involves working with manufacturers across the globe. Miscommunication
              can easily creep in – whether it's a language barrier or just unclear specifications – and the result is
              costly delays or incorrect samples. For a small brand, each misunderstanding hurts. That's where AI-driven
              clarity comes in.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Clear Communication Through AI</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Genpire's AI platform produces standardized, highly visual tech packs and specifications. In essence, it
              helps you and the factory speak the same language. Instead of lengthy email explanations or messy
              hand-drawn sketches, you provide the supplier with a concise document that has:
            </p>
            <ul className="list-disc pl-6 text-zinc-900/80 space-y-2 mb-6">
              <li>Clear product images or drawings (so there's no confusion about the design)</li>
              <li>Precise measurements in the units your factory uses</li>
              <li>A list of materials and components with industry-standard terms</li>
              <li>Step-by-step assembly or construction notes where needed</li>
            </ul>
          </section>

          <section className="mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              This level of clarity minimizes back-and-forth questions. Even if you're working with an overseas factory
              where English isn't the first language, the universal visual and technical language of a Genpire tech pack
              ensures everyone understands the requirements. Some AI tools can even translate or localize key terms,
              further reducing ambiguity.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Founders who use Genpire often report smoother communications and fewer surprises when the first samples
              arrive. By front-loading all the critical information, you build trust with your manufacturer and show
              professionalism, which can lead to better pricing and partnership down the line.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              In short, AI helps you avoid the classic "lost in translation" issues of product development. Ready for a
              smoother conversation with your factory? Use Genpire to create crystal-clear specs and watch how much
              easier production becomes. Get started with Genpire today and make miscommunication a thing of the past.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Improve Factory Communication</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
