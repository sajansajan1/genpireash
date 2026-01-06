# Tech Files Storage System

## Overview

The Tech Files system provides a comprehensive, versioned storage solution for all tech pack files generated in the application. It replaces the previous approach of storing everything in `revision_vision_analysis` with a dedicated set of tables designed specifically for tech pack file management.

## Database Schema

### Core Tables

#### `tech_files`
Main table storing all tech pack files with versioning support.

**Key Features:**
- Supports multiple file types: `base_view`, `closeup`, `sketch`, `category`, `complete_pack`
- Built-in versioning with `version`, `parent_file_id`, and `is_latest` fields
- Stores both the file URL and comprehensive analysis data in JSONB format
- Tracks generation metadata (AI model, prompts, batch IDs)
- Quality metrics (confidence scores, quality scores)
- Credit tracking per file

**Example Record:**
```json
{
  "id": "uuid",
  "product_idea_id": "uuid",
  "revision_id": "uuid",
  "file_type": "base_view",
  "view_type": "front",
  "file_url": "https://...",
  "analysis_data": {
    "materials": [...],
    "dimensions": {...},
    "features": [...]
  },
  "version": 1,
  "is_latest": true,
  "credits_used": 1,
  "status": "completed"
}
```

#### `tech_file_versions`
Maintains complete version history with snapshots of file data at each version.

**Key Features:**
- Complete snapshot of file state at time of version creation
- Links to parent `tech_files` record
- Tracks who created the version and why (`change_description`)

#### `tech_file_collections`
Groups related tech files into collections (e.g., a complete tech pack).

**Key Features:**
- Multiple collection types: `tech_pack_v2`, `base_views_set`, `sketches_set`, `closeups_set`
- Tracks completion status and percentage
- Aggregates total credits used across all files in collection
- Can be linked to specific product revision or product-wide

#### `tech_file_collection_items`
Maps individual files to collections with ordering and organization.

**Key Features:**
- Many-to-many relationship between files and collections
- Display order for proper sequencing
- Section grouping (e.g., "base_views", "closeups", "sketches")

## Key Features

### 1. Versioning System

The versioning system uses three mechanisms:
- **`is_latest` flag**: Quick filtering for current versions
- **`version` number**: Incremental version tracking
- **`parent_file_id`**: Links versions in a chain

**Automatic Version Archiving:**
When a new file is created with `is_latest = true`, a trigger automatically sets `is_latest = false` on all previous versions of the same file type and view type for that product.

**Creating Versions:**
```typescript
import { createTechFileVersion } from "@/lib/services/tech-files-service";

// Create a new version snapshot
const versionId = await createTechFileVersion(
  techFileId,
  userId,
  "Updated materials analysis based on user feedback"
);
```

### 2. Collections

Collections group related files together, making it easy to track and retrieve complete tech packs.

**Creating a Collection:**
```typescript
import {
  createTechFileCollection,
  addFilesToCollection
} from "@/lib/services/tech-files-service";

// Create collection
const collection = await createTechFileCollection({
  product_idea_id: productId,
  user_id: userId,
  collection_name: "Tech Pack - Jan 2025",
  collection_type: "tech_pack_v2",
  description: "Complete tech pack with all views"
});

// Add files to collection
await addFilesToCollection(
  collection.id,
  [fileId1, fileId2, fileId3],
  { section: "base_views", displayOrder: 0 }
);
```

### 3. Backwards Compatibility

The system maintains backwards compatibility by:
- Continuing to write to `revision_vision_analysis` table
- Checking both `tech_files` and `revision_vision_analysis` for cached data
- Allowing gradual migration of existing code

### 4. Credit Tracking

Credits are tracked at two levels:
- **Per file**: `tech_files.credits_used`
- **Per collection**: `tech_file_collections.total_credits_used`

This enables detailed usage analytics and billing.

## Service Layer API

### Tech Files Operations

```typescript
import {
  createTechFile,
  getTechFileById,
  getLatestTechFiles,
  updateTechFileStatus,
  archiveTechFile,
} from "@/api/tech-pack-v2/tech-files-service";

// Create a new tech file
const file = await createTechFile({
  product_idea_id: productId,
  user_id: userId,
  file_type: "base_view",
  view_type: "front",
  file_url: imageUrl,
  analysis_data: analysisResult,
  ai_model_used: "gpt-4-vision-preview",
  confidence_score: 0.92,
  credits_used: 1,
});

// Get latest files for a product
const latestFiles = await getLatestTechFiles(productId, {
  fileType: "base_view",
  viewType: "front",
});

// Update file status
await updateTechFileStatus(fileId, "completed");

// Archive a file (soft delete)
await archiveTechFile(fileId);
```

### Version Operations

```typescript
import {
  createTechFileVersion,
  getTechFileVersions,
} from "@/api/tech-pack-v2/tech-files-service";

// Create version snapshot
const versionId = await createTechFileVersion(
  techFileId,
  userId,
  "Updated based on client feedback"
);

// Get all versions
const versions = await getTechFileVersions(techFileId);
```

### Collection Operations

```typescript
import {
  createTechFileCollection,
  addFilesToCollection,
  getCollectionWithFiles,
  updateCollectionProgress,
  updateCollectionCredits,
} from "@/api/tech-pack-v2/tech-files-service";

// Create collection
const collection = await createTechFileCollection({
  product_idea_id: productId,
  user_id: userId,
  collection_name: "My Tech Pack",
  collection_type: "tech_pack_v2",
});

// Add files
await addFilesToCollection(collection.id, [fileId1, fileId2]);

// Update progress
await updateCollectionProgress(collection.id, 50, "processing");

// Track credits
await updateCollectionCredits(collection.id, 3); // Add 3 credits

// Get complete collection
const fullCollection = await getCollectionWithFiles(collection.id);
```

