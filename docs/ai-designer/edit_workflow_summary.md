# Design Edit and Regeneration Workflow - Complete Guide

## Overview
The Genpire system implements a sophisticated AI-driven design editing workflow that allows users to modify product designs through multiple interaction modes. This document provides a comprehensive analysis of how users request modifications, how these requests are processed, and how views are regenerated.

## 1. USER REQUEST METHODS

### 1.1 Chat-Based Edit Requests
Users can modify designs through conversational messages in the chat interface.

**Entry Point**: `AIChatPanel` component
**Process**:
1. User types message in chat input
2. Message is submitted via `onSendMessage` callback
3. System detects user intent before processing

### 1.2 Visual Annotation Editing
Users can click directly on product images to annotate specific areas for editing.

**Entry Point**: `useAIMicroEdits` hook in multiview-editor
**Process**:
1. User enables Visual Edit Mode
2. Clicks on image to add annotation point
3. Types description of desired change
4. Saves annotation
5. Can add multiple annotations across views
6. Clicks "Apply" to generate screenshot and send to AI

**Annotation Flow**:
\`\`\`
User Enable Visual Mode
    ↓
Click on Image → Create Annotation Point
    ↓
Type Label → Save Annotation
    ↓
Add More Annotations (Optional)
    ↓
Click Apply Edits → Capture Screenshot
    ↓
Generate Analysis Prompt from Annotations
    ↓
Send to Chat with Screenshot
\`\`\`

### 1.3 Image Tool-Based Editing
Users can upload reference images with specific tool types to guide the edit.

**Tool Types** (via `ImageToolDialog`):
- **Logo**: Brand logo to apply on design
- **Sketch**: Hand-drawn sketch or concept art
- **Reference Image**: Style/color inspiration

**Flow**:
\`\`\`
User Click Upload
    ↓
File Selected → ImageToolDialog Opens
    ↓
User Selects Tool Type (Logo/Sketch/Reference)
    ↓
User Optionally Adds Notes
    ↓
System Enhances Prompt with Tool Context
    ↓
Prompt Sent to AI Generation
\`\`\`

## 2. INTENT DETECTION SYSTEM

### 2.1 Intent Classification
When user sends a message, system analyzes intent to determine if it's an edit request or conversational query.

**Intent Types** (from `chat.types.ts`):
\`\`\`typescript
type MessageIntent =
  | "design_edit"      // User wants to modify the product
  | "question"         // User asking information
  | "technical_info"   // Technical specifications query
  | "feedback"         // Opinion/evaluation
  | "general_chat"     // General conversation
  | "greeting"         // Social greeting
\`\`\`

### 2.2 Intent Detection Process

**Primary Detection** (`detectMessageIntent` in multiview-editor):
1. Gets last 5 messages for context
2. Calls OpenAI API with classification prompt
3. Returns one of 6 intent categories
4. Falls back to keyword detection if API fails

**Key Rules for Design Edit Detection**:
- Affirmative responses ("ok", "yes", "go ahead", etc.) after AI suggestions → `design_edit`
- Action words ("change", "make", "add", "remove", "modify") → `design_edit`
- Agreement to implement previous suggestions → `design_edit`
- Specific questions asking for changes → `design_edit`

**Fallback Detection** (`fallbackIntentDetection`):
If API call fails, uses keyword matching:
\`\`\`typescript
const designKeywords = ["change", "make", "add", "remove", "modify", "update", "color", "size", "style"];
if (designKeywords.some(keyword => lowerMessage.includes(keyword))) {
  return "design_edit";
}
\`\`\`

### 2.3 Intent-Based Routing

\`\`\`
Message Submitted
    ↓
Detect Intent
    ↓
IF design_edit:
    → handleAIEditWithPrompt()
ELSE:
    → handleConversationalResponse()
\`\`\`

## 3. EDIT REQUEST PROCESSING

### 3.1 Design Edit Flow (`handleAIEditWithPrompt`)

When intent is detected as `design_edit`:

\`\`\`
1. Extract Screenshot (Optional)
   - Captures current product views
   - Compresses for context

2. Build Edit Prompt
   - Include screenshot context
   - Load chat session context
   - Include product context
   
3. Add Conversational Context
   - Get last 5 chat messages
   - Build conversation summary
   
4. Handle Affirmative Responses
   - If user said "ok/yes/etc", find previous AI suggestion
   - Extract suggestion as edit prompt
   - Create clear edit instruction from suggestion
   
5. Set Editing State
   - setEditPrompt(finalEditPrompt)
   - setSessionEdits([...prev, finalEditPrompt])
   
6. Trigger Image Generation
   - Call handleAIEditWithPrompt(finalEditPrompt)
\`\`\`

### 3.2 Screenshot Context in Edits

When screenshot is captured:
\`\`\`
1. User clicks on product image
2. HTML2Canvas captures view container
3. Screenshot compressed to base64
4. Embedded in message: `[Current Design Screenshot: data:image/...`
5. AI receives both text prompt and visual context
\`\`\`

### 3.3 Context Building for Accuracy

For non-micro-edit messages:
\`\`\`
Try to Load Chat Session Context:
  - Get session messages (last 5)
  - Build context string from messages
  - Add product type and original prompt
  - Append to edit prompt

Error Handling:
  - Silently fail if session unavailable
  - Continue with text-only prompt
\`\`\`

## 4. EDIT EXECUTION AND VIEW REGENERATION

### 4.1 Progressive vs. Standard Edit Modes

**Progressive Edit** (if `onProgressiveEdit` available):
- Regenerates views one at a time
- Shows immediate visual feedback
- Updates each view as it completes
- Front → Back → Side sequence

\`\`\`typescript
// Flow
const result = await onProgressiveEdit(currentViews, promptWithContext);

// Callback receives each view as completed:
// onProgress("front", imageUrl) → display immediately
// onProgress("back", imageUrl)  → display immediately  
// onProgress("side", imageUrl)  → display immediately
\`\`\`

**Standard Edit** (fallback):
- Regenerates all views together
- Displays loading state
- Updates all at once when complete

### 4.2 View Regeneration Service (`revision-generation-service.ts`)

\`\`\`typescript
interface RevisionRequest {
  projectId: string;
  userPrompt: string;
  viewsToRegenerate?: string[];      // Which views to update
  preserveViews?: string[];          // Which views to keep unchanged
  referenceImage?: string;           // Reference for consistency
  modifications?: string;            // What was changed
}
\`\`\`

**Key Feature**: Selective view regeneration
- Only specified views are regenerated
- Other views preserved from current state
- Maintains consistency while allowing targeted updates

### 4.3 Single View Edit (ai-image-edit.ts)

When editing individual views:
\`\`\`typescript
applyAIImageEdit({
  productId: string;
  viewType: "front" | "back" | "side";
  currentImageUrl: string;
  editPrompt: string;
  userId?: string;
})
\`\`\`

**Process**:
1. Validates user authentication
2. Passes clean edit prompt to revision service
3. Regenerates ONLY the specified view
4. Preserves other views: ["front", "back", "side"].filter(v => v !== viewType)
5. Returns edited image URL and revision ID

## 5. REVISION CREATION AND MANAGEMENT

### 5.1 When Revisions Are Created

New revision created when:
1. Edit completes successfully
2. All requested views are generated
3. New images replace current views
4. Revision number incremented

### 5.2 Revision Structure

\`\`\`typescript
interface MultiViewRevision {
  id: string;                          // Unique identifier
  revisionNumber: number;              // Sequential number
  views: {
    front?: { imageUrl: string; thumbnailUrl?: string };
    back?: { imageUrl: string; thumbnailUrl?: string };
    side?: { imageUrl: string; thumbnailUrl?: string };
  };
  editPrompt?: string;                 // The prompt used
  editType: "initial" | "ai_edit" | "manual_upload";
  createdAt: string;
  isActive: boolean;                   // Current active revision
  metadata?: any;
}
\`\`\`

### 5.3 Revision Creation Flow

\`\`\`
Edit Completes Successfully
    ↓
Create Revision Object:
  - id: `rev-${Date.now()}` or `original-${productId}`
  - revisionNumber: revisions.length
  - views: { front, back, side } from result
  - editPrompt: prompt used
  - editType: "ai_edit" or "initial"
  - createdAt: ISO timestamp
  - isActive: true
    ↓
Deactivate Previous Revisions:
  - Map existing revisions with isActive: false
    ↓
Update UI State:
  - setPendingRevision(newRevision)
  - setRevisions([...prev.map(r => ({...r, isActive: false})), newRevision])
    ↓
Call onRevisionsChange Callback:
  - Notify parent of new revision
    ↓
Clear Edit State After Delay (3 seconds):
  - setIsEditing(false)
  - setPendingRevision(null)
\`\`\`

### 5.4 Database Storage

Chat messages associated with edits:
\`\`\`typescript
saveChatMessage({
  productIdeaId: string;
  messageType: ChatMessageType;  // "ai", "user", "success", etc.
  content: string;
  metadata?: {
    intent?: MessageIntent;
    isIntentDetection?: boolean;
    view?: string;
    imageUrl?: string;
    // ... other metadata
  };
  revisionId?: string;           // Links to revision
  batchId?: string;              // Groups session edits
})
\`\`\`

## 6. IMAGE TOOL DIALOG AND PROMPT ENHANCEMENT

### 6.1 ImageToolDialog Component

**Location**: `modules/ai-designer/components/ChatInterface/ImageToolDialog.tsx`

**Tool Types**:
\`\`\`typescript
type ImageToolType = "logo" | "sketch" | "reference";

interface ImageToolSelection {
  toolType: ImageToolType;
  note?: string;                  // Optional user notes
  logoPosition?: LogoPosition;    // For logos only
}
\`\`\`

**Logo Positions** (for precision placement):
- Front: front-left, front-center, front-right
- Back: back-left, back-center, back-right
- Sides: side-left, side-right
- Other: top, bottom, custom

### 6.2 Prompt Enhancement

`enhancePromptWithTool()` function builds powerful prompts:

**Logo Enhancement**:
\`\`\`
🎯 LOGO PLACEMENT MODE ACTIVATED
CRITICAL INSTRUCTIONS: The attached image contains a brand logo that MUST be extracted
REQUIREMENTS:
1. Extract ONLY the logo from the uploaded image
2. Preserve the logo's original colors and proportions exactly
3. Apply the logo cleanly onto the product with proper contrast
4. Ensure the logo appears professional with appropriate sizing
5. If transparency is needed, handle intelligently

📍 LOGO PLACEMENT REQUIREMENT - FRONT CENTER
EXACT POSITIONING: Place the logo on the FRONT of the product, CENTERED horizontally...

[User's notes if provided]
🎨 DESIGN CONTEXT: [Original prompt]
DELIVERABLE: Product mockup with the logo professionally applied
\`\`\`

**Sketch Enhancement**:
\`\`\`
✏️ SKETCH-TO-DESIGN MODE ACTIVATED
CRITICAL INSTRUCTIONS: Analyze the sketch carefully...
REQUIREMENTS:
1. Analyze the sketch to understand design and composition
2. Recreate this sketch as polished, production-ready design
3. Maintain core concept and artistic intent
4. Enhance design quality while preserving vision
5. Apply finalized design professionally onto product
6. Ensure all elements are clear and print-ready
...
\`\`\`

**Reference Enhancement**:
\`\`\`
🖼️ REFERENCE-INSPIRED DESIGN MODE ACTIVATED
CRITICAL INSTRUCTIONS: DO NOT copy or directly apply this image
REQUIREMENTS:
1. Analyze for style, aesthetic, color palette, mood
2. Extract key visual themes and design principles
3. CREATE AN ORIGINAL DESIGN inspired by the reference
4. Apply inspired aesthetic to product in creative way
5. DO NOT directly replicate - use only as stylistic guidance
...
\`\`\`

## 7. COMPLETE EDIT FLOW EXAMPLE

### Example: User Types "Make the front logo bigger and change color to red"

\`\`\`
1. USER SUBMITS MESSAGE
   Message: "Make the front logo bigger and change color to red"
   
2. SYSTEM DETECTS INTENT
   Keywords found: "make", "change", "color"
   Intent: "design_edit" ✓
   
3. BUILD EDIT PROMPT
   - Check for screenshot context (none in this case)
   - Load product context
   - Load last 5 chat messages
   
   Final prompt:
   "Make the front logo bigger and change color to red"
   
   If session has context about product:
   + Previous discussion about logo placement
   + Product type information
   
4. CHECK FOR PROGRESSIVE EDIT
   If onProgressiveEdit available:
     → Call onProgressiveEdit(currentViews, prompt, onProgress)
     → Front view regenerated, displayed
     → Back view regenerated, displayed
     → Side view regenerated, displayed
   Else:
     → Call onEditViews(currentViews, prompt)
     → All views regenerated together
   
5. HANDLE RESPONSE
   If successful:
     ✓ Update currentViews with new images
     ✓ Clear loadingViews state
   
   6. CREATE REVISION
     New revision object:
     {
       id: "rev-1731594000000",
       revisionNumber: 2,
       views: {
         front: { imageUrl: "..." },
         back: { imageUrl: "..." },
         side: { imageUrl: "..." }
       },
       editPrompt: "Make the front logo bigger and change color to red",
       editType: "ai_edit",
       createdAt: "2025-11-14T10:00:00Z",
       isActive: true
     }
   
   7. UPDATE UI STATE
     setRevisions([
       { ...revision1, isActive: false },  // Previous revision
       newRevision                          // New revision
     ])
   
   8. ADD SUCCESS MESSAGE
     Message Type: "success"
     Content: "Successfully applied 'Make the front logo bigger and change color to red'!"
     
   9. ADD REVISION SUMMARY
     After 1 second:
     Message Type: "system"
     Metadata: { summary: RevisionSummaryData }
     
10. CLEAR EDITING STATE
    After 3 seconds:
    setIsEditing(false)
    setPendingRevision(null)
\`\`\`

### Example: User Clicks on Image for Visual Edit

\`\`\`
1. USER ENABLES VISUAL EDIT MODE
   Click "Visual Edit" button
   setIsVisualEditMode(true)
   
2. USER CLICKS ON PRODUCT IMAGE
   Click coordinates captured
   Relative position calculated: { x: 340, y: 210 }
   
3. CREATE ANNOTATION POINT
   pendingAnnotation = {
     id: "annotation-1731594000123",
     x: 340,
     y: 210,
     view: "front"
   }
   
4. USER TYPES ANNOTATION LABEL
   Input: "Make this area bigger"
   
5. USER SAVES ANNOTATION
   addAnnotation({
     id: "annotation-1731594000123",
     x: 340,
     y: 210,
     label: "Make this area bigger",
     viewType: "front",
     type: "point"
   })
   
6. USER ADDS MORE ANNOTATIONS (Optional)
   - Click on back view
   - Add label: "Add more detail here"
   - Save
   
   Annotations now: 2 points across views
   
7. USER CLICKS "APPLY"
   setIsApplying(true)
   
8. CAPTURE ANNOTATED SCREENSHOT
   import captureAnnotatedScreenshot from annotationCapture
   
   Screenshot includes:
   - All 3 views with product images
   - Red annotation dots with labels
   - Connecting lines and text boxes
   
   Upload to Supabase → Get URL
   
9. GENERATE ANALYSIS PROMPT
   analysisPrompt = `🎯 **PRODUCT DESIGN ANALYSIS REQUEST**
   
   I've annotated this multi-view product design with 2 specific edit point(s).
   
   **ANNOTATION DETAILS:**
   • **Point 1** - FRONT VIEW at position (340, 210):
     Request: "Make this area bigger"
   
   • **Point 2** - BACK VIEW at position (225, 180):
     Request: "Add more detail here"
   
   **ANALYSIS REQUIREMENTS:**
   [... full analysis prompt structure ...]
   
   **RESPONSE FORMAT:**
   Please structure your response with clear sections for each annotation point...`
   
10. SEND TO CHAT
    await sendUserMessage(
      analysisPrompt,
      async (currentViews) => {
        await onEditViews(currentViews, "Apply the changes to points marked in the annotation screenshot")
      }
    )
    
11. ADD MESSAGE TO CHAT
    Message Type: "user"
    Content: "[Annotated Screenshot Image] [Full Analysis Prompt]"
    Metadata: {
      isScreenshot: true,
      capturedViews: ["front", "back"],
      annotationCount: 2
    }
    
12. CLEAR ANNOTATIONS
    setAnnotations([])
    setVisualEditMode(false)
    
13. AI RECEIVES REQUEST AND RESPONDS
    AI analyzes screenshot and annotations
    Provides detailed recommendations for each point
    
14. USER ACCEPTS OR REFINES
    If accept: Types "Ok, make those changes"
      → Intent detected as "design_edit"
      → Calls onEditViews with edit prompt
      → Views regenerated
      → New revision created
\`\`\`

## 8. SPECIAL HANDLING

### 8.1 Affirmative Response Handling

When user types just "ok", "yes", "go ahead", etc.:

\`\`\`typescript
const isAffirmativeResponse = affirmativePatterns.some(
  pattern => lowerMessage === pattern || lowerMessage.includes(pattern)
);

if (isAffirmativeResponse && chatMessages.length > 0) {
  // Find last AI message with suggestions
  const lastAISuggestion = chatMessages
    .slice()
    .reverse()
    .find(msg => msg.type === "ai" && msg.content.includes("Would you like"));
  
  if (lastAISuggestion) {
    // Extract suggestion content and make it the edit prompt
    finalEditPrompt = `The user has confirmed they want to proceed with the following changes:\n\n${lastAISuggestion.content}\n\nPlease implement all changes mentioned above.`;
  }
}
\`\`\`

### 8.2 Micro Edit Special Handling

Messages from visual annotations are handled differently:

\`\`\`typescript
const isFromMicroEdits = message.includes("I've marked specific areas") ||
                         message.includes("![Annotated Screenshot](");

if (isFromMicroEdits) {
  // Skip ALL context checking
  // Use the message as-is
  setEditPrompt(message);
  handleAIEditWithPrompt(message);
  return; // Exit early - no further processing
}
\`\`\`

### 8.3 Credit System Integration

Before edit execution, system checks available credits:
\`\`\`
Check if Insufficient Credits:
  - Edit uses 3 credits for all views
  - 1 credit per individual view edit
  
If insufficient:
  → Add error message to chat
  → Show toast notification
  → Prompt user to purchase credits
  → Don't execute edit
\`\`\`

## 9. MESSAGE PERSISTENCE AND CONTEXT

### 9.1 Chat Message Database

Messages saved with metadata:
\`\`\`typescript
interface AIChatMessageDB {
  id: string;              // UUID
  product_idea_id: string; // Links to product
  user_id: string;         // Links to user
  revision_id?: string;    // Links to revision (if applicable)
  batch_id?: string;       // Groups messages from same session
  message_type: ChatMessageType;
  content: string;
  metadata?: any;          // Flexible JSON for rich content
  created_at: string;
  updated_at: string;
}
\`\`\`

### 9.2 Batch ID Tracking

Each editing session gets a batch ID:
\`\`\`typescript
const [batchId] = useState(() => 
  `batch-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
);

