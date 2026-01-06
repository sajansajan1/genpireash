# UPDATE: Add Top and Bottom View Types

## URGENT: Run this migration in your Supabase SQL Editor

This migration updates the `images_uploads` table to support 'top' and 'bottom' view types for 5-view product images.

### Steps to apply:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire SQL script below
4. Click "Run" to execute

### SQL Migration Script:

\`\`\`sql
-- Update images_uploads table to support 'top' and 'bottom' view types
-- This is needed for the 5-view product image system

-- First, drop the existing check constraint
ALTER TABLE public.images_uploads
DROP CONSTRAINT IF EXISTS images_uploads_view_type_check;

-- Add the new check constraint that includes 'top' and 'bottom'
ALTER TABLE public.images_uploads
ADD CONSTRAINT images_uploads_view_type_check
CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom'));

-- Add comment to document the change
COMMENT ON COLUMN public.images_uploads.view_type IS 'View type of the image: front, back, side, top, or bottom';

-- Create index on view_type for better query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_images_uploads_view_type
ON public.images_uploads(view_type);

-- Create composite index for common queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_images_uploads_product_view
ON public.images_uploads(product_idea_id, view_type);

-- Update any existing metadata to ensure consistency
UPDATE public.images_uploads
SET metadata = COALESCE(metadata, '{}'::jsonb)
WHERE metadata IS NULL;

-- Verify the constraint was updated
SELECT conname, consrc
FROM pg_constraint
WHERE conrelid = 'public.images_uploads'::regclass
AND contype = 'c';
\`\`\`

### After running:

1. The constraint should now allow 'top' and 'bottom' as valid view_type values
2. Test by generating a 5-view product in AI Designer
3. Verify all 5 views are saved to the images_uploads table
4. Check the table data to confirm records are being inserted for top/bottom views

### What this fixes:

- Error: "new row for relation 'images_uploads' violates check constraint 'images_uploads_view_type_check'"
- Allows saving of top and bottom view images
- Enables full 5-view support in the AI Designer

### Verification Query:

Run this query to verify the constraint allows all 5 view types:

\`\`\`sql
-- Test the constraint with all view types
SELECT
    'front' AS test_value,
    'front' IN ('front', 'back', 'side', 'top', 'bottom') AS is_valid
UNION ALL
SELECT 'back', 'back' IN ('front', 'back', 'side', 'top', 'bottom')
UNION ALL
SELECT 'side', 'side' IN ('front', 'back', 'side', 'top', 'bottom')
UNION ALL
SELECT 'top', 'top' IN ('front', 'back', 'side', 'top', 'bottom')
UNION ALL
SELECT 'bottom', 'bottom' IN ('front', 'back', 'side', 'top', 'bottom');
\`\`\`

All rows should return `true` in the `is_valid` column.

### Rollback (if needed):

If you need to rollback this change:

\`\`\`sql
-- Rollback to original 3-view constraint
ALTER TABLE public.images_uploads
DROP CONSTRAINT IF EXISTS images_uploads_view_type_check;

ALTER TABLE public.images_uploads
ADD CONSTRAINT images_uploads_view_type_check
CHECK (view_type IN ('front', 'back', 'side'));
\`\`\`

---

**IMPORTANT:** Apply this migration immediately to fix the saving issue for top and bottom views in the AI Designer module.
