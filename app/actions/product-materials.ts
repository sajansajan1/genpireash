"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ProductMaterial {
  component: string;
  material: string;
  specification: string;
  color?: string;
  finish?: string;
  notes?: string;
}

export interface MaterialsData {
  recommended: ProductMaterial[];
  user: ProductMaterial[] | null;
  productType: string;
  source: "ai_generated" | "user_defined" | "hybrid";
  generatedAt: string;
  approvedAt?: string;
}

interface GenerateMaterialsParams {
  productId: string;
  productType?: string;
  productDescription?: string;
  frontImageUrl?: string;
  existingAnalysis?: any; // Base view analysis data if available
  chatContext?: string; // User preferences from chat messages
}

/**
 * Generate AI-recommended materials based on product type and image analysis
 */
export async function generateProductMaterials(
  params: GenerateMaterialsParams
): Promise<{ success: boolean; data?: MaterialsData; error?: string }> {
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

    console.log("[Materials] Using category context:", { category, subcategory, type });

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
        console.log("[Materials] Using existing base view analysis:", techFiles.length, "views");
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
        // Extract material/dimension related messages
        const relevantMessages = extractRelevantChatContext(chatMessages);
        if (relevantMessages) {
          userPreferences = relevantMessages;
          console.log("[Materials] Found relevant chat context:", relevantMessages.substring(0, 100));
        }
      }
    }

    // Build prompt for AI with existing analysis context, user preferences, and category info
    const prompt = buildMaterialsPrompt(type, description, !!imageUrl, analysisData, userPreferences, category, subcategory);

    // Call Gemini for material recommendations
    const materialsResult = await callGeminiForMaterials(prompt, imageUrl);

    if (!materialsResult.success || !materialsResult.materials) {
      return { success: false, error: materialsResult.error || "Failed to generate materials" };
    }

    const materialsData: MaterialsData = {
      recommended: materialsResult.materials,
      user: null,
      productType: type,
      source: "ai_generated",
      generatedAt: new Date().toISOString(),
    };

    return { success: true, data: materialsData };
  } catch (error) {
    console.error("Error generating materials:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate materials",
    };
  }
}

/**
 * Extract material/dimension related context from chat messages
 */
