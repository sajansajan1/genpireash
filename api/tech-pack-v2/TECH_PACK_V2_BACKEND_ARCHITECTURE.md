# Tech Pack V2 - Backend Architecture

## Overview
This document defines the complete backend architecture for Tech Pack V2 system, including directory structure, configuration files, AI prompts, endpoints, and utility functions.

## 🔑 Key Integrations with Existing Services

**IMPORTANT:** This architecture leverages existing production-ready utilities from the codebase:

### AI Services
- **Image Generation:** `lib/ai/gemini.ts` - Gemini 2.5 Flash Image Preview
- **Vision Analysis:** OpenAI GPT-4o Vision API
- **Prompt System:** `lib/ai/prompts.ts` - Template-based prompt building

### Image Processing
- **Upload & Optimization:** `lib/services/image-service.ts` - ImageService with Sharp
- **Storage:** Supabase Storage via `lib/supabase/file_upload.ts`
- **Presets:** `aiAnalysis` (800x800, 75% quality), `standard` (1200x1200), `highQuality` (1800x1800)

### Database
- **Client:** `lib/supabase/server.ts` (Server) / `lib/supabase/client.ts` (Client)
- **Primary Tables:** `revision_vision_analysis`, `product_multiview_revisions`, `product_ideas`

### Workflow
- **Background Execution:** `lib/utils/background-execution.ts` - Non-blocking operations
- **Logging:** `lib/logging/ai-logger.ts` - AI operation tracking

---

## 1. Directory Structure

```
api/tech-pack-v2/
├── config/
│   ├── models.config.ts          # AI model configurations (GPT-4o settings)
│   ├── credits.config.ts         # Credit costs per operation
│   └── limits.config.ts          # Rate limits, token limits, timeouts
│
├── prompts/
│   ├── category-detection/
│   │   └── detect-category.prompt.ts
│   │
│   ├── base-views/
│   │   ├── apparel.prompt.ts
│   │   ├── footwear.prompt.ts
│   │   ├── bags.prompt.ts
│   │   ├── furniture.prompt.ts
│   │   └── jewelry.prompt.ts
│   │
│   ├── close-ups/
│   │   ├── generate-closeup-plan.prompt.ts
│   │   └── analyze-closeup.prompt.ts
│   │
│   ├── sketches/
│   │   ├── generate-technical-sketch.prompt.ts
│   │   └── generate-callouts.prompt.ts
│   │
│   └── analysis/
│       ├── materials.prompt.ts
│       ├── dimensions.prompt.ts
│       ├── construction.prompt.ts
│       └── cost-estimation.prompt.ts
│
├── endpoints/
│   ├── category.endpoint.ts           # POST /api/tech-pack-v2/detect-category
│   ├── base-views.endpoint.ts         # POST /api/tech-pack-v2/base-views/analyze
│   ├── close-ups.endpoint.ts          # POST /api/tech-pack-v2/close-ups/generate
│   ├── sketches.endpoint.ts           # POST /api/tech-pack-v2/sketches/generate
│   ├── edit.endpoint.ts               # POST /api/tech-pack-v2/edit
│   └── regenerate.endpoint.ts         # POST /api/tech-pack-v2/regenerate
│
├── functions/
│   ├── category-detection.function.ts
│   ├── base-view-analysis.function.ts
│   ├── closeup-generation.function.ts
│   ├── sketch-generation.function.ts
│   └── ai-edit.function.ts
│
├── utils/
│   ├── openai-client.ts              # OpenAI API wrapper
│   ├── image-processor.ts            # Image validation, resizing
│   ├── credits-manager.ts            # Credit deduction/validation
│   ├── cache-manager.ts              # Image hash caching
│   ├── confidence-scorer.ts          # Confidence calculation
│   └── validation.ts                 # Input validation schemas
│
├── types/
│   ├── tech-pack.types.ts            # TypeScript interfaces
│   ├── prompts.types.ts              # Prompt template types
│   └── responses.types.ts            # API response types
│
└── index.ts                           # Main router/entry point
```

---

## 2. Configuration Files

### 2.1 Model Configuration (`config/models.config.ts`)

```typescript
export const AI_MODELS_CONFIG = {
  // Primary model for vision analysis
  VISION_MODEL: {
    name: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },

  // Model for text-only operations (cheaper)
  TEXT_MODEL: {
    name: "gpt-4o-mini",
    maxTokens: 2048,
    temperature: 0.5,
    topP: 1,
  },

  // Image generation model (Gemini 2.5 Flash)
  IMAGE_GENERATION_MODEL: {
    name: "gemini-2.5-flash-image-preview",
    temperature: 0.1,
    retries: 3,
    enhancePrompt: true,
    fallbackEnabled: true,
  },
} as const;

export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
  backoffMultiplier: 2,
} as const;
```

### 2.2 Credits Configuration (`config/credits.config.ts`)

```typescript
export const TECH_PACK_CREDITS = {
  // View generation costs
  BASE_VIEWS: 3,           // 5 views
  CLOSE_UPS: 3,            // 6-10 detail shots
  TECHNICAL_SKETCHES: 3,   // 3 sketches + callouts

  // Analysis costs
  CATEGORY_DETECTION: 0,   // Free (included in base views)
  BASE_VIEW_ANALYSIS: 0,   // Included in base views cost
  CLOSEUP_ANALYSIS: 0,     // Included in close-ups cost

  // Editing costs
  AI_EDIT_SINGLE_FIELD: 1, // Edit with AI reference
  REGENERATE_VIEW: 1,      // Full regeneration of single view

  // Total package
  COMPLETE_TECH_PACK: 9,   // All features combined
} as const;
```

### 2.3 Limits Configuration (`config/limits.config.ts`)

