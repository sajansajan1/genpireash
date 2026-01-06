"use server";

import OpenAI from "openai";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });
}

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

export interface ParsedImageIntent {
  toolType: ImageToolType;
  position?: LogoPosition;
  colorModification?: {
    changeColor: boolean;
    targetColor?: string; // e.g., "white", "black", "#FF0000"
    colorHex?: string;
  };
  sizeModification?: {
    size: "small" | "medium" | "large" | "extra-large" | "custom";
    customSize?: string;
  };
  specialInstructions?: string;
  confidence: number; // 0-100
}

export interface ParseImageIntentResult {
  success: boolean;
  intent?: ParsedImageIntent;
  enhancedPrompt?: string;
  error?: string;
}

/**
 * Use AI to parse the user's message and uploaded image to understand their intent
 * This extracts: tool type, position, color changes, size, and special instructions
 */
export async function parseImageIntent(
  userMessage: string,
  imageUrl?: string
): Promise<ParseImageIntentResult> {
  try {
    const openai = getOpenAIClient();

    const systemPrompt = `You are an expert at analyzing user requests for product design modifications.
When a user uploads an image with a message, you need to determine:

1. **Tool Type** - What is the uploaded image?
   - "logo" - A brand logo, symbol, icon, or text graphic to be placed ON the product
   - "sketch" - A hand-drawn design or concept art to be converted into a finished product
   - "reference" - An inspiration image showing a style, mood, or design approach to follow
   - "texture" - A material texture or pattern to apply to the product surface
   - "pattern" - A repeating pattern to apply across the product
   - "model" - A photo of a person/model that the user wants to show WEARING the product (virtual try-on)

2. **Position** (for logos) - Where should it be placed?
   - "front-center" - Center of the front (most common for logos)
   - "front-left" - Left side of front (like left chest on apparel)
   - "front-right" - Right side of front
   - "back-center" - Center of back
   - "back-left" / "back-right" - Sides of back
   - "side-left" / "side-right" - On sides/sleeves
   - "top" / "bottom" - Top or bottom of product
   - "all-over" - Repeating across the entire product

3. **Color Modification** - Should the image color be changed?
   - Look for words like "white", "black", "red", "make it [color]", "in [color]", "color it"
   - Extract the target color and provide hex code if possible

4. **Size** - What size should it be?
   - "small", "medium", "large", "extra-large"
   - Look for words like "big", "small", "large", "subtle", "prominent"

5. **Special Instructions** - Any other requirements mentioned

Respond with a JSON object:
{
  "toolType": "logo" | "sketch" | "reference" | "texture" | "pattern",
  "position": "front-center" | "front-left" | etc. (only for logos),
  "colorModification": {
    "changeColor": true/false,
    "targetColor": "white" | "black" | etc.,
    "colorHex": "#FFFFFF" | "#000000" | etc.
  },
  "sizeModification": {
    "size": "small" | "medium" | "large" | "extra-large",
    "customSize": "specific dimensions if mentioned"
  },
  "specialInstructions": "any other requirements",
  "confidence": 0-100
}`;

    const userPrompt = `Analyze this user request for a product design modification:

USER MESSAGE: "${userMessage}"

${imageUrl ? `The user has uploaded an image (URL: ${imageUrl.substring(0, 50)}...)` : "No image was uploaded."}

Determine what the user wants to do with the uploaded image and extract all relevant details.
Be smart about interpreting natural language:
- "add this logo" or "put this on" → toolType: "logo"
- "front", "center", "middle" → position: "front-center"
- "white", "make it white", "in white" → colorModification with white
- "apply", "use as reference", "like this" → could be reference or texture
- "wear", "wearing", "make him/her wear", "show on model", "try on", "put it on them" → toolType: "model" (virtual try-on)

IMPORTANT: If the user mentions "wear", "wearing", "try on", or shows a person/model and wants the product ON them, use "model" type, NOT "reference".

Respond with ONLY the JSON object, no markdown or explanation.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(response) as ParsedImageIntent;

    // Validate and normalize the parsed intent
    const normalizedIntent = normalizeIntent(parsed);

    // Build an enhanced prompt based on the parsed intent
    const enhancedPrompt = buildEnhancedPrompt(userMessage, normalizedIntent);

    console.log("[Parse Image Intent] Parsed intent:", normalizedIntent);
    console.log("[Parse Image Intent] Enhanced prompt:", enhancedPrompt);

    return {
      success: true,
      intent: normalizedIntent,
      enhancedPrompt,
    };
  } catch (error) {
    console.error("[Parse Image Intent] Error:", error);

    // Return a default intent based on simple keyword matching as fallback
    const fallbackIntent = getFallbackIntent(userMessage);

    return {
      success: true,
      intent: fallbackIntent,
      enhancedPrompt: userMessage,
    };
  }
}

/**
 * Normalize and validate the parsed intent
 */
function normalizeIntent(parsed: ParsedImageIntent): ParsedImageIntent {
  // Validate tool type
  const validToolTypes: ImageToolType[] = ["logo", "sketch", "reference", "texture", "pattern", "model"];
  const toolType = validToolTypes.includes(parsed.toolType) ? parsed.toolType : "logo";

  // Validate position
  const validPositions: LogoPosition[] = [
    "front-left", "front-right", "front-center",
    "back-left", "back-right", "back-center",
    "side-left", "side-right", "top", "bottom", "all-over", "custom"
  ];
  const position = parsed.position && validPositions.includes(parsed.position)
    ? parsed.position
    : (toolType === "logo" ? "front-center" : undefined);

  // Normalize color
  let colorModification = parsed.colorModification;
  if (colorModification?.changeColor && colorModification.targetColor) {
    const colorMap: Record<string, string> = {
      "white": "#FFFFFF",
      "black": "#000000",
      "red": "#FF0000",
      "blue": "#0000FF",
      "green": "#00FF00",
      "yellow": "#FFFF00",
      "gold": "#FFD700",
      "silver": "#C0C0C0",
      "gray": "#808080",
      "grey": "#808080",
      "navy": "#000080",
      "orange": "#FFA500",
      "pink": "#FFC0CB",
      "purple": "#800080",
    };

    const targetColorLower = colorModification.targetColor.toLowerCase();
    colorModification.colorHex = colorMap[targetColorLower] || colorModification.colorHex || "#FFFFFF";
  }

  return {
    toolType,
    position,
    colorModification,
    sizeModification: parsed.sizeModification,
    specialInstructions: parsed.specialInstructions,
    confidence: Math.min(100, Math.max(0, parsed.confidence || 70)),
  };
}

/**
 * Build an enhanced prompt based on the parsed intent
 */
function buildEnhancedPrompt(originalMessage: string, intent: ParsedImageIntent): string {
  const parts: string[] = [];

  // Start with a clear action statement
  switch (intent.toolType) {
    case "logo":
      parts.push(`🎯 ADD LOGO TO PRODUCT`);
      break;
    case "sketch":
      parts.push(`✏️ CONVERT SKETCH TO FINISHED DESIGN`);
      break;
    case "reference":
      parts.push(`🖼️ USE AS STYLE REFERENCE`);
      break;
    case "texture":
      parts.push(`🧵 APPLY TEXTURE TO PRODUCT`);
      break;
    case "pattern":
      parts.push(`🔄 APPLY PATTERN TO PRODUCT`);
      break;
    case "model":
      parts.push(`👤 VIRTUAL TRY-ON - SHOW PRODUCT ON MODEL`);
      break;
  }

  // Add position for logos
  if (intent.toolType === "logo" && intent.position) {
    const positionLabels: Record<string, string> = {
      "front-center": "FRONT CENTER (prominently visible)",
      "front-left": "FRONT LEFT (left chest area)",
      "front-right": "FRONT RIGHT (right chest area)",
      "back-center": "BACK CENTER (between shoulders)",
      "back-left": "BACK LEFT",
      "back-right": "BACK RIGHT",
      "side-left": "LEFT SIDE/SLEEVE",
      "side-right": "RIGHT SIDE/SLEEVE",
      "top": "TOP OF PRODUCT",
      "bottom": "BOTTOM OF PRODUCT",
      "all-over": "ALL-OVER REPEATING PATTERN",
    };
    parts.push(`📍 POSITION: ${positionLabels[intent.position] || intent.position.toUpperCase()}`);
  }

  // Add color modification
  if (intent.colorModification?.changeColor && intent.colorModification.targetColor) {
    parts.push(`🎨 COLOR: Change logo/image to ${intent.colorModification.targetColor.toUpperCase()} (${intent.colorModification.colorHex})`);
    parts.push(`⚠️ CRITICAL: The uploaded image must be rendered in ${intent.colorModification.targetColor.toUpperCase()} color, not its original color!`);
  }

  // Add size
  if (intent.sizeModification?.size) {
    const sizeLabels: Record<string, string> = {
      "small": "SMALL (subtle, understated)",
      "medium": "MEDIUM (standard size)",
      "large": "LARGE (prominent, eye-catching)",
      "extra-large": "EXTRA LARGE (dominant feature)",
    };
    parts.push(`📏 SIZE: ${sizeLabels[intent.sizeModification.size] || intent.sizeModification.size}`);
  }

  // Add special instructions
  if (intent.specialInstructions) {
    parts.push(`📝 SPECIAL INSTRUCTIONS: ${intent.specialInstructions}`);
  }

  // Add original message for context
  parts.push(`\n💬 ORIGINAL REQUEST: "${originalMessage}"`);

  return parts.join("\n");
}

/**
 * Fallback intent detection using simple keyword matching
 */
function getFallbackIntent(message: string): ParsedImageIntent {
  const lowerMessage = message.toLowerCase();

  // Detect tool type
  let toolType: ImageToolType = "logo"; // Default

  // Check for model/try-on FIRST (before reference) since it's more specific
  if (lowerMessage.includes("wear") || lowerMessage.includes("wearing") ||
      lowerMessage.includes("try on") || lowerMessage.includes("try-on") ||
      lowerMessage.includes("on model") || lowerMessage.includes("on him") ||
      lowerMessage.includes("on her") || lowerMessage.includes("on them") ||
      lowerMessage.includes("put it on")) {
    toolType = "model";
  } else if (lowerMessage.includes("sketch") || lowerMessage.includes("drawing") || lowerMessage.includes("hand-drawn")) {
    toolType = "sketch";
  } else if (lowerMessage.includes("reference") || lowerMessage.includes("inspiration") || lowerMessage.includes("like this")) {
    toolType = "reference";
  } else if (lowerMessage.includes("texture") || lowerMessage.includes("material") || lowerMessage.includes("fabric")) {
    toolType = "texture";
  } else if (lowerMessage.includes("pattern") || lowerMessage.includes("repeat")) {
    toolType = "pattern";
  }

  // Detect position
  let position: LogoPosition = "front-center"; // Default
  if (lowerMessage.includes("back")) {
    position = lowerMessage.includes("left") ? "back-left" :
               lowerMessage.includes("right") ? "back-right" : "back-center";
  } else if (lowerMessage.includes("front")) {
    position = lowerMessage.includes("left") ? "front-left" :
               lowerMessage.includes("right") ? "front-right" : "front-center";
  } else if (lowerMessage.includes("center") || lowerMessage.includes("middle")) {
    position = "front-center";
  } else if (lowerMessage.includes("side") || lowerMessage.includes("sleeve")) {
    position = lowerMessage.includes("left") ? "side-left" : "side-right";
  }

  // Detect color
  const colorKeywords = [
    { keywords: ["white", "in white", "make it white"], color: "white", hex: "#FFFFFF" },
    { keywords: ["black", "in black", "make it black"], color: "black", hex: "#000000" },
    { keywords: ["red", "in red"], color: "red", hex: "#FF0000" },
    { keywords: ["blue", "in blue"], color: "blue", hex: "#0000FF" },
    { keywords: ["gold", "golden"], color: "gold", hex: "#FFD700" },
    { keywords: ["silver"], color: "silver", hex: "#C0C0C0" },
  ];

  let colorModification: ParsedImageIntent["colorModification"] = undefined;
  for (const { keywords, color, hex } of colorKeywords) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      colorModification = { changeColor: true, targetColor: color, colorHex: hex };
      break;
    }
  }

  // Detect size
  let sizeModification: ParsedImageIntent["sizeModification"] = undefined;
  if (lowerMessage.includes("small") || lowerMessage.includes("subtle")) {
    sizeModification = { size: "small" };
  } else if (lowerMessage.includes("large") || lowerMessage.includes("big")) {
    sizeModification = { size: "large" };
  } else if (lowerMessage.includes("extra large") || lowerMessage.includes("huge")) {
    sizeModification = { size: "extra-large" };
  }

  return {
    toolType,
    position: toolType === "logo" ? position : undefined,
    colorModification,
    sizeModification,
    confidence: 50, // Lower confidence for fallback
  };
}
