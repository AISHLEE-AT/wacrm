-- ==============================================================================
-- WACRM / FAGO – Complete Cleanup for Test User: 9123596988
-- v4: No inner procedures – uses EXECUTE + EXISTS checks inline via loop.
-- Run this in your Supabase SQL Editor.
-- ==============================================================================

DO $$
DECLARE
  v_user_id    UUID    := '6098fc2a-6ee4-4e4c-b207-8878c1fb9044';
  v_account_id UUID;
  v_exists     BOOLEAN;
  v_sql        TEXT;
  rec          RECORD;

  -- List of tables to delete from by user_id (schema, table, column)
  -- NOTE: All columns listed here must be UUID type. TEXT columns handled separately below.
  tables_by_user CONSTANT TEXT[][] := ARRAY[
    ARRAY['public', 'contacts',        'user_id'],
    ARRAY['public', 'profiles',        'id'],
    ARRAY['public', 'driver_profiles', 'id'],
    ARRAY['public', 'drivers',         'user_id'],
    ARRAY['public', 'notifications',   'user_id'],
    ARRAY['public', 'transactions',    'user_id'],
    ARRAY['public', 'purchases',       'user_id'],
    ARRAY['public', 'account_members', 'user_id'],
    ARRAY['public', 'memberships',     'user_id']
  ];

BEGIN

  RAISE NOTICE '=== FAGO Cleanup: user_id % ===', v_user_id;

  -- ── Step 1: OTPs ───────────────────────────────────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'whatsapp_otps'
  ) INTO v_exists;
  IF v_exists THEN
    DELETE FROM public.whatsapp_otps
    WHERE phone_number IN ('9123596988', '919123596988');
    RAISE NOTICE '[1] Deleted from whatsapp_otps';
  ELSE
    RAISE NOTICE '[1] Skipped whatsapp_otps (not found)';
  END IF;

  -- ── Step 2: Contacts by phone ──────────────────────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'contacts'
  ) INTO v_exists;
  IF v_exists THEN
    DELETE FROM public.contacts
    WHERE phone IN ('9123596988', '919123596988', '+919123596988');
    RAISE NOTICE '[2] Deleted contacts by phone';
  ELSE
    RAISE NOTICE '[2] Skipped contacts (not found)';
  END IF;

  -- ── Step 3: Loop – delete user_id references across all known tables ───────
  RAISE NOTICE '[3] Deleting user references across tables...';
  FOR i IN 1 .. array_length(tables_by_user, 1) LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = tables_by_user[i][1]
        AND table_name   = tables_by_user[i][2]
    ) INTO v_exists;

    IF v_exists THEN
      v_sql := format(
        'DELETE FROM %I.%I WHERE %I = $1',
        tables_by_user[i][1],
        tables_by_user[i][2],
        tables_by_user[i][3]
      );
      EXECUTE v_sql USING v_user_id;
      RAISE NOTICE '   Deleted from %.%', tables_by_user[i][1], tables_by_user[i][2];
    ELSE
      RAISE NOTICE '   Skipped %.% (not found)', tables_by_user[i][1], tables_by_user[i][2];
    END IF;
  END LOOP;

  -- ride_requests.rider_id is TEXT, not UUID — handle separately with explicit cast
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ride_requests'
  ) INTO v_exists;
  IF v_exists THEN
    DELETE FROM public.ride_requests WHERE rider_id = v_user_id::TEXT;
    RAISE NOTICE '   Deleted from public.ride_requests (TEXT cast)';
  ELSE
    RAISE NOTICE '   Skipped public.ride_requests (not found)';
  END IF;

  -- ── Step 4: Account dependencies ──────────────────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'accounts'
  ) INTO v_exists;

  IF v_exists THEN
    SELECT id INTO v_account_id
    FROM public.accounts
    WHERE owner_user_id = v_user_id
    LIMIT 1;

    IF v_account_id IS NOT NULL THEN
      RAISE NOTICE '[4] Found account: % – removing dependencies...', v_account_id;

      -- Delete account-referencing tables (each guarded with EXISTS)
      FOR rec IN
        SELECT unnest(ARRAY[
          'invitations', 'account_invitations', 'account_members',
          'memberships', 'api_keys', 'subscriptions', 'billing_customers'
        ]) AS tbl
      LOOP
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = rec.tbl
        ) INTO v_exists;

        IF v_exists THEN
          v_sql := format(
            'DELETE FROM public.%I WHERE account_id = $1', rec.tbl
          );
          EXECUTE v_sql USING v_account_id;
          RAISE NOTICE '   Deleted from public.%', rec.tbl;
        ELSE
          RAISE NOTICE '   Skipped public.% (not found)', rec.tbl;
        END IF;
      END LOOP;

      -- Now delete the account itself
      DELETE FROM public.accounts WHERE id = v_account_id;
      RAISE NOTICE '[4] Deleted account row';

    ELSE
      RAISE NOTICE '[4] No account found for this user';
    END IF;
  ELSE
    RAISE NOTICE '[4] Skipped accounts (table not found)';
  END IF;

  -- ── Step 5: Delete auth.users ──────────────────────────────────────────────
  RAISE NOTICE '[5] Deleting auth.users...';
  DELETE FROM auth.users WHERE id = v_user_id;
  RAISE NOTICE '[5] ✅ auth.users deleted successfully';

  RAISE NOTICE '=== ✅ Cleanup done. 9123596988 can re-register fresh. ===';

EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION
      E'❌ FK constraint still blocking.\nRun this to find it:\n\n'
      'SELECT tc.table_schema, tc.table_name, kcu.column_name '
      'FROM information_schema.table_constraints tc '
      'JOIN information_schema.key_column_usage kcu '
        'ON tc.constraint_name = kcu.constraint_name '
      'JOIN information_schema.referential_constraints rc '
        'ON tc.constraint_name = rc.constraint_name '
      'JOIN information_schema.table_constraints tc2 '
        'ON rc.unique_constraint_name = tc2.constraint_name '
      'WHERE tc2.table_name = ''users'' AND tc2.table_schema = ''auth'';';
END $$;
