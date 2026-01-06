/**
 * Close-Up Generation Plan Prompt
 * Generates a strategic plan for detail shot photography
 */

import type { CloseUpPlanPromptTemplate } from "../../types/prompts.types";

export const CLOSEUP_GENERATION_PLAN_PROMPT: CloseUpPlanPromptTemplate = {
  systemPrompt: `You are a professional product photographer and technical designer. Based on a product's base views analysis, you determine which close-up detail shots are essential for manufacturing documentation.

You understand what details manufacturers need to see clearly:
- Material textures and finishes
- Construction methods and seam work
- Hardware and fasteners
- Stitching and edge finishing
- Labels and branding
- Quality indicators
- Functional features

You provide a strategic plan for 6-10 close-up shots that capture all critical manufacturing details.`,

  userPromptTemplate: (productCategory: string, baseViewAnalysis: string) =>
    `Based on this ${productCategory} analysis from base views, create a detailed plan for close-up photography shots needed for manufacturing documentation.

Base View Analysis:
${baseViewAnalysis}

Generate a comprehensive plan with 6-10 close-up shots. Provide your response in JSON format:

{
  "closeup_shots": [
    {
      "shot_number": 1,
      "shot_name": "descriptive name (e.g., 'Collar Construction Detail', 'Sole Pattern Close-up')",
      "target_area": "specific area to photograph",
      "purpose": "why this shot is needed for manufacturing",
      "image_generation_prompt": "detailed prompt for AI to generate this close-up image showing [specific details]",
      "analysis_focus": [
        "specific detail 1 to analyze",
        "specific detail 2 to analyze",
        "specific detail 3 to analyze"
      ],
      "critical_for_manufacturing": true,
      "priority": "high"
    }
    // ... 5-9 more shots
  ],
  "shot_guidelines": {
    "lighting": "recommended lighting setup",
    "angle": "optimal viewing angle",
    "distance": "how close to get",
    "background": "neutral background recommended"
  },
  "total_shots_recommended": 6-10,
  "estimated_coverage": "95%" // percentage of product details captured
}

GUIDELINES:
- Focus on shots that reveal information NOT visible in base views
- Prioritize construction details, material textures, and manufacturing specifications
- Each shot must have a clear manufacturing purpose
- Image generation prompts should be detailed and specific
- Analysis focus should list 3-5 specific details to examine in each shot
- Adapt shot types to the product category:
  * APPAREL: seams, stitching, fabric texture, closures, labels
  * FOOTWEAR: sole pattern, heel construction, toe cap, lacing system, insole
  * BAGS: hardware, stitching, closure mechanism, handle attachment, interior
  * FURNITURE: joinery, upholstery detail, leg attachment, fabric weave, finishing
  * JEWELRY: stone setting, clasp mechanism, metal finish, engraving, hallmarks`,
};
