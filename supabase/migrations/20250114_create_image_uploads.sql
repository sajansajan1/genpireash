-- Create table for tracking image uploads and metadata
CREATE TABLE IF NOT EXISTS images_uploads (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- URLs
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  webp_url TEXT,
  
  -- Image metadata
  width INTEGER,
  height INTEGER,
  format VARCHAR(20),
  size INTEGER, -- Size in bytes
  
  -- Relations
  project_id UUID REFERENCES product_ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Additional metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_images_uploads_project_id ON images_uploads(project_id);
CREATE INDEX idx_images_uploads_user_id ON images_uploads(user_id);
CREATE INDEX idx_images_uploads_created_at ON images_uploads(created_at DESC);

-- Enable RLS
ALTER TABLE images_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own image uploads
CREATE POLICY "Users can view own image uploads" ON images_uploads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own image uploads
CREATE POLICY "Users can insert own image uploads" ON images_uploads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own image uploads
CREATE POLICY "Users can update own image uploads" ON images_uploads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own image uploads
CREATE POLICY "Users can delete own image uploads" ON images_uploads
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_images_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_images_uploads_updated_at
  BEFORE UPDATE ON images_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_images_uploads_updated_at();

-- Add comments
COMMENT ON TABLE images_uploads IS 'Tracks all image uploads with metadata and optimization details';
COMMENT ON COLUMN images_uploads.url IS 'Main optimized image URL';
COMMENT ON COLUMN images_uploads.thumbnail_url IS 'Thumbnail version URL';
COMMENT ON COLUMN images_uploads.webp_url IS 'WebP format version URL';
COMMENT ON COLUMN images_uploads.metadata IS 'Flexible storage for additional image metadata';
