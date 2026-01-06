// types/product.ts
import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
import { createClient } from "@/lib/supabase/server";
import type {
  GeneratedImage,
  TechPackData,
  GeneratedTechPackImages,
  ImageGenerationOptions,
} from "@/lib/types/sketch-generation";
import { base64ToBlob } from "@/lib/utils/sketchgeneration";
import { type ComponentMeasurementTable } from "@/lib/utils/component-measurement-table";
import { analyzeProductMeasurements } from "@/lib/ai/measurement-analysis";

// services/techPackImageService.ts
import { GeminiImageService } from "@/lib/ai/gemini";

export class TechPackImageService {
  private geminiService: GeminiImageService;

  constructor() {
    this.geminiService = new GeminiImageService();
  }

  // Helper function to extract logo image from tech pack data
  private getLogoImage(data: TechPackData): string | undefined {
    // Check various possible locations for logo image
    // Could be in: data.logo_image, data.brand_logo, data.logo_url, data.image
    // or in data.tech_pack.logo_image, etc.
    return (
      (data as any).logo_image ||
      (data as any).brand_logo ||
      (data as any).logo_url ||
      (data as any).image ||
      (data.tech_pack as any)?.logo_image ||
      (data.tech_pack as any)?.brand_logo ||
      (data.tech_pack as any)?.logo_url ||
      (data.tech_pack as any)?.image ||
      undefined
    );
  }
  // Generate vector image
  async generateVectorImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
    console.log("generateVectorImage - data structure:", {
      hasData: !!data,
      hasTechPack: !!data?.tech_pack,
      hasImageData: !!data?.image_data,
      dataKeys: data ? Object.keys(data) : [],
      techPackKeys: data?.tech_pack ? Object.keys(data.tech_pack) : [],
    });

    const prompt = this.buildVectorPrompt(data);
    const imageUrl = data.image_data?.front?.url;

    if (!imageUrl) {
      console.error("Missing front image URL. Data structure:", {
        imageData: data.image_data,
        frontData: data.image_data?.front,
      });
      throw new Error("Front image URL is missing from tech pack data");
    }

    // Get logo image if available
    const logoImage = this.getLogoImage(data);

    // Use Gemini for image generation
    const geminiResult = await this.geminiService.generateImage({
      prompt: prompt,
      referenceImage: imageUrl,
      logoImage: logoImage, // Include logo if available
      productType: data.tech_pack.productName,
      view: "front",
      style: "vector",
      options: {
        enhancePrompt: true, // Let Gemini enhance the prompt
        fallbackEnabled: true,
        retry: 3,
      },
    });

    console.log("Gemini response received");
    const generatedImageUrl = geminiResult.url;

    if (!generatedImageUrl) {
      throw new Error("Failed to retrieve image URL from Gemini response.");
    }

    // Extract dimensions properly from the new structure
    const dimensionsStr =
      data.tech_pack?.dimensions?.details?.length > 0
        ? Object.entries(data.tech_pack.dimensions.details[0])
            .map(([key, val]: [string, any]) => `${key}: ${val?.value || "TBD"}`)
            .join(", ")
        : "";

