-- ==============================================================================
-- PART 3: BULLETPROOF SEED SCRIPT FOR ADMIN (9486335870) & VIRTUAL DRIVER (9123596988)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- Creates auth.users entries first to satisfy foreign key constraints.
-- ==============================================================================

DO $$
DECLARE
    admin_uid UUID;
    driver_uid UUID;
BEGIN
    -- 1. Ensure columns exist on profiles
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

    -- 2. Find or Create Admin User (9486335870) in auth.users
    SELECT id INTO admin_uid 
    FROM auth.users 
    WHERE phone = '9486335870' 
       OR email = '9486335870@whatsapp.wacrm.local' 
       OR raw_user_meta_data->>'phone' = '9486335870'
    LIMIT 1;

    IF admin_uid IS NULL THEN
        admin_uid := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            phone,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            admin_uid,
            '00000000-0000-0000-0000-000000000001',
            'authenticated',
            'authenticated',
            '9486335870@whatsapp.wacrm.local',
            '$2a$10$wACRM.Admin.Pass.Secret.Key.Hash.2026',
            NOW(),
            '9486335870',
            '{"provider": "email", "providers": ["email"]}',
            '{"phone": "9486335870", "role": "admin", "full_name": "Admin User (FAGO SuperAdmin)"}',
            NOW(),
            NOW()
        );
    END IF;

    -- Upsert Admin Profile in public.profiles using admin_uid
    INSERT INTO public.profiles (
        id,
        full_name,
        phone,
        whatsapp,
        role,
        main_category,
        default_module,
        profile_complete,
        pincode,
        points
    ) VALUES (
        admin_uid,
        'Admin User (FAGO & WACRM SuperAdmin)',
        '9486335870',
        '9486335870',
        'admin',
        'Admin',
        'crm',
        true,
        '641001',
        10000
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        phone = '9486335870',
        whatsapp = '9486335870',
        full_name = 'Admin User (FAGO & WACRM SuperAdmin)';


    -- 3. Find or Create Virtual Driver (9123596988) in auth.users
    SELECT id INTO driver_uid 
    FROM auth.users 
    WHERE phone = '9123596988' 
       OR email = '9123596988@whatsapp.wacrm.local' 
       OR raw_user_meta_data->>'phone' = '9123596988'
    LIMIT 1;

    IF driver_uid IS NULL THEN
        driver_uid := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            phone,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            driver_uid,
            '00000000-0000-0000-0000-000000000001',
            'authenticated',
            'authenticated',
            '9123596988@whatsapp.wacrm.local',
            '$2a$10$wACRM.Driver.Pass.Secret.Key.Hash.2026',
            NOW(),
            '9123596988',
            '{"provider": "email", "providers": ["email"]}',
            '{"phone": "9123596988", "role": "driver", "full_name": "FAGO Test Driver"}',
            NOW(),
            NOW()
        );
    END IF;

    -- Upsert Driver Profile in public.profiles using driver_uid
    INSERT INTO public.profiles (
        id,
        full_name,
        phone,
        whatsapp,
        role,
        main_category,
        default_module,
        profile_complete,
        pincode
    ) VALUES (
        driver_uid,
        'FAGO Test Driver (Virtual Respondent)',
        '9123596988',
        '9123596988',
        'driver',
        'Driver',
        'rideo',
        true,
        '641001'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'driver',
        phone = '9123596988',
        whatsapp = '9123596988',
        full_name = 'FAGO Test Driver (Virtual Respondent)';


    -- 4. Seed Virtual Driver across ALL vehicle types in public.drivers table
    DELETE FROM public.drivers WHERE mobile_number = '9123596988' OR phone = '9123596988';

    INSERT INTO public.drivers (
        user_id,
        name,
        driver_name,
        mobile_number,
        phone,
        whatsapp,
        vehicle_number,
        vehicle_type,
        vehicle_category,
        driving_license,
        upi_id,
        status,
        pincode,
        is_online,
        is_verified,
        verification_status,
        pickup_latitude,
        pickup_longitude
    ) VALUES
    (driver_uid, 'FAGO Driver (Auto)',      'FAGO Driver (Auto)',      '9123596988', '9123596988', '9123596988', 'TN 37 EV 2026', 'Auto',      'Auto',      'VERIFIED-LIC-9123596988', '9123596988@paytm', 'online', '641001', true, true, 'approved', 11.0168, 76.9558),
    (driver_uid, 'FAGO Driver (Bike)',      'FAGO Driver (Bike)',      '9123596988', '9123596988', '9123596988', 'TN 37 BK 2026', 'Bike',      'Bike',      'VERIFIED-LIC-9123596988', '9123596988@paytm', 'online', '641001', true, true, 'approved', 11.0168, 76.9558),
    (driver_uid, 'FAGO Driver (Car)',       'FAGO Driver (Car)',       '9123596988', '9123596988', '9123596988', 'TN 37 CR 2026', 'Car',       'Car',       'VERIFIED-LIC-9123596988', '9123596988@paytm', 'online', '641001', true, true, 'approved', 11.0168, 76.9558),
    (driver_uid, 'FAGO Driver (Tractor)',   'FAGO Driver (Tractor)',   '9123596988', '9123596988', '9123596988', 'TN 37 TR 2026', 'Tractor',   'Tractor',   'VERIFIED-LIC-9123596988', '9123596988@paytm', 'online', '641001', true, true, 'approved', 11.0168, 76.9558),
    (driver_uid, 'FAGO Driver (Ambulance)', 'FAGO Driver (Ambulance)', '9123596988', '9123596988', '9123596988', 'TN 37 AM 2026', 'Ambulance', 'Ambulance', 'VERIFIED-LIC-9123596988', '9123596988@paytm', 'online', '641001', true, true, 'approved', 11.0168, 76.9558),
    (driver_uid, 'FAGO Driver (Truck)',     'FAGO Driver (Truck)',     '9123596988', '9123596988', '9123596988', 'TN 37 TK 2026', 'Truck',     'Truck',     'VERIFIED-LIC-9123596988', '9123596988@paytm', 'online', '641001', true, true, 'approved', 11.0168, 76.9558);

END $$;

-- 5. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

SELECT '=== 👑 ADMIN (9486335870) & VIRTUAL DRIVER (9123596988) SUCCESSFULLY CREATED & SEEDED! ===' AS status;
