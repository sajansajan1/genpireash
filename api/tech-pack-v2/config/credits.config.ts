/**
 * Tech Pack Credits Configuration
 * Defines credit costs for each Tech Pack V2 operation
 */

export const TECH_PACK_CREDITS = {
  // View generation costs
  BASE_VIEWS: 1, // Base view analysis = 1 credit
  CLOSE_UPS: 2, // Close-up detail shots = 2 credits
  TECHNICAL_SKETCHES: 6, // 3 sketches = 6 credits
  FLAT_SKETCHES: 2, // 3 flat sketches = 2 credits
  COMPONENT_IMAGES: 2, // Component images = 2 credits
  ASSEMBLY_VIEW: 2, // Assembly/exploded view = 2 credits

  // Analysis costs
  CATEGORY_DETECTION: 0, // Free (included in base views)
  BASE_VIEW_ANALYSIS: 0, // Included in base views cost
  CLOSEUP_ANALYSIS: 0, // Included in close-ups cost

  // Editing costs
  AI_EDIT_SINGLE_FIELD: 2, // Edit specific field with AI = 2 credits
  REGENERATE_VIEW: 2, // Full regeneration of single view = 2 credits

  // Total package (for "Generate All" button)
  COMPLETE_TECH_PACK: 15, // Full tech pack = 15 credits (1 + 2 + 2 + 6 + 2 + 2)
} as const;

/**
 * Get credit cost for an operation
 */
export function getCreditCost(
  operation:
    | "BASE_VIEWS"
    | "CLOSE_UPS"
    | "TECHNICAL_SKETCHES"
    | "FLAT_SKETCHES"
    | "COMPONENT_IMAGES"
    | "ASSEMBLY_VIEW"
    | "AI_EDIT_SINGLE_FIELD"
    | "REGENERATE_VIEW"
    | "COMPLETE_TECH_PACK"
): number {
  return TECH_PACK_CREDITS[operation];
}
