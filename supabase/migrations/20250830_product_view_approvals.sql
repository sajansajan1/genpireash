-- Create approval tracking table for stepped image generation workflow
CREATE TABLE IF NOT EXISTS product_view_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  front_view_url TEXT NOT NULL,
  front_view_prompt TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'revision_requested')) DEFAULT 'pending',
  user_feedback TEXT,
  back_view_url TEXT,
  back_view_prompt TEXT,
  side_view_url TEXT,
  side_view_prompt TEXT,
  extracted_features JSONB, -- Store extracted colors, materials, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add revision history table
CREATE TABLE IF NOT EXISTS view_revision_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID REFERENCES product_view_approvals(id) ON DELETE CASCADE,
  view_type TEXT CHECK (view_type IN ('front', 'back', 'side')) NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  user_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_view_approvals_user_id ON product_view_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_product_view_approvals_session_id ON product_view_approvals(session_id);
CREATE INDEX IF NOT EXISTS idx_product_view_approvals_status ON product_view_approvals(status);
CREATE INDEX IF NOT EXISTS idx_view_revision_history_approval_id ON view_revision_history(approval_id);

-- Enable RLS
ALTER TABLE product_view_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_revision_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_view_approvals
CREATE POLICY "Users can view their own approvals" ON product_view_approvals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own approvals" ON product_view_approvals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own approvals" ON product_view_approvals
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for view_revision_history
CREATE POLICY "Users can view their revision history" ON view_revision_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM product_view_approvals
      WHERE product_view_approvals.id = view_revision_history.approval_id
      AND product_view_approvals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert revision history" ON view_revision_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM product_view_approvals
      WHERE product_view_approvals.id = view_revision_history.approval_id
      AND product_view_approvals.user_id = auth.uid()
    )
  );

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_product_view_approvals_updated_at
  BEFORE UPDATE ON product_view_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE product_view_approvals IS 'Tracks the approval process for stepped image generation workflow';
COMMENT ON TABLE view_revision_history IS 'Stores revision history for product view generations';
COMMENT ON COLUMN product_view_approvals.extracted_features IS 'JSON containing extracted colors, materials, and other features from the front view';