```typescript
export const LIMITS_CONFIG = {
  // Image constraints
  MAX_IMAGE_SIZE_MB: 10,
  SUPPORTED_IMAGE_FORMATS: ["image/jpeg", "image/png", "image/webp"],
  MIN_IMAGE_DIMENSION: 512,
  MAX_IMAGE_DIMENSION: 4096,

  // Request limits
  MAX_CONCURRENT_ANALYSES: 5,
  REQUEST_TIMEOUT_MS: 60000, // 60 seconds

  // Batch processing
  MAX_BATCH_SIZE: {
    BASE_VIEWS: 5,
    CLOSE_UPS: 10,
    SKETCHES: 3,
  },

  // Rate limiting (per user)
  RATE_LIMIT: {
    windowMs: 60000,    // 1 minute
    maxRequests: 30,    // 30 requests per minute
  },

  // Cache settings
  CACHE_TTL_HOURS: 24,
  MAX_CACHE_ENTRIES: 10000,
} as const;
```

---

## 3. AI Prompts (Detailed)

### 3.1 Category Detection Prompt

**File**: `prompts/category-detection/detect-category.prompt.ts`

```typescript
export const CATEGORY_DETECTION_PROMPT = {
  systemPrompt: `You are a professional product categorization expert specializing in fashion, accessories, furniture, and jewelry. Your task is to accurately identify the primary category of a product based on its image.

Categories you can identify:
- APPAREL: Clothing items (shirts, dresses, pants, jackets, etc.)
- FOOTWEAR: Shoes, boots, sandals, sneakers, etc.
- BAGS: Handbags, backpacks, totes, clutches, luggage, etc.
- FURNITURE: Chairs, tables, sofas, cabinets, etc.
- JEWELRY: Rings, necklaces, bracelets, earrings, watches, etc.

