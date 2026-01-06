# Revision-Based Tech File Storage

## Overview

The tech pack system now properly stores and retrieves files based on both **product ID** and **revision ID**, allowing users to have different tech packs for different revisions of the same product.

## How It Works

### 1. Storage Strategy

Every tech file (base views, closeups, sketches) is stored with:
- `product_idea_id` - Links to the product
- `revision_id` - Links to the specific multiview revision
- `file_type` - Type of file (base_view, closeup, sketch)
- `view_type` - For sketches/base views (front, back, side)
- `is_latest` - Flag to quickly query latest version

### 2. Data Flow

#### **Initial Generation**
```
User selects revision → Generate Tech Pack
    ↓
1. Analyze base views (stores revision_id from product_multiview_revisions)
2. Generate closeups (uses primary revision_id from front view)
3. Generate sketches (uses primary revision_id from front view)
    ↓
All files stored with revision_id
```

#### **Loading Existing Data**
```
User selects revision → Check for existing tech pack
    ↓
Query: tech_files WHERE product_idea_id = X AND revision_id = Y AND is_latest = true
    ↓
If found: Load existing data
If not found: Show "Generate" button
```

#### **Switching Revisions**
```
User switches to different revision
    ↓
1. Clear current store
2. Load tech files for new revision_id
3. If no files found → Show initial generate state
```

## Database Schema

```sql
CREATE TABLE tech_files (
  id UUID PRIMARY KEY,
  product_idea_id UUID NOT NULL,     -- Product reference
  revision_id UUID,                  -- Revision reference (nullable)
  file_type VARCHAR(50) NOT NULL,    -- 'base_view', 'closeup', 'sketch'
  view_type VARCHAR(20),             -- 'front', 'back', 'side'
  file_url TEXT NOT NULL,
  is_latest BOOLEAN DEFAULT true,
  -- ... other fields
);

-- Index for fast querying
CREATE INDEX idx_tech_files_product_revision
ON tech_files(product_idea_id, revision_id);
```

## API Endpoints

### Generate Complete Tech Pack
**POST** `/api/tech-pack-v2/generate-complete`
- Takes: productId, revisionIds, category, primaryImageUrl
- Stores all files with revision context
- Uses orchestrator for proper revision ID propagation

### Get Existing Files
**POST** `/api/tech-pack-v2/get-existing-files`
- Takes: productId, revisionId (single selected revision)
- Returns: All latest tech files for that product + revision combination
- Used to check if tech pack exists before showing generate button

### Generate Individual Components
All generation endpoints now properly handle revision IDs:
- `/api/tech-pack-v2/analyze-base-views` - Stores view's own revision_id
- `/api/tech-pack-v2/generate-closeups` - Stores primary (front view) revision_id
- `/api/tech-pack-v2/generate-sketches` - Stores primary (front view) revision_id

## Client Implementation

### TechPackV2Client

```typescript
class TechPackV2Client {
  // Generate complete tech pack with revision context
  async generateComplete(productId, revisionIds, primaryImageUrl) {
    // Passes revision IDs through entire pipeline
    // All generated files linked to these revisions
  }

  // Load existing tech files for specific revision
  async loadExistingTechFiles(productId, revisionId) {
    // Queries tech_files by product_id AND revision_id
    // Populates store if data exists
    // Returns hasExistingData: true/false
  }

  // Regenerate with revision context
  async regenerateAllSketches(productId, category, baseViews) {
    // Uses baseViews array which includes revision IDs
    // New sketches linked to same revisions
  }
}
```

### Hook Integration

```typescript
// In useTechPackGeneration hook
useEffect(() => {
  // When revisionId changes, load existing data
  techPackV2Client.loadExistingTechFiles(productId, revisionId)
    .then(result => {
      if (!result.hasExistingData) {
        // Show "Generate Tech Pack" button
      }
      // Otherwise data is already in store
    });
}, [productId, revisionId]);
```

## Key Points

### ✅ Revision ID Propagation

All generation functions now properly propagate revision IDs:

1. **Base Views**: Each view stores its own `revision_id` from `product_multiview_revisions`
2. **Closeups**: Store `primaryRevisionId` from the front view (or first available)
3. **Sketches**: Store `primaryRevisionId` from the front view (or first available)

### ✅ Product Analysis Structure

When passing data to sketch generation, we now use:

```typescript
const productAnalysis = {
  base_views: baseViews.map(bv => ({
    view_type: bv.viewType,
    image_url: bv.imageUrl,
    analysis: bv.analysisData,
    revision_id: bv.revisionId,  // ← Critical for linking
  })),
};
```

### ✅ Query Strategy

To get files for a specific revision:

```typescript
// Service layer
const files = await getLatestTechFiles(productId, {
  fileType: 'sketch',
  revisionId: primaryRevisionId,  // ← Filters by revision
});
```

## Usage Example

### Scenario: User has multiple design iterations

```
Product: "Summer Dress"
├── Revision 1 (Initial design)
│   ├── Tech Pack 1
│   │   ├── Base views (revision_id: rev1)
│   │   ├── Closeups (revision_id: rev1)
│   │   └── Sketches (revision_id: rev1)
│
├── Revision 2 (Updated colors)
│   ├── Tech Pack 2
│   │   ├── Base views (revision_id: rev2)
│   │   ├── Closeups (revision_id: rev2)
│   │   └── Sketches (revision_id: rev2)
│
└── Revision 3 (Final production)
    └── Tech Pack 3 (to be generated)
```

When user switches to Revision 2:
1. UI calls `loadExistingTechFiles(productId, rev2)`
2. Backend queries `tech_files WHERE product_idea_id = productId AND revision_id = rev2`
3. Returns Tech Pack 2 data
4. Store populated, user sees existing tech pack

When user switches to Revision 3:
1. UI calls `loadExistingTechFiles(productId, rev3)`
2. No files found
3. Returns `hasExistingData: false`
4. UI shows "Generate Tech Pack" button

## Benefits

1. **Isolated Tech Packs**: Each revision has its own complete tech pack
2. **No Data Loss**: Switching revisions doesn't overwrite existing data
3. **Fast Loading**: Indexed queries make retrieval instant
4. **Clear State**: UI knows exactly when to show generate vs. view mode
5. **Credit Efficiency**: Don't regenerate what already exists

## Migration Notes

If you have existing tech files without `revision_id`:
- They will still be queryable by `product_idea_id` alone
- `revision_id IS NULL` can be used to find orphaned files
- Can bulk-update if needed by matching to `product_multiview_revisions`
