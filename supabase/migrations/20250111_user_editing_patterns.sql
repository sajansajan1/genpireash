-- Create table for tracking user editing patterns
CREATE TABLE IF NOT EXISTS user_editing_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  common_edits TEXT[] DEFAULT '{}',
  preferred_style TEXT CHECK (preferred_style IN ('minimalist', 'detailed', 'creative', 'technical')),
  edit_count INTEGER DEFAULT 0,
  last_edit_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint for user-product combination
  UNIQUE(user_id, product_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_editing_patterns_user_id ON user_editing_patterns(user_id);
CREATE INDEX idx_user_editing_patterns_product_id ON user_editing_patterns(product_id);
CREATE INDEX idx_user_editing_patterns_last_edit ON user_editing_patterns(last_edit_time DESC);

-- Enable RLS
ALTER TABLE user_editing_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own editing patterns"
  ON user_editing_patterns
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own editing patterns"
  ON user_editing_patterns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own editing patterns"
  ON user_editing_patterns
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_editing_patterns_updated_at
  BEFORE UPDATE ON user_editing_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_editing_patterns IS 'Tracks user editing patterns and preferences for AI personalization';
COMMENT ON COLUMN user_editing_patterns.common_edits IS 'Array of recent edit prompts by the user';
COMMENT ON COLUMN user_editing_patterns.preferred_style IS 'Detected or selected editing style preference';
COMMENT ON COLUMN user_editing_patterns.edit_count IS 'Total number of edits made on this product';
