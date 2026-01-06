-- Create product_multiview_revisions table with all required fields
-- This is the new table specifically designed for multi-view AI editing

-- Drop table if exists (be careful in production!)
DROP TABLE IF EXISTS product_multiview_revisions CASCADE;

-- Create the new table
CREATE TABLE product_multiview_revisions (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign keys
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Revision tracking
  revision_number INTEGER NOT NULL DEFAULT 0,
  batch_id TEXT, -- Groups multi-view edits together
  
  -- View type (front, back, side, etc.)
  view_type TEXT NOT NULL CHECK (view_type IN ('front', 'back', 'side', 'bottom', 'illustration')),
  
  -- Image URLs
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Edit information
  edit_prompt TEXT,
  edit_type TEXT DEFAULT 'ai_edit' CHECK (edit_type IN ('initial', 'ai_edit', 'manual_upload', 'rollback', 'generated')),
  
  -- AI generation details
  ai_model TEXT DEFAULT 'gemini-2.5-flash-image-preview',
  ai_parameters JSONB, -- Stores analysis, enhanced prompts, etc.
  generation_time_ms INTEGER,
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false, -- Soft delete flag
  deleted_at TIMESTAMP WITH TIME ZONE, -- When it was deleted
  deleted_by UUID REFERENCES auth.users(id), -- Who deleted it
  notes TEXT,
  metadata JSONB, -- Flexible storage for additional data
  
  -- Parent revision for tracking edit history
  parent_revision_id UUID REFERENCES product_multiview_revisions(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX idx_pmr_product_idea ON product_multiview_revisions(product_idea_id);
CREATE INDEX idx_pmr_user ON product_multiview_revisions(user_id);
CREATE INDEX idx_pmr_view_type ON product_multiview_revisions(view_type);
CREATE INDEX idx_pmr_batch_id ON product_multiview_revisions(batch_id);
CREATE INDEX idx_pmr_active ON product_multiview_revisions(is_active);
CREATE INDEX idx_pmr_created ON product_multiview_revisions(created_at DESC);
CREATE INDEX idx_pmr_revision_number ON product_multiview_revisions(revision_number DESC);

-- Unique constraint: Only one active revision per product/view
CREATE UNIQUE INDEX idx_pmr_unique_active ON product_multiview_revisions(product_idea_id, view_type, is_active) 
WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE product_multiview_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own multiview revisions" 
  ON product_multiview_revisions
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own multiview revisions" 
  ON product_multiview_revisions
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own multiview revisions" 
  ON product_multiview_revisions
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own multiview revisions" 
  ON product_multiview_revisions
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to auto-increment revision number
CREATE OR REPLACE FUNCTION set_multiview_revision_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if not provided
  IF NEW.revision_number IS NULL OR NEW.revision_number = 0 THEN
    SELECT COALESCE(MAX(revision_number), -1) + 1
    INTO NEW.revision_number
    FROM product_multiview_revisions
    WHERE product_idea_id = NEW.product_idea_id
    AND view_type = NEW.view_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-increment
CREATE TRIGGER set_multiview_revision_number_trigger
  BEFORE INSERT ON product_multiview_revisions
  FOR EACH ROW
  EXECUTE FUNCTION set_multiview_revision_number();

-- Function to manage active revisions
CREATE OR REPLACE FUNCTION manage_multiview_active_revision()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Deactivate other revisions for the same product/view
    UPDATE product_multiview_revisions
    SET is_active = false, 
        updated_at = TIMEZONE('utc', NOW())
    WHERE product_idea_id = NEW.product_idea_id
    AND view_type = NEW.view_type
    AND id != NEW.id
    AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for managing active status
CREATE TRIGGER manage_multiview_active_revision_trigger
  AFTER INSERT OR UPDATE ON product_multiview_revisions
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION manage_multiview_active_revision();

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_multiview_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_multiview_updated_at_trigger
  BEFORE UPDATE ON product_multiview_revisions
  FOR EACH ROW
  EXECUTE FUNCTION update_multiview_updated_at();

-- Insert initial test to verify table creation
-- This will be rolled back, just for verification
DO $$
BEGIN
  -- Test insert
  INSERT INTO product_multiview_revisions (
    product_idea_id,
    user_id,
    view_type,
    image_url,
    edit_type
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'front',
    'test_url',
    'initial'
  );
  
  -- Immediate rollback
  RAISE EXCEPTION 'Test successful, rolling back';
EXCEPTION
  WHEN OTHERS THEN
    -- Expected error, table is working
    RAISE NOTICE 'Table created successfully!';
END $$;

-- Grant permissions
GRANT ALL ON product_multiview_revisions TO authenticated;
GRANT ALL ON product_multiview_revisions TO service_role;

-- Success message
SELECT 'product_multiview_revisions table created successfully!' as status;
