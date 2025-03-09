-- Create the keyword_research_history table
CREATE TABLE IF NOT EXISTS public.keyword_research_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL,
    data JSONB NOT NULL,
    query_params JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Add comment to the table
COMMENT ON TABLE public.keyword_research_history IS 'Stores keyword research history for users';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_keyword_research_history_user_id ON public.keyword_research_history(user_id);
CREATE INDEX IF NOT EXISTS idx_keyword_research_history_mode ON public.keyword_research_history(mode);
CREATE INDEX IF NOT EXISTS idx_keyword_research_history_created_at ON public.keyword_research_history(created_at);

-- Set up Row Level Security
ALTER TABLE public.keyword_research_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own keyword research history"
    ON public.keyword_research_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own keyword research history"
    ON public.keyword_research_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own keyword research history"
    ON public.keyword_research_history
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own keyword research history"
    ON public.keyword_research_history
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_keyword_research_history_updated_at ON public.keyword_research_history;
CREATE TRIGGER set_keyword_research_history_updated_at
BEFORE UPDATE ON public.keyword_research_history
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
