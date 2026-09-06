import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, ShieldCheck, KeyRound } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'authority')) DEFAULT 'citizen',
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Issues table
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('Reported', 'In Progress', 'Resolved')) DEFAULT 'Reported',
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_name TEXT,
  upvote_count INTEGER DEFAULT 0,
  ai_summary TEXT,
  ai_severity TEXT CHECK (ai_severity IN ('Low', 'Medium', 'High')),
  ai_severity_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Votes table (one vote per user per issue)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(issue_id, user_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read issues" ON public.issues FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can report" ON public.issues FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Authorities can update status" ON public.issues FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'authority')
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read votes" ON public.votes FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "One vote per issue" ON public.votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Remove vote" ON public.votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for photos:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('issue-photos', 'issue-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public photos access" ON storage.objects FOR SELECT USING (bucket_id = 'issue-photos');
CREATE POLICY "Upload photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-photos');
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Database &amp; Environment Setup</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Supabase tables, RLS policies, and API keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Current Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isSupabaseConfigured
                ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
          >
            {isSupabaseConfigured ? (
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            ) : (
              <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-xs">
                {isSupabaseConfigured
                  ? 'Connected to Supabase'
                  : 'Running in Interactive Preview Mode'}
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                {isSupabaseConfigured
                  ? 'Your application is connected to your remote Supabase instance. All reads, writes, auth, and storage sync in real time.'
                  : 'The application is fully functional right now using local persistence. To link your own Supabase project, follow the quick steps below.'}
              </p>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs flex items-center justify-center font-mono">
                1
              </span>
              Create Supabase Project &amp; Tables
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create a free project at{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>
              , then run the SQL script below in the <strong>SQL Editor</strong> to create the tables, RLS rules, and storage bucket.
            </p>

            <div className="relative">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
                {sqlCode}
              </pre>
              <button
                onClick={copySql}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs flex items-center justify-center font-mono">
                2
              </span>
              Configure Environment Variables
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In your AI Studio project Settings &gt; Secrets (or in your <code>.env</code> file for local development), set:
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2 text-xs font-mono">
              <div className="text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">VITE_SUPABASE_URL</span>=&quot;https://your-project.supabase.co&quot;
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">VITE_SUPABASE_ANON_KEY</span>=&quot;eyJhbGciOi...&quot;
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">GEMINI_API_KEY</span>=&quot;AIzaSy...&quot; <span className="text-slate-400 font-sans">(Automatically injected by AI Studio)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
