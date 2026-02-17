-- ============================================================================
-- 1. Replace 'CHANGE_ME@EXAMPLE.COM' with the user's email (LOWERCASE)
-- 2. Run this script in the Supabase SQL Editor
-- ============================================================================

DO $$
DECLARE
    target_email VARCHAR := 'CHANGE_ME@EXAMPLE.COM'; -- <--- REPLACE THIS EMAIL
    user_id UUID;
    full_name TEXT;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;

    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users. Please sign up first.', target_email;
    END IF;

    -- Update existing profile or insert new if missing
    INSERT INTO public.profiles (id, email, role, status, full_name)
    VALUES (
        user_id, 
        target_email, 
        'admin', 
        'active', 
        (SELECT COALESCE(raw_user_meta_data->>'full_name', 'Admin User') FROM auth.users WHERE id = user_id)
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
        role = 'admin',
        status = 'active';

    RAISE NOTICE 'SUCCESS: % is now an ADMIN.', target_email;
END $$;
