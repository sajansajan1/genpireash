# Genpire AI Workflow Documentation

## Complete AI System Architecture & Implementation Guide

### Table of Contents
1. [AI System Overview](#ai-system-overview)
2. [Workflow Triggers](#workflow-triggers)
3. [Core AI Workflows](#core-ai-workflows)
4. [Prompt Templates](#prompt-templates)
5. [Execution Flows](#execution-flows)
6. [Integration Points](#integration-points)
7. [Error Handling](#error-handling)
8. [Optimization Strategies](#optimization-strategies)

---

## AI System Overview

### Architecture Components

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    User Input Layer                          │
│         Text | Sketch | Reference Image | Voice              │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              Input Processing & Analysis                     │
│    Classification | Enhancement | Validation | Context       │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                 AI Generation Engine                         │
│      GPT-4 (Text) | DALL-E 3 (Images) | Vision API          │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              Output Processing & Structuring                 │
│     Parsing | Validation | Enhancement | Formatting          │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Final Output                              │
│    Tech Pack | Visuals | Cost Estimates | Recommendations   │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## Workflow Triggers

### 1. User-Initiated Triggers

#### A. Tech Pack Generation Request
**Trigger Point:** User clicks "Generate Your Techpack" button
\`\`\`typescript
// Trigger Location: app/dashboard/new-product/page.tsx
const handleGenerateTechPack = async () => {
  // Trigger Conditions:
  // 1. User is authenticated
  // 2. Has available credits or active subscription
  // 3. Input validation passed
  
  if (!user.authenticated) {
    return redirectToLogin()
  }
  
  if (user.credits < 1 && !user.hasActiveSubscription) {
    return showUpgradeModal()
  }
  
  if (!validateInput(userInput)) {
    return showValidationErrors()
  }
  
  // TRIGGER AI WORKFLOW
  await triggerTechPackGeneration({
    input: userInput,
    userId: user.id,
    timestamp: Date.now(),
    priority: user.subscriptionTier
  })
}
\`\`\`

#### B. Sketch Upload
**Trigger Point:** User uploads sketch image
\`\`\`typescript
// Trigger Location: components/tech-pack/upload-tech-pack.tsx
const handleSketchUpload = async (file: File) => {
  // Trigger Conditions:
  // 1. Valid image format (PNG, JPG, JPEG)
  // 2. File size < 10MB
  // 3. Image dimensions within limits
  
  const validation = {
    isValidFormat: ['image/png', 'image/jpeg'].includes(file.type),
    isValidSize: file.size < 10 * 1024 * 1024,
    isValidDimensions: await checkImageDimensions(file)
  }
  
  if (Object.values(validation).every(v => v)) {
    // TRIGGER SKETCH PROCESSING WORKFLOW
    await triggerSketchProcessing({
      file,
      userId: user.id,
      processingType: 'sketch-to-techpack'
    })
  }
}
\`\`\`

#### C. Prompt Improvement Request
**Trigger Point:** User clicks "Improve My Prompt"
\`\`\`typescript
// Trigger Location: components/tech-pack/unified-prompt-interface.tsx
const handleImprovePrompt = async () => {
  // TRIGGER PROMPT ENHANCEMENT WORKFLOW
  await triggerPromptImprovement({
    originalPrompt: userPrompt,
    context: {
      category: selectedCategory,
      previousAttempts: attemptHistory
    }
  })
}
\`\`\`

### 2. System-Initiated Triggers

#### A. Auto-Save and Enhancement
**Trigger Point:** Every 30 seconds during tech pack editing
\`\`\`typescript
// Background process
setInterval(async () => {
  if (hasUnsavedChanges && !isGenerating) {
    // TRIGGER AUTO-ENHANCEMENT WORKFLOW
    await triggerAutoEnhancement({
      techPackId: currentTechPack.id,
      changes: pendingChanges,
      enhancementLevel: 'minimal'
    })
  }
}, 30000)
\`\`\`

#### B. Supplier Matching
**Trigger Point:** When tech pack is finalized
\`\`\`typescript
// Trigger Location: app/actions/idea-generation.ts
const onTechPackFinalized = async (techPackId: string) => {
  // TRIGGER SUPPLIER MATCHING WORKFLOW
  await triggerSupplierMatching({
    techPackId,
    autoMatch: true,
    maxSuppliers: 10
  })
}
\`\`\`

### 3. Event-Driven Triggers

#### A. RFQ Creation
**Trigger Point:** When RFQ is submitted
\`\`\`typescript
// Trigger Location: app/api/rfq/create/route.ts
export async function POST(request: Request) {
  const rfqData = await request.json()
  
  // TRIGGER RFQ OPTIMIZATION WORKFLOW
  await triggerRFQOptimization({
    rfqData,
    techPackId: rfqData.techPackId,
    targetSuppliers: rfqData.supplierIds
  })
}
\`\`\`

---

## Core AI Workflows

### Workflow 1: Complete Tech Pack Generation

#### Trigger
User submits product description or uploads sketch

#### Full Implementation
\`\`\`typescript
// app/actions/idea-generation.ts
export async function generateCompleteTechPack(input: {
  prompt: string,
  category?: string,
  preferences?: any,
  userId: string
}) {
  // Step 1: Input Analysis
  const analyzedInput = await analyzeInput(input.prompt)
  
  // Step 2: Prompt Construction
  const systemPrompt = TECH_PACK_SYSTEM_PROMPT
  const userPrompt = buildUserPrompt(analyzedInput, input.preferences)
  
  // Step 3: GPT-4 Generation
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" }
  })
  
  // Step 4: Parse Response
  const techPackData = JSON.parse(completion.choices[0].message.content)
  
  // Step 5: Generate Visuals
  const visuals = await generateVisuals(techPackData)
  
  // Step 6: Cost Estimation
  const costEstimate = await generateCostEstimate(techPackData)
  
  // Step 7: Save to Database
  const savedTechPack = await saveTechPack({
    userId: input.userId,
    prompt: input.prompt,
    techPack: techPackData,
    imageData: visuals,
    costEstimate
  })
  
  // Step 8: Trigger Follow-up Workflows
  await triggerPostGenerationWorkflows(savedTechPack.id)
  
  return savedTechPack
}
\`\`\`

#### Complete System Prompt
\`\`\`typescript
const TECH_PACK_SYSTEM_PROMPT = `
You are an expert technical designer with 20+ years of experience in product development and manufacturing. You create detailed, professional tech packs that manufacturers can use immediately for production.

ROLE AND EXPERTISE:
- Senior Technical Designer specializing in product specifications
- Expert in materials science and manufacturing processes
- Knowledgeable about global supply chain and production standards
- Experienced in cost optimization and quality control

OUTPUT REQUIREMENTS:
Generate a comprehensive tech pack in JSON format with the following structure:

{
  "productName": "Concise, descriptive product name",
  "productOverview": "Detailed 2-3 paragraph description including purpose, target market, and unique features",
  
  "materials": [
    {
      "name": "Exact material specification (e.g., '100% Organic Cotton, 180 GSM')",
      "reason": "Why this material is chosen for this product",
      "alternatives": ["Alternative 1 with same properties", "Alternative 2"],
      "sustainabilityScore": 8, // 1-10 scale
      "costScore": 7, // 1-10 scale where 10 is most economical
      "supplier": "Recommended supplier if known",
      "certifications": ["GOTS", "OEKO-TEX"]
    }
  ],
  
  "dimensions": {
    "weight": "Weight with unit (e.g., '250g')",
    "dimensionDetails": [
      {
        "name": "Measurement name (e.g., 'Length')",
        "value": "Measurement with unit (e.g., '28cm')",
        "tolerance": "+/- 0.5cm",
        "reason": "Why this dimension is important"
      }
    ],
    "sizeChart": {
      "sizes": ["XS", "S", "M", "L", "XL"],
      "measurements": {
        "XS": { "chest": "86cm", "length": "66cm" },
        // ... continue for all sizes
      }
    },
    "industryComparison": "How these dimensions compare to industry standards"
  },
  
  "colors": {
    "primaryColors": [
      {
        "name": "Color name",
        "hex": "#HEXCODE",
        "pantone": "Pantone 19-4052 TPX",
        "usage": "Where this color is used"
      }
    ],
    "accentColors": [],
    "styleNotes": "Color story and aesthetic direction",
    "trendAlignment": "How colors align with current/upcoming trends"
  },
  
  "constructionDetails": {
    "description": "Overall construction method",
    "construction": [
      "Step 1: Detailed construction step",
      "Step 2: Next step with specific technique",
      // ... all steps
    ],
    "stitchTypes": {
      "seams": "Overlock stitch, 4-thread",
      "hem": "Coverstitch, twin needle",
      "decorative": "Chain stitch for embroidery"
    },
    "specialTechniques": ["Technique 1", "Technique 2"],
    "qualityCheckpoints": [
      "Check point 1: What to inspect",
      "Check point 2: Quality standard"
    ]
  },
  
  "hardwareComponents": {
    "description": "Overview of hardware used",
    "hardware": [
      {
        "type": "Component type (e.g., 'Zipper')",
        "specification": "YKK #5 metal zipper, antique brass",
        "quantity": "1 unit",
        "placement": "Center front",
        "alternativeOptions": ["YKK plastic", "SBS metal"]
      }
    ]
  },
  
  "packaging": {
    "materials": ["Primary packaging", "Secondary packaging"],
    "dimensions": "Package dimensions",
    "description": "Packaging design and requirements",
    "sustainability": "Eco-friendly considerations",
    "branding": {
      "placement": "Where branding appears",
      "methods": ["Screen printing", "Hang tags"]
    }
  },
  
  "qualityStandards": "Detailed quality requirements and testing procedures",
  
  "careInstructions": "Complete care and maintenance guidelines",
  
  "productionNotes": "Special instructions for manufacturers",
  
  "estimatedLeadTime": "Production timeline (e.g., '4-6 weeks')",
  
  "targetPrice": "Target production cost per unit",
  
  "moq": "Minimum order quantity",
  
  "certificationRequirements": ["Required certifications"],
  
  "testingRequirements": [
    {
      "test": "Test name",
      "standard": "Testing standard (e.g., 'ASTM D5034')",
      "requirement": "Pass criteria"
    }
  ]
}

IMPORTANT GUIDELINES:
1. Be specific and use industry-standard terminology
2. Include metric and imperial measurements where applicable
3. Provide practical alternatives for materials and components
4. Consider manufacturability and cost-effectiveness
5. Include sustainability considerations
6. Ensure all specifications are production-ready
7. Add compliance and safety requirements based on product type
8. Consider global manufacturing standards

Generate the complete tech pack based on the user's input.
`;
\`\`\`

### Workflow 2: Visual Generation Pipeline

#### Trigger
After tech pack data is generated

#### Implementation
\`\`\`typescript
// app/actions/image-generation.ts
export async function generateProductVisuals(techPack: any) {
  const views = ['front', 'back', 'side', 'detail']
  const generatedImages = {}
  
  for (const view of views) {
    try {
      // Build view-specific prompt
      const imagePrompt = buildImagePrompt(techPack, view)
      
      // Generate with DALL-E 3
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural"
      })
      
      // Upload to storage
      const uploadedUrl = await uploadToStorage(response.data[0].url, {
        techPackId: techPack.id,
        view,
        timestamp: Date.now()
      })
      
      generatedImages[view] = {
        url: uploadedUrl,
        prompt_used: imagePrompt,
        created_at: new Date().toISOString(),
        regenerated: false
      }
      
    } catch (error) {
      console.error(`Failed to generate ${view} view:`, error)
      generatedImages[view] = null
    }
  }
  
  return generatedImages
}

function buildImagePrompt(techPack: any, view: string): string {
  const basePrompt = `
Professional product photography for manufacturing reference.
Product: ${techPack.productName}
View: ${view} view
Background: Pure white (#FFFFFF)
Lighting: Bright, even studio lighting with soft shadows
Style: Clean, minimalist, technical documentation style

PRODUCT DETAILS:
- Materials: ${techPack.materials.map(m => m.name).join(', ')}
- Primary Colors: ${techPack.colors.primaryColors.map(c => `${c.name} (${c.hex})`).join(', ')}
- Key Features: ${techPack.productOverview.substring(0, 100)}

SPECIFIC VIEW REQUIREMENTS:
`

  const viewSpecific = {
    front: `
- Show complete front facing view
- Display all front details clearly
- Ensure proportions are accurate
- Highlight main design elements
- Show texture and material quality`,
    
    back: `
- Show complete back view
- Display back construction details
- Show any back closures or features
- Maintain same angle as front view
- Highlight back design elements`,
    
    side: `
- Show product from 90-degree side angle
- Display product depth and profile
- Show side seams or construction
- Highlight three-dimensional form
- Maintain consistent scale`,
    
    detail: `
- Close-up of most important detail
- Show hardware, stitching, or texture
- Focus on quality and craftsmanship
- Display material characteristics
- Highlight unique features`
  }
  
  return basePrompt + viewSpecific[view] + `

TECHNICAL REQUIREMENTS:
- High resolution, sharp focus
- No artistic filters or effects
- Accurate color representation
- Professional product photography style
- Suitable for technical documentation
`
}
\`\`\`

### Workflow 3: Sketch Processing & Interpretation

#### Trigger
User uploads a sketch or drawing

#### Implementation
\`\`\`typescript
// app/actions/Sketech-generation.ts
export async function processSketchToTechPack(
  imageFile: File,
  additionalContext?: string
) {
  // Step 1: Convert image to base64
  const base64Image = await fileToBase64(imageFile)
  
  // Step 2: Analyze sketch with GPT-4 Vision
  const visionAnalysis = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "system",
        content: SKETCH_ANALYSIS_PROMPT
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this product sketch and extract all design details. ${additionalContext || ''}`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 2000
  })
  
  // Step 3: Parse sketch analysis
  const sketchSpecs = parseSketchAnalysis(visionAnalysis.choices[0].message.content)
  
  // Step 4: Generate full tech pack from sketch specs
  const techPackPrompt = `
Based on this sketch analysis, create a complete tech pack:

${JSON.stringify(sketchSpecs, null, 2)}

Additional context: ${additionalContext || 'None provided'}
`
  
  // Step 5: Generate tech pack
  const techPack = await generateCompleteTechPack({
    prompt: techPackPrompt,
    userId: 'sketch-user',
    preferences: { fromSketch: true }
  })
  
  return techPack
}

const SKETCH_ANALYSIS_PROMPT = `
You are an expert at analyzing product sketches and technical drawings. Extract all visible design information from this sketch.

Analyze and identify:

1. PRODUCT TYPE
   - What type of product is this?
   - Category and subcategory

2. DESIGN ELEMENTS
   - Overall shape and silhouette
   - Key design features
   - Decorative elements
   - Unique characteristics

3. CONSTRUCTION DETAILS
   - Visible seams or construction lines
   - Assembly methods shown
   - Structural elements

4. PROPORTIONS
   - Relative dimensions
   - Size relationships
   - Aspect ratios

5. MATERIALS (if indicated)
   - Texture indications
   - Material notes or callouts
   - Surface treatments

6. FUNCTIONAL ELEMENTS
   - Closures (zippers, buttons, etc.)
   - Pockets or compartments
   - Straps or handles
   - Hardware components

7. ANNOTATIONS
   - Any text or measurements
   - Arrows or callouts
   - Special instructions

Provide a detailed analysis in JSON format:
{
  "productType": "",
  "designElements": [],
  "construction": [],
  "estimatedDimensions": {},
  "suggestedMaterials": [],
  "functionalElements": [],
  "additionalNotes": ""
}
`;
\`\`\`

### Workflow 4: Prompt Enhancement & Optimization

#### Trigger
User requests prompt improvement or system detects vague input

#### Implementation
\`\`\`typescript
// app/actions/prompt-improvement.ts
export async function enhanceUserPrompt(
  originalPrompt: string,
  context?: {
    category?: string,
    previousAttempts?: string[],
    userProfile?: any
  }
) {
  // Step 1: Analyze prompt quality
  const analysis = analyzePromptQuality(originalPrompt)
  
  // Step 2: Identify missing elements
  const missingElements = identifyMissingElements(originalPrompt, context?.category)
  
  // Step 3: Generate enhancement suggestions
  const enhancementPrompt = `
Improve this product description for tech pack generation:

ORIGINAL PROMPT: "${originalPrompt}"

ANALYSIS:
- Clarity Score: ${analysis.clarityScore}/10
- Specificity Score: ${analysis.specificityScore}/10
- Missing Elements: ${missingElements.join(', ')}

CONTEXT:
- Category: ${context?.category || 'Not specified'}
- User Type: ${context?.userProfile?.type || 'Unknown'}

ENHANCEMENT REQUIREMENTS:
1. Add specific measurements and dimensions
2. Clarify material specifications
3. Include target market and use case
4. Specify quality requirements
5. Add production considerations
6. Include style and aesthetic details
7. Mention any special features
8. Consider manufacturing constraints

Generate an enhanced prompt that includes all necessary details for comprehensive tech pack generation. Maintain the user's original intent while adding professional specifications.

OUTPUT FORMAT:
{
  "enhancedPrompt": "The improved, detailed prompt",
  "addedElements": ["List of elements added"],
  "suggestions": ["Additional suggestions for the user"],
  "confidenceScore": 0.95
}
`
  
  const enhancement = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a prompt enhancement specialist for product development." },
      { role: "user", content: enhancementPrompt }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  })
  
  return JSON.parse(enhancement.choices[0].message.content)
}

function analyzePromptQuality(prompt: string) {
  const metrics = {
    wordCount: prompt.split(' ').length,
    hasNumbers: /\d/.test(prompt),
    hasMeasurements: /(\d+\s*(cm|mm|inch|"|m|kg|g|oz|lb))/i.test(prompt),
    hasMaterials: /cotton|polyester|leather|wool|silk|metal|plastic|wood/i.test(prompt),
    hasColors: /red|blue|green|black|white|gray|brown|yellow|gold|silver/i.test(prompt),
    hasAdjectives: prompt.match(/\b\w+(?:ful|less|able|ible|ous|ive|ish|y)\b/g)?.length || 0
  }
  
  const clarityScore = Math.min(10, 
    (metrics.wordCount > 20 ? 3 : metrics.wordCount / 7) +
    (metrics.hasAdjectives > 3 ? 3 : metrics.hasAdjectives) +
    (metrics.hasMaterials ? 2 : 0) +
    (metrics.hasColors ? 2 : 0)
  )
  
  const specificityScore = Math.min(10,
    (metrics.hasNumbers ? 3 : 0) +
    (metrics.hasMeasurements ? 4 : 0) +
    (metrics.hasMaterials ? 2 : 0) +
    (metrics.wordCount > 30 ? 1 : 0)
  )
  
  return { clarityScore, specificityScore, metrics }
}
\`\`\`

### Workflow 5: Cost Estimation Engine

#### Trigger
After tech pack generation or on user request

#### Implementation
\`\`\`typescript
// app/actions/cost-estimation.ts
export async function generateDetailedCostEstimate(
  techPack: any,
  quantity: number = 100,
  region: string = 'global'
) {
  const costPrompt = `
Generate a detailed cost estimation for manufacturing this product:

PRODUCT SPECIFICATIONS:
${JSON.stringify(techPack, null, 2)}

PARAMETERS:
- Quantity: ${quantity} units
- Manufacturing Region: ${region}
- Timeline: Standard (4-6 weeks)

Provide comprehensive cost breakdown in this JSON structure:
{
  "sampleCost": {
    "materials": "$XX.XX",
    "labor": "$XX.XX",
    "toolingSetup": "$XX.XX",
    "overhead": "$XX.XX",
    "shipping": "$XX.XX",
    "totalSampleCost": "$XX.XX",
    "sampleLeadTime": "X weeks"
  },
  
  "productionCost": {
    "perUnitCosts": {
      "materials": "$XX.XX",
      "labor": "$XX.XX",
      "overhead": "$XX.XX",
      "packaging": "$XX.XX",
      "qualityControl": "$XX.XX"
    },
    "volumeDiscounts": [
      { "quantity": "100-499", "unitPrice": "$XX.XX", "totalCost": "$XXXX.XX" },
      { "quantity": "500-999", "unitPrice": "$XX.XX", "totalCost": "$XXXX.XX" },
      { "quantity": "1000+", "unitPrice": "$XX.XX", "totalCost": "$XXXX.XX" }
    ]
  },
  
  "logisticsCost": {
    "domesticShipping": {
      "perUnit": "$X.XX",
      "bulk": "$XXX.XX",
      "timeframe": "X-X days"
    },
    "internationalShipping": {
      "perUnit": "$XX.XX",
      "bulk": "$XXXX.XX",
      "timeframe": "X-X weeks",
      "customsDuties": "X%",
      "insurance": "$XXX.XX"
    }
  },
  
  "complianceCost": {
    "testing": "$XXX.XX",
    "certification": "$XXX.XX",
    "labeling": "$XX.XX",
    "documentation": "$XX.XX"
  },
  
  "totalCosts": {
    "totalSampleCost": "$XXX.XX",
    "totalProductionCost": "$XXXX.XX",
    "totalLandedCost": "$XXXX.XX",
    "costPerUnit": "$XX.XX"
  },
  
  "pricingRecommendations": {
    "wholesalePrice": "$XX.XX",
    "retailPrice": "$XXX.XX",
    "grossMargin": "XX%",
    "breakEvenQuantity": "XX units"
  },
  
  "notes": "Any important cost considerations or assumptions"
}

Base calculations on current market rates and industry standards.
`
  
  const costEstimate = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: COST_ESTIMATION_SYSTEM_PROMPT },
      { role: "user", content: costPrompt }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  })
  
  return JSON.parse(costEstimate.choices[0].message.content)
}

const COST_ESTIMATION_SYSTEM_PROMPT = `
You are a manufacturing cost analyst with expertise in global supply chain and production economics. 

Your knowledge includes:
- Current material costs across different regions
- Labor rates in major manufacturing hubs
- Shipping and logistics costs
- Compliance and certification expenses
- Industry-standard markup and margins

Provide accurate, realistic cost estimates based on:
- Current market conditions (2024)
- Standard industry practices
- Regional variations
- Volume-based pricing
- Quality requirements

Always be conservative in estimates and include buffer for unexpected costs.
`;
\`\`\`

### Workflow 6: Supplier Matching Algorithm

#### Trigger
Tech pack finalized or user requests supplier recommendations

#### Implementation
\`\`\`typescript
// app/actions/supplier-matching.ts
export async function intelligentSupplierMatching(
  techPackId: string,
  preferences?: {
    location?: string,
    maxLeadTime?: string,
    budgetRange?: string,
    certifications?: string[]
  }
) {
  // Step 1: Get tech pack details
  const techPack = await getTechPackById(techPackId)
  
  // Step 2: Build matching criteria
  const matchingPrompt = `
Find and score suppliers for this product:

PRODUCT DETAILS:
- Product: ${techPack.productName}
- Category: ${techPack.category}
- Materials: ${techPack.materials.map(m => m.name).join(', ')}
- Quantity: ${techPack.moq || '100-500'}
- Quality Level: ${techPack.qualityStandards}

USER PREFERENCES:
- Location: ${preferences?.location || 'Any'}
- Lead Time: ${preferences?.maxLeadTime || 'Flexible'}
- Budget: ${preferences?.budgetRange || 'Market rate'}
- Required Certifications: ${preferences?.certifications?.join(', ') || 'None specific'}

SUPPLIER DATABASE:
${JSON.stringify(await getSupplierDatabase())}

Score each supplier (0-100) based on:
1. Category Match (25 points)
   - Exact category experience: 25 points
   - Related category: 15 points
   - Can handle but not specialized: 5 points

2. Material Capability (20 points)
   - All materials available: 20 points
   - Most materials: 12 points
   - Some materials: 5 points

3. Capacity & MOQ (15 points)
   - MOQ matches perfectly: 15 points
   - MOQ acceptable: 10 points
   - MOQ challenging: 5 points

4. Lead Time (15 points)
   - Meets timeline: 15 points
   - Slightly longer: 10 points
   - Much longer: 5 points

5. Price Competitiveness (15 points)
   - Below budget: 15 points
   - Within budget: 10 points
   - Above budget: 5 points

6. Quality & Reliability (10 points)
   - Excellent track record: 10 points
   - Good track record: 7 points
   - Acceptable: 4 points

Return top 10 matches in JSON:
{
  "matches": [
    {
      "supplierId": "xxx",
      "companyName": "xxx",
      "matchScore": 95,
      "scoreBreakdown": {
        "categoryMatch": 25,
        "materialCapability": 20,
        "capacityMOQ": 15,
        "leadTime": 15,
        "pricing": 10,
        "quality": 10
      },
      "strengths": ["xxx", "xxx"],
      "considerations": ["xxx", "xxx"],
      "recommendationReason": "xxx"
    }
  ]
}
`
  
  const matchingResult = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a supply chain expert specializing in manufacturer matching." },
      { role: "user", content: matchingPrompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
  })
  
  const matches = JSON.parse(matchingResult.choices[0].message.content)
  
  // Step 3: Enrich with real-time data
  const enrichedMatches = await enrichSupplierData(matches.matches)
  
  // Step 4: Save matching results
  await saveMatchingResults(techPackId, enrichedMatches)
  
  return enrichedMatches
}
\`\`\`

### Workflow 7: RFQ Optimization

#### Trigger
User creates an RFQ

#### Implementation
\`\`\`typescript
// app/actions/rfq-optimization.ts
export async function optimizeRFQ(
  rfqData: any,
  techPackId: string
) {
  const optimizationPrompt = `
Optimize this RFQ for maximum supplier response and best terms:

ORIGINAL RFQ:
${JSON.stringify(rfqData, null, 2)}

TECH PACK SUMMARY:
${JSON.stringify(await getTechPackSummary(techPackId), null, 2)}

Provide optimized RFQ with:
1. Clear, professional title
2. Compelling project description
3. Realistic timeline with milestones
4. Negotiation-friendly quantity tiers
5. Competitive target pricing
6. Clear payment terms
7. Quality requirements
8. Response incentives

Output JSON:
{
  "optimizedRFQ": {
    "title": "Professional, clear title",
    "description": "Compelling project overview",
    "requirements": {
      "quantity": "Tiered quantities for better pricing",
      "timeline": "Realistic with buffer",
      "targetPrice": "Market-competitive range",
      "paymentTerms": "Industry-standard terms",
      "qualityStandards": "Clear expectations"
    },
    "sellingPoints": [
      "Why suppliers should bid"
    ],
    "suggestedSuppliers": ["List of ideal suppliers"],
    "negotiationTips": ["Tips for best results"],
    "expectedResponses": "Number and quality of expected responses"
  }
}
`
  
  const optimization = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are an RFQ optimization specialist." },
      { role: "user", content: optimizationPrompt }
    ],
    temperature: 0.4,
    response_format: { type: "json_object" }
  })
  
  return JSON.parse(optimization.choices[0].message.content)
}
\`\`\`

---

## Integration Points

### 1. Database Integration

\`\`\`typescript
// lib/supabase/ai-integration.ts
export async function saveAIGeneration(data: any) {
  const { data: saved, error } = await supabase
    .from('ai_generations')
    .insert({
      user_id: data.userId,
      generation_type: data.type,
      input_data: data.input,
      output_data: data.output,
      model_used: data.model,
      tokens_used: data.tokens,
      cost: calculateCost(data.tokens, data.model),
      created_at: new Date().toISOString()
    })
  
  if (error) throw error
  return saved
}

export async function getAIHistory(userId: string) {
  const { data, error } = await supabase
    .from('ai_generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) throw error
  return data
}
\`\`\`

### 2. Real-time Updates

\`\`\`typescript
// lib/realtime/ai-updates.ts
export function subscribeToAIUpdates(techPackId: string, callback: Function) {
  const channel = supabase
    .channel(`ai-generation-${techPackId}`)
    .on('broadcast', { event: 'generation-progress' }, (payload) => {
      callback(payload)
    })
    .subscribe()
  
  return channel
}

export async function broadcastAIProgress(techPackId: string, progress: any) {
  await supabase
    .channel(`ai-generation-${techPackId}`)
    .send({
      type: 'broadcast',
      event: 'generation-progress',
      payload: progress
    })
}
\`\`\`

---

## Error Handling

### Comprehensive Error Management

\`\`\`typescript
// lib/ai/error-handling.ts
export async function handleAIError(error: any, context: any) {
  const errorType = classifyError(error)
  
  switch (errorType) {
    case 'RATE_LIMIT':
      return handleRateLimit(error, context)
    
    case 'TOKEN_LIMIT':
      return handleTokenLimit(error, context)
    
    case 'API_ERROR':
      return handleAPIError(error, context)
    
    case 'INVALID_RESPONSE':
      return handleInvalidResponse(error, context)
    
    case 'TIMEOUT':
      return handleTimeout(error, context)
    
    default:
      return handleGenericError(error, context)
  }
}

async function handleRateLimit(error: any, context: any) {
  // Implement exponential backoff
  const retryAfter = error.headers?.['retry-after'] || 60
  await delay(retryAfter * 1000)
  
  // Retry with reduced complexity
  return retryWithReducedComplexity(context)
}

async function handleTokenLimit(error: any, context: any) {
  // Split into smaller chunks
  const chunks = splitIntoChunks(context.input)
  const results = []
  
  for (const chunk of chunks) {
    const result = await processChunk(chunk)
    results.push(result)
  }
  
  return mergeResults(results)
}

async function handleAPIError(error: any, context: any) {
  // Use fallback model or cached response
  const fallback = await getFallbackResponse(context)
  
  if (fallback) {
    return fallback
  }
  
  // Queue for later processing
  await queueForRetry(context)
  
  return {
    status: 'queued',
    message: 'Your request is being processed. You will be notified when complete.'
  }
}
\`\`\`

---

## Optimization Strategies

### 1. Caching Strategy

\`\`\`typescript
// lib/ai/caching.ts
const AI_CACHE = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export async function getCachedOrGenerate(
  key: string,
  generator: Function,
  ttl: number = CACHE_TTL
) {
  // Check cache
  if (AI_CACHE.has(key)) {
    const cached = AI_CACHE.get(key)
    if (Date.now() - cached.timestamp < ttl) {
      return cached.data
    }
  }
  
  // Generate new
  const result = await generator()
  
  // Cache result
  AI_CACHE.set(key, {
    data: result,
    timestamp: Date.now()
  })
  
  // Persist to database for long-term storage
  await persistToDatabase(key, result)
  
  return result
}
\`\`\`

### 2. Parallel Processing

\`\`\`typescript
// lib/ai/parallel-processing.ts
export async function parallelGeneration(tasks: any[]) {
  const chunks = chunkArray(tasks, 3) // Process 3 at a time
  const results = []
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(task => processTask(task))
    )
    results.push(...chunkResults)
  }
  
  return results
}
\`\`\`

### 3. Token Optimization

\`\`\`typescript
// lib/ai/token-optimization.ts
export function optimizePrompt(prompt: string): string {
  // Remove redundancies
  prompt = removeRedundancies(prompt)
  
  // Compress whitespace
  prompt = prompt.replace(/\s+/g, ' ').trim()
  
  // Use abbreviations where appropriate
  prompt = useAbbreviations(prompt)
  
  // Remove unnecessary examples if token count is high
  const tokenCount = estimateTokens(prompt)
  if (tokenCount > 3000) {
    prompt = removeExamples(prompt)
  }
  
  return prompt
}
\`\`\`

---

## Monitoring & Analytics

### AI Performance Tracking

\`\`\`typescript
// lib/ai/monitoring.ts
export async function trackAIMetrics(operation: string, metrics: any) {
  const data = {
    operation,
    timestamp: Date.now(),
    duration: metrics.duration,
    tokens_used: metrics.tokens,
    cost: calculateCost(metrics.tokens, metrics.model),
    success: metrics.success,
    error: metrics.error || null,
    user_satisfaction: metrics.satisfaction || null
  }
  
  // Save to analytics database
  await saveToAnalytics(data)
  
  // Check for anomalies
  if (data.duration > 30000) {
    await alertTeam('Slow AI generation detected', data)
  }
  
  if (!data.success) {
    await alertTeam('AI generation failed', data)
  }
  
  return data
}
\`\`\`

---

## Testing & Validation

### AI Output Validation

\`\`\`typescript
// lib/ai/validation.ts
export async function validateAIOutput(output: any, expectedSchema: any) {
  const validation = {
    schemaValid: validateSchema(output, expectedSchema),
    contentQuality: await assessContentQuality(output),
    completeness: checkCompleteness(output),
    accuracy: await verifyAccuracy(output)
  }
  
  if (!validation.schemaValid) {
    throw new Error('Invalid AI output schema')
  }
  
  if (validation.contentQuality < 0.7) {
    return await regenerateWithImprovedPrompt(output)
  }
  
  return {
    valid: true,
    output,
    validation
  }
}
\`\`\`

---

This comprehensive AI workflow documentation provides the complete implementation details, triggers, prompts, and integration points for the Genpire AI system. The workflows are designed to be modular, scalable, and maintainable while delivering high-quality AI-generated tech packs and related services.
