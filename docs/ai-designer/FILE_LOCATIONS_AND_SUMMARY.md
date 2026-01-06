# Design Edit and Regeneration Workflow - File Locations and Implementation Summary

## KEY FILES AND LOCATIONS

### USER INTERFACE COMPONENTS

#### Chat Interface
- **File**: `/modules/ai-designer/components/ChatInterface/ImageToolDialog.tsx`
- **Purpose**: Dialog for selecting image tool type (Logo, Sketch, Reference)
- **Exports**: `ImageToolDialog`, `enhancePromptWithTool`, `ImageToolSelection`
- **Key Functions**:
  - Tool selection UI with 3 types
  - Logo position selector (10 positions)
  - Optional notes textarea
  - Prompt enhancement for AI

#### Chat Panel
- **File**: `/components/ai-image-editor/ai-chat-panel.tsx`
- **Purpose**: Main chat interface for conversational editing
- **Key Features**:
  - Message display and sending
  - Image viewer with zoom/rotate
  - Message type handling
  - Auto-scroll to latest messages

#### Multi-View Editor (CORE COMPONENT)
- **File**: `/components/ai-image-editor/multiview-editor.tsx`
- **Purpose**: Main editor orchestrating all editing capabilities
- **Line 862**: `detectMessageIntent()` function
- **Line 1040**: `handleConversationalResponse()` function
- **Line 1379**: Intent-based routing (design_edit vs others)
- **Line 1916**: `onEditViews()` execution for non-progressive edits
- **Key Responsibilities**:
  - Intent detection
  - Edit request processing
  - View regeneration management
  - Revision creation
  - Chat message handling

### VISUAL ANNOTATION SYSTEM

#### Micro Edits Hook
- **File**: `/modules/ai-designer/hooks/useAIMicroEdits.tsx`
- **Purpose**: Annotation-based visual editing
- **Key Functions**:
  - `handleAddAnnotationPoint()` - Place annotation on image
  - `handleSaveAnnotation()` - Save annotation text
  - `handleApplyEdits()` - Capture screenshot and send to AI
  - `generateAnnotationAnalysisPrompt()` - Build AI prompt from annotations
- **Line 277**: Screenshot capture using html2canvas
- **Line 310**: Edit prompt generation

### TYPE DEFINITIONS

#### Chat Types
- **File**: `/modules/ai-designer/types/chat.types.ts`
- **Exports**:
  - `ChatMessageType`: "user", "ai", "system", "success", "error", etc.
  - `MessageIntent`: "design_edit", "question", "feedback", "general_chat", "technical_info", "greeting"
  - `AIChatMessageDB`: Database schema interface
  - `ChatMessage`: Frontend chat message interface
  - `SaveChatMessageParams`: Parameters for saving messages

#### Editor Types
- **File**: `/modules/ai-designer/types/editor.types.ts`
- **Related**:
  - `ViewType`: "front" | "back" | "side" | "top" | "bottom"
  - `MultiViewRevision`: Revision structure
  - `ImageData`: Image information with URL and metadata

### SERVER ACTIONS (Backend)

#### Chat Message Management
- **File**: `/app/actions/ai-chat-messages.ts`
- **Key Functions**:
  - `saveChatMessage()` - Save single message to database
  - `saveChatMessagesBatch()` - Save multiple messages
  - `getChatMessages()` - Retrieve product messages
  - `getChatMessagesByBatch()` - Get messages from specific session
  - `deleteChatMessages()` - Clean up messages

#### Image Edit Actions
- **File**: `/app/actions/ai-image-edit.ts`
- **Key Functions**:
  - `applyAIImageEdit()` - Apply edit to specific view (line 25)
  - `getProductImageRevisions()` - Fetch revision history
  - `setActiveRevision()` - Make revision current
  - `saveInitialRevisions()` - Create first revision from initial images

