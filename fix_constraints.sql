-- FIX CONSTRAINT SCRIPT
-- Purpose: Remove the strict Foreign Key link between public.profiles and auth.users
-- This allows you to run seed.sql with demo users that don't exist in Supabase Auth.

BEGIN;

-- 1. Drop the strict constraint if it exists
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Drop constraint if it was named differently (Supabase default naming convention)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_users_id_fkey;

COMMIT;

-- Now you can run seed.sql successfully!
