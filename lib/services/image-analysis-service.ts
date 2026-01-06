"use server";

import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import crypto from "crypto";

const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface ImageAnalysis {
  productType?: string;
  currentColors?: string[];
  materials?: string[];
  textures?: string[];
  keyFeatures?: string[];
  style?: string;
  quality?: string;
  viewSpecificDetails?: {
    front?: string;
    back?: string;
    side?: string;
  };
  spatialGrid?: SpatialGridAnalysis;
  fullAnalysis?: string;
  suggestions?: string[];
  timestamp?: string;
}

export interface SpatialGridAnalysis {
  gridSize: string; // e.g., "4x4"
  squares: GridSquare[];
  dominantRegions?: {
    top?: string;
    middle?: string;
    bottom?: string;
    left?: string;
    right?: string;
    center?: string;
  };
}

export interface GridSquare {
  id: string; // e.g., "A1", "B2", "C3", "D4"
  row: number; // 0-3
  col: number; // 0-3
  position: string; // e.g., "top-left", "center", "bottom-right"
  content: string; // Description of what's in this square
  dominantColor?: string;
  hasProduct: boolean;
  hasBackground: boolean;
  hasText?: boolean;
  hasLogo?: boolean;
  isEmpty?: boolean;
}

export interface AnalysisCacheEntry {
  id?: string;
  image_url: string;
  image_hash?: string;
  analysis_data: ImageAnalysis;
  analysis_prompt?: string;
  model_used: string;
  product_idea_id?: string;
  revision_id?: string;
  created_at?: string;
  tokens_used?: number;
  processing_time_ms?: number;
  confidence_score?: number;
}

/**
 * Generate a hash for an image URL to use as a cache key
 */
function generateImageHash(imageUrl: string): string {
  return crypto.createHash("md5").update(imageUrl).digest("hex");
}

/**
 * Get cached analysis for an image
 */
export async function getCachedImageAnalysis(
  imageUrl: string
): Promise<ImageAnalysis | null> {
  try {
    const supabase = await createClient();

    // Look up analysis by image URL
    const { data, error } = await supabase
      .from("image_analysis_cache")
      .select("analysis_data")
      .eq("image_url", imageUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log("No cached analysis found for image:", imageUrl);
      return null;
    }

    console.log("Found cached analysis for image");
    return data.analysis_data as ImageAnalysis;
  } catch (error) {
    console.error("Error fetching cached analysis:", error);
    return null;
  }
}

/**
 * Save image analysis to cache
 */
export async function saveImageAnalysis(
  imageUrl: string,
  analysis: ImageAnalysis,
  options?: {
    productId?: string;
    revisionId?: string;
    revisionNumber?: number;
    analysisPrompt?: string;
    tokensUsed?: number;
    processingTimeMs?: number;
    modelUsed?: string;
  }
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    const cacheEntry: any = {
      image_url: imageUrl,
      image_hash: generateImageHash(imageUrl),
      analysis_data: analysis,
      model_used: options?.modelUsed || "gpt-4o",
      product_idea_id: options?.productId,
      product_id: options?.productId,
      revision_id: options?.revisionId,
      revision_number: options?.revisionNumber,
      analysis_prompt: options?.analysisPrompt,
      tokens_used: options?.tokensUsed,
      processing_time_ms: options?.processingTimeMs,
      // Set expiry to 30 days from now
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { error } = await supabase
      .from("image_analysis_cache")
      .upsert(cacheEntry, {
        onConflict: "image_url",
      });

    if (error) {
      console.error("Error saving image analysis:", error);
      return false;
    }

    console.log("Image analysis saved to cache");
    return true;
  } catch (error) {
    console.error("Error saving analysis to cache:", error);
    return false;
  }
}

/**
 * Analyze a single image with GPT-4 Vision including spatial grid analysis
 */
/**
 * Helper function to convert image URL to base64 data URL
 */
