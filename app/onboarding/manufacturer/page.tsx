"use client";

import { useState, useCallback } from "react";
import { Volkhov } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Factory, Globe, Package, CheckCircle } from "lucide-react";
import { IntroStep } from "@/components/onboarding/manufacturer/intro-step";
import { CompanyInfoStep } from "@/components/onboarding/manufacturer/company-info-step";
import { CapabilitiesStep } from "@/components/onboarding/manufacturer/capabilities-step";
import { ConfirmationStep } from "@/components/onboarding/manufacturer/confirmation-step";
import { useToast } from "@/hooks/use-toast";
import { createSupplierProfile, manufacturingCapabilities } from "@/lib/supabase/supplier";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/auth-service";
import { useUser } from "@/components/messages/session";
import { sendSupplierApplication } from "@/app/actions/send-mail";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function ManufacturerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const user = useUser();
  const router = useRouter();
  const steps = [
    { title: "Welcome", icon: <Factory className="h-5 w-5" /> },
    { title: "Company Info", icon: <Globe className="h-5 w-5" /> },
    { title: "Capabilities", icon: <Package className="h-5 w-5" /> },
    { title: "Confirmation", icon: <CheckCircle className="h-5 w-5" /> },
  ];

  const updateFormData = useCallback((newData: Record<string, any>) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
  }, []);

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const { companyName, contactName, email, location, website, phone } = formData;

      if (!companyName || !contactName || !email || !location || !website || !phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields: Company Name, Contact Name, and Email.",
          variant: "destructive",
        });
        return;
      }

      const manufacturingData = {
        product_categories: formData.product_categories || [],
        material_specialist: formData.material_specialist || [],
        moq: formData.moq || "0",
        leadTimeMin: formData.leadTimeMin || "0",
        leadTimeMax: formData.leadTimeMax || "0",
        samplePricing: formData.samplePricing || "0",
        productionCapacity: formData.productionCapacity || "0",
        certifications: formData.certifications || [],
        isExclusive: formData.isExclusive || false,
        aboutFactory: formData.aboutFactory || "",
        product_capability: formData.product_capability || [],
        export_market: formData.export_market || [],
      };
      const result = await manufacturingCapabilities(manufacturingData);
      if (!result) throw new Error("Failed to create supplier profile.");
      const supplierProfileData = {
        company_name: companyName,
        location: formData.location,
        website: formData.website,
        company_description: formData.companyDescription || "",
        email,
        contact: formData.phone,
        full_name: contactName,
        address: formData.address,
        company_logo: formData.companyLogo,
        manufacturingID: result.id,
      };
      const supplierProfile = await createSupplierProfile(supplierProfileData);
      const checked = await updateUserProfile();
      if (supplierProfile?.id) {
        setSubmissionResult({
          success: true,
          message: "Supplier profile and manufacturing capabilities submitted successfully!",
        });
        toast({
          title: "success",
          description: "Supplier profile and manufacturing capabilities submitted successfully!",
          variant: "default",
        });
        await sendSupplierApplication({
          email: email,
          supplierName: companyName,
        });
        setCurrentStep(3);
        // router.push("/supplier-dashboard");
      } else {
        throw new Error("Failed to submit manufacturing capabilities.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setSubmissionResult({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      });
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <IntroStep onNext={handleNextStep} />;
      case 1:
        return <CompanyInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return (
          <>
            <CapabilitiesStep formData={formData} updateFormData={updateFormData} />
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Submitting...</span>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    Submit Application <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        );
      case 3:
        return <ConfirmationStep submissionResult={submissionResult} />;
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 `}>Become a Genpire Supplier</h1>
        <p className="text-[#1C1917]">
          Join our network of vetted manufacturers and connect with product creators worldwide.
        </p>
      </div>

      {currentStep < steps.length - 1 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {steps.length - 1}: {steps[currentStep].title}
            </span>
            <span className="text-sm text-[#1C1917]">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      <Card className="p-6 md:p-8">
        {renderStepContent()}

        {currentStep > 0 && currentStep < steps.length - 1 && currentStep !== 2 && (
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
