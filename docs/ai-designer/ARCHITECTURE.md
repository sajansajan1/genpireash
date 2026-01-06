# View Generation System - Architecture Diagram & Data Flow

## System Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │         SteppedGenerationWorkflow Component                          │   │
│  │  (stepped-generation-workflow.tsx)                                   │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │  Step 1: Input               Step 2: Front Gen       Step 3: Approval│   │
│  │  ┌──────────────────┐      ┌──────────────────┐    ┌──────────────┐ │   │
│  │  │ Text Description │      │  Loading State   │    │ FrontViewApp │ │   │
│  │  │   OR            │──→   │  (Generating)    │───→│  roval Comp  │ │   │
│  │  │ Reference Image │      │                  │    │              │ │   │
│  │  └──────────────────┘      └──────────────────┘    └──────────────┘ │   │
│  │                                                           ↓           │   │
│  │           Step 4: Additional Views      Step 5: Display Views        │   │
│  │          ┌──────────────────┐          ┌──────────────────┐         │   │
│  │          │ Loading State    │    ←─────│ ViewsDisplay     │         │   │
│  │          │ (Back/Side/Top/  │          │ Component        │         │   │
│  │          │  Bottom Generating)         │                  │         │   │
│  │          └──────────────────┘          │ Shows all 5 views│         │   │
│  │                                         │ + Extracted      │         │   │
│  │                                         │   Features       │         │   │
│  │                                         └──────────────────┘         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      ↓                                       │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
                        ┌─────────────┴──────────────┐
                        │                            │
                        ↓                            ↓
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│       API LAYER                  │  │    SERVER ACTION LAYER           │
├──────────────────────────────────┤  ├──────────────────────────────────┤
│                                  │  │                                  │
│ POST /generate-front-view        │  │ generateFrontView()              │
│ POST /approve-front-view         │  │ - Auth check                     │
│ POST /generate-additional-views  │  │ - Credit reserve                 │
│                                  │  │ - Prompt building                │
│ (route.ts files)                │  │ - Gemini call                    │
│                                  │  │ - Image upload                   │
│                                  │  │ - DB create                      │
│                                  │  │                                  │
│                                  │  │ handleFrontViewApproval()        │
│                                  │  │ - Feature extraction (OpenAI)    │
│                                  │  │ - DB update                      │
│                                  │  │                                  │
│                                  │  │ generateAdditionalViews()        │
│                                  │  │ - Back view generation           │
│                                  │  │ - Side view generation           │
│                                  │  │ - Top view generation            │
│                                  │  │ - Bottom view generation         │
│                                  │  │ - Image uploads                  │
│                                  │  │ - DB updates                     │
└──────────────────────────────────┘  └──────────────────────────────────┘
                                            (stepped-image-generation.ts)
                        ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────┐  ┌──────────────────────────┐              │
