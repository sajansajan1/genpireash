-- Migration: Create new view_approvals table for design edit workflow
-- This table supports approvals for all view types (not just front view)
-- Keeps existing front_view_approvals table for backward compatibility

-- Step 1: Create the new view_approvals table
CREATE TABLE IF NOT EXISTS view_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_view_url TEXT NOT NULL,
  view_type TEXT NOT NULL DEFAULT 'front',
  edit_context TEXT NOT NULL DEFAULT 'design_edit',
  parent_revision_id UUID REFERENCES product_multiview_revisions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  prompt TEXT,
  edit_prompt TEXT,
  revision_id UUID REFERENCES product_multiview_revisions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_view_approvals_product ON view_approvals(product_id);
CREATE INDEX idx_view_approvals_user ON view_approvals(user_id);
CREATE INDEX idx_view_approvals_status ON view_approvals(status);
CREATE INDEX idx_view_approvals_revision ON view_approvals(revision_id);
CREATE INDEX idx_view_approvals_context ON view_approvals(edit_context);
CREATE INDEX idx_view_approvals_parent ON view_approvals(parent_revision_id);
CREATE INDEX idx_view_approvals_view_type ON view_approvals(view_type);

-- Step 3: Add comments for documentation
COMMENT ON TABLE view_approvals IS 'Approval workflow for design edits. Supports all view types (front, back, side, top, bottom).';
COMMENT ON COLUMN view_approvals.view_type IS 'Type of view being approved: front, back, side_left, side_right, top, bottom';
COMMENT ON COLUMN view_approvals.edit_context IS 'Context: design_edit (can be extended to support initial_generation if front_view_approvals is migrated)';
COMMENT ON COLUMN view_approvals.parent_revision_id IS 'The revision being edited. NULL for new edits.';
COMMENT ON COLUMN view_approvals.primary_view_url IS 'URL of the view being approved';
COMMENT ON COLUMN view_approvals.edit_prompt IS 'User prompt for the edit request';
COMMENT ON COLUMN view_approvals.status IS 'pending, approved, or rejected';

-- Step 4: Create RLS policies
ALTER TABLE view_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_approvals_select_policy ON view_approvals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY view_approvals_insert_policy ON view_approvals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY view_approvals_update_policy ON view_approvals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY view_approvals_delete_policy ON view_approvals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_view_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_view_approvals_updated_at
  BEFORE UPDATE ON view_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_view_approvals_updated_at();

-- Note: front_view_approvals table remains untouched for backward compatibility
-- New design edit workflow will use view_approvals table
