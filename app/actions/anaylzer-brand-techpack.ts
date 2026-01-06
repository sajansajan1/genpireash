"use server";

import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
// Initialize OpenAI with your server-side API key
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

/**
 * Defines the structure for the Brand DNA profile extracted by the AI.
 */
export type BrandDnaProfile = {
  id: string;
  coreProductAttributes: {
    productName: string | null;
    category: string | null;
    subcategory: string | null;
    season: string | null;
    gender: string | null;
    skuNamingConventions: string | null;
  };
  materialsAndComponents: {
    fabricComposition: string[] | null;
    gsm: string | null;
    trims: string[] | null;
    hardware: string[] | null;
    labels: string[] | null;
  };
  colorData: {
    colorNames: string[] | null;
    pantoneCodes: string[] | null;
    dominantColorFamilies: string[] | null;
  };
  fitAndMeasurements: {
    sizeSpecs: string | null; // Can be a summary or key measurements
    tolerances: string | null;
    silhouettes: string[] | null;
  };
  constructionDetails: {
    stitchTypes: string[] | null;
    seamAllowances: string | null;
    finishingDetails: string | null;
  };
  graphicAndPrintData: {
    artworkPlacement: string | null;
    fileReferences: string[] | null;
    printSizes: string[] | null;
  };
  packagingAndLabeling: {
    packagingTypes: string | null;
    hangTags: string | null;
    labelingDetails: string | null;
  };
  pricingAndCost: {
    targetPrice: number | null;
    landedCost: number | null;
  };
  supplierAndManufacturer: {
    factoryIds: string[] | null;
    regions: string[] | null;
  };
};

/**
 * Server action to analyze raw text from a tech pack and extract structured Brand DNA data using AI.
 * @param rawText - The text content extracted from a PDF, CSV, or Excel file.
 * @returns A structured BrandDnaProfile object or null if an error occurs.
 */
export async function analyzeTechPackAction(rawText: string): Promise<BrandDnaProfile | null> {
  if (!rawText || rawText.trim().length === 0) {
    console.error("Input text is empty.");
    return null;
  }
  console.log("📙 Starting analysis…");
  console.log("📄 Raw text length:", rawText.length);
  const systemPrompt = `You are a highly specialized AI assistant for the fashion industry. Your task is to analyze the text of a product tech pack and extract key information according to the provided JSON schema. You must only return a single, valid JSON object. Do not include any explanatory text or markdown formatting. If a field's value cannot be found in the text, use null for single values or an empty array [] for array values.`;

  const userPrompt = `
    Please analyze the following tech pack text and extract the data into a JSON object matching this exact structure:

    \`\`\`json
    {
      "coreProductAttributes": {
        "productName": "string | null",
        "category": "string | null",
        "subcategory": "string | null",
        "season": "string | null",
        "gender": "string | null",
        "skuNamingConventions": "string | null"
      },
      "materialsAndComponents": {
        "fabricComposition": ["string"],
        "gsm": "string | null",
        "trims": ["string"],
        "hardware": ["string"],
        "labels": ["string"]
      },
      "colorData": {
        "colorNames": ["string"],
        "pantoneCodes": ["string"],
        "dominantColorFamilies": ["string"]
      },
      "fitAndMeasurements": {
        "sizeSpecs": "string | null",
        "tolerances": "string | null",
        "silhouettes": ["string"]
      },
      "constructionDetails": {
        "stitchTypes": ["string"],
        "seamAllowances": "string | null",
        "finishingDetails": "string | null"
      },
      "graphicAndPrintData": {
        "artworkPlacement": "string | null",
        "fileReferences": ["string"],
        "printSizes": ["string"]
      },
      "packagingAndLabeling": {
        "packagingTypes": "string | null",
        "hangTags": "string | null",
        "labelingDetails": "string | null"
      },
      "pricingAndCost": {
        "targetPrice": "number | null",
        "landedCost": "number | null"
      },
      "supplierAndManufacturer": {
        "factoryIds": ["string"],
        "regions": ["string"]
      }
    }
    \`\`\`

    Here is the tech pack text to analyze:
    ---
    ${rawText}
    ---
  `;

  try {
    console.log("📤 Sending request to OpenAI…");
    const response = await openai.chat.completions.create({
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
      temperature: 0.1,
      response_format: { type: "json_object" }, // Ensures the output is a valid JSON object
    });
    console.log("🤖 Received response from OpenAI.");
    const content = response.choices[0]?.message?.content;
    console.log("📄 Raw AI content (preview):", content?.slice(0, 200));
    if (!content) {
      console.error("AI response content is empty.");
      return null;
    }

    console.log("📊 Successfully extracted Brand DNA.");
    // Parse the JSON string into an object and return it
    const profile = JSON.parse(content) as BrandDnaProfile;
    // Assign a new UUID
    profile.id = uuidv4();
    console.log("extract techpack", profile);
    return profile;
  } catch (error) {
    console.error("Error analyzing tech pack with OpenAI:", error);
    return null;
  }
}
