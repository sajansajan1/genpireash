"use server";

/**
 * AI-powered Product Category Classifier
 * Uses OpenAI for accurate product category and subcategory classification
 */

import { getOpenAIClientSingleton } from "@/lib/ai/openai-client";
import {
  PRODUCT_CATEGORIES,
  CATEGORY_SUBCATEGORIES,
  type ProductCategory,
} from "@/lib/constants/product-categories";

export interface CategoryClassification {
  category: ProductCategory;
  subcategory: string;
  confidence: number;
}

/**
 * Classifies a product into category and subcategory using OpenAI
 * @param productDescription - The product name or description to classify
 * @returns CategoryClassification with category, subcategory, and confidence
 */
export async function classifyProductWithAI(
  productDescription: string
): Promise<CategoryClassification> {
  if (!productDescription || productDescription.trim().length === 0) {
    return {
      category: "other",
      subcategory: "general",
      confidence: 0,
    };
  }

  try {
    const openai = getOpenAIClientSingleton();

    // Build subcategories reference for the prompt
    const subcategoriesReference = Object.entries(CATEGORY_SUBCATEGORIES)
      .map(([cat, subs]) => `${cat}: ${subs.join(", ")}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert product classifier. Your task is to accurately classify products into predefined categories and subcategories.

AVAILABLE CATEGORIES (choose exactly one):
${PRODUCT_CATEGORIES.join(", ")}

SUBCATEGORIES FOR EACH CATEGORY:
${subcategoriesReference}

IMPORTANT CLASSIFICATION RULES:
1. A backpack is a BAG, not furniture
2. A sports bag/gym bag is a BAG
3. Clothing items (shirts, pants, hoodies) are APPAREL
4. Shoes, sneakers, boots are FOOTWEAR
5. Watches, belts, scarves are ACCESSORIES
6. Necklaces, rings, bracelets are JEWELLERY
7. Caps, hats, beanies are HATS
8. Tables, chairs, desks are FURNITURE
9. Plush toys, dolls are TOYS
10. If the product doesn't clearly fit any category, use "other"

Respond ONLY with valid JSON in this exact format:
{"category": "category_name", "subcategory": "subcategory_name", "confidence": 0.95}

The confidence should be between 0 and 1, where 1 means absolutely certain.`,
        },
        {
          role: "user",
          content: `Classify this product: "${productDescription}"`,
        },
      ],
      temperature: 0.1, // Low temperature for consistent classification
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      console.error("Empty response from OpenAI classification");
      return {
        category: "other",
        subcategory: "general",
        confidence: 0,
      };
    }

    // Parse JSON response
    const parsed = JSON.parse(content);

    // Validate category
    const category = PRODUCT_CATEGORIES.includes(parsed.category?.toLowerCase())
      ? (parsed.category.toLowerCase() as ProductCategory)
      : "other";

    // Validate subcategory
    const validSubcategories = CATEGORY_SUBCATEGORIES[category];
    const subcategory = validSubcategories.includes(parsed.subcategory?.toLowerCase())
      ? parsed.subcategory.toLowerCase()
      : validSubcategories[0] || "general";

    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.8;

    console.log("🤖 AI Category Classification:", {
      input: productDescription,
      category,
      subcategory,
      confidence,
    });

    return {
      category,
      subcategory,
      confidence,
    };
  } catch (error) {
    console.error("Error classifying product with AI:", error);
    // Fallback to "other" category on error
    return {
      category: "other",
      subcategory: "general",
      confidence: 0,
    };
  }
}

/**
 * Batch classify multiple products
 * More efficient than calling classifyProductWithAI multiple times
 */
export async function batchClassifyProductsWithAI(
  productDescriptions: string[]
): Promise<CategoryClassification[]> {
  // For small batches, classify individually
  if (productDescriptions.length <= 3) {
    return Promise.all(productDescriptions.map(classifyProductWithAI));
  }

  try {
    const openai = getOpenAIClientSingleton();

    const subcategoriesReference = Object.entries(CATEGORY_SUBCATEGORIES)
      .map(([cat, subs]) => `${cat}: ${subs.join(", ")}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert product classifier. Classify each product into predefined categories and subcategories.

AVAILABLE CATEGORIES: ${PRODUCT_CATEGORIES.join(", ")}

SUBCATEGORIES:
${subcategoriesReference}

RULES:
- Backpacks/bags → bags
- Clothing → apparel
- Shoes → footwear
- Watches/belts → accessories
- Jewelry → jewellery
- Caps/hats → hats
- Tables/chairs → furniture
- Plush/dolls → toys

Respond with a JSON array of objects, one for each product:
[{"category": "...", "subcategory": "...", "confidence": 0.95}, ...]`,
        },
        {
          role: "user",
          content: `Classify these products:\n${productDescriptions.map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      return productDescriptions.map(() => ({
        category: "other" as ProductCategory,
        subcategory: "general",
        confidence: 0,
      }));
    }

    const parsed = JSON.parse(content);

    return parsed.map((item: any, index: number) => {
      const category = PRODUCT_CATEGORIES.includes(item.category?.toLowerCase())
        ? (item.category.toLowerCase() as ProductCategory)
        : "other";

      const validSubcategories = CATEGORY_SUBCATEGORIES[category];
      const subcategory = validSubcategories.includes(item.subcategory?.toLowerCase())
        ? item.subcategory.toLowerCase()
        : validSubcategories[0] || "general";

      return {
        category,
        subcategory,
        confidence: item.confidence || 0.8,
      };
    });
  } catch (error) {
    console.error("Error batch classifying products:", error);
    return productDescriptions.map(() => ({
      category: "other" as ProductCategory,
      subcategory: "general",
      confidence: 0,
    }));
  }
}
