import { GeminiImageService } from "@/lib/ai";
import OpenAI from "openai";
import { ImageGenerationResponse, ProductData } from "./ai-collections";
import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
import { deleteOldImages } from "@/lib/supabase/productIdea";
export type ProductImageData = {
  view: "front" | "back" | "side";
  url: string;
  created_at: string;
  prompt_used: string;
  regenerated: boolean;
};
export class AIProductUpdater {
  private openai: OpenAI;
  private geminiImageService: GeminiImageService;

  constructor() {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      throw new Error(
        "NEXT_PUBLIC_OPENAI_API_KEY is not set in environment variables."
      );
    }
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    this.geminiImageService = new GeminiImageService();
  }

  /**
   * STAGE 1: Generates temporary product previews with Base64 image data.
   * These are not saved to any database.
   *
   * @param originalProduct - The single product object selected by the user.
   * @param userPrompt - The user's text prompt describing the desired new collection.
   * @param logoUrl - Optional URL for a logo to be applied to the new products.
   * @returns A promise that resolves to an array of 6 new ProductData objects with Base64 image URLs.
   */
  async generateMatchingProductPreviews(
    originalProduct: ProductData,
    userPrompt: string,
    logoUrl?: string
  ): Promise<ProductData[]> {
    const numberOfProducts = 1;

    try {
      // Step 1: Generate new product metadata
      const newProductDataArray = await this.generateNewProductData(
        originalProduct,
        userPrompt,
        numberOfProducts
      );

      // Step 2: Generate images for each new product but do not upload
      const productsWithImageData = await Promise.all(
        newProductDataArray.map(async (newProductData) => {
          const images = await this.generateProductImages(
            newProductData.name,
            newProductData.productType,
            newProductData.collection_description,
            logoUrl
          );

          // Return product data with raw Base64 image data instead of URLs
          return {
            ...newProductData,
            image_data: [
              {
                view: "front" as "front",
                url: images.frontImage, // This is a Base64 data URI
                created_at: new Date().toISOString(),
                prompt_used: this.buildImagePrompt(
                  newProductData.name,
                  newProductData.productType,
                  "front",
                  newProductData.collection_description
                ),
                regenerated: true,
              },
              {
                view: "back" as "back",
                url: images.backImage, // Base64
                created_at: new Date().toISOString(),
                prompt_used: this.buildImagePrompt(
                  newProductData.name,
                  newProductData.productType,
                  "back",
                  newProductData.collection_description
                ),
                regenerated: true,
              },
              {
                view: "side" as "side",
                url: images.sideImage, // Base64
                created_at: new Date().toISOString(),
                prompt_used: this.buildImagePrompt(
                  newProductData.name,
                  newProductData.productType,
                  "side",
                  newProductData.collection_description
                ),
                regenerated: true,
              },
            ],
          };
        })
      );

      return productsWithImageData;
    } catch (error) {
      console.error("Error generating matching product previews:", error);
      throw new Error("Failed to generate matching product previews.");
    }
  }

  /**
   * STAGE 2: Finalizes the user's choice.
   * Replaces the original product, uploads the new images, and deletes the old ones.
   *
   * @param selectedProduct - The product chosen by the user (with Base64 image URLs).
   * @param originalProduct - The product to be replaced in the collection.
   * @param fullCollection - The entire current collection array.
   * @returns The updated collection array with the product replaced and image URLs finalized.
   */
  async finalizeProductSelection(
    selectedProduct: ProductData,
    originalProduct: ProductData,
    fullCollection: ProductData[]
  ): Promise<ProductData[]> {
    try {
      // Step 1: Delete the old images from Supabase Storage
      if (originalProduct.image_data) {
        const oldImagePaths = originalProduct.image_data;
        await deleteOldImages(oldImagePaths);
      }
      // Add a guard clause to confirm image_data exists on the selected product.
      if (!selectedProduct.image_data) {
        throw new Error(
          "The selected product is missing image data and cannot be finalized."
        );
      }
      // Step 2: Upload the ne
      // w images for the selected product
      // The type here MUST match the structure defined in ProductData
      const finalImageData: ProductImageData[] = await Promise.all(
        selectedProduct.image_data.map(async (img) => {
          const timestamp = Date.now();
          // Use a more descriptive filename for the final saved image
          const fileName = `product_${selectedProduct.name.replace(/\s+/g, "_")}_${img.view}_${timestamp}.png`;

          // img.url currently holds the Base64 data URI from the preview stage
          const uploadedUrl = await this.saveImageToSupabase(img.url, fileName);

          // Return a new object that matches the final structure exactly
          return {
            view: img.view,
            url: uploadedUrl,
            created_at: new Date().toISOString(),
            prompt_used: img.prompt_used,
            regenerated: true, // It's a newly generated and selected image
          };
        })
      );

      // Step 3: Create the final product object with the uploaded image URLs
      const finalProduct: ProductData = {
        ...selectedProduct,
        image_data: finalImageData, // This is now correctly typed
      };

      // Step 4: Find and replace the original product in the collection
      // Using a unique ID is safer than a name if available
      const productIndex = fullCollection.findIndex(
        (p) => p.name === originalProduct.name
      );

      if (productIndex === -1) {
        throw new Error("Original product not found in the collection.");
      }

      const updatedCollection = [...fullCollection];
      updatedCollection[productIndex] = finalProduct;

      return updatedCollection;
    } catch (error) {
      console.error("Error finalizing product selection:", error);
      throw new Error(
        "Failed to finalize product selection and update the collection."
      );
    }
  }

  /**
   * Helper to convert Base64 URI to a buffer and upload to Supabase.
   */
  private async saveImageToSupabase(
    dataUrl: string,
    fileName: string
  ): Promise<string> {
    const cleanedBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanedBase64, "base64");
    const uploadedUrl = await uploadBufferToSupabase(buffer, fileName);
    if (!uploadedUrl) {
      throw new Error(`Failed to upload image: ${fileName}`);
    }
    return uploadedUrl;
  }

  // ... (All other private methods like generateNewProductData, generateProductImages, etc., remain the same)

  /**
   * Calls OpenAI to generate metadata for new products.
   */
  private async generateNewProductData(
    originalProduct: ProductData,
    userPrompt: string,
    numberOfProducts: number
  ): Promise<Omit<ProductData, "image_data">[]> {
    const prompt = this.buildMatchingProductPrompt(
      originalProduct,
      userPrompt,
      numberOfProducts
    );

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a product line expert AI. Your task is to generate product specifications for a new collection based on an existing product and a user's request. You must respond with a valid JSON object containing a 'products' array and nothing else. Do not include any explanatory text or markdown.",
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

      const responseObject = JSON.parse(content);
      const products = responseObject.products;

      if (!Array.isArray(products)) {
        throw new Error(
          "The generated content is not a valid JSON array of products."
        );
      }

      return products;
    } catch (error) {
      console.error("Error generating new product data:", error);
      throw new Error(
        "Failed to generate and parse new product data from OpenAI."
      );
    }
  }

  /**
   * Generates front, back, and side images for a single product.
   */
  private async generateProductImages(
    productName: string,
    productType: string,
    collectionStyle?: string,
    logoUrl?: string
  ): Promise<ImageGenerationResponse> {
    const images = await Promise.all([
      this.generateSingleImage(
        productName,
        productType,
        "front",
        collectionStyle,
        logoUrl
      ),
      this.generateSingleImage(
        productName,
        productType,
        "back",
        collectionStyle
      ),
      this.generateSingleImage(
        productName,
        productType,
        "side",
        collectionStyle
      ),
    ]);

    return {
      frontImage: images[0],
      backImage: images[1],
      sideImage: images[2],
    };
  }

  /**
   * Generates a single image using the Gemini service.
   */
  private async generateSingleImage(
    productName: string,
    productType: string,
    viewAngle: "front" | "back" | "side",
    collectionStyle?: string,
    logoUrl?: string
  ): Promise<string> {
    const prompt = this.buildImagePrompt(
      productName,
      productType,
      viewAngle,
      collectionStyle
    );
    const imageData = await this.geminiImageService.generateImage({
      prompt: prompt,
      logoImage: logoUrl,
      productType: productName,
      view: viewAngle,
      options: { enhancePrompt: true, fallbackEnabled: true, retry: 3 },
    });

    if (!imageData || !imageData.url) {
      throw new Error(`Failed to retrieve image URL for ${viewAngle} view.`);
    }
    return imageData.url;
  }

  /**
   * Builds the prompt for generating new matching products.
   */
  private buildMatchingProductPrompt(
    originalProduct: ProductData,
    userPrompt: string,
    numberOfProducts: number
  ): string {
    return `
      You are an expert product line AI. Your task is to generate ${numberOfProducts} new products that form a cohesive collection based on an original product and a user's creative direction.

      **Original Product Details:**
      - Name: "${originalProduct.name}"
      - Collection Description: "${originalProduct.collection_description}"
      - Materials: ${originalProduct.material.join(", ")}
      - Price Point: ~$${originalProduct.price}

      **User's New Creative Direction:** "${userPrompt}"

      **Your Task:**
      Generate a JSON object with a key "products" containing an array of exactly ${numberOfProducts} new product objects.
      - The new products MUST be inspired by the original product but adapted to the user's new direction.
      - They should feel like they belong in a new, related collection.
      - DO NOT include the original product in your response.

      **JSON Structure for Each Product:**
      {
        "name": "A specific, creative name for the new product",
        "collection_name": "${originalProduct.collection_name}",
        "collection_description": "A new collection description that reflects the user's prompt: '${userPrompt}'",
        "price": "number (a realistic price in USD, relative to the original product's price)",
        "productType": "The primary material or category (e.g., 'Organic Cotton', 'Recycled Polyester', 'Leather')",
        "material": ["An array of specific materials used in this new product"]
      }

      Ensure your entire response is ONLY the raw JSON object, starting with { and ending with }.
    `;
  }

  /**
   * Builds the prompt for generating a single product image.
   */
  private buildImagePrompt(
    productName: string,
    productType: string,
    viewAngle: "front" | "back" | "side",
    collectionStyle?: string
  ): string {
    const viewDescriptions = {
      front: "Front-facing view showing the main features",
      back: "Back view showing the rear design",
      side: "Side profile view showing shape and depth",
    };

    return `A high-resolution, studio-lit product photograph of a ${productName} made from ${productType}.
      View: ${viewDescriptions[viewAngle]}.
      The product must be identical in design, color, and texture across all views. Only the camera angle changes.
      Style: ${collectionStyle || "Modern, professional product photography"}.
      Background: Clean, seamless white background.
      Lighting: Professional three-point studio lighting with soft shadows.
      Quality: Ultra-realistic, sharp focus, highly detailed for premium e-commerce. Square aspect ratio.`;
  }
}
