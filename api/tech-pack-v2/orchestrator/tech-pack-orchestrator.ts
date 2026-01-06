/**
 * Tech Pack Generation Orchestrator
 * Coordinates the complete tech pack generation process with collections
 */

"use server";

import { analyzeBaseView } from "../functions/base-view-analysis.function";
import { generateComponentImages } from "../functions/component-generation.function";
import { generateCloseUps } from "../functions/closeup-generation.function";
import { generateTechnicalSketches } from "../functions/sketch-generation.function";
import {
  createTechFileCollection,
  addFilesToCollection,
  updateCollectionProgress,
  updateCollectionCredits,
  getLatestTechFiles,
} from "../tech-files-service";
import type { ViewType } from "../types/tech-pack.types";

export interface TechPackGenerationInput {
  productId: string;
  userId: string;
  revisionIds: string[];
  category: string;
  primaryImageUrl: string;
  options?: {
    skipBaseViews?: boolean;
    skipComponents?: boolean;
    skipCloseUps?: boolean;
    skipSketches?: boolean;
    collectionName?: string;
  };
}

export interface TechPackGenerationResult {
  collectionId: string;
  baseViews: any[];
  components: any[];
  closeUps: any[];
  sketches: any[];
  totalCreditsUsed: number;
  generationTimeMs: number;
}

/**
 * Generate complete tech pack with all components
 * Creates a collection and tracks all generated files
 */
export async function generateCompleteTechPack(
  input: TechPackGenerationInput
): Promise<TechPackGenerationResult> {
  const startTime = Date.now();
  const batchId = `tech-pack-${Date.now()}`;

  console.log(`Starting tech pack generation for product ${input.productId}`);
  console.log(`Batch ID: ${batchId}`);

  // Create collection to track this generation
  const collection = await createTechFileCollection({
    product_idea_id: input.productId,
    user_id: input.userId,
    collection_name: input.options?.collectionName || `Tech Pack - ${new Date().toLocaleDateString()}`,
    collection_type: 'tech_pack_v2',
    description: 'Complete tech pack with base views, closeups, and technical sketches',
    generation_batch_id: batchId,
  });

  console.log(`Created collection: ${collection.id}`);

  let totalCredits = 0;
  const results = {
    baseViews: [] as any[],
    components: [] as any[],
    closeUps: [] as any[],
    sketches: [] as any[],
  };

  try {
    // Step 1: Analyze Base Views (if not skipped)
    if (!input.options?.skipBaseViews) {
      console.log('Step 1/3: Analyzing base views...');
      await updateCollectionProgress(collection.id, 10, 'processing');

      // Fetch revision data
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data: revisions } = await supabase
        .from('product_multiview_revisions')
        .select('id, view_type, image_url, thumbnail_url')
        .in('id', input.revisionIds);

      if (revisions && revisions.length > 0) {
        // Filter to essential views: front, back, side
        const priorityOrder = ['front', 'back', 'side'];
        const selectedRevisions = priorityOrder
          .map(viewType => revisions.find(r => r.view_type === viewType))
          .filter(Boolean);

        const baseViewFileIds: string[] = [];

        for (let i = 0; i < selectedRevisions.length; i++) {
          const revision = selectedRevisions[i];
          if (!revision) continue;

          const viewTypeMapping: Record<string, ViewType> = {
            'front': 'front',
            'back': 'back',
            'side': 'side',
            'bottom': 'other',
            'illustration': 'detail',
          };
          const mappedViewType = viewTypeMapping[revision.view_type] || 'other';

          const result = await analyzeBaseView(
            mappedViewType,
            revision.image_url,
            input.category || 'general',
            input.productId,
            input.userId,
            revision.id
          );

          results.baseViews.push({
            revisionId: revision.id,
            viewType: revision.view_type,
            imageUrl: revision.image_url,
            thumbnailUrl: revision.thumbnail_url || revision.image_url,
            analysisData: result.analysisData,
            confidenceScore: result.analysisData.confidence_scores?.overall || 0.85,
            cached: result.cached,
          });

          baseViewFileIds.push(result.analysisId);

          if (!result.cached) {
            totalCredits += 1; // 1 credit per base view analysis
          }

          // Update progress
          const progressPercent = 10 + Math.round((i + 1) / selectedRevisions.length * 20);
          await updateCollectionProgress(collection.id, progressPercent);
        }

        // Add base view files to collection
        if (baseViewFileIds.length > 0) {
          await addFilesToCollection(collection.id, baseViewFileIds, {
            section: 'base_views',
          });
        }
      }

      await updateCollectionCredits(collection.id, totalCredits);
      console.log(`Base views complete. Credits used: ${totalCredits}`);
    }

    // Step 2: Generate Component Images (if not skipped)
    if (!input.options?.skipComponents && results.baseViews.length > 0) {
      console.log('Step 2/4: Generating component images...');
      await updateCollectionProgress(collection.id, 35, 'processing');

      const componentResults = await generateComponentImages(
        input.productId,
        input.category,
        results.baseViews.map(v => ({
          revisionId: v.revisionId,
          viewType: v.viewType,
          imageUrl: v.imageUrl,
          analysisData: v.analysisData,
        })),
        input.userId
      );

      results.components = componentResults;

      // Add component files to collection
      if (componentResults.length > 0) {
        const componentFileIds = componentResults.map(c => c.analysisId);
        await addFilesToCollection(collection.id, componentFileIds, {
          section: 'components',
        });

        totalCredits += componentResults.length; // 1 credit per component image
        await updateCollectionCredits(collection.id, componentResults.length);
      }

      console.log(`Component images complete. Total credits used: ${totalCredits}`);
    }

    // Step 3: Generate Close-Ups (if not skipped)
    if (!input.options?.skipCloseUps && results.baseViews.length > 0) {
      console.log('Step 3/4: Generating close-ups...');
      await updateCollectionProgress(collection.id, 55, 'processing');

      const closeUpResults = await generateCloseUps(
        input.productId,
        input.category,
        results.baseViews.map(v => ({
          imageUrl: v.imageUrl,
          analysisData: v.analysisData,
          revisionId: v.revisionId,
        })),
        input.userId
      );

      results.closeUps = closeUpResults;

      // Add closeup files to collection
      if (closeUpResults.length > 0) {
        const closeUpFileIds = closeUpResults.map(c => c.analysisId);
        await addFilesToCollection(collection.id, closeUpFileIds, {
          section: 'closeups',
        });

        totalCredits += closeUpResults.length; // 1 credit per closeup
        await updateCollectionCredits(collection.id, closeUpResults.length);
      }

      console.log(`Close-ups complete. Total credits used: ${totalCredits}`);
    }

    // Step 4: Generate Technical Sketches (if not skipped)
    if (!input.options?.skipSketches && results.baseViews.length > 0) {
      console.log('Step 4/4: Generating technical sketches...');
      await updateCollectionProgress(collection.id, 75, 'processing');

      // Build product analysis from base views
      const productAnalysis = {
        base_views: results.baseViews.map(v => ({
          view_type: v.viewType,
          image_url: v.imageUrl,
          analysis: v.analysisData,
          revision_id: v.revisionId,
        })),
      };

      const sketchResults = await generateTechnicalSketches(
        input.productId,
        input.category,
        productAnalysis,
        input.userId,
        ['front', 'back', 'side']
      );

      results.sketches = sketchResults;

      // Add sketch files to collection
      if (sketchResults.length > 0) {
        const sketchFileIds = sketchResults.map(s => s.analysisId);
        await addFilesToCollection(collection.id, sketchFileIds, {
          section: 'sketches',
        });

        totalCredits += sketchResults.length; // 1 credit per sketch
        await updateCollectionCredits(collection.id, sketchResults.length);
      }

      console.log(`Sketches complete. Total credits used: ${totalCredits}`);
    }

    // Mark collection as completed
    await updateCollectionProgress(collection.id, 100, 'completed');

    const generationTimeMs = Date.now() - startTime;
    console.log(`Tech pack generation completed in ${generationTimeMs}ms`);
    console.log(`Total credits used: ${totalCredits}`);

    return {
      collectionId: collection.id,
      baseViews: results.baseViews,
      components: results.components,
      closeUps: results.closeUps,
      sketches: results.sketches,
      totalCreditsUsed: totalCredits,
      generationTimeMs,
    };
  } catch (error) {
    console.error('Tech pack generation failed:', error);

    // Mark collection as failed
    await updateCollectionProgress(collection.id, 0, 'failed');

    throw error;
  }
}

