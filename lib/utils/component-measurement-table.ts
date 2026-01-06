/**
 * Component-Based Measurement Table System
 * Each indicator points to a specific component with multiple measurements
 */

export interface ComponentMeasurement {
  width?: { value: string | number; tolerance?: string };
  height?: { value: string | number; tolerance?: string };
  length?: { value: string | number; tolerance?: string };
  depth?: { value: string | number; tolerance?: string };
  weight?: { value: string | number; tolerance?: string };
  thickness?: { value: string | number; tolerance?: string };
  diameter?: { value: string | number; tolerance?: string };
  circumference?: { value: string | number; tolerance?: string };
  angle?: { value: string | number; tolerance?: string };
  // Add any other measurements as needed
  [key: string]: { value: string | number; tolerance?: string } | undefined;
}

export interface ComponentPoint {
  indicator: string; // A, B, C, etc.
  componentName: string; // "Left Temple", "Bridge", "Frame Front", etc.
  measurements: ComponentMeasurement;
  material?: string;
  notes?: string;
}

export interface ComponentMeasurementTable {
  title: string;
  components: ComponentPoint[];
  unit: "cm" | "inches" | "mm";
  weightUnit: "g" | "kg" | "oz" | "lbs";
}

/**
 * Extract components from tech pack and generate comprehensive measurement table
 */
export function generateComponentMeasurementTable(techPack: any): ComponentMeasurementTable {
  const components: ComponentPoint[] = [];
  const unit = techPack?.dimensions?.unit || "cm";
  const weightUnit = techPack?.dimensions?.weightUnit || "g";

  // Extract components from construction details
  const constructionFeatures = techPack?.constructionDetails?.constructionFeatures || [];
  const materials = techPack?.materials || [];
  const hardwareComponents = techPack?.hardwareComponents?.hardware || [];

  // Create a map of components with their properties
  const componentMap = new Map<string, any>();

  // 1. Extract from construction features
  constructionFeatures.forEach((feature: any) => {
    const name = feature.featureName || feature.name;
    if (name && !componentMap.has(name)) {
      componentMap.set(name, {
        source: "construction",
        description: feature.description,
        specifications: feature.specifications,
      });
    }
  });

  // 2. Extract from materials (each material application is a component)
  materials.forEach((material: any) => {
    if (material.component && !componentMap.has(material.component)) {
      componentMap.set(material.component, {
        source: "material",
        material: material.material,
        specification: material.specification,
        weight: material.weight,
      });
    }
  });

  // 3. Extract from hardware components
  hardwareComponents.forEach((hardware: string) => {
    if (!componentMap.has(hardware)) {
      componentMap.set(hardware, {
        source: "hardware",
        type: "hardware",
      });
    }
  });

  // 4. If no components found, extract from product analysis
  if (componentMap.size === 0) {
    const productName = techPack?.productName || "";
    const category = techPack?.category_Subcategory || "";

    // Analyze product name and category to determine components
    const analysisResult = analyzeProductForComponents(productName, category, techPack);
    analysisResult.forEach((comp) => componentMap.set(comp.name, comp));
  }

  // Convert component map to measurement points
  let indicatorIndex = 0;
  componentMap.forEach((componentData, componentName) => {
    const measurements: ComponentMeasurement = {};

    // Extract measurements from tech pack dimensions if available
    const dimensionData = extractDimensionsForComponent(
      componentName,
      techPack?.dimensions?.details || [],
      componentData
    );

    // Populate measurements based on component type and available data
    measurements.width = dimensionData.width || { value: "TBD" };
    measurements.height = dimensionData.height || { value: "TBD" };
    measurements.length = dimensionData.length || { value: "TBD" };
    measurements.depth = dimensionData.depth || { value: "TBD" };
    measurements.weight = dimensionData.weight || componentData.weight || { value: "TBD" };

    // Add specialized measurements based on component type
    if (componentData.source === "hardware") {
      measurements.diameter = dimensionData.diameter || { value: "TBD" };
      measurements.thickness = dimensionData.thickness || { value: "TBD" };
    }

    // Clean up undefined measurements
    Object.keys(measurements).forEach((key) => {
      if (!measurements[key] || (measurements[key] as any).value === undefined) {
        delete measurements[key];
      }
    });

    // Only add if there are measurements to show
    if (Object.keys(measurements).length > 0) {
      components.push({
        indicator: String.fromCharCode(65 + indicatorIndex),
        componentName: componentName,
        measurements: measurements,
        material: componentData.material,
        notes: componentData.description || componentData.specification,
      });
      indicatorIndex++;
    }
  });

  // If still no components, create basic structure
  if (components.length === 0) {
    components.push(
      {
        indicator: "A",
        componentName: "Main Body",
        measurements: {
          width: { value: "TBD" },
          height: { value: "TBD" },
          depth: { value: "TBD" },
          weight: { value: "TBD" },
        },
        notes: "Primary product component",
      },
      {
        indicator: "B",
        componentName: "Secondary Component",
        measurements: {
          width: { value: "TBD" },
          height: { value: "TBD" },
          weight: { value: "TBD" },
        },
        notes: "Additional component",
      }
    );
  }

  return {
    title: `${techPack?.productName || "Product"} Component Measurements`,
    components: components,
    unit: unit,
    weightUnit: weightUnit,
  };
}

