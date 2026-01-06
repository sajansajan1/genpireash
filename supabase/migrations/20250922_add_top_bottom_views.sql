-- Add top and bottom view columns to product_view_approvals table
ALTER TABLE product_view_approvals
ADD COLUMN IF NOT EXISTS top_view_url TEXT,
ADD COLUMN IF NOT EXISTS top_view_prompt TEXT,
ADD COLUMN IF NOT EXISTS bottom_view_url TEXT,
ADD COLUMN IF NOT EXISTS bottom_view_prompt TEXT;

-- Update the view_type check constraint in view_revision_history to include top and bottom
ALTER TABLE view_revision_history
DROP CONSTRAINT IF EXISTS view_revision_history_view_type_check;

ALTER TABLE view_revision_history
ADD CONSTRAINT view_revision_history_view_type_check
CHECK (view_type IN ('front', 'back', 'side', 'top', 'bottom'));

-- Add comment for documentation
COMMENT ON COLUMN product_view_approvals.top_view_url IS 'URL for the top/overhead view of the product';
COMMENT ON COLUMN product_view_approvals.top_view_prompt IS 'Prompt used to generate the top view';
COMMENT ON COLUMN product_view_approvals.bottom_view_url IS 'URL for the bottom/underside view of the product';
COMMENT ON COLUMN product_view_approvals.bottom_view_prompt IS 'Prompt used to generate the bottom view';
