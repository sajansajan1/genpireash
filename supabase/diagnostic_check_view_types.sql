-- Diagnostic script to check what view types exist in product_multiview_revisions table
-- Run this BEFORE applying the migration to understand the current state

-- 1. Show all unique view types currently in the table
SELECT DISTINCT view_type, COUNT(*) as count
FROM product_multiview_revisions
GROUP BY view_type
ORDER BY view_type;

-- 2. Show any view types that are NOT in the expected list
SELECT DISTINCT view_type, COUNT(*) as count
FROM product_multiview_revisions
WHERE view_type NOT IN ('front', 'back', 'side', 'top', 'bottom')
AND view_type IS NOT NULL
GROUP BY view_type
ORDER BY count DESC;

-- 3. Show sample records with invalid view types (limit to 10)
SELECT id, product_idea_id, view_type, edit_type, created_at
FROM product_multiview_revisions
WHERE view_type NOT IN ('front', 'back', 'side', 'top', 'bottom')
AND view_type IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check the current constraint definition
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'product_multiview_revisions_view_type_check';

-- 5. Count total records by view type to understand distribution
SELECT
    view_type,
    COUNT(*) as total_count,
    COUNT(DISTINCT product_idea_id) as unique_products,
    COUNT(DISTINCT batch_id) as unique_batches,
    MAX(created_at) as most_recent,
    MIN(created_at) as oldest
FROM product_multiview_revisions
GROUP BY view_type
ORDER BY total_count DESC;

-- 6. Check if there are any NULL view types
SELECT COUNT(*) as null_view_type_count
FROM product_multiview_revisions
WHERE view_type IS NULL;

-- 7. Show the distribution of edit_types for invalid view_types
SELECT view_type, edit_type, COUNT(*) as count
FROM product_multiview_revisions
WHERE view_type NOT IN ('front', 'back', 'side', 'top', 'bottom')
AND view_type IS NOT NULL
GROUP BY view_type, edit_type
ORDER BY count DESC;