    return {
      id: `vector-${Date.now()}`,
      type: "vector",
      url: generatedImageUrl,
      description: `Vector technical drawing for ${data.tech_pack?.productName || "product"}`,
      format: "png",
      isVector: true,
      technicalSpecs: {
        dimensions: dimensionsStr,
        materials: data.tech_pack?.materials?.filter((m) => m.material)?.map((m) => m.material) || [],
        constructionNotes: data.tech_pack?.constructionDetails?.description || "",
      },
    };
  }

  // Generate detail images
  async generateDetailImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
    // Extract detail areas from hardware and construction features
    const detailAreas = [
      ...data.tech_pack.hardwareComponents.hardware,
      ...data.tech_pack.constructionDetails.constructionFeatures.map((f) => f.featureName),
    ];

    const detailArea = detailAreas[0]; // Single detail only

    try {
      const prompt = this.buildDetailPrompt(data, detailArea);
      const imageUrl = data.image_data?.front?.url;

      if (!imageUrl) {
        throw new Error("Front image URL is missing from tech pack data");
      }
      // Get logo image if available
      const logoImage = this.getLogoImage(data);

      // Use Gemini directly for image generation
      // For detail images, we pass the prompt directly without using templates
      const geminiResult = await this.geminiService.generateImage({
        prompt: prompt,
        referenceImage: imageUrl,
        logoImage: logoImage, // Include logo if available
        // Don't specify view/style for detail images as they use custom prompts
        options: {
          enhancePrompt: true, // Let Gemini enhance the prompt
          fallbackEnabled: true,
          retry: 3,
        },
      });

      console.log("Gemini response received");
      const generatedImageUrl = geminiResult.url;

      if (!generatedImageUrl) {
        throw new Error("Failed to retrieve image URL from Gemini response.");
      }

      return {
        id: `detail-single-${Date.now()}`,
        type: "detail",
        url: generatedImageUrl,
        description: `Detail zoom: ${detailArea}`,
        relatedArea: detailArea,
        format: "png",
        technicalSpecs: {
          constructionNotes: detailArea,
        },
      };
    } catch (error) {
      console.error(`Error generating detail image:`, error);

      // Return error fallback instead of null
      return {
        id: `detail-single-error-${Date.now()}`,
        type: "detail",
        url: "",
        description: `Error generating detail image for ${data.tech_pack.productName}`,
        format: "png",
        technicalSpecs: {
          constructionNotes: "Generation error occurred",
        },
      };
    }
  }

  async generateTechnicalImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
    const prompt = this.buildTechnicalPrompt(data);
    const imageUrl = data.image_data?.front?.url;

    if (!imageUrl) {
      throw new Error("Front image URL is missing from tech pack data");
    }

    // Get logo image if available
    const logoImage = this.getLogoImage(data);

    // Use Gemini for image generation
    const geminiResult = await this.geminiService.generateImage({
      prompt: prompt,
      referenceImage: imageUrl,
      logoImage: logoImage, // Include logo if available
      productType: data.tech_pack.productName,
      view: "technical",
      style: "technical",
      options: {
        enhancePrompt: true, // Let Gemini enhance the prompt
        fallbackEnabled: true,
        retry: 3,
      },
    });

    const generatedImageUrl = geminiResult.url;

    if (!generatedImageUrl) {
      throw new Error("Failed to retrieve image URL from Gemini response.");
    }

    const dimensionsStr =
      data.tech_pack?.dimensions?.details?.length > 0
        ? Object.entries(data.tech_pack.dimensions.details[0])
            .map(([key, val]: [string, any]) => `${key}: ${val?.value || "TBD"}`)
            .join(", ")
        : "";

    return {
      id: `technical-${Date.now()}`,
      type: "technical",
      url: generatedImageUrl,
      description: `Technical specification for ${data.tech_pack.productName}`,
      format: "png",
      technicalSpecs: {
        dimensions: dimensionsStr,
        materials: data.tech_pack?.materials?.filter((m) => m.material)?.map((m) => m.material) || [],
        constructionNotes: data.tech_pack.qualityStandards,
      },
    };
  }

  async generateFrontImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
    const prompt = this.buildFrontView(data);
    const imageUrl = data.image_data?.front?.url;

    if (!imageUrl) {
      throw new Error("Front image URL is missing from tech pack data");
    }

    // Get logo image if available
    const logoImage = this.getLogoImage(data);

    // Use Gemini for image generation
    const geminiResult = await this.geminiService.generateImage({
      prompt: prompt,
      referenceImage: imageUrl,
      logoImage: logoImage, // Include logo if available
      productType: data.tech_pack.productName,
      view: "front",
      style: "technical",
      options: {
        enhancePrompt: true, // Let Gemini enhance the prompt
        fallbackEnabled: true,
        retry: 3,
      },
    });

    const generatedImageUrl = geminiResult.url;

    if (!generatedImageUrl) {
      throw new Error("Failed to retrieve image URL from Gemini response.");
    }

    const dimensionsStr =
      data.tech_pack?.dimensions?.details?.length > 0
        ? Object.entries(data.tech_pack.dimensions.details[0])
            .map(([key, val]: [string, any]) => `${key}: ${val?.value || "TBD"}`)
            .join(", ")
        : "";

    return {
      id: `front-${Date.now()}`,
      type: "front",
      url: generatedImageUrl,
      description: `Front view of ${data.tech_pack.productName}`,
      format: "png",
    };
  }

  async generateBackImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
    const prompt = this.buildBackView(data);
    const imageUrl = data.image_data?.back?.url;

    if (!imageUrl) {
      throw new Error("Back image URL is missing from tech pack data");
    }

    // Get logo image if available
    const logoImage = this.getLogoImage(data);

    // Use Gemini for image generation
    const geminiResult = await this.geminiService.generateImage({
      prompt: prompt,
      referenceImage: imageUrl,
      logoImage: logoImage, // Include logo if available
      productType: data.tech_pack.productName,
      view: "back",
      style: "technical",
      options: {
        enhancePrompt: true, // Let Gemini enhance the prompt
        fallbackEnabled: true,
        retry: 3,
      },
    });

    const generatedImageUrl = geminiResult.url;

    if (!generatedImageUrl) {
      throw new Error("Failed to retrieve image URL from Gemini response.");
    }
    return {
      id: `backView-${Date.now()}`,
      type: "back",
      url: generatedImageUrl,
      description: `back View for ${data.tech_pack.productName}`,
      format: "png",
    };
  }

  async generateConstructionImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
    const prompt = this.buildConstructionPrompt(data);
    const imageUrl = data.image_data?.back?.url || data.image_data?.front?.url;

    if (!imageUrl) {
      throw new Error("No image URL available in tech pack data");
    }

    // Get logo image if available
    const logoImage = this.getLogoImage(data);

    // Use Gemini for image generation
    const geminiResult = await this.geminiService.generateImage({
      prompt: prompt,
      referenceImage: imageUrl,
      logoImage: logoImage, // Include logo if available
      productType: data.tech_pack.productName,
      view: "construction",
      style: "technical",
      options: {
        enhancePrompt: true, // Let Gemini enhance the prompt
        fallbackEnabled: true,
        retry: 3,
      },
    });

    const generatedImageUrl = geminiResult.url;

    if (!generatedImageUrl) {
      throw new Error("Failed to retrieve image URL from Gemini response.");
    }
    return {
      id: `constructionView-${Date.now()}`,
      type: "construction",
      url: generatedImageUrl,
      description: `Construction view for ${data.tech_pack.productName}`,
      format: "png",
    };
  }

  async generateCalloutImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
    const prompt = this.buildCalloutPrompt(data);
    const imageUrl = data.image_data?.back?.url || data.image_data?.front?.url;

    if (!imageUrl) {
      throw new Error("No image URL available in tech pack data");
    }

    // Get logo image if available
    const logoImage = this.getLogoImage(data);

    // Use Gemini for image generation
    const geminiResult = await this.geminiService.generateImage({
      prompt: prompt,
      referenceImage: imageUrl,
      logoImage: logoImage, // Include logo if available
      productType: data.tech_pack.productName,
      view: "callout",
      style: "technical",
      options: {
        enhancePrompt: true, // Let Gemini enhance the prompt
        fallbackEnabled: true,
        retry: 3,
      },
    });

    const generatedImageUrl = geminiResult.url;

    if (!generatedImageUrl) {
      throw new Error("Failed to retrieve image URL from Gemini response.");
    }
    return {
      id: `calloutView-${Date.now()}`,
      type: "callout",
      url: generatedImageUrl,
      description: `Callout view for ${data.tech_pack.productName}`,
      format: "png",
    };
  }

  async generateMeasurementImage(
    data: TechPackData,
    options: ImageGenerationOptions = {}
  ): Promise<GeneratedImage & { componentMeasurements?: ComponentMeasurementTable }> {
    const imageUrl = data.image_data?.front?.url || data.image_data?.back?.url;

    if (!imageUrl) {
      throw new Error("No image URL available in tech pack data");
    }

    console.log("Starting measurement image generation for:", data.tech_pack.productName);

    // NEW APPROACH: Generate clean technical drawing first
    const prompt = this.buildCleanTechnicalDrawingPrompt(data);
    console.log("Generating clean technical drawing without indicators");

    // Get logo image if available
    const logoImage = this.getLogoImage(data);

    // Use Gemini for image generation
    const geminiResult = await this.geminiService.generateImage({
      prompt: prompt,
      referenceImage: imageUrl,
      logoImage: logoImage, // Include logo if available
      productType: data.tech_pack.productName,
      view: "measurement",
      style: "technical",
      options: {
        enhancePrompt: true, // Let Gemini enhance the prompt
        fallbackEnabled: true,
        retry: 3,
      },
    });

    const generatedImageUrl = geminiResult.url;

    if (!generatedImageUrl) {
      throw new Error("Failed to retrieve image URL from Gemini response.");
    }

    // After generating clean image, analyze it for components
    console.log("Analyzing generated technical drawing for components...");
    const componentTable = await analyzeProductMeasurements(
      generatedImageUrl,
      data.tech_pack.productName,
      data.tech_pack
    );

    console.log(
      "Component analysis complete. Found components:",
      componentTable.components.map((c) => `${c.indicator}: ${c.componentName}`).join(", ")
    );

    return {
      id: `MeasurementView-${Date.now()}`,
      type: "measurement",
      url: generatedImageUrl,
      description: `Technical specification view for ${data.tech_pack.productName}`,
      format: "png",
      componentMeasurements: componentTable, // Include detailed component data for display
    };
  }

  async generateScaleProportionImage(
    data: TechPackData,
    options: ImageGenerationOptions = {}
  ): Promise<GeneratedImage> {
    const prompt = this.buildScaleProportionPrompt(data);
    const imageUrl = data.image_data?.back?.url || data.image_data?.front?.url;

    if (!imageUrl) {
      throw new Error("No image URL available in tech pack data");
    }

    // Get logo image if available
    const logoImage = this.getLogoImage(data);

    // Use Gemini directly for image generation
    const geminiResult = await this.geminiService.generateImage({
      prompt: prompt,
      referenceImage: imageUrl,
      logoImage: logoImage, // Include logo if available
      productType: data.tech_pack.productName,
      view: "scale",
      style: "technical",
      options: {
        enhancePrompt: true, // Let Gemini enhance the prompt
        fallbackEnabled: true,
        retry: 3,
      },
    });

    const generatedImageUrl = geminiResult.url;

    if (!generatedImageUrl) {
      throw new Error("Failed to retrieve image URL from Gemini response.");
    }
    return {
      id: `Scale-${Date.now()}`,
      type: "scaleProportion",
      url: generatedImageUrl,
      description: `Scale Proportion view for ${data.tech_pack.productName}`,
      format: "png",
    };
  }

  // Generate all images
  async generateAllImages(
    techPackData: TechPackData,
    options: ImageGenerationOptions = {}
  ): Promise<GeneratedTechPackImages> {
    const supabase = await createClient();

    // Helper to upload base64 image to Supabase and return URL
    const saveImageToSupabase = async (base64: string, fileName: string) => {
      const cleanedBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanedBase64, "base64");
      const uploadedUrl = await uploadBufferToSupabase(buffer, fileName);
      return uploadedUrl;
    };

    try {
      // Generate all images concurrently
      const [
        vectorImage,
        detailImage,
        technicalImage,
        frontViewImage,
        backViewImage,
        constructionImage,
        calloutImage,
        measurementImage,
        scaleProportionImage,
      ] = await Promise.all([
        this.generateVectorImage(techPackData, options),
        this.generateDetailImage(techPackData, options),
        this.generateTechnicalImage(techPackData, options),
        this.generateFrontImage(techPackData, options),
        this.generateBackImage(techPackData, options),
        this.generateConstructionImage(techPackData, options),
        this.generateCalloutImage(techPackData, options),
        this.generateMeasurementImage(techPackData, options),
        this.generateScaleProportionImage(techPackData, options),
      ]);

      const timestamp = Date.now();
      const uploadTasks = [
        vectorImage,
        detailImage,
        technicalImage,
        frontViewImage,
        backViewImage,
        constructionImage,
        calloutImage,
        measurementImage,
        scaleProportionImage,
      ].map(async (image) => {
        if (!image || !image.url) return null;

        const ext = image.format || "png";
        const fileName = `${image.type}_${timestamp}.${ext}`;
        const imageUrl = image.url ?? "";
        const uploadedUrl = await saveImageToSupabase(imageUrl, fileName);
        return { ...image, url: uploadedUrl || imageUrl };
      });

      const savedImages = await Promise.all(uploadTasks);

      const [
        savedVector,
        savedDetail,
        savedTechnical,
        savedFront,
        savedBack,
        savedconstruction,
        savedCallout,
        savedMeasurement,
        savedScaleProportion,
      ] = savedImages;

      // Extract component measurement table from measurement image if it exists
      const componentMeasurementData = (measurementImage as any)?.componentMeasurements || null;

      const technicalImagesObject = {
        vectorImage: savedVector || vectorImage,
        detailImage: savedDetail || detailImage,
        technicalImage: savedTechnical || technicalImage,
        frontViewImage: savedFront || frontViewImage,
        backViewImage: savedBack || backViewImage,
        constructionImage: savedconstruction || constructionImage,
        calloutImage: savedCallout || calloutImage,
        measurementImage: savedMeasurement || measurementImage,
        scaleProportionImage: savedScaleProportion || scaleProportionImage,
        componentMeasurements: componentMeasurementData, // Include the component measurement data
        category: techPackData.tech_pack.category_Subcategory || "Auto-detected from product data",
      };
      console.log(technicalImagesObject, "technialc");
      const { data, error } = await supabase
        .from("product_ideas")
        .update({
          technical_images: technicalImagesObject,
          updated_at: new Date().toISOString(),
        })
        .eq("id", techPackData.id)
        .select("id")
        .single();

      if (error) throw error;

      return {
        vectorImage: savedVector || vectorImage,
        detailImage: savedDetail || detailImage,
        technicalImage: savedTechnical || technicalImage,
        frontViewImage: savedFront || frontViewImage,
        backViewImage: savedBack || backViewImage,
        constructionImage: savedconstruction || constructionImage,
        calloutImage: savedCallout || calloutImage,
        measurementImage: savedMeasurement || measurementImage,
        scaleProportionImage: savedScaleProportion || scaleProportionImage,
        componentMeasurements: componentMeasurementData, // Include the component measurement data
        category: techPackData.tech_pack.category_Subcategory || "Auto-detected from product data",
      };
    } catch (error) {
      console.error("Error generating tech pack images:", error);
      throw new Error("Failed to generate tech pack images");
    }
  }

  // Prompt builders
  private buildVectorPrompt(data: TechPackData): string {
    const productName = data.tech_pack?.productName || "garment";

    const materialInfo =
      data.tech_pack?.materials
        ?.filter((m) => m.material && m.component)
        ?.map((m) => `${m.component}: ${m.material}`)
        ?.join(", ") || "standard materials";

    const colorInfo = data.tech_pack?.colors?.primaryColors?.map((c) => c.name)?.join(", ") || "standard colors";

    const hasLogo = !!this.getLogoImage(data);
    const logoInstructions = hasLogo
      ? "IMPORTANT: Include the brand logo from the provided logo image in the appropriate position on the garment."
      : "";

    return `Flat technical drawing of ${productName}, black and white, no color, vector-style line art,
    front and back view, no perspective, clean outlines only, no fills, no shading.
    Materials: ${materialInfo}. Colors: ${colorInfo}.
    ${logoInstructions}
    Technical illustration style suitable for manufacturing documentation.`;
  }

  private buildDetailPrompt(data: TechPackData, detailArea: string): string {
    const materials =
      data.tech_pack?.materials
        ?.filter((m) => m.material)
        ?.map((m) => m.material)
        ?.join(", ") || "standard materials";

    const productName = data.tech_pack?.productName || "garment";

    return `Extreme close-up macro photography of ${detailArea} on ${productName},
  high resolution detail shot, professional product photography, showing texture and construction details,
  materials: ${materials}, clean white studio background, soft even lighting,
  sharp focus on ${detailArea}, commercial photography style, realistic photographic detail view,
  showing stitching, fabric texture, hardware details, manufacturing quality.`;
  }

  private buildTechnicalPrompt(data: TechPackData): string {
    // Extract dimensions properly from the new structure
    const dimensionsStr =
      data.tech_pack?.dimensions?.details?.length > 0
        ? Object.entries(data.tech_pack.dimensions.details[0])
            .map(([key, val]) => `${key}: ${val?.value || "TBD"}`)
            .join(", ")
        : "standard dimensions";

    const specs = data.tech_pack?.qualityStandards || "Standard quality requirements";
    const productName = data.tech_pack?.productName || "garment";

    return `Technical specification drawing of ${productName} with measurements and annotations,
    dimension callouts, construction details, material specifications.
    Dimensions: ${dimensionsStr}. Quality standards: ${specs}.
    Professional technical drawing style, engineering documentation format,
    clean and precise with measurement arrows and callouts.`;
  }

  private buildFrontView(data: TechPackData): string {
    // Extract key details from the tech pack to make the prompt specific
    const constructionFeatures = data.tech_pack.constructionDetails.constructionFeatures
      .map((f) => f.featureName)
      .join(", ");

    const hardwareComponents = data.tech_pack.hardwareComponents.hardware.join(", ");
    const materialTypes = data.tech_pack.materials.map((m) => m.material).join(", ");

    const hasLogo = !!this.getLogoImage(data);
    const logoInstructions = hasLogo
      ? "\n    **Logo Placement:** Include the exact brand logo from the provided image in the appropriate position on the front of the garment."
      : "";

    return `
    Create a professional, flat technical sketch of the **front view** for the product: '${data.tech_pack.productName}'.

    **Core Instructions:**
    - **Style:** Generate a black and white vector-style line drawing.
    - **Perspective:** Strictly a 2D flat view. Do not use any perspective or 3D effects.
    - **Color and Shading:** Absolutely no color, gradients, or shading. The output must be clean line art on a plain white background.
    - **Lines:** Use crisp, clean, and consistent black outlines for all features.

    **Required Elements to Include:**
    - **Full Outline:** Accurately draw the complete silhouette of the product from the front.
    - **Construction Seams:** Clearly illustrate all seams, including princess seams, yokes, and panel lines.
    - **Pockets:** Precisely outline all pockets, detailing their shape, size, and exact placement.
    - **Trims and Hardware:** Include all hardware components such as: **${hardwareComponents}**. Draw buttons, zippers, snaps, and any other trims.
    - **Stitching Details:** Use dashed lines to represent all visible topstitching, double-needle stitching, and decorative stitches.

    **Context from Tech Pack:**
    - The design includes the following key features: **${constructionFeatures}**.
    - The sketch should be appropriate for a product made from these materials: **${materialTypes}**.
    ${logoInstructions}

    The final image must be a high-quality technical flat, suitable for a factory-ready tech pack.
  `;
  }

  private buildBackView(data: TechPackData): string {
    const backConstructionFeatures = data.tech_pack.constructionDetails.constructionFeatures
      .filter((f) => f.featureName.toLowerCase().includes("back") || f.featureName.toLowerCase().includes("yoke"))
      .map((f) => f.featureName)
      .join(", ");

    const hardwareComponents = data.tech_pack.hardwareComponents.hardware.join(", ");

    const hasLogo = !!this.getLogoImage(data);
    const logoInstructions = hasLogo
      ? "\n    **Logo Placement:** If the logo appears on the back, include the exact brand logo from the provided image."
      : "";

    return `
    Create a professional, flat technical sketch of the **back view** for the product: '${data.tech_pack.productName}'.

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
    - The back design includes these key features: **${backConstructionFeatures}**.
    - The sketch should show how hardware components like **${hardwareComponents}** are integrated on the back, if applicable.
    ${logoInstructions}

    The final image must be a high-quality technical flat, suitable for a factory-ready tech pack, that is visually consistent with the front view.
  `;
  }

  private buildConstructionPrompt(data: TechPackData): string {
    const constructionFeatures = data.tech_pack.constructionDetails.constructionFeatures
      .map((f) => f.featureName)
      .join(", ");

    const hardware = data.tech_pack.hardwareComponents.hardware.join(", ");

    return `Technical construction drawing of ${data.tech_pack.productName} showing:
    Assembly lines, component divisions, connection details (dashed lines), joints,
    folds, overlapping parts, fasteners, connectors, hardware: ${hardware}.
    Construction features: ${constructionFeatures}.
    Professional technical drawing with dimension callouts, measurement arrows,
    assembly annotations. Clean engineering documentation style for ${data.tech_pack.category_Subcategory}.`;
  }

  private buildCalloutPrompt(data: TechPackData): string {
    // Generate specific callout content
    const materialCallouts = data.tech_pack.materials.map((m, i) => `${i + 1}→${m.component}`).join(", ");

    const hardwareCallouts = data.tech_pack.hardwareComponents.hardware
      .map((h, i) => `${String.fromCharCode(65 + i)}→${h}`)
      .join(", ");

    const constructionCallouts = data.tech_pack.constructionDetails.constructionFeatures
      .map((f, i) => `C${i + 1}→${f.featureName}`)
      .join(", ");

    return `Technical specification drawing of ${data.tech_pack.productName} with comprehensive callout system:

       REQUIRED CALLOUTS AND ARROWS:
       • Material identification: ${materialCallouts}
       • Hardware/components: ${hardwareCallouts}
       • Construction details: ${constructionCallouts}
       • Surface treatments: patterns, textures, finishes, logos
       • Functional zones: user interaction areas, operational elements

       ANNOTATION FORMAT:
       Numbered circles with clear leader lines and arrows pointing precisely to:
       - Material boundaries and component zones
       - Hardware attachment points and functional elements
       - Design features and surface applications
       - Assembly and construction highlights

       Professional technical drawing with clean callout bubbles, precise arrows,
       and comprehensive identification system for ${data.tech_pack.category_Subcategory}.
       Include legend/key explaining all numbered and lettered references.`;
  }

  private buildCleanTechnicalDrawingPrompt(data: TechPackData): string {
    const productName = data.tech_pack?.productName || "product";
    const hasLogo = !!this.getLogoImage(data);
    const logoInstructions = hasLogo ? "\nInclude the brand logo in its appropriate position." : "";

    return `Create a professional technical specification drawing of ${productName}.

    REQUIREMENTS:
    • Show the complete ${productName} clearly from the best angle
    • Display all major components and construction details
    • Use clean, precise black line art on white background
    • Show proper proportions and scale
    • Include all visible hardware, seams, and construction features${logoInstructions}

    IMPORTANT - DO NOT ADD:
    • NO letter indicators or markers
    • NO measurements or dimension lines
    • NO text labels or annotations
    • NO arrows or callouts
    • Just the clean technical drawing

    Style: Professional manufacturing technical drawing, suitable for component analysis.`;
  }

  private buildScaleProportionPrompt(data: TechPackData): string {
    const componentCount = data.tech_pack.materials.length;
    const hasHardware = data.tech_pack.hardwareComponents.hardware.length > 0;

    return `Technical scale diagram of ${data.tech_pack.productName} with proportional accuracy:

       SCALE & PROPORTION ELEMENTS:
       • Accurate proportional relationships between all ${componentCount} components
       • Professional ruler scale or measurement grid overlay
       • Scale ratio indicator and measurement reference legend
       • True-to-scale hardware and functional elements${hasHardware ? " with proper sizing" : ""}
       • Proportional representation maintaining size relationships

       Show professional scale reference system with ruler overlay, accurate proportions,
       scale legend, and measurement grid for ${data.tech_pack.category_Subcategory}.
       Include scale ratio indicator and dimensional accuracy markers.`;
  }
}

