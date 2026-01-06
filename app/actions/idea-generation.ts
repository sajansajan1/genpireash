"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
// import { deleteOldImages } from "@/lib/supabase/productIdea"; // Unused - preserved for potential future use
import { imageService, safeUpload, type IMAGE_PRESETS } from "@/lib/services/image-service";
import { v4 as uuidv4 } from "uuid";
import {
  GenerateTechPackPrompt,
  GenerateTechPackFromImagePrompt,
  UpdateTechPackSectionPrompt,
} from "@/lib/utils/prompts";
import { aiLogger } from "@/lib/logging/ai-logger";
import { parseJSONSafely, validateTechPackStructure } from "@/lib/utils/json-repair";
// Import Progressive workflow (ONLY workflow for image generation)
import {
  generateFrontViewOnly,
  handleFrontViewDecision,
  generateRemainingViews,
} from "@/app/actions/progressive-generation-workflow";
// Import function to create initial revision for new products
import { createInitialProductRevision } from "./create-initial-product-revision";

// Keep OpenAI for text generation (tech pack content)
function getOpenAIClient() {
  if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server");
  }
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });
}

type GenerateIdeaParams = {
  user_prompt: string;
  existing_project_id?: string;
  regenerate_image_only?: boolean;
  regenerate_techpack_only?: boolean;
  sectionToUpdate?: keyof TechPack & string;
  category?: string;
  intended_use?: string;
  style_keywords?: string[];
  image?: string | null;
  designFile?: string | null;
  selected_colors?: string[];
  product_goal?: string;
  generateMoreImages?: boolean;
  updated_images?: any; // For preserving images when regenerating tech pack
  selected_revision_id?: string; // 🆕 For fetching tech files specific to a revision
};

type GenerateIdeaResponse = {
  success: boolean;
  error?: string;
  techpack?: any;
  project_id?: string;
  image?: {
    front: {
      url: string;
      prompt_used: string;
      regenerated: boolean;
    };
    side?: {
      url: string;
      prompt_used: string;
      regenerated: boolean;
    };
    back: {
      url: string;
      prompt_used: string;
      regenerated: boolean;
    };
    top?: {
      url: string;
      prompt_used: string;
      regenerated: boolean;
    };
    bottom?: {
      url: string;
      prompt_used: string;
      regenerated: boolean;
    };
    illustration?: {
      url: string;
      prompt_used: string;
      regenerated: boolean;
    };
  };
};
type TechPack = any;
const getGoalDescription = (goalValue: string): string => {
  const goals = {
    "commercial-large": "Commercial Use - Large Order",
    "commercial-sample": "Commercial Use - Sample",
    "personal-large": "Personal Use - Large Order",
    "personal-sample": "Personal Use - Sample",
    "home-large": "Home Use - Large Order",
    "home-sample": "Home Use - Sample",
  };
  return goals[goalValue as keyof typeof goals] || "Not specified";
};

async function saveImageToSupabase(dataUrl: string, fileName: string) {
  // Use optimized upload function with standard preset
  return optimizeAndUploadImage(dataUrl, fileName, {
    preset: "standard",
  });
}

async function generateTechPack(
  prompt: string,
  selected_colors: string[],
  product_goal: string,
  image?: string
): Promise<TechPack> {
  // Initialize logger for this operation
  const logger = aiLogger.startOperation("generateTechPack", "gpt-4o", "openai", "text_generation");

  try {
    const openai = getOpenAIClient();
    const systemPrompt = GenerateTechPackPrompt("");
    const productGoalDescription = getGoalDescription(product_goal);
    const userPrompt = `
      Product Idea: "${prompt}"

      Product Goal: "${productGoalDescription}"

      Create a tech pack for this product using the following colors: ${selected_colors.join(", ")}.`;

    // Log input
    logger.setInput({
      prompt: userPrompt,
      system_prompt: systemPrompt,
      parameters: {
        temperature: 0.7,
        max_tokens: 2500,
      },
      metadata: {
        product_goal: productGoalDescription,
        selected_colors,
        original_prompt: prompt,
      },
    });

    // Get current user context if available
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      logger.setContext({
        user_id: user.id,
        feature: "tech_pack_generation",
      });
    }

    console.log("Generating tech pack with GPT-4o...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const responseContent = completion.choices[0].message.content;

    // Log usage information
    if (completion.usage) {
      logger.setUsage({
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      });
    }

    if (!responseContent) {
      throw new Error("No content in AI response");
    }

    if (responseContent) {
      try {
        // Use the robust JSON parser
        const parsedContent = parseJSONSafely(responseContent);

        // Validate it has tech pack structure
        if (!validateTechPackStructure(parsedContent)) {
          console.warn("Parsed JSON doesn't appear to be a valid tech pack, but continuing anyway");
        }

        // Ensure category fields exist
        if (!parsedContent.category && !parsedContent.category_Subcategory) {
          console.log("🏷️ Text-based tech pack missing category, inferring...");
          const { normalizeCategory } = await import("@/lib/constants/product-categories");
          const productName = (parsedContent.productName || prompt || "").toLowerCase();
          const inferredCategory = normalizeCategory(productName);
          parsedContent.category = inferredCategory;
          parsedContent.category_Subcategory = `${inferredCategory.charAt(0).toUpperCase() + inferredCategory.slice(1)} → ${parsedContent.productName || 'Product'}`;
          console.log("🏷️ Inferred category for text-based tech pack:", parsedContent.category);
        }

        // Log successful output
        logger.setOutput({
          content: responseContent,
          usage: completion.usage
            ? {
                prompt_tokens: completion.usage.prompt_tokens,
                completion_tokens: completion.usage.completion_tokens,
                total_tokens: completion.usage.total_tokens,
              }
            : undefined,
        });

        await logger.complete();
        console.log("✅ Tech pack generated successfully", {
          sections: Object.keys(parsedContent),
          sectionCount: Object.keys(parsedContent).length,
        });
        console.log("🖼️ === END generateTechPackFromImage ===");
        return parsedContent;
      } catch (parseError) {
        console.error("Error parsing GPT response after all repair attempts:", parseError);

        // Log the failed attempt
        logger.setOutput({
          content: responseContent,
          usage: completion.usage
            ? {
                prompt_tokens: completion.usage.prompt_tokens,
                completion_tokens: completion.usage.completion_tokens,
                total_tokens: completion.usage.total_tokens,
              }
            : undefined,
          raw_response: {
            parse_error: (parseError as Error).message,
            content_preview: responseContent.substring(0, 500),
          },
        });

        await logger.complete();

        // Return a minimal tech pack structure as fallback
        console.warn("Using fallback minimal tech pack structure");
        const fallbackTechPack = {
          productName: "Product",
          productDescription: "AI-generated product design",
          targetAudience: "General consumers",
          materials: ["Premium materials as specified"],
          colors: ["As shown in design"],
          sizes: ["Standard sizes"],
          features: ["High-quality construction", "Modern design"],
          category: "other",
          category_Subcategory: "Other → Product",
          error: "Failed to parse complete tech pack data - using minimal structure",
        };

        return fallbackTechPack;
      }
    } else {
      throw new Error("No response from AI");
    }
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    logger.setError(error);
    await logger.complete();
    throw new Error("AI service error");
  }
}

