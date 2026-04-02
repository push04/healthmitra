-- ============================================================
-- Customer Admin Migration
-- Adds admin policies for inserting/updating customers and
-- e-card members via service role / admin operations.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Add missing columns to profiles if they don't exist yet
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS dob DATE,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS blood_group TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS pincode TEXT,
    ADD COLUMN IF NOT EXISTS bank_holder_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
    ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_branch TEXT,
    ADD COLUMN IF NOT EXISTS account_type TEXT,
    ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
    ADD COLUMN IF NOT EXISTS pan_number TEXT,
    ADD COLUMN IF NOT EXISTS gst_number TEXT;

-- 2. Add admin ALL policy on profiles (admins can insert/update/delete any profile)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Admins can manage all profiles'
    ) THEN
        CREATE POLICY "Admins can manage all profiles"
        ON public.profiles FOR ALL
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
        WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- 3. Add admin INSERT/UPDATE/DELETE on ecard_members
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ecard_members' AND policyname = 'Admins can insert ecard members'
    ) THEN
        CREATE POLICY "Admins can insert ecard members"
        ON public.ecard_members FOR INSERT
        WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ecard_members' AND policyname = 'Admins can update ecard members'
    ) THEN
        CREATE POLICY "Admins can update ecard members"
        ON public.ecard_members FOR UPDATE
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- 4. Add status index on profiles for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 5. Add index on ecard_members for relation column (used in customer queries)
CREATE INDEX IF NOT EXISTS idx_ecard_members_relation ON public.ecard_members(relation);

-- 6. Ensure plans table has status column (some versions use is_active)
ALTER TABLE public.plans
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'individual',
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Sync is_active → status for existing plans if status is null
UPDATE public.plans
SET status = CASE WHEN is_active = true THEN 'active' ELSE 'inactive' END
WHERE status IS NULL;

-- Done!
SELECT 'Migration applied successfully' AS result;