export default async function generateTechnicalSpecSheets(
  techPackData: TechPackData,
  options: ImageGenerationOptions = {}
) {
  const service = new TechPackImageService();
  return await service.generateAllImages(techPackData, options);
}

// types/product.ts
// import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
// import { createClient } from "@/lib/supabase/server";
// import type {
//   GeneratedImage,
//   TechPackData,
//   GeneratedTechPackImages,
//   ImageGenerationOptions,
// } from "@/lib/types/sketch-generation";
// import { base64ToBlob } from "@/lib/utils/sketchgeneration";
// import { type ComponentMeasurementTable } from "@/lib/utils/component-measurement-table";
// import { analyzeProductMeasurements } from "@/lib/ai/measurement-analysis";

// // services/techPackImageService.ts
// import { GeminiImageService } from "@/lib/ai/gemini";

// export class TechPackImageService {
//   private geminiService: GeminiImageService;

//   constructor() {
//     this.geminiService = new GeminiImageService();
//   }

//   // Helper function to extract logo image from tech pack data
//   private getLogoImage(data: TechPackData): string | undefined {
//     // Check various possible locations for logo image
//     // Could be in: data.logo_image, data.brand_logo, data.logo_url, data.image
//     // or in data.tech_pack.logo_image, etc.
//     return (
//       (data as any).logo_image ||
//       (data as any).brand_logo ||
//       (data as any).logo_url ||
//       (data as any).image ||
//       (data.tech_pack as any)?.logo_image ||
//       (data.tech_pack as any)?.brand_logo ||
//       (data.tech_pack as any)?.logo_url ||
//       (data.tech_pack as any)?.image ||
//       undefined
//     );
//   }
//   // Generate vector image
//   async generateVectorImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
//     console.log("generateVectorImage - data structure:", {
//       hasData: !!data,
//       hasTechPack: !!data?.tech_pack,
//       hasImageData: !!data?.image_data,
//       dataKeys: data ? Object.keys(data) : [],
//       techPackKeys: data?.tech_pack ? Object.keys(data.tech_pack) : [],
//     });

