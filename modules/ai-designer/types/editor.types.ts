/**
 * Editor state and configuration type definitions
 */

export interface ViewImages {
  front: string;
  back: string;
  side: string;
  top: string;
  bottom: string;
}

export interface LoadingStates {
  front: boolean;
  back: boolean;
  side: boolean;
  top: boolean;
  bottom: boolean;
}

export interface ViewportState {
  zoomLevel: number;
  viewPosition: { x: number; y: number };
  isDragging: boolean;
  dragStart: { x: number; y: number };
}

export interface MultiViewEditorProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName?: string;
  productDescription?: string;
  currentViews: ViewImages;
  revisions: any[];
  isInitialGeneration?: boolean;
  initialPrompt?: string;
  chatSessionId?: string | null;
  onRevisionsChange?: (revisions: any[]) => void;
  onGenerateTechPack?: (selectedRevision?: any) => Promise<void>;
  onGenerateInitialImages?: (
    prompt: string,
    onProgress?: (view: ViewType, imageUrl: string) => void
  ) => Promise<{
    success: boolean;
    views?: ViewImages;
    error?: string;
  }>;
  onEditViews: (
    currentViews: ViewImages,
    editPrompt: string
  ) => Promise<{
    success: boolean;
    views?: ViewImages;
    error?: string;
  }>;
  onProgressiveEdit?: (
    currentViews: ViewImages,
    editPrompt: string,
    onProgress: (view: ViewType, imageUrl: string) => void
  ) => Promise<{
    success: boolean;
    views?: ViewImages;
    error?: string;
  }>;
  onSave?: (views: ViewImages) => void;
  onRollback?: (revision: any) => void;
  onDeleteRevision?: (revisionId: string, batchId?: string) => Promise<boolean>;
  setShowIndicatorModal?: any;
  setShowTutorialModal?: any;
  setShowPaymentModal?: any;
  /** The revision ID that was used to create the product (from product_ideas.selected_revision_id) */
  productLinkedRevisionId?: string | null;
  /** Whether the product is in demo mode (restricted functionality) */
  isDemo?: boolean;
}

export type ViewType = "front" | "back" | "side" | "top" | "bottom";