Return your response in this exact JSON format:
{
  "category": "APPAREL|FOOTWEAR|BAGS|FURNITURE|JEWELRY",
  "subcategory": "specific type",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`,

  userPromptTemplate: (imageUrl: string) => `Analyze this product image and identify its category: ${imageUrl}

Provide accurate categorization with high confidence. If the product doesn't clearly fit one category, choose the most prominent feature.`,
};
```

### 3.2 Base View Analysis - Apparel

**File**: `prompts/base-views/apparel.prompt.ts`

```typescript
export const APPAREL_BASE_VIEW_PROMPT = {
  systemPrompt: `You are a professional fashion technical designer with 15+ years of experience creating technical specifications for apparel manufacturing. You analyze garment images to extract precise technical details needed for production.

Your expertise includes:
- Garment construction and pattern making
- Fabric identification and specifications
- Silhouette and fit analysis
- Seam placement and finishing techniques
- Hardware and trim identification
- Accurate dimension estimation

You provide detailed, manufacturer-ready specifications that follow industry standards.`,

  userPromptTemplate: (viewType: string, imageUrl: string) => `Analyze this ${viewType} view of an apparel product and extract comprehensive technical specifications.

Image: ${imageUrl}

Provide the following details in JSON format:

{
  "view_type": "${viewType}",
  "garment_details": {
    "type": "exact garment type (e.g., crew neck t-shirt, slim fit jeans)",
    "silhouette": "fitted|relaxed|oversized|tailored",
    "fit_type": "slim|regular|loose|athletic",
    "gender": "mens|womens|unisex",
    "season": "spring/summer|fall/winter|all-season"
  },

  "design_elements": {
    "neckline": "crew|v-neck|collar|hood|etc.",
    "sleeves": "short|long|sleeveless|3/4",
    "closure_type": "button|zipper|pullover|etc.",
    "hemline": "straight|curved|high-low|etc.",
    "pockets": [
      {
        "type": "patch|welt|slash|etc.",
        "location": "chest|hip|side|etc.",
        "quantity": number
      }
    ]
  },

  "materials_detected": [
    {
      "component": "main body|lining|trim|etc.",
      "material_type": "cotton|polyester|leather|etc.",
      "estimated_weight": "lightweight|medium|heavyweight",
      "texture": "smooth|textured|ribbed|etc.",
      "finish": "matte|glossy|brushed|etc."
    }
  ],

  "colors_and_patterns": {
    "primary_color": {
      "name": "color name",
      "hex": "#000000",
      "pantone": "PMS 000 C (if identifiable)"
    },
    "secondary_colors": [],
    "pattern_type": "solid|striped|floral|geometric|etc.",
    "print_details": "description if applicable"
  },

  "dimensions_estimated": {
    "length": {
      "value": "measurement in cm",
      "tolerance": "±1cm",
      "measurement_point": "from shoulder to hem"
    },
    "chest_width": {
      "value": "measurement in cm",
      "tolerance": "±1cm",
      "measurement_point": "across chest 1 inch below armhole"
    },
    "shoulder_width": {
      "value": "measurement in cm",
      "tolerance": "±1cm"
    },
    "sleeve_length": {
      "value": "measurement in cm",
      "tolerance": "±1cm"
    }
  },

  "construction_details": {
    "seam_type": "flat|french|overlocked|etc.",
    "stitching_visible": true|false,
    "stitch_count": "12-14 per inch",
    "hem_finish": "double-fold|blind|raw edge|etc.",
    "special_features": ["reinforced shoulders", "taped seams", etc.]
  },

  "hardware_and_trims": [
    {
      "type": "button|zipper|snap|etc.",
      "material": "metal|plastic|wood|etc.",
      "finish": "matte|glossy|brushed|etc.",
      "color": "color description",
      "quantity": number,
      "size": "dimension if visible"
    }
  ],

  "labels_and_branding": {
    "visible_branding": true|false,
    "logo_placement": "chest|sleeve|back|etc.",
    "care_label_location": "inside back neck|side seam|etc."
  },

  "quality_indicators": {
    "overall_quality": "luxury|premium|mid-range|budget",
    "finish_quality": "excellent|good|average",
    "attention_to_detail": "high|medium|basic"
  },

  "manufacturing_notes": [
    "Special considerations for production",
    "Recommended construction sequence",
    "Quality control checkpoints"
  ],

  "confidence_scores": {
    "overall": 0.0-1.0,
    "materials": 0.0-1.0,
    "dimensions": 0.0-1.0,
    "construction": 0.0-1.0
  }
}

Be extremely precise and professional. Use industry-standard terminology. If certain details are not visible in this view, note "Not visible in ${viewType} view" rather than guessing.`,
};
```

### 3.3 Base View Analysis - Footwear

**File**: `prompts/base-views/footwear.prompt.ts`

```typescript
export const FOOTWEAR_BASE_VIEW_PROMPT = {
  systemPrompt: `You are a professional footwear technical designer with extensive experience in shoe manufacturing. You analyze footwear images to extract precise specifications for production.

Your expertise includes:
- Footwear construction methods (cemented, stitched, vulcanized)
- Material identification (leathers, textiles, synthetics, rubber)
- Sole construction and outsole patterns
- Last shape and fit characteristics
- Hardware and component specifications

You provide manufacturer-ready technical specifications following footwear industry standards.`,

  userPromptTemplate: (viewType: string, imageUrl: string) => `Analyze this ${viewType} view of footwear and extract comprehensive technical specifications.

Image: ${imageUrl}

Provide the following details in JSON format:

{
  "view_type": "${viewType}",
  "footwear_details": {
    "type": "sneaker|boot|sandal|dress shoe|etc.",
    "style": "athletic|casual|formal|performance",
    "gender": "mens|womens|unisex|kids",
    "season": "spring/summer|fall/winter|all-season",
    "activity": "running|walking|basketball|lifestyle|etc."
  },

  "upper_construction": {
    "construction_method": "stitched|cemented|molded|knit",
    "toe_style": "round|square|pointed|cap toe|etc.",
    "lacing_system": "traditional|speed lacing|slip-on|velcro|etc.",
    "eyelet_count": number,
    "tongue_type": "gusseted|standard|burrito",
    "collar_height": "low-top|mid-top|high-top",
    "collar_padding": "padded|minimal|none"
  },

  "materials_detected": [
    {
      "component": "upper|lining|insole|midsole|outsole",
      "material_type": "leather|suede|mesh|synthetic|rubber|EVA|etc.",
      "finish": "smooth|textured|patent|nubuck|etc.",
      "estimated_thickness": "thin|medium|thick",
      "breathability": "high|medium|low"
    }
  ],

  "sole_construction": {
    "outsole_material": "rubber|EVA|PU|TPU|etc.",
    "outsole_pattern": "herringbone|waffle|hexagonal|etc.",
    "midsole_visible": true|false,
    "midsole_material": "EVA|foam|gel|air|etc.",
    "heel_height": "measurement in cm",
    "heel_type": "flat|stacked|wedge|platform",
    "cushioning_tech": "description if visible"
  },

  "dimensions_estimated": {
    "shaft_height": {
      "value": "measurement in cm",
      "tolerance": "±0.5cm"
    },
    "heel_height": {
      "value": "measurement in cm",
      "tolerance": "±0.3cm"
    },
    "platform_height": {
      "value": "measurement in cm",
      "tolerance": "±0.3cm"
    }
  },

  "colors_and_design": {
    "colorways": [
      {
        "component": "upper|sole|laces|etc.",
        "color_name": "color name",
        "hex": "#000000",
        "finish": "matte|glossy|metallic"
      }
    ],
    "pattern_details": "solid|color-blocked|printed|etc.",
    "branding_visible": true|false,
    "branding_location": ["tongue", "heel", "side panel"]
  },

  "hardware_components": [
    {
      "type": "eyelets|D-rings|aglets|buckles|etc.",
      "material": "metal|plastic",
      "finish": "chrome|gunmetal|gold|etc.",
      "quantity": number
    }
  ],

  "construction_quality": {
    "stitch_quality": "excellent|good|average",
    "edge_finishing": "clean|rough|beveled",
    "symmetry": "precise|acceptable|uneven",
    "overall_craftsmanship": "luxury|premium|mid-range|budget"
  },

  "performance_features": [
    "water resistant",
    "breathable mesh panels",
    "reinforced toe cap",
    "ankle support",
    "etc."
  ],

  "manufacturing_notes": [
    "Cement lasted construction recommended",
    "Strobel stitch insole attachment",
    "Quality control: check symmetry and alignment"
  ],

  "confidence_scores": {
    "overall": 0.0-1.0,
    "materials": 0.0-1.0,
    "construction": 0.0-1.0,
    "dimensions": 0.0-1.0
  }
}

Use precise footwear industry terminology. If details are not visible in ${viewType} view, indicate "Not visible" rather than estimating.`,
};
```

### 3.4 Base View Analysis - Bags

**File**: `prompts/base-views/bags.prompt.ts`

```typescript
export const BAGS_BASE_VIEW_PROMPT = {
  systemPrompt: `You are a professional leather goods and bag technical designer with expertise in handbag, backpack, and luggage manufacturing. You analyze bag images to extract precise technical specifications.

Your expertise includes:
- Bag construction methods and pattern making
- Material identification (leathers, textiles, hardware)
- Compartment and pocket design
- Strap and handle construction
- Hardware specifications and finishes

You provide manufacturer-ready specifications following bag industry standards.`,

  userPromptTemplate: (viewType: string, imageUrl: string) => `Analyze this ${viewType} view of a bag and extract comprehensive technical specifications.

Image: ${imageUrl}

Provide the following details in JSON format:

{
  "view_type": "${viewType}",
  "bag_details": {
    "type": "tote|backpack|crossbody|clutch|messenger|etc.",
    "style": "casual|business|luxury|travel|sport",
    "gender": "mens|womens|unisex",
    "capacity_estimate": "small|medium|large|extra-large",
    "primary_use": "everyday|travel|work|special occasion"
  },

  "construction_method": {
    "assembly_type": "sewn|glued|riveted|combination",
    "structure": "structured|semi-structured|unstructured",
    "reinforcement": "internal frame|stiffeners|none",
    "base_type": "flat|gusseted|box bottom",
    "seam_type": "flat|raised|piped|welted"
  },

  "materials_detected": [
    {
      "component": "exterior|lining|straps|base|etc.",
      "material_type": "leather|canvas|nylon|polyester|etc.",
      "material_grade": "full-grain|top-grain|split|synthetic",
      "finish": "smooth|pebbled|embossed|matte|glossy",
      "estimated_weight": "lightweight|medium|heavyweight",
      "durability": "high|medium|low"
    }
  ],

  "dimensions_estimated": {
    "width": {
      "value": "measurement in cm",
      "tolerance": "±1cm",
      "measurement_point": "widest point"
    },
    "height": {
      "value": "measurement in cm",
      "tolerance": "±1cm",
      "measurement_point": "tallest point excluding handles"
    },
    "depth": {
      "value": "measurement in cm",
      "tolerance": "±1cm",
      "measurement_point": "front to back"
    },
    "handle_drop": {
      "value": "measurement in cm",
      "tolerance": "±1cm"
    },
    "strap_length": {
      "value": "measurement in cm",
      "adjustable": true|false
    }
  },

  "compartments_and_pockets": [
    {
      "type": "main|front|back|side|interior",
      "closure_type": "zipper|magnetic snap|drawstring|open",
      "size": "width x height in cm",
      "features": ["padded", "zippered", "slip pocket", etc.]
    }
  ],

  "straps_and_handles": [
    {
      "type": "shoulder strap|top handle|crossbody strap",
      "attachment_method": "sewn|riveted|D-rings|carabiner",
      "adjustability": "fixed|adjustable|removable",
      "padding": "padded|unpadded",
      "width": "measurement in cm",
      "material": "same as body|leather|chain|webbing"
    }
  ],

  "hardware_components": [
    {
      "type": "zipper|snap|buckle|D-ring|feet|lock",
      "material": "brass|nickel|stainless steel|plastic",
      "finish": "gold|silver|gunmetal|antique brass|etc.",
      "size": "measurement if visible",
      "quantity": number,
      "quality_grade": "luxury|standard|budget"
    }
  ],

  "closures": {
    "main_closure": "zipper|flap|drawstring|magnetic|etc.",
    "closure_security": "secure|moderate|minimal",
    "secondary_closures": ["interior zipper", "key clip", etc.]
  },

  "colors_and_finishing": {
    "exterior_colors": [
      {
        "color_name": "color name",
        "hex": "#000000",
        "finish": "matte|glossy|metallic"
      }
    ],
    "lining_color": "color name",
    "contrast_details": "stitching|piping|edging|etc.",
    "branding": {
      "visible": true|false,
      "locations": ["front", "hardware", "lining"],
      "method": "embossed|printed|metal plate|etc."
    }
  },

  "quality_indicators": {
    "stitching_quality": "excellent|good|average",
    "edge_finishing": "painted|burnished|raw|bound",
    "hardware_quality": "luxury|premium|standard|budget",
    "overall_craftsmanship": "luxury|premium|mid-range|budget"
  },

  "functional_features": [
    "laptop compartment (size)",
    "water bottle pocket",
    "trolley sleeve",
    "key clip",
    "phone pocket",
    etc.
  ],

  "manufacturing_notes": [
    "Use heavy-duty thread for stress points",
    "Reinforce handle attachment points",
    "Bar-tack all strap connections",
    "Quality control: test all zippers and closures"
  ],

  "confidence_scores": {
    "overall": 0.0-1.0,
    "materials": 0.0-1.0,
    "construction": 0.0-1.0,
    "dimensions": 0.0-1.0
  }
}

Use precise bag industry terminology. For details not visible in ${viewType} view, indicate "Not visible" instead of guessing.`,
};
```

### 3.5 Close-Up Generation Planning

**File**: `prompts/close-ups/generate-closeup-plan.prompt.ts`

```typescript
export const CLOSEUP_GENERATION_PLAN_PROMPT = {
  systemPrompt: `You are a professional product photographer and technical designer. Based on a product's base views analysis, you determine which close-up detail shots are essential for manufacturing documentation.

You understand what details manufacturers need to see clearly:
- Material textures and finishes
- Construction methods and seam work
- Hardware and fasteners
- Stitching and edge finishing
- Labels and branding
- Quality indicators
- Functional features

You provide a strategic plan for 6-10 close-up shots that capture all critical manufacturing details.`,

  userPromptTemplate: (productCategory: string, baseViewAnalysis: string) => `Based on this ${productCategory} analysis from base views, create a detailed plan for close-up photography shots needed for manufacturing documentation.

Base View Analysis:
${baseViewAnalysis}

Provide a JSON response with 6-10 close-up shot specifications:

{
  "closeup_shots": [
    {
      "shot_number": 1,
      "shot_name": "descriptive name (e.g., 'Collar Construction Detail')",
      "target_area": "specific area to photograph",
      "purpose": "why this shot is needed",
      "image_generation_prompt": "detailed prompt for AI image generation of this close-up",
      "analysis_focus": [
        "stitching pattern",
        "seam allowance",
        "interfacing visibility",
        etc.
      ],
      "critical_for_manufacturing": true|false,
      "priority": "high|medium|low"
    }
  ],

  "shot_guidelines": {
    "lighting": "recommended lighting setup",
    "angle": "optimal viewing angle",
    "distance": "how close to get",
    "background": "neutral background recommended"
  },

  "total_shots_recommended": 6-10,
  "estimated_coverage": "percentage of product details captured"
}

Focus on shots that reveal information NOT visible in base views. Prioritize construction details, material textures, and manufacturing specifications.`,
};
```

### 3.6 Close-Up Analysis

**File**: `prompts/close-ups/analyze-closeup.prompt.ts`

```typescript
export const CLOSEUP_ANALYSIS_PROMPT = {
  systemPrompt: `You are a quality control specialist and technical designer analyzing product close-up photographs. You extract precise manufacturing details from detail shots.

Your expertise includes:
- Stitch counting and seam analysis
- Material texture and finish identification
- Hardware specifications
- Quality assessment
- Measurement estimation from visual reference

You provide extremely detailed technical observations for manufacturing documentation.`,

  userPromptTemplate: (shotName: string, analysisFocus: string[], imageUrl: string) => `Analyze this close-up detail shot: "${shotName}"

Image: ${imageUrl}

Focus areas: ${analysisFocus.join(", ")}

Provide comprehensive technical analysis in JSON format:

{
  "shot_name": "${shotName}",
  "detailed_observations": {
    "material_details": {
      "texture": "smooth|textured|ribbed|etc.",
      "weave_pattern": "plain|twill|satin|knit|etc. (if visible)",
      "fiber_visibility": "tight|loose|medium",
      "finish": "matte|glossy|brushed|coated|etc.",
      "quality_grade": "luxury|premium|standard|budget"
    },

    "construction_details": {
      "seam_type": "flat|french|overlocked|piped|welted|etc.",
      "stitch_type": "lock|chain|zigzag|decorative|etc.",
      "stitch_count_per_inch": "number (if countable)",
      "seam_allowance": "measurement in mm",
      "edge_finishing": "clean|raw|bound|turned|etc.",
      "reinforcement": "bar-tack|backstitch|none|etc."
    },

    "hardware_specifications": {
      "type": "button|zipper|snap|rivet|etc.",
      "material": "brass|nickel|plastic|stainless steel|etc.",
      "finish": "polished|brushed|matte|antique|etc.",
      "size": "measurement in mm",
      "brand": "YKK|other brand|unbranded",
      "installation_method": "sewn|riveted|crimped|etc.",
      "quality_indicators": "smooth operation|tight fit|etc."
    },

    "measurements_visible": [
      {
        "element": "what is being measured",
        "value": "measurement",
        "tolerance": "±tolerance",
        "measurement_method": "how it was estimated"
      }
    ],

    "quality_observations": {
      "stitch_quality": "excellent|good|average|poor",
      "alignment": "perfect|acceptable|misaligned",
      "finish_quality": "excellent|good|average|poor",
      "defects_visible": [],
      "overall_workmanship": "luxury|premium|standard|budget"
    },

    "color_analysis": {
      "dominant_color": {
        "name": "color name",
        "hex": "#000000"
      },
      "color_consistency": "uniform|slightly varied|inconsistent",
      "finish": "matte|semi-gloss|glossy|metallic"
    },

    "functional_features": [
      "reinforced stress point",
      "decorative topstitching",
      "functional pocket",
      etc.
    ]
  },

  "manufacturing_specifications": {
    "recommended_thread": "thread type and weight",
    "needle_size": "recommended needle size",
    "special_equipment": ["walking foot", "piping foot", etc.],
    "assembly_notes": [
      "Specific instructions for replicating this detail"
    ]
  },

  "quality_control_checkpoints": [
    "Check stitch count consistency",
    "Verify seam alignment",
    "Test hardware functionality",
    etc.
  ],

  "comparison_to_standards": {
    "industry_standard_met": true|false,
    "quality_level": "exceeds|meets|below standards",
    "notes": "specific observations"
  },

  "confidence_score": 0.0-1.0
}

Be extremely detailed and precise. Use exact terminology. Provide measurements when visible. Focus on actionable manufacturing information.`,
};
```

### 3.7 Technical Sketch Generation

**File**: `prompts/sketches/generate-technical-sketch.prompt.ts`

```typescript
export const TECHNICAL_SKETCH_GENERATION_PROMPT = {
  systemPrompt: `You are a professional technical illustrator specializing in manufacturing documentation. You create detailed technical sketches (flat drawings) that show products in a clear, dimensional way without perspective distortion.

Technical sketches are used by manufacturers and include:
- Flat, proportional representation
- Clean line work
- Clear dimension indicators
- Construction details visible
- No shading or color (line drawings)
- Front, back, and side views

You generate precise prompts for AI image generation tools to create professional technical sketches.`,

  userPromptTemplate: (productCategory: string, productAnalysis: string, viewType: "front" | "back" | "side") => `Create a detailed prompt for generating a professional technical sketch (flat drawing) of this ${productCategory} product.

Product Analysis:
${productAnalysis}

View Type: ${viewType}

Generate an AI image generation prompt that will create a professional technical sketch:

{
  "sketch_prompt": "A professional technical flat sketch of [product description] ${viewType} view. Clean line drawing in black and white, no shading, no perspective distortion, perfectly proportional, technical illustration style, manufacturer spec sheet quality, white background, detailed construction lines visible, [specific design elements], [key features], precise and clean linework, technical fashion illustration, CAD-style flat drawing.",

  "negative_prompt": "no color, no shading, no gradients, no perspective, no 3D rendering, no photographs, no models, no mannequins, no backgrounds, no shadows, no highlights, no textures, no realistic rendering",

  "technical_requirements": {
    "style": "flat technical sketch",
    "line_weight": "consistent and clean",
    "background": "pure white",
    "orientation": "${viewType} view, no perspective",
    "details_visible": [
      "seam lines",
      "construction details",
      "hardware placement",
      "design elements",
      "proportions"
    ]
  },

  "sketch_specifications": {
    "view_angle": "${viewType} - perfectly flat",
    "scale": "proportionally accurate",
    "detail_level": "technical manufacturing detail",
    "line_style": "clean vector-style lines"
  }
}

The prompt should generate a sketch suitable for manufacturer tech packs and production documentation.`,
};
```

### 3.8 Callout Generation

**File**: `prompts/sketches/generate-callouts.prompt.ts`

```typescript
export const CALLOUT_GENERATION_PROMPT = {
  systemPrompt: `You are a technical documentation specialist who creates clear, informative callouts for technical sketches. Callouts are annotations that point to specific features on technical drawings and provide manufacturing specifications.

Effective callouts include:
- Clear reference to specific product feature
- Precise measurements with tolerances
- Material specifications
- Construction methods
- Special notes for manufacturers

You create comprehensive callout lists that cover all critical manufacturing details.`,

  userPromptTemplate: (productCategory: string, viewType: string, sketchAnalysis: string, detailedAnalysis: string) => `Create a comprehensive list of callouts for this ${productCategory} technical sketch (${viewType} view).

Sketch Analysis:
${sketchAnalysis}

Detailed Product Analysis:
${detailedAnalysis}

Generate callouts in JSON format:

{
  "callouts": [
    {
      "callout_number": 1,
      "feature_name": "descriptive name of feature",
      "location": "where on the sketch (e.g., 'top center', 'left side')",
      "specification": "detailed specification text",
      "measurement": "dimension with tolerance (if applicable)",
      "material": "material specification (if applicable)",
      "construction_note": "how it's made",
      "critical": true|false,
      "category": "dimension|material|construction|hardware|finishing"
    }
  ],

  "callout_layout": {
    "total_callouts": number,
    "placement_recommendations": {
      "top": ["callout numbers for top area"],
      "sides": ["callout numbers for sides"],
      "bottom": ["callout numbers for bottom"]
    }
  },

  "visual_guidelines": {
    "leader_line_style": "straight with arrow",
    "text_alignment": "left-aligned",
    "numbering_style": "circled numbers",
    "font_recommendation": "Arial or similar sans-serif"
  }
}

Create 8-15 callouts covering all critical manufacturing details. Prioritize dimensions, materials, and construction methods. Use clear, concise, professional language.`,
};
```

---

## 4. API Endpoints Specifications

### 4.1 Category Detection

**Endpoint**: `POST /api/tech-pack-v2/detect-category`

**Request**:
```typescript
{
  productId: string;
  imageUrl: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    category: "APPAREL" | "FOOTWEAR" | "BAGS" | "FURNITURE" | "JEWELRY";
    subcategory: string;
    confidence: number;
    reasoning: string;
  };
  error?: string;
}
```

### 4.2 Base Views Analysis

**Endpoint**: `POST /api/tech-pack-v2/base-views/analyze`

**Request**:
```typescript
{
  productId: string;
  revisionIds: string[]; // 5 base view revision IDs
  category: string; // Detected category
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    analyses: Array<{
      revisionId: string;
      viewType: string;
      analysisData: {...}; // Category-specific analysis
      confidenceScore: number;
    }>;
    creditsUsed: number;
  };
  error?: string;
}
```

### 4.3 Close-Ups Generation

**Endpoint**: `POST /api/tech-pack-v2/close-ups/generate`

**Request**:
```typescript
{
  productId: string;
  baseViewAnalyses: any[]; // Combined base view analyses
  category: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    closeupPlan: {...};
    generatedImages: Array<{
      revisionId: string;
      imageUrl: string;
      shotName: string;
    }>;
    creditsUsed: number;
  };
  error?: string;
}
```

### 4.4 Technical Sketches Generation

**Endpoint**: `POST /api/tech-pack-v2/sketches/generate`

**Request**:
```typescript
{
  productId: string;
  productAnalysis: any; // Full product analysis
  category: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    sketches: Array<{
      revisionId: string;
      viewType: "front" | "back" | "side";
      imageUrl: string;
      callouts: any[];
    }>;
    creditsUsed: number;
  };
  error?: string;
}
```

### 4.5 AI Edit

**Endpoint**: `POST /api/tech-pack-v2/edit`

**Request**:
```typescript
{
  revisionId: string;
  fieldPath: string; // e.g., "materials_detected.0.material_type"
  editPrompt: string; // User's edit instruction
  referenceImageUrl: string; // Original image for reference
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    newRevisionId: string; // New revision with edit
    updatedField: any;
    creditsUsed: number;
  };
  error?: string;
}
```

### 4.6 Regenerate View

**Endpoint**: `POST /api/tech-pack-v2/regenerate`

**Request**:
```typescript
{
  revisionId: string;
  regeneratePrompt?: string; // Optional custom instructions
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    newRevisionId: string;
    analysisData: any;
    creditsUsed: number;
  };
  error?: string;
}
```

---

## 5. Function Specifications

### 5.1 Category Detection Function

```typescript
async function detectProductCategory(
  imageUrl: string,
  openaiClient: OpenAI
): Promise<CategoryDetectionResult> {
  // 1. Validate image URL
  // 2. Call OpenAI Vision API with category detection prompt
  // 3. Parse response and validate category
  // 4. Return structured category data
}
```

### 5.2 Base View Analysis Function

```typescript
async function analyzeBaseView(
  viewType: string,
  imageUrl: string,
  category: string,
  openaiClient: OpenAI
): Promise<BaseViewAnalysis> {
  // 1. Select category-specific prompt
  // 2. Call OpenAI Vision API with prompt
  // 3. Parse and validate response JSON
  // 4. Calculate confidence scores
  // 5. Return structured analysis
}
```

### 5.3 Close-Up Generation Function

```typescript
async function generateCloseUps(
  baseViewAnalyses: any[],
  category: string,
  productId: string,
  openaiClient: OpenAI,
  geminiService: GeminiImageService
): Promise<CloseUpGenerationResult> {
  // 1. Generate close-up plan from base analyses using GPT-4o
  // 2. For each planned shot:
  //    - Generate image using Gemini 2.5 Flash Image Preview
  //    - Store in product_multiview_revisions
  //    - Analyze the generated close-up using GPT-4o Vision
  //    - Store analysis in revision_vision_analysis
  // 3. Return all close-ups with analyses
}
```

### 5.4 Technical Sketch Generation Function

```typescript
async function generateTechnicalSketches(
  productAnalysis: any,
  category: string,
  productId: string,
  openaiClient: OpenAI,
  geminiService: GeminiImageService
): Promise<TechnicalSketchResult> {
  // 1. Generate sketch prompts for front, back, side views using GPT-4o
  // 2. For each view:
  //    - Generate technical sketch using Gemini 2.5 Flash (with style: "technical")
  //    - Store in product_multiview_revisions
  //    - Generate callouts using GPT-4o Vision
  //    - Store analysis with callouts in revision_vision_analysis
  // 3. Return all sketches with callouts
}
```

### 5.5 AI Edit Function

```typescript
async function performAIEdit(
  revisionId: string,
  fieldPath: string,
  editPrompt: string,
  referenceImageUrl: string,
  openaiClient: OpenAI
): Promise<AIEditResult> {
  // 1. Fetch existing analysis from revision_vision_analysis
  // 2. Construct edit prompt with context and reference image
  // 3. Call OpenAI to generate updated field value
  // 4. Create new revision with updated analysis
  // 5. Add to edit_history in analysis_data
  // 6. Return new revision data
}
```

---

## 6. Utility Functions

**IMPORTANT:** Use existing utility services from the codebase:

### 6.1 OpenAI Client ⭐ Use Existing

**Location:** `lib/services/vision-analysis-service.ts`
**Function:** `getOpenAIClient()`

```typescript
import { getOpenAIClient } from "@/lib/services/vision-analysis-service";

