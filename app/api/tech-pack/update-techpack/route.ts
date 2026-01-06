import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { classifyProductWithAI } from "@/lib/services/ai-category-classifier";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const body = await req.json();
    const { project_id, updatedTechpack } = body;

    if (!project_id || !updatedTechpack) {
      return NextResponse.json({ error: "Missing project_id or updatedTechpack" }, { status: 400 });
    }

    // Use AI to classify the product category and subcategory
    let extractedCategory = null;
    let extractedSubcategory = null;

    // Get text to classify from tech pack data
    const textToClassify = updatedTechpack?.productName || updatedTechpack?.category_Subcategory || updatedTechpack?.category || '';

    console.log('🏷️ API update-techpack - Category extraction:', {
      projectId: project_id,
      textToClassify: textToClassify?.substring(0, 100),
    });

    if (textToClassify) {
      try {
        const classification = await classifyProductWithAI(textToClassify);
        extractedCategory = classification.category;
        extractedSubcategory = classification.subcategory;
        console.log('🤖 API update-techpack - AI Category Classification:', {
          input: textToClassify,
          category: extractedCategory,
          subcategory: extractedSubcategory,
          confidence: classification.confidence,
        });
      } catch (error) {
        console.error("Error classifying product with AI:", error);
        extractedCategory = 'other';
        extractedSubcategory = 'general';
      }
    }

    const { data, error } = await supabase
      .from("product_ideas")
      .update({
        tech_pack: updatedTechpack,
        category: extractedCategory,
        category_subcategory: extractedSubcategory,
      })
      .eq("id", project_id)
      .eq("user_id", user.id)
      .select();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json({ error: "Failed to update tech pack" }, { status: 500 });
    }

    console.log('🏷️ API update-techpack - Updated successfully:', {
      category: extractedCategory,
      category_subcategory: extractedSubcategory,
    });

    return NextResponse.json(data?.[0] || null);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
