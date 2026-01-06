-- Create bom_cost_estimates table to store AI-generated cost estimates
-- This allows caching estimates and tracking history

CREATE TABLE IF NOT EXISTS bom_cost_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  tech_pack_id UUID REFERENCES product_tech_packs(id) ON DELETE SET NULL,
  revision_id UUID REFERENCES product_multiview_revisions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,

  -- Input data used for estimation (for cache invalidation)
  material_cost_input DECIMAL(10,2), -- Total material cost used as input
  materials_hash TEXT, -- Hash of materials for cache validation

  -- Sample cost estimates
  sample_cost_min DECIMAL(10,2),
  sample_cost_max DECIMAL(10,2),
  sample_breakdown JSONB, -- {materials, labor, setup, shipping}

  -- Production cost estimates (1000 units)
  production_quantity INTEGER DEFAULT 1000,
  production_total_min DECIMAL(12,2),
  production_total_max DECIMAL(12,2),
  production_per_unit_min DECIMAL(10,2),
  production_per_unit_max DECIMAL(10,2),

  -- Lead times
  sample_lead_time TEXT,
  production_lead_time TEXT,

  -- Regional pricing
  manufacturing_regions JSONB, -- Array of {region, priceMultiplier, notes}

  -- Additional info
  market_insights TEXT,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  complexity_level TEXT CHECK (complexity_level IN ('high', 'medium', 'low')),
  has_electronics BOOLEAN DEFAULT false,

  -- Full raw response for reference
  raw_response JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bom_estimates_product_id ON bom_cost_estimates(product_idea_id);
CREATE INDEX IF NOT EXISTS idx_bom_estimates_tech_pack_id ON bom_cost_estimates(tech_pack_id);
CREATE INDEX IF NOT EXISTS idx_bom_estimates_revision_id ON bom_cost_estimates(revision_id);
CREATE INDEX IF NOT EXISTS idx_bom_estimates_user_id ON bom_cost_estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_bom_estimates_created_at ON bom_cost_estimates(created_at DESC);

-- Add RLS policies
ALTER TABLE bom_cost_estimates ENABLE ROW LEVEL SECURITY;

-- Users can read their own estimates
CREATE POLICY "Users can view their own bom estimates"
  ON bom_cost_estimates
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own estimates
CREATE POLICY "Users can create their own bom estimates"
  ON bom_cost_estimates
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own estimates
CREATE POLICY "Users can update their own bom estimates"
  ON bom_cost_estimates
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own estimates
CREATE POLICY "Users can delete their own bom estimates"
  ON bom_cost_estimates
  FOR DELETE
  USING (user_id = auth.uid());

-- Add comments
COMMENT ON TABLE bom_cost_estimates IS 'Stores AI-generated BOM cost estimates for products';
COMMENT ON COLUMN bom_cost_estimates.revision_id IS 'References the specific revision this estimate was generated for';
COMMENT ON COLUMN bom_cost_estimates.materials_hash IS 'Hash of materials BOM for cache validation - regenerate if materials change';
COMMENT ON COLUMN bom_cost_estimates.raw_response IS 'Full AI response for debugging and future reference';