// Get OpenAI client (server-side only)
const openai = getOpenAIClient();

// Use for Vision analysis
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: APPAREL_BASE_VIEW_PROMPT.systemPrompt,
    },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: imageUrl },
        },
        {
          type: "text",
          text: APPAREL_BASE_VIEW_PROMPT.userPromptTemplate(viewType, imageUrl),
        },
      ],
    },
  ],
  max_tokens: 4096,
  temperature: 0.7,
});

// Parse response
const analysisData = JSON.parse(response.choices[0].message.content);
```

**Features:**
- ✅ Secure server-side only
- ✅ Environment variable handling
- ✅ Type-safe with OpenAI SDK
- ✅ Already integrated with vision-analysis-service
- ✅ Background execution support
- ✅ Retry logic built-in

**Also available:**
- Cache operations (image hash-based)
- Database persistence
- Structured analysis results

### 6.2 Gemini Image Service ⭐ Use Existing

**Location:** `lib/ai/gemini.ts`
**Class:** `GeminiImageService`

```typescript
import { GeminiImageService, getGeminiService } from "@/lib/ai/gemini";

// Get singleton instance
const geminiService = getGeminiService();

// Generate images using Gemini 2.5 Flash Image Preview
const result = await geminiService.generateImage({
  prompt: "Professional product photo of [description]",
  referenceImage: baseImageUrl, // Optional: Use existing image as reference
  productType: "handbag",
  view: "front",
  style: "photorealistic", // or "technical", "vector", "detail"
  options: {
    retry: 3,
    fallbackEnabled: true,
    enhancePrompt: true,
  },
});

