-- Simple AI logs table without complex RLS
-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_view_all_ai_logs ON ai_logs;
DROP POLICY IF EXISTS users_view_own_ai_logs ON ai_logs;
DROP POLICY IF EXISTS service_insert_ai_logs ON ai_logs;
DROP POLICY IF EXISTS service_select_ai_logs ON ai_logs;
DROP POLICY IF EXISTS creator_view_own_ai_logs ON ai_logs;
DROP POLICY IF EXISTS system_insert_ai_logs ON ai_logs;

-- Disable RLS to allow all operations (we'll control access at the application level)
ALTER TABLE ai_logs DISABLE ROW LEVEL SECURITY;

-- Or if you want minimal RLS, use these simple policies:
-- ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert (for server-side with service role)
-- CREATE POLICY allow_insert_ai_logs ON ai_logs
--   FOR INSERT
--   WITH CHECK (true);

-- Allow authenticated users to view their own logs
-- CREATE POLICY allow_select_own_ai_logs ON ai_logs
--   FOR SELECT
--   USING (auth.uid()::TEXT = context->>'user_id' OR auth.role() = 'service_role');

-- Make sure the table and indexes exist
-- The main table should already be created from the previous migration
-- This just ensures everything is set up correctly
