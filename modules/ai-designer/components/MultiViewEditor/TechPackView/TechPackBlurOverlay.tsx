/**
 * TechPackBlurOverlay Component
 * Blur overlay shown when tech pack is not generated
 * Shows generation button or progress
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Package, Loader2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TECH_PACK_CREDITS } from "../../../types/techPack";

interface TechPackBlurOverlayProps {
  isGenerating: boolean;
  generationProgress?: number;
  generationStep?: string;
  onGenerate: () => Promise<void>;
  isDemo?: boolean;
}

export function TechPackBlurOverlay({
  isGenerating,
  generationProgress = 0,
  generationStep,
  onGenerate,
  isDemo = false,
}: TechPackBlurOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        {isGenerating ? (
          <>
            <div className="mx-auto w-20 h-20 bg-[#1C1917] rounded-2xl flex items-center justify-center mb-4">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                Generating Tech Pack
              </h3>
              <p className="text-sm text-gray-600">
                {generationStep || "Processing your product..."}
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={generationProgress} className="h-2" />
              <p className="text-xs text-center text-gray-500">
                {generationProgress}% complete
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <div className="h-2 w-2 bg-[#1C1917] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 bg-[#1C1917] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 bg-[#1C1917] rounded-full animate-bounce"></div>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto w-20 h-20 bg-[#1C1917] rounded-2xl flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                Generate Tech Pack
              </h3>
              <p className="text-sm text-gray-600">
                Create comprehensive manufacturing documentation for your product with detailed specifications, measurements, and technical files.
              </p>
            </div>
            <Button
              onClick={onGenerate}
              disabled={isGenerating || isDemo}
              size="lg"
              className="bg-[#1C1917] hover:bg-[#1C1917]/90 text-white gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Generate Tech Pack
            </Button>
            <p className="text-xs text-gray-500">
              Uses {TECH_PACK_CREDITS.GENERATION} credits
            </p>
          </>
        )}
      </div>
    </div>
  );
}
