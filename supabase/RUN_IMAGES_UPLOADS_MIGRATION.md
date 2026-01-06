# Images Uploads Table Migration

## IMPORTANT: Run this migration in your Supabase SQL Editor

This migration creates the `images_uploads` table to track all image uploads in the system.

### Steps to apply:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire SQL script below
4. Click "Run" to execute

### SQL Migration Script:

\`\`\`sql
-- Create images_uploads table for tracking all image uploads
CREATE TABLE IF NOT EXISTS public.images_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_idea_id UUID NOT NULL REFERENCES public.product_ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    upload_type TEXT NOT NULL CHECK (upload_type IN ('original', 'edited', 'revision', 'thumbnail')),
    view_type TEXT CHECK (view_type IN ('front', 'back', 'side')),
    file_name TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    mime_type TEXT DEFAULT 'image/png',
    width INTEGER,
    height INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_images_uploads_product_idea_id ON public.images_uploads(product_idea_id);
CREATE INDEX IF NOT EXISTS idx_images_uploads_user_id ON public.images_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_images_uploads_upload_type ON public.images_uploads(upload_type);
CREATE INDEX IF NOT EXISTS idx_images_uploads_view_type ON public.images_uploads(view_type);
CREATE INDEX IF NOT EXISTS idx_images_uploads_created_at ON public.images_uploads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.images_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own uploads
CREATE POLICY "Users can view own image uploads" ON public.images_uploads
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own uploads
CREATE POLICY "Users can insert own image uploads" ON public.images_uploads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own uploads
CREATE POLICY "Users can update own image uploads" ON public.images_uploads
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own image uploads" ON public.images_uploads
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_images_uploads_updated_at BEFORE UPDATE
    ON public.images_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.images_uploads TO authenticated;
GRANT SELECT ON public.images_uploads TO anon;
\`\`\`

### After running:

1. Verify the table was created by checking the Tables section in your Supabase dashboard
2. Test by applying an AI edit to an image - it should now save records to this table
3. Check the table data to confirm records are being inserted

### What this table tracks:

- All image uploads with their URLs
- Thumbnail URLs when available
- Upload type (original, edited, revision, thumbnail)
- View type for product images (front, back, side)
- File metadata (name, size, type, dimensions)
- Additional metadata in JSON format
- User and product associations
- Timestamps for tracking

### Troubleshooting:

If records are still not appearing after creating the table:
1. Check the browser console for any errors
2. Verify RLS policies are working (you can temporarily disable RLS to test)
3. Check that your user is authenticated when making the uploads
4. Look for any error logs in the Supabase dashboard