// For close-up detail shots
const closeup = await geminiService.generateImage({
  prompt: `Close-up detail shot of ${detailArea}. Show ${specificFeature} clearly.`,
  referenceImage: baseViewUrl,
  view: "detail",
  style: "detail",
  options: { enhancePrompt: true },
});

// For technical sketches (flat drawings)
const sketch = await geminiService.generateImage({
  prompt: `Technical flat sketch of ${productName}, ${viewType} view.
          Clean line drawing, no shading, no perspective, manufacturer quality.`,
  referenceImage: productImageUrl,
  view: viewType, // "front", "back", "side"
  style: "technical",
  options: { enhancePrompt: false }, // Use custom prompt as-is
});

// Response structure
interface GeneratedImage {
  url: string; // Data URL (base64) of generated image
  mimeType: string;
  prompt: string;
  fallbackUsed?: boolean;
  metadata?: {
    view?: string;
    style?: string;
    generationTime?: number;
  };
}
```

**Key Features:**
- ✅ Automatic retry with exponential backoff
- ✅ Fallback prompts if original is blocked
- ✅ Support for reference images (URL or base64)
- ✅ Multiple image inputs (reference, logo, character)
- ✅ AI logging integration
- ✅ Revision mode for consistency
- ✅ Prompt enhancement built-in

### 6.3 Credits Manager ❌ Need to Create

**Location:** `api/tech-pack-v2/utils/credits-manager.ts` (NEW)

**What to implement:**
```typescript
export class CreditsManager {
  async checkCredits(
    userId: string,
    requiredCredits: number
  ): Promise<boolean> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_credits")
      .select("credits_available")
      .eq("user_id", userId)
      .single();

