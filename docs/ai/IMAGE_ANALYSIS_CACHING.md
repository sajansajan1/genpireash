# Image Analysis Caching System

## Overview
The image analysis caching system stores AI-generated analyses of product images in the database to avoid repeated expensive API calls to GPT-4 Vision. When images are edited or new revisions are created, the system checks for existing analysis first before performing new analysis.

## Database Schema

### `image_analysis_cache` Table
Stores cached image analyses with the following fields:
- `id`: UUID primary key
- `image_url`: Unique URL of the analyzed image
- `image_hash`: MD5 hash for deduplication
- `analysis_data`: JSONB containing structured analysis
- `model_used`: AI model used (default: 'gpt-4o')
- `product_idea_id`: Reference to product
- `revision_id`: Reference to specific revision
- `created_at`, `updated_at`: Timestamps
- `expires_at`: Optional expiry (default: 30 days)
- `tokens_used`: API tokens consumed
- `processing_time_ms`: Analysis duration
- `confidence_score`: Optional quality metric

### Analysis Data Structure
\`\`\`typescript
interface ImageAnalysis {
  productType?: string;
  currentColors?: string[];
  materials?: string[];
  textures?: string[];
  keyFeatures?: string[];
  style?: string;
  quality?: string;
  viewSpecificDetails?: {
    front?: string;
    back?: string;
    side?: string;
  };
  fullAnalysis?: string;
  suggestions?: string[];
  timestamp?: string;
}
\`\`\`

## How It Works

### 1. When New Images Are Generated
When product images are generated via stepped generation:
\`\`\`typescript
// In stepped-image-generation.ts
await analyzeAndSaveProductImages(
  productId,
  { front: frontUrl, back: backUrl, side: sideUrl },
  productName
);
\`\`\`

### 2. When Images Are Edited
The AI image editor checks for cached analysis first:
\`\`\`typescript
// In ai-image-edit-multiview.ts
const analysisResults = await analyzeProductViews(
  currentViews,
  productName,
  productId
);
\`\`\`

### 3. Analysis Flow
1. **Check Cache**: Look for existing analysis by image URL
2. **If Cached**: Return immediately (saves ~2-3 seconds and API costs)
3. **If Not Cached**: 
   - Perform GPT-4 Vision analysis
   - Save to cache with 30-day expiry
   - Link to product for easy retrieval

### 4. Benefits
- **Performance**: 2-3 second faster edits when analysis is cached
- **Cost Savings**: ~$0.01-0.02 saved per cached analysis
- **Consistency**: Same analysis used across multiple edits
- **Scalability**: Reduces API rate limit pressure

## API Functions

### Core Services (`lib/services/image-analysis-service.ts`)

#### `getCachedImageAnalysis(imageUrl)`
Retrieves cached analysis for a single image.

#### `saveImageAnalysis(imageUrl, analysis, options)`
Saves analysis to cache with metadata.

#### `analyzeImage(imageUrl, productName, context)`
Analyzes single image with GPT-4 Vision.

#### `analyzeProductViews(views, productName, productId)`
Analyzes multiple product views with automatic caching.

### Action Functions (`app/actions/analyze-product-images.ts`)

#### `analyzeAndSaveProductImages(productId, images, productName)`
Analyzes and caches all product images after generation.

#### `getProductImageAnalysis(productId)`
Gets all cached analyses for a product.

#### `refreshImageAnalysis(imageUrl, productId, productName)`
Forces re-analysis and cache update.

## Usage Examples

### Check If Analysis Exists
\`\`\`typescript
const analysis = await getCachedImageAnalysis(imageUrl);
if (analysis) {
  console.log("Using cached analysis");
  // Use cached analysis
} else {
  console.log("Performing new analysis");
  // Perform new analysis
}
\`\`\`

### Analyze Product Views
\`\`\`typescript
const results = await analyzeProductViews({
  front: frontImageUrl,
  back: backImageUrl,
  side: sideImageUrl
}, "T-Shirt", productId);

// Results contain individual and combined analyses
console.log(results.front); // Front view analysis
console.log(results.combinedAnalysis); // Combined summary
\`\`\`

### Force Refresh Analysis
\`\`\`typescript
const { analysis } = await refreshImageAnalysis(
  imageUrl,
  productId,
  "Product Name"
);
\`\`\`

## Migration Instructions

Run the migration to create the cache table:
\`\`\`sql
-- Run in Supabase SQL editor
-- File: supabase/migrations/add_image_analysis.sql
\`\`\`

## Maintenance

### Clean Up Expired Cache
\`\`\`typescript
// Run periodically to clean expired entries
const deletedCount = await cleanupExpiredAnalyses();
console.log(`Cleaned up ${deletedCount} expired analyses`);
\`\`\`

### Monitor Cache Usage
\`\`\`sql
-- Check cache statistics
SELECT 
  COUNT(*) as total_cached,
  COUNT(DISTINCT product_idea_id) as unique_products,
  AVG(processing_time_ms) as avg_processing_time,
  SUM(tokens_used) as total_tokens
FROM image_analysis_cache;
\`\`\`

## Performance Impact

### Before Caching
- Each edit: ~3-4 seconds for analysis
- Cost: ~$0.01-0.02 per edit
- API calls: 3 (one per view)

### After Caching
- First edit: Same as before (builds cache)
- Subsequent edits: <0.5 seconds for analysis lookup
- Cost: $0 (uses cached data)
- API calls: 0 (cache hit)

## Best Practices

1. **Always Check Cache First**: Never analyze without checking cache
2. **Link to Products**: Associate analyses with product IDs for easy retrieval
3. **Set Reasonable Expiry**: 30 days default, adjust based on needs
4. **Handle Failures Gracefully**: Continue if caching fails, log errors
5. **Monitor Cache Size**: Clean up expired entries periodically

## Future Enhancements

1. **Smart Invalidation**: Detect significant image changes
2. **Compression**: Compress large analysis data
3. **Batch Analysis**: Analyze multiple images in single API call
4. **Quality Scores**: Track analysis quality/confidence
5. **Version Control**: Track analysis model versions
