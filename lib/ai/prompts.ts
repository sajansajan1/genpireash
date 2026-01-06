// /**
//  * Prompt Templates for Gemini Image Generation
//  * Contains all the prompt templates for different styles and views
//  */

// export const PROMPT_TEMPLATES = {
//   photorealistic: {
//     front: `Commercial product photography of [PRODUCT], front view.
//       Perfectly centered and isolated on a neutral light-grey background.
//       Lit with clean, even studio lighting to eliminate shadows.
//       Razor-sharp focus, ultra-high detail, 8k resolution.`,

//     back: `Commercial product photography of [PRODUCT], back view.
//       Perfectly centered and isolated on a neutral light-grey background.
//       Lit with clean, even studio lighting to eliminate shadows.
//       Razor-sharp focus, ultra-high detail, 8k resolution.`,

//     side: `Commercial product photography of [PRODUCT], side profile view.
//       Perfectly centered and isolated on a neutral light-grey background.
//       Lit with clean, even studio lighting to eliminate shadows.
//       Razor-sharp focus, ultra-high detail, 8k resolution.`,

//     bottom: `Commercial product photography of [PRODUCT], bottom view.
//       Perfectly centered and isolated on a neutral light-grey background.
//       Lit with clean, even studio lighting to eliminate shadows.
//       Razor-sharp focus, ultra-high detail, 8k resolution.`,

//     illustration: `A photorealistic lifestyle illustration of [PRODUCT].
//       The product is shown in a real-world context, such as a person using it in a bright, modern cafe or an urban park.
//       The background should be dynamic but softly blurred to keep the product as the hero.
//       Use natural, warm lighting to create an inviting feel.
//       Cinematic quality, highly detailed, 8k resolution.`
//   },

//   technical: {
//     front: `Create a professional, flat technical sketch of the front view for [PRODUCT].
//       Style: Black and white vector-style line drawing.
//       Perspective: Strictly 2D flat view, no 3D effects.
//       Color: No color, gradients, or shading. Clean line art on white background.
//       Lines: Crisp, clean, consistent black outlines.
//       Include: Full silhouette, all seams, pockets, hardware, stitching details.
//       Output: High-quality technical flat for factory-ready tech pack.`,

//     back: `Create a professional, flat technical sketch of the back view for [PRODUCT].
//       Style: Black and white vector-style line drawing.
//       Perspective: Strictly 2D flat view, no 3D effects.
//       Color: No color, gradients, or shading. Clean line art on white background.
//       Lines: Crisp, clean, consistent black outlines.
//       Include: Complete back silhouette, all back seams, design details, stitching.
//       Output: High-quality technical flat consistent with front view.`,

//     vector: `Flat technical drawing of [PRODUCT], black and white, no color, vector-style line art,
//       front and back view, no perspective, clean outlines only, no fills, no shading.
//       Technical illustration style suitable for manufacturing documentation.`,

//     detail: `Extreme close-up macro photography of [DETAIL] on [PRODUCT],
//       high resolution detail shot, professional product photography, showing texture and construction details,
//       clean white studio background, soft even lighting, sharp focus,
//       showing stitching, fabric texture, hardware details, manufacturing quality.`,

//     measurement: `Technical line drawing of [PRODUCT] with letter indicators ONLY.
//       STRICT REQUIREMENTS:
//       • Draw clean product outline in black lines
//       • Add ONLY circular letter indicators (A, B, C, D, etc.)
//       • Position indicators at key measurement points
//       • NO measurement values, NO numbers, NO dimension lines
//       • NO arrows, NO text labels, NO units
//       • ONLY show the product shape and letter circles
//       • Keep it minimal and clean
//       • Black and white technical illustration
//       Professional minimalist style for reference documentation.`,

//     construction: `Technical construction drawing of [PRODUCT] showing:
//       Assembly lines, component divisions, connection details (dashed lines), joints,
//       folds, overlapping parts, fasteners, connectors, hardware.
//       Professional technical drawing with dimension callouts, measurement arrows,
//       assembly annotations. Clean engineering documentation style.`,

//     callout: `Technical specification drawing of [PRODUCT] with comprehensive callout system.
//       Numbered circles with clear leader lines and arrows pointing precisely to:
//       Material boundaries and component zones, hardware attachment points,
//       design features and surface applications, assembly and construction highlights.
//       Professional technical drawing with clean callout bubbles and precise arrows.
//       Include legend/key explaining all numbered and lettered references.`,

