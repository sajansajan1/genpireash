# Genpire Initial Product Generation Workflow - Complete Journey

**Last Updated:** November 14, 2025  
**Scope:** Full user journey from product creation to first generated views

---

## Overview

This document maps the complete flow of how a user creates their first product in Genpire, from initial entry point through AI processing to first generated design views.

**Key Insight:** The system uses a modular, step-by-step approach where users get immediate feedback through a progress modal while generation happens in the background.

---

## Part 1: User Entry Point

### Location
`/creator-dashboard` (main entry point)  
`/components/idea-upload/page.tsx` (IdeaUploadPage component)

### User Interactions

The user can create a product in two ways:

#### Method 1: Text Description Tab
\`\`\`
1. User clicks "Creator Dashboard" menu
2. Opens IdeaUploadPage with "Text" tab selected
3. Enters product description: "Modern athletic shoe with sustainable materials"
4. (Optional) Adds:
   - Category: "Footwear"
   - Intended Use: "Athletic"
   - Style Keywords: ["minimalist", "modern"]
   - Color Palette: ["white", "blue", "green"]
   - Product Goal: "commercial-large"
5. Clicks "Generate" or "Generate Tech Pack"
\`\`\`

#### Method 2: Image Upload Tab
\`\`\`
1. User switches to "Image" tab
2. Uploads a design file (PNG/JPG, <5MB)
3. System validates file signature (checks for fake files)
4. Displays preview
5. Enters description of the design
6. Clicks "Generate Tech Pack" button
\`\`\`

#### Method 3: Quick Start (AI Designer)
\`\`\`
1. User navigates to /ai-designer
2. Clicks "New Design" button
3. Enters simple prompt: "Modern athletic shoe"
4. System creates minimal entry immediately
5. Redirects to editor for progressive generation
\`\`\`

**Credit Check (Line 539):**
\`\`\`typescript
if ((credits?.credits ?? 0) < 3) {
  toast: "No Credits left! Please purchase Credits"
  return
}
\`\`\`
Minimum 3 credits required for initial generation.

---

## Part 2: Pre-Generation Setup

### Step 1: Build Initial Chat Message
**Location:** `idea-upload/page.tsx:315-427`

Comprehensive message constructed with:
- Brand DNA (if enabled): brand_name, tagline, target_audience, style keywords, colors, tone
- Product Idea: user's text description
- Category & Intended Use
- Style Keywords (comma-separated)
- Color Palette
- Product Goals
- File attachments indicators

Example Message:
\`\`\`
=== BRAND DNA ===
Brand Name: EcoSports
Tagline: Sustainable Performance
...
=== END BRAND DNA ===

Product Idea: Modern athletic shoe with sustainable materials
Category: Footwear
Intended Use: Athletic
Style Keywords: minimalist, modern
Color Palette: white, blue, green
\`\`\`

### Step 2: Create Minimal Product Entry
**Location:** `app/actions/create-product-entry.ts:22-84`  
**Function:** `createMinimalProductEntry()`

**Purpose:** Create database entry BEFORE any AI processing for immediate redirect

**Database Insert:**
\`\`\`typescript
const productData = {
  user_id: user.id,
  prompt: initialMessage,           // Full context message
  status: "generating",              // Initial status
  tech_pack: { metadata: {...} },   // Metadata storage
  image_data: {                      // Placeholder structure
    front: { url: "", prompt_used: "" },
    back: { url: "", prompt_used: "" },
    side: { url: "", prompt_used: "" },
  },
  created_at: now,
  updated_at: now
}

await supabase.from("product_ideas").insert([productData]).select().single()
\`\`\`

**Returns:**
\`\`\`typescript
{
  success: true,
  projectId: "uuid-1234...",  // IMPORTANT: Used for all future operations
  data: insertedProduct        // Full row
}
\`\`\`

**Time:** <100ms (just database insert)

### Step 3: Create Chat Session
**Location:** `app/actions/chat-session.ts`  
**Function:** `createChatSession()`

Stores initial message in chat history for user context during editing.

\`\`\`typescript
const chatSession = await createChatSession({
  productId: projectId,
  userId: user.id,
  initialMessage,           // The comprehensive message from Step 1
  productData: productEntry.data
})
\`\`\`

### Step 4: Show Progress Modal & Redirect
**Location:** `idea-upload/page.tsx:672-689`

\`\`\`typescript
startProgress()  // Start showing progress modal

toast({
  title: "Project created!",
  description: "Opening AI Designer..."
})

// Add query params for auto-generation
const params = new URLSearchParams({
  projectId,
  autoGenerate: "true",
  generateMoreViews: "true",
  version: "modular"
})

setTimeout(() => {
  router.push(`/ai-designer?${params.toString()}`)
}, 500)
\`\`\`

**Time to here:** ~1-2 seconds total ✓ User sees instant response

---

## Part 3: AI Designer Initialization

### Location
`/app/ai-designer/designer.tsx` (page wrapper)  
`/modules/ai-designer` (modular implementation)

### Step 1: Parse URL Parameters
**Location:** `designer.tsx:126-138`

\`\`\`typescript
const urlParams = useMemo(() => ({
  id: searchParams?.get("projectId"),        // Project ID
  autoGenerate: searchParams?.get("autoGenerate") === "true",
  generateMoreViews: searchParams?.get("generateMoreViews") === "true",
  version: searchParams?.get("version")
}), [...])
\`\`\`

### Step 2: Load Project & Initialize
**Location:** `designer.tsx:176-301`  
**Function:** `loadProjectAndInitialize(id, { autoGenerate, generateMoreViews })`

\`\`\`typescript
// Fetch project from database
const { data: project } = await supabase
  .from("product_ideas")
  .select("*")
  .eq("id", projectId)
  .single()

// Extract metadata
const metadata = project.tech_pack?.metadata || {}
const hasLogo = metadata.logo && metadata.logo !== ""
const hasDesignFile = metadata.designFile && metadata.designFile !== ""
const prompt = project.prompt || ""

// Check if images already exist
const hasExistingImages = project.image_data?.front?.url

if (!hasExistingImages) {
  // Set initial generation flag
  setIsInitialGeneration(true)
  setInitialPrompt(prompt)
  setEditorOpen(true)
  
  // If autoGenerate flag, store preference
  sessionStorage.setItem(
    `generation-preference-${id}`,
    JSON.stringify({ generateMoreViews })
  )
}
\`\`\`

---

## Part 4: Image Generation Pipeline

### Step 1: User Triggers Generation

**Option A: Auto-generation** (from upload flow)
- Editor detects `isInitialGeneration = true`
- Automatically calls `handleInitialGenerationWithProgress()`

**Option B: Manual generation** (user clicks "Generate")
- User clicks generate button in editor
- Calls `handleInitialGenerationWithProgress(prompt)`

### Step 2: Generate Images via Centralized Service
**Location:** `app/ai-designer/designer.tsx:303-501`  
**Function:** `handleInitialGenerationWithProgress()`

\`\`\`typescript
const result = await generateIdea({
  user_prompt: prompt,
  existing_project_id: projectId,
  regenerate_image_only: true,
  image: metadata.logo,           // Optional logo
  designFile: metadata.designFile // Optional design reference
})
\`\`\`

### Step 3: Core Image Generation Engine
**Location:** `app/actions/idea-generation.ts:1548-1700+`  
**Function:** `generateIdea()` - Main orchestrator

\`\`\`typescript
export async function generateIdea({
  user_prompt,           // Initial prompt from user
  existing_project_id,   // Project ID for saving
  regenerate_image_only, // Focus on images only
  image,                 // Logo
  designFile             // Design reference
}) {
  // 1. Validate user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Fetch existing project if updating
  let existingProject = null
  if (existing_project_id) {
    const { data } = await supabase
      .from("product_ideas")
      .select("*")
      .eq("id", existing_project_id)
      .single()
    existingProject = data
  }
  
  // 3. Call image generation function
  const imageResult = await regenerateImageData({
    basePrompt: user_prompt,
    generateMoreImages: true,  // Generate 5 views
    referenceImage: designFile,
    logoImage: image,
    projectId: existing_project_id,
    existingProject: existingProject
  })
  
  // 4. Save all images to Supabase Storage
  const frontUrl = await saveImageToSupabase(imageResult.front.url, path)
  const backUrl = await saveImageToSupabase(imageResult.back.url, path)
  const sideUrl = await saveImageToSupabase(imageResult.side.url, path)
  const topUrl = await saveImageToSupabase(imageResult.top.url, path)
  const bottomUrl = await saveImageToSupabase(imageResult.bottom.url, path)
  
  // 5. Update database with image URLs
  await supabase
    .from("product_ideas")
    .update({
      image_data: {
        front: { url: frontUrl, prompt_used: ... },
        back: { url: backUrl, prompt_used: ... },
        side: { url: sideUrl, prompt_used: ... },
        top: { url: topUrl, prompt_used: ... },
        bottom: { url: bottomUrl, prompt_used: ... }
      },
      status: "images_generated"
    })
    .eq("id", existing_project_id)
  
  // 6. Create initial revision (Revision 0)
  const revisionResult = await createInitialProductRevision({
    productId: existing_project_id,
    views: { front: frontUrl, back: backUrl, side: sideUrl, top: topUrl, bottom: bottomUrl },
    userPrompt: user_prompt
  })
  
  return {
    success: true,
    image: {
      front: { url: frontUrl, prompt_used: ... },
      back: { url: backUrl, prompt_used: ... },
      side: { url: sideUrl, prompt_used: ... },
      top: { url: topUrl, prompt_used: ... },
      bottom: { url: bottomUrl, prompt_used: ... }
    },
    project_id: existing_project_id
  }
}
\`\`\`

### Step 4: Stepped Workflow for Image Generation
**Location:** `lib/services/centralized-generation-service.ts:127-237`

The actual generation uses a **stepped workflow** for quality consistency:

#### Flow Step 1: Generate Front View
**Function:** `generateFrontView()`  
**Location:** `app/actions/stepped-image-generation.ts:70-270`

\`\`\`typescript
// 1. Reserve credits (3 for initial generation)
const creditReservation = await ReserveCredits({ credit: 3 })

// 2. Build detailed front view prompt
const frontViewPrompt = buildFrontViewPrompt(params)

// 3. Call Gemini Image API
const result = await geminiService.generateImage({
  prompt: frontViewPrompt,
  referenceImage: params.input.type === "image" ? content : undefined,
  logoImage: params.options?.logo?.image,
  view: "front",
  style: "photorealistic"
})

// 4. Upload front view to Supabase Storage
const uploadResult = await imageService.upload(result.url, {
  projectId: params.projectId,
  preset: "original",
  preserveOriginal: true
})

// 5. Create approval record in database
const approval = await supabase
  .from("product_view_approvals")
  .insert({
    user_id: user.id,
    front_view_url: uploadResult.url,
    front_view_prompt: frontViewPrompt,
    status: "pending"
  })
  .select()
  .single()

return {
  success: true,
  approvalId: approval.id,
  frontView: { url: uploadResult.url, prompt: frontViewPrompt }
}
\`\`\`

**Return:** 
- `approvalId`: Used to reference this front view
- `frontView`: The generated front view URL

#### Flow Step 2: Auto-Approve Front View
**Function:** `handleFrontViewApproval()`  
**Location:** `app/actions/stepped-image-generation.ts:275-380`

\`\`\`typescript
// System automatically approves (no user wait)
const approval = await supabase
  .from("product_view_approvals")
  .update({
    status: "approved",
    feedback: "Auto-approved by system"
  })
  .eq("id", approvalId)
  .select()
  .single()

return { success: true }
\`\`\`

**Why:** Front view becomes reference for consistent back/side/top/bottom generation

#### Flow Step 3: Generate Additional Views
**Function:** `generateAdditionalViews(approvalId)`  
**Location:** `app/actions/stepped-image-generation.ts:380-500+`

\`\`\`typescript
// Fetch the approved front view
const approval = await supabase
  .from("product_view_approvals")
  .select("*")
  .eq("id", approvalId)
  .single()

const frontViewUrl = approval.front_view_url

// Generate back view using front as reference
const backResult = await geminiService.generateImage({
  prompt: "Back view based on approved design",
  referenceImage: frontViewUrl,  // KEY: Use front as reference
  view: "back"
})

// Generate side view
const sideResult = await geminiService.generateImage({
  prompt: "Side view based on approved design",
  referenceImage: frontViewUrl,
  view: "side"
})

// Generate top view
const topResult = await geminiService.generateImage({
  prompt: "Top view based on approved design",
  referenceImage: frontViewUrl,
  view: "top"
})

// Generate bottom view
const bottomResult = await geminiService.generateImage({
  prompt: "Bottom view based on approved design",
  referenceImage: frontViewUrl,
  view: "bottom"
})

// Upload all views
const uploadedViews = {
  back: await uploadImage(backResult),
  side: await uploadImage(sideResult),
  top: await uploadImage(topResult),
  bottom: await uploadImage(bottomResult)
}

return {
  success: true,
  views: uploadedViews
}
\`\`\`

**Why Stepped Workflow:**
- ✓ Front view establishes product identity
- ✓ Other views maintain consistency
- ✓ Auto-approval prevents user waiting
- ✓ All views reference front for coherence

---

## Part 5: First Revision Creation

### Step 1: Create Initial Revision (Revision 0)
**Location:** `app/actions/create-initial-product-revision.ts:23-195`  
**Function:** `createInitialProductRevision()`

This is called automatically after images are generated.

\`\`\`typescript
export async function createInitialProductRevision({
  productId,        // The project UUID
  views: {          // All 5 generated views
    front,
    back,
    side,
    top,
    bottom
  },
  userPrompt,       // Original user prompt
  productName       // Extracted product name
}) {
  // 1. Generate batch ID for grouping all views
  const batchId = `initial_${productId}_${Date.now()}`
  
  // 2. Create revision records for each view
  const revisionRecords = [
    {
      product_idea_id: productId,
      revision_number: 0,        // Initial revision
      batch_id: batchId,         // Groups all 5 views
      view_type: "front",
      image_url: views.front,
      edit_type: "initial",
      ai_model: "gemini-2.5-flash-image-preview",
      is_active: true,
      metadata: {
        productName,
        initial_generation: true,
        created_from: "product_creation"
      }
    },
    {
      product_idea_id: productId,
      revision_number: 0,
      batch_id: batchId,
      view_type: "back",
      image_url: views.back,
      // ... same structure
    },
    // ... repeat for side, top, bottom
  ]
  
  // 3. Insert all 5 records in one batch
  const { data: revisions } = await supabase
    .from("product_multiview_revisions")
    .insert(revisionRecords)
    .select()
  
  return {
    success: true,
    revisionId: revisions[0].id,
    revisionIds: revisions.map(r => r.id),
    batchId
  }
}
\`\`\`

### Database Structure After Generation

**Table:** `product_ideas`
\`\`\`
id: uuid-1234...
user_id: user-uuid
prompt: "=== BRAND DNA ===..." (full initial message)
status: "images_generated"
tech_pack: { metadata: { ... } }
image_data: {
  front: { url: "https://storage/.../front.jpg", prompt_used: "..." },
  back: { url: "https://storage/.../back.jpg", prompt_used: "..." },
  side: { url: "https://storage/.../side.jpg", prompt_used: "..." },
  top: { url: "https://storage/.../top.jpg", prompt_used: "..." },
  bottom: { url: "https://storage/.../bottom.jpg", prompt_used: "..." }
}
created_at: 2025-11-14T10:00:00Z
updated_at: 2025-11-14T10:02:30Z
\`\`\`

**Table:** `product_multiview_revisions` (Revision 0)
\`\`\`
| id  | product_idea_id | revision_number | batch_id        | view_type | image_url         | edit_type | is_active |
|-----|-----------------|-----------------|-----------------|-----------|-------------------|-----------|-----------|
| r1  | uuid-1234...    | 0               | initial-1234... | front     | https://.../f.jpg | initial   | true      |
| r2  | uuid-1234...    | 0               | initial-1234... | back      | https://.../b.jpg | initial   | true      |
| r3  | uuid-1234...    | 0               | initial-1234... | side      | https://.../s.jpg | initial   | true      |
| r4  | uuid-1234...    | 0               | initial-1234... | top       | https://.../t.jpg | initial   | true      |
| r5  | uuid-1234...    | 0               | initial-1234... | bottom    | https://.../bo.jpg | initial  | true      |
\`\`\`

---

## Part 6: Display in Editor

### Step 1: Update Local State
**Location:** `app/ai-designer/designer.tsx:366-390`

\`\`\`typescript
// Update images in state
const images = {
  front: result.image.front?.url || "",
  back: result.image.back?.url || "",
  side: result.image.side?.url || "",
  top: result.image.top?.url || "",
  bottom: result.image.bottom?.url || ""
}
setProductImages(images)

// Update tech pack if available
if (result.techpack) {
  setTechPack(result.techpack)
  setProductName(result.techpack.productName || "Product")
}

// Load revisions from database
const revisionsResult = await getGroupedMultiViewRevisions(projectId)
setMultiViewRevisions(revisionsResult.revisions)

// Mark initial generation complete
setIsInitialGeneration(false)
\`\`\`

### Step 2: Display Revisions
**Location:** `modules/ai-designer/components/`  
**Function:** `getGroupedMultiViewRevisions()`  
**Location:** `app/actions/ai-image-edit-new-table.ts:1012-1109`

\`\`\`typescript
// Query all revisions (not deleted)
const { data: revisions } = await supabase
  .from('product_multiview_revisions')
  .select('*')
  .eq('product_idea_id', productId)
  .or('is_deleted.is.null,is_deleted.eq.false')

// Group by batch_id
const batches = new Map()
revisions.forEach((rev) => {
  const batchId = rev.batch_id
  
  if (!batches.has(batchId)) {
    batches.set(batchId, {
      id: batchId,
      revisionNumber: 0,
      views: {},
      editPrompt: "Original AI-generated images",
      editType: "generated",
      isActive: true
    })
  }
  
  batches.get(batchId).views[rev.view_type] = {
    imageUrl: rev.image_url,
    revisionId: rev.id
  }
})

return Array.from(batches.values()).sort((a, b) => 
  b.revisionNumber - a.revisionNumber
)
\`\`\`

**Returns:**
\`\`\`typescript
[
  {
    id: "initial-1234...",
    revisionNumber: 0,
    views: {
      front: { imageUrl: "https://.../f.jpg", revisionId: "r1" },
      back: { imageUrl: "https://.../b.jpg", revisionId: "r2" },
      side: { imageUrl: "https://.../s.jpg", revisionId: "r3" },
      top: { imageUrl: "https://.../t.jpg", revisionId: "r4" },
      bottom: { imageUrl: "https://.../bo.jpg", revisionId: "r5" }
    },
    editPrompt: "Original AI-generated images",
    editType: "generated",
    createdAt: "2025-11-14T10:02:30Z",
    isActive: true
  }
]
\`\`\`

---

## Part 7: AI Tools & Services Used

### Image Generation: Gemini API
**Service:** `lib/ai/gemini.ts`  
**Model:** `gemini-2.5-flash-image-preview`

**Capabilities:**
- Text-to-image generation
- Image-to-image with reference images
- Multi-view consistency (using front as reference)
- Style control (photorealistic, technical, vector)
- Logo integration

**Called By:**
- `stepped-image-generation.ts` for front/back/side/top/bottom

### Text Processing: OpenAI API
**Model:** `gpt-4o` and `gpt-4o-mini`

**Used For:**
- Tech pack generation (from text prompt)
- Image prompt enhancement
- Section updates (materials, dimensions, care instructions)

**Flow:**
\`\`\`
Initial Prompt
  → Enhance for AI image generation
  → Generate Tech Pack JSON
  → Create vision-focused product description
\`\`\`

### Image Upload: Supabase Storage
**Bucket:** `product-images`  
**Path Structure:** `{projectId}/{viewType}-{timestamp}.jpg`

**Features:**
- Optimized image format conversion
- WebP generation for performance
- Public URL generation
- Caching control (3600 seconds)

---

## Complete Timeline Example

User: "Create a modern minimalist watch"

| Time | Action | Duration |
|------|--------|----------|
| T+0s | User clicks "Generate" | - |
| T+0.1s | Form validation | 100ms |
| T+0.2s | Create minimal DB entry | 200ms |
| T+0.3s | Create chat session | 100ms |
| T+0.5s | Toast "Opening AI Designer..." | - |
| T+1s | Show progress modal | - |
| T+1.5s | **Generation starts** | - |
| T+2s | **Front view generated** (Gemini) | 20-30s |
| T+32s | **Front auto-approved** | <1s |
| T+32.5s | **Back view generated** | 20-30s |
| T+60s | **Side view generated** | 20-30s |
| T+88s | **Top view generated** | 20-30s |
| T+115s | **Bottom view generated** | 20-30s |
| T+142s | All views uploaded to storage | 10-15s |
| T+157s | Initial revision created (Revision 0) | 2-3s |
| T+160s | **Images displayed in editor** | - |

**Total:** ~2.5-3 minutes for complete initial generation

---

## Data Flow Diagram

\`\`\`
┌─────────────────────────────────────────────┐
│ User enters product idea                    │
│ /creator-dashboard or /ai-designer          │
└────────────┬────────────────────────────────┘
             │
             ├─→ [Step 1] Build initial chat message
             │   (includes brand DNA, metadata)
             │
             ├─→ [Step 2] Create minimal DB entry
             │   (product_ideas table)
             │   projectId = UUID
             │
             ├─→ [Step 3] Create chat session
             │   (stores context)
             │
             └─→ [Step 4] Redirect with autoGenerate=true
                         to /ai-designer?projectId={id}
                         
                         │
                         ├─→ [Step 5] Load project from DB
                         │
                         ├─→ [Step 6] Trigger auto-generation
                         │   
                         │   ┌─ STEPPED WORKFLOW
                         │   │
                         │   ├─→ [Step 6a] Generate Front View
                         │   │   (Gemini + Prompt Enhancement)
                         │   │   └─→ Upload to Supabase Storage
                         │   │   └─→ Create approval record
                         │   │
                         │   ├─→ [Step 6b] Auto-Approve Front
                         │   │
                         │   ├─→ [Step 6c] Generate Back
                         │   │   (using front as reference)
                         │   │   └─→ Upload to Storage
                         │   │
                         │   ├─→ [Step 6d] Generate Side
                         │   │   (using front as reference)
                         │   │   └─→ Upload to Storage
                         │   │
                         │   ├─→ [Step 6e] Generate Top
                         │   │   (using front as reference)
                         │   │   └─→ Upload to Storage
                         │   │
                         │   └─→ [Step 6f] Generate Bottom
                         │       (using front as reference)
                         │       └─→ Upload to Storage
                         │
                         ├─→ [Step 7] Create Initial Revision
                         │   (product_multiview_revisions table)
                         │   batch_id = initial_{projectId}_{timestamp}
                         │   revision_number = 0
                         │   is_active = true
                         │   (creates 5 records, one per view)
                         │
                         └─→ [Step 8] Display in MultiViewEditor
                             (all 5 views visible)
                             (revision history shows Revision 0)

Database Tables After Generation:
┌─────────────────────────┐
│ product_ideas           │
├─────────────────────────┤
│ id: projectId           │
│ user_id: ...            │
│ prompt: ...             │
│ status: images_generated│
│ image_data: {5 views}   │
│ tech_pack: {}           │
└─────────────────────────┘
                │
                ├─→ ┌─────────────────────────────┐
                │   │ product_multiview_revisions │
                │   ├─────────────────────────────┤
                │   │ [5 records - Revision 0]    │
                │   │ - front, back, side         │
                │   │ - top, bottom               │
                │   │ batch_id: initial_...       │
                │   │ is_active: true             │
                │   └─────────────────────────────┘
                │
                └─→ ┌─────────────────────────────┐
                    │ chat_sessions               │
                    ├─────────────────────────────┤
                    │ product_id: projectId       │
                    │ user_id: ...                │
                    │ initialMessage: ...         │
                    │ (for context during edits)  │
                    └─────────────────────────────┘
\`\`\`

---

## Credit System

### Initial Generation Cost
- **3 credits** per initial product generation
- Reserved at start of front view generation
- Refunded if generation fails

### Where Credits Are Reserved
**Location:** `app/actions/stepped-image-generation.ts:97`

\`\`\`typescript
const creditReservation = await ReserveCredits({ credit: 3 })
\`\`\`

### Credit States
1. **Reserved:** Credits held when generation starts
2. **Consumed:** Credits deducted when generation completes successfully
3. **Refunded:** Credits returned if generation fails

---

## Error Handling & Recovery

### Common Failure Points

**1. Insufficient Credits**
\`\`\`typescript
if ((credits?.credits ?? 0) < 3) {
  → Toast: "No Credits left!"
  → Return without generation
}
\`\`\`

**2. Image Generation Failure**
\`\`\`typescript
if (!frontViewResult.success) {
  → Refund reserved credits
  → Return error to user
  → Show retry toast
}
\`\`\`

**3. Database Insert Failure**
\`\`\`typescript
if (revisionError) {
  → Log error details
  → Use fallback temporary storage if Supabase down
  → Inform user to retry
}
\`\`\`

**4. Timeout Protection**
\`\`\`typescript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() =>
    reject(new Error("Request timeout after 3 minutes")), 
    180000
  )
)

const result = await Promise.race([
  generatePromise,
  timeoutPromise
])
\`\`\`

---

## Progress Tracking

### Progress Modal States
**Location:** `components/generation-progress-modal.tsx`  
**Hook:** `hooks/use-generation-progress.ts`

\`\`\`typescript
const {
  isLoading,
  currentStep,        // "Generating Front View", etc.
  stepProgress,       // 0-100% for current step
  elapsedTime,        // Seconds elapsed
  currentFunFact,     // Rotating fun facts
  generatedImages,    // Images as they're generated
  startProgress,
  stopProgress,
  updateGeneratedImages
} = useGenerationProgress()
\`\`\`

### Steps Shown
1. "Generating Front View..."
2. "Approving Design..."
3. "Generating Back View..."
4. "Generating Side View..."
5. "Generating Top View..."
6. "Generating Bottom View..."
7. "Finalizing Product..."

---

## Key Technical Insights

### Why This Architecture?

1. **Immediate Feedback**
   - Minimal DB entry created instantly (1-2 seconds)
   - User sees editor immediately, not waiting for AI
   - Progress modal shows real-time status

2. **Stepped Workflow Benefits**
   - Front view sets product identity
   - Other views maintain consistency (reference front)
   - Auto-approval eliminates user waiting
   - Each view can be regenerated independently

3. **Modular Design**
   - Create entry → Chat session → Generation → Revision
   - Each step can fail independently
   - Easier to test and debug
   - Flexible for future enhancements

4. **Data Integrity**
   - Revision 0 immutable (initial generation)
   - All edits create new revisions (1, 2, 3...)
   - Batch IDs group multi-view operations
   - User can revert to any previous revision

---

## Testing Points

### Must Test
- [ ] Credit check before generation
- [ ] Minimal entry creation succeeds
- [ ] Chat session stores initial message
- [ ] Auto-generation triggers correctly
- [ ] All 5 views generate successfully
- [ ] Revision 0 created with correct batch ID
- [ ] Images display in editor
- [ ] Revision history loads correctly

### Edge Cases
- [ ] Generation timeout after 3 minutes
- [ ] Network interruption mid-generation
- [ ] Supabase storage failure (use fallback)
- [ ] Multiple simultaneous generation requests
- [ ] User closes tab during generation
- [ ] Missing required fields (category, colors)

---

**End of Document**

Generated: 2025-11-14
Version: 1.0
