"use server";

/**
 * PDF Extraction Service
 *
 * AI-powered service for extracting structured product data from PDF spec sheets.
 * Uses OpenAI Vision API to analyze PDF content and extract:
 * - Product name and reference number
 * - Materials and composition
 * - Color palette with hex/pantone codes
 * - Sizing grading tables
 * - Dimensions and measurements
 * - Design images (front/back/sides)
 */

import OpenAI from "openai";

// ============================================================================
// TYPES
// ============================================================================

export interface ExtractedMaterial {
    name: string;
    percentage?: string;
    placement?: string;
    description?: string;
}

export interface ExtractedColor {
    name: string;
    hex?: string;
    pantone?: string;
    usage?: string;
}

export interface SizeGrading {
    size: string;
    measurements: Record<string, string>;
}

export interface ExtractedImage {
    view: string; // "front", "back", "side", "detail", etc.
    imageData: string; // base64 data URL
    description?: string;
}

export interface PDFExtractedData {
    // Basic Info
    productName: string;
    referenceNumber: string;
    productType: string;
    category: string;
    description: string;

    // Materials
    materials: ExtractedMaterial[];

    // Colors
    colorPalette: ExtractedColor[];

    // Sizing
    sizingGrading: SizeGrading[];
    availableSizes: string[];

    // Dimensions
    dimensions: Record<string, string>;

    // Images extracted from PDF
    designImages: ExtractedImage[];

    // Additional specifications
    additionalSpecs: Record<string, string>;

    // Raw text for reference
    rawText: string;

    // Metadata
    pageCount: number;
    extractionConfidence: number;
}

export interface PDFExtractionResult {
    success: boolean;
    data?: PDFExtractedData;
    error?: string;
}

// ============================================================================
// OPENAI CLIENT
// ============================================================================

function getOpenAIClient(): OpenAI {
    if (typeof window !== "undefined") {
        throw new Error("OpenAI client can only be used on the server");
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("NEXT_PUBLIC_OPENAI_API_KEY environment variable is not set");
    }

    return new OpenAI({ apiKey });
}

// ============================================================================
// EXTRACTION PROMPT
// ============================================================================

const PDF_EXTRACTION_PROMPT = `You are an expert at analyzing product specification sheets and tech packs.
Analyze the provided PDF content (images and text) and extract all relevant product information.

Extract the following data in JSON format:

{
  "productName": "The product name or title",
  "referenceNumber": "Style number, SKU, or reference code",
  "productType": "Type of product (e.g., T-Shirt, Hoodie, Jacket, Pants, Bag)",
  "category": "Product category (e.g., Apparel, Accessories, Footwear)",
  "description": "Brief product description",
  
  "materials": [
    {
      "name": "Material name (e.g., Cotton, Polyester)",
      "percentage": "Percentage if specified (e.g., '100%', '60%')",
      "placement": "Where used (e.g., 'Main Body', 'Lining')",
      "description": "Additional details"
    }
  ],
  
  "colorPalette": [
    {
      "name": "Color name",
      "hex": "Hex code if visible (e.g., '#FF5733')",
      "pantone": "Pantone code if specified",
      "usage": "Where the color is used"
    }
  ],
  
  "sizingGrading": [
    {
      "size": "Size name (e.g., 'S', 'M', 'L', 'XL')",
      "measurements": {
        "chest": "measurement in cm/inches",
        "length": "measurement",
        "sleeve": "measurement"
      }
    }
  ],
  
  "availableSizes": ["XS", "S", "M", "L", "XL", "XXL"],
  
  "dimensions": {
    "length": "Product length",
    "width": "Product width",
    "height": "Product height if applicable"
  },
  
  "additionalSpecs": {
    "care_instructions": "Washing/care info",
    "weight": "Product weight",
    "origin": "Country of origin",
    "season": "Season/collection"
  },
  
  "extractionConfidence": 0.85
}

IMPORTANT:
1. Extract ALL visible information, even if some fields are empty
2. If you see color swatches or images, describe the colors you see
3. For sizing tables, capture all measurements you can read
4. Set extractionConfidence from 0.0-1.0 based on image clarity and data completeness
5. If a field is not found, use null or empty array/object as appropriate
6. Return ONLY valid JSON, no additional text`;

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

/**
 * Extract structured product data from PDF using AI vision analysis
 *
 * @param pdfImages - Array of base64 encoded page images
 * @param pdfText - Extracted text content from PDF
 * @param pageCount - Number of pages in the PDF
 * @returns Extracted product data
 */
