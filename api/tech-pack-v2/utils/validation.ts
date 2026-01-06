/**
 * Input Validation Schemas
 * Zod schemas for validating API requests
 */

import { z } from "zod";

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

const UUIDSchema = z.string().uuid("Invalid UUID format");

const ImageUrlSchema = z.string().url("Invalid image URL");

const ProductCategorySchema = z.enum(["APPAREL", "FOOTWEAR", "BAGS", "FURNITURE", "JEWELRY"]);

const ViewTypeSchema = z.enum(["front", "back", "side", "top", "bottom", "detail", "other"]);

// ============================================================================
// CATEGORY DETECTION
// ============================================================================

export const CategoryDetectionSchema = z.object({
  productId: UUIDSchema,
  imageUrl: ImageUrlSchema,
});

export type CategoryDetectionInput = z.infer<typeof CategoryDetectionSchema>;

// ============================================================================
// BASE VIEWS ANALYSIS
// ============================================================================

export const BaseViewAnalysisSchema = z.object({
  productId: UUIDSchema,
  revisionIds: z.array(UUIDSchema).min(1, "At least one revision ID required").max(5, "Maximum 5 revision IDs allowed"),
  category: ProductCategorySchema.optional(),
});

export type BaseViewAnalysisInput = z.infer<typeof BaseViewAnalysisSchema>;

// ============================================================================
// CLOSE-UP GENERATION
// ============================================================================

export const CloseUpGenerationSchema = z.object({
  productId: UUIDSchema,
  baseViewAnalyses: z.array(
    z.object({
      viewType: z.string().optional(),
      imageUrl: z.string().url("Valid image URL required"),
      analysisData: z.any(),
      revisionId: UUIDSchema, // Required: revision ID to link closeups to the correct revision
    })
  ).min(1, "At least one base view analysis required"),
  category: z.string(),
  shotCount: z.number().min(6, "Minimum 6 shots").max(10, "Maximum 10 shots").optional(),
});

export type CloseUpGenerationInput = z.infer<typeof CloseUpGenerationSchema>;

// ============================================================================
// TECHNICAL SKETCHES
// ============================================================================

export const TechnicalSketchSchema = z.object({
  productId: UUIDSchema,
  productAnalysis: z.object({
    baseViews: z.array(z.any()),
    closeUps: z.array(z.any()).optional(),
  }),
  category: z.string(),
  views: z.array(z.enum(["front", "back", "side"])).optional(),
});

export type TechnicalSketchInput = z.infer<typeof TechnicalSketchSchema>;

// ============================================================================
// AI EDIT
// ============================================================================

export const AIEditSchema = z.object({
  revisionId: UUIDSchema,
  fieldPath: z.string().min(1, "Field path cannot be empty"),
  editPrompt: z.string().min(1, "Edit prompt cannot be empty").max(500, "Edit prompt too long (max 500 characters)"),
  referenceImageUrl: ImageUrlSchema,
});

export type AIEditInput = z.infer<typeof AIEditSchema>;

// ============================================================================
// REGENERATE VIEW
// ============================================================================

export const RegenerateViewSchema = z.object({
  revisionId: UUIDSchema,
  regeneratePrompt: z.string().min(1, "Regenerate prompt cannot be empty").max(1000, "Prompt too long (max 1000 characters)").optional(),
  replaceCurrent: z.boolean().default(false),
});

export type RegenerateViewInput = z.infer<typeof RegenerateViewSchema>;

// ============================================================================
// VALIDATION HELPER
// ============================================================================

/**
 * Validate request data against a schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validation result with parsed data or error
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return {
        success: false,
        error: errorMessages,
      };
    }
    return { success: false, error: "Validation failed" };
  }
}

/**
 * Validate request data and throw on error
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Parsed data
 * @throws Error if validation fails
 */
export function validateRequestOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = validateRequest(schema, data);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
