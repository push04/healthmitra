-- ============================================================================
-- COMPREHENSIVE DATABASE SCHEMA FOR ADMIN MANAGEMENT SYSTEM
-- ============================================================================
-- Run this file in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- SECTION 1: CALL CENTRE / AGENT MANAGEMENT
-- ============================================================================

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS call_centre_agents CASCADE;
DROP TABLE IF EXISTS call_centre_activity_log CASCADE;

-- Call Centre Agents Table
CREATE TABLE call_centre_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agent_name TEXT NOT NULL,
    agent_email TEXT NOT NULL UNIQUE,
    agent_phone TEXT,
    role TEXT DEFAULT 'agent' CHECK (role IN ('supervisor', 'agent', 'team_leader')),
    department TEXT DEFAULT 'customer_support',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    is_available BOOLEAN DEFAULT true,
    current_calls INTEGER DEFAULT 0,
    total_calls_handled INTEGER DEFAULT 0,
    avg_handle_time INTEGER DEFAULT 0,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0.00,
    hire_date DATE DEFAULT CURRENT_DATE,
    shift_start TIME DEFAULT '09:00:00',
    shift_end TIME DEFAULT '18:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call Centre Activity Log
CREATE TABLE call_centre_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES call_centre_agents(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    description TEXT,
    request_id UUID,
    customer_id UUID,
    call_duration INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE call_centre_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_centre_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin full access to agents" ON call_centre_agents FOR ALL USING (true);
CREATE POLICY "Admin full access to activity log" ON call_centre_activity_log FOR ALL USING (true);

-- Insert sample agents
INSERT INTO call_centre_agents (agent_name, agent_email, agent_phone, role, department, status, is_available)
VALUES 
    ('Rahul Sharma', 'rahul.sharma@healthmitra.com', '+91-9876543210', 'supervisor', 'customer_support', 'active', true),
    ('Priya Singh', 'priya.singh@healthmitra.com', '+91-9876543211', 'agent', 'customer_support', 'active', true),
    ('Amit Kumar', 'amit.kumar@healthmitra.com', '+91-9876543212', 'agent', 'customer_support', 'active', false),
    ('Sneha Gupta', 'sneha.gupta@healthmitra.com', '+91-9876543213', 'team_leader', 'customer_support', 'active', true);

-- ============================================================================
-- SECTION 2: PHR (Personal Health Records) ENHANCEMENTS
-- ============================================================================

-- PHR Categories
DROP TABLE IF EXISTS phr_categories CASCADE;

CREATE TABLE phr_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PHR Access Logs
DROP TABLE IF EXISTS phr_access_log CASCADE;

CREATE TABLE phr_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert PHR categories
INSERT INTO phr_categories (name, description, icon, color, display_order)
VALUES 
    ('Lab Reports', 'Blood tests, urine tests, and other laboratory reports', 'flask', '#10b981', 1),
    ('Prescriptions', 'Doctor prescriptions and medication details', 'pill', '#3b82f6', 2),
    ('Medical Imaging', 'X-rays, MRI, CT scans, ultrasound reports', 'scan', '#8b5cf6', 3),
    ('Discharge Summaries', 'Hospital discharge summaries and papers', 'file-text', '#f59e0b', 4),
    ('Insurance Documents', 'Medical insurance papers and claims', 'shield', '#06b6d4', 5),
    ('Vaccination Records', 'Vaccination history and certificates', 'syringe', '#ef4444', 6);

-- Enable RLS
ALTER TABLE phr_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE phr_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to phr categories" ON phr_categories FOR ALL USING (true);
CREATE POLICY "Admin full access to phr access log" ON phr_access_log FOR ALL USING (true);

-- ============================================================================
-- SECTION 3: FRANCHISE ENHANCEMENTS
-- ============================================================================

-- Franchise Performance Metrics
DROP TABLE IF EXISTS franchise_performance CASCADE;

CREATE TABLE franchise_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    total_members INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_commission DECIMAL(12,2) DEFAULT 0,
    new_members INTEGER DEFAULT 0,
    renewal_count INTEGER DEFAULT 0,
    cancellation_count INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(franchise_id, month)
);

-- Franchise Documents
DROP TABLE IF EXISTS franchise_documents CASCADE;

CREATE TABLE franchise_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_name TEXT,
    file_url TEXT,
    expiry_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE franchise_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to franchise performance" ON franchise_performance FOR ALL USING (true);
CREATE POLICY "Admin full access to franchise documents" ON franchise_documents FOR ALL USING (true);

-- ============================================================================
-- SECTION 4: PARTNER ENHANCEMENTS
-- ============================================================================

-- Partner Performance
DROP TABLE IF EXISTS partner_performance CASCADE;

CREATE TABLE partner_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    total_referrals INTEGER DEFAULT 0,
    successful_conversions INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    commission_earned DECIMAL(12,2) DEFAULT 0,
    commission_paid DECIMAL(12,2) DEFAULT 0,
    pending_commission DECIMAL(12,2) DEFAULT 0,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(partner_id, month)
);

-- Partner Documents
DROP TABLE IF EXISTS partner_documents CASCADE;

CREATE TABLE partner_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_name TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'pending',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner Payouts
DROP TABLE IF EXISTS partner_payouts CASCADE;

CREATE TABLE partner_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT DEFAULT 'bank_transfer',
    transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Enable RLS
ALTER TABLE partner_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to partner performance" ON partner_performance FOR ALL USING (true);
CREATE POLICY "Admin full access to partner documents" ON partner_documents FOR ALL USING (true);
CREATE POLICY "Admin full access to partner payouts" ON partner_payouts FOR ALL USING (true);

-- ============================================================================
-- SECTION 5: USER MANAGEMENT (Admin can create users)
-- ============================================================================

-- Create a function to create users with profile
CREATE OR REPLACE FUNCTION create_user_with_profile(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_role TEXT,
    p_phone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Create auth user
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
        p_email,
        crypt(p_password, gen_random_bytes(16))::text,
        NOW(),
        jsonb_build_object('role', p_role, 'provider', 'email'),
        jsonb_build_object('full_name', p_full_name, 'phone', p_phone)
    )
    RETURNING id INTO new_user_id;

    -- Create profile
    INSERT INTO profiles (id, full_name, role, phone, created_at)
    VALUES (new_user_id, p_full_name, p_role, p_phone, NOW());

    RETURN new_user_id;
END;
$$;

-- Grant execute permission (adjust as needed)
GRANT EXECUTE ON FUNCTION create_user_with_profile TO authenticated;

-- ============================================================================
-- SECTION 6: ADDITIONAL ENHANCEMENTS
-- ============================================================================

-- Add columns to existing tables if they don't exist
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS total_commission DECIMAL(12,2) DEFAULT 0;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 0;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);

-- Add emergency_contact to ecard_members if needed
ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE ecard_members ADD COLUMN IF NOT EXISTS allergies TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_to ON service_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ecard_members_user_id ON ecard_members(user_id);
CREATE INDEX IF NOT EXISTS idx_phr_documents_member_id ON phr_documents(member_id);
CREATE INDEX IF NOT EXISTS idx_call_centre_agents_status ON call_centre_agents(status);

-- ============================================================================
-- COMPLETE - All tables created successfully
-- ============================================================================

SELECT 'Database schema created successfully!' as message;
