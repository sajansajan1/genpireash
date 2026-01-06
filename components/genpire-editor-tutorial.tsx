"use client";
import React, { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

interface TourTutorialProps {
  onClose: () => void;
}

const steps = [
  {
    title: "Micro Edits",
    description:
      "Make small, precise adjustments to your product visuals — like changing materials, colors, proportions, or adding design elements. Perfect for refining your product without starting a full new generation.",
    target: "#micro-edits",
  },
  {
    title: "Revisions",
    description:
      "Every generation you make is saved as a revision. Select a previous revision to apply new edits directly on it — this keeps your creative history organized and easy to compare.",
    target: "#revisions",
  },
  {
    title: "Generate Tech Pack",
    description:
      "Once your product looks right, click “Generate Tech Pack” to produce detailed production files. Includes specifications, measurements, annotations, and factory-ready documentation for manufacturing.",
    target: "#tech-pack",
  },
];

const GenpireTourTutorialModal: React.FC<TourTutorialProps> = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 text-foreground rounded-lg shadow-xl max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

        <div className="flex justify-between items-center">
          <button
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((i) => i - 1)}
            className={`flex items-center gap-1 text-sm ${
              stepIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:underline"
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {stepIndex < steps.length - 1 ? (
            <button
              onClick={() => setStepIndex((i) => i + 1)}
              className="flex items-center gap-1 text-sm font-medium text-[#1C1917] dark:text-stone-200 hover:underline"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={onClose} className="text-sm font-medium text-[#1C1917] dark:text-stone-200 hover:underline">
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenpireTourTutorialModal;