//     const prompt = this.buildVectorPrompt(data);
//     const imageUrl = data.image_data?.front?.url;

//     if (!imageUrl) {
//       console.error("Missing front image URL. Data structure:", {
//         imageData: data.image_data,
//         frontData: data.image_data?.front,
//       });
//       throw new Error("Front image URL is missing from tech pack data");
//     }

//     // Get logo image if available
//     const logoImage = this.getLogoImage(data);

//     // Use Gemini for image generation
//     const geminiResult = await this.geminiService.generateImage({
//       prompt: prompt,
//       referenceImage: imageUrl,
//       logoImage: logoImage, // Include logo if available
//       productType: data.tech_pack.productName,
//       view: "front",
//       style: "vector",
//       options: {
//         enhancePrompt: true, // Let Gemini enhance the prompt
//         fallbackEnabled: true,
//         retry: 3,
//       },
//     });

//     console.log("Gemini response received");
//     const generatedImageUrl = geminiResult.url;

//     if (!generatedImageUrl) {
//       throw new Error("Failed to retrieve image URL from Gemini response.");
//     }

//     // Extract dimensions properly from the new structure
//     const dimensionsStr =
//       data.tech_pack?.dimensions?.details?.length > 0
//         ? Object.entries(data.tech_pack.dimensions.details[0])
//             .map(([key, val]: [string, any]) => `${key}: ${val?.value || "TBD"}`)
//             .join(", ")
//         : "";

