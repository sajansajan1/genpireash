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
