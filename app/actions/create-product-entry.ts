"use server";

import { DeductCredits } from "@/lib/supabase/payments";
import { createClient } from "@/lib/supabase/server";
import { injectBrandContext, type BrandDNA } from "@/lib/services/brand-dna-context-service";
import { type ProductCategory } from "@/lib/constants/product-categories";
import { classifyProductWithAI } from "@/lib/services/ai-category-classifier";

/**
 * Extract and merge tech files analysis data into tech pack sections
 * This takes the analysis_data from sketches, components, closeups, and base views
 * and merges it into the corresponding tech pack fields
 */
function mergeTechFilesIntoTechPack(techPack: any, techFiles: any[]): any {
  if (!techFiles || techFiles.length === 0) return techPack;

  const mergedTechPack = { ...techPack };

  // Separate tech files by type
  const sketches = techFiles.filter((f) => f.file_type === "sketch");
  const components = techFiles.filter((f) => f.file_type === "component");
  // closeups reserved for future use (quality details extraction)
  // const closeups = techFiles.filter((f) => f.file_type === "closeup");
  const baseViews = techFiles.filter((f) => f.file_type === "base_view");

  // ============================================
  // EXTRACT DIMENSIONS from sketches
  // ============================================
  const dimensionDetails: any[] = [];

  // Standard dimension mapping - maps sketch measurement names to tech pack dimension keys
  const dimensionMapping: Record<string, string> = {
    // Height variations
    "overall height": "height",
    "height": "height",
    "total height": "height",
    "overall_height": "height",
    // Width variations
    "overall width": "width",
    "width": "width",
    "total width": "width",
    "overall_width": "width",
    "breadth": "width",
    // Length/Depth variations
    "depth": "length",
    "length": "length",
    "overall depth": "length",
    "overall length": "length",
    "overall_depth": "length",
    "front to back": "length",
    // Weight variations
    "weight": "weight",
    "total weight": "weight",
    "overall_weight": "weight",
  };

  // Extract and map dimensions to standard keys
  const extractedDimensions: Record<string, { value: string; tolerance?: string; description?: string }> = {};

  sketches.forEach((sketch) => {
    const analysis = sketch.analysis_data;
    if (!analysis) return;

    // From summary.measurements (primary source for sketch guides)
    const summaryMeasurements = analysis.summary?.measurements || [];
    summaryMeasurements.forEach((meas: any) => {
      if (meas.name && meas.value) {
        const normalizedName = meas.name.toLowerCase().trim();
        const mappedKey = dimensionMapping[normalizedName];

        // Parse value and tolerance from strings like "60 cm ±1 cm"
        const valueStr = meas.value.toString();
        let mainValue = valueStr;
        let tolerance = "";

        // Extract tolerance if present (e.g., "±1 cm")
        const toleranceMatch = valueStr.match(/([±+\-]\s*[\d.]+\s*\w*)/);
        if (toleranceMatch) {
          tolerance = toleranceMatch[1].trim();
          mainValue = valueStr.replace(toleranceMatch[0], "").trim();
        }

        if (mappedKey && !extractedDimensions[mappedKey]) {
          extractedDimensions[mappedKey] = {
            value: mainValue,
            tolerance: tolerance,
            description: meas.location || `From ${sketch.view_type || "sketch"} view`,
          };
        }

        // Also store in details array for additional measurements
        dimensionDetails.push({
          name: meas.name,
          value: meas.value,
          location: meas.location || "",
          source: `${sketch.view_type || "sketch"} sketch summary`,
        });
      }
    });

    // From annotations_included.dimensions
    const dimensions = analysis.annotations_included?.dimensions || [];
    dimensions.forEach((dim: any) => {
      const key = dim.dimension_type || dim.location || "dimension";
      const value = dim.measurement || dim.value || "";
      if (value) {
        const normalizedName = key.toLowerCase().trim();
        const mappedKey = dimensionMapping[normalizedName];

        // Parse value and tolerance
        const valueStr = value.toString();
        let mainValue = valueStr;
        let tolerance = "";

        const toleranceMatch = valueStr.match(/([±+\-]\s*[\d.]+\s*\w*)/);
        if (toleranceMatch) {
          tolerance = toleranceMatch[1].trim();
          mainValue = valueStr.replace(toleranceMatch[0], "").trim();
        }

        if (mappedKey && !extractedDimensions[mappedKey]) {
          extractedDimensions[mappedKey] = {
            value: mainValue,
            tolerance: tolerance,
            description: dim.location || `From ${sketch.view_type || "sketch"} view${dim.critical ? " (critical)" : ""}`,
          };
        }

        dimensionDetails.push({
          name: key,
          value: value,
          location: dim.location || "",
          critical: dim.critical || false,
          source: `${sketch.view_type || "sketch"} sketch`,
        });
      }
    });

    // From measurements_summary.primary_dimensions
    const primaryDims = analysis.measurements_summary?.primary_dimensions || [];
    primaryDims.forEach((dim: any) => {
      if (typeof dim === "string") {
        dimensionDetails.push({
          name: "measurement",
          value: dim,
          source: `${sketch.view_type || "sketch"} sketch`,
        });
      } else if (dim.measurement || dim.value) {
        const name = dim.name || dim.type || "dimension";
        const value = dim.measurement || dim.value;
        const normalizedName = name.toLowerCase().trim();
        const mappedKey = dimensionMapping[normalizedName];

        if (mappedKey && !extractedDimensions[mappedKey]) {
          extractedDimensions[mappedKey] = {
            value: value,
            description: `From ${sketch.view_type || "sketch"} view`,
          };
        }

        dimensionDetails.push({
          name: name,
          value: value,
          source: `${sketch.view_type || "sketch"} sketch`,
        });
      }
    });
  });

  // Merge dimensions into tech pack - both standard keys and details array
  if (Object.keys(extractedDimensions).length > 0 || dimensionDetails.length > 0) {
    mergedTechPack.dimensions = {
      // Keep any existing dimensions that weren't overwritten
      ...mergedTechPack.dimensions,
      // Override with extracted dimensions from Factory Specs
      ...extractedDimensions,
      // Also store all details for reference
      details: dimensionDetails,
      fromFactorySpecs: true,
    };

    console.log("📐 Dimensions extracted from Factory Specs:", {
      height: extractedDimensions.height?.value,
      width: extractedDimensions.width?.value,
      length: extractedDimensions.length?.value,
      weight: extractedDimensions.weight?.value,
      additionalDetails: dimensionDetails.length,
    });
  }

  // ============================================
  // EXTRACT MATERIALS from sketches and components
  // ============================================
  const extractedMaterials: any[] = [];
  const existingMaterialMap = new Map<string, boolean>();

  // Track existing materials to avoid duplicates
  (mergedTechPack.materials || []).forEach((m: any) => {
    if (m.component) existingMaterialMap.set(m.component.toLowerCase(), true);
  });

  // From sketch material_callouts
  sketches.forEach((sketch) => {
    const materialCallouts =
      sketch.analysis_data?.annotations_included?.material_callouts || [];
    materialCallouts.forEach((mat: any) => {
      const component = mat.component || mat.location_on_sketch || "";
      if (component && !existingMaterialMap.has(component.toLowerCase())) {
        extractedMaterials.push({
          component: component,
          material: mat.material_spec || mat.material_name || "",
          notes: mat.critical ? "Critical material" : "",
          source: `${sketch.view_type || "sketch"} sketch`,
        });
        existingMaterialMap.set(component.toLowerCase(), true);
      }
    });

    // From summary.materials
    const summaryMaterials = sketch.analysis_data?.summary?.materials || [];
    summaryMaterials.forEach((mat: any) => {
      const type = mat.type || mat.name || "";
      if (type && !existingMaterialMap.has(type.toLowerCase())) {
        extractedMaterials.push({
          component: mat.location || type,
          material: type,
          notes: mat.properties?.join(", ") || "",
          source: `${sketch.view_type || "sketch"} sketch summary`,
        });
        existingMaterialMap.set(type.toLowerCase(), true);
      }
    });
  });

  // From component analysis
  components.forEach((comp) => {
    const analysis = comp.analysis_data;
    const guide = analysis?.component_guide || analysis || {};
    const materials = guide.material_specifications || analysis?.material_specifications;

    if (materials?.primary_material) {
      const component = comp.file_category || guide.component_identification?.component_type || "Component";
      if (!existingMaterialMap.has(component.toLowerCase())) {
        extractedMaterials.push({
          component: component,
          material: materials.primary_material,
          notes: materials.color?.name ? `Color: ${materials.color.name}` : "",
          source: "component analysis",
        });
        existingMaterialMap.set(component.toLowerCase(), true);
      }
    }
  });

  // Merge materials into tech pack
  if (extractedMaterials.length > 0) {
    mergedTechPack.materials = [
      ...(mergedTechPack.materials || []),
      ...extractedMaterials,
    ];
  }

  // ============================================
  // EXTRACT CONSTRUCTION DETAILS from sketches
  // ============================================
  const extractedConstructionFeatures: any[] = [];
  const existingFeatureMap = new Map<string, boolean>();

  // Track existing features
  (mergedTechPack.constructionDetails?.constructionFeatures || []).forEach((f: any) => {
    if (f.featureName) existingFeatureMap.set(f.featureName.toLowerCase(), true);
  });

  sketches.forEach((sketch) => {
    const constructionCallouts =
      sketch.analysis_data?.annotations_included?.construction_callouts || [];
    constructionCallouts.forEach((con: any) => {
      const feature = con.feature || "";
      if (feature && !existingFeatureMap.has(feature.toLowerCase())) {
        extractedConstructionFeatures.push({
          featureName: feature,
          description: con.method || con.specification || "",
          location: con.location || "",
          source: `${sketch.view_type || "sketch"} sketch`,
        });
        existingFeatureMap.set(feature.toLowerCase(), true);
      }
    });

    // From summary.construction
    const summaryConstruction = sketch.analysis_data?.summary?.construction || [];
    summaryConstruction.forEach((con: any) => {
      const feature = con.feature || "";
      if (feature && !existingFeatureMap.has(feature.toLowerCase())) {
        extractedConstructionFeatures.push({
          featureName: feature,
          description: con.details || "",
          technique: con.technique || "",
          source: `${sketch.view_type || "sketch"} sketch summary`,
        });
        existingFeatureMap.set(feature.toLowerCase(), true);
      }
    });
  });

  // Merge construction details
  if (extractedConstructionFeatures.length > 0) {
    mergedTechPack.constructionDetails = {
      ...mergedTechPack.constructionDetails,
      constructionFeatures: [
        ...(mergedTechPack.constructionDetails?.constructionFeatures || []),
        ...extractedConstructionFeatures,
      ],
    };
  }

  // ============================================
  // EXTRACT HARDWARE from sketches
  // ============================================
  const extractedHardware: string[] = [];
  const existingHardwareSet = new Set<string>(
    (mergedTechPack.hardwareComponents?.hardware || []).map((h: string) =>
      h.toLowerCase()
    )
  );

  sketches.forEach((sketch) => {
    const hardwareCallouts =
      sketch.analysis_data?.annotations_included?.hardware_callouts || [];
    hardwareCallouts.forEach((hw: any) => {
      const hardware = hw.specification || hw.hardware_type || "";
      if (hardware && !existingHardwareSet.has(hardware.toLowerCase())) {
        extractedHardware.push(hardware);
        existingHardwareSet.add(hardware.toLowerCase());
      }
    });
  });

  // Merge hardware
  if (extractedHardware.length > 0) {
    mergedTechPack.hardwareComponents = {
      ...mergedTechPack.hardwareComponents,
      hardware: [
        ...(mergedTechPack.hardwareComponents?.hardware || []),
        ...extractedHardware,
      ],
    };
  }

  // ============================================
  // EXTRACT COLORS from base views and components
  // ============================================
  const extractedColors: any[] = [];
  const existingColorSet = new Set<string>();

  // Track existing colors
  (mergedTechPack.colors?.primaryColors || []).forEach((c: any) => {
    if (c.hex) existingColorSet.add(c.hex.toLowerCase());
    if (c.name) existingColorSet.add(c.name.toLowerCase());
  });

  baseViews.forEach((view) => {
    const colors = view.analysis_data?.colors || [];
    colors.forEach((color: any) => {
      const colorName = typeof color === "string" ? color : color.name || "";
      if (colorName && !existingColorSet.has(colorName.toLowerCase())) {
        extractedColors.push({
          name: colorName,
          hex: color.hex || "",
          source: `${view.view_type || "base"} view`,
        });
        existingColorSet.add(colorName.toLowerCase());
      }
    });
  });

  // From sketch summary.colors
  sketches.forEach((sketch) => {
    const colors = sketch.analysis_data?.summary?.colors || [];
    colors.forEach((color: any) => {
      const colorName = color.name || "";
      if (colorName && !existingColorSet.has(colorName.toLowerCase())) {
        extractedColors.push({
          name: colorName,
          hex: color.hex || "",
          location: color.location || "",
          source: `${sketch.view_type || "sketch"} sketch`,
        });
        existingColorSet.add(colorName.toLowerCase());
      }
    });
  });

  // Merge colors
  if (extractedColors.length > 0) {
    mergedTechPack.colors = {
      ...mergedTechPack.colors,
      primaryColors: [
        ...(mergedTechPack.colors?.primaryColors || []),
        ...extractedColors,
      ],
    };
  }

  // ============================================
  // ADD PRODUCTION NOTES from sketches
  // ============================================
  const manufacturingNotes: string[] = [];

  sketches.forEach((sketch) => {
    const notes =
      sketch.analysis_data?.annotations_included?.manufacturing_notes || [];
    notes.forEach((note: string) => {
      if (note && !manufacturingNotes.includes(note)) {
        manufacturingNotes.push(note);
      }
    });
  });

  if (manufacturingNotes.length > 0) {
    const existingNotes = mergedTechPack.productionNotes || "";
    const newNotes = manufacturingNotes.join("\n- ");
    mergedTechPack.productionNotes = existingNotes
      ? `${existingNotes}\n\n**From Factory Specs:**\n- ${newNotes}`
      : `**From Factory Specs:**\n- ${newNotes}`;
  }

  // Mark that tech pack has been enhanced with Factory Specs data
  mergedTechPack.enhancedWithFactorySpecs = true;
  mergedTechPack.factorySpecsEnhancedAt = new Date().toISOString();

  return mergedTechPack;
}

