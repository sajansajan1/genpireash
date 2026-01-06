# View Generation System - File Index & Quick Reference

## API Routes

### Frontend View Generation
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/api/product-pack-generation/generate-front-view/route.ts`
- Lines 1-39: POST endpoint that calls `generateFrontView()`
- Validates input parameters
- Returns: `{ success, approvalId, sessionId, frontView }`

### Front View Approval
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/api/product-pack-generation/approve-front-view/route.ts`
- Lines 1-39: POST endpoint that calls `handleFrontViewApproval()`
- Validates `approvalId` and `approved` parameters
- Returns: `{ success, error }`

### Additional Views Generation
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/api/product-pack-generation/generate-additional-views/route.ts`
- Lines 1-35: POST endpoint that calls `generateAdditionalViews()`
- Validates `approvalId` parameter
- Returns: `{ success, views: { back, side, top, bottom } }`

### Meshy 3D Webhook
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/api/webhooks/meshy/route.ts`
- Lines 46-332: Receives Meshy 3D model generation updates
- Lines 75-129: Handles SUCCEEDED status - fetches complete model data
- Lines 221-301: Deducts 10 credits on successful generation
- Updates: `product_3d_models` table with model URLs and status

---

## Server Actions (Business Logic)

### Main Stepped Image Generation
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/actions/stepped-image-generation.ts`

#### Functions:

1. **generateFrontView()** (Lines 70-310)
   - Authenticates user
   - Reserves 3 or 2 credits
   - Builds prompt via `buildFrontViewPrompt()`
   - Calls Gemini service
   - Uploads to Supabase
   - Creates approval record
   - Returns approval ID

2. **handleFrontViewApproval()** (Lines 315-438)
   - Fetches approval record
   - If approved: extracts features via `extractFeaturesFromImage()`
   - If rejected: saves to `view_revision_history`
   - Updates approval status

3. **generateAdditionalViews()** (Lines 443-743)
   - Validates user & approval
   - Extracts features from approval
   - Parallel generation: back, side, top, bottom views
   - Uploads all images
   - Updates approval record
   - Triggers background analysis
   - Returns all view URLs

4. **buildFrontViewPrompt()** (Lines 747-807)
   - Constructs detailed Gemini prompt
   - Includes logo instructions if provided
   - Returns trimmed prompt string

5. **generateBackView()** (Lines 809-879)
   - Takes front view URL and features
   - Builds back-view-specific prompt
   - Calls Gemini service with consistency rules
   - Returns: `{ url, prompt }`

6. **generateSideView()** (Lines 881-950)
   - Takes front view URL and features
   - Builds side-view-specific prompt (90° rotation)
   - Calls Gemini service
   - Returns: `{ url, prompt }`

7. **generateTopView()** (Lines 952-1052)
   - Takes front view URL and features
   - Builds overhead-view-specific prompt
   - Calls Gemini service
   - Returns: `{ url, prompt }`

8. **generateBottomView()** (Lines 1054-1130)
   - Takes front view URL and features
   - Builds underside-view-specific prompt
   - Calls Gemini service
   - Returns: `{ url, prompt }`

9. **extractFeaturesFromImage()** (Lines 1137-1225)
   - Uses OpenAI gpt-4o-mini with vision
   - Converts URL to base64 if needed
   - Extracts colors, materials, dimensions, key elements
   - Returns JSON-parsed features or defaults

10. **uploadGeneratedImage()** (Lines 1227-1248)
    - Uses ImageService singleton
    - Uploads data URL to Supabase
    - Returns signed URL or throws error

---

## UI Components

### Stepped Generation Workflow
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/components/tech-pack/stepped-generation/stepped-generation-workflow.tsx`

- Lines 22-46: Component setup and state management
- Lines 45-55: File upload handler
- Lines 58-95: Front view generation function (API call)
- Lines 98-130: Front view approval handler
- Lines 133-163: Front view rejection handler
- Lines 166-199: Additional views generation function
- Lines 202-206: Progress calculation
- Lines 221-315: JSX for "Input" step
- Lines 317-328: JSX for "Front Generation" step
- Lines 330-340: JSX for "Front Approval" step
- Lines 342-349: JSX for "Additional Generation" step

**Workflow Steps:**
1. Input (text or image)
2. Front Generation (loading state)
3. Front Approval (FrontViewApproval component)
4. Additional Generation (loading state)
5. Complete (ViewsDisplay component)

### Front View Approval Component
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/components/tech-pack/stepped-generation/front-view-approval.tsx`

- Lines 22-30: Component props interface
- Lines 35-46: Approve handler
- Lines 48-63: Reject handler
- Lines 65-89: Status badge rendering
- Lines 91-183: Main card UI with image preview and action buttons

### Views Display Component
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/components/tech-pack/stepped-generation/views-display.tsx`

- Lines 25-72: Product views tabs (Front, Back, Side)
- Lines 74-156: Extracted features display (Colors, Materials, etc.)

---

## AI/ML Services

