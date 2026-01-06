import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
export interface PDFExtractResult {
  text: string;
  pages: number;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<PDFExtractResult>> {
  try {
    const formData = await request.formData();
    console.log("formData ==> ", formData);
    const pdfFile = formData.get("file") as File | null;
    console.log("pdfFile ==> ", pdfFile);

    if (!pdfFile) {
      console.log("pdfFile ==> ", pdfFile);
      return NextResponse.json(
        {
          text: "",
          pages: 0,
          success: false,
          error: "No PDF file provided",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    return NextResponse.json({
      text: result.text,
      pages: result.total,
      success: true,
    });
  } catch (error: unknown) {
    console.error("PDF extraction error:", error);

    let errorMessage = "Failed to extract text from PDF";

    if (error instanceof Error) {
      if (error.message.includes("PasswordException")) {
        errorMessage = "PDF is password protected";
      } else if (error.message.includes("InvalidPDF")) {
        errorMessage = "Invalid PDF file";
      }
    }

    return NextResponse.json(
      {
        text: "",
        pages: 0,
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
