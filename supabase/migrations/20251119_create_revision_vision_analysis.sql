-- Vision Analysis Cache for Product Revisions
-- Created: 2025-11-19
-- Purpose: Cache Vision API analysis results for front view images to reduce API calls and improve performance
-- Impact: ZERO - Creates new table only, does not modify existing data or functionality

-- Drop table if exists (safe for re-running migration)
DROP TABLE IF EXISTS revision_vision_analysis CASCADE;

-- Create the revision_vision_analysis table
CREATE TABLE revision_vision_analysis (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Foreign keys (compatible with existing schema)
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revision_id UUID REFERENCES product_multiview_revisions(id) ON DELETE CASCADE,

  -- Generic view reference (supports front, back, side, detail views)
  view_type TEXT NOT NULL CHECK (view_type IN ('front', 'back', 'side', 'detail', 'other')),
  view_approval_id UUID, -- Generic reference to any view approval record

  -- Image identification (for cache lookup)
  image_url TEXT NOT NULL,
  image_hash TEXT, -- Optional hash for deduplication

  -- Vision analysis results (JSONB for flexibility)
  analysis_data JSONB NOT NULL,
  analysis_prompt TEXT,

  -- AI model metadata
  model_used TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  confidence_score FLOAT,

  -- Session tracking (links to workflows)
  session_id UUID,
  batch_id TEXT, -- Links to product_multiview_revisions.batch_id

  -- Status tracking
  status TEXT DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional TTL for cache

  -- Metadata for extensibility
  metadata JSONB
);

-- Create indexes for fast lookups
CREATE INDEX idx_rva_product_idea ON revision_vision_analysis(product_idea_id);
CREATE INDEX idx_rva_user ON revision_vision_analysis(user_id);
CREATE INDEX idx_rva_revision ON revision_vision_analysis(revision_id);
CREATE INDEX idx_rva_view_type ON revision_vision_analysis(view_type);
CREATE INDEX idx_rva_view_approval ON revision_vision_analysis(view_approval_id);
CREATE INDEX idx_rva_image_url ON revision_vision_analysis(image_url);
CREATE INDEX idx_rva_session ON revision_vision_analysis(session_id);
CREATE INDEX idx_rva_created ON revision_vision_analysis(created_at DESC);
CREATE INDEX idx_rva_status ON revision_vision_analysis(status) WHERE status = 'processing';

-- Unique constraint: One analysis per image URL (prevents duplicate analysis)
CREATE UNIQUE INDEX idx_rva_unique_image ON revision_vision_analysis(image_url);

-- Enable Row Level Security
ALTER TABLE revision_vision_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own vision analysis
CREATE POLICY "Users can view their own vision analysis"
  ON revision_vision_analysis FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own vision analysis
CREATE POLICY "Users can create their own vision analysis"
  ON revision_vision_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own vision analysis
CREATE POLICY "Users can update their own vision analysis"
  ON revision_vision_analysis FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own vision analysis
CREATE POLICY "Users can delete their own vision analysis"
  ON revision_vision_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger function for auto-updating timestamp
CREATE OR REPLACE FUNCTION update_revision_vision_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp on row update
CREATE TRIGGER trigger_update_revision_vision_analysis_timestamp
  BEFORE UPDATE ON revision_vision_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_vision_analysis_timestamp();

-- Create function to cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_vision_analysis()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM revision_vision_analysis
  WHERE expires_at IS NOT NULL AND expires_at < TIMEZONE('utc', NOW());

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON revision_vision_analysis TO authenticated;
GRANT ALL ON revision_vision_analysis TO service_role;

-- Add table and column comments for documentation
COMMENT ON TABLE revision_vision_analysis IS
  'Stores Vision API analysis results for front view images. Used to cache analysis and reduce API calls. Created 2025-11-19.';

COMMENT ON COLUMN revision_vision_analysis.product_idea_id IS
  'Reference to the product this analysis belongs to';

COMMENT ON COLUMN revision_vision_analysis.revision_id IS
  'Reference to the specific multiview revision (if applicable)';

COMMENT ON COLUMN revision_vision_analysis.view_type IS
  'Type of view analyzed: front, back, side, detail, or other';

COMMENT ON COLUMN revision_vision_analysis.view_approval_id IS
  'Generic reference to any view approval record (front_view_approvals, etc.)';

COMMENT ON COLUMN revision_vision_analysis.image_url IS
  'URL of the analyzed image. Unique constraint ensures one analysis per image.';

COMMENT ON COLUMN revision_vision_analysis.analysis_data IS
  'JSONB containing Vision API analysis results: colors, materials, dimensions, etc.';

COMMENT ON COLUMN revision_vision_analysis.status IS
  'Current status: processing (in progress), completed (done), failed (error occurred)';

COMMENT ON COLUMN revision_vision_analysis.expires_at IS
  'Optional expiration timestamp for cache TTL. NULL = never expires.';

-- Success message
SELECT 'revision_vision_analysis table created successfully! Ready for Vision API caching.' as status;