#### Revision Generation Service
- **File**: `/lib/services/revision-generation-service.ts`
- **Purpose**: Handles selective view regeneration
- **Key Function**: `createRevision()`
- **Features**:
  - `viewsToRegenerate`: Specify which views to update
  - `preserveViews`: Which views to keep unchanged
  - Maintains consistency across views
  - Tracks changes in revision metadata

### DATA PERSISTENCE

#### Database Schema Migrations
- **Chat Messages Table**: `/supabase/migrations/20250113_create_ai_chat_messages.sql`
  - product_idea_id
  - user_id
  - revision_id (nullable)
  - batch_id (for grouping edits)
  - message_type
  - content
  - metadata (JSONB for flexible storage)

- **Revision Tables**:
  - `/supabase/migrations/create_product_image_revisions.sql`
  - `/supabase/migrations/create_product_multiview_revisions.sql`
  - Stores revision history with all view URLs

### DOCUMENTATION

#### Complete System Documentation
- **File**: `/docs/ai-image-editor-system.md`
- **Covers**:
  - System architecture
  - All features overview
  - User workflows
  - API reference
  - Troubleshooting guide

#### Feature Documentation
- **File**: `/FEATURE_IMAGE_TOOLS.md`
- **Covers**:
  - Image tool types (Logo, Sketch, Reference)
  - User flow with examples
  - Technical implementation details
  - Testing checklist

#### Editor System Documentation
- **File**: `/modules/ai-designer/LOOP_AND_REVISION_FIXES.md`
- **Purpose**: Technical notes on revision system fixes and improvements

---

## COMPLETE EDIT WORKFLOW SUMMARY

### 1. REQUEST PHASE

**Entry Points**:
- Chat message in `AIChatPanel` → `onSendMessage` callback
- Visual annotations in `useAIMicroEdits` → `Apply` button
- File upload via `ImageToolDialog` → Tool selection → Enhanced prompt

**Processing**:
- `multiview-editor.tsx` receives message via callback
- Message content analyzed for intent
- `detectMessageIntent()` called (line 862)

### 2. INTENT DETECTION PHASE

**Location**: `multiview-editor.tsx` lines 862-959

**Process**:
1. Build detection prompt with last 5 messages + product context
2. Call OpenAI API for classification (temperature: 0.3)
3. Parse response for valid intent
4. Fallback to keyword detection if API fails

**Intent Types**:
- `design_edit` → Continue to edit flow
- `question`, `feedback`, `general_chat` → Conversation response
- `greeting` → Friendly response
- `technical_info` → Technical advice

### 3. EDIT REQUEST PROCESSING PHASE

**Location**: `multiview-editor.tsx` lines 1379-1507

**Key Steps**:

1. **Check Message Type**:
   - Affirmative response ("ok", "yes") → Find last AI suggestion
   - Micro-edit from annotations → Skip context, use directly
   - Regular message → Build full context

2. **Build Edit Prompt**:
   - Extract screenshot (if exists)
   - Load chat session context (last 5 messages)
   - Add product context (type, original prompt)
   - Handle affirmative responses by extracting AI suggestion

