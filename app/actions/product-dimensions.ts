"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ProductDimension {
  value: string;
  unit: string;
}

export interface ProductDimensions {
  height?: ProductDimension;
  width?: ProductDimension;
  length?: ProductDimension;
  weight?: ProductDimension;
  volume?: ProductDimension;
  additionalDimensions?: Array<{
    name: string;
    value: string;
    unit: string;
    description?: string;
  }>;
}

export interface DimensionsData {
  recommended: ProductDimensions;
  user: ProductDimensions | null;
  productType: string;
  marketStandard: string;
  source: "ai_generated" | "user_defined" | "hybrid";
  generatedAt: string;
  approvedAt?: string;
}

interface GenerateDimensionsParams {
  productId: string;
  productType?: string;
  productDescription?: string;
  frontImageUrl?: string;
  existingAnalysis?: any; // Base view analysis data if available
  chatContext?: string; // User preferences from chat messages
}

/**
 * Generate AI-recommended dimensions based on product type and image analysis
 */
export async function generateProductDimensions(
  params: GenerateDimensionsParams
): Promise<{ success: boolean; data?: DimensionsData; error?: string }> {
  try {
    const { productId, productType, productDescription, frontImageUrl, existingAnalysis, chatContext } = params;

    // Fetch product data if needed
    const supabase = await createClient();
    const { data: product, error: fetchError } = await supabase
      .from("product_ideas")
      .select("prompt, tech_pack, image_data, selected_revision_id, category, category_subcategory")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error("Error fetching product:", fetchError);
      return { success: false, error: "Failed to fetch product data" };
    }

    // Use category and subcategory from product_ideas if available (primary source of truth)
    const category = product?.category || null;
    const subcategory = product?.category_subcategory || null;

    // Use provided data or extract from product
    const description = productDescription || product?.prompt || "";
    // Prefer category/subcategory over generic productType
    const type = productType ||
      (category && subcategory ? `${category} - ${subcategory}` : null) ||
      (category ? category : null) ||
      product?.tech_pack?.productInfo?.productType ||
      "Product";
    const imageUrl = frontImageUrl || product?.image_data?.front?.url || "";

    console.log("[Dimensions] Using category context:", { category, subcategory, type });

    // Try to get existing analysis data from tech_files if not provided
    let analysisData = existingAnalysis;
    if (!analysisData && product?.selected_revision_id) {
      const { data: techFiles } = await supabase
        .from("tech_files")
        .select("analysis_data, view_type")
        .eq("product_idea_id", productId)
        .eq("revision_id", product.selected_revision_id)
        .eq("file_type", "base_view")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(3);

      if (techFiles && techFiles.length > 0) {
        // Combine analysis from all views
        analysisData = {
          views: techFiles.map(f => ({
            viewType: f.view_type,
            analysis: f.analysis_data
          }))
        };
        console.log("[Dimensions] Using existing base view analysis:", techFiles.length, "views");
      }
    }

    // Try to get user preferences from chat messages if not provided
    let userPreferences = chatContext;
    if (!userPreferences) {
      const { data: chatMessages } = await supabase
        .from("ai_chat_messages")
        .select("role, content")
        .eq("product_idea_id", productId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (chatMessages && chatMessages.length > 0) {
        // Extract dimension related messages
        const relevantMessages = extractRelevantDimensionContext(chatMessages);
        if (relevantMessages) {
          userPreferences = relevantMessages;
          console.log("[Dimensions] Found relevant chat context:", relevantMessages.substring(0, 100));
        }
      }
    }

    // Build prompt for AI with existing analysis context, user preferences, and category info
    const prompt = buildDimensionsPrompt(type, description, !!imageUrl, analysisData, userPreferences, category, subcategory);

    // Call Gemini for dimension recommendations
    const dimensionsResult = await callGeminiForDimensions(prompt, imageUrl);

    if (!dimensionsResult.success || !dimensionsResult.dimensions) {
      return { success: false, error: dimensionsResult.error || "Failed to generate dimensions" };
    }

    const dimensionsData: DimensionsData = {
      recommended: dimensionsResult.dimensions,
      user: null,
      productType: type,
      marketStandard: dimensionsResult.marketStandard || `Standard ${type} dimensions`,
      source: "ai_generated",
      generatedAt: new Date().toISOString(),
    };

    return { success: true, data: dimensionsData };
  } catch (error) {
    console.error("Error generating dimensions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate dimensions",
    };
  }
}

