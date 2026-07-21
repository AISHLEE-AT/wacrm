-- 048_fix_profiles_id.sql
-- Fixes the profiles schema so that id is the auth.users(id), which frontend expects.
-- Uses dynamic SQL to find and update all foreign keys referencing profiles(id).

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Create temp table to store constraints
    CREATE TEMP TABLE IF NOT EXISTS temp_fk_constraints AS
        SELECT
            tc.table_schema,
            tc.table_name,
            kcu.column_name,
            tc.constraint_name,
            rc.update_rule,
            rc.delete_rule
        FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            JOIN information_schema.referential_constraints AS rc
              ON rc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'profiles' 
          AND ccu.column_name = 'id';

    -- 1. Drop constraints and update referencing columns
    FOR r IN SELECT * FROM temp_fk_constraints LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', r.table_schema, r.table_name, r.constraint_name);
        
        EXECUTE format('
            UPDATE %I.%I t
            SET %I = p.user_id
            FROM public.profiles p
            WHERE t.%I = p.id
        ', r.table_schema, r.table_name, r.column_name, r.column_name);
    END LOOP;

    -- 2. Update profiles id to be user_id
    ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
    UPDATE public.profiles SET id = user_id;

    -- 3. Re-add foreign keys
    FOR r IN SELECT * FROM temp_fk_constraints LOOP
        EXECUTE format('
            ALTER TABLE %I.%I 
            ADD CONSTRAINT %I 
            FOREIGN KEY (%I) 
            REFERENCES public.profiles(id) 
            ON DELETE %s 
            ON UPDATE %s
        ', r.table_schema, r.table_name, r.constraint_name, r.column_name, r.delete_rule, r.update_rule);
    END LOOP;

    -- Cleanup
    DROP TABLE temp_fk_constraints;
END $$;

-- 4. Fix the handle_new_user trigger to insert id instead of user_id, since they are the same now.
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

-- 5. Re-create the RLS policy from 039 to make sure it exists (it should now work correctly)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