### Batch Operations

```typescript
import {
  getBatchFiles,
  getProductGenerationStats,
} from "@/api/tech-pack-v2/tech-files-service";

// Get all files from a batch
const batchFiles = await getBatchFiles("batch-12345");

// Get generation statistics
const stats = await getProductGenerationStats(productId);
// Returns: { totalFiles, totalCreditsUsed, filesByType, filesByStatus }
```

## Tech Pack Generation Orchestrator

The orchestrator coordinates complete tech pack generation with automatic collection management:

```typescript
import { generateCompleteTechPack } from "@/api/tech-pack-v2/orchestrator/tech-pack-orchestrator";

const result = await generateCompleteTechPack({
  productId,
  userId,
  revisionIds: ["rev1", "rev2", "rev3"],
  category: "apparel",
  primaryImageUrl: "https://...",
  options: {
    skipBaseViews: false,
    skipCloseUps: false,
    skipSketches: false,
    collectionName: "Winter 2025 Collection",
  },
});

console.log(`Generated collection: ${result.collectionId}`);
console.log(`Total credits used: ${result.totalCreditsUsed}`);
console.log(`Generation time: ${result.generationTimeMs}ms`);
```

## Migration Process

### 1. Apply Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually execute the SQL file
psql -h your-db-host -d your-db-name -f supabase/migrations/create_tech_files_table.sql
```

### 2. Verify Tables Created

```sql
-- Check tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'tech_%';

-- Should return:
-- tech_files
-- tech_file_versions
-- tech_file_collections
-- tech_file_collection_items
```

### 3. Test the System

```typescript
// Test creating a tech file
const testFile = await createTechFile({
  product_idea_id: "test-product",
  user_id: "test-user",
  file_type: "base_view",
  view_type: "front",
  file_url: "https://test.com/image.png",
  analysis_data: { test: true },
  credits_used: 0,
});

console.log("Tech file created:", testFile.id);
```

## File Type Reference

### Base Views (`file_type: 'base_view'`)
- Primary product images analyzed for materials, dimensions, features
- Linked to specific `revision_id` from `product_multiview_revisions`
- `view_type` must be: `'front'`, `'back'`, or `'side'`

### Close-Ups (`file_type: 'closeup'`)
- Detail shots of specific product features
- `file_category` stores the shot name (e.g., "Zipper Detail", "Fabric Texture")
- No `revision_id` (standalone generated images)

### Sketches (`file_type: 'sketch'`)
- Technical sketches with call-outs and measurements
- `view_type` indicates perspective: `'front'`, `'back'`, `'side'`
- `analysis_data` contains callouts and measurements

### Category (`file_type: 'category'`)
- Product category detection results
- Usually one per product
- Analysis data contains category, subcategory, confidence

### Complete Pack (`file_type: 'complete_pack'`)
- Final compiled tech pack (PDF, etc.)
- References collection of all component files

## Best Practices

### 1. Always Use Collections for Full Tech Packs
Collections provide:
- Automatic progress tracking
- Credit aggregation
- Easy retrieval of related files
- Status management

### 2. Set Meaningful Batch IDs
Use descriptive batch IDs for easier debugging:
```typescript
const batchId = `tech-pack-${productId}-${Date.now()}`;
```

### 3. Track Credits at Creation Time
Always specify `credits_used` when creating files:
```typescript
await createTechFile({
  // ... other fields
  credits_used: 1, // Be explicit
});
```

### 4. Use Status Updates
Update file status as processing progresses:
```typescript
// Start processing
await updateTechFileStatus(fileId, "processing");

// Complete
await updateTechFileStatus(fileId, "completed");

// Handle errors
await updateTechFileStatus(fileId, "failed", errorMessage);
```

### 5. Archive Instead of Delete
Use soft deletes for audit trail:
```typescript
await archiveTechFile(fileId); // Sets status='archived', archived_at=NOW()
```

## Performance Considerations

### Indexes
The schema includes optimized indexes for common queries:
- Product + revision lookups
- Latest version filtering
- Status-based queries
- Batch ID lookups
- Created date sorting

### Query Optimization
```typescript
// Good: Filter by is_latest for current versions
const latest = await getLatestTechFiles(productId);

// Avoid: Loading all versions when you only need latest
const all = await getTechFileVersions(fileId); // Only when needed
```

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies that:
- Users can only access their own files
- Users can only create files for themselves
- Users can update/delete their own files

### File URLs
- Store public URLs in `file_url`
- Use Supabase Storage with proper access policies
- Generate signed URLs for private files if needed

## Troubleshooting

### Files Not Appearing
Check:
1. `is_latest = true` for current versions
2. `status = 'completed'` for finished files
3. RLS policies allow user access

### Version History Issues
- Verify `create_tech_file_version` function exists
- Check trigger `archive_old_versions` is active
- Ensure `parent_file_id` chain is valid

### Collection Problems
- Verify collection exists and status is correct
- Check `tech_file_collection_items` has mappings
- Ensure foreign key constraints are satisfied

## Future Enhancements

Potential additions to the system:
- [ ] Automatic thumbnail generation
- [ ] File size tracking and optimization
- [ ] Webhook notifications on completion
- [ ] Export collections to PDF/ZIP
- [ ] Version comparison utilities
- [ ] Automated quality scoring
- [ ] Integration with storage cleanup jobs
