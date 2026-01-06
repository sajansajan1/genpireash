# AI Designer Module - Architecture Diagram

## System Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    MultiViewEditor Component                      │  │
│  │         (Main Orchestrator - modules/ai-designer/components/)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                              │
│           ├─────────────────────────┬──────────────────┬──────────────┐  │
│           │                         │                  │              │  │
│      ┌────▼────┐            ┌──────▼──────┐     ┌─────▼────┐  ┌──────▼──┐
│      │  Views  │            │    Chat     │     │ History  │  │Viewport │
│      │   Tab   │            │     Tab     │     │   Tab    │  │Controls │
│      └────┬────┘            └──────┬──────┘     └─────┬────┘  └──────┬──┘
│           │                        │                   │              │
│   ┌───────▼────────┐      ┌────────▼──────────┐  ┌────▼──────────┐  │
│   │ ViewsDisplay   │      │ ChatInterface     │  │RevisionHistory│  │
│   │ Component      │      │ Component         │  │ Component     │  │
│   │ - front        │      │ - Message list    │  │ - List        │  │
│   │ - back         │      │ - Input area      │  │ - Detail modal│  │
│   │ - side         │      │ - Image tools     │  │ - Tech pack   │  │
│   │ - top          │      │ - Markdown render │  │   modal       │  │
│   │ - bottom       │      │ - Vision analysis │  │ - Rollback    │  │
│   └────────────────┘      └───────────────────┘  └───────────────┘  │
│                                                                           │
│  Additional UI Components:                                               │
│  ├─ VisualEditor (Canvas annotations)                                   │
│  ├─ EditPrompt (Prompt input)                                           │
│  ├─ AnnotationToolbar (Tool selection)                                  │
│  ├─ ViewZoomModal (Full-screen zoom)                                    │
│  ├─ SystemMessage (AI system messages)                                  │
│  ├─ Common: ErrorBoundary, LoadingSkeleton, ProgressIndicator          │
│  └─ 3D Viewer (Dynamic import)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                    STATE MANAGEMENT LAYER (Zustand)                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │  EditorStore     │  │   ChatStore      │  │ AnnotationStore      │ │
│  │                  │  │                  │  │                      │ │
│  │ - productId      │  │ - messages[]     │  │ - annotations[]      │ │
│  │ - productName    │  │ - isProcessing   │  │ - drawingState       │ │
│  │ - description    │  │ - sessionId      │  │ - dragState          │ │
│  │ - currentViews   │  │                  │  │                      │ │
│  │ - revisions[]    │  │ Actions:         │  │ Actions:             │ │
│  │ - loadingViews   │  │ - addMessage()   │  │ - addAnnotation()    │ │
│  │ - viewport state │  │ - setMessages()  │  │ - updateAnnotation() │ │
│  │ - visualEditMode │  │ - clearMessages()│  │ - deleteAnnotation() │ │
│  │                  │  │ - setProcessing()│  │                      │ │
│  │ Actions: 20+     │  └──────────────────┘  └──────────────────────┘ │
│  │ setters/actions  │                                                   │
│  └──────────────────┘                                                   │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                    CUSTOM HOOKS LAYER (Business Logic)                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────┐  ┌──────────────────────┐                      │
│  │ useRevisionHistory │  │  useChatMessages     │                      │
│  │                    │  │  (Chat CRUD + sync)  │                      │
│  │ - save()           │  │                      │                      │
│  │ - delete()         │  │ - sendMessage()      │                      │
│  │ - getRevisions()   │  │ - fetchMessages()    │                      │
│  │ - rollback()       │  │ - updateMessage()    │                      │
│  └────────────────────┘  └──────────────────────┘                      │
│                                                                          │
│  ┌────────────────────┐  ┌──────────────────────┐                      │
│  │ useImageGeneration │  │ useChatSession       │                      │
│  │                    │  │                      │                      │
│  │ - generate()       │  │ - startSession()     │                      │
│  │ - editViews()      │  │ - sendMessage()      │                      │
│  │ - progressiveEdit()│  │ - addChatMessage()   │                      │
│  └────────────────────┘  └──────────────────────┘                      │
│                                                                          │
│  ┌────────────────────┐  ┌──────────────────────┐  ┌──────────────┐   │
│  │ useAnnotations     │  │ useViewportControls  │  │  useAIIntent │   │
│  │                    │  │                      │  │              │   │
│  │ - draw()           │  │ - zoom()             │  │ - detect()   │   │
│  │ - erase()          │  │ - pan()              │  │ - classify() │   │
│  │ - addText()        │  │ - reset()            │  │              │   │
│  └────────────────────┘  └──────────────────────┘  └──────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                    SERVICES LAYER (API Integration)                    │
├────────────────────────────────────────────────────────────────────────┤
│  [Note: Most services are TODO - logic embedded in hooks/components]    │
│                                                                          │
│  ├─ imageGeneration.ts        (generateInitialImages, editViews)       │
│  ├─ chatSession.ts            (Session management)                     │
│  ├─ revisionManager.ts        (Revision CRUD)                          │
│  ├─ annotationCapture.ts      (Annotation capture)                     │
│  └─ aiIntentDetection.ts      (Intent detection)                       │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                      API ROUTES LAYER (Backend)                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │  /api/ai-chat              │  │  /api/product-pack-generation/   │ │
│  │                            │  │                                  │ │
│  │ POST Request:              │  │  ├─ generate-front-view          │ │
│  │ ├─ prompt                  │  │  ├─ generate-additional-views    │ │
│  │ ├─ imageUrl (optional)     │  │  ├─ generate-techpack-images    │ │
│  │ ├─ temperature             │  │  └─ approve-front-view          │ │
│  │ ├─ useVision               │  │                                  │ │
│  │ └─ max_tokens              │  │  All use stepped-image-generation│ │
│  │                            │  │  server action                   │ │
│  │ Response:                  │  │                                  │ │
│  │ ├─ success: boolean        │  │  Response:                       │ │
│  │ ├─ response: string        │  │  ├─ success: boolean            │ │
│  │ └─ metadata: object        │  │  ├─ views: ViewImages           │ │
│  └────────────────────────────┘  │  └─ error?: string              │ │
│                                   └──────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  /api/product-3d-models                                        │   │
│  │                                                                 │   │
│  │  GET:  Fetch 3D models                                         │   │
│  │  ├─ Query: sourceType, sourceId, includeAll                  │   │
│  │  └─ Response: { models[], count }                             │   │
│  │                                                                 │   │
│  │  PATCH: Update 3D model status                                │   │
│  │  ├─ Body: { modelId, action }                                 │   │
│  │  └─ Response: { success, model }                              │   │
│  │                                                                 │   │
│  │  DELETE: Remove 3D model version                              │   │
│  │  └─ Response: { success }                                     │   │
│  └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                    DATABASE LAYER (Supabase/PostgreSQL)                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │  product_ideas             │  │  product_3d_models               │ │
│  │  (Existing table)          │  │  (New table)                     │ │
│  │                            │  │                                  │ │
│  │ Columns:                   │  │ Columns:                         │ │
│  │ ├─ id (uuid)               │  │ ├─ id (uuid)                    │ │
│  │ ├─ user_id (uuid)          │  │ ├─ user_id (uuid)               │ │
│  │ ├─ image_data (jsonb)      │  │ ├─ source_type (text)           │ │
│  │ ├─ tech_pack (jsonb)       │  │ ├─ source_id (uuid)             │ │
│  │ └─ ...                     │  │ ├─ task_id (text)               │ │
│  │                            │  │ ├─ status (text)                │ │
│  │ Ops via:                   │  │ ├─ progress (integer)           │ │
│  │ ├─ getUserProjectIdea()    │  │ ├─ model_urls (jsonb)           │ │
│  │ ├─ updateProjectImages()   │  │ ├─ input_images (jsonb)         │ │
│  │ ├─ updateTechpack()        │  │ ├─ version (integer)            │ │
│  │ └─ deleteOldImages()       │  │ ├─ is_active (boolean)          │ │
│  └────────────────────────────┘  │ └─ ...                          │ │
│                                   │                                  │ │
│                                   │ Operations via lib/supabase/:    │ │
│                                   │ ├─ createProduct3DModel()       │ │
│                                   │ ├─ updateProduct3DModelById()   │ │
│                                   │ ├─ getActiveProduct3DModel()    │ │
│                                   │ ├─ getAllProduct3DModels()      │ │
│                                   │ ├─ setActiveProduct3DModel()    │ │
│                                   │ └─ deleteProduct3DModel()       │ │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  ai_chat_messages (Planned)                                    │   │
│  │                                                                 │   │
│  │ Columns:                                                        │   │
│  │ ├─ id (uuid)                                                   │   │
│  │ ├─ product_idea_id (uuid)                                      │   │
│  │ ├─ user_id (uuid)                                              │   │
│  │ ├─ revision_id (uuid, nullable)                                │   │
│  │ ├─ batch_id (text, nullable) - Groups messages                │   │
│  │ ├─ message_type (text)                                         │   │
│  │ ├─ content (text)                                              │   │
│  │ ├─ metadata (jsonb)                                            │   │
│  │ ├─ created_at (timestamp)                                      │   │
│  │ └─ updated_at (timestamp)                                      │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Storage Buckets:                                                        │
│  └─ fileuploads/ - Product images and revisions                        │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                    EXTERNAL SERVICES & APIs                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐   │
│  │   OpenAI             │  │   Image Generation Service           │   │
│  │  (GPT-4o + Vision)   │  │   (Stable Diffusion / Similar)       │   │
│  │                      │  │                                      │   │
│  │ ├─ Text completion   │  │ ├─ Generate images from prompts     │   │
│  │ ├─ Vision analysis   │  │ ├─ Edit existing images             │   │
│  │ ├─ Prompt enhance    │  │ ├─ 5 views generation               │   │
│  │ └─ Intent detection  │  │ └─ Progress tracking                │   │
│  └──────────────────────┘  └──────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐   │
│  │   Meshy API          │  │   Email Service                      │   │
│  │  (3D Generation)     │  │   (SendGrid)                         │   │
│  │                      │  │                                      │   │
│  │ ├─ Task creation     │  │ ├─ Tech pack notifications          │   │
│  │ ├─ Status polling    │  │ ├─ Generation alerts                │   │
│  │ ├─ Webhook receiver  │  │ └─ User communications              │   │
│  │ └─ Model download    │  │                                      │   │
│  └──────────────────────┘  └──────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
\`\`\`

## Data Flow Diagrams

### Initial Generation Workflow
\`\`\`
User enters product prompt
          │
          ▼
ChatInterface captures input
          │
          ▼
POST /api/ai-chat
  - OpenAI analyzes prompt
  - Returns suggestions
          │
          ▼
User approves design direction
          │
          ▼
generateInitialImages() triggered
          │
          ├─────────────────────┬───────────────┬──────────────┬──────────┐
          │                     │               │              │          │
          ▼                     ▼               ▼              ▼          ▼
    Generate       Generate    Generate     Generate    Generate
     Front          Back        Side          Top       Bottom
     Images        Images      Images       Images      Images
          │                     │               │              │          │
          └─────────────────────┴───────────────┴──────────────┴──────────┘
                                │
                                ▼
                    EditorStore.setCurrentViews()
                                │
                                ▼
                    ViewsDisplay renders all 5 views
                                │
                                ▼
                    User sees product from multiple angles
\`\`\`

### Revision Workflow
\`\`\`
User edits design with new prompt
          │
          ▼
EditPrompt captures changes
          │
          ▼
onEditViews() called
          │
          ├─────────────────────┬───────────────┬──────────────┬──────────┐
          │                     │               │              │          │
          ▼                     ▼               ▼              ▼          ▼
     Edit with          Edit with      Edit with       Edit with    Edit with
     new prompt         new prompt     new prompt      new prompt   new prompt
     (Front)            (Back)         (Side)          (Top)        (Bottom)
          │                     │               │              │          │
          └─────────────────────┴───────────────┴──────────────┴──────────┘
                                │
                                ▼
                    Create MultiViewRevision
                    {
                      id, revisionNumber,
                      views: { front, back, side, top, bottom },
                      editPrompt, editType: "ai_edit",
                      createdAt, isActive
                    }
                                │
                                ▼
                    EditorStore.addRevision()
                                │
                                ▼
                    RevisionHistory updates
                                │
                                ▼
                    User can view/rollback revisions
\`\`\`

### Chat-to-Design Flow
\`\`\`
User sends chat message
          │
          ▼
ChatInterface.sendMessage()
          │
          ▼
useChatMessages.sendMessage()
          │
          ▼
POST /api/ai-chat
  - OpenAI processes message
  - Optional: Vision analysis of current design
  - Returns response + intent
          │
          ▼
useAIIntent.detect()
  - Classify: design_edit | question | feedback | etc
          │
          ├─────────────────────┐
          │                     │
      design_edit           other intents
          │                     │
          ▼                     ▼
  Trigger image         Display chat message
  regeneration          only
          │
          ▼
  Same as Revision flow


ChatStore.addMessage()
          │
          ▼
ChatInterface renders message
\`\`\`

## Component Interaction Map

\`\`\`
MultiViewEditor (Root Orchestrator)
│
├── ViewsDisplay Component
│   └── Displays: front, back, side, top, bottom images
│       └── Uses: EditorStore.currentViews
│       └── Actions: Click to zoom
│
├── ChatInterface Component
│   ├── Message List
│   │   └── Uses: ChatStore.messages
│   ├── Input Area
│   │   ├── Text input
│   │   └── ImageToolDialog (modal)
│   │       └── Tools: reference image, brand kit, etc.
│   ├── Processing States
│   │   └── Uses: ChatStore.isProcessing
│   └── Vision Analysis
│       └── Uses: OpenAI Vision API
│
├── RevisionHistory Component
│   ├── Revision List
│   │   └── Uses: EditorStore.revisions[]
│   ├── RevisionDetailModal
│   │   ├── Shows: details of selected revision
│   │   └── Actions: preview, rollback
│   └── TechPackModal
│       └── Actions: generate, download tech pack
│
├── Viewport Controls (Floating Buttons)
│   ├── Zoom In/Out
│   │   └── Uses: EditorStore.viewport.zoomLevel
│   ├── Pan
│   │   └── Uses: EditorStore.viewport.viewPosition
│   ├── Reset
│   │   └── Calls: EditorStore.resetViewport()
│   └── 3D Model Toggle
│       └── Loads: Model3DViewer dynamically
│
└── Status Indicators
    ├── Loading states per-view
    │   └── Uses: EditorStore.loadingViews
    ├── Progress bars
    │   └── Uses: GenerationProgressIndicator
    └── Error boundaries
        └── Catches component errors
\`\`\`

## State Update Flow

\`\`\`
User Action
    │
    ├─ Interact with Component
    │       │
    │       ▼
    │   Component triggers Hook
    │       │
    │       ▼
    │   Hook updates Zustand Store
    │       │
    │       ├─ EditorStore.setState()
    │       ├─ ChatStore.setState()
    │       └─ AnnotationStore.setState()
    │       │
    │       ▼
    │   All subscribed components re-render
    │       │
    │       ▼
    │   UI updates automatically
    │
    └─ Make API Call
            │
            ▼
        Fetch/POST to /api/*
            │
            ▼
        Update Store with response
            │
            ▼
        UI auto-updates via subscriptions
\`\`\`
