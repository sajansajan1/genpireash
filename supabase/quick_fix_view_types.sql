-- QUICK FIX: Run this immediately to resolve the constraint issue
-- This script handles the duplicate key constraint and updates view types

-- Step 1: Check what we're dealing with
SELECT view_type, COUNT(*) as count
FROM product_multiview_revisions
WHERE view_type NOT IN ('front', 'back', 'side')
GROUP BY view_type;

-- Step 2: Deactivate illustrations before converting
UPDATE product_multiview_revisions
SET is_active = false
WHERE view_type = 'illustration';

-- Step 3: Delete illustration views (they're causing the conflict)
-- Since illustration isn't a valid view type anymore, we'll remove them
DELETE FROM product_multiview_revisions
WHERE view_type = 'illustration';

-- Alternative Step 3: If you want to keep illustration data, uncomment this instead:
-- UPDATE product_multiview_revisions
-- SET metadata = jsonb_set(
--         COALESCE(metadata, '{}'::jsonb),
--         '{archived_illustration}',
--         'true'
--     ),
--     is_deleted = true,
--     deleted_at = NOW()
-- WHERE view_type = 'illustration';

-- Step 4: Drop and recreate the constraint
ALTER TABLE product_multiview_revisions
DROP CONSTRAINT IF EXISTS product_multiview_revisions_view_type_check;

ALTER TABLE product_multiview_revisions
ADD CONSTRAINT product_multiview_revisions_view_type_check
CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom'));

-- Step 5: Verify the fix
SELECT 'Constraint updated successfully!' as status,
       COUNT(DISTINCT view_type) as unique_view_types,
       string_agg(DISTINCT view_type, ', ' ORDER BY view_type) as valid_types
FROM product_multiview_revisions
WHERE view_type IS NOT NULL;
