import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { convertImageToBase64 } from "@/lib/services/image-analysis-service";

const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      productName,
      temperature = 0.7,
      max_tokens = 300,
      useVision,
      imageUrl,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check for image URL from either the new imageUrl parameter or embedded in prompt
    const screenshotMatch = prompt.match(
      /\[Current Design Screenshot: (https?:\/\/[^\]]+)\]/
    );
    const screenshotUrl =
      imageUrl || (screenshotMatch ? screenshotMatch[1] : null);

    // Prepare messages
    let messages: any[] = [
      {
        role: "system",
        content: useVision
          ? "You are an expert at analyzing product designs and optimizing prompts for AI image generation. When analyzing images, identify specific visual elements, colors, materials, and design features to create detailed, actionable prompts."
          : "You are a helpful AI assistant for a product design tool. Provide clear, conversational responses. When images are provided, analyze them in detail and provide specific visual feedback.",
      },
    ];

    if (screenshotUrl) {
      console.log("Screenshot URL detected, converting to base64 for analysis");

      // Convert image to base64 first (same as image-analysis-service)
      const base64Image = await convertImageToBase64(screenshotUrl);

      if (base64Image) {
        console.log("Using base64 encoded image for analysis");
        // Use GPT-4o with base64 image
        messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
                .replace(/\[Current Design Screenshot: [^\]]+\]/, "")
                .trim(),
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
                detail: "high",
              },
            },
          ],
        });
      } else {
        console.log("Failed to convert image to base64, falling back to URL");
        // Fallback to using the URL directly
        messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
                .replace(/\[Current Design Screenshot: [^\]]+\]/, "")
                .trim(),
            },
            {
              type: "image_url",
              image_url: {
                url: screenshotUrl,
                detail: "high",
              },
            },
          ],
        });
      }
    } else {
      // Regular text message
      messages.push({
        role: "user",
        content: prompt,
      });
    }

    // Call OpenAI API with gpt-4o for both image and text
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature,
      max_tokens: useVision ? 1000 : screenshotUrl ? 500 : max_tokens, // More tokens for Vision optimization
    });

    const message =
      response.choices[0]?.message?.content ||
      "I understand. How else can I help you?";

    return NextResponse.json({
      success: true,
      message,
      suggestion: message, // For compatibility
    });
  } catch (error) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to get AI response",
        message:
          "I apologize, but I'm having trouble processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
