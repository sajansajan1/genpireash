import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, unlinkSync } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, pdfBuffer, fileName } = await request.json();

    if (!phoneNumber || !pdfBuffer) {
      return NextResponse.json({ error: "Phone number and PDF buffer are required" }, { status: 400 });
    }

    // 1. Save PDF temporarily to public folder
    const tempFileName = `temp_${Date.now()}_${fileName || "document.pdf"}`;
    const tempFilePath = path.join(process.cwd(), "public", "temp", tempFileName);

    // Create temp directory if it doesn't exist
    const tempDir = path.dirname(tempFilePath);
    if (!require("fs").existsSync(tempDir)) {
      require("fs").mkdirSync(tempDir, { recursive: true });
    }

    // Write PDF buffer to file
    const pdfData = Buffer.from(pdfBuffer, "base64");
    writeFileSync(tempFilePath, pdfData);

    // 2. Create public URL
    const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/temp/${tempFileName}`;

    // 3. Send via Twilio
    const twilio = require("twilio");
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`,
      body: "Here is your PDF document",
      mediaUrl: pdfUrl,
    });

    // 4. Clean up temporary file after 5 minutes
    setTimeout(() => {
      try {
        unlinkSync(tempFilePath);
        console.log(`Temporary file deleted: ${tempFileName}`);
      } catch (error) {
        console.error("Error deleting temp file:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
    });
  } catch (error) {
    console.error("Twilio WhatsApp send error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: `Failed to send WhatsApp message: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
