-- ============================================================================
-- Migration: 069_guided_flow_and_analytics.sql
-- Description: Schema, RLS, Indexes, Seed Data & RPCs for SuprO Guided Assessment Flow
-- Tested & Compatible with PostgreSQL 14+, 15+, 16+ & Supabase
-- ============================================================================

-- 1. Create flow_nodes table (Dynamic Flow Tree for Remote Sync)
CREATE TABLE IF NOT EXISTS public.flow_nodes (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('BRANCH', 'LEAF_PURCHASE', 'LEAF_COMING_SOON')),
    question TEXT,
    options JSONB, -- Array of { label: string, nextId: string }
    title TEXT,
    description TEXT,
    purchase_url TEXT,
    message TEXT,
    category_tag TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create pending_requests table (User interest capture on LEAF_COMING_SOON)
CREATE TABLE IF NOT EXISTS public.pending_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone TEXT,
    user_name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'cancelled')),
    notified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create flow_analytics table (Option tap telemetry & drop-off analytics)
CREATE TABLE IF NOT EXISTS public.flow_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    node_id TEXT NOT NULL,
    option_label TEXT,
    user_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_analytics ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to ensure clean re-run
DROP POLICY IF EXISTS "Public can read active flow nodes" ON public.flow_nodes;
DROP POLICY IF EXISTS "Admins can manage flow nodes" ON public.flow_nodes;
DROP POLICY IF EXISTS "Anyone can insert pending requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Admins can view pending requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Admins can update pending requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Anyone can log flow analytics" ON public.flow_analytics;
DROP POLICY IF EXISTS "Admins can view flow analytics" ON public.flow_analytics;

-- 6. Flow Nodes Policies
CREATE POLICY "Public can read active flow nodes"
ON public.flow_nodes FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Admins can manage flow nodes"
ON public.flow_nodes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.phone IN ('6381029380', '9876543210', '9486335870'))
    )
);

-- 7. Pending Requests Policies
CREATE POLICY "Anyone can insert pending requests"
ON public.pending_requests FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view pending requests"
ON public.pending_requests FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.phone IN ('6381029380', '9876543210', '9486335870'))
    )
);

CREATE POLICY "Admins can update pending requests"
ON public.pending_requests FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.phone IN ('6381029380', '9876543210', '9486335870'))
    )
);

