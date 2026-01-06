# Tech Pack V2 - Quick Start Guide

## 🚀 Implementation Checklist

### Prerequisites
- ✅ Existing services already available:
  - Gemini 2.5 Flash Image Service (`lib/ai/gemini.ts`)
  - Image Service with Sharp (`lib/services/image-service.ts`)
  - Supabase client (`lib/supabase/server.ts`)
  - AI Logger (`lib/logging/ai-logger.ts`)
  - Background execution (`lib/utils/background-execution.ts`)

### What to Build
- [ ] API endpoints in `api/tech-pack-v2/`
- [ ] Category-specific AI prompts
- [ ] Core business logic functions
- [ ] Integration with existing utilities

---

## 📋 Implementation Steps

### Step 1: Set Up Directory Structure
```bash
api/tech-pack-v2/
├── config/              # Model & credit configurations
├── prompts/             # Category-specific AI prompts
├── endpoints/           # API route handlers
├── functions/           # Core business logic
├── utils/               # Helper utilities
└── types/               # TypeScript types
```

### Step 2: Create Configuration Files

**`config/models.config.ts`**
```typescript
export const AI_MODELS_CONFIG = {
  VISION_MODEL: {
    name: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.7,
  },
  IMAGE_GENERATION_MODEL: {
    name: "gemini-2.5-flash-image-preview",
    temperature: 0.1,
    retries: 3,
  },
};
```

**`config/credits.config.ts`**
```typescript
export const TECH_PACK_CREDITS = {
  BASE_VIEWS: 3,           // 5 views
  CLOSE_UPS: 3,            // 6-10 detail shots
  TECHNICAL_SKETCHES: 3,   // 3 sketches
  COMPLETE_TECH_PACK: 9,   // Total
};
```

### Step 3: Create AI Prompts

See `TECH_PACK_V2_BACKEND_ARCHITECTURE.md` Section 3 for complete prompts for:
- Category detection
- Apparel analysis
- Footwear analysis
- Bags analysis
- Furniture analysis
- Jewelry analysis
- Close-up generation
- Technical sketch generation

### Step 4: Implement Core Functions

**Category Detection:**
```typescript
import { openaiClient } from "@/lib/ai/openai";
import { CATEGORY_DETECTION_PROMPT } from "../prompts/category-detection";

async function detectProductCategory(imageUrl: string) {
  const response = await openaiClient.analyzeImage(
    imageUrl,
    CATEGORY_DETECTION_PROMPT.systemPrompt,
    CATEGORY_DETECTION_PROMPT.userPromptTemplate(imageUrl),
    AI_MODELS_CONFIG.VISION_MODEL
  );

  return JSON.parse(response);
}
```

**Base View Analysis:**
```typescript
import { APPAREL_BASE_VIEW_PROMPT } from "../prompts/base-views/apparel";

async function analyzeBaseView(
  viewType: string,
  imageUrl: string,
  category: string
) {
  const prompt = getPromptForCategory(category); // APPAREL_BASE_VIEW_PROMPT, etc.

  const response = await openaiClient.analyzeImage(
    imageUrl,
    prompt.systemPrompt,
    prompt.userPromptTemplate(viewType, imageUrl),
    AI_MODELS_CONFIG.VISION_MODEL
  );

  return JSON.parse(response);
}
```

**Close-Up Generation:**
```typescript
import { getGeminiService } from "@/lib/ai/gemini";
import { uploadImage } from "@/lib/services/image-service";
import { createClient } from "@/lib/supabase/server";

async function generateCloseUps(
  baseViewAnalyses: any[],
  category: string,
  productId: string
) {
  const geminiService = getGeminiService();
  const supabase = await createClient();

  // 1. Generate close-up plan using GPT-4o
  const plan = await generateCloseUpPlan(baseViewAnalyses, category);

  // 2. For each planned shot
  const results = [];
  for (const shot of plan.closeup_shots) {
    // Generate image with Gemini
    const generated = await geminiService.generateImage({
      prompt: shot.image_generation_prompt,
      referenceImage: baseViewAnalyses[0].image_url,
      view: "detail",
      style: "detail",
      options: { enhancePrompt: true },
    });

    // Convert base64 to buffer and upload
    const buffer = Buffer.from(generated.url.split(",")[1], "base64");
    const uploadResult = await uploadImage(buffer, {
      projectId: productId,
      preset: "standard",
    });

    // Store in product_multiview_revisions
    const { data: revision } = await supabase
      .from("product_multiview_revisions")
      .insert({
        product_idea_id: productId,
        view_type: "detail",
        image_url: uploadResult.url,
        batch_id: `closeups-${Date.now()}`,
      })
      .select()
      .single();

    // Analyze the generated close-up with GPT-4o
    const analysis = await analyzeCloseUp(
      shot.shot_name,
      shot.analysis_focus,
      uploadResult.url!
    );

    // Store analysis in revision_vision_analysis
    await supabase.from("revision_vision_analysis").insert({
      product_idea_id: productId,
      revision_id: revision.id,
      view_type: "detail",
      image_url: uploadResult.url,
      analysis_data: {
        category: "close_up",
        title: shot.shot_name,
        ...analysis,
      },
      model_used: "gpt-4o",
      confidence_score: analysis.confidence_score,
      status: "completed",
    });

    results.push({ revision, analysis });
  }

  return results;
}
```

