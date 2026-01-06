# Tech Files System - Quick Reference

## 🚀 Quick Start

### Generate Complete Tech Pack
```typescript
import { generateCompleteTechPack } from "@/api/tech-pack-v2/orchestrator/tech-pack-orchestrator";

const result = await generateCompleteTechPack({
  productId: "prod-123",
  userId: "user-456",
  revisionIds: ["rev-1", "rev-2"],
  category: "apparel",
  primaryImageUrl: "https://...",
});
```

### Get Existing Tech Pack
```typescript
import { getExistingTechPack } from "@/api/tech-pack-v2/orchestrator/tech-pack-orchestrator";

const techPack = await getExistingTechPack("prod-123");
```

## 📁 File Types

| Type | Description | View Types | Credits |
|------|-------------|------------|---------|
| `base_view` | Product analysis | front, back, side | 1 |
| `closeup` | Detail shots | - | 1 |
| `sketch` | Technical sketches | front, back, side | 1 |
| `category` | Category detection | - | 0 |
| `complete_pack` | Final compiled pack | - | 0 |

## 🔧 Common Operations

### Create a Tech File
```typescript
import { createTechFile } from "@/api/tech-pack-v2/tech-files-service";

const file = await createTechFile({
  product_idea_id: productId,
  user_id: userId,
  file_type: "base_view",
  view_type: "front",
  file_url: imageUrl,
  analysis_data: { /* your analysis */ },
  credits_used: 1,
});
```

### Get Latest Files
```typescript
import { getLatestTechFiles } from "@/api/tech-pack-v2/tech-files-service";

// All latest files
const allFiles = await getLatestTechFiles(productId);

// Filter by type
const baseViews = await getLatestTechFiles(productId, {
  fileType: "base_view",
});

// Filter by view
const frontViews = await getLatestTechFiles(productId, {
  fileType: "base_view",
  viewType: "front",
});
```

### Create a Collection
```typescript
import {
  createTechFileCollection,
  addFilesToCollection,
} from "@/api/tech-pack-v2/tech-files-service";

const collection = await createTechFileCollection({
  product_idea_id: productId,
  user_id: userId,
  collection_name: "My Tech Pack",
  collection_type: "tech_pack_v2",
});

await addFilesToCollection(collection.id, [file1.id, file2.id]);
```

### Create a Version
```typescript
import { createTechFileVersion } from "@/api/tech-pack-v2/tech-files-service";

const versionId = await createTechFileVersion(
  fileId,
  userId,
  "Updated materials based on feedback"
);
```

### Update Status
```typescript
import { updateTechFileStatus } from "@/api/tech-pack-v2/tech-files-service";

await updateTechFileStatus(fileId, "completed");
await updateTechFileStatus(fileId, "failed", "Error message");
```

## 📊 Analytics

### Get Product Stats
```typescript
import { getProductGenerationStats } from "@/api/tech-pack-v2/tech-files-service";

const stats = await getProductGenerationStats(productId);
// { totalFiles, totalCreditsUsed, filesByType, filesByStatus }
```

### Get Batch Files
```typescript
import { getBatchFiles } from "@/api/tech-pack-v2/tech-files-service";

const files = await getBatchFiles("batch-12345");
```

## 🗄️ Database Queries

### Latest Files for Product
```sql
SELECT *
FROM tech_files
WHERE product_idea_id = 'prod-123'
  AND is_latest = true
ORDER BY created_at DESC;
```

### Files by Type
```sql
SELECT *
FROM tech_files
WHERE product_idea_id = 'prod-123'
  AND file_type = 'base_view'
  AND is_latest = true;
```

### Collection with Files
```sql
SELECT
  c.*,
  json_agg(f.*) as files
FROM tech_file_collections c
LEFT JOIN tech_file_collection_items ci ON ci.collection_id = c.id
LEFT JOIN tech_files f ON f.id = ci.tech_file_id
WHERE c.id = 'collection-id'
GROUP BY c.id;
```

### Version History
```sql
SELECT *
FROM tech_file_versions
WHERE tech_file_id = 'file-id'
ORDER BY version_number DESC;
```

