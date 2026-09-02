-- ==============================================================================
-- 👥 SUPRO GROUPO (சுய உதவிக் குழுக்கள் & சங்கம்) MASTER DATABASE SCHEMA
-- Target Database: Main Supabase PostgreSQL
-- Features: 6 Group Categories (Women SHG, Farmer FPO, Sports Clubs, Business Networks,
--           Village RWAs, Youth Study Circles), Dynamic Phone Auto-Linking,
--           Category KPI Metrics, Custom Attributes JSONB, Ledger & Meetings
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. TABLE: public.groupo_groups (குழுக்கள் தலைமை விவரம்)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groupo_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leader_phone TEXT NOT NULL,
    leader_name TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'WomenSHG', 
    -- 'WomenSHG', 'FarmerFPO', 'SportsClub', 'BusinessGroup', 'VillageRWA', 'YouthStudy'
    category_label TEXT NOT NULL DEFAULT 'மகளிர் சுய உதவிக் குழு (Mathi TNCDW)',
    tagline TEXT,
    village TEXT NOT NULL,
    district TEXT NOT NULL,
    pincode TEXT,
    reg_code TEXT,
    bank_name TEXT,
    bank_account TEXT,
    ifsc_code TEXT,
    monthly_savings_per_member NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
    meeting_schedule TEXT DEFAULT 'Every Month 5th & 20th',
    total_savings_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    active_loan_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gdrive_folder_id TEXT,
    custom_attributes JSONB DEFAULT '{}'::jsonb, -- Specialized metrics per group category
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groupo_groups_leader_phone ON public.groupo_groups(leader_phone);
CREATE INDEX IF NOT EXISTS idx_groupo_groups_category ON public.groupo_groups(category);

