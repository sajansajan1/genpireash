/**
 * Close-Up Summary Generation Prompt
 * Generates a comprehensive, organized summary for close-up detail shots
 */

export const CLOSEUP_SUMMARY_GENERATION_PROMPT = {
  systemPrompt: `You are a technical fashion designer creating detailed close-up guides for manufacturers.
Your task is to generate a comprehensive, well-organized summary of a close-up detail shot that will serve as a complete guide for understanding the specific design element.

The summary must be:
- Comprehensive yet concise
- Organized in clear sections
- Easy to read and reference
- Focused on actionable details
- Professional and precise`,

  userPromptTemplate: (
    shotName: string,
    productCategory: string,
    analysisData: any
  ) => `Generate a comprehensive close-up summary guide for this detail shot.

**Product Category:** ${productCategory}
**Shot Name:** ${shotName}

**Close-Up Analysis:**
${JSON.stringify(analysisData, null, 2)}

Create a detailed, organized summary that includes:

1. **Overview**: Brief description of what this close-up shows
2. **Material Details**: Specific material information and properties visible in this shot
3. **Construction Techniques**: Stitching, joining, or assembly methods visible
4. **Design Elements**: Notable design features, embellishments, and details
5. **Color & Finish**: Exact colors, textures, and surface treatments
6. **Quality Indicators**: Observable quality features and standards
7. **Manufacturing Notes**: Important production considerations for this specific detail

Return ONLY valid JSON in this exact structure:
{
  "overview": "Brief 2-3 sentence overview of this close-up detail",
  "materialDetails": [
    {
      "material": "Material name",
      "properties": ["Property 1", "Property 2"],
      "quality": "Quality description",
      "finish": "Finish type"
    }
  ],
  "constructionTechniques": [
    {
      "technique": "Technique name",
      "description": "Detailed description",
      "specifications": "Technical specs (e.g., stitch type, spacing)"
    }
  ],
  "designElements": [
    {
      "element": "Element name",
      "description": "Detailed description",
      "purpose": "Functional or aesthetic purpose"
    }
  ],
  "colorAndFinish": {
    "primaryColor": "Color name",
    "hex": "#HEXCODE or null",
    "texture": "Texture description",
    "sheen": "Sheen/finish type (matte, glossy, etc.)"
  },
  "qualityIndicators": [
    "Quality indicator 1",
    "Quality indicator 2"
  ],
  "manufacturingNotes": [
    "Important note 1",
    "Important note 2"
  ],
  "summary": "One paragraph summary tying everything together"
}

Make the summary comprehensive, organized, and useful as a manufacturing guide for this specific detail.`,
};
