/**
 * AI Edit Function
 * Performs AI-assisted edits on tech pack fields
 */

"use server";

import { getOpenAIClient } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { AI_MODELS_CONFIG } from "../config/models.config";

/**
 * Perform AI edit on a specific field
 * @param revisionId Revision ID from product_multiview_revisions
 * @param fieldPath Path to the field (e.g., "detected_features.neckline")
 * @param editPrompt User's edit instruction
 * @param referenceImageUrl Original image for reference
 * @param userId User ID
 * @returns New revision ID with updated analysis
 */
export async function performAIEdit(
  revisionId: string,
  fieldPath: string,
  editPrompt: string,
  referenceImageUrl: string,
  userId: string
): Promise<{ newRevisionId: string; updatedField: any }> {
  const supabase = await createClient();

  try {
    // Fetch existing analysis
    const { data: existingAnalysis, error: fetchError } = await supabase
      .from("revision_vision_analysis")
      .select("*")
      .eq("revision_id", revisionId)
      .single();

    if (fetchError || !existingAnalysis) {
      throw new Error("Analysis not found");
    }

    const openai = getOpenAIClient();

    // Construct edit prompt with context
    const systemPrompt = `You are a technical design assistant helping to refine product specifications. You will be given:
1. Current field value from a technical analysis
2. Reference image of the product
3. User's edit instruction

Your task is to generate the updated field value based on the edit instruction while maintaining professional manufacturing terminology.`;

    const currentValue = getNestedValue(existingAnalysis.analysis_data, fieldPath);

    const userPrompt = `Current ${fieldPath}: ${JSON.stringify(currentValue)}

Edit instruction: "${editPrompt}"

Reference image: ${referenceImageUrl}

Provide the updated value in JSON format:
{
  "updated_value": <new value>,
  "reasoning": "brief explanation of the change"
}`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS_CONFIG.VISION_MODEL.name,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: referenceImageUrl },
            },
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No edit response generated");
    }

    const editResult = JSON.parse(content);

    // Create updated analysis data
    const updatedAnalysisData = JSON.parse(JSON.stringify(existingAnalysis.analysis_data));
    setNestedValue(updatedAnalysisData, fieldPath, editResult.updated_value);

    // Add to edit history
    if (!updatedAnalysisData.edit_history) {
      updatedAnalysisData.edit_history = [];
    }
    updatedAnalysisData.edit_history.push({
      timestamp: new Date().toISOString(),
      field: fieldPath,
      old_value: currentValue,
      new_value: editResult.updated_value,
      edit_prompt: editPrompt,
      reasoning: editResult.reasoning,
      edited_by: userId,
    });
    updatedAnalysisData.user_modifications = true;
    updatedAnalysisData.last_edited_at = new Date().toISOString();

    // Update the analysis in database
    const { data: updatedAnalysis, error: updateError } = await supabase
      .from("revision_vision_analysis")
      .update({
        analysis_data: updatedAnalysisData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingAnalysis.id)
      .select()
      .single();

    if (updateError || !updatedAnalysis) {
      throw new Error("Failed to update analysis");
    }

    return {
      newRevisionId: revisionId, // Same revision, just updated analysis
      updatedField: editResult.updated_value,
    };
  } catch (error) {
    console.error("AI edit failed:", error);
    throw error;
  }
}

// Helper functions
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}
