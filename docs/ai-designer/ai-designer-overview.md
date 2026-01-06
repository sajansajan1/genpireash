# AI Designer Module Architecture Overview

## Project Structure

### Root Directory
\`\`\`
/modules/ai-designer/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── constants/          # Constants and configuration
├── utils/              # Utility functions
├── index.ts            # Module entry point
└── test-setup.tsx      # Testing configuration
\`\`\`

---

## 1. DIRECTORY STRUCTURE & FILES

### 1.1 Components Directory
\`\`\`
components/
├── MultiViewEditor/                    # Main editor component (orchestrator)
│   └── index.tsx                      # Core editor with tabs, viewport, controls
├── ViewsDisplay/                       # Display generated product views
│   └── index.tsx                      # Shows front, back, side, top, bottom views
├── ChatInterface/                      # AI chat interactions
│   ├── index.tsx                      # Main chat component with message list
│   ├── ImageToolDialog.tsx            # Image tool selection dialog
│   └── MarkdownMessage.tsx            # Markdown message rendering
├── RevisionHistory/                    # Revision management UI
│   ├── index.tsx                      # Revision list and navigation
│   ├── RevisionDetailModal.tsx        # Detailed revision view
│   └── TechPackModal.tsx              # Tech pack preview/generation
├── VisualEditor/                       # Visual annotation editor
│   └── index.tsx                      # Canvas-based editing with tools
├── EditPrompt/                         # Edit prompt input
│   └── index.tsx                      # Prompt editing interface
├── AnnotationToolbar/                  # Annotation tools
│   └── index.tsx                      # Tool selection and controls
├── ViewZoomModal/                      # Zoom/detail view modal
│   └── index.tsx                      # Full-screen view zooming
├── SystemMessage/                      # AI system messages
│   └── index.tsx                      # System message display
├── AIMicroEdits/                       # Micro-edits UI (if exists)
├── GenerationProgress/                 # Progress indicator
├── Timeline/                           # Timeline visualization
└── common/                             # Shared components
    ├── ErrorBoundary.tsx              # Error handling wrapper
    ├── LoadingSkeleton.tsx            # Loading state placeholder
    └── ProgressIndicator.tsx          # Progress bar/indicator
\`\`\`

### 1.2 Hooks Directory
\`\`\`
hooks/
├── useImageGeneration.ts              # Image generation logic
├── useRevisionHistory.ts              # Revision management
├── useChatSession.ts                  # Chat session management
├── useAnnotations.ts                  # Annotation state
├── useViewportControls.ts             # Viewport pan/zoom
├── useAIIntent.ts                     # AI intent detection
├── useAIMicroEdits.tsx                # Micro-edits hook
├── useChatMessages.ts                 # Chat messages state
└── index.ts                           # Exports all hooks
\`\`\`

### 1.3 Services Directory
\`\`\`
services/
├── imageGeneration.ts                 # Image generation API calls
├── chatSession.ts                     # Chat session management
├── revisionManager.ts                 # Revision CRUD operations
├── annotationCapture.ts              # Annotation data capture
├── aiIntentDetection.ts              # Intent detection logic
└── index.ts                          # Exports all services
\`\`\`

### 1.4 Store Directory (Zustand)
\`\`\`
store/
├── editorStore.ts                    # Main editor state management
│   - productId, productName, description
│   - currentViews (ViewImages)
│   - revisions (MultiViewRevision[])
│   - loadingStates
│   - viewport controls
│   - visual edit mode
├── chatStore.ts                      # Chat state management
│   - messages (ChatMessage[])
│   - isProcessing
│   - sessionId
├── annotationStore.ts                # Annotation state
│   - annotations
│   - drawing state
│   - drag state
└── index.ts                          # Exports all stores
\`\`\`

### 1.5 Types Directory
\`\`\`
types/
├── revision.types.ts                 # Revision-related types
│   - MultiViewRevision
│   - RevisionSummaryProps
├── chat.types.ts                     # Chat-related types
│   - ChatMessageType
│   - MessageIntent
│   - ChatMessage (frontend)
│   - AIChatMessageDB (database schema)
│   - SaveChatMessageParams
├── editor.types.ts                   # Editor state types
│   - ViewImages
│   - LoadingStates
│   - ViewportState
│   - MultiViewEditorProps
│   - ViewType
├── annotation.types.ts               # Annotation types
│   - AnnotationType
│   - Annotation
│   - DrawingState
│   - DragState
└── index.ts                          # Exports all types
\`\`\`

### 1.6 Constants & Utils
\`\`\`
constants/
├── messages.ts                       # Message templates and variations
├── defaults.ts                       # Default values
├── intents.ts                        # Intent definitions
└── index.ts                          # Exports

utils/
├── messageFormatters.ts              # Message formatting utilities
├── imageProcessing.ts                # Image processing functions
├── promptEnhancer.ts                 # Prompt enhancement logic
├── validators.ts                     # Validation functions
├── devLogger.ts                      # Development logging
└── index.ts                          # Exports
\`\`\`

---

## 2. KEY COMPONENTS DEEP DIVE

### 2.1 MultiViewEditor (Main Component)
**File:** `components/MultiViewEditor/index.tsx`
**Purpose:** Orchestrates the entire AI design system
**Key Features:**
- Tabbed interface (Tabs: Views, Chat, History)
- Viewport controls (zoom, pan, reset)
- Progress indicators
- Mobile/desktop responsive layout
- 3D model viewer integration (dynamic import)

**Props:**
\`\`\`typescript
interface MultiViewEditorProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName?: string
  productDescription?: string
  currentViews: ViewImages
  revisions: any[]
  isInitialGeneration?: boolean
  initialPrompt?: string
  chatSessionId?: string | null
  onRevisionsChange?: (revisions: any[]) => void
  onGenerateTechPack?: (selectedRevision?: any) => Promise<void>
  onGenerateInitialImages?: (prompt, onProgress?) => Promise<...>
  onEditViews: (currentViews, editPrompt) => Promise<...>
  onProgressiveEdit?: (...) => Promise<...>
  onSave?: (views) => void
  onRollback?: (revision) => void
  onDeleteRevision?: (revisionId, batchId?) => Promise<boolean>
}
\`\`\`

### 2.2 ChatInterface Component
**File:** `components/ChatInterface/index.tsx`
**Purpose:** AI chat interactions with vision capabilities
**Key Features:**
- Message history with streaming support
- Image analysis via OpenAI Vision
- Image tool dialog for design inputs
- Dynamic thinking/processing states
- Markdown message rendering
- User/AI avatar display

**Related Files:**
- `ImageToolDialog.tsx` - Image tool selection interface
- `MarkdownMessage.tsx` - Markdown rendering for messages

### 2.3 RevisionHistory Component
**File:** `components/RevisionHistory/index.tsx`
**Purpose:** Manage product revisions
**Key Features:**
- Revision list with thumbnails
- Revision detail modal
- Tech pack generation modal
- Rollback capability
- Delete functionality

**Sub-components:**
- `RevisionDetailModal.tsx` - Detailed revision view
- `TechPackModal.tsx` - Tech pack preview/generation

### 2.4 ViewsDisplay Component
**File:** `components/ViewsDisplay/index.tsx`
**Purpose:** Display product images in multiple angles
**Key Features:**
- Five-view layout (front, back, side, top, bottom)
- Loading states with skeletons
- Click to zoom
- Image error handling

---

## 3. STATE MANAGEMENT (Zustand Stores)

### 3.1 Editor Store
**File:** `store/editorStore.ts`
**Core State:**
- `productId`, `productName`, `productDescription`
- `currentViews` (ViewImages)
- `revisions` (MultiViewRevision[])
- `isInitialGeneration`, `initialPrompt`, `chatSessionId`
- `loadingViews` (per-view loading states)
- `viewport` (zoom, pan, drag state)
- `visualEditMode` (annotation editor state)

**Key Actions:**
\`\`\`typescript
setProductInfo(id, name, description)
setCurrentViews(views: Partial<ViewImages>)
setRevisions(revisions)
addRevision(revision)
removeRevision(revisionId)
setLoadingView(view, isLoading)
setViewport(viewport: Partial<ViewportState>)
resetViewport()
reset()
\`\`\`

### 3.2 Chat Store
**File:** `store/chatStore.ts`
**Core State:**
- `messages` (ChatMessage[])
- `isProcessing`
- `sessionId`

**Key Actions:**
\`\`\`typescript
addMessage(message)
setMessages(messages)
clearMessages()
setIsProcessing(boolean)
\`\`\`

### 3.3 Annotation Store
**File:** `store/annotationStore.ts`
**Core State:**
- `annotations` (Annotation[])
- `drawingState` (DrawingState)
- `dragState` (DragState)

---

## 4. TYPE DEFINITIONS

### 4.1 Revision Type
\`\`\`typescript
interface MultiViewRevision {
  id: string
  revisionNumber: number
  views: {
    front?: { imageUrl: string; thumbnailUrl?: string }
    back?: { imageUrl: string; thumbnailUrl?: string }
    side?: { imageUrl: string; thumbnailUrl?: string }
    top?: { imageUrl: string; thumbnailUrl?: string }
    bottom?: { imageUrl: string; thumbnailUrl?: string }
  }
  editPrompt?: string
  analysisPrompt?: string
  enhancedPrompt?: string
  editType: "initial" | "ai_edit" | "manual_upload"
  createdAt: string
  isActive: boolean
  metadata?: any
}
\`\`\`

### 4.2 Chat Message Types
\`\`\`typescript
type ChatMessageType = 
  | "user" 
  | "ai" 
  | "system" 
  | "image-ready" 
  | "analysis" 
  | "processing" 
  | "error" 
  | "success"

type MessageIntent = 
  | "design_edit" 
  | "question" 
  | "technical_info" 
  | "feedback" 
  | "general_chat" 
  | "greeting"

interface ChatMessage {
  id: string
  product_idea_id?: string
  user_id?: string
  revision_id?: string | null
  batch_id?: string | null
  message_type: ChatMessageType
  content: string
  metadata?: {
    view?: "front" | "back" | "side"
    imageUrl?: string
    progress?: number
    intent?: MessageIntent
    isContextSummary?: boolean
    [key: string]: any
  }
  created_at: Date | string
  updated_at?: Date | string
}
\`\`\`

### 4.3 View Types
\`\`\`typescript
interface ViewImages {
  front: string
  back: string
  side: string
  top: string
  bottom: string
}

type ViewType = "front" | "back" | "side" | "top" | "bottom"
\`\`\`

---

## 5. HOOKS

### 5.1 useChatSession Hook
**File:** `hooks/useChatSession.ts`
**Purpose:** Manage chat session state and message sending

\`\`\`typescript
function useChatSession(productId: string | null) {
  return {
    messages: ChatMessage[]
    isProcessing: boolean
    sendMessage: (content: string) => Promise<void>
    addChatMessage: (type, content, metadata?) => ChatMessage
    clearMessages: () => void
  }
}
\`\`\`

### 5.2 useChatMessages Hook
**File:** `hooks/useChatMessages.ts`
**Purpose:** Chat message state management with backend sync

### 5.3 useRevisionHistory Hook
**File:** `hooks/useRevisionHistory.ts`
**Purpose:** Revision CRUD operations and history management

### 5.4 useImageGeneration Hook
**File:** `hooks/useImageGeneration.ts`
**Purpose:** Image generation with progress tracking

### 5.5 useAnnotations Hook
**File:** `hooks/useAnnotations.ts`
**Purpose:** Annotation drawing and manipulation

### 5.6 useViewportControls Hook
**File:** `hooks/useViewportControls.ts`
**Purpose:** Pan, zoom, and viewport management

### 5.7 useAIIntent Hook
**File:** `hooks/useAIIntent.ts`
**Purpose:** Detect user intent from messages

---

## 6. API ROUTES & ENDPOINTS

### 6.1 Chat API
**Route:** `/api/ai-chat`
**Method:** POST
**Purpose:** AI chat interactions with vision support
**Features:**
- OpenAI integration
- Image analysis via base64 conversion
- Temperature and token control
- Screenshot analysis support

### 6.2 Image Generation Routes
**Route:** `/api/product-pack-generation/generate-front-view`
**Route:** `/api/product-pack-generation/generate-additional-views`
**Route:** `/api/product-pack-generation/generate-techpack-images`
**Route:** `/api/product-pack-generation/approve-front-view`

### 6.3 3D Model Routes
**Route:** `/api/product-3d-models`
**Methods:** GET, POST, PATCH, DELETE
**Features:**
- CRUD operations for 3D models
- Source type: "product" | "collection"
- Status tracking (PENDING, IN_PROGRESS, SUCCEEDED, FAILED)
- Task ID management
- Model versioning with is_active flag

**GET Query Parameters:**
\`\`\`
sourceType: "product" | "collection" (required)
sourceId: UUID (required)
includeAll?: boolean (default: false)
\`\`\`

---

## 7. DATABASE INTEGRATION

### 7.1 Product Ideas Table
**File:** `lib/supabase/productIdea.ts`
**Key Functions:**
\`\`\`typescript
getUserProjectIdea(project_id: string)
deleteOldImages(imageData: any)
deleteSupabaseImages(imageUrl: string)
updateTechpack(project_id, updatedTechpack)
updateProjectImages(project_id, imageData)
\`\`\`

### 7.2 Product 3D Models Table
**File:** `lib/supabase/product3DModel.ts`
**Interface:**
\`\`\`typescript
interface Product3DModel {
  id: string
  user_id: string
  source_type: "product" | "collection"
  source_id: string
  task_id: string
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED"
  progress: number
  model_urls: ModelUrls
  thumbnail_url?: string
  texture_urls?: TextureUrls[]
  input_images: InputImages
  task_error?: string
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
  finished_at?: string
}
\`\`\`

**Key Functions:**
- `createProduct3DModel(input)` - Create new 3D model
- `updateProduct3DModelByTaskId(task_id, updates)` - Update by task
- `updateProduct3DModelById(id, updates)` - Update by ID
- `getActiveProduct3DModel(sourceType, sourceId)` - Get active version
- `getAllProduct3DModels(sourceType, sourceId)` - Get all versions
- `getProduct3DModelByTaskId(task_id)` - Get by task ID
- `setActiveProduct3DModel(id)` - Set as active
- `deleteProduct3DModel(id)` - Delete version

### 7.3 AI Chat Messages Table
**Schema:** `ai_chat_messages`
**Columns:**
\`\`\`typescript
interface AIChatMessageDB {
  id: string (uuid)
  product_idea_id: string (uuid)
  user_id: string (uuid)
  revision_id?: string (uuid, nullable)
  batch_id?: string (text, nullable) // Groups messages from same session
  message_type: ChatMessageType
  content: string
  metadata?: jsonb // Flexible JSON storage
  created_at: timestamp with time zone
  updated_at: timestamp with time zone
}
\`\`\`

---

## 8. MAIN ENTRY POINTS

### 8.1 Module Export
**File:** `modules/ai-designer/index.ts`
**Exports:**
- All types from `./types`
- All hooks from `./hooks`
- All components from `./components`
- All services from `./services`
- All utilities from `./utils`
- All constants from `./constants`
- All stores from `./store`

### 8.2 AI Designer Page
**File:** `app/ai-designer/page.tsx`
**Exports:** `AiDesigner` component wrapped in Suspense
**File:** `app/ai-designer/designer.tsx`
**Contains:** Main AIDesignerPage implementation

---

## 9. WORKFLOW & DATA FLOW

### 9.1 Initial Generation Flow
\`\`\`
User Input (Prompt)
    ↓
ChatInterface sends to /api/ai-chat
    ↓
OpenAI processes and returns suggestions
    ↓
User approves → generateInitialImages() called
    ↓
Image generation API routes triggered
    ↓
Images generated in parallel for 5 views
    ↓
EditorStore.setCurrentViews() updates UI
    ↓
MultiViewEditor renders ViewsDisplay
\`\`\`

### 9.2 Revision Flow
\`\`\`
User edits prompt in EditPrompt component
    ↓
onEditViews callback triggered
    ↓
Images regenerated with new prompt
    ↓
New MultiViewRevision created
    ↓
EditorStore.addRevision() saves to state
    ↓
RevisionHistory updated
    ↓
User can rollback to any previous revision
\`\`\`

### 9.3 Chat Integration
\`\`\`
User types message in ChatInterface
    ↓
useChatMessages.sendMessage() called
    ↓
Message posted to /api/ai-chat
    ↓
AI analyzes with vision if image provided
    ↓
Intent detected via useAIIntent
    ↓
ChatStore.addMessage() updates message list
    ↓
If design edit intent: trigger image regeneration
\`\`\`

---

## 10. KEY UTILITIES & HELPERS

### 10.1 Message Formatters
**File:** `utils/messageFormatters.ts`
- Format messages for display
- Handle Markdown rendering
- Template-based message variations

### 10.2 Image Processing
**File:** `utils/imageProcessing.ts`
- Image validation
- Base64 conversion
- URL formatting
- Thumbnail generation

### 10.3 Prompt Enhancer
**File:** `utils/promptEnhancer.ts`
- Enhance user prompts for better AI results
- Add context from product info
- Combine with image analysis

### 10.4 Validators
**File:** `utils/validators.ts`
- Input validation
- Image URL validation
- Prompt validation

### 10.5 Dev Logger
**File:** `utils/devLogger.ts`
- Development-only logging
- Performance tracking
- Debug information

---

## 11. CONSTANTS

### 11.1 Messages
**File:** `constants/messages.ts`
- Message templates with variations
- Processing messages
- Success/completion messages
- Error messages

### 11.2 Defaults
**File:** `constants/defaults.ts`
- Default zoom levels
- Default viewport settings
- Default colors
- Default UI configurations

### 11.3 Intents
**File:** `constants/intents.ts`
- Intent definitions
- Keywords for intent matching
- Intent categories

---

## 12. TESTING & SETUP

**File:** `modules/ai-designer/test-setup.tsx`
- Test environment configuration
- Mock providers
- Test utilities

---

## 13. ARCHITECTURE PATTERNS

### 13.1 Component Hierarchy
\`\`\`
MultiViewEditor (Orchestrator)
├── Tabs TabsList
│   ├── "Views" Tab → ViewsDisplay
│   ├── "Chat" Tab → ChatInterface
│   └── "History" Tab → RevisionHistory
├── ViewsDisplay
│   └── Five product view angles
├── ChatInterface
│   ├── Message history
│   ├── ImageToolDialog (modal)
│   └── Input area
├── RevisionHistory
│   ├── Revision list
│   ├── RevisionDetailModal
│   └── TechPackModal
└── Viewport Controls
    └── Zoom, Pan, Reset buttons
\`\`\`

### 13.2 State Management Pattern
\`\`\`
Zustand Stores (Global State)
├── EditorStore (product, views, revisions, UI state)
├── ChatStore (messages, processing)
└── AnnotationStore (annotations, drawing)

     ↓ Connected via hooks
     
Custom Hooks (Logic Layer)
├── useRevisionHistory (CRUD)
├── useChatMessages (messaging)
├── useImageGeneration (generation)
├── useAnnotations (annotation logic)
├── useViewportControls (viewport)
└── useAIIntent (intent detection)

     ↓ Used by
     
Components (UI Layer)
\`\`\`

### 13.3 Service Pattern
\`\`\`
Services (Business Logic)
├── imageGeneration.ts (not fully implemented - TODO)
├── chatSession.ts
├── revisionManager.ts
├── annotationCapture.ts
└── aiIntentDetection.ts

     ↓ Called by
     
Hooks or Components
\`\`\`

---

## 14. INTEGRATION POINTS

### 14.1 Server Actions
- `extractProductNameAction` - Extract product name from descriptions
- `uploadChatImage` - Handle image uploads
- `saveChatUploadedImageToMetadata` - Save image metadata
- `getUserProducts` - Fetch user's products

### 14.2 External APIs
- **OpenAI** - Chat and vision analysis
- **Image Generation API** - Product image generation
- **Supabase** - Database and storage
- **3D Model Generation** - Meshy API (via webhooks)

### 14.3 UI Components from @/components
- Button, Input, Tabs, Dialog, Avatar
- Toast notifications
- Image tools

---

## 15. NOTABLE DESIGN DECISIONS

### 15.1 Separation of Concerns
- **Components**: UI rendering and user interaction
- **Hooks**: Business logic and state management
- **Services**: API calls and external integrations (TODO: Implementation needed)
- **Stores**: Global state with Zustand
- **Types**: Type safety across modules

### 15.2 Unimplemented Services
Services layer exists but contains TODO comments:
- `imageGeneration.ts` - Functions return "Not implemented"
- `revisionManager.ts` - Functions return "Not implemented"

**Note:** Logic is currently embedded in components/hooks. Should be refactored into services.

### 15.3 Progressive Enhancement
- Lazy loading of 3D viewer
- Progressive image generation (per-view)
- Streaming chat responses
- Incremental revision loading

### 15.4 Responsive Design
- Mobile chat toggle
- Responsive tabs
- Adaptive viewport controls
- Desktop and mobile optimized layouts

---

## 16. SUMMARY TABLE

| Layer | Location | Purpose |
|-------|----------|---------|
| **Pages** | `app/ai-designer/` | Entry points for the feature |
| **Main Component** | `components/MultiViewEditor/` | Orchestrates entire system |
| **Sub-components** | `components/*` | Specific UI elements |
| **State Management** | `store/` | Zustand stores for global state |
| **Business Logic** | `hooks/` | Custom hooks for feature logic |
| **API Integration** | `services/` | (TODO: Implement fully) |
| **Types** | `types/` | TypeScript definitions |
| **Utilities** | `utils/` | Helper functions |
| **Constants** | `constants/` | Configuration and messages |
| **API Routes** | `app/api/` | Backend endpoints |
| **Database** | `lib/supabase/` | DB operations |

---

## 17. KEY FILES AT A GLANCE

\`\`\`
modules/ai-designer/
├── 📄 index.ts                    Module exports
├── 📂 components/
│   ├── MultiViewEditor/           MAIN COMPONENT
│   ├── ChatInterface/             AI chat UI
│   ├── ViewsDisplay/              5-view display
│   ├── RevisionHistory/           Revision management
│   ├── VisualEditor/              Annotation editor
│   └── common/                    Shared components
├── 📂 hooks/
│   ├── useChatSession.ts          Chat logic
│   ├── useRevisionHistory.ts      Revision logic
│   ├── useImageGeneration.ts      Image generation
│   └── 5 more...
├── 📂 store/
│   ├── editorStore.ts             Main state
│   ├── chatStore.ts               Chat state
│   └── annotationStore.ts         Annotation state
├── 📂 types/
│   ├── revision.types.ts          Revision types
│   ├── chat.types.ts              Chat types
│   └── 2 more...
└── 📂 utils/, constants/, services/

app/
├── 📂 ai-designer/
│   ├── page.tsx                   Page wrapper
│   └── designer.tsx               Main implementation
└── 📂 api/
    ├── ai-chat/                   Chat API
    ├── product-pack-generation/   Image generation
    └── product-3d-models/         3D model management

lib/
└── 📂 supabase/
    ├── productIdea.ts             Product operations
    └── product3DModel.ts          3D model operations
\`\`\`
