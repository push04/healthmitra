-- ============================================================================
-- HealthMitra: Critical Bug Fixes
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. FIX: Service Request Status Enum - Add 'assigned' status
-- ============================================================================

-- Check current enum values
DO $$ 
BEGIN
    -- Add 'assigned' if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'assigned' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'request_status_enum')
    ) THEN
        ALTER TYPE request_status_enum ADD VALUE 'assigned';
    END IF;
    
    -- Add other common statuses
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'cancelled' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'request_status_enum')
    ) THEN
        ALTER TYPE request_status_enum ADD VALUE 'cancelled';
    END IF;
END $$;

-- ============================================================================
-- 2. FIX: Delete Plan FK - Make ecard_members.plan_id nullable on delete
-- ============================================================================

-- Drop existing foreign key and recreate with ON DELETE SET NULL
ALTER TABLE public.ecard_members DROP CONSTRAINT IF EXISTS ecard_members_plan_id_fkey;

ALTER TABLE public.ecard_members 
ADD CONSTRAINT ecard_members_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;

-- ============================================================================
-- 3. FIX: CMS Footer - Ensure required fields exist
-- ============================================================================

-- Add missing columns to cms_content if needed
ALTER TABLE public.cms_content ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.cms_content ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Insert default footer content
INSERT INTO public.cms_content (key, value, status) VALUES
('footer_privacy_policy', '{"en":"Privacy Policy"}', 'active'),
('footer_terms', '{"en":"Terms of Service"}', 'active'),
('footer_contact', '{"en":"Contact Us"}', 'active'),
('footer_about', '{"en":"About Us"}', 'active')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 4. FIX: Plans - Add is_active column
-- ============================================================================

ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT 'Critical Bug Fixes completed successfully!' as result;
