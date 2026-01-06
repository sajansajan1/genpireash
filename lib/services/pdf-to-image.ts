import axios from "axios";
import FormData from "form-data";


export async function convertPdfToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
    // 1️⃣ Create a CloudConvert job
    const jobResp = await axios.post(
        "https://api.cloudconvert.com/v2/jobs",
        {
            tasks: {
                upload: { operation: "import/upload" },
                convert: {
                    operation: "convert",
                    input: ["upload"],
                    input_format: "pdf",
                    output_format: "png", // change to "jpg" if needed
                    pages: "1-15", // convert all pages
                    filename: "page-{page}.png",
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

    // 2️⃣ Upload PDF file
    const formData = new FormData();
    Object.entries(parameters).forEach(([key, value]) => formData.append(key, value as string));
    formData.append("file", pdfBuffer, "document.pdf");

    await axios.post(url, formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
    });

    // 3️⃣ Wait for job completion
    let jobResult: any;
    for (let tries = 0; tries < 20; tries++) {
        const check = await axios.get(`https://api.cloudconvert.com/v2/jobs/${jobData.id}`, {
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDCONVERT_API_KEY}` },
        });

        if (check.data.data.status === "finished") {
            jobResult = check.data.data;
            break;
        } else if (check.data.data.status === "error") {
            throw new Error("PDF to Image conversion failed");
        }

        await new Promise((r) => setTimeout(r, 3000));
    }

    if (!jobResult) throw new Error("PDF to Image conversion timed out");

    // 4️⃣ Download all image files
    const exportTask = jobResult.tasks.find((t: any) => t.name === "export");
    const fileUrls = exportTask.result.files.map((file: any) => file.url);

    const imageBuffers: Buffer[] = [];
    for (const fileUrl of fileUrls) {
        const fileRes = await axios.get(fileUrl, { responseType: "arraybuffer" });
        imageBuffers.push(Buffer.from(fileRes.data));
    }

    return imageBuffers;
}

