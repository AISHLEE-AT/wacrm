-- ============================================================
-- 066_seed_virtual_drivers_all_tamilnadu.sql
-- For full Tamil Nadu virtual driver coverage for testing
-- ============================================================

-- Step 0: Ensure all columns exist before using them
ALTER TABLE public.drivers 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC,
  ADD COLUMN IF NOT EXISTS total_trips INT,
  ADD COLUMN IF NOT EXISTS current_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS current_lng NUMERIC,
  ADD COLUMN IF NOT EXISTS subscription_valid_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS eta_minutes INT;

-- Step 1: Delete all old virtual test drivers
DELETE FROM public.drivers WHERE mobile_number LIKE '9000000%' OR mobile_number LIKE '9100000%' OR mobile_number = '9344532738' OR whatsapp_number = '919344532738' OR phone = '919344532738';

-- Step 2: Seed virtual drivers across ALL 38 Tamil Nadu district headquarters
INSERT INTO public.drivers (
  name, mobile_number, whatsapp_number, phone,
  vehicle_type, vehicle_model, vehicle_number,
  gender, rating, total_trips,
  is_verified, status,
  pickup_latitude, pickup_longitude,
  current_lat, current_lng,
  upi_id, subscription_valid_until, eta_minutes
) VALUES
('🏍️ Chennai Bike (Virtual)', '9100000001', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0001', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Chennai Auto (Virtual)', '9100000002', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0002', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Chennai Cab (Virtual)', '9100000003', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0003', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Chennai Mini (Virtual)', '9100000004', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0004', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Chennai Sedan (Virtual)', '9100000005', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0005', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Chennai Suv (Virtual)', '9100000006', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0006', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Chennai Cargo (Virtual)', '9100000007', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0007', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Coimbatore Bike (Virtual)', '9100000008', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0008', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Coimbatore Auto (Virtual)', '9100000009', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0009', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Coimbatore Cab (Virtual)', '9100000010', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0010', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Coimbatore Mini (Virtual)', '9100000011', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0011', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Coimbatore Sedan (Virtual)', '9100000012', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0012', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Coimbatore Suv (Virtual)', '9100000013', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0013', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Coimbatore Cargo (Virtual)', '9100000014', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0014', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Madurai Bike (Virtual)', '9100000015', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0015', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Madurai Auto (Virtual)', '9100000016', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0016', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Madurai Cab (Virtual)', '9100000017', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0017', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Madurai Mini (Virtual)', '9100000018', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0018', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Madurai Sedan (Virtual)', '9100000019', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0019', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Madurai Suv (Virtual)', '9100000020', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0020', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Madurai Cargo (Virtual)', '9100000021', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0021', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tiruchirappalli Bike (Virtual)', '9100000022', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0022', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tiruchirappalli Auto (Virtual)', '9100000023', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0023', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tiruchirappalli Cab (Virtual)', '9100000024', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0024', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Tiruchirappalli Mini (Virtual)', '9100000025', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0025', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Tiruchirappalli Sedan (Virtual)', '9100000026', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0026', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Tiruchirappalli Suv (Virtual)', '9100000027', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0027', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Tiruchirappalli Cargo (Virtual)', '9100000028', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0028', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Salem Bike (Virtual)', '9100000029', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0029', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Salem Auto (Virtual)', '9100000030', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0030', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Salem Cab (Virtual)', '9100000031', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0031', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Salem Mini (Virtual)', '9100000032', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0032', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Salem Sedan (Virtual)', '9100000033', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0033', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Salem Suv (Virtual)', '9100000034', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0034', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Salem Cargo (Virtual)', '9100000035', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0035', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tirunelveli Bike (Virtual)', '9100000036', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0036', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tirunelveli Auto (Virtual)', '9100000037', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0037', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tirunelveli Cab (Virtual)', '9100000038', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0038', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Tirunelveli Mini (Virtual)', '9100000039', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0039', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Tirunelveli Sedan (Virtual)', '9100000040', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0040', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Tirunelveli Suv (Virtual)', '9100000041', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0041', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Tirunelveli Cargo (Virtual)', '9100000042', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0042', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Erode Bike (Virtual)', '9100000043', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0043', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Erode Auto (Virtual)', '9100000044', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0044', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Erode Cab (Virtual)', '9100000045', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0045', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Erode Mini (Virtual)', '9100000046', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0046', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Erode Sedan (Virtual)', '9100000047', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0047', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Erode Suv (Virtual)', '9100000048', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0048', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Erode Cargo (Virtual)', '9100000049', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0049', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Vellore Bike (Virtual)', '9100000050', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0050', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Vellore Auto (Virtual)', '9100000051', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0051', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Vellore Cab (Virtual)', '9100000052', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0052', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Vellore Mini (Virtual)', '9100000053', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0053', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Vellore Sedan (Virtual)', '9100000054', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0054', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Vellore Suv (Virtual)', '9100000055', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0055', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Vellore Cargo (Virtual)', '9100000056', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0056', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Thoothukudi Bike (Virtual)', '9100000057', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0057', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Thoothukudi Auto (Virtual)', '9100000058', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0058', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Thoothukudi Cab (Virtual)', '9100000059', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0059', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Thoothukudi Mini (Virtual)', '9100000060', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0060', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Thoothukudi Sedan (Virtual)', '9100000061', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0061', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Thoothukudi Suv (Virtual)', '9100000062', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0062', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Thoothukudi Cargo (Virtual)', '9100000063', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0063', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Thanjavur Bike (Virtual)', '9100000064', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0064', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Thanjavur Auto (Virtual)', '9100000065', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0065', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Thanjavur Cab (Virtual)', '9100000066', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0066', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Thanjavur Mini (Virtual)', '9100000067', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0067', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Thanjavur Sedan (Virtual)', '9100000068', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0068', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Thanjavur Suv (Virtual)', '9100000069', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0069', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Thanjavur Cargo (Virtual)', '9100000070', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0070', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Dindigul Bike (Virtual)', '9100000071', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0071', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Dindigul Auto (Virtual)', '9100000072', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0072', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Dindigul Cab (Virtual)', '9100000073', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0073', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Dindigul Mini (Virtual)', '9100000074', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0074', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Dindigul Sedan (Virtual)', '9100000075', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0075', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Dindigul Suv (Virtual)', '9100000076', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0076', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Dindigul Cargo (Virtual)', '9100000077', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0077', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Krishnagiri Bike (Virtual)', '9100000078', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0078', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Krishnagiri Auto (Virtual)', '9100000079', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0079', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Krishnagiri Cab (Virtual)', '9100000080', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0080', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Krishnagiri Mini (Virtual)', '9100000081', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0081', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Krishnagiri Sedan (Virtual)', '9100000082', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0082', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Krishnagiri Suv (Virtual)', '9100000083', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0083', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Krishnagiri Cargo (Virtual)', '9100000084', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0084', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Dharmapuri Bike (Virtual)', '9100000085', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0085', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Dharmapuri Auto (Virtual)', '9100000086', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0086', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Dharmapuri Cab (Virtual)', '9100000087', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0087', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Dharmapuri Mini (Virtual)', '9100000088', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0088', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Dharmapuri Sedan (Virtual)', '9100000089', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0089', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Dharmapuri Suv (Virtual)', '9100000090', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0090', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Dharmapuri Cargo (Virtual)', '9100000091', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0091', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Cuddalore Bike (Virtual)', '9100000092', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0092', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Cuddalore Auto (Virtual)', '9100000093', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0093', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Cuddalore Cab (Virtual)', '9100000094', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0094', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Cuddalore Mini (Virtual)', '9100000095', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0095', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Cuddalore Sedan (Virtual)', '9100000096', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0096', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Cuddalore Suv (Virtual)', '9100000097', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0097', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Cuddalore Cargo (Virtual)', '9100000098', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0098', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Kanchipuram Bike (Virtual)', '9100000099', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0099', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Kanchipuram Auto (Virtual)', '9100000100', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0100', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Kanchipuram Cab (Virtual)', '9100000101', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0101', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Kanchipuram Mini (Virtual)', '9100000102', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0102', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Kanchipuram Sedan (Virtual)', '9100000103', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0103', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Kanchipuram Suv (Virtual)', '9100000104', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0104', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Kanchipuram Cargo (Virtual)', '9100000105', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0105', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tiruvannamalai Bike (Virtual)', '9100000106', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0106', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tiruvannamalai Auto (Virtual)', '9100000107', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0107', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tiruvannamalai Cab (Virtual)', '9100000108', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0108', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Tiruvannamalai Mini (Virtual)', '9100000109', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0109', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Tiruvannamalai Sedan (Virtual)', '9100000110', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0110', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Tiruvannamalai Suv (Virtual)', '9100000111', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0111', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Tiruvannamalai Cargo (Virtual)', '9100000112', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0112', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Namakkal Bike (Virtual)', '9100000113', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0113', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Namakkal Auto (Virtual)', '9100000114', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0114', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Namakkal Cab (Virtual)', '9100000115', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0115', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Namakkal Mini (Virtual)', '9100000116', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0116', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Namakkal Sedan (Virtual)', '9100000117', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0117', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Namakkal Suv (Virtual)', '9100000118', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0118', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Namakkal Cargo (Virtual)', '9100000119', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0119', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Karur Bike (Virtual)', '9100000120', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0120', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Karur Auto (Virtual)', '9100000121', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0121', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Karur Cab (Virtual)', '9100000122', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0122', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Karur Mini (Virtual)', '9100000123', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0123', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Karur Sedan (Virtual)', '9100000124', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0124', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Karur Suv (Virtual)', '9100000125', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0125', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Karur Cargo (Virtual)', '9100000126', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0126', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Nagapattinam Bike (Virtual)', '9100000127', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0127', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Nagapattinam Auto (Virtual)', '9100000128', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0128', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Nagapattinam Cab (Virtual)', '9100000129', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0129', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Nagapattinam Mini (Virtual)', '9100000130', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0130', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Nagapattinam Sedan (Virtual)', '9100000131', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0131', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Nagapattinam Suv (Virtual)', '9100000132', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0132', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Nagapattinam Cargo (Virtual)', '9100000133', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0133', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Villupuram Bike (Virtual)', '9100000134', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0134', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Villupuram Auto (Virtual)', '9100000135', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0135', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Villupuram Cab (Virtual)', '9100000136', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0136', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Villupuram Mini (Virtual)', '9100000137', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0137', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Villupuram Sedan (Virtual)', '9100000138', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0138', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Villupuram Suv (Virtual)', '9100000139', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0139', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Villupuram Cargo (Virtual)', '9100000140', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0140', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Ramanathapuram Bike (Virtual)', '9100000141', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0141', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Ramanathapuram Auto (Virtual)', '9100000142', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0142', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Ramanathapuram Cab (Virtual)', '9100000143', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0143', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Ramanathapuram Mini (Virtual)', '9100000144', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0144', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Ramanathapuram Sedan (Virtual)', '9100000145', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0145', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Ramanathapuram Suv (Virtual)', '9100000146', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0146', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Ramanathapuram Cargo (Virtual)', '9100000147', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0147', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Sivaganga Bike (Virtual)', '9100000148', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0148', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Sivaganga Auto (Virtual)', '9100000149', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0149', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Sivaganga Cab (Virtual)', '9100000150', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0150', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Sivaganga Mini (Virtual)', '9100000151', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0151', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Sivaganga Sedan (Virtual)', '9100000152', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0152', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Sivaganga Suv (Virtual)', '9100000153', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0153', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Sivaganga Cargo (Virtual)', '9100000154', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0154', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Virudhunagar Bike (Virtual)', '9100000155', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0155', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Virudhunagar Auto (Virtual)', '9100000156', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0156', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Virudhunagar Cab (Virtual)', '9100000157', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0157', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Virudhunagar Mini (Virtual)', '9100000158', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0158', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Virudhunagar Sedan (Virtual)', '9100000159', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0159', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Virudhunagar Suv (Virtual)', '9100000160', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0160', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Virudhunagar Cargo (Virtual)', '9100000161', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0161', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Theni Bike (Virtual)', '9100000162', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0162', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Theni Auto (Virtual)', '9100000163', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0163', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Theni Cab (Virtual)', '9100000164', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0164', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Theni Mini (Virtual)', '9100000165', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0165', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Theni Sedan (Virtual)', '9100000166', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0166', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Theni Suv (Virtual)', '9100000167', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0167', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Theni Cargo (Virtual)', '9100000168', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0168', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Perambalur Bike (Virtual)', '9100000169', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0169', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Perambalur Auto (Virtual)', '9100000170', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0170', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Perambalur Cab (Virtual)', '9100000171', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0171', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Perambalur Mini (Virtual)', '9100000172', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0172', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Perambalur Sedan (Virtual)', '9100000173', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0173', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Perambalur Suv (Virtual)', '9100000174', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0174', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Perambalur Cargo (Virtual)', '9100000175', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0175', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Ariyalur Bike (Virtual)', '9100000176', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0176', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Ariyalur Auto (Virtual)', '9100000177', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0177', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Ariyalur Cab (Virtual)', '9100000178', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0178', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Ariyalur Mini (Virtual)', '9100000179', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0179', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Ariyalur Sedan (Virtual)', '9100000180', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0180', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Ariyalur Suv (Virtual)', '9100000181', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0181', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Ariyalur Cargo (Virtual)', '9100000182', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0182', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Pudukkottai Bike (Virtual)', '9100000183', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0183', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Pudukkottai Auto (Virtual)', '9100000184', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0184', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Pudukkottai Cab (Virtual)', '9100000185', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0185', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Pudukkottai Mini (Virtual)', '9100000186', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0186', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Pudukkottai Sedan (Virtual)', '9100000187', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0187', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Pudukkottai Suv (Virtual)', '9100000188', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0188', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Pudukkottai Cargo (Virtual)', '9100000189', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0189', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tiruvarur Bike (Virtual)', '9100000190', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0190', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tiruvarur Auto (Virtual)', '9100000191', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0191', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tiruvarur Cab (Virtual)', '9100000192', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0192', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Tiruvarur Mini (Virtual)', '9100000193', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0193', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Tiruvarur Sedan (Virtual)', '9100000194', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0194', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Tiruvarur Suv (Virtual)', '9100000195', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0195', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Tiruvarur Cargo (Virtual)', '9100000196', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0196', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Nilgiris (Ooty) Bike (Virtual)', '9100000197', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0197', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Nilgiris (Ooty) Auto (Virtual)', '9100000198', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0198', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Nilgiris (Ooty) Cab (Virtual)', '9100000199', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0199', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Nilgiris (Ooty) Mini (Virtual)', '9100000200', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0200', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Nilgiris (Ooty) Sedan (Virtual)', '9100000201', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0201', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Nilgiris (Ooty) Suv (Virtual)', '9100000202', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0202', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Nilgiris (Ooty) Cargo (Virtual)', '9100000203', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0203', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Kanyakumari Bike (Virtual)', '9100000204', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0204', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Kanyakumari Auto (Virtual)', '9100000205', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0205', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Kanyakumari Cab (Virtual)', '9100000206', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0206', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Kanyakumari Mini (Virtual)', '9100000207', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0207', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Kanyakumari Sedan (Virtual)', '9100000208', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0208', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Kanyakumari Suv (Virtual)', '9100000209', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0209', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Kanyakumari Cargo (Virtual)', '9100000210', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0210', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Hosur area Bike (Virtual)', '9100000211', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0211', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Hosur area Auto (Virtual)', '9100000212', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0212', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Hosur area Cab (Virtual)', '9100000213', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0213', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Hosur area Mini (Virtual)', '9100000214', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0214', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Hosur area Sedan (Virtual)', '9100000215', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0215', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Hosur area Suv (Virtual)', '9100000216', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0216', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Hosur area Cargo (Virtual)', '9100000217', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0217', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Ranipet Bike (Virtual)', '9100000218', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0218', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Ranipet Auto (Virtual)', '9100000219', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0219', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Ranipet Cab (Virtual)', '9100000220', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0220', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Ranipet Mini (Virtual)', '9100000221', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0221', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Ranipet Sedan (Virtual)', '9100000222', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0222', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Ranipet Suv (Virtual)', '9100000223', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0223', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Ranipet Cargo (Virtual)', '9100000224', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0224', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tirupattur Bike (Virtual)', '9100000225', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0225', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tirupattur Auto (Virtual)', '9100000226', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0226', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tirupattur Cab (Virtual)', '9100000227', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0227', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Tirupattur Mini (Virtual)', '9100000228', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0228', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Tirupattur Sedan (Virtual)', '9100000229', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0229', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Tirupattur Suv (Virtual)', '9100000230', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0230', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Tirupattur Cargo (Virtual)', '9100000231', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0231', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Chengalpattu Bike (Virtual)', '9100000232', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0232', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Chengalpattu Auto (Virtual)', '9100000233', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0233', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Chengalpattu Cab (Virtual)', '9100000234', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0234', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Chengalpattu Mini (Virtual)', '9100000235', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0235', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Chengalpattu Sedan (Virtual)', '9100000236', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0236', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Chengalpattu Suv (Virtual)', '9100000237', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0237', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Chengalpattu Cargo (Virtual)', '9100000238', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0238', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Kallakurichi Bike (Virtual)', '9100000239', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0239', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Kallakurichi Auto (Virtual)', '9100000240', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0240', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Kallakurichi Cab (Virtual)', '9100000241', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0241', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Kallakurichi Mini (Virtual)', '9100000242', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0242', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Kallakurichi Sedan (Virtual)', '9100000243', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0243', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Kallakurichi Suv (Virtual)', '9100000244', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0244', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Kallakurichi Cargo (Virtual)', '9100000245', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0245', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tenkasi Bike (Virtual)', '9100000246', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0246', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tenkasi Auto (Virtual)', '9100000247', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0247', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tenkasi Cab (Virtual)', '9100000248', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0248', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Tenkasi Mini (Virtual)', '9100000249', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0249', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Tenkasi Sedan (Virtual)', '9100000250', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0250', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Tenkasi Suv (Virtual)', '9100000251', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0251', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Tenkasi Cargo (Virtual)', '9100000252', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0252', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Mayiladuthurai Bike (Virtual)', '9100000253', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0253', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Mayiladuthurai Auto (Virtual)', '9100000254', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0254', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Mayiladuthurai Cab (Virtual)', '9100000255', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0255', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Mayiladuthurai Mini (Virtual)', '9100000256', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0256', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Mayiladuthurai Sedan (Virtual)', '9100000257', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0257', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Mayiladuthurai Suv (Virtual)', '9100000258', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0258', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Mayiladuthurai Cargo (Virtual)', '9100000259', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0259', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tiruvallur Bike (Virtual)', '9100000260', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0260', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tiruvallur Auto (Virtual)', '9100000261', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0261', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tiruvallur Cab (Virtual)', '9100000262', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0262', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚗 Tiruvallur Mini (Virtual)', '9100000263', '919344532738', '919344532738', 'mini', 'Tata Indica', 'TN XX MN 0263', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚙 Tiruvallur Sedan (Virtual)', '9100000264', '919344532738', '919344532738', 'sedan', 'Honda City', 'TN XX SD 0264', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚐 Tiruvallur Suv (Virtual)', '9100000265', '919344532738', '919344532738', 'suv', 'Toyota Innova', 'TN XX SV 0265', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛻 Tiruvallur Cargo (Virtual)', '9100000266', '919344532738', '919344532738', 'cargo', 'Tata Ace', 'TN XX CG 0266', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3);

-- Step 3: Fix get_nearby_drivers RPC — safe Haversine (no PostGIS required)
CREATE OR REPLACE FUNCTION get_nearby_drivers(
  pickup_lat NUMERIC,
  pickup_lon NUMERIC,
  radius_km NUMERIC DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  vehicle_type TEXT,
  vehicle_model TEXT,
  vehicle_number TEXT,
  rating NUMERIC,
  status TEXT,
  distance_km NUMERIC,
  eta_minutes INT,
  upi_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    COALESCE(d.phone, d.mobile_number, d.whatsapp_number) AS phone,
    d.vehicle_type,
    COALESCE(d.vehicle_model, '') AS vehicle_model,
    COALESCE(d.vehicle_number, '') AS vehicle_number,
    COALESCE(d.rating, 4.5) AS rating,
    d.status,
    -- Haversine distance in km
    ROUND((6371.0 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(pickup_lat)) *
        cos(radians(COALESCE(d.pickup_latitude, d.current_lat))) *
        cos(radians(COALESCE(d.pickup_longitude, d.current_lng)) - radians(pickup_lon)) +
        sin(radians(pickup_lat)) *
        sin(radians(COALESCE(d.pickup_latitude, d.current_lat)))
      ))
    ))::NUMERIC, 2) AS distance_km,
    COALESCE(d.eta_minutes,
      GREATEST(2, (
        6371.0 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(pickup_lat)) *
            cos(radians(COALESCE(d.pickup_latitude, d.current_lat))) *
            cos(radians(COALESCE(d.pickup_longitude, d.current_lng)) - radians(pickup_lon)) +
            sin(radians(pickup_lat)) *
            sin(radians(COALESCE(d.pickup_latitude, d.current_lat)))
          ))
        ) * 2.0
      )::INT)
    ) AS eta_minutes,
    COALESCE(d.upi_id, '') AS upi_id
  FROM public.drivers d
  WHERE
    d.status = 'online'
    AND COALESCE(d.pickup_latitude, d.current_lat) IS NOT NULL
    AND COALESCE(d.pickup_longitude, d.current_lng) IS NOT NULL
    -- Fast bounding box pre-filter
    AND COALESCE(d.pickup_latitude, d.current_lat)
        BETWEEN pickup_lat - (radius_km / 111.0) AND pickup_lat + (radius_km / 111.0)
    AND COALESCE(d.pickup_longitude, d.current_lng)
        BETWEEN pickup_lon - (radius_km / (111.0 * cos(radians(pickup_lat))))
            AND pickup_lon + (radius_km / (111.0 * cos(radians(pickup_lat))))
    -- Exact Haversine radius check
    AND (6371.0 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(pickup_lat)) *
        cos(radians(COALESCE(d.pickup_latitude, d.current_lat))) *
        cos(radians(COALESCE(d.pickup_longitude, d.current_lng)) - radians(pickup_lon)) +
        sin(radians(pickup_lat)) *
        sin(radians(COALESCE(d.pickup_latitude, d.current_lat)))
      ))
    )) <= radius_km
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$;

GRANT EXECUTE ON FUNCTION get_nearby_drivers(NUMERIC, NUMERIC, NUMERIC) TO anon, authenticated;
