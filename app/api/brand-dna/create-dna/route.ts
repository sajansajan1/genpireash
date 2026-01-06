// app/api/brand-dna/create-dna/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBrandDnaContextService, type BrandDNA } from "@/lib/services/brand-dna-context-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      creator_id,
      website_url,
      insta_url,
      tiktok_url,
      pinterest_url,
      brand_name,
      category,
      tagline,
      colors,
      style_keyword,
      materials,
      mood_board,
      tone_values,
      restrictions,
      patterns,
      audience,
      summary,
      logo_url,
      brand_assets,
      brand_title,
      brand_subtitle,
      company_techpack,
      context_prompt: providedContextPrompt,
      status, // New parameter: if true, deactivate existing DNAs and make this one active
    } = body;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Build Brand DNA object for context prompt generation
    const brandDnaData: Partial<BrandDNA> = {
      brand_name,
      brand_title,
      brand_subtitle,
      category,
      tagline,
      summary,
      style_keyword,
      colors,
      materials,
      patterns,
      tone_values,
      audience,
      restrictions,
      mood_board,
      logo_url,
      brand_assets,
      company_techpack,
    };

    // Auto-generate context_prompt if not provided
    let context_prompt = providedContextPrompt;
    if (!context_prompt) {
      const contextService = getBrandDnaContextService();
      context_prompt = contextService.generateContextPrompt(brandDnaData as BrandDNA);
    }

    // If make_active is true, deactivate all existing DNAs for this user
    if (status) {
      const { error: deactivateError } = await supabase
        .from("brand_dna")
        .update({
          status: false,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("status", true); // Only update currently active DNAs

      if (deactivateError) {
        console.error("Error deactivating existing DNAs:", deactivateError);
        // Continue anyway - not a critical failure
      }
    }

    // Use the authenticated user's ID (not from request body)
    const { data, error } = await supabase
      .from("brand_dna")
      .insert({
        user_id: user.id,
        creator_id,
        website_url,
        insta_url,
        tiktok_url,
        pinterest_url,
        brand_name,
        category,
        tagline,
        colors,
        style_keyword,
        materials,
        mood_board,
        tone_values,
        restrictions,
        patterns,
        audience,
        summary,
        logo_url,
        brand_assets,
        brand_title,
        brand_subtitle,
        status: status ? true : false,
        company_techpack,
        context_prompt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "Failed to create Brand DNA" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
