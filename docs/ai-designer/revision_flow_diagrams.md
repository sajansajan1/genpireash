# AI Designer - Revision System Flow Diagrams

## 1. COMPLETE REVISION CREATION LIFECYCLE

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                    REVISION CREATION LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────────────┘

PHASE 1: INITIAL PRODUCT GENERATION
───────────────────────────────────

User                          Frontend                    Server API              Database
  │                             │                            │                      │
  │─ Submit product idea ───────>│                            │                      │
  │                             │                            │                      │
  │                             │─ POST generateIdea() ────>│                      │
  │                             │                            │                      │
  │                             │◄─────── AI generates ──────│                      │
  │                             │      (front,back,side)     │                      │
  │                             │                            │                      │
  │                             │ createInitialProductRevision() ──────────────────>│
  │                             │                            │   INSERT revision 0  │
  │                             │◄─────── revision IDs ──────│<─────────────────────│
  │                             │◄─────── Success ──────────│                      │
  │◄──────── Display Images ────│                            │                      │
  │          & History          │                            │                      │


PHASE 2: EDITING PRODUCT (AI EDITS)
──────────────────────────────────

User                          Frontend                    Server API              Database
  │                             │                            │                      │
  │─ Submit edit prompt ───────>│                            │                      │
  │                             │                            │                      │
  │                             │─ POST applyMultiViewEdit() ──────────────────────>│
  │                             │                            │   QUERY max revision │
  │                             │                            │   number per view<───│
  │                             │                            │                      │
  │                             │◄─── AI generates new ──────│                      │
  │                             │      images (incremented)  │                      │
  │                             │                            │                      │
  │                             │                            │─ UPDATE is_active=false
  │                             │                            │   (deactivate prev)  │
  │                             │                            │─────────────────────>│
  │                             │                            │                      │
  │                             │                            │─ INSERT new revision │
  │                             │                            │   (revision N)       │
  │                             │                            │─────────────────────>│
  │                             │◄─────── new revision IDs ──│                      │
  │                             │◄─────── Success ──────────│                      │
  │◄────── Update Images ───────│                            │                      │
  │        Add to History       │                            │                      │


PHASE 3: VIEWING HISTORY
────────────────────────

User                          Frontend                    Server API              Database
  │                             │                            │                      │
  │─ Click History Panel ──────>│                            │                      │
  │                             │                            │                      │
  │                             │─ Check Cache ──────────────>│                      │
  │                             │   (30 sec TTL)             │                      │
  │                             │                            │                      │
  │                             │─ if NOT cached: ───────────>│                      │
  │                             │  getGroupedMultiViewRevisions() ────────────────>│
  │                             │                            │  SELECT * WHERE      │
  │                             │                            │  product_id = X      │
  │                             │                            │  is_deleted = false  │
  │                             │                            │<─────────────────────│
  │                             │                            │                      │
  │                             │◄─── Group by batch_id ─────│                      │
  │                             │     Sort by created_at     │                      │
  │                             │     Mark only latest active │                      │
  │                             │                            │                      │
  │◄─────── Display all ────────│                            │                      │
  │        revisions with        │                            │                      │
  │        thumbnails           │                            │                      │


PHASE 4: ROLLBACK/RESTORE
─────────────────────────

User                          Frontend                    Server API              Database
  │                             │                            │                      │
  │─ Click Rollback ───────────>│                            │                      │
  │                             │                            │                      │
  │                             │─ POST setActiveRevision() ──────────────────────>│
  │                             │   (or create restoration     │  UPDATE is_active   │
  │                             │    revision)                │<─────────────────────│
  │                             │                            │                      │
  │                             │◄─────── Success ──────────│                      │
  │◄──────── Update view ───────│                            │                      │
  │          with old images    │                            │                      │
