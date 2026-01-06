"use client";

import React, { useState, useEffect } from "react";
import { GenerationProgressModal } from "./generation-progress-modal";
import { AIImageEditor } from "./ai-image-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Edit3, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { applyAIImageEdit, saveInitialRevisions } from "@/app/actions/ai-image-edit";

interface GeneratedImage {
  url: string;
  prompt_used?: string;
}

interface GenerationFlowProps {
  isGenerating: boolean;
  generatedImages: {
    front?: GeneratedImage;
    back?: GeneratedImage;
    side?: GeneratedImage;
    bottom?: GeneratedImage;
    illustration?: GeneratedImage;
  };
  productId: string;
  productName: string;
  onComplete: (finalImages: any) => void;
  currentStep?: number;
  stepProgress?: number;
  elapsedTime?: number;
  currentFunFact?: number;
}

export function EnhancedGenerationFlow({
  isGenerating,
  generatedImages,
  productId,
  productName,
  onComplete,
  currentStep = 0,
  stepProgress = 0,
  elapsedTime = 0,
  currentFunFact = 0,
}: GenerationFlowProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"generating" | "editing" | "complete">("generating");
  const [editorImages, setEditorImages] = useState<any[]>([]);
  const [hasEditedImages, setHasEditedImages] = useState(false);

  // Convert generated images to editor format when generation completes
  useEffect(() => {
    if (!isGenerating && generatedImages.front && currentPhase === "generating") {
      const images = Object.entries(generatedImages)
        .filter(([_, value]) => value?.url)
        .map(([type, image]) => ({
          type,
          url: image.url,
          revisions: [
            {
              id: `initial-${type}`,
              revisionNumber: 1,
              imageUrl: image.url,
              editType: "initial" as const,
              createdAt: new Date().toISOString(),
              isActive: true,
            },
          ],
        }));

      setEditorImages(images);

      // Save initial revisions to database
      saveInitialRevisions(productId, generatedImages);

      // Automatically transition to editing phase
      setTimeout(() => {
        setCurrentPhase("editing");
        setShowEditor(true);
      }, 1500);
    }
  }, [isGenerating, generatedImages, currentPhase, productId]);

  const handleEditImage = async (viewType: string, currentImageUrl: string, editPrompt: string) => {
    try {
      const result = await applyAIImageEdit({
        productId,
        viewType: viewType as any,
        currentImageUrl,
        editPrompt,
      });

      if (result.success && result.url) {
        setHasEditedImages(true);
        return {
          success: true,
          url: result.url,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Edit failed:", error);
      return {
        success: false,
        url: currentImageUrl, // Return current image URL on error
        error: error.message,
      };
    }
  };

  const handleSaveEdits = async (updatedImages: any[]) => {
    // Get the active revision for each view
    const finalImages: any = {};

    updatedImages.forEach((view) => {
      const activeRevision = view.revisions.find((r: any) => r.isActive);
      if (activeRevision) {
        finalImages[view.type] = {
          url: activeRevision.imageUrl,
          prompt_used: activeRevision.editPrompt || "",
        };
      }
    });

    setCurrentPhase("complete");
    onComplete(finalImages);

    toast({
      title: "Images Finalized",
      description: hasEditedImages
        ? "Your edited images have been saved successfully."
        : "Your product images are ready.",
    });
  };

  const handleSkipEditing = () => {
    setCurrentPhase("complete");
    onComplete(generatedImages);

    toast({
      title: "Images Confirmed",
      description: "Proceeding with the original generated images.",
    });
  };

  // Show progress modal during generation
  if (currentPhase === "generating") {
    return (
      <GenerationProgressModal
        isLoading={isGenerating}
        currentStep={currentStep}
        stepProgress={stepProgress}
        elapsedTime={elapsedTime}
        currentFunFact={currentFunFact}
        generatedImages={{
          front: generatedImages.front?.url,
          back: generatedImages.back?.url,
          side: generatedImages.side?.url,
        }}
      />
    );
  }

  // Show editing phase
  if (currentPhase === "editing") {
    return (
      <>
        <AnimatePresence>
          {!showEditor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur z-50 flex items-center justify-center p-4"
            >
              <Card className="max-w-2xl w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    Images Generated Successfully!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(generatedImages)
                      .filter(([_, value]) => value?.url)
                      .slice(0, 3)
                      .map(([type, image]) => (
                        <div key={type} className="space-y-2">
                          <img
                            src={image.url}
                            alt={`${type} view`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <Badge variant="secondary" className="w-full justify-center capitalize">
                            {type}
                          </Badge>
                        </div>
                      ))}
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-zinc-900 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">AI Image Editor Available</h4>
                        <p className="text-sm text-[#1C1917]">
                          You can now make micro-edits to perfect your product images. Adjust colors, materials,
                          details, or any aspect with simple text prompts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleSkipEditing}>
                      Continue Without Editing
                    </Button>
                    <Button className="flex-1" onClick={() => setShowEditor(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Open AI Editor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AIImageEditor
          isOpen={showEditor}
          onClose={() => {
            if (!hasEditedImages) {
              // If no edits were made, ask for confirmation
              if (confirm("Are you sure you want to continue without editing?")) {
                handleSkipEditing();
              }
            } else {
              setShowEditor(false);
            }
          }}
          images={editorImages}
          productId={productId}
          productName={productName}
          onEditImage={handleEditImage}
          onSave={handleSaveEdits}
        />
      </>
    );
  }

  // Show completion phase
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-background/80 backdrop-blur z-50 flex items-center justify-center p-4"
    >
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Tech Pack Ready!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#1C1917]">
            Your product images have been finalized and your tech pack is ready for review.
          </p>

          {hasEditedImages && (
            <Badge variant="outline" className="w-full justify-center py-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Images enhanced with AI edits
            </Badge>
          )}

          <Button className="w-full" onClick={() => window.location.reload()}>
            View Tech Pack
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