-- ------------------------------------------------------------------------------
-- 3. TABLE: public.groupo_members (குழு உறுப்பினர்கள் & தொலைபேசி இணைப்பு)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groupo_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groupo_groups(id) ON DELETE CASCADE,
    phone TEXT NOT NULL, -- Normalized 10-digit phone number for auto-linking
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member', -- 'President', 'Secretary', 'Treasurer', 'Captain', 'Convener', 'Animator', 'Member'
    status TEXT NOT NULL DEFAULT 'Active',
    current_month_paid BOOLEAN NOT NULL DEFAULT FALSE,
    savings_amount NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
    total_savings_accumulated NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    active_loan_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    loan_interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 1.50,
    member_attributes JSONB DEFAULT '{}'::jsonb,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_groupo_member_group_phone UNIQUE (group_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_groupo_members_phone ON public.groupo_members(phone);
CREATE INDEX IF NOT EXISTS idx_groupo_members_group_id ON public.groupo_members(group_id);

-- ------------------------------------------------------------------------------
-- 4. TABLE: public.groupo_savings_ledger (மாதாந்திர சேமிப்பு & வரவு-செலவு ஏடு)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groupo_savings_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groupo_groups(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.groupo_members(id) ON DELETE CASCADE,
    member_phone TEXT NOT NULL,
    month_year TEXT NOT NULL,
    savings_paid NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
    loan_repayment NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    interest_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_mode TEXT NOT NULL DEFAULT 'Cash',
    status TEXT NOT NULL DEFAULT 'Verified',
    recorded_by_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groupo_ledger_member_phone ON public.groupo_savings_ledger(member_phone);
CREATE INDEX IF NOT EXISTS idx_groupo_ledger_group_id ON public.groupo_savings_ledger(group_id);

-- ------------------------------------------------------------------------------
-- 5. TABLE: public.groupo_meetings (கூட்ட பதிவேடு & வீடியோ மேகம்)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groupo_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groupo_groups(id) ON DELETE CASCADE,
    meeting_number INTEGER NOT NULL DEFAULT 1,
    meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    venue TEXT DEFAULT 'Panchayat Community Hall / கிராம அரங்கம்',
    agenda TEXT,
    present_member_phones JSONB DEFAULT '[]'::jsonb,
    quorum_percentage NUMERIC(5, 2) DEFAULT 100.00,
    video_drive_link TEXT,
    video_storage_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groupo_meetings_group_id ON public.groupo_meetings(group_id);

-- ------------------------------------------------------------------------------
-- 6. TABLE: public.groupo_resolutions (தீர்மான புத்தகம்)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groupo_resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groupo_groups(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES public.groupo_meetings(id) ON DELETE SET NULL,
    resolution_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    proposer_name TEXT NOT NULL,
    passed_votes INTEGER NOT NULL DEFAULT 1,
    total_votes INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Passed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groupo_resolutions_group_id ON public.groupo_resolutions(group_id);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.groupo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupo_savings_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupo_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupo_resolutions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all access to groupo_groups" ON public.groupo_groups;
    CREATE POLICY "Allow all access to groupo_groups" ON public.groupo_groups FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all access to groupo_members" ON public.groupo_members;
    CREATE POLICY "Allow all access to groupo_members" ON public.groupo_members FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all access to groupo_savings_ledger" ON public.groupo_savings_ledger;
    CREATE POLICY "Allow all access to groupo_savings_ledger" ON public.groupo_savings_ledger FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all access to groupo_meetings" ON public.groupo_meetings;
    CREATE POLICY "Allow all access to groupo_meetings" ON public.groupo_meetings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all access to groupo_resolutions" ON public.groupo_resolutions;
    CREATE POLICY "Allow all access to groupo_resolutions" ON public.groupo_resolutions FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ------------------------------------------------------------------------------
-- 8. HELPER RPC FUNCTION: Check User Role & Linked Group Details
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.groupo_get_user_role(p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_phone TEXT;
    v_leader_group RECORD;
    v_member_record RECORD;
BEGIN
    v_clean_phone := RIGHT(REGEXP_REPLACE(p_phone, '\D', '', 'g'), 10);

    -- 1. Check if user is a Group Leader
    SELECT * INTO v_leader_group 
    FROM public.groupo_groups 
    WHERE RIGHT(REGEXP_REPLACE(leader_phone, '\D', '', 'g'), 10) = v_clean_phone 
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'is_leader', true,
            'is_member', true,
            'role', 'Leader',
            'group_id', v_leader_group.id,
            'group_name', v_leader_group.name,
            'category', v_leader_group.category,
            'category_label', v_leader_group.category_label,
            'reg_code', v_leader_group.reg_code,
            'village', v_leader_group.village,
            'district', v_leader_group.district,
            'custom_attributes', v_leader_group.custom_attributes,
            'group_details', row_to_json(v_leader_group)
        );
    END IF;

    -- 2. Check if user is a Member added by a Leader
    SELECT m.*, g.name AS group_name, g.category, g.category_label, g.reg_code, g.village, g.district, g.leader_name, g.leader_phone, g.custom_attributes
    INTO v_member_record
    FROM public.groupo_members m
    JOIN public.groupo_groups g ON g.id = m.group_id
    WHERE RIGHT(REGEXP_REPLACE(m.phone, '\D', '', 'g'), 10) = v_clean_phone
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'is_leader', false,
            'is_member', true,
            'role', v_member_record.role,
            'group_id', v_member_record.group_id,
            'group_name', v_member_record.group_name,
            'category', v_member_record.category,
            'category_label', v_member_record.category_label,
            'reg_code', v_member_record.reg_code,
            'village', v_member_record.village,
            'district', v_member_record.district,
            'leader_name', v_member_record.leader_name,
            'leader_phone', v_member_record.leader_phone,
            'custom_attributes', v_member_record.custom_attributes,
            'member_details', jsonb_build_object(
                'id', v_member_record.id,
                'name', v_member_record.name,
                'phone', v_member_record.phone,
                'role', v_member_record.role,
                'current_month_paid', v_member_record.current_month_paid,
                'savings_amount', v_member_record.savings_amount,
                'total_savings_accumulated', v_member_record.total_savings_accumulated,
                'active_loan_balance', v_member_record.active_loan_balance,
                'loan_interest_rate', v_member_record.loan_interest_rate
            )
        );
    END IF;

    RETURN jsonb_build_object(
        'is_leader', false,
        'is_member', false,
        'role', 'None'
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. SEED REALISTIC GROUPS ACROSS 6 DISTINCT CATEGORIES IN TAMIL NADU
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_grp1_id UUID;
    v_grp2_id UUID;
    v_grp3_id UUID;
    v_grp4_id UUID;
    v_grp5_id UUID;
    v_grp6_id UUID;
BEGIN
    -- 1. WOMEN SHG (மகளிர் சுய உதவிக் குழு)
    INSERT INTO public.groupo_groups (
        leader_phone, leader_name, name, category, category_label, tagline,
        village, district, pincode, reg_code, bank_name, bank_account, ifsc_code,
        monthly_savings_per_member, total_savings_pool, active_loan_pool,
        custom_attributes
    ) VALUES (
        '9842111223', 'K. Meenakshi', 'தாமரை மகளிர் சுய உதவிக் குழு (Thamarai Women SHG)',
        'WomenSHG', 'மகளிர் சுய உதவிக் குழு (Mathi TNCDW)', 'மாதாந்திர சேமிப்பு, தையல் & சிறுதொழில் கூட்டமைப்பு',
        'அலங்காநல்லூர் (Alanganallur)', 'மதுரை (Madurai)', '625501', 'TNCDW-MDU-2024-8842',
        'Canara Bank (அலங்காநல்லூர்)', '*******8920', 'CNRB0001234',
        500.00, 145000.00, 40000.00,
        jsonb_build_object('livelihood', 'Tailoring & Food Products', 'bank_linkage_status', 'Eligible for ₹5L')
    ) RETURNING id INTO v_grp1_id;

    INSERT INTO public.groupo_members (group_id, phone, name, role, current_month_paid, savings_amount, total_savings_accumulated, active_loan_balance)
    VALUES
        (v_grp1_id, '9842111223', 'K. Meenakshi (மீனாட்சி)', 'President', true, 500.00, 18000.00, 0.00),
        (v_grp1_id, '9842222334', 'M. Anandhi (ஆனந்தி)', 'Secretary', true, 500.00, 18000.00, 0.00),
        (v_grp1_id, '9842333445', 'S. Lakshmi (லட்சுமி)', 'Treasurer', true, 500.00, 18000.00, 16500.00),
        (v_grp1_id, '9842444556', 'P. Kavitha (கவிதா)', 'Member', true, 500.00, 18000.00, 0.00),
        (v_grp1_id, '9842555667', 'R. Revathi (ரேவதி)', 'Member', false, 500.00, 17500.00, 0.00),
        (v_grp1_id, '6381029380', 'SuprO Guide / Animator', 'Animator', true, 500.00, 20000.00, 0.00)
    ON CONFLICT (group_id, phone) DO NOTHING;

    -- 2. FARMER PRODUCER FPO (உழவர் உற்பத்தியாளர் சங்கம்)
    INSERT INTO public.groupo_groups (
        leader_phone, leader_name, name, category, category_label, tagline,
        village, district, pincode, reg_code, bank_name, bank_account,
        monthly_savings_per_member, total_savings_pool, active_loan_pool,
        custom_attributes
    ) VALUES (
        '9443110101', 'V. Sundaram', 'பசுமை உழவர் உற்பத்தியாளர் சங்கம் (Pasumai Farmers FPO)',
        'FarmerFPO', 'உழவர் உற்பத்தியாளர் குழு (Agri FPO)', 'இயற்கை உரம் கொள்முதல், கூட்டு நெல் சாகுபடி & நேரடி சந்தை',
        'திருவையாறு (Thiruvaiyaru)', 'தஞ்சாவூர் (Thanjavur)', '613204', 'NABARD-TNJ-FPO-1049',
        'SBI Agri Branch', '*******4410', 1000.00, 320000.00, 85000.00,
        jsonb_build_object('total_acres', '140 Acres', 'crops_cultivated', 'Paddy, Black Gram, Millets', 'tractors_shared', 3)
    ) RETURNING id INTO v_grp2_id;

    INSERT INTO public.groupo_members (group_id, phone, name, role, current_month_paid, savings_amount, total_savings_accumulated)
    VALUES
        (v_grp2_id, '9443110101', 'V. Sundaram (சுந்தரம்)', 'President', true, 1000.00, 36000.00),
        (v_grp2_id, '9443220202', 'P. Marimuthu (மாரிமுத்து)', 'Secretary', true, 1000.00, 36000.00),
        (v_grp2_id, '9443330303', 'K. Durairaj (துரைராஜ்)', 'Treasurer', true, 1000.00, 36000.00)
    ON CONFLICT (group_id, phone) DO NOTHING;

    -- 3. SPORTS CLUB (விளையாட்டு & இளைஞர் சங்கம்)
    INSERT INTO public.groupo_groups (
        leader_phone, leader_name, name, category, category_label, tagline,
        village, district, pincode, reg_code, bank_name, bank_account,
        monthly_savings_per_member, total_savings_pool, active_loan_pool,
        custom_attributes
    ) VALUES (
        '9789100011', 'M. Manikandan', 'வீரத்தமிழன் கபடி & விளையாட்டு சங்கம் (Sports Club)',
        'SportsClub', 'விளையாட்டு & இளைஞர் நல சங்கம்', 'மாவட்ட அளவிலான கபடி, கிரிக்கெட் & தடகள பயிற்சி மற்றும் நிதி',
        'உசிலம்பட்டி (Usilampatti)', 'மதுரை (Madurai)', '625532', 'TN-SDAT-MDU-552',
        'Indian Bank', '*******3319', 300.00, 54000.00, 12000.00,
        jsonb_build_object('sport_name', 'Kabaddi & Cricket', 'matches_played', 28, 'trophies_won', 9, 'ground_venue', 'Govt Boys HSS Ground')
    ) RETURNING id INTO v_grp3_id;

    INSERT INTO public.groupo_members (group_id, phone, name, role, current_month_paid, savings_amount, total_savings_accumulated)
    VALUES
        (v_grp3_id, '9789100011', 'M. Manikandan (மணிகண்டன்)', 'Captain / President', true, 300.00, 6000.00),
        (v_grp3_id, '9789200022', 'K. Vignesh (விக்னேஷ்)', 'Secretary', true, 300.00, 6000.00),
        (v_grp3_id, '9789300033', 'R. Surya (சூர்யா)', 'Treasurer', true, 300.00, 6000.00)
    ON CONFLICT (group_id, phone) DO NOTHING;

    -- 4. BUSINESS & MERCHANT NETWORK (வணிகர் & சிறுதொழில் கூட்டமைப்பு)
    INSERT INTO public.groupo_groups (
        leader_phone, leader_name, name, category, category_label, tagline,
        village, district, pincode, reg_code, bank_name, bank_account,
        monthly_savings_per_member, total_savings_pool, active_loan_pool,
        custom_attributes
    ) VALUES (
        '9894101010', 'T. Murugan', 'கொங்கு சிறுவணிகர் & வர்த்தக கூட்டமைப்பு (Merchant Network)',
        'BusinessGroup', 'வணிகர் & சிறுதொழில் கூட்டமைப்பு', 'மொத்த கொள்முதல், B2B வர்த்தக வட்டம் & பண்டிகை விற்பனை',
        'பொள்ளாச்சி (Pollachi)', 'கோயம்புத்தூர் (Coimbatore)', '642001', 'TN-MSME-CBE-9801',
        'HDFC Bank', '*******5521', 2000.00, 480000.00, 150000.00,
        jsonb_build_object('trade_sector', 'Retail, Coconut & Spices', 'b2b_monthly_volume', '₹12 Lakhs')
    ) RETURNING id INTO v_grp4_id;

    -- 5. VILLAGE RESIDENT WELFARE RWA (கிராம நலச் சங்கம் / குடியிருப்போர சங்கம்)
    INSERT INTO public.groupo_groups (
        leader_phone, leader_name, name, category, category_label, tagline,
        village, district, pincode, reg_code, bank_name, bank_account,
        monthly_savings_per_member, total_savings_pool, active_loan_pool,
        custom_attributes
    ) VALUES (
        '9843202020', 'P. Shanmugam', 'அன்னை சத்யா நகர் கிராம குடியிருப்போர நலச் சங்கம் (Village RWA)',
        'VillageRWA', 'கிராம நலச் சங்கம் & குடியிருப்போர சங்கம்', 'குடிநீர், தெருவிளக்கு, தூய்மைப் பணி & ஊர் திருவிழா நிதி',
        'ஆத்தூர் (Attur)', 'சேலம் (Salem)', '636102', 'TN-RWA-SLM-342',
        'Indian Overseas Bank', '*******1109', 200.00, 78000.00, 5000.00,
        jsonb_build_object('ward_number', 'Ward 4 & 5', 'total_households', 240, 'civic_projects_done', 14)
    ) RETURNING id INTO v_grp5_id;

    -- 6. YOUTH & STUDENT STUDY CIRCLE (மாணவர் கல்வி வட்டம்)
    INSERT INTO public.groupo_groups (
        leader_phone, leader_name, name, category, category_label, tagline,
        village, district, pincode, reg_code, bank_name, bank_account,
        monthly_savings_per_member, total_savings_pool, active_loan_pool,
        custom_attributes
    ) VALUES (
        '9790303030', 'Dr. S. Karthik', 'பாரதி இளைஞர் & போட்டித் தேர்வு கல்வி வட்டம் (Youth Study Circle)',
        'YouthStudy', 'மாணவர் கல்வி & போட்டித் தேர்வு வட்டம்', 'TNPSC, NEET & பள்ளி பொதுத்தேர்வு கூட்டு படிப்பு மற்றும் புத்தக வங்கி',
        'ஸ்ரீரங்கம் (Srirangam)', 'திருச்சிராப்பள்ளி (Trichy)', '620006', 'TN-EDU-TRY-882',
        'Bank of Baroda', '*******7765', 100.00, 24000.00, 0.00,
        jsonb_build_object('target_exams', 'TNPSC Group 4, NEET, Class 10 & 12', 'books_in_bank', 420, 'weekly_tests_done', 36)
    ) RETURNING id INTO v_grp6_id;

END $$;
