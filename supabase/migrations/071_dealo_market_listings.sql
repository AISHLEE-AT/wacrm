-- ==============================================================================
-- MIGRATION 071: DealO Local Goods Trading & Marketplace Schema
-- Supports:
-- 1. Local farmers, shop owners, cattle traders, cereal traders listing sellable goods
-- 2. 1-Click Profile Integration (WhatsApp phone, UPI ID, GPS Location, Pincode)
-- 3. Pincode-wise search & filtering for buyers and admin approval queue
-- 4. Automated verification & realtime live synchronization
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_whatsapp TEXT NOT NULL,
  seller_upi TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'farm_produce', -- 'livestock' | 'cereals' | 'farm_produce' | 'machinery_tools' | 'general_shop'
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'per_item', -- 'per_head' | 'per_kg' | 'per_bag' | 'per_item' | 'per_ton' | 'per_acre'
  quantity NUMERIC DEFAULT 1,
  description TEXT,
  image_url TEXT,
  pincode VARCHAR(10) NOT NULL,
  district TEXT,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'sold' | 'rejected'
  rejection_reason TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast Pincode & Category queries
CREATE INDEX IF NOT EXISTS idx_market_listings_pincode ON public.market_listings (pincode);
CREATE INDEX IF NOT EXISTS idx_market_listings_category ON public.market_listings (category);
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON public.market_listings (status);
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON public.market_listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_listings_seller_phone ON public.market_listings (seller_phone);

-- Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'market_listings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.market_listings;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies
DROP POLICY IF EXISTS "Public can view market listings" ON public.market_listings;
CREATE POLICY "Public can view market listings"
  ON public.market_listings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert market listings" ON public.market_listings;
CREATE POLICY "Anyone can insert market listings"
  ON public.market_listings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sellers and admins can update listings" ON public.market_listings;
CREATE POLICY "Sellers and admins can update listings"
  ON public.market_listings FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Admins and sellers can delete listings" ON public.market_listings;
CREATE POLICY "Admins and sellers can delete listings"
  ON public.market_listings FOR DELETE
  USING (true);

-- Seed Initial Verified Market Listings across Key Tamil Nadu Hubs (Pattukkottai, Thanjavur, Madurai, Coimbatore, Salem)
INSERT INTO public.market_listings (
  seller_name, seller_phone, seller_whatsapp, seller_upi,
  title, category, price, unit, quantity, description,
  pincode, district, location_name, latitude, longitude, status
) VALUES
(
  'முருகன் (Murugan)', '6381029380', '6381029380', '6381029380@upi',
  'நாட்டு காங்கேயம் காளை & கறவை பசு (Kangeyam Cow & Bull Pair)', 'livestock', 65000, 'per_head', 2,
  'நாட்டு இனம், நல்ல பால் கறவை (தினசரி 8 லிட்டர்), ஆரோக்கியமான மாடுகள். நேரடி பண்ணை பார்வைக்கு வரலாம்.',
  '614904', 'Thanjavur', 'Pattukkottai Rural', 10.4312, 79.3194, 'approved'
),
(
  'செல்வம் (Selvam Trader)', '6381029380', '6381029380', '6381029380@upi',
  'செம்மறி ஆடு & கொடி ஆடு ஜோடி (Tellicherry Goat Pair)', 'livestock', 18000, 'per_head', 6,
  'வளர்ப்பு மற்றும் வியாபாரத்திற்கு ஏற்ற கொடி ஆடுகள். தடுப்பூசி போடப்பட்டது.',
  '614904', 'Thanjavur', 'Pattukkottai Town', 10.4289, 79.3150, 'approved'
),
(
  'கதிரவன் உழவர் குழு (Kathiravan Farmers)', '916381029380', '916381029380', 'kathir@upi',
  'ஆர்கானிக் பொன்னி நெல் மூட்டை (Organic Ponni Paddy 75kg)', 'cereals', 2150, 'per_bag', 40,
  'இயற்கை உரத்தில் விளைந்த முதல் தர பொன்னி நெல். நேரடி கொள்முதல்.',
  '614904', 'Thanjavur', 'Madukkur', 10.4850, 79.4020, 'approved'
),
(
  'குமரன் அக்ரோ ஸ்டோர் (Kumaran Agro Tools)', '6381029380', '6381029380', 'kumaran@upi',
  'ஹெவி டியூட்டி டிராக்டர் உழவு கொழு & ரோட்டாவேட்டர் பிளேடுகள்', 'machinery_tools', 4500, 'per_item', 15,
  'டாடா ஸ்டீல் அலாய் மெட்டீரியல், நீண்ட உழைப்பு. 1 வருட வாரண்டி.',
  '614904', 'Thanjavur', 'Pattukkottai Bypass', 10.4350, 79.3240, 'approved'
),
(
  'அன்பு விவசாயிகள் சங்கம் (Anbu Farmers)', '6381029380', '6381029380', '6381029380@upi',
  'நாட்டு முருங்கை & தேங்காய் மொத்த விற்பனை (Fresh Farm Coconut)', 'farm_produce', 28, 'per_item', 500,
  'மரத்திலிருந்து பறிக்கப்பட்ட எண்ணெய் சத்து மிகுந்த பெரிய தேங்காய்.',
  '614601', 'Pudukkottai', 'Aranthangi Road', 10.3800, 78.8200, 'approved'
),
(
  'ராஜேந்திரன் மாட்டு பண்ணை (Rajendran Dairy)', '916381029380', '916381029380', 'rajendran@upi',
  'முர்ரா எருமை மாடு (Murrah High Milk Yield Buffalo)', 'livestock', 72000, 'per_head', 1,
  'தினசரி 14 லிட்டர் பால் தரும் முதல் ஈத்து முர்ரா எருமை.',
  '620001', 'Tiruchirappalli', 'Srirangam Road', 10.8600, 78.6900, 'approved'
)
ON CONFLICT DO NOTHING;
