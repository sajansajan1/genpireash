import { NextRequest } from "next/server";

export type SVGMakerConvertResponse = {
  svgUrl?: string;
  originalImageUrl?: string;
  creditCost?: number;
  quality?: string;
  svgText?: string;
  error?: string;
  creditsRequired?: number;
};

function isAllowedMime(type?: string | null) {
  return !!type && ["image/png", "image/jpeg", "image/webp", "image/jpg"].includes(type);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, imageUrls } = body; // ✅ support both single or multiple

    // Normalize input
    const urls: string[] = Array.isArray(imageUrls) ? imageUrls : imageUrl ? [imageUrl] : [];

    if (!urls.length) {
      return Response.json({ error: "Missing imageUrl(s)" }, { status: 400 });
    }

    const apiKey = "svgmaker-io17aed66293abb775";
    if (!apiKey) {
      return Response.json({ error: "Server misconfiguration: missing API key" }, { status: 500 });
    }

    const MAX_BYTES = 25 * 1024 * 1024; // 25 MB limit

    // Process all images in parallel
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const imageRes = await fetch(url);
          if (!imageRes.ok) {
            return { error: `Failed to fetch image: ${imageRes.statusText}`, originalImageUrl: url };
          }

          const contentType = imageRes.headers.get("content-type");
          if (!isAllowedMime(contentType)) {
            if (contentType === "image/svg+xml") {
              return { error: "Input is already an SVG file", originalImageUrl: url };
            }
            return { error: `Unsupported image type: ${contentType}`, originalImageUrl: url };
          }

          const contentLength = imageRes.headers.get("content-length");
          if (contentLength && parseInt(contentLength, 10) > MAX_BYTES) {
            return { error: "Image exceeds 25MB limit", originalImageUrl: url };
          }

          const imageBlob = await imageRes.blob();
          if (imageBlob.size > MAX_BYTES) {
            return { error: "Image exceeds 25MB limit", originalImageUrl: url };
          }

          const filename = new URL(url).pathname.split("/").pop() || "image.png";

          const upstream = new FormData();
          upstream.append("file", imageBlob, filename);
          upstream.append("svgText", "true");

          const upstreamRes = await fetch("https://svgmaker.io/api/convert", {
            method: "POST",
            headers: { "x-api-key": apiKey },
            body: upstream,
          });

          const text = await upstreamRes.text();
          const contentTypeRes = upstreamRes.headers.get("content-type") || "application/json";

          if (!upstreamRes.ok) {
            return {
              error: `Conversion failed: ${text}`,
              originalImageUrl: url,
            };
          }

          // Try parsing JSON response (SVG Maker returns JSON)
          const data = contentTypeRes.includes("application/json") ? JSON.parse(text) : { svgText: text };

          return { ...data, originalImageUrl: url };
        } catch (err: any) {
          return {
            error: err?.message || "Unexpected error converting image",
            originalImageUrl: url,
          };
        }
      })
    );

    // ✅ Return single object if one image, array if multiple
    if (results.length === 1) {
      return Response.json(results[0], { status: 200 });
    }

    return Response.json(results, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Unexpected server error" }, { status: 500 });
  }
}
