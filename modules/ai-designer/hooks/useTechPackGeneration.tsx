/**
 * useTechPackGeneration Hook
 * Provides a clean interface for components to interact with Tech Pack V2
 * Combines Zustand store with API client for easy component integration
 */

import { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  useTechPackV2Store,
  selectGenerationStatus,
  selectIsLoadingExistingData,
  selectCategory,
  selectBaseViews,
  selectComponents,
  selectCloseUps,
  selectSketches,
  selectFlatSketches,
  selectAssemblyView,
  selectCredits,
  selectIsGenerating,
  selectProgress,
  selectHasData,
} from '../store/techPackV2Store';
import { techPackV2Client } from '../services/techPackV2Client';
import { toast } from 'sonner';

export interface UseTechPackGenerationOptions {
  productId: string;
  revisionIds: string[];
  primaryImageUrl: string;
}

/**
 * Main hook for Tech Pack V2 generation and management
 *
 * @example
 * ```tsx
 * function TechPackPanel() {
 *   const {
 *     isGenerating,
 *     progress,
 *     category,
 *     baseViews,
 *     closeUps,
 *     sketches,
 *     credits,
 *     generateTechPack,
 *     editField,
 *     regenerateView,
 *   } = useTechPackGeneration({
 *     productId: '123',
 *     revisionIds: ['rev1', 'rev2'],
 *     primaryImageUrl: 'https://...',
 *   });
 *
 *   return (
 *     <div>
 *       <Button onClick={generateTechPack}>Generate</Button>
 *       {isGenerating && <Progress value={progress} />}
 *       {baseViews.map(view => <BaseViewCard view={view} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTechPackGeneration(options: UseTechPackGenerationOptions) {
  const { productId, revisionIds, primaryImageUrl } = options;

  // ============================================================================
  // STATE SELECTORS (Optimized - only re-render when specific data changes)
  // ============================================================================

  const status = useTechPackV2Store(selectGenerationStatus);
  const isLoadingExistingData = useTechPackV2Store(selectIsLoadingExistingData);
  const category = useTechPackV2Store(selectCategory);
  const baseViews = useTechPackV2Store(selectBaseViews);
  const components = useTechPackV2Store(selectComponents);
  const closeUps = useTechPackV2Store(selectCloseUps);
  const sketches = useTechPackV2Store(selectSketches);
  const flatSketches = useTechPackV2Store(selectFlatSketches);
  const assemblyView = useTechPackV2Store(selectAssemblyView);
  const credits = useTechPackV2Store(selectCredits);
  const isGenerating = useTechPackV2Store(selectIsGenerating);
  const progress = useTechPackV2Store(selectProgress);
  const hasData = useTechPackV2Store(selectHasData);

  // Store actions
  const reset = useTechPackV2Store((state) => state.reset);
  const resetGenerationStatus = useTechPackV2Store((state) => state.resetGenerationStatus);
  const toggleBaseViewExpanded = useTechPackV2Store((state) => state.toggleBaseViewExpanded);
  const addComponent = useTechPackV2Store((state) => state.addComponent);
  const addCloseUp = useTechPackV2Store((state) => state.addCloseUp);
  const addSketch = useTechPackV2Store((state) => state.addSketch);
  const addFlatSketch = useTechPackV2Store((state) => state.addFlatSketch);
  const setAssemblyView = useTechPackV2Store((state) => state.setAssemblyView);

  // ============================================================================
  // REVISION SWITCHING LOGIC
  // ============================================================================

  /**
   * Track previous revision ID to detect changes
   */
  const prevRevisionIdRef = useRef<string | null>(null);

  /**
   * Load existing tech files when revision changes
   * If no files exist, show initial generate state
   */
  useEffect(() => {
    // Get the selected revision ID (first one in array)
    const selectedRevisionId = revisionIds[0];

    console.log('[Tech Pack V2] Revision changed:', {
      productId,
      selectedRevisionId,
      previousRevisionId: prevRevisionIdRef.current,
    });

    // Skip if no product or revision
    if (!productId || !selectedRevisionId) {
      console.log('[Tech Pack V2] Skipping: Missing product or revision ID');
      return;
    }

    // Skip if revision hasn't changed
    if (prevRevisionIdRef.current === selectedRevisionId) {
      console.log('[Tech Pack V2] Skipping: Revision has not changed');
      return;
    }

    // Update previous revision ID
    prevRevisionIdRef.current = selectedRevisionId;

    // Don't interrupt active generation
    if (isGenerating) {
      console.log('[Tech Pack V2] Skipping: Generation in progress');
      return;
    }

    console.log('[Tech Pack V2] Loading existing tech files for revision:', selectedRevisionId);

    // Load existing tech files for this revision
    techPackV2Client
      .loadExistingTechFiles(productId, selectedRevisionId)
      .then((result) => {
        if (!result.hasExistingData) {
          console.log('[Tech Pack V2] No existing data found, showing initial state');
          // Clear store to show initial generate state
          reset();
        } else {
          console.log('[Tech Pack V2] Existing data loaded successfully:', {
            baseViews: result.baseViews?.length || 0,
            closeUps: result.closeUps?.length || 0,
            sketches: result.sketches?.length || 0,
          });
        }
        // If hasExistingData is true, store is already populated by loadExistingTechFiles
      })
      .catch((error) => {
        console.error('[Tech Pack V2] Failed to load existing tech files:', error);
        // Show initial state on error
        reset();
      });
  }, [productId, revisionIds, isGenerating, reset]);

  // ============================================================================
  // GENERATION ACTIONS
  // ============================================================================

  /**
   * Start complete tech pack generation
   * Generates: Category → Base Views → Components → Close-Ups → Sketches
   * Total: 10 credits, ~90-135 seconds
   */
  const generateTechPack = useCallback(async () => {
    try {
      // Validate inputs
      if (!productId) {
        toast.error('Product ID is required');
        return;
      }

      if (!revisionIds || revisionIds.length === 0) {
        toast.error('At least one revision is required');
        return;
      }

      if (!primaryImageUrl) {
        toast.error('Primary image URL is required');
        return;
      }

      // Reset state before generation
      reset();

      // Start generation (API client will update store)
      await techPackV2Client.generateComplete(
        productId,
        revisionIds,
        primaryImageUrl
      );

    } catch (error) {
      console.error('Tech pack generation error:', error);
      // Error already handled by API client, but log for debugging
    }
  }, [productId, revisionIds, primaryImageUrl, reset]);

  /**
   * Cancel ongoing generation
   * Aborts API requests and resets generation status
   */
  const cancelGeneration = useCallback(() => {
    // TODO: Implement abort controller in API client
    resetGenerationStatus();
    toast.info('Generation cancelled');
  }, [resetGenerationStatus]);

  /**
   * Generate only base views (category + base view analysis)
   * This is the prerequisite for components, close-ups, and sketches
   * Cost: 1 credit (analysis only, not image generation)
   * Time: ~30-45 seconds
   */
  const generateBaseViewsOnly = useCallback(async () => {
    try {
      // Validate inputs
      if (!productId) {
        toast.error('Product ID is required');
        return;
      }

      if (!revisionIds || revisionIds.length === 0) {
        toast.error('At least one revision is required');
        return;
      }

      if (!primaryImageUrl) {
        toast.error('Primary image URL is required');
        return;
      }

      toast.info('Generating base view analysis...');

      // Start generation (API client will update store)
      await techPackV2Client.generateBaseViewsOnly(
        productId,
        revisionIds,
        primaryImageUrl
      );

      toast.success('Base view analysis complete!');
    } catch (error) {
      console.error('Base view generation error:', error);
      toast.error('Failed to generate base view analysis');
    }
  }, [productId, revisionIds, primaryImageUrl]);

  // ============================================================================
  // EDIT ACTIONS
  // ============================================================================

  /**
   * Edit a specific field in base view analysis
   * Cost: 2 credits, ~5 seconds
   *
   * @example
   * ```tsx
   * await editField(
   *   'revision-123',
   *   'materials_detected.0.material_type',
   *   'Change from cotton to organic cotton'
   * );
   * ```
   */
  const editField = useCallback(
    async (revisionId: string, fieldPath: string, editPrompt: string) => {
      try {
        if (!revisionId || !fieldPath || !editPrompt) {
          toast.error('Missing required parameters for edit');
          return;
        }

        await techPackV2Client.editField(
          revisionId,
          fieldPath,
          editPrompt,
          primaryImageUrl
        );

      } catch (error) {
        console.error('Edit field error:', error);
        // Error already handled by API client
      }
    },
    [primaryImageUrl]
  );

  // ============================================================================
  // REGENERATION ACTIONS
  // ============================================================================

  /**
   * Regenerate base views (calls detect-category → analyze-base-views)
   * Cost: 1 credit, ~30-45 seconds
   * This re-runs the full base view analysis pipeline
   */
  const regenerateBaseView = useCallback(
    async (_revisionId?: string, _regeneratePrompt?: string) => {
      try {
        // Validate inputs
        if (!productId) {
          toast.error('Product ID is required');
          return;
        }

        if (!revisionIds || revisionIds.length === 0) {
          toast.error('At least one revision is required');
          return;
        }

        if (!primaryImageUrl) {
          toast.error('Primary image URL is required');
          return;
        }

        toast.info('Regenerating base view analysis...');

        // Use the same flow as generateBaseViewsOnly (detect-category → analyze-base-views)
        await techPackV2Client.generateBaseViewsOnly(
          productId,
          revisionIds,
          primaryImageUrl
        );

        toast.success('Base view analysis regenerated!');
      } catch (error) {
        console.error('Regenerate view error:', error);
        toast.error('Failed to regenerate base view analysis');
      }
    },
    [productId, revisionIds, primaryImageUrl]
  );

  /**
   * Regenerate all component images
   * Cost: 2 credits total, ~60-90 seconds
   * Note: This regenerates ALL component images, not individual ones
   */
  const regenerateAllComponents = useCallback(async () => {
    try {
      if (!productId || !category || baseViews.length === 0) {
        toast.error('Missing required data for component regeneration');
        return;
      }

      toast.info('Generating component images...');

      // If no components exist yet, add loading placeholders
      if (components.length === 0) {
        const expectedComponents = 5; // Estimated 5 components
        for (let i = 0; i < expectedComponents; i++) {
          addComponent({
            id: `temp-component-${i}`,
            componentName: 'Loading...',
            componentType: 'material',
            imageUrl: '',
            guide: null,
            order: i + 1,
            loadingState: 'loading',
            timestamp: Date.now(),
          });
        }
      }

      // Pass full base views array with revision IDs
      await techPackV2Client.regenerateAllComponents(
        productId,
        category.category,
        baseViews
      );

      toast.success('Component images generated successfully!');
    } catch (error) {
      console.error('Regenerate components error:', error);
      toast.error('Failed to generate component images');
    }
  }, [productId, category, baseViews, components.length, addComponent]);

  /**
   * Regenerate all close-ups
   * Cost: 2 credits total, ~45-60 seconds
   * Note: This regenerates ALL close-ups, not individual ones
   */
  const regenerateAllCloseUps = useCallback(async () => {
    try {
      if (!productId || !category || baseViews.length === 0) {
        toast.error('Missing required data for closeup regeneration');
        return;
      }

      toast.info('Generating close-ups...');

      // If no closeups exist yet, add loading placeholders
      if (closeUps.length === 0) {
        const expectedCloseUps = 6; // We generate 6 closeups
        for (let i = 0; i < expectedCloseUps; i++) {
          addCloseUp({
            id: `temp-closeup-${i}`,
            imageUrl: '',
            order: i + 1,
            shotMetadata: { focus_area: 'Loading...', description: 'Generating close-up...' },
            loadingState: 'loading',
            timestamp: Date.now(),
          });
        }
      }

      // Pass full base views array with revision IDs
      await techPackV2Client.regenerateAllCloseUps(
        productId,
        category.category,
        baseViews
      );

      toast.success('Close-ups generated successfully!');
    } catch (error) {
      console.error('Regenerate close-ups error:', error);
      toast.error('Failed to generate close-ups');
    }
  }, [productId, category, baseViews, closeUps.length, addCloseUp]);

  /**
   * Regenerate a single sketch (front, back, or side)
   * Cost: 2 credits, ~10-15 seconds
   *
   * @example
   * ```tsx
   * await regenerateSingleSketch('front', 'Add more measurement callouts');
   * ```
   */
  const regenerateSingleSketch = useCallback(
    async (viewType: 'front' | 'back' | 'side', regeneratePrompt?: string) => {
      try {
        // TODO: Implement regenerate-single-sketch endpoint
        // For now, show info toast
        toast.info(`Regenerating ${viewType} sketch...`);

      } catch (error) {
        console.error('Regenerate sketch error:', error);
      }
    },
    []
  );

  /**
   * Regenerate all technical sketches (front, back, side)
   * Cost: 6 credits total, ~30-45 seconds
   */
  const regenerateAllSketches = useCallback(async () => {
    try {
      console.log('[Regenerate Sketches] Debug data:', {
        productId,
        category,
        categoryString: category?.category,
        baseViewsCount: baseViews.length,
      });

      if (!productId || !category || baseViews.length === 0) {
        console.error('[Regenerate Sketches] Missing data:', {
          hasProductId: !!productId,
          hasCategory: !!category,
          baseViewsCount: baseViews.length,
        });
        toast.error('Missing required data for sketch regeneration');
        return;
      }

      toast.info('Generating technical sketches...');

      // If no sketches exist yet, add loading placeholders
      if (sketches.length === 0) {
        const viewTypes: Array<'front' | 'back' | 'side'> = ['front', 'back', 'side'];
        viewTypes.forEach((viewType) => {
          addSketch({
            id: `temp-sketch-${viewType}`,
            viewType,
            imageUrl: '',
            callouts: [],
            measurements: {},
            loadingState: 'loading',
            timestamp: Date.now(),
          });
        });
      }

      // Pass full base views array with revision IDs
      await techPackV2Client.regenerateAllSketches(
        productId,
        category.category,
        baseViews
      );

      toast.success('Sketches generated successfully!');
    } catch (error) {
      console.error('Regenerate all sketches error:', error);
      toast.error('Failed to generate sketches');
    }
  }, [productId, category, baseViews, sketches.length, addSketch]);

  /**
   * Regenerate all flat sketches (front, back, side)
   * Cost: 2 credits total, ~20-30 seconds
   */
  const regenerateAllFlatSketches = useCallback(async () => {
    try {
      console.log('[Regenerate Flat Sketches] Debug data:', {
        productId,
        category,
        categoryString: category?.category,
        baseViewsCount: baseViews.length,
      });

      if (!productId || !category || baseViews.length === 0) {
        console.error('[Regenerate Flat Sketches] Missing data:', {
          hasProductId: !!productId,
          hasCategory: !!category,
          baseViewsCount: baseViews.length,
        });
        toast.error('Missing required data for flat sketch regeneration');
        return;
      }

      toast.info('Generating flat sketches...');

      // If no flat sketches exist yet, add loading placeholders
      if (flatSketches.length === 0) {
        const viewTypes: Array<'front' | 'back' | 'side'> = ['front', 'back', 'side'];
        viewTypes.forEach((viewType) => {
          addFlatSketch({
            id: `temp-flat-${viewType}`,
            viewType,
            imageUrl: '',
            loadingState: 'loading',
            timestamp: Date.now(),
          });
        });
      }

      // Pass full base views array with revision IDs
      await techPackV2Client.regenerateAllFlatSketches(
        productId,
        category.category,
        baseViews
      );

      toast.success('Flat sketches generated successfully!');
    } catch (error) {
      console.error('Regenerate all flat sketches error:', error);
      toast.error('Failed to generate flat sketches');
    }
  }, [productId, category, baseViews, flatSketches.length, addFlatSketch]);

  /**
   * Regenerate assembly view (exploded/build view)
   * Cost: 2 credits, ~15-25 seconds
   */
  const regenerateAssemblyView = useCallback(async () => {
    try {
      console.log('[Regenerate Assembly View] Debug data:', {
        productId,
        category,
        categoryString: category?.category,
        baseViewsCount: baseViews.length,
      });

      if (!productId || !category || baseViews.length === 0) {
        console.error('[Regenerate Assembly View] Missing data:', {
          hasProductId: !!productId,
          hasCategory: !!category,
          baseViewsCount: baseViews.length,
        });
        toast.error('Missing required data for assembly view regeneration');
        return;
      }

      toast.info('Generating assembly view...');

      // Set loading state
      setAssemblyView({
        id: 'temp-assembly-view',
        imageUrl: '',
        loadingState: 'loading',
        timestamp: Date.now(),
      });

      // Pass full base views array with revision IDs
      await techPackV2Client.regenerateAssemblyView(
        productId,
        category.category,
        baseViews
      );

      toast.success('Assembly view generated successfully!');
    } catch (error) {
      console.error('Regenerate assembly view error:', error);
      toast.error('Failed to generate assembly view');
    }
  }, [productId, category, baseViews, setAssemblyView]);

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  /**
   * Toggle expand/collapse for a base view
   * Automatically collapses other views for clean UI
   */
  const handleToggleBaseView = useCallback(
    (revisionId: string) => {
      toggleBaseViewExpanded(revisionId);
    },
    [toggleBaseViewExpanded]
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Current generation step details for UI display
   */
  const currentStepInfo = useMemo(() => {
    const stepMap = {
      idle: { name: 'Ready', color: 'gray' },
      category: { name: 'Detecting Category', color: 'blue' },
      'base-views': { name: 'Analyzing Views', color: 'blue' },
      components: { name: 'Generating Components, Close-Ups & Sketches', color: 'blue' },
      'close-ups': { name: 'Generating Close-Ups', color: 'purple' },
      sketches: { name: 'Creating Sketches', color: 'green' },
      'flat-sketches': { name: 'Creating Flat Sketches', color: 'green' },
      'assembly-view': { name: 'Creating Assembly View', color: 'orange' },
      complete: { name: 'Complete', color: 'green' },
      error: { name: 'Error', color: 'red' },
    };

    return stepMap[status.currentStep] || stepMap.idle;
  }, [status.currentStep]);

  /**
   * Progress by step (for detailed progress UI)
   * Each step shows as "in-progress" (>0 but <100) when it's the active step
   * Only show progress for sections that actually have data or are actively being generated
   * Important: Check loadingState to distinguish between placeholders and actual loaded data
   */
  const stepProgress = useMemo(() => {
    // Determine if we're generating all sections or just base views
    const currentStep = status.currentStep;
    const isGeneratingAll = currentStep === 'components' || currentStep === 'close-ups' || currentStep === 'sketches' || currentStep === 'flat-sketches' || currentStep === 'assembly-view';

    // Count actually loaded items (not placeholders with loadingState: 'loading')
    const loadedComponents = components.filter(c => c.loadingState === 'loaded').length;
    const loadedCloseUps = closeUps.filter(c => c.loadingState === 'loaded').length;
    const loadedSketches = sketches.filter(s => s.loadingState === 'loaded').length;
    const loadedFlatSketches = flatSketches.filter(s => s.loadingState === 'loaded').length;

    // Check if we have all expected loaded items
    const hasAllComponents = loadedComponents > 0 && components.every(c => c.loadingState === 'loaded');
    const hasAllCloseUps = loadedCloseUps > 0 && closeUps.every(c => c.loadingState === 'loaded');
    const hasAllSketches = loadedSketches > 0 && sketches.every(s => s.loadingState === 'loaded');
    const hasAllFlatSketches = loadedFlatSketches > 0 && flatSketches.every(s => s.loadingState === 'loaded');
    const hasAssemblyView = assemblyView?.loadingState === 'loaded';

    // Calculate partial progress for items that are loading
    const componentsProgress = components.length > 0
      ? (loadedComponents / components.length) * 100
      : 0;
    const closeUpsProgress = closeUps.length > 0
      ? (loadedCloseUps / closeUps.length) * 100
      : 0;
    const sketchesProgress = sketches.length > 0
      ? (loadedSketches / sketches.length) * 100
      : 0;
    const flatSketchesProgress = flatSketches.length > 0
      ? (loadedFlatSketches / flatSketches.length) * 100
      : 0;

    return {
      // Category: completed if we have category data
      category: category ? 100 : (progress > 0 && progress < 10 ? Math.max(1, (progress / 10) * 100) : 0),
      // Base views: completed if we have base views data
      baseViews: baseViews.length > 0 ? 100 : (progress >= 10 && progress < 30 ? Math.max(1, ((progress - 10) / 20) * 100) : 0),
      // Components: show actual progress based on loaded items
      components: hasAllComponents ? 100 : (components.length > 0 ? Math.max(1, componentsProgress) : (isGeneratingAll && progress >= 30 ? Math.max(1, ((progress - 30) / 70) * 100) : 0)),
      // Close-ups: show actual progress based on loaded items
      closeUps: hasAllCloseUps ? 100 : (closeUps.length > 0 ? Math.max(1, closeUpsProgress) : (isGeneratingAll && progress >= 30 ? Math.max(1, ((progress - 30) / 70) * 100) : 0)),
      // Sketches: show actual progress based on loaded items
      sketches: hasAllSketches ? 100 : (sketches.length > 0 ? Math.max(1, sketchesProgress) : (isGeneratingAll && progress >= 30 ? Math.max(1, ((progress - 30) / 70) * 100) : 0)),
      // Flat sketches: show actual progress based on loaded items
      flatSketches: hasAllFlatSketches ? 100 : (flatSketches.length > 0 ? Math.max(1, flatSketchesProgress) : (isGeneratingAll && progress >= 30 ? Math.max(1, ((progress - 30) / 70) * 100) : 0)),
      // Assembly view: show progress based on loaded state
      assemblyView: hasAssemblyView ? 100 : (assemblyView?.loadingState === 'loading' ? 50 : (isGeneratingAll && progress >= 30 ? Math.max(1, ((progress - 30) / 70) * 100) : 0)),
    };
  }, [progress, status.currentStep, category, baseViews.length, components, closeUps, sketches, flatSketches, assemblyView]);

  /**
   * Can start generation (has required data and not currently generating)
   */
  const canGenerate = useMemo(() => {
    return !isGenerating && productId && revisionIds.length > 0 && primaryImageUrl;
  }, [isGenerating, productId, revisionIds, primaryImageUrl]);

  /**
   * Estimated time remaining (rough calculation)
   */
  const estimatedTimeRemaining = useMemo(() => {
    if (!isGenerating || progress === 0) return null;

    const totalEstimatedTime = 120; // 2 minutes average
    const remainingProgress = 100 - progress;
    const remainingTime = (remainingProgress / 100) * totalEstimatedTime;

    if (remainingTime < 10) return 'Less than 10 seconds';
    if (remainingTime < 30) return 'About 30 seconds';
    if (remainingTime < 60) return 'About 1 minute';
    return `About ${Math.ceil(remainingTime / 60)} minutes`;
  }, [isGenerating, progress]);

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // State
    status,
    category,
    baseViews,
    components,
    closeUps,
    sketches,
    flatSketches,
    assemblyView,
    credits,

    // Computed
    isGenerating,
    isLoadingExistingData,
    progress,
    hasData,
    currentStepInfo,
    stepProgress,
    canGenerate,
    estimatedTimeRemaining,

    // Generation actions
    generateTechPack,
    generateBaseViewsOnly,
    cancelGeneration,

    // Edit actions
    editField,

    // Regeneration actions
    regenerateBaseView,
    regenerateAllComponents,
    regenerateAllCloseUps,
    regenerateSingleSketch,
    regenerateAllSketches,
    regenerateAllFlatSketches,
    regenerateAssemblyView,

    // UI helpers
    handleToggleBaseView,
    reset,
  };
}

/**
 * Type for the hook return value (useful for prop types)
 */
export type UseTechPackGenerationReturn = ReturnType<typeof useTechPackGeneration>;
