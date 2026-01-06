import OpenAI from "openai";
import { Buffer } from "buffer";
import JSZip from "jszip";
import sharp from "sharp";
import axios from "axios";
import FormData from "form-data";
import { PDFDocument } from "pdf-lib";
import { GoogleGenAI } from "@google/genai";

export class AIPrintFileGenerator {
  private openai: OpenAI;
  private gemini: GoogleGenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    });
    const geminiKey = process.env.GEMINI_API_KEY;
    this.gemini = new GoogleGenAI({ apiKey: geminiKey });
  }

  // Step 1: Extract Print Prompt from Product Image
  async extractFabricPrintPrompt(imageUrl: string): Promise<string> {
    const imageBuffer = await fetch(imageUrl).then((r) => r.arrayBuffer());
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that describes repeating textile prints for close-up, seamless, square artwork files. Your description should instruct downstream image generators to create a zoomed-in, detailed print tile. Ignore any garment shapes, shadows, or context. provide the zoom image of reference image",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and describe the repeating fabric print pattern as if looking at a zoomed-in, close-up detail for a seamless square print artwork file. The output prompt is ONLY for a high-resolution, flat, photorealistic, close-up fabric tile like a factory print file, NOT the garment or distant view.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    console.log("content ==> ", content);
    if (!content) {
      throw new Error("No content returned from OpenAI vision analysis.");
    }

    return content;
  }

  async generateFabricPrintImage(prompt: string, frontImageUrl: string): Promise<Buffer> {
    const imageResponse = await fetch(frontImageUrl);
    if (!imageResponse.ok) throw new Error("Failed to fetch image.");
    const imageArrayBuffer = await imageResponse.arrayBuffer();

    const base64Image = Buffer.from(imageArrayBuffer).toString("base64");

    // Prepare contents array for Gemini
    const contents = [
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image,
        },
      },
      {
        text: `Using this image ONLY as the fabric reference, generate a seamless, square textile print tile.
               Use this description as the main guide:${prompt}
               Hard requirements:
              - Recreate the SAME repeating pattern as the reference.
              - Match motif shapes, density, and color palette as closely as possible.
              - 1024x1024 square output.
              - Seamless, tileable pattern with no visible edges or borders.
              - Flat, photorealistic textile surface.
              - No garment, no body, no room, no props, no labels, no extra graphics.
              - The frame must be completely filled edge-to-edge with the fabric print.
        `.trim(),
      },
    ];

    const maxRetries = 3;
    let attempt = 1;

    while (attempt <= maxRetries) {
      try {
        console.log(`🔄 Generating fabric pattern with prompt - Attempt ${attempt}/${maxRetries}`);

        // Call Gemini generateContent API
        const response = await this.gemini.models.generateContent({
          model: "gemini-2.5-flash-image-preview",
          contents: contents,
        });

        const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(
          (part: any) => part.inlineData?.data
        );

        if (!imagePartFromResponse || !imagePartFromResponse.inlineData?.data) {
          throw new Error("No image data returned from Gemini Nano Banana.");
        }

        console.log(`Fabric pattern generated successfully on attempt ${attempt}`);
        // Extract Base64 image
        const base64ImageReturn = imagePartFromResponse.inlineData.data;
        return Buffer.from(base64ImageReturn, "base64");
      } catch (err: any) {
        console.error(`Gemini attempt ${attempt} failed:`, err.message);

        if (attempt === maxRetries) {
          console.error(`All ${maxRetries} Gemini attempts failed. No fallback available.`);
          throw new Error(`Fabric pattern generation failed after ${maxRetries} attempts: ${err.message}`);
        }

        attempt++;
        // Progressive delay between retries (1s, 2s, 3s)
        if (attempt <= maxRetries) {
          console.log(`Waiting ${attempt}s before retry...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new Error("Unexpected error: max retries exceeded without throwing");
  }

  // Step 3a: Generate TIFF 300 DPI
  async convertToTIFF(baseImageBuffer: Buffer): Promise<Buffer> {
    return await sharp(baseImageBuffer)
      .resize(2048, 2048) // ensure square
      .withMetadata({ density: 300 })
      .tiff({ compression: "lzw", quality: 100 })
      .toBuffer();
  }

  // Step 3b: Convert fabric image to EPS using CloudConvert
  async convertToEPS(imageBuffer: Buffer): Promise<Buffer> {
    // 1. Create job
    const jobResp = await axios.post(
      "https://api.cloudconvert.com/v2/jobs",
      {
        tasks: {
          upload: { operation: "import/upload" },
          convert: {
            operation: "convert",
            input: ["upload"],
            output_format: "eps",
          },
          export: { operation: "export/url", input: ["convert"], inline: false },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDCONVERT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const jobData = jobResp.data.data;
    const uploadTask = jobData.tasks.find((t: any) => t.name === "upload");
    const { url, parameters } = uploadTask.result.form;

    // 2. Upload image
    const formData = new FormData();
    Object.entries(parameters).forEach(([key, value]) => formData.append(key, value as string));
    formData.append("file", imageBuffer, "fabric_print.png");
    await axios.post(url, formData, { headers: (formData as any).getHeaders(), maxBodyLength: Infinity });

    // 3. Wait for job
    let jobResult: any;
    for (let tries = 0; tries < 15; tries++) {
      const check = await axios.get(`https://api.cloudconvert.com/v2/jobs/${jobData.id}`, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDCONVERT_API_KEY}` },
      });
      if (check.data.data.status === "finished") {
        jobResult = check.data.data;
        break;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    if (!jobResult) throw new Error("EPS conversion failed");

    // 4. Download EPS file
    const exportTask = jobResult.tasks.find((t: any) => t.name === "export");
    const fileUrl = exportTask.result.files[0].url;
    const fileRes = await fetch(fileUrl);
    return Buffer.from(await fileRes.arrayBuffer());
  }

  // Step 4: PDF preview for factory/client
  async createPDFPreview(imageBuffer: Buffer, title: string): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 700]);
    page.drawText(title, { x: 50, y: 650, size: 18 });
    const pngImage = await pdfDoc.embedPng(imageBuffer);
    page.drawImage(pngImage, { x: 50, y: 200, width: 400, height: 400 });
    return await pdfDoc.save();
  }

  // Main Entrypoint: Generate ZIP from techpack
  async generatePrintArtworkZip(techPack: any): Promise<Buffer> {
    const frontImageUrl = techPack.image_data.front.url;
    if (!frontImageUrl) throw new Error("No front image found in techPack");

    const productName = techPack.tech_pack.productName || "Product";

    // 1. Extract prompt
    const prompt = await this.extractFabricPrintPrompt(frontImageUrl);

    // 2. Generate print file
    const printImageBuffer = await this.generateFabricPrintImage(prompt, frontImageUrl);

    // 3. Convert to TIFF & EPS with safety checks
    let tiffBuf: Buffer | null = null;
    let epsBuf: Buffer | null = null;

    try {
      tiffBuf = await this.convertToTIFF(printImageBuffer);
    } catch (err) {
      console.warn("TIFF conversion failed, skipping TIFF file:", err);
    }

    try {
      epsBuf = await this.convertToEPS(printImageBuffer);
    } catch (err) {
      console.warn("EPS conversion failed, skipping EPS file:", err);
    }

    // 4. Create PDF Preview
    let pdfBytes: Buffer | null = null;

    try {
      const pdfArray: Uint8Array = await this.createPDFPreview(printImageBuffer, productName);
      pdfBytes = Buffer.from(pdfArray); // Convert Uint8Array to Buffer
    } catch (err) {
      console.warn("PDF preview creation failed, skipping PDF:", err);
    }

    // 5. ZIP package
    const zip = new JSZip();

    if (tiffBuf) zip.file("fabric_print.tiff", tiffBuf);
    if (epsBuf) zip.file("fabric_print.eps", epsBuf);
    if (pdfBytes) zip.file("fabric_print_preview.pdf", pdfBytes);

    return await zip.generateAsync({ type: "nodebuffer" });
  }
}
