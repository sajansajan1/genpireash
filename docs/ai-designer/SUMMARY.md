# View Generation System - Executive Summary

## What is the View Generation System?

The **Stepped View Generation System** in Genpire is a multi-stage workflow that generates product images from multiple angles (front, back, side, top, bottom). It uses a human-in-the-loop approach where users approve the initial front view before automated generation of additional views.

## Key Characteristics

1. **Stepped/Sequential Workflow**: Requires front view approval before generating additional views
2. **AI-Powered**: Uses Google Gemini 2.5 Flash for image generation and OpenAI for feature extraction
3. **Consistency-Focused**: Extracted features from front view ensure all additional views are consistent
4. **Credit-Based**: 3 credits for full generation, 2 for edits/revisions
5. **Revision Tracking**: Maintains history of all revisions and regenerations

---

## Complete Flow at a Glance

\`\`\`
User Input (Text/Image)
         ↓
Generate Front View (Gemini 2.5 Flash)
         ↓
Upload to Storage (Supabase)
         ↓
Create Approval Record (pending)
         ↓
User Approval Decision
    ↓              ↓
  APPROVE      REJECT
    ↓              ↓
Extract Features  Save History
  (OpenAI)     & Try Again
    ↓
Generate 4 Views in Parallel:
  ├─ Back View
  ├─ Side View
  ├─ Top View
  └─ Bottom View
    ↓
Upload All Views
    ↓
Update Approval Record
    ↓
Display to User
\`\`\`

---

## Critical File Locations

### API Entry Points
- **Generate Front**: `/app/api/product-pack-generation/generate-front-view/route.ts`
- **Approve Front**: `/app/api/product-pack-generation/approve-front-view/route.ts`
- **Generate Additional**: `/app/api/product-pack-generation/generate-additional-views/route.ts`

### Business Logic
- **Main Logic**: `/app/actions/stepped-image-generation.ts` (1250 lines)
  - `generateFrontView()` - Lines 70-310
  - `handleFrontViewApproval()` - Lines 315-438
  - `generateAdditionalViews()` - Lines 443-743
  - `extractFeaturesFromImage()` - Lines 1137-1225

### UI Components
- **Workflow**: `/components/tech-pack/stepped-generation/stepped-generation-workflow.tsx`
- **Approval**: `/components/tech-pack/stepped-generation/front-view-approval.tsx`
- **Display**: `/components/tech-pack/stepped-generation/views-display.tsx`

### Services
- **Gemini**: `/lib/ai/gemini.ts` - Google Gemini 2.5 Flash image generation
- **Centralized**: `/lib/services/centralized-generation-service.ts` - Workflow orchestration
- **Revisions**: `/lib/services/revision-generation-service.ts` - Revision management

### Database
- **Tables**: `product_view_approvals`, `view_revision_history`
- **Migration**: `/supabase/migrations/20250830_product_view_approvals.sql`
- **Extension**: `/supabase/migrations/20250922_add_top_bottom_views.sql`

---

## Front View Special Handling

### Front View Characteristics
- **Requires User Approval**: Cannot skip this step
- **Feature Extraction**: Only happens after approval
- **Input Sources**: Text description or reference image
- **Logo Support**: Can add brand logos to image
- **Modifications**: Can edit with feedback for regeneration
- **Credit Cost**: 3 credits (initial) or 2 credits (edit)

### Front View Prompt
- Uses detailed, explicit instructions to Gemini
- Emphasizes "ONLY front view" to prevent multi-view generations
- Includes white background, studio lighting specifications
- Incorporates logo instructions if provided
- Temperature: 0.1 (for consistency)

---

## Additional Views (Back, Side, Top, Bottom)

### Key Differences from Front View
1. **No Approval Required**: Auto-approved after front view approval
2. **Reference-Based**: Use front view URL as Gemini reference image
3. **Feature-Driven**: Prompts incorporate extracted features (colors, materials, dimensions)
4. **Parallel Generation**: All 4 views generated simultaneously
5. **No Additional Credits**: Covered by initial 3-credit payment

### How They Differ from Each Other
- **Back View**: 180° rotation, maintains all consistency rules
- **Side View**: 90° rotation (profile), shows depth
- **Top View**: Overhead perspective (looking down)
- **Bottom View**: Underside perspective (looking up)

Each view gets its own specific prompt emphasizing the angle and what should be visible from that perspective.

---

## Critical Services & APIs

### Google Gemini 2.5 Flash Image Preview
- **Purpose**: Generate product images from text/image prompts
- **Model**: `gemini-2.5-flash-image-preview`
- **Features**:
  - Accepts prompt + reference image + logo image
  - Returns base64 data URL
  - Configurable retry logic (3-5 attempts)
  - Exponential backoff with jitter for reliability
- **Key Setting**: Temperature 0.1 ensures consistent outputs

### OpenAI GPT-4o Mini (Vision)
- **Purpose**: Extract features from front view image
- **Function**: `extractFeaturesFromImage()`
- **Extracts**:
  - Colors (hex codes + names)
  - Materials and textures
  - Key design elements
  - Estimated dimensions
  - Description

### Supabase Storage
- **Purpose**: Store generated images
- **Method**: Upload data URLs, receive signed URLs
- **Settings**: Keep original quality, don't compress
- **Indexing**: URLs stored in database for retrieval

---

## Database Schema

### product_view_approvals (Main Table)
\`\`\`
Stores: id, user_id, session_id, 
        front/back/side/top/bottom_view_url,
        front/back/side/top/bottom_view_prompt,
        extracted_features (JSONB),
        status (pending/approved/revision_requested),
        user_feedback, timestamps
\`\`\`

### view_revision_history (Revision Tracking)
\`\`\`
Stores: id, approval_id, view_type, image_url, prompt, 
        user_feedback, created_at
\`\`\`

### revisions (Version Control)
\`\`\`
Stores: id, project_id, revision_number, image_data (JSONB),
        changes_made (regenerated/preserved views), timestamps
\`\`\`

---

## Credit System

### Initial Generation: 3 Credits
- Covers: Front view + all additional views
- Deducted upfront before generation starts
- Refunded only if generation completely fails

### Edit/Revision: 2 Credits
- Covers: Regenerating front view with modifications
- Triggered when `modifications` flag is set
- Used when user requests changes to existing front view

### Failed Generation Refunds
- If front view generation fails: 3 or 2 credits refunded
- If additional views fail: NO refund (front view already delivered)

---

## Critical Distinctions

### Initial Generation vs Revision
- **Initial**: First time generating views → 3 credits → Full workflow
- **Revision**: User rejects → 2 credits → Same workflow with edit flag

### Front View Approval vs Additional Views
- **Front View**: Requires explicit user approval
- **Additional Views**: Auto-approved, no user decision

### Consistency Mechanism
- **Reference Image**: Front view passed to Gemini for all other views
- **Extracted Features**: Colors, materials, dimensions specified in prompts
- **Result**: All views show same product from different angles

---

## Error Handling & Fallbacks

### Approval Record Creation
- Tries Supabase 3 times with exponential backoff
- Falls back to temporary in-memory storage if DB unavailable
- Shows migration message if table doesn't exist

### Image Generation Retry
- Retries 3-5 times with exponential backoff + jitter
- Catches 500/502/503 errors and retries
- Falls back to text response if image generation fails

### Feature Extraction
- Returns default empty values if extraction fails
- Non-critical: workflow continues even if features can't be extracted
- User can still approve views without extracted features

### Upload Failures
- Throws error if upload fails
- Workflow stops and returns error to user
- Credits are not deducted (or refunded if already reserved)

---

## Performance & Optimization

### Parallel Generation
- Back, side, top, bottom views generated simultaneously
- Uses `Promise.allSettled()` to handle partial failures
- Reduces total generation time from 4x to 1x

### Background Processing
- Image analysis runs asynchronously after generation
- Uses `analyzeAndSaveProductImages()` (non-blocking)
- Caches analysis for future use

### Database Indexes
- `idx_product_view_approvals_user_id`
- `idx_product_view_approvals_session_id`
- `idx_product_view_approvals_status`
- `idx_view_revision_history_approval_id`

### Retry Strategy
- Exponential backoff: 1s → 2s → 4s
- Jitter added to prevent thundering herd
- Max retries: 3-5 depending on operation

---

## Security & Privacy

### Row Level Security (RLS)
- Users can only view their own approvals
- Users can only insert/update their own records
- Revision history access tied to approval ownership

### Input Validation
- All API endpoints validate required parameters
- Approval IDs checked against user ID
- Status values validated against constraints

### Sensitive Data
- No passwords or tokens logged
- Image URLs stored as signed URLs (expire over time)
- Extracted features stored in JSONB for flexibility

---

## Common Workflows

### Happy Path (Approve First Try)
1. User inputs text/image
2. Front view generated (3 credits reserved)
3. User approves → Features extracted
4. Back/Side/Top/Bottom views generated in parallel
5. All views displayed to user
6. 3 credits charged

### Rejection & Regeneration
1. User inputs text/image
2. Front view generated
3. User rejects with feedback
4. History saved, status → revision_requested
5. User regenerates (2 credits reserved)
6. Approves new front view
7. Additional views generated
8. 2 credits charged (if successful)

### Selective Regeneration
1. Keep front view, regenerate back/side only
2. Use `createRevision()` from revision service
3. Specify `viewsToRegenerate: ["back", "side"]`
4. Specify `preserveViews: ["front"]`
5. New revision created with mixed views

---

## Metrics & Monitoring

### Available Logging
- `aiLogger` tracks all Gemini generations
- Detailed error messages logged to console
- Database operations logged with retry counts
- API response times trackable

### What Gets Tracked
- Model: `gemini-2.5-flash-image-preview`
- Feature: `stepped_front_view_generation` / `stepped_additional_views_generation`
- Session ID: unique per workflow
- User ID: for analytics
- Input type: text or image

---

## Future Enhancement Opportunities

1. **Batch View Generation**: Generate multiple product variations at once
2. **Style Options**: Different illustration styles beyond photorealistic
3. **Auto-Regeneration**: Automatically improve views based on quality metrics
4. **View Comparison**: Side-by-side comparison of revisions
5. **Template System**: Pre-saved prompts for common product types
6. **3D Integration**: Generate 3D models from generated views (Meshy.ai)
7. **Quality Scoring**: ML-based quality assessment before approval

---

## Quick Reference Commands

### Generate Front View
\`\`\`bash
POST /api/product-pack-generation/generate-front-view
Body: { input: { type, content }, options?, sessionId? }
Response: { success, approvalId, sessionId, frontView }
\`\`\`

### Approve Front View
\`\`\`bash
POST /api/product-pack-generation/approve-front-view
Body: { approvalId, approved: true, feedback? }
Response: { success, extractedFeatures }
\`\`\`

### Generate Additional Views
\`\`\`bash
POST /api/product-pack-generation/generate-additional-views
Body: { approvalId }
Response: { success, views: { back, side, top, bottom } }
\`\`\`

---

## Summary Statistics

- **Total Files Involved**: 20+
- **Main Logic File**: stepped-image-generation.ts (1,250 lines)
- **Database Tables**: 3 (product_view_approvals, view_revision_history, revisions)
- **Views Supported**: 5 (front, back, side, top, bottom)
- **AI Services Used**: 2 (Gemini for images, OpenAI for features)
- **Storage Service**: Supabase Storage
- **Credit Cost**: 3 (initial) or 2 (edit)
- **Workflow Steps**: 4 (Input → Front Gen → Approval → Additional Views)
