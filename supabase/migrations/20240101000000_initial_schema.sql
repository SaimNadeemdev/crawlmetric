-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create keywords table
CREATE TABLE IF NOT EXISTS public.keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  keyword TEXT NOT NULL,
  domain TEXT NOT NULL,
  position INTEGER,
  previous_position INTEGER,
  search_volume INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create content_generations table
CREATE TABLE IF NOT EXISTS public.content_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create audits table
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL,
  task_id TEXT,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS keywords_user_id_idx ON public.keywords(user_id);
CREATE INDEX IF NOT EXISTS content_generations_user_id_idx ON public.content_generations(user_id);
CREATE INDEX IF NOT EXISTS audits_user_id_idx ON public.audits(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Keywords policies
CREATE POLICY "Users can view their own keywords" ON public.keywords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own keywords" ON public.keywords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own keywords" ON public.keywords
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own keywords" ON public.keywords
  FOR DELETE USING (auth.uid() = user_id);

-- Content generations policies
CREATE POLICY "Users can view their own content generations" ON public.content_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content generations" ON public.content_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audits policies
CREATE POLICY "Users can view their own audits" ON public.audits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audits" ON public.audits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audits" ON public.audits
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_keywords_updated_at
BEFORE UPDATE ON public.keywords
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at
BEFORE UPDATE ON public.audits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

