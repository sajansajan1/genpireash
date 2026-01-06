# Stepped Image Generation Workflow Documentation

## Overview
This document outlines the new stepped approach for generating product images with user approval at each stage. The workflow ensures consistency across all product views by using the approved front view as the reference for subsequent generations.

## Workflow Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Step 1: Front View                       │
│                                                               │
│   User Input → Generate Front → Display → User Review        │
│   (Text/Image)                                               │
│                                                               │
│                    ┌──────────────┐                          │
│                    │   Approved?   │                          │
│                    └──────┬───────┘                          │
│                           │                                   │
│                    Yes ────┴──── No                          │
│                     │              │                          │
│                     ↓              ↓                          │
│              [Continue]      [Edit Request]                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 Step 2: Back & Side Views                    │
│                                                               │
│   Use Front View → Generate Back → Generate Side             │
│   as Reference     (Consistent)     (Consistent)             │
│                                                               │
│                    ┌──────────────┐                          │
│                    │   Display     │                          │
│                    │   All Views   │                          │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Step 3: Product Details Generation              │
│                                                               │
│   Generate Tech Pack → Materials → Dimensions → Colors       │
│   (Unchanged from current implementation)                    │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Implementation Stages

### Stage 1: Front View Generation

#### 1.1 Input Methods
- **Text Description**: User describes the product
- **Reference Image**: User uploads an inspiration image
- **Logo Overlay**: Optional logo can be added to the product

#### 1.2 Generation Parameters
\`\`\`typescript
interface FrontViewGenerationParams {
  input: {
    type: 'text' | 'image';
    content: string | File;
  };
  options: {
    logo?: {
      image: string; // Base64 or URL
      position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      size?: 'small' | 'medium' | 'large';
    };
    style?: 'photorealistic' | 'technical' | 'sketch';
    background: 'white'; // Always white for consistency
  };
}
\`\`\`

#### 1.3 Front View Prompt Template
\`\`\`javascript
const frontViewPrompt = `
Generate a professional product photograph of the FRONT VIEW ONLY:

PRODUCT: ${productDescription}

