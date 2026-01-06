/**
 * BOM Cost Estimation API
 * Uses AI to generate realistic manufacturing cost estimates
 * Caches results in database for reuse
 * POST /api/bom/estimate-costs
 */

import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClientSingleton } from "@/lib/ai/openai-client";
import {
  generateMaterialsHash,
  getLatestBOMEstimate,
  saveBOMEstimate,
  storedToAPIFormat,
  cleanupOldEstimates,
} from "@/lib/supabase/bom-estimates";

interface CostEstimationRequest {
  productName: string;
  category: string;
  productIdeaId?: string; // For caching
  techPackId?: string; // For linking to tech pack
  revisionId?: string; // For linking to revision
  userId?: string; // For storing
  materials: Array<{
    component: string;
    material: string;
    specification?: string;
    quantityPerUnit?: number;
    unitCost?: number;
  }>;
  hardware?: string[];
  dimensions?: Record<string, any>;
  productDescription?: string;
  totalMaterialCost?: number;
  forceRefresh?: boolean; // Skip cache and regenerate
}

interface CostEstimationResponse {
  success: boolean;
  data?: {
    sampleCost: {
      min: number;
      max: number;
      currency: string;
      breakdown: {
        materials: number;
        labor: number;
        setup: number;
        shipping: number;
      };
    };
    productionCost: {
      quantity: number;
      totalMin: number;
      totalMax: number;
      perUnitMin: number;
      perUnitMax: number;
      currency: string;
    };
    leadTimes: {
      sample: string;
      production: string;
    };
    manufacturingRegions: Array<{
      region: string;
      priceMultiplier: number;
      notes: string;
    }>;
    marketInsights: string;
    dataSources: string[];
    confidence: "high" | "medium" | "low";
    generatedAt: string;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CostEstimationResponse>> {
  try {
    const body: CostEstimationRequest = await request.json();
    const {
      productName,
      category,
      productIdeaId,
      techPackId,
      revisionId,
      userId,
      materials,
      hardware,
      dimensions,
      productDescription,
      totalMaterialCost,
      forceRefresh,
    } = body;

    if (!productName || !category) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: productName and category",
      }, { status: 400 });
    }

    // Generate materials hash for cache validation
    const materialsHash = generateMaterialsHash(materials || []);

    // Check for cached estimate if productIdeaId is provided and not forcing refresh
    if (productIdeaId && !forceRefresh) {
      const cachedEstimate = await getLatestBOMEstimate(productIdeaId, materialsHash);
      if (cachedEstimate) {
        console.log(`[BOM] Using cached estimate for product ${productIdeaId}`);
        return NextResponse.json({
          success: true,
          data: {
            ...storedToAPIFormat(cachedEstimate),
            currency: "USD",
            dataSources: ["Cached estimate", "BOM calculation"],
            fromCache: true,
          } as any,
        });
      }
    }

    // Build detailed materials context with costs
    const materialsContext = materials?.length > 0
      ? materials.map(m => {
          const cost = m.unitCost ? `$${m.unitCost}/unit` : 'ESTIMATE NEEDED';
          const qty = m.quantityPerUnit || 1;
          return `- ${m.component}: ${m.material} (${m.specification || 'standard'}) - ${cost} x${qty}`;
        }).join("\n")
      : "No specific materials provided";

    const hardwareContext = hardware && hardware.length > 0
      ? hardware.join(", ")
      : "None specified";

    // Format dimensions more readably
    const dimensionsContext = dimensions
      ? Object.entries(dimensions).map(([key, val]: [string, any]) => {
          if (typeof val === 'object' && val.value) {
            return `${key}: ${val.value}${val.tolerance ? ` (±${val.tolerance})` : ''}`;
          }
          return `${key}: ${JSON.stringify(val)}`;
        }).join(", ")
      : "Not specified";

    // Determine product complexity based on category and hardware
    const hasElectronics = hardware?.some(h =>
      /motor|battery|led|circuit|sensor|solar|electronic|wire|switch/i.test(h)
    ) || /electronic|electric|motor|battery|solar/i.test(category) || /electronic|electric|motor|battery|solar/i.test(productDescription || '');

    const complexityLevel = hasElectronics ? 'high' :
      /furniture|appliance|machinery/i.test(category) ? 'medium' : 'low';

    // Calculate labor multiplier based on complexity
    const laborMultiplier = complexityLevel === 'high' ? 3 : complexityLevel === 'medium' ? 2 : 1;

    // Check if we need AI to estimate material costs
    const needsMaterialEstimation = !totalMaterialCost || totalMaterialCost === 0;
    const materialCount = materials?.length || 0;

