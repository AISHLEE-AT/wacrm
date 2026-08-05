-- SuprO Economy RPC Function

-- Function to safely convert Nitro Points to SuprO Coins
-- 10 Nitro Points = 1 SuprO Coin
-- This function uses SECURITY DEFINER to bypass RLS and ensure the conversion is atomic.

CREATE OR REPLACE FUNCTION convert_nitro_to_supro(
    user_id UUID,
    nitro_spent INT
) RETURNS JSON AS $$
DECLARE
    current_nitro INT;
    supro_gained INT;
    new_nitro INT;
    new_supro INT;
BEGIN
    -- Input validation
    IF nitro_spent <= 0 THEN
        RAISE EXCEPTION 'Must spend a positive amount of nitro';
    END IF;
    
    IF nitro_spent % 10 != 0 THEN
        RAISE EXCEPTION 'Nitro spent must be in multiples of 10';
    END IF;

    supro_gained := nitro_spent / 10;

    -- Lock the user row for update to prevent race conditions
    SELECT nitro_points, supro_coins 
    INTO current_nitro, new_supro
    FROM profiles 
    WHERE id = user_id 
    FOR UPDATE;

    IF current_nitro IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    IF current_nitro < nitro_spent THEN
        RAISE EXCEPTION 'Insufficient nitro points. Have %, Need %', current_nitro, nitro_spent;
    END IF;

    -- Update balances
    new_nitro := current_nitro - nitro_spent;
    
    -- Ensure supro_coins isn't null
    IF new_supro IS NULL THEN
        new_supro := 0;
    END IF;
    
    new_supro := new_supro + supro_gained;

    UPDATE profiles
    SET 
        nitro_points = new_nitro,
        supro_coins = new_supro,
        updated_at = NOW()
    WHERE id = user_id;

    -- Log transaction
    INSERT INTO nitro_transactions (
        user_id, amount, transaction_type, description
    ) VALUES (
        user_id, -nitro_spent, 'spend', 'Converted to SuprO Coins'
    );

    RETURN json_build_object(
        'success', true,
        'nitro_spent', nitro_spent,
        'supro_gained', supro_gained,
        'new_nitro_balance', new_nitro,
        'new_supro_balance', new_supro
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
