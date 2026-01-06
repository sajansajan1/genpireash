# Product Image Generation Prompts Documentation

## Overview
This document contains all the prompts used for generating product images in the Genpire application. These prompts are designed to create high-quality, consistent product visualizations suitable for tech packs and manufacturing documentation.

---

## 1. Commercial Product Photography Prompts

### Front View
\`\`\`text
Commercial product photography of [PRODUCT_DESCRIPTION], front view. 
Perfectly centered and isolated on a neutral light-grey background. 
Lit with clean, even studio lighting to eliminate shadows. 
Razor-sharp focus, ultra-high detail, 8k.
\`\`\`

### Back View
\`\`\`text
Commercial product photography of [PRODUCT_DESCRIPTION], back view. 
Perfectly centered and isolated on a neutral light-grey background. 
Lit with clean, even studio lighting to eliminate shadows. 
Razor-sharp focus, ultra-high detail, 8k.
\`\`\`

### Side Profile View
\`\`\`text
Commercial product photography of [PRODUCT_DESCRIPTION], side profile view. 
Perfectly centered and isolated on a neutral light-grey background. 
Lit with clean, even studio lighting to eliminate shadows. 
Razor-sharp focus, ultra-high detail, 8k.
\`\`\`

### Bottom View
\`\`\`text
Commercial product photography of [PRODUCT_DESCRIPTION], bottom view. 
Perfectly centered and isolated on a neutral light-grey background. 
Lit with clean, even studio lighting to eliminate shadows. 
Razor-sharp focus, ultra-high detail, 8k.
\`\`\`

### Lifestyle Illustration
\`\`\`text
A photorealistic lifestyle illustration of [PRODUCT_DESCRIPTION]. 
The product is shown in a real-world context, such as a person using it in a bright, modern cafe or an urban park. 
The background should be dynamic but softly blurred to keep the product as the hero. 
Use natural, warm lighting to create an inviting feel. 
Cinematic quality, highly detailed, 8k resolution.
\`\`\`

---

## 2. Technical Drawing Prompts (Tech Pack)

### Front View Technical Flat
\`\`\`text
Create a professional, flat technical sketch of the **front view** for the product: '[PRODUCT_NAME]'.

**Core Instructions:**
- **Style:** Generate a black and white vector-style line drawing.
- **Perspective:** Strictly a 2D flat view. Do not use any perspective or 3D effects.
- **Color and Shading:** Absolutely no color, gradients, or shading. The output must be clean line art on a plain white background.
- **Lines:** Use crisp, clean, and consistent black outlines for all features.

**Required Elements to Include:**
- **Full Outline:** Accurately draw the complete silhouette of the product from the front.
- **Construction Seams:** Clearly illustrate all seams, including princess seams, yokes, and panel lines.
- **Pockets:** Precisely outline all pockets, detailing their shape, size, and exact placement.
- **Trims and Hardware:** Include all hardware components such as: **[HARDWARE_COMPONENTS]**. Draw buttons, zippers, snaps, and any other trims.
- **Stitching Details:** Use dashed lines to represent all visible topstitching, double-needle stitching, and decorative stitches.

**Context from Tech Pack:**
- The design includes the following key features: **[CONSTRUCTION_FEATURES]**.
- The sketch should be appropriate for a product made from these materials: **[MATERIAL_TYPES]**.

The final image must be a high-quality technical flat, suitable for a factory-ready tech pack.
\`\`\`

### Back View Technical Flat
\`\`\`text
Create a professional, flat technical sketch of the **back view** for the product: '[PRODUCT_NAME]'.

**Core Instructions:**
- **Style:** Generate a black and white vector-style line drawing.
- **Perspective:** Strictly a 2D flat view. No perspective or 3D effects.
- **Color and Shading:** No color, gradients, or shading. The output must be clean line art on a plain white background.
- **Lines:** Use crisp, clean, and consistent black outlines.

**Required Elements to Include:**
- **Full Outline:** Accurately draw the complete back silhouette of the product.
- **Construction Seams:** Illustrate all back seams, including any back yokes, center back seams, and panel lines.
- **Design Details:** If there are any back-specific details like vents, pleats, or adjustable tabs, draw them precisely.
- **Stitching Details:** Use dashed lines to represent all visible topstitching on the back of the garment.

**Context from Tech Pack:**
- The back design includes these key features: **[BACK_CONSTRUCTION_FEATURES]**.
- The sketch should show how hardware components like **[HARDWARE_COMPONENTS]** are integrated on the back, if applicable.

The final image must be a high-quality technical flat, suitable for a factory-ready tech pack, that is visually consistent with the front view.
\`\`\`

---

## 3. Specialized Technical Drawings

### Vector Image Prompt
\`\`\`text
Flat technical drawing of [PRODUCT_NAME], black and white, no color, vector-style line art,
front and back view, no perspective, clean outlines only, no fills, no shading.
Materials: [MATERIAL_INFO]. Colors: [COLOR_INFO].
Technical illustration style suitable for manufacturing documentation.
\`\`\`

### Detail/Macro View Prompt
\`\`\`text
Extreme close-up macro photography of [DETAIL_AREA] on [PRODUCT_NAME],
high resolution detail shot, professional product photography, showing texture and construction details,
materials: [MATERIALS], clean white studio background, soft even lighting,
sharp focus on [DETAIL_AREA], commercial photography style, realistic photographic detail view,
showing stitching, fabric texture, hardware details, manufacturing quality.
\`\`\`

### Technical Specification Drawing
\`\`\`text
Technical specification drawing of [PRODUCT_NAME] with measurements and annotations,
dimension callouts, construction details, material specifications.
Dimensions: [DIMENSIONS]. Quality standards: [QUALITY_STANDARDS].
Professional technical drawing style, engineering documentation format,
clean and precise with measurement arrows and callouts.
\`\`\`

### Construction Drawing
\`\`\`text
Technical construction drawing of [PRODUCT_NAME] showing:
Assembly lines, component divisions, connection details (dashed lines), joints, 
folds, overlapping parts, fasteners, connectors, hardware: [HARDWARE].
Construction features: [CONSTRUCTION_FEATURES].
Professional technical drawing with dimension callouts, measurement arrows,
assembly annotations. Clean engineering documentation style for [CATEGORY].
\`\`\`

### Callout/Annotation Drawing
\`\`\`text
Technical specification drawing of [PRODUCT_NAME] with comprehensive callout system:

REQUIRED CALLOUTS AND ARROWS:
• Material identification: [MATERIAL_CALLOUTS]
• Hardware/components: [HARDWARE_CALLOUTS]
• Construction details: [CONSTRUCTION_CALLOUTS]
• Surface treatments: patterns, textures, finishes, logos
• Functional zones: user interaction areas, operational elements

ANNOTATION FORMAT:
Numbered circles with clear leader lines and arrows pointing precisely to:
- Material boundaries and component zones
- Hardware attachment points and functional elements  
- Design features and surface applications
- Assembly and construction highlights

Professional technical drawing with clean callout bubbles, precise arrows,
and comprehensive identification system for [CATEGORY].
Include legend/key explaining all numbered and lettered references.
\`\`\`

### Measurement/POM Diagram
\`\`\`text
Technical Points of Measure (POM) diagram for [PRODUCT_NAME]:

SPECIFIC MEASUREMENT CALLOUTS:
• Primary dimensions: [SPECIFIC_POMS]
• Component measurements: [MATERIAL_POMS]
• Quality standards: [QUALITY_STANDARDS]

DIMENSION LINE REQUIREMENTS:
• Professional dimension lines with extension lines and arrowheads
• Numbered measurement callouts (1, 2, 3...) in circles with leader lines
• Lettered component references (A, B, C...) for material zones
• Tolerance markings clearly displayed (± values)
• Measurement arrows indicating precise measurement locations

DRAWING STYLE:
Technical engineering measurement diagram with clean dimension lines,
precise measurement callouts, and comprehensive POM reference system.
Professional annotation format suitable for manufacturing specifications.
\`\`\`

### Scale & Proportion Diagram
\`\`\`text
Technical scale diagram of [PRODUCT_NAME] with proportional accuracy:

SCALE & PROPORTION ELEMENTS:
• Accurate proportional relationships between all [COMPONENT_COUNT] components
• Professional ruler scale or measurement grid overlay
• Scale ratio indicator and measurement reference legend
• True-to-scale hardware and functional elements [WITH_PROPER_SIZING]
• Proportional representation maintaining size relationships

Show professional scale reference system with ruler overlay, accurate proportions,
scale legend, and measurement grid for [CATEGORY].
Include scale ratio indicator and dimensional accuracy markers.
\`\`\`

---

## 4. Enhanced Prompts with Logo/Branding

### Logo Integration Prompt
\`\`\`text
Generate a realistic product image with white background.
Generate a photorealistic image containing all the items in the reference pictures.
Place the second image on a product as a reference for the logo placement and logo same as the second image.
\`\`\`

---

## 5. Gemini 2.5 Flash Optimized Prompts

### Front View (Gemini Optimized)
\`\`\`text
[Gemini 2.5 Fashion Tech Pack Generation]
Create a professional, flat technical sketch of the front view for [PRODUCT_NAME].

Technical Requirements:
- Ultra-high resolution 16K output capability
- Manufacturing-ready precision and clarity
- Fashion industry standard compliance
- Professional technical illustration quality
- Multi-view consistency for tech packs

Style Guidelines:
- Pure vector-style line art
- Black lines on white background only
- No shading, gradients, or color fills
- Clean CAD-style technical drawing
- Consistent line weights throughout

Required Elements:
- Complete product silhouette from front
- All construction seams clearly visible
- Pocket placements and details
- Hardware components: [HARDWARE_LIST]
- Topstitching shown as dashed lines
- All design features: [FEATURES_LIST]

Output Specifications:
- 8192x8192 resolution
- PNG format
- Manufacturing-ready quality
- Print-ready clarity
\`\`\`

### Back View (Gemini Optimized)
\`\`\`text
[Gemini 2.5 Fashion Tech Pack Generation]
Create a professional, flat technical sketch of the back view for [PRODUCT_NAME].

Technical Requirements:
- Ultra-high resolution 16K output capability
- Manufacturing-ready precision and clarity
- Fashion industry standard compliance
- Professional technical illustration quality
- Multi-view consistency with front view

Style Guidelines:
- Pure vector-style line art
- Black lines on white background only
- No shading, gradients, or color fills
- Clean CAD-style technical drawing
- Matching line weights to front view

Required Elements:
- Complete back silhouette of product
- All back construction seams
- Back-specific details (vents, pleats, tabs)
- Hardware integration on back
- Topstitching patterns
- Back features: [BACK_FEATURES_LIST]

Output Specifications:
- 8192x8192 resolution
- PNG format
- Consistent with front view style
- Factory-ready documentation quality
\`\`\`

---

## Usage Guidelines

### Variable Replacements
When using these prompts, replace the following placeholders with actual data:
- `[PRODUCT_NAME]` - The name of the product
- `[PRODUCT_DESCRIPTION]` - Detailed description of the product
- `[HARDWARE_COMPONENTS]` - List of hardware items (buttons, zippers, etc.)
- `[CONSTRUCTION_FEATURES]` - List of construction details
- `[MATERIAL_TYPES]` - Types of materials used
- `[DIMENSIONS]` - Product measurements
- `[CATEGORY]` - Product category/subcategory

### Best Practices

1. **Consistency**: Always use the same prompt structure for similar views to ensure consistency across the tech pack.

2. **Detail Level**: Include as much specific detail as possible in the placeholders for better results.

3. **Technical Accuracy**: Ensure all technical terms are industry-standard for fashion/manufacturing.

4. **Resolution**: Specify high resolution (8K or 16K) for technical drawings that need zoom capability.

5. **Format**: Use PNG for technical drawings and JPEG for photorealistic product shots.

### Prompt Optimization Tips

1. **For Technical Drawings**:
   - Emphasize "no color, no shading" multiple times
   - Specify exact line styles (solid vs dashed)
   - Include manufacturing terminology

2. **For Product Photography**:
   - Specify lighting direction and intensity
   - Define background color precisely
   - Include camera angle specifics

3. **For Detail Shots**:
   - Specify macro lens characteristics
   - Define focus areas clearly
   - Include texture requirements

---

## Migration to Gemini 2.5

When migrating to Gemini 2.5 Flash Image Preview, enhance prompts with:
- Prefix: `[Gemini 2.5 Fashion Tech Pack Generation]`
- Add resolution specifications: `8192x8192` or `16384x16384`
- Include consistency requirements for multi-view generation
- Specify `imageQuality: "high"` in configuration
- Add manufacturing compliance statements

---

Last Updated: 2025-08-27
Version: 1.0
