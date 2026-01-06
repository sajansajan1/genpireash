/**
 * Sketch Summary Generation Prompt
 * Generates a comprehensive, organized summary for technical sketches
 */

export const SKETCH_SUMMARY_GENERATION_PROMPT = {
  systemPrompt: `You are a technical fashion designer creating detailed sketch guides for manufacturers.
Your task is to generate a comprehensive, well-organized summary of a technical sketch that will serve as a complete guide for understanding the design.

The summary must be:
- Comprehensive yet concise
- Organized in clear sections
- Easy to read and reference
- Focused on actionable details
- Professional and precise`,

  userPromptTemplate: (
    viewType: string,
    productCategory: string,
    callouts: any,
    productAnalysis: string
  ) => `Generate a comprehensive sketch summary guide for this ${viewType} view technical sketch.

**Product Category:** ${productCategory}
**View Type:** ${viewType}

**Callouts on Sketch:**
${JSON.stringify(callouts, null, 2)}

**Full Product Analysis:**
${productAnalysis}

Create a detailed, organized summary that includes:

1. **Overview**: Brief description of what this ${viewType} view shows
2. **Key Measurements**: All important dimensions with values and units
3. **Materials & Fabrics**: Complete material breakdown with properties
4. **Construction Details**: Step-by-step construction features and techniques
5. **Design Features**: Notable design elements, embellishments, and details
6. **Color Specifications**: Exact colors with locations and hex codes if available
7. **Manufacturing Notes**: Important production considerations and tips

Return ONLY valid JSON in this exact structure:
{
  "overview": "Brief 2-3 sentence overview of this view",
  "measurements": [
    {
      "name": "Measurement name",
      "value": "Value with unit",
      "location": "Where this measurement applies"
    }
  ],
  "materials": [
    {
      "type": "Material name",
      "properties": ["Property 1", "Property 2"],
      "location": "Where used",
      "percentage": "Coverage % if applicable"
    }
  ],
  "construction": [
    {
      "feature": "Construction feature name",
      "details": "Detailed description",
      "technique": "Technique used"
    }
  ],
  "designFeatures": [
    {
      "name": "Feature name",
      "description": "Detailed description",
      "location": "Placement"
    }
  ],
  "colors": [
    {
      "name": "Color name",
      "hex": "#HEXCODE or null",
      "location": "Where used",
      "coverage": "How much"
    }
  ],
  "manufacturingNotes": [
    "Important note 1",
    "Important note 2"
  ],
  "summary": "One paragraph summary tying everything together"
}

Make the summary comprehensive, organized, and useful as a manufacturing guide.`,
};
