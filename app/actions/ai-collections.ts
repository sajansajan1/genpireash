export interface CollectionInput {
  name: string;
  description: string;
  size: number;
  type: "single-product" | "multi-product";
  logo?: string; // base64 encoded logo or image URL
  images?: { url: string }[]; // AI input reference or uploaded URLs
  creatorId?: string;
  collection_description?: string;

  /**
   * Brand DNA integration - when enabled, the active Brand DNA context
   * will be injected into the collection generation prompts
   */
  applyBrandDna?: boolean;
  brandDnaId?: string;

  /**
   * Optional credit information
   * Used for both client-side validation and server-side logging.
   */
  credits?: {
    current: number; // Current available credits
    required: number; // Credits needed for this generation
    hasSubscription: boolean; // Whether the user has an active or past subscription
  };
}
// export interface ImageDataEntry {
//   view: "front" | "back" | "side";
//   url: string;
//   created_at: string;
//   prompt_used: string;
//   regenerated: boolean;
// }

// export interface ProductData {
//   name: string;
//   collection_name: string;
//   price: number;
//   productType: string;
//   image_data: ImageDataEntry[]; // Array of objects, each for front/back/side
// }

export interface Collection {
  id: string;
  name: string;
  description: string;
  size: number;
  type: string;
  logo?: string;
  products: ProductData[];
  createdAt: string;
}
export interface ProductData {
  name: string;
  collection_name: string;
  collection_description: string;
  price: number;
  productType: string;
  material: string[];
  image_data?: {
    view: "front" | "back" | "side";
    url: string;
    created_at: string;
    prompt_used: string;
    regenerated: boolean;
  }[];
}

export interface ImageGenerationResponse {
  frontImage: string;
  backImage: string;
  sideImage: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  size: number;
  type: string;
  logo?: string;
  products: ProductData[];
  createdAt: string;
}
interface ImageInput {
  url: string;
}

import OpenAI from "openai";
import { Buffer } from "buffer";
import { GeminiImageService } from "@/lib/ai";
import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
import { v4 as uuidv4 } from "uuid";

// --- Corrected AICollectionGenerator Class ---

