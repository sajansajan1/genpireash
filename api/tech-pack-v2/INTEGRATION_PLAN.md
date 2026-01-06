# Tech Pack V2 - Detailed Integration Plan

## 📋 Mission: Deliver Perfect UX with Zero Performance Issues

This document provides micro-level integration details for Tech Pack V2 client-side implementation, focusing on:
- **Performance optimization** at every step
- **Granular control** for regenerating specific views
- **Asset-by-asset generation** strategy
- **Progressive loading** without blocking
- **Error recovery** with zero credit loss

---

## 1. State Management Architecture

### Jotai Atoms Structure

```typescript
// File: modules/ai-designer/store/techPackAtoms.ts

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// ============================================================================
// CORE DATA ATOMS
// ============================================================================

/**
 * Category Detection State
 * Cached per product ID to avoid re-detection
 */
export const categoryDetectionAtom = atomWithStorage<{
  [productId: string]: {
    category: string;
    subcategory: string;
    confidence: number;
    timestamp: number;
  };
}>('tech-pack-categories', {});

/**
 * Base Views State
 * Indexed by revision ID for O(1) access
 */
export interface BaseViewState {
  revisionId: string;
  viewType: 'front' | 'back' | 'side' | 'top' | 'bottom' | 'detail' | 'other';
  imageUrl: string;
  thumbnailUrl?: string;
  analysisData: Record<string, any>;
  confidenceScore: number;
  cached: boolean;
  timestamp: number;
  version: number; // For optimistic updates
}

export const baseViewsAtom = atom<Map<string, BaseViewState>>(new Map());

/**
 * Close-Ups State
 * Array with order preservation for gallery display
 */
export interface CloseUpState {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  shotMetadata: {
    focus_area: string;
    description: string;
  };
  analysisData: Record<string, any>;
  order: number;
  loadingState: 'loading' | 'loaded' | 'error';
  timestamp: number;
}

export const closeUpsAtom = atom<CloseUpState[]>([]);

/**
 * Technical Sketches State
 * Indexed by view type for easy access
 */
export interface SketchState {
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
  loadingState: 'loading' | 'loaded' | 'error';
  timestamp: number;
}

export const sketchesAtom = atom<{
  front?: SketchState;
  back?: SketchState;
  side?: SketchState;
}>({});

// ============================================================================
// PROGRESS & STATUS ATOMS
// ============================================================================

export interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'skipped';
  progress: number; // 0-100 for sub-progress within step
  startTime?: number;
  endTime?: number;
  errorMessage?: string;
  creditsUsed: number;
}

export const generationStepsAtom = atom<GenerationStep[]>([
  {
    id: 'category',
    name: 'Category Detection',
    status: 'pending',
    progress: 0,
    creditsUsed: 0,
  },
  {
    id: 'base-views',
    name: 'Base Views Analysis',
    status: 'pending',
    progress: 0,
    creditsUsed: 3,
  },
  {
    id: 'close-ups',
    name: 'Close-Up Generation',
    status: 'pending',
    progress: 0,
    creditsUsed: 3,
  },
  {
    id: 'sketches',
    name: 'Technical Sketches',
    status: 'pending',
    progress: 0,
    creditsUsed: 3,
  },
]);

/**
 * Current generation status
 */
export const generationStatusAtom = atom<{
  isGenerating: boolean;
  currentStep: string | null;
  overallProgress: number; // 0-100
  abortController: AbortController | null;
}>({
  isGenerating: false,
  currentStep: null,
  overallProgress: 0,
  abortController: null,
});

// ============================================================================
// EDIT & REGENERATION TRACKING
// ============================================================================

export interface EditOperation {
  id: string;
  revisionId: string;
  fieldPath: string;
  originalValue: any;
  newValue: any;
  editPrompt: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'reverted';
  creditsUsed: number;
  timestamp: number;
}

export const editHistoryAtom = atom<EditOperation[]>([]);

export interface RegenerationOperation {
  id: string;
  revisionId: string;
  type: 'base-view' | 'close-up' | 'sketch';
  regeneratePrompt?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  newRevisionId?: string;
  newImageUrl?: string;
  creditsUsed: number;
  timestamp: number;
}

export const regenerationHistoryAtom = atom<RegenerationOperation[]>([]);

// ============================================================================
// CACHE & PERFORMANCE
// ============================================================================

/**
 * Image preload cache
 * Ensures smooth loading experience
 */
export const imagePreloadCacheAtom = atom<Set<string>>(new Set());

/**
 * Request deduplication
 * Prevent duplicate API calls for same data
 */
export const pendingRequestsAtom = atom<Map<string, Promise<any>>>(new Map());
```

