-- ============================================================
-- 061_rideo_improvements.sql - RideO & DriveO Zero-Friction 
-- Adds OTP, Driver UPI, Daily Subscriptions, and Ride Statuses
-- ============================================================

-- 1. Updates to Drivers Table (Economics & Zero-Commission)
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS accepted_payment_methods TEXT[] DEFAULT ARRAY['cash', 'upi']::TEXT[],
  ADD COLUMN IF NOT EXISTS subscription_valid_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'; -- 7 days free trial for new drivers!

-- 2. Updates to Rides Table (Security & Tracking)
ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS otp VARCHAR(4),
  ADD COLUMN IF NOT EXISTS user_phone TEXT, -- Store customer phone for easy WhatsApp API replies
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT; -- To store what they selected (bike, auto, cab)

-- 3. Update Rides Status Check Constraint
-- Drop the existing constraint on rides.status if it exists
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.rides'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.rides DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Add the new expanded status constraint
ALTER TABLE public.rides
  ADD CONSTRAINT rides_status_check 
  CHECK (status IN ('pending', 'searching', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'));

-- 4. Set pending rides to default to current time for creation
-- (Already handled by created_at, but we can add indexes for dispatch)
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status_sub ON drivers(status, subscription_valid_until);
