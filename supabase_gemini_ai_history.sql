-- ==========================================================
-- 🤖 FAGO GEMINI AI CONVERSATION HISTORY TABLE & POLICIES
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gmahjdzqitbomtmdzlfp/sql
-- ==========================================================

-- 1. Create table for storing user Gemini AI conversation history
CREATE TABLE IF NOT EXISTS public.gemini_ai_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    mode VARCHAR(50) DEFAULT 'Agri',
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.gemini_ai_history ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can view their own AI conversation history
DROP POLICY IF EXISTS "Users can view own AI history" ON public.gemini_ai_history;
CREATE POLICY "Users can view own AI history"
ON public.gemini_ai_history FOR SELECT
USING (
    auth.uid() = user_id 
    OR phone = (auth.jwt() ->> 'phone')
    OR auth.role() = 'anon'
);

-- 4. Policy: Users can insert AI conversation history
DROP POLICY IF EXISTS "Users can insert AI history" ON public.gemini_ai_history;
CREATE POLICY "Users can insert AI history"
ON public.gemini_ai_history FOR INSERT
WITH CHECK (true);

-- 5. Performance Indexes for fast history lookups
CREATE INDEX IF NOT EXISTS idx_gemini_ai_history_user ON public.gemini_ai_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gemini_ai_history_phone ON public.gemini_ai_history (phone, created_at DESC);