//     scale: `Technical scale diagram of [PRODUCT] with proportional accuracy.
//       Accurate proportional relationships between all components.
//       Professional ruler scale or measurement grid overlay.
//       Scale ratio indicator and measurement reference legend.
//       True-to-scale hardware and functional elements with proper sizing.
//       Include scale ratio indicator and dimensional accuracy markers.`,

//     technical: `Technical specification drawing of [PRODUCT] with comprehensive annotations.
//       Professional flat technical drawing showing complete construction details.
//       Black and white vector-style line art with clean, crisp outlines.
//       Include all seams, hardware, stitching details, and construction features.
//       Professional technical documentation suitable for manufacturing.
//       High-quality tech pack ready illustration with dimension callouts.`
//   },

//   vector: {
//     front: `Vector illustration of [PRODUCT], front view.
//       Pure vector graphics with clean lines and shapes.
//       Flat design aesthetic with no gradients or shadows.
//       Suitable for digital and print media.
//       Scalable without quality loss.`,

//     back: `Vector illustration of [PRODUCT], back view.
//       Pure vector graphics with clean lines and shapes.
//       Flat design aesthetic with no gradients or shadows.
//       Consistent with front view style.
//       Scalable without quality loss.`
//   },

//   detail: {
//     hardware: `Macro photography of hardware components on [PRODUCT].
//       Extreme close-up showing zippers, buttons, snaps, or fasteners.
//       Crystal clear detail of metal finishes and mechanisms.
//       Professional product photography with perfect lighting.`,

//     fabric: `Macro photography of fabric texture on [PRODUCT].
//       Extreme close-up showing weave pattern and material quality.
//       Clear detail of fabric construction and surface texture.
//       Professional textile photography with even lighting.`,

//     stitching: `Macro photography of stitching details on [PRODUCT].
//       Extreme close-up showing stitch quality and construction.
//       Clear detail of seam construction and thread quality.
//       Professional garment photography with sharp focus.`,

//     logo: `Macro photography of branding/logo on [PRODUCT].
//       Extreme close-up showing print or embroidery quality.
//       Clear detail of brand application method.
//       Professional product photography with perfect clarity.`
//   }
// };

// /**
//  * Helper function to get a prompt template
//  */
// export function getPromptTemplate(
//   style: keyof typeof PROMPT_TEMPLATES,
//   view: string
// ): string | undefined {
//   const styleTemplates = PROMPT_TEMPLATES[style];
//   if (!styleTemplates) {
//     return undefined;
//   }

//   return styleTemplates[view as keyof typeof styleTemplates];
// }

// /**
//  * Replace placeholders in a prompt template
//  */
// export function replacePlaceholders(
//   template: string,
//   replacements: Record<string, string>
// ): string {
//   let result = template;

//   Object.entries(replacements).forEach(([key, value]) => {
//     const regex = new RegExp(`\\[${key}\\]`, 'g');
//     result = result.replace(regex, value);
//   });

//   return result;
// }

// /**
//  * Build a complete prompt from template
//  */
// export function buildPromptFromTemplate(
//   product: string,
//   view: string = 'front',
//   style: keyof typeof PROMPT_TEMPLATES = 'photorealistic',
//   additionalReplacements?: Record<string, string>
// ): string {
//   const template = getPromptTemplate(style, view);

//   if (!template) {
//     throw new Error(`No template found for style: ${style}, view: ${view}`);
//   }

//   const replacements = {
//     PRODUCT: product,
//     ...additionalReplacements
//   };

//   return replacePlaceholders(template, replacements);
// }

// /**
//  * Get fallback prompt for blocked content
//  */
// export function getFallbackPrompt(
//   productType: string,
//   view?: string,
//   style?: string
// ): string {
//   const basePrompt = `Create a professional ${style === 'technical' ? 'technical drawing' : 'product image'} of ${productType}.`;

//   const styleSpecific = style === 'technical'
//     ? `The image should be a clean, vector-style line art suitable for manufacturing documentation.
//        Show clear construction details, accurate proportions, and technical specifications.`
//     : `The image should be a high-quality product photograph with professional lighting and composition.
//        Show the product clearly with all important details visible.`;

//   const viewSpecific = view ? `Show the ${view} view of the product.` : '';

//   return `${basePrompt} ${styleSpecific} ${viewSpecific}
//           Ensure the final image is professional quality suitable for commercial use.`;
// }

// /**
//  * Enhance prompt with Gemini-specific optimizations
//  */
// export function enhancePromptForGemini(basePrompt: string, style?: string): string {
//   const prefix = "[Gemini 2.5 Fashion Tech Pack Generation]";

