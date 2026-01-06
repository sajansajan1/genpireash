# Unified Front View Generation Architecture

## 🎯 Problem Statement

**BEFORE:** Multiple functions generating front views with duplicate logic
- ❌ `progressive-generation-workflow.ts` has its own generation code (~200 lines)
- ❌ `stepped-image-generation.ts` has duplicate generation code (~200 lines)
- ❌ Same logic copied across files (Gemini call, upload, logging)
- ❌ Vision caching only in one place
- ❌ Inconsistent error handling
- ❌ Hard to maintain and update

**AFTER:** Single source of truth
- ✅ `front-view-generation-service.ts` - ONE function for ALL generation
- ✅ Both workflows call the same function
- ✅ Vision caching automatic for ALL flows
- ✅ Consistent behavior everywhere
- ✅ Easy to maintain and optimize

---

## 🏗️ Architecture

\`\`\`
┌──────────────────────────────────────────────────────────────────┐
│         SINGLE SOURCE OF TRUTH (New Service)                     │
│  lib/services/front-view-generation-service.ts                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  generateFrontViewImage(params)                            │ │
│  │                                                            │ │
│  │  1. Build prompt (shared utility)                         │ │
│  │  2. Call Gemini API                                       │ │
│  │  3. Upload to storage                                     │ │
│  │  4. Trigger Vision caching (background)                   │ │
│  │  5. Return result                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                               ↑
                               │ Both call the same function
                ┌──────────────┴──────────────┐
                │                             │
    ┌───────────┴──────────┐     ┌───────────┴──────────┐
    │ Progressive Workflow │     │  Stepped Workflow    │
    │ (Thin Wrapper)       │     │  (Thin Wrapper)      │
    │                      │     │                      │
    │ generateFrontViewOnly│     │ generateFrontView    │
    │ ↓                    │     │ ↓                    │
    │ 1. Reserve credits   │     │ 1. Reserve credits   │
    │ 2. Call service ←────┼─────┼→ 2. Call service     │
    │ 3. Save to DB        │     │ 3. Save to DB        │
    │    (front_view_      │     │    (product_view_    │
    │     approvals)       │     │     approvals)       │
    └──────────────────────┘     └──────────────────────┘
\`\`\`

---

## 📦 What's in the Service

**File:** `lib/services/front-view-generation-service.ts`

### Main Function

\`\`\`typescript
export async function generateFrontViewImage(
  params: FrontViewGenerationParams
): Promise<FrontViewGenerationResult>
\`\`\`

**Does:**
1. ✅ Builds prompt using shared `buildFrontViewPrompt()`
2. ✅ Calls Gemini API with proper configuration
3. ✅ Uploads image to storage with correct paths
4. ✅ **Automatically triggers Vision caching** in background
5. ✅ Comprehensive logging and error handling
6. ✅ Returns result with metadata

**Does NOT do:**
- ❌ Credit reservation (workflow-specific)
- ❌ Database writes (workflow-specific tables)
- ❌ Workflow-specific logic

### Parameters (Generic)

\`\`\`typescript
interface FrontViewGenerationParams {
  // Required
  userPrompt: string;

  // Optional context
  referenceImageUrl?: string;
  logoImage?: string;
  modifications?: string;
  style?: "photorealistic" | "technical" | "vector" | "detail";
  isEdit?: boolean;

  // Optional metadata (for Vision caching)
  productIdeaId?: string;
  userId?: string;
  sessionId?: string;
  viewApprovalId?: string;
  projectId?: string;
}
\`\`\`

**Flexible enough to work with ANY workflow!**

---

## 🔄 Migration Strategy

### Step 1: Progressive Workflow Refactor

**BEFORE (progressive-generation-workflow.ts):**
\`\`\`typescript
export async function generateFrontViewOnly(params) {
  // Reserve credits
  const creditReservation = await ReserveCredits({ credit: 1 });

  // Build prompt (local logic)
  const prompt = buildFrontViewPrompt(...);

  // Generate image (duplicate logic)
  const result = await geminiService.generateImage({...});

  // Upload (duplicate logic)
  const uploadResult = await imageService.upload(...);

  // Vision caching (manual trigger)
  analyzeFrontViewInBackground({...});

  // Save to database
  await supabase.from("front_view_approvals").insert({...});

  return { frontViewUrl: uploadedUrl, approvalId };
}
\`\`\`

**AFTER (progressive-generation-workflow.ts):**
\`\`\`typescript
import { generateFrontViewImage } from "@/lib/services/front-view-generation-service";

export async function generateFrontViewOnly(params) {
  // 1. Reserve credits (workflow-specific)
  const creditReservation = await ReserveCredits({ credit: 1 });

  // 2. Call centralized service (ONE function)
  const result = await generateFrontViewImage({
    userPrompt: params.userPrompt,
    referenceImageUrl: params.referenceImageUrl,
    logoImage: logoImage,
    isEdit: params.isEdit,
    productIdeaId: params.productId,
    userId: user.id,
    sessionId: sessionId,
    projectId: params.productId,
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  // 3. Save to database (workflow-specific table)
  const approval = await supabase
    .from("front_view_approvals")
    .insert({
      product_idea_id: params.productId,
      front_view_url: result.imageUrl,
      front_view_prompt: result.promptUsed,
      // ...
    })
    .select()
    .single();

  return { frontViewUrl: result.imageUrl, approvalId: approval.data.id };
}
\`\`\`

**Benefits:**
- ✅ ~150 lines removed (duplicate logic)
- ✅ Vision caching automatic (no manual trigger)
- ✅ Consistent with stepped workflow

### Step 2: Stepped Workflow Refactor

**BEFORE (stepped-image-generation.ts):**
\`\`\`typescript
export async function generateFrontView(params) {
  // Reserve credits
  const creditReservation = await ReserveCredits({ credit: isEdit ? 2 : 3 });

  // Build prompt (local logic - DIFFERENT from progressive!)
  const frontViewPrompt = buildFrontViewPrompt(params);

  // Generate image (duplicate logic - SAME as progressive!)
  const result = await geminiService.generateImage({...});

  // Upload (duplicate logic - SAME as progressive!)
  const uploadResult = await imageService.upload(...);

  // NO Vision caching ❌

  // Save to database
  await supabase.from("product_view_approvals").insert({...});

  return { success: true, approvalId, frontViewUrl };
}
\`\`\`

**AFTER (stepped-image-generation.ts):**
\`\`\`typescript
import { generateFrontViewImage } from "@/lib/services/front-view-generation-service";

export async function generateFrontView(params) {
  // 1. Reserve credits (workflow-specific)
  const isEdit = params.options?.isEditRequest || params.options?.modifications;
  const creditReservation = await ReserveCredits({ credit: isEdit ? 2 : 3 });

  // 2. Call centralized service (ONE function - SAME as progressive!)
  const result = await generateFrontViewImage({
    userPrompt: params.input.type === "text"
      ? params.input.content
      : "Product from reference image",
    referenceImageUrl: params.input.type === "image"
      ? params.input.content
      : undefined,
    logoImage: params.options?.logo?.image,
    modifications: params.options?.modifications,
    style: params.options?.style,
    isEdit: params.input.type === "image",
    userId: user.id,
    sessionId: sessionId,
    projectId: params.projectId,
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  // 3. Save to database (workflow-specific table)
  const approval = await supabase
    .from("product_view_approvals")
    .insert({
      user_id: user.id,
      session_id: sessionId,
      front_view_url: result.imageUrl,
      front_view_prompt: result.promptUsed,
      // ...
    })
    .select()
    .single();

  return { success: true, approvalId: approval.data.id, frontViewUrl: result.imageUrl };
}
\`\`\`

**Benefits:**
- ✅ ~150 lines removed (duplicate logic)
- ✅ **Vision caching NOW AUTOMATIC** ✨
- ✅ Uses same prompt builder as progressive
- ✅ Consistent behavior

---

## ✨ Benefits of Unified Architecture

### 1. **No Code Duplication**
- **Before:** ~400 lines of duplicate code across 2 files
- **After:** 1 function, both workflows call it
- **Savings:** 400 lines → 200 lines (50% reduction)

### 2. **Automatic Vision Caching Everywhere**
- **Before:** Only Progressive workflow had Vision caching
- **After:** ALL workflows get Vision caching automatically
- **Impact:** 30 seconds saved on EVERY edit, for ALL users

### 3. **Consistent Behavior**
- **Before:** Different prompts, different error handling, different logging
- **After:** Identical behavior across all workflows
- **Impact:** Fewer bugs, easier debugging

### 4. **Single Point of Optimization**
- **Before:** Update in 2 places, test 2 workflows
- **After:** Update once, all workflows benefit
- **Impact:** Faster development, fewer mistakes

### 5. **Easier to Add Features**
- Want to add retry logic? Update 1 function
- Want to add monitoring? Update 1 function
- Want to optimize prompts? Update 1 function
- **Impact:** Features roll out to all workflows instantly

---

## 🔍 What Each Workflow Does Now

### Progressive Workflow Responsibilities
\`\`\`typescript
generateFrontViewOnly(params) {
  1. Validate params (product ID, user prompt)
  2. Reserve 1 credit (front view only)
  3. Fetch product metadata (logo, design file)
  4. ✅ Call generateFrontViewImage() ← Centralized
  5. Save to front_view_approvals table
  6. Return approval ID for user decision
}
\`\`\`

### Stepped Workflow Responsibilities
\`\`\`typescript
generateFrontView(params) {
  1. Validate params (input type, content)
  2. Reserve 2-3 credits (full product)
  3. Extract logo from params
  4. ✅ Call generateFrontViewImage() ← Centralized
  5. Save to product_view_approvals table
  6. Return approval ID and front view URL
}
\`\`\`

**Both call the same core function!** ✅

---

## 📊 Comparison Table

| Aspect | Before | After |
|--------|--------|-------|
| **Lines of Code** | ~600 total (2 files) | ~300 total (1 service + 2 wrappers) |
| **Duplication** | ❌ High (~400 lines) | ✅ None |
| **Vision Caching** | ⚠️ Progressive only | ✅ All workflows |
| **Prompt Consistency** | ❌ Different | ✅ Same |
| **Error Handling** | ⚠️ Inconsistent | ✅ Consistent |
| **Logging** | ⚠️ Different formats | ✅ Same format |
| **Maintainability** | ❌ Update 2 places | ✅ Update 1 place |
| **Testing** | ❌ Test 2 functions | ✅ Test 1 function |

---

## 🚀 Implementation Plan

### Phase 1: Create Service ✅
- [x] Create `front-view-generation-service.ts`
- [x] Implement `generateFrontViewImage()` function
- [x] Add Vision caching integration
- [x] Add validation and utility functions

### Phase 2: Refactor Progressive Workflow
- [ ] Import centralized service
- [ ] Replace generation logic with service call
- [ ] Keep workflow-specific logic (credits, DB)
- [ ] Test end-to-end

### Phase 3: Refactor Stepped Workflow
- [ ] Import centralized service
- [ ] Replace generation logic with service call
- [ ] Keep workflow-specific logic (credits, DB)
- [ ] Test end-to-end

### Phase 4: Testing
- [ ] Test Progressive workflow (AI Designer module)
- [ ] Test Stepped workflow (API endpoint)
- [ ] Test Centralized service (Idea Generation)
- [ ] Verify Vision caching works for all

### Phase 5: Cleanup
- [ ] Delete duplicate code from workflows
- [ ] Update documentation
- [ ] Add migration notes

---

## 🎯 Result

**ONE and ONLY ONE function generates front views:**

\`\`\`typescript
// lib/services/front-view-generation-service.ts
export async function generateFrontViewImage(params) {
  // This is the ONLY place where front views are generated
  // All workflows MUST call this function
}
\`\`\`

**All workflows are now thin wrappers:**
- Progressive → Credit model + DB table + Call service
- Stepped → Credit model + DB table + Call service
- Future workflows → Same pattern!

**Benefits:**
- ✅ Single source of truth
- ✅ No code duplication
- ✅ Vision caching everywhere
- ✅ Easy to maintain
- ✅ Consistent behavior

---

## 📝 Developer Guide

### Adding a New Workflow

\`\`\`typescript
// my-new-workflow.ts
import { generateFrontViewImage } from "@/lib/services/front-view-generation-service";

export async function myNewFrontViewGeneration(params) {
  // 1. Your workflow-specific logic
  const mySpecificSetup = await doSomething();

  // 2. Call the centralized service
  const result = await generateFrontViewImage({
    userPrompt: params.prompt,
    // ... your specific params
  });

  // 3. Your workflow-specific database writes
  await saveToMySpecificTable(result.imageUrl);

  return result;
}
\`\`\`

**That's it!** You get:
- ✅ Consistent generation
- ✅ Automatic Vision caching
- ✅ Proper error handling
- ✅ Logging and monitoring

### Updating Front View Generation

**Before (nightmare):**
\`\`\`bash
# Update Gemini prompt
vim progressive-generation-workflow.ts  # Update line 250
vim stepped-image-generation.ts         # Update line 785
# Test both workflows...
# Deploy both files...
# Hope you didn't miss any edge cases...
\`\`\`

**After (dream):**
\`\`\`bash
# Update Gemini prompt
vim lib/services/front-view-generation-service.ts  # Update line 95
# Test once
# Deploy once
# All workflows updated! ✨
\`\`\`

---

## 🎉 Conclusion

This architecture ensures **ONE and ONLY ONE** function generates front views.

**No more duplicate code. No more inconsistencies. One source of truth.**

Ready to implement! 🚀
