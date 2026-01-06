-- Migration: Create/Update front_view_approvals table
-- This table manages the progressive generation workflow for front view approval
-- before generating remaining views

-- Create the front_view_approvals table if it doesn't exist
CREATE TABLE IF NOT EXISTS front_view_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_idea_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add all columns one by one (safe for existing tables)
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS front_view_url TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS front_view_prompt TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS iteration_number INTEGER DEFAULT 1;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS previous_revision_id UUID;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS credits_reserved INTEGER DEFAULT 3;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS credits_consumed INTEGER DEFAULT 0;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS is_initial_generation BOOLEAN DEFAULT true;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS user_feedback TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS extracted_features JSONB;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS back_view_url TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS back_view_prompt TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS side_view_url TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS side_view_prompt TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS top_view_url TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS top_view_prompt TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS bottom_view_url TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS bottom_view_prompt TEXT;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE front_view_approvals ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_product_idea'
    AND table_name = 'front_view_approvals'
  ) THEN
    ALTER TABLE front_view_approvals
      ADD CONSTRAINT fk_product_idea
      FOREIGN KEY (product_idea_id)
      REFERENCES product_ideas(id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_user'
    AND table_name = 'front_view_approvals'
  ) THEN
    ALTER TABLE front_view_approvals
      ADD CONSTRAINT fk_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'check_status'
    AND table_name = 'front_view_approvals'
  ) THEN
    ALTER TABLE front_view_approvals
      ADD CONSTRAINT check_status
      CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'check_iteration_positive'
    AND table_name = 'front_view_approvals'
  ) THEN
    ALTER TABLE front_view_approvals
      ADD CONSTRAINT check_iteration_positive
      CHECK (iteration_number > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'check_credits_valid'
    AND table_name = 'front_view_approvals'
  ) THEN
    ALTER TABLE front_view_approvals
      ADD CONSTRAINT check_credits_valid
      CHECK (credits_reserved >= 0 AND credits_consumed >= 0);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_front_view_approvals_product_id
  ON front_view_approvals(product_idea_id);

CREATE INDEX IF NOT EXISTS idx_front_view_approvals_user_id
  ON front_view_approvals(user_id);

CREATE INDEX IF NOT EXISTS idx_front_view_approvals_status
  ON front_view_approvals(status);

CREATE INDEX IF NOT EXISTS idx_front_view_approvals_created_at
  ON front_view_approvals(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_front_view_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_update_front_view_approvals_updated_at ON front_view_approvals;

CREATE TRIGGER trigger_update_front_view_approvals_updated_at
  BEFORE UPDATE ON front_view_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_front_view_approvals_updated_at();

-- Add link to product_multiview_revisions
ALTER TABLE product_multiview_revisions
  ADD COLUMN IF NOT EXISTS front_view_approval_id UUID
  REFERENCES front_view_approvals(id);

CREATE INDEX IF NOT EXISTS idx_multiview_revisions_front_view_approval_id
  ON product_multiview_revisions(front_view_approval_id);

-- Add comments for documentation
COMMENT ON TABLE front_view_approvals IS
  'Manages progressive generation workflow - front view approval before generating remaining views';

COMMENT ON COLUMN front_view_approvals.product_idea_id IS
  'Reference to the product being generated';

COMMENT ON COLUMN front_view_approvals.status IS
  'Workflow status: pending (waiting approval), approved (generate remaining), rejected (regenerate), completed (all done), failed (error)';

COMMENT ON COLUMN front_view_approvals.iteration_number IS
  'Number of times front view has been regenerated (1, 2, 3...)';

COMMENT ON COLUMN front_view_approvals.credits_reserved IS
  'Credits reserved for this generation workflow (3 base + 1 per iteration)';

COMMENT ON COLUMN front_view_approvals.credits_consumed IS
  'Credits actually consumed during generation';

COMMENT ON COLUMN front_view_approvals.is_initial_generation IS
  'True if this is initial product creation, false if editing existing product';

COMMENT ON COLUMN front_view_approvals.previous_revision_id IS
  'If editing existing product, reference to the previous revision';

COMMENT ON COLUMN front_view_approvals.session_id IS
  'Session ID for tracking user workflow session';

COMMENT ON COLUMN front_view_approvals.user_feedback IS
  'User feedback when requesting edits or providing approval comments';

COMMENT ON COLUMN front_view_approvals.extracted_features IS
  'Extracted features from approved front view (colors, materials, dimensions)';

-- Success message
SELECT 'Front view approvals table created successfully!' as status;
