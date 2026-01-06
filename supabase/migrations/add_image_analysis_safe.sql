-- Safe version of image analysis migration that checks for existing objects
-- Run this in Supabase SQL Editor

-- First check if product_multiview_revisions table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'product_multiview_revisions'
  ) THEN
    -- Add analysis columns to the existing table (if they don't exist)
    ALTER TABLE product_multiview_revisions
    ADD COLUMN IF NOT EXISTS image_analysis JSONB,
    ADD COLUMN IF NOT EXISTS analysis_created_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS analysis_model TEXT;

    -- Create index for faster lookups (if it doesn't exist)
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_pmr_image_analysis'
    ) THEN
      CREATE INDEX idx_pmr_image_analysis 
      ON product_multiview_revisions(product_idea_id, view_type) 
      WHERE image_analysis IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Create image_analysis_cache table only if it doesn't exist
CREATE TABLE IF NOT EXISTS image_analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Image identification
  image_url TEXT NOT NULL,
  image_hash TEXT,
  
  -- Analysis data
  analysis_data JSONB NOT NULL,
  analysis_prompt TEXT,
  model_used TEXT NOT NULL DEFAULT 'gpt-4o',
  
  -- Related entities (with conditional foreign keys)
  product_idea_id UUID,
  revision_id UUID,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Analysis details
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  confidence_score FLOAT
);

-- Add unique constraint on image_url if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'image_analysis_cache_image_url_key'
  ) THEN
    ALTER TABLE image_analysis_cache 
    ADD CONSTRAINT image_analysis_cache_image_url_key UNIQUE (image_url);
  END IF;
END $$;

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_iac_image_url ON image_analysis_cache(image_url);
CREATE INDEX IF NOT EXISTS idx_iac_product_idea ON image_analysis_cache(product_idea_id);
CREATE INDEX IF NOT EXISTS idx_iac_created_at ON image_analysis_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iac_expires_at ON image_analysis_cache(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS (safe to run multiple times)
ALTER TABLE image_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view analysis for their products" ON image_analysis_cache;
DROP POLICY IF EXISTS "Users can create analysis for their products" ON image_analysis_cache;
DROP POLICY IF EXISTS "Users can update their analysis" ON image_analysis_cache;

-- Create RLS Policies
DO $$
BEGIN
  -- Only create if product_ideas table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'product_ideas'
  ) THEN
    CREATE POLICY "Users can view analysis for their products"
      ON image_analysis_cache
      FOR SELECT
      USING (
        product_idea_id IS NULL OR
        product_idea_id IN (
          SELECT id FROM product_ideas WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can create analysis for their products"
      ON image_analysis_cache
      FOR INSERT
      WITH CHECK (
        product_idea_id IS NULL OR
        product_idea_id IN (
          SELECT id FROM product_ideas WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can update their analysis"
      ON image_analysis_cache
      FOR UPDATE
      USING (
        product_idea_id IS NULL OR
        product_idea_id IN (
          SELECT id FROM product_ideas WHERE user_id = auth.uid()
        )
      );
  ELSE
    -- Simpler policies if product_ideas doesn't exist
    CREATE POLICY "Users can view analysis"
      ON image_analysis_cache
      FOR SELECT
      USING (true);

    CREATE POLICY "Users can create analysis"
      ON image_analysis_cache
      FOR INSERT
      WITH CHECK (true);

    CREATE POLICY "Users can update analysis"
      ON image_analysis_cache
      FOR UPDATE
      USING (true);
  END IF;
END $$;

-- Create or replace cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_analysis_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM image_analysis_cache
  WHERE expires_at IS NOT NULL AND expires_at < TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (safe to run multiple times)
GRANT ALL ON image_analysis_cache TO authenticated;
GRANT ALL ON image_analysis_cache TO service_role;

-- Return success with summary
SELECT 
  'Image analysis cache setup complete!' as status,
  (SELECT COUNT(*) FROM image_analysis_cache) as cache_entries,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'image_analysis_cache') as table_created;
