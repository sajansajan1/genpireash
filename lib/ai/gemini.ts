/**
 * Gemini 2.5 Flash Image Preview Service
 * Handles all AI image generation using Google's Gemini model
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import {
  buildPromptFromTemplate,
  enhancePromptForGemini,
  getFallbackPrompt,
} from "./prompts";
import { aiLogger } from "@/lib/logging/ai-logger";
import { imageService } from "@/lib/services/image-service";

// Types
export interface ImageGenerationParams {
  prompt: string;
  referenceImage?: string; // Base64 or data URL (primary reference - e.g., front view)
  additionalReferenceImage?: string; // Base64 or data URL (secondary reference - e.g., back view for consistency)
  previousRevisionImage?: string; // Base64 or data URL of previous revision of the same view (for consistency across regenerations)
  logoImage?: string; // Base64 or data URL of brand logo
  characterImage?: string; // Base64 or data URL of character/model
  productType?: string;
  view?:
    | "front"
    | "back"
    | "side"
    | "top"
    | "bottom"
    | "illustration"
    | "technical"
    | "detail"
    | "construction"
    | "callout"
    | "measurement"
    | "scale"
    | "vector";
  style?: "photorealistic" | "technical" | "vector" | "detail";
  options?: {
    retry?: number;
    fallbackEnabled?: boolean;
    enhancePrompt?: boolean;
    model?: string; // Custom model (default: gemini-2.5-flash-image-preview)
  };
  aspectRatio?:
    | "1:1"
    | "2:3"
    | "3:2"
    | "3:4"
    | "4:3"
    | "9:16"
    | "16:9"
    | "21:9";
}

export interface GeneratedImage {
  url: string; // Data URL of generated image
  mimeType: string;
  prompt: string;
  fallbackUsed?: boolean;
  metadata?: {
    view?: string;
    style?: string;
    generationTime?: number;
  };
}

export interface TechPackGenerationParams {
  techPackData: any; // Replace with your TechPack type
  imageType:
    | "vector"
    | "detail"
    | "technical"
    | "front"
    | "back"
    | "construction"
    | "callout"
    | "measurement"
    | "scale";
  options?: any;
}

/**
 * Main Gemini Service Class
 */
