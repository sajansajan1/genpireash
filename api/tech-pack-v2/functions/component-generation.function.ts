/**
 * Component Image Generation Function
 * Generates visual images of individual product components/ingredients with detailed guides
 * Similar to closeup generation but focused on isolated component visualization
 */

"use server";

import { getOpenAIClient } from "@/lib/ai";
import { getGeminiService } from "@/lib/ai/gemini";
import { uploadImage } from "@/lib/services/image-service";
import { createClient } from "@/lib/supabase/server";
import { COMPONENT_ANALYSIS_PLAN_PROMPT } from "../prompts/components/generate-component-plan.prompt";
import { COMPONENT_SUMMARY_GENERATION_PROMPT } from "../prompts/components/generate-component-summary.prompt";
import { AI_MODELS_CONFIG } from "../config/models.config";
import { calculateBase64Hash } from "../utils/image-hash";
import { createTechFile } from "../tech-files-service";

/**
 * Generate component visualization plan
 * @param productCategory Product category
 * @param baseViewAnalysis Base view analysis data (JSON string)
 * @param productContext Product context (name, description, conversation)
 * @returns Component shots plan with image generation prompts
 */
async function generateComponentPlan(
  productCategory: string,
  baseViewAnalysis: string,
  productContext: string
): Promise<any> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: COMPONENT_ANALYSIS_PLAN_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: COMPONENT_ANALYSIS_PLAN_PROMPT.userPromptTemplate(
          productCategory,
          baseViewAnalysis,
          productContext
        ),
      },
    ],
    max_tokens: 3072,
    temperature: 0.6,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No component plan generated");
  }

  return JSON.parse(content);
}

/**
 * Analyze a generated component image to create detailed guide
 * @param productCategory Product category
 * @param componentName Component name
 * @param componentImageUrl URL of the generated component image
 * @param productAnalysis Product analysis context
 * @param approvedDimensions Optional approved dimensions to enforce
 * @returns Detailed component guide
 */
