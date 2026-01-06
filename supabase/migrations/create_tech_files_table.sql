-- =====================================================
-- Tech Files Storage System
-- Comprehensive table structure for storing tech pack files
-- with versioning based on product_id and revision_id
-- =====================================================

-- Main Tech Files Table
CREATE TABLE IF NOT EXISTS tech_files (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys & Versioning
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  revision_id UUID, -- Nullable - can reference product_multiview_revisions or product_image_revisions
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Version Control
  version INTEGER NOT NULL DEFAULT 1,
  parent_file_id UUID REFERENCES tech_files(id) ON DELETE SET NULL,
  is_latest BOOLEAN NOT NULL DEFAULT true,

  -- File Metadata
  file_type VARCHAR(50) NOT NULL, -- 'base_view', 'closeup', 'sketch', 'category', 'complete_pack'
  file_category VARCHAR(50), -- For categorization within file_type
  view_type VARCHAR(20), -- 'front', 'back', 'side' for sketches/base_views

  -- Storage
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size_bytes BIGINT,
  file_format VARCHAR(20), -- 'png', 'jpg', 'pdf', 'json', etc.

  -- AI Analysis Data
  analysis_data JSONB, -- Stores all AI-generated analysis
  metadata JSONB, -- Additional metadata (dimensions, callouts, measurements, etc.)

  -- Generation Info
  generation_batch_id VARCHAR(100), -- Groups files generated together
  ai_model_used VARCHAR(100),
  generation_prompt TEXT,
  generation_config JSONB,

  -- Quality Metrics
  confidence_score DECIMAL(3,2),
  quality_score DECIMAL(3,2),

  -- Status & Tracking
  status VARCHAR(20) NOT NULL DEFAULT 'processing', -- 'processing', 'completed', 'failed', 'archived'
  processing_time_ms INTEGER,
  error_message TEXT,

  -- Credits & Cost
  credits_used INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_file_type CHECK (file_type IN ('base_view', 'component', 'closeup', 'sketch', 'flat_sketch', 'assembly_view', 'category', 'complete_pack')),
  CONSTRAINT valid_view_type CHECK (view_type IS NULL OR view_type IN ('front', 'back', 'side')),
  CONSTRAINT valid_status CHECK (status IN ('processing', 'completed', 'failed', 'archived')),
  CONSTRAINT valid_confidence CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  CONSTRAINT valid_quality CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1))
);

-- Tech File Versions - Track all versions of a tech file
CREATE TABLE IF NOT EXISTS tech_file_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tech_file_id UUID NOT NULL REFERENCES tech_files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,

  -- Snapshot of file at this version
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  analysis_data JSONB,
  metadata JSONB,

  -- Version metadata
  created_by UUID NOT NULL REFERENCES users(id),
  change_description TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(tech_file_id, version_number)
);

-- Tech File Collections - Group related tech files
CREATE TABLE IF NOT EXISTS tech_file_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  revision_id UUID, -- Nullable - can reference product_multiview_revisions or product_image_revisions
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Collection Info
  collection_name VARCHAR(200) NOT NULL,
  collection_type VARCHAR(50) NOT NULL, -- 'tech_pack_v2', 'base_views_set', 'sketches_set', etc.
  description TEXT,

  -- Generation Info
  generation_batch_id VARCHAR(100),
  total_credits_used INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  completion_percentage INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_collection_status CHECK (status IN ('processing', 'completed', 'failed', 'partial'))
);

-- Tech File Collection Items - Map files to collections
CREATE TABLE IF NOT EXISTS tech_file_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  collection_id UUID NOT NULL REFERENCES tech_file_collections(id) ON DELETE CASCADE,
  tech_file_id UUID NOT NULL REFERENCES tech_files(id) ON DELETE CASCADE,

  -- Ordering & Organization
  display_order INTEGER,
  section VARCHAR(100), -- 'base_views', 'closeups', 'sketches', etc.

  -- Timestamps
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(collection_id, tech_file_id)
);

-- Indexes for Performance
CREATE INDEX idx_tech_files_product_revision ON tech_files(product_idea_id, revision_id);
CREATE INDEX idx_tech_files_user ON tech_files(user_id);
CREATE INDEX idx_tech_files_type ON tech_files(file_type);
CREATE INDEX idx_tech_files_latest ON tech_files(product_idea_id, is_latest) WHERE is_latest = true;
CREATE INDEX idx_tech_files_batch ON tech_files(generation_batch_id);
CREATE INDEX idx_tech_files_status ON tech_files(status);
CREATE INDEX idx_tech_files_created ON tech_files(created_at DESC);