//     return {
//       id: `vector-${Date.now()}`,
//       type: "vector",
//       url: generatedImageUrl,
//       description: `Vector technical drawing for ${data.tech_pack?.productName || "product"}`,
//       format: "png",
//       isVector: true,
//       technicalSpecs: {
//         dimensions: dimensionsStr,
//         materials: data.tech_pack?.materials?.filter((m) => m.material)?.map((m) => m.material) || [],
//         constructionNotes: data.tech_pack?.constructionDetails?.description || "",
//       },
//     };
//   }

//   // Generate detail images
//   async generateDetailImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
//     // Extract detail areas from hardware and construction features
//     const detailAreas = [
//       ...data.tech_pack.hardwareComponents.hardware,
//       ...data.tech_pack.constructionDetails.constructionFeatures.map((f) => f.featureName),
//     ];

//     const detailArea = detailAreas[0]; // Single detail only

//     try {
//       const prompt = this.buildDetailPrompt(data, detailArea);
//       const imageUrl = data.image_data?.front?.url;

//       if (!imageUrl) {
//         throw new Error("Front image URL is missing from tech pack data");
//       }
//       // Get logo image if available
//       const logoImage = this.getLogoImage(data);

//       // Use Gemini directly for image generation
//       // For detail images, we pass the prompt directly without using templates
//       const geminiResult = await this.geminiService.generateImage({
//         prompt: prompt,
//         referenceImage: imageUrl,
//         logoImage: logoImage, // Include logo if available
//         // Don't specify view/style for detail images as they use custom prompts
//         options: {
//           enhancePrompt: true, // Let Gemini enhance the prompt
//           fallbackEnabled: true,
//           retry: 3,
//         },
//       });

//       console.log("Gemini response received");
//       const generatedImageUrl = geminiResult.url;

//       if (!generatedImageUrl) {
//         throw new Error("Failed to retrieve image URL from Gemini response.");
//       }

//       return {
//         id: `detail-single-${Date.now()}`,
//         type: "detail",
//         url: generatedImageUrl,
//         description: `Detail zoom: ${detailArea}`,
//         relatedArea: detailArea,
//         format: "png",
//         technicalSpecs: {
//           constructionNotes: detailArea,
//         },
//       };
//     } catch (error) {
//       console.error(`Error generating detail image:`, error);

//       // Return error fallback instead of null
//       return {
//         id: `detail-single-error-${Date.now()}`,
//         type: "detail",
//         url: "",
//         description: `Error generating detail image for ${data.tech_pack.productName}`,
//         format: "png",
//         technicalSpecs: {
//           constructionNotes: "Generation error occurred",
//         },
//       };
//     }
//   }

//   async generateTechnicalImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
//     const prompt = this.buildTechnicalPrompt(data);
//     const imageUrl = data.image_data?.front?.url;

//     if (!imageUrl) {
//       throw new Error("Front image URL is missing from tech pack data");
//     }

//     // Get logo image if available
//     const logoImage = this.getLogoImage(data);

//     // Use Gemini for image generation
//     const geminiResult = await this.geminiService.generateImage({
//       prompt: prompt,
//       referenceImage: imageUrl,
//       logoImage: logoImage, // Include logo if available
//       productType: data.tech_pack.productName,
//       view: "technical",
//       style: "technical",
//       options: {
//         enhancePrompt: true, // Let Gemini enhance the prompt
//         fallbackEnabled: true,
//         retry: 3,
//       },
//     });

//     const generatedImageUrl = geminiResult.url;

//     if (!generatedImageUrl) {
//       throw new Error("Failed to retrieve image URL from Gemini response.");
//     }

//     const dimensionsStr =
//       data.tech_pack?.dimensions?.details?.length > 0
//         ? Object.entries(data.tech_pack.dimensions.details[0])
//             .map(([key, val]: [string, any]) => `${key}: ${val?.value || "TBD"}`)
//             .join(", ")
//         : "";

//     return {
//       id: `technical-${Date.now()}`,
//       type: "technical",
//       url: generatedImageUrl,
//       description: `Technical specification for ${data.tech_pack.productName}`,
//       format: "png",
//       technicalSpecs: {
//         dimensions: dimensionsStr,
//         materials: data.tech_pack?.materials?.filter((m) => m.material)?.map((m) => m.material) || [],
//         constructionNotes: data.tech_pack.qualityStandards,
//       },
//     };
//   }

//   async generateFrontImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
//     const prompt = this.buildFrontView(data);
//     const imageUrl = data.image_data?.front?.url;

//     if (!imageUrl) {
//       throw new Error("Front image URL is missing from tech pack data");
//     }

//     // Get logo image if available
//     const logoImage = this.getLogoImage(data);

//     // Use Gemini for image generation
//     const geminiResult = await this.geminiService.generateImage({
//       prompt: prompt,
//       referenceImage: imageUrl,
//       logoImage: logoImage, // Include logo if available
//       productType: data.tech_pack.productName,
//       view: "front",
//       style: "technical",
//       options: {
//         enhancePrompt: true, // Let Gemini enhance the prompt
//         fallbackEnabled: true,
//         retry: 3,
//       },
//     });

//     const generatedImageUrl = geminiResult.url;

//     if (!generatedImageUrl) {
//       throw new Error("Failed to retrieve image URL from Gemini response.");
//     }

