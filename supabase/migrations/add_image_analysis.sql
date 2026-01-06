-- Add image analysis storage to product_multiview_revisions table
-- This stores AI analysis of images to avoid repeated analysis calls

-- Add analysis columns to the existing table
ALTER TABLE product_multiview_revisions
ADD COLUMN IF NOT EXISTS image_analysis JSONB,
ADD COLUMN IF NOT EXISTS analysis_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS analysis_model TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pmr_image_analysis ON product_multiview_revisions(product_idea_id, view_type) 
WHERE image_analysis IS NOT NULL;

-- Create a separate table for image analysis cache (alternative approach)
CREATE TABLE IF NOT EXISTS image_analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Image identification
  image_url TEXT NOT NULL UNIQUE,
  image_hash TEXT, -- Optional: MD5 or SHA hash of image for deduplication
  
  -- Analysis data
  analysis_data JSONB NOT NULL,
  analysis_prompt TEXT,
  model_used TEXT NOT NULL DEFAULT 'gpt-4o',
  
  -- Related entities
  product_idea_id UUID REFERENCES product_ideas(id) ON DELETE SET NULL,
  revision_id UUID REFERENCES product_multiview_revisions(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiry for cache cleanup
  
  -- Analysis details
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  confidence_score FLOAT
);

-- Create indexes for performance
CREATE INDEX idx_iac_image_url ON image_analysis_cache(image_url);
CREATE INDEX idx_iac_product_idea ON image_analysis_cache(product_idea_id);
CREATE INDEX idx_iac_created_at ON image_analysis_cache(created_at DESC);
CREATE INDEX idx_iac_expires_at ON image_analysis_cache(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE image_analysis_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for image_analysis_cache
CREATE POLICY "Users can view analysis for their products"
  ON image_analysis_cache
  FOR SELECT
  USING (
    product_idea_id IN (
      SELECT id FROM product_ideas WHERE user_id = auth.uid()
    )
    OR 
    revision_id IN (
      SELECT id FROM product_multiview_revisions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analysis for their products"
  ON image_analysis_cache
  FOR INSERT
  WITH CHECK (
    product_idea_id IN (
      SELECT id FROM product_ideas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their analysis"
  ON image_analysis_cache
  FOR UPDATE
  USING (
    product_idea_id IN (
      SELECT id FROM product_ideas WHERE user_id = auth.uid()
    )
  );

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_analysis_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM image_analysis_cache
  WHERE expires_at IS NOT NULL AND expires_at < TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON image_analysis_cache TO authenticated;
GRANT ALL ON image_analysis_cache TO service_role;

-- Success message
SELECT 'Image analysis cache tables created successfully!' as status;