// This function is no longer used - we preserve the existing tech pack when only images are updated
// Keeping it commented out in case we need image-based tech pack analysis in the future
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateTechPackFromUpdatedImages_UNUSED(
  imageData: any,
  existingTechPack: TechPack,
  editDescription?: string
): Promise<TechPack> {
  // Initialize logger for updated image analysis
  const logger = aiLogger.startOperation("generateTechPackFromUpdatedImages", "gpt-4o", "openai", "vision_analysis");

  try {
    const openai = getOpenAIClient();

    // Create image URLs array from imageData
    const imageUrls: string[] = [];
    if (imageData.front?.url) imageUrls.push(imageData.front.url);
    if (imageData.back?.url) imageUrls.push(imageData.back.url);
    if (imageData.side?.url) imageUrls.push(imageData.side.url);

    const systemPrompt = `You are a professional fashion tech pack specialist with 10+ years of experience in technical design and garment manufacturing.

Your task is to analyze the product images and create a COMPLETE tech pack that accurately reflects what you see.

CRITICAL REQUIREMENTS:
1. Base ALL content on what you actually see in the images
2. Generate appropriate content for the specific product type
3. **EVERY FIELD MUST BE POPULATED** - no empty strings, nulls, or undefined values
4. **ALL NESTED OBJECTS MUST BE COMPLETE** - include all sub-properties
5. Make the content specific and detailed - NO GENERIC PLACEHOLDERS
6. If a field is not visible in the image, make a reasonable inference based on product type
7. Use realistic values for all measurements, prices, and quantities

REQUIRED JSON STRUCTURE (all fields MUST be present and populated with realistic, detailed content):
{
  "productName": "Specific product name based on what you see",
  "productOverview": "Comprehensive overview describing the product in detail (at least 3-4 sentences)",
  "price": "$XX.XX - Realistic retail price based on perceived quality and materials",
  "estimatedLeadTime": "X-Y weeks",
  "careInstructions": "Detailed care instructions appropriate for the materials",
  "qualityStandards": [
    {"aspect": "Material Quality", "requirement": "Specific requirement", "testMethod": "Testing method"},
    {"aspect": "Construction", "requirement": "Specific requirement", "testMethod": "Testing method"},
    {"aspect": "Durability", "requirement": "Specific requirement", "testMethod": "Testing method"}
  ],
  "productionNotes": "Detailed production notes and special instructions",
  "materials": [
    {
      "component": "Main Body/Primary Component",
      "material": "Specific material name and composition",
      "unitCost": "$X.XX per unit/yard",
      "notes": "Special notes about this material",
      "specification": "Weight, texture, or other specs"
    }
  ],
  "colors": {
    "palette": [
      {"name": "Color name", "hex": "#XXXXXX", "type": "primary"},
      {"name": "Color name", "hex": "#XXXXXX", "type": "accent"}
    ]
  },
  "sizeRange": {
    "sizes": ["XS", "S", "M", "L", "XL"],
    "description": "Sizing notes and fit description"
  },
  "dimensions": {
    "measurements": [
      {
        "XS": {"chest": "XX\"", "waist": "XX\"", "hip": "XX\"", "length": "XX\""},
        "S": {"chest": "XX\"", "waist": "XX\"", "hip": "XX\"", "length": "XX\""},
        "M": {"chest": "XX\"", "waist": "XX\"", "hip": "XX\"", "length": "XX\""},
        "L": {"chest": "XX\"", "waist": "XX\"", "hip": "XX\"", "length": "XX\""},
        "XL": {"chest": "XX\"", "waist": "XX\"", "hip": "XX\"", "length": "XX\""}
      }
    ]
  },
  "constructionDetails": {
    "description": "Overall construction method and quality details",
    "constructionFeatures": [
      {"featureName": "Feature 1", "details": "Specific details"},
      {"featureName": "Feature 2", "details": "Specific details"},
      {"featureName": "Feature 3", "details": "Specific details"}
    ]
  },
  "hardwareComponents": {
    "description": "Description of hardware elements",
    "hardware": ["Component 1", "Component 2", "Component 3"]
  },
  "packaging": {
    "description": "Packaging overview and presentation",
    "packagingDetails": {
      "type": "Box/Bag/Wrapper",
      "materials": "Specific materials used",
      "dimensions": "L x W x H",
      "branding": "Logo placement and design",
      "sustainability": "Eco-friendly aspects"
    }
  }
}

IMPORTANT: Adapt all fields to match the actual product type. For example:
- For a bag: use dimensions like height/width/depth, not chest/waist
- For accessories: use appropriate measurements, not clothing sizes
- For home goods: use relevant specifications, not garment construction

Return ONLY the JSON object without any markdown formatting or explanations.`;

    const userContent: any[] = [
      {
        type: "text",
        text: `${
          editDescription
            ? `Context: These product images are the result of applying the following edit: "${editDescription}"\n\n`
            : ""
        }

EXISTING TECH PACK DATA TO PRESERVE:
${JSON.stringify(
  {
    colors: existingTechPack.colors,
    dimensions: existingTechPack.dimensions,
    sizeRange: existingTechPack.sizeRange,
    materials: existingTechPack.materials,
  },
  null,
  2
)}

Please analyze these product images and UPDATE the tech pack while PRESERVING the above existing data.

INSTRUCTIONS:
1. Carefully examine ALL views of the product (front, back, side)
2. Identify the product type, style, and category
3. Update the tech pack based on visual changes in the images
4. **CRITICAL: PRESERVE the existing colors, dimensions, sizeRange, and materials data shown above**
5. Only update fields that are visually different in the new images

GENERATE A COMPLETE TECH PACK with ALL fields populated:
- **productName**: Update based on what you see
- **productOverview**: Update description based on visual changes
- **price**: Keep existing or update if quality appears different
- **estimatedLeadTime**: Keep existing
- **careInstructions**: Keep existing unless materials appear different
- **qualityStandards**: Update based on visible quality
- **productionNotes**: Update based on visible construction changes
- **materials**: **PRESERVE EXISTING DATA** unless materials visibly changed
- **colors**: **MUST PRESERVE EXISTING COLOR DATA - DO NOT CHANGE**
- **sizeRange**: **MUST PRESERVE EXISTING SIZE DATA - DO NOT CHANGE**
- **dimensions**: **MUST PRESERVE EXISTING DIMENSIONS - DO NOT CHANGE**
- **constructionDetails**: Update based on visible construction
- **hardwareComponents**: Update based on visible hardware
- **packaging**: Keep existing unless packaging is visible

The tech pack should be production-ready with ALL fields populated with meaningful, detailed content.
DO NOT leave any field empty or with placeholder text.

CRITICAL REQUIREMENTS:
1. The colors field MUST contain the exact same data as shown in "EXISTING TECH PACK DATA TO PRESERVE"
2. The dimensions field MUST contain the exact same data as shown in "EXISTING TECH PACK DATA TO PRESERVE"
3. The sizeRange field MUST contain the exact same data as shown in "EXISTING TECH PACK DATA TO PRESERVE"
4. The materials field SHOULD be preserved unless you see clear visual evidence of different materials

Return ONLY a valid JSON object with ALL fields properly filled, preserving the critical data as instructed.

DO NOT include any markdown formatting, code blocks, or explanations - just the raw JSON.`,
      },
    ];

    // Add all available images
    imageUrls.forEach((url) => {
      userContent.push({
        type: "image_url",
        image_url: {
          url: url,
          detail: "high",
        },
      });
    });

    logger.setInput({
      prompt: userContent[0].text,
      system_prompt: systemPrompt,
      image_url: imageUrls[0], // Use first image for logging
      parameters: {
        max_tokens: 4000,
        temperature: 0.7,
      },
      metadata: {
        edit_description: editDescription,
        num_images: imageUrls.length,
        all_image_urls: imageUrls,
      },
    });

    console.log("Analyzing updated images to regenerate tech pack...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI");
    }

    // Parse the response
    let jsonContent = responseContent;
    const codeBlockMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1].trim();
    }

    try {
      const updatedTechPack = JSON.parse(jsonContent);

      // Log what fields were provided in the update
      console.log("Tech pack update - Fields provided:", {
        hasColors: !!updatedTechPack.colors,
        hasDimensions: !!updatedTechPack.dimensions,
        hasMaterials: !!updatedTechPack.materials,
        hasSizeRange: !!updatedTechPack.sizeRange,
      });

      // Log the actual content received
      console.log("Tech pack update - Received content:", {
        colors: updatedTechPack.colors,
        dimensions: updatedTechPack.dimensions ? Object.keys(updatedTechPack.dimensions).join(", ") : "none",
        sizeRange: updatedTechPack.sizeRange,
        materials: updatedTechPack.materials?.length || 0,
      });

      // Deep merge with existing tech pack to preserve fields not regenerated
      // Preserve critical fields if not provided in the update
      const mergedTechPack = {
        ...existingTechPack,
        ...updatedTechPack,
        // Explicitly preserve colors if not in update or if update is empty
        colors:
          updatedTechPack.colors &&
          (Array.isArray(updatedTechPack.colors)
            ? updatedTechPack.colors.length > 0
            : updatedTechPack.colors.palette && updatedTechPack.colors.palette.length > 0)
            ? updatedTechPack.colors
            : existingTechPack.colors,
        // Explicitly preserve dimensions if not in update
        dimensions:
          updatedTechPack.dimensions && (updatedTechPack.dimensions.measurements || updatedTechPack.dimensions.details)
            ? updatedTechPack.dimensions
            : existingTechPack.dimensions,
        // Preserve materials if not in update
        materials:
          updatedTechPack.materials && updatedTechPack.materials.length > 0
            ? updatedTechPack.materials
            : existingTechPack.materials,
        // Preserve sizeRange if not in update
        sizeRange: updatedTechPack.sizeRange || existingTechPack.sizeRange,
      };

      // Ensure critical nested structures exist to prevent runtime errors
      if (mergedTechPack.constructionDetails) {
        if (!mergedTechPack.constructionDetails.constructionFeatures) {
          mergedTechPack.constructionDetails.constructionFeatures = [];
        }
      }

      // Ensure dimensions structure matches expected format
      if (mergedTechPack.dimensions) {
        if (!mergedTechPack.dimensions.measurements && mergedTechPack.dimensions.details) {
          // Convert details array to measurements format if needed
          mergedTechPack.dimensions.measurements = mergedTechPack.dimensions.details;
        }
      }

      // Ensure packaging.packagingDetails exists
      if (mergedTechPack.packaging && !mergedTechPack.packaging.packagingDetails) {
        mergedTechPack.packaging.packagingDetails = {};
      }

      // Ensure colors has the correct structure
      if (mergedTechPack.colors && Array.isArray(mergedTechPack.colors)) {
        // If colors is an array, convert to palette structure
        mergedTechPack.colors = {
          palette: mergedTechPack.colors,
        };
      }

      // Ensure sizeRange has the correct structure
      if (mergedTechPack.sizeRange && Array.isArray(mergedTechPack.sizeRange)) {
        // If sizeRange is an array, convert to object structure
        mergedTechPack.sizeRange = {
          sizes: mergedTechPack.sizeRange,
          description: "Standard sizing",
        };
      }

      logger.setOutput({
        content: responseContent,
        usage: completion.usage
          ? {
              prompt_tokens: completion.usage.prompt_tokens,
              completion_tokens: completion.usage.completion_tokens,
              total_tokens: completion.usage.total_tokens,
            }
          : undefined,
      });

      // Log what was preserved
      console.log("Tech pack merge complete - Preserved fields:", {
        colorsPreserved: mergedTechPack.colors === existingTechPack.colors,
        dimensionsPreserved: mergedTechPack.dimensions === existingTechPack.dimensions,
        materialsPreserved: mergedTechPack.materials === existingTechPack.materials,
        sizeRangePreserved: mergedTechPack.sizeRange === existingTechPack.sizeRange,
      });

      await logger.complete();
      console.log("Tech pack regenerated successfully with updated images");
      return mergedTechPack;
    } catch (parseError) {
      console.error("Error parsing updated tech pack:", parseError);
      logger.setError("Failed to parse JSON response");
      await logger.complete();
      throw new Error("Failed to parse updated tech pack JSON from AI.");
    }
  } catch (error: any) {
    console.error("Error regenerating tech pack:", error);
    logger.setError(error);
    await logger.complete();
    throw error;
  }
}

// Helper function to optimize image for AI analysis using centralized service
async function optimizeImageForAnalysis(imageUrl: string): Promise<string> {
  try {
    // If it's already a data URL, check its size
    if (imageUrl.startsWith("data:image")) {
      const base64Data = imageUrl.split(",")[1];
      const sizeInBytes = (base64Data.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      // If image is larger than 5MB, optimize it
      if (sizeInMB > 5) {
        console.log(`Image size ${sizeInMB.toFixed(2)}MB is too large, optimizing...`);
        const optimizedBuffer = await imageService.optimize(imageUrl, "aiAnalysis");
        return `data:image/jpeg;base64,${optimizedBuffer.toString("base64")}`;
      }
      return imageUrl;
    }

    // For URLs, return them as-is for OpenAI to fetch directly
    // This avoids base64 encoding which increases token usage significantly
    if (imageUrl.startsWith("http")) {
      console.log("Using URL directly for OpenAI vision API (no base64 conversion)");
      return imageUrl;
    }

    return imageUrl;
  } catch (error) {
    console.error("Error in image optimization:", error);
    return imageUrl; // Return original if optimization fails
  }
}

// Helper function to run image analysis with timeout
async function analyzeImageWithTimeout(imageUrl: string, prompt: string, timeoutMs = 30000): Promise<any> {
  const openai = getOpenAIClient();
  const visionPrompt = GenerateTechPackFromImagePrompt(imageUrl);

  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Image analysis timeout")), timeoutMs);
  });

  // Build the user message text - include enrichment context if provided
  // The prompt parameter now contains Factory Specs analysis data (measurements, materials, construction, etc.)
  const userMessageText = prompt && prompt.length > 50
    ? `Here is the Product image to analyze:\n\n${prompt}`
    : "Here is the Product image:";

  console.log("🔧 analyzeImageWithTimeout - Using enriched prompt:", {
    hasEnrichmentData: prompt?.includes("TECHNICAL ANALYSIS DATA"),
    promptLength: prompt?.length || 0,
    promptPreview: prompt?.substring(0, 200) + "..."
  });

  // Create the analysis promise - using gpt-4o for better quality tech pack generation
  const analysisPromise = openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: visionPrompt,
      },
      {
        role: "user",
        content: [
          { type: "text", text: userMessageText },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high", // Use high detail for better tech pack analysis
            },
          },
        ],
      },
    ],
    max_tokens: 5000, // Increased for comprehensive tech pack JSON
  });

  // Race between timeout and analysis
  return Promise.race([analysisPromise, timeoutPromise]);
}

