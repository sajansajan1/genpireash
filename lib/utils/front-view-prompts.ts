/**
 * Shared Front View Prompt Building Logic
 *
 * Consolidates front view prompt generation across all workflows
 * Used by:
 * - progressive-generation-workflow.ts
 * - stepped-image-generation.ts
 * - centralized-generation-service.ts
 * - Any other front view generation flows
 *
 * This ensures consistent prompt structure and reduces code duplication
 */

export interface FrontViewPromptOptions {
  /** User's prompt or description */
  userPrompt: string;

  /** Reference image URL (for edits/iterations) */
  referenceImageUrl?: string;

  /** Logo image data (base64 or URL) */
  logoImage?: string;

  /** Whether this is an edit operation */
  isEdit?: boolean;

  /** Specific modifications to apply */
  modifications?: string;

  /** Visual style for the output */
  style?: "photorealistic" | "technical" | "vector" | "detail";
}

/**
 * Build standardized front view prompt
 * This function is used across ALL front view generation flows
 *
 * @param options - Prompt building options
 * @returns Complete prompt for Gemini API
 *
 * @example
 * ```typescript
 * const prompt = buildFrontViewPrompt({
 *   userPrompt: "A blue cotton t-shirt with company logo",
 *   logoImage: base64LogoData,
 *   style: "photorealistic"
 * });
 * ```
 */
export function buildFrontViewPrompt(options: FrontViewPromptOptions): string {
  const {
    userPrompt,
    referenceImageUrl,
    logoImage,
    isEdit = false,
    modifications,
    style = "photorealistic",
  } = options;

  // Base prompt construction
  const basePrompt = referenceImageUrl
    ? modifications
      ? `Based on the reference image, ${modifications}: ${userPrompt}`
      : isEdit
      ? `Based on the reference image, generate an improved version: ${userPrompt}`
      : userPrompt
    : userPrompt;

  // Logo instructions (if logo provided)
  const logoInstructions = logoImage
    ? `
🎯 LOGO PLACEMENT - CRITICAL REQUIREMENT:
- A brand logo/image has been provided and MUST be applied to the product
- THIS IS THE PRIMARY TASK: Place the provided logo/image ON the product
- The logo MUST be clearly visible and prominently placed
- The logo should look like it's printed, embroidered, or applied realistically on the product surface
- Position the logo appropriately for the product type (e.g., front center on apparel, side for bags)
- Make the logo look integrated into the product design, not like a floating overlay
- Ensure the logo is large enough to be clearly recognizable
- DO NOT ignore the logo - it MUST appear on the product in the generated image
- If the user specified a position (front, back, center, etc.), follow that exactly
- If the user specified a color change for the logo, apply that color transformation
`
    : "";

  // Style-specific instructions
  const styleInstructions = {
    photorealistic:
      "Photorealistic style with professional studio lighting and high detail",
    technical:
      "Technical drawing style with precise lines, measurements, and annotations",
    vector: "Clean vector art style with solid colors and minimal gradients",
    detail:
      "Highly detailed with emphasis on textures, materials, and fine craftsmanship",
  }[style];

  // Build complete prompt
  const prompt = `
Generate a ${style} product image:

${basePrompt}
${logoInstructions}

CRITICAL REQUIREMENTS:
- Generate ONLY the FRONT VIEW of the product
- This must be a SINGLE IMAGE showing ONLY the front perspective
- DO NOT create a grid, collage, or multiple views in one image
- DO NOT show back view or side view in this image
- Generate ONE product from ONE angle only

SPECIFICATIONS:
- Front view only (facing directly forward)
- Pure white background (#FFFFFF)
- ${styleInstructions}
- High detail and clarity
- Single product focus
- Fill the entire frame with just this one view
- No text overlays or watermarks
- Professional product photography quality
- The dimensions of this image are 720 × 720 pixels (it's a square image)

IMPORTANT: If the reference shows multiple views, IGNORE the other views and focus ONLY on recreating/modifying the FRONT view as a single, standalone image.
`;

  return prompt.trim();
}

/**
 * Build front view prompt for progressive workflow
 * Wrapper for backward compatibility with existing code
 *
 * @param userPrompt - User's description
 * @param referenceImage - Optional reference image URL
 * @param logoImage - Optional logo data
 * @returns Complete prompt
 */
export function buildProgressiveFrontViewPrompt(
  userPrompt: string,
  referenceImage?: string,
  logoImage?: string
): string {
  return buildFrontViewPrompt({
    userPrompt,
    referenceImageUrl: referenceImage,
    logoImage,
    isEdit: !!referenceImage,
  });
}

/**
 * Build front view prompt for stepped workflow
 * Wrapper for backward compatibility with existing code
 *
 * @param params - Stepped workflow parameters
 * @returns Complete prompt
 */
export function buildSteppedFrontViewPrompt(params: {
  input: {
    type: "text" | "image";
    content: string;
  };
  options?: {
    logo?: { image: string };
    style?: "photorealistic" | "technical" | "vector" | "detail";
    modifications?: string;
  };
}): string {
  return buildFrontViewPrompt({
    userPrompt:
      params.input.type === "text"
        ? params.input.content
        : "Product from reference image",
    referenceImageUrl:
      params.input.type === "image" ? params.input.content : undefined,
    logoImage: params.options?.logo?.image,
    isEdit: params.input.type === "image",
    modifications: params.options?.modifications,
    style: params.options?.style,
  });
}
