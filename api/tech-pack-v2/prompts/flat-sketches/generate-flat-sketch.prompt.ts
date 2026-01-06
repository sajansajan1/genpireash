/**
 * Flat Sketch Generation Prompt
 * Creates clean black and white vector-style technical flat sketches
 * showing trimming, lining, stitches, and pattern details
 */

export const FLAT_SKETCH_GENERATION_PROMPT = {
  systemPrompt: `You are a professional fashion technical illustrator specializing in flat sketches for manufacturing documentation.

Your task is to create prompts for generating CLEAN, SIMPLE flat technical sketches that show:
- Pure black line drawings on white background
- All seam lines and construction details
- Stitch types and placements
- Lining and trimming locations
- Pattern/cut lines
- No annotations, labels, or text

These sketches are used for pattern making and manufacturing reference.`,

  userPromptTemplate: (
    productCategory: string,
    productAnalysis: string,
    viewType: "front" | "back" | "side"
  ) => `Create a FLAT TECHNICAL SKETCH prompt for the following product:

PRODUCT CATEGORY: ${productCategory}
VIEW TYPE: ${viewType.toUpperCase()} VIEW

PRODUCT DETAILS:
${productAnalysis}

Generate a detailed image generation prompt for a clean, black and white flat technical sketch.

The sketch MUST:
1. Be a pure black line drawing on a pure white background
2. Show the ${viewType} view of the product in a flat, 2D perspective (no 3D angles)
3. Clearly display all seam lines and their types
4. Indicate stitch placements (topstitch, running stitch, backstitch, etc.)
5. Show lining construction where applicable
6. Mark trim, binding, and edge finishing details
7. Display pattern piece divisions and cut lines
8. Include dart positions and pocket placements
9. Show closure details (zippers, buttons, snaps, hooks)
10. Be in professional fashion industry flat sketch style

The sketch MUST NOT include:
- Any text, labels, or annotations
- Dimension lines or measurements
- Callout boxes or arrows
- Shading, gradients, or fill patterns
- Color (only black lines on white)
- 3D perspective or shadows
- Background elements

Return a JSON object with:
{
  "flat_sketch_prompt": "The detailed prompt for generating the flat sketch image",
  "style_notes": "Brief notes about the sketch style for this product type"
}`,

  imagePromptTemplate: (
    productCategory: string,
    viewType: "front" | "back" | "side",
    productDescription: string
  ) => `Create a professional FLAT TECHNICAL SKETCH in pure black and white vector style.

PRODUCT: ${productCategory}
VIEW: ${viewType.toUpperCase()} VIEW

${productDescription}

⚠️ CRITICAL CONSISTENCY REQUIREMENTS - MUST FOLLOW:
- Replicate the EXACT same product design as shown in the reference image
- IDENTICAL proportions, silhouette, shape, and overall design
- ALL design features, pockets, seams, collars, closures must match EXACTLY
- Do NOT add, remove, or modify ANY design elements from the reference
- Maintain the EXACT style, aesthetic, and construction of the original product
- The flat sketch must be an accurate technical representation of the reference product

TECHNICAL REQUIREMENTS:
- Clean black line drawing on PURE WHITE background (#FFFFFF)
- Flat, 2D perspective (professional fashion industry flat technical sketch style)
- The garment/product should be shown as if laid flat on a surface
- Symmetrical presentation for ${viewType === "front" || viewType === "back" ? "centered front/back" : "side profile"} view
- Show all seam lines clearly with appropriate line weights
- Indicate stitch types: topstitch as double parallel lines, regular seams as single lines
- Display lining edges with dashed lines where applicable
- Mark trim, piping, and binding locations with appropriate line styles
- Show pattern/cut lines and construction divisions
- Include dart positions, pocket placements, closure details (zippers, buttons, snaps)
- Professional fashion technical illustration quality

LINE WEIGHT HIERARCHY (IMPORTANT FOR CONSISTENCY):
- HEAVY lines (3-4px): Outer silhouette/outline of the garment
- MEDIUM lines (2px): Major seams, pocket outlines, structural divisions
- LIGHT lines (1px): Topstitching details, internal construction lines
- DASHED lines: Lining, hidden seams, fold lines

ABSOLUTE RESTRICTIONS - NEVER INCLUDE:
- NO shading, gradients, hatching, or fills of any kind
- NO text, labels, annotations, measurements, or dimensions
- NO callout boxes, arrows, numbers, or leader lines
- NO color whatsoever (only black lines on pure white background)
- NO 3D perspective, shadows, or depth effects
- NO background elements, patterns, or decorations
- NO artistic interpretation - replicate the reference EXACTLY as a flat sketch

OUTPUT: A single clean, professional flat technical sketch showing the ${viewType} view of THIS SPECIFIC PRODUCT with all construction details visible through precise line work only. The sketch must accurately represent the EXACT product shown in the reference image, maintaining all design details and proportions.`,
};
