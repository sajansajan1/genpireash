import { scrapeWebsiteContent } from "@/app/actions/brand-dna";
import { insertAiCreativeDirectorPrompts } from "@/lib/supabase/creative-director-prompts";
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

const PROMPT_GENERATION_SYSTEM = `
You are an expert product design strategist specializing in creating detailed, actionable product concepts. Based on the provided website content, generate three creative and specific product idea prompts that align with the brand's identity, aesthetic, target audience, and product philosophy.

**CRITICAL INSTRUCTIONS:**
1. Analyze the brand's existing product catalog, style language, materials, and color palettes
2. Identify the brand's core design principles (minimalist, bold, sustainable, luxury, etc.)
3. Understand the target customer and use case
4. Generate prompts that feel like natural extensions of the brand's existing line

Return ONLY a valid JSON object with this structure:
{
  "prompts": [
    {
      "title": "Short, compelling product name (3-6 words)",
      "prompt": "Detailed product generation prompt"
    },
    {
      "title": "Short, compelling product name (3-6 words)",
      "prompt": "Detailed product generation prompt"
    },
    {
      "title": "Short, compelling product name (3-6 words)",
      "prompt": "Detailed product generation prompt"
    }
  ]
}

**PROMPT STRUCTURE (80-150 words each):**
Each prompt MUST include ALL of these elements in this order:

1. **Product Type & Purpose**: What it is and what problem it solves
2. **Materials & Construction**: Specific materials (leather, recycled polyester, brushed aluminum, etc.)
3. **Colors & Finish**: Exact color names from the brand palette or style-aligned alternatives
4. **Key Features**: 2-3 functional or design features that make it unique
5. **Style & Aesthetic**: Design language matching the brand (minimalist, industrial, organic, etc.)
6. **Target Use Case**: Who uses it and when/where
7. **Mood Keywords**: 3-5 adjectives describing the overall feel

**RULES:**
- Use SPECIFIC colors, not generic ones (e.g., "Forest green" not "green", "Charcoal gray" not "gray")
- Name ACTUAL materials (e.g., "Full-grain Italian leather", "Recycled ocean plastic", "Aerospace-grade aluminum")
- Include MEASURABLE features (e.g., "15-inch laptop compartment", "IPX7 waterproof rating")
- Mirror the brand's language and tone
- Ensure products complement the existing catalog without duplicating
- Keep title concise but descriptive
- Make prompts detailed enough for AI image generation
`;

export async function POST(request: NextRequest) {
    const openai = getOpenAIClient();

    try {
        const { url }: { url: string } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "Missing URL" }, { status: 400 });
        }

        // Step 1: Scrape website content
        let websiteContent = "";
        try {
            const scraped = await scrapeWebsiteContent(url);
            websiteContent = scraped.content;
        } catch (scrapeError) {
            console.error("Website scraping failed:", scrapeError);
            return NextResponse.json(
                { error: "Failed to scrape website content" },
                { status: 400 }
            );
        }

        console.log("Scraped content length:", websiteContent.length);

        // Step 2: Generate three product idea prompts
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: PROMPT_GENERATION_SYSTEM,
                },
                {
                    role: "user",
                    content: `Analyze this brand's website and generate 3 highly specific product design prompts that perfectly align with their brand identity.

**BRAND ANALYSIS REQUIRED:**
1. Study their existing products, materials, and design language
2. Identify their color palette and aesthetic principles
3. Understand their target customer and use cases
4. Note their brand tone (luxury, sustainable, tech-forward, etc.)

**GENERATE PROMPTS FOR:**
Products that feel like natural extensions of their catalog - not generic items, but brand-specific designs.

**Website URL:** ${url}

**Website Content (analyze carefully):**
${websiteContent.substring(0, 10000)}

**REMEMBER:**
- Use the brand's actual color names and materials
- Include specific measurements and technical details
- Match their design aesthetic precisely
- Target their specific customer base
- Create prompts detailed enough for AI image generation`,
                },
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
            return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 });
        }

        const result = JSON.parse(responseContent);

        if (!result.prompts || !Array.isArray(result.prompts)) {
            return NextResponse.json({ error: "Invalid prompts generation response" }, { status: 500 });
        }

        console.log("Generated prompts:", result.prompts);
        const insertPrompts = await insertAiCreativeDirectorPrompts(result.prompts, url);
        if (!insertPrompts) {
            return NextResponse.json({ error: "Failed to insert prompts" }, { status: 500 });
        }
        // Return only the prompts array
        return NextResponse.json({
            prompts: result.prompts,
        });
    } catch (error) {
        console.error("Prompt generation error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Prompt generation failed";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
