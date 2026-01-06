import { NextRequest, NextResponse } from "next/server";
import {
    extractDataFromPDF,
    categorizeProductImages,
    type PDFExtractedData,
} from "@/lib/services/pdf-extraction-service";
import { convertPdfToImages } from "@/lib/services/pdf-to-image";
// import { convertPDFToImages } from "@/lib/services/pdf-to-image";

/**
 * PDF Scanner API Endpoint
 *
 * Extracts structured product data from uploaded PDF spec sheets using AI.
 * Returns: product name, materials, colors, sizing, dimensions, and design images.
 */

export interface PDFScanResponse {
    success: boolean;
    data?: PDFExtractedData;
    error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<PDFScanResponse>> {
    try {
        console.log("[PDF Scanner API] Request received");
        let buffer: Buffer;
        let filename: string = "document.pdf";
        let uploadedImages: File[] = [];

        // Check content type to determine how to parse
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            // Handle URL-based processing (for large files)
            const body = await request.json();
            const { fileUrl } = body;

            if (!fileUrl) {
                return NextResponse.json(
                    { success: false, error: "No file URL provided" },
                    { status: 400 }
                );
            }

            console.log(`[PDF Scanner API] Downloading file from URL: ${fileUrl}`);

            // Download the file
            const fileResponse = await fetch(fileUrl);
            if (!fileResponse.ok) {
                return NextResponse.json(
                    { success: false, error: "Failed to download file from provided URL" },
                    { status: 400 }
                );
            }

            const arrayBuffer = await fileResponse.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);

            // Try to extract filename from URL or header
            const urlParts = fileUrl.split('/');
            filename = urlParts[urlParts.length - 1] || "downloaded.pdf";
            console.log(`[PDF Scanner API] File downloaded (${buffer.length} bytes)`);

        } else if (contentType.includes("multipart/form-data")) {
            // Handle direct file upload (legacy/small files)
            const formData = await request.formData();
            uploadedImages = formData.getAll("images") as File[];
            const pdfFile = formData.get("file") as File | null;

            if (!pdfFile) {
                return NextResponse.json(
                    { success: false, error: "No PDF file provided" },
                    { status: 400 }
                );
            }

            // Validate file type
            if (!pdfFile.type.includes("pdf") && !pdfFile.name.toLowerCase().endsWith(".pdf")) {
                return NextResponse.json(
                    { success: false, error: "Invalid file type. Please upload a PDF file." },
                    { status: 400 }
                );
            }

            // Check file size (max 20MB) check is effectively handled by Vercel limit before this
            const maxSize = 20 * 1024 * 1024;
            if (pdfFile.size > maxSize) {
                return NextResponse.json(
                    { success: false, error: "File too large. Maximum size is 20MB." },
                    { status: 400 }
                );
            }

            console.log(`[PDF Scanner API] Processing uploaded file: ${pdfFile.name} (${pdfFile.size} bytes)`);

            // Convert file to buffer
            const arrayBuffer = await pdfFile.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            filename = pdfFile.name;
        } else {
            return NextResponse.json(
                { success: false, error: "Unsupported content type" },
                { status: 400 }
            );
        }

        // Step 1: Extract text using pdf-parse
        let pdfText = "";
        let pageCount = 1;

        try {
            // Dynamic import for pdf-parse
            const { PDFParse } = await import("pdf-parse");
            const parser = new PDFParse({ data: buffer });
            const textResult = await parser.getText();
            pdfText = textResult.text;
            pageCount = textResult.total;
            await parser.destroy();
            console.log(`[PDF Scanner API] Extracted ${pdfText.length} chars from ${pageCount} pages`);
        } catch (parseError) {
            console.error("[PDF Scanner API] PDF text extraction failed:", parseError);
            // Continue without text - vision API can still analyze images
        }

        // Step 2: Convert PDF pages to images for AI analysis
        let pdfImages: string[] = [];

        try {
            console.log("[PDF Scanner API] Converting PDF to images");

            const buffers = await convertPdfToImages(buffer);
            pdfImages = buffers.map(buf => buf.toString("base64")); // convert each Buffer to Base64 string
            pageCount = pdfImages.length;

            console.log(`[PDF Scanner API] Converted ${pdfImages.length} pages to images`);
        } catch (imgError) {
            console.error("[PDF Scanner API] PDF to image conversion failed:", imgError);
        }

        // Step 3: If we have images (from client upload or extraction), categorize them
        // Note: uploadedImages is populated in the multipart handling section if applicable
        const imageDataArray: string[] = [];

        // Uploaded images (if any)
        for (const imageFile of uploadedImages) {
            const imageBuffer = await imageFile.arrayBuffer();
            const base64 = Buffer.from(imageBuffer).toString("base64");
            const mimeType = imageFile.type || "image/png";
            imageDataArray.push(`data:${mimeType};base64,${base64}`);
        }

        // If no images uploaded, use PDF-converted images
        if (imageDataArray.length === 0 && pdfImages.length > 0) {
            imageDataArray.push(...pdfImages);
        }

        console.log(`[PDF Scanner API] Processing ${imageDataArray.length} uploaded images`);

        // Step 4: Extract structured data using AI
        const extractionResult = await extractDataFromPDF(
            imageDataArray,
            pdfText,
            pageCount
        );

        if (!extractionResult.success || !extractionResult.data) {
            return NextResponse.json(
                { success: false, error: extractionResult.error || "Extraction failed" },
                { status: 500 }
            );
        }

        // Step 5: Categorize product images if we have any
        if (imageDataArray.length > 0) {
            try {
                const categorizedImages = await categorizeProductImages(imageDataArray);
                extractionResult.data.designImages = categorizedImages;
                console.log(`[PDF Scanner API] Found ${categorizedImages.length} product images`);
            } catch (imgError) {
                console.error("[PDF Scanner API] Image categorization failed:", imgError);
                // Continue without categorized images
            }
        }

        console.log("[PDF Scanner API] Extraction complete:", {
            productName: extractionResult.data.productName,
            materialsCount: extractionResult.data.materials.length,
            colorsCount: extractionResult.data.colorPalette.length,
        });

        return NextResponse.json({
            success: true,
            data: extractionResult.data,
        });

    } catch (error) {
        console.error("[PDF Scanner API] Error:", error);

        let errorMessage = "Failed to process PDF";

        if (error instanceof Error) {
            if (error.message.includes("PasswordException") || error.message.includes("password")) {
                errorMessage = "PDF is password protected";
            } else if (error.message.includes("Invalid") || error.message.includes("corrupt")) {
                errorMessage = "Invalid or corrupted PDF file";
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// Handle GET requests with error
export async function GET() {
    return NextResponse.json(
        { success: false, error: "Method not allowed. Use POST to upload a PDF." },
        { status: 405 }
    );
}