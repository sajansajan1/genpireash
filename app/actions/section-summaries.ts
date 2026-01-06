"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

// Initialize OpenAI client using the same pattern as the rest of the codebase
const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export type SectionKey = "visual" | "factorySpecs" | "specifications" | "construction" | "production";

export interface SectionSummaries {
  visual?: string;
  factorySpecs?: string;
  specifications?: string;
  construction?: string;
  production?: string;
}

interface UpdateSectionSummaryParams {
  productId: string;
  sectionKey: SectionKey;
  summary: string;
}

interface UpdateSectionSummaryResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Update a single section summary in the tech pack
 */
export async function updateSectionSummary(
  params: UpdateSectionSummaryParams
): Promise<UpdateSectionSummaryResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { productId, sectionKey, summary } = params;

    if (!productId) {
      return { success: false, error: "Product ID is required" };
    }

    // Fetch current product to get existing tech_pack
    const { data: currentProduct, error: fetchError } = await supabase
      .from("product_ideas")
      .select("tech_pack")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error("Error fetching product:", fetchError);
      return { success: false, error: "Failed to fetch product" };
    }

    // Build updated tech pack with new section summary
    const currentTechPack = currentProduct.tech_pack || {};
    const currentSummaries = currentTechPack.sectionSummaries || {};

    const updatedTechPack = {
      ...currentTechPack,
      sectionSummaries: {
        ...currentSummaries,
        [sectionKey]: summary,
      },
    };

    // Update the product
    const { data, error } = await supabase
      .from("product_ideas")
      .update({ tech_pack: updatedTechPack })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Error updating section summary:", error);
      return { success: false, error: "Failed to update section summary" };
    }

    revalidatePath(`/product`);

    return { success: true, data };
  } catch (error) {
    console.error("Error in updateSectionSummary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Generate a section summary using AI based on the tech pack content
 */
export async function generateSectionSummary(
  productId: string,
  sectionKey: SectionKey
): Promise<{ success: boolean; summary?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch product data
    const { data: product, error: fetchError } = await supabase
      .from("product_ideas")
      .select("tech_pack, category, category_subcategory")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      return { success: false, error: "Failed to fetch product" };
    }

    const techPack = product.tech_pack || {};
    const productName = techPack.productName || "this product";
    const category = product.category || techPack.category || "product";

    // Build context based on section
    const sectionContext = getSectionContext(sectionKey, techPack);

    const prompt = buildSummaryPrompt(sectionKey, productName, category, sectionContext);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a product documentation expert. Generate concise, helpful section summaries that explain the purpose and key content of product tech pack sections. Keep summaries to 2-3 sentences maximum. Be specific to the product type and its characteristics.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      return { success: false, error: "Failed to generate summary" };
    }

    return { success: true, summary };
  } catch (error) {
    console.error("Error generating section summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate summary",
    };
  }
}

/**
 * Generate all missing section summaries for a product
 */
export async function generateAllMissingSummaries(
  productId: string
): Promise<{ success: boolean; summaries?: SectionSummaries; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch product data
    const { data: product, error: fetchError } = await supabase
      .from("product_ideas")
      .select("tech_pack, category, category_subcategory")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      return { success: false, error: "Failed to fetch product" };
    }

    const techPack = product.tech_pack || {};
    const currentSummaries = techPack.sectionSummaries || {};
    const productName = techPack.productName || "this product";
    const category = product.category || techPack.category || "product";

    const sections: SectionKey[] = ["visual", "factorySpecs", "specifications", "construction", "production"];
    const newSummaries: SectionSummaries = { ...currentSummaries };

    // Generate summaries for missing sections
    for (const sectionKey of sections) {
      if (!currentSummaries[sectionKey]) {
        const sectionContext = getSectionContext(sectionKey, techPack);
        const prompt = buildSummaryPrompt(sectionKey, productName, category, sectionContext);

        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a product documentation expert. Generate concise, helpful section summaries that explain the purpose and key content of product tech pack sections. Keep summaries to 2-3 sentences maximum. Be specific to the product type and its characteristics.`,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 200,
            temperature: 0.7,
          });

          const summary = completion.choices[0]?.message?.content?.trim();
          if (summary) {
            newSummaries[sectionKey] = summary;
          }
        } catch (genError) {
          console.error(`Error generating summary for ${sectionKey}:`, genError);
          // Continue with other sections
        }
      }
    }

    // Update tech pack with all new summaries
    const updatedTechPack = {
      ...techPack,
      sectionSummaries: newSummaries,
    };

    const { error: updateError } = await supabase
      .from("product_ideas")
      .update({ tech_pack: updatedTechPack })
      .eq("id", productId);

    if (updateError) {
      console.error("Error updating summaries:", updateError);
      return { success: false, error: "Failed to save summaries" };
    }

    revalidatePath(`/product`);

    return { success: true, summaries: newSummaries };
  } catch (error) {
    console.error("Error in generateAllMissingSummaries:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get relevant context from tech pack for a specific section
 */
function getSectionContext(sectionKey: SectionKey, techPack: any): string {
  switch (sectionKey) {
    case "visual":
      return `Colors: ${JSON.stringify(techPack.colors || {})}`;
    case "factorySpecs":
      return `Has base views, components, sketches, and technical drawings for manufacturing.`;
    case "specifications":
      return `
        Overview: ${techPack.productOverview || ""}
        Materials: ${JSON.stringify(techPack.materials || [])}
        Dimensions: ${JSON.stringify(techPack.dimensions || {})}
        Size Range: ${JSON.stringify(techPack.sizeRange || {})}
      `;
    case "construction":
      return `
        Construction Details: ${JSON.stringify(techPack.constructionDetails || {})}
        Hardware: ${JSON.stringify(techPack.hardwareComponents || {})}
      `;
    case "production":
      return `
        Packaging: ${JSON.stringify(techPack.packaging || {})}
        Care Instructions: ${techPack.careInstructions || ""}
        Quality Standards: ${techPack.qualityStandards || ""}
        Production Notes: ${JSON.stringify(techPack.productionNotes || "")}
        Production Logistics: ${JSON.stringify(techPack.productionLogistics || {})}
      `;
    default:
      return "";
  }
}

/**
 * Build the prompt for generating a section summary
 */
function buildSummaryPrompt(
  sectionKey: SectionKey,
  productName: string,
  category: string,
  context: string
): string {
  const sectionDescriptions: Record<SectionKey, string> = {
    visual: "product images, color palette, and visual appearance",
    factorySpecs: "technical drawings, base views, component breakdowns, sketches, and manufacturing specifications",
    specifications: "product overview, materials used, dimensions, measurements, and size range",
    construction: "construction methods, assembly details, hardware components, and build techniques",
    production: "packaging requirements, care instructions, quality standards, production notes, and manufacturing logistics",
  };

  return `Generate a brief summary (2-3 sentences) for the "${sectionKey}" section of a tech pack for "${productName}" (${category}).

This section covers: ${sectionDescriptions[sectionKey]}

Context from the tech pack:
${context}

Write a helpful summary that explains what this section contains and why it's important for manufacturing this product. Be specific to this product type.`;
}
