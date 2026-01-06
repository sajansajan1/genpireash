// app/api/brand-dna/update-dna/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBrandDnaContextService, type BrandDNA } from "@/lib/services/brand-dna-context-service";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Update DNA request body:", body);

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Get the DNA ID from the request if provided
    const dnaId = body.id;

    // Check if Brand DNA exists
    let existingDna;
    let fetchError;

    if (dnaId) {
      // Update specific DNA by ID
      const result = await supabase
        .from("brand_dna")
        .select("*")
        .eq("id", dnaId)
        .eq("user_id", user.id) // Ensure it belongs to the authenticated user
        .maybeSingle();
      existingDna = result.data;
      fetchError = result.error;
    } else {
      // Fallback to updating by user_id (for backward compatibility)
      const result = await supabase
        .from("brand_dna")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      existingDna = result.data;
      fetchError = result.error;
    }

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch existing Brand DNA" }, { status: 500 });
    }

    if (!existingDna) {
      console.log("No existing DNA found");
      return NextResponse.json({ error: "No Brand DNA found to update. Please create one first." }, { status: 404 });
    }

    console.log("Existing DNA found:", existingDna.id);

    // Build update object with only provided fields (partial update)
    const updateFields: any = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are actually provided in the request
    const allowedFields = [
      "website_url",
      "insta_url",
      "tiktok_url",
      "pinterest_url",
      "brand_name",
      "category",
      "tagline",
      "colors",
      "style_keyword",
      "materials",
      "mood_board",
      "tone_values",
      "restrictions",
      "patterns",
      "audience",
      "summary",
      "logo_url",
      "status",
      "brand_assets",
      "brand_title",
      "brand_subtitle",
      "company_techpack",
      "context_prompt",
    ];

    allowedFields.forEach((field) => {
      if (field in body) {
        let value = body[field];

        // Special handling for status field - convert to boolean
        if (field === "status") {
          if (value === "" || value === null || value === undefined) {
            value = false; // Default to false for empty status
          } else if (typeof value === "string") {
            value = value.toLowerCase() === "true";
          } else {
            value = Boolean(value);
          }
        }

        updateFields[field] = value;
      }
    });

    // Regenerate context_prompt if brand fields are updated and context_prompt wasn't explicitly provided
    const brandFields = [
      "brand_name",
      "brand_title",
      "brand_subtitle",
      "category",
      "tagline",
      "summary",
      "style_keyword",
      "colors",
      "materials",
      "patterns",
      "tone_values",
      "audience",
      "restrictions",
    ];

    const hasBrandFieldUpdate = brandFields.some((field) => field in updateFields);
    const contextPromptExplicitlyProvided = "context_prompt" in body && body.context_prompt;

    if (hasBrandFieldUpdate && !contextPromptExplicitlyProvided) {
      // Merge existing DNA with updates to generate new context prompt
      const mergedDna: Partial<BrandDNA> = {
        ...existingDna,
        ...updateFields,
      };

      const contextService = getBrandDnaContextService();
      updateFields.context_prompt = contextService.generateContextPrompt(mergedDna as BrandDNA);
    }

    console.log("Final update fields:", updateFields);

    // Update by DNA ID (prioritize) or user_id (fallback)
    const { data, error } = await supabase
      .from("brand_dna")
      .update(updateFields)
      .eq("id", existingDna.id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "Failed to update Brand DNA", details: error.message }, { status: 500 });
    }

    console.log("Update successful:", data);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Keep POST for backward compatibility
export async function POST(req: NextRequest) {
  return PUT(req);
}
