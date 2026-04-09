-- ============================================================================
-- LOCATIONS FIX - Run in Supabase SQL Editor
-- ============================================================================

-- Drop existing cities table and recreate with proper schema
DROP TABLE IF EXISTS public.cities CASCADE;

CREATE TABLE public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    region VARCHAR(20),
    pincodes JSONB DEFAULT '[]'::jsonb,
    is_serviceable BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    service_centers JSONB DEFAULT '[]'::jsonb,
    tier VARCHAR(20) DEFAULT 'Tier 2',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view cities" ON public.cities;
DROP POLICY IF EXISTS "Public view cities" ON public.cities;
DROP POLICY IF EXISTS "Admins can manage cities" ON public.cities;
DROP POLICY IF EXISTS "Public can view all cities" ON public.cities;
DROP POLICY IF EXISTS "Admins can do anything on cities" ON public.cities;
DROP POLICY IF EXISTS "Users can view cities" ON public.cities;
DROP POLICY IF EXISTS "Allow all access to cities" ON public.cities;

-- Create proper RLS policies for cities
CREATE POLICY "Allow all access to cities" ON public.cities
    FOR ALL TO authenticated USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_cities_updated ON public.cities;
CREATE TRIGGER on_cities_updated
    BEFORE UPDATE ON public.cities
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Insert sample cities
INSERT INTO public.cities (name, state, region, pincodes, is_serviceable, status, tier) VALUES
    ('Mumbai', 'Maharashtra', 'West', '["400001", "400002", "400003", "400004", "400005"]'::jsonb, true, 'active', 'Tier 1'),
    ('Delhi', 'Delhi', 'North', '["110001", "110002", "110003", "110004"]'::jsonb, true, 'active', 'Tier 1'),
    ('Bangalore', 'Karnataka', 'South', '["560001", "560002", "560003"]'::jsonb, true, 'active', 'Tier 1'),
    ('Chennai', 'Tamil Nadu', 'South', '["600001", "600002"]'::jsonb, true, 'active', 'Tier 1'),
    ('Kolkata', 'West Bengal', 'East', '["700001", "700002"]'::jsonb, true, 'active', 'Tier 1'),
    ('Hyderabad', 'Telangana', 'South', '["500001", "500002", "500003"]'::jsonb, true, 'active', 'Tier 1'),
    ('Pune', 'Maharashtra', 'West', '["411001", "411002", "411003"]'::jsonb, true, 'active', 'Tier 2'),
    ('Ahmedabad', 'Gujarat', 'West', '["380001", "380002"]'::jsonb, true, 'active', 'Tier 2'),
    ('Jaipur', 'Rajasthan', 'North', '["302001", "302002"]'::jsonb, true, 'active', 'Tier 2'),
    ('Lucknow', 'Uttar Pradesh', 'Central', '["226001", "226002"]'::jsonb, true, 'active', 'Tier 2'),
    ('Nagpur', 'Maharashtra', 'Central', '["440001", "440002"]'::jsonb, true, 'active', 'Tier 2'),
    ('Surat', 'Gujarat', 'West', '["395001", "395002"]'::jsonb, true, 'active', 'Tier 2'),
    ('Indore', 'Madhya Pradesh', 'Central', '["452001", "452002"]'::jsonb, true, 'active', 'Tier 2'),
    ('Bhopal', 'Madhya Pradesh', 'Central', '["462001", "462002"]'::jsonb, true, 'active', 'Tier 2'),
    ('Patna', 'Bihar', 'East', '["800001", "800002"]'::jsonb, true, 'active', 'Tier 2');

-- Verify
SELECT 'Cities table created successfully!' as status, COUNT(*) as row_count FROM public.cities;
