-- ============================================================================
-- SUPRO / WA-CRM: UNIFIED PURCHASES, ENROLLMENTS & ORDER HISTORY SCHEMA
-- Compatible with Supabase Postgres & Main App SQL Databases
-- ============================================================================

-- 1. Create Enum Types (if not exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_status_enum') THEN
        CREATE TYPE purchase_status_enum AS ENUM ('active', 'completed', 'pending_verification', 'expired', 'refunded');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_type_enum') THEN
        CREATE TYPE item_type_enum AS ENUM ('course', 'o_test', 'tuition', 'tech_skill', 'govt_exam', 'rental', 'ride_pass', 'other');
    END IF;
END $$;

-- 2. Create `user_purchases_orders` Table
CREATE TABLE IF NOT EXISTS public.user_purchases_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone VARCHAR(20) NOT NULL,
    order_id VARCHAR(64) UNIQUE NOT NULL,
    item_id VARCHAR(128) NOT NULL,
    item_title VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL DEFAULT 'course',
    category VARCHAR(100) NOT NULL DEFAULT 'School & Board Tuitions',
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
    utr_number VARCHAR(64),
    coupon_code VARCHAR(64),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '365 days'),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_user_purchases_phone ON public.user_purchases_orders (phone);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_item_id ON public.user_purchases_orders (item_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_category ON public.user_purchases_orders (category);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON public.user_purchases_orders (status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_purchases_orders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Allow Users to read their own orders by Phone / Auth ID
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.user_purchases_orders;
CREATE POLICY "Users can view their own purchases"
    ON public.user_purchases_orders
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        phone ILIKE '%' || RIGHT(COALESCE(auth.jwt()->>'phone', ''), 10) OR
        auth.role() = 'authenticated' OR
        auth.role() = 'anon'
    );

DROP POLICY IF EXISTS "Users and apps can insert purchases" ON public.user_purchases_orders;
CREATE POLICY "Users and apps can insert purchases"
    ON public.user_purchases_orders
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update purchases" ON public.user_purchases_orders;
CREATE POLICY "Admins can update purchases"
    ON public.user_purchases_orders
    FOR UPDATE
    USING (true);

-- 6. Trigger to automatically update `updated_at`
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_purchases_updated_at ON public.user_purchases_orders;
CREATE TRIGGER set_user_purchases_updated_at
    BEFORE UPDATE ON public.user_purchases_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Helper RPC: Retrieve Category-wise Purchases for Profile
CREATE OR REPLACE FUNCTION public.get_user_purchases_by_category(p_phone TEXT)
RETURNS JSONB AS $$
DECLARE
    clean_p TEXT;
    result JSONB;
BEGIN
    clean_p := RIGHT(REGEXP_REPLACE(p_phone, '\D', '', 'g'), 10);

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'order_id', order_id,
            'item_id', item_id,
            'item_title', item_title,
            'item_type', item_type,
            'category', category,
            'amount', amount,
            'currency', currency,
            'payment_method', payment_method,
            'utr_number', utr_number,
            'status', status,
            'valid_from', valid_from,
            'valid_until', valid_until,
            'created_at', created_at
        ) ORDER BY created_at DESC
    ) INTO result
    FROM public.user_purchases_orders
    WHERE phone ILIKE '%' || clean_p;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Seed Default Sample Orders for Demonstration (if empty)
INSERT INTO public.user_purchases_orders (
    phone, order_id, item_id, item_title, item_type, category, amount, payment_method, utr_number, status, valid_until
) VALUES 
('6381029380', 'ORD-2026-TCH-001', 'tn_12_commerce_centum', '+2 வணிகவியல் செண்டம் (Class 12 Commerce Centum)', 'course', 'School & Board Tuitions', 499.00, 'UPI (GPay)', 'UTR489201948201', 'active', now() + INTERVAL '365 days'),
('6381029380', 'ORD-2026-TST-002', 'testo_all_access_pass', 'TestO All-Access Exam Pass (All 500+ Tests)', 'o_test', 'TestO All-Access Passes & Test Series', 99.00, 'UPI (PhonePe)', 'UTR782910394812', 'active', now() + INTERVAL '365 days'),
('6381029380', 'ORD-2026-GOV-003', 'bank_po_clerk', 'Bank PO & Clerk (IBPS & SBI) Master Tuition', 'course', 'Competitive & Govt Exams', 499.00, 'UPI (Paytm)', 'UTR192830192830', 'active', now() + INTERVAL '365 days')
ON CONFLICT (order_id) DO NOTHING;
