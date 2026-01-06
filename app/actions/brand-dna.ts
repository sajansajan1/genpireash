import * as cheerio from "cheerio";
export interface WebsiteAnalysis {
  brand_name: string;
  category: string;
  style_keywords: string[];
  color_palette: string[];
  materials: string[];
  patterns: string[];
  audience: string;
  tagline: string;
  summary: string;
  logo_url: string;
  brand_title: string;
  brand_subtitle: string;
}
// Helper to resolve relative URLs
function resolveUrl(base: string, relative: string): string {
  if (!relative) return "";
  // If it's a data URI or already absolute, return it as is
  if (relative.startsWith("data:") || relative.startsWith("http")) {
    return relative;
  }
  try {
    return new URL(relative, base).href;
  } catch (e) {
    return ""; // Invalid URL
  }
}

// This function now returns both the logo and the content
export async function scrapeWebsiteContent(url: string): Promise<{ content: string; logoUrl: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // --- 1. Logo Extraction Logic ---
    let logoSrc =
      $('meta[property="og:image"]').attr("content") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="icon"]').attr("href") ||
      "";

    if (!logoSrc) {
      $('header img[src*="logo"], img[class*="logo"], img[id*="logo"]').each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (src) {
          logoSrc = src;
          return false; // Exit loop
        }
      });
    }

    // Resolve the found src to an absolute URL
    const logoUrl = resolveUrl(url, logoSrc);

    // --- 2. Text Content Extraction ---
    $("script, style, nav, footer, noscript, header, .cookie-banner").remove();

    const title = $("title").text() || "";
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const headings = $("h1, h2, h3")
      .map((_, el) => $(el).text())
      .get()
      .join(" ");
    const mainContent = $("main").text() || $(".content").text() || $("body").text();

    const cleanContent = `
      Title: ${title}
      Description: ${metaDescription}
      Headings: ${headings}
      Content: ${mainContent.replace(/\s+/g, " ").trim()}
    `.substring(0, 8000);

    // Return both pieces of information separately
    return { content: cleanContent, logoUrl: logoUrl };
  } catch (error) {
    console.error("Scraping failed:", error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
