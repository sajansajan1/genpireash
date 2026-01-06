import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GenpireLogo } from "@/components/ui/genpire-logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Showcase | Genpire",
  description:
    "Explore Genpire's streamlined dashboards for tech pack creation, supplier matching, and manufacturing management.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <LandingNavbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto py-12 px-4 space-y-16">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <GenpireLogo className="scale-150" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-zinc-900">Genpire Platform Showcase</h1>
            <p className="text-xl text-zinc-900/70 max-w-3xl mx-auto">
              Explore our streamlined dashboards for tech pack creation, supplier matching, and manufacturing
              management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-zinc-900">Creator Dashboard</CardTitle>
                <CardDescription className="text-zinc-900/70">
                  For fashion designers and product creators to generate tech packs and connect with manufacturers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image src="/creator-dashboard-simple.png" alt="Creator Dashboard" fill className="object-cover" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-6">
                <Button asChild className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                  <Link href="/creator-dashboard">Try Creator Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                >
                  <Link href="/showcase/dashboard">View Demo</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-zinc-900">Supplier Dashboard</CardTitle>
                <CardDescription className="text-zinc-900/70">
                  For manufacturers and suppliers to manage tech packs and respond to production requests
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image src="/supplier-dashboard-simple.png" alt="Supplier Dashboard" fill className="object-cover" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-6">
                <Button asChild className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                  <Link href="/supplier-dashboard">Try Supplier Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                >
                  <Link href="/showcase/dashboard">View Demo</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Key Features</h2>
              <p className="text-zinc-900/70 mt-2">Explore the core functionality that powers the Genpire platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-zinc-900">AI-Powered Tech Packs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
                    <Image
                      src="/tech-pack-dashboard.png"
                      alt="Tech Pack Dashboard"
                      width={600}
                      height={338}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-zinc-900/70">
                    Generate comprehensive tech packs with AI assistance, including materials, measurements, and
                    construction details.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                  >
                    <Link href="/showcase/techpacks">View Tech Packs</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-zinc-900">Supplier Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
                    <Image
                      src="/supplier-match-interface.png"
                      alt="Supplier Matching"
                      width={600}
                      height={338}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-zinc-900/70">
                    Connect with the perfect manufacturing partners based on your product requirements and their
                    capabilities.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                  >
                    <Link href="/creator-dashboard/suppliers">Explore Suppliers</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-zinc-900">RFQ Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
                    <Image
                      src="/streamlined-supplier-overview.png"
                      alt="RFQ Management"
                      width={600}
                      height={338}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-zinc-900/70">
                    Streamlined request for quote process with automated pricing suggestions and supplier response
                    tracking.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
                  >
                    <Link href="/supplier-dashboard/rfqs">View RFQs</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          <div className="text-center pt-8">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-zinc-900">Ready to get started?</h2>
            <p className="text-xl text-zinc-900/70 max-w-2xl mx-auto mb-8">
              Join Genpire today and transform your product development process with AI-powered tech packs and supplier
              matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-taupe hover:bg-taupe/90 text-zinc-900">
                <Link href="/signup">Sign Up Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-navy text-zinc-900 hover:bg-black/10 bg-transparent"
              >
                <Link href="/waitlist">Join the Waitlist</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
