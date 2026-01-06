# Consolidate to Progressive Workflow - Migration Plan

## 🎯 Goal

**Use ONLY the Progressive workflow everywhere. Delete Stepped workflow.**

**Why:**
- ✅ Better credit model (1 credit for front, 2 for remaining = user-friendly)
- ✅ Better user experience (approve before continuing)
- ✅ Already has Vision caching integrated
- ✅ More flexible (iterative approval)
- ✅ One workflow to maintain instead of two

**Current State:**
- ❌ Progressive workflow (new, better) - Used by AI Designer module
- ❌ Stepped workflow (old, legacy) - Used by Centralized Service, Idea Generation, API routes
- ❌ Two different database tables
- ❌ Duplicate logic

**Target State:**
- ✅ Progressive workflow ONLY
- ✅ One database table (`front_view_approvals`)
- ✅ All flows use the same workflow
- ✅ Stepped workflow deleted

---

## 📊 Current Usage Analysis

### What Calls Stepped Workflow Today:

1. **Centralized Generation Service** (`lib/services/centralized-generation-service.ts`)
   \`\`\`typescript
   import { generateFrontView } from "@/app/actions/stepped-image-generation";

   const frontViewResult = await generateFrontView({...});
   \`\`\`

2. **API Routes** (`app/api/product-pack-generation/generate-front-view/route.ts`)
   \`\`\`typescript
   import { generateFrontView } from "@/app/actions/stepped-image-generation";

   const result = await generateFrontView({...});
   \`\`\`

3. **Idea Generation** (indirect via Centralized Service)
   \`\`\`typescript
   import { generateMultiViewProduct } from "@/lib/services/centralized-generation-service";

   const result = await generateMultiViewProduct(...); // → calls Stepped
   \`\`\`

### What Calls Progressive Workflow Today:

1. **AI Designer Module** (`modules/ai-designer/hooks/useProgressiveGeneration.ts`)
   \`\`\`typescript
   import { generateFrontViewOnly } from "@/app/actions/progressive-generation-workflow";

   const result = await generateFrontViewOnly({...});
   \`\`\`

---

## 🚧 Challenges to Solve

### Challenge 1: Different Database Tables

**Progressive uses:** `front_view_approvals` (product-centric)
\`\`\`sql
CREATE TABLE front_view_approvals (
  id UUID PRIMARY KEY,
  product_idea_id UUID NOT NULL,  -- ← REQUIRES product
  iteration_number INT,
  ...
);
\`\`\`

**Stepped uses:** `product_view_approvals` (session-centric)
\`\`\`sql
CREATE TABLE product_view_approvals (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL,  -- ← No product required
  ...
);
\`\`\`

**Solution:**
- Keep `front_view_approvals` as the single source of truth
- Make `product_idea_id` optional OR auto-create minimal product records
- Add `session_id` to `front_view_approvals` for API compatibility

### Challenge 2: Different Parameters

**Progressive requires:**
\`\`\`typescript
{
  productId: string;  // ← MUST exist
  userPrompt: string;
}
\`\`\`

**Stepped accepts:**
\`\`\`typescript
{
  input: { type: "text" | "image"; content: string };  // ← No product needed
  sessionId?: string;
}
\`\`\`

**Solution:**
- Add optional `productId` parameter to Progressive
- Auto-create minimal product record if not provided
- Use session-based tracking when no product exists

### Challenge 3: API Routes Need Session-Based Flow

**Problem:**
- API routes (`/api/product-pack-generation/generate-front-view`) don't have product context
- External integrations can't create product records
- Need session-only generation

**Solution:**
- Progressive workflow creates temporary product record
- Or: Make `product_idea_id` optional in `front_view_approvals`

---

## 🔄 Migration Strategy

### Option A: Make Progressive Workflow Flexible (RECOMMENDED)

**Modify Progressive to handle both use cases:**

1. **Update `front_view_approvals` table schema:**
   \`\`\`sql
   ALTER TABLE front_view_approvals
   ALTER COLUMN product_idea_id DROP NOT NULL;  -- Make optional

   ALTER TABLE front_view_approvals
   ADD COLUMN session_id UUID;  -- Add session support
   \`\`\`

2. **Update `generateFrontViewOnly` function:**
   \`\`\`typescript
   export async function generateFrontViewOnly(
     params: {
       userPrompt: string;
       productId?: string;  // ← Now optional
       referenceImageUrl?: string;
       logoImage?: string;
       isEdit?: boolean;
       sessionId?: string;  // ← Add session support
     }
   ) {
     // If no productId, use session-based approval
     const approval = await supabase
       .from("front_view_approvals")
       .insert({
         product_idea_id: params.productId || null,  // ← Nullable
         session_id: params.sessionId || uuidv4(),   // ← Use session
         // ...
       });
   }
   \`\`\`

3. **All flows call Progressive:**
   \`\`\`typescript
   // Centralized Service
   await generateFrontViewOnly({
     userPrompt: prompt,
     sessionId: uuidv4(),  // ← No product needed
   });

   // API Routes
   await generateFrontViewOnly({
     userPrompt: body.prompt,
     sessionId: body.sessionId,  // ← No product needed
   });

   // AI Designer (existing)
   await generateFrontViewOnly({
     userPrompt: prompt,
     productId: productId,  // ← Product-based
   });
   \`\`\`

### Option B: Auto-Create Minimal Products

**Auto-create product record for API calls:**

\`\`\`typescript
export async function generateFrontViewOnly(params) {
  let productId = params.productId;

  if (!productId) {
    // Auto-create minimal product for API/session calls
    const product = await createMinimalProductEntry({
      name: "API Generated Product",
      user_prompt: params.userPrompt,
    });
    productId = product.id;
  }

  // Rest of the flow (existing code)
}
\`\`\`

---

## 🎯 RECOMMENDED APPROACH: Option A (Flexible Progressive)

**Why:**
- ✅ Doesn't pollute product_ideas table with API-generated products
- ✅ Session-based approvals work naturally
- ✅ Backward compatible with existing Progressive usage
- ✅ Simpler database (one table vs two)

---

## 📝 Implementation Plan

### Phase 1: Update Database Schema ✅

\`\`\`sql
-- Migration: 20251119_make_progressive_workflow_flexible.sql

-- Make product_idea_id optional (for session-based usage)
ALTER TABLE front_view_approvals
ALTER COLUMN product_idea_id DROP NOT NULL;

-- Add session_id for session-based approvals
ALTER TABLE front_view_approvals
ADD COLUMN IF NOT EXISTS session_id UUID;

-- Add index for session lookups
CREATE INDEX IF NOT EXISTS idx_fva_session_id
ON front_view_approvals(session_id);

-- Add constraint: Must have either product_id OR session_id
ALTER TABLE front_view_approvals
ADD CONSTRAINT check_product_or_session
CHECK (product_idea_id IS NOT NULL OR session_id IS NOT NULL);
\`\`\`

### Phase 2: Update Progressive Workflow Function

**File:** `app/actions/progressive-generation-workflow.ts`

**Changes:**
1. Make `productId` parameter optional
2. Add `sessionId` parameter
3. Handle both product-based and session-based flows
4. Use session_id when no product_id provided

\`\`\`typescript
export interface GenerateFrontViewOnlyParams {
  // ONE of these is required
  productId?: string;  // ← Now optional
  sessionId?: string;  // ← New

  // Rest remains the same
  userPrompt: string;
  referenceImageUrl?: string;
  logoImage?: string;
  isEdit?: boolean;
}

export async function generateFrontViewOnly(params) {
  // Validate: must have either productId or sessionId
  if (!params.productId && !params.sessionId) {
    throw new Error("Either productId or sessionId is required");
  }

  const sessionId = params.sessionId || uuidv4();

  // Fetch metadata (if product exists)
  let logoImage, designFile;
  if (params.productId) {
    const { data: product } = await supabase
      .from("product_ideas")
      .select("tech_pack")
      .eq("id", params.productId)
      .single();

    logoImage = product?.tech_pack?.metadata?.logo;
    designFile = product?.tech_pack?.metadata?.designFile;
  }

  // Generate front view (existing logic)
  const result = await geminiService.generateImage({...});

  // Save approval (now supports both modes)
  const approval = await supabase
    .from("front_view_approvals")
    .insert({
      product_idea_id: params.productId || null,  // ← Nullable
      session_id: sessionId,                       // ← Always set
      front_view_url: uploadedUrl,
      front_view_prompt: prompt,
      status: "pending",
      iteration_number: params.productId ? currentIteration + 1 : 1,
    })
    .select()
    .single();

  return { frontViewUrl: uploadedUrl, approvalId: approval.data.id };
}
\`\`\`

### Phase 3: Update Centralized Service

**File:** `lib/services/centralized-generation-service.ts`

**BEFORE:**
\`\`\`typescript
import { generateFrontView } from "@/app/actions/stepped-image-generation";

const frontViewResult = await generateFrontView({
  input: { type: "text", content: prompt },
  options: { logo, style, modifications },
});
\`\`\`

**AFTER:**
\`\`\`typescript
import { generateFrontViewOnly } from "@/app/actions/progressive-generation-workflow";

const frontViewResult = await generateFrontViewOnly({
  userPrompt: prompt,
  sessionId: uuidv4(),  // ← Session-based (no product)
  logoImage: logo?.image,
  referenceImageUrl: referenceImage,
  isEdit: !!modifications,
});
\`\`\`

### Phase 4: Update API Routes

**File:** `app/api/product-pack-generation/generate-front-view/route.ts`

**BEFORE:**
\`\`\`typescript
import { generateFrontView } from "@/app/actions/stepped-image-generation";

const result = await generateFrontView({
  input: body.input,
  options: body.options,
  sessionId: body.sessionId,
});
\`\`\`

**AFTER:**
\`\`\`typescript
import { generateFrontViewOnly } from "@/app/actions/progressive-generation-workflow";

const result = await generateFrontViewOnly({
  userPrompt: body.input.type === "text"
    ? body.input.content
    : "Product from reference image",
  sessionId: body.sessionId || uuidv4(),  // ← Session-based
  referenceImageUrl: body.input.type === "image" ? body.input.content : undefined,
  logoImage: body.options?.logo?.image,
});
\`\`\`

### Phase 5: Delete Stepped Workflow

**Files to DELETE:**
- ❌ `app/actions/stepped-image-generation.ts` (~800 lines)
- ❌ `supabase/migrations/20250830_product_view_approvals.sql`

**Tables to DROP:**
\`\`\`sql
DROP TABLE IF EXISTS product_view_approvals CASCADE;
\`\`\`

### Phase 6: Update Remaining Views Generation

Currently `generateRemainingViews` exists in stepped workflow. Need to either:
1. Move it to Progressive workflow, OR
2. Keep it standalone (it doesn't generate front views)

**Recommendation:** Keep as standalone service
\`\`\`typescript
// lib/services/remaining-views-generation-service.ts
export async function generateRemainingViews(approvalId: string) {
  // Generate back, side, top, bottom views
  // Works with front_view_approvals table
}
\`\`\`

---

## ✅ Benefits of This Consolidation

### Before (2 Workflows)
- ❌ 2 workflows (~1400 lines total)
- ❌ 2 database tables
- ❌ Duplicate logic
- ❌ Inconsistent credit models
- ❌ Vision caching only in one
- ❌ Hard to maintain

### After (1 Workflow)
- ✅ 1 workflow (~600 lines)
- ✅ 1 database table
- ✅ No duplication
- ✅ Consistent credit model (1 + 2 = user-friendly)
- ✅ Vision caching everywhere
- ✅ Easy to maintain

**Code Reduction:** ~800 lines deleted!

---

## 🚀 Migration Checklist

- [ ] Phase 1: Update database schema
  - [ ] Make `product_idea_id` nullable
  - [ ] Add `session_id` column
  - [ ] Add constraint (product OR session required)
  - [ ] Test schema changes

- [ ] Phase 2: Update Progressive workflow
  - [ ] Make `productId` optional
  - [ ] Add `sessionId` parameter
  - [ ] Handle both modes
  - [ ] Test product-based flow (existing)
  - [ ] Test session-based flow (new)

- [ ] Phase 3: Update Centralized Service
  - [ ] Replace `generateFrontView` with `generateFrontViewOnly`
  - [ ] Update parameter mapping
  - [ ] Test end-to-end

- [ ] Phase 4: Update API Routes
  - [ ] Replace imports
  - [ ] Update parameter mapping
  - [ ] Test API calls

- [ ] Phase 5: Test All Flows
  - [ ] Test AI Designer (product-based)
  - [ ] Test Idea Generation (session-based via Centralized)
  - [ ] Test API routes (session-based)
  - [ ] Verify Vision caching works for all

- [ ] Phase 6: Delete Stepped Workflow
  - [ ] Delete `stepped-image-generation.ts`
  - [ ] Drop `product_view_approvals` table
  - [ ] Delete migration file
  - [ ] Update documentation

- [ ] Phase 7: Cleanup
  - [ ] Remove unused imports
  - [ ] Update tests
  - [ ] Update API documentation

---

## 🎉 Result

**ONE workflow to rule them all:**

\`\`\`typescript
// Progressive workflow handles EVERYTHING
await generateFrontViewOnly({
  userPrompt: "Blue t-shirt",
  productId: productId,      // Product-based (AI Designer)
});

await generateFrontViewOnly({
  userPrompt: "Red bag",
  sessionId: sessionId,       // Session-based (API, Centralized)
});
\`\`\`

**Simpler. Cleaner. Better.** ✨

Ready to implement?