│  │  GeminiImageService      │  │  RevisionGenerationService              │
│  │  (lib/ai/gemini.ts)      │  │  (lib/services/...)                    │
│  │                          │  │                                        │
│  │ • generateImage()        │  │ • createRevision()                     │
│  │ • retry logic            │  │ • createInitialRevision()              │
│  │ • base64 conversion      │  │ • selective regeneration               │
│  │ • error handling         │  │                                        │
│  └──────────────────────────┘  └──────────────────────────┘              │
│           ↓                                ↓                              │
│  ┌──────────────────────────┐  ┌──────────────────────────┐              │
│  │ CentralizedGeneration    │  │   ImageService           │              │
│  │ Service                  │  │   (upload/storage)       │              │
│  │ (centralized-generation) │  │                          │              │
│  │                          │  │ • safeUpload()           │              │
│  │ • generateMultiView()    │  │ • preset handling        │              │
│  │ • SteppedWorkflow()      │  │ • URL signing            │              │
│  │ • auto-approve option    │  │                          │              │
│  │                          │  │                          │              │
│  └──────────────────────────┘  └──────────────────────────┘              │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────┐  ┌────────────────────────┐                 │
│  │ Google Gemini 2.5      │  │  OpenAI gpt-4o-mini    │                 │
│  │ Flash Image Preview    │  │  (Vision Capabilities) │                 │
│  │                        │  │                        │                 │
│  │ • Image generation     │  │ • Feature extraction   │                 │
│  │ • 5 view types         │  │ • Color identification │                 │
│  │ • Reference image      │  │ • Material detection   │                 │
│  │ • Logo integration     │  │ • Dimension estimation │                 │
│  │ • Retries: 3-5         │  │ • JSON output          │                 │
│  │ • Temp: 0.1 (consistent)                          │                 │
│  └────────────────────────┘  └────────────────────────┘                 │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                    STORAGE & DATABASE LAYER                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────┐    ┌──────────────────────────────────┐ │
│  │  Supabase Storage (S3)     │    │  Supabase PostgreSQL Database    │ │
│  │                            │    │                                  │ │
│  │ • Store generated images   │    │  Tables:                         │ │
│  │ • Return signed URLs       │    │  ┌─────────────────────────────┐ │ │
│  │ • Expire after time        │    │  │product_view_approvals      │ │ │
│  │ • CDN distribution         │    │  │ - id, user_id, session_id  │ │ │
│  │                            │    │  │ - front/back/side view URLs │ │ │
│  │                            │    │  │ - top/bottom view URLs     │ │ │
│  │ Buckets:                   │    │  │ - extracted_features (JSONB)│ │ │
│  │ • images/                  │    │  │ - status, feedback, timestamps
│  │ • products/                │    │  └─────────────────────────────┘ │ │
│  │ • uploads/                 │    │                                  │ │
│  │                            │    │  ┌─────────────────────────────┐ │ │
│  │                            │    │  │view_revision_history       │ │ │
│  │                            │    │  │ - id, approval_id          │ │ │
│  │                            │    │  │ - view_type, image_url     │ │ │
│  │                            │    │  │ - prompt, user_feedback    │ │ │
│  │                            │    │  │ - created_at               │ │ │
│  │                            │    │  └─────────────────────────────┘ │ │
│  │                            │    │                                  │ │
│  │                            │    │  ┌─────────────────────────────┐ │ │
│  │                            │    │  │revisions                   │ │ │
│  │                            │    │  │ - id, project_id           │ │ │
│  │                            │    │  │ - revision_number          │ │ │
│  │                            │    │  │ - image_data (JSONB)       │ │ │
│  │                            │    │  │ - changes_made (JSONB)     │ │ │
│  │                            │    │  └─────────────────────────────┘ │ │
│  └────────────────────────────┘    └──────────────────────────────────┘ │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## Data Flow - Complete Front to Back

