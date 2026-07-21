-- Seed data for all Fago modules (Tamil Nadu localized context)
-- Ensure at least one user exists in auth.users before running this script.

DO $$ 
DECLARE 
    seed_user_id UUID;
BEGIN
    -- Get the first user from auth.users to assign the data to
    SELECT id INTO seed_user_id FROM auth.users LIMIT 1;

    IF seed_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users. Please create a user first.';
        RETURN;
    END IF;

    -- ==========================================
    -- 1. TeachO (LMS - Tamil Nadu Context)
    -- ==========================================
    INSERT INTO public.teacho_courses (instructor_id, title, description, price, category, status)
    VALUES 
        (seed_user_id, 'TNPSC Group 4 Comprehensive Guide', 'Master the syllabus for TNPSC Group 4 with comprehensive notes and practice tests in Tamil and English.', 1500.00, 'Competitive Exams', 'PUBLISHED'),
        (seed_user_id, 'Spoken English through Tamil', 'Learn to speak fluent English easily with explanations in Tamil.', 999.00, 'Language', 'PUBLISHED'),
        (seed_user_id, 'Samacheer Kalvi 10th Maths', 'Step-by-step solutions for 10th standard Mathematics under Tamil Nadu State Board syllabus.', 500.00, 'School Education', 'PUBLISHED'),
        (seed_user_id, 'Introduction to Python (Tamil)', 'Learn programming from scratch in your native language.', 1200.00, 'Programming', 'PUBLISHED');

    -- ==========================================
    -- 2. TestO (Assessments)
    -- ==========================================
    INSERT INTO public.testo_assessments (creator_id, title, description, duration_minutes, total_marks, status)
    VALUES
        (seed_user_id, 'TNPSC Group 4 Mock Test 1', 'Full length mock test covering General Tamil and General Studies.', 180, 300, 'PUBLISHED'),
        (seed_user_id, '10th Science Unit Test - Physics', 'Unit test covering Laws of Motion and Optics.', 45, 50, 'PUBLISHED'),
        (seed_user_id, 'English Grammar Basics Assessment', 'Test your knowledge on tenses, prepositions, and articles.', 30, 25, 'PUBLISHED');

    -- ==========================================
    -- 3. TourO (Travel)
    -- ==========================================
    INSERT INTO public.touro (user_id, tour_name, destination, start_date, end_date, status, booking_details)
    VALUES
        (seed_user_id, 'Ooty Weekend Getaway', 'Ooty, Tamil Nadu', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 'CONFIRMED', '{"hotel": "Sterling Ooty", "transport": "Bus"}'),
        (seed_user_id, 'Madurai Temple Tour', 'Madurai, Tamil Nadu', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '16 days', 'PENDING', '{"guide": "Needed", "transport": "Train"}'),
        (seed_user_id, 'Kodaikanal Nature Retreat', 'Kodaikanal, Tamil Nadu', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '33 days', 'CONFIRMED', '{"activities": ["Trekking", "Boating"]}');

    -- ==========================================
    -- 4. MoneyO (Savings)
    -- ==========================================
    INSERT INTO public.moneyo_savings (user_id, scheme_name, amount, status)
    VALUES
        (seed_user_id, 'Post Office RD - Monthly', 2500.00, 'ACTIVE'),
        (seed_user_id, 'Gold Saving Scheme (Thangam)', 5000.00, 'ACTIVE'),
        (seed_user_id, 'Emergency Fund Goal', 10000.00, 'ACTIVE'),
        (seed_user_id, 'Deepavali Chit Fund', 15000.00, 'COMPLETED');

    -- ==========================================
    -- 5. TaskO (Productivity)
    -- ==========================================
    INSERT INTO public.tasko_tasks (user_id, title, status, due_date)
    VALUES
        (seed_user_id, 'Renew two-wheeler insurance', 'TODO', CURRENT_DATE + INTERVAL '2 days'),
        (seed_user_id, 'Pay EB Bill (TANGEDCO)', 'IN_PROGRESS', CURRENT_DATE + INTERVAL '1 day'),
        (seed_user_id, 'Buy groceries from local market', 'COMPLETED', CURRENT_DATE - INTERVAL '1 day'),
        (seed_user_id, 'Prepare for TNPSC exam mock test', 'TODO', CURRENT_DATE + INTERVAL '4 days');

    -- ==========================================
    -- 6. TradeO (Marketplace)
    -- ==========================================
    INSERT INTO public.tradeo_listings (seller_id, title, description, price, status)
    VALUES
        (seed_user_id, 'Used Royal Enfield Classic 350', '2019 model, good condition, single owner.', 120000.00, 'AVAILABLE'),
        (seed_user_id, 'Organic Ponni Rice 25kg bag', 'Direct from farm in Thanjavur. Chemical free.', 1500.00, 'AVAILABLE'),
        (seed_user_id, 'Kanchipuram Silk Saree', 'Brand new, authentic silk saree with zari border.', 8500.00, 'AVAILABLE'),
        (seed_user_id, 'Wooden Dining Table', 'Teak wood dining table (6 seater) used for 2 years.', 15000.00, 'SOLD');

    -- ==========================================
    -- 7. TvO (Media)
    -- ==========================================
    INSERT INTO public.tvo_videos (creator_id, title, description, video_url, thumbnail_url, views_count)
    VALUES
        (seed_user_id, 'How to make authentic Chettinad Chicken Curry', 'Step by step cooking guide in Tamil.', 'https://www.youtube.com/watch?v=placeholder1', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400', 15400),
        (seed_user_id, 'Top 10 Tourist Places in Tamil Nadu', 'Explore the majestic temples and hill stations.', 'https://www.youtube.com/watch?v=placeholder2', 'https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?auto=format&fit=crop&w=400', 8900),
        (seed_user_id, 'TNPSC Current Affairs - October', 'Monthly current affairs roundup for competitive exams.', 'https://www.youtube.com/watch?v=placeholder3', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400', 25600);

    RAISE NOTICE 'Seed data successfully inserted for user ID: %', seed_user_id;
END $$;
