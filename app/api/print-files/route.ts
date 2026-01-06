// import JSZip from "jszip";
// import { NextRequest, NextResponse } from "next/server";
// import sharp from "sharp";
// import { PDFDocument } from "pdf-lib";
// import axios from "axios";
// import FormData from "form-data";

// const CLOUDCONVERT_API_KEY =
//   "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjY5YzdlZTcxNzQ0NTcyYWQxNjYwZmM2ZjIxZTZhODgzMjg2NDE1MTE1NzRiMDlmOGZkMDM3OWJjMjYzNTQ5OTlmMTdjYmUyNmE5YzQzZTUiLCJpYXQiOjE3NjI4NTc5MTAuNjk0OTA1LCJuYmYiOjE3NjI4NTc5MTAuNjk0OTA3LCJleHAiOjQ5MTg1MzE1MTAuNjg3OTQ2LCJzdWIiOiI3MzQzOTE0NiIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.eehwFM4oPW0ZUdl0na_8s8NFf5L1gzK5fPSqrT1btMm-EfBoYd5BfG9ftXhr5zbY-wuOzqcGkTdoycBem7uoj0SuXQTeMzwtcEUmjKUkNPgjLQHwL63Ovv0KRnhO4ef0OTL0qac8GENcQYBrzD0T1wqUmzTXFWRR8H4145mHX_5qJltC2kunIbS78vbNZ7OHvxrQIqQ3ETRGDg2KgQuHNHWtk_zD__6iTpalargoDOxgASpicI1L-J10kR88xUH0N5jO6Q2ZnDeNWqCsX8-CQ9wLohs0Rh7Uw4bVGCTGHqRFn5R4zuyuaH9OIqeN1ObUlL-lCwu9iFYo1IKQdAsuI51zr3zoGgZOKSpu_a73jgn_qAWH30rGDPiN8OJoOVbolQQd27uFx2XzyTK3bkE9XqvUe2RjC8pAJ7PwipJcoArVxenVZE9tqho2SvtwCMc-SMUUIZdy6Rd80hIq96GY7F59TqNcuZrJklAb_Y0KWbWJF7wucT4sjWkxMvGB776d1l81LNBwLdNLnZUDNwTu1BAZz4LrnQ2xZ_y_friQN5yA5VKPbpJbdSuBWgW7VVEj85lmCGr5Vvl8XABQtYpLKvhMr6BX75Wd37O4_C7ay0dXiJKyYSgkoKNHrT_3PNBXjEuUALL0iJDMdGDR9XsXH0VvEGiXqnuLCdtNWIKbJPQ";

// export async function POST(req: NextRequest) {
//   try {
//     const { techPack } = await req.json();
//     const zip = new JSZip();

//     // Get first image only (front)
//     const imageUrls = Object.values(techPack.image_data || {})
//       .filter((img: any) => img?.url)
//       .map((img: any) => img.url);

//     if (imageUrls.length === 0) {
//       return NextResponse.json({ error: "No images found in techPack" }, { status: 400 });
//     }

//     const frontImageUrl = imageUrls[0];
//     const res = await fetch(frontImageUrl);
//     const buf = Buffer.from(await res.arrayBuffer());

//     // ✅ TIFF 300 DPI
//     const tiffBuf = await sharp(buf)
//       .withMetadata({ density: 300 })
//       .tiff({ compression: "lzw", quality: 100 })
//       .toBuffer();
//     zip.file(`front_image.tiff`, tiffBuf);

//     // ✅ EPS via CloudConvert (front image only)
//     const jobResp = await axios.post(
//       "https://api.cloudconvert.com/v2/jobs",
//       {
//         tasks: {
//           upload: { operation: "import/upload" },
//           convert: {
//             operation: "convert",
//             input: ["upload"],
//             output_format: "eps",
//           },
//           export: { operation: "export/url", input: ["convert"], inline: false },
//         },
//       },
//       { headers: { Authorization: `Bearer ${CLOUDCONVERT_API_KEY}`, "Content-Type": "application/json" } }
//     );

//     const jobData = jobResp.data.data;
//     const uploadTask = jobData.tasks.find((t: any) => t.name === "upload");
//     const { url, parameters } = uploadTask.result.form;

//     const formData = new FormData();
//     for (const [key, value] of Object.entries(parameters)) formData.append(key, value as string);
//     formData.append("file", buf, "front_image.png");

//     await axios.post(url, formData, { headers: (formData as any).getHeaders(), maxBodyLength: Infinity });

//     // Wait for job completion
//     let jobResult: any;
//     for (let tries = 0; tries < 15; tries++) {
//       const check = await axios.get(`https://api.cloudconvert.com/v2/jobs/${jobData.id}`, {
//         headers: { Authorization: `Bearer ${CLOUDCONVERT_API_KEY}` },
//       });
//       const status = check.data.data;
//       if (status.status === "finished") {
//         jobResult = status;
//         break;
//       }
//       await new Promise((r) => setTimeout(r, 3000));
//     }

//     if (jobResult) {
//       const exportTask = jobResult.tasks.find((t: any) => t.name === "export");
//       const fileUrl = exportTask.result.files[0].url;
//       const fileRes = await fetch(fileUrl);
//       const epsBuf = Buffer.from(await fileRes.arrayBuffer());
//       zip.file(`front_image.eps`, epsBuf);
//     }

//     // ✅ PDF with front image
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage();
//     page.drawText(`Tech Pack: ${techPack.tech_pack.productName}`, { x: 50, y: 700, size: 24 });

//     const pngImage = await pdfDoc.embedPng(buf);
//     const { width, height } = pngImage.scale(0.5);
//     page.drawImage(pngImage, { x: 50, y: 400, width, height });

//     const pdfBytes = await pdfDoc.save();
//     zip.file(`${techPack.tech_pack.productName}.pdf`, pdfBytes);

//     // ✅ Generate ZIP
//     const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });

//     return new NextResponse(zipBuffer, {
//       headers: {
//         "Content-Type": "application/zip",
//         "Content-Disposition": `attachment; filename="${techPack.tech_pack.productName
//           .replace(/\s+/g, "_")
//           .trim()}_print_files.zip"`,
//       },
//     });
//   } catch (err: any) {
//     console.error("Error generating print files:", err);
//     return NextResponse.json({ error: err.message || "Print file generation failed." }, { status: 500 });
//   }
// }
import { AIPrintFileGenerator } from "@/app/actions/print-files";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { techPack } = await req.json();
    const generator = new AIPrintFileGenerator();

    const zipBuffer: Buffer = await generator.generatePrintArtworkZip(techPack);
    console.log("zipBuffer ==> ", zipBuffer);

    const arrayBuffer =
      zipBuffer instanceof Uint8Array
        ? zipBuffer.buffer.slice(zipBuffer.byteOffset, zipBuffer.byteOffset + zipBuffer.byteLength)
        : new ArrayBuffer(0);

    return new NextResponse(arrayBuffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="print_files.zip"',
      },
    });
  } catch (err: any) {
    console.error("Error generating print files:", err);
    return NextResponse.json({ error: err.message ?? "Internal Server Error" }, { status: 500 });
  }
}
