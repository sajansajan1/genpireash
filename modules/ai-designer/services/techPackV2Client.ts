/**
 * Tech Pack V2 API Client
 * Handles all API calls and updates Zustand store directly
 */

import { useTechPackV2Store } from '../store/techPackV2Store';
import type { BaseViewData, ComponentData, CloseUpData, SketchData, FlatSketchData, AssemblyViewData, CategoryData } from '../store/techPackV2Store';

const API_BASE = '/api/tech-pack-v2';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Tech Pack V2 Client
 * All methods update the Zustand store directly for immediate UI updates
 */
class TechPackV2Client {
  /**
   * Generate complete tech pack (all steps)
   * Cost: 10 credits total
   * Time: ~2-3 minutes
   */
  async generateComplete(
    productId: string,
    revisionIds: string[],
    primaryImageUrl: string
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Step 1: Set generating state
      store.setGenerationStatus({
        isGenerating: true,
        currentStep: 'category',
        progress: 0,
        currentStepDetail: 'Starting tech pack generation...',
        error: null,
      });

      // Step 2: Category Detection (1 credit, ~5-10s)
      store.setGenerationStatus({
        currentStep: 'category',
        progress: 5,
        currentStepDetail: 'Analyzing product category...',
      });

      const categoryResponse = await fetch(`${API_BASE}/detect-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, imageUrl: primaryImageUrl }),
      });

      const categoryResult: ApiResponse<CategoryData> = await categoryResponse.json();

      if (!categoryResult.success || !categoryResult.data) {
        throw new Error(categoryResult.error || 'Category detection failed');
      }

      store.setCategory(categoryResult.data);
      store.addCreditsUsage('categoryDetection', 1);
      store.setGenerationStatus({ progress: 10 });

      // Step 3: Base View Analysis (0 credits - free, ~30-45s)
      store.setGenerationStatus({
        currentStep: 'base-views',
        progress: 10,
        currentStepDetail: 'Analyzing product views...',
      });

      const baseViewsResponse = await fetch(`${API_BASE}/analyze-base-views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          revisionIds,
          category: categoryResult.data.category,
        }),
      });

      const baseViewsResult: ApiResponse<{ baseViews: BaseViewData[] }> = await baseViewsResponse.json();

      if (!baseViewsResult.success || !baseViewsResult.data) {
        throw new Error(baseViewsResult.error || 'Base view analysis failed');
      }

      store.setBaseViews(baseViewsResult.data.baseViews);
      store.addCreditsUsage('baseViews', revisionIds.length);
      store.setGenerationStatus({ progress: 30 });

      // Collect base view analyses with image URLs and revision IDs for reference
      const baseViewAnalyses = baseViewsResult.data.baseViews.map((bv: any) => ({
        viewType: bv.viewType,
        imageUrl: bv.imageUrl,
        analysisData: bv.analysisData,
        revisionId: bv.revisionId,
      }));

      // Steps 4-6: Generate Components, Close-ups, and Sketches IN PARALLEL
      // This significantly reduces total generation time since they're independent
      store.setGenerationStatus({
        currentStep: 'components',
        progress: 30,
        currentStepDetail: 'Generating components, close-ups, and sketches in parallel...',
      });

      // Set up loading states for all three
      const expectedComponents = 5;
      for (let i = 0; i < expectedComponents; i++) {
        store.addComponent({
          id: `temp-${i}`,
          componentName: 'Loading...',
          componentType: 'material',
          imageUrl: '',
          guide: null,
          order: i + 1,
          loadingState: 'loading',
          timestamp: Date.now(),
        });
      }

      const expectedCloseUps = 3;
      for (let i = 0; i < expectedCloseUps; i++) {
        store.addCloseUp({
          id: `temp-${i}`,
          imageUrl: '',
          order: i,
          shotMetadata: { focus_area: 'Loading...', description: 'Generating...' },
          loadingState: 'loading',
          timestamp: Date.now(),
        });
      }

      const viewTypes: Array<'front' | 'back' | 'side'> = ['front', 'back', 'side'];
      viewTypes.forEach((viewType) => {
        store.addSketch({
          id: `temp-${viewType}`,
          viewType,
          imageUrl: '',
          callouts: [],
          measurements: {},
          loadingState: 'loading',
          timestamp: Date.now(),
        });
      });

      // Add loading placeholders for flat sketches
      viewTypes.forEach((viewType) => {
        store.addFlatSketch({
          id: `temp-flat-${viewType}`,
          viewType,
          imageUrl: '',
          loadingState: 'loading',
          timestamp: Date.now(),
        });
      });

      // Add loading placeholder for assembly view
      store.setAssemblyView({
        id: 'temp-assembly-view',
        imageUrl: '',
        loadingState: 'loading',
        timestamp: Date.now(),
      });

      // Build product analysis for sketches
      const productAnalysisWithRevisions = {
        base_views: baseViewsResult.data.baseViews.map((bv: any) => ({
          view_type: bv.viewType,
          image_url: bv.imageUrl,
          analysis: bv.analysisData,
          revision_id: bv.revisionId,
        })),
      };

      // Generate all five in parallel using Promise.all
      const [componentsResult, closeUpsResult, sketchesResult, flatSketchesResult, assemblyViewResult] = await Promise.all([
        // Component generation
        fetch(`${API_BASE}/generate-components`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            productCategory: categoryResult.data.category,
            baseViewAnalyses,
          }),
        }).then(res => res.json()),

        // Close-up generation
        fetch(`${API_BASE}/generate-closeups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            productCategory: categoryResult.data.category,
            baseViewAnalyses,
          }),
        }).then(res => res.json()),

        // Sketch generation
        fetch(`${API_BASE}/generate-sketches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            productCategory: categoryResult.data.category,
            productAnalysis: productAnalysisWithRevisions,
          }),
        }).then(res => res.json()),

        // Flat sketch generation
        fetch(`${API_BASE}/generate-flat-sketches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            productCategory: categoryResult.data.category,
            productAnalysis: productAnalysisWithRevisions,
          }),
        }).then(res => res.json()),

        // Assembly view generation
        fetch(`${API_BASE}/generate-assembly-view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            productCategory: categoryResult.data.category,
            productAnalysis: productAnalysisWithRevisions,
          }),
        }).then(res => res.json()),
      ]);

      // Process components
      if (!componentsResult.success || !componentsResult.data) {
        throw new Error(componentsResult.error || 'Component generation failed');
      }

      const transformedComponents: ComponentData[] = componentsResult.data.components.map((component: any, index: number) => ({
        id: component.analysisId,
        componentName: component.componentName,
        componentType: component.componentType,
        imageUrl: component.imageUrl,
        thumbnailUrl: component.thumbnailUrl,
        guide: component.guide,
        shotData: component.shotData,
        order: index + 1,
        loadingState: 'loaded' as const,
        timestamp: Date.now(),
      }));

      store.setComponents(transformedComponents);
      store.addCreditsUsage('components', componentsResult.data.components.length);

      // Process close-ups
      if (!closeUpsResult.success || !closeUpsResult.data) {
        throw new Error(closeUpsResult.error || 'Close-up generation failed');
      }

      const transformedCloseUps: CloseUpData[] = closeUpsResult.data.closeUps.map((closeUp: any, index: number) => ({
        id: closeUp.revisionId || closeUp.analysisId,
        imageUrl: closeUp.imageUrl,
        thumbnailUrl: closeUp.thumbnailUrl,
        shotMetadata: {
          focus_area: closeUp.shotName,
          description: closeUp.analysisData?.detailed_observations?.material_details?.surface_quality ||
                      closeUp.analysisData?.shot_name ||
                      'Detailed close-up shot',
        },
        analysisData: closeUp.analysisData,
        summary: closeUp.summary,
        order: index + 1,
        loadingState: 'loaded' as const,
        timestamp: Date.now(),
      }));

      store.setCloseUps(transformedCloseUps);
      store.addCreditsUsage('closeUps', 3);

      // Process sketches
      if (!sketchesResult.success || !sketchesResult.data) {
        throw new Error(sketchesResult.error || 'Sketches generation failed');
      }

      const transformedSketches: SketchData[] = sketchesResult.data.sketches.map((sketch: any) => ({
        id: sketch.revisionId || sketch.analysisId,
        viewType: sketch.viewType,
        imageUrl: sketch.imageUrl,
        callouts: sketch.callouts?.callouts?.map((callout: any, index: number) => ({
          id: `callout-${index + 1}`,
          text: callout.feature_name || callout.specification,
          position: { x: 50 + (index * 10), y: 20 + (index * 15) }, // Default positions - will be overridden by UI
          type: callout.category || 'note',
        })) || [],
        measurements: {}, // Extract from callouts if needed
        summary: sketch.summary, // Include comprehensive sketch summary
        loadingState: 'loaded' as const,
        timestamp: Date.now(),
      }));

      // Replace loading sketches with real ones
      store.setSketches(transformedSketches);
      store.addCreditsUsage('sketches', 6);

      // Process flat sketches
      if (!flatSketchesResult.success || !flatSketchesResult.data) {
        throw new Error(flatSketchesResult.error || 'Flat sketches generation failed');
      }

      const transformedFlatSketches: FlatSketchData[] = flatSketchesResult.data.flatSketches.map((sketch: any) => ({
        id: sketch.id,
        viewType: sketch.viewType,
        imageUrl: sketch.imageUrl,
        thumbnailUrl: sketch.thumbnailUrl,
        loadingState: 'loaded' as const,
        timestamp: Date.now(),
      }));

      // Replace loading flat sketches with real ones
      store.setFlatSketches(transformedFlatSketches);
      store.addCreditsUsage('flatSketches', 2);

      // Process assembly view
      if (!assemblyViewResult.success || !assemblyViewResult.data) {
        throw new Error(assemblyViewResult.error || 'Assembly view generation failed');
      }

      const transformedAssemblyView: AssemblyViewData = {
        id: assemblyViewResult.data.assemblyView.id,
        imageUrl: assemblyViewResult.data.assemblyView.imageUrl,
        thumbnailUrl: assemblyViewResult.data.assemblyView.thumbnailUrl,
        description: assemblyViewResult.data.assemblyView.description,
        summary: assemblyViewResult.data.assemblyView.summary, // Assembly guide data
        loadingState: 'loaded',
        timestamp: Date.now(),
      };

      // Set the assembly view
      store.setAssemblyView(transformedAssemblyView);
      store.addCreditsUsage('assemblyView', 2);
      store.setGenerationStatus({ progress: 100 });

      // Complete!
      store.setGenerationStatus({
        isGenerating: false,
        currentStep: 'complete',
        progress: 100,
        currentStepDetail: 'Tech pack generation complete!',
      });
    } catch (error) {
      console.error('Tech pack generation error:', error);

      store.setGenerationStatus({
        isGenerating: false,
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Generation failed',
      });

      throw error;
    }
  }

  /**
   * Generate only category detection + base view analysis (prerequisite for other sections)
   * Cost: 2 credits (1 for category, 1 per revision for base views)
   * Time: ~30-45 seconds
   */
  async generateBaseViewsOnly(
    productId: string,
    revisionIds: string[],
    primaryImageUrl: string
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Step 1: Set generating state
      store.setGenerationStatus({
        isGenerating: true,
        currentStep: 'category',
        progress: 0,
        currentStepDetail: 'Starting base view analysis...',
        error: null,
      });

      // Step 2: Category Detection (1 credit, ~5-10s)
      store.setGenerationStatus({
        currentStep: 'category',
        progress: 10,
        currentStepDetail: 'Analyzing product category...',
      });

      const categoryResponse = await fetch(`${API_BASE}/detect-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, imageUrl: primaryImageUrl }),
      });

      const categoryResult: ApiResponse<CategoryData> = await categoryResponse.json();

      if (!categoryResult.success || !categoryResult.data) {
        throw new Error(categoryResult.error || 'Category detection failed');
      }

      store.setCategory(categoryResult.data);
      store.addCreditsUsage('categoryDetection', 1);
      store.setGenerationStatus({ progress: 30 });

      // Step 3: Base View Analysis (1 credit per revision, ~30-45s)
      store.setGenerationStatus({
        currentStep: 'base-views',
        progress: 30,
        currentStepDetail: 'Analyzing product views...',
      });

      const baseViewsResponse = await fetch(`${API_BASE}/analyze-base-views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          revisionIds,
          category: categoryResult.data.category,
        }),
      });

      const baseViewsResult: ApiResponse<{ baseViews: BaseViewData[] }> = await baseViewsResponse.json();

      if (!baseViewsResult.success || !baseViewsResult.data) {
        throw new Error(baseViewsResult.error || 'Base view analysis failed');
      }

      store.setBaseViews(baseViewsResult.data.baseViews);
      store.addCreditsUsage('baseViews', revisionIds.length);

      // Complete!
      store.setGenerationStatus({
        isGenerating: false,
        currentStep: 'complete',
        progress: 100,
        currentStepDetail: 'Base view analysis complete!',
      });
    } catch (error) {
      console.error('Base view generation error:', error);

      store.setGenerationStatus({
        isGenerating: false,
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Generation failed',
      });

      throw error;
    }
  }

  /**
   * Edit a specific field in base view analysis
   * Cost: 1 credit
   * Time: ~5 seconds
   */
  async editField(
    revisionId: string,
    fieldPath: string,
    editPrompt: string,
    primaryImageUrl: string
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Create edit operation
      const editOperation = {
        id: `edit-${Date.now()}`,
        revisionId,
        fieldPath,
        originalValue: null, // Will be filled by backend
        newValue: null,
        editPrompt,
        status: 'in-progress' as const,
        timestamp: Date.now(),
      };

      store.addEditOperation(editOperation);

      const response = await fetch(`${API_BASE}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisionId,
          fieldPath,
          editPrompt,
          imageUrl: primaryImageUrl,
        }),
      });

      const result: ApiResponse<{ updatedAnalysis: any }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Edit failed');
      }

      // Update base view with new analysis
      store.updateBaseView(revisionId, {
        analysisData: result.data.updatedAnalysis,
      });

      store.updateEditOperation(editOperation.id, {
        status: 'completed',
        newValue: result.data.updatedAnalysis,
      });

      store.addCreditsUsage('edits', 1);
    } catch (error) {
      console.error('Edit field error:', error);
      throw error;
    }
  }

  /**
   * Regenerate a single base view
   * Cost: 1 credit
   * Time: ~10-15 seconds
   */
  async regenerateView(revisionId: string, regeneratePrompt?: string): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Create regeneration operation
      const regenOperation = {
        id: `regen-${Date.now()}`,
        assetType: 'base-view' as const,
        assetId: revisionId,
        regeneratePrompt,
        status: 'in-progress' as const,
        timestamp: Date.now(),
      };

      store.addRegenerationOperation(regenOperation);

      // Mark view as loading
      store.updateBaseView(revisionId, {
        cached: false,
      });

      const response = await fetch(`${API_BASE}/regenerate-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisionId,
          regeneratePrompt,
        }),
      });

      const result: ApiResponse<{ updatedView: BaseViewData }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Regeneration failed');
      }

      // Update base view with regenerated data
      store.updateBaseView(revisionId, result.data.updatedView);

      store.updateRegenerationOperation(regenOperation.id, {
        status: 'completed',
        newAssetId: result.data.updatedView.revisionId,
      });

      store.addCreditsUsage('regenerations', 1);
    } catch (error) {
      console.error('Regenerate view error:', error);
      throw error;
    }
  }

  /**
   * Regenerate a single sketch
   * Cost: 1 credit
   * Time: ~10-15 seconds
   */
  async regenerateSingleSketch(
    productId: string,
    viewType: 'front' | 'back' | 'side',
    regeneratePrompt?: string
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      const existingSketch = store.sketches.find((s) => s.viewType === viewType);

      if (existingSketch) {
        store.updateSketch(existingSketch.id, { loadingState: 'loading' });
      }

      const response = await fetch(`${API_BASE}/regenerate-sketch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          viewType,
          regeneratePrompt,
        }),
      });

      const result: ApiResponse<{ sketch: SketchData }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Sketch regeneration failed');
      }

      if (existingSketch) {
        store.updateSketch(existingSketch.id, result.data.sketch);
      } else {
        store.addSketch(result.data.sketch);
      }

      store.addCreditsUsage('regenerations', 1);
    } catch (error) {
      console.error('Regenerate sketch error:', error);
      throw error;
    }
  }

  /**
   * Regenerate all component images
   * Cost: 2 credits total
   * Time: ~60-90 seconds
   */
  async regenerateAllComponents(
    productId: string,
    productCategory: string,
    baseViews: BaseViewData[]
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Mark all existing components as loading
      store.components.forEach((component) => {
        store.updateComponent(component.id, { loadingState: 'loading' });
      });

      // Prepare base view analyses with revision IDs
      const baseViewAnalyses = baseViews.map((bv) => ({
        viewType: bv.viewType,
        imageUrl: bv.imageUrl,
        analysisData: bv.analysisData,
        revisionId: bv.revisionId,
      }));

      const response = await fetch(`${API_BASE}/generate-components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productCategory,
          baseViewAnalyses,
        }),
      });

      const result: ApiResponse<{ components: any[] }> = await response.json();

      if (!result.success || !result.data || !result.data.components) {
        throw new Error(result.error || 'Component images regeneration failed');
      }

      // Transform API response to match UI expectations
      const transformedComponents: ComponentData[] = result.data.components.map((component: any, index: number) => ({
        id: component.analysisId,
        componentName: component.componentName,
        componentType: component.componentType,
        imageUrl: component.imageUrl,
        thumbnailUrl: component.thumbnailUrl,
        guide: component.guide,
        shotData: component.shotData,
        order: index + 1,
        loadingState: 'loaded' as const,
        timestamp: Date.now(),
      }));

      // Replace components with regenerated ones
      store.setComponents(transformedComponents);
      store.addCreditsUsage('components', result.data.components.length);
    } catch (error) {
      console.error('Regenerate all components error:', error);
      throw error;
    }
  }

  /**
   * Regenerate all close-ups
   * Cost: 2 credits
   * Time: ~45-60 seconds
   */
  async regenerateAllCloseUps(
    productId: string,
    productCategory: string,
    baseViews: BaseViewData[]
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Mark all existing closeups as loading
      store.closeUps.forEach((closeUp) => {
        store.updateCloseUp(closeUp.id, { loadingState: 'loading' });
      });

      // Prepare base view analyses with revision IDs
      const baseViewAnalyses = baseViews.map((bv) => ({
        viewType: bv.viewType,
        imageUrl: bv.imageUrl,
        analysisData: bv.analysisData,
        revisionId: bv.revisionId,
      }));

      const response = await fetch(`${API_BASE}/generate-closeups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productCategory, // API expects "productCategory"
          baseViewAnalyses,
        }),
      });

      const result: ApiResponse<{ closeUps: any[] }> = await response.json();

      if (!result.success || !result.data || !result.data.closeUps) {
        throw new Error(result.error || 'Close-ups regeneration failed');
      }

      // Transform API response to match UI expectations
      const transformedCloseUps: CloseUpData[] = result.data.closeUps.map((closeUp: any, index: number) => ({
        id: closeUp.revisionId || closeUp.analysisId,
        imageUrl: closeUp.imageUrl,
        thumbnailUrl: closeUp.thumbnailUrl,
        shotMetadata: {
          focus_area: closeUp.shotName,
          description: closeUp.analysisData?.detailed_observations?.material_details?.surface_quality ||
                      closeUp.analysisData?.shot_name ||
                      'Detailed close-up shot',
        },
        analysisData: closeUp.analysisData,
        summary: closeUp.summary, // Include comprehensive close-up summary
        order: index + 1,
        loadingState: 'loaded' as const,
        timestamp: Date.now(),
      }));

      // Replace closeups with regenerated ones
      store.setCloseUps(transformedCloseUps);
      store.addCreditsUsage('closeUps', 3);
    } catch (error) {
      console.error('Regenerate all close-ups error:', error);
      throw error;
    }
  }

  /**
   * Regenerate all technical sketches (front, back, side)
   * Cost: 6 credits total
   * Time: ~30-45 seconds
   */
  async regenerateAllSketches(
    productId: string,
    productCategory: string,
    baseViews: BaseViewData[]
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Mark all existing sketches as loading
      const viewTypes: Array<'front' | 'back' | 'side'> = ['front', 'back', 'side'];
      viewTypes.forEach((viewType) => {
        const existingSketch = store.sketches.find((s) => s.viewType === viewType);
        if (existingSketch) {
          store.updateSketch(existingSketch.id, { loadingState: 'loading' });
        }
      });

      // Build product analysis with base views including revision IDs
      const productAnalysisWithRevisions = {
        base_views: baseViews.map((bv) => ({
          view_type: bv.viewType,
          image_url: bv.imageUrl,
          analysis: bv.analysisData,
          revision_id: bv.revisionId,
        })),
      };

      const requestPayload = {
        productId,
        productCategory,
        productAnalysis: productAnalysisWithRevisions,
      };

      console.log('[Regenerate Sketches] Request payload:', {
        productId,
        productCategory,
        baseViewsCount: baseViews.length,
        hasProductAnalysis: !!productAnalysisWithRevisions,
      });

      const response = await fetch(`${API_BASE}/generate-sketches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const result: ApiResponse<{ sketches: any[] }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Sketches regeneration failed');
      }

      // Transform API response to match UI expectations
      const transformedSketches: SketchData[] = result.data.sketches.map((sketch: any) => ({
        id: sketch.revisionId || sketch.analysisId,
        viewType: sketch.viewType,
        imageUrl: sketch.imageUrl,
        callouts: sketch.callouts?.callouts?.map((callout: any, index: number) => ({
          id: `callout-${index + 1}`,
          text: callout.feature_name || callout.specification,
          position: { x: 50 + (index * 10), y: 20 + (index * 15) },
          type: callout.category || 'note',
        })) || [],
        measurements: {},
        summary: sketch.summary, // Include comprehensive sketch summary
        loadingState: 'loaded' as const,
        timestamp: Date.now(),
      }));

      // Replace sketches with regenerated ones
      store.setSketches(transformedSketches);
      store.addCreditsUsage('sketches', 6);
    } catch (error) {
      console.error('Regenerate all sketches error:', error);
      throw error;
    }
  }

  /**
   * Regenerate all flat sketches (front, back, side)
   * Cost: 2 credits total
   * Time: ~20-30 seconds
   */
  async regenerateAllFlatSketches(
    productId: string,
    productCategory: string,
    baseViews: BaseViewData[]
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Mark all existing flat sketches as loading
      const viewTypes: Array<'front' | 'back' | 'side'> = ['front', 'back', 'side'];
      viewTypes.forEach((viewType) => {
        const existingSketch = store.flatSketches.find((s) => s.viewType === viewType);
        if (existingSketch) {
          store.updateFlatSketch(existingSketch.id, { loadingState: 'loading' });
        } else {
          // Add loading placeholder if doesn't exist
          store.addFlatSketch({
            id: `temp-flat-${viewType}`,
            viewType,
            imageUrl: '',
            loadingState: 'loading',
            timestamp: Date.now(),
          });
        }
      });

      // Build product analysis with base views including revision IDs
      const productAnalysisWithRevisions = {
        base_views: baseViews.map((bv) => ({
          view_type: bv.viewType,
          image_url: bv.imageUrl,
          analysis: bv.analysisData,
          revision_id: bv.revisionId,
        })),
      };

      const requestPayload = {
        productId,
        productCategory,
        productAnalysis: productAnalysisWithRevisions,
      };

      console.log('[Regenerate Flat Sketches] Request payload:', {
        productId,
        productCategory,
        baseViewsCount: baseViews.length,
      });

      const response = await fetch(`${API_BASE}/generate-flat-sketches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const result: ApiResponse<{ flatSketches: any[] }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Flat sketches regeneration failed');
      }

      // Transform API response to match UI expectations
      const transformedFlatSketches: FlatSketchData[] = result.data.flatSketches.map((sketch: any) => ({
        id: sketch.id,
        viewType: sketch.viewType,
        imageUrl: sketch.imageUrl,
        thumbnailUrl: sketch.thumbnailUrl,
        loadingState: 'loaded' as const,
        timestamp: Date.now(),
      }));

      // Replace flat sketches with regenerated ones
      store.setFlatSketches(transformedFlatSketches);
      store.addCreditsUsage('flatSketches', 2);
    } catch (error) {
      console.error('Regenerate all flat sketches error:', error);
      throw error;
    }
  }

  /**
   * Regenerate assembly view (exploded/build view)
   * Cost: 2 credits
   * Time: ~15-25 seconds
   */
  async regenerateAssemblyView(
    productId: string,
    productCategory: string,
    baseViews: BaseViewData[]
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Set loading state
      store.setAssemblyView({
        id: 'temp-assembly-view',
        imageUrl: '',
        loadingState: 'loading',
        timestamp: Date.now(),
      });

      // Build product analysis with base views including revision IDs
      const productAnalysisWithRevisions = {
        base_views: baseViews.map((bv) => ({
          view_type: bv.viewType,
          image_url: bv.imageUrl,
          analysis: bv.analysisData,
          revision_id: bv.revisionId,
        })),
      };

      // Extract component names if available from base view analyses
      const components: string[] = [];
      baseViews.forEach((bv) => {
        if (bv.analysisData?.materials_detected) {
          bv.analysisData.materials_detected.forEach((material: any) => {
            if (material.material_type) {
              components.push(material.material_type);
            }
          });
        }
      });

      const requestPayload = {
        productId,
        productCategory,
        productAnalysis: productAnalysisWithRevisions,
        components: components.length > 0 ? components : undefined,
      };

      console.log('[Regenerate Assembly View] Request payload:', {
        productId,
        productCategory,
        baseViewsCount: baseViews.length,
        componentsCount: components.length,
      });

      const response = await fetch(`${API_BASE}/generate-assembly-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const result: ApiResponse<{ assemblyView: any }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Assembly view regeneration failed');
      }

      // Transform API response to match UI expectations
      const transformedAssemblyView: AssemblyViewData = {
        id: result.data.assemblyView.id,
        imageUrl: result.data.assemblyView.imageUrl,
        thumbnailUrl: result.data.assemblyView.thumbnailUrl,
        description: result.data.assemblyView.description,
        summary: result.data.assemblyView.summary, // Assembly guide data
        loadingState: 'loaded',
        timestamp: Date.now(),
      };

      // Set the assembly view
      store.setAssemblyView(transformedAssemblyView);
      store.addCreditsUsage('assemblyView', 2);
    } catch (error) {
      console.error('Regenerate assembly view error:', error);
      // Set error state
      store.updateAssemblyView({ loadingState: 'error' });
      throw error;
    }
  }

  /**
   * Load existing tech files for a specific product and revision
   * Checks if tech pack already exists for this revision
   */
  async loadExistingTechFiles(
    productId: string,
    revisionId: string
  ): Promise<{
    hasExistingData: boolean;
    category?: CategoryData;
    baseViews?: BaseViewData[];
    closeUps?: CloseUpData[];
    sketches?: SketchData[];
    flatSketches?: FlatSketchData[];
    assemblyView?: AssemblyViewData;
  }> {
    const store = useTechPackV2Store.getState();

    try {
      // Set loading state
      store.setIsLoadingExistingData(true);

      // Clear existing data first to prevent showing old revision's data
      store.setBaseViews([]);
      store.setComponents([]);
      store.setCloseUps([]);
      store.setSketches([]);
      store.setFlatSketches([]);
      store.setAssemblyView(null);
      store.setCategory(null);

      console.log('[Load Existing Files] Request params:', {
        productId,
        revisionId,
      });

      // Query tech_files table for existing files matching this product and revision
      const response = await fetch(`${API_BASE}/get-existing-files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          revisionId,
        }),
      });

      const result: ApiResponse<any> = await response.json();

      console.log('[Load Existing Files] Response:', {
        success: result.success,
        baseViewsCount: result.data?.baseViews?.length || 0,
        componentsCount: result.data?.components?.length || 0,
        closeUpsCount: result.data?.closeUps?.length || 0,
        sketchesCount: result.data?.sketches?.length || 0,
        flatSketchesCount: result.data?.flatSketches?.length || 0,
        hasAssemblyView: !!result.data?.assemblyView,
        hasCategory: !!result.data?.category,
        category: result.data?.category,
      });

      if (!result.success || !result.data) {
        store.setIsLoadingExistingData(false);
        return { hasExistingData: false };
      }

      // Check if we have any data
      const hasAnyData =
        (result.data.baseViews?.length > 0) ||
        (result.data.components?.length > 0) ||
        (result.data.closeUps?.length > 0) ||
        (result.data.sketches?.length > 0) ||
        (result.data.flatSketches?.length > 0) ||
        result.data.assemblyView ||
        result.data.category;

      if (!hasAnyData) {
        store.setIsLoadingExistingData(false);
        return { hasExistingData: false };
      }

      // Populate the store with new revision data
      if (result.data.baseViews?.length > 0) {
        // Additional safety filter: ensure all base views have valid viewType and imageUrl
        const validBaseViews = result.data.baseViews.filter(
          (view: BaseViewData) => view.viewType && view.imageUrl
        );
        console.log('[Load Existing Files] Base views validation:', {
          originalCount: result.data.baseViews.length,
          validCount: validBaseViews.length,
          invalidViews: result.data.baseViews.filter(
            (view: BaseViewData) => !view.viewType || !view.imageUrl
          ).map((v: BaseViewData) => ({
            revisionId: v.revisionId,
            hasViewType: !!v.viewType,
            hasImageUrl: !!v.imageUrl,
          })),
        });
        store.setBaseViews(validBaseViews);
      }

      if (result.data.components?.length > 0) {
        store.setComponents(result.data.components);
      }

      if (result.data.closeUps?.length > 0) {
        store.setCloseUps(result.data.closeUps);
      }

      if (result.data.sketches?.length > 0) {
        store.setSketches(result.data.sketches);
      }

      if (result.data.flatSketches?.length > 0) {
        store.setFlatSketches(result.data.flatSketches);
      }

      if (result.data.assemblyView) {
        store.setAssemblyView(result.data.assemblyView);
      }

      if (result.data.category) {
        store.setCategory(result.data.category);
      }

      // Clear loading state
      store.setIsLoadingExistingData(false);

      return {
        hasExistingData: true,
        ...result.data,
      };
    } catch (error) {
      console.error('Load existing tech files error:', error);
      store.setIsLoadingExistingData(false);
      return { hasExistingData: false };
    }
  }
}

// Export singleton instance
export const techPackV2Client = new TechPackV2Client();
