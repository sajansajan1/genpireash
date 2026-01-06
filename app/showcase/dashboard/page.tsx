import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardDemo } from "@/components/showcase/dashboard-demo";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function DashboardShowcasePage() {
  // Define the dashboard features
  const features = [
    {
      title: "Tech Pack Creator Dashboard",
      description: "Essential tools for creators to manage their product development",
      details: [
        "Tech Pack Management - Create, edit, and organize your tech packs",
        "Supplier Search - Find and connect with the perfect manufacturers",
        "RFQ Management - Send and track requests for quotes",
        "Settings & Billing - Manage your account and subscription",
      ],
      link: "/creator-dashboard",
    },
    {
      title: "Supplier Dashboard",
      description: "Streamlined interface for suppliers to manage client requests",
      details: [
        "RFQ Management - Respond to quote requests from creators",
        "Tech Pack Requests - View and manage tech packs sent by creators",
        "Creator Invitations - Generate links to invite creators to send tech packs",
        "Company Profile - Showcase your capabilities to potential clients",
      ],
      link: "/supplier-dashboard",
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <Button asChild variant="outline" className="mb-6">
          <Link href="/showcase">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Showcase
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-4">MVP Dashboard Features</h1>
        <p className="text-lg text-[#1C1917] max-w-2xl">
          Explore our simplified dashboards for both creators and suppliers, focusing on the core features needed to
          bring products to life.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Interactive Dashboard Demo</h2>
        <DashboardDemo />
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold mb-6">Key Features</h2>

        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                {feature.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>

              {feature.link && (
                <Button asChild>
                  <Link href={feature.link}>
                    Try {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-[#1C1917] mb-4">Ready to explore the full dashboards?</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button asChild size="lg">
            <Link href="/creator-dashboard">
              Creator Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/supplier-dashboard">
              Supplier Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
