"use server";

import { createClient } from "@/lib/supabase/server";
import { parseImageIntent, type ParsedImageIntent } from "./parse-image-intent";

export type ImageToolType = "logo" | "sketch" | "reference" | "texture" | "pattern" | "model";

export type LogoPosition =
  | "front-left"
  | "front-right"
  | "front-center"
  | "back-left"
  | "back-right"
  | "back-center"
  | "side-left"
  | "side-right"
  | "top"
  | "bottom"
  | "all-over"
  | "custom";

export interface ImageToolSelection {
  toolType: ImageToolType;
  note?: string;
  logoPosition?: LogoPosition;
  // New fields from AI parsing
  colorModification?: {
    changeColor: boolean;
    targetColor?: string;
    colorHex?: string;
  };
  sizeModification?: {
    size: "small" | "medium" | "large" | "extra-large" | "custom";
    customSize?: string;
  };
  specialInstructions?: string;
  parsedByAI?: boolean;
}

/**
 * Save uploaded chat image to product metadata
 * This allows the image generation API to access the uploaded image
 */
export async function saveChatUploadedImageToMetadata(
  productId: string,
  imageUrl: string,
  toolSelection?: ImageToolSelection
) {
  try {
    const supabase = await createClient();

    // Get current tech_pack
    const { data: project } = await supabase
      .from("product_ideas")
      .select("tech_pack")
      .eq("id", productId)
      .single();

    if (!project) {
      return { success: false, error: "Product not found" };
    }

    // Update metadata with uploaded image and tool selection
    const updatedTechPack = {
      ...project.tech_pack,
      metadata: {
        ...project.tech_pack?.metadata,
        chatUploadedImage: imageUrl, // Store uploaded image URL
        chatImageToolType: toolSelection?.toolType, // logo, sketch, reference, texture, pattern
        chatImageLogoPosition: toolSelection?.logoPosition, // Position for logo
        chatImageNote: toolSelection?.note, // Additional user notes
        // New fields from AI parsing
        chatImageColorModification: toolSelection?.colorModification, // Color change info
        chatImageSizeModification: toolSelection?.sizeModification, // Size info
        chatImageSpecialInstructions: toolSelection?.specialInstructions, // Extra instructions
        chatImageParsedByAI: toolSelection?.parsedByAI, // Was this parsed by AI?
      },
    };

    console.log(`[Save Chat Image] Saving image to metadata for product ${productId}:`, {
      imageUrl: imageUrl?.substring(0, 50) + '...',
      toolType: toolSelection?.toolType,
      logoPosition: toolSelection?.logoPosition,
      hasNote: !!toolSelection?.note,
      colorModification: toolSelection?.colorModification,
      sizeModification: toolSelection?.sizeModification,
      parsedByAI: toolSelection?.parsedByAI,
    });

    const { error } = await supabase
      .from("product_ideas")
      .update({ tech_pack: updatedTechPack })
      .eq("id", productId);

    if (error) {
      console.error("Error saving uploaded image to metadata:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving uploaded image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Parse user message and save image with AI-detected intent
 * This is the main function to use when user uploads an image with a message
 *
 * IMPORTANT: If the user already selected a tool type via ImageToolDialog,
 * we respect that selection and only use AI to enhance with color/size/position.
 */
export async function saveImageWithAIParsedIntent(
  productId: string,
  imageUrl: string,
  userMessage: string
): Promise<{ success: boolean; intent?: ParsedImageIntent; enhancedPrompt?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // First, check if user already made a tool selection via ImageToolDialog
    const { data: product } = await supabase
      .from("product_ideas")
      .select("tech_pack")
      .eq("id", productId)
      .single();

    const existingMetadata = product?.tech_pack?.metadata || {};
    const existingToolType = existingMetadata.chatImageToolType;
    const existingLogoPosition = existingMetadata.chatImageLogoPosition;

    console.log(`[Save Image With AI Intent] Checking existing selection:`, {
      existingToolType,
      existingLogoPosition,
      hasExistingSelection: !!existingToolType,
    });

    // If user already selected a tool type via dialog, RESPECT IT
    // Only use AI to parse color/size modifications from the message
    if (existingToolType) {
      console.log(`[Save Image With AI Intent] User already selected tool: ${existingToolType}, respecting that selection`);

      // Use AI only to extract color/size from message, not tool type
      const parseResult = await parseImageIntent(userMessage, imageUrl);

      // Build tool selection using EXISTING tool type but AI-parsed color/size
      const toolSelection: ImageToolSelection = {
        toolType: existingToolType as ImageToolType, // Use user's explicit selection
        logoPosition: existingLogoPosition || parseResult.intent?.position,
        note: userMessage,
        colorModification: parseResult.intent?.colorModification,
        sizeModification: parseResult.intent?.sizeModification,
        specialInstructions: parseResult.intent?.specialInstructions,
        parsedByAI: false, // User selection takes priority
      };

      // Save with user's tool type preserved
      const saveResult = await saveChatUploadedImageToMetadata(productId, imageUrl, toolSelection);

      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      // Build intent to return (with user's tool type)
      const finalIntent: ParsedImageIntent = {
        toolType: existingToolType as ImageToolType,
        position: existingLogoPosition || parseResult.intent?.position,
        colorModification: parseResult.intent?.colorModification,
        sizeModification: parseResult.intent?.sizeModification,
        specialInstructions: parseResult.intent?.specialInstructions,
        confidence: 100, // User explicitly selected
      };

      return {
        success: true,
        intent: finalIntent,
        enhancedPrompt: parseResult.enhancedPrompt,
      };
    }

    // No existing selection - use full AI parsing
    const parseResult = await parseImageIntent(userMessage, imageUrl);

    if (!parseResult.success || !parseResult.intent) {
      // Fall back to basic save without AI parsing
      await saveChatUploadedImageToMetadata(productId, imageUrl, {
        toolType: "logo",
        note: userMessage,
      });
      return { success: true };
    }

    // Convert ParsedImageIntent to ImageToolSelection
    const toolSelection: ImageToolSelection = {
      toolType: parseResult.intent.toolType,
      logoPosition: parseResult.intent.position,
      note: userMessage,
      colorModification: parseResult.intent.colorModification,
      sizeModification: parseResult.intent.sizeModification,
      specialInstructions: parseResult.intent.specialInstructions,
      parsedByAI: true,
    };

    // Save to metadata
    const saveResult = await saveChatUploadedImageToMetadata(productId, imageUrl, toolSelection);

    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return {
      success: true,
      intent: parseResult.intent,
      enhancedPrompt: parseResult.enhancedPrompt,
    };
  } catch (error) {
    console.error("[Save Image With AI Intent] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