//   const requirements = `
//     Technical Requirements:
//     - Ultra-high resolution 16K output capability
//     - Manufacturing-ready precision and clarity
//     - Fashion industry standard compliance
//     - Professional ${style === 'technical' ? 'technical illustration' : 'photography'} quality
//     - Multi-view consistency for tech packs`;

//   return `${prefix}\n${basePrompt}\n${requirements}`;
// }

// // Export all prompt-related utilities
// export const PromptUtils = {
//   templates: PROMPT_TEMPLATES,
//   getTemplate: getPromptTemplate,
//   replacePlaceholders,
//   buildFromTemplate: buildPromptFromTemplate,
//   getFallback: getFallbackPrompt,
//   enhanceForGemini: enhancePromptForGemini
// };

// export default PROMPT_TEMPLATES;

/**
 * Prompt Templates for Gemini Image Generation
 * Contains all the prompt templates for different styles and views
 */

// export const PROMPT_TEMPLATES = {
//   photorealistic: {
//     front: `Commercial product photography of [PRODUCT], front view.
//       Perfectly centered and isolated on a neutral light-grey background.
//       Lit with clean, even studio lighting to eliminate shadows.
//       Razor-sharp focus, ultra-high detail, 8k resolution.`,

//     back: `Commercial product photography of [PRODUCT], back view.
//       Perfectly centered and isolated on a neutral light-grey background.
//       Lit with clean, even studio lighting to eliminate shadows.
//       Razor-sharp focus, ultra-high detail, 8k resolution.`,

//     side: `Commercial product photography of [PRODUCT], side profile view.
//       Perfectly centered and isolated on a neutral light-grey background.
//       Lit with clean, even studio lighting to eliminate shadows.
//       Razor-sharp focus, ultra-high detail, 8k resolution.`,

//     bottom: `Commercial product photography of [PRODUCT], bottom view.
//       Perfectly centered and isolated on a neutral light-grey background.
//       Lit with clean, even studio lighting to eliminate shadows.
//       Razor-sharp focus, ultra-high detail, 8k resolution.`,

//     illustration: `A photorealistic lifestyle illustration of [PRODUCT].
//       The product is shown in a real-world context, such as a person using it in a bright, modern cafe or an urban park.
//       The background should be dynamic but softly blurred to keep the product as the hero.
//       Use natural, warm lighting to create an inviting feel.
//       Cinematic quality, highly detailed, 8k resolution.`,
//   },

//   technical: {
//     front: `Create a professional, flat technical sketch of the front view for [PRODUCT].
//       Style: Black and white vector-style line drawing.
//       Perspective: Strictly 2D flat view, no 3D effects.
//       Color: No color, gradients, or shading. Clean line art on white background.
//       Lines: Crisp, clean, consistent black outlines.
//       Include: Full silhouette, all seams, pockets, hardware, stitching details.
//       Output: High-quality technical flat for factory-ready tech pack.`,

//     back: `Create a professional, flat technical sketch of the back view for [PRODUCT].
//       Style: Black and white vector-style line drawing.
//       Perspective: Strictly 2D flat view, no 3D effects.
//       Color: No color, gradients, or shading. Clean line art on white background.
//       Lines: Crisp, clean, consistent black outlines.
//       Include: Complete back silhouette, all back seams, design details, stitching.
//       Output: High-quality technical flat consistent with front view.`,

//     vector: `Flat technical drawing of [PRODUCT], black and white, no color, vector-style line art,
//       front and back view, no perspective, clean outlines only, no fills, no shading.
//       Technical illustration style suitable for manufacturing documentation.`,

//     detail: `Extreme close-up macro photography of [DETAIL] on [PRODUCT],
//       high resolution detail shot, professional product photography, showing texture and construction details,
//       clean white studio background, soft even lighting, sharp focus,
//       showing stitching, fabric texture, hardware details, manufacturing quality.`,

//     measurement: `Technical line drawing of [PRODUCT] with letter indicators ONLY.
//       STRICT REQUIREMENTS:
//       • Draw clean product outline in black lines
//       • Add ONLY circular letter indicators (A, B, C, D, etc.)
//       • Position indicators at key measurement points
//       • NO measurement values, NO numbers, NO dimension lines
//       • NO arrows, NO text labels, NO units
//       • ONLY show the product shape and letter circles
//       • Keep it minimal and clean
//       • Black and white technical illustration
//       Professional minimalist style for reference documentation.`,

