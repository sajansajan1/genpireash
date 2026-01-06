-- Migration: Create product_3d_models table
-- Description: Stores 3D model generation results from Meshy.ai for products and collections
-- Supports multiple versions per product/collection
-- Created: 2025-01-13

-- Create the product_3d_models table
CREATE TABLE IF NOT EXISTS product_3d_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Reference to source (product or collection)
  source_type TEXT NOT NULL CHECK (source_type IN ('product', 'collection')),
  source_id UUID NOT NULL, -- References product_ideas.id or collections.id

  -- Meshy.ai task information
  task_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'EXPIRED')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Model URLs (all formats from Meshy.ai)
  model_urls JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { "glb": "url", "fbx": "url", "usdz": "url", "obj": "url", "mtl": "url" }

  thumbnail_url TEXT,

  -- Texture URLs
  texture_urls JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{ "base_color": "url", "metallic": "url", "roughness": "url", "normal": "url" }]

  -- Input images used for generation
  input_images JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { "front": "url", "back": "url", "side": "url" }

  -- Error information
  task_error TEXT,

  -- Metadata
  version INTEGER NOT NULL DEFAULT 1, -- Version number for this product
  is_active BOOLEAN NOT NULL DEFAULT true, -- Current active version

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_product_3d_models_user_id ON product_3d_models(user_id);
CREATE INDEX idx_product_3d_models_source ON product_3d_models(source_type, source_id);
CREATE INDEX idx_product_3d_models_task_id ON product_3d_models(task_id);
CREATE INDEX idx_product_3d_models_status ON product_3d_models(status);
CREATE INDEX idx_product_3d_models_is_active ON product_3d_models(is_active);
CREATE INDEX idx_product_3d_models_created_at ON product_3d_models(created_at DESC);

-- Create unique partial index to ensure only one active model per source
-- This ensures that only one row per (source_type, source_id) can have is_active = true
CREATE UNIQUE INDEX idx_unique_active_model_per_source
  ON product_3d_models(source_type, source_id)
  WHERE is_active = true;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_product_3d_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_3d_models_updated_at
  BEFORE UPDATE ON product_3d_models
  FOR EACH ROW
  EXECUTE FUNCTION update_product_3d_models_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE product_3d_models ENABLE ROW LEVEL SECURITY;

-- Users can view their own 3D models
CREATE POLICY "Users can view their own 3D models"
  ON product_3d_models
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own 3D models
CREATE POLICY "Users can create their own 3D models"
  ON product_3d_models
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own 3D models
CREATE POLICY "Users can update their own 3D models"
  ON product_3d_models
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own 3D models
CREATE POLICY "Users can delete their own 3D models"
  ON product_3d_models
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically increment version number
CREATE OR REPLACE FUNCTION set_model_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the max version for this source
  SELECT COALESCE(MAX(version), 0) + 1
  INTO NEW.version
  FROM product_3d_models
  WHERE source_type = NEW.source_type
    AND source_id = NEW.source_id
    AND user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_model_version
  BEFORE INSERT ON product_3d_models
  FOR EACH ROW
  EXECUTE FUNCTION set_model_version();

-- Function to deactivate other versions when setting a new active version
CREATE OR REPLACE FUNCTION manage_active_model()
RETURNS TRIGGER AS $$
BEGIN
  -- If this model is being set as active, deactivate all other versions
  IF NEW.is_active = true THEN
    UPDATE product_3d_models
    SET is_active = false
    WHERE source_type = NEW.source_type
      AND source_id = NEW.source_id
      AND user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_manage_active_model
  AFTER INSERT OR UPDATE OF is_active ON product_3d_models
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION manage_active_model();

-- Comments for documentation
COMMENT ON TABLE product_3d_models IS 'Stores 3D model generation results from Meshy.ai API. Supports multiple versions per product/collection.';
COMMENT ON COLUMN product_3d_models.source_type IS 'Type of source: product or collection';
COMMENT ON COLUMN product_3d_models.source_id IS 'References product_ideas.id or collections.id';
COMMENT ON COLUMN product_3d_models.task_id IS 'Meshy.ai task ID for tracking generation status';
COMMENT ON COLUMN product_3d_models.model_urls IS 'JSONB object with all model format URLs (glb, fbx, usdz, obj, mtl)';
COMMENT ON COLUMN product_3d_models.texture_urls IS 'JSONB array of texture maps (base_color, metallic, roughness, normal)';
COMMENT ON COLUMN product_3d_models.version IS 'Version number, auto-incremented for each new generation';
COMMENT ON COLUMN product_3d_models.is_active IS 'Flag indicating the currently active/selected version for display';
