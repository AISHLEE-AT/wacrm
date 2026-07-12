CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(10, 2) DEFAULT 0.00,
  loyalty_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION get_or_create_wallet(uid UUID)
RETURNS SETOF public.wallets AS $$
BEGIN
  INSERT INTO public.wallets (user_id)
  VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN QUERY SELECT * FROM public.wallets WHERE user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some initial points or money optionally via the app, 
-- but for now just the schema.

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
ON public.wallet_transactions FOR SELECT
USING (wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()));

alter publication supabase_realtime add table public.wallets;
alter publication supabase_realtime add table public.wallet_transactions;