/**
 * Analyze product to determine likely components
 */
function analyzeProductForComponents(productName: string, category: string, techPack: any): any[] {
  const components: any[] = [];
  const lowerName = productName.toLowerCase();
  const lowerCategory = category.toLowerCase();

  // Dynamic component detection based on product analysis
  // This uses the actual product data rather than static categories

  // Look for component keywords in product name and description
  const description = (techPack?.description || "").toLowerCase();
  const allText = `${lowerName} ${lowerCategory} ${description}`;

  // Component detection patterns
  const componentPatterns = [
    { pattern: /frame|body|main/i, name: "Frame/Body", type: "main" },
    { pattern: /lens|glass|screen/i, name: "Lens/Glass", type: "transparent" },
    { pattern: /temple|arm|side/i, name: "Temple/Arm", type: "support" },
    { pattern: /bridge|nose/i, name: "Bridge", type: "connector" },
    { pattern: /strap|band|belt/i, name: "Strap/Band", type: "attachment" },
    { pattern: /buckle|clasp|fastener/i, name: "Buckle/Clasp", type: "hardware" },
    { pattern: /handle|grip/i, name: "Handle", type: "grip" },
    { pattern: /pocket|compartment/i, name: "Pocket", type: "storage" },
    { pattern: /zipper|zip/i, name: "Zipper", type: "closure" },
    { pattern: /button|snap/i, name: "Button", type: "closure" },
    { pattern: /collar|neck/i, name: "Collar", type: "opening" },
    { pattern: /sleeve/i, name: "Sleeve", type: "extension" },
    { pattern: /cuff/i, name: "Cuff", type: "termination" },
    { pattern: /hem|bottom/i, name: "Hem", type: "edge" },
    { pattern: /waist|waistband/i, name: "Waistband", type: "band" },
    { pattern: /sole|outsole/i, name: "Sole", type: "base" },
    { pattern: /upper/i, name: "Upper", type: "cover" },
    { pattern: /heel/i, name: "Heel", type: "elevation" },
    { pattern: /toe|toebox/i, name: "Toe Box", type: "front" },
    { pattern: /lace|lacing/i, name: "Laces", type: "closure" },
  ];

  // Find matching components
  componentPatterns.forEach(({ pattern, name, type }) => {
    if (pattern.test(allText)) {
      components.push({ name, type, source: "analysis" });
    }
  });

  // If no specific components found, add generic based on product structure
  if (components.length === 0) {
    components.push(
      { name: "Primary Component", type: "main", source: "default" },
      { name: "Secondary Component", type: "support", source: "default" }
    );
  }

  return components;
}

/**
 * Extract dimensions for a specific component
 */
function extractDimensionsForComponent(
  componentName: string,
  dimensionDetails: any[],
  componentData: any
): ComponentMeasurement {
  const measurements: ComponentMeasurement = {};
  const lowerComponentName = componentName.toLowerCase();

  // Try to find dimensions that match this component
  dimensionDetails.forEach((detail: any) => {
    // Check if this dimension relates to our component
    Object.entries(detail).forEach(([key, value]: [string, any]) => {
      if (value && typeof value === "object") {
        const label = (value.label || "").toLowerCase();
        const description = (value.description || "").toLowerCase();

        // Check if this measurement belongs to this component
        if (
          label.includes(lowerComponentName) ||
          description.includes(lowerComponentName) ||
          (componentData.source === "main" && !label.includes("secondary"))
        ) {
          // Determine measurement type
          if (key === "width" || label.includes("width")) {
            measurements.width = {
              value: value.value || "TBD",
              tolerance: value.tolerance,
            };
          } else if (key === "height" || label.includes("height")) {
            measurements.height = {
              value: value.value || "TBD",
              tolerance: value.tolerance,
            };
          } else if (key === "length" || label.includes("length")) {
            measurements.length = {
              value: value.value || "TBD",
              tolerance: value.tolerance,
            };
          } else if (key === "depth" || label.includes("depth")) {
            measurements.depth = {
              value: value.value || "TBD",
              tolerance: value.tolerance,
            };
          } else if (key === "weight" || label.includes("weight")) {
            measurements.weight = {
              value: value.value || "TBD",
              tolerance: value.tolerance,
            };
          } else if (key === "diameter" || label.includes("diameter")) {
            measurements.diameter = {
              value: value.value || "TBD",
              tolerance: value.tolerance,
            };
          } else if (key === "thickness" || label.includes("thickness")) {
            measurements.thickness = {
              value: value.value || "TBD",
              tolerance: value.tolerance,
            };
          } else {
            // Custom measurement
            measurements[key] = {
              value: value.value || "TBD",
              tolerance: value.tolerance,
            };
          }
        }
      }
    });
  });

  return measurements;
}

/**
 * Format component measurements for prompt
 */
export function formatComponentPrompt(table: ComponentMeasurementTable): string {
  const indicators = table.components.map((c) => `${c.indicator}: ${c.componentName}`).join(", ");

  return `
    COMPONENT INDICATORS:
    Place letter indicators at these specific components:
    ${indicators}
    
    IMPORTANT:
    - Each letter marks a distinct component/part
    - Use clear, bold letter indicators in circles
    - Position at the right side of image
    - Ensure all ${table.components.length} indicators are visible
    - DO NOT include any measurements or numbers
  `;
}
