# AI Designer View Generation System - Complete Flow Documentation

## Overview
The view generation system in Genpire follows a **stepped workflow** that generates product images from one view (front) through approval to additional views (back, side, top, bottom). All views use extracted features for consistency.

---

## 1. WHERE VIEW GENERATION IS TRIGGERED

### Entry Points

#### A. API Routes
- **POST `/api/product-pack-generation/generate-front-view`** - Initiates front view generation
  - File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/api/product-pack-generation/generate-front-view/route.ts` (Lines 1-39)
  - Calls: `generateFrontView()` from server actions
  
- **POST `/api/product-pack-generation/approve-front-view`** - Approves or rejects front view
  - File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/api/product-pack-generation/approve-front-view/route.ts` (Lines 1-39)
  - Calls: `handleFrontViewApproval()` from server actions

- **POST `/api/product-pack-generation/generate-additional-views`** - Generates back, side, top, bottom views
  - File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/api/product-pack-generation/generate-additional-views/route.ts` (Lines 1-35)
  - Calls: `generateAdditionalViews()` from server actions

#### B. UI Components
- **SteppedGenerationWorkflow** - Main workflow component
  - File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/components/tech-pack/stepped-generation/stepped-generation-workflow.tsx`
  - Manages 4-step workflow: Input → Front Generation → Front Approval → Additional Generation → Complete
  - Lines 58-95: `generateFrontView()` function triggers API call
  - Lines 98-130: `handleFrontViewApproval()` triggers approval and auto-generates additional views
  - Lines 166-199: `generateAdditionalViews()` triggered automatically after approval

---

## 2. COMPLETE FLOW FROM GENERATION REQUEST TO IMAGES BEING CREATED

### Step 1: Front View Generation (User Input → Image Creation)

**Trigger:** User clicks "Generate Front View" button in SteppedGenerationWorkflow component
- File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/components/tech-pack/stepped-generation/stepped-generation-workflow.tsx` (Lines 302-312)

**Flow:**
1. User provides input (text OR image)
2. Component calls API: `POST /api/product-pack-generation/generate-front-view`
3. API route calls server action: `generateFrontView(params)`
   - File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/actions/stepped-image-generation.ts` (Lines 70-310)

**What happens inside `generateFrontView()`:**

| Step | Line | Details |
|------|------|---------|
| 1. Auth Check | 82-88 | Verify user is authenticated with Supabase |
| 2. Credit Reserve | 96-104 | Reserve 3 credits (initial) or 2 credits (edit with modifications) |
| 3. Prompt Building | 110 | Call `buildFrontViewPrompt()` (Lines 747-807) |
| 4. Image Generation | 132-145 | Call `geminiService.generateImage()` with: <br> - Prompt: front view instructions <br> - Reference image (if provided) <br> - Logo image (if provided) <br> - Style: photorealistic <br> - View type: "front" |
| 5. Image Upload | 151-161 | Call `ImageService.getInstance().upload()` <br> - Uploads to Supabase storage <br> - Returns signed URL |
| 6. Approval Record | 178-241 | Create `product_view_approvals` record with: <br> - `front_view_url` <br> - `front_view_prompt` <br> - `status: 'pending'` <br> - `extracted_features: null` (added later) |
| 7. Return | 275-284 | Return `{ success, approvalId, sessionId, frontView }` |

**Database Schema:**
- Table: `product_view_approvals`
- Relevant columns: `id`, `user_id`, `session_id`, `front_view_url`, `front_view_prompt`, `status`, `user_feedback`, `extracted_features`

---

### Step 2: Front View Approval & Feature Extraction

**Trigger:** User clicks "Approve" button in FrontViewApproval component
- File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/components/tech-pack/stepped-generation/front-view-approval.tsx` (Lines 35-46)

**Flow:**
1. Component calls API: `POST /api/product-pack-generation/approve-front-view`
2. API calls: `handleFrontViewApproval(params)`
   - File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/actions/stepped-image-generation.ts` (Lines 315-438)

**What happens inside `handleFrontViewApproval()`:**

| Step | Line | Details |
|------|------|---------|
| 1. Fetch Approval | 336-347 | Get approval record from database |
| 2. If Approved | 349-395 | When `approved === true`: |
| | 373 | Extract features from front view image |
| | 385-388 | Save features to approval record |
| | 391-395 | Return `{ success, status: 'approved', extractedFeatures }` |
| 3. If Rejected | 396-428 | When `approved === false`: |
| | 398-410 | Save rejection history to `view_revision_history` table |
| | 413-419 | Update approval status to 'revision_requested' |

