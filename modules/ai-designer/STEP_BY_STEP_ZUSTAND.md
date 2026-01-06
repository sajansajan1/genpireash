# Tech Pack V2 - Step-by-Step Implementation with Zustand

## 📋 Implementation Roadmap

This guide breaks down the Tech Pack V2 integration into **12 manageable steps**, using **Zustand** for state management (matching the existing ai-designer architecture).

---

## Step 1: Create Zustand Store for State Management ✅ COMPLETE

### What We Built
A centralized Zustand store to manage all Tech Pack V2 data with automatic persistence.

### Why Zustand
- **Already in use**: Matches existing ai-designer architecture (`editorStore.ts`, `annotationStore.ts`)
- **Simple API**: `const baseViews = useTechPackV2Store(state => state.baseViews)`
- **Selective subscriptions**: Only re-render components that use specific state slices
- **Devtools**: Redux DevTools integration for debugging
- **Persistence**: Automatic localStorage syncing for offline support

### File Created: `modules/ai-designer/store/techPackV2Store.ts`

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Store includes:
// - Category data
// - Base views (expandable cards)
// - Close-ups (gallery)
// - Sketches (technical drawings)
// - Generation status & progress
// - Credits tracking
// - Edit/regeneration history
```

### How to Use in Components

```tsx
import { useTechPackV2Store, selectIsGenerating, selectProgress } from '../store/techPackV2Store';

function MyComponent() {
  // Option 1: Subscribe to entire store (re-renders on any change)
  const { baseViews, isGenerating } = useTechPackV2Store();

  // Option 2: Subscribe to specific selector (only re-renders when that value changes)
  const isGenerating = useTechPackV2Store(selectIsGenerating);
  const progress = useTechPackV2Store(selectProgress);

  // Option 3: Subscribe to specific state slice
  const baseViews = useTechPackV2Store(state => state.baseViews);

  // Actions
  const addBaseView = useTechPackV2Store(state => state.addBaseView);
  const toggleExpanded = useTechPackV2Store(state => state.toggleBaseViewExpanded);

  return (
    <div>
      {isGenerating && <ProgressBar value={progress} />}
      {baseViews.map(view => (
        <Card onClick={() => toggleExpanded(view.revisionId)} />
      ))}
    </div>
  );
}
```

### UI Behavior

```
User Action                    Store Update                      UI Response
─────────────────────────────────────────────────────────────────────────────
Click "Generate"        →      setGenerationStatus({ isGenerating: true })
                        →      Progress bar appears

Progress: 10%           →      setCategory({ category: "Apparel" })
                        →      Badge appears instantly

Progress: 40%           →      setBaseViews([...5 views])
                        →      5 cards appear in grid

Click card to expand    →      toggleBaseViewExpanded(id)
                        →      Card expands, others collapse

Progress: 70%           →      addCloseUp({ imageUrl: "..." })
                        →      New image appears in gallery
```

**Key Benefits:**
- ✅ **Instant UI updates**: Change store → all subscribed components re-render
- ✅ **Performance**: Components only re-render when their specific slice changes
- ✅ **Persistence**: Data survives page refresh
- ✅ **Debugging**: See all state changes in Redux DevTools
- ✅ **Type-safe**: Full TypeScript support

---

## Step 2: Build techPackV2Client API Service

### What We're Building
A service class that communicates with all Tech Pack V2 backend endpoints.

### File: `modules/ai-designer/services/techPackV2Client.ts`

```typescript
import { toast } from 'sonner';
import { useTechPackV2Store } from '../store/techPackV2Store';

export class TechPackV2Client {
  private baseUrl = '/api/tech-pack-v2';