**Technical Sketch Generation:**
```typescript
async function generateTechnicalSketches(
  productAnalysis: any,
  category: string,
  productId: string
) {
  const geminiService = getGeminiService();
  const supabase = await createClient();

  const views = ["front", "back", "side"];
  const results = [];

  for (const viewType of views) {
    // Generate sketch prompt with GPT-4o
    const sketchPrompt = await generateSketchPrompt(
      category,
      productAnalysis,
      viewType
    );

    // Generate technical sketch with Gemini
    const generated = await geminiService.generateImage({
      prompt: sketchPrompt.sketch_prompt,
      referenceImage: productAnalysis.baseViews[0].image_url,
      view: viewType,
      style: "technical",
      options: { enhancePrompt: false }, // Use exact prompt
    });

    // Upload sketch
    const buffer = Buffer.from(generated.url.split(",")[1], "base64");
    const uploadResult = await uploadImage(buffer, {
      projectId: productId,
      preset: "standard",
    });

    // Store revision
    const { data: revision } = await supabase
      .from("product_multiview_revisions")
      .insert({
        product_idea_id: productId,
        view_type: viewType,
        image_url: uploadResult.url,
        batch_id: `sketches-${Date.now()}`,
      })
      .select()
      .single();

    // Generate callouts with GPT-4o
    const callouts = await generateCallouts(
      category,
      viewType,
      uploadResult.url!,
      productAnalysis
    );

    // Store analysis with callouts
    await supabase.from("revision_vision_analysis").insert({
      product_idea_id: productId,
      revision_id: revision.id,
      view_type: viewType,
      image_url: uploadResult.url,
      analysis_data: {
        category: "technical_sketch",
        sketch_type: `${viewType}_technical`,
        callOuts: callouts.callouts,
        total_callouts: callouts.callouts.length,
      },
      model_used: "gpt-4o",
      status: "completed",
    });

    results.push({ revision, callouts });
  }

  return results;
}
```

### Step 5: Create API Endpoints

**`endpoints/base-views.endpoint.ts`**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectProductCategory, analyzeBaseView } from "../functions";

