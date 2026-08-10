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
('🏍️ Chennai Bike (Virtual)', '9100000001', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0002', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Chennai Auto (Virtual)', '9100000002', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0003', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Chennai Cab (Virtual)', '9100000003', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0004', 'male', 4.8, 320, true, 'online', 13.0827, 80.2707, 13.0827, 80.2707, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Coimbatore Bike (Virtual)', '9100000004', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0005', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Coimbatore Auto (Virtual)', '9100000005', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0006', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Coimbatore Cab (Virtual)', '9100000006', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0007', 'male', 4.8, 320, true, 'online', 11.0168, 76.9558, 11.0168, 76.9558, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Madurai Bike (Virtual)', '9100000007', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0008', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Madurai Auto (Virtual)', '9100000008', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0009', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Madurai Cab (Virtual)', '9100000009', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0010', 'male', 4.8, 320, true, 'online', 9.9252, 78.1198, 9.9252, 78.1198, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tiruchirappalli Bike (Virtual)', '9100000010', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0011', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tiruchirappalli Auto (Virtual)', '9100000011', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0012', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tiruchirappalli Cab (Virtual)', '9100000012', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0013', 'male', 4.8, 320, true, 'online', 10.7905, 78.7047, 10.7905, 78.7047, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Salem Bike (Virtual)', '9100000013', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0014', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Salem Auto (Virtual)', '9100000014', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0015', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Salem Cab (Virtual)', '9100000015', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0016', 'male', 4.8, 320, true, 'online', 11.6643, 78.146, 11.6643, 78.146, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tirunelveli Bike (Virtual)', '9100000016', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0017', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tirunelveli Auto (Virtual)', '9100000017', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0018', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tirunelveli Cab (Virtual)', '9100000018', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0019', 'male', 4.8, 320, true, 'online', 8.7139, 77.7567, 8.7139, 77.7567, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Erode Bike (Virtual)', '9100000019', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0020', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Erode Auto (Virtual)', '9100000020', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0021', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Erode Cab (Virtual)', '9100000021', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0022', 'male', 4.8, 320, true, 'online', 11.341, 77.7172, 11.341, 77.7172, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Vellore Bike (Virtual)', '9100000022', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0023', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Vellore Auto (Virtual)', '9100000023', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0024', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Vellore Cab (Virtual)', '9100000024', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0025', 'male', 4.8, 320, true, 'online', 12.9165, 79.1325, 12.9165, 79.1325, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Thoothukudi Bike (Virtual)', '9100000025', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0026', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Thoothukudi Auto (Virtual)', '9100000026', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0027', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Thoothukudi Cab (Virtual)', '9100000027', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0028', 'male', 4.8, 320, true, 'online', 8.7642, 78.1348, 8.7642, 78.1348, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Thanjavur Bike (Virtual)', '9100000028', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0029', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Thanjavur Auto (Virtual)', '9100000029', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0030', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Thanjavur Cab (Virtual)', '9100000030', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0031', 'male', 4.8, 320, true, 'online', 10.787, 79.1378, 10.787, 79.1378, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Dindigul Bike (Virtual)', '9100000031', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0032', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Dindigul Auto (Virtual)', '9100000032', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0033', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Dindigul Cab (Virtual)', '9100000033', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0034', 'male', 4.8, 320, true, 'online', 10.3624, 77.9695, 10.3624, 77.9695, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Krishnagiri Bike (Virtual)', '9100000034', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0035', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Krishnagiri Auto (Virtual)', '9100000035', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0036', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Krishnagiri Cab (Virtual)', '9100000036', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0037', 'male', 4.8, 320, true, 'online', 12.5186, 78.2138, 12.5186, 78.2138, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Dharmapuri Bike (Virtual)', '9100000037', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0038', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Dharmapuri Auto (Virtual)', '9100000038', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0039', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Dharmapuri Cab (Virtual)', '9100000039', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0040', 'male', 4.8, 320, true, 'online', 12.1275, 78.158, 12.1275, 78.158, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Cuddalore Bike (Virtual)', '9100000040', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0041', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Cuddalore Auto (Virtual)', '9100000041', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0042', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Cuddalore Cab (Virtual)', '9100000042', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0043', 'male', 4.8, 320, true, 'online', 11.748, 79.7714, 11.748, 79.7714, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Kanchipuram Bike (Virtual)', '9100000043', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0044', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Kanchipuram Auto (Virtual)', '9100000044', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0045', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Kanchipuram Cab (Virtual)', '9100000045', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0046', 'male', 4.8, 320, true, 'online', 12.8342, 79.7036, 12.8342, 79.7036, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tiruvannamalai Bike (Virtual)', '9100000046', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0047', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tiruvannamalai Auto (Virtual)', '9100000047', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0048', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tiruvannamalai Cab (Virtual)', '9100000048', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0049', 'male', 4.8, 320, true, 'online', 12.2253, 79.0747, 12.2253, 79.0747, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Namakkal Bike (Virtual)', '9100000049', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0050', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Namakkal Auto (Virtual)', '9100000050', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0051', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Namakkal Cab (Virtual)', '9100000051', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0052', 'male', 4.8, 320, true, 'online', 11.2189, 78.1674, 11.2189, 78.1674, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Karur Bike (Virtual)', '9100000052', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0053', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Karur Auto (Virtual)', '9100000053', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0054', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Karur Cab (Virtual)', '9100000054', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0055', 'male', 4.8, 320, true, 'online', 10.9601, 78.0766, 10.9601, 78.0766, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Nagapattinam Bike (Virtual)', '9100000055', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0056', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Nagapattinam Auto (Virtual)', '9100000056', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0057', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Nagapattinam Cab (Virtual)', '9100000057', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0058', 'male', 4.8, 320, true, 'online', 10.7672, 79.8449, 10.7672, 79.8449, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Villupuram Bike (Virtual)', '9100000058', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0059', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Villupuram Auto (Virtual)', '9100000059', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0060', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Villupuram Cab (Virtual)', '9100000060', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0061', 'male', 4.8, 320, true, 'online', 11.9401, 79.4861, 11.9401, 79.4861, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Ramanathapuram Bike (Virtual)', '9100000061', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0062', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Ramanathapuram Auto (Virtual)', '9100000062', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0063', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Ramanathapuram Cab (Virtual)', '9100000063', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0064', 'male', 4.8, 320, true, 'online', 9.3639, 78.8395, 9.3639, 78.8395, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Sivaganga Bike (Virtual)', '9100000064', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0065', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Sivaganga Auto (Virtual)', '9100000065', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0066', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Sivaganga Cab (Virtual)', '9100000066', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0067', 'male', 4.8, 320, true, 'online', 10.0227, 78.4837, 10.0227, 78.4837, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Virudhunagar Bike (Virtual)', '9100000067', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0068', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Virudhunagar Auto (Virtual)', '9100000068', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0069', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Virudhunagar Cab (Virtual)', '9100000069', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0070', 'male', 4.8, 320, true, 'online', 9.5851, 77.9624, 9.5851, 77.9624, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Theni Bike (Virtual)', '9100000070', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0071', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Theni Auto (Virtual)', '9100000071', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0072', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Theni Cab (Virtual)', '9100000072', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0073', 'male', 4.8, 320, true, 'online', 10.0104, 77.4768, 10.0104, 77.4768, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Perambalur Bike (Virtual)', '9100000073', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0074', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Perambalur Auto (Virtual)', '9100000074', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0075', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Perambalur Cab (Virtual)', '9100000075', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0076', 'male', 4.8, 320, true, 'online', 11.234, 78.8868, 11.234, 78.8868, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Ariyalur Bike (Virtual)', '9100000076', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0077', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Ariyalur Auto (Virtual)', '9100000077', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0078', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Ariyalur Cab (Virtual)', '9100000078', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0079', 'male', 4.8, 320, true, 'online', 11.1428, 79.0785, 11.1428, 79.0785, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Pudukkottai Bike (Virtual)', '9100000079', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0080', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Pudukkottai Auto (Virtual)', '9100000080', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0081', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Pudukkottai Cab (Virtual)', '9100000081', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0082', 'male', 4.8, 320, true, 'online', 10.3833, 78.8001, 10.3833, 78.8001, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tiruvarur Bike (Virtual)', '9100000082', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0083', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tiruvarur Auto (Virtual)', '9100000083', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0084', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tiruvarur Cab (Virtual)', '9100000084', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0085', 'male', 4.8, 320, true, 'online', 10.7713, 79.6352, 10.7713, 79.6352, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Nilgiris (Ooty) Bike (Virtual)', '9100000085', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0086', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Nilgiris (Ooty) Auto (Virtual)', '9100000086', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0087', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Nilgiris (Ooty) Cab (Virtual)', '9100000087', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0088', 'male', 4.8, 320, true, 'online', 11.4064, 76.6932, 11.4064, 76.6932, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Kanyakumari Bike (Virtual)', '9100000088', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0089', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Kanyakumari Auto (Virtual)', '9100000089', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0090', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Kanyakumari Cab (Virtual)', '9100000090', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0091', 'male', 4.8, 320, true, 'online', 8.0883, 77.5385, 8.0883, 77.5385, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Hosur area Bike (Virtual)', '9100000091', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0092', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Hosur area Auto (Virtual)', '9100000092', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0093', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Hosur area Cab (Virtual)', '9100000093', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0094', 'male', 4.8, 320, true, 'online', 12.736, 77.8253, 12.736, 77.8253, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Ranipet Bike (Virtual)', '9100000094', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0095', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Ranipet Auto (Virtual)', '9100000095', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0096', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Ranipet Cab (Virtual)', '9100000096', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0097', 'male', 4.8, 320, true, 'online', 12.9224, 79.3329, 12.9224, 79.3329, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tirupattur Bike (Virtual)', '9100000097', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0098', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tirupattur Auto (Virtual)', '9100000098', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0099', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tirupattur Cab (Virtual)', '9100000099', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0100', 'male', 4.8, 320, true, 'online', 12.4997, 78.573, 12.4997, 78.573, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Chengalpattu Bike (Virtual)', '9100000100', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0101', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Chengalpattu Auto (Virtual)', '9100000101', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0102', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Chengalpattu Cab (Virtual)', '9100000102', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0103', 'male', 4.8, 320, true, 'online', 12.6819, 79.9888, 12.6819, 79.9888, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Kallakurichi Bike (Virtual)', '9100000103', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0104', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Kallakurichi Auto (Virtual)', '9100000104', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0105', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Kallakurichi Cab (Virtual)', '9100000105', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0106', 'male', 4.8, 320, true, 'online', 11.7381, 78.9608, 11.7381, 78.9608, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tenkasi Bike (Virtual)', '9100000106', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0107', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tenkasi Auto (Virtual)', '9100000107', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0108', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tenkasi Cab (Virtual)', '9100000108', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0109', 'male', 4.8, 320, true, 'online', 8.9604, 77.3152, 8.9604, 77.3152, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Mayiladuthurai Bike (Virtual)', '9100000109', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0110', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Mayiladuthurai Auto (Virtual)', '9100000110', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0111', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Mayiladuthurai Cab (Virtual)', '9100000111', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0112', 'male', 4.8, 320, true, 'online', 11.1035, 79.6529, 11.1035, 79.6529, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🏍️ Tiruvallur Bike (Virtual)', '9100000112', '919344532738', '919344532738', 'bike', 'Honda Activa 6G', 'TN XX BK 0113', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🛺 Tiruvallur Auto (Virtual)', '9100000113', '919344532738', '919344532738', 'auto', 'Bajaj RE Auto', 'TN XX AU 0114', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3),
('🚕 Tiruvallur Cab (Virtual)', '9100000114', '919344532738', '919344532738', 'cab', 'Maruti Swift Dzire', 'TN XX CB 0115', 'male', 4.8, 320, true, 'online', 13.1431, 79.9125, 13.1431, 79.9125, 'supro.driver@upi', NOW()+INTERVAL '90 days', 3);

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
    AND COALESCE(d.is_blocked, false) = false
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
