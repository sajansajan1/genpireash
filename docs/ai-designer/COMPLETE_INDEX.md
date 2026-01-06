# Design Edit and Regeneration Workflow - Complete Reference Index

## DOCUMENTS CREATED

This comprehensive exploration has created 3 detailed documents:

### 1. **edit_workflow_summary.md** - COMPLETE FLOW GUIDE
- Overview of entire edit workflow
- 11 major sections covering every aspect
- Specific code examples from actual implementation
- Two complete real-world examples with step-by-step execution
- Special handling for edge cases
- Database persistence details
- Error handling and fallbacks

### 2. **edit_workflow_diagrams.md** - VISUAL ARCHITECTURE
- 7 detailed ASCII diagrams showing:
  - High-level system architecture (5-layer)
  - Intent detection flowchart
  - Edit request processing pipeline
  - Visual annotation complete flow
  - Revision creation timeline
  - Image tool dialog sequence
  - Message routing decision tree
- Each diagram shows decision points and state transitions

### 3. **FILE_LOCATIONS_AND_SUMMARY.md** - IMPLEMENTATION REFERENCE
- All file locations with line numbers
- Complete implementation summary
- 6 phases of edit workflow explained
- Special features documentation
- Integration points
- Testing checklist
- Performance considerations
- Troubleshooting guide

---

## QUICK REFERENCE: EDIT WORKFLOW PHASES

### PHASE 1: USER REQUEST
User initiates edit through one of three methods:
- **Chat Message**: Type directly in chat interface
- **Visual Annotation**: Click on images to mark changes
- **Image Tools**: Upload file with tool type (Logo/Sketch/Reference)

### PHASE 2: INTENT DETECTION
System analyzes user intent to route request:
- **design_edit** → Execute edit
- **question/feedback** → Respond conversationally  
- **greeting** → Friendly acknowledgment
- **technical_info** → Technical advice

### PHASE 3: EDIT REQUEST PROCESSING
Build comprehensive edit prompt with context:
- Extract screenshot (if available)
- Load chat session history (last 5 messages)
- Add product context
- Handle affirmative responses (extract AI suggestion)
- Check credit balance

### PHASE 4: VIEW REGENERATION
Generate new images based on edit prompt:
- **Progressive**: Front → Back → Side (with live updates)
- **Standard**: All views together (batch update)
- Can preserve specific views while editing others

### PHASE 5: REVISION CREATION
Automatically track design versions:
- Create revision object with metadata
- Deactivate previous revisions
- Store edit prompt for reference
- Create audit trail

### PHASE 6: PERSISTENCE
Save conversation and design history:
- Chat messages saved to database
- Batch ID groups related edits
- Revision linked to messages
- Full context preserved for future edits

---

## KEY COMPONENTS BY RESPONSIBILITY

### REQUEST HANDLING (User Input)
- `AIChatPanel` → Chat message input
- `ImageToolDialog` → Structured image upload
- `useAIMicroEdits` → Visual annotation system

### PROCESSING (Intent & Context)
- `detectMessageIntent()` → AI-powered classification
- `handleAIEditWithPrompt()` → Edit execution orchestration
- Context building from session history

### EXECUTION (Generation & Updates)
- `onProgressiveEdit()` → Live view-by-view updates
- `onEditViews()` → Batch view generation
- `createRevision()` → Selective view regeneration

### PERSISTENCE (Data Storage)
- `saveChatMessage()` → Message database storage
- Chat messages table → Conversation history
- Revisions table → Design version history

### FEEDBACK (User Communication)
- Success messages → Confirmation of edits
- Revision summaries → Summary of changes
- Chat messages → Contextual feedback

---

## INTENT TYPES AND THEIR ROUTING

