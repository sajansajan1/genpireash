-- Safe migration to update product_multiview_revisions table to support 'top' and 'bottom' view types
-- Author: AI Designer Team
-- Date: 2025-09-22
-- Description: This migration safely updates the view_type constraint after checking existing data

-- First, let's check what view types currently exist in the table
DO $$
DECLARE
    invalid_count INTEGER;
    invalid_types TEXT;
BEGIN
    -- Count rows with invalid view types
    SELECT COUNT(*), string_agg(DISTINCT view_type, ', ')
    INTO invalid_count, invalid_types
    FROM product_multiview_revisions
    WHERE view_type NOT IN ('front', 'back', 'side', 'top', 'bottom')
    AND view_type IS NOT NULL;

    IF invalid_count > 0 THEN
        RAISE NOTICE 'Found % rows with invalid view types: %', invalid_count, invalid_types;
        RAISE NOTICE 'These will be updated to NULL or deleted based on your preference';
    END IF;
END $$;

-- Option 1: Update any invalid view types to NULL (uncomment if needed)
-- UPDATE product_multiview_revisions
-- SET view_type = NULL
-- WHERE view_type NOT IN ('front', 'back', 'side', 'top', 'bottom')
-- AND view_type IS NOT NULL;

-- Option 2: Delete rows with invalid view types (uncomment if needed)
-- DELETE FROM product_multiview_revisions
-- WHERE view_type NOT IN ('front', 'back', 'side', 'top', 'bottom')
-- AND view_type IS NOT NULL;

-- Option 3: Update specific invalid view types to valid ones
-- For example, if there are 'illustration' view types, you might want to handle them
UPDATE product_multiview_revisions
SET view_type = 'side'  -- or another appropriate mapping
WHERE view_type = 'illustration';

-- Update any other known invalid types
UPDATE product_multiview_revisions
SET view_type = 'front'  -- fallback to front
WHERE view_type IS NOT NULL
AND view_type NOT IN ('front', 'back', 'side', 'top', 'bottom');

-- Now, drop the existing check constraint
ALTER TABLE product_multiview_revisions
DROP CONSTRAINT IF EXISTS product_multiview_revisions_view_type_check;

-- Add the new check constraint that includes 'top' and 'bottom'
ALTER TABLE product_multiview_revisions
ADD CONSTRAINT product_multiview_revisions_view_type_check
CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom'));

-- Add comment to document the change
COMMENT ON COLUMN product_multiview_revisions.view_type IS 'View type of the image: front, back, side, top, or bottom';

-- Create index on view_type for better query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_product_multiview_revisions_view_type
ON product_multiview_revisions(view_type);

-- Create composite index for common queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_product_multiview_revisions_product_view
ON product_multiview_revisions(product_idea_id, view_type);

-- Create composite index for batch queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_product_multiview_revisions_batch
ON product_multiview_revisions(batch_id, view_type);

-- Update any existing metadata to ensure consistency (optional)
UPDATE product_multiview_revisions
SET metadata = COALESCE(metadata, '{}'::jsonb)
WHERE metadata IS NULL;

-- Final verification
DO $$
DECLARE
    final_count INTEGER;
    final_types TEXT;
BEGIN
    -- Count unique view types after migration
    SELECT COUNT(DISTINCT view_type), string_agg(DISTINCT view_type, ', ' ORDER BY view_type)
    INTO final_count, final_types
    FROM product_multiview_revisions
    WHERE view_type IS NOT NULL;

    RAISE NOTICE 'Migration complete. Found % unique view types: %', final_count, final_types;
    RAISE NOTICE 'Successfully updated product_multiview_revisions table to support top and bottom view types';
END $$;
