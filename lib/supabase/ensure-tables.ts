import { createClient } from "@/lib/supabase/server";

/**
 * Ensures required tables exist for stepped image generation
 * This is a temporary solution until migrations are properly run
 */
export async function ensureSteppedGenerationTables() {
  const supabase = await createClient();
  
  try {
    // Check if product_view_approvals table exists
    const { data: tables, error: tablesError } = await supabase
      .from('product_view_approvals')
      .select('id')
      .limit(1);
    
    // If table doesn't exist (error will be thrown), create it
    if (tablesError && tablesError.code === '42P01') {
      console.log('Creating product_view_approvals table...');
      
      // Execute the migration SQL
      const migrationSQL = `
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
          extracted_features JSONB,
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
      `;
      
      // Note: This won't work with RLS enabled. You need to run the migration in Supabase dashboard
      console.error(`
        ⚠️  IMPORTANT: The product_view_approvals table doesn't exist.
        
        Please run the following migration in your Supabase dashboard:
        1. Go to your Supabase project dashboard
        2. Navigate to SQL Editor
        3. Copy and run the migration from: supabase/migrations/20250830_product_view_approvals.sql
        
        Or run this SQL directly:
        ${migrationSQL}
      `);
      
      throw new Error('product_view_approvals table not found. Please run the migration.');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking tables:', error);
    throw error;
  }
}
