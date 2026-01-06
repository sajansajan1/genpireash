"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateDynamicMessage,
  generateTipMessage,
} from "./ai-chat-dynamic-messages";

export interface UserEditingPattern {
  userId: string;
  productId: string;
  commonEdits: string[];
  preferredStyle?: "minimalist" | "detailed" | "creative" | "technical";
  editCount: number;
  lastEditTime: string;
}

/**
 * Track user editing patterns for personalization
 */
export async function trackUserEditPattern(
  userId: string,
  productId: string,
  editPrompt: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // Get existing patterns
    const { data: existing } = await supabase
      .from("user_editing_patterns")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      // Update existing pattern
      const commonEdits = existing.common_edits || [];
      if (!commonEdits.includes(editPrompt)) {
        commonEdits.push(editPrompt);
        // Keep only last 10 edits
        if (commonEdits.length > 10) {
          commonEdits.shift();
        }
      }

      await supabase
        .from("user_editing_patterns")
        .update({
          common_edits: commonEdits,
          edit_count: existing.edit_count + 1,
          last_edit_time: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("product_id", productId);
    } else {
      // Create new pattern record
      await supabase.from("user_editing_patterns").insert({
        user_id: userId,
        product_id: productId,
        common_edits: [editPrompt],
        edit_count: 1,
        last_edit_time: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error tracking edit pattern:", error);
  }
}

/**
 * Get personalized suggestions based on user history
 */
export async function getPersonalizedSuggestions(
  userId: string,
  productId: string,
  currentContext: string
): Promise<string[]> {
  try {
    const supabase = await createClient();

    // Get user's editing patterns
    const { data: patterns } = await supabase
      .from("user_editing_patterns")
      .select("common_edits, preferred_style")
      .eq("user_id", userId)
      .order("last_edit_time", { ascending: false })
      .limit(5);

    if (!patterns || patterns.length === 0) {
      // Return generic suggestions for new users
      return getGenericSuggestions(currentContext);
    }

    // Analyze patterns to generate relevant suggestions
    const allEdits = patterns.flatMap((p) => p.common_edits || []);
    const uniqueEdits = [...new Set(allEdits)];

    // Generate suggestions based on history
    const suggestions: string[] = [];

    // Color-related suggestions
    if (uniqueEdits.some((edit) => edit.toLowerCase().includes("color"))) {
      suggestions.push("Try adjusting the color temperature for a warmer look");
      suggestions.push("Consider a monochrome variation");
    }

    // Background-related suggestions
    if (uniqueEdits.some((edit) => edit.toLowerCase().includes("background"))) {
      suggestions.push("Experiment with gradient backgrounds");
      suggestions.push("Try a minimalist white background");
    }

    // Style-related suggestions
    if (
      uniqueEdits.some(
        (edit) =>
          edit.toLowerCase().includes("modern") ||
          edit.toLowerCase().includes("style")
      )
    ) {
      suggestions.push("Apply a vintage filter for contrast");
      suggestions.push("Try a futuristic aesthetic");
    }

    // Detail-related suggestions
    if (
      uniqueEdits.some(
        (edit) =>
          edit.toLowerCase().includes("detail") ||
          edit.toLowerCase().includes("texture")
      )
    ) {
      suggestions.push("Enhance surface textures");
      suggestions.push("Add subtle shadows for depth");
    }

    return suggestions.slice(0, 3);
  } catch (error) {
    console.error("Error getting personalized suggestions:", error);
    return getGenericSuggestions(currentContext);
  }
}

function getGenericSuggestions(context: string): string[] {
  const suggestions = [
    "Change the background to pure white",
    "Add a subtle drop shadow",
    "Adjust the lighting for better contrast",
    "Make the colors more vibrant",
    "Apply a professional studio look",
    "Remove any distracting elements",
    "Enhance the product details",
    "Create a lifestyle setting",
    "Add a reflection effect",
    "Make it more minimalist",
  ];

  // Return 3 random suggestions
  return suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
}

/**
 * Generate a personalized greeting based on user history
 */
export async function generatePersonalizedGreeting(
  userId: string,
  productName?: string
): Promise<string> {
  try {
    const supabase = await createClient();

    // Get user's recent activity
    const { data: recentEdits } = await supabase
      .from("user_editing_patterns")
      .select("edit_count, last_edit_time")
      .eq("user_id", userId)
      .order("last_edit_time", { ascending: false })
      .limit(1)
      .single();

    if (recentEdits && recentEdits.edit_count > 5) {
      // Returning user with history
      const greetings = [
        `Welcome back! Ready to enhance ${productName || "your product"} further?`,
        `Great to see you again! Let's continue perfecting ${productName || "your images"}.`,
        `Back for more creative edits? ${productName || "Your product"} is looking good!`,
        `Hello again! What shall we improve about ${productName || "your product"} today?`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      // New or infrequent user
      const greetings = [
        `Welcome! I'm here to help transform ${productName || "your product images"}.`,
        `Hello! Let's make ${productName || "your product"} look amazing.`,
        `Ready to enhance ${productName || "your product"}? Just describe what you'd like!`,
        `Hi there! Tell me how you'd like to improve ${productName || "your product images"}.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
  } catch (error) {
    console.error("Error generating personalized greeting:", error);
    return `Welcome! Ready to enhance ${productName || "your product images"}?`;
  }
}

/**
 * Analyze editing style from prompts
 */
export async function analyzeEditingStyle(
  prompts: string[]
): Promise<"minimalist" | "detailed" | "creative" | "technical"> {
  const styleIndicators = {
    minimalist: ["simple", "clean", "minimal", "white", "basic", "remove"],
    detailed: [
      "detail",
      "texture",
      "intricate",
      "precise",
      "exact",
      "specific",
    ],
    creative: [
      "artistic",
      "creative",
      "unique",
      "vibrant",
      "colorful",
      "dramatic",
    ],
    technical: ["adjust", "correct", "fix", "improve", "enhance", "optimize"],
  };

  const scores: Record<string, number> = {
    minimalist: 0,
    detailed: 0,
    creative: 0,
    technical: 0,
  };

  for (const prompt of prompts) {
    const lowerPrompt = prompt.toLowerCase();
    for (const [style, keywords] of Object.entries(styleIndicators)) {
      for (const keyword of keywords) {
        if (lowerPrompt.includes(keyword)) {
          scores[style]++;
        }
      }
    }
  }

  // Return the style with highest score
  const topStyle = Object.entries(scores).reduce((a, b) =>
    scores[a[0]] > scores[b[0]] ? a : b
  )[0];

  return topStyle as "minimalist" | "detailed" | "creative" | "technical";
}

/**
 * Get contextual tips based on editing session
 */
export async function getContextualTip(
  userId: string,
  productId: string,
  sessionEdits: string[]
): Promise<string> {
  try {
    // Analyze what the user has been doing
    const style = analyzeEditingStyle(sessionEdits);

    // Generate a tip based on their style and history
    const tip = await generateTipMessage(sessionEdits);

    // Track this for future personalization
    await trackUserEditPattern(
      userId,
      productId,
      sessionEdits[sessionEdits.length - 1]
    );

    return tip;
  } catch (error) {
    console.error("Error getting contextual tip:", error);
    return "💡 Tip: Try experimenting with different angles and lighting!";
  }
}
