import { NextRequest, NextResponse } from "next/server";
import { handleFrontViewDecision } from "@/app/actions/progressive-generation-workflow";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.approvalId || typeof body.approved !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid parameters: approvalId and approved are required" },
        { status: 400 }
      );
    }

    // Call Progressive workflow decision function
    const result = await handleFrontViewDecision({
      approvalId: body.approvalId,
      action: body.approved ? "approve" : "edit",
      editFeedback: body.feedback,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to handle approval" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Approve front view API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
