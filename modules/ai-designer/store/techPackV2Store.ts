/**
 * Tech Pack V2 Zustand Store
 * Manages all state for Tech Pack V2 generation, editing, and regeneration
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

export interface CategoryData {
  category: string;
  subcategory: string;
  confidence: number;
  timestamp: number;
}

export interface BaseViewData {
  revisionId: string;
  viewType: string;
  imageUrl: string;
  thumbnailUrl?: string;
  analysisData: any;
  confidenceScore: number;
  cached: boolean;
  isExpanded: boolean; // UI state for expand/collapse
  version: number; // For optimistic updates
  timestamp?: number; // When the base view was generated/loaded
}

export interface CloseUpData {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  shotMetadata: {
    focus_area: string;
    description: string;
  };
  analysisData?: any;
  summary?: {
    overview: string;
    materialDetails: Array<{
      material: string;
      properties: string[];
      quality: string;
      finish: string;
    }>;
    constructionTechniques: Array<{
      technique: string;
      description: string;
      specifications: string;
    }>;
    designElements: Array<{
      element: string;
      description: string;
      purpose: string;
    }>;
    colorAndFinish: {
      primaryColor: string;
      hex: string | null;
      texture: string;
      sheen: string;
    };
    qualityIndicators: string[];
    manufacturingNotes: string[];
    summary: string;
  };
  order: number;
  loadingState: 'loading' | 'loaded' | 'error';
  timestamp: number;
}

export interface ComponentData {
  id: string;
  componentName: string;
  componentType: string;
  imageUrl: string;
  thumbnailUrl?: string;
  guide: any;
  shotData?: any;
  order: number;
  loadingState: 'loading' | 'loaded' | 'error';
  timestamp: number;
}

export interface SketchData {
  id: string;
  viewType: 'front' | 'back' | 'side';
  imageUrl: string;
  callouts: Array<{
    id: string;
    text: string;
    position: { x: number; y: number };
    type: 'dimension' | 'material' | 'construction' | 'note';
  }>;
  measurements: Record<string, { value: string; unit: string }>;
  summary?: {
    overview: string;
    measurements: Array<{
      name: string;
      value: string;
      location: string;
    }>;
    materials: Array<{
      type: string;
      properties: string[];
      location: string;
      percentage?: string;
    }>;
    construction: Array<{
      feature: string;
      details: string;
      technique: string;
    }>;
    designFeatures: Array<{
      name: string;
      description: string;
      location: string;
    }>;
    colors: Array<{
      name: string;
      hex: string | null;
      location: string;
      coverage: string;
    }>;
    manufacturingNotes: string[];
    summary: string;
  };
  loadingState: 'loading' | 'loaded' | 'error';
  timestamp: number;
}

export interface FlatSketchData {
  id: string;
  viewType: 'front' | 'back' | 'side';
  imageUrl: string;
  thumbnailUrl?: string;
  loadingState: 'loading' | 'loaded' | 'error';
  timestamp: number;
}

export interface AssemblyViewData {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  description?: string;
  summary?: any; // Assembly guide data (components, sequence, tools, etc.)
  loadingState: 'loading' | 'loaded' | 'error';
  timestamp: number;
}

export type GenerationStep =
  | 'idle'
  | 'category'
  | 'base-views'
  | 'components'
  | 'close-ups'
  | 'sketches'
  | 'flat-sketches'
  | 'assembly-view'
  | 'complete'
  | 'error';

export interface GenerationStatus {
  isGenerating: boolean;
  currentStep: GenerationStep;
  progress: number; // 0-100
  currentStepDetail: string; // e.g., "Analyzing front view..."
  error: string | null;
}

export interface CreditsUsage {
  categoryDetection: number;
  baseViews: number;
  components: number;
  closeUps: number;
  sketches: number;
  flatSketches: number;
  assemblyView: number;
  edits: number;
  regenerations: number;
  total: number;
}

export interface EditOperation {
  id: string;
  revisionId: string;
  fieldPath: string;
  originalValue: any;
  newValue: any;
  editPrompt: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  timestamp: number;
}

export interface RegenerationOperation {
  id: string;
  assetType: 'base-view' | 'close-up' | 'sketch';
  assetId: string;
  regeneratePrompt?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  newAssetId?: string;
  timestamp: number;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface TechPackV2State {
  // Data
  category: CategoryData | null;
  baseViews: BaseViewData[];
  components: ComponentData[];
  closeUps: CloseUpData[];
  sketches: SketchData[];
  flatSketches: FlatSketchData[];
  assemblyView: AssemblyViewData | null;

  // Generation status
  status: GenerationStatus;

  // Loading states
  isLoadingExistingData: boolean;

  // Credits tracking
  credits: CreditsUsage;

  // History
  editHistory: EditOperation[];
  regenerationHistory: RegenerationOperation[];

  // Actions - Generation
  setGenerationStatus: (status: Partial<GenerationStatus>) => void;
  setIsLoadingExistingData: (isLoading: boolean) => void;
  setCategory: (category: CategoryData | null) => void;
  setBaseViews: (views: BaseViewData[]) => void;
  addBaseView: (view: BaseViewData) => void;
  updateBaseView: (revisionId: string, updates: Partial<BaseViewData>) => void;
  updateBaseViewAnalysisField: (revisionId: string, fieldPath: string, value: any) => void;
  toggleBaseViewExpanded: (revisionId: string) => void;

  // Actions - Components
  setComponents: (components: ComponentData[]) => void;
  addComponent: (component: ComponentData) => void;
  updateComponent: (id: string, updates: Partial<ComponentData>) => void;

  // Actions - Close-ups
  setCloseUps: (closeUps: CloseUpData[]) => void;
  addCloseUp: (closeUp: CloseUpData) => void;
  updateCloseUp: (id: string, updates: Partial<CloseUpData>) => void;

  // Actions - Sketches
  setSketches: (sketches: SketchData[]) => void;
  addSketch: (sketch: SketchData) => void;
  updateSketch: (id: string, updates: Partial<SketchData>) => void;

  // Actions - Flat Sketches
  setFlatSketches: (flatSketches: FlatSketchData[]) => void;
  addFlatSketch: (flatSketch: FlatSketchData) => void;
  updateFlatSketch: (id: string, updates: Partial<FlatSketchData>) => void;

  // Actions - Assembly View
  setAssemblyView: (assemblyView: AssemblyViewData | null) => void;
  updateAssemblyView: (updates: Partial<AssemblyViewData>) => void;

  // Actions - Credits
  addCreditsUsage: (type: keyof Omit<CreditsUsage, 'total'>, amount: number) => void;

  // Actions - History
  addEditOperation: (operation: EditOperation) => void;
  updateEditOperation: (id: string, updates: Partial<EditOperation>) => void;
  addRegenerationOperation: (operation: RegenerationOperation) => void;
  updateRegenerationOperation: (id: string, updates: Partial<RegenerationOperation>) => void;

  // Actions - Reset
  reset: () => void;
  resetGenerationStatus: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  category: null,
  baseViews: [],
  components: [],
  closeUps: [],
  sketches: [],
  flatSketches: [],
  assemblyView: null,
  status: {
    isGenerating: false,
    currentStep: 'idle' as GenerationStep,
    progress: 0,
    currentStepDetail: '',
    error: null,
  },
  isLoadingExistingData: false,
  credits: {
    categoryDetection: 0,
    baseViews: 0,
    components: 0,
    closeUps: 0,
    sketches: 0,
    flatSketches: 0,
    assemblyView: 0,
    edits: 0,
    regenerations: 0,
    total: 0,
  },
  editHistory: [],
  regenerationHistory: [],
};

// ============================================================================
// STORE
// ============================================================================

export const useTechPackV2Store = create<TechPackV2State>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Generation Status
        setGenerationStatus: (status) =>
          set((state) => ({
            status: { ...state.status, ...status },
          }), false, 'setGenerationStatus'),

        // Loading State
        setIsLoadingExistingData: (isLoading) =>
          set({ isLoadingExistingData: isLoading }, false, 'setIsLoadingExistingData'),

        // Category
        setCategory: (category) =>
          set({ category }, false, 'setCategory'),

        // Base Views
        setBaseViews: (views) =>
          set({ baseViews: views }, false, 'setBaseViews'),

        addBaseView: (view) =>
          set(
            (state) => ({
              baseViews: [...state.baseViews, view],
            }),
            false,
            'addBaseView'
          ),

        updateBaseView: (revisionId, updates) =>
          set(
            (state) => ({
              baseViews: state.baseViews.map((view) =>
                view.revisionId === revisionId
                  ? { ...view, ...updates, version: view.version + 1 }
                  : view
              ),
            }),
            false,
            'updateBaseView'
          ),

        toggleBaseViewExpanded: (revisionId) =>
          set(
            (state) => ({
              baseViews: state.baseViews.map((view) =>
                view.revisionId === revisionId
                  ? { ...view, isExpanded: !view.isExpanded }
                  : { ...view, isExpanded: false } // Collapse others
              ),
            }),
            false,
            'toggleBaseViewExpanded'
          ),

        updateBaseViewAnalysisField: (revisionId, fieldPath, value) =>
          set(
            (state) => ({
              baseViews: state.baseViews.map((view) => {
                if (view.revisionId !== revisionId) return view;

                // Deep clone analysisData to avoid mutation
                const updatedAnalysisData = JSON.parse(JSON.stringify(view.analysisData));

                // Navigate to the field using dot notation (e.g., "materials_detected.0.material_type")
                const pathParts = fieldPath.split('.');
                let current = updatedAnalysisData;

                for (let i = 0; i < pathParts.length - 1; i++) {
                  const part = pathParts[i];
                  if (!current[part]) current[part] = {};
                  current = current[part];
                }

                // Set the final value
                const lastPart = pathParts[pathParts.length - 1];
                current[lastPart] = value;

                return {
                  ...view,
                  analysisData: updatedAnalysisData,
                  version: view.version + 1,
                };
              }),
            }),
            false,
            'updateBaseViewAnalysisField'
          ),

        // Components
        setComponents: (components) =>
          set({ components }, false, 'setComponents'),

        addComponent: (component) =>
          set(
            (state) => ({
              components: [...state.components, component].sort((a, b) => a.order - b.order),
            }),
            false,
            'addComponent'
          ),

        updateComponent: (id, updates) =>
          set(
            (state) => ({
              components: state.components.map((component) =>
                component.id === id ? { ...component, ...updates } : component
              ),
            }),
            false,
            'updateComponent'
          ),

        // Close-ups
        setCloseUps: (closeUps) =>
          set({ closeUps }, false, 'setCloseUps'),

        addCloseUp: (closeUp) =>
          set(
            (state) => ({
              closeUps: [...state.closeUps, closeUp].sort((a, b) => a.order - b.order),
            }),
            false,
            'addCloseUp'
          ),

        updateCloseUp: (id, updates) =>
          set(
            (state) => ({
              closeUps: state.closeUps.map((closeUp) =>
                closeUp.id === id ? { ...closeUp, ...updates } : closeUp
              ),
            }),
            false,
            'updateCloseUp'
          ),

        // Sketches
        setSketches: (sketches) =>
          set({ sketches }, false, 'setSketches'),

        addSketch: (sketch) =>
          set(
            (state) => ({
              sketches: [...state.sketches, sketch],
            }),
            false,
            'addSketch'
          ),

        updateSketch: (id, updates) =>
          set(
            (state) => ({
              sketches: state.sketches.map((sketch) =>
                sketch.id === id ? { ...sketch, ...updates } : sketch
              ),
            }),
            false,
            'updateSketch'
          ),

        // Flat Sketches
        setFlatSketches: (flatSketches) =>
          set({ flatSketches }, false, 'setFlatSketches'),

        addFlatSketch: (flatSketch) =>
          set(
            (state) => ({
              flatSketches: [...state.flatSketches, flatSketch],
            }),
            false,
            'addFlatSketch'
          ),

        updateFlatSketch: (id, updates) =>
          set(
            (state) => ({
              flatSketches: state.flatSketches.map((flatSketch) =>
                flatSketch.id === id ? { ...flatSketch, ...updates } : flatSketch
              ),
            }),
            false,
            'updateFlatSketch'
          ),

        // Assembly View
        setAssemblyView: (assemblyView) =>
          set({ assemblyView }, false, 'setAssemblyView'),

        updateAssemblyView: (updates) =>
          set(
            (state) => ({
              assemblyView: state.assemblyView
                ? { ...state.assemblyView, ...updates }
                : null,
            }),
            false,
            'updateAssemblyView'
          ),

        // Credits
        addCreditsUsage: (type, amount) =>
          set(
            (state) => ({
              credits: {
                ...state.credits,
                [type]: state.credits[type] + amount,
                total: state.credits.total + amount,
              },
            }),
            false,
            'addCreditsUsage'
          ),

        // History
        addEditOperation: (operation) =>
          set(
            (state) => ({
              editHistory: [operation, ...state.editHistory],
            }),
            false,
            'addEditOperation'
          ),

        updateEditOperation: (id, updates) =>
          set(
            (state) => ({
              editHistory: state.editHistory.map((op) =>
                op.id === id ? { ...op, ...updates } : op
              ),
            }),
            false,
            'updateEditOperation'
          ),

        addRegenerationOperation: (operation) =>
          set(
            (state) => ({
              regenerationHistory: [operation, ...state.regenerationHistory],
            }),
            false,
            'addRegenerationOperation'
          ),

        updateRegenerationOperation: (id, updates) =>
          set(
            (state) => ({
              regenerationHistory: state.regenerationHistory.map((op) =>
                op.id === id ? { ...op, ...updates } : op
              ),
            }),
            false,
            'updateRegenerationOperation'
          ),

        // Reset
        reset: () =>
          set(initialState, false, 'reset'),

        resetGenerationStatus: () =>
          set(
            {
              status: initialState.status,
            },
            false,
            'resetGenerationStatus'
          ),
      }),
      {
        name: 'tech-pack-v2-storage',
        partialize: (state) => ({
          // Only persist data, not loading states
          category: state.category,
          baseViews: state.baseViews,
          closeUps: state.closeUps.filter((c) => c.loadingState === 'loaded'),
          sketches: state.sketches.filter((s) => s.loadingState === 'loaded'),
          flatSketches: state.flatSketches.filter((f) => f.loadingState === 'loaded'),
          assemblyView: state.assemblyView?.loadingState === 'loaded' ? state.assemblyView : null,
          credits: state.credits,
          editHistory: state.editHistory,
          regenerationHistory: state.regenerationHistory,
        }),
      }
    ),
    { name: 'TechPackV2Store' }
  )
);

// ============================================================================
// SELECTORS (for performance optimization)
// ============================================================================

export const selectGenerationStatus = (state: TechPackV2State) => state.status;
export const selectIsLoadingExistingData = (state: TechPackV2State) => state.isLoadingExistingData;
export const selectCategory = (state: TechPackV2State) => state.category;
export const selectBaseViews = (state: TechPackV2State) => state.baseViews;
export const selectComponents = (state: TechPackV2State) => state.components;
export const selectCloseUps = (state: TechPackV2State) => state.closeUps;
export const selectSketches = (state: TechPackV2State) => state.sketches;
export const selectFlatSketches = (state: TechPackV2State) => state.flatSketches;
export const selectAssemblyView = (state: TechPackV2State) => state.assemblyView;
export const selectCredits = (state: TechPackV2State) => state.credits;

// Derived selectors
export const selectIsGenerating = (state: TechPackV2State) => state.status.isGenerating;
export const selectProgress = (state: TechPackV2State) => state.status.progress;
export const selectHasData = (state: TechPackV2State) =>
  state.baseViews.length > 0 || state.components.length > 0 || state.closeUps.length > 0 || state.sketches.length > 0 || state.flatSketches.length > 0 || state.assemblyView !== null;
export const selectExpandedBaseView = (state: TechPackV2State) =>
  state.baseViews.find((v) => v.isExpanded) || null;
export const selectCloseUpsProgress = (state: TechPackV2State) => {
  const closeUps = state.closeUps;
  if (closeUps.length === 0) return 0;
  const loaded = closeUps.filter((c) => c.loadingState === 'loaded').length;
  return Math.round((loaded / closeUps.length) * 100);
};
