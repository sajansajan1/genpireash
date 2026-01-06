import { NextRequest, NextResponse } from "next/server";
import { generateFrontViewOnly } from "@/app/actions/progressive-generation-workflow";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.input || !body.input.type || !body.input.content) {
      return NextResponse.json(
        { error: "Invalid input parameters" },
        { status: 400 }
      );
    }

    // Validate productId is provided
    if (!body.projectId) {
      return NextResponse.json(
        { error: "projectId is required - product must exist before generation" },
        { status: 400 }
      );
    }

    // Call Progressive workflow (ONLY workflow now)
    // Note: Progressive workflow automatically fetches logo from product metadata
    const result = await generateFrontViewOnly({
      productId: body.projectId,  // REQUIRED
      userPrompt: body.input.type === "text"
        ? body.input.content
        : "Product from reference image",
      previousFrontViewUrl: body.input.type === "image"
        ? body.input.content
        : undefined,
      isEdit: !!body.options?.modifications,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate front view" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate front view API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
