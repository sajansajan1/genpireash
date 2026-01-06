/**
 * Hook tests for useProgressiveGeneration
 *
 * Tests cover:
 * - State machine transitions
 * - All workflow phases (front view generation, approval, remaining views, revision)
 * - Error handling
 * - Credit system integration
 * - Iteration workflow
 * - User interactions
 * - Chat logging
 * - Toast notifications
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgressiveGeneration } from '../useProgressiveGeneration';
import { useEditorStore } from '../../store/editorStore';
import { useChatStore } from '../../store/chatStore';
import {
  generateFrontViewOnly,
  handleFrontViewDecision,
  generateRemainingViews,
  createRevisionAfterApproval,
} from '@/app/actions/progressive-generation-workflow';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('../../store/editorStore');
jest.mock('../../store/chatStore');
jest.mock('@/app/actions/progressive-generation-workflow');
jest.mock('sonner');

describe('useProgressiveGeneration', () => {
  let mockEditorStore: any;
  let mockChatStore: any;

  const mockProductId = 'product-123';
  const mockProductName = 'Wireless Headphones';
  const mockApprovalId = 'approval-123';
  const mockFrontViewUrl = 'https://example.com/front.jpg';

  const mockRemainingViews = {
    back: 'https://example.com/back.jpg',
    side: 'https://example.com/side.jpg',
    top: 'https://example.com/top.jpg',
    bottom: 'https://example.com/bottom.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup editor store mock
    mockEditorStore = {
      generationState: 'idle',
      frontViewApproval: {
        status: 'pending',
        imageUrl: null,
        approvalId: null,
        iterationCount: 0,
      },
      viewGenerationProgress: {
        front: 'pending',
        back: 'pending',
        side: 'pending',
        top: 'pending',
        bottom: 'pending',
      },
      setGenerationState: jest.fn(),
      setFrontViewApproval: jest.fn(),
      updateViewProgress: jest.fn(),
      setCurrentViews: jest.fn(),
      resetWorkflowState: jest.fn(),
      setLoadingView: jest.fn(),
      setAllLoadingViews: jest.fn(),
    };
    (useEditorStore as unknown as jest.Mock).mockReturnValue(mockEditorStore);

    // Setup chat store mock
    mockChatStore = {
      addMessage: jest.fn(),
    };
    (useChatStore as unknown as jest.Mock).mockReturnValue(mockChatStore);

    // Setup server action mocks
    (generateFrontViewOnly as jest.Mock).mockResolvedValue({
      success: true,
      frontViewUrl: mockFrontViewUrl,
      approvalId: mockApprovalId,
      sessionId: 'session-123',
      creditsReserved: 3,
    });

    (handleFrontViewDecision as jest.Mock).mockResolvedValue({
      success: true,
      action: 'approved',
      extractedFeatures: {
        colors: [{ hex: '#000000', name: 'Black', usage: 'Main' }],
        estimatedDimensions: { width: '10cm', height: '15cm' },
        materials: ['Plastic'],
        keyElements: ['Modern design'],
        description: 'Wireless headphones',
      },
    });

    (generateRemainingViews as jest.Mock).mockResolvedValue({
      success: true,
      views: mockRemainingViews,
    });

    (createRevisionAfterApproval as jest.Mock).mockResolvedValue({
      success: true,
      revisionNumber: 0,
      batchId: 'batch-123',
      revisionIds: ['rev-1', 'rev-2', 'rev-3', 'rev-4', 'rev-5'],
    });

    // Setup toast mock
    (toast.loading as jest.Mock).mockReturnValue('toast-id');
    (toast.success as jest.Mock).mockReturnValue('toast-id');
    (toast.error as jest.Mock).mockReturnValue('toast-id');
    (toast.info as jest.Mock).mockReturnValue('toast-id');
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
          productName: mockProductName,
        })
      );

      expect(result.current.generationState).toBe('idle');
      expect(result.current.error).toBeNull();
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.canApprove).toBe(false);
      expect(result.current.canRequestEdit).toBe(false);
    });

    it('should handle null productId', () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: null,
        })
      );

      expect(result.current.generationState).toBe('idle');
    });
  });

  describe('startGeneration', () => {
    it('should successfully generate front view', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
          productName: mockProductName,
        })
      );

      let generationResult: any;
      await act(async () => {
        generationResult = await result.current.startGeneration('Modern wireless headphones');
      });

      expect(generationResult.success).toBe(true);
      expect(generationResult.frontViewUrl).toBe(mockFrontViewUrl);
      expect(generationResult.approvalId).toBe(mockApprovalId);

      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('generating_front_view');
      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('awaiting_front_approval');
      expect(mockEditorStore.updateViewProgress).toHaveBeenCalledWith('front', 'generating');
      expect(mockEditorStore.updateViewProgress).toHaveBeenCalledWith('front', 'completed');
      expect(mockEditorStore.setFrontViewApproval).toHaveBeenCalled();
      expect(mockEditorStore.setCurrentViews).toHaveBeenCalledWith({ front: mockFrontViewUrl });
    });

    it('should handle edit mode with previous front view', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.startGeneration(
          'Make it blue',
          true,
          'https://example.com/previous.jpg'
        );
      });

      expect(generateFrontViewOnly).toHaveBeenCalledWith({
        productId: mockProductId,
        userPrompt: 'Make it blue',
        isEdit: true,
        previousFrontViewUrl: 'https://example.com/previous.jpg',
      });
    });

    it('should log to chat during generation', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
          productName: mockProductName,
        })
      );

      await act(async () => {
        await result.current.startGeneration('Test product');
      });

      expect(mockChatStore.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          product_idea_id: mockProductId,
          message_type: 'system',
        })
      );
    });

    it('should show toast notifications', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.startGeneration('Test product');
      });

      expect(toast.loading).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle missing productId', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: null,
        })
      );

      let generationResult: any;
      await act(async () => {
        generationResult = await result.current.startGeneration('Test product');
      });

      expect(generationResult.success).toBe(false);
      expect(generationResult.error).toContain('Product ID is required');
      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle empty prompt', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      let generationResult: any;
      await act(async () => {
        generationResult = await result.current.startGeneration('  ');
      });

      expect(generationResult.success).toBe(false);
      expect(generationResult.error).toContain('description is required');
    });

    it('should handle generation failure', async () => {
      (generateFrontViewOnly as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Generation failed',
      });

      const onError = jest.fn();
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
          onError,
        })
      );

      let generationResult: any;
      await act(async () => {
        generationResult = await result.current.startGeneration('Test product');
      });

      expect(generationResult.success).toBe(false);
      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('error');
      expect(onError).toHaveBeenCalledWith(expect.stringContaining('failed'));
      expect(toast.error).toHaveBeenCalled();
    });

    it('should reset workflow state before starting', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.startGeneration('Test product');
      });

      expect(mockEditorStore.resetWorkflowState).toHaveBeenCalled();
    });

    it('should track iteration count for edits', async () => {
      mockEditorStore.frontViewApproval.iterationCount = 2;

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.startGeneration('Test', true);
      });

      expect(mockEditorStore.setFrontViewApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          iterationCount: 3,
        })
      );
    });
  });

  describe('approveFrontView', () => {
    beforeEach(() => {
      mockEditorStore.frontViewApproval = {
        status: 'pending',
        imageUrl: mockFrontViewUrl,
        approvalId: mockApprovalId,
        iterationCount: 1,
      };
      mockEditorStore.generationState = 'awaiting_front_approval';
    });

    it('should successfully complete full approval workflow', async () => {
      const onRevisionCreated = jest.fn();
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
          onRevisionCreated,
        })
      );

      let approvalResult: boolean = false;
      await act(async () => {
        approvalResult = await result.current.approveFrontView();
      });

      expect(approvalResult).toBe(true);

      // Verify all steps were called
      expect(handleFrontViewDecision).toHaveBeenCalledWith({
        approvalId: mockApprovalId,
        action: 'approve',
      });

      expect(generateRemainingViews).toHaveBeenCalledWith({
        approvalId: mockApprovalId,
        frontViewUrl: mockFrontViewUrl,
      });

      expect(createRevisionAfterApproval).toHaveBeenCalledWith({
        productId: mockProductId,
        approvalId: mockApprovalId,
        allViews: {
          front: mockFrontViewUrl,
          ...mockRemainingViews,
        },
        isInitial: true,
      });

      expect(onRevisionCreated).toHaveBeenCalledWith(0);
    });

    it('should update state through all phases', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.approveFrontView();
      });

      // Check state transitions
      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('front_approved');
      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('generating_additional_views');
      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('creating_revision');
      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('completed');

      // Check view progress updates
      expect(mockEditorStore.updateViewProgress).toHaveBeenCalledWith('back', 'generating');
      expect(mockEditorStore.updateViewProgress).toHaveBeenCalledWith('back', 'completed');
      expect(mockEditorStore.updateViewProgress).toHaveBeenCalledWith('side', 'completed');
      expect(mockEditorStore.updateViewProgress).toHaveBeenCalledWith('top', 'completed');
      expect(mockEditorStore.updateViewProgress).toHaveBeenCalledWith('bottom', 'completed');
    });

    it('should update current views with remaining views', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.approveFrontView();
      });

      expect(mockEditorStore.setCurrentViews).toHaveBeenCalledWith(mockRemainingViews);
    });

    it('should log to chat during approval workflow', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.approveFrontView();
      });

      expect(mockChatStore.addMessage).toHaveBeenCalled();
    });

    it('should show toast notifications during workflow', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.approveFrontView();
      });

      expect(toast.loading).toHaveBeenCalledWith('Processing approval...', expect.anything());
      expect(toast.loading).toHaveBeenCalledWith('Generating remaining views...', expect.anything());
      expect(toast.loading).toHaveBeenCalledWith('Creating revision...', expect.anything());
      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle missing approval data', async () => {
      mockEditorStore.frontViewApproval = {
        status: 'pending',
        imageUrl: null,
        approvalId: null,
        iterationCount: 0,
      };

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      let approvalResult: boolean = true;
      await act(async () => {
        approvalResult = await result.current.approveFrontView();
      });

      expect(approvalResult).toBe(false);
      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle approval decision failure', async () => {
      (handleFrontViewDecision as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Approval failed',
      });

      const onError = jest.fn();
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
          onError,
        })
      );

      let approvalResult: boolean = true;
      await act(async () => {
        approvalResult = await result.current.approveFrontView();
      });

      expect(approvalResult).toBe(false);
      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('error');
      expect(onError).toHaveBeenCalled();
    });

    it('should handle remaining views generation failure', async () => {
      (generateRemainingViews as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Views generation failed',
      });

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      let approvalResult: boolean = true;
      await act(async () => {
        approvalResult = await result.current.approveFrontView();
      });

      expect(approvalResult).toBe(false);
      expect(mockEditorStore.setAllLoadingViews).toHaveBeenCalledWith(false);
    });

    it('should handle revision creation failure', async () => {
      (createRevisionAfterApproval as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Revision creation failed',
      });

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      let approvalResult: boolean = true;
      await act(async () => {
        approvalResult = await result.current.approveFrontView();
      });

      expect(approvalResult).toBe(false);
    });

    it('should mark as non-initial for subsequent revisions', async () => {
      mockEditorStore.frontViewApproval.iterationCount = 2;

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.approveFrontView();
      });

      expect(createRevisionAfterApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          isInitial: false,
        })
      );
    });
  });

  describe('requestEdit', () => {
    beforeEach(() => {
      mockEditorStore.frontViewApproval = {
        status: 'pending',
        imageUrl: mockFrontViewUrl,
        approvalId: mockApprovalId,
        iterationCount: 1,
      };
      mockEditorStore.generationState = 'awaiting_front_approval';

      (handleFrontViewDecision as jest.Mock).mockResolvedValue({
        success: true,
        action: 'regenerate',
        newFrontViewUrl: 'https://example.com/new-front.jpg',
        newApprovalId: 'approval-456',
      });
    });

    it('should successfully request edit and regenerate front view', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      let editResult: boolean = false;
      await act(async () => {
        editResult = await result.current.requestEdit('Make it blue');
      });

      expect(editResult).toBe(true);

      expect(handleFrontViewDecision).toHaveBeenCalledWith({
        approvalId: mockApprovalId,
        action: 'edit',
        editFeedback: 'Make it blue',
      });

      expect(mockEditorStore.setFrontViewApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: 'https://example.com/new-front.jpg',
          approvalId: 'approval-456',
          iterationCount: 2,
        })
      );
    });

    it('should update state during edit process', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.requestEdit('Make changes');
      });

      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('generating_front_view');
      expect(mockEditorStore.updateViewProgress).toHaveBeenCalledWith('front', 'generating');
      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('awaiting_front_approval');
      expect(mockEditorStore.updateViewProgress).toHaveBeenCalledWith('front', 'completed');
    });

    it('should increment iteration count', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.requestEdit('Make changes');
      });

      expect(mockEditorStore.setFrontViewApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          iterationCount: 2,
        })
      );
    });

    it('should handle missing approval ID', async () => {
      mockEditorStore.frontViewApproval.approvalId = null;

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      let editResult: boolean = true;
      await act(async () => {
        editResult = await result.current.requestEdit('Make changes');
      });

      expect(editResult).toBe(false);
      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle empty feedback', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      let editResult: boolean = true;
      await act(async () => {
        editResult = await result.current.requestEdit('  ');
      });

      expect(editResult).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Please provide feedback for the edit');
    });

    it('should handle edit failure', async () => {
      (handleFrontViewDecision as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Edit failed',
      });

      const onError = jest.fn();
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
          onError,
        })
      );

      let editResult: boolean = true;
      await act(async () => {
        editResult = await result.current.requestEdit('Make changes');
      });

      expect(editResult).toBe(false);
      expect(mockEditorStore.setGenerationState).toHaveBeenCalledWith('error');
      expect(onError).toHaveBeenCalled();
    });

    it('should log to chat during edit', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.requestEdit('Make it blue');
      });

      expect(mockChatStore.addMessage).toHaveBeenCalled();
    });

    it('should show toast notifications during edit', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.requestEdit('Make changes');
      });

      expect(toast.loading).toHaveBeenCalledWith('Regenerating front view...', expect.anything());
      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('cancelWorkflow', () => {
    it('should cancel workflow and reset state', () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      act(() => {
        result.current.cancelWorkflow();
      });

      expect(mockEditorStore.resetWorkflowState).toHaveBeenCalled();
      expect(mockEditorStore.setAllLoadingViews).toHaveBeenCalledWith(false);
      expect(toast.info).toHaveBeenCalledWith('Generation workflow cancelled');
    });

    it('should log cancellation to chat', () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      act(() => {
        result.current.cancelWorkflow();
      });

      expect(mockChatStore.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Generation workflow cancelled by user',
        })
      );
    });
  });

  describe('Computed state', () => {
    it('should compute isBusy correctly', () => {
      const { result, rerender } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      expect(result.current.isProcessing).toBe(false);

      mockEditorStore.generationState = 'generating_front_view';
      rerender();

      expect(result.current.isProcessing).toBe(true);
    });

    it('should compute canApprove correctly', () => {
      mockEditorStore.generationState = 'awaiting_front_approval';
      mockEditorStore.frontViewApproval.status = 'pending';

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      expect(result.current.canApprove).toBe(true);
    });

    it('should compute canRequestEdit correctly', () => {
      mockEditorStore.generationState = 'awaiting_front_approval';
      mockEditorStore.frontViewApproval.status = 'pending';

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      expect(result.current.canRequestEdit).toBe(true);
    });

    it('should not allow approval when processing', () => {
      mockEditorStore.generationState = 'generating_additional_views';

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      expect(result.current.canApprove).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple rapid start calls', async () => {
      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      // First call starts processing
      const promise1 = act(async () => {
        return result.current.startGeneration('Test 1');
      });

      // Second call should be rejected due to processing state
      const promise2 = act(async () => {
        return result.current.startGeneration('Test 2');
      });

      await Promise.all([promise1, promise2]);

      // Only one successful generation
      expect(generateFrontViewOnly).toHaveBeenCalled();
    });

    it('should handle iteration count overflow', async () => {
      mockEditorStore.frontViewApproval.iterationCount = 99;

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      await act(async () => {
        await result.current.startGeneration('Test', true);
      });

      expect(mockEditorStore.setFrontViewApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          iterationCount: 100,
        })
      );
    });

    it('should handle very long feedback text', async () => {
      mockEditorStore.frontViewApproval = {
        status: 'pending',
        imageUrl: mockFrontViewUrl,
        approvalId: mockApprovalId,
        iterationCount: 1,
      };

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      const longFeedback = 'a'.repeat(10000);

      await act(async () => {
        await result.current.requestEdit(longFeedback);
      });

      expect(handleFrontViewDecision).toHaveBeenCalledWith(
        expect.objectContaining({
          editFeedback: longFeedback,
        })
      );
    });
  });

  describe('Error recovery', () => {
    it('should allow retry after error', async () => {
      (generateFrontViewOnly as jest.Mock)
        .mockResolvedValueOnce({ success: false, error: 'First attempt failed' })
        .mockResolvedValueOnce({
          success: true,
          frontViewUrl: mockFrontViewUrl,
          approvalId: mockApprovalId,
        });

      const { result } = renderHook(() =>
        useProgressiveGeneration({
          productId: mockProductId,
        })
      );

      // First attempt fails
      await act(async () => {
        await result.current.startGeneration('Test');
      });

      // Second attempt succeeds
      let secondResult: any;
      await act(async () => {
        secondResult = await result.current.startGeneration('Test');
      });

      expect(secondResult.success).toBe(true);
      expect(generateFrontViewOnly).toHaveBeenCalledTimes(2);
    });
  });
});
