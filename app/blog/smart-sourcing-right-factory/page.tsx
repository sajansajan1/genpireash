import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Sourcing – Find the Right Factory Faster with AI",
  description:
    "Tired of searching for manufacturers? See how Genpire streamlines sourcing by helping you connect with suitable factories. With AI-optimized tech packs and supplier matching tips, you'll go from quote to production in no time.",
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto max-w-4xl px-4 py-16">
        <header className="mb-12">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Smart Sourcing: Finding the Right Factory Faster with Genpire
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <time dateTime="2025-01-15">January 15, 2025</time>
            <span>•</span>
            <span>7 min read</span>
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="lead text-xl text-muted-foreground">
            Finding a manufacturer can feel like dating – you search online
            directories, send out inquiries, and hope one is the right match.
            For newcomers, it's often a long, uncertain process. Genpire helps
            take the guesswork out of sourcing.
          </p>

          <p>
            By equipping you with AI-optimized tech packs and guidance, it
            enables you to find a suitable factory faster and with more
            confidence.
          </p>

          <h2>The Power of Professional Presentation</h2>
          <p>
            The first key is presentation. When you approach suppliers with a
            professional, comprehensive tech pack (courtesy of Genpire's AI),
            you immediately stand out from the tire-kickers. Factories can see
            you're prepared and serious, which means they're more likely to
            prioritize your inquiry. They can also quote more accurately and
            quickly because all specs are laid out clearly.
          </p>

          <p>
            Genpire also provides insights into the sourcing process. Not sure
            where to start looking? Genpire's platform and community content can
            point you toward directories or partner suppliers by product type.
            And because the AI knows your product details, it can suggest what
            kind of manufacturer you need (a plastics molder vs. a metal
            fabricator, small workshop vs. large-scale factory, etc.). This
            helps you target your search to the right candidates.
          </p>

          <p>
            Once you send out your tech pack to a shortlist of factories, you
            can compare responses easily. Since each supplier is quoting based
            on the same information, it's an apples-to-apples comparison. You'll
            quickly see who offers the best terms, timeline, and quality
            communication.
          </p>

          <p>
            What used to take months of emails and sample sending can now be
            done in a fraction of the time. Smart sourcing is about being
            prepared and informed – and with AI, even first-time founders can do
            it like a pro.
          </p>

          <p className="text-lg font-semibold">
            Ready to meet your perfect manufacturing match? Use Genpire to
            streamline the search and get your product into the right hands.
            Sign up with Genpire and take the fast track from idea to factory
            floor.
          </p>
        </div>
      </article>
    </div>
  );
}