export async function extractDataFromPDF(
    pdfImages: string[],
    pdfText: string,
    pageCount: number
): Promise<PDFExtractionResult> {
    try {
        console.log("[PDF Extraction] Starting AI analysis...");
        console.log(`[PDF Extraction] Processing ${pdfImages.length} images, ${pdfText.length} chars of text`);

        const openai = getOpenAIClient();

        // Build the message content with images and text
        const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
            {
                type: "text",
                text: `${PDF_EXTRACTION_PROMPT}\n\nExtracted PDF Text:\n${pdfText.substring(0, 8000)}`,
            },
        ];

        // Add PDF page images (limit to first 10 pages for performance)
        const imagesToProcess = pdfImages.slice(0, 10);
        for (let i = 0; i < imagesToProcess.length; i++) {
            const imageData = imagesToProcess[i];

            // Ensure proper base64 format
            const base64Data = imageData.startsWith("data:")
                ? imageData
                : `data:image/png;base64,${imageData}`;

            content.push({
                type: "image_url",
                image_url: {
                    url: base64Data,
                    detail: "high",
                },
            });
        }

        console.log("[PDF Extraction] Calling OpenAI Vision API...");

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content,
                },
            ],
            max_tokens: 4000,
            temperature: 0.1,
        });

        const responseText = response.choices[0]?.message?.content;
        if (!responseText) {
            throw new Error("No response from OpenAI Vision API");
        }

        console.log("[PDF Extraction] Parsing AI response...");

        // Extract JSON from response (handle markdown code blocks)
        let jsonString = responseText;
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonString = jsonMatch[1].trim();
        }

        // Parse the JSON response
        const extractedData = JSON.parse(jsonString);

        // Build the final result
        const result: PDFExtractedData = {
            productName: extractedData.productName || "",
            referenceNumber: extractedData.referenceNumber || "",
            productType: extractedData.productType || "",
            category: extractedData.category || "",
            description: extractedData.description || "",
            materials: extractedData.materials || [],
            colorPalette: extractedData.colorPalette || [],
            sizingGrading: extractedData.sizingGrading || [],
            availableSizes: extractedData.availableSizes || [],
            dimensions: extractedData.dimensions || {},
            designImages: [], // Will be populated separately from actual image extraction
            additionalSpecs: extractedData.additionalSpecs || {},
            rawText: pdfText,
            pageCount,
            extractionConfidence: extractedData.extractionConfidence || 0.5,
        };

        console.log("[PDF Extraction] Extraction complete:", {
            productName: result.productName,
            materialsCount: result.materials.length,
            colorsCount: result.colorPalette.length,
            sizesCount: result.sizingGrading.length,
        });

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("[PDF Extraction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to extract data from PDF",
        };
    }
}

/**
 * Analyze a single image to identify if it's a product design view
 *
 * @param imageData - Base64 encoded image
 * @returns View type and description if it's a product image
 */
export async function analyzeProductImage(
    imageData: string
): Promise<{ isProductImage: boolean; view?: string; description?: string }> {
    try {
        const openai = getOpenAIClient();

        const base64Data = imageData.startsWith("data:")
            ? imageData
            : `data:image/png;base64,${imageData}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this image and determine if it shows a product design/garment view.
              
If it IS a product image, respond with JSON:
{
  "isProductImage": true,
  "view": "front" | "back" | "side" | "detail" | "flat" | "other",
  "description": "Brief description of what's shown"
}

If it is NOT a product image (e.g., size chart, logo, text, diagram), respond with:
{
  "isProductImage": false
}

Return ONLY valid JSON.`,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Data,
                                detail: "low",
                            },
                        },
                    ],
                },
            ],
            max_tokens: 200,
            temperature: 0,
        });

        const responseText = response.choices[0]?.message?.content;
        if (!responseText) {
            return { isProductImage: false };
        }

        let jsonString = responseText;
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonString = jsonMatch[1].trim();
        }

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("[Image Analysis] Error:", error);
        return { isProductImage: false };
    }
}

/**
 * Filter and categorize extracted images as product design views
 *
 * @param images - Array of base64 encoded images extracted from PDF
 * @returns Categorized product images with view types
 */
export async function categorizeProductImages(
    images: string[]
): Promise<ExtractedImage[]> {
    const productImages: ExtractedImage[] = [];

    // Process images in parallel with limited concurrency
    const batchSize = 3;
    for (let i = 0; i < images.length; i += batchSize) {
        const batch = images.slice(i, i + batchSize);
        const results = await Promise.all(
            batch.map(async (imageData, index) => {
                const normalizedImage = imageData.startsWith("data:")
                    ? imageData
                    : `data:image/png;base64,${imageData}`;
                const analysis = await analyzeProductImage(normalizedImage);
                if (analysis.isProductImage && analysis.view) {
                    return {
                        view: analysis.view,
                        imageData: normalizedImage,
                        description: analysis.description,
                    };
                }
                return null;
            })
        );

        for (const result of results) {
            if (result) {
                productImages.push(result);
            }
        }
    }

    return productImages;
}
