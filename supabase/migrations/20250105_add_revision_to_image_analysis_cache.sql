-- Add revision tracking columns to image_analysis_cache table
ALTER TABLE image_analysis_cache 
ADD COLUMN IF NOT EXISTS revision_id UUID REFERENCES product_multiview_revisions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS revision_number INTEGER;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_image_analysis_cache_revision_id ON image_analysis_cache(revision_id);
CREATE INDEX IF NOT EXISTS idx_image_analysis_cache_product_revision ON image_analysis_cache(product_idea_id, revision_number);

-- Add comment to document the columns
COMMENT ON COLUMN image_analysis_cache.revision_id IS 'Reference to the product_multiview_revisions table for tracking which revision this analysis belongs to';
COMMENT ON COLUMN image_analysis_cache.revision_number IS 'The revision number for easier querying and display';
