/**
 * TechPackView Component
 * Full-screen tech pack interface shown when workflow mode is 'tech-pack'
 * Refactored to use modular sub-components for better maintainability
 */

// @ts-nocheck - AI-generated tech pack data has flexible structure
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { TechPackData } from "../../../types/techPack";

// Import sub-components
import { TechPackHeader } from "./TechPackHeader";
import { TechPackBlurOverlay } from "./TechPackBlurOverlay";
import { TechPackV2Tab } from "./TechPackV2Tab";

export interface TechPackViewProps {
  productId: string;
  techPackData: TechPackData | null;
  isGenerating: boolean;
  generationProgress?: number;
  generationStep?: string;
  onGenerate: () => Promise<void>;
  onDownloadPDF?: () => Promise<void>;
  onDownloadExcel?: () => Promise<void>;
  onGenerateTechnicalFiles?: () => Promise<void>;
  // Tech Pack V2 props
  revisionIds?: string[];
  primaryImageUrl?: string;
  isDemo?: boolean;
}

export function TechPackView({
  productId,
  techPackData,
  isGenerating,
  generationProgress = 0,
  generationStep = "",
  onGenerate,
  onDownloadPDF,
  onDownloadExcel,
  revisionIds = [],
  primaryImageUrl = "",
  isDemo = false,
}: TechPackViewProps) {
  // Determine status
  const hasData = !!techPackData;

  // Always show tech pack interface with blur overlay if not generated
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
      {/* Blur Overlay when tech pack not generated */}
      {!hasData && (
        <TechPackBlurOverlay
          isGenerating={isGenerating}
          generationProgress={generationProgress}
          generationStep={generationStep}
          onGenerate={onGenerate}
          isDemo={isDemo}
        />
      )}

      {/* Header */}
      <TechPackHeader
        productName={(techPackData?.tech_pack_data as any)?.productName || "Factory Specs"}
        onDownloadPDF={onDownloadPDF}
        onDownloadExcel={onDownloadExcel}
        isDemo={isDemo}
      />

      {/* Content */}
      <div
        className={cn(
          "flex-1 overflow-y-auto bg-gray-50/50",
          !hasData && "pointer-events-none select-none"
        )}
      >
        <div className="max-w-4xl mx-auto p-4">
          {/* Tech Files Section */}
          <div className="space-y-4">
            <TechPackV2Tab
              productId={productId}
              revisionIds={revisionIds}
              primaryImageUrl={primaryImageUrl}
              isDemo={isDemo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
