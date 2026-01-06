"use client";

import { SteppedGenerationWorkflow } from "@/components/tech-pack/stepped-generation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function SteppedGenerationDemo() {
  const handleComplete = (data: { frontView: string; backView: string; sideView: string; extractedFeatures: any }) => {
    console.log("Generation complete:", data);
    // Here you would typically save the data or navigate to the tech pack creation
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Stepped Image Generation</h1>
        <p className="text-[#1C1917]">Generate consistent product views with approval workflow</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          This workflow ensures consistency across all product views. The front view is generated first and requires
          your approval before generating the back and side views. This ensures all views maintain the same colors,
          materials, and design elements.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Product View Generation</CardTitle>
          <CardDescription>Follow the steps below to generate all product views</CardDescription>
        </CardHeader>
        <CardContent>
          <SteppedGenerationWorkflow onComplete={handleComplete} />
        </CardContent>
      </Card>
    </div>
  );
}