/**
 * Extract dimension related context from chat messages
 */
function extractRelevantDimensionContext(messages: Array<{ role: string; content: string }>): string | null {
  // Keywords that indicate dimension preferences
  const dimensionKeywords = [
    "size", "dimension", "measurement", "height", "width", "length", "depth",
    "weight", "volume", "capacity", "thick", "thin", "large", "small", "medium",
    "cm", "mm", "inch", "meter", "gram", "kg", "pound", "oz",
    "tall", "short", "wide", "narrow", "heavy", "light", "compact", "oversized",
    "mini", "standard", "xl", "xxl", "plus", "petite", "regular",
    "strap", "handle", "pocket", "compartment", "zipper"
  ];

  const relevantMessages: string[] = [];

  for (const msg of messages) {
    const contentLower = msg.content.toLowerCase();
    const hasRelevantKeyword = dimensionKeywords.some(keyword => contentLower.includes(keyword));

    if (hasRelevantKeyword) {
      const prefix = msg.role === "user" ? "User requested:" : "AI noted:";
      relevantMessages.push(`${prefix} ${msg.content}`);
    }
  }

  if (relevantMessages.length === 0) {
    return null;
  }

  // Return the most recent 5 relevant messages
  return relevantMessages.slice(0, 5).join("\n");
}

/**
 * Extract dimension info from existing analysis
 */
function extractDimensionContext(analysisData: any): string {
  if (!analysisData?.views || !Array.isArray(analysisData.views)) {
    return "";
  }

  const dimensionDetails: string[] = [];

  for (const view of analysisData.views) {
    const analysis = view.analysis;
    if (!analysis) continue;

    // Extract size/scale information
    if (analysis.size_estimation) {
      const se = analysis.size_estimation;
      if (se.estimated_size) {
        dimensionDetails.push(`Estimated Size: ${se.estimated_size}`);
      }
      if (se.relative_scale) {
        dimensionDetails.push(`Relative Scale: ${se.relative_scale}`);
      }
    }

    // Extract from product category hints
    if (analysis.product_category) {
      dimensionDetails.push(`Product Category: ${analysis.product_category}`);
    }

    // Extract visible features that affect dimensions
    if (analysis.construction_details) {
      const cd = analysis.construction_details;
      if (cd.compartments) {
        dimensionDetails.push(`Compartments: ${cd.compartments}`);
      }
      if (cd.pockets) {
        dimensionDetails.push(`Pockets: ${cd.pockets}`);
      }
    }

    // Extract from detailed observations
    if (analysis.detailed_observations?.structural_details) {
      const sd = analysis.detailed_observations.structural_details;
      if (sd.proportions) {
        dimensionDetails.push(`Proportions: ${sd.proportions}`);
      }
    }
  }

  // Remove duplicates and return
  const uniqueDetails = [...new Set(dimensionDetails)];
  return uniqueDetails.length > 0
    ? `\n\nEXISTING ANALYSIS DATA (from previous image analysis):\n${uniqueDetails.join("\n")}`
    : "";
}

/**
 * Save approved dimensions to the product
 */
export async function saveProductDimensions(
  productId: string,
  dimensions: DimensionsData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Update the product with dimensions
    const { error } = await supabase
      .from("product_ideas")
      .update({
        product_dimensions: dimensions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      console.error("Error saving dimensions:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving dimensions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save dimensions",
    };
  }
}

/**
 * Get existing dimensions for a product
 */
export async function getProductDimensions(
  productId: string
): Promise<{ success: boolean; data?: DimensionsData | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from("product_ideas")
      .select("product_dimensions")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching dimensions:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: product?.product_dimensions || null };
  } catch (error) {
    console.error("Error fetching dimensions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch dimensions",
    };
  }
}

/**
 * Get category-specific dimension guidelines
 */
