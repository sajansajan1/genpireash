# Product-Only Consolidation Plan

## 🎯 Goal

**Use ONLY Progressive workflow. Everything MUST have a product_idea_id.**

**No sessions. No optional product IDs. Product-first architecture.**

---

## 📋 Requirements

1. ✅ **Product ID required** - Everything must have a `product_idea_id`
2. ✅ **Revisions for iterations** - Use `product_multiview_revisions` for tracking
3. ✅ **ONE workflow** - Progressive workflow only
4. ✅ **Delete Stepped** - Remove `stepped-image-generation.ts` completely
5. ✅ **Vision caching** - Already integrated in Progressive

---

## 🏗️ Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                   ALL ENTRY POINTS                      │
│  - AI Designer Module                                   │
│  - Centralized Service                                  │
│  - API Routes                                           │
│  - Idea Generation                                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Ensure Product Exists                         │
│                                                         │
│  If no product_id → Create minimal product entry       │
│  If product_id → Use existing                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Call Progressive Workflow (SINGLE SOURCE)     │
│                                                         │
│  generateFrontViewOnly({                               │
│    productId: productId,  // ← ALWAYS has value        │
│    userPrompt: prompt,                                 │
│    // ...                                              │
│  })                                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│  DATABASE: Single Approval Table                       │
│  - front_view_approvals (product_idea_id NOT NULL)     │
│  - product_multiview_revisions (for iterations)        │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

## 🔧 Implementation

### 1. Helper Function: Auto-Create Product

**File:** `app/actions/ensure-product-exists.ts` (NEW)

