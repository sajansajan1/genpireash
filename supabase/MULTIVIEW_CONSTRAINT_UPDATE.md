# Product Multiview Revisions - View Type Constraint Update

## Issue
The `product_multiview_revisions` table has a CHECK constraint that only allows 'front', 'back', and 'side' view types. This prevents saving 'top' and 'bottom' views, causing a 400 error:

\`\`\`
Error: new row for relation "product_multiview_revisions" violates check constraint "product_multiview_revisions_view_type_check"
\`\`\`

## Solution
We need to update the CHECK constraint on the `product_multiview_revisions` table to include 'top' and 'bottom' view types.

## Migration Files

### 1. `20250922_update_images_uploads_view_type.sql`
- Updates the `images_uploads` table to support top and bottom views
- Already created and should be applied

### 2. `20250922_update_multiview_revisions_view_type.sql`
- Updates the `product_multiview_revisions` table to support top and bottom views
- **NEEDS TO BE APPLIED TO DATABASE**

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)
\`\`\`bash
# Make sure you're in the project root
cd /path/to/genpire-pjt/Genpire

# Run the migration
supabase migration up
\`\`\`

### Option 2: Manual Application via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20250922_update_multiview_revisions_view_type.sql`
4. Paste and execute in the SQL editor

### Option 3: Direct SQL Execution
If you have direct database access, run:
\`\`\`sql
-- Drop existing constraint
ALTER TABLE product_multiview_revisions
DROP CONSTRAINT IF EXISTS product_multiview_revisions_view_type_check;

-- Add new constraint including top and bottom
ALTER TABLE product_multiview_revisions
ADD CONSTRAINT product_multiview_revisions_view_type_check
CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom'));
\`\`\`

## Verification
After applying the migration, verify it worked:
\`\`\`sql
-- Check the constraint definition
SELECT conname, contype, consrc
FROM pg_constraint
WHERE conname = 'product_multiview_revisions_view_type_check';

-- Test inserting a top view (should succeed after migration)
-- This is just a test, don't actually insert test data in production
\`\`\`

## Impact
- This change is backward compatible
- Existing data with 'front', 'back', 'side' views will continue to work
- New records can now be created with 'top' and 'bottom' view types
- The AI Designer can now save all 5 views properly

## Related Code Changes
The application code has already been updated to handle all 5 view types:
- `modules/ai-designer/components/RevisionHistory/index.tsx` - displays all 5 views
- `app/ai-designer/page.tsx` - saves all 5 views
- `app/actions/ai-image-edit-new-table.ts` - processes all 5 views

## Rollback (if needed)
If you need to rollback this change:
\`\`\`sql
ALTER TABLE product_multiview_revisions
DROP CONSTRAINT IF EXISTS product_multiview_revisions_view_type_check;

ALTER TABLE product_multiview_revisions
ADD CONSTRAINT product_multiview_revisions_view_type_check
CHECK (view_type IN ('front', 'back', 'side'));
\`\`\`
Note: Only rollback if there are no existing 'top' or 'bottom' records in the table.
