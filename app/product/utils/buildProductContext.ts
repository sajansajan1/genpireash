/**
 * Builds comprehensive product context for the AI system prompt
 * This context makes the chat "agentic" by giving it full knowledge of the product
 */

import type { TechFilesData, ProductImages } from "../components/agentic-chat/types";

interface BuildProductContextParams {
  productName: string;
  techPackData: any | null;
  techFilesData: TechFilesData | null;
  productImages: ProductImages;
  activeSection: string;
}

/**
 * Extract tech pack specifications into a readable format
 */
function extractTechPackSpecs(techPackData: any): string {
  if (!techPackData?.tech_pack_data) return "No tech pack data available.";

  const data = techPackData.tech_pack_data;
  const sections: string[] = [];

  // Product Overview
  if (data.productName || data.productOverview) {
    sections.push("### Product Overview");
    if (data.productName) sections.push(`- **Name**: ${data.productName}`);
    if (data.productOverview) sections.push(`- **Overview**: ${data.productOverview}`);
    if (data.category_Subcategory) sections.push(`- **Category**: ${data.category_Subcategory}`);
    if (data.intendedMarket_AgeRange) sections.push(`- **Target Market**: ${data.intendedMarket_AgeRange}`);
  }

  // Colors
  if (data.colors) {
    sections.push("\n### Colors");
    const colors = data.colors;
    if (colors.primaryColor) {
      sections.push(`- **Primary**: ${colors.primaryColor.name} (${colors.primaryColor.hex})`);
    }
    if (colors.secondaryColors?.length > 0) {
      const secondaryList = colors.secondaryColors
        .map((c: any) => `${c.name} (${c.hex})`)
        .join(", ");
      sections.push(`- **Secondary**: ${secondaryList}`);
    }
    if (colors.accentColors?.length > 0) {
      const accentList = colors.accentColors
        .map((c: any) => `${c.name} (${c.hex})`)
        .join(", ");
      sections.push(`- **Accents**: ${accentList}`);
    }
  }

  // Materials
  if (data.materials?.length > 0) {
    sections.push("\n### Materials");
    data.materials.forEach((material: any, index: number) => {
      sections.push(`\n**Material ${index + 1}: ${material.name || "Unnamed"}**`);
      if (material.type) sections.push(`- Type: ${material.type}`);
      if (material.composition) sections.push(`- Composition: ${material.composition}`);
      if (material.weight) sections.push(`- Weight: ${material.weight}`);
      if (material.color) sections.push(`- Color: ${material.color}`);
      if (material.finish) sections.push(`- Finish: ${material.finish}`);
      if (material.supplier) sections.push(`- Supplier: ${material.supplier}`);
      if (material.certifications?.length > 0) {
        sections.push(`- Certifications: ${material.certifications.join(", ")}`);
      }
    });
  }

  // Dimensions
  if (data.dimensions && Object.keys(data.dimensions).length > 0) {
    sections.push("\n### Dimensions");
    Object.entries(data.dimensions).forEach(([key, value]: [string, any]) => {
      if (typeof value === "object" && value.value) {
        sections.push(`- **${key}**: ${value.value} ${value.unit || ""}`);
      } else if (typeof value === "string" || typeof value === "number") {
        sections.push(`- **${key}**: ${value}`);
      }
    });
  }

  // Construction Details
  if (data.constructionDetails) {
    sections.push("\n### Construction Details");
    const construction = data.constructionDetails;
    if (construction.seamTypes?.length > 0) {
      sections.push(`- **Seam Types**: ${construction.seamTypes.join(", ")}`);
    }
    if (construction.stitchTypes?.length > 0) {
      sections.push(`- **Stitch Types**: ${construction.stitchTypes.join(", ")}`);
    }
    if (construction.assemblyOrder?.length > 0) {
      sections.push("- **Assembly Order**:");
      construction.assemblyOrder.forEach((step: string, i: number) => {
        sections.push(`  ${i + 1}. ${step}`);
      });
    }
    if (construction.specialTechniques?.length > 0) {
      sections.push(`- **Special Techniques**: ${construction.specialTechniques.join(", ")}`);
    }
  }

  // Hardware Components
  if (data.hardwareComponents) {
    sections.push("\n### Hardware & Trims");
    const hardware = data.hardwareComponents;
    if (hardware.zippers?.length > 0) {
      hardware.zippers.forEach((z: any) => {
        sections.push(`- **Zipper**: ${z.type || "Standard"} - ${z.size || ""} ${z.color || ""}`);
      });
    }
    if (hardware.buttons?.length > 0) {
      hardware.buttons.forEach((b: any) => {
        sections.push(`- **Button**: ${b.type || "Standard"} - ${b.size || ""} ${b.material || ""}`);
      });
    }
    if (hardware.other?.length > 0) {
      hardware.other.forEach((item: any) => {
        sections.push(`- **${item.name || "Hardware"}**: ${item.description || ""}`);
      });
    }
  }

  // Size Range
  if (data.sizeRange) {
    sections.push("\n### Size Range");
    if (data.sizeRange.sizes?.length > 0) {
      sections.push(`- **Sizes**: ${data.sizeRange.sizes.join(", ")}`);
    }
    if (data.sizeRange.gradingRules) {
      sections.push(`- **Grading**: ${data.sizeRange.gradingRules}`);
    }
  }

  // Care Instructions
  if (data.careInstructions) {
    sections.push("\n### Care Instructions");
    sections.push(data.careInstructions);
  }

  // Packaging
  if (data.packaging) {
    sections.push("\n### Packaging");
    const pkg = data.packaging;
    if (pkg.type) sections.push(`- Type: ${pkg.type}`);
    if (pkg.materials) sections.push(`- Materials: ${pkg.materials}`);
    if (pkg.dimensions) sections.push(`- Dimensions: ${pkg.dimensions}`);
    if (pkg.labeling) sections.push(`- Labeling: ${pkg.labeling}`);
  }

  // Production Notes
  if (data.productionNotes) {
    sections.push("\n### Production Notes");
    sections.push(data.productionNotes);
  }

  return sections.join("\n");
}