\`\`\`typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

/**
 * Ensure a product exists for front view generation
 *
 * If productId is provided → validate it exists
 * If no productId → create minimal product entry
 *
 * @returns Product ID (existing or newly created)
 */
export async function ensureProductExists(params: {
  productId?: string;
  userPrompt: string;
  metadata?: {
    logo?: string;
    designFile?: string;
    category?: string;
    intended_use?: string;
  };
}): Promise<{ productId: string; isNewProduct: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // If productId provided, validate it exists
  if (params.productId) {
    const { data: existing, error } = await supabase
      .from("product_ideas")
      .select("id")
      .eq("id", params.productId)
      .eq("user_id", user.id)
      .single();

    if (error || !existing) {
      throw new Error(`Product ${params.productId} not found`);
    }

    return { productId: params.productId, isNewProduct: false };
  }

  // Create minimal product entry
  const productId = uuidv4();

  const { error: insertError } = await supabase
    .from("product_ideas")
    .insert({
      id: productId,
      user_id: user.id,
      user_prompt: params.userPrompt,
      tech_pack: {
        product_name: extractProductName(params.userPrompt),
        metadata: params.metadata || {},
      },
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    throw new Error(`Failed to create product: ${insertError.message}`);
  }

  console.log(`[Ensure Product] Created new product: ${productId}`);

  return { productId, isNewProduct: true };
}

/**
 * Extract simple product name from user prompt
 */
function extractProductName(prompt: string): string {
  // Take first 50 chars, capitalize
  const name = prompt
    .substring(0, 50)
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return name || "Product";
}
\`\`\`

### 2. Update Centralized Service

**File:** `lib/services/centralized-generation-service.ts`

**BEFORE:**
\`\`\`typescript
import { generateFrontView } from "@/app/actions/stepped-image-generation";

async function generateWithSteppedWorkflow(prompt, config) {
  const frontViewResult = await generateFrontView({
    input: { type: "text", content: prompt },
    options: { logo, style, modifications },
  });

  return frontViewResult;
}
\`\`\`

**AFTER:**
\`\`\`typescript
import { generateFrontViewOnly } from "@/app/actions/progressive-generation-workflow";
import { ensureProductExists } from "@/app/actions/ensure-product-exists";

async function generateWithSteppedWorkflow(prompt, config) {
  // STEP 1: Ensure product exists
  const { productId } = await ensureProductExists({
    productId: config.projectId, // May be undefined
    userPrompt: prompt,
    metadata: {
      logo: config.logo?.image,
    },
  });

  // STEP 2: Use Progressive workflow (always has product_id)
  const frontViewResult = await generateFrontViewOnly({
    productId: productId,  // ← ALWAYS has value
    userPrompt: prompt,
    logoImage: config.logo?.image,
    referenceImageUrl: config.referenceImage,
    isEdit: !!config.modifications,
  });

  return frontViewResult;
}
\`\`\`

### 3. Update API Routes

**File:** `app/api/product-pack-generation/generate-front-view/route.ts`

**BEFORE:**
\`\`\`typescript
import { generateFrontView } from "@/app/actions/stepped-image-generation";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await generateFrontView({
    input: body.input,
    options: body.options,
    sessionId: body.sessionId,
  });

  return NextResponse.json(result);
}
\`\`\`

**AFTER:**
\`\`\`typescript
import { generateFrontViewOnly } from "@/app/actions/progressive-generation-workflow";
import { ensureProductExists } from "@/app/actions/ensure-product-exists";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // STEP 1: Ensure product exists (auto-create if needed)
  const { productId, isNewProduct } = await ensureProductExists({
    productId: body.projectId, // May be undefined for API calls
    userPrompt: body.input.type === "text"
      ? body.input.content
      : "Product from reference image",
    metadata: {
      logo: body.options?.logo?.image,
    },
  });

  // STEP 2: Use Progressive workflow (always has product_id)
  const result = await generateFrontViewOnly({
    productId: productId,  // ← ALWAYS has value
    userPrompt: body.input.type === "text"
      ? body.input.content
      : "Product from reference image",
    referenceImageUrl: body.input.type === "image"
      ? body.input.content
      : undefined,
    logoImage: body.options?.logo?.image,
  });

  return NextResponse.json({
    ...result,
    productId,  // Return product ID for future calls
    isNewProduct,
  });
}
\`\`\`

### 4. Progressive Workflow (No Changes Needed!)

**File:** `app/actions/progressive-generation-workflow.ts`

\`\`\`typescript
// Already requires productId - PERFECT!
export async function generateFrontViewOnly(
  params: {
    productId: string;  // ← NOT OPTIONAL (as it should be)
    userPrompt: string;
    referenceImageUrl?: string;
    logoImage?: string;
    isEdit?: boolean;
  }
): Promise<GenerateFrontViewOnlyResponse> {
  // Existing implementation stays exactly the same
  // Vision caching already integrated ✅
}
\`\`\`

**No changes needed!** The Progressive workflow is already perfect for this architecture.

### 5. Delete Stepped Workflow

**Files to DELETE:**
\`\`\`bash
# Delete the entire stepped workflow
rm app/actions/stepped-image-generation.ts  # ~800 lines

# Delete migration (if not already applied)
rm supabase/migrations/20250830_product_view_approvals.sql
\`\`\`

**Database cleanup:**
\`\`\`sql
-- Drop the table (only if it exists)
DROP TABLE IF EXISTS product_view_approvals CASCADE;
\`\`\`

---

## 📊 Comparison

### Before (2 Workflows)

\`\`\`typescript
// AI Designer → Progressive workflow
await generateFrontViewOnly({
  productId: productId,
  userPrompt: prompt,
});

// Centralized/API → Stepped workflow
await generateFrontView({
  input: { type: "text", content: prompt },
  sessionId: sessionId,  // No product!
});
\`\`\`

**Problems:**
- ❌ Two workflows
- ❌ Two database tables
- ❌ Session-based approvals (no product tracking)
- ❌ Duplicate logic

### After (1 Workflow)

\`\`\`typescript
// ALL flows → Progressive workflow (with auto-product creation)

// AI Designer (has product)
await generateFrontViewOnly({
  productId: existingProductId,
  userPrompt: prompt,
});

// Centralized/API (no product → auto-create)
const { productId } = await ensureProductExists({ userPrompt: prompt });
await generateFrontViewOnly({
  productId: productId,  // ← Auto-created
  userPrompt: prompt,
});
\`\`\`

**Benefits:**
- ✅ ONE workflow
- ✅ ONE database table
- ✅ ALL images tracked to products
- ✅ Revision history for everything
- ✅ Vision caching everywhere

---

## ✅ Benefits

### 1. Product-Centric Architecture
- **Before:** Some images had products, some had sessions
- **After:** ALL images linked to products ✅

### 2. Better Data Structure
- **Before:** `product_view_approvals` (orphaned session data)
- **After:** `front_view_approvals` (always linked to product) ✅

### 3. Revision Tracking
- **Before:** Stepped workflow had no revision tracking
- **After:** ALL generations use `product_multiview_revisions` ✅

### 4. Simpler Code
- **Before:** ~1400 lines (2 workflows)
- **After:** ~700 lines (1 workflow + helper) ✅
- **Deleted:** ~700 lines! ✅

### 5. Vision Caching Everywhere
- **Before:** Only Progressive workflow
- **After:** All workflows (because there's only one!) ✅

---

## 🚀 Migration Steps

1. ✅ Create `ensure-product-exists.ts` helper
2. ✅ Update Centralized Service to use helper + Progressive
3. ✅ Update API routes to use helper + Progressive
4. ✅ Test all flows
5. ✅ Delete `stepped-image-generation.ts`
6. ✅ Drop `product_view_approvals` table
7. ✅ Update documentation

---

## 🎯 Result

**ONE workflow. Product-only. Simple.**

\`\`\`typescript
// Helper ensures product exists
const { productId } = await ensureProductExists({
  productId: maybeProductId,  // Can be undefined
  userPrompt: prompt,
});

// Progressive workflow does the work
await generateFrontViewOnly({
  productId: productId,  // ← ALWAYS defined
  userPrompt: prompt,
});
\`\`\`

**Everything tracked. No sessions. Clean architecture.** ✨

Ready to implement?