//     construction: `Technical construction drawing of [PRODUCT] showing:
//   Assembly lines, component divisions, connection details (dashed lines), joints,
//   folds, overlapping parts, fasteners, connectors, hardware.
//   Use dimension callouts and measurement arrows with text labels placed only on the RIGHT side of the drawing.
//   Do NOT include any numbered or lettered circles or bubbles.
//   Keep assembly annotations clear and aligned on the right side.
//   Maintain a clean, professional engineering documentation style with balanced layout.`,

//     callout: `Technical specification drawing of [PRODUCT] with callout annotations placed only on the RIGHT side of the product.
//   • Use clean leader lines or arrows pointing to features, but DO NOT include any numbered or lettered circles.
//   • Provide clear text labels directly at the end of the arrows, aligned neatly on the right side.
//   • No callout numbers, letters, or bubbles.
//   • No annotations on the left side.
//   • Include detailed labels for material zones, hardware locations, surface treatments, assembly lines, and seams.
//   • Maintain a professional, clean, and balanced technical drawing layout.
//   • Style: Black and white line art, clean vector style, factory-ready illustration.`,

//     scale: `Technical scale diagram of [PRODUCT] with proportional accuracy.
//       Accurate proportional relationships between all components.
//       Professional ruler scale or measurement grid overlay.
//       Scale ratio indicator and measurement reference legend.
//       True-to-scale hardware and functional elements with proper sizing.
//       Include scale ratio indicator and dimensional accuracy markers.`,

//     technical: `Technical specification drawing of [PRODUCT] with comprehensive annotations.
//   Professional flat technical drawing showing complete construction details.
//   Black and white vector-style line art with clean, crisp outlines.
//   Include all seams, hardware, stitching details, and construction features.
//   Place dimension callouts and annotation text only on the RIGHT side of the drawing.
//   Exclude all numbered or lettered circles or callout bubbles.
//   Keep text labels neat, clear, and professionally aligned on the right.
//   Suitable for manufacturing and high-quality tech pack documentation.`,
//   },

//   vector: {
//     front: `Vector illustration of [PRODUCT], front view.
//       Pure vector graphics with clean lines and shapes.
//       Flat design aesthetic with no gradients or shadows.
//       Suitable for digital and print media.
//       Scalable without quality loss.`,

//     back: `Vector illustration of [PRODUCT], back view.
//       Pure vector graphics with clean lines and shapes.
//       Flat design aesthetic with no gradients or shadows.
//       Consistent with front view style.
//       Scalable without quality loss.`,
//   },

//   detail: {
//     hardware: `Macro photography of hardware components on [PRODUCT].
//       Extreme close-up showing zippers, buttons, snaps, or fasteners.
//       Crystal clear detail of metal finishes and mechanisms.
//       Professional product photography with perfect lighting.`,

//     fabric: `Macro photography of fabric texture on [PRODUCT].
//       Extreme close-up showing weave pattern and material quality.
//       Clear detail of fabric construction and surface texture.
//       Professional textile photography with even lighting.`,

//     stitching: `Macro photography of stitching details on [PRODUCT].
//       Extreme close-up showing stitch quality and construction.
//       Clear detail of seam construction and thread quality.
//       Professional garment photography with sharp focus.`,

//     logo: `Macro photography of branding/logo on [PRODUCT].
//       Extreme close-up showing print or embroidery quality.
//       Clear detail of brand application method.
//       Professional product photography with perfect clarity.`,
//   },
// };