// Background image analysis that doesn't block the user
export async function analyzeImageInBackground(imageUrl: string, projectId: string, metadata?: any): Promise<void> {
  // Run in background - don't await
  (async () => {
    try {
      console.log("Starting background image analysis for project:", projectId);

      // Optimize image
      const optimizedUrl = await optimizeImageForAnalysis(imageUrl);

      // Analyze with timeout
      const analysis = await analyzeImageWithTimeout(optimizedUrl, "", 30000);

      if (analysis && analysis.choices?.[0]?.message?.content) {
        // Store analysis result in database
        const supabase = await createClient();
        const { error } = await supabase
          .from("product_ideas")
          .update({
            image_analysis: {
              content: analysis.choices[0].message.content,
              analyzed_at: new Date().toISOString(),
              metadata: metadata || {},
            },
          })
          .eq("id", projectId);

        if (error) {
          console.error("Failed to store image analysis:", error);
        } else {
          console.log("Background image analysis completed and stored");
        }
      }
    } catch (error) {
      // Log error but don't throw - this is background processing
      console.error("Background image analysis failed (non-blocking):", error);

      // Optionally store error state
      try {
        const supabase = await createClient();
        await supabase
          .from("product_ideas")
          .update({
            image_analysis: {
              error: error instanceof Error ? error.message : "Analysis failed",
              failed_at: new Date().toISOString(),
              metadata: metadata || {},
            },
          })
          .eq("id", projectId);
      } catch (dbError) {
        console.error("Failed to store error state:", dbError);
      }
    }
  })();
}

async function generateTechPackFromImage(imageUrl: string, prompt: string): Promise<TechPack> {
  console.log("🖼️ === START generateTechPackFromImage ===", {
    imageUrl: imageUrl?.substring(0, 100) + "...",
    promptLength: prompt?.length,
    promptStart: prompt?.substring(0, 100),
  });

  // Initialize logger for vision analysis
  const logger = aiLogger.startOperation("generateTechPackFromImage", "gpt-4o", "openai", "vision_analysis");

  try {
    const visionPrompt = GenerateTechPackFromImagePrompt("");

    // Optimize image before analysis
    console.log("🔧 Optimizing image for analysis...");
    const optimizedImageUrl = await optimizeImageForAnalysis(imageUrl);
    console.log("✅ Image optimized:", optimizedImageUrl?.substring(0, 50) + "...");

    // Log input
    logger.setInput({
      prompt: "Here is the Product image:",
      system_prompt: visionPrompt,
      image_url: optimizedImageUrl,
      parameters: {
        max_tokens: 5000,
      },
      metadata: {
        original_prompt: prompt,
        original_image_url: imageUrl,
        optimized: optimizedImageUrl !== imageUrl,
      },
    });

    // Get current user context if available
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      logger.setContext({
        user_id: user.id,
        feature: "image_to_tech_pack",
      });
    }

    console.log("Analyzing image with GPT-4 Vision (with timeout protection)...");

    // Use the timeout-protected analysis with increased timeout
    let completion;
    try {
      // Increase timeout to 120 seconds for better reliability
      completion = await analyzeImageWithTimeout(optimizedImageUrl, prompt, 120000);
      console.log("completion vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv ==> ", completion);
    } catch (timeoutError: any) {
      if (timeoutError.message === "Image analysis timeout") {
        console.error("Image analysis timed out after 60 seconds, trying text-based generation as fallback");
        logger.setError("Image analysis timeout - using text-based fallback");

        // Fallback to text-based generation with the prompt details
        try {
          console.log("Attempting text-based tech pack generation...");
          const textBasedTechPack = await generateTechPack(
            prompt || "Generate a comprehensive tech pack for a product",
            [],
            "",
            undefined
          );

          logger.setOutput(textBasedTechPack);
          await logger.complete();

          console.log("✅ Text-based tech pack generated as fallback");
          console.log("🖼️ === END generateTechPackFromImage (with text fallback) ===");
          return textBasedTechPack;
        } catch (fallbackError) {
          console.error("Text-based fallback also failed:", fallbackError);

          // Last resort: return a basic tech pack
          await logger.complete();
          return {
            productName: "Product",
            productOverview: "Please regenerate the tech pack for detailed information.",
            price: "TBD",
            materials: [
              {
                name: "Primary Material",
                percentage: 100,
                details: "To be specified",
              },
            ],
            colors: { palette: [{ name: "Primary", hex: "#000000" }] },
            dimensions: {
              measurements: [{ type: "Length", value: "Standard", unit: "inches" }],
            },
            sizeRange: {
              sizes: ["S", "M", "L", "XL"],
              description: "Standard sizing - to be customized",
            },
            qualityStandards: ["Industry standard quality"],
            careInstructions: "Standard care instructions apply",
            productionNotes: "Production details to be specified",
            category: "other",
            category_Subcategory: "Other → Product",
          };
        }
      }
      throw timeoutError;
    }

    let extractedDescription = completion.choices[0].message.content?.trim();

    // Log usage
    if (completion.usage) {
      logger.setUsage({
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      });
    }

    if (!extractedDescription) {
      throw new Error("Empty response from OpenAI");
    }

    // Check for content policy refusal - retry with simplified prompt
    const refusalPatterns = [
      "I'm sorry",
      "I cannot",
      "I can't assist",
      "I apologize",
      "I'm not able to",
      "unable to process",
      "cannot help with",
    ];
    const isRefusal = refusalPatterns.some(pattern =>
      extractedDescription.toLowerCase().includes(pattern.toLowerCase())
    ) && !extractedDescription.includes("{");

    if (isRefusal) {
      console.log("⚠️ OpenAI refused initial request, retrying with simplified prompt...");

      // Retry with a minimal, clear prompt
      const openai = getOpenAIClient();
      const simplePrompt = `Analyze this product image and generate a technical specification JSON.
Return ONLY valid JSON with these fields:
{
  "productName": "string",
  "productOverview": "string",
  "materials": [{"component": "string", "material": "string", "specification": "string", "quantityPerUnit": "string", "unitCost": "string"}],
  "dimensions": {"length": {"value": "string"}, "width": {"value": "string"}, "height": {"value": "string"}},
  "colors": {"primaryColors": [{"name": "string", "hex": "#XXXXXX"}]},
  "constructionDetails": {"description": "string", "constructionFeatures": []},
  "hardwareComponents": {"description": "string", "hardware": []},
  "category_Subcategory": "string"
}`;

      try {
        const retryCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a product analyst. Analyze product images and return JSON specifications. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: simplePrompt },
                {
                  type: "image_url",
                  image_url: {
                    url: optimizedImageUrl,
                    detail: "low", // Use low detail for retry
                  },
                },
              ],
            },
          ],
          max_tokens: 3000,
          response_format: { type: "json_object" },
        });

        const retryContent = retryCompletion.choices[0].message.content?.trim();
        if (retryContent && retryContent.includes("{")) {
          console.log("✅ Retry with simplified prompt succeeded");
          // Update both completion and extractedDescription for downstream processing
          completion = retryCompletion;
          extractedDescription = retryContent;
        } else {
          throw new Error("Retry also failed to get valid response");
        }
      } catch (retryError) {
        console.error("❌ Retry with simplified prompt also failed:", retryError);
        // Fall back to text-based generation
        console.log("Falling back to text-based tech pack generation...");
        const textBasedTechPack = await generateTechPack(
          prompt || "Generate a comprehensive tech pack for a product",
          [],
          "",
          undefined
        );
        logger.setOutput(textBasedTechPack);
        await logger.complete();
        console.log("🖼️ === END generateTechPackFromImage (with text fallback after refusal) ===");
        return textBasedTechPack;
      }
    }

    // Try multiple strategies to extract JSON
    let techPackData: any = null;
    let jsonString = "";

    // Strategy 1: Try to find JSON code block (```json ... ```)
    const codeBlockMatch = extractedDescription.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
      console.log("📦 Found JSON in code block");
    } else {
      // Strategy 2: Try to find pure JSON object
      const jsonMatch = extractedDescription.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0].trim();
        console.log("📦 Found raw JSON object");
      }
    }

    if (!jsonString) {
      console.error(
        "❌ OpenAI response does not contain valid JSON. Full response:",
        extractedDescription.substring(0, 500)
      );
      logger.setOutput({
        content: extractedDescription,
        error: "Response does not contain valid JSON",
        usage: completion.usage
          ? {
              prompt_tokens: completion.usage.prompt_tokens,
              completion_tokens: completion.usage.completion_tokens,
              total_tokens: completion.usage.total_tokens,
            }
          : undefined,
      });
      logger.setError("AI did not return valid JSON");
      await logger.complete();
      throw new Error("AI did not return valid JSON. Possibly failed to analyze image.");
    }

    try {
      console.log("🔍 Attempting to parse JSON (length:", jsonString.length, "chars)");

      // Try to parse directly first
      try {
        techPackData = JSON.parse(jsonString);
      } catch (firstParseError: any) {
        console.log("⚠️ Initial parse failed, attempting JSON repair...");
        console.log("Parse error:", firstParseError.message);

        // Common JSON repair strategies
        let repairedJson = jsonString;

        // 1. Remove any markdown code fence markers
        repairedJson = repairedJson.replace(/^```json\s*/i, "");
        repairedJson = repairedJson.replace(/\s*```$/, "");

        // 2. Fix control characters in strings (newlines, tabs, etc.)
        // This needs to be done carefully to preserve JSON structure
        repairedJson = repairedJson
          .split("\n")
          .map((line, idx) => {
            // Skip lines that are part of JSON structure (brackets, braces)
            if (line.trim().match(/^[\[\]\{\},]$/)) {
              return line;
            }
            // Escape unescaped newlines within string values
            return line;
          })
          .join("\n");

        // 3. Fix trailing commas
        repairedJson = repairedJson.replace(/,(\s*[}\]])/g, "$1");

        // 4. Fix missing commas between object properties
        // Match: "value"\n  "nextKey" and add comma
        repairedJson = repairedJson.replace(/("\s*)\n(\s*"[^"]+"\s*:)/g, "$1,\n$2");

        // 5. Fix missing commas in arrays
        repairedJson = repairedJson.replace(/(\})\n(\s*\{)/g, "$1,\n$2");
        repairedJson = repairedJson.replace(/(\])\n(\s*\[)/g, "$1,\n$2");

        // 6. Remove any comments (shouldn't be in JSON)
        repairedJson = repairedJson.replace(/\/\*[\s\S]*?\*\//g, "");
        repairedJson = repairedJson.replace(/\/\/.*/g, "");

        // 7. Ensure proper closing of object/array
        const openBraces = (repairedJson.match(/\{/g) || []).length;
        const closeBraces = (repairedJson.match(/\}/g) || []).length;
        const openBrackets = (repairedJson.match(/\[/g) || []).length;
        const closeBrackets = (repairedJson.match(/\]/g) || []).length;

        // Add missing closing braces/brackets
        if (openBraces > closeBraces) {
          repairedJson += "}".repeat(openBraces - closeBraces);
          console.log(`🔧 Added ${openBraces - closeBraces} closing braces`);
        }
        if (openBrackets > closeBrackets) {
          repairedJson += "]".repeat(openBrackets - closeBrackets);
          console.log(`🔧 Added ${openBrackets - closeBrackets} closing brackets`);
        }

        console.log("🔧 Attempting to parse repaired JSON...");
        try {
          techPackData = JSON.parse(repairedJson);
          console.log("✅ JSON repair successful!");
        } catch (secondParseError: any) {
          // If repair still fails, log details and throw
          console.error("❌ JSON repair failed. Original error:", firstParseError.message);
          console.error("❌ Repair attempt error:", secondParseError.message);
          console.error("📄 Failed JSON string (first 500 chars):", jsonString.substring(0, 500));
          console.error(
            "📄 Failed JSON string (last 500 chars):",
            jsonString.substring(Math.max(0, jsonString.length - 500))
          );

          logger.setOutput({
            content: extractedDescription,
            error: `JSON parse error: ${firstParseError.message}`,
            raw_response: {
              failedJson: jsonString.substring(0, 1000),
              parseError: firstParseError.message,
              repairAttempted: true,
              repairError: secondParseError.message,
            },
            usage: completion.usage
              ? {
                  prompt_tokens: completion.usage.prompt_tokens,
                  completion_tokens: completion.usage.completion_tokens,
                  total_tokens: completion.usage.total_tokens,
                }
              : undefined,
          });
          logger.setError("Failed to parse JSON response");
          await logger.complete();
          throw new Error(`Failed to parse tech pack JSON from AI: ${firstParseError.message}`);
        }
      }

      // Ensure category fields exist in tech pack data
      // If AI didn't return category, try to infer from product name or other fields
      if (!techPackData.category && !techPackData.category_Subcategory) {
        console.log("🏷️ AI didn't return category, attempting to infer from product data...");
        const productName = (techPackData.productName || "").toLowerCase();
        const productOverview = (techPackData.productOverview || "").toLowerCase();
        const combinedText = `${productName} ${productOverview}`;

        // Import category utilities
        const { normalizeCategory } = await import("@/lib/constants/product-categories");

        // Infer category from product name/overview
        const inferredCategory = normalizeCategory(combinedText);
        techPackData.category = inferredCategory;
        techPackData.category_Subcategory = `${inferredCategory.charAt(0).toUpperCase() + inferredCategory.slice(1)} → ${techPackData.productName || 'Product'}`;

        console.log("🏷️ Inferred category:", {
          category: techPackData.category,
          category_Subcategory: techPackData.category_Subcategory,
          inferredFrom: productName,
        });
      } else {
        console.log("🏷️ Category from AI response:", {
          category: techPackData.category,
          category_Subcategory: techPackData.category_Subcategory,
        });
      }

      // Log successful output
      logger.setOutput({
        content: extractedDescription,
        usage: completion.usage
          ? {
              prompt_tokens: completion.usage.prompt_tokens,
              completion_tokens: completion.usage.completion_tokens,
              total_tokens: completion.usage.total_tokens,
            }
          : undefined,
      });

      await logger.complete();
      console.log("✅ Image analysis completed successfully");
      return techPackData;
    } catch (parseError: any) {
      // This catches errors from the entire try block if JSON repair also failed
      throw parseError;
    }
  } catch (error: any) {
    console.error("❌ OpenAI API error in generateTechPackFromImage:", error.message);
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    logger.setError(error);
    await logger.complete();
    console.log("🖼️ === END generateTechPackFromImage (with error) ===");
    throw new Error(`AI service error: ${error.message}`);
  }
}

