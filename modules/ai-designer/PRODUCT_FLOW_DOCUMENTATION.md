# AI Designer Product Flow Documentation

## Overview

This document outlines the complete flow from product creation entry to tech pack generation in the AI Designer module. The system handles multi-view product image generation, editing, and comprehensive tech pack creation.

## Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Designer Module                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   Components    │  │     Hooks       │  │    Services     │    │
│  │                 │  │                 │  │                 │    │
│  │ • MultiViewEdit │  │ • useAIMicroEdit│  │ • imageService  │    │
│  │ • ViewsDisplay  │  │ • useViewport   │  │ • geminiService │    │
│  │ • ChatInterface │  │ • useRevisions  │  │ • generation    │    │
│  │ • RevisionHist  │  │                 │  │                 │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │     Store       │  │     Types       │  │    Utils        │    │
│  │                 │  │                 │  │                 │    │
│  │ • editorStore   │  │ • editor.types  │  │ • validators    │    │
│  │ • annotationSto │  │ • annotation    │  │ • formatters    │    │
│  │                 │  │ • revision      │  │ • processors    │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
\`\`\`

## Complete Product Flow

### 1. Project Initialization

**Entry Point**: `/ai-designer?projectId={id}&version=modular`

**Flow**:
1. **URL Parameters Parsing**:
   - `projectId`: Existing project ID
   - `version`: modular/legacy version selector
   - `prompt`: Initial design prompt (optional)
   - `autoGenerate`: Auto-trigger generation flag

2. **User Authentication Check**:
   \`\`\`typescript
   const { data: { user } } = await supabase.auth.getUser();
   \`\`\`

3. **Project Loading**:
   \`\`\`typescript
   // Load project from product_ideas table
   const { data: project } = await supabase
     .from("product_ideas")
     .select("*")
     .eq("id", projectId)
     .single();
   \`\`\`

4. **State Initialization**:
   - Extract metadata from `tech_pack.metadata`
   - Check for existing images in `image_data`
   - Initialize chat session
   - Set up revision history

### 2. Initial Product Generation

**Trigger**: New project without existing images

**Flow**:
\`\`\`typescript
// 1. Extract prompt and metadata
const prompt = project.prompt || initialPrompt;
const metadata = project.tech_pack?.metadata || {};
const hasLogo = metadata.logo && metadata.logo !== '';

// 2. Call centralized generation service
const result = await generateIdea({
  user_prompt: prompt,
  existing_project_id: projectId,
  regenerate_image_only: true,
  image: metadata.logo || undefined,
});

// 3. Progressive image generation (5 views)
// - Front view (primary)
// - Back view (180° rotation)
// - Side view (90° rotation)
// - Top view (overhead)
// - Bottom view (underside)
\`\`\`

**Image Generation Process**:
1. **Gemini 2.5 Flash Generation**:
   - Uses specialized prompts for each view
   - Maintains consistency across views
   - Implements view-specific requirements
   - Handles material and color consistency

2. **Image Upload Pipeline**:
   \`\`\`typescript
   // Upload to Supabase Storage
   const uploadResult = await supabase.storage
     .from('fileuploads')
     .upload(`uploads/${projectId}/${viewType}_${uuid}.jpeg`, imageBlob);

   // Generate public URL
   const publicUrl = supabase.storage
     .from('fileuploads')
     .getPublicUrl(uploadResult.data.path).data.publicUrl;
   \`\`\`

3. **Database Storage**:
   \`\`\`typescript
   // Update product_ideas.image_data
   await supabase
     .from("product_ideas")
     .update({
       image_data: {
         front: { url: frontUrl, created_at: timestamp },
         back: { url: backUrl, created_at: timestamp },
         side: { url: sideUrl, created_at: timestamp },
         top: { url: topUrl, created_at: timestamp },
         bottom: { url: bottomUrl, created_at: timestamp }
       }
     })
     .eq("id", projectId);
   \`\`\`

### 3. Multi-View Editor Interface

**Main Component**: `MultiViewEditor`

**Core Features**:

1. **Views Display Grid**:
   \`\`\`typescript
   // 2-row layout: Front/Back/Side + Top/Bottom
   const viewLayout = {
     row1: ['front', 'back', 'side'],
     row2: ['top', 'bottom'] // Only shown if available
   };
   \`\`\`

2. **State Management** (Zustand):
   \`\`\`typescript
   interface EditorState {
     productId: string | null;
     currentViews: ViewImages;
     loadingViews: LoadingStates;
     revisions: MultiViewRevision[];
     isVisualEditMode: boolean;
     viewport: ViewportState;
   }
   \`\`\`

3. **Loading States**:
   - Individual view loading indicators
   - Progress tracking per view
   - Error handling and retry logic

### 4. AI Micro Edits System

**Component**: `useAIMicroEdits` hook

**Features**:

1. **Annotation Placement**:
   \`\`\`typescript
   // Click-to-annotate system
   const handleAddAnnotationPoint = (e: React.MouseEvent, view: ViewType) => {
     const rect = e.currentTarget.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;

     const annotationId = `annotation-${Date.now()}`;
     setPendingAnnotation({ id: annotationId, x, y, view });
   };
   \`\`\`

2. **Annotation Management**:
   - **Text Input**: Multiline textarea with 400px width
   - **Drag & Drop**: Full drag functionality for repositioning
   - **Delete**: Hover-activated delete buttons
   - **Smart Positioning**: Edge detection and auto-positioning

3. **Annotation Data Structure**:
   \`\`\`typescript
   interface Annotation {
     id: string;
     type: 'point';
     view: ViewType;
     x: number;
     y: number;
     text: string;
     timestamp: string;
   }
   \`\`\`

4. **Screenshot Capture & Analysis**:
   \`\`\`typescript
   // Capture annotated screenshot
   const annotatedScreenshotUrl = await captureAnnotatedScreenshot(viewsGrid, annotations);

   // Generate analysis prompt
   const analysisPrompt = generateAnnotationAnalysisPrompt(annotations);

   // Store for chat interface
   localStorage.setItem('pendingAnalysis', JSON.stringify({
     screenshotUrl: annotatedScreenshotUrl,
     analysisPrompt,
     annotations,
     timestamp: new Date().toISOString()
   }));
   \`\`\`

### 5. Chat Interface & AI Analysis

**Component**: `ChatInterface`

**Flow**:
1. **Session Management**:
   \`\`\`typescript
   const sessionResult = await getOrCreateChatSession(projectId, userId, project);
   \`\`\`

2. **Message Processing**:
   - Screenshot analysis from annotations
   - Context-aware conversations
   - Design iteration requests
   - Technical specification queries

3. **Integration with Generation**:
   \`\`\`typescript
   // Trigger new generation from chat
   const editResult = await handleEditMultiView(chatPrompt);
   \`\`\`

### 6. Revision Management System

**Storage**: `product_multiview_revisions` table

**Structure**:
\`\`\`sql
CREATE TABLE product_multiview_revisions (
  id UUID PRIMARY KEY,
  product_idea_id UUID REFERENCES product_ideas(id),
  user_id UUID,
  revision_number INTEGER,
  batch_id VARCHAR,
  view_type VARCHAR CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom')),
  image_url TEXT,
  edit_prompt TEXT,
  edit_type VARCHAR,
  is_active BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);
\`\`\`

**Revision Flow**:
1. **Save New Revision**:
   \`\`\`typescript
   // Deactivate previous revisions
   await supabase
     .from("product_multiview_revisions")
     .update({ is_active: false })
     .eq("product_idea_id", projectId);

   // Save new revision
   const revisionData = {
     product_idea_id: projectId,
     user_id: userId,
     revision_number: nextRevisionNumber,
     batch_id: `batch-${Date.now()}`,
     view_type: viewType,
     image_url: imageUrl,
     edit_prompt: editPrompt,
     is_active: true
   };
   \`\`\`

2. **Revision History Display**:
   - Grouped by batch_id
   - Thumbnail previews
   - Edit prompts and timestamps
   - Rollback functionality

### 7. Progressive Editing & Regeneration

**Trigger**: User edits through chat or direct prompts

**Flow**:
\`\`\`typescript
const handleEditMultiView = async (prompt: string, onViewComplete?: Function) => {
  // 1. Call generation service
  const result = await generateIdea({
    user_prompt: prompt,
    existing_project_id: projectId,
    regenerate_image_only: true,
    generateMoreImages: true,
  });

  // 2. Progressive updates
  if (onViewComplete) {
    ['front', 'back', 'side', 'top', 'bottom'].forEach(view => {
      if (result.image[view]?.url) {
        onViewComplete(view, result.image[view].url);
      }
    });
  }

  // 3. Save as new revision
  await handleSaveEditedImages(updatedViews, prompt);
};
\`\`\`

### 8. Tech Pack Generation

**Trigger**: User clicks "Generate Tech Pack" button

**Flow**:
1. **Validation**:
   - Check for complete product data
   - Verify image availability
   - Validate user permissions

2. **Tech Pack Creation**:
   \`\`\`typescript
   const result = await generateTechPackForProduct(projectId);
   \`\`\`

3. **AI-Powered Analysis**:
   - Product specification extraction
   - Material identification
   - Manufacturing requirements
   - Cost estimation
   - Size/dimension analysis

4. **Tech Pack Structure**:
   \`\`\`typescript
   interface TechPack {
     productName: string;
     productDescription: string;
     metadata: {
       colors: string[];
       materials: string[];
       dimensions: object;
       features: string[];
       logo?: string;
       designFile?: string;
     };
     // Additional sections generated by AI
     specifications?: object;
     manufacturing?: object;
     costing?: object;
   }
   \`\`\`

5. **Redirect to Tech Pack Maker**:
   \`\`\`typescript
   router.push(`/tech-pack-maker/${projectId}`);
   \`\`\`

## Data Models

### Core Database Tables

1. **product_ideas**:
   - Main product information
   - Tech pack data
   - Image data (URLs)
   - Status and metadata

2. **product_multiview_revisions**:
   - Revision history
   - Individual view tracking
   - Edit prompts and metadata

3. **images_uploads**:
   - Image file metadata
   - Upload tracking
   - Thumbnail generation

4. **chat_sessions**:
   - AI chat conversations
   - Session management
   - Message history

### State Management

**Zustand Stores**:
1. **editorStore**: Main editor state
2. **annotationStore**: Annotation system state
3. **chatStore**: Chat interface state

## API Integration Points

### External Services

1. **Gemini 2.5 Flash**: Primary image generation
2. **OpenAI GPT-4**: Text generation and analysis
3. **Supabase Storage**: Image and file storage
4. **Supabase Database**: Data persistence

### Internal Actions

1. **generateIdea**: Core generation service
2. **saveImageUpload**: Image persistence
3. **getGroupedMultiViewRevisions**: Revision management
4. **generateTechPackForProduct**: Tech pack creation

## Error Handling & Recovery

### Timeout Management
- 3-minute timeout for generation requests
- Progressive retry logic
- Graceful degradation

### User Feedback
- Toast notifications for all operations
- Loading states with progress indicators
- Error messages with actionable guidance

### Data Consistency
- Atomic operations for multi-view updates
- Rollback capabilities
- Validation at each step

## Performance Considerations

### Image Optimization
- 2x scale for high-quality generation
- Compression for web display
- Lazy loading for revision history

### State Management
- Efficient re-renders with Zustand
- Memoized components
- Optimistic updates

### Database Queries
- Indexed queries on project_id
- Batch operations for revisions
- Efficient joins for revision display

## Future Enhancement Opportunities

1. **Real-time Collaboration**: Multi-user editing
2. **Advanced Annotations**: Shape tools, measurements
3. **Batch Processing**: Multiple product generation
4. **Export Options**: Various file formats
5. **Integration APIs**: Third-party service connections

---

**Last Updated**: 2025-01-25
**Version**: 1.0
**Module**: AI Designer v2 (Modular)