### Gemini Image Generation Service
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/ai/gemini.ts`

- Lines 71-83: Constructor (initializes with API key)
- Lines 88-102: `processGeminiResponse()` - extracts image data
- Lines 107-140: `callGeminiWithRetry()` - retry mechanism with exponential backoff
- Lines 145-185: `fetchImageAsBase64()` - converts URL to base64
- Lines 190-213: `parseImageData()` - handles data URLs and regular URLs
- Model: `gemini-2.5-flash-image-preview`
- Temperature: 0.1 (for consistency)

### Centralized Generation Service
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/services/centralized-generation-service.ts`

- Lines 26-49: `urlToBase64DataUrl()` - converts HTTP URLs to data URLs
- Lines 98-121: `generateMultiViewProduct()` - main entry point
- Lines 127-238: `generateWithSteppedWorkflow()` - implements stepped workflow
  - Step 1: Generate front view
  - Step 2: Auto-approve
  - Step 3: Generate additional views
- Lines 243-320: `generateExtraViewsHelper()` - bottom and illustration views
- Lines 326-349: `generateDirectMultiView()` - legacy direct generation (no approval)

### Revision Generation Service
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/services/revision-generation-service.ts`

- Lines 42-151: `createRevision()` - creates new revision with selective regeneration
- Lines 156-200: `createInitialRevision()` - creates revision 0
- Supports `viewsToRegenerate` and `preserveViews` parameters

---

## Database & Storage

### Database Migrations

#### Product View Approvals
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/supabase/migrations/20250830_product_view_approvals.sql`

- Lines 1-18: `product_view_approvals` table creation
  - Columns: id, user_id, session_id, front_view_url, back_view_url, side_view_url, extracted_features, status, etc.
  - Status check: pending/approved/revision_requested

- Lines 20-29: `view_revision_history` table creation
  - Columns: id, approval_id, view_type, image_url, prompt, user_feedback
  - View type check: front/back/side

- Lines 31-35: Index creation for performance

- Lines 37-52: RLS policies for security

#### Top/Bottom Views Extension
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/supabase/migrations/20250922_add_top_bottom_views.sql`

- Lines 1-6: Add top_view_url, top_view_prompt, bottom_view_url, bottom_view_prompt columns
- Lines 8-14: Update view_revision_history constraint to include top/bottom

---

## Types & Interfaces

### Stepped Image Generation
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/app/actions/stepped-image-generation.ts`

- Lines 26-48: `FrontViewGenerationParams`
  - input: { type, content }
  - options: { logo, style, modifications, isEditRequest }

- Lines 50-54: `ApprovalParams`
  - approvalId, approved, feedback

- Lines 56-65: `ReferenceImageData`
  - frontViewUrl, extractedFeatures

### Centralized Generation
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/services/centralized-generation-service.ts`

- Lines 54-67: `GenerationConfig`
  - useSteppedWorkflow, generateExtraViews, logo, referenceImage, modifications, style, autoApprove

- Lines 72-85: `GenerationResult`
  - success, approvalId, sessionId, images, error

- Lines 87-92: `ImageData`
  - url, prompt_used, created_at, regenerated

### Gemini Service
**File:** `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/lib/ai/gemini.ts`

- Lines 13-39: `ImageGenerationParams`
- Lines 41-51: `GeneratedImage`
- Lines 53-66: `TechPackGenerationParams`

---

## Data Flow Summary

\`\`\`
User Input
    ↓
SteppedGenerationWorkflow Component
    ├─ File: stepped-generation-workflow.tsx
    └─ State: step, input, processing, error
    ↓
POST /api/product-pack-generation/generate-front-view
    ├─ File: app/api/.../generate-front-view/route.ts
    └─ Calls: generateFrontView() server action
    ↓
generateFrontView() (stepped-image-generation.ts:70)
    ├─ Auth check
    ├─ Credit reserve (3 or 2)
    ├─ Prompt building
    ├─ Gemini image generation
    ├─ Supabase storage upload
    └─ Create approval record
    ↓
FrontViewApproval Component (front-view-approval.tsx)
    ├─ User reviews image
    └─ Approve or Reject
    ↓
POST /api/product-pack-generation/approve-front-view
    ├─ File: app/api/.../approve-front-view/route.ts
    └─ Calls: handleFrontViewApproval() server action
    ↓
handleFrontViewApproval() (stepped-image-generation.ts:315)
    ├─ If approved:
    │  ├─ Feature extraction (OpenAI gpt-4o-mini)
    │  └─ Update approval record
    └─ If rejected:
       ├─ Save revision history
       └─ Update status
    ↓
generateAdditionalViews() triggered
    ├─ File: stepped-image-generation.ts:443
    ├─ Parallel generation: back, side, top, bottom
    ├─ Image uploads
    └─ Database updates
    ↓
ViewsDisplay Component (views-display.tsx)
    ├─ Shows all 5 views (front, back, side, top, bottom)
    └─ Shows extracted features

Database
    ├─ product_view_approvals (main record)
    ├─ view_revision_history (revision tracking)
    └─ Supabase Storage (image URLs)
\`\`\`
