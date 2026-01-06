# create-product-entry.ts Documentation

## Overview

Server actions module for managing product entries in the database. This file provides lightweight database operations that are separate from the heavy AI generation logic in `idea-generation.ts`.

**File Location:** `/app/actions/create-product-entry.ts`

**Type:** Next.js Server Actions (marked with `"use server"`)

---

## Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    User Entry Points                         │
├─────────────────────────────────────────────────────────────┤
│  /creator-dashboard     │  /ai-designer/{id}                │
│  (IdeaUploadPage)       │  (MultiViewEditor)                │
└────────┬────────────────┴──────────────┬────────────────────┘
         │                               │
         v                               v
┌────────────────────┐         ┌─────────────────────┐
│  generateIdea()    │         │ createMinimal...()  │
│  (Full Generation) │         │ (Quick Start)       │
└────────┬───────────┘         └─────────┬───────────┘
         │                               │
         v                               v
┌─────────────────────────────────────────────────────────────┐
│              product_ideas Table (Supabase)                  │
│  Columns: id, user_id, prompt, tech_pack, image_data,       │
│           status, created_at, updated_at                     │
└─────────────────────────────────────────────────────────────┘
         │                               │
         v                               v
┌────────────────────┐         ┌─────────────────────┐
│ updateProduct...() │         │ getTechPackFor...() │
│ (Save Images)      │         │ (Generate TP)       │
└────────────────────┘         └─────────────────────┘
\`\`\`

---

## Exported Functions

### 1. `createMinimalProductEntry(data)`

**Purpose:** Creates a minimal database entry WITHOUT generating tech pack or images

**Location:** Lines 21-83

#### Parameters

\`\`\`typescript
interface CreateProductEntryData {
  user_prompt: string;        // User's product description
  category?: string;          // Product category (e.g., "Footwear")
  intended_use?: string;      // Use case (e.g., "Athletic")
  style_keywords?: string[];  // Style tags (e.g., ["modern", "minimalist"])
  image?: string;             // Logo/brand image (base64)
  selected_colors?: string[]; // Color palette
  product_goal?: string;      // Product objectives
  designFile?: string;        // Uploaded design file (base64)
  userId: string;             // Authenticated user ID
}
\`\`\`

#### Returns

\`\`\`typescript
{
  success: boolean;
  projectId?: string;  // UUID of created product
  data?: object;       // Full product data
  error?: string;      // Error message if failed
}
\`\`\`

#### Database Operation

Creates entry in `product_ideas` table:

\`\`\`json
{
  "user_id": "uuid",
  "prompt": "User's original prompt",
  "status": "generating",
  "tech_pack": {
    "metadata": {
      "category": "...",
      "style_keywords": [...],
      "designFile": "base64...",
      "logo": "base64...",
      "selected_colors": [...],
      "product_goal": "..."
    }
  },
  "image_data": {
    "front": { "url": "", "prompt_used": "" },
    "back": { "url": "", "prompt_used": "" },
    "side": { "url": "", "prompt_used": "" }
  }
}
\`\`\`

#### Usage Example

**File:** `app/ai-designer/designer.tsx` (Line 788)

\`\`\`typescript
const result = await createMinimalProductEntry({
  user_prompt: "Modern athletic shoe",
  userId: user.id,
});

if (result.success && result.projectId) {
  // Immediately redirect to editor for image generation
  router.push(`/ai-designer/${result.projectId}`);
}
\`\`\`

#### Flow Diagram

\`\`\`
User clicks "New Design"
        ↓
createMinimalProductEntry()
        ↓
Create DB row with:
  - Empty images
  - Status: 'generating'
  - Metadata stored
        ↓
Return projectId
        ↓
Redirect to /ai-designer/{projectId}
        ↓
Generate images in MultiViewEditor
\`\`\`

---

### 2. `updateProductImages(projectId, images)`

**Purpose:** Updates an existing product entry with generated images

**Location:** Lines 88-114

#### Parameters

\`\`\`typescript
projectId: string;  // Product UUID
images: {
  front?: { url: string; prompt_used?: string };
  back?: { url: string; prompt_used?: string };
  side?: { url: string; prompt_used?: string };
  top?: { url: string; prompt_used?: string };
  bottom?: { url: string; prompt_used?: string };
};
\`\`\`

#### Returns

\`\`\`typescript
{
  success: boolean;
  error?: string;
}
\`\`\`

#### Database Operation

Updates `product_ideas` table:

\`\`\`typescript
{
  image_data: images,              // Set image URLs
  status: 'images_generated',      // Update status
  updated_at: new Date().toISOString()
}
\`\`\`

#### Usage Example

\`\`\`typescript
const images = {
  front: { url: "https://...", prompt_used: "front view of..." },
  back: { url: "https://...", prompt_used: "back view of..." },
  side: { url: "https://...", prompt_used: "side view of..." }
};

await updateProductImages(projectId, images);
\`\`\`

---

### 3. `getProductMetadata(projectId)`

**Purpose:** Retrieves stored metadata from a product entry

**Location:** Lines 119-165

#### Parameters

\`\`\`typescript
projectId: string;  // Product UUID
\`\`\`

#### Returns

\`\`\`typescript
{
  success: boolean;
  metadata?: {
    designFile?: string;        // Base64 or URL
    logo?: string;              // Base64 or URL
    category?: string;
    style_keywords?: string[];
    intended_use?: string;
    selected_colors?: string[];
    product_goal?: string;
  };
  error?: string;
}
\`\`\`

#### Key Features

- **Data Cleaning:** Removes `undefined` and empty string values
- **Null Safety:** Prevents preload errors from invalid data
- **Metadata Extraction:** Pulls from `tech_pack.metadata` field

#### Usage Example

**File:** `app/ai-designer/designer.tsx` (Line 12)

\`\`\`typescript
const { metadata } = await getProductMetadata(projectId);

if (metadata?.designFile) {
  // Preload uploaded design
  setDesignPreview(metadata.designFile);
}

if (metadata?.logo) {
  // Display brand logo
  setLogoPreview(metadata.logo);
}
\`\`\`

---

### 4. `generateTechPackForProduct(projectId, revision?)`

**Purpose:** Generates a tech pack from existing product images (with optional revision support)

**Location:** Lines 170-331

#### Parameters

\`\`\`typescript
projectId: string;
revision?: {
  id: string;              // Revision batch_id or UUID
  revisionNumber: number;  // Revision #1, #2, etc.
  editPrompt?: string;     // User's edit instructions
  views: {
    front?: { imageUrl: string; revisionId?: string };
    back?: { imageUrl: string; revisionId?: string };
    side?: { imageUrl: string; revisionId?: string };
    top?: { imageUrl: string; revisionId?: string };
    bottom?: { imageUrl: string; revisionId?: string };
  };
};
\`\`\`

#### Returns

\`\`\`typescript
{
  success: boolean;
  techPack?: object;       // Generated tech pack JSON
  revisionUsed?: number;   // Which revision was used
  techPackId?: string;     // UUID from product_tech_packs table
  error?: string;
}
\`\`\`

#### Logic Flow

\`\`\`
1. Fetch product from database
        ↓
2. Determine images to use:
   - IF revision provided → Use revision images
   - ELSE → Use original product images
        ↓
3. Construct AI prompt:
   - Base prompt from product
   - Add revision context if applicable
   - Include image analysis instructions
        ↓
4. Call generateIdea() with:
   - regenerate_techpack_only: true
   - updated_images: revision or original images
        ↓
5. Save tech pack to TWO locations:
   a) product_ideas.tech_pack (legacy)
   b) product_tech_packs table (new)
        ↓
6. Return success with tech pack data
\`\`\`

#### Revision Context Example

When revision is provided, the prompt becomes:

\`\`\`
Original Prompt: "Modern athletic shoe with sustainable materials"

+ Revision Context:
"This tech pack is based on Revision #3 with the following modifications:
Changed sole color to neon green, added reflective strips on heel"

+ Image Analysis Instructions:
"Please analyze the provided product images from Revision #3 and generate
a comprehensive tech pack that accurately reflects:
- Colors visible in these specific images
- Materials and textures shown in these views
- Dimensions and proportions from these product views
- Construction details visible in the images
- Any design modifications or features present in this revision

Generate a complete, production-ready tech pack based on these actual
product images."
\`\`\`

#### Usage Example

**File:** `app/ai-designer/designer.tsx` (Line 744)

\`\`\`typescript
// User clicks "Generate Tech Pack" button
const handleGenerateTechPack = async (selectedRevision?: any) => {
  toast({
    title: "Generating Tech Pack",
    description: selectedRevision
      ? `Generating from Revision #${selectedRevision.revisionNumber}...`
      : "Please wait...",
  });

  const result = await generateTechPackForProduct(
    projectId,
    selectedRevision
  );

  if (result.success) {
    toast({
      title: "Success!",
      description: `Tech pack generated from Revision #${result.revisionUsed}`,
    });
    router.push(`/tech-pack-maker/${projectId}`);
  }
};
\`\`\`

#### Tech Pack Saving Strategy

Saves to **two locations** for backward compatibility:

1. **Legacy:** `product_ideas.tech_pack` column
   - Single JSONB field
   - Historical approach
   - Easy to query

2. **New:** `product_tech_packs` table
   - Separate table with relationships
   - Links to revisions via `revision_id` or `revision_number`
   - Better data normalization
   - Versioning support

\`\`\`typescript
// Extract actual revision UUID from views
let actualRevisionId = null;
if (revision?.views) {
  const firstView = Object.values(revision.views).find(v => v?.revisionId);
  if (firstView) {
    actualRevisionId = firstView.revisionId;
  }
}

// Save to new table with revision linking
const saveResult = await saveTechPackForRevision(
  projectId,
  actualRevisionId,      // UUID or null
  revision?.revisionNumber || null,
  techPackResult.techpack
);
\`\`\`

---

## User Flows

### Flow 1: Upload Design → Generate Tech Pack

**Entry Point:** `/creator-dashboard` → Upload Design Tab

\`\`\`
┌─────────────────────────────────────────────────────────┐
│ 1. User uploads design file (PNG/JPG)                   │
│    - File validated (<5MB, valid format)                │
│    - Converted to base64 preview                        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. User enters description (optional)                   │
│    - Product details                                    │
│    - Category, colors, keywords                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Click "Generate Tech Pack"                           │
│    - handleSubmit(null, false)                          │
│    - generateMoreImages: false (only 3 views)           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. generateIdea() called with:                          │
│    {                                                    │
│      user_prompt: description,                          │
│      designFile: base64Image,                           │
│      category, colors, etc.                             │
│    }                                                    │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 5. AI Processing:                                       │
│    a) Analyze uploaded design with GPT-4o-mini          │
│    b) Generate tech pack JSON                           │
│    c) Generate 3 product views (front/back/side)        │
│    d) Save to product_ideas table                       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Redirect to /tech-pack-maker/{projectId}             │
│    - Display generated tech pack                        │
│    - Show 3 product views                               │
└─────────────────────────────────────────────────────────┘
\`\`\`

**Code Reference:**
- Component: `/components/idea-upload/page.tsx`
- Submit Handler: Line 302 (`handleSubmit`)
- API Call: Line 354 (`generateIdea`)
- Redirect: Line 408

---

### Flow 2: Text Prompt → Generate Product

**Entry Point:** `/creator-dashboard` → Text Tab

\`\`\`
┌─────────────────────────────────────────────────────────┐
│ 1. User enters text description                         │
│    - "Modern athletic shoe with sustainable materials"  │
│    - Optional: category, colors, keywords               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Click "Generate Tech Pack"                           │
│    - handleSubmit(null, false)                          │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. generateIdea() processes:                            │
│    a) Generate tech pack from text                      │
│    b) Generate 3 product view images                    │
│    c) Save everything to database                       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Redirect to tech-pack-maker                          │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

### Flow 3: Quick Start → Multi-View Editor

**Entry Point:** `/ai-designer` → New Design

\`\`\`
┌─────────────────────────────────────────────────────────┐
│ 1. User enters simple prompt                            │
│    - Minimal input required                             │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. createMinimalProductEntry()                          │
│    - Create DB entry instantly                          │
│    - No AI generation yet                               │
│    - Status: 'generating'                               │
│    - Empty image placeholders                           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Return projectId immediately                         │
│    - Fast user experience                               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Redirect to /ai-designer/{projectId}                 │
│    - Load MultiViewEditor                               │
│    - Fetch metadata with getProductMetadata()           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Generate images in editor                            │
│    - User can chat and refine                           │
│    - Generate individual views                          │
│    - Create revisions                                   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 6. updateProductImages()                                │
│    - Save generated images to DB                        │
│    - Status: 'images_generated'                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 7. User clicks "Generate Tech Pack"                     │
│    - generateTechPackForProduct(projectId, revision)    │
│    - Analyze current images                             │
│    - Generate tech pack JSON                            │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 8. Redirect to /tech-pack-maker/{projectId}             │
└─────────────────────────────────────────────────────────┘
\`\`\`

**Code References:**
- Create Entry: `designer.tsx` line 788
- Load Metadata: `designer.tsx` line 12
- Generate Tech Pack: `designer.tsx` line 744

---

## Function Comparison Matrix

| Function | Creates Entry? | Generates Images? | Generates Tech Pack? | Updates Images? | Use Case |
|----------|---------------|-------------------|---------------------|-----------------|----------|
| `createMinimalProductEntry` | ✅ Yes | ❌ No | ❌ No | ❌ No | Quick start for editor |
| `getProductMetadata` | ❌ No | ❌ No | ❌ No | ❌ No | Fetch saved metadata |
| `updateProductImages` | ❌ No | ❌ No | ❌ No | ✅ Yes | Save generated images |
| `generateTechPackForProduct` | ❌ No | ❌ No | ✅ Yes | ❌ No | Generate tech pack only |
| `generateIdea` (external) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Full generation pipeline |

---

## Database Schema

### `product_ideas` Table

\`\`\`sql
CREATE TABLE product_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  prompt TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  tech_pack JSONB,
  image_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### `product_tech_packs` Table (New)

\`\`\`sql
CREATE TABLE product_tech_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES product_ideas(id),
  revision_id UUID REFERENCES product_revisions(id),
  revision_number INTEGER,
  tech_pack_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

## Concurrency & Race Conditions

### Problem Scenarios

#### Scenario 1: Double-Click "Generate Tech Pack"

\`\`\`
Time: 0s  - User clicks "Generate Tech Pack" → Request A starts
Time: 1s  - User clicks again (impatient) → Request B starts
Time: 3s  - Request A: Reads product from DB (gets data v1)
Time: 3.5s - Request B: Reads product from DB (gets data v1)
Time: 10s - Request A: AI generates techpack_A
Time: 12s - Request B: AI generates techpack_B (different result)
Time: 13s - Request A: Updates DB with techpack_A
Time: 14s - Request B: Updates DB with techpack_B ❌ OVERWRITES A
\`\`\`

**Result:** Last write wins - techpack_A is lost!

#### Scenario 2: Multiple Browser Tabs

\`\`\`
User opens 2 tabs with /ai-designer/{same-project-id}
Both tabs call generateTechPackForProduct(projectId)
→ Race condition (same as above)
\`\`\`

#### Scenario 3: Concurrent Edits from Shared Project

\`\`\`
If two users somehow share a project URL:
User A clicks "Analyze" with annotations
User B clicks "Analyze" with different annotations
→ Both generate screenshots
→ Last one to finish overwrites the first
\`\`\`

### Current Protections

✅ **User ID Isolation:**
\`\`\`typescript
.eq("user_id", user.id)  // Line 1526 in idea-generation.ts
\`\`\`
- Prevents users from modifying each other's projects
- Each user can only access their own data

❌ **No Protection Against:**
- Double-clicking same button
- Multiple browser tabs on same project
- Concurrent requests to same project from same user

### Recommended Solutions

#### Solution 1: Frontend Loading State (Partial Implementation)

**Already Implemented for Analyze Button:**

\`\`\`typescript
// In useAIMicroEdits.tsx
const [isApplying, setIsApplying] = useState(false);

const handleApplyEdits = async () => {
  if (isApplying) return; // Prevent double-click
  setIsApplying(true);
  try {
    // ... processing
  } finally {
    setIsApplying(false);
  }
};
\`\`\`

**Still Needed For:**
- "Generate Tech Pack" button in MultiViewEditor
- "Generate Tech Pack" button in designer.tsx
- "Generate" button in IdeaUploadPage

#### Solution 2: Database Optimistic Locking

**Add version column:**

\`\`\`sql
ALTER TABLE product_ideas ADD COLUMN version INTEGER DEFAULT 1;
\`\`\`

**Update logic:**

\`\`\`typescript
// Read with version
const { data: product } = await supabase
  .from('product_ideas')
  .select('*, version')
  .eq('id', projectId)
  .single();

const currentVersion = product.version;

// Update with version check
const { data, error } = await supabase
  .from('product_ideas')
  .update({
    tech_pack: techpack,
    version: currentVersion + 1,  // Increment
    updated_at: new Date().toISOString(),
  })
  .eq('id', projectId)
  .eq('version', currentVersion);  // Only if version matches

if (error || !data || data.length === 0) {
  // Someone else updated it - conflict!
  throw new Error('Product was modified. Please refresh and try again.');
}
\`\`\`

#### Solution 3: Server-Side Request Deduplication

**Create lock utility:**

\`\`\`typescript
// utils/request-locks.ts
const activeLocks = new Map<string, Promise<any>>();

export async function withLock<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  // If already processing this key, return existing promise
  if (activeLocks.has(key)) {
    console.log(`⚠️ Request already in progress for: ${key}`);
    return activeLocks.get(key)!;
  }

  // Create new lock
  const promise = fn().finally(() => {
    activeLocks.delete(key);
  });

  activeLocks.set(key, promise);
  return promise;
}
\`\`\`

**Usage in generateTechPackForProduct:**

\`\`\`typescript
export async function generateTechPackForProduct(
  projectId: string,
  revision?: any
) {
  return withLock(`techpack-${projectId}`, async () => {
    // Existing generation code here
    // Only one request per project will execute at a time
    // Subsequent requests will wait for the first to complete
  });
}
\`\`\`

### Risk Assessment

**Current Risk Level:** 🟡 **MEDIUM**

**Low Risk When:**
- Single user per project (normal use case)
- User doesn't double-click
- User doesn't open multiple tabs

**High Risk When:**
- Impatient users double-clicking
- Multiple browser tabs open
- Network delays causing timeout retries
- Shared project URLs (if implemented)

### Implementation Priority

1. **High Priority (Immediate):**
   - ✅ Add loading states to ALL generation buttons
   - Prevent UI-level double submissions

2. **Medium Priority (Next Sprint):**
   - 🟡 Add optimistic locking with version column
   - Better error messages for conflicts

3. **Nice to Have (Future):**
   - 🟢 Server-side request deduplication
   - Request queue visualization
   - Real-time conflict detection

---

## Error Handling

### Database Errors

\`\`\`typescript
if (error) {
  console.error('Error creating product entry:', error);
  return { success: false, error: error.message };
}
\`\`\`

All functions return consistent error format:
\`\`\`typescript
{ success: false, error: string }
\`\`\`

### Not Found Errors

\`\`\`typescript
if (fetchError || !product) {
  return { success: false, error: 'Product not found' };
}
\`\`\`

### Unexpected Errors

\`\`\`typescript
catch (error) {
  console.error('Unexpected error:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
\`\`\`

---

## Performance Considerations

### Fast Operations (< 100ms)
- `createMinimalProductEntry` - Just database insert
- `getProductMetadata` - Single SELECT query
- `updateProductImages` - Single UPDATE query

### Slow Operations (10-30s)
- `generateTechPackForProduct` - Calls AI generation
  - Depends on image analysis time
  - JSON parsing and validation
  - Two database writes

### Optimization Tips

1. **Preload metadata early:**
   \`\`\`typescript
   // Load metadata while user is viewing UI
   useEffect(() => {
     getProductMetadata(projectId).then(setMetadata);
   }, [projectId]);
   \`\`\`

2. **Batch database operations:**
   \`\`\`typescript
   // Update multiple fields in single query
   await supabase.from('product_ideas').update({
     image_data: images,
     status: 'completed',
     updated_at: new Date()
   });
   \`\`\`

3. **Use loading indicators:**
   \`\`\`typescript
   const [isGenerating, setIsGenerating] = useState(false);
   // Show progress to user during long operations
   \`\`\`

---

## Testing Checklist

### Unit Tests

- [ ] `createMinimalProductEntry` creates valid DB entry
- [ ] `createMinimalProductEntry` handles missing userId
- [ ] `getProductMetadata` returns cleaned data
- [ ] `getProductMetadata` handles non-existent project
- [ ] `updateProductImages` updates correct fields
- [ ] `generateTechPackForProduct` uses correct revision

### Integration Tests

- [ ] Upload design → Generate tech pack (full flow)
- [ ] Text prompt → Generate product (full flow)
- [ ] Quick start → Multi-view editor (full flow)
- [ ] Generate tech pack from revision
- [ ] Handle concurrent requests (race condition test)

### Edge Cases

- [ ] Invalid file formats
- [ ] Missing required fields
- [ ] Database connection failures
- [ ] AI generation timeouts
- [ ] Malformed revision data

---

## Related Files

- **Main Generation Logic:** `/app/actions/idea-generation.ts`
- **Tech Pack Management:** `/app/actions/tech-pack-management.ts`
- **Revision System:** `/app/actions/ai-image-edit-new-table.ts`
- **Upload Component:** `/components/idea-upload/page.tsx`
- **Multi-View Editor:** `/app/ai-designer/designer.tsx`
- **Tech Pack Viewer:** `/app/tech-pack-maker/page.tsx`

---

## Migration Notes

### Legacy vs New Approach

**Before (Legacy):**
\`\`\`typescript
// Everything in one giant generateIdea() call
const result = await generateIdea({
  user_prompt,
  // ... 20+ parameters
});
// User waits 30+ seconds for everything
\`\`\`

**After (Modular):**
\`\`\`typescript
// 1. Quick database entry
const { projectId } = await createMinimalProductEntry(data);

// 2. Redirect immediately (better UX)
router.push(`/ai-designer/${projectId}`);

// 3. Generate images incrementally in editor
// 4. Generate tech pack on-demand
await generateTechPackForProduct(projectId);
\`\`\`

### Benefits of New Approach

✅ **Faster Initial Load:** User sees editor immediately
✅ **Better Error Handling:** Failures isolated to specific steps
✅ **Incremental Progress:** User can start editing before everything is done
✅ **Flexibility:** Can skip unnecessary steps (e.g., don't need all 5 views)
✅ **Better Code Organization:** Separation of concerns

---

## Changelog

### Version 1.0 (Current)
- Initial implementation with 4 core functions
- Support for revision-based tech pack generation
- Dual tech pack storage (legacy + new table)
- Metadata cleaning and validation

### Planned Improvements
- [ ] Add optimistic locking
- [ ] Server-side request deduplication
- [ ] Rate limiting per user
- [ ] Caching for frequently accessed metadata
- [ ] Webhook notifications for long operations

---

## Support & Troubleshooting

### Common Issues

**Issue:** "Product not found" error
- **Cause:** Invalid projectId or user doesn't own project
- **Fix:** Verify projectId and user authentication

**Issue:** Race condition (data overwrite)
- **Cause:** Multiple concurrent requests
- **Fix:** Implement optimistic locking or request deduplication

**Issue:** Tech pack generation timeout
- **Cause:** AI service taking too long
- **Fix:** Increase timeout, add retry logic, or use background jobs

### Debug Logging

Enable detailed logging:
\`\`\`typescript
console.log('🎯 generateTechPackForProduct - Starting:', {
  projectId,
  hasRevision: !!revision,
  revisionNumber: revision?.revisionNumber
});
\`\`\`

Look for these log patterns:
- 🎯 = Function entry point
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning
- 📝 = Important data

---

**Last Updated:** 2025-10-03
**Maintained By:** Development Team
**Related Docs:** See PRODUCT_FLOW_DOCUMENTATION.md for complete user flows
