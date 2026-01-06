# AI Designer - Revision Creation System Analysis

## Overview
The AI Designer system uses a sophisticated multi-view revision management system that tracks all changes to product designs. Revisions are created at multiple points in the workflow and stored in a dedicated database table.

---

## 1. REVISION CREATION TRIGGERS (Where revisions are created)

### 1.1 Initial Product Generation (Revision 0)
**Files:**
- `/app/actions/idea-generation.ts` (Lines 2022-2051)
- `/app/actions/create-initial-product-revision.ts` (Lines 23-195)

**Trigger Flow:**
1. User submits product idea generation via `generateIdea()` action
2. AI generates initial product images (front, back, side, etc.)
3. `createInitialProductRevision()` is called with the generated images
4. Creates revision 0 for each view type in batch

**Code Snippet (Trigger Point):**
\`\`\`typescript
// /app/actions/idea-generation.ts:2022-2027
const revisionResult = await createInitialProductRevision({
  productId: project_id,
  views: imageData,
  userPrompt: user_prompt,
  productName: techpack?.productName || "Product",
});
\`\`\`

### 1.2 AI Edit Operations (Revision N)
**Files:**
- `/app/actions/ai-image-edit-new-table.ts` (Lines 582-700+)
- `/app/actions/ai-image-edit.ts` (Lines 25-116)

**Trigger Flow:**
1. User applies AI edits in the multiview editor
2. Edit prompt is submitted via `applyMultiViewEdit()` or `generateSingleView()`
3. Each view is regenerated with AI
4. New revision record is saved with incremented revision number

**Code Snippet (Trigger Point):**
\`\`\`typescript
// /app/actions/ai-image-edit-new-table.ts:521-551
const revisionData = {
  product_idea_id: productId,
  user_id: user.id,
  revision_number: nextRevisionNumber,
  batch_id: batchId || `single-${timestamp}`,
  view_type: viewType,
  image_url: imageUrl || "",
  edit_prompt: editPrompt,
  edit_type: "ai_edit" as const,
  ai_model: "gemini-2.5-flash-image-preview",
  is_active: true,
  ...
};

const { data: revision } = await supabase
  .from("product_multiview_revisions")
  .insert(revisionData)
  .select()
  .single();
\`\`\`

### 1.3 Manual Uploads (Revision N)
**Files:**
- Various multiview editor components that support image uploads

**Trigger Flow:**
1. User uploads custom product image manually
2. System creates revision with edit_type="manual_upload"
3. Views are preserved except for uploaded view

---

## 2. DATA STRUCTURE: Revision Table Schema

### 2.1 Database Table: `product_multiview_revisions`

**Complete Field Structure:**

\`\`\`sql
product_multiview_revisions {
  -- Identifiers
  id: UUID                    -- Primary key
  product_idea_id: UUID       -- Foreign key to product_ideas
  user_id: UUID               -- Owner of the revision
  batch_id: STRING            -- Groups views created together
  
  -- Revision Tracking
  revision_number: INTEGER    -- 0 for initial, increments with edits
  view_type: STRING           -- 'front' | 'back' | 'side' | 'top' | 'bottom'
  
  -- Image Data
  image_url: STRING           -- Full URL to generated/uploaded image
  thumbnail_url: STRING       -- Thumbnail for preview (optional)
  
  -- Edit Information
  edit_prompt: STRING         -- User's edit request or initial prompt
  edit_type: STRING           -- 'initial' | 'ai_edit' | 'manual_upload'
  ai_model: STRING            -- Model used (e.g., 'gemini-2.5-flash-image-preview')
  ai_parameters: JSON         -- AI generation parameters
  
  -- Status & Metadata
  is_active: BOOLEAN          -- Is this the current/displayed revision for this view?
  is_deleted: BOOLEAN         -- Soft delete flag
  generation_time_ms: INTEGER -- Time taken to generate
  metadata: JSON              -- Additional metadata
  
  -- Timestamps
  created_at: TIMESTAMP       -- When revision was created
  updated_at: TIMESTAMP       -- Last update (optional)
}
\`\`\`

### 2.2 Multi-View Revision Structure (Frontend Type)

\`\`\`typescript
// /modules/ai-designer/types/revision.types.ts:5-22
export interface MultiViewRevision {
  id: string;
  revisionNumber: number;
  views: {
    front?: { imageUrl: string; thumbnailUrl?: string };
    back?: { imageUrl: string; thumbnailUrl?: string };
    side?: { imageUrl: string; thumbnailUrl?: string };
    top?: { imageUrl: string; thumbnailUrl?: string };
    bottom?: { imageUrl: string; thumbnailUrl?: string };
  };
  editPrompt?: string;
  analysisPrompt?: string;
  enhancedPrompt?: string;
  editType: "initial" | "ai_edit" | "manual_upload";
  createdAt: string;
  isActive: boolean;
  metadata?: any;
}
\`\`\`

### 2.3 Initial Revision Creation Parameters

\`\`\`typescript
// /app/actions/create-initial-product-revision.ts:6-17
export interface InitialRevisionParams {
  productId: string;
  views: {
    front?: string | { url: string; [key: string]: any };
    back?: string | { url: string; [key: string]: any };
    side?: string | { url: string; [key: string]: any };
    bottom?: string | { url: string; [key: string]: any };
    illustration?: string | { url: string; [key: string]: any };
  };
  userPrompt: string;
  productName?: string;
}
\`\`\`

---

## 3. COMPLETE FLOW: From User Action to Database

### 3.1 Initial Product Generation Flow

**Sequence Diagram:**
\`\`\`
User generates product idea
    ↓
UI calls generateIdea() action
    ↓
Gemini API generates images (front, back, side, etc.)
    ↓
createInitialProductRevision() is called
    ↓
For each view:
  - Create batch ID (initial_{productId}_{timestamp})
  - Prepare revision record with:
    * product_idea_id = productId
    * user_id = authenticated user ID
    * revision_number = 0
    * batch_id = shared batch ID
    * view_type = 'front'|'back'|'side'
    * image_url = generated image URL
    * edit_type = 'initial'
    * is_active = true
    ↓
INSERT into product_multiview_revisions (batch insert all views)
    ↓
Store in images_uploads table (for compatibility)
    ↓
Return revisionIds and batchId
    ↓
Return success to UI
\`\`\`

### 3.2 AI Edit Revision Flow

**Sequence Diagram:**
\`\`\`
User submits edit in AI editor
    ↓
Prompt is submitted to applyMultiViewEdit() or generateSingleView()
    ↓
Analyze current product images (GPT-4 Vision)
    ↓
Enhance user's prompt (GPT-4)
    ↓
For each view (regenerate specified, preserve others):
  - Query highest revision_number for this view
  - Generate new image with Gemini
  - Deactivate previous is_active revisions
  - Create new revision record:
    * revision_number = previousMax + 1
    * batch_id = batch-{timestamp}
    * view_type = 'front'|'back'|'side'
    * image_url = newly generated URL
    * edit_prompt = user's edit request
    * edit_type = 'ai_edit'
    * is_active = true
    * ai_parameters = {analysisPrompt, enhancedPrompt, originalPrompt}
    ↓
INSERT into product_multiview_revisions
    ↓
Update product's latest images
    ↓
Return revisionIds to UI
\`\`\`

### 3.3 Revision Loading Flow

**Sequence Diagram:**
\`\`\`
UI needs to display revisions
    ↓
Call getGroupedMultiViewRevisions(productId)
    ↓
Check revision cache (30-second TTL)
    ↓
If cached: return cached result
    ↓
If not cached:
  - Query product_multiview_revisions WHERE product_idea_id = productId
  - Filter out deleted revisions (is_deleted != true)
  - Group by batch_id (groups views created together)
  - For each batch:
    * Collect all view_type entries
    * Create MultiViewRevision with all views
    * Mark as isActive if any view.is_active = true
    ↓
Sort by created_at (descending - newest first)
    ↓
Ensure only latest revision marked as active
    ↓
Cache result (30 seconds)
    ↓
Return grouped revisions to UI
\`\`\`

---

## 4. KEY RELATIONSHIPS

### 4.1 Product → Revisions Relationship
\`\`\`
product_ideas (1)
    ↓
    └─→ (many) product_multiview_revisions
        
- One product can have multiple revisions
- Each revision can contain multiple views (front, back, side, etc.)
- All views in a batch (batch_id) were created together
\`\`\`

### 4.2 Revision → Views Relationship
\`\`\`
product_multiview_revisions (individual rows per view)
    ↓
    └─→ Grouped by batch_id into MultiViewRevision (frontend)
        
- Each row in table = one view of one revision
- Multiple rows with same batch_id = one logical revision set
- Example: batch-123456 has 3 rows:
  * batch-123456 | front
  * batch-123456 | back
  * batch-123456 | side
\`\`\`

---

## 5. REVISION MANAGEMENT OPERATIONS

### 5.1 Setting Active Revision
**File:** `/app/actions/ai-image-edit.ts:184-198`

\`\`\`typescript
export async function setActiveRevision(
  revisionId: string,
  productId: string,
  viewType: string
) {
  // Deactivate all revisions for this view
  await supabase
    .from("product_multiview_revisions")
    .update({ is_active: false })
    .eq("product_idea_id", productId)
    .eq("view_type", viewType);

  // Activate the selected revision
  await supabase
    .from("product_multiview_revisions")
    .update({ is_active: true })
    .eq("id", revisionId);
}
\`\`\`

### 5.2 Deleting Revision (Soft Delete)
**File:** Multiple locations use soft delete pattern

\`\`\`typescript
// Mark as deleted instead of removing
await supabase
  .from("product_multiview_revisions")
  .update({ is_deleted: true })
  .eq("id", revisionId);
\`\`\`

### 5.3 Rollback to Previous Revision
**Concept:** Create new revision with restored images

\`\`\`typescript
// Get previous revision images
const previousRevision = await supabase
  .from("product_multiview_revisions")
  .select("*")
  .eq("id", revisionId)
  .single();

// Create new revision pointing to old images
await supabase
  .from("product_multiview_revisions")
  .insert({
    product_idea_id: projectId,
    revision_number: currentMax + 1,
    image_data: previousRevision.image_data,
    changes_made: {
      restored_from: revisionId,
      restored_revision_number: previousRevision.revision_number
    }
  });
\`\`\`

---

## 6. FRONTEND COMPONENTS & HOOKS

### 6.1 RevisionHistory Component
**File:** `/modules/ai-designer/components/RevisionHistory/index.tsx`

**Responsibilities:**
- Display list of all revisions with thumbnails
- Show edit prompts and timestamps
- Allow rollback to previous revisions
- Show/hide revision details
- Delete non-active revisions

**Key Props:**
\`\`\`typescript
interface RevisionHistoryProps {
  revisions: MultiViewRevision[];
  onRollback: (revision: MultiViewRevision) => void;
  onDelete: (revisionId: string) => Promise<boolean>;
  onGenerateTechPack?: () => void;
  selectedRevision?: MultiViewRevision | null;
  productId?: string;
}
\`\`\`

### 6.2 useRevisionHistory Hook
**File:** `/modules/ai-designer/hooks/useRevisionHistory.ts`

**Provides:**
- Access to revisions array
- addRevision() - Add new revision to store
- removeRevision() - Remove from store
- rollbackToRevision() - Rollback logic
- deleteRevision() - Deletion logic

### 6.3 useEditorStore (Zustand)
**File:** `/modules/ai-designer/store/editorStore.ts`

**Revision-related State:**
\`\`\`typescript
{
  revisions: MultiViewRevision[];
  pendingRevision: MultiViewRevision | null;
  revisionImagesLoaded: number;
  
  setRevisions: (revisions) => void;
  addRevision: (revision) => void;
  removeRevision: (revisionId) => void;
}
\`\`\`

### 6.4 MultiViewEditor Component
**Files:**
- `/components/ai-image-editor/multiview-editor.tsx`
- `/modules/ai-designer/components/MultiViewEditor/index.tsx`

**Revision Responsibilities:**
- Trigger AI edit operations
- Display current active revision images
- Load and switch between revisions
- Update revision status after generation

---

## 7. API ACTIONS (Server-Side)

### 7.1 createInitialProductRevision()
**File:** `/app/actions/create-initial-product-revision.ts`

**Purpose:** Create revision 0 for newly generated products

**Flow:**
1. Validate user authentication
2. Generate batch ID
3. For each view:
   - Create revision record
   - Extract image URL
   - Set edit_type = "initial"
4. Batch insert all records
5. Save to images_uploads (compatibility)
6. Return revision IDs

**Returns:**
\`\`\`typescript
{
  success: boolean;
  revisionId?: string;           // First revision ID
  revisionIds?: string[];        // All revision IDs
  revisionNumber: number;        // 0
  batchId: string;              // Batch identifier
  error?: string;
}
\`\`\`

### 7.2 applyMultiViewEdit()
**File:** `/app/actions/ai-image-edit-new-table.ts:582-700+`

**Purpose:** Apply edits to multiple views

**Flow:**
1. Analyze current product images (GPT-4)
2. Enhance edit prompt (GPT-4)
3. For each view:
   - Call generateSingleView() with enhancement
   - Save new revision record
4. Update active revisions
5. Return new revision IDs

**Parameters:**
\`\`\`typescript
interface MultiViewEditParams {
  productId: string;
  currentViews: {
    front: string;
    back: string;
    side: string;
    top?: string;
    bottom?: string;
  };
  editPrompt: string;
  productName?: string;
  productDescription?: string;
  onProgress?: (view, imageUrl) => void;
}
\`\`\`

### 7.3 generateSingleView()
**File:** `/app/actions/ai-image-edit-new-table.ts:348-577`

**Purpose:** Generate or regenerate a single view

**Flow:**
1. Get user authentication
2. Fetch current product images
3. Analyze and enhance prompt
4. Call Gemini to generate image
5. Upload to storage
6. Save revision record (increment revision_number)
7. Deactivate previous active revision
8. Return new revision ID

**Parameters:**
\`\`\`typescript
export async function generateSingleView({
  productId,
  viewType,
  currentImage,
  editPrompt,
  batchId,
  onProgress,
  saveRevision = true
})
\`\`\`

### 7.4 getGroupedMultiViewRevisions()
**File:** `/app/actions/ai-image-edit-new-table.ts:1118-1237`

**Purpose:** Fetch and group revisions by batch

**Flow:**
1. Check 30-second cache
2. Query all revisions for product
3. Filter out deleted
4. Group by batch_id
5. Collect all view_types per batch
6. Sort by created_at (newest first)
7. Ensure only latest marked active
8. Cache result

**Returns:**
\`\`\`typescript
{
  success: boolean;
  revisions: Array<{
    id: string;              // batch_id
    revisionNumber: number;
    views: {
      front?: { imageUrl, thumbnailUrl, revisionId };
      back?: { ... };
      side?: { ... };
      ...
    };
    editPrompt?: string;
    editType: string;
    createdAt: string;
    isActive: boolean;
    metadata?: any;
  }>;
  error?: string;
}
\`\`\`

---

## 8. STATE FLOW DIAGRAM

\`\`\`
User Action
    ↓
    ├─→ Generate Product (Initial Revision)
    │    ↓
    │    createInitialProductRevision()
    │    ↓
    │    Insert revision 0
    │    ↓
    │    Load in useEditorStore
    ↓
    ├─→ Edit Product (New Revision)
    │    ↓
    │    applyMultiViewEdit()
    │    ↓
    │    generateSingleView() for each view
    │    ↓
    │    Insert revision N
    │    ↓
    │    Update useEditorStore
    │    ↓
    │    Invalidate cache
    ↓
    └─→ View/Rollback Revision
         ↓
         getGroupedMultiViewRevisions()
         ↓
         Load in RevisionHistory component
         ↓
         setActiveRevision() on selection
\`\`\`

---

## 9. CACHING LAYER

### 9.1 Revisions Cache
**File:** `/lib/cache/revisions-cache.ts`

**Implementation:**
- Simple in-memory Map
- 30-second TTL (expires automatically)
- Key: productId
- Value: { revisions: [...], success: boolean }

**Methods:**
\`\`\`typescript
class RevisionsCache {
  set(productId: string, data: any): void
  get(productId: string): any | null
  invalidate(productId: string): void
  clear(): void
}
\`\`\`

**Usage:**
- Checked on every `getGroupedMultiViewRevisions()` call
- Invalidated when new revisions created
- Reduces database queries during active editing

---

## 10. KEY FILES SUMMARY

| File | Purpose | Key Functions |
|------|---------|---------------|
| `/app/actions/create-initial-product-revision.ts` | Initial revision creation | `createInitialProductRevision()` |
| `/app/actions/ai-image-edit-new-table.ts` | Edit operations & revision mgmt | `applyMultiViewEdit()`, `generateSingleView()`, `getGroupedMultiViewRevisions()` |
| `/app/actions/ai-image-edit.ts` | Single view editing | `applyAIImageEdit()`, `getProductImageRevisions()`, `setActiveRevision()` |
| `/lib/services/revision-generation-service.ts` | Revision service (legacy/alt) | `createRevision()`, `getRevisionHistory()`, `restoreRevision()` |
| `/modules/ai-designer/components/RevisionHistory/index.tsx` | Revision display component | Rendering and user interactions |
| `/modules/ai-designer/hooks/useRevisionHistory.ts` | Revision hook | State management |
| `/modules/ai-designer/store/editorStore.ts` | Global editor state | Zustand store |
| `/lib/cache/revisions-cache.ts` | Caching utility | Cache management |
| `/modules/ai-designer/types/revision.types.ts` | TypeScript types | `MultiViewRevision` interface |

---

## 11. LINE NUMBER REFERENCES (Key Implementation Details)

### Initial Revision Creation
- **Trigger:** `/app/actions/idea-generation.ts:2022`
- **Implementation:** `/app/actions/create-initial-product-revision.ts:23-195`
- **DB Insert:** Lines 118-121
- **Batch Preparation:** Lines 53-103

### AI Edit & Revision Saving
- **Revision Save:** `/app/actions/ai-image-edit-new-table.ts:483-563`
- **Query Next Number:** Lines 488-506
- **Deactivate Previous:** Lines 513-518
- **Insert New:** Lines 547-551

### Revision Loading & Grouping
- **Function:** `/app/actions/ai-image-edit-new-table.ts:1118`
- **Cache Check:** Lines 1124-1132
- **Query:** Lines 1139-1146
- **Grouping Logic:** Lines 1164-1211

### Frontend Store
- **Store Definition:** `/modules/ai-designer/store/editorStore.ts:96-192`
- **Add Revision:** Lines 116-122
- **Remove Revision:** Lines 124-127
- **Set Revisions:** Lines 113-114

---

## 12. IMPORTANT NOTES

1. **Soft Deletes:** Revisions are never actually deleted; they're marked with `is_deleted = true`
2. **Batch Grouping:** Multiple view rows with same `batch_id` form one logical revision
3. **Active Status:** Only one revision per view_type should have `is_active = true` at any time
4. **Revision Number:** Increments per view, not globally
5. **Cache Invalidation:** Manual invalidation may be needed after changes
6. **Non-Fatal Failures:** Initial revision creation failures don't block product generation
7. **Metadata Storage:** Rich metadata stored in JSON columns for extensibility