function getCategoryDimensionGuidelines(category: string | null, subcategory: string | null): string {
  if (!category) return "";

  const guidelines: Record<string, string> = {
    apparel: `
APPAREL-SPECIFIC DIMENSIONS:
- Height = Total garment length from highest point to hem
- Width = Chest/bust width measured flat (half circumference for fitted items)
- Length = Back length or depth when folded
- Include: Sleeve length, shoulder width, hem width for relevant items
- Common sizes reference: XS-4XL sizing, consider target market`,

    footwear: `
FOOTWEAR-SPECIFIC DIMENSIONS:
- Height = Shaft height (ankle to top for boots) or heel height
- Width = At widest point of the shoe
- Length = Insole length (use standard sizing: EU 36-46, US 6-12)
- Include: Heel height, platform height, toe box width as additional dimensions
- Weight is critical for shipping - include box weight for retail`,

    bags: `
BAGS-SPECIFIC DIMENSIONS:
- Height = Main compartment height (bottom to top opening)
- Width = Side to side at widest point
- Length = Front to back depth
- Include: Handle drop, strap length (adjustable range), pocket dimensions
- For backpacks: Include laptop compartment size if applicable
- For travel bags: Consider airline carry-on size limits`,

    accessories: `
ACCESSORIES-SPECIFIC DIMENSIONS:
- Adapt measurements to accessory type
- For belts: Length (waist size range), width, buckle dimensions
- For scarves: Length and width
- For wallets: Closed dimensions, card slot count
- For watches: Case diameter, band width, band length`,

    jewellery: `
JEWELLERY-SPECIFIC DIMENSIONS:
- Use mm as primary unit for precision
- For necklaces/chains: Total length, pendant size
- For rings: Inner diameter, band width, stone dimensions
- For bracelets: Inner circumference, clasp size
- For earrings: Drop length, post length, back type`,

    toys: `
TOYS-SPECIFIC DIMENSIONS:
- Height = Standing height or longest dimension
- Consider age-appropriate sizing and safety (no small parts for <3 years)
- For plush toys: Include seated height if different from standing
- Weight affects shipping cost significantly`,

    hats: `
HATS-SPECIFIC DIMENSIONS:
- Height = Crown height
- Width = Brim width
- Length = Head circumference (use S/M/L or cm: 54-62cm typical range)
- Include: Brim depth, crown depth for structured hats`,

    furniture: `
FURNITURE-SPECIFIC DIMENSIONS:
- Height = Floor to top
- Width = Side to side
- Length/Depth = Front to back
- Include: Seat height for chairs, table top thickness, leg dimensions
- Consider assembled vs flat-pack dimensions
- Weight is critical for shipping logistics`,

    other: `
GENERAL PRODUCT DIMENSIONS:
- Height = Vertical measurement in normal use position
- Width = Horizontal measurement left to right
- Length = Front to back depth
- Include any product-specific measurements`,
  };

  const categoryLower = category.toLowerCase();
  const baseGuidelines = guidelines[categoryLower] || guidelines.other;

  // Add subcategory-specific hints if available
  let subcategoryHint = "";
  if (subcategory) {
    subcategoryHint = `\nSUBCATEGORY: ${subcategory} - Apply standard dimensions for this specific product type.`;
  }

  return baseGuidelines + subcategoryHint;
}

/**
 * Build the AI prompt for generating dimensions
 */
