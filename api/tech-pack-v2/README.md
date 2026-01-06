# Tech Pack V2 - Backend Implementation --

A complete, production-ready backend system for AI-powered technical pack generation.

## Overview

Tech Pack V2 is a sophisticated system that uses AI (OpenAI GPT-4o and Gemini 2.5 Flash) to analyze product images and generate comprehensive technical documentation for manufacturing.

### Key Features

- **Category Detection**: Automatically identifies product type (Apparel, Footwear, Bags, Furniture, Jewelry)
- **Base View Analysis**: Analyzes 5 views and extracts technical specifications
- **Close-Up Generation**: Creates 6-10 detail shots with AI analysis
- **Technical Sketches**: Generates flat technical drawings with call-outs
- **AI-Assisted Editing**: Edit specific fields with AI assistance
- **Credit System**: Integrated credit management and tracking

### Credits Pricing

| Feature | Credits | Description |
|---------|---------|-------------|
| Category Detection | 0 | Free (included in base views) |
| Base Views (5 views) | 3 | AI analysis of front, back, side, top, bottom |
| Close-Ups (6-10 shots) | 3 | Detail shots with technical analysis |
| Technical Sketches | 3 | 3 flat sketches with call-outs |
| AI Field Edit | 1 | Edit specific field with AI |
| Regenerate View | 1 | Full regeneration of single view |
| **Complete Tech Pack** | **9** | All features combined |

## Directory Structure

```
api/tech-pack-v2/
├── config/                      # Configuration files
│   ├── models.config.ts         # AI model settings
│   ├── credits.config.ts        # Credit costs
│   └── limits.config.ts         # Rate limits, constraints
│
├── prompts/                     # AI prompts
│   ├── category-detection/
│   │   └── detect-category.prompt.ts
│   ├── base-views/
│   │   └── universal.prompt.ts  # Dynamic category-aware prompt
│   ├── close-ups/
│   │   ├── generate-closeup-plan.prompt.ts
│   │   └── analyze-closeup.prompt.ts
│   └── sketches/
│       ├── generate-technical-sketch.prompt.ts
│       └── generate-callouts.prompt.ts
│
├── endpoints/                   # API route handlers
│   ├── category.endpoint.ts
│   ├── base-views.endpoint.ts
│   ├── close-ups.endpoint.ts
│   ├── sketches.endpoint.ts
│   ├── edit.endpoint.ts
│   └── regenerate.endpoint.ts
│
├── functions/                   # Business logic
│   ├── category-detection.function.ts
│   ├── base-view-analysis.function.ts
│   ├── closeup-generation.function.ts
│   ├── sketch-generation.function.ts
│   └── ai-edit.function.ts
│
├── utils/                       # Utilities
│   ├── validation.ts            # Zod schemas
│   ├── credits-manager.ts       # Credit operations
│   ├── image-hash.ts           # Image hashing for caching
│   └── confidence-scorer.ts     # Quality assessment
│
├── types/                       # TypeScript types
│   ├── tech-pack.types.ts
│   ├── prompts.types.ts
│   └── responses.types.ts
│
├── index.ts                     # Main entry point
└── README.md                    # This file
```

## API Endpoints

### 1. Detect Category

**Endpoint**: `POST /api/tech-pack-v2/detect-category`

**Request**:
```typescript
{
  productId: string;
  imageUrl: string;
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    category: "APPAREL" | "FOOTWEAR" | "BAGS" | "FURNITURE" | "JEWELRY";
    subcategory: string;
    confidence: number;
    reasoning: string;
  };
}
```

### 2. Analyze Base Views

**Endpoint**: `POST /api/tech-pack-v2/base-views/analyze`

**Request**:
```typescript
{
  productId: string;
  revisionIds: string[];  // 5 revision IDs from product_multiview_revisions
  category?: string;      // Optional, auto-detected if not provided
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    analyses: Array<{
      revisionId: string;
      viewType: string;
      analysisData: BaseViewAnalysis;
      confidenceScore: number;
    }>;
    creditsUsed: 3;
    batchId: string;
  };
}
```

### 3. Generate Close-Ups

**Endpoint**: `POST /api/tech-pack-v2/close-ups/generate`

**Request**:
```typescript
{
  productId: string;
  baseViewAnalyses: any[];  // Results from base view analysis
  category: string;
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    closeupPlan: {...};
    generatedImages: Array<{
      revisionId: string;
      imageUrl: string;
      shotName: string;
      analysisData: CloseUpAnalysis;
    }>;
    creditsUsed: 3;
  };
}
```

### 4. Generate Technical Sketches

**Endpoint**: `POST /api/tech-pack-v2/sketches/generate`