/**
 * Helper to safely parse analysis_data if it's a string
 */
function parseAnalysisData(data: any): any {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

/**
 * Extract tech files analysis data into a readable format
 */
function extractTechFilesAnalysis(techFilesData: TechFilesData | null): string {
  if (!techFilesData) return "No tech files have been generated yet.";

  const sections: string[] = [];
  let hasData = false;

  // Base Views - Extract comprehensive product analysis
  if (techFilesData.baseViews?.length > 0) {
    hasData = true;
    sections.push("### Base View Analysis (Factory Specs)");
    techFilesData.baseViews.forEach((view) => {
      sections.push(`\n**${(view.view_type || "View").toUpperCase()} VIEW**`);
      const analysis = parseAnalysisData(view.analysis_data);
      if (analysis) {
        // Check for base_view_guide structure
        const guide = analysis.base_view_guide || analysis;

        if (analysis.product_category || guide.product_category) {
          sections.push(`- Category: ${analysis.product_category || guide.product_category}`);
        }

        // Extract dimensions from base view
        const dimensions = guide.dimensions || analysis.dimensions || guide.estimated_dimensions;
        if (dimensions && Object.keys(dimensions).length > 0) {
          sections.push("- **Estimated Dimensions:**");
          Object.entries(dimensions).forEach(([key, value]: [string, any]) => {
            if (typeof value === "object" && value !== null) {
              const val = value.value || value.estimate || "";
              const unit = value.unit || "cm";
              if (val) sections.push(`  - ${key}: ${val} ${unit}`.trim());
            } else if (value) {
              sections.push(`  - ${key}: ${value}`);
            }
          });
        }

        // Extract size/dimensions from product_specifications
        const specs = guide.product_specifications || analysis.product_specifications;
        if (specs) {
          if (specs.dimensions) {
            sections.push("- **Product Specifications - Dimensions:**");
            Object.entries(specs.dimensions).forEach(([key, value]: [string, any]) => {
              sections.push(`  - ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
            });
          }
          if (specs.size) sections.push(`  - Size: ${specs.size}`);
          if (specs.width) sections.push(`  - Width: ${specs.width}`);
          if (specs.height) sections.push(`  - Height: ${specs.height}`);
          if (specs.depth) sections.push(`  - Depth: ${specs.depth}`);
        }

        if (analysis.materials_detected?.length > 0) {
          const materials = analysis.materials_detected
            .map((m: any) => {
              if (typeof m === "string") return m;
              const name = m.material_type || m.name || m.component || "";
              const detail = m.location || m.area || "";
              return detail ? `${name} (${detail})` : name;
            })
            .filter(Boolean)
            .join(", ");
          if (materials) sections.push(`- Materials Detected: ${materials}`);
        }

        if (analysis.construction_details?.length > 0) {
          sections.push("- Construction Features:");
          analysis.construction_details.slice(0, 8).forEach((d: any) => {
            const feature = d.feature || d.description || (typeof d === "string" ? d : "");
            if (feature) sections.push(`  - ${feature}`);
          });
        }

        if (analysis.colors?.length > 0) {
          const colors = analysis.colors.slice(0, 5).join(", ");
          sections.push(`- Colors Detected: ${colors}`);
        }

        // Extract hardware/components
        const hardware = guide.hardware || analysis.hardware || guide.hardware_components;
        if (hardware?.length > 0) {
          sections.push("- Hardware/Components:");
          hardware.slice(0, 5).forEach((h: any) => {
            const name = h.name || h.type || (typeof h === "string" ? h : "");
            if (name) sections.push(`  - ${name}`);
          });
        }

        if (analysis.summary) {
          const summary = typeof analysis.summary === "string"
            ? analysis.summary
            : analysis.summary.overview || analysis.summary.description || "";
          if (summary) sections.push(`- Summary: ${summary.slice(0, 400)}`);
        }
      }
    });
  }

  // Components
  if (techFilesData.components?.length > 0) {
    hasData = true;
    sections.push("\n### Component Details");
    techFilesData.components.forEach((comp) => {
      const parsedData = parseAnalysisData(comp.analysis_data);
      const name = comp.file_category || parsedData?.component_name || "Component";
      sections.push(`\n**${name}**`);
      const analysis = parsedData;
      if (analysis) {
        // Check for nested component_guide structure
        const guide = analysis.component_guide || {};
        const identification = guide.component_identification || analysis.component_identification;
        const materials = guide.material_specifications || analysis.material_specifications;
        const sourcing = guide.sourcing_information || analysis.sourcing_information;

        if (identification?.component_type) {
          sections.push(`- Type: ${identification.component_type}`);
        }
        if (identification?.placement) {
          sections.push(`- Placement: ${identification.placement}`);
        }
        if (materials?.primary_material) {
          sections.push(`- Material: ${materials.primary_material}`);
        }
        if (materials?.color?.name) {
          sections.push(`- Color: ${materials.color.name}`);
        }
        if (sourcing?.sourcing_difficulty) {
          sections.push(`- Sourcing Difficulty: ${sourcing.sourcing_difficulty}`);
        }
        if (analysis.material) {
          sections.push(`- Material: ${analysis.material}`);
        }
        if (analysis.description) {
          sections.push(`- Description: ${analysis.description.slice(0, 200)}`);
        }
      }
    });
  }

  // Close-ups
  if (techFilesData.closeups?.length > 0) {
    hasData = true;
    sections.push("\n### Close-Up Details");
    techFilesData.closeups.forEach((closeup) => {
      const name = closeup.file_category || "Detail Shot";
      sections.push(`\n**${name}**`);
      const analysis = parseAnalysisData(closeup.analysis_data);
      if (analysis?.summary) {
        if (analysis.summary.overview) {
          sections.push(`- Overview: ${analysis.summary.overview.slice(0, 200)}`);
        }
        if (analysis.summary.materialDetails) {
          sections.push(`- Material Details: ${JSON.stringify(analysis.summary.materialDetails).slice(0, 200)}`);
        }
        if (analysis.summary.qualityIndicators?.length > 0) {
          sections.push(`- Quality Indicators: ${analysis.summary.qualityIndicators.join(", ")}`);
        }
      }
    });
  }

  // Sketches - Extract comprehensive measurements and dimensions
  if (techFilesData.sketches?.length > 0) {
    hasData = true;
    sections.push("\n### Technical Sketches & Measurements");
    techFilesData.sketches.forEach((sketch) => {
      sections.push(`\n**${(sketch.view_type || "View").toUpperCase()} Sketch**`);
      const analysis = parseAnalysisData(sketch.analysis_data);
      if (analysis) {
        // Check for sketch_guide structure (new format)
        const guide = analysis.sketch_guide || analysis;

        // Extract from annotations_included.dimensions (new callout format)
        const annotationsIncluded = analysis.annotations_included || guide.annotations_included;
        if (annotationsIncluded?.dimensions?.length > 0) {
          sections.push("- **Key Dimensions:**");
          annotationsIncluded.dimensions.forEach((dim: any) => {
            const measurement = dim.measurement || dim.value || "";
            const location = dim.location || dim.dimension_type || "";
            if (measurement) {
              sections.push(`  - ${location}: ${measurement}${dim.critical ? " (critical)" : ""}`);
            }
          });
        }

        // Extract from measurements_summary.primary_dimensions
        const measurementsSummary = analysis.measurements_summary || guide.measurements_summary;
        if (measurementsSummary?.primary_dimensions?.length > 0) {
          if (!annotationsIncluded?.dimensions?.length) {
            sections.push("- **Primary Dimensions:**");
          }
          measurementsSummary.primary_dimensions.forEach((dim: any) => {
            if (typeof dim === "string") {
              sections.push(`  - ${dim}`);
            } else if (dim.measurement || dim.value) {
              sections.push(`  - ${dim.name || dim.type || "Dimension"}: ${dim.measurement || dim.value}`);
            }
          });
        }

        // Extract measurements from various locations
        const measurements = guide.measurements || analysis.measurements || {};
        if (Object.keys(measurements).length > 0) {
          sections.push("- **Measurements/Dimensions:**");
          Object.entries(measurements).forEach(([key, value]: [string, any]) => {
            if (typeof value === "object" && value !== null) {
              const val = value.value || value.measurement || "";
              const unit = value.unit || "";
              if (val) sections.push(`  - ${key}: ${val} ${unit}`.trim());
            } else if (value) {
              sections.push(`  - ${key}: ${value}`);
            }
          });
        }

        // Extract dimensions specifically
        const dimensions = guide.dimensions || analysis.dimensions;
        if (dimensions && Object.keys(dimensions).length > 0) {
          sections.push("- **Product Dimensions:**");
          Object.entries(dimensions).forEach(([key, value]: [string, any]) => {
            if (typeof value === "object" && value !== null) {
              const val = value.value || value.measurement || "";
              const unit = value.unit || "cm";
              if (val) sections.push(`  - ${key}: ${val} ${unit}`.trim());
            } else if (value) {
              sections.push(`  - ${key}: ${value}`);
            }
          });
        }

        // Extract specifications
        const specs = guide.specifications || analysis.specifications;
        if (specs) {
          if (specs.overall_dimensions) {
            sections.push("- **Overall Dimensions:**");
            Object.entries(specs.overall_dimensions).forEach(([key, value]: [string, any]) => {
              sections.push(`  - ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
            });
          }
          if (specs.width) sections.push(`  - Width: ${typeof specs.width === 'object' ? `${specs.width.value} ${specs.width.unit || ''}` : specs.width}`);
          if (specs.height) sections.push(`  - Height: ${typeof specs.height === 'object' ? `${specs.height.value} ${specs.height.unit || ''}` : specs.height}`);
          if (specs.depth) sections.push(`  - Depth: ${typeof specs.depth === 'object' ? `${specs.depth.value} ${specs.depth.unit || ''}` : specs.depth}`);
          if (specs.length) sections.push(`  - Length: ${typeof specs.length === 'object' ? `${specs.length.value} ${specs.length.unit || ''}` : specs.length}`);
        }

        // Extract material callouts from annotations_included
        if (annotationsIncluded?.material_callouts?.length > 0) {
          sections.push("- **Material Specifications:**");
          annotationsIncluded.material_callouts.slice(0, 8).forEach((mat: any) => {
            const material = mat.material_name || mat.name || "";
            const location = mat.location || mat.component || "";
            const details = mat.specifications || mat.details || "";
            if (material) {
              sections.push(`  - ${location ? `${location}: ` : ""}${material}${details ? ` - ${details}` : ""}`);
            }
          });
        }

        // Extract construction notes from annotations_included
        if (annotationsIncluded?.construction_notes?.length > 0) {
          sections.push("- **Construction Notes:**");
          annotationsIncluded.construction_notes.slice(0, 6).forEach((note: any) => {
            const feature = note.feature || note.note_type || "";
            const detail = note.specification || note.detail || note.description || "";
            if (feature || detail) {
              sections.push(`  - ${feature}${detail ? `: ${detail}` : ""}`);
            }
          });
        }

        // Extract callouts
        if (analysis.callouts?.callouts?.length > 0) {
          sections.push("- **Technical Callouts:**");
          analysis.callouts.callouts.slice(0, 8).forEach((callout: any) => {
            const text = callout.feature_name || callout.specification || callout.label || callout.text || "";
            const value = callout.value || callout.measurement || "";
            if (text) sections.push(`  - ${text}${value ? `: ${value}` : ""}`);
          });
        }

        // Check for dimension_callouts
        const dimCallouts = guide.dimension_callouts || analysis.dimension_callouts;
        if (dimCallouts?.length > 0) {
          sections.push("- **Dimension Callouts:**");
          dimCallouts.slice(0, 10).forEach((callout: any) => {
            const label = callout.label || callout.dimension_name || "";
            const value = callout.value || callout.measurement || "";
            if (label && value) sections.push(`  - ${label}: ${value}`);
          });
        }

        // Extract from summary.measurements (from sketch summary generation)
        const summaryMeasurements = analysis.summary?.measurements;
        if (summaryMeasurements?.length > 0) {
          sections.push("- **Sketch Measurements:**");
          summaryMeasurements.forEach((meas: any) => {
            const name = meas.name || meas.type || "";
            const value = meas.value || meas.measurement || "";
            const location = meas.location || "";
            if (name && value) {
              sections.push(`  - ${name}: ${value}${location ? ` (${location})` : ""}`);
            }
          });
        }

        // Extract from summary.materials for context
        const summaryMaterials = analysis.summary?.materials;
        if (summaryMaterials?.length > 0) {
          sections.push("- **Materials (from sketch):**");
          summaryMaterials.slice(0, 5).forEach((mat: any) => {
            const type = mat.type || mat.name || "";
            const location = mat.location || "";
            if (type) {
              sections.push(`  - ${type}${location ? ` (${location})` : ""}`);
            }
          });
        }

        if (analysis.summary?.overview) {
          sections.push(`- Summary: ${analysis.summary.overview.slice(0, 300)}`);
        }
      }
    });
  }

  if (!hasData) {
    return "No tech files have been generated yet. Suggest generating Factory Specs for detailed analysis.";
  }

  return sections.join("\n");
}

/**
 * Get section-specific context
 */
function getSectionContext(activeSection: string): string {
  const sectionDescriptions: Record<string, string> = {
    visualization: "The user is viewing product images and visualizations.",
    colors: "The user is reviewing the color palette and color specifications.",
    materials: "The user is examining materials, fabrics, and their properties.",
    construction: "The user is looking at construction details, seams, and assembly.",
    measurements: "The user is reviewing dimensions and measurements.",
    sizes: "The user is examining size range and grading specifications.",
    hardware: "The user is looking at hardware components like zippers, buttons, etc.",
    packaging: "The user is reviewing packaging specifications.",
    care: "The user is looking at care instructions and labels.",
    quality: "The user is examining quality standards and inspection criteria.",
    production: "The user is reviewing production logistics and timeline.",
    overview: "The user is viewing the product overview and summary.",
    "base-views": "The user is examining the analyzed base views of the product.",
    components: "The user is reviewing isolated component images and analysis.",
    closeups: "The user is examining close-up detail shots.",
    sketches: "The user is reviewing technical sketches and drawings.",
  };

  return sectionDescriptions[activeSection] || "The user is navigating the tech pack.";
}

/**
 * Build the complete product context for the AI system prompt
 */
export function buildProductContext(params: BuildProductContextParams): string {
  const { productName, techPackData, techFilesData, productImages, activeSection } = params;

  // Count available data
  const hasImages = productImages.front !== "/placeholder.svg?height=400&width=300&text=Front+View";
  const imageCount = [
    productImages.front,
    productImages.back,
    productImages.side,
    productImages.top,
    productImages.bottom,
  ].filter((img) => img && !img.includes("placeholder")).length;

  const baseViewCount = techFilesData?.baseViews?.length || 0;
  const componentCount = techFilesData?.components?.length || 0;
  const closeupCount = techFilesData?.closeups?.length || 0;
  const sketchCount = techFilesData?.sketches?.length || 0;

  return `You are an expert product development AI assistant helping with "${productName}".

## YOUR ROLE
You are a knowledgeable assistant with deep expertise in:
- Product design and development
- Manufacturing and production processes
- Materials science and textiles
- Quality control and specifications
- Cost optimization and sourcing
- Tech pack creation and factory communication

## YOUR CAPABILITIES
1. **Answer Questions**: Provide detailed, accurate answers using the product data below
2. **Analyze Data**: Review specifications and identify issues or improvements
3. **Suggest Improvements**: Recommend changes to materials, construction, or specifications
4. **Explain Technical Details**: Help users understand manufacturing terminology and processes
5. **Guide Next Steps**: Suggest what actions would be most valuable

## PRODUCT DATA AVAILABLE

### Data Summary
- Product Images: ${imageCount} images available
- Base Views Analyzed: ${baseViewCount}
- Component Images: ${componentCount}
- Close-up Shots: ${closeupCount}
- Technical Sketches: ${sketchCount}
- Tech Pack: ${techPackData ? "Loaded" : "Not available"}

${techPackData ? extractTechPackSpecs(techPackData) : "### Tech Pack\nNo tech pack specifications loaded yet."}

## TECH FILE ANALYSIS DATA
${extractTechFilesAnalysis(techFilesData)}

## CURRENT CONTEXT
${getSectionContext(activeSection)}
Active Section: **${activeSection}**

## RESPONSE GUIDELINES
1. Be specific and reference actual data from the product when answering
2. If data is missing, acknowledge it and suggest which files to generate
3. Use clear formatting with bullet points and headers
4. Keep responses concise but informative (aim for 100-300 words)
5. If suggesting changes, explain the reasoning and potential impact
6. Be proactive in identifying issues or improvements you notice
7. Use industry terminology but explain it when needed

## FORMATTING
- Use **bold** for emphasis
- Use bullet points for lists
- Use numbers for sequential steps
- Keep paragraphs short and scannable`;
}

/**
 * Build a shorter context for follow-up messages to save tokens
 */
export function buildCompactContext(params: BuildProductContextParams): string {
  const { productName, activeSection, techFilesData } = params;

  const baseViewCount = techFilesData?.baseViews?.length || 0;
  const componentCount = techFilesData?.components?.length || 0;

  return `Product: ${productName}
Section: ${activeSection}
Data: ${baseViewCount} base views, ${componentCount} components
Role: Product development expert assistant`;
}