\`\`\`

---

## 2. DATABASE SCHEMA RELATIONSHIPS

\`\`\`
┌─────────────────────────┐
│   product_ideas         │
├─────────────────────────┤
│ id (UUID)               │◄────────────┐
│ user_id                 │             │
│ prompt                  │             │
│ image_data (JSON)       │             │ Foreign Key
│ latest_revision_id      │             │
│ ...                     │             │
└─────────────────────────┘             │
                                        │
                    ┌───────────────────┴─────────────┐
                    │                                 │
                    ▼                                 │
      ┌──────────────────────────────────┐           │
      │ product_multiview_revisions      │           │
      ├──────────────────────────────────┤           │
      │ id (UUID)                        │───┐       │
      │ product_idea_id (FK)─────────────┘   │       │
      │ user_id                          │   │       │
      │ batch_id                         │   │       │
      │ revision_number (INT)            │   │       │
      │ view_type                        │   │       │
      │ image_url                        │   │       │
      │ thumbnail_url                    │   │       │
      │ edit_prompt                      │   │       │
      │ edit_type                        │   │       │
      │ ai_model                         │   │       │
      │ ai_parameters (JSON)             │   │       │
      │ is_active (BOOL)                 │   │       │
      │ is_deleted (BOOL)                │   │       │
      │ generation_time_ms               │   │       │
      │ metadata (JSON)                  │   │       │
      │ created_at                       │   │       │
      │ updated_at                       │   └──┐    │
      └──────────────────────────────────┘      │    │
                                                │    │
                                                ▼    ▼
      ┌──────────────────────────────────┐      
      │ images_uploads                   │ (Compatibility table)
      ├──────────────────────────────────┤      
      │ id (UUID)                        │      
      │ product_idea_id (FK)─────────────┘     
      │ image_url                        │      
      │ thumbnail_url                    │      
      │ upload_type                      │      
      │ view_type                        │      
      │ file_name                        │      
      │ metadata (JSON)                  │      
      │ created_at                       │      
      └──────────────────────────────────┘      

KEY INDICES:
- product_multiview_revisions.product_idea_id (FK)
- product_multiview_revisions.batch_id (grouping)
- product_multiview_revisions.view_type (filtering)
- product_multiview_revisions.is_active (lookup active)
\`\`\`

---

## 3. BATCH GROUPING CONCEPT

\`\`\`
Database Rows (product_multiview_revisions):
┌──────────────────────────────────────────────────────────────┐

Batch-001 (Revision 0 - Initial Generation):
├─ id: rev-001-front  │ batch_id: batch-001 │ view_type: front │ revision_number: 0
├─ id: rev-001-back   │ batch_id: batch-001 │ view_type: back  │ revision_number: 0
└─ id: rev-001-side   │ batch_id: batch-001 │ view_type: side  │ revision_number: 0

Batch-002 (Revision 1 - First Edit):
├─ id: rev-002-front  │ batch_id: batch-002 │ view_type: front │ revision_number: 1
├─ id: rev-002-back   │ batch_id: batch-002 │ view_type: back  │ revision_number: 1
└─ id: rev-002-side   │ batch_id: batch-002 │ view_type: side  │ revision_number: 1

Batch-003 (Revision 2 - Second Edit):
├─ id: rev-003-front  │ batch_id: batch-003 │ view_type: front │ revision_number: 2
├─ id: rev-003-back   │ batch_id: batch-003 │ view_type: back  │ revision_number: 2
└─ id: rev-003-side   │ batch_id: batch-003 │ view_type: side  │ revision_number: 2

└──────────────────────────────────────────────────────────────┘

Frontend Grouping:
┌──────────────────────────────────────────────────────────────┐

MultiViewRevision #0 (Active):
├─ id: batch-001
├─ revisionNumber: 0
├─ views: {
│   front: { imageUrl: ..., revisionId: rev-001-front },
│   back: { imageUrl: ..., revisionId: rev-001-back },
│   side: { imageUrl: ..., revisionId: rev-001-side }
│ }
└─ isActive: true

MultiViewRevision #1:
├─ id: batch-002
├─ revisionNumber: 1
├─ views: { front: {...}, back: {...}, side: {...} }
└─ isActive: false

MultiViewRevision #2:
├─ id: batch-003
├─ revisionNumber: 2
├─ views: { front: {...}, back: {...}, side: {...} }
└─ isActive: false

└──────────────────────────────────────────────────────────────┘
\`\`\`

---

## 4. REVISION NUMBER TRACKING (Per-View)

\`\`\`
Timeline of View Edits:

FRONT VIEW:
─────────
Initial:     revision_number: 0  (batch-001)
1st Edit:    revision_number: 1  (batch-002)
2nd Edit:    revision_number: 2  (batch-003)
3rd Edit:    revision_number: 3  (batch-004)

BACK VIEW:
─────────
Initial:     revision_number: 0  (batch-001)
1st Edit:    revision_number: 1  (batch-002)
2nd Edit:    revision_number: 2  (batch-003)
(Not edited) [no revision_number: 3]

SIDE VIEW:
─────────
Initial:     revision_number: 0  (batch-001)
1st Edit:    revision_number: 1  (batch-002)
(Not edited) [no revision_number: 2]
(Not edited) [no revision_number: 3]

┌─ Explanation: revision_number is PER-VIEW, not global
│  - Each view tracks its own revision history independently
│  - Batches can have different revision numbers across views
│  - This allows "view-specific" edits without affecting others
└─ Active status is maintained per view:
   - Only ONE row per view_type should have is_active = true
\`\`\`

---

## 5. STATE MACHINE: Revision Active Status

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│              REVISION ACTIVE STATUS STATE MACHINE            │
└─────────────────────────────────────────────────────────────┘

Initial Revision Created:
    ┌───────────────────────┐
    │   is_active: TRUE     │ ◄─── Newly created revision
    │   (displayed)         │      automatically active
    └───────────┬───────────┘

User Applies Edit:
    │
    ├─ Deactivate All Previous: UPDATE is_active=false
    │                           WHERE view_type='front'
    │
    ├─ Create New Revision: INSERT ... is_active=true
    │
    └─> New Revision Becomes Active
        ┌───────────────────────┐
        │   is_active: TRUE     │
        │   (displayed)         │
        └───────────┬───────────┘

User Rolls Back:
    │
    ├─ Query Old Revision: SELECT WHERE id=revisionId
    │
    ├─ Call setActiveRevision():
    │  ├─ UPDATE is_active=false (current view in all revisions)
    │  └─ UPDATE is_active=true (target revision)
    │
    └─> Old Revision Reactivated
        ┌───────────────────────┐
        │   is_active: TRUE     │
        │   (displayed again)   │
        └───────────────────────┘

User Deletes Revision:
    │
    └─ UPDATE is_deleted=true
       ┌──────────────────────────┐
       │  is_deleted: TRUE        │
       │  is_active: FALSE        │
       │  (hidden from UI)        │
       └──────────────────────────┘
\`\`\`

---

## 6. CACHING LAYER FLOW

\`\`\`
┌────────────────────────────────────────────────────────────┐
│               REVISIONS CACHE FLOW                         │
└────────────────────────────────────────────────────────────┘

UI Request: "Get revisions for product XYZ"
    │
    ▼
Call: getGroupedMultiViewRevisions(productId)
    │
    ├─ Check Cache: revisionsCache.get(productId)
    │   │
    │   ├─ If exists AND valid (< 30sec old):
    │   │   └─> RETURN cached result (FAST)
    │   │
    │   └─ If NOT exists OR expired (> 30sec):
    │       │
    │       ├─ Query Database:
    │       │  SELECT * FROM product_multiview_revisions
    │       │  WHERE product_idea_id = productId
    │       │
    │       ├─ Group by batch_id
    │       ├─ Sort by created_at
    │       │
    │       ├─ Cache Result: revisionsCache.set(productId, result)
    │       │  └─ Set timestamp: Date.now()
    │       │
    │       └─> RETURN result
    │
    ▼
Render RevisionHistory with revisions

When User Creates New Revision:
    │
    ├─ Save revision to database
    ├─ INVALIDATE cache: revisionsCache.invalidate(productId)
    └─> Next getGroupedMultiViewRevisions() will fetch fresh data

Cache Entry:
┌─────────────────────────────────┐
│ productId: "abc-123"            │
├─────────────────────────────────┤
│ data: {                         │
│   success: true,                │
│   revisions: [...]              │
│ }                               │
├─────────────────────────────────┤
│ timestamp: 1699999999000        │
├─────────────────────────────────┤
│ TTL: 30000ms (30 seconds)       │
└─────────────────────────────────┘

Cache Expiration Logic:
if (now - timestamp > 30000) {
  cache.delete(productId)
  // Force fresh database query
}
\`\`\`

---

## 7. IMAGE GENERATION & UPLOAD FLOW

\`\`\`
┌──────────────────────────────────────────────────────────────┐
│         IMAGE GENERATION AND UPLOAD FLOW                    │
└──────────────────────────────────────────────────────────────┘

generateSingleView() called:
    │
    ├─1. Fetch user & product data
    │
    ├─2. Convert images to base64 (if reference needed)
    │   ├─ Download image from URL
    │   └─ Convert to base64 with error handling
    │
    ├─3. Analyze current images (GPT-4 Vision)
    │   ├─ Send current product state
    │   ├─ Get analysis of design
    │   └─ Store in ai_parameters
    │
    ├─4. Enhance edit prompt (GPT-4)
    │   ├─ Use analysis + user prompt
    │   ├─ Create precise generation prompt
    │   └─ Store in ai_parameters
    │
    ├─5. Generate new image (Gemini)
    │   ├─ Send enhanced prompt
    │   ├─ Include reference image if needed
    │   └─ Receive generated image
    │
    ├─6. Upload image
    │   ├─ Upload to storage service
    │   └─ Get public URL
    │
    ├─7. Query existing revisions
    │   ├─ SELECT revision_number FROM product_multiview_revisions
    │   ├─ WHERE product_id = X AND view_type = 'front'
    │   └─ Get max revision_number
    │
    ├─8. Deactivate previous
    │   └─ UPDATE is_active=false WHERE product_id=X AND view_type='front'
    │
    ├─9. Insert new revision
    │   ├─ revision_number = previousMax + 1
    │   ├─ image_url = uploaded URL
    │   ├─ ai_parameters = {analysis, enhancement, original}
    │   ├─ is_active = true
    │   └─ INSERT into product_multiview_revisions
    │
    └─10. Return
        ├─ revisionId (UUID)
        ├─ imageUrl (public URL)
        └─ success: true

Time tracking: generation_time_ms = Date.now() - timestamp
\`\`\`

---

## 8. RELATIONSHIPS: Product → Revisions → Views

\`\`\`
product_ideas
│
├─ ID: prod-123
├─ Name: "Wireless Headphones"
├─ Prompt: "Modern premium wireless headphones"
└─ latest_revision_id: batch-003
    │
    ├─────────────────────────────────────┐
    │                                     │
    ▼                                     ▼
┌─────────────────────┐      ┌─────────────────────┐
│ MultiViewRevision   │      │ MultiViewRevision   │
│ (Batch #1 / Rev 0)  │      │ (Batch #2 / Rev 1)  │
├─────────────────────┤      ├─────────────────────┤
│ id: batch-001       │      │ id: batch-002       │
│ created: 10:00 AM   │      │ created: 10:15 AM   │
│ isActive: FALSE     │      │ isActive: FALSE     │
│ editPrompt: "..."   │      │ editPrompt: "..."   │
│                     │      │                     │
│ views:              │      │ views:              │
│  front:             │      │  front:             │
│   imageUrl: ...     │      │   imageUrl: ...     │
│   revisionId: r1f   │      │   revisionId: r2f   │
│  back: {...}        │      │  back: {...}        │
│  side: {...}        │      │  side: {...}        │
└─────────────────────┘      └─────────────────────┘
                                      │
                            ┌─────────┴──────────┐
                            │                    │
                            ▼                    ▼
                    ┌─────────────────────┐
                    │ MultiViewRevision   │
                    │ (Batch #3 / Rev 2)  │
                    ├─────────────────────┤
                    │ id: batch-003       │
                    │ created: 10:30 AM   │
                    │ isActive: TRUE      │ ◄── Current
                    │ editPrompt: "..."   │
                    │                     │
                    │ views:              │
                    │  front:             │
                    │   imageUrl: ...     │
                    │   revisionId: r3f   │
                    │  back: {...}        │
                    │  side: {...}        │
                    └─────────────────────┘
\`\`\`

---

## 9. UI INTERACTION FLOW (RevisionHistory Component)

\`\`\`
┌──────────────────────────────────────────────────────────┐
│         REVISION HISTORY UI INTERACTION                  │
└──────────────────────────────────────────────────────────┘

User Opens Editor
    │
    ├─ Load revisions: getGroupedMultiViewRevisions()
    │
    ├─ Populate useEditorStore.revisions[]
    │
    └─> Render RevisionHistory Component
        │
        ├─ For each revision:
        │  ├─ Show thumbnail grid (front, back, side)
        │  ├─ Show timestamp (relative: "2 minutes ago")
        │  ├─ Show active badge (if isActive)
        │  ├─ Show edit prompt (expandable if long)
        │  └─ Show action buttons:
        │     ├─ Details (Info)
        │     ├─ Tech Pack (if generated)
        │     ├─ Delete (if not active)
        │     └─ Rollback (if not active)
        │
        └─ User Interactions:
           │
           ├─ Click on revision card:
           │  └─ If not active: onRollback(revision)
           │     └─ Update product to show old images
           │        └─ Call setActiveRevision()
           │           └─ UPDATE is_active in DB
           │
           ├─ Click "Details":
           │  └─ Show RevisionDetailModal
           │     └─ Display full prompt, metadata, etc.
           │
           ├─ Click "Tech Pack":
           │  └─ Show TechPackModal
           │     └─ Display generated tech pack
           │
           └─ Click "Delete":
              └─ Confirm dialog
              └─ onDelete(revisionId)
                 └─ UPDATE is_deleted=true in DB
                 └─ Remove from UI

State Updates Flow:
    User Action
        │
        ├─ Call action (setActiveRevision/delete)
        │
        ├─ Update Database
        │
        ├─ Invalidate cache: revisionsCache.invalidate()
        │
        ├─ Refresh revisions: await getGroupedMultiViewRevisions()
        │
        ├─ Update store: useEditorStore.setRevisions(newRevisions)
        │
        └─> UI re-renders with updated data
\`\`\`
