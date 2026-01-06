/**
 * Confidence Scorer
 * Calculate confidence scores for AI analysis quality assessment
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ConfidenceFactors {
  imageQuality: number; // 0-1 (resolution, clarity)
  completeness: number; // 0-1 (all required fields present)
  consistency: number; // 0-1 (values make sense together)
  validationPassed: boolean;
}

// ============================================================================
// CONFIDENCE CALCULATION
// ============================================================================

/**
 * Calculate overall confidence score based on multiple factors
 * @param factors Confidence factors
 * @returns Confidence score (0-1)
 */
export function calculateConfidenceScore(factors: ConfidenceFactors): number {
  const weights = {
    imageQuality: 0.3,
    completeness: 0.4,
    consistency: 0.2,
    validation: 0.1,
  };

  let score = 0;
  score += factors.imageQuality * weights.imageQuality;
  score += factors.completeness * weights.completeness;
  score += factors.consistency * weights.consistency;
  score += (factors.validationPassed ? 1 : 0) * weights.validation;

  return Math.round(score * 100) / 100; // Round to 2 decimals
}

/**
 * Assess image quality based on dimensions
 * @param width Image width
 * @param height Image height
 * @returns Quality score (0-1)
 */
export function assessImageQuality(width: number, height: number): number {
  const pixels = width * height;

  // Score based on resolution
  if (pixels > 1000000) return 1.0; // > 1MP = excellent
  if (pixels > 500000) return 0.8; // > 0.5MP = good
  if (pixels > 250000) return 0.6; // > 0.25MP = acceptable
  return 0.4; // Lower = poor
}

/**
 * Check completeness of analysis data
 * @param analysisData Analysis data object
 * @param requiredFields Array of required field paths
 * @returns Completeness score (0-1)
 */
export function checkCompleteness(analysisData: any, requiredFields?: string[]): number {
  const defaultRequiredFields = [
    "detected_features",
    "dimensions_estimated",
    "materials_detected",
    "colors_and_patterns",
  ];

  const fieldsToCheck = requiredFields || defaultRequiredFields;

  const present = fieldsToCheck.filter((field) => {
    const value = getNestedValue(analysisData, field);
    return value && (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0);
  }).length;

  return present / fieldsToCheck.length;
}

/**
 * Check consistency of values in analysis
 * @param analysisData Analysis data object
 * @returns Consistency score (0-1)
 */
export function checkConsistency(analysisData: any): number {
  let consistencyScore = 1.0;

  // Example: Check if dimensions make sense
  if (analysisData.dimensions_estimated) {
    const dims = analysisData.dimensions_estimated;

    // Footwear: heel should be less than total height
    if (dims.heel_height && dims.shaft_height) {
      const heel = parseFloat(dims.heel_height.value || "0");
      const shaft = parseFloat(dims.shaft_height.value || "0");
      if (heel > shaft) consistencyScore -= 0.2;
    }

    // Check for negative dimensions
    Object.values(dims).forEach((dim: any) => {
      if (dim?.value) {
        const value = parseFloat(dim.value);
        if (value < 0) consistencyScore -= 0.3;
      }
    });
  }

  // Check color analysis consistency
  if (analysisData.colors_and_patterns) {
    const colors = analysisData.colors_and_patterns;
    if (colors.primary_color && !colors.primary_color.hex) {
      consistencyScore -= 0.1;
    }
  }

  // Check material percentages add up
  if (analysisData.materials_detected && Array.isArray(analysisData.materials_detected)) {
    const totalPercentage = analysisData.materials_detected.reduce((sum: number, material: any) => {
      const percentage = parseFloat(material.percentage || "0");
      return sum + percentage;
    }, 0);

    // Allow some tolerance (within 90-110%)
    if (totalPercentage < 90 || totalPercentage > 110) {
      consistencyScore -= 0.15;
    }
  }

  return Math.max(0, consistencyScore);
}

/**
 * Validate analysis data structure
 * @param analysisData Analysis data object
 * @param category Product category
 * @returns True if valid
 */
export function validateAnalysisStructure(analysisData: any, category?: string): boolean {
  try {
    // Check basic structure
    if (!analysisData || typeof analysisData !== "object") {
      return false;
    }

    // Check for critical fields
    const criticalFields = ["detected_features", "materials_detected"];
    const hasCriticalFields = criticalFields.every((field) => field in analysisData);

    if (!hasCriticalFields) {
      return false;
    }

    // Category-specific validation
    if (category) {
      switch (category.toUpperCase()) {
        case "APPAREL":
          return !!analysisData.garment_details;
        case "FOOTWEAR":
          return !!analysisData.footwear_details;
        case "BAGS":
          return !!analysisData.bag_details;
        case "FURNITURE":
          return !!analysisData.furniture_details;
        case "JEWELRY":
          return !!analysisData.jewelry_details;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get overall confidence assessment
 * @param analysisData Analysis data object
 * @param imageWidth Image width
 * @param imageHeight Image height
 * @param category Product category
 * @returns Overall confidence score and breakdown
 */
export function assessOverallConfidence(
  analysisData: any,
  imageWidth: number,
  imageHeight: number,
  category?: string
) {
  const factors: ConfidenceFactors = {
    imageQuality: assessImageQuality(imageWidth, imageHeight),
    completeness: checkCompleteness(analysisData),
    consistency: checkConsistency(analysisData),
    validationPassed: validateAnalysisStructure(analysisData, category),
  };

  const overallScore = calculateConfidenceScore(factors);

  return {
    score: overallScore,
    breakdown: factors,
    recommendation: getRecommendation(overallScore),
  };
}

/**
 * Get recommendation based on confidence score
 * @param score Confidence score (0-1)
 * @returns Recommendation text
 */
function getRecommendation(score: number): string {
  if (score >= 0.9) return "Excellent quality - Ready for use";
  if (score >= 0.75) return "Good quality - Minor review recommended";
  if (score >= 0.6) return "Acceptable - Review and edit as needed";
  if (score >= 0.4) return "Low confidence - Manual review required";
  return "Poor quality - Consider regeneration";
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get nested value from object using dot notation
 * @param obj Object to search
 * @param path Dot-separated path (e.g., "dimensions.width")
 * @returns Nested value or undefined
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}
