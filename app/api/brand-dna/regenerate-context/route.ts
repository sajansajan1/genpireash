// app/api/brand-dna/regenerate-context/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getBrandDnaContextService,
  generateAIBrandContextPrompt,
  type BrandDNA,
} from "@/lib/services/brand-dna-context-service";

/**
 * POST /api/brand-dna/regenerate-context
 * Regenerates the context_prompt for a Brand DNA
 *
 * Body:
 * - id: string (required) - Brand DNA ID
 * - useAI: boolean (optional) - Use AI to enhance the context prompt
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id: dnaId, useAI = false } = body;

    if (!dnaId) {
      return NextResponse.json(
        { error: "Brand DNA ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Fetch the Brand DNA
    const { data: brandDna, error: fetchError } = await supabase
      .from("brand_dna")
      .select("*")
      .eq("id", dnaId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !brandDna) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Brand DNA not found" },
        { status: 404 }
      );
    }

    // Generate the context prompt
    let contextPrompt: string;

    if (useAI) {
      // Use AI-enhanced generation (more natural, comprehensive)
      contextPrompt = await generateAIBrandContextPrompt(brandDna as BrandDNA);
    } else {
      // Use standard template-based generation
      const contextService = getBrandDnaContextService();
      contextPrompt = contextService.generateContextPrompt(brandDna as BrandDNA);
    }

    // Update the Brand DNA with the new context prompt
    const { data: updatedDna, error: updateError } = await supabase
      .from("brand_dna")
      .update({
        context_prompt: contextPrompt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dnaId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update context prompt" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDna,
      context_prompt: contextPrompt,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
