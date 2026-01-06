-- Migration: Add selected_revision_id column to product_ideas table
-- Purpose: Track which revision was used for the last tech pack generation
-- Date: 2025-11-30

-- Add selected_revision_id column to product_ideas table
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS selected_revision_id UUID DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN product_ideas.selected_revision_id IS 'The revision ID that was used for the last tech pack/product generation. This helps track which revision the tech_files_data belongs to.';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_product_ideas_selected_revision_id
ON product_ideas (selected_revision_id);

-- Add comment to explain the index
COMMENT ON INDEX idx_product_ideas_selected_revision_id IS 'Index for efficient querying by selected_revision_id';
