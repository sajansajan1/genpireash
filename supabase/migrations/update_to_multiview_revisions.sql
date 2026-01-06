-- Update product_image_revisions table to support multi-view revisions
-- This migration updates the existing schema to handle all views together

-- First, drop the existing unique constraint that was per view
DROP INDEX IF EXISTS idx_unique_active_revision;

-- Alter the table to support multiple views in one revision
ALTER TABLE product_image_revisions 
DROP COLUMN IF EXISTS view_type CASCADE,
DROP COLUMN IF EXISTS image_url CASCADE,
DROP COLUMN IF EXISTS thumbnail_url CASCADE;

-- Add new columns for multi-view support
ALTER TABLE product_image_revisions
ADD COLUMN IF NOT EXISTS views JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS analysis_prompt TEXT,
ADD COLUMN IF NOT EXISTS enhanced_prompt TEXT;

-- Views JSON structure will be:
-- {
--   "front": {
--     "imageUrl": "...",
--     "thumbnailUrl": "..."
--   },
--   "back": {
--     "imageUrl": "...",
--     "thumbnailUrl": "..."
--   },
--   "side": {
--     "imageUrl": "...",
--     "thumbnailUrl": "..."
--   }
-- }

-- Create new unique constraint for active revision per product
CREATE UNIQUE INDEX idx_unique_active_revision_per_product 
ON product_image_revisions(product_idea_id, is_active) 
WHERE is_active = true;

-- Update the comment on the table
COMMENT ON TABLE product_image_revisions IS 'Stores revision history for product images - all views together';
COMMENT ON COLUMN product_image_revisions.views IS 'JSON object containing URLs for all views (front, back, side)';
COMMENT ON COLUMN product_image_revisions.analysis_prompt IS 'AI analysis of the current state before edit';
COMMENT ON COLUMN product_image_revisions.enhanced_prompt IS 'Enhanced version of user prompt for better results';

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own image revisions" ON product_image_revisions;
DROP POLICY IF EXISTS "Users can create their own image revisions" ON product_image_revisions;
DROP POLICY IF EXISTS "Users can update their own image revisions" ON product_image_revisions;

-- Recreate RLS policies
CREATE POLICY "Users can view their own revisions" ON product_image_revisions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revisions" ON product_image_revisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revisions" ON product_image_revisions
  FOR UPDATE USING (auth.uid() = user_id);

-- Update trigger function for revision numbering
CREATE OR REPLACE FUNCTION set_revision_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.revision_number IS NULL THEN
    SELECT COALESCE(MAX(revision_number), -1) + 1
    INTO NEW.revision_number
    FROM product_image_revisions
    WHERE product_idea_id = NEW.product_idea_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS set_revision_number_trigger ON product_image_revisions;
CREATE TRIGGER set_revision_number_trigger
  BEFORE INSERT ON product_image_revisions
  FOR EACH ROW
  EXECUTE FUNCTION set_revision_number();
