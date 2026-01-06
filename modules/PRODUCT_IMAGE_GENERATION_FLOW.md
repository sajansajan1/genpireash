# Product Image Generation & Storage Flow

## Overview
This document explains the complete flow of how product images are generated, stored, and used in the Genpire AI Designer system.

---

## 1. Initial Product Generation Flow

### Step 1: User Initiates Generation
**Location:** `/app/ai-designer/page.tsx`

\`\`\`typescript
// User enters prompt and clicks generate
handleInitialGenerationWithProgress(prompt, onProgress)
  ↓
// Calls main generation function
generateIdea({
  user_prompt: prompt,
  existing_project_id: projectId,
  regenerate_image_only: true,
  generateMoreImages: true,  // Ensures all 5 views are generated
})
\`\`\`

**Key Parameters:**
- `regenerate_image_only: true` - Focus on image generation only
- `generateMoreImages: true` - Generate top and bottom views in addition to front/back/side

---

### Step 2: Core Generation Logic
**Location:** `/app/actions/idea-generation.ts:1053-1164`

\`\`\`typescript
generateProductImage(prompt, generateMoreImages, referenceImage, logo, projectId)
  ↓
// Configure generation settings
const config: GenerationConfig = {
  projectId: projectId,
  useSteppedWorkflow: true,      // Use stepped generation process
  generateExtraViews: true,       // Include top and bottom views
  autoApprove: true,              // Auto-approve front view
  referenceImage: referenceImage, // Optional reference image
  modifications: modifications,   // Prompt modifications
  style: "photorealistic",        // Default style
  logo: logoData,                 // Optional logo overlay
}
  ↓
// Call centralized generation service
generateMultiViewProduct(prompt, config)
\`\`\`

**Returns:** Base64 data URLs for all 5 views
\`\`\`typescript
{
  front: "data:image/jpeg;base64,...",
  back: "data:image/jpeg;base64,...",
  side: "data:image/jpeg;base64,...",
  top: "data:image/jpeg;base64,...",
  bottom: "data:image/jpeg;base64,..."
}
\`\`\`

---

### Step 3: Stepped Workflow Generation
**Location:** `/lib/services/centralized-generation-service.ts:127-237`

\`\`\`typescript
generateWithSteppedWorkflow(prompt, config)
  ↓
// Step 1: Generate Front View
frontViewResult = await generateFrontView({
  prompt,
  style: "photorealistic",
  referenceImage,
  modifications,
  logo,
})
// Returns: { imageUrl, approvalId, metadata }
  ↓
// Step 2: Auto-Approve Front View
approvalResult = await handleFrontViewApproval({
  approvalId: frontViewResult.approvalId,
  approved: true,
  feedback: null,  // No user feedback needed
})
  ↓
// Step 3: Generate Additional Views Based on Front
additionalViewsResult = await generateAdditionalViews(approvalId)
// Generates: back, side, top, bottom views using front as reference
  ↓
// Combine all views
return {
  front: frontViewResult.imageUrl,
  back: additionalViewsResult.back,
  side: additionalViewsResult.side,
  top: additionalViewsResult.top,
  bottom: additionalViewsResult.bottom,
}
\`\`\`

**Why Stepped Workflow?**
- Front view establishes the product design
- Other views maintain consistency by referencing the front view
- Auto-approval eliminates user wait time

---

### Step 4: Upload to Storage
**Location:** `/app/actions/idea-generation.ts:1053-1164`

\`\`\`typescript
// Convert base64 data URLs to Supabase storage URLs
for (const [viewType, base64Data] of Object.entries(generatedViews)) {
  ↓
  // Upload to Supabase Storage bucket
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`${projectId}/${viewType}-${timestamp}.jpg`, fileBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
    })
  ↓
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)
  ↓
  uploadedUrls[viewType] = publicUrl
}
\`\`\`

**Storage Structure:**
\`\`\`
Supabase Storage Bucket: product-images/
├── {projectId}/
│   ├── front-1704123456789.jpg
│   ├── back-1704123456789.jpg
│   ├── side-1704123456789.jpg
│   ├── top-1704123456789.jpg
│   └── bottom-1704123456789.jpg
\`\`\`

---

### Step 5: Save as Initial Revision (Revision 0)
**Location:** `/app/actions/ai-image-edit-new-table.ts:1114-1237`

\`\`\`typescript
saveInitialRevisions(productId, uploadedUrls)
  ↓
// Generate batch ID for grouping all 5 views
const batchId = `initial-${Date.now()}`
  ↓
// Create database records for each view
for (const [viewType, imageUrl] of Object.entries(uploadedUrls)) {
  await supabase
    .from('product_multiview_revisions')
    .insert({
      product_idea_id: productId,
      revision_number: 0,           // Initial revision
      batch_id: batchId,            // Groups all 5 views together
      view_type: viewType,          // front, back, side, top, or bottom
      image_url: imageUrl,          // Supabase storage URL
      thumbnail_url: null,          // Generated later if needed
      edit_prompt: "Original AI-generated image",
      edit_type: "generated",       // Type: generated (not ai_edit)
      ai_model: "gemini-2.5-flash-image-preview",
      is_active: true,              // Current active revision
      is_deleted: false,
      created_at: new Date(),
    })
}
\`\`\`

**Database After Initial Generation:**
\`\`\`
Table: product_multiview_revisions

| id   | product_idea_id | revision_number | batch_id        | view_type | image_url              | edit_type  | is_active |
|------|-----------------|-----------------|-----------------|-----------|------------------------|------------|-----------|
| r1   | prod-123        | 0               | initial-1704... | front     | https://storage.../f   | generated  | true      |
| r2   | prod-123        | 0               | initial-1704... | back      | https://storage.../b   | generated  | true      |
| r3   | prod-123        | 0               | initial-1704... | side      | https://storage.../s   | generated  | true      |
| r4   | prod-123        | 0               | initial-1704... | top       | https://storage.../t   | generated  | true      |
| r5   | prod-123        | 0               | initial-1704... | bottom    | https://storage.../bo  | generated  | true      |
\`\`\`

---

## 2. Revision System (When User Edits)

### Edit Flow
**Location:** `/app/ai-designer/page.tsx:549-693`

\`\`\`typescript
// User requests changes via chat
handleEditMultiView(editPrompt, onViewComplete)
  ↓
// Regenerate all 5 views with modifications
generateIdea({
  user_prompt: editPrompt,
  existing_project_id: projectId,
  regenerate_image_only: true,
  generateMoreImages: true,
})
  ↓
// Same generation flow as initial (Steps 2-4 above)
// Returns new set of 5 images
  ↓
// Save as new revision
handleSaveEditedImages(newImages, editPrompt)
  ↓
// Get next revision number
const maxRevision = await getMaxRevisionNumber(productId)
const newRevisionNumber = maxRevision + 1
  ↓
// Deactivate previous revision
await supabase
  .from('product_multiview_revisions')
  .update({ is_active: false })
  .eq('product_idea_id', productId)
  .eq('is_active', true)
  ↓
// Create new batch ID
const batchId = `batch-${Date.now()}`
  ↓
// Save new revision (same as Step 5, but with different values)
for (const [viewType, imageUrl] of Object.entries(newImages)) {
  await supabase
    .from('product_multiview_revisions')
    .insert({
      product_idea_id: productId,
      revision_number: newRevisionNumber,  // 1, 2, 3, etc.
      batch_id: batchId,                   // batch-1704...
      view_type: viewType,
      image_url: imageUrl,
      edit_prompt: editPrompt,             // User's edit request
      edit_type: "ai_edit",                // Type: ai_edit
      ai_model: "gemini-2.5-flash-image-preview",
      is_active: true,                     // New active revision
      is_deleted: false,
      created_at: new Date(),
    })
}
\`\`\`

**Database After First Edit:**
\`\`\`
Table: product_multiview_revisions

| id   | product_idea_id | revision_number | batch_id        | view_type | edit_prompt           | edit_type  | is_active |
|------|-----------------|-----------------|-----------------|-----------|----------------------|------------|-----------|
| r1   | prod-123        | 0               | initial-1704... | front     | Original AI-generated | generated  | false     |
| r2   | prod-123        | 0               | initial-1704... | back      | Original AI-generated | generated  | false     |
| r3   | prod-123        | 0               | initial-1704... | side      | Original AI-generated | generated  | false     |
| r4   | prod-123        | 0               | initial-1704... | top       | Original AI-generated | generated  | false     |
| r5   | prod-123        | 0               | initial-1704... | bottom    | Original AI-generated | generated  | false     |
| r6   | prod-123        | 1               | batch-1704...   | front     | Make it red           | ai_edit    | true      |
| r7   | prod-123        | 1               | batch-1704...   | back      | Make it red           | ai_edit    | true      |
| r8   | prod-123        | 1               | batch-1704...   | side      | Make it red           | ai_edit    | true      |
| r9   | prod-123        | 1               | batch-1704...   | top       | Make it red           | ai_edit    | true      |
| r10  | prod-123        | 1               | batch-1704...   | bottom    | Make it red           | ai_edit    | true      |
\`\`\`

---

## 3. Display & Usage

### Fetching Revisions
**Location:** `/app/actions/ai-image-edit-new-table.ts:1012-1109`

\`\`\`typescript
getGroupedMultiViewRevisions(productId)
  ↓
// Query all revisions for product (not deleted)
const { data: revisions } = await supabase
  .from('product_multiview_revisions')
  .select('*')
  .eq('product_idea_id', productId)
  .or('is_deleted.is.null,is_deleted.eq.false')
  .order('created_at', { ascending: false })
  ↓
// Group by batch_id
const batches = new Map()
revisions.forEach((rev) => {
  const batchId = rev.batch_id || `single-${rev.id}`

  if (!batches.has(batchId)) {
    batches.set(batchId, {
      id: batchId,
      revisionNumber: rev.revision_number,
      views: {},  // Will contain all 5 views
      editPrompt: rev.edit_prompt,
      editType: rev.edit_type,
      createdAt: rev.created_at,
      isActive: false,
    })
  }

  // Add view to batch
  const batch = batches.get(batchId)
  batch.views[rev.view_type] = {
    imageUrl: rev.image_url,
    thumbnailUrl: rev.thumbnail_url,
    revisionId: rev.id,
  }

  // Mark if any view in batch is active
  if (rev.is_active) {
    batch.isActive = true
  }
})
  ↓
// Convert to array and sort by revision number
const grouped = Array.from(batches.values())
  .sort((a, b) => b.revisionNumber - a.revisionNumber)
  ↓
return grouped
\`\`\`

**Grouped Structure Returned:**
\`\`\`typescript
[
  {
    id: "batch-1704...",
    revisionNumber: 1,
    views: {
      front: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r6" },
      back: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r7" },
      side: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r8" },
      top: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r9" },
      bottom: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r10" },
    },
    editPrompt: "Make it red",
    editType: "ai_edit",
    createdAt: "2024-01-02T10:00:00Z",
    isActive: true,
  },
  {
    id: "initial-1704...",
    revisionNumber: 0,
    views: {
      front: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r1" },
      back: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r2" },
      side: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r3" },
      top: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r4" },
      bottom: { imageUrl: "...", thumbnailUrl: "...", revisionId: "r5" },
    },
    editPrompt: "Original AI-generated image",
    editType: "generated",
    createdAt: "2024-01-01T10:00:00Z",
    isActive: false,
  }
]
\`\`\`

---

### Display in MultiViewEditor
**Location:** `/modules/ai-designer/components/MultiViewEditor/index.tsx`

\`\`\`typescript
// Component receives current views
<MultiViewEditor
  initialViews={currentViews}  // Active revision's views
  productName={productName}
  onSave={handleSave}
/>
  ↓
// Display each view in viewport
{Object.entries(currentViews).map(([viewType, imageUrl]) => (
  <Viewport
    key={viewType}
    viewType={viewType}
    imageUrl={imageUrl}
    onAnnotate={handleAnnotate}
    onZoom={handleZoom}
  />
))}
\`\`\`

---

### Display in RevisionHistory
**Location:** `/modules/ai-designer/components/RevisionHistory/index.tsx`

\`\`\`typescript
// Component receives all grouped revisions
<RevisionHistory
  revisions={groupedRevisions}  // All revisions, grouped by batch
  onSelectRevision={handleSelectRevision}
  onDeleteRevision={handleDeleteRevision}
/>
  ↓
// Display each revision batch as a card
{revisions.map((revision) => (
  <RevisionCard
    key={revision.id}
    revision={revision}
    isActive={revision.isActive}
    onClick={() => onSelectRevision(revision)}
  >
    {/* Show thumbnail grid of all 5 views */}
    <ThumbnailGrid views={revision.views} />

    {/* Show edit prompt */}
    <EditPrompt>{revision.editPrompt}</EditPrompt>

    {/* Show metadata */}
    <Metadata>
      Revision {revision.revisionNumber}
      {revision.editType === "generated" && " (Original)"}
      {revision.editType === "ai_edit" && " (AI Edit)"}
    </Metadata>
  </RevisionCard>
))}
\`\`\`

---

## 4. Data Flow Summary

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ USER INITIATES GENERATION                                    │
│ "Create a red t-shirt with logo"                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ GENERATION SERVICE (Stepped Workflow)                       │
│ 1. Generate Front View                                      │
│ 2. Auto-Approve Front                                       │
│ 3. Generate Back/Side/Top/Bottom based on Front            │
│ Returns: 5 Base64 Data URLs                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STORAGE (Supabase)                                          │
│ Upload 5 images to: product-images/{projectId}/             │
│ Returns: 5 Public URLs                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (product_multiview_revisions)                      │
│ Insert 5 rows:                                              │
│ - revision_number: 0                                        │
│ - batch_id: initial-{timestamp}                             │
│ - edit_type: generated                                      │
│ - is_active: true                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ DISPLAY (MultiViewEditor)                                   │
│ Shows 5 viewports with images from active revision          │
│ User can: zoom, pan, annotate, edit                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ USER REQUESTS EDIT                                           │
│ "Make it blue"                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ REGENERATION (Same as Generation Service)                   │
│ Generate 5 new views with modifications                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STORAGE (New Upload)                                         │
│ Upload 5 new images                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (New Revision)                                      │
│ 1. Deactivate old revision (is_active: false)               │
│ 2. Insert 5 new rows:                                        │
│    - revision_number: 1                                      │
│    - batch_id: batch-{timestamp}                             │
│    - edit_type: ai_edit                                      │
│    - edit_prompt: "Make it blue"                             │
│    - is_active: true                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ DISPLAY (Updated)                                            │
│ Editor shows new revision                                    │
│ RevisionHistory shows both revisions                         │
│ User can switch between revisions                            │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 5. Key Architectural Decisions

### Why Revision-Based Storage?
1. **Complete History:** Never lose previous versions
2. **Easy Rollback:** User can revert to any previous revision
3. **Comparison:** View changes side-by-side
4. **Audit Trail:** Track all modifications with timestamps and prompts

### Why Batch Grouping?
1. **5 Views = 1 Concept:** All views represent the same design iteration
2. **Atomic Operations:** Either all 5 views exist or none
3. **Efficient Queries:** Fetch all related views with single query
4. **Clean UI:** Display revisions as unified cards, not individual images

### Why Soft Deletes?
1. **Safety:** Never permanently lose data
2. **Recovery:** User can restore accidentally deleted revisions
3. **Analytics:** Track which revisions users prefer/discard

### Why Stepped Workflow?
1. **Consistency:** Other views reference the front view for coherent design
2. **Quality:** Front view establishes the product before generating others
3. **Efficiency:** Auto-approval eliminates waiting for user confirmation

---

## 6. Storage Breakdown

### Supabase Storage Bucket
\`\`\`
Bucket: product-images
├── Access: Public read, authenticated write
├── File naming: {projectId}/{viewType}-{timestamp}.jpg
├── Retention: Indefinite (manual cleanup required)
└── CDN: Enabled for fast delivery
\`\`\`

### Database Tables

**Primary Table: product_multiview_revisions**
- Stores all revision history
- 5 rows per revision batch
- Grouped by batch_id
- Filtered by is_active for current view

**Secondary Table: images_uploads**
- Additional metadata tracking
- Links to product_multiview_revisions
- Used for analytics and tracking

**Legacy Table: product_ideas.image_data**
- JSON column storing image URLs
- Being phased out in favor of revisions table
- Still used for backward compatibility

---

## 7. Usage Patterns

### Pattern 1: Display Current Product
\`\`\`typescript
// Get active revision
const activeRevision = await getActiveRevision(productId)

// Display in editor
<MultiViewEditor initialViews={activeRevision.views} />
\`\`\`

### Pattern 2: Show Revision History
\`\`\`typescript
// Get all revisions grouped by batch
const revisions = await getGroupedMultiViewRevisions(productId)

// Display in sidebar
<RevisionHistory revisions={revisions} />
\`\`\`

### Pattern 3: Switch to Different Revision
\`\`\`typescript
// Deactivate current revision
await deactivateRevision(productId)

// Activate selected revision
await activateRevision(revisionBatchId)

// Refresh display
const newActiveRevision = await getActiveRevision(productId)
<MultiViewEditor initialViews={newActiveRevision.views} />
\`\`\`

### Pattern 4: Delete Revision (Soft Delete)
\`\`\`typescript
// Mark all views in batch as deleted
await supabase
  .from('product_multiview_revisions')
  .update({ is_deleted: true })
  .eq('batch_id', batchId)

// Refresh revision list (deleted ones won't appear)
const revisions = await getGroupedMultiViewRevisions(productId)
\`\`\`

---

## 8. Performance Considerations

### Optimization Strategies
1. **Thumbnail Generation:** Create smaller thumbnails for revision history grid
2. **Lazy Loading:** Load full images only when viewport is visible
3. **CDN Caching:** Leverage Supabase CDN for image delivery
4. **Batch Queries:** Fetch all 5 views in single query using batch_id
5. **Index Optimization:** Database indexes on product_idea_id, batch_id, is_active

### Current Bottlenecks
1. **Generation Time:** 30-60 seconds for all 5 views
2. **Storage Upload:** 5 separate uploads (could be parallelized)
3. **Database Inserts:** 5 separate inserts (could use batch insert)

---

## 9. Error Handling

### Generation Failures
\`\`\`typescript
try {
  const views = await generateMultiViewProduct(prompt, config)
} catch (error) {
  // Fallback: Retry with different model
  // Fallback: Generate fewer views (front/back/side only)
  // Notify user of partial failure
}
\`\`\`

### Storage Failures
\`\`\`typescript
// If any upload fails, rollback all uploads
for (const [viewType, file] of uploads) {
  try {
    await uploadToStorage(file)
  } catch (error) {
    // Delete already uploaded files
    await cleanupPartialUpload(uploadedFiles)
    throw new Error("Storage upload failed")
  }
}
\`\`\`

### Database Failures
\`\`\`typescript
// If any insert fails, entire batch fails (transaction)
await supabase.rpc('insert_revision_batch', {
  revisions: allFiveRevisions,  // Atomic insert
})
\`\`\`

---

## Summary

The Genpire product image generation system uses a **unified revision-based architecture** where:

1. **Initial generation creates all 5 views** (front, back, side, top, bottom) in a stepped workflow
2. **Everything is stored as revisions** - initial generation is revision 0, edits are 1, 2, 3...
3. **Revisions are grouped by batch_id** - 5 database rows per revision batch
4. **Images are stored in Supabase Storage** - public URLs referenced in database
5. **Soft deletes preserve history** - revisions marked as deleted, never actually removed
6. **Active marking controls display** - only one revision batch marked is_active: true

This architecture provides complete history tracking, easy rollbacks, and a clean user experience for managing product designs over time.
