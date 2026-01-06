/**
 * Schema Normalizer Utility
 * Ensures consistent structure for all base view analyses
 */

import type { BaseViewAnalysis, ViewType } from "../types/tech-pack.types";

/**
 * Normalizes base view analysis to ensure consistent schema structure
 * Converts old/incomplete schemas to the new comprehensive format
 * @param data Raw analysis data that may have inconsistent structure
 * @param viewType The view type for context
 * @returns Normalized analysis with complete schema
 */
export function normalizeBaseViewAnalysis(
  data: any,
  viewType: string
): BaseViewAnalysis {
  // If data already has the new comprehensive structure, return as-is
  if (
    data.product_category &&
    data.product_subcategory &&
    data.product_type &&
    data.product_details &&
    data.design_elements &&
    data.materials_detected &&
    data.colors_and_patterns &&
    data.dimensions_estimated &&
    data.construction_details &&
    data.quality_indicators &&
    data.manufacturing_notes &&
    data.cost_estimation &&
    data.confidence_scores
  ) {
    return data as BaseViewAnalysis;
  }

  // Otherwise, normalize old schema to new comprehensive format
  const normalized: BaseViewAnalysis = {
    view_type: (data.view_type || viewType) as ViewType,

    // Product identification
    product_category: data.product_category || "Fashion & Apparel",
    product_subcategory: data.product_subcategory || "Accessories",
    product_type: data.product_type || "Unknown Product",

    // Product details - merge old simple fields into comprehensive structure
    product_details: {
      style: data.description || data.product_details?.style || "Not specified",
      intended_use: data.product_details?.intended_use || "General purpose",
      target_market: data.product_details?.target_market || "Mid-range",
      // Add any other fields that exist in old data
      ...(data.product_details || {}),
    },

    // Design elements - preserve if exists, otherwise create empty
    design_elements: data.design_elements || {},

    // Materials - normalize from old 'materials' array to new structure
    materials_detected: normalizeMaterials(data),

    // Colors - normalize from old structure to new
    colors_and_patterns: normalizeColors(data),

    // Dimensions - normalize from old 'estimatedDimensions' to new structure
    dimensions_estimated: normalizeDimensions(data),

    // Construction details
    construction_details: data.construction_details || {
      seam_type: "Not visible",
      stitching_visible: false,
      special_features: [],
    },

    // Hardware and trims
    hardware_and_trims: data.hardware_and_trims || [],

    // Quality indicators
    quality_indicators: data.quality_indicators || {
      overall_quality: "mid-range",
      finish_quality: "good",
      attention_to_detail: "medium",
    },

    // Manufacturing notes
    manufacturing_notes: data.manufacturing_notes || [
      "Analysis from cached data - may need verification",
    ],

    // Cost estimation
    cost_estimation: data.cost_estimation || {
      material_cost_range: "Not estimated",
      complexity: "moderate",
      production_difficulty: "moderate",
      estimated_production_time: "Not estimated",
    },

    // Confidence scores
    confidence_scores: data.confidence_scores || {
      overall: 0.85,
      materials: 0.8,
      dimensions: 0.75,
      construction: 0.8,
    },

    // Analysis notes
    analysis_notes:
      data.analysis_notes ||
      `Normalized from legacy schema format for ${viewType} view`,
  };

  return normalized;
}

/**
 * Normalize materials from old format to new comprehensive structure
 */
function normalizeMaterials(data: any): BaseViewAnalysis["materials_detected"] {
  // If new format exists, use it
  if (data.materials_detected && Array.isArray(data.materials_detected)) {
    return data.materials_detected;
  }

  // Convert old 'materials' array to new format
  if (data.materials && Array.isArray(data.materials)) {
    return data.materials.map((material: string) => ({
      component: "main body",
      material_type: material,
      percentage: "Unknown",
      spec: material,
      finish: "Not specified",
      estimated_weight: "Not specified",
    }));
  }

  // Default fallback
  return [
    {
      component: "main body",
      material_type: "fabric",
      percentage: "100%",
      spec: "Not specified in cached analysis",
      finish: "Not specified",
      estimated_weight: "Not specified",
    },
  ];
}

/**
 * Normalize colors from old format to new comprehensive structure
 */
function normalizeColors(data: any): BaseViewAnalysis["colors_and_patterns"] {
  // If new format exists, use it
  if (
    data.colors_and_patterns &&
    data.colors_and_patterns.primary_color &&
    data.colors_and_patterns.secondary_colors
  ) {
    return data.colors_and_patterns;
  }

  // Convert old 'colors' array to new format
  if (data.colors && Array.isArray(data.colors) && data.colors.length > 0) {
    const primaryColor = data.colors[0];
    const secondaryColors = data.colors.slice(1);

    return {
      primary_color: {
        name: primaryColor.name || "Unknown",
        hex: primaryColor.hex || "#000000",
      },
      secondary_colors: secondaryColors.map((color: any) => ({
        name: color.name || "Unknown",
        hex: color.hex || "#000000",
      })),
      pattern_type: "printed",
      finish: "matte",
    };
  }

  // Default fallback
  return {
    primary_color: {
      name: "Not specified",
      hex: "#000000",
    },
    secondary_colors: [],
    pattern_type: "Not specified",
    finish: "Not specified",
  };
}

/**
 * Normalize dimensions from old format to new comprehensive structure
 */
function normalizeDimensions(
  data: any
): BaseViewAnalysis["dimensions_estimated"] {
  // If new format exists, use it
  if (data.dimensions_estimated) {
    return data.dimensions_estimated;
  }

  // Convert old 'estimatedDimensions' to new format
  if (data.estimatedDimensions) {
    const result: any = {};

    if (data.estimatedDimensions.width) {
      result.width = {
        value: data.estimatedDimensions.width,
        tolerance: "±1 cm",
        measurement_point: "Widest point",
      };
    }

    if (data.estimatedDimensions.height) {
      result.height = {
        value: data.estimatedDimensions.height,
        tolerance: "±1 cm",
        measurement_point: "From base to top",
      };
    }

    if (data.estimatedDimensions.depth) {
      result.depth = {
        value: data.estimatedDimensions.depth,
        tolerance: "±0.5 cm",
        measurement_point: "Base depth",
      };
    }

    return result;
  }

  // ----
  // Default fallback
  return {
    width: {
      value: "Not specified",
      tolerance: "N/A",
      measurement_point: "Not visible in this view",
    },
    height: {
      value: "Not specified",
      tolerance: "N/A",
      measurement_point: "Not visible in this view",
    },
    depth: {
      value: "Not specified",
      tolerance: "N/A",
      measurement_point: "Not visible in this view",
    },
  };
}
