# AI Designer Module - Quick Reference Guide

## File Locations (Absolute Paths)

### Module Root
- `/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/modules/ai-designer/`

### Main Components
- **MultiViewEditor**: `/modules/ai-designer/components/MultiViewEditor/index.tsx` (MAIN)
- **ChatInterface**: `/modules/ai-designer/components/ChatInterface/index.tsx`
- **ViewsDisplay**: `/modules/ai-designer/components/ViewsDisplay/index.tsx`
- **RevisionHistory**: `/modules/ai-designer/components/RevisionHistory/index.tsx`
- **VisualEditor**: `/modules/ai-designer/components/VisualEditor/index.tsx`

### State Management
- **EditorStore**: `/modules/ai-designer/store/editorStore.ts`
- **ChatStore**: `/modules/ai-designer/store/chatStore.ts`
- **AnnotationStore**: `/modules/ai-designer/store/annotationStore.ts`

### Custom Hooks
- **useChatSession**: `/modules/ai-designer/hooks/useChatSession.ts`
- **useChatMessages**: `/modules/ai-designer/hooks/useChatMessages.ts`
- **useRevisionHistory**: `/modules/ai-designer/hooks/useRevisionHistory.ts`
- **useImageGeneration**: `/modules/ai-designer/hooks/useImageGeneration.ts`
- **useAnnotations**: `/modules/ai-designer/hooks/useAnnotations.ts`
- **useViewportControls**: `/modules/ai-designer/hooks/useViewportControls.ts`
- **useAIIntent**: `/modules/ai-designer/hooks/useAIIntent.ts`

### Type Definitions
- **Revision Types**: `/modules/ai-designer/types/revision.types.ts`
- **Chat Types**: `/modules/ai-designer/types/chat.types.ts`
- **Editor Types**: `/modules/ai-designer/types/editor.types.ts`
- **Annotation Types**: `/modules/ai-designer/types/annotation.types.ts`

### Database Layer
- **Product Ideas**: `/lib/supabase/productIdea.ts`
- **3D Models**: `/lib/supabase/product3DModel.ts`

### API Routes
- **Chat API**: `/app/api/ai-chat/route.ts`
- **Front View**: `/app/api/product-pack-generation/generate-front-view/route.ts`
- **Additional Views**: `/app/api/product-pack-generation/generate-additional-views/route.ts`
- **Tech Pack**: `/app/api/product-pack-generation/generate-techpack-images/route.ts`
- **3D Models**: `/app/api/product-3d-models/route.ts`

---

## Critical Type Signatures

### MultiViewRevision
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

