-- HealthMitra Database Schema Fixes
-- Run this SQL in your Supabase SQL Editor if needed

-- =====================
-- WALLETS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Policy for users to access their own wallet
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
CREATE POLICY "Users can update own wallet" ON wallets
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wallet" ON wallets;
CREATE POLICY "Users can insert own wallet" ON wallets
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- =====================
-- INVOICES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID,
    invoice_number VARCHAR(50) UNIQUE,
    plan_name VARCHAR(255),
    amount DECIMAL(12,2),
    gst DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- =====================
-- PLANS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    duration_days INTEGER DEFAULT 365,
    features JSONB DEFAULT '[]',
    coverage_amount DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'active',
    is_featured BOOLEAN DEFAULT false,
    type VARCHAR(50) DEFAULT 'health',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (public read for plans)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
CREATE POLICY "Anyone can view active plans" ON plans
    FOR SELECT TO authenticated
    USING (status = 'active' OR status = 'published');

-- =====================
-- ECARD_MEMBERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS ecard_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    full_name VARCHAR(255) NOT NULL,
    relation VARCHAR(50) DEFAULT 'Self',
    status VARCHAR(20) DEFAULT 'pending',
    valid_from DATE,
    valid_till DATE,
    coverage_amount DECIMAL(12,2),
    card_unique_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ecard_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own members" ON ecard_members;
CREATE POLICY "Users can view own members" ON ecard_members
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- =====================
-- PAYMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'pending',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- =====================
-- REIMBURSEMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id UUID REFERENCES ecard_members(id),
    patient_name VARCHAR(255),
    claim_type VARCHAR(50),
    amount DECIMAL(12,2),
    approved_amount DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'pending',
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reimbursements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reimbursements" ON reimbursements;
CREATE POLICY "Users can view own reimbursements" ON reimbursements
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- =====================
-- SERVICE REQUESTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id UUID REFERENCES ecard_members(id),
    service_type VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own service requests" ON service_requests;
CREATE POLICY "Users can view own service requests" ON service_requests
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- =====================
-- PHR DOCUMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS phr_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id UUID REFERENCES ecard_members(id),
    document_type VARCHAR(100),
    document_name VARCHAR(255),
    document_url TEXT,
    document_date DATE,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE phr_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own PHR documents" ON phr_documents;
CREATE POLICY "Users can view own PHR documents" ON phr_documents
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- =====================
-- SYSTEM SETTINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exist
INSERT INTO system_settings (key, value, description) VALUES
    ('razorpay_enabled', 'false', 'Enable Razorpay payment gateway'),
    ('razorpay_key_id', '', 'Razorpay Key ID'),
    ('razorpay_key_secret', '', 'Razorpay Key Secret'),
    ('company_name', 'HealthMitra', 'Company name'),
    ('company_tagline', 'Your Trusted Healthcare Partner', 'Company tagline'),
    ('india_phone', '+91 9818823106', 'India contact number'),
    ('usa_phone', '716-579-0346', 'USA contact number'),
    ('support_email', 'support@healthmitra.com', 'Support email'),
    ('facebook_url', '', 'Facebook URL'),
    ('twitter_url', '', 'Twitter URL'),
    ('instagram_url', '', 'Instagram URL'),
    ('linkedin_url', '', 'LinkedIn URL')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS (read for all, write for admins)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings" ON system_settings;
CREATE POLICY "Anyone can read settings" ON system_settings
    FOR SELECT TO authenticated
    USING (true);

-- =====================
-- PROFILES TABLE (if missing)
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Show all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