**Feature Extraction Process:**
- Function: `extractFeaturesFromImage()` (Lines 1137-1225)
- Uses OpenAI's `gpt-4o-mini` model with vision capabilities
- Analyzes front view image and extracts:
  - Colors (hex codes and names)
  - Materials and textures
  - Key design elements
  - Estimated dimensions
  - Detailed description
- Returns JSON stored in `extracted_features` JSONB column

**Database Updates:**
- Update `product_view_approvals` set:
  - `status = 'approved'`
  - `approved_at = NOW()`
  - `extracted_features = { colors, materials, keyElements, estimatedDimensions, description }`

---

### Step 3: Additional Views Generation (Back, Side, Top, Bottom)

**Trigger:** After front view approval, component automatically calls `generateAdditionalViews()`
- File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/components/tech-pack/stepped-generation/stepped-generation-workflow.tsx` (Lines 124-125)

**Flow:**
1. Component calls API: `POST /api/product-pack-generation/generate-additional-views`
2. API calls: `generateAdditionalViews(approvalId)`
   - File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/actions/stepped-image-generation.ts` (Lines 443-743)

**What happens inside `generateAdditionalViews()`:**

| Step | Line | Details |
|------|------|---------|
| 1. Auth & Validation | 457-512 | Authenticate user, fetch approval record with `status = 'approved'` |
| 2. Extract Features | 514-533 | Get features from approval record (colors, materials, etc.) |
| 3. Parallel Generation | 555-585 | Generate 4 views in parallel using `Promise.allSettled()`: <br> - `generateBackView()` <br> - `generateSideView()` <br> - `generateTopView()` <br> - `generateBottomView()` |
| 4. Upload Images | 588-615 | Upload each generated image via `uploadGeneratedImage()` |
| 5. Update DB | 631-674 | Update approval record with: <br> - `back_view_url`, `back_view_prompt` <br> - `side_view_url`, `side_view_prompt` <br> - `top_view_url`, `top_view_prompt` <br> - `bottom_view_url`, `bottom_view_prompt` |
| 6. Background Analysis | 686-716 | Call `analyzeAndSaveProductImages()` for caching (non-blocking) |
| 7. Return | 718-726 | Return all generated view URLs and prompts |

---

## 3. HOW FRONT VIEW IS HANDLED VS OTHER VIEWS

### Front View - Special Characteristics

**Front View Generation (Initial):**
\`\`\`
Input → Prompt Building → Gemini Image Gen → Image Upload → Approval Workflow
\`\`\`

**Key Points:**
- File: `stepped-image-generation.ts` (Lines 70-310)
- Requires user approval before other views are generated
- Uses explicit prompt with critical instructions (Lines 780-803)
- May use reference image if user uploads one
- May include logo if provided
- Credits deducted: 3 (initial) or 2 (edit/modifications)
- Stored in table with status tracking: `pending`, `approved`, `revision_requested`

**Front View Prompt (buildFrontViewPrompt):**
\`\`\`
Generate a photorealistic product image:

${productDescription}

CRITICAL REQUIREMENTS:
- Generate ONLY the FRONT VIEW of the product
- This must be a SINGLE IMAGE showing ONLY the front perspective
- DO NOT create a grid, collage, or multiple views in one image
- DO NOT show back view or side view in this image
- Generate ONE product from ONE angle only

[Additional style/quality requirements...]
\`\`\`
(Full prompt: Lines 747-807)

### Additional Views - Dependent on Front View

**Back/Side/Top/Bottom View Generation:**
\`\`\`
Approved Front View → Feature Extraction → Parallel Generation → Database Update
\`\`\`

**Key Differences:**
1. **Require Approval First**
   - Only generated after front view is approved
   - Use extracted features from front view for consistency
   
2. **Use Front View as Reference**
   - All prompts pass `referenceImage: frontViewUrl`
   - Gemini service uses this to maintain consistency
   
3. **Feature-Driven Prompts**
   - Colors extracted from front view are specified in prompts
   - Materials and key elements are maintained
   - No user approval step - all auto-approved
   
4. **No Additional Credits**
   - Credits deducted upfront (with front view generation)
   - Failed additional views don't cause refund (user still has front)

### Prompt Pattern for Additional Views

**Back View Example (Lines 809-879):**
\`\`\`
Generate the BACK VIEW of this exact product shown in the reference image.

CRITICAL REQUIREMENTS:
- Generate ONLY the BACK VIEW of the product
- This must be a SINGLE IMAGE showing ONLY the back perspective
- DO NOT create a grid, collage, or multiple views in one image
- DO NOT show front view or side view in this image
- This MUST be the exact SAME product as in the reference image

CONSISTENCY RULES:
- Colors must match exactly: ${colorList}
- Dimensions must be identical
- Material textures must be the same: ${materials}
- Design elements must align with front view
\`\`\`

**Side View (Lines 881-950):**
- 90° rotation from front
- Same consistency rules as back view

**Top View (Lines 952-1052):**
- Overhead perspective
- Looking down from above
- Maintains all colors/materials/proportions

**Bottom View (Lines 1054-1130):**
- Underside perspective
- Looking up from below
- Same consistency requirements

---

## 4. WHAT SERVICES/APIS ARE USED FOR IMAGE GENERATION

### Primary Service: Google Gemini 2.5 Flash Image Preview

**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/ai/gemini.ts`

