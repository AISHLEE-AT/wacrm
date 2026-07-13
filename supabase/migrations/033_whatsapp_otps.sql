-- ============================================================
-- whatsapp_otps: Secure OTP storage for WhatsApp-based login
-- ============================================================

CREATE TABLE IF NOT EXISTS whatsapp_otps (
  phone_number TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We use phone_number as PK so that any new OTP request 
-- for the same phone number simply overrides the old one via UPSERT.

-- RLS: Only the service role (backend) should access this table.
ALTER TABLE whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- No policies for public or authenticated roles means they have zero access.
-- The Service Role bypasses RLS inherently.
