"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY! ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
});

export interface MessageContext {
  messageType:
    | "success"
    | "processing"
    | "analysis"
    | "image-ready"
    | "error"
    | "completion";
  productName?: string;
  editPrompt?: string;
  viewType?: "front" | "back" | "side";
  previousEdits?: string[];
  userStyle?: "casual" | "professional" | "friendly";
  progress?: number;
  errorType?: string;
}

interface MessageVariation {
  content: string;
  tone:
    | "enthusiastic"
    | "professional"
    | "friendly"
    | "encouraging"
    | "informative";
}

/**
 * Generate dynamic, context-aware messages using AI
 */
export async function generateDynamicMessage(
  context: MessageContext
): Promise<string> {
  try {
    // Build context prompt based on message type
    const systemPrompt = getSystemPrompt(context.messageType);
    const userPrompt = buildUserPrompt(context);

    // Use GPT to generate a natural, varied message
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
      max_tokens: 100,
      temperature: 0.8, // Higher temperature for more variation
    });

    const generatedMessage = response.choices[0]?.message?.content?.trim();

    // Fallback to template if generation fails
    if (!generatedMessage) {
      return getFallbackMessage(context);
    }

    return generatedMessage;
  } catch (error) {
    console.error("Error generating dynamic message:", error);
    return getFallbackMessage(context);
  }
}

/**
 * Generate batch of varied messages for the same context
 */
export async function generateMessageVariations(
  context: MessageContext,
  count: number = 3
): Promise<MessageVariation[]> {
  try {
    const systemPrompt = `You are an AI assistant in a premium image editing tool. 
    Generate ${count} different natural variations of a message for the given context.
    Each message should have a slightly different tone but convey the same information.
    Keep messages concise (under 30 words) and professional yet friendly.
    Return as JSON array with 'content' and 'tone' fields.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: buildUserPrompt(context),
        },
      ],
      max_tokens: 200,
      temperature: 0.9,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return (
      result.variations || [
        { content: getFallbackMessage(context), tone: "friendly" },
      ]
    );
  } catch (error) {
    console.error("Error generating message variations:", error);
    return [
      { content: getFallbackMessage(context), tone: "friendly" as const },
    ];
  }
}

function getSystemPrompt(messageType: string): string {
  const prompts: Record<string, string> = {
    success: `You're celebrating a successful image edit completion. Be enthusiastic but professional. 
                Acknowledge the specific changes made and encourage further creativity. Keep it under 30 words.`,

    processing: `You're informing about ongoing processing. Be reassuring and informative. 
                   Mention what's happening technically but in simple terms. Add anticipation for the result.`,

    analysis: `You're explaining image analysis in progress. Sound intelligent but accessible. 
                 Reference AI vision capabilities naturally. Build confidence in the process.`,

    "image-ready": `You're announcing a specific view is ready. Be excited and specific about which view. 
                    Encourage the user to review and make adjustments if needed.`,

    completion: `You're wrapping up a multi-step process. Summarize what was accomplished. 
                   Suggest next steps or invite further edits. Sound satisfied but ready for more.`,

    error: `You're explaining an error occurred. Be apologetic but solution-focused. 
              Suggest what the user can try differently. Maintain confidence in the system.`,
  };

  return prompts[messageType] || prompts["processing"];
}

function buildUserPrompt(context: MessageContext): string {
  const parts = [];

  // Add base context
  parts.push(`Message type: ${context.messageType}`);

  // Add specific context elements
  if (context.productName) {
    parts.push(`Product: ${context.productName}`);
  }

  if (context.editPrompt) {
    parts.push(`User requested: "${context.editPrompt}"`);
  }

  if (context.viewType) {
    parts.push(`View being processed: ${context.viewType}`);
  }

  if (context.progress) {
    parts.push(`Progress: ${context.progress}%`);
  }

  if (context.previousEdits && context.previousEdits.length > 0) {
    parts.push(
      `Previous edits in session: ${context.previousEdits.join(", ")}`
    );
  }

  if (context.errorType) {
    parts.push(`Error type: ${context.errorType}`);
  }

  parts.push(
    `Generate a natural, conversational message for this context. Be specific to what's happening.`
  );

  return parts.join("\n");
}