-- 8. Flow Analytics Policies
CREATE POLICY "Anyone can log flow analytics"
ON public.flow_analytics FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view flow analytics"
ON public.flow_analytics FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.phone IN ('6381029380', '9876543210', '9486335870'))
    )
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_flow_nodes_category ON public.flow_nodes(category_tag);
CREATE INDEX IF NOT EXISTS idx_pending_requests_node ON public.pending_requests(node_id);
CREATE INDEX IF NOT EXISTS idx_pending_requests_phone ON public.pending_requests(phone);
CREATE INDEX IF NOT EXISTS idx_pending_requests_status ON public.pending_requests(status);
CREATE INDEX IF NOT EXISTS idx_flow_analytics_event ON public.flow_analytics(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_flow_analytics_node ON public.flow_analytics(node_id);

-- 10. Analytics Aggregation Function (PL/pgSQL for maximum compatibility)
CREATE OR REPLACE FUNCTION public.get_flow_analytics_summary()
RETURNS TABLE (
    node_id TEXT,
    event_count BIGINT,
    unique_users BIGINT,
    pending_notify_requests BIGINT,
    last_activity TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fa.node_id,
        COUNT(fa.id)::BIGINT AS event_count,
        COUNT(DISTINCT fa.user_id)::BIGINT AS unique_users,
        COALESCE(pr_count.total_requests, 0)::BIGINT AS pending_notify_requests,
        MAX(fa.created_at) AS last_activity
    FROM public.flow_analytics fa
    LEFT JOIN (
        SELECT pr.node_id, COUNT(*)::BIGINT AS total_requests 
        FROM public.pending_requests pr
        WHERE pr.status = 'pending' 
        GROUP BY pr.node_id
    ) pr_count ON pr_count.node_id = fa.node_id
    GROUP BY fa.node_id, pr_count.total_requests
    ORDER BY event_count DESC;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_flow_analytics_summary() TO authenticated, anon;

-- 11. Initial Seed Data for Flow Nodes
INSERT INTO public.flow_nodes (id, type, question, options, title, description, purchase_url, message, category_tag)
VALUES
(
    'root',
    'BRANCH',
    'Which competitive exam or learning path are you preparing for?',
    '[
        {"label": "🏛️ TNPSC (Tamil Nadu Public Service Commission)", "nextId": "tnpsc_group_select"},
        {"label": "🏦 Banking & Insurance Exams (IBPS, SBI, RBI)", "nextId": "banking_coming_soon"},
        {"label": "🚆 Railway Recruitment Board (RRB NTPC & Group D)", "nextId": "rrb_coming_soon"},
        {"label": "👮 TNUSRB Police & Sub-Inspector Exams", "nextId": "police_coming_soon"}
    ]'::jsonb,
    NULL, NULL, NULL, NULL,
    'competitive_exams'
),
(
    'banking_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'Banking & Insurance Test Series',
    NULL, NULL,
    'IBPS PO/Clerk, SBI PO, and RBI Assistant mock test series with Tamil & English bilingual explanations are currently being crafted by our expert educators.',
    'banking'
),
(
    'rrb_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'Railway Recruitment (RRB) Test Series',
    NULL, NULL,
    'Comprehensive CBT 1 & 2 mock test packs for RRB NTPC, Group D, and ALP are coming in the next release.',
    'rrb'
),
(
    'police_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'TNUSRB Police Constable & SI Test Series',
    NULL, NULL,
    'Full-length physical test guidance & theoretical mock exams for TNUSRB are in development.',
    'police'
),
(
    'tnpsc_group_select',
    'BRANCH',
    'Select your specific TNPSC Examination Target:',
    '[
        {"label": "🎯 TNPSC Group 1 (Prelims & Mains)", "nextId": "tnpsc_g1_subject_select"},
        {"label": "📑 TNPSC Group 2 & 2A (Services)", "nextId": "tnpsc_g2_coming_soon"},
        {"label": "💼 TNPSC Group 4 & VAO (Village Admin Officer)", "nextId": "tnpsc_g4_coming_soon"}
    ]'::jsonb,
    NULL, NULL, NULL, NULL,
    'tnpsc'
),
(
    'tnpsc_g2_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'TNPSC Group 2 & 2A Mock Tests',
    NULL, NULL,
    'Group 2 & 2A full syllabus preliminary test papers and evaluation keys are arriving shortly.',
    'tnpsc'
),
(
    'tnpsc_g4_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'TNPSC Group 4 & VAO Master Pack',
    NULL, NULL,
    'The 100-test VAO master bundle is currently in final verification by subject matter experts.',
    'tnpsc'
),
(
    'tnpsc_g1_subject_select',
    'BRANCH',
    'Choose the Subject for TNPSC Group 1 Preparation:',
    '[
        {"label": "📖 General Tamil & Literature (பொதுத் தமிழ்)", "nextId": "tnpsc_g1_tamil_topic_select"},
        {"label": "📜 Indian History & Culture of Tamil Nadu", "nextId": "tnpsc_g1_history_coming_soon"},
        {"label": "⚖️ Indian Polity & Governance", "nextId": "tnpsc_g1_polity_coming_soon"},
        {"label": "📐 Aptitude & Mental Ability", "nextId": "tnpsc_g1_aptitude_coming_soon"}
    ]'::jsonb,
    NULL, NULL, NULL, NULL,
    'tnpsc'
),
(
    'tnpsc_g1_history_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'TNPSC G1 History & Tamil Culture Pack',
    NULL, NULL,
    'Ancient to Modern Indian History & Sangam Age deep-dive questions are being finalized.',
    'tnpsc'
),
(
    'tnpsc_g1_polity_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'Indian Polity & Constitution Pack',
    NULL, NULL,
    'Articles, Amendments, and Landmark Supreme Court judgments test suite is coming soon.',
    'tnpsc'
),
(
    'tnpsc_g1_aptitude_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'Aptitude & Mental Ability Fast-Track',
    NULL, NULL,
    'Speed math, logical reasoning, and data interpretation tests are releasing soon.',
    'tnpsc'
),
(
    'tnpsc_g1_tamil_topic_select',
    'BRANCH',
    'Select the Tamil Section you want to master:',
    '[
        {"label": "✍️ Tamil Grammar & Usage (இலக்கணம்)", "nextId": "tnpsc_g1_tamil_grammar_subtopic"},
        {"label": "📜 Sangam Literature & Epics (இலக்கியம்)", "nextId": "tnpsc_g1_tamil_literature_coming_soon"},
        {"label": "🏛️ Tamil Scholars & Service (தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும்)", "nextId": "tnpsc_g1_tamil_scholars_coming_soon"}
    ]'::jsonb,
    NULL, NULL, NULL, NULL,
    'tnpsc'
),
(
    'tnpsc_g1_tamil_literature_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'TNPSC Tamil Literature Master Module',
    NULL, NULL,
    'Ettuthogai, Pathupattu, Thirukkural, and Silappathikaram chapter-wise quizzes are under preparation.',
    'tnpsc'
),
(
    'tnpsc_g1_tamil_scholars_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'Tamil Scholars & Renaissance',
    NULL, NULL,
    'Bharathiyar, Bharathidasan, and contemporary Tamil literary scholars test set is coming soon.',
    'tnpsc'
),
(
    'tnpsc_g1_tamil_grammar_subtopic',
    'BRANCH',
    'Select your specific Grammar (இலக்கணம்) Focus Area:',
    '[
        {"label": "🔍 சொல்லிலக்கணம் & பெயரெச்சம்/வினையெச்சம் Master Test", "nextId": "test_purchase_tamil_grammar_pro"},
        {"label": "📝 வேற்றுமை உருபுகள் & புணர்ச்சி விதிகள்", "nextId": "tamil_punarchi_coming_soon"}
    ]'::jsonb,
    NULL, NULL, NULL, NULL,
    'tnpsc'
),
(
    'tamil_punarchi_coming_soon',
    'LEAF_COMING_SOON',
    NULL, NULL,
    'புணர்ச்சி விதிகள் & சந்திப் பிழை திருத்தம் Test Series',
    NULL, NULL,
    'Rule-based grammar exercises and error identification tests are in production.',
    'tnpsc'
),
(
    'test_purchase_tamil_grammar_pro',
    'LEAF_PURCHASE',
    NULL, NULL,
    'TNPSC Group 1: சொல்லிலக்கணம் & இலக்கணக் குறிப்பு Premium Test Pack',
    '500+ Curated high-yield multiple-choice questions with detailed Tamil explanations, Samacheer Kalvi aligned syllabus, timer-based mock exam interface, and instant percentile ranking.',
    'https://watscrm.vercel.app/testo/tnpsc-g1-tamil-grammar',
    NULL,
    'tnpsc'
)
ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    question = EXCLUDED.question,
    options = EXCLUDED.options,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    purchase_url = EXCLUDED.purchase_url,
    message = EXCLUDED.message,
    category_tag = EXCLUDED.category_tag,
    updated_at = NOW();
