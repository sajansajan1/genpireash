-- Migration: Add product_materials column to product_ideas table
-- This column stores AI-generated and user-defined material specifications for products

-- Add product_materials column to product_ideas table
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS product_materials JSONB DEFAULT NULL;

-- Add comment describing the column
COMMENT ON COLUMN product_ideas.product_materials IS 'Stores AI-recommended and user-defined material specifications. Contains recommended materials array, user-edited materials, product type, source (ai_generated/user_defined), and timestamps.';

-- Create a GIN index for efficient querying of the JSONB column
CREATE INDEX IF NOT EXISTS idx_product_ideas_product_materials
ON product_ideas USING GIN (product_materials);

-- Add comment for the index
COMMENT ON INDEX idx_product_ideas_product_materials IS 'GIN index for efficient querying of product_materials JSONB column';