//     const dimensionsStr =
//       data.tech_pack?.dimensions?.details?.length > 0
//         ? Object.entries(data.tech_pack.dimensions.details[0])
//             .map(([key, val]: [string, any]) => `${key}: ${val?.value || "TBD"}`)
//             .join(", ")
//         : "";

//     return {
//       id: `front-${Date.now()}`,
//       type: "front",
//       url: generatedImageUrl,
//       description: `Front view of ${data.tech_pack.productName}`,
//       format: "png",
//     };
//   }

//   async generateBackImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
//     const prompt = this.buildBackView(data);
//     const imageUrl = data.image_data?.back?.url;

//     if (!imageUrl) {
//       throw new Error("Back image URL is missing from tech pack data");
//     }

//     // Get logo image if available
//     const logoImage = this.getLogoImage(data);

//     // Use Gemini for image generation
//     const geminiResult = await this.geminiService.generateImage({
//       prompt: prompt,
//       referenceImage: imageUrl,
//       logoImage: logoImage, // Include logo if available
//       productType: data.tech_pack.productName,
//       view: "back",
//       style: "technical",
//       options: {
//         enhancePrompt: true, // Let Gemini enhance the prompt
//         fallbackEnabled: true,
//         retry: 3,
//       },
//     });

//     const generatedImageUrl = geminiResult.url;

//     if (!generatedImageUrl) {
//       throw new Error("Failed to retrieve image URL from Gemini response.");
//     }
//     return {
//       id: `backView-${Date.now()}`,
//       type: "back",
//       url: generatedImageUrl,
//       description: `back View for ${data.tech_pack.productName}`,
//       format: "png",
//     };
//   }

//   async generateConstructionImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
//     const prompt = this.buildConstructionPrompt(data);
//     const imageUrl = data.image_data?.back?.url || data.image_data?.front?.url;

//     if (!imageUrl) {
//       throw new Error("No image URL available in tech pack data");
//     }

//     // Get logo image if available
//     const logoImage = this.getLogoImage(data);

//     // Use Gemini for image generation
//     const geminiResult = await this.geminiService.generateImage({
//       prompt: prompt,
//       referenceImage: imageUrl,
//       logoImage: logoImage, // Include logo if available
//       productType: data.tech_pack.productName,
//       view: "construction",
//       style: "technical",
//       options: {
//         enhancePrompt: true, // Let Gemini enhance the prompt
//         fallbackEnabled: true,
//         retry: 3,
//       },
//     });

//     const generatedImageUrl = geminiResult.url;

//     if (!generatedImageUrl) {
//       throw new Error("Failed to retrieve image URL from Gemini response.");
//     }
//     return {
//       id: `constructionView-${Date.now()}`,
//       type: "construction",
//       url: generatedImageUrl,
//       description: `Construction view for ${data.tech_pack.productName}`,
//       format: "png",
//     };
//   }

//   async generateCalloutImage(data: TechPackData, options: ImageGenerationOptions = {}): Promise<GeneratedImage> {
//     const prompt = this.buildCalloutPrompt(data);
//     const imageUrl = data.image_data?.back?.url || data.image_data?.front?.url;

//     if (!imageUrl) {
//       throw new Error("No image URL available in tech pack data");
//     }

//     // Get logo image if available
//     const logoImage = this.getLogoImage(data);

//     // Use Gemini for image generation
//     const geminiResult = await this.geminiService.generateImage({
//       prompt: prompt,
//       referenceImage: imageUrl,
//       logoImage: logoImage, // Include logo if available
//       productType: data.tech_pack.productName,
//       view: "callout",
//       style: "technical",
//       options: {
//         enhancePrompt: true, // Let Gemini enhance the prompt
//         fallbackEnabled: true,
//         retry: 3,
//       },
//     });

//     const generatedImageUrl = geminiResult.url;

//     if (!generatedImageUrl) {
//       throw new Error("Failed to retrieve image URL from Gemini response.");
//     }
//     return {
//       id: `calloutView-${Date.now()}`,
//       type: "callout",
//       url: generatedImageUrl,
//       description: `Callout view for ${data.tech_pack.productName}`,
//       format: "png",
//     };
//   }

//   async generateMeasurementImage(
//     data: TechPackData,
//     options: ImageGenerationOptions = {}
//   ): Promise<GeneratedImage & { componentMeasurements?: ComponentMeasurementTable }> {
//     const imageUrl = data.image_data?.front?.url || data.image_data?.back?.url;

//     if (!imageUrl) {
//       throw new Error("No image URL available in tech pack data");
//     }

//     console.log("Starting measurement image generation for:", data.tech_pack.productName);

//     // NEW APPROACH: Generate clean technical drawing first
//     const prompt = this.buildCleanTechnicalDrawingPrompt(data);
//     console.log("Generating clean technical drawing without indicators");

//     // Get logo image if available
//     const logoImage = this.getLogoImage(data);

//     // Use Gemini for image generation
//     const geminiResult = await this.geminiService.generateImage({
//       prompt: prompt,
//       referenceImage: imageUrl,
//       logoImage: logoImage, // Include logo if available
//       productType: data.tech_pack.productName,
//       view: "measurement",
//       style: "technical",
//       options: {
//         enhancePrompt: true, // Let Gemini enhance the prompt
//         fallbackEnabled: true,
//         retry: 3,
//       },
//     });

//     const generatedImageUrl = geminiResult.url;

//     if (!generatedImageUrl) {
//       throw new Error("Failed to retrieve image URL from Gemini response.");
//     }

//     // After generating clean image, analyze it for components
//     console.log("Analyzing generated technical drawing for components...");
//     const componentTable = await analyzeProductMeasurements(
//       generatedImageUrl,
//       data.tech_pack.productName,
//       data.tech_pack
//     );

//     console.log(
//       "Component analysis complete. Found components:",
//       componentTable.components.map((c) => `${c.indicator}: ${c.componentName}`).join(", ")
//     );

//     return {
//       id: `MeasurementView-${Date.now()}`,
//       type: "measurement",
//       url: generatedImageUrl,
//       description: `Technical specification view for ${data.tech_pack.productName}`,
//       format: "png",
//       componentMeasurements: componentTable, // Include detailed component data for display
//     };
//   }

//   async generateScaleProportionImage(
//     data: TechPackData,
//     options: ImageGenerationOptions = {}
//   ): Promise<GeneratedImage> {
//     const prompt = this.buildScaleProportionPrompt(data);
//     const imageUrl = data.image_data?.back?.url || data.image_data?.front?.url;

//     if (!imageUrl) {
//       throw new Error("No image URL available in tech pack data");
//     }

//     // Get logo image if available
//     const logoImage = this.getLogoImage(data);

//     // Use Gemini directly for image generation
//     const geminiResult = await this.geminiService.generateImage({
//       prompt: prompt,
//       referenceImage: imageUrl,
//       logoImage: logoImage, // Include logo if available
//       productType: data.tech_pack.productName,
//       view: "scale",
//       style: "technical",
//       options: {
//         enhancePrompt: true, // Let Gemini enhance the prompt
//         fallbackEnabled: true,
//         retry: 3,
//       },
//     });

//     const generatedImageUrl = geminiResult.url;

//     if (!generatedImageUrl) {
//       throw new Error("Failed to retrieve image URL from Gemini response.");
//     }
//     return {
//       id: `Scale-${Date.now()}`,
//       type: "scaleProportion",
//       url: generatedImageUrl,
//       description: `Scale Proportion view for ${data.tech_pack.productName}`,
//       format: "png",
//     };
//   }

