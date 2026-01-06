# Tech Pack V2 - Existing Utilities Analysis

This document analyzes which utilities already exist in the codebase and what needs to be created for Tech Pack V2.

---

## ✅ Already Available (Use These!)

### 1. **OpenAI Vision Client** ✅
**Location**: `lib/services/vision-analysis-service.ts`

**What it provides:**
```typescript
function getOpenAIClient(): OpenAI {
  // Returns OpenAI client with API key from env
}

interface VisionAnalysisParams {
  imageUrl: string;
  productIdeaId?: string;
  userId?: string;
  revisionId?: string;
  viewType?: "front" | "back" | "side" | "detail" | "other";
  sessionId?: string;
  batchId?: string;
}

interface VisionAnalysisResult {
  success: boolean;
  data?: VisionAnalysisData;
  cached?: boolean;
  analysisId?: string;
  error?: string;
}
```

**Features:**
- ✅ OpenAI client initialization
- ✅ Server-side only (secure)
- ✅ Environment variable handling
- ✅ Background execution support
- ✅ Retry logic with exponential backoff
- ✅ Database persistence
- ✅ Type-safe results

**Usage for Tech Pack V2:**
```typescript
import { getOpenAIClient } from "@/lib/services/vision-analysis-service";

const openai = getOpenAIClient();

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
```

---

### 2. **Gemini Image Service** ✅
**Location**: `lib/ai/gemini.ts`

Already documented in architecture - fully available!

---

### 3. **Image Service (Upload & Optimization)** ✅
**Location**: `lib/services/image-service.ts`

Already documented in architecture - fully available!

---

### 4. **Supabase Client** ✅
**Location**: `lib/supabase/server.ts` / `lib/supabase/client.ts`

Already documented in architecture - fully available!

---

### 5. **Background Execution** ✅
**Location**: `lib/utils/background-execution.ts`

Already documented in architecture - fully available!

---

### 6. **AI Logger** ✅
**Location**: `lib/logging/ai-logger.ts`

Already documented in architecture - fully available!

---

### 7. **Cache Operations** ✅
**Location**: `lib/services/vision-analysis-service.ts` (lines 98-200+)

**What it provides:**
- Image hash-based caching in `revision_vision_analysis` table
- Cache lookup before API calls
- Automatic cache storage after analysis
- TTL-based expiration

**Built into vision-analysis-service:**
```typescript
// Check cache before analysis
const cached = await getCachedAnalysis(imageHash, viewType);
if (cached) {
  return { success: true, data: cached.data, cached: true };
}

// Store in cache after analysis
await storeCachedAnalysis({
  imageUrl,
  imageHash,
  data: analysisData,
  viewType,
  productIdeaId,
  userId,
});
```

---

## ❌ Need to Create (New Utilities)

### 1. **Credits Manager** ❌ NEW
**Location**: `api/tech-pack-v2/utils/credits-manager.ts`

**What it needs:**
```typescript
export class CreditsManager {
  /**
   * Check if user has sufficient credits
   */
  async checkCredits(
    userId: string,
    requiredCredits: number
  ): Promise<boolean> {
    const supabase = await createClient();

    const { data: userCredits } = await supabase
      .from("user_credits")
      .select("credits_available")
      .eq("user_id", userId)
      .single();

    return (userCredits?.credits_available || 0) >= requiredCredits;
  }

  /**
   * Deduct credits from user account
   */
  async deductCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<void> {
    const supabase = await createClient();

    // Deduct from user_credits
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
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Refund credits (if operation fails)
   */
  async refundCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.rpc("add_credits", {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) throw error;

    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: amount,
      type: "refund",
      description: `Refund: ${reason}`,
      created_at: new Date().toISOString(),
    });
  }
}

export const creditsManager = new CreditsManager();
```

**Why it's needed:**
- Centralized credit management
- Transaction logging
- Refund support for failed operations
- Consistent error handling

---

### 2. **Image Hash Calculator** ❌ NEW
**Location**: `api/tech-pack-v2/utils/image-hash.ts`

**What it needs:**
```typescript
import crypto from "crypto";

/**
 * Calculate SHA-256 hash of image for caching
 */
export async function calculateImageHash(imageUrl: string): Promise<string> {
  try {
    // Fetch image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate SHA-256 hash
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    return hash;
  } catch (error) {
    console.error("Error calculating image hash:", error);
    throw error;
  }
}

/**
 * Calculate hash from buffer (for already-downloaded images)
 */
export function calculateBufferHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
```

**Why it's needed:**
- Cache lookup in `revision_vision_analysis`
- Prevent duplicate AI analysis of same image
- Cost optimization

**Note:** This functionality exists in `vision-analysis-service.ts` but as internal functions. Extract and expose it.

---

### 3. **Confidence Scorer** ❌ NEW
**Location**: `api/tech-pack-v2/utils/confidence-scorer.ts`