**Request**:
```typescript
{
  productId: string;
  productAnalysis: any;  // Combined analysis from base views + close-ups
  category: string;
  views?: ["front", "back", "side"];  // Optional, defaults to all 3
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    sketches: Array<{
      revisionId: string;
      viewType: "front" | "back" | "side";
      imageUrl: string;
      callouts: CallOutData;
    }>;
    creditsUsed: 3;
  };
}
```

### 5. AI Edit Field

**Endpoint**: `POST /api/tech-pack-v2/edit`

**Request**:
```typescript
{
  revisionId: string;
  fieldPath: string;            // e.g., "detected_features.neckline"
  editPrompt: string;           // User's edit instruction
  referenceImageUrl: string;
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    newRevisionId: string;
    updatedField: any;
    creditsUsed: 1;
  };
}
```

### 6. Regenerate View

**Endpoint**: `POST /api/tech-pack-v2/regenerate`

**Request**:
```typescript
{
  revisionId: string;
  regeneratePrompt?: string;
  replaceCurrent?: boolean;
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    newRevisionId: string;
    analysisData: any;
    imageUrl: string;
    creditsUsed: 1;
  };
}
```

## Database Schema

### Tables Used

1. **`product_multiview_revisions`** - Stores ALL generated images
2. **`revision_vision_analysis`** - Stores ALL AI analysis data
3. **`product_ideas`** - Main product container
4. **`user_credits`** - Credit balances
5. **`credit_transactions`** - Credit transaction log

### Data Flow

```
1. User uploads image → product_multiview_revisions (5 base views)
2. Analyze each view → revision_vision_analysis (linked to each revision)
3. Generate close-ups → product_multiview_revisions (6-10 images)
4. Analyze close-ups → revision_vision_analysis (detailed observations)
5. Generate sketches → product_multiview_revisions (3 sketches)
6. Add call-outs → revision_vision_analysis (call-out data)
```

## Usage Examples

### Complete Workflow

```typescript
import {
  detectProductCategory,
  analyzeBaseViewsBatch,
  generateCloseUps,
  generateTechnicalSketches,
} from "@/api/tech-pack-v2";

// Step 1: Detect category
const category = await detectProductCategory(imageUrl, userId);

// Step 2: Analyze base views
const baseViews = await analyzeBaseViewsBatch(
  views,
  category.category,
  productId,
  userId
);

// Step 3: Generate close-ups
const closeUps = await generateCloseUps(
  productId,
  category.category,
  baseViews.map(v => v.analysisData),
  userId
);

// Step 4: Generate sketches
const sketches = await generateTechnicalSketches(
  productId,
  category.category,
  { baseViews, closeUps },
  userId
);
```

### Single Field Edit

```typescript
import { performAIEdit } from "@/api/tech-pack-v2";

const result = await performAIEdit(
  revisionId,
  "detected_features.neckline",
  "Change to v-neck",
  imageUrl,
  userId
);
```

## Integration with Existing Services

### AI Services Used

- **OpenAI GPT-4o** (via `lib/services/vision-analysis-service.ts`)
  - Category detection
  - Base view analysis
  - Close-up analysis
  - Call-out generation

- **Gemini 2.5 Flash** (via `lib/ai/gemini.ts`)
  - Close-up image generation
  - Technical sketch generation

### Image Processing

- **Upload**: `lib/services/image-service.ts`
  - Automatic optimization
  - Thumbnail generation
  - WebP conversion

- **Storage**: Supabase Storage via `lib/supabase/file_upload.ts`

### Database

- **Client**: `lib/supabase/server.ts` (server-side)
- **Caching**: Built into `revision_vision_analysis` via `image_hash`

## Error Handling

All functions include comprehensive error handling:

1. **Validation errors**: Zod schema validation with detailed messages
2. **Credit errors**: Insufficient credits return 402 status
3. **AI errors**: Automatic retry with exponential backoff
4. **Database errors**: Proper error propagation and logging

## Testing Recommendations

### Unit Tests
- Test each utility function independently
- Mock AI API responses
- Test validation schemas

### Integration Tests
- Test complete workflows
- Test credit deduction/refund
- Test database operations

### E2E Tests
- Test API endpoints
- Test error scenarios
- Test rate limiting

## Performance Considerations

- **Caching**: Image hash-based caching prevents duplicate analysis
- **Batch Processing**: Supports batch operations for efficiency
- **Background Execution**: Uses `lib/utils/background-execution.ts`
- **Rate Limiting**: 30 requests per minute per user

## Next Steps for Frontend Integration

1. Create React components to call these endpoints
2. Implement credit display and management UI
3. Add image upload and preview functionality
4. Create edit panels for tech pack data
5. Add export functionality (PDF, ZIP)

## Maintenance & Monitoring

- Monitor AI token usage via `ai_logger` table
- Track credit consumption patterns
- Monitor cache hit rates
- Review confidence scores for quality

## License

Proprietary - Internal Use Only

---

**Version**: 2.0.0
**Last Updated**: 2025-11-22
**Maintainer**: Tech Pack Team