## 🎯 Status Values

### Tech File Status
- `processing` - Currently generating
- `completed` - Successfully generated
- `failed` - Generation failed
- `archived` - Soft deleted

### Collection Status
- `processing` - Generation in progress
- `completed` - All files generated
- `failed` - Generation failed
- `partial` - Some files generated

## 💰 Credit Costs

| Operation | Credits |
|-----------|---------|
| Base view analysis | 1 per view |
| Closeup generation | 1 per closeup |
| Sketch generation | 1 per sketch |
| Category detection | Included in base views |
| Complete tech pack | Sum of all components |

**Typical Complete Tech Pack:**
- 3 base views = 3 credits
- 3 closeups = 3 credits
- 3 sketches = 3 credits
- **Total: ~9-10 credits**

## 🔐 Security

### Row Level Security
All tables have RLS enabled:
```sql
-- Users can only access their own files
auth.uid() = user_id
```

### File Access
```typescript
// Public file
const publicUrl = file.file_url;

// Private file (if using signed URLs)
const { data } = await supabase.storage
  .from('bucket')
  .createSignedUrl(path, 3600);
```

## 📝 TypeScript Types

```typescript
import type {
  TechFile,
  TechFileVersion,
  TechFileCollection,
  TechFileType,
  TechFileViewType,
  TechFileStatus,
  CollectionType,
  CreateTechFileInput,
} from "@/api/tech-pack-v2/tech-files-service";
```

## ⚠️ Common Pitfalls

### ❌ Don't: Query without is_latest filter
```typescript
// Slow - returns all versions
const files = await supabase.from('tech_files').select('*');
```

### ✅ Do: Use service layer or filter
```typescript
// Fast - uses index
const files = await getLatestTechFiles(productId);

// Or manually with filter
const { data } = await supabase
  .from('tech_files')
  .select('*')
  .eq('is_latest', true);
```

### ❌ Don't: Hard delete files
```typescript
// Bad - loses audit trail
await supabase.from('tech_files').delete().eq('id', fileId);
```

### ✅ Do: Archive instead
```typescript
// Good - maintains history
await archiveTechFile(fileId);
```

### ❌ Don't: Forget credits tracking
```typescript
// Missing credits
await createTechFile({ /* ... */, credits_used: 0 });
```

### ✅ Do: Always specify credits
```typescript
// Correct
await createTechFile({ /* ... */, credits_used: 1 });
```

## 🐛 Debugging

### Check file status
```sql
SELECT
  file_type,
  status,
  COUNT(*) as count,
  SUM(credits_used) as total_credits
FROM tech_files
WHERE product_idea_id = 'prod-123'
GROUP BY file_type, status;
```

### Check collection progress
```sql
SELECT
  collection_name,
  status,
  completion_percentage,
  total_credits_used,
  created_at
FROM tech_file_collections
WHERE product_idea_id = 'prod-123'
ORDER BY created_at DESC;
```

### Find failed files
```sql
SELECT
  file_type,
  view_type,
  error_message,
  created_at
FROM tech_files
WHERE status = 'failed'
  AND product_idea_id = 'prod-123';
```

## 📚 Full Documentation

- **Complete Guide**: [TECH_FILES_README.md](./TECH_FILES_README.md)
- **Migration**: [MIGRATION_GUIDE.md](../supabase/migrations/MIGRATION_GUIDE.md)
- **Implementation Summary**: [TECH_FILES_IMPLEMENTATION_SUMMARY.md](../TECH_FILES_IMPLEMENTATION_SUMMARY.md)

## 🆘 Need Help?

1. Check the full documentation
2. Review the implementation summary
3. Look at existing code examples
4. Check Supabase logs for errors
5. Verify RLS policies if permission denied

## 🎉 Pro Tips

1. **Use collections** for complete tech packs
2. **Track credits** at file creation time
3. **Archive instead of delete** for audit trail
4. **Use batch IDs** for related generations
5. **Check cache** before generating
6. **Monitor status** during generation
7. **Use indexes** - filter by `is_latest`
8. **Type safety** - import TypeScript types
