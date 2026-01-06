-- Create product_tech_packs table to store multiple tech packs per project
-- Each tech pack is linked to a specific revision

-- Drop table if it exists to avoid conflicts
DROP TABLE IF EXISTS product_tech_packs CASCADE;

CREATE TABLE product_tech_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  revision_id UUID REFERENCES product_multiview_revisions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  revision_number INTEGER,
  tech_pack_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_tech_packs_product_id ON product_tech_packs(product_idea_id);
CREATE INDEX IF NOT EXISTS idx_product_tech_packs_revision_id ON product_tech_packs(revision_id);
CREATE INDEX IF NOT EXISTS idx_product_tech_packs_user_id ON product_tech_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_product_tech_packs_active ON product_tech_packs(product_idea_id, is_active);

-- Add RLS policies
ALTER TABLE product_tech_packs ENABLE ROW LEVEL SECURITY;

-- Users can read their own tech packs
CREATE POLICY "Users can view their own tech packs"
  ON product_tech_packs
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own tech packs
CREATE POLICY "Users can create their own tech packs"
  ON product_tech_packs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own tech packs
CREATE POLICY "Users can update their own tech packs"
  ON product_tech_packs
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own tech packs
CREATE POLICY "Users can delete their own tech packs"
  ON product_tech_packs
  FOR DELETE
  USING (user_id = auth.uid());

-- Add comment
COMMENT ON TABLE product_tech_packs IS 'Stores multiple tech packs per product, each linked to a specific revision';
COMMENT ON COLUMN product_tech_packs.revision_id IS 'References the specific revision this tech pack was generated from (NULL for original/legacy tech packs)';
COMMENT ON COLUMN product_tech_packs.is_active IS 'Indicates if this is the currently active tech pack for the product';
COMMENT ON COLUMN product_tech_packs.metadata IS 'Additional metadata like generation parameters, AI model used, etc.';