    return (data?.credits_available || 0) >= requiredCredits;
  }

  async deductCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<void> {
    const supabase = await createClient();

    // Use RPC function to deduct atomically
    const { error } = await supabase.rpc("deduct_credits", {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) throw error;

    // Log transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: -amount,
      type: "deduction",
      description,
      metadata,
    });
  }

  async refundCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    // Similar to deductCredits but adds credits back
  }
}

export const creditsManager = new CreditsManager();
```

**See:** `TECH_PACK_V2_EXISTING_UTILITIES.md` for complete implementation

### 6.4 Cache Manager ⭐ Use Existing

**Location:** `lib/services/vision-analysis-service.ts`
**Built-in to vision-analysis-service**

```typescript
import { calculateImageHash } from "@/api/tech-pack-v2/utils/image-hash";
import { createClient } from "@/lib/supabase/server";

// Check cache before analysis
const imageHash = await calculateImageHash(imageUrl);
const supabase = await createClient();

const { data: cached } = await supabase
  .from("revision_vision_analysis")
  .select("*")
  .eq("image_hash", imageHash)
  .eq("status", "completed")
  .maybeSingle();

if (cached) {
  console.log("Using cached analysis");
  return cached.analysis_data;
}

// After analysis, store in cache
await supabase.from("revision_vision_analysis").insert({
  image_hash: imageHash,
  analysis_data: result,
  // ... other fields
});
```

**Features:**
- ✅ SHA-256 image hashing
- ✅ Automatic cache lookup
- ✅ TTL support via `expires_at`
- ✅ Built into `revision_vision_analysis` table

### 6.5 Image Service ⭐ Use Existing

**Location:** `lib/services/image-service.ts`
**Class:** `ImageService`

```typescript
import { imageService, uploadImage, optimizeImage, IMAGE_PRESETS } from "@/lib/services/image-service";