// Generation mode types for different AI generation styles
export type GenerationMode = "regular" | "black_and_white" | "minimalist" | "detailed";

interface CreateProductEntryData {
  user_prompt: string;
  category?: string;
  intended_use?: string;
  style_keywords?: string[];
  image?: string; // Logo
  selected_colors?: string[];
  product_goal?: string;
  designFile?: string; // Base64 design file
  userId: string;
  creator_id?: string;
  is_public?: boolean;
  // Brand DNA integration
  applyBrandDna?: boolean;
  brandDna?: BrandDNA | null;
  // Generation mode for AI prompt modification
  generationMode?: GenerationMode;
}

/**
 * Creates a minimal product entry in the database without generating tech pack
 * This is used when redirecting to multiview editor for immediate image generation
 */
export async function createMinimalProductEntry(data: CreateProductEntryData) {
  try {
    // Debug: Log incoming data
    console.log("📥 createMinimalProductEntry - Received data:", {
      hasImage: !!data.image,
      imageLength: data.image?.length || 0,
      hasDesignFile: !!data.designFile,
      designFileLength: data.designFile?.length || 0,
      userId: data.userId,
      category: data.category,
      promptLength: data.user_prompt?.length || 0,
      creator_id: data.creator_id,
      is_public: data.is_public,
      applyBrandDna: data.applyBrandDna,
      hasBrandDna: !!data.brandDna,
    });

    const supabase = await createClient();

    // Inject Brand DNA context into the prompt if enabled
    let finalPrompt = data.user_prompt;
    let brandDnaApplied = false;

    if (data.applyBrandDna && data.brandDna) {
      const { combinedPrompt, hasContext } = injectBrandContext(
        data.user_prompt,
        data.brandDna,
        {
          detailed: false, // Use concise context for product generation
          includeSections: ["identity", "style", "colors", "materials"],
        }
      );
      finalPrompt = combinedPrompt;
      brandDnaApplied = hasContext;
      console.log("🎨 Brand DNA context injected:", { brandDnaApplied, brandDnaId: data.brandDna.id });
    }

    // Normalize category if provided, or infer from prompt
    let normalizedCategory: ProductCategory | null = null;
    let categorySubcategory: string | null = null;

    // Clean the user prompt - remove any Brand DNA context and prefixes that might be included
    const cleanUserPrompt = (data.user_prompt || '')
      .replace(/===\s*BRAND DNA\s*===[\s\S]*?===\s*END BRAND DNA\s*===/gi, '')
      .replace(/\[BRAND DNA CONTEXT\][\s\S]*?\[END BRAND DNA CONTEXT\]/gi, '')
      .replace(/=== BRAND DNA ===[\s\S]*/gi, '') // Handle case where it doesn't close properly
      .replace(/^Product Idea:\s*/i, '') // Strip "Product Idea:" prefix
      .replace(/^Product:\s*/i, '') // Strip "Product:" prefix
      .replace(/^Idea:\s*/i, '') // Strip "Idea:" prefix
      .trim();

    // Use AI to classify the product category and subcategory
    const textToClassify = cleanUserPrompt || data.category || '';
    if (textToClassify) {
      try {
        const classification = await classifyProductWithAI(textToClassify);
        normalizedCategory = classification.category;
        categorySubcategory = classification.subcategory;
        console.log("🤖 createMinimalProductEntry - AI Category Classification:", {
          originalPrompt: data.user_prompt?.substring(0, 100),
          cleanedPrompt: cleanUserPrompt.substring(0, 100),
          category: normalizedCategory,
          subcategory: categorySubcategory,
          confidence: classification.confidence,
        });
      } catch (error) {
        console.error("Error classifying product with AI:", error);
        // Fallback to 'other' on error
        normalizedCategory = 'other';
        categorySubcategory = 'general';
      }
    }

    // Create a minimal product idea entry
    const productData: any = {
      user_id: data.userId,
      prompt: finalPrompt, // Store the prompt with Brand DNA context if applied
      original_prompt: data.user_prompt, // Store the original user prompt without context
      status: "generating", // New status to indicate generation in progress
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_id: data.creator_id,
      is_public: data.is_public,
      brand_dna_applied: brandDnaApplied,
      brand_dna_id: brandDnaApplied ? data.brandDna?.id : null,
      generation_mode: data.generationMode || "regular", // AI generation style mode
      category: normalizedCategory, // Store normalized category (inferred from prompt)
      category_subcategory: categorySubcategory, // Store category with subcategory
      // Initialize with empty tech pack - will be filled later
      tech_pack: {},
      // Initialize with placeholder images
      image_data: {
        front: { url: "", prompt_used: "" },
        back: { url: "", prompt_used: "" },
        side: { url: "", prompt_used: "" },
      },
    };

    // Store metadata and images in tech_pack for later use
    const metadata: any = {};
    if (data.category) metadata.category = data.category;
    if (data.style_keywords) metadata.style_keywords = data.style_keywords;
    if (data.intended_use) metadata.intended_use = data.intended_use;
    if (data.selected_colors) metadata.selected_colors = data.selected_colors;
    if (data.product_goal) metadata.product_goal = data.product_goal;

    // Store design file and logo separately for retrieval
    if (data.designFile) metadata.designFile = data.designFile;
    if (data.image) metadata.logo = data.image;

    // Debug: Log metadata being saved
    console.log("💾 createMinimalProductEntry - Metadata to save:", {
      hasLogo: !!metadata.logo,
      logoLength: metadata.logo?.length || 0,
      hasDesignFile: !!metadata.designFile,
      designFileLength: metadata.designFile?.length || 0,
      metadataKeys: Object.keys(metadata),
    });

    // Store metadata in tech_pack object
    if (Object.keys(metadata).length > 0) {
      productData.tech_pack = { metadata };
    }

    // Insert the product idea
    const { data: insertedProduct, error } = await supabase
      .from("product_ideas")
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Error creating product entry:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      projectId: insertedProduct.id,
      data: insertedProduct,
    };
  } catch (error) {
    console.error("Unexpected error creating product entry:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create product entry",
    };
  }
}

