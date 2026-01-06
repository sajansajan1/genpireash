/**
 * AI-Powered Measurement Analysis Service
 * Uses OpenAI GPT-4 Vision to analyze product images and generate accurate measurements
 */

import OpenAI from "openai";
import {
  ComponentMeasurementTable,
  ComponentPoint,
  ComponentMeasurement,
} from "@/lib/utils/component-measurement-table";

const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface AnalyzedComponent {
  name: string;
  measurements: {
    width?: { value: number; unit: string; tolerance?: number };
    height?: { value: number; unit: string; tolerance?: number };
    length?: { value: number; unit: string; tolerance?: number };
    depth?: { value: number; unit: string; tolerance?: number };
    weight?: { value: number; unit: string };
    diameter?: { value: number; unit: string; tolerance?: number };
    thickness?: { value: number; unit: string; tolerance?: number };
  };
  material?: string;
  description?: string;
}

/**
 * Analyze product image and generate accurate measurements using GPT-4 Vision
 */
export async function analyzeProductMeasurements(
  imageUrl: string,
  productName: string,
  techPackData: any
): Promise<ComponentMeasurementTable> {
  try {
    // Build context from tech pack
    const context = buildAnalysisContext(techPackData);

    // Use GPT-4 Vision to analyze the image and identify components
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional product engineer analyzing a ${productName} for manufacturing specifications. 
          Provide accurate, realistic measurements based on the product type and standard industry sizes.
          Be specific and use common measurement values for this product category.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${productName} and identify all major components that need measurement specifications.
              
              Context from tech pack:
              ${context}
              
              For each component, provide:
              1. Component name (be specific, e.g., "Left Temple Arm", "Frame Front", "Bridge")
              2. Realistic measurements based on standard ${productName} dimensions:
                 - Width (if applicable)
                 - Height (if applicable)
                 - Length (if applicable)
                 - Depth/Thickness (if applicable)
                 - Weight estimate in grams
              3. Material (if identifiable)
              
              IMPORTANT:
              - Provide actual numeric values, not "TBD" or placeholders
              - Use standard industry measurements for this product type
              - For sunglasses: typical frame width 130-150mm, temple length 135-150mm, lens width 50-60mm, etc.
              - For clothing: use standard sizes (S/M/L converted to cm)
              - For bags: typical dimensions based on bag type
              - Include tolerances where appropriate (±0.5mm for precision parts, ±2mm for fabric)
              
              Return as JSON array with this structure:
              [{
                "name": "Component Name",
                "measurements": {
                  "width": { "value": 145, "unit": "mm", "tolerance": 2 },
                  "height": { "value": 50, "unit": "mm", "tolerance": 1 },
                  "weight": { "value": 25, "unit": "g" }
                },
                "material": "Acetate",
                "description": "Main frame front piece"
              }]
              
              REQUIREMENTS:
              - Identify ALL major visible components (up to 12 maximum)
              - Be specific with component names
              - Include position context (e.g., "Left Temple Arm", "Right Temple Arm")
              - For each component, provide realistic measurements
              - Focus on manufacturable components, not decorative details
              - Group similar small parts (e.g., "Screws (4x)" instead of listing each)`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for more consistent measurements
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from GPT-4 Vision");
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not parse component data from response");
    }

    const analyzedComponents: AnalyzedComponent[] = JSON.parse(jsonMatch[0]);

    // Convert to our component measurement format
    return convertToComponentTable(analyzedComponents, productName);
  } catch (error) {
    console.error("Error analyzing product measurements:", error);
    // Return fallback measurements if analysis fails
    return generateFallbackMeasurements(productName, techPackData);
  }
}

/**
 * Build context string from tech pack data
 */
function buildAnalysisContext(techPackData: any): string {
  const parts = [];

  if (techPackData?.category_Subcategory) {
    parts.push(`Category: ${techPackData.category_Subcategory}`);
  }

  if (techPackData?.materials?.length > 0) {
    const materials = techPackData.materials
      .map((m: any) => m.material)
      .filter(Boolean)
      .join(", ");
    if (materials) parts.push(`Materials: ${materials}`);
  }

  if (techPackData?.constructionDetails?.constructionFeatures?.length > 0) {
    const features = techPackData.constructionDetails.constructionFeatures
      .map((f: any) => f.featureName)
      .filter(Boolean)
      .join(", ");
    if (features) parts.push(`Features: ${features}`);
  }

  if (techPackData?.targetMarket) {
    parts.push(`Target Market: ${techPackData.targetMarket}`);
  }

  return parts.join("\n");
}

/**
 * Convert analyzed components to our table format
 */
function convertToComponentTable(
  components: AnalyzedComponent[],
  productName: string
): ComponentMeasurementTable {
  const componentPoints: ComponentPoint[] = [];

  // Allow up to 12 components for comprehensive analysis
  const uniqueComponents = components.slice(0, 12);

  // Create a set to track used indicators
  const usedIndicators = new Set<string>();

  uniqueComponents.forEach((comp, index) => {
    const measurements: ComponentMeasurement = {};

    // Convert measurements to our format
    if (comp.measurements.width) {
      measurements.width = {
        value: `${comp.measurements.width.value}`,
        tolerance: comp.measurements.width.tolerance
          ? `±${comp.measurements.width.tolerance}`
          : undefined,
      };
    }

    if (comp.measurements.height) {
      measurements.height = {
        value: `${comp.measurements.height.value}`,
        tolerance: comp.measurements.height.tolerance
          ? `±${comp.measurements.height.tolerance}`
          : undefined,
      };
    }

    if (comp.measurements.length) {
      measurements.length = {
        value: `${comp.measurements.length.value}`,
        tolerance: comp.measurements.length.tolerance
          ? `±${comp.measurements.length.tolerance}`
          : undefined,
      };
    }

    if (comp.measurements.depth) {
      measurements.depth = {
        value: `${comp.measurements.depth.value}`,
        tolerance: comp.measurements.depth.tolerance
          ? `±${comp.measurements.depth.tolerance}`
          : undefined,
      };
    }

    if (comp.measurements.thickness) {
      measurements.thickness = {
        value: `${comp.measurements.thickness.value}`,
        tolerance: comp.measurements.thickness.tolerance
          ? `±${comp.measurements.thickness.tolerance}`
          : undefined,
      };
    }

    if (comp.measurements.diameter) {
      measurements.diameter = {
        value: `${comp.measurements.diameter.value}`,
        tolerance: comp.measurements.diameter.tolerance
          ? `±${comp.measurements.diameter.tolerance}`
          : undefined,
      };
    }

    if (comp.measurements.weight) {
      measurements.weight = {
        value: `${comp.measurements.weight.value}`,
        tolerance: undefined,
      };
    }

    const indicator = String.fromCharCode(65 + index); // A, B, C, etc.

    // Ensure unique indicator (should not happen but safety check)
    if (usedIndicators.has(indicator)) {
      console.warn(
        `Duplicate indicator ${indicator} detected, skipping component`
      );
      return;
    }

    usedIndicators.add(indicator);

    componentPoints.push({
      indicator: indicator,
      componentName: comp.name,
      measurements: measurements,
      material: comp.material,
      notes: comp.description,
    });
  });

  // Determine units based on product type
  const unit = determineUnit(productName, components);
  const weightUnit = "g"; // Default to grams

  return {
    title: `${productName} - Component Specifications`,
    components: componentPoints,
    unit: unit,
    weightUnit: weightUnit,
  };
}

/**
 * Determine appropriate unit based on product and measurements
 */
function determineUnit(
  productName: string,
  components: AnalyzedComponent[]
): "mm" | "cm" | "inches" {
  // Check what units are being used in the measurements
  const firstMeasurement = components[0]?.measurements;
  if (firstMeasurement) {
    const unit =
      firstMeasurement.width?.unit ||
      firstMeasurement.height?.unit ||
      firstMeasurement.length?.unit;

    if (unit === "mm") return "mm";
    if (unit === "inches" || unit === "in") return "inches";
  }

  // Default based on product type
  const lowerName = productName.toLowerCase();
  if (
    lowerName.includes("glasses") ||
    lowerName.includes("watch") ||
    lowerName.includes("jewelry")
  ) {
    return "mm";
  }

  return "cm";
}

/**
 * Generate fallback measurements if AI analysis fails
 */
function generateFallbackMeasurements(
  productName: string,
  techPackData: any
): ComponentMeasurementTable {
  const lowerName = productName.toLowerCase();
  const components: ComponentPoint[] = [];

  // Generate realistic fallback based on product type
  if (lowerName.includes("glasses") || lowerName.includes("sunglasses")) {
    components.push(
      {
        indicator: "A",
        componentName: "Frame Front",
        measurements: {
          width: { value: "145", tolerance: "±2" },
          height: { value: "50", tolerance: "±1" },
          thickness: { value: "8", tolerance: "±0.5" },
          weight: { value: "15" },
        },
        material: "Acetate",
      },
      {
        indicator: "B",
        componentName: "Left Temple",
        measurements: {
          length: { value: "145", tolerance: "±2" },
          width: { value: "15", tolerance: "±1" },
          thickness: { value: "5", tolerance: "±0.5" },
          weight: { value: "8" },
        },
        material: "Acetate",
      },
      {
        indicator: "C",
        componentName: "Right Temple",
        measurements: {
          length: { value: "145", tolerance: "±2" },
          width: { value: "15", tolerance: "±1" },
          thickness: { value: "5", tolerance: "±0.5" },
          weight: { value: "8" },
        },
        material: "Acetate",
      },
      {
        indicator: "D",
        componentName: "Bridge",
        measurements: {
          width: { value: "18", tolerance: "±1" },
          height: { value: "4", tolerance: "±0.5" },
          depth: { value: "3", tolerance: "±0.5" },
        },
        material: "Acetate",
      },
      {
        indicator: "E",
        componentName: "Left Lens",
        measurements: {
          width: { value: "55", tolerance: "±1" },
          height: { value: "45", tolerance: "±1" },
          thickness: { value: "2", tolerance: "±0.2" },
          weight: { value: "10" },
        },
        material: "Polycarbonate",
      },
      {
        indicator: "F",
        componentName: "Right Lens",
        measurements: {
          width: { value: "55", tolerance: "±1" },
          height: { value: "45", tolerance: "±1" },
          thickness: { value: "2", tolerance: "±0.2" },
          weight: { value: "10" },
        },
        material: "Polycarbonate",
      }
    );

    return {
      title: `${productName} - Component Specifications`,
      components: components,
      unit: "mm",
      weightUnit: "g",
    };
  }

  // Generic fallback
  components.push(
    {
      indicator: "A",
      componentName: "Main Body",
      measurements: {
        width: { value: "30", tolerance: "±2" },
        height: { value: "40", tolerance: "±2" },
        depth: { value: "15", tolerance: "±1" },
        weight: { value: "250" },
      },
    },
    {
      indicator: "B",
      componentName: "Secondary Component",
      measurements: {
        width: { value: "20", tolerance: "±1" },
        height: { value: "25", tolerance: "±1" },
        weight: { value: "100" },
      },
    }
  );

  return {
    title: `${productName} - Component Specifications`,
    components: components,
    unit: "cm",
    weightUnit: "g",
  };
}
