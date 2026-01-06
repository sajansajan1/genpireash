/**
 * Main editor state management using Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EDITOR_DEFAULTS } from '../constants';
import { devLog } from '../utils/devLogger';
import type {
  ViewImages,
  LoadingStates,
  ViewportState,
  MultiViewRevision,
  ViewType
} from '../types';

/**
 * Progressive generation workflow state machine
 * Controls the new faster interactive workflow with front view approval
 */
export type GenerationState =
  | 'idle'                           // No generation in progress
  | 'generating_front_view'          // Phase 1: Generating only front view
  | 'awaiting_front_approval'        // User interaction: waiting for approval/edit
  | 'front_approved'                 // Transition state: front view approved
  | 'generating_additional_views'    // Phase 2: Generating remaining views
  | 'creating_revision'              // Phase 3: Creating revision record
  | 'completed'                      // All views generated and revision created
  | 'error';                         // Error occurred during generation

/**
 * Front view approval status
 */
export type FrontViewStatus =
  | 'pending'          // Front view generated, awaiting user decision
  | 'approved'         // User approved the front view
  | 'needs_revision';  // User requested changes to front view

/**
 * Individual view generation progress
 */
export type ViewProgress = 'pending' | 'generating' | 'completed';

/**
 * Workflow mode - determines which component to show
 * - 'multi-view': Show ViewsDisplay component (all 5 views)
 * - 'front-view': Show FrontViewApproval component (during approval or when viewing versions)
 * - 'tech-pack': Show Tech Pack interface (guidelines and technical files)
 * - null: Initial state
 */
export type WorkflowMode = 'multi-view' | 'front-view' | 'tech-pack' | null;

interface EditorState {
  // Core state
  productId: string | null;
  productName: string;
  productDescription: string;
  currentViews: ViewImages;
  revisions: MultiViewRevision[];
  isInitialGeneration: boolean;
  initialPrompt: string;
  chatSessionId: string | null;
  batchId: string;

  // UI state
  isOpen: boolean;
  isEditing: boolean;
  loadingViews: LoadingStates;
  currentProcessingView: ViewType | null;
  showHistory: boolean;
  showMobileChat: boolean;
  pendingRevision: MultiViewRevision | null;
  revisionImagesLoaded: number;

  // Viewport state
  viewport: ViewportState;

  // Visual editor state
  isVisualEditMode: boolean;
  selectedTool: 'pointer' | 'pen' | 'text' | 'arrow' | 'circle' | 'square';
  drawColor: string;

  // Workflow mode - determines which component tree to render (NEW)
  workflowMode: WorkflowMode;

  // Progressive generation workflow state (NEW)
  generationState: GenerationState;
  frontViewApproval: {
    status: FrontViewStatus;
    imageUrl: string | null;
    approvalId: string | null;
    iterationCount: number; // Tracks how many times front view was regenerated
  };
  viewGenerationProgress: {
    front: ViewProgress;
    back: ViewProgress;
    side: ViewProgress;
    top: ViewProgress;
    bottom: ViewProgress;
  };

  // Actions
  setProductInfo: (id: string, name: string, description: string) => void;
  setCurrentViews: (views: Partial<ViewImages>) => void;
  setRevisions: (revisions: MultiViewRevision[]) => void;
  addRevision: (revision: MultiViewRevision) => void;
  removeRevision: (revisionId: string) => void;
  setLoadingView: (view: ViewType, isLoading: boolean) => void;
  setAllLoadingViews: (isLoading: boolean) => void;
  setCurrentProcessingView: (view: ViewType | null) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  resetViewport: () => void;
  setVisualEditMode: (enabled: boolean) => void;
  setSelectedTool: (tool: EditorState['selectedTool']) => void;
  setDrawColor: (color: string) => void;
  toggleHistory: () => void;
  toggleMobileChat: () => void;
  setIsInitialGeneration: (isInitial: boolean) => void;
  reset: () => void;

  // Progressive generation workflow actions (NEW)
  setWorkflowMode: (mode: WorkflowMode) => void;
  setGenerationState: (state: GenerationState) => void;
  setFrontViewApproval: (approval: Partial<EditorState['frontViewApproval']>) => void;
  updateViewProgress: (view: ViewType, progress: ViewProgress) => void;
  resetWorkflowState: () => void;
}

