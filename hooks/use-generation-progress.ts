"use client";

import { useState, useCallback, useRef } from "react";

interface LoadingStep {
  text: string;
  duration: number;
  info: string;
  generatesImage?: string;
}

export const loadingSteps: LoadingStep[] = [
  {
    text: "Analyzing your product description",
    duration: 5000,
    info: "Understanding your vision and extracting key product features",
  },
  {
    text: "Understanding product requirements",
    duration: 4000,
    info: "Identifying materials, dimensions, and technical specifications",
  },
  {
    text: "Generating front view",
    duration: 12000,
    generatesImage: "front",
    info: "Creating the primary product view with all details",
  },
  {
    text: "Perfecting details and composition",
    duration: 6000,
    info: "Enhancing quality and ensuring photorealistic rendering",
  },
  {
    text: "Auto-approving front view",
    duration: 3000,
    info: "Validating the front view meets quality standards",
  },
  {
    text: "Extracting colors and materials",
    duration: 5000,
    info: "Analyzing the approved front view for consistency",
  },
  {
    text: "Creating back view",
    duration: 10000,
    generatesImage: "back",
    info: "Generating rear view matching front specifications",
  },
  {
    text: "Generating side profile view",
    duration: 10000,
    generatesImage: "side",
    info: "Creating lateral view for complete visualization",
  },
  {
    text: "Analyzing fabric and textures",
    duration: 5000,
    info: "Documenting material properties and surface details",
  },
  {
    text: "Building technical specifications",
    duration: 6000,
    info: "Compiling comprehensive product documentation",
  },
  {
    text: "Compiling measurement charts",
    duration: 4000,
    info: "Creating size guides and dimension tables",
  },
  {
    text: "Finalizing your tech pack",
    duration: 3000,
    info: "Assembling all components into your complete tech pack",
  },
  {
    text: "Quality check complete",
    duration: 2500,
    info: "Your professional tech pack is ready!",
  },
];

export const funFacts = [
  "Did you know? Our AI analyzes over 1000 design parameters",
  "Each view is carefully aligned for manufacturing accuracy",
  "Your tech pack will include all specifications needed for production",
  "Tip: You can edit your tech pack after generation",
  "Our AI ensures dimensional consistency across all views",
  "Pro tip: Save multiple versions to compare different designs",
  "Each image is generated at high resolution for printing",
  "The stepped process ensures perfect view alignment",
];

export function useGenerationProgress() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentFunFact, setCurrentFunFact] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<{
    front?: string;
    back?: string;
    side?: string;
  }>({});

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const funFactIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = useCallback(() => {
    setIsLoading(true);
    setCurrentStep(0);
    setStepProgress(0);
    setElapsedTime(0);
    setCurrentFunFact(0);
    setGeneratedImages({});

    // Start progress animation
    let currentStepIndex = 0;
    let accumulatedTime = 0;

    progressIntervalRef.current = setInterval(() => {
      if (currentStepIndex < loadingSteps.length) {
        const currentStepDuration = loadingSteps[currentStepIndex].duration;

        // Update progress within current step
        setStepProgress((prev) => {
          const newProgress = Math.min(
            prev + 100 / (currentStepDuration / 100),
            100
          );

          // Move to next step when current step is complete
          if (
            newProgress >= 100 &&
            currentStepIndex < loadingSteps.length - 1
          ) {
            currentStepIndex++;
            setCurrentStep(currentStepIndex);
            accumulatedTime += currentStepDuration;
            return 0; // Reset progress for new step
          }

          return newProgress;
        });

        setElapsedTime((prev) => prev + 100);
      }
    }, 100);

    // Rotate fun facts every 4 seconds
    funFactIntervalRef.current = setInterval(() => {
      setCurrentFunFact((prev) => (prev + 1) % funFacts.length);
    }, 4000);
  }, []);

  const stopProgress = useCallback(() => {
    setIsLoading(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (funFactIntervalRef.current) {
      clearInterval(funFactIntervalRef.current);
      funFactIntervalRef.current = null;
    }
  }, []);

  const updateGeneratedImages = useCallback(
    (images: { front?: string; back?: string; side?: string }) => {
      setGeneratedImages((prev) => ({ ...prev, ...images }));
    },
    []
  );

  return {
    // State
    isLoading,
    currentStep,
    stepProgress,
    elapsedTime,
    currentFunFact,
    generatedImages,
    // Actions
    startProgress,
    stopProgress,
    updateGeneratedImages,
    // Constants
    loadingSteps,
    funFacts,
  };
}