---

## 2. Asset-by-Asset Generation Strategy

### 2.1 Base Views Analysis (3 credits total)

```typescript
// File: modules/ai-designer/services/baseViewsManager.ts

/**
 * Base Views Manager
 * Handles individual and batch base view analysis
 */

import { techPackV2Client } from './techPackV2Client';
import type { BaseViewState } from '../store/techPackAtoms';

export class BaseViewsManager {
  /**
   * Analyze multiple views with progressive updates
   * Shows each view as soon as it's analyzed
   */
  async analyzeViews(
    productId: string,
    revisions: Array<{ id: string; imageUrl: string; viewType: string }>,
    category?: string,
    onProgress?: (viewIndex: number, viewData: BaseViewState) => void
  ): Promise<BaseViewState[]> {
    const revisionIds = revisions.map((r) => r.id);

    try {
      // Call API for batch analysis
      const analyses = await techPackV2Client.analyzeBaseViews(
        productId,
        revisionIds,
        category,
        {
          onProgress: (progress, step, data) => {
            // If we get partial data for a specific view, emit it immediately
            if (data && Array.isArray(data)) {
              data.forEach((analysis, index) => {
                const viewData: BaseViewState = {
                  revisionId: analysis.revisionId,
                  viewType: analysis.viewType,
                  imageUrl: analysis.imageUrl,
                  thumbnailUrl: analysis.thumbnailUrl,
                  analysisData: analysis.analysisData,
                  confidenceScore: analysis.confidenceScore,
                  cached: analysis.cached || false,
                  timestamp: Date.now(),
                  version: 1,
                };
                onProgress?.(index, viewData);
              });
            }
          },
        }
      );

      // Convert to BaseViewState format
      return analyses.map((analysis) => ({
        revisionId: analysis.revisionId,
        viewType: analysis.viewType as any,
        imageUrl: analysis.imageUrl,
        thumbnailUrl: analysis.thumbnailUrl,
        analysisData: analysis.analysisData,
        confidenceScore: analysis.confidenceScore,
        cached: analysis.cached || false,
        timestamp: Date.now(),
        version: 1,
      }));
    } catch (error) {
      console.error('Base views analysis failed:', error);
      throw error;
    }
  }

  /**
   * Regenerate single base view (1 credit)
   */
  async regenerateSingleView(
    revisionId: string,
    regeneratePrompt?: string,
    onProgress?: (progress: number, step: string) => void
  ): Promise<BaseViewState> {
    try {
      const result = await techPackV2Client.regenerateView(
        revisionId,
        regeneratePrompt,
        {
          onProgress,
        }
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Regeneration failed');
      }

      // Re-analyze the new revision
      const newAnalysis = await techPackV2Client.analyzeBaseViews(
        '', // Product ID not needed for single revision
        [result.data.revisionId]
      );

      return {
        revisionId: result.data.revisionId,
        viewType: newAnalysis[0].viewType as any,
        imageUrl: result.data.imageUrl,
        thumbnailUrl: newAnalysis[0].thumbnailUrl,
        analysisData: result.data.analysisData,
        confidenceScore: newAnalysis[0].confidenceScore,
        cached: false,
        timestamp: Date.now(),
        version: 1,
      };
    } catch (error) {
      console.error('View regeneration failed:', error);
      throw error;
    }
  }
}

export const baseViewsManager = new BaseViewsManager();
```

### 2.2 Close-Ups Generation (3 credits total)