**Class:** `GeminiImageService`
- Constructor (Lines 71-83): Initializes with Gemini API key
- Main method: `generateImage()` (called in stepped-image-generation.ts)

**Parameters Passed to Gemini:**
\`\`\`typescript
interface ImageGenerationParams {
  prompt: string;                    // Detailed generation instructions
  referenceImage?: string;           // Base64 data URL
  logoImage?: string;                // Base64 data URL
  productType?: string;              // Product description
  view?: "front" | "back" | "side" | "top" | "bottom" | ...;
  style?: "photorealistic" | "technical" | "vector" | "detail";
  options?: {
    retry?: number;                  // Retry count (3-5)
    fallbackEnabled?: boolean;       // Fallback on failure
    enhancePrompt?: boolean;        // Auto-enhance (false for consistency)
  };
}
\`\`\`

**Gemini API Call Details:**
- Model: `gemini-2.5-flash-image-preview`
- Temperature: 0.1 (for consistency)
- Max retries: 3-5 with exponential backoff
- Retry mechanism: exponential backoff + jitter (Lines 107-140)

### Secondary Service: OpenAI (For Feature Extraction)

**Model:** `gpt-4o-mini` with vision capabilities
- Function: `extractFeaturesFromImage()` (Lines 1137-1225)
- Purpose: Analyze front view to extract colors, materials, dimensions, key elements
- Uses base64 image data for analysis
- Returns JSON with structured feature data

**Feature Extraction Prompt:**
\`\`\`
You are an expert at analyzing product images and extracting key features for manufacturing consistency.

Analyze the product image and extract:
1. All visible colors with hex codes
2. Materials and textures
3. Key design elements
4. Estimated dimensions/proportions
5. Detailed product description

Return the data in JSON format.
\`\`\`

### Image Storage & Hosting: Supabase Storage

**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/services/image-service.ts`

**Process:**
1. `uploadGeneratedImage()` (Lines 1227-1248 in stepped-image-generation.ts)
2. Calls: `ImageService.getInstance().upload(dataUrl, options)`
3. Uploads to Supabase Storage bucket
4. Returns signed URL for image access

**Upload Options:**
\`\`\`typescript
{
  projectId?: string;        // For URL structure
  preset: "original";        // Keep original quality for views
  preserveOriginal: true;   // Don't compress
}
\`\`\`

### 3D Model Generation: Meshy.ai (Webhook-based)

**Note:** Separate from 2D view generation, but related
- File: `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/api/webhooks/meshy/route.ts`
- Webhook endpoint receives 3D model generation updates
- Updates `product_3d_models` table
- Credits: 10 credits deducted on completion
- Not directly involved in 2D view generation workflow

---

## 5. HOW VIEWS ARE STORED AND ASSOCIATED WITH REVISIONS

### Primary Storage Table: `product_view_approvals`

**Purpose:** Tracks the entire stepped workflow for a product design iteration

**Schema:**
\`\`\`sql
CREATE TABLE product_view_approvals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  
  -- Front view (initial)
  front_view_url TEXT NOT NULL,
  front_view_prompt TEXT,
  
  -- Additional views (generated after approval)
  back_view_url TEXT,
  back_view_prompt TEXT,
  side_view_url TEXT,
  side_view_prompt TEXT,
  top_view_url TEXT,
  top_view_prompt TEXT,
  bottom_view_url TEXT,
  bottom_view_prompt TEXT,
  
  -- Feature data
  extracted_features JSONB,         -- Colors, materials, dimensions
  
  -- Workflow tracking
  status TEXT CHECK (status IN ('pending', 'approved', 'revision_requested')) DEFAULT 'pending',
  user_feedback TEXT,
  
  -- Timestamps
  created_at TIMESTAMP,
  approved_at TIMESTAMP,
  updated_at TIMESTAMP
);
\`\`\`

**Indexes:**
\`\`\`sql
idx_product_view_approvals_user_id
idx_product_view_approvals_session_id
idx_product_view_approvals_status
\`\`\`

**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/supabase/migrations/20250830_product_view_approvals.sql`

