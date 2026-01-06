import React, { useState } from "react";
import { FilePlus2, Edit3, Factory, Rocket, ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  VisuallyHidden,
} from "@/components/ui/alert-dialog";

interface ProductGuideModalProps {
  onClose?: () => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (value: boolean) => void;
}

const ProductGuideModal = ({ onClose, isDemoModalOpen, setIsDemoModalOpen }: ProductGuideModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Start with a Detailed Prompt or Upload a Sketch",
      text: "Genpire generates multiple product visuals you can select and refine — no design software or prior experience required.",
      img: "/detailedPrompt.png",
    },
    {
      title: "Edit & Improve in the AI Editor",
      text: "Make fast visual and technical updates using prompts or micro edits: change colors, materials, ask questions, and get AI-driven insights before wrapping up for manufacturing.",
      img: "/aiEditor.png",
    },
    {
      title: "Generate Factory-Ready Tech Files",
      text: "With one click, Genpire produces a complete production package — specs, measurements, materials, construction notes, and all files needed to request quotes from suppliers.",
      img: "/technicalImage.png",
    },
    {
      title: "Unlock Pro Mode (Recommended)",
      text: (
        <>
          Get the full AI-native workflow and experience of Genpire, including:
          <ul className="list-disc list-inside mt-2 text-[#1C1917] dark:text-stone-200 text-sm space-y-1 text-left">
            <li>
              <strong>Brand DNA Engine</strong> – Train the AI on your brand style, materials, voice & product history
              so Genpire designs like your team would.
            </li>
            <li>
              <strong>Collection Generator</strong> – Create full product lines in one click, not just single items.
            </li>
            <li>
              <strong>AI Try-On Studio</strong> – Preview products in real-world scenes before production.
            </li>
            <li>Full access to new and exciting features for individual creators and teams alike.</li>
          </ul>
        </>
      ),
      img: "/dnaStudio.png",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
    else onClose?.();
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const step = steps[currentStep];

  return (
    <AlertDialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
      <AlertDialogContent className="fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide bg-white rounded-2xl border p-0 shadow-xl">
        <VisuallyHidden>
          <AlertDialogTitle>Product Guide</AlertDialogTitle>
        </VisuallyHidden>
        <div className="p-4">
          <div className="px-2 sm:p-0 py-0 flex justify-end">
            <button onClick={() => setIsDemoModalOpen(false)} className="text-black hover:text-black font-medium">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="w-full px-4 py-4 text-[#1C1917] dark:text-gray-100">
            {/* Title */}
            <h2 className="text-xl font-bold text-center mb-2">How It Works?</h2>

            {/* Step Card */}
            <div className="flex flex-col items-center text-center gap-3 p-4 rounded-md bg-gray-50 dark:bg-stone-800 shadow-sm transition-colors">
              <div className="w-full max-h-[450px] bg-white dark:bg-stone-700 border border-gray-200 dark:border-stone-600 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={step.img} alt={step.title} className="w-full h-auto max-h-[450px] object-contain" />
              </div>

              <div>
                <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                <p className="text-sm text-stone-800 dark:text-gray-300 leading-snug">
                  {typeof step.text === "string" ? step.text : null}
                </p>
                {typeof step.text !== "string" && step.text}
              </div>
            </div>
            {/* Navigation */}
            <div className="flex justify-between items-center mt-5">
              {/* Back Button */}
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 text-xs font-medium ${
                  currentStep === 0 ? "opacity-50 cursor-not-allowed" : "hover:underline"
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>

              {/* Step Counter */}
              <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                {currentStep + 1}/{steps.length}
              </span>

              {/* Next / Finish Button */}
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 text-xs font-medium text-[#1C1917] dark:text-stone-200 hover:underline"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="text-xs font-medium text-[#1C1917] dark:text-stone-200 hover:underline"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProductGuideModal;
