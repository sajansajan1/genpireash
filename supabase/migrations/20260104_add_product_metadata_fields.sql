-- Migration: Add product metadata fields to product_ideas table
-- Date: 2026-01-04
-- Description: Adds SKU, Reference Number, Target Consumer Price, and Status fields
--              These fields are editable from the product page and synced to BOM

-- Add SKU column
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS sku VARCHAR(100) DEFAULT NULL;

-- Add Reference Number column
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100) DEFAULT NULL;

-- Add Target Consumer Price column (stored in USD cents for precision)
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS target_consumer_price_usd DECIMAL(12, 2) DEFAULT NULL;

-- Add Status column with enum-like check
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';

-- Add comments describing the columns
COMMENT ON COLUMN product_ideas.sku IS 'Stock Keeping Unit - unique product identifier for inventory management';
COMMENT ON COLUMN product_ideas.reference_number IS 'Internal reference number for the product, used for tracking and organization';
COMMENT ON COLUMN product_ideas.target_consumer_price_usd IS 'Target retail price in USD, used for BOM calculations and pricing strategy';
COMMENT ON COLUMN product_ideas.status IS 'Product status: draft, in_review, approved, in_production, completed, archived';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_product_ideas_sku
ON product_ideas (sku);

CREATE INDEX IF NOT EXISTS idx_product_ideas_reference_number
ON product_ideas (reference_number);

CREATE INDEX IF NOT EXISTS idx_product_ideas_status
ON product_ideas (status);

-- Add comments for the indexes
COMMENT ON INDEX idx_product_ideas_sku IS 'Index for efficient SKU lookups';
COMMENT ON INDEX idx_product_ideas_reference_number IS 'Index for efficient reference number lookups';
COMMENT ON INDEX idx_product_ideas_status IS 'Index for filtering products by status';
