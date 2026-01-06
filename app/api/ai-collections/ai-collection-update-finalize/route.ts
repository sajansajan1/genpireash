import { AIProductUpdater } from "@/app/actions/ai-collection-update";
import { ProductData } from "@/app/actions/ai-collections";
import { NextRequest, NextResponse } from "next/server";

interface FinalizeRequestBody {
  selectedProduct: ProductData;
  originalProduct: ProductData;
  fullCollection: ProductData[];
}

export async function POST(request: NextRequest) {
  try {
    const body: FinalizeRequestBody = await request.json();
    const { selectedProduct, originalProduct, fullCollection } = body;

    // --- Input Validation ---
    if (!selectedProduct || !originalProduct || !Array.isArray(fullCollection)) {
      return NextResponse.json(
        { error: "Missing required fields: 'selectedProduct', 'originalProduct', and 'fullCollection' are required." },
        { status: 400 }
      );
    }

    console.log(`Finalizing selection. Replacing "${originalProduct.name}" with "${selectedProduct.name}".`);

    const updater = new AIProductUpdater();
    const updatedCollection = await updater.finalizeProductSelection(selectedProduct, originalProduct, fullCollection);

    console.log("Successfully finalized product and updated collection.");

    return NextResponse.json(updatedCollection, { status: 200 });
  } catch (error) {
    console.error("Product finalization error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to finalize product selection", details: errorMessage }, { status: 500 });
  }
}