/**
 * Updates the product entry with generated images
 */
export async function updateProductImages(projectId: string, images: any) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("product_ideas")
      .update({
        image_data: images,
        status: "images_generated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      console.error("Error updating product images:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating product images:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update product images",
    };
  }
}

/**
 * Retrieves product metadata including design files and logos
 */
export async function getProductMetadata(projectId: string) {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from("product_ideas")
      .select("tech_pack")
      .eq("id", projectId)
      .single();

    if (error || !product) {
      return { success: false, error: "Product not found" };
    }

    const metadata = product.tech_pack?.metadata || {};

    // Filter out empty strings and null values to prevent preload errors
    const cleanMetadata = {
      designFile: metadata.designFile || undefined,
      logo: metadata.logo || undefined,
      category: metadata.category || undefined,
      style_keywords: metadata.style_keywords || undefined,
      intended_use: metadata.intended_use || undefined,
      selected_colors: metadata.selected_colors || undefined,
      product_goal: metadata.product_goal || undefined,
    };

    // Remove undefined values
    Object.keys(cleanMetadata).forEach((key) => {
      if (
        cleanMetadata[key as keyof typeof cleanMetadata] === undefined ||
        cleanMetadata[key as keyof typeof cleanMetadata] === ""
      ) {
        delete cleanMetadata[key as keyof typeof cleanMetadata];
      }
    });

    return {
      success: true,
      metadata: cleanMetadata,
    };
  } catch (error) {
    console.error("Error retrieving product metadata:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to retrieve metadata",
    };
  }
}

