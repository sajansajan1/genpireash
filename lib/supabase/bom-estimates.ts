/**
 * BOM Cost Estimates Supabase Service
 * Handles CRUD operations for storing and retrieving AI-generated cost estimates
 */

import { createClient } from "./server";
import crypto from "crypto";

// Types
export interface BOMEstimateInput {
  productIdeaId: string;
  techPackId?: string;
  revisionId?: string;
  userId: string;
  materialCostInput: number;
  materialsHash: string;
  estimate: BOMEstimateData;
  complexityLevel: "high" | "medium" | "low";
  hasElectronics: boolean;
}

export interface BOMEstimateData {
  sampleCost: {
    min: number;
    max: number;
    breakdown: {
      materials: number;
      labor: number;
      setup: number;
      shipping: number;
    };
  };
  productionCost: {
    quantity: number;
    totalMin: number;
    totalMax: number;
    perUnitMin: number;
    perUnitMax: number;
  };
  leadTimes: {
    sample: string;
    production: string;
  };
  manufacturingRegions: Array<{
    region: string;
    priceMultiplier: number;
    notes: string;
  }>;
  marketInsights: string;
  confidence: "high" | "medium" | "low";
}

export interface StoredBOMEstimate {
  id: string;
  product_idea_id: string;
  tech_pack_id: string | null;
  revision_id: string | null;
  user_id: string;
  material_cost_input: number;
  materials_hash: string;
  sample_cost_min: number;
  sample_cost_max: number;
  sample_breakdown: {
    materials: number;
    labor: number;
    setup: number;
    shipping: number;
  };
  production_quantity: number;
  production_total_min: number;
  production_total_max: number;
  production_per_unit_min: number;
  production_per_unit_max: number;
  sample_lead_time: string;
  production_lead_time: string;
  manufacturing_regions: Array<{
    region: string;
    priceMultiplier: number;
    notes: string;
  }>;
  market_insights: string;
  confidence: "high" | "medium" | "low";
  complexity_level: "high" | "medium" | "low";
  has_electronics: boolean;
  raw_response: any;
  created_at: string;
  updated_at: string;
}

/**
 * Generate a hash of materials for cache validation
 * If materials change, we regenerate the estimate
 */
export function generateMaterialsHash(materials: Array<{
  component: string;
  material: string;
  unitCost?: number;
  quantityPerUnit?: number;
}>): string {
  const materialsString = JSON.stringify(
    materials
      .map((m) => ({
        c: m.component,
        m: m.material,
        u: m.unitCost || 0,
        q: m.quantityPerUnit || 1,
      }))
      .sort((a, b) => a.c.localeCompare(b.c))
  );
  return crypto.createHash("md5").update(materialsString).digest("hex");
}

/**
 * Get the latest BOM estimate for a product
 * Optionally validate against current materials hash
 */
export async function getLatestBOMEstimate(
  productIdeaId: string,
  materialsHash?: string
): Promise<StoredBOMEstimate | null> {
  const supabase = await createClient();

  let query = supabase
    .from("bom_cost_estimates")
    .select("*")
    .eq("product_idea_id", productIdeaId)
    .order("created_at", { ascending: false })
    .limit(1);

  // If materialsHash provided, only return if it matches (cache is valid)
  if (materialsHash) {
    query = query.eq("materials_hash", materialsHash);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found
      return null;
    }
    console.error("Error fetching BOM estimate:", error);
    return null;
  }

  return data as StoredBOMEstimate;
}

/**
 * Save a new BOM estimate to the database
 */
export async function saveBOMEstimate(
  input: BOMEstimateInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bom_cost_estimates")
    .insert({
      product_idea_id: input.productIdeaId,
      tech_pack_id: input.techPackId || null,
      revision_id: input.revisionId || null,
      user_id: input.userId,
      material_cost_input: input.materialCostInput,
      materials_hash: input.materialsHash,

      // Sample costs
      sample_cost_min: input.estimate.sampleCost.min,
      sample_cost_max: input.estimate.sampleCost.max,
      sample_breakdown: input.estimate.sampleCost.breakdown,

      // Production costs
      production_quantity: input.estimate.productionCost.quantity,
      production_total_min: input.estimate.productionCost.totalMin,
      production_total_max: input.estimate.productionCost.totalMax,
      production_per_unit_min: input.estimate.productionCost.perUnitMin,
      production_per_unit_max: input.estimate.productionCost.perUnitMax,

      // Lead times
      sample_lead_time: input.estimate.leadTimes.sample,
      production_lead_time: input.estimate.leadTimes.production,

      // Regional pricing
      manufacturing_regions: input.estimate.manufacturingRegions,

      // Additional info
      market_insights: input.estimate.marketInsights,
      confidence: input.estimate.confidence,
      complexity_level: input.complexityLevel,
      has_electronics: input.hasElectronics,

      // Raw response for reference
      raw_response: input.estimate,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error saving BOM estimate:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id };
}

/**
 * Get all BOM estimates for a product (history)
 */
export async function getBOMEstimateHistory(
  productIdeaId: string,
  limit: number = 10
): Promise<StoredBOMEstimate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bom_cost_estimates")
    .select("*")
    .eq("product_idea_id", productIdeaId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching BOM estimate history:", error);
    return [];
  }

  return data as StoredBOMEstimate[];
}

/**
 * Delete old estimates, keeping only the most recent N
 */
export async function cleanupOldEstimates(
  productIdeaId: string,
  keepCount: number = 5
): Promise<void> {
  const supabase = await createClient();

  // Get IDs of estimates to keep
  const { data: toKeep } = await supabase
    .from("bom_cost_estimates")
    .select("id")
    .eq("product_idea_id", productIdeaId)
    .order("created_at", { ascending: false })
    .limit(keepCount);

  if (!toKeep || toKeep.length < keepCount) {
    return; // Not enough estimates to cleanup
  }

  const keepIds = toKeep.map((e: { id: string }) => e.id);

  // Delete estimates not in the keep list
  await supabase
    .from("bom_cost_estimates")
    .delete()
    .eq("product_idea_id", productIdeaId)
    .not("id", "in", `(${keepIds.join(",")})`);
}

/**
 * Convert stored estimate back to API format
 */
export function storedToAPIFormat(stored: StoredBOMEstimate): BOMEstimateData & { generatedAt: string } {
  return {
    sampleCost: {
      min: stored.sample_cost_min,
      max: stored.sample_cost_max,
      breakdown: stored.sample_breakdown,
    },
    productionCost: {
      quantity: stored.production_quantity,
      totalMin: stored.production_total_min,
      totalMax: stored.production_total_max,
      perUnitMin: stored.production_per_unit_min,
      perUnitMax: stored.production_per_unit_max,
    },
    leadTimes: {
      sample: stored.sample_lead_time,
      production: stored.production_lead_time,
    },
    manufacturingRegions: stored.manufacturing_regions,
    marketInsights: stored.market_insights,
    confidence: stored.confidence,
    generatedAt: stored.created_at,
  };
}