function buildDimensionsPrompt(
  productType: string,
  description: string,
  hasImage: boolean,
  analysisData?: any,
  userPreferences?: string,
  category?: string | null,
  subcategory?: string | null
): string {
  const analysisContext = analysisData ? extractDimensionContext(analysisData) : "";
  const userContext = userPreferences ? `\n\nUSER PREFERENCES (from chat conversation):\n${userPreferences}` : "";
  const categoryGuidelines = getCategoryDimensionGuidelines(category || null, subcategory || null);

  return `You are a product manufacturing expert. Based on the product information provided, recommend standard market dimensions for manufacturing.

PRODUCT TYPE: ${productType}
${category ? `PRODUCT CATEGORY: ${category}` : ""}
${subcategory ? `PRODUCT SUBCATEGORY: ${subcategory}` : ""}
PRODUCT DESCRIPTION: ${description}
${hasImage ? "PRODUCT IMAGE: An image of the product is provided for visual reference." : ""}${analysisContext}${userContext}
${categoryGuidelines}

TASK: Generate realistic, market-standard dimensions for this product. These dimensions should be:
1. Based on typical industry standards for this product category
2. Suitable for manufacturing and retail
3. In commonly used units for this product type
${analysisContext ? "4. USE the existing analysis data above to inform your dimension estimates - consider detected features like compartments, pockets, straps" : ""}
${userPreferences ? `${analysisContext ? "5" : "4"}. PRIORITIZE user preferences mentioned in the chat - if they specified sizes, adjust dimensions accordingly` : ""}

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no code blocks, just pure JSON):
{
  "dimensions": {
    "height": { "value": "30", "unit": "cm" },
    "width": { "value": "20", "unit": "cm" },
    "length": { "value": "10", "unit": "cm" },
    "weight": { "value": "500", "unit": "g" },
    "additionalDimensions": [
      {
        "name": "Strap Length",
        "value": "120",
        "unit": "cm",
        "description": "Adjustable shoulder strap"
      }
    ]
  },
  "marketStandard": "Description of the market standard these dimensions are based on",
  "productCategory": "The detected or confirmed product category"
}

CRITICAL REQUIREMENTS:
- YOU MUST ALWAYS PROVIDE ALL 4 CORE DIMENSIONS: height, width, length, and weight
- These 4 fields are MANDATORY and cannot be omitted or left empty
- Even if you need to estimate, provide reasonable market-standard values for all 4

IMPORTANT GUIDELINES:
- Use metric units (cm, g, kg, ml, L) as primary
- Height = vertical measurement when product is in normal position
- Width = horizontal measurement (left to right)
- Length/Depth = front to back measurement
- Weight = total product weight including all components
- For clothing: height=total length, width=chest width, length=depth/thickness when folded
- For bags: height=main compartment height, width=side to side, length=front to back depth
- For footwear: height=ankle/boot height, width=at widest point, length=sole length
- For accessories: adapt measurements to the product shape
- Weight is critical for shipping calculations - always provide it
- Volume is optional and only needed for containers/bottles
- Additional dimensions should be product-specific (e.g., handle drop for bags, collar width for shirts)
${userPreferences ? "- Honor any specific size requests the user made in their chat messages" : ""}

Generate dimensions that a manufacturer would expect to see in a tech pack. Remember: height, width, length, and weight are REQUIRED.`;
}

/**
 * Call Gemini API to generate dimensions
 */
async function callGeminiForDimensions(
  prompt: string,
  imageUrl?: string
): Promise<{
  success: boolean;
  dimensions?: ProductDimensions;
  marketStandard?: string;
  error?: string;
}> {
  try {
    const parts: any[] = [{ text: prompt }];

    // Add image if available
    if (imageUrl) {
      try {
        // Fetch the image and convert to base64
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString("base64");
          const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

          parts.unshift({
            inlineData: {
              mimeType,
              data: base64Image,
            },
          });
        }
      } catch (imgError) {
        console.warn("Could not fetch image for dimension analysis:", imgError);
        // Continue without image
      }
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts },
      config: {
        temperature: 0.3,
      },
    });

    const responseText = result.text || "";

    // Parse the JSON response
    try {
      // Clean up the response - remove any markdown code blocks
      let cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleanedResponse);

      if (parsed.dimensions) {
        return {
          success: true,
          dimensions: parsed.dimensions,
          marketStandard: parsed.marketStandard || "Industry standard dimensions",
        };
      } else {
        return { success: false, error: "Invalid response format from AI" };
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", responseText);
      return { success: false, error: "Failed to parse AI response" };
    }
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to call AI service",
    };
  }
}

/**
 * Check if product has dimensions set
 */
export async function hasProductDimensions(
  productId: string
): Promise<{ success: boolean; hasDimensions: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from("product_ideas")
      .select("product_dimensions")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error checking dimensions:", error);
      return { success: false, hasDimensions: false, error: error.message };
    }

    const hasDimensions = !!(
      product?.product_dimensions &&
      product.product_dimensions.approvedAt
    );

    return { success: true, hasDimensions };
  } catch (error) {
    console.error("Error checking dimensions:", error);
    return {
      success: false,
      hasDimensions: false,
      error: error instanceof Error ? error.message : "Failed to check dimensions",
    };
  }
}
