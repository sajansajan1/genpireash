"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Sparkles, CheckCircle2, AlertCircle, Loader2, RotateCw, ArrowRight } from "lucide-react";
import { FrontViewApproval } from "./front-view-approval";
import { ViewsDisplay } from "./views-display";
import Image from "next/image";

interface SteppedGenerationWorkflowProps {
  sessionId?: string;
  onComplete?: (data: { frontView: string; backView: string; sideView: string; extractedFeatures: any }) => void;
}

type WorkflowStep = "input" | "front-generation" | "front-approval" | "additional-generation" | "complete";

export function SteppedGenerationWorkflow({ sessionId: initialSessionId, onComplete }: SteppedGenerationWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("input");
  const [inputType, setInputType] = useState<"text" | "image">("text");
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Workflow state
  const [sessionId, setSessionId] = useState(initialSessionId || "");
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [frontViewData, setFrontViewData] = useState<{
    url: string;
    prompt: string;
  } | null>(null);
  const [additionalViews, setAdditionalViews] = useState<{
    back: { url: string; prompt: string };
    side: { url: string; prompt: string };
  } | null>(null);
  const [extractedFeatures, setExtractedFeatures] = useState<any>(null);

  // Handle file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Generate front view
  const generateFrontView = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const input =
        inputType === "text"
          ? { type: "text" as const, content: textInput }
          : { type: "image" as const, content: imagePreview || "" };

      const response = await fetch("/api/product-pack-generation/generate-front-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          sessionId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to generate front view");
      }

      setApprovalId(result.approvalId);
      setSessionId(result.sessionId);
      setFrontViewData({
        url: result.frontView.url,
        prompt: result.frontView.prompt,
      });
      setCurrentStep("front-approval");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle front view approval
  const handleFrontViewApproval = async (feedback?: string) => {
    if (!approvalId) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/product-pack-generation/approve-front-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          approved: true,
          feedback,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to approve front view");
      }

      setExtractedFeatures(result.extractedFeatures);
      setCurrentStep("additional-generation");

      // Automatically generate additional views
      await generateAdditionalViews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
      setIsProcessing(false);
    }
  };

  // Handle front view rejection
  const handleFrontViewRejection = async (feedback: string) => {
    if (!approvalId) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/product-pack-generation/approve-front-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          approved: false,
          feedback,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to request revision");
      }

      // Reset to regenerate
      setCurrentStep("front-generation");
      await generateFrontView();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revision request failed");
      setIsProcessing(false);
    }
  };

  // Generate additional views
  const generateAdditionalViews = async () => {
    if (!approvalId) return;

    try {
      const response = await fetch("/api/product-pack-generation/generate-additional-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to generate additional views");
      }

      setAdditionalViews(result.views);
      setCurrentStep("complete");

      // Trigger completion callback
      if (onComplete && frontViewData) {
        onComplete({
          frontView: frontViewData.url,
          backView: result.views.back.url,
          sideView: result.views.side.url,
          extractedFeatures,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Additional views generation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Get progress percentage
  const getProgress = () => {
    const steps: WorkflowStep[] = ["input", "front-generation", "front-approval", "additional-generation", "complete"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Reset workflow
  const resetWorkflow = () => {
    setCurrentStep("input");
    setTextInput("");
    setImageFile(null);
    setImagePreview(null);
    setApprovalId(null);
    setFrontViewData(null);
    setAdditionalViews(null);
    setExtractedFeatures(null);
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-[#1C1917]">
          <span>
            Step{" "}
            {currentStep === "input"
              ? 1
              : currentStep === "front-generation" || currentStep === "front-approval"
              ? 2
              : currentStep === "additional-generation"
              ? 3
              : 4}{" "}
            of 4
          </span>
          <span>{Math.round(getProgress())}% Complete</span>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step: Input */}
      {currentStep === "input" && (
        <Card>
          <CardHeader>
            <CardTitle>Product Description</CardTitle>
            <CardDescription>Describe your product or upload a reference image to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputType} onValueChange={(v) => setInputType(v as "text" | "image")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text Description</TabsTrigger>
                <TabsTrigger value="image">Reference Image</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <Textarea
                  placeholder="Describe your product in detail..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[150px]"
                />
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative w-48 h-48 mx-auto">
                        <Image src={imagePreview} alt="Reference" fill className="object-contain rounded" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-[#1C1917]" />
                      <p className="text-sm text-[#1C1917]">Click to upload reference image</p>
                    </label>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={() => {
                setCurrentStep("front-generation");
                generateFrontView();
              }}
              disabled={(inputType === "text" && !textInput.trim()) || (inputType === "image" && !imagePreview)}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Front View
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Front Generation */}
      {currentStep === "front-generation" && isProcessing && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
              <p className="text-lg font-medium">Generating Front View...</p>
              <p className="text-sm text-[#1C1917]">Creating the primary reference image for your product</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Front Approval */}
      {currentStep === "front-approval" && frontViewData && approvalId && (
        <FrontViewApproval
          approvalId={approvalId}
          frontViewUrl={frontViewData.url}
          status="pending"
          onApprove={handleFrontViewApproval}
          onReject={handleFrontViewRejection}
          isProcessing={isProcessing}
        />
      )}

      {/* Step: Additional Generation */}
      {currentStep === "additional-generation" && isProcessing && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
              <p className="text-lg font-medium">Generating Additional Views...</p>
              <p className="text-sm text-[#1C1917]">Creating back and side views based on the approved front view</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Complete */}
      {currentStep === "complete" && frontViewData && additionalViews && (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All product views have been generated successfully!
            </AlertDescription>
          </Alert>

          <ViewsDisplay
            frontView={frontViewData.url}
            backView={additionalViews.back.url}
            sideView={additionalViews.side.url}
            extractedFeatures={extractedFeatures}
          />

          <div className="flex gap-2">
            <Button onClick={resetWorkflow} variant="outline" className="flex-1">
              <RotateCw className="mr-2 h-4 w-4" />
              Start New Generation
            </Button>
            <Button className="flex-1">
              <ArrowRight className="mr-2 h-4 w-4" />
              Continue to Tech Pack
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