const initialState = {
  productId: null,
  productName: 'Product',
  productDescription: '',
  currentViews: { front: '', back: '', side: '', top: '', bottom: '' },
  revisions: [],
  isInitialGeneration: false,
  initialPrompt: '',
  chatSessionId: null,
  batchId: `batch-${Date.now()}`,
  isOpen: false,
  isEditing: false,
  loadingViews: { front: false, back: false, side: false, top: false, bottom: false },
  currentProcessingView: null,
  showHistory: typeof window !== 'undefined' ? window.innerWidth >= 640 : false,
  showMobileChat: false,
  pendingRevision: null,
  revisionImagesLoaded: 0,
  viewport: {
    zoomLevel: EDITOR_DEFAULTS.ZOOM_DEFAULT,
    viewPosition: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
  },
  isVisualEditMode: false,
  selectedTool: 'pointer' as const,
  drawColor: '#FF0000',

  // Workflow mode initial state (NEW) - defaults to multi-view for completed products
  workflowMode: 'multi-view' as WorkflowMode,

  // Progressive generation workflow initial state (NEW)
  generationState: 'idle' as GenerationState,
  frontViewApproval: {
    status: 'pending' as FrontViewStatus,
    imageUrl: null,
    approvalId: null,
    iterationCount: 0,
  },
  viewGenerationProgress: {
    front: 'pending' as ViewProgress,
    back: 'pending' as ViewProgress,
    side: 'pending' as ViewProgress,
    top: 'pending' as ViewProgress,
    bottom: 'pending' as ViewProgress,
  },
};

export const useEditorStore = create<EditorState>()(
  devtools(
    (set) => ({
      ...initialState,

      setProductInfo: (id, name, description) =>
        set(() => ({
          productId: id,
          productName: name,
          productDescription: description,
        })),

      setCurrentViews: (views) =>
        set((state) => ({
          currentViews: { ...state.currentViews, ...views },
        })),

      setRevisions: (revisions) =>
        set({ revisions }),

      addRevision: (revision) =>
        set((state) => ({
          revisions: [
            ...state.revisions.map((r) => ({ ...r, isActive: false })),
            { ...revision, isActive: true },
          ],
        })),

      removeRevision: (revisionId) =>
        set((state) => ({
          revisions: state.revisions.filter((r) => r.id !== revisionId),
        })),

      setLoadingView: (view, isLoading) =>
        set((state) => ({
          loadingViews: {
            ...state.loadingViews,
            [view]: isLoading,
          },
        })),

      setAllLoadingViews: (isLoading) =>
        set({
          loadingViews: {
            front: isLoading,
            back: isLoading,
            side: isLoading,
            top: isLoading,
            bottom: isLoading,
          },
        }),

      setCurrentProcessingView: (view) =>
        set({ currentProcessingView: view }),

      setViewport: (viewport) =>
        set((state) => ({
          viewport: { ...state.viewport, ...viewport },
        })),

      resetViewport: () =>
        set({
          viewport: {
            zoomLevel: EDITOR_DEFAULTS.ZOOM_DEFAULT,
            viewPosition: { x: 0, y: 0 },
            isDragging: false,
            dragStart: { x: 0, y: 0 },
          },
        }),

      setVisualEditMode: (enabled) => {
        devLog("editor-store-visual-mode", { enabled }, "Visual edit mode");
        set({ isVisualEditMode: enabled });
      },

      setSelectedTool: (tool) =>
        set({ selectedTool: tool }),

      setDrawColor: (color) =>
        set({ drawColor: color }),

      toggleHistory: () =>
        set((state) => ({ showHistory: !state.showHistory })),

      toggleMobileChat: () =>
        set((state) => ({ showMobileChat: !state.showMobileChat })),

      setIsInitialGeneration: (isInitial) =>
        set({ isInitialGeneration: isInitial }),

      reset: () => set(initialState),

      // Progressive generation workflow actions (NEW)

      /**
       * Sets the workflow mode - determines which component tree to render
       * @param mode - 'front-view' for front view approval/viewing, 'multi-view' for all 5 views, null for initial
       */
      setWorkflowMode: (mode) => {
        devLog("editor-store-workflow", { mode }, "Workflow mode changed");
        set({ workflowMode: mode });
      },

      /**
       * Updates the current generation state in the workflow state machine
       * @param state - The new generation state
       */
      setGenerationState: (state) => {
        devLog("editor-store-generation", { state }, "Generation state changed");
        set({ generationState: state });
      },

      /**
       * Updates front view approval information
       * Supports partial updates to avoid overwriting unrelated fields
       * @param approval - Partial front view approval object
       */
      setFrontViewApproval: (approval) =>
        set((state) => ({
          frontViewApproval: {
            ...state.frontViewApproval,
            ...approval,
          },
        })),

      /**
       * Updates the generation progress for a specific view
       * Used during progressive generation to track individual view status
       * @param view - The view type (front, back, side, top, bottom)
       * @param progress - The progress state (pending, generating, completed)
       */
      updateViewProgress: (view, progress) => {
        devLog("editor-store-progress", { view, progress }, "View progress updated");
        set((state) => ({
          viewGenerationProgress: {
            ...state.viewGenerationProgress,
            [view]: progress,
          },
        }));
      },

      /**
       * Resets the progressive generation workflow state to initial values
       * Useful when starting a new generation or canceling current workflow
       * Does NOT reset the entire editor state, only workflow-specific fields
       */
      resetWorkflowState: () => {
        devLog("editor-store-reset", {}, "Workflow state reset");
        set({
          workflowMode: 'multi-view',
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
        });
      },
    }),
    {
      name: 'ai-designer-editor',
    }
  )
);