export async function convertImageToBase64(
  imageUrl: string,
  maxRetries: number = 3
): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Attempting to fetch image (attempt ${attempt}/${maxRetries}):`,
        imageUrl
      );

      // Fetch the image with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          Accept: "image/*",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
      }

      // Convert to buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Get content type and ensure it's supported by OpenAI
      let contentType = response.headers.get("content-type") || "image/png";

      // OpenAI supports: png, jpeg, gif, webp
      // Normalize content type to ensure compatibility
      if (contentType.includes("jpg") || contentType.includes("jpeg")) {
        contentType = "image/jpeg";
      } else if (contentType.includes("png")) {
        contentType = "image/png";
      } else if (contentType.includes("gif")) {
        contentType = "image/gif";
      } else if (contentType.includes("webp")) {
        contentType = "image/webp";
      } else {
        // Default to PNG for unknown formats
        contentType = "image/png";
      }

      // Convert to base64 data URL
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${contentType};base64,${base64}`;

      console.log(
        `Successfully converted image to base64 (${buffer.length} bytes)`
      );
      return dataUrl;
    } catch (error) {
      console.error(`Attempt ${attempt} failed to fetch/convert image:`, error);

      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed for image:`, imageUrl);
        return null;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  return null;
}

export async function analyzeImage(
  imageUrl: string,
  productName: string = "Product",
  additionalContext?: string,
  includeSpatialGrid: boolean = true
): Promise<ImageAnalysis | null> {
  try {
    const startTime = Date.now();

    console.log("Analyzing image with GPT-4 Vision:", imageUrl);

    // First, try to convert the image to base64 to avoid timeout issues
    let imageContent: any;
    const base64Image = await convertImageToBase64(imageUrl);

    if (base64Image) {
      console.log("Using base64 encoded image for analysis");
      imageContent = {
        type: "image_url",
        image_url: { url: base64Image, detail: "high" },
      };
    } else {
      console.log("Fallback to using direct URL (base64 conversion failed)");
      imageContent = {
        type: "image_url",
        image_url: { url: imageUrl, detail: "high" },
      };
    }

    // Retry mechanism for OpenAI API call
    let lastError: any = null;
    const maxApiRetries = 3;

    for (let attempt = 1; attempt <= maxApiRetries; attempt++) {
      try {
        console.log(`Calling OpenAI API (attempt ${attempt}/${maxApiRetries})`);

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a professional product designer analyzing product images.
              Provide a detailed, structured analysis that can be used for AI image editing.
              Focus on visual elements that can be modified or enhanced.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this ${productName} product image in detail.
                  ${additionalContext ? `Context: ${additionalContext}` : ""}
                  
                  Provide a structured analysis including:
                  1. Product type and category
                  2. Current colors (be specific with color names)
                  3. Materials and textures visible
                  4. Key design features and elements
                  5. Overall style and aesthetic
                  6. Quality and finish
                  7. Any unique characteristics
                  8. Suggestions for potential improvements
                  
                  ${
                    includeSpatialGrid
                      ? `
                  9. SPATIAL GRID ANALYSIS:
                  Mentally divide the image into a 4x4 grid (16 squares).
                  Label them as A1-A4 (top row), B1-B4 (second row), C1-C4 (third row), D1-D4 (bottom row).
                  For each square, briefly describe:
                  - What's visible (product part, background, text, logo, empty)
                  - Dominant color if any
                  - Key features
                  
                  Format: [Square ID]: [Content description]
              Example: A1: Empty white background
              Example: B2: Product collar with blue fabric
              Example: C3: Logo placement area, currently empty
              `
                      : ""
                  }
              
              Be technical and specific to help with accurate AI image generation.`,
                },
                imageContent,
              ],
            },
          ],
          max_tokens: includeSpatialGrid ? 1500 : 800,
          temperature: 0.3,
        });

        const analysisText = response.choices[0]?.message?.content || "";
        const processingTime = Date.now() - startTime;

        // Parse the analysis into structured format
        const analysis: ImageAnalysis = parseAnalysisText(
          analysisText,
          includeSpatialGrid
        );
        analysis.fullAnalysis = analysisText;
        analysis.timestamp = new Date().toISOString();

        // Save to cache
        await saveImageAnalysis(imageUrl, analysis, {
          analysisPrompt: `Analyze ${productName}`,
          tokensUsed: response.usage?.total_tokens,
          processingTimeMs: processingTime,
          modelUsed: "gpt-4o",
        });

        console.log(`Successfully analyzed image in ${processingTime}ms`);
        return analysis;
      } catch (apiError: any) {
        lastError = apiError;
        console.error(`OpenAI API attempt ${attempt} failed:`, apiError);

        // Check if it's a specific error we should not retry
        if (
          apiError?.code === "invalid_api_key" ||
          apiError?.code === "insufficient_quota"
        ) {
          console.error("Non-retryable error, stopping attempts");
          break;
        }

        if (attempt < maxApiRetries) {
          const waitTime = Math.min(2000 * attempt, 6000);
          console.log(`Waiting ${waitTime}ms before retrying OpenAI API...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // If all attempts failed, return null
    console.error("All OpenAI API attempts failed. Last error:", lastError);
    return null;
  } catch (error) {
    console.error("Error in analyzeImage function:", error);
    return null;
  }
}

/**
 * Analyze multiple product views with caching
 */
export async function analyzeProductViews(
  views: {
    front?: string;
    back?: string;
    side?: string;
  },
  productName: string = "Product",
  productId?: string,
  revisionId?: string,
  revisionNumber?: number
): Promise<{
  front?: ImageAnalysis;
  back?: ImageAnalysis;
  side?: ImageAnalysis;
  combinedAnalysis?: string;
}> {
  const results: any = {};

  // Check cache and analyze each view
  for (const [viewType, imageUrl] of Object.entries(views)) {
    if (!imageUrl) continue;

    // First check cache
    let analysis = await getCachedImageAnalysis(imageUrl);

    // If not cached, analyze
    if (!analysis) {
      console.log(`No cached analysis for ${viewType} view, analyzing...`);
      analysis = await analyzeImage(
        imageUrl,
        `${productName} - ${viewType} view`,
        `This is the ${viewType} view of the product.`
      );

      if (analysis && productId) {
        // Link to product and revision in cache
        const supabase = await createClient();
        await supabase
          .from("image_analysis_cache")
          .update({
            product_idea_id: productId,
            revision_id: revisionId,
            revision_number: revisionNumber,
          })
          .eq("image_url", imageUrl);
      }
    } else {
      console.log(`Using cached analysis for ${viewType} view`);
    }

    if (analysis) {
      results[viewType] = analysis;
    }
  }

  // Generate combined analysis if we have multiple views
  if (Object.keys(results).length > 1) {
    results.combinedAnalysis = generateCombinedAnalysis(results);
  }

  return results;
}

/**
 * Parse analysis text into structured format including spatial grid
 */
function parseAnalysisText(
  text: string,
  includeSpatialGrid: boolean = false
): ImageAnalysis {
  const analysis: ImageAnalysis = {};

  // Extract colors
  const colorMatch = text.match(/colors?:?\s*([^\n]+)/i);
  if (colorMatch) {
    analysis.currentColors = colorMatch[1]
      .split(/[,;]/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
  }

  // Extract materials
  const materialMatch = text.match(/materials?:?\s*([^\n]+)/i);
  if (materialMatch) {
    analysis.materials = materialMatch[1]
      .split(/[,;]/)
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
  }

  // Extract style
  const styleMatch = text.match(/style:?\s*([^\n]+)/i);
  if (styleMatch) {
    analysis.style = styleMatch[1].trim();
  }

  // Extract product type
  const typeMatch = text.match(/(?:product type|type|category):?\s*([^\n]+)/i);
  if (typeMatch) {
    analysis.productType = typeMatch[1].trim();
  }

  // Extract key features
  const featuresMatch = text.match(/(?:features?|elements?):?\s*([^\n]+)/i);
  if (featuresMatch) {
    analysis.keyFeatures = featuresMatch[1]
      .split(/[,;]/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
  }

  // Extract suggestions
  const suggestionsMatch = text.match(
    /(?:suggestions?|improvements?):?\s*([^\n]+)/i
  );
  if (suggestionsMatch) {
    analysis.suggestions = [suggestionsMatch[1].trim()];
  }

  // Parse spatial grid if included
  if (includeSpatialGrid) {
    analysis.spatialGrid = parseSpatialGrid(text);
  }

  return analysis;
}

/**
 * Parse spatial grid information from analysis text
 */
function parseSpatialGrid(text: string): SpatialGridAnalysis {
  const grid: SpatialGridAnalysis = {
    gridSize: "4x4",
    squares: [],
    dominantRegions: {},
  };

  // Define grid positions
  const gridPositions = [
    ["A1", "A2", "A3", "A4"],
    ["B1", "B2", "B3", "B4"],
    ["C1", "C2", "C3", "C4"],
    ["D1", "D2", "D3", "D4"],
  ];

  // Position names
  const positionNames: { [key: string]: string } = {
    A1: "top-left",
    A2: "top-center-left",
    A3: "top-center-right",
    A4: "top-right",
    B1: "upper-left",
    B2: "upper-center-left",
    B3: "upper-center-right",
    B4: "upper-right",
    C1: "lower-left",
    C2: "lower-center-left",
    C3: "lower-center-right",
    C4: "lower-right",
    D1: "bottom-left",
    D2: "bottom-center-left",
    D3: "bottom-center-right",
    D4: "bottom-right",
  };

  // Parse each grid square
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const squareId = gridPositions[row][col];
      const regex = new RegExp(`${squareId}:?\\s*([^\\n]+)`, "i");
      const match = text.match(regex);

      const square: GridSquare = {
        id: squareId,
        row,
        col,
        position: positionNames[squareId],
        content: match ? match[1].trim() : "Not specified",
        hasProduct: false,
        hasBackground: false,
      };

      if (match) {
        const content = match[1].toLowerCase();

        // Analyze content
        square.hasProduct =
          /product|item|garment|clothing|shirt|pants|dress|shoe/.test(content);
        square.hasBackground = /background|empty|blank|white|plain/.test(
          content
        );
        square.hasText = /text|label|tag|writing/.test(content);
        square.hasLogo = /logo|brand|emblem|symbol/.test(content);
        square.isEmpty = /empty|blank|nothing/.test(content);

        // Extract dominant color
        const colorWords = [
          "white",
          "black",
          "red",
          "blue",
          "green",
          "yellow",
          "purple",
          "orange",
          "pink",
          "gray",
          "brown",
          "beige",
          "navy",
          "teal",
        ];
        for (const color of colorWords) {
          if (content.includes(color)) {
            square.dominantColor = color;
            break;
          }
        }
      }

      grid.squares.push(square);
    }
  }

  // Analyze dominant regions
  const topSquares = grid.squares.filter((s) => s.row === 0);
  const bottomSquares = grid.squares.filter((s) => s.row === 3);
  const leftSquares = grid.squares.filter((s) => s.col === 0);
  const rightSquares = grid.squares.filter((s) => s.col === 3);
  const centerSquares = grid.squares.filter(
    (s) => s.row >= 1 && s.row <= 2 && s.col >= 1 && s.col <= 2
  );

  // Summarize regions
  grid.dominantRegions = {
    top: summarizeSquares(topSquares),
    bottom: summarizeSquares(bottomSquares),
    left: summarizeSquares(leftSquares),
    right: summarizeSquares(rightSquares),
    center: summarizeSquares(centerSquares),
    middle: summarizeSquares(
      grid.squares.filter((s) => s.row >= 1 && s.row <= 2)
    ),
  };

  return grid;
}

/**
 * Summarize what's in a group of squares
 */
function summarizeSquares(squares: GridSquare[]): string {
  const hasProduct = squares.some((s) => s.hasProduct);
  const hasLogo = squares.some((s) => s.hasLogo);
  const isEmpty = squares.every((s) => s.isEmpty);
  const colors = [
    ...new Set(squares.map((s) => s.dominantColor).filter(Boolean)),
  ];

  if (isEmpty) return "Empty/Background";
  if (hasProduct && hasLogo) return "Product with logo";
  if (hasProduct) return "Product";
  if (hasLogo) return "Logo area";
  if (colors.length > 0) return `${colors.join(", ")} area`;
  return "Mixed content";
}

/**
 * Generate a combined analysis from multiple views
 */
function generateCombinedAnalysis(viewAnalyses: any): string {
  const views = Object.keys(viewAnalyses).filter(
    (k) => k !== "combinedAnalysis"
  );
  let combined = `Product analysis based on ${views.length} views:\n\n`;

  // Combine common elements
  const allColors = new Set<string>();
  const allMaterials = new Set<string>();
  const allFeatures = new Set<string>();

  views.forEach((view) => {
    const analysis = viewAnalyses[view];
    if (analysis.currentColors) {
      analysis.currentColors.forEach((c: string) => allColors.add(c));
    }
    if (analysis.materials) {
      analysis.materials.forEach((m: string) => allMaterials.add(m));
    }
    if (analysis.keyFeatures) {
      analysis.keyFeatures.forEach((f: string) => allFeatures.add(f));
    }
  });

  if (allColors.size > 0) {
    combined += `Colors: ${Array.from(allColors).join(", ")}\n`;
  }
  if (allMaterials.size > 0) {
    combined += `Materials: ${Array.from(allMaterials).join(", ")}\n`;
  }
  if (allFeatures.size > 0) {
    combined += `Key Features: ${Array.from(allFeatures).join(", ")}\n`;
  }

  // Add view-specific details
  views.forEach((view) => {
    const analysis = viewAnalyses[view];
    if (analysis.fullAnalysis) {
      combined += `\n${view.toUpperCase()} VIEW:\n${analysis.fullAnalysis.substring(0, 200)}...\n`;
    }
  });

  return combined;
}

/**
 * Clean up old cached analyses
 */
export async function cleanupExpiredAnalyses(): Promise<number> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("image_analysis_cache")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error) {
      console.error("Error cleaning up expired analyses:", error);
      return 0;
    }

    const count = data?.length || 0;
    console.log(`Cleaned up ${count} expired analysis entries`);
    return count;
  } catch (error) {
    console.error("Error in cleanup:", error);
    return 0;
  }
}

/**
 * Analyze multiple collection views with caching
 */
export async function analyzeCollectionViews(
  views: {
    front?: string;
    back?: string;
    side?: string;
  },
  productName: string = "Product",
  productId?: string,
  collectionId?: string,
  revisionId?: string,
  revisionNumber?: number
): Promise<{
  front?: ImageAnalysis;
  back?: ImageAnalysis;
  side?: ImageAnalysis;
  combinedAnalysis?: string;
}> {
  const results: any = {};

  // Check cache and analyze each view
  for (const [viewType, imageUrl] of Object.entries(views)) {
    if (!imageUrl) continue;

    // First check cache
    let analysis = await getCachedImageAnalysis(imageUrl);

    // If not cached, analyze
    if (!analysis) {
      console.log(`No cached analysis for ${viewType} view, analyzing...`);
      analysis = await analyzeImage(
        imageUrl,
        `${productName} - ${viewType} view`,
        `This is the ${viewType} view of the product.`
      );

      if (analysis && productId) {
        // Link to product and revision in cache
        const supabase = await createClient();
        await supabase
          .from("image_analysis_cache")
          .update({
            product_collection_id: productId,
            collection_id: collectionId,
            revision_id: revisionId,
            revision_number: revisionNumber,
          })
          .eq("image_url", imageUrl);
      }
    } else {
      console.log(`Using cached analysis for ${viewType} view`);
    }

    if (analysis) {
      results[viewType] = analysis;
    }
  }

  // Generate combined analysis if we have multiple views
  if (Object.keys(results).length > 1) {
    results.combinedAnalysis = generateCombinedAnalysis(results);
  }

  return results;
}