//   // Generate all images
//   async generateAllImages(
//     techPackData: TechPackData,
//     options: ImageGenerationOptions = {}
//   ): Promise<GeneratedTechPackImages> {
//     const supabase = await createClient();

//     // Helper to upload base64 image to Supabase and return URL
//     const saveImageToSupabase = async (base64: string, fileName: string) => {
//       const cleanedBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
//       const buffer = Buffer.from(cleanedBase64, "base64");
//       const uploadedUrl = await uploadBufferToSupabase(buffer, fileName);
//       return uploadedUrl;
//     };

//     try {
//       // Generate all images concurrently
//       const [
//         vectorImage,
//         detailImage,
//         technicalImage,
//         frontViewImage,
//         backViewImage,
//         constructionImage,
//         calloutImage,
//         measurementImage,
//         scaleProportionImage,
//       ] = await Promise.all([
//         this.generateVectorImage(techPackData, options),
//         this.generateDetailImage(techPackData, options),
//         this.generateTechnicalImage(techPackData, options),
//         this.generateFrontImage(techPackData, options),
//         this.generateBackImage(techPackData, options),
//         this.generateConstructionImage(techPackData, options),
//         this.generateCalloutImage(techPackData, options),
//         this.generateMeasurementImage(techPackData, options),
//         this.generateScaleProportionImage(techPackData, options),
//       ]);

//       const timestamp = Date.now();
//       const uploadTasks = [
//         vectorImage,
//         detailImage,
//         technicalImage,
//         frontViewImage,
//         backViewImage,
//         constructionImage,
//         calloutImage,
//         measurementImage,
//         scaleProportionImage,
//       ].map(async (image) => {
//         if (!image || !image.url) return null;

//         const ext = image.format || "png";
//         const fileName = `${image.type}_${timestamp}.${ext}`;
//         const imageUrl = image.url ?? "";
//         const uploadedUrl = await saveImageToSupabase(imageUrl, fileName);
//         return { ...image, url: uploadedUrl || imageUrl };
//       });

//       const savedImages = await Promise.all(uploadTasks);

//       const [
//         savedVector,
//         savedDetail,
//         savedTechnical,
//         savedFront,
//         savedBack,
//         savedconstruction,
//         savedCallout,
//         savedMeasurement,
//         savedScaleProportion,
//       ] = savedImages;

//       // Extract component measurement table from measurement image if it exists
//       const componentMeasurementData = (measurementImage as any)?.componentMeasurements || null;

//       const technicalImagesObject = {
//         vectorImage: savedVector || vectorImage,
//         detailImage: savedDetail || detailImage,
//         technicalImage: savedTechnical || technicalImage,
//         frontViewImage: savedFront || frontViewImage,
//         backViewImage: savedBack || backViewImage,
//         constructionImage: savedconstruction || constructionImage,
//         calloutImage: savedCallout || calloutImage,
//         measurementImage: savedMeasurement || measurementImage,
//         scaleProportionImage: savedScaleProportion || scaleProportionImage,
//         componentMeasurements: componentMeasurementData, // Include the component measurement data
//         category: techPackData.tech_pack.category_Subcategory || "Auto-detected from product data",
//       };
//       console.log(technicalImagesObject, "technialc");
//       const { data, error } = await supabase
//         .from("product_ideas")
//         .update({
//           technical_images: technicalImagesObject,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", techPackData.id)
//         .select("id")
//         .single();

//       if (error) throw error;

//       return {
//         vectorImage: savedVector || vectorImage,
//         detailImage: savedDetail || detailImage,
//         technicalImage: savedTechnical || technicalImage,
//         frontViewImage: savedFront || frontViewImage,
//         backViewImage: savedBack || backViewImage,
//         constructionImage: savedconstruction || constructionImage,
//         calloutImage: savedCallout || calloutImage,
//         measurementImage: savedMeasurement || measurementImage,
//         scaleProportionImage: savedScaleProportion || scaleProportionImage,
//         componentMeasurements: componentMeasurementData, // Include the component measurement data
//         category: techPackData.tech_pack.category_Subcategory || "Auto-detected from product data",
//       };
//     } catch (error) {
//       console.error("Error generating tech pack images:", error);
//       throw new Error("Failed to generate tech pack images");
//     }
//   }

//   // Prompt builders
//   private buildVectorPrompt(data: TechPackData): string {
//     const productName = data.tech_pack?.productName || "garment";

//     const materialInfo =
//       data.tech_pack?.materials
//         ?.filter((m) => m.material && m.component)
//         ?.map((m) => `${m.component}: ${m.material}`)
//         ?.join(", ") || "standard materials";

//     const colorInfo = data.tech_pack?.colors?.primaryColors?.map((c) => c.name)?.join(", ") || "standard colors";

//     const hasLogo = !!this.getLogoImage(data);
//     const logoInstructions = hasLogo
//       ? "IMPORTANT: Include the brand logo from the provided logo image in the appropriate position on the garment."
//       : "";

//     return `Flat technical drawing of ${productName}, black and white, no color, no vector-style line art,
//     front and back view, no perspective, no fills, no shading.
//     Materials: ${materialInfo}. Colors: ${colorInfo}.
//     ${logoInstructions}
//     Technical illustration style suitable for manufacturing documentation.`;
//   }

//   private buildDetailPrompt(data: TechPackData, detailArea: string): string {
//     const materials =
//       data.tech_pack?.materials
//         ?.filter((m) => m.material)
//         ?.map((m) => m.material)
//         ?.join(", ") || "standard materials";

//     const productName = data.tech_pack?.productName || "garment";

//     return `Extreme close-up macro photography of ${detailArea} on ${productName},
//   high resolution detail shot, professional product photography, showing texture and construction details,
//   materials: ${materials}, clean white studio background, soft even lighting,
//   sharp focus on ${detailArea}, commercial photography style, realistic photographic detail view,
//   showing stitching, fabric texture, hardware details, manufacturing quality.`;
//   }

//   private buildTechnicalPrompt(data: TechPackData): string {
//     // Extract dimensions properly from the new structure
//     const dimensionsStr =
//       data.tech_pack?.dimensions?.details?.length > 0
//         ? Object.entries(data.tech_pack.dimensions.details[0])
//             .map(([key, val]) => `${key}: ${val?.value || "TBD"}`)
//             .join(", ")
//         : "standard dimensions";

//     const specs = data.tech_pack?.qualityStandards || "Standard quality requirements";
//     const productName = data.tech_pack?.productName || "garment";

//     return `Technical specification drawing of ${productName} with measurements and annotations,
//     dimension callouts, construction details, material specifications.
//     Dimensions: ${dimensionsStr}. Quality standards: ${specs}.
//         IMPORTANT - DO NOT ADD:
//     • NO letter indicators or markers
//     • NO measurements or dimension lines
//     • NO text labels or annotations
//     • NO arrows or callouts
//     • Just the clean technical drawing
//     Professional technical drawing style, engineering documentation format,
//     clean and precise with no outline and texts only drawing image`;
//   }

//   private buildFrontView(data: TechPackData): string {
//     // Extract key details from the tech pack to make the prompt specific
//     const constructionFeatures = data.tech_pack.constructionDetails.constructionFeatures
//       .map((f) => f.featureName)
//       .join(", ");

//     const hardwareComponents = data.tech_pack.hardwareComponents.hardware.join(", ");
//     const materialTypes = data.tech_pack.materials.map((m) => m.material).join(", ");