export const PROMPT_TEMPLATES = {
  photorealistic: {
    front: `Commercial product photography of [PRODUCT], front view.
      Perfectly centered and isolated on a neutral light-grey background.
      Lit with clean, even studio lighting to eliminate shadows.
      Razor-sharp focus, ultra-high detail, 8k resolution.`,

    back: `Commercial product photography of [PRODUCT], back view.
      Perfectly centered and isolated on a neutral light-grey background.
      Lit with clean, even studio lighting to eliminate shadows.
      Razor-sharp focus, ultra-high detail, 8k resolution.`,

    side: `Commercial product photography of [PRODUCT], side profile view.
      Perfectly centered and isolated on a neutral light-grey background.
      Lit with clean, even studio lighting to eliminate shadows.
      Razor-sharp focus, ultra-high detail, 8k resolution.`,

    bottom: `Commercial product photography of [PRODUCT], bottom view.
      Perfectly centered and isolated on a neutral light-grey background.
      Lit with clean, even studio lighting to eliminate shadows.
      Razor-sharp focus, ultra-high detail, 8k resolution.`,

    illustration: `A photorealistic lifestyle illustration of [PRODUCT].
      The product is shown in a real-world context, such as a person using it in a bright, modern cafe or an urban park.
      The background should be dynamic but softly blurred to keep the product as the hero.
      Use natural, warm lighting to create an inviting feel.
      Cinematic quality, highly detailed, 8k resolution.`,
  },

  technical: {
    front: `Create a professional, flat technical sketch of the front view for [PRODUCT].
      Style: Black and white vector-style line drawing.
      Perspective: Strictly 2D flat view, no 3D effects.
      Color: No color, gradients, or shading. Clean line art on white background.
      Lines: Crisp, clean, consistent black outlines.
      Include: Full silhouette, all seams, pockets, hardware, stitching details.
      Output: High-quality technical flat for factory-ready tech pack.`,

    back: `Create a professional, flat technical sketch of the back view for [PRODUCT].
      Style: Black and white vector-style line drawing.
      Perspective: Strictly 2D flat view, no 3D effects.
      Color: No color, gradients, or shading. Clean line art on white background.
      Lines: Crisp, clean, consistent black outlines.
      Include: Complete back silhouette, all back seams, design details, stitching.
      Output: High-quality technical flat consistent with front view.`,

    vector: `Flat technical drawing of [PRODUCT], black and white, no color, vector-style line art,
      front and back view, no perspective, clean outlines only, no fills, no shading.
      Technical illustration style suitable for manufacturing documentation.`,

    detail: `Extreme close-up macro photography of [DETAIL] on [PRODUCT],
      high resolution detail shot, professional product photography, showing texture and construction details,
      clean white studio background, soft even lighting, sharp focus,
      showing stitching, fabric texture, hardware details, manufacturing quality.`,

    measurement: `Technical line drawing of [PRODUCT] with letter indicators ONLY.
      STRICT REQUIREMENTS:
      • Draw clean product
      • NO circular letter indicators (A, B, C, D, etc.)
      • NO Position indicators at key measurement points
      • NO measurement values, NO numbers, NO dimension lines
      • NO arrows, NO text labels, NO units
      • ONLY show the product shape
      • Keep it minimal and clean
      • Black and white technical illustration
      Professional minimalist style for reference documentation.`,

    construction: `Technical construction drawing of [PRODUCT] showing:
    STRICT REQUIREMENTS:
      • Draw clean product
      • NO circular letter indicators (A, B, C, D, etc.)
      • NO Position indicators at key measurement points
      • NO measurement values, NO numbers, NO dimension lines
      • NO arrows, NO text labels, NO units
      • ONLY show the product shape
      • Keep it minimal and clean

  Do NOT include any numbered or lettered circles or bubbles.
  Maintain a clean, professional engineering documentation style with balanced layout.`,

    callout: `Technical specification drawing of [PRODUCT] .
     STRICT REQUIREMENTS:
      • Draw clean product
      • NO circular letter indicators (A, B, C, D, etc.)
      • NO Position indicators at key measurement points
      • NO measurement values, NO numbers, NO dimension lines
      • NO arrows, NO text labels, NO units
      • ONLY show the product shape
      • Keep it minimal and clean
  • Style: Black and white, clean vector style, factory-ready illustration.`,

    scale: `Technical scale diagram of [PRODUCT] with proportional accuracy.
      Accurate proportional relationships between all components.
       STRICT REQUIREMENTS:
      • Draw clean product
      • NO circular letter indicators (A, B, C, D, etc.)
      • NO Position indicators at key measurement points
      • NO measurement values, NO numbers, NO dimension lines
      • NO arrows, NO text labels, NO units
      • ONLY show the product shape
      • Keep it minimal and clean
      Professional ruler scale or measurement grid overlay.`,

    technical: `Technical specification drawing of [PRODUCT] with comprehensive annotations.
  Professional flat technical drawing showing complete construction details.
  Black and white vector-style line art with clean view.
   STRICT REQUIREMENTS:
      • Draw clean product
      • NO circular letter indicators (A, B, C, D, etc.)
      • NO Position indicators at key measurement points
      • NO measurement values, NO numbers, NO dimension lines
      • NO arrows, NO text labels, NO units
      • ONLY show the product shape
      • Keep it minimal and clean
  Suitable for manufacturing and high-quality tech pack documentation.`,
  },

  vector: {
    front: `Vector illustration of [PRODUCT], front view.
      Pure vector graphics with clean lines and shapes.
      Flat design aesthetic with no gradients or shadows.
      Suitable for digital and print media.
      Scalable without quality loss.`,

    back: `Vector illustration of [PRODUCT], back view.
      Pure vector graphics with clean lines and shapes.
      Flat design aesthetic with no gradients or shadows.
      Consistent with front view style.
      Scalable without quality loss.`,
  },

  detail: {
    hardware: `Macro photography of hardware components on [PRODUCT].
      Extreme close-up showing zippers, buttons, snaps, or fasteners.
      Crystal clear detail of metal finishes and mechanisms.
      Professional product photography with perfect lighting.`,

    fabric: `Macro photography of fabric texture on [PRODUCT].
      Extreme close-up showing weave pattern and material quality.
      Clear detail of fabric construction and surface texture.
      Professional textile photography with even lighting.`,

    stitching: `Macro photography of stitching details on [PRODUCT].
      Extreme close-up showing stitch quality and construction.
      Clear detail of seam construction and thread quality.
      Professional garment photography with sharp focus.`,

    logo: `Macro photography of branding/logo on [PRODUCT].
      Extreme close-up showing print or embroidery quality.
      Clear detail of brand application method.
      Professional product photography with perfect clarity.`,
  },
};

