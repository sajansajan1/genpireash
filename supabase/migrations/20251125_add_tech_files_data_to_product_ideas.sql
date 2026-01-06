-- Migration: Add tech_files_data column to product_ideas table
-- Purpose: Store aggregated tech files (sketches & closeups) data with the product
-- Date: 2025-11-25

-- Add tech_files_data column to product_ideas table
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS tech_files_data JSONB DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN product_ideas.tech_files_data IS 'Aggregated technical files data including sketches (with callouts, measurements, summaries) and closeups (with analysis data and summaries). Fetched from tech_files table.';

-- Create index for better query performance on tech_files_data
CREATE INDEX IF NOT EXISTS idx_product_ideas_tech_files_data
ON product_ideas USING GIN (tech_files_data);

-- Add comment to explain the index
COMMENT ON INDEX idx_product_ideas_tech_files_data IS 'GIN index for efficient querying of tech_files_data JSONB column';
