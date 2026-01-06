import { AIProductUpdater } from "@/app/actions/ai-collection-update";
import { ProductData } from "@/app/actions/ai-collections"; // And here
import { NextRequest, NextResponse } from "next/server";
// Define the expected request body for this endpoint
interface PreviewRequestBody {
  originalProduct: ProductData;
  userPrompt: string;
  logoUrl?: string;
}
export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequestBody = await request.json();
    const { originalProduct, userPrompt, logoUrl } = body;
    if (!originalProduct || !userPrompt) {
      return NextResponse.json(
        { error: "Missing required fields: 'originalProduct' and 'userPrompt' are required." },
        { status: 400 }
      );
    }
    console.log(`Starting product preview generation for: "${originalProduct.name}"`);
    const updater = new AIProductUpdater();
    const previewProducts = await updater.generateMatchingProductPreviews(originalProduct, userPrompt, logoUrl);
    console.log("Successfully generated 6 product previews.");
    return NextResponse.json(previewProducts, { status: 200 });
  } catch (error) {
    console.error("Product preview generation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to generate product previews", details: errorMessage }, { status: 500 });
  }
}