function extractRelevantChatContext(messages: Array<{ role: string; content: string }>): string | null {
  // Keywords that indicate material or dimension preferences
  const materialKeywords = [
    "material", "fabric", "leather", "cotton", "silk", "wool", "polyester", "nylon",
    "canvas", "denim", "linen", "suede", "velvet", "satin", "cashmere",
    "metal", "gold", "silver", "brass", "aluminum", "steel", "copper",
    "wood", "bamboo", "plastic", "rubber", "glass", "ceramic",
    "color", "colour", "black", "white", "red", "blue", "green", "brown", "beige", "tan",
    "finish", "matte", "glossy", "shiny", "textured", "smooth", "embossed",
    "quality", "premium", "luxury", "sustainable", "eco-friendly", "organic", "vegan",
    "lining", "stitching", "hardware", "zipper", "button", "clasp", "strap"
  ];

  const dimensionKeywords = [
    "size", "dimension", "measurement", "height", "width", "length", "depth",
    "weight", "volume", "capacity", "thick", "thin", "large", "small", "medium",
    "cm", "mm", "inch", "meter", "gram", "kg", "pound", "oz"
  ];

  const allKeywords = [...materialKeywords, ...dimensionKeywords];

  const relevantMessages: string[] = [];

  for (const msg of messages) {
    const contentLower = msg.content.toLowerCase();
    const hasRelevantKeyword = allKeywords.some(keyword => contentLower.includes(keyword));

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
 * Save approved materials to the product
 */
export async function saveProductMaterials(
  productId: string,
  materials: MaterialsData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Update the product with materials
    const { error } = await supabase
      .from("product_ideas")
      .update({
        product_materials: materials,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      console.error("Error saving materials:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving materials:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save materials",
    };
  }
}

/**
 * Get existing materials for a product
 */
export async function getProductMaterials(
  productId: string
): Promise<{ success: boolean; data?: MaterialsData | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from("product_ideas")
      .select("product_materials")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching materials:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: product?.product_materials || null };
  } catch (error) {
    console.error("Error fetching materials:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch materials",
    };
  }
}

/**
 * Extract relevant material info from existing analysis
 */
function extractMaterialContext(analysisData: any): string {
  if (!analysisData?.views || !Array.isArray(analysisData.views)) {
    return "";
  }

  const materialDetails: string[] = [];

  for (const view of analysisData.views) {
    const analysis = view.analysis;
    if (!analysis) continue;

    // Extract material/fabric analysis
    if (analysis.material_fabric_analysis) {
      const mfa = analysis.material_fabric_analysis;
      if (mfa.primary_material) {
        materialDetails.push(`Primary Material: ${mfa.primary_material.type || mfa.primary_material}`);
      }
      if (mfa.secondary_materials && Array.isArray(mfa.secondary_materials)) {
        materialDetails.push(`Secondary Materials: ${mfa.secondary_materials.join(", ")}`);
      }
      if (mfa.texture) {
        materialDetails.push(`Texture: ${mfa.texture}`);
      }
      if (mfa.finish) {
        materialDetails.push(`Finish: ${mfa.finish}`);
      }
    }

    // Extract color information
    if (analysis.color_analysis) {
      const ca = analysis.color_analysis;
      if (ca.primary_color) {
        materialDetails.push(`Primary Color: ${ca.primary_color}`);
      }
      if (ca.secondary_colors && Array.isArray(ca.secondary_colors)) {
        materialDetails.push(`Secondary Colors: ${ca.secondary_colors.join(", ")}`);
      }
    }

    // Extract construction details
    if (analysis.construction_details) {
      const cd = analysis.construction_details;
      if (cd.visible_seams) {
        materialDetails.push(`Seam Types: ${cd.visible_seams}`);
      }
      if (cd.hardware) {
        materialDetails.push(`Hardware: ${cd.hardware}`);
      }
    }

    // Extract from detailed observations
    if (analysis.detailed_observations?.material_details) {
      const md = analysis.detailed_observations.material_details;
      if (md.primary_material) {
        materialDetails.push(`Observed Material: ${md.primary_material}`);
      }
      if (md.surface_quality) {
        materialDetails.push(`Surface Quality: ${md.surface_quality}`);
      }
    }
  }

  // Remove duplicates and return
  const uniqueDetails = [...new Set(materialDetails)];
  return uniqueDetails.length > 0
    ? `\n\nEXISTING ANALYSIS DATA (from previous image analysis):\n${uniqueDetails.join("\n")}`
    : "";
}

/**
 * Get category-specific material guidelines
 */
function getCategoryMaterialGuidelines(category: string | null, subcategory: string | null): string {
  if (!category) return "";

  const guidelines: Record<string, string> = {
    apparel: `
APPAREL-SPECIFIC MATERIALS:
- Primary fabric (outer): Consider weight, drape, stretch properties
- Lining fabric: Comfort, breathability, slip properties
- Interfacing: Weight and fusibility for structure
- Trims: Buttons, zippers, elastic, binding
- Thread: Color-matched, appropriate weight`,

    footwear: `
FOOTWEAR-SPECIFIC MATERIALS:
- Upper: Leather, suede, canvas, mesh, synthetic
- Lining: Leather, textile, moisture-wicking fabric
- Insole: EVA, memory foam, leather
- Midsole: EVA, PU, rubber compounds
- Outsole: Rubber, TPR, EVA, leather sole
- Hardware: Eyelets, buckles, zippers`,

    bags: `
BAGS-SPECIFIC MATERIALS:
- Body/Shell: Leather, canvas, nylon, synthetic
- Lining: Cotton, polyester, nylon
- Straps: Same as body or webbing
- Hardware: Metal zippers, buckles, D-rings, clasps
- Reinforcement: Interfacing, foam padding
- Edge finishing: Piping, binding`,

    accessories: `
ACCESSORIES-SPECIFIC MATERIALS:
- Primary material based on accessory type
- For belts: Leather, fabric, elastic
- For wallets: Leather, synthetic leather
- For scarves: Silk, wool, cotton
- Hardware: Buckles, clasps, magnetic closures`,

    jewellery: `
JEWELLERY-SPECIFIC MATERIALS:
- Metal base: Gold, silver, brass, stainless steel
- Plating: Gold/silver/rhodium plating if applicable
- Stones: Gemstones, crystals, cubic zirconia
- Findings: Clasps, earring posts, jump rings
- Chain: Link style and metal type`,

    toys: `
TOYS-SPECIFIC MATERIALS:
- For plush: Outer fabric (minky, fleece, cotton)
- Filling: Polyester fiber, pellets for weight
- Eyes/nose: Safety eyes, embroidered features
- Accessories: Felt, ribbon, buttons (age-appropriate)
- For plastic toys: ABS, PVC, PP plastics`,

    hats: `
HATS-SPECIFIC MATERIALS:
- Crown material: Felt, straw, cotton, wool
- Brim material: Same as crown or contrasting
- Sweatband: Leather, cotton, synthetic
- Lining: Satin, cotton
- Trims: Ribbon, feathers, pins`,

    furniture: `
FURNITURE-SPECIFIC MATERIALS:
- Frame: Wood species, metal type, thickness
- Upholstery: Fabric type, leather grade
- Foam/padding: Density and type
- Hardware: Screws, hinges, drawer slides
- Finish: Stain, lacquer, paint, oil`,

    other: `
GENERAL PRODUCT MATERIALS:
- Primary structural material
- Secondary/accent materials
- Hardware and fasteners
- Finish/coating
- Packaging materials`,
  };

  const categoryLower = category.toLowerCase();
  const baseGuidelines = guidelines[categoryLower] || guidelines.other;

  let subcategoryHint = "";
  if (subcategory) {
    subcategoryHint = `\nSUBCATEGORY: ${subcategory} - Focus on materials typical for this specific product type.`;
  }

  return baseGuidelines + subcategoryHint;
}

/**
 * Build the AI prompt for generating materials
 */
function buildMaterialsPrompt(
  productType: string,
  description: string,
  hasImage: boolean,
  analysisData?: any,
  userPreferences?: string,
  category?: string | null,
  subcategory?: string | null
): string {
  const analysisContext = analysisData ? extractMaterialContext(analysisData) : "";
  const userContext = userPreferences ? `\n\nUSER PREFERENCES (from chat conversation):\n${userPreferences}` : "";
  const categoryGuidelines = getCategoryMaterialGuidelines(category || null, subcategory || null);

  return `You are a product manufacturing expert. Based on the product information provided, recommend the primary materials needed for manufacturing this product.

PRODUCT TYPE: ${productType}
${category ? `PRODUCT CATEGORY: ${category}` : ""}
${subcategory ? `PRODUCT SUBCATEGORY: ${subcategory}` : ""}
PRODUCT DESCRIPTION: ${description}
${hasImage ? "PRODUCT IMAGE: An image of the product is provided for visual reference." : ""}${analysisContext}${userContext}
${categoryGuidelines}

TASK: Generate a list of primary materials needed to manufacture this product. These should be:
1. Based on typical materials used for this product category
2. Include specifications for quality and manufacturing
3. Focus on main components (not fasteners or small hardware)
${analysisContext ? "4. USE the existing analysis data above to inform your material recommendations - be specific about colors, textures, and finishes detected" : ""}
${userPreferences ? `${analysisContext ? "5" : "4"}. PRIORITIZE user preferences mentioned in the chat - if they specified materials, colors, or finishes, use those` : ""}

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no code blocks, just pure JSON):
{
  "materials": [
    {
      "component": "Body/Main Shell",
      "material": "Saffiano Leather",
      "specification": "Full-grain calfskin, 1.2mm thickness",
      "color": "Black",
      "finish": "Matte with embossed pattern",
      "notes": "Premium Italian leather with cross-hatch texture"
    },
    {
      "component": "Lining",
      "material": "Cotton Twill",
      "specification": "100% cotton, 200gsm",
      "color": "Beige",
      "finish": "Smooth",
      "notes": "Signature logo print pattern"
    }
  ],
  "productCategory": "The detected or confirmed product category"
}

IMPORTANT GUIDELINES:
- List 3-8 main materials depending on product complexity
- For bags: body, lining, strap, piping, hardware coating
- For clothing: main fabric, lining, interfacing, trim
- For footwear: upper, lining, sole, insole
- Include material type, grade/quality specification
- Color and finish are optional but helpful
- Notes can include sourcing info or special treatments
- Focus on materials that define the product quality
${analysisContext ? "- Match colors and textures to what was detected in the image analysis" : ""}
${userPreferences ? "- Honor any specific material requests the user made in their chat messages" : ""}

Generate materials that a manufacturer would expect to see in a tech pack.`;
}

/**
 * Call Gemini API to generate materials
 */
async function callGeminiForMaterials(
  prompt: string,
  imageUrl?: string
): Promise<{
  success: boolean;
  materials?: ProductMaterial[];
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
        console.warn("Could not fetch image for materials analysis:", imgError);
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

      if (parsed.materials && Array.isArray(parsed.materials)) {
        return {
          success: true,
          materials: parsed.materials,
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