//     const hasLogo = !!this.getLogoImage(data);
//     const logoInstructions = hasLogo
//       ? "\n    **Logo Placement:** Include the exact brand logo from the provided image in the appropriate position on the front of the garment."
//       : "";

//     return `
//     Create a professional, flat technical sketch of the **front view** for the product: '${data.tech_pack.productName}'.

//     **Core Instructions:**
//     - **Style:** Generate a black and white vector-style line drawing.
//     - **Perspective:** Strictly a 2D flat view. Do not use any perspective or 3D effects.
//     - **Color and Shading:** Absolutely no color, gradients, or shading. The output must be clean line art on a plain white background.
//     - **Lines:** Use crisp, clean, and consistent black outlines for all features.

//     **Required Elements to Include:**
//     - **Full Outline:** Accurately draw the complete silhouette of the product from the front.
//     - **Construction Seams:** Clearly illustrate all seams, including princess seams, yokes, and panel lines.
//     - **Pockets:** Precisely outline all pockets, detailing their shape, size, and exact placement.
//     - **Trims and Hardware:** Include all hardware components such as: **${hardwareComponents}**. Draw buttons, zippers, snaps, and any other trims.
//     - **Stitching Details:** Use dashed lines to represent all visible topstitching, double-needle stitching, and decorative stitches.

//     **Context from Tech Pack:**
//     - The design includes the following key features: **${constructionFeatures}**.
//     - The sketch should be appropriate for a product made from these materials: **${materialTypes}**.
//     ${logoInstructions}

//     The final image must be a high-quality technical flat, suitable for a factory-ready tech pack.
//   `;
//   }

//   private buildBackView(data: TechPackData): string {
//     const backConstructionFeatures = data.tech_pack.constructionDetails.constructionFeatures
//       .filter((f) => f.featureName.toLowerCase().includes("back") || f.featureName.toLowerCase().includes("yoke"))
//       .map((f) => f.featureName)
//       .join(", ");

//     const hardwareComponents = data.tech_pack.hardwareComponents.hardware.join(", ");

//     const hasLogo = !!this.getLogoImage(data);
//     const logoInstructions = hasLogo
//       ? "\n    **Logo Placement:** If the logo appears on the back, include the exact brand logo from the provided image."
//       : "";

//     return `
//     Create a professional, flat technical sketch of the **back view** for the product: '${data.tech_pack.productName}'.

//     **Core Instructions:**
//     - **Style:** Generate a black and white vector-style line drawing.
//     - **Perspective:** Strictly a 2D flat view. No perspective or 3D effects.
//     - **Color and Shading:** No color, gradients, or shading. The output must be clean line art on a plain white background.
//     - **Lines:** Use crisp, clean, and consistent black outlines.

//     **Required Elements to Include:**
//     - **Full Outline:** Accurately draw the complete back silhouette of the product.
//     - **Construction Seams:** Illustrate all back seams, including any back yokes, center back seams, and panel lines.
//     - **Design Details:** If there are any back-specific details like vents, pleats, or adjustable tabs, draw them precisely.
//     - **Stitching Details:** Use dashed lines to represent all visible topstitching on the back of the garment.

//     **Context from Tech Pack:**
//     - The back design includes these key features: **${backConstructionFeatures}**.
//     - The sketch should show how hardware components like **${hardwareComponents}** are integrated on the back, if applicable.
//     ${logoInstructions}

//     The final image must be a high-quality technical flat, suitable for a factory-ready tech pack, that is visually consistent with the front view.
//   `;
//   }

//   private buildConstructionPrompt(data: TechPackData): string {
//     const constructionFeatures = data.tech_pack.constructionDetails.constructionFeatures
//       .map((f) => f.featureName)
//       .join(", ");

//     const hardware = data.tech_pack.hardwareComponents.hardware.join(", ");

//     return `Technical construction drawing of ${data.tech_pack.productName}.
//     Professional technical drawing with no outline and text. Clean engineering documentation style for ${data.tech_pack.category_Subcategory}.`;
//   }

//   private buildCalloutPrompt(data: TechPackData): string {
//     // Generate specific callout content
//     const materialCallouts = data.tech_pack.materials.map((m, i) => `${i + 1}→${m.component}`).join(", ");

//     const hardwareCallouts = data.tech_pack.hardwareComponents.hardware
//       .map((h, i) => `${String.fromCharCode(65 + i)}→${h}`)
//       .join(", ");

//     const constructionCallouts = data.tech_pack.constructionDetails.constructionFeatures
//       .map((f, i) => `C${i + 1}→${f.featureName}`)
//       .join(", ");

//     return `Technical specification drawing of ${data.tech_pack.productName} with comprehensive callout system:

//        REQUIRED CALLOUTS AND ARROWS:
//        • Material identification: ${materialCallouts}
//        • Hardware/components: ${hardwareCallouts}
//        • Construction details: ${constructionCallouts}
//        • Surface treatments: patterns, textures, finishes, logos
//        • Functional zones: user interaction areas, operational elements

//            IMPORTANT - DO NOT ADD:
//     • NO letter indicators or markers
//     • NO measurements or dimension lines
//     • NO text labels or annotations
//     • NO arrows or callouts
//     • Just the clean technical drawing

//        Professional technical drawing with clean drawing no text and outline on image,
//        and comprehensive identification system for ${data.tech_pack.category_Subcategory}.`;
//   }

//   private buildCleanTechnicalDrawingPrompt(data: TechPackData): string {
//     const productName = data.tech_pack?.productName || "product";
//     const hasLogo = !!this.getLogoImage(data);
//     const logoInstructions = hasLogo ? "\nInclude the brand logo in its appropriate position." : "";

//     return `Create a professional technical specification drawing of ${productName}.

//     REQUIREMENTS:
//     • Show the complete ${productName} clearly from the best angle
//     • Display all major components and construction details
//     • Use clean, precise black line art on white background
//     • Show proper proportions and scale
//     • Include all visible hardware, seams, and construction features${logoInstructions}

//     IMPORTANT - DO NOT ADD:
//     • NO letter indicators or markers
//     • NO measurements or dimension lines
//     • NO text labels or annotations
//     • NO arrows or callouts
//     • Just the clean technical drawing

//     Style: Professional manufacturing technical drawing, suitable for component analysis.`;
//   }

//   private buildScaleProportionPrompt(data: TechPackData): string {
//     const componentCount = data.tech_pack.materials.length;
//     const hasHardware = data.tech_pack.hardwareComponents.hardware.length > 0;

//     return `Technical scale diagram of ${data.tech_pack.productName} with proportional accuracy:

//        SCALE & PROPORTION ELEMENTS:
//        • Accurate proportional relationships between all ${componentCount} components
//        • Professional ruler scale or measurement grid overlay
//        • Scale ratio indicator and measurement reference legend
//        • True-to-scale hardware and functional elements${hasHardware ? " with proper sizing" : ""}
//        • Proportional representation maintaining size relationships

//        Show professional scale reference system with ruler overlay, accurate proportions,
//        scale legend, and measurement grid for ${data.tech_pack.category_Subcategory}.
//        Include scale ratio indicator and dimensional accuracy markers.`;
//   }
// }

// export default async function generateTechnicalSpecSheets(
//   techPackData: TechPackData,
//   options: ImageGenerationOptions = {}
// ) {
//   const service = new TechPackImageService();
//   return await service.generateAllImages(techPackData, options);
// }
