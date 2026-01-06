/**
 * Tech Pack V2 - Main Entry Point
 *
 * This module exports all public functions and types for the Tech Pack V2 system.
 * It serves as the main interface for integrating Tech Pack functionality
 * into the application.
 *
 * @module tech-pack-v2
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

export { AI_MODELS_CONFIG, RETRY_CONFIG } from "./config/models.config";
export { TECH_PACK_CREDITS, getCreditCost } from "./config/credits.config";
export { LIMITS_CONFIG, validateImageConstraints } from "./config/limits.config";

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Category types
  ProductCategory,
  ViewType,
  CategoryDetectionResult,

  // Base view analysis
  BaseViewAnalysis,
  ApparelDetails,
  FootwearDetails,
  BagDetails,
  FurnitureDetails,
  JewelryDetails,
  DesignElements,
  MaterialInfo,
  ColorAnalysis,
  DimensionInfo,
  ConstructionDetails,
  QualityMetrics,
  ConfidenceScores,

  // Close-ups
  CloseUpPlan,
  CloseUpShot,
  CloseUpAnalysis,
  DetailedObservations,

  // Technical sketches
  TechnicalSketchPrompt,
  CallOutData,
  CallOut,

  // AI edit
  AIEditRequest,
  AIEditResult,

  // General
  BatchProcessingStatus,
  ProcessingMetrics,
} from "./types/tech-pack.types";

export type {
  PromptTemplate,
  CategoryPromptTemplate,
  ViewAnalysisPromptTemplate,
  CloseUpPlanPromptTemplate,
  CloseUpAnalysisPromptTemplate,
  SketchPromptTemplate,
  CallOutPromptTemplate,
} from "./types/prompts.types";

export type {
  ApiResponse,
  CategoryDetectionResponse,
  BaseViewsAnalysisResponse,
  CloseUpsGenerationResponse,
  TechnicalSketchesResponse,
  AIEditResponse,
  RegenerateResponse,
  BatchOperationResponse,
  ErrorResponse,
} from "./types/responses.types";

// ============================================================================
// UTILITIES
// ============================================================================

export {
  validateRequest,
  validateRequestOrThrow,
  CategoryDetectionSchema,
  BaseViewAnalysisSchema,
  CloseUpGenerationSchema,
  TechnicalSketchSchema,
  AIEditSchema,
  RegenerateViewSchema,
} from "./utils/validation";

export { creditsManager, CreditsManager } from "./utils/credits-manager";

export {
  calculateImageHash,
  calculateBufferHash,
  calculateBase64Hash,
  hashesMatch,
} from "./utils/image-hash";

export {
  calculateConfidenceScore,
  assessImageQuality,
  checkCompleteness,
  checkConsistency,
  validateAnalysisStructure,
  assessOverallConfidence,
} from "./utils/confidence-scorer";

export type { ConfidenceFactors } from "./utils/confidence-scorer";

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

export { detectProductCategory } from "./functions/category-detection.function";
export { analyzeBaseView, analyzeBaseViewsBatch } from "./functions/base-view-analysis.function";
export { generateCloseUps } from "./functions/closeup-generation.function";
export { generateTechnicalSketches } from "./functions/sketch-generation.function";
export { performAIEdit } from "./functions/ai-edit.function";
export { generateComponentImages } from "./functions/component-generation.function";
export { generateCustomComponentImage } from "./functions/custom-component-generation.function";
export {
  CUSTOM_COMPONENT_CREDITS,
  type ComponentValidationResult,
  type CustomComponentResult,
} from "./types/custom-component.types";

// ============================================================================
// PROMPTS (if needed externally)
// ============================================================================

export { CATEGORY_DETECTION_PROMPT } from "./prompts/category-detection/detect-category.prompt";
export { UNIVERSAL_BASE_VIEW_PROMPT } from "./prompts/base-views/universal.prompt";
export { CLOSEUP_GENERATION_PLAN_PROMPT } from "./prompts/close-ups/generate-closeup-plan.prompt";
export { CLOSEUP_ANALYSIS_PROMPT } from "./prompts/close-ups/analyze-closeup.prompt";
export { TECHNICAL_SKETCH_GENERATION_PROMPT } from "./prompts/sketches/generate-technical-sketch.prompt";
export { CALLOUT_GENERATION_PROMPT } from "./prompts/sketches/generate-callouts.prompt";

// ============================================================================
// VERSION INFO
// ============================================================================

export const TECH_PACK_VERSION = "2.0.0";
export const TECH_PACK_BUILD_DATE = new Date().toISOString();

// ============================================================================
// HELPER CONSTANTS
// ============================================================================

export const SUPPORTED_CATEGORIES = ["APPAREL", "FOOTWEAR", "BAGS", "FURNITURE", "JEWELRY"] as const;
export const SUPPORTED_VIEW_TYPES = ["front", "back", "side", "top", "bottom", "detail", "other"] as const;

/**
 * Complete workflow for Tech Pack generation
 * This is a high-level example of how to use the Tech Pack V2 system
 */
export const TECH_PACK_WORKFLOW = {
  /**
   * Step 1: Detect category from initial image
   * Cost: 0 credits
   */
  detectCategory: "POST /api/tech-pack-v2/detect-category",

  /**
   * Step 2: Analyze base views (5 views)
   * Cost: 0 credits (free)
   */
  analyzeBaseViews: "POST /api/tech-pack-v2/base-views/analyze",

  /**
   * Step 3: Generate close-ups (6-10 detail shots)
   * Cost: 2 credits
   */
  generateCloseUps: "POST /api/tech-pack-v2/close-ups/generate",

  /**
   * Step 4: Generate technical sketches (3 sketches with call-outs)
   * Cost: 6 credits
   */
  generateSketches: "POST /api/tech-pack-v2/sketches/generate",

  /**
   * Optional: AI-assisted field editing
   * Cost: 2 credits per edit
   */
  aiEdit: "POST /api/tech-pack-v2/edit",

  /**
   * Optional: Regenerate specific view
   * Cost: 2 credits
   */
  regenerate: "POST /api/tech-pack-v2/regenerate",

  /**
   * Optional: Generate custom component image by user description
   * Cost: 1 credit per image
   * Validates component exists in product before generating
   */
  generateCustomComponent: "POST /api/tech-pack-v2/generate-custom-component",

  /**
   * Total cost for complete tech pack: 10 credits
   */
  totalCost: 10,
};