/**
 * Generates tech pack for an existing product entry
 */
export async function generateTechPackForProduct(
  projectId: string,
  revision?: {
    id: string;
    revisionNumber: number;
    editPrompt?: string;
    views: {
      front?: { imageUrl: string };
      back?: { imageUrl: string };
      side?: { imageUrl: string };
      top?: { imageUrl: string };
      bottom?: { imageUrl: string };
    };
  }
) {
  try {
    // Import the idea generation function
    const { generateIdea } = await import("./idea-generation");

    const supabase = await createClient();

    // Get the product data
    const { data: product, error: fetchError } = await supabase
      .from("product_ideas")
      .select("*")
      .eq("id", projectId)
      .single();

    if (fetchError || !product) {
      return { success: false, error: "Product not found" };
    }

    console.log(
      "🎯 generateTechPackForProduct - Starting tech pack generation:",
      {
        projectId,
        hasRevision: !!revision,
        revisionId: revision?.id,
        revisionNumber: revision?.revisionNumber,
        hasEditPrompt: !!revision?.editPrompt,
        editPromptLength: revision?.editPrompt?.length,
        revisionViews: revision
          ? {
              front: !!revision.views.front?.imageUrl,
              back: !!revision.views.back?.imageUrl,
              side: !!revision.views.side?.imageUrl,
              top: !!revision.views.top?.imageUrl,
              bottom: !!revision.views.bottom?.imageUrl,
            }
          : null,
      }
    );

    // Determine which images and prompt to use
    let imagesToUse;
    let promptToUse;

    if (revision && revision.views) {
      // Use revision images and edit prompt
      imagesToUse = {
        front: { url: revision.views.front?.imageUrl || "" },
        back: { url: revision.views.back?.imageUrl || "" },
        side: { url: revision.views.side?.imageUrl || "" },
        top: { url: revision.views.top?.imageUrl || "" },
        bottom: { url: revision.views.bottom?.imageUrl || "" },
      };

      // Construct a comprehensive prompt that includes revision context
      const basePrompt = product.prompt || "";
      const editContext = revision.editPrompt
        ? `\n\nThis tech pack is based on Revision #${revision.revisionNumber} with the following modifications: ${revision.editPrompt}`
        : `\n\nThis tech pack is based on Revision #${revision.revisionNumber} (original design).`;

      promptToUse = `${basePrompt}${editContext}

Please analyze the provided product images from Revision #${revision.revisionNumber} and generate a comprehensive tech pack that accurately reflects:
- Colors visible in these specific images
- Materials and textures shown in these views
- Dimensions and proportions from these product views
- Construction details visible in the images
- Any design modifications or features present in this revision

Generate a complete, production-ready tech pack based on these actual product images.`;

      console.log("📝 Using revision data for tech pack:", {
        revisionNumber: revision.revisionNumber,
        promptLength: promptToUse.length,
        hasAllViews: !!(
          imagesToUse.front.url &&
          imagesToUse.back.url &&
          imagesToUse.side.url
        ),
      });
    } else {
      // Fallback to original product data
      imagesToUse = product.image_data;
      promptToUse = product.prompt || "";

      console.log("⚠️ No revision provided, using original product data");
    }

    // 🆕 Use the revision.id directly - this is the correct revision ID for filtering tech files
    // The revision object passed from the UI has the revision ID as its `id` property
    let actualRevisionId = null;

    // Fallback: also check if any views have revisionId property (legacy support)
    if (revision?.views) {
      const frontView = revision.views.front as any;
      if (frontView?.revisionId) {
        actualRevisionId = frontView.revisionId;
        console.log(
          "📦 Using revision ID from front view (fallback):",
          actualRevisionId
        );
      } else {
        const viewWithRevisionId = Object.values(revision.views).find(
          (v: any) => v?.revisionId
        );
        if (
          viewWithRevisionId &&
          typeof viewWithRevisionId === "object" &&
          "revisionId" in viewWithRevisionId
        ) {
          actualRevisionId = (viewWithRevisionId as any).revisionId;
          console.log(
            "📦 Using revision ID from first available view (fallback):",
            actualRevisionId
          );
        }
      }
    }

    console.log(
      "📦 Final revision ID for tech files filter:",
      actualRevisionId
    );

    console.log("🎯 About to generate tech pack with:", {
      projectId,
      revisionId: actualRevisionId,
      revisionNumber: revision?.revisionNumber || null,
    });

    // Generate the tech pack using the revision data or product data
    const techPackResult = await generateIdea({
      user_prompt: promptToUse,
      existing_project_id: projectId,
      regenerate_techpack_only: true, // Only generate tech pack, not images
      updated_images: imagesToUse, // Pass the images to analyze
      selected_revision_id: actualRevisionId || undefined, // 🆕 Pass revision ID for filtering tech files
    });

    if (!techPackResult.success) {
      return { success: false, error: techPackResult.error };
    }

    console.log(
      "✅ Tech pack generated successfully for revision:",
      revision?.revisionNumber || "original"
    );
    const { success, message } = await DeductCredits({ credit: 1 });
    if (success) {
      console.log("credited deducted succesfullly");
    }

    console.log("📦 Tech pack save parameters:", {
      projectId,
      revisionId: actualRevisionId,
      revisionNumber: revision?.revisionNumber || null,
      hasTechPack: !!techPackResult.techpack,
    });

    // Fetch tech files to include images in the tech pack data
    let techFilesImages: any = null;
    try {
      const supabase = await createClient();
      let techFilesQuery = supabase
        .from("tech_files")
        .select("*")
        .eq("product_idea_id", projectId)
        .eq("status", "completed");

      if (actualRevisionId) {
        techFilesQuery = techFilesQuery.eq("revision_id", actualRevisionId);
      }

      const { data: techFiles } = await techFilesQuery;

      if (techFiles && techFiles.length > 0) {
        techFilesImages = {
          baseViews: techFiles
            .filter((f: any) => f.file_type === "base_view")
            .map((f: any) => ({
              view: f.view_type,
              imageUrl: f.file_url,
              thumbnailUrl: f.thumbnail_url,
              analysis: f.analysis_data,
            })),
          closeUps: techFiles
            .filter((f: any) => f.file_type === "closeup")
            .map((f: any) => ({
              shotName: f.file_category,
              imageUrl: f.file_url,
              thumbnailUrl: f.thumbnail_url,
              analysis: f.analysis_data,
            })),
          sketches: techFiles
            .filter((f: any) => f.file_type === "sketch")
            .map((f: any) => ({
              view: f.view_type,
              imageUrl: f.file_url,
              thumbnailUrl: f.thumbnail_url,
              callouts: f.analysis_data?.callouts,
              measurements: f.analysis_data?.measurements,
              summary: f.analysis_data?.summary,
            })),
          components: techFiles
            .filter((f: any) => f.file_type === "component")
            .map((f: any) => ({
              componentName: f.file_category,
              imageUrl: f.file_url,
              thumbnailUrl: f.thumbnail_url,
              analysis: f.analysis_data,
            })),
        };

        console.log("📸 Tech files images included:", {
          baseViewsCount: techFilesImages.baseViews.length,
          closeUpsCount: techFilesImages.closeUps.length,
          sketchesCount: techFilesImages.sketches.length,
          componentsCount: techFilesImages.components.length,
        });

        // 🆕 MERGE TECH FILES ANALYSIS INTO TECH PACK SECTIONS
        // This extracts dimensions, materials, construction details, hardware, colors
        // from the Factory Specs analysis and adds them to the tech pack
        const mergedTechPack = mergeTechFilesIntoTechPack(
          techPackResult.techpack,
          techFiles
        );
        techPackResult.techpack = mergedTechPack;

        console.log("🔄 Tech pack enhanced with Factory Specs data:", {
          hasDimensionDetails: !!mergedTechPack.dimensions?.details?.length,
          materialsCount: mergedTechPack.materials?.length || 0,
          constructionFeaturesCount: mergedTechPack.constructionDetails?.constructionFeatures?.length || 0,
          hardwareCount: mergedTechPack.hardwareComponents?.hardware?.length || 0,
          colorsCount: mergedTechPack.colors?.primaryColors?.length || 0,
          enhancedWithFactorySpecs: mergedTechPack.enhancedWithFactorySpecs,
        });
      }
    } catch (error) {
      console.error("⚠️ Error fetching tech files images:", error);
      // Non-fatal: continue without tech files images
    }

    // Merge tech files images into tech pack data
    const techPackDataWithImages = {
      ...techPackResult.techpack,
      techFiles: techFilesImages,
      // Initialize section summaries if not present - these can be auto-generated later
      sectionSummaries: techPackResult.techpack?.sectionSummaries || {},
    };

    // 🏷️ Debug: Log category data before saving
    console.log("🏷️ generateTechPackForProduct - Category data before save:", {
      hasCategory: !!techPackDataWithImages?.category,
      category: techPackDataWithImages?.category,
      hasCategorySubcategory: !!techPackDataWithImages?.category_Subcategory,
      categorySubcategory: techPackDataWithImages?.category_Subcategory,
      productName: techPackDataWithImages?.productName,
    });

    const { saveTechPackForRevision } = await import("./tech-pack-management");
    const saveResult = await saveTechPackForRevision(
      projectId,
      actualRevisionId,
      revision?.revisionNumber || null,
      techPackDataWithImages
    );

    if (!saveResult.success) {
      console.error(
        "❌ Failed to save tech pack to new table:",
        saveResult.error
      );
      console.error("Full error details:", saveResult);
      // Don't fail the whole operation - legacy tech_pack field was still updated
    } else {
      console.log("✅ Tech pack saved to product_tech_packs table:", {
        techPackId: saveResult.techPackId,
        revisionNumber: revision?.revisionNumber,
        revisionId: actualRevisionId,
      });
    }

    return {
      success: true,
      techPack: techPackDataWithImages,
      revisionUsed: revision?.revisionNumber,
      techPackId: saveResult.success ? saveResult.techPackId : undefined,
    };
  } catch (error) {
    console.error("Error generating tech pack:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate tech pack",
    };
  }
}
