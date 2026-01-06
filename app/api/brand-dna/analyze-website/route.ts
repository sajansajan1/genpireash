import { scrapeWebsiteContent } from "@/app/actions/brand-dna";
import { isValidImageUrl } from "@/lib/utils/image-valid-url-check";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be used on the server");
  }
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });
}

const ANALYSIS_PROMPT = `
You are an expert brand strategist and copywriter. Analyze the website at the provided URL to understand the brand's unique value proposition, generate a concise summary, and create an authentic tagline that resonates with their target audience.

Return ONLY a valid JSON object with this structure:
{
  "brand_name": "extracted or inferred brand name",
  "brand_title": "A compelling title for the homepage (max 60 characters)",
  "brand_subtitle": "A short, descriptive subtitle that elaborates on the brand's main offering",
  "summary": "A concise 4-5 line summary of the brand's purpose, offerings, and value proposition",
  "category": "product category (e.g., fashion, electronics, home decor, etc.)",
  "style_keywords": ["array", "of", "style", "descriptors"],
  "color_palette": ["#hexcode1", "#hexcode2", "#hexcode3"],
  "materials": ["material1", "material2", "material3"],
  "patterns": ["pattern1", "pattern2", "pattern3"],
  "target_audience": "specific target audience description with demographics and psychographics",
  "tagline": "single best tagline recommendation as a string",
  "logo_url": "main logo URL or favicon URL"
}

Guidelines:
- Keep brand_title < 60 characters
- Tagline: 2-7 words max, clear and memorable
- Base all outputs on the website content at the given URL
`;

export async function POST(request: NextRequest) {
  const openai = getOpenAIClient();

  try {
    const { url }: { url: string } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    let websiteContent = "";
    let logoUrl: string | null = null;

    // Attempt scraping, but don't fail if it errors
    // Attempt scraping, but don't fail if it errors
    try {
      const scraped = await scrapeWebsiteContent(url);
      websiteContent = scraped.content;
      const scrapedLogoUrl = scraped.logoUrl || "";
      const logoValid = await isValidImageUrl(scrapedLogoUrl);
      logoUrl = logoValid ? scrapedLogoUrl : null;
    } catch (scrapeError) {
      console.warn("Website scraping failed, proceeding with AI using only the URL:", scrapeError);
    }

    console.log("logoUrl ==> ", logoUrl);
    console.log("Analyzing website:", url);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a product and brand analysis expert. Analyze the website at the provided URL and return a single valid JSON object. Do not include any explanatory text or markdown.",
        },
        {
          role: "user",
          content: `${ANALYSIS_PROMPT}\n\nWebsite URL: ${url}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");
    console.log("analysis ==> ", analysis);

    if (!analysis || typeof analysis !== "object") {
      throw new Error("Invalid AI response");
    }

    // Then map to your final structure
    const finalAnalysis = {
      brand_name: analysis.brand_name || "Unknown Brand",
      brand_title: analysis.brand_title || analysis.brand_name || "Untitled Page",
      brand_subtitle: analysis.brand_subtitle || "",
      summary: analysis.summary || "",
      category: analysis.category || "General",
      style_keywords: Array.isArray(analysis.style_keywords) ? analysis.style_keywords : [],
      color_palette: Array.isArray(analysis.color_palette) ? analysis.color_palette : [],
      materials: Array.isArray(analysis.materials) ? analysis.materials : [],
      patterns: Array.isArray(analysis.patterns) ? analysis.patterns : [],
      target_audience: analysis.target_audience || "General audience",
      tagline: analysis.tagline || "Not specified",
      logo_url: logoUrl || null,
    };
    console.log(finalAnalysis);
    return NextResponse.json(finalAnalysis);
  } catch (error) {
    console.error("Analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
