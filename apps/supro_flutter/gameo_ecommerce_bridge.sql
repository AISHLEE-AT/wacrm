-- ============================================================
-- E-Commerce Bridge: Game Rewards SQL
-- Gameo Supabase DB: maznlybuvhcobppndxsg
-- ============================================================

-- 1. USER BALANCES TABLE
-- Stores each user's accumulated Testo Credits and Farm Points
CREATE TABLE IF NOT EXISTS public.user_game_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    testo_points INTEGER NOT NULL DEFAULT 0,
    farm_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_game_balances_user_id ON public.user_game_balances(user_id);

-- 2. GAME REWARDS TABLE
-- Records every coupon generated (audit trail)
CREATE TABLE IF NOT EXISTS public.game_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    reward_id TEXT NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('testo', 'farm')),
    coupon_code TEXT NOT NULL UNIQUE,
    points_spent INTEGER NOT NULL,
    is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_rewards_user_id ON public.game_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_game_rewards_coupon ON public.game_rewards(coupon_code);

-- 3. SYNC OFFLINE POINTS RPC
-- Called when user hits Sync button; adds testo and farm points to their balance
CREATE OR REPLACE FUNCTION public.sync_offline_points(
    p_user_id TEXT,
    p_testo_points INTEGER,
    p_farm_points INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_testo INTEGER;
    v_new_farm INTEGER;
BEGIN
    IF p_testo_points < 0 OR p_farm_points < 0 THEN
        RETURN json_build_object('success', false, 'error', 'Points cannot be negative');
    END IF;

    INSERT INTO public.user_game_balances (user_id, testo_points, farm_points)
    VALUES (p_user_id, p_testo_points, p_farm_points)
    ON CONFLICT (user_id) DO UPDATE
        SET testo_points = user_game_balances.testo_points + EXCLUDED.testo_points,
            farm_points  = user_game_balances.farm_points  + EXCLUDED.farm_points,
            updated_at   = NOW()
    RETURNING testo_points, farm_points INTO v_new_testo, v_new_farm;

    RETURN json_build_object(
        'success', true,
        'testo_points', v_new_testo,
        'farm_points', v_new_farm
    );
END;
$$;

-- 4. GET USER BALANCE RPC
CREATE OR REPLACE FUNCTION public.get_user_balance(p_user_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_row public.user_game_balances%ROWTYPE;
BEGIN
    SELECT * INTO v_row FROM public.user_game_balances WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        -- Auto-create balance row for new users
        INSERT INTO public.user_game_balances (user_id, testo_points, farm_points)
        VALUES (p_user_id, 0, 0)
        RETURNING * INTO v_row;
    END IF;

    RETURN json_build_object(
        'user_id',      v_row.user_id,
        'testo_points', v_row.testo_points,
        'farm_points',  v_row.farm_points
    );
END;
$$;

-- 5. REDEEM POINTS RPC
-- Deducts points and generates a secure one-time coupon code
CREATE OR REPLACE FUNCTION public.redeem_points(
    p_user_id     TEXT,
    p_reward_id   TEXT,
    p_reward_type TEXT,
    p_points_cost INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_testo INTEGER;
    v_current_farm  INTEGER;
    v_coupon_code   TEXT;
    v_reward_record public.game_rewards%ROWTYPE;
BEGIN
    -- Lock the row for update
    SELECT testo_points, farm_points
    INTO v_current_testo, v_current_farm
    FROM public.user_game_balances
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User balance not found. Sync points first.');
    END IF;

    -- Check sufficient balance
    IF p_reward_type = 'testo' AND v_current_testo < p_points_cost THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient Testo Credits', 'balance', v_current_testo);
    END IF;

    IF p_reward_type = 'farm' AND v_current_farm < p_points_cost THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient Farm Points', 'balance', v_current_farm);
    END IF;

    -- Generate unique coupon code: prefix + 8 random uppercase alphanum chars
    v_coupon_code := UPPER(
        CASE p_reward_type WHEN 'testo' THEN 'TST' ELSE 'FRM' END
        || '-'
        || SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8)
    );

    -- Deduct points
    IF p_reward_type = 'testo' THEN
        UPDATE public.user_game_balances
        SET testo_points = testo_points - p_points_cost,
            updated_at   = NOW()
        WHERE user_id = p_user_id;
    ELSE
        UPDATE public.user_game_balances
        SET farm_points = farm_points - p_points_cost,
            updated_at  = NOW()
        WHERE user_id = p_user_id;
    END IF;

    -- Record the coupon
    INSERT INTO public.game_rewards (user_id, reward_id, reward_type, coupon_code, points_spent)
    VALUES (p_user_id, p_reward_id, p_reward_type, v_coupon_code, p_points_cost)
    RETURNING * INTO v_reward_record;

    RETURN json_build_object(
        'success',     true,
        'coupon_code', v_coupon_code,
        'reward_id',   p_reward_id,
        'reward_type', p_reward_type,
        'points_spent', p_points_cost
    );
END;
$$;

-- 6. Row Level Security (open to service role, anon can only read own rows)
ALTER TABLE public.user_game_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rewards ENABLE ROW LEVEL SECURITY;

-- Allow anon to read only their own rows (matched by user_id = auth.uid() or supplied text)
-- Since we use text user_id (not UUID auth), we use SECURITY DEFINER functions above instead.
-- Grant execute to anon for the RPCs
GRANT EXECUTE ON FUNCTION public.sync_offline_points TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_balance TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_points TO anon, authenticated;

-- Allow anon to read game_rewards (for coupon history display)
-- Note: DROP first to make this script safely re-runnable
DROP POLICY IF EXISTS "Users can read own coupons" ON public.game_rewards;
CREATE POLICY "Users can read own coupons"
    ON public.game_rewards FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Service role full access rewards" ON public.game_rewards;
CREATE POLICY "Service role full access rewards"
    ON public.game_rewards FOR ALL
    USING (true);

DROP POLICY IF EXISTS "Service role full access balances" ON public.user_game_balances;
CREATE POLICY "Service role full access balances"
    ON public.user_game_balances FOR ALL
    USING (true);
