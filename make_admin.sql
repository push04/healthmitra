-- ============================================================================
-- SQL Script to Make a User an Admin
-- ============================================================================

-- 1. Replace 'CHANGE_ME@EXAMPLE.COM' with the user's email address
-- 2. Run this script in the Supabase SQL Editor

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'CHANGE_ME@EXAMPLE.COM'; -- <--- Put the email here

-- ============================================================================
-- Verification: Check if the role was updated
-- ============================================================================

SELECT email, role, full_name 
FROM public.profiles 
WHERE email = 'CHANGE_ME@EXAMPLE.COM';
