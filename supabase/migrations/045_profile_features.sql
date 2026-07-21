-- 045_profile_features.sql

-- 1. Extend profiles table with new features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS digital_id_hash TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS resume_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;

-- 2. Create public.transactions table for cross-module tracking
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_module TEXT, -- e.g., 'TradeO', 'MoneyO', 'TeachO'
    reference_id TEXT, -- e.g., purchase id, listing id
    status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Only admins/system can insert transactions normally, 
-- but for demo/mvp we can allow authenticated users to insert their own
CREATE POLICY "Users can insert own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Enhance public.purchases (if it doesn't have an amount field)
DO $$ 
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='purchases' and column_name='amount' and table_schema='public')
  THEN
      ALTER TABLE public.purchases ADD COLUMN amount DECIMAL(12,2) DEFAULT 0.00;
  END IF;
END $$;