### ChatMessage
\`\`\`typescript
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

### ViewImages
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

### Product3DModel
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

---

## Core Workflows

### 1. Generate Initial Images
\`\`\`typescript
// Triggered by user approval in ChatInterface
const result = await generateInitialImages(
  prompt: string,
  onProgress?: (view: ViewType, imageUrl: string) => void
);

// Updates EditorStore.currentViews
// Creates first MultiViewRevision
\`\`\`

### 2. Edit Existing Images
\`\`\`typescript
// User edits prompt in EditPrompt
const result = await onEditViews(
  currentViews: ViewImages,
  editPrompt: string
);

// Creates new MultiViewRevision
// EditorStore.addRevision() saves it
// RevisionHistory displays new entry
\`\`\`

### 3. Chat-Based Design
\`\`\`typescript
// User sends message in ChatInterface
useChatMessages.sendMessage(content)
  ↓
POST /api/ai-chat
  ↓
useAIIntent.detect() classifies intent
  ↓
If design_edit: trigger image generation
If question: display response only
\`\`\`

### 4. Revision Rollback
\`\`\`typescript
// User clicks rollback in RevisionHistory
onRollback(revision)
  ↓
EditorStore.setCurrentViews(revision.views)
  ↓
ViewsDisplay re-renders with old images
\`\`\`

---

## Key Data Flows

### Store Updates
\`\`\`
User Action
  ↓
Hook (useChatMessages, useRevisionHistory, etc.)
  ↓
EditorStore.setState() / ChatStore.setState() / AnnotationStore.setState()
  ↓
All subscribed components auto-re-render
  ↓
UI reflects new state immediately
\`\`\`

### API Calls
\`\`\`
Component calls Hook
  ↓
Hook makes API call to /api/*
  ↓
Server action or API route processes
  ↓
Response returned to Hook
  ↓
Hook updates Zustand Store
  ↓
Components re-render via store subscription
\`\`\`

---

## Important Config Files

### Zustand Store Initialization
**File**: `/modules/ai-designer/store/editorStore.ts`
- Default zoom: from EDITOR_DEFAULTS
- Default viewport: from EDITOR_DEFAULTS
- Initial state: empty views, no revisions

### API Configuration
**Chat API** (`/api/ai-chat`):
- OpenAI API Key: `NEXT_PUBLIC_OPENAI_API_KEY`
- Model: GPT-4o (for vision)
- Temperature: 0.7 (configurable)
- Max tokens: 300 (configurable)

**Product 3D Models API** (`/api/product-3d-models`):
- Supabase client: Initialized server-side
- Tables: `product_3d_models`, `product_ideas`
- Storage: `fileuploads/` bucket

---

## Common Component Props

### MultiViewEditor Props
\`\`\`typescript
{
  isOpen: boolean
  onClose: () => void
  productId: string
  productName?: string
  productDescription?: string
  currentViews: ViewImages
  revisions: MultiViewRevision[]
  isInitialGeneration?: boolean
  initialPrompt?: string
  chatSessionId?: string | null
  onRevisionsChange?: (revisions: MultiViewRevision[]) => void
  onGenerateTechPack?: (selectedRevision?: MultiViewRevision) => Promise<void>
  onGenerateInitialImages?: (prompt, onProgress?) => Promise<{success, views?, error?}>
  onEditViews: (currentViews, editPrompt) => Promise<{success, views?, error?}>
  onProgressiveEdit?: (...) => Promise<{success, views?, error?}>
  onSave?: (views: ViewImages) => void
  onRollback?: (revision: MultiViewRevision) => void
  onDeleteRevision?: (revisionId: string, batchId?: string) => Promise<boolean>
  setShowIndicatorModal?: any
  setShowTutorialModal?: any
}
\`\`\`

### ChatInterface Props
\`\`\`typescript
{
  // Uses EditorStore internally
  // No direct props needed
}
\`\`\`

---

## Database Schema Reference

### Product Ideas Table
\`\`\`sql
CREATE TABLE product_ideas (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  image_data JSONB,  -- { front, back, side, top, bottom }
  tech_pack JSONB,
  -- ... other columns
)
\`\`\`

### Product 3D Models Table
\`\`\`sql
CREATE TABLE product_3d_models (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT ('product' | 'collection'),
  source_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  status TEXT ('PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'),
  progress INTEGER,
  model_urls JSONB,  -- { glb, fbx, usdz, obj, mtl }
  input_images JSONB,  -- { front, back, side, top, bottom }
  version INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(task_id)
)
\`\`\`

### AI Chat Messages Table (Planned)
\`\`\`sql
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY,
  product_idea_id UUID NOT NULL,
  user_id UUID NOT NULL,
  revision_id UUID,  -- NULLABLE
  batch_id TEXT,  -- Groups messages from same session
  message_type TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
\`\`\`

---

## Module Export Structure

**File**: `/modules/ai-designer/index.ts`

\`\`\`typescript
export * from './types'           // All type definitions
export * from './hooks'           // All custom hooks
export * from './components'      // All components
export * from './services'        // All services
export * from './utils'           // All utilities
export * from './constants'       // All constants
export * from './store'           // All Zustand stores
\`\`\`

---

## Development Commands

\`\`\`bash
# Start development
npm run dev

# Type checking
npx tsc --noEmit

# Lint
npm run lint

# Test
npm run test

# Build
npm run build
\`\`\`

---

## Integration Checklist

When integrating AI Designer:

- [ ] Import MultiViewEditor from `@/modules/ai-designer`
- [ ] Pass required props (productId, currentViews, revisions)
- [ ] Connect callback handlers (onEditViews, onGenerateInitialImages, etc.)
- [ ] Set up Zustand store access in parent component
- [ ] Handle loading states with GenerationProgressIndicator
- [ ] Wire up API routes for image generation
- [ ] Configure OpenAI API key in .env
- [ ] Set up Supabase connection
- [ ] Test chat functionality with vision
- [ ] Test revision history and rollback

---

## Important Notes

### Services Layer
The `services/` directory exists but most functions are TODO:
- `imageGeneration.ts` - Returns "Not implemented"
- `revisionManager.ts` - Returns "Not implemented"

**Current Status**: Business logic is embedded in components and hooks. Should be refactored into services layer.

### Chat Messages Database
`ai_chat_messages` table is defined in types but not yet fully integrated. The chat history is currently stored in `ChatStore` (memory).

### Unfinished Features
- Full services layer implementation
- Persistent chat history to database
- Message editing/deletion
- Advanced annotation tools
- Undo/redo beyond revision history

---

## Debugging Tips

### Enable Dev Logging
\`\`\`typescript
import { devLog, devLogOnce } from '@/modules/ai-designer/utils/devLogger'

devLog('message', data)  // Logs in development only
devLogOnce('key', data)  // Logs once per key
\`\`\`

### Check Store State
\`\`\`typescript
// In component
const state = useEditorStore((state) => state)
console.log(state)  // See entire editor state
\`\`\`

### API Request Debugging
\`\`\`typescript
// Add to /api/* routes
console.error('Request received:', req.json())
console.log('Response:', result)
\`\`\`

---

## Performance Considerations

1. **Image Loading**: Uses next/image for optimization
2. **3D Viewer**: Dynamically imported to reduce bundle
3. **Zustand Stores**: Selector-based subscriptions minimize re-renders
4. **Message Rendering**: Markdown is memoized
5. **Viewport**: Pan/zoom don't cause full re-renders

---

## Security Notes

- API keys stored in environment variables
- User authentication via Supabase
- Image URLs validated before processing
- No sensitive data logged in production
- Input sanitization for chat messages
