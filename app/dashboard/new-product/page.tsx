"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductIdeaForm } from "@/components/new-product/product-idea-form";
import { ProductCustomizationForm } from "@/components/new-product/product-customization-form";
import { ProductSamplesGrid } from "@/components/new-product/product-samples-grid";
import { ProductTechPack } from "@/components/new-product/product-tech-pack";
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { Volkhov } from "next/font/google";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function NewProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("idea");
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productType: "",
    ideaPrompt: "",
    referenceImage: null,
    customizationOptions: {
      materials: [],
      colors: [],
      sizes: [],
      features: [],
      packaging: "",
    },
  });

  const [isFormValid, setIsFormValid] = useState({
    idea: false,
    customization: false,
    samples: false,
  });

  const updateFormData = React.useCallback((data: Partial<typeof formData>) => {
    setFormData((prev) => {
      // Only update if there are actual changes
      const hasChanges = Object.entries(data).some(([key, value]) => {
        // Handle nested objects like customizationOptions
        if (typeof value === "object" && value !== null && typeof prev[key as keyof typeof prev] === "object") {
          return JSON.stringify(value) !== JSON.stringify(prev[key as keyof typeof prev]);
        }
        return prev[key as keyof typeof prev] !== value;
      });

      if (!hasChanges) return prev;
      return { ...prev, ...data };
    });
  }, []);

  // Validate the current step
  useEffect(() => {
    // Idea step validation
    if (formData.productType.length >= 2 && formData.ideaPrompt.length >= 10) {
      setIsFormValid((prev) => ({ ...prev, idea: true }));
    } else {
      setIsFormValid((prev) => ({ ...prev, idea: false }));
    }

    // Customization step validation - now only requires colors
    if (formData.customizationOptions.colors.length >= 1) {
      setIsFormValid((prev) => ({ ...prev, customization: true }));
    } else {
      setIsFormValid((prev) => ({ ...prev, customization: false }));
    }

    // Samples step validation
    if (selectedSample) {
      setIsFormValid((prev) => ({ ...prev, samples: true }));
    } else {
      setIsFormValid((prev) => ({ ...prev, samples: false }));
    }
  }, [formData, selectedSample]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleNext = () => {
    if (activeTab === "idea" && isFormValid.idea) {
      setActiveTab("customization");
    } else if (activeTab === "customization" && isFormValid.customization) {
      setActiveTab("samples");
    } else if (activeTab === "samples" && isFormValid.samples) {
      setActiveTab("techpack");
    } else if (activeTab === "techpack") {
      // Submit the form
      console.log("Submitting form data:", formData);
      console.log("Selected sample:", selectedSample);
      // Redirect to the quotes page
      router.push("/dashboard/quotes");
    }
  };

  const handleBack = () => {
    if (activeTab === "customization") {
      setActiveTab("idea");
    } else if (activeTab === "samples") {
      setActiveTab("customization");
    } else if (activeTab === "techpack") {
      setActiveTab("samples");
    }
  };

  const handleSampleSelect = (sampleId: string) => {
    setSelectedSample(sampleId);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${volkhov.className}`}>Create New Product</h1>
          <p className="text-[#1C1917] mt-1">Let our AI help turn your product idea into reality.</p>
        </div>
        <Button variant="outline" className="mt-4 md:mt-0 flex items-center gap-2 bg-transparent">
          <Upload className="h-4 w-4" /> Upload Your Design
        </Button>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger
              value="idea"
              disabled={
                activeTab !== "idea" &&
                activeTab !== "customization" &&
                activeTab !== "samples" &&
                activeTab !== "techpack"
              }
            >
              <span className="flex items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-zinc-900-foreground mr-2 text-xs">
                  1
                </span>
                Describe Idea
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="customization"
              disabled={activeTab !== "customization" && activeTab !== "samples" && activeTab !== "techpack"}
            >
              <span className="flex items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-zinc-900-foreground mr-2 text-xs">
                  2
                </span>
                Customize
              </span>
            </TabsTrigger>
            <TabsTrigger value="samples" disabled={activeTab !== "samples" && activeTab !== "techpack"}>
              <span className="flex items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-zinc-900-foreground mr-2 text-xs">
                  3
                </span>
                Select Sample
              </span>
            </TabsTrigger>
            <TabsTrigger value="techpack" disabled={activeTab !== "techpack"}>
              <span className="flex items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-zinc-900-foreground mr-2 text-xs">
                  4
                </span>
                Tech Pack
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="idea" className="mt-0">
            <ProductIdeaForm formData={formData} updateFormData={updateFormData} />
          </TabsContent>

          <TabsContent value="customization" className="mt-0">
            <ProductCustomizationForm formData={formData} updateFormData={updateFormData} />
          </TabsContent>

          <TabsContent value="samples" className="mt-0">
            <ProductSamplesGrid
              productType={formData.productType}
              selectedSample={selectedSample}
              onSelectSample={handleSampleSelect}
            />
          </TabsContent>

          <TabsContent value="techpack" className="mt-0">
            <ProductTechPack
              productType={formData.productType}
              sampleId={selectedSample || ""}
              customizationOptions={formData.customizationOptions}
            />
          </TabsContent>

          <Separator className="my-6" />

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={activeTab === "idea"}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {activeTab !== "techpack" ? (
              <Button
                onClick={handleNext}
                disabled={
                  (activeTab === "idea" && !isFormValid.idea) ||
                  (activeTab === "customization" && !isFormValid.customization) ||
                  (activeTab === "samples" && !isFormValid.samples)
                }
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Request Quotes <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