REQUIREMENTS:
- Show ONLY the front-facing view of the product
- Pure white background (#FFFFFF)
- Professional studio lighting with soft shadows
- Centered composition
- High detail and clarity
- Photorealistic rendering
- No perspective distortion
- Product should fill 70-80% of frame

IMPORTANT:
- This is the PRIMARY reference image
- All details must be clearly visible
- Colors must be accurate and vibrant
- Maintain consistent proportions
- No artistic effects or filters
`;
\`\`\`

#### 1.4 User Approval Interface
\`\`\`typescript
interface ApprovalState {
  status: 'pending' | 'approved' | 'revision_requested';
  frontView: {
    imageUrl: string;
    generatedAt: Date;
    prompt: string;
    userFeedback?: string;
  };
  revisionHistory: Array<{
    imageUrl: string;
    feedback: string;
    timestamp: Date;
  }>;
}
\`\`\`

### Stage 2: Back & Side View Generation

#### 2.1 Consistency Requirements
**Critical**: Back and side views MUST be generated using the approved front view as reference to ensure:
- Identical colors and color placement
- Same materials and textures
- Consistent proportions and dimensions
- Matching design elements
- Same lighting conditions
- Pure white background

#### 2.2 Back View Generation
\`\`\`javascript
const backViewPrompt = `
Generate the BACK VIEW of this exact product shown in the reference image.

CRITICAL REQUIREMENTS:
- This MUST be the exact SAME product as in the reference image
- Show ONLY the back view (180° rotation from front)
- Maintain IDENTICAL colors, materials, and proportions
- Pure white background (#FFFFFF)
- Same studio lighting setup as reference
- Same scale and framing as reference

CONSISTENCY RULES:
- Colors must match exactly: ${extractedColors}
- Dimensions must be identical
- Material textures must be the same
- Design elements must align with front view
- No new features or details not implied by front

PROHIBITED:
- Do NOT change any colors
- Do NOT alter proportions
- Do NOT add new design elements
- Do NOT change materials or textures
`;
\`\`\`

#### 2.3 Side View Generation
\`\`\`javascript
const sideViewPrompt = `
Generate the SIDE VIEW of this exact product shown in the reference image.

CRITICAL REQUIREMENTS:
- This MUST be the exact SAME product as in the reference image
- Show ONLY the side profile (90° rotation from front)
- Maintain IDENTICAL colors, materials, and proportions
- Pure white background (#FFFFFF)
- Same studio lighting setup as reference
- Same scale and framing as reference

CONSISTENCY RULES:
- Colors must match exactly: ${extractedColors}
- Product depth and profile must be logical
- Material textures must be consistent
- All visible elements must align with front view

PROHIBITED:
- Do NOT change any colors
- Do NOT alter proportions
- Do NOT add new design elements
- Do NOT change materials or textures
`;
\`\`\`

#### 2.4 Reference Image Processing
\`\`\`typescript
interface ReferenceImageData {
  frontViewUrl: string;
  extractedFeatures: {
    colors: Array<{hex: string, name: string, usage: string}>;
    estimatedDimensions: {width: string, height: string, depth?: string};
    materials: string[];
    keyElements: string[];
  };
}

async function processReferenceImage(frontViewUrl: string): Promise<ReferenceImageData> {
  // Extract key features from approved front view
  // This data will be injected into back/side prompts
}
\`\`\`

### Stage 3: Product Details Generation

No changes to the current implementation. The tech pack generation continues as normal after all views are approved.

## API Endpoints

### 1. Generate Front View
\`\`\`typescript
POST /api/generate-front-view
{
  "prompt": string,
  "referenceImage"?: string,
  "logo"?: LogoConfig,
  "userId": string,
  "sessionId": string
}

Response:
{
  "success": boolean,
  "frontView": {
    "url": string,
    "id": string,
    "prompt": string
  }
}
\`\`\`

### 2. Approve/Request Revision
\`\`\`typescript
POST /api/approve-front-view
{
  "viewId": string,
  "approved": boolean,
  "feedback"?: string,
  "userId": string
}

Response:
{
  "success": boolean,
  "status": "approved" | "revision_requested"
}
\`\`\`

### 3. Generate Additional Views
\`\`\`typescript
POST /api/generate-additional-views
{
  "frontViewId": string,
  "frontViewUrl": string,
  "extractedFeatures": ReferenceImageData,
  "userId": string
}

Response:
{
  "success": boolean,
  "views": {
    "back": { "url": string, "prompt": string },
    "side": { "url": string, "prompt": string }
  }
}
\`\`\`

## Database Schema Updates

\`\`\`sql
-- Add approval tracking table
CREATE TABLE product_view_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  front_view_url TEXT NOT NULL,
  front_view_prompt TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'revision_requested')),
  user_feedback TEXT,
  back_view_url TEXT,
  back_view_prompt TEXT,
  side_view_url TEXT,
  side_view_prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add revision history
CREATE TABLE view_revision_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID REFERENCES product_view_approvals(id),
  view_type TEXT CHECK (view_type IN ('front', 'back', 'side')),
  image_url TEXT NOT NULL,
  prompt TEXT,
  user_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## UI/UX Flow

### Step 1: Initial Generation
\`\`\`
┌────────────────────────────────────┐
│     Generate Your Product View      │
├────────────────────────────────────┤
│                                     │
│  [📝 Describe Product]              │
│         - OR -                      │
│  [📎 Upload Reference]              │
│                                     │
│  □ Add Logo                         │
│                                     │
│  [Generate Front View]              │
└────────────────────────────────────┘
\`\`\`

### Step 2: Approval Interface
\`\`\`
┌────────────────────────────────────┐
│        Front View Preview           │
├────────────────────────────────────┤
│                                     │
│     [Generated Front Image]         │
│                                     │
├────────────────────────────────────┤
│  Is this what you're looking for?  │
│                                     │
│  [✓ Approve & Continue]            │
│  [✗ Request Changes]               │
│                                     │
│  Feedback: [___________________]   │
└────────────────────────────────────┘
\`\`\`

### Step 3: Complete Views Display
\`\`\`
┌────────────────────────────────────┐
│      All Product Views Ready        │
├────────────────────────────────────┤
│  [Front]  [Back]  [Side]           │
│                                     │
│  [Generated Images Grid]            │
│                                     │
├────────────────────────────────────┤
│  [Continue to Tech Pack Details]   │
└────────────────────────────────────┘
\`\`\`

## Error Handling

### Consistency Validation
\`\`\`typescript
interface ConsistencyCheck {
  validateColors(front: string, back: string, side: string): boolean;
  validateProportions(views: string[]): boolean;
  detectInconsistencies(views: ViewSet): ValidationReport;
}

class ViewConsistencyValidator {
  async validate(views: ViewSet): Promise<ValidationResult> {
    // Check color consistency
    // Verify proportions match
    // Ensure materials are same
    // Flag any discrepancies
  }
}
\`\`\`

### Retry Logic
- Front view: Max 3 generation attempts
- Back/Side views: Max 5 attempts (consistency is harder)
- Automatic fallback to alternative prompts
- User notification on repeated failures

## Quality Assurance Checklist

### Front View Generation
- [ ] Clear, centered product presentation
- [ ] White background without artifacts
- [ ] Proper lighting and shadows
- [ ] Accurate color representation
- [ ] No distortion or blur
- [ ] Logo properly placed (if applicable)

### Back & Side View Generation
- [ ] Colors exactly match front view
- [ ] Proportions are identical
- [ ] Materials appear consistent
- [ ] Lighting matches front view
- [ ] White background maintained
- [ ] Logical construction (back/side make sense with front)

### System Integration
- [ ] Approval state properly tracked
- [ ] Revision history maintained
- [ ] Images stored efficiently
- [ ] User feedback captured
- [ ] Session continuity maintained

## Performance Considerations

### Optimization Strategies
1. **Parallel Generation**: After front approval, generate back and side simultaneously
2. **Caching**: Store extracted features from front view
3. **Progressive Loading**: Show views as they complete
4. **Retry Intelligence**: Learn from failed attempts

### Resource Management
\`\`\`typescript
const ResourceLimits = {
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxGenerationTime: 30000, // 30s
  maxRetries: 5,
  maxConcurrentGenerations: 2
};
\`\`\`

## Testing Scenarios

### Test Case 1: Simple Product
- Input: "White t-shirt with blue logo"
- Verify: All views show same shade of white, logo visible on front

### Test Case 2: Complex Product
- Input: "Backpack with multiple pockets and zippers"
- Verify: Pocket placement consistent, zippers align across views

### Test Case 3: Reference Image
- Input: Uploaded product photo
- Verify: Generated views match reference style and details

### Test Case 4: Revision Flow
- Action: Request changes to front view
- Verify: History tracked, new generation incorporates feedback

## Success Metrics

1. **Consistency Score**: % of generations with matching colors/proportions
2. **Approval Rate**: % of front views approved on first attempt
3. **Generation Time**: Average time to complete all views
4. **User Satisfaction**: Feedback ratings on final results

## Migration Plan

### Phase 1: Frontend Updates
- Implement approval UI
- Add revision feedback system
- Create stepped generation flow

### Phase 2: Backend Implementation
- Create new API endpoints
- Implement reference-based generation
- Add consistency validation

### Phase 3: Testing & Refinement
- A/B test with subset of users
- Collect feedback
- Optimize prompts based on results

## Appendix: Prompt Engineering Tips

### Ensuring Consistency
1. Always include reference image with prompts
2. Explicitly list colors with hex codes
3. Describe materials in detail
4. Specify "exact same product" multiple times
5. Use negative prompts to prevent variations

### Common Issues & Solutions
| Issue | Solution |
|-------|----------|
| Colors don't match | Extract hex codes and inject into prompt |
| Proportions vary | Include specific measurements |
| Materials look different | Use detailed material descriptions |
| Background not white | Emphasize "pure white #FFFFFF" |
| New details appear | Use negative prompts: "do not add..." |

---

This workflow ensures consistent, high-quality product visualizations with user control at each step. The approval mechanism guarantees satisfaction before proceeding to generate additional views, saving resources and improving user experience.
