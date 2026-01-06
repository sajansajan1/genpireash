# Genpire Product Creation Flow - Complete Technical Reference

**Last Updated**: 2025-11-17
**Version**: 1.0
**Purpose**: Complete end-to-end documentation of Genpire's product creation system from initial idea to final 3D visualization

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Complete User Journey](#complete-user-journey)
4. [Database Schema](#database-schema)
5. [Technical Flow Diagrams](#technical-flow-diagrams)
6. [Server Actions Reference](#server-actions-reference)
7. [Component Hierarchy](#component-hierarchy)
8. [State Management](#state-management)
9. [Credits System](#credits-system)
10. [Error Handling](#error-handling)
11. [File Locations Reference](#file-locations-reference)

---

## 1. Executive Summary

Genpire is an AI-powered product design platform that transforms ideas into production-ready technical specifications. The system uses a **progressive generation workflow** that prioritizes speed and user control by generating views incrementally rather than all at once.

### Key Features
- **Progressive Workflow**: Front view generated first (~30s), remaining views only after approval
- **Multi-View Generation**: Creates 5 views (front, back, side, top, bottom) of each product
- **Revision System**: Track and rollback to previous versions
- **AI Designer**: Chat-based editing interface with visual annotations
- **Tech Pack Generation**: Automatic creation of factory-ready specifications
- **3D Model Generation**: Integration with Meshy for 3D visualization
- **Credit-Based System**: Pay-per-use model with reservation and refund logic

### Technology Stack
- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Server Actions (Next.js), Supabase (PostgreSQL)
- **AI Services**: Gemini 2.5 Flash (image generation), GPT-4o (tech pack generation), OpenAI Vision (image analysis)
- **Image Processing**: ImageService with optimization presets
- **3D Generation**: Meshy API with webhook integration
- **State Management**: Zustand with real-time Supabase subscriptions

---

## 2. System Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                         GENPIRE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │
│  │  User Entry  │ ───> │ Progressive  │ ───> │ AI Designer  │      │
│  │   Dashboard  │      │  Workflow    │      │   Editor     │      │
│  └──────────────┘      └──────────────┘      └──────────────┘      │
│         │                     │                      │               │
│         ▼                     ▼                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │              Server Actions Layer                         │      │
│  │  - create-product-entry.ts                                │      │
│  │  - progressive-generation-workflow.ts                     │      │
│  │  - ai-image-edit-new-table.ts                             │      │
│  │  - tech-pack-management.ts                                │      │
│  │  - idea-generation.ts                                     │      │
│  └──────────────────────────────────────────────────────────┘      │
│         │                     │                      │               │
│         ▼                     ▼                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                  Database Layer (Supabase)                │      │
│  │  - product_ideas                                           │      │
│  │  - front_view_approvals                                    │      │
│  │  - product_multiview_revisions                             │      │
│  │  - product_tech_packs                                      │      │
│  │  - images_uploads                                          │      │
│  │  - chat_sessions / ai_chat_messages                        │      │
│  │  - product_3d_models                                       │      │
│  └──────────────────────────────────────────────────────────┘      │
│         │                     │                      │               │
│         ▼                     ▼                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                   AI Services Layer                       │      │
│  │  - Gemini 2.5 Flash (Image Generation)                    │      │
│  │  - GPT-4o (Tech Pack Generation)                          │      │
│  │  - OpenAI Vision (Image Analysis)                         │      │
│  │  - Meshy API (3D Model Generation)                        │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 3. Complete User Journey

### Phase 1: Initial Product Creation

**Location**: `/app/creator-dashboard/page.tsx` → `IdeaUploadPage`

#### Entry Points
Users can create a product through two tabs:

**Tab 1: Text Description**
\`\`\`tsx
// Component: /components/idea-upload/page.tsx
// User provides:
- Product idea (text prompt)
- Logo upload (optional, PNG/JPG, max 2MB)
- Brand DNA toggle (if available)
- "Improve with AI" button (enhances prompt)

// Example prompt:
"A minimalist canvas tote bag with leather straps and magnetic buttons"
\`\`\`

**Tab 2: Upload Design**
\`\`\`tsx
// User provides:
- Design file upload (PNG/JPG, max 5MB)
- Design description (can be auto-generated from image)
- Logo upload (optional)
- "Improve with AI" for description
\`\`\`

#### Form Validation
\`\`\`typescript
// File validation includes:
1. Type check (MIME type)
2. Extension check (.png, .jpg, .jpeg)
3. Size limit (2MB for logo, 5MB for design)
4. File signature verification (first 8 bytes)
   - JPEG: starts with "ffd8ff"
   - PNG: starts with "89504e470d0a1a0a"
\`\`\`

#### Data Flow on Submit
\`\`\`typescript
// handleSubmitNew() in idea-upload/page.tsx

STEP 1: Credit Check
- Requires minimum 3 credits
- Shows error if insufficient

STEP 2: Convert Files to Base64
- Logo: filePreview (already base64 from FileReader)
- Design File: designFilePreview (already base64)

STEP 3: Build Initial Chat Message
- Combines all form data
- Includes Brand DNA if enabled
- Structures context for AI Designer

STEP 4: Create Minimal Product Entry
// Calls: createMinimalProductEntry()
{
  user_prompt: initialMessage,
  category: category,
  intended_use: intendedUse,
  style_keywords: selectedKeywords,
  image: logoBase64,
  selected_colors: selectedColors,
  product_goal: productGoal,
  designFile: designFileBase64,
  userId: user.id
}

STEP 5: Create Chat Session
// Calls: createChatSession()
- Links to product
- Stores initial message
- Returns sessionId

STEP 6: Create Notification
- Title: "Product Design Started"
- Type: "product_created"

STEP 7: Redirect to AI Designer
// URL: /ai-designer?projectId={id}&autoGenerate=true&generateMoreViews={bool}&version=modular
\`\`\`

**Database Record Created**:
\`\`\`sql
-- Table: product_ideas
INSERT INTO product_ideas (
  user_id,
  prompt,              -- Full initial message
  status,              -- 'generating'
  tech_pack,           -- { metadata: { logo, designFile, ... } }
  image_data,          -- Empty placeholder for images
  created_at,
  updated_at
) VALUES (...);
\`\`\`

---

### Phase 2: Progressive Front View Generation

**Location**: `/modules/ai-designer/components/FrontViewApproval/`

This is the **NEW OPTIMIZED FLOW** that replaces blocking generation. The front view is generated first, allowing users to approve or iterate before committing to full generation.

#### 2.1 Auto-Generation Trigger

When AI Designer loads with `autoGenerate=true`:

\`\`\`typescript
// /modules/ai-designer/components/ProgressiveViewsGeneration/index.tsx

useEffect(() => {
  if (autoGenerate && !isGenerating && !frontViewApprovalId) {
    handleGenerateFrontView();
  }
}, [autoGenerate]);
\`\`\`

#### 2.2 Front View Generation

\`\`\`typescript
// Server Action: generateFrontViewOnly()
// File: /app/actions/progressive-generation-workflow.ts

STEP 1: Fetch Product Metadata
- Retrieves logo and design file from tech_pack.metadata
- Logo and design files are base64 strings

STEP 2: Reserve Credits
- Reserves 1 credit for front view generation
- Returns reservationId for refund if fails

STEP 3: Build Front View Prompt
const frontViewPrompt = `
Generate a photorealistic product image:

${userPrompt}

${logoImage ? 'LOGO PLACEMENT: Place the logo prominently...' : ''}

CRITICAL REQUIREMENTS:
- Generate ONLY the FRONT VIEW
- Single image, one perspective
- Pure white background
- Professional studio lighting
- High detail and clarity
- Photorealistic style
`;

STEP 4: Generate with Gemini
const result = await geminiService.generateImage({
  prompt: frontViewPrompt,
  referenceImage: previousFrontViewUrl || designFile,
  logoImage: logoImage,  // Logo is passed to Gemini
  view: "front",
  style: "photorealistic"
});

STEP 5: Upload Image
- Uses ImageService.upload() with "original" preset
- Stores in Supabase Storage
- Returns public URL

STEP 6: Create Approval Record
// Table: front_view_approvals
{
  user_id,
  product_idea_id,
  session_id,
  front_view_url,          // Uploaded URL
  front_view_prompt,
  status: 'pending',
  iteration_number: 1,     // Increments on edits
  credits_reserved: 1,
  credits_consumed: 1,     // Already deducted
  is_initial_generation: true
}

STEP 7: Return to UI
return {
  success: true,
  frontViewUrl: uploadedUrl,
  approvalId: approval.id,
  sessionId,
  creditsReserved: 1
};
\`\`\`

**Time**: ~30 seconds (vs 2+ minutes for all views)

#### 2.3 Front View Approval UI

**Component**: `/modules/ai-designer/components/FrontViewApproval/index.tsx`

\`\`\`tsx
<FrontViewApproval
  frontViewUrl={url}
  approvalId={id}
  iterationCount={1}
  onApprove={handleApprove}
  onRequestEdit={handleRequestEdit}
  productName="Product"
  creditsForRemaining={2}  // Cost to generate remaining 4 views
/>
\`\`\`

**User Actions**:

1. **Approve** → Proceeds to generate remaining 4 views
2. **Request Changes** → Regenerates front view with feedback

#### 2.4 Front View Iteration (If User Requests Edit)

\`\`\`typescript
// Server Action: handleFrontViewDecision()
// When action = 'edit'

STEP 1: Reserve 1 Additional Credit
- For iteration

STEP 2: Mark Current Approval as Rejected
UPDATE front_view_approvals
SET status = 'rejected',
    user_feedback = editFeedback
WHERE id = approvalId;

STEP 3: Build Edit Prompt
const editPrompt = `
${originalPrompt}

User feedback: ${editFeedback}
`;

STEP 4: Regenerate Front View
- Uses previous front view as reference
- Applies user feedback
- Same generation process as initial

STEP 5: Create New Approval Record
{
  iteration_number: previous + 1,  // Increments to 2, 3, etc.
  credits_reserved: 1,
  credits_consumed: 1,
  is_initial_generation: false
}

return {
  success: true,
  action: 'regenerate',
  newFrontViewUrl,
  newApprovalId
};
\`\`\`

**Version History**: UI shows pills for V1, V2, V3, etc., allowing users to switch between iterations.

---

### Phase 3: Remaining Views Generation

**Triggered When**: User clicks "Approve & Generate All Views"

\`\`\`typescript
// Server Action: generateRemainingViews()
// File: /app/actions/progressive-generation-workflow.ts

STEP 1: Extract Features from Front View
// Uses OpenAI Vision (gpt-4o-mini)
const features = await extractFeaturesFromImage(frontViewUrl);

// Returns:
{
  colors: [{ hex: "#...", name: "Blue", usage: "Primary" }],
  estimatedDimensions: { width: "12in", height: "8in" },
  materials: ["Canvas", "Leather"],
  keyElements: ["Magnetic closure", "Adjustable straps"],
  description: "Modern minimalist tote bag..."
}

STEP 2: Reserve 2 Credits
- For generating 4 remaining views (back, side, top, bottom)

STEP 3: Generate All Views in Parallel
Promise.allSettled([
  generateBackView(frontViewUrl, features, productId, logoImage),
  generateSideView(frontViewUrl, features, productId, logoImage),
  generateTopView(frontViewUrl, features, productId, logoImage),
  generateBottomView(frontViewUrl, features, productId, logoImage)
]);

STEP 4: Each View Generation
// Example: generateBackView()
const backViewPrompt = `
Generate the BACK VIEW of this exact product.

CRITICAL: Same product as reference
CONSISTENCY RULES:
- Colors: ${features.colors.map(c => c.name).join(', ')}
- Materials: ${features.materials.join(', ')}
- Dimensions: Identical to front
- Pure white background

${logoImage ? 'LOGO PLACEMENT (BACK VIEW): ...' : ''}
`;

const result = await geminiService.generateImage({
  prompt: backViewPrompt,
  referenceImage: frontViewUrl,
  logoImage: logoImage,  // Logo included if provided
  view: "back",
  style: "photorealistic"
});

// Upload and return URL

STEP 5: Update Approval Record
UPDATE front_view_approvals
SET
  back_view_url = backUrl,
  side_view_url = sideUrl,
  top_view_url = topUrl,
  bottom_view_url = bottomUrl,
  credits_reserved = 1 + 2,      -- Front + Remaining
  credits_consumed = 1 + 2       -- Total consumed
WHERE id = approvalId;
\`\`\`

**Time**: ~60-90 seconds for all 4 views in parallel

**Total Credits Used**: 3 (1 for front + 2 for remaining 4 views)

---

### Phase 4: Create Final Revision

\`\`\`typescript
// Server Action: createRevisionAfterApproval()
// File: /app/actions/progressive-generation-workflow.ts

STEP 1: Determine Revision Number
- For initial generation: revision_number = 0
- For edits: Get MAX(revision_number) + 1

STEP 2: Generate Batch ID
const batchId = isInitial
  ? `initial_${productId}_${Date.now()}`
  : `revision_${revisionNumber}_${Date.now()}`;

STEP 3: Deactivate Previous Revisions
UPDATE product_multiview_revisions
SET is_active = false
WHERE product_idea_id = productId
  AND is_active = true;

STEP 4: Insert Revision Records
// One record per view (5 total)
const viewTypes = ['front', 'back', 'side', 'top', 'bottom'];

viewTypes.forEach(viewType => {
  INSERT INTO product_multiview_revisions (
    product_idea_id,
    user_id,
    revision_number,
    batch_id,
    view_type,
    image_url,
    thumbnail_url,
    edit_prompt,
    edit_type: 'initial' or 'ai_edit',
    ai_model: 'gemini-2.5-flash-image-preview',
    ai_parameters: { approval_id, session_id, progressive_workflow: true },
    is_active: true,
    front_view_approval_id,
    metadata: { credits_used, iteration_count }
  );
});

STEP 5: Save to images_uploads (Compatibility)
// Also saves to legacy images_uploads table
await saveImageUploadsBatch(imageUploads);

STEP 6: Mark Approval as Completed
UPDATE front_view_approvals
SET status = 'completed',
    completed_at = NOW()
WHERE id = approvalId;
\`\`\`

**Result**: Product now has complete multi-view revision system ready for AI Designer.

---

### Phase 5: AI Designer / Editing Interface

**Location**: `/app/ai-designer/page.tsx` → `/modules/ai-designer/`

When users land in AI Designer (either from initial generation or existing project):

#### 5.1 Page Load & State Initialization

\`\`\`typescript
// /app/ai-designer/designer.tsx

useEffect(() => {
  if (projectId) {
    loadProjectAndInitialize(projectId);
  }
}, [projectId]);

async function loadProjectAndInitialize(id: string) {
  // 1. Fetch product from database
  const { data: project } = await supabase
    .from('product_ideas')
    .select('*')
    .eq('id', id)
    .single();

  // 2. Extract metadata (logo, design files stored here)
  const metadata = project.tech_pack?.metadata || {};

  // 3. Set product info
  setProductName(project.tech_pack?.productName || 'Product');
  setProductDescription(project.tech_pack?.productDescription || project.prompt);
  setTechPack(project.tech_pack);

  // 4. Load chat session
  const chatSession = await getOrCreateChatSession(id, userId);
  setChatSessionId(chatSession.sessionId);

  // 5. Check for pending front view approval
  const pendingApproval = await getPendingFrontViewApproval(id);

  if (pendingApproval.approval) {
    // User has pending front view to approve
    setShowFrontViewApproval(true);
  } else {
    // Load existing revisions
    const revisionsResult = await getGroupedMultiViewRevisions(id);
    setMultiViewRevisions(revisionsResult.revisions);
  }
}
\`\`\`

#### 5.2 Multi-View Editor Component

**Component**: `/modules/ai-designer/components/MultiViewEditor/index.tsx`

Displays all 5 views with editing capabilities:

\`\`\`tsx
<MultiViewEditor
  productId={projectId}
  userId={user.id}
  productName={productName}
  productDescription={productDescription}
  sessionId={chatSessionId}
  onRevisionCreated={(revisions) => {
    setMultiViewRevisions(revisions);
  }}
/>
\`\`\`

**Features**:
- **View Display**: Front, Back, Side, Top, Bottom
- **Chat Interface**: Text-based editing commands
- **Annotation Tool**: Visual markup for specific edits
- **Revision History**: Access to all previous versions
- **Tech Pack Generation**: Button to generate specifications

#### 5.3 Chat-Based Editing

**Component**: `/modules/ai-designer/components/ChatInterface/index.tsx`

\`\`\`typescript
// User types: "Change the color to red"

async function handleSendMessage(message: string) {
  // 1. Add user message to chat
  await addChatMessage({
    sessionId,
    role: 'user',
    content: message
  });

  // 2. Determine which views to edit
  // If user specified view(s), use those
  // Otherwise, edit all active views

  // 3. Call AI edit service
  const result = await editProductViews({
    productId,
    viewsToEdit: ['front', 'back', 'side', 'top', 'bottom'],
    editInstruction: message,
    currentRevisionNumber,
    sessionId
  });

  // 4. Process results
  if (result.success) {
    // New revision created with edited views
    setMultiViewRevisions(result.revisions);

    // Add AI response to chat
    await addChatMessage({
      sessionId,
      role: 'assistant',
      content: 'I've updated the product with red coloring across all views.'
    });
  }
}
\`\`\`

#### 5.4 AI Image Editing Flow

**Server Action**: `/app/actions/ai-image-edit-new-table.ts`

\`\`\`typescript
export async function editProductViews(params) {
  STEP 1: Get Current Active Revision
  const activeRevision = await getActiveRevisionForProduct(productId);

  STEP 2: Analyze Current Images
  // Uses OpenAI Vision to understand what's in the images
  const analysis = await analyzeProductImage(activeRevision.front.url);

  STEP 3: Build Edit Prompt
  const editPrompt = `
  Current product: ${analysis.description}

  User wants to: ${editInstruction}

  Generate updated ${viewType} view maintaining:
  - Overall product structure
  - Applying the requested change: ${editInstruction}
  - Pure white background
  - Same lighting and quality
  `;

  STEP 4: Generate New Views
  // Similar to initial generation but with reference images
  const newViews = await Promise.allSettled(
    viewsToEdit.map(view =>
      geminiService.generateImage({
        prompt: editPrompt,
        referenceImage: activeRevision[view].url,
        view: view,
        style: "photorealistic"
      })
    )
  );

  STEP 5: Create New Revision
  const newRevisionNumber = currentRevisionNumber + 1;
  const batchId = `edit_${newRevisionNumber}_${Date.now()}`;

  // Deactivate previous
  UPDATE product_multiview_revisions
  SET is_active = false
  WHERE product_idea_id = productId AND is_active = true;

  // Insert new revision
  viewsToEdit.forEach(view => {
    INSERT INTO product_multiview_revisions (
      product_idea_id,
      view_type,
      image_url: newViews[view].url,
      revision_number: newRevisionNumber,
      batch_id,
      edit_prompt: editInstruction,
      edit_type: 'ai_edit',
      is_active: true
    );
  });

  STEP 6: Return New Revision
  return {
    success: true,
    revisionNumber: newRevisionNumber,
    batchId,
    views: newViews
  };
}
\`\`\`

#### 5.5 Annotation/Micro-Edit System

**Component**: `/modules/ai-designer/components/AnnotationToolbar/`

\`\`\`typescript
// User clicks on image area and draws annotation
// Example: Circle around logo area with text "Make this bigger"

async function handleAnnotationSubmit(annotation) {
  // 1. Capture screenshot of annotated image
  const screenshot = await captureAnnotationScreenshot(
    imageElement,
    annotation
  );

  // 2. Upload screenshot
  const uploadResult = await uploadAnnotationScreenshot(screenshot);

  // 3. Call AI with visual context
  const result = await aiImageEditWithAnnotation({
    productId,
    viewType: currentView,
    annotationImageUrl: uploadResult.url,
    textInstruction: annotation.text,
    annotationArea: annotation.bounds
  });

  // AI can now "see" exactly what user wants changed
}
\`\`\`

#### 5.6 Revision History & Rollback

**Component**: `/modules/ai-designer/components/RevisionHistory/index.tsx`

\`\`\`typescript
// Display all revisions grouped by batch
const revisions = [
  {
    revisionNumber: 0,
    label: 'Original',
    views: { front: url, back: url, ... }
  },
  {
    revisionNumber: 1,
    label: 'Changed to red',
    views: { front: url, back: url, ... }
  },
  {
    revisionNumber: 2,
    label: 'Added pattern',
    views: { front: url, back: url, ... }
  }
];

// User clicks on revision 1 to rollback
async function handleRollback(revisionNumber) {
  // 1. Deactivate current revision
  UPDATE product_multiview_revisions
  SET is_active = false
  WHERE product_idea_id = productId AND is_active = true;

  // 2. Activate selected revision
  UPDATE product_multiview_revisions
  SET is_active = true
  WHERE product_idea_id = productId
    AND revision_number = revisionNumber;

  // 3. Refresh UI
  loadRevisions();
}
\`\`\`

---

### Phase 6: Tech Pack Generation

**When**: User clicks "Generate Tech Pack" button in AI Designer

**Purpose**: Create factory-ready technical specifications based on the active product revision.

\`\`\`typescript
// Server Action: generateTechPackForProduct()
// File: /app/actions/create-product-entry.ts

STEP 1: Get Active Revision
const activeRevision = await getActiveRevisionForProduct(productId);

// Example structure:
{
  revisionNumber: 2,
  views: {
    front: { imageUrl, revisionId },
    back: { imageUrl, revisionId },
    side: { imageUrl, revisionId },
    top: { imageUrl, revisionId },
    bottom: { imageUrl, revisionId }
  },
  editPrompt: "Changed to red color with geometric pattern"
}

STEP 2: Build Comprehensive Prompt
const promptToUse = `
${originalPrompt}

This tech pack is based on Revision #${revisionNumber} with modifications:
${editPrompt}

Please analyze the provided product images from Revision #${revisionNumber} and generate a comprehensive tech pack that accurately reflects:
- Colors visible in these specific images
- Materials and textures shown
- Dimensions and proportions from these product views
- Construction details visible
- Any design modifications in this revision

Generate a complete, production-ready tech pack.
`;

STEP 3: Call Tech Pack Generation (GPT-4o)
const techPackResult = await generateIdea({
  user_prompt: promptToUse,
  existing_project_id: productId,
  regenerate_techpack_only: true,  // Only generate tech pack, not images
  updated_images: activeRevision.views  // Pass images to analyze
});

STEP 4: Deduct 1 Credit
await DeductCredits({ credit: 1 });

STEP 5: Save Tech Pack
// Table: product_tech_packs
INSERT INTO product_tech_packs (
  product_idea_id,
  revision_id,          -- Link to specific revision
  user_id,
  revision_number,
  tech_pack_data,       -- Full JSON tech pack
  is_active: true,
  metadata: {
    generated_at,
    revision_context: 'revision'
  }
);

// Also update legacy field
UPDATE product_ideas
SET tech_pack = techPackData,
    updated_at = NOW()
WHERE id = productId;
\`\`\`

**Tech Pack Structure** (Generated by GPT-4o):
\`\`\`json
{
  "productName": "Geometric Red Tote Bag",
  "productOverview": "Modern minimalist canvas tote...",
  "price": "$45.00",
  "estimatedLeadTime": "3-4 weeks",
  "careInstructions": "Machine wash cold, line dry",

  "materials": [
    {
      "component": "Main Body",
      "material": "100% organic cotton canvas",
      "unitCost": "$2.50 per yard",
      "specification": "12oz weight, tight weave"
    },
    {
      "component": "Straps",
      "material": "Full-grain leather",
      "unitCost": "$15.00 per strap set",
      "specification": "1.5\" width, vegetable tanned"
    }
  ],

  "colors": {
    "palette": [
      { "name": "Cardinal Red", "hex": "#C41E3A", "type": "primary" },
      { "name": "Natural Canvas", "hex": "#F5F5DC", "type": "accent" }
    ]
  },

  "sizeRange": {
    "sizes": ["Standard"],
    "description": "One size fits all - 15\" x 12\" x 4\""
  },

  "dimensions": {
    "measurements": [{
      "Standard": {
        "height": "15\"",
        "width": "12\"",
        "depth": "4\"",
        "handleDrop": "9\""
      }
    }]
  },

  "constructionDetails": {
    "description": "Reinforced double-stitched seams",
    "constructionFeatures": [
      { "featureName": "Seam Type", "details": "French seams, 1/4\" allowance" },
      { "featureName": "Closure", "details": "Magnetic snap, nickel-free" },
      { "featureName": "Reinforcement", "details": "Bar tack at stress points" }
    ]
  },

  "hardwareComponents": {
    "description": "Premium metal hardware",
    "hardware": [
      "2x Magnetic snap closures (15mm)",
      "4x Rivet reinforcements (brass)",
      "2x D-rings for strap attachment"
    ]
  },

  "packaging": {
    "description": "Eco-friendly packaging",
    "packagingDetails": {
      "type": "Recycled cardboard box",
      "dimensions": "16\" x 13\" x 5\"",
      "branding": "Logo sticker on front",
      "sustainability": "100% recyclable materials"
    }
  },

  "qualityStandards": [
    {
      "aspect": "Material Quality",
      "requirement": "GOTS certified organic cotton",
      "testMethod": "Supplier certification verification"
    },
    {
      "aspect": "Construction",
      "requirement": "All seams must withstand 20lb pull test",
      "testMethod": "Random sampling, tensile strength testing"
    },
    {
      "aspect": "Color Fastness",
      "requirement": "Grade 4 minimum (ISO 105)",
      "testMethod": "Wash and rub fastness testing"
    }
  ],

  "productionNotes": "Ensure leather straps are conditioned before attachment. Magnetic closures should be aligned precisely for proper closure. Quality check all stress points after assembly."
}
\`\`\`

**Tech Pack Display**: `/app/creator-dashboard/techpacks/[id]/techpack.tsx`

---

### Phase 7: Technical File Generation

**Location**: Techpack page after generation

#### 7.1 PDF Generation

**Component**: `/components/pdf-generator/`

\`\`\`typescript
// Uses react-pdf for rendering
import { PDFDownloadLink, Document, Page } from '@react-pdf/renderer';

<PDFDownloadLink
  document={<TechPackPDF techPack={techPack} />}
  fileName={`${productName}_TechPack.pdf`}
>
  Download PDF
</PDFDownloadLink>

// TechPackPDF component renders:
- Cover page with product name and images
- Overview and pricing
- Materials breakdown with costs
- Color palette with hex codes
- Size and dimension charts
- Construction specifications
- Quality standards table
- Packaging details
\`\`\`

#### 7.2 Excel Export

**Component**: `/components/tech-pack/excel-export.tsx`

\`\`\`typescript
import * as XLSX from 'xlsx';

function exportToExcel(techPack) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Overview
  const overviewData = [
    ['Product Name', techPack.productName],
    ['Price', techPack.price],
    ['Lead Time', techPack.estimatedLeadTime],
    ...
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

  // Sheet 2: Materials
  const materialsData = techPack.materials.map(m => [
    m.component,
    m.material,
    m.unitCost,
    m.specification
  ]);
  const materialsSheet = XLSX.utils.aoa_to_sheet([
    ['Component', 'Material', 'Unit Cost', 'Specification'],
    ...materialsData
  ]);
  XLSX.utils.book_append_sheet(workbook, materialsSheet, 'Materials');

  // Sheet 3: Dimensions
  // Sheet 4: Construction
  // ...

  XLSX.writeFile(workbook, `${productName}_TechPack.xlsx`);
}
\`\`\`

#### 7.3 SVG/Vector Export

**Component**: `/components/tech-pack/svg-export.tsx`

Exports product views as SVG for further editing:

\`\`\`typescript
// Downloads the image and converts to SVG using potrace or similar
async function exportAsSVG(imageUrl, viewType) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  // Convert to SVG (simplified - actual implementation uses image tracing)
  const svg = await convertImageToSVG(blob);

  downloadFile(svg, `${productName}_${viewType}.svg`);
}
\`\`\`

---

### Phase 8: 3D Model Generation

**Location**: `/app/creator-dashboard/3d-models/page.tsx`

**Integration**: Meshy API (image-to-3D service)

#### 8.1 Trigger 3D Generation

\`\`\`typescript
// User clicks "Generate 3D Model" button

async function handle3DGeneration(product) {
  // 1. Show confirmation (costs credits)
  setShowConfirmDialog(true);
  setPendingGeneration({ item: product, type: 'product' });
}

async function confirm3DGeneration() {
  const product = pendingGeneration.item;

  // 2. Call Meshy API
  const response = await fetch('/api/generate-3d-model', {
    method: 'POST',
    body: JSON.stringify({
      productId: product.id,
      productName: product.tech_pack.productName,
      imageUrls: {
        front: product.image_data.front.url,
        back: product.image_data.back.url,
        side: product.image_data.side.url
      }
    })
  });

  const result = await response.json();

  // 3. Store task in database
  INSERT INTO product_3d_models (
    product_idea_id,
    user_id,
    task_id,              -- Meshy task ID
    status: 'processing',
    image_urls,
    created_at
  );
}
\`\`\`

#### 8.2 Meshy API Flow

**Endpoint**: `/app/api/generate-3d-model/route.ts`

\`\`\`typescript
export async function POST(request) {
  const { productId, productName, imageUrls } = await request.json();

  // 1. Call Meshy API - Image to 3D
  const meshyResponse = await fetch('https://api.meshy.ai/v2/image-to-3d', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: imageUrls.front,  // Primary image
      enable_pbr: true,              // Physically-based rendering
      surface_mode: 'hard',          // Surface type
      target_polycount: 30000        // Triangle count
    })
  });

  const { result: taskId } = await meshyResponse.json();

  // 2. Save to database with status 'processing'
  const { data } = await supabase
    .from('product_3d_models')
    .insert({
      product_idea_id: productId,
      user_id,
      task_id: taskId,
      status: 'processing',
      image_urls: imageUrls,
      ai_model_version: 'meshy-4',
      metadata: {
        enable_pbr: true,
        surface_mode: 'hard',
        target_polycount: 30000
      }
    })
    .select()
    .single();

  return Response.json({
    success: true,
    taskId,
    model3DId: data.id,
    message: 'Model generation started. You will be notified when complete.'
  });
}
\`\`\`

**Estimated Time**: 10-15 minutes for high-quality 3D model

#### 8.3 Webhook Processing

**Endpoint**: `/app/api/webhooks/meshy/route.ts`

Meshy calls this webhook when model is ready:

\`\`\`typescript
export async function POST(request) {
  const event = await request.json();

  // Verify webhook signature
  const signature = request.headers.get('x-meshy-signature');
  if (!verifySignature(event, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { task_id, status, model_urls, thumbnail_url, error } = event;

  if (status === 'SUCCEEDED') {
    // 1. Update database
    UPDATE product_3d_models
    SET
      status = 'completed',
      model_url = model_urls.glb,     -- GLB format
      fbx_url = model_urls.fbx,       -- FBX format
      usdz_url = model_urls.usdz,     -- USDZ for AR (iOS)
      obj_url = model_urls.obj,       -- OBJ format
      thumbnail_url,
      completed_at = NOW(),
      processing_time_seconds = EXTRACT(EPOCH FROM (NOW() - created_at))
    WHERE task_id = task_id;

    // 2. Send notification to user
    await createNotification({
      userId,
      title: '3D Model Ready!',
      message: `Your 3D model for "${productName}" is ready to view.`,
      type: '3d_model_completed',
      data: { productId, taskId }
    });

  } else if (status === 'FAILED') {
    // Update with error
    UPDATE product_3d_models
    SET
      status = 'failed',
      error_message = error,
      completed_at = NOW()
    WHERE task_id = task_id;

    // Notify user of failure
    await createNotification({
      userId,
      title: '3D Model Generation Failed',
      message: `Failed to generate 3D model: ${error}`,
      type: '3d_model_failed'
    });
  }

  return Response.json({ received: true });
}
\`\`\`

#### 8.4 3D Model Viewer

**Component**: `/components/3d-viewer/Model3DViewer.tsx`

\`\`\`tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

export function Model3DViewer({ modelUrl }) {
  const { scene } = useGLTF(modelUrl);  // Load GLB file

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} />
      <primitive object={scene} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
}
\`\`\`

**Features**:
- **Rotation**: Click and drag to rotate
- **Zoom**: Scroll wheel
- **Pan**: Right-click and drag
- **Export Options**: Download GLB, FBX, OBJ, USDZ formats
- **AR Preview**: For iOS devices (USDZ format)

---

## 4. Database Schema

### Core Tables

#### 4.1 product_ideas

Primary product table storing all product data.

\`\`\`sql
CREATE TABLE product_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Core data
  prompt TEXT NOT NULL,                    -- Original user prompt
  status TEXT DEFAULT 'generating',        -- Status: generating, images_generated, completed

  -- Legacy image storage (compatibility)
  image_data JSONB DEFAULT '{
    "front": {"url": "", "prompt_used": ""},
    "back": {"url": "", "prompt_used": ""},
    "side": {"url": "", "prompt_used": ""}
  }'::jsonb,

  -- Tech pack and metadata
  tech_pack JSONB DEFAULT '{}'::jsonb,     -- Full tech pack + metadata

  -- Tech pack structure:
  -- {
  --   "productName": "...",
  --   "productOverview": "...",
  --   "materials": [...],
  --   "colors": {...},
  --   "metadata": {
  --     "logo": "base64...",           -- Logo image (base64)
  --     "designFile": "base64...",     -- Design file (base64)
  --     "category": "...",
  --     "style_keywords": [...],
  --     "selected_colors": [...],
  --     "product_goal": "..."
  --   }
  -- }

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_ideas_user_id ON product_ideas(user_id);
CREATE INDEX idx_product_ideas_status ON product_ideas(status);
\`\`\`

**Key Points**:
- `tech_pack.metadata` stores logo and design files as base64
- This allows retrieval during front view generation
- `image_data` is legacy but still updated for compatibility

---

#### 4.2 front_view_approvals

Manages progressive generation workflow - front view approval before generating remaining views.

\`\`\`sql
CREATE TABLE front_view_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session tracking
  session_id TEXT,

  -- Front view data
  front_view_url TEXT,
  front_view_prompt TEXT,

  -- Workflow state
  status TEXT NOT NULL DEFAULT 'pending',   -- pending, approved, rejected, completed, failed
  iteration_number INTEGER DEFAULT 1,       -- Iteration count (1, 2, 3...)
  is_initial_generation BOOLEAN DEFAULT true,
  user_feedback TEXT,

  -- Credit tracking
  credits_reserved INTEGER DEFAULT 3,       -- Total reserved for workflow
  credits_consumed INTEGER DEFAULT 0,       -- Actually consumed

  -- Feature extraction (from OpenAI Vision)
  extracted_features JSONB,                 -- Colors, materials, dimensions

  -- Remaining views (populated after approval)
  back_view_url TEXT,
  back_view_prompt TEXT,
  side_view_url TEXT,
  side_view_prompt TEXT,
  top_view_url TEXT,
  top_view_prompt TEXT,
  bottom_view_url TEXT,
  bottom_view_prompt TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_front_view_approvals_product_id ON front_view_approvals(product_idea_id);
CREATE INDEX idx_front_view_approvals_user_id ON front_view_approvals(user_id);
CREATE INDEX idx_front_view_approvals_status ON front_view_approvals(status);
\`\`\`

**Workflow Statuses**:
- `pending` - Waiting for user approval
- `approved` - User approved, ready to generate remaining views
- `rejected` - User requested changes, new iteration created
- `completed` - All views generated, revision created
- `failed` - Generation error occurred

---

#### 4.3 product_multiview_revisions

Stores all product view revisions (multi-view AI editing).

\`\`\`sql
CREATE TABLE product_multiview_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Revision tracking
  revision_number INTEGER NOT NULL DEFAULT 0,
  batch_id TEXT,                            -- Groups views from same edit

  -- View identification
  view_type TEXT NOT NULL,                  -- front, back, side, top, bottom

  -- Image data
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Edit information
  edit_prompt TEXT,
  edit_type TEXT DEFAULT 'ai_edit',         -- initial, ai_edit, manual_upload, rollback

  -- AI generation details
  ai_model TEXT DEFAULT 'gemini-2.5-flash-image-preview',
  ai_parameters JSONB,
  generation_time_ms INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT false,          -- Only one active revision per product/view
  is_deleted BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB,
  notes TEXT,

  -- Links
  parent_revision_id UUID REFERENCES product_multiview_revisions(id),
  front_view_approval_id UUID REFERENCES front_view_approvals(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one active revision per product/view
CREATE UNIQUE INDEX idx_pmr_unique_active
  ON product_multiview_revisions(product_idea_id, view_type, is_active)
  WHERE is_active = true;

CREATE INDEX idx_pmr_product_idea ON product_multiview_revisions(product_idea_id);
CREATE INDEX idx_pmr_batch_id ON product_multiview_revisions(batch_id);
CREATE INDEX idx_pmr_revision_number ON product_multiview_revisions(revision_number DESC);
\`\`\`

**Example Data**:
\`\`\`sql
-- Initial generation (revision 0)
batch_id: 'initial_abc123_1731849600000'
revision_number: 0
edit_type: 'initial'
is_active: true

-- After edit "change to red" (revision 1)
batch_id: 'edit_1_1731850200000'
revision_number: 1
edit_type: 'ai_edit'
edit_prompt: 'change to red'
is_active: true  -- Previous revision.is_active set to false
\`\`\`

---

#### 4.4 product_tech_packs

Stores multiple tech packs per product, linked to specific revisions.

\`\`\`sql
CREATE TABLE product_tech_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  revision_id UUID REFERENCES product_multiview_revisions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,

  -- Revision tracking
  revision_number INTEGER,

  -- Tech pack data
  tech_pack_data JSONB NOT NULL,            -- Full tech pack JSON

  -- Status
  is_active BOOLEAN DEFAULT false,          -- Currently active tech pack

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_tech_packs_product_id ON product_tech_packs(product_idea_id);
CREATE INDEX idx_product_tech_packs_revision_id ON product_tech_packs(revision_id);
CREATE INDEX idx_product_tech_packs_active ON product_tech_packs(product_idea_id, is_active);
\`\`\`

**Purpose**: Allows users to generate tech packs for different revisions and switch between them.

---

#### 4.5 images_uploads

Legacy/compatibility table for image tracking.

\`\`\`sql
CREATE TABLE images_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id),

  -- Image data
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Upload metadata
  upload_type TEXT,                         -- original, edited
  view_type TEXT,                           -- front, back, side, top, bottom
  file_name TEXT,

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_uploads_product_id ON images_uploads(product_idea_id);
\`\`\`

---

#### 4.6 chat_sessions & ai_chat_messages

Chat interface for AI Designer.

\`\`\`sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID REFERENCES product_ideas(id),

  -- Session data
  session_metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,

  -- Message data
  role TEXT NOT NULL,                       -- user, assistant, system
  content TEXT NOT NULL,

  -- Attachments
  attachments JSONB,                        -- Image URLs, files, etc.

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_messages_session_id ON ai_chat_messages(session_id);
\`\`\`

**Initial Message**: Stored in first `ai_chat_messages` record, contains:
- Full product description
- Brand DNA (if enabled)
- Category, keywords, colors
- Product goal
- Notes about attached logo/design file

---

#### 4.7 product_3d_models

3D model generation tracking (Meshy integration).

\`\`\`sql
CREATE TABLE product_3d_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id),
  user_id UUID NOT NULL,

  -- Meshy task tracking
  task_id TEXT UNIQUE NOT NULL,             -- Meshy task ID
  status TEXT DEFAULT 'processing',         -- processing, completed, failed

  -- Model URLs (different formats)
  model_url TEXT,                           -- GLB format
  fbx_url TEXT,                             -- FBX format
  usdz_url TEXT,                            -- USDZ for AR (iOS)
  obj_url TEXT,                             -- OBJ format
  thumbnail_url TEXT,

  -- Input data
  image_urls JSONB,                         -- Source images

  -- Generation metadata
  ai_model_version TEXT DEFAULT 'meshy-4',
  metadata JSONB,

  -- Error tracking
  error_message TEXT,

  -- Performance
  processing_time_seconds INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_product_3d_models_product_id ON product_3d_models(product_idea_id);
CREATE INDEX idx_product_3d_models_task_id ON product_3d_models(task_id);
\`\`\`

---

### Database Relationships Diagram

\`\`\`
product_ideas (1) ──────┬────── (N) front_view_approvals
       │                │
       │                └────── (N) product_multiview_revisions ──┐
       │                                    │                      │
       │                                    │                      │
       ├──────────────── (N) product_tech_packs ──────────────────┘
       │
       ├──────────────── (N) images_uploads
       │
       ├──────────────── (N) chat_sessions ──── (N) ai_chat_messages
       │
       └──────────────── (N) product_3d_models


Workflow Flow:
1. product_ideas created (minimal entry)
2. front_view_approvals created (pending front view)
3. User approves → remaining views generated
4. product_multiview_revisions created (all 5 views, revision 0)
5. User edits → new product_multiview_revisions (revision 1, 2, ...)
6. User generates tech pack → product_tech_packs (linked to revision)
7. User generates 3D → product_3d_models (async via Meshy)
\`\`\`

---

## 5. Technical Flow Diagrams

### 5.1 Overall System Flow

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                    GENPIRE PRODUCT CREATION FLOW                     │
└─────────────────────────────────────────────────────────────────────┘

START: User enters idea or uploads design
  │
  ├──> Validate input (text OR design file)
  │
  ├──> Check credits (minimum 3)
  │
  ├──> Create minimal product entry
  │     └─> product_ideas table (status: 'generating')
  │
  ├──> Create chat session
  │     └─> chat_sessions + initial ai_chat_messages
  │
  ├──> Redirect to AI Designer
  │     └─> URL: /ai-designer?projectId=xxx&autoGenerate=true
  │
  └──> AUTO-GENERATE FRONT VIEW (Progressive Workflow)
        │
        ├─> Reserve 1 credit
        │
        ├─> Generate front view (~30s)
        │    └─> Gemini: text prompt + logo → front view image
        │
        ├─> Upload to Supabase Storage
        │
        ├─> Create front_view_approvals record (status: 'pending')
        │
        └─> Show approval UI
             │
             ├─> USER APPROVES
             │    │
             │    ├─> Extract features (OpenAI Vision)
             │    │
             │    ├─> Reserve 2 credits
             │    │
             │    ├─> Generate 4 remaining views (~60-90s)
             │    │    └─> Parallel: back, side, top, bottom
             │    │
             │    ├─> Create product_multiview_revisions (revision 0)
             │    │    └─> 5 records (one per view), batch_id, is_active: true
             │    │
             │    └─> Show AI Designer editing interface
             │
             └─> USER REQUESTS EDIT
                  │
                  ├─> Reserve 1 credit
                  │
                  ├─> Mark current approval as 'rejected'
                  │
                  ├─> Regenerate front view with feedback
                  │
                  ├─> Create new front_view_approvals (iteration + 1)
                  │
                  └─> Loop back to approval UI

AI DESIGNER (Multi-View Editor):
  │
  ├─> Display all 5 views
  │
  ├─> Chat interface for edits
  │    │
  │    └─> User: "Change to blue color"
  │         │
  │         ├─> Analyze current images
  │         │
  │         ├─> Generate new views with edits
  │         │
  │         ├─> Create new product_multiview_revisions (revision + 1)
  │         │    └─> Deactivate previous, activate new
  │         │
  │         └─> Update UI
  │
  ├─> Revision history
  │    └─> User can rollback to previous revisions
  │
  ├─> Generate Tech Pack
  │    │
  │    ├─> Get active revision
  │    │
  │    ├─> Call GPT-4o with revision images
  │    │
  │    ├─> Generate comprehensive tech pack JSON
  │    │
  │    ├─> Save to product_tech_packs (linked to revision)
  │    │
  │    ├─> Update product_ideas.tech_pack (legacy)
  │    │
  │    └─> Deduct 1 credit
  │
  └─> Navigate to Tech Pack page
       │
       ├─> View tech pack details
       │
       ├─> Export as PDF
       │
       ├─> Export as Excel
       │
       ├─> Export views as SVG
       │
       └─> Generate 3D Model
            │
            ├─> Call Meshy API (image-to-3D)
            │
            ├─> Create product_3d_models (status: 'processing')
            │
            ├─> Wait for webhook (10-15 minutes)
            │
            ├─> Webhook updates status to 'completed'
            │
            ├─> Store model URLs (GLB, FBX, USDZ, OBJ)
            │
            └─> User views 3D model in viewer

END: Product ready for manufacturing
\`\`\`

---

### 5.2 Progressive Generation Workflow (Detailed)

\`\`\`
┌──────────────────────────────────────────────────────────────────┐
│            PROGRESSIVE GENERATION WORKFLOW (NEW)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  PHASE 1: FRONT VIEW ONLY                                         │
│  ──────────────────────                                           │
│                                                                    │
│  Input: User prompt, logo (optional), design file (optional)      │
│                                                                    │
│  1. Reserve 1 credit                                              │
│     └─> credits.reserved += 1                                     │
│                                                                    │
│  2. Fetch metadata from product_ideas.tech_pack.metadata          │
│     ├─> logo: base64 string                                       │
│     └─> designFile: base64 string                                 │
│                                                                    │
│  3. Build front view prompt                                       │
│     ├─> Include user prompt                                       │
│     ├─> Add logo placement instructions (if logo exists)          │
│     └─> Specify: ONLY FRONT VIEW, single image                    │
│                                                                    │
│  4. Generate with Gemini                                          │
│     ├─> Model: gemini-2.5-flash-image-preview                     │
│     ├─> Input: prompt + referenceImage + logoImage                │
│     ├─> Temperature: 0.1 (for consistency)                        │
│     └─> Output: Image URL (base64 or temporary)                   │
│                                                                    │
│  5. Upload to Supabase Storage                                    │
│     ├─> Preset: "original"                                        │
│     ├─> Path: /projects/{projectId}/front_view_{timestamp}.png    │
│     └─> Returns: Public URL                                       │
│                                                                    │
│  6. Create approval record                                        │
│     ├─> Table: front_view_approvals                               │
│     ├─> status: 'pending'                                         │
│     ├─> iteration_number: 1                                       │
│     ├─> credits_reserved: 1                                       │
│     ├─> credits_consumed: 1 (already deducted)                    │
│     └─> front_view_url: uploaded URL                              │
│                                                                    │
│  7. Show approval UI to user                                      │
│     └─> <FrontViewApproval />                                     │
│                                                                    │
│  Time: ~30 seconds                                                │
│  Credits: 1                                                       │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  PHASE 2A: USER APPROVES                                          │
│  ────────────────────────                                         │
│                                                                    │
│  1. Extract features from front view                              │
│     ├─> Service: OpenAI Vision (gpt-4o-mini)                      │
│     ├─> Input: front_view_url (converted to base64)               │
│     └─> Output: {                                                 │
│         colors: [{ hex, name, usage }],                           │
│         estimatedDimensions: { width, height, depth },            │
│         materials: ["Canvas", "Leather"],                         │
│         keyElements: ["Magnetic closure", "Straps"],              │
│         description: "Modern minimalist bag..."                   │
│       }                                                            │
│                                                                    │
│  2. Update approval record                                        │
│     ├─> status: 'approved'                                        │
│     ├─> approved_at: NOW()                                        │
│     └─> extracted_features: { ... }                               │
│                                                                    │
│  3. Reserve 2 credits for remaining views                         │
│     └─> credits.reserved += 2                                     │
│                                                                    │
│  4. Generate remaining views in parallel                          │
│     ├─> Promise.allSettled([                                      │
│     │    generateBackView(),                                      │
│     │    generateSideView(),                                      │
│     │    generateTopView(),                                       │
│     │    generateBottomView()                                     │
│     │  ])                                                          │
│     │                                                              │
│     └─> Each view generation:                                     │
│         ├─> Build view-specific prompt with extracted features    │
│         │   ├─> "Generate BACK VIEW of this exact product"        │
│         │   ├─> "Colors: ${features.colors.join(', ')}"           │
│         │   ├─> "Materials: ${features.materials.join(', ')}"     │
│         │   └─> "Logo placement: ..." (if logo exists)            │
│         │                                                          │
│         ├─> Call Gemini with:                                     │
│         │   ├─> prompt: view-specific                             │
│         │   ├─> referenceImage: front_view_url                    │
│         │   ├─> logoImage: metadata.logo                          │
│         │   └─> view: "back"|"side"|"top"|"bottom"                │
│         │                                                          │
│         └─> Upload and return URL                                 │
│                                                                    │
│  5. Update approval with additional views                         │
│     ├─> back_view_url, back_view_prompt                           │
│     ├─> side_view_url, side_view_prompt                           │
│     ├─> top_view_url, top_view_prompt                             │
│     ├─> bottom_view_url, bottom_view_prompt                       │
│     ├─> credits_reserved: 1 + 2 = 3                               │
│     └─> credits_consumed: 1 + 2 = 3                               │
│                                                                    │
│  6. Create multi-view revisions (revision 0)                      │
│     ├─> Generate batch_id: `initial_{productId}_{timestamp}`      │
│     ├─> Deactivate any existing revisions (shouldn't be any)      │
│     └─> Insert 5 records into product_multiview_revisions:        │
│         ├─> view_type: 'front', image_url, revision_number: 0     │
│         ├─> view_type: 'back', image_url, revision_number: 0      │
│         ├─> view_type: 'side', image_url, revision_number: 0      │
│         ├─> view_type: 'top', image_url, revision_number: 0       │
│         ├─> view_type: 'bottom', image_url, revision_number: 0    │
│         └─> All: is_active: true, batch_id, edit_type: 'initial'  │
│                                                                    │
│  7. Save to images_uploads (compatibility)                        │
│                                                                    │
│  8. Mark approval as completed                                    │
│     ├─> status: 'completed'                                       │
│     └─> completed_at: NOW()                                       │
│                                                                    │
│  Time: ~60-90 seconds                                             │
│  Credits: 2                                                       │
│  Total: 3 credits for complete product                            │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  PHASE 2B: USER REQUESTS EDIT                                     │
│  ──────────────────────────                                       │
│                                                                    │
│  1. Reserve 1 credit for iteration                                │
│                                                                    │
│  2. Mark current approval as rejected                             │
│     ├─> status: 'rejected'                                        │
│     └─> user_feedback: "Make it bigger"                           │
│                                                                    │
│  3. Build edit prompt                                             │
│     └─> `${originalPrompt}\n\nUser feedback: ${feedback}`         │
│                                                                    │
│  4. Regenerate front view                                         │
│     └─> Same as Phase 1, but with referenceImage: old front view  │
│                                                                    │
│  5. Create new approval record                                    │
│     ├─> iteration_number: previous + 1                            │
│     ├─> credits_reserved: 1                                       │
│     ├─> credits_consumed: 1                                       │
│     └─> is_initial_generation: false                              │
│                                                                    │
│  6. Return new approval to UI                                     │
│     └─> User sees updated front view, can approve or edit again   │
│                                                                    │
│  Time: ~30 seconds per iteration                                  │
│  Credits: 1 per iteration                                         │
│                                                                    │
│  Max iterations: Unlimited (but costs 1 credit each)              │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
\`\`\`

---

### 5.3 Credits Flow

\`\`\`
┌──────────────────────────────────────────────────────────────────┐
│                      CREDITS SYSTEM FLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  OPERATIONS & COSTS:                                              │
│  ────────────────────                                             │
│                                                                    │
│  Initial Product Generation:                                      │
│  ├─> Front view generation: 1 credit                              │
│  ├─> Remaining 4 views: 2 credits                                 │
│  └─> TOTAL: 3 credits                                             │
│                                                                    │
│  Front View Iterations (edits before approval):                   │
│  └─> Each iteration: 1 credit                                     │
│                                                                    │
│  AI Image Edits (after initial generation):                       │
│  ├─> Edit single view: 0.5 credits                                │
│  ├─> Edit all 5 views: 2 credits                                  │
│  └─> Varies based on number of views edited                       │
│                                                                    │
│  Tech Pack Generation:                                            │
│  └─> 1 credit (per tech pack)                                     │
│                                                                    │
│  3D Model Generation:                                             │
│  └─> 5 credits (via Meshy)                                        │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CREDIT RESERVATION SYSTEM:                                       │
│  ────────────────────────────                                     │
│                                                                    │
│  Purpose: Prevent double-charging and allow refunds on failure    │
│                                                                    │
│  Flow:                                                             │
│  1. Reserve credits upfront                                       │
│     └─> ReserveCredits({ credit: amount })                        │
│         ├─> Checks user has enough credits                        │
│         ├─> Deducts from available balance                        │
│         ├─> Creates reservation record                            │
│         └─> Returns: { success, reservationId }                   │
│                                                                    │
│  2. Perform operation                                             │
│     └─> Generate images, tech pack, etc.                          │
│                                                                    │
│  3. On success:                                                   │
│     └─> Credits already deducted in step 1                        │
│         └─> No further action needed                              │
│                                                                    │
│  4. On failure:                                                   │
│     └─> RefundCredits({ credit: amount, reservationId })          │
│         ├─> Adds credits back to user balance                     │
│         └─> Marks reservation as refunded                         │
│                                                                    │
│  Example (Front View Generation):                                 │
│  ──────────────────────────────────                               │
│  try {                                                             │
│    // Reserve 1 credit                                            │
│    const reservation = await ReserveCredits({ credit: 1 });       │
│    reservationId = reservation.reservationId;                     │
│                                                                    │
│    // Generate front view                                         │
│    const result = await geminiService.generateImage(...);         │
│                                                                    │
│    // Success - credit already deducted                           │
│    return { success: true, frontViewUrl };                        │
│                                                                    │
│  } catch (error) {                                                │
│    // Refund on failure                                           │
│    if (reservationId) {                                           │
│      await RefundCredits({ credit: 1, reservationId });           │
│    }                                                               │
│    return { success: false, error };                              │
│  }                                                                 │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CREDIT TRACKING IN DATABASE:                                     │
│  ─────────────────────────────                                    │
│                                                                    │
│  front_view_approvals table:                                      │
│  ├─> credits_reserved: Total reserved for workflow                │
│  ├─> credits_consumed: Actually consumed                          │
│  └─> Example:                                                     │
│      Initial:                                                     │
│      ├─> credits_reserved: 1 (front view)                         │
│      └─> credits_consumed: 1                                      │
│                                                                    │
│      After approval:                                              │
│      ├─> credits_reserved: 1 + 2 = 3                              │
│      └─> credits_consumed: 1 + 2 = 3                              │
│                                                                    │
│  product_multiview_revisions.metadata:                            │
│  └─> { credits_used: 3, ... }                                     │
│                                                                    │
│  product_tech_packs.metadata:                                     │
│  └─> { credits_used: 1, ... }                                     │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 6. Server Actions Reference

### 6.1 Product Creation Actions

**File**: `/app/actions/create-product-entry.ts`

\`\`\`typescript
// Create minimal product entry (fast, non-blocking)
export async function createMinimalProductEntry(data: {
  user_prompt: string;
  category?: string;
  intended_use?: string;
  style_keywords?: string[];
  image?: string;              // Logo (base64)
  selected_colors?: string[];
  product_goal?: string;
  designFile?: string;         // Design file (base64)
  userId: string;
}): Promise<{
  success: boolean;
  projectId?: string;
  data?: any;
  error?: string;
}>
\`\`\`

**What it does**:
- Creates `product_ideas` record with status 'generating'
- Stores logo and design file in `tech_pack.metadata`
- Returns immediately (< 1 second)
- No image generation happens here

---

\`\`\`typescript
// Generate tech pack for existing product
export async function generateTechPackForProduct(
  projectId: string,
  revision?: {
    id: string;
    revisionNumber: number;
    editPrompt?: string;
    views: { front, back, side, top, bottom };
  }
): Promise<{
  success: boolean;
  techPack?: any;
  revisionUsed?: number;
  techPackId?: string;
  error?: string;
}>
\`\`\`

**What it does**:
- Gets active revision (or uses provided revision)
- Builds comprehensive prompt including edit history
- Calls GPT-4o to generate tech pack based on actual revision images
- Saves to `product_tech_packs` table
- Links to specific revision
- Deducts 1 credit

---

### 6.2 Progressive Generation Actions

**File**: `/app/actions/progressive-generation-workflow.ts`

\`\`\`typescript
// STEP 1: Generate only front view
export async function generateFrontViewOnly(params: {
  productId: string;
  userPrompt: string;
  isEdit?: boolean;
  previousFrontViewUrl?: string;
  sessionId?: string;
}): Promise<{
  success: boolean;
  frontViewUrl?: string;
  approvalId?: string;
  sessionId?: string;
  creditsReserved?: number;
  error?: string;
}>
\`\`\`

**Time**: ~30 seconds
**Credits**: 1 (reserved and deducted)

---

\`\`\`typescript
// STEP 2: Handle user decision
export async function handleFrontViewDecision(params: {
  approvalId: string;
  action: 'approve' | 'edit';
  editFeedback?: string;
}): Promise<{
  success: boolean;
  action: 'approved' | 'regenerate';
  newFrontViewUrl?: string;
  newApprovalId?: string;
  extractedFeatures?: ExtractedFeatures;
  error?: string;
}>
\`\`\`

**What it does**:
- If approved: Extracts features, marks as approved
- If edit: Reserves 1 credit, regenerates front view with feedback, creates new approval

---

\`\`\`typescript
// STEP 3: Generate remaining views
export async function generateRemainingViews(params: {
  approvalId: string;
  frontViewUrl: string;
}): Promise<{
  success: boolean;
  views?: { back, side, top, bottom };
  error?: string;
}>
\`\`\`

**Time**: ~60-90 seconds
**Credits**: 2 (for 4 views)

---

\`\`\`typescript
// STEP 4: Create final revision
export async function createRevisionAfterApproval(params: {
  productId: string;
  approvalId: string;
  allViews: { front, back, side, top, bottom };
  isInitial: boolean;
}): Promise<{
  success: boolean;
  revisionNumber?: number;
  batchId?: string;
  revisionIds?: string[];
  error?: string;
}>
\`\`\`

**What it does**:
- Creates `product_multiview_revisions` records (5 total, one per view)
- Sets `is_active: true` on new revision
- Deactivates previous revisions
- Saves to `images_uploads` for compatibility

---

### 6.3 AI Editing Actions

**File**: `/app/actions/ai-image-edit-new-table.ts`

\`\`\`typescript
// Get all revisions for a product (grouped by batch)
export async function getGroupedMultiViewRevisions(productId: string): Promise<{
  success: boolean;
  revisions?: Array<{
    revisionNumber: number;
    batchId: string;
    editPrompt: string;
    editType: string;
    isActive: boolean;
    createdAt: string;
    views: {
      front?: { imageUrl, thumbnailUrl, revisionId };
      back?: { imageUrl, thumbnailUrl, revisionId };
      side?: { imageUrl, thumbnailUrl, revisionId };
      top?: { imageUrl, thumbnailUrl, revisionId };
      bottom?: { imageUrl, thumbnailUrl, revisionId };
    };
  }>;
  error?: string;
}>
\`\`\`

---

\`\`\`typescript
// Edit product views with AI
export async function editProductViews(params: {
  productId: string;
  viewsToEdit: Array<'front' | 'back' | 'side' | 'top' | 'bottom'>;
  editInstruction: string;
  currentRevisionNumber: number;
  sessionId?: string;
  annotationImageUrl?: string;
}): Promise<{
  success: boolean;
  revisionNumber?: number;
  batchId?: string;
  views?: any;
  error?: string;
}>
\`\`\`

**What it does**:
- Gets active revision
- Analyzes current images
- Generates new views with edits applied
- Creates new revision (revision_number + 1)
- Deactivates previous revision

---

### 6.4 Tech Pack Management Actions

**File**: `/app/actions/tech-pack-management.ts`

\`\`\`typescript
// Save tech pack for specific revision
export async function saveTechPackForRevision(
  productId: string,
  revisionId: string | null,
  revisionNumber: number | null,
  techPackData: any
): Promise<{
  success: boolean;
  techPackId?: string;
  data?: any;
  error?: string;
}>
\`\`\`

---

\`\`\`typescript
// Get active tech pack
export async function getActiveTechPack(productId: string): Promise<{
  success: boolean;
  techPack?: any;
  error?: string;
}>
\`\`\`

---

\`\`\`typescript
// Get all tech packs for product
export async function getTechPacksForProduct(productId: string): Promise<{
  success: boolean;
  techPacks?: any[];
  error?: string;
}>
\`\`\`

---

### 6.5 Chat Session Actions

**File**: `/app/actions/chat-session.ts`

\`\`\`typescript
// Get or create chat session
export async function getOrCreateChatSession(
  productId: string,
  userId: string
): Promise<{
  success: boolean;
  sessionId?: string;
  error?: string;
}>
\`\`\`

---

\`\`\`typescript
// Create chat session with initial message
export async function createChatSession(params: {
  productId: string;
  userId: string;
  initialMessage: string;
  productData?: any;
}): Promise<{
  success: boolean;
  sessionId?: string;
  error?: string;
}>
\`\`\`

---

## 7. Component Hierarchy

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT TREE                              │
└─────────────────────────────────────────────────────────────────┘

app/
├─ creator-dashboard/
│  └─ page.tsx
│     └─ components/idea-upload/page.tsx
│        ├─ Tabs (Text / Upload Design)
│        ├─ Text Tab:
│        │  ├─ Textarea (product idea)
│        │  ├─ Logo Upload
│        │  ├─ Brand DNA Toggle
│        │  └─ Improve with AI Button
│        │
│        ├─ Upload Design Tab:
│        │  ├─ Design File Upload
│        │  ├─ Design Description Textarea
│        │  ├─ Improve Description Button
│        │  └─ Logo Upload
│        │
│        └─ Submit Button
│           └─> Calls handleSubmitNew()
│              └─> Creates product, redirects to AI Designer
│
├─ ai-designer/
│  └─ page.tsx (Suspense wrapper)
│     └─ designer.tsx
│        │
│        ├─ State Management:
│        │  ├─ projectId
│        │  ├─ productImages
│        │  ├─ multiViewRevisions
│        │  ├─ chatSessionId
│        │  ├─ techPack
│        │  └─ isGenerating flags
│        │
│        ├─ loadProjectAndInitialize()
│        │  └─> Loads product, checks for pending approval
│        │
│        └─ Conditional Rendering:
│           │
│           ├─ If pending front view approval:
│           │  └─ modules/ai-designer/components/ProgressiveViewsGeneration/
│           │     └─ FrontViewApproval Component
│           │        ├─ Hero image (front view)
│           │        ├─ Version pills (V1, V2, V3...)
│           │        ├─ Approve Button
│           │        ├─ Request Changes Button
│           │        ├─ Edit Textarea
│           │        └─ Quick Edit Chips
│           │
│           └─ If revisions exist (approved):
│              └─ modules/ai-designer/components/MultiViewEditor/
│                 │
│                 ├─ View Display Grid (5 views)
│                 │  ├─ Front View Card
│                 │  ├─ Back View Card
│                 │  ├─ Side View Card
│                 │  ├─ Top View Card
│                 │  └─ Bottom View Card
│                 │
│                 ├─ ChatInterface Component
│                 │  ├─ Message List
│                 │  │  ├─ User Messages
│                 │  │  ├─ Assistant Messages
│                 │  │  └─ System Messages
│                 │  │
│                 │  ├─ Input Area
│                 │  │  ├─ Textarea
│                 │  │  ├─ Image Upload Button
│                 │  │  └─ Send Button
│                 │  │
│                 │  └─ ImageToolDialog (for image attachments)
│                 │
│                 ├─ AnnotationToolbar
│                 │  ├─ Enable Annotation Mode
│                 │  ├─ Drawing Tools (circle, arrow, text)
│                 │  └─ Submit Annotation Button
│                 │
│                 ├─ RevisionHistory Component
│                 │  ├─ Revision List (0, 1, 2, ...)
│                 │  ├─ View Details Modal
│                 │  ├─ Rollback Button
│                 │  └─ TechPackModal (for each revision)
│                 │
│                 ├─ Generate Tech Pack Button
│                 │  └─> Calls generateTechPackForProduct()
│                 │
│                 └─ ViewZoomModal (image enlargement)
│
├─ creator-dashboard/techpacks/[id]/
│  └─ page.tsx
│     └─ techpack.tsx
│        ├─ Tech Pack Display
│        │  ├─ Product Overview Section
│        │  ├─ Materials Table
│        │  ├─ Colors Palette
│        │  ├─ Dimensions Chart
│        │  ├─ Construction Details
│        │  └─ Quality Standards
│        │
│        └─ Export Options
│           ├─ components/pdf-generator/ (PDF)
│           ├─ components/tech-pack/excel-export.tsx (Excel)
│           └─ components/tech-pack/svg-export.tsx (SVG)
│
└─ creator-dashboard/3d-models/
   └─ page.tsx
      ├─ Product List / Collection List
      ├─ Generate 3D Button
      ├─ Model3DViewer Component
      │  └─ @react-three/fiber Canvas
      │     ├─ Lighting
      │     ├─ Model (GLB)
      │     └─ OrbitControls
      │
      ├─ ExportOptions Component
      │  └─ Download buttons (GLB, FBX, OBJ, USDZ)
      │
      └─ Model3DVersionsDialog
         └─ Version history for 3D models
\`\`\`

---

## 8. State Management

### 8.1 Zustand Stores

**File**: `/lib/zustand/useStore.ts`

Main store for user state:

\`\`\`typescript
interface UserState {
  user: any;
  setUser: (user: any) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
\`\`\`

---

**File**: `/lib/zustand/credits/getCredits.ts`

Credits store with real-time updates:

\`\`\`typescript
interface CreditsState {
  getCreatorCredits: any;
  loadingGetCreatorCredits: boolean;
  hasFetchedCreatorCredits: boolean;
  refresCreatorCredits: () => Promise<void>;
}

export const useGetCreditsStore = create<CreditsState>((set) => ({
  getCreatorCredits: null,
  loadingGetCreatorCredits: false,
  hasFetchedCreatorCredits: false,

  refresCreatorCredits: async () => {
    // Fetch from Supabase
    const { data } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    set({
      getCreatorCredits: data,
      hasFetchedCreatorCredits: true
    });
  }
}));
\`\`\`

**Real-time Updates**: RealtimeCreditsProvider sets up Supabase real-time subscription:

\`\`\`typescript
// Subscribes to user_credits table changes
supabase
  .channel('credits-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'user_credits',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Update Zustand store automatically
    useGetCreditsStore.getState().refresCreatorCredits();
  })
  .subscribe();
\`\`\`

---

**File**: `/lib/zustand/techpacks/getAllTechPacks.ts`

Product ideas store:

\`\`\`typescript
interface ProductIdeasState {
  productIdeas: any[];
  loadingProductIdeas: boolean;
  fetchProductIdeas: () => Promise<void>;
  refreshProductIdeas: () => Promise<void>;
}

export const useProductIdeasStore = create<ProductIdeasState>((set) => ({
  productIdeas: [],
  loadingProductIdeas: false,

  fetchProductIdeas: async () => {
    set({ loadingProductIdeas: true });
    const { data } = await supabase
      .from('product_ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    set({
      productIdeas: data,
      loadingProductIdeas: false
    });
  },

  refreshProductIdeas: async () => {
    await fetchProductIdeas();
  }
}));
\`\`\`

---

### 8.2 React Query (Server State)

While Zustand handles client state, server state is managed through direct Supabase queries in server actions. No React Query is currently used, but could be added for caching.

---

### 8.3 Local Component State

AI Designer uses local state for UI concerns:

\`\`\`typescript
// /app/ai-designer/designer.tsx
const [projectId, setProjectId] = useState<string | null>(null);
const [productImages, setProductImages] = useState<ProductImages>({
  front: "", back: "", side: "", top: "", bottom: ""
});
const [multiViewRevisions, setMultiViewRevisions] = useState<any[]>([]);
const [isGeneratingImages, setIsGeneratingImages] = useState(false);
const [isGeneratingTechPack, setIsGeneratingTechPack] = useState(false);
const [chatSessionId, setChatSessionId] = useState<string | null>(null);
const [techPack, setTechPack] = useState<any>(null);
\`\`\`

**Why local state?**
- Page-specific data (not needed globally)
- Cleared on unmount
- Prevents stale data when switching products

---

## 9. Credits System

### 9.1 Credit Costs

| Operation | Credits | Notes |
|-----------|---------|-------|
| Front View Generation | 1 | Initial or iteration |
| Remaining 4 Views | 2 | After approval |
| **Total Initial Product** | **3** | Complete 5-view product |
| Front View Iteration | 1 | Per edit before approval |
| AI Edit (single view) | 0.5 | After initial generation |
| AI Edit (all 5 views) | 2 | Complete product edit |
| Tech Pack Generation | 1 | Per tech pack |
| 3D Model Generation | 5 | Via Meshy API |

### 9.2 Credit Flow Example

**Scenario**: User creates product, iterates front view 2x, approves, makes 1 edit, generates tech pack and 3D

\`\`\`
Initial Balance: 20 credits

1. Create product → Front view generated
   Credits: 20 - 1 = 19

2. User: "Make it bigger" → Front view iteration 1
   Credits: 19 - 1 = 18

3. User: "Change color to blue" → Front view iteration 2
   Credits: 18 - 1 = 17

4. User approves → Remaining 4 views generated
   Credits: 17 - 2 = 15

5. AI Designer: "Add pattern" → Edit all 5 views
   Credits: 15 - 2 = 13

6. Generate Tech Pack
   Credits: 13 - 1 = 12

7. Generate 3D Model
   Credits: 12 - 5 = 7

Final Balance: 7 credits
Total Used: 13 credits
\`\`\`

### 9.3 Credit Reservation & Refund

**Purpose**: Prevent double-charging and enable refunds on failures

\`\`\`typescript
// Reserve credits before operation
const reservation = await ReserveCredits({ credit: 3 });
const reservationId = reservation.reservationId;

// Credits immediately deducted from user balance
// But tracked as "reserved" for refund if needed

try {
  // Perform operation
  const result = await generateImages();

  // On success, reservation is "consumed"
  // No additional deduction needed

} catch (error) {
  // On failure, refund the reserved credits
  await RefundCredits({
    credit: 3,
    reservationId
  });

  // Credits returned to user balance
}
\`\`\`

**Database Tracking**:

\`\`\`sql
-- user_credits table
{
  user_id,
  credits: 20,              -- Available balance
  total_earned: 50,
  total_spent: 30,
  reserved: 0,              -- Currently reserved (not yet consumed)
  updated_at
}

-- credit_transactions table
{
  user_id,
  amount: -3,               -- Negative for deduction
  type: 'reservation',
  reservation_id,
  status: 'active',         -- active, consumed, refunded
  created_at
}
\`\`\`

---

## 10. Error Handling

### 10.1 Server Action Error Patterns

All server actions follow consistent error handling:

\`\`\`typescript
export async function serverAction(params) {
  try {
    // Validate inputs
    if (!params.required) {
      return {
        success: false,
        error: 'Required parameter missing'
      };
    }

    // Perform operation
    const result = await doSomething();

    // Return success
    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error in serverAction:', error);

    // Return error
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Unknown error occurred'
    };
  }
}
\`\`\`

### 10.2 UI Error Handling

\`\`\`typescript
// Component error handling
const handleAction = async () => {
  try {
    const result = await serverAction(params);

    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Operation failed'
      });
      return;
    }

    // Success
    toast({
      title: 'Success',
      description: 'Operation completed'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    toast({
      variant: 'destructive',
      title: 'Unexpected Error',
      description: 'Please try again'
    });
  }
};
\`\`\`

### 10.3 Generation Failures

**Front View Generation Fails**:
\`\`\`typescript
// In generateFrontViewOnly()
catch (error) {
  // Refund reserved credits
  if (reservationId) {
    await RefundCredits({ credit: 1, reservationId });
  }

  return {
    success: false,
    error: 'Failed to generate front view'
  };
}

// UI shows error, user can retry
\`\`\`

**Remaining Views Partial Failure**:
\`\`\`typescript
// In generateRemainingViews()
const results = await Promise.allSettled([...]);

// Check which views failed
const failedViews = results
  .filter(r => r.status === 'rejected')
  .map((r, i) => viewTypes[i]);

if (failedViews.length > 0) {
  console.warn('Failed to generate views:', failedViews);

  // Still create revision with successful views
  // User can regenerate failed views later
}
\`\`\`

**Tech Pack Generation Fails**:
\`\`\`typescript
// In generateTechPackForProduct()
catch (error) {
  // Credit already deducted via reservation
  // No refund - user got partial result (AI attempted generation)

  return {
    success: false,
    error: 'Failed to generate tech pack'
  };
}

// UI shows error, user can retry (costs another credit)
\`\`\`

**3D Model Generation Fails**:
\`\`\`typescript
// Webhook receives failure status
if (status === 'FAILED') {
  // Update database
  UPDATE product_3d_models
  SET status = 'failed',
      error_message = error
  WHERE task_id = task_id;

  // Notify user
  await createNotification({
    title: '3D Model Failed',
    message: error,
    type: '3d_model_failed'
  });

  // Credits NOT refunded (Meshy attempted generation)
}
\`\`\`

---

## 11. File Locations Reference

### Entry Points
\`\`\`
/app/creator-dashboard/page.tsx
  └─> IdeaUploadPage

/components/idea-upload/page.tsx
  └─> Form with Text/Upload tabs
\`\`\`

### Progressive Generation
\`\`\`
/app/actions/progressive-generation-workflow.ts
  ├─> generateFrontViewOnly()
  ├─> handleFrontViewDecision()
  ├─> generateRemainingViews()
  └─> createRevisionAfterApproval()

/modules/ai-designer/components/FrontViewApproval/index.tsx
  └─> UI for front view approval

/modules/ai-designer/components/ProgressiveViewsGeneration/index.tsx
  └─> Orchestrates progressive workflow
\`\`\`

### AI Designer
\`\`\`
/app/ai-designer/page.tsx
  └─> Suspense wrapper

/app/ai-designer/designer.tsx
  └─> Main page component

/modules/ai-designer/components/
  ├─> MultiViewEditor/index.tsx
  ├─> ChatInterface/index.tsx
  ├─> AnnotationToolbar/index.tsx
  ├─> RevisionHistory/index.tsx
  └─> ViewsDisplay/index.tsx
\`\`\`

### Server Actions
\`\`\`
/app/actions/
  ├─> create-product-entry.ts         (Product creation)
  ├─> progressive-generation-workflow.ts  (Front view workflow)
  ├─> ai-image-edit-new-table.ts      (Multi-view editing)
  ├─> tech-pack-management.ts         (Tech pack CRUD)
  ├─> idea-generation.ts              (Tech pack generation AI)
  ├─> chat-session.ts                 (Chat management)
  └─> image-uploads.ts                (Image storage)
\`\`\`

### Tech Pack Display
\`\`\`
/app/creator-dashboard/techpacks/[id]/
  ├─> page.tsx
  └─> techpack.tsx

/components/pdf-generator/
  └─> TechPackPDF component

/components/tech-pack/
  ├─> excel-export.tsx
  └─> svg-export.tsx
\`\`\`

### 3D Models
\`\`\`
/app/creator-dashboard/3d-models/page.tsx

/components/3d-viewer/
  ├─> Model3DViewer.tsx
  ├─> ExportOptions.tsx
  └─> Model3DVersionsDialog.tsx

/app/api/generate-3d-model/route.ts
/app/api/webhooks/meshy/route.ts
\`\`\`

### Database Migrations
\`\`\`
/supabase/migrations/
  ├─> 20251115_create_front_view_approvals_table.sql
  ├─> create_product_multiview_revisions.sql
  ├─> 20250201_create_product_tech_packs.sql
  ├─> 20250113_create_product_3d_models_table.sql
  └─> 20250113_create_ai_chat_messages.sql
\`\`\`

### State Management
\`\`\`
/lib/zustand/
  ├─> useStore.ts                     (User state)
  ├─> credits/getCredits.ts           (Credits with real-time)
  ├─> techpacks/getAllTechPacks.ts    (Product ideas)
  └─> brand-dna/getDna.ts             (Brand DNA)
\`\`\`

### AI Services
\`\`\`
/lib/ai/gemini.ts                     (Gemini image generation)
/lib/services/image-service.ts        (Image optimization & upload)
/lib/logging/ai-logger.ts             (AI operation logging)
\`\`\`

---

## Appendix: Key Workflows in Pseudocode

### A1: Complete New Product Flow

\`\`\`
User submits idea from dashboard
  ↓
1. Validate inputs (text OR design file)
2. Check credits >= 3
3. Create product_ideas record (status: 'generating')
   - Store logo and design file in tech_pack.metadata
4. Create chat_session and initial message
5. Redirect to AI Designer with autoGenerate=true
  ↓
AI Designer loads
  ↓
6. Auto-trigger front view generation
   - Reserve 1 credit
   - Fetch logo and design file from metadata
   - Generate front view with Gemini (~30s)
   - Upload to Supabase Storage
   - Create front_view_approvals (status: 'pending')
7. Show FrontViewApproval UI
  ↓
User approves
  ↓
8. Extract features from front view (OpenAI Vision)
9. Update approval (status: 'approved', extracted_features)
10. Reserve 2 credits
11. Generate remaining 4 views in parallel (~60-90s)
    - Each view uses extracted features for consistency
    - Logo included in prompts if available
12. Update approval with all view URLs
13. Create product_multiview_revisions
    - 5 records (one per view)
    - revision_number: 0
    - is_active: true
    - batch_id
14. Mark approval as 'completed'
  ↓
Multi-View Editor displays all 5 views
  ↓
User makes edits via chat
  ↓
15. Get active revision
16. Analyze current images
17. Generate new views with edits
18. Create new product_multiview_revisions (revision_number + 1)
19. Deactivate previous revision
  ↓
User generates tech pack
  ↓
20. Get active revision
21. Call GPT-4o with revision images
22. Generate tech pack JSON
23. Save to product_tech_packs (linked to revision)
24. Deduct 1 credit
  ↓
User views tech pack
  ↓
25. Export as PDF, Excel, SVG
26. Generate 3D model
    - Call Meshy API
    - Create product_3d_models (status: 'processing')
    - Wait for webhook (~10-15 minutes)
    - Update with model URLs
    - Show in 3D viewer
\`\`\`

---

## Conclusion

This document provides a complete technical reference for understanding Genpire's product creation system. The **progressive workflow** is the key innovation that makes the system fast and user-friendly:

1. **Front view generated first** (~30s) instead of all views at once (2+ minutes)
2. **User approval required** before committing to full generation
3. **Iteration allowed** before consuming full credits
4. **Credits reserved upfront** with refunds on failure
5. **Multi-view revisions** tracked separately for version control
6. **Tech packs linked to specific revisions** for accuracy

The system is built on a foundation of:
- **Supabase** for database and real-time updates
- **Gemini 2.5 Flash** for fast, high-quality image generation
- **GPT-4o** for intelligent tech pack generation
- **Meshy** for 3D model generation
- **Next.js Server Actions** for type-safe server operations
- **Zustand** for client state management

All file paths, database tables, server actions, and workflows are documented above for easy reference and onboarding.
