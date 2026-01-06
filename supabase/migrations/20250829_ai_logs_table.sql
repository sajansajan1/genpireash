-- Create AI logs table for comprehensive AI operation tracking
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  model TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'dalle', 'other')),
  function_name TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('text_generation', 'image_generation', 'vision_analysis', 'embedding', 'moderation')),
  
  -- Input data (stored as JSONB for flexibility)
  input JSONB NOT NULL DEFAULT '{}',
  
  -- Output data (stored as JSONB)
  output JSONB NOT NULL DEFAULT '{}',
  
  -- Performance metrics
  performance JSONB NOT NULL DEFAULT '{}',
  
  -- Context information
  context JSONB NOT NULL DEFAULT '{}',
  
  -- Indexing for common queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ai_logs_timestamp_idx ON ai_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS ai_logs_model_idx ON ai_logs (model);
CREATE INDEX IF NOT EXISTS ai_logs_operation_type_idx ON ai_logs (operation_type);

-- Create indexes for JSONB fields for efficient querying
CREATE INDEX IF NOT EXISTS ai_logs_context_user_id_idx ON ai_logs ((context->>'user_id'));
CREATE INDEX IF NOT EXISTS ai_logs_context_tech_pack_id_idx ON ai_logs ((context->>'tech_pack_id'));
CREATE INDEX IF NOT EXISTS ai_logs_context_session_id_idx ON ai_logs ((context->>'session_id'));
CREATE INDEX IF NOT EXISTS ai_logs_performance_status_idx ON ai_logs ((performance->>'status'));
CREATE INDEX IF NOT EXISTS ai_logs_output_usage_total_tokens_idx ON ai_logs ((output->'usage'->>'total_tokens'));

-- Create a view for easy access to usage statistics
CREATE OR REPLACE VIEW ai_usage_stats AS
SELECT 
  DATE(timestamp) as date,
  model,
  provider,
  operation_type,
  COUNT(*) as request_count,
  SUM((output->'usage'->>'total_tokens')::INTEGER) as total_tokens,
  SUM((output->'usage'->>'estimated_cost')::DECIMAL) as total_cost,
  AVG((performance->>'duration_ms')::INTEGER) as avg_duration_ms,
  COUNT(*) FILTER (WHERE performance->>'status' = 'error') as error_count
FROM ai_logs
GROUP BY DATE(timestamp), model, provider, operation_type;

-- Create a function to get user usage stats
CREATE OR REPLACE FUNCTION get_user_ai_usage(
  p_user_id UUID,
  p_start_date TIMESTAMP DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE (
  total_requests BIGINT,
  total_tokens BIGINT,
  total_cost DECIMAL,
  error_rate DECIMAL,
  avg_duration_ms DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_requests,
    COALESCE(SUM((output->'usage'->>'total_tokens')::INTEGER), 0) as total_tokens,
    COALESCE(SUM((output->'usage'->>'estimated_cost')::DECIMAL), 0) as total_cost,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE performance->>'status' = 'error')::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0
    END as error_rate,
    AVG((performance->>'duration_ms')::INTEGER) as avg_duration_ms
  FROM ai_logs
  WHERE 
    context->>'user_id' = p_user_id::TEXT
    AND timestamp >= p_start_date
    AND timestamp <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Check if profiles table exists before creating admin policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Admin users can view all logs
        CREATE POLICY admin_view_all_ai_logs ON ai_logs
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.user_id = auth.uid()
              AND profiles.role = 'admin'
            )
          );
    END IF;
END $$;

-- Users can view their own logs
CREATE POLICY users_view_own_ai_logs ON ai_logs
  FOR SELECT
  USING (context->>'user_id' = auth.uid()::TEXT);

-- Service role can insert logs (server-side only)
CREATE POLICY service_insert_ai_logs ON ai_logs
  FOR INSERT
  WITH CHECK (true);

-- Service role can select all logs
CREATE POLICY service_select_ai_logs ON ai_logs
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE ai_logs IS 'Comprehensive logging of all AI operations including model usage, inputs, outputs, performance metrics, and costs';
COMMENT ON COLUMN ai_logs.model IS 'The AI model used (e.g., gpt-4o, gpt-4o-mini, dall-e-3)';
COMMENT ON COLUMN ai_logs.provider IS 'The AI provider (openai, gemini, dalle, other)';
COMMENT ON COLUMN ai_logs.operation_type IS 'Type of AI operation performed';
COMMENT ON COLUMN ai_logs.input IS 'Input data including prompts, parameters, and metadata';
COMMENT ON COLUMN ai_logs.output IS 'Output data including generated content, usage stats, and errors';
COMMENT ON COLUMN ai_logs.performance IS 'Performance metrics including duration and status';
COMMENT ON COLUMN ai_logs.context IS 'Contextual information including user_id, session_id, and feature';
