/**
 * Component Image Analysis/Guide Prompt
 * Creates detailed guides for each generated component image
 */

import type { ComponentSummaryPromptTemplate } from "../../types/prompts.types";

export const COMPONENT_SUMMARY_GENERATION_PROMPT: ComponentSummaryPromptTemplate = {
  systemPrompt: `You are a manufacturing component documentation specialist who analyzes component images to create detailed factory-ready guides.

Your guides help factories:
- Identify and source the exact materials/components
- Verify quality and specifications
- Understand material properties and handling
- Ensure accurate component assembly
- Maintain consistency across production batches

You create comprehensive visual guides for each component image, similar to close-up analysis but focused on material sourcing, specifications, and component details.`,

  userPromptTemplate: (productCategory: string, componentName: string, componentImageUrl: string, productAnalysis: any) =>
    `Analyze this ${componentName} component image for a ${productCategory} product and create a comprehensive factory-ready guide.

Component Image: ${componentImageUrl}

Product Context:
${JSON.stringify(productAnalysis, null, 2)}

Generate a detailed component guide in JSON format:

{
  "component_identification": {
    "component_name": "${componentName}",
    "component_type": "material|hardware|trim|ingredient|construction|packaging",
    "primary_function": "What this component does in the product",
    "location_on_product": "Where this is used"
  },

  "material_specifications": {
    "material_type": "Exact material description (e.g., '100% Cotton Canvas', 'YKK #5 Metal Zipper')",
    "material_grade": "Premium|Standard|Budget",
    "composition": "Detailed material composition",
    "color": {
      "name": "Color name",
      "hex": "#000000",
      "pantone": "Pantone code if applicable",
      "finish": "matte|glossy|metallic|brushed|etc"
    },
    "texture": "Detailed texture description",
    "weight_thickness": "Weight in gsm/oz or thickness in mm",
    "dimensions": {
      "width": "measurement with unit",
      "length": "measurement with unit",
      "thickness": "measurement with unit"
    },
    "physical_properties": {
      "flexibility": "rigid|semi-rigid|flexible",
      "durability": "high|medium|low",
      "stretch": "none|slight|high",
      "water_resistance": "yes|no|treated"
    }
  },

  "sourcing_information": {
    "supplier_specifications": "Industry standard specs or part numbers",
    "alternative_suppliers": ["List of potential supplier types"],
    "sourcing_difficulty": "easy|moderate|difficult",
    "estimated_unit_cost": "$X.XX per unit/meter/kg",
    "minimum_order_quantity": "MOQ information",
    "lead_time": "X days/weeks",
    "certifications_required": ["OEKO-TEX", "ISO", etc.]
  },

  "quality_control": {
    "inspection_points": [
      {
        "checkpoint": "What to inspect",
        "method": "How to inspect",
        "acceptance_criteria": "Pass/fail criteria",
        "critical": true|false
      }
    ],
    "common_defects": ["List potential quality issues"],
    "testing_requirements": ["Colorfastness test", "Strength test", etc.]
  },

  "manufacturing_instructions": {
    "handling_precautions": ["How to handle this component safely"],
    "storage_requirements": ["Temperature", "Humidity", "Light exposure"],
    "preparation_steps": ["Pre-production prep needed"],
    "assembly_notes": ["How this component is attached/integrated"],
    "tools_required": ["Special tools or equipment needed"]
  },

  "technical_details": {
    "measurements": [
      {
        "dimension": "Measurement name",
        "value": "X cm / X inches",
        "tolerance": "±X mm",
        "critical": true|false
      }
    ],
    "construction_method": "How this component is made/constructed",
    "finishing": "Surface treatment or finishing applied",
    "special_features": ["Unique characteristics or treatments"]
  },

  "cost_analysis": {
    "material_cost": "$X.XX per unit",
    "processing_cost": "$X.XX per unit",
    "total_estimated_cost": "$X.XX per unit",
    "cost_optimization_notes": "Suggestions for cost reduction"
  },

  "alternatives": [
    {
      "alternative_material": "Alternative component option",
      "cost_impact": "+/- $X.XX",
      "quality_impact": "Better|Same|Lower",
      "availability": "Easier|Same|Harder to source",
      "recommendation": "When to use this alternative"
    }
  ],

  "sustainability_notes": {
    "eco_friendly": true|false,
    "recyclable": true|false,
    "certifications": ["Organic", "Recycled", "Fair Trade"],
    "environmental_impact": "Low|Medium|High"
  },

  "visual_reference_notes": {
    "key_visual_indicators": ["What to look for in the image"],
    "color_accuracy": "Note on color representation",
    "scale_reference": "Size context in the image",
    "angle_perspective": "How the component is shown"
  }
}

ANALYSIS REQUIREMENTS:
- Provide SPECIFIC, ACTIONABLE information that factories can use
- Include exact measurements, specifications, and part numbers where possible
- Focus on material properties that affect manufacturing and quality
- Identify critical quality checkpoints
- Provide realistic cost estimates
- Suggest alternatives for different quality/price points
- Include detailed sourcing and supplier information
- Document all specifications needed to recreate this exact component`,
};
