-- 048_fix_profiles_id.sql
-- Fixes the profiles schema so that id is the auth.users(id), which frontend expects.
-- Now using IF EXISTS checks to ensure it runs cleanly even if some tables haven't been migrated yet.

DO $$
BEGIN
    -- 1. Drop existing foreign keys & Update referencing columns
    -- deals
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deals') THEN
        ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS deals_assigned_to_fkey;
        UPDATE public.deals t SET assigned_to = p.user_id FROM public.profiles p WHERE t.assigned_to = p.id;
    END IF;

    -- system_announcements
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_announcements') THEN
        ALTER TABLE public.system_announcements DROP CONSTRAINT IF EXISTS system_announcements_admin_id_fkey;
        UPDATE public.system_announcements t SET admin_id = p.user_id FROM public.profiles p WHERE t.admin_id = p.id;
    END IF;

    -- seller_shops
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seller_shops') THEN
        ALTER TABLE public.seller_shops DROP CONSTRAINT IF EXISTS seller_shops_seller_id_fkey;
        UPDATE public.seller_shops t SET seller_id = p.user_id FROM public.profiles p WHERE t.seller_id = p.id;
    END IF;

    -- loan_applications
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'loan_applications') THEN
        ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_applicant_id_fkey;
        UPDATE public.loan_applications t SET applicant_id = p.user_id FROM public.profiles p WHERE t.applicant_id = p.id;
    END IF;

    -- listings
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
        ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_lister_id_fkey;
        UPDATE public.listings t SET lister_id = p.user_id FROM public.profiles p WHERE t.lister_id = p.id;
    END IF;

    -- messages
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
        ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
        UPDATE public.messages t SET sender_id = p.user_id FROM public.profiles p WHERE t.sender_id = p.id;
    END IF;

    -- testo_assessments
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testo_assessments') THEN
        ALTER TABLE public.testo_assessments DROP CONSTRAINT IF EXISTS testo_assessments_admin_id_fkey;
        UPDATE public.testo_assessments t SET admin_id = p.user_id FROM public.profiles p WHERE t.admin_id = p.id;
    END IF;

    -- teacho_courses
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teacho_courses') THEN
        ALTER TABLE public.teacho_courses DROP CONSTRAINT IF EXISTS teacho_courses_admin_id_fkey;
        UPDATE public.teacho_courses t SET admin_id = p.user_id FROM public.profiles p WHERE t.admin_id = p.id;
    END IF;

    -- 2. Update profiles id to be user_id
    ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
    UPDATE public.profiles SET id = user_id;

    -- 3. Re-add foreign keys
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deals') THEN
        ALTER TABLE public.deals ADD CONSTRAINT deals_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_announcements') THEN
        ALTER TABLE public.system_announcements ADD CONSTRAINT system_announcements_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seller_shops') THEN
        ALTER TABLE public.seller_shops ADD CONSTRAINT seller_shops_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'loan_applications') THEN
        ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
        ALTER TABLE public.listings ADD CONSTRAINT listings_lister_id_fkey FOREIGN KEY (lister_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testo_assessments') THEN
        ALTER TABLE public.testo_assessments ADD CONSTRAINT testo_assessments_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teacho_courses') THEN
        ALTER TABLE public.teacho_courses ADD CONSTRAINT teacho_courses_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Fix the handle_new_user trigger to insert id instead of user_id, since they are the same now.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_account_id UUID;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  INSERT INTO public.accounts (name, owner_user_id)
  VALUES (COALESCE(NULLIF(v_full_name, ''), NEW.email, 'My account'), NEW.id)
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (id, user_id, full_name, email, account_id, account_role)
  VALUES (NEW.id, NEW.id, v_full_name, NEW.email, v_account_id, 'owner');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 6. Re-create the RLS policy from 039 to make sure it exists (it should now work correctly)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
