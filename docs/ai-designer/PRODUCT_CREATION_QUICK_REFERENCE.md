# Genpire Initial Product Generation - Quick Reference Guide

## Quick Overview

**User Journey:** Create Product → Immediate Database Entry → AI Designer Opens → Auto-Generation Begins → 5 Views Generated → Display in Editor

**Total Time:** 2.5-3 minutes from start to seeing all views

---

## Entry Points

### 1. Creator Dashboard (Idea Upload)
\`\`\`
/creator-dashboard → IdeaUploadPage
- Text Tab: Enter product description
- Image Tab: Upload design file
- Click "Generate" or "Generate Tech Pack"
\`\`\`

### 2. AI Designer (Quick Start)
\`\`\`
/ai-designer → Click "New Design"
- Enter simple prompt
- Creates minimal entry instantly
- Redirects to editor
\`\`\`

---

## The 8-Step Flow

### Step 1: Build Initial Chat Message (50ms)
- Collects all form data (product idea, category, colors, keywords, etc.)
- Includes Brand DNA if enabled
- Stored for context during edits

### Step 2: Create Minimal Product Entry (200ms)
\`\`\`typescript
createMinimalProductEntry({
  user_prompt: initialMessage,
  projectId: "uuid",
  status: "generating"
})
\`\`\`
Returns projectId immediately - user doesn't wait for AI

### Step 3: Create Chat Session
- Stores initial message in chat history
- Enables context-aware edits later

### Step 4: Redirect to AI Designer (500ms)
\`\`\`
/ai-designer?projectId={uuid}&autoGenerate=true
\`\`\`
- Shows progress modal
- User sees editor immediately

### Step 5-8: Image Generation (2-3 minutes)

#### Stepped Workflow Process:
\`\`\`
Front View Generated (Gemini)
         ↓
Auto-Approved
         ↓
Back View Generated (using front as reference)
Back View + Side View + Top View + Bottom View (all reference front)
         ↓
All 5 Views Uploaded to Storage
         ↓
Initial Revision Created (Revision 0)
         ↓
Display All 5 Views in Editor
\`\`\`

---

## Key Files

| File | Purpose |
|------|---------|
| `components/idea-upload/page.tsx` | User input form |
| `app/actions/create-product-entry.ts` | DB operations |
| `app/ai-designer/designer.tsx` | Editor page |
| `app/actions/idea-generation.ts` | Main orchestrator |
| `app/actions/stepped-image-generation.ts` | Image generation |
| `lib/services/centralized-generation-service.ts` | Service layer |
| `app/actions/create-initial-product-revision.ts` | Revision creation |

---

## Critical Functions

### createMinimalProductEntry()
**Time:** <100ms  
**Does:** Creates DB row without AI  
**Returns:** projectId

### generateIdea()
**Time:** 2-3 minutes  
**Does:** Orchestrates entire generation  
**Calls:** 
- generateProductImage() → stepped workflow
- saveImageToSupabase() → upload to storage
- createInitialProductRevision() → save revision

### generateFrontView()
**Time:** 20-30 seconds  
**Does:**
1. Reserve 3 credits
2. Call Gemini API
3. Upload to storage
4. Create approval record

### generateAdditionalViews()
**Time:** 80-120 seconds  
**Does:** Generate back, side, top, bottom using front as reference

---

## Database Schema (After Generation)

### product_ideas
\`\`\`
id: uuid                    → Project ID
user_id: uuid               → User
prompt: string              → Initial message
status: "images_generated"  → Progress status
image_data: {
  front: { url, prompt_used },
  back: { url, prompt_used },
  side: { url, prompt_used },
  top: { url, prompt_used },
  bottom: { url, prompt_used }
}
tech_pack: { metadata: {...} }  → Stored metadata
created_at: timestamp
updated_at: timestamp
\`\`\`

### product_multiview_revisions (5 records per revision)
\`\`\`
id: uuid                    → Unique revision ID
product_idea_id: uuid       → Links to product
revision_number: 0          → Initial = 0
batch_id: string            → Groups 5 views together
view_type: "front|back|side|top|bottom"
image_url: string           → Storage URL
edit_type: "initial"
ai_model: "gemini-2.5-..."
is_active: true
\`\`\`

---

## AI Services

### Gemini Image API
- Model: `gemini-2.5-flash-image-preview`
- Used for: Image generation
- Called: 5 times (front, back, side, top, bottom)

### OpenAI API
- Models: `gpt-4o`, `gpt-4o-mini`
- Used for: Tech pack generation, prompt enhancement
- Called: Later (when user clicks "Generate Tech Pack")

### Supabase Storage
- Bucket: `product-images`
- Path: `{projectId}/{viewType}-{timestamp}.jpg`

---

## Credit System

**Cost:** 3 credits per initial generation

**Timeline:**
1. Check credits before form submit
2. Reserve 3 credits at start of front view generation
3. Consume credits on success
4. Refund on failure

**Location:** `stepped-image-generation.ts:97`

---

## What Happens When User Creates Product

\`\`\`
USER ACTION: Clicks "Generate"
↓
VALIDATION:
  ✓ User authenticated?
  ✓ Credit balance >= 3?
  ✓ Form filled?
↓
DATABASE (instant):
  CREATE product_ideas row {status: "generating"}
↓
IMMEDIATE REDIRECT:
  Show /ai-designer with autoGenerate=true
  User sees editor within 1-2 seconds
↓
BACKGROUND (2-3 minutes):
  generateIdea() runs stepped workflow
  Generates 5 views
  Creates Revision 0
↓
DISPLAY (progressive):
  Each view appears as it completes
  Progress modal shows status
↓
FINAL STATE:
  All 5 views visible
  Revision history shows Revision 0
  Ready for editing
\`\`\`

---

## Common User Actions & Their Flow

### User: "Change the color"
1. Types edit request in chat
2. Clicks generate
3. New generation starts (similar flow)
4. Creates Revision 1
5. All edits make new revisions (2, 3, 4...)

### User: "I want to adjust the design"
1. Uses annotation tools
2. Makes modifications
3. Clicks generate
4. Stepped workflow runs again
5. Creates next revision

### User: "Go back to original design"
1. Click previous revision in history
2. Revision 0 becomes active again
3. All views switch to original

---

## Testing Checklist

- [ ] User can submit form from idea-upload
- [ ] Project created in database within 1 second
- [ ] Redirect happens immediately after creation
- [ ] Progress modal shows while generating
- [ ] Front view generates (20-30s)
- [ ] Back/side/top/bottom views generate (using front as reference)
- [ ] All 5 views uploaded to storage
- [ ] Revision 0 created with correct batch_id
- [ ] All views display in editor
- [ ] Revision history shows initial revision
- [ ] User can edit and create new revisions
- [ ] Credits deducted correctly

---

## Architecture Decisions

### Why Stepped Workflow?
- Front view sets product identity
- Other views guaranteed consistency
- Auto-approval = no user waiting
- Each view independently regeneratable

### Why Minimal Entry First?
- Immediate feedback to user
- Generation happens in background
- Better perceived performance
- Can create chat context immediately

### Why Batch IDs for Revisions?
- Groups 5 views as single logical unit
- Easy to display "Revision 1" with all 5 views
- Simple to query: find all by batch_id
- Clean history management

---

## Performance Metrics

| Operation | Time |
|-----------|------|
| Form validation | <100ms |
| Create DB entry | 200ms |
| Redirect to editor | 500ms |
| Show editor | <1s |
| Front view generation | 20-30s |
| Additional 4 views | 80-120s |
| Upload to storage | 10-15s |
| Create revision | 2-3s |
| **Total to first view:** | ~30s |
| **Total complete:** | ~2.5-3min |

---

## Error Recovery

| Error | Recovery |
|-------|----------|
| Insufficient credits | Toast + return (no DB create) |
| Front view fails | Refund credits + toast |
| Upload fails | Fallback storage + retry |
| Timeout (3 min) | Show error + offer retry |
| Supabase down | Use temporary storage |
| User closes tab | Generation continues (can refresh) |

---

## Related Documentation

- **Full Workflow:** See `PRODUCT_CREATION_WORKFLOW.md` (991 lines)
- **Image Storage:** See `modules/PRODUCT_IMAGE_GENERATION_FLOW.md`
- **Revision System:** See CREATE_PRODUCT_ENTRY_DOCUMENTATION.md
- **Stepped Workflow:** See stepped-image-generation.ts (500+ lines)

---

**Last Updated:** November 14, 2025  
**Document Version:** 1.0  
**Scope:** Initial product generation (Revision 0)