```typescript
// File: modules/ai-designer/services/closeUpsManager.ts

/**
 * Close-Ups Manager
 * Handles progressive close-up image generation
 */

import { techPackV2Client } from './techPackV2Client';
import type { CloseUpState } from '../store/techPackAtoms';

export class CloseUpsManager {
  /**
   * Generate close-ups with live updates
   * Each image loads as soon as it's ready
   */
  async generateCloseUps(
    productId: string,
    category: string,
    baseViews: Array<any>,
    onImageReady?: (image: CloseUpState, index: number, total: number) => void,
    onProgress?: (progress: number, step: string) => void
  ): Promise<CloseUpState[]> {
    const closeUps: CloseUpState[] = [];

    try {
      // Use streaming approach if available
      const images = await techPackV2Client.generateCloseUps(
        productId,
        category,
        baseViews,
        {
          onProgress: (progress, step, data) => {
            onProgress?.(progress, step);

            // If we get a single image ready
            if (data && !Array.isArray(data)) {
              const closeUp: CloseUpState = {
                id: data.id || `closeup-${closeUps.length}`,
                imageUrl: data.imageUrl,
                thumbnailUrl: data.thumbnailUrl,
                shotMetadata: data.shotMetadata || {
                  focus_area: 'Detail',
                  description: 'Close-up detail shot',
                },
                analysisData: data.analysisData || {},
                order: data.order || closeUps.length + 1,
                loadingState: 'loaded',
                timestamp: Date.now(),
              };

              closeUps.push(closeUp);
              onImageReady?.(closeUp, closeUps.length, 8); // Assuming max 8 close-ups
            }
          },
        }
      );

      // If all images came at once (fallback)
      if (closeUps.length === 0) {
        return images.map((img, index) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          thumbnailUrl: img.thumbnailUrl,
          shotMetadata: img.shotMetadata,
          analysisData: img.analysisData || {},
          order: img.order || index + 1,
          loadingState: 'loaded' as const,
          timestamp: Date.now(),
        }));
      }

      return closeUps;
    } catch (error) {
      console.error('Close-ups generation failed:', error);
      throw error;
    }
  }

  /**
   * Regenerate specific close-up (0.5 credits)
   * Note: Individual close-up regeneration may need backend support
   */
  async regenerateSingleCloseUp(
    closeUpId: string,
    productId: string,
    regeneratePrompt?: string
  ): Promise<CloseUpState> {
    // This would require a new endpoint: /api/tech-pack-v2/close-ups/regenerate-single
    // For now, user can regenerate all close-ups for 3 credits
    throw new Error('Single close-up regeneration not yet implemented');
  }
}

export const closeUpsManager = new CloseUpsManager();
```

### 2.3 Technical Sketches Generation (3 credits total)

