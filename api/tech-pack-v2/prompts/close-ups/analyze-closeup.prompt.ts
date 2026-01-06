/**
 * Close-Up Analysis Prompt
 * Analyzes detail shots for manufacturing specifications
 */

import type { CloseUpAnalysisPromptTemplate } from "../../types/prompts.types";

export const CLOSEUP_ANALYSIS_PROMPT: CloseUpAnalysisPromptTemplate = {
  systemPrompt: `You are a quality control specialist and technical designer analyzing product close-up photographs. You extract precise manufacturing details from detail shots.

Your expertise includes:
- Stitch counting and seam analysis
- Material texture and finish identification
- Hardware specifications
- Quality assessment
- Measurement estimation from visual reference

You provide extremely detailed technical observations for manufacturing documentation.`,

  userPromptTemplate: (shotName: string, analysisFocus: string[], imageUrl: string) =>
    `Analyze this close-up detail shot: "${shotName}"

Image: ${imageUrl}

Focus areas: ${analysisFocus.join(", ")}

Provide comprehensive technical analysis in JSON format:

{
  "shot_name": "${shotName}",

  "detailed_observations": {
    "material_details": {
      "texture": "smooth|textured|ribbed|woven|knit|etc.",
      "weave_pattern": "plain|twill|satin|knit|etc. (if visible)",
      "fiber_visibility": "tight|loose|medium",
      "finish": "matte|glossy|brushed|coated|etc.",
      "surface_quality": "description of surface characteristics",
      "quality_grade": "luxury|premium|standard|budget"
    },

    "construction_details": {
      "seam_type": "flat|french|overlocked|piped|welted|etc.",
      "stitch_type": "lock|chain|zigzag|decorative|etc.",
      "stitch_count_per_inch": "number (if countable)",
      "seam_allowance": "measurement in mm",
      "edge_finishing": "clean|raw|bound|turned|etc.",
      "reinforcement": "bar-tack|backstitch|none|etc.",
      "construction_notes": "detailed notes about how it's made"
    },

    "hardware_specifications": {
      "type": "button|zipper|snap|rivet|buckle|clasp|hinge|etc.",
      "material": "brass|nickel|stainless steel|plastic|etc.",
      "finish": "polished|brushed|matte|antique|plated|etc.",
      "size": "measurement in mm",
      "brand": "YKK|other brand|unbranded",
      "installation_method": "sewn|riveted|crimped|screwed|etc.",
      "quality_indicators": "smooth operation|tight fit|etc."
    },

    "measurements_visible": [
      {
        "element": "what is being measured",
        "value": "measurement with unit",
        "tolerance": "±tolerance",
        "measurement_method": "how it was estimated"
      }
    ],

    "quality_observations": {
      "stitch_quality": "excellent|good|average|poor",
      "alignment": "perfect|acceptable|misaligned",
      "finish_quality": "excellent|good|average|poor",
      "symmetry": "precise|acceptable|uneven",
      "defects_visible": ["list any defects or imperfections"],
      "overall_workmanship": "luxury|premium|standard|budget"
    },

    "color_analysis": {
      "dominant_color": {
        "name": "color name",
        "hex": "#000000"
      },
      "color_consistency": "uniform|slightly varied|inconsistent",
      "finish": "matte|semi-gloss|glossy|metallic"
    },

    "functional_features": [
      "reinforced stress point",
      "decorative topstitching",
      "functional pocket",
      "water-resistant coating",
      "etc."
    ]
  },

  "manufacturing_specifications": {
    "recommended_thread": "thread type and weight (e.g., 'polyester 40/2', 'nylon bonded')",
    "needle_size": "recommended needle size (e.g., '80/12', '100/16')",
    "special_equipment": ["walking foot", "piping foot", "buttonhole attachment"],
    "assembly_notes": [
      "Specific step-by-step instructions for replicating this detail",
      "Critical checkpoints during assembly",
      "Common mistakes to avoid"
    ],
    "materials_required": [
      "Main material specifications",
      "Thread specifications",
      "Hardware specifications",
      "Interfacing or stabilizers"
    ]
  },

  "quality_control_checkpoints": [
    "Check stitch count consistency",
    "Verify seam alignment",
    "Test hardware functionality",
    "Measure seam allowances",
    "Inspect edge finishing",
    "etc."
  ],

  "comparison_to_standards": {
    "industry_standard_met": true,
    "quality_level": "exceeds|meets|below standards",
    "notes": "specific observations about compliance with industry standards"
  },

  "confidence_score": 0.94
}

IMPORTANT GUIDELINES:
- Be extremely detailed and precise
- Use exact industry terminology
- Provide measurements when visible with realistic tolerances
- Focus on actionable manufacturing information
- If something is not clearly visible, state "Not visible in this close-up"
- Only include fields relevant to what's actually in the image
- Adapt analysis to the product type (apparel vs footwear vs bags etc.)
- Provide practical, manufacturer-ready specifications`,
};