export class AICollectionGenerator {
  private openai: OpenAI;
  private geminiImageService: GeminiImageService;
  constructor() {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      throw new Error("NEXT_PUBLIC_OPENAI_API_KEY is not set in environment variables.");
    }
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    this.geminiImageService = new GeminiImageService();
  }

  // --- OpenAI for Product Data Generation ---

  async generateProductData(
    collection_name: string,
    collection_description: string,
    collectionType: "single-product" | "multi-product",
    size: number
  ): Promise<ProductData[]> {
    const prompt = this.buildProductDataPrompt(collection_name, collection_description, collectionType, size);

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a product assistant AI. Your task is to generate product specifications for a tech-pack collection. You must respond with a valid JSON array of products and nothing else. Do not include any explanatory text, comments, or markdown formatting around the JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;

      if (!content) {
        throw new Error("No content returned from OpenAI completion.");
      }

      // With JSON mode, parsing should be direct.
      // The response is expected to be a JSON object containing the array.
      const responseObject = JSON.parse(content);

      // Assuming the AI returns an object like { "products": [...] }
      const products = responseObject.products || responseObject;
      if (!Array.isArray(products)) {
        throw new Error("The generated content is not a valid JSON array.");
      }

      return products;
    } catch (error) {
      console.error("Error generating product data:", error);
      throw new Error("Failed to generate and parse product data from OpenAI.");
    }
  }
  //image analyzer
  private async analyzeImageForProductData(
    imageUrl: string,
    collection_name: string,
    collection_description: string
  ): Promise<Omit<ProductData, "image_data">> {
    const prompt = this.buildAnalysisPrompt(collection_name, collection_description);
    console.log("analyze prompt:", prompt, imageUrl);
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert product analyst AI. Analyze the user's image and return a single, valid JSON object with the product's details. Do not include any other text, comments, or markdown.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "high" },
              },
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" }, // Use JSON mode for reliable output
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No content returned from OpenAI vision analysis.");
      }

      const parsedData = JSON.parse(content);

      // Add collection details, as the AI might not always include them
      return {
        ...parsedData,
        collection_name,
        collection_description,
      };
    } catch (error) {
      console.error("Error analyzing image for product data:", error);
      throw new Error(`Failed to analyze image: ${imageUrl}`);
    }
  }

  // --- Gemini for Product Image Generation ---

  private async generateSingleImage(
    productName: string,
    productType: string,
    viewAngle: "front" | "back" | "side",
    collectionStyle?: string,
    logoUrl?: string // Now correctly accepts an optional logo URL
  ): Promise<string> {
    const prompt = this.buildImagePrompt(productName, productType, viewAngle, collectionStyle);

    try {
      // The logic is now simplified to just call your abstracted Gemini service.
      // The `logoUrl` is passed directly if it exists.
      const imageData = await this.geminiImageService.generateImage({
        prompt: prompt,
        logoImage: logoUrl, // Include logo if available
        productType: productName,
        view: viewAngle,
        style: "photorealistic",
        options: {
          enhancePrompt: true, // Let Gemini enhance the prompt
          fallbackEnabled: true,
          retry: 3,
        }, // Pass logo URL only when provided
      });

      if (!imageData) {
        throw new Error("No image data returned from GeminiImageService.");
      }

      console.log("Gemini response received");
      const generatedImageUrl = imageData.url;

      if (!generatedImageUrl) {
        throw new Error("Failed to retrieve image URL from Gemini response.");
      }
      return generatedImageUrl;
    } catch (error) {
      console.error(`Error generating ${viewAngle} image for ${productName}:`, error);
      throw new Error(`Failed to generate ${viewAngle} image.`);
    }
  }

  // ----- Generating Product Images
  async generateProductImages(
    productName: string,
    productType: string,
    collectionStyle?: string,
    logoUrl?: string // Correctly typed as a string URL
  ): Promise<ImageGenerationResponse> {
    console.log(logoUrl);
    const images = await Promise.all([
      this.generateSingleImage(productName, productType, "front", collectionStyle, logoUrl), // Logo is only passed for the front view
    ]);

    return {
      frontImage: images[0],
      backImage: "",
      sideImage: "",
    };
  }

  // ---- Analyzing the images
  async generateCollectionFromImages(
    images: ImageInput[],
    collection_name: string,
    collection_description: string,
    logoUrl?: string
  ): Promise<ProductData[]> {
    try {
      const productsWithImages = await Promise.all(
        images.map(async (image, index) => {
          // Step 1: Analyze the uploaded image to get product data
          const productId = uuidv4();
          const productData = await this.analyzeImageForProductData(image.url, collection_name, collection_description);

          // Step 2: Generate new, standardized images based on the analyzed data
          const generatedImages = await this.generateProductImages(
            productData.name,
            productData.productType,
            collection_description,
            logoUrl
          );

          // Step 3: Upload the newly generated images to Supabase
          const saveImageToSupabase = async (dataUrl: string, fileName: string): Promise<string> => {
            const cleanedBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(cleanedBase64, "base64");
            const uploadedUrl = await uploadBufferToSupabase(buffer, fileName);
            if (!uploadedUrl) {
              throw new Error(`Failed to upload image: ${fileName}`);
            }
            return uploadedUrl;
          };

          const timestamp = Date.now();

          // Step 4: Combine all data into the final product object
          return {
            ...productData,
            id: productId,
            image_data: [
              {
                view: "front" as "front",
                url: await saveImageToSupabase(generatedImages.frontImage, `front_${index}_${timestamp}.png`),
                created_at: new Date().toISOString(),
                prompt_used: this.buildImagePrompt(
                  productData.name,
                  productData.productType,
                  "front",
                  collection_description
                ),
                regenerated: true,
              },
            ],
          };
        })
      );

      return productsWithImages;
    } catch (error) {
      console.error("Error generating collection from images:", error);
      throw new Error("Failed to generate complete collection from images.");
    }
  }

  async generateCompleteCollection(
    collection_name: string,
    collection_description: string,
    collectionType: "single-product" | "multi-product",
    size: number,
    logoUrl?: string // The logo is an optional URL string
  ): Promise<ProductData[]> {
    try {
      // Step 1: Generate product data using OpenAI
      const productDataArray = await this.generateProductData(
        collection_name,
        collection_description,
        collectionType,
        size
      );

      // Define helper function once, outside the loop
      const saveImageToSupabase = async (dataUrl: string, fileName: string): Promise<string> => {
        const cleanedBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(cleanedBase64, "base64");
        const uploadedUrl = await uploadBufferToSupabase(buffer, fileName);
        if (!uploadedUrl) {
          throw new Error(`Failed to upload image: ${fileName}`);
        }
        return uploadedUrl;
      };

      // Step 2: Generate images for each product and combine data
      const productsWithImages = await Promise.all(
        productDataArray.map(async (productData, index) => {
          const productId = uuidv4();
          const images = await this.generateProductImages(
            productData.name,
            productData.productType,
            collection_description,
            logoUrl // Pass the logo URL here
          );

          // Create more unique filenames
          const timestamp = Date.now();
          const frontFileName = `front_${index}_${timestamp}.png`;
          const backFileName = `back_${index}_${timestamp}.png`;
          const sideFileName = `side_${index}_${timestamp}.png`;

          return {
            ...productData,
            id: productId,
            image_data: [
              {
                view: "front" as "front",
                url: await saveImageToSupabase(images.frontImage, frontFileName),
                created_at: new Date().toISOString(),
                prompt_used: this.buildImagePrompt(
                  productData.name,
                  productData.productType,
                  "front",
                  collection_description
                ),
                regenerated: true,
              },
            ],
          };
        })
      );

      return productsWithImages;
    } catch (error) {
      console.error("Error generating the complete collection:", error);
      throw new Error("Failed to generate the complete collection.");
    }
  }

  // --- Prompt Building Helpers (Largely unchanged, but with minor refinements) ---

  private buildProductDataPrompt(
    collection_name: string,
    collection_description: string,
    collectionType: "single-product" | "multi-product",
    size: number
  ): string {
    const commonStructure = `
      "name": "Specific product name with variation details",
      "collection_name": "${collection_name}",
      "collection_description": "${collection_description}",
      "price": number (realistic price in USD),
      "productType": "The primary material or fabric type (e.g., cotton, leather, plastic, metal)",
      "material": ["A list of all specific materials used to create this product"]
    `;

    const promptIntro =
      collectionType === "single-product"
        ? `Generate ${size} variations of a single product for the collection "${collection_name}". Description: ${collection_description}.`
        : `Generate ${size} different products for the multi-product collection "${collection_name}". Description: ${collection_description}.`;

    return `${promptIntro}
      Return a single JSON object with a key "products" that contains an array of ${size} product objects.
      Each object in the array must have this exact structure: { ${commonStructure} }
      Do not include any other text or formatting in your response.`;
  }

  private buildAnalysisPrompt(collection_name: string, collection_description: string): string {
    return `Analyze the provided product image within the context of the "${collection_name}" collection (${collection_description}).
    Extract the following details and return them in a JSON object.
    
    Structure:
    {
      "name": "A specific, descriptive name for the product in the image",
      "price": number (estimate a realistic price in USD),
      "productType": "The primary material or category (e.g., 'Cotton T-Shirt', 'Ceramic Mug', 'Leather Wallet')",
      "material": ["A list of specific materials you identify in the product"]
    }`;
  }

  // private buildImagePrompt(
  //   productName: string,
  //   productType: string,
  //   viewAngle: "front" | "back" | "side",
  //   collectionStyle?: string
  // ): string {
  //   const viewDescriptions = {
  //     front: "Front-facing view ",
  //     back: "Back-facing view",
  //     side: "Side-facing view",
  //   };

  //   return `A high-resolution, studio-lit product photograph of a ${productName} made from ${productType}.
  //   View: ${viewDescriptions[viewAngle]}.
  //   The product must be identical in design, color, and texture across all views. Only the camera angle changes.
  //   Style: ${collectionStyle || "Modern, professional product photography"}.
  //   Background: Clean, seamless white background.
  //   Lighting: Professional three-point studio lighting with soft shadows.
  //   Quality: Ultra-realistic, sharp focus, highly detailed for premium e-commerce. Square aspect ratio.`;
  // }

  // ... Previous imports and class definition remain unchanged

  // --- Prompt Building Helper (Updated for consistency across views) ---

  private buildImagePrompt(
    productName: string,
    productType: string,
    viewAngle: "front" | "back" | "side",
    collectionStyle?: string
  ): string {
    const viewDescriptions = {
      front: "Front-facing view",
      back: "Back-facing view",
      side: "Side-facing view",
    };

    return `
A high-resolution, studio-lit product photograph of a ${productName} made from ${productType}.
View: ${viewDescriptions[viewAngle]}.
All views (front, back, side) for this product must show an identical object, with no changes in design, color, logo placement, material, or texture—only the angle should change.
If a logo is present, it should appear in a consistent way across all applicable views.
Background: Clean, seamless white. Lighting: Professional studio.
Style: ${collectionStyle || "Modern, professional product photography"}.
Quality: Ultra-realistic, sharp focus, highly detailed for premium e-commerce. Square aspect ratio.`;
  }
}