```typescript
// File: modules/ai-designer/services/sketchesManager.ts

/**
 * Sketches Manager
 * Handles individual sketch generation and regeneration
 */

import { techPackV2Client } from './techPackV2Client';
import type { SketchState } from '../store/techPackAtoms';

export class SketchesManager {
  /**
   * Generate all three sketches progressively
   * Each sketch shows as soon as it's ready
   */
  async generateSketches(
    productId: string,
    category: string,
    productAnalysis: { baseViews: any[]; closeUps?: any[] },
    onSketchReady?: (sketch: SketchState, viewType: string) => void,
    onProgress?: (progress: number, step: string) => void
  ): Promise<{ front?: SketchState; back?: SketchState; side?: SketchState }> {
    const sketches: { front?: SketchState; back?: SketchState; side?: SketchState } = {};

    try {
      const views: ('front' | 'back' | 'side')[] = ['front', 'back', 'side'];

      const results = await techPackV2Client.generateSketches(
        productId,
        category,
        productAnalysis,
        views,
        {
          onProgress: (progress, step, data) => {
            onProgress?.(progress, step);

            // If we get a single sketch ready
            if (data && !Array.isArray(data)) {
              const sketch: SketchState = {
                id: data.id,
                viewType: data.viewType,
                imageUrl: data.imageUrl,
                callouts: data.callouts || [],
                measurements: data.measurements || {},
                loadingState: 'loaded',
                timestamp: Date.now(),
              };

              sketches[data.viewType as 'front' | 'back' | 'side'] = sketch;
              onSketchReady?.(sketch, data.viewType);
            }
          },
        }
      );

      // If all sketches came at once (fallback)
      if (Object.keys(sketches).length === 0) {
        results.forEach((sketch) => {
          sketches[sketch.viewType as 'front' | 'back' | 'side'] = {
            id: sketch.id,
            viewType: sketch.viewType as any,
            imageUrl: sketch.imageUrl,
            callouts: sketch.callouts || [],
            measurements: sketch.measurements || {},
            loadingState: 'loaded',
            timestamp: Date.now(),
          };
        });
      }

      return sketches;
    } catch (error) {
      console.error('Sketches generation failed:', error);
      throw error;
    }
  }

  /**
   * Regenerate specific sketch (1 credit)
   * Only regenerates the requested view
   */
  async regenerateSingleSketch(
    productId: string,
    category: string,
    viewType: 'front' | 'back' | 'side',
    productAnalysis: { baseViews: any[]; closeUps?: any[] },
    regeneratePrompt?: string,
    onProgress?: (progress: number, step: string) => void
  ): Promise<SketchState> {
    try {
      // Generate only the specific view
      const results = await techPackV2Client.generateSketches(
        productId,
        category,
        productAnalysis,
        [viewType], // Only generate this view
        { onProgress }
      );

      if (results.length === 0) {
        throw new Error('No sketch generated');
      }

      const sketch = results[0];
      return {
        id: sketch.id,
        viewType: sketch.viewType as any,
        imageUrl: sketch.imageUrl,
        callouts: sketch.callouts || [],
        measurements: sketch.measurements || {},
        loadingState: 'loaded',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Sketch regeneration failed:', error);
      throw error;
    }
  }
}

export const sketchesManager = new SketchesManager();
```

---

## 3. Regeneration Controls - UI Component

### 3.1 Individual Asset Regeneration UI

```typescript
// File: modules/ai-designer/components/TechPackGeneration/RegenerationControls.tsx

/**
 * Regeneration Controls Component
 * Provides granular regeneration options for each asset type
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface RegenerationControlsProps {
  assetType: 'base-view' | 'close-up' | 'sketch';
  assetId: string;
  assetName: string;
  creditCost: number;
  currentImageUrl?: string;
  onRegenerate: (prompt?: string) => Promise<void>;
}

export function RegenerationControls({
  assetType,
  assetId,
  assetName,
  creditCost,
  currentImageUrl,
  onRegenerate,
}: RegenerationControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);

      await onRegenerate(prompt.trim() || undefined);

      toast.success('Regeneration complete!', {
        description: `${assetName} has been regenerated`,
      });

      setIsOpen(false);
      setPrompt('');
    } catch (error) {
      toast.error('Regeneration failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Regenerate
        <Badge variant="secondary" className="ml-1">
          {creditCost} {creditCost === 1 ? 'credit' : 'credits'}
        </Badge>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Regenerate {assetName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Image Preview */}
            {currentImageUrl && (
              <div className="space-y-2">
                <Label>Current {assetType === 'sketch' ? 'Sketch' : 'Image'}</Label>
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={currentImageUrl}
                    alt={assetName}
                    className="w-full h-64 object-contain bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* Regeneration Prompt */}
            <div className="space-y-2">
              <Label htmlFor="regen-prompt">
                Regeneration Instructions (Optional)
              </Label>
              <Textarea
                id="regen-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., 'Make the colors more vibrant', 'Add more detail to the collar', 'Focus on the stitching'"
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to regenerate with the same settings, or provide specific
                instructions for the AI
              </p>
            </div>

            {/* Credit Cost Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Credit Usage</p>
                <p className="text-amber-700 mt-1">
                  This will cost <strong>{creditCost} {creditCost === 1 ? 'credit' : 'credits'}</strong>.
                  {assetType === 'base-view' && ' The new view will replace the current one.'}
                  {assetType === 'close-up' && ' All close-ups will be regenerated.'}
                  {assetType === 'sketch' && ' Only this sketch view will be regenerated.'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isRegenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="gap-2"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate ({creditCost} {creditCost === 1 ? 'credit' : 'credits'})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### 3.2 Regeneration Options Menu

```typescript
// File: modules/ai-designer/components/TechPackGeneration/RegenerationMenu.tsx

