import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeatureShowcase } from "@/components/showcase/feature-showcase";
import { featureScreenshots } from "@/components/showcase/feature-screenshots";
import { ArrowLeft } from "lucide-react";

export default function TechPacksShowcasePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <Button asChild variant="outline" className="mb-6">
          <Link href="/showcase/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard Showcase
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-4">Tech Packs Management</h1>
        <p className="text-lg text-[#1C1917] max-w-2xl">
          Our comprehensive tech pack management system allows creators to organize, track, and share their product
          specifications.
        </p>
      </div>

      <div className="mb-12">
        <FeatureShowcase
          title="Intuitive Tech Pack Dashboard"
          description="Manage all your tech packs in one place with our intuitive dashboard interface."
          imageSrc={featureScreenshots.techpacks}
          imageAlt="Tech Pack Dashboard"
          link="/creator-dashboard/techpacks"
          linkText="Try Tech Pack Dashboard"
          features={[
            "View all tech packs in a grid layout with filtering options",
            "Search functionality to quickly find specific tech packs",
            "Status indicators for tracking progress",
            "Quick actions for editing, duplicating, and deleting tech packs",
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Filtering and Sorting</CardTitle>
            <CardDescription>Quickly find the tech packs you need</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Our advanced filtering system allows you to sort tech packs by status, date, and more. The search
              functionality helps you quickly locate specific tech packs by name or description.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Tracking</CardTitle>
            <CardDescription>Monitor the progress of your tech packs</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Each tech pack displays its current status, allowing you to easily track which ones are in draft, in
              progress, or completed. This helps you prioritize your work and stay organized.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Efficiently manage your tech packs</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Perform common actions like editing, duplicating, and deleting tech packs directly from the dashboard.
              This streamlines your workflow and saves you time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed View</CardTitle>
            <CardDescription>Access all the information you need</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Click on any tech pack to view its detailed specifications, including materials, measurements,
              construction notes, and more. All the information is organized in an easy-to-read format.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[#1C1917] mb-4">Ready to manage your tech packs?</p>
        <Button asChild size="lg">
          <Link href="/creator-dashboard/techpacks">Go to Tech Packs Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
