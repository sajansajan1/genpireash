import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Co-Design with AI – Team Collaboration on Product Creation",
  description:
    "AI tools aren't just for solo founders. Discover how product teams and designers use Genpire collaboratively—brainstorming ideas, sharing feedback, and iterating on designs in one AI-powered platform.",
  keywords: "team collaboration, co-design, AI teamwork, collaborative design, Genpire teams",
};

export default function TeamCollaborationAIProductDesignPage() {
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
              <span className="bg-black/10 text-navy text-sm font-medium px-3 py-1 rounded-full">Collaboration</span>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Jan 21, 2025</span>
              </div>
              <div className="flex items-center text-sm text-zinc-900/60">
                <Clock className="h-4 w-4 mr-1" />
                <span>6 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 text-balance">
              Co-Create with AI: How Teams Use Genpire to Collaborate on Product Design
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
              AI-powered product design isn't only a boon for solo entrepreneurs – it's also a powerful collaboration tool for teams. Whether you have a small founding team or a larger product development group, Genpire's platform can act as a shared creative workspace. Think of it as a new team member that works 24/7, generating ideas and designs for everyone to build on.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Team Co-Creation Workflows</h2>
            <ul className="list-disc list-inside space-y-3 text-zinc-900/80 leading-relaxed mb-6">
              <li><strong>Brainstorming Sessions:</strong> Instead of just talking about ideas in abstract, teams input their concepts into Genpire and immediately get visual mockups. It sparks more concrete discussions when everyone can see a concept image or 3D model on the spot.</li>
              <li><strong>Design Iteration Loops:</strong> A designer on the team might use AI to create initial design options. The marketing lead and engineer can then chime in: "What if it looked more sporty?" or "Can we simplify this part for cost?" The AI can generate the updated design in minutes for the team to review again. This tight feedback loop means everyone's perspective is considered early on.</li>
              <li><strong>Centralized Specs:</strong> All team members access the same AI-generated spec sheets and tech packs. This ensures alignment – the sales team knows exactly what features are coming, and the sourcing team sees the material requirements upfront, preventing misalignment down the road.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Enhanced Team Dynamics</h2>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              By having an AI as a collaborative partner, teams reduce misunderstandings and cut the waiting time between departments. You don't need to send requests to a separate design office and wait a week for changes – the AI handles them almost instantly, keeping the project momentum going.
            </p>
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              The result is a more cohesive product development process where creativity flows and everyone stays on the same page.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-xl mb-12">
            <p className="text-zinc-900/80 leading-relaxed mb-6">
              Ready to supercharge your team's collaboration? Invite Genpire's AI into your next product meeting and see the difference. Sign up your team on Genpire and co-create the future together.
            </p>
            <div className="text-center mt-6">
              <Button className="bg-black text-white hover:bg-black/90">Collaborate with AI</Button>
            </div>
          </section>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