  /**
   * Generate complete tech pack
   * Updates Zustand store as each step completes
   */
  async generateComplete(
    productId: string,
    revisionIds: string[],
    primaryImageUrl: string
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    try {
      // Initialize
      store.setGenerationStatus({
        isGenerating: true,
        currentStep: 'category',
        progress: 0,
        currentStepDetail: 'Starting generation...',
        error: null,
      });

      // ═══════════════════════════════════════════════════════════════
      // STEP 1: Category Detection (FREE, ~3s)
      // ═══════════════════════════════════════════════════════════════
      store.setGenerationStatus({
        progress: 5,
        currentStepDetail: 'Detecting product category...',
      });

      const categoryResponse = await fetch(`${this.baseUrl}/category/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, imageUrl: primaryImageUrl }),
      });

      const categoryData = await categoryResponse.json();

      if (categoryData.success) {
        // Update store immediately
        store.setCategory({
          category: categoryData.data.category,
          subcategory: categoryData.data.subcategory,
          confidence: categoryData.data.confidence,
          timestamp: Date.now(),
        });

        store.setGenerationStatus({ progress: 10 });

        // Show toast
        toast.success(
          `Category: ${categoryData.data.category} - ${categoryData.data.subcategory}`,
          { description: `${Math.round(categoryData.data.confidence * 100)}% confidence` }
        );
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 2: Base Views Analysis (3 credits, ~15-30s)
      // ═══════════════════════════════════════════════════════════════
      store.setGenerationStatus({
        currentStep: 'base-views',
        progress: 15,
        currentStepDetail: 'Analyzing base views...',
      });

      const baseViewsResponse = await fetch(`${this.baseUrl}/base-views/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          revisionIds,
          category: categoryData.data?.category,
        }),
      });

      const baseViewsData = await baseViewsResponse.json();

      if (!baseViewsData.success) {
        throw new Error(baseViewsData.error || 'Base views analysis failed');
      }

      // Update store with all base views
      store.setBaseViews(
        baseViewsData.data.analyses.map((analysis: any) => ({
          revisionId: analysis.revisionId,
          viewType: analysis.viewType,
          imageUrl: analysis.imageUrl,
          thumbnailUrl: analysis.thumbnailUrl,
          analysisData: analysis.analysisData,
          confidenceScore: analysis.confidenceScore,
          cached: analysis.cached || false,
          isExpanded: false,
          version: 1,
        }))
      );

      store.setGenerationStatus({ progress: 40 });
      store.addCreditsUsage('baseViews', 3);

      // Show cache hits
      const cachedCount = baseViewsData.data.analyses.filter((a: any) => a.cached).length;
      if (cachedCount > 0) {
        toast.success(`${cachedCount} views loaded from cache`, {
          description: 'Instant results, 0 additional credits',
        });
      }

      // ═══════════════════════════════════════════════════════════════
      // STEP 3: Close-Ups Generation (3 credits, ~45-60s)
      // ═══════════════════════════════════════════════════════════════
      store.setGenerationStatus({
        currentStep: 'close-ups',
        progress: 45,
        currentStepDetail: 'Generating close-up shots...',
      });

      const closeUpsResponse = await fetch(`${this.baseUrl}/close-ups/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          category: categoryData.data?.category || 'APPAREL',
          baseViewAnalyses: baseViewsData.data.analyses,
        }),
      });

      const closeUpsData = await closeUpsResponse.json();

      if (!closeUpsData.success) {
        throw new Error(closeUpsData.error || 'Close-ups generation failed');
      }

      // Add each close-up to store (appears in UI immediately)
      closeUpsData.data.generatedImages.forEach((img: any, index: number) => {
        store.addCloseUp({
          id: img.id,
          imageUrl: img.imageUrl,
          thumbnailUrl: img.thumbnailUrl,
          shotMetadata: img.shotMetadata || { focus_area: 'Detail', description: '' },
          analysisData: img.analysisData,
          order: img.order || index + 1,
          loadingState: 'loaded',
          timestamp: Date.now(),
        });

        // Update progress for each image
        const stepProgress = 45 + Math.floor((25 / closeUpsData.data.generatedImages.length) * (index + 1));
        store.setGenerationStatus({
          progress: stepProgress,
          currentStepDetail: `Close-up ${index + 1}/${closeUpsData.data.generatedImages.length} ready`,
        });
      });

      store.addCreditsUsage('closeUps', 3);

      // ═══════════════════════════════════════════════════════════════
      // STEP 4: Technical Sketches (3 credits, ~30-45s)
      // ═══════════════════════════════════════════════════════════════
      store.setGenerationStatus({
        currentStep: 'sketches',
        progress: 75,
        currentStepDetail: 'Creating technical sketches...',
      });

      const sketchesResponse = await fetch(`${this.baseUrl}/sketches/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          category: categoryData.data?.category || 'APPAREL',
          productAnalysis: {
            baseViews: baseViewsData.data.analyses,
            closeUps: closeUpsData.data.generatedImages,
          },
        }),
      });

      const sketchesData = await sketchesResponse.json();

      if (!sketchesData.success) {
        throw new Error(sketchesData.error || 'Sketches generation failed');
      }

      // Add each sketch to store
      sketchesData.data.sketches.forEach((sketch: any, index: number) => {
        store.addSketch({
          id: sketch.id,
          viewType: sketch.viewType,
          imageUrl: sketch.imageUrl,
          callouts: sketch.callouts || [],
          measurements: sketch.measurements || {},
          loadingState: 'loaded',
          timestamp: Date.now(),
        });

        // Update progress
        const stepProgress = 75 + Math.floor((21 / sketchesData.data.sketches.length) * (index + 1));
        store.setGenerationStatus({
          progress: stepProgress,
          currentStepDetail: `${sketch.viewType} sketch ready`,
        });
      });

      store.addCreditsUsage('sketches', 3);

      // ═══════════════════════════════════════════════════════════════
      // COMPLETE!
      // ═══════════════════════════════════════════════════════════════
      store.setGenerationStatus({
        isGenerating: false,
        currentStep: 'complete',
        progress: 100,
        currentStepDetail: 'Generation complete!',
      });

      toast.success('Tech Pack Complete!', {
        description: `9 credits used - ${baseViewsData.data.analyses.length} base views, ${closeUpsData.data.generatedImages.length} close-ups, ${sketchesData.data.sketches.length} sketches`,
        duration: 5000,
      });

    } catch (error) {
      console.error('Tech pack generation error:', error);

      store.setGenerationStatus({
        isGenerating: false,
        currentStep: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      toast.error('Generation Failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Edit single field (1 credit)
   */
  async editField(
    revisionId: string,
    fieldPath: string,
    editPrompt: string,
    referenceImageUrl: string
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    // Create operation record
    const operation = {
      id: `edit-${Date.now()}`,
      revisionId,
      fieldPath,
      originalValue: null, // TODO: Get from current state
      newValue: null,
      editPrompt,
      status: 'in-progress' as const,
      timestamp: Date.now(),
    };

    store.addEditOperation(operation);

    try {
      const response = await fetch(`${this.baseUrl}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId, fieldPath, editPrompt, referenceImageUrl }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Edit failed');
      }

      // Update base view with new value
      store.updateBaseView(revisionId, {
        analysisData: {
          ...store.baseViews.find(v => v.revisionId === revisionId)?.analysisData,
          [fieldPath]: data.data.updatedValue,
        },
      });

      // Update operation status
      store.updateEditOperation(operation.id, {
        status: 'completed',
        newValue: data.data.updatedValue,
      });

      // Track credits
      store.addCreditsUsage('edits', 1);

      toast.success('Field updated successfully');

    } catch (error) {
      store.updateEditOperation(operation.id, {
        status: 'error',
      });

      toast.error('Edit failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Regenerate single view (1 credit)
   */
  async regenerateView(
    revisionId: string,
    regeneratePrompt?: string
  ): Promise<void> {
    const store = useTechPackV2Store.getState();

    // Create operation record
    const operation = {
      id: `regen-${Date.now()}`,
      assetType: 'base-view' as const,
      assetId: revisionId,
      regeneratePrompt,
      status: 'in-progress' as const,
      timestamp: Date.now(),
    };

    store.addRegenerationOperation(operation);

    try {
      const response = await fetch(`${this.baseUrl}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId, regeneratePrompt }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Regeneration failed');
      }

      // Update base view with new data
      const currentView = store.baseViews.find(v => v.revisionId === revisionId);
      if (currentView) {
        store.updateBaseView(revisionId, {
          revisionId: data.data.newRevisionId,
          imageUrl: data.data.imageUrl,
          thumbnailUrl: data.data.thumbnailUrl,
          analysisData: data.data.analysisData,
          cached: false,
        });
      }

      // Update operation status
      store.updateRegenerationOperation(operation.id, {
        status: 'completed',
        newAssetId: data.data.newRevisionId,
      });

      // Track credits
      store.addCreditsUsage('regenerations', 1);

      toast.success('View regenerated successfully');

    } catch (error) {
      store.updateRegenerationOperation(operation.id, {
        status: 'error',
      });

      toast.error('Regeneration failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
}

export const techPackV2Client = new TechPackV2Client();
```

### How It Works

**The Power of Zustand + API Client:**

```
API Client calls backend
        ↓
Receives response data
        ↓
Updates Zustand store directly: store.setBaseViews([...])
        ↓
ALL components using that store slice re-render automatically
        ↓
User sees new data instantly in UI
```

**Timeline Example:**
```
T=0s    : User clicks "Generate"
         API: POST /category/detect
         Store: setGenerationStatus({ isGenerating: true, progress: 0 })
         UI: Progress bar appears

T=3s    : Category detected
         API: Response received
         Store: setCategory({ category: "Apparel" })
         UI: Category badge appears instantly

T=20s   : Base views analyzed
         API: Response received with 5 views
         Store: setBaseViews([view1, view2, view3, view4, view5])
         UI: 5 cards appear in grid instantly
         USER CAN NOW INTERACT: Click to expand, scroll, read details

T=30s   : First close-up ready
         API: Streaming response (image 1/8)
         Store: addCloseUp({ imageUrl: "..." })
         UI: First image appears in gallery
         USER CAN CLICK IT: View full size, zoom

T=35s   : Second close-up ready
         Store: addCloseUp({ imageUrl: "..." })
         UI: Second image appears
         (User is still browsing base views or first close-up)
```

**Non-Blocking UI:**
- ✅ User doesn't wait for everything to finish
- ✅ Can explore base views while close-ups generate
- ✅ Can zoom images while sketches generate
- ✅ Smooth, progressive experience

---

## Step 3: Create useTechPackGeneration Hook (Coming Next)

This hook will provide a clean interface for components:

```tsx
const {
  isGenerating,
  progress,
  category,
  baseViews,
  closeUps,
  sketches,
  credits,
  generateTechPack,
  editField,
  regenerateView,
} = useTechPackGeneration(productId, revisionIds, imageUrl);
```

**Why a hook?**
- Simple component code
- Reusable across components
- Handles side effects (API calls)
- Manages loading states
- Error handling built-in

---

## Next Steps

Want me to continue with:
- ✅ Step 3: useTechPackGeneration hook
- ✅ Step 4: ProgressiveLoader component
- ✅ Step 5: BaseViewsDisplay component
- ✅ Step 6-12: All remaining components

Let me know and I'll continue! 🚀
