/**
 * Custom hook for managing the progressive generation workflow state machine
 *
 * Implements the new faster & more interactive workflow:
 * 1. Generate ONLY front view (~30 seconds)
 * 2. User approves or requests edits
 * 3. Generate remaining views (~2 minutes)
 * 4. Create revision with all approved views
 *
 * This hook orchestrates the entire workflow and manages state transitions.
 */

import { useState, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useChatStore } from '../store/chatStore';
import type { ViewType } from '../types/editor.types';
import {
  generateFrontViewOnly,
  handleFrontViewDecision,
  generateRemainingViews,
  createRevisionAfterApproval,
  type GenerateFrontViewOnlyResponse,
  type HandleFrontViewDecisionResponse,
  type GenerateRemainingViewsResponse,
  type CreateRevisionAfterApprovalResponse,
} from '@/app/actions/progressive-generation-workflow';
import { toast } from 'sonner';

interface UseProgressiveGenerationOptions {
  productId: string | null;
  productName?: string;
  selectedRevisionNumber?: number; // Currently selected revision for structural reference
  onRevisionCreated?: (revisionNumber: number) => void;
  onError?: (error: string) => void;
}

export function useProgressiveGeneration({
  productId,
  productName = 'Product',
  selectedRevisionNumber,
  onRevisionCreated,
  onError,
}: UseProgressiveGenerationOptions) {
  // Store access
  const {
    generationState,
    frontViewApproval,
    viewGenerationProgress,
    setGenerationState,
    setFrontViewApproval,
    updateViewProgress,
    setCurrentViews,
    resetWorkflowState,
    setLoadingView,
    setAllLoadingViews,
  } = useEditorStore();

  const { addMessage } = useChatStore();

  // Local state for tracking
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Log workflow events to chat for user feedback
   */
  const logToChat = useCallback(
    (message: string, type: 'system' | 'success' | 'error' | 'processing' = 'system', metadata?: any) => {
      if (!productId) return;

      addMessage({
        id: `msg-${Date.now()}-${Math.random()}`,
        product_idea_id: productId,
        message_type: type === 'error' ? 'error' : type === 'success' ? 'success' : 'system',
        content: message,
        created_at: new Date(),
        metadata,
      });
    },
    [productId, addMessage]
  );

  /**
   * PHASE 1: Start the workflow by generating only the front view
   *
   * @param userPrompt - User's product description or edit request
   * @param isEdit - Whether this is an edit request (affects credit reservation)
   * @param previousFrontViewUrl - Optional previous front view for reference
   */
  const startGeneration = useCallback(
    async (
      userPrompt: string,
      isEdit: boolean = false,
      previousFrontViewUrl?: string
    ): Promise<GenerateFrontViewOnlyResponse> => {
      if (!productId) {
        const errorMsg = 'Product ID is required to start generation';
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!userPrompt?.trim()) {
        const errorMsg = 'Product description is required';
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      try {
        setIsProcessing(true);
        setError(null);

        // Reset workflow state before starting
        resetWorkflowState();

        // Update state to generating front view
        setGenerationState('generating_front_view');
        updateViewProgress('front', 'generating');
        setLoadingView('front', true);

        logToChat(
          isEdit
            ? `Regenerating front view with your edits...`
            : `Generating front view for ${productName}...`,
          'processing',
          { phase: 'front_view_generation', isEdit, productName }
        );

        toast.loading(
          isEdit ? 'Regenerating front view...' : 'Generating front view...',
          { id: 'front-view-generation' }
        );

        // Call server action to generate front view
        const result = await generateFrontViewOnly({
          productId,
          userPrompt,
          isEdit,
          previousFrontViewUrl,
        });

        if (!result.success || !result.frontViewUrl || !result.approvalId) {
          throw new Error(result.error || 'Failed to generate front view');
        }

        // Update state with the front view
        setFrontViewApproval({
          status: 'pending',
          imageUrl: result.frontViewUrl,
          approvalId: result.approvalId,
          iterationCount: isEdit ? frontViewApproval.iterationCount + 1 : 1,
        });

        // Update current views with front view
        setCurrentViews({ front: result.frontViewUrl });
        updateViewProgress('front', 'completed');
        setLoadingView('front', false);

        // Transition to awaiting approval state
        setGenerationState('awaiting_front_approval');

        toast.success('Front view generated! Please review and approve.', {
          id: 'front-view-generation',
        });

        logToChat(
          `Front view generated successfully! Review the design and approve to continue generating remaining views.`,
          'success',
          {
            phase: 'front_view_completed',
            approvalId: result.approvalId,
            iterationCount: frontViewApproval.iterationCount + 1,
            creditsReserved: result.creditsReserved,
          }
        );

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate front view';

        setError(errorMessage);
        setGenerationState('error');
        updateViewProgress('front', 'pending');
        setLoadingView('front', false);

        toast.error(errorMessage, { id: 'front-view-generation' });
        logToChat(`Error: ${errorMessage}`, 'error', { phase: 'front_view_generation' });

        if (onError) {
          onError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    [
      productId,
      productName,
      frontViewApproval.iterationCount,
      setGenerationState,
      setFrontViewApproval,
      updateViewProgress,
      setCurrentViews,
      setLoadingView,
      resetWorkflowState,
      logToChat,
      onError,
    ]
  );

  /**
   * PHASE 2a: User approves the front view, proceed to generate remaining views
   */
  const approveFrontView = useCallback(
    async (): Promise<boolean> => {
      if (!frontViewApproval.approvalId || !frontViewApproval.imageUrl) {
        const errorMsg = 'No front view to approve';
        toast.error(errorMsg);
        return false;
      }

      try {
        setIsProcessing(true);
        setError(null);

        logToChat(
          `Front view approved! Generating remaining views (back, side, top, bottom)...`,
          'processing',
          { phase: 'approval', approvalId: frontViewApproval.approvalId }
        );

        toast.loading('Processing approval...', { id: 'front-view-approval' });

        // Step 1: Handle the approval decision
        const approvalResult: HandleFrontViewDecisionResponse = await handleFrontViewDecision({
          approvalId: frontViewApproval.approvalId,
          action: 'approve',
        });

        if (!approvalResult.success) {
          throw new Error(approvalResult.error || 'Failed to process approval');
        }

        // Update approval status
        setFrontViewApproval({ status: 'approved' });
        setGenerationState('front_approved');

        toast.success('Front view approved!', { id: 'front-view-approval' });

        // Step 2: Generate remaining views
        setGenerationState('generating_additional_views');
        setAllLoadingViews(true);
        updateViewProgress('front', 'completed'); // Front is already done
        updateViewProgress('back', 'generating');
        updateViewProgress('side', 'generating');
        updateViewProgress('top', 'generating');
        updateViewProgress('bottom', 'generating');

        toast.loading('Generating remaining views...', { id: 'remaining-views' });

        logToChat(
          `Generating back, side, top, and bottom views. This will take approximately 2 minutes.`,
          'processing',
          {
            phase: 'remaining_views_generation',
            extractedFeatures: approvalResult.extractedFeatures,
          }
        );

        // Pass selected revision number for structural reference (camera angle, positioning)
        // Design/colors will come from the new front view, not the previous revision
        const remainingViewsResult: GenerateRemainingViewsResponse = await generateRemainingViews({
          approvalId: frontViewApproval.approvalId,
          frontViewUrl: frontViewApproval.imageUrl,
          selectedRevisionNumber, // Use selected revision for structural reference
        });

        if (!remainingViewsResult.success || !remainingViewsResult.views) {
          throw new Error(remainingViewsResult.error || 'Failed to generate remaining views');
        }

        // Update state with all views
        setCurrentViews(remainingViewsResult.views);
        updateViewProgress('back', 'completed');
        updateViewProgress('side', 'completed');
        updateViewProgress('top', 'completed');
        updateViewProgress('bottom', 'completed');

        toast.success('All views generated!', { id: 'remaining-views' });

        logToChat(
          `All views generated successfully! Creating revision...`,
          'success',
          { phase: 'remaining_views_completed' }
        );

        // Step 3: Create the revision
        setGenerationState('creating_revision');
        toast.loading('Creating revision...', { id: 'create-revision' });

        const revisionResult: CreateRevisionAfterApprovalResponse = await createRevisionAfterApproval({
          productId: productId!,
          approvalId: frontViewApproval.approvalId,
          allViews: {
            front: frontViewApproval.imageUrl,
            back: remainingViewsResult.views.back,
            side: remainingViewsResult.views.side,
            top: remainingViewsResult.views.top,
            bottom: remainingViewsResult.views.bottom,
          },
          isInitial: frontViewApproval.iterationCount === 1,
        });

        if (!revisionResult.success) {
          throw new Error(revisionResult.error || 'Failed to create revision');
        }

        // Complete the workflow
        setGenerationState('completed');
        setAllLoadingViews(false);

        toast.success(
          `Revision ${revisionResult.revisionNumber} created successfully!`,
          { id: 'create-revision' }
        );

        logToChat(
          `Revision ${revisionResult.revisionNumber} created successfully! All views are now available.`,
          'success',
          {
            phase: 'workflow_completed',
            revisionNumber: revisionResult.revisionNumber,
            batchId: revisionResult.batchId,
          }
        );

        // Call success callback
        if (onRevisionCreated && revisionResult.revisionNumber !== undefined) {
          onRevisionCreated(revisionResult.revisionNumber);
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to approve front view';

        setError(errorMessage);
        setGenerationState('error');
        setAllLoadingViews(false);

        toast.error(errorMessage, { id: 'front-view-approval' });
        logToChat(`Error: ${errorMessage}`, 'error', { phase: 'approval_workflow' });

        if (onError) {
          onError(errorMessage);
        }

        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [
      productId,
      frontViewApproval.approvalId,
      frontViewApproval.imageUrl,
      frontViewApproval.iterationCount,
      setGenerationState,
      setFrontViewApproval,
      updateViewProgress,
      setCurrentViews,
      setAllLoadingViews,
      logToChat,
      onRevisionCreated,
      onError,
    ]
  );

  /**
   * PHASE 2b: User requests edits to the front view
   *
   * This will regenerate the front view with the user's feedback,
   * creating a new approval record and looping back to the approval phase.
   *
   * @param editFeedback - User's feedback for improving the front view
   */
  const requestEdit = useCallback(
    async (editFeedback: string): Promise<boolean> => {
      if (!frontViewApproval.approvalId) {
        const errorMsg = 'No front view to edit';
        toast.error(errorMsg);
        return false;
      }

      if (!editFeedback?.trim()) {
        const errorMsg = 'Please provide feedback for the edit';
        toast.error(errorMsg);
        return false;
      }

      try {
        setIsProcessing(true);
        setError(null);

        logToChat(
          `Regenerating front view with your feedback: "${editFeedback}"`,
          'processing',
          {
            phase: 'front_view_edit',
            approvalId: frontViewApproval.approvalId,
            iterationCount: frontViewApproval.iterationCount,
          }
        );

        toast.loading('Regenerating front view...', { id: 'front-view-edit' });

        // Update state
        setGenerationState('generating_front_view');
        updateViewProgress('front', 'generating');
        setLoadingView('front', true);
        setFrontViewApproval({ status: 'needs_revision' });

        // Call server action to handle the edit decision
        const editResult: HandleFrontViewDecisionResponse = await handleFrontViewDecision({
          approvalId: frontViewApproval.approvalId,
          action: 'edit',
          editFeedback,
        });

        if (!editResult.success || !editResult.newFrontViewUrl || !editResult.newApprovalId) {
          throw new Error(editResult.error || 'Failed to regenerate front view');
        }

        // Update state with new front view
        setFrontViewApproval({
          status: 'pending',
          imageUrl: editResult.newFrontViewUrl,
          approvalId: editResult.newApprovalId,
          iterationCount: frontViewApproval.iterationCount + 1,
        });

        setCurrentViews({ front: editResult.newFrontViewUrl });
        updateViewProgress('front', 'completed');
        setLoadingView('front', false);

        // Return to approval phase
        setGenerationState('awaiting_front_approval');

        toast.success(
          `Front view regenerated (iteration ${frontViewApproval.iterationCount + 1})! Please review.`,
          { id: 'front-view-edit' }
        );

        logToChat(
          `Front view regenerated successfully (iteration ${frontViewApproval.iterationCount + 1})! Review the updated design and approve to continue.`,
          'success',
          {
            phase: 'front_view_edit_completed',
            approvalId: editResult.newApprovalId,
            iterationCount: frontViewApproval.iterationCount + 1,
          }
        );

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate front view';

        setError(errorMessage);
        setGenerationState('error');
        updateViewProgress('front', 'pending');
        setLoadingView('front', false);

        toast.error(errorMessage, { id: 'front-view-edit' });
        logToChat(`Error: ${errorMessage}`, 'error', { phase: 'front_view_edit' });

        if (onError) {
          onError(errorMessage);
        }

        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [
      frontViewApproval.approvalId,
      frontViewApproval.iterationCount,
      setGenerationState,
      setFrontViewApproval,
      updateViewProgress,
      setCurrentViews,
      setLoadingView,
      logToChat,
      onError,
    ]
  );

  /**
   * Cancel the current workflow and reset state
   */
  const cancelWorkflow = useCallback(() => {
    resetWorkflowState();
    setAllLoadingViews(false);
    setIsProcessing(false);
    setError(null);

    toast.info('Generation workflow cancelled');
    logToChat('Generation workflow cancelled by user', 'system', { phase: 'cancelled' });
  }, [resetWorkflowState, setAllLoadingViews, logToChat]);

  /**
   * Check if the workflow is in a busy state (processing something)
   */
  const isBusy = isProcessing || generationState === 'generating_front_view' || generationState === 'generating_additional_views' || generationState === 'creating_revision';

  /**
   * Check if the user can approve (front view is ready and pending approval)
   */
  const canApprove = generationState === 'awaiting_front_approval' && frontViewApproval.status === 'pending' && !isProcessing;

  /**
   * Check if the user can request edits (same as canApprove)
   */
  const canRequestEdit = canApprove;

  return {
    // State
    generationState,
    frontViewApproval,
    viewGenerationProgress,
    error,
    isProcessing: isBusy,

    // Computed state
    canApprove,
    canRequestEdit,

    // Actions
    startGeneration,
    approveFrontView,
    requestEdit,
    cancelWorkflow,

    // Utils
    resetWorkflow: resetWorkflowState,
  };
}