**What it needs:**
```typescript
/**
 * Calculate confidence score based on multiple factors
 */
export interface ConfidenceFactors {
  imageQuality: number; // 0-1 (resolution, clarity)
  completeness: number; // 0-1 (all required fields present)
  consistency: number; // 0-1 (values make sense together)
  validationPassed: boolean;
}

export function calculateConfidenceScore(
  factors: ConfidenceFactors
): number {
  const weights = {
    imageQuality: 0.3,
    completeness: 0.4,
    consistency: 0.2,
    validation: 0.1,
  };

  let score = 0;
  score += factors.imageQuality * weights.imageQuality;
  score += factors.completeness * weights.completeness;
  score += factors.consistency * weights.consistency;
  score += (factors.validationPassed ? 1 : 0) * weights.validation;

  return Math.round(score * 100) / 100; // Round to 2 decimals
}

/**
 * Assess image quality
 */
export async function assessImageQuality(imageUrl: string): Promise<number> {
  // Use image-service to get metadata
  const dimensions = await ImageService.getImageDimensions(imageUrl);

  if (!dimensions) return 0.5; // Default if can't assess

  const { width, height } = dimensions;
  const pixels = width * height;

  // Score based on resolution
  if (pixels > 1000000) return 1.0; // > 1MP = excellent
  if (pixels > 500000) return 0.8; // > 0.5MP = good
  if (pixels > 250000) return 0.6; // > 0.25MP = acceptable
  return 0.4; // Lower = poor
}

/**
 * Check completeness of analysis data
 */
export function checkCompleteness(analysisData: any): number {
  const requiredFields = [
    "detected_features",
    "dimensions",
    "materials_detected",
    "color_analysis",
  ];

  const present = requiredFields.filter(
    (field) => analysisData[field] && Object.keys(analysisData[field]).length > 0
  ).length;

  return present / requiredFields.length;
}

/**
 * Check consistency of values
 */
export function checkConsistency(analysisData: any): number {
  let consistencyScore = 1.0;

  // Example: Check if dimensions make sense
  if (analysisData.dimensions) {
    const dims = analysisData.dimensions;

    // Footwear: heel should be less than total height
    if (dims.heel_height && dims.shaft_height) {
      const heel = parseFloat(dims.heel_height.value);
      const shaft = parseFloat(dims.shaft_height.value);
      if (heel > shaft) consistencyScore -= 0.2;
    }
  }

  // Add more consistency checks as needed

  return Math.max(0, consistencyScore);
}
```

**Why it's needed:**
- User confidence in AI results
- Quality control
- Identify low-quality analysis for manual review
- Guide users when to regenerate

---

### 4. **Input Validation Schemas** ❌ NEW
**Location**: `api/tech-pack-v2/utils/validation.ts`

**What it needs:**
```typescript
import { z } from "zod";

/**
 * Base view analysis request validation
 */
export const BaseViewAnalysisSchema = z.object({
  productId: z.string().uuid(),
  revisionIds: z.array(z.string().uuid()).min(1).max(5),
  category: z.enum(["APPAREL", "FOOTWEAR", "BAGS", "FURNITURE", "JEWELRY"]).optional(),
});

/**
 * Close-up generation request validation
 */
export const CloseUpGenerationSchema = z.object({
  productId: z.string().uuid(),
  baseViewAnalyses: z.array(z.any()).min(1),
  category: z.string(),
  shotCount: z.number().min(6).max(10).optional(),
});

/**
 * Technical sketch generation request validation
 */
export const TechnicalSketchSchema = z.object({
  productId: z.string().uuid(),
  productAnalysis: z.object({
    baseViews: z.array(z.any()),
    closeUps: z.array(z.any()).optional(),
  }),
  category: z.string(),
  views: z.array(z.enum(["front", "back", "side"])).optional(),
});

/**
 * AI edit request validation
 */
export const AIEditSchema = z.object({
  revisionId: z.string().uuid(),
  fieldPath: z.string(),
  editPrompt: z.string().min(1).max(500),
  referenceImageUrl: z.string().url(),
});

/**
 * Regenerate view request validation
 */
export const RegenerateViewSchema = z.object({
  revisionId: z.string().uuid(),
  regeneratePrompt: z.string().min(1).max(1000).optional(),
  replaceCurrent: z.boolean().default(false),
});

/**
 * Validate request and return parsed data
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      };
    }
    return { success: false, error: "Validation failed" };
  }
}
```

**Why it's needed:**
- Type safety at API boundaries
- Clear error messages
- Prevent invalid requests
- Self-documenting API contracts

---

## 📊 Summary

### ✅ Already Available (7/11)
1. OpenAI Vision Client (`vision-analysis-service.ts`)
2. Gemini Image Service (`lib/ai/gemini.ts`)
3. Image Service (`image-service.ts`)
4. Supabase Client (`lib/supabase/*`)
5. Background Execution (`background-execution.ts`)
6. AI Logger (`ai-logger.ts`)
7. Cache Operations (built into `vision-analysis-service.ts`)

### ❌ Need to Create (4/11)
1. **Credits Manager** - New utility for credit management
2. **Image Hash Calculator** - Extract from vision-analysis-service
3. **Confidence Scorer** - New utility for quality assessment
4. **Input Validation** - New schemas using Zod

---

## 🎯 Recommendation

**You already have 64% of the required utilities!** Focus on creating these 4 new utilities:

### Priority 1: Credits Manager
- Essential for cost control
- Needed before any paid operations
- ~100 lines of code

### Priority 2: Input Validation
- Needed for all API endpoints
- Prevents errors early
- ~80 lines of code

### Priority 3: Image Hash Calculator
- Extract existing code from vision-analysis-service
- Make it reusable
- ~30 lines of code

### Priority 4: Confidence Scorer
- Nice-to-have for UX
- Can use simple version initially
- ~120 lines of code

**Total new code needed: ~330 lines across 4 files**

---

## 💡 Next Steps

1. Create the 4 new utility files
2. Update architecture document to reflect existing utilities
3. Use existing `vision-analysis-service.ts` patterns for consistency
4. Test credit deduction flow end-to-end
5. Validate all API requests with Zod schemas
6. Implement confidence scoring progressively