\`\`\`
MESSAGE INTENT          HANDLER FUNCTION           ACTION
─────────────────────────────────────────────────────────────────
design_edit             handleAIEditWithPrompt()   Execute image edit
question                handleConversational...    Ask AI for answer
feedback                handleConversational...    Provide feedback
general_chat            handleConversational...    Chat normally
technical_info          handleConversational...    Technical advice
greeting                handleConversational...    Respond warmly
\`\`\`

---

## CRITICAL DECISION POINTS

### Decision 1: Is message an edit request?
- YES → Use edit flow
- NO → Use conversation flow

### Decision 2: Is it an affirmative response?
- YES → Extract last AI suggestion as edit prompt
- NO → Use message directly as prompt

### Decision 3: Is it from visual annotations?
- YES → Skip context building, use message as-is
- NO → Build full context from session

### Decision 4: Can we use progressive edit?
- YES → Show views as they complete
- NO → Show loading, update all at once

### Decision 5: Is credit balance sufficient?
- YES → Execute image generation
- NO → Show error, don't execute

---

## FILE LOCATIONS CHEAT SHEET

\`\`\`
COMPONENT LAYER:
  Chat UI                    → /components/ai-image-editor/ai-chat-panel.tsx
  Main Editor               → /components/ai-image-editor/multiview-editor.tsx
  Image Tool Dialog         → /modules/ai-designer/components/ChatInterface/ImageToolDialog.tsx
  Visual Annotations        → /modules/ai-designer/hooks/useAIMicroEdits.tsx

TYPES:
  Chat Types               → /modules/ai-designer/types/chat.types.ts
  Editor Types             → /modules/ai-designer/types/editor.types.ts

SERVER ACTIONS:
  Chat Messages            → /app/actions/ai-chat-messages.ts
  Image Edits              → /app/actions/ai-image-edit.ts
  Revision Service         → /lib/services/revision-generation-service.ts

DATABASE:
  Chat Messages Migration  → /supabase/migrations/20250113_create_ai_chat_messages.sql
  Revisions Migration      → /supabase/migrations/create_product_multiview_revisions.sql

DOCUMENTATION:
  Complete Guide           → /docs/ai-image-editor-system.md
  Feature Guide            → /FEATURE_IMAGE_TOOLS.md
  Technical Notes          → /modules/ai-designer/LOOP_AND_REVISION_FIXES.md
\`\`\`

---

## CODE NAVIGATION GUIDE

### To Understand Intent Detection:
1. Read: `multiview-editor.tsx` line 862
2. Look at: `detectMessageIntent()` function (lines 862-959)
3. See fallback: `fallbackIntentDetection()` (lines 962-1037)

### To Understand Edit Processing:
1. Read: `multiview-editor.tsx` line 1379
2. Key function: Lines 1379-1507 (intent routing and edit preparation)
3. Execution: Lines 1916-1996 (result handling and revision creation)

### To Understand Visual Annotations:
1. Main hook: `useAIMicroEdits.tsx`
2. Screenshot capture: Line 277
3. Analysis prompt: Line 289
4. Apply flow: Lines 244-338

### To Understand Image Tool:
1. Dialog component: `ImageToolDialog.tsx`
2. Tool options: Lines 49-92
3. Prompt enhancement: Lines 326-548
4. Examples: Line 339 (logo), 448 (sketch), 498 (reference)

### To Understand Revision Creation:
1. System flow: `revision-generation-service.ts`
2. Timeline in editor: Lines 1916-1996
3. Database persistence: `ai-chat-messages.ts`
4. Types: `chat.types.ts`

---

## COMMON WORKFLOWS

### User Workflow 1: Text Edit
\`\`\`
User: "Make the logo bigger"
     ↓
detectMessageIntent() → design_edit
     ↓
handleAIEditWithPrompt()
     ↓
onProgressiveEdit(views, "Make the logo bigger")
     ↓
Images regenerated
     ↓
Revision created and saved
\`\`\`

### User Workflow 2: Visual Edit
\`\`\`
User clicks "Visual Edit"
     ↓
User clicks on image + types "Make bigger"
     ↓
User clicks "Apply"
     ↓
captureAnnotatedScreenshot()
     ↓
generateAnnotationAnalysisPrompt()
     ↓
Message sent to chat with screenshot
     ↓
User types "Ok, make those changes"
     ↓
Intent detected as design_edit
     ↓
Edit executed with annotated screenshot context
\`\`\`

### User Workflow 3: Image Tool Upload
\`\`\`
User clicks "Tools" button
     ↓
ImageToolDialog opens
     ↓
User selects "Logo" tool
     ↓
User selects "Front Center" position
     ↓
User clicks "Upload"
     ↓
enhancePromptWithTool() builds powerful prompt
     ↓
Message sent with enhanced context
     ↓
AI generates with logo placement instructions
\`\`\`

### Developer Workflow: Fix Intent Detection
\`\`\`
Problem: "ok" not triggering edit
Solution: Check lines 1431-1495 in multiview-editor.tsx
- Verify affirmativePatterns array
- Check fallback keyword detection
- Test with console.log in detectMessageIntent()
- Review last AI message check
\`\`\`

---

## PERFORMANCE TIPS

### For Frontend:
- Progressive edit provides better UX (live updates)
- Screenshot compression before sending saves bandwidth
- Batch messages for multiple edits
- Lazy load revision history

### For Backend:
- Cache intent classifications for repeated patterns
- Use queue for image generation requests
- Batch database inserts for messages
- Index batch_id for faster retrieval

### For Database:
- Add indexes on (product_idea_id, batch_id)
- Partition messages by creation date
- Archive old batch data
- Monitor message growth (current limit: 250)

---

## DEBUGGING CHECKLIST

### If intent detection fails:
1. Check OpenAI API key in console
2. Look at detectMessageIntent() response
3. Verify fallback keyword detection working
4. Check browser console for errors

### If edit doesn't execute:
1. Verify credit balance (need 3 credits)
2. Check if onProgressiveEdit or onEditViews callback exists
3. Look for error in catch block (lines 2045+)
4. Review network tab for failed requests

### If revision not created:
1. Check saveChatMessage() response
2. Verify database connection
3. Look at revision object creation (line 1926)
4. Check isActive flag in database

### If screenshot capture fails:
1. Verify html2canvas import
2. Check container refs (frontCanvasRef, etc.)
3. Look for CORS errors in console
4. Review canvas initialization timing

---

## TESTING SCENARIOS

### Scenario 1: Simple Edit
\`\`\`
1. Type "change color to blue"
2. System detects design_edit ✓
3. Views regenerate ✓
4. Revision created ✓
5. Messages saved ✓
\`\`\`

### Scenario 2: Affirmative Response
\`\`\`
1. Type "what if we added more details?"
2. AI responds with suggestion
3. User types "ok"
4. System detects design_edit from "ok" ✓
5. Uses AI suggestion as prompt ✓
6. Edits execute ✓
\`\`\`

### Scenario 3: Visual Annotation
\`\`\`
1. Enable visual edit mode ✓
2. Click on image multiple times ✓
3. Add labels to annotations ✓
4. Click Apply → Screenshot captures ✓
5. Analysis prompt generated ✓
6. Sent to chat ✓
\`\`\`

### Scenario 4: Image Tool
\`\`\`
1. Click upload → Dialog appears ✓
2. Select "Logo" → Position selector shows ✓
3. Add optional notes ✓
4. Confirm → Prompt enhanced ✓
5. Edit executed with logo instructions ✓
\`\`\`

---

## EXTENSIBILITY POINTS

### Add New Intent Type:
1. Add to `MessageIntent` in `chat.types.ts`
2. Update `detectMessageIntent()` rules (line 893)
3. Add handler function in `multiview-editor.tsx`
4. Add route in switch statement (line 1379)

### Add New Image Tool:
1. Add to `ImageToolType` in `ImageToolDialog.tsx`
2. Add to `TOOL_OPTIONS` array
3. Create enhancement function
4. Add to switch in `enhancePromptWithTool()`

### Add New View Type:
1. Add to `ViewType` in `editor.types.ts`
2. Update revision structure
3. Add to view selector in UI
4. Update regeneration logic

### Add New Chat Message Type:
1. Add to `ChatMessageType` in `chat.types.ts`
2. Add styling in `getMessageStyle()` function
3. Add icon in `getMessageIcon()` function
4. Implement display logic in component

---

## REFERENCES

### Original Documentation Files
- `/docs/ai-image-editor-system.md` - Complete system documentation
- `/FEATURE_IMAGE_TOOLS.md` - Image tools feature guide
- `/modules/ai-designer/LOOP_AND_REVISION_FIXES.md` - Technical notes

### Key Implementation Files
- `/components/ai-image-editor/multiview-editor.tsx` - Main orchestration
- `/modules/ai-designer/components/ChatInterface/ImageToolDialog.tsx` - Image tools
- `/modules/ai-designer/hooks/useAIMicroEdits.tsx` - Visual annotations
- `/app/actions/ai-chat-messages.ts` - Message persistence
- `/lib/services/revision-generation-service.ts` - Revision management

### Type Definitions
- `/modules/ai-designer/types/chat.types.ts` - Chat types
- `/modules/ai-designer/types/editor.types.ts` - Editor types

---

## SUMMARY

The design edit and regeneration workflow is a sophisticated system with:

✓ **3 User Input Methods**: Chat, Visual, Image Tools
✓ **AI-Powered Intent Detection**: Understands user intent accurately
✓ **Flexible Edit Processing**: Handles different message types differently
✓ **Progressive Feedback**: Views update as they're generated
✓ **Automatic Versioning**: All changes tracked with revisions
✓ **Conversation Context**: Uses session history for better edits
✓ **Credit System**: Manages resource usage
✓ **Persistent Storage**: Full audit trail maintained
✓ **Error Handling**: Graceful fallbacks for all failures
✓ **Extensible Architecture**: Easy to add new features

**Total Implementation**: ~2000+ lines across multiple components, with comprehensive type safety, error handling, and user feedback mechanisms.

---

**Created**: November 14, 2025
**Scope**: Very Thorough Analysis
**Status**: Complete and Ready for Reference