\`\`\`
┌──────────────────────────────────────────────────────────────────────────────┐
│ 1. USER SUBMITS INPUT                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Input Type A: Text Description        Input Type B: Reference Image         │
│  ┌──────────────────────────┐          ┌──────────────────────────┐          │
│  │ "Black leather handbag   │          │ [Upload product photo]   │          │
│  │  with gold accents..."   │          │                          │          │
│  └──────────────────────────┘          └──────────────────────────┘          │
│           ↓                                       ↓                            │
│     Passed as-is                    Converted to base64 data URL             │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ 2. FRONT VIEW GENERATION                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Authentication        Credits                Prompt Building               │
│  ┌────────────────┐    ┌───────────────┐      ┌──────────────────┐         │
│  │ Supabase auth  │    │ Reserve 3     │      │ buildFrontView   │         │
│  │ getCurrentUser │    │ credits       │      │ Prompt()         │         │
│  └────────────────┘    └───────────────┘      └──────────────────┘         │
│           ↓                  ↓                         ↓                     │
│      User Validated     Credits Reserved      Prompt Generated:             │
│                                                "Generate ONLY FRONT..."     │
│                                                (+ logo/style rules)         │
│           ↓──────────────────────────────────────────↓                      │
│                   ┌──────────────────────────┐                              │
│                   │  Gemini 2.5 Flash        │                              │
│                   │  generateImage()         │                              │
│                   │  - prompt                │                              │
│                   │  - referenceImage        │                              │
│                   │  - logoImage (if any)    │                              │
│                   │  - temp: 0.1             │                              │
│                   │  - retry: 3-5 times      │                              │
│                   └──────────────────────────┘                              │
│                           ↓                                                  │
│                   Returns base64 data URL                                   │
│                           ↓                                                  │
│   ┌───────────────────────────────────────────┐                            │
│   │ ImageService.upload()                     │                            │
│   │ - Upload to Supabase Storage              │                            │
│   │ - Receive signed URL                      │                            │
│   │ - Preset: "original" (no compression)     │                            │
│   └───────────────────────────────────────────┘                            │
│                           ↓                                                  │
│                   Signed URL Ready                                          │
│                           ↓                                                  │
│   ┌───────────────────────────────────────────┐                            │
│   │ Create Approval Record                    │                            │
│   │ product_view_approvals INSERT:            │                            │
│   │ {                                         │                            │
│   │   id: UUID,                               │                            │
│   │   user_id: auth.uid(),                    │                            │
│   │   session_id: UUID,                       │                            │
│   │   front_view_url: signedURL,              │                            │
│   │   front_view_prompt: promptText,          │                            │
│   │   status: 'pending',                      │                            │
│   │   extracted_features: null,               │                            │
│   │   created_at: NOW()                       │                            │
│   │ }                                         │                            │
│   └───────────────────────────────────────────┘                            │
│                           ↓                                                  │
│               Return to Client:                                             │
│               { approvalId, sessionId, frontView { url, prompt } }         │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ 3. FRONT VIEW APPROVAL STEP                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │           User Reviews Front View Image                         │        │
│  │           [Visual Preview of Generated Image]                   │        │
│  │                                                                  │        │
│  │           ┌─ APPROVE    OR    REJECT (with feedback) ─┐        │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                            ↓                    ↓                             │
│         ─────────────────────────────────────────────────────────           │
│         │                                                         │          │
│         ↓ APPROVED                               ↓ REJECTED       │          │
│    ┌─────────────────┐                    ┌──────────────────┐   │          │
│    │ Extract Features│                    │Save Revision Hist│   │          │
│    │ (OpenAI Vision) │                    │                  │   │          │
│    └─────────────────┘                    └──────────────────┘   │          │
│         ↓                                       ↓                 │          │
│    Analyze Image:                         INSERT to:             │          │
│    • Colors (hex+name)                    view_revision_history  │          │
│    • Materials                            {                      │          │
│    • Key elements                           approval_id,         │          │
│    • Dimensions                             view_type: 'front',  │          │
│    • Description                            image_url,           │          │
│         ↓                                     prompt,             │          │
│    Return JSON structure:                    user_feedback       │          │
│    {                                       }                      │          │
│      colors: [{hex, name, usage}],         ↓                     │          │
│      materials: [],                        Update approval:      │          │
│      keyElements: [],                      status='revision_req' │          │
│      estimatedDimensions: {},             ↓                      │          │
│      description: "..."                   User can try again    │          │
│    }                                      (go back to step 2)   │          │
│         ↓                                       ↓                 │          │
│    UPDATE product_view_approvals:         Same flow with 2      │          │
│    {                                      credits instead of 3  │          │
│      status: 'approved',                                        │          │
│      approved_at: NOW(),                                        │          │
│      extracted_features: <JSON>                                │          │
│    }                                                            │          │
│                                                                 │          │
└─────────────────────────────────────────────────────────────────┘          │
                                    ↓                                          │
                        (Only if APPROVED continue)                           │
                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ 4. PARALLEL ADDITIONAL VIEWS GENERATION                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   Uses extracted_features as reference for all views:                       │
│   Colors: "Black (#000000), Gold (#FFD700)"                                 │
│   Materials: "Leather, Metal hardware"                                       │
│   Elements: "Handle, Clasp, Interior pockets"                                │
│                                                                               │
│   ┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│   │  generateBackView() │  │generateSideView()│  │ generateTopView()│      │
│   │                     │  │                  │  │                  │      │
│   │  Prompt:            │  │  Prompt:         │  │  Prompt:         │      │
│   │  "Generate BACK..."  │  │  "Generate 90°..." │  "Generate TOP..."    │      │
│   │                     │  │                  │  │                  │      │
│   │  Reference:         │  │  Reference:      │  │  Reference:      │      │
│   │  front_view_url     │  │  front_view_url  │  │  front_view_url  │      │
│   │                     │  │                  │  │                  │      │
│   │  Features:          │  │  Features:       │  │  Features:       │      │
│   │  colors, materials  │  │  colors, materials  │  colors, materials   │      │
│   │                     │  │                  │  │                  │      │
│   │  → Gemini Gen       │  │  → Gemini Gen    │  │  → Gemini Gen    │      │
│   │  → Returns Image    │  │  → Returns Image │  │  → Returns Image │      │
│   │  → base64 URL       │  │  → base64 URL    │  │  → base64 URL    │      │
│   └─────────────────────┘  └──────────────────┘  └──────────────────┘      │
│            ↓                      ↓                      ↓                    │
│   ┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│   │generateBottomView() │                                               │      │
│   │                     │                                               │      │
│   │  Prompt:            │                                               │      │
│   │  "Generate BOTTOM..."│                                               │      │
│   │                     │                                               │      │
│   │  → Gemini Gen       │                                               │      │
│   │  → Returns Image    │  ← All 4 run in PARALLEL                     │      │
│   │  → base64 URL       │                                               │      │
│   └─────────────────────┘                                               │      │
│            ↓                                                              │      │
│   All 4 results collected via Promise.allSettled()                     │      │
│                                                                          │      │
│   ┌─────────────────────────────────────────────────────────────────┐  │      │
│   │ Upload all 4 images via ImageService.upload()                 │  │      │
│   │ Back: supabase/storage/back_<sessionId>.png → backViewUrl      │  │      │
│   │ Side: supabase/storage/side_<sessionId>.png → sideViewUrl      │  │      │
│   │ Top:  supabase/storage/top_<sessionId>.png → topViewUrl        │  │      │
│   │ Bot:  supabase/storage/bottom_<sessionId>.png → bottomViewUrl   │  │      │
│   └─────────────────────────────────────────────────────────────────┘  │      │
│                                                                          │      │
│   ┌─────────────────────────────────────────────────────────────────┐  │      │
│   │ UPDATE product_view_approvals:                                 │  │      │
│   │ {                                                               │  │      │
│   │   back_view_url: backViewUrl,                                 │  │      │
│   │   back_view_prompt: backPrompt,                               │  │      │
│   │   side_view_url: sideViewUrl,                                 │  │      │
│   │   side_view_prompt: sidePrompt,                               │  │      │
│   │   top_view_url: topViewUrl,                                   │  │      │
│   │   top_view_prompt: topPrompt,                                 │  │      │
│   │   bottom_view_url: bottomViewUrl,                             │  │      │
│   │   bottom_view_prompt: bottomPrompt                            │  │      │
│   │ }                                                               │  │      │
│   └─────────────────────────────────────────────────────────────────┘  │      │
│                                                                          │      │
│   ┌─────────────────────────────────────────────────────────────────┐  │      │
│   │ Background Analysis (non-blocking):                            │  │      │
│   │ analyzeAndSaveProductImages()                                  │  │      │
│   │ - Cache for future use                                         │  │      │
│   │ - Returns to client immediately (doesn't wait)                 │  │      │
│   └─────────────────────────────────────────────────────────────────┘  │      │
│                                                                          │      │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│ 5. COMPLETION & DISPLAY                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Return to Client:                                                          │
│  {                                                                          │
│    success: true,                                                          │
│    views: {                                                                │
│      back: { url: backViewUrl, prompt: backPrompt },                      │
│      side: { url: sideViewUrl, prompt: sidePrompt },                      │
│      top: { url: topViewUrl, prompt: topPrompt },                         │
│      bottom: { url: bottomViewUrl, prompt: bottomPrompt }                 │
│    }                                                                        │
│  }                                                                          │
│                                                                             │
│  Display via ViewsDisplay Component:                                       │
│  ┌──────────────────────────────────────┐                                 │
│  │  Product Views [Tabs]                │                                 │
│  │  ├─ Front View [Tab]                │                                 │
│  │  │  └─ [Image Display]               │                                 │
│  │  ├─ Back View [Tab]                 │                                 │
│  │  │  └─ [Image Display]               │                                 │
│  │  ├─ Side View [Tab]                 │                                 │
│  │  │  └─ [Image Display]               │                                 │
│  │  ├─ Top View [Tab]                  │                                 │
│  │  │  └─ [Image Display]               │                                 │
│  │  └─ Bottom View [Tab]               │                                 │
│  │     └─ [Image Display]               │                                 │
│  └──────────────────────────────────────┘                                 │
│                                                                             │
│  ┌──────────────────────────────────────┐                                 │
│  │  Extracted Features Display          │                                 │
│  │  ├─ Colors                           │                                 │
│  │  │  ├─ Black (#000000)               │                                 │
│  │  │  └─ Gold (#FFD700)                │                                 │
│  │  ├─ Materials                        │                                 │
│  │  │  ├─ Leather                       │                                 │
│  │  │  └─ Metal                         │                                 │
│  │  ├─ Key Elements                     │                                 │
│  │  │  ├─ Handle                        │                                 │
│  │  │  ├─ Clasp                         │                                 │
│  │  │  └─ Pockets                       │                                 │
│  │  ├─ Dimensions                       │                                 │
│  │  │  ├─ Width: 28cm                   │                                 │
│  │  │  └─ Height: 22cm                  │                                 │
│  │  └─ Description                      │                                 │
│  │     "Premium black leather handbag..." │                               │
│  └──────────────────────────────────────┘                                 │
│                                                                             │
│  Credits Charged: 3 (for initial generation)                              │
│                                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## State Management & Database Consistency

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                  CLIENT STATE (React Components)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ SteppedGenerationWorkflow:                                              │
│ ├─ currentStep: 'input' | 'front-generation' | 'front-approval'        │
│ │              | 'additional-generation' | 'complete'                 │
│ ├─ inputType: 'text' | 'image'                                         │
│ ├─ textInput: string                                                    │
│ ├─ imageFile: File | null                                              │
│ ├─ isProcessing: boolean                                               │
│ ├─ error: string | null                                                │
│ ├─ approvalId: string | null                                           │
│ ├─ frontViewData: { url, prompt } | null                               │
│ ├─ additionalViews: { back, side, top, bottom } | null                 │
│ ├─ extractedFeatures: object | null                                    │
│ └─ sessionId: string                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│               DATABASE STATE (Supabase PostgreSQL)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ product_view_approvals (Main Record):                                   │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ id: UUID (Primary Key)                                             │ │
│ │ user_id: UUID (Foreign Key → auth.users)                           │ │
│ │ session_id: TEXT (unique session identifier)                       │ │
│ │                                                                    │ │
│ │ === FRONT VIEW FIELDS ===                                         │ │
│ │ front_view_url: TEXT (signed URL to Supabase Storage)             │ │
│ │ front_view_prompt: TEXT (full Gemini prompt used)                 │ │
│ │ extracted_features: JSONB (null until approved)                   │ │
│ │ {                                                                 │ │
│ │   "colors": [...],                                                │ │
│ │   "materials": [...],                                             │ │
│ │   "keyElements": [...],                                           │ │
│ │   "estimatedDimensions": {...},                                   │ │
│ │   "description": "..."                                            │ │
│ │ }                                                                 │ │
│ │                                                                    │ │
│ │ === ADDITIONAL VIEW FIELDS ===                                    │ │
│ │ back_view_url: TEXT                                               │ │
│ │ back_view_prompt: TEXT                                            │ │
│ │ side_view_url: TEXT                                               │ │
│ │ side_view_prompt: TEXT                                            │ │
│ │ top_view_url: TEXT                                                │ │
│ │ top_view_prompt: TEXT                                             │ │
│ │ bottom_view_url: TEXT                                             │ │
│ │ bottom_view_prompt: TEXT                                          │ │
│ │                                                                    │ │
│ │ === WORKFLOW STATUS ===                                           │ │
│ │ status: TEXT CHECK ('pending'|'approved'|'revision_requested')    │ │
│ │ user_feedback: TEXT (user's comments/feedback)                    │ │
│ │                                                                    │ │
│ │ === TIMESTAMPS ===                                                │ │
│ │ created_at: TIMESTAMP WITH TIME ZONE                              │ │
│ │ approved_at: TIMESTAMP WITH TIME ZONE (null until approved)       │ │
│ │ updated_at: TIMESTAMP WITH TIME ZONE (auto-updated on changes)    │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ view_revision_history (Audit Trail):                                    │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ id: UUID (Primary Key)                                             │ │
│ │ approval_id: UUID (Foreign Key → product_view_approvals)           │ │
│ │ view_type: TEXT ('front'|'back'|'side'|'top'|'bottom')            │ │
│ │ image_url: TEXT (previous version URL)                            │ │
│ │ prompt: TEXT (prompt used for this version)                       │ │
│ │ user_feedback: TEXT (why user rejected/modified)                  │ │
│ │ created_at: TIMESTAMP WITH TIME ZONE                              │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ revisions (Version Control):                                            │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ id: UUID (Primary Key)                                             │ │
│ │ project_id: UUID (Foreign Key → projects)                         │ │
│ │ revision_number: INTEGER                                          │ │
│ │ user_prompt: TEXT                                                 │ │
│ │ image_data: JSONB {                                               │ │
│ │   "front": { url, prompt_used, created_at },                     │ │
│ │   "back": { url, prompt_used, created_at },                      │ │
│ │   "side": { url, prompt_used, created_at },                      │ │
│ │   "top": { url, prompt_used, created_at },                       │ │
│ │   "bottom": { url, prompt_used, created_at }                     │ │
│ │ }                                                                 │ │
│ │ changes_made: JSONB {                                             │ │
│ │   "regenerated": ["back", "side"],                                │ │
│ │   "preserved": ["front"],                                         │ │
│ │   "modifications": "user feedback text"                           │ │
│ │ }                                                                 │ │
│ │ created_at: TIMESTAMP WITH TIME ZONE                              │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`