// Upload generated image to Supabase with automatic optimization
const uploadResult = await uploadImage(generatedImageBuffer, {
  projectId: productId, // Use productId for new UUID-based structure
  preset: "standard", // or "aiAnalysis", "highQuality", etc.
  generateWebP: true, // Generate WebP version in background
  generateThumbnail: true, // Generate thumbnail in background
  bucket: "fileuploads",
});

// Result structure
interface ImageUploadResult {
  success: boolean;
  url?: string; // Primary image URL
  thumbnailUrl?: string; // Thumbnail URL (generated in background)
  webpUrl?: string; // WebP URL (generated in background)
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
    optimized: boolean;
  };
  error?: string;
}

// Optimize image before AI analysis
const optimizedBuffer = await optimizeImage(imageBuffer, "aiAnalysis");
// aiAnalysis preset: 800x800px, 75% quality, JPEG

// Available presets:
// - micro: 64x64px, WebP (for lists)
// - thumbnail: 200x200px, WebP
// - preview: 600x600px, WebP
// - standard: 1200x1200px, JPEG (default)
// - highQuality: 1800x1800px, 90% quality
// - aiAnalysis: 800x800px, optimized for AI vision
// - social: 1080x1080px, optimized for social media

// Safe upload with retry and fallback
const result = await imageService.safeUpload(imageBuffer, {
  projectId: productId,
  preset: "standard",
  maxRetries: 3,
  timeout: 30000,
  fallbackUrl: "https://fallback-image.jpg",
});