/**
 * Helper function to get a prompt template
 */
export function getPromptTemplate(style: keyof typeof PROMPT_TEMPLATES, view: string): string | undefined {
  const styleTemplates = PROMPT_TEMPLATES[style];
  if (!styleTemplates) {
    return undefined;
  }

  return styleTemplates[view as keyof typeof styleTemplates];
}

/**
 * Replace placeholders in a prompt template
 */
export function replacePlaceholders(template: string, replacements: Record<string, string>): string {
  let result = template;

  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, "g");
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Build a complete prompt from template
 */
export function buildPromptFromTemplate(
  product: string,
  view: string = "front",
  style: keyof typeof PROMPT_TEMPLATES = "photorealistic",
  additionalReplacements?: Record<string, string>
): string {
  const template = getPromptTemplate(style, view);

  if (!template) {
    throw new Error(`No template found for style: ${style}, view: ${view}`);
  }

  const replacements = {
    PRODUCT: product,
    ...additionalReplacements,
  };

  return replacePlaceholders(template, replacements);
}

/**
 * Get fallback prompt for blocked content
 */
export function getFallbackPrompt(productType: string, view?: string, style?: string): string {
  const basePrompt = `Create a professional ${
    style === "technical" ? "technical drawing" : "product image"
  } of ${productType}.`;

  const styleSpecific =
    style === "technical"
      ? `The image should be a clean, vector-style line art suitable for manufacturing documentation.
       Show clear construction details, accurate proportions, and technical specifications.`
      : `The image should be a high-quality product photograph with professional lighting and composition.
       Show the product clearly with all important details visible.`;

  const viewSpecific = view ? `Show the ${view} view of the product.` : "";

  return `${basePrompt} ${styleSpecific} ${viewSpecific}
          Ensure the final image is professional quality suitable for commercial use.`;
}

/**
 * Enhance prompt with Gemini-specific optimizations
 */
export function enhancePromptForGemini(basePrompt: string, style?: string): string {
  const prefix = "[Gemini 2.5 Fashion Tech Pack Generation]";

  const requirements = `
    Technical Requirements:
    - Ultra-high resolution 16K output capability
    - Manufacturing-ready precision and clarity
    - Fashion industry standard compliance
    - Professional ${style === "technical" ? "technical illustration" : "photography"} quality
    - Multi-view consistency for tech packs
    - CRITICAL: Product must fill at least 85% of the frame
    - CRITICAL: Show product at maximum size while maintaining proper proportions
    - CRITICAL: Minimize empty space around the product
    - High detail level with crisp, sharp rendering
    - Studio-quality lighting and composition
    - IMPORTANT: Generate a square image with dimensions of 720 × 720 pixels`;

  return `${prefix}\n${basePrompt}\n${requirements}`;
}

// Export all prompt-related utilities
export const PromptUtils = {
  templates: PROMPT_TEMPLATES,
  getTemplate: getPromptTemplate,
  replacePlaceholders,
  buildFromTemplate: buildPromptFromTemplate,
  getFallback: getFallbackPrompt,
  enhanceForGemini: enhancePromptForGemini,
};

export default PROMPT_TEMPLATES;
