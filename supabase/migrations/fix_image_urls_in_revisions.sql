-- Fix image_url column to contain only URL strings, not JSON objects
-- This updates existing rows where image_url contains JSON data

UPDATE product_multiview_revisions
SET 
  image_url = (image_url::jsonb->>'url')::text,
  thumbnail_url = CASE 
    WHEN thumbnail_url IS NOT NULL AND thumbnail_url LIKE '{%' 
    THEN (thumbnail_url::jsonb->>'url')::text
    ELSE thumbnail_url
  END
WHERE 
  image_url LIKE '{%' 
  AND image_url::jsonb ? 'url';

-- Verify the fix
-- SELECT id, view_type, image_url, thumbnail_url 
-- FROM product_multiview_revisions 
-- WHERE image_url LIKE 'http%' 
-- LIMIT 10;
