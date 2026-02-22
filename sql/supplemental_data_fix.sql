-- ============================================================================
-- SUPPLEMENTAL DATA FIX FOR HEALTHMITRA
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. INSERT DEFAULT DEPARTMENTS (if table is empty)
-- ============================================================================

DO $$
BEGIN
    IF (SELECT COUNT(*) FROM departments) = 0 THEN
        INSERT INTO departments (name, description, head_name, status) VALUES
            ('Cardiology', 'Heart related services', 'Dr. Smith', 'active'),
            ('Neurology', 'Brain and nerve services', 'Dr. Johnson', 'active'),
            ('Orthopedics', 'Bone and joint services', 'Dr. Williams', 'active'),
            ('Pediatrics', 'Child healthcare', 'Dr. Brown', 'active'),
            ('General Medicine', 'General healthcare', 'Dr. Davis', 'active'),
            ('Dermatology', 'Skin care services', 'Dr. Miller', 'active'),
            ('Ophthalmology', 'Eye care services', 'Dr. Wilson', 'active'),
            ('Gynecology', 'Women health services', 'Dr. Moore', 'active');
    END IF;
END $$;

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT 'Departments:' as info, COUNT(*) as count FROM departments
UNION ALL
SELECT 'PHR Categories:', COUNT(*) FROM phr_categories
UNION ALL
SELECT 'Plan Categories:', COUNT(*) FROM plan_categories;
