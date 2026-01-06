# Genpire AI Designer - Revision System Complete Documentation

## Executive Summary

The Genpire AI Designer uses a sophisticated multi-view revision management system that tracks all product design changes. Revisions are created at multiple points in the user workflow (initial generation, AI edits, manual uploads) and stored in a `product_multiview_revisions` database table. The system groups individual view revisions into logical revision sets using batch IDs, implements per-view revision tracking, and provides full rollback capabilities.

---

## Quick Reference

### Key Files (Absolute Paths)

**Revision Creation & Management:**
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/actions/create-initial-product-revision.ts` - Initial revision creation (revision 0)
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/actions/ai-image-edit-new-table.ts` - AI edit revisions & revision retrieval
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/actions/ai-image-edit.ts` - Single view editing & active revision management
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/services/revision-generation-service.ts` - Revision service layer (alternative API)

**Frontend Components & State:**
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/modules/ai-designer/components/RevisionHistory/index.tsx` - Revision history display component
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/modules/ai-designer/hooks/useRevisionHistory.ts` - Revision history hook
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/modules/ai-designer/store/editorStore.ts` - Zustand store for editor state

**Supporting Files:**
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/modules/ai-designer/types/revision.types.ts` - TypeScript type definitions
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/cache/revisions-cache.ts` - In-memory revisions cache
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/actions/idea-generation.ts` - Initial product generation action

---

## 1. WHERE REVISIONS ARE CREATED

### 1.1 Initial Product Generation (Revision 0)

**Trigger Point:** User generates new product via idea generation workflow

**File:** `/app/actions/idea-generation.ts`
- **Line 2022:** Call to `createInitialProductRevision()`

**Implementation File:** `/app/actions/create-initial-product-revision.ts`
- **Lines 23-195:** Full function implementation
- **Lines 53-103:** Batch preparation for revision records
- **Lines 118-121:** Database insertion

**Process:**
1. User submits product idea with generation prompt
2. Gemini generates initial images (front, back, side, etc.)
3. `createInitialProductRevision()` called with generated images
4. For each view:
   - Create revision record with `edit_type="initial"`
   - Set `revision_number=0`
   - Assign shared `batch_id`
5. Batch insert all view records
6. Save to `images_uploads` table for compatibility
7. Return revision IDs to frontend

