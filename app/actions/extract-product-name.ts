"use server";

import OpenAI from "openai";
import { convertImageToBase64 } from "@/lib/services/image-analysis-service";
import { createClient } from "@/lib/supabase/server";

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

/**
 * Server action to extract product name from an image using AI
 * @param imageUrl - URL of the product image
 * @returns Extracted product name or null
 */
export async function extractProductNameAction(
  imageUrl: string | null,
  productId: string | null
): Promise<string | null> {
  console.log("productName", productId);
  const supabase = await createClient();
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
            "You are a product identification expert. Analyze the product image and provide a concise product name and a brief description.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Look at this product image and provide:\n" +
                "1) A short, specific product name (2-4 words max).\n" +
                "2) A brief description of the product (1-2 sentences).\n" +
                "Return the name and description separated by a newline. For example:\n" +
                "Gaming Chair\nA comfortable ergonomic chair designed for gamers.",
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
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content?.trim() || "";
    console.log("Raw extraction result:", content);

    const [name, ...descParts] = content.split("\n");
    const description = descParts.join(" ").trim() || null;

    console.log("Extracted product name:", name);
    console.log("Extracted product description:", description);

    const productName = name || null;
    console.log("Extracted product name:", productName);
    const { data, error } = await supabase
      .from("product_ideas")
      .update({ product_name: productName, product_description: description })
      .eq("id", productId)
      .select();

    if (error) {
      console.error("Update error:", error);
    }

    return productName;
  } catch (error) {
    console.error("Error extracting product name:", error);
    return null;
  }
}
