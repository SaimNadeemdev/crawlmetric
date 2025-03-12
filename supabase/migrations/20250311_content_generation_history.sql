-- Create the content_generation_history table
CREATE TABLE IF NOT EXISTS public.content_generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    prompt JSONB NOT NULL,
    result TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Add comment to the table
COMMENT ON TABLE public.content_generation_history IS 'Stores content generation history for users';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_generation_history_user_id ON public.content_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generation_history_type ON public.content_generation_history(type);
CREATE INDEX IF NOT EXISTS idx_content_generation_history_created_at ON public.content_generation_history(created_at);

-- Set up Row Level Security
ALTER TABLE public.content_generation_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own content generation history"
    ON public.content_generation_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content generation history"
    ON public.content_generation_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content generation history"
    ON public.content_generation_history
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content generation history"
    ON public.content_generation_history
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_content_generation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_content_generation_history_updated_at ON public.content_generation_history;
CREATE TRIGGER set_content_generation_history_updated_at
BEFORE UPDATE ON public.content_generation_history
FOR EACH ROW
EXECUTE FUNCTION public.handle_content_generation_updated_at();
