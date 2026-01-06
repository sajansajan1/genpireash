/**
 * Technical Sketch Generation Prompt
 * Creates prompts for AI to generate professional technical flat sketches
 */

import type { SketchPromptTemplate } from "../../types/prompts.types";

export const TECHNICAL_SKETCH_GENERATION_PROMPT: SketchPromptTemplate = {
  systemPrompt: `You are a professional technical illustrator specializing in manufacturing documentation and production-ready tech packs. You create comprehensive technical specification drawings with all annotations, callouts, dimensions, and labels integrated directly into the image.

Production-ready technical sketches MUST include:
- Flat, proportional line drawing of the product (no perspective)
- ALL dimension lines with measurements clearly labeled
- Callout boxes with arrows pointing to specific features, materials, and construction details
- Labels for all components, materials, and hardware
- Construction notes and specifications as text annotations
- Clear, professional typography for all text elements
- Grid or measurement reference if applicable
- Manufacturing notes and special instructions

You generate detailed prompts for AI image generation that will create COMPLETE technical specification sheets suitable for immediate use in production.`,

  userPromptTemplate: (productCategory: string, productAnalysis: string, viewType: "front" | "back" | "side") =>
    `Create a comprehensive prompt for generating a PRODUCTION-READY technical specification drawing of this ${productCategory} product with ALL annotations, dimensions, callouts, and labels included in the image.

Product Analysis:
${productAnalysis}

View Type: ${viewType}

CRITICAL: The generated image must be a COMPLETE technical spec sheet with the sketch AND all annotations in one image. This is NOT just a line drawing - it's a fully annotated technical specification document.

Generate an AI image generation prompt that will create a professional technical specification sheet. Provide your response in JSON format:

{
  "sketch_prompt": "PRODUCTION-READY technical specification sheet for [detailed product description based on analysis] ${viewType} view. Central clean black line drawing of the product on white background, surrounded by comprehensive technical annotations. MUST INCLUDE IN THE IMAGE: 1) Main product sketch in center (flat, no perspective, proportional line drawing). 2) Dimension lines with arrows and measurements labeled in clear sans-serif font (include ALL key dimensions from analysis: [extract specific dimensions from analysis]). 3) Callout boxes with leader lines pointing to specific features (materials, construction methods, hardware, special features - minimum 8-12 callouts around the sketch). 4) Material specifications labeled with arrows pointing to each component. 5) Construction detail notes in text boxes. 6) Title block containing ONLY: PRODUCT name and VIEW type - ABSOLUTELY NO DATES, NO TIMESTAMPS, NO YEAR NUMBERS, NO MONTH NAMES. 7) Grid or scale reference. Professional tech pack layout, manufacturer specification sheet quality, clean typography, technical drawing style, all text clearly legible, organized layout with callouts distributed around the main sketch, production documentation standard, CAD technical sheet style, blueprint quality with annotations.",

  "negative_prompt": "no color except black lines and text on white background, no shading, no gradients, no perspective on main drawing, no 3D rendering of product, no photographs, no models, no realistic rendering, no shadows on product, no decorative elements, no artistic interpretation, no hand-drawn sketchy style, no incomplete annotations, no missing dimensions, no unlabeled features, ABSOLUTELY NO DATES of any kind, no timestamps, no calendar dates, no revision dates, no DATE field, no OCT, no JAN, no FEB, no MAR, no APR, no MAY, no JUN, no JUL, no AUG, no SEP, no NOV, no DEC, no 2023, no 2024, no 2025, no year numbers",

  "technical_requirements": {
    "layout": "Technical specification sheet with product sketch centered, annotations distributed around it",
    "sketch_style": "Clean black line drawing, flat technical illustration, no perspective distortion",
    "annotation_style": "Professional technical documentation with callouts, dimension lines, labels, and notes",
    "typography": "Clear sans-serif font for all text, readable at production size",
    "background": "Pure white (#FFFFFF)",
    "line_weights": "Medium weight for product outlines, thin for dimension lines and leaders, consistent throughout",
    "required_annotations": [
      "Dimension lines with measurements for ALL key dimensions (width, height, depth, component sizes)",
      "Material callouts with arrows pointing to each material/component",
      "Construction method labels for seams, joints, assembly",
      "Hardware specifications and placement",
      "Special feature annotations",
      "Manufacturing notes and tolerances",
      "Scale or grid reference",
      "Title block with ONLY product name and ${viewType} view designation - NEVER include any dates, timestamps, revision dates, or year numbers"
    ]
  },

  "sketch_specifications": {
    "main_drawing": {
      "position": "Centered on sheet",
      "view_angle": "${viewType} - perfectly flat, orthographic projection, no perspective",
      "scale": "Proportionally accurate to analysis data",
      "detail_level": "Show all visible construction details, seams, hardware, features",
      "line_quality": "Clean, professional CAD-style lines"
    },
    "dimensions": {
      "style": "Dimension lines with arrows at both ends, measurement text above line",
      "units": "Use appropriate units from analysis (cm, inches, mm)",
      "coverage": "Include ALL critical dimensions: overall dimensions, component sizes, spacing",
      "placement": "Outside the main sketch with clear extension lines"
    },
    "callouts": {
      "quantity": "Minimum 8-12 callouts distributed around the sketch",
      "style": "Text box with leader line and arrow pointing to feature",
      "content": "Material type, construction method, hardware specs, special features",
      "examples": "'PU synthetic leather outer', 'Machine stitched seam - 8 SPI', 'Metal zipper #5', 'Reinforced stress points', 'Heat-sealed edges', etc."
    },
    "layout_guidelines": {
      "margins": "Adequate white space around sketch and annotations",
      "organization": "Callouts distributed logically (left side, right side, top, bottom)",
      "readability": "No overlapping text, clear visual hierarchy",
      "professionalism": "Clean, organized, production-ready appearance"
    }
  },

  "specific_elements_to_include": [
    "SKETCH: Draw the complete ${viewType} view showing all visible design elements from analysis",
    "DIMENSIONS: Add dimension lines for all measurements from the analysis (extract specific measurements)",
    "MATERIALS: Label every material/component identified in the analysis with callout arrows",
    "CONSTRUCTION: Annotate construction methods (stitching, gluing, molding, etc.) with callouts",
    "HARDWARE: Label all hardware (zippers, buttons, buckles, etc.) with specifications",
    "FEATURES: Callout all special features and design elements",
    "NOTES: Include manufacturing notes, tolerances, quality requirements in text boxes",
    "REFERENCE: Add scale bar or grid, title block with product name and view type"
  ],

  "product_category_specifics": {
    "adapt_to": "${productCategory}",
    "annotation_focus": "Based on product type, emphasize relevant technical details:",
    "examples": {
      "APPAREL": "Seam types and placement, fabric grain, closure details, hem finishes, dart positions, fit measurements",
      "FOOTWEAR": "Sole construction layers, upper pattern pieces, heel height, toe shape, material zones, stitch counts",
      "BAGS": "Panel construction, handle attachment, closure mechanisms, compartment layout, strap adjustments, hardware specs",
      "FURNITURE": "Frame joinery, upholstery attachment, leg assembly, material specifications, weight capacity, dimensions",
      "SPORTS_EQUIPMENT": "Component assembly, material zones, performance specs, safety features, regulatory compliance",
      "ELECTRONICS": "Component layout, port specifications, button placement, screen dimensions, material finishes"
    }
  }
}

CRITICAL GUIDELINES:
1. **COMPLETE SPECIFICATION SHEET**: The image must be a FULL technical spec sheet, not just a sketch
2. **ALL ANNOTATIONS INCLUDED**: Dimensions, callouts, labels, notes MUST be part of the generated image
3. **PRODUCTION READY**: Manufacturers should be able to produce the item from this single image
4. **HIGHLY SPECIFIC**: Extract ALL relevant data from the product analysis and include it as annotations
5. **PROFESSIONAL LAYOUT**: Clean, organized, technical documentation standard
6. **COMPREHENSIVE COVERAGE**: Every visible feature, material, and construction detail should be labeled
7. **ACCURATE MEASUREMENTS**: Include all dimensions from the analysis with proper units
8. **CLEAR TYPOGRAPHY**: All text must be clearly readable and professionally formatted
9. **MANUFACTURER PERSPECTIVE**: Include information manufacturers need (tolerances, materials, methods, specs)
10. **VIEW-APPROPRIATE**: Only annotate features visible in the ${viewType} view
11. **ABSOLUTELY NO DATES**: Do NOT include ANY dates whatsoever - no timestamps, no revision dates, no calendar dates, no month names (Jan, Feb, etc.), no year numbers (2023, 2024, 2025), no DATE field in title block. The title block should ONLY contain product name and view type

PROMPT CONSTRUCTION INSTRUCTIONS:
- Start with "PRODUCTION-READY technical specification sheet..."
- Describe the central sketch (product, view, flat illustration style)
- Explicitly state "MUST INCLUDE IN THE IMAGE:" followed by numbered list of all required elements
- List specific dimensions to include (extracted from analysis)
- List specific materials/components to label (from analysis)
- List construction details to annotate (from analysis)
- Specify callout quantity (8-12 minimum) and distribution
- Emphasize professional tech pack / CAD drawing / blueprint quality
- Include all product-specific details from the analysis that are relevant to this view`,
};
