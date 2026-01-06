"use server";

import OpenAI from "openai";
import { aiLogger } from "@/lib/logging/ai-logger";

function getOpenAIClient() {
  if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server");
  }

  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });
}

export async function improvePrompt(userPrompt: string): Promise<{
  success: boolean;
  improvedPrompt?: string;
  error?: string;
}> {
  try {
    if (!userPrompt.trim()) {
      return {
        success: false,
        error: "Please enter a prompt first",
      };
    }

    const openai = getOpenAIClient();

    const systemPrompt = `You are an expert product development assistant. Your task is to enhance user product ideas to make them more detailed and suitable for creating comprehensive tech packs.

Guidelines for improvement:
1. Add specific material suggestions (e.g., "cotton blend fabric" instead of just "fabric")
2. Include approximate dimensions when relevant (e.g., "medium-sized tote bag (40cm x 35cm)")
3. Specify construction details (e.g., "reinforced stitching", "double-layered bottom")
4. Add color and finish details (e.g., "matte black finish", "natural wood grain")
5. Include functional features (e.g., "waterproof coating", "adjustable straps")
6. Mention target use cases (e.g., "for daily commuting", "outdoor activities")
7. Add sustainability aspects when possible (e.g., "recycled materials", "eco-friendly")

Keep the enhanced prompt concise but detailed (2-4 sentences max). Maintain the user's original intent while making it more specific and actionable for manufacturing.

Original prompt: "${userPrompt}"

Provide only the improved prompt, no explanations or additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Improve this product idea: ${userPrompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const improvedPrompt = completion.choices[0].message.content?.trim();

    if (!improvedPrompt) {
      return {
        success: false,
        error: "Failed to improve prompt",
      };
    }

    return {
      success: true,
      improvedPrompt,
    };
  } catch (error: any) {
    console.error("Error improving prompt:", error);
    return {
      success: false,
      error: "Failed to improve prompt. Please try again.",
    };
  }
}

export async function improveDesignDescription(
  description: string,
  uploadedImageBase64?: string
): Promise<{
  success: boolean;
  improvedPrompt?: string;
  error?: string;
}> {
  try {
    const openai = getOpenAIClient();

    // Initialize logger
    const logger = aiLogger.startOperation(
      "improveDesignDescription",
      "gpt-4o-mini",
      "openai",
      uploadedImageBase64 ? "vision_analysis" : "text_generation"
    );

    // If no image is uploaded, use the regular improvement
    if (!uploadedImageBase64) {
      return improvePrompt(description);
    }

    // First, analyze the uploaded image to understand what product it is
    const analysisSystemPrompt = `You are a product design expert. Analyze the uploaded image and understand what product is shown. Then improve the user's description to be more specific and detailed, while staying true to the actual product in the image.

Your task:
1. First, identify what product is shown in the image
2. Then enhance the user's description by:
   - Adding specific details visible in the image
   - Incorporating the user's requested modifications
   - Suggesting materials, dimensions, and construction details based on what you see
   - Keeping the description relevant to the actual product shown

IMPORTANT: The improved description must describe the SAME product type as shown in the image. Do not change it to a different product.`;

    const userMessage = description.trim()
      ? `User's description/modifications: "${description}". Please improve this description based on the product shown in the image.`
      : "Please describe the product shown in the image with detailed specifications.";

    logger.setInput({
      prompt: userMessage,
      system_prompt: analysisSystemPrompt,
      image: "uploaded_design_base64",
      parameters: {
        max_tokens: 300,
      },
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: analysisSystemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userMessage,
            },
            {
              type: "image_url",
              image_url: {
                url: uploadedImageBase64,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const improvedDescription = completion.choices[0].message.content;

    if (!improvedDescription) {
      throw new Error("No response from AI");
    }

    // Log output
    logger.setOutput({
      content: improvedDescription,
      usage: completion.usage,
    });

    await logger.complete();

    return {
      success: true,
      improvedPrompt: improvedDescription.trim(),
    };
  } catch (error: any) {
    console.error("Error improving design description:", error);

    // If vision analysis fails, fall back to regular text improvement
    if (description.trim()) {
      return improvePrompt(description);
    }

    return {
      success: false,
      error: error.message || "Failed to improve description",
    };
  }
}
