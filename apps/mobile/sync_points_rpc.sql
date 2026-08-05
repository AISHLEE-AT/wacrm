CREATE OR REPLACE FUNCTION sync_offline_points(user_id uuid, points_earned int)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance int;
  new_balance int;
BEGIN
  -- We assume points_earned are a generic currency for now that maps to Testo / Supro.
  -- For simplicity in this demo, let's map them directly to supro_coins.
  
  -- Lock the user profile row for update to prevent race conditions
  SELECT supro_coins INTO current_balance
  FROM user_profiles
  WHERE id = user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'User profile not found');
  END IF;

  new_balance := current_balance + points_earned;

  -- Update the balance
  UPDATE user_profiles
  SET supro_coins = new_balance, updated_at = now()
  WHERE id = user_id;

  -- Log the transaction
  INSERT INTO supro_transactions (user_id, transaction_type, amount, description)
  VALUES (user_id, 'EARNED', points_earned, 'Synced offline educational game points');

  RETURN json_build_object(
    'success', true, 
    'message', 'Points synced successfully',
    'points_synced', points_earned,
    'new_balance', new_balance
  );
END;
$$;
