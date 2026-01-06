-- Migration: Add generation_mode column to product_ideas table
-- This column stores the AI generation style mode (regular, black_and_white, minimalist, detailed)

-- Add generation_mode column to product_ideas table with default value 'regular'
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS generation_mode VARCHAR(50) DEFAULT 'regular';

-- Add comment describing the column
COMMENT ON COLUMN product_ideas.generation_mode IS 'AI generation style mode: regular (default), black_and_white (B&W sketch style), minimalist, detailed. Used to modify AI prompts for different visual styles.';

-- Create an index for efficient filtering by generation mode
CREATE INDEX IF NOT EXISTS idx_product_ideas_generation_mode
ON product_ideas (generation_mode);

-- Add comment for the index
COMMENT ON INDEX idx_product_ideas_generation_mode IS 'Index for efficient filtering of products by generation mode';
