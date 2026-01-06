/**
 * useTechPackGeneration Hook
 * Manages tech pack generation process
 */

import { useState, useCallback } from "react";
import { sendTechPackCreation } from "@/app/actions/send-mail";
import { devLog } from "../../utils/devLogger";
import type { MultiViewRevision } from "../../types";

export interface UseTechPackGenerationReturn {
  isGeneratingTechPack: boolean;
  techPackGeneratedFor: string | null;
  revisionTechPacks: Record<string, boolean>;
  generateTechPack: (
    revisions: MultiViewRevision[],
    onGenerateTechPack: ((revision: MultiViewRevision) => Promise<void>) | undefined,
    user: { email?: string; full_name?: string } | null,
    productName: string,
    productId: string | null
  ) => Promise<void>;
}

export function useTechPackGeneration(): UseTechPackGenerationReturn {
  const [isGeneratingTechPack, setIsGeneratingTechPack] = useState(false);
  const [techPackGeneratedFor, setTechPackGeneratedFor] = useState<string | null>(null);
  const [revisionTechPacks, setRevisionTechPacks] = useState<Record<string, boolean>>({});

  const generateTechPack = useCallback(
    async (
      revisions: MultiViewRevision[],
      onGenerateTechPack: ((revision: MultiViewRevision) => Promise<void>) | undefined,
      user: { email?: string; full_name?: string } | null,
      productName: string,
      productId: string | null
    ) => {
      if (onGenerateTechPack) {
        setIsGeneratingTechPack(true);
        try {
          // Always use the active revision for tech pack generation
          const activeRevision = revisions.find((r) => r.isActive);
          const revisionToUse = activeRevision || revisions[0];

          devLog(
            "tech-pack-generation",
            {
              revisionId: revisionToUse?.id,
              revisionNumber: revisionToUse?.revisionNumber,
              totalRevisions: revisions.length,
            },
            "Tech pack generation started"
          );

          await onGenerateTechPack(revisionToUse);
          devLog(
            "tech-pack-complete",
            { revisionId: revisionToUse?.id },
            "Tech pack generation completed"
          );

          await sendTechPackCreation({
            email: user?.email,
            creatorName: user?.full_name,
            productName: productName,
            techPackLink: `https://genpire.com/product/${productId}`,
          });

          // Mark tech pack as generated for this revision
          if (revisionToUse?.id) {
            setTechPackGeneratedFor(revisionToUse.id);
            devLog(
              "tech-pack-marked",
              { revisionId: revisionToUse.id },
              "Tech pack marked as generated"
            );
          }
        } catch (error) {
          console.error("❌ Tech pack generation failed:", error);
        } finally {
          setIsGeneratingTechPack(false);
        }
      }
    },
    []
  );

  return {
    isGeneratingTechPack,
    techPackGeneratedFor,
    revisionTechPacks,
    generateTechPack,
  };
}