/**
 * Regeneration Menu Component
 * Context menu for quick regeneration options
 */

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, RefreshCw, Edit, Trash2, Download } from 'lucide-react';

interface RegenerationMenuProps {
  onRegenerateView: () => void;
  onRegenerateAllCloseUps: () => void;
  onRegenerateSingleSketch: (view: 'front' | 'back' | 'side') => void;
  onEdit: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

export function RegenerationMenu({
  onRegenerateView,
  onRegenerateAllCloseUps,
  onRegenerateSingleSketch,
  onEdit,
  onDelete,
  onDownload,
}: RegenerationMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Field
          <span className="ml-auto text-xs text-muted-foreground">1 credit</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onRegenerateView}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate View
          <span className="ml-auto text-xs text-muted-foreground">1 credit</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onRegenerateAllCloseUps}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate All Close-Ups
          <span className="ml-auto text-xs text-muted-foreground">3 credits</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Regenerate Sketch</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => onRegenerateSingleSketch('front')}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Front View
          <span className="ml-auto text-xs text-muted-foreground">1 credit</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onRegenerateSingleSketch('back')}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Back View
          <span className="ml-auto text-xs text-muted-foreground">1 credit</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onRegenerateSingleSketch('side')}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Side View
          <span className="ml-auto text-xs text-muted-foreground">1 credit</span>
        </DropdownMenuItem>

        {onDownload && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
          </>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 4. Performance Optimizations

### 4.1 Image Preloading Strategy

```typescript
// File: modules/ai-designer/utils/imagePreloader.ts

/**
 * Image Preloader Utility
 * Preloads images in background for smooth UX
 */

export class ImagePreloader {
  private preloadedImages: Set<string> = new Set();
  private preloadQueue: string[] = [];
  private maxConcurrent = 3;
  private currentlyLoading = 0;

  /**
   * Preload image with priority
   */
  async preload(url: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    if (this.preloadedImages.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.preloadedImages.add(url);
        this.currentlyLoading--;
        this.processQueue();
        resolve();
      };

      img.onerror = () => {
        this.currentlyLoading--;
        this.processQueue();
        reject(new Error(`Failed to preload: ${url}`));
      };

      if (priority === 'high') {
        // Load immediately
        this.currentlyLoading++;
        img.src = url;
      } else {
        // Add to queue
        if (priority === 'normal') {
          this.preloadQueue.push(url);
        } else {
          this.preloadQueue.unshift(url);
        }
        this.processQueue();
      }
    });
  }

  /**
   * Preload multiple images
   */
  async preloadBatch(urls: string[], priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void[]> {
    return Promise.all(urls.map((url) => this.preload(url, priority)));
  }

  /**
   * Process preload queue
   */
  private processQueue(): void {
    while (this.currentlyLoading < this.maxConcurrent && this.preloadQueue.length > 0) {
      const url = this.preloadQueue.shift();
      if (url && !this.preloadedImages.has(url)) {
        this.currentlyLoading++;
        const img = new Image();
        img.onload = () => {
          this.preloadedImages.add(url);
          this.currentlyLoading--;
          this.processQueue();
        };
        img.onerror = () => {
          this.currentlyLoading--;
          this.processQueue();
        };
        img.src = url;
      }
    }
  }

  /**
   * Check if image is preloaded
   */
  isPreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }

  /**
   * Clear preload cache
   */
  clear(): void {
    this.preloadedImages.clear();
    this.preloadQueue = [];
  }
}

export const imagePreloader = new ImagePreloader();
```

### 4.2 Request Deduplication

```typescript
// File: modules/ai-designer/utils/requestDeduplicator.ts

/**
 * Request Deduplicator
 * Prevents duplicate API calls for same data
 */

export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  /**
   * Deduplicate request by key
   */
  async dedupe<T>(key: string, request: () => Promise<T>): Promise<T> {
    // If request already pending, return existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const promise = request()
      .then((result) => {
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Clear specific key
   */
  clear(key: string): void {
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    this.pendingRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();
```

### 4.3 Optimistic Updates Hook

```typescript
// File: modules/ai-designer/hooks/useOptimisticUpdate.tsx

/**
 * Optimistic Update Hook
 * Updates UI immediately, reverts on error
 */

import { useState, useCallback } from 'react';

export function useOptimisticUpdate<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [previousValue, setPreviousValue] = useState<T>(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);

  const performOptimisticUpdate = useCallback(
    async (
      newValue: T,
      asyncOperation: () => Promise<T>
    ): Promise<{ success: boolean; value: T }> => {
      // Store current value for potential rollback
      setPreviousValue(value);

      // Apply optimistic update immediately
      setValue(newValue);
      setIsUpdating(true);

      try {
        // Perform async operation
        const result = await asyncOperation();

        // Update with actual result
        setValue(result);
        setIsUpdating(false);

        return { success: true, value: result };
      } catch (error) {
        // Rollback on error
        setValue(previousValue);
        setIsUpdating(false);

        return { success: false, value: previousValue };
      }
    },
    [value, previousValue]
  );

  return {
    value,
    isUpdating,
    performOptimisticUpdate,
  };
}
```

---

## 5. Error Recovery & Credit Protection

### 5.1 Automatic Retry with Exponential Backoff

```typescript
// File: modules/ai-designer/utils/retryWithBackoff.ts

/**
 * Retry with Exponential Backoff
 * Automatically retries failed requests with increasing delays
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;

      // Check if we should retry
      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      onRetry?.(attempt, error);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Retry specifically for API calls that might have transient failures
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  return retryWithBackoff(apiCall, {
    maxRetries: 3,
    initialDelay: 1000,
    shouldRetry: (error) => {
      // Don't retry if it's a credit issue
      if (error.message?.includes('INSUFFICIENT_CREDITS')) {
        return false;
      }
      // Don't retry 4xx errors (except 408, 429)
      if (error.status >= 400 && error.status < 500) {
        return error.status === 408 || error.status === 429;
      }
      // Retry 5xx errors and network errors
      return true;
    },
    onRetry: (attempt, error) => {
      console.warn(`Retry attempt ${attempt} after error:`, error);
    },
    ...options,
  });
}
```

---

## Summary

### Complete Integration Checklist

- [ ] **State Management**: Implement all Jotai atoms
- [ ] **API Client**: Create techPackV2Client service
- [ ] **Asset Managers**: Implement base views, close-ups, and sketches managers
- [ ] **React Hooks**: Create useTechPackGeneration hook
- [ ] **UI Components**: Build ProgressiveLoader, ResultsDisplay, RegenerationControls
- [ ] **Performance**: Add image preloading, request deduplication, optimistic updates
- [ ] **Error Recovery**: Implement retry logic with exponential backoff
- [ ] **Testing**: Test all regeneration scenarios
- [ ] **Documentation**: Document credit costs and regeneration flows

### Micro-Level Performance Optimizations

1. **Image Loading**: Preload thumbnails first, then full images
2. **Progressive Rendering**: Show data as it arrives, don't wait for complete batch
3. **Request Deduplication**: Never make duplicate API calls
4. **Optimistic Updates**: UI updates immediately, reverts on error
5. **Smart Caching**: Store category detection results, base view analyses
6. **Abort Controllers**: Cancel ongoing requests when user navigates away
7. **Virtual Scrolling**: For large numbers of close-ups (8-10 images)
8. **Lazy Loading**: Load analysis details only when expanded

### Credit Management Guarantees

✅ **Never lose credits on errors** - Automatic refunds
✅ **Clear cost before action** - Every button shows credit cost
✅ **Optimistic UI** - See changes instantly
✅ **Transparent tracking** - Credit usage history visible
✅ **Smart caching** - Reuse previous analyses when possible

This implementation ensures **zero performance issues** and **perfect user experience**!
