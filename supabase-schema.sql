-- ==============================================================================
-- Community Connect: Supabase Database Schema & Row Level Security (RLS)
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'authority')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Create ISSUES table
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  ai_summary TEXT,
  ai_severity TEXT CHECK (ai_severity IN ('Low', 'Medium', 'High')),
  ai_severity_reason TEXT,
  status TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'In Progress', 'Resolved')),
  upvote_count INTEGER NOT NULL DEFAULT 0,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on issues
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Issues Policies
CREATE POLICY "Anyone authenticated can read issues" 
  ON public.issues FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only the reporter can create their own issue" 
  ON public.issues FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Authorities can update issue status" 
  ON public.issues FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'authority'
    )
  );

-- 3. Create VOTES table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_issue_user_vote UNIQUE (issue_id, user_id)
);

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Votes Policies
CREATE POLICY "Anyone authenticated can read votes" 
  ON public.votes FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert one vote per issue" 
  ON public.votes FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote" 
  ON public.votes FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 4. Trigger to increment/decrement upvote_count on votes
CREATE OR REPLACE FUNCTION public.handle_vote_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.issues 
    SET upvote_count = upvote_count + 1 
    WHERE id = NEW.issue_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.issues 
    SET upvote_count = GREATEST(upvote_count - 1, 0) 
    WHERE id = OLD.issue_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vote_change ON public.votes;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_vote_change();

-- 5. Auto-create profile trigger on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Storage Bucket Configuration for 'issue-photos'
-- In Supabase Dashboard -> Storage -> Create new bucket named 'issue-photos' with Public access = TRUE.
-- Or execute:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('issue-photos', 'issue-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Access for issue photos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'issue-photos');

CREATE POLICY "Authenticated users can upload issue photos" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'issue-photos');