async function enhanceImagePrompt(userPrompt: string, techpack?: TechPack, product_goal?: string): Promise<string> {
  // If no techpack, return default prompt without AI call
  if (!techpack) {
    return `Professional product photography of ${userPrompt}. Clean white background, studio lighting, high resolution, photorealistic.`;
  }

  // Initialize logger for prompt enhancement
  const logger = aiLogger.startOperation("enhanceImagePrompt", "gpt-4o-mini", "openai", "text_generation");

  try {
    const openai = getOpenAIClient();
    const systemPrompt =
      "You are an expert at creating prompts for image generation. Given a product description and a tech pack, create a detailed prompt that PRESERVES THE EXACT PRODUCT DESCRIBED. Do not change the product type or add new products. Only add details about materials, colors, and visualization style from the tech pack. Keep the original product identity intact. Do not include any explanations, just output the enhanced prompt.";
    const userPromptContent = `Create a prompt for THIS EXACT product: "${userPrompt}". 
    
    Use these tech pack details ONLY to enhance visualization details (materials, colors, style), but DO NOT change the product itself: ${JSON.stringify(
      techpack
    ).substring(0, 500)}`;

    // Log input
    logger.setInput({
      prompt: userPromptContent,
      system_prompt: systemPrompt,
      parameters: {
        temperature: 0.7,
        max_tokens: 400,
      },
      metadata: {
        original_prompt: userPrompt,
        has_techpack: true,
        product_goal,
      },
    });

    // Get current user context if available
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      logger.setContext({
        user_id: user.id,
        feature: "image_prompt_enhancement",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPromptContent,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const enhancedPrompt =
      completion.choices[0].message.content ||
      `Professional product photography of ${userPrompt}. Clean white background, studio lighting, high resolution, photorealistic.`;

    console.log("=== PROMPT ENHANCEMENT ===");
    console.log("Original user prompt:", userPrompt);
    console.log("Enhanced prompt:", enhancedPrompt);
    console.log("==========================");

    // Log output
    logger.setOutput({
      content: enhancedPrompt,
      usage: completion.usage
        ? {
            prompt_tokens: completion.usage.prompt_tokens,
            completion_tokens: completion.usage.completion_tokens,
            total_tokens: completion.usage.total_tokens,
          }
        : undefined,
    });

    await logger.complete();
    return enhancedPrompt;
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    logger.setError(error);
    await logger.complete();
    return `Professional product photography of ${userPrompt}. Clean white background, studio lighting, high resolution, photorealistic.`;
  }
}

// PROGRESSIVE WORKFLOW - ONLY WAY TO GENERATE IMAGES
async function generateProductImage(
  basePrompt: string,
  generateMoreImages: boolean,
  referenceImage?: string,
  logoImage?: string, // Logo is fetched from product metadata by Progressive workflow
  projectId?: string // REQUIRED - product must exist before generation
): Promise<{
  front: { url: string; prompt_used: string };
  back: { url: string; prompt_used: string };
  side?: { url: string; prompt_used: string };
  top?: { url: string; prompt_used: string };
  bottom?: { url: string; prompt_used: string };
  illustration?: { url: string; prompt_used: string };
}> {
  console.log("=== GENERATE PRODUCT IMAGE (PROGRESSIVE WORKFLOW) ===");
  console.log("Base prompt:", basePrompt);
  console.log("Generate more images:", generateMoreImages);
  console.log("Has reference image:", !!referenceImage);
  console.log("Has logo image:", !!logoImage);

  // Critical debug for modifications
  const isEditRequest = !!referenceImage && !basePrompt.includes("Generate") && !basePrompt.includes("Create");
  console.log("Is edit request:", isEditRequest);
  console.log("Will set modifications:", isEditRequest ? basePrompt : "undefined");

  try {
    // Validate productId is required (product-first architecture)
    if (!projectId) {
      throw new Error("projectId is required - product must exist before generation");
    }

    console.log("=== STEP 1: Generate Front View ===");
    // Step 1: Generate front view using Progressive workflow
    const frontResult = await generateFrontViewOnly({
      productId: projectId,
      userPrompt: basePrompt,
      previousFrontViewUrl: referenceImage,
      isEdit: isEditRequest,
    });

    if (!frontResult.success || !frontResult.frontViewUrl || !frontResult.approvalId) {
      throw new Error(frontResult.error || "Failed to generate front view");
    }

    console.log("Front view generated:", frontResult.frontViewUrl);

    console.log("=== STEP 2: Auto-approve Front View ===");
    // Step 2: Auto-approve front view (automated flow)
    const approvalResult = await handleFrontViewDecision({
      approvalId: frontResult.approvalId,
      action: "approve",
    });

    if (!approvalResult.success) {
      throw new Error(approvalResult.error || "Failed to approve front view");
    }

    console.log("Front view approved");

    console.log("=== STEP 3: Generate Remaining Views ===");
    // Step 3: Generate remaining views (back, side, top, bottom)
    const remainingResult = await generateRemainingViews({
      approvalId: frontResult.approvalId,
      frontViewUrl: frontResult.frontViewUrl,
    });

    if (!remainingResult.success || !remainingResult.views) {
      throw new Error(remainingResult.error || "Failed to generate remaining views");
    }

    // Convert to expected format with base64 URLs
    const result: any = {
      front: {
        url: `data:image/png;base64,${await urlToBase64(frontResult.frontViewUrl)}`,
        prompt_used: basePrompt,
      },
      back: {
        url: `data:image/png;base64,${await urlToBase64(remainingResult.views.back)}`,
        prompt_used: "Back view generated from approved front view",
      },
    };

    // Add side view
    if (remainingResult.views.side) {
      result.side = {
        url: `data:image/png;base64,${await urlToBase64(remainingResult.views.side)}`,
        prompt_used: "Side view generated from approved front view",
      };
    }

    // Add top view
    if (remainingResult.views.top) {
      result.top = {
        url: `data:image/png;base64,${await urlToBase64(remainingResult.views.top)}`,
        prompt_used: "Top view generated from approved front view",
      };
    }

    // Add bottom view
    if (remainingResult.views.bottom) {
      result.bottom = {
        url: `data:image/png;base64,${await urlToBase64(remainingResult.views.bottom)}`,
        prompt_used: "Bottom view generated from approved front view",
      };
    }

    // Note: Progressive workflow doesn't generate illustration view
    // If needed, add separate illustration generation logic

    return result;
  } catch (error) {
    console.error("Error in Progressive workflow product image generation:", error);
    throw new Error("Failed to generate product images using Progressive workflow");
  }
}

// Helper function to convert URL to base64
async function urlToBase64(url: string): Promise<string> {
  try {
    // Validate URL is not empty
    if (!url || url.trim() === "") {
      throw new Error("URL is empty or undefined");
    }

    // If it's already a data URL, extract the base64 part
    if (url.startsWith("data:")) {
      return url.split(",")[1];
    }

    // Otherwise fetch the image and convert to base64
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    throw error;
  }
}

// Helper function to optimize and upload image to Supabase using centralized service
export async function optimizeAndUploadImage(
  dataUrl: string,
  fileName: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    preset?: keyof typeof IMAGE_PRESETS;
  }
): Promise<string> {
  try {
    // Use centralized image service for upload with optimization
    const result = await safeUpload(dataUrl, {
      fileName,
      preset: options?.preset || "standard",
      generateWebP: true,
      generateThumbnail: false,
      maxRetries: 3,
      timeout: 30000,
    });

    if (result.success && result.url) {
      return result.url;
    }

    console.error("Image upload failed:", result.error);
    return "";
  } catch (error) {
    console.error("Error uploading image:", error);
    return "";
  }
}

async function regenerateImageData(
  basePrompt: string,
  existingProject?: { image_data?: any; id?: string },
  referenceImage?: string,
  logoImage?: string,
  isModification?: boolean,
  projectId?: string
) {
  console.log(existingProject, "existingProject");
  console.log("Is modification:", isModification);
  console.log("Reference image:", referenceImage);

  // Check if any of side, bottom or illustration images exist to decide what to generate
  // For initial generation, always generate all 5 views (top and bottom)
  const isInitialGeneration = !existingProject || !existingProject.image_data?.front;
  const hasExtraViews =
    isInitialGeneration || // Always generate all views for initial generation
    Boolean(existingProject?.image_data?.top) || // Regenerate if top exists
    Boolean(existingProject?.image_data?.bottom) || // Regenerate if bottom exists
    Boolean(existingProject?.image_data?.illustration);

  // Priority for reference image:
  // 1. Explicitly provided reference image (screenshot or user upload)
  // 2. Existing product's front image if this is a modification
  // 3. No reference image
  const effectiveReferenceImage =
    referenceImage ||
    (isModification && existingProject?.image_data?.front?.url ? existingProject.image_data.front.url : undefined);

  // Debug logging for edit requests
  console.log("=== REGENERATE IMAGE DATA DEBUG ===");
  console.log("Base prompt:", basePrompt);
  console.log("Is modification:", isModification);
  console.log("Reference image provided:", !!referenceImage);
  console.log("Effective reference image:", !!effectiveReferenceImage);
  console.log("Is initial generation:", isInitialGeneration);
  console.log("Has extra views (will generate top/bottom):", hasExtraViews);
  console.log("Project ID:", projectId || existingProject?.id);

  // Generate images using stepped workflow with logo if provided
  const imageResult = await generateProductImage(
    basePrompt,
    hasExtraViews,
    effectiveReferenceImage,
    logoImage,
    projectId || existingProject?.id // Pass project ID for URL structure
  );

  const timestamp = new Date().toISOString();

  // Save front and back images
  const frontUrl = await saveImageToSupabase(imageResult.front.url, `${projectId}/front_${uuidv4()}.png`);
  const backUrl = await saveImageToSupabase(imageResult.back.url, `${projectId}/back_${uuidv4()}.png`);

  // Conditionally save extras if they exist
  let sideUrl, topUrl, bottomUrl, illustrationUrl;

  if (imageResult.side) {
    sideUrl = await saveImageToSupabase(imageResult.side.url, `${projectId}/side_${uuidv4()}.png`);
  }

  if (imageResult.top) {
    topUrl = await saveImageToSupabase(imageResult.top.url, `${projectId}/top_${uuidv4()}.png`);
  }

  if (imageResult.bottom) {
    bottomUrl = await saveImageToSupabase(imageResult.bottom.url, `${projectId}/bottom_${uuidv4()}.png`);
  }

  if (imageResult.illustration) {
    illustrationUrl = await saveImageToSupabase(
      imageResult.illustration.url,
      `${projectId}/illustration_${uuidv4()}.png`
    );
  }

  return {
    front: {
      url: frontUrl,
      prompt_used: imageResult.front.prompt_used,
      created_at: timestamp,
      regenerated: !!existingProject,
    },
    back: {
      url: backUrl,
      prompt_used: imageResult.back.prompt_used,
      created_at: timestamp,
      regenerated: !!existingProject,
    },
    ...(sideUrl && {
      side: {
        url: sideUrl,
        prompt_used: imageResult.side!.prompt_used,
        created_at: timestamp,
        regenerated: !!existingProject,
      },
    }),
    ...(topUrl && {
      top: {
        url: topUrl,
        prompt_used: imageResult.top!.prompt_used,
        created_at: timestamp,
        regenerated: !!existingProject,
      },
    }),
    ...(bottomUrl && {
      bottom: {
        url: bottomUrl,
        prompt_used: imageResult.bottom!.prompt_used,
        created_at: timestamp,
        regenerated: !!existingProject,
      },
    }),
    ...(illustrationUrl && {
      illustration: {
        url: illustrationUrl,
        prompt_used: imageResult.illustration!.prompt_used,
        created_at: timestamp,
        regenerated: !!existingProject,
      },
    }),
  };
}

async function updateTechPackSection(
  originalTechPack: TechPack,
  sectionToUpdate: keyof TechPack & string,
  userPrompt: string
): Promise<TechPack> {
  const openai = getOpenAIClient();

  const systemPrompt = UpdateTechPackSectionPrompt(sectionToUpdate);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Original ${sectionToUpdate}: ${JSON.stringify(
            originalTechPack[sectionToUpdate],
            null,
            2
          )}\n\nUpdate Request: ${userPrompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No content in AI response");
    }

    console.log(responseContent, "responsecccccc");
    let jsonContent = responseContent;

    const codeBlockMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1].trim();
    }

    // Attempt to wrap key-value pairs if the content starts with a quoted key
    if (/^"\w+":/.test(jsonContent.trim())) {
      jsonContent = `{${jsonContent}}`; // Wrap in {}
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse content:", jsonContent);
      throw new Error("Failed to parse the AI response as JSON");
    }

    // Extract the actual updated section
    let updatedSection;
    if (typeof parsedJson === "object" && parsedJson !== null) {
      updatedSection = parsedJson[sectionToUpdate];
      if (updatedSection === undefined) {
        throw new Error(`Section "${sectionToUpdate}" not found in parsed JSON`);
      }
    } else {
      throw new Error("Parsed JSON is not a valid object");
    }

    return {
      ...originalTechPack,
      [sectionToUpdate]: updatedSection,
    };
  } catch (err) {
    console.error("Update section error:", err);
    throw err;
  }
}

