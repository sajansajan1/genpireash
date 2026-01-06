/**
 * Custom hook for managing single view regeneration
 * Allows regenerating individual views without regenerating all views
 */

import { useState, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { ViewType, ViewImages } from '../types/editor.types';
import {
  regenerateSingleView,
  type RegenerateSingleViewResponse,
} from '@/app/actions/regenerate-single-view';
import { toast } from 'sonner';

interface UseSingleViewRegenerationOptions {
  productId: string | null;
  currentRevisionId: string | null;
  currentViews: ViewImages;
  onViewRegenerated?: (
    viewType: ViewType,
    newUrl: string,
    newRevisionId: string,
    newRevisionNumber: number
  ) => void;
  onError?: (error: string) => void;
}

export function useSingleViewRegeneration({
  productId,
  currentRevisionId,
  currentViews,
  onViewRegenerated,
  onError,
}: UseSingleViewRegenerationOptions) {
  // Local state for tracking regeneration per view
  const [regeneratingView, setRegeneratingView] = useState<ViewType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store access for loading states
  const { setLoadingView } = useEditorStore();

  /**
   * Regenerate a specific view with edit instructions
   *
   * @param viewType - Which view to regenerate (front, back, side, top, bottom)
   * @param editPrompt - User's specific instructions for this view
   */
  const regenerateView = useCallback(
    async (
      viewType: ViewType,
      editPrompt: string
    ): Promise<RegenerateSingleViewResponse> => {
      if (!productId) {
        const errorMsg = 'Product ID is required to regenerate view';
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!currentRevisionId) {
        const errorMsg = 'Current revision ID is required';
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!editPrompt?.trim()) {
        const errorMsg = 'Edit instructions are required';
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      try {
        setRegeneratingView(viewType);
        setError(null);
        setLoadingView(viewType, true);

        toast.loading(`Regenerating ${viewType} view...`, {
          id: `regenerate-${viewType}`,
        });

        console.log(`[useSingleViewRegeneration] Regenerating ${viewType} view...`);

        // Call server action
        const result = await regenerateSingleView({
          productId,
          viewType,
          revisionId: currentRevisionId,
          editPrompt,
          referenceViews: {
            front: currentViews.front,
            back: currentViews.back,
            side: currentViews.side,
            top: currentViews.top,
            bottom: currentViews.bottom,
          },
        });

        if (!result.success || !result.newViewUrl || !result.newRevisionId) {
          throw new Error(result.error || `Failed to regenerate ${viewType} view`);
        }

        toast.success(
          `${viewType.charAt(0).toUpperCase() + viewType.slice(1)} view regenerated! (1 credit used)`,
          { id: `regenerate-${viewType}` }
        );

        console.log(`[useSingleViewRegeneration] ${viewType} view regenerated successfully`);
        console.log(`[useSingleViewRegeneration] New revision: ${result.newRevisionId} (rev ${result.newRevisionNumber})`);

        // Call success callback
        if (onViewRegenerated && result.newRevisionNumber !== undefined) {
          onViewRegenerated(
            viewType,
            result.newViewUrl,
            result.newRevisionId,
            result.newRevisionNumber
          );
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : `Failed to regenerate ${viewType} view`;

        setError(errorMessage);

        toast.error(errorMessage, { id: `regenerate-${viewType}` });

        console.error(`[useSingleViewRegeneration] Error:`, err);

        if (onError) {
          onError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        setRegeneratingView(null);
        setLoadingView(viewType, false);
      }
    },
    [
      productId,
      currentRevisionId,
      currentViews,
      setLoadingView,
      onViewRegenerated,
      onError,
    ]
  );

  /**
   * Check if any view is currently being regenerated
   */
  const isRegenerating = regeneratingView !== null;

  /**
   * Check if a specific view is being regenerated
   */
  const isViewRegenerating = useCallback(
    (viewType: ViewType) => regeneratingView === viewType,
    [regeneratingView]
  );

  return {
    // State
    regeneratingView,
    error,
    isRegenerating,

    // Actions
    regenerateView,

    // Utils
    isViewRegenerating,
  };
}
