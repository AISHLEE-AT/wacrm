-- schema_groupo.sql
-- GroupO Module (Microfinance / Savings Ledgers) Schema for OCI Backend

CREATE TABLE IF NOT EXISTS groupo_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leader_phone TEXT NOT NULL,
    leader_name TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'WomenSHG',
    category_label TEXT NOT NULL DEFAULT 'à®®à®•à®³à®¿à®°à¯  à®šà¯ à®¯ à®‰à®¤à®µà®¿à®•à¯  à®•à¯ à®´à¯  (Mathi TNCDW)',
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
    custom_attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groupo_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groupo_groups(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    current_month_paid BOOLEAN NOT NULL DEFAULT false,
    savings_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_savings_accumulated NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    active_loan_principal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    active_loan_interest_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, phone)
);
