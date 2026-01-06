-- Migration to update product_multiview_revisions table to support 'top' and 'bottom' view types
-- Author: AI Designer Team
-- Date: 2025-09-22
-- Description: This migration updates the view_type constraint to allow top and bottom views

-- First, drop the existing check constraint on product_multiview_revisions
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

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE 'Successfully updated product_multiview_revisions table to support top and bottom view types';
END $$;
