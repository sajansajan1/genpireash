/**
 * Image Analysis Service for Product Type Detection
 *
 * This service analyzes reference images to identify the exact product type
 * before generation to ensure consistency when modifying existing products
 */

import OpenAI from "openai";
import { convertImageToBase64 } from "@/lib/services/image-analysis-service";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface ProductAnalysis {
  productType: string; // e.g., "luxury SUV car", "work backpack", "wireless headphones"
  category: string; // e.g., "vehicle", "bag", "electronics"
  currentColor: string; // e.g., "black", "navy blue", "red and orange"
  keyFeatures: string[]; // e.g., ["four doors", "roof rack", "alloy wheels"]
  style: string; // e.g., "modern", "sporty", "professional"
  viewAngle: string; // e.g., "front", "side", "three-quarter"
  materials?: string[]; // e.g., ["leather", "metal", "plastic"]
  brand?: string; // If visible
  productName?: string; // Extracted product name
}

/**
 * Analyze a product image to extract detailed information
 * This is critical for maintaining product identity during modifications
 */
export async function analyzeProductImage(
  imageUrl: string | null,
  userModification?: string
): Promise<ProductAnalysis | null> {
  if (!imageUrl) {
    console.warn("No image URL provided for analysis");
    return null;
  }

  try {
    // Convert image to base64 using the existing working function
    let base64Image: string | null = null;

    try {
      base64Image = await convertImageToBase64(imageUrl);
    } catch (conversionError) {
      console.error("Error converting image to base64:", conversionError);
      console.log("Image URL that failed:", imageUrl);
    }

    if (!base64Image) {
      console.warn(
        "Failed to convert image to base64, trying direct URL analysis"
      );
      // Fallback: try using the URL directly with OpenAI
      // This might work if the URL is publicly accessible
      base64Image = imageUrl;
    }

    // Create a detailed analysis prompt
    const analysisPrompt = `Analyze this product image in detail and provide a JSON response with the following information:

{
  "productType": "Be VERY specific - e.g., 'luxury SUV car', 'over-ear wireless headphones', 'leather work backpack'",
  "category": "The general category - e.g., 'vehicle', 'electronics', 'bag', 'clothing'",
  "currentColor": "The exact current color(s) of the product",
  "keyFeatures": ["List ALL distinguishing features visible in the image"],
  "style": "The design style - e.g., 'modern', 'classic', 'sporty', 'professional'",
  "viewAngle": "What view is shown - e.g., 'front', 'side', 'three-quarter'",
  "materials": ["List visible materials if identifiable"],
  "brand": "Brand name if visible"
}

${
  userModification
    ? `The user wants to: "${userModification}"
CRITICAL: Identify the EXACT product shown so we can apply ONLY this modification while keeping everything else identical.`
    : ""
}

Respond ONLY with the JSON object, no additional text.`;

    // Send to OpenAI for analysis (using GPT-4o with vision)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing product images and identifying exact product types. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url:
                  base64Image.startsWith("data:") ||
                  base64Image.startsWith("http")
                    ? base64Image
                    : `data:image/jpeg;base64,${base64Image}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content || "{}";

    // Parse the JSON response
    try {
      // Clean the response - remove any markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const analysis = JSON.parse(cleanedText) as ProductAnalysis;

      console.log("Product Analysis Result:", analysis);
      return analysis;
    } catch (parseError) {
      console.error("Failed to parse analysis response:", parseError);
      console.log("Raw response:", text);

      // Fallback: try to extract key information manually
      return {
        productType: "product",
        category: "general",
        currentColor: "unknown",
        keyFeatures: [],
        style: "standard",
        viewAngle: "front",
        materials: [],
        brand: undefined,
      };
    }
  } catch (error) {
    console.error("Error analyzing product image:", error);
    return null;
  }
}

/**
 * Extract a concise product name from an image
 * Used to display in the UI header
 */
export async function extractProductName(
  imageUrl: string | null
): Promise<string | null> {
  if (!imageUrl) {
    return null;
  }

  try {
    // Convert image to base64
    let base64Image: string | null = null;
    try {
      base64Image = await convertImageToBase64(imageUrl);
    } catch (error) {
      console.error("Error converting image for name extraction:", error);
      return null;
    }

    if (!base64Image) {
      return null;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a product identification expert. Analyze the image and provide a concise, specific product name.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Look at this product image and give me a short, specific product name (2-4 words max). Examples: 'Gaming Chair', 'Office Chair', 'Sports Car', 'Luxury SUV', 'Running Shoes', 'Backpack', 'Smart Watch'. Just return the product name, nothing else.",
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 20,
    });

    const productName = response.choices[0]?.message?.content?.trim() || null;
    console.log("Extracted product name:", productName);
    return productName;
  } catch (error) {
    console.error("Error extracting product name:", error);
    return null;
  }
}

/**
 * Build a modification prompt that preserves product identity
 * This ensures the AI modifies the SAME product rather than generating a new one
 */
export function buildModificationPrompt(
  analysis: ProductAnalysis,
  userRequest: string,
  view: "front" | "back" | "side"
): string {
  // Determine what the user is trying to change
  const isColorChange =
    userRequest.toLowerCase().includes("color") ||
    userRequest.toLowerCase().includes("colour");
  const isMaterialChange =
    userRequest.toLowerCase().includes("material") ||
    userRequest.toLowerCase().includes("fabric");

  // Build a very specific prompt that maintains product identity
  let prompt = `CRITICAL PRODUCT MODIFICATION INSTRUCTION:

You are modifying an existing ${analysis.productType} - DO NOT generate a different product!

CURRENT PRODUCT DETAILS:
- Product: ${analysis.productType}
- Category: ${analysis.category}
- Current Color: ${analysis.currentColor}
- Key Features That MUST Be Preserved: ${analysis.keyFeatures.join(", ")}
- Style: ${analysis.style}
${analysis.brand ? `- Brand: ${analysis.brand}` : ""}

USER'S MODIFICATION REQUEST: "${userRequest}"

GENERATION REQUIREMENTS:
1. Generate the EXACT SAME ${analysis.productType} - not a different product
2. Apply ONLY the user's requested change: ${userRequest}
3. Keep ALL other features identical:
   - Same shape and proportions
   - Same design elements
   - Same features (${analysis.keyFeatures.join(", ")})
   - Same style (${analysis.style})
4. Show the ${view} view of the modified ${analysis.productType}

CRITICAL RULES:
- If user says "change color to orange", make THIS ${analysis.productType} orange
- DO NOT switch product categories (e.g., don't change a car to headphones)
- DO NOT change the fundamental design
- DO NOT add or remove features unless specifically requested
- The product must fill 85% of the frame

Generate a photorealistic ${view} view of the ${analysis.productType} with the modification: ${userRequest}
Keep everything else EXACTLY as described above.`;

  return prompt;
}

/**
 * Validate if a generated image matches the expected product type
 * This can be used as a safety check after generation
 */
export async function validateGeneratedImage(
  generatedImageUrl: string,
  expectedProductType: string,
  expectedModification: string
): Promise<{ isValid: boolean; reason?: string }> {
  try {
    const analysis = await analyzeProductImage(generatedImageUrl);

    if (!analysis) {
      return { isValid: false, reason: "Failed to analyze generated image" };
    }

    // Check if the product category matches
    const expectedCategory = expectedProductType.toLowerCase();
    const actualCategory = analysis.productType.toLowerCase();

    // Flexible matching - check if key words match
    const expectedWords = expectedCategory.split(" ");
    const actualWords = actualCategory.split(" ");

    const hasMatchingWords = expectedWords.some((word) =>
      actualWords.some(
        (actual) => actual.includes(word) || word.includes(actual)
      )
    );

    if (!hasMatchingWords) {
      return {
        isValid: false,
        reason: `Generated ${analysis.productType} instead of ${expectedProductType}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error validating generated image:", error);
    return { isValid: true }; // Don't block on validation errors
  }
}