    const prompt = `You are a manufacturing cost estimation expert.${needsMaterialEstimation ? ' ESTIMATE realistic material costs based on industry standards.' : ' Calculate costs using the PROVIDED material costs.'}

**Product:** ${productName}
**Category:** ${category}
**Complexity Level:** ${complexityLevel.toUpperCase()} ${hasElectronics ? '(has electronics/motors)' : ''}
**Description:** ${productDescription || "Standard consumer product"}

**Bill of Materials:**
${materialsContext}
${needsMaterialEstimation ? `
**IMPORTANT: Material costs are NOT provided. You MUST estimate realistic unit costs for each material based on:
- Material type (plastic, metal, fabric, electronics, etc.)
- Industry standard pricing
- Product category and quality level
Estimate total material cost per unit as the SUM of all material costs.` : `
**TOTAL MATERIAL COST PER UNIT: $${totalMaterialCost?.toFixed(2) || '0.00'}** ← USE THIS AS BASE`}

**Hardware/Components:** ${hardwareContext}
**Dimensions:** ${dimensionsContext}

=== CALCULATION INSTRUCTIONS ===${needsMaterialEstimation ? `

**STEP 1: ESTIMATE MATERIAL COSTS** (REQUIRED - no costs provided)
Based on the material types listed above, estimate realistic unit costs using industry standards:

COMMON MATERIAL COST RANGES (per unit/component):
- Plastics (ABS, PVC, Polycarbonate, etc.): $1-8 depending on size/complexity
- Metals (Steel, Aluminum, Brass, etc.): $2-15 depending on weight/finish
- Fabrics (Cotton, Polyester, Canvas, etc.): $1-10 per sq meter
- Leather/Synthetic leather: $5-25 per sq foot
- Rubber/Foam/EVA: $0.50-5 per unit
- Wood/MDF: $2-12 per piece
- Glass/Ceramic: $3-15 per unit
- Electronics/Motors/Batteries: $5-50 depending on complexity
- Hardware (screws, zippers, buckles): $0.10-3 per piece
- Packaging materials: $0.50-3 per unit

IMPORTANT: Use your knowledge of manufacturing to estimate based on:
- The specific material type mentioned
- The product category and typical quality level
- Reasonable quantity per unit

Sum all material costs to get ESTIMATED TOTAL PER UNIT.
Include in "estimatedMaterialCosts" field.` : ''}

SAMPLE COST (1 unit):
- Materials: ${needsMaterialEstimation ? '<your_estimated_total>' : `$${totalMaterialCost?.toFixed(2)}`} × 1.5 (sample markup)
- Labor: ${complexityLevel === 'high' ? '$25-40 (electronics)' : complexityLevel === 'medium' ? '$15-25 (moderate)' : '$10-20 (simple)'}
- Setup: $5-15
- Shipping: $20-50

PRODUCTION (1000 units):
- Material/unit: ${needsMaterialEstimation ? '<your_estimated_total>' : `$${totalMaterialCost?.toFixed(2)}`} × 0.65 (bulk discount)
- Labor/unit: ${complexityLevel === 'high' ? '$3-5' : complexityLevel === 'medium' ? '$1.50-3' : '$0.50-1.50'}
- Tooling: ${hasElectronics ? '$2-5/unit' : '$0.50-2/unit'}

Respond in JSON:
{${needsMaterialEstimation ? `
  "estimatedMaterialCosts": {
    "perMaterial": [{"component": "<name>", "material": "<type>", "estimatedCost": <number>}],
    "totalPerUnit": <sum of all>
  },` : ''}
  "sampleCost": {
    "min": <number>,
    "max": <number>,
    "currency": "USD",
    "breakdown": {"materials": <number>, "labor": <number>, "setup": <number>, "shipping": <number>}
  },
  "productionCost": {
    "quantity": 1000,
    "totalMin": <number>,
    "totalMax": <number>,
    "perUnitMin": <number>,
    "perUnitMax": <number>,
    "currency": "USD"
  },
  "leadTimes": {"sample": "${hasElectronics ? '4-6 weeks' : '2-4 weeks'}", "production": "${hasElectronics ? '10-14 weeks' : '6-10 weeks'}"},
  "manufacturingRegions": [
    {"region": "China", "priceMultiplier": 1.0, "notes": "Base pricing"},
    {"region": "Vietnam", "priceMultiplier": 1.05, "notes": "Slightly higher"},
    {"region": "India", "priceMultiplier": 0.95, "notes": "Lower labor costs"},
    {"region": "Mexico", "priceMultiplier": 1.25, "notes": "Nearshoring premium"}
  ],
  "marketInsights": "<1 sentence>",
  "dataSources": ["${needsMaterialEstimation ? 'AI material estimation' : 'BOM calculation'}", "Industry rates"],
  "confidence": "${needsMaterialEstimation ? 'medium' : 'high'}"
}`;

    // Get OpenAI client
    const openai = getOpenAIClientSingleton();

    // Call OpenAI with JSON mode
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      temperature: 0, // Make responses deterministic
      seed: 42, // Fixed seed for reproducibility
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a manufacturing cost calculator.${needsMaterialEstimation ? `

IMPORTANT: Material costs are NOT provided. You MUST:
1. ESTIMATE realistic unit costs for each material based on material type and industry standards
2. Include these in "estimatedMaterialCosts" field
3. Use your estimated total for all calculations` : `

Use the provided material cost ($${totalMaterialCost?.toFixed(2)}) as the BASE for calculations.`}

Calculation rules:
- Sample cost = (materials × 1.5) + labor + setup + shipping
- Production per-unit = (materials × 0.65) + labor + tooling
- Products with electronics/motors have higher labor costs

Respond ONLY with valid JSON.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the response
    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    const estimationData = JSON.parse(textContent);
    const generatedAt = new Date().toISOString();

    // Save to database if productIdeaId and userId are provided
    if (productIdeaId && userId) {
      try {
        await saveBOMEstimate({
          productIdeaId,
          techPackId,
          revisionId,
          userId,
          materialCostInput: totalMaterialCost || 0,
          materialsHash,
          estimate: estimationData,
          complexityLevel: complexityLevel as "high" | "medium" | "low",
          hasElectronics,
        });
        console.log(`[BOM] Saved estimate for product ${productIdeaId}`);

        // Cleanup old estimates (keep last 5)
        await cleanupOldEstimates(productIdeaId, 5);
      } catch (saveError) {
        // Don't fail the request if saving fails, just log it
        console.error("[BOM] Failed to save estimate:", saveError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...estimationData,
        generatedAt,
        fromCache: false,
      },
    });

  } catch (error) {
    console.error("BOM cost estimation error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to estimate costs",
    }, { status: 500 });
  }
}