// All messages in session saved with same batch_id
// Allows grouping related edits together
\`\`\`

### 9.3 Context Retrieval

For follow-up edits, system retrieves session context:
\`\`\`
getChatSessionByProductId(productId)
  ↓
Returns: { messages, context }
  ↓
Extract last 5 messages for context
  ↓
Build context string
  ↓
Append to new edit prompt
\`\`\`

## 10. ERROR HANDLING AND FALLBACKS

### 10.1 Intent Detection Failures

\`\`\`
Try AI Intent Detection:
  Call /api/ai-chat with classification prompt
  
If API fails or returns invalid:
  → Fall back to keyword detection
  
If keyword detection can't decide:
  → Default to "general_chat"
\`\`\`

### 10.2 Screenshot Capture Failures

\`\`\`
Try to capture annotated screenshot:
  - Use html2canvas on views container
  - Compress to base64
  
If capture fails:
  → Show error alert
  → Clear annotations and visual mode
  → Prevent message send
\`\`\`

### 10.3 Image Generation Failures

\`\`\`
Try onProgressiveEdit:
  If succeeds: Update views progressively
  If fails: Try onEditViews fallback
  
Try onEditViews:
  If succeeds: Update all views at once
  If fails: 
    - Check if "Insufficient credits"
    - Show specific error message
    - Reset loading states
    - Don't create revision
\`\`\`

## 11. SUMMARY: KEY COMPONENTS

### Request Handling
- **Chat Interface**: Natural language input
- **ImageToolDialog**: Structured image input with context
- **Visual Annotations**: Visual click-and-label edits
- **Intent Detection**: AI-powered intent classification

### Processing
- **Edit Prompt Builder**: Assembles comprehensive edit instructions
- **Context Loader**: Retrieves session history and product info
- **Screenshot System**: Captures annotated designs for AI analysis

### Execution
- **Progressive Generator**: Real-time view-by-view updates
- **Standard Generator**: Batch view generation
- **View Preserving**: Optional preservation of unchanged views

### Persistence
- **Revision Manager**: Creates and manages design versions
- **Chat Storage**: Persists all conversation history
- **Metadata System**: Tracks edit context and intent

### User Feedback
- **Loading States**: Per-view and overall indicators
- **Chat Messages**: Dynamic acknowledgments and status
- **Revision History**: Visual thumbnail grid of all versions
- **Toast Notifications**: Success/error notifications

---

**This workflow creates a seamless experience where users can modify designs through natural conversation, visual annotation, or structured image uploads, with intelligent context understanding and automatic version management.**