// Batch upload multiple images
const batchResult = await imageService.uploadBatch(imageBuffers, {
  projectId: productId,
  preset: "standard",
  parallel: true,
  maxConcurrent: 5,
});
```

**Key Features:**
- ✅ Automatic image optimization with Sharp
- ✅ Multiple quality presets
- ✅ WebP and thumbnail generation (background)
- ✅ UUID-based file naming
- ✅ Retry logic with exponential backoff
- ✅ Batch processing support
- ✅ Supabase integration
- ✅ Background processing for non-blocking uploads

### 6.6 Supabase Client ⭐ Use Existing

**Location:** `lib/supabase/server.ts` (Server-side)
**Location:** `lib/supabase/client.ts` (Client-side)

```typescript
// Server-side (API routes, actions)
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();

// Query revision_vision_analysis
const { data, error } = await supabase
  .from("revision_vision_analysis")
  .select("*")
  .eq("product_idea_id", productId)
  .eq("view_type", "front")
  .single();

// Insert new analysis
const { data: newAnalysis, error } = await supabase
  .from("revision_vision_analysis")
  .insert({
    product_idea_id: productId,
    user_id: userId,
    revision_id: revisionId,
    view_type: "front",
    image_url: imageUrl,
    image_hash: hash,
    analysis_data: {
      category: "base_view",
      detected_features: {...},
      dimensions: {...},
    },
    model_used: "gpt-4o",
    confidence_score: 0.92,
    status: "completed",
  })
  .select()
  .single();

// Client-side (React components)
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
// Same API as server-side
```

### 6.7 Image Hash Calculator

```typescript
import crypto from "crypto";

async function calculateImageHash(imageUrl: string): Promise<string> {
  // Fetch image
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Calculate SHA-256 hash
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  return hash;
}

// Use for caching in revision_vision_analysis
const imageHash = await calculateImageHash(imageUrl);

// Check if already analyzed
const { data: cached } = await supabase
  .from("revision_vision_analysis")
  .select("*")
  .eq("image_hash", imageHash)
  .eq("status", "completed")
  .maybeSingle();

if (cached) {
  console.log("Using cached analysis");
  return cached.analysis_data;
}
```

---

## 7. Implementation Sequence

### Phase 1: Foundation (Week 1)
1. Set up directory structure
2. Create configuration files
3. Implement utility functions
4. Set up TypeScript types

### Phase 2: Core Analysis (Week 2)
1. Implement category detection
2. Create all category-specific prompts
3. Implement base view analysis
4. Test with real product images

### Phase 3: Advanced Features (Week 3)
1. Implement close-up generation and analysis
2. Implement technical sketch generation
3. Implement callout generation
4. Test end-to-end workflow

### Phase 4: Editing & Polish (Week 4)
1. Implement AI edit functionality
2. Implement regeneration
3. Add comprehensive error handling
4. Performance optimization
5. Documentation and testing

---

## 8. Success Metrics

**Performance Targets**:
- Category detection: < 3 seconds
- Single base view analysis: < 10 seconds
- Close-up generation: < 30 seconds per image
- Technical sketch generation: < 20 seconds per sketch
- AI edit: < 8 seconds

**Quality Targets**:
- Category detection accuracy: > 95%
- Analysis confidence: > 0.85 average
- User satisfaction with AI edits: > 80%
- Cache hit rate: > 60%

**Cost Targets**:
- Average cost per complete tech pack: < $2 USD
- Credit pricing remains at 9 credits total
- Reduce re-generation rate: < 10%

---

This architecture provides a complete, production-ready backend system for Tech Pack V2 with professional AI prompts, clear separation of concerns, and scalable design.
