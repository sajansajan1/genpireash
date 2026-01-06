/**
 * Assembly View (Exploded/Build View) Prompt Templates
 *
 * Generates an assembly view that visually explains how the product is built,
 * breaking it into components and showing their relationships, order of assembly,
 * and connection points.
 */

export interface AssemblyViewPromptParams {
  productCategory: string;
  productDescription?: string;
  components?: string[];
  baseViewAnalysis?: {
    view_type: string;
    analysis: any;
  }[];
}

/**
 * Build the assembly view generation prompt
 */
export function buildAssemblyViewPrompt(params: AssemblyViewPromptParams): string {
  const { productCategory, productDescription, components, baseViewAnalysis } = params;

  // Extract component names if available
  const componentsList = components?.length
    ? components.map((c, i) => `${i + 1}. ${c}`).join("\n")
    : "Components will be inferred from the product image";

  // Extract materials and construction details from base view analysis
  let constructionDetails = "";
  if (baseViewAnalysis?.length) {
    const materials: string[] = [];
    const constructionNotes: string[] = [];

    baseViewAnalysis.forEach((view) => {
      if (view.analysis?.materials_detected) {
        view.analysis.materials_detected.forEach((m: any) => {
          if (m.material_type && !materials.includes(m.material_type)) {
            materials.push(m.material_type);
          }
        });
      }
      if (view.analysis?.construction_details) {
        const details = view.analysis.construction_details;
        if (details.seam_types) {
          constructionNotes.push(`Seams: ${details.seam_types.join(", ")}`);
        }
        if (details.closure_types) {
          constructionNotes.push(`Closures: ${details.closure_types.join(", ")}`);
        }
      }
    });

    if (materials.length > 0) {
      constructionDetails += `\nMaterials: ${materials.join(", ")}`;
    }
    if (constructionNotes.length > 0) {
      constructionDetails += `\nConstruction: ${constructionNotes.join("; ")}`;
    }
  }

  return `Create a detailed ASSEMBLY/EXPLODED VIEW illustration for this ${productCategory} product.

PRODUCT INFORMATION:
- Category: ${productCategory}
${productDescription ? `- Description: ${productDescription}` : ""}
${constructionDetails}

COMPONENTS TO SHOW:
${componentsList}

VISUAL REQUIREMENTS:
1. Create an EXPLODED VIEW or LAYERED ASSEMBLY diagram
2. Show each component SEPARATED and FLOATING in space
3. Use DOTTED LINES or ARROWS to indicate assembly relationships
4. Arrange components in LOGICAL ASSEMBLY ORDER (inside to outside, or bottom to top)
5. Show CONNECTION POINTS clearly (where parts attach or overlap)
6. Use a clean, technical illustration style

NUMBERING REQUIREMENTS (CRITICAL):
- Number EVERY component with a small circled number (①②③④⑤⑥⑦⑧⑨⑩)
- Numbers MUST be sequential starting from 1 (NO GAPS - use 1,2,3,4,5 NOT 2,3,5)
- Place numbers clearly next to each component
- Numbers should follow assembly order (1 = first/innermost piece, highest = last/outermost)
- Use consistent number style throughout (all circled or all plain digits)
- Numbers must be legible and not overlap with components

STYLE SPECIFICATIONS:
- Clean white or light neutral background
- Each component clearly separated with space between
- Consistent lighting and perspective across all parts
- Professional technical illustration quality
- Components should appear to "float" in exploded position
- Connection lines should be thin, clean, and clearly indicate relationships
- Maintain realistic proportions and details on each component

ASSEMBLY INDICATORS TO INCLUDE:
- Directional arrows showing how parts come together
- Dotted lines connecting related components
- Clear visual hierarchy (outer layers further from center)
- Stitch lines, seams, or attachment points clearly visible
- Sequential numbers (1, 2, 3, 4...) for each component

DO NOT:
- Show the product assembled (must be exploded view)
- Use cluttered or overlapping components
- Include excessive text or annotations (only numbers)
- Use cartoon or unrealistic styles
- Add background scenes or distracting elements
- Skip numbers in the sequence (e.g., jumping from 2 to 5)
- Use inconsistent numbering styles

The final image should help manufacturers understand:
- The order of assembly/construction
- How components relate to each other
- Where attachment points are located
- The overall construction complexity`;
}

/**
 * Get a simplified prompt for quick assembly view generation
 */
export function getSimpleAssemblyViewPrompt(productCategory: string): string {
  return `Create a professional EXPLODED/ASSEMBLY VIEW illustration for a ${productCategory}.

Show all components separated and floating in space with:
- Clear assembly order (parts arranged logically)
- Dotted lines or arrows connecting related parts
- Clean technical illustration style
- White background
- Professional quality suitable for manufacturing documentation

The view should clearly show how the product is constructed and assembled.`;
}
