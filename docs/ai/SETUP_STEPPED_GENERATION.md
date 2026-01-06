# Setup Instructions for Stepped Image Generation Workflow

## Overview
The stepped image generation workflow ensures consistency across all product views by requiring approval of the front view before generating back and side views.

## Database Setup Required

### Step 1: Run the Migration
The workflow requires two new database tables. You need to run the migration in your Supabase dashboard:

1. **Go to your Supabase project dashboard**
2. **Navigate to the SQL Editor**
3. **Copy and run the following SQL:**

\`\`\`sql
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
\`\`\`

### Step 2: Verify the Tables
After running the migration, verify the tables were created:

\`\`\`sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('product_view_approvals', 'view_revision_history');
\`\`\`

### Step 3: Create Storage Bucket (if not exists)
Ensure you have a storage bucket for product views:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `product-views` if it doesn't exist
3. Set it to public or configure appropriate policies

## Testing the Workflow

### Demo Page
A demo page is available at `/demo/stepped-generation` to test the workflow:

\`\`\`bash
npm run dev
# Navigate to http://localhost:3000/demo/stepped-generation
\`\`\`

### Integration with Existing Tech Pack
To integrate with your existing tech pack generation:

\`\`\`tsx
import { SteppedGenerationWorkflow } from '@/components/tech-pack/stepped-generation';

function YourComponent() {
  const handleComplete = (data) => {
    // data contains:
    // - frontView: URL of approved front view
    // - backView: URL of generated back view  
    // - sideView: URL of generated side view
    // - extractedFeatures: Colors, materials, dimensions, etc.
    
    // Use this data in your tech pack
  };

  return (
    <SteppedGenerationWorkflow onComplete={handleComplete} />
  );
}
\`\`\`

## Workflow Process

1. **Input Phase**
   - User provides text description or uploads reference image
   
2. **Front View Generation**
   - AI generates the front view based on input
   - Image is uploaded to Supabase storage
   - Approval record is created in database

3. **Approval Phase**
   - User reviews the front view
   - Can approve or request revision with feedback
   - If approved, features are extracted using GPT-4 Vision

4. **Additional Views Generation**
   - Back and side views are generated using the approved front as reference
   - Extracted features ensure consistency (colors, materials, etc.)
   - All views are stored in Supabase

5. **Completion**
   - All views are displayed with extracted features
   - Data can be used for tech pack generation

## Troubleshooting

### Error: "Database table not found"
- Run the migration SQL above in Supabase SQL Editor
- Ensure you're connected to the correct Supabase project

### Error: "User not authenticated"
- Ensure user is logged in before using the workflow
- Check Supabase authentication is properly configured

### Images not uploading
- Verify the `product-views` storage bucket exists
- Check storage policies allow uploads

### RLS (Row Level Security) Issues
- Ensure the user is properly authenticated
- Check that RLS policies are correctly applied
- For debugging, you can temporarily disable RLS (not recommended for production)

## Files Structure

\`\`\`
components/tech-pack/stepped-generation/
├── index.ts                          # Exports
├── stepped-generation-workflow.tsx   # Main workflow component
├── front-view-approval.tsx          # Approval interface
└── views-display.tsx                # Display all views

app/actions/
└── stepped-image-generation.ts      # Server actions

app/api/
├── generate-front-view/             # API endpoint for front view
├── approve-front-view/              # API endpoint for approval
└── generate-additional-views/       # API endpoint for back/side views

supabase/migrations/
└── 20250830_product_view_approvals.sql  # Database migration
\`\`\`

## Next Steps

1. Run the database migration
2. Test the workflow at `/demo/stepped-generation`
3. Integrate with your existing tech pack generation flow
4. Customize the UI components as needed