### Revision History Table: `view_revision_history`

**Purpose:** Track all revisions requested during the approval process

**Schema:**
\`\`\`sql
CREATE TABLE view_revision_history (
  id UUID PRIMARY KEY,
  approval_id UUID REFERENCES product_view_approvals(id) ON DELETE CASCADE,
  view_type TEXT CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom')),
  image_url TEXT NOT NULL,
  prompt TEXT,
  user_feedback TEXT,
  created_at TIMESTAMP
);
\`\`\`

**Purpose:**
- Records when user rejects front view
- Stores previous version URL and user's feedback
- Allows comparison between revisions
- Enables "regenerate" workflow

### Extended Views Support

**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/supabase/migrations/20250922_add_top_bottom_views.sql`

**Added Columns to product_view_approvals:**
\`\`\`sql
ALTER TABLE product_view_approvals
ADD COLUMN IF NOT EXISTS top_view_url TEXT,
ADD COLUMN IF NOT EXISTS top_view_prompt TEXT,
ADD COLUMN IF NOT EXISTS bottom_view_url TEXT,
ADD COLUMN IF NOT EXISTS bottom_view_prompt TEXT;
\`\`\`

**Updated view_revision_history constraint:**
\`\`\`sql
ALTER TABLE view_revision_history
ADD CONSTRAINT view_revision_history_view_type_check
CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom'));
\`\`\`

### Revision Management Service

**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/services/revision-generation-service.ts`

**Functions:**
1. `createRevision()` (Lines 42-151)
   - Creates new revision with selective view regeneration
   - Can preserve specific views while regenerating others
   - Tracks changes in `changes_made` field

2. `createInitialRevision()` (Lines 156-200)
   - Creates revision 0 when project first created
   - Records initial generation as first revision

**Revision Schema:**
\`\`\`typescript
{
  projectId: string;
  revisionNumber: number;
  userPrompt: string;
  imageData: {
    [viewName]: ImageData        // { url, prompt_used, created_at }
  };
  changesMade: {
    regenerated: string[];       // Views that were regenerated
    preserved: string[];         // Views kept unchanged
    modifications?: string;
  };
  createdAt: Date;
}
\`\`\`

---

## 6. INITIAL GENERATION VS REGENERATING VIEWS

### Initial Generation Flow

**Trigger:** New product, no existing approval

**Process:**
1. Generate Front View (requires approval)
2. Extract Features
3. Generate Additional Views (automatic)
4. All stored in single `product_view_approvals` record

**Credit Cost:** 3 credits (all views)

**File Path:**
- Main logic: `app/actions/stepped-image-generation.ts` (Lines 70-743)
- Component: `components/tech-pack/stepped-generation/stepped-generation-workflow.tsx`

### Regenerating/Revising Front View

**Trigger:** User rejects front view → clicks regenerate

**Process:**
1. User provides feedback → clicks "Request Revision"
2. Status changes to `revision_requested`
3. Revision saved to `view_revision_history`
4. User can provide modifications/new text
5. Click "Generate Front View" again
6. New front view generated → back to approval step
7. Additional views regenerated on approval

**Credit Cost:** 2 credits (edit flag set)

**Code Path:**
- Rejection handler: `handleFrontViewRejection()` (Lines 133-163)
- Saves revision history: `view_revision_history` insert (Lines 398-410)
- Status update: `revision_requested` (Lines 413-419)
- Regenerate: Same `generateFrontView()` called again with `isEditRequest: true`

### Regenerating Additional Views Only

**Scenario:** Keep front view, regenerate back/side views

**Process:**
1. Use `createRevision()` from revision-generation-service
2. Specify `viewsToRegenerate: ["back", "side"]`
3. Specify `preserveViews: ["front"]`
4. System re-extracts features from existing front view
5. Regenerates only specified views
6. Updates `revisions` table with new image_data

**Code Path:**
- Function: `createRevision()` (Lines 42-151 in revision-generation-service.ts)
- Tracks in database: `revisions` table with:
  - `changes_made: { regenerated: ["back", "side"], preserved: ["front"] }`

### Centralized Generation Service

**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/services/centralized-generation-service.ts`