**Database Operation:**
\`\`\`sql
INSERT INTO product_multiview_revisions (
  product_idea_id, user_id, revision_number, batch_id, 
  view_type, image_url, edit_type, is_active, ...
) VALUES (...)
\`\`\`

### 1.2 AI Edit Operations (Revision N)

**Trigger Point:** User applies AI edit to one or more views

**File:** `/app/actions/ai-image-edit-new-table.ts`
- **Line 582:** `applyMultiViewEdit()` function (handles multi-view edits)
- **Line 348:** `generateSingleView()` function (generates single view)

**Implementation Details:**
- **Lines 488-506:** Query highest revision_number for each view
- **Lines 513-518:** Deactivate previous active revisions
- **Lines 521-551:** Prepare and insert new revision record

**Process:**
1. User enters edit prompt
2. System analyzes current product images (GPT-4 Vision)
3. Enhance edit prompt using GPT-4
4. For each view:
   - Generate new image with Gemini
   - Upload to storage
   - Query max `revision_number` for view
   - Deactivate previous `is_active` revisions
   - Insert new revision with `revision_number++`
   - Set `is_active=true`
5. Return new revision IDs

### 1.3 Manual Image Uploads

**Trigger Point:** User uploads custom image

**Files:**
- Various multiview editor components supporting uploads

**Process:**
- Create revision with `edit_type="manual_upload"`
- Preserve other view types
- Increment revision_number for uploaded view

---

## 2. DATABASE TABLE STRUCTURE

### Table: `product_multiview_revisions`

**Full Schema:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, revision record ID |
| `product_idea_id` | UUID | Foreign key to product_ideas |
| `user_id` | UUID | User who created revision |
| `batch_id` | STRING | Groups views created together |
| `revision_number` | INTEGER | Per-view revision counter (0=initial) |
| `view_type` | STRING | 'front'\|'back'\|'side'\|'top'\|'bottom' |
| `image_url` | STRING | Full public URL to generated image |
| `thumbnail_url` | STRING | Thumbnail URL (optional) |
| `edit_prompt` | STRING | User's edit request or generation prompt |
| `edit_type` | STRING | 'initial'\|'ai_edit'\|'manual_upload' |
| `ai_model` | STRING | Model used (e.g., 'gemini-2.5-flash-image-preview') |
| `ai_parameters` | JSON | AI generation parameters & analysis |
| `is_active` | BOOLEAN | Currently displayed revision for view |
| `is_deleted` | BOOLEAN | Soft delete flag |
| `generation_time_ms` | INTEGER | Time to generate image (milliseconds) |
| `metadata` | JSON | Additional metadata (productName, etc.) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Key Constraints:**
- Foreign key: `product_idea_id` → `product_ideas(id)`
- Unique constraint per (product_idea_id, batch_id, view_type)
- Only one row per view_type should have `is_active=true`

---

## 3. COMPLETE DATA FLOW

### 3.1 Initial Generation Flow

\`\`\`
User Action (UI)
    ↓
idea-generation.ts:2022
    ├─ Call createInitialProductRevision()
    ↓
create-initial-product-revision.ts:23-195
    ├─ Line 38: Get authenticated user
    ├─ Line 50: Generate batch ID
    ├─ Line 56-103: For each view:
    │   ├─ Extract image URL
    │   └─ Prepare revision record
    ├─ Line 118-121: Batch INSERT into product_multiview_revisions
    ├─ Line 154-179: Save to images_uploads (compatibility)
    └─ Return: { success, revisionIds, batchId }
    ↓
Frontend: Display revisions via RevisionHistory component
\`\`\`

### 3.2 AI Edit Flow

\`\`\`
User Action (AI Editor)
    ↓
ai-image-edit-new-table.ts:582-700+
    ├─ Call applyMultiViewEdit()
    ├─ Line 158-179: Analyze images (GPT-4 Vision)
    ├─ Line 302-325: Enhance prompt (GPT-4)
    ↓
For each view: generateSingleView()
    ├─ Line 488-506: Query max revision_number per view_type
    ├─ Line ~440: Generate with Gemini
    ├─ Line ~460: Upload to storage
    ├─ Line 513-518: UPDATE is_active=false (deactivate previous)
    ├─ Line 547-551: INSERT new revision
    │   ├─ revision_number = max + 1
    │   ├─ is_active = true
    │   └─ edit_type = "ai_edit"
    ├─ Line 568: Return revisionId
    ↓
Cache invalidated: revisionsCache.invalidate(productId)
    ↓
Frontend: Display updated images & add to history
\`\`\`

### 3.3 Revision Display Flow

\`\`\`
User Action (Opens History Panel)
    ↓
getGroupedMultiViewRevisions(productId)
    ├─ Line 1124-1132: Check cache (30-second TTL)
    ├─ If cached: RETURN cached result
    ├─ If not cached:
    │   ├─ Line 1139-1146: SELECT * FROM product_multiview_revisions
    │   │                 WHERE product_idea_id=X AND is_deleted!=true
    │   ├─ Line 1164-1211: Group by batch_id
    │   │   ├─ Collect all views per batch
    │   │   ├─ Create MultiViewRevision objects
    │   │   └─ Sort by created_at (newest first)
    │   ├─ Line 1209-1211: Ensure only latest revision marked active
    │   ├─ Line 1224-1226: Cache result
    │   └─ RETURN grouped revisions
    ↓
RevisionHistory Component
    ├─ Display revision cards with:
    │   ├─ Thumbnail grid (front, back, side)
    │   ├─ Relative timestamp
    │   ├─ Edit prompt
    │   ├─ Active badge
    │   └─ Action buttons (Details, Tech Pack, Delete, Rollback)
    ↓
User Interactions:
    ├─ Click card: Call setActiveRevision() (rollback)
    ├─ Click Details: Show RevisionDetailModal
    ├─ Click Delete: Soft delete (is_deleted=true)
    └─ Click Rollback: Update is_active status
\`\`\`

---

## 4. REVISION RELATIONSHIPS

### Product → Revisions → Views

\`\`\`
product_ideas (1)
    ↓
    ├─→ (many) product_multiview_revisions
        
        ├─ Revision 0 (Batch-001)
        │   ├─ front (row 1)
        │   ├─ back (row 2)
        │   └─ side (row 3)
        │
        ├─ Revision 1 (Batch-002)
        │   ├─ front (row 4)
        │   ├─ back (row 5)
        │   └─ side (row 6)
        │
        └─ Revision N (Batch-NNN)
            ├─ front (row N+1)
            ├─ back (row N+2)
            └─ side (row N+3)
\`\`\`

**Key Concept:** Multiple database rows (one per view) with same `batch_id` form one logical revision

---

## 5. FRONTEND COMPONENTS & HOOKS

### RevisionHistory Component

**File:** `/modules/ai-designer/components/RevisionHistory/index.tsx`

**Lines 82-291:** RevisionItem component (individual revision card)
- Displays thumbnail grid
- Shows timestamp and active status
- Provides action buttons
- Handles click handlers

**Lines 293+:** Main RevisionHistory component
- Manages revision list
- Handles user interactions
- Triggers rollback/delete callbacks

**Props:**
\`\`\`typescript
interface RevisionHistoryProps {
  revisions: MultiViewRevision[];
  onRollback: (revision: MultiViewRevision) => void;
  onDelete: (revisionId: string) => Promise<boolean>;
  onGenerateTechPack?: () => void;
  productId?: string;
}
\`\`\`

### useRevisionHistory Hook

**File:** `/modules/ai-designer/hooks/useRevisionHistory.ts`

**Functions:**
- `rollbackToRevision()` - Restore previous revision
- `deleteRevision()` - Mark as deleted
- Access to revisions from store

### useEditorStore (Zustand)

**File:** `/modules/ai-designer/store/editorStore.ts`

**Lines 96-192:** Store definition
- **Line 113-114:** `setRevisions()` - Update revisions array
- **Line 116-122:** `addRevision()` - Add new revision, mark previous as inactive
- **Line 124-127:** `removeRevision()` - Remove from store

**State Properties:**
\`\`\`typescript
{
  revisions: MultiViewRevision[];
  pendingRevision: MultiViewRevision | null;
  revisionImagesLoaded: number;
}
\`\`\`

---

## 6. API ACTIONS (Server-Side)

### createInitialProductRevision()

**File:** `/app/actions/create-initial-product-revision.ts:23`

**Signature:**
\`\`\`typescript
export async function createInitialProductRevision({
  productId: string;
  views: { front?, back?, side?, bottom?, illustration? };
  userPrompt: string;
  productName?: string;
}): Promise<{
  success: boolean;
  revisionId?: string;
  revisionIds?: string[];
  revisionNumber: 0;
  batchId: string;
  error?: string;
}>
\`\`\`

**Process:**
1. Validate user authentication (line 41-45)
2. Generate batch ID: `initial_{productId}_{timestamp}` (line 50)
3. Prepare revision records for each view (lines 53-103)
4. Batch insert all records (lines 118-121)
5. Save to images_uploads (lines 154-179)
6. Return result

### applyMultiViewEdit()

**File:** `/app/actions/ai-image-edit-new-table.ts:582`

**Signature:**
\`\`\`typescript
export async function applyMultiViewEdit({
  productId: string;
  currentViews: { front, back, side, top?, bottom? };
  editPrompt: string;
  productName?: string;
  productDescription?: string;
  onProgress?: (view, imageUrl) => void;
}): Promise<{
  success: boolean;
  views?: { front, back, side, top?, bottom? };
  revisionIds?: string[];
  error?: string;
}>
\`\`\`

**Process:**
1. Analyze images (GPT-4 Vision) - lines 158-179
2. Enhance prompt (GPT-4) - lines 302-325
3. For each view: call `generateSingleView()` with enhancement
4. Return new revision IDs

### generateSingleView()

**File:** `/app/actions/ai-image-edit-new-table.ts:348`

**Purpose:** Generate/regenerate single view with revision saving

**Key Steps:**
- Line 488-506: Query max revision_number per view
- Line 513-518: Deactivate previous active revision
- Line 521-551: Prepare and insert new revision record
- Line 547-551: Return revisionId

### getGroupedMultiViewRevisions()

**File:** `/app/actions/ai-image-edit-new-table.ts:1118`

**Purpose:** Fetch and group revisions by batch

**Key Steps:**
- Line 1124-1132: Check cache (30-second TTL)
- Line 1139-1146: Query database
- Line 1164-1211: Group by batch_id and prepare response
- Line 1224-1226: Cache result
- Return: `{ success, revisions: [...] }`

### setActiveRevision()

**File:** `/app/actions/ai-image-edit.ts:184`

**Purpose:** Mark revision as active for display

**Process:**
1. Deactivate all revisions for view type
2. Activate selected revision
3. Product now shows old images

---

## 7. TYPE DEFINITIONS

### MultiViewRevision

**File:** `/modules/ai-designer/types/revision.types.ts:5`

\`\`\`typescript
export interface MultiViewRevision {
  id: string;                          // batch_id
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

### InitialRevisionParams

**File:** `/app/actions/create-initial-product-revision.ts:6`

\`\`\`typescript
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

## 8. CACHING SYSTEM

### RevisionsCache

**File:** `/lib/cache/revisions-cache.ts`

**Implementation:**
- In-memory Map storing productId → revision data
- 30-second TTL (auto-expires)
- Singleton instance: `revisionsCache`

**Methods:**
- `set(productId, data)` - Cache result
- `get(productId)` - Retrieve if valid
- `invalidate(productId)` - Clear specific entry
- `clear()` - Clear all

**Usage Pattern:**
\`\`\`
1. Call getGroupedMultiViewRevisions()
2. Checks cache first
3. If cached & valid: return cached
4. If not cached: query DB, cache result, return
5. When new revision created: invalidate cache
6. Next call fetches fresh data
\`\`\`

---

## 9. CRITICAL IMPLEMENTATION DETAILS

### Batch Grouping

**How it Works:**
- Multiple rows with same `batch_id` = one logical revision set
- Frontend groups these into single `MultiViewRevision` object
- Example: batch-001 has 3 rows (front, back, side)

**Why It Matters:**
- Allows storing view-specific edits in separate rows
- Simplifies database schema (no complex JSON needed)
- Easy filtering by view type

### Revision Number Tracking

**Per-View Tracking:**
- Each view has own `revision_number` sequence
- Front view: 0, 1, 2, 3...
- Back view: 0, 1, 2... (may skip if not edited)
- Side view: 0, 1... (may skip if not edited)

**Why This Matters:**
- Allows view-specific edits without affecting others
- Clear history for each view independently

### Active Status Management

**Invariant:**
- Only ONE row per (product_id, view_type) has `is_active=true`
- All others have `is_active=false`

**When Creating:**
- New revision automatically gets `is_active=true`
- Previous `is_active=true` rows set to `false`

**When Rollback:**
- Target revision set to `is_active=true`
- Current revision set to `is_active=false`

### Soft Deletes

**Pattern:**
- `is_deleted=true` marks revision as hidden
- Never actually deleted from database
- Filtered out in queries: `is_deleted IS NULL OR is_deleted=false`

### Non-Fatal Failures

**Design:**
- Initial revision creation failures don't block product generation
- If revision save fails, product still created with images
- Revision tracking is optional/best-effort feature

---

## 10. COMPLETE FILE LISTING

| File | Purpose | Key Lines |
|------|---------|-----------|
| `/app/actions/create-initial-product-revision.ts` | Create revision 0 | 23-195, 118-121 |
| `/app/actions/ai-image-edit-new-table.ts` | Edit revisions & retrieval | 348-577, 582-700+, 1118-1237 |
| `/app/actions/ai-image-edit.ts` | Single view editing | 25-116, 121-179, 184-198 |
| `/app/actions/idea-generation.ts` | Initial generation trigger | 2022-2051 |
| `/lib/services/revision-generation-service.ts` | Revision service layer | 42-151 |
| `/modules/ai-designer/components/RevisionHistory/index.tsx` | Display component | 82-291, 293+ |
| `/modules/ai-designer/hooks/useRevisionHistory.ts` | Revision hook | 9-40 |
| `/modules/ai-designer/store/editorStore.ts` | Zustand store | 96-192, 113-127 |
| `/modules/ai-designer/types/revision.types.ts` | Type definitions | 5-22 |
| `/lib/cache/revisions-cache.ts` | Caching utility | 11-46 |

---

## 11. QUICK START: UNDERSTANDING THE FLOW

### Scenario 1: User Generates New Product

1. User submits idea with prompt → `generateIdea()` (idea-generation.ts:2022)
2. Gemini generates 3 images (front, back, side)
3. Call `createInitialProductRevision()` (create-initial-product-revision.ts:23)
4. Create 3 database rows with `batch_id=initial_xxx` and `revision_number=0`
5. Set `is_active=true` on all 3
6. Return revisionIds to frontend
7. Frontend loads revisions via `getGroupedMultiViewRevisions()`
8. Display revision #0 in history panel

### Scenario 2: User Applies AI Edit

1. User enters edit prompt → `applyMultiViewEdit()` (ai-image-edit-new-table.ts:582)
2. Analyze images (GPT-4)
3. Enhance prompt (GPT-4)
4. For each view:
   - Query max revision_number for front view → find 0
   - Generate new image (Gemini)
   - Deactivate old revision_0 rows (set is_active=false)
   - Insert new rows with revision_number=1, is_active=true, batch_id=batch_xxx
5. Invalidate cache
6. Frontend fetches fresh revisions
7. Display both revision #0 and #1 in history

### Scenario 3: User Rolls Back to Revision #0

1. User clicks revision #0 in history
2. Call `setActiveRevision(revision_0_id, product_id, 'front')`
3. Update: is_active=false where revision_1 and view_type=front
4. Update: is_active=true where revision_0 and view_type=front
5. Frontend updates display to show old images
6. User can see history of revisions, current one highlighted

---

## Key Takeaways

1. **Revisions** are created at initial generation AND every AI edit
2. **Database table** `product_multiview_revisions` stores individual view revisions
3. **Batch IDs** group multiple views created together into logical revision sets
4. **Frontend** groups by batch_id to create `MultiViewRevision` objects for display
5. **Per-view revision numbers** allow independent editing of each view
6. **Caching** reduces database load with 30-second TTL
7. **Soft deletes** preserve history while hiding deleted revisions
8. **Active status** ensures only one revision visible per view type
9. **Non-fatal failures** on revision creation don't block product generation
10. **Complete history** available for rollback at any time
