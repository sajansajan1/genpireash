import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, message, techPack, activeSection } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build context from tech pack data
    const productName = techPack?.productName || "Product";
    const productOverview = techPack?.productOverview || "";
    const materials = techPack?.materials || [];
    const dimensions = techPack?.dimensions || {};
    const colors = techPack?.colors || {};
    const constructionDetails = techPack?.constructionDetails || {};
    const hardwareComponents = techPack?.hardwareComponents || {};
    const packaging = techPack?.packaging || {};
    const careInstructions = techPack?.careInstructions || "";
    const qualityStandards = techPack?.qualityStandards || "";
    const productionNotes = techPack?.productionNotes || "";
    const category = techPack?.category_Subcategory || "";

    // Build a structured context for the AI
    const contextParts: string[] = [];

    if (productName) contextParts.push(`Product Name: ${productName}`);
    if (category) contextParts.push(`Category: ${category}`);
    if (productOverview) contextParts.push(`Overview: ${productOverview}`);

    if (materials.length > 0) {
      const materialsText = materials
        .map(
          (m: any) =>
            `- ${m.component}: ${m.material}${m.notes ? ` (${m.notes})` : ""}`
        )
        .join("\n");
      contextParts.push(`Materials:\n${materialsText}`);
    }

    if (Object.keys(dimensions).length > 0) {
      const dimensionsText = Object.entries(dimensions)
        .map(
          ([key, val]: [string, any]) =>
            `- ${key}: ${val?.value || val}${val?.tolerance ? ` (±${val.tolerance})` : ""}`
        )
        .join("\n");
      contextParts.push(`Dimensions:\n${dimensionsText}`);
    }

    if (colors.primaryColors?.length > 0 || colors.accentColors?.length > 0) {
      const colorsList = [
        ...(colors.primaryColors || []).map(
          (c: any) => `${c.name} (${c.hex}) - Primary`
        ),
        ...(colors.accentColors || []).map(
          (c: any) => `${c.name} (${c.hex}) - Accent`
        ),
      ].join(", ");
      contextParts.push(`Colors: ${colorsList}`);
      if (colors.styleNotes) contextParts.push(`Style Notes: ${colors.styleNotes}`);
    }

    if (constructionDetails.description || constructionDetails.constructionFeatures?.length > 0) {
      let constructionText = "";
      if (constructionDetails.description) {
        constructionText += constructionDetails.description + "\n";
      }
      if (constructionDetails.constructionFeatures?.length > 0) {
        constructionText += constructionDetails.constructionFeatures
          .map((f: any) => `- ${f.featureName}: ${f.details}`)
          .join("\n");
      }
      contextParts.push(`Construction Details:\n${constructionText}`);
    }

    if (hardwareComponents.hardware?.length > 0 || hardwareComponents.description) {
      let hardwareText = hardwareComponents.description || "";
      if (hardwareComponents.hardware?.length > 0) {
        hardwareText += (hardwareText ? "\n" : "") + "Hardware: " + hardwareComponents.hardware.join(", ");
      }
      contextParts.push(`Hardware Components:\n${hardwareText}`);
    }

    if (packaging.description || packaging.materials?.length > 0) {
      let packagingText = packaging.description || "";
      if (packaging.materials?.length > 0) {
        packagingText += (packagingText ? "\n" : "") + "Materials: " + packaging.materials.join(", ");
      }
      contextParts.push(`Packaging:\n${packagingText}`);
    }

    if (careInstructions) contextParts.push(`Care Instructions: ${careInstructions}`);
    if (qualityStandards) contextParts.push(`Quality Standards: ${qualityStandards}`);
    if (typeof productionNotes === "string" && productionNotes) {
      contextParts.push(`Production Notes: ${productionNotes}`);
    }

    const productContext = contextParts.join("\n\n");

    const systemPrompt = `You are a helpful product assistant for "${productName}". You help users understand this product's details, materials, construction, and specifications.

PRODUCT INFORMATION:
${productContext}

CURRENT SECTION: ${activeSection}

GUIDELINES:
- Answer questions about this product based on the information provided
- Be helpful, concise, and informative
- If asked about something not in the product data, politely explain that information isn't available
- Keep responses focused and relevant to the product
- Use markdown formatting for clarity when helpful
- If the user asks a general question, try to relate it to this product's features`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Public product chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your question. Please try again.",
        response: "Sorry, I encountered an error. Please try again.",
      },
      { status: 500 }
    );
  }
}