// Safe wrapper for image analysis that won't crash the app
export async function safeImageAnalysis(
  imageUrl: string,
  options?: {
    timeout?: number;
    maxRetries?: number;
    projectId?: string;
  }
): Promise<any> {
  const { timeout = 30000, maxRetries = 2, projectId } = options || {};

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Image analysis attempt ${attempt}/${maxRetries}`);

      // Optimize image first
      const optimizedUrl = await optimizeImageForAnalysis(imageUrl);

      // Try analysis with timeout
      const result = await analyzeImageWithTimeout(optimizedUrl, "", timeout);

      // If successful, optionally trigger background storage
      if (result && projectId) {
        analyzeImageInBackground(imageUrl, projectId, {
          attempts: attempt,
          optimized: optimizedUrl !== imageUrl,
        });
      }

      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`Image analysis attempt ${attempt} failed:`, error.message);

      // If it's a timeout and we have retries left, try with even more aggressive optimization
      if (error.message === "Image analysis timeout" && attempt < maxRetries) {
        console.log("Retrying with more aggressive image optimization...");
        // Continue to next iteration
      } else {
        break;
      }
    }
  }

  // All attempts failed - return null instead of throwing
  console.error("All image analysis attempts failed:", lastError);
  return null;
}

export async function generateIdea({
  user_prompt,
  intended_use,
  existing_project_id,
  regenerate_image_only = false,
  regenerate_techpack_only = false,
  sectionToUpdate,
  image,
  designFile,
  selected_colors,
  product_goal,
  generateMoreImages,
  updated_images,
  selected_revision_id, // 🆕 Revision ID for filtering tech files by specific revision
}: GenerateIdeaParams): Promise<GenerateIdeaResponse> {
  console.log("🎬 === START generateIdea ===");
  console.log("📝 Parameters:", {
    promptLength: user_prompt?.length,
    projectId: existing_project_id,
    regenerateImageOnly: regenerate_image_only,
    regenerateTechPackOnly: regenerate_techpack_only,
    hasUpdatedImages: !!updated_images,
    imageCount: updated_images ? Object.keys(updated_images).length : 0,
    sectionToUpdate,
    hasLogo: !!image,
    logoLength: image?.length || 0,
    hasDesignFile: !!designFile,
    designFileLength: designFile?.length || 0,
    selectedRevisionId: selected_revision_id, // 🆕 Log revision ID
  });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    let existingProject = null;
    // Generate a project ID upfront for new projects
    const projectIdForGeneration = existing_project_id || uuidv4();

    if (existing_project_id) {
      const { data, error } = await supabase
        .from("product_ideas")
        .select("*")
        .eq("id", existing_project_id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error("Error fetching existing project:", error);
        return {
          success: false,
          error: "Failed to fetch existing project",
        };
      }

      existingProject = data;
    }

    let techpack = existingProject?.tech_pack;

    const shouldUpdateTechpack =
      !existingProject || regenerate_techpack_only || (!regenerate_image_only && !regenerate_techpack_only);

    console.log("🎯 shouldUpdateTechpack check:", {
      shouldUpdateTechpack,
      hasExistingProject: !!existingProject,
      regenerate_techpack_only,
      regenerate_image_only,
      sectionToUpdate,
      hasExistingTechPack: !!existingProject?.tech_pack,
      techPackKeys: existingProject?.tech_pack ? Object.keys(existingProject.tech_pack) : [],
    });

    if (shouldUpdateTechpack) {
      console.log("✅ Entering tech pack update block");
      try {
        if (existingProject && sectionToUpdate && existingProject.tech_pack) {
          console.log("📝 Updating specific section:", sectionToUpdate);
          techpack = await updateTechPackSection(existingProject.tech_pack, sectionToUpdate, user_prompt);

          const updatedSection = techpack[sectionToUpdate];
          if (updatedSection && typeof updatedSection === "object") {
            techpack[sectionToUpdate] = updatedSection[sectionToUpdate] || updatedSection;
          }
        } else if (regenerate_techpack_only && updated_images) {
          console.log("🔧 Tech pack regeneration block triggered:", {
            regenerate_techpack_only,
            hasUpdatedImages: !!updated_images,
            imageKeys: updated_images ? Object.keys(updated_images) : [],
            hasExistingTechPack: !!existingProject?.tech_pack,
          });

          // Check if this is initial tech pack generation or regeneration
          const isInitialGeneration =
            !existingProject?.tech_pack || Object.keys(existingProject.tech_pack).length === 0;

          console.log("📊 Initial generation check:", {
            isInitialGeneration,
            promptIncludes: {
              comprehensive: user_prompt.includes("generate a comprehensive tech pack"),
              complete: user_prompt.includes("Generate a complete tech pack"),
              analyze: user_prompt.includes("analyze") || user_prompt.includes("Analyze"),
            },
            userPromptLength: user_prompt.length,
            userPromptStart: user_prompt.substring(0, 100),
          });

          // 🆕 FETCH TECH FILES DATA TO ENRICH TECH PACK
          let techFilesEnrichmentData = null;
          if (existing_project_id) {
            try {
              console.log("🔍 Fetching tech files to enrich tech pack generation...", {
                productId: existing_project_id,
                revisionId: selected_revision_id || 'not specified'
              });

              // Build query - include all tech file types: sketches, closeups, components, and base views
              let query = supabase
                .from("tech_files")
                .select("*")
                .eq("product_idea_id", existing_project_id)
                .in("file_type", ["sketch", "closeup", "component", "base_view"])
                .eq("status", "completed");

              // 🆕 If revision ID is provided, filter by it
              if (selected_revision_id) {
                query = query.eq("revision_id", selected_revision_id);
                console.log("✅ Filtering tech files by revision ID:", selected_revision_id);
              }

              const { data: techFiles, error: techFilesError } = await query.order("created_at", { ascending: false });

              if (!techFilesError && techFiles && techFiles.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sketches = techFiles.filter((f: any) => f.file_type === "sketch");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const closeups = techFiles.filter((f: any) => f.file_type === "closeup");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const components = techFiles.filter((f: any) => f.file_type === "component");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const baseViews = techFiles.filter((f: any) => f.file_type === "base_view");

                // Extract key insights from tech files
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sketchInsights = sketches.map((sketch: any) => ({
                  view: sketch.view_type,
                  measurements: sketch.analysis_data?.summary?.measurements || sketch.analysis_data?.measurements || [],
                  materials: sketch.analysis_data?.summary?.materials || [],
                  construction: sketch.analysis_data?.summary?.construction || [],
                  designFeatures: sketch.analysis_data?.summary?.designFeatures || [],
                  colors: sketch.analysis_data?.summary?.colors || [],
                  manufacturingNotes: sketch.analysis_data?.summary?.manufacturingNotes || "",
                  callouts: sketch.analysis_data?.callouts || []
                }));

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const closeupInsights = closeups.map((closeup: any) => ({
                  shotName: closeup.file_category,
                  materialDetails: closeup.analysis_data?.summary?.materialDetails || closeup.analysis_data?.detailed_observations?.material_details || {},
                  constructionTechniques: closeup.analysis_data?.summary?.constructionTechniques || closeup.analysis_data?.detailed_observations?.construction_details || {},
                  qualityIndicators: closeup.analysis_data?.summary?.qualityIndicators || closeup.analysis_data?.detailed_observations?.quality_observations || {},
                  hardwareSpecs: closeup.analysis_data?.detailed_observations?.hardware_specifications || {},
                  colorAnalysis: closeup.analysis_data?.detailed_observations?.color_analysis || {},
                  manufacturingSpecs: closeup.analysis_data?.manufacturing_specifications || {}
                }));

                // Extract component insights for factory sourcing
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const componentInsights = components.map((component: any) => ({
                  componentName: component.file_category || component.analysis_data?.component_name || "Unknown Component",
                  imageUrl: component.file_url,
                  material: component.analysis_data?.material || component.analysis_data?.summary?.material || "",
                  description: component.analysis_data?.description || component.analysis_data?.summary?.description || "",
                  specifications: component.analysis_data?.specifications || component.analysis_data?.summary?.specifications || {},
                  sourcingNotes: component.analysis_data?.sourcing_notes || component.analysis_data?.summary?.sourcingNotes || "",
                  quantity: component.analysis_data?.quantity || 1,
                  color: component.analysis_data?.color || component.analysis_data?.summary?.color || ""
                }));

                // Extract base view analysis insights
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const baseViewInsights = baseViews.map((baseView: any) => ({
                  view: baseView.view_type,
                  imageUrl: baseView.file_url,
                  analysis: baseView.analysis_data?.analysis || baseView.analysis_data?.summary || {},
                  materials: baseView.analysis_data?.materials || baseView.analysis_data?.summary?.materials || [],
                  constructionDetails: baseView.analysis_data?.construction || baseView.analysis_data?.summary?.construction || [],
                  designElements: baseView.analysis_data?.design_elements || baseView.analysis_data?.summary?.designElements || []
                }));

                techFilesEnrichmentData = {
                  sketches: sketchInsights,
                  closeups: closeupInsights,
                  components: componentInsights,
                  baseViews: baseViewInsights
                };

                console.log("✅ Tech files enrichment data prepared:", {
                  sketchCount: sketchInsights.length,
                  closeupCount: closeupInsights.length,
                  componentCount: componentInsights.length,
                  baseViewCount: baseViewInsights.length,
                  hasMeasurements: sketchInsights.some((s: any) => s.measurements?.length > 0),
                  hasMaterials: closeupInsights.some((c: any) => Object.keys(c.materialDetails).length > 0),
                  hasComponents: componentInsights.length > 0
                });
              } else {
                console.log("ℹ️ No tech files available to enrich tech pack");
              }
            } catch (error) {
              console.error("⚠️ Error fetching tech files for enrichment:", error);
              // Non-fatal: continue without enrichment
            }
          }

          // When regenerate_techpack_only is true with updated_images, always generate the tech pack
          // This happens when user clicks "Save and Continue" after editing images
          if (true) {
            // Simplified: always generate when we have updated_images and regenerate_techpack_only
            // For initial generation or explicit regeneration, analyze the images
            console.log("🔄 Generating tech pack from product images", {
              isInitialGeneration,
              hasUpdatedImages: !!updated_images,
              imageCount: Object.keys(updated_images || {}).length,
              frontImage: updated_images?.front?.url ? "Available" : "Missing",
              backImage: updated_images?.back?.url ? "Available" : "Missing",
              sideImage: updated_images?.side?.url ? "Available" : "Missing",
              hasEnrichmentData: !!techFilesEnrichmentData
            });

            // Generate tech pack by analyzing the actual images
            const imageUrls = [];
            if (updated_images?.front?.url) imageUrls.push(updated_images.front.url);
            if (updated_images?.back?.url) imageUrls.push(updated_images.back.url);
            if (updated_images?.side?.url) imageUrls.push(updated_images.side.url);

            // Create a comprehensive prompt with image context AND tech files enrichment
            let enrichmentContext = "";
            if (techFilesEnrichmentData) {
              enrichmentContext = "\n\n📐 TECHNICAL ANALYSIS DATA (Use this to enhance accuracy):\n";

              // Add sketch insights
              if (techFilesEnrichmentData.sketches?.length > 0) {
                enrichmentContext += "\nTechnical Sketches Analysis:\n";
                techFilesEnrichmentData.sketches.forEach((sketch: any) => {
                  enrichmentContext += `\n${sketch.view?.toUpperCase() || 'UNKNOWN'} VIEW:\n`;

                  if (sketch.measurements?.length > 0) {
                    enrichmentContext += "- Measurements:\n";
                    sketch.measurements.forEach((m: any) => {
                      enrichmentContext += `  • ${m.name || m.element}: ${m.value}\n`;
                    });
                  }

                  if (sketch.materials?.length > 0) {
                    enrichmentContext += "- Materials:\n";
                    sketch.materials.forEach((m: any) => {
                      enrichmentContext += `  • ${m.type || m.name}: ${m.properties || m.description || ''}\n`;
                    });
                  }

                  if (sketch.construction?.length > 0) {
                    enrichmentContext += "- Construction:\n";
                    sketch.construction.forEach((c: any) => {
                      enrichmentContext += `  • ${c.feature || c.name}: ${c.details || c.technique || ''}\n`;
                    });
                  }

                  // Add colors from sketch analysis
                  if (sketch.colors?.length > 0) {
                    enrichmentContext += "- Colors:\n";
                    sketch.colors.forEach((color: any) => {
                      const colorName = color.name || color;
                      const hex = color.hex ? ` (${color.hex})` : '';
                      const location = color.location ? ` - ${color.location}` : '';
                      enrichmentContext += `  • ${colorName}${hex}${location}\n`;
                    });
                  }

                  // Add design features from sketch analysis
                  if (sketch.designFeatures?.length > 0) {
                    enrichmentContext += "- Design Features:\n";
                    sketch.designFeatures.forEach((feature: any) => {
                      const featureName = feature.name || feature;
                      const description = feature.description ? `: ${feature.description}` : '';
                      enrichmentContext += `  • ${featureName}${description}\n`;
                    });
                  }

                  if (sketch.manufacturingNotes) {
                    enrichmentContext += `- Manufacturing Notes: ${sketch.manufacturingNotes}\n`;
                  }
                });
              }

              // Add closeup insights
              if (techFilesEnrichmentData.closeups?.length > 0) {
                enrichmentContext += "\nClose-up Detail Analysis:\n";
                techFilesEnrichmentData.closeups.forEach((closeup: any) => {
                  enrichmentContext += `\n${closeup.shotName}:\n`;

                  if (closeup.materialDetails && typeof closeup.materialDetails === 'object' && Object.keys(closeup.materialDetails).length > 0) {
                    enrichmentContext += "- Material Details:\n";
                    if (typeof closeup.materialDetails === 'string') {
                      enrichmentContext += `  ${closeup.materialDetails}\n`;
                    } else {
                      Object.entries(closeup.materialDetails).forEach(([key, value]) => {
                        enrichmentContext += `  • ${key}: ${value}\n`;
                      });
                    }
                  }

                  if (closeup.constructionTechniques && typeof closeup.constructionTechniques === 'object' && Object.keys(closeup.constructionTechniques).length > 0) {
                    enrichmentContext += "- Construction:\n";
                    if (typeof closeup.constructionTechniques === 'string') {
                      enrichmentContext += `  ${closeup.constructionTechniques}\n`;
                    } else {
                      Object.entries(closeup.constructionTechniques).forEach(([key, value]) => {
                        enrichmentContext += `  • ${key}: ${value}\n`;
                      });
                    }
                  }

                  if (closeup.hardwareSpecs && typeof closeup.hardwareSpecs === 'object' && Object.keys(closeup.hardwareSpecs).length > 0) {
                    enrichmentContext += "- Hardware:\n";
                    Object.entries(closeup.hardwareSpecs).forEach(([key, value]) => {
                      enrichmentContext += `  • ${key}: ${value}\n`;
                    });
                  }
                });
              }

              // Add component insights for factory sourcing
              if (techFilesEnrichmentData.components?.length > 0) {
                enrichmentContext += "\nComponent Images for Factory Sourcing:\n";
                techFilesEnrichmentData.components.forEach((component: any) => {
                  enrichmentContext += `\n${component.componentName}:\n`;
                  if (component.material) {
                    enrichmentContext += `  • Material: ${component.material}\n`;
                  }
                  if (component.description) {
                    enrichmentContext += `  • Description: ${component.description}\n`;
                  }
                  if (component.color) {
                    enrichmentContext += `  • Color: ${component.color}\n`;
                  }
                  if (component.quantity && component.quantity > 1) {
                    enrichmentContext += `  • Quantity: ${component.quantity}\n`;
                  }
                  if (component.sourcingNotes) {
                    enrichmentContext += `  • Sourcing Notes: ${component.sourcingNotes}\n`;
                  }
                  if (component.specifications && typeof component.specifications === 'object' && Object.keys(component.specifications).length > 0) {
                    enrichmentContext += "  • Specifications:\n";
                    Object.entries(component.specifications).forEach(([key, value]) => {
                      enrichmentContext += `    - ${key}: ${value}\n`;
                    });
                  }
                });
              }

              // Add base view analysis insights
              if (techFilesEnrichmentData.baseViews?.length > 0) {
                enrichmentContext += "\nBase View Analysis:\n";
                techFilesEnrichmentData.baseViews.forEach((baseView: any) => {
                  enrichmentContext += `\n${baseView.view?.toUpperCase() || 'UNKNOWN'} VIEW:\n`;
                  if (baseView.materials?.length > 0) {
                    enrichmentContext += "  • Materials: " + baseView.materials.join(", ") + "\n";
                  }
                  if (baseView.constructionDetails?.length > 0) {
                    enrichmentContext += "  • Construction: " + baseView.constructionDetails.join(", ") + "\n";
                  }
                  if (baseView.designElements?.length > 0) {
                    enrichmentContext += "  • Design Elements: " + baseView.designElements.join(", ") + "\n";
                  }
                });
              }

              enrichmentContext += "\n⚠️ IMPORTANT: Use the above technical data to provide ACCURATE and DETAILED specifications in the tech pack.\n";
            }

            const analysisPrompt = `${user_prompt}

Available Images for Analysis:
- Front View: ${updated_images?.front?.url ? "✓" : "✗"}
- Back View: ${updated_images?.back?.url ? "✓" : "✗"}
- Side View: ${updated_images?.side?.url ? "✓" : "✗"}
${enrichmentContext}
Please analyze these product images thoroughly and provide detailed specifications.${techFilesEnrichmentData ? ' Make sure to incorporate the technical analysis data provided above for maximum accuracy.' : ''}`;

            // Use the image analysis function if we have at least one image
            if (imageUrls.length > 0) {
              console.log("🖼️ Calling generateTechPackFromImage with:", {
                primaryImage: imageUrls[0].substring(0, 50) + "...",
                imageCount: imageUrls.length,
                promptLength: analysisPrompt.length,
                hasEnrichment: !!techFilesEnrichmentData
              });

              techpack = await generateTechPackFromImage(
                imageUrls[0], // Primary image for analysis
                analysisPrompt
              );

              console.log("✅ Tech pack generated from images:", {
                hasTechPack: !!techpack,
                sections: techpack ? Object.keys(techpack) : [],
                sectionCount: techpack ? Object.keys(techpack).length : 0,
                // 🏷️ Category debug
                category: techpack?.category,
                category_Subcategory: techpack?.category_Subcategory,
              });
            } else {
              console.log("⚠️ No images available, using text-based generation");
              // Fallback to text-based generation if no images
              techpack = await generateTechPack(
                user_prompt,
                selected_colors ?? [],
                product_goal ?? "",
                image || undefined
              );
            }
            // Removed the else block since we always generate when regenerate_techpack_only is true
          }
        } else {
          console.log("📌 Default tech pack generation path");
          const isImagePrompt =
            typeof user_prompt === "string" &&
            (/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(user_prompt) ||
              user_prompt.startsWith("data:image/"));
          techpack = isImagePrompt
            ? await generateTechPackFromImage(user_prompt, intended_use ?? "")
            : await generateTechPack(user_prompt, selected_colors ?? [], product_goal ?? "", image || undefined);
        }
      } catch (aiError: any) {
        console.error("❌ OpenAI API error in tech pack generation:", aiError);
        console.error("Error details:", {
          message: aiError.message,
          stack: aiError.stack,
          response: aiError.response?.data,
        });
        return {
          success: false,
          error: aiError.message || "AI service error",
        };
      }
    }

    let imageData = existingProject?.image_data;
    console.log("imageData 32323==> ", imageData);

    // If updated_images is provided, use them instead of regenerating
    if (updated_images) {
      imageData = updated_images;
    }

    // Check if existing images are valid (not empty URLs)
    const existingImagesValid =
      imageData &&
      imageData.front?.url &&
      imageData.front.url !== "" &&
      imageData.back?.url &&
      imageData.back.url !== "" &&
      imageData.side?.url &&
      imageData.side.url !== "";

    const shouldUpdateImage =
      !updated_images &&
      (!existingProject ||
        regenerate_image_only ||
        (!regenerate_image_only && !regenerate_techpack_only) ||
        !existingImagesValid); // Also update if existing images are empty
    const isUploadedImage =
      typeof user_prompt === "string" &&
      (/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(user_prompt) ||
        user_prompt.startsWith("data:image/"));
    if (shouldUpdateImage && !isUploadedImage) {
      try {
        // Check if this is a modification of existing product (not just a reference image upload)
        const isModification = regenerate_image_only && existingProject && !image;

        // Extract screenshot URL if present in the prompt
        let screenshotUrl: string | null = null;
        let imagePrompt = user_prompt;

        // Check for screenshot URLs in the prompt
        const screenshotMatch = user_prompt.match(/\[Current Design Screenshot: (https?:\/\/[^\]]+)\]/);
        const annotatedScreenshotMatch = user_prompt.match(/!\[Annotated Screenshot\]$$([^)]+)$$/);

        if (screenshotMatch) {
          screenshotUrl = screenshotMatch[1];
          // Remove the screenshot URL from the prompt to avoid confusing the AI
          imagePrompt = user_prompt.replace(/\[Current Design Screenshot: https?:\/\/[^\]]+\]/g, "").trim();
        } else if (annotatedScreenshotMatch) {
          screenshotUrl = annotatedScreenshotMatch[1];
          // Remove the annotated screenshot markdown from the prompt
          imagePrompt = user_prompt.replace(/!\[Annotated Screenshot\]$$[^)]+$$/g, "").trim();
        }

        // For modifications, make the prompt clearer about what to change
        if (isModification) {
          // Don't enhance modification prompts - use them as-is for clarity
          console.log("Modification request:", user_prompt);
          // Ensure the prompt is clear about modifying the existing product
          if (
            !user_prompt.toLowerCase().includes("modify") &&
            !user_prompt.toLowerCase().includes("change") &&
            !user_prompt.toLowerCase().includes("update") &&
            !user_prompt.toLowerCase().includes("edit")
          ) {
            // Add context that this is a modification
            imagePrompt = `Modify the existing product: ${user_prompt}`;
          }
        } else if (user_prompt.length < 50 || !user_prompt.includes(" ")) {
          // Only enhance prompt if it's very short or generic AND not a modification
          imagePrompt = await enhanceImagePrompt(user_prompt, techpack, product_goal);
        } else {
          // Use the user's detailed description directly
          console.log("Using original prompt without enhancement:", user_prompt);
          imagePrompt = user_prompt;
        }
        console.log(existingProject, "exiting");

        if (existingProject) {
          // NOTE: We don't delete old images anymore to preserve revision history
          // Images referenced by revisions need to remain accessible
          // if (existingProject?.image_data) {
          //   await deleteOldImages(existingProject.image_data);
          // }

          // Use screenshot URL as reference if available, otherwise use designFile (sketch), fallback to regular image
          const referenceImageToUse = screenshotUrl || designFile || undefined;

          imageData = await regenerateImageData(
            imagePrompt,
            existingProject,
            referenceImageToUse, // Screenshot, designFile (sketch), or fallback
            image || undefined, // Logo image (separate from reference)
            isModification || !!screenshotUrl, // Flag to indicate this is modifying existing product
            existing_project_id // Pass the project ID
          );
        } else {
          // Generate images with design file as reference and logo
          const imageResult = await generateProductImage(
            imagePrompt,
            generateMoreImages ?? false,
            designFile || undefined, // Use designFile (sketch) as reference
            image || undefined, // Logo (separate from reference)
            projectIdForGeneration // Use the pre-generated project ID
          );

          // Use the generated images directly (no need for overlay)
          const finalImages = imageResult as {
            [key: string]: { url: string; prompt_used: string };
          };

          const timestamp = new Date().toISOString();
          imageData = {};

          const views = Object.keys(finalImages);
          for (const view of views) {
            const imageInfo = finalImages[view];
            const savedUrl = await saveImageToSupabase(imageInfo.url, `${projectIdForGeneration}/${uuidv4()}.png`);
            imageData[view] = {
              url: savedUrl ?? "",
              prompt_used: imageInfo.prompt_used,
              created_at: timestamp,
              regenerated: false,
            };
          }
        }
      } catch (imageError: any) {
        console.error("Image generation error:", imageError);
      }
    }
    // Check if imageData has actual URLs or is empty/placeholder
    const hasValidImageData =
      imageData &&
      imageData.front?.url &&
      imageData.front.url !== "" &&
      imageData.back?.url &&
      imageData.back.url !== "" &&
      imageData.side?.url &&
      imageData.side.url !== "";

    if (isUploadedImage && !hasValidImageData) {
      // When user uploads a design, use it as reference to generate all views
      try {
        console.log("Using uploaded image as reference to generate all views");
        console.log("User description:", intended_use);

        // Generate all views using the uploaded image as reference
        // Combine the uploaded image analysis with user's description
        let imagePrompt = "Generate product views based on the uploaded design";

        if (intended_use && intended_use.trim()) {
          // Include the user's description to modify or enhance the design
          imagePrompt = `Generate product views based on the uploaded design. Apply these modifications: ${intended_use}`;
          console.log("Using enhanced prompt with user description:", imagePrompt);
        }

        const imageResult = await generateProductImage(
          imagePrompt,
          generateMoreImages ?? false,
          designFile || user_prompt, // Use designFile (sketch) as reference, fallback to user_prompt
          image || undefined, // Pass logo if provided
          projectIdForGeneration // Use the pre-generated project ID
        );

        const timestamp = new Date().toISOString();
        imageData = {};

        // Save all generated views
        const views = Object.keys(imageResult);
        for (const view of views) {
          const imageInfo = imageResult[view as keyof typeof imageResult];
          if (imageInfo) {
            const savedUrl = await saveImageToSupabase(imageInfo.url, `${projectIdForGeneration}/${uuidv4()}.png`);
            imageData[view] = {
              url: savedUrl ?? "",
              prompt_used: imageInfo.prompt_used,
              created_at: timestamp,
              regenerated: false,
            };
          }
        }

        console.log("Generated all views from uploaded design:", Object.keys(imageData));
      } catch (imageError: any) {
        console.error("Error generating views from uploaded design:", imageError);
        // Fallback to just using the uploaded image as front
        const timestamp = new Date().toISOString();
        imageData = {
          front: {
            url: user_prompt,
            prompt_used: "User uploaded design",
            created_at: timestamp,
            regenerated: false,
          },
          side: null,
          back: null,
        };
      }
    }
    let project_id = existing_project_id;

    if (existingProject) {
      console.log("Updating existing project with image_data:", {
        hasTop: !!imageData?.top,
        hasBottom: !!imageData?.bottom,
        topUrl: imageData?.top?.url?.substring(0, 50),
        bottomUrl: imageData?.bottom?.url?.substring(0, 50),
        allViews: Object.keys(imageData || {}),
      });

      // Fetch tech files (sketches and closeups) for this product
      let techFilesData: any = null;
      try {
        console.log("📦 Fetching tech files for storage...", {
          productId: existing_project_id,
          revisionId: selected_revision_id || 'not specified'
        });

        // Build query - include all tech file types
        let storageQuery = supabase
          .from("tech_files")
          .select("*")
          .eq("product_idea_id", existing_project_id)
          .in("file_type", ["sketch", "closeup", "component", "base_view"])
          .eq("status", "completed");

        // 🆕 If revision ID is provided, filter by it
        if (selected_revision_id) {
          storageQuery = storageQuery.eq("revision_id", selected_revision_id);
          console.log("✅ Filtering stored tech files by revision ID:", selected_revision_id);
        }

        const { data: techFiles, error: techFilesError } = await storageQuery.order("created_at", { ascending: false });

        console.log("📊 Tech files query result:", {
          error: techFilesError,
          filesCount: techFiles?.length || 0,
          files: techFiles?.map((f: any) => ({ id: f.id, type: f.file_type, view: f.view_type }))
        });

        if (!techFilesError && techFiles && techFiles.length > 0) {
          // Organize tech files by type
          const sketches = techFiles.filter((f: any) => f.file_type === "sketch");
          const closeups = techFiles.filter((f: any) => f.file_type === "closeup");
          const components = techFiles.filter((f: any) => f.file_type === "component");
          const baseViews = techFiles.filter((f: any) => f.file_type === "base_view");

          console.log("📦 Building tech files data:", {
            sketchesCount: sketches.length,
            closeupsCount: closeups.length,
            componentsCount: components.length,
            baseViewsCount: baseViews.length
          });

          techFilesData = {
            sketches: sketches.map((sketch: any) => ({
              id: sketch.id,
              viewType: sketch.view_type,
              imageUrl: sketch.file_url,
              thumbnailUrl: sketch.thumbnail_url,
              callouts: sketch.analysis_data?.callouts || [],
              measurements: sketch.analysis_data?.measurements || [],
              summary: sketch.analysis_data?.summary || null,
              confidenceScore: sketch.confidence_score,
              createdAt: sketch.created_at,
            })),
            closeups: closeups.map((closeup: any) => ({
              id: closeup.id,
              shotName: closeup.file_category,
              imageUrl: closeup.file_url,
              thumbnailUrl: closeup.thumbnail_url,
              analysisData: closeup.analysis_data,
              summary: closeup.analysis_data?.summary || null,
              confidenceScore: closeup.confidence_score,
              createdAt: closeup.created_at,
            })),
            components: components.map((component: any) => ({
              id: component.id,
              componentName: component.file_category || component.analysis_data?.component_name || "Unknown Component",
              imageUrl: component.file_url,
              thumbnailUrl: component.thumbnail_url,
              material: component.analysis_data?.material || component.analysis_data?.summary?.material || "",
              description: component.analysis_data?.description || component.analysis_data?.summary?.description || "",
              specifications: component.analysis_data?.specifications || component.analysis_data?.summary?.specifications || {},
              sourcingNotes: component.analysis_data?.sourcing_notes || "",
              color: component.analysis_data?.color || "",
              confidenceScore: component.confidence_score,
              createdAt: component.created_at,
            })),
            baseViews: baseViews.map((baseView: any) => ({
              id: baseView.id,
              viewType: baseView.view_type,
              imageUrl: baseView.file_url,
              thumbnailUrl: baseView.thumbnail_url,
              analysis: baseView.analysis_data?.analysis || baseView.analysis_data?.summary || {},
              materials: baseView.analysis_data?.materials || [],
              constructionDetails: baseView.analysis_data?.construction || [],
              designElements: baseView.analysis_data?.design_elements || [],
              confidenceScore: baseView.confidence_score,
              createdAt: baseView.created_at,
            })),
            totalSketches: sketches.length,
            totalCloseups: closeups.length,
            totalComponents: components.length,
            totalBaseViews: baseViews.length,
          };

          console.log("✅ Fetched tech files data:", {
            sketchCount: sketches.length,
            closeupCount: closeups.length,
            componentCount: components.length,
            baseViewCount: baseViews.length,
            hasSummaries: {
              sketches: sketches.some((s: any) => s.analysis_data?.summary),
              closeups: closeups.some((c: any) => c.analysis_data?.summary),
            },
          });
        } else {
          console.log("⚠️ No tech files found for this product");
        }
      } catch (error) {
        console.error("Error fetching tech files:", error);
        // Non-fatal: continue without tech files data
      }

      console.log("💾 About to update product_ideas with tech_files_data:", {
        productId: existing_project_id,
        hasTechFilesData: !!techFilesData,
        techFilesDataKeys: techFilesData ? Object.keys(techFilesData) : null,
        sketchCount: techFilesData?.totalSketches || 0,
        closeupCount: techFilesData?.totalCloseups || 0,
        componentCount: techFilesData?.totalComponents || 0,
        baseViewCount: techFilesData?.totalBaseViews || 0,
      });

      // Extract and normalize category from tech pack
      // First try direct category field, then fallback to extracting from category_Subcategory
      const { normalizeCategory, extractCategoryFromSubcategory } = await import("@/lib/constants/product-categories");
      const extractedCategorySubcategory = techpack?.category_Subcategory || null;
      let extractedCategory = null;

      console.log("🏷️ generateIdea UPDATE path - Category extraction:", {
        hasCategory: !!techpack?.category,
        categoryValue: techpack?.category,
        hasSubcategory: !!extractedCategorySubcategory,
        subcategoryValue: extractedCategorySubcategory,
        productName: techpack?.productName,
      });

      if (techpack?.category) {
        extractedCategory = normalizeCategory(techpack.category);
        console.log("🏷️ Using direct category:", techpack.category, "→", extractedCategory);
      } else if (extractedCategorySubcategory) {
        // Fallback: extract category from category_Subcategory (e.g., "Apparel → Shorts → Casual" -> "apparel")
        const categoryFromSubcategory = extractCategoryFromSubcategory(extractedCategorySubcategory);
        extractedCategory = normalizeCategory(categoryFromSubcategory);
        console.log("🏷️ Extracted from subcategory:", extractedCategorySubcategory, "→", categoryFromSubcategory, "→", extractedCategory);
      } else {
        console.log("🏷️ No category found in tech pack, will be NULL");
      }

      const { error } = await supabase
        .from("product_ideas")
        .update({
          tech_pack: techpack,
          image_data: imageData,
          tech_files_data: techFilesData, // Add tech files data filtered by selected_revision_id
          selected_revision_id: selected_revision_id || null, // Store which revision was used for this data
          category: extractedCategory, // Store normalized category
          category_subcategory: extractedCategorySubcategory, // Store detailed category with subcategories
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing_project_id);

      if (error) {
        console.error("Error updating project:", error);
      } else if (imageData && Object.keys(imageData).length > 0 && existing_project_id) {
        // For edited products, update the image_data field
        // NOTE: Revision creation for edits should happen through applyMultiViewEdit
        // or other editor functions that properly increment revision numbers
        // saveInitialRevisions only creates revision 0, which already exists for edited products
        console.log("✅ Product images updated successfully");
      }
    } else {
      console.log("🆕 Creating NEW product with imageData:", {
        hasImageData: !!imageData,
        imageDataKeys: imageData ? Object.keys(imageData) : [],
        imageDataStructure: imageData
          ? Object.keys(imageData).map((k) => ({
              view: k,
              hasUrl: !!(imageData as any)[k]?.url,
              urlPreview: (imageData as any)[k]?.url?.substring(0, 50),
            }))
          : [],
      });

      // Extract and normalize category from tech pack for new products
      // First try direct category field, then fallback to extracting from category_Subcategory
      const { normalizeCategory: normalizeCategoryForInsert, extractCategoryFromSubcategory: extractCategoryForInsert } = await import("@/lib/constants/product-categories");
      const newProductCategorySubcategory = techpack?.category_Subcategory || null;
      let newProductCategory = null;

      if (techpack?.category) {
        newProductCategory = normalizeCategoryForInsert(techpack.category);
      } else if (newProductCategorySubcategory) {
        // Fallback: extract category from category_Subcategory (e.g., "Apparel → Shorts → Casual" -> "apparel")
        const categoryFromSubcategory = extractCategoryForInsert(newProductCategorySubcategory);
        newProductCategory = normalizeCategoryForInsert(categoryFromSubcategory);
      }

      const { data, error } = await supabase
        .from("product_ideas")
        .insert({
          id: projectIdForGeneration, // Use the pre-generated ID
          user_id: user.id,
          prompt: user_prompt,
          tech_pack: techpack,
          image_data: imageData,
          category: newProductCategory, // Store normalized category
          category_subcategory: newProductCategorySubcategory, // Store detailed category with subcategories
          status: "Completed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating project:", error);
      } else if (data) {
        project_id = data.id;
        console.log("✅ Product created with ID:", project_id);

        // Create initial revision and analyze images
        console.log("🔍 Checking if we should create revisions:", {
          hasImageData: !!imageData,
          imageDataLength: imageData ? Object.keys(imageData).length : 0,
          hasProjectId: !!project_id,
          willCreateRevisions: imageData && Object.keys(imageData).length > 0 && project_id,
        });

        if (imageData && Object.keys(imageData).length > 0 && project_id) {
          // Create initial revision (revision 0) for tracking
          console.log("Creating initial revision (revision 0) for product:", project_id);
          let revisionId: string | undefined;
          let revisionNumber = 0;

          try {
            console.log("📝 Calling createInitialProductRevision with:", {
              productId: project_id,
              viewCount: Object.keys(imageData).length,
              views: Object.keys(imageData),
            });

            const revisionResult = await createInitialProductRevision({
              productId: project_id,
              views: imageData,
              userPrompt: user_prompt,
              productName: techpack?.productName || "Product",
            });

            console.log("📝 createInitialProductRevision result:", revisionResult);

            if (revisionResult.success) {
              console.log("✅ Initial revision created successfully:", {
                revisionId: revisionResult.revisionId,
                revisionNumber: revisionResult.revisionNumber,
                batchId: revisionResult.batchId,
              });
              revisionId = revisionResult.revisionId;
              revisionNumber = revisionResult.revisionNumber || 0;
            } else {
              console.error("❌ Error creating initial revision:", revisionResult.error);
              // Non-fatal: revision tracking is optional, continue with analysis
            }
          } catch (error) {
            console.error("❌ Exception creating initial revision:", error);
            // Non-fatal: revision tracking is optional, continue with analysis
          }

          // NOTE: Revisions are already created by createInitialProductRevision above
          // No need to call saveInitialRevisions again as it would create duplicates or conflicts
          // createInitialProductRevision handles the multi-view revision system correctly
          console.log("✅ Initial revisions already created by createInitialProductRevision");

          // Trigger image analysis in background - don't block the response
          console.log("Starting background image analysis for product:", project_id);

          // Run analysis asynchronously without awaiting (only if project_id exists)
          if (project_id) {
            const productIdForAnalysis = project_id; // Capture the value for the closure
            import("./analyze-product-images")
              .then(({ analyzeAndSaveProductImages }) => {
                return analyzeAndSaveProductImages(
                  productIdForAnalysis,
                  imageData,
                  techpack?.productName || "Product",
                  revisionId || null,
                  revisionNumber
                );
              })
              .then((analysisResult) => {
                if (analysisResult.success) {
                  console.log("Background image analysis completed for product:", project_id);
                } else {
                  console.error("Background image analysis failed:", analysisResult.error);
                }
              })
              .catch((analysisError) => {
                console.error("Error during background image analysis:", analysisError);
                // Non-critical - analysis runs in background
              });
          }
        } else {
          // Log why revisions weren't created
          console.warn("⚠️ SKIPPING revision creation:", {
            hasImageData: !!imageData,
            imageDataKeys: imageData ? Object.keys(imageData) : "N/A",
            imageDataLength: imageData ? Object.keys(imageData).length : 0,
            hasProjectId: !!project_id,
            projectId: project_id || "N/A",
          });
        }
      }
    }

    revalidatePath("/idea-upload");
    revalidatePath("/dashboard/products");

    const finalResult = {
      success: true,
      techpack,
      image:
        imageData && Object.keys(imageData).length > 0
          ? {
              front: imageData.front || null,
              back: imageData.back || null,
              side: imageData.side || null,
              top: imageData.top || null,
              bottom: imageData.bottom || null,
              illustration: imageData.illustration || null,
            }
          : undefined,
      project_id,
    };

    console.log("🎉 === END generateIdea === Final result:", {
      success: finalResult.success,
      hasTechPack: !!finalResult.techpack,
      techPackSections: finalResult.techpack ? Object.keys(finalResult.techpack) : [],
      projectId: finalResult.project_id,
      hasImages: !!finalResult.image,
      imageViews: finalResult.image ? Object.keys(finalResult.image).filter((k) => (finalResult.image as any)[k]) : [],
      hasTopView: !!finalResult.image?.top,
      topViewUrl: finalResult.image?.top?.url?.substring(0, 50),
    });

    return finalResult;
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
