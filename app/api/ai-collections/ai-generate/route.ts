import { AICollectionGenerator, CollectionInput } from "@/app/actions/ai-collections";
import { enhancePromptAction } from "@/app/actions/extract-ai-prompt";
import { DeductCredits } from "@/lib/supabase/payments";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { injectBrandContext, type BrandDNA } from "@/lib/services/brand-dna-context-service";

// Extended CollectionInput to include Brand DNA toggle
interface CollectionInputWithBrandDna extends CollectionInput {
  applyBrandDna?: boolean;
  brandDnaId?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }

  try {
    const body: CollectionInputWithBrandDna = await request.json();
    const { name, description, size, type, logo, images, creatorId, collection_description, applyBrandDna, brandDnaId } = body;

    if (!creatorId) {
      return NextResponse.json({ error: "Creator not available" }, { status: 401 });
    }

    // Optional: validate credits if passed from client
    if (body.credits && body.credits.required > (body.credits.current ?? 0)) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 403 });
    }

    // Fetch active Brand DNA if toggle is on
    let brandDna: BrandDNA | null = null;
    if (applyBrandDna) {
      if (brandDnaId) {
        // Fetch specific Brand DNA by ID
        const { data: dna } = await supabase
          .from("brand_dna")
          .select("*")
          .eq("id", brandDnaId)
          .eq("user_id", user.id)
          .single();
        brandDna = dna;
      } else {
        // Fetch the active Brand DNA for the user
        const { data: dna } = await supabase
          .from("brand_dna")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", true)
          .single();
        brandDna = dna;
      }
    }

    // Inject Brand DNA context into the description if available
    const { combinedPrompt: contextualDescription, hasContext } = injectBrandContext(
      description,
      brandDna,
      {
        detailed: true,
        includeSections: ["identity", "style", "colors", "materials", "audience"],
        prefix: "Design products that align with this brand identity:",
      }
    );

const fallbackPrompt = "analyze this images generate a collection of image";
    const finalDescription =
      contextualDescription && contextualDescription.trim().length > 0 ? contextualDescription : fallbackPrompt;
    const enhancedPrompt = await enhancePromptAction(finalDescription);
    const isImageBased = images && images.length > 0;

    const generator = new AICollectionGenerator();
    const products = isImageBased
      ? await generator.generateCollectionFromImages(images!, name, contextualDescription, logo)
      : await generator.generateCompleteCollection(name, contextualDescription, type, size, logo);

    const deduct = await DeductCredits({ credit: size });
    if (!deduct?.success) {
      return NextResponse.json({ error: "Credit deduction failed" }, { status: 400 });
    }

    const { data: insertedCollection, error: insertError } = await supabase
      .from("collections")
      .insert({
        user_id: user.id,
        creator_id: creatorId,
        collection_name: name,
        tech_packs: products,
        collection_description,
        prompt: description,
        ai_description: enhancedPrompt,
        brand_dna_applied: hasContext,
        brand_dna_id: brandDna?.id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
    }

    return NextResponse.json(insertedCollection, { status: 201 });
  } catch (error) {
    console.error("Collection generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate collection", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