**Functions:**
1. `generateMultiViewProduct()` (Lines 98-121)
   - Main entry point for all generation
   - Handles both stepped and direct workflows
   
2. `generateWithSteppedWorkflow()` (Lines 127-238)
   - Implements stepped workflow: Front → Auto-approve → Additional views
   - Can set `autoApprove: true` for automatic approval
   - Config includes:
     \`\`\`typescript
     {
       useSteppedWorkflow?: boolean;
       generateExtraViews?: boolean;    // bottom, illustration
       logo?: { image, position, size };
       referenceImage?: string;
       modifications?: string;          // Triggers edit mode (2 credits)
       style?: 'photorealistic' | 'technical' | 'vector' | 'detail';
       autoApprove?: boolean;
     }
     \`\`\`

3. `regenerateViews()` (referenced in revision service)
   - Regenerates specific views while preserving others
   - Uses existing images as reference for consistency

### Credit System

**Initial Generation:** 3 credits
- Covers: Front view + all additional views

**Edit/Revision:** 2 credits
- Covers: Regenerating front view with modifications

**Additional Views Only:** Already paid (no additional cost)
- Covered under initial 3-credit payment

**Failed Generation:** Credits refunded
- `RefundCredits()` called on error (Lines 291-300)
- Only if generation fails, not if additional views fail

---

## Key Database Views & Relationships

\`\`\`
product_view_approvals (main table)
├── id (PK)
├── user_id (FK to auth.users)
├── session_id
├── front_view_url → Supabase Storage
├── back_view_url → Supabase Storage
├── side_view_url → Supabase Storage
├── top_view_url → Supabase Storage
├── bottom_view_url → Supabase Storage
├── extracted_features (JSONB)
└── status: pending/approved/revision_requested

view_revision_history (history tracking)
├── id (PK)
├── approval_id (FK to product_view_approvals)
├── view_type: front/back/side/top/bottom
├── image_url → Supabase Storage
├── user_feedback
└── created_at

revisions (version tracking)
├── id (PK)
├── project_id (FK)
├── revision_number
├── image_data (JSONB with all views)
├── changes_made (JSONB with regenerated/preserved info)
└── created_at
\`\`\`

---

## Summary: View Generation Timeline

\`\`\`
1. USER INPUT
   ↓
2. FRONT VIEW GENERATION (gemini-2.5-flash)
   ↓
3. IMAGE UPLOAD (Supabase Storage)
   ↓
4. APPROVAL RECORD CREATION (product_view_approvals, status=pending)
   ↓
5. USER APPROVAL
   ├─ If APPROVED:
   │  ├─ Feature Extraction (gpt-4o-mini vision)
   │  ├─ Update approval (status=approved, extracted_features)
   │  └─ Auto-trigger step 6
   │
   └─ If REJECTED:
      ├─ Save to view_revision_history
      ├─ Update approval (status=revision_requested)
      └─ Return to step 2
   ↓
6. PARALLEL VIEW GENERATION
   ├─ generateBackView() → gemini-2.5-flash (using front as reference + features)
   ├─ generateSideView() → gemini-2.5-flash (using front as reference + features)
   ├─ generateTopView() → gemini-2.5-flash (using front as reference + features)
   └─ generateBottomView() → gemini-2.5-flash (using front as reference + features)
   ↓
7. IMAGE UPLOADS (All views to Supabase Storage)
   ↓
8. DATABASE UPDATE (approval record with all view URLs/prompts)
   ↓
9. BACKGROUND IMAGE ANALYSIS (Cache for future use)
   ↓
10. WORKFLOW COMPLETE
\`\`\`