export class GeminiImageService {
  private ai: GoogleGenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not set. Please provide a valid Gemini API key."
      );
    }

    console.log(
      "Initializing Gemini service with API key:",
      key.substring(0, 10) + "..."
    );
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  /**
   * Process Gemini API response and extract image data
   */
  private processGeminiResponse(response: GenerateContentResponse): string {
    const imagePartFromResponse =
      response.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inlineData
      );

    if (imagePartFromResponse?.inlineData) {
      const { mimeType, data } = imagePartFromResponse.inlineData;
      return `data:${mimeType};base64,${data}`;
    }

    // If no image, check for text response
    const textResponse = response.text;
    console.error("API did not return an image. Response:", textResponse);
    throw new Error(
      `The AI model responded with text instead of an image: "${textResponse || "No response received."}"`
    );
  }

  /**
   * Call Gemini API with retry mechanism for reliability
   *
   * Fallback Strategy:
   * - First attempt: Uses the requested model (e.g., gemini-3-pro-image-preview)
   * - On 503/429/500 errors: Falls back to gemini-2.5-flash-image-preview for retries
   */
  private async callGeminiWithRetry(
    parts: any[],
    maxRetries: number = 3,
    model: string = "gemini-2.5-flash-image-preview",
    aspectRatio: string = "1:1" // Default to square images for product views
  ): Promise<GenerateContentResponse> {
    const initialDelay = 2000; // Increased from 1000ms for better reliability
    const fallbackModel = "gemini-2.5-flash-image-preview"; // More reliable fallback model
    let currentModel = model;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.ai.models.generateContent({
          model: currentModel,
          contents: { parts },
          config: {
            temperature: 0.1,
            // Image generation config - required for Gemini image models
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
              aspectRatio: aspectRatio,
            },
          },
        });
      } catch (error) {
        console.error(
          `Error calling Gemini API with model ${currentModel} (Attempt ${attempt}/${maxRetries}):`,
          error
        );
        const errorMessage =
          error instanceof Error ? error.message : JSON.stringify(error);

        // Check for retryable errors: 500 (Internal), 503 (Unavailable/Deadline), 429 (Rate Limit)
        const isRetryableError =
          errorMessage.includes('"code":500') ||
          errorMessage.includes('"code":503') ||
          errorMessage.includes('"code":429') ||
          errorMessage.includes("INTERNAL") ||
          errorMessage.includes("UNAVAILABLE") ||
          errorMessage.includes("RESOURCE_EXHAUSTED") ||
          errorMessage.includes("Internal error") ||
          errorMessage.includes("Deadline expired") ||
          errorMessage.includes("Service temporarily unavailable");

        if (isRetryableError && attempt < maxRetries) {
          // Use exponential backoff with jitter for retryable errors
          const baseDelay = initialDelay * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 1000; // Add 0-1000ms random jitter
          const delay = baseDelay + jitter;

          // Switch to fallback model on retry if using a different model
          if (currentModel !== fallbackModel) {
            console.log(
              `Retryable error detected (${errorMessage.includes('503') ? '503 Unavailable' : errorMessage.includes('429') ? '429 Rate Limited' : '500 Internal'}). Switching to fallback model ${fallbackModel} and retrying in ${Math.round(delay)}ms... (Attempt ${attempt}/${maxRetries})`
            );
            currentModel = fallbackModel;
          } else {
            console.log(
              `Retryable error detected (${errorMessage.includes('503') ? '503 Unavailable' : errorMessage.includes('429') ? '429 Rate Limited' : '500 Internal'}). Retrying in ${Math.round(delay)}ms... (Attempt ${attempt}/${maxRetries})`
            );
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error("Gemini API call failed after all retries.");
  }

  /**
   * Fetch image from URL and convert to base64
   */
  private async fetchImageAsBase64(url: string): Promise<{
    mimeType: string;
    base64Data: string;
  }> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      let contentType = response.headers.get("content-type") || "image/png";

      // Fix invalid MIME types from Supabase or other sources
      if (!contentType.startsWith("image/")) {
        // Try to determine from URL extension
        if (url.includes(".png")) {
          contentType = "image/png";
        } else if (url.includes(".jpg") || url.includes(".jpeg")) {
          contentType = "image/jpeg";
        } else if (url.includes(".webp")) {
          contentType = "image/webp";
        } else {
          // Default to PNG if we can't determine
          contentType = "image/png";
        }
        console.warn(
          `Invalid content-type "${contentType}" detected, using: ${contentType}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");

      return {
        mimeType: contentType,
        base64Data,
      };
    } catch (error) {
      console.error("Error fetching image from URL:", error);
      throw new Error(`Failed to fetch image from URL: ${url}`);
    }
  }

  /**
   * Parse image data URL or base64 string
   */
  private async parseImageData(imageData: string): Promise<{
    mimeType: string;
    base64Data: string;
  }> {
    // Check if it's a regular URL (http/https)
    if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
      return await this.fetchImageAsBase64(imageData);
    }

    // Check if it's a data URL
    const dataUrlMatch = imageData.match(/^data:(image\/\w+);base64,(.*)$/);
    if (dataUrlMatch) {
      const [, mimeType, base64Data] = dataUrlMatch;
      return { mimeType, base64Data };
    }

    // Assume it's raw base64 if not a data URL
    return { mimeType: "image/png", base64Data: imageData };
  }

  /**
   * Optimize logo image for AI generation
   * Reduces logo size to prevent 503 timeout errors from large payloads
   *
   * @param imageData - Logo image as URL or base64
   * @returns Optimized image as base64 with mime type
   */
  private async optimizeLogoForAI(imageData: string): Promise<{
    mimeType: string;
    base64Data: string;
  }> {
    try {
      // First parse the image data
      const { mimeType, base64Data } = await this.parseImageData(imageData);

      // Convert base64 to buffer for optimization
      const inputBuffer = Buffer.from(base64Data, "base64");

      // Check if image is small enough (< 100KB) - skip optimization
      if (inputBuffer.length < 100 * 1024) {
        console.log(`[Gemini] Logo is small (${Math.round(inputBuffer.length / 1024)}KB), skipping optimization`);
        return { mimeType, base64Data };
      }

      console.log(`[Gemini] Optimizing logo from ${Math.round(inputBuffer.length / 1024)}KB...`);

      // Optimize: resize to max 512x512, compress to JPEG at 85% quality
      const optimizedBuffer = await imageService.optimize(inputBuffer, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 85,
        format: "jpeg",
        removeMetadata: true,
      });

      console.log(`[Gemini] Logo optimized to ${Math.round(optimizedBuffer.length / 1024)}KB`);

      return {
        mimeType: "image/jpeg",
        base64Data: optimizedBuffer.toString("base64"),
      };
    } catch (error) {
      console.warn("[Gemini] Logo optimization failed, using original:", error);
      // Fallback to original if optimization fails
      return this.parseImageData(imageData);
    }
  }

  /**
   * Main method to generate images
   */
  async generateImage(params: ImageGenerationParams): Promise<GeneratedImage> {
    const startTime = Date.now();

    // Get model from options or use default
    const model = params.options?.model || "gemini-2.5-flash-image-preview";

    // Initialize logger for this operation
    const logger = aiLogger.startOperation(
      "generateImage",
      model,
      "gemini",
      "image_generation"
    );

    // Build or use provided prompt
    let prompt = params.prompt;

    // If using template-based generation
    if (params.productType && params.view) {
      prompt = buildPromptFromTemplate(
        params.productType,
        params.view,
        params.style || "photorealistic"
      );
    }

    // Enhance prompt if requested
    if (params.options?.enhancePrompt !== false) {
      prompt = enhancePromptForGemini(prompt, params.style);
    }

    // Log input
    logger.setInput({
      prompt: prompt,
      parameters: {
        style: params.style as any,
      },
      metadata: {
        productType: params.productType,
        view: params.view,
        hasReferenceImage: !!params.referenceImage,
        hasAdditionalReferenceImage: !!params.additionalReferenceImage,
        hasPreviousRevisionImage: !!params.previousRevisionImage,
        hasLogoImage: !!params.logoImage,
        hasCharacterImage: !!params.characterImage,
        enhancePrompt: params.options?.enhancePrompt !== false,
        retry: params.options?.retry || 3,
      },
    });

    // Set context
    logger.setContext({
      feature: "product_image_generation",
    });

    // Prepare image parts
    const parts: any[] = [];

    // Check if this is a transformation task (IMAGE TRANSFORMATION TASK marker)
    const isTransformation = prompt.includes("IMAGE TRANSFORMATION TASK");

    // Check if this is a revision (has strict consistency instructions)
    const isRevision =
      prompt.includes("CRITICAL REVISION INSTRUCTION:") ||
      prompt.includes("MANDATORY PRESERVATION RULES:");

    // For transformation tasks: Images FIRST, then instructions
    // This makes the AI prioritize the visual information
    if (isTransformation && params.referenceImage) {
      console.log("Transformation mode: Images first, then instructions for better consistency");

      // Add clear header about what follows
      parts.push({
        text: "🖼️ REFERENCE IMAGES - STUDY THESE CAREFULLY BEFORE READING INSTRUCTIONS:",
      });

      // Add primary reference image FIRST
      const { mimeType, base64Data } = await this.parseImageData(
        params.referenceImage
      );
      parts.push({
        inlineData: { mimeType, data: base64Data },
      });
      parts.push({
        text: "☝️ IMAGE 1 (PRIMARY REFERENCE): This is the EXACT product you must transform. Copy ALL colors, materials, and details from this image.",
      });

      // Add the instructions AFTER showing the images
      parts.push({
        text: prompt,
      });

      // Add final reminder
      parts.push({
        text: "⚠️ FINAL REMINDER: Your output must be the EXACT SAME product as shown in the reference images - same colors, same materials, same design - just from a different angle. DO NOT create a new design.",
      });
    } else if (params.referenceImage) {
      const { mimeType, base64Data } = await this.parseImageData(
        params.referenceImage
      );

      if (isRevision) {
        // For revisions: Add instruction first, then image, then reminder
        console.log(
          "Revision mode: Optimizing prompt structure for consistency"
        );

        // Add the main instruction with clear context
        parts.push({
          text: prompt,
        });

        // Add the reference image
        parts.push({
          inlineData: { mimeType, data: base64Data },
        });

        // Add a final reminder about maintaining consistency
        parts.push({
          text: "REMINDER: The image above is the EXACT product to modify. Apply ONLY the requested change while keeping everything else IDENTICAL.",
        });
      } else {
        // For non-revisions: Original flow
        parts.push({
          inlineData: { mimeType, data: base64Data },
        });

        if (!prompt.includes("reference")) {
          prompt = `REFERENCE IMAGE PROVIDED: The first image shows the existing product design.

${prompt}

IMPORTANT: Maintain consistency with the reference image's overall design, style, and quality while applying the requested changes.`;
        }

        // Add text prompt for non-revision case
        parts.push({ text: prompt });
      }
    } else {
      // No reference image - just add the text prompt
      parts.push({ text: prompt });
    }

    // Add additional reference image if provided (e.g., back view for consistency with front+back)
    if (params.additionalReferenceImage) {
      const { mimeType, base64Data } = await this.parseImageData(
        params.additionalReferenceImage
      );

      // For transformation mode, add the image with clear labeling
      if (isTransformation) {
        parts.splice(3, 0, // Insert after first image's label but before main instructions
          { inlineData: { mimeType, data: base64Data } },
          {
            text: "☝️ IMAGE 2 (SECONDARY REFERENCE - BACK VIEW): This is the BACK of the SAME product. Use this to confirm colors, materials, and design from another angle.",
          }
        );
      } else {
        parts.push({
          inlineData: { mimeType, data: base64Data },
        });

        // Add context about the additional reference image with strong consistency instructions
        parts.push({
          text: `⚠️⚠️⚠️ SECOND REFERENCE IMAGE (BACK VIEW) - STUDY THIS CAREFULLY ⚠️⚠️⚠️

The image above is the BACK VIEW of the EXACT SAME product. You now have TWO authoritative references that define the product completely:

📷 IMAGE 1 = FRONT VIEW (primary design source)
📷 IMAGE 2 = BACK VIEW (confirms design from rear)

🎯 MANDATORY CONSISTENCY REQUIREMENTS:

1. COLORS - Must match EXACTLY:
   - Main body color → IDENTICAL to front/back
   - Trim/accent colors (gold, chrome, etc.) → IDENTICAL to front/back
   - Wheels → IDENTICAL color and design to front/back
   - Interior (if visible) → SAME as front/back

2. PROPORTIONS - Must match EXACTLY:
   - Body width → Same as front/back
   - Body height → Same as front/back
   - Wheel size → IDENTICAL to front/back

3. DESIGN ELEMENTS - Must match EXACTLY:
   - Window frames, mirrors, handles → SAME style
   - Trim pieces → SAME placement and color
   - Wheels/tires → IDENTICAL spoke pattern and style

⛔ FAILURE CONDITIONS:
- ANY color difference from front/back = REJECT
- ANY wheel design difference = REJECT
- ANY trim color difference = REJECT
- ANY proportion difference = REJECT

Your output MUST look like a photo of the IDENTICAL physical product from a different angle.`,
        });
      }
    }

    // Add previous revision image if provided (for STRUCTURAL consistency only - NOT design/color consistency)
    // The design/colors should come from the FRONT VIEW reference, not the previous revision
    if (params.previousRevisionImage) {
      const { mimeType, base64Data } = await this.parseImageData(
        params.previousRevisionImage
      );
      parts.push({
        inlineData: { mimeType, data: base64Data },
      });

      // Add instructions that clarify: use previous revision for STRUCTURE only, not design
      parts.push({
        text: `📐 PREVIOUS REVISION - FOR STRUCTURAL REFERENCE ONLY:
The image above shows a PREVIOUS VERSION of this view for STRUCTURAL reference.

⚠️ IMPORTANT - USE THIS ONLY FOR:
- Camera angle and perspective
- Product positioning in frame
- Composition and layout
- General structural proportions

🚫 DO NOT COPY FROM PREVIOUS REVISION:
- Colors - use the FRONT VIEW colors instead
- Design details - use the FRONT VIEW design instead
- Materials/textures - match the FRONT VIEW
- Any visual styling - all from FRONT VIEW

✅ YOUR PRIORITY ORDER:
1. FRONT VIEW (first reference) = DEFINITIVE design source for colors, materials, patterns, details
2. BACK VIEW (if provided) = Secondary design reference
3. PREVIOUS REVISION (this image) = ONLY for camera angle and structural positioning

The product in your generation MUST look like the FRONT VIEW product, just from a different angle.
If the front view shows a RED car, your generation must show a RED car - NOT the color from this previous revision.`,
      });
    }

    // Add logo image if provided (optimized to prevent 503 timeout errors)
    if (params.logoImage) {
      const { mimeType, base64Data } = await this.optimizeLogoForAI(
        params.logoImage
      );
      parts.push({
        inlineData: { mimeType, data: base64Data },
      });

      // Add context about the logo in the prompt if not already included
      if (!isRevision && !prompt.includes("logo")) {
        parts.push({
          text: "IMPORTANT: Use the exact brand logo from the image above and integrate it naturally into the product design.",
        });
      }
    }

    // Add character/model image if provided
    if (params.characterImage) {
      const { mimeType, base64Data } = await this.parseImageData(
        params.characterImage
      );
      parts.push({
        inlineData: { mimeType, data: base64Data },
      });

      // Add context about the character image
      if (!isRevision && !prompt.includes("character")) {
        parts.push({
          text: "IMPORTANT: Use the EXACT person/character from the image above as the model in the scene. Maintain their appearance, facial features, and identity while having them interact with or wear the product.",
        });
      }
    }

    const retries = params.options?.retry || 3;

    // First attempt with original prompt
    try {
      console.log(
        "Attempting generation with prompt:",
        prompt.substring(0, 100) + "..."
      );
      console.log("Using model:", model);

      const response = await this.callGeminiWithRetry(parts, retries, model);

      const imageUrl = this.processGeminiResponse(response);

      const generationTime = Date.now() - startTime;

      // Log successful output
      logger.setOutput({
        images: [imageUrl.substring(0, 100) + "..."], // Truncate base64 for logging
        usage: {
          estimated_cost: 0.002, // Gemini Flash image generation estimated cost
        },
      });

      await logger.complete();

      return {
        url: imageUrl,
        mimeType: "image/png",
        prompt: prompt,
        fallbackUsed: false,
        metadata: {
          view: params.view,
          style: params.style,
          generationTime,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      const isNoImageError = errorMessage.includes(
        "responded with text instead of an image"
      );

      // Try fallback if enabled and prompt was blocked
      if (isNoImageError && params.options?.fallbackEnabled !== false) {
        console.warn("Original prompt was blocked. Trying fallback prompt.");

        try {
          // Create a simple, safe fallback prompt
          const fallbackPrompt = params.productType
            ? getFallbackPrompt(params.productType, params.view, params.style)
            : `Generate a simple product image. 
               Show a basic clothing item on a white background.
               Professional product photography style.
               Front view only.
               No text or labels.`;

          // Rebuild parts for fallback attempt
          const fallbackParts: any[] = [];

          // Keep reference image if provided
          if (params.referenceImage) {
            const { mimeType, base64Data } = await this.parseImageData(
              params.referenceImage
            );
            fallbackParts.push({
              inlineData: { mimeType, data: base64Data },
            });
          }

          // Keep logo image if provided (optimized)
          if (params.logoImage) {
            const { mimeType, base64Data } = await this.optimizeLogoForAI(
              params.logoImage
            );
            fallbackParts.push({
              inlineData: { mimeType, data: base64Data },
            });
          }

          const fallbackTextPart = { text: fallbackPrompt };
          fallbackParts.push(fallbackTextPart);

          const fallbackResponse = await this.callGeminiWithRetry(
            fallbackParts,
            retries,
            model
          );

          const imageUrl = this.processGeminiResponse(fallbackResponse);

          // Log successful fallback
          logger.setOutput({
            images: [imageUrl.substring(0, 100) + "..."],
            usage: {
              estimated_cost: 0.002,
            },
            raw_response: { fallbackUsed: true },
          });

          await logger.complete();

          return {
            url: imageUrl,
            mimeType: "image/png",
            prompt: fallbackPrompt,
            fallbackUsed: true,
            metadata: {
              view: params.view,
              style: params.style,
              generationTime: Date.now() - startTime,
            },
          };
        } catch (fallbackError) {
          console.error("Fallback prompt also failed:", fallbackError);
          logger.setError(
            fallbackError instanceof Error
              ? fallbackError
              : new Error(String(fallbackError))
          );
          await logger.complete();
          throw new Error(
            "Failed to generate image with both original and fallback prompts"
          );
        }
      }

      // Log error and throw
      logger.setError(new Error(`Failed to generate image: ${errorMessage}`));
      await logger.complete();
      throw new Error(`Failed to generate image: ${errorMessage}`);
    }
  }

  /**
   * Generate multiple views of a product
   */
  async generateProductViews(
    productDescription: string,
    views: string[] = ["front", "back"],
    style: string = "photorealistic"
  ): Promise<GeneratedImage[]> {
    const promises = views.map((view) =>
      this.generateImage({
        prompt: "",
        productType: productDescription,
        view: view as any,
        style: style as any,
        options: {
          enhancePrompt: true,
          fallbackEnabled: true,
        },
      })
    );

    return Promise.all(promises);
  }

  /**
   * Generate tech pack images
   */
  async generateTechPackImage(
    params: TechPackGenerationParams
  ): Promise<GeneratedImage> {
    const { techPackData, imageType } = params;

    // Build appropriate prompt based on image type
    let prompt = "";
    let style: "technical" | "photorealistic" | "vector" | "detail" =
      "technical";

    switch (imageType) {
      case "vector":
        style = "vector";
        prompt = buildPromptFromTemplate(
          techPackData.productName || "garment",
          "front",
          "technical"
        );
        break;

      case "detail":
        style = "detail";
        prompt = buildPromptFromTemplate(
          techPackData.productName || "garment",
          "front",
          "technical",
          {
            DETAIL: "construction details and hardware",
          }
        );
        break;

      case "measurement":
        prompt = buildPromptFromTemplate(
          techPackData.productName || "garment",
          "front",
          "technical"
        );
        break;

      case "front":
      case "back":
        prompt = buildPromptFromTemplate(
          techPackData.productName || "garment",
          imageType,
          "technical"
        );
        break;

      default:
        prompt = `Generate a ${imageType} technical drawing for ${techPackData.productName || "garment"}`;
    }

    // Add reference image if available
    const referenceImage = techPackData.image_data?.front?.url;

    return this.generateImage({
      prompt,
      referenceImage,
      productType: techPackData.productName,
      style,
      options: {
        enhancePrompt: true,
        fallbackEnabled: true,
        retry: 3,
      },
    });
  }

  /**
   * Batch generate all tech pack images
   */
  async generateAllTechPackImages(
    techPackData: any
  ): Promise<Record<string, GeneratedImage>> {
    const imageTypes = [
      "front",
      "back",
      "vector",
      "detail",
      "technical",
      "construction",
      "callout",
      "measurement",
      "scale",
    ];

    const promises = imageTypes.map(async (type) => {
      try {
        const image = await this.generateTechPackImage({
          techPackData,
          imageType: type as any,
        });
        return { type, image };
      } catch (error) {
        console.error(`Failed to generate ${type} image:`, error);
        return { type, image: null };
      }
    });

    const results = await Promise.all(promises);

    const images: Record<string, GeneratedImage> = {};
    results.forEach(({ type, image }) => {
      if (image) {
        images[type] = image;
      }
    });

    return images;
  }

  /**
   * Health check to verify service is working
   */
  async healthCheck(): Promise<boolean> {
    try {
      const parts = [{ text: "Generate a simple test image of a circle." }];
      const response = await this.callGeminiWithRetry(parts, 1);

      return !!response.candidates?.[0]?.content;
    } catch (error) {
      console.error("Gemini service health check failed:", error);
      return false;
    }
  }
}

// Export a singleton instance
let serviceInstance: GeminiImageService | null = null;

export function getGeminiService(apiKey?: string): GeminiImageService {
  if (!serviceInstance) {
    serviceInstance = new GeminiImageService(apiKey);
  }
  return serviceInstance;
}

// Export default instance
export default GeminiImageService;