export async function POST(req: NextRequest) {
  try {
    const { productId, revisionIds } = await req.json();

    const supabase = await createClient();

    // Get revisions
    const { data: revisions } = await supabase
      .from("product_multiview_revisions")
      .select("*")
      .in("id", revisionIds);

    if (!revisions || revisions.length === 0) {
      return NextResponse.json({ error: "Revisions not found" }, { status: 404 });
    }

    // Detect category from first image
    const category = await detectProductCategory(revisions[0].image_url);

    // Analyze each view
    const analyses = [];
    for (const revision of revisions) {
      const analysis = await analyzeBaseView(
        revision.view_type,
        revision.image_url,
        category.category
      );

      // Store in revision_vision_analysis
      const { data: stored } = await supabase
        .from("revision_vision_analysis")
        .insert({
          product_idea_id: productId,
          revision_id: revision.id,
          view_type: revision.view_type,
          image_url: revision.image_url,
          analysis_data: {
            category: "base_view",
            product_category: category.category,
            ...analysis,
          },
          model_used: "gpt-4o",
          confidence_score: analysis.confidence_scores.overall,
          status: "completed",
        })
        .select()
        .single();

      analyses.push(stored);
    }

    return NextResponse.json({
      success: true,
      data: {
        category: category.category,
        analyses,
        creditsUsed: 3, // BASE_VIEWS cost
      },
    });
  } catch (error) {
    console.error("Base views analysis error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Route Registration:**
```typescript
// app/api/tech-pack-v2/base-views/analyze/route.ts
export { POST } from "@/api/tech-pack-v2/endpoints/base-views.endpoint";

// app/api/tech-pack-v2/close-ups/generate/route.ts
export { POST } from "@/api/tech-pack-v2/endpoints/close-ups.endpoint";

// app/api/tech-pack-v2/sketches/generate/route.ts
export { POST } from "@/api/tech-pack-v2/endpoints/sketches.endpoint";
```

---

## 🔧 Integration Examples

### Complete Workflow Example
```typescript
// 1. User generates base views (existing flow)
// 5 images stored in product_multiview_revisions

// 2. Analyze base views
const baseViewResponse = await fetch("/api/tech-pack-v2/base-views/analyze", {
  method: "POST",
  body: JSON.stringify({
    productId: "uuid",
    revisionIds: ["rev1", "rev2", "rev3", "rev4", "rev5"],
  }),
});

const { data: baseViewData } = await baseViewResponse.json();
// Result: 5 analyses in revision_vision_analysis with AI-extracted tech pack data

// 3. Generate close-ups
const closeUpsResponse = await fetch("/api/tech-pack-v2/close-ups/generate", {
  method: "POST",
  body: JSON.stringify({
    productId: "uuid",
    baseViewAnalyses: baseViewData.analyses,
    category: baseViewData.category,
  }),
});

const { data: closeUpsData } = await closeUpsResponse.json();
// Result: 6-10 close-up images + analyses

// 4. Generate technical sketches
const sketchesResponse = await fetch("/api/tech-pack-v2/sketches/generate", {
  method: "POST",
  body: JSON.stringify({
    productId: "uuid",
    productAnalysis: {
      baseViews: baseViewData.analyses,
      closeUps: closeUpsData.closeups,
    },
    category: baseViewData.category,
  }),
});

const { data: sketchesData } = await sketchesResponse.json();
// Result: 3 technical sketches with callouts

// Total credits used: 3 + 3 + 3 = 9 credits
```

---

## 📚 Documentation References

### Main Documents
1. **`TECH_PACK_V2_BACKEND_ARCHITECTURE.md`** - Complete backend specification
2. **`TECH_FILES_SIMPLIFIED_PLAN.md`** - Database design and data structures
3. **`lib/ai/gemini.ts`** - Image generation service
4. **`lib/services/image-service.ts`** - Image upload and optimization

### Key Database Tables
- **`revision_vision_analysis`** - Primary tech pack data storage
- **`product_multiview_revisions`** - Image storage with revision history
- **`product_ideas`** - Main product container
- **`user_credits`** - Credit management

---

## 🎯 Testing Checklist

- [ ] Category detection accuracy > 95%
- [ ] Base view analysis confidence > 0.85
- [ ] Close-up generation plan quality
- [ ] Technical sketch clarity
- [ ] Callout accuracy and completeness
- [ ] Image upload success rate
- [ ] API response times < targets
- [ ] Credit deduction correctness
- [ ] Error handling and retries
- [ ] Caching via image_hash

---

## 🚨 Common Issues & Solutions

### Issue: Gemini API returns text instead of image
**Solution:** Use fallback prompts (already built into GeminiImageService)

### Issue: OpenAI rate limits
**Solution:** Implement exponential backoff (already in OpenAIClient)

### Issue: Large image upload timeouts
**Solution:** Use `imageService.safeUpload()` with retry logic

### Issue: Duplicate analysis for same image
**Solution:** Check `image_hash` in `revision_vision_analysis` before analyzing

### Issue: Memory issues with batch processing
**Solution:** Use `imageService.uploadBatch()` with `maxConcurrent: 5`

---

## 💡 Pro Tips

1. **Always use existing utilities** - Don't reinvent the wheel
2. **Leverage image_hash caching** - Save costs and improve performance
3. **Background processing** - Use `executeInBackground()` for non-critical tasks
4. **Batch operations** - Process multiple images in parallel with concurrency limits
5. **Error logging** - Use `aiLogger` for all AI operations
6. **Confidence scores** - Guide users when AI confidence is low
7. **Preview before upload** - Show users generated images before committing
8. **Incremental rollout** - Test with small user group first

---

## 📞 Next Steps

1. Create prompt files in `prompts/` directory
2. Implement core functions in `functions/` directory
3. Build API endpoints in `endpoints/` directory
4. Create TypeScript types in `types/` directory
5. Write tests for each function
6. Test complete workflow end-to-end
7. Deploy to staging
8. Monitor performance and costs
9. Iterate based on user feedback
10. Roll out to production

**Ready to build! 🚀**
