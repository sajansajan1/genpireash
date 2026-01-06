import { NextRequest, NextResponse } from "next/server";
import { generateRemainingViews } from "@/app/actions/progressive-generation-workflow";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.approvalId || !body.frontViewUrl) {
      return NextResponse.json(
        { error: "approvalId and frontViewUrl are required" },
        { status: 400 }
      );
    }

    // Call Progressive workflow remaining views function
    const result = await generateRemainingViews({
      approvalId: body.approvalId,
      frontViewUrl: body.frontViewUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate additional views" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate additional views API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
