-- Create product_image_revisions table
CREATE TABLE IF NOT EXISTS product_image_revisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  view_type TEXT NOT NULL CHECK (view_type IN ('front', 'back', 'side', 'bottom', 'illustration')),
  
  -- Image data
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Edit details
  edit_prompt TEXT,
  edit_type TEXT CHECK (edit_type IN ('initial', 'ai_edit', 'manual_upload', 'rollback')),
  parent_revision_id UUID REFERENCES product_image_revisions(id),
  
  -- AI generation details
  ai_model TEXT DEFAULT 'gemini-2.5-flash-image-preview',
  ai_parameters JSONB,
  generation_time_ms INTEGER,
  
  -- Metadata
  is_active BOOLEAN DEFAULT false,
  notes TEXT,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX idx_product_image_revisions_product_idea ON product_image_revisions(product_idea_id);
CREATE INDEX idx_product_image_revisions_user ON product_image_revisions(user_id);
CREATE INDEX idx_product_image_revisions_view_type ON product_image_revisions(view_type);
CREATE INDEX idx_product_image_revisions_active ON product_image_revisions(is_active);
CREATE INDEX idx_product_image_revisions_created ON product_image_revisions(created_at DESC);

-- Create composite unique constraint for active revisions
CREATE UNIQUE INDEX idx_unique_active_revision ON product_image_revisions(product_idea_id, view_type, is_active) 
WHERE is_active = true;

-- Enable RLS
ALTER TABLE product_image_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own image revisions" ON product_image_revisions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own image revisions" ON product_image_revisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image revisions" ON product_image_revisions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically set revision number
CREATE OR REPLACE FUNCTION set_revision_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.revision_number IS NULL THEN
    SELECT COALESCE(MAX(revision_number), 0) + 1
    INTO NEW.revision_number
    FROM product_image_revisions
    WHERE product_idea_id = NEW.product_idea_id
    AND view_type = NEW.view_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_revision_number_trigger
  BEFORE INSERT ON product_image_revisions
  FOR EACH ROW
  EXECUTE FUNCTION set_revision_number();

-- Function to manage active revisions
CREATE OR REPLACE FUNCTION manage_active_revision()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Deactivate other revisions for the same product/view
    UPDATE product_image_revisions
    SET is_active = false, updated_at = NOW()
    WHERE product_idea_id = NEW.product_idea_id
    AND view_type = NEW.view_type
    AND id != NEW.id
    AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_active_revision_trigger
  AFTER INSERT OR UPDATE ON product_image_revisions
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION manage_active_revision();
