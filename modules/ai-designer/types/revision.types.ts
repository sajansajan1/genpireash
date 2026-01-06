/**
 * Revision-related type definitions
 */

export interface MultiViewRevision {
  id: string;
  revisionNumber: number;
  views: {
    front?: { imageUrl: string; thumbnailUrl?: string; revisionId?: string };
    back?: { imageUrl: string; thumbnailUrl?: string; revisionId?: string };
    side?: { imageUrl: string; thumbnailUrl?: string; revisionId?: string };
    top?: { imageUrl: string; thumbnailUrl?: string; revisionId?: string };
    bottom?: { imageUrl: string; thumbnailUrl?: string; revisionId?: string };
  };
  editPrompt?: string;
  analysisPrompt?: string;
  enhancedPrompt?: string;
  editType: "initial" | "ai_edit" | "manual_upload";
  createdAt: string;
  isActive: boolean;
  metadata?: any;
}

export interface RevisionSummaryProps {
  title: string;
  subtitle?: string;
  changes: string[];
  improvements?: string[];
  technicalDetails?: string[];
  timestamp?: Date;
  revisionNumber?: number;
  editType?: "initial" | "ai_edit" | "manual_upload";
}