function getFallbackMessage(context: MessageContext): string {
  // Fallback templates with some variation
  const templates: Record<string, string[]> = {
    success: [
      "All views have been successfully updated with your requested changes!",
      "Perfect! Your edits have been applied to all product views.",
      "Great! The changes look fantastic across all angles.",
      "Success! Your product images have been transformed as requested.",
    ],
    processing: [
      "Processing your creative vision into reality...",
      "Working on applying your changes across all views...",
      "Analyzing and implementing your requested edits...",
      "Crafting your perfect product images...",
    ],
    analysis: [
      "Analyzing your images with advanced AI vision...",
      "Understanding your product's visual elements...",
      "Examining the details to ensure perfect edits...",
      "AI is studying your product for optimal results...",
    ],
    "image-ready": [
      `${context.viewType || "View"} has been generated successfully!`,
      `Your ${context.viewType || "new"} view is ready for review!`,
      `The ${context.viewType || "updated"} perspective looks great!`,
      `${context.viewType || "Image"} transformation complete!`,
    ],
    completion: [
      "Your product images have been updated! Feel free to continue editing or save your work.",
      "All done! Review your refreshed product images and make any final adjustments.",
      "Transformation complete! Your product looks amazing from every angle.",
      "Success! Continue refining or save these stunning results.",
    ],
    error: [
      "Oops! Something went wrong. Let's try that again.",
      "We encountered a hiccup. Please try your edit once more.",
      "Technical difficulty detected. Give it another shot!",
      "Something didn't work as expected. Let's retry that edit.",
    ],
  };

  const messageArray =
    templates[context.messageType] || templates["processing"];
  // Return a random message from the array
  return messageArray[Math.floor(Math.random() * messageArray.length)];
}

/**
 * Generate a conversational follow-up message based on context
 */
export async function generateFollowUpMessage(
  previousMessage: string,
  context: MessageContext
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You're following up on a previous message in an image editing session. 
                   Be conversational and build on what was said. Keep it under 25 words.
                   Previous message: "${previousMessage}"`,
        },
        {
          role: "user",
          content: `Generate a natural follow-up for ${context.messageType} context.`,
        },
      ],
      max_tokens: 50,
      temperature: 0.85,
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      getFallbackMessage(context)
    );
  } catch (error) {
    console.error("Error generating follow-up message:", error);
    return getFallbackMessage(context);
  }
}

/**
 * Generate encouraging messages during long operations
 */
export async function generateEncouragementMessage(
  progress: number,
  estimatedTime?: number
): Promise<string> {
  const encouragements = [
    "Looking good so far! Just a bit more...",
    "The AI is working its magic on your images...",
    "Almost there! The results will be worth the wait...",
    "Creating something special for you...",
    "Perfecting every detail of your product...",
    "The transformation is coming along beautifully...",
    "Your vision is taking shape nicely...",
    "Quality takes time - and it's looking great!",
  ];

  if (progress < 30) {
    return encouragements[0] || "Getting started on your edits...";
  } else if (progress < 60) {
    return (
      encouragements[Math.floor(Math.random() * 3) + 1] ||
      "Making good progress..."
    );
  } else if (progress < 90) {
    return (
      encouragements[Math.floor(Math.random() * 3) + 4] || "Almost complete..."
    );
  } else {
    return "Finalizing your stunning results...";
  }
}

/**
 * Generate contextual tips and suggestions
 */
export async function generateTipMessage(
  editHistory: string[],
  productType?: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Generate a helpful tip for image editing based on the user's history. 
                   Be specific and actionable. Keep it under 30 words.`,
        },
        {
          role: "user",
          content: `User has made these edits: ${editHistory.join(", ")}. 
                   ${productType ? `Product type: ${productType}` : ""}
                   Suggest what they might want to try next.`,
        },
      ],
      max_tokens: 60,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "💡 Tip: Try adjusting colors or backgrounds for even more impact!"
    );
  } catch (error) {
    console.error("Error generating tip message:", error);
    return "💡 Tip: Experiment with different styles to find your perfect look!";
  }
}
