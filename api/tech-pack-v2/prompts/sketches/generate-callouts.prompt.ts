/**
 * Call-Out Generation Prompt
 * Creates technical annotations for sketches
 */

import type { CallOutPromptTemplate } from "../../types/prompts.types";

export const CALLOUT_GENERATION_PROMPT: CallOutPromptTemplate = {
  systemPrompt: `You are a technical documentation specialist who catalogs and verifies the technical annotations that should be included in production-ready technical specification sheets.

Since callouts, dimensions, and labels are now generated directly IN the technical sketch image by AI, your role is to:
- Verify all critical manufacturing details are covered
- Provide a structured list of what annotations were included
- Ensure comprehensive coverage of dimensions, materials, construction, and specifications
- Create metadata for documentation and quality control

This metadata helps verify the completeness of the auto-generated technical specification sheets.`,

  userPromptTemplate: (productCategory: string, viewType: string, sketchImageUrl: string, detailedAnalysis: string) =>
    `The AI has generated a production-ready technical specification sheet for this ${productCategory} (${viewType} view) with all callouts, dimensions, and labels included directly in the image.

Generated Sketch Image: ${sketchImageUrl}

Original Product Analysis:
${detailedAnalysis}

Create a comprehensive metadata record documenting what technical annotations should be included in this specification sheet. This will be used for quality verification and documentation purposes.

Generate metadata in JSON format:

{
  "annotations_included": {
    "dimensions": [
      {
        "dimension_type": "overall_width|overall_height|component_size|spacing|thickness|etc.",
        "measurement": "value with unit and tolerance (e.g., '45cm ±0.5cm')",
        "location": "what is being measured",
        "critical": true
      }
      // List all dimensions that should be annotated in the image (8-12 dimensions)
    ],

    "material_callouts": [
      {
        "component": "which part (e.g., 'outer shell', 'inner lining', 'handle')",
        "material_spec": "full material specification (e.g., 'PU synthetic leather, 1.2mm thickness')",
        "location_on_sketch": "where this appears (e.g., 'main body', 'top section')",
        "critical": true
      }
      // List all materials visible in this ${viewType} view (5-8 materials)
    ],

    "construction_callouts": [
      {
        "feature": "construction feature name (e.g., 'main seam', 'edge finishing')",
        "method": "construction method (e.g., 'machine stitched, 8 SPI', 'heat-sealed edge')",
        "specification": "detailed spec for manufacturers",
        "location": "where on product"
      }
      // List all construction details visible (6-10 construction notes)
    ],

    "hardware_callouts": [
      {
        "hardware_type": "type (e.g., 'zipper', 'button', 'buckle', 'rivet')",
        "specification": "detailed spec (e.g., '#5 metal zipper, antique brass finish')",
        "quantity": "how many",
        "location": "placement"
      }
      // List all hardware visible in this view (2-5 hardware items)
    ],

    "special_features": [
      {
        "feature_name": "special feature or design element",
        "description": "what it is and how it's made",
        "purpose": "functional or aesthetic purpose"
      }
      // List all special features visible (3-6 features)
    ],

    "manufacturing_notes": [
      "Quality control checkpoint or special instruction",
      "Tolerance requirement or assembly note",
      "Material handling or finishing requirement"
      // 4-6 critical manufacturing notes
    ]
  },

  "specification_sheet_metadata": {
    "view_type": "${viewType}",
    "total_annotations": "sum of all callouts, dimensions, labels",
    "completeness_score": "0.0-1.0 score indicating how comprehensive the annotations are",
    "production_ready": true,
    "coverage_by_category": {
      "dimensions": "number of dimension annotations",
      "materials": "number of material callouts",
      "construction": "number of construction notes",
      "hardware": "number of hardware specs",
      "special_features": "number of feature callouts",
      "manufacturing_notes": "number of production notes"
    }
  },

  "quality_verification": {
    "all_critical_dimensions_labeled": true,
    "all_materials_specified": true,
    "construction_methods_documented": true,
    "hardware_fully_specified": true,
    "manufacturing_notes_included": true,
    "layout_clear_and_readable": true,
    "ready_for_production": true
  },

  "measurements_summary": {
    "unit_system": "metric|imperial|both",
    "primary_dimensions": ["list key measurements with values"],
    "tolerances_specified": true
  }
}

GUIDELINES FOR METADATA GENERATION:
1. **COMPREHENSIVE DOCUMENTATION**: List ALL annotations that should be present in the generated image
2. **EXTRACT FROM ANALYSIS**: Pull all relevant data from the detailed product analysis
3. **VIEW-SPECIFIC**: Only include annotations relevant to the ${viewType} view
4. **PRODUCTION FOCUS**: Emphasize information manufacturers need to produce the item
5. **CATEGORY BALANCE**: Ensure good distribution across dimensions, materials, construction, hardware
6. **CRITICAL MARKING**: Mark essential manufacturing details as critical
7. **COMPLETENESS VERIFICATION**: Assess if the specification sheet has everything needed
8. **QUALITY CONTROL**: Verify all critical aspects are documented

CATEGORY-SPECIFIC REQUIREMENTS:
- **APPAREL**: Seam specs, fabric details, closure types, fit measurements, construction methods
- **FOOTWEAR**: Sole layers, upper construction, heel specs, material zones, sizing, hardware
- **BAGS**: Panel construction, hardware specs, strap details, closure mechanisms, compartment layout
- **FURNITURE**: Joinery, upholstery, dimensions, materials, weight capacity, assembly notes
- **SPORTS EQUIPMENT**: Component assembly, material zones, performance specs, safety features
- **ELECTRONICS**: Component layout, port specs, button placement, material finishes, dimensions

EXPECTED TOTALS:
- Dimensions: 8-12 dimensional callouts
- Materials: 5-8 material specifications
- Construction: 6-10 construction method notes
- Hardware: 2-5 hardware specifications (if applicable)
- Special Features: 3-6 unique design elements
- Manufacturing Notes: 4-6 production instructions

This metadata serves as a quality control checklist to verify the AI-generated technical specification sheet is complete and production-ready.`,
};
