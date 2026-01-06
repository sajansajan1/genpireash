-- Create table for storing AI image editor chat messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Foreign keys
  product_idea_id UUID NOT NULL REFERENCES product_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Optional: Link to revision if message is related to a specific revision
  revision_id UUID REFERENCES product_multiview_revisions(id) ON DELETE SET NULL,
  batch_id TEXT, -- Groups messages for a specific editing session
  
  -- Message data
  message_type TEXT NOT NULL CHECK (message_type IN (
    'user', 'ai', 'system', 'image-ready', 
    'analysis', 'processing', 'error', 'success'
  )),
  content TEXT NOT NULL,
  
  -- Metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}',
  -- Example metadata structure:
  -- {
  --   "view": "front" | "back" | "side",
  --   "imageUrl": "https://...",
  --   "progress": 50,
  --   "duration": 1234,
  --   "editPrompt": "change color to blue",
  --   "error": "error message if any"
  -- }
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_chat_messages_product_idea_id ON ai_chat_messages(product_idea_id);
CREATE INDEX idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX idx_ai_chat_messages_batch_id ON ai_chat_messages(batch_id);
CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own chat messages
CREATE POLICY "Users can view own chat messages" ON ai_chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own chat messages
CREATE POLICY "Users can insert own chat messages" ON ai_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own chat messages
CREATE POLICY "Users can update own chat messages" ON ai_chat_messages
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own chat messages
CREATE POLICY "Users can delete own chat messages" ON ai_chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_ai_chat_messages_updated_at
  BEFORE UPDATE ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_chat_messages_updated_at();

-- Add comment to table
COMMENT ON TABLE ai_chat_messages IS 'Stores chat history between users and AI for image editing sessions';
COMMENT ON COLUMN ai_chat_messages.message_type IS 'Type of message: user, ai, system, image-ready, analysis, processing, error, success';
COMMENT ON COLUMN ai_chat_messages.metadata IS 'Flexible JSON storage for message-specific data like image URLs, progress, etc.';
COMMENT ON COLUMN ai_chat_messages.batch_id IS 'Groups messages from the same editing session together';
