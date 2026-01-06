-- Safe migration to update product_multiview_revisions table handling duplicates and constraints
-- Author: AI Designer Team
-- Date: 2025-09-22
-- Description: This migration safely updates view types and handles unique constraint conflicts

-- Step 1: Identify what view types exist
DO $$
DECLARE
    invalid_count INTEGER;
    invalid_types TEXT;
BEGIN
    RAISE NOTICE 'Starting migration to update view type constraints...';

    -- Count rows with invalid view types
    SELECT COUNT(*), string_agg(DISTINCT view_type, ', ')
    INTO invalid_count, invalid_types
    FROM product_multiview_revisions
    WHERE view_type NOT IN ('front', 'back', 'side', 'top', 'bottom')
    AND view_type IS NOT NULL;

    IF invalid_count > 0 THEN
        RAISE NOTICE 'Found % rows with view types to update: %', invalid_count, invalid_types;
    ELSE
        RAISE NOTICE 'No invalid view types found';
    END IF;
END $$;

-- Step 2: Before updating view types, deactivate any that would cause conflicts
-- Deactivate 'illustration' revisions before converting them to 'side'
UPDATE product_multiview_revisions
SET is_active = false
WHERE view_type = 'illustration'
AND is_active = true;

-- Also deactivate any existing 'side' views for products that have 'illustration' views
-- This prevents unique constraint violations
UPDATE product_multiview_revisions r1
SET is_active = false
WHERE r1.view_type = 'side'
AND r1.is_active = true
AND EXISTS (
    SELECT 1
    FROM product_multiview_revisions r2
    WHERE r2.product_idea_id = r1.product_idea_id
    AND r2.view_type = 'illustration'
);

-- Step 3: Delete or update invalid view types
-- Option A: Delete illustration views (uncomment if you want to delete instead of convert)
-- DELETE FROM product_multiview_revisions
-- WHERE view_type = 'illustration';

-- Option B: Convert illustration to a dedicated view (if you want to keep them separate)
-- First, let's just delete duplicates if they exist
DELETE FROM product_multiview_revisions
WHERE view_type = 'illustration'
AND id NOT IN (
    SELECT MIN(id)
    FROM product_multiview_revisions
    WHERE view_type = 'illustration'
    GROUP BY product_idea_id, batch_id
);

-- Now update illustration to side (or you can delete them entirely)
UPDATE product_multiview_revisions
SET view_type = 'side',
    is_active = false,  -- Keep them inactive to avoid conflicts
    metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{original_view_type}',
        '"illustration"'
    )
WHERE view_type = 'illustration';

-- Handle any other unexpected view types by deleting them
DELETE FROM product_multiview_revisions
WHERE view_type NOT IN ('front', 'back', 'side', 'top', 'bottom')
AND view_type IS NOT NULL;

-- Step 4: Drop and recreate the check constraint
ALTER TABLE product_multiview_revisions
DROP CONSTRAINT IF EXISTS product_multiview_revisions_view_type_check;

-- Add the new check constraint
ALTER TABLE product_multiview_revisions
ADD CONSTRAINT product_multiview_revisions_view_type_check
CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom'));

-- Step 5: Ensure only one active revision per product/view combination
-- Fix any remaining duplicates by keeping only the most recent active revision
WITH ranked_revisions AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY product_idea_id, view_type
               ORDER BY created_at DESC
           ) as rn
    FROM product_multiview_revisions
    WHERE is_active = true
)
UPDATE product_multiview_revisions
SET is_active = false
WHERE id IN (
    SELECT id
    FROM ranked_revisions
    WHERE rn > 1
);

-- Step 6: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_product_multiview_revisions_view_type
ON product_multiview_revisions(view_type);

CREATE INDEX IF NOT EXISTS idx_product_multiview_revisions_product_view
ON product_multiview_revisions(product_idea_id, view_type);

CREATE INDEX IF NOT EXISTS idx_product_multiview_revisions_batch
ON product_multiview_revisions(batch_id, view_type);

-- Step 7: Add comment to document the change
COMMENT ON COLUMN product_multiview_revisions.view_type IS 'View type of the image: front, back, side, top, or bottom';

-- Step 8: Final verification
DO $$
DECLARE
    final_count INTEGER;
    final_types TEXT;
    active_duplicates INTEGER;
BEGIN
    -- Check final view types
    SELECT COUNT(DISTINCT view_type), string_agg(DISTINCT view_type, ', ' ORDER BY view_type)
    INTO final_count, final_types
    FROM product_multiview_revisions
    WHERE view_type IS NOT NULL;

    RAISE NOTICE 'Migration complete. Found % unique view types: %', final_count, final_types;

    -- Check for any remaining active duplicates
    SELECT COUNT(*)
    INTO active_duplicates
    FROM (
        SELECT product_idea_id, view_type, COUNT(*) as cnt
        FROM product_multiview_revisions
        WHERE is_active = true
        GROUP BY product_idea_id, view_type
        HAVING COUNT(*) > 1
    ) duplicates;

    IF active_duplicates > 0 THEN
        RAISE WARNING 'Found % product/view combinations with multiple active revisions', active_duplicates;
    ELSE
        RAISE NOTICE 'No duplicate active revisions found - constraint satisfied';
    END IF;

    RAISE NOTICE 'Successfully updated product_multiview_revisions table to support top and bottom view types';
END $$;