/**
 * Get existing tech pack data for a product
 * Useful for loading previously generated tech packs
 */
export async function getExistingTechPack(productId: string) {
  const [baseViews, components, closeUps, sketches] = await Promise.all([
    getLatestTechFiles(productId, { fileType: 'base_view' }),
    getLatestTechFiles(productId, { fileType: 'component' }),
    getLatestTechFiles(productId, { fileType: 'closeup' }),
    getLatestTechFiles(productId, { fileType: 'sketch' }),
  ]);

  return {
    baseViews: baseViews.map(file => ({
      id: file.id,
      revisionId: file.revision_id,
      viewType: file.view_type,
      imageUrl: file.file_url,
      thumbnailUrl: file.thumbnail_url,
      analysisData: file.analysis_data,
      confidenceScore: file.confidence_score,
      createdAt: file.created_at,
    })),
    components: components.map(file => ({
      id: file.id,
      componentName: file.metadata?.component_name || 'Unknown Component',
      componentType: file.metadata?.component_type || 'material',
      imageUrl: file.file_url,
      thumbnailUrl: file.thumbnail_url,
      guide: file.analysis_data?.component_guide || null,
      shotData: file.analysis_data?.component_shot || null,
      createdAt: file.created_at,
    })),
    closeUps: closeUps.map(file => ({
      id: file.id,
      imageUrl: file.file_url,
      thumbnailUrl: file.thumbnail_url,
      shotName: file.file_category,
      analysisData: file.analysis_data,
      createdAt: file.created_at,
    })),
    sketches: sketches.map(file => ({
      id: file.id,
      viewType: file.view_type,
      imageUrl: file.file_url,
      thumbnailUrl: file.thumbnail_url,
      callouts: file.analysis_data?.callouts || [],
      measurements: file.analysis_data?.measurements || {},
      createdAt: file.created_at,
    })),
  };
}