3. **Context Building**:
   \`\`\`
   For non-micro-edits:
   - getChatSessionByProductId() retrieves session
   - Gets last 5 messages for context
   - Builds conversation summary string
   - Appends to edit prompt
   
   For micro-edits:
   - Skip ALL context checking
   - Use message as-is
   \`\`\`

4. **Credit Check**:
   - Verify user has sufficient credits (3 per all-views edit, 1 per single view)
   - If insufficient: Show error, don't execute

5. **View Regeneration**:
   - Check if `onProgressiveEdit` available
   - If yes: Call with progress callback (Front → Back → Side)
   - If no: Call `onEditViews` (all views at once)

### 4. VIEW REGENERATION PHASE

**Location**: Various handler functions in `multiview-editor.tsx` (lines 1800+)

**Progressive Edit Flow**:
\`\`\`
Call onProgressiveEdit(currentViews, prompt, onProgress)
  ↓
Receives callback for each view completion:
  - onProgress("front", imageUrl)
  - onProgress("back", imageUrl)
  - onProgress("side", imageUrl)
  ↓
Updates immediately displayed in UI
\`\`\`

**Standard Edit Flow**:
\`\`\`
Call onEditViews(currentViews, prompt)
  ↓
Wait for all views to generate
  ↓
Update all views at once in UI
\`\`\`

**Revision Service** (`revision-generation-service.ts`):
- Takes RevisionRequest with:
  - `viewsToRegenerate`: which views to update
  - `preserveViews`: which views to keep
  - `userPrompt`: edit instruction
  - `referenceImage`: optional reference for consistency
- Returns RevisionResult with all generated images

### 5. REVISION CREATION PHASE

**Location**: `multiview-editor.tsx` lines 1916-1996

**Timeline**:
\`\`\`
T0: Edit completes successfully
T0+20ms: Create revision object
  - id: `rev-${Date.now()}` or `original-${productId}`
  - revisionNumber: incremented
  - views: { front, back, side } from result
  - editPrompt: the prompt used
  - editType: "ai_edit" or "initial"
  - isActive: true
  - createdAt: ISO timestamp

T0+30ms: Deactivate previous revisions
  - Map existing revisions with isActive: false

T0+40ms: Update UI state
  - setRevisions([...prev, newRevision])
  - setPendingRevision(newRevision)
  - setIsEditing(true)

T0+50ms: Add success message to chat
  - Type: "success"
  - Content: "Successfully applied '${prompt}'!"

T0+1000ms: Add revision summary
  - Type: "system"
  - Metadata: summary data with credits used

T0+3000ms: Clear edit state
  - setIsEditing(false)
  - setPendingRevision(null)
\`\`\`

### 6. PERSISTENCE PHASE

**Chat Message Persistence** (`ai-chat-messages.ts`):
\`\`\`
saveChatMessage({
  productIdeaId: string;
  messageType: ChatMessageType;
  content: string;
  metadata?: any;
  revisionId?: string;    // Links to revision
  batchId?: string;       // Groups session edits
})
\`\`\`

**Batch ID System**:
- Generated once per editing session
- All messages in session use same batch_id
- Allows grouping related edits together
- Format: `batch-${Date.now()}-${random}`

**Database Storage**:
- Messages saved to `ai_chat_messages` table
- Revisions saved to `product_multiview_revisions` table
- Images stored in Supabase CDN
- Full audit trail maintained

---

## SPECIAL FEATURES

### Image Tool Dialog Enhancement

**Location**: `/modules/ai-designer/components/ChatInterface/ImageToolDialog.tsx`

**Prompt Enhancement Function** (line 326):
\`\`\`typescript
function enhancePromptWithTool(
  originalPrompt: string,
  toolSelection: ImageToolSelection
): string
\`\`\`

**Logo Enhancement** (lines 339-446):
- Powerful logo placement instructions
- 10 position options with detailed placement descriptions
- Preservation of colors and proportions
- Professional sizing guidance

**Sketch Enhancement** (lines 448-496):
- Sketch-to-design conversion instructions
- Professional recreation guidance
- Composition preservation
- Production-ready output emphasis

**Reference Enhancement** (lines 498-541):
- DO NOT copy instruction
- Style and aesthetic extraction
- Original design creation
- Color palette and mood guidance

### Visual Annotation System

**Location**: `/modules/ai-designer/hooks/useAIMicroEdits.tsx`

**Annotation Flow**:
1. Click on image → Create annotation point with coordinates
2. Type label describing the change
3. Save annotation → Show on overlay
4. Can add multiple annotations across views
5. Click "Apply" → Capture screenshot with all annotations
6. Screenshot uploaded to Supabase
7. Analysis prompt generated from annotation details
8. Sent to chat for AI analysis

**Screenshot Capture** (line 277):
- Uses `html2canvas` library
- Captures all 3 views with annotations
- Includes red dots, connecting lines, and labels
- Compressed to base64 for transmission

**Analysis Prompt** (line 289):
- Structured format with annotation details
- Analysis requirements listed
- Asks for recommendations for each point
- Professional formatting for AI understanding

### Affirmative Response Handling

**Location**: `multiview-editor.tsx` lines 1431-1495

**Pattern**:
User types short response after AI suggestion:
\`\`\`
User: "ok"
AI extracts last suggestion from conversation
Creates new prompt: "The user agreed to: [previous suggestion]"
Executes as design_edit with extracted suggestion
\`\`\`

**Affirmative Patterns**:
- "ok", "okay", "yes", "yeah", "yep"
- "sure", "go ahead", "do it", "proceed"
- "implement", "apply", "let's do it"
- "sounds good", "make those changes"

---

## INTEGRATION POINTS

### External APIs

**OpenAI API** (Intent Detection):
- Endpoint: `/api/ai-chat`
- Model: gpt-4 or gpt-4-turbo-preview
- Temperature: 0.3 (for consistent classification)
- Max tokens: 20 (for intent classification)

**Image Generation**:
- Called via `onProgressiveEdit` or `onEditViews` callbacks
- Passes edit prompt and current images
- Returns new generated images

### Data Flow

\`\`\`
User Input
    ↓
Intent Detection (OpenAI)
    ↓
Edit Request Processing
    ↓
Context Building (Session + Product)
    ↓
Image Generation (via callback)
    ↓
Revision Creation
    ↓
Chat Message Persistence
    ↓
UI Update & User Feedback
\`\`\`

---

## TESTING CHECKLIST

### Intent Detection
- [ ] "change color to red" → design_edit
- [ ] "what size is it?" → question
- [ ] "ok" after AI suggestion → design_edit
- [ ] "hi!" → greeting
- [ ] Network failure fallback works

### Edit Request Processing
- [ ] Chat message triggers edit correctly
- [ ] Visual annotation sends screenshot
- [ ] Image tool dialog enhances prompt
- [ ] Affirmative responses extract suggestion
- [ ] Credit check prevents execution when insufficient

### View Regeneration
- [ ] Progressive edit shows views as generated
- [ ] Standard edit waits for all views
- [ ] Loading states show correctly
- [ ] Error handling works with fallbacks

### Revision Management
- [ ] New revisions created successfully
- [ ] Previous revisions deactivated
- [ ] Revision numbers increment correctly
- [ ] Database persistence works
- [ ] Can rollback to previous revisions

### Chat Persistence
- [ ] Messages saved to database
- [ ] Batch ID groups edits correctly
- [ ] Revision ID links messages to revisions
- [ ] Metadata preserved
- [ ] Can retrieve conversation history

---

## PERFORMANCE CONSIDERATIONS

### Optimization Opportunities
1. **Intent Detection Caching**: Cache intent for similar messages
2. **Screenshot Compression**: Pre-compress images before sending
3. **Lazy Loading**: Load revision history on demand
4. **Pagination**: Limit chat messages loaded (current: 250)
5. **Progressive Generation**: Sequential view generation for faster feedback

### Bottlenecks
1. OpenAI API calls for intent detection (0.5-2 seconds)
2. Image generation per view (varies by API)
3. Screenshot capture with html2canvas (0.5-1 second)
4. Database operations for message persistence

### Memory Management
- Clear annotations after screenshot capture
- Limit message history to 250 messages
- Clean up pending revisions after timeout
- Proper event listener cleanup in useEffect

---

## TROUBLESHOOTING GUIDE

### Intent Detection Failures
- Check OpenAI API key and quota
- Verify API response format
- Fallback to keyword detection works

### Screenshot Capture Issues
- Ensure html2canvas is imported correctly
- Check for CORS issues with image elements
- Verify canvas initialization on time

### Edit Execution Failures
- Check credit balance before attempt
- Verify image generation API working
- Check for timeout issues (set to 30s)
- Review error message for details

### Revision Persistence Issues
- Verify Supabase connection
- Check database schema exists
- Ensure user authentication works
- Review database permissions

---

**This summary provides complete understanding of the edit and regeneration workflow, with file locations for reference and implementation details for development.**
