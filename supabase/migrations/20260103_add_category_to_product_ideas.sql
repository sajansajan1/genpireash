-- Migration: Add category columns to product_ideas table
-- category: Standardized product category (apparel, footwear, accessories, bags, jewellery, toys, hats, furniture, other)
-- category_subcategory: Detailed category with subcategories (e.g., "Plush Toy → Animal → Safari Collection")

-- Add category column to product_ideas table (standardized)
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT NULL;

-- Add category_subcategory column to product_ideas table (detailed)
ALTER TABLE product_ideas
ADD COLUMN IF NOT EXISTS category_subcategory VARCHAR(255) DEFAULT NULL;

-- Add comments describing the columns
COMMENT ON COLUMN product_ideas.category IS 'Standardized product category. Valid values: apparel, footwear, accessories, bags, jewellery, toys, hats, furniture, other. Extracted by AI during product creation and stored for consistent use throughout the application.';

COMMENT ON COLUMN product_ideas.category_subcategory IS 'Detailed category with subcategories extracted by AI. Example: "Plush Toy → Animal → Safari Collection". Used for more granular product classification and organization.';

-- Create an index for efficient filtering by category
CREATE INDEX IF NOT EXISTS idx_product_ideas_category
ON product_ideas (category);

-- Add comment for the index
COMMENT ON INDEX idx_product_ideas_category IS 'Index for efficient filtering of products by category';
