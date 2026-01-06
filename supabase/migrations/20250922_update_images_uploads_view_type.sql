-- Migration to update images_uploads table to support 'top' and 'bottom' view types
-- Author: AI Designer Team
-- Date: 2025-09-22

-- First, drop the existing check constraint if it exists
ALTER TABLE images_uploads
DROP CONSTRAINT IF EXISTS images_uploads_view_type_check;

-- Add the new check constraint that includes 'top' and 'bottom'
ALTER TABLE images_uploads
ADD CONSTRAINT images_uploads_view_type_check
CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom'));

-- Add comment to document the change
COMMENT ON COLUMN images_uploads.view_type IS 'View type of the image: front, back, side, top, or bottom';

-- Create index on view_type for better query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_images_uploads_view_type
ON images_uploads(view_type);

-- Create composite index for common queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_images_uploads_product_view
ON images_uploads(product_idea_id, view_type);

-- Update any existing metadata to ensure consistency (optional)
-- This ensures any legacy data is properly formatted
UPDATE images_uploads
SET metadata = COALESCE(metadata, '{}'::jsonb)
WHERE metadata IS NULL;