async function analyzeComponentImage(
  productCategory: string,
  componentName: string,
  componentImageUrl: string,
  productAnalysis: any,
  approvedDimensions?: any
): Promise<any> {
  const openai = getOpenAIClient();

  // Build dimensions instruction if approved dimensions exist
  let dimensionsInstruction = "";
  if (approvedDimensions) {
    const dims = approvedDimensions.user || approvedDimensions.recommended;
    if (dims) {
      const dimList: string[] = [];
      if (dims.width) dimList.push(`Product Width: ${dims.width.value} ${dims.width.unit}`);
      if (dims.height) dimList.push(`Product Height: ${dims.height.value} ${dims.height.unit}`);
      if (dims.length) dimList.push(`Product Depth: ${dims.length.value} ${dims.length.unit}`);

      if (dims.additionalDimensions && Array.isArray(dims.additionalDimensions)) {
        dims.additionalDimensions.forEach((dim: any) => {
          if (dim.name && dim.value && dim.unit) {
            dimList.push(`${dim.name}: ${dim.value} ${dim.unit}`);
          }
        });
      }

      if (dimList.length > 0) {
        dimensionsInstruction = `\n\n⚠️ APPROVED PRODUCT DIMENSIONS (use for scale reference):\n${dimList.join('\n')}`;
      }
    }
  }

  const basePrompt = COMPONENT_SUMMARY_GENERATION_PROMPT.userPromptTemplate(
    productCategory,
    componentName,
    componentImageUrl,
    productAnalysis
  );

  const response = await openai.chat.completions.create({
    model: AI_MODELS_CONFIG.VISION_MODEL.name,
    messages: [
      {
        role: "system",
        content: COMPONENT_SUMMARY_GENERATION_PROMPT.systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: basePrompt + dimensionsInstruction,
          },
          {
            type: "image_url",
            image_url: {
              url: componentImageUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 3072,
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No component analysis generated");
  }

  return JSON.parse(content);
}

/**
 * Generate component images with detailed guides
 * @param productId Product ID
 * @param productCategory Product category
 * @param baseViews Array of base view analyses with revision IDs and reference images
 * @param userId User ID
 * @returns Array of generated component images with guides
 */
export async function generateComponentImages(
  productId: string,
  productCategory: string,
  baseViews: Array<{
    revisionId: string;
    viewType: string;
    imageUrl: string;
    analysisData: any;
  }>,
  userId: string
): Promise<
  Array<{
    analysisId: string;
    componentName: string;
    componentType: string;
    imageUrl: string;
    thumbnailUrl?: string;
    guide: any;
  }>
> {
  const supabase = await createClient();
  const gemini = getGeminiService();

  try {
    console.log(
      `[Component Generation] Starting for product ${productId} with ${baseViews.length} base views`
    );

    const batchId = `components-${Date.now()}`;
    const primaryRevisionId = baseViews[0]?.revisionId || null;

    // Build comprehensive base view analysis summary
    const baseViewSummary = baseViews.map((view) => ({
      view_type: view.viewType,
      image_url: view.imageUrl,
      analysis: view.analysisData,
    }));

    const baseViewAnalysisString = JSON.stringify(baseViewSummary, null, 2);

    // Collect ALL reference images (front, back, side views)
    const referenceImages: string[] = baseViews.map((v) => v.imageUrl);
    console.log(
      `[Component Generation] Using ${referenceImages.length} reference images`
    );

    // Fetch product context for enriched analysis (including dimensions and materials)
    const { data: productIdea } = await supabase
      .from("product_ideas")
      .select("name, description, initial_prompt, product_dimensions, product_materials")
      .eq("id", productId)
      .single();

    // Fetch revision created_at to filter conversation history
    const { data: revision } = await supabase
      .from("product_multiview_revisions")
      .select("created_at")
      .eq("id", primaryRevisionId || baseViews[0]?.revisionId)
      .single();

    // Fetch conversation history from ai_chat_messages up to revision creation time
    let chatMessagesQuery = supabase
      .from("ai_chat_messages")
      .select("role, content, created_at")
      .eq("product_idea_id", productId)
      .order("created_at", { ascending: true });

    if (revision?.created_at) {
      chatMessagesQuery = chatMessagesQuery.lte(
        "created_at",
        revision.created_at
      );
    }

    const { data: chatMessages } = await chatMessagesQuery;

    // Build product context string
    let productContext = "";
    if (productIdea) {
      productContext =
        "\n\n📋 PRODUCT CONTEXT (use this to inform your component identification):\n";

      if (productIdea.name) {
        productContext += `Product Name: ${productIdea.name}\n`;
      }

      if (productIdea.description) {
        productContext += `Product Description: ${productIdea.description}\n`;
      }

      if (productIdea.initial_prompt) {
        productContext += `Original User Request: ${productIdea.initial_prompt}\n`;
      }

      // Add product dimensions if available
      if (productIdea.product_dimensions) {
        const dims = productIdea.product_dimensions;
        productContext += `\n📐 PRODUCT DIMENSIONS (Market Standard - ${dims.productType || 'Standard'}):\n`;

        const recommended = dims.user || dims.recommended;
        if (recommended) {
          if (recommended.height) productContext += `- Height: ${recommended.height.value} ${recommended.height.unit}\n`;
          if (recommended.width) productContext += `- Width: ${recommended.width.value} ${recommended.width.unit}\n`;
          if (recommended.length) productContext += `- Length/Depth: ${recommended.length.value} ${recommended.length.unit}\n`;
          if (recommended.weight) productContext += `- Weight: ${recommended.weight.value} ${recommended.weight.unit}\n`;
          if (recommended.volume) productContext += `- Volume: ${recommended.volume.value} ${recommended.volume.unit}\n`;

          if (recommended.additionalDimensions && recommended.additionalDimensions.length > 0) {
            recommended.additionalDimensions.forEach((dim: any) => {
              productContext += `- ${dim.name}: ${dim.value} ${dim.unit}${dim.description ? ` (${dim.description})` : ''}\n`;
            });
          }
        }

        if (dims.marketStandard) {
          productContext += `Market Standard: ${dims.marketStandard}\n`;
        }
      }

      // Add product materials if available
      if (productIdea.product_materials) {
        const mats = productIdea.product_materials;
        const materials = mats.user || mats.recommended;
        if (materials && Array.isArray(materials) && materials.length > 0) {
          productContext += `\n🧵 PRODUCT MATERIALS (Approved Specifications):\n`;
          materials.forEach((mat: any, idx: number) => {
            productContext += `${idx + 1}. ${mat.component}: ${mat.material}`;
            if (mat.specification) productContext += ` - ${mat.specification}`;
            if (mat.color) productContext += ` (${mat.color})`;
            if (mat.finish) productContext += ` [${mat.finish}]`;
            productContext += `\n`;
          });
        }
      }

      if (chatMessages && chatMessages.length > 0) {
        productContext += `\nUser Conversation History (up to this revision):\n`;

        const userMessages = chatMessages
          .filter((msg) => msg.role === "user")
          .slice(-5);

        userMessages.forEach((msg, idx) => {
          if (msg.content) {
            const truncatedContent =
              msg.content.length > 200
                ? `${msg.content.substring(0, 200)}...`
                : msg.content;
            productContext += `${idx + 1}. User: ${truncatedContent}\n`;
          }
        });
      }

      productContext +=
        "\n⚠️ IMPORTANT: Use this context to identify accurate components that align with the user's intent and product vision.\n";
    }

    // Step 1: Generate component plan (which components to visualize)
    console.log("[Component Generation] Generating component plan...");
    const componentPlan = await generateComponentPlan(
      productCategory,
      baseViewAnalysisString,
      productContext
    );

    console.log(
      `[Component Generation] Plan generated with ${componentPlan.component_shots?.length || 0} components to visualize`
    );

    // Step 2: Generate image for each component
    const results = [];
    const componentShots = componentPlan.component_shots || [];

    // Build explicit dimensions instruction for components
    let explicitDimensionsInstruction = "";
    if (productIdea?.product_dimensions) {
      const dims = productIdea.product_dimensions;
      const recommended = dims.user || dims.recommended;
      if (recommended) {
        const dimParts: string[] = [];
        if (recommended.width) dimParts.push(`Product Width: ${recommended.width.value} ${recommended.width.unit}`);
        if (recommended.height) dimParts.push(`Product Height: ${recommended.height.value} ${recommended.height.unit}`);
        if (recommended.length) dimParts.push(`Product Depth: ${recommended.length.value} ${recommended.length.unit}`);

        if (recommended.additionalDimensions && Array.isArray(recommended.additionalDimensions)) {
          recommended.additionalDimensions.forEach((dim: any) => {
            if (dim.name && dim.value && dim.unit) {
              dimParts.push(`${dim.name}: ${dim.value} ${dim.unit}`);
            }
          });
        }

        if (dimParts.length > 0) {
          explicitDimensionsInstruction = `\n\nPRODUCT DIMENSIONS (for scale reference):\n${dimParts.join('\n')}`;
        }
      }
    }

    // Limit to maximum 3 component shots - take the most important ones by priority
    const maxComponents = 3;
    const limitedComponentShots = componentShots
      .sort((a: any, b: any) => (a.priority || 99) - (b.priority || 99))
      .slice(0, maxComponents);

    console.log(`[Component Generation] Limiting to ${limitedComponentShots.length} components (from ${componentShots.length} planned)`);

    for (let i = 0; i < limitedComponentShots.length; i++) {
      const shot = limitedComponentShots[i];

      try {
        console.log(
          `[Component Generation] Generating image ${i + 1}/${limitedComponentShots.length}: ${shot.component_name}`
        );

        // Use primary reference image (front view first)
        const primaryReferenceImage = referenceImages[0] || undefined;

        // Generate component image using Gemini
        const enhancedPrompt = `${shot.image_generation_prompt}${explicitDimensionsInstruction}\n\nSTYLE: Professional product photography, isolated component view, clean white background, high detail, factory documentation quality. This component is from the product shown in the reference image.\n\nAVOID: ${shot.negative_prompt || "blurry, low quality, distorted, watermark, text, cluttered background"}`;

        const generatedImage = await gemini.generateImage({
          prompt: enhancedPrompt,
          referenceImage: primaryReferenceImage,
          options: {
            retry: 3,
            enhancePrompt: false,
            fallbackEnabled: true,
            model: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL.name, // Use flash model for component images
          },
        });

        // Convert data URL to buffer
        const base64Data = generatedImage.url.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to storage
        const uploadResult = await uploadImage(buffer, {
          projectId: productId,
          preset: "highQuality",
          generateThumbnail: true,
        });

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(
            `Failed to upload component image: ${shot.component_name}`
          );
        }

        console.log(
          `[Component Generation] Image uploaded: ${uploadResult.url}`
        );

        // Step 3: Analyze the generated component image with approved dimensions
        console.log(
          `[Component Generation] Analyzing component: ${shot.component_name}`
        );
        const componentGuide = await analyzeComponentImage(
          productCategory,
          shot.component_name,
          uploadResult.url,
          {
            base_views: baseViewSummary,
            product_context: productContext,
          },
          productIdea?.product_dimensions // Pass approved dimensions to enforce in guide
        );

        // Store component image and guide in tech_files
        const imageHash = calculateBase64Hash(base64Data);

        const techFile = await createTechFile({
          product_idea_id: productId,
          user_id: userId,
          revision_id: primaryRevisionId,
          file_type: "component",
          file_category: shot.component_type || "material",
          view_type: null, // Components are not view-specific
          file_url: uploadResult.url,
          thumbnail_url: uploadResult.thumbnailUrl,
          file_format: "png",
          analysis_data: {
            category: "component_image",
            component_shot: shot,
            component_guide: componentGuide,
            shot_number: shot.shot_number,
            priority: shot.priority,
            critical_for_manufacturing: shot.critical_for_manufacturing,
          },
          metadata: {
            image_hash: imageHash,
            component_name: shot.component_name,
            component_type: shot.component_type,
          },
          generation_batch_id: batchId,
          ai_model_used: AI_MODELS_CONFIG.IMAGE_GENERATION_MODEL.name,
          generation_prompt: shot.image_generation_prompt,
          confidence_score: 0.85,
          status: "completed",
          credits_used: 1, // Each component costs 1 credit
        });

        results.push({
          analysisId: techFile.id,
          componentName: shot.component_name,
          componentType: shot.component_type,
          imageUrl: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          guide: componentGuide,
        });

        console.log(
          `[Component Generation] Component ${i + 1}/${componentShots.length} completed`
        );
      } catch (error) {
        console.error(
          `[Component Generation] Failed to generate ${shot.component_name}:`,
          error
        );
        // Continue with other components even if one fails
      }
    }

    console.log(
      `[Component Generation] Completed. Generated ${results.length} component images.`
    );

    return results;
  } catch (error) {
    console.error("[Component Generation] Failed:", error);
    throw error;
  }
}
