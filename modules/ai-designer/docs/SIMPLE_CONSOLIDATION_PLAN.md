# Simple Consolidation: Product-First Architecture

## ✅ Confirmed Requirement

**ALL image generation happens AFTER product creation.**

- ✅ AI Designer creates product first
- ✅ Idea Generation creates product first (line 2002)
- ✅ Centralized Service receives productId
- ✅ API routes (should) receive productId

**Therefore:**
- No need for session-based approvals
- No need to auto-create products
- No need for optional productId
- **Just use Progressive workflow everywhere!**

---

## 🎯 Migration Plan (Ultra-Simple)

### Step 1: Update Centralized Service

**File:** `lib/services/centralized-generation-service.ts`

**BEFORE:**
\`\`\`typescript
import { generateFrontView, handleFrontViewApproval, generateAdditionalViews }
  from "@/app/actions/stepped-image-generation";

async function generateWithSteppedWorkflow(prompt: string, config: GenerationConfig) {
  const frontViewResult = await generateFrontView({
    input: processedReferenceImage
      ? { type: "image", content: processedReferenceImage }
      : { type: "text", content: prompt },
    options: { logo, style, modifications },
  });

  // ...handle approval and generate remaining views
}
\`\`\`

**AFTER:**
\`\`\`typescript
import {
  generateFrontViewOnly,
  handleFrontViewApproval,
  generateRemainingViews
} from "@/app/actions/progressive-generation-workflow";

async function generateWithSteppedWorkflow(prompt: string, config: GenerationConfig) {
  // Product ID must be provided in config
  if (!config.projectId) {
    throw new Error("projectId is required for image generation");
  }

  const frontViewResult = await generateFrontViewOnly({
    productId: config.projectId,  // ← Required
    userPrompt: prompt,
    referenceImageUrl: processedReferenceImage,
    logoImage: logo?.image,
    isEdit: !!modifications,
  });

  // ...handle approval and generate remaining views (same functions from Progressive)
}
\`\`\`

### Step 2: Update API Routes (Require productId)

**File:** `app/api/product-pack-generation/generate-front-view/route.ts`

**BEFORE:**
\`\`\`typescript
import { generateFrontView } from "@/app/actions/stepped-image-generation";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await generateFrontView({
    input: body.input,
    options: body.options,
    sessionId: body.sessionId,  // ← Session-based
  });

  return NextResponse.json(result);
}
\`\`\`

**AFTER:**
\`\`\`typescript
import { generateFrontViewOnly } from "@/app/actions/progressive-generation-workflow";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate productId is provided
  if (!body.projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 }
    );
  }

  const result = await generateFrontViewOnly({
    productId: body.projectId,  // ← Required
    userPrompt: body.input.type === "text"
      ? body.input.content
      : "Product from reference image",
    referenceImageUrl: body.input.type === "image"
      ? body.input.content
      : undefined,
    logoImage: body.options?.logo?.image,
  });

  return NextResponse.json(result);
}
\`\`\`

### Step 3: Update Centralized Service Config Interface

**File:** `lib/services/centralized-generation-service.ts`

**BEFORE:**
\`\`\`typescript
export interface GenerationConfig {
  projectId?: string;  // ← Optional
  useSteppedWorkflow?: boolean;
  // ...
}
\`\`\`

**AFTER:**
\`\`\`typescript
export interface GenerationConfig {
  projectId: string;  // ← REQUIRED (not optional)
  useSteppedWorkflow?: boolean;  // Can keep for backward compat, always true
  // ...
}
\`\`\`

### Step 4: Verify Idea Generation Passes productId

**File:** `app/actions/idea-generation.ts` (line 1837)

**Current (already correct):**
\`\`\`typescript
const result = await generateMultiViewProduct(
  user_prompt,
  {
    projectId: existing_project_id,  // ← Already passes it!
    logo: image ? { image } : undefined,
    // ...
  }
);
\`\`\`

**No changes needed!** ✅

### Step 5: Delete Stepped Workflow

**Delete these files:**
\`\`\`bash
rm app/actions/stepped-image-generation.ts  # ~800 lines
rm supabase/migrations/20250830_product_view_approvals.sql
\`\`\`

**Drop database table:**
\`\`\`sql
DROP TABLE IF EXISTS product_view_approvals CASCADE;
\`\`\`

---

## 📊 Summary

### Changes Required:

| File | Change | Complexity |
|------|--------|------------|
| `centralized-generation-service.ts` | Replace `generateFrontView` → `generateFrontViewOnly` | ⚡ Simple |
| `centralized-generation-service.ts` | Make `projectId` required in interface | ⚡ Simple |
| `api/*/generate-front-view/route.ts` | Replace import, require `projectId` | ⚡ Simple |
| `idea-generation.ts` | None (already correct) | ✅ Done |
| `progressive-generation-workflow.ts` | None (already perfect) | ✅ Done |

### Files to Delete:

- ❌ `stepped-image-generation.ts` (~800 lines)
- ❌ `20250830_product_view_approvals.sql`
- ❌ `product_view_approvals` table

### Result:

✅ **ONE workflow**: Progressive only
✅ **Product-first**: All images linked to products
✅ **Vision caching**: Automatic everywhere
✅ **Simpler code**: ~800 lines removed
✅ **No sessions**: Product-only architecture

---

## 🚀 Let's Do It!

This is the SIMPLEST migration possible because:
1. Products are ALWAYS created first ✅
2. Progressive workflow is already perfect ✅
3. Just need to update 2-3 function calls ✅
4. Delete old code ✅

Ready to implement? 🎯
