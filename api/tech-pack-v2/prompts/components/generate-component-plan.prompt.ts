/**
 * Component Image Generation Plan Prompt
 * Identifies key components/ingredients to visualize as standalone images
 */

import type { ComponentPlanPromptTemplate } from "../../types/prompts.types";

export const COMPONENT_ANALYSIS_PLAN_PROMPT: ComponentPlanPromptTemplate = {
  systemPrompt: `You are a product component visualization expert who identifies the key components, parts, and ingredients of a product that should be documented as standalone visual images for manufacturing.

Your goal is to create a comprehensive plan for generating detailed component images - similar to close-up shots but focused on individual parts, materials, or ingredients that make up the product.

You understand that factories need to see:
- Individual material swatches and fabric samples
- Isolated hardware components (buttons, zippers, clasps)
- Ingredient/formulation components (for cosmetics, food products)
- Construction elements (stitching, seams, reinforcements)
- Trim and finishing details (labels, tags, logos)
- Packaging components (boxes, bags, inserts)

Each component should be visualized as a standalone image with detailed specifications.`,

  userPromptTemplate: (productCategory: string, baseViewAnalysis: string, productContext: string) =>
    `Based on this ${productCategory} analysis, identify ALL key components/ingredients that should be documented as standalone visual images.

Base View Analysis:
${baseViewAnalysis}

${productContext}

Create a detailed plan for component images in JSON format:

{
  "component_shots": [
    {
      "shot_number": 1,
      "component_name": "Main Body Fabric",
      "component_type": "material|hardware|trim|ingredient|construction|packaging",
      "target_area": "Where this component is used on the product",
      "purpose": "Why this component needs its own image",
      "image_generation_prompt": "Detailed prompt for AI image generation - describe exactly how to visualize this component in isolation",
      "negative_prompt": "What to avoid in the image",
      "analysis_focus": ["Material composition", "Texture details", "Color specifications", "Weight/thickness"],
      "critical_for_manufacturing": true|false,
      "priority": "high|medium|low",
      "specifications_to_capture": ["Specific measurements or properties to document"]
    }
  ],
  "shot_guidelines": {
    "lighting": "Optimal lighting for component visualization",
    "background": "Background style for component images",
    "angle": "Best angle to show component details",
    "scale": "How to show size reference"
  },
  "total_components_recommended": 0,
  "estimated_coverage": "Description of what these components represent"
}

GUIDELINES FOR COMPONENT IDENTIFICATION:

**APPAREL COMPONENTS:**
- Main fabric swatch (isolated material view)
- Lining fabric sample
- Interfacing material
- Buttons/closures (individual hardware)
- Zipper detail (isolated)
- Thread color samples
- Care label design
- Brand tag/logo
- Elastic/trim materials

**BAGS/ACCESSORIES COMPONENTS:**
- Outer material swatch
- Lining fabric sample
- Hardware pieces (D-rings, buckles, zippers) individually
- Strap material cross-section
- Padding/foam layers
- Logo/branding elements
- Interior pockets (isolated view)

**FOOTWEAR COMPONENTS:**
- Upper material samples
- Sole material composition
- Insole material
- Lace/closure system
- Reinforcement materials
- Tread pattern detail

**FURNITURE COMPONENTS:**
- Upholstery fabric swatch
- Frame material sample
- Foam/padding layers
- Fastener/hardware details
- Finish/stain samples
- Leg/support structure detail

**JEWELRY COMPONENTS:**
- Base metal material
- Gemstone/bead details
- Clasp mechanism
- Chain/wire type
- Plating finish sample

**COSMETICS/CONSUMABLES COMPONENTS:**
- Individual ingredient visualization
- Texture/consistency samples
- Color swatches
- Applicator tools
- Packaging material samples
- Container material detail

IMPORTANT:
- Each component should be visualizable as a STANDALONE IMAGE
- Focus on materials, parts, and ingredients that factories need to SOURCE and VERIFY
- Provide detailed image generation prompts that will create clear, professional product photography
- Prioritize components that are critical for quality and manufacturing accuracy
- Include 5-10 key components (don't list everything, focus on the most important)
`,
};
