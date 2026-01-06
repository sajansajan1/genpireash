"use server";

import OpenAI from "openai";

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

/**
 * Server action to enhance a user-written prompt using AI
 * @param userPrompt - The prompt written by the user
 * @returns Refined or improved prompt text
 */
export async function enhancePromptAction(userPrompt: string): Promise<string | null> {
  if (!userPrompt?.trim()) {
    console.error("No prompt provided by user.");
    return null;
  }

  try {
    // Send prompt to OpenAI for refinement
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content:
            "You are an expert creative AI prompt engineer. Your job is to refine, clarify, and professionally enhance user-written prompts without changing their meaning. Make them more descriptive, specific, and well-structured so that another AI model could use them effectively. Provide the description in (1-2 sentences)",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 150,
    });

    const refinedPrompt = response.choices[0]?.message?.content?.trim() || null;

    console.log("Original prompt:", userPrompt);
    console.log("Refined prompt:", refinedPrompt);

    return refinedPrompt;
  } catch (error) {
    console.error("Error refining prompt:", error);
    return null;
  }
}