CREATE INDEX idx_tech_file_versions_file ON tech_file_versions(tech_file_id, version_number DESC);

CREATE INDEX idx_collections_product_revision ON tech_file_collections(product_idea_id, revision_id);
CREATE INDEX idx_collections_user ON tech_file_collections(user_id);
CREATE INDEX idx_collections_status ON tech_file_collections(status);

CREATE INDEX idx_collection_items_collection ON tech_file_collection_items(collection_id);
CREATE INDEX idx_collection_items_section ON tech_file_collection_items(collection_id, section, display_order);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tech_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tech_files_updated_at
  BEFORE UPDATE ON tech_files
  FOR EACH ROW
  EXECUTE FUNCTION update_tech_files_updated_at();

CREATE TRIGGER tech_file_collections_updated_at
  BEFORE UPDATE ON tech_file_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_tech_files_updated_at();

-- Trigger to archive old versions when new version is created
CREATE OR REPLACE FUNCTION archive_old_tech_file_versions()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark all previous versions as not latest
  UPDATE tech_files
  SET is_latest = false
  WHERE product_idea_id = NEW.product_idea_id
    AND file_type = NEW.file_type
    AND COALESCE(view_type, '') = COALESCE(NEW.view_type, '')
    AND id != NEW.id
    AND is_latest = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER archive_old_versions
  AFTER INSERT ON tech_files
  FOR EACH ROW
  WHEN (NEW.is_latest = true)
  EXECUTE FUNCTION archive_old_tech_file_versions();

-- Function to create a new version of a tech file
CREATE OR REPLACE FUNCTION create_tech_file_version(
  p_tech_file_id UUID,
  p_user_id UUID,
  p_change_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_current_file tech_files%ROWTYPE;
  v_new_version_number INTEGER;
  v_version_id UUID;
BEGIN
  -- Get current file
  SELECT * INTO v_current_file
  FROM tech_files
  WHERE id = p_tech_file_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tech file not found';
  END IF;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_new_version_number
  FROM tech_file_versions
  WHERE tech_file_id = p_tech_file_id;

  -- Create version snapshot
  INSERT INTO tech_file_versions (
    tech_file_id,
    version_number,
    file_url,
    thumbnail_url,
    analysis_data,
    metadata,
    created_by,
    change_description
  ) VALUES (
    p_tech_file_id,
    v_new_version_number,
    v_current_file.file_url,
    v_current_file.thumbnail_url,
    v_current_file.analysis_data,
    v_current_file.metadata,
    p_user_id,
    p_change_description
  )
  RETURNING id INTO v_version_id;

  -- Update version number on main file
  UPDATE tech_files
  SET version = v_new_version_number
  WHERE id = p_tech_file_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE tech_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_file_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_file_collection_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own tech files
CREATE POLICY tech_files_select_policy ON tech_files
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tech files
CREATE POLICY tech_files_insert_policy ON tech_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tech files
CREATE POLICY tech_files_update_policy ON tech_files
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own tech files
CREATE POLICY tech_files_delete_policy ON tech_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY tech_file_versions_select_policy ON tech_file_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tech_files
      WHERE tech_files.id = tech_file_versions.tech_file_id
      AND tech_files.user_id = auth.uid()
    )
  );

CREATE POLICY tech_file_collections_select_policy ON tech_file_collections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY tech_file_collections_insert_policy ON tech_file_collections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY tech_file_collections_update_policy ON tech_file_collections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY tech_file_collection_items_select_policy ON tech_file_collection_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tech_file_collections
      WHERE tech_file_collections.id = tech_file_collection_items.collection_id
      AND tech_file_collections.user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON TABLE tech_files IS 'Stores all tech pack files with versioning and comprehensive metadata';
COMMENT ON TABLE tech_file_versions IS 'Maintains complete version history of tech files';
COMMENT ON TABLE tech_file_collections IS 'Groups related tech files into collections (e.g., complete tech pack)';
COMMENT ON TABLE tech_file_collection_items IS 'Maps individual files to collections';

COMMENT ON COLUMN tech_files.file_type IS 'Type of file: base_view, closeup, sketch, category, complete_pack';
COMMENT ON COLUMN tech_files.view_type IS 'For sketches/base_views: front, back, or side';
COMMENT ON COLUMN tech_files.is_latest IS 'Indicates if this is the latest version of this file type';
COMMENT ON COLUMN tech_files.analysis_data IS 'AI-generated analysis in JSON format';
COMMENT ON COLUMN tech_files.metadata IS 'Additional metadata like dimensions, callouts, measurements';
COMMENT ON COLUMN tech_files.generation_batch_id IS 'Groups files generated in the same batch';
